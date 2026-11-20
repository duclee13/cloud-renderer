/**
 * AnimScript Core Types & Diagnostics
 */

import { SourceLocation } from "./ast";
export type { SourceLocation };

export interface CompilerDiagnostic {
  code: string;               // e.g. "ERR_UNKNOWN_ANCHOR", "ERR_TARGET_OUT_OF_REACH"
  message: string;
  line: number;
  column: number;
  severity: "error" | "warning";
  targetObject?: string;
  fixSuggestion?: string;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Box2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
}

export type WorldAngleDeg = number; // 0=up, 90=right, 180=down, 270=left
export type ParentAngleDeg = number; // relative to parent bone vector

export interface BoneAngles {
  [jointName: string]: number;
}

export interface CharacterPose {
  x: number;
  y: number;
  facing: "left" | "right";
  isSitting?: boolean;
  sittingHipY?: number;
  crouchDepth?: number;
  eyes?: string;
  eyebrows?: string;
  mouth?: string;
  headTilt?: number;
  eyeGaze?: { x: number; y: number };
  mouthOpen?: boolean;
  limbAngles?: {
    leftUpperArm?: number;
    leftLowerArm?: number;
    leftForearm?: number;
    leftHand?: number;
    rightUpperArm?: number;
    rightLowerArm?: number;
    rightForearm?: number;
    rightHand?: number;
    leftThigh?: number;
    leftCalf?: number;
    leftShin?: number;
    leftFoot?: number;
    rightThigh?: number;
    rightCalf?: number;
    rightShin?: number;
    rightFoot?: number;
    head?: number;
  };
  heldObjects?: {
    rightHand?: string;
    leftHand?: string;
    bothHands?: string;
  };
  feet?: {
    left: Vector2;
    right: Vector2;
  };
}

export interface ObjectTransform {
  x: number;
  y: number;
  rotationDeg: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  zIndex: number;
}

export interface SceneObjectIR {
  id: string;
  name: string;
  kind: "character" | "prop" | "background";
  assetType: string;
  initialTransform: ObjectTransform;
  initialPose?: CharacterPose;
  props?: Record<string, any>;
  parentConstraint?: {
    parentId: string;
    parentAnchor: string;
    childAnchor: string;
    offset: Vector2;
    activeFromFrame?: number;
    activeUntilFrame?: number;
  };
}

export interface SubtitleIR {
  id: string;
  text: string;
  startFrame: number;
  durationFrames: number;
}

export interface SpeechBubbleIR {
  id: string;
  characterId: string;
  text: string;
  startFrame: number;
  durationFrames: number;
  tailAnchor?: { x: number; y: number };
}

export interface PropLabelIR {
  id: string;
  propId: string;
  text: string;
  slot: string;
  startFrame: number;
  durationFrames: number;
}

export interface CameraKeyframeIR {
  frame: number;
  x: number;
  y: number;
  zoom: number;
  easing?: "linear" | "ease_in_out";
}

export type ActionType =
  | "place"
  | "align"
  | "move"
  | "rotate"
  | "follow"
  | "unfollow"
  | "wait"
  | "walk"
  | "run"
  | "jump"
  | "look_at"
  | "reach"
  | "grab"
  | "release"
  | "put_down"
  | "sit"
  | "stand"
  | "pickup"
  | "say"
  | "narrate"
  | "label_prop"
  | "camera_focus"
  | "camera_reset";

export interface ActionClipIR {
  id: string;
  targetId: string;
  action: ActionType;
  startFrame: number;
  durationFrames: number;
  endFrame: number;
  params: Record<string, any>;
  overlapRatio?: number;
  subActions?: ActionClipIR[];
}

export interface SceneIR {
  id: string;
  name: string;
  startFrame: number;
  durationFrames: number;
  objects: Record<string, SceneObjectIR>;
  actionClips: ActionClipIR[];
  cameraKeyframes: CameraKeyframeIR[];
  subtitles: SubtitleIR[];
  speechBubbles: SpeechBubbleIR[];
  propLabels: PropLabelIR[];
}

export interface AnimScriptIR {
  video: VideoConfig;
  scenes: SceneIR[];
  totalDurationFrames: number;
  diagnostics: CompilerDiagnostic[];
}

export interface EvaluatedObjectState {
  id: string;
  name: string;
  kind: "character" | "prop" | "background";
  assetType: string;
  transform: ObjectTransform;
  pose?: CharacterPose;
  props?: Record<string, any>;
  layerSplits?: {
    behindDesk?: boolean;
    handsFront?: boolean;
  };
}

export interface EvaluatedCameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface EvaluatedFrameState {
  frame: number;
  sceneId: string;
  sceneName: string;
  camera: EvaluatedCameraState;
  objects: Record<string, EvaluatedObjectState>;
  activeSubtitles: SubtitleIR[];
  activeSpeechBubbles: SpeechBubbleIR[];
  activePropLabels: PropLabelIR[];
}
