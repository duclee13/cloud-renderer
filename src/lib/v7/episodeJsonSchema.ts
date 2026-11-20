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
  | "SCIENCE_LAB_ROOM"
  | "DOCTOR_CLINIC"
  | "WATER_POND_OCEAN"
  | "UNDERGROUND_EARTH_CUTAWAY"
  | "SPACE_COSMOS"
  | "EXPLAINER_POLKA_DOT";

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

export type AutoActorPreset = "BOY" | "GRANDPA" | "GRANDMA" | "DOCTOR" | "NEIGHBOR";
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
  | "IDLE_TALK";

export type AutoActorExpression =
  | "HAPPY"
  | "CURIOUS"
  | "SHOCKED"
  | "SCARED"
  | "TIRED"
  | "PROUD"
  | "ANGRY"
  | "THINKING";

export type AutoHandProp =
  | "NONE"
  | "STICK"
  | "MAGNIFYING_GLASS"
  | "BUCKET"
  | "NOTEBOOK"
  | "PHONE"
  | "FLASHLIGHT"
  | "CUP_SODA"
  | "NET";

export type AutoPropAnimation = "FLOAT" | "PULSE" | "BOUNCE" | "SPIN" | "SHAKE" | "NONE";

export interface AutoActorSpec {
  preset: AutoActorPreset;
  slot: AutoActorSlot;
  facing: AutoActorFacing;
  motion: AutoActorMotion;
  expression: AutoActorExpression;
  handProp?: AutoHandProp;
  bubble?: string;
  shiver?: boolean;
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
  text: string;
  ttsText: string;
  stageType: AutoStageType;
  timeOfDay: AutoTimeOfDay;
  weather: AutoWeather;
  transitionIn: AutoTransitionIn;
  transitionFrames: number;
  pauseAfterSec: number;
  bgmMood: AutoBgmMood;
  voiceTone?: AutoVoiceTone;
  actors: AutoActorSpec[];
  customProps: AutoCustomPropSpec[];
  callout?: AutoCalloutSpec;
}

export interface AutoEpisodeSpec {
  title: string;
  slug: string;
  topic?: string;
  beats: AutoEpisodeBeat[];
}

export const VALID_STAGE_TYPES: readonly AutoStageType[] = [
  "COUNTRYSIDE_YARD",
  "SIMPLE_GRASS_FIELD",
  "BEDROOM_INDOOR",
  "CITY_STREET",
  "SCIENCE_LAB_ROOM",
  "DOCTOR_CLINIC",
  "WATER_POND_OCEAN",
  "UNDERGROUND_EARTH_CUTAWAY",
  "SPACE_COSMOS",
  "EXPLAINER_POLKA_DOT",
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
export const VALID_ACTOR_PRESETS: readonly AutoActorPreset[] = ["BOY", "GRANDPA", "GRANDMA", "DOCTOR", "NEIGHBOR"];
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
  "IDLE_TALK",
];
export const VALID_ACTOR_EXPRESSIONS: readonly AutoActorExpression[] = [
  "HAPPY",
  "CURIOUS",
  "SHOCKED",
  "SCARED",
  "TIRED",
  "PROUD",
  "ANGRY",
  "THINKING",
];
export const VALID_HAND_PROPS: readonly AutoHandProp[] = [
  "NONE",
  "STICK",
  "MAGNIFYING_GLASS",
  "BUCKET",
  "NOTEBOOK",
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
  IDLE: "IDLE_TALK",
  TALK: "IDLE_TALK",
  STAND: "IDLE_TALK",
};

const EXPRESSION_ALIASES: Record<string, AutoActorExpression> = {
  SMILE: "HAPPY",
  JOY: "HAPPY",
  EXCITED: "HAPPY",
  INQUISITIVE: "CURIOUS",
  WONDER: "CURIOUS",
  SURPRISED: "SHOCKED",
  AMAZED: "SHOCKED",
  WORRIED: "SCARED",
  AFRAID: "SCARED",
  FEAR: "SCARED",
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
  BOOK: "NOTEBOOK",
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
  /^đang\s+/i,
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
 * V17.2: Lọc bỏ bóng thoại sáo rỗng / mô tả hành động / quá dài (> 5 từ) để chỉ giữ lời thốt đời thường ngắn gọn.
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
  if (words.length > 5) return undefined;

  for (const pattern of ROBOTIC_BUBBLE_PATTERNS) {
    if (pattern.test(cleaned)) return undefined;
  }

  return cleaned.slice(0, 48);
}

function sanitizeActor(raw: any, index: number): AutoActorSpec {
  const preset = matchEnum(raw?.preset, VALID_ACTOR_PRESETS, "BOY", PRESET_ALIASES);
  const defaultSlot: AutoActorSlot = index === 0 ? "LEFT" : "RIGHT";
  const slot = matchEnum(raw?.slot, VALID_ACTOR_SLOTS, defaultSlot);
  const defaultFacing: AutoActorFacing = slot === "RIGHT" ? "LEFT" : "RIGHT";
  const facing = matchEnum(raw?.facing, VALID_ACTOR_FACING, defaultFacing);
  const motion = matchEnum(raw?.motion, VALID_ACTOR_MOTIONS, "IDLE_TALK", MOTION_ALIASES);
  const expression = matchEnum(raw?.expression, VALID_ACTOR_EXPRESSIONS, "HAPPY", EXPRESSION_ALIASES);
  const handProp = matchEnum(raw?.handProp, VALID_HAND_PROPS, "NONE", HAND_PROP_ALIASES);
  const bubbleClean = sanitizeSpeechBubble(raw?.bubble);
  const shiver = Boolean(raw?.shiver);

  return {
    preset,
    slot,
    facing,
    motion,
    expression,
    ...(handProp !== "NONE" ? { handProp } : { handProp: "NONE" }),
    ...(bubbleClean ? { bubble: bubbleClean } : {}),
    ...(shiver ? { shiver: true } : {}),
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
  const rawBeats: any[] = Array.isArray(root.beats) ? root.beats : [];
  if (rawBeats.length === 0) {
    throw new Error("Episode JSON phải chứa ít nhất 1 beat trong mảng beats[].");
  }

  const sanitizedBeats: AutoEpisodeBeat[] = rawBeats.map((rb, idx) => {
    const id = typeof rb?.id === "string" && rb.id.trim() ? rb.id.trim() : `beat_${String(idx + 1).padStart(2, "0")}`;
    const text = String(rb?.text ?? rb?.narrationText ?? "").trim() || `Phân cảnh số ${idx + 1}.`;
    const ttsText = String(rb?.ttsText ?? text).trim() || text;
    const actTitle = typeof rb?.actTitle === "string" && rb.actTitle.trim() ? rb.actTitle.trim().slice(0, 64) : undefined;
    const headerTitle =
      typeof rb?.headerTitle === "string" && rb.headerTitle.trim()
        ? rb.headerTitle.trim().slice(0, 56)
        : undefined;

    const stageType = matchEnum(rb?.stageType, VALID_STAGE_TYPES, "SIMPLE_GRASS_FIELD", STAGE_ALIASES);
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

    const rawActors = Array.isArray(rb?.actors) ? rb.actors.slice(0, 2) : [];
    const actors = rawActors.map((a: any, aIdx: number) => sanitizeActor(a, aIdx));

    const rawProps = Array.isArray(rb?.customProps) ? rb.customProps.slice(0, 2) : [];
    const customProps = rawProps
      .map((p: any) => sanitizeCustomProp(p))
      .filter((p: AutoCustomPropSpec | null): p is AutoCustomPropSpec => Boolean(p));

    let callout: AutoCalloutSpec | undefined;
    if (rb?.callout && typeof rb.callout === "object" && typeof rb.callout.text === "string" && rb.callout.text.trim()) {
      callout = {
        text: rb.callout.text.trim().slice(0, 38),
        x: rb.callout.x !== undefined ? Math.round(clampNum(rb.callout.x, 180, 1740, 960)) : undefined,
        y: rb.callout.y !== undefined ? Math.round(clampNum(rb.callout.y, 130, 760, 230)) : undefined,
      };
    }

    return {
      id,
      ...(actTitle ? { actTitle } : {}),
      ...(headerTitle ? { headerTitle } : {}),
      text,
      ttsText,
      stageType,
      timeOfDay,
      weather,
      transitionIn,
      transitionFrames,
      pauseAfterSec,
      bgmMood,
      voiceTone,
      actors,
      customProps,
      ...(callout ? { callout } : {}),
    };
  });

  return {
    title: rawTitle,
    slug: rawSlug,
    ...(typeof root.topic === "string" && root.topic.trim() ? { topic: root.topic.trim() } : { topic: fallbackTopic }),
    beats: sanitizedBeats,
  };
}
