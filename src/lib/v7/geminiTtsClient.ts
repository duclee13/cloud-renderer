/**
 * GEMINI 2.5 FLASH PREVIEW TTS CLIENT V11.3 (Strict Single-Voice Lock + Giọng Nam 18 Tuổi "Puck" 1.15x + VieNeu Local)
 * - Gọi trực tiếp REST API: gemini-2.5-flash-preview-tts (voice mặc định: "Puck", tùy chọn "Charon" | "Orus" | "Fenrir")
 * - Chỉ đạo diễn xuất cảm xúc nam thanh niên 18 tuổi ấm áp, thân thiện theo từng voiceTone (EMOTIONAL_ACTING_DIRECTIONS)
 * - Giải mã raw 16-bit signed LE PCM 24kHz mono -> MP3 192kbps với atempo=1.15 (giữ nguyên cao độ), highpass=85, loudnorm
 * - Đo lại thời lượng thực tế sau atempo=1.15 bằng ffprobe để khóa chính xác thời lượng frame (lead-in 0.3s / tail-hold 0.7s)
 * - Strict Single-Voice Lock V11.3:
 *   + Giãn cách an toàn 21000ms (21s) giữa các lượt gọi API thật (chưa có cache) để tuân thủ chặt Free Tier 3 RPM
 *   + Retry tối đa 4 lần với thời gian chờ tăng dần 25s -> 45s -> 65s -> 85s khi gặp HTTP 429 (in log rõ trạng thái chờ)
 *   + Cache đĩa SHA-256 vĩnh viễn theo (text + voiceTone + voiceName + tempo)
 * - Hỗ trợ mở rộng ttsProvider: "GEMINI_TTS" | "VIENEU_LOCAL" | "EDGE_TTS" (VIENEU_TTS_URL mặc định http://localhost:8000/v1/audio/speech)
 * - Cung cấp TTS_PRONUNCIATION_MAP ("đèn pin" -> "đèn bin") chỉ áp dụng cho Edge-TTS
 */

import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";

export type GeminiVoiceTone =
  | "HOOK_INTRIGUE"
  | "CALM_STORY"
  | "TENSE_CLIMAX"
  | "SLOW_EMOTIONAL"
  | "STEP_BY_STEP_SUSPENSE"
  | "CHAPTER_ANNOUNCE";

export type TtsProvider = "GEMINI_TTS" | "VIENEU_LOCAL" | "EDGE_TTS";

export type GeminiPrebuiltVoiceName = "Puck" | "Charon" | "Orus" | "Fenrir" | "Kore" | "Aoede";

export const DEFAULT_GEMINI_TTS_VOICE: GeminiPrebuiltVoiceName =
  (process.env.GEMINI_TTS_VOICE as GeminiPrebuiltVoiceName) || "Puck";

export const DEFAULT_VIENEU_TTS_URL =
  (process.env.VIENEU_TTS_URL || "http://127.0.0.1:8000/v1/audio/speech").trim();

export const DEFAULT_VIENEU_TTS_VOICE =
  (process.env.VIENEU_TTS_VOICE || "Hải Đăng").trim();

export const VIENEU_TTS_ATEMPO = 1.12; // Tốc độ năng động vừa phải qua FFmpeg atempo=1.12 (giữ nguyên cao độ)

export function resolveTtsProvider(explicitProvider?: TtsProvider, explicitApiKey?: string): TtsProvider {
  const raw = (explicitProvider || (process.env.TTS_PROVIDER as TtsProvider) || "").trim().toUpperCase();
  if (raw === "VIENEU_LOCAL") return "VIENEU_LOCAL";
  if (raw === "EDGE_TTS") return "EDGE_TTS";
  if (raw === "GEMINI_TTS") return "GEMINI_TTS";
  return resolveGeminiApiKey(explicitApiKey) ? "GEMINI_TTS" : "EDGE_TTS";
}

export const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";
export const GEMINI_TTS_TEMPO = 1.15; // V11.2: Tăng tốc độ phát 1.15x giữ nguyên cao độ tự nhiên qua atempo=1.15
export const GEMINI_TTS_LEAD_IN_MS = 300; // 0.3s = 18 frames
export const GEMINI_TTS_LEAD_IN_FRAMES = 18;
export const GEMINI_TTS_TAIL_HOLD_FRAMES = 42; // 0.7s = 42 frames

const YOUTH_18_FRIENDLY_PERSONA =
  "Đọc bằng giọng nam thanh niên tiếng Việt trẻ trung tầm 18 tuổi, tông giọng cao vừa phải, ấm áp, thân thiện và cuốn hút như một người bạn đang kể chuyện thú vị; tốc độ nói linh hoạt, tự nhiên.";

/**
 * Bảng Chỉ Đạo Diễn Xuất Cảm Xúc Tự Nhiên V11.2 (Giọng Nam Thanh Niên 18 Tuổi Thân Thiện)
 */
export const EMOTIONAL_ACTING_DIRECTIONS: Record<GeminiVoiceTone, string> = {
  HOOK_INTRIGUE: `${YOUTH_18_FRIENDLY_PERSONA} Sắc thái tò mò, háo hức mở đầu câu chuyện, lên giọng tự nhiên ở cuối câu hỏi. Chỉ đọc đúng nội dung văn bản, không đọc thêm lời dẫn.`,
  CALM_STORY: `${YOUTH_18_FRIENDLY_PERSONA} Sắc thái thân thiện, kể chuyện bình thường, gần gũi và nhấn nhá nhẹ nhàng. Chỉ đọc đúng nội dung văn bản.`,
  STEP_BY_STEP_SUSPENSE: `${YOUTH_18_FRIENDLY_PERSONA} Sắc thái tò mò, hồi hộp từng nhịp, dừng ngắn tự nhiên ở dấu ba chấm để tạo cảm giác bất ngờ. Chỉ đọc đúng nội dung văn bản.`,
  TENSE_CLIMAX: `${YOUTH_18_FRIENDLY_PERSONA} Sắc thái BẤT NGỜ, dồn dập và kịch tính, lên giọng nhấn mạnh rõ rệt các từ khóa cao trào và cảnh báo nguy hiểm. Chỉ đọc đúng nội dung văn bản.`,
  SLOW_EMOTIONAL: `${YOUTH_18_FRIENDLY_PERSONA} Sắc thái chân thành, ấm áp, khuyên nhủ rõ ràng và nhấn mạnh thông điệp an toàn ở cuối câu. Chỉ đọc đúng nội dung văn bản.`,
  CHAPTER_ANNOUNCE: `${YOUTH_18_FRIENDLY_PERSONA} Sắc thái rõ ràng, chân thành, nhấn mạnh cột mốc chuyển cảnh. Chỉ đọc đúng nội dung văn bản.`,
};

/**
 * Bảng chỉnh phát âm chỉ dành riêng cho Edge-TTS fallback (KHÔNG thay đổi phụ đề hiển thị)
 */
export const TTS_PRONUNCIATION_MAP: Record<string, string> = {
  "đèn pin": "đèn bin",
};

export function applyEdgeTtsPronunciationMap(text: string): string {
  let out = text;
  for (const [rawTerm, phoneticTerm] of Object.entries(TTS_PRONUNCIATION_MAP)) {
    const escaped = rawTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    out = out.replace(regex, (matched) => {
      if (matched === matched.toUpperCase()) return phoneticTerm.toUpperCase();
      if (matched[0] === matched[0].toUpperCase()) {
        return phoneticTerm[0].toUpperCase() + phoneticTerm.slice(1);
      }
      return phoneticTerm;
    });
  }
  return out;
}

/**
 * Tự động đọc GEMINI_API_KEY từ tham số truyền vào, process.env hoặc các file .env.local / .env
 */
export function resolveGeminiApiKey(explicitKey?: string): string {
  if (explicitKey && explicitKey.trim()) {
    return explicitKey.trim();
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }

  const cwd = process.cwd();
  const candidateFiles = [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
    path.join(cwd, "web-studio", ".env.local"),
    path.join(cwd, "web-studio", ".env"),
    path.resolve(cwd, "..", ".env.local"),
    path.resolve(cwd, "..", ".env"),
  ];

  for (const envPath of candidateFiles) {
    try {
      if (!fs.existsSync(envPath)) continue;
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
      if (match && match[1]) {
        const cleaned = match[1].replace(/^["']|["']$/g, "").trim();
        if (cleaned) return cleaned;
      }
    } catch {
      // Bỏ qua file không đọc được
    }
  }
  return "";
}

function resolvePersistentCacheRoot(): string {
  const cwd = process.cwd();
  const base = path.basename(cwd).toLowerCase() === "web-studio" ? path.resolve(cwd, "..") : cwd;
  return path.join(base, ".tts-cache");
}

export const GEMINI_TTS_CACHE_DIR = path.join(resolvePersistentCacheRoot(), "v11_2_gemini_puck_115x_cache");
export const VIENEU_TTS_CACHE_DIR = path.join(resolvePersistentCacheRoot(), "v11_3_vieneu_local_cache");
export const FREE_TIER_SPACING_MS = 21000; // V11.3: Giãn cách an toàn 21s giữa các beat chưa có cache (tuân thủ chặt 3 RPM Free Tier)
export const RETRY_429_BACKOFF_MS: readonly number[] = [25000, 45000, 65000, 85000]; // V11.3: Retry tối đa 4 lần (25s -> 45s -> 65s -> 85s)
const MAX_429_RETRIES = RETRY_429_BACKOFF_MS.length;

let lastGeminiApiCallTimestampMs = 0;

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function measureAudioDurationFfprobe(filePath: string): number {
  const safePath = filePath.replace(/\\/g, "/");
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${safePath}"`,
    { stdio: ["ignore", "pipe", "pipe"] }
  )
    .toString()
    .trim();
  const parsed = parseFloat(out);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`ffprobe trả về thời lượng không hợp lệ (${out}) cho ${safePath}`);
  }
  return parsed;
}

export function clearGeminiTtsCache(): void {
  try {
    if (fs.existsSync(GEMINI_TTS_CACHE_DIR)) {
      fs.rmSync(GEMINI_TTS_CACHE_DIR, { recursive: true, force: true });
    }
  } catch {
    // Bỏ qua nếu thư mục đang bận
  }
}

export interface GeminiTtsBeatOptions {
  text: string;
  voiceTone?: GeminiVoiceTone;
  voiceName?: GeminiPrebuiltVoiceName;
  apiKey?: string;
  cacheDir?: string;
  bypassCache?: boolean;
}

export interface GeminiTtsBeatResult {
  mp3Buffer: Buffer;
  audioUrl: string;
  actualDurationSec: number;
  totalDurationMs: number;
  totalDurationFrames: number;
  voiceName: GeminiPrebuiltVoiceName;
  fromCache: boolean;
  engine: "GEMINI_TTS";
}

export interface GeminiTtsAttemptOutcome {
  ok: boolean;
  result?: GeminiTtsBeatResult;
  errorReason?: string;
  httpStatus?: number;
}

/**
 * Tổng hợp 1 phân cảnh (beat) bằng Gemini 2.5 Flash Preview TTS:
 * - Tôn trọng cache theo hash (text + voiceTone + voiceName)
 * - Tự động giãn cách 3000ms giữa các request thật để bảo vệ Free Tier
 * - Retry tối đa 2 lần (chờ 8000ms mỗi lần) khi gặp HTTP 429
 * - Chuyển PCM 24kHz mono -> MP3 192k với highpass=80 + loudnorm + 0.3s lead-in và đo chuẩn bằng ffprobe
 */
export async function synthesizeGeminiTtsBeat(
  options: GeminiTtsBeatOptions
): Promise<GeminiTtsAttemptOutcome> {
  const text = (options.text || "").trim();
  if (!text) {
    return { ok: false, errorReason: "Empty narration text" };
  }

  const voiceTone: GeminiVoiceTone = options.voiceTone || "CALM_STORY";
  const voiceName: GeminiPrebuiltVoiceName = options.voiceName || DEFAULT_GEMINI_TTS_VOICE;
  const cacheDir = options.cacheDir || GEMINI_TTS_CACHE_DIR;
  fs.mkdirSync(cacheDir, { recursive: true });

  const cacheHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ v: "v11_2_puck_115x", tempo: GEMINI_TTS_TEMPO, text, voiceTone, voiceName }))
    .digest("hex")
    .slice(0, 28);
  const cachedMp3Path = path.join(cacheDir, `${cacheHash}.mp3`);

  if (!options.bypassCache && fs.existsSync(cachedMp3Path) && fs.statSync(cachedMp3Path).size > 500) {
    try {
      const actualDurationSec = measureAudioDurationFfprobe(cachedMp3Path);
      const speechOnlySec = Math.max(0, actualDurationSec - GEMINI_TTS_LEAD_IN_MS / 1000);
      const totalDurationFrames =
        GEMINI_TTS_LEAD_IN_FRAMES + Math.ceil(speechOnlySec * 60) + GEMINI_TTS_TAIL_HOLD_FRAMES;
      const mp3Buffer = fs.readFileSync(cachedMp3Path);
      return {
        ok: true,
        result: {
          mp3Buffer,
          audioUrl: `data:audio/mp3;base64,${mp3Buffer.toString("base64")}`,
          actualDurationSec,
          totalDurationMs: Math.round(actualDurationSec * 1000),
          totalDurationFrames,
          voiceName,
          fromCache: true,
          engine: "GEMINI_TTS",
        },
      };
    } catch {
      // File cache bị hỏng -> gọi API tạo lại
    }
  }

  const apiKey = resolveGeminiApiKey(options.apiKey);
  if (!apiKey) {
    return { ok: false, errorReason: "Thiếu GEMINI_API_KEY (fallback sang Edge-TTS)" };
  }

  const directionPrompt =
    EMOTIONAL_ACTING_DIRECTIONS[voiceTone] || EMOTIONAL_ACTING_DIRECTIONS.CALM_STORY;
  const fullPrompt = `${directionPrompt}\n\nNội dung cần đọc:\n${text}`;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  let pcmBase64: string | null = null;
  let lastHttpStatus: number | undefined;
  let lastErrorReason = "Unknown Gemini TTS error";

  for (let attempt = 0; attempt <= MAX_429_RETRIES; attempt++) {
    // V11.3: Bảo vệ Free Tier 3 RPM — giãn cách an toàn 21000ms (21s) giữa các lượt gọi API thật (chưa có cache)
    const now = Date.now();
    const elapsedSinceLast = now - lastGeminiApiCallTimestampMs;
    if (lastGeminiApiCallTimestampMs > 0 && elapsedSinceLast < FREE_TIER_SPACING_MS) {
      const waitSpacingMs = FREE_TIER_SPACING_MS - elapsedSinceLast;
      console.log(
        `⏳ Giãn cách an toàn Gemini TTS Free Tier (3 RPM): chờ ${(waitSpacingMs / 1000).toFixed(1)}s trước lượt gọi tiếp theo...`
      );
      await sleepMs(waitSpacingMs);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);
    lastGeminiApiCallTimestampMs = Date.now();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      lastHttpStatus = response.status;

      if (response.status === 429) {
        const errBody = await response.text().catch(() => "");
        const compactErr = errBody.replace(/\s+/g, " ").trim().slice(0, 320);
        const isDailyQuotaExhausted =
          /GenerateRequestsPerDay|requests per day/i.test(errBody);
        const retryMatch = errBody.match(/Please retry in ([^."]+)\./i);
        const retryHint = retryMatch ? ` (reset sau ${retryMatch[1].trim()})` : "";
        lastErrorReason = isDailyQuotaExhausted
          ? `HTTP 429 Hết Quota Ngày Free Tier (RPD)${retryHint}`
          : `HTTP 429 Rate Limit (3 RPM)${compactErr ? `: ${compactErr}` : ""}`;

        // Nếu hết hẳn quota theo NGÀY (RPD, ví dụ 10 req/ngày) -> dừng ngay để báo rõ người dùng, không chờ vô ích
        if (isDailyQuotaExhausted) {
          console.error(`⛔ [GeminiTTS] ${lastErrorReason}`);
          break;
        }

        if (attempt < MAX_429_RETRIES) {
          const retryWaitMs = RETRY_429_BACKOFF_MS[attempt] ?? 65000;
          console.warn(
            `⏳ Đang chờ reset quota Gemini TTS... (${Math.round(retryWaitMs / 1000)}s, lần retry ${attempt + 1}/${MAX_429_RETRIES}) — ${lastErrorReason}`
          );
          await sleepMs(retryWaitMs);
          // Đánh dấu lại mốc gọi sau khi vừa ngủ chờ quota để không bị chờ kép không cần thiết
          lastGeminiApiCallTimestampMs = 0;
          continue;
        }
        break;
      }

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        lastErrorReason = `HTTP ${response.status}: ${errBody.slice(0, 260)}`;
        if (response.status >= 500 && attempt < MAX_429_RETRIES) {
          const retryWaitMs = RETRY_429_BACKOFF_MS[attempt] ?? 25000;
          console.warn(
            `⏳ Đang chờ thử lại Gemini TTS sau lỗi máy chủ HTTP ${response.status} (${Math.round(retryWaitMs / 1000)}s, lần ${attempt + 1}/${MAX_429_RETRIES})...`
          );
          await sleepMs(retryWaitMs);
          lastGeminiApiCallTimestampMs = 0;
          continue;
        }
        break;
      }

      const json: any = await response.json();
      const parts: any[] = json?.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find((p) => p?.inlineData?.data);
      if (!audioPart?.inlineData?.data) {
        lastErrorReason = "Phản hồi Gemini không chứa inlineData audio";
        break;
      }

      pcmBase64 = audioPart.inlineData.data;
      break;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastErrorReason = err?.name === "AbortError" ? "Gemini TTS request timeout (55s)" : err?.message || String(err);
      if (attempt < MAX_429_RETRIES) {
        const retryWaitMs = RETRY_429_BACKOFF_MS[attempt] ?? 25000;
        console.warn(
          `⏳ Đang chờ thử lại Gemini TTS sau lỗi kết nối (${Math.round(retryWaitMs / 1000)}s, lần ${attempt + 1}/${MAX_429_RETRIES}): ${lastErrorReason}`
        );
        await sleepMs(retryWaitMs);
        lastGeminiApiCallTimestampMs = 0;
        continue;
      }
      break;
    }
  }

  if (!pcmBase64) {
    return { ok: false, errorReason: lastErrorReason, httpStatus: lastHttpStatus };
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "v11_1_gemini_pcm_"));
  try {
    const pcmPath = path.join(tempDir, "input.pcm");
    const speechMp3Path = path.join(tempDir, "speech_norm.mp3");
    const finalLeadInMp3Path = path.join(tempDir, "final_with_leadin.mp3");

    const pcmBuffer = Buffer.from(pcmBase64, "base64");
    if (pcmBuffer.length < 320) {
      return { ok: false, errorReason: "Dữ liệu PCM trả về quá ngắn" };
    }
    fs.writeFileSync(pcmPath, pcmBuffer);

    const safePcm = pcmPath.replace(/\\/g, "/");
    const safeSpeechMp3 = speechMp3Path.replace(/\\/g, "/");
    const safeFinalMp3 = finalLeadInMp3Path.replace(/\\/g, "/");

    // 1. V11.2: Chuyển PCM 16-bit signed LE 24kHz mono -> MP3 192k với atempo=1.15 (giữ nguyên cao độ), highpass=85, loudnorm
    execSync(
      `ffmpeg -y -v error -f s16le -ar 24000 -ac 1 -i "${safePcm}" -af "atempo=${GEMINI_TTS_TEMPO},highpass=f=85,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 24000 -ac 1 -b:a 192k "${safeSpeechMp3}"`
    );

    // 2. Chèn đúng 0.3s (18 frames) khoảng thở mở đầu cảnh (lead-in) và xuất MP3 192k
    const leadInSec = (GEMINI_TTS_LEAD_IN_MS / 1000).toFixed(3);
    execSync(
      `ffmpeg -y -v error -i "${safeSpeechMp3}" -filter_complex "anullsrc=r=24000:cl=mono,atrim=duration=${leadInSec}[lead];[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[sp];[lead][sp]concat=n=2:v=0:a=1[outa]" -map "[outa]" -ar 24000 -ac 1 -b:a 192k "${safeFinalMp3}"`
    );

    // 3. Đo lại thời lượng thực tế SAU khi chạy atempo=1.15 bằng ffprobe để khóa đúng frame
    const actualDurationSec = measureAudioDurationFfprobe(finalLeadInMp3Path);
    const speechOnlySec = Math.max(0, actualDurationSec - GEMINI_TTS_LEAD_IN_MS / 1000);
    const totalDurationFrames =
      GEMINI_TTS_LEAD_IN_FRAMES + Math.ceil(speechOnlySec * 60) + GEMINI_TTS_TAIL_HOLD_FRAMES;

    const mp3Buffer = fs.readFileSync(finalLeadInMp3Path);
    fs.writeFileSync(cachedMp3Path, mp3Buffer);

    return {
      ok: true,
      result: {
        mp3Buffer,
        audioUrl: `data:audio/mp3;base64,${mp3Buffer.toString("base64")}`,
        actualDurationSec,
        totalDurationMs: Math.round(actualDurationSec * 1000),
        totalDurationFrames,
        voiceName,
        fromCache: false,
        engine: "GEMINI_TTS",
      },
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Bỏ qua lỗi xóa file tạm
    }
  }
}

export interface VieneuLocalTtsOptions {
  text: string;
  voiceTone?: GeminiVoiceTone;
  voice?: string;
  speed?: number;
  atempo?: number;
  url?: string;
  cacheDir?: string;
  bypassCache?: boolean;
}

export interface VieneuLocalTtsResult {
  mp3Buffer: Buffer;
  audioUrl: string;
  actualDurationSec: number;
  totalDurationMs: number;
  totalDurationFrames: number;
  voiceName: string;
  fromCache: boolean;
  cacheFilePath: string;
  engine: "VIENEU_LOCAL";
}

export interface VieneuLocalTtsOutcome {
  ok: boolean;
  result?: VieneuLocalTtsResult;
  errorReason?: string;
  httpStatus?: number;
}

/**
 * Tùy chọn mở rộng V11.3: Gọi VieNeu-TTS v3 Turbo local server (chuẩn OpenAI Audio Speech API)
 * - URL đọc từ process.env.VIENEU_TTS_URL (mặc định http://127.0.0.1:8000/v1/audio/speech)
 * - Giọng mặc định: "Hải Đăng"
 * - Áp dụng FFmpeg atempo=1.12 (giữ nguyên cao độ), highpass=85, loudnorm + lead-in 0.3s (18f) & đo bằng ffprobe
 * - Lưu cache đĩa SHA-256 vĩnh viễn vào .tts-cache/v11_3_vieneu_local_cache/
 */
export async function synthesizeVieneuLocalTtsBeat(
  options: VieneuLocalTtsOptions
): Promise<VieneuLocalTtsOutcome> {
  const text = (options.text || "").trim();
  if (!text) {
    return { ok: false, errorReason: "Empty narration text" };
  }

  const endpoint = (options.url || process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL).trim();
  const voiceName = (options.voice || process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE).trim();
  const apiSpeed = typeof options.speed === "number" && options.speed > 0 ? options.speed : 1.0;
  const atempo = typeof options.atempo === "number" && options.atempo > 0 ? options.atempo : VIENEU_TTS_ATEMPO;
  const voiceTone: GeminiVoiceTone = options.voiceTone || "CALM_STORY";
  const cacheDir = options.cacheDir || VIENEU_TTS_CACHE_DIR;
  fs.mkdirSync(cacheDir, { recursive: true });

  const cacheHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ v: "v11_3_vieneu_atempo", endpoint, text, voiceTone, voiceName, apiSpeed, atempo }))
    .digest("hex")
    .slice(0, 28);
  const cachedMp3Path = path.join(cacheDir, `${cacheHash}.mp3`);

  if (!options.bypassCache && fs.existsSync(cachedMp3Path) && fs.statSync(cachedMp3Path).size > 500) {
    try {
      const actualDurationSec = measureAudioDurationFfprobe(cachedMp3Path);
      const speechOnlySec = Math.max(0, actualDurationSec - GEMINI_TTS_LEAD_IN_MS / 1000);
      const totalDurationFrames =
        GEMINI_TTS_LEAD_IN_FRAMES + Math.ceil(speechOnlySec * 60) + GEMINI_TTS_TAIL_HOLD_FRAMES;
      const mp3Buffer = fs.readFileSync(cachedMp3Path);
      return {
        ok: true,
        result: {
          mp3Buffer,
          audioUrl: `data:audio/mp3;base64,${mp3Buffer.toString("base64")}`,
          actualDurationSec,
          totalDurationMs: Math.round(actualDurationSec * 1000),
          totalDurationFrames,
          voiceName,
          fromCache: true,
          cacheFilePath: cachedMp3Path,
          engine: "VIENEU_LOCAL",
        },
      };
    } catch {
      // Cache lỗi -> gọi lại local server
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "vieneu-tts",
        input: text,
        voice: voiceName,
        speed: apiSpeed,
        response_format: "wav",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      return {
        ok: false,
        httpStatus: response.status,
        errorReason: `VieNeu Local HTTP ${response.status}: ${errBody.slice(0, 220)}`,
      };
    }

    const rawAudio = Buffer.from(await response.arrayBuffer());
    if (rawAudio.length < 320) {
      return { ok: false, errorReason: "VieNeu Local trả về dữ liệu âm thanh quá ngắn" };
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const isWavMagic =
      rawAudio.length >= 4 &&
      rawAudio[0] === 0x52 &&
      rawAudio[1] === 0x49 &&
      rawAudio[2] === 0x46 &&
      rawAudio[3] === 0x46;
    const rawExt = isWavMagic || contentType.includes("wav") ? "wav" : "mp3";

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "v11_3_vieneu_"));
    try {
      const rawPath = path.join(tempDir, `input.${rawExt}`);
      const normPath = path.join(tempDir, "norm.mp3");
      const finalPath = path.join(tempDir, "final_leadin.mp3");
      fs.writeFileSync(rawPath, rawAudio);

      const safeRaw = rawPath.replace(/\\/g, "/");
      const safeNorm = normPath.replace(/\\/g, "/");
      const safeFinal = finalPath.replace(/\\/g, "/");
      const leadInSec = (GEMINI_TTS_LEAD_IN_MS / 1000).toFixed(3);
      const tempoFilter = Math.abs(atempo - 1.0) > 0.005 ? `atempo=${atempo},` : "";

      execSync(
        `ffmpeg -y -v error -i "${safeRaw}" -af "${tempoFilter}highpass=f=85,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 24000 -ac 1 -b:a 192k "${safeNorm}"`
      );
      execSync(
        `ffmpeg -y -v error -i "${safeNorm}" -filter_complex "anullsrc=r=24000:cl=mono,atrim=duration=${leadInSec}[lead];[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[sp];[lead][sp]concat=n=2:v=0:a=1[outa]" -map "[outa]" -ar 24000 -ac 1 -b:a 192k "${safeFinal}"`
      );

      const actualDurationSec = measureAudioDurationFfprobe(finalPath);
      const speechOnlySec = Math.max(0, actualDurationSec - GEMINI_TTS_LEAD_IN_MS / 1000);
      const totalDurationFrames =
        GEMINI_TTS_LEAD_IN_FRAMES + Math.ceil(speechOnlySec * 60) + GEMINI_TTS_TAIL_HOLD_FRAMES;
      const mp3Buffer = fs.readFileSync(finalPath);
      fs.writeFileSync(cachedMp3Path, mp3Buffer);

      return {
        ok: true,
        result: {
          mp3Buffer,
          audioUrl: `data:audio/mp3;base64,${mp3Buffer.toString("base64")}`,
          actualDurationSec,
          totalDurationMs: Math.round(actualDurationSec * 1000),
          totalDurationFrames,
          voiceName,
          fromCache: false,
          cacheFilePath: cachedMp3Path,
          engine: "VIENEU_LOCAL",
        },
      };
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      errorReason: err?.name === "AbortError" ? "VieNeu Local timeout (90s)" : err?.message || String(err),
    };
  }
}
