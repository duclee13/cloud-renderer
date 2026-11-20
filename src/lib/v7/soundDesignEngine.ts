/**
 * SOUND DESIGN ENGINE V13.0 (Procedural Royalty-Free BGM & 6 Auto SFX + Float32 Studio Mixer)
 * - Tự sinh 100% file âm thanh .wav (44.1kHz stereo/mono PCM 16-bit) bằng tổng hợp sóng hài mượt + phong bì ADSR + lọc ấm low-pass
 * - Không cần tải file ngoài, 100% không bản quyền, lưu cache vĩnh viễn tại .tts-cache/sfx_bgm_v13/
 * - 3 Bản Nhạc Nền BGM Loop mềm mại (trộn dưới giọng đọc ở mức -22dB, volume ~0.095, fade-in 0.5s / crossfade 0.8s / fade-out 0.8s):
 *   1. BGM_STORY_CALM: Hợp âm đệm Rhodes/pad ấm áp chậm rãi (Hồi 1 & Hồi 2)
 *   2. BGM_TENSE_PULSE: Nhịp trầm hồi hộp đều đặn + pizzicato nhẹ (Hồi 3 cao trào)
 *   3. BGM_WARM_OUTRO: Giai điệu ấm áp thư thái (Hồi 4 thoát hiểm & kết phim)
 * - 6 Hiệu Ứng SFX ngắn tự động gắn đúng khung hình hành động:
 *   1. sfx_pop.wav (~120ms): Tiếng "pốp" gỗ/bong bóng dễ thương (ô comment, tiêu đề nổi, dấu [?])
 *   2. sfx_whoosh.wav (~180ms): Tiếng gió lướt cực nhẹ (volume 0.15 khi chuyển phân cảnh)
 *   3. sfx_switch_click.wav (~90ms): Tiếng "tách!" dứt khoát (bấm bật & tắt đèn pin)
 *   4. sfx_ding.wav (~350ms): Tiếng chuông "ting!" sáng trong (dấu tích xanh ✓ / kết thúc an toàn)
 *   5. sfx_lock.wav (~180ms): Tiếng "cạch!" khóa chốt (ổ khóa đỏ sập trên TWO_DOORS_CARD)
 *   6. sfx_alert.wav (~280ms): Tiếng nhấn kịch tính (nổ CHÓI!, VÙÙÙ!, kim đồng hồ chạm vạch đỏ)
 */

import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

export type BgmTrackId = "BGM_STORY_CALM" | "BGM_TENSE_PULSE" | "BGM_WARM_OUTRO";

export type SfxEffectId =
  | "sfx_pop"
  | "sfx_whoosh"
  | "sfx_switch_click"
  | "sfx_ding"
  | "sfx_lock"
  | "sfx_alert";

export interface BgmSegment {
  trackId: BgmTrackId;
  startFrame: number;
  endFrame: number;
  volume: number;
  fadeInSec: number;
  fadeOutSec: number;
}

export interface SfxCue {
  effectId: SfxEffectId;
  frame: number;
  volume: number;
  reason: string;
}

export interface SoundDesignPlan {
  bgmSegments: BgmSegment[];
  sfxCues: SfxCue[];
  totalFrames: number;
  fps: number;
}

export interface SoundDesignBeatInput {
  startFrame: number;
  durationFrames: number;
  stageType?: string;
  stageTheme?: string;
  theme?: string;
  cardType?: string;
  hornetSceneMode?: string;
  kassSceneMode?: string;
  voiceTone?: string;
  floatingHeader?: string;
  calloutText?: string;
  calloutTriggerPhrase?: string;
  sfxText?: string;
  narrationText?: string;
  bgmMood?: BgmTrackId;
  cardProps?: {
    accentTheme?: string;
    highlightColor?: string;
    chartTrend?: string;
    gaugePolarity?: string;
    subtitle?: string;
  };
}

export interface SoundDesignAssetPaths {
  cacheDir: string;
  bgm: Record<BgmTrackId, string>;
  sfx: Record<SfxEffectId, string>;
}

const SAMPLE_RATE = 44100;
const ASSET_VERSION_TAG = "v13_0_studio";

function resolveSoundCacheDir(): string {
  const cwd = process.cwd();
  const base = path.basename(cwd).toLowerCase() === "web-studio" ? path.resolve(cwd, "..") : cwd;
  return path.join(base, ".tts-cache", "sfx_bgm_v13");
}

export const SOUND_DESIGN_CACHE_DIR = resolveSoundCacheDir();

// Bộ sinh số ngẫu nhiên tất định (Linear Congruential Generator) cho hiệu ứng noise mượt nhất quán
function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Lọc thông thấp 1-pole mượt (giúp nhạc nền ấm dịu, không lấn vào dải trung-cao 2kHz-4kHz của giọng nói)
 */
function applyLowPassFilter(samples: Float32Array, cutoffHz: number, sr = SAMPLE_RATE): void {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sr;
  const alpha = dt / (rc + dt);
  let y = 0;
  for (let i = 0; i < samples.length; i++) {
    y = y + alpha * (samples[i] - y);
    samples[i] = y;
  }
}

/**
 * Lọc thông cao nhẹ để cắt ù sub-bass dưới 45Hz
 */
function applyHighPassFilter(samples: Float32Array, cutoffHz: number, sr = SAMPLE_RATE): void {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sr;
  const alpha = rc / (rc + dt);
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = alpha * (prevY + x - prevX);
    samples[i] = y;
    prevX = x;
    prevY = y;
  }
}

/**
 * Chuẩn hóa biên độ peak về targetPeak (tránh méo tiếng và đảm bảo mức âm lượng đồng đều)
 */
function normalizePeak(samples: Float32Array, targetPeak = 0.85): void {
  let maxAbs = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > maxAbs) maxAbs = a;
  }
  if (maxAbs > 1e-6) {
    const scale = targetPeak / maxAbs;
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= scale;
    }
  }
}

/**
 * Đóng gói Float32Array mono (hoặc stereo) thành buffer WAV 16-bit signed LE chuẩn
 */
function encodeWavMono16Bit(samples: Float32Array, sr = SAMPLE_RATE): Buffer {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // PCM chunk size
  buf.writeUInt16LE(1, 20);  // PCM format
  buf.writeUInt16LE(1, 22);  // Mono
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 2, 28); // Byte rate
  buf.writeUInt16LE(2, 32);  // Block align
  buf.writeUInt16LE(16, 34); // Bits per sample
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buf;
}

/**
 * Đọc file WAV 16-bit PCM mono/stereo bất kỳ (44.1kHz) sang Float32Array mono
 */
function decodeWavToFloat32Mono(wavPath: string): { samples: Float32Array; sampleRate: number } {
  const buf = fs.readFileSync(wavPath);
  if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF") {
    throw new Error(`Invalid WAV file: ${wavPath}`);
  }
  let offset = 12;
  let channels = 1;
  let sampleRate = SAMPLE_RATE;
  let bitsPerSample = 16;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === "fmt ") {
      channels = buf.readUInt16LE(offset + 10);
      sampleRate = buf.readUInt32LE(offset + 12);
      bitsPerSample = buf.readUInt16LE(offset + 22);
    } else if (chunkId === "data") {
      dataOffset = offset + 8;
      dataSize = Math.min(chunkSize, buf.length - dataOffset);
      break;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  if (dataOffset < 0 || bitsPerSample !== 16) {
    throw new Error(`Unsupported WAV format (${bitsPerSample}-bit) in ${wavPath}`);
  }

  const frameBytes = channels * 2;
  const numFrames = Math.floor(dataSize / frameBytes);
  const out = new Float32Array(numFrames);

  for (let i = 0; i < numFrames; i++) {
    let sum = 0;
    for (let ch = 0; ch < channels; ch++) {
      sum += buf.readInt16LE(dataOffset + i * frameBytes + ch * 2) / 32768;
    }
    out[i] = sum / channels;
  }

  return { samples: out, sampleRate };
}

/**
 * Tổng hợp 1 nốt đàn điện Rhodes/Marimba ấm áp vào bộ đệm samples
 */
function addWarmRhodesNote(
  buf: Float32Array,
  startSec: number,
  durSec: number,
  freqHz: number,
  amp: number,
  sr = SAMPLE_RATE
): void {
  const startIdx = Math.max(0, Math.floor(startSec * sr));
  const len = Math.floor(durSec * sr);
  const endIdx = Math.min(buf.length, startIdx + len);
  const attackSec = 0.018;

  for (let i = startIdx; i < endIdx; i++) {
    const t = (i - startIdx) / sr;
    const attack = t < attackSec ? t / attackSec : 1.0;
    const decay = Math.exp(-t * 1.45);
    const tailFade = i > endIdx - Math.floor(0.06 * sr) ? (endIdx - i) / Math.floor(0.06 * sr) : 1.0;
    const env = attack * decay * tailFade;
    const tine = Math.exp(-t * 11.0) * 0.16 * Math.sin(2 * Math.PI * freqHz * 3.0 * t);
    const tone =
      Math.sin(2 * Math.PI * freqHz * t) +
      0.22 * Math.sin(2 * Math.PI * freqHz * 2.0 * t) +
      tine;
    buf[i] += tone * env * amp;
  }
}

/**
 * Tổng hợp 1 hợp âm đệm pad êm ái (smooth cross-window) vào bộ đệm samples
 */
function addVelvetPadChord(
  buf: Float32Array,
  startSec: number,
  durSec: number,
  freqsHz: number[],
  amp: number,
  sr = SAMPLE_RATE
): void {
  const startIdx = Math.max(0, Math.floor(startSec * sr));
  const len = Math.floor(durSec * sr);
  const endIdx = Math.min(buf.length, startIdx + len);
  const fadeSec = Math.min(0.65, durSec * 0.25);

  for (let i = startIdx; i < endIdx; i++) {
    const t = (i - startIdx) / sr;
    let env = 1.0;
    if (t < fadeSec) {
      env = 0.5 - 0.5 * Math.cos((t / fadeSec) * Math.PI);
    } else if (t > durSec - fadeSec) {
      env = 0.5 - 0.5 * Math.cos(((durSec - t) / fadeSec) * Math.PI);
    }
    let chordSum = 0;
    for (let k = 0; k < freqsHz.length; k++) {
      const f = freqsHz[k];
      chordSum +=
        0.55 * Math.sin(2 * Math.PI * f * t) +
        0.30 * Math.sin(2 * Math.PI * (f * 1.003) * t + k * 0.7) +
        0.10 * Math.sin(2 * Math.PI * (f * 2.0) * t);
    }
    buf[i] += (chordSum / Math.max(1, freqsHz.length)) * env * amp;
  }
}

/**
 * 1. BGM_STORY_CALM (16s seamless loop): Đệm piano điện Rhodes + pad ấm áp cho Hồi 1 & Hồi 2
 */
function generateBgmStoryCalm(): Float32Array {
  const durSec = 16.0;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  const bars = [
    { start: 0.0, pad: [130.81, 196.0, 246.94, 329.63], arp: [261.63, 329.63, 392.0, 293.66, 329.63, 392.0, 493.88, 392.0] }, // Cmaj9
    { start: 4.0, pad: [110.0, 164.81, 196.0, 261.63], arp: [220.0, 261.63, 329.63, 246.94, 261.63, 329.63, 392.0, 329.63] },  // Am9
    { start: 8.0, pad: [87.31, 130.81, 164.81, 220.0], arp: [174.61, 220.0, 261.63, 329.63, 261.63, 220.0, 329.63, 261.63] },  // Fmaj9
    { start: 12.0, pad: [98.0, 146.83, 196.0, 246.94], arp: [196.0, 246.94, 293.66, 329.63, 293.66, 246.94, 392.0, 293.66] },  // G6
  ];

  for (const bar of bars) {
    addVelvetPadChord(buf, bar.start, 4.0, bar.pad, 0.34);
    for (let step = 0; step < bar.arp.length; step++) {
      addWarmRhodesNote(buf, bar.start + step * 0.5, 1.35, bar.arp[step], step % 2 === 0 ? 0.24 : 0.16);
    }
  }

  applyHighPassFilter(buf, 55);
  applyLowPassFilter(buf, 1450);
  normalizePeak(buf, 0.72);
  return buf;
}

/**
 * 2. BGM_TENSE_PULSE (8s seamless loop): Nhịp trầm đều đặn hồi hộp + pizzicato nhẹ cho Hồi 3 cao trào
 */
function generateBgmTensePulse(): Float32Array {
  const durSec = 8.0;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  const bars = [
    { start: 0.0, bass: 73.42, pad: [146.83, 174.61, 220.0], pulse: [293.66, 349.23, 293.66, 220.0] },  // Dm
    { start: 2.0, bass: 58.27, pad: [116.54, 174.61, 220.0], pulse: [233.08, 293.66, 233.08, 174.61] }, // Bbmaj7
    { start: 4.0, bass: 98.0,  pad: [146.83, 196.0, 233.08], pulse: [293.66, 349.23, 392.0, 293.66] },  // Gm
    { start: 6.0, bass: 55.0,  pad: [110.0, 164.81, 207.65], pulse: [220.0, 277.18, 329.63, 220.0] },   // A tension
  ];

  for (const bar of bars) {
    addVelvetPadChord(buf, bar.start, 2.0, bar.pad, 0.24);
    // Nhịp trầm hồi hộp đều mỗi 0.5 giây (4 nhịp / ô nhịp)
    for (let b = 0; b < 4; b++) {
      const startSec = bar.start + b * 0.5;
      const startIdx = Math.floor(startSec * SAMPLE_RATE);
      const len = Math.floor(0.32 * SAMPLE_RATE);
      const endIdx = Math.min(buf.length, startIdx + len);
      const accent = b === 0 ? 0.52 : b === 2 ? 0.42 : 0.30;
      for (let i = startIdx; i < endIdx; i++) {
        const t = (i - startIdx) / SAMPLE_RATE;
        const atk = t < 0.012 ? t / 0.012 : 1.0;
        const env = atk * Math.exp(-t * 8.5);
        const sub =
          Math.sin(2 * Math.PI * bar.bass * t) +
          0.35 * Math.sin(2 * Math.PI * (bar.bass * 2.0) * t);
        buf[i] += sub * env * accent;
      }
      // Nhịp pizzicato mờ tạo cảm giác đồng hồ đếm ngược
      addWarmRhodesNote(buf, startSec + 0.25, 0.22, bar.pulse[b], 0.14);
    }
  }

  applyHighPassFilter(buf, 45);
  applyLowPassFilter(buf, 1150);
  normalizePeak(buf, 0.74);
  return buf;
}

/**
 * 3. BGM_WARM_OUTRO (16s seamless loop): Giai điệu ấm áp thư thái cho Hồi 4 thoát hiểm & kết phim
 */
function generateBgmWarmOutro(): Float32Array {
  const durSec = 16.0;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  const bars = [
    { start: 0.0, pad: [87.31, 130.81, 164.81, 220.0], mel: [261.63, 329.63, 392.0, 329.63] },  // Fmaj7
    { start: 4.0, pad: [98.0, 146.83, 196.0, 246.94],  mel: [293.66, 392.0, 440.0, 392.0] },   // G6
    { start: 8.0, pad: [110.0, 164.81, 196.0, 261.63], mel: [329.63, 392.0, 523.25, 440.0] },  // Am7
    { start: 12.0, pad: [130.81, 196.0, 246.94, 329.63], mel: [392.0, 329.63, 293.66, 261.63] }, // Cmaj9
  ];

  for (const bar of bars) {
    addVelvetPadChord(buf, bar.start, 4.0, bar.pad, 0.36);
    for (let m = 0; m < bar.mel.length; m++) {
      addWarmRhodesNote(buf, bar.start + m * 1.0, 1.8, bar.mel[m], 0.25);
      addWarmRhodesNote(buf, bar.start + m * 1.0 + 0.5, 1.2, bar.mel[m] * 0.5, 0.14);
    }
  }

  applyHighPassFilter(buf, 55);
  applyLowPassFilter(buf, 1750);
  normalizePeak(buf, 0.72);
  return buf;
}

/**
 * SFX 1: sfx_pop.wav (~120ms) — Tiếng "pốp" gỗ / bong bóng dễ thương
 */
function generateSfxPop(): Float32Array {
  const durSec = 0.12;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  let phase = 0;
  for (let i = 0; i < buf.length; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 260 * Math.exp(t * 9.8); // Quét nhanh 260Hz -> ~840Hz
    phase += (2 * Math.PI * Math.min(1050, freq)) / SAMPLE_RATE;
    const atk = t < 0.005 ? t / 0.005 : 1.0;
    const env = atk * Math.exp(-t * 28.0);
    buf[i] = (Math.sin(phase) + 0.28 * Math.sin(phase * 2.0)) * env;
  }
  applyLowPassFilter(buf, 2800);
  normalizePeak(buf, 0.86);
  return buf;
}

/**
 * SFX 2: sfx_whoosh.wav (~180ms) — Tiếng gió lướt cực nhẹ khi chuyển phân cảnh
 */
function generateSfxWhoosh(): Float32Array {
  const durSec = 0.18;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  const rand = createSeededRandom(13002);
  let lp = 0;
  let hpPrevX = 0;
  let hpPrevY = 0;

  for (let i = 0; i < buf.length; i++) {
    const p = i / buf.length;
    const white = rand() * 2 - 1;
    // Quét băng thông nhẹ nhàng 320Hz -> 1300Hz -> 320Hz
    const cutoff = 320 + 980 * Math.sin(p * Math.PI);
    const alphaLp = (2 * Math.PI * cutoff) / (SAMPLE_RATE + 2 * Math.PI * cutoff);
    lp = lp + alphaLp * (white - lp);

    const alphaHp = 0.94;
    const bp = alphaHp * (hpPrevY + lp - hpPrevX);
    hpPrevX = lp;
    hpPrevY = bp;

    const env = Math.pow(Math.sin(p * Math.PI), 1.35);
    buf[i] = bp * env;
  }
  normalizePeak(buf, 0.78);
  return buf;
}

/**
 * SFX 3: sfx_switch_click.wav (~90ms) — Tiếng "tách!" dứt khoát công tắc đèn pin
 */
function generateSfxSwitchClick(): Float32Array {
  const durSec = 0.09;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  const rand = createSeededRandom(13003);

  for (let i = 0; i < buf.length; i++) {
    const t = i / SAMPLE_RATE;
    let sig = 0;
    // Xung nhấn đầu tiên (0..18ms): tiếng nhựa cứng bật nảy
    if (t < 0.02) {
      const env1 = Math.exp(-t * 210);
      sig +=
        (0.55 * (rand() * 2 - 1) +
          0.65 * Math.sin(2 * Math.PI * 2650 * t) +
          0.45 * Math.sin(2 * Math.PI * 4400 * t)) *
        env1;
    }
    // Xung khớp chốt thứ hai (20..65ms): tiếng lẫy công tắc đóng dứt khoát
    if (t >= 0.02) {
      const t2 = t - 0.02;
      const env2 = Math.exp(-t2 * 135);
      sig +=
        (0.35 * (rand() * 2 - 1) +
          0.8 * Math.sin(2 * Math.PI * 1650 * t2) +
          0.55 * Math.sin(2 * Math.PI * 3350 * t2)) *
        env2;
    }
    buf[i] = sig;
  }
  applyHighPassFilter(buf, 380);
  normalizePeak(buf, 0.88);
  return buf;
}

/**
 * SFX 4: sfx_ding.wav (~350ms) — Tiếng chuông "ting!" sáng trong
 */
function generateSfxDing(): Float32Array {
  const durSec = 0.35;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  for (let i = 0; i < buf.length; i++) {
    const t = i / SAMPLE_RATE;
    const atk = t < 0.004 ? t / 0.004 : 1.0;
    const tailFade = i > buf.length - 600 ? (buf.length - i) / 600 : 1.0;
    const s1 = Math.sin(2 * Math.PI * 1046.5 * t) * Math.exp(-t * 8.5);
    const s2 = 0.45 * Math.sin(2 * Math.PI * 1567.98 * t) * Math.exp(-t * 10.5);
    const s3 = 0.25 * Math.sin(2 * Math.PI * 2093.0 * t) * Math.exp(-t * 13.0);
    const s4 = 0.14 * Math.sin(2 * Math.PI * 2637.02 * t) * Math.exp(-t * 17.0);
    buf[i] = (s1 + s2 + s3 + s4) * atk * tailFade;
  }
  normalizePeak(buf, 0.84);
  return buf;
}

/**
 * SFX 5: sfx_lock.wav (~180ms) — Tiếng "cạch!" chốt khóa kim loại sập mạnh trên TWO_DOORS_CARD
 */
function generateSfxLock(): Float32Array {
  const durSec = 0.18;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  const rand = createSeededRandom(13005);

  for (let i = 0; i < buf.length; i++) {
    const t = i / SAMPLE_RATE;
    let sig = 0;
    // Cú sập thân khóa trầm (0..70ms)
    if (t < 0.08) {
      const env1 = Math.exp(-t * 58);
      const bodyFreq = 195 * Math.exp(-t * 10);
      sig +=
        (0.75 * Math.sin(2 * Math.PI * bodyFreq * t) +
          0.45 * Math.sin(2 * Math.PI * 460 * t) +
          0.35 * (rand() * 2 - 1) * Math.exp(-t * 95)) *
        env1;
    }
    // Tiếng chốt thép khớp "cạch!" (46..170ms)
    if (t >= 0.046) {
      const t2 = t - 0.046;
      const env2 = Math.exp(-t2 * 42);
      sig +=
        (0.65 * Math.sin(2 * Math.PI * 1020 * t2) +
          0.45 * Math.sin(2 * Math.PI * 1940 * t2) +
          0.25 * Math.sin(2 * Math.PI * 2890 * t2)) *
        env2;
    }
    buf[i] = sig;
  }
  applyHighPassFilter(buf, 75);
  normalizePeak(buf, 0.88);
  return buf;
}

/**
 * SFX 6: sfx_alert.wav (~280ms) — Tiếng nhấn kịch tính (CHÓI!, VÙÙÙ!, vạch đỏ nguy hiểm)
 */
function generateSfxAlert(): Float32Array {
  const durSec = 0.28;
  const buf = new Float32Array(Math.floor(durSec * SAMPLE_RATE));
  for (let i = 0; i < buf.length; i++) {
    const t = i / SAMPLE_RATE;
    let sig = 0;
    // Cú nhấn trầm impact ngay t=0
    const subFreq = 125 * Math.exp(-t * 14);
    sig += 0.65 * Math.sin(2 * Math.PI * subFreq * t) * Math.exp(-t * 24);
    // Nhịp 2 nốt kịch tính sắc nét (D5 587Hz -> A5 880Hz)
    const noteFreq = t < 0.075 ? 587.33 : 880.0;
    const localT = t < 0.075 ? t : t - 0.075;
    const atk = localT < 0.005 ? localT / 0.005 : 1.0;
    const env = atk * Math.exp(-localT * 11.5);
    sig +=
      (0.55 * Math.sin(2 * Math.PI * noteFreq * t) +
        0.25 * Math.sin(2 * Math.PI * noteFreq * 1.5 * t) +
        0.12 * Math.sin(2 * Math.PI * noteFreq * 2.0 * t)) *
      env;
    buf[i] = sig;
  }
  applyLowPassFilter(buf, 3400);
  normalizePeak(buf, 0.88);
  return buf;
}

/**
 * Bảo đảm toàn bộ 3 file BGM + 6 file SFX đã được tạo và cache vĩnh viễn tại .tts-cache/sfx_bgm_v13/
 */
export function ensureSoundDesignAssets(cacheDir = SOUND_DESIGN_CACHE_DIR): SoundDesignAssetPaths {
  fs.mkdirSync(cacheDir, { recursive: true });
  const versionStampPath = path.join(cacheDir, `${ASSET_VERSION_TAG}.stamp`);
  const needsRebuild = !fs.existsSync(versionStampPath);

  const bgm: Record<BgmTrackId, string> = {
    BGM_STORY_CALM: path.join(cacheDir, "bgm_story_calm.wav"),
    BGM_TENSE_PULSE: path.join(cacheDir, "bgm_tense_pulse.wav"),
    BGM_WARM_OUTRO: path.join(cacheDir, "bgm_warm_outro.wav"),
  };

  const sfx: Record<SfxEffectId, string> = {
    sfx_pop: path.join(cacheDir, "sfx_pop.wav"),
    sfx_whoosh: path.join(cacheDir, "sfx_whoosh.wav"),
    sfx_switch_click: path.join(cacheDir, "sfx_switch_click.wav"),
    sfx_ding: path.join(cacheDir, "sfx_ding.wav"),
    sfx_lock: path.join(cacheDir, "sfx_lock.wav"),
    sfx_alert: path.join(cacheDir, "sfx_alert.wav"),
  };

  const writeIfMissing = (filePath: string, generator: () => Float32Array) => {
    if (needsRebuild || !fs.existsSync(filePath) || fs.statSync(filePath).size < 200) {
      const samples = generator();
      fs.writeFileSync(filePath, encodeWavMono16Bit(samples, SAMPLE_RATE));
    }
  };

  writeIfMissing(bgm.BGM_STORY_CALM, generateBgmStoryCalm);
  writeIfMissing(bgm.BGM_TENSE_PULSE, generateBgmTensePulse);
  writeIfMissing(bgm.BGM_WARM_OUTRO, generateBgmWarmOutro);

  writeIfMissing(sfx.sfx_pop, generateSfxPop);
  writeIfMissing(sfx.sfx_whoosh, generateSfxWhoosh);
  writeIfMissing(sfx.sfx_switch_click, generateSfxSwitchClick);
  writeIfMissing(sfx.sfx_ding, generateSfxDing);
  writeIfMissing(sfx.sfx_lock, generateSfxLock);
  writeIfMissing(sfx.sfx_alert, generateSfxAlert);

  if (needsRebuild) {
    fs.writeFileSync(versionStampPath, new Date().toISOString(), "utf8");
  }

  return { cacheDir, bgm, sfx };
}

/**
 * Tự động suy luận bản nhạc nền BGM phù hợp cho từng phân cảnh của mọi kịch bản
 */
export function inferBgmMoodForBeat(beat: SoundDesignBeatInput, index: number, totalBeats: number): BgmTrackId {
  if (beat.bgmMood) return beat.bgmMood;

  const mode = beat.hornetSceneMode || "";
  const kassMode = beat.kassSceneMode || "";
  const sub = `${beat.cardProps?.subtitle || ""} ${beat.floatingHeader || ""} ${beat.narrationText || ""}`.toLowerCase();

  // V14.0 & V15.0 Kể chuyện đời sống tự nhiên ("7 Ngày Với Tổ Kiến Lửa Dưới Gốc Xoài")
  if (kassMode) {
    if (
      kassMode === "GARDEN_ANTS_BOIL" ||
      kassMode === "GARDEN_SURPRISE_HOP" ||
      kassMode === "EXPLAIN_SYNC_ATTACK" ||
      kassMode === "GARDEN_DARK_CLOUDS_RAIN" ||
      kassMode === "YARD_WATCH_RAIN_WINDOW"
    ) {
      return "BGM_TENSE_PULSE";
    }
    if (
      kassMode === "YARD_GRANDPA_LAUGH" ||
      kassMode === "YARD_GRANDPA_WISDOM" ||
      kassMode === "GARDEN_RAFT_DRIFT_SAFE" ||
      kassMode === "GARDEN_GRANDPA_BOY_NONLA" ||
      kassMode === "YARD_SUNNY_NOTEBOOK" ||
      kassMode === "EXPLAIN_SEVEN_DAY_NOTEBOOK" ||
      kassMode === "YARD_SUMMER_FAREWELL" ||
      kassMode === "EXPLAIN_WARM_SERIES_OUTRO" ||
      kassMode === "EXPLAIN_SEVEN_DAYS_OUTRO"
    ) {
      return "BGM_WARM_OUTRO";
    }
    return "BGM_STORY_CALM";
  }

  // Hồi 4: Thoát hiểm an toàn, tắt đèn, kết phim ấm áp
  if (
    mode === "FLASHLIGHT_SWITCH_OFF" ||
    mode === "STEALTH_EXIT_LEFT" ||
    beat.cardProps?.highlightColor === "green" ||
    beat.cardProps?.accentTheme === "POSITIVE_GOLD" ||
    /hồi 4|thoát hiểm|tắt đèn|rút lui|an toàn|hẹn gặp lại/.test(sub)
  ) {
    return "BGM_WARM_OUTRO";
  }

  // Hồi 3: Cao trào truy đuổi, đàn ong tấn công, đồng hồ đỏ nguy hiểm
  if (
    mode === "SWARM_BEAM_ATTACK" ||
    mode === "STING_RETREAT_BACKSTEP" ||
    mode === "NEST_BUZZING_RED_EYES" ||
    beat.cardProps?.gaugePolarity === "danger_high_red" ||
    beat.cardType === "BALANCE_SCALE_CARD" ||
    /hồi 3|truy đuổi|hải đăng tử thần|tấn công hàng loạt|ngòi trơn/.test(sub) ||
    (beat.voiceTone === "TENSE_CLIMAX" && index >= Math.floor(totalBeats * 0.45) && index < Math.floor(totalBeats * 0.8))
  ) {
    return "BGM_TENSE_PULSE";
  }

  // Mặc định Hồi 1 & Hồi 2: Nhạc đệm kể chuyện & giải thích ấm áp
  return "BGM_STORY_CALM";
}

function estimateCalloutAppearFrame(beat: SoundDesignBeatInput): number {
  const leadIn = 18;
  const tailHold = 42;
  const safeTotal = Math.max(60, beat.durationFrames);
  const speechFrames = Math.max(60, safeTotal - leadIn - tailHold);
  const normText = (beat.narrationText || "").toLowerCase();
  const normPhrase = (beat.calloutTriggerPhrase || "").trim().toLowerCase();
  const idx = normPhrase ? normText.indexOf(normPhrase) : -1;
  const ratio = idx >= 0 ? idx / Math.max(1, normText.length) : 0.25;
  const rawAppear = Math.max(leadIn, leadIn + Math.round(ratio * speechFrames) - 8);
  return Math.min(rawAppear, Math.max(leadIn, safeTotal - 66));
}

/**
 * Xây dựng tự động bảng phân bổ Nhạc Nền (3 BGM crossfade -22dB) & 6 Hiệu Ứng SFX đúng khung hình hành động
 */
export function buildAutoSoundDesignPlan(beats: SoundDesignBeatInput[], fps = 60): SoundDesignPlan {
  const bgmSegments: BgmSegment[] = [];
  const sfxCues: SfxCue[] = [];
  let totalFrames = 0;

  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const startF = b.startFrame;
    const durF = b.durationFrames;
    const endF = startF + durF;
    if (endF > totalFrames) totalFrames = endF;

    // 1. Gom các phân cảnh liên tiếp cùng mood BGM thành 1 đoạn mượt (âm lượng ~0.095 ≈ -22dB dưới giọng đọc)
    const trackId = inferBgmMoodForBeat(b, i, beats.length);
    const trackVol =
      trackId === "BGM_TENSE_PULSE" ? 0.09 : trackId === "BGM_WARM_OUTRO" ? 0.10 : 0.095;

    const prevSeg = bgmSegments[bgmSegments.length - 1];
    if (prevSeg && prevSeg.trackId === trackId && prevSeg.endFrame === startF) {
      prevSeg.endFrame = endF;
    } else {
      bgmSegments.push({
        trackId,
        startFrame: startF,
        endFrame: endF,
        volume: trackVol,
        fadeInSec: i === 0 ? 0.5 : 0.65,
        fadeOutSec: 0.8,
      });
    }

    // 2. Gắn 6 hiệu ứng SFX tự động đúng khung hình hành động
    // 2a. V15.0 sfx_whoosh (volume êm 0.06): CHỈ phát khi prevBeat.stageType !== currBeat.stageType!
    if (i > 0) {
      const prevBeat = beats[i - 1];
      const prevStage = prevBeat.stageType || prevBeat.stageTheme || prevBeat.theme || prevBeat.cardType || "";
      const currStage = b.stageType || b.stageTheme || b.theme || b.cardType || "";
      if (!prevStage || !currStage || prevStage !== currStage) {
        sfxCues.push({
          effectId: "sfx_whoosh",
          frame: startF,
          volume: 0.06,
          reason: `Beat #${i + 1} stage transition (${prevStage || "?"} -> ${currStage || "?"})`,
        });
      }
    }

    // 2b. sfx_pop: bật nảy tiêu đề nổi / ô comment vàng / dấu [?] ngơ ngác
    if (b.floatingHeader && b.cardType === "CHARACTER_POSE_CARD") {
      sfxCues.push({
        effectId: "sfx_pop",
        frame: startF + 3,
        volume: 0.20,
        reason: `Beat #${i + 1} Impact Floating Text pop`,
      });
    }
    if (b.calloutText && !b.sfxText) {
      const appearF = estimateCalloutAppearFrame(b);
      sfxCues.push({
        effectId: "sfx_pop",
        frame: startF + appearF,
        volume: 0.28,
        reason: `Beat #${i + 1} callout "${b.calloutText}"`,
      });
    }

    // 2c. sfx_switch_click: tiếng "tách!" bấm bật đèn (Beat 5 u=0.14) & tắt phụt đèn (Beat 17 u=0.35)
    if (b.hornetSceneMode === "FLASHLIGHT_ALERT") {
      sfxCues.push({
        effectId: "sfx_switch_click",
        frame: startF + Math.floor(durF * 0.14),
        volume: 0.42,
        reason: `Beat #${i + 1} flashlight switch ON`,
      });
    } else if (b.hornetSceneMode === "FLASHLIGHT_SWITCH_OFF") {
      const switchOffF = startF + Math.floor(durF * 0.35);
      sfxCues.push({
        effectId: "sfx_switch_click",
        frame: switchOffF,
        volume: 0.44,
        reason: `Beat #${i + 1} flashlight switch OFF`,
      });
      // Dấu [?] bật nảy trên đầu đàn ong ngơ ngác ngay sau khi đèn tắt
      sfxCues.push({
        effectId: "sfx_pop",
        frame: switchOffF + 14,
        volume: 0.28,
        reason: `Beat #${i + 1} confused [?] badges pop`,
      });
    }

    // 2d. sfx_alert: ngôi sao nổ CHÓI! / VÙÙÙ! / CHỘP!, kim đồng hồ chạm đỏ, biểu đồ tăng vọt
    if (b.sfxText) {
      sfxCues.push({
        effectId: "sfx_alert",
        frame: startF + Math.floor(durF * 0.17),
        volume: 0.30,
        reason: `Beat #${i + 1} comic SFX "${b.sfxText}"`,
      });
    }
    if (b.cardType === "GAUGE_RESERVE_CARD") {
      const activeSpan = Math.max(30, durF - 60);
      sfxCues.push({
        effectId: "sfx_alert",
        frame: startF + 18 + Math.floor(activeSpan * 0.70),
        volume: 0.28,
        reason: `Beat #${i + 1} gauge red danger threshold`,
      });
    }
    if (b.cardType === "SIMPLE_CHART_CARD" && b.cardProps?.chartTrend === "rising") {
      const activeSpan = Math.max(30, durF - 60);
      sfxCues.push({
        effectId: "sfx_alert",
        frame: startF + 18 + Math.floor(activeSpan * 0.72),
        volume: 0.26,
        reason: `Beat #${i + 1} rising alarm chart peak`,
      });
    }

    // 2e. sfx_lock & sfx_ding trên TWO_DOORS_CARD
    if (b.cardType === "TWO_DOORS_CARD") {
      const activeSpan = Math.max(30, durF - 60);
      // Ổ khóa đỏ sập chặt đúng mốc displayP = 0.58
      sfxCues.push({
        effectId: "sfx_lock",
        frame: startF + 18 + Math.floor(activeSpan * 0.58),
        volume: 0.36,
        reason: `Beat #${i + 1} TWO_DOORS padlock slam`,
      });
      // Cửa ưu tiên bật dấu tích xanh ✓ (POSITIVE_GOLD / GOLD_SURVIVAL) -> tiếng "ting!" sáng trong
      if (b.cardProps?.accentTheme !== "DANGER_RED") {
        sfxCues.push({
          effectId: "sfx_ding",
          frame: startF + 18 + Math.floor(activeSpan * 0.36),
          volume: 0.30,
          reason: `Beat #${i + 1} TWO_DOORS positive checkmark ding`,
        });
      } else {
        sfxCues.push({
          effectId: "sfx_alert",
          frame: startF + 18 + Math.floor(activeSpan * 0.36),
          volume: 0.24,
          reason: `Beat #${i + 1} TWO_DOORS red alarm activation`,
        });
      }
    }

    // 2f. sfx_ding cho thẻ chuyển chương / kết thúc an toàn màu xanh lá
    if (b.cardType === "CHAPTER_CARD" && b.cardProps?.highlightColor === "green") {
      sfxCues.push({
        effectId: "sfx_ding",
        frame: startF + 6,
        volume: 0.28,
        reason: `Beat #${i + 1} safe green chapter chime`,
      });
    }

    // 2g. V14.0 Kể Chuyện Đời Sống Tự Nhiên: gắn sfx_pop / sfx_alert / sfx_ding khớp từng ComicSpeechBubble & hành động
    if (b.kassSceneMode === "GARDEN_FIND_MOUND") {
      sfxCues.push({
        effectId: "sfx_pop",
        frame: startF + 115,
        volume: 0.30,
        reason: `Beat #${i + 1} ComicSpeechBubble "Ủa, cái gì đây?" pop`,
      });
    } else if (b.kassSceneMode === "EXPLAIN_BUN_COMPARE") {
      sfxCues.push({
        effectId: "sfx_pop",
        frame: startF + 28,
        volume: 0.28,
        reason: `Beat #${i + 1} comparison "=" badge pop`,
      });
    } else if (b.kassSceneMode === "GARDEN_POKE_MOUND") {
      sfxCues.push({
        effectId: "sfx_pop",
        frame: startF + Math.floor(durF * 0.38),
        volume: 0.36,
        reason: `Beat #${i + 1} stick poke "CHỌC!" pop`,
      });
    } else if (b.kassSceneMode === "GARDEN_ANTS_BOIL") {
      sfxCues.push({
        effectId: "sfx_alert",
        frame: startF + 16,
        volume: 0.32,
        reason: `Beat #${i + 1} fire ants boil + "ÁAA!" shock`,
      });
    } else if (b.kassSceneMode === "YARD_GRANDPA_LAUGH") {
      sfxCues.push({
        effectId: "sfx_pop",
        frame: startF + 120,
        volume: 0.30,
        reason: `Beat #${i + 1} ComicSpeechBubble "Kiến lửa đó con!" pop`,
      });
    } else if (b.kassSceneMode === "EXPLAIN_SEVEN_DAYS_OUTRO" || b.kassSceneMode === "EXPLAIN_WARM_SERIES_OUTRO") {
      sfxCues.push({
        effectId: "sfx_ding",
        frame: startF + 12,
        volume: 0.26,
        reason: `Beat #${i + 1} warm outro gentle chime`,
      });
    } else if (
      b.kassSceneMode === "GARDEN_STROLL_MANGO" ||
      b.kassSceneMode === "YARD_EVENING_CURIOUS" ||
      b.kassSceneMode === "BEDROOM_NIGHT_PLAN" ||
      b.kassSceneMode === "GARDEN_WATER_SPLASH" ||
      b.kassSceneMode === "GARDEN_SATELLITE_MOUNDS" ||
      b.kassSceneMode === "GARDEN_SCOUT_CLIMB_SHOE" ||
      b.kassSceneMode === "YARD_GRANDPA_RESCUE" ||
      b.kassSceneMode === "YARD_GRANDPA_WISDOM" ||
      b.kassSceneMode === "BEDROOM_GRAB_MAGNIFIER" ||
      b.kassSceneMode === "GARDEN_ANTS_CARRY_CATERPILLAR" ||
      b.kassSceneMode === "YARD_WATCH_RAIN_WINDOW" ||
      b.kassSceneMode === "GARDEN_RED_PATCH_WATER" ||
      b.kassSceneMode === "GARDEN_GRANDPA_BOY_NONLA"
    ) {
      sfxCues.push({
        effectId: "sfx_pop",
        frame: startF + Math.min(110, Math.floor(durF * 0.25)),
        volume: 0.28,
        reason: `Beat #${i + 1} V15 ComicSpeechBubble pop`,
      });
    } else if (
      b.kassSceneMode === "GARDEN_SURPRISE_HOP" ||
      b.kassSceneMode === "EXPLAIN_SYNC_ATTACK" ||
      b.kassSceneMode === "GARDEN_DARK_CLOUDS_RAIN"
    ) {
      sfxCues.push({
        effectId: "sfx_alert",
        frame: startF + Math.floor(durF * 0.16),
        volume: 0.30,
        reason: `Beat #${i + 1} V15 dramatic accent`,
      });
    } else if (
      b.kassSceneMode === "EXPLAIN_LIVING_ANT_RAFT" ||
      b.kassSceneMode === "EXPLAIN_AIR_BUBBLE_PHYSICS" ||
      b.kassSceneMode === "EXPLAIN_SEVEN_DAY_NOTEBOOK"
    ) {
      sfxCues.push({
        effectId: "sfx_ding",
        frame: startF + 22,
        volume: 0.25,
        reason: `Beat #${i + 1} V15 discovery highlight chime`,
      });
    }
  }

  return { bgmSegments, sfxCues, totalFrames, fps };
}

export interface MixMasterAudioParams {
  voiceMasterWavPath: string;
  beats: SoundDesignBeatInput[];
  totalFrames: number;
  fps?: number;
  outputWavPath: string;
  cacheDir?: string;
}

export interface MixMasterAudioResult {
  outputWavPath: string;
  plan: SoundDesignPlan;
  assets: SoundDesignAssetPaths;
  durationSec: number;
}

/**
 * Bộ Trộn Âm Thanh Phòng Thu 32-bit Float (Zero Clipping, Sample-Accurate):
 * - Resample giọng đọc chủ đạo lên 44.1kHz (giữ nguyên âm lượng 0dB sắc nét)
 * - Trộn 3 lớp Nhạc Nền BGM loop với crossfade 0.65s–0.8s & fade-in 0.5s / fade-out 0.8s ở mức -22dB (~0.095)
 * - Chèn chính xác từng sample toàn bộ 6 hiệu ứng SFX theo SoundDesignPlan
 * - Qua soft-limiter (0.94) để tuyệt đối không vỡ tiếng và xuất WAV 44.1kHz 16-bit
 */
export function mixMasterAudioWithSoundDesign(params: MixMasterAudioParams): MixMasterAudioResult {
  const fps = params.fps || 60;
  const assets = ensureSoundDesignAssets(params.cacheDir);
  const plan = buildAutoSoundDesignPlan(params.beats, fps);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "v13_sound_mix_"));
  try {
    const voice44kPath = path.join(tempDir, "voice_44k.wav");
    execSync(
      `ffmpeg -y -v error -i "${params.voiceMasterWavPath.replace(/\\/g, "/")}" -ar ${SAMPLE_RATE} -ac 1 -c:a pcm_s16le "${voice44kPath.replace(/\\/g, "/")}"`
    );

    const voiceDecoded = decodeWavToFloat32Mono(voice44kPath);
    const targetSamples = Math.max(
      voiceDecoded.samples.length,
      Math.ceil((params.totalFrames / fps) * SAMPLE_RATE)
    );
    const mixBuf = new Float32Array(targetSamples);

    // 1. Nạp giọng đọc chính (100% độ rõ, ưu tiên tuyệt đối)
    for (let i = 0; i < voiceDecoded.samples.length && i < targetSamples; i++) {
      mixBuf[i] = voiceDecoded.samples[i];
    }

    // 2. Nạp & trộn 3 đoạn BGM có loop mượt + crossfade chồng lấn 0.5s giữa các hồi
    const decodedBgm: Partial<Record<BgmTrackId, Float32Array>> = {};
    const getBgm = (id: BgmTrackId): Float32Array => {
      if (!decodedBgm[id]) {
        decodedBgm[id] = decodeWavToFloat32Mono(assets.bgm[id]).samples;
      }
      return decodedBgm[id]!;
    };

    for (let segIdx = 0; segIdx < plan.bgmSegments.length; segIdx++) {
      const seg = plan.bgmSegments[segIdx];
      const bgmData = getBgm(seg.trackId);
      const isFirst = segIdx === 0;
      const isLast = segIdx === plan.bgmSegments.length - 1;
      const overlapSamples = Math.floor(0.45 * SAMPLE_RATE);

      const startSample = Math.max(0, Math.floor((seg.startFrame / fps) * SAMPLE_RATE) - (isFirst ? 0 : overlapSamples));
      const endSample = Math.min(
        targetSamples,
        Math.floor((seg.endFrame / fps) * SAMPLE_RATE) + (isLast ? 0 : overlapSamples)
      );
      const fadeInSamples = Math.max(1, Math.floor(seg.fadeInSec * SAMPLE_RATE));
      const fadeOutSamples = Math.max(1, Math.floor(seg.fadeOutSec * SAMPLE_RATE));

      for (let s = startSample; s < endSample; s++) {
        const localIdx = s - startSample;
        const remainIdx = endSample - 1 - s;
        let env = 1.0;
        if (localIdx < fadeInSamples) {
          env *= localIdx / fadeInSamples;
        }
        if (remainIdx < fadeOutSamples) {
          env *= remainIdx / fadeOutSamples;
        }
        const loopSample = bgmData[localIdx % bgmData.length];
        mixBuf[s] += loopSample * seg.volume * env;
      }
    }

    // 3. Trộn chính xác từng sample toàn bộ các cue SFX
    const decodedSfx: Partial<Record<SfxEffectId, Float32Array>> = {};
    const getSfx = (id: SfxEffectId): Float32Array => {
      if (!decodedSfx[id]) {
        decodedSfx[id] = decodeWavToFloat32Mono(assets.sfx[id]).samples;
      }
      return decodedSfx[id]!;
    };

    for (const cue of plan.sfxCues) {
      const sfxData = getSfx(cue.effectId);
      const startSample = Math.max(0, Math.floor((cue.frame / fps) * SAMPLE_RATE));
      const maxLen = Math.min(sfxData.length, targetSamples - startSample);
      for (let i = 0; i < maxLen; i++) {
        mixBuf[startSample + i] += sfxData[i] * cue.volume;
      }
    }

    // 4. Soft-limiter mượt (ngưỡng 0.88 -> trần 0.96) bảo vệ chống méo đỉnh tín hiệu
    for (let i = 0; i < targetSamples; i++) {
      const x = mixBuf[i];
      const absX = Math.abs(x);
      if (absX > 0.88) {
        const excess = absX - 0.88;
        const limited = 0.88 + 0.08 * Math.tanh(excess / 0.08);
        mixBuf[i] = x >= 0 ? limited : -limited;
      }
    }

    fs.writeFileSync(params.outputWavPath, encodeWavMono16Bit(mixBuf, SAMPLE_RATE));
    return {
      outputWavPath: params.outputWavPath,
      plan,
      assets,
      durationSec: targetSamples / SAMPLE_RATE,
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Đóng gói nhanh SoundDesignPayload (data URL WAV) cho Remotion Studio / Next.js API Preview
 */
export function buildRemotionSoundDesignPayload(
  beats: SoundDesignBeatInput[],
  fps = 60,
  cacheDir = SOUND_DESIGN_CACHE_DIR
) {
  const assets = ensureSoundDesignAssets(cacheDir);
  const plan = buildAutoSoundDesignPlan(beats, fps);
  const toWavDataUrl = (filePath: string) =>
    `data:audio/wav;base64,${fs.readFileSync(filePath).toString("base64")}`;

  const bgmAudioUrls: Partial<Record<BgmTrackId, string>> = {};
  for (const seg of plan.bgmSegments) {
    if (!bgmAudioUrls[seg.trackId]) {
      bgmAudioUrls[seg.trackId] = toWavDataUrl(assets.bgm[seg.trackId]);
    }
  }
  const sfxAudioUrls: Partial<Record<SfxEffectId, string>> = {};
  for (const cue of plan.sfxCues) {
    if (!sfxAudioUrls[cue.effectId]) {
      sfxAudioUrls[cue.effectId] = toWavDataUrl(assets.sfx[cue.effectId]);
    }
  }

  return {
    bgmSegments: plan.bgmSegments,
    sfxCues: plan.sfxCues,
    bgmAudioUrls,
    sfxAudioUrls,
  };
}
