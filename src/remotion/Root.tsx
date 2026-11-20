import React from "react";
import { Composition, CalculateMetadataFunction } from "remotion";
import { MainScene, defaultMockSceneGraph } from "./Composition";
import { FixedStoryScene } from "./compositions/FixedStoryScene";
import { MeadowWalkScene } from "./compositions/MeadowWalkScene";
import { WalkRunReferenceScene } from "./compositions/WalkRunReferenceScene";
import { TestV5SmokeScene } from "./compositions/TestV5SmokeScene";
import { TestV5ActionsShowcase } from "./compositions/TestV5ActionsShowcase";
import { TestV7AutoScriptShowcase } from "./compositions/TestV7AutoScriptShowcase";
import { V7MovieComposition } from "./compositions/V7MovieComposition";
import {
  SlowMotionTransitionScene,
  SlowMotionBrakingScene,
} from "./compositions/SlowMotionScenes";
import { AnimScriptScene, AnimScriptSceneProps } from "./compositions/AnimScriptScene";
import {
  DEMO_1_IR,
  DEMO_2_IR,
  DEMO_3_IR,
  DEMO_4_SPIDER_IR,
  QA01_IR,
  QA02_IR,
  QA03_IR,
  QA04_IR,
  QA05_IR,
  SHOWCASE_30S_IR,
} from "./compositions/demoPresets";
import { MasterSceneGraph } from "./types/sceneGraph";

export interface RemotionProps {
  [key: string]: unknown;
  sceneGraph?: MasterSceneGraph;
  scenes?: any[];
  totalFrames?: number;
  ir?: any;
}

const calculateMetadata: CalculateMetadataFunction<any> = async ({ props }) => {
  // 0a. Nếu có V7/V8 Movie Payload, tính toán độ dài trực tiếp theo totalDurationFrames của Movie Payload
  const v7Payload = props?.v7MoviePayload || props?.payload || (props?.sceneGraph as any)?.v7MoviePayload;
  if (v7Payload && (v7Payload.totalDurationFrames || (Array.isArray(v7Payload.beats) && v7Payload.beats.length > 0))) {
    const movieDuration = Number(v7Payload.totalDurationFrames) || 1080;
    return {
      durationInFrames: movieDuration,
      props: {
        ...props,
        v7MoviePayload: v7Payload,
        totalFrames: movieDuration,
        width: 1920,
        height: 1080,
        fps: 60,
      },
    };
  }

  // 0b. Nếu có AnimScript IR, tính toán độ dài trực tiếp theo totalDurationFrames của AnimScript
  const animScriptIR = props?.ir || props?.animScriptIR || (props?.sceneGraph as any)?.ir;
  if (animScriptIR) {
    const irDuration = Number(animScriptIR.totalDurationFrames) || Number(props?.totalFrames) || 480;
    return {
      durationInFrames: irDuration,
      props: {
        ...props,
        ir: animScriptIR,
        totalFrames: irDuration,
        width: 1920,
        height: 1080,
        fps: 60,
      },
    };
  }

  let graph: MasterSceneGraph | undefined;

  // 1. Ưu tiên cao nhất: Nếu props có sceneGraph rõ ràng và khác defaultMockSceneGraph
  if (props?.sceneGraph && props.sceneGraph !== defaultMockSceneGraph) {
    graph = props.sceneGraph as MasterSceneGraph;
  }
  // 2. Nếu props truyền trực tiếp danh sách scenes của kịch bản người dùng
  else if (props?.scenes && Array.isArray(props.scenes) && props.scenes.length > 0) {
    graph = {
      version: (props.version as string) || "3.1.0",
      title: (props.title as string) || "Stickman 2D Explainer Video",
      width: Number(props.width) || 2560,
      height: Number(props.height) || 1440,
      fps: Number(props.fps) || 60,
      totalDurationInFrames: Number(props.totalDurationInFrames) || Number(props.totalFrames) || 480,
      scenes: props.scenes,
    };
  }
  // 3. Fallback: Nếu có sceneGraph
  else if (props?.sceneGraph) {
    graph = props.sceneGraph as MasterSceneGraph;
  } else {
    graph = defaultMockSceneGraph;
  }

  const safeScenes = Array.isArray(graph?.scenes) ? graph.scenes : defaultMockSceneGraph.scenes;
  const scenesEnd = safeScenes.reduce((acc, s) => {
    const start = Number(s?.startFrame) || 0;
    const dur = Number(s?.durationInFrames) || 120;
    return Math.max(acc, start + dur);
  }, 0);

  const requestedTotal = Number(props?.totalFrames) || 0;
  const sceneDuration = scenesEnd || Number(graph?.totalDurationInFrames) || 480;
  const actualDuration = Math.max(60, sceneDuration, requestedTotal);

  return {
    durationInFrames: actualDuration,
    props: {
      ...props,
      sceneGraph: graph,
      scenes: graph.scenes,
      totalFrames: actualDuration,
      width: 1920,
      height: 1080,
      fps: 60,
    },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* =================================================================== */}
      {/* AnimScript v0.1 Compositions (Generic Engine)                       */}
      {/* =================================================================== */}

      {/* Demo 1: Di bo roi nhay tren dong co (6s = 360 frames) */}
      <Composition<any, any>
        id="AnimScriptDemo1"
        component={AnimScriptScene}
        defaultProps={{ ir: DEMO_1_IR }}
        durationInFrames={DEMO_1_IR.totalDurationFrames || 360}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Demo 2: Cam coc, mang di roi dat len ban bang IK 2-khop (7s = 420 frames) */}
      <Composition<any, any>
        id="AnimScriptDemo2"
        component={AnimScriptScene}
        defaultProps={{ ir: DEMO_2_IR }}
        durationInFrames={DEMO_2_IR.totalDurationFrames || 420}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Demo 3: Ngoi lam viec sau ban, che khuat chan/than, camera can (6s = 360 frames) */}
      <Composition<any, any>
        id="AnimScriptDemo3"
        component={AnimScriptScene}
        defaultProps={{ ir: DEMO_3_IR }}
        durationInFrames={DEMO_3_IR.totalDurationFrames || 360}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Demo 4: Chuyen Con Nhen Tam (4 canh tren generic engine) */}
      <Composition<any, any>
        id="AnimScriptDemo4"
        component={AnimScriptScene}
        defaultProps={{ ir: DEMO_4_SPIDER_IR }}
        durationInFrames={DEMO_4_SPIDER_IR.totalDurationFrames || 1440}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Live Generic Composition for Dynamic IR Input */}
      <Composition<any, any>
        id="AnimScriptLive"
        component={AnimScriptScene}
        defaultProps={{ ir: DEMO_4_SPIDER_IR }}
        durationInFrames={1440}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* =================================================================== */}
      {/* V2 QA Acceptance Compositions (Rigorous Continuous Motion & Contacts) */}
      {/* =================================================================== */}

      {/* QA01: Sit & Stand on real chair (8s = 480 frames) */}
      <Composition<any, any>
        id="QA01-SitStand"
        component={AnimScriptScene}
        defaultProps={{ ir: QA01_IR }}
        durationInFrames={QA01_IR.totalDurationFrames || 480}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* QA02: Floor Pickup, Lift while crouched, Carry, Place on Desk (14s = 840 frames) */}
      <Composition<any, any>
        id="QA02-FloorPickupCarryPlace"
        component={AnimScriptScene}
        defaultProps={{ ir: QA02_IR }}
        durationInFrames={QA02_IR.totalDurationFrames || 840}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* QA03: Walk, Run with flight phase & lean, Stop (12s = 720 frames) */}
      <Composition<any, any>
        id="QA03-WalkRunStop"
        component={AnimScriptScene}
        defaultProps={{ ir: QA03_IR }}
        durationInFrames={QA03_IR.totalDurationFrames || 720}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* QA04: Jump & Land with anticipation and landing cushion (9s = 540 frames) */}
      <Composition<any, any>
        id="QA04-JumpLand"
        component={AnimScriptScene}
        defaultProps={{ ir: QA04_IR }}
        durationInFrames={QA04_IR.totalDurationFrames || 540}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* QA05: Dot eyes gaze + Tray carry with apple support transform (12s = 720 frames) */}
      <Composition<any, any>
        id="QA05-ContactAndGaze"
        component={AnimScriptScene}
        defaultProps={{ ir: QA05_IR }}
        durationInFrames={QA05_IR.totalDurationFrames || 720}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* =================================================================== */}
      {/* V2 QA Debug Marker Compositions (Sub-pixel Contact & Joint Overlay) */}
      {/* =================================================================== */}
      <Composition<any, any>
        id="QA01-SitStand-Debug"
        component={AnimScriptScene}
        defaultProps={{ ir: QA01_IR, showDebugMarkers: true }}
        durationInFrames={QA01_IR.totalDurationFrames || 480}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition<any, any>
        id="QA02-FloorPickupCarryPlace-Debug"
        component={AnimScriptScene}
        defaultProps={{ ir: QA02_IR, showDebugMarkers: true }}
        durationInFrames={QA02_IR.totalDurationFrames || 840}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition<any, any>
        id="QA03-WalkRunStop-Debug"
        component={AnimScriptScene}
        defaultProps={{ ir: QA03_IR, showDebugMarkers: true }}
        durationInFrames={QA03_IR.totalDurationFrames || 720}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition<any, any>
        id="QA04-JumpLand-Debug"
        component={AnimScriptScene}
        defaultProps={{ ir: QA04_IR, showDebugMarkers: true }}
        durationInFrames={QA04_IR.totalDurationFrames || 540}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition<any, any>
        id="QA05-ContactAndGaze-Debug"
        component={AnimScriptScene}
        defaultProps={{ ir: QA05_IR, showDebugMarkers: true }}
        durationInFrames={QA05_IR.totalDurationFrames || 720}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* =================================================================== */}
      {/* V4 Walk & Run Reference Benchmark Compositions                      */}
      {/* =================================================================== */}
      <Composition
        id="WalkRunReferenceV4"
        component={WalkRunReferenceScene}
        defaultProps={{ showDebugMarkers: false }}
        durationInFrames={390}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="WalkRunReferenceV4-Debug"
        component={WalkRunReferenceScene}
        defaultProps={{ showDebugMarkers: true }}
        durationInFrames={390}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="WalkRunCloseUpTransition"
        component={WalkRunReferenceScene}
        defaultProps={{ showDebugMarkers: false, cameraMode: "closeUp" }}
        durationInFrames={390}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="SlowMotionTransition"
        component={SlowMotionTransitionScene}
        durationInFrames={84}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="SlowMotionBraking"
        component={SlowMotionBrakingScene}
        durationInFrames={84}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* =================================================================== */}
      {/* Legacy / Acceptance Handcrafted Compositions                        */}
      {/* =================================================================== */}
      <Composition
        id="FixedStoryScene"
        component={FixedStoryScene}
        durationInFrames={1560}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="MeadowWalkScene"
        component={MeadowWalkScene}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="MainScene"
        component={MainScene}
        durationInFrames={480}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      {/* V5 Smoke Test Composition (8s @ 60fps) */}
      <Composition
        id="TestV5SmokeScene"
        component={TestV5SmokeScene}
        durationInFrames={480}
        fps={60}
        width={1920}
        height={1080}
      />
      {/* V5 4-Actions Physics Kinematics Showcase (16s @ 60fps = 960 frames) */}
      <Composition
        id="TestV5ActionsShowcase"
        component={TestV5ActionsShowcase}
        durationInFrames={960}
        fps={60}
        width={1920}
        height={1080}
      />
      {/* V7 Auto Pipeline Showcase (18s @ 60fps = 1080 frames, 3 Themes, 6 New Actions, Zero Hardcoded Frames) */}
      <Composition
        id="TestV7AutoScriptShowcase"
        component={TestV7AutoScriptShowcase}
        durationInFrames={1080}
        fps={60}
        width={1920}
        height={1080}
      />
      {/* V8 Production Movie Composition (Audio-driven, Zero-HUD, Cinematic Subtitles, 9 Themes, 12 Actions) */}
      <Composition<any, any>
        id="V7MovieComposition"
        component={V7MovieComposition}
        durationInFrames={1080}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      {/* 30s Multi-Scene Showcase (30s @ 60fps = 1800 frames) */}
      <Composition<any, any>
        id="Showcase30s"
        component={AnimScriptScene}
        defaultProps={{ ir: SHOWCASE_30S_IR }}
        durationInFrames={SHOWCASE_30S_IR.totalDurationFrames || 1800}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
