/**
 * Universal Motion Graph Engine (Đồ thị Chuyển động Liên tục C2)
 *
 * Thiết kế cho: Toàn bộ hệ thống AnimScript runtime & Remotion Compositions.
 * Đảm bảo: C2 Velocity & Acceleration Continuity, Continuous Gait Phase,
 * Inertial Blending, Smooth Turn-Around & Triệt tiêu hoàn toàn hiện tượng
 * "khựng một nhịp / đóng băng giữa các action clip".
 */

import { Point2D, StickmanState, LimbAngleOverrides } from "../remotion/types/character";

export type { Point2D };

/**
 * 1. Vector Trạng thái Động học Liên tục (MotionPoseState)
 * 14 tham số số thực cốt lõi biểu diễn trạng thái giải phẫu của nhân vật tại frame t.
 */
export interface MotionPoseState {
  rootX: number;
  rootY: number;
  crouchDepth: number;      // Độ hạ trọng tâm hông (px, 0 -> 65px)
  flightLift: number;       // Độ bay lên khỏi mặt đất khi nhảy/chạy (px)
  torsoTiltDeg: number;     // Góc nghiêng trục thân quanh khớp hông (deg, -15 -> +52)
  headTiltDeg: number;      // Góc nghiêng đầu phụ cấp quán tính (deg, -10 -> +10)
  facingFactor: number;     // Liên tục trong đoạn [-1, +1] (+1: Phải, 0: Chính diện, -1: Trái)
  gaitPhase: number;        // Pha bước chân tích lũy liên tục theo quãng đường (rad)
  leftArmTarget: Point2D;   // Tọa độ mục tiêu đầu mút tay trái (local hoặc world)
  rightArmTarget: Point2D;  // Tọa độ mục tiêu đầu mút tay phải (local hoặc world)
  leftFootOffset: Point2D;  // Độ lệch bàn chân trái so với trục hông
  rightFootOffset: Point2D; // Độ lệch bàn chân phải so với trục hông
  pupilGaze?: Point2D;      // Kênh 1: Ánh mắt định hướng đón đầu (Anticipatory Gaze Lead-in)
}

/**
 * Đạo hàm bậc 1 của MotionPoseState (Vận tốc) dùng cho Hermite C2 Blending
 */
export interface MotionPoseVelocity {
  rootX: number;
  rootY: number;
  crouchDepth: number;
  flightLift: number;
  torsoTiltDeg: number;
  headTiltDeg: number;
  facingFactor: number;
  gaitPhase: number;
}

/**
 * 2. Các hàm nội suy toán học trơn tru C1 & C2
 */

// Quintic Smootherstep (Ken Perlin) - Đảm bảo đạo hàm bậc 1 và bậc 2 bằng 0 tại ranh giới (C2 Continuous)
export function quinticSmooth(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

// Cosine Smoothstep - C1 Continuous
export function cosineSmooth(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 0.5 - 0.5 * Math.cos(c * Math.PI);
}

// Linear Interpolation
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPoint(a: Point2D, b: Point2D, t: number): Point2D {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

/**
 * Tạo Vector Trạng thái Rest/Idle mặc định
 */
export function createDefaultMotionPose(groundY = 840, x = 240): MotionPoseState {
  return {
    rootX: x,
    rootY: groundY,
    crouchDepth: 0,
    flightLift: 0,
    torsoTiltDeg: 0,
    headTiltDeg: 0,
    facingFactor: 1.0,
    gaitPhase: 0,
    leftArmTarget: { x: -55, y: -45 },
    rightArmTarget: { x: 55, y: -45 },
    leftFootOffset: { x: -42, y: 0 },
    rightFootOffset: { x: 42, y: 0 },
  };
}

/**
 * Sao chép sâu MotionPoseState
 */
export function cloneMotionPose(pose: MotionPoseState): MotionPoseState {
  return {
    ...pose,
    leftArmTarget: { ...pose.leftArmTarget },
    rightArmTarget: { ...pose.rightArmTarget },
    leftFootOffset: { ...pose.leftFootOffset },
    rightFootOffset: { ...pose.rightFootOffset },
  };
}

/**
 * Bộ giải Động học Nghịch đảo 2 Khớp (Analytical 2-Bone 2D IK)
 * Tính toán vị trí khớp trung gian (Knee hoặc Elbow) cho 1 sợi <path> liền nét:
 * Root A (Hông / Vai) -> Joint B (Đầu gối / Khuỷu tay) -> Target C (Bàn chân / Cổ tay).
 * Bảo toàn 100% độ dài xương: l1 (Đùi 90px / Bắp tay 70px) và l2 (Cẳng chân 85px / Cẳng tay 65px).
 */
export function solve2JointIK(
  root: Point2D,
  target: Point2D,
  l1: number,
  l2: number,
  bendSign: number = 1
): Point2D {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const dist = Math.hypot(dx, dy);
  const maxReach = l1 + l2;
  const minReach = Math.abs(l1 - l2);

  if (dist < 1e-4) {
    return {
      x: root.x + (bendSign > 0 ? 10 : -10),
      y: root.y + l1,
    };
  }

  // Nếu mục tiêu vượt tầm với, duỗi thẳng theo phương root -> target
  if (dist >= maxReach - 0.001) {
    const ratio = l1 / maxReach;
    return {
      x: root.x + dx * ratio,
      y: root.y + dy * ratio,
    };
  }

  const d = Math.max(minReach + 0.01, dist);
  const cosAlpha = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const alpha = Math.acos(cosAlpha);
  const baseAngle = Math.atan2(dy, dx);

  const angle = baseAngle - bendSign * alpha;
  return {
    x: root.x + l1 * Math.cos(angle),
    y: root.y + l1 * Math.sin(angle),
  };
}

/**
 * 3. Động học Chân Sinh Cơ Học Người Thật (Real Human Gait Biomechanics)
 * - Chiều dài xương: Đùi L1 = 90px + Cẳng chân L2 = 85px (Tổng L = 175px)
 * - Khi đứng yên (walkWeight == 0 & crouchDepth == 0): Chân duỗi thẳng 100% (0°), hipY = -173.0px, mở chân ±26px
 * - Khi đi/chạy: Chân trụ (Stance) duỗi thẳng 100% chạm sàn y = 0, chỉ chân lăng (Swing) co nhẹ gối
 * - Khi chủ động cúi/nhún (crouchDepth > 0.5px): Giải 2-Joint IK khuỵu gối tự nhiên
 */
export function resolvePendulumLegs(
  phase: number,
  vx = 0,
  crouchDepth = 0,
  flightLift = 0,
  smoothedSpeed?: number,
  torsoTiltDeg = 0
): {
  leftFoot: Point2D;
  rightFoot: Point2D;
  leftKnee: Point2D;
  rightKnee: Point2D;
  hipY: number;
  thetaL: number;
  thetaR: number;
} {
  const L1 = 90; // Đùi 90px
  const L2 = 85; // Cẳng chân 85px (Tổng L = 175px)
  const totalLegLen = L1 + L2; // 175px
  const restFootX = 26; // Độ mở chân nghỉ ±26px (bề rộng 52px)
  const restAngle = Math.asin(restFootX / totalLegLen); // ~8.54 độ (0.1491 rad)
  const standHipY = -Math.sqrt(totalLegLen * totalLegLen - restFootX * restFootX); // -173.06px

  const speed = smoothedSpeed !== undefined ? smoothedSpeed : Math.abs(vx);
  const walkWeight = Math.min(1, Math.max(0, speed / 2.0));

  // 1. Tính toán chân Locomotion FK (Walk / Run / Stand)
  let locoFootL: Point2D;
  let locoFootR: Point2D;
  let locoKneeL: Point2D;
  let locoKneeR: Point2D;
  let locoHipY: number;
  let locoThetaL: number;
  let locoThetaR: number;

  if (walkWeight <= 0.001) {
    locoHipY = standHipY;
    locoFootL = { x: -restFootX, y: 0 };
    locoFootR = { x: restFootX, y: 0 };
    const kneeY = locoHipY + Math.sqrt(L1 * L1 - Math.pow(restFootX * (L1 / totalLegLen), 2));
    locoKneeL = { x: -restFootX * (L1 / totalLegLen), y: kneeY };
    locoKneeR = { x: restFootX * (L1 / totalLegLen), y: kneeY };
    locoThetaL = -restAngle;
    locoThetaR = restAngle;
  } else {
    const moveDir = 1; // Trong hệ tọa độ cục bộ của nhân vật, hướng tiến về trước luôn là +X
    // V12.1: Khớp biên độ sải chân trụ (~±42px -> 84px/bước) với chu kỳ stride để bám sàn tuyệt đối, không trượt băng
    const aThighRad = ((13.5 + Math.min(12, Math.max(0, speed - 2.0) * 2.2)) * Math.PI) / 180;
    // Khi ở pha chân lăng (cos(psi) > 0), đùi nâng cao về phía trước (+moveDir * swingThighForwardRad * swingSq)
    // đẩy đầu gối nhô hẳn ra phía trước trục hông, kết hợp gập gối 60° tạo hình số 4 (>) cực rõ nét!
    const swingThighForwardRad = ((28 + Math.min(8, speed * 1.4)) * Math.PI) / 180;
    const maxKneeBendRad = ((60 + Math.min(14, speed * 2.2)) * Math.PI) / 180;

    const computeLegFK = (psi: Number | number, isLeft: boolean) => {
      const pVal = Number(psi);
      const legRestAngle = isLeft ? -restAngle : restAngle;
      // cos(psi) <= 0: Pha chân trụ (Stance Phase) -> Đầu gối DUỖI THẲNG TUYỆT ĐỐI (0°) bám chặt mặt đất
      // cos(psi) > 0: Pha chân lăng (Swing Phase) -> Đùi nâng về trước & gối gập tạo hình tam giác số 4 (>)
      const swingFactor = Math.max(0, Math.cos(pVal));
      const swingSq = swingFactor * swingFactor;

      const thighAngle =
        legRestAngle * (1 - walkWeight) +
        moveDir * (aThighRad * Math.sin(pVal) + swingThighForwardRad * swingSq) * walkWeight;

      const kneeBendRad = walkWeight * maxKneeBendRad * swingSq;

      const shinAngle = thighAngle - moveDir * kneeBendRad;

      const kneeRel = {
        x: L1 * Math.sin(thighAngle),
        y: L1 * Math.cos(thighAngle),
      };
      const footRel = {
        x: kneeRel.x + L2 * Math.sin(shinAngle),
        y: kneeRel.y + L2 * Math.cos(shinAngle),
      };

      return { thighAngle, kneeBendRad, shinAngle, kneeRel, footRel };
    };

    const psiL = phase;
    const psiR = phase + Math.PI;
    const legL = computeLegFK(psiL, true);
    const legR = computeLegFK(psiR, false);

    // V12.1: Độ nhún hông sinh học nhẹ theo từng bước chân (-|sin(phase)| * 5px) + hạ nhẹ trọng tâm nếu đang đi cúi thấp
    const hipBob = -Math.abs(Math.sin(phase)) * 5.0 * walkWeight;
    const stealthWalkDrop = Math.min(12, crouchDepth * 0.55) * walkWeight;
    const maxFootRelY = Math.max(legL.footRel.y, legR.footRel.y);
    locoHipY = -maxFootRelY + hipBob + stealthWalkDrop;
    locoFootL = { x: legL.footRel.x, y: Math.min(0, locoHipY + legL.footRel.y) };
    locoFootR = { x: legR.footRel.x, y: Math.min(0, locoHipY + legR.footRel.y) };
    locoKneeL = { x: legL.kneeRel.x, y: locoHipY + legL.kneeRel.y };
    locoKneeR = { x: legR.kneeRel.x, y: locoHipY + legR.kneeRel.y };
    // Khi đi cúi nhẹ (stealthWalkDrop > 0.5), giải lại khớp gối chân trụ chạm sàn y=0 để chân trụ khụy tự nhiên không thụt xuống dưới đất
    if (stealthWalkDrop > 0.5) {
      const hipPt = { x: 0, y: locoHipY };
      if (locoFootL.y >= -1) {
        locoKneeL = solve2JointIK(hipPt, locoFootL, L1, L2, 1);
      }
      if (locoFootR.y >= -1) {
        locoKneeR = solve2JointIK(hipPt, locoFootR, L1, L2, 1);
      }
    }
    locoThetaL = legL.thighAngle;
    locoThetaR = legR.thighAngle;
  }

  // 2. Hệ số pha trộn mượt (0 -> 1): V12.1 chỉ pha trộn về thế đứng cúi tĩnh khi KHÔNG bước đi (1 - walkWeight)
  // để nhân vật vừa cúi thấp vừa bước đi (Beat 15 & Beat 19) KHÔNG BAO GIỜ bị đơ chân trượt băng!
  const crouchBlend = Math.min(1, Math.max(0, crouchDepth / 14)) * (1 - walkWeight);
  const airBlend = Math.min(1, Math.max(0, flightLift / 18));
  const ikWeight = Math.max(crouchBlend, airBlend);

  // Nếu hoàn toàn là locomotion và không nhún/bay, trả về ngay kết quả FK thuần
  if (ikWeight <= 0.0001) {
    return {
      leftFoot: locoFootL,
      rightFoot: locoFootR,
      leftKnee: locoKneeL,
      rightKnee: locoKneeR,
      hipY: locoHipY,
      thetaL: locoThetaL,
      thetaR: locoThetaR,
    };
  }

  // 3. Tính toán mục tiêu IK (Crouching & Flight)
  let crouchFootL: Point2D;
  let crouchFootR: Point2D;
  if (torsoTiltDeg > 15) {
    // Cúi nhặt táo/thùng: Chân sau lùi nhẹ -40px, chân trước tiến nhẹ +32px, phẳng sàn y = 0
    crouchFootL = { x: -40, y: 0 };
    crouchFootR = { x: 32, y: 0 };
  } else {
    // Nhún tiếp đất (landing cushion) hoặc nhún lấy đà: thế đứng ±26px, phẳng sàn y = 0
    crouchFootL = { x: -restFootX, y: 0 };
    crouchFootR = { x: restFootX, y: 0 };
  }

  const airFootL: Point2D = { x: -16, y: -flightLift };
  const airFootR: Point2D = { x: 16, y: -flightLift };

  const sumBlend = crouchBlend + airBlend;
  const airRatio = sumBlend > 0.0001 ? airBlend / sumBlend : 0;

  const ikFootL: Point2D = {
    x: lerp(crouchFootL.x, airFootL.x, airRatio),
    y: lerp(crouchFootL.y, airFootL.y, airRatio),
  };
  const ikFootR: Point2D = {
    x: lerp(crouchFootR.x, airFootR.x, airRatio),
    y: lerp(crouchFootR.y, airFootR.y, airRatio),
  };

  const crouchHipY = standHipY + crouchDepth;
  const airHipY = -155 + crouchDepth - flightLift;
  const ikHipY = lerp(crouchHipY, airHipY, airRatio);
  const ikHip: Point2D = { x: 0, y: ikHipY };

  const ikKneeL = solve2JointIK(ikHip, ikFootL, L1, L2, 1);
  const ikKneeR = solve2JointIK(ikHip, ikFootR, L1, L2, 1);

  // 4. Pha trộn liên tục C1/C2 giữa Locomotion FK và IK (Xóa bỏ hoàn toàn bước nhảy bậc)
  const finalFootL = {
    x: lerp(locoFootL.x, ikFootL.x, ikWeight),
    y: lerp(locoFootL.y, ikFootL.y, ikWeight),
  };
  const finalFootR = {
    x: lerp(locoFootR.x, ikFootR.x, ikWeight),
    y: lerp(locoFootR.y, ikFootR.y, ikWeight),
  };
  const finalKneeL = {
    x: lerp(locoKneeL.x, ikKneeL.x, ikWeight),
    y: lerp(locoKneeL.y, ikKneeL.y, ikWeight),
  };
  const finalKneeR = {
    x: lerp(locoKneeR.x, ikKneeR.x, ikWeight),
    y: lerp(locoKneeR.y, ikKneeR.y, ikWeight),
  };
  const finalHipY = lerp(locoHipY + crouchDepth - flightLift, ikHipY, ikWeight);

  return {
    leftFoot: finalFootL,
    rightFoot: finalFootR,
    leftKnee: finalKneeL,
    rightKnee: finalKneeR,
    hipY: finalHipY,
    thetaL: Math.atan2(finalFootL.x, finalFootL.y - finalHipY),
    thetaR: Math.atan2(finalFootR.x, finalFootR.y - finalHipY),
  };
}

/**
 * 4. Động học Cánh Tay Con Lắc Người Thật (Real Human Gait Arm Kinematics)
 * - Chiều dài xương: Cánh tay trên L1 = 68px, Cẳng tay L2 = 62px
 * - Độ mở ngang thu hẹp về ±6px khi nhìn nghiêng để 2 tay cắt kéo sát thân người
 * - Khi vung ra trước: khuỷu tay co chữ L tự nhiên (~28° đi bộ, ~62° chạy)
 * - Khi đánh ra sau: cánh tay duỗi gần như thẳng (chỉ cong 6-8°), tuyệt đối không móc ngược vào lưng
 */
export function resolvePendulumArms(
  phase: number,
  walkWeight: number,
  facingFactor: number,
  isRunning: boolean
): {
  leftArm: { elbowRel: Point2D; handRel: Point2D };
  rightArm: { elbowRel: Point2D; handRel: Point2D };
} {
  const L1 = 65;
  const L2 = 58;
  const dir = Math.abs(facingFactor) < 0.15 ? 1 : Math.sign(facingFactor);
  const sideProfile = Math.min(1, Math.abs(facingFactor));

  // Lệch pha nhẹ (-0.32 rad) so với chân nhưng giữ nguyên vận tốc góc liên tục
  const shiftedPhase = phase - 0.32;
  const maxSwing = (isRunning ? 0.65 : 0.46) * walkWeight;

  const solveArm = (armPhase: number, sideSign: -1 | 1) => {
    const wave = Math.sin(armPhase); // Liên tục mượt mà từ -1 đến +1
    // Hàm trơn C-infinity từ 0 (khi tay ở cực sau) đến 1 (khi tay ở cực trước) - KHÔNG GÃY GÓC!
    const smoothForward = 0.5 * (1 + wave);

    // Độ lệch vai tĩnh cực nhỏ (±0.08 rad) giữa 2 tay để khi đi qua giữa thân không đè khít lên nhau
    const baseAsymmetry = sideSign * 0.08 * sideProfile;
    const thetaShoulder = dir * (wave * maxSwing * sideProfile + baseAsymmetry);

    // Góc gập khuỷu tay luôn >= 0.16 rad (cong chữ L nhẹ) và tăng mượt theo smoothForward^2
    const baseFlex = 0.16;
    const dynamicFlex = isRunning ? 0.88 : 0.36;
    const thetaElbow = dir * (baseFlex + walkWeight * dynamicFlex * (smoothForward * smoothForward));

    const spreadX = (1 - sideProfile) * 24 * sideSign;
    const elbowRel = {
      x: spreadX + L1 * Math.sin(thetaShoulder),
      y: L1 * Math.cos(thetaShoulder),
    };
    const handRel = {
      x: elbowRel.x + L2 * Math.sin(thetaShoulder + thetaElbow),
      y: elbowRel.y + L2 * Math.cos(thetaShoulder + thetaElbow),
    };
    return { elbowRel, handRel };
  };

  return {
    leftArm: solveArm(shiftedPhase + Math.PI, -1),
    rightArm: solveArm(shiftedPhase, 1),
  };
}

/**
 * Bộ giải chống chập chân kế thừa cho các module cũ
 * Giữ nguyên bảo toàn chiều dài L = 175px (KHÔNG trừ footY)
 */
export function resolveLegAntiMerging(
  leftFootOffset: Point2D,
  rightFootOffset: Point2D,
  phase: number,
  weight = 1.0,
  minDist = 14
): { left: Point2D; right: Point2D } {
  let leftX = leftFootOffset.x;
  let rightX = rightFootOffset.x;

  const dist = Math.abs(leftX - rightX);
  if (dist < minDist) {
    const mid = (leftX + rightX) / 2;
    const half = minDist / 2;
    if (leftX >= rightX) {
      leftX = mid + half;
      rightX = mid - half;
    } else {
      leftX = mid - half;
      rightX = mid + half;
    }
  }

  return {
    left: { x: leftX, y: leftFootOffset.y },
    right: { x: rightX, y: rightFootOffset.y },
  };
}

/**
 * 4. Trộn hai MotionPoseState trơn tru C2 (Inertial Motion Blending)
 */
export function blendMotionPoseStates(
  poseA: MotionPoseState,
  poseB: MotionPoseState,
  rawAlpha: number,
  blendMethod: "quintic" | "cosine" | "linear" = "quintic"
): MotionPoseState {
  const smoothAlpha =
    blendMethod === "quintic"
      ? quinticSmooth(rawAlpha)
      : blendMethod === "cosine"
      ? cosineSmooth(rawAlpha)
      : Math.max(0, Math.min(1, rawAlpha));

  const blendedLeftFoot = lerpPoint(poseA.leftFootOffset, poseB.leftFootOffset, smoothAlpha);
  const blendedRightFoot = lerpPoint(poseA.rightFootOffset, poseB.rightFootOffset, smoothAlpha);

  // Bảo toàn tính chống chập chân ngay cả trong quá trình blend
  const resolvedFeet = resolveLegAntiMerging(
    blendedLeftFoot,
    blendedRightFoot,
    lerp(poseA.gaitPhase, poseB.gaitPhase, smoothAlpha)
  );

  return {
    rootX: lerp(poseA.rootX, poseB.rootX, smoothAlpha),
    rootY: lerp(poseA.rootY, poseB.rootY, smoothAlpha),
    crouchDepth: lerp(poseA.crouchDepth, poseB.crouchDepth, smoothAlpha),
    flightLift: lerp(poseA.flightLift, poseB.flightLift, smoothAlpha),
    torsoTiltDeg: lerp(poseA.torsoTiltDeg, poseB.torsoTiltDeg, smoothAlpha),
    headTiltDeg: lerp(poseA.headTiltDeg, poseB.headTiltDeg, smoothAlpha),
    facingFactor: lerp(poseA.facingFactor, poseB.facingFactor, smoothAlpha),
    gaitPhase: lerp(poseA.gaitPhase, poseB.gaitPhase, smoothAlpha),
    leftArmTarget: lerpPoint(poseA.leftArmTarget, poseB.leftArmTarget, smoothAlpha),
    rightArmTarget: lerpPoint(poseA.rightArmTarget, poseB.rightArmTarget, smoothAlpha),
    leftFootOffset: resolvedFeet.left,
    rightFootOffset: resolvedFeet.right,
    pupilGaze:
      poseA.pupilGaze && poseB.pupilGaze
        ? lerpPoint(poseA.pupilGaze, poseB.pupilGaze, smoothAlpha)
        : poseB.pupilGaze ?? poseA.pupilGaze,
  };
}

/**
 * 5. Định nghĩa Clip Động học trong Đồ thị Chuyển động (MotionGraphNode)
 */
export type MotionActionType =
  | "walk"
  | "run"
  | "jump"
  | "crouchPickup"
  | "turnAround"
  | "carryWalk"
  | "idle";

export type MotionActionCategory = "locomotion" | "jump" | "interaction" | "carry";

export function getActionCategory(type: MotionActionType): MotionActionCategory {
  switch (type) {
    case "walk":
    case "run":
      return "locomotion";
    case "jump":
      return "jump";
    case "crouchPickup":
      return "interaction";
    case "turnAround":
    case "carryWalk":
      return "carry";
    default:
      return "locomotion";
  }
}

/**
 * 1. Phân Loại Tỷ Lệ Gối Đầu (Adaptive Overlap Ratio)
 * - Locomotion -> Locomotion: 0.35 (giữ đà liên tục)
 * - Jump -> Interaction: 0.0 (tiếp đất nhún gối 15f hấp thụ lực)
 * - Interaction -> Interaction: 0.0 (đứng thẳng 15f ổn định)
 * - Carry Turn -> Walk: 0.40 (ngoại lệ linh hoạt)
 */
export function getAdaptiveOverlapRatio(fromType: MotionActionType, toType: MotionActionType): number {
  const fromCat = getActionCategory(fromType);
  const toCat = getActionCategory(toType);

  if (fromCat === "locomotion" && toCat === "locomotion") {
    return 0.35;
  }
  if (fromType === "run" && toType === "jump") {
    return 0.35;
  }
  if (fromCat === "jump" && toCat === "interaction") {
    return 0.0; // Triệt tiêu gối đầu, để Dwell Time 15f hấp thụ lực
  }
  if (fromCat === "interaction" && toCat === "interaction") {
    return 0.0; // Đứng thẳng ổn định 15f
  }
  if (fromType === "turnAround" && toType === "carryWalk") {
    return 0.40; // Ngoại lệ linh hoạt
  }
  if (fromCat === "carry") {
    return 0.35;
  }
  return 0.15;
}

/**
 * 2. Thời gian Dwell Time (frames) chuẩn mực tạo sức nặng và độ tĩnh
 */
export const MOTION_DWELL_TIMES = {
  landingCushion: 15,     // Nhún gối 15f hấp thụ lực tiếp đất
  pickupTouchHold: 15,    // Giữ chạm quả táo trên mặt sàn 15f (0.25s) tạo sức nặng
  pickupStandRecover: 15, // Đứng thẳng dậy 15f trước khi bước đi
  placeLidRelease: 12,    // Giữ 12f sau khi đặt táo lên nắp thùng
  actionClusterPause: 15, // Nhịp nghỉ 15f giữa các cụm hành động độc lập
} as const;

export interface MotionClipDescriptor {
  id: string;
  type: MotionActionType;
  startFrame: number;
  endFrame: number;
  // Blend in/out frames để triệt tiêu khựng
  blendInFrames?: number;
  blendOutFrames?: number;
  // Tham số đặc thù của action
  startX?: number;
  targetX?: number;
  speed?: number;
  targetPropPoint?: Point2D;
  boxHandleDistance?: number;
}

/**
 * 6. Lớp Universal Motion Graph Engine
 * Quản lý chuỗi liên kết các hành động, tạo luồng chuyển động liên tục không vết cắt.
 */
export class MotionGraph {
  private clips: MotionClipDescriptor[] = [];
  private groundY = 840;

  constructor(groundY = 840) {
    this.groundY = groundY;
  }

  public addClip(clip: MotionClipDescriptor): this {
    this.clips.push(clip);
    // Sắp xếp theo thứ tự startFrame
    this.clips.sort((a, b) => a.startFrame - b.startFrame);
    return this;
  }

  /**
   * Tính toán MotionPoseState tại bất kỳ frame t nào với C2 Continuity
   */
  public evaluate(frame: number): MotionPoseState {
    if (this.clips.length === 0) {
      return createDefaultMotionPose(this.groundY);
    }

    // Tìm clip hiện tại đang chạy hoặc ranh giới giữa 2 clip
    const activeClip = this.clips.find(
      (c) => frame >= c.startFrame && frame < c.endFrame
    );

    if (activeClip) {
      const clipProgress = (frame - activeClip.startFrame) / Math.max(1, activeClip.endFrame - activeClip.startFrame);
      return this.evaluateClip(activeClip, frame, clipProgress);
    }

    // Nếu nằm trước clip đầu tiên
    if (frame < this.clips[0].startFrame) {
      return this.evaluateClip(this.clips[0], this.clips[0].startFrame, 0);
    }

    // Nếu nằm sau clip cuối cùng
    const lastClip = this.clips[this.clips.length - 1];
    return this.evaluateClip(lastClip, lastClip.endFrame, 1);
  }

  /**
   * Đánh giá chi tiết từng loại hành động với các nguyên lý vật lý
   */
  private evaluateClip(clip: MotionClipDescriptor, currentFrame: number, progress: number): MotionPoseState {
    const { type, startFrame, endFrame, startX = 240, targetX = 600, targetPropPoint } = clip;
    const duration = Math.max(1, endFrame - startFrame);
    const localF = currentFrame - startFrame;

    switch (type) {
      case "walk": {
        const easeProg = progress; // Vận tốc đều
        const curX = lerp(startX, targetX, easeProg);
        const cycleProgress = (localF / 42) % 1;
        const phase = (localF / 42) * Math.PI * 2;
        const stride = 52;
        const stanceSep = 14;

        const rawLeftX = Math.sin(phase) * stride - stanceSep;
        const rawRightX = -Math.sin(phase) * stride + stanceSep;
        const leftY = -Math.max(0, -Math.cos(phase)) * 16;
        const rightY = -Math.max(0, Math.cos(phase)) * 16;

        const resolved = resolveLegAntiMerging(
          { x: rawLeftX, y: leftY },
          { x: rawRightX, y: rightY },
          phase
        );

        const armSwing = Math.sin(phase) * 22;
        return {
          rootX: curX,
          rootY: this.groundY,
          crouchDepth: 0,
          flightLift: 0,
          torsoTiltDeg: 0,
          headTiltDeg: 0,
          facingFactor: targetX >= startX ? 1.0 : -1.0,
          gaitPhase: phase,
          leftArmTarget: { x: -62 - armSwing * 0.7, y: 120 + armSwing * 0.4 },
          rightArmTarget: { x: 62 + armSwing * 0.7, y: 120 - armSwing * 0.4 },
          leftFootOffset: resolved.left,
          rightFootOffset: resolved.right,
        };
      }

      case "run": {
        const curX = lerp(startX, targetX, progress);
        const cycleProgress = (localF / 20) % 1;
        const phase = (localF / 20) * Math.PI * 2;
        const stride = 72;
        const stanceSep = 14;

        const rawLeftX = Math.sin(phase) * stride - stanceSep;
        const rawRightX = -Math.sin(phase) * stride + stanceSep;
        const leftY = -Math.max(0, -Math.cos(phase)) * 18;
        const rightY = -Math.max(0, Math.cos(phase)) * 18;

        const resolved = resolveLegAntiMerging(
          { x: rawLeftX, y: leftY },
          { x: rawRightX, y: rightY },
          phase
        );

        const flight = Math.max(0, Math.sin(phase)) * 14;
        const armSwing = Math.sin(phase) * 42;

        return {
          rootX: curX,
          rootY: this.groundY,
          crouchDepth: 0,
          flightLift: flight,
          torsoTiltDeg: 15,
          headTiltDeg: 0,
          facingFactor: targetX >= startX ? 1.0 : -1.0,
          gaitPhase: phase,
          leftArmTarget: { x: -65 - armSwing * 0.7, y: 120 + armSwing * 0.4 },
          rightArmTarget: { x: 65 + armSwing * 0.7, y: 120 - armSwing * 0.4 },
          leftFootOffset: resolved.left,
          rightFootOffset: resolved.right,
        };
      }

      case "jump": {
        // Jump Arc 3 giai đoạn: Takeoff (0-15%) -> Parabola Apex (15-75%) -> Cushion Landing & Dwell (75-100%)
        let flight = 0;
        let crouch = 0;
        let tilt = 0;
        let headNod = 0;
        let curX = startX;

        if (progress < 0.15) {
          // Takeoff extension
          const p = progress / 0.15;
          curX = lerp(startX, startX + 30, p);
          crouch = 45 * (1 - p);
          tilt = 14 * (1 - 2 * p);
          flight = 20 * p;
        } else if (progress < 0.75) {
          // Parabola flight
          const p = (progress - 0.15) / 0.60;
          curX = lerp(startX + 30, targetX, p);
          flight = 20 + Math.sin(p * Math.PI) * 140; // 160px peak
          tilt = -14 + 28 * p;
        } else {
          // Landing cushion & Dwell 15 frames hấp thụ lực (overlap = 0.0)
          const p = (progress - 0.75) / 0.25;
          curX = targetX;
          flight = 0;
          if (p < 0.5) {
            // 15f đầu: Nhún gối sâu 38px hấp thụ lực tiếp đất
            const cp = p / 0.5;
            crouch = 38 * Math.sin(cp * Math.PI * 0.5);
            tilt = 10 * Math.sin(cp * Math.PI * 0.5);
            headNod = 4.0 * Math.sin(cp * Math.PI); // Quán tính gật đầu 4°
          } else {
            // 15f sau: Hồi phục nhẹ về tư thế đứng thẳng cân bằng
            const rp = (p - 0.5) / 0.5;
            const rec = 1 - cosineSmooth(rp);
            crouch = 38 * rec;
            tilt = 10 * rec;
            headNod = -1.5 * Math.sin(rp * Math.PI);
          }
        }

        return {
          rootX: curX,
          rootY: this.groundY,
          crouchDepth: crouch,
          flightLift: flight,
          torsoTiltDeg: tilt,
          headTiltDeg: headNod,
          facingFactor: 1.0,
          gaitPhase: 0,
          leftArmTarget: flight > 30 ? { x: -85, y: -75 } : { x: -55, y: -45 },
          rightArmTarget: flight > 30 ? { x: 85, y: -75 } : { x: 55, y: -45 },
          leftFootOffset: { x: -20, y: flight > 30 ? -20 : 0 },
          rightFootOffset: { x: 20, y: flight > 30 ? -20 : 0 },
        };
      }

      case "crouchPickup": {
        // Cúi nhặt có Dwell Time 15f chạm giữ + Dwell Time 15f đứng thẳng (overlap = 0.0)
        const curX = startX;
        let crouch = 0;
        let tilt = 0;
        let rightArm: Point2D = { x: 55, y: -45 };

        if (progress < 0.28) {
          // 1. Cúi người tiếp cận (0 - 28%)
          const p = progress / 0.28;
          const ep = cosineSmooth(p);
          crouch = 55 * ep;
          tilt = 48 * ep;
          if (targetPropPoint) {
            rightArm = {
              x: lerp(55, targetPropPoint.x - curX, ep),
              y: lerp(-45, targetPropPoint.y - this.groundY, ep),
            };
          }
        } else if (progress < 0.44) {
          // 2. DWELL TIME 15f (0.25s) CHẠM GIỮ TÁO TRÊN SÀN (28 - 44%): Tạo sức nặng & ma sát
          crouch = 55;
          tilt = 48;
          if (targetPropPoint) {
            rightArm = {
              x: targetPropPoint.x - curX,
              y: targetPropPoint.y - this.groundY,
            };
          }
        } else if (progress < 0.78) {
          // 3. Nhấc vật & Lưng nâng đứng dậy (44 - 78%)
          const p = (progress - 0.44) / 0.34;
          const ep = cosineSmooth(p);
          crouch = 55 * (1 - ep);
          tilt = 48 * (1 - ep);
          if (targetPropPoint) {
            rightArm = {
              x: lerp(targetPropPoint.x - curX, 45, ep),
              y: lerp(targetPropPoint.y - this.groundY, -145, ep),
            };
          }
        } else {
          // 4. DWELL TIME 15f ĐỨNG THẲNG HOÀN TOÀN (78 - 100%): Ổn định trước khi bước
          crouch = 0;
          tilt = 0;
          rightArm = { x: 45, y: -145 };
        }

        // Tư thế đứng vững chắc khi cúi (2 bàn chân phẳng sàn y = 0, đầu gối gập tự nhiên):
        const backFootX = lerp(-24, -42, tilt / 48);
        const frontFootX = lerp(24, 32, tilt / 48);

        return {
          rootX: curX,
          rootY: this.groundY,
          crouchDepth: crouch,
          flightLift: 0,
          torsoTiltDeg: tilt,
          headTiltDeg: 0,
          facingFactor: 1.0,
          gaitPhase: 0,
          leftArmTarget: { x: -55, y: -45 },
          rightArmTarget: rightArm,
          leftFootOffset: { x: backFootX, y: 0 },
          rightFootOffset: { x: frontFootX, y: 0 },
        };
      }

      case "turnAround": {
        // Xoay người mượt mà: facingFactor biến thiên từ +1 sang -1 theo cosine
        const facingF = Math.cos(progress * Math.PI);
        const curX = startX;

        return {
          rootX: curX,
          rootY: this.groundY,
          crouchDepth: 0,
          flightLift: 0,
          torsoTiltDeg: 0,
          headTiltDeg: 0,
          facingFactor: facingF,
          gaitPhase: 0,
          leftArmTarget: { x: -48 * facingF, y: -52 },
          rightArmTarget: { x: 48 * facingF, y: -52 },
          leftFootOffset: { x: -42, y: 0 },
          rightFootOffset: { x: 42, y: 0 },
        };
      }

      case "carryWalk": {
        const curX = lerp(startX, targetX, progress);
        const cycleProgress = (localF / 38) % 1;
        const phase = (localF / 38) * Math.PI * 2;
        const stride = 52;
        const stanceSep = 14;

        const rawLeftX = Math.sin(phase) * stride - stanceSep;
        const rawRightX = -Math.sin(phase) * stride + stanceSep;
        const leftY = -Math.max(0, -Math.cos(phase)) * 16;
        const rightY = -Math.max(0, Math.cos(phase)) * 16;

        const resolved = resolveLegAntiMerging(
          { x: rawLeftX, y: leftY },
          { x: rawRightX, y: rightY },
          phase
        );

        return {
          rootX: curX,
          rootY: this.groundY,
          crouchDepth: 0,
          flightLift: 0,
          torsoTiltDeg: -4, // Đối trọng thùng nặng
          headTiltDeg: 0,
          facingFactor: -1.0,
          gaitPhase: phase,
          leftArmTarget: { x: -48, y: -52 },
          rightArmTarget: { x: 48, y: -52 },
          leftFootOffset: resolved.left,
          rightFootOffset: resolved.right,
        };
      }

      default:
        return createDefaultMotionPose(this.groundY, startX);
    }
  }
}

/**
 * 7. Adapter chuyển đổi từ MotionPoseState sang StickmanState (Remotion Renderer)
 */
export function motionPoseToStickmanState(
  pose: MotionPoseState,
  options?: {
    scale?: number;
    hat?: boolean;
    archetype?: any;
    eyes?: any;
    eyebrows?: any;
    mouth?: any;
    blush?: boolean;
    sweatDrop?: boolean;
    pupilGaze?: Point2D;
    holdingTarget?: { leftGrip?: Point2D; rightGrip?: Point2D };
  }
): StickmanState {
  const facingDir: "left" | "right" = pose.facingFactor >= 0 ? "right" : "left";

  let rigPose: "standing" | "walking" | "running" | "jumping" | "crouching" = "standing";
  if (pose.flightLift > 15) {
    rigPose = "jumping";
  } else if (pose.crouchDepth > 5) {
    rigPose = "crouching";
  } else if (pose.torsoTiltDeg >= 12 && pose.flightLift > 0) {
    rigPose = "running";
  } else if (Math.abs(pose.gaitPhase) > 0.05) {
    rigPose = "walking";
  }

  const walkCycle = (pose.gaitPhase / (2 * Math.PI)) % 1;

  return {
    x: pose.rootX,
    y: pose.rootY,
    scale: options?.scale ?? 0.95,
    facing: facingDir,
    pose: rigPose,
    torsoTiltDeg: pose.torsoTiltDeg,
    crouchDepth: pose.crouchDepth,
    flightLift: pose.flightLift,
    walkCycleProgress: walkCycle >= 0 ? walkCycle : 1 + walkCycle,
    walkWeight: 1.0,
    limbAngles: {
      head: pose.headTiltDeg,
    },
    eyes: options?.eyes ?? "neutral",
    eyebrows: options?.eyebrows ?? "neutral",
    mouth: options?.mouth ?? "smile",
    pupilGaze: pose.pupilGaze ?? options?.pupilGaze,
    blush: options?.blush,
    sweatDrop: options?.sweatDrop,
    holdingTarget: options?.holdingTarget,
    hat: options?.hat ?? true,
    archetype: options?.archetype ?? "oldMan",
  };
}
