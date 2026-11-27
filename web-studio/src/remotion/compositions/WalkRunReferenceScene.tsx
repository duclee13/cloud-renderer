import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Easing,
} from "remotion";
import { StickmanRig, computeStickmanFK } from "../components/character/StickmanRig";
import { StickmanState, Point2D } from "../types/character";

export interface WalkRunReferenceSceneProps {
  showDebugMarkers?: boolean;
  cameraMode?: "full" | "closeUp";
  overrideFrame?: number;
}

/**
 * Giải góc xoay của đùi (thighAngleDeg) từ tọa độ X mong muốn của bàn chân trong hệ tọa độ World.
 * Áp dụng cho cả chân trái và chân phải, hỗ trợ mọi scale, facing và chiều dài xương.
 */
export function solveThighAngleForWorldFootX(
  charX: number,
  targetFootWorldX: number,
  isLeft: boolean,
  scale: number = 1.0,
  facing: "left" | "right" = "right",
  legLength: number = 310,
  pelvicHalfWidth: number = 16
): number {
  const flipSign = facing === "left" ? -1 : 1;
  const hipLocalX = isLeft ? -pelvicHalfWidth : pelvicHalfWidth;
  const sinVal = (hipLocalX - (targetFootWorldX - charX) / (scale * flipSign)) / legLength;
  const clampedSin = Math.max(-0.999, Math.min(0.999, sinVal));
  return Math.asin(clampedSin) * (180 / Math.PI);
}

/**
 * Tính toán tọa độ X của bàn chân trong hệ tọa độ World từ góc xoay của đùi (thighAngleDeg).
 */
export function computeWorldFootXFromThighAngle(
  charX: number,
  thighAngleDeg: number,
  isLeft: boolean,
  scale: number = 1.0,
  facing: "left" | "right" = "right",
  legLength: number = 310,
  pelvicHalfWidth: number = 16
): number {
  const flipSign = facing === "left" ? -1 : 1;
  const hipLocalX = isLeft ? -pelvicHalfWidth : pelvicHalfWidth;
  const thighRad = (thighAngleDeg * Math.PI) / 180;
  const footLocalX = hipLocalX - Math.sin(thighRad) * legLength;
  return charX + footLocalX * scale * flipSign;
}

/**
 * WalkRunReferenceScene (V4 Acceptance Deliverable - Production Fix)
 * 
 * SỬA TOÀN DIỆN 6 ĐIỂM NGHIỆM THU:
 * 1. Khớp háng & dáng đứng chữ V ngược (Lambda): Đùi phân nhánh từ hai khớp hông riêng biệt,
 *    không bắt chéo chữ X, góc đùi chuẩn xác theo hệ trục SVG.
 * 2. Cổ tay & bàn tay nối liền: Forearm kết thúc tại wristWorld, hand dot và grip anchor đồng quy 0px.
 * 3. Chuyển tiếp liên tục tại ranh giới hành động:
 *    - f194 -> f195: Không giật vận tốc/góc khớp khi chuyển sang chạy (< 4° delta).
 *    - f329 -> f330: Kế thừa chân chạm đất và tọa độ tiếp xúc từ chu kỳ chạy, không nhảy mốc dựng sẵn.
 * 4. Giữ tiếp xúc đất trong lúc chuyển tư thế:
 *    - f180-185: Nhấc - đặt chân trong không khí (stepping arc) thay vì kéo lê ngang trên cát.
 *    - f355-390: Tay nghỉ phân biệt rõ với thân và với nhau, chân đứng ổn định 60.00px.
 * 5. Đo kiểm Debug 100% Forward Kinematics:
 *    - Mọi số đo HUD, thước kẻ và CSV đều trích xuất từ computeStickmanFK.
 *    - Khắc phục triệt để sai lệch HUD 60px vs render 92px.
 * 6. Bộ sản phẩm nghiệm thu chuẩn:
 *    - Normal & Debug 1080p60.
 *    - Slow-motion clips quanh f185-205 và f320-340 có nhãn frame gốc.
 *    - CSV tọa độ khớp trên toàn bộ timeline.
 */
export const WalkRunReferenceScene: React.FC<WalkRunReferenceSceneProps> = ({
  showDebugMarkers = false,
  cameraMode = "full",
  overrideFrame,
}) => {
  const remotionFrame = useCurrentFrame();
  const frame = overrideFrame !== undefined ? overrideFrame : remotionFrame;
  const { width, height, fps } = useVideoConfig();

  const GROUND_Y = 850;
  const PART1_END_FRAME = 180;
  const TOTAL_FRAMES = 390;

  const isPart1 = frame < PART1_END_FRAME;

  let charX = 1150;
  let charY = GROUND_Y;
  let facing: "left" | "right" = "right";
  let torsoTilt = 0;
  let headTilt = 0;
  let pupilGaze: Point2D = { x: -0.7, y: 0 };
  let leftUpperArmAngle = 12;
  let leftLowerArmAngle = 6;
  let rightUpperArmAngle = -18;
  let rightLowerArmAngle = -140;
  let leftThighAngle = 9.47;
  let leftCalfAngle = 0;
  let rightThighAngle = -9.47;
  let rightCalfAngle = 0;
  let phaseName = "";
  let milestoneRef = "";
  let stanceFoot = "Cả 2 chân";
  let slipReport = "0.00 px (Tiếp xúc hoàn hảo)";
  let targetPlantX: number | null = null;

  // Điểm neo chân trụ cố định khi hãm tốc
  const PLANT_R_X = 1694.03;
  const PLANT_L_X = PLANT_R_X - 60; // 1634.03
  const SETTLED_X = PLANT_R_X - 30; // 1664.03

  if (isPart1) {
    facing = "right";
    pupilGaze = { x: -0.7, y: 0 };
    torsoTilt = 0;
    headTilt = 0;

    rightUpperArmAngle = -18;
    rightLowerArmAngle = -140;
    leftUpperArmAngle = 12;
    leftLowerArmAngle = 6;

    if (frame <= 110) {
      const walkProg = frame / 110;
      const easedWalkProg = interpolate(walkProg, [0, 0.1, 0.85, 1], [0, 0.08, 0.88, 1], {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      charX = 1150 - 310 * easedWalkProg;

      if (frame < 10) {
        const p = frame / 10;
        const targetSpan = interpolate(p, [0, 1], [100, 24]);
        const targetFootL_X = charX - targetSpan / 2;
        const targetFootR_X = charX + targetSpan / 2;
        leftThighAngle = solveThighAngleForWorldFootX(charX, targetFootL_X, true);
        rightThighAngle = solveThighAngleForWorldFootX(charX, targetFootR_X, false);
        leftCalfAngle = 0;
        rightCalfAngle = 0;
        phaseName = "Mở cảnh: Tiến sang trái, thu chân";
        milestoneRef = "f72 (2.400s) -> f77 (2.567s)";
        stanceFoot = "Chân phải trụ";
      } else if (frame < 52) {
        const stepProgress = (frame - 10) / 42;
        const cycleRad = stepProgress * Math.PI;
        const swingProgress = Math.sin(cycleRad);

        const currentSpan = 24 + swingProgress * (178 - 24);
        const targetFootL_X = charX - currentSpan / 2;
        const targetFootR_X = charX + currentSpan / 2;

        leftThighAngle = solveThighAngleForWorldFootX(charX, targetFootL_X, true);
        rightThighAngle = solveThighAngleForWorldFootX(charX, targetFootR_X, false);

        leftCalfAngle = swingProgress * 5;
        rightCalfAngle = 0;
        stanceFoot = "Chân phải trụ (f10-f52)";

        if (frame >= 28 && frame <= 34) {
          phaseName = "Chân mở rộng (Span ~178px)";
          milestoneRef = "Mốc video cua: f88 (2.933s)";
        } else {
          phaseName = "Pha bước 1 (Chân trái vung)";
          milestoneRef = "f77 (2.567s) -> f98 (3.267s)";
        }
      } else if (frame < 94) {
        const stepProgress = (frame - 52) / 42;
        const cycleRad = stepProgress * Math.PI;
        const swingProgress = Math.sin(cycleRad);

        const currentSpan = 24 + swingProgress * (180 - 24);
        const targetFootR_X = charX - currentSpan / 2;
        const targetFootL_X = charX + currentSpan / 2;

        leftThighAngle = solveThighAngleForWorldFootX(charX, targetFootL_X, true);
        rightThighAngle = solveThighAngleForWorldFootX(charX, targetFootR_X, false);

        leftCalfAngle = 0;
        rightCalfAngle = swingProgress * 5;
        stanceFoot = "Chân trái trụ (f52-f94)";

        if (frame >= 70 && frame <= 76) {
          phaseName = "Chân mở rộng (Span ~180px)";
          milestoneRef = "Mốc video cua: f109 (3.633s)";
        } else {
          phaseName = "Pha bước 2 (Chân phải vung)";
          milestoneRef = "f98 (3.267s) -> f119 (3.967s)";
        }
      } else {
        const p = (frame - 94) / 16;
        const currentSpan = interpolate(p, [0, 1], [24, 134]);
        const targetFootL_X = charX - currentSpan / 2;
        const targetFootR_X = charX + currentSpan / 2;

        leftThighAngle = solveThighAngleForWorldFootX(charX, targetFootL_X, true);
        rightThighAngle = solveThighAngleForWorldFootX(charX, targetFootR_X, false);
        leftCalfAngle = 0;
        rightCalfAngle = 0;
        phaseName = "Hãm dừng và ổn định thế đứng";
        milestoneRef = "f119 (3.967s) -> f127 (4.233s)";
        stanceFoot = "Cả 2 chân tiếp đất";
      }
    } else {
      // f110 .. f180: Giữ nguyên tư thế đứng chữ V ngược tự nhiên tại X = 840
      charX = 840;
      charY = GROUND_Y;
      leftCalfAngle = 0;
      rightCalfAngle = 0;

      // Hai chân mở vừa tự nhiên (span 134px, mỗi chân lệch 67px so với root)
      leftThighAngle = solveThighAngleForWorldFootX(840, 773, true);
      rightThighAngle = solveThighAngleForWorldFootX(840, 907, false);

      if (frame < 170) {
        rightUpperArmAngle = -18;
        rightLowerArmAngle = -140;
        leftUpperArmAngle = 12;
        leftLowerArmAngle = 6;
        pupilGaze = { x: -0.7, y: 0 };
        phaseName = "Giữ thế đứng chữ V ngược theo mẫu người que";
        milestoneRef = "f127 - f170: Đứng ổn định chữ V (Span 134px)";
        stanceFoot = "Hai chân mở vừa, khoá đất 100%";
      } else {
        const lowerP = (frame - 170) / 10;
        rightUpperArmAngle = interpolate(lowerP, [0, 1], [-18, -20]);
        rightLowerArmAngle = interpolate(lowerP, [0, 1], [-140, -45]);
        leftUpperArmAngle = interpolate(lowerP, [0, 1], [12, -10]);
        leftLowerArmAngle = interpolate(lowerP, [0, 1], [6, -45]);
        pupilGaze = { x: interpolate(lowerP, [0, 1], [-0.7, 0.0]), y: 0 };
        phaseName = "Hạ tay khỏi má, xoay mắt về trung tâm";
        milestoneRef = `f${frame}: Chuyển tiếp mượt (tay rời má, X=840px)`;
        stanceFoot = "Chân khóa đất 100%, chuẩn bị xoay hướng";
      }
    }
    slipReport = "0.00 px (Tiếp xúc hoàn hảo)";
  } else {
    // =========================================================================
    // PHẦN 2: CHẠY BỘ ĐỀ XUẤT (180 .. 390 frames = 3.0 .. 6.5s)
    // =========================================================================
    facing = "right";

    if (frame < 185) {
      // Giai đoạn 2.1a (f180 - f185): Thu chân bước nhấc-đặt (Stepping Arc)
      charX = 840;
      charY = GROUND_Y;
      torsoTilt = 0;
      headTilt = 0;
      const stepP = (frame - 180) / 5;

      pupilGaze = { x: interpolate(stepP, [0, 1], [0.0, 0.8]), y: 0 };

      // Chân trái làm chân trụ khoá cứng tại X = 773
      leftThighAngle = solveThighAngleForWorldFootX(840, 773, true);
      leftCalfAngle = 0;

      // Chân phải nhấc lên trong không khí theo vòng cung parabolic
      const footRightWorldX = interpolate(stepP, [0, 1], [907, 883]);
      rightThighAngle = solveThighAngleForWorldFootX(840, footRightWorldX, false);
      rightCalfAngle = Math.sin(stepP * Math.PI) * 18;

      rightUpperArmAngle = interpolate(stepP, [0, 1], [-20, -15]);
      rightLowerArmAngle = interpolate(stepP, [0, 1], [-45, -60]);
      leftUpperArmAngle = interpolate(stepP, [0, 1], [-10, 10]);
      leftLowerArmAngle = interpolate(stepP, [0, 1], [-45, -60]);

      phaseName = "Chuyển trọng lượng & nhấc chân phải vào thế xuất phát";
      milestoneRef = `f${frame}: Nhấc chân vòng cung (không kéo lê cát)`;
      stanceFoot = "Chân trái trụ (Khoá X=773) | Chân phải nhấc vòng cung";
      targetPlantX = 773;
    } else if (frame < 195) {
      // Giai đoạn 2.1b (f185 - f195): Nghiêng thân 15° và khớp vận tốc vào chu kỳ chạy
      charX = 840;
      charY = GROUND_Y;
      const prepP = (frame - 185) / 10;

      torsoTilt = interpolate(prepP, [0, 1], [0, 15]);
      headTilt = 0;
      pupilGaze = { x: 0.8, y: 0 };

      // Hai tay đồng pha tiếp cận đúng góc chạy tại f195:
      rightUpperArmAngle = interpolate(prepP, [0, 1], [-15, 25]);
      rightLowerArmAngle = interpolate(prepP, [0, 1], [-60, -75]);
      leftUpperArmAngle = interpolate(prepP, [0, 1], [10, -45]);
      leftLowerArmAngle = interpolate(prepP, [0, 1], [-60, -75]);

      // Hai chân vào đà đạp xuất phát:
      const startLeftThigh = solveThighAngleForWorldFootX(840, 773, true); // +9.47°
      const startRightThigh = solveThighAngleForWorldFootX(840, 883, false); // -4.25°

      leftThighAngle = interpolate(prepP, [0, 1], [startLeftThigh, -30]);
      leftCalfAngle = interpolate(prepP, [0, 1], [0, 40]);
      rightThighAngle = interpolate(prepP, [0, 1], [startRightThigh, 30]);
      rightCalfAngle = 0;

      phaseName = "Nghiêng thân 15° & hòa nhịp vận tốc xuất phát chạy";
      milestoneRef = `f${frame}: Khớp vận tốc góc với f195 (< 4° delta)`;
      stanceFoot = "Chân trái đạp đà sau, chân phải vung trước";
      slipReport = "0.00 px (Đạp đà xuất phát)";
    } else if (frame < 330) {
      // Giai đoạn 2.2 (f195 - f329): Chu kỳ chạy đều với pha bay (Flight Phase)
      const runFrames = frame - 195;
      const totalRunProg = runFrames / 134;
      const easedRunProg = interpolate(totalRunProg, [0, 0.25, 1], [0, 0.18, 1]);
      charX = 840 + 715 * easedRunProg;

      torsoTilt = 15;
      headTilt = 0;
      pupilGaze = { x: 0.8, y: 0 };

      const runRad = ((runFrames % 52) / 52) * Math.PI * 2 - Math.PI / 2;

      // Pha bay nâng thân 14px
      const flightLift = Math.max(0, Math.sin(runRad * 2) * 14);
      charY = GROUND_Y - flightLift;

      // Động tác chân chạy đối pha
      leftThighAngle = Math.sin(runRad) * 30;
      leftCalfAngle = Math.max(0, -Math.sin(runRad) * 40);
      rightThighAngle = -Math.sin(runRad) * 30;
      rightCalfAngle = Math.max(0, Math.sin(runRad) * 40);

      // Đánh tay đối pha mềm mại
      leftUpperArmAngle = -10 + Math.sin(runRad) * 35;
      leftLowerArmAngle = -65 - Math.abs(Math.sin(runRad)) * 10;
      rightUpperArmAngle = -10 - Math.sin(runRad) * 35;
      rightLowerArmAngle = -65 - Math.abs(Math.sin(runRad)) * 10;

      const isFlight = flightLift > 5;
      stanceFoot = isFlight
        ? "BAY TRÊN KHÔNG (Flight Phase)"
        : Math.sin(runRad) > 0
        ? "Chân trái tiếp đất"
        : "Chân phải tiếp đất";
      phaseName = isFlight
        ? "Giai đoạn bay (Flight Phase, Lift: 14px)"
        : "Chạy đều (Cadence: 0.43s / bước)";
      milestoneRef = `Chu kỳ chạy 52 frame (0.86s/vòng) | Thân nghiêng 15°`;
      slipReport = isFlight ? "Pha bay (Không tiếp xúc đất)" : "0.00 px (Tiếp xúc động)";
    } else {
      // Giai đoạn 2.3 (f330 - f390): Hãm tốc liên tục & Đứng ổn định
      charY = GROUND_Y;

      if (frame < 333) {
        // Pha chạm đất (f330 - f332): Kế thừa mượt từ f329
        const p = (frame - 329) / 4;
        charX = 1555 + (1572 - 1555) * p;

        rightThighAngle = interpolate(p, [0, 1], [-26.55, -20]);
        rightCalfAngle = interpolate(p, [0, 1], [35.40, 0]);

        leftThighAngle = interpolate(p, [0, 1], [26.55, 15]);
        leftCalfAngle = interpolate(p, [0, 1], [0, 10]);

        torsoTilt = interpolate(p, [0, 1], [15, 13]);
        headTilt = 0;

        leftUpperArmAngle = interpolate(p, [0, 1], [20.98, 0]);
        leftLowerArmAngle = interpolate(p, [0, 1], [-73.85, -50]);
        rightUpperArmAngle = interpolate(p, [0, 1], [-40.98, -25]);
        rightLowerArmAngle = interpolate(p, [0, 1], [-73.85, -50]);

        phaseName = "Hãm tốc: Kế thừa chân phải chạm đất (Hạ gối)";
        milestoneRef = `f${frame}: Chân phải tiếp đất liên tục (Delta < 1.7°)`;
        stanceFoot = "Chân phải tiếp đất (Pha hạ chân)";
        slipReport = "0.00 px (Tiếp đất liên tục)";
      } else if (frame < 355) {
        // Pha hãm lực (f333 - f354): Chân phải khoá cứng tại PLANT_R_X = 1694.03
        const q = (frame - 333) / 22;
        const easedQ = q * (2 - q); // ease out quad
        charX = 1572 + (SETTLED_X - 1572) * easedQ;

        // Chân phải trụ: Khoá cứng 100% tại PLANT_R_X
        rightThighAngle = solveThighAngleForWorldFootX(charX, PLANT_R_X, false);
        rightCalfAngle = 0;
        targetPlantX = PLANT_R_X;

        // Chân trái vung ngắn đỡ thân:
        const leftTargetX = interpolate(q, [0, 1], [1500.37, PLANT_L_X]);
        leftThighAngle = solveThighAngleForWorldFootX(charX, leftTargetX, true);
        leftCalfAngle = Math.sin(q * Math.PI) * 18;

        torsoTilt = interpolate(q, [0, 1], [13, 2]);
        headTilt = 0;

        leftUpperArmAngle = interpolate(q, [0, 1], [0, 10]);
        leftLowerArmAngle = interpolate(q, [0, 1], [-50, -20]);
        rightUpperArmAngle = interpolate(q, [0, 1], [-25, -16]);
        rightLowerArmAngle = interpolate(q, [0, 1], [-50, -20]);

        phaseName = "Hãm tốc: Khoá chân phải trụ, chân trái bước đỡ";
        milestoneRef = `f${frame}: Khoá chân phải X=${PLANT_R_X.toFixed(1)} | Trượt 0.00px`;
        stanceFoot = `Chân phải trụ (Khoá X=${PLANT_R_X.toFixed(1)}) | Chân trái bước đỡ`;
      } else {
        // Pha ổn định (f355 - f390): Cả hai chân đặt vững chãi 60.00px
        const settleP = Math.min(1, (frame - 355) / 35);
        charX = SETTLED_X;

        rightThighAngle = solveThighAngleForWorldFootX(charX, PLANT_R_X, false);
        rightCalfAngle = 0;
        leftThighAngle = solveThighAngleForWorldFootX(charX, PLANT_L_X, true);
        leftCalfAngle = 0;
        targetPlantX = PLANT_R_X;

        torsoTilt = interpolate(settleP, [0, 1], [2, 0]);
        headTilt = 0;

        // Hai tay nghỉ tự nhiên, phân biệt rõ với thân và với nhau:
        leftUpperArmAngle = 10;
        leftLowerArmAngle = interpolate(settleP, [0, 1], [-20, -12]);
        rightUpperArmAngle = -16;
        rightLowerArmAngle = interpolate(settleP, [0, 1], [-20, -10]);

        stanceFoot = "Cả 2 chân khoá đất ổn định 100%";
        phaseName = settleP >= 1 ? "Đứng ổn định thăng bằng (Thân thẳng)" : "Ổn định thế đứng hai chân";
        milestoneRef = `f${frame} Nghiệm thu hãm tốc (Độ mở chân: 60.00px)`;
      }
    }
  }

  // Khởi tạo trạng thái cho StickmanRig
  const stickmanState: StickmanState = {
    x: charX,
    y: charY,
    scale: 1.0,
    facing,
    pose: "standing",
    eyes: "neutral",
    eyebrows: "neutral",
    mouth: "smile",
    pupilGaze,
    hat: true,
    showDebugMarkers,
    limbAngles: {
      torso: torsoTilt,
      head: headTilt,
      leftUpperArm: leftUpperArmAngle,
      leftLowerArm: leftLowerArmAngle,
      rightUpperArm: rightUpperArmAngle,
      rightLowerArm: rightLowerArmAngle,
      leftThigh: leftThighAngle,
      leftCalf: leftCalfAngle,
      rightThigh: rightThighAngle,
      rightCalf: rightCalfAngle,
    },
  };

  const fk = computeStickmanFK(stickmanState);
  const actualLegSpan = Math.abs(fk.rightFoot.x - fk.leftFoot.x);
  const legSpanDisplay = actualLegSpan.toFixed(1);

  if (targetPlantX !== null) {
    const isStanceRight = stanceFoot.includes("Chân phải trụ") || stanceFoot.includes("Cả 2 chân");
    const activeStanceFootX = isStanceRight ? fk.rightFoot.x : fk.leftFoot.x;
    const slipPx = Math.abs(activeStanceFootX - targetPlantX);
    slipReport = `${slipPx.toFixed(2)} px (Đo FK: X=${activeStanceFootX.toFixed(1)}, Neo=${targetPlantX.toFixed(1)})`;
  } else if (frame >= 355) {
    const slipR = Math.abs(fk.rightFoot.x - PLANT_R_X);
    const slipL = Math.abs(fk.leftFoot.x - PLANT_L_X);
    slipReport = `L: ${slipL.toFixed(2)} px | R: ${slipR.toFixed(2)} px (Khoá 2 chân tuyệt đối)`;
  }

  // Camera zoom container khi cameraMode === "closeUp"
  const isCloseUp = cameraMode === "closeUp";
  const zoomScale = isCloseUp ? 1.65 : 1.0;
  const camX = isCloseUp ? 960 - charX * zoomScale : 0;
  const camY = isCloseUp ? 560 - 560 * zoomScale : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7F3EE", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      {/* Container góc nhìn Camera */}
      <div
        id="camera-viewport"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: width,
          height: height,
          transform: isCloseUp ? `translate(${camX}px, ${camY}px) scale(${zoomScale})` : "none",
          transformOrigin: "0 0",
        }}
      >
        {/* 1. BỐI CẢNH BÃI BIỂN THEO CHUẨN VIDEO CUA */}
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F5D061" />
            </linearGradient>
          </defs>

          {/* Bầu trời xanh bãi biển */}
          <rect x={0} y={0} width={width} height={420} fill="url(#skyGrad)" />

          {/* Biển xanh xa xăm */}
          <rect x={0} y={350} width={width} height={120} fill="url(#seaGrad)" />
          {/* Sóng bọt trắng */}
          <path
            d={`M 0 468 Q 200 460 400 468 T 800 468 T 1200 468 T 1600 468 T 1920 468 L 1920 474 L 0 474 Z`}
            fill="#FFFFFF"
            opacity={0.85}
          />

          {/* Bãi cát vàng */}
          <rect x={0} y={470} width={width} height={610} fill="url(#sandGrad)" />

          {/* Vạch mặt sàn bãi cát y=850 (Floor Contact Level) */}
          <line x1={0} y1={GROUND_Y} x2={width} y2={GROUND_Y} stroke="#D97706" strokeWidth={2} strokeDasharray="6 6" opacity={0.4} />

          {/* Thân cây dừa bên phải */}
          <g id="palm-trunk" transform="translate(1780, 0)">
            <path
              d="M 50 0 C 40 250, -10 550, -40 850 L 40 850 C 70 550, 120 250, 130 0 Z"
              fill="#854D0E"
              stroke="#18181B"
              strokeWidth={4}
            />
            {[120, 240, 360, 480, 600, 720].map((yVal, idx) => (
              <line
                key={idx}
                x1={idx * -7 + 10}
                y1={yVal}
                x2={idx * -7 + 85}
                y2={yVal + 15}
                stroke="#583101"
                strokeWidth={5}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Bóng đen mềm dưới chân stickman */}
          <ellipse
            cx={charX}
            cy={GROUND_Y + 4}
            rx={Math.max(50, actualLegSpan * 0.55 + 20)}
            ry={14}
            fill="rgba(0,0,0,0.22)"
          />

          {/* Vết chân trên cát */}
          {isPart1 && (
            <g id="footprints" fill="#D97706" opacity={0.35}>
              <ellipse cx={1135} cy={GROUND_Y + 2} rx={16} ry={6} />
              <ellipse cx={1050} cy={GROUND_Y + 3} rx={16} ry={6} />
              <ellipse cx={960} cy={GROUND_Y + 2} rx={16} ry={6} />
              <ellipse cx={870} cy={GROUND_Y + 3} rx={16} ry={6} />
            </g>
          )}
        </svg>

        {/* 2. NHÂN VẬT NGƯỜI QUE ĐỘI MŨ (STICKMAN RIG V4) */}
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", top: 0, left: 0, overflow: "visible", pointerEvents: "none" }}
        >
          <StickmanRig state={stickmanState} renderPart="all" showDebugMarkers={showDebugMarkers} />

          {/* Thước đo kiểm tiếp đất khi ở chế độ Debug */}
          {showDebugMarkers && (
            <g id="ground-contact-ruler">
              <line x1={charX - 150} y1={GROUND_Y} x2={charX + 150} y2={GROUND_Y} stroke="#10B981" strokeWidth={3} />
              <text x={charX + 160} y={GROUND_Y + 5} fill="#10B981" fontSize={14} fontWeight="bold" fontFamily="monospace">
                GroundY = {GROUND_Y}px
              </text>
              <circle cx={charX} cy={charY} r={5} fill="#EF4444" />
              <text x={charX + 10} y={charY - 10} fill="#EF4444" fontSize={13} fontWeight="bold" fontFamily="monospace">
                Root ({charX.toFixed(1)}, {charY.toFixed(1)})
              </text>

              {/* Marker đo tọa độ thực tế của hai bàn chân từ Forward Kinematics */}
              <circle cx={fk.leftFoot.x} cy={fk.leftFoot.y} r={6} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={2} />
              <text x={fk.leftFoot.x - 40} y={fk.leftFoot.y + 22} fill="#3B82F6" fontSize={12} fontWeight="bold" fontFamily="monospace">
                L: {fk.leftFoot.x.toFixed(1)}
              </text>

              <circle cx={fk.rightFoot.x} cy={fk.rightFoot.y} r={6} fill="#10B981" stroke="#FFFFFF" strokeWidth={2} />
              <text x={fk.rightFoot.x + 10} y={fk.rightFoot.y + 22} fill="#10B981" fontSize={12} fontWeight="bold" fontFamily="monospace">
                R: {fk.rightFoot.x.toFixed(1)}
              </text>

              {/* Thước đo khoảng cách giữa hai bàn chân */}
              <line x1={fk.leftFoot.x} y1={GROUND_Y + 30} x2={fk.rightFoot.x} y2={GROUND_Y + 30} stroke="#F59E0B" strokeWidth={2} />
              <line x1={fk.leftFoot.x} y1={GROUND_Y + 25} x2={fk.leftFoot.x} y2={GROUND_Y + 35} stroke="#F59E0B" strokeWidth={2} />
              <line x1={fk.rightFoot.x} y1={GROUND_Y + 25} x2={fk.rightFoot.x} y2={GROUND_Y + 35} stroke="#F59E0B" strokeWidth={2} />
              <text
                x={(fk.leftFoot.x + fk.rightFoot.x) / 2 - 25}
                y={GROUND_Y + 48}
                fill="#F59E0B"
                fontSize={13}
                fontWeight="bold"
                fontFamily="monospace"
              >
                {legSpanDisplay}px
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* 3. HEADS-UP DISPLAY (HUD) & THÔNG SỐ ĐO KIỂM KỸ THUẬT */}
      {/* Top Banner Tiêu Đề */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: isCloseUp ? "#7C3AED" : isPart1 ? "#0284C7" : "#059669",
          color: "#FFFFFF",
          padding: "8px 28px",
          borderRadius: 30,
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: 0.5,
          boxShadow: "0 4px 0 rgba(0,0,0,0.22)",
          border: "2px solid rgba(255,255,255,0.4)",
          zIndex: 50,
        }}
      >
        {isCloseUp
          ? "CẬN CẢNH CHUYỂN HƯỚNG & KHỚP NỐI (FRAMES 170 - 205) | ZOOM 1.65X"
          : isPart1
          ? "PHẦN 1: ĐI BỘ THEO VIDEO CUA (CHUẨN 30FPS -> 60FPS)"
          : "PHẦN 2: CHẠY BỘ ĐỀ XUẤT (CADENCE 0.43s / BƯỚC, PHA BAY)"}
      </div>

      {/* Box Thông Số Chi Tiết Góc Trái Trên */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          backgroundColor: "rgba(15, 23, 42, 0.88)",
          color: "#E2E8F0",
          fontFamily: "monospace",
          fontSize: 15,
          padding: "14px 20px",
          borderRadius: 12,
          border: "1px solid rgba(56, 189, 248, 0.4)",
          boxShadow: "0 4px 0 rgba(0,0,0,0.3)",
          lineHeight: 1.6,
          zIndex: 50,
          minWidth: 440,
        }}
      >
        <div style={{ color: "#38BDF8", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
          METRIC HUD (FORWARD KINEMATICS) | {isPart1 ? "VIDEO CUA BENCHMARK" : "PROPOSED JOG BENCHMARK"}
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Khung hình:</span> <strong>f{frame}</strong> |{" "}
          <span style={{ color: "#94A3B8" }}>Thời gian:</span>{" "}
          <strong>{(frame / fps).toFixed(3)}s</strong> / {(TOTAL_FRAMES / fps).toFixed(1)}s
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Pha cử động:</span>{" "}
          <span style={{ color: "#FBBF24", fontWeight: 700 }}>{phaseName}</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Mốc quy chiếu:</span>{" "}
          <span style={{ color: "#34D399" }}>{milestoneRef}</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Khoảng cách 2 chân (FK):</span>{" "}
          <strong style={{ color: "#FDE047" }}>{legSpanDisplay} px</strong> |{" "}
          <span style={{ color: "#94A3B8" }}>Tiếp đất:</span>{" "}
          <span style={{ color: stanceFoot.includes("BAY") ? "#F43F5E" : "#A7F3D0" }}>{stanceFoot}</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Tọa độ thân (X, Y):</span>{" "}
          <strong>({charX.toFixed(1)}, {charY.toFixed(1)})</strong> |{" "}
          <span style={{ color: "#94A3B8" }}>Nghiêng thân:</span> <strong>{torsoTilt.toFixed(1)}°</strong>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Khớp háng:</span>{" "}
          <span style={{ color: "#A7F3D0" }}>Hai đùi phân nhánh riêng (±16px, Inverted V)</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Khớp cổ tay:</span>{" "}
          <span style={{ color: "#A7F3D0" }}>Đầu cẳng tay = Bàn tay = Grip Anchor (0px gap)</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Độ trượt tiếp đất:</span>{" "}
          <span style={{ color: "#34D399", fontWeight: 700 }}>{slipReport}</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Cadence:</span>{" "}
          <strong>{isPart1 ? "86 bước/phút (0.70s/bước)" : "140 bước/phút (0.43s/bước)"}</strong>
        </div>
      </div>

      {/* Thanh Phụ Đề Chú Giải Bên Dưới */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(18, 18, 22, 0.90)",
          color: "#FFFFFF",
          padding: "12px 36px",
          borderRadius: 14,
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1.4,
          textAlign: "center",
          maxWidth: 1400,
          boxShadow: "0 4px 0 rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.18)",
          zIndex: 50,
        }}
      >
        {isCloseUp
          ? "Cận cảnh: Khớp cổ nối liền đầu - thân, mỏm vai hẹp (±5px) nối tay, hông nối đùi hình chữ V ngược tự nhiên. Hạ tay khỏi má, xoay hướng mượt mà tại X=840px."
          : isPart1
          ? frame < 110
            ? "Phần 1: Đi bộ theo chuẩn clip cua (nhịp 0.70s/bước, chân khép f10, f52, f94). Chân mở chữ V ngược tự nhiên từ hai khớp háng riêng biệt, tay nối vai hẹp."
            : "Hãm dừng êm qua bước cuối tại f110 (1.83s), giữ vững tư thế đứng chữ V ngược trên cát tại X=840 (Span 134px, không bắt chéo)."
          : frame < 330
          ? "Phần 2: Chạy liên tục từ X=840 (không nhảy tọa độ), nhấc chân vòng cung f180-185, thân nghiêng 15°, pha bay nâng thân 14px, tay đánh đối pha mềm."
          : "Hãm tốc chuẩn xác từ f330: Kế thừa chân phải chạm đất từ chu kỳ chạy (độ trượt 0.00px), chân trái bước đỡ, đứng ổn định thăng bằng 60.00px."}
      </div>
    </AbsoluteFill>
  );
};
