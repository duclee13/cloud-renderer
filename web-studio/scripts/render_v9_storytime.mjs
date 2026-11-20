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

const isPreview = process.argv.includes('--preview');
const isStillsOnly = process.argv.includes('--stills-only');
const renderScale = isPreview ? 1280 / 1920 : 1.0; // 720p (0.6667) khi có --preview, 1080p (1.0) khi xuất bản chuẩn
const everyNthFrame = isPreview ? 2 : 1; // 30fps khi có --preview, 60fps khi xuất bản chuẩn
const effectiveFps = isPreview ? 30 : 60;

const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const workspaceRoot = 'C:/Users/ASUS/Downloads/TOOL_2D_ANIM_API_FIX_1/TOOL_2D_ANIM';
const videoWorkspaceOut = path.join(workspaceRoot, 'out/test_v9_storytime_explainer.mp4');
const videoArtifactOut = path.join(artifactDir, 'test_v9_storytime_explainer.mp4');

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const SEC_MS_GEC_VERSION = '1-132.0.2957.140';
const WIN_EPOCH_SECONDS = 11644473600;
const DEFAULT_BARITONE_VOICE = 'vi-VN-NamMinhNeural';

/**
 * Cấu hình Render Hybrid V11.0 (CPU + GPU Intel Iris Xe ~70%) dùng chung từ hybridGpuRenderConfig.ts
 */
const HYBRID_CHROMIUM_OPTIONS = HYBRID_GPU_CHROMIUM_OPTIONS;
const HYBRID_CONCURRENCY = HYBRID_GPU_RENDER_DEFAULTS.concurrency;
const HYBRID_JPEG_QUALITY = HYBRID_GPU_RENDER_DEFAULTS.jpegQuality;

const LEAD_IN_SILENCE_MS = 300; // 0.3s (18 frames) khoảng thở đầu cảnh
const LEAD_IN_FRAMES = 18;
const TAIL_HOLD_FRAMES = 42;    // 0.7s (42 frames) khoảng thở cuối cảnh

/**
 * V10.2: Nới lỏng silenceremove (-46dB / 0.05s) để chỉ cắt khoảng lặng thừa quá dài của Edge-TTS
 * mà không cắt sát rạt làm dính chữ giữa các vế câu
 */
const CLAUSE_SILENCE_TRIM_AF =
  'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-46dB:detection=peak,' +
  'areverse,' +
  'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-46dB:detection=peak,' +
  'areverse';

/**
 * V10.1/V10.2: Chuỗi filter FFmpeg Mastering Giọng Nam Trầm Ấm Trong Trẻo (Không ồm, Low/Mid ~ 1.8-2.2)
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

/**
 * V10.2: Baritone Calm Storytelling Matrix — Nhịp kể chuyện chậm rãi, từ tốn, có khoảng thở tự nhiên
 */
const VOICE_TONE_PRESETS = {
  HOOK_INTRIGUE: {
    rate: '-2%',
    pitch: '-7Hz',
    volume: '+10%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 420,
    clausePauseMs: 420,
    playbackRate: 1.0,
  },
  CALM_STORY: {
    rate: '-2%',
    pitch: '-8Hz',
    volume: '+6%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 380,
    clausePauseMs: 380,
    playbackRate: 1.0,
  },
  TENSE_CLIMAX: {
    rate: '+4%',
    pitch: '-5Hz',
    volume: '+15%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 280,
    clausePauseMs: 280,
    playbackRate: 1.0,
  },
  SLOW_EMOTIONAL: {
    rate: '-6%',
    pitch: '-9Hz',
    volume: '+4%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 520,
    clausePauseMs: 520,
    playbackRate: 1.0,
  },
  STEP_BY_STEP_SUSPENSE: {
    rate: '-6%',
    pitch: '-8Hz',
    volume: '+6%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 550,
    clausePauseMs: 550,
    playbackRate: 1.0,
  },
  CHAPTER_ANNOUNCE: {
    rate: '-5%',
    pitch: '-8Hz',
    volume: '+12%',
    pauseBeforeMs: LEAD_IN_SILENCE_MS,
    pauseAfterMs: 480,
    clausePauseMs: 480,
    playbackRate: 1.0,
  },
};

function adjustPercent(baseStr, delta) {
  const val = parseFloat(baseStr.replace('%', '')) || 0;
  const next = Math.max(-35, Math.min(35, Math.round(val + delta)));
  return `${next >= 0 ? '+' : ''}${next}%`;
}

function adjustHz(baseStr, delta) {
  const val = parseFloat(baseStr.replace('Hz', '')) || 0;
  const next = Math.max(-18, Math.min(18, Math.round(val + delta)));
  return `${next >= 0 ? '+' : ''}${next}Hz`;
}

function countWords(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Tách câu thành các mệnh đề tự nhiên (không băm vụn câu ngắn)
 */
function splitIntoBreathClauses(rawText, tone = 'CALM_STORY') {
  const preset = VOICE_TONE_PRESETS[tone] || VOICE_TONE_PRESETS.CALM_STORY;
  const normalized = rawText.trim().replace(/\.{3,}/g, '…').replace(/\s+-\s+/g, ' — ');
  const rawTokens = normalized
    .split(/(…|—|(?<=[.!?])\s+)/)
    .map((s) => s.trim())
    .filter(Boolean);

  const mergedSegments = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];
    if (tok === '…' || tok === '—') {
      continue;
    }
    const commaParts = tok.split(/,\s+/).map((s) => s.trim()).filter(Boolean);
    if (commaParts.length >= 2) {
      let currentAcc = commaParts[0];
      for (let c = 1; c < commaParts.length; c++) {
        if (countWords(currentAcc) >= 7 && countWords(commaParts[c]) >= 7) {
          mergedSegments.push(currentAcc);
          currentAcc = commaParts[c];
        } else {
          currentAcc = `${currentAcc}, ${commaParts[c]}`;
        }
      }
      mergedSegments.push(currentAcc);
    } else {
      mergedSegments.push(tok);
    }
  }

  const finalSegments = [];
  for (let i = 0; i < mergedSegments.length; i++) {
    const seg = mergedSegments[i];
    if (
      tone !== 'STEP_BY_STEP_SUSPENSE' &&
      finalSegments.length > 0 &&
      countWords(seg) < 4 &&
      !/[!?.]$/.test(finalSegments[finalSegments.length - 1])
    ) {
      finalSegments[finalSegments.length - 1] = `${finalSegments[finalSegments.length - 1]} ${seg}`;
    } else {
      finalSegments.push(seg);
    }
  }

  const clauses = [];
  for (let i = 0; i < finalSegments.length; i++) {
    const subText = finalSegments[i];
    const isVeryLast = i === finalSegments.length - 1;
    const isTrailing = isVeryLast && finalSegments.length > 1;

    clauses.push({
      text: subText,
      rate: isTrailing ? adjustPercent(preset.rate, -2) : preset.rate,
      pitch: isTrailing ? adjustHz(preset.pitch, -1) : preset.pitch,
      volume: preset.volume,
      playbackRate: preset.playbackRate,
      pauseAfterMs: isVeryLast ? preset.pauseAfterMs : preset.clausePauseMs,
    });
  }
  return clauses;
}

const TTS_CACHE_DIR = path.join(os.tmpdir(), 'v10_2_namminh_calm_cache');
fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });

function sleepMs(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function synthesizeClauseAudio(text, voice = DEFAULT_BARITONE_VOICE, rate = '-2%', pitch = '-8Hz', volume = '+6%') {
  const safeVoice =
    !voice || voice === 'vi-VN-HoaiMyNeural' ? DEFAULT_BARITONE_VOICE : voice;

  const cacheKey = crypto
    .createHash('sha256')
    .update(`v10_2|${safeVoice}|${rate}|${pitch}|${volume}|${text}`)
    .digest('hex');
  const cachePath = path.join(TTS_CACHE_DIR, `${cacheKey}.mp3`);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 200) {
    return { buffer: fs.readFileSync(cachePath), source: 'Edge-TTS-NamMinhNeural-Cache' };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      await sleepMs(1400 * attempt);
    } else {
      await sleepMs(220);
    }
    try {
      const edgeRes = await new Promise((resolve, reject) => {
        const secMsGec = generateSecMsGec();
        const connectId = crypto.randomUUID().replace(/-/g, '');
        const muid = crypto.randomBytes(16).toString('hex').toUpperCase();
        const endpoint =
          `wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1` +
          `?Ocp-Apim-Subscription-Key=${TRUSTED_CLIENT_TOKEN}` +
          `&Sec-MS-GEC=${secMsGec}` +
          `&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}` +
          `&ConnectionId=${connectId}`;

        const ws = new WebSocket(endpoint, {
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
        const timer = setTimeout(() => {
          try { ws.close(); } catch {}
          reject(new Error('Edge WS timeout'));
        }, 6500);

        ws.on('open', () => {
          const date = new Date().toISOString();
          ws.send(
            `X-Timestamp:${date}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
              JSON.stringify({
                context: {
                  synthesis: {
                    audio: {
                      metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'true' },
                      outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
                    },
                  },
                },
              })
          );
          const reqId = crypto.randomUUID().replace(/-/g, '');
          const ssml =
            `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>` +
            `<voice name='${safeVoice}'><prosody rate='${rate}' pitch='${pitch}' volume='${volume}'>${escapeSsmlText(
              text
            )}</prosody></voice></speak>`;
          ws.send(`X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${date}\r\nPath:ssml\r\n\r\n${ssml}`);
        });

        ws.on('message', (data, isBinary) => {
          if (isBinary) {
            const buf = Buffer.from(data);
            const idx = buf.indexOf('\r\n\r\n');
            if (idx !== -1) {
              audioChunks.push(buf.subarray(idx + 4));
            } else if (buf.length > 2) {
              const hLen = buf.readUInt16BE(0);
              if (hLen + 2 <= buf.length) audioChunks.push(buf.subarray(hLen + 2));
            }
          } else if (data.toString().includes('Path:turn.end')) {
            clearTimeout(timer);
            try { ws.close(); } catch {}
            const full = Buffer.concat(audioChunks);
            if (full.length < 100) {
              reject(new Error('Empty audio'));
              return;
            }
            resolve({ buffer: full, source: 'Edge-TTS-NamMinhNeural' });
          }
        });

        ws.on('error', (e) => {
          clearTimeout(timer);
          reject(e);
        });
      });
      fs.writeFileSync(cachePath, edgeRes.buffer);
      return edgeRes;
    } catch (err) {
      if (attempt === 4) {
        console.warn(`Edge-TTS retry failed for clause "${text.slice(0, 28)}...":`, err.message);
      }
    }
  }

  throw new Error(`Không thể kết nối Edge-TTS cho giọng nam vi-VN-NamMinhNeural!`);
}

function measureAudioDurationSecWithFfprobe(filePath) {
  const safePath = filePath.replace(/\\/g, '/');
  const probeOut = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${safePath}"`
  )
    .toString()
    .trim();
  const actualDurationSec = parseFloat(probeOut);
  if (!Number.isFinite(actualDurationSec) || actualDurationSec <= 0) {
    throw new Error(`Invalid ffprobe duration: ${probeOut}`);
  }
  return actualDurationSec;
}

/**
 * Tổng hợp các mệnh đề bằng giọng nam trầm ấm vi-VN-NamMinhNeural (~125Hz),
 * xử lý hậu kỳ Broadcast Baritone Mastering bằng FFmpeg và khóa thời lượng bằng ffprobe (+12 frames = 0.2s)
 */
async function synthesizeExpressiveBeat(text, tone, beatIndex, masterAudioTempDir, voice = DEFAULT_BARITONE_VOICE) {
  const preset = VOICE_TONE_PRESETS[tone] || VOICE_TONE_PRESETS.CALM_STORY;
  const clauses = splitIntoBreathClauses(text, tone);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `v9_3_beat_${beatIndex}_`));

  try {
    const clauseFiles = [];
    for (let i = 0; i < clauses.length; i++) {
      const clause = clauses[i];
      const res = await synthesizeClauseAudio(clause.text, voice, clause.rate, clause.pitch, clause.volume);
      const rawFile = path.join(tempDir, `raw_${i}.mp3`);
      const scaledFile = path.join(tempDir, `scaled_${i}.mp3`);
      fs.writeFileSync(rawFile, res.buffer);

      const rateVal = Math.max(0.75, Math.min(1.4, clause.playbackRate || 1.0));
      const safeRawClause = rawFile.replace(/\\/g, '/');
      const safeScaledClause = scaledFile.replace(/\\/g, '/');
      // V10.1: Cắt khoảng lặng thừa đầu/đuôi từng vế câu bằng FFmpeg silenceremove trước khi ghép nối
      execSync(
        `ffmpeg -y -v error -i "${safeRawClause}" -filter:a "aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono,${CLAUSE_SILENCE_TRIM_AF},atempo=${rateVal.toFixed(
          2
        )}" -ar 24000 -ac 1 -b:a 96k "${safeScaledClause}"`
      );

      let actualClauseSec = 0;
      try {
        actualClauseSec = measureAudioDurationSecWithFfprobe(scaledFile);
      } catch {
        execSync(
          `ffmpeg -y -v error -i "${safeRawClause}" -filter:a "aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono,atempo=${rateVal.toFixed(
            2
          )}" -ar 24000 -ac 1 -b:a 96k "${safeScaledClause}"`
        );
        actualClauseSec = measureAudioDurationSecWithFfprobe(scaledFile);
      }
      const isLast = i === clauses.length - 1;
      const pauseAfterSec = isLast ? 0.02 : Math.max(0.24, clause.pauseAfterMs / 1000);
      clauseFiles.push({
        filePath: scaledFile,
        durationSec: actualClauseSec,
        pauseAfterSec,
        text: clause.text,
      });
    }

    const concatRawPath = path.join(tempDir, 'concat_raw.mp3');
    const finalBeatAudioPath = path.join(tempDir, 'final_beat.mp3');
    const safeConcatPath = concatRawPath.replace(/\\/g, '/');
    const safeFinalPath = finalBeatAudioPath.replace(/\\/g, '/');
    const inputsArg = clauseFiles.map((cf) => `-i "${cf.filePath.replace(/\\/g, '/')}"`).join(' ');

    const filterParts = [];
    const concatRefs = [];

    if (preset.pauseBeforeMs > 20) {
      filterParts.push(`anullsrc=r=24000:cl=mono,atrim=duration=${(preset.pauseBeforeMs / 1000).toFixed(3)}[sil_pre]`);
      concatRefs.push('[sil_pre]');
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
      (filterParts.length > 0 ? filterParts.join(';') + ';' : '') +
      `${concatRefs.join('')}concat=n=${concatRefs.length}:v=0:a=1[outa]`;

    execSync(
      `ffmpeg -y -v error ${inputsArg} -filter_complex "${filterGraph}" -map "[outa]" -ar 24000 -ac 1 -b:a 96k "${safeConcatPath}"`
    );

    // Áp dụng FFmpeg Broadcast Baritone Mastering (~125Hz warm chest resonance + presence + limiter)
    execSync(
      `ffmpeg -y -v error -i "${safeConcatPath}" -af "${BARITONE_MASTERING_AF}" -ar 24000 -ac 1 -b:a 96k "${safeFinalPath}"`
    );

    // BẮT BUỘC V10.2: Đo thời lượng thực tế (đã bao gồm 0.3s lead-in = 18f) bằng ffprobe
    // và cộng đúng TAIL_HOLD_FRAMES (+42 frames = 0.7s) khoảng thở cuối cảnh
    const actualDurationSec = measureAudioDurationSecWithFfprobe(finalBeatAudioPath);
    const speechOnlySec = Math.max(0, actualDurationSec - LEAD_IN_SILENCE_MS / 1000);
    const durationFrames = LEAD_IN_FRAMES + Math.ceil(speechOnlySec * 60) + TAIL_HOLD_FRAMES;
    const finalBuffer = fs.readFileSync(finalBeatAudioPath);

    // Lưu bản sao beat audio đã pad chuẩn durationFrames/60 giây để ghép cực nhanh với h264_qsv
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
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  const hwEncoder = detectBestHardwareEncoder();
  console.log('=== BẮT ĐẦU QUY TRÌNH RENDER V11.0 HYBRID (CPU + GPU INTEL IRIS XE ~70%) ===');
  console.log(
    `-> Chế độ: ${isPreview ? 'PREVIEW NHANH (720p @ 30fps)' : 'PRODUCTION (1080p @ 60fps)'} | Chromium GL: "${
      HYBRID_CHROMIUM_OPTIONS.gl
    }" | Concurrency: ${HYBRID_CONCURRENCY} | Encoder: ${hwEncoder.displayName}`
  );

  fs.mkdirSync(path.dirname(videoWorkspaceOut), { recursive: true });
  fs.mkdirSync(artifactDir, { recursive: true });
  const masterAudioTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'v9_3_master_audio_'));

  try {
    // Kịch bản 11 phân cảnh V9.3
    const rawBeats = [
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CHAPTER_CARD',
        stageTheme: 'DARK_STUDIO',
        archetype: 'mantis',
        voiceTone: 'HOOK_INTRIGUE',
        sfxType: 'sfx_thud',
        headerTitle: 'BỎ ĐÓI BỌ NGỰA 2 THÁNG?',
        narrationText:
          'Điều gì sẽ xảy ra... nếu một sát thủ săn mồi đỉnh cao như bọ ngựa... phải nhịn đói suốt hai tháng trời?',
        cardProps: {
          darkMode: true,
          subtitle: 'THÍ NGHIỆM SINH TỒN KHẮC NGHIỆT',
          highlightWord: '60 NGÀY KHÔNG THỨC ĂN!',
          highlightColor: 'red',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        microPoseVariant: 'alert_scan',
        hungerStage: 'WELL_FED',
        vitalityPreset: 'PEAK_VIGOR',
        actionIntent: 'OBSERVE_ROTATE_180',
        targetSocket: 'HEAD_CENTER',
        floatingHeader: 'NGÀY ĐẦU TIÊN',
        stageTheme: 'WINDOW_SILL_BOKEH',
        archetype: 'mantis',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_pop',
        headerTitle: 'NGÀY 1: SÁT THỦ TỈNH TÁO',
        narrationText:
          'Ngày đầu tiên, nó vẫn cực kỳ tỉnh táo — chiếc đầu xoay một trăm tám mươi độ để sục sạo từng kẽ lá.',
        calloutText: '[XOAY ĐẦU 180°]',
        calloutSub: 'Thị giác lập thể 3D siêu nhạy',
        calloutTarget: 'HEAD_CENTER',
        thoughtText: '[?]',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.10],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CALENDAR_FLIP_CARD',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'mantis',
        voiceTone: 'CHAPTER_ANNOUNCE',
        sfxType: 'sfx_tick',
        headerTitle: 'THỜI GIAN TRÔI QUA...',
        narrationText:
          'Nhưng ngày một... rồi tuần một... tuần hai trôi qua... chiếc hộp vẫn hoàn toàn trống rỗng.',
        cardProps: {
          calendarHeader: 'NHẬT KÝ NHỊN ĐÓI SINH TỒN',
          calendarSteps: ['NGÀY 1', 'TUẦN 1', 'TUẦN 2', 'TUẦN 3'],
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        microPoseVariant: 'stalk_slow',
        hungerStage: 'HUNGRY_STALK',
        vitalityPreset: 'CAUTIOUS_CONSERVE',
        actionIntent: 'STEP_AND_FREEZE',
        targetSocket: 'THORAX',
        floatingHeader: 'TIẾT KIỆM NĂNG LƯỢNG',
        stageTheme: 'WINDOW_SILL_BOKEH',
        archetype: 'mantis',
        voiceTone: 'STEP_BY_STEP_SUSPENSE',
        sfxType: 'sfx_whoosh',
        headerTitle: 'CHIẾN THUẬT BẤT ĐỘNG',
        narrationText:
          'Một bước. Hai bước. Thật chậm... Nó chọn cách đứng bất động hàng giờ liền để tiết kiệm từng giọt năng lượng.',
        calloutText: '[ĐỨNG BẤT ĐỘNG]',
        calloutSub: 'Tiết kiệm tối đa calo',
        calloutTarget: 'THORAX',
        thoughtText: '[...]',
        startX: 950,
        targetX: 950,
        cameraZoom: [1.0, 1.12],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CANDLE_HOURGLASS_CARD',
        metricMode: 'EXACT_QUANTITATIVE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'mantis',
        voiceTone: 'SLOW_EMOTIONAL',
        sfxType: 'sfx_whoosh',
        headerTitle: 'HẠ THẤP TRAO ĐỔI CHẤT',
        narrationText:
          'Cơ thể nó tự động vặn nhỏ ngọn lửa trao đổi chất... cháy âm ỉ từng chút một như ngọn nến trước gió.',
        cardProps: {
          metricMode: 'EXACT_QUANTITATIVE',
          targetPercent: 20,
          candleLabel: 'TỐC ĐỘ ĐỐT NĂNG LƯỢNG GIẢM CÒN MỘT PHẦN NĂM',
        },
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'SIMPLE_CHART_CARD',
        metricMode: 'EXACT_QUANTITATIVE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'mantis',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_pop',
        headerTitle: 'BIỂU ĐỒ ĐỐT NĂNG LƯỢNG',
        narrationText:
          'Trên biểu đồ sinh học, mức tiêu thụ năng lượng lao dốc thẳng đứng — giúp nó kéo dài sự sống gấp nhiều lần.',
        cardProps: {
          metricMode: 'EXACT_QUANTITATIVE',
          targetPercent: 20,
          chartMode: 'line',
          chartTitle: 'MỨC ĐỐT NĂNG LƯỢNG THEO THỜI GIAN',
        },
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'TWO_DOORS_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'mantis',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_ding',
        headerTitle: 'LỰA CHỌN SINH TỒN',
        narrationText:
          'Đứng trước hai cánh cửa sinh học... cơ thể lập tức khóa chặt chức năng sinh sản để ưu tiên hoàn toàn cho sự sống.',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          leftDoorTitle: 'DUY TRÌ SỰ SỐNG',
          leftNeutralSub: 'CHẾ ĐỘ CHỜ',
          leftDoorSub: 'ƯU TIÊN TUYỆT ĐỐI',
          rightDoorTitle: 'SINH SẢN & ĐẺ TRỨNG',
          rightNeutralSub: 'CHỜ XỬ LÝ',
          rightDoorSub: 'TẠM ĐÓNG BĂNG',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        microPoseVariant: 'hungry_clutch',
        hungerStage: 'STARVING_XRAY',
        vitalityPreset: 'DEPLETED_STARVING',
        actionIntent: 'INTERNAL_XRAY_BURN',
        targetSocket: 'ABDOMEN_CENTER',
        floatingHeader: 'TUẦN THỨ 5: ĐỐT CƠ & MỠ',
        stageTheme: 'DARK_STAGE_FLOOR',
        archetype: 'mantis',
        showXrayAbdomen: true,
        voiceTone: 'SLOW_EMOTIONAL',
        sfxType: 'sfx_thud',
        headerTitle: 'TUẦN 5: TỰ ĐỐT THỂ MỠ & CƠ BẮP',
        narrationText:
          'Bước sang tuần thứ năm... khi dự trữ đã cạn, nó bắt đầu tự đốt cháy thể mỡ và cả những thớ cơ của chính mình.',
        calloutText: 'TỰ ĐỐT THỂ MỠ & CƠ BẮP!',
        calloutSub: 'Hy sinh mô cơ để nuôi não và đôi mắt',
        calloutTarget: 'ABDOMEN_CENTER',
        startX: 1000,
        targetX: 1000,
        cameraZoom: [1.18, 1.24],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'BALANCE_SCALE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'mantis',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_thud',
        headerTitle: 'CÁN CÂN LIỀU LĨNH',
        narrationText:
          'Lúc này, cơn đói cồn cào đã nặng hơn cả nỗi sợ bị thương — biến nó thành kẻ săn mồi liều lĩnh nhất!',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          leftPanLabel: 'CƠN ĐÓI CỒN CÀO',
          rightPanLabel: 'NỖI SỢ BỊ THƯƠNG',
          heavySide: 'left',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        microPoseVariant: 'strike_grab',
        hungerStage: 'BERSERK_STRIKE',
        vitalityPreset: 'DESPERATE_CLIMAX',
        actionIntent: 'STRIKE_AND_CAPTURE',
        targetSocket: 'PRIMARY_WEAPON',
        floatingHeader: 'PHẢN XẠ 0.1 GIÂY!',
        stageTheme: 'PASTEL_BRANCH_GARDEN',
        archetype: 'mantis',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_whoosh',
        headerTitle: 'TUNG ĐÒN CHỚP NHOÁNG!',
        narrationText:
          'Chỉ cần một bóng mồi lướt qua... CHỘP! Đôi càng gai sắc nhọn vẫn tung đòn trong một phần mười giây!',
        calloutText: '[CÀNG GAI SẮC NHỌN]',
        calloutSub: 'Tốc độ phóng đòn 0.1 giây',
        calloutTarget: 'PRIMARY_WEAPON',
        sfxText: 'CHỘP!',
        startX: 880,
        targetX: 880,
        cameraZoom: [1.0, 1.12],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'GAUGE_RESERVE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'mantis',
        voiceTone: 'SLOW_EMOTIONAL',
        sfxType: 'sfx_tick',
        headerTitle: 'TUẦN 8: CHẠM VẠCH ĐỎ KIỆT SỨC',
        narrationText:
          'Nhưng đến tuần thứ tám... kim đồng hồ dự trữ chạm đáy vùng đỏ kiệt sức. Không có mồi, hành trình sinh tồn sẽ khép lại.',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          gaugeFrom: 80,
          gaugeTo: 5,
          gaugeStatusLabel: 'BÁO ĐỘNG ĐỎ: CẠN KIỆT DỰ TRỮ',
        },
      },
    ];

    console.log('1. Tổng hợp giọng đọc Nam Trầm Ấm V10.2 (vi-VN-NamMinhNeural), Mastering FFmpeg và khóa ffprobe (lead +18f / tail +42f)...');
    let currentStart = 0;
    const compiledBeats = [];
    const paddedBeatWavFiles = [];

    for (let i = 0; i < rawBeats.length; i++) {
      const b = rawBeats[i];
      const ttsRes = await synthesizeExpressiveBeat(
        b.narrationText,
        b.voiceTone,
        i + 1,
        masterAudioTempDir,
        DEFAULT_BARITONE_VOICE
      );
      paddedBeatWavFiles.push(ttsRes.paddedBeatPath);
      const minReqFrames = Math.ceil(ttsRes.actualDurationSec * 60) + TAIL_HOLD_FRAMES;
      console.log(
        `-> Beat #${i + 1} [${b.cardType} | ${b.voiceTone} | clauses=${ttsRes.clauseCount}]: audio=${ttsRes.actualDurationSec.toFixed(
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

    // Ghép sẵn Master Audio Track (100% đồng bộ tới từng frame với 11 phân cảnh)
    const masterAudioPath = path.join(masterAudioTempDir, 'master_audio.wav');
    const audioInputsArg = paddedBeatWavFiles.map((f) => `-i "${f.replace(/\\/g, '/')}"`).join(' ');
    const audioConcatRefs = paddedBeatWavFiles.map((_, idx) => `[${idx}:a]`).join('');
    execSync(
      `ffmpeg -y -v error ${audioInputsArg} -filter_complex "${audioConcatRefs}concat=n=${paddedBeatWavFiles.length}:v=0:a=1[outa]" -map "[outa]" -ar 24000 -ac 1 "${masterAudioPath.replace(
        /\\/g,
        '/'
      )}"`
    );

    const v9Payload = {
      title: 'Điều Gì Xảy Ra Khi Bỏ Đói Bọ Ngựa 2 Tháng? (V9.3 Master Patch)',
      totalDurationFrames: currentStart,
      fps: 60,
      beats: compiledBeats,
      showDebugHud: false,
    };

    console.log(`Tổng thời lượng phim V9.3: ${currentStart} frames (${(currentStart / 60).toFixed(2)}s).`);

    // 2. Bundling Remotion
    console.log('2. Bundling Remotion project...');
    const entryPoint = path.resolve(workspaceRoot, 'web-studio/src/remotion/index.ts');
    const bundleLocation = await bundle({
      entryPoint,
      onProgress: (p) => {
        if (p % 25 === 0) console.log(`Bundling: ${p}%`);
      },
    });

    // 3. Select Composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'V7MovieComposition',
      inputProps: {
        payload: v9Payload,
        showDebugHud: false,
      },
    });
    console.log(`Composition ready: ${composition.id} (${composition.width}x${composition.height}, ${composition.durationInFrames} frames)`);

    // 4. Render Verification Stills Required by V10.2 (Sử dụng Chromium GPU gl: "angle")
    const getBeatFrame = (beatIdx, ratio = 0.5) => {
      const beat = compiledBeats[beatIdx];
      return beat.startFrame + Math.floor(beat.durationFrames * ratio);
    };
    const getDisplayFrame = (beatIdx, displayRatio = 0.5) => {
      const beat = compiledBeats[beatIdx];
      const activeSpan = Math.max(1, beat.durationFrames - LEAD_IN_FRAMES - TAIL_HOLD_FRAMES);
      return beat.startFrame + LEAD_IN_FRAMES + Math.floor(activeSpan * displayRatio);
    };

    const stillsToRender = [
      {
        frame: getBeatFrame(6, 0.10),
        name: 'still_v10_3_beat7_start_gray.jpg',
        desc: 'Beat 7 (TWO_DOORS_CARD V10.3 - 10% cảnh): Cả 2 cánh cửa đều xám trung tính (#E2E8F0), nhãn trung tính không ghi %',
      },
      {
        frame: getBeatFrame(6, 0.45),
        name: 'still_v10_3_beat7_mid_morph.jpg',
        desc: 'Beat 7 (TWO_DOORS_CARD V10.3 - 45% cảnh): Cả 2 cánh cửa đang chuyển màu mượt đồng thời (Vàng ấm vs Xám băng + khóa đỏ), sạch bóng %',
      },
      {
        frame: getBeatFrame(6, 0.85),
        name: 'still_v10_3_beat7_end_locked.jpg',
        desc: 'Beat 7 (TWO_DOORS_CARD V10.3 - 85% cảnh): Cửa trái vàng rực "ƯU TIÊN TUYỆT ĐỐI", cửa phải xám đóng băng "TẠM ĐÓNG BĂNG", sạch bóng %',
      },
      {
        frame: getDisplayFrame(4, 1.0),
        name: 'still_v10_3_beat5_candle_20pct.jpg',
        desc: 'Beat 5 (CANDLE_HOURGLASS_CARD V10.3 - EXACT_QUANTITATIVE): Giữ bộ đếm chuẩn 100% -> 20% đúng "giảm còn một phần năm"',
      },
      {
        frame: getDisplayFrame(10, 0.45),
        name: 'still_v10_3_beat11_gauge_mid_clean.jpg',
        desc: 'Beat 11 (GAUGE_RESERVE_CARD V10.3 - QUALITATIVE_STATE): Nhãn sạch "ĐANG CẦM CỰ", không có số % thừa',
      },
      {
        frame: getDisplayFrame(10, 0.96),
        name: 'still_v10_3_beat11_gauge_end_clean.jpg',
        desc: 'Beat 11 (GAUGE_RESERVE_CARD V10.3 - QUALITATIVE_STATE): Nhãn sạch "BÁO ĐỘNG ĐỎ: CẠN KIỆT DỰ TRỮ", không có số % thừa',
      },
    ];

    console.log(`4. Rendering ${stillsToRender.length} V10.3 verification still frames via GPU ANGLE...`);
    for (const item of stillsToRender) {
      const artifactPath = path.join(artifactDir, item.name);
      const outPath = path.join(workspaceRoot, 'out', item.name);
      const imageFormat = item.name.endsWith('.jpg') ? 'jpeg' : 'png';
      console.log(`Rendering frame ${item.frame} (${item.desc}) -> ${item.name}...`);
      await renderStill({
        composition,
        serveUrl: bundleLocation,
        output: artifactPath,
        frame: item.frame,
        imageFormat,
        jpegQuality: imageFormat === 'jpeg' ? HYBRID_JPEG_QUALITY : undefined,
        chromiumOptions: HYBRID_CHROMIUM_OPTIONS,
        inputProps: {
          payload: v9Payload,
          showDebugHud: false,
        },
      });
      fs.copyFileSync(artifactPath, outPath);
    }

    if (isStillsOnly) {
      console.log('=== HOÀN TẤT KẾT XUẤT 6 ẢNH STILL KIỂM CHỨNG V10.0 (--stills-only) ===');
      return;
    }

    // 5. Render Full MP4 Movie qua module dùng chung hybridGpuRenderConfig.ts (CPU + GPU Intel Iris Xe ~70%)
    console.log('5. Rendering full video out/test_v9_storytime_explainer.mp4...');
    const browserInstance = await openBrowser('chrome', {
      chromiumOptions: HYBRID_CHROMIUM_OPTIONS,
    });
    let summary;
    try {
      summary = await renderVideoHybridCpuGpu({
        composition,
        serveUrl: bundleLocation,
        inputProps: {
          payload: v9Payload,
          showDebugHud: false,
        },
        masterAudioPath,
        outputPath: videoWorkspaceOut,
        isPreview,
        concurrency: HYBRID_CONCURRENCY,
        jpegQuality: HYBRID_JPEG_QUALITY,
        tempDirPrefix: 'v11_mantis_gpu_frames_',
        renderFrames,
        renderMedia,
        puppeteerInstance: browserInstance,
      });
    } finally {
      try {
        await browserInstance.close({ silent: true });
      } catch {}
    }

    fs.copyFileSync(videoWorkspaceOut, videoArtifactOut);
    const outMp4DurationSec = measureAudioDurationSecWithFfprobe(videoWorkspaceOut);
    console.log(
      `Rendered V11 Hybrid MP4 in ${summary.elapsedSec}s | Encoder: ${summary.encoderInfo.displayName} | Size: ${(
        summary.sizeBytes /
        1024 /
        1024
      ).toFixed(2)} MB`
    );
    console.log(`ffprobe final MP4 duration: ${outMp4DurationSec.toFixed(3)}s (expected ${(currentStart / 60).toFixed(3)}s)`);
    console.log('=== HOÀN TẤT RENDER V11 HYBRID STORYTIME EXPLAINER ===');
  } finally {
    try {
      fs.rmSync(masterAudioTempDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error('Fatal V9.3 render error:', err);
  process.exit(1);
});
