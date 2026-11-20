/**
 * AI DIRECTOR V17.0 — Bộ Đạo Diễn AI Sinh Kịch Bản Chuẩn V16 (JSON Auto-Factory)
 * Nhận: --topic="<chủ đề>" [--minutes=6.5] [--out=episodes/current_episode.json] [--model=gemini-2.5-flash]
 * Gọi Gemini REST API (responseMimeType: "application/json") -> sanitizeAndValidateEpisode() -> lưu JSON sạch.
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

function parseCliArgs(argv) {
  let topic = '';
  let minutes = 6.5;
  let outPath = 'episodes/current_episode.json';
  let model = process.env.GEMINI_SCRIPT_MODEL || 'gemini-2.5-flash';

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--topic=')) topic = a.slice('--topic='.length).trim();
    else if (a === '--topic' && argv[i + 1]) topic = argv[++i].trim();
    else if (a.startsWith('--minutes=')) minutes = parseFloat(a.slice('--minutes='.length)) || 6.5;
    else if (a === '--minutes' && argv[i + 1]) minutes = parseFloat(argv[++i]) || 6.5;
    else if (a.startsWith('--out=')) outPath = a.slice('--out='.length).trim();
    else if (a === '--out' && argv[i + 1]) outPath = argv[++i].trim();
    else if (a.startsWith('--model=')) model = a.slice('--model='.length).trim();
    else if (a === '--model' && argv[i + 1]) model = argv[++i].trim();
  }

  return { topic, minutes, outPath, model };
}

function buildSystemPrompt(targetMinutes) {
  const targetBeats = Math.max(24, Math.min(64, Math.round((targetMinutes * 60) / 6.2)));
  const minBeats = Math.max(20, Math.min(56, targetBeats - 4));
  const maxBeats = Math.max(minBeats + 4, Math.min(64, targetBeats + 4));
  const maxExplainers = Math.max(4, Math.min(12, Math.floor(maxBeats * 0.19)));

  return `Bạn là Đạo Diễn Biên Kịch Phim Hoạt Hình 2D Storytime / Khoa Học Đời Sống chuẩn V16 (phong cách kể chuyện gần gũi, hài hước đời thường, hình ảnh người que 2D tối giản).
Nhiệm vụ: Chuyển một chủ đề bất kỳ thành 1 tập phim hoàn chỉnh định dạng JSON theo đúng schema AutoEpisodeSpec dưới đây.

=== QUY TẮC VÀNG BẮT BUỘC (CHUẨN V16–V17) ===
1. CẤU TRÚC & ĐỘ DÀI:
   - Sinh đúng từ ${minBeats} đến ${maxBeats} micro-beats, chia cân đối thành 4 Hồi (Hồi 1: Mở đầu tò mò & tình huống; Hồi 2: Diễn biến & khám phá bất ngờ; Hồi 3: Cao trào hài hước / kịch tính; Hồi 4: Giải đáp thú vị & kết ấm áp).
   - Đặt "headerTitle" ngắn gọn (3–6 chữ IN HOA) ở beat mở đầu mỗi Hồi (và tối đa vài điểm nhấn quan trọng).
   - MỖI micro-beat dài CHÍNH XÁC 15–28 từ tiếng Việt (~4.0s–5.5s đọc), chỉ diễn tả ĐÚNG 1 ý / 1 hành động cụ thể khớp 1-1 với hình ảnh trên màn hình.

2. ĐỒNG BỘ 1-1 HÌNH ẢNH ↔ LỜI KỂ & TỶ LỆ CẢNH SỐNG ĐỘNG:
   - Tối thiểu 78% micro-beats dùng bối cảnh sống động có nhân vật hành động (KHÔNG quá ${maxExplainers} micro-beats dùng "EXPLAINER_POLKA_DOT").
   - Luân phiên thay đổi stageType, timeOfDay, actors[].motion, handProp và customProps qua các beat để phim luôn sinh động, không lặp cứng một tư thế.
   - transitionIn: mặc định "CROSSFADE" (transitionFrames: 30 = 0.5s). Riêng beat đầu tiên và các cú giật mình/bất ngờ hài hước thì dùng "CUT" (transitionFrames: 0). Luôn đặt pauseAfterSec: 0.4.

3. VĂN PHONG & KHOA HỌC TRUNG THỰC:
   - Kể chuyện ngôi thứ nhất ("tôi", có thể tương tác cùng ông nội GRANDPA, bà ngoại GRANDMA, bác sĩ DOCTOR hoặc hàng xóm NEIGHBOR).
   - Hồn nhiên, tò mò, có miếng hài đời thường dễ thương.
   - TUYỆT ĐỐI CẤM văn phong tuyên truyền, giáo điều, khẩu hiệu ("Đừng bao giờ thử!", "Hãy luôn ghi nhớ bài học", "Quy tắc 3 bước an toàn").
   - TUYỆT ĐỐI KHÔNG bịa số liệu % hay thống kê giả (NO FAKE METRICS).

4. PHIÊN ÂM CHUẨN CHO VIENEU-TTS ("ttsText" vs "text"):
   - "text": phụ đề hiển thị chuẩn chính tả tiếng Việt (được viết số, ký hiệu như "2 giờ sáng", "CO₂", "7 ngày", "50").
   - "ttsText": phiên âm thuần Việt mượt mà cho máy đọc VieNeu-TTS (MỌI chữ số, đơn vị, từ tiếng Anh/khoa học đều viết rõ ra chữ tiếng Việt, VD: "hai giờ sáng", "khí các-bô-níc", "bảy ngày", "năm mươi", "ô-xy", "a-đrê-na-lin", "đô-pa-min", "ti-vi").

5. ĐẠO CỤ CHỦ ĐỀ BẰNG SVG PHẲNG ("customProps"):
   - Tận dụng 0–2 customProps/beat cho các vật thể đặc trưng của chủ đề (đồng hồ báo thức, não bộ, cốc cà phê, hành tinh, tế bào, vi khuẩn, kính hiển vi, tên lửa...).
   - "svgInner" vẽ trong tọa độ 0..200 (viewBox="0 0 200 200"), phong cách 2D phẳng nét viền đen gọn đẹp (stroke="#141414" stroke-width="4"), chỉ gồm 5–15 thẻ hình học cơ bản: <path>, <circle>, <ellipse>, <rect>, <line>, <polygon>, <polyline>, <g>. TUYỆT ĐỐI KHÔNG dùng <script>, <style>, <text>, <image>, hay sự kiện on*.
   - Đặt tọa độ x trong 220..1700, y trong 180..720 sao cho KHÔNG che mặt nhân vật (LEFT≈490, CENTER≈960, RIGHT≈1390, mặt ở y≈480..540).

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
  "title": "Tiêu đề hấp dẫn tiếng Việt",
  "slug": "ten_khong_dau_gach_duoi",
  "beats": [
    {
      "id": "beat_01",
      "actTitle": "Hồi 1: ...",
      "headerTitle": "TIÊU ĐỀ NỔI NGẮN (chỉ đặt ở beat cần nhấn)",
      "text": "Câu thoại phụ đề 15-28 từ chuẩn chính tả tiếng Việt.",
      "ttsText": "Câu thoại phiên âm thuần Việt hoàn hảo cho VieNeu-TTS.",
      "stageType": "BEDROOM_INDOOR",
      "timeOfDay": "NIGHT",
      "weather": "CLEAR",
      "transitionIn": "CROSSFADE",
      "transitionFrames": 30,
      "pauseAfterSec": 0.4,
      "bgmMood": "BGM_STORY_CALM",
      "voiceTone": "HOOK_INTRIGUE",
      "actors": [
        {
          "preset": "BOY",
          "slot": "LEFT",
          "facing": "RIGHT",
          "motion": "IDLE_TALK",
          "expression": "CURIOUS",
          "handProp": "PHONE",
          "bubble": "Câu thoại ngắn 2-5 chữ",
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
      ],
      "callout": { "text": "Từ khóa ngắn (tùy chọn)", "x": 960, "y": 200 }
    }
  ]
}
Chỉ trả về duy nhất JSON hợp lệ, không bọc markdown fence.`;
}

async function callGeminiGenerateEpisode({ apiKey, model, topic, minutes }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const systemPrompt = buildSystemPrompt(minutes);
  const userPrompt = `Hãy viết trọn bộ kịch bản phim hoạt hình 2D dài khoảng ${minutes} phút cho chủ đề: "${topic}". Đảm bảo đủ số micro-beats theo yêu cầu, đồng bộ 1-1 lời kể và hành động, giàu hình ảnh customProps SVG sinh động và hoàn toàn không giáo điều.`;

  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`-> [AI Director] Gọi Gemini API (${model}, lượt ${attempt}/3) cho chủ đề: "${topic}"...`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 180000);
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.85,
            maxOutputTokens: 32768,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!resp.ok) {
        const body = await resp.text().catch(() => '');
        throw new Error(`Gemini HTTP ${resp.status}: ${body.slice(0, 320)}`);
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('')
        .trim();
      if (!rawText) {
        throw new Error('Gemini API trả về nội dung rỗng.');
      }

      const stripped = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(stripped);
      return sanitizeAndValidateEpisode(parsed, topic);
    } catch (err) {
      lastErr = err;
      console.warn(`  ! Lượt ${attempt}/3 gặp lỗi: ${err?.message || err}`);
      if (attempt < 3) {
        const waitMs = attempt * 6000;
        console.log(`  -> Chờ ${waitMs / 1000}s rồi thử lại...`);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
  }
  throw lastErr || new Error('Không thể gọi Gemini API sinh kịch bản.');
}

async function main() {
  const { topic, minutes, outPath, model } = parseCliArgs(process.argv.slice(2));
  if (!topic) {
    console.error('Lỗi: Thiếu tham số --topic="<chủ đề video>"!');
    process.exit(1);
  }

  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    console.error('Lỗi: Không tìm thấy GEMINI_API_KEY trong môi trường hoặc file .env/.env.local!');
    process.exit(1);
  }

  const episode = await callGeminiGenerateEpisode({ apiKey, model, topic, minutes });

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
  console.log(`✅ AI DIRECTOR V17.0 HOÀN TẤT KỊCH BẢN: "${episode.title}"`);
  console.log(`-> Slug: ${episode.slug}`);
  console.log(`-> Tổng số Micro-Beats: ${episode.beats.length} (TB ${avgWords.toFixed(1)} từ/beat)`);
  console.log(
    `-> Tỷ lệ cảnh sống động 60fps: ${liveCount}/${episode.beats.length} (${((liveCount / episode.beats.length) * 100).toFixed(
      1
    )}%) | Explainer: ${explainerCount} | Custom SVG Props: ${propCount}`
  );
  console.log(`-> Đã lưu file sạch: ${resolvedOut}`);
  console.log('====================================================================');
}

main().catch((err) => {
  console.error('Fatal AI Director error:', err);
  process.exit(1);
});
