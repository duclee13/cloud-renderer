import {generateContentCancellable} from '../geminiTransport';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeGeminiWithRetry, sanitizeLog } from "../geminiRetry";
import { SubtitleWord, BackgroundPreset } from "../../remotion/types/sceneGraph";

export interface MicroSceneBeat {
  index: number;
  name: string;
  dialogue: string;
  actionSummary: string;
  requiredProps: string[];
  backgroundPreset: BackgroundPreset;
  speechBubbleText?: string;
  // Estimated audio & scene duration (frames & seconds)
  audioDurationSeconds: number;
  durationInFrames: number;
  words?: SubtitleWord[];
  audioBase64?: string;
}

const SPLIT_BEATS_SYSTEM_PROMPT = `You are a World-Class 2D Animation Director and Screenwriter.
Your task is to take a user script or story prompt and organize it into a sequence of tightly-paced, engaging Micro-Scene Beats.

CRITICAL DIRECTORIAL & SCRIPTWRITING RULES:
1. RESPECT USER'S EXPLICIT SCENE STRUCTURE:
   - If the user provides a script formatted with scene tags (e.g. "Cảnh 1:", "Cảnh 2:", "Scene 1:", or numbered lines):
     You MUST generate EXACTLY ONE beat per user scene! NEVER merge, split, or omit scenes.
   - If the user provides a single continuous text or rough prompt:
     Divide logically into natural narrative beats at full sentence boundaries (each ~3 to 7 seconds). NEVER break a single clause or sentence in the middle!

2. NATURAL, ENGAGING VIETNAMESE STORYTELLING (TUYỆT ĐỐI KHÔNG VIẾT VĂN PHONG "ĐỚ"):
   - PRESERVE AUTHENTIC USER DIALOGUE: Keep the user's authentic narrative words, tone, humor, and emotion!
   - STRIP TECHNICAL CAMERA DIRECTIONS FROM SPOKEN DIALOGUE:
     The 'dialogue' field will be read aloud by the voiceover TTS actor.
     Remove camera/directorial prefixes like "Cảnh 1:", "Phóng cận cảnh vào...", "Minh họa biểu đồ:", "Góc quay từ trên xuống:".
     Keep the actual spoken storytelling sentence clean, natural, and complete!
   - NO MACHINE-TRANSLATE CLICHÉS:
     Avoid robotic, stiff phrases (e.g. do NOT rewrite natural sentences into wooden Google Translate style).
     Keep speech natural, rhythmic, and conversational (như người thật đang chia sẻ, tâm sự, dẫn dắt câu chuyện).

3. QUOTED SPEECH BUBBLES:
   - If a sentence contains a quote in single or double quotes (e.g. 'Để sau!' or "Tám"):
     Keep the quote in the 'dialogue' AND also extract the exact quote into 'speechBubbleText' (e.g. "Để sau!", "Tám") so an animated speech bubble pops up over the character!

4. REQUIRED PROPS (KEBAB-CASE):
   - Extract a clean array of physical props needed in this beat.
   - Canonical prop IDs: "glass-jar", "spider", "desk", "desk-lamp", "gauge-meter", "sofa", "laptop", "coffee-cup", "book", "car", "potted-plant", "tree", "chair".
   - If a creature/item is inside a container (e.g. spider inside jar): list both ["glass-jar", "spider"].
   - For metabolic charts, meters, or gauges: use "gauge-meter".

5. BACKGROUND PRESET:
   Choose strictly from the 9 supported presets matching context:
   - "gardenDay" (outdoor nature, meadow, grass, park, field, sky)
   - "classroom" (school, teacher, students, blackboard, lecture)
   - "office" (workplace, office desk, corporate, meeting)
   - "cityStreet" (urban road, sidewalk, traffic, cars, buildings)
   - "beachSunny" (tropical beach, sand, ocean, palm tree)
   - "nightSky" (starry night, galaxy, moon gazing, astronomy)
   - "livingRoomDay" (daytime indoor living room, home)
   - "livingRoomNight" (cozy nighttime room, bedside lamp, evening)
   - "infographicStripes" (abstract data, meters, charts, presentation)

6. OUTPUT FORMAT: Output ONLY a valid JSON object matching this schema:
{
  "beats": [
    {
      "name": "Short scene title (e.g. Phát hiện nhện trong lọ)",
      "dialogue": "Spoken narration sentence only (no camera notes)",
      "actionSummary": "Brief description of the 1 key visual action",
      "requiredProps": ["glass-jar", "spider"],
      "backgroundPreset": "livingRoomDay",
      "speechBubbleText": "Để sau!"
    }
  ]
}
Output ONLY raw JSON.`;

/**
 * Ước tính thời lượng chuẩn xác trực tiếp từ lời thoại và hành động mà KHÔNG cần gọi TTS.
 * - Tốc độ đọc tự nhiên tiếng Việt: ~2.6 từ/giây.
 * - Thời gian đệm hành động trực quan (đọc thông số, di chuyển, quan sát): 1.0s - 2.0s.
 * - Khống chế thời lượng mỗi beat tối thiểu 3.0s, tối đa 12.0s.
 */
export function estimateBeatDuration(dialogue: string, actionSummary: string): { durationSeconds: number; durationInFrames: number } {
  const cleanDialogue = dialogue.trim();
  const wordCount = cleanDialogue ? cleanDialogue.split(/\s+/).length : 0;
  const speechSec = wordCount > 0 ? wordCount / 2.6 : 0;

  let actionBufferSec = 1.0;
  if (/bước|đi|walk|di chuyển|chạy|ra vườn|đến/i.test(actionSummary)) {
    actionBufferSec = 1.8;
  } else if (/phóng|cận cảnh|biểu đồ|quan sát|xem xét|ngắm|đo/i.test(actionSummary)) {
    actionBufferSec = 1.4;
  }

  const estimatedSec = Math.max(3.0, Math.min(12.0, speechSec + actionBufferSec));
  const durationInFrames = Math.round(estimatedSec * 60);

  return {
    durationSeconds: Number(estimatedSec.toFixed(2)),
    durationInFrames,
  };
}

/**
 * Bước 1: Chia kịch bản thô thành các Micro-Scene Beats 3-5s
 * và ước tính thời lượng chuẩn xác từ câu chữ & hành động (KHÔNG gọi Edge-TTS).
 */
export async function splitIntoMicroBeats(
  rawScript: string,
  modelName: string = "gemini-3.1-flash-lite",
  apiKey?: string,
  signal?: AbortSignal,
  requestId?: string
): Promise<MicroSceneBeat[]> {
  const reqId = requestId || "req_local";

  if (signal?.aborted) {
    throw new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError");
  }

  const activeKey = (apiKey || process.env.GEMINI_API_KEY || "").trim();
  if (!activeKey) {
    throw new Error("Cần Gemini API Key để thực hiện Bước 1 (splitIntoMicroBeats).");
  }

  const genAI = new GoogleGenerativeAI(activeKey);

  console.log(
    sanitizeLog(`[Pipeline][${reqId}] [Bước 1] Đang cắt nhịp kịch bản qua model ${modelName}...`)
  );

  const responseText = await executeGeminiWithRetry(
    async () => {
      if (signal?.aborted) {
        throw new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError");
      }

      const model = genAI.getGenerativeModel(
        {
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
          systemInstruction: SPLIT_BEATS_SYSTEM_PROMPT,
        },
        { timeout: 25000 }
      );

      const promptText = `Hãy phân rã kịch bản sau thành các Micro-Scenes chuẩn xác.
Nếu kịch bản đã có từng Cảnh (Cảnh 1, Cảnh 2...), hãy giữ nguyên từng cảnh tương ứng thành 1 Micro-Scene beat, bảo tồn trọn vẹn câu chữ và văn phong tự nhiên của người dùng (chỉ bóc tách các chỉ dẫn camera kỹ thuật ra khỏi dialogue để đọc lời thuyết minh):

${rawScript}`;

      const res = await generateContentCancellable(model, promptText, signal);
      const text = res.response.text();
      if (!text) throw new Error("Phản hồi cắt nhịp rỗng từ Gemini.");
      return text;
    },
    {
      maxRetries: 3,
      signal,
      requestId: reqId,
      step: 1,
      modelName,
    }
  );

  if (signal?.aborted) {
    throw new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError");
  }

  let cleanJson = responseText.trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
  const parsed = JSON.parse(cleanJson);
  const rawBeats = Array.isArray(parsed.beats) ? parsed.beats : [];

  if (rawBeats.length === 0) {
    throw new Error("Không thể trích xuất Micro-Scenes từ kịch bản.");
  }

  // Ước tính thời lượng trực quan từ lời thoại & hành động (KHÔNG GỌI EDGE-TTS)
  console.log(
    sanitizeLog(`[Pipeline][${reqId}] [Bước 1] Ước tính thời lượng toán học cho ${rawBeats.length} Micro-Scenes (Zero-TTS mode)...`)
  );

  const microBeats: MicroSceneBeat[] = [];

  for (let i = 0; i < rawBeats.length; i++) {
    const b = rawBeats[i];
    const dialogueText = String(b.dialogue || rawScript).trim();
    const actionSummaryText = String(b.actionSummary || "");

    const { durationSeconds, durationInFrames } = estimateBeatDuration(dialogueText, actionSummaryText);

    microBeats.push({
      index: i,
      name: b.name || `Cảnh ${i + 1}`,
      dialogue: dialogueText,
      actionSummary: actionSummaryText,
      requiredProps: Array.isArray(b.requiredProps) ? b.requiredProps : [],
      backgroundPreset: b.backgroundPreset || "livingRoomDay",
      speechBubbleText: b.speechBubbleText || undefined,
      audioDurationSeconds: durationSeconds,
      durationInFrames,
      words: [],
      audioBase64: undefined,
    });
  }

  return microBeats;
}
