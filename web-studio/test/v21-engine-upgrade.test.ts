/**
 * V21.0 Engine Upgrade Verification Test Suite
 * Run: node -r ./scripts/register-ts.cjs --test test/v21-engine-upgrade.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sanitizeAndValidateEpisode } from "../src/lib/v7/episodeJsonSchema";
import {
  StickmanRig,
  ComicSpeechBubble,
  computeStickmanIdleBreathFactor,
} from "../src/remotion/components/character/StickmanRig";
import { UniversalAutoStage } from "../src/components/v7/UniversalAutoStage";

test("V21 #1: Natural blink (4-5f every 3.5-4.5s, desynced), 1.2-1.8px idle breathing (0px foot slip), and calm TALK_GESTURE mouth", () => {
  // 1A. Idle breathing amplitude at shoulders (~288px) is within 1.2..1.8px for both BOY (0.76) and Adults (1.0), and 0 when walking
  for (const [scale, seed] of [
    [1.0, 101],
    [0.76, 202],
  ] as const) {
    let minShoulderShift = Infinity;
    let maxShoulderShift = -Infinity;
    for (let f = 0; f < 240; f++) {
      const bf = computeStickmanIdleBreathFactor(f, seed, true, 0);
      const shiftPx = (bf - 1) * 288.06 * scale;
      minShoulderShift = Math.min(minShoulderShift, shiftPx);
      maxShoulderShift = Math.max(maxShoulderShift, shiftPx);
    }
    const peakAmp = Math.max(Math.abs(minShoulderShift), Math.abs(maxShoulderShift));
    assert.ok(
      peakAmp >= 1.18 && peakAmp <= 1.8,
      `Expected standing shoulder breath amplitude in 1.2..1.8px for scale=${scale}, got ${peakAmp.toFixed(2)}px`
    );
    assert.equal(computeStickmanIdleBreathFactor(45, seed, true, 1.0), 1.0, "Walking disables idle breathing");
  }

  // 1B. Natural blink lasts 4-5 frames in a 210..270 frame cycle, desynced across actors, and feet stay locked at y=0 (groundY)
  const beat = sanitizeAndValidateEpisode({
    title: "V21 Life",
    slug: "v21_life",
    beats: [
      {
        id: "b_life",
        text: "Hai ông cháu trò chuyện.",
        ttsText: "Hai ông cháu trò chuyện.",
        stageType: "COUNTRYSIDE_YARD",
        actors: [
          {
            preset: "BOY",
            slot: "LEFT",
            facing: "RIGHT",
            motion: "IDLE_TALK",
            expression: "HAPPY",
            timeline: [{ fromPct: 0, toPct: 1, startX: 520, endX: 520, facing: "RIGHT", pose: "TALK_GESTURE", expression: "HAPPY" }],
          },
          {
            preset: "GRANDPA",
            slot: "RIGHT",
            facing: "LEFT",
            motion: "IDLE_TALK",
            expression: "CURIOUS",
            timeline: [{ fromPct: 0, toPct: 1, startX: 1280, endX: 1280, facing: "LEFT", pose: "NOD_SMILE", expression: "CURIOUS" }],
          },
        ],
      },
    ],
  }).beats[0];

  let boyBlinkFrames = 0;
  let grandpaBlinkFrames = 0;
  let simultaneousBlinkFrames = 0;
  const boyMouthStates = new Set<string>();
  const baselineFeetWorld: Array<{ lx: number; ly: number; rx: number; ry: number }> = [];
  let maxFootDriftWorldPx = 0;

  for (let f = 0; f < 270; f++) {
    const svg = renderToStaticMarkup(
      React.createElement(
        "svg",
        { width: 1920, height: 1080 },
        React.createElement(UniversalAutoStage, { spec: beat, frame: f, localFrame: f, durationFrames: 300, u: f / 300 })
      )
    );
    const rigMatches = [
      ...svg.matchAll(/id="stickman-rig-wrapper" transform="translate\(([^,]+), ([^)]+)\) scale\(([^,]+), ([^)]+)\)"/g),
    ];
    const legMatches = [...svg.matchAll(/id="layer-character-legs">([\s\S]*?)<\/g>/g)];
    assert.equal(rigMatches.length, 2);
    assert.equal(legMatches.length, 2);
    for (let ai = 0; ai < 2; ai++) {
      const rx0 = Number(rigMatches[ai][1]);
      const ry0 = Number(rigMatches[ai][2]);
      const sx = Number(rigMatches[ai][3]);
      const sy = Number(rigMatches[ai][4]);
      const feet = [...legMatches[ai][1].matchAll(/L [-0-9.]+ [-0-9.]+ L ([-0-9.]+) ([-0-9.]+)"/g)].map((m) => ({
        x: rx0 + Number(m[1]) * sx,
        y: ry0 + Number(m[2]) * sy,
      }));
      assert.equal(feet.length, 2);
      const cur = { lx: feet[0].x, ly: feet[0].y, rx: feet[1].x, ry: feet[1].y };
      if (!baselineFeetWorld[ai]) {
        baselineFeetWorld[ai] = cur;
      } else {
        const base = baselineFeetWorld[ai];
        maxFootDriftWorldPx = Math.max(
          maxFootDriftWorldPx,
          Math.hypot(cur.lx - base.lx, cur.ly - base.ly),
          Math.hypot(cur.rx - base.rx, cur.ry - base.ry)
        );
      }
    }

    const actorBlocks = svg.split('id="stickman-rig-wrapper"').slice(1);
    assert.equal(actorBlocks.length, 2);
    const boyBlinking = !actorBlocks[0].includes('id="stickman-clean-2d-eyes"');
    const grandpaBlinking = !actorBlocks[1].includes('id="stickman-clean-2d-eyes"');
    if (boyBlinking) boyBlinkFrames++;
    if (grandpaBlinking) grandpaBlinkFrames++;
    if (boyBlinking && grandpaBlinking) simultaneousBlinkFrames++;

    // BOY is in TALK_GESTURE (even without bubble) -> mouth alternates smoothly between open ("talking") and closed ("smile")
    boyMouthStates.add(actorBlocks[0].includes('fill="#9F1239"') ? "open" : "closed");
  }

  assert.ok(maxFootDriftWorldPx < 0.02, `Standing feet must not slip during breathing, got ${maxFootDriftWorldPx}px`);
  assert.ok(boyBlinkFrames >= 4 && boyBlinkFrames <= 10, `BOY blinked ${boyBlinkFrames} frames in 270f`);
  assert.ok(grandpaBlinkFrames >= 4 && grandpaBlinkFrames <= 10, `GRANDPA blinked ${grandpaBlinkFrames} frames in 270f`);
  assert.equal(simultaneousBlinkFrames, 0, "Actors must be phase-shifted so they do not blink simultaneously");
  assert.deepEqual([...boyMouthStates].sort(), ["closed", "open"], "TALK_GESTURE must animate talking mouth even without bubble");
});

test("V21 #2: ScienceLabBackdrop & CountrysideYardBackdrop include enriched realistic details", () => {
  const labBeat = sanitizeAndValidateEpisode({
    title: "Lab",
    slug: "lab",
    beats: [{ id: "b_lab", text: "Phòng thí nghiệm.", ttsText: "Phòng thí nghiệm.", stageType: "SCIENCE_LAB_ROOM", actors: [] }],
  }).beats[0];
  const labSvg = renderToStaticMarkup(
    React.createElement("svg", null, React.createElement(UniversalAutoStage, { spec: labBeat, frame: 30, localFrame: 30, durationFrames: 180, u: 0.2 }))
  );
  assert.ok(labSvg.includes('id="lab-window-light"'), "Expected glass window with diagonal light beam");
  assert.ok(labSvg.includes('id="lab-science-bookshelf"'), "Expected wall-mounted science bookshelf");
  assert.ok(labSvg.includes('id="lab-table-shadow"'), "Expected soft shadow under lab table");

  const yardBeat = sanitizeAndValidateEpisode({
    title: "Yard",
    slug: "yard",
    beats: [{ id: "b_yard", text: "Sân nhà quê.", ttsText: "Sân nhà quê.", stageType: "COUNTRYSIDE_YARD", actors: [] }],
  }).beats[0];
  const yardSvg0 = renderToStaticMarkup(
    React.createElement("svg", null, React.createElement(UniversalAutoStage, { spec: yardBeat, frame: 0, localFrame: 0, durationFrames: 180, u: 0 }))
  );
  const yardSvg60 = renderToStaticMarkup(
    React.createElement("svg", null, React.createElement(UniversalAutoStage, { spec: yardBeat, frame: 60, localFrame: 60, durationFrames: 180, u: 0.33 }))
  );
  assert.ok(yardSvg0.includes('id="yard-fence-grass-tufts"'), "Expected swaying grass tufts along fence");
  assert.ok(yardSvg0.includes('id="yard-right-corner-tree"'), "Expected right-corner green tree beside house");
  assert.notEqual(yardSvg0, yardSvg60, "Clouds/grass/trees animate smoothly across frames");
});

test("V21 #3: ComicSpeechBubble pop-in (0.85->1.0 in ~8f), fade-out (~6f), and [180, 1740] safe X clamping", () => {
  const renderBubble = (x: number, lf: number) =>
    renderToStaticMarkup(
      React.createElement(
        "svg",
        null,
        React.createElement(ComicSpeechBubble, {
          x,
          y: 320,
          mouthX: x,
          mouthY: 460,
          text: "Ủa thật không?!",
          localFrame: lf,
          appearFrame: 20,
          disappearFrame: 100,
        })
      )
    );

  // Start of pop-in (localFrame = 20 -> elapsed = 0): scale = 0.850, opacity = 0.00
  const svgStart = renderBubble(960, 20);
  assert.ok(svgStart.includes("scale(0.850)") && svgStart.includes('opacity="0.00"'));

  // Mid pop-in (localFrame = 24 -> elapsed = 4 / 8): 0.85 < scale < 1.0, 0 < opacity < 1
  const svgMidIn = renderBubble(960, 24);
  const midScale = Number(svgMidIn.match(/scale\(([^)]+)\)/)?.[1]);
  const midOp = Number(svgMidIn.match(/opacity="([^"]+)"/)?.[1]);
  assert.ok(midScale > 0.85 && midScale < 1.0 && midOp > 0 && midOp < 1);

  // Full steady state (localFrame = 28 -> elapsed = 8): scale = 1.000, opacity = 1.00
  const svgFull = renderBubble(960, 28);
  assert.ok(svgFull.includes("scale(1.000)") && svgFull.includes('opacity="1.00"'));

  // Mid fade-out (localFrame = 97 -> remaining = 3 / 6): opacity = 0.50
  const svgMidOut = renderBubble(960, 97);
  const outOp = Number(svgMidOut.match(/opacity="([^"]+)"/)?.[1]);
  assert.ok(outOp > 0.2 && outOp < 0.8);

  // Safe X clamping strictly within [180, 1740] and clear of 0/1920 edges
  const svgFarLeft = renderBubble(20, 50);
  const leftX = Number(svgFarLeft.match(/translate\(([^,]+),/)?.[1]);
  assert.ok(leftX >= 180 && leftX <= 1740, `Expected left clamped X in [180, 1740], got ${leftX}`);

  const svgFarRight = renderBubble(1900, 50);
  const rightX = Number(svgFarRight.match(/translate\(([^,]+),/)?.[1]);
  assert.ok(rightX >= 180 && rightX <= 1740, `Expected right clamped X in [180, 1740], got ${rightX}`);
});

test("V21 #4: validate_episode.mjs warns on stage TALK_GESTURE/SCRATCH_HEAD/? without bubble and transitionFrames < 18", async () => {
  const validatorMod = await import("../scripts/validate_episode.mjs");
  const registered = validatorMod.loadRegisteredCustomVisuals();
  const ep = {
    title: "V21 Validator",
    beats: [
      {
        id: "b_stage_question_no_bubble",
        text: "Tại sao lại như vậy?",
        ttsText: "Tại sao lại như vậy?",
        stageType: "COUNTRYSIDE_YARD",
        transitionFrames: 12,
        actors: [{ preset: "BOY", slot: "LEFT", timeline: [{ fromPct: 0, toPct: 1, startX: 490, endX: 490, pose: "IDLE" }] }],
      },
      {
        id: "b_fullscreen_question_ok",
        text: "Tại sao lại như vậy?",
        ttsText: "Tại sao lại như vậy?",
        stageType: "EXPLAINER_POLKA_DOT",
        fullScreenVisual: true,
        customVisual: "MOSQUITO_CO2_RADAR",
        transitionFrames: 30,
        actors: [{ preset: "BOY", slot: "LEFT", timeline: [{ fromPct: 0, toPct: 1, startX: 420, endX: 420, pose: "TALK_GESTURE" }] }],
      },
    ],
  };
  const res = validatorMod.validateEpisodeData(ep, registered);
  assert.equal(res.errors.length, 0);
  assert.deepEqual(
    res.warnings.map((w: { beatId: string; code: string }) => `${w.beatId}:${w.code}`),
    [
      "b_stage_question_no_bubble:MISSING_SPEECH_BUBBLE",
      "b_stage_question_no_bubble:SHORT_TRANSITION",
    ]
  );
});
