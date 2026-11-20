/**
 * SFX GENERATOR V9.0: Pure Mathematical PCM WAV Sound Effects Generator
 * Tạo 5 hiệu ứng âm thanh chuẩn Storytime/Explainer (24kHz, 16-bit Mono PCM WAV Base64)
 * Không phụ thuộc file âm thanh ngoài, chạy 100% trên cả Node.js và Browser Remotion.
 */

export type SfxType = "sfx_pop" | "sfx_whoosh" | "sfx_tick" | "sfx_thud" | "sfx_ding";

const sfxCache = new Map<SfxType, string>();

function encodeBytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");
  }
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(sub));
  }
  return btoa(binary);
}

/**
 * Đóng gói mảng mẫu float [-1, 1] thành chuỗi Data URL audio/wav chuẩn 16-bit PCM
 */
export function samplesToWavDataUrl(samples: Float32Array, sampleRate: number = 24000): string {
  const numSamples = samples.length;
  const dataByteLength = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + dataByteLength, true);
  writeAscii(8, "WAVE");

  // fmt subchunk
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // AudioFormat = 1 (PCM)
  view.setUint16(22, 1, true); // NumChannels = 1 (Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample = 16

  // data subchunk
  writeAscii(36, "data");
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = clamped < 0 ? Math.round(clamped * 32768) : Math.round(clamped * 32767);
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return `data:audio/wav;base64,${encodeBytesToBase64(new Uint8Array(buffer))}`;
}

/**
 * Sinh hiệu ứng âm thanh Storytime theo loại:
 * - sfx_pop: Tiếng "Bụp / Pop" khi hiện Callout Badge, bóng suy nghĩ hoặc chữ tượng thanh
 * - sfx_whoosh: Tiếng "Vút" chuyển cảnh hoặc thẻ đồ họa bay vào
 * - sfx_tick: Tiếng "Tích / Cạch" khi lật lịch ngày/tuần, kim đồng hồ hoặc khắc vạch
 * - sfx_thud: Tiếng "Thình / Trầm" khi mở Chapter Card hoặc cán cân nghiêng mạnh
 * - sfx_ding: Tiếng "Tinh!" sáng ý tưởng, mở cửa sự sống hoặc phát hiện quan trọng
 */
export function generateSfxDataUrl(type: SfxType): string {
  const cached = sfxCache.get(type);
  if (cached) return cached;

  const sampleRate = 24000;
  let samples: Float32Array;

  if (type === "sfx_pop") {
    const durationSec = 0.095;
    const total = Math.floor(sampleRate * durationSec);
    samples = new Float32Array(total);
    let phase = 0;
    for (let i = 0; i < total; i++) {
      const t = i / sampleRate;
      const u = i / total;
      // Tần số quét nhanh từ 360Hz lên 980Hz tạo tiếng "Bụp!" tròn trịa
      const freq = 360 + 620 * Math.pow(u, 0.65);
      phase += (2 * Math.PI * freq) / sampleRate;
      const attack = Math.min(1, i / (sampleRate * 0.006));
      const decay = Math.exp(-u * 5.2);
      samples[i] = (Math.sin(phase) * 0.8 + Math.sin(phase * 1.9) * 0.2) * attack * decay * 0.85;
    }
  } else if (type === "sfx_whoosh") {
    const durationSec = 0.24;
    const total = Math.floor(sampleRate * durationSec);
    samples = new Float32Array(total);
    let lp1 = 0;
    let lp2 = 0;
    let phase = 0;
    for (let i = 0; i < total; i++) {
      const u = i / total;
      // Bao hình chuông mượt
      const env = Math.sin(Math.PI * u) * Math.exp(-Math.pow((u - 0.42) * 2.5, 2));
      // Nhiễu trắng lọc thông thấp có tần số cắt quét theo thời gian
      const white = (Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
      const noise = (white < 0 ? white + 1 : white) * 2 - 1;
      const alpha = 0.08 + 0.26 * Math.sin(Math.PI * u);
      lp1 += alpha * (noise - lp1);
      lp2 += alpha * (lp1 - lp2);

      // Cộng âm trầm gió lướt 240Hz -> 95Hz
      const swipeFreq = 240 - 145 * u;
      phase += (2 * Math.PI * swipeFreq) / sampleRate;
      samples[i] = (lp2 * 0.75 + Math.sin(phase) * 0.35) * env * 0.85;
    }
  } else if (type === "sfx_tick") {
    const durationSec = 0.055;
    const total = Math.floor(sampleRate * durationSec);
    samples = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t / 0.0075);
      const tone1 = Math.sin(2 * Math.PI * 1750 * t);
      const tone2 = Math.sin(2 * Math.PI * 3350 * t) * 0.55;
      const click = i < 40 ? ((i % 2 === 0 ? 1 : -1) * 0.35) : 0;
      samples[i] = (tone1 + tone2 + click) * env * 0.7;
    }
  } else if (type === "sfx_thud") {
    const durationSec = 0.32;
    const total = Math.floor(sampleRate * durationSec);
    samples = new Float32Array(total);
    let phase = 0;
    for (let i = 0; i < total; i++) {
      const t = i / sampleRate;
      const u = i / total;
      // Pitch drop từ 145Hz xuống 38Hz tạo tiếng trống trầm điện ảnh
      const freq = 38 + 107 * Math.exp(-t * 24);
      phase += (2 * Math.PI * freq) / sampleRate;
      const attack = Math.min(1, i / (sampleRate * 0.004));
      const decay = Math.exp(-u * 4.5);
      const subHarmonic = Math.sin(phase * 0.5) * 0.45;
      samples[i] = Math.tanh((Math.sin(phase) + subHarmonic) * 1.3) * attack * decay * 0.85;
    }
  } else {
    // sfx_ding
    const durationSec = 0.42;
    const total = Math.floor(sampleRate * durationSec);
    samples = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const t = i / sampleRate;
      const attack = Math.min(1, i / (sampleRate * 0.005));
      const env1 = Math.exp(-t * 6.5);
      const env2 = Math.exp(-t * 11.0);
      const f1 = Math.sin(2 * Math.PI * 1046.5 * t) * env1 * 0.65;
      const f2 = Math.sin(2 * Math.PI * 2093.0 * t) * env2 * 0.3;
      const f3 = Math.sin(2 * Math.PI * 3139.5 * t) * Math.exp(-t * 16.0) * 0.15;
      samples[i] = (f1 + f2 + f3) * attack * 0.85;
    }
  }

  const dataUrl = samplesToWavDataUrl(samples, sampleRate);
  sfxCache.set(type, dataUrl);
  return dataUrl;
}
