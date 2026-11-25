/**
 * RENDER FROM EPISODE JSON V21.2 — Bộ Kết Xuất Phim Từ Kịch Bản JSON Phổ Quát (Mặc định 1080p @ 45fps Cloud-Accelerated)
 * Hỗ trợ đầy đủ các chế độ CLI (tương thích ngược 100% với local test):
 *   --episode=episodes/current_episode.json (mặc định)
 *   --quality=1080p                         : chất lượng đầu ra linh hoạt (720p | 1080p | 1440p | 4k — giữ nguyên hệ tọa độ gốc 1920x1080 qua `--scale`)
 *   --fps=45                                : tốc độ khung hình linh hoạt (30 | 45 | 60; mặc định 45 trên Cloud, 60 trên Local)
 *   --prepare-cloud                         : [Stage 1] Tính timeline toàn tập @ fps, căn mẫu chính xác 44.1kHz (0.000s trôi qua 64+ beats),
 *                                             trộn Master Audio 1 lần, ghi cloud_input_props.json + cloud_render_plan.json cân bằng frame cho N VM
 *   --render-frame-chunk                    : [Stage 2] Gọi trực tiếp `remotion render ./build V7MovieComposition ... --frames=start-end --scale=...`
 *                                             trên bundle dựng sẵn với `--concurrency=4 (<= os.cpus().length) --crf=20 --x264-preset=superfast --jpeg-quality=88 --gl=swangle --muted`
 *                                             kèm gửi telemetry thời gian thực về `DASHBOARD_PROGRESS_URL`
 *   --concat-only                           : [Stage 3] Ghép nối không re-encode (`-f concat -safe 0 -i list.txt -c copy -movflags +faststart`)
 *   --preview-only                          : xuất nhanh 4 ảnh đại diện 4 Hồi (out/preview_act1.jpg..preview_act4.jpg)
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import {
  HYBRID_GPU_CHROMIUM_OPTIONS,
  isLinuxOrCiEnvironment,
  detectBestHardwareEncoder,
  selectCompositionWithCheckpoints,
  renderVideoHybridCpuGpu,
  resolveSafeRenderConcurrency,
} from '../src/lib/v7/hybridGpuRenderConfig.ts';
import {
  synthesizeVieneuLocalTtsBeat,
  DEFAULT_VIENEU_TTS_URL,
  DEFAULT_VIENEU_TTS_VOICE,
} from '../src/lib/v7/geminiTtsClient.ts';
import {
  mixMasterAudioWithSoundDesign,
  SOUND_DESIGN_CACHE_DIR,
} from '../src/lib/v7/soundDesignEngine.ts';
import {
  parseChapterRenderCliArgs,
  splitBeatsIntoChapters,
  renderLongMovieByChapters,
  resolveBeatSubtitleText,
  resolveBeatTtsText,
  measureMediaDurationFfprobe,
  computeBeatDurationFrames,
  computeBalancedFrameChunks,
  getChapterChunkFilePath,
  DEFAULT_V16_TRANSITION_IN,
  DEFAULT_V16_TRANSITION_FRAMES,
} from '../src/lib/v7/chapterChunkedRenderer.ts';
import { sanitizeAndValidateEpisode } from '../src/lib/v7/episodeJsonSchema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webStudioRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(__dirname, '../..');
const localArtifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const hasLocalArtifactDir = fs.existsSync(localArtifactDir);

function resolveEffectiveFps(explicitFps) {
  const parsed = Math.round(Number(explicitFps));
  if (Number.isFinite(parsed) && parsed >= 15 && parsed <= 120) {
    return parsed;
  }
  const envRaw = process.env.REMOTION_FPS || process.env.FPS || '';
  const envParsed = Math.round(Number(envRaw));
  if (Number.isFinite(envParsed) && envParsed >= 15 && envParsed <= 120) {
    return envParsed;
  }
  // Mặc định 45fps trên Cloud/CI, giữ fallback 60fps trên Local nếu không truyền --fps
  return isLinuxOrCiEnvironment() ? 45 : 60;
}

/**
 * Ánh xạ `quality` sang hệ số `--scale` chính xác tuyệt đối theo IEEE-754 trên nền gốc 1920x1080:
 * - '720p'  -> scale = 2/3 (0.6666666666666666) -> 1920 * scale === 1280, 1080 * scale === 720 (chẵn % 2 === 0!)
 * - '1080p' -> scale = 1                        -> 1920x1080 (mặc định)
 * - '1440p' -> scale = 4/3 (1.3333333333333333) -> 1920 * scale === 2560, 1080 * scale === 1440 (chẵn % 2 === 0!)
 * - '4k'    -> scale = 2                        -> 3840x2160 (chẵn % 2 === 0!)
 * Giữ nguyên 100% hệ tọa độ thiết kế 1920x1080 trong Root.tsx để mọi SVG/phụ đề/bong bóng sắc nét tuyệt đối.
 */
export function resolveQualityPreset(rawQuality) {
  const norm = String(rawQuality || process.env.RENDER_QUALITY || '1080p')
    .trim()
    .toLowerCase();
  if (norm === '720p' || norm === '720') {
    return { quality: '720p', scale: 2 / 3, width: 1280, height: 720 };
  }
  if (norm === '1440p' || norm === '2k' || norm === '1440') {
    return { quality: '1440p', scale: 4 / 3, width: 2560, height: 1440 };
  }
  if (norm === '4k' || norm === '2160p' || norm === '2160') {
    return { quality: '4k', scale: 2, width: 3840, height: 2160 };
  }
  return { quality: '1080p', scale: 1, width: 1920, height: 1080 };
}

function parseEpisodeArgs(argv) {
  let episodePath = 'episodes/current_episode.json';
  let cacheDirOverride = null;
  let bundleDirOverride = null;
  let fpsArg = null;
  let qualityArg = null;
  const isPreviewOnly = argv.includes('--preview-only');
  const isPrepareCloud = argv.includes('--prepare-cloud');
  const isRenderFrameChunk = argv.includes('--render-frame-chunk');

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--episode=')) episodePath = a.slice('--episode='.length).trim();
    else if (a === '--episode' && argv[i + 1]) episodePath = argv[++i].trim();
    else if (a.startsWith('--cache-dir=')) cacheDirOverride = a.slice('--cache-dir='.length).trim();
    else if (a === '--cache-dir' && argv[i + 1]) cacheDirOverride = argv[++i].trim();
    else if (a.startsWith('--bundle-dir=')) bundleDirOverride = a.slice('--bundle-dir='.length).trim();
    else if (a === '--bundle-dir' && argv[i + 1]) bundleDirOverride = argv[++i].trim();
    else if (a.startsWith('--fps=')) fpsArg = parseInt(a.slice('--fps='.length).trim(), 10);
    else if (a === '--fps' && argv[i + 1]) fpsArg = parseInt(argv[++i].trim(), 10);
    else if (a.startsWith('--quality=')) qualityArg = a.slice('--quality='.length).trim();
    else if (a === '--quality' && argv[i + 1]) qualityArg = argv[++i].trim();
  }

  const resolvedEpisode = path.isAbsolute(episodePath)
    ? episodePath
    : fs.existsSync(path.resolve(process.cwd(), episodePath))
      ? path.resolve(process.cwd(), episodePath)
      : path.resolve(webStudioRoot, episodePath);

  return {
    resolvedEpisode,
    cacheDirOverride,
    bundleDirOverride,
    fpsArg,
    qualityArg,
    isPreviewOnly,
    isPrepareCloud,
    isRenderFrameChunk,
  };
}

/**
 * Hook báo tiến độ an toàn tuyệt đối lên Cloud Render Dashboard Mức 2 (`/api/vm-progress`).
 * - Giữ nguyên 100% cấu trúc JSON payload mà `cloud-dashboard/` đang đọc từ Upstash Redis.
 */
function createSafeVmProgressReporter({ vmIndex, totalVms }) {
  const rawUrl = (process.env.DASHBOARD_PROGRESS_URL || '').trim();
  const secret = (process.env.DASHBOARD_PROGRESS_SECRET || '').trim();
  const runId = (process.env.GITHUB_RUN_ID || '').trim();

  if (!rawUrl || !runId) {
    return {
      report: async () => {},
    };
  }

  const cleanBase = rawUrl.replace(/\/+$/, '');
  const endpoint = cleanBase.endsWith('/api/vm-progress')
    ? cleanBase
    : `${cleanBase}/api/vm-progress`;

  const renderStartMs = Date.now();
  let lastSentAtMs = 0;

  async function report({
    phase = 'rendering',
    renderedFrames = 0,
    totalFrames = 0,
    rawPercent,
    force = false,
  }) {
    try {
      const now = Date.now();
      if (!force && now - lastSentAtMs < 4000) {
        return;
      }
      lastSentAtMs = now;

      const safeTotal = Math.max(0, Math.round(Number(totalFrames) || 0));
      const safeRendered = Math.max(
        0,
        Math.min(safeTotal > 0 ? safeTotal : 1_000_000, Math.round(Number(renderedFrames) || 0))
      );
      const elapsedSec = Math.max(0.25, (now - renderStartMs) / 1000);
      const fps = safeRendered > 0 ? Number((safeRendered / elapsedSec).toFixed(1)) : 0;

      let pct = 0;
      if (phase === 'completed') {
        pct = 100;
      } else if (safeTotal > 0 && safeRendered > 0) {
        pct = Math.min(99.5, (safeRendered / safeTotal) * 100);
      } else if (typeof rawPercent === 'number' && Number.isFinite(rawPercent)) {
        pct = Math.max(0, Math.min(99.5, rawPercent));
      }
      const percent = Number(pct.toFixed(1));
      const remainingFrames = Math.max(0, safeTotal - safeRendered);
      const etaSec =
        phase === 'completed'
          ? 0
          : fps > 0.05 && remainingFrames > 0
            ? Math.max(0, Math.round(remainingFrames / fps))
            : 0;

      const headers = { 'Content-Type': 'application/json' };
      if (secret) {
        headers['x-progress-secret'] = secret;
      }

      await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          runId,
          vmIndex,
          totalVms,
          phase,
          renderedFrames: phase === 'completed' && safeTotal > 0 ? safeTotal : safeRendered,
          totalFrames: safeTotal,
          percent,
          fps,
          etaSec,
          updatedAt: new Date(now).toISOString(),
        }),
        signal: AbortSignal.timeout(2000),
      });
    } catch {
      // Nuốt 100% lỗi mạng / timeout / HTTP để bảo vệ tuyệt đối pipeline render
    }
  }

  return { report };
}

/**
 * Chế độ --preview-only: xuất nhanh 4 ảnh đại diện trải đều 4 Hồi.
 */
async function renderFourActPreviewStills(episode, scriptBeats, fps, bundleDirOverride) {
  const remotionRendererMod = await import('@remotion/renderer');

  const durPerBeat = Math.max(60, Math.round(5 * fps));
  const previewBeats = [];
  let cursor = 0;
  for (let i = 0; i < scriptBeats.length; i++) {
    previewBeats.push({
      ...scriptBeats[i],
      startFrame: cursor,
      durationFrames: durPerBeat,
      audioUrl: undefined,
      showDebugHud: false,
    });
    cursor += durPerBeat;
  }

  const total = previewBeats.length;
  const pickIndices =
    total <= 4
      ? Array.from({ length: total }, (_, i) => i)
      : [
          Math.min(total - 1, Math.floor(total * 0.08)),
          Math.min(total - 1, Math.floor(total * 0.34)),
          Math.min(total - 1, Math.floor(total * 0.62)),
          Math.min(total - 1, Math.floor(total * 0.88)),
        ];

  const isCi = isLinuxOrCiEnvironment();
  const prebuiltCandidate = bundleDirOverride
    ? path.resolve(process.cwd(), bundleDirOverride)
    : path.join(webStudioRoot, 'build');

  let bundleLocation;
  if (fs.existsSync(path.join(prebuiltCandidate, 'index.html'))) {
    bundleLocation = prebuiltCandidate;
    console.log(`\n-> [--preview-only] Sử dụng bản pre-bundle sẵn tại: ${bundleLocation}`);
  } else {
    const remotionBundlerMod = await import('@remotion/bundler');
    const entryPoint = path.join(webStudioRoot, 'src', 'remotion', 'index.ts');
    console.log(`\n-> [--preview-only] Bundling Remotion UniversalAutoStage (${isCi ? 'Linux/CI SwANGLE' : 'Local ANGLE'})...`);
    bundleLocation = await remotionBundlerMod.bundle({
      entryPoint,
      onProgress: (p) => {
        if (p === 100 || p % 50 === 0) console.log(`  Bundling: ${p}%`);
      },
    });
  }

  const browserInstance = isCi
    ? undefined
    : await remotionRendererMod.openBrowser('chrome', { chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS });

  try {
    const payload = {
      title: episode.title,
      totalDurationFrames: cursor,
      fps,
      beats: previewBeats,
      showDebugHud: false,
    };
    const composition = await selectCompositionWithCheckpoints({
      selectComposition: remotionRendererMod.selectComposition,
      serveUrl: bundleLocation,
      id: 'V7MovieComposition',
      puppeteerInstance: browserInstance,
      inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
      chunkLabel: 'Preview-4-Acts',
    });

    const outDir = path.join(workspaceRoot, 'out');
    fs.mkdirSync(outDir, { recursive: true });

    for (let k = 0; k < pickIndices.length; k++) {
      const beatIdx = pickIndices[k];
      const b = previewBeats[beatIdx];
      const targetFrame = b.startFrame + Math.floor(b.durationFrames * 0.56);
      const fileName = `preview_act${k + 1}_${episode.slug}.jpg`;
      const outPath = path.join(outDir, fileName);
      const canonicalOut = path.join(outDir, `preview_act${k + 1}.jpg`);

      console.log(
        `  [Preview ${k + 1}/${pickIndices.length}] Beat #${beatIdx + 1} (${b.autoStageSpec.stageType} | ${b.autoStageSpec.timeOfDay}) Frame ${targetFrame} -> ${fileName}`
      );
      await remotionRendererMod.renderStill({
        composition,
        serveUrl: bundleLocation,
        output: outPath,
        frame: targetFrame,
        imageFormat: 'jpeg',
        jpegQuality: 92,
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
        puppeteerInstance: browserInstance,
        inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
      });
      fs.copyFileSync(outPath, canonicalOut);
      if (hasLocalArtifactDir) {
        fs.copyFileSync(outPath, path.join(localArtifactDir, fileName));
      }
    }
    console.log(`✅ [--preview-only] Hoàn tất ${pickIndices.length} ảnh xem trước trong ${outDir}!`);
  } finally {
    if (browserInstance) {
      try {
        await browserInstance.close({ silent: true });
      } catch {}
    }
  }
}

/**
 * [STAGE 1 — --prepare-cloud]:
 * - Đọc toàn bộ file MP3 từ VieNeu-TTS cache, tính `durationFrames = Math.ceil(actualDurationSec * fps) + Math.round(pauseAfterSec * fps)`.
 * - Căn mẫu chính xác tuyệt đối ở 44.100 Hz (`44100 / 45 = 980` mẫu/frame nguyên chẵn, telescoping sum = 0 mẫu trôi qua mọi số lượng beat!).
 * - Trộn 1 lần duy nhất Master Audio toàn tập (`Voice + BGM 3 hồi + 6 SFX`) rồi xuất `out/cloud_plan/master_episode_audio.m4a`.
 * - Ghi `web-studio/episodes/cloud_input_props.json` (~40KB) + `out/cloud_plan/cloud_render_plan.json` (kèm `quality`, `scale`, `fps`, 20 dải frame cân bằng).
 */
async function prepareCloudEpisodePlan({
  episode,
  scriptBeats,
  fps,
  qualitySpec,
  totalChapters,
  synthesizeBeatAudio,
}) {
  const planDir = path.join(workspaceRoot, 'out', 'cloud_plan');
  fs.mkdirSync(planDir, { recursive: true });
  const workTmp = fs.mkdtempSync(path.join(os.tmpdir(), `cloud_prep_${episode.slug}_`));
  const AUDIO_SR = 44100;

  try {
    const paddedWavFiles = [];
    const compiledBeats = [];
    let cursorFrame = 0;

    console.log(
      `\n-> [--prepare-cloud] Đang tính timeline ${qualitySpec.quality} (${qualitySpec.width}x${qualitySpec.height}) @ ${fps}fps & chuẩn bị Master Audio mẫu-chính-xác 44.1kHz (${scriptBeats.length} beats)...`
    );

    for (let i = 0; i < scriptBeats.length; i++) {
      const rawBeat = scriptBeats[i];
      const subtitleText = resolveBeatSubtitleText(rawBeat);
      const beatForTts = {
        ...rawBeat,
        narrationText: subtitleText,
        ttsText: rawBeat.ttsText || undefined,
      };
      const ttsRes = await synthesizeBeatAudio(beatForTts, i);
      const durationFrames = computeBeatDurationFrames(rawBeat, ttsRes, fps);

      // Hiệu tổng lồng nhau (telescoping sum) trên trục sample 44.1kHz:
      // Tổng sample của tất cả N beats = endSample(N-1) - 0 = Math.round((totalFrames * 44100) / fps) -> 0.000000s trôi!
      const startSample = Math.round((cursorFrame * AUDIO_SR) / fps);
      const endSample = Math.round(((cursorFrame + durationFrames) * AUDIO_SR) / fps);
      const exactBeatSamples = Math.max(1, endSample - startSample);

      const mp3Tmp = path.join(workTmp, `b${String(i + 1).padStart(3, '0')}.mp3`);
      const wavPadded = path.join(workTmp, `b${String(i + 1).padStart(3, '0')}_pad.wav`);
      fs.writeFileSync(mp3Tmp, ttsRes.mp3Buffer);

      execSync(
        `ffmpeg -y -v error -i "${mp3Tmp.replace(/\\/g, '/')}" ` +
          `-filter_complex "[0:a]aresample=${AUDIO_SR},aformat=sample_fmts=fltp:channel_layouts=mono[a0];` +
          `anullsrc=r=${AUDIO_SR}:cl=mono,atrim=end_sample=${exactBeatSamples}[sil];` +
          `[a0][sil]concat=n=2:v=0:a=1,atrim=end_sample=${exactBeatSamples}[outa]" ` +
          `-map "[outa]" -ar ${AUDIO_SR} -ac 1 -c:a pcm_s16le "${wavPadded.replace(/\\/g, '/')}"`
      );
      paddedWavFiles.push(wavPadded);

      const resolvedTransitionIn = rawBeat.transitionIn ?? DEFAULT_V16_TRANSITION_IN;
      const rawTransFrames =
        typeof rawBeat.transitionFrames === 'number' && Number.isFinite(rawBeat.transitionFrames)
          ? Math.max(0, rawBeat.transitionFrames)
          : DEFAULT_V16_TRANSITION_FRAMES;
      const resolvedTransitionFrames = Math.max(0, Math.round(rawTransFrames * (fps / 60)));

      compiledBeats.push({
        ...rawBeat,
        narrationText: subtitleText,
        type: rawBeat.action || rawBeat.type,
        theme: rawBeat.stageTheme || rawBeat.theme,
        transitionIn: resolvedTransitionIn,
        transitionFrames: resolvedTransitionFrames,
        startFrame: cursorFrame,
        durationFrames,
        audioUrl: undefined,
        audioDurationMs: ttsRes.totalDurationMs,
        showDebugHud: false,
      });

      cursorFrame += durationFrames;
    }

    const totalFrames = cursorFrame;
    const totalExactSamples = Math.round((totalFrames * AUDIO_SR) / fps);
    const totalDurationSec = Number((totalFrames / fps).toFixed(6));

    // Ghép lossless các WAV 44.1kHz PCM 16-bit -> trộn BGM 3 hồi + 6 SFX -> xuất AAC M4A 192kbps khớp chính xác sample!
    const voiceAllWav = path.join(workTmp, 'episode_voice_all.wav');
    const mixedAllWav = path.join(workTmp, 'episode_master_mixed.wav');
    const wavListTxt = path.join(workTmp, 'wav_list.txt');
    fs.writeFileSync(
      wavListTxt,
      paddedWavFiles.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n') + '\n',
      'utf8'
    );
    execSync(
      `ffmpeg -y -v error -f concat -safe 0 -i "${wavListTxt.replace(/\\/g, '/')}" -c copy "${voiceAllWav.replace(/\\/g, '/')}"`
    );

    const mixRes = mixMasterAudioWithSoundDesign({
      voiceMasterWavPath: voiceAllWav,
      beats: compiledBeats,
      totalFrames,
      fps,
      outputWavPath: mixedAllWav,
      cacheDir: SOUND_DESIGN_CACHE_DIR,
    });

    const masterAudioM4aPath = path.join(planDir, 'master_episode_audio.m4a');
    execSync(
      `ffmpeg -y -v error -i "${mixedAllWav.replace(/\\/g, '/')}" ` +
        `-af "atrim=end_sample=${totalExactSamples}" ` +
        `-c:a aac -b:a 192k -ar ${AUDIO_SR} -ac 1 -movflags +faststart "${masterAudioM4aPath.replace(/\\/g, '/')}"`
    );

    // Ghi file inputProps gọn nhẹ (~40KB, giữ nguyên hệ tọa độ thiết kế 1920x1080)
    const payload = {
      title: episode.title,
      totalDurationFrames: totalFrames,
      fps,
      beats: compiledBeats,
      showDebugHud: false,
    };
    const inputPropsPath = path.join(webStudioRoot, 'episodes', 'cloud_input_props.json');
    fs.mkdirSync(path.dirname(inputPropsPath), { recursive: true });
    fs.writeFileSync(
      inputPropsPath,
      JSON.stringify({ payload, v7MoviePayload: payload, showDebugHud: false }),
      'utf8'
    );

    // Chia đều dải frame [0 .. totalFrames - 1] cho `totalChapters` VM (chênh lệch tối đa <= 1 frame!)
    const chunks = computeBalancedFrameChunks(totalFrames, totalChapters);
    const movieId = `v17_${episode.slug}`;
    const planPayload = {
      version: 'v21.2',
      movieId,
      slug: episode.slug,
      title: episode.title,
      quality: qualitySpec.quality,
      scale: qualitySpec.scale,
      outputWidth: qualitySpec.width,
      outputHeight: qualitySpec.height,
      fps,
      totalBeats: compiledBeats.length,
      totalFrames,
      totalExactSamples,
      totalDurationSec: Number((totalFrames / fps).toFixed(3)),
      requestedTotalChapters: totalChapters,
      effectiveTotalChapters: chunks.length,
      bgmSegments: mixRes.plan.bgmSegments.length,
      sfxCues: mixRes.plan.sfxCues.length,
      chunks,
      generatedAt: new Date().toISOString(),
    };
    const planJsonPath = path.join(planDir, 'cloud_render_plan.json');
    fs.writeFileSync(planJsonPath, JSON.stringify(planPayload, null, 2) + '\n', 'utf8');

    console.log(
      `✅ [--prepare-cloud] Hoàn tất! Tổng: ${totalFrames} frames @ ${fps}fps (${(totalFrames / fps).toFixed(3)}s | ${qualitySpec.width}x${qualitySpec.height}) | ` +
        `BGM: ${mixRes.plan.bgmSegments.length} segments | SFX: ${mixRes.plan.sfxCues.length} cues`
    );
    console.log(
      `-> Đã chia cân bằng tải cho ${chunks.length} VM: ~${chunks[0].frameCount} frames/VM ` +
        `([0..${chunks[0].endFrame}] -> [${chunks[chunks.length - 1].startFrame}..${chunks[chunks.length - 1].endFrame}])`
    );
  } finally {
    try {
      fs.rmSync(workTmp, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * [STAGE 2 — --render-frame-chunk]:
 * Chạy trực tiếp `remotion render ./build V7MovieComposition ... --frames=start-end --scale=...`
 * từ thư mục pre-bundle của Stage 1 (0s bundling!) với cờ tối ưu cho runner 4 vCPU,
 * đồng thời bắt tiến độ `Rendered X/Y` gửi thẳng về `DASHBOARD_PROGRESS_URL`.
 */
async function renderCloudBalancedFrameChunk({ chapterIndex, totalChapters, bundleDirOverride, qualityArg }) {
  const planPath = path.join(workspaceRoot, 'out', 'cloud_plan', 'cloud_render_plan.json');
  if (!fs.existsSync(planPath)) {
    throw new Error(`Không tìm thấy kế hoạch render Cloud: ${planPath} (hãy chạy --prepare-cloud ở Stage 1 trước).`);
  }
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const chunks = Array.isArray(plan.chunks) ? plan.chunks : [];
  const totalVms = Number(process.env.TOTAL_CHAPTERS) || totalChapters || chunks.length || 20;
  const vmIndex = Number(process.env.VM_INDEX) || chapterIndex || 1;
  const qualitySpec = resolveQualityPreset(qualityArg || plan.quality);

  const chunkSpec = chunks.find((c) => c.chapter === vmIndex);
  const chunksDir = path.join(workspaceRoot, 'out', 'chunks');
  fs.mkdirSync(chunksDir, { recursive: true });
  const chunkOutPath = getChapterChunkFilePath(chunksDir, plan.movieId, vmIndex);

  const vmReporter = createSafeVmProgressReporter({ vmIndex, totalVms });

  if (!chunkSpec) {
    console.log(`ℹ️ [VM ${vmIndex}/${totalVms}] Tổng frame nhỏ hơn số VM — không có dải frame phụ trội cần render.`);
    await vmReporter.report({ phase: 'completed', renderedFrames: 0, totalFrames: 0, rawPercent: 100, force: true });
    return;
  }

  const bundleDir = bundleDirOverride
    ? path.resolve(process.cwd(), bundleDirOverride)
    : path.join(webStudioRoot, 'build');
  if (!fs.existsSync(path.join(bundleDir, 'index.html'))) {
    throw new Error(`Không tìm thấy thư mục Remotion pre-bundle hợp lệ tại: ${bundleDir}`);
  }

  const propsPath = path.join(webStudioRoot, 'episodes', 'cloud_input_props.json');
  if (!fs.existsSync(propsPath)) {
    throw new Error(`Không tìm thấy file props: ${propsPath}`);
  }

  const { startFrame, endFrame, frameCount } = chunkSpec;
  const cpuCores = Math.max(1, os.cpus()?.length || 4);
  const requestedConcurrency = Number(process.env.CONCURRENCY) || cpuCores;
  const concurrency = Math.min(cpuCores, resolveSafeRenderConcurrency(requestedConcurrency));
  const glBackend = isLinuxOrCiEnvironment() ? 'swangle' : 'angle';
  const chromeExecutable = (process.env.REMOTION_CHROME_EXECUTABLE || '').trim();
  const hasChromeExecutable = Boolean(chromeExecutable && fs.existsSync(chromeExecutable));

  console.log('====================================================================');
  console.log(
    `[Cloud Frame-Balanced VM ${vmIndex}/${chunks.length}] Frames ${startFrame}–${endFrame} (${frameCount}f) | ${qualitySpec.quality} (${qualitySpec.width}x${qualitySpec.height} @ ${plan.fps}fps, scale=${qualitySpec.scale})`
  );
  console.log(
    `-> Pre-Bundle: ${bundleDir} | Concurrency: ${concurrency} | GL: ${glBackend} | JPEG q=88 | x264 superfast crf=20`
  );
  console.log('====================================================================');

  await vmReporter.report({
    phase: 'starting',
    renderedFrames: 0,
    totalFrames: frameCount,
    rawPercent: 0,
    force: true,
  });

  const remotionCliEntry = path.join(webStudioRoot, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  const cliArgs = [
    remotionCliEntry,
    'render',
    bundleDir,
    'V7MovieComposition',
    chunkOutPath,
    `--props=${propsPath}`,
    `--frames=${startFrame}-${endFrame}`,
    `--scale=${qualitySpec.scale}`,
    '--muted',
    '--codec=h264',
    '--pixel-format=yuv420p',
    '--image-format=jpeg',
    '--jpeg-quality=88',
    '--x264-preset=superfast',
    '--crf=20',
    `--concurrency=${concurrency}`,
    `--gl=${glBackend}`,
    '--timeout=120000',
    '--overwrite',
  ];
  if (hasChromeExecutable) {
    cliArgs.push(`--browser-executable=${chromeExecutable}`);
  }

  const tStart = Date.now();
  let nextMilestonePct = 10;

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, cliArgs, {
      cwd: webStudioRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdoutBuffer = '';
    const handleLine = (rawLine) => {
      const clean = rawLine.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '').trim();
      if (!clean) return;

      const renderMatch = clean.match(/Rendered\s+(\d+)\s*\/\s*(\d+)/i);
      if (renderMatch) {
        const done = parseInt(renderMatch[1], 10);
        const tot = parseInt(renderMatch[2], 10) || frameCount;
        void vmReporter.report({
          phase: 'rendering',
          renderedFrames: done,
          totalFrames: tot,
        });
        const pct = Math.min(100, Math.floor((done / Math.max(1, tot)) * 100));
        if (pct >= nextMilestonePct || done === tot) {
          const milestone = done === tot ? 100 : Math.floor(pct / 10) * 10;
          nextMilestonePct = milestone + 10;
          const elapsed = Math.max(0.5, (Date.now() - tStart) / 1000);
          const curFps = (done / elapsed).toFixed(1);
          const remSec = done > 0 ? Math.max(0, Math.round(((tot - done) * elapsed) / done)) : 0;
          console.log(
            `  [VM ${vmIndex}/${chunks.length}] Rendered ${milestone}% (${done}/${tot}f) | ${curFps} fps | Elapsed: ${Math.round(
              elapsed
            )}s | ETA: ~${remSec}s`
          );
        }
        return;
      }

      const stitchMatch = clean.match(/Stitched\s+(\d+)\s*\/\s*(\d+)/i);
      if (stitchMatch) {
        void vmReporter.report({
          phase: 'muxing',
          renderedFrames: frameCount,
          totalFrames: frameCount,
          rawPercent: 99.2,
        });
        return;
      }

      console.log(rawLine);
    };

    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split(/\r?\n|\r/);
      stdoutBuffer = lines.pop() || '';
      for (const l of lines) handleLine(l);
    });

    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
    });

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (stdoutBuffer.trim()) handleLine(stdoutBuffer);
      if (code === 0) resolve();
      else reject(new Error(`remotion render exited with code ${code}`));
    });
  });

  if (!fs.existsSync(chunkOutPath) || fs.statSync(chunkOutPath).size < 1024) {
    throw new Error(`File chunk xuất ra bị thiếu hoặc rỗng: ${chunkOutPath}`);
  }

  await vmReporter.report({
    phase: 'completed',
    renderedFrames: frameCount,
    totalFrames: frameCount,
    rawPercent: 100,
    force: true,
  });

  const elapsedSec = ((Date.now() - tStart) / 1000).toFixed(1);
  const sizeMb = (fs.statSync(chunkOutPath).size / 1024 / 1024).toFixed(2);
  console.log(`✅ [VM ${vmIndex}/${chunks.length}] Hoàn tất ${chunkOutPath} (${sizeMb} MB) trong ${elapsedSec}s!`);
}

/**
 * [STAGE 3 — --concat-only (Cloud Frame-Balanced Path)]:
 * Ghép nối 20 đoạn MP4 + Master Audio AAC bằng `-f concat -safe 0 -i list.txt ... -c copy -movflags +faststart`
 * trong 3–5 giây (0% re-encode cả video lẫn audio!).
 */
function stitchCloudBalancedMovie({ outputPath }) {
  const planPath = path.join(workspaceRoot, 'out', 'cloud_plan', 'cloud_render_plan.json');
  const masterAudioPath = path.join(workspaceRoot, 'out', 'cloud_plan', 'master_episode_audio.m4a');
  if (!fs.existsSync(planPath) || !fs.existsSync(masterAudioPath)) {
    return null;
  }

  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const chunks = Array.isArray(plan.chunks) ? plan.chunks : [];
  const chunksDir = path.join(workspaceRoot, 'out', 'chunks');

  const chunkPaths = chunks.map((c) => getChapterChunkFilePath(chunksDir, plan.movieId, c.chapter));
  for (const cp of chunkPaths) {
    if (!fs.existsSync(cp) || fs.statSync(cp).size < 1024) {
      throw new Error(`Thiếu mảnh video chunk cần ghép: ${cp}`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const listTxtPath = path.join(chunksDir, 'list.txt');
  const listContent = chunkPaths.map((p) => `file '${path.resolve(p).replace(/\\/g, '/')}'`).join('\n') + '\n';
  fs.writeFileSync(listTxtPath, listContent, 'utf8');

  const t0 = Date.now();
  const safeList = listTxtPath.replace(/\\/g, '/');
  const safeAudio = masterAudioPath.replace(/\\/g, '/');
  const safeOut = path.resolve(outputPath).replace(/\\/g, '/');

  console.log(
    `-> [--concat-only] Đang ghép lossless ${chunkPaths.length} đoạn video (${plan.quality || '1080p'} @ ${plan.fps}fps) + Master Studio Audio (-c copy)...`
  );
  execSync(
    `ffmpeg -y -v error -f concat -safe 0 -i "${safeList}" -i "${safeAudio}" ` +
      `-map 0:v:0 -map 1:a:0 -c copy -movflags +faststart "${safeOut}"`
  );

  const elapsedSec = Number(((Date.now() - t0) / 1000).toFixed(2));
  const durationSec = measureMediaDurationFfprobe(outputPath);
  const sizeBytes = fs.statSync(outputPath).size;
  console.log(
    `✅ [--concat-only] Ghép hoàn tất trong ${elapsedSec}s -> ${outputPath} ` +
      `(${durationSec.toFixed(3)}s | ${plan.quality || '1080p'} @ ${plan.fps}fps | ${(sizeBytes / 1024 / 1024).toFixed(2)} MB)`
  );
  return { elapsedSec, durationSec, sizeBytes };
}

async function main() {
  const {
    resolvedEpisode,
    cacheDirOverride,
    bundleDirOverride,
    fpsArg,
    qualityArg,
    isPreviewOnly,
    isPrepareCloud,
    isRenderFrameChunk,
  } = parseEpisodeArgs(process.argv.slice(2));
  const cliArgs = parseChapterRenderCliArgs(process.argv);
  const effectiveFps = resolveEffectiveFps(fpsArg ?? cliArgs.fpsOverride);
  const qualitySpec = resolveQualityPreset(qualityArg);

  // Stage 2 Frame-Balanced Chunk Render chạy trực tiếp từ cloud_render_plan.json + ./build
  if (isRenderFrameChunk) {
    await renderCloudBalancedFrameChunk({
      chapterIndex: cliArgs.chapterIndex || Number(process.env.VM_INDEX) || 1,
      totalChapters: cliArgs.totalChaptersOverride || Number(process.env.TOTAL_CHAPTERS) || 20,
      bundleDirOverride,
      qualityArg,
    });
    return;
  }

  if (!fs.existsSync(resolvedEpisode)) {
    console.error(`Lỗi: Không tìm thấy file JSON kịch bản: ${resolvedEpisode}`);
    process.exit(1);
  }

  const rawJson = JSON.parse(fs.readFileSync(resolvedEpisode, 'utf8'));
  const episode = sanitizeAndValidateEpisode(rawJson);

  const scriptBeats = episode.beats.map((b) => ({
    id: b.id,
    action: 'STORY_MICRO_POSE',
    type: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: b.stageType,
    theme: b.stageType,
    stageType: b.stageType,
    floatingHeader: b.chapterBanner || b.headerTitle || undefined,
    headerTitle: b.headerTitle || b.chapterBanner || undefined,
    narrationText: b.text,
    text: b.text,
    ttsText: b.ttsText,
    transitionIn: b.transitionIn,
    transitionFrames: b.transitionFrames,
    pauseAfterSec: b.pauseAfterSec,
    bgmMood: b.bgmMood,
    voiceTone: b.voiceTone || 'CALM_STORY',
    autoStageSpec: b,
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.035],
  }));

  console.log('====================================================================');
  console.log(`V21.2 UNIVERSAL JSON RENDERER: "${episode.title}"`);
  console.log(`-> File JSON: ${resolvedEpisode}`);
  console.log(
    `-> Slug: ${episode.slug} | Beats: ${episode.beats.length} | Quality: ${qualitySpec.quality} (${qualitySpec.width}x${qualitySpec.height}) | FPS: ${effectiveFps}`
  );
  console.log('====================================================================');

  if (isPreviewOnly) {
    await renderFourActPreviewStills(episode, scriptBeats, effectiveFps, bundleDirOverride);
    return;
  }

  const defaultOutputPath = path.join(workspaceRoot, 'out', `${episode.slug}_v21.mp4`);
  const resolvedFinalOut = cliArgs.outputOverride
    ? path.resolve(process.cwd(), cliArgs.outputOverride)
    : defaultOutputPath;

  // Stage 3: Nếu có cloud_render_plan.json + master_episode_audio.m4a thì ghép thẳng bằng -f concat -safe 0 -i list.txt -c copy!
  if (cliArgs.mode === 'CONCAT_ONLY') {
    const cloudConcatRes = stitchCloudBalancedMovie({ outputPath: resolvedFinalOut });
    if (cloudConcatRes) {
      if (hasLocalArtifactDir && fs.existsSync(resolvedFinalOut)) {
        const artifactOut = path.join(localArtifactDir, path.basename(resolvedFinalOut));
        fs.copyFileSync(resolvedFinalOut, artifactOut);
      }
      return;
    }
  }

  const encoderInfo = detectBestHardwareEncoder();
  const VIENEU_URL = (process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL || 'http://127.0.0.1:8000/v1/audio/speech').trim();
  const VIENEU_VOICE = (process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE || 'Hải Đăng').trim();
  const VIENEU_ATEMPO = Number(process.env.VIENEU_TTS_ATEMPO) || 1.10;

  const ttsCacheDir = cacheDirOverride
    ? path.resolve(process.cwd(), cacheDirOverride)
    : path.join(workspaceRoot, '.tts-cache', 'auto_episode');

  let prebuiltAudioIndex = null;
  const audioIndexPath = path.join(ttsCacheDir, 'episode_audio_index.json');
  if (fs.existsSync(audioIndexPath)) {
    try {
      prebuiltAudioIndex = JSON.parse(fs.readFileSync(audioIndexPath, 'utf8'));
      console.log(
        `⚡ Đã nạp chỉ mục âm thanh Cloud (${prebuiltAudioIndex.engine} — ${prebuiltAudioIndex.voiceName}, ${prebuiltAudioIndex.totalBeats} beats)!`
      );
    } catch {
      prebuiltAudioIndex = null;
    }
  }

  const synthesizeBeatAudio = async (beat, globalIdx) => {
    const idxEntry = prebuiltAudioIndex?.beatsByIndex?.[String(globalIdx)];
    if (idxEntry?.file) {
      const cachedPath = path.join(ttsCacheDir, idxEntry.file);
      if (fs.existsSync(cachedPath) && fs.statSync(cachedPath).size > 500) {
        const actualDurationSec =
          typeof idxEntry.actualDurationSec === 'number' && idxEntry.actualDurationSec > 0
            ? idxEntry.actualDurationSec
            : measureMediaDurationFfprobe(cachedPath);
        const mp3Buffer = fs.readFileSync(cachedPath);
        return {
          mp3Buffer,
          audioUrl: `data:audio/mp3;base64,${mp3Buffer.toString('base64')}`,
          actualDurationSec,
          totalDurationMs: Math.round(actualDurationSec * 1000),
          totalDurationFrames: Math.ceil(actualDurationSec * effectiveFps) + Math.round(0.4 * effectiveFps),
          voiceName: idxEntry.voiceName || VIENEU_VOICE,
          fromCache: true,
          cacheFilePath: cachedPath,
          engine: idxEntry.engine || 'VIENEU_LOCAL',
        };
      }
    }

    const ttsInput = resolveBeatTtsText(beat);
    const outcome = await synthesizeVieneuLocalTtsBeat({
      text: beat.narrationText || beat.text || '',
      ttsText: ttsInput,
      voiceTone: beat.voiceTone,
      voice: VIENEU_VOICE,
      atempo: VIENEU_ATEMPO,
      url: VIENEU_URL,
      cacheDir: ttsCacheDir,
    });
    if (!outcome.ok || !outcome.result) {
      throw new Error(`[AutoFactory TTS] Lỗi tại Beat #${globalIdx + 1}: ${outcome.errorReason}`);
    }
    return {
      ...outcome.result,
      totalDurationFrames: Math.ceil(outcome.result.actualDurationSec * effectiveFps) + Math.round(0.4 * effectiveFps),
    };
  };

  // Stage 1: Chuẩn bị kế hoạch chia dải frame cân bằng tải + Master Audio toàn tập 1 lần duy nhất
  if (isPrepareCloud) {
    await prepareCloudEpisodePlan({
      episode,
      scriptBeats,
      fps: effectiveFps,
      qualitySpec,
      totalChapters: cliArgs.totalChaptersOverride || Number(process.env.TOTAL_CHAPTERS) || 20,
      synthesizeBeatAudio,
    });
    return;
  }

  console.log(`-> Video Encoder: ${encoderInfo.displayName}`);
  const chapters = splitBeatsIntoChapters(scriptBeats, Math.min(4, scriptBeats.length));

  let remotionRendererMod = null;
  let remotionBundlerMod = null;

  const summary = await renderLongMovieByChapters(chapters, defaultOutputPath, {
    movieId: `v17_${episode.slug}`,
    movieTitle: episode.title,
    workspaceRoot,
    ttsCacheDir,
    fps: effectiveFps,
    cliArgs,
    renderEngineVersionTag: `v21_2_universal_${qualitySpec.quality}_${effectiveFps}fps`,

    synthesizeBeatAudio,

    mixChapterAudio: ({ chapterNumber, voiceMasterWavPath, compiledBeats, chapterTotalFrames, outputWavPath }) => {
      const mixRes = mixMasterAudioWithSoundDesign({
        voiceMasterWavPath,
        beats: compiledBeats,
        totalFrames: chapterTotalFrames,
        fps: effectiveFps,
        outputWavPath,
        cacheDir: SOUND_DESIGN_CACHE_DIR,
      });
      return {
        durationSec: mixRes.durationSec,
        summaryLog: `  -> [Audio V21 | Chunk ${chapterNumber} @ ${effectiveFps}fps] BGM segments: ${mixRes.plan.bgmSegments.length} | SFX: ${mixRes.plan.sfxCues.length} cues`,
      };
    },

    prepareRenderer: async () => {
      if (!remotionRendererMod) remotionRendererMod = await import('@remotion/renderer');

      const prebuiltDir = bundleDirOverride
        ? path.resolve(process.cwd(), bundleDirOverride)
        : path.join(webStudioRoot, 'build');
      const isCi = isLinuxOrCiEnvironment();
      let bundleLocation;

      if (fs.existsSync(path.join(prebuiltDir, 'index.html'))) {
        bundleLocation = prebuiltDir;
        console.log(`\n-> Sử dụng Remotion pre-bundle có sẵn tại: ${bundleLocation}`);
      } else {
        if (!remotionBundlerMod) remotionBundlerMod = await import('@remotion/bundler');
        const entryPoint = path.join(webStudioRoot, 'src', 'remotion', 'index.ts');
        console.log(`\n-> Bundling Remotion composition (${isCi ? 'Linux/CI SwANGLE' : 'Local ANGLE'})...`);
        bundleLocation = await remotionBundlerMod.bundle({
          entryPoint,
          onProgress: (p) => {
            if (p === 100 || p % 50 === 0) console.log(`  Bundling: ${p}%`);
          },
        });
      }

      if (isCi) {
        return { bundleLocation, browserInstance: undefined, close: async () => {} };
      }
      const browserInstance = await remotionRendererMod.openBrowser('chrome', {
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
      });
      return {
        bundleLocation,
        browserInstance,
        close: async () => {
          await browserInstance.close({ silent: true });
        },
      };
    },

    renderChapterVideo: async (ctx) => {
      const payload = {
        title: `${episode.title} — ${ctx.chunkLabel}`,
        totalDurationFrames: ctx.chapterTotalFrames,
        fps: effectiveFps,
        beats: ctx.compiledBeats,
        showDebugHud: false,
      };
      const composition = await selectCompositionWithCheckpoints({
        selectComposition: remotionRendererMod.selectComposition,
        serveUrl: ctx.bundleLocation,
        id: 'V7MovieComposition',
        puppeteerInstance: ctx.browserInstance,
        inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
        chunkLabel: ctx.chunkLabel,
      });

      const vmIndex =
        Number(process.env.VM_INDEX) ||
        ctx.chapter.chapterNumber ||
        cliArgs.chapterIndex ||
        1;
      const totalVms =
        Number(process.env.TOTAL_CHAPTERS) ||
        cliArgs.totalChaptersOverride ||
        chapters.length ||
        20;
      const expectedTotalFrames = Math.max(
        1,
        Math.ceil(composition.durationInFrames / (ctx.isPreview ? 2 : 1))
      );
      const vmReporter = createSafeVmProgressReporter({ vmIndex, totalVms });

      void vmReporter.report({
        phase: 'starting',
        renderedFrames: 0,
        totalFrames: expectedTotalFrames,
        rawPercent: 0,
        force: true,
      });

      const res = await renderVideoHybridCpuGpu({
        composition,
        serveUrl: ctx.bundleLocation,
        inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
        masterAudioPath: ctx.chapterMasterAudioPath,
        outputPath: ctx.chunkOutputPath,
        isPreview: ctx.isPreview,
        concurrency: ctx.concurrency,
        jpegQuality: 88,
        chunkLabel: ctx.chunkLabel,
        tempDirPrefix: `v21_auto_ch${ctx.chapter.chapterNumber}_frames_`,
        renderFrames: (opts) =>
          remotionRendererMod.renderFrames({
            ...opts,
            onFrameUpdate: (framesRendered) => {
              if (typeof opts.onFrameUpdate === 'function') {
                opts.onFrameUpdate(framesRendered);
              }
              void vmReporter.report({
                phase: 'rendering',
                renderedFrames: framesRendered,
                totalFrames: expectedTotalFrames,
              });
            },
          }),
        renderMedia: (opts) =>
          remotionRendererMod.renderMedia({
            ...opts,
            onProgress: (prog) => {
              if (typeof opts.onProgress === 'function') {
                opts.onProgress(prog);
              }
              void vmReporter.report({
                phase: 'rendering',
                renderedFrames: prog?.renderedFrames ?? 0,
                totalFrames: expectedTotalFrames,
                rawPercent:
                  typeof prog?.progress === 'number' ? prog.progress * 100 : undefined,
              });
            },
          }),
        puppeteerInstance: ctx.browserInstance,
      });

      await vmReporter.report({
        phase: 'completed',
        renderedFrames: expectedTotalFrames,
        totalFrames: expectedTotalFrames,
        rawPercent: 100,
        force: true,
      });

      return {
        elapsedSec: res.elapsedSec,
        sizeBytes: res.sizeBytes,
      };
    },
  });

  if (
    hasLocalArtifactDir &&
    (summary.mode === 'ALL_AND_CONCAT' || summary.mode === 'CONCAT_ONLY') &&
    fs.existsSync(summary.outputPath)
  ) {
    const artifactOut = path.join(localArtifactDir, path.basename(summary.outputPath));
    fs.copyFileSync(summary.outputPath, artifactOut);
    console.log(`-> Đã đồng bộ bản sao artifact: ${artifactOut}`);
  }
}

const isDirectCliExecution =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectCliExecution) {
  main().catch((err) => {
    console.error('Fatal V21.2 Auto-Factory render error:', err);
    process.exit(1);
  });
}
