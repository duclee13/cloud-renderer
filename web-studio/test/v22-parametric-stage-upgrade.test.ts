/**
 * V22.0 Engine Upgrade Unit Test Suite
 * - Parametric StickmanRig `appearance` system (Dad, Mom, Teacher, Classmate + preset override)
 * - Full V21.0 life inheritance (blink desync, 1.2-1.8px idle breathing, 0px foot slip, lip-sync, moonwalk block, bent elbows)
 * - 4 Urban & School Stages (CITY_LIVING_ROOM, CITY_STREET_PARK, SCHOOL_CLASSROOM, HOME_KITCHEN)
 * - Schema & validate_episode.mjs support + 100% backward compatibility
 */
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sanitizeAndValidateEpisode, sanitizeSpeechBubble } from "../src/lib/v7/episodeJsonSchema";
import { StickmanRig, wrapSpeechBubbleLines } from "../src/remotion/components/character/StickmanRig";
import { UniversalAutoStage, shouldHideTopChapterBanner } from "../src/components/v7/UniversalAutoStage";

test("V22 #1: Parametric StickmanRig renders Dad, Mom, Teacher, Classmates & preset overrides directly from JSON appearance", () => {
  const ep = sanitizeAndValidateEpisode({
    title: "Gia đình & Lớp học V22",
    slug: "gia_dinh_lop_hoc_v22",
    beats: [
      {
        id: "b_family",
        text: "Bố mẹ trò chuyện cùng con trong phòng khách.",
        ttsText: "Bố mẹ trò chuyện cùng con trong phòng khách.",
        stageType: "CITY_LIVING_ROOM",
        actors: [
          // Bố: POLO xanh đậm + kính RECT + tóc NEAT_SHORT
          {
            preset: "CUSTOM",
            appearance: {
              scale: 1.0,
              hairStyle: "NEAT_SHORT",
              hairColor: "#0F172A",
              outfitStyle: "POLO",
              outfitColor: "#1D4ED8",
              glasses: "RECT",
              mustache: true,
              prop: "PHONE",
            },
            slot: "LEFT",
            facing: "RIGHT",
            motion: "IDLE_TALK",
            expression: "HAPPY",
            bubble: "Bố về rồi đây!",
            timeline: [
              { fromPct: 0, toPct: 1, startX: 460, endX: 460, facing: "RIGHT", pose: "TALK_GESTURE", expression: "HAPPY" },
            ],
          },
          // Mẹ: CARDIGAN hồng san hô + tóc BOB nâu
          {
            preset: "CUSTOM",
            appearance: {
              scale: 0.96,
              hairStyle: "BOB",
              hairColor: "#78350F",
              outfitStyle: "CARDIGAN",
              outfitColor: "#F43F5E",
              glasses: "NONE",
              mustache: false,
            },
            slot: "CENTER",
            facing: "LEFT",
            motion: "IDLE_TALK",
            expression: "HAPPY",
            timeline: [
              { fromPct: 0, toPct: 1, startX: 960, endX: 960, facing: "LEFT", pose: "NOD_SMILE", expression: "HAPPY" },
            ],
          },
          // Cậu bé preset cũ BOY nhưng ghi đè mặc đồng phục học sinh SCHOOL_UNIFORM
          {
            preset: "BOY",
            appearance: {
              outfitStyle: "SCHOOL_UNIFORM",
              outfitColor: "#FFFFFF",
              prop: "NOTEBOOK",
            },
            slot: "RIGHT",
            facing: "LEFT",
            motion: "IDLE_TALK",
            expression: "HAPPY",
            timeline: [
              { fromPct: 0, toPct: 1, startX: 1420, endX: 1420, facing: "LEFT", pose: "NOD_SMILE", expression: "HAPPY" },
            ],
          },
        ],
      },
      {
        id: "b_school",
        text: "Cô giáo giảng bài cho bạn học sinh nữ buộc tóc đuôi ngựa.",
        ttsText: "Cô giáo giảng bài cho bạn học sinh nữ buộc tóc đuôi ngựa.",
        stageType: "SCHOOL_CLASSROOM",
        actors: [
          // Cô giáo: BUN + kính ROUND + CARDIGAN tím + cầm BOOK
          {
            preset: "CUSTOM",
            appearance: {
              scale: 0.98,
              hairStyle: "BUN",
              hairColor: "#1E293B",
              outfitStyle: "CARDIGAN",
              outfitColor: "#8B5CF6",
              glasses: "ROUND",
              prop: "BOOK",
            },
            slot: "LEFT",
            facing: "RIGHT",
            motion: "IDLE_TALK",
            expression: "HAPPY",
            bubble: "Các em mở sách!",
            timeline: [
              { fromPct: 0, toPct: 1, startX: 540, endX: 540, facing: "RIGHT", pose: "TALK_GESTURE", expression: "HAPPY" },
            ],
          },
          // Bạn học sinh nữ cùng lớp: scale 0.76 + PONYTAIL + TSHIRT vàng
          {
            preset: "CUSTOM",
            appearance: {
              scale: 0.76,
              hairStyle: "PONYTAIL",
              hairColor: "#451A03",
              outfitStyle: "TSHIRT",
              outfitColor: "#F59E0B",
            },
            slot: "RIGHT",
            facing: "LEFT",
            motion: "IDLE_TALK",
            expression: "CURIOUS",
            timeline: [
              { fromPct: 0, toPct: 1, startX: 1280, endX: 1280, facing: "LEFT", pose: "NOD_SMILE", expression: "CURIOUS" },
            ],
          },
        ],
      },
    ],
  });

  const svgFamily = renderToStaticMarkup(
    React.createElement(
      "svg",
      { width: 1920, height: 1080 },
      React.createElement(UniversalAutoStage, {
        spec: ep.beats[0],
        frame: 40,
        localFrame: 40,
        durationFrames: 180,
        u: 40 / 180,
      })
    )
  );
  assert.ok(svgFamily.includes('id="appearance-hair-neat-short"'), "Dad renders NEAT_SHORT hair");
  assert.ok(svgFamily.includes('id="appearance-outfit-polo"'), "Dad renders POLO outfit");
  assert.ok(svgFamily.includes('id="appearance-glasses-rect"'), "Dad renders RECT glasses");
  assert.ok(svgFamily.includes('id="appearance-mustache"'), "Dad renders mustache");
  assert.ok(svgFamily.includes("#1D4ED8"), "Dad custom outfitColor applied");
  assert.ok(svgFamily.includes('id="appearance-hair-bob"'), "Mom renders BOB front hair");
  assert.ok(svgFamily.includes('id="appearance-hair-bob-back"'), "Mom renders BOB back hair");
  assert.ok(svgFamily.includes('id="appearance-outfit-cardigan"'), "Mom renders CARDIGAN outfit");
  assert.ok(svgFamily.includes('id="appearance-outfit-school-uniform"'), "BOY override renders SCHOOL_UNIFORM");

  const svgSchool = renderToStaticMarkup(
    React.createElement(
      "svg",
      { width: 1920, height: 1080 },
      React.createElement(UniversalAutoStage, {
        spec: ep.beats[1],
        frame: 40,
        localFrame: 40,
        durationFrames: 180,
        u: 40 / 180,
      })
    )
  );
  assert.ok(svgSchool.includes('id="appearance-hair-bun"'), "Teacher renders BUN hair");
  assert.ok(svgSchool.includes('id="appearance-glasses-round"'), "Teacher renders ROUND glasses");
  assert.ok(svgSchool.includes('id="hand-prop-book"'), "Teacher holds BOOK hand prop from appearance.prop");
  assert.ok(svgSchool.includes('id="appearance-hair-ponytail-back"'), "Classmate renders PONYTAIL back hair");
  assert.ok(svgSchool.includes('id="appearance-outfit-tshirt"'), "Classmate renders TSHIRT");

  // Direct standalone <StickmanRig /> also renders built-in appearance.prop when used outside UniversalAutoStage
  const standaloneRig = renderToStaticMarkup(
    React.createElement(
      "svg",
      null,
      React.createElement(StickmanRig, {
        characterPreset: "CUSTOM",
        appearance: { hairStyle: "NONE", outfitStyle: "LAB_COAT", prop: "BOOK" },
        state: { x: 400, y: 800, pose: "standing", facing: "right" },
      })
    )
  );
  assert.ok(standaloneRig.includes('id="appearance-outfit-lab-coat"'));
  assert.ok(standaloneRig.includes('id="appearance-prop-book"'));
});

test("V22 #2: CUSTOM appearance actors inherit V21.0 blink desync, 0px foot slip breathing, lip-sync, and moonwalk guard", () => {
  const beat = sanitizeAndValidateEpisode({
    title: "V22 Motion Inheritance",
    slug: "v22_motion",
    beats: [
      {
        id: "b_mot",
        text: "Hai bố con trò chuyện.",
        ttsText: "Hai bố con trò chuyện.",
        stageType: "CITY_STREET_PARK",
        actors: [
          {
            preset: "CUSTOM",
            appearance: { scale: 1.0, hairStyle: "NEAT_SHORT", outfitStyle: "POLO", outfitColor: "#0284C7" },
            slot: "LEFT",
            facing: "RIGHT",
            motion: "IDLE_TALK",
            expression: "HAPPY",
            // Deliberate moonwalk input (WALK with startX===endX) -> must auto-clamp to standing TALK_GESTURE!
            timeline: [{ fromPct: 0, toPct: 1, startX: 520, endX: 520, facing: "RIGHT", pose: "WALK", expression: "HAPPY" }],
          },
          {
            preset: "CUSTOM",
            appearance: { scale: 0.76, hairStyle: "PONYTAIL", outfitStyle: "SCHOOL_UNIFORM" },
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

  let blinkA = 0;
  let blinkB = 0;
  let simultaneousBlinks = 0;
  let maxFootSlipPx = 0;
  const mouthStatesA = new Set<string>();
  const baseFeet: Array<{ lx: number; ly: number; rx: number; ry: number }> = [];

  for (let f = 0; f < 270; f++) {
    const svg = renderToStaticMarkup(
      React.createElement(
        "svg",
        { width: 1920, height: 1080 },
        React.createElement(UniversalAutoStage, { spec: beat, frame: f, localFrame: f, durationFrames: 300, u: f / 300 })
      )
    );
    assert.ok(!svg.includes('data-character-pose="walking"'), "Moonwalk guard converts stationary WALK to standing");

    const rigMatches = [
      ...svg.matchAll(/id="stickman-rig-wrapper" transform="translate\(([^,]+), ([^)]+)\) scale\(([^,]+), ([^)]+)\)"/g),
    ];
    const legMatches = [...svg.matchAll(/id="layer-character-legs">([\s\S]*?)<\/g>/g)];
    assert.equal(rigMatches.length, 2);
    for (let ai = 0; ai < 2; ai++) {
      const rx0 = Number(rigMatches[ai][1]);
      const ry0 = Number(rigMatches[ai][2]);
      const sx = Number(rigMatches[ai][3]);
      const sy = Number(rigMatches[ai][4]);
      const feet = [...legMatches[ai][1].matchAll(/L [-0-9.]+ [-0-9.]+ L ([-0-9.]+) ([-0-9.]+)"/g)].map((m) => ({
        x: rx0 + Number(m[1]) * sx,
        y: ry0 + Number(m[2]) * sy,
      }));
      const cur = { lx: feet[0].x, ly: feet[0].y, rx: feet[1].x, ry: feet[1].y };
      if (!baseFeet[ai]) baseFeet[ai] = cur;
      else {
        maxFootSlipPx = Math.max(
          maxFootSlipPx,
          Math.hypot(cur.lx - baseFeet[ai].lx, cur.ly - baseFeet[ai].ly),
          Math.hypot(cur.rx - baseFeet[ai].rx, cur.ry - baseFeet[ai].ry)
        );
      }
    }

    const blocks = svg.split('id="stickman-rig-wrapper"').slice(1);
    const aBlink = !blocks[0].includes('id="stickman-clean-2d-eyes"');
    const bBlink = !blocks[1].includes('id="stickman-clean-2d-eyes"');
    if (aBlink) blinkA++;
    if (bBlink) blinkB++;
    if (aBlink && bBlink) simultaneousBlinks++;
    mouthStatesA.add(blocks[0].includes('fill="#9F1239"') ? "open" : "closed");
  }

  assert.ok(maxFootSlipPx < 0.02, `Expected 0px foot slip on CUSTOM actors, got ${maxFootSlipPx}`);
  assert.ok(blinkA >= 4 && blinkA <= 10, `CUSTOM actor A blinked ${blinkA} frames`);
  assert.ok(blinkB >= 4 && blinkB <= 10, `CUSTOM actor B blinked ${blinkB} frames`);
  assert.equal(simultaneousBlinks, 0, "Two CUSTOM actors with different appearance blink out of phase");
  assert.deepEqual([...mouthStatesA].sort(), ["closed", "open"], "CUSTOM actor animates talking mouth smoothly");
});

test("V22 #3: 4 Urban & School Stages render clean flat 2D SVG (no blur/dropShadow, flat opacity=0.12 shadows, animate 60fps)", () => {
  const newStages = [
    { stageType: "CITY_LIVING_ROOM", rootId: "stage-city-living-room", detailId: "living-room-sofa" },
    { stageType: "CITY_STREET_PARK", rootId: "stage-city-street-park", detailId: "park-stone-bench" },
    { stageType: "SCHOOL_CLASSROOM", rootId: "stage-school-classroom", detailId: "classroom-chalkboard" },
    { stageType: "HOME_KITCHEN", rootId: "stage-home-kitchen", detailId: "kitchen-dining-table" },
  ] as const;

  for (const st of newStages) {
    for (const tod of ["DAY", "SUNSET", "NIGHT"] as const) {
      const beat = sanitizeAndValidateEpisode({
        title: st.stageType,
        slug: "test_stage",
        beats: [{ id: "b1", text: "Cảnh mới.", ttsText: "Cảnh mới.", stageType: st.stageType, timeOfDay: tod, actors: [] }],
      }).beats[0];

      const svg0 = renderToStaticMarkup(
        React.createElement("svg", null, React.createElement(UniversalAutoStage, { spec: beat, frame: 0, localFrame: 0, durationFrames: 180, u: 0 }))
      );
      const svg45 = renderToStaticMarkup(
        React.createElement("svg", null, React.createElement(UniversalAutoStage, { spec: beat, frame: 45, localFrame: 45, durationFrames: 180, u: 0.25 }))
      );

      assert.ok(svg0.includes(`id="${st.rootId}"`), `Expected ${st.rootId}`);
      assert.ok(svg0.includes(`id="${st.detailId}"`), `Expected ${st.detailId}`);
      assert.ok(svg0.includes('opacity="0.12"'), `Expected flat shadow opacity="0.12" in ${st.stageType}`);
      assert.ok(!svg0.includes("feGaussianBlur") && !svg0.includes("feDropShadow"), `No heavy SVG blur filters in ${st.stageType}`);
      if (tod === "DAY") {
        assert.notEqual(svg0, svg45, `${st.stageType} animates smoothly across frames`);
      }
    }
  }
});

test("V22 #4: validate_episode.mjs accepts CUSTOM + appearance + 4 new stages and catches invalid appearance values", async () => {
  const validatorMod = await import("../scripts/validate_episode.mjs");
  const registered = validatorMod.loadRegisteredCustomVisuals();

  const validRes = validatorMod.validateEpisodeData(
    {
      title: "Valid V22",
      beats: [
        {
          id: "b01",
          text: "Cô giáo giảng bài trên lớp.",
          ttsText: "Cô giáo giảng bài trên lớp.",
          stageType: "SCHOOL_CLASSROOM",
          transitionFrames: 30,
          actors: [
            {
              preset: "CUSTOM",
              appearance: {
                scale: 0.96,
                hairStyle: "BUN",
                hairColor: "#1E293B",
                outfitStyle: "CARDIGAN",
                outfitColor: "#EC4899",
                glasses: "ROUND",
                mustache: false,
                prop: "BOOK",
              },
              bubble: "Chào cả lớp!",
              timeline: [{ fromPct: 0, toPct: 1, startX: 520, endX: 520, pose: "TALK_GESTURE" }],
            },
          ],
        },
      ],
    },
    registered
  );
  assert.equal(validRes.errors.length, 0);
  assert.equal(validRes.warnings.length, 0);

  const invalidRes = validatorMod.validateEpisodeData(
    {
      title: "Invalid V22",
      beats: [
        {
          id: "b_bad",
          text: "Kiểm tra lỗi.",
          ttsText: "Kiểm tra lỗi.",
          stageType: "UNKNOWN_STAGE_XYZ",
          transitionFrames: 30,
          actors: [
            {
              preset: "CUSTOM",
              appearance: {
                scale: 2.5,
                hairStyle: "MOHAWK_NEON",
                outfitColor: "not-a-hex",
              },
              timeline: [{ fromPct: 0, toPct: 1, startX: 520, endX: 520, pose: "NOD_SMILE" }],
            },
          ],
        },
      ],
    },
    registered
  );
  const codes = invalidRes.errors.map((e: { code: string }) => e.code);
  assert.ok(codes.includes("INVALID_STAGE_TYPE"));
  assert.equal(codes.filter((c: string) => c === "INVALID_APPEARANCE").length, 3);
});

test("V22 #5: 10-word auto-wrapping speech bubbles and HOST_EXPLAIN_OVERLAY freeze-frame mode work cleanly", () => {
  const b40 = sanitizeSpeechBubble("Đang trong lớp hay họp, làm sao chặn cơn ngáp?");
  assert.equal(b40, "Đang trong lớp hay họp, làm sao chặn cơn ngáp?");
  assert.equal(sanitizeSpeechBubble("Đang suy nghĩ"), undefined, "Still filters robotic stage direction");
  assert.equal(sanitizeSpeechBubble("Một hai ba bốn năm sáu bảy tám chín mười mười-một"), undefined, "Rejects > 10 words");

  const wrapped = wrapSpeechBubbleLines("Khoan đã, sao cái ngáp lại lây nhanh vậy?", 26);
  assert.equal(wrapped.length, 2);

  const ep = sanitizeAndValidateEpisode({
    title: "Host Explain Overlay Test",
    slug: "host_test",
    beats: [
      {
        id: "b_host",
        text: "Khoan dừng lại một chút nhé.",
        ttsText: "Khoan dừng lại một chút nhé.",
        stageType: "HOST_EXPLAIN_OVERLAY",
        overlayMode: "HOST_EXPLAIN",
        freezeStage: "SCHOOL_CLASSROOM",
        labBoard: "MIRROR_NEURONS_YAWN",
        hostBoardHighlight: "OXYGEN_MYTH",
        actors: [
          {
            preset: "BOY",
            appearance: { scale: 1.18 },
            slot: "LEFT",
            facing: "RIGHT",
            motion: "IDLE_TALK",
            expression: "CURIOUS",
            handProp: "POINTER",
            groundY: 760,
            lookAtCamera: true,
            bubble: "Trước hết, bỏ qua một hiểu nhầm phổ biến nhé!",
            timeline: [{ fromPct: 0, toPct: 1, startX: 330, endX: 330, facing: "RIGHT", pose: "POINT_FORWARD", expression: "CURIOUS" }],
          },
        ],
      },
    ],
  });

  const svg = renderToStaticMarkup(
    React.createElement(
      "svg",
      { width: 1920, height: 1080 },
      React.createElement(UniversalAutoStage, {
        spec: ep.beats[0],
        frame: 60,
        localFrame: 60,
        durationFrames: 225,
        u: 0.3,
        fps: 45,
      })
    )
  );
  assert.ok(svg.includes('id="stage-school-classroom"'), "Freezes underlying SCHOOL_CLASSROOM");
  assert.ok(svg.includes('id="layer-host-explain-veil"'), "Renders flat milky-white veil");
  assert.ok(svg.includes('id="host-board-mirror-neurons-static"'), "Renders MIRROR_NEURONS_YAWN whiteboard");
  assert.ok(svg.includes('id="hand-prop-pointer"'), "Renders POINTER stick");
  assert.ok(svg.includes("<tspan"), "Renders 2-line wrapped speech bubble");
  assert.ok(!svg.includes("feGaussianBlur") && !svg.includes("feDropShadow"), "Zero heavy SVG blur filters");
  assert.equal(shouldHideTopChapterBanner(ep.beats[0]), true, "Auto-hides top chapterBanner on HOST_EXPLAIN_OVERLAY");

  const fsAndLive = sanitizeAndValidateEpisode({
    title: "Banner Visibility Guard",
    slug: "banner_guard",
    beats: [
      { id: "b_live", text: "Cảnh lớp học.", ttsText: "Cảnh lớp học.", stageType: "SCHOOL_CLASSROOM", chapterBanner: "Hồi 1", actors: [] },
      { id: "b_fs", text: "Sơ đồ toàn màn hình.", ttsText: "Sơ đồ toàn màn hình.", stageType: "EXPLAINER_POLKA_DOT", customVisual: "NGAP_SUMMARY_3_CARDS", fullScreenVisual: true, chapterBanner: "Hồi 6", actors: [] },
    ],
  });
  assert.equal(shouldHideTopChapterBanner(fsAndLive.beats[0]), false, "Keeps chapterBanner on open-top daily-life scenes");
  assert.equal(shouldHideTopChapterBanner(fsAndLive.beats[1]), true, "Auto-hides chapterBanner on Full-Screen SVG beats");
});
