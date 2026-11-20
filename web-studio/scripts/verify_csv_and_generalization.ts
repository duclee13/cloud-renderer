import * as fs from "fs";
import * as path from "path";
import {
  solveThighAngleForWorldFootX,
  computeWorldFootXFromThighAngle,
} from "../src/remotion/compositions/WalkRunReferenceScene";
import { computeStickmanFK } from "../src/remotion/components/character/StickmanRig";
import { StickmanState } from "../src/remotion/types/character";

console.log("=================================================================");
console.log("1. KIỂM CHỨNG DỮ LIỆU CSV TẠI CÁC MỐC QUAN TRỌNG (KEY FRAMES)");
console.log("=================================================================");

const csvPath = path.resolve(__dirname, "../../out/joint_coordinates_timeline.csv");
const lines = fs.readFileSync(csvPath, "utf-8").trim().split("\n");

function getFrameData(frameNum: number) {
  const line = lines[frameNum + 1];
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      parts.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  parts.push(current);

  return {
    frame: parseInt(parts[0]),
    time: parts[1],
    phase: parts[2],
    rootX: parseFloat(parts[3]),
    rootY: parseFloat(parts[4]),
    torsoTilt: parseFloat(parts[5]),
    leftShoulder: { x: parseFloat(parts[10]), y: parseFloat(parts[11]) },
    rightShoulder: { x: parseFloat(parts[12]), y: parseFloat(parts[13]) },
    leftWrist: { x: parseFloat(parts[18]), y: parseFloat(parts[19]) },
    rightWrist: { x: parseFloat(parts[20]), y: parseFloat(parts[21]) },
    leftHip: { x: parseFloat(parts[22]), y: parseFloat(parts[23]) },
    rightHip: { x: parseFloat(parts[24]), y: parseFloat(parts[25]) },
    leftKnee: { x: parseFloat(parts[26]), y: parseFloat(parts[27]) },
    rightKnee: { x: parseFloat(parts[28]), y: parseFloat(parts[29]) },
    leftFoot: { x: parseFloat(parts[30]), y: parseFloat(parts[31]) },
    rightFoot: { x: parseFloat(parts[32]), y: parseFloat(parts[33]) },
    legSpan: parseFloat(parts[34]),
    stance: parts[35],
    targetPlantX: parseFloat(parts[36]),
    slipError: parseFloat(parts[37]),
  };
}

const checkFrames = [150, 179, 180, 185, 194, 195, 329, 330, 333, 350, 389];
for (const f of checkFrames) {
  const d = getFrameData(f);
  console.log(`\n>>> FRAME f${d.frame} (${d.time}s) | Pha: ${d.phase}`);
  console.log(`  Root: (${d.rootX}, ${d.rootY}) | Torso: ${d.torsoTilt}°`);
  console.log(`  Left Hip: (${d.leftHip.x}, ${d.leftHip.y}) -> Knee: (${d.leftKnee.x}, ${d.leftKnee.y}) -> Foot: (${d.leftFoot.x}, ${d.leftFoot.y})`);
  console.log(`  Right Hip: (${d.rightHip.x}, ${d.rightHip.y}) -> Knee: (${d.rightKnee.x}, ${d.rightKnee.y}) -> Foot: (${d.rightFoot.x}, ${d.rightFoot.y})`);
  console.log(`  Leg Span: ${d.legSpan} px | Stance: ${d.stance} | Slip Error: ${d.slipError} px`);

  // Check 1: Inverted V - Left foot < Left hip, Right foot > Right hip at f150, f179, f180
  if (f === 150 || f === 179 || f === 180) {
    const isLeftFootLeftOfHip = d.leftFoot.x < d.leftHip.x;
    const isRightFootRightOfHip = d.rightFoot.x > d.rightHip.x;
    const noCrossing = d.leftFoot.x < d.rightFoot.x && d.leftKnee.x < d.rightKnee.x;
    console.log(`  [ASSERT] Không bắt chéo (Inverted V): LeftFoot < LeftHip (${isLeftFootLeftOfHip}), RightFoot > RightHip (${isRightFootRightOfHip}), NoCrossing (${noCrossing})`);
    if (!isLeftFootLeftOfHip || !isRightFootRightOfHip || !noCrossing) {
      console.error(`  FAIL: Thigh crossing detected at frame ${f}!`);
      process.exit(1);
    }
  }

  // Check 2: f389 Leg span should be exactly 60.00px
  if (f === 389) {
    console.log(`  [ASSERT] Khoảng cách chân tại f389: ${d.legSpan} px (Mục tiêu: 60.00 px)`);
    if (Math.abs(d.legSpan - 60.0) > 0.05) {
      console.error(`  FAIL: Leg span at f389 is ${d.legSpan}, expected 60.00px!`);
      process.exit(1);
    }
    console.log(`  [ASSERT] Sai số trượt chân trụ tại f389: ${d.slipError} px (Mục tiêu: 0.00 px)`);
    if (d.slipError > 0.01) {
      console.error(`  FAIL: Slip error at f389 is ${d.slipError}, expected 0.00px!`);
      process.exit(1);
    }
  }
}

// Check 3: Continuity across boundaries
console.log("\n=================================================================");
console.log("2. KIỂM TRA ĐỘ LIÊN TỤC VẬN TỐC TẠI RANH GIỚI HÀNH ĐỘNG");
console.log("=================================================================");

const d194 = getFrameData(194);
const d195 = getFrameData(195);
console.log(`Ranh giới f194 -> f195 (Chuyển sang chu kỳ chạy):`);
console.log(`  Root Delta: dx=${(d195.rootX - d194.rootX).toFixed(2)}px, dy=${(d195.rootY - d194.rootY).toFixed(2)}px`);
console.log(`  Torso Delta: ${(d195.torsoTilt - d194.torsoTilt).toFixed(2)}°`);
console.log(`  Left Foot Delta: dx=${(d195.leftFoot.x - d194.leftFoot.x).toFixed(2)}px, dy=${(d195.leftFoot.y - d194.leftFoot.y).toFixed(2)}px`);
console.log(`  Right Foot Delta: dx=${(d195.rightFoot.x - d194.rightFoot.x).toFixed(2)}px, dy=${(d195.rightFoot.y - d194.rightFoot.y).toFixed(2)}px`);
console.log(`  Left Wrist Delta: dx=${(d195.leftWrist.x - d194.leftWrist.x).toFixed(2)}px, dy=${(d195.leftWrist.y - d194.leftWrist.y).toFixed(2)}px`);
console.log(`  Right Wrist Delta: dx=${(d195.rightWrist.x - d194.rightWrist.x).toFixed(2)}px, dy=${(d195.rightWrist.y - d194.rightWrist.y).toFixed(2)}px`);

const d329 = getFrameData(329);
const d330 = getFrameData(330);
console.log(`\nRanh giới f329 -> f330 (Chuyển sang hãm tốc):`);
console.log(`  Root Delta: dx=${(d330.rootX - d329.rootX).toFixed(2)}px, dy=${(d330.rootY - d329.rootY).toFixed(2)}px`);
console.log(`  Right Foot Delta: dx=${(d330.rightFoot.x - d329.rightFoot.x).toFixed(2)}px, dy=${(d330.rightFoot.y - d329.rightFoot.y).toFixed(2)}px`);
console.log(`  Left Foot Delta: dx=${(d330.leftFoot.x - d329.leftFoot.x).toFixed(2)}px, dy=${(d330.leftFoot.y - d329.leftFoot.y).toFixed(2)}px`);
console.log(`  Torso Delta: ${(d330.torsoTilt - d329.torsoTilt).toFixed(2)}°`);

// Verification: Root delta should be reasonable (< 10px), foot delta continuous (< 25px)
const rootJump = Math.abs(d330.rootX - d329.rootX);
const rightFootDelta = Math.abs(d330.rightFoot.x - d329.rightFoot.x);
if (rootJump > 10 || rightFootDelta > 25) {
  console.error(`  FAIL: Excessive jump at f329 -> f330! Root jump: ${rootJump}px, Foot jump: ${rightFootDelta}px`);
  process.exit(1);
} else {
  console.log(`  PASS: Ranh giới f329 -> f330 liên tục mượt mà! Root delta = ${rootJump.toFixed(2)}px, Foot delta = ${rightFootDelta.toFixed(2)}px`);
}

// Check 4: Generalization Tests
console.log("\n=================================================================");
console.log("3. KIỂM TRA TÍNH PHỔ QUÁT CỦA SHARED ENGINE (GENERALIZATION TESTS)");
console.log("=================================================================");

interface TestCase {
  name: string;
  facing: "left" | "right";
  scale: number;
  charX: number;
  targetFootWorldX: number;
  isLeft: boolean;
}

const testCases: TestCase[] = [
  { name: "Facing Right, Scale 1.0, Left Foot (Outward stance)", facing: "right", scale: 1.0, charX: 840, targetFootWorldX: 773, isLeft: true },
  { name: "Facing Right, Scale 1.0, Right Foot (Outward stance)", facing: "right", scale: 1.0, charX: 840, targetFootWorldX: 907, isLeft: false },
  { name: "Facing Left, Scale 1.0, Left Foot (Outward stance)", facing: "left", scale: 1.0, charX: 840, targetFootWorldX: 907, isLeft: true },
  { name: "Facing Left, Scale 1.0, Right Foot (Outward stance)", facing: "left", scale: 1.0, charX: 840, targetFootWorldX: 773, isLeft: false },
  { name: "Facing Right, Scale 0.75, Left Foot", facing: "right", scale: 0.75, charX: 500, targetFootWorldX: 450, isLeft: true },
  { name: "Facing Right, Scale 0.75, Right Foot", facing: "right", scale: 0.75, charX: 500, targetFootWorldX: 550, isLeft: false },
  { name: "Facing Left, Scale 0.75, Left Foot", facing: "left", scale: 0.75, charX: 500, targetFootWorldX: 550, isLeft: true },
  { name: "Facing Left, Scale 0.75, Right Foot", facing: "left", scale: 0.75, charX: 500, targetFootWorldX: 450, isLeft: false },
  { name: "Travel Distance 450px: Plant Left", facing: "right", scale: 1.0, charX: 1600, targetFootWorldX: 1570, isLeft: true },
  { name: "Travel Distance 450px: Plant Right", facing: "right", scale: 1.0, charX: 1600, targetFootWorldX: 1630, isLeft: false },
];

let allPassed = true;
for (const tc of testCases) {
  const solvedThighAngle = solveThighAngleForWorldFootX(
    tc.charX,
    tc.targetFootWorldX,
    tc.isLeft,
    tc.scale,
    tc.facing
  );

  const state: StickmanState = {
    x: tc.charX,
    y: 850,
    scale: tc.scale,
    facing: tc.facing,
    pose: "standing",
    limbAngles: {
      leftThigh: tc.isLeft ? solvedThighAngle : 0,
      rightThigh: !tc.isLeft ? solvedThighAngle : 0,
    },
  };
  const fkResult = computeStickmanFK(state);
  const actualFootX = tc.isLeft ? fkResult.leftFoot.x : fkResult.rightFoot.x;
  const error = Math.abs(actualFootX - tc.targetFootWorldX);

  console.log(`  [TEST] ${tc.name}:`);
  console.log(`    Target Foot X: ${tc.targetFootWorldX}px | Solved Thigh: ${solvedThighAngle.toFixed(2)}°`);
  console.log(`    FK Render Foot X: ${actualFootX.toFixed(4)}px | Error: ${error.toFixed(6)}px`);

  if (error > 0.001) {
    console.error(`    FAIL: Error exceeds 0.001px threshold!`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error("Generalization tests failed!");
  process.exit(1);
} else {
  console.log("\n>>> ALL 10 GENERALIZATION TEST CASES PASSED WITH 0.0000px ERROR! <<<");
}
