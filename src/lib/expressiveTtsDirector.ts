/**
 * EXPRESSIVE TTS DIRECTOR V9.3:
 * Khóa Cứng Giọng Nam Trầm Ấm 125Hz (vi-VN-NamMinhNeural) Năng Động (Mật độ nói 80%-85%)
 * + Bộ Lọc Phòng Thu FFmpeg Broadcast Baritone Mastering
 */

import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";
import { synthesizeEdgeTts } from "./edgeTtsClient";
import {
  synthesizeGeminiTtsBeat,
  synthesizeVieneuLocalTtsBeat,
  applyEdgeTtsPronunciationMap,
  resolveGeminiApiKey,
  resolveTtsProvider,
  EMOTIONAL_ACTING_DIRECTIONS,
  TTS_PRONUNCIATION_MAP,
  DEFAULT_GEMINI_TTS_VOICE,
  DEFAULT_VIENEU_TTS_URL,
  type GeminiPrebuiltVoiceName,
  type TtsProvider,
} from "./v7/geminiTtsClient";

export {
  EMOTIONAL_ACTING_DIRECTIONS,
  TTS_PRONUNCIATION_MAP,
  applyEdgeTtsPronunciationMap,
  DEFAULT_GEMINI_TTS_VOICE,
  DEFAULT_VIENEU_TTS_URL,
  resolveTtsProvider,
  type TtsProvider,
};

export type VoiceEmotionTone =
  | "HOOK_INTRIGUE"
  | "CALM_STORY"
  | "TENSE_CLIMAX"
  | "SLOW_EMOTIONAL"
  | "STEP_BY_STEP_SUSPENSE"
  | "CHAPTER_ANNOUNCE";

export interface VoiceTonePreset {
  rate: string;
  pitch: string;
  volume: string;
  pauseBeforeMs: number;
  pauseAfterMs: number;
  clausePauseMs: number;
  playbackRate: number;
  label: string;
  geminiStylePrompt: string;
}

export const LEAD_IN_SILENCE_MS = 300; // 0.3s (18 frames) khoảng thở đầu cảnh
export const LEAD_IN_FRAMES = 18;
export const TAIL_HOLD_FRAMES = 42;    // 0.7s (42 frames) khoảng thở cuối cảnh

export const CLAUSE_SILENCE_TRIM_AF =
  "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-46dB:detection=peak,areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-46dB:detection=peak,areverse";

export const BARITONE_MASTERING_AF = [
  "highpass=f=85",                                      // Cắt sạch âm ù trầm quá mức
  "equalizer=f=135:t=q:w=1.2:g=2.2",                    // Ấm ngực vừa phải (+2.2dB, không bị ồm)
  "equalizer=f=320:t=q:w=1.2:g=-1.5",                   // Giảm nhẹ độ đục (muddy) cho giọng trong hơn
  "equalizer=f=3200:t=q:w=1.5:g=2.8",                   // Làm rõ nét phụ âm tiếng Việt
  "equalizer=f=6800:t=q:w=2.0:g=-3.0",                  // Khử chói âm xuýt TTS
  "acompressor=threshold=-18dB:ratio=3:attack=10:release=150:makeup=4dB",
  "alimiter=limit=0.95",
].join(",");

/**
 * V10.2: Baritone Calm Storytelling Matrix — Nhịp kể chuyện chậm rãi, trầm ấm, có khoảng thở tự nhiên
 */
export const VOICE_TONE_PRESETS: Record<VoiceEmotionTone, VoiceTonePreset> = {
  HOOK_INTRIGUE: {
    rate: "-2%",
    pitch: "-7Hz",
    volume: "+10%",
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 420,
    clausePauseMs: 420,
    playbackRate: 1.0,
    label: "Mở đầu cuốn hút / Chậm rãi (Nam Trầm 125Hz)",
    geminiStylePrompt:
      "Đọc bằng giọng nam trầm ấm 125Hz, nhịp điệu chậm rãi, truyền cảm và nhấn mạnh câu hỏi mở đầu:",
  },
  CALM_STORY: {
    rate: "-2%",
    pitch: "-8Hz",
    volume: "+6%",
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 380,
    clausePauseMs: 380,
    playbackRate: 1.0,
    label: "Kể chuyện điềm tĩnh / Có khoảng thở (Nam Trầm 125Hz)",
    geminiStylePrompt:
      "Đọc bằng giọng nam trầm ấm 125Hz, từ tốn, rõ ràng như phim tài liệu sinh tồn:",
  },
  CHAPTER_ANNOUNCE: {
    rate: "-5%",
    pitch: "-8Hz",
    volume: "+12%",
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 480,
    clausePauseMs: 480,
    playbackRate: 1.0,
    label: "Chuyển chương trầm hùng (Nam Trầm 125Hz)",
    geminiStylePrompt:
      "Đọc bằng giọng nam trầm hùng, thong thả, nhấn mạnh cột mốc thời gian:",
  },
  STEP_BY_STEP_SUSPENSE: {
    rate: "-6%",
    pitch: "-8Hz",
    volume: "+6%",
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 550,
    clausePauseMs: 550,
    playbackRate: 1.0,
    label: "Nhấn chậm từng bước hồi hộp (Nam Trầm 125Hz)",
    geminiStylePrompt:
      "Đọc chậm rãi, nhấn rõ khoảng dừng từng bước chân hồi hộp:",
  },
  SLOW_EMOTIONAL: {
    rate: "-6%",
    pitch: "-9Hz",
    volume: "+4%",
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 520,
    clausePauseMs: 520,
    playbackRate: 1.0,
    label: "Trầm lắng / Suy ngẫm (Nam Trầm 125Hz)",
    geminiStylePrompt:
      "Đọc bằng giọng nam trầm sâu lắng, chậm rãi, giàu cảm xúc sinh tồn:",
  },
  TENSE_CLIMAX: {
    rate: "+4%",
    pitch: "-5Hz",
    volume: "+15%",
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 280,
    clausePauseMs: 280,
    playbackRate: 1.0,
    label: "Cao trào dứt khoát không vội vàng (Nam Trầm 125Hz)",
    geminiStylePrompt:
      "Đọc rõ ràng, kịch tính vừa phải và bùng nổ đúng khoảnh khắc tung đòn:",
  },
};

export interface BreathSubClause {
  text: string;
  rate: string;
  pitch: string;
  volume: string;
  playbackRate: number;
  pauseAfterMs: number;
  isTrailingAfterEllipsis: boolean;
}

export interface SubClauseAudioSegment {
  text: string;
  audioUrl: string;
  startOffsetMs: number;
  startOffsetFrames: number;
  durationMs: number;
  durationFrames: number;
  playbackRate: number;
}

export interface ExpressiveTtsResult {
  audioUrl: string;
  totalDurationMs: number;
  totalDurationFrames: number;
  voiceTone: VoiceEmotionTone;
  subClauseAudios: SubClauseAudioSegment[];
  engineUsed: "gemini-native-tts" | "vieneu-local-tts" | "edge-prosody-director";
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Tự động suy luận tông cảm xúc giọng đọc từ nội dung câu và loại thẻ cảnh
 */
export function inferVoiceToneFromBeat(
  text: string,
  cardType?: string,
  beatIndex: number = 0
): VoiceEmotionTone {
  const t = text.toLowerCase();
  if (
    cardType === "CHAPTER_CARD" ||
    t.startsWith("ngày ") ||
    t.startsWith("tuần ") ||
    t.includes("nhưng điều tệ nhất")
  ) {
    return "CHAPTER_ANNOUNCE";
  }
  if (beatIndex === 0 || t.includes("điều gì xảy ra") || t.includes("bạn có bao giờ")) {
    return "HOOK_INTRIGUE";
  }
  if (
    t.includes("chộp!") ||
    t.includes("vồ!") ||
    t.includes("tấn công") ||
    t.includes("liều lĩnh") ||
    t.includes("bùng nổ")
  ) {
    return "TENSE_CLIMAX";
  }
  if (
    t.includes("một bước") ||
    t.includes("từng chút") ||
    t.includes("thật chậm") ||
    t.includes("rình")
  ) {
    return "STEP_BY_STEP_SUSPENSE";
  }
  if (
    t.includes("kiệt sức") ||
    t.includes("cạn kiệt") ||
    t.includes("tự đốt") ||
    t.includes("ngọn nến") ||
    t.includes("hy sinh")
  ) {
    return "SLOW_EMOTIONAL";
  }
  return "CALM_STORY";
}

/**
 * Bộ tách mệnh đề thông minh V9.3 (Không tách vụn câu ngắn):
 * Chỉ tách vế ở dấu câu kết thúc (., !, ?, ..., —) hoặc dấu phẩy dài >= 7 từ.
 */
export function splitIntoBreathClauses(
  rawText: string,
  tone: VoiceEmotionTone = "CALM_STORY"
): BreathSubClause[] {
  const preset = VOICE_TONE_PRESETS[tone] || VOICE_TONE_PRESETS.CALM_STORY;
  const cleaned = rawText.trim();
  if (!cleaned) return [];

  const normalized = cleaned.replace(/\.{3,}/g, "…").replace(/\s+-\s+/g, " — ");

  // Tách ở dấu câu kết thúc (., !, ?, …, —)
  const rawParts = normalized
    .split(/(?<=[.!?…])|\s*—\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Chỉ tách thêm theo dấu phẩy nếu cả 2 vế quanh dấu phẩy đều dài >= 7 từ
  const finalTexts: string[] = [];
  for (const part of rawParts) {
    if (part.includes(",") && countWords(part) >= 14) {
      const commaSub = part.split(",").map((s) => s.trim()).filter(Boolean);
      const mergedComma: string[] = [];
      let acc = "";
      for (const cs of commaSub) {
        if (!acc) {
          acc = cs;
        } else if (countWords(acc) >= 7 && countWords(cs) >= 7) {
          mergedComma.push(acc + ",");
          acc = cs;
        } else {
          acc = `${acc}, ${cs}`;
        }
      }
      if (acc) mergedComma.push(acc);
      finalTexts.push(...mergedComma);
    } else {
      finalTexts.push(part);
    }
  }

  return finalTexts.map((txt, idx) => {
    const isLast = idx === finalTexts.length - 1;
    return {
      text: txt,
      rate: preset.rate,
      pitch: preset.pitch,
      volume: preset.volume,
      playbackRate: 1.0,
      pauseAfterMs: isLast ? 40 : preset.clausePauseMs,
      isTrailingAfterEllipsis: idx > 0,
    };
  });
}

/**
 * Đo chính xác thời lượng thực tế (giây) của file âm thanh bằng ffprobe
 */
export function measureAudioDurationWithFfprobe(filePath: string): number {
  const safePath = filePath.replace(/\\/g, "/");
  const probeOut = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${safePath}"`
  )
    .toString()
    .trim();
  const actualDurationSec = parseFloat(probeOut);
  if (!Number.isFinite(actualDurationSec) || actualDurationSec <= 0) {
    throw new Error(`ffprobe trả về thời lượng không hợp lệ (${probeOut}) cho ${safePath}`);
  }
  return actualDurationSec;
}

/**
 * Hàm chính V11.3 (Strict Single-Voice Lock):
 * - Hỗ trợ 3 nhà cung cấp qua ttsProvider: "GEMINI_TTS" | "VIENEU_LOCAL" | "EDGE_TTS"
 * - Khi video đã khóa GEMINI_TTS (giọng "Puck" 1.15x) hoặc VIENEU_LOCAL:
 *   TUYỆT ĐỐI CẤM fallback từng beat lẻ sang Edge-TTS khi gặp HTTP 429 (tránh 1 video bị lẫn 2 giọng).
 *   Chỉ dùng Edge-TTS xuyên suốt cả video khi không có GEMINI_API_KEY hoặc ttsProvider === "EDGE_TTS".
 */
export async function synthesizeExpressiveBeatTts(options: {
  text: string;
  voice?: string;
  tone?: VoiceEmotionTone;
  apiKey?: string;
  useGeminiTts?: boolean;
  geminiVoiceName?: GeminiPrebuiltVoiceName;
  ttsProvider?: TtsProvider;
  vieneuUrl?: string;
  strictSingleVoice?: boolean;
}): Promise<ExpressiveTtsResult> {
  const text = options.text.trim();
  const voice =
    !options.voice || options.voice.includes("HoaiMy")
      ? "vi-VN-NamMinhNeural"
      : options.voice;
  const tone = options.tone || "CALM_STORY";
  const preset = VOICE_TONE_PRESETS[tone] || VOICE_TONE_PRESETS.CALM_STORY;
  const resolvedKey = resolveGeminiApiKey(options.apiKey);
  const strictLock = options.strictSingleVoice !== false;

  const activeProvider: TtsProvider =
    options.ttsProvider ||
    (options.useGeminiTts === false ? "EDGE_TTS" : resolveTtsProvider(undefined, resolvedKey));

  if (activeProvider === "VIENEU_LOCAL") {
    const vieneuVoice =
      options.voice && !options.voice.startsWith("vi-VN-")
        ? options.voice
        : undefined;
    const vieneuAttempt = await synthesizeVieneuLocalTtsBeat({
      text,
      voiceTone: tone,
      voice: vieneuVoice,
      url: options.vieneuUrl,
    });
    if (vieneuAttempt.ok && vieneuAttempt.result) {
      const vr = vieneuAttempt.result;
      return {
        audioUrl: vr.audioUrl,
        totalDurationMs: vr.totalDurationMs,
        totalDurationFrames: vr.totalDurationFrames,
        voiceTone: tone,
        engineUsed: "vieneu-local-tts",
        subClauseAudios: [
          {
            text,
            audioUrl: vr.audioUrl,
            startOffsetMs: LEAD_IN_SILENCE_MS,
            startOffsetFrames: LEAD_IN_FRAMES,
            durationMs: Math.max(0, vr.totalDurationMs - LEAD_IN_SILENCE_MS),
            durationFrames: Math.max(1, vr.totalDurationFrames - LEAD_IN_FRAMES - TAIL_HOLD_FRAMES),
            playbackRate: 1.0,
          },
        ],
      };
    }
    if (strictLock) {
      throw new Error(
        `[Strict Single-Voice Lock] VIENEU_LOCAL thất bại (${vieneuAttempt.errorReason}). Cấm trộn fallback Edge-TTS để giữ đồng nhất 100% một giọng đọc.`
      );
    }
  }

  if (activeProvider === "GEMINI_TTS" && resolvedKey) {
    const geminiVoice = options.geminiVoiceName || DEFAULT_GEMINI_TTS_VOICE;
    const geminiAttempt = await synthesizeGeminiTtsBeat({
      text,
      voiceTone: tone,
      voiceName: geminiVoice,
      apiKey: resolvedKey,
    });
    if (geminiAttempt.ok && geminiAttempt.result) {
      const gr = geminiAttempt.result;
      return {
        audioUrl: gr.audioUrl,
        totalDurationMs: gr.totalDurationMs,
        totalDurationFrames: gr.totalDurationFrames,
        voiceTone: tone,
        engineUsed: "gemini-native-tts",
        subClauseAudios: [
          {
            text,
            audioUrl: gr.audioUrl,
            startOffsetMs: LEAD_IN_SILENCE_MS,
            startOffsetFrames: LEAD_IN_FRAMES,
            durationMs: Math.max(0, gr.totalDurationMs - LEAD_IN_SILENCE_MS),
            durationFrames: Math.max(1, gr.totalDurationFrames - LEAD_IN_FRAMES - TAIL_HOLD_FRAMES),
            playbackRate: 1.0,
          },
        ],
      };
    }
    if (strictLock) {
      throw new Error(
        `[Strict Single-Voice Lock] Gemini 2.5 Flash TTS (${geminiVoice}) thất bại sau 4 lần retry (${geminiAttempt.errorReason}). Cấm fallback nửa vời sang Edge-TTS để đảm bảo đồng nhất 100% một giọng đọc!`
      );
    }
    console.warn(
      `[ExpressiveTTS] Gemini 2.5 Flash TTS không khả dụng (${geminiAttempt.errorReason}), chuyển sang Edge-TTS do strictSingleVoice=false.`
    );
  }

  const clauses = splitIntoBreathClauses(text, tone);
  const subClauseAudios: SubClauseAudioSegment[] = [];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "v9_3_tts_beat_"));

  try {
    const clauseFiles: {
      filePath: string;
      durationSec: number;
      pauseAfterSec: number;
      text: string;
      base64: string;
    }[] = [];

    for (let i = 0; i < clauses.length; i++) {
      const clause = clauses[i];
      // V11.1: Chỉ áp dụng TTS_PRONUNCIATION_MAP ("đèn pin" -> "đèn bin") cho Edge-TTS fallback, không đổi phụ đề
      const edgeSpokenText = applyEdgeTtsPronunciationMap(clause.text);
      const ttsRes = await synthesizeEdgeTts(
        edgeSpokenText,
        voice,
        clause.rate,
        clause.pitch,
        clause.volume
      );

      const rawFile = path.join(tempDir, `raw_${i}.mp3`);
      const normFile = path.join(tempDir, `norm_${i}.mp3`);
      fs.writeFileSync(rawFile, Buffer.from(ttsRes.audioBase64, "base64"));

      const safeRaw = rawFile.replace(/\\/g, "/");
      const safeNorm = normFile.replace(/\\/g, "/");
      // V10.1: Tự động cắt khoảng lặng thừa đầu/đuôi từng vế câu bằng FFmpeg silenceremove trước khi ghép nối
      execSync(
        `ffmpeg -y -v error -i "${safeRaw}" -filter:a "aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono,${CLAUSE_SILENCE_TRIM_AF}" -ar 24000 -ac 1 -b:a 96k "${safeNorm}"`
      );

      let actualClauseSec = 0;
      try {
        actualClauseSec = measureAudioDurationWithFfprobe(normFile);
      } catch {
        execSync(
          `ffmpeg -y -v error -i "${safeRaw}" -filter:a "aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono" -ar 24000 -ac 1 -b:a 96k "${safeNorm}"`
        );
        actualClauseSec = measureAudioDurationWithFfprobe(normFile);
      }
      const isLastClause = i === clauses.length - 1;
      const pauseAfterSec = isLastClause ? 0.02 : Math.max(0.24, clause.pauseAfterMs / 1000);

      clauseFiles.push({
        filePath: normFile,
        durationSec: actualClauseSec,
        pauseAfterSec,
        text: clause.text,
        base64: fs.readFileSync(normFile).toString("base64"),
      });
    }

    const concatRawPath = path.join(tempDir, "concat_raw.mp3");
    const finalBeatAudioPath = path.join(tempDir, "final_beat_mastered.mp3");
    const safeConcatPath = concatRawPath.replace(/\\/g, "/");
    const safeFinalPath = finalBeatAudioPath.replace(/\\/g, "/");

    const inputsArg = clauseFiles
      .map((cf) => `-i "${cf.filePath.replace(/\\/g, "/")}"`)
      .join(" ");

    const filterParts: string[] = [];
    const concatRefs: string[] = [];

    if (preset.pauseBeforeMs > 15) {
      const preSec = (preset.pauseBeforeMs / 1000).toFixed(3);
      filterParts.push(`anullsrc=r=24000:cl=mono,atrim=duration=${preSec}[sil_pre]`);
      concatRefs.push("[sil_pre]");
    }

    clauseFiles.forEach((cf, idx) => {
      concatRefs.push(`[${idx}:a]`);
      if (idx < clauseFiles.length - 1 && cf.pauseAfterSec > 0.01) {
        filterParts.push(
          `anullsrc=r=24000:cl=mono,atrim=duration=${cf.pauseAfterSec.toFixed(3)}[sil_${idx}]`
        );
        concatRefs.push(`[sil_${idx}]`);
      }
    });

    const filterGraph =
      (filterParts.length > 0 ? filterParts.join(";") + ";" : "") +
      `${concatRefs.join("")}concat=n=${concatRefs.length}:v=0:a=1[outa]`;

    execSync(
      `ffmpeg -y -v error ${inputsArg} -filter_complex "${filterGraph}" -map "[outa]" -ar 24000 -ac 1 -b:a 64k "${safeConcatPath}"`
    );

    // Áp dụng chuỗi lọc phòng thu FFmpeg Broadcast Baritone Mastering (-af)
    execSync(
      `ffmpeg -y -v error -i "${safeConcatPath}" -af "${BARITONE_MASTERING_AF}" -ar 24000 -ac 1 -b:a 64k "${safeFinalPath}"`
    );

    // Đo thời lượng thực tế (đã bao gồm 0.3s lead-in = 18f) bằng ffprobe & cộng đúng TAIL_HOLD_FRAMES (+42 frames = 0.7s)
    const actualDurationSec = measureAudioDurationWithFfprobe(finalBeatAudioPath);
    const totalDurationMs = Math.round(actualDurationSec * 1000);
    const speechOnlySec = Math.max(0, actualDurationSec - LEAD_IN_SILENCE_MS / 1000);
    const totalDurationFrames = LEAD_IN_FRAMES + Math.ceil(speechOnlySec * 60) + TAIL_HOLD_FRAMES;

    let cursorMs = preset.pauseBeforeMs;
    for (const cf of clauseFiles) {
      const clipMs = Math.round(cf.durationSec * 1000);
      subClauseAudios.push({
        text: cf.text,
        audioUrl: `data:audio/mp3;base64,${cf.base64}`,
        startOffsetMs: cursorMs,
        startOffsetFrames: Math.round((cursorMs / 1000) * 60),
        durationMs: clipMs,
        durationFrames: Math.ceil((clipMs / 1000) * 60),
        playbackRate: 1.0,
      });
      cursorMs += clipMs + Math.round(cf.pauseAfterSec * 1000);
    }

    const finalBase64 = fs.readFileSync(finalBeatAudioPath).toString("base64");

    return {
      audioUrl: `data:audio/mp3;base64,${finalBase64}`,
      totalDurationMs,
      totalDurationFrames,
      voiceTone: tone,
      subClauseAudios,
      engineUsed: "edge-prosody-director",
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}
