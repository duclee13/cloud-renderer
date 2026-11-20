import * as fs from "fs";
import * as path from "path";
import { computeStickmanFK } from "../src/remotion/components/character/StickmanRig";
import { StickmanState, Point2D } from "../src/remotion/types/character";
import {
  solveThighAngleForWorldFootX,
  computeWorldFootXFromThighAngle,
} from "../src/remotion/compositions/WalkRunReferenceScene";

function interpolate(
  input: number,
  inputRange: number[],
  outputRange: number[]
): number {
  if (input <= inputRange[0]) return outputRange[0];
  if (input >= inputRange[inputRange.length - 1])
    return outputRange[outputRange.length - 1];

  for (let i = 0; i < inputRange.length - 1; i++) {
    const minIn = inputRange[i];
    const maxIn = inputRange[i + 1];
    if (input >= minIn && input <= maxIn) {
      const minOut = outputRange[i];
      const maxOut = outputRange[i + 1];
      const t = (input - minIn) / (maxIn - minIn);
      return minOut + t * (maxOut - minOut);
    }
  }
  return outputRange[outputRange.length - 1];
}

function calculateFrameState(frame: number) {
  const fps = 60;
  const GROUND_Y = 850;
  const PART1_END_FRAME = 180;

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
  let stanceFoot = "Cả 2 chân";
  let targetPlantX: number | null = null;

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
      const easedWalkProg = interpolate(walkProg, [0, 0.1, 0.85, 1], [0, 0.08, 0.88, 1]);
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
        phaseName = "Pha bước 1 (Chân trái vung)";
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
        phaseName = "Pha bước 2 (Chân phải vung)";
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
        stanceFoot = "Cả 2 chân tiếp đất";
      }
    } else {
      charX = 840;
      charY = GROUND_Y;
      leftCalfAngle = 0;
      rightCalfAngle = 0;

      leftThighAngle = solveThighAngleForWorldFootX(840, 773, true);
      rightThighAngle = solveThighAngleForWorldFootX(840, 907, false);

      if (frame < 170) {
        rightUpperArmAngle = -18;
        rightLowerArmAngle = -140;
        leftUpperArmAngle = 12;
        leftLowerArmAngle = 6;
        pupilGaze = { x: -0.7, y: 0 };
        phaseName = "Giữ thế đứng chữ V ngược";
        stanceFoot = "Hai chân mở vừa (X=773, 907)";
      } else {
        const lowerP = (frame - 170) / 10;
        rightUpperArmAngle = interpolate(lowerP, [0, 1], [-18, -20]);
        rightLowerArmAngle = interpolate(lowerP, [0, 1], [-140, -45]);
        leftUpperArmAngle = interpolate(lowerP, [0, 1], [12, -10]);
        leftLowerArmAngle = interpolate(lowerP, [0, 1], [6, -45]);
        pupilGaze = { x: interpolate(lowerP, [0, 1], [-0.7, 0.0]), y: 0 };
        phaseName = "Hạ tay khỏi má, xoay mắt về trước";
        stanceFoot = "Hai chân mở vừa (X=773, 907)";
      }
    }
  } else {
    facing = "right";

    if (frame < 185) {
      charX = 840;
      charY = GROUND_Y;
      torsoTilt = 0;
      headTilt = 0;
      const stepP = (frame - 180) / 5;
      pupilGaze = { x: interpolate(stepP, [0, 1], [0.0, 0.8]), y: 0 };

      leftThighAngle = solveThighAngleForWorldFootX(840, 773, true);
      leftCalfAngle = 0;

      const footRightWorldX = interpolate(stepP, [0, 1], [907, 883]);
      rightThighAngle = solveThighAngleForWorldFootX(840, footRightWorldX, false);
      rightCalfAngle = Math.sin(stepP * Math.PI) * 18;

      rightUpperArmAngle = interpolate(stepP, [0, 1], [-20, -15]);
      rightLowerArmAngle = interpolate(stepP, [0, 1], [-45, -60]);
      leftUpperArmAngle = interpolate(stepP, [0, 1], [-10, 10]);
      leftLowerArmAngle = interpolate(stepP, [0, 1], [-45, -60]);

      phaseName = "Chuyển trọng lượng & nhấc chân phải vào thế xuất phát";
      stanceFoot = "Chân trái trụ (Khoá X=773) | Chân phải nhấc vòng cung";
      targetPlantX = 773;
    } else if (frame < 195) {
      charX = 840;
      charY = GROUND_Y;
      const prepP = (frame - 185) / 10;
      torsoTilt = interpolate(prepP, [0, 1], [0, 15]);
      headTilt = 0;
      pupilGaze = { x: 0.8, y: 0 };

      rightUpperArmAngle = interpolate(prepP, [0, 1], [-15, 25]);
      rightLowerArmAngle = interpolate(prepP, [0, 1], [-60, -75]);
      leftUpperArmAngle = interpolate(prepP, [0, 1], [10, -45]);
      leftLowerArmAngle = interpolate(prepP, [0, 1], [-60, -75]);

      const startLeftThigh = solveThighAngleForWorldFootX(840, 773, true);
      const startRightThigh = solveThighAngleForWorldFootX(840, 883, false);

      leftThighAngle = interpolate(prepP, [0, 1], [startLeftThigh, -30]);
      leftCalfAngle = interpolate(prepP, [0, 1], [0, 40]);
      rightThighAngle = interpolate(prepP, [0, 1], [startRightThigh, 30]);
      rightCalfAngle = 0;

      phaseName = "Nghiêng thân 15° & hòa nhịp vận tốc xuất phát chạy";
      stanceFoot = "Chân trái đạp đà sau, chân phải vung trước";
    } else if (frame < 330) {
      const runFrames = frame - 195;
      const totalRunProg = runFrames / 134;
      const easedRunProg = interpolate(totalRunProg, [0, 0.25, 1], [0, 0.18, 1]);
      charX = 840 + 715 * easedRunProg;

      torsoTilt = 15;
      headTilt = 0;
      pupilGaze = { x: 0.8, y: 0 };

      const runRad = ((runFrames % 52) / 52) * Math.PI * 2 - Math.PI / 2;
      const flightLift = Math.max(0, Math.sin(runRad * 2) * 14);
      charY = GROUND_Y - flightLift;

      leftThighAngle = Math.sin(runRad) * 30;
      leftCalfAngle = Math.max(0, -Math.sin(runRad) * 40);
      rightThighAngle = -Math.sin(runRad) * 30;
      rightCalfAngle = Math.max(0, Math.sin(runRad) * 40);

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
    } else {
      charY = GROUND_Y;

      if (frame < 333) {
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
        stanceFoot = "Chân phải tiếp đất (Pha hạ chân)";
      } else if (frame < 355) {
        const q = (frame - 333) / 22;
        const easedQ = q * (2 - q);
        charX = 1572 + (SETTLED_X - 1572) * easedQ;

        rightThighAngle = solveThighAngleForWorldFootX(charX, PLANT_R_X, false);
        rightCalfAngle = 0;
        targetPlantX = PLANT_R_X;

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
        stanceFoot = `Chân phải trụ (Khoá X=${PLANT_R_X.toFixed(1)}) | Chân trái bước đỡ`;
      } else {
        const settleP = Math.min(1, (frame - 355) / 35);
        charX = SETTLED_X;

        rightThighAngle = solveThighAngleForWorldFootX(charX, PLANT_R_X, false);
        rightCalfAngle = 0;
        leftThighAngle = solveThighAngleForWorldFootX(charX, PLANT_L_X, true);
        leftCalfAngle = 0;
        targetPlantX = PLANT_R_X;

        torsoTilt = interpolate(settleP, [0, 1], [2, 0]);
        headTilt = 0;

        leftUpperArmAngle = 10;
        leftLowerArmAngle = interpolate(settleP, [0, 1], [-20, -12]);
        rightUpperArmAngle = -16;
        rightLowerArmAngle = interpolate(settleP, [0, 1], [-20, -10]);

        stanceFoot = "Cả 2 chân khoá đất ổn định 100%";
        phaseName = settleP >= 1 ? "Đứng ổn định thăng bằng (Thân thẳng)" : "Ổn định thế đứng hai chân";
      }
    }
  }

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
    showDebugMarkers: true,
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
  const legSpan = Math.abs(fk.rightFoot.x - fk.leftFoot.x);

  let slipPx = 0;
  if (targetPlantX !== null) {
    const isStanceRight = stanceFoot.includes("Chân phải trụ") || stanceFoot.includes("Cả 2 chân");
    const activeStanceFootX = isStanceRight ? fk.rightFoot.x : fk.leftFoot.x;
    slipPx = Math.abs(activeStanceFootX - targetPlantX);
  }

  return {
    frame,
    timeSec: frame / fps,
    phase: phaseName,
    charX,
    charY,
    torsoTilt,
    leftThighAngle,
    leftCalfAngle,
    rightThighAngle,
    rightCalfAngle,
    leftUpperArmAngle,
    leftLowerArmAngle,
    rightUpperArmAngle,
    rightLowerArmAngle,
    fk,
    legSpan,
    stanceFoot,
    targetPlantX: targetPlantX ?? 0,
    slipPx,
  };
}

export function generateCsv() {
  const TOTAL_FRAMES = 391; // 0 to 390
  const rows: string[] = [];

  rows.push(
    [
      "frame",
      "time_s",
      "phase",
      "root_x",
      "root_y",
      "torso_tilt_deg",
      "head_center_x",
      "head_center_y",
      "neck_x",
      "neck_y",
      "left_shoulder_x",
      "left_shoulder_y",
      "right_shoulder_x",
      "right_shoulder_y",
      "left_elbow_x",
      "left_elbow_y",
      "right_elbow_x",
      "right_elbow_y",
      "left_wrist_x",
      "left_wrist_y",
      "right_wrist_x",
      "right_wrist_y",
      "left_hip_x",
      "left_hip_y",
      "right_hip_x",
      "right_hip_y",
      "left_knee_x",
      "left_knee_y",
      "right_knee_x",
      "right_knee_y",
      "left_foot_x",
      "left_foot_y",
      "right_foot_x",
      "right_foot_y",
      "leg_span_px",
      "stance_foot",
      "target_plant_x",
      "slip_error_px",
    ].join(",")
  );

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const d = calculateFrameState(f);
    const row = [
      d.frame,
      d.timeSec.toFixed(3),
      `"${d.phase.replace(/"/g, '""')}"`,
      d.charX.toFixed(2),
      d.charY.toFixed(2),
      d.torsoTilt.toFixed(2),
      d.fk.headCenter.x.toFixed(2),
      d.fk.headCenter.y.toFixed(2),
      d.fk.neck.x.toFixed(2),
      d.fk.neck.y.toFixed(2),
      d.fk.leftShoulder.x.toFixed(2),
      d.fk.leftShoulder.y.toFixed(2),
      d.fk.rightShoulder.x.toFixed(2),
      d.fk.rightShoulder.y.toFixed(2),
      d.fk.leftElbow.x.toFixed(2),
      d.fk.leftElbow.y.toFixed(2),
      d.fk.rightElbow.x.toFixed(2),
      d.fk.rightElbow.y.toFixed(2),
      d.fk.leftWrist.x.toFixed(2),
      d.fk.leftWrist.y.toFixed(2),
      d.fk.rightWrist.x.toFixed(2),
      d.fk.rightWrist.y.toFixed(2),
      d.fk.leftHip.x.toFixed(2),
      d.fk.leftHip.y.toFixed(2),
      d.fk.rightHip.x.toFixed(2),
      d.fk.rightHip.y.toFixed(2),
      d.fk.leftKnee.x.toFixed(2),
      d.fk.leftKnee.y.toFixed(2),
      d.fk.rightKnee.x.toFixed(2),
      d.fk.rightKnee.y.toFixed(2),
      d.fk.leftFoot.x.toFixed(2),
      d.fk.leftFoot.y.toFixed(2),
      d.fk.rightFoot.x.toFixed(2),
      d.fk.rightFoot.y.toFixed(2),
      d.legSpan.toFixed(2),
      `"${d.stanceFoot.replace(/"/g, '""')}"`,
      d.targetPlantX.toFixed(2),
      d.slipPx.toFixed(4),
    ].join(",");
    rows.push(row);
  }

  const outDir = path.resolve(__dirname, "../../out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const csvPath = path.join(outDir, "joint_coordinates_timeline.csv");
  fs.writeFileSync(csvPath, rows.join("\n"), "utf-8");
  console.log(`Successfully generated CSV timeline at ${csvPath} (${rows.length} rows)`);
}

generateCsv();
