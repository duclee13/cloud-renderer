/**
 * UNIVERSAL 2D STORYTIME ENGINE STANDARD V10.3
 * Module quy chuẩn toàn cục cho mọi kịch bản, mọi phân cảnh (beat), mọi nhân vật và thẻ Infographic:
 * 1. Hệ thống Điểm Neo Giải Phẫu Tự Động (SocketKey & RigSockets)
 * 2. Máy Trạng Thái Biến Thái Sinh Học & Biểu Cảm Liên Tục (VitalityPreset & VitalitySpec)
 * 3. Cơ Chế Mắt Saccade & Hold Fixation (computeSaccadeFixation - cấm đảo mắt hình sin)
 * 4. Đồng Bộ Động Từ Lời Thoại -> 3 Pha Hành Động Chuẩn Hóa u in [0, 1] (ActionIntent)
 * 5. Chính Sách Độ Chính Xác Thông Tin Toàn Cục V10.3 (Information Precision Policy: EXACT_QUANTITATIVE vs QUALITATIVE_STATE)
 * 6. Quy Tắc Chuyển Trạng Thái Từ Trung Tính Đối Xứng V10.3 (Neutral-to-Decision Dual Morph)
 */

import { Point2D } from "../../remotion/types/character";

export const UNIVERSAL_STAGE_CONSTANTS = {
  WIDTH: 1920,
  HEIGHT: 1080,
  FPS: 60,
  TOP_IMPACT_HEADER_Y: 82,
  SAFE_TOP_Y: 85,
  MAIN_STAGE_Y_MIN: 140,
  MAIN_STAGE_Y_MAX: 820,
  GROUND_FLOOR_Y: 800,
  LEGACY_GROUND_Y: 840,
  SUBTITLE_SAFE_Y_MIN: 885,
  SUBTITLE_SAFE_Y_MAX: 1015,
  SUBTITLE_MAX_WIDTH: 1360,
} as const;

/**
 * Mục 2.1: Hệ Thống Điểm Neo Giải Phẫu Tự Động (SocketKey & RigSockets)
 */
export type SocketKey =
  | "HEAD_TOP"
  | "HEAD_CENTER"
  | "EYES_FOCUS"
  | "MOUTH"
  | "THORAX"
  | "ABDOMEN_CENTER"
  | "PRIMARY_WEAPON"
  | "FEET_CONTACT";

export type RigSockets = Record<SocketKey, Point2D>;

/**
 * Mục 3: Máy Trạng Thái Biến Thái Sinh Học & Biểu Cảm Liên Tục (VitalityPreset)
 */
export type VitalityPreset =
  | "PEAK_VIGOR"
  | "CAUTIOUS_CONSERVE"
  | "DEPLETED_STARVING"
  | "DESPERATE_CLIMAX";

export type LegacyHungerStage =
  | "WELL_FED"
  | "HUNGRY_STALK"
  | "STARVING_XRAY"
  | "BERSERK_STRIKE";

export interface VitalitySpec {
  preset: VitalityPreset;
  vitalityRange: [number, number];
  abdomenScaleYStart: number;
  abdomenScaleYEnd: number;
  colorPrimary: string;
  colorDark: string;
  colorLight: string;
  thoraxLeanDeg: number;
  postureDropPx: number;
  tremorAmplitudePx: number;
  eyeUpperLidRatio: number;
  pupilRadiusPx: number;
  showDarkEyeCircles: boolean;
  eyebrowMode: "alert_high" | "focused_flat" | "pained_furrow" | "angry_v";
  mouthMode: "confident_smile" | "focused_line" | "exhausted_gasp" | "fierce_grit";
  antennaDroopRatio: number;
}

export const VITALITY_PRESET_SPECS: Record<VitalityPreset, VitalitySpec> = {
  PEAK_VIGOR: {
    preset: "PEAK_VIGOR",
    vitalityRange: [0.85, 1.0],
    abdomenScaleYStart: 1.05,
    abdomenScaleYEnd: 1.05,
    colorPrimary: "#58B947",
    colorDark: "#3F8F31",
    colorLight: "#86EFAC",
    thoraxLeanDeg: 0,
    postureDropPx: 0,
    tremorAmplitudePx: 0,
    eyeUpperLidRatio: 0.0,
    pupilRadiusPx: 8.5,
    showDarkEyeCircles: false,
    eyebrowMode: "alert_high",
    mouthMode: "confident_smile",
    antennaDroopRatio: 0.0,
  },
  CAUTIOUS_CONSERVE: {
    preset: "CAUTIOUS_CONSERVE",
    vitalityRange: [0.5, 0.84],
    abdomenScaleYStart: 0.78,
    abdomenScaleYEnd: 0.78,
    colorPrimary: "#4D9E3F",
    colorDark: "#36752B",
    colorLight: "#6EE7B7",
    thoraxLeanDeg: 12,
    postureDropPx: 10,
    tremorAmplitudePx: 0,
    eyeUpperLidRatio: 0.35,
    pupilRadiusPx: 8.2,
    showDarkEyeCircles: false,
    eyebrowMode: "focused_flat",
    mouthMode: "focused_line",
    antennaDroopRatio: 0.2,
  },
  DEPLETED_STARVING: {
    preset: "DEPLETED_STARVING",
    vitalityRange: [0.15, 0.49],
    abdomenScaleYStart: 0.65,
    abdomenScaleYEnd: 0.46,
    colorPrimary: "#7A9A38",
    colorDark: "#5A7327",
    colorLight: "#A3C258",
    thoraxLeanDeg: 16,
    postureDropPx: 15,
    tremorAmplitudePx: 1.2,
    eyeUpperLidRatio: 0.42,
    pupilRadiusPx: 7.5,
    showDarkEyeCircles: true,
    eyebrowMode: "pained_furrow",
    mouthMode: "exhausted_gasp",
    antennaDroopRatio: 1.0,
  },
  DESPERATE_CLIMAX: {
    preset: "DESPERATE_CLIMAX",
    vitalityRange: [0.2, 0.6],
    abdomenScaleYStart: 0.5,
    abdomenScaleYEnd: 0.5,
    colorPrimary: "#4D9E3F",
    colorDark: "#347429",
    colorLight: "#76D364",
    thoraxLeanDeg: 8,
    postureDropPx: 6,
    tremorAmplitudePx: 0,
    eyeUpperLidRatio: 0.15,
    pupilRadiusPx: 6.2,
    showDarkEyeCircles: false,
    eyebrowMode: "angry_v",
    mouthMode: "fierce_grit",
    antennaDroopRatio: 0.1,
  },
};

/**
 * Mục 4: Nhãn Hành Động 3 Pha Đồng Bộ Động Từ Lời Thoại (ActionIntent)
 */
export type ActionIntent =
  | "OBSERVE_ROTATE_180"
  | "STEP_AND_FREEZE"
  | "INTERNAL_XRAY_BURN"
  | "STRIKE_AND_CAPTURE"
  | "DEFAULT_MICRO_LIFE";

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/**
 * Chuyển đổi tự động từ VitalityPreset, hungerStage hoặc ngữ cảnh câu thoại sang VitalityPreset chuẩn V10
 */
export function resolveVitalityPreset(params: {
  vitalityPreset?: VitalityPreset;
  hungerStage?: LegacyHungerStage | string;
  microPoseVariant?: string;
  showXrayAbdomen?: boolean;
  narrationText?: string;
}): VitalityPreset {
  if (params.vitalityPreset && VITALITY_PRESET_SPECS[params.vitalityPreset]) {
    return params.vitalityPreset;
  }
  if (params.hungerStage === "WELL_FED") return "PEAK_VIGOR";
  if (params.hungerStage === "HUNGRY_STALK") return "CAUTIOUS_CONSERVE";
  if (params.hungerStage === "STARVING_XRAY" || params.showXrayAbdomen) return "DEPLETED_STARVING";
  if (params.hungerStage === "BERSERK_STRIKE") return "DESPERATE_CLIMAX";

  const txt = (params.narrationText || "").toLowerCase();
  if (txt.includes("tự đốt") || txt.includes("thể mỡ") || txt.includes("kiệt sức")) {
    return "DEPLETED_STARVING";
  }
  if (txt.includes("chộp") || txt.includes("tung đòn") || txt.includes("một phần mười giây")) {
    return "DESPERATE_CLIMAX";
  }
  if (txt.includes("bất động") || txt.includes("tiết kiệm") || txt.includes("một bước")) {
    return "CAUTIOUS_CONSERVE";
  }
  if (params.microPoseVariant === "hungry_clutch" || params.microPoseVariant === "exhausted_slump") {
    return "DEPLETED_STARVING";
  }
  if (params.microPoseVariant === "strike_grab") {
    return "DESPERATE_CLIMAX";
  }
  if (params.microPoseVariant === "stalk_slow") {
    return "CAUTIOUS_CONSERVE";
  }
  return "PEAK_VIGOR";
}

/**
 * Tự động suy luận Nhãn Hành Động 3 Pha (ActionIntent) từ động từ trong câu thoại hoặc variant
 */
export function resolveActionIntent(params: {
  actionIntent?: ActionIntent;
  vitalityPreset?: VitalityPreset;
  hungerStage?: LegacyHungerStage | string;
  microPoseVariant?: string;
  showXrayAbdomen?: boolean;
  narrationText?: string;
}): ActionIntent {
  if (params.actionIntent) return params.actionIntent;

  const txt = (params.narrationText || "").toLowerCase();
  if (
    params.showXrayAbdomen ||
    params.hungerStage === "STARVING_XRAY" ||
    txt.includes("tự đốt") ||
    txt.includes("thể mỡ")
  ) {
    return "INTERNAL_XRAY_BURN";
  }
  if (
    params.hungerStage === "BERSERK_STRIKE" ||
    params.microPoseVariant === "strike_grab" ||
    txt.includes("chộp") ||
    txt.includes("tung đòn")
  ) {
    return "STRIKE_AND_CAPTURE";
  }
  if (
    params.hungerStage === "HUNGRY_STALK" ||
    params.microPoseVariant === "stalk_slow" ||
    txt.includes("một bước") ||
    txt.includes("đứng bất động")
  ) {
    return "STEP_AND_FREEZE";
  }
  if (
    params.hungerStage === "WELL_FED" ||
    params.microPoseVariant === "alert_scan" ||
    txt.includes("xoay") ||
    txt.includes("một trăm tám mươi độ") ||
    txt.includes("sục sạo")
  ) {
    return "OBSERVE_ROTATE_180";
  }
  return "DEFAULT_MICRO_LIFE";
}

/**
 * Mục 3.1: Cơ Chế Mắt Saccade & Hold Fixation (Cấm Đảo Mắt Hình Sin Liên Tục)
 * - Khóa điểm nhìn cố định (Fixation Hold) trong 50–68 frames (0.83s–1.13s)
 * - Liếc cực nhanh (Saccade Jump) sang điểm nhìn mới chỉ trong 6 frames (0.1s)
 */
export function computeSaccadeFixation(
  frame: number,
  seed: number = 0
): { x: number; y: number; headMicroDeg: number; isSaccadeJump: boolean } {
  const targets = [
    { x: 5.5, y: -1.0, deg: 1.5 },
    { x: 1.2, y: 2.2, deg: -1.8 },
    { x: 6.2, y: 0.8, deg: 2.2 },
    { x: 2.5, y: -2.0, deg: -1.0 },
  ];
  const holdDuration = 58; // 58 frames (~0.97s) giữ cố định
  const jumpDuration = 6;  // 6 frames (0.10s) liếc nhanh
  const stepPeriod = holdDuration + jumpDuration; // 64 frames / điểm nhìn
  const shiftedFrame = Math.max(0, Math.floor(frame + seed * 17));
  const stepIdx = Math.floor(shiftedFrame / stepPeriod);
  const frameInStep = shiftedFrame % stepPeriod;

  const currTarget = targets[stepIdx % targets.length];
  const nextTarget = targets[(stepIdx + 1) % targets.length];

  if (frameInStep < holdDuration) {
    return {
      x: currTarget.x,
      y: currTarget.y,
      headMicroDeg: currTarget.deg,
      isSaccadeJump: false,
    };
  }

  const jumpT = smoothstep(0, jumpDuration, frameInStep - holdDuration);
  return {
    x: lerpNum(currTarget.x, nextTarget.x, jumpT),
    y: lerpNum(currTarget.y, nextTarget.y, jumpT),
    headMicroDeg: lerpNum(currTarget.deg, nextTarget.deg, jumpT),
    isSaccadeJump: true,
  };
}

/**
 * Chuyển đổi calloutTarget / calloutText sang SocketKey chuẩn Mục 2.1
 */
export function resolveTargetSocketKey(
  calloutTarget?: "head" | "hand" | "torso" | "foot" | "abdomen" | SocketKey,
  calloutText?: string
): SocketKey {
  if (
    calloutTarget === "HEAD_TOP" ||
    calloutTarget === "HEAD_CENTER" ||
    calloutTarget === "EYES_FOCUS" ||
    calloutTarget === "MOUTH" ||
    calloutTarget === "THORAX" ||
    calloutTarget === "ABDOMEN_CENTER" ||
    calloutTarget === "PRIMARY_WEAPON" ||
    calloutTarget === "FEET_CONTACT"
  ) {
    return calloutTarget;
  }

  const txt = (calloutText || "").toLowerCase();
  if (calloutTarget === "abdomen" || txt.includes("thể mỡ") || txt.includes("cơ bắp") || txt.includes("bụng")) {
    return "ABDOMEN_CENTER";
  }
  if (calloutTarget === "hand" || txt.includes("càng") || txt.includes("vũ khí") || txt.includes("0.1 giây")) {
    return "PRIMARY_WEAPON";
  }
  if (calloutTarget === "torso" || txt.includes("bất động") || txt.includes("trọng tâm") || txt.includes("ngực")) {
    return "THORAX";
  }
  if (calloutTarget === "foot" || txt.includes("chân") || txt.includes("bước")) {
    return "FEET_CONTACT";
  }
  return "HEAD_CENTER";
}

/**
 * Tính toán Bảng Tọa Độ Thực Tế 8 Điểm Neo Giải Phẫu (RigSockets) của Bọ Ngựa 2D (MantisRig)
 * sau khi đã áp dụng đầy đủ phép dịch bước đi, hạ trọng tâm, xoay đầu và phóng/thu càng.
 */
export function computeMantisRigSockets(params: {
  x: number;
  y: number;
  facing: "left" | "right";
  u: number;
  localFrame: number;
  durationFrames?: number;
  vitalityPreset: VitalityPreset;
  actionIntent: ActionIntent;
}): RigSockets {
  const { x, y, facing, u, localFrame, durationFrames = 360, vitalityPreset, actionIntent } = params;
  const dir = facing === "right" ? 1 : -1;
  const spec = VITALITY_PRESET_SPECS[vitalityPreset];

  // 1. Dịch chuyển ngang theo Pha Bước Đi (0% -> 38% thời lượng cảnh cho STEP_AND_FREEZE)
  let walkOffsetX = 0;
  let freezeCrouchDrop = 0;
  if (actionIntent === "STEP_AND_FREEZE") {
    if (u <= 0.38) {
      const s1 = smoothstep(0.03, 0.19, u);
      const s2 = smoothstep(0.21, 0.37, u);
      walkOffsetX = -76 + 38 * s1 + 38 * s2;
    } else {
      walkOffsetX = 0;
      freezeCrouchDrop = smoothstep(0.38, 0.43, u) * 8;
    }
  }

  const postureDrop = spec.postureDropPx + freezeCrouchDrop;
  const rootWorldX = x + dir * walkOffsetX;

  // 2. Xoay đầu 180° theo 3 pha chuẩn Mục 4.1 (0-20%, 20-55%, 55-90%)
  let headYaw = 0;
  let headRotateDeg = vitalityPreset === "DEPLETED_STARVING" ? 10 : 3;
  if (actionIntent === "OBSERVE_ROTATE_180") {
    if (u >= 0.20 && u < 0.55) {
      headYaw = -smoothstep(0.20, 0.30, u);
    } else if (u >= 0.55 && u <= 0.92) {
      const sweepRight = smoothstep(0.55, 0.68, u);
      const returnCenter = u > 0.85 ? smoothstep(0.85, 0.94, u) : 0;
      headYaw = lerpNum(-1, 1, sweepRight) * (1 - returnCenter);
    }
    headRotateDeg = headYaw * 25;
  }

  const thoraxShiftX = spec.thoraxLeanDeg * 1.15;
  const thoraxDropY = spec.thoraxLeanDeg * 0.85;
  const neckLocalX = 65 + thoraxShiftX;
  const neckLocalY = -265 + postureDrop + thoraxDropY;
  const shoulderLocalX = 58 + thoraxShiftX * 0.88;
  const shoulderLocalY = -244 + postureDrop + thoraxDropY * 0.88;
  const headShiftLocalX = headYaw * 14;

  // 3. Vị trí khớp càng trước (PRIMARY_WEAPON) theo trạng thái phóng 0.1s hoặc thu chữ Z kẹp mồi
  let strikeExtend = 0;
  let holdingPrey = 0;
  if (actionIntent === "STRIKE_AND_CAPTURE") {
    const strikeStartF = Math.max(30, Math.floor(0.30 * durationFrames));
    if (localFrame >= strikeStartF - 4 && localFrame <= strikeStartF) {
      strikeExtend = smoothstep(strikeStartF - 4, strikeStartF, localFrame);
      headRotateDeg = 4;
    } else if (localFrame > strikeStartF && localFrame <= strikeStartF + 4) {
      strikeExtend = 1.0;
      headRotateDeg = 10;
    } else if (localFrame > strikeStartF + 4) {
      const retractP = smoothstep(strikeStartF + 4, strikeStartF + 16, localFrame);
      strikeExtend = 1.0 - retractP * 0.84;
      holdingPrey = retractP;
      headRotateDeg = lerpNum(10, 18, retractP);
    }
  }

  // Tọa độ động chính xác của tâm đầu sau khi xoay góc headRotateDeg quanh cổ (neckLocalX + headShiftLocalX, neckLocalY)
  const headRad = (headRotateDeg * Math.PI) / 180;
  const headCenterLocalX = neckLocalX + headShiftLocalX + 34 * Math.sin(headRad);
  const headCenterLocalY = neckLocalY - 34 * Math.cos(headRad);

  // V10.1: PRIMARY_WEAPON bám mặt trên của đùi càng trước (forelegX, forelegY - 18) để không đè lên con ruồi đang kẹp
  const weaponLocalX = lerpNum(shoulderLocalX + 68, shoulderLocalX + 158, strikeExtend) - holdingPrey * 12;
  const weaponLocalY = lerpNum(shoulderLocalY + 18, shoulderLocalY + 10, strikeExtend) - holdingPrey * 18;

  // V10.1: ABDOMEN_CENTER ở cảnh X-Ray trỏ vào mép trái khoang bụng X-Ray (abdomenX - 35, abdomenY + 8) tránh khớp gối chữ Λ
  const isXrayBurn = actionIntent === "INTERNAL_XRAY_BURN" || vitalityPreset === "DEPLETED_STARVING";
  const abdomenLocalX = isXrayBurn ? -196 : -138;
  const abdomenLocalY = isXrayBurn ? -134 + postureDrop * 0.6 : -154 + postureDrop * 0.5;

  return {
    HEAD_TOP: {
      x: rootWorldX + dir * (headCenterLocalX + 26 * Math.sin(headRad)),
      y: y + headCenterLocalY - 38 * Math.cos(headRad),
    },
    HEAD_CENTER: {
      // Mép ngoài phía trên-trái của đầu/mắt sau xoay (kết hợp Arrow Stand-Off 24px đảm bảo không bao giờ đâm vào con mắt)
      x: rootWorldX + dir * (headCenterLocalX - 18),
      y: y + headCenterLocalY - 6,
    },
    EYES_FOCUS: {
      x: rootWorldX + dir * (headCenterLocalX + 36),
      y: y + headCenterLocalY,
    },
    MOUTH: {
      x: rootWorldX + dir * (neckLocalX + headShiftLocalX + 8),
      y: y + neckLocalY + 6,
    },
    THORAX: {
      x: rootWorldX + dir * (neckLocalX * 0.52),
      y: y - 182 + postureDrop * 0.7,
    },
    ABDOMEN_CENTER: {
      x: rootWorldX + dir * abdomenLocalX,
      y: y + abdomenLocalY,
    },
    PRIMARY_WEAPON: {
      x: rootWorldX + dir * weaponLocalX,
      y: y + weaponLocalY,
    },
    FEET_CONTACT: {
      x: rootWorldX - dir * 35,
      y: y,
    },
  };
}

/**
 * V10.1: Tính tọa độ thế giới (World Space) hiện tại của Con Mồi (Ruồi) ở cảnh STRIKE_AND_CAPTURE
 * để đặt ngôi sao nổ CHỘP! tại đúng vị trí phía trên bên phải con mồi (preyX + 55, preyY - 45)
 */
export function computeMantisPreyWorldPos(params: {
  x: number;
  y: number;
  facing: "left" | "right";
  localFrame: number;
  durationFrames?: number;
}): Point2D {
  const { x, y, facing, localFrame, durationFrames = 360 } = params;
  const dir = facing === "right" ? 1 : -1;
  const strikeFrame = Math.max(30, Math.floor(0.30 * durationFrames));

  let preyLocalX = 225;
  let preyLocalY = -210;
  if (localFrame < strikeFrame) {
    const flyP = clamp01(localFrame / strikeFrame);
    preyLocalX = lerpNum(540, 225, flyP);
    preyLocalY = lerpNum(-330, -210, flyP) + Math.sin(localFrame * 0.25) * 18 * (1 - flyP * 0.5);
  } else if (localFrame <= strikeFrame + 4) {
    preyLocalX = 225;
    preyLocalY = -210;
  } else {
    const retractP = smoothstep(strikeFrame + 4, strikeFrame + 16, localFrame);
    preyLocalX = lerpNum(225, 134, retractP);
    preyLocalY = lerpNum(-210, -214, retractP);
  }

  return {
    x: x + dir * preyLocalX,
    y: y + preyLocalY,
  };
}

/**
 * V10.1: Chiếu một điểm hoặc toàn bộ RigSockets qua phép phóng Camera Zoom + Pan của sân khấu SVG
 * để mũi tên Callout và ngôi sao CHỘP! khớp chính xác từng pixel ngay cả khi Camera Zoom 1.0x -> 1.24x
 */
export function projectPointToStageScreen(
  pt: Point2D,
  originX: number,
  originY: number,
  cameraScale: number,
  cameraPanX: number
): Point2D {
  return {
    x: originX + (pt.x - originX) * cameraScale + cameraPanX,
    y: originY + (pt.y - originY) * cameraScale,
  };
}

export function projectSocketsToStageScreen(
  sockets: RigSockets,
  originX: number,
  originY: number,
  cameraScale: number,
  cameraPanX: number
): RigSockets {
  return {
    HEAD_TOP: projectPointToStageScreen(sockets.HEAD_TOP, originX, originY, cameraScale, cameraPanX),
    HEAD_CENTER: projectPointToStageScreen(sockets.HEAD_CENTER, originX, originY, cameraScale, cameraPanX),
    EYES_FOCUS: projectPointToStageScreen(sockets.EYES_FOCUS, originX, originY, cameraScale, cameraPanX),
    MOUTH: projectPointToStageScreen(sockets.MOUTH, originX, originY, cameraScale, cameraPanX),
    THORAX: projectPointToStageScreen(sockets.THORAX, originX, originY, cameraScale, cameraPanX),
    ABDOMEN_CENTER: projectPointToStageScreen(sockets.ABDOMEN_CENTER, originX, originY, cameraScale, cameraPanX),
    PRIMARY_WEAPON: projectPointToStageScreen(sockets.PRIMARY_WEAPON, originX, originY, cameraScale, cameraPanX),
    FEET_CONTACT: projectPointToStageScreen(sockets.FEET_CONTACT, originX, originY, cameraScale, cameraPanX),
  };
}

/**
 * Tính toán Bảng Tọa Độ Thực Tế 8 Điểm Neo Giải Phẫu (RigSockets) của StickmanRig
 */
export function computeStickmanRigSockets(params: {
  x: number;
  y: number;
  facing: "left" | "right";
  customHipY?: number;
  flightLift?: number;
}): RigSockets {
  const { x, y, facing, customHipY, flightLift = 0 } = params;
  const dir = facing === "right" ? 1 : -1;
  const hipH = customHipY ? Math.abs(customHipY) : 173;
  const headCenterY = y - hipH - 135 - flightLift;

  return {
    HEAD_TOP: { x, y: headCenterY - 48 },
    HEAD_CENTER: { x: x - dir * 34, y: headCenterY - 6 },
    EYES_FOCUS: { x: x + dir * 40, y: headCenterY - 4 },
    MOUTH: { x: x + dir * 22, y: headCenterY + 26 },
    THORAX: { x: x - dir * 20, y: headCenterY + 108 },
    ABDOMEN_CENTER: { x: x - dir * 20, y: headCenterY + 148 },
    PRIMARY_WEAPON: { x: x + dir * 68, y: headCenterY + 105 },
    FEET_CONTACT: { x, y: y - flightLift },
  };
}

// =============================================================================
// MỤC 6 (V10.3): CHÍNH SÁCH ĐỘ CHÍNH XÁC THÔNG TIN TOÀN CỤC (NO FAKE METRICS)
// Information Precision Policy: EXACT_QUANTITATIVE vs. QUALITATIVE_STATE
// =============================================================================

export type MetricDisplayMode = "EXACT_QUANTITATIVE" | "QUALITATIVE_STATE";

/**
 * Quy tắc hệ thống tiêm tự động vào mọi Prompt sinh kịch bản (Gemini / LLM Director)
 * để triệt tiêu 100% lỗi tự bịa con số % trên các thẻ lựa chọn nhị phân hoặc trạng thái định tính.
 */
export const INFORMATION_PRECISION_POLICY_PROMPT_RULE = `QUY TẮC PHÂN LOẠI THÔNG TIN TOÀN CỤC V10.3 (NO FAKE METRICS - BẮT BUỘC):
Mỗi beat/thẻ Infographic phải chọn đúng metricMode:
1. "EXACT_QUANTITATIVE" (HIỆN SỐ CỤ THỂ): CHỈ dùng khi kịch bản có số liệu rõ ràng hoặc đại lượng vật lý/thời gian đo đếm được thực tế:
   - Mốc thời gian rõ ràng: Ngày 1, Tuần 1, 60 ngày, 0.1 giây (CALENDAR_FLIP_CARD, STOPWATCH_TALLY_CARD).
   - Tỷ lệ/góc độ được nhắc trực tiếp trong kịch bản: Xoay đầu 180°, giảm còn 1/5 (20%) (CANDLE_HOURGLASS_CARD, SIMPLE_CHART_CARD, hoặc GAUGE_RESERVE_CARD khi kịch bản nói rõ con số targetPercent).
2. "QUALITATIVE_STATE" (CHỈ DÙNG NHÃN TRẠNG THÁI CHỮ + BIỂU TƯỢNG — CẤM BỊA %):
   - BẮT BUỘC cho mọi thẻ lựa chọn nhị phân, cơ chế bật/tắt, so sánh khái niệm định tính (TWO_DOORS_CARD, BALANCE_SCALE_CARD, XRAY_BODY_CARD, và GAUGE_RESERVE_CARD khi lời thoại không nêu con số % cụ thể).
   - TUYỆT ĐỐI KHÔNG gắn đuôi phần trăm giả như "(100%)", "(79%)", "(9%)", "(0%)" vào nhãn trạng thái!
   - Ví dụ chuẩn cho TWO_DOORS_CARD: leftDoorSub: "ƯU TIÊN TUYỆT ĐỐI", rightDoorSub: "TẠM ĐÓNG BĂNG" (không có số %).
   - Cả 2 cánh cửa/phương án so sánh tự động bắt đầu từ màu xám trung tính (#E2E8F0) rồi chuyển màu mượt đồng thời (Neutral-to-Decision Dual Morph).`;

/**
 * Tự động xác định chế độ hiển thị định lượng (EXACT_QUANTITATIVE) hay định tính (QUALITATIVE_STATE)
 * cho mọi thẻ Infographic và Callout trên toàn hệ thống.
 */
export function inferMetricModeForCard(params: {
  metricMode?: MetricDisplayMode;
  cardType?: string;
  targetPercent?: number;
  narrationText?: string;
  labelText?: string;
}): MetricDisplayMode {
  if (
    params.metricMode === "EXACT_QUANTITATIVE" ||
    params.metricMode === "QUALITATIVE_STATE"
  ) {
    return params.metricMode;
  }

  const ct = params.cardType || "";
  const combinedText = `${params.narrationText || ""} ${params.labelText || ""}`.toLowerCase();

  // Các thẻ lựa chọn nhị phân / so sánh trạng thái / cắt lớp định tính: mặc định cấm bịa %
  if (
    ct === "TWO_DOORS_CARD" ||
    ct === "BALANCE_SCALE_CARD" ||
    ct === "CHAPTER_CARD" ||
    ct === "XRAY_BODY_CARD"
  ) {
    return "QUALITATIVE_STATE";
  }

  // Đồng hồ dự trữ GAUGE_RESERVE_CARD: CHỈ gắn số % khi kịch bản truyền targetPercent xác định
  if (ct === "GAUGE_RESERVE_CARD") {
    return typeof params.targetPercent === "number" && Number.isFinite(params.targetPercent)
      ? "EXACT_QUANTITATIVE"
      : "QUALITATIVE_STATE";
  }

  // Lịch đếm ngày/tuần, biểu đồ trục số, bảng vạch đếm ngày: đại lượng định lượng rõ ràng
  if (
    ct === "CALENDAR_FLIP_CARD" ||
    ct === "SIMPLE_CHART_CARD" ||
    ct === "STOPWATCH_TALLY_CARD"
  ) {
    return "EXACT_QUANTITATIVE";
  }

  // Ngọn nến trao đổi chất: hiện số % nếu có targetPercent hoặc kịch bản nêu rõ tỷ lệ/phân số
  if (ct === "CANDLE_HOURGLASS_CARD") {
    const hasExplicitRatio =
      (typeof params.targetPercent === "number" && Number.isFinite(params.targetPercent)) ||
      /(\d+\s*%|1\/\d+|một phần năm|một phần tư|một nửa|phần trăm)/i.test(combinedText);
    return hasExplicitRatio ? "EXACT_QUANTITATIVE" : "QUALITATIVE_STATE";
  }

  return "QUALITATIVE_STATE";
}

/**
 * Loại bỏ triệt để mọi đuôi/nhãn phần trăm giả (ví dụ "(100%)", "(0%)", "(79%)", "(9%)")
 * khi đang ở chế độ QUALITATIVE_STATE để bảo vệ toàn hệ thống khỏi Fake Metrics.
 */
export function stripFabricatedPercentSuffix(
  label: string,
  mode: MetricDisplayMode
): string {
  const clean = (label || "").trim();
  if (mode === "EXACT_QUANTITATIVE" || !clean) {
    return clean;
  }
  return clean
    .replace(/\s*\(\s*\d+(?:[.,]\d+)?\s*%\s*\)/g, "")
    .replace(/\s*[-–—:]\s*\d+(?:[.,]\d+)?\s*%\b/g, "")
    .replace(/\s+\d+(?:[.,]\d+)?\s*%\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Chuẩn hóa nhãn trạng thái hiển thị trên thẻ Infographic:
 * - QUALITATIVE_STATE: Trả về chuỗi trạng thái chữ sắc nét, sạch bóng số % thừa.
 * - EXACT_QUANTITATIVE: Nếu có exactPercent xác định thì gắn kèm "(XX%)".
 */
export function formatStateBadgeLabel(
  baseLabel: string,
  mode: MetricDisplayMode,
  exactPercent?: number
): string {
  const stripped = stripFabricatedPercentSuffix(baseLabel, "QUALITATIVE_STATE");
  if (
    mode === "EXACT_QUANTITATIVE" &&
    typeof exactPercent === "number" &&
    Number.isFinite(exactPercent)
  ) {
    return `${stripped} (${Math.round(exactPercent)}%)`;
  }
  return stripped;
}

// =============================================================================
// MỤC 7 (V10.3): QUY TẮC CHUYỂN TRẠNG THÁI TỪ TRUNG TÍNH ĐỐI XỨNG
// Neutral-to-Decision Dual Morph (áp dụng cho TWO_DOORS_CARD & mọi thẻ so sánh)
// =============================================================================

export type DualDecisionPhase =
  | "NEUTRAL_HOLD"
  | "DUAL_MORPH"
  | "ENERGY_TRANSFER_HOLD";

export interface DualDecisionMorphState {
  phase: DualDecisionPhase;
  /** Tiến trình chuyển màu mượt đồng thời cả 2 bên [0..1] trong khoảng displayProgress 0.25 -> 0.62 */
  morphT: number;
  /** Tiến trình sập ổ khóa & dây xích [0..1] trong khoảng 0.25 -> 0.60 */
  slamT: number;
  /** Tiến trình bật nảy (spring) dấu tích xanh bên được chọn [0..1] */
  checkPopT: number;
  /** Tiến trình luồng năng lượng vàng từ cửa bị khóa sang cửa được chọn [0..1] trong khoảng 0.62 -> 1.0 */
  energyTransferT: number;
}

export const DUAL_DECISION_PALETTE = {
  // Pha 1: Cả 2 cánh cửa đều xám trung tính chưa kích hoạt
  NEUTRAL_DOOR_FILL: "#E2E8F0",
  NEUTRAL_FRAME_FILL: "#F1F5F9",
  NEUTRAL_PANEL_FILL: "#CBD5E1",
  NEUTRAL_ICON_BG: "#CBD5E1",
  NEUTRAL_LOCK_BODY: "#94A3B8",
  NEUTRAL_TITLE: "#334155",
  NEUTRAL_BADGE_BG: "#F1F5F9",
  NEUTRAL_BADGE_TEXT: "#475569",

  // Pha 2 -> 3: Cửa Trái được chọn (Vàng rực sáng + Dấu tích xanh)
  CHOSEN_DOOR_FILL: "#FACC15",
  CHOSEN_FRAME_FILL: "#FEF9C3",
  CHOSEN_PANEL_FILL: "#FDE047",
  CHOSEN_HALO: "#FDE047",
  CHOSEN_ICON_BG: "#22C55E",
  CHOSEN_TITLE: "#141414",
  CHOSEN_BADGE_BG: "#DCFCE7",
  CHOSEN_BADGE_TEXT: "#15803D",

  // Pha 2 -> 3: Cửa Phải bị tắt (Xám đậm đóng băng + Ổ khóa đỏ & xích chéo)
  FROZEN_DOOR_FILL: "#64748B",
  FROZEN_FRAME_FILL: "#CBD5E1",
  FROZEN_PANEL_FILL: "#94A3B8",
  FROZEN_LOCK_BODY: "#EF4444",
  FROZEN_TITLE: "#475569",
  MORPHING_BADGE_BG: "#FEF3C7",
  MORPHING_BADGE_TEXT: "#B45309",
  FROZEN_BADGE_BG: "#FEE2E2",
  FROZEN_BADGE_TEXT: "#DC2626",
} as const;

/**
 * Tính toán tiến trình 3 pha đối xứng cho mọi thẻ lựa chọn / so sánh 2 phương án:
 * - Pha 1 (0.00 -> 0.25): Cả hai bên giữ nguyên màu xám trung tính (#E2E8F0 / #CBD5E1).
 * - Pha 2 (0.25 -> 0.62): Nội suy màu mượt đồng thời: Chọn -> Vàng rực sáng, Tắt -> Xám đóng băng + khóa đỏ.
 * - Pha 3 (0.62 -> 1.00): Dòng hạt ánh sáng vàng chuyển năng lượng & giữ trạng thái đích hoàn chỉnh.
 */
export function computeDualDecisionMorph(displayProgress: number): DualDecisionMorphState {
  const dp = clamp01(displayProgress);
  if (dp < 0.25) {
    return {
      phase: "NEUTRAL_HOLD",
      morphT: 0,
      slamT: 0,
      checkPopT: 0,
      energyTransferT: 0,
    };
  }
  if (dp < 0.62) {
    const morphT = smoothstep(0.25, 0.62, dp);
    const slamT = smoothstep(0.25, 0.60, dp);
    const checkPopT = clamp01((dp - 0.30) / 0.30);
    return {
      phase: "DUAL_MORPH",
      morphT,
      slamT,
      checkPopT,
      energyTransferT: 0,
    };
  }
  return {
    phase: "ENERGY_TRANSFER_HOLD",
    morphT: 1,
    slamT: 1,
    checkPopT: 1,
    energyTransferT: clamp01((dp - 0.62) / 0.38),
  };
}

// =============================================================================
// MỤC 8 (V11.2): ĐỒNG BỘ THỜI ĐIỂM HIỆN/ẨN Ô COMMENT KHỚP LỜI THOẠI
// Speech-Synced Timed Callout (appearFrame theo vị trí từ khóa -> giữ 2.4s -> OUT)
// =============================================================================

export interface SpeechSyncedWindow {
  appearFrame: number;
  disappearFrame: number;
  visibleDurationFrames: number;
  matchedIndex: number;
  ratio: number;
}

/**
 * Tự động tính khung hình xuất hiện (appearFrame) và khung hình biến mất (disappearFrame)
 * của ô Callout khớp đúng thời điểm người kể đọc tới triggerPhrase trong narrationText:
 * - appearFrame = Math.max(leadInFrames, leadInFrames + Math.round(ratio * speechFrames) - 8)
 * - visibleDurationFrames mặc định = 144 frames (2.4 giây @ 60fps)
 * - disappearFrame = Math.min(totalFrames - 18, appearFrame + 144)
 */
export function computeSpeechSyncedWindow(
  narrationText: string | undefined,
  triggerPhrase: string | undefined,
  leadInFrames: number = 18,
  speechFrames: number = 240,
  totalFrames: number = 300,
  visibleDurationFrames: number = 144
): SpeechSyncedWindow {
  const safeTotal = Math.max(60, totalFrames);
  const safeLead = Math.min(leadInFrames, Math.floor(safeTotal * 0.2));
  const safeSpeech = Math.max(1, speechFrames);
  const normText = (narrationText || "").toLowerCase();
  const normPhrase = (triggerPhrase || "").trim().toLowerCase();
  const idx = normPhrase ? normText.indexOf(normPhrase) : -1;
  const ratio = idx >= 0 ? idx / Math.max(1, normText.length) : 0.25;

  const rawAppear = Math.max(
    safeLead,
    safeLead + Math.round(ratio * safeSpeech) - 8
  );
  // Đảm bảo luôn còn tối thiểu 48 frames (0.8s) cho pha IN (14f) + đọc + OUT (12f) trước khi hết cảnh
  const maxAppear = Math.max(safeLead, safeTotal - 66);
  const appearFrame = Math.min(rawAppear, maxAppear);
  const disappearFrame = Math.min(safeTotal - 18, appearFrame + visibleDurationFrames);

  return {
    appearFrame,
    disappearFrame: Math.max(appearFrame + 32, disappearFrame),
    visibleDurationFrames: Math.max(32, disappearFrame - appearFrame),
    matchedIndex: idx,
    ratio,
  };
}

// =============================================================================
// MỤC 9 (V11.3): QUY TẮC TỐI GIẢN Ô COMMENT TOÀN CỤC (MINIMALIST CALLOUT POLICY)
// Chỉ hiện ô comment vàng nhạt khi giới thiệu nhân vật/khái niệm mới lần đầu hoặc
// giải thích cơ chế ẩn bên trong (X-Ray / thông số định lượng); không hiện khi
// hình ảnh + hiệu ứng chữ nổ SFX (CHÓI!, VÙÙÙ!, CHỘP!) đã quá rõ hành động.
// =============================================================================

export const MINIMALIST_CALLOUT_POLICY_PROMPT_RULE = `QUY TẮC TỐI GIẢN Ô COMMENT TOÀN CỤC V11.3 (MINIMALIST CALLOUT POLICY - BẮT BUỘC):
Chỉ gắn ô comment vàng nhạt (calloutText / calloutSub) khi thực sự cần thiết:
1. CÓ HIỆN:
   - Khi giới thiệu vật thể / nhân vật / khái niệm mới xuất hiện LẦN ĐẦU TIÊN (ví dụ: "[ONG LÍNH CANH CỬA]").
   - Hoặc khi giải thích cơ chế ẩn bên trong không thể nhìn thấy bằng mắt thường (ví dụ: cắt lớp X-Ray nội tạng / đốt thể mỡ).
2. KHÔNG HIỆN:
   - Khi hình ảnh hoạt họa và chữ tượng thanh nổ (sfxText như "CHÓI!", "VÙÙÙ!", "CHỘP!") đã diễn tả quá rõ hành động trên màn hình.
   - Hãy để trống calloutText & calloutSub ở các cảnh hành động cao trào đã có SFX nổ để khung hình thoáng và điện ảnh hơn!`;

export function shouldRenderMinimalistCallout(params: {
  calloutText?: string;
  calloutSub?: string;
  sfxText?: string;
  showXrayAbdomen?: boolean;
  isFirstIntroduction?: boolean;
  forceShowCallout?: boolean;
}): boolean {
  const title = (params.calloutText || "").trim();
  if (!title) return false;
  if (params.forceShowCallout || params.isFirstIntroduction || params.showXrayAbdomen) {
    return true;
  }
  const hasExplicitMetric = /\b\d+(?:[.,]\d+)?\s*(?:giây|ms|°|độ|%|ngày|tuần|lần|cm|mm|km\/h)\b/i.test(
    `${title} ${params.calloutSub || ""}`
  );
  if (hasExplicitMetric) {
    return true;
  }
  // Nếu cảnh đã có chữ nổ SFX (CHÓI!, VÙÙÙ!, BỐP!) mô tả hành động trực quan -> lược bỏ ô comment thừa
  if ((params.sfxText || "").trim().length > 0) {
    return false;
  }
  return true;
}

// =============================================================================
// MỤC 10 (V11.3): HIỆU ỨNG RUN RẨY TRUYỆN TRANH TOÀN CỤC (COMIC SHIVER LINES)
// Chuyển động thân cực êm Math.sin(frame * 0.35) * 1.4px + 2-3 nét gạch gấp khúc /
// đường cong rung (strokeWidth=2.5, strokeLinecap="round") đảo chậm mỗi 8 frames.
// =============================================================================

export const COMIC_SHIVER_CONFIG = {
  BODY_SWAY_FREQ: 0.35,
  BODY_SWAY_AMPLITUDE_PX: 1.4,
  TICK_INTERVAL_FRAMES: 8,
  STROKE_WIDTH_PX: 2.5,
  DARK_STAGE_COLOR: "#F1F5F9",
  LIGHT_STAGE_COLOR: "#334155",
} as const;

export interface ComicShiverMotion {
  /** Dịch chuyển ngang thân người cực nhẹ & êm (<= ±1.4px) */
  swayX: number;
  /** Nhịp đảo trạng thái chậm mỗi 8 frames (0 hoặc 1) tạo hiệu ứng vẽ tay 2D */
  tick: 0 | 1;
  /** Dịch chuyển dọc nhẹ của cụm nét run theo tick */
  lineOffsetY: number;
  /** Góc nghiêng đảo chậm của cụm nét run theo tick */
  lineTiltDeg: number;
}

export function computeComicShiverMotion(frame: number): ComicShiverMotion {
  const safeFrame = Number.isFinite(frame) ? frame : 0;
  const swayX =
    Math.sin(safeFrame * COMIC_SHIVER_CONFIG.BODY_SWAY_FREQ) *
    COMIC_SHIVER_CONFIG.BODY_SWAY_AMPLITUDE_PX;
  const tick = (Math.floor(Math.max(0, safeFrame) / COMIC_SHIVER_CONFIG.TICK_INTERVAL_FRAMES) % 2) as 0 | 1;
  return {
    swayX,
    tick,
    lineOffsetY: tick === 0 ? -2.5 : 2.5,
    lineTiltDeg: tick === 0 ? -4.5 : 4.5,
  };
}

// =============================================================================
// MỤC 11 (V14.0): QUY TẮC GIỌNG VĂN KỊCH BẢN ĐỜI SỐNG TỰ NHIÊN
// (NATURAL_STORYTELLING_TONE — Cấm tuyên truyền, giáo điều hay khẩu hiệu cứng nhắc)
// =============================================================================

export const NATURAL_STORYTELLING_TONE = {
  STYLE_ID: "NATURAL_STORYTELLING_TONE",
  FORBIDDEN_PREACHY_PHRASES: [
    "Đừng bao giờ thử!",
    "Quy tắc thoát hiểm 3 bước",
    "Hãy nhớ kỹ bài học",
    "Tuyệt đối không được làm theo",
    "Đây là bài học cảnh tỉnh",
  ],
  REUSABLE_CHARACTER_PRESETS: ["BOY", "GRANDPA", "GRANDMA", "DOCTOR", "NEIGHBOR"] as const,
  REUSABLE_LIFE_STAGES: [
    "COUNTRYSIDE_YARD",
    "BEDROOM_INDOOR",
    "UNDERGROUND_CROSS_SECTION",
    "EXPLAINER_POLKA_DOT",
    "SIMPLE_GRASS_FIELD",
  ] as const,
} as const;

export const NATURAL_STORYTELLING_TONE_PROMPT_RULE = `QUY TẮC GIỌNG VĂN KỊCH BẢN ĐỜI SỐNG TỰ NHIÊN V14.0 (NATURAL_STORYTELLING_TONE - BẮT BUỘC):
1. Kể chuyện theo ngôi thứ nhất gần gũi, tò mò đời thường ("Hồi 12 tuổi...", "Một buổi chiều...") hoặc câu hỏi mở tự nhiên ("Sẽ ra sao nếu...").
2. Đan xen nhịp nhàng giữa tình huống đời sống vui nhộn + bóng thoại hội thoại ngắn 2–5 từ ("Ủa, cái gì đây?", "Ấy chết!", "Khoan đã!", "Kiến lửa đó con!") với các cảnh giải thích khoa học trực quan (kính lúp phóng to, mặt cắt lòng đất UNDERGROUND_CROSS_SECTION, so sánh 2–3 ô trên nền chấm bi pastel EXPLAINER_POLKA_DOT).
3. SỬ DỤNG 5 BỐI CẢNH ĐỜI SỐNG TÁI SỬ DỤNG: COUNTRYSIDE_YARD, BEDROOM_INDOOR, UNDERGROUND_CROSS_SECTION, EXPLAINER_POLKA_DOT, SIMPLE_GRASS_FIELD và 5 Preset Người Que Thuần: BOY, GRANDPA, GRANDMA, DOCTOR, NEIGHBOR.
4. TUYỆT ĐỐI CẤM giọng văn tuyên truyền, giáo điều hay khẩu hiệu cứng nhắc:
   - KHÔNG BAO GIỜ dùng các cụm sáo rỗng như "Đừng bao giờ thử!", "Quy tắc thoát hiểm 3 bước", "Hãy nhớ kỹ bài học", "Bài học rút ra là...".
   - Hãy để chi tiết đời thực, phản ứng hóm hỉnh của nhân vật và hình ảnh khoa học tự kể câu chuyện một cách lôi cuốn, gợi tò mò ở đoạn kết!`;
