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
import { EPISODE_VISUAL_REGISTRY } from "../src/components/v7/episodeVisuals";

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
    "../src/components/v7/OctopusV24ExplainerKit.tsx",
    "../src/components/v7/HostExplainAndStageKits.tsx",
    "../src/components/v7/episodeVisuals/octopusCamoVisualsV24.tsx",
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

test("V24 #7: Episode 10 V24.0 (68 beats ANIMAL_POV, 0 HOST_EXPLAIN, 0 headline overlap on 14 V23 SVGs, 2 new SVGs, OctopusV24ExplainerKit & OceanStoryKit)", async () => {
  const epStudioPath = path.resolve(__dirname, "../episodes/tai_sao_bach_tuoc_doi_mau_tang_hinh_v24.json");
  const epRootPath = path.resolve(__dirname, "../../tai_sao_bach_tuoc_doi_mau_tang_hinh_v24.json");
  assert.ok(fs.existsSync(epStudioPath), "Missing web-studio/episodes/tai_sao_bach_tuoc_doi_mau_tang_hinh_v24.json");
  assert.ok(fs.existsSync(epRootPath), "Missing synced root tai_sao_bach_tuoc_doi_mau_tang_hinh_v24.json");

  const rawText = fs.readFileSync(epStudioPath, "utf8");
  const rootText = fs.readFileSync(epRootPath, "utf8");
  assert.equal(rawText, rootText, "Root copy and web-studio copy of Ep10 V24 JSON must stay synced");

  const rawJson = JSON.parse(rawText);
  const ep = sanitizeAndValidateEpisode(rawJson);

  assert.equal(ep.storyMode, "ANIMAL_POV", "Ep10 V24 must use storyMode=ANIMAL_POV");
  assert.equal(ep.bgmEnabled, true, "Ep10 V24 must enable V24 Multi-Mood BGM");
  assert.equal(ep.sfxEnabled, true, "Ep10 V24 must enable Auto-SFX");
  assert.equal(ep.beats.length, 68, "Ep10 V24 must contain exactly 68 beats");

  const reusedV23Svgs = new Set([
    "OCTO_SPEED_VS_CHAMELEON",
    "OCTO_SKIN_PIXELS",
    "OCTO_3_SKIN_LAYERS",
    "OCTO_3D_PAPILLAE",
    "OCTO_BRAIN_TO_SKIN",
    "OCTO_HUMAN_VS_EYE",
    "OCTO_W_PUPIL_PRISM",
    "OCTO_SKIN_EYES",
    "OCTO_POLARIZED_LIGHT",
    "OCTO_COMMUNICATION_MOOD",
    "OCTO_MIMIC_MASTER",
    "OCTO_ENERGY_COST",
    "OCTO_DREAMING_SLEEP",
    "OCTO_HUMAN_TECH",
  ]);
  const seenReused = new Set<string>();
  const lifespanSteps = new Set<number>();
  const motherSteps = new Set<number>();

  let cleanExplainerStageCount = 0;
  let oceanStageCount = 0;

  for (const beat of ep.beats) {
    assert.notEqual(beat.stageType, "HOST_EXPLAIN_OVERLAY", `${beat.id} must NOT use HOST_EXPLAIN_OVERLAY`);
    assert.notEqual(beat.overlayMode, "HOST_EXPLAIN", `${beat.id} must NOT set overlayMode=HOST_EXPLAIN`);
    assert.equal(beat.chapterBanner, undefined, `${beat.id} must hide HỒI X chapterBanner in ANIMAL_POV`);
    assert.ok(beat.text.trim().length > 0 && beat.ttsText.trim().length > 0, `${beat.id} must have narration`);
    assert.ok(!/[0-9zZ]/.test(beat.ttsText), `${beat.id} ttsText must contain pure Vietnamese (no digits or z/Z): ${beat.ttsText}`);

    if (beat.customVisual) {
      assert.ok(
        beat.customVisual in EPISODE_VISUAL_REGISTRY,
        `${beat.id} customVisual "${beat.customVisual}" must exist in EPISODE_VISUAL_REGISTRY`
      );
      if (reusedV23Svgs.has(beat.customVisual)) {
        seenReused.add(beat.customVisual);
        assert.equal(
          beat.kineticHeadline,
          undefined,
          `${beat.id} (${beat.customVisual}) must NOT set kineticHeadline on reused V23 SVG`
        );
      }
      if (beat.customVisual === "OCTO_SHORT_LIFESPAN") {
        lifespanSteps.add(beat.visualStep ?? 0);
        assert.ok(beat.kineticHeadline?.text, `${beat.id} OCTO_SHORT_LIFESPAN should include kineticHeadline`);
      }
      if (beat.customVisual === "OCTO_MOTHER_SACRIFICE") {
        motherSteps.add(beat.visualStep ?? 0);
        assert.ok(beat.kineticHeadline?.text, `${beat.id} OCTO_MOTHER_SACRIFICE should include kineticHeadline`);
      }
    } else if (beat.stageType === "CLEAN_EXPLAINER") {
      cleanExplainerStageCount++;
      const svg = renderToStaticMarkup(
        React.createElement(
          "svg",
          { viewBox: "0 0 1920 1080" },
          React.createElement(UniversalAutoStage, {
            spec: beat,
            frame: 30,
            localFrame: 30,
            durationFrames: 180,
            u: 0.25,
            fps: 45,
          })
        )
      );
      assert.ok(svg.includes('id="stage-clean-explainer"'), `${beat.id} renders CleanExplainerStage`);
      assert.ok(svg.includes("octopus-v24-explainer-kit-"), `${beat.id} renders OctopusV24ExplainerKit foreground`);
      assert.ok(svg.includes("animal-cute-octopus-"), `${beat.id} renders foreground CuteOctopus`);
      assert.ok(svg.includes('id="layer-kinetic-headline"'), `${beat.id} renders KineticHeadlineLayer`);
      assert.ok(!svg.includes('id="layer-host-explain-veil"'), `${beat.id} has no freeze veil`);
      assertZeroForbiddenSvg(svg, `Ep10 V24 CLEAN_EXPLAINER ${beat.id}`);
    } else if (beat.stageType === "OCEAN_UNDERWATER") {
      oceanStageCount++;
      const svg = renderToStaticMarkup(
        React.createElement(
          "svg",
          { viewBox: "0 0 1920 1080" },
          React.createElement(UniversalAutoStage, {
            spec: beat,
            frame: 30,
            localFrame: 30,
            durationFrames: 180,
            u: 0.25,
            fps: 45,
          })
        )
      );
      assert.ok(svg.includes('id="stage-ocean-underwater"'), `${beat.id} renders OCEAN_UNDERWATER`);
      assert.ok(svg.includes("ocean-story-kit-V24_OCEAN_"), `${beat.id} renders upgraded OceanUnderwaterStoryKit`);
      assert.ok(!svg.includes("[Tuộc nói]") && !svg.includes("[Cá mập nói]"), `${beat.id} has no bracketed speaker tags`);
      if (beat.id === "b60") {
        assert.ok(svg.includes('id="animal-accessory-glasses_round"'), "Beat 60 renders Cụ Tuộc glasses_round");
        assert.ok(svg.includes('stroke="#94A3B8"'), "Beat 60 renders Cụ Tuộc elder eyebrows");
      }
      assertZeroForbiddenSvg(svg, `Ep10 V24 OCEAN_UNDERWATER ${beat.id}`);
    }
  }

  assert.equal(seenReused.size, 14, "Must reuse all 14 V23 OCTO_* SVGs");
  assert.deepEqual([...lifespanSteps].sort(), [0, 1], "OCTO_SHORT_LIFESPAN must cover steps 0 & 1");
  assert.deepEqual([...motherSteps].sort(), [0, 1, 2], "OCTO_MOTHER_SACRIFICE must cover steps 0, 1 & 2");
  assert.equal(cleanExplainerStageCount, 13, "Must have all 13 non-SVG CLEAN_EXPLAINER beats");
  assert.equal(oceanStageCount, 20, "Must have all 20 OCEAN_UNDERWATER beats");

  // Render the 2 brand-new V24 SVGs across every step & verify content + 0 blur
  const ShortLifespanComp = EPISODE_VISUAL_REGISTRY.OCTO_SHORT_LIFESPAN;
  for (const s of [0, 1]) {
    const svg = renderToStaticMarkup(
      React.createElement(ShortLifespanComp, { progress: 0.5, frame: 30, fps: 45, step: s, visualStep: s })
    );
    assert.ok(svg.includes("1 – 2 NĂM"), `OCTO_SHORT_LIFESPAN step ${s} displays 1 – 2 NĂM`);
    assert.ok(svg.includes('id="animal-accessory-bandana_green"'), `OCTO_SHORT_LIFESPAN step ${s} shows Tuộc bandana_green`);
    assertZeroForbiddenSvg(svg, `OCTO_SHORT_LIFESPAN step ${s}`);
  }

  const MotherSacrificeComp = EPISODE_VISUAL_REGISTRY.OCTO_MOTHER_SACRIFICE;
  for (const s of [0, 1, 2]) {
    const svg = renderToStaticMarkup(
      React.createElement(MotherSacrificeComp, { progress: 0.5, frame: 36, fps: 45, step: s, visualStep: s })
    );
    assert.ok(svg.includes('id="animal-accessory-flower_pink"'), `OCTO_MOTHER_SACRIFICE step ${s} shows Mẹ Tuộc flower_pink`);
    assert.ok(svg.includes("#C4365D"), `OCTO_MOTHER_SACRIFICE step ${s} preserves plum-red #C4365D`);
    if (s === 2) {
      assert.ok(svg.includes('id="octo-v24-baby-octopuses"'), "OCTO_MOTHER_SACRIFICE step 2 renders baby octopuses");
      assert.ok(svg.includes('opacity="0.62"'), "OCTO_MOTHER_SACRIFICE step 2 renders baby ageVariant cheeks");
    }
    assertZeroForbiddenSvg(svg, `OCTO_MOTHER_SACRIFICE step ${s}`);
  }

  // Verify V24 Multi-Mood BGM segments (includes SILENT gap at Beat 49!) and Auto-SFX across all 68 beats
  const timeline = ep.beats.map((b, idx) => ({
    id: b.id,
    startFrame: idx * 180,
    durationFrames: 180,
    stageType: b.stageType,
    autoStageSpec: b,
  }));
  const bgmSegs = resolveV24BgmSegments(timeline, 45, true);
  assert.ok(bgmSegs.length >= 6, "Ep10 V24 resolves multiple BGM mood segments with SILENT dramatic pause");
  assert.ok(bgmSegs.some((seg) => seg.mood === "TENSE"), "Includes TENSE BGM segments");
  assert.ok(bgmSegs.some((seg) => seg.mood === "CURIOUS"), "Includes CURIOUS BGM segments");
  assert.ok(bgmSegs.some((seg) => seg.mood === "EMOTIONAL"), "Includes EMOTIONAL BGM segments");
  const beat49Start = 48 * 180;
  assert.ok(
    bgmSegs.every((seg) => beat49Start < seg.startFrame || beat49Start >= seg.startFrame + seg.durationFrames),
    "Beat 49 (SILENT) has zero active BGM segment"
  );
  const sfxPlan = resolveAutoSfxPlan(timeline, 45, true);
  assert.equal(sfxPlan.length, 68, "All 68 beats emit clean non-overlapping SFX cues");

  // Run validate_episode.mjs programmatic validation -> must achieve 0 critical errors!
  const validatorMod = await import("../scripts/validate_episode.mjs");
  const registered = validatorMod.loadRegisteredCustomVisuals();
  const report = validatorMod.validateEpisodeData(rawJson, registered);
  assert.equal(report.errors.length, 0, `validate_episode.mjs must report 0 errors: ${JSON.stringify(report.errors)}`);
});
