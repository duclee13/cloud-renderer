#!/usr/bin/env python3
"""
CLOUD VIENEU-TTS V22.1 — Tổng hợp giọng đọc tiếng Việt "Hải Đăng" trên Ubuntu GitHub Actions
- Ưu tiên tuyệt đối: VieNeu-TTS v3 Turbo ONNX CPU (int8 — không cần PyTorch/GPU, ~3x realtime)
- Chuỗi xử lý phòng thu FFmpeg đồng nhất V11.3–V22.1:
  atempo=1.10 -> highpass=f=85 -> loudnorm=I=-16:TP=-1.5:LRA=7 -> chèn 0.3s lead-in -> MP3 24kHz mono 192k
- Tối ưu Cache SHA-256 theo `ttsText`:
  Lưu tên file content-addressed `tts_<sha256>.mp3` (và tương thích ngược cả `beat_*_<sha256>.mp3`),
  giúp tái sử dụng tức thì các câu thoại không đổi khi re-render sửa đồ họa hoặc thêm/bớt beat!
- Song song hóa Stage 1 cho tập mới:
  Với các câu chưa có trong cache (>= 4 câu duy nhất), chạy song song bằng ProcessPoolExecutor(max_workers=2)
  với context `spawn` (2 luồng ONNX/worker trên 4 vCPU) để tăng tốc ~1.8–2x mà không tràn RAM.
- Đồng bộ `fps` linh hoạt (mặc định 45fps trên Cloud, hỗ trợ 30/45/60fps):
  `dur_frames = math.ceil(dur_sec * fps) + round(pause_sec * fps)`
"""

import argparse
import asyncio
from concurrent.futures import ProcessPoolExecutor
import hashlib
import json
import math
import multiprocessing
import os
import subprocess
import sys
import tempfile
import time
import wave
from pathlib import Path


LEAD_IN_SEC = 0.300
PARALLEL_MIN_MISSES = 4
PARALLEL_MAX_WORKERS = 2

# Biến giữ model cục bộ trong từng worker process (chỉ khởi tạo 1 lần/worker)
_WORKER_TTS = None


def run_ffmpeg_studio_chain(raw_audio_path: str, out_mp3_path: str, atempo: float) -> float:
    """Chạy hậu kỳ FFmpeg chuẩn phòng thu (atempo + highpass + loudnorm + 0.3s lead-in) và đo thời lượng bằng ffprobe."""
    out_dir = os.path.dirname(os.path.abspath(out_mp3_path))
    os.makedirs(out_dir, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="cloud_tts_norm_") as tmp:
        norm_mp3 = os.path.join(tmp, "norm.mp3")
        staged_mp3 = os.path.join(out_dir, f".tmp_{os.getpid()}_{os.path.basename(out_mp3_path)}")
        tempo_filter = f"atempo={atempo}," if abs(atempo - 1.0) > 0.005 else ""

        subprocess.run(
            [
                "ffmpeg", "-y", "-v", "error",
                "-i", raw_audio_path,
                "-af", f"{tempo_filter}highpass=f=85,loudnorm=I=-16:TP=-1.5:LRA=7",
                "-ar", "24000", "-ac", "1", "-b:a", "192k",
                norm_mp3,
            ],
            check=True,
        )
        subprocess.run(
            [
                "ffmpeg", "-y", "-v", "error",
                "-i", norm_mp3,
                "-filter_complex",
                f"anullsrc=r=24000:cl=mono,atrim=duration={LEAD_IN_SEC:.3f}[lead];"
                f"[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[sp];"
                f"[lead][sp]concat=n=2:v=0:a=1[outa]",
                "-map", "[outa]",
                "-ar", "24000", "-ac", "1", "-b:a", "192k",
                staged_mp3,
            ],
            check=True,
        )
        os.replace(staged_mp3, out_mp3_path)

    probe = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            out_mp3_path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(probe.stdout.strip())


def compute_beat_hash(tts_text: str, voice_name: str, atempo: float, engine_tag: str) -> str:
    payload = json.dumps(
        {"v": "v17_auto_tts", "text": tts_text, "voice": voice_name, "atempo": round(atempo, 3), "engine": engine_tag},
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]


def probe_mp3_duration(mp3_path: Path) -> float:
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(mp3_path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(probe.stdout.strip())


def find_existing_cached_mp3(cache_dir: Path, bhash: str, canonical_path: Path) -> Path | None:
    if canonical_path.exists() and canonical_path.stat().st_size > 1000:
        return canonical_path
    for candidate in cache_dir.glob(f"*_{bhash}.mp3"):
        if candidate.is_file() and candidate.stat().st_size > 1000:
            return candidate
    return None


def load_vieneu_engine(precision_override: str | None = None):
    """Khởi tạo VieNeu-TTS v3 Turbo ONNX CPU (int8 ưu tiên tốc độ, fallback fp32)."""
    from vieneu import Vieneu  # type: ignore

    precision = precision_override or os.environ.get("VIENEU_PRECISION", "int8")
    pid_tag = f"pid={os.getpid()}"
    print(f"-> [CloudTTS][{pid_tag}] Đang nạp VieNeu-TTS v3 Turbo (backend=onnx, device=cpu, precision={precision})...", flush=True)
    t0 = time.perf_counter()
    try:
        tts = Vieneu(mode="v3turbo", backend="onnx", device="cpu", precision=precision)
    except Exception as e:
        print(f"  ! [{pid_tag}] Precision '{precision}' không khả dụng ({e}), thử lại với fp32...", flush=True)
        tts = Vieneu(mode="v3turbo", backend="onnx", device="cpu", precision="fp32")
    # Warm-up 1 câu ngắn
    for _ in tts.infer_stream("Xin chào.", apply_watermark=False):
        pass
    print(f"✅ [CloudTTS][{pid_tag}] VieNeu-TTS ONNX sẵn sàng sau {time.perf_counter() - t0:.1f}s!", flush=True)
    return tts


def synthesize_vieneu_wav(tts, text: str, voice_name: str, out_wav_path: str) -> None:
    import numpy as np

    chunks = []
    for chunk in tts.infer_stream(text, voice=voice_name, apply_watermark=False):
        if chunk is not None and len(chunk) > 0:
            chunks.append(np.asarray(chunk, dtype=np.float32))
    if not chunks:
        raise RuntimeError(f"VieNeu-TTS không trả về mẫu âm thanh nào cho: {text[:60]}")
    audio = np.concatenate(chunks)
    pcm16 = (audio * 32767.0).clip(-32768, 32767).astype("<i2").tobytes()
    with wave.open(out_wav_path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(48000)
        wf.writeframes(pcm16)


def _init_vieneu_worker(precision: str) -> None:
    """Initializer cho mỗi worker trong ProcessPoolExecutor(max_workers=2): giới hạn 2 luồng ONNX/worker khớp 4 vCPU."""
    global _WORKER_TTS
    os.environ["OMP_NUM_THREADS"] = "2"
    os.environ["ORT_NUM_THREADS"] = "2"
    os.environ["OPENBLAS_NUM_THREADS"] = "2"
    os.environ["MKL_NUM_THREADS"] = "2"
    _WORKER_TTS = load_vieneu_engine(precision)


def _synthesize_vieneu_worker_task(task: tuple[str, str, str, float, str, int]) -> tuple[str, float, str]:
    """Chạy trong worker process: tổng hợp 1 câu thoại duy nhất -> FFmpeg studio chain -> trả về (bhash, dur_sec, tag)."""
    global _WORKER_TTS
    bhash, tts_text, voice_name, atempo, mp3_path_str, beat_no = task
    if _WORKER_TTS is None:
        _WORKER_TTS = load_vieneu_engine()

    with tempfile.TemporaryDirectory(prefix=f"cloud_tts_w{beat_no:03d}_") as tmp_dir:
        raw_wav = os.path.join(tmp_dir, f"b{beat_no:03d}.wav")
        try:
            synthesize_vieneu_wav(_WORKER_TTS, tts_text, voice_name, raw_wav)
            dur_sec = run_ffmpeg_studio_chain(raw_wav, mp3_path_str, atempo)
            return (bhash, dur_sec, "VIENEU_P2")
        except Exception as beat_err:
            print(f"  ! [Worker pid={os.getpid()}] VieNeu lỗi tại beat #{beat_no}: {beat_err}. Thử lại 1 lần...", flush=True)
            synthesize_vieneu_wav(_WORKER_TTS, tts_text, voice_name, raw_wav)
            dur_sec = run_ffmpeg_studio_chain(raw_wav, mp3_path_str, atempo)
            return (bhash, dur_sec, "VIENEU_P2_RETRY")


async def _edge_tts_save(text: str, voice: str, out_mp3: str) -> None:
    import edge_tts  # type: ignore

    communicate = edge_tts.Communicate(text=text, voice=voice, rate="+5%")
    await communicate.save(out_mp3)


def synthesize_edge_fallback(text: str, out_raw_mp3: str, voice: str = "vi-VN-NamMinhNeural") -> None:
    asyncio.run(_edge_tts_save(text, voice, out_raw_mp3))


def run_batch_synthesis(episode_path: Path, cache_dir: Path, voice_name: str, atempo: float, fps: int) -> None:
    safe_fps = max(15, min(120, int(fps)))
    cache_dir.mkdir(parents=True, exist_ok=True)
    episode = json.loads(episode_path.read_text(encoding="utf-8"))
    beats = episode.get("beats") or []
    if not beats:
        raise RuntimeError(f"Không tìm thấy mảng beats[] trong {episode_path}")

    engine_name = "VIENEU_LOCAL"
    effective_voice = voice_name
    if os.environ.get("FORCE_EDGE_TTS") == "1":
        engine_name = "EDGE_TTS"
        effective_voice = "vi-VN-NamMinhNeural"

    t_start = time.perf_counter()

    # Bước 1: Quét toàn bộ beats để tách câu đã có trong SHA-256 cache vs câu cần tổng hợp mới (chống trùng bhash)
    beat_records: list[dict] = []
    unique_pending_by_hash: dict[str, tuple[str, str, str, float, str, int]] = {}
    resolved_by_hash: dict[str, tuple[float, str]] = {}
    cache_hits = 0

    for idx, beat in enumerate(beats):
        text_sub = str(beat.get("text") or beat.get("narrationText") or "").strip()
        tts_text = str(beat.get("ttsText") or text_sub).strip()
        pause_sec = float(beat.get("pauseAfterSec", 0.4))
        bhash = compute_beat_hash(tts_text, effective_voice, atempo, engine_name)
        mp3_name = f"tts_{bhash}.mp3"
        mp3_path = cache_dir / mp3_name

        if bhash not in resolved_by_hash and bhash not in unique_pending_by_hash:
            existing = find_existing_cached_mp3(cache_dir, bhash, mp3_path)
            cached_dur = None
            if existing is not None:
                try:
                    cached_dur = probe_mp3_duration(existing)
                    if existing != mp3_path:
                        mp3_path.write_bytes(existing.read_bytes())
                except Exception:
                    cached_dur = None

            if cached_dur is not None and cached_dur > 0.1:
                resolved_by_hash[bhash] = (cached_dur, "CACHE")
            else:
                unique_pending_by_hash[bhash] = (bhash, tts_text, effective_voice, atempo, str(mp3_path), idx + 1)

        if bhash in resolved_by_hash:
            cache_hits += 1

        beat_records.append(
            {
                "idx": idx,
                "text_sub": text_sub,
                "tts_text": tts_text,
                "pause_sec": pause_sec,
                "bhash": bhash,
                "mp3_name": mp3_name,
                "mp3_path": mp3_path,
            }
        )

    pending_tasks = list(unique_pending_by_hash.values())

    # Bước 2: Tổng hợp các câu chưa có trong cache
    if not pending_tasks:
        print(
            f"⚡ [CloudTTS] 100% ({len(beats)}/{len(beats)}) câu thoại đã có sẵn trong cache SHA-256 -> Bỏ qua nạp model ONNX!",
            flush=True,
        )
    elif engine_name == "VIENEU_LOCAL":
        precision = os.environ.get("VIENEU_PRECISION", "int8")
        use_parallel = len(pending_tasks) >= PARALLEL_MIN_MISSES

        if use_parallel:
            print(
                f"🚀 [CloudTTS] Phát hiện {len(pending_tasks)} câu chưa có cache (>= {PARALLEL_MIN_MISSES}) -> "
                f"Bật tổng hợp song song ProcessPoolExecutor(max_workers={PARALLEL_MAX_WORKERS}) trên 4 vCPU!",
                flush=True,
            )
            try:
                mp_ctx = multiprocessing.get_context("spawn")
                with ProcessPoolExecutor(
                    max_workers=PARALLEL_MAX_WORKERS,
                    mp_context=mp_ctx,
                    initializer=_init_vieneu_worker,
                    initargs=(precision,),
                ) as executor:
                    for bhash, dur_sec, tag in executor.map(_synthesize_vieneu_worker_task, pending_tasks):
                        resolved_by_hash[bhash] = (dur_sec, tag)
            except Exception as parallel_err:
                print(
                    f"⚠️ [CloudTTS] Tổng hợp song song gặp lỗi ({parallel_err}). Chuyển kiểm tra fallback an toàn...",
                    flush=True,
                )
                # Tiếp tục tổng hợp các câu còn thiếu theo luồng tuần tự (hoặc Edge-TTS fallback nếu VieNeu không nạp được)
                remaining_tasks = [t for t in pending_tasks if t[0] not in resolved_by_hash]
                vieneu_tts = None
                try:
                    vieneu_tts = load_vieneu_engine(precision)
                except Exception as seq_err:
                    print(
                        f"⚠️ [CloudTTS] Không thể nạp VieNeu-TTS ({seq_err}). Chuyển đồng nhất cả tập sang Edge-TTS (vi-VN-NamMinhNeural)!",
                        flush=True,
                    )
                    engine_name = "EDGE_TTS"
                    effective_voice = "vi-VN-NamMinhNeural"
                    resolved_by_hash.clear()
                    cache_hits = 0

                if engine_name == "VIENEU_LOCAL" and vieneu_tts is not None:
                    with tempfile.TemporaryDirectory(prefix="cloud_tts_seq_fb_") as raw_tmp:
                        for bhash, tts_text, v_name, tempo_val, mp3_path_str, beat_no in remaining_tasks:
                            raw_wav = os.path.join(raw_tmp, f"b{beat_no:03d}.wav")
                            synthesize_vieneu_wav(vieneu_tts, tts_text, v_name, raw_wav)
                            dur_sec = run_ffmpeg_studio_chain(raw_wav, mp3_path_str, tempo_val)
                            resolved_by_hash[bhash] = (dur_sec, "VIENEU")
        else:
            # 1..3 câu thiếu: chạy 1 process duy nhất để không tốn thời gian nạp model 2 lần
            vieneu_tts = None
            try:
                vieneu_tts = load_vieneu_engine(precision)
            except Exception as err:
                print(
                    f"⚠️ [CloudTTS] Không thể nạp VieNeu-TTS ({err}). Chuyển đồng nhất cả tập sang Edge-TTS (vi-VN-NamMinhNeural)!",
                    flush=True,
                )
                engine_name = "EDGE_TTS"
                effective_voice = "vi-VN-NamMinhNeural"
                resolved_by_hash.clear()
                cache_hits = 0

            if engine_name == "VIENEU_LOCAL" and vieneu_tts is not None:
                with tempfile.TemporaryDirectory(prefix="cloud_tts_raw_") as raw_tmp:
                    for bhash, tts_text, v_name, tempo_val, mp3_path_str, beat_no in pending_tasks:
                        raw_wav = os.path.join(raw_tmp, f"b{beat_no:03d}.wav")
                        try:
                            synthesize_vieneu_wav(vieneu_tts, tts_text, v_name, raw_wav)
                            dur_sec = run_ffmpeg_studio_chain(raw_wav, mp3_path_str, tempo_val)
                            tag = "VIENEU"
                        except Exception as beat_err:
                            print(f"  ! VieNeu lỗi tại beat #{beat_no}: {beat_err}. Thử lại 1 lần...", flush=True)
                            synthesize_vieneu_wav(vieneu_tts, tts_text, v_name, raw_wav)
                            dur_sec = run_ffmpeg_studio_chain(raw_wav, mp3_path_str, tempo_val)
                            tag = "VIENEU_RETRY"
                        resolved_by_hash[bhash] = (dur_sec, tag)

    # Nhánh Edge-TTS fallback (khi FORCE_EDGE_TTS=1 hoặc VieNeu không khả dụng)
    if engine_name == "EDGE_TTS":
        with tempfile.TemporaryDirectory(prefix="cloud_tts_edge_") as raw_tmp:
            for rec in beat_records:
                bhash = compute_beat_hash(rec["tts_text"], effective_voice, atempo, engine_name)
                mp3_name = f"tts_{bhash}.mp3"
                mp3_path = cache_dir / mp3_name
                rec["bhash"] = bhash
                rec["mp3_name"] = mp3_name
                rec["mp3_path"] = mp3_path

                if bhash in resolved_by_hash:
                    if resolved_by_hash[bhash][1] == "CACHE":
                        cache_hits += 1
                    continue

                existing = find_existing_cached_mp3(cache_dir, bhash, mp3_path)
                cached_dur = None
                if existing is not None:
                    try:
                        cached_dur = probe_mp3_duration(existing)
                        if existing != mp3_path:
                            mp3_path.write_bytes(existing.read_bytes())
                    except Exception:
                        cached_dur = None

                if cached_dur is not None and cached_dur > 0.1:
                    resolved_by_hash[bhash] = (cached_dur, "CACHE")
                    cache_hits += 1
                else:
                    raw_edge = os.path.join(raw_tmp, f"b{rec['idx'] + 1:03d}_edge.mp3")
                    synthesize_edge_fallback(rec["tts_text"], raw_edge, effective_voice)
                    dur_sec = run_ffmpeg_studio_chain(raw_edge, str(mp3_path), 1.0)
                    resolved_by_hash[bhash] = (dur_sec, "EDGE_FALLBACK")

    # Bước 3: Ghi lại episode_audio_index.json & manifest.json đúng thứ tự beat 0..N-1
    index_entries = {}
    manifest_beats = []
    total_frames = 0

    for rec in beat_records:
        idx = rec["idx"]
        bhash = rec["bhash"]
        dur_sec, tag = resolved_by_hash[bhash]
        pause_sec = rec["pause_sec"]
        dur_frames = math.ceil(dur_sec * safe_fps) + round(pause_sec * safe_fps)
        total_frames += dur_frames

        index_entries[str(idx)] = {
            "globalBeatIndex": idx + 1,
            "file": rec["mp3_name"],
            "voiceName": effective_voice,
            "engine": engine_name,
            "fps": safe_fps,
            "actualDurationSec": round(dur_sec, 3),
            "pauseAfterSec": pause_sec,
            "totalDurationFrames": dur_frames,
            "text": rec["text_sub"],
            "ttsText": rec["tts_text"],
        }
        manifest_beats.append(index_entries[str(idx)])
        print(
            f"  -> [Beat {idx + 1:02d}/{len(beats)} | {tag} | {safe_fps}fps] {dur_sec:.3f}s (+{pause_sec}s) -> {dur_frames}f | {rec['mp3_name']}",
            flush=True,
        )

    audio_index = {
        "version": "v22.1",
        "episodeSlug": episode.get("slug", "auto_episode"),
        "engine": engine_name,
        "voiceName": effective_voice,
        "atempo": atempo,
        "fps": safe_fps,
        "totalBeats": len(beats),
        "totalFrames": total_frames,
        "totalDurationSec": round(total_frames / float(safe_fps), 3),
        "beatsByIndex": index_entries,
    }
    (cache_dir / "episode_audio_index.json").write_text(
        json.dumps(audio_index, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (cache_dir / "manifest.json").write_text(
        json.dumps({**audio_index, "beats": manifest_beats}, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    elapsed = time.perf_counter() - t_start
    print(
        f"✅ [CloudTTS] Hoàn tất {len(beats)}/{len(beats)} beats ({engine_name} - {effective_voice}, cacheHits={cache_hits}, fps={safe_fps}) "
        f"| Tổng thời lượng: {total_frames / float(safe_fps):.1f}s ({total_frames}f) | Thời gian chạy: {elapsed:.1f}s",
        flush=True,
    )


def run_http_server(host: str, port: int, default_voice: str) -> None:
    """Chế độ tùy chọn --serve: bật HTTP server OpenAI-compatible 127.0.0.1:8000/v1/audio/speech."""
    from http.server import BaseHTTPRequestHandler, HTTPServer

    tts = load_vieneu_engine()

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/health":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"status":"ok","engine":"vieneu-onnx"}')
                return
            self.send_response(404)
            self.end_headers()

        def do_POST(self):
            if self.path != "/v1/audio/speech":
                self.send_response(404)
                self.end_headers()
                return
            length = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(length).decode("utf-8"))
            text = str(body.get("input") or "").strip()
            voice = str(body.get("voice") or default_voice).strip()
            with tempfile.TemporaryDirectory(prefix="vieneu_srv_") as tmp:
                wav_path = os.path.join(tmp, "out.wav")
                synthesize_vieneu_wav(tts, text, voice, wav_path)
                wav_bytes = Path(wav_path).read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(wav_bytes)))
            self.end_headers()
            self.wfile.write(wav_bytes)

        def log_message(self, fmt, *args):
            return

    print(f"🚀 [CloudTTS Server] Đang lắng nghe tại http://{host}:{port}/v1/audio/speech (voice={default_voice})", flush=True)
    HTTPServer((host, port), Handler).serve_forever()


def main() -> None:
    parser = argparse.ArgumentParser(description="Cloud VieNeu-TTS V22.1 (Ubuntu GitHub Actions)")
    parser.add_argument("--episode", type=str, default="episodes/current_episode.json")
    parser.add_argument("--cache-dir", type=str, default="../.tts-cache/auto_episode")
    parser.add_argument("--voice", type=str, default=os.environ.get("VIENEU_TTS_VOICE", "Hải Đăng"))
    parser.add_argument("--atempo", type=float, default=float(os.environ.get("VIENEU_TTS_ATEMPO", "1.10")))
    parser.add_argument("--fps", type=int, default=int(os.environ.get("REMOTION_FPS") or os.environ.get("FPS") or "45"))
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--host", type=str, default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    if args.serve:
        run_http_server(args.host, args.port, args.voice)
        return

    episode_path = Path(args.episode).resolve()
    cache_dir = Path(args.cache_dir).resolve()
    if not episode_path.exists():
        print(f"Lỗi: Không tìm thấy file kịch bản JSON: {episode_path}", file=sys.stderr)
        sys.exit(1)

    run_batch_synthesis(episode_path, cache_dir, args.voice, args.atempo, args.fps)


if __name__ == "__main__":
    main()
