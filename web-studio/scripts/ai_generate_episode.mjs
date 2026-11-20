/**
 * AI DIRECTOR V17.2 — Bộ Đạo Diễn AI Sinh Kịch Bản Chuẩn V16 (Ưu tiên Groq Free API / Fallback Gemini)
 * Nhận: --topic="<chủ đề>" [--minutes=6.5] [--out=episodes/current_episode.json] [--model=...]
 * - Ưu tiên Groq OpenAI-compatible API (https://api.groq.com/openai/v1/chat/completions) khi có GROQ_API_KEY:
 *   + response_format: { type: "json_object" }
 *   + Xoay vòng model: [process.env.GROQ_MODEL || 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b']
 *   + Nghỉ 10 giây giữa các Hồi để không vượt giới hạn 8.000 token/phút (TPM) của Groq Free Plan.
 * - Nếu không có GROQ_API_KEY -> Fallback sang GEMINI_API_KEY với danh sách:
 *   [process.env.GEMINI_MODEL || 'gemini-3.8-flash', 'gemini-3.8-flash-lite', 'gemini-3.8-pro']
 * - Chia 4 Hồi nối tiếp (16 beats/Hồi × 4 Hồi = 64 beats), timeout 180_000ms (3 phút),
 *   HTTP 404 nhảy ngay model kế, HTTP 503/429 retry 3 lần trễ 8s -> 15s -> 25s.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveGeminiApiKey } from '../src/lib/v7/geminiTtsClient.ts';
import {
  sanitizeAndValidateEpisode,
  VALID_STAGE_TYPES,
  VALID_TIME_OF_DAY,
  VALID_WEATHER,
  VALID_TRANSITION_IN,
  VALID_BGM_MOOD,
  VALID_VOICE_TONE,
  VALID_ACTOR_PRESETS,
  VALID_ACTOR_SLOTS,
  VALID_ACTOR_FACING,
  VALID_ACTOR_MOTIONS,
  VALID_ACTOR_EXPRESSIONS,
  VALID_HAND_PROPS,
  VALID_PROP_ANIMATIONS,
} from '../src/lib/v7/episodeJsonSchema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webStudioRoot = path.resolve(__dirname, '..');

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const FETCH_TIMEOUT_MS = 180_000; // 3 phút
const RETRY_DELAYS_MS = [8_000, 15_000, 25_000]; // 3 lần retry: 8s / 15s / 25s
const GROQ_INTER_ACT_DELAY_MS = 10_000; // 10 giây nghỉ giữa các Hồi tránh chạm 8.000 TPM của Groq Free Plan
const GEMINI_INTER_ACT_DELAY_MS = 1_500;

const ACT_BLUEPRINTS = [
  {
    actNumber: 1,
    role: 'HỒI 1 — MỞ ĐẦU TÒ MÒ & TÌNH HUỐNG KHỞI PHÁT',
    defaultBgm: 'BGM_STORY_CALM',
    guide:
      'Mở hook tò mò ngay câu đầu tiên, giới thiệu nhân vật chính (BOY ngôi thứ nhất "tôi") và bối cảnh khởi phát thú vị, dẫn dắt vào tình huống chính một cách hồn nhiên hài hước.',
  },
  {
    actNumber: 2,
    role: 'HỒI 2 — DIỄN BIẾN & KHÁM PHÁ BẤT NGỜ',
    defaultBgm: 'BGM_STORY_CALM',
    guide:
      'Phát triển tình huống từ Hồi 1, lồng ghép khéo léo 2–3 cảnh giải thích khoa học ngắn dễ hiểu (EXPLAINER_POLKA_DOT) xen kẽ hành động thực tế sống động để nâng sự tò mò.',
  },
  {
    actNumber: 3,
    role: 'HỒI 3 — CAO TRÀO KỊCH TÍNH / HÀI HƯỚC ĐỈNH ĐIỂM',
    defaultBgm: 'BGM_TENSE_PULSE',
    guide:
      'Đẩy câu chuyện lên cao trào bất ngờ, dồn dập hoặc hài hước khó đỡ (dùng transitionIn: "CUT" ở 1–2 cú giật mình đắt giá, dùng bgmMood: "BGM_TENSE_PULSE", có tương tác sống động cùng nhân vật phụ như GRANDPA/DOCTOR/NEIGHBOR).',
  },
  {
    actNumber: 4,
    role: 'HỒI 4 — GIẢI ĐÁP THÚ VỊ & KẾT ẤM ÁP TỰ NHIÊN',
    defaultBgm: 'BGM_WARM_OUTRO',
    guide:
      'Giải quyết tình huống gọn gàng, rút ra góc nhìn khoa học thú vị một cách đời thường gần gũi (TUYỆT ĐỐI KHÔNG giáo điều/tuyên truyền), chuyển bgmMood sang "BGM_WARM_OUTRO" và kết bằng câu hỏi giao lưu thân thiện.',
  },
];

function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveGroqApiKey() {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim();
  }
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, '.env.local'),
    path.join(cwd, '.env'),
    path.resolve(cwd, '..', '.env.local'),
    path.resolve(cwd, '..', '.env'),
  ];
  for (const envPath of candidates) {
    try {
      if (!fs.existsSync(envPath)) continue;
      const content = fs.readFileSync(envPath, 'utf8');
      const m = content.match(/^\s*GROQ_API_KEY\s*=\s*(.+)\s*$/m);
      if (m && m[1]) {
        const cleaned = m[1].replace(/^["']|["']$/g, '').trim();
        if (cleaned) return cleaned;
      }
    } catch {}
  }
  return '';
}

function parseCliArgs(argv) {
  let topic = '';
  let minutes = 6.5;
  let outPath = 'episodes/current_episode.json';
  let cliModel = '';

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--topic=')) topic = a.slice('--topic='.length).trim();
    else if (a === '--topic' && argv[i + 1]) topic = argv[++i].trim();
    else if (a.startsWith('--minutes=')) minutes = parseFloat(a.slice('--minutes='.length)) || 6.5;
    else if (a === '--minutes' && argv[i + 1]) minutes = parseFloat(argv[++i]) || 6.5;
    else if (a.startsWith('--out=')) outPath = a.slice('--out='.length).trim();
    else if (a === '--out' && argv[i + 1]) outPath = argv[++i].trim();
    else if (a.startsWith('--model=')) cliModel = a.slice('--model='.length).trim();
    else if (a === '--model' && argv[i + 1]) cliModel = argv[++i].trim();
  }

  return { topic, minutes, outPath, cliModel };
}

function buildGroqModelCandidates(cliModel) {
  const primary = cliModel || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const rawList = [primary, 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'].filter(Boolean);
  return [...new Set(rawList)];
}

function buildGeminiModelCandidates(cliModel) {
  const primary =
    cliModel || process.env.GEMINI_MODEL || process.env.GEMINI_SCRIPT_MODEL || 'gemini-3.8-flash';
  const rawList = [primary, 'gemini-3.8-flash-lite', 'gemini-3.8-pro'].filter(Boolean);
  return [...new Set(rawList)];
}

function computeBeatsPerAct(targetMinutes) {
  // Với 6.5 phút -> 64 beats (16 beats/Hồi × 4 Hồi).
  const approxTotal = Math.round((targetMinutes * 60) / 6.0);
  const clampedTotal = Math.max(24, Math.min(64, approxTotal));
  const base = Math.floor(clampedTotal / 4);
  const rem = clampedTotal % 4;
  return [0, 1, 2, 3].map((i) => base + (i < rem ? 1 : 0));
}

function extractAndParseJson(rawText, modelName) {
  if (!rawText || !rawText.trim()) {
    throw new Error(`Model "${modelName}" trả về nội dung rỗng.`);
  }
  // Loại bỏ thẻ <think>...</think> (nếu model reasoning có sinh) và markdown fence ```json ... ```
  let cleaned = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed?.beats) || parsed.beats.length === 0) {
    throw new Error(`Model "${modelName}" trả về JSON thiếu mảng beats[].`);
  }
  return parsed;
}

function buildActSystemPrompt(actInfo, actBeatCount, startBeatIdx, totalBeats) {
  const maxExplainersInAct = Math.max(1, Math.min(3, Math.floor(actBeatCount * 0.19)));
  const isFirstAct = actInfo.actNumber === 1;

  return `Bạn là Đạo Diễn Biên Kịch Phim Hoạt Hình 2D Storytime / Khoa Học Đời Sống chuẩn V16 (người que 2D tối giản, gần gũi, hài hước đời thường).
Nhiệm vụ của lượt này: Viết DUY NHẤT **${actInfo.role}** (đúng **${actBeatCount} micro-beats**, đánh số từ beat_${String(
    startBeatIdx
  ).padStart(2, '0')} đến beat_${String(startBeatIdx + actBeatCount - 1).padStart(
    2,
    '0'
  )} trong tổng ${totalBeats} beats của cả tập phim).

=== QUY TẮC VÀNG BẮT BUỘC (CHUẨN V16–V17) ===
1. ĐỘ DÀI & NHỊP MICRO-BEAT 1-1:
   - Sinh ĐÚNG ${actBeatCount} phần tử trong mảng "beats".
   - MỖI micro-beat dài CHÍNH XÁC 15–28 từ tiếng Việt (~4.0s–5.5s đọc), chỉ diễn tả ĐÚNG 1 ý / 1 hành động cụ thể khớp 1-1 với hình ảnh trên màn hình.
   - Đặt "headerTitle" ngắn gọn (3–6 chữ IN HOA) ở beat đầu tiên của Hồi này (và tối đa 1 điểm nhấn nếu thật sự cần).
   - transitionIn: mặc định "CROSSFADE" (transitionFrames: 30 = 0.5s). ${
     isFirstAct
       ? 'Beat đầu tiên (beat_01) dùng "CUT" (transitionFrames: 0).'
       : 'Dùng "CUT" (transitionFrames: 0) cho các cú giật mình/bất ngờ hài hước.'
   } Luôn đặt pauseAfterSec: 0.4.

2. TỶ LỆ CẢNH SỐNG ĐỘNG & ĐA DẠNG BỐI CẢNH:
   - Tối đa ${maxExplainersInAct} beat dùng "EXPLAINER_POLKA_DOT" trong Hồi này; toàn bộ phần còn lại (>= 80%) phải dùng bối cảnh sống động có nhân vật hành động.
   - Thay đổi linh hoạt stageType, timeOfDay, actors[].motion, handProp và customProps qua từng beat để phim luôn cuốn hút.
   - Định hướng Hồi này: ${actInfo.guide}
   - Nhạc nền gợi ý cho Hồi này: "${actInfo.defaultBgm}".

3. VĂN PHONG & KHOA HỌC TRUNG THỰC:
   - Ngôi thứ nhất ("tôi", có thể tương tác cùng GRANDPA, GRANDMA, DOCTOR, NEIGHBOR), hồn nhiên, tò mò, có duyên.
   - TUYỆT ĐỐI CẤM tuyên truyền, giáo điều, khẩu hiệu ("Đừng bao giờ thử!", "Hãy nhớ kỹ bài học", "Quy tắc 3 bước").
   - TUYỆT ĐỐI KHÔNG bịa số liệu % hay thống kê giả (NO FAKE METRICS).

4. PHIÊN ÂM CHUẨN CHO VIENEU-TTS ("ttsText" vs "text"):
   - "text": phụ đề hiển thị chuẩn chính tả tiếng Việt (có thể viết số/ký hiệu: "2 giờ sáng", "CO₂", "7 ngày", "50").
   - "ttsText": phiên âm thuần Việt mượt mà cho máy đọc VieNeu-TTS (MỌI chữ số, đơn vị, từ tiếng Anh/khoa học đều viết rõ ra chữ tiếng Việt, VD: "hai giờ sáng", "khí các-bô-níc", "bảy ngày", "năm mươi", "ô-xy", "a-đrê-na-lin").

5. ĐẠO CỤ CHỦ ĐỀ BẰNG SVG PHẲNG ("customProps"):
   - Dùng 0–1 customProps/beat cho các vật thể đặc trưng của chủ đề (ngắn gọn để tiết kiệm token và giữ hình sạch đẹp).
   - "svgInner" vẽ trong khung 0..200 (viewBox="0 0 200 200"), nét viền đen phẳng 2D (stroke="#141414" stroke-width="4"), chỉ gồm 4–10 thẻ hình học cơ bản: <path>, <circle>, <ellipse>, <rect>, <line>, <polygon>, <polyline>, <g>. CẤM <script>, <style>, <text>, <image>, on*.
   - Đặt tọa độ x trong 220..1700, y trong 180..720 sao cho KHÔNG che mặt nhân vật (LEFT≈490, CENTER≈960, RIGHT≈1390, mặt ở y≈480..540).

6. BÓNG THOẠI ("bubble") TỰ NHIÊN & KHỚP ĐẠO CỤ CẦM TAY ("handProp"):
   - CHỈ gắn "bubble" cho khoảng 25%–35% số cảnh thực sự cần điểm nhấn hài hước hoặc cảm thán (~4–5 beat trong 16 beat của Hồi này); toàn bộ các cảnh còn lại BẮT BUỘC bỏ trống không điền "bubble".
   - Nội dung "bubble" phải là câu thốt ra ĐỜI THƯỜNG, cực ngắn 1–4 từ tự nhiên của người Việt (VD: "Toang rồi!", "Ủa gì vậy?!", "Khoan đã...", "Ảo thật đấy!", "Mắt hoa rồi!").
   - CẤM TUYỆT ĐỐI kiểu bóng thoại nhạt nhẽo/mô tả hành động hay cảm xúc như "Cười... ha ha...", "Khóc...", "Đang suy nghĩ...", "Suy nghĩ...", "Ngạc nhiên quá", "Sợ quá đi".
   - KHỚP ĐẠO CỤ CẦM TAY 1-1 VỚI LỜI THOẠI:
     + Nếu lời thoại nhắc cầm cốc / nước / trà / cà phê / nước ngọt -> BẮT BUỘC gán handProp: "CUP_SODA".
     + Nếu lời thoại nhắc cầm điện thoại / lướt máy / xem tin -> BẮT BUỘC gán handProp: "PHONE".
     + Nếu lời thoại nhắc ghi chép / sổ tay / nhật ký / vở -> BẮT BUỘC gán handProp: "NOTEBOOK".
     + Nhắc soi kính lúp -> "MAGNIFYING_GLASS", soi đèn pin -> "FLASHLIGHT", cầm vợt -> "NET", xách xô -> "BUCKET", cầm que/cành cây -> "STICK".

=== DANH SÁCH ENUM HỢP LỆ ===
- stageType: ${VALID_STAGE_TYPES.join(' | ')}
- timeOfDay: ${VALID_TIME_OF_DAY.join(' | ')}
- weather: ${VALID_WEATHER.join(' | ')}
- transitionIn: ${VALID_TRANSITION_IN.join(' | ')}
- bgmMood: ${VALID_BGM_MOOD.join(' | ')}
- voiceTone: ${VALID_VOICE_TONE.join(' | ')}
- actors[].preset: ${VALID_ACTOR_PRESETS.join(' | ')}
- actors[].slot: ${VALID_ACTOR_SLOTS.join(' | ')}
- actors[].facing: ${VALID_ACTOR_FACING.join(' | ')}
- actors[].motion: ${VALID_ACTOR_MOTIONS.join(' | ')}
- actors[].expression: ${VALID_ACTOR_EXPRESSIONS.join(' | ')}
- actors[].handProp: ${VALID_HAND_PROPS.join(' | ')}
- customProps[].animation: ${VALID_PROP_ANIMATIONS.join(' | ')}

=== ĐỊNH DẠNG JSON ĐẦU RA BẮT BUỘC ===
{
  ${isFirstAct ? '"title": "Tiêu đề hấp dẫn tiếng Việt cho cả tập phim",\n  "slug": "ten_khong_dau_gach_duoi",' : ''}
  "actTitle": "Hồi ${actInfo.actNumber}: Tên ngắn gọn của Hồi",
  "actSummary": "Tóm tắt 2-3 câu ngắn gọn diễn biến & trạng thái kết thúc của Hồi này để nối sang Hồi sau",
  "beats": [
    {
      "id": "beat_${String(startBeatIdx).padStart(2, '0')}",
      "actTitle": "Hồi ${actInfo.actNumber}: ...",
      "headerTitle": "TIÊU ĐỀ NỔI NGẮN (chỉ đặt ở beat đầu Hồi hoặc điểm nhấn)",
      "text": "Câu thoại phụ đề 15-28 từ chuẩn chính tả.",
      "ttsText": "Câu thoại phiên âm thuần Việt mượt mà cho VieNeu-TTS.",
      "stageType": "BEDROOM_INDOOR",
      "timeOfDay": "DAY",
      "weather": "CLEAR",
      "transitionIn": "${isFirstAct ? 'CUT' : 'CROSSFADE'}",
      "transitionFrames": ${isFirstAct ? 0 : 30},
      "pauseAfterSec": 0.4,
      "bgmMood": "${actInfo.defaultBgm}",
      "voiceTone": "CALM_STORY",
      "actors": [
        {
          "preset": "BOY",
          "slot": "LEFT",
          "facing": "RIGHT",
          "motion": "IDLE_TALK",
          "expression": "CURIOUS",
          "handProp": "NONE",
          "bubble": "Ủa gì vậy?! (CHỈ điền ở 25-35% cảnh cần nhấn, 1-4 từ đời thường; cảnh thường BỎ TRỐNG trường này)",
          "shiver": false
        }
      ],
      "customProps": [
        {
          "label": "Nhãn ngắn",
          "x": 1150,
          "y": 360,
          "scale": 1.0,
          "animation": "FLOAT",
          "svgInner": "<circle cx='100' cy='100' r='70' fill='#FEF08A' stroke='#141414' stroke-width='5'/>"
        }
      ]
    }
  ]
}
Chỉ trả về duy nhất một JSON object hợp lệ, không kèm văn bản giải thích bên ngoài.`;
}

function buildActUserPrompt({ topic, episodeTitle, actInfo, actBeatCount, previousSummaries, lastBeatText }) {
  const parts = [
    `Chủ đề tập phim: "${topic}"`,
    episodeTitle ? `Tiêu đề tập phim đang dùng: "${episodeTitle}"` : '',
  ].filter(Boolean);

  if (previousSummaries.length > 0) {
    parts.push('Tóm tắt mạch truyện các Hồi trước (bắt buộc nối tiếp mượt mà, không lặp lại tình tiết cũ):');
    for (const s of previousSummaries) {
      parts.push(`- ${s}`);
    }
  }
  if (lastBeatText) {
    parts.push(`Câu thoại cuối cùng ngay trước Hồi này: "${lastBeatText}"`);
  }

  parts.push(
    `Hãy viết tiếp ${actInfo.role} gồm ĐÚNG ${actBeatCount} micro-beats sống động, đồng bộ 1-1 hình ảnh và lời kể, trả về đúng JSON object theo yêu cầu.`
  );
  return parts.join('\n');
}

async function callSingleProviderRequest({ provider, apiKey, model, systemPrompt, userPrompt, signal }) {
  if (provider === 'GROQ') {
    const resp = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.78,
        max_tokens: 7200,
      }),
      signal,
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      const retryAfterSec = parseFloat(resp.headers.get('retry-after') || '');
      const err = new Error(`Groq HTTP ${resp.status} (${model}): ${body.slice(0, 280)}`);
      err.httpStatus = resp.status;
      err.errorBody = body;
      if (Number.isFinite(retryAfterSec) && retryAfterSec > 0) {
        err.retryAfterMs = Math.min(45_000, Math.ceil(retryAfterSec * 1000));
      }
      throw err;
    }

    const data = await resp.json();
    const rawText = String(data?.choices?.[0]?.message?.content || '').trim();
    return extractAndParseJson(rawText, model);
  }

  // Fallback: Gemini REST API
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.85,
        maxOutputTokens: 16384,
      },
    }),
    signal,
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    const err = new Error(`Gemini HTTP ${resp.status} (${model}): ${body.slice(0, 280)}`);
    err.httpStatus = resp.status;
    err.errorBody = body;
    throw err;
  }

  const data = await resp.json();
  const rawText = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || '')
    .join('')
    .trim();
  return extractAndParseJson(rawText, model);
}

async function callLlmWithFallback({ provider, apiKey, modelCandidates, systemPrompt, userPrompt, label }) {
  let lastErr = null;

  for (let mIdx = 0; mIdx < modelCandidates.length; mIdx++) {
    const model = modelCandidates[mIdx];
    const maxAttempts = RETRY_DELAYS_MS.length + 1; // 1 lượt đầu + 3 lần retry (8s / 15s / 25s)

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const t0 = Date.now();
      try {
        console.log(
          `-> [AI Director | ${provider} | ${label}] Gọi model "${model}" (lượt ${attempt}/${maxAttempts}, timeout=${FETCH_TIMEOUT_MS / 1000}s)...`
        );
        const parsed = await callSingleProviderRequest({
          provider,
          apiKey,
          model,
          systemPrompt,
          userPrompt,
          signal: controller.signal,
        });
        clearTimeout(timer);

        const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
        console.log(
          `  ✅ [${provider} | ${label}] Thành công với "${model}" sau ${elapsedSec}s (${parsed.beats.length} beats)!`
        );
        return { parsed, usedModel: model };
      } catch (err) {
        clearTimeout(timer);
        lastErr = err;
        const status = err?.httpStatus;
        const bodyStr = String(err?.errorBody || err?.message || '');
        const isModelMissing =
          status === 404 ||
          (status === 400 && /model_not_found|does not exist|decommissioned|not found/i.test(bodyStr));

        if (isModelMissing) {
          console.warn(
            `  ! Model "${model}" không khả dụng (HTTP ${status}): ${bodyStr.slice(0, 160)} -> Nhảy ngay sang model dự phòng kế tiếp!`
          );
          break; // Nhảy ngay sang model kế tiếp (0s delay)
        }

        const isAbort = err?.name === 'AbortError' || /abort/i.test(String(err?.message || ''));
        const isRetryableHttp = status === 503 || status === 429 || (status >= 500 && status < 600);
        const isJsonValidateErr = status === 400 && /json_validate_failed/i.test(bodyStr);
        const canRetrySameModel =
          attempt <= RETRY_DELAYS_MS.length && (isRetryableHttp || isAbort || isJsonValidateErr || !status);

        console.warn(
          `  ! [${provider} | ${label} | ${model} | lượt ${attempt}/${maxAttempts}] Lỗi: ${
            isAbort ? `Timeout sau ${FETCH_TIMEOUT_MS / 1000}s (AbortError)` : err?.message || err
          }`
        );

        if (canRetrySameModel) {
          const baseWaitMs = RETRY_DELAYS_MS[attempt - 1];
          const waitMs = Math.max(baseWaitMs, err?.retryAfterMs || 0);
          console.log(`  -> Chờ ${(waitMs / 1000).toFixed(0)}s rồi thử lại "${model}"...`);
          await sleepMs(waitMs);
        } else {
          break; // Chuyển sang model kế tiếp
        }
      }
    }
  }

  throw lastErr || new Error(`[${provider} | ${label}] Tất cả model dự phòng đều thất bại: ${modelCandidates.join(', ')}`);
}

async function generateEpisodeInFourActs({ provider, apiKey, initialModelCandidates, topic, minutes }) {
  const beatsPerAct = computeBeatsPerAct(minutes);
  const totalPlannedBeats = beatsPerAct.reduce((a, b) => a + b, 0);
  const interActDelayMs = provider === 'GROQ' ? GROQ_INTER_ACT_DELAY_MS : GEMINI_INTER_ACT_DELAY_MS;

  console.log(
    `-> Provider: ${provider} | Kế hoạch 4 Hồi nối tiếp: [${beatsPerAct.join(' + ')}] = ${totalPlannedBeats} micro-beats`
  );
  console.log(
    `-> Danh sách model xoay vòng: [${initialModelCandidates.join(' -> ')}] | Nghỉ giữa Hồi: ${interActDelayMs / 1000}s`
  );

  let activeModelOrder = [...initialModelCandidates];
  let episodeTitle = '';
  let episodeSlug = '';
  const allRawBeats = [];
  const previousSummaries = [];
  let lastBeatText = '';
  let runningIdx = 1;

  for (let i = 0; i < ACT_BLUEPRINTS.length; i++) {
    const actInfo = ACT_BLUEPRINTS[i];
    const actBeatCount = beatsPerAct[i];
    const systemPrompt = buildActSystemPrompt(actInfo, actBeatCount, runningIdx, totalPlannedBeats);
    const userPrompt = buildActUserPrompt({
      topic,
      episodeTitle,
      actInfo,
      actBeatCount,
      previousSummaries,
      lastBeatText,
    });

    const { parsed, usedModel } = await callLlmWithFallback({
      provider,
      apiKey,
      modelCandidates: activeModelOrder,
      systemPrompt,
      userPrompt,
      label: `Hồi ${actInfo.actNumber}/4 (${actBeatCount} beats)`,
    });

    // Ghim model đang hoạt động tốt lên đầu cho các Hồi sau
    activeModelOrder = [usedModel, ...activeModelOrder.filter((m) => m !== usedModel)];

    if (actInfo.actNumber === 1) {
      if (typeof parsed.title === 'string' && parsed.title.trim()) episodeTitle = parsed.title.trim();
      if (typeof parsed.slug === 'string' && parsed.slug.trim()) episodeSlug = parsed.slug.trim();
    }

    const actTitle =
      typeof parsed.actTitle === 'string' && parsed.actTitle.trim()
        ? parsed.actTitle.trim()
        : `Hồi ${actInfo.actNumber}`;

    const actBeats = parsed.beats.slice(0, actBeatCount + 2).map((b, bIdx) => {
      const globalNum = allRawBeats.length + bIdx + 1;
      return {
        ...b,
        id: `beat_${String(globalNum).padStart(2, '0')}`,
        actTitle: b?.actTitle || actTitle,
      };
    });

    allRawBeats.push(...actBeats);
    runningIdx += actBeats.length;

    const summaryText =
      typeof parsed.actSummary === 'string' && parsed.actSummary.trim()
        ? `${actTitle}: ${parsed.actSummary.trim()}`
        : `${actTitle}: ${actBeats
            .slice(-3)
            .map((b) => String(b.text || '').trim())
            .join(' ')}`;
    previousSummaries.push(summaryText);

    const tailBeat = actBeats[actBeats.length - 1];
    lastBeatText = String(tailBeat?.text || tailBeat?.narrationText || '').trim();

    if (i < ACT_BLUEPRINTS.length - 1) {
      console.log(`  ⏳ Nghỉ ${interActDelayMs / 1000}s trước khi sinh Hồi ${actInfo.actNumber + 1}/4 (tránh vượt giới hạn TPM)...`);
      await sleepMs(interActDelayMs);
    }
  }

  return sanitizeAndValidateEpisode(
    {
      title: episodeTitle || topic,
      slug: episodeSlug || undefined,
      topic,
      beats: allRawBeats,
    },
    topic
  );
}

async function main() {
  const { topic, minutes, outPath, cliModel } = parseCliArgs(process.argv.slice(2));
  if (!topic) {
    console.error('Lỗi: Thiếu tham số --topic="<chủ đề video>"!');
    process.exit(1);
  }

  // Ưu tiên tuyệt đối Groq Free API khi có GROQ_API_KEY; chỉ fallback về GEMINI_API_KEY khi không có GROQ_API_KEY
  const groqApiKey = resolveGroqApiKey();
  let provider = 'GROQ';
  let apiKey = groqApiKey;
  let initialModelCandidates = buildGroqModelCandidates(cliModel);

  if (!groqApiKey) {
    const geminiApiKey = resolveGeminiApiKey();
    if (!geminiApiKey) {
      console.error('Lỗi: Không tìm thấy GROQ_API_KEY hay GEMINI_API_KEY trong môi trường hoặc .env/.env.local!');
      process.exit(1);
    }
    provider = 'GEMINI';
    apiKey = geminiApiKey;
    initialModelCandidates = buildGeminiModelCandidates(cliModel);
    console.log('-> Không phát hiện GROQ_API_KEY, tự động fallback sang GEMINI_API_KEY...');
  }

  const episode = await generateEpisodeInFourActs({
    provider,
    apiKey,
    initialModelCandidates,
    topic,
    minutes,
  });

  const resolvedOut = path.isAbsolute(outPath) ? outPath : path.resolve(webStudioRoot, outPath);
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  fs.writeFileSync(resolvedOut, JSON.stringify(episode, null, 2), 'utf8');

  const explainerCount = episode.beats.filter((b) => b.stageType === 'EXPLAINER_POLKA_DOT').length;
  const liveCount = episode.beats.length - explainerCount;
  const propCount = episode.beats.reduce((acc, b) => acc + (b.customProps?.length || 0), 0);
  const avgWords =
    episode.beats.reduce((acc, b) => acc + b.text.split(/\s+/).filter(Boolean).length, 0) /
    Math.max(1, episode.beats.length);

  console.log('====================================================================');
  console.log(`✅ AI DIRECTOR V17.2 (${provider} — 4 HỒI NỐI TIẾP) HOÀN TẤT: "${episode.title}"`);
  console.log(`-> Slug: ${episode.slug}`);
  console.log(`-> Tổng số Micro-Beats: ${episode.beats.length} (TB ${avgWords.toFixed(1)} từ/beat)`);
  console.log(
    `-> Tỷ lệ cảnh sống động 60fps: ${liveCount}/${episode.beats.length} (${(
      (liveCount / episode.beats.length) *
      100
    ).toFixed(1)}%) | Explainer: ${explainerCount} | Custom SVG Props: ${propCount}`
  );
  console.log(`-> Đã lưu file sạch: ${resolvedOut}`);
  console.log('====================================================================');
}

main().catch((err) => {
  console.error('Fatal AI Director error:', err);
  process.exit(1);
});
