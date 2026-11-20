import { computeStickmanFK } from "../src/remotion/components/character/StickmanRig";
import { StickmanState } from "../src/remotion/types/character";
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

console.log("Testing braking transition around f329-f335...");

// State at f329
const runFrames329 = 329 - 195; // 134
const runRad329 = ((134 % 52) / 52) * Math.PI * 2 - Math.PI / 2;
const charX329 = 840 + 715; // 1555
const thigh329 = -Math.sin(runRad329) * 30; // -26.55°
const calf329 = Math.max(0, Math.sin(runRad329) * 40); // 35.40°
const leftThigh329 = Math.sin(runRad329) * 30; // 26.55°
const leftCalf329 = Math.max(0, -Math.sin(runRad329) * 40); // 0°

const state329: StickmanState = {
  x: charX329,
  y: 850,
  scale: 1,
  facing: "right",
  pose: "standing",
  limbAngles: {
    torso: 15,
    rightThigh: thigh329,
    rightCalf: calf329,
    leftThigh: leftThigh329,
    leftCalf: leftCalf329,
  },
};
const fk329 = computeStickmanFK(state329);
console.log("f329 Right Foot:", fk329.rightFoot);
console.log("f329 Left Foot:", fk329.leftFoot);

// Touchdown at f333: right knee straightens to 0 as foot lands
// Over frames 330-333:
// Root moves at ~5px/frame:
// f330: charX = 1560
// f331: charX = 1565
// f332: charX = 1569
// f333: charX = 1572
// At f333, rightCalf reaches 0, rightThigh eases to ~ -20°
const rightThigh333 = -20;
const rightCalf333 = 0;
const charX333 = 1572;
const state333: StickmanState = {
  x: charX333,
  y: 850,
  scale: 1,
  facing: "right",
  pose: "standing",
  limbAngles: {
    torso: 13,
    rightThigh: rightThigh333,
    rightCalf: rightCalf333,
    leftThigh: 15,
    leftCalf: 10,
  },
};
const fk333 = computeStickmanFK(state333);
const PLANT_R_X = fk333.rightFoot.x;
console.log("Touchdown at f333 PLANT_R_X:", PLANT_R_X, "y:", fk333.rightFoot.y);

// From f333 onward, right foot is LOCKED at PLANT_R_X!
// Let's test f334 with charX = 1576:
const charX334 = 1576;
const thigh334 = solveThighAngleForWorldFootX(charX334, PLANT_R_X, false);
const state334: StickmanState = {
  x: charX334,
  y: 850,
  scale: 1,
  facing: "right",
  pose: "standing",
  limbAngles: {
    rightThigh: thigh334,
    rightCalf: 0,
  },
};
const fk334 = computeStickmanFK(state334);
console.log("f334 Right Foot locked at:", fk334.rightFoot.x, "Error:", Math.abs(fk334.rightFoot.x - PLANT_R_X));

// Check delta f329 -> f330:
const charX330 = 1559.5;
const p330 = 1 / 4;
const thigh330 = interpolate(p330, [0, 1], [thigh329, rightThigh333]);
const calf330 = interpolate(p330, [0, 1], [calf329, 0]);
const state330: StickmanState = {
  x: charX330,
  y: 850,
  scale: 1,
  facing: "right",
  pose: "standing",
  limbAngles: {
    torso: interpolate(p330, [0, 1], [15, 13]),
    rightThigh: thigh330,
    rightCalf: calf330,
    leftThigh: interpolate(p330, [0, 1], [leftThigh329, 15]),
    leftCalf: interpolate(p330, [0, 1], [0, 10]),
  },
};
const fk330 = computeStickmanFK(state330);
console.log("\nDelta f329 -> f330:");
console.log("Root Delta:", charX330 - charX329);
console.log("Right Foot Delta:", fk330.rightFoot.x - fk329.rightFoot.x, "dy:", fk330.rightFoot.y - fk329.rightFoot.y);
console.log("Left Foot Delta:", fk330.leftFoot.x - fk329.leftFoot.x, "dy:", fk330.leftFoot.y - fk329.leftFoot.y);
console.log("Right Thigh Delta:", thigh330 - thigh329);
console.log("Right Calf Delta:", calf330 - calf329);
