import { bundle } from '@remotion/bundler';
import { renderStill, renderFrames, selectComposition, renderMedia, openBrowser } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { WebSocket } from 'ws';
import {
  HYBRID_GPU_CHROMIUM_OPTIONS,
  HYBRID_GPU_RENDER_DEFAULTS,
  detectBestHardwareEncoder,
  renderVideoHybridCpuGpu,
} from '../src/lib/v7/hybridGpuRenderConfig.ts';
import {
  synthesizeGeminiTtsBeat,
  synthesizeVieneuLocalTtsBeat,
  applyEdgeTtsPronunciationMap,
  resolveTtsProvider,
  DEFAULT_GEMINI_TTS_VOICE,
  DEFAULT_VIENEU_TTS_URL,
  DEFAULT_VIENEU_TTS_VOICE,
  VIENEU_TTS_ATEMPO,
  clearGeminiTtsCache,
} from '../src/lib/v7/geminiTtsClient.ts';

const isPreview = process.argv.includes('--preview');
const isStillsOnly = process.argv.includes('--stills-only');
const isVisualStillsOnly = process.argv.includes('--visual-stills-only');
const shouldClearCache = process.argv.includes('--clear-cache');
const GEMINI_VOICE_NAME = process.env.GEMINI_TTS_VOICE || DEFAULT_GEMINI_TTS_VOICE || 'Puck';
const VIENEU_VOICE_NAME = process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE || 'Hải Đăng';
const VIENEU_ATEMPO = Number(process.env.VIENEU_TTS_ATEMPO) || VIENEU_TTS_ATEMPO || 1.12;
const ACTIVE_TTS_PROVIDER = resolveTtsProvider();

const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const workspaceRoot = 'C:/Users/ASUS/Downloads/TOOL_2D_ANIM_API_FIX_1/TOOL_2D_ANIM';
const videoWorkspaceOut = path.join(workspaceRoot, 'out/test_v11_hornet_night.mp4');
const videoArtifactOut = path.join(artifactDir, 'test_v11_hornet_night.mp4');

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const SEC_MS_GEC_VERSION = '1-132.0.2957.140';
const WIN_EPOCH_SECONDS = 11644473600;
const DEFAULT_BARITONE_VOICE = 'vi-VN-NamMinhNeural';

const LEAD_IN_SILENCE_MS = 300; // 0.3s (18 frames) khoảng thở đầu cảnh
const LEAD_IN_FRAMES = 18;
const TAIL_HOLD_FRAMES = 42;    // 0.7s (42 frames) khoảng thở cuối cảnh

const CLAUSE_SILENCE_TRIM_AF =
  'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-46dB:detection=peak,' +
  'areverse,' +
  'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-46dB:detection=peak,' +
  'areverse';

/**
 * Chuỗi FFmpeg Broadcast Baritone Mastering (~125Hz Nam Trầm Ấm Trong Trẻo V10.1/V10.2)
 */
const BARITONE_MASTERING_AF = [
  'highpass=f=85',
  'equalizer=f=135:t=q:w=1.2:g=2.2',
  'equalizer=f=320:t=q:w=1.2:g=-1.5',
  'equalizer=f=3200:t=q:w=1.5:g=2.8',
  'equalizer=f=6800:t=q:w=2.0:g=-3.0',
  'acompressor=threshold=-18dB:ratio=3:attack=10:release=150:makeup=4dB',
  'alimiter=limit=0.95',
].join(',');

/**
 * V10.2: Baritone Calm Storytelling Matrix — Nhịp kể chuyện chậm rãi, có khoảng thở tự nhiên
 */
const VOICE_TONE_PRESETS = {
  HOOK_INTRIGUE: {
    rate: '-2%',
    pitch: '-7Hz',
    volume: '+10%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 420,
    clausePauseMs: 420,
  },
  CALM_STORY: {
    rate: '-2%',
    pitch: '-8Hz',
    volume: '+6%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 380,
    clausePauseMs: 380,
  },
  TENSE_CLIMAX: {
    rate: '+4%',
    pitch: '-5Hz',
    volume: '+12%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 320,
    clausePauseMs: 280,
  },
  SLOW_EMOTIONAL: {
    rate: '-6%',
    pitch: '-9Hz',
    volume: '+6%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 520,
    clausePauseMs: 520,
  },
  STEP_BY_STEP_SUSPENSE: {
    rate: '-6%',
    pitch: '-8Hz',
    volume: '+8%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 480,
    clausePauseMs: 550,
  },
  CHAPTER_ANNOUNCE: {
    rate: '-5%',
    pitch: '-8Hz',
    volume: '+10%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 480,
    clausePauseMs: 480,
  },
};

function generateSecMsGec() {
  const unixSeconds = Math.floor(Date.now() / 1000);
  const winSeconds = unixSeconds + WIN_EPOCH_SECONDS;
  const roundedSeconds = winSeconds - (winSeconds % 300);
  const ticks100ns = BigInt(roundedSeconds) * BigInt(10000000);
  const strToHash = `${ticks100ns.toString()}${TRUSTED_CLIENT_TOKEN}`;
  return crypto.createHash('sha256').update(strToHash, 'ascii').digest('hex').toUpperCase();
}

function escapeSsmlText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function splitTextIntoExpressiveClauses(text, tone) {
  const cleaned = text.trim();
  const rawParts = cleaned
    .split(/(\.\.\.|—|–|\.(?=\s|$)|!(?=\s|$)|\?(?=\s|$))/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const merged = [];
  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (/^(\.\.\.|—|–|\.|!|\?)$/.test(part) && merged.length > 0) {
      merged[merged.length - 1] += part === '—' || part === '–' ? '' : part;
    } else if (!/^(\.\.\.|—|–|\.|!|\?)$/.test(part)) {
      merged.push(part);
    }
  }

  const base = VOICE_TONE_PRESETS[tone] || VOICE_TONE_PRESETS.CALM_STORY;
  const clauses = merged.length > 0 ? merged : [cleaned];

  return clauses.map((cText, idx) => {
    const isQuestion = cText.includes('?');
    const isExclamation = cText.includes('!');
    const isEllipsis = cText.includes('...');
    const isFirst = idx === 0;
    const isLast = idx === clauses.length - 1;

    let rate = base.rate;
    let pitch = base.pitch;
    let volume = base.volume;
    let pauseAfterMs = isLast ? base.pauseAfterMs : base.clausePauseMs;

    if (isQuestion) {
      pitch = '-5Hz';
      rate = '-3%';
      pauseAfterMs = Math.max(pauseAfterMs, 420);
    } else if (isExclamation) {
      rate = '+5%';
      pitch = '-4Hz';
      volume = '+12%';
      pauseAfterMs = Math.max(pauseAfterMs, 300);
    } else if (isEllipsis) {
      rate = '-5%';
      pitch = '-8Hz';
      pauseAfterMs = Math.max(pauseAfterMs, 460);
    } else if (tone === 'STEP_BY_STEP_SUSPENSE') {
      rate = '-6%';
      pitch = '-8Hz';
      pauseAfterMs = Math.max(pauseAfterMs, 520);
    }

    return {
      text: cText,
      rate,
      pitch,
      volume,
      pauseBeforeMs: isFirst ? LEAD_IN_SILENCE_MS : 0,
      pauseAfterMs,
    };
  });
}

function synthesizeEdgeTtsBufferOnce(text, opts) {
  return new Promise((resolve, reject) => {
    const voice = opts.voice || DEFAULT_BARITONE_VOICE;
    const rate = opts.rate || '-2%';
    const pitch = opts.pitch || '-8Hz';
    const volume = opts.volume || '+6%';

    const connectId = crypto.randomUUID().replace(/-/g, '');
    const secMsGec = generateSecMsGec();
    const muid = crypto.randomBytes(16).toString('hex').toUpperCase();
    const wsUrl =
      `wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1` +
      `?Ocp-Apim-Subscription-Key=${TRUSTED_CLIENT_TOKEN}` +
      `&Sec-MS-GEC=${secMsGec}` +
      `&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}` +
      `&ConnectionId=${connectId}`;

    const ws = new WebSocket(wsUrl, {
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.2957.140',
        Cookie: `muid=${muid};`,
      },
    });

    const audioChunks = [];
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ws.terminate();
        reject(new Error('Edge TTS WebSocket timeout'));
      }
    }, 25000);

    ws.on('open', () => {
      const configMsg =
        `X-Timestamp:${new Date().toISOString()}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'true' },
                outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
              },
            },
          },
        });
      ws.send(configMsg);

      const requestId = crypto.randomUUID().replace(/-/g, '');
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${escapeSsmlText(
        text
      )}</prosody></voice></speak>`;
      const ssmlMsg =
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${new Date().toISOString()}\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;
      ws.send(ssmlMsg);
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const sepIdx = buf.indexOf('\r\n\r\n');
        if (sepIdx !== -1) {
          audioChunks.push(buf.subarray(sepIdx + 4));
        } else if (buf.length >= 2) {
          const headerLen = buf.readUInt16BE(0);
          const audioStart = 2 + headerLen;
          if (audioStart < buf.length) {
            audioChunks.push(buf.subarray(audioStart));
          }
        }
      } else if (data.toString('utf8').includes('Path:turn.end')) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          ws.close();
          resolve(Buffer.concat(audioChunks));
        }
      }
    });

    ws.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });

    ws.on('close', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        if (audioChunks.length > 0) {
          resolve(Buffer.concat(audioChunks));
        } else {
          reject(new Error('Edge TTS closed before receiving audio'));
        }
      }
    });
  });
}

const TTS_CACHE_DIR = path.join(os.tmpdir(), 'v11_hornet_namminh_calm_cache');
fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });

function sleepMs(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function synthesizeEdgeTtsBuffer(text, opts) {
  const cacheKey = crypto
    .createHash('sha256')
    .update(JSON.stringify({ v: 'v11_0', text, ...opts }))
    .digest('hex')
    .slice(0, 24);
  const cacheFile = path.join(TTS_CACHE_DIR, `${cacheKey}.mp3`);
  if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 200) {
    return fs.readFileSync(cacheFile);
  }

  let lastErr;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const buf = await synthesizeEdgeTtsBufferOnce(text, opts);
      fs.writeFileSync(cacheFile, buf);
      await sleepMs(220);
      return buf;
    } catch (err) {
      lastErr = err;
      const backoffMs = attempt * 1400;
      console.warn(`Edge-TTS retry ${attempt}/5 (${err.message}), chờ ${backoffMs}ms...`);
      await sleepMs(backoffMs);
    }
  }
  throw lastErr;
}

function measureAudioDurationSecWithFfprobe(filePath) {
  const safePath = filePath.replace(/\\/g, '/');
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${safePath}"`,
    { stdio: ['ignore', 'pipe', 'pipe'] }
  )
    .toString()
    .trim();
  const parsed = parseFloat(out);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`ffprobe returned invalid duration for ${filePath}: "${out}"`);
  }
  return parsed;
}

async function synthesizeExpressiveBeat(text, tone, beatIndex, masterAudioTempDir, voice = DEFAULT_BARITONE_VOICE) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `v11_3_hornet_tts_b${beatIndex}_`));

  try {
    // NHÁNH 1: VIENEU_LOCAL (VieNeu-TTS v3 Turbo local — giọng Hải Đăng + FFmpeg atempo=1.12)
    if (ACTIVE_TTS_PROVIDER === 'VIENEU_LOCAL') {
      const vieneuAttempt = await synthesizeVieneuLocalTtsBeat({
        text,
        voiceTone: tone,
        voice: VIENEU_VOICE_NAME,
        atempo: VIENEU_ATEMPO,
        url: process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL,
      });
      if (!vieneuAttempt.ok || !vieneuAttempt.result) {
        throw new Error(
          `[Strict Single-Voice Lock] Beat #${beatIndex} thất bại với VIENEU_LOCAL (${vieneuAttempt.errorReason}). Cấm trộn fallback Edge-TTS!`
        );
      }
      const vr = vieneuAttempt.result;
      const vieneuMp3Path = path.join(tempDir, `beat_${beatIndex}_vieneu.mp3`);
      fs.writeFileSync(vieneuMp3Path, vr.mp3Buffer);

      const beatTargetSec = vr.totalDurationFrames / 60;
      const padTailSec = Math.max(0.01, beatTargetSec - vr.actualDurationSec);
      const paddedBeatPath = path.join(masterAudioTempDir, `beat_padded_${beatIndex}.wav`);
      execSync(
        `ffmpeg -y -v error -i "${vieneuMp3Path.replace(
          /\\/g,
          '/'
        )}" -filter_complex "[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[a0];anullsrc=r=24000:cl=mono,atrim=duration=${padTailSec.toFixed(
          4
        )}[sil];[a0][sil]concat=n=2:v=0:a=1,atrim=0:${beatTargetSec.toFixed(
          4
        )}[outa]" -map "[outa]" -ar 24000 -ac 1 "${paddedBeatPath.replace(/\\/g, '/')}"`
      );
      return {
        audioUrl: vr.audioUrl,
        paddedBeatPath,
        actualDurationSec: vr.actualDurationSec,
        totalDurationMs: vr.totalDurationMs,
        totalDurationFrames: vr.totalDurationFrames,
        clauseCount: 1,
        engine: `VIENEU_LOCAL (${vr.voiceName}${vr.fromCache ? ', cache' : ''})`,
      };
    }

    // NHÁNH 2 (MẶC ĐỊNH KHI CÓ GEMINI_API_KEY): Strict Single-Voice Lock cho Gemini 2.5 Flash Preview TTS ("Puck" 1.15x)
    // TUYỆT ĐỐI CẤM fallback từng beat lẻ sang Edge-TTS khi gặp HTTP 429!
    if (ACTIVE_TTS_PROVIDER === 'GEMINI_TTS') {
      const geminiAttempt = await synthesizeGeminiTtsBeat({
        text,
        voiceTone: tone,
        voiceName: GEMINI_VOICE_NAME,
      });

      if (!geminiAttempt.ok || !geminiAttempt.result) {
        throw new Error(
          `[Strict Single-Voice Lock] Beat #${beatIndex} thất bại sau 4 lần retry Gemini TTS (${GEMINI_VOICE_NAME}): ${geminiAttempt.errorReason}. Đã dừng render để KHÔNG trộn lẫn giọng Edge-TTS!`
        );
      }

      const gr = geminiAttempt.result;
      const geminiMp3Path = path.join(tempDir, `beat_${beatIndex}_gemini.mp3`);
      fs.writeFileSync(geminiMp3Path, gr.mp3Buffer);

      const beatTargetSec = gr.totalDurationFrames / 60;
      const padTailSec = Math.max(0.01, beatTargetSec - gr.actualDurationSec);
      const paddedBeatPath = path.join(masterAudioTempDir, `beat_padded_${beatIndex}.wav`);
      execSync(
        `ffmpeg -y -v error -i "${geminiMp3Path.replace(
          /\\/g,
          '/'
        )}" -filter_complex "[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[a0];anullsrc=r=24000:cl=mono,atrim=duration=${padTailSec.toFixed(
          4
        )}[sil];[a0][sil]concat=n=2:v=0:a=1,atrim=0:${beatTargetSec.toFixed(
          4
        )}[outa]" -map "[outa]" -ar 24000 -ac 1 "${paddedBeatPath.replace(/\\/g, '/')}"`
      );

      return {
        audioUrl: gr.audioUrl,
        paddedBeatPath,
        actualDurationSec: gr.actualDurationSec,
        totalDurationMs: gr.totalDurationMs,
        totalDurationFrames: gr.totalDurationFrames,
        clauseCount: 1,
        engine: `GEMINI_TTS (${gr.voiceName}${gr.fromCache ? ', cache' : ''})`,
      };
    }

    // NHÁNH 3: Chỉ dùng Edge-TTS đồng nhất cho 100% cả video khi không có GEMINI_API_KEY hoặc chọn TTS_PROVIDER=EDGE_TTS
    const clauses = splitTextIntoExpressiveClauses(text, tone);
    const clauseEntries = [];
    for (let i = 0; i < clauses.length; i++) {
      const cl = clauses[i];
      const spokenTextForEdge = applyEdgeTtsPronunciationMap(cl.text);
      const buf = await synthesizeEdgeTtsBuffer(spokenTextForEdge, {
        voice,
        rate: cl.rate,
        pitch: cl.pitch,
        volume: cl.volume,
      });
      const rawPath = path.join(tempDir, `clause_${i}_raw.mp3`);
      const trimmedPath = path.join(tempDir, `clause_${i}_trim.mp3`);
      fs.writeFileSync(rawPath, buf);

      execSync(
        `ffmpeg -y -v error -i "${rawPath.replace(/\\/g, '/')}" -af "${CLAUSE_SILENCE_TRIM_AF}" -ar 24000 -ac 1 -b:a 96k "${trimmedPath.replace(
          /\\/g,
          '/'
        )}"`
      );
      const trimmedExists = fs.existsSync(trimmedPath) && fs.statSync(trimmedPath).size > 200;
      clauseEntries.push({
        filePath: trimmedExists ? trimmedPath : rawPath,
        pauseBeforeMs: cl.pauseBeforeMs,
        pauseAfterMs: cl.pauseAfterMs,
      });
    }

    const concatRawPath = path.join(tempDir, `beat_${beatIndex}_concat.mp3`);
    const finalBeatAudioPath = path.join(tempDir, `beat_${beatIndex}_final.mp3`);

    const inputsArg = clauseEntries
      .map((entry) => `-i "${entry.filePath.replace(/\\/g, '/')}"`)
      .join(' ');
    const filterSteps = [];
    const concatRefs = [];

    for (let i = 0; i < clauseEntries.length; i++) {
      const entry = clauseEntries[i];
      if (i === 0 && entry.pauseBeforeMs > 0) {
        const leadSec = (entry.pauseBeforeMs / 1000).toFixed(3);
        filterSteps.push(`anullsrc=r=24000:cl=mono,atrim=duration=${leadSec}[lead${i}]`);
        concatRefs.push(`[lead${i}]`);
      }
      filterSteps.push(`[${i}:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[a${i}]`);
      concatRefs.push(`[a${i}]`);
      if (i < clauseEntries.length - 1 && entry.pauseAfterMs > 0) {
        const pauseSec = (entry.pauseAfterMs / 1000).toFixed(3);
        filterSteps.push(`anullsrc=r=24000:cl=mono,atrim=duration=${pauseSec}[sil${i}]`);
        concatRefs.push(`[sil${i}]`);
      }
    }

    const filterGraph = `${filterSteps.join(';')};${concatRefs.join('')}concat=n=${concatRefs.length}:v=0:a=1[outa]`;
    const safeConcatPath = concatRawPath.replace(/\\/g, '/');
    const safeFinalPath = finalBeatAudioPath.replace(/\\/g, '/');

    execSync(
      `ffmpeg -y -v error ${inputsArg} -filter_complex "${filterGraph}" -map "[outa]" -ar 24000 -ac 1 -b:a 96k "${safeConcatPath}"`
    );

    execSync(
      `ffmpeg -y -v error -i "${safeConcatPath}" -af "${BARITONE_MASTERING_AF}" -ar 24000 -ac 1 -b:a 96k "${safeFinalPath}"`
    );

    const actualDurationSec = measureAudioDurationSecWithFfprobe(finalBeatAudioPath);
    const speechOnlySec = Math.max(0, actualDurationSec - LEAD_IN_SILENCE_MS / 1000);
    const durationFrames = LEAD_IN_FRAMES + Math.ceil(speechOnlySec * 60) + TAIL_HOLD_FRAMES;
    const finalBuffer = fs.readFileSync(finalBeatAudioPath);

    const beatTargetSec = durationFrames / 60;
    const padTailSec = Math.max(0.01, beatTargetSec - actualDurationSec);
    const paddedBeatPath = path.join(masterAudioTempDir, `beat_padded_${beatIndex}.wav`);
    execSync(
      `ffmpeg -y -v error -i "${safeFinalPath}" -filter_complex "[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[a0];anullsrc=r=24000:cl=mono,atrim=duration=${padTailSec.toFixed(
        4
      )}[sil];[a0][sil]concat=n=2:v=0:a=1,atrim=0:${beatTargetSec.toFixed(4)}[outa]" -map "[outa]" -ar 24000 -ac 1 "${paddedBeatPath.replace(
        /\\/g,
        '/'
      )}"`
    );

    return {
      audioUrl: `data:audio/mp3;base64,${finalBuffer.toString('base64')}`,
      paddedBeatPath,
      actualDurationSec,
      totalDurationMs: Math.round(actualDurationSec * 1000),
      totalDurationFrames: durationFrames,
      clauseCount: clauses.length,
      engine: `EDGE_TTS (${voice})`,
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  if (shouldClearCache) {
    console.log('-> Đang xóa sạch cache audio cũ (Edge-TTS & Gemini-TTS)...');
    clearGeminiTtsCache();
    try {
      fs.rmSync(TTS_CACHE_DIR, { recursive: true, force: true });
      fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
    } catch {}
  }

  const hwEncoder = detectBestHardwareEncoder();
  console.log('=== BẮT ĐẦU QUY TRÌNH RENDER V11.3: ONG BẮP CÀY BAN ĐÊM + STRICT SINGLE-VOICE LOCK ===');
  console.log(
    `-> Chế độ: ${isPreview ? 'PREVIEW (720p @ 30fps)' : 'PRODUCTION (1080p @ 60fps)'} | TTS Provider (Khóa Cứng 100%): ${ACTIVE_TTS_PROVIDER} (${
      ACTIVE_TTS_PROVIDER === 'GEMINI_TTS'
        ? `${GEMINI_VOICE_NAME} 1.15x`
        : ACTIVE_TTS_PROVIDER === 'VIENEU_LOCAL'
        ? `${VIENEU_VOICE_NAME} atempo=${VIENEU_ATEMPO} @ ${process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL}`
        : DEFAULT_BARITONE_VOICE
    }) | Chromium GL: "${
      HYBRID_GPU_CHROMIUM_OPTIONS.gl
    }" | Concurrency: ${HYBRID_GPU_RENDER_DEFAULTS.concurrency} | Encoder: ${hwEncoder.displayName}`
  );

  fs.mkdirSync(path.dirname(videoWorkspaceOut), { recursive: true });
  fs.mkdirSync(artifactDir, { recursive: true });
  const masterAudioTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'v11_hornet_master_audio_'));

  let browserInstance = null;

  try {
    // Kịch bản 8 phân cảnh V11.0 chuẩn UNIVERSAL_2D_STORYTIME_ENGINE_STANDARD_V10.md + No Fake Metrics V10.3
    const rawBeats = [
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CHAPTER_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'DARK_STUDIO',
        archetype: 'hornet',
        voiceTone: 'HOOK_INTRIGUE',
        sfxType: 'sfx_thud',
        headerTitle: 'CHIẾU ĐÈN PIN VÀO TỔ ONG?',
        narrationText:
          'Điều gì sẽ xảy ra... nếu bạn tò mò rọi thẳng chiếc đèn pin sáng rực vào tổ ong bắp cày lúc nửa đêm?',
        cardProps: {
          darkMode: true,
          subtitle: 'THỬ THÁCH NỬA ĐÊM!',
          highlightWord: 'ĐỪNG BAO GIỜ THỬ!',
          highlightColor: 'red',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'NIGHT_CALM',
        targetSocket: 'HEAD_CENTER',
        floatingHeader: 'NỬA ĐÊM YÊN ẮNG',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_pop',
        headerTitle: 'TỔ ONG NGỦ YÊN BAN ĐÊM',
        narrationText:
          'Ban đêm, cả đàn ong bắp cày đang ngủ yên trong tổ... chỉ có vài con ong lính canh gác ngay cửa ra vào.',
        calloutText: '[ONG LÍNH CANH CỬA]',
        calloutSub: 'Đang ngủ yên trong bóng tối',
        calloutTarget: 'HEAD_CENTER',
        calloutTriggerPhrase: 'ong lính canh gác',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.06],
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'FLASHLIGHT_ALERT',
        targetSocket: 'HEAD_CENTER',
        floatingHeader: 'ÁNH ĐÈN BÁO ĐỘNG!',
        voiceTone: 'STEP_BY_STEP_SUSPENSE',
        sfxType: 'sfx_whoosh',
        headerTitle: 'NGỌN HẢI ĐĂNG BÁO ĐỘNG',
        narrationText:
          'Nhưng ngay khoảnh khắc tia sáng trắng rọi thẳng vào cửa tổ... chiếc đèn pin vô tình biến thành ngọn hải đăng báo động!',
        // V11.3 Minimalist Callout Policy: Đã có chùm đèn pin rọi tổ + chữ nổ CHÓI! -> gỡ bỏ ô comment thừa
        sfxText: 'CHÓI!',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.08],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'TWO_DOORS_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'hornet',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_ding',
        headerTitle: 'PHẢN XẠ BÁO ĐỘNG ĐÊM',
        narrationText:
          'Trong bóng tối, mắt ong gần như mù hoàn toàn... nên cơ thể chúng lập tức khóa chế độ nghỉ ngơi và bật công tắc báo động đỏ.',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          accentTheme: 'DANGER_RED',
          leftDoorTitle: 'BÁO ĐỘNG ĐỎ',
          leftNeutralSub: 'CHẾ ĐỘ CHỜ',
          leftMorphingSub: 'ĐANG KÍCH HOẠT...',
          leftDoorSub: 'KÍCH HOẠT TỐI ĐA',
          rightDoorTitle: 'NGHỈ NGƠI',
          rightNeutralSub: 'ĐANG HOẠT ĐỘNG',
          rightMorphingSub: 'ĐANG KHÓA CHẶT...',
          rightDoorSub: 'TẠM ĐÓNG BĂNG',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'SWARM_BEAM_ATTACK',
        targetSocket: 'HEAD_CENTER',
        floatingHeader: 'LAO DỌC THEO TIA SÁNG!',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_whoosh',
        headerTitle: 'ĐÀN ONG LAO DỌC CHÙM SÁNG',
        narrationText:
          'Tệ hơn nữa... thay vì bay loạn xạ, cả đàn ong sẽ lao thẳng dọc theo chính chùm ánh sáng đèn pin tìm đến tay bạn!',
        // V11.3 Minimalist Callout Policy: Đã có đàn 6 ong lao dọc tia sáng + VÙÙÙ! + Comic Shiver Lines -> gỡ bỏ ô comment thừa
        sfxText: 'VÙÙÙ!',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.07],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'BALANCE_SCALE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'hornet',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_thud',
        headerTitle: 'CÁN CÂN BẢN NĂNG SINH TỒN',
        narrationText:
          'Lúc này, bản năng bảo vệ tổ đã áp đảo hoàn toàn màn đêm — biến chiếc đèn pin thành tấm bia dẫn đường hoàn hảo.',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          leftPanLabel: 'BẢN NĂNG BẢO VỆ TỔ',
          rightPanLabel: 'BÓNG TỐI BAN ĐÊM',
          heavySide: 'left',
        },
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'GAUGE_RESERVE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'hornet',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_tick',
        headerTitle: 'MỨC ĐỘ HUNG HÃN CỦA CẢ ĐÀN',
        narrationText:
          'Chỉ trong vài giây ngắn ngủi... mức độ hung hãn của cả đàn chạm ngưỡng nguy hiểm tột độ!',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          gaugePolarity: 'danger_high_red',
          gaugeFrom: 10,
          gaugeTo: 95,
          gaugeLowLabel: 'YÊN TĨNH',
          gaugeMidLabel: 'CẢNH GIÁC',
          gaugeHighLabel: 'NGUY HIỂM',
          gaugeSafeStatusLabel: 'YÊN TĨNH',
          gaugeWarnStatusLabel: 'CẢNH GIÁC',
          gaugeStatusLabel: 'BÁO ĐỘNG ĐỎ: TẤN CÔNG HÀNG LOẠT',
        },
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CHAPTER_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'DARK_STUDIO',
        archetype: 'hornet',
        voiceTone: 'SLOW_EMOTIONAL',
        sfxType: 'sfx_ding',
        headerTitle: 'TẮT ĐÈN & RỜI ĐI NGAY!',
        narrationText:
          'Vì vậy nếu bắt gặp tổ ong bắp cày vào ban đêm... hãy tắt ngay đèn pin và lặng lẽ rời đi thật xa!',
        cardProps: {
          darkMode: true,
          subtitle: 'QUY TẮC AN TOÀN BAN ĐÊM',
          highlightWord: 'TẮT ĐÈN — RỜI ĐI LẶNG LẼ!',
          highlightColor: 'green',
        },
      },
    ];

    let currentStart = 0;
    const compiledBeats = [];
    const paddedBeatWavFiles = [];
    let primarySuccessCount = 0;
    let otherCount = 0;

    if (isVisualStillsOnly) {
      console.log('1. Chế độ --visual-stills-only: bỏ qua gọi TTS API, dùng thời lượng chuẩn để kiểm tra ảnh tĩnh V11.3...');
      for (let i = 0; i < rawBeats.length; i++) {
        const b = rawBeats[i];
        const estFrames = 360;
        compiledBeats.push({
          ...b,
          type: b.action,
          theme: b.stageTheme,
          startFrame: currentStart,
          durationFrames: estFrames,
          showDebugHud: false,
        });
        currentStart += estFrames;
      }
    } else {
      const activeVoiceBanner =
        ACTIVE_TTS_PROVIDER === 'GEMINI_TTS'
          ? `${GEMINI_VOICE_NAME}, 1.15x`
          : ACTIVE_TTS_PROVIDER === 'VIENEU_LOCAL'
          ? `${VIENEU_VOICE_NAME}, atempo=${VIENEU_ATEMPO}`
          : DEFAULT_BARITONE_VOICE;
      console.log(
        `1. Tổng hợp giọng đọc đồng nhất 100% V11.3 (Strict Single-Voice Lock: ${ACTIVE_TTS_PROVIDER} [${activeVoiceBanner}]) và khóa ffprobe (lead +18f / tail +42f)...`
      );
      for (let i = 0; i < rawBeats.length; i++) {
        const b = rawBeats[i];
        const ttsRes = await synthesizeExpressiveBeat(
          b.narrationText,
          b.voiceTone,
          i + 1,
          masterAudioTempDir,
          DEFAULT_BARITONE_VOICE
        );
        if (ttsRes.engine.startsWith(ACTIVE_TTS_PROVIDER)) primarySuccessCount++;
        else otherCount++;
        paddedBeatWavFiles.push(ttsRes.paddedBeatPath);
        const minReqFrames = Math.ceil(ttsRes.actualDurationSec * 60) + TAIL_HOLD_FRAMES;
        console.log(
          `-> Beat #${i + 1} [${b.cardType} | ${b.voiceTone} | ENGINE: ${ttsRes.engine}]: audio=${ttsRes.actualDurationSec.toFixed(
            3
          )}s (${Math.ceil(ttsRes.actualDurationSec * 60)}f) -> durationFrames=${ttsRes.totalDurationFrames}f (lead+18f/tail+42f OK=${
            ttsRes.totalDurationFrames >= minReqFrames
          })`
        );

        compiledBeats.push({
          ...b,
          type: b.action,
          theme: b.stageTheme,
          startFrame: currentStart,
          durationFrames: ttsRes.totalDurationFrames,
          audioUrl: ttsRes.audioUrl,
          audioDurationMs: ttsRes.totalDurationMs,
          showDebugHud: false,
        });
        currentStart += ttsRes.totalDurationFrames;
      }
      console.log(
        `=> Tổng kết TTS V11.3 (Strict Single-Voice Lock): ${ACTIVE_TTS_PROVIDER} (${activeVoiceBanner})=${primarySuccessCount}/${rawBeats.length} | OTHER=${otherCount}/${rawBeats.length}`
      );
    }

    const masterAudioPath = path.join(masterAudioTempDir, 'master_audio.wav');
    if (!isVisualStillsOnly) {
      const audioInputsArg = paddedBeatWavFiles.map((f) => `-i "${f.replace(/\\/g, '/')}"`).join(' ');
      const audioConcatRefs = paddedBeatWavFiles.map((_, idx) => `[${idx}:a]`).join('');
      execSync(
        `ffmpeg -y -v error ${audioInputsArg} -filter_complex "${audioConcatRefs}concat=n=${paddedBeatWavFiles.length}:v=0:a=1[outa]" -map "[outa]" -ar 24000 -ac 1 "${masterAudioPath.replace(
          /\\/g,
          '/'
        )}"`
      );
    }

    const v11Payload = {
      title: 'Điều Gì Xảy Ra Nếu Chiếu Đèn Pin Vào Tổ Ong Bắp Cày Ban Đêm? (V11.0)',
      totalDurationFrames: currentStart,
      fps: 60,
      beats: compiledBeats,
      showDebugHud: false,
    };

    console.log(`Tổng thời lượng phim V11.0: ${currentStart} frames (${(currentStart / 60).toFixed(2)}s).`);

    console.log('2. Bundling Remotion project...');
    const entryPoint = path.resolve(workspaceRoot, 'web-studio/src/remotion/index.ts');
    const bundleLocation = await bundle({
      entryPoint,
      onProgress: (p) => {
        if (p % 25 === 0) console.log(`Bundling: ${p}%`);
      },
    });

    console.log('3. Khởi chạy Chromium GPU ANGLE (dùng chung cho Stills & Video)...');
    browserInstance = await openBrowser('chrome', {
      chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'V7MovieComposition',
      puppeteerInstance: browserInstance,
      inputProps: {
        payload: v11Payload,
        showDebugHud: false,
      },
    });
    console.log(`Composition ready: ${composition.id} (${composition.width}x${composition.height}, ${composition.durationInFrames} frames)`);

    // 4. Xuất 3 ảnh kiểm chứng bắt buộc V11.2 (chọn đúng khung hình nằm trong cửa sổ Speech-Synced Timed Callout)
    const getBeatFrame = (beatIdx, ratio = 0.5) => {
      const beat = compiledBeats[beatIdx];
      return beat.startFrame + Math.floor(beat.durationFrames * ratio);
    };
    const getSyncedCalloutFrame = (beatIdx, offsetAfterAppear = 36) => {
      const beat = compiledBeats[beatIdx];
      const speechFrames = Math.max(60, beat.durationFrames - LEAD_IN_FRAMES - TAIL_HOLD_FRAMES);
      const normText = (beat.narrationText || '').toLowerCase();
      const normPhrase = (beat.calloutTriggerPhrase || '').trim().toLowerCase();
      const idx = normPhrase ? normText.indexOf(normPhrase) : -1;
      const ratio = idx >= 0 ? idx / Math.max(1, normText.length) : 0.25;
      const rawAppear = Math.max(LEAD_IN_FRAMES, LEAD_IN_FRAMES + Math.round(ratio * speechFrames) - 8);
      const appearFrame = Math.min(rawAppear, Math.max(LEAD_IN_FRAMES, beat.durationFrames - 66));
      const disappearFrame = Math.min(beat.durationFrames - 18, appearFrame + 144);
      const targetLocal = Math.min(disappearFrame - 20, appearFrame + offsetAfterAppear);
      return beat.startFrame + targetLocal;
    };

    const stillsToRender = [
      {
        frame: getSyncedCalloutFrame(1, 34),
        name: 'still_v11_3_beat2_callout.jpg',
        desc: 'Beat 2 (V11.3): Giữ nguyên ô comment [ONG LÍNH CANH CỬA] nảy khớp thoại + 3 ong lính tỉ lệ chuẩn sát cửa tổ',
      },
      {
        frame: getBeatFrame(2, 0.52),
        name: 'still_v11_3_beat3_clean_stage.jpg',
        desc: 'Beat 3 (V11.3): Khung hình điện ảnh thoáng sạch (đã gỡ ô comment thừa) — chỉ chùm đèn pin rọi tổ + chữ nổ CHÓI!',
      },
      {
        frame: getBeatFrame(4, 0.56),
        name: 'still_v11_3_beat5_comic_shiver.jpg',
        desc: 'Beat 5 (V11.3): Khung hình thoáng sạch (đã gỡ ô comment thừa) + 6 ong lao dọc chùm sáng + VÙÙÙ! + Comic Shiver Lines hai bên đầu & vai Tèo',
      },
    ];

    console.log(`4. Rendering ${stillsToRender.length} V11.3 verification stills via GPU ANGLE...`);
    for (const item of stillsToRender) {
      const artifactPath = path.join(artifactDir, item.name);
      const outPath = path.join(workspaceRoot, 'out', item.name);
      console.log(`Rendering frame ${item.frame} (${item.desc}) -> ${item.name}...`);
      await renderStill({
        composition,
        serveUrl: bundleLocation,
        output: artifactPath,
        frame: item.frame,
        imageFormat: 'jpeg',
        jpegQuality: HYBRID_GPU_RENDER_DEFAULTS.jpegQuality,
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
        puppeteerInstance: browserInstance,
        inputProps: {
          payload: v11Payload,
          showDebugHud: false,
        },
      });
      fs.copyFileSync(artifactPath, outPath);
    }

    if (isStillsOnly || isVisualStillsOnly) {
      console.log('=== HOÀN TẤT KẾT XUẤT ẢNH STILL KIỂM CHỨNG V11.3 ===');
      return;
    }

    // 5. Render Full MP4 qua module dùng chung hybridGpuRenderConfig.ts (CPU + GPU Intel Iris Xe ~70%)
    console.log('5. Rendering full video out/test_v11_hornet_night.mp4...');
    const summary = await renderVideoHybridCpuGpu({
      composition,
      serveUrl: bundleLocation,
      inputProps: {
        payload: v11Payload,
        showDebugHud: false,
      },
      masterAudioPath,
      outputPath: videoWorkspaceOut,
      isPreview,
      concurrency: HYBRID_GPU_RENDER_DEFAULTS.concurrency,
      jpegQuality: HYBRID_GPU_RENDER_DEFAULTS.jpegQuality,
      tempDirPrefix: 'v11_hornet_gpu_frames_',
      renderFrames,
      renderMedia,
      puppeteerInstance: browserInstance,
    });

    fs.copyFileSync(videoWorkspaceOut, videoArtifactOut);
    const outMp4DurationSec = measureAudioDurationSecWithFfprobe(videoWorkspaceOut);
    console.log(
      `Rendered V11.0 Hornet MP4 in ${summary.elapsedSec}s | Encoder: ${summary.encoderInfo.displayName} | Size: ${(
        summary.sizeBytes /
        1024 /
        1024
      ).toFixed(2)} MB`
    );
    console.log(`ffprobe final MP4 duration: ${outMp4DurationSec.toFixed(3)}s (expected ${(currentStart / 60).toFixed(3)}s)`);
    console.log('=== HOÀN TẤT RENDER V11.0 HORNET NIGHT EXPLAINER ===');
  } finally {
    if (browserInstance) {
      try {
        await browserInstance.close({ silent: true });
      } catch {}
    }
    try {
      fs.rmSync(masterAudioTempDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error('Fatal V11.0 render error:', err);
  process.exit(1);
});
