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
import { CuteCat, CuteDog, CuteBird, CuteAnt } from "../src/components/AnimalSpriteKit";
import { UniversalAutoStage } from "../src/components/v7/UniversalAutoStage";

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
