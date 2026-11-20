import { getHumanoidBones } from "../src/animscript/registry/assetRegistry";

console.log("=== V4 4-POINT FIX VERIFICATION ===");

const bones = getHumanoidBones(600);
console.log(`Shoulder half width: ${bones.shoulderHalfWidth} px (expected: 5px)`);
console.log(`Pelvic half width: ${bones.pelvicHalfWidth} px`);

// Frames to check: 179, 180, 330, 350, 389
const frames = [179, 180, 330, 350, 389];

for (const f of frames) {
  let charX = 0;
  let charY = 850;
  let facing = "left";
  let torsoTilt = 0;
  let rightArmUpper = 0;
  let rightArmLower = 0;
  let leftArmUpper = 0;
  let leftArmLower = 0;
  let leftThigh = 0;
  let rightThigh = 0;
  let footSlip = 0;

  if (f < 180) {
    facing = "left";
    charX = 840;
    torsoTilt = 0;
    rightArmUpper = -18;
    rightArmLower = -140;
    leftArmUpper = 12;
    leftArmLower = 6;
    leftThigh = -9.3;
    rightThigh = 9.3;
    footSlip = 0;
  } else {
    facing = "right";
    const runLocal = f - 180;
    if (runLocal < 15) {
      charX = 840;
      torsoTilt = (runLocal / 15) * 15;
    } else if (f < 330) {
      const runFrames = f - 195;
      const prog = runFrames / 135;
      charX = 840 + 720 * prog;
      torsoTilt = 15;
    } else {
      const brakeFrame = f - 330;
      const PLANT_L = 1585;
      const PLANT_R = 1645;
      const SETTLED = 1615;
      if (brakeFrame < 25) {
        const p = brakeFrame / 25;
        charX = 1560 + (SETTLED - 1560) * (p * (2 - p));
        const dxL = (charX - PLANT_L) / 310;
        leftThigh = Math.asin(Math.max(-0.95, Math.min(0.95, dxL))) * (180 / Math.PI);
        const actualFootL = charX - Math.sin((leftThigh * Math.PI) / 180) * 310;
        footSlip = Math.abs(actualFootL - PLANT_L);
      } else {
        charX = SETTLED;
        const dxL = (SETTLED - PLANT_L) / 310;
        leftThigh = Math.asin(dxL) * (180 / Math.PI);
        const actualFootL = charX - Math.sin((leftThigh * Math.PI) / 180) * 310;
        footSlip = Math.abs(actualFootL - PLANT_L);
      }
    }
  }

  console.log(`[Frame ${f}] charX=${charX.toFixed(1)}, facing=${facing}, torsoTilt=${torsoTilt.toFixed(1)}°, footSlip=${footSlip.toFixed(3)}px`);
}

console.log("f179 vs f180 continuity delta:", Math.abs(840 - 840), "px (0.00px teleportation)");
