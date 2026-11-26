/**
 * EPISODE JSON SCHEMA V17.0 — Universal JSON Auto-Factory
 * Định nghĩa chuẩn AutoEpisodeSpec + sanitizeAndValidateEpisode(rawJson)
 * Thuần erasable TypeScript (tương thích trực tiếp Node.js 24 .mjs lẫn Remotion TSX).
 */

export type AutoStageType =
  | "COUNTRYSIDE_YARD"
  | "SIMPLE_GRASS_FIELD"
  | "BEDROOM_INDOOR"
  | "CITY_STREET"
  | "CITY_LIVING_ROOM"
  | "CITY_STREET_PARK"
  | "SCHOOL_CLASSROOM"
  | "HOME_KITCHEN"
  | "SCIENCE_LAB_ROOM"
  | "DOCTOR_CLINIC"
  | "WATER_POND_OCEAN"
  | "UNDERGROUND_EARTH_CUTAWAY"
  | "SPACE_COSMOS"
  | "ANECHOIC_CHAMBER"
  | "EXPLAINER_POLKA_DOT"
  | "HOST_EXPLAIN_OVERLAY";

export type AutoTimeOfDay = "DAY" | "SUNSET" | "NIGHT";
export type AutoWeather = "CLEAR" | "RAIN" | "STORM" | "FLOOD";
export type AutoTransitionIn = "CROSSFADE" | "CUT";
export type AutoBgmMood = "BGM_STORY_CALM" | "BGM_TENSE_PULSE" | "BGM_WARM_OUTRO";
export type AutoVoiceTone =
  | "HOOK_INTRIGUE"
  | "CALM_STORY"
  | "TENSE_CLIMAX"
  | "SLOW_EMOTIONAL"
  | "STEP_BY_STEP_SUSPENSE"
  | "CHAPTER_ANNOUNCE";

export type AutoActorPreset = "BOY" | "GRANDPA" | "GRANDMA" | "DOCTOR" | "NEIGHBOR" | "CUSTOM";

export type ActorHairStyle =
  | "NONE"
  | "CURLY_SHORT"
  | "NEAT_SHORT"
  | "BOB"
  | "BUN"
  | "PONYTAIL"
  | "SIDE_GRAY";

export type ActorOutfitStyle =
  | "STICK"
  | "TSHIRT"
  | "POLO"
  | "CARDIGAN"
  | "VEST"
  | "LAB_COAT"
  | "SCHOOL_UNIFORM";

export type ActorGlassesStyle = "NONE" | "ROUND" | "RECT";

export type ActorAppearanceProp = "NONE" | "NOTEBOOK" | "BOOK" | "PHONE";

export interface ActorAppearanceSpec {
  scale?: number;
  hairStyle?: ActorHairStyle;
  hairColor?: string;
  outfitStyle?: ActorOutfitStyle;
  outfitColor?: string;
  glasses?: ActorGlassesStyle;
  mustache?: boolean;
  prop?: ActorAppearanceProp;
}
export type AutoActorSlot = "LEFT" | "CENTER" | "RIGHT";
export type AutoActorFacing = "LEFT" | "RIGHT";

export type AutoActorMotion =
  | "WALK_IN"
  | "RUN_CHASE"
  | "WAVE"
  | "THINK_STROLL"
  | "POINT_AT"
  | "JUMP_SHOCK"
  | "HOP_PAIN"
  | "SIT_OBSERVE"
  | "SLEEP_BED"
  | "CELEBRATE"
  | "APPROACH_OTHER"
  | "IDLE_TALK";

/** V18.0: 18 tư thế hành động 60fps chi tiết cho Keyframe Action Timeline ("Nhất Cử Nhất Động") */
export type ActionPoseV18 =
  | "WALK"
  | "RUN"
  | "TURN_AROUND"
  | "CROUCH_LOOK"
  | "REACH_GRAB"
  | "POINT_UP"
  | "POINT_FORWARD"
  | "SCRATCH_HEAD"
  | "FACEPALM"
  | "JUMP_BACK"
  | "ARMS_UP_CHEER"
  | "SIP_DRINK"
  | "WRITE_NOTE"
  | "SWEEP_LIGHT"
  | "PAT_SHOULDER"
  | "STRETCH_YAWN"
  | "LIE_SLEEP"
  | "SHIVER_PANIC"
  | "TALK_GESTURE"
  | "NOD_SMILE";

export interface ActorKeyframe {
  fromPct: number; // 0..1
  toPct: number;   // 0..1
  startX: number;  // 180..1740
  endX: number;    // 180..1740
  facing: AutoActorFacing;
  pose: ActionPoseV18;
  expression: AutoActorExpression;
  handProp?: AutoHandProp;
  shiver?: boolean;
}

export interface AutoCameraSpec {
  fromScale?: number; // 0.85..1.6 (mặc định 1.0)
  toScale?: number;   // 0.85..1.6 (mặc định 1.03)
  focusX?: number;    // 160..1760 (mặc định 960)
  focusY?: number;    // 120..920 (mặc định 520)
}

export type AutoPropId =
  | "NONE"
  | "ALARM_CLOCK_RINGING"
  | "SODA_CAN_FIZZ"
  | "COFFEE_STEAM"
  | "BRAIN_GLOW"
  | "NEURON_SIGNAL"
  | "BATTERY_LOW"
  | "BUG_SWARM"
  | "HEART_BEAT"
  | "THERMOMETER_HOT"
  | "GHOST_SHADOW"
  | "SOUND_WAVES"
  | "EARTH_CUTAWAY"
  | "NOTEBOOK_OPEN"
  | "MOON_STARS"
  | "WATER_RIPPLE"
  | "TROPHY_STAR";

export type AutoActorExpression =
  | "HAPPY"
  | "CURIOUS"
  | "SURPRISED"
  | "SHOCKED"
  | "SCARED"
  | "WORRIED"
  | "TIRED"
  | "PROUD"
  | "ANGRY"
  | "THINKING";

export type AutoHandProp =
  | "NONE"
  | "STICK"
  | "POINTER"
  | "MAGNIFYING_GLASS"
  | "BUCKET"
  | "NOTEBOOK"
  | "BOOK"
  | "PHONE"
  | "FLASHLIGHT"
  | "CUP_SODA"
  | "NET";

export type AutoPropAnimation = "FLOAT" | "PULSE" | "BOUNCE" | "SPIN" | "SHAKE" | "NONE";

/** V22.2: Khóa bảng nghiên cứu động theo chủ đề cho bối cảnh SCIENCE_LAB_ROOM / HOST_EXPLAIN_OVERLAY */
export type KnownLabBoardId =
  | "DEFAULT"
  | "ACOUSTICS_VOICE"
  | "ITCH_NEUROLOGY"
  | "MIRROR_NEURONS_YAWN"
  | "ACOUSTICS_CRINGE_ALARM"
  | "WATER_SKIN"
  | "ONION_CHEM"
  | "SLEEP_BRAIN";
export type LabBoardId = KnownLabBoardId | (string & {});

/** V22.3: Chi tiết sân quê bổ trợ cho cảnh đời sống COUNTRYSIDE_YARD (tùy chọn, tương thích ngược 100%) */
export type CountrysideYardDetailId =
  | "MOSQUITO_FLY"
  | "SCRATCH_SPARK"
  | "SWELL_BUMP"
  | "ICE_TOWEL"
  | "PORCH_FAN";

/** V22.5–V22.7: Chi tiết phụ trợ cho SCHOOL_CLASSROOM (chai nước bàn học, sóng cào bảng, viết phấn nghiêng 45 độ, khoảng sàn outro) */
export type ClassroomDetailId =
  | "NONE"
  | "DESK_WATER_BOTTLE"
  | "CHALK_SCRATCH_WAVE"
  | "CHALK_WRITE_45DEG"
  | "OUTRO_OPEN_FLOOR";

/** V22.7: Chi tiết phụ trợ cho HOME_KITCHEN (bàn ăn tối bò bít tết, sóng rít nĩa cọ đĩa sứ) */
export type KitchenDetailId =
  | "NONE"
  | "DINNER_STEAK"
  | "FORK_SCRAPE_WAVE";

/** V22.5: Chi tiết phụ trợ cho CITY_LIVING_ROOM (chú chó cưng 2D nằm trên thảm, ngáp theo, vẫy đuôi) */
export type LivingRoomDetailId =
  | "NONE"
  | "DOG_REST"
  | "DOG_YAWN"
  | "DAD_PET_DOG"
  | "DOG_WAG";

/** V22.5–V22.7: Điểm nhấn nổi bật trên bảng trắng HOST_EXPLAIN_OVERLAY */
export type HostBoardHighlightId =
  | "NONE"
  | "LEFT"
  | "CENTER"
  | "RIGHT"
  | "YAWN_TAG"
  | "OXYGEN_MYTH"
  | "TWO_TYPES"
  | "LAUGH_YAWN"
  | "NOT_COLD"
  | "BRAKE"
  | "CRINGE_IMAGINE"
  | "EAR_AMPLIFIER"
  | "BRAIN_ALARM"
  | "MUSIC_TRICK"
  | "WHY_IMMUNE"
  | "CRINGE_TIPS"
  | "SUMMARY";

export interface AutoActorSpec {
  preset: AutoActorPreset;
  appearance?: ActorAppearanceSpec;
  slot: AutoActorSlot;
  facing: AutoActorFacing;
  motion: AutoActorMotion;
  expression: AutoActorExpression;
  handProp?: AutoHandProp;
  bubble?: string;
  /** V18.0: Tỷ lệ thời điểm hiện/ẩn bóng thoại trong cảnh (0..1, mặc định 0.15 -> 0.90) */
  bubbleStartPct?: number;
  bubbleEndPct?: number;
  shiver?: boolean;
  /** V22.3: Khi true trên COUNTRYSIDE_YARD / SCHOOL_CLASSROOM / CITY_LIVING_ROOM -> nhân vật ngồi gập gối khít ghế/bàn/sofa */
  seated?: boolean;
  /** V22.4: Khi true -> khóa đồng tử mắt ở chính giữa (dx=0, dy=0) nhìn thẳng trực diện vào camera */
  lookAtCamera?: boolean;
  /** V22.5: Khi true -> nhân vật há miệng ngáp rõ ràng kèm sóng ngáp mềm bay nhẹ */
  yawning?: boolean;
  /** V22.5: Ghi đè trục y mặt sàn cục bộ cho nhân vật (vd: Host tại y=760/770) */
  groundY?: number;
  /** V18.0: Chuỗi Keyframe Action Timeline diễn xuất liên hoàn 60fps (nếu bỏ trống -> dùng motion/slot V17 cũ) */
  timeline?: ActorKeyframe[];
}

export interface AutoCustomPropSpec {
  label?: string;
  x: number; // 100..1820
  y: number; // 120..820
  scale?: number; // 0.4..2.4
  animation: AutoPropAnimation;
  svgInner: string; // An toàn bên trong viewBox="0 0 200 200"
}

export interface AutoCalloutSpec {
  text: string;
  x?: number;
  y?: number;
}

export interface AutoEpisodeBeat {
  id: string;
  actTitle?: string;
  headerTitle?: string;
  /** V20.0: Tiêu đề đầu mỗi Hồi hiển thị ở tầng trên cùng (map đồng bộ với headerTitle) */
  chapterBanner?: string;
  text: string;
  ttsText: string;
  stageType: AutoStageType;
  /** V22.2: Bảng nghiên cứu động theo chủ đề cho SCIENCE_LAB_ROOM (vd: "ACOUSTICS_VOICE", "ITCH_NEUROLOGY") */
  labBoard?: LabBoardId;
  /** V22.3: Chi tiết sân quê bổ trợ cho COUNTRYSIDE_YARD (muỗi bay, tia gãi, nốt sưng, khăn đá, quạt máy) */
  yardDetail?: CountrysideYardDetailId;
  /** V22.5–V22.7: Chi tiết lớp học bổ trợ cho SCHOOL_CLASSROOM (chai nước bàn học, sóng cào bảng, phấn 45 độ, sàn outro) */
  classroomDetail?: ClassroomDetailId;
  /** V22.7: Chi tiết phòng bếp bổ trợ cho HOME_KITCHEN (bàn ăn tối bò bít tết, sóng rít nĩa cọ đĩa sứ) */
  kitchenDetail?: KitchenDetailId;
  /** V22.5: Chi tiết phòng khách bổ trợ cho CITY_LIVING_ROOM (chú chó cưng nằm/ngáp/vẫy đuôi) */
  livingRoomDetail?: LivingRoomDetailId;
  /** V22.5: Chế độ Freeze-Frame Host giải thích (phủ màn trắng sữa 0.84 phẳng lên nền freezeStage) */
  overlayMode?: "HOST_EXPLAIN";
  /** V22.5: Bối cảnh đời thường đứng yên làm nền cho HOST_EXPLAIN_OVERLAY (vd: SCHOOL_CLASSROOM, CITY_LIVING_ROOM) */
  freezeStage?: AutoStageType;
  /** V22.5: Frame tĩnh cố định cho bối cảnh freezeStage (mặc định 90) */
  freezeFrame?: number;
  /** V22.5: Điểm nhấn/huy hiệu ngữ cảnh trên bảng trắng trong HOST_EXPLAIN_OVERLAY */
  hostBoardHighlight?: HostBoardHighlightId;
  /** V22.4: Khi true -> phủ lớp hồi tưởng (Flashback Overlay SVG phẳng: kem/sepia mờ, khung viền trắng 4 cạnh, tag "Hồi tưởng") */
  flashback?: boolean;
  timeOfDay: AutoTimeOfDay;
  weather: AutoWeather;
  transitionIn: AutoTransitionIn;
  transitionFrames: number;
  pauseAfterSec: number;
  bgmMood: AutoBgmMood;
  voiceTone?: AutoVoiceTone;
  /** V17.2: Đạo cụ vector chuyên nghiệp 60fps chọn từ 16 mẫu chuẩn (thay thế hoàn toàn svgInner thô của AI) */
  visualProp?: AutoPropId;
  /** V19.0: Khóa component hoạt họa minh họa riêng cho beat trong EPISODE_VISUAL_REGISTRY */
  customVisual?: string;
  /** V20.1: Bước diễn tiến (0, 1, 2...) cho hoạt họa customVisual trên các cảnh liên tiếp */
  visualStep?: number;
  /** V20.0: Khi true cùng customVisual hợp lệ -> render hoạt họa tràn toàn màn hình 1920x1080 */
  fullScreenVisual?: boolean;
  /** V18.0: Điều khiển Camera Zoom & Tâm lấy nét mượt 60fps cho toàn sân khấu */
  camera?: AutoCameraSpec;
  actors: AutoActorSpec[];
  customProps: AutoCustomPropSpec[];
  callout?: AutoCalloutSpec;
}

export interface AutoEpisodeSpec {
  title: string;
  slug: string;
  topic?: string;
  /** V22.2: Bảng nghiên cứu mặc định cấp tập cho các cảnh SCIENCE_LAB_ROOM (beat có thể ghi đè riêng) */
  labBoard?: LabBoardId;
  beats: AutoEpisodeBeat[];
}

export const VALID_STAGE_TYPES: readonly AutoStageType[] = [
  "COUNTRYSIDE_YARD",
  "SIMPLE_GRASS_FIELD",
  "BEDROOM_INDOOR",
  "CITY_STREET",
  "CITY_LIVING_ROOM",
  "CITY_STREET_PARK",
  "SCHOOL_CLASSROOM",
  "HOME_KITCHEN",
  "SCIENCE_LAB_ROOM",
  "DOCTOR_CLINIC",
  "WATER_POND_OCEAN",
  "UNDERGROUND_EARTH_CUTAWAY",
  "SPACE_COSMOS",
  "ANECHOIC_CHAMBER",
  "EXPLAINER_POLKA_DOT",
  "HOST_EXPLAIN_OVERLAY",
];

export const VALID_TIME_OF_DAY: readonly AutoTimeOfDay[] = ["DAY", "SUNSET", "NIGHT"];
export const VALID_WEATHER: readonly AutoWeather[] = ["CLEAR", "RAIN", "STORM", "FLOOD"];
export const VALID_TRANSITION_IN: readonly AutoTransitionIn[] = ["CROSSFADE", "CUT"];
export const VALID_BGM_MOOD: readonly AutoBgmMood[] = ["BGM_STORY_CALM", "BGM_TENSE_PULSE", "BGM_WARM_OUTRO"];
export const VALID_VOICE_TONE: readonly AutoVoiceTone[] = [
  "HOOK_INTRIGUE",
  "CALM_STORY",
  "TENSE_CLIMAX",
  "SLOW_EMOTIONAL",
  "STEP_BY_STEP_SUSPENSE",
  "CHAPTER_ANNOUNCE",
];
export const VALID_ACTOR_PRESETS: readonly AutoActorPreset[] = [
  "BOY",
  "GRANDPA",
  "GRANDMA",
  "DOCTOR",
  "NEIGHBOR",
  "CUSTOM",
];
export const VALID_HAIR_STYLES: readonly ActorHairStyle[] = [
  "NONE",
  "CURLY_SHORT",
  "NEAT_SHORT",
  "BOB",
  "BUN",
  "PONYTAIL",
  "SIDE_GRAY",
];
export const VALID_OUTFIT_STYLES: readonly ActorOutfitStyle[] = [
  "STICK",
  "TSHIRT",
  "POLO",
  "CARDIGAN",
  "VEST",
  "LAB_COAT",
  "SCHOOL_UNIFORM",
];
export const VALID_GLASSES_STYLES: readonly ActorGlassesStyle[] = ["NONE", "ROUND", "RECT"];
export const VALID_APPEARANCE_PROPS: readonly ActorAppearanceProp[] = ["NONE", "NOTEBOOK", "BOOK", "PHONE"];
export const VALID_ACTOR_SLOTS: readonly AutoActorSlot[] = ["LEFT", "CENTER", "RIGHT"];
export const VALID_ACTOR_FACING: readonly AutoActorFacing[] = ["LEFT", "RIGHT"];
export const VALID_ACTOR_MOTIONS: readonly AutoActorMotion[] = [
  "WALK_IN",
  "RUN_CHASE",
  "WAVE",
  "THINK_STROLL",
  "POINT_AT",
  "JUMP_SHOCK",
  "HOP_PAIN",
  "SIT_OBSERVE",
  "SLEEP_BED",
  "CELEBRATE",
  "APPROACH_OTHER",
  "IDLE_TALK",
];

export const VALID_ACTION_POSES_V18: readonly ActionPoseV18[] = [
  "WALK",
  "RUN",
  "TURN_AROUND",
  "CROUCH_LOOK",
  "REACH_GRAB",
  "POINT_UP",
  "POINT_FORWARD",
  "SCRATCH_HEAD",
  "FACEPALM",
  "JUMP_BACK",
  "ARMS_UP_CHEER",
  "SIP_DRINK",
  "WRITE_NOTE",
  "SWEEP_LIGHT",
  "PAT_SHOULDER",
  "STRETCH_YAWN",
  "LIE_SLEEP",
  "SHIVER_PANIC",
  "TALK_GESTURE",
  "NOD_SMILE",
];

export const VALID_AUTO_PROP_IDS: readonly AutoPropId[] = [
  "NONE",
  "ALARM_CLOCK_RINGING",
  "SODA_CAN_FIZZ",
  "COFFEE_STEAM",
  "BRAIN_GLOW",
  "NEURON_SIGNAL",
  "BATTERY_LOW",
  "BUG_SWARM",
  "HEART_BEAT",
  "THERMOMETER_HOT",
  "GHOST_SHADOW",
  "SOUND_WAVES",
  "EARTH_CUTAWAY",
  "NOTEBOOK_OPEN",
  "MOON_STARS",
  "WATER_RIPPLE",
  "TROPHY_STAR",
];
export const VALID_ACTOR_EXPRESSIONS: readonly AutoActorExpression[] = [
  "HAPPY",
  "CURIOUS",
  "SURPRISED",
  "SHOCKED",
  "SCARED",
  "WORRIED",
  "TIRED",
  "PROUD",
  "ANGRY",
  "THINKING",
];
export const VALID_HAND_PROPS: readonly AutoHandProp[] = [
  "NONE",
  "STICK",
  "POINTER",
  "MAGNIFYING_GLASS",
  "BUCKET",
  "NOTEBOOK",
  "BOOK",
  "PHONE",
  "FLASHLIGHT",
  "CUP_SODA",
  "NET",
];
export const VALID_PROP_ANIMATIONS: readonly AutoPropAnimation[] = [
  "FLOAT",
  "PULSE",
  "BOUNCE",
  "SPIN",
  "SHAKE",
  "NONE",
];

const SAFE_SVG_TAGS = new Set(["path", "circle", "ellipse", "rect", "line", "polygon", "polyline", "g"]);
const SAFE_SVG_ATTRS = new Set([
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "points",
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-opacity",
  "opacity",
  "transform",
]);

function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function normalizeUpperKey(val: unknown): string {
  return String(val ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function matchEnum<T extends string>(
  raw: unknown,
  validList: readonly T[],
  fallback: T,
  aliases?: Record<string, T>
): T {
  const key = normalizeUpperKey(raw);
  if (!key) return fallback;
  if ((validList as readonly string[]).includes(key)) return key as T;
  if (aliases && aliases[key]) return aliases[key];
  // Tìm khớp một phần gần nhất theo từ khóa
  for (const v of validList) {
    if (key.includes(v) || v.includes(key)) return v;
  }
  if (aliases) {
    for (const [aliasKey, mapped] of Object.entries(aliases)) {
      if (key.includes(aliasKey)) return mapped;
    }
  }
  return fallback;
}

export function slugifyVietnamese(input: string): string {
  return String(input || "auto_episode")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64) || "auto_episode";
}

/**
 * Làm sạch tuyệt đối `svgInner` do AI sinh ra:
 * - Chặn 100% <script>, <style>, <foreignObject>, <iframe>, <image>, <use>, javascript:, on* event handlers.
 * - Chỉ giữ lại các thẻ hình học SVG an toàn: path, circle, ellipse, rect, line, polygon, polyline, g
 *   với tập thuộc tính hình học/màu sắc an toàn (viewBox 0..200).
 */
export function sanitizeSvgInner(rawSvg: unknown): string {
  if (typeof rawSvg !== "string" || !rawSvg.trim()) return "";

  let cleaned = rawSvg
    // Xóa comment và thẻ nguy hiểm kèm toàn bộ nội dung bên trong
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|foreignObject|iframe|object|embed|applet|meta|link|title|desc)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|foreignObject|iframe|object|embed|applet|meta|link|image|use)\b[^>]*\/?>/gi, "")
    // Bóc vỏ <svg ...>...</svg> nếu AI lỡ bọc thêm lớp ngoài
    .replace(/<\/?svg\b[^>]*>/gi, "");

  // Chỉ giữ lại các thẻ hình học nằm trong whitelist SAFE_SVG_TAGS cùng thuộc tính an toàn
  const outParts: string[] = [];
  const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)([^>]*)>/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(cleaned)) !== null) {
    const isClose = match[1] === "/";
    const tagName = match[2].toLowerCase();
    const rawAttrChunk = match[3] || "";

    if (!SAFE_SVG_TAGS.has(tagName)) {
      continue;
    }

    if (isClose) {
      outParts.push(`</${tagName}>`);
      continue;
    }

    const isSelfClosing = /\/\s*$/.test(rawAttrChunk);
    const attrSource = isSelfClosing ? rawAttrChunk.replace(/\/\s*$/, "") : rawAttrChunk;
    const safeAttrs: string[] = [];

    const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(attrSource)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrVal = (attrMatch[2] ?? attrMatch[3] ?? "").trim();

      if (attrName.startsWith("on")) continue;
      if (!SAFE_SVG_ATTRS.has(attrName)) continue;
      // Chặn javascript:, vbscript:, data:, url(...), expression(...)
      if (/(?:javascript|vbscript|data)\s*:|expression\s*\(|url\s*\(/i.test(attrVal)) continue;

      const escapedVal = attrVal.replace(/"/g, "&quot;").replace(/[<>]/g, "");
      safeAttrs.push(`${attrName}="${escapedVal}"`);
    }

    const attrStr = safeAttrs.length > 0 ? ` ${safeAttrs.join(" ")}` : "";
    outParts.push(`<${tagName}${attrStr}${isSelfClosing ? " /" : ""}>`);
  }

  // Đóng tự động các thẻ <g> lỡ quên đóng để không làm gãy SVG DOM
  let openG = 0;
  for (const part of outParts) {
    if (/^<g(\s|>)/.test(part) && !/\/>$/.test(part)) openG++;
    else if (part === "</g>") openG = Math.max(0, openG - 1);
  }
  while (openG > 0) {
    outParts.push("</g>");
    openG--;
  }

  return outParts.join("").trim();
}

const STAGE_ALIASES: Record<string, AutoStageType> = {
  YARD: "COUNTRYSIDE_YARD",
  VILLAGE: "COUNTRYSIDE_YARD",
  HOME_YARD: "COUNTRYSIDE_YARD",
  GARDEN: "SIMPLE_GRASS_FIELD",
  PARK: "SIMPLE_GRASS_FIELD",
  FIELD: "SIMPLE_GRASS_FIELD",
  MEADOW: "SIMPLE_GRASS_FIELD",
  BEDROOM: "BEDROOM_INDOOR",
  ROOM: "BEDROOM_INDOOR",
  INDOOR: "BEDROOM_INDOOR",
  CITY: "CITY_STREET",
  STREET: "CITY_STREET",
  ROAD: "CITY_STREET",
  TOWN: "CITY_STREET",
  LIVING_ROOM: "CITY_LIVING_ROOM",
  APARTMENT: "CITY_LIVING_ROOM",
  LOUNGE: "CITY_LIVING_ROOM",
  STREET_PARK: "CITY_STREET_PARK",
  CITY_PARK: "CITY_STREET_PARK",
  URBAN_PARK: "CITY_STREET_PARK",
  SIDEWALK: "CITY_STREET_PARK",
  CLASSROOM: "SCHOOL_CLASSROOM",
  SCHOOL: "SCHOOL_CLASSROOM",
  CLASS: "SCHOOL_CLASSROOM",
  KITCHEN: "HOME_KITCHEN",
  DINING_ROOM: "HOME_KITCHEN",
  DINING: "HOME_KITCHEN",
  LAB: "SCIENCE_LAB_ROOM",
  LABORATORY: "SCIENCE_LAB_ROOM",
  SCIENCE_LAB: "SCIENCE_LAB_ROOM",
  CLINIC: "DOCTOR_CLINIC",
  HOSPITAL: "DOCTOR_CLINIC",
  MEDICAL: "DOCTOR_CLINIC",
  POND: "WATER_POND_OCEAN",
  OCEAN: "WATER_POND_OCEAN",
  SEA: "WATER_POND_OCEAN",
  LAKE: "WATER_POND_OCEAN",
  RIVER: "WATER_POND_OCEAN",
  WATER: "WATER_POND_OCEAN",
  UNDERGROUND: "UNDERGROUND_EARTH_CUTAWAY",
  EARTH: "UNDERGROUND_EARTH_CUTAWAY",
  SOIL: "UNDERGROUND_EARTH_CUTAWAY",
  TUNNEL: "UNDERGROUND_EARTH_CUTAWAY",
  SPACE: "SPACE_COSMOS",
  COSMOS: "SPACE_COSMOS",
  GALAXY: "SPACE_COSMOS",
  UNIVERSE: "SPACE_COSMOS",
  ANECHOIC: "ANECHOIC_CHAMBER",
  QUIET_ROOM: "ANECHOIC_CHAMBER",
  SILENT_ROOM: "ANECHOIC_CHAMBER",
  SOUNDPROOF: "ANECHOIC_CHAMBER",
  SOUNDPROOF_ROOM: "ANECHOIC_CHAMBER",
  CHAMBER: "ANECHOIC_CHAMBER",
  EXPLAINER: "EXPLAINER_POLKA_DOT",
  POLKA: "EXPLAINER_POLKA_DOT",
  DIAGRAM: "EXPLAINER_POLKA_DOT",
  INFOGRAPHIC: "EXPLAINER_POLKA_DOT",
};

const MOTION_ALIASES: Record<string, AutoActorMotion> = {
  WALK: "WALK_IN",
  ENTER: "WALK_IN",
  RUN: "RUN_CHASE",
  CHASE: "RUN_CHASE",
  SPRINT: "RUN_CHASE",
  GREET: "WAVE",
  HELLO: "WAVE",
  THINK: "THINK_STROLL",
  STROLL: "THINK_STROLL",
  PONDER: "THINK_STROLL",
  POINT: "POINT_AT",
  EXPLAIN: "POINT_AT",
  JUMP: "JUMP_SHOCK",
  SHOCK: "JUMP_SHOCK",
  STARTLE: "JUMP_SHOCK",
  HOP: "HOP_PAIN",
  PAIN: "HOP_PAIN",
  OUCH: "HOP_PAIN",
  SIT: "SIT_OBSERVE",
  OBSERVE: "SIT_OBSERVE",
  WATCH: "SIT_OBSERVE",
  SLEEP: "SLEEP_BED",
  BED: "SLEEP_BED",
  CHEER: "CELEBRATE",
  HAPPY_JUMP: "CELEBRATE",
  APPROACH: "APPROACH_OTHER",
  TOUCH_SHOULDER: "APPROACH_OTHER",
  PAT_SHOULDER: "APPROACH_OTHER",
  HAND_OVER: "APPROACH_OTHER",
  GIVE: "APPROACH_OTHER",
  COMFORT: "APPROACH_OTHER",
  COME_CLOSE: "APPROACH_OTHER",
  IDLE: "IDLE_TALK",
  TALK: "IDLE_TALK",
  STAND: "IDLE_TALK",
};

const VISUAL_PROP_ALIASES: Record<string, AutoPropId> = {
  CLOCK: "ALARM_CLOCK_RINGING",
  ALARM: "ALARM_CLOCK_RINGING",
  TIME: "ALARM_CLOCK_RINGING",
  SODA: "SODA_CAN_FIZZ",
  CAN: "SODA_CAN_FIZZ",
  DRINK: "SODA_CAN_FIZZ",
  COFFEE: "COFFEE_STEAM",
  TEA: "COFFEE_STEAM",
  CUP: "COFFEE_STEAM",
  BRAIN: "BRAIN_GLOW",
  MIND: "BRAIN_GLOW",
  NEURON: "NEURON_SIGNAL",
  SYNAPSE: "NEURON_SIGNAL",
  NERVE: "NEURON_SIGNAL",
  BATTERY: "BATTERY_LOW",
  ENERGY: "BATTERY_LOW",
  TIRED_BATTERY: "BATTERY_LOW",
  BUG: "BUG_SWARM",
  INSECT: "BUG_SWARM",
  MOSQUITO: "BUG_SWARM",
  ANT: "BUG_SWARM",
  HEART: "HEART_BEAT",
  PULSE: "HEART_BEAT",
  THERMOMETER: "THERMOMETER_HOT",
  FEVER: "THERMOMETER_HOT",
  TEMP: "THERMOMETER_HOT",
  HOT: "THERMOMETER_HOT",
  GHOST: "GHOST_SHADOW",
  SHADOW: "GHOST_SHADOW",
  HALLUCINATION: "GHOST_SHADOW",
  SOUND: "SOUND_WAVES",
  AUDIO: "SOUND_WAVES",
  VOICE: "SOUND_WAVES",
  EARTH: "EARTH_CUTAWAY",
  PLANET: "EARTH_CUTAWAY",
  WORLD: "EARTH_CUTAWAY",
  NOTEBOOK: "NOTEBOOK_OPEN",
  BOOK: "NOTEBOOK_OPEN",
  DIARY: "NOTEBOOK_OPEN",
  MOON: "MOON_STARS",
  STAR: "MOON_STARS",
  NIGHT_SKY: "MOON_STARS",
  WATER: "WATER_RIPPLE",
  WAVE: "WATER_RIPPLE",
  DROP: "WATER_RIPPLE",
  TROPHY: "TROPHY_STAR",
  AWARD: "TROPHY_STAR",
};

function inferVisualPropFromLegacyLabel(labelOrText: string): AutoPropId {
  const s = (labelOrText || "").toLowerCase();
  if (!s) return "NONE";
  if (/đồng hồ|báo thức|2:00|giờ sáng|kim giờ/.test(s)) return "ALARM_CLOCK_RINGING";
  if (/cà phê|trà nóng|cốc nóng|khói/.test(s)) return "COFFEE_STEAM";
  if (/nước ngọt|lon nước|có ga|soda/.test(s)) return "SODA_CAN_FIZZ";
  if (/tế bào thần kinh|nơ-ron|neuron|xung điện/.test(s)) return "NEURON_SIGNAL";
  if (/não|trí nhớ|đầu óc/.test(s)) return "BRAIN_GLOW";
  if (/pin|cạn sức|năng lượng/.test(s)) return "BATTERY_LOW";
  if (/muỗi|bọ|côn trùng|kiến|ong|ve/.test(s)) return "BUG_SWARM";
  if (/tim|nhịp đập|mạch/.test(s)) return "HEART_BEAT";
  if (/nhiệt kế|sốt|nóng/.test(s)) return "THERMOMETER_HOT";
  if (/ảo giác|bóng đen|hoa mắt|chập chờn/.test(s)) return "GHOST_SHADOW";
  if (/sóng âm|tiếng kêu|âm thanh/.test(s)) return "SOUND_WAVES";
  if (/trái đất|địa cầu|lòng đất/.test(s)) return "EARTH_CUTAWAY";
  if (/sổ tay|ghi chép|nhật ký|trang giấy/.test(s)) return "NOTEBOOK_OPEN";
  if (/trăng|sao/.test(s)) return "MOON_STARS";
  if (/mặt nước|giọt nước|sóng nước/.test(s)) return "WATER_RIPPLE";
  if (/ngôi sao|chiến thắng|cúp/.test(s)) return "TROPHY_STAR";
  return "NONE";
}

const EXPRESSION_ALIASES: Record<string, AutoActorExpression> = {
  SMILE: "HAPPY",
  JOY: "HAPPY",
  EXCITED: "HAPPY",
  INQUISITIVE: "CURIOUS",
  WONDER: "CURIOUS",
  AMAZED: "SURPRISED",
  ASTONISHED: "SURPRISED",
  ANXIOUS: "WORRIED",
  NERVOUS: "WORRIED",
  CONCERNED: "WORRIED",
  AFRAID: "SCARED",
  FEAR: "SCARED",
  PANIC: "SCARED",
  SLEEPY: "TIRED",
  EXHAUSTED: "TIRED",
  CONFIDENT: "PROUD",
  MAD: "ANGRY",
  FURIOUS: "ANGRY",
  THINK: "THINKING",
  CONFUSED: "THINKING",
};

const PRESET_ALIASES: Record<string, AutoActorPreset> = {
  KID: "BOY",
  CHILD: "BOY",
  PROTAGONIST: "BOY",
  NARRATOR: "BOY",
  OLD_MAN: "GRANDPA",
  GRANDFATHER: "GRANDPA",
  OLD_WOMAN: "GRANDMA",
  GRANDMOTHER: "GRANDMA",
  SCIENTIST: "DOCTOR",
  MEDIC: "DOCTOR",
  FRIEND: "NEIGHBOR",
  MAN: "NEIGHBOR",
};

const HAND_PROP_ALIASES: Record<string, AutoHandProp> = {
  TWIG: "STICK",
  BRANCH: "STICK",
  MAGNIFIER: "MAGNIFYING_GLASS",
  GLASS: "MAGNIFYING_GLASS",
  LOUPE: "MAGNIFYING_GLASS",
  PAIL: "BUCKET",
  TEXTBOOK: "BOOK",
  DIARY: "NOTEBOOK",
  SMARTPHONE: "PHONE",
  MOBILE: "PHONE",
  TORCH: "FLASHLIGHT",
  LIGHT: "FLASHLIGHT",
  SODA: "CUP_SODA",
  CUP: "CUP_SODA",
  COFFEE: "CUP_SODA",
  DRINK: "CUP_SODA",
  DIP_NET: "NET",
  BUTTERFLY_NET: "NET",
};

const ANIM_ALIASES: Record<string, AutoPropAnimation> = {
  HOVER: "FLOAT",
  BOB: "FLOAT",
  DRIFT: "FLOAT",
  GLOW: "PULSE",
  BEAT: "PULSE",
  HOP: "BOUNCE",
  JUMP: "BOUNCE",
  ROTATE: "SPIN",
  TURN: "SPIN",
  VIBRATE: "SHAKE",
  WIGGLE: "SHAKE",
  STATIC: "NONE",
};

const ROBOTIC_BUBBLE_PATTERNS: readonly RegExp[] = [
  /^cười(?=$|[\s.!?,…:;])/i,
  /^khóc(?=$|[\s.!?,…:;])/i,
  /^đang\s+(đi|chạy|ngồi|đứng|nhìn|nghĩ|suy\s+nghĩ|cười|khóc|ngủ|ăn|uống)(?=$|[\s.!?,…:;])/i,
  /^suy\s+nghĩ(?=$|[\s.!?,…:;])/i,
  /^ngạc\s+nhiên(?=$|[\s.!?,…:;])/i,
  /^sợ\s+quá(?=$|[\s.!?,…:;])/i,
  /^lo\s+lắng(?=$|[\s.!?,…:;])/i,
  /^giật\s+mình(?=$|[\s.!?,…:;])/i,
  /^thở\s+dài(?=$|[\s.!?,…:;])/i,
  /^gật\s+đầu(?=$|[\s.!?,…:;])/i,
  /^lắc\s+đầu(?=$|[\s.!?,…:;])/i,
  /^vui\s+quá\s+đi(?=$|[\s.!?,…:;])/i,
  /^buồn\s+quá\s+đi(?=$|[\s.!?,…:;])/i,
  /^(ha\s*ha+|hi\s*hi+|hu\s*hu+|he\s*he+)[.!?…\s]*$/i,
  /^\*.*\*$/,
  /^\(.*\)$/,
  /^[.!?…\s-]+$/,
];

/**
 * V17.2–V22.5: Lọc bỏ bóng thoại sáo rỗng / mô tả hành động / quá dài (> 10 từ) để giữ lời thoại đời thường tự nhiên (hỗ trợ tự xuống 2 dòng).
 */
export function sanitizeSpeechBubble(rawBubble: unknown): string | undefined {
  if (typeof rawBubble !== "string") return undefined;
  const cleaned = rawBubble
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return undefined;

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > 10) return undefined;

  for (const pattern of ROBOTIC_BUBBLE_PATTERNS) {
    if (pattern.test(cleaned)) return undefined;
  }

  return cleaned.slice(0, 84);
}

const ACTION_POSE_V18_ALIASES: Record<string, ActionPoseV18> = {
  WALK_IN: "WALK",
  STROLL: "WALK",
  RUN_CHASE: "RUN",
  SPRINT: "RUN",
  TURN: "TURN_AROUND",
  LOOK_BACK: "TURN_AROUND",
  CROUCH: "CROUCH_LOOK",
  SQUAT_LOOK: "CROUCH_LOOK",
  INSPECT: "CROUCH_LOOK",
  GRAB: "REACH_GRAB",
  REACH: "REACH_GRAB",
  PICK_UP: "REACH_GRAB",
  POINT_SKY: "POINT_UP",
  IDEA: "POINT_UP",
  POINT: "POINT_FORWARD",
  POINT_AT: "POINT_FORWARD",
  SCRATCH: "SCRATCH_HEAD",
  CONFUSED: "SCRATCH_HEAD",
  SLAP_FOREHEAD: "FACEPALM",
  OH_NO: "FACEPALM",
  JUMP_SHOCK: "JUMP_BACK",
  STARTLE: "JUMP_BACK",
  RECOIL: "JUMP_BACK",
  CELEBRATE: "ARMS_UP_CHEER",
  CHEER: "ARMS_UP_CHEER",
  SIP: "SIP_DRINK",
  DRINK: "SIP_DRINK",
  WRITE: "WRITE_NOTE",
  JOT_DOWN: "WRITE_NOTE",
  FLASHLIGHT_SWEEP: "SWEEP_LIGHT",
  SWEEP: "SWEEP_LIGHT",
  SHINE_LIGHT: "SWEEP_LIGHT",
  PAT: "PAT_SHOULDER",
  COMFORT: "PAT_SHOULDER",
  YAWN: "STRETCH_YAWN",
  STRETCH: "STRETCH_YAWN",
  SLEEP: "LIE_SLEEP",
  SLEEP_BED: "LIE_SLEEP",
  PANIC: "SHIVER_PANIC",
  SHIVER: "SHIVER_PANIC",
  TALK: "TALK_GESTURE",
  SPEAK: "TALK_GESTURE",
  GESTURE: "TALK_GESTURE",
  CHAT: "TALK_GESTURE",
  EXPLAIN_HANDS: "TALK_GESTURE",
  IDLE: "TALK_GESTURE",
  STAND: "TALK_GESTURE",
  STANDING: "TALK_GESTURE",
  NOD: "NOD_SMILE",
  AGREE: "NOD_SMILE",
  SMILE_NOD: "NOD_SMILE",
  CALM_SMILE: "NOD_SMILE",
  LISTEN_SMILE: "NOD_SMILE",
};

function sanitizeActorKeyframe(
  raw: any,
  fallbackX: number,
  fallbackFacing: AutoActorFacing,
  fallbackExpr: AutoActorExpression
): ActorKeyframe {
  const fromPct = Number(clampNum(raw?.fromPct, 0, 1, 0).toFixed(3));
  const rawTo = clampNum(raw?.toPct, fromPct, 1, 1);
  const toPct = Number(Math.max(fromPct, rawTo).toFixed(3));
  const startX = Math.round(clampNum(raw?.startX, 180, 1740, fallbackX));
  const endX = Math.round(clampNum(raw?.endX, 180, 1740, startX));
  const facing = matchEnum(raw?.facing, VALID_ACTOR_FACING, fallbackFacing);
  const defaultPose: ActionPoseV18 = Math.abs(endX - startX) < 10 ? "TALK_GESTURE" : "WALK";
  const pose = matchEnum(raw?.pose, VALID_ACTION_POSES_V18, defaultPose, ACTION_POSE_V18_ALIASES);
  const expression = matchEnum(raw?.expression, VALID_ACTOR_EXPRESSIONS, fallbackExpr, EXPRESSION_ALIASES);
  const handProp = raw?.handProp !== undefined
    ? matchEnum(raw.handProp, VALID_HAND_PROPS, "NONE", HAND_PROP_ALIASES)
    : undefined;
  const shiver = raw?.shiver !== undefined ? Boolean(raw.shiver) : undefined;

  return {
    fromPct,
    toPct,
    startX,
    endX,
    facing,
    pose,
    expression,
    ...(handProp !== undefined ? { handProp } : {}),
    ...(shiver !== undefined ? { shiver } : {}),
  };
}

function sanitizeCamera(raw: any): AutoCameraSpec | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const hasAny =
    raw.fromScale !== undefined ||
    raw.toScale !== undefined ||
    raw.focusX !== undefined ||
    raw.focusY !== undefined;
  if (!hasAny) return undefined;

  return {
    fromScale: Number(clampNum(raw.fromScale, 0.85, 1.6, 1.0).toFixed(3)),
    toScale: Number(clampNum(raw.toScale, 0.85, 1.6, 1.03).toFixed(3)),
    focusX: Math.round(clampNum(raw.focusX, 160, 1760, 960)),
    focusY: Math.round(clampNum(raw.focusY, 120, 920, 520)),
  };
}

export function isValidHexColor(raw: unknown): raw is string {
  return typeof raw === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw.trim());
}

export function sanitizeActorAppearance(raw: unknown): ActorAppearanceSpec | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const r = raw as Record<string, unknown>;
  const out: ActorAppearanceSpec = {};

  if (r.scale !== undefined && r.scale !== null && Number.isFinite(Number(r.scale))) {
    out.scale = Number(clampNum(r.scale, 0.5, 1.4, 1.0).toFixed(3));
  }
  if (r.hairStyle !== undefined && r.hairStyle !== null && String(r.hairStyle).trim() !== "") {
    out.hairStyle = matchEnum(r.hairStyle, VALID_HAIR_STYLES, "NEAT_SHORT");
  }
  if (r.hairColor !== undefined && r.hairColor !== null && String(r.hairColor).trim() !== "") {
    out.hairColor = isValidHexColor(r.hairColor) ? r.hairColor.trim() : "#1E293B";
  }
  if (r.outfitStyle !== undefined && r.outfitStyle !== null && String(r.outfitStyle).trim() !== "") {
    out.outfitStyle = matchEnum(r.outfitStyle, VALID_OUTFIT_STYLES, "STICK");
  }
  if (r.outfitColor !== undefined && r.outfitColor !== null && String(r.outfitColor).trim() !== "") {
    if (isValidHexColor(r.outfitColor)) {
      out.outfitColor = r.outfitColor.trim();
    }
  }
  if (r.glasses !== undefined && r.glasses !== null && String(r.glasses).trim() !== "") {
    out.glasses = matchEnum(r.glasses, VALID_GLASSES_STYLES, "NONE");
  }
  if (r.mustache !== undefined && r.mustache !== null) {
    out.mustache = Boolean(r.mustache);
  }
  if (r.prop !== undefined && r.prop !== null && String(r.prop).trim() !== "") {
    out.prop = matchEnum(r.prop, VALID_APPEARANCE_PROPS, "NONE");
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function sanitizeActor(raw: any, index: number, totalActors = 2): AutoActorSpec {
  const appearance = sanitizeActorAppearance(raw?.appearance);
  const rawPresetStr = typeof raw?.preset === "string" ? raw.preset.trim() : "";
  const fallbackPreset: AutoActorPreset = appearance && !rawPresetStr ? "CUSTOM" : "BOY";
  const preset = matchEnum(raw?.preset, VALID_ACTOR_PRESETS, fallbackPreset, PRESET_ALIASES);
  const defaultSlot: AutoActorSlot =
    totalActors >= 3
      ? index === 0
        ? "LEFT"
        : index === 1
        ? "CENTER"
        : "RIGHT"
      : index === 0
      ? "LEFT"
      : "RIGHT";
  const slot = matchEnum(raw?.slot, VALID_ACTOR_SLOTS, defaultSlot);
  const defaultFacing: AutoActorFacing = slot === "RIGHT" ? "LEFT" : "RIGHT";
  const facing = matchEnum(raw?.facing, VALID_ACTOR_FACING, defaultFacing);
  const motion = matchEnum(raw?.motion, VALID_ACTOR_MOTIONS, "IDLE_TALK", MOTION_ALIASES);
  const expression = matchEnum(raw?.expression, VALID_ACTOR_EXPRESSIONS, "HAPPY", EXPRESSION_ALIASES);
  const explicitHandProp =
    raw?.handProp !== undefined && String(raw.handProp).trim() !== ""
      ? matchEnum(raw.handProp, VALID_HAND_PROPS, "NONE", HAND_PROP_ALIASES)
      : undefined;
  const handProp: AutoHandProp =
    explicitHandProp && explicitHandProp !== "NONE"
      ? explicitHandProp
      : appearance?.prop && appearance.prop !== "NONE"
      ? appearance.prop
      : explicitHandProp ?? "NONE";
  const bubbleClean = sanitizeSpeechBubble(raw?.bubble);
  const shiver = Boolean(raw?.shiver);
  const seated = Boolean(raw?.seated);
  const lookAtCamera = Boolean(raw?.lookAtCamera);
  const yawning = Boolean(raw?.yawning);
  const groundY =
    raw?.groundY !== undefined && raw?.groundY !== null && Number.isFinite(Number(raw.groundY))
      ? Math.round(clampNum(raw.groundY, 640, 920, 840))
      : undefined;

  const hasBubbleWindow = raw?.bubbleStartPct !== undefined || raw?.bubbleEndPct !== undefined;
  const bubbleStartPct = hasBubbleWindow
    ? Number(clampNum(raw?.bubbleStartPct, 0, 0.95, 0.15).toFixed(3))
    : undefined;
  const bubbleEndPct = hasBubbleWindow
    ? Number(clampNum(raw?.bubbleEndPct, Math.min(1, (bubbleStartPct ?? 0.15) + 0.05), 1, 0.9).toFixed(3))
    : undefined;

  const defaultSlotX = slot === "LEFT" ? 490 : slot === "RIGHT" ? 1390 : 960;
  let timeline: ActorKeyframe[] | undefined;
  if (Array.isArray(raw?.timeline) && raw.timeline.length > 0) {
    timeline = raw.timeline
      .slice(0, 12)
      .map((kf: any) => sanitizeActorKeyframe(kf, defaultSlotX, facing, expression))
      .sort((a: ActorKeyframe, b: ActorKeyframe) => a.fromPct - b.fromPct);
  }

  return {
    preset,
    ...(appearance ? { appearance } : {}),
    slot,
    facing,
    motion,
    expression,
    ...(handProp !== "NONE" ? { handProp } : { handProp: "NONE" }),
    ...(bubbleClean ? { bubble: bubbleClean } : {}),
    ...(bubbleStartPct !== undefined ? { bubbleStartPct } : {}),
    ...(bubbleEndPct !== undefined ? { bubbleEndPct } : {}),
    ...(shiver ? { shiver: true } : {}),
    ...(seated ? { seated: true } : {}),
    ...(lookAtCamera ? { lookAtCamera: true } : {}),
    ...(yawning ? { yawning: true } : {}),
    ...(groundY !== undefined ? { groundY } : {}),
    ...(timeline ? { timeline } : {}),
  };
}

function sanitizeCustomProp(raw: any): AutoCustomPropSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const svgInner = sanitizeSvgInner(raw.svgInner);
  if (!svgInner) return null;

  const label = typeof raw.label === "string" ? raw.label.trim().slice(0, 36) : undefined;
  const x = Math.round(clampNum(raw.x, 100, 1820, 960));
  const y = Math.round(clampNum(raw.y, 120, 820, 460));
  const scale = Number(clampNum(raw.scale, 0.4, 2.4, 1.0).toFixed(2));
  const animation = matchEnum(raw.animation, VALID_PROP_ANIMATIONS, "FLOAT", ANIM_ALIASES);

  return {
    ...(label ? { label } : {}),
    x,
    y,
    scale,
    animation,
    svgInner,
  };
}

function sanitizeLabBoardId(raw: unknown): LabBoardId | undefined {
  if (typeof raw !== "string") return undefined;
  const norm = raw
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .slice(0, 48);
  return norm ? (norm as LabBoardId) : undefined;
}

const VALID_YARD_DETAILS: readonly CountrysideYardDetailId[] = [
  "MOSQUITO_FLY",
  "SCRATCH_SPARK",
  "SWELL_BUMP",
  "ICE_TOWEL",
  "PORCH_FAN",
];

function sanitizeYardDetailId(raw: unknown): CountrysideYardDetailId | undefined {
  if (typeof raw !== "string") return undefined;
  const norm = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return (VALID_YARD_DETAILS as readonly string[]).includes(norm)
    ? (norm as CountrysideYardDetailId)
    : undefined;
}

const VALID_CLASSROOM_DETAILS: readonly ClassroomDetailId[] = [
  "NONE",
  "DESK_WATER_BOTTLE",
  "CHALK_SCRATCH_WAVE",
  "CHALK_WRITE_45DEG",
  "OUTRO_OPEN_FLOOR",
];
const VALID_KITCHEN_DETAILS: readonly KitchenDetailId[] = [
  "NONE",
  "DINNER_STEAK",
  "FORK_SCRAPE_WAVE",
];
const VALID_LIVING_ROOM_DETAILS: readonly LivingRoomDetailId[] = [
  "NONE",
  "DOG_REST",
  "DOG_YAWN",
  "DAD_PET_DOG",
  "DOG_WAG",
];
const VALID_HOST_HIGHLIGHTS: readonly HostBoardHighlightId[] = [
  "NONE",
  "LEFT",
  "CENTER",
  "RIGHT",
  "YAWN_TAG",
  "OXYGEN_MYTH",
  "TWO_TYPES",
  "LAUGH_YAWN",
  "NOT_COLD",
  "BRAKE",
  "CRINGE_IMAGINE",
  "EAR_AMPLIFIER",
  "BRAIN_ALARM",
  "MUSIC_TRICK",
  "WHY_IMMUNE",
  "CRINGE_TIPS",
  "SUMMARY",
];

function sanitizeClassroomDetailId(raw: unknown): ClassroomDetailId | undefined {
  if (typeof raw !== "string") return undefined;
  const norm = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return (VALID_CLASSROOM_DETAILS as readonly string[]).includes(norm)
    ? (norm as ClassroomDetailId)
    : undefined;
}

function sanitizeKitchenDetailId(raw: unknown): KitchenDetailId | undefined {
  if (typeof raw !== "string") return undefined;
  const norm = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return (VALID_KITCHEN_DETAILS as readonly string[]).includes(norm)
    ? (norm as KitchenDetailId)
    : undefined;
}

function sanitizeLivingRoomDetailId(raw: unknown): LivingRoomDetailId | undefined {
  if (typeof raw !== "string") return undefined;
  const norm = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return (VALID_LIVING_ROOM_DETAILS as readonly string[]).includes(norm)
    ? (norm as LivingRoomDetailId)
    : undefined;
}

function sanitizeHostBoardHighlightId(raw: unknown): HostBoardHighlightId | undefined {
  if (typeof raw !== "string") return undefined;
  const norm = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return (VALID_HOST_HIGHLIGHTS as readonly string[]).includes(norm)
    ? (norm as HostBoardHighlightId)
    : undefined;
}

/**
 * Chuẩn hóa, tự sửa enum sai lệch và làm sạch tuyệt đối kịch bản JSON từ AI thành AutoEpisodeSpec hợp lệ 100%.
 */
export function sanitizeAndValidateEpisode(rawJson: unknown, fallbackTopic = "Chuyện Khoa Học Đời Sống"): AutoEpisodeSpec {
  const root: any = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
  if (!root || typeof root !== "object") {
    throw new Error("Episode JSON không hợp lệ (không phải object).");
  }

  const rawTitle = typeof root.title === "string" && root.title.trim() ? root.title.trim() : fallbackTopic;
  const rawSlug = typeof root.slug === "string" && root.slug.trim() ? slugifyVietnamese(root.slug) : slugifyVietnamese(rawTitle);
  const episodeLabBoard = sanitizeLabBoardId(root.labBoard);
  const rawBeats: any[] = Array.isArray(root.beats) ? root.beats : [];
  if (rawBeats.length === 0) {
    throw new Error("Episode JSON phải chứa ít nhất 1 beat trong mảng beats[].");
  }

  const sanitizedBeats: AutoEpisodeBeat[] = rawBeats.map((rb, idx) => {
    const id = typeof rb?.id === "string" && rb.id.trim() ? rb.id.trim() : `beat_${String(idx + 1).padStart(2, "0")}`;
    const text = String(rb?.text ?? rb?.narrationText ?? "").trim() || `Phân cảnh số ${idx + 1}.`;
    const ttsText = String(rb?.ttsText ?? text).trim() || text;
    const actTitle = typeof rb?.actTitle === "string" && rb.actTitle.trim() ? rb.actTitle.trim().slice(0, 64) : undefined;
    const explicitlyBlankBanner =
      typeof rb?.chapterBanner === "string" && rb.chapterBanner.trim() === "";
    const rawChapterBanner =
      typeof rb?.chapterBanner === "string" && rb.chapterBanner.trim()
        ? rb.chapterBanner.trim().slice(0, 64)
        : undefined;
    const rawHeaderTitle =
      typeof rb?.headerTitle === "string" && rb.headerTitle.trim()
        ? rb.headerTitle.trim().slice(0, 64)
        : undefined;
    // V20.0–V20.1: Đồng bộ chapterBanner <-> headerTitle; cho phép bỏ trống hoàn toàn (không sinh banner mặc định)
    const chapterBanner = explicitlyBlankBanner ? undefined : rawChapterBanner ?? rawHeaderTitle;
    const headerTitle = explicitlyBlankBanner ? undefined : rawHeaderTitle ?? rawChapterBanner;

    const stageType = matchEnum(rb?.stageType, VALID_STAGE_TYPES, "SIMPLE_GRASS_FIELD", STAGE_ALIASES);
    const labBoard = sanitizeLabBoardId(rb?.labBoard) ?? (stageType === "SCIENCE_LAB_ROOM" ? episodeLabBoard : undefined);
    const yardDetail = sanitizeYardDetailId(rb?.yardDetail);
    const classroomDetail = sanitizeClassroomDetailId(rb?.classroomDetail);
    const kitchenDetail = sanitizeKitchenDetailId(rb?.kitchenDetail);
    const livingRoomDetail = sanitizeLivingRoomDetailId(rb?.livingRoomDetail);
    const overlayMode =
      normalizeUpperKey(rb?.overlayMode) === "HOST_EXPLAIN" || stageType === "HOST_EXPLAIN_OVERLAY"
        ? ("HOST_EXPLAIN" as const)
        : undefined;
    const freezeStage =
      typeof rb?.freezeStage === "string" && rb.freezeStage.trim()
        ? matchEnum(rb.freezeStage, VALID_STAGE_TYPES, "SCHOOL_CLASSROOM", STAGE_ALIASES)
        : undefined;
    const freezeFrame =
      rb?.freezeFrame !== undefined && rb?.freezeFrame !== null && Number.isFinite(Number(rb.freezeFrame))
        ? Math.max(0, Math.round(Number(rb.freezeFrame)))
        : undefined;
    const hostBoardHighlight = sanitizeHostBoardHighlightId(rb?.hostBoardHighlight);
    const flashback = rb?.flashback === true ? true : undefined;
    const timeOfDay = matchEnum(rb?.timeOfDay, VALID_TIME_OF_DAY, "DAY");
    const weather = matchEnum(rb?.weather, VALID_WEATHER, "CLEAR");
    const defaultTransition: AutoTransitionIn = idx === 0 ? "CUT" : "CROSSFADE";
    const transitionIn = matchEnum(rb?.transitionIn, VALID_TRANSITION_IN, defaultTransition);
    const transitionFrames =
      transitionIn === "CUT" ? 0 : Math.round(clampNum(rb?.transitionFrames, 0, 60, 30));
    const pauseAfterSec = Number(clampNum(rb?.pauseAfterSec, 0.1, 1.5, 0.4).toFixed(2));
    const defaultMood: AutoBgmMood =
      idx >= Math.floor(rawBeats.length * 0.75)
        ? "BGM_WARM_OUTRO"
        : idx >= Math.floor(rawBeats.length * 0.5)
        ? "BGM_TENSE_PULSE"
        : "BGM_STORY_CALM";
    const bgmMood = matchEnum(rb?.bgmMood, VALID_BGM_MOOD, defaultMood);
    const voiceTone = rb?.voiceTone
      ? matchEnum(rb.voiceTone, VALID_VOICE_TONE, "CALM_STORY")
      : bgmMood === "BGM_TENSE_PULSE"
      ? "TENSE_CLIMAX"
      : idx === 0
      ? "HOOK_INTRIGUE"
      : bgmMood === "BGM_WARM_OUTRO"
      ? "SLOW_EMOTIONAL"
      : "CALM_STORY";

    // V18.3: Hỗ trợ tối đa 3 nhân vật cùng lúc trên sân khấu (vd: hai ông cháu đi gặp bác sĩ)
    const rawActors = Array.isArray(rb?.actors) ? rb.actors.slice(0, 3) : [];
    const actors = rawActors.map((a: any, aIdx: number) => sanitizeActor(a, aIdx, rawActors.length));

    // V17.2: Ưu tiên visualProp chuẩn 16 mẫu vector 60fps; nếu JSON cũ có customProps.label thì tự ánh xạ sang visualProp và BỎ hẳn svgInner thô
    let visualProp: AutoPropId = matchEnum(rb?.visualProp, VALID_AUTO_PROP_IDS, "NONE", VISUAL_PROP_ALIASES);
    if (visualProp === "NONE" && Array.isArray(rb?.customProps) && rb.customProps.length > 0) {
      const legacyLabel = String(rb.customProps[0]?.label || "");
      visualProp = inferVisualPropFromLegacyLabel(legacyLabel);
    }

    let callout: AutoCalloutSpec | undefined;
    if (rb?.callout && typeof rb.callout === "object" && typeof rb.callout.text === "string" && rb.callout.text.trim()) {
      callout = {
        text: rb.callout.text.trim().slice(0, 56),
        x: rb.callout.x !== undefined ? Math.round(clampNum(rb.callout.x, 180, 1740, 960)) : undefined,
        y: rb.callout.y !== undefined ? Math.round(clampNum(rb.callout.y, 130, 760, 230)) : undefined,
      };
    }

    const customVisual =
      typeof rb?.customVisual === "string" && rb.customVisual.trim()
        ? rb.customVisual.trim().slice(0, 80)
        : undefined;
    const visualStep =
      rb?.visualStep !== undefined &&
      rb?.visualStep !== null &&
      typeof rb?.visualStep !== "boolean" &&
      String(rb.visualStep).trim() !== "" &&
      Number.isFinite(Number(rb.visualStep))
        ? Math.max(0, Math.round(Number(rb.visualStep)))
        : undefined;
    const fullScreenVisual =
      typeof rb?.fullScreenVisual === "boolean" ? rb.fullScreenVisual : undefined;

    const camera = sanitizeCamera(rb?.camera);

    return {
      id,
      ...(actTitle ? { actTitle } : {}),
      ...(headerTitle ? { headerTitle } : {}),
      ...(chapterBanner ? { chapterBanner } : {}),
      text,
      ttsText,
      stageType,
      ...(labBoard ? { labBoard } : {}),
      ...(yardDetail ? { yardDetail } : {}),
      ...(classroomDetail && classroomDetail !== "NONE" ? { classroomDetail } : {}),
      ...(kitchenDetail && kitchenDetail !== "NONE" ? { kitchenDetail } : {}),
      ...(livingRoomDetail && livingRoomDetail !== "NONE" ? { livingRoomDetail } : {}),
      ...(overlayMode ? { overlayMode } : {}),
      ...(freezeStage ? { freezeStage } : {}),
      ...(freezeFrame !== undefined ? { freezeFrame } : {}),
      ...(hostBoardHighlight && hostBoardHighlight !== "NONE" ? { hostBoardHighlight } : {}),
      ...(flashback ? { flashback: true } : {}),
      timeOfDay,
      weather,
      transitionIn,
      transitionFrames,
      pauseAfterSec,
      bgmMood,
      voiceTone,
      visualProp,
      ...(customVisual ? { customVisual } : {}),
      ...(visualStep !== undefined ? { visualStep } : {}),
      ...(fullScreenVisual !== undefined ? { fullScreenVisual } : {}),
      ...(camera ? { camera } : {}),
      actors,
      customProps: [], // V17.2: Khóa rỗng mảng customProps SVG thô của AI để không bao giờ xuất hiện hình vuông/tròn lỗi
      ...(callout ? { callout } : {}),
    };
  });

  return {
    title: rawTitle,
    slug: rawSlug,
    ...(typeof root.topic === "string" && root.topic.trim() ? { topic: root.topic.trim() } : { topic: fallbackTopic }),
    ...(episodeLabBoard ? { labBoard: episodeLabBoard } : {}),
    beats: sanitizedBeats,
  };
}
