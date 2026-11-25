import React from "react";
import {
  StickmanState,
  Point2D,
  StickmanAnchors,
  EyeExpression,
  EyebrowExpression,
  MouthExpression,
} from "../../types/character";
import { FacialExpressions } from "./FacialExpressions";
import { getHumanoidBones } from "../../../animscript/registry/assetRegistry";
import { solve2JointIK, resolvePendulumLegs, resolvePendulumArms } from "../../../animscript/motionGraph";
import {
  CharacterArchetype,
  CharacterPreset,
  StickmanAppearance,
  HeadBackAccessories,
  HeadFrontAccessories,
  TorsoOutfitRenderer,
  BuiltInAppearancePropRenderer,
  hasStickmanAppearanceOverrides,
  resolveStickmanAppearance,
} from "./StickmanArchetypes";

export type { CharacterPreset, StickmanAppearance };
import {
  RigSockets,
  computeStickmanRigSockets,
  COMIC_SHIVER_CONFIG,
  computeComicShiverMotion,
} from "../../../lib/v7/universalAnimationStandard";

export interface StickmanBodyParts {
  head?: React.ReactNode;
  torso?: React.ReactNode;
  leftUpperArm?: React.ReactNode;
  leftLowerArm?: React.ReactNode;
  leftHand?: React.ReactNode;
  rightUpperArm?: React.ReactNode;
  rightLowerArm?: React.ReactNode;
  rightHand?: React.ReactNode;
  leftThigh?: React.ReactNode;
  leftCalf?: React.ReactNode;
  leftFoot?: React.ReactNode;
  rightThigh?: React.ReactNode;
  rightCalf?: React.ReactNode;
  rightFoot?: React.ReactNode;
}

/**
 * V18.3–V22.0: Chuẩn hóa tỷ lệ chiều cao thực tế trẻ con / người lớn + hỗ trợ appearance.scale tùy chọn:
 * - Nếu appearance.scale hợp lệ -> kẹp an toàn trong [0.5, 1.4]
 * - Mặc định BOY = 0.76 (nhỏ nhắn, đứng ngang vai người lớn, bàn chân vẫn chạm chuẩn groundY)
 * - Người lớn / CUSTOM = 1.0
 */
export function resolvePresetDefaultScale(
  preset?: CharacterPreset | CharacterArchetype,
  appearance?: StickmanAppearance | null
): number {
  if (appearance?.scale !== undefined && Number.isFinite(appearance.scale)) {
    return Math.max(0.5, Math.min(1.4, appearance.scale));
  }
  return preset === "BOY" ? 0.76 : 1.0;
}

export const TORSO_LEN = 115; // Khoảng cách từ Hông tới Vai luôn bằng đúng 115px
export const ARM_L1 = 65;     // Bắp tay trên luôn đúng 65px
export const ARM_L2 = 58;     // Cẳng tay luôn đúng 58px (MAX_ARM_REACH = 123px)
export const LEG_L1 = 90;     // Đùi luôn đúng 90px
export const LEG_L2 = 85;     // Cẳng chân luôn đúng 85px (MAX_LEG_REACH = 175px)

export function enforceRigidTwoBoneIK(
  origin: { x: number; y: number },
  desiredEnd: { x: number; y: number },
  L1: number,
  L2: number,
  bendDir: number, // +1 hoặc -1 quy định chiều gập khuỷu/gối
  hintJoint?: { x: number; y: number }
): { joint: Point2D; end: Point2D } {
  let dx = desiredEnd.x - origin.x;
  let dy = desiredEnd.y - origin.y;
  let dist = Math.hypot(dx, dy);
  const maxReach = (L1 + L2) * 0.995; // Khóa cứng trần sải tay/chân, cấm giãn cao su!
  const minReach = Math.abs(L1 - L2) + 4;

  // Bảo toàn chiều gập tự nhiên nếu có khớp gợi ý từ FK/solver trước
  let effectiveBend = bendDir;
  if (hintJoint && dist > 1e-3) {
    const cross = dx * (hintJoint.y - origin.y) - dy * (hintJoint.x - origin.x);
    if (Math.abs(cross) > 1.0) {
      effectiveBend = cross >= 0 ? 1 : -1;
    }
  }

  if (dist < 1e-4) {
    dx = 0;
    dy = minReach;
    dist = minReach;
  } else if (dist > maxReach) {
    // Kẹp bàn tay/chân nằm đúng trên bán kính tối đa L1 + L2 (không bao giờ dài hơn!)
    const scale = maxReach / dist;
    dx *= scale;
    dy *= scale;
    dist = maxReach;
  } else if (dist < minReach) {
    const scale = minReach / dist;
    dx *= scale;
    dy *= scale;
    dist = minReach;
  }

  // Định lý Cosin đảm bảo distance(origin, joint) === L1 và distance(joint, end) === L2 tuyệt đối 100%
  const cosAngle = Math.min(1, Math.max(-1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist)));
  const baseAngle = Math.atan2(dy, dx);
  const offsetAngle = Math.acos(cosAngle) * (effectiveBend >= 0 ? 1 : -1);
  const jointAngle = baseAngle + offsetAngle;

  const joint = {
    x: origin.x + L1 * Math.cos(jointAngle),
    y: origin.y + L1 * Math.sin(jointAngle),
  };
  const end = {
    x: origin.x + dx,
    y: origin.y + dy,
  };
  return { joint, end };
}

export interface StickmanRigProps {
  state: StickmanState;
  archetype?: CharacterArchetype;
  characterPreset?: CharacterPreset;
  appearance?: StickmanAppearance;
  renderPart?: "all" | "bodyOnly" | "armsOnly" | "legsOnly" | "backArmOnly" | "frontArmOnly" | "frontArmsBoth" | "none";
  parts?: StickmanBodyParts;
  frame?: number;
  breathScale?: number;
  breathScaleY?: number;
  showDebugMarkers?: boolean;
  onAnchorsComputed?: (anchors: StickmanAnchors) => void;
  onSocketsComputed?: (sockets: RigSockets) => void;
}

/**
 * Động học Chân Sinh Cơ Học Người Thật (Real Human Gait Biomechanics)
 * - Chiều dài xương: Đùi L1 = 90px + Cẳng chân L2 = 85px (Tổng L = 175px)
 * - Khi đứng yên (walkWeight == 0 & crouchDepth == 0): Chân duỗi thẳng 100% (0°), hipY = -173.0px, mở chân ±26px
 * - Khi đi/chạy: Chân trụ (Stance) duỗi thẳng 100% chạm sàn y = 0, chỉ chân lăng (Swing) co nhẹ gối
 * - Khi chủ động cúi/nhún (crouchDepth > 0.5px): Giải 2-Joint IK khuỵu gối tự nhiên
 */
export function computeLegsAndHip(
  standingLegLength: number,
  crouchDepth: number,
  flightLift: number,
  pose: string,
  isWalking: boolean,
  walkCycleProgress: number,
  weight: number,
  torsoAngle: number,
  isSitting: boolean,
  seatedHipY?: number,
  customLeftFoot?: Point2D,
  customRightFoot?: Point2D,
  customLeftKnee?: Point2D,
  customRightKnee?: Point2D,
  customHipY?: number
): { hipY: number; leftFoot: Point2D; rightFoot: Point2D; leftKnee: Point2D; rightKnee: Point2D } {
  const L1 = LEG_L1;
  const L2 = LEG_L2;
  const totalLegLen = L1 + L2; // 175px
  const restFootX = 26;
  const standHipY = -Math.sqrt(totalLegLen * totalLegLen - restFootX * restFootX); // -173.06px

  let rawHipY: number;
  let rawLeftFoot: Point2D;
  let rawRightFoot: Point2D;
  let rawLeftKnee: Point2D | undefined;
  let rawRightKnee: Point2D | undefined;

  if (customLeftFoot && customRightFoot && customLeftKnee && customRightKnee) {
    // Ưu tiên 1: Tọa độ khớp đã tính toán đầy đủ từ FK sinh học (resolvePendulumLegs)
    const defaultHipY = isSitting ? -180 : (standHipY + crouchDepth - flightLift);
    rawHipY = customHipY !== undefined ? customHipY : (seatedHipY !== undefined ? seatedHipY : defaultHipY);
    rawLeftFoot = customLeftFoot;
    rawRightFoot = customRightFoot;
    rawLeftKnee = customLeftKnee;
    rawRightKnee = customRightKnee;
  } else if (customLeftFoot && customRightFoot) {
    // Ưu tiên 2: Tọa độ 2 bàn chân được truyền vào (ví dụ khi cúi nhặt)
    const defaultHipY = isSitting ? -180 : (standHipY + crouchDepth - flightLift);
    rawHipY = seatedHipY !== undefined ? seatedHipY : defaultHipY;
    rawLeftFoot = customLeftFoot;
    rawRightFoot = customRightFoot;
  } else if (isSitting) {
    let hipY = -180;
    if (seatedHipY !== undefined) {
      if (seatedHipY <= -220 && seatedHipY >= -350) {
        const sittingRatio = (seatedHipY - (-350)) / 130;
        hipY = -184 + sittingRatio * (184 - 180);
      } else {
        hipY = seatedHipY;
      }
    }
    rawHipY = hipY;
    rawLeftFoot = { x: 70, y: hipY + 110 };
    rawRightFoot = { x: 70, y: hipY + 110 };
  } else {
    // Mặc định giải bằng resolvePendulumLegs (đã tích hợp đầy đủ crouchBlend & airBlend C1/C2)
    const isRunning = pose === "running";
    const speed = isRunning ? 6.0 : (isWalking ? 2.5 : 0);
    const phase = walkCycleProgress * Math.PI * 2;
    const res = resolvePendulumLegs(phase, speed, crouchDepth, flightLift, speed * weight, torsoAngle);
    rawHipY = res.hipY;
    rawLeftFoot = res.leftFoot;
    rawRightFoot = res.rightFoot;
    rawLeftKnee = res.leftKnee;
    rawRightKnee = res.rightKnee;
  }

  // Khóa cứng độ dài xương đùi (90px) và cẳng chân (85px) tuyệt đối bằng enforceRigidTwoBoneIK
  const hipOrigin: Point2D = { x: 0, y: rawHipY };
  const rigidLeft = enforceRigidTwoBoneIK(hipOrigin, rawLeftFoot, L1, L2, -1, rawLeftKnee);
  const rigidRight = enforceRigidTwoBoneIK(hipOrigin, rawRightFoot, L1, L2, -1, rawRightKnee);

  return {
    hipY: rawHipY,
    leftFoot: rigidLeft.end,
    rightFoot: rigidRight.end,
    leftKnee: rigidLeft.joint,
    rightKnee: rigidRight.joint,
  };
}

/**
 * V18.4: Động học thuận (FK) 2 đốt cánh tay chuẩn ARM_L1=65 / ARM_L2=58 theo góc từ phương thẳng đứng (+y):
 * - upperDeg: góc bắp tay trên tính từ hướng rủ thẳng xuống (+ = đưa về phía trước +x, - = lùi nhẹ phía sau -x)
 * - elbowInteriorDeg: góc mở bên trong tại khớp khuỷu (180° = thẳng tắp, 160° = hơi cong thả lỏng, 125° = mở rộng tự nhiên)
 * - bendForward: true = cẳng tay gập hướng về phía trước (+x); false = rủ hướng về phía sau (-x)
 */
export function solveArmFK(
  shoulderUpper: Point2D,
  upperDeg: number,
  elbowInteriorDeg: number,
  bendForward: boolean = true
): { elbow: Point2D; wrist: Point2D } {
  const flexDeg = 180 - elbowInteriorDeg;
  const forearmDeg = upperDeg + (bendForward ? flexDeg : -flexDeg);
  const uRad = (upperDeg * Math.PI) / 180;
  const fRad = (forearmDeg * Math.PI) / 180;
  const elbow: Point2D = {
    x: shoulderUpper.x + ARM_L1 * Math.sin(uRad),
    y: shoulderUpper.y + ARM_L1 * Math.cos(uRad),
  };
  const wrist: Point2D = {
    x: elbow.x + ARM_L2 * Math.sin(fRad),
    y: elbow.y + ARM_L2 * Math.cos(fRad),
  };
  return { elbow, wrist };
}

/**
 * V19.1: Ánh xạ biểu cảm chuẩn cho StickmanRig — phân biệt rõ Ngạc nhiên / Sợ / Lo lắng / Tò mò,
 * tuyệt đối KHÔNG fallback sai về mặt cười ("smile").
 */
export function resolveStickmanExpressionPreset(expr?: string | null): {
  eyes: EyeExpression;
  eyebrows: EyebrowExpression;
  mouth: MouthExpression;
  blush: boolean;
  sweatDrop: boolean;
} {
  const key = String(expr ?? "").trim().toUpperCase();
  switch (key) {
    case "HAPPY":
    case "PROUD":
      return { eyes: "happy", eyebrows: "neutral", mouth: "smile", blush: false, sweatDrop: false };
    case "CURIOUS":
    case "THINKING":
      // V19.1: Miệng gạch ngang nhẹ trung tính, tuyệt đối không cười toe toét như HAPPY
      return { eyes: "curious", eyebrows: "inquisitive", mouth: "line", blush: false, sweatDrop: false };
    case "SURPRISED":
      // V19.1: Miệng há bầu dục (O), lông mày nhướng cao
      return { eyes: "surprised", eyebrows: "raised", mouth: "gasp", blush: false, sweatDrop: false };
    case "SHOCKED":
      // V19.1: Miệng há bầu dục (O), lông mày nhướng cao + giọt mồ hôi
      return { eyes: "surprised", eyebrows: "raised", mouth: "gasp", blush: false, sweatDrop: true };
    case "SCARED":
      // V19.1: Miệng run gợn sóng, lông mày chéo nhíu lo lắng — tuyệt đối KHÔNG cười
      return { eyes: "wide", eyebrows: "worried", mouth: "worried", blush: false, sweatDrop: true };
    case "WORRIED":
      // V19.1: Miệng cong xuống, lông mày chéo nhíu lo lắng — tuyệt đối KHÔNG cười
      return { eyes: "neutral", eyebrows: "worried", mouth: "frown", blush: false, sweatDrop: true };
    case "TIRED":
      return { eyes: "closed", eyebrows: "worried", mouth: "frown", blush: false, sweatDrop: true };
    case "ANGRY":
      return { eyes: "wide", eyebrows: "furrowed", mouth: "frown", blush: false, sweatDrop: false };
    default:
      return { eyes: "neutral", eyebrows: "neutral", mouth: "line", blush: false, sweatDrop: false };
  }
}

/**
 * V20.0–V21.0: Hệ số nhịp thở dọc khi đứng yên (idleBreathFactor ~1.2–1.8px ở thân/vai, bàn chân khóa cứng tại y=0 không trượt đất),
 * đồng bộ 100% giữa StickmanRig và HandPropGraphic để đạo cụ cầm tay bám khít 0px vào cổ tay ở mọi frame.
 */
export function computeStickmanIdleBreathFactor(
  frame: number,
  stableSeed: number,
  enableIdleLife: boolean,
  walkWeight: number = 0
): number {
  if (!enableIdleLife) return 1.0;
  const standFactor = Math.max(0, 1 - Math.min(1, Math.max(0, walkWeight) * 1.25));
  if (standFactor <= 0) return 1.0;
  const idlePhaseSeed = (Math.abs(Math.floor(stableSeed)) % 37) * 0.41;
  // Biên độ 0.0056 -> vai/thân (288px) nhấp nhô nhẹ ~1.6px cho người lớn và ~1.22px cho BOY (0.76), chân y=0 đứng im tuyệt đối!
  return 1 + Math.sin(frame * 0.052 + idlePhaseSeed) * 0.0056 * standFactor;
}

/**
 * V20.0: Nhịp nâng ly nước lên ngang sát cằm/miệng mượt trong 14 frames đầu rồi giữ sát miệng khi nhấp từng ngụm (0.95..1.0)
 * để đầu ống hút luôn chạm trực tiếp vào miệng hình tròn nhỏ (o).
 */
export function computeSipDrinkWave(localFrame: number): number {
  if (!Number.isFinite(localFrame)) return 1;
  const f = Math.max(0, localFrame);
  const enterT = Math.min(1, f / 14);
  const easeEnter = enterT * enterT * (3 - 2 * enterT);
  const sipPulse =
    f <= 14 ? 1 : 0.95 + 0.05 * (0.5 - 0.5 * Math.cos((f - 14) * 0.12));
  return easeEnter * sipPulse;
}

/**
 * V18.4: Gật đầu nhẹ đúng 2 nhịp êm ái rồi dừng hẳn (dùng cho pose NOD_SMILE).
 * - Nhịp 1: 0..28f (đỉnh +5.5° rồi về 0°)
 * - Nhịp 2: 28..56f (đỉnh +3.8° rồi về 0°)
 * - Từ frame >= 56 (~0.93s @ 60fps): dừng hoàn toàn ở 0°!
 */
export function computeGentleDoubleNodDeg(localFrame: number): number {
  if (!Number.isFinite(localFrame)) return 0;
  const f = Math.max(0, localFrame);
  const cycleFrames = 28;
  const totalNodFrames = cycleFrames * 2;
  if (f >= totalNodFrames) return 0;
  const beatIdx = Math.floor(f / cycleFrames);
  const t = (f - beatIdx * cycleFrames) / cycleFrames;
  const smoothPulse = 0.5 * (1 - Math.cos(t * Math.PI * 2));
  const amplitude = beatIdx === 0 ? 5.5 : 3.8;
  return smoothPulse * amplitude;
}

/**
 * V18.0–V18.4: Bộ giải tay 60fps chính xác cho 20 tư thế Keyframe Action Timeline + tư thế chống hông (handsOnHips).
 * Trả về tọa độ khớp vai->khuỷu->cổ tay trong hệ trục thân trên (shoulderUpper = (0, -115)),
 * được khóa cứng chiều dài xương ARM_L1=65 / ARM_L2=58 ở bước enforceRigidTwoBoneIK.
 */
export function computeV18ActionArmsUpper(
  v18Pose: string | undefined,
  handsOnHips: boolean | undefined,
  shoulderUpper: Point2D,
  frame: number,
  localFrame: number,
  segU: number
): {
  leftElbow: Point2D;
  leftWrist: Point2D;
  rightElbow: Point2D;
  rightWrist: Point2D;
  allowNearHead: boolean;
} | null {
  const sy = shoulderUpper.y; // -115
  const clampedU = Math.max(0, Math.min(1, segU));
  const smoothU = clampedU * clampedU * (3 - 2 * clampedU);

  if (handsOnHips && !v18Pose) {
    // V18.0 Fix cho SIT_OBSERVE cũ: Đứng chống hông tự nhiên thay vì ngồi squat lơ lửng
    return {
      leftElbow: { x: -46, y: sy + 49 },
      leftWrist: { x: -13, y: sy + 97 },
      rightElbow: { x: 46, y: sy + 49 },
      rightWrist: { x: 13, y: sy + 97 },
      allowNearHead: false,
    };
  }

  if (!v18Pose) return null;

  switch (v18Pose) {
    case "CROUCH_LOOK": {
      // V18.3: Đứng thẳng chân tự nhiên, hơi nghiêng thân 12° về trước quan sát mục tiêu (bỏ dáng gập gối chữ Z!)
      const scan = Math.sin(frame * 0.12) * 4;
      return {
        leftElbow: { x: -34, y: sy + 52 },
        leftWrist: { x: -16, y: sy + 98 },
        rightElbow: { x: 40, y: sy + 48 },
        rightWrist: { x: 82, y: sy + 28 + scan },
        allowNearHead: false,
      };
    }
    case "REACH_GRAB": {
      const reachT = Math.min(1, smoothU / 0.55);
      const reachEase = reachT * reachT * (3 - 2 * reachT);
      const grabPulse = Math.sin(frame * 0.28) * 4;
      const rx = 46 + reachEase * 68 + grabPulse;
      const ry = sy + 28 - reachEase * 24;
      return {
        leftElbow: { x: -34, y: sy + 26 },
        leftWrist: { x: -48, y: sy + 52 },
        rightElbow: { x: 52, y: sy + 36 },
        rightWrist: { x: rx, y: ry },
        allowNearHead: false,
      };
    }
    case "POINT_UP": {
      const bob = Math.sin(frame * 0.18) * 4;
      return {
        leftElbow: { x: -42, y: sy + 48 },
        leftWrist: { x: -16, y: sy + 96 },
        rightElbow: { x: 46, y: sy - 42 },
        rightWrist: { x: 44, y: sy - 104 + bob },
        allowNearHead: true,
      };
    }
    case "POINT_FORWARD": {
      const pulse = Math.sin(frame * 0.22) * 5;
      return {
        leftElbow: { x: -34, y: sy + 50 },
        leftWrist: { x: -24, y: sy + 100 },
        rightElbow: { x: 58, y: sy + 18 },
        rightWrist: { x: 114 + pulse, y: sy + 2 },
        allowNearHead: false,
      };
    }
    case "SCRATCH_HEAD": {
      // V20.2: Làm chậm nhịp gãi đầu 2.8x (frame * 0.15) để nhân vật gãi đầu từ tốn, tự nhiên, không giật nhanh
      const sx = Math.sin(frame * 0.15) * 4.5;
      const syOff = Math.cos(frame * 0.15) * 3.5;
      return {
        leftElbow: { x: 42, y: sy + 50 },
        leftWrist: { x: 14, y: sy + 98 },
        rightElbow: { x: -82, y: sy - 16 },
        rightWrist: { x: -48 + sx, y: sy - 78 + syOff },
        allowNearHead: true,
      };
    }
    case "FACEPALM": {
      const wob = Math.sin(frame * 0.14) * 2.5;
      return {
        leftElbow: { x: -22, y: sy + 52 },
        leftWrist: { x: -28, y: sy + 106 },
        rightElbow: { x: 64, y: sy - 10 },
        rightWrist: { x: 38 + wob, y: sy - 85 },
        allowNearHead: true,
      };
    }
    case "JUMP_BACK": {
      // V20.1: Giật mình phản xạ tự nhiên — hai tay đưa nhẹ về phía trước ngang ngực với góc khuỷu mở rộng 110°–130°
      // (tuyệt đối không gập góc nhọn chĩa ngược lên vai), phân tầng trước/sau rõ nét để 2 tay không chồng lên nhau
      const recoilT = Math.max(0, Math.min(1, 1 - Math.max(0, localFrame) / 18));
      const easeR = recoilT * recoilT * (3 - 2 * recoilT);
      const backArm = solveArmFK(shoulderUpper, 14 + 6 * easeR, 126 - 8 * easeR, true); // 118°..126°
      const frontArm = solveArmFK(shoulderUpper, 28 + 8 * easeR, 122 - 8 * easeR, true); // 114°..122°
      return {
        leftElbow: backArm.elbow,
        leftWrist: backArm.wrist,
        rightElbow: frontArm.elbow,
        rightWrist: frontArm.wrist,
        allowNearHead: false,
      };
    }
    case "ARMS_UP_CHEER": {
      const pump = Math.sin(frame * 0.24) * 11;
      return {
        leftElbow: { x: -58, y: sy - 36 },
        leftWrist: { x: -52, y: sy - 94 - pump },
        rightElbow: { x: 58, y: sy - 36 },
        rightWrist: { x: 52, y: sy - 94 - pump },
        allowNearHead: true,
      };
    }
    case "SIP_DRINK": {
      // V20.0: Đưa bàn tay cầm ly nước (CUP_SODA) lên cao ngang sát cằm/miệng theo FK cứng ARM_L1=65 / ARM_L2=58
      // (wrist nâng lên (+65.4, -146.2) — cao hơn vai +31.2px, ngang sát cằm/hàm và hoàn toàn ngoài biên đầu r=54 không đè mặt)
      // để đầu ống hút xoay chạm trực tiếp vào miệng hình tròn nhỏ (o).
      const sipWave = computeSipDrinkWave(localFrame);
      const backArm = solveArmFK(shoulderUpper, -24, 162, true);
      const upperDeg = 42 + 24 * sipWave; // 42° -> 66° (nâng bắp tay lên cao tự nhiên, tuyệt đối không để ly lơ lửng ngang vai)
      const elbowInteriorDeg = 98 - 26 * sipWave; // 98° -> 72° (gập cẳng tay đưa bàn tay lên sát cằm ngoài biên má, không đâm vào mặt)
      const frontArm = solveArmFK(shoulderUpper, upperDeg, elbowInteriorDeg, true);
      return {
        leftElbow: backArm.elbow,
        leftWrist: backArm.wrist,
        rightElbow: frontArm.elbow,
        rightWrist: frontArm.wrist,
        allowNearHead: true,
      };
    }
    case "WRITE_NOTE": {
      const penX = 62 + Math.sin(frame * 0.44) * 11;
      const penY = sy + 40 + Math.cos(frame * 0.68) * 6;
      return {
        leftElbow: { x: 16, y: sy + 60 },
        leftWrist: { x: 58, y: sy + 43 },
        rightElbow: { x: 44, y: sy + 68 },
        rightWrist: { x: penX, y: penY },
        allowNearHead: false,
      };
    }
    case "SWEEP_LIGHT": {
      const sweepSin = Math.sin(localFrame * 0.11);
      return {
        leftElbow: { x: -34, y: sy + 48 },
        leftWrist: { x: -28, y: sy + 94 },
        rightElbow: { x: 52, y: sy + 28 + sweepSin * 16 },
        rightWrist: { x: 94, y: sy - 2 + sweepSin * 44 },
        allowNearHead: true,
      };
    }
    case "PAT_SHOULDER": {
      const patY = Math.abs(Math.sin(localFrame * 0.18)) * 18;
      return {
        leftElbow: { x: -26, y: sy + 52 },
        leftWrist: { x: -22, y: sy + 102 },
        rightElbow: { x: 56, y: sy + 26 + patY * 0.45 },
        rightWrist: { x: 110, y: sy - 2 + patY },
        allowNearHead: false,
      };
    }
    case "STRETCH_YAWN": {
      const stretchP = Math.sin(Math.min(1, Math.max(0.15, clampedU)) * Math.PI);
      return {
        leftElbow: { x: -64, y: sy - 30 },
        leftWrist: { x: -60, y: sy - 90 - stretchP * 12 },
        rightElbow: { x: 64, y: sy - 30 },
        rightWrist: { x: 60, y: sy - 90 - stretchP * 12 },
        allowNearHead: true,
      };
    }
    case "SHIVER_PANIC": {
      // V18.3: Chỉ rung nhẹ trong 30 frames đầu (0.5s) rồi tắt dần, không rung bần bật cả cảnh!
      const jitterDecay = localFrame >= 30 ? 0 : localFrame <= 18 ? 1 : 1 - (localFrame - 18) / 12;
      const jx = Math.sin(frame * 0.85) * 3.2 * jitterDecay;
      const jy = Math.cos(frame * 0.95) * 2.4 * jitterDecay;
      return {
        leftElbow: { x: -50, y: sy + 36 },
        leftWrist: { x: -32 + jx, y: sy - 10 + jy },
        rightElbow: { x: 54, y: sy + 36 },
        rightWrist: { x: 38 - jx, y: sy - 12 - jy },
        allowNearHead: false,
      };
    }
    case "TALK_GESTURE": {
      // V18.4: Viết lại hoàn toàn tư thế nói chuyện tự nhiên:
      // - Tay sau (backArm / left): thả lỏng xuôi xuống bên hông, khuỷu cong nhẹ ~160° (158.5°..161.5°), tuyệt đối KHÔNG gập chéo thân
      // - Tay trước (frontArm / right): đưa nhẹ ra trước ngang ngực/eo, khuỷu mở rộng tự nhiên ~125° (119°..131°),
      //   cử động nhịp nhàng chậm rãi theo sóng sin chậm với biên độ rất nhỏ (±6° khuỷu / ±7.5° cẳng tay, luôn ở dưới phương ngang 73.5°..88.5°)
      const slowWave = Math.sin(frame * 0.055);
      const backBreath = Math.sin(frame * 0.045);

      const backUpperDeg = -26 + backBreath * 1.0;
      const backElbowInteriorDeg = 160 + backBreath * 1.5; // 158.5°..161.5° (nằm gọn trong 155–165°)
      const backArm = solveArmFK(shoulderUpper, backUpperDeg, backElbowInteriorDeg, true);

      const frontUpperDeg = 26 + slowWave * 1.5; // 24.5°..27.5° (tách thoáng viền áo, tự nhiên)
      const frontElbowInteriorDeg = 125 - slowWave * 6.0; // 119°..131° (mở rộng tự nhiên trong 115–135°)
      const frontArm = solveArmFK(shoulderUpper, frontUpperDeg, frontElbowInteriorDeg, true);

      return {
        leftElbow: backArm.elbow,
        leftWrist: backArm.wrist,
        rightElbow: frontArm.elbow,
        rightWrist: frontArm.wrist,
        allowNearHead: false,
      };
    }
    case "NOD_SMILE": {
      // V18.4: Cả 2 tay thả lỏng tự nhiên xuôi xuống bên hông (không vung vẩy tay), tách thoáng khỏi viền áo, khuỷu cong nhẹ ~160°
      const backArm = solveArmFK(shoulderUpper, -26, 160, true);
      const frontArm = solveArmFK(shoulderUpper, 26, 160, false);
      return {
        leftElbow: backArm.elbow,
        leftWrist: backArm.wrist,
        rightElbow: frontArm.elbow,
        rightWrist: frontArm.wrist,
        allowNearHead: false,
      };
    }
    default:
      return null;
  }
}

/**
 * V14.1: Bộ giải góc vẫy tay mượt 60fps liên tục (Cấm Math.floor / bật tắt 2 khung hình):
 * - Cánh tay trên giữ góc -115° (nâng chếch lên thoáng hoàn toàn khỏi khuôn mặt)
 * - Cẳng tay lắc đều mượt 60fps: forearmAngle = -150° + Math.sin(frame * 0.28 + phaseOffset) * 28°
 */
export function computeSmooth60fpsWaveArm(
  shoulderUpper: Point2D,
  frame: number,
  phaseOffset: number = 0,
  side: "right" | "left" = "right"
): { elbow: Point2D; wrist: Point2D } {
  const dir = side === "right" ? 1 : -1;
  const upperArmDeg = -115;
  const forearmDeg = -150 + Math.sin(frame * 0.28 + phaseOffset) * 28;
  const uRad = (upperArmDeg * Math.PI) / 180;
  const fRad = (forearmDeg * Math.PI) / 180;

  const elbow: Point2D = {
    x: shoulderUpper.x - Math.sin(uRad) * ARM_L1 * dir,
    y: shoulderUpper.y + Math.cos(uRad) * ARM_L1,
  };
  const wrist: Point2D = {
    x: elbow.x - Math.sin(fRad) * ARM_L2 * dir,
    y: elbow.y + Math.cos(fRad) * ARM_L2,
  };
  return { elbow, wrist };
}

/**
 * Tính toán động học 2 cánh tay chuẩn Sinh Cơ Học Con Lắc & Tách Kênh Cầm Nắm
 */
export function computeStickmanArmsUpper(
  state: StickmanState,
  shoulderUpper: Point2D,
  hipY: number,
  torsoRad: number,
  scale: number,
  flipSign: number,
  x: number,
  y: number,
  frame: number = 0
): {
  leftWristUpper: Point2D;
  leftElbowUpper: Point2D;
  rightWristUpper: Point2D;
  rightElbowUpper: Point2D;
} {
  const {
    pose = "standing",
    walkCycleProgress = 0,
    holdingTarget,
    pointingTarget,
    limbAngles,
    crouchDepth = 0,
    flightLift = 0,
  } = state;

  const cosTorso = Math.cos(torsoRad);
  const sinTorso = Math.sin(torsoRad);
  const torsoAngleDeg = (torsoRad * 180) / Math.PI;

  const facingFactorVal = state.facingFactor !== undefined
    ? state.facingFactor
    : (state.facing === "left" ? -1 : 1);
  const sideProfile = Math.min(1, Math.abs(facingFactorVal));
  const localFacingFactor = sideProfile < 0.15 ? 0 : 1;

  const isWalking = (pose === "walking" || pose === "running" || walkCycleProgress > 0);
  const isRunning = pose === "running";
  const walkPhase = walkCycleProgress * Math.PI * 2;
  const walkWeightVal = state.walkWeight !== undefined ? state.walkWeight : (isWalking ? 1.0 : 0);

  const pendulumArmsFull = resolvePendulumArms(walkPhase, walkWeightVal, localFacingFactor, isRunning);
  const pendulumArmsSingle = resolvePendulumArms(walkPhase, walkWeightVal * 0.65, localFacingFactor, isRunning);

  const upperArmLen = ARM_L1;
  const forearmLen = ARM_L2;
  const isFrontBoth = (state as any).renderPart === "frontArmsBoth";

  let leftWristUpper: Point2D;
  let leftElbowUpper: Point2D;
  let rightWristUpper: Point2D;
  let rightElbowUpper: Point2D;

  if (pose === "jumping" || flightLift > 15) {
    // 1. Khi nhảy trên không (flightLift > 0): Tay vung ngang ngực - vai phía trước (handY >= shoulderY + 18), khuỷu tay chúc xuống sườn
    leftWristUpper = { x: 30, y: shoulderUpper.y + 24 };
    rightWristUpper = { x: 50, y: shoulderUpper.y + 24 };
    leftElbowUpper = solve2JointIK(shoulderUpper, leftWristUpper, upperArmLen, forearmLen, -1);
    rightElbowUpper = solve2JointIK(shoulderUpper, rightWristUpper, upperArmLen, forearmLen, -1);
  } else if ((pose === "crouching" || crouchDepth > 5) && torsoAngleDeg <= 18 && !holdingTarget) {
    // 2. Khi nhún tiếp đất hoặc nhún đà (landing cushion): Hai bàn tay mở nhẹ về trước-dưới, khuỷu tay cong mềm mại về sau-dưới (XÓA BỎ TAY CÀNG CUA)
    leftWristUpper = { x: 20, y: shoulderUpper.y + 80 };
    rightWristUpper = { x: 44, y: shoulderUpper.y + 80 };
    leftElbowUpper = solve2JointIK(shoulderUpper, leftWristUpper, upperArmLen, forearmLen, -1);
    rightElbowUpper = solve2JointIK(shoulderUpper, rightWristUpper, upperArmLen, forearmLen, -1);
  } else if (pose === "crouching" && !holdingTarget) {
    // Cúi sâu không cầm vật (ví dụ tập thể dục)
    leftWristUpper = { x: -50, y: shoulderUpper.y + 105 };
    rightWristUpper = { x: 50, y: shoulderUpper.y + 105 };
    leftElbowUpper = solve2JointIK(shoulderUpper, leftWristUpper, upperArmLen, forearmLen, -1);
    rightElbowUpper = solve2JointIK(shoulderUpper, rightWristUpper, upperArmLen, forearmLen, 1);
  } else if (pose === "pointing" && pointingTarget) {
    const dx = ((pointingTarget.x - x) / scale) * flipSign;
    const dy = (pointingTarget.y - y) / scale - hipY - shoulderUpper.y;
    const len = Math.hypot(dx, dy) || 1;
    rightWristUpper = {
      x: (dx / len) * 130,
      y: shoulderUpper.y + (dy / len) * 130,
    };
    rightElbowUpper = solve2JointIK(shoulderUpper, rightWristUpper, upperArmLen, forearmLen, 1);
    leftWristUpper = {
      x: pendulumArmsFull.leftArm.handRel.x,
      y: shoulderUpper.y + pendulumArmsFull.leftArm.handRel.y,
    };
    leftElbowUpper = {
      x: pendulumArmsFull.leftArm.elbowRel.x,
      y: shoulderUpper.y + pendulumArmsFull.leftArm.elbowRel.y,
    };
  } else if (pose === "pointing") {
    rightWristUpper = { x: 125, y: shoulderUpper.y - 25 };
    rightElbowUpper = solve2JointIK(shoulderUpper, rightWristUpper, upperArmLen, forearmLen, 1);
    leftWristUpper = {
      x: pendulumArmsFull.leftArm.handRel.x,
      y: shoulderUpper.y + pendulumArmsFull.leftArm.handRel.y,
    };
    leftElbowUpper = {
      x: pendulumArmsFull.leftArm.elbowRel.x,
      y: shoulderUpper.y + pendulumArmsFull.leftArm.elbowRel.y,
    };
  } else if (pose === "waving") {
    // V14.1: Vẫy tay liên tục 60fps bằng nội suy lượng giác (cánh tay trên -115°, cẳng tay -150° + sin(frame*0.28)*28°)
    const smoothWave = computeSmooth60fpsWaveArm(
      shoulderUpper,
      frame > 0 ? frame : (walkCycleProgress || 0) * 180,
      state.wavePhaseOffset ?? 0,
      "right"
    );
    rightElbowUpper = smoothWave.elbow;
    rightWristUpper = smoothWave.wrist;
    leftWristUpper = {
      x: pendulumArmsFull.leftArm.handRel.x,
      y: shoulderUpper.y + pendulumArmsFull.leftArm.handRel.y,
    };
    leftElbowUpper = {
      x: pendulumArmsFull.leftArm.elbowRel.x,
      y: shoulderUpper.y + pendulumArmsFull.leftArm.elbowRel.y,
    };
  } else {
    // Locomotion (Walk / Run / Stand)
    leftWristUpper = {
      x: pendulumArmsFull.leftArm.handRel.x,
      y: shoulderUpper.y + pendulumArmsFull.leftArm.handRel.y,
    };
    leftElbowUpper = {
      x: pendulumArmsFull.leftArm.elbowRel.x,
      y: shoulderUpper.y + pendulumArmsFull.leftArm.elbowRel.y,
    };
    rightWristUpper = {
      x: pendulumArmsFull.rightArm.handRel.x,
      y: shoulderUpper.y + pendulumArmsFull.rightArm.handRel.y,
    };
    rightElbowUpper = {
      x: pendulumArmsFull.rightArm.elbowRel.x,
      y: shoulderUpper.y + pendulumArmsFull.rightArm.elbowRel.y,
    };
  }

  // TÁCH KÊNH CẦM NẮM (HOLDING TARGET)
  // Khi 1 tay cầm vật (ví dụ tay phải ôm táo), tay còn lại tiếp tục đung đưa tự nhiên (0.65 * walkWeight)!
  if (holdingTarget) {
    if (holdingTarget.leftGrip) {
      const dxL = ((holdingTarget.leftGrip.x - x) / scale) * flipSign;
      const dyL = (holdingTarget.leftGrip.y - y) / scale - hipY;
      leftWristUpper = {
        x: dxL * cosTorso + dyL * sinTorso,
        y: -dxL * sinTorso + dyL * cosTorso,
      };
      const isLeftRaised = leftWristUpper.y < shoulderUpper.y;
      const isLeftHoldingInFront = !isFrontBoth && leftWristUpper.x > 10;
      const leftBend = isLeftRaised ? 1 : (isLeftHoldingInFront ? -1 : -1);
      leftElbowUpper = solve2JointIK(
        shoulderUpper,
        leftWristUpper,
        upperArmLen,
        forearmLen,
        leftBend
      );
      // HOTFIX V7.2: Bảo đảm khuỷu tay gập chữ L chúc xuống sườn khi tay ở tầm ngực/bàn phím (wrist.y >= shoulderUpper.y - 15)
      // Tuyệt đối không cho khuỷu tay vồng lên cao ngang mặt/cổ (elbow.y < shoulder.y + 20) hoặc nhô về phía trước quá cổ tay (elbow.x > wrist.x)
      if (!isLeftRaised && leftWristUpper.y >= shoulderUpper.y - 15) {
        if (leftElbowUpper.y < shoulderUpper.y + 20 || (leftWristUpper.x > 10 && leftElbowUpper.x > leftWristUpper.x)) {
          const altElbow = solve2JointIK(shoulderUpper, leftWristUpper, upperArmLen, forearmLen, -leftBend);
          if (altElbow.y > leftElbowUpper.y) {
            leftElbowUpper = altElbow;
          }
        }
      }
    } else if (holdingTarget.rightGrip) {
      // Tay phải cầm vật, tay trái rảnh
      if (torsoAngleDeg > 18) {
        // Cúi người nhặt táo (f340 - f420): Tay trái buông tự nhiên dọc trọng lực xuống dưới vai (không chĩa ngược lên trời)
        const unrotX = -12 * cosTorso + 95 * sinTorso;
        const unrotY = 12 * sinTorso + 95 * cosTorso;
        leftWristUpper = {
          x: shoulderUpper.x + unrotX,
          y: shoulderUpper.y + unrotY,
        };
        leftElbowUpper = solve2JointIK(shoulderUpper, leftWristUpper, upperArmLen, forearmLen, -1);
      } else if (walkWeightVal > 0.08) {
        // V12.1: Khi vừa bước đi vừa cầm vật bằng tay phải (ví dụ đèn pin), tay trái tự do vung đánh nhịp rõ nét đồng bộ pha bước chân!
        const armSwingSin = Math.sin(walkPhase + Math.PI); // Đối pha với chân trái
        const handXSwing = armSwingSin * 58 * walkWeightVal - 14 * (1 - walkWeightVal);
        const handYSwing = shoulderUpper.y + 104 - Math.abs(armSwingSin) * 16 * walkWeightVal;
        leftWristUpper = {
          x: handXSwing,
          y: handYSwing,
        };
        leftElbowUpper = solve2JointIK(shoulderUpper, leftWristUpper, upperArmLen, forearmLen, -1);
      } else {
        // Đứng yên cầm vật: tay trái thả tự nhiên tách nhẹ sau lưng, không chập vào thân
        leftWristUpper = {
          x: -24,
          y: shoulderUpper.y + 114,
        };
        leftElbowUpper = {
          x: -15,
          y: shoulderUpper.y + 62,
        };
      }
    }

    if (holdingTarget.rightGrip) {
      const dxR = ((holdingTarget.rightGrip.x - x) / scale) * flipSign;
      const dyR = (holdingTarget.rightGrip.y - y) / scale - hipY;
      rightWristUpper = {
        x: dxR * cosTorso + dyR * sinTorso,
        y: -dxR * sinTorso + dyR * cosTorso,
      };
      const isRightRaised = rightWristUpper.y < shoulderUpper.y;
      const isRightHoldingInFront = !isFrontBoth && rightWristUpper.x > 10;
      const rightBend = isRightRaised ? -1 : (isRightHoldingInFront ? -1 : 1);
      rightElbowUpper = solve2JointIK(
        shoulderUpper,
        rightWristUpper,
        upperArmLen,
        forearmLen,
        rightBend
      );
      // HOTFIX V7.2: Bảo đảm khuỷu tay gập chữ L chúc xuống sườn khi tay ở tầm ngực/bàn phím (wrist.y >= shoulderUpper.y - 15)
      // Tuyệt đối không cho khuỷu tay vồng lên cao ngang mặt/cổ (elbow.y < shoulder.y + 20) hoặc nhô về phía trước quá cổ tay (elbow.x > wrist.x)
      if (!isRightRaised && rightWristUpper.y >= shoulderUpper.y - 15) {
        if (rightElbowUpper.y < shoulderUpper.y + 20 || (rightWristUpper.x > 10 && rightElbowUpper.x > rightWristUpper.x)) {
          const altElbow = solve2JointIK(shoulderUpper, rightWristUpper, upperArmLen, forearmLen, -rightBend);
          if (altElbow.y > rightElbowUpper.y) {
            rightElbowUpper = altElbow;
          }
        }
      }
    } else if (holdingTarget.leftGrip) {
      // Tay trái cầm vật, tay phải rảnh -> đung đưa tự nhiên theo pendulumArmsSingle
      rightWristUpper = {
        x: pendulumArmsSingle.rightArm.handRel.x,
        y: shoulderUpper.y + pendulumArmsSingle.rightArm.handRel.y,
      };
      rightElbowUpper = {
        x: pendulumArmsSingle.rightArm.elbowRel.x,
        y: shoulderUpper.y + pendulumArmsSingle.rightArm.elbowRel.y,
      };
    }
  }

  // Ghi đè góc chi tiết (nếu có từ Animation Keyframes và không có holdingTarget)
  if (limbAngles?.leftUpperArm !== undefined && !holdingTarget?.leftGrip) {
    const rad = (limbAngles.leftUpperArm * Math.PI) / 180;
    const armReach = ARM_L1 + ARM_L2 - 2;
    const calcX = -Math.sin(rad) * armReach;
    const calcY = shoulderUpper.y + Math.cos(rad) * armReach;
    leftWristUpper = { x: calcX, y: calcY };
    leftElbowUpper = solve2JointIK(shoulderUpper, leftWristUpper, upperArmLen, forearmLen, -1);
  }
  if (limbAngles?.rightUpperArm !== undefined && !holdingTarget?.rightGrip) {
    const rad = (limbAngles.rightUpperArm * Math.PI) / 180;
    const armReach = ARM_L1 + ARM_L2 - 2;
    const calcX = Math.sin(rad) * armReach;
    const calcY = shoulderUpper.y + Math.cos(rad) * armReach;
    rightWristUpper = { x: calcX, y: calcY };
    rightElbowUpper = solve2JointIK(shoulderUpper, rightWristUpper, upperArmLen, forearmLen, 1);
  }

  // V18.2: Ưu tiên khớp tay đã nội suy mượt 10 frames (blendedArmPose), kế tiếp là v18ActionPose / handsOnHips
  const v18Arms = state.blendedArmPose
    ? {
        leftElbow: state.blendedArmPose.leftElbow,
        leftWrist: state.blendedArmPose.leftWrist,
        rightElbow: state.blendedArmPose.rightElbow,
        rightWrist: state.blendedArmPose.rightWrist,
        allowNearHead: Boolean(state.blendedArmPose.allowNearHead),
      }
    : computeV18ActionArmsUpper(
        state.v18ActionPose,
        state.handsOnHips,
        shoulderUpper,
        frame,
        state.v18LocalFrame ?? frame,
        state.v18SegmentProgress ?? 0.5
      );
  if (v18Arms) {
    leftElbowUpper = v18Arms.leftElbow;
    leftWristUpper = v18Arms.leftWrist;
    rightElbowUpper = v18Arms.rightElbow;
    rightWristUpper = v18Arms.rightWrist;
  }

  // V14.1: Cho phép vừa bước đi (hoặc đứng cười) vừa vẫy tay mượt 60fps độc lập theo kênh waveRightArm / waveLeftArm
  const isWaveRight = Boolean(state.waveRightArm || pose === "waving");
  const isWaveLeft = Boolean(state.waveLeftArm);

  if (state.waveRightArm && !holdingTarget?.rightGrip && !v18Arms) {
    const waveR = computeSmooth60fpsWaveArm(shoulderUpper, frame, state.wavePhaseOffset ?? 0, "right");
    rightElbowUpper = waveR.elbow;
    rightWristUpper = waveR.wrist;
    // Khi đứng yên vẫy tay phải, mở nhẹ tay trái tách khỏi trục thân để silhouette người que thoáng sạch 100%
    if (!holdingTarget?.leftGrip && walkWeightVal < 0.08) {
      leftElbowUpper = { x: -24, y: shoulderUpper.y + 56 };
      leftWristUpper = { x: -42, y: shoulderUpper.y + 112 };
    }
  }
  if (state.waveLeftArm && !holdingTarget?.leftGrip && !v18Arms) {
    const waveL = computeSmooth60fpsWaveArm(shoulderUpper, frame, state.wavePhaseOffset ?? 0, "left");
    leftElbowUpper = waveL.elbow;
    leftWristUpper = waveL.wrist;
  }

  // Khóa vùng an toàn Đầu: trừ lúc giơ cao ăn mừng/vẫy tay hoặc tư thế V18 chủ động chạm gần đầu (gãi đầu, úp trán, uống nước, ngáp vươn vai...)
  const allowNearHead = Boolean(v18Arms?.allowNearHead);
  if (!isWaveLeft && !allowNearHead && leftWristUpper.y > shoulderUpper.y - 75) {
    leftWristUpper = { x: leftWristUpper.x, y: Math.max(shoulderUpper.y + 16, leftWristUpper.y) };
    leftElbowUpper = { x: leftElbowUpper.x, y: Math.max(shoulderUpper.y + 24, leftElbowUpper.y) };
  }
  if (!isWaveRight && !allowNearHead && rightWristUpper.y > shoulderUpper.y - 75) {
    rightWristUpper = { x: rightWristUpper.x, y: Math.max(shoulderUpper.y + 16, rightWristUpper.y) };
    rightElbowUpper = { x: rightElbowUpper.x, y: Math.max(shoulderUpper.y + 24, rightElbowUpper.y) };
  }

  // Khóa cứng độ dài bắp tay (65px) và cẳng tay (58px) tuyệt đối 100% ở bước cuối cùng
  // (Riêng kênh vẫy tay FK đã bảo toàn tuyệt đối chiều dài ARM_L1 & ARM_L2 bằng lượng giác nên giữ nguyên 100% không bị lật khuỷu!)
  const rigidLeft = isWaveLeft
    ? { joint: leftElbowUpper, end: leftWristUpper }
    : enforceRigidTwoBoneIK(shoulderUpper, leftWristUpper, ARM_L1, ARM_L2, -1, leftElbowUpper);
  const rigidRight = isWaveRight
    ? { joint: rightElbowUpper, end: rightWristUpper }
    : enforceRigidTwoBoneIK(shoulderUpper, rightWristUpper, ARM_L1, ARM_L2, -1, rightElbowUpper);

  return {
    leftWristUpper: rigidLeft.end,
    leftElbowUpper: rigidLeft.joint,
    rightWristUpper: rigidRight.end,
    rightElbowUpper: rigidRight.joint,
  };
}

/**
 * Hàm tính toán Động học Thuận (Forward Kinematics) chuẩn 6 bộ phận cơ bản
 * 1 Đầu (Head r=54) + 1 Thân (Torso line) + 2 Tay (chung vai 0, shoulderY) + 2 Chân (chung hông 0, hipY)
 */
export function computeStickmanFK(
  state: StickmanState,
  breathScale: number = 1.0
): StickmanAnchors {
  const {
    x,
    y,
    scale = 1,
    facing = "right",
    pose = "standing",
    walkCycleProgress = 0,
    limbAngles,
  } = state;

  const headRadius = 54;
  const effectiveTorsoLen = TORSO_LEN * breathScale; // Hông -> Vai = 115px bất biến
  const standingLegLength = LEG_L1 + LEG_L2; // 175px bất biến

  const crouchDepth = state.crouchDepth ?? (pose === "crouching" ? 45 : 0);
  const flightLift = state.flightLift ?? 0;
  const isSitting = pose === "sittingBehindDesk";
  const weight = state.walkWeight !== undefined ? state.walkWeight : 1.0;
  const isWalking = (pose === "walking" || pose === "running" || walkCycleProgress > 0) && weight > 0.02;

  const torsoAngle = state.torsoTiltDeg !== undefined ? state.torsoTiltDeg : (limbAngles?.torso ?? 0);
  const torsoRad = (torsoAngle * Math.PI) / 180;
  const cosTorso = Math.cos(torsoRad);
  const sinTorso = Math.sin(torsoRad);

  const { hipY, leftFoot, rightFoot, leftKnee, rightKnee } = computeLegsAndHip(
    standingLegLength,
    crouchDepth,
    flightLift,
    pose,
    isWalking,
    walkCycleProgress,
    weight,
    torsoAngle,
    isSitting,
    state.seatedHipY,
    state.leftFootOffset,
    state.rightFootOffset,
    state.leftKneeOffset,
    state.rightKneeOffset,
    state.customHipY
  );
  const hip: Point2D = { x: 0, y: hipY };

  const shoulderUpper: Point2D = { x: 0, y: -effectiveTorsoLen };
  const neckUpper: Point2D = { x: 0, y: -effectiveTorsoLen - 16 };
  const headCenterUpper: Point2D = { x: 0, y: -effectiveTorsoLen - 16 - headRadius };

  const rotateUpperPoint = (p: Point2D): Point2D => ({
    x: p.x * cosTorso - p.y * sinTorso,
    y: hip.y + p.x * sinTorso + p.y * cosTorso,
  });

  const neck = rotateUpperPoint(neckUpper);
  const headCenter = rotateUpperPoint(headCenterUpper);
  const shoulder = rotateUpperPoint(shoulderUpper);

  const flipSign = facing === "left" ? -1 : 1;

  // Tính toán cánh tay chuẩn xác
  const { leftWristUpper, leftElbowUpper, rightWristUpper, rightElbowUpper } = computeStickmanArmsUpper(
    state,
    shoulderUpper,
    hip.y,
    torsoRad,
    scale,
    flipSign,
    x,
    y
  );

  const leftWrist = rotateUpperPoint(leftWristUpper);
  const rightWrist = rotateUpperPoint(rightWristUpper);
  const leftElbowWorld = rotateUpperPoint(leftElbowUpper);
  const rightElbowWorld = rotateUpperPoint(rightElbowUpper);

  return {
    root: { x, y },
    headCenter: { x: x + headCenter.x * scale * flipSign, y: y + headCenter.y * scale },
    mouth: { x: x + headCenter.x * scale * flipSign, y: y + (headCenter.y + 26) * scale },
    neck: { x: x + neck.x * scale * flipSign, y: y + neck.y * scale },
    hip: { x: x + hip.x * scale * flipSign, y: y + hip.y * scale },
    leftShoulder: { x: x + shoulder.x * scale * flipSign, y: y + shoulder.y * scale },
    rightShoulder: { x: x + shoulder.x * scale * flipSign, y: y + shoulder.y * scale },
    leftElbow: {
      x: x + leftElbowWorld.x * scale * flipSign,
      y: y + leftElbowWorld.y * scale,
    },
    rightElbow: {
      x: x + rightElbowWorld.x * scale * flipSign,
      y: y + rightElbowWorld.y * scale,
    },
    leftWrist: { x: x + leftWrist.x * scale * flipSign, y: y + leftWrist.y * scale },
    rightWrist: { x: x + rightWrist.x * scale * flipSign, y: y + rightWrist.y * scale },
    leftHand: { x: x + leftWrist.x * scale * flipSign, y: y + leftWrist.y * scale },
    rightHand: { x: x + rightWrist.x * scale * flipSign, y: y + rightWrist.y * scale },
    leftHip: { x: x + hip.x * scale * flipSign, y: y + hip.y * scale },
    rightHip: { x: x + hip.x * scale * flipSign, y: y + hip.y * scale },
    leftKnee: {
      x: x + leftKnee.x * scale * flipSign,
      y: y + leftKnee.y * scale,
    },
    rightKnee: {
      x: x + rightKnee.x * scale * flipSign,
      y: y + rightKnee.y * scale,
    },
    leftFoot: { x: x + leftFoot.x * scale * flipSign, y: y + leftFoot.y * scale },
    rightFoot: { x: x + rightFoot.x * scale * flipSign, y: y + rightFoot.y * scale },
  };
}

/**
 * StickmanRig: Chuẩn Người Que Tối Giản 6 Bộ Phận Cơ Bản
 * 1. 1 Đầu tròn (Head) r=54 viền 12px
 * 2. 1 Thân thẳng (Torso) từ đáy đầu (0, neckY) xuống hông (0, hipY)
 * 3. 2 Tay thẳng (Arms) xuất phát từ cùng 1 điểm vai (0, shoulderY)
 * 4. 2 Chân thẳng (Legs) xuất phát từ cùng 1 điểm hông (0, hipY) chữ Λ
 */
export const StickmanRig: React.FC<StickmanRigProps> = ({
  state,
  archetype,
  characterPreset,
  appearance,
  renderPart = "all",
  parts,
  frame = 0,
  breathScale = 1.0,
  breathScaleY = 1.0,
  showDebugMarkers = false,
  onAnchorsComputed,
}) => {
  const effectiveAppearance: StickmanAppearance | undefined = appearance ?? state.appearance;
  const hasAppearance = hasStickmanAppearanceOverrides(effectiveAppearance);
  const resolvedPreset: CharacterPreset | undefined =
    characterPreset || state.characterPreset || (hasAppearance ? "CUSTOM" : undefined);
  const activeArchetype: CharacterArchetype =
    resolvedPreset || archetype || state.archetype || (state.hat !== false ? "oldMan" : "default");

  const {
    x,
    y,
    facing = "right",
    pose = "standing",
    walkCycleProgress = 0,
    holdingTarget,
    pointingTarget,
    limbAngles,
  } = state;
  const scale =
    state.scale !== undefined ? state.scale : resolvePresetDefaultScale(activeArchetype, effectiveAppearance);

  // V18.3: Chuyển động run rẩy tiết chế theo shiverOpacity (tự tắt mượt sau 30 frames / 0.5s!)
  const shiverOpacity = state.shiverOpacity !== undefined ? Math.max(0, Math.min(1, state.shiverOpacity)) : 1.0;
  const isShivering = Boolean(state.shiver) && shiverOpacity > 0.02;
  const shiverFrame = state.shiverFrame ?? frame;
  const shiverMotion = isShivering ? computeComicShiverMotion(shiverFrame) : null;
  const effectiveX = x + (shiverMotion ? shiverMotion.swayX * shiverOpacity : 0);
  const shiverStrokeColor = state.shiverDarkStage
    ? COMIC_SHIVER_CONFIG.DARK_STAGE_COLOR
    : COMIC_SHIVER_CONFIG.LIGHT_STAGE_COLOR;

  const isPureStickmanPreset = Boolean(
    resolvedPreset ||
      hasAppearance ||
      activeArchetype === "CUSTOM" ||
      activeArchetype === "BOY" ||
      activeArchetype === "GRANDPA" ||
      activeArchetype === "GRANDMA" ||
      activeArchetype === "DOCTOR" ||
      activeArchetype === "NEIGHBOR"
  );
  // V14.0: Nét đen tròn đặc sắc nét (strokeWidth: 6px cho Người Que Thuần), tuyệt đối bỏ viền sáng rỗng ruột quanh chân tay!
  const limbStroke = state.limbStrokeWidth ?? (isPureStickmanPreset ? 6 : 10);
  const headStroke = isPureStickmanPreset ? 5.5 : 10;

  const isDebug = Boolean(showDebugMarkers || state.showDebugMarkers);

  const headRadius = 54;
  const effectiveTorsoLen = TORSO_LEN * breathScale; // Hông -> Vai = 115px bất biến
  const standingLegLength = LEG_L1 + LEG_L2; // 175px bất biến

  const crouchDepth = state.crouchDepth ?? (pose === "crouching" ? 45 : 0);
  const flightLift = state.flightLift ?? 0;

  const isSitting = pose === "sittingBehindDesk";
  const flipSign = facing === "left" ? -1 : 1;
  const weight = state.walkWeight !== undefined ? state.walkWeight : 1.0;
  const isWalking = (pose === "walking" || pose === "running" || walkCycleProgress > 0) && weight > 0.02;

  const torsoAngle = state.torsoTiltDeg !== undefined ? state.torsoTiltDeg : (state.limbAngles?.torso ?? 0);
  const torsoRad = (torsoAngle * Math.PI) / 180;
  const cosTorso = Math.cos(torsoRad);
  const sinTorso = Math.sin(torsoRad);

  const { hipY, leftFoot, rightFoot, leftKnee, rightKnee } = computeLegsAndHip(
    standingLegLength,
    crouchDepth,
    flightLift,
    pose,
    isWalking,
    walkCycleProgress,
    weight,
    torsoAngle,
    isSitting,
    state.seatedHipY,
    state.leftFootOffset,
    state.rightFootOffset,
    state.leftKneeOffset,
    state.rightKneeOffset,
    state.customHipY
  );
  const hip: Point2D = { x: 0, y: hipY };

  const shoulderUpper: Point2D = { x: 0, y: -effectiveTorsoLen };
  const neckUpper: Point2D = { x: 0, y: -effectiveTorsoLen - 16 };
  const headCenterUpper: Point2D = { x: 0, y: -effectiveTorsoLen - 16 - headRadius };

  // =========================================================================
  // 1. TÍNH TOÁN TỌA ĐỘ 2 CÁNH TAY THEO SINH CƠ HỌC CON LẮC & TÁCH KÊNH CẦM
  // =========================================================================
  const { leftWristUpper, leftElbowUpper, rightWristUpper, rightElbowUpper } = computeStickmanArmsUpper(
    state,
    shoulderUpper,
    hip.y,
    torsoRad,
    scale,
    flipSign,
    effectiveX,
    y,
    frame
  );

  // V18.2–V21.0 Living Scene Rule: Nhịp thở nhẹ khi đứng yên (~1.2–1.8px ở vai/thân, chân chạm đất cố định) + Chớp mắt tự nhiên
  const enableIdleLife = state.enableIdleLife ?? isPureStickmanPreset;
  const stableSeed = state.blinkSeed !== undefined ? Math.abs(Math.floor(state.blinkSeed)) : (activeArchetype.charCodeAt(0) || 1);
  const idleBreathFactor = computeStickmanIdleBreathFactor(
    frame,
    stableSeed,
    enableIdleLife,
    isWalking ? weight : 0
  );
  const effectiveBreathScaleY = breathScaleY * idleBreathFactor * (state.anticipationScaleY ?? 1.0);

  const v18FallbackNodDeg =
    state.v18ActionPose === "NOD_SMILE" && state.headTiltDeg === undefined
      ? computeGentleDoubleNodDeg(state.v18LocalFrame ?? frame)
      : 0;
  const nodDeg =
    state.v18ActionPose === "NOD_SMILE" || state.v18ActionPose === "SIP_DRINK"
      ? 0
      : state.nodAmplitudeDeg
      ? Math.sin(frame * (state.nodFreq ?? 0.12)) * state.nodAmplitudeDeg
      : 0;
  const headAngle = (state.headTiltDeg ?? 0) + (limbAngles?.head ?? 0) + nodDeg + v18FallbackNodDeg;

  // V21.0 Natural Blink: Chu kỳ 210..270 frames (3.5s–4.5s @ 60fps), nhắm mở nhanh 4–5 frames, lệch pha theo actor/preset
  const blinkPeriod = 210 + ((stableSeed * 23) % 61);
  const blinkDuration = 4 + (stableSeed % 2);
  const blinkCycleFrame = (Math.max(0, Math.floor(frame)) + stableSeed * 53) % blinkPeriod;
  const isNaturalBlink =
    enableIdleLife &&
    blinkCycleFrame >= blinkPeriod - blinkDuration &&
    state.eyes !== "closed";
  const effectiveEyes = isNaturalBlink ? "closed" : state.eyes;

  // V15.0–V21.0 Lip-Sync & Biểu cảm chuẩn xác:
  // - Khi đang ở pose SIP_DRINK (hoặc mouth === "sip"): luôn giữ miệng tròn nhỏ (o) ngậm ống hút, tuyệt đối không cười!
  // - Khi có bubble đang hiển thị (isSpeaking = true) HOẶC pose === "TALK_GESTURE": miệng mấp máy theo nhịp chậm êm tự nhiên,
  //   bảo toàn sắc thái Sợ/Lo lắng/Ngạc nhiên/Tò mò, tuyệt đối không fallback về "smile"!
  const talkPhaseSeed = (stableSeed % 17) * 0.37;
  const lipSyncWave =
    Math.sin(frame * 0.24 + talkPhaseSeed) + 0.35 * Math.sin(frame * 0.11 + talkPhaseSeed * 1.7);
  const lipSyncOpen = lipSyncWave > 0.12;
  const isMouthTalking = Boolean(state.isSpeaking || state.v18ActionPose === "TALK_GESTURE");
  const baseMouth: MouthExpression =
    state.v18ActionPose === "SIP_DRINK"
      ? "sip"
      : state.mouth ??
        (state.eyes === "surprised"
          ? "gasp"
          : state.eyebrows === "worried" || state.eyebrows === "furrowed"
          ? "frown"
          : state.eyebrows === "inquisitive"
          ? "line"
          : "smile");

  const effectiveMouth: MouthExpression =
    baseMouth === "sip"
      ? "sip"
      : isMouthTalking
      ? baseMouth === "gasp"
        ? lipSyncOpen
          ? "gasp"
          : "circleOpen"
        : baseMouth === "worried"
        ? lipSyncOpen
          ? "circleOpen"
          : "worried"
        : baseMouth === "frown"
        ? lipSyncOpen
          ? "circleOpen"
          : "frown"
        : baseMouth === "circleOpen"
        ? lipSyncOpen
          ? "circleOpen"
          : "line"
        : baseMouth === "line"
        ? lipSyncOpen
          ? "circleOpen"
          : "line"
        : lipSyncOpen
        ? "talking"
        : "smile"
      : baseMouth;

  React.useEffect(() => {
    if (onAnchorsComputed) {
      const fkAnchors = computeStickmanFK(state, breathScale);
      onAnchorsComputed(fkAnchors);
    }
  }, [state, breathScale, onAnchorsComputed]);

  const turnScaleX = state.turnScaleX !== undefined ? state.turnScaleX : 1.0;
  const effectiveScaleX = scale * (facing === "left" ? -1 : 1) * turnScaleX;

  return (
    <g
      id="stickman-rig-wrapper"
      transform={`translate(${effectiveX.toFixed(2)}, ${y}) scale(${effectiveScaleX.toFixed(4)}, ${(scale * effectiveBreathScaleY).toFixed(4)})`}
      data-character-pose={pose}
    >
      {/* BÓNG ĐỔ MẶT SÀN BIẾN THIÊN THEO ĐỘ CAO (DYNAMIC GROUND SHADOW) */}
      {(renderPart === "all" || renderPart === "bodyOnly" || renderPart === "legsOnly") && (() => {
        const flightLiftVal = state.flightLift ?? 0;
        const shadowScale = Math.max(0.45, 1 - flightLiftVal / 260);
        const shadowOpacity = Math.max(0.06, 0.16 * shadowScale);
        return (
          <ellipse
            cx={0}
            cy={0}
            rx={60 * shadowScale}
            ry={10 * shadowScale}
            fill="#000000"
            opacity={shadowOpacity}
          />
        );
      })()}

      {/* =========================================================================
          4. HAI CHÂN (LEFT LEG & RIGHT LEG): 1 SỢI <PATH> LIỀN NÉT CÓ ĐẦU GỐI
             Hông (0, hip.y) -> Đầu gối -> Bàn chân (0% hở khớp, round join)
         ========================================================================= */}
      {(renderPart === "all" || renderPart === "bodyOnly" || renderPart === "legsOnly") && (
        <g id="layer-character-legs">
          {/* V14.0: Không vẽ viền sáng bao ngoài làm rỗng ruột chân tay — luôn là nét đen đặc sắc nét */}
          {/* Chân trái */}
          <path
            d={`M 0 ${hip.y} L ${leftKnee.x} ${leftKnee.y} L ${leftFoot.x} ${leftFoot.y}`}
            fill="none"
            stroke="#141414"
            strokeWidth={limbStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Chân phải */}
          <path
            d={`M 0 ${hip.y} L ${rightKnee.x} ${rightKnee.y} L ${rightFoot.x} ${rightFoot.y}`}
            fill="none"
            stroke="#141414"
            strokeWidth={limbStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* =========================================================================
          UPPER BODY: XOAY THEO GÓC NGHIÊNG THÂN torsoAngle QUANH HÔNG (0, hip.y)
         ========================================================================= */}
      {(renderPart === "all" || renderPart === "bodyOnly" || renderPart === "armsOnly" || renderPart === "backArmOnly" || renderPart === "frontArmOnly" || renderPart === "frontArmsBoth") && (
        <g id="layer-character-upper-body" transform={`translate(0, ${hip.y}) rotate(${torsoAngle})`}>
          {/* 2. THÂN (TORSO): Nét đen tròn đặc (6px cho Người Que Thuần) hoặc trang phục Preset nhẹ */}
          {(renderPart === "all" || renderPart === "bodyOnly") && (
            <g id="layer-character-torso-head">
              <TorsoOutfitRenderer
                archetype={activeArchetype}
                appearance={effectiveAppearance}
                neckX={0}
                neckY={neckUpper.y}
                hipX={0}
                hipY={0}
                strokeWidth={limbStroke}
              />

              {/* 1. ĐẦU (HEAD): Đầu tròn trắng lớn r=54 có vầng bóng đổ 3D lưỡi liềm nhẹ (#CBD5E1) */}
              <g id="neck-head-cluster" transform={`translate(0, ${headCenterUpper.y}) rotate(${headAngle})`}>
                {parts?.head ? (
                  parts.head
                ) : (
                  <g id="default-stickman-head">
                    <HeadBackAccessories
                      archetype={activeArchetype}
                      appearance={effectiveAppearance}
                      headCenterY={0}
                      headRadius={headRadius}
                      facingDir={flipSign}
                    />
                    <circle cx={0} cy={0} r={headRadius} fill="#FFFFFF" />
                    {/* V16.0: Dải inner shading viền trong hình tròn đầu tinh tế, sạch mắt (thay cho nét cằm xám cũ) */}
                    <path
                      d={`M -8,${-headRadius + 4} A ${headRadius - 4},${headRadius - 4} 0 0,0 -8,${
                        headRadius - 4
                      } A ${headRadius - 12},${headRadius - 4} 0 0,1 -8,${-headRadius + 4} Z`}
                      fill="#E2E8F0"
                      opacity={0.48}
                    />
                    <path
                      d={`M 14,${-headRadius + 9} A ${headRadius - 10},${headRadius - 10} 0 0,1 ${
                        headRadius - 11
                      },-10`}
                      fill="none"
                      stroke="#F8FAFC"
                      strokeWidth={4}
                      strokeLinecap="round"
                      opacity={0.9}
                    />
                    <circle cx={0} cy={0} r={headRadius} fill="none" stroke="#141414" strokeWidth={headStroke} />
                    <FacialExpressions
                      headRadius={headRadius}
                      facing={facing}
                      eyes={effectiveEyes}
                      eyebrows={state.eyebrows}
                      mouth={effectiveMouth}
                      pupilGaze={
                        state.pupilGaze
                          ? {
                              x: Math.max(0, Math.min(1, state.pupilGaze.x || 0)),
                              y: Math.max(-1, Math.min(1, state.pupilGaze.y || 0)),
                            }
                          : undefined
                      }
                      lookOffset={
                        state.lookOffset
                          ? {
                              dx: Math.max(0, Math.min(4, state.lookOffset.dx || 0)),
                              dy: Math.max(-4, Math.min(4, state.lookOffset.dy || 0)),
                            }
                          : undefined
                      }
                      blush={state.blush}
                      sweatDrop={state.sweatDrop}
                      showWhiskers={false}
                    />
                    <HeadFrontAccessories
                      archetype={activeArchetype}
                      appearance={effectiveAppearance}
                      headCenterY={0}
                      headRadius={headRadius}
                    />
                  </g>
                )}
              </g>

              {/* V11.3: NÉT GẤP KHÚC / ĐƯỜNG CONG RUN RẨY TRUYỆN TRANH (COMIC SHIVER LINES)
                  2 cụm nét vẽ tay đặt cách mép trái/phải đầu & vai 14px-22px, đảo chậm mỗi 8 frames */}
              {shiverMotion && (() => {
                const isAlt = shiverMotion.tick === 1;
                const dy = shiverMotion.lineOffsetY;
                const tilt = shiverMotion.lineTiltDeg;
                const headY = headCenterUpper.y;
                const shY = shoulderUpper.y + 18;
                return (
                  <g
                    id="stickman-comic-shiver-lines"
                    fill="none"
                    stroke={shiverStrokeColor}
                    strokeWidth={COMIC_SHIVER_CONFIG.STROKE_WIDTH_PX}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.92 * shiverOpacity}
                  >
                    {/* Cụm nét run bên TRÁI đầu (cách mép đầu r=60 khoảng 15px-24px) */}
                    <g transform={`translate(-76, ${(headY + dy).toFixed(1)}) rotate(${tilt.toFixed(1)})`}>
                      <path
                        d={
                          isAlt
                            ? "M 2,-21 L -5,-9 L 3,3 L -4,16"
                            : "M -2,-19 L 4,-7 L -3,6 L 3,19"
                        }
                      />
                      <path
                        d={
                          isAlt
                            ? "M -10,-12 Q -16,0 -10,13"
                            : "M -11,-14 Q -5,-1 -11,12"
                        }
                        opacity={0.82}
                      />
                    </g>

                    {/* Cụm nét run bên PHẢI đầu (cách mép đầu r=60 khoảng 15px-24px) */}
                    <g transform={`translate(76, ${(headY - dy).toFixed(1)}) rotate(${(-tilt).toFixed(1)})`}>
                      <path
                        d={
                          isAlt
                            ? "M -2,-21 L 5,-9 L -3,3 L 4,16"
                            : "M 2,-19 L -4,-7 L 3,6 L -3,19"
                        }
                      />
                      <path
                        d={
                          isAlt
                            ? "M 10,-12 Q 16,0 10,13"
                            : "M 11,-14 Q 5,-1 11,12"
                        }
                        opacity={0.82}
                      />
                    </g>

                    {/* Cụm nét run bên TRÁI vai (cách mép vai áo ±27 khoảng 16px-24px) */}
                    <g transform={`translate(-46, ${(shY - dy * 0.7).toFixed(1)}) rotate(${(-tilt * 0.8).toFixed(1)})`}>
                      <path
                        d={
                          isAlt
                            ? "M 1,-13 L -5,-3 L 2,7 L -4,16"
                            : "M -2,-12 L 4,-2 L -3,8 L 3,17"
                        }
                      />
                      <path
                        d={
                          isAlt
                            ? "M -9,-7 Q -14,3 -9,12"
                            : "M -10,-9 Q -5,1 -10,11"
                        }
                        opacity={0.78}
                      />
                    </g>

                    {/* Cụm nét run bên PHẢI vai trên (thoáng phía trên khớp vai/cánh tay) */}
                    <g transform={`translate(45, ${(shY - 12 + dy * 0.7).toFixed(1)}) rotate(${(tilt * 0.8).toFixed(1)})`}>
                      <path
                        d={
                          isAlt
                            ? "M -1,-11 L 5,-2 L -2,6 L 4,14"
                            : "M 2,-10 L -4,-1 L 3,7 L -3,15"
                        }
                      />
                      <path
                        d={
                          isAlt
                            ? "M 9,-6 Q 14,3 9,11"
                            : "M 10,-8 Q 5,1 10,10"
                        }
                        opacity={0.78}
                      />
                    </g>
                  </g>
                );
              })()}
            </g>
          )}

          {/* 3. HAI TAY (LEFT ARM & RIGHT ARM): 1 SỢI <PATH> LIỀN NÉT CÓ KHUỶU TAY
             Vai (0, shoulderUpper.y) -> Khuỷu tay -> Cổ tay (0% hở khớp, round join) */}
          {(renderPart === "all" || renderPart === "armsOnly" || renderPart === "backArmOnly" || renderPart === "frontArmOnly" || renderPart === "frontArmsBoth") && (
            <g id="layer-character-arms">
              {/* Tay trái (Back Arm in local space — V14.0 nét đen đặc không viền sáng rỗng ruột) */}
              {(renderPart === "all" || renderPart === "armsOnly" || renderPart === "backArmOnly" || renderPart === "frontArmsBoth") && (
                <path
                  d={`M 0 ${shoulderUpper.y} L ${leftElbowUpper.x} ${leftElbowUpper.y} L ${leftWristUpper.x} ${leftWristUpper.y}`}
                  fill="none"
                  stroke="#141414"
                  strokeWidth={limbStroke}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* Tay phải (Front Arm in local space — V14.0 nét đen đặc không viền sáng rỗng ruột) */}
              {(renderPart === "all" || renderPart === "armsOnly" || renderPart === "frontArmOnly" || renderPart === "frontArmsBoth") && (
                <>
                  {!state.hideBuiltInAppearanceProp && effectiveAppearance?.prop && effectiveAppearance.prop !== "NONE" && (
                    <BuiltInAppearancePropRenderer
                      prop={resolveStickmanAppearance(activeArchetype, effectiveAppearance).prop}
                      wristX={rightWristUpper.x}
                      wristY={rightWristUpper.y}
                    />
                  )}
                  <path
                    d={`M 0 ${shoulderUpper.y} L ${rightElbowUpper.x} ${rightElbowUpper.y} L ${rightWristUpper.x} ${rightWristUpper.y}`}
                    fill="none"
                    stroke="#141414"
                    strokeWidth={limbStroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </g>
          )}
        </g>
      )}

      {/* DEBUG MARKERS (CHỈ HIỂN THỊ KHI DEBUG BẬT) */}
      {isDebug && (
        <g id="stickman-debug-markers">
          <circle cx={0} cy={hip.y} r={5} fill="#EF4444" />
          <circle cx={leftKnee.x} cy={leftKnee.y} r={4} fill="#3B82F6" />
          <circle cx={rightKnee.x} cy={rightKnee.y} r={4} fill="#3B82F6" />
          <circle cx={leftFoot.x} cy={leftFoot.y} r={5} fill="#EF4444" />
          <circle cx={rightFoot.x} cy={rightFoot.y} r={5} fill="#EF4444" />
        </g>
      )}
    </g>
  );
};

export interface ComicSpeechBubbleProps {
  /** Tọa độ tâm bóng thoại (World SVG Space) */
  x: number;
  y: number;
  /** Tọa độ miệng nhân vật để đuôi nhọn chỉ thẳng về */
  mouthX: number;
  mouthY: number;
  /** V15.0: Đỉnh đầu/tóc nhân vật (HEAD_TOP); nếu bỏ trống tự suy mouthY - 88 để đáy bóng thoại luôn cao hơn HEAD_TOP >= 30px */
  headTopY?: number;
  /** Câu thoại ngắn 2–5 từ ("Ủa, cái gì đây?", "ÁAA!", "Kiến lửa đó con!") */
  text: string;
  /** Frame cục bộ của cảnh để chạy hiệu ứng nảy easeOutBack */
  localFrame: number;
  appearFrame?: number;
  disappearFrame?: number;
  accentColor?: string;
}

/** V15.0 Helper: Kiểm tra bóng thoại có đang hiển thị ở localFrame hay không để bật Lip-Sync Micro Talk */
export function isComicBubbleActive(
  localFrame: number,
  appearFrame: number = 18,
  disappearFrame: number = 9999
): boolean {
  return localFrame >= appearFrame && localFrame <= disappearFrame;
}

function bubbleEaseOutBack(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

/**
 * V14.0 / V15.0: Bóng Thoại Hội Thoại Ngắn (ComicSpeechBubble)
 * Hình bầu dục trắng viền đen 3.5px có đuôi nhọn trỏ thẳng về miệng nhân vật,
 * tự khóa đáy bóng thoại (safeY + ry) cao hơn HEAD_TOP tối thiểu 30px (không bao giờ đè chỏm tóc),
 * chứa câu thoại ngắn 2–5 từ và nảy vào mượt bằng easeOutBack.
 */
export const ComicSpeechBubble: React.FC<ComicSpeechBubbleProps> = ({
  x,
  y,
  mouthX,
  mouthY,
  headTopY,
  text,
  localFrame,
  appearFrame = 18,
  disappearFrame = 9999,
  accentColor = "#141414",
}) => {
  const cleanText = (text || "").trim();
  if (!cleanText || localFrame < appearFrame || localFrame > disappearFrame) return null;

  const inFrames = 8;
  const outFrames = 6;
  const elapsed = localFrame - appearFrame;
  const remaining = disappearFrame - localFrame;
  const inT = Math.max(0, Math.min(1, elapsed / inFrames));
  const outT = Math.max(0, Math.min(1, remaining / outFrames));
  const easePopIn = 1 - Math.pow(1 - inT, 3);
  const easeFadeOut = outT * outT * (3 - 2 * outT);

  // V21.0: Pop-in mượt (scale 0.85 -> 1.0 + opacity 0 -> 1 trong ~8 frames) & fade-out êm (~6 frames)
  const scale =
    elapsed < inFrames
      ? 0.85 + 0.15 * easePopIn
      : remaining < outFrames
      ? 0.96 + 0.04 * easeFadeOut
      : 1.0;
  const opacity =
    elapsed < inFrames
      ? easePopIn
      : remaining < outFrames
      ? easeFadeOut
      : 1.0;

  const rx = Math.max(92, Math.min(210, cleanText.length * 9.6 + 44));
  const ry = 38;

  // V15.0: Đáy bóng thoại (safeY + ry) LUÔN cao hơn HEAD_TOP tối thiểu 30px (chống đè chỏm tóc toàn cục!)
  const effectiveHeadTopY = headTopY ?? (mouthY - 88);
  const maxSafeCenterY = effectiveHeadTopY - 30 - ry;
  const safeY = Math.max(85 + ry, Math.min(y, maxSafeCenterY));
  // V21.0: Clamp tọa độ X của bong bóng trong vùng an toàn [180, 1740] đồng thời bảo đảm biên trái/phải không tràn mép 1920px
  const minSafeX = Math.max(180, rx + 36);
  const maxSafeX = Math.min(1740, 1920 - rx - 36);
  const safeX = Math.max(minSafeX, Math.min(maxSafeX, x));

  // Đuôi nhọn trỏ về phía miệng nhân vật (chừa khoảng thoáng >= 58px để không bao giờ chạm chỏm tóc/mắt!)
  const dx = mouthX - safeX;
  const dy = mouthY - safeY;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const tipDist = Math.min(Math.max(ry + 16, dist - 58), Math.max(ry + 24, dist * 0.60));
  const tipX = ux * tipDist;
  const tipY = uy * tipDist;
  const baseX = ux * (rx * 0.42);
  const baseY = uy * (ry * 0.65);
  const perpX = -uy * 13;
  const perpY = ux * 13;

  const isExclaim = cleanText.includes("!") || cleanText === cleanText.toUpperCase();

  return (
    <g
      id="v14-comic-speech-bubble"
      transform={`translate(${safeX.toFixed(1)}, ${safeY.toFixed(1)}) scale(${scale.toFixed(3)})`}
      opacity={opacity.toFixed(2)}
    >
      {/* Bóng đổ nhẹ dưới bóng thoại */}
      <ellipse cx={3} cy={5} rx={rx} ry={ry} fill="rgba(15, 23, 42, 0.16)" />
      {/* Đuôi nhọn viền đen 3.5px */}
      <polygon
        points={`${(baseX + perpX).toFixed(1)},${(baseY + perpY).toFixed(1)} ${tipX.toFixed(
          1
        )},${tipY.toFixed(1)} ${(baseX - perpX).toFixed(1)},${(baseY - perpY).toFixed(1)}`}
        fill="#FFFFFF"
        stroke="#141414"
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      {/* Thân bầu dục trắng viền đen 3.5px */}
      <ellipse
        cx={0}
        cy={0}
        rx={rx}
        ry={ry}
        fill="#FFFFFF"
        stroke="#141414"
        strokeWidth={3.5}
      />
      {/* Che mối nối trong giữa đuôi nhọn và thân bầu dục */}
      <polygon
        points={`${(baseX + perpX * 0.82).toFixed(1)},${(baseY + perpY * 0.82).toFixed(1)} ${(tipX * 0.88).toFixed(
          1
        )},${(tipY * 0.88).toFixed(1)} ${(baseX - perpX * 0.82).toFixed(1)},${(baseY - perpY * 0.82).toFixed(1)}`}
        fill="#FFFFFF"
      />
      <text
        x={0}
        y={8}
        textAnchor="middle"
        fill={isExclaim && cleanText.length <= 6 ? "#DC2626" : accentColor}
        fontSize={isExclaim && cleanText.length <= 6 ? 28 : 23}
        fontWeight={900}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        {cleanText}
      </text>
    </g>
  );
};
