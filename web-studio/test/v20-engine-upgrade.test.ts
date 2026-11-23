/**
 * V20.0 Engine Upgrade Verification Test Suite
 * Run: node -r ./scripts/register-ts.cjs --test test/v20-engine-upgrade.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Internals } from "remotion";
import {
  sanitizeAndValidateEpisode,
  type AutoEpisodeBeat,
} from "../src/lib/v7/episodeJsonSchema";
import {
  ARM_L1,
  ARM_L2,
  TORSO_LEN,
  computeV18ActionArmsUpper,
  computeStickmanArmsUpper,
  computeSipDrinkWave,
  StickmanRig,
} from "../src/remotion/components/character/StickmanRig";
import {
  UniversalAutoStage,
  CUSTOM_VISUAL_STAGE_RECT,
  CUSTOM_VISUAL_FULLSCREEN_RECT,
  isFullScreenCustomVisualBeat,
  shouldPinSoloActorLeftForCustomVisual,
} from "../src/components/v7/UniversalAutoStage";
import { EPISODE_VISUAL_REGISTRY } from "../src/components/v7/episodeVisuals";
import { CharacterStoryOverlays } from "../src/remotion/components/cards/StoryInfographicCards";
import { V7MovieComposition } from "../src/remotion/compositions/V7MovieComposition";
import type { ScriptBeat } from "../src/animscript/actionLibrary";
import type { Point2D, StickmanState } from "../src/remotion/types/character";

function renderStageSvg(props: React.ComponentProps<typeof UniversalAutoStage>): string {
  return renderToStaticMarkup(
    React.createElement("svg", { width: 1920, height: 1080 }, React.createElement(UniversalAutoStage, props))
  );
}

function renderV7MovieAtFrame(beats: ScriptBeat[], frame: number): string {
  const totalDurationFrames = Math.max(
    60,
    beats.reduce((acc, b) => Math.max(acc, b.startFrame + b.durationFrames), 0)
  );
  const comp: any = {
    id: "V7MovieComposition",
    width: 1920,
    height: 1080,
    fps: 60,
    durationInFrames: totalDurationFrames,
    component: React.lazy(() => Promise.resolve({ default: V7MovieComposition })),
    nonce: 1,
    folderName: null,
    parentFolderName: null,
    schema: null,
    calculateMetadata: null,
    defaultProps: {},
    props: {},
    defaultCodec: "h264",
    defaultOutName: "out",
  };
  return renderToStaticMarkup(
    React.createElement(
      Internals.BufferingProvider,
      null,
      React.createElement(
        Internals.CanUseRemotionHooksProvider,
        null,
        React.createElement(
          Internals.CompositionManager.Provider as any,
          {
            value: {
              compositions: [comp],
              folders: [],
              currentCompositionMetadata: null,
              canvasContent: { type: "composition", compositionId: "V7MovieComposition" },
              setClipped: () => {},
              registerComposition: () => {},
              unregisterComposition: () => {},
              registerFolder: () => {},
              unregisterFolder: () => {},
              registerSequence: () => {},
              unregisterSequence: () => {},
              setCanvasContent: () => {},
              setCurrentCompositionMetadata: () => {},
              registerStill: () => {},
              unregisterStill: () => {},
              stills: [],
            },
          },
          React.createElement(
            Internals.Timeline.TimelineContext.Provider as any,
            {
              value: {
                frame: { V7MovieComposition: frame },
                playing: false,
                imperativePlaying: { current: false },
                rootId: "V7MovieComposition",
                playbackRate: 1,
                setPlaybackRate: () => {},
                audioAndVideoTags: { current: [] },
              },
            },
            React.createElement(V7MovieComposition, { beats })
          )
        )
      )
    )
  );
}

function makeBaseBeat(overrides: Partial<AutoEpisodeBeat> = {}): AutoEpisodeBeat {
  return {
    id: "v20_test_beat",
    text: "Đây là phụ đề kiểm thử V20.",
    ttsText: "Đây là phụ đề kiểm thử V20.",
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

// =============================================================================
// 1. SCHEMA: fullScreenVisual & chapterBanner (100% tương thích ngược V19)
// =============================================================================

test("V20 #1A: episodeJsonSchema preserves fullScreenVisual and syncs chapterBanner <-> headerTitle", () => {
  const raw = {
    title: "Tập Kiểm Thử V20",
    slug: "tap_kiem_thu_v20",
    beats: [
      {
        id: "b01",
        chapterBanner: "HỒI 1: KHỞI ĐẦU V20",
        text: "Cảnh tràn màn hình.",
        ttsText: "Cảnh tràn màn hình.",
        stageType: "EXPLAINER_POLKA_DOT",
        customVisual: "MOSQUITO_CO2_RADAR",
        fullScreenVisual: true,
        actors: [],
      },
      {
        id: "b02",
        headerTitle: "HỒI 2: GIỮ NGUYÊN V19",
        text: "Cảnh chia đôi V19.",
        ttsText: "Cảnh chia đôi V19.",
        stageType: "EXPLAINER_POLKA_DOT",
        customVisual: "GUM_INGREDIENTS_SPLIT",
        fullScreenVisual: false,
        actors: [{ preset: "BOY", slot: "LEFT", facing: "RIGHT", motion: "IDLE_TALK", expression: "HAPPY" }],
      },
      {
        id: "b03",
        chapterBanner: "  HỒI 3: BANNER RIÊNG  ",
        headerTitle: "  TIÊU ĐỀ RIÊNG  ",
        text: "Cảnh có cả hai trường.",
        ttsText: "Cảnh có cả hai trường.",
        stageType: "COUNTRYSIDE_YARD",
        actors: [],
      },
      {
        id: "b04",
        text: "Cảnh V19 không khai báo fullScreenVisual hay chapterBanner.",
        ttsText: "Cảnh V19 không khai báo fullScreenVisual hay chapterBanner.",
        stageType: "CITY_STREET",
        actors: [],
      },
    ],
  };

  const sanitized = sanitizeAndValidateEpisode(raw);
  assert.equal(sanitized.beats.length, 4);

  // b01: fullScreenVisual=true preserved, chapterBanner synced into headerTitle
  assert.equal(sanitized.beats[0].fullScreenVisual, true);
  assert.equal(sanitized.beats[0].customVisual, "MOSQUITO_CO2_RADAR");
  assert.equal(sanitized.beats[0].chapterBanner, "HỒI 1: KHỞI ĐẦU V20");
  assert.equal(sanitized.beats[0].headerTitle, "HỒI 1: KHỞI ĐẦU V20");

  // b02: fullScreenVisual=false preserved, headerTitle synced into chapterBanner
  assert.equal(sanitized.beats[1].fullScreenVisual, false);
  assert.equal(sanitized.beats[1].headerTitle, "HỒI 2: GIỮ NGUYÊN V19");
  assert.equal(sanitized.beats[1].chapterBanner, "HỒI 2: GIỮ NGUYÊN V19");

  // b03: both explicit values preserved independently (trimmed)
  assert.equal(sanitized.beats[2].chapterBanner, "HỒI 3: BANNER RIÊNG");
  assert.equal(sanitized.beats[2].headerTitle, "TIÊU ĐỀ RIÊNG");
  assert.equal(sanitized.beats[2].fullScreenVisual, undefined);

  // b04: omitted fields stay undefined (backward compatible)
  assert.equal(sanitized.beats[3].fullScreenVisual, undefined);
  assert.equal(sanitized.beats[3].chapterBanner, undefined);
  assert.equal(sanitized.beats[3].headerTitle, undefined);

  // Real V19 episode with chapterBanner preserves all 5 chapter banners
  const muoiPath = path.resolve(__dirname, "..", "episodes", "tai_sao_muoi_chi_dot_mot_nguoi_v19.json");
  const muoiRaw = JSON.parse(fs.readFileSync(muoiPath, "utf8"));
  const muoiSanitized = sanitizeAndValidateEpisode(muoiRaw);
  const banners = muoiSanitized.beats.filter((b) => Boolean(b.chapterBanner)).map((b) => b.chapterBanner);
  assert.equal(banners.length, 5);
  assert.equal(banners[0], "HỒI 1: BÍ ẨN NAM CHÂM HÚT MUỖI");
  assert.equal(muoiSanitized.beats[0].headerTitle, "HỒI 1: BÍ ẨN NAM CHÂM HÚT MUỖI");
});

// =============================================================================
// 2. FULL-SCREEN 1920x1080 CUSTOM VISUAL + V19 BACKWARD COMPATIBILITY
// =============================================================================

test("V20 #1B: UniversalAutoStage fullScreenVisual=true renders 1920x1080 customVisual and hides backdrop, actors, callout", () => {
  const fullScreenBeat = makeBaseBeat({
    id: "fs_beat",
    chapterBanner: "HỒI 2: MÙI MỒ HÔI",
    stageType: "COUNTRYSIDE_YARD",
    weather: "RAIN",
    visualProp: "BRAIN_GLOW",
    customVisual: "MOSQUITO_CO2_RADAR",
    fullScreenVisual: true,
    callout: { text: "CALLOUT VÀNG PHẢI BỊ ẨN" },
    actors: [
      {
        preset: "BOY",
        slot: "LEFT",
        facing: "RIGHT",
        motion: "IDLE_TALK",
        expression: "HAPPY",
        bubble: "Bóng thoại cũng phải ẩn!",
        bubbleStartPct: 0.05,
        bubbleEndPct: 0.95,
      },
    ],
  });

  assert.equal(isFullScreenCustomVisualBeat(fullScreenBeat), true);
  assert.equal(shouldPinSoloActorLeftForCustomVisual(fullScreenBeat), false);

  const svg = renderStageSvg({
    spec: fullScreenBeat,
    frame: 120,
    localFrame: 120,
    durationFrames: 300,
    u: 0.4,
  });

  assert.ok(svg.includes('data-fullscreen-visual="true"'), "Marks fullscreen visual wrapper");
  assert.ok(
    svg.includes(
      `x="${CUSTOM_VISUAL_FULLSCREEN_RECT.left}" y="${CUSTOM_VISUAL_FULLSCREEN_RECT.top}" width="${CUSTOM_VISUAL_FULLSCREEN_RECT.width}" height="${CUSTOM_VISUAL_FULLSCREEN_RECT.height}"`
    ),
    "Renders foreignObject at x=0 y=0 width=1920 height=1080"
  );
  assert.ok(svg.includes("v20-fullscreen-visual-host"), "Includes full-screen SVG viewBox auto-scale CSS host");
  assert.ok(svg.includes("viewBox="), "Custom visual SVG rendered inside fullscreen host");

  // Default backdrop, actors, props, weather, bubbles, yellow callout MUST all be hidden
  assert.equal(svg.includes('id="stickman-rig-wrapper"'), false, "Actors must be hidden in fullscreen mode");
  assert.equal(svg.includes('id="curated-prop-layer"'), false, "Visual props must be hidden in fullscreen mode");
  assert.equal(svg.includes('id="universal-weather-overlay"'), false, "Weather overlay must be hidden in fullscreen mode");
  assert.equal(svg.includes('id="layer-speech-bubbles-top"'), false, "Speech bubbles must be hidden in fullscreen mode");
  assert.equal(svg.includes("CALLOUT VÀNG PHẢI BỊ ẨN"), false, "Yellow callout must be hidden in fullscreen mode");
  assert.equal(svg.includes("Bóng thoại cũng phải ẩn!"), false, "Actor bubble text must be hidden");

  // chapterBanner rendered cleanly in top overlay layer (CharacterStoryOverlays z-index:45)
  const overlaySvg = renderToStaticMarkup(
    React.createElement(CharacterStoryOverlays, {
      u: 0.4,
      localFrame: 120,
      durationFrames: 300,
      characterX: 960,
      characterHeadY: 500,
      characterFacing: "right",
      floatingHeader: fullScreenBeat.chapterBanner,
    })
  );
  assert.ok(overlaySvg.includes("HỒI 2: MÙI MỒ HÔI"), "chapterBanner renders on top overlay layer");
  assert.ok(overlaySvg.includes("z-index:45"), "Top overlay stays above stage");
});

test("V20 #1C: fullScreenVisual=false/undefined keeps 100% V19 layout (actor x≈420, visual 680,150,1120x680) & invalid customVisual falls back safely", () => {
  for (const fsFlag of [false, undefined] as const) {
    const v19Beat = makeBaseBeat({
      id: `v19_compat_${String(fsFlag)}`,
      stageType: "EXPLAINER_POLKA_DOT",
      customVisual: "GUM_INGREDIENTS_SPLIT",
      fullScreenVisual: fsFlag,
      actors: [
        {
          preset: "BOY",
          slot: "CENTER",
          facing: "LEFT",
          motion: "IDLE_TALK",
          expression: "CURIOUS",
        },
      ],
    });

    assert.equal(isFullScreenCustomVisualBeat(v19Beat), false);
    assert.equal(shouldPinSoloActorLeftForCustomVisual(v19Beat), true);

    const svg = renderStageSvg({
      spec: v19Beat,
      frame: 120,
      localFrame: 120,
      durationFrames: 300,
      u: 0.4,
    });

    assert.equal(svg.includes('data-fullscreen-visual="true"'), false);
    assert.ok(
      svg.includes(
        `x="${CUSTOM_VISUAL_STAGE_RECT.left}" y="${CUSTOM_VISUAL_STAGE_RECT.top}" width="${CUSTOM_VISUAL_STAGE_RECT.width}" height="${CUSTOM_VISUAL_STAGE_RECT.height}"`
      ),
      `V19 customVisual rect preserved when fullScreenVisual=${String(fsFlag)}`
    );
    const txMatch = svg.match(/id="stickman-rig-wrapper" transform="translate\(([^,]+), 840\)/);
    assert.ok(txMatch, "Solo actor still rendered in V19 mode");
    assert.equal(Number(txMatch[1]), 420, "Solo actor stays pinned on left at x=420");
  }

  // Edge case: fullScreenVisual=true with non-existent customVisual -> safely falls back to normal stage
  const unknownVisualBeat = makeBaseBeat({
    id: "unknown_fs",
    stageType: "CITY_STREET",
    customVisual: "DOES_NOT_EXIST_VISUAL",
    fullScreenVisual: true,
    actors: [{ preset: "BOY", slot: "LEFT", facing: "RIGHT", motion: "IDLE_TALK", expression: "HAPPY" }],
  });
  assert.equal(isFullScreenCustomVisualBeat(unknownVisualBeat), false);
  const fallbackSvg = renderStageSvg({
    spec: unknownVisualBeat,
    frame: 60,
    localFrame: 60,
    durationFrames: 300,
    u: 0.2,
  });
  assert.equal(fallbackSvg.includes('data-fullscreen-visual="true"'), false);
  assert.ok(fallbackSvg.includes('id="stage-city-street"'), "Normal backdrop renders on unknown customVisual");
  assert.ok(fallbackSvg.includes('id="stickman-rig-wrapper"'), "Actors still render on unknown customVisual");
});

test("V20 #1D: V7MovieComposition end-to-end renders fullScreenVisual with ONLY top chapterBanner + bottom subtitle (0 leaked legacy props/callouts)", () => {
  const fullScreenSpec = makeBaseBeat({
    id: "e2e_fs_beat",
    chapterBanner: "HỒI 3: CẢM BIẾN CO2 TOÀN MÀN HÌNH",
    text: "Phụ đề V20 phải luôn nổi bật ở tầng trên cùng.",
    ttsText: "Phụ đề V20 phải luôn nổi bật ở tầng trên cùng.",
    stageType: "COUNTRYSIDE_YARD",
    customVisual: "MOSQUITO_CO2_RADAR",
    fullScreenVisual: true,
    callout: { text: "CALLOUT VÀNG PHẢI ẨN" },
    actors: [{ preset: "BOY", slot: "LEFT", facing: "RIGHT", motion: "IDLE_TALK", expression: "HAPPY" }],
  });

  // Intentionally omit outer theme & narrationText to verify zero STUDY_ROOM prop leakage & autoStageSpec.text subtitle fallback
  const scriptBeat: ScriptBeat = {
    id: "e2e_fs_beat",
    startFrame: 0,
    durationFrames: 300,
    calloutText: "LEGACY CALLOUT PHẢI ẨN",
    sfxText: "BÙM!",
    thoughtText: "SUY NGHĨ PHẢI ẨN",
    autoStageSpec: fullScreenSpec,
  };

  const html = renderV7MovieAtFrame([scriptBeat], 60);
  assert.ok(html.includes('data-fullscreen-visual="true"'), "Full-screen customVisual rendered inside V7MovieComposition");
  assert.ok(html.includes("HỒI 3: CẢM BIẾN CO2 TOÀN MÀN HÌNH"), "chapterBanner rendered on top overlay layer");
  assert.ok(html.includes("z-index:45"), "chapterBanner overlay stays at zIndex 45");
  assert.ok(html.includes("Phụ đề V20 phải luôn nổi bật ở tầng trên cùng."), "Bottom subtitle falls back to autoStageSpec.text");
  assert.ok(html.includes("z-index:60"), "Bottom subtitle stays at topmost zIndex 60");

  // ZERO leaked legacy props, actors, backdrops, callouts, sfx, or thoughts
  assert.equal(html.includes('id="props-study-room"'), false, "Legacy STUDY_ROOM props must NOT leak into autoStage beats");
  assert.equal(html.includes('id="props-sunset-park"'), false, "Legacy SUNSET_PARK props must NOT leak");
  assert.equal(html.includes('id="props-dark-studio"'), false, "Legacy DARK_STUDIO props must NOT leak");
  assert.equal(html.includes('id="stickman-rig-wrapper"'), false, "Actors hidden on fullScreenVisual beat");
  assert.equal(html.includes("CALLOUT VÀNG PHẢI ẨN"), false, "AutoStage yellow callout hidden");
  assert.equal(html.includes("LEGACY CALLOUT PHẢI ẨN"), false, "Legacy overlay callout hidden");
  assert.equal(html.includes("BÙM!"), false, "Legacy SFX overlay hidden");
  assert.equal(html.includes("SUY NGHĨ PHẢI ẨN"), false, "Legacy thought overlay hidden");
});

// =============================================================================
// 3. POSE SIP_DRINK: Hand raised to chin/mouth + Straw tip touches (o) mouth
// =============================================================================

test("V20 #2: SIP_DRINK lifts hand high above shoulder to chin/mouth and straw tip directly touches circular (o) mouth across scales & facings", () => {
  const shoulder: Point2D = { x: 0, y: -TORSO_LEN };

  // Non-finite / negative guards on computeSipDrinkWave
  assert.equal(computeSipDrinkWave(NaN), 1);
  assert.equal(computeSipDrinkWave(Infinity), 1);
  assert.equal(computeSipDrinkWave(-10), 0);
  assert.equal(computeSipDrinkWave(14), 1);

  // Verify rigid bone lengths & high chin/mouth hand placement across sipping frames
  for (let f = 0; f <= 200; f += 5) {
    const raw = computeV18ActionArmsUpper("SIP_DRINK", false, shoulder, f, f, f / 200);
    assert.ok(raw, `SIP_DRINK returns arms at f=${f}`);
    const state: StickmanState = {
      x: 780,
      y: 840,
      scale: 1,
      facing: "right",
      pose: "standing",
      v18ActionPose: "SIP_DRINK",
      v18LocalFrame: f,
      v18SegmentProgress: f / 200,
      eyes: "happy",
      eyebrows: "neutral",
      mouth: "sip",
    };
    const resolved = computeStickmanArmsUpper(state, shoulder, -173, 0, 1, 1, 780, 840, f);
    const d1 = Math.hypot(resolved.rightElbowUpper.x - shoulder.x, resolved.rightElbowUpper.y - shoulder.y);
    const d2 = Math.hypot(
      resolved.rightWristUpper.x - resolved.rightElbowUpper.x,
      resolved.rightWristUpper.y - resolved.rightElbowUpper.y
    );
    assert.ok(Math.abs(d1 - ARM_L1) < 0.05, `ARM_L1 preserved at f=${f}: ${d1}`);
    assert.ok(Math.abs(d2 - ARM_L2) < 0.05, `ARM_L2 preserved at f=${f}: ${d2}`);

    if (f >= 14) {
      // Hand MUST be raised well above shoulder (shoulder.y = -115) up to chin/mouth height (~ -147)
      assert.ok(
        resolved.rightWristUpper.y <= shoulder.y - 28,
        `At f=${f}, hand holding cup must be raised well above shoulder (<= ${shoulder.y - 28}), got ${resolved.rightWristUpper.y.toFixed(1)}`
      );
    }
  }

  // Verify exact world-space straw-tip-to-mouth contact from REAL rendered UniversalAutoStage SVG
  // across BOTH adult (NEIGHBOR, scale=1.0) & child (BOY, scale=0.76) AND BOTH RIGHT & LEFT facings!
  const cases: Array<{ preset: "NEIGHBOR" | "BOY"; facing: "RIGHT" | "LEFT"; expectedScale: number }> = [
    { preset: "NEIGHBOR", facing: "RIGHT", expectedScale: 1.0 },
    { preset: "NEIGHBOR", facing: "LEFT", expectedScale: 1.0 },
    { preset: "BOY", facing: "RIGHT", expectedScale: 0.76 },
    { preset: "BOY", facing: "LEFT", expectedScale: 0.76 },
  ];

  for (const tc of cases) {
    const beat = makeBaseBeat({
      id: `sip_${tc.preset}_${tc.facing}`,
      camera: { fromScale: 1, toScale: 1, focusX: 960, focusY: 540 },
      actors: [
        {
          preset: tc.preset,
          slot: "CENTER",
          facing: tc.facing,
          motion: "IDLE_TALK",
          expression: "HAPPY",
          timeline: [
            {
              fromPct: 0,
              toPct: 1,
              startX: 780,
              endX: 780,
              facing: tc.facing,
              pose: "SIP_DRINK",
              expression: "HAPPY",
              handProp: "NONE",
            },
          ],
        },
      ],
    });

    for (const f of [14, 25, 40, 60, 100, 150]) {
      const svg = renderStageSvg({
        spec: beat,
        frame: f,
        localFrame: f,
        durationFrames: 300,
        u: f / 300,
      });

      // Extract StickmanRig wrapper transform
      const rigMatch = svg.match(
        /id="stickman-rig-wrapper" transform="translate\(([^,]+), ([^)]+)\) scale\(([^,]+), ([^)]+)\)"/
      );
      assert.ok(rigMatch, `Rig transform found for ${tc.preset} ${tc.facing} f=${f}`);
      const rigX = Number(rigMatch[1]);
      const rigY = Number(rigMatch[2]);
      const rigSx = Number(rigMatch[3]);
      const rigSy = Number(rigMatch[4]);

      // Extract upper-body transform
      const upperMatch = svg.match(
        /id="layer-character-upper-body" transform="translate\(0, ([^)]+)\) rotate\(([^)]+)\)"/
      );
      assert.ok(upperMatch);
      const hipY = Number(upperMatch[1]);
      const torsoDeg = Number(upperMatch[2]);

      // Extract head cluster transform
      const headMatch = svg.match(
        /id="neck-head-cluster" transform="translate\(0, ([^)]+)\) rotate\(([^)]+)\)"/
      );
      assert.ok(headMatch);
      const headCenterY = Number(headMatch[1]);
      const headDeg = Number(headMatch[2]);

      // Extract rendered right wrist from layer-character-arms to verify 0px breathing detachment
      const armsBlockMatch = svg.match(/id="layer-character-arms">([\s\S]*?)<\/g>/);
      assert.ok(armsBlockMatch);
      const armPaths = [...armsBlockMatch[1].matchAll(/d="M 0 -115 L ([^ ]+) ([^ ]+) L ([^ ]+) ([^"]+)"/g)];
      assert.equal(armPaths.length, 2);
      const wristUpperX = Number(armPaths[1][3]);
      const wristUpperY = Number(armPaths[1][4]);

      // Verify mouth is the small circular "sip" (o) mouth
      const mouthMatch = svg.match(/<circle cx="0" cy="([^"]+)" r="([^"]+)" fill="#9F1239"/);
      assert.ok(mouthMatch, `Circular sip mouth (o) must be rendered for ${tc.preset} ${tc.facing} f=${f}`);
      const mouthLocalY = Number(mouthMatch[1]);
      const mouthRadius = Number(mouthMatch[2]);
      assert.ok(mouthRadius > 3.5 && mouthRadius < 5.0, `Sip mouth radius ~4.24, got ${mouthRadius}`);

      // Project head center, right wrist, and mouth center to world SVG coordinates
      const tRad = (torsoDeg * Math.PI) / 180;
      const toWorld = (ux: number, uy: number) => {
        const rx = ux * Math.cos(tRad) - uy * Math.sin(tRad);
        const ry = hipY + ux * Math.sin(tRad) + uy * Math.cos(tRad);
        return { x: rigX + rx * rigSx, y: rigY + ry * rigSy };
      };
      const headWorld = toWorld(0, headCenterY);
      const wristWorld = toWorld(wristUpperX, wristUpperY);

      const hRad = (headDeg * Math.PI) / 180;
      const mouthUpperX = -mouthLocalY * Math.sin(hRad);
      const mouthUpperY = headCenterY + mouthLocalY * Math.cos(hRad);
      const mouthWorld = toWorld(mouthUpperX, mouthUpperY);

      // Extract HandPropGraphic CUP_SODA transform & straw path (bend + tip)
      const propMatch = svg.match(
        /<g transform="translate\(([^,]+), ([^)]+)\) scale\(([^,]+), ([^)]+)\) rotate\(([^)]+)\)"><g transform="translate\(([^,]+), ([^)]+)\)"><path d="M [^ ]+ L ([^,]+),([^ ]+) L ([^,]+),([^"]+)" fill="none" stroke="#EF4444"/
      );
      assert.ok(propMatch, `CUP_SODA HandPropGraphic with red straw found for ${tc.preset} ${tc.facing} f=${f}`);
      const propX = Number(propMatch[1]);
      const propY = Number(propMatch[2]);
      const propSx = Number(propMatch[3]);
      const propSy = Number(propMatch[4]);
      const propRotDeg = Number(propMatch[5]);
      const cupDx = Number(propMatch[6]);
      const cupDy = Number(propMatch[7]);
      const strawBendX = Number(propMatch[8]);
      const strawBendY = Number(propMatch[9]);
      const strawEndX = Number(propMatch[10]);
      const strawEndY = Number(propMatch[11]);

      // 1. HandPropGraphic anchor stays locked to rendered wrist even during idle breathing (< 0.5px!)
      const wristPropDrift = Math.hypot(propX - wristWorld.x, propY - wristWorld.y);
      assert.ok(
        wristPropDrift < 0.5,
        `Cup anchor must stay locked to rendered wrist during breathing for ${tc.preset} ${tc.facing} f=${f}: drift=${wristPropDrift.toFixed(2)}px`
      );

      // Helper to project cup-local points to world SVG coordinates
      const pRad = (propRotDeg * Math.PI) / 180;
      const cupToWorld = (lx: number, ly: number) => {
        const localX = cupDx + lx;
        const localY = cupDy + ly;
        const rotX = localX * Math.cos(pRad) - localY * Math.sin(pRad);
        const rotY = localX * Math.sin(pRad) + localY * Math.cos(pRad);
        return { x: propX + rotX * propSx, y: propY + rotY * propSy };
      };

      // 2. Cup lid, cup left edge, and straw bend MUST stay cleanly OUTSIDE head circle (r=54 + stroke -> >= 56*scale)
      const headClearancePoints: Array<[string, number, number]> = [
        ["lidTopLeft", -17, -26],
        ["lidBotLeft", -17, -18],
        ["cupTopLeft", -15, -22],
        ["cupBotLeft", -11, 18],
        ["strawBend", strawBendX, strawBendY],
      ];
      const minAllowedHeadDist = 56.0 * tc.expectedScale;
      for (const [label, lx, ly] of headClearancePoints) {
        const wp = cupToWorld(lx, ly);
        const distFromHead = Math.hypot(wp.x - headWorld.x, wp.y - headWorld.y);
        assert.ok(
          distFromHead >= minAllowedHeadDist,
          `Cup ${label} must NOT clip inside face circle for ${tc.preset} ${tc.facing} f=${f}: dist=${distFromHead.toFixed(1)}px < ${minAllowedHeadDist.toFixed(1)}px`
        );
      }

      // 3. Straw tip MUST land directly inside circular (o) mouth!
      const strawWorld = cupToWorld(strawEndX, strawEndY);
      const worldDist = Math.hypot(strawWorld.x - mouthWorld.x, strawWorld.y - mouthWorld.y);
      const allowedDist = mouthRadius * tc.expectedScale; // Directly inside the circular (o) mouth!
      assert.ok(
        worldDist <= allowedDist,
        `Straw tip must touch inside circular (o) mouth for ${tc.preset} ${tc.facing} f=${f}: dist=${worldDist.toFixed(2)}px > ${allowedDist.toFixed(2)}px (straw=(${strawWorld.x.toFixed(1)},${strawWorld.y.toFixed(1)}), mouth=(${mouthWorld.x.toFixed(1)},${mouthWorld.y.toFixed(1)}))`
      );
    }
  }
});

// =============================================================================
// 4. AUTOMATED EPISODE VALIDATOR: web-studio/scripts/validate_episode.mjs
// =============================================================================

test("V20 #3A: validate_episode.mjs checks all 5 rules accurately including boundary values", async () => {
  const validatorMod = await import("../scripts/validate_episode.mjs");
  const registered = validatorMod.loadRegisteredCustomVisuals();

  // Verify registry parser matches actual TypeScript EPISODE_VISUAL_REGISTRY 100%
  const expectedKeys = Object.keys(EPISODE_VISUAL_REGISTRY);
  assert.equal(registered.size, expectedKeys.length, "Parsed registry count matches EPISODE_VISUAL_REGISTRY");
  for (const key of expectedKeys) {
    assert.ok(registered.has(key), `Registry key ${key} parsed accurately`);
  }

  // Synthetic episode hitting EVERY single rule + boundary checks
  const testEp = {
    title: "Kiểm thử toàn diện 5 luật",
    beats: [
      // Beat 1: Clean beat (boundary WALK dist=10 -> PASS, 2 actors dist=200 -> NO WARNING)
      {
        id: "b_clean",
        text: "Bình thường hoàn toàn.",
        ttsText: "Bình thường hoàn toàn.",
        stageType: "EXPLAINER_POLKA_DOT",
        customVisual: "MOSQUITO_CO2_RADAR",
        actors: [
          {
            preset: "BOY",
            timeline: [{ fromPct: 0, toPct: 1, startX: 400, endX: 410, pose: "WALK", facing: "RIGHT", expression: "HAPPY" }],
          },
          {
            preset: "GRANDPA",
            timeline: [{ fromPct: 0, toPct: 1, startX: 610, endX: 610, pose: "NOD_SMILE", facing: "LEFT", expression: "HAPPY" }],
          },
        ],
      },
      // Beat 2: Moonwalk WALK (dist=9) & RUN (dist=0) & endX=null
      {
        id: "b_moonwalk",
        text: "Đi bộ tại chỗ.",
        ttsText: "Đi bộ tại chỗ.",
        stageType: "CITY_STREET",
        actors: [
          {
            preset: "BOY",
            timeline: [
              { fromPct: 0, toPct: 0.5, startX: 500, endX: 509, pose: "WALK" },
              { fromPct: 0.5, toPct: 1.0, startX: 509, endX: null, pose: "RUN" },
            ],
          },
        ],
      },
      // Beat 3: EXPLAINER_POLKA_DOT missing customVisual and visualProp="NONE"
      {
        id: "b_empty_explainer",
        text: "Giải thích trống trơn.",
        ttsText: "Giải thích trống trơn.",
        stageType: "EXPLAINER_POLKA_DOT",
        visualProp: "NONE",
        actors: [],
      },
      // Beat 4: Unknown customVisual
      {
        id: "b_bad_visual",
        text: "Tên visual sai.",
        ttsText: "Tên visual sai.",
        stageType: "EXPLAINER_POLKA_DOT",
        customVisual: "NOT_IN_REGISTRY_999",
        actors: [],
      },
      // Beat 5: ttsText contains lowercase 'z'
      {
        id: "b_lower_z",
        text: "En-dim tiêu hóa.",
        ttsText: "Enzyme tiêu hóa.",
        stageType: "SCIENCE_LAB_ROOM",
        actors: [],
      },
      // Beat 6: ttsText contains uppercase 'Z'
      {
        id: "b_upper_z",
        text: "Phóng to.",
        ttsText: "ZOOM cực đại.",
        stageType: "SCIENCE_LAB_ROOM",
        actors: [],
      },
      // Beat 7: 2 actors ending 199px apart -> WARNING (ACTORS_TOO_CLOSE)
      {
        id: "b_close_actors",
        text: "Hai nhân vật đứng sát.",
        ttsText: "Hai nhân vật đứng sát.",
        stageType: "COUNTRYSIDE_YARD",
        actors: [
          { preset: "BOY", timeline: [{ fromPct: 0, toPct: 1, startX: 500, endX: 600, pose: "TALK_GESTURE" }] },
          { preset: "DOCTOR", timeline: [{ fromPct: 0, toPct: 1, startX: 900, endX: 799, pose: "NOD_SMILE" }] },
        ],
      },
    ],
  };

  const res = validatorMod.validateEpisodeData(testEp, registered);
  assert.equal(res.totalBeats, 7);

  const errCodes = res.errors.map((e: { code: string; beatId: string }) => `${e.beatId}:${e.code}`);
  assert.deepEqual(errCodes, [
    "b_moonwalk:MOONWALK",
    "b_moonwalk:MOONWALK",
    "b_empty_explainer:EMPTY_EXPLAINER",
    "b_bad_visual:UNKNOWN_CUSTOM_VISUAL",
    "b_lower_z:TTS_CONTAINS_Z",
    "b_upper_z:TTS_CONTAINS_Z",
  ]);

  const warnCodes = res.warnings.map((w: { code: string; beatId: string }) => `${w.beatId}:${w.code}`);
  assert.deepEqual(warnCodes, ["b_close_actors:ACTORS_TOO_CLOSE"]);
});

test("V20 #3B: validate_episode.mjs CLI exit codes (0 on clean/warnings-only, 1 on serious errors or bad input)", () => {
  const studioRoot = path.resolve(__dirname, "..");
  const scriptPath = path.join(studioRoot, "scripts", "validate_episode.mjs");
  const runValidator = (args: string[]) =>
    spawnSync(process.execPath, [scriptPath, ...args], {
      cwd: studioRoot,
      encoding: "utf8",
    });

  // 1. Clean V19 episode -> exit 0
  const cleanRes = runValidator(["episodes/tai_sao_muoi_chi_dot_mot_nguoi_v19.json"]);
  assert.equal(cleanRes.status, 0, `Expected exit 0 on clean episode, stderr=${cleanRes.stderr}`);
  assert.ok(cleanRes.stdout.includes("PASS"));

  // 2. Episode with warnings only (<200px) -> exit 0
  const warnOnlyRes = runValidator(["episodes/phong_yen_tinh_nhat_the_gioi_v18.json"]);
  assert.equal(warnOnlyRes.status, 0, "Warnings alone must exit 0");
  assert.ok(warnOnlyRes.stdout.includes("ACTORS_TOO_CLOSE"));

  // 3. Episode with MOONWALK errors -> exit 1
  const moonwalkRes = runValidator(["episodes/nuot_keo_cao_su_v18.json"]);
  assert.equal(moonwalkRes.status, 1, "MOONWALK errors must exit 1");
  assert.ok(moonwalkRes.stdout.includes("MOONWALK"));

  // 4. Episode with 'z' in ttsText -> exit 1
  const zRes = runValidator(["episodes/khong_ngu_7_ngay_v16.json"]);
  assert.equal(zRes.status, 1, "TTS_CONTAINS_Z errors must exit 1");
  assert.ok(zRes.stdout.includes("TTS_CONTAINS_Z"));

  // 5. Temp episode with invalid JSON -> exit 1
  const tmpBad = path.join(os.tmpdir(), `v20_bad_json_${Date.now()}.json`);
  fs.writeFileSync(tmpBad, "{ invalid json", "utf8");
  try {
    const badJsonRes = runValidator([tmpBad]);
    assert.equal(badJsonRes.status, 1);
  } finally {
    fs.unlinkSync(tmpBad);
  }

  // 6. Missing file & missing argument -> exit 1
  assert.equal(runValidator(["episodes/file_khong_ton_tai.json"]).status, 1);
  assert.equal(runValidator([]).status, 1);
});

test("V20 #2B: SIP_DRINK blends smoothly to/from NOD_SMILE & TALK_GESTURE and suppresses listener nod", () => {
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
    ["SIP_DRINK", "NOD_SMILE"],
    ["TALK_GESTURE", "SIP_DRINK"],
  ] as const) {
    const beat = makeBaseBeat({
      stageType: "COUNTRYSIDE_YARD",
      actors: [
        {
          preset: "NEIGHBOR",
          slot: "CENTER",
          facing: "LEFT",
          motion: "IDLE_TALK",
          expression: "HAPPY",
          timeline: [
            { fromPct: 0, toPct: 0.5, startX: 780, endX: 780, facing: "LEFT", pose: p1, expression: "HAPPY" },
            { fromPct: 0.5, toPct: 1.0, startX: 780, endX: 780, facing: "LEFT", pose: p2, expression: "HAPPY" },
          ],
        },
      ],
    });

    let prevElbow: Point2D | null = null;
    let maxElbowJump = 0;
    for (let lf = 149; lf <= 161; lf++) {
      const svg = renderStageSvg({ spec: beat, frame: lf, localFrame: lf, durationFrames: 300, u: lf / 300 });
      const arms = extractArmPaths(svg);
      assert.equal(arms.length, 2);
      const right = arms[1];
      const d1 = Math.hypot(right.elbow.x - shoulder.x, right.elbow.y - shoulder.y);
      const d2 = Math.hypot(right.wrist.x - right.elbow.x, right.wrist.y - right.elbow.y);
      assert.ok(Math.abs(d1 - ARM_L1) < 0.1, `${p1}->${p2} f=${lf} ARM_L1 preserved: ${d1}`);
      assert.ok(Math.abs(d2 - ARM_L2) < 0.1, `${p1}->${p2} f=${lf} ARM_L2 preserved: ${d2}`);
      if (prevElbow) {
        maxElbowJump = Math.max(maxElbowJump, Math.hypot(right.elbow.x - prevElbow.x, right.elbow.y - prevElbow.y));
      }
      prevElbow = right.elbow;
    }
    assert.ok(maxElbowJump < 25, `${p1}->${p2} must blend smoothly without teleport, got ${maxElbowJump.toFixed(1)}px`);
  }

  // Sipping actor next to a speaking partner must NOT add listenerNod or idle nod
  const duoBeat = makeBaseBeat({
    actors: [
      {
        preset: "BOY",
        slot: "LEFT",
        facing: "RIGHT",
        motion: "IDLE_TALK",
        expression: "ANGRY",
        bubble: "Muỗi đốt quá!",
        bubbleStartPct: 0.02,
        bubbleEndPct: 0.98,
        timeline: [{ fromPct: 0, toPct: 1, startX: 420, endX: 420, facing: "RIGHT", pose: "TALK_GESTURE", expression: "ANGRY" }],
      },
      {
        preset: "NEIGHBOR",
        slot: "CENTER",
        facing: "LEFT",
        motion: "IDLE_TALK",
        expression: "HAPPY",
        timeline: [{ fromPct: 0, toPct: 1, startX: 780, endX: 780, facing: "LEFT", pose: "SIP_DRINK", expression: "HAPPY" }],
      },
    ],
  });
  const duoSvg = renderStageSvg({ spec: duoBeat, frame: 14, localFrame: 14, durationFrames: 300, u: 14 / 300 });
  const headMatches = [...duoSvg.matchAll(/id="neck-head-cluster" transform="translate\(0, -185\) rotate\(([^)]+)\)"/g)];
  assert.equal(headMatches.length, 2);
  assert.equal(Number(headMatches[1][1]), 4, "Sipping actor head tilt stays locked at 4 deg (no listenerNod/idle nod)");
});

test("V20 #3C: validate_episode.mjs handles complex registry syntax, comments before declaration, aliases, default slots & non-numeric edge cases", async () => {
  const validatorMod = await import("../scripts/validate_episode.mjs");
  const tmpRegistry = path.join(os.tmpdir(), `v20_test_registry_${Date.now()}.ts`);
  fs.writeFileSync(
    tmpRegistry,
    `
    /**
     * JSDoc mentioning EPISODE_VISUAL_REGISTRY before real declaration must NOT fool parser!
     */
    export type EpisodeVisualProps = {
      progress: number;
      frame: number;
      fps: number;
    };

    export const EPISODE_VISUAL_REGISTRY: Record<string, (props: EpisodeVisualProps) => unknown> = {
      // Line comment with FAKE_KEY: ignored,
      /* Block comment with OTHER_FAKE: ignored, */
      VISUAL_A: CompA,
      "VISUAL_B": makeVisual(opt1, opt2, { nested: 1 }),
      'VISUAL_C': CompC,
    };
    `,
    "utf8"
  );
  try {
    const keys = validatorMod.loadRegisteredCustomVisuals(tmpRegistry);
    assert.deepEqual([...keys].sort(), ["VISUAL_A", "VISUAL_B", "VISUAL_C"]);
  } finally {
    fs.unlinkSync(tmpRegistry);
  }

  const edgeEp = {
    title: "Edge cases",
    beats: [
      {
        id: "b_actor_level_walk",
        text: "Không có timeline.",
        ttsText: "Không có timeline.",
        stageType: "CITY_STREET",
        fullScreenVisual: true,
        actors: [
          { preset: "BOY", pose: "WALK", startX: 400, endX: 405 },
          { preset: "GRANDPA", slot: "RIGHT", endX: 1390 },
          { preset: "DOCTOR", endX: 550 },
        ],
      },
      // 2 actors without slot/endX -> defaults to LEFT (490) and RIGHT (1390) => NO false-positive ACTORS_TOO_CLOSE!
      {
        id: "b_default_slots_safe",
        text: "Hai nhân vật dùng slot mặc định.",
        ttsText: "Hai nhân vật dùng slot mặc định.",
        stageType: "COUNTRYSIDE_YARD",
        actors: [{ preset: "BOY" }, { preset: "DOCTOR" }],
      },
      // WALK_IN alias standing in place -> MOONWALK; whitespace/boolean endX must NOT coerce to 0!
      {
        id: "b_alias_and_whitespace",
        narrationText: "Phát âm có chữ Zero trong narrationText.",
        stageType: "CITY_STREET",
        actors: [
          {
            preset: "BOY",
            slot: "LEFT",
            timeline: [
              { fromPct: 0, toPct: 0.5, startX: 490, endX: "   ", pose: "WALK_IN" },
              // startX omitted on slot=LEFT (fallback 490) -> endX=900 (dist=410 >= 10) => NOT moonwalk!
              { fromPct: 0.5, toPct: 1.0, endX: 900, pose: "WALK" },
            ],
          },
          {
            preset: "NEIGHBOR",
            timeline: [{ fromPct: 0, toPct: 1, startX: 1300, endX: false, pose: "SPRINT" }],
          },
        ],
      },
    ],
  };
  const res = validatorMod.validateEpisodeData(edgeEp, new Set(["VISUAL_A"]));
  assert.deepEqual(
    res.errors.map((e: { beatId: string; code: string }) => `${e.beatId}:${e.code}`),
    [
      "b_actor_level_walk:MOONWALK",
      "b_alias_and_whitespace:MOONWALK",
      "b_alias_and_whitespace:MOONWALK",
      "b_alias_and_whitespace:TTS_CONTAINS_Z",
    ]
  );
  assert.deepEqual(
    res.warnings.map((w: { beatId: string; code: string }) => `${w.beatId}:${w.code}`),
    [
      "b_actor_level_walk:FULLSCREEN_WITHOUT_VISUAL",
      "b_actor_level_walk:ACTORS_TOO_CLOSE",
    ]
  );
});
