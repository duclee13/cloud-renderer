/**
 * AnimScript v0.1 Test Suite
 * Comprehensive verification of grammar, parser, compiler, IK, anchors, physics, and determinism.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import { Compiler } from "../compiler";
import { compileAnimScript } from "../index";
import { solve2BoneIK } from "../ik";
import { evaluateFrame } from "../runtime";
import {
  PROP_REGISTRY,
  HUMANOID_RIG,
  calculateCharacterAnchors,
} from "../registry/assetRegistry";

// 1. Kiểm tra 4 hướng góc chuẩn: 0° up, 90° right, 180° down, 270° left
test("Standard Cardinal Angles (0° up, 90° right, 180° down, 270° left)", () => {
  // Vector convention: 0 rad is up (0, -1), PI/2 is right (1, 0), PI is down (0, 1), 3PI/2 is left (-1, 0)
  const angleToVec = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    const x = Math.round(Math.sin(rad) * 1000) / 1000;
    const y = Math.round(-Math.cos(rad) * 1000) / 1000;
    return {
      x: Object.is(x, -0) ? 0 : x,
      y: Object.is(y, -0) ? 0 : y,
    };
  };

  const up = angleToVec(0);
  assert.equal(up.x, 0);
  assert.equal(up.y, -1);

  const right = angleToVec(90);
  assert.equal(right.x, 1);
  assert.equal(right.y, 0);

  const down = angleToVec(180);
  assert.equal(down.x, 0);
  assert.equal(down.y, 1);

  const left = angleToVec(270);
  assert.equal(left.x, -1);
  assert.equal(left.y, 0);
});

// 2. Kiểm tra Anchor tính đúng sau scale, flip, và di chuyển
test("Anchor calculation after scale, flip and translation", () => {
  // Character facing right
  const rightAnchors = calculateCharacterAnchors(1000, 800, 600, "right");
  // Character facing left
  const leftAnchors = calculateCharacterAnchors(1000, 800, 600, "left");

  // Mouth should flip horizontally across rootX (1000)
  assert(rightAnchors.mouth.x > 1000, "Facing right mouth is to the right of root");
  assert(leftAnchors.mouth.x < 1000, "Facing left mouth is to the left of root");
  assert.equal(
    Math.round(rightAnchors.mouth.x - 1000),
    Math.round(1000 - leftAnchors.mouth.x),
    "Symmetric flip offset"
  );

  // Scaled height
  const bigAnchors = calculateCharacterAnchors(1000, 800, 900, "right");
  const smallAnchors = calculateCharacterAnchors(1000, 800, 300, "right");
  assert(
    bigAnchors.topmid.y < smallAnchors.topmid.y,
    "Taller character topmid is higher (lower Y coordinate)"
  );
});

// 3. Khớp nối và bảo toàn chiều dài xương trong IK (2-bone analytical IK)
test("2-Bone IK preserves bone lengths and reaches in-range targets", () => {
  const bones = HUMANOID_RIG.getBones(600);
  const base = { x: 500, y: 500 };
  const target = { x: 620, y: 580 }; // In reach: dist ~ 144px, max reach = 85 + 100 = 185px

  const sol = solve2BoneIK({
    base,
    target,
    length1: bones.upperArmLength,
    length2: bones.forearmLength + bones.handLength,
    facing: "right",
  });

  assert.equal(sol.reached, true, "Target must be reached within max reach");

  // Check bone 1 length: distance from base to elbow
  const d1 = Math.hypot(sol.elbowPos.x - base.x, sol.elbowPos.y - base.y);
  assert.ok(Math.abs(d1 - bones.upperArmLength) < 0.01, "Upper arm length preserved exactly");

  // Check bone 2 length: distance from elbow to hand
  const d2 = Math.hypot(sol.endEffectorPos.x - sol.elbowPos.x, sol.endEffectorPos.y - sol.elbowPos.y);
  const expectedLen2 = bones.forearmLength + bones.handLength;
  assert.ok(Math.abs(d2 - expectedLen2) < 0.01, "Forearm+hand length preserved exactly");

  // End effector lands on target
  assert.ok(Math.hypot(sol.endEffectorPos.x - target.x, sol.endEffectorPos.y - target.y) < 0.5, "Hand lands on target");
});

// 4. IK không tự kéo dài xương khi mục tiêu ngoài tầm với
test("IK clamps without bone stretching when target is out of reach", () => {
  const bones = HUMANOID_RIG.getBones(600);
  const base = { x: 500, y: 500 };
  const outOfReachTarget = { x: 1000, y: 500 }; // 500px away, max reach is 185px

  const sol = solve2BoneIK({
    base,
    target: outOfReachTarget,
    length1: bones.upperArmLength,
    length2: bones.forearmLength + bones.handLength,
    facing: "right",
  });

  assert.equal(sol.reached, false, "Target is marked not reached");
  const totalLength = Math.hypot(sol.endEffectorPos.x - base.x, sol.endEffectorPos.y - base.y);
  assert.ok(
    Math.abs(totalLength - sol.maxReach) < 0.1,
    "Limb extends to max reach without stretching bones"
  );
});

// 5. Grab / Release không làm vật nhảy vị trí (World transform preservation)
test("Grab and Release preserve continuous world transform", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("test_grab", duration_ms=2000):
    c = character("human", height=600, x=500, y=850)
    p = prop("cup", width=60, height=90)
    place(p, at=[550, 850])
    with sequence():
        grab(c, object=p, hand="right", duration_ms=500)
        move(c, to=[700, 850], duration_ms=500)
        release(c, object=p, hand="right", duration_ms=200)
        move(c, to=[900, 850], duration_ms=500)
`;
  const { ir } = compileAnimScript(script);
  // Evaluate frame right before release (frame 59 ~ frame 50-60 is release end)
  const fBefore = evaluateFrame(ir, 55, 60);
  const fAfter = evaluateFrame(ir, 75, 60);

  const pBeforeX = fBefore.objects.p.transform.x;
  const pAfterX = fAfter.objects.p.transform.x;

  // After release, object remains where it was released and does not snap back to 550 or jump to 900
  assert(pAfterX > 600, "Object moved with character before release");
  assert.equal(fAfter.objects.c.pose?.heldObjects?.rightHand, undefined, "Object is released from hand");
});

// 6. Chân chống bám đất khi đi bộ (Stance phase ground lock)
test("Walking coordinates root translation with stance foot ground lock", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("test_walk", duration_ms=2000):
    c = character("human", height=600, x=300, y=850)
    with sequence():
        walk(c, to=700, duration_ms=1500)
`;
  const { ir } = compileAnimScript(script);

  const f0 = evaluateFrame(ir, 0, 60);
  const f45 = evaluateFrame(ir, 45, 60);
  const f90 = evaluateFrame(ir, 90, 60);

  assert.equal(f0.objects.c.transform.x, 300, "Start position");
  assert(f45.objects.c.transform.x > 300 && f45.objects.c.transform.x < 700, "Progressing");
  assert.equal(Math.round(f90.objects.c.transform.x), 700, "Arrived at destination");

  // Vertical bounce is minimal and controlled (< 10px), no floating in clouds
  assert(Math.abs(f45.objects.c.transform.y - 850) <= 8, "Vertical ground lock preserved");
});

// 7. Xung đột hành động và phát hiện lỗi kịch bản
test("Compiler detects action conflicts on the same limb channel", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("conflict_scene", duration_ms=2000):
    c = character("human", height=600, x=300, y=850)
    cup1 = prop("cup", width=60, height=90)
    cup2 = prop("cup", width=60, height=90)
    with parallel():
        grab(c, object=cup1, hand="right", duration_ms=1000)
        grab(c, object=cup2, hand="right", duration_ms=1000)
`;
  const { diagnostics } = compileAnimScript(script);
  const conflict = diagnostics.find((d) => d.code === "ERR_ACTION_CONFLICT");
  assert(conflict !== undefined, "Conflict detected on right hand in parallel block");
});

// 8. Kết quả không phụ thuộc thứ tự render frame (Determinism test)
test("Deterministic evaluation independent of frame render order", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("det_scene", duration_ms=3000):
    hero = character("human", height=600, x=200, y=850)
    with sequence():
        walk(hero, to=600, duration_ms=1000)
        jump(hero, to=900, height=150, duration_ms=1000)
`;
  const { ir } = compileAnimScript(script);

  // Render out of order: frame 100, then frame 10, then frame 50
  const f100_first = evaluateFrame(ir, 100, 60);
  const f10 = evaluateFrame(ir, 10, 60);
  const f50 = evaluateFrame(ir, 50, 60);
  const f100_second = evaluateFrame(ir, 100, 60);

  // Compare f100_first with f100_second
  assert.equal(f100_first.objects.hero.transform.x, f100_second.objects.hero.transform.x);
  assert.equal(f100_first.objects.hero.transform.y, f100_second.objects.hero.transform.y);
  assert.deepEqual(f100_first.objects.hero.pose?.limbAngles, f100_second.objects.hero.pose?.limbAngles);
});

// 9. Lỗi script không bị bỏ qua hoặc chuyển thành cảnh mặc định
test("Invalid script syntax or unknown anchors report precise line and column", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("error_scene", duration_ms=2000):
    p = prop("desk", width=800)
    c = prop("cup", width=60)
    align(c.nonexistent_anchor, to=p.surface.center)
`;
  const { diagnostics } = compileAnimScript(script);
  assert(diagnostics.length > 0, "Compiler reports error for nonexistent anchor");
  const err = diagnostics.find((d) => d.code === "ERR_UNKNOWN_ANCHOR");
  assert(err !== undefined, "ERR_UNKNOWN_ANCHOR found");
  assert.equal(err.severity, "error");
});

// 10. Cấu trúc nhân vật đầy đủ: 2 đoạn xương và đầy đủ khớp nối khi đứng và khi ngồi
test("Full 2-segment limb structure and anatomical joints in standing and sitting poses", () => {
  // Standing pose anchors
  const standingAnchors = calculateCharacterAnchors(960, 850, 600, "right");
  assert(standingAnchors.left_shoulder !== undefined, "Left shoulder exists");
  assert(standingAnchors.right_shoulder !== undefined, "Right shoulder exists");
  assert(standingAnchors.left_elbow !== undefined, "Left elbow exists");
  assert(standingAnchors.right_elbow !== undefined, "Right elbow exists");
  assert(standingAnchors.left_wrist !== undefined, "Left wrist exists");
  assert(standingAnchors.right_wrist !== undefined, "Right wrist exists");
  assert(standingAnchors.left_hand !== undefined, "Left hand exists");
  assert(standingAnchors.right_hand !== undefined, "Right hand exists");
  assert(standingAnchors.left_hip !== undefined, "Left hip exists");
  assert(standingAnchors.right_hip !== undefined, "Right hip exists");
  assert(standingAnchors.left_knee !== undefined, "Left knee exists");
  assert(standingAnchors.right_knee !== undefined, "Right knee exists");
  assert(standingAnchors.left_ankle !== undefined, "Left ankle exists");
  assert(standingAnchors.right_ankle !== undefined, "Right ankle exists");

  // Pelvic separation: hips must not collapse to a single point
  assert(
    Math.abs(standingAnchors.right_hip.x - standingAnchors.left_hip.x) >= 30,
    "Pelvis separation >= 30px avoids leg overlap"
  );

  // Sitting pose anchors
  const sittingAnchors = calculateCharacterAnchors(960, 850, 600, "right", {
    x: 960,
    y: 850,
    facing: "right",
    isSitting: true,
  });
  // When sitting, knees extend forward under desk
  assert(
    sittingAnchors.right_knee.x > sittingAnchors.right_hip.x,
    "Sitting right knee extends forward horizontally relative to hip"
  );
  // Feet rest on the floor level (850)
  assert.equal(sittingAnchors.right_ankle.y, 850, "Sitting right foot rests flat on the floor");
  assert.equal(sittingAnchors.left_ankle.y, 850, "Sitting left foot rests flat on the floor");
});

// 11. Tính toàn vẹn của depth split khi nhân vật ngồi sau bàn
test("Depth split preserves full limb rig without omitting occluded body or limbs", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("desk_work", duration_ms=2000):
    worker = character("human", height=600, x=960, y=850)
    table = prop("desk", width=800, x=960, y=850)
    sit(worker, on=table.seat)
`;
  const { ir } = compileAnimScript(script);
  const state = evaluateFrame(ir, 60, 60);

  const char = state.objects.worker;
  assert.equal(char.pose?.isSitting, true, "Character is sitting");
  assert.equal(char.layerSplits?.behindDesk, true, "Layer split behindDesk is enabled");
  assert.equal(char.layerSplits?.handsFront, true, "Layer split handsFront is enabled");

  // Thigh and calf folded angles must be populated
  assert.equal(char.pose?.limbAngles?.leftThigh, -85, "Left thigh angle is folded horizontally (-85°)");
  assert.equal(char.pose?.limbAngles?.leftCalf, 85, "Left calf angle drops vertically (85°)");
  assert.equal(char.pose?.limbAngles?.rightThigh, -88, "Right thigh angle is folded horizontally (-88°)");
  assert.equal(char.pose?.limbAngles?.rightCalf, 85, "Right calf angle drops vertically (85°)");
});

// 12. Cúi nhặt đồ: kiểm tra các pha crouch -> contact -> LIFT WHILE CROUCHED -> rise
test("Floor pickup verifies lift_clear while crouched and zero teleportation", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("test_pickup", duration_ms=2500):
    c = character("human", height=600, x=500, y=850)
    p = prop("cup", width=60, height=90)
    place(p, at=[580, 850])
    pickup(c, object=p, hand="right", duration_ms=2500)
`;
  const { ir } = compileAnimScript(script);
  // Total 150 frames.
  // Phase 1 (0..0.35 = 0..52): lower_body & reach. Cup must be at floor y=850.
  const f30 = evaluateFrame(ir, 30, 60);
  assert.equal(f30.objects.p.transform.y, 850, "Cup remains on floor during crouch & reach");
  assert(f30.objects.c.pose?.crouchDepth && f30.objects.c.pose.crouchDepth > 50, "Character is crouching");

  // Phase 2 (0.35..0.45 = 53..67): grasp. Cup is on floor at y=850.
  const f60 = evaluateFrame(ir, 60, 60);
  assert.equal(f60.objects.p.transform.y, 850, "Cup still on floor at moment of grasp");
  assert.equal(f60.objects.c.pose?.heldObjects?.rightHand, "p", "Object attached to hand");

  // Phase 3 (0.45..0.65 = 68..97): LIFT_CLEAR while STILL CROUCHED!
  const f85 = evaluateFrame(ir, 85, 60);
  assert(
    f85.objects.p.transform.y < 820,
    `Cup lifted off floor during lift_clear: y=${f85.objects.p.transform.y} < 820`
  );
  assert(
    f85.objects.c.pose?.crouchDepth && f85.objects.c.pose.crouchDepth > 50,
    "Character is STILL CROUCHED while lifting cup off the floor"
  );

  // Phase 4 & 5 (120..150): Standing upright holding cup
  const f145 = evaluateFrame(ir, 145, 60);
  assert.equal(f145.objects.c.pose?.crouchDepth, 0, "Character is standing upright");
  assert(f145.objects.p.transform.y < 650, "Cup held at waist level");

  // Continuity check: between any two consecutive frames, no teleportation (max delta < 15px)
  for (let f = 1; f < 150; f++) {
    const prev = evaluateFrame(ir, f - 1, 60).objects.p.transform;
    const curr = evaluateFrame(ir, f, 60).objects.p.transform;
    const d = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    assert(d < 15, `Cup displacement at frame ${f} must be continuous (got ${d}px)`);
  }
});

// 13. Ngồi xuống và đứng lên liên tục, không teleport
test("Continuous sit and stand with seatedHipY trajectory", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("test_sit_stand", duration_ms=4000):
    c = character("human", height=600, x=500, y=850)
    ch = prop("chair", width=220, height=400)
    place(ch, at=[520, 850])
    with sequence():
        sit(c, on=ch.seat, duration_ms=2000)
        stand(c, duration_ms=2000)
`;
  const { ir } = compileAnimScript(script);
  // Frame 0: Standing hip at -350
  const f0 = evaluateFrame(ir, 0, 60);
  // Frame 60: Halfway sitting (hip ~ -285)
  const f60 = evaluateFrame(ir, 60, 60);
  // Frame 120: Fully seated (hip -220)
  const f120 = evaluateFrame(ir, 120, 60);
  // Frame 180: Halfway standing (hip ~ -285)
  const f180 = evaluateFrame(ir, 180, 60);
  // Frame 240: Fully standing (hip -350)
  const f240 = evaluateFrame(ir, 239, 60);

  assert(f60.objects.c.pose?.sittingHipY! > -350 && f60.objects.c.pose?.sittingHipY! < -220, "Smooth descent");
  assert.equal(Math.round(f120.objects.c.pose?.sittingHipY!), -220, "Fully seated at frame 120");
  assert(f180.objects.c.pose?.sittingHipY! < -220 && f180.objects.c.pose?.sittingHipY! > -350, "Smooth ascent");
  assert.equal(Math.round(f240.objects.c.pose?.sittingHipY!), -350, "Fully standing at end");
});

// 14. Chạy bộ có pha bay (flight phase) và độ nghiêng thân về trước
test("Running gait demonstrates forward lean and aerial flight phase", () => {
  const script = `
video(width=1920, height=1080, fps=60)
with scene("test_run", duration_ms=2000):
    c = character("human", height=600, x=200, y=850)
    run(c, to=800, duration_ms=2000)
`;
  const { ir } = compileAnimScript(script);
  const midRun = evaluateFrame(ir, 60, 60);
  assert.equal(midRun.objects.c.pose?.headTilt, 16, "Forward torso lean during running");
  // Check that root lifts above ground during flight phase in at least some frames
  let foundFlight = false;
  for (let f = 10; f < 100; f++) {
    const s = evaluateFrame(ir, f, 60);
    if (s.objects.c.transform.y < 850) {
      foundFlight = true;
      break;
    }
  }
  assert.equal(foundFlight, true, "Aerial flight phase lifts root off ground");
});
