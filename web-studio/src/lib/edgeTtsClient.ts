import crypto from "crypto";
import { WebSocket } from "ws";
import { SubtitleWord } from "../remotion/types/sceneGraph";

export interface EdgeTtsResult {
  audioBase64: string;
  durationMs: number;
  words: SubtitleWord[];
}

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WIN_EPOCH_SECONDS = 11644473600;
const EDGE_GEC_VERSION = "1-132.0.2957.140";

/**
 * Tạo mã bảo mật Sec-MS-GEC chuẩn Microsoft Edge Read Aloud (SHA-256)
 */
export function generateSecMsGec(): string {
  const unixSeconds = Math.floor(Date.now() / 1000);
  const winSeconds = unixSeconds + WIN_EPOCH_SECONDS;
  const roundedSeconds = winSeconds - (winSeconds % 300);
  const ticks100ns = BigInt(roundedSeconds) * BigInt(10000000);
  const strToHash = `${ticks100ns.toString()}${TRUSTED_CLIENT_TOKEN}`;
  return crypto.createHash("sha256").update(strToHash, "ascii").digest("hex").toUpperCase();
}

/**
 * Thoát các ký tự XML đặc biệt trong SSML
 */
function escapeSsmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Dự phòng: Tổng hợp giọng nói Tiếng Việt khi kết nối WebSocket bị gián đoạn
 */
async function synthesizeFallbackVietnameseTts(
  text: string,
  rate: string = "+10%"
): Promise<EdgeTtsResult> {
  const rawChunks = text
    .split(/(?<=[.,!?;:—])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks = rawChunks.length > 0 ? rawChunks : [text.trim()];
  const buffers: Buffer[] = [];

  const rateNum = parseFloat(rate.replace("%", "")) || 0;
  const ttsSpeed = rateNum <= -10 ? "0.85" : "1.0";

  for (const chunk of chunks) {
    const encoded = encodeURIComponent(chunk);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&ttsspeed=${ttsSpeed}&q=${encoded}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.2957.140 Safari/537.36",
      },
    });
    if (!res.ok) {
      throw new Error(`Fallback TTS HTTP ${res.status}`);
    }
    const arrBuf = await res.arrayBuffer();
    buffers.push(Buffer.from(arrBuf));
  }

  const fullBuffer = Buffer.concat(buffers);
  const wordTokens = text.trim().split(/\s+/).filter(Boolean);
  const durationFromBytes = Math.round((fullBuffer.length / 10500) * 1000);
  const durationFromWords = wordTokens.length * 210;
  const rawDurationMs = Math.max(
    450,
    Math.round(durationFromWords * 0.6 + durationFromBytes * 0.4)
  );
  const perWordMs = rawDurationMs / Math.max(1, wordTokens.length);
  const words: SubtitleWord[] = wordTokens.map((w, idx) => ({
    word: w,
    startMs: Math.round(idx * perWordMs),
    endMs: Math.round((idx + 1) * perWordMs),
  }));

  return {
    audioBase64: fullBuffer.toString("base64"),
    durationMs: rawDurationMs,
    words,
  };
}

/**
 * Pure TypeScript Microsoft Edge-TTS client (api.msedgeservices.com)
 * Khóa mặc định giọng Nam trầm ấm vi-VN-NamMinhNeural (125Hz Baritone)
 */
export async function synthesizeEdgeTts(
  text: string,
  voice: string = "vi-VN-NamMinhNeural",
  rate: string = "+10%",
  pitch: string = "-6Hz",
  volume: string = "+5%"
): Promise<EdgeTtsResult> {
  const cleanText = text.trim();
  if (!cleanText) {
    return { audioBase64: "", durationMs: 300, words: [] };
  }

  // Luôn ưu tiên giọng Nam trầm ấm vi-VN-NamMinhNeural
  const effectiveVoice =
    !voice || voice.includes("HoaiMy") ? "vi-VN-NamMinhNeural" : voice;

  try {
    return await new Promise<EdgeTtsResult>((resolve, reject) => {
      const secMsGec = generateSecMsGec();
      const connectId = crypto.randomUUID().replace(/-/g, "");
      const muid = crypto.randomBytes(16).toString("hex").toUpperCase();
      const endpoint =
        `wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1` +
        `?Ocp-Apim-Subscription-Key=${TRUSTED_CLIENT_TOKEN}` +
        `&Sec-MS-GEC=${secMsGec}` +
        `&Sec-MS-GEC-Version=${EDGE_GEC_VERSION}` +
        `&ConnectionId=${connectId}`;

      const ws = new WebSocket(endpoint, {
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
          Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.2957.140 Safari/537.36 Edg/132.0.2957.140",
          Cookie: `muid=${muid};`,
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });

      const audioChunks: Buffer[] = [];
      const words: SubtitleWord[] = [];

      const timeout = setTimeout(() => {
        try {
          ws.close();
        } catch {}
        reject(new Error("Edge-TTS WebSocket timeout sau 8 giây"));
      }, 8000);

      ws.on("open", () => {
        const date = new Date().toISOString();
        const configMessage =
          `X-Timestamp:${date}\r\n` +
          "Content-Type:application/json; charset=utf-8\r\n" +
          "Path:speech.config\r\n\r\n" +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: {
                    sentenceBoundaryEnabled: "false",
                    wordBoundaryEnabled: "true",
                  },
                  outputFormat: "audio-24khz-48kbitrate-mono-mp3",
                },
              },
            },
          });

        ws.send(configMessage);

        const requestId = crypto.randomUUID().replace(/-/g, "");
        const ssml =
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>` +
          `<voice name='${effectiveVoice}'>` +
          `<prosody rate='${rate}' pitch='${pitch}' volume='${volume}'>${escapeSsmlText(cleanText)}</prosody>` +
          `</voice></speak>`;

        const requestMessage =
          `X-RequestId:${requestId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${date}\r\n` +
          "Path:ssml\r\n\r\n" +
          ssml;

        ws.send(requestMessage);
      });

      ws.on("message", (data: any, isBinary: boolean) => {
        if (isBinary) {
          const buffer = Buffer.from(data);
          if (buffer.length > 2) {
            const headerLen = buffer.readUInt16BE(0);
            if (headerLen + 2 <= buffer.length) {
              const audioPart = buffer.subarray(headerLen + 2);
              if (audioPart.length > 0) {
                audioChunks.push(audioPart);
              }
            }
          }
        } else {
          const textMsg = data.toString();
          if (textMsg.includes("Path:audio.metadata")) {
            const bodyIndex = textMsg.indexOf("\r\n\r\n");
            if (bodyIndex !== -1) {
              try {
                const jsonBody = JSON.parse(textMsg.substring(bodyIndex + 4));
                if (jsonBody.Metadata) {
                  for (const meta of jsonBody.Metadata) {
                    if (meta.Type === "WordBoundary" && meta.Data) {
                      const offsetMs = meta.Data.Offset / 10000;
                      const durationMs = meta.Data.Duration / 10000;
                      words.push({
                        word: meta.Data.text.Text,
                        startMs: Math.round(offsetMs),
                        endMs: Math.round(offsetMs + durationMs),
                      });
                    }
                  }
                }
              } catch {
                // Ignore metadata parse error
              }
            }
          } else if (textMsg.includes("Path:turn.end")) {
            clearTimeout(timeout);
            ws.close();

            const fullAudio = Buffer.concat(audioChunks);
            if (fullAudio.length < 100) {
              reject(new Error("Edge-TTS trả về dữ liệu âm thanh rỗng"));
              return;
            }
            const lastWord = words[words.length - 1];
            const estimatedFromBytes = Math.round((fullAudio.length / 6000) * 1000);
            const totalDuration = lastWord
              ? Math.max(lastWord.endMs + 120, estimatedFromBytes)
              : estimatedFromBytes;

            resolve({
              audioBase64: fullAudio.toString("base64"),
              durationMs: totalDuration,
              words,
            });
          }
        }
      });

      ws.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  } catch {
    return await synthesizeFallbackVietnameseTts(cleanText, rate);
  }
}
