import { NextRequest, NextResponse } from "next/server";
import {
  synthesizeExpressiveBeatTts,
  inferVoiceToneFromBeat,
  VoiceEmotionTone,
} from "@/lib/expressiveTtsDirector";
import { SfxType } from "@/lib/sfxGenerator";
import { StoryCardType } from "@/remotion/components/cards/StoryInfographicCards";
import { ScriptBeat, ScriptActionType, StageTheme } from "@/animscript/actionLibrary";
import { V7MoviePayload } from "@/remotion/compositions/V7MovieComposition";
import {
  INFORMATION_PRECISION_POLICY_PROMPT_RULE,
  MINIMALIST_CALLOUT_POLICY_PROMPT_RULE,
  NATURAL_STORYTELLING_TONE_PROMPT_RULE,
  inferMetricModeForCard,
  MetricDisplayMode,
} from "@/lib/v7/universalAnimationStandard";
import {
  HYBRID_GPU_RENDER_DEFAULTS,
  detectBestHardwareEncoder,
} from "@/lib/v7/hybridGpuRenderConfig";
import { buildRemotionSoundDesignPayload } from "@/lib/v7/soundDesignEngine";

export const runtime = "nodejs";
export const maxDuration = 300;

const VALID_ACTIONS: ScriptActionType[] = [
  "STORY_MICRO_POSE",
  "STORY_CARD_SCENE",
  "WALK",
  "RUN",
  "SIT_AND_TYPE",
  "SHOCKED_AND_CELEBRATE",
  "RUN_AND_KICK_BALL",
  "WAVE_HAND_FRONT",
  "DRINK_WATER_CUP",
  "PUSH_HEAVY_OBJECT",
  "JUMP_OVER",
  "POINT_AND_EXPLAIN",
  "PICKUP_AND_CARRY_BOX",
  "INSERT_HAND_CLOSEUP",
  "SHOW_INFOGRAPHIC_GAUGE",
];

const VALID_THEMES: StageTheme[] = [
  "SOFT_GRAPH_GRID",
  "WINDOW_SILL_BOKEH",
  "PASTEL_BRANCH_GARDEN",
  "GRID_PAPER",
  "STUDY_ROOM",
  "STREET_SOCCER",
  "WAREHOUSE",
  "DARK_STUDIO",
  "BEACH_SUNNY",
  "GARDEN_DAY",
  "LIVING_ROOM",
  "LINED_PAPER",
  "DOTTED_CREAM",
  "RADIAL_SUNBURST",
  "NIGHT_GARDEN_FLASHLIGHT",
  "COUNTRYSIDE_YARD",
  "BEDROOM_INDOOR",
  "UNDERGROUND_CROSS_SECTION",
  "EXPLAINER_POLKA_DOT",
  "SIMPLE_GRASS_FIELD",
];

const VALID_CARDS: StoryCardType[] = [
  "CHARACTER_POSE_CARD",
  "CHAPTER_CARD",
  "CALENDAR_FLIP_CARD",
  "GAUGE_RESERVE_CARD",
  "CANDLE_HOURGLASS_CARD",
  "BALANCE_SCALE_CARD",
  "SIMPLE_CHART_CARD",
  "TWO_DOORS_CARD",
  "XRAY_BODY_CARD",
  "STOPWATCH_TALLY_CARD",
];

const VALID_TONES: VoiceEmotionTone[] = [
  "HOOK_INTRIGUE",
  "CALM_STORY",
  "TENSE_CLIMAX",
  "SLOW_EMOTIONAL",
  "STEP_BY_STEP_SUSPENSE",
  "CHAPTER_ANNOUNCE",
];

/**
 * Kịch bản chuẩn V9.0 Storytime Explainer: "Điều gì xảy ra khi bỏ đói bọ ngựa 2 tháng?"
 * Đan xen nhịp nhàng giữa Cảnh Nhân Vật Tĩnh Có Hồn (CHARACTER_POSE_CARD)
 * và 9 Thẻ Infographic Ẩn Dụ Trực Quan (StoryInfographicCards) + Giọng đọc nhấn nhá & SFX
 */
export function buildMantisStorytimeBeats(): Partial<ScriptBeat>[] {
  return [
    {
      action: "STORY_CARD_SCENE",
      cardType: "CHAPTER_CARD",
      stageTheme: "DARK_STUDIO",
      archetype: "mantis",
      voiceTone: "HOOK_INTRIGUE",
      sfxType: "sfx_thud",
      headerTitle: "BỎ ĐÓI BỌ NGỰA 2 THÁNG?",
      narrationText:
        "Điều gì sẽ xảy ra... nếu một sát thủ săn mồi đỉnh cao như bọ ngựa... phải nhịn đói suốt hai tháng trời?",
      cardProps: {
        darkMode: true,
        subtitle: "THÍ NGHIỆM SINH TỒN KHẮC NGHIỆT",
        highlightWord: "60 NGÀY KHÔNG THỨC ĂN!",
        highlightColor: "red",
      },
    },
    {
      action: "STORY_MICRO_POSE",
      cardType: "CHARACTER_POSE_CARD",
      microPoseVariant: "alert_scan",
      hungerStage: "WELL_FED",
      vitalityPreset: "PEAK_VIGOR",
      actionIntent: "OBSERVE_ROTATE_180",
      targetSocket: "HEAD_CENTER",
      floatingHeader: "NGÀY ĐẦU TIÊN",
      stageTheme: "WINDOW_SILL_BOKEH",
      archetype: "mantis",
      voiceTone: "CALM_STORY",
      sfxType: "sfx_pop",
      headerTitle: "NGÀY 1: SÁT THỦ TỈNH TÁO",
      narrationText:
        "Ngày đầu tiên, nó vẫn cực kỳ tỉnh táo — chiếc đầu xoay một trăm tám mươi độ để sục sạo từng kẽ lá.",
      calloutText: "[XOAY ĐẦU 180°]",
      calloutSub: "Thị giác lập thể 3D siêu nhạy",
      calloutTarget: "HEAD_CENTER",
      thoughtText: "[?]",
      startX: 960,
      targetX: 960,
      cameraZoom: [1.0, 1.10],
    },
    {
      action: "STORY_CARD_SCENE",
      cardType: "CALENDAR_FLIP_CARD",
      stageTheme: "SOFT_GRAPH_GRID",
      archetype: "mantis",
      voiceTone: "CHAPTER_ANNOUNCE",
      sfxType: "sfx_tick",
      headerTitle: "THỜI GIAN TRÔI QUA...",
      narrationText:
        "Nhưng ngày một... rồi tuần một... tuần hai trôi qua... chiếc hộp vẫn hoàn toàn trống rỗng.",
      cardProps: {
        calendarHeader: "NHẬT KÝ NHỊN ĐÓI SINH TỒN",
        calendarSteps: ["NGÀY 1", "TUẦN 1", "TUẦN 2", "TUẦN 3"],
      },
    },
    {
      action: "STORY_MICRO_POSE",
      cardType: "CHARACTER_POSE_CARD",
      microPoseVariant: "stalk_slow",
      hungerStage: "HUNGRY_STALK",
      vitalityPreset: "CAUTIOUS_CONSERVE",
      actionIntent: "STEP_AND_FREEZE",
      targetSocket: "THORAX",
      floatingHeader: "TIẾT KIỆM NĂNG LƯỢNG",
      stageTheme: "WINDOW_SILL_BOKEH",
      archetype: "mantis",
      voiceTone: "STEP_BY_STEP_SUSPENSE",
      sfxType: "sfx_whoosh",
      headerTitle: "CHIẾN THUẬT BẤT ĐỘNG",
      narrationText:
        "Một bước. Hai bước. Thật chậm... Nó chọn cách đứng bất động hàng giờ liền để không lãng phí dù chỉ một giọt năng lượng.",
      calloutText: "[ĐỨNG BẤT ĐỘNG]",
      calloutSub: "Tiết kiệm tối đa calo",
      calloutTarget: "THORAX",
      thoughtText: "[...]",
      startX: 950,
      targetX: 950,
      cameraZoom: [1.0, 1.12],
    },
    {
      action: "STORY_CARD_SCENE",
      cardType: "CANDLE_HOURGLASS_CARD",
      metricMode: "EXACT_QUANTITATIVE",
      stageTheme: "SOFT_GRAPH_GRID",
      archetype: "mantis",
      voiceTone: "SLOW_EMOTIONAL",
      sfxType: "sfx_whoosh",
      headerTitle: "HẠ THẤP TRAO ĐỔI CHẤT",
      narrationText:
        "Cơ thể nó tự động vặn nhỏ ngọn lửa trao đổi chất... cháy âm ỉ từng chút một như ngọn nến nhỏ trước gió.",
      cardProps: {
        metricMode: "EXACT_QUANTITATIVE",
        targetPercent: 20,
        candleLabel: "TỐC ĐỘ ĐỐT NĂNG LƯỢNG GIẢM CÒN MỘT PHẦN NĂM",
      },
    },
    {
      action: "STORY_CARD_SCENE",
      cardType: "SIMPLE_CHART_CARD",
      metricMode: "EXACT_QUANTITATIVE",
      stageTheme: "SOFT_GRAPH_GRID",
      archetype: "mantis",
      voiceTone: "CALM_STORY",
      sfxType: "sfx_pop",
      headerTitle: "BIỂU ĐỒ ĐỐT NĂNG LƯỢNG",
      narrationText:
        "Trên biểu đồ sinh học, mức tiêu thụ năng lượng lao dốc thẳng đứng — giúp nó kéo dài sự sống gấp nhiều lần bình thường.",
      cardProps: {
        metricMode: "EXACT_QUANTITATIVE",
        targetPercent: 20,
        chartMode: "line",
        chartTitle: "MỨC ĐỐT NĂNG LƯỢNG THEO THỜI GIAN",
      },
    },
    {
      action: "STORY_CARD_SCENE",
      cardType: "TWO_DOORS_CARD",
      metricMode: "QUALITATIVE_STATE",
      stageTheme: "SOFT_GRAPH_GRID",
      archetype: "mantis",
      voiceTone: "CALM_STORY",
      sfxType: "sfx_ding",
      headerTitle: "LỰA CHỌN SINH TỒN",
      narrationText:
        "Đứng trước hai cánh cửa sinh học... cơ thể lập tức khóa chặt chức năng sinh sản để dồn toàn bộ năng lượng cho sự sống.",
      cardProps: {
        metricMode: "QUALITATIVE_STATE",
        leftDoorTitle: "DUY TRÌ SỰ SỐNG",
        leftNeutralSub: "CHẾ ĐỘ CHỜ",
        leftDoorSub: "ƯU TIÊN TUYỆT ĐỐI",
        rightDoorTitle: "SINH SẢN & ĐẺ TRỨNG",
        rightNeutralSub: "CHỜ XỬ LÝ",
        rightDoorSub: "TẠM ĐÓNG BĂNG",
      },
    },
    {
      action: "STORY_MICRO_POSE",
      cardType: "CHARACTER_POSE_CARD",
      microPoseVariant: "hungry_clutch",
      hungerStage: "STARVING_XRAY",
      vitalityPreset: "DEPLETED_STARVING",
      actionIntent: "INTERNAL_XRAY_BURN",
      targetSocket: "ABDOMEN_CENTER",
      floatingHeader: "TUẦN THỨ 5: ĐỐT CƠ & MỠ",
      stageTheme: "DARK_STAGE_FLOOR",
      archetype: "mantis",
      showXrayAbdomen: true,
      voiceTone: "SLOW_EMOTIONAL",
      sfxType: "sfx_thud",
      headerTitle: "TUẦN 5: TỰ ĐỐT THỂ MỠ & CƠ BẮP",
      narrationText:
        "Bước sang tuần thứ năm... khi bữa ăn cuối cùng đã cạn sạch, nó bắt đầu tự đốt cháy thể mỡ dự trữ và cả những thớ cơ của chính mình.",
      calloutText: "TỰ ĐỐT THỂ MỠ & CƠ BẮP!",
      calloutSub: "Hy sinh mô cơ để nuôi não và đôi mắt",
      calloutTarget: "ABDOMEN_CENTER",
      startX: 1000,
      targetX: 1000,
      cameraZoom: [1.18, 1.24],
    },
    {
      action: "STORY_CARD_SCENE",
      cardType: "BALANCE_SCALE_CARD",
      metricMode: "QUALITATIVE_STATE",
      stageTheme: "SOFT_GRAPH_GRID",
      archetype: "mantis",
      voiceTone: "TENSE_CLIMAX",
      sfxType: "sfx_thud",
      headerTitle: "CÁN CÂN LIỀU LĨNH",
      narrationText:
        "Lúc này, cơn đói cồn cào đã nặng hơn cả nỗi sợ bị thương — biến nó thành một kẻ săn mồi liều lĩnh nhất!",
      cardProps: {
        metricMode: "QUALITATIVE_STATE",
        leftPanLabel: "CƠN ĐÓI CỒN CÀO",
        rightPanLabel: "NỖI SỢ BỊ THƯƠNG",
        heavySide: "left",
      },
    },
    {
      action: "STORY_MICRO_POSE",
      cardType: "CHARACTER_POSE_CARD",
      microPoseVariant: "strike_grab",
      hungerStage: "BERSERK_STRIKE",
      vitalityPreset: "DESPERATE_CLIMAX",
      actionIntent: "STRIKE_AND_CAPTURE",
      targetSocket: "PRIMARY_WEAPON",
      floatingHeader: "PHẢN XẠ 0.1 GIÂY!",
      stageTheme: "PASTEL_BRANCH_GARDEN",
      archetype: "mantis",
      voiceTone: "TENSE_CLIMAX",
      sfxType: "sfx_whoosh",
      headerTitle: "TUNG ĐÒN CHỚP NHOÁNG!",
      narrationText:
        "Chỉ cần một bóng mồi lướt qua... CHỘP! Đôi càng gai sắc nhọn vẫn tung đòn trong một phần mười giây!",
      calloutText: "[CÀNG GAI SẮC NHỌN]",
      calloutSub: "Tốc độ phóng đòn 0.1 giây",
      calloutTarget: "PRIMARY_WEAPON",
      sfxText: "CHỘP!",
      startX: 880,
      targetX: 880,
      cameraZoom: [1.0, 1.12],
    },
    {
      action: "STORY_CARD_SCENE",
      cardType: "GAUGE_RESERVE_CARD",
      metricMode: "QUALITATIVE_STATE",
      stageTheme: "SOFT_GRAPH_GRID",
      archetype: "mantis",
      voiceTone: "SLOW_EMOTIONAL",
      sfxType: "sfx_tick",
      headerTitle: "TUẦN 8: CHẠM VẠCH ĐỎ KIỆT SỨC",
      narrationText:
        "Nhưng đến tuần thứ tám... kim đồng hồ dự trữ chạm đáy vùng đỏ kiệt sức. Nếu không có nước và mồi, phép màu sinh tồn sẽ khép lại.",
      cardProps: {
        metricMode: "QUALITATIVE_STATE",
        gaugeFrom: 80,
        gaugeTo: 5,
        gaugeStatusLabel: "BÁO ĐỘNG ĐỎ: CẠN KIỆT DỰ TRỮ",
      },
    },
  ];
}

/**
 * Phân tích kịch bản bằng Gemini thành chuỗi Storytime & Infographic Cards V10.3
 */
async function analyzeScriptWithGemini(
  prompt: string,
  apiKey: string,
  model: string = "gemini-2.0-flash"
): Promise<Partial<ScriptBeat>[]> {
  const systemInstruction = `Bạn là Đạo Diễn Phim Hoạt Hình Kể Chuyện & Giải Thích Khoa Học (Storytime & Infographic Director V10.3).
Nhiệm vụ: Chuyển kịch bản Tiếng Việt thành 8-12 phân cảnh ngắn (mỗi câu 2.5s-4.5s), đan xen nhịp nhàng giữa:
1. Cảnh nhân vật tĩnh có hồn (action: "STORY_MICRO_POSE", cardType: "CHARACTER_POSE_CARD") kèm nhãn chú thích mũi tên (calloutText), chữ tượng thanh nổ (sfxText như "CHỘP!", "BỐP!", "CẠCH!"), bóng suy nghĩ (thoughtText như "[?]", "[...]").
2. Các Thẻ Infographic Ẩn Dụ Trực Quan (action: "STORY_CARD_SCENE") với cardType thuộc:
   - "CHAPTER_CARD": Thẻ chuyển chương / câu hỏi mở đầu kịch tính (cardProps: { subtitle, highlightWord, highlightColor: "red"|"yellow", darkMode: true })
   - "CALENDAR_FLIP_CARD": Lịch đếm ngày/tuần lật trang (metricMode: "EXACT_QUANTITATIVE", cardProps: { calendarHeader, calendarSteps: ["NGÀY 1", "TUẦN 1", "TUẦN 2", "TUẦN 4"] })
   - "GAUGE_RESERVE_CARD": Đồng hồ bán nguyệt 3 vùng Đỏ-Vàng-Xanh (cardProps: { gaugeFrom: 80, gaugeTo: 5, gaugeStatusLabel, targetPercent?: number }). CHỈ truyền targetPercent và metricMode: "EXACT_QUANTITATIVE" khi kịch bản thực sự nêu số %, ngược lại đặt metricMode: "QUALITATIVE_STATE".
   - "CANDLE_HOURGLASS_CARD": Ngọn nến cháy cạn dần & đồng hồ cát (cardProps: { candleLabel, targetPercent?: number })
   - "BALANCE_SCALE_CARD": Cán cân nghiêng so sánh 2 vế (metricMode: "QUALITATIVE_STATE", cardProps: { leftPanLabel, rightPanLabel, heavySide: "left"|"right" })
   - "SIMPLE_CHART_CARD": Bảng biểu đồ đường giảm hoặc cột đôi (cardProps: { chartMode: "line"|"bars", chartTitle, targetPercent?: number })
   - "TWO_DOORS_CARD": Hai cánh cửa ưu tiên sinh tồn (BẮT BUỘC metricMode: "QUALITATIVE_STATE", cardProps: { leftDoorTitle, leftDoorSub, rightDoorTitle, rightDoorSub } — TUYỆT ĐỐI KHÔNG ghi số % trong leftDoorSub/rightDoorSub!)
   - "XRAY_BODY_CARD": Cắt lớp X-Quang cơ thể đốt mỡ/cơ bắp (metricMode: "QUALITATIVE_STATE", cardProps: { xrayStage: "fat_reserve"|"muscle_burn", xrayCalloutTitle, xrayCalloutSub })
   - "STOPWATCH_TALLY_CARD": Đồng hồ bấm giờ quay nhanh & khắc vạch đếm ngày (metricMode: "EXACT_QUANTITATIVE", cardProps: { tallyCount: 15, tallyLabel })

${INFORMATION_PRECISION_POLICY_PROMPT_RULE}

${MINIMALIST_CALLOUT_POLICY_PROMPT_RULE}

${NATURAL_STORYTELLING_TONE_PROMPT_RULE}

Chọn voiceTone phù hợp cho từng câu:
- "HOOK_INTRIGUE", "CALM_STORY", "TENSE_CLIMAX", "SLOW_EMOTIONAL", "STEP_BY_STEP_SUSPENSE", "CHAPTER_ANNOUNCE"
Trong narrationText, hãy chủ động dùng dấu "..." hoặc "—" ở chỗ cần ngắt nhịp thở cảm xúc!
Chọn sfxType: "sfx_pop" | "sfx_whoosh" | "sfx_tick" | "sfx_thud" | "sfx_ding".

Trả về JSON thuần:
{
  "title": "Tên phim",
  "beats": [ ... ]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleanJson = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleanJson);
  return Array.isArray(parsed.beats) ? parsed.beats : [];
}

/**
 * Bộ phân tích ngữ nghĩa thông minh Rule-Based V9.0 (hoạt động độc lập 100% không cần key)
 */
function analyzeScriptRuleBased(prompt: string): Partial<ScriptBeat>[] {
  const p = prompt.toLowerCase();

  // Mẫu chuẩn V9.0: Bọ ngựa nhịn đói / Sinh tồn / Storytime Explainer
  if (
    p.includes("bọ ngựa") ||
    p.includes("bỏ đói") ||
    p.includes("nhịn đói") ||
    p.includes("2 tháng") ||
    p.includes("hai tháng") ||
    p.includes("sinh tồn")
  ) {
    return buildMantisStorytimeBeats();
  }

  const beats: Partial<ScriptBeat>[] = [];

  // Mẫu 1: Kịch bản Bãi biển & Hộp kho báu
  if (p.includes("biển") || p.includes("kho báu") || p.includes("bãi biển") || p.includes("nhiệt đới")) {
    beats.push({
      action: "WAVE_HAND_FRONT",
      stageTheme: "BEACH_SUNNY",
      voiceTone: "HOOK_INTRIGUE",
      sfxType: "sfx_pop",
      narrationText: "Chào mừng các bạn đến với bãi biển nhiệt đới tuyệt đẹp... nơi ẩn giấu một bí mật bất ngờ!",
      speechBubbleText: "Xin chào bãi biển!",
      headerTitle: "CHÀO ĐÓN BÃI BIỂN",
      startX: 960,
      targetX: 960,
    });
    beats.push({
      action: "DRINK_WATER_CUP",
      stageTheme: "BEACH_SUNNY",
      voiceTone: "CALM_STORY",
      sfxType: "sfx_ding",
      narrationText: "Trước khi bắt đầu hành trình khám phá, hãy thưởng thức một ngụm nước dừa mát lạnh.",
      speechBubbleText: "Nước dừa thật sảng khoái!",
      headerTitle: "THƯỞNG THỨC NƯỚC MÁT",
      startX: 960,
      targetX: 960,
    });
    beats.push({
      action: "PICKUP_AND_CARRY_BOX",
      stageTheme: "BEACH_SUNNY",
      voiceTone: "STEP_BY_STEP_SUSPENSE",
      sfxType: "sfx_thud",
      narrationText: "Kìa... trên bờ cát có một chiếc hộp bí ẩn trôi dạt vào! Chúng ta hãy nhấc nó lên nào.",
      speechBubbleText: "Một chiếc hộp kỳ lạ!",
      headerTitle: "KHÁM PHÁ CHIẾC HỘP",
      startX: 850,
      targetX: 1100,
    });
    beats.push({
      action: "STORY_CARD_SCENE",
      cardType: "GAUGE_RESERVE_CARD",
      metricMode: "EXACT_QUANTITATIVE",
      stageTheme: "GRID_PAPER",
      voiceTone: "TENSE_CLIMAX",
      sfxType: "sfx_ding",
      narrationText: "Năng lượng khám phá của bạn đã bùng nổ lên mức tối đa một trăm phần trăm!",
      headerTitle: "NĂNG LƯỢNG CỰC ĐẠI",
      cardProps: {
        metricMode: "EXACT_QUANTITATIVE",
        gaugeFrom: 35,
        gaugeTo: 100,
        targetPercent: 100,
        gaugeStatusLabel: "NĂNG LƯỢNG KHÁM PHÁ ĐẠT ĐỈNH!",
      },
    });
    return beats;
  }

  // Mặc định trả về bộ phim Storytime Explainer V9.0 đầy đủ 11 phân cảnh
  return buildMantisStorytimeBeats();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : (process.env.GEMINI_API_KEY || "");
    const model = typeof body.model === "string" ? body.model.trim() : "gemini-2.0-flash";
    const voice = typeof body.voice === "string" && body.voice ? body.voice : "vi-VN-NamMinhNeural";
    const archetype = body.archetype || "scientist";
    const showDebugHud = Boolean(body.showDebugHud);
    const useGeminiTts = body.useGeminiTts !== false;
    const ttsProvider = typeof body.ttsProvider === "string" ? (body.ttsProvider as any) : undefined;

    if (!prompt) {
      return NextResponse.json(
        { error: "Vui lòng nhập nội dung kịch bản hoặc chọn kịch bản mẫu." },
        { status: 400 }
      );
    }

    let parsedBeats: Partial<ScriptBeat>[] = [];

    if (apiKey) {
      try {
        parsedBeats = await analyzeScriptWithGemini(prompt, apiKey, model);
      } catch (geminiErr: any) {
        console.warn("Gemini analysis error, falling back to V9 rule-based engine:", geminiErr.message);
        parsedBeats = analyzeScriptRuleBased(prompt);
      }
    } else {
      parsedBeats = analyzeScriptRuleBased(prompt);
    }

    if (!parsedBeats || parsedBeats.length === 0) {
      parsedBeats = analyzeScriptRuleBased(prompt);
    }

    const compiledBeats: ScriptBeat[] = [];
    let currentStartFrame = 0;

    for (let i = 0; i < parsedBeats.length; i++) {
      const rawBeat = parsedBeats[i];
      const cardType: StoryCardType | undefined = VALID_CARDS.includes(rawBeat.cardType as any)
        ? (rawBeat.cardType as StoryCardType)
        : undefined;

      const action: ScriptActionType = VALID_ACTIONS.includes(rawBeat.action as any)
        ? (rawBeat.action as ScriptActionType)
        : VALID_ACTIONS.includes(rawBeat.type as any)
        ? (rawBeat.type as ScriptActionType)
        : cardType && cardType !== "CHARACTER_POSE_CARD"
        ? "STORY_CARD_SCENE"
        : "STORY_MICRO_POSE";

      const stageTheme: StageTheme = VALID_THEMES.includes(rawBeat.stageTheme as any)
        ? (rawBeat.stageTheme as StageTheme)
        : VALID_THEMES.includes(rawBeat.theme as any)
        ? (rawBeat.theme as StageTheme)
        : cardType && cardType !== "CHARACTER_POSE_CARD"
        ? "GRID_PAPER"
        : "GARDEN_DAY";

      const narrationText = (rawBeat.narrationText || "").trim();
      const voiceTone: VoiceEmotionTone = VALID_TONES.includes(rawBeat.voiceTone as any)
        ? (rawBeat.voiceTone as VoiceEmotionTone)
        : inferVoiceToneFromBeat(narrationText, cardType, i);

      let audioUrl: string | undefined = undefined;
      let audioDurationMs: number | undefined = undefined;
      let durationFrames = 180;
      let subClauseAudios = undefined;

      if (narrationText) {
        try {
          const expressiveRes = await synthesizeExpressiveBeatTts({
            text: narrationText,
            voice,
            tone: voiceTone,
            apiKey,
            useGeminiTts,
            ttsProvider,
            strictSingleVoice: true,
          });
          audioUrl = expressiveRes.audioUrl;
          audioDurationMs = expressiveRes.totalDurationMs;
          durationFrames = expressiveRes.totalDurationFrames;
          subClauseAudios = expressiveRes.subClauseAudios;
        } catch (ttsErr: any) {
          console.warn(`Expressive TTS error for beat ${i}, using estimated duration:`, ttsErr.message);
          const estimatedMs = Math.max(2400, narrationText.split(/\s+/).length * 340);
          audioDurationMs = estimatedMs;
          durationFrames = Math.max(150, Math.ceil((estimatedMs / 1000) * 60) + 18);
        }
      } else {
        durationFrames = rawBeat.durationFrames || 150;
      }

      const resolvedMetricMode: MetricDisplayMode = inferMetricModeForCard({
        metricMode: rawBeat.metricMode ?? rawBeat.cardProps?.metricMode,
        cardType,
        targetPercent: rawBeat.cardProps?.targetPercent,
        narrationText,
      });

      const beat: ScriptBeat = {
        type: action,
        action,
        theme: stageTheme,
        stageTheme,
        cardType,
        metricMode: resolvedMetricMode,
        hornetSceneMode: rawBeat.hornetSceneMode,
        voiceTone,
        sfxType: rawBeat.sfxType,
        hungerStage: rawBeat.hungerStage,
        vitalityPreset: rawBeat.vitalityPreset,
        actionIntent: rawBeat.actionIntent,
        targetSocket: rawBeat.targetSocket,
        floatingHeader: rawBeat.floatingHeader,
        calloutText: rawBeat.calloutText,
        calloutSub: rawBeat.calloutSub,
        calloutTarget: rawBeat.calloutTarget,
        calloutTriggerPhrase: rawBeat.calloutTriggerPhrase,
        sfxText: rawBeat.sfxText,
        thoughtText: rawBeat.thoughtText,
        showXrayAbdomen: Boolean(rawBeat.showXrayAbdomen || rawBeat.customData?.showXrayAbdomen),
        cardProps: rawBeat.cardProps,
        cameraZoom: rawBeat.cameraZoom,
        microPoseVariant: rawBeat.microPoseVariant,
        subClauseAudios,
        durationFrames,
        startFrame: currentStartFrame,
        narrationText: narrationText || undefined,
        audioUrl,
        audioDurationMs,
        speechBubbleText: rawBeat.speechBubbleText,
        archetype: rawBeat.archetype || archetype,
        headerTitle: rawBeat.headerTitle || `PHÂN CẢNH ${i + 1}`,
        showDebugHud,
        startX: typeof rawBeat.startX === "number" ? rawBeat.startX : 960,
        targetX: typeof rawBeat.targetX === "number" ? rawBeat.targetX : 960,
        obstacleHeight: rawBeat.obstacleHeight,
        gaugeValue: rawBeat.gaugeValue,
        gaugeLabel: rawBeat.gaugeLabel,
        insertItemType: rawBeat.insertItemType,
      };

      compiledBeats.push(beat);
      currentStartFrame += durationFrames;
    }

    const isPreview = Boolean(body.preview);
    const hwEncoder = detectBestHardwareEncoder();
    const activeFps = isPreview ? 30 : 60;
    const soundDesign = buildRemotionSoundDesignPayload(compiledBeats, activeFps);
    const payload: V7MoviePayload = {
      title: "Phim Storytime & Infographic Cards V13.0",
      totalDurationFrames: currentStartFrame,
      fps: activeFps,
      beats: compiledBeats,
      showDebugHud,
      soundDesign,
      renderConfig: {
        chromiumOptions: HYBRID_GPU_RENDER_DEFAULTS.chromiumOptions,
        hardwareAcceleration: HYBRID_GPU_RENDER_DEFAULTS.hardwareAcceleration,
        concurrency: HYBRID_GPU_RENDER_DEFAULTS.concurrency,
        imageFormat: HYBRID_GPU_RENDER_DEFAULTS.imageFormat,
        jpegQuality: HYBRID_GPU_RENDER_DEFAULTS.jpegQuality,
        x264Preset: HYBRID_GPU_RENDER_DEFAULTS.x264Preset,
        hwEncoder: hwEncoder.encoder,
        globalQuality: 22,
        preview: isPreview,
        width: isPreview ? 1280 : 1920,
        height: isPreview ? 720 : 1080,
        fps: isPreview ? 30 : 60,
      },
    };

    return NextResponse.json({
      success: true,
      payload,
    });
  } catch (error: any) {
    console.error("V9 Movie Generate API Error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi máy chủ khi sinh kịch bản phim tự động." },
      { status: 500 }
    );
  }
}
