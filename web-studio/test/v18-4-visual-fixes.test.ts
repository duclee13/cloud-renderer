/**
 * V18.4 Visual Fixes Verification Test Suite
 * Run: node -r ./scripts/register-ts.cjs --test test/v18-4-visual-fixes.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ARM_L1,
  ARM_L2,
  TORSO_LEN,
  computeV18ActionArmsUpper,
  computeStickmanArmsUpper,
  computeGentleDoubleNodDeg,
  StickmanRig,
} from "../src/remotion/components/character/StickmanRig";
import {
  UniversalAutoStage,
  shouldCenterSoloExplainerBeat,
  computeSoloExplainerCenterShiftX,
  centerSoloExplainerTimeline,
  normalizeVisualPropId,
  resolveContiguousPoseRunStartPct,
  blendArmJointsFK,
} from "../src/components/v7/UniversalAutoStage";
import type { AutoEpisodeBeat } from "../src/lib/v7/episodeJsonSchema";
import type { Point2D, StickmanState } from "../src/remotion/types/character";

function interiorElbowAngleDeg(shoulder: Point2D, elbow: Point2D, wrist: Point2D): number {
  const ux = shoulder.x - elbow.x;
  const uy = shoulder.y - elbow.y;
  const vx = wrist.x - elbow.x;
  const vy = wrist.y - elbow.y;
  const mag = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  assert.ok(mag > 1e-6, "Non-degenerate arm vectors");
  const cosTheta = Math.max(-1, Math.min(1, (ux * vx + uy * vy) / mag));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

function forearmAngleFromDownDeg(elbow: Point2D, wrist: Point2D): number {
  return (Math.atan2(wrist.x - elbow.x, wrist.y - elbow.y) * 180) / Math.PI;
}

function makeBaseBeat(overrides: Partial<AutoEpisodeBeat> = {}): AutoEpisodeBeat {
  return {
    id: "test_beat",
    text: "Test narration",
    ttsText: "Test narration",
    stageType: "COUNTRYSIDE_YARD",
    timeOfDay: "DAY",
    weather: "CLEAR",
    transitionIn: "CUT",
    transitionFrames: 0,
    pauseAfterSec: 0.4,
    bgmMood: "BGM_STORY_CALM",
    visualProp: "NONE",
    actors: [],
    customProps: [],
    ...overrides,
  };
}

test("V18.4 #1A: TALK_GESTURE backArm relaxed ~155-165 deg (never crosses torso), frontArm open ~115-135 deg with slow small sine wave", () => {
  const shoulder: Point2D = { x: 0, y: -TORSO_LEN };
  let minFrontElbow = Infinity;
  let maxFrontElbow = -Infinity;
  let minFrontForearm = Infinity;
  let maxFrontForearm = -Infinity;
  let prevFrontElbow: number | null = null;
  let maxPerFrameDelta = 0;

  for (let frame = 0; frame < 360; frame++) {
    const raw = computeV18ActionArmsUpper("TALK_GESTURE", false, shoulder, frame, frame, 0.5);
    assert.ok(raw, "TALK_GESTURE must return arm joints");

    // Pass through the FULL StickmanRig arm pipeline (including head-safe clamp & enforceRigidTwoBoneIK)
    const state: StickmanState = {
      x: 960,
      y: 840,
      scale: 1,
      facing: "right",
      pose: "standing",
      v18ActionPose: "TALK_GESTURE",
      v18LocalFrame: frame,
      v18SegmentProgress: 0.5,
      eyes: "happy",
      eyebrows: "neutral",
      mouth: "smile",
    };
    const resolved = computeStickmanArmsUpper(state, shoulder, -173, 0, 1, 1, 960, 840, frame);

    // Bone length invariance
    const dL1 = Math.hypot(resolved.leftElbowUpper.x - shoulder.x, resolved.leftElbowUpper.y - shoulder.y);
    const dL2 = Math.hypot(resolved.leftWristUpper.x - resolved.leftElbowUpper.x, resolved.leftWristUpper.y - resolved.leftElbowUpper.y);
    const dR1 = Math.hypot(resolved.rightElbowUpper.x - shoulder.x, resolved.rightElbowUpper.y - shoulder.y);
    const dR2 = Math.hypot(resolved.rightWristUpper.x - resolved.rightElbowUpper.x, resolved.rightWristUpper.y - resolved.rightElbowUpper.y);
    assert.ok(Math.abs(dL1 - ARM_L1) < 0.05, `back upper arm length preserved at frame ${frame}: ${dL1}`);
    assert.ok(Math.abs(dL2 - ARM_L2) < 0.05, `back forearm length preserved at frame ${frame}: ${dL2}`);
    assert.ok(Math.abs(dR1 - ARM_L1) < 0.05, `front upper arm length preserved at frame ${frame}: ${dR1}`);
    assert.ok(Math.abs(dR2 - ARM_L2) < 0.05, `front forearm length preserved at frame ${frame}: ${dR2}`);

    // Back arm: relaxed by side, 155..165 deg interior elbow angle, NEVER crosses torso (x < 0)
    const backAngle = interiorElbowAngleDeg(shoulder, resolved.leftElbowUpper, resolved.leftWristUpper);
    assert.ok(
      backAngle >= 155 && backAngle <= 165,
      `backArm elbow angle must be in 155..165 deg at frame ${frame}, got ${backAngle.toFixed(2)}`
    );
    assert.ok(
      resolved.leftElbowUpper.x < -10 && resolved.leftWristUpper.x < -10,
      `backArm must stay behind/beside torso (x < -10), never crossing torso: elbow.x=${resolved.leftElbowUpper.x.toFixed(1)}, wrist.x=${resolved.leftWristUpper.x.toFixed(1)}`
    );
    assert.ok(
      resolved.leftWristUpper.y > shoulder.y + 105,
      `backArm wrist must hang down near hip: y=${resolved.leftWristUpper.y.toFixed(1)}`
    );

    // Front arm: naturally open 115..135 deg, forward at chest/waist level
    const frontAngle = interiorElbowAngleDeg(shoulder, resolved.rightElbowUpper, resolved.rightWristUpper);
    assert.ok(
      frontAngle >= 115 && frontAngle <= 135,
      `frontArm elbow angle must be in 115..135 deg at frame ${frame}, got ${frontAngle.toFixed(2)}`
    );
    assert.ok(
      resolved.rightWristUpper.x >= 70,
      `frontArm must reach gently forward: wrist.x=${resolved.rightWristUpper.x.toFixed(1)}`
    );
    assert.ok(
      resolved.rightWristUpper.y >= shoulder.y + 40 && resolved.rightWristUpper.y <= shoulder.y + 90,
      `frontArm wrist must be at chest/waist height: relY=${(resolved.rightWristUpper.y - shoulder.y).toFixed(1)}`
    );

    const forearmDeg = forearmAngleFromDownDeg(resolved.rightElbowUpper, resolved.rightWristUpper);
    minFrontElbow = Math.min(minFrontElbow, frontAngle);
    maxFrontElbow = Math.max(maxFrontElbow, frontAngle);
    minFrontForearm = Math.min(minFrontForearm, forearmDeg);
    maxFrontForearm = Math.max(maxFrontForearm, forearmDeg);

    if (prevFrontElbow !== null) {
      maxPerFrameDelta = Math.max(maxPerFrameDelta, Math.abs(frontAngle - prevFrontElbow));
    }
    prevFrontElbow = frontAngle;
  }

  const elbowHalfAmp = (maxFrontElbow - minFrontElbow) / 2;
  const forearmHalfAmp = (maxFrontForearm - minFrontForearm) / 2;
  assert.ok(elbowHalfAmp >= 5.5 && elbowHalfAmp <= 8.0, `elbow half-amplitude should be ~6-8 deg, got ${elbowHalfAmp.toFixed(2)}`);
  assert.ok(forearmHalfAmp >= 6.0 && forearmHalfAmp <= 8.5, `forearm half-amplitude should be ~6-8 deg, got ${forearmHalfAmp.toFixed(2)}`);
  assert.ok(maxPerFrameDelta < 0.6, `motion must be slow and smooth (no jitter), max delta/frame=${maxPerFrameDelta.toFixed(3)}`);
});

test("V18.4 #1B: NOD_SMILE keeps both arms completely relaxed & still by sides, nods gently 2 times then stops", () => {
  const shoulder: Point2D = { x: 0, y: -TORSO_LEN };
  const ref = computeV18ActionArmsUpper("NOD_SMILE", false, shoulder, 0, 0, 0);
  assert.ok(ref);

  const backAngle = interiorElbowAngleDeg(shoulder, ref.leftElbow, ref.leftWrist);
  const frontAngle = interiorElbowAngleDeg(shoulder, ref.rightElbow, ref.rightWrist);
  assert.ok(backAngle >= 155 && backAngle <= 168, `NOD_SMILE backArm relaxed angle: ${backAngle.toFixed(2)}`);
  assert.ok(frontAngle >= 155 && frontAngle <= 168, `NOD_SMILE frontArm relaxed angle: ${frontAngle.toFixed(2)}`);
  assert.ok(ref.leftWrist.y > shoulder.y + 108 && ref.rightWrist.y > shoulder.y + 108, "Both wrists hang down near hips");

  // Arms must NEVER sway/wave across frames
  for (let frame = 0; frame < 300; frame += 7) {
    const cur = computeV18ActionArmsUpper("NOD_SMILE", false, shoulder, frame, frame, frame / 300);
    assert.ok(cur);
    assert.equal(cur.leftElbow.x, ref.leftElbow.x);
    assert.equal(cur.leftElbow.y, ref.leftElbow.y);
    assert.equal(cur.leftWrist.x, ref.leftWrist.x);
    assert.equal(cur.leftWrist.y, ref.leftWrist.y);
    assert.equal(cur.rightElbow.x, ref.rightElbow.x);
    assert.equal(cur.rightElbow.y, ref.rightElbow.y);
    assert.equal(cur.rightWrist.x, ref.rightWrist.x);
    assert.equal(cur.rightWrist.y, ref.rightWrist.y);
  }

  // Head nod: smooth 2 gentle nods then completely stopped (0 deg)
  assert.equal(computeGentleDoubleNodDeg(0), 0);
  assert.ok(computeGentleDoubleNodDeg(14) > 4.0 && computeGentleDoubleNodDeg(14) <= 6.5, "Nod 1 peak");
  assert.ok(Math.abs(computeGentleDoubleNodDeg(28)) < 1e-6, "Between nod 1 and nod 2 returns to 0");
  assert.ok(computeGentleDoubleNodDeg(42) > 2.5 && computeGentleDoubleNodDeg(42) <= 5.0, "Nod 2 peak");
  for (let f = 56; f <= 300; f += 5) {
    assert.equal(computeGentleDoubleNodDeg(f), 0, `Head nod must stop completely after 2 nods at f=${f}`);
  }

  // Verify in full UniversalAutoStage (even next to a speaking partner, NOD_SMILE stops nodding after f>=56!)
  const beat = makeBaseBeat({
    actors: [
      {
        preset: "GRANDPA",
        slot: "LEFT",
        facing: "RIGHT",
        motion: "IDLE_TALK",
        expression: "HAPPY",
        timeline: [
          { fromPct: 0, toPct: 1, startX: 600, endX: 600, facing: "RIGHT", pose: "NOD_SMILE", expression: "HAPPY" },
        ],
      },
      {
        preset: "DOCTOR",
        slot: "RIGHT",
        facing: "LEFT",
        motion: "IDLE_TALK",
        expression: "HAPPY",
        bubble: "Xin chào!",
        bubbleStartPct: 0.05,
        bubbleEndPct: 0.95,
        timeline: [
          { fromPct: 0, toPct: 1, startX: 1000, endX: 1000, facing: "LEFT", pose: "TALK_GESTURE", expression: "HAPPY" },
        ],
      },
    ],
  });
  const svgMidNod = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: beat, frame: 14, localFrame: 14, durationFrames: 300, u: 14 / 300 })
  );
  const svgAfterNod = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: beat, frame: 140, localFrame: 140, durationFrames: 300, u: 140 / 300 })
  );
  const headMatchesMid = [...svgMidNod.matchAll(/id="neck-head-cluster" transform="translate\(0, -185\) rotate\(([^)]+)\)"/g)];
  const headMatchesAfter = [...svgAfterNod.matchAll(/id="neck-head-cluster" transform="translate\(0, -185\) rotate\(([^)]+)\)"/g)];
  assert.equal(headMatchesMid.length, 2);
  assert.equal(headMatchesAfter.length, 2);
  assert.ok(Number(headMatchesMid[0][1]) > 4.0, `GRANDPA should be mid-nod at f=14, got ${headMatchesMid[0][1]}`);
  assert.equal(Number(headMatchesAfter[0][1]), 0, `GRANDPA NOD_SMILE must be 0 deg after 2 nods at f=140, got ${headMatchesAfter[0][1]}`);

  // Standalone StickmanRig with NOD_SMILE also suppresses continuous nodAmplitudeDeg
  const standaloneAfter = renderToStaticMarkup(
    React.createElement(StickmanRig, {
      characterPreset: "GRANDPA",
      frame: 120,
      state: {
        x: 500,
        y: 840,
        facing: "right",
        pose: "standing",
        v18ActionPose: "NOD_SMILE",
        v18LocalFrame: 120,
        nodAmplitudeDeg: 5,
        eyes: "happy",
        eyebrows: "neutral",
        mouth: "smile",
      },
    })
  );
  const standaloneMatch = standaloneAfter.match(/id="neck-head-cluster" transform="translate\(0, -185\) rotate\(([^)]+)\)"/);
  assert.ok(standaloneMatch);
  assert.equal(Number(standaloneMatch[1]), 0);
});

test("V18.4 #2: SpeechBubble layer renders AFTER ALL actors (and weather), including for Actor 0 & sleeping actors", () => {
  // Case A: Actor 0 (BOY) speaks while Actor 1 (NEIGHBOR with cap) and Actor 2 (DOCTOR) stand right next to him in rain
  const beatMulti = makeBaseBeat({
    stageType: "COUNTRYSIDE_YARD",
    weather: "RAIN",
    actors: [
      {
        preset: "BOY",
        slot: "LEFT",
        facing: "RIGHT",
        motion: "IDLE_TALK",
        expression: "CURIOUS",
        bubble: "Bóng thoại luôn trên cùng!",
        bubbleStartPct: 0.1,
        bubbleEndPct: 0.95,
        timeline: [
          { fromPct: 0, toPct: 1, startX: 780, endX: 780, facing: "RIGHT", pose: "TALK_GESTURE", expression: "CURIOUS" },
        ],
      },
      {
        preset: "NEIGHBOR",
        slot: "CENTER",
        facing: "LEFT",
        motion: "IDLE_TALK",
        expression: "HAPPY",
        timeline: [
          { fromPct: 0, toPct: 1, startX: 930, endX: 930, facing: "LEFT", pose: "NOD_SMILE", expression: "HAPPY" },
        ],
      },
      {
        preset: "DOCTOR",
        slot: "RIGHT",
        facing: "LEFT",
        motion: "IDLE_TALK",
        expression: "HAPPY",
        timeline: [
          { fromPct: 0, toPct: 1, startX: 1120, endX: 1120, facing: "LEFT", pose: "TALK_GESTURE", expression: "HAPPY" },
        ],
      },
    ],
  });

  const svg = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: beatMulti, frame: 120, localFrame: 120, durationFrames: 300, u: 0.4 })
  );

  const lastActorIdx = svg.lastIndexOf('id="stickman-rig-wrapper"');
  const weatherIdx = svg.indexOf('id="universal-weather-overlay"');
  const bubbleLayerIdx = svg.indexOf('id="layer-speech-bubbles-top"');
  const bubbleIdx = svg.indexOf('id="v14-comic-speech-bubble"');

  assert.ok(lastActorIdx > 0, "Actors rendered");
  assert.ok(weatherIdx > lastActorIdx, "Weather rendered after actors");
  assert.ok(bubbleLayerIdx > weatherIdx, "Speech bubble layer must render AFTER all actors and weather");
  assert.ok(bubbleIdx > bubbleLayerIdx, "Actual ComicSpeechBubble must reside inside layer-speech-bubbles-top");
  assert.ok(svg.includes("Bóng thoại luôn trên cùng!"));

  // Case B: Actor 0 sleeping with bubble, Actor 1 standing nearby
  const beatSleep = makeBaseBeat({
    stageType: "BEDROOM_INDOOR",
    actors: [
      {
        preset: "BOY",
        slot: "RIGHT",
        facing: "LEFT",
        motion: "SLEEP_BED",
        expression: "TIRED",
        bubble: "Khò khò...",
        bubbleStartPct: 0.1,
        bubbleEndPct: 0.95,
      },
      {
        preset: "GRANDPA",
        slot: "CENTER",
        facing: "RIGHT",
        motion: "IDLE_TALK",
        expression: "HAPPY",
      },
    ],
  });
  const svgSleep = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: beatSleep, frame: 120, localFrame: 120, durationFrames: 300, u: 0.4 })
  );
  const sleepActorStandingIdx = svgSleep.lastIndexOf('id="stickman-rig-wrapper"');
  const sleepBubbleLayerIdx = svgSleep.indexOf('id="layer-speech-bubbles-top"');
  const sleepBubbleIdx = svgSleep.indexOf('id="v14-comic-speech-bubble"');
  assert.ok(sleepBubbleLayerIdx > sleepActorStandingIdx, "Sleeping actor bubble layer must also render AFTER standing actors");
  assert.ok(sleepBubbleIdx > sleepBubbleLayerIdx);
});

test("V18.4 #3: EXPLAINER_POLKA_DOT auto-centers solo actor without visualProp to x ≈ 960 (and preserves normal layout otherwise)", () => {
  // 1. Trigger conditions
  const soloNoProp = makeBaseBeat({
    stageType: "EXPLAINER_POLKA_DOT",
    visualProp: undefined,
    actors: [{ preset: "BOY", slot: "LEFT", facing: "RIGHT", motion: "IDLE_TALK", expression: "HAPPY" }],
  });
  assert.equal(shouldCenterSoloExplainerBeat(soloNoProp), true);
  assert.equal(shouldCenterSoloExplainerBeat({ ...soloNoProp, visualProp: "NONE" }), true);
  assert.equal(shouldCenterSoloExplainerBeat({ ...soloNoProp, visualProp: "BRAIN_GLOW" }), false);
  assert.equal(
    shouldCenterSoloExplainerBeat({
      ...soloNoProp,
      actors: [
        { preset: "BOY", slot: "LEFT", facing: "RIGHT", motion: "IDLE_TALK", expression: "HAPPY" },
        { preset: "DOCTOR", slot: "RIGHT", facing: "LEFT", motion: "IDLE_TALK", expression: "HAPPY" },
      ],
    }),
    false
  );
  assert.equal(shouldCenterSoloExplainerBeat({ ...soloNoProp, stageType: "SCIENCE_LAB_ROOM" }), false);

  // 2. V18 timeline solo actor (real-world nuot_keo_cao_su b14 pattern: WALK 420->640, TALK_GESTURE 640->660)
  const rawTl = [
    { fromPct: 0, toPct: 0.45, startX: 420, endX: 640, facing: "RIGHT" as const, pose: "WALK" as const, expression: "HAPPY" as const },
    { fromPct: 0.45, toPct: 1.0, startX: 640, endX: 660, facing: "RIGHT" as const, pose: "TALK_GESTURE" as const, expression: "HAPPY" as const },
  ];
  const shift = computeSoloExplainerCenterShiftX(rawTl);
  assert.equal(shift, 310);
  const centeredTl = centerSoloExplainerTimeline(rawTl);
  assert.equal(centeredTl[0].endX - centeredTl[0].startX, 220, "Walk distance preserved");
  assert.equal(centeredTl[1].startX, 950);
  assert.equal(centeredTl[1].endX, 970);

  // Render full UniversalAutoStage for solo V18 timeline on EXPLAINER_POLKA_DOT without visualProp
  const beatSoloV18 = makeBaseBeat({
    stageType: "EXPLAINER_POLKA_DOT",
    visualProp: "NONE",
    actors: [
      {
        preset: "BOY",
        slot: "LEFT",
        facing: "RIGHT",
        motion: "WALK_IN",
        expression: "HAPPY",
        timeline: rawTl,
      },
    ],
  });
  const svgCentered = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: beatSoloV18, frame: 210, localFrame: 210, durationFrames: 300, u: 0.7 })
  );
  const txMatch = svgCentered.match(/id="stickman-rig-wrapper" transform="translate\(([^,]+), 840\)/);
  assert.ok(txMatch, "Actor wrapper transform found");
  const renderedX = Number(txMatch[1]);
  assert.ok(renderedX >= 945 && renderedX <= 975, `Solo EXPLAINER_POLKA_DOT actor must center around 960, got ${renderedX}`);

  // 3. Render with visualProp="BRAIN_GLOW" -> must NOT auto-center (stays on LEFT ~650)
  const beatWithProp = { ...beatSoloV18, visualProp: "BRAIN_GLOW" as const };
  const svgWithProp = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: beatWithProp, frame: 210, localFrame: 210, durationFrames: 300, u: 0.7 })
  );
  const txPropMatch = svgWithProp.match(/id="stickman-rig-wrapper" transform="translate\(([^,]+), 840\)/);
  assert.ok(txPropMatch);
  const propActorX = Number(txPropMatch[1]);
  assert.ok(propActorX >= 635 && propActorX <= 665, `With visualProp, actor must stay on left (~650), got ${propActorX}`);

  // 4. V17 legacy solo actor (no timeline, slot="LEFT") -> auto-centers to 960
  const svgLegacy = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: soloNoProp, frame: 150, localFrame: 150, durationFrames: 300, u: 0.5 })
  );
  const txLegacyMatch = svgLegacy.match(/id="stickman-rig-wrapper" transform="translate\(([^,]+), 840\)/);
  assert.ok(txLegacyMatch);
  assert.equal(Number(txLegacyMatch[1]), 960);
});

test("V18.4 Regression #1: Consecutive NOD_SMILE segments do NOT restart nodding mid-beat & NaN frames are safe", () => {
  // Non-finite / negative guards
  assert.equal(computeGentleDoubleNodDeg(NaN), 0);
  assert.equal(computeGentleDoubleNodDeg(Infinity), 0);
  assert.equal(computeGentleDoubleNodDeg(-25), 0);

  // Real nuot_keo_cao_su_v18 b10/b11/b36/b42/b43 GRANDPA pattern: back-to-back NOD_SMILE segments
  const consecutiveTl = [
    { fromPct: 0, toPct: 0.45, startX: 480, endX: 480, facing: "RIGHT" as const, pose: "NOD_SMILE" as const, expression: "HAPPY" as const },
    { fromPct: 0.45, toPct: 1.0, startX: 480, endX: 480, facing: "RIGHT" as const, pose: "NOD_SMILE" as const, expression: "HAPPY" as const },
  ];
  assert.equal(resolveContiguousPoseRunStartPct(consecutiveTl, 0), 0);
  assert.equal(resolveContiguousPoseRunStartPct(consecutiveTl, 1), 0);

  const beat = makeBaseBeat({
    stageType: "DOCTOR_CLINIC",
    actors: [
      {
        preset: "GRANDPA",
        slot: "LEFT",
        facing: "RIGHT",
        motion: "IDLE_TALK",
        expression: "HAPPY",
        timeline: consecutiveTl,
      },
    ],
  });

  // At f=14 (Nod #1 peak), head is nodding
  const svgF14 = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: beat, frame: 14, localFrame: 14, durationFrames: 300, u: 14 / 300 })
  );
  const m14 = svgF14.match(/id="neck-head-cluster" transform="translate\(0, -185\) rotate\(([^)]+)\)"/);
  assert.ok(m14 && Number(m14[1]) > 4.0, `Expected nod peak at f=14, got ${m14?.[1]}`);

  // Crossing from segment 0 into segment 1 (f=135..195) must stay strictly 0 deg (NO 3rd/4th nod!)
  for (const lf of [60, 134, 135, 140, 149, 160, 177, 250]) {
    const svg = renderToStaticMarkup(
      React.createElement(UniversalAutoStage, { spec: beat, frame: lf, localFrame: lf, durationFrames: 300, u: lf / 300 })
    );
    const m = svg.match(/id="neck-head-cluster" transform="translate\(0, -185\) rotate\(([^)]+)\)"/);
    assert.ok(m, `Head cluster found at f=${lf}`);
    assert.equal(Number(m[1]), 0, `Consecutive NOD_SMILE must NOT restart nodding at f=${lf}, got ${m[1]}`);
  }
});

test("V18.4 Regression #2: FK angle-space 10-frame blendPose has ZERO 40px elbow-flip snap across TALK_GESTURE <-> NOD_SMILE", () => {
  const shoulder: Point2D = { x: 0, y: -TORSO_LEN };
  const extractArmPaths = (svg: string): Array<{ elbow: Point2D; wrist: Point2D }> => {
    const armsBlockMatch = svg.match(/id="layer-character-arms">([\s\S]*?)<\/g>/);
    assert.ok(armsBlockMatch, "layer-character-arms found");
    const paths = [...armsBlockMatch[1].matchAll(/d="M 0 -115 L ([^ ]+) ([^ ]+) L ([^ ]+) ([^"]+)"/g)];
    return paths.map((m) => ({
      elbow: { x: Number(m[1]), y: Number(m[2]) },
      wrist: { x: Number(m[3]), y: Number(m[4]) },
    }));
  };

  for (const [p1, p2] of [
    ["TALK_GESTURE", "NOD_SMILE"],
    ["NOD_SMILE", "TALK_GESTURE"],
    ["WRITE_NOTE", "NOD_SMILE"],
  ] as const) {
    const beat = makeBaseBeat({
      stageType: "DOCTOR_CLINIC",
      actors: [
        {
          preset: "BOY",
          slot: "CENTER",
          facing: "RIGHT",
          motion: "IDLE_TALK",
          expression: "HAPPY",
          timeline: [
            { fromPct: 0, toPct: 0.5, startX: 740, endX: 740, facing: "RIGHT", pose: p1, expression: "HAPPY" },
            { fromPct: 0.5, toPct: 1.0, startX: 740, endX: 740, facing: "RIGHT", pose: p2, expression: "HAPPY" },
          ],
        },
      ],
    });

    let prevRightElbow: Point2D | null = null;
    let maxRightJump = 0;
    for (let lf = 149; lf <= 161; lf++) {
      const svg = renderToStaticMarkup(
        React.createElement(UniversalAutoStage, { spec: beat, frame: lf, localFrame: lf, durationFrames: 300, u: lf / 300 })
      );
      const arms = extractArmPaths(svg);
      assert.equal(arms.length, 2);
      const right = arms[1];
      // Verify bone lengths stay invariant during every blend frame
      const d1 = Math.hypot(right.elbow.x - shoulder.x, right.elbow.y - shoulder.y);
      const d2 = Math.hypot(right.wrist.x - right.elbow.x, right.wrist.y - right.elbow.y);
      assert.ok(Math.abs(d1 - ARM_L1) < 0.1, `${p1}->${p2} f=${lf} ARM_L1 preserved: ${d1}`);
      assert.ok(Math.abs(d2 - ARM_L2) < 0.1, `${p1}->${p2} f=${lf} ARM_L2 preserved: ${d2}`);
      if (prevRightElbow) {
        maxRightJump = Math.max(maxRightJump, Math.hypot(right.elbow.x - prevRightElbow.x, right.elbow.y - prevRightElbow.y));
      }
      prevRightElbow = right.elbow;
    }
    assert.ok(
      maxRightJump < 16,
      `${p1} -> ${p2} must blend smoothly without 40px+ elbow teleport, got max jump ${maxRightJump.toFixed(1)}px`
    );
  }

  // Also verify TALK_GESTURE forearm stays naturally below horizontal (<= 90 deg) across full cycle
  for (let frame = 0; frame < 240; frame++) {
    const raw = computeV18ActionArmsUpper("TALK_GESTURE", false, shoulder, frame, frame, 0.5)!;
    const fDeg = forearmAngleFromDownDeg(raw.rightElbow, raw.rightWrist);
    assert.ok(fDeg <= 90, `TALK_GESTURE forearm should not tip above horizontal, got ${fDeg.toFixed(2)} deg at f=${frame}`);
  }

  // Direct unit check on blendArmJointsFK bone-length invariance at midpoint t=0.5
  const a = computeV18ActionArmsUpper("TALK_GESTURE", false, shoulder, 0, 0, 0.5)!;
  const b = computeV18ActionArmsUpper("NOD_SMILE", false, shoulder, 0, 0, 0.5)!;
  const mid = blendArmJointsFK(a.rightElbow, a.rightWrist, b.rightElbow, b.rightWrist, 0.5);
  assert.ok(Math.abs(Math.hypot(mid.elbow.x - shoulder.x, mid.elbow.y - shoulder.y) - ARM_L1) < 1e-4);
  assert.ok(Math.abs(Math.hypot(mid.wrist.x - mid.elbow.x, mid.wrist.y - mid.elbow.y) - ARM_L2) < 1e-4);
});

test("V18.4 Regression #3: EXPLAINER_POLKA_DOT normalizes dirty visualProp values & centers V17 legacy APPROACH_OTHER", () => {
  assert.equal(normalizeVisualPropId(undefined), "NONE");
  assert.equal(normalizeVisualPropId(null), "NONE");
  assert.equal(normalizeVisualPropId(""), "NONE");
  assert.equal(normalizeVisualPropId("   "), "NONE");
  assert.equal(normalizeVisualPropId("none"), "NONE");
  assert.equal(normalizeVisualPropId(" NONE "), "NONE");
  assert.equal(normalizeVisualPropId("UNKNOWN_PROP"), "NONE");
  assert.equal(normalizeVisualPropId(" brain_glow "), "BRAIN_GLOW");

  for (const dirtyProp of ["", "   ", "none", " NONE ", "UNKNOWN_INVALID"] as any[]) {
    const beat = makeBaseBeat({
      stageType: "EXPLAINER_POLKA_DOT",
      visualProp: dirtyProp,
      actors: [{ preset: "BOY", slot: "LEFT", facing: "RIGHT", motion: "IDLE_TALK", expression: "HAPPY" }],
    });
    assert.equal(shouldCenterSoloExplainerBeat(beat), true, `Dirty visualProp=${JSON.stringify(dirtyProp)} should auto-center`);
  }

  // V17 legacy solo actor with motion="APPROACH_OTHER" must walk INTO x=960 (not away to x=1100!)
  const beatApproach = makeBaseBeat({
    stageType: "EXPLAINER_POLKA_DOT",
    visualProp: "NONE",
    actors: [{ preset: "DOCTOR", slot: "LEFT", facing: "RIGHT", motion: "APPROACH_OTHER", expression: "HAPPY" }],
  });
  const svgEnd = renderToStaticMarkup(
    React.createElement(UniversalAutoStage, { spec: beatApproach, frame: 210, localFrame: 210, durationFrames: 300, u: 0.7 })
  );
  const txMatch = svgEnd.match(/id="stickman-rig-wrapper" transform="translate\(([^,]+), 840\)/);
  assert.ok(txMatch, "Actor wrapper transform found");
  assert.equal(Number(txMatch[1]), 960, `Solo EXPLAINER APPROACH_OTHER must settle at 960, got ${txMatch[1]}`);
});
