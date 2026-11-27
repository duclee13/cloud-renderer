import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { sanitizeAndValidateEpisode } from "../src/lib/v7/episodeJsonSchema";
import { resolveAutoSfxPlan, VALID_AUTO_SFX_FILES } from "../src/lib/v7/autoSfxPlanner";
import {
  FOREST_PARK_BACKDROP,
  OCEAN_UNDERWATER_BACKDROP,
  BACKYARD_BALCONY_PET,
} from "../src/components/NatureBackdropKit";
import {
  CuteCat,
  CuteDog,
  CuteBird,
  CuteAnt,
  CuteLizard,
  CuteOctopus,
  CuteShark,
  CuteDolphin,
  CreatureEmotion,
  isAnimalBlinking,
} from "../src/components/AnimalSpriteKit";
import { UniversalAutoStage } from "../src/components/v7/UniversalAutoStage";
import { EPISODE_VISUAL_REGISTRY } from "../src/components/v7/episodeVisuals";

function assertCleanFlatSvg(svg: string, label: string) {
  assert.ok(!svg.includes("feGaussianBlur"), `${label} must not use feGaussianBlur`);
  assert.ok(!svg.includes("feDropShadow"), `${label} must not use feDropShadow`);
  assert.ok(!svg.includes("<foreignObject"), `${label} must not use foreignObject`);
}

test("V23 #1: Auto-SFX WAV pack exists (< 80 KB each) and auto-planner resolves transitions cleanly", () => {
  const sfxDir = path.resolve(__dirname, "../public/sfx");
  for (const fn of VALID_AUTO_SFX_FILES) {
    const fp = path.join(sfxDir, fn);
    assert.ok(fs.existsSync(fp), `Missing generated WAV: ${fn}`);
    const stat = fs.statSync(fp);
    assert.ok(stat.size > 44 && stat.size < 80 * 1024, `${fn} size (${stat.size}B) must be > 44B and < 80KB`);
    const header = fs.readFileSync(fp).subarray(0, 4).toString("ascii");
    assert.equal(header, "RIFF", `${fn} must be a valid RIFF/WAV file`);
  }

  // Test automatic cue detection across Episode 8's 60 beats
  const ep8 = sanitizeAndValidateEpisode(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, "../episodes/tai_sao_tieng_cao_bang_lam_noi_da_ga_v21.json"), "utf8"))
  );
  const compiled = ep8.beats.map((b, idx) => ({
    id: b.id,
    startFrame: idx * 200,
    durationFrames: 200,
    stageType: b.stageType,
    autoStageSpec: b,
  }));
  const events = resolveAutoSfxPlan(compiled, 45, true);
  assert.ok(events.length > 20, "Episode 8 should auto-trigger rich SFX cues");
  const cues = new Set(events.map((e) => e.cueId));
  assert.ok(cues.has("whoosh_in"), "Auto-detects whoosh_in when entering HOST_EXPLAIN_OVERLAY");
  assert.ok(cues.has("whoosh_out"), "Auto-detects whoosh_out when unfreezing back to story scene");
  assert.ok(cues.has("ding"), "Auto-detects ding_warm on TIPS/SUMMARY SVGs");
  assert.ok(cues.has("pop"), "Auto-detects pop_soft on SVG steps & story bubbles");
  assert.ok(cues.has("alert"), "Auto-detects alert_soft on danger/screech beats");
  for (const ev of events) {
    assert.ok(ev.volume >= 0.16 && ev.volume <= 0.26, `Volume ${ev.volume} stays in safe 0.16-0.26 range`);
  }

  // Master toggle off -> 0 cues
  assert.equal(resolveAutoSfxPlan(compiled, 45, false).length, 0, "sfxEnabled=false silences Auto-SFX");

  // Explicit sfxCue="none" skips beat; explicit override respected
  const overrideEvents = resolveAutoSfxPlan(
    [
      { id: "a", startFrame: 0, durationFrames: 180, autoStageSpec: { ...ep8.beats[0], sfxCue: "none" } },
      { id: "b", startFrame: 180, durationFrames: 180, autoStageSpec: { ...ep8.beats[1], sfxCue: "ding" } },
    ],
    45,
    true
  );
  assert.equal(overrideEvents.length, 1);
  assert.equal(overrideEvents[0].cueId, "ding");
});

test("V23 #2: NatureBackdropKit renders 3 flat 3-layer stages both standalone and as HOST_EXPLAIN freezeStage", () => {
  const standaloneChecks = [
    { name: "FOREST_PARK_BACKDROP", el: React.createElement(FOREST_PARK_BACKDROP, { frame: 45 }), id: 'id="stage-forest-park"' },
    { name: "OCEAN_UNDERWATER_BACKDROP", el: React.createElement(OCEAN_UNDERWATER_BACKDROP, { frame: 45 }), id: 'id="stage-ocean-underwater"' },
    { name: "BACKYARD_BALCONY_PET", el: React.createElement(BACKYARD_BALCONY_PET, { frame: 45 }), id: 'id="stage-backyard-balcony-pet"' },
  ];
  for (const check of standaloneChecks) {
    const svg = renderToStaticMarkup(React.createElement("svg", { viewBox: "0 0 1920 1080" }, check.el));
    assert.ok(svg.includes(check.id), `${check.name} renders ${check.id}`);
    assertCleanFlatSvg(svg, check.name);
  }

  // Test registering inside UniversalAutoStage as both normal stage & HOST_EXPLAIN freezeStage + NATURE_FIELD_BOARD
  const ep = sanitizeAndValidateEpisode({
    title: "Nature Series Smoke Test",
    slug: "nature_smoke",
    boardTheme: "NATURE_FIELD_BOARD",
    beats: [
      { id: "n1", text: "Đi công viên rừng xanh.", ttsText: "Đi công viên rừng xanh.", stageType: "FOREST_PARK", actors: [] },
      { id: "n2", text: "Lặn xuống đáy biển sáng trong.", ttsText: "Lặn xuống đáy biển sáng trong.", stageType: "OCEAN_UNDERWATER", actors: [] },
      { id: "n3", text: "Chơi cùng mèo trên ban công.", ttsText: "Chơi cùng mèo trên ban công.", stageType: "BACKYARD_BALCONY_PET", actors: [] },
      {
        id: "n4",
        text: "Sổ tay thiên nhiên giải mã mèo rơi bốn chân.",
        ttsText: "Sổ tay thiên nhiên giải mã mèo rơi bốn chân.",
        stageType: "HOST_EXPLAIN_OVERLAY",
        overlayMode: "HOST_EXPLAIN",
        freezeStage: "BACKYARD_BALCONY_PET",
        boardTheme: "NATURE_FIELD_BOARD",
        natureBoardTitle: "TẠI SAO MÈO RƠI LUÔN TIẾP ĐẤT 4 CHÂN?",
        hostBoardHighlight: "CENTER",
        actors: [
          {
            preset: "BOY",
            appearance: { scale: 1.28 },
            slot: "LEFT",
            facing: "RIGHT",
            motion: "IDLE_TALK",
            expression: "CURIOUS",
            handProp: "POINTER",
            groundY: 760,
            lookAtCamera: true,
            bubble: "Mèo xoay người giữa không trung thế nào nhỉ?",
            timeline: [{ fromPct: 0, toPct: 1, startX: 330, endX: 330, facing: "RIGHT", pose: "POINT_FORWARD", expression: "CURIOUS" }],
          },
        ],
      },
    ],
  });

  const hostSvg = renderToStaticMarkup(
    React.createElement(
      "svg",
      { width: 1920, height: 1080 },
      React.createElement(UniversalAutoStage, {
        spec: ep.beats[3],
        frame: 60,
        localFrame: 60,
        durationFrames: 225,
        u: 0.3,
        fps: 45,
      })
    )
  );
  assert.ok(hostSvg.includes('id="stage-backyard-balcony-pet"'), "Freezes BACKYARD_BALCONY_PET underneath");
  assert.ok(hostSvg.includes('id="host-board-nature-field-static"'), "Renders NATURE_FIELD_BOARD theme");
  assert.ok(hostSvg.includes("SỔ TAY THIÊN NHIÊN"), "Shows SỔ TAY THIÊN NHIÊN header");
  assertCleanFlatSvg(hostSvg, "HOST_EXPLAIN_OVERLAY NATURE_FIELD_BOARD");
});

test("V23 #3: AnimalSpriteKit renders all 4 sprites & poses cleanly with BOY stroke style and 0 blur", () => {
  const sprites = [
    React.createElement(CuteCat, { key: "c1", x: 300, y: 780, frame: 30, pose: "sit" }),
    React.createElement(CuteCat, { key: "c2", x: 520, y: 780, frame: 30, pose: "stand", variant: "gray" }),
    React.createElement(CuteCat, { key: "c3", x: 740, y: 580, frame: 30, pose: "curl_midair" }),
    React.createElement(CuteCat, { key: "c4", x: 960, y: 780, frame: 30, pose: "puff_fur" }),
    React.createElement(CuteDog, { key: "d1", x: 1180, y: 780, frame: 30, pose: "yawn" }),
    React.createElement(CuteDog, { key: "d2", x: 1400, y: 780, frame: 30, pose: "wag" }),
    React.createElement(CuteBird, { key: "b1", x: 1580, y: 420, frame: 30, pose: "perch", variant: "blue" }),
    React.createElement(CuteBird, { key: "b2", x: 1720, y: 340, frame: 30, pose: "fly", variant: "yellow" }),
    React.createElement(CuteAnt, { key: "a1", x: 400, y: 840, frame: 30, pose: "walk" }),
    React.createElement(CuteAnt, { key: "a2", x: 640, y: 840, frame: 30, pose: "carry" }),
  ];

  const svg = renderToStaticMarkup(React.createElement("svg", { viewBox: "0 0 1920 1080" }, ...sprites));
  assert.ok(svg.includes('stroke="#1E293B"'), "Matches BOY stroke color #1E293B");
  assert.ok(svg.includes('stroke-width="4"'), "Matches BOY strokeWidth 4");
  assert.ok(svg.includes('opacity="0.12"'), "Includes flat ground shadow opacity=0.12");
  for (const id of [
    "animal-cute-cat-sit",
    "animal-cute-cat-stand",
    "animal-cute-cat-curl_midair",
    "animal-cute-cat-puff_fur",
    "animal-cute-dog-yawn",
    "animal-cute-dog-wag",
    "animal-cute-bird-perch",
    "animal-cute-bird-fly",
    "animal-cute-ant-walk",
    "animal-cute-ant-carry",
  ]) {
    assert.ok(svg.includes(`id="${id}"`), `Renders ${id}`);
  }
  assertCleanFlatSvg(svg, "AnimalSpriteKit");
});

test("V23 #4: Zero-regression check on Episode 7 (defaults to LAB_WHITEBOARD & renders cleanly)", () => {
  const ep7 = sanitizeAndValidateEpisode(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, "../episodes/tai_sao_ngap_lai_lay_sang_nguoi_khac_v21.json"), "utf8"))
  );
  const hostBeat = ep7.beats.find((b) => b.id === "b05");
  assert.ok(hostBeat, "Episode 7 b05 exists");
  assert.equal(hostBeat!.boardTheme, undefined, "Episode 7 preserves default LAB_WHITEBOARD (boardTheme unset)");
  const svg = renderToStaticMarkup(
    React.createElement(
      "svg",
      { width: 1920, height: 1080 },
      React.createElement(UniversalAutoStage, {
        spec: hostBeat!,
        frame: 60,
        localFrame: 60,
        durationFrames: 225,
        u: 0.3,
        fps: 45,
      })
    )
  );
  assert.ok(svg.includes('id="host-board-mirror-neurons-static"'), "Episode 7 still renders LAB_WHITEBOARD MIRROR_NEURONS_YAWN");
  assert.ok(!svg.includes('id="host-board-nature-field-static"'), "Episode 7 does not switch to NATURE_FIELD_BOARD");
  assertCleanFlatSvg(svg, "Episode 7 regression check");
});

test("V23 #5: Episode 9 (60 beats, 16 CAT_* Full-Screen SVGs, NATURE_FIELD_BOARD, Solo Host & Auto-SFX)", () => {
  const raw = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../episodes/tai_sao_meo_luon_tiep_dat_bang_4_chan_v23.json"), "utf8")
  );
  const ep9 = sanitizeAndValidateEpisode(raw);
  assert.equal(ep9.slug, "tai_sao_meo_luon_tiep_dat_bang_4_chan_v23");
  assert.equal(ep9.sfxEnabled, true, "Episode 9 enables Auto-SFX");
  assert.equal(ep9.boardTheme, "NATURE_FIELD_BOARD", "Episode 9 uses NATURE_FIELD_BOARD");
  assert.equal(ep9.labBoard, "CAT_RIGHTING_PHYSICS", "Episode 9 uses CAT_RIGHTING_PHYSICS");
  assert.equal(ep9.beats.length, 60, "Episode 9 has exactly 60 beats");

  const svgKeys = new Set<string>();
  for (const b of ep9.beats) {
    assert.ok(b.ttsText.trim().length > 10, `${b.id} must have non-empty ttsText`);
    assert.ok(!/[0-9zZ\-–—]/.test(b.ttsText), `${b.id} ttsText must be pure Vietnamese without digits/z/hyphens`);
    for (const a of b.actors) {
      if (a.bubble) {
        const wc = a.bubble.trim().split(/\s+/).length;
        assert.ok(wc <= 10, `${b.id} bubble <= 10 words (got ${wc}: ${a.bubble})`);
      }
    }
    if (b.customVisual) {
      svgKeys.add(b.customVisual);
      assert.equal(b.fullScreenVisual, true, `${b.id} uses fullScreenVisual`);
      assert.equal(b.chapterBanner, undefined, `${b.id} hides chapterBanner on Full-Screen SVG`);
    }
    if (b.stageType === "HOST_EXPLAIN_OVERLAY") {
      assert.equal(b.boardTheme, "NATURE_FIELD_BOARD", `${b.id} uses NATURE_FIELD_BOARD`);
      assert.ok(
        b.freezeStage === "BACKYARD_BALCONY_PET" || b.freezeStage === "CITY_LIVING_ROOM",
        `${b.id} locks freezeStage cleanly`
      );
      assert.equal(b.chapterBanner, undefined, `${b.id} hides chapterBanner on HOST_EXPLAIN_OVERLAY`);
    }
  }
  assert.equal(svgKeys.size, 16, "Episode 9 uses all 16 distinct CAT_* Full-Screen SVGs");

  // Render key story, Host+Board, Host Solo, Living Room Cat, and all 16 Full-Screen SVGs cleanly
  const sampleIds = ["b01", "b02", "b04", "b29", "b31", "b46", "b47", "b52", "b59"];
  for (const bid of sampleIds) {
    const beat = ep9.beats.find((b) => b.id === bid)!;
    const svg = renderToStaticMarkup(
      React.createElement(
        "svg",
        { width: 1920, height: 1080 },
        React.createElement(UniversalAutoStage, {
          spec: beat,
          frame: 60,
          localFrame: 60,
          durationFrames: 225,
          u: 0.35,
          fps: 45,
        })
      )
    );
    assertCleanFlatSvg(svg, `Ep9 ${bid}`);
    if (bid === "b04") {
      assert.ok(svg.includes('id="host-board-cat-righting-static"'), "b04 renders CAT_RIGHTING_PHYSICS Nature Field Board");
      assert.ok(svg.includes('id="stage-backyard-balcony-pet"'), "b04 freezes BACKYARD_BALCONY_PET");
    }
    if (bid === "b31") {
      assert.ok(svg.includes('id="living-room-pet-cat-CAT_RUG"'), "b31 freezes Mướp (not Episode 7 dog) on CITY_LIVING_ROOM");
      assert.ok(!svg.includes('id="living-room-pet-dog"'), "b31 does not render Episode 7 dog");
    }
    if (bid === "b52") {
      assert.ok(!svg.includes('id="host-board-cat-righting-static"'), "Solo Host b52 centers BOY without board behind him");
    }
  }

  // Render every single Episode 9 Full-Screen SVG component directly and verify 0 blur/dropShadow/foreignObject
  for (const b of ep9.beats) {
    if (!b.customVisual) continue;
    const Comp = EPISODE_VISUAL_REGISTRY[b.customVisual];
    assert.ok(Comp, `Missing registered visual ${b.customVisual}`);
    const svg = renderToStaticMarkup(
      React.createElement(Comp, {
        progress: 0.4,
        frame: 50,
        fps: 45,
        step: b.visualStep ?? 0,
        visualStep: b.visualStep ?? 0,
      })
    );
    assert.ok(svg.startsWith("<svg"), `${b.customVisual} renders pure root <svg>`);
    assertCleanFlatSvg(svg, `Ep9 SVG ${b.id} (${b.customVisual}#${b.visualStep ?? 0})`);
  }

  // Auto-SFX plan verification on Episode 9
  const sfxPlan = resolveAutoSfxPlan(
    ep9.beats.map((b, idx) => ({
      id: b.id,
      startFrame: idx * 200,
      durationFrames: 200,
      stageType: b.stageType,
      autoStageSpec: b,
    })),
    45,
    true
  );
  const byId = new Map(sfxPlan.map((e) => [e.beatId, e.cueId]));
  assert.equal(byId.get("b04"), "whoosh_in", "b04 triggers whoosh_in");
  assert.equal(byId.get("b09"), "alert", "b09 triggers alert_soft");
  assert.equal(byId.get("b28"), "whoosh_out", "b28 triggers whoosh_out");
  assert.equal(byId.get("b37"), "alert", "b37 triggers alert_soft");
  assert.equal(byId.get("b44"), "ding", "b44 triggers ding_warm");
  assert.equal(byId.get("b45"), "whoosh_out", "b45 triggers whoosh_out");
  assert.equal(byId.get("b51"), "ding", "b51 triggers ding_warm");
  assert.equal(byId.get("b55"), "ding", "b55 triggers ding_warm");
  assert.equal(byId.get("b56"), "ding", "b56 triggers ding_warm");
  assert.equal(byId.get("b57"), "ding", "b57 triggers ding_warm");
  assert.equal(byId.get("b59"), "whoosh_out", "b59 triggers whoosh_out");
});

test("V23 #6: V23.5 Expressive & Friendly Creature Kit (8 creatures, 6 emotions, hasTail=false, halfAsleep=true, 0 blur)", () => {
  // 1. Verify smooth 5-frame blink every 110 frames
  assert.equal(isAnimalBlinking(104, 0), false);
  assert.equal(isAnimalBlinking(105, 0), true);
  assert.equal(isAnimalBlinking(109, 0), true);
  assert.equal(isAnimalBlinking(110, 0), false);

  // 2. Verify all 6 emotions + counter-flip on flipX=true
  const emotions: CreatureEmotion[] = ["happy", "curious", "surprised", "scared", "sleepy", "proud"];
  for (const em of emotions) {
    const svgFront = renderToStaticMarkup(
      React.createElement(
        "svg",
        { viewBox: "0 0 400 400" },
        React.createElement(CuteCat, { x: 200, y: 300, frame: 24, pose: "sit", emotion: em, flipX: true }),
        React.createElement(CuteDog, { x: 200, y: 300, frame: 24, pose: "stand", emotion: em })
      )
    );
    assert.ok(svgFront.includes("#FDA4AF") && svgFront.includes('opacity="0.45"'), `Emotion ${em} renders pastel rosy cheeks`);
    assertCleanFlatSvg(svgFront, `CreatureFace front (${em})`);
    if (em === "curious") assert.ok(svgFront.includes(">?<") && svgFront.includes("scale(-1, 1)"), "Curious renders counter-flipped ? badge");
    if (em === "surprised") assert.ok(svgFront.includes(">!<"), "Surprised renders ! badge");
    if (em === "scared") assert.ok(svgFront.includes("#38BDF8"), "Scared renders pastel-blue sweat drop");
    if (em === "sleepy") assert.ok(svgFront.includes(">z<") && svgFront.includes(">Z<"), "Sleepy renders floating zZ");
  }

  // 3. Verify all 4 new creatures + all poses + hasTail=false + halfAsleep=true
  const v235Sprites = [
    React.createElement(CuteDog, { key: "dog-sit", x: 200, y: 300, frame: 24, pose: "sit" }),
    React.createElement(CuteDog, { key: "dog-stand", x: 380, y: 300, frame: 24, pose: "stand" }),
    React.createElement(CuteLizard, { key: "liz-stand", x: 200, y: 600, frame: 24, pose: "stand", hasTail: true }),
    React.createElement(CuteLizard, { key: "liz-notail", x: 450, y: 600, frame: 24, pose: "run", hasTail: false, emotion: "scared" }),
    React.createElement(CuteLizard, { key: "liz-climb", x: 700, y: 600, frame: 24, pose: "climb", emotion: "curious" }),
    React.createElement(CuteOctopus, { key: "oct-float", x: 950, y: 600, frame: 24, pose: "float", variant: "coral" }),
    React.createElement(CuteOctopus, { key: "oct-crawl", x: 1150, y: 600, frame: 24, pose: "crawl", variant: "purple" }),
    React.createElement(CuteOctopus, { key: "oct-wave", x: 1350, y: 600, frame: 24, pose: "wave", variant: "coral", emotion: "proud" }),
    React.createElement(CuteShark, { key: "shk-swim", x: 400, y: 880, frame: 24, pose: "swim", emotion: "happy" }),
    React.createElement(CuteShark, { key: "shk-rest", x: 750, y: 880, frame: 24, pose: "rest", emotion: "sleepy" }),
    React.createElement(CuteDolphin, { key: "dol-swim", x: 1100, y: 880, frame: 24, pose: "swim", halfAsleep: true }),
    React.createElement(CuteDolphin, { key: "dol-jump", x: 1450, y: 880, frame: 24, pose: "jump", halfAsleep: false, emotion: "proud" }),
  ];

  const v235Svg = renderToStaticMarkup(React.createElement("svg", { viewBox: "0 0 1920 1080" }, ...v235Sprites));
  for (const id of [
    "animal-cute-dog-sit",
    "animal-cute-dog-stand",
    "animal-cute-lizard-stand",
    "animal-cute-lizard-run",
    "animal-cute-lizard-climb",
    "lizard-detached-tail-stump",
    "animal-cute-octopus-float",
    "animal-cute-octopus-crawl",
    "animal-cute-octopus-wave",
    "animal-cute-shark-swim",
    "animal-cute-shark-rest",
    "animal-cute-dolphin-swim",
    "animal-cute-dolphin-jump",
    "dolphin-half-asleep-face",
  ]) {
    assert.ok(v235Svg.includes(`id="${id}"`), `Renders V23.5 element ${id}`);
  }
  assert.ok(v235Svg.includes(">zZ<"), "CuteDolphin halfAsleep=true renders unihemispheric sleep zZ");
  assertCleanFlatSvg(v235Svg, "V23.5 New Creatures Suite");
});
