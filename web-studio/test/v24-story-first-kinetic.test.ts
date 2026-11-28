import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  sanitizeAndValidateEpisode,
  VALID_EXPLAINER_PALETTES,
  VALID_KINETIC_HEADLINE_POSITIONS,
  VALID_KINETIC_HEADLINE_TONES,
  type ExplainerPaletteId,
  type KineticHeadlinePosition,
  type KineticHeadlineTone,
} from "../src/lib/v7/episodeJsonSchema";
import {
  resolveAutoSfxPlan,
  resolveV24BgmSegments,
  VALID_AUTO_SFX_FILES,
  VALID_V24_BGM_FILES,
  V24_BGM_DEFAULT_VOLUME,
  V24_BGM_FADE_FRAMES,
} from "../src/lib/v7/autoSfxPlanner";
import { KineticHeadlineLayer } from "../src/components/KineticHeadlineLayer";
import { CleanExplainerStage } from "../src/components/CleanExplainerStage";
import {
  CuteCat,
  CuteDog,
  CuteBird,
  CuteAnt,
  CuteLizard,
  CuteOctopus,
  CuteShark,
  CuteDolphin,
  type AnimalAccessoryType,
  type AnimalAgeVariant,
} from "../src/components/AnimalSpriteKit";
import {
  UniversalAutoStage,
  shouldHideTopChapterBanner,
} from "../src/components/v7/UniversalAutoStage";

const FORBIDDEN_SVG_PATTERNS = [
  "<feGaussianBlur",
  "<feDropShadow",
  "<foreignObject",
  'filter="url(',
  "fonts.googleapis.com",
];

function assertZeroForbiddenSvg(markup: string, label: string) {
  for (const pat of FORBIDDEN_SVG_PATTERNS) {
    assert.ok(!markup.includes(pat), `${label} must not contain forbidden pattern: ${pat}`);
  }
}

test("V24 #1: All 9 SFX WAVs (< 80 KB) and 3 loopable BGM WAVs (< 400 KB) exist and are valid RIFF/WAVE", () => {
  const sfxDir = path.resolve(__dirname, "../public/sfx");
  const bgmDir = path.resolve(__dirname, "../public/bgm");

  assert.equal(VALID_AUTO_SFX_FILES.length, 9, "Must register all 9 Auto-SFX WAV files");
  for (const fn of VALID_AUTO_SFX_FILES) {
    const fp = path.join(sfxDir, fn);
    assert.ok(fs.existsSync(fp), `Missing SFX WAV: ${fn}`);
    const stat = fs.statSync(fp);
    assert.ok(stat.size > 44 && stat.size < 80 * 1024, `${fn} size (${stat.size}B) must be < 80KB`);
    const buf = fs.readFileSync(fp);
    assert.equal(buf.subarray(0, 4).toString("ascii"), "RIFF", `${fn} must start with RIFF`);
    assert.equal(buf.subarray(8, 12).toString("ascii"), "WAVE", `${fn} must contain WAVE`);
  }

  assert.equal(VALID_V24_BGM_FILES.length, 3, "Must register all 3 V24 BGM loop WAV files");
  for (const fn of VALID_V24_BGM_FILES) {
    const fp = path.join(bgmDir, fn);
    assert.ok(fs.existsSync(fp), `Missing BGM WAV: ${fn}`);
    const stat = fs.statSync(fp);
    assert.ok(stat.size > 1000 && stat.size < 400 * 1024, `${fn} size (${stat.size}B) must be < 400KB`);
    const buf = fs.readFileSync(fp);
    assert.equal(buf.subarray(0, 4).toString("ascii"), "RIFF", `${fn} must start with RIFF`);
    assert.equal(buf.subarray(8, 12).toString("ascii"), "WAVE", `${fn} must contain WAVE`);
  }
});

test("V24 #2: autoSfxPlanner resolves headline_pop, tick, heartbeat, sparkle, BGM segments, and keeps Ep 9 & Ep 10 100% identical", () => {
  const v24Ep = sanitizeAndValidateEpisode({
    title: "V24 Story-First Kinetic Test",
    slug: "v24_story_first_test",
    storyMode: "ANIMAL_POV",
    bgmEnabled: true,
    beats: [
      {
        id: "b1",
        text: "Đêm khuya lúc 22 giờ.",
        ttsText: "Đêm khuya lúc 22 giờ.",
        stageType: "CLEAN_EXPLAINER",
        explainerPalette: "LAVENDER_NIGHT",
        timeBadge: "22:00",
        bgmMood: "CURIOUS",
        actors: [],
      },
      {
        id: "b2",
        text: "Cùng mốc giờ 22 giờ nhưng có tiêu đề kinetic.",
        ttsText: "Cùng mốc giờ 22 giờ nhưng có tiêu đề kinetic.",
        stageType: "CLEAN_EXPLAINER",
        explainerPalette: "SKY_BLUE",
        timeBadge: "22:00",
        kineticHeadline: { text: "BÍ MẬT RUNG ĐỘNG", tone: "GOLD", delayFrames: 4 },
        bgmMood: "CURIOUS",
        actors: [],
      },
      {
        id: "b3",
        text: "Chuyển sang 3 giờ sáng căng thẳng.",
        ttsText: "Chuyển sang 3 giờ sáng căng thẳng.",
        stageType: "CLEAN_EXPLAINER",
        explainerPalette: "ALERT_CORAL",
        timeBadge: "03:00",
        kineticHeadline: { text: "NGUY HIỂM!", tone: "ALERT" },
        bgmMood: "TENSE",
        actors: [],
      },
      {
        id: "b4",
        text: "Khoảnh khắc tim đập thình thịch trong im lặng.",
        ttsText: "Khoảnh khắc tim đập thình thịch trong im lặng.",
        stageType: "CLEAN_EXPLAINER",
        sfxCue: "heartbeat",
        bgmMood: "SILENT",
        actors: [],
      },
      {
        id: "b5",
        text: "Vỡ òa ấm áp ở đoạn kết.",
        ttsText: "Vỡ òa ấm áp ở đoạn kết.",
        stageType: "CLEAN_EXPLAINER",
        explainerPalette: "WARM_CREAM",
        sfxCue: "sparkle",
        bgmMood: "EMOTIONAL",
        actors: [],
      },
    ],
  });

  const timeline = v24Ep.beats.map((b, idx) => ({
    id: b.id,
    startFrame: idx * 180,
    durationFrames: 180,
    stageType: b.stageType,
    autoStageSpec: b,
  }));

  const sfxEvents = resolveAutoSfxPlan(timeline, 45, true);
  assert.equal(sfxEvents.length, 5);
  assert.equal(sfxEvents[0].cueId, "tick");
  assert.equal(sfxEvents[0].fileName, "tick_clock.wav");
  assert.equal(sfxEvents[0].volume, 0.2);

  assert.equal(sfxEvents[1].cueId, "headline_pop");
  assert.equal(sfxEvents[1].fileName, "headline_pop.wav");
  assert.equal(sfxEvents[1].volume, 0.18);
  assert.equal(sfxEvents[1].startFrame, 180 + 2 + 4);

  // Beat 3 changed timeBadge ("22:00" -> "03:00"), so tick has priority over headline_pop
  assert.equal(sfxEvents[2].cueId, "tick");
  assert.equal(sfxEvents[2].fileName, "tick_clock.wav");

  assert.equal(sfxEvents[3].cueId, "heartbeat");
  assert.equal(sfxEvents[3].fileName, "heartbeat_soft.wav");

  assert.equal(sfxEvents[4].cueId, "sparkle");
  assert.equal(sfxEvents[4].fileName, "sparkle_warm.wav");

  // BGM segments: disabled -> []
  assert.equal(resolveV24BgmSegments(timeline, 45, false).length, 0);

  // BGM segments: enabled -> CURIOUS(0..360), TENSE(360..540), SILENT skipped(540..720), EMOTIONAL(720..900)
  const bgmSegs = resolveV24BgmSegments(timeline, 45, true);
  assert.equal(bgmSegs.length, 3);
  assert.equal(bgmSegs[0].mood, "CURIOUS");
  assert.equal(bgmSegs[0].fileName, "bgm_curious.wav");
  assert.equal(bgmSegs[0].startFrame, 0);
  assert.equal(bgmSegs[0].durationFrames, 360);
  assert.equal(bgmSegs[0].volume, V24_BGM_DEFAULT_VOLUME);
  assert.equal(bgmSegs[0].fadeFrames, V24_BGM_FADE_FRAMES);

  assert.equal(bgmSegs[1].mood, "TENSE");
  assert.equal(bgmSegs[1].fileName, "bgm_tense.wav");
  assert.equal(bgmSegs[1].startFrame, 360);
  assert.equal(bgmSegs[1].durationFrames, 180);

  assert.equal(bgmSegs[2].mood, "EMOTIONAL");
  assert.equal(bgmSegs[2].fileName, "bgm_emotional.wav");
  assert.equal(bgmSegs[2].startFrame, 720);
  assert.equal(bgmSegs[2].durationFrames, 180);

  // Zero-Regression on Episode 9 & Episode 10
  const v24OnlyCues = new Set(["headline_pop", "tick", "heartbeat", "sparkle"]);
  for (const epFile of [
    "tai_sao_meo_luon_tiep_dat_bang_4_chan_v23.json",
    "tai_sao_bach_tuoc_doi_mau_tang_hinh_v23.json",
  ]) {
    const raw = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../episodes", epFile), "utf8"));
    const ep = sanitizeAndValidateEpisode(raw);
    assert.equal(ep.storyMode, undefined, `${epFile} must keep default CLASSIC_HOST behavior`);
    assert.equal(ep.bgmEnabled, undefined, `${epFile} must keep bgmEnabled unset (false)`);

    const epTimeline = ep.beats.map((b, idx) => ({
      id: b.id,
      startFrame: idx * 200,
      durationFrames: 200,
      stageType: b.stageType,
      autoStageSpec: b,
    }));
    const epSfx = resolveAutoSfxPlan(epTimeline, 45, true);
    assert.ok(epSfx.length > 20, `${epFile} still emits full V23 Auto-SFX plan`);
    for (const ev of epSfx) {
      assert.ok(!v24OnlyCues.has(ev.cueId), `${epFile} must never unexpectedly trigger V24 cue ${ev.cueId}`);
      assert.ok(ev.volume >= 0.16 && ev.volume <= 0.26, `${epFile} SFX volume stays in 0.16-0.26`);
    }
    assert.equal(resolveV24BgmSegments(epTimeline, 45, ep.bgmEnabled ?? false).length, 0);
  }
});

test("V24 #3: Schema validates all V24 fields, suppresses HỒI X banner on ANIMAL_POV/HUMAN_ANIMAL_POV, and preserves Ep 8–10", () => {
  const animalEp = sanitizeAndValidateEpisode({
    title: "Kiến Tự Kể Chuyện",
    slug: "kien_tu_ke_chuyen",
    storyMode: "ANIMAL_POV",
    bgmEnabled: true,
    beats: [
      {
        id: "a1",
        chapterBanner: "HỒI 1: KHỞI ĐẦU",
        headerTitle: "HỒI 1: KHỞI ĐẦU",
        text: "Tôi là một chú kiến thợ nhỏ bé.",
        ttsText: "Tôi là một chú kiến thợ nhỏ bé.",
        stageType: "CLEAN_EXPLAINER",
        explainerPalette: "MINT_FRESH",
        timeBadge: "#1",
        kineticHeadline: {
          text: "SỨC MẠNH 50 LẦN",
          tone: "SUCCESS",
          subText: "Cơ bắp tý hon cực khỏe",
          position: "TOP_LEFT",
          delayFrames: 6,
          tiltDeg: -3,
        },
        bgmMood: "CURIOUS",
        visualCode: "ANT_SUPER_STRENGTH",
        actors: [],
      },
    ],
  });

  assert.equal(animalEp.storyMode, "ANIMAL_POV");
  assert.equal(animalEp.bgmEnabled, true);
  assert.equal(animalEp.beats[0].stageType, "CLEAN_EXPLAINER");
  assert.equal(animalEp.beats[0].explainerPalette, "MINT_FRESH");
  assert.equal(animalEp.beats[0].timeBadge, "#1");
  assert.equal(animalEp.beats[0].bgmMood, "CURIOUS");
  assert.equal(animalEp.beats[0].customVisual, "ANT_SUPER_STRENGTH");
  assert.equal(animalEp.beats[0].kineticHeadline?.text, "SỨC MẠNH 50 LẦN");
  assert.equal(animalEp.beats[0].kineticHeadline?.tone, "SUCCESS");
  assert.equal(animalEp.beats[0].kineticHeadline?.position, "TOP_LEFT");
  assert.equal(animalEp.beats[0].kineticHeadline?.delayFrames, 6);
  assert.equal(animalEp.beats[0].kineticHeadline?.tiltDeg, -3);
  // HỒI X banner automatically hidden for ANIMAL_POV
  assert.equal(animalEp.beats[0].chapterBanner, undefined);
  assert.equal(animalEp.beats[0].headerTitle, undefined);
  assert.equal(shouldHideTopChapterBanner(animalEp.beats[0], "ANIMAL_POV"), true);
  assert.equal(shouldHideTopChapterBanner(animalEp.beats[0], "HUMAN_ANIMAL_POV"), true);

  // Classic episode keeps chapterBanner intact
  const classicEp = sanitizeAndValidateEpisode({
    title: "Tập Cũ Classic",
    slug: "tap_cu_classic",
    beats: [
      {
        id: "c1",
        chapterBanner: "HỒI 1: BÍ ẨN",
        text: "Xin chào mọi người.",
        ttsText: "Xin chào mọi người.",
        stageType: "CITY_LIVING_ROOM",
        actors: [],
      },
    ],
  });
  assert.equal(classicEp.beats[0].chapterBanner, "HỒI 1: BÍ ẨN");
  assert.equal(shouldHideTopChapterBanner(classicEp.beats[0], "CLASSIC_HOST"), false);

  // Legacy episodes 8, 9, 10 still validate cleanly
  for (const fn of [
    "tai_sao_tieng_cao_bang_lam_noi_da_ga_v21.json",
    "tai_sao_meo_luon_tiep_dat_bang_4_chan_v23.json",
    "tai_sao_bach_tuoc_doi_mau_tang_hinh_v23.json",
  ]) {
    const ep = sanitizeAndValidateEpisode(
      JSON.parse(fs.readFileSync(path.resolve(__dirname, "../episodes", fn), "utf8"))
    );
    assert.ok(ep.beats.length >= 40, `${fn} validates cleanly with >= 40 beats`);
  }
});

test("V24 #4: KineticHeadlineLayer, CleanExplainerStage, and UniversalAutoStage render crisp 0-blur SVGs", () => {
  // 1. All 5 tones + 3 positions + auto font-size 52px when > 18 chars + timeBadge
  for (const tone of VALID_KINETIC_HEADLINE_TONES as readonly KineticHeadlineTone[]) {
    for (const position of VALID_KINETIC_HEADLINE_POSITIONS as readonly KineticHeadlinePosition[]) {
      const svg = renderToStaticMarkup(
        React.createElement(
          "svg",
          { viewBox: "0 0 1920 1080" },
          React.createElement(KineticHeadlineLayer, {
            headline: {
              text: "CHUỖI TIÊU ĐỀ DÀI HƠN 18 KÝ TỰ",
              tone,
              position,
              subText: "Phụ đề sắc nét 0-blur",
            },
            timeBadge: "-3 GIỜ",
            localFrame: 24,
            fps: 45,
          })
        )
      );
      assert.ok(svg.includes('id="layer-kinetic-headline"'), `Renders headline for ${tone}/${position}`);
      assert.ok(svg.includes('paint-order="stroke"'), "Uses paintOrder=stroke");
      assert.ok(svg.includes('stroke-width="14"'), "Uses 14px outline stroke");
      assert.ok(svg.includes('font-size="52"'), "Auto-shrinks long text (>18 chars) to 52px");
      assert.ok(svg.includes('id="layer-v24-time-badge"'), "Renders integrated timeBadge pill");
      assert.ok(svg.includes("-3 GIỜ"), "Displays timeBadge text");
      assertZeroForbiddenSvg(svg, `KineticHeadlineLayer(${tone}/${position})`);
    }
  }

  // 2. All 6 palettes of CleanExplainerStage
  for (const palette of VALID_EXPLAINER_PALETTES as readonly ExplainerPaletteId[]) {
    const svg = renderToStaticMarkup(
      React.createElement(
        "svg",
        { viewBox: "0 0 1920 1080" },
        React.createElement(CleanExplainerStage, { palette, frame: 30, uid: `test_${palette}` })
      )
    );
    assert.ok(svg.includes('id="stage-clean-explainer"'), `Renders CleanExplainerStage(${palette})`);
    assert.ok(svg.includes(`data-palette="${palette}"`), `Sets palette attribute ${palette}`);
    assert.ok(svg.includes('y="790"'), "Includes flat floor band at y=790");
    const circleCount = (svg.match(/<circle /g) || []).length;
    assert.equal(circleCount, 12, `CleanExplainerStage(${palette}) renders exactly 12 ambient dots`);
    assertZeroForbiddenSvg(svg, `CleanExplainerStage(${palette})`);
  }

  // 3. Integrated inside UniversalAutoStage without HOST_EXPLAIN white veil
  const ep = sanitizeAndValidateEpisode({
    title: "Clean Explainer Stage Integration",
    slug: "clean_explainer_integration",
    storyMode: "HUMAN_ANIMAL_POV",
    beats: [
      {
        id: "ce1",
        text: "Giải thích khoa học không làm đứng hình.",
        ttsText: "Giải thích khoa học không làm đứng hình.",
        stageType: "CLEAN_EXPLAINER",
        explainerPalette: "LAVENDER_NIGHT",
        timeBadge: "15 NĂM SAU",
        kineticHeadline: { text: "KHÔNG ĐỨNG HÌNH", tone: "INFO" },
        actors: [
          {
            preset: "BOY",
            slot: "LEFT",
            facing: "RIGHT",
            motion: "IDLE_TALK",
            expression: "HAPPY",
          },
        ],
      },
    ],
  });

  const stageSvg = renderToStaticMarkup(
    React.createElement(
      "svg",
      { viewBox: "0 0 1920 1080" },
      React.createElement(UniversalAutoStage, {
        spec: ep.beats[0],
        frame: 30,
        localFrame: 30,
        durationFrames: 180,
        u: 0.2,
        fps: 45,
      })
    )
  );
  assert.ok(stageSvg.includes('id="stage-clean-explainer"'), "UniversalAutoStage renders CLEAN_EXPLAINER");
  assert.ok(stageSvg.includes('id="layer-kinetic-headline"'), "UniversalAutoStage mounts KineticHeadlineLayer");
  assert.ok(stageSvg.includes('id="layer-v24-time-badge"'), "UniversalAutoStage mounts timeBadge");
  assert.ok(!stageSvg.includes('id="host-explain-white-veil"'), "CLEAN_EXPLAINER never mounts white host veil");
  assertZeroForbiddenSvg(stageSvg, "UniversalAutoStage(CLEAN_EXPLAINER)");
});

test("V24 #5: AnimalSpriteKit supports all 8 accessories & 3 ageVariants across all 8 species while keeping CuteOctopus #C4365D", () => {
  const accessories: readonly AnimalAccessoryType[] = [
    "tie_blue",
    "scarf_red",
    "flower_pink",
    "glasses_round",
    "cap_orange",
    "crown_gold",
    "bandana_green",
    "hat_black",
  ];
  const ageVariants: readonly AnimalAgeVariant[] = ["adult", "baby", "elder"];

  const speciesComponents = [
    { name: "CuteCat", Component: CuteCat },
    { name: "CuteDog", Component: CuteDog },
    { name: "CuteBird", Component: CuteBird },
    { name: "CuteAnt", Component: CuteAnt },
    { name: "CuteLizard", Component: CuteLizard },
    { name: "CuteOctopus", Component: CuteOctopus },
    { name: "CuteShark", Component: CuteShark },
    { name: "CuteDolphin", Component: CuteDolphin },
  ] as const;

  for (let i = 0; i < speciesComponents.length; i++) {
    const { name, Component } = speciesComponents[i];
    const accessory = accessories[i];
    for (const ageVariant of ageVariants) {
      const svg = renderToStaticMarkup(
        React.createElement(
          "svg",
          { viewBox: "0 0 1920 1080" },
          React.createElement(Component, {
            x: 960,
            y: 780,
            frame: 25,
            accessory,
            ageVariant,
          })
        )
      );
      assert.ok(
        svg.includes(`id="animal-accessory-${accessory}"`),
        `${name} renders accessory=${accessory}`
      );
      assert.ok(svg.includes('stroke="#1E293B"'), `${name} preserves #1E293B ink stroke`);
      assert.ok(svg.includes('stroke-width="4"'), `${name} preserves strokeWidth=4`);
      if (ageVariant === "elder") {
        assert.ok(svg.includes('stroke="#94A3B8"'), `${name}(elder) renders silver-gray #94A3B8 eyebrows`);
      }
      if (ageVariant === "baby") {
        assert.ok(svg.includes('opacity="0.62"'), `${name}(baby) renders richer rosy blush`);
      }
      assertZeroForbiddenSvg(svg, `${name}(${accessory}, ${ageVariant})`);
    }
  }

  // Verify default CuteOctopus stays locked to plum-red #C4365D with no accessory rendered by default
  const defaultOctoSvg = renderToStaticMarkup(
    React.createElement(
      "svg",
      { viewBox: "0 0 1920 1080" },
      React.createElement(CuteOctopus, { x: 960, y: 700, frame: 30 })
    )
  );
  assert.ok(defaultOctoSvg.includes("#C4365D"), "CuteOctopus default color remains locked to #C4365D");
  assert.ok(!defaultOctoSvg.includes("animal-accessory-"), "No accessory rendered when accessory is omitted");
});

test("V24 #6: Static source audit confirms 0 forbidden SVG filters/tags and Node v24 .ts ESM imports", () => {
  const filesToAudit = [
    "../src/components/KineticHeadlineLayer.tsx",
    "../src/components/CleanExplainerStage.tsx",
    "../src/components/AnimalSpriteKit.tsx",
    "../src/components/AudioSfxLayer.tsx",
    "../src/components/v7/UniversalAutoStage.tsx",
    "../src/lib/v7/autoSfxPlanner.ts",
    "../src/lib/v7/soundDesignEngine.ts",
  ];

  for (const rel of filesToAudit) {
    const abs = path.resolve(__dirname, rel);
    const src = fs.readFileSync(abs, "utf8");
    assertZeroForbiddenSvg(src, rel);
  }

  // Node v24 native ESM check: every relative import in autoSfxPlanner.ts & soundDesignEngine.ts must end with .ts
  for (const rel of ["../src/lib/v7/autoSfxPlanner.ts", "../src/lib/v7/soundDesignEngine.ts"]) {
    const src = fs.readFileSync(path.resolve(__dirname, rel), "utf8");
    const relImports = [...src.matchAll(/from\s+["'](\.[^"']+)["']/g)].map((m) => m[1]);
    assert.ok(relImports.length > 0, `${rel} should have relative imports`);
    for (const imp of relImports) {
      assert.ok(imp.endsWith(".ts"), `${rel} relative import "${imp}" must explicitly end with .ts for Node v24 ESM`);
    }
  }
});
