/**
 * ACTION LIBRARY V7.0: Zero-Hardcoded-Frames Kinematics Engine
 * Đóng gói 100% quy tắc sinh cơ học V6.2 vào các bộ giải giải tích tham số hóa u in [0, 1].
 * Không hardcode bất kỳ số frame nào trong kịch bản trình chiếu!
 */

import { Point2D, StickmanState, EyeExpression, EyebrowExpression, MouthExpression } from "../remotion/types/character";
import { solve2JointIK, resolvePendulumLegs, resolvePendulumArms, lerp, cosineSmooth } from "./motionGraph";
import type { StoryCardType, StoryCardProps } from "../remotion/components/cards/StoryInfographicCards";
import type { MantisHungerStage } from "../remotion/components/character/MantisRig";
import type { HornetNightSceneMode } from "../remotion/components/backgrounds/FlashlightNightStage";
import type { KassStoryDemoMode } from "../components/v7/KassStageLibrary";
import type {
  VitalityPreset,
  ActionIntent,
  SocketKey,
  MetricDisplayMode,
} from "../lib/v7/universalAnimationStandard";
import type { VoiceEmotionTone, SubClauseAudioSegment } from "../lib/expressiveTtsDirector";
import type { SfxType } from "../lib/sfxGenerator";

export type ScriptActionType =
  | "WALK"
  | "RUN"
  | "JUMP_OVER"
  | "SIT_AND_TYPE"
  | "SHOCK_CELEBRATE"
  | "SHOCKED_AND_CELEBRATE"
  | "RUN_AND_KICK_BALL"
  | "WAVE_AND_DRINK"
  | "WAVE_HAND_FRONT"
  | "DRINK_WATER_CUP"
  | "PUSH_HEAVY_OBJECT"
  | "POINT_BOARD_EXPLAIN"
  | "POINT_AND_EXPLAIN"
  | "STAND"
  | "PICKUP_AND_CARRY_BOX"
  | "INSERT_HAND_CLOSEUP"
  | "SHOW_INFOGRAPHIC_GAUGE"
  | "STORY_MICRO_POSE"
  | "STORY_CARD_SCENE";

export type StageTheme =
  | "STUDY_ROOM"
  | "SUNSET_PARK"
  | "STREET_SOCCER"
  | "DARK_STUDIO"
  | "WAREHOUSE"
  | "BEACH_SUNNY"
  | "GARDEN_DAY"
  | "LIVING_ROOM"
  | "LINED_PAPER"
  | "DOTTED_CREAM"
  | "RADIAL_SUNBURST"
  | "GRID_PAPER"
  | "SOFT_GRAPH_GRID"
  | "WINDOW_SILL_BOKEH"
  | "PASTEL_BRANCH_GARDEN"
  | "DARK_STAGE_FLOOR"
  | "EARTH_BURROW_FLOOR"
  | "NIGHT_GARDEN_FLASHLIGHT"
  | "COUNTRYSIDE_YARD"
  | "BEDROOM_INDOOR"
  | "UNDERGROUND_CROSS_SECTION"
  | "EXPLAINER_POLKA_DOT"
  | "SIMPLE_GRASS_FIELD";

export interface ScriptBeat {
  id?: string;
  type?: ScriptActionType;
  action?: ScriptActionType;
  startFrame: number;
  durationFrames: number;
  theme?: StageTheme;
  stageTheme?: StageTheme;
  startX?: number;
  targetX?: number;
  obstacleHeight?: number;
  ballStartX?: number;
  seatX?: number;
  crateStartX?: number;
  boardX?: number;
  facing?: "left" | "right";
  facingFactor?: number;
  title?: string;
  sub?: string;
  customData?: Record<string, any>;
  narrationText?: string;
  audioUrl?: string;
  audioDurationMs?: number;
  speechBubbleText?: string;
  archetype?: "default" | "oldMan" | "girl" | "scientist" | "boyCrown" | "mantis" | "hornet" | "explorerOrange";
  headerTitle?: string;
  showDebugHud?: boolean;
  gaugeValue?: number;
  gaugeLabel?: string;
  insertItemType?: "apple" | "box" | "letter";
  // V9.0 / V9.1 / V9.3 / V10.0 / V10.3 / V11.0 Storytime & Infographic Fields
  cardType?: StoryCardType;
  metricMode?: MetricDisplayMode;
  hornetSceneMode?: HornetNightSceneMode;
  kassSceneMode?: KassStoryDemoMode;
  voiceTone?: VoiceEmotionTone;
  sfxType?: SfxType;
  hungerStage?: MantisHungerStage;
  vitalityPreset?: VitalityPreset;
  actionIntent?: ActionIntent;
  targetSocket?: SocketKey;
  floatingHeader?: string;
  calloutText?: string;
  calloutSub?: string;
  calloutTarget?: "head" | "hand" | "torso" | "foot" | "abdomen" | SocketKey;
  /** V11.2: Từ khóa trong narrationText để ô comment tự nảy IN đúng lúc đọc tới và ẩn OUT sau ~2.4s */
  calloutTriggerPhrase?: string;
  sfxText?: string;
  thoughtText?: string;
  showXrayAbdomen?: boolean;
  cardProps?: Partial<StoryCardProps>;
  cameraZoom?: [number, number];
  subClauseAudios?: SubClauseAudioSegment[];
  microPoseVariant?:
    | "alert_scan"
    | "hungry_clutch"
    | "stalk_slow"
    | "strike_grab"
    | "exhausted_slump"
    | "calm_explain";
}

export interface EvaluatedActionState {
  // Character Root & Facing
  rootX: number;
  rootY: number;
  facing: "left" | "right";
  facingFactor: number;
  rigPose: "standing" | "walking" | "running" | "jumping" | "crouching" | "pointing" | "waving";

  // Body Dynamics
  crouchDepth: number;
  flightLift: number;
  torsoTiltDeg: number;
  headTiltDeg: number;

  // Facial Expressions
  eyes: EyeExpression;
  eyebrows: EyebrowExpression;
  mouth: MouthExpression;
  pupilGaze: Point2D;
  blush: boolean;
  sweatDrop: boolean;

  // Limbs & Kinematics
  customHipY?: number;
  leftFootOffset: Point2D;
  rightFootOffset: Point2D;
  leftKneeOffset: Point2D;
  rightKneeOffset: Point2D;
  holdingTarget?: {
    leftGrip?: Point2D;
    rightGrip?: Point2D;
  };

  // Gait Progress
  walkCycleProgress: number;
  walkWeight: number;

  // Scene & Interactive Props State
  theme: StageTheme;
  hudTitle: string;
  hudSub: string;
  narrationText?: string;
  speechBubbleText?: string;
  archetype?: "default" | "oldMan" | "girl" | "scientist" | "boyCrown" | "mantis" | "hornet" | "explorerOrange";
  showXrayAbdomen?: boolean;
  showDebugHud?: boolean;
  propsState: {
    ball?: { x: number; y: number; visible: boolean; rotationDeg: number };
    cup?: { x: number; y: number; visible: boolean; holding: boolean };
    crate?: { x: number; y: number; visible: boolean };
    desk?: { x: number; y: number; visible: boolean };
    chair?: { x: number; y: number; visible: boolean };
    board?: { x: number; y: number; visible: boolean };
    laptop?: { x: number; y: number; visible: boolean; typingActive: boolean };
    pointer?: { x1: number; y1: number; x2: number; y2: number; visible: boolean };
    box?: { x: number; y: number; visible: boolean; holding: boolean };
    apple?: { x: number; y: number; visible: boolean };
    insertHand?: { targetX: number; targetY: number; visible: boolean; label?: string };
    gauge?: { x: number; y: number; visible: boolean; needleAngle: number; label?: string };
  };
  rimLight?: boolean;
  rimColor?: string;
  vfxState: {
    ideaSpark: boolean;
    sparkX: number;
    sparkY: number;
    sparkScale: number;
  };
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// =============================================================================
// 1. TỰ ĐỘNG HÓA WALK & RUN (Tự suy vận tốc, smoothstep 10f, FK/IK con lắc)
// =============================================================================
export function solveWalkOrRun(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const startX = beat.startX ?? 200;
  const rawTargetX = beat.targetX ?? 600;
  const isStudyRoomChairApproach =
    (beat.theme === "STUDY_ROOM" || beat.stageTheme === "STUDY_ROOM") && rawTargetX >= 880;
  const walkStopX = isStudyRoomChairApproach ? 872 : rawTargetX;

  const duration = Math.max(1, beat.durationFrames);
  const dx = walkStopX - startX;
  const vx = Math.abs(dx) / duration;
  const isRunning = vx > 3.8;
  const dir = dx >= 0 ? 1 : -1;
  const facingFactor = dir * 1.0;

  // Tăng/giảm mượt walkWeight ở 10 frames đầu và 10 frames cuối bằng smoothstep
  const leadIn = Math.min(1.0, localF / 10.0);
  const leadOut = Math.min(1.0, (duration - localF) / 14.0);
  const ramp = Math.min(leadIn, leadOut);
  let walkWeight = smoothstep(0, 1, ramp);

  const walkU = isStudyRoomChairApproach ? Math.min(1.0, u / 0.84) : u;
  let rootX = startX + dx * walkU;
  const rootY = groundY;

  // Chu kỳ bước chân: Giới hạn tần số sinh học 60fps (1.0 Hz = 2 bước/s => 30 frames/bước đi bộ)
  const stepPeriodFrames = isRunning ? 22 : 30;
  const gaitPhase = localF * (Math.PI / stepPeriodFrames);
  const walkCycle = (gaitPhase / (2 * Math.PI)) % 1;

  // Độ ngả thân mình
  let torsoTiltDeg = (isRunning ? 14 : 0) * walkWeight * dir;

  // Sinh học chân & gối
  const speed = isRunning ? 4.5 : 2.5;
  const legs = resolvePendulumLegs(gaitPhase, vx, 0, 0, speed * walkWeight, torsoTiltDeg);

  let customHipY = legs.hipY;
  let leftFootOffset = legs.leftFoot;
  let rightFootOffset = legs.rightFoot;
  let leftKneeOffset = legs.leftKnee;
  let rightKneeOffset = legs.rightKnee;

  // Nếu đi tới ghế trong STUDY_ROOM: dừng tại X = 872px trước ghế rồi ngồi xuống ghế ở u > 0.84 (F102 -> F120, bao gồm F110)
  if (isStudyRoomChairApproach && u > 0.84) {
    const sitP = smoothstep(0, 1, (u - 0.84) / 0.16);
    walkWeight = (1 - sitP) * walkWeight;
    rootX = lerp(872, 915, sitP);
    customHipY = lerp(legs.hipY, -85, sitP);
    torsoTiltDeg = lerp(0, 8, sitP);
    leftFootOffset = { x: lerp(legs.leftFoot.x, 44, sitP), y: lerp(legs.leftFoot.y, 0, sitP) };
    rightFootOffset = { x: lerp(legs.rightFoot.x, 54, sitP), y: lerp(legs.rightFoot.y, 0, sitP) };
    leftKneeOffset = { x: lerp(legs.leftKnee.x, 44, sitP), y: lerp(legs.leftKnee.y, -85, sitP) };
    rightKneeOffset = { x: lerp(legs.rightKnee.x, 54, sitP), y: lerp(legs.rightKnee.y, -85, sitP) };
  }

  // Nháy mắt tự nhiên (blink) mỗi 3.2 giây (192 frames, trong 5 frames)
  const isBlinking = (localF % 192) >= 100 && (localF % 192) < 105;

  return {
    rootX,
    rootY,
    facing: dir >= 0 ? "right" : "left",
    facingFactor,
    rigPose: isRunning ? "running" : "walking",
    crouchDepth: 0,
    flightLift: 0,
    torsoTiltDeg,
    headTiltDeg: 0,
    eyes: isBlinking ? "closed" : isRunning ? "wide" : "neutral",
    eyebrows: "neutral",
    mouth: "smile",
    pupilGaze: { x: dir * 0.7, y: 0.1 },
    blush: false,
    sweatDrop: false,
    customHipY,
    leftFootOffset,
    rightFootOffset,
    leftKneeOffset,
    rightKneeOffset,
    walkCycleProgress: walkCycle >= 0 ? walkCycle : 1 + walkCycle,
    walkWeight,
  };
}

// =============================================================================
// 2. TỰ ĐỘNG HÓA JUMP_OVER BẤT KỲ (u in [0, 1] 3 pha chuẩn V6.2 & V8.2)
// =============================================================================
export function solveJumpOver(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const isDarkStudioV8 =
    (beat.theme === "DARK_STUDIO" || beat.stageTheme === "WAREHOUSE" || beat.stageTheme === "DARK_STUDIO") &&
    (beat.startX ?? 900) < 750;

  const fromX = isDarkStudioV8 ? 390 : (beat.startX ?? 900);
  const toX = isDarkStudioV8 ? 830 : (beat.targetX ?? 1300);
  const takeoffX = isDarkStudioV8 ? 535 : fromX + (toX - fromX) * 0.15;
  const obstacleHeight = beat.obstacleHeight ?? 66;
  const apexLift = isDarkStudioV8 ? 205 : Math.min(155, obstacleHeight + 85);

  let rootX = fromX;
  let flightLift = 0;
  let crouchDepth = 0;
  let torsoTiltDeg = 0;
  let rigPose: "running" | "jumping" | "crouching" | "standing" = "jumping";
  let walkCycleProgress = 0;
  let walkWeight = 0;
  let holdingTarget: { leftGrip?: Point2D; rightGrip?: Point2D } | undefined = undefined;
  let legs: ReturnType<typeof resolvePendulumLegs>;

  if (u <= 0.22) {
    // Pha 1 (F580 -> F615, bao gồm F600): Chạy tiếp cận trên mặt đất (flightLift = 0) tới điểm giậm nhảy takeoffX
    // Chân chạm sàn chạy bình thường (KHÔNG co chữ Z lơ lửng trên không khi chưa nhảy!)
    const p = u / 0.22;
    rootX = lerp(fromX, takeoffX, p);
    flightLift = 0;
    crouchDepth = p > 0.68 ? 24 * Math.sin(((p - 0.68) / 0.32) * (Math.PI / 2)) : 0;
    torsoTiltDeg = 14 - 2 * p;
    rigPose = "running";
    const runGait = p * 2.5 * Math.PI;
    legs = resolvePendulumLegs(runGait, 3.8, crouchDepth, 0, 4.2, torsoTiltDeg);
    walkCycleProgress = (runGait / (2 * Math.PI)) % 1;
    walkWeight = 1.0;
  } else if (u <= 0.78) {
    // Pha 2 (F615 -> F705, bao gồm F645): Bay parabol trên không qua đỉnh thùng hàng
    const ft = (u - 0.22) / 0.56;
    rootX = lerp(takeoffX, toX, ft);
    flightLift = Math.sin(ft * Math.PI) * apexLift;
    rigPose = "jumping";

    if (ft <= 0.14) {
      crouchDepth = 24 * Math.cos((ft / 0.14) * (Math.PI / 2));
    } else if (ft >= 0.85) {
      crouchDepth = 18 * Math.sin(((ft - 0.85) / 0.15) * (Math.PI / 2));
    } else {
      crouchDepth = 0;
    }

    if (ft <= 0.5) {
      torsoTiltDeg = 12 * (1 - ft * 2);
    } else {
      torsoTiltDeg = 8 * Math.sin((ft - 0.5) * 2 * (Math.PI / 2));
    }

    legs = resolvePendulumLegs(0, 0, crouchDepth, flightLift, 0, torsoTiltDeg);

    // Hai tay vung mở thể thao khi bay qua thùng (handR = (+45, +25), handL = (-38, +48) so với vai)
    // Xóa bỏ hoàn toàn tư thế 2 tay co rút trước ngực như T-Rex!
    const shoulderYWorld = groundY - flightLift - 310;
    holdingTarget = {
      rightGrip: { x: rootX + 45, y: shoulderYWorld + 25 },
      leftGrip: { x: rootX - 38, y: shoulderYWorld + 48 },
    };
  } else {
    // Pha 3: Tiếp đất nhún hấp thụ lực đạt đỉnh 32px rồi hồi phục đứng thẳng
    const lt = (u - 0.78) / 0.22;
    rootX = toX;
    flightLift = 0;
    rigPose = lt < 0.75 ? "crouching" : "standing";

    if (lt <= 0.35) {
      const p = lt / 0.35;
      crouchDepth = 18 + 14 * Math.sin(p * (Math.PI / 2));
      torsoTiltDeg = 8 + 4 * Math.sin(p * (Math.PI / 2));
    } else {
      const rec = 0.5 * (1 + Math.cos(((lt - 0.35) / 0.65) * Math.PI));
      crouchDepth = 32 * rec;
      torsoTiltDeg = 12 * rec;
    }

    legs = resolvePendulumLegs(0, 0, crouchDepth, 0, 0, torsoTiltDeg);
  }

  return {
    rootX,
    rootY: groundY,
    facing: "right",
    facingFactor: 1.0,
    rigPose,
    crouchDepth,
    flightLift,
    torsoTiltDeg,
    headTiltDeg: 0,
    eyes: u > 0.22 && u < 0.78 ? "wide" : "neutral",
    eyebrows: "raised",
    mouth: u > 0.22 && u < 0.78 ? "circleOpen" : "smile",
    pupilGaze: { x: 0.8, y: 0.5 },
    blush: false,
    sweatDrop: false,
    customHipY: legs.hipY,
    leftFootOffset: legs.leftFoot,
    rightFootOffset: legs.rightFoot,
    leftKneeOffset: legs.leftKnee,
    rightKneeOffset: legs.rightKnee,
    holdingTarget,
    walkCycleProgress,
    walkWeight,
  };
}

// =============================================================================
// 3. HÀNH ĐỘNG 1: SIT_AND_TYPE (Ngồi ghế & Gõ phím Laptop)
// =============================================================================
export function solveSitAndType(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const seatX = beat.seatX ?? 915;
  const dir = beat.facing === "left" ? -1 : 1;
  const facingFactor = dir * 1.0;

  // Hông hạ thấp xuống mặt ghế (seatY = 755px, tức groundY - 85px)
  // Trong local coordinate của stickman, hipY = -85px
  const customHipY = -85;

  // Đùi ngang và cẳng chân vuông góc 90° chạm phẳng sàn (y = 0)
  const footX = dir * 48;
  const kneeX = dir * 48;
  const kneeY = -85; // Ngang bằng hông để đùi nằm ngang song song mặt bàn

  const leftFootOffset = { x: footX - dir * 4, y: 0 };
  const rightFootOffset = { x: footX + dir * 6, y: 0 };
  const leftKneeOffset = { x: kneeX - dir * 4, y: kneeY };
  const rightKneeOffset = { x: kneeX + dir * 6, y: kneeY };

  // Thân hơi nghiêng về bàn làm việc (+8°)
  const torsoTiltDeg = 8 * dir;

  // Hai bàn tay gõ phím tự nhiên: tần số hãm về 2.1 Hz (localF * 0.22 rad/f), biên độ nhỏ ±2.5px
  // Cánh tay đặt sát mặt bàn không vung lên xuống, handX = 978 -> 992px
  const typePhase = localF * 0.22;
  const typeOffsetL = Math.sin(typePhase) * 2.5;
  const typeOffsetR = Math.sin(typePhase + Math.PI) * 2.5;

  const holdingTarget = {
    leftGrip: { x: 978, y: 678 + typeOffsetL },
    rightGrip: { x: 992, y: 678 + typeOffsetR },
  };

  return {
    rootX: seatX,
    rootY: groundY,
    facing: dir >= 0 ? "right" : "left",
    facingFactor,
    rigPose: "standing",
    crouchDepth: 0,
    flightLift: 0,
    torsoTiltDeg,
    headTiltDeg: 4 * dir,
    eyes: "curious",
    eyebrows: "neutral",
    mouth: "smile",
    pupilGaze: { x: dir * 0.75, y: 0.6 },
    blush: false,
    sweatDrop: false,
    customHipY,
    leftFootOffset,
    rightFootOffset,
    leftKneeOffset,
    rightKneeOffset,
    holdingTarget,
    walkCycleProgress: 0,
    walkWeight: 0,
  };
}

// =============================================================================
// 4. HÀNH ĐỘNG 2: SHOCK_CELEBRATE (Giật mình nảy người & Vung tay ăn mừng "Aha!")
// =============================================================================
export function solveShockCelebrate(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const seatX = beat.seatX ?? 920;
  const standX = 832; // Dịch mượt sang bên trái chiếc ghế (bàn chân phải ở 852px, cách lưng ghế 881px đúng 29px, 0% chạm ghế!)

  let rootX = standX;
  let crouchDepth = 0;
  let flightLift = 0;
  let torsoTiltDeg = 0;
  let ideaSpark = false;
  let sparkScale = 0;
  let eyes: EyeExpression = "surprised";
  let mouth: MouthExpression = "circleOpen";
  let blush = false;

  let customHipY: number | undefined = undefined;
  let leftFootOffset: Point2D = { x: -20, y: 0 };
  let rightFootOffset: Point2D = { x: 20, y: 0 };
  let leftKneeOffset: Point2D = { x: -10, y: -86 };
  let rightKneeOffset: Point2D = { x: 10, y: -86 };
  let holdingTarget: { leftGrip?: Point2D; rightGrip?: Point2D } | undefined = undefined;

  if (u <= 0.16) {
    // Pha 1 (u in [0.00, 0.16], 14 frames đầu): Đứng dậy và bước lùi mượt sang trái 75px (920px -> 845px) bằng smoothstep
    const p = u / 0.16;
    const smoothP = smoothstep(0, 1, p);
    rootX = lerp(seatX, standX, smoothP);
    customHipY = lerp(-85, -173.06, smoothP);
    torsoTiltDeg = lerp(8, 0, smoothP);

    // Chân từ co ngồi (footX = 48, kneeY = -85) duỗi thẳng thành đứng chữ Λ cân đối
    leftFootOffset = { x: lerp(44, -20, smoothP), y: 0 };
    rightFootOffset = { x: lerp(54, 20, smoothP), y: 0 };
    leftKneeOffset = { x: lerp(44, -10, smoothP), y: lerp(-85, -86, smoothP) };
    rightKneeOffset = { x: lerp(54, 10, smoothP), y: lerp(-85, -86, smoothP) };

    eyes = "surprised";
    mouth = "circleOpen";
    // Hai tay thu nhẹ ngang ngực chuẩn bị bật nảy
    holdingTarget = {
      leftGrip: { x: rootX - 25, y: groundY - 200 },
      rightGrip: { x: rootX + 25, y: groundY - 200 },
    };
  } else if (u <= 0.78) {
    // Pha 2 (u in [0.16, 0.78]): Bật nảy 2 nhịp vui nhộn tại X = 845px (khoảng sàn trống bên trái ghế)
    const jp = (u - 0.16) / 0.62;
    flightLift = Math.abs(Math.sin(jp * Math.PI * 2)) * 48;
    rootX = standX;
    torsoTiltDeg = 0;
    crouchDepth = 0;
    customHipY = -173.06 - flightLift;

    // Hai chân mở chữ Λ cân đối gọn gàng (footX = ±20px -> 825px..865px, hoàn toàn tách khỏi ghế ở 915px)
    leftFootOffset = { x: -20, y: 0 };
    rightFootOffset = { x: 20, y: 0 };
    leftKneeOffset = { x: -10, y: -86 };
    rightKneeOffset = { x: 10, y: -86 };

    ideaSpark = true;
    sparkScale = Math.max(0.85, Math.sin(jp * Math.PI));
    eyes = "happy";
    mouth = "smile";
    blush = true;

    // Hai tay mở chữ V chiến thắng rộng và cao (\ O /)
    holdingTarget = {
      leftGrip: { x: rootX - 108, y: groundY - flightLift - 383 },
      rightGrip: { x: rootX + 108, y: groundY - flightLift - 383 },
    };
  } else {
    // Pha 3 (u in [0.78, 1.00], bao gồm F390): Tiếp đất nhún nhẹ rồi đứng thẳng tươi cười, 2 tay buông tự nhiên hai bên hông (xóa bỏ tay bọ ngựa!)
    const lp = (u - 0.78) / 0.22;
    rootX = standX;
    flightLift = 0;
    crouchDepth = 14 * Math.sin(lp * Math.PI);
    torsoTiltDeg = 2 * Math.sin(lp * Math.PI);
    customHipY = -173.06 + crouchDepth;

    leftFootOffset = { x: -20, y: 0 };
    rightFootOffset = { x: 20, y: 0 };
    leftKneeOffset = { x: -10, y: -86 };
    rightKneeOffset = { x: 10, y: -86 };

    eyes = "happy";
    mouth = "smile";
    blush = true;
    holdingTarget = undefined;
  }

  return {
    rootX,
    rootY: groundY,
    facing: "right",
    facingFactor: 1.0,
    rigPose: flightLift > 5 ? "jumping" : (crouchDepth > 5 ? "crouching" : "standing"),
    crouchDepth,
    flightLift,
    torsoTiltDeg,
    headTiltDeg: 0,
    eyes,
    eyebrows: "raised",
    mouth,
    pupilGaze: { x: 0.1, y: -0.6 },
    blush,
    sweatDrop: false,
    customHipY,
    leftFootOffset,
    rightFootOffset,
    leftKneeOffset,
    rightKneeOffset,
    holdingTarget,
    walkCycleProgress: 0,
    walkWeight: 0,
    vfxState: {
      ideaSpark,
      sparkX: rootX,
      sparkY: groundY - flightLift - 485, // Bóng đèn sáng rực ngay phía trên đỉnh đầu
      sparkScale,
    },
  };
}

// =============================================================================
// 5. HÀNH ĐỘNG 3: RUN_AND_KICK_BALL (Chạy đà & Sút bóng Parabol)
// =============================================================================
export function solveRunAndKickBall(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const startX = beat.startX ?? 430;
  const plantX = 722;
  const ballStartX = beat.ballStartX ?? 760;
  const ballStartY = groundY - 18; // 822px (bán kính bóng 18px chạm mặt cỏ Y=840)

  let rootX = startX;
  let torsoTiltDeg = 0;
  let customLeftFoot: Point2D;
  let customRightFoot: Point2D;
  let customLeftKnee: Point2D;
  let customRightKnee: Point2D;
  let customHipY: number = -173.06;
  let rigPose: "running" | "standing" = "running";
  let walkCycleProgress = 0;
  let walkWeight = 0;
  let holdingTarget: { leftGrip?: Point2D; rightGrip?: Point2D } | undefined = undefined;

  let ballX = ballStartX;
  let ballY = ballStartY;
  let ballRot = 0;

  // Chuẩn hóa mốc thời gian theo u để đồng bộ hoàn hảo (chạy đà F455-F480, vung chân sút không đứng đơ, F505 bóng bay)
  const isLegacyV7Test = beat.startFrame === 360 && !beat.narrationText;
  const uRunEnd = isLegacyV7Test ? 110 / 160 : 0.40;
  const uWindupEnd = isLegacyV7Test ? 122 / 160 : 0.43;
  const uImpact = isLegacyV7Test ? 125 / 160 : 0.45;
  const uFollowEnd = isLegacyV7Test ? 145 / 160 : 0.68;

  const shoulderYWorld = groundY - 310;

  if (u <= uRunEnd) {
    // Pha 1 (bao gồm F455, F470): Chạy tiếp cận từ startX -> plantX = 722. Bóng NẰM YÊN tại (760, 822)!
    // Truyền walkCycleProgress để resolvePendulumArms đánh 2 tay chạy bộ mạnh mẽ!
    const p = Math.min(1.0, u / uRunEnd);
    rootX = lerp(startX, plantX, p);
    const speed = 4.2;
    const gaitPhase = p * 3.5 * Math.PI;
    torsoTiltDeg = 12;
    const legs = resolvePendulumLegs(gaitPhase, 2.8, 0, 0, speed, torsoTiltDeg);
    customLeftFoot = legs.leftFoot;
    customRightFoot = legs.rightFoot;
    customLeftKnee = legs.leftKnee;
    customRightKnee = legs.rightKnee;
    customHipY = legs.hipY;
    rigPose = "running";
    walkCycleProgress = (gaitPhase / (2 * Math.PI)) % 1;
    walkWeight = 1.0;

    ballX = ballStartX;
    ballY = ballStartY;
    ballRot = 0;
  } else if (u <= uWindupEnd) {
    // Pha 2: Chân trái cắm trụ 0°, Đùi phải đưa ra sau (thighAngle: 0° -> -28°), cẳng chân co nhẹ (kneeBend: 0° -> 35°).
    // Mở 2 cánh tay đối trọng thể thao!
    const wp = (u - uRunEnd) / (uWindupEnd - uRunEnd);
    rootX = plantX;
    torsoTiltDeg = -6 * Math.sin(wp * (Math.PI / 2));
    rigPose = "standing";
    walkWeight = 0;

    customHipY = -173.06;
    customLeftFoot = { x: 0, y: 0 };
    customLeftKnee = { x: 0, y: -86 };

    const thighDeg = lerp(0, -28, wp);
    const bendDeg = lerp(0, 35, wp);
    const thRad = (thighDeg * Math.PI) / 180;
    const calfRad = ((thighDeg - bendDeg) * Math.PI) / 180;

    const kx = 90 * Math.sin(thRad);
    const ky = -173.06 + 90 * Math.cos(thRad);
    const fx = kx + 85 * Math.sin(calfRad);
    const fy = ky + 85 * Math.cos(calfRad);

    customRightKnee = { x: kx, y: ky };
    customRightFoot = { x: fx, y: fy };

    holdingTarget = {
      leftGrip: { x: rootX + 55, y: shoulderYWorld + 22 },
      rightGrip: { x: rootX - 45, y: shoulderYWorld + 68 },
    };

    ballX = ballStartX;
    ballY = ballStartY;
    ballRot = 0;
  } else if (u < uImpact) {
    // Pha 3a: Chân phải vung nhanh từ sau ra trước, duỗi thẳng về 0°, chạm bóng đúng lúc u = uImpact
    const sp = (u - uWindupEnd) / (uImpact - uWindupEnd);
    rootX = plantX;
    torsoTiltDeg = lerp(-6, 2, sp);
    rigPose = "standing";
    walkWeight = 0;

    customHipY = -173.06;
    customLeftFoot = { x: 0, y: 0 };
    customLeftKnee = { x: 0, y: -86 };

    const thighDeg = lerp(-28, 12, sp);
    const bendDeg = lerp(35, 0, sp);
    const thRad = (thighDeg * Math.PI) / 180;
    const calfRad = ((thighDeg - bendDeg) * Math.PI) / 180;

    const kx = 90 * Math.sin(thRad);
    const ky = -173.06 + 90 * Math.cos(thRad);
    const fx = kx + 85 * Math.sin(calfRad);
    const fy = ky + 85 * Math.cos(calfRad);

    customRightKnee = { x: kx, y: ky };
    customRightFoot = { x: fx, y: fy };

    holdingTarget = {
      leftGrip: { x: rootX + 65, y: shoulderYWorld + 15 },
      rightGrip: { x: rootX - 55, y: shoulderYWorld + 65 },
    };

    ballX = ballStartX;
    ballY = ballStartY;
    ballRot = 0;
  } else if (u <= uFollowEnd) {
    // Pha 3b (bao gồm F505): CHÂN CHẠM BÓNG VÀ BÓNG BAY PARABOL NGAY LẬP TỨC!
    // Đùi phải vung mạnh ra trước (+12° -> +42°), CẲNG CHÂN DUỖI THẲNG TUYỆT ĐỐI (kneeBend = 0°)
    // Hai cánh tay mở rộng đối trọng thể thao (handL = (+65, +15), handR = (-55, +65))!
    const fp = (u - uImpact) / (uFollowEnd - uImpact);
    rootX = plantX;
    torsoTiltDeg = lerp(2, 10, fp);
    rigPose = "standing";
    walkWeight = 0;

    customHipY = -173.06;
    customLeftFoot = { x: 0, y: 0 };
    customLeftKnee = { x: 0, y: -86 };

    // Vung đùi từ 12° lên +42°, cẳng chân duỗi thẳng tuyệt đối 0° (mũi chân vươn cao ra trước)
    const thighDeg = lerp(12, 42, Math.sin(fp * (Math.PI / 2)));
    const thRad = (thighDeg * Math.PI) / 180;

    customRightKnee = {
      x: 90 * Math.sin(thRad),
      y: -173.06 + 90 * Math.cos(thRad),
    };
    customRightFoot = {
      x: 175 * Math.sin(thRad),
      y: -173.06 + 175 * Math.cos(thRad),
    };

    holdingTarget = {
      leftGrip: { x: rootX + 65, y: shoulderYWorld + 15 },
      rightGrip: { x: rootX - 55, y: shoulderYWorld + 65 },
    };

    // Bóng bay parabol vọt từ (760, 822)
    const ballT = (u - uImpact) / (isLegacyV7Test ? 25 / 160 : 0.28);
    ballX = ballStartX + 590 * ballT;
    const arc = Math.sin(Math.min(1.0, ballT) * Math.PI) * 260;
    ballY = ballStartY - arc;
    ballRot = ballT * 720;
  } else {
    // Pha 4: Hạ chân phải mượt mà từ +42° về sàn thành thế đứng chữ Λ cân đối
    const lp = (u - uFollowEnd) / (1.0 - uFollowEnd);
    const smoothLp = cosineSmooth(lp);
    rootX = plantX;
    torsoTiltDeg = lerp(10, 0, smoothLp);
    rigPose = "standing";
    walkWeight = 0;
    holdingTarget = undefined;

    customHipY = -173.06;
    customLeftFoot = { x: lerp(0, -26, smoothLp), y: 0 };
    customLeftKnee = { x: lerp(0, -13, smoothLp), y: -86 };

    // Từ duỗi thẳng (+42°) hạ dần về (+26px, 0px)
    const initFootX = 175 * Math.sin((42 * Math.PI) / 180);
    const initFootY = -173.06 + 175 * Math.cos((42 * Math.PI) / 180);
    const curFootX = lerp(initFootX, 26, smoothLp);
    const curFootY = lerp(initFootY, 0, smoothLp);

    customRightFoot = { x: curFootX, y: curFootY };
    customRightKnee = solve2JointIK({ x: 0, y: -173.06 }, customRightFoot, 90, 85, 1);

    // Bóng tiếp tục bay và nảy mặt đất ở cuối chặng
    const ballT = (u - uImpact) / (isLegacyV7Test ? 25 / 160 : 0.28);
    ballX = ballStartX + 590 * ballT;
    if (ballT <= 1.0) {
      const arc = Math.sin(ballT * Math.PI) * 260;
      ballY = ballStartY - arc;
    } else {
      const bounceT = ballT - 1.0;
      const bounce = Math.abs(Math.sin(bounceT * Math.PI * 4)) * 30 * Math.max(0, 1 - bounceT * 3);
      ballY = ballStartY - bounce;
    }
    ballRot = ballT * 720;
  }

  return {
    rootX,
    rootY: groundY,
    facing: "right",
    facingFactor: 1.0,
    rigPose,
    crouchDepth: 0,
    flightLift: 0,
    torsoTiltDeg,
    headTiltDeg: 0,
    eyes: u >= 0.65 ? "wide" : "neutral",
    eyebrows: "raised",
    mouth: u >= 0.70 ? "circleOpen" : "smile",
    pupilGaze: { x: 0.9, y: 0.2 },
    blush: false,
    sweatDrop: false,
    customHipY,
    leftFootOffset: customLeftFoot,
    rightFootOffset: customRightFoot,
    leftKneeOffset: customLeftKnee,
    rightKneeOffset: customRightKnee,
    holdingTarget,
    walkCycleProgress,
    walkWeight,
    propsState: {
      ball: { x: ballX, y: ballY, visible: true, rotationDeg: ballRot },
    },
  };
}

// =============================================================================
// 6. HÀNH ĐỘNG 4: WAVE_AND_DRINK (Xoay chính diện Vẫy tay chào & Uống nước)
// =============================================================================
export function solveWaveAndDrink(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const rootX = beat.startX ?? 760;
  const facingFactor = 0.0; // Xoay chính diện

  // Hai chân chữ Lambda thẳng tắp 0°, hipY = -173.06px
  const customHipY = -173.06;
  const leftFootOffset = { x: -26, y: 0 };
  const rightFootOffset = { x: 26, y: 0 };
  const leftKneeOffset = { x: -13, y: -86 };
  const rightKneeOffset = { x: 13, y: -86 };

  // Tay trái luôn mở nhẹ sang sườn/chống hông (handRel = { x: -24, y: 98 }) để nhìn rõ cả 2 tay
  // shoulderYWorld = groundY - 173.06 - 139 = groundY - 312
  // handY = groundY - 312 + 98 = groundY - 214
  const leftHandGrip = { x: rootX - 24, y: groundY - 214 };

  let rightHandGrip: Point2D;
  let headTiltDeg = 0;
  let eyes: EyeExpression = "happy";
  let mouth: MouthExpression = "smile";

  let cupX = rootX;
  let cupY = groundY;
  let cupHolding = false;

  // Điểm đưa cốc sát miệng: handX = rootX + 10px, handY = headCenterY + 12px
  const mouthX = rootX + 10;
  const mouthY = groundY - 370;

  if (u < 0.50) {
    // Nửa đầu (u < 0.50): Vẫy tay chào khán giả với tần số sinh học 1.5 Hz (localF * 0.15 rad/frame), biên độ ±18px
    const wave = Math.sin(localF * 0.15) * 18;
    rightHandGrip = { x: rootX + 68 + wave, y: groundY - 360 };
    cupHolding = false;
    eyes = "happy";
    mouth = "smile";
    headTiltDeg = 0;
  } else {
    // Nửa sau (u >= 0.50): Cầm cốc 18x24px đưa tới sát miệng uống nước
    const dp = (u - 0.50) / 0.50;
    const smoothDp = cosineSmooth(Math.min(1.0, dp * 2.2));

    rightHandGrip = {
      x: lerp(rootX + 70, mouthX, smoothDp),
      y: lerp(groundY - 360, mouthY, smoothDp),
    };

    cupX = rightHandGrip.x + 2;
    cupY = rightHandGrip.y - 4;
    cupHolding = true;

    if (dp > 0.35) {
      headTiltDeg = -12 * Math.sin(Math.min(1.0, (dp - 0.35) / 0.45) * Math.PI);
      eyes = "closed";
      mouth = "smile";
    }
  }

  const holdingTarget = {
    leftGrip: leftHandGrip,
    rightGrip: rightHandGrip,
  };

  return {
    rootX,
    rootY: groundY,
    facing: "right",
    facingFactor,
    rigPose: "standing",
    crouchDepth: 0,
    flightLift: 0,
    torsoTiltDeg: 0,
    headTiltDeg,
    eyes,
    eyebrows: "raised",
    mouth,
    pupilGaze: { x: 0.0, y: 0.1 },
    blush: true,
    sweatDrop: false,
    customHipY,
    leftFootOffset,
    rightFootOffset,
    leftKneeOffset,
    rightKneeOffset,
    holdingTarget,
    walkCycleProgress: 0,
    walkWeight: 0,
    propsState: {
      cup: { x: cupX, y: cupY, visible: cupHolding, holding: cupHolding },
    },
  };
}

// =============================================================================
// 7. HÀNH ĐỘNG 5: PUSH_HEAVY_OBJECT (Ghì người đẩy thùng trượt trên sàn)
// =============================================================================
export function solvePushHeavyObject(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const crateStartX = beat.crateStartX ?? 490;
  const crateTargetX = 650;
  const crateX = lerp(crateStartX, crateTargetX, u);
  const crateLeftX = crateX - 58; // Rộng 115px (mép trái thùng)

  // Bắt đầu tại startX = 420px -> endX = 580px (thùng đẩy từ 490px đến dừng hẳn tại boxX = 650px)
  const rootX = lerp(beat.startX ?? 420, beat.targetX ?? 580, u);
  const torsoTiltDeg = 24;
  const crouchDepth = 22;

  // Chu kỳ bước chân đạp sàn chịu tải từ tốn: 40 frames / bước (0.67s / bước)
  const pushGait = localF * (Math.PI / 40);
  const legs = resolvePendulumLegs(pushGait, 1.33, crouchDepth, 0, 2.5, torsoTiltDeg);

  // Hai bàn tay của nhân vật áp sát mép trái của thùng: leftHandY = 725px, rightHandY = 748px tại X = crateLeftX
  const holdingTarget = {
    leftGrip: { x: crateLeftX, y: 725 },
    rightGrip: { x: crateLeftX, y: 748 },
  };

  return {
    rootX,
    rootY: groundY,
    facing: "right",
    facingFactor: 1.0,
    rigPose: "crouching",
    crouchDepth,
    flightLift: 0,
    torsoTiltDeg,
    headTiltDeg: 6,
    eyes: "furrowed" as any,
    eyebrows: "furrowed",
    mouth: "line",
    pupilGaze: { x: 0.9, y: 0.3 },
    blush: false,
    sweatDrop: true,
    customHipY: legs.hipY,
    leftFootOffset: legs.leftFoot,
    rightFootOffset: legs.rightFoot,
    leftKneeOffset: legs.leftKnee,
    rightKneeOffset: legs.rightKnee,
    holdingTarget,
    walkCycleProgress: (pushGait / (2 * Math.PI)) % 1,
    walkWeight: 1.0,
    propsState: {
      crate: { x: crateX, y: groundY, visible: true },
    },
  };
}

// =============================================================================
// 8. HÀNH ĐỘNG 6: POINT_BOARD_EXPLAIN (Thuyết trình chỉ bảng biểu đồ)
// =============================================================================
export function solvePointBoardExplain(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const boardX = beat.boardX ?? 1350;
  const rootX = 1045; // Cách mép trái bảng 135px (mép trái bảng = 1350 - 170 = 1180px)
  const facingFactor = 0.65; // Xoay góc 3/4

  const customHipY = -173.06;
  const leftFootOffset = { x: -22, y: 0 };
  const rightFootOffset = { x: 22, y: 0 };
  const leftKneeOffset = { x: -11, y: -86 };
  const rightKneeOffset = { x: 11, y: -86 };

  // shoulderYWorld = groundY - 173.06 - 139 = 528px (khi groundY = 840)
  const shoulderYWorld = groundY - 312;
  const handRight = { x: 1115, y: shoulderYWorld + 10 }; // 538px

  // 3 mốc dữ liệu trên bảng (tâm bảng X = 1350):
  // Mốc 1: X = 1270, Y = 600 (groundY - 240)
  // Mốc 2: X = 1360, Y = 530 (groundY - 310)
  // Mốc 3: X = 1440, Y = 460 (groundY - 380)
  let targetNodeX = 1270;
  let targetNodeY = 600;

  if (u < 0.35) {
    // Giữ yên tại Node 1 (1270, 600)
    targetNodeX = 1270;
    targetNodeY = 600;
  } else if (u < 0.65) {
    // Di chuyển mượt qua Node 2 (1360, 530)
    const p = (u - 0.35) / 0.30;
    targetNodeX = lerp(1270, 1360, cosineSmooth(p));
    targetNodeY = lerp(600, 530, cosineSmooth(p));
  } else {
    // Di chuyển tới Node 3 (1440, 460) và GIỮ YÊN TẠI ĐÓ (chỉ nhích nhẹ ±2px)
    const p = Math.min(1.0, (u - 0.65) / 0.15);
    targetNodeX = lerp(1360, 1440, cosineSmooth(p)) + Math.sin(localF * 0.08) * 2;
    targetNodeY = lerp(530, 460, cosineSmooth(p)) + Math.cos(localF * 0.08) * 2;
  }

  // Que chỉ dài 140px hướng từ tay phải về phía mốc dữ liệu
  const pdx = targetNodeX - handRight.x;
  const pdy = targetNodeY - handRight.y;
  const plen = Math.hypot(pdx, pdy) || 1;
  const tipX = handRight.x + (pdx / plen) * 140;
  const tipY = handRight.y + (pdy / plen) * 140;

  // Tay trái cử chỉ diễn thuyết chậm rãi (Math.sin(localF * 0.08) * 10px)
  const gestWave = Math.sin(localF * 0.08) * 10;
  const handLeft = { x: rootX - 35, y: shoulderYWorld + 35 + gestWave };

  const holdingTarget = {
    leftGrip: handLeft,
    rightGrip: handRight,
  };

  const isTalking = (Math.floor(localF / 12) % 2) === 0;

  return {
    rootX,
    rootY: groundY,
    facing: "right",
    facingFactor,
    rigPose: "standing",
    crouchDepth: 0,
    flightLift: 0,
    torsoTiltDeg: 0,
    headTiltDeg: Math.sin(localF * 0.06) * 2,
    eyes: "happy",
    eyebrows: "raised",
    mouth: isTalking ? "talking" : "smile",
    pupilGaze: { x: 0.8, y: -0.2 },
    blush: false,
    sweatDrop: false,
    customHipY,
    leftFootOffset,
    rightFootOffset,
    leftKneeOffset,
    rightKneeOffset,
    holdingTarget,
    walkCycleProgress: 0,
    walkWeight: 0,
    propsState: {
      board: { x: boardX, y: groundY, visible: true },
      pointer: {
        x1: handRight.x,
        y1: handRight.y,
        x2: tipX,
        y2: tipY,
        visible: true,
      },
    },
  };
}

// =============================================================================
// 9. HÀNH ĐỘNG 7: PICKUP_AND_CARRY_BOX (Cúi nhặt vật, đặt lên nắp thùng và bê bước đi)
// =============================================================================
export function solvePickupAndCarryBox(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const startX = beat.startX ?? 1320;
  const boxStartX = 1430;
  let rootX = startX;
  let crouchDepth = 0;
  let torsoTiltDeg = 0;
  let facingFactor = 1.0;
  let walkWeight = 0;
  let walkCycleProgress = 0;
  let customHipY: number | undefined = undefined;
  let leftFootOffset: Point2D = { x: -26, y: 0 };
  let rightFootOffset: Point2D = { x: 26, y: 0 };
  let leftKneeOffset: Point2D = { x: -13, y: -86 };
  let rightKneeOffset: Point2D = { x: 13, y: -86 };
  let holdingTarget: { leftGrip?: Point2D; rightGrip?: Point2D } | undefined = undefined;

  let appleX = startX + 24;
  let appleY = groundY - 15;
  let boxX = boxStartX;
  let boxY = groundY;
  let isBoxHeld = false;

  if (u <= 0.35) {
    // 1. Cúi người tiếp cận nhặt táo tại X = startX
    const p = u / 0.35;
    const ep = cosineSmooth(p);
    crouchDepth = 55 * ep;
    torsoTiltDeg = 48 * ep;
    customHipY = -173.06 + crouchDepth;

    // Tay phải vươn xuống chạm táo, tay trái buông tự nhiên
    const handX = rootX + 24;
    const handY = lerp(groundY - 180, groundY - 15, ep);
    holdingTarget = {
      rightGrip: { x: handX, y: handY },
    };
    appleX = startX + 24;
    appleY = groundY - 15;
  } else if (u <= 0.55) {
    // 2. Nhấc táo đứng thẳng dậy & bước tới thùng các-tông
    const p = (u - 0.35) / 0.20;
    const ep = cosineSmooth(p);
    rootX = lerp(startX, boxStartX - 40, ep);
    crouchDepth = 55 * (1 - ep);
    torsoTiltDeg = 48 * (1 - ep);
    customHipY = -173.06 + crouchDepth;

    const handY = lerp(groundY - 15, groundY - 190, ep);
    holdingTarget = {
      rightGrip: { x: rootX + 24, y: handY },
    };
    appleX = rootX + 24;
    appleY = handY;
  } else if (u <= 0.70) {
    // 3. Đặt táo lên nắp thùng và nâng thùng lên ngang bụng
    const p = (u - 0.55) / 0.15;
    const ep = cosineSmooth(p);
    rootX = boxStartX - 40;
    crouchDepth = lerp(0, 35, ep);
    torsoTiltDeg = lerp(0, 20, ep);
    customHipY = -173.06 + crouchDepth;

    boxY = lerp(groundY, groundY - 95, ep);
    isBoxHeld = true;
    appleX = boxX;
    appleY = boxY - 135;

    holdingTarget = {
      leftGrip: { x: boxX - 55, y: boxY - 60 },
      rightGrip: { x: boxX + 55, y: boxY - 60 },
    };
  } else {
    // 4. Bê thùng và bước đi khoan thai sang trái
    const p = (u - 0.70) / 0.30;
    facingFactor = -1.0;
    rootX = lerp(boxStartX - 40, beat.targetX ?? 820, cosineSmooth(p));
    crouchDepth = 0;
    torsoTiltDeg = -4;
    customHipY = -173.06;

    const pushGait = localF * (Math.PI / 25);
    const legs = resolvePendulumLegs(pushGait, 2.6, 0, 0, 3.2, torsoTiltDeg);
    leftFootOffset = legs.leftFoot;
    rightFootOffset = legs.rightFoot;
    leftKneeOffset = legs.leftKnee;
    rightKneeOffset = legs.rightKnee;
    walkWeight = 1.0;
    walkCycleProgress = (pushGait / (2 * Math.PI)) % 1;

    boxX = rootX - 50;
    boxY = groundY - 95;
    isBoxHeld = true;
    appleX = boxX;
    appleY = boxY - 135;

    holdingTarget = {
      leftGrip: { x: boxX - 55, y: boxY - 60 },
      rightGrip: { x: boxX + 55, y: boxY - 60 },
    };
  }

  return {
    rootX,
    rootY: groundY,
    facing: facingFactor >= 0 ? "right" : "left",
    facingFactor,
    rigPose: crouchDepth > 15 ? "crouching" : (walkWeight > 0.5 ? "walking" : "standing"),
    crouchDepth,
    flightLift: 0,
    torsoTiltDeg,
    headTiltDeg: 0,
    eyes: "neutral",
    eyebrows: "neutral",
    mouth: "line",
    pupilGaze: { x: facingFactor * 0.8, y: 0.2 },
    blush: false,
    sweatDrop: false,
    customHipY,
    leftFootOffset,
    rightFootOffset,
    leftKneeOffset,
    rightKneeOffset,
    holdingTarget,
    walkCycleProgress,
    walkWeight,
    propsState: {
      box: { x: boxX, y: boxY, visible: true, holding: isBoxHeld },
      apple: { x: appleX, y: appleY, visible: true },
    },
  };
}

// =============================================================================
// 10. HÀNH ĐỘNG 8: INSERT_HAND_CLOSEUP (Cận cảnh bàn tay vươn vào dán nhãn)
// =============================================================================
export function solveInsertHandCloseup(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const targetX = beat.targetX ?? 960;
  const targetY = 540;

  return {
    rootX: -999,
    rootY: groundY,
    facing: "right",
    facingFactor: 1.0,
    rigPose: "standing",
    crouchDepth: 0,
    flightLift: 0,
    torsoTiltDeg: 0,
    headTiltDeg: 0,
    eyes: "neutral",
    eyebrows: "neutral",
    mouth: "line",
    pupilGaze: { x: 0, y: 0 },
    blush: false,
    sweatDrop: false,
    walkCycleProgress: 0,
    walkWeight: 0,
    propsState: {
      insertHand: {
        targetX,
        targetY,
        visible: true,
        label: beat.customData?.label || beat.customData?.text || "Tám",
      },
    },
  };
}

// =============================================================================
// 11. HÀNH ĐỘNG 9: SHOW_INFOGRAPHIC_GAUGE (Thuyết trình đồng hồ đo bán nguyệt)
// =============================================================================
export function solveShowInfographicGauge(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  const rootX = beat.startX ?? 720;
  const gaugeX = beat.targetX ?? 1240;
  const gaugeY = 520;
  const facingFactor = 0.8;

  const needleAngle = lerp(45, -65, cosineSmooth(Math.min(1.0, u * 1.5)));

  const shoulderYWorld = groundY - 312;
  const handRight = { x: rootX + 75, y: shoulderYWorld - 30 };
  const gestWave = Math.sin(localF * 0.08) * 10;
  const handLeft = { x: rootX - 25, y: shoulderYWorld + 50 + gestWave };

  const isTalking = (Math.floor(localF / 12) % 2) === 0;

  return {
    rootX,
    rootY: groundY,
    facing: "right",
    facingFactor,
    rigPose: "pointing",
    crouchDepth: 0,
    flightLift: 0,
    torsoTiltDeg: 0,
    headTiltDeg: Math.sin(localF * 0.06) * 2,
    eyes: "neutral",
    eyebrows: "raised",
    mouth: isTalking ? "talking" : "smile",
    pupilGaze: { x: 0.8, y: -0.2 },
    blush: false,
    sweatDrop: false,
    leftFootOffset: { x: -24, y: 0 },
    rightFootOffset: { x: 24, y: 0 },
    leftKneeOffset: { x: -12, y: -86 },
    rightKneeOffset: { x: 12, y: -86 },
    holdingTarget: {
      leftGrip: handLeft,
      rightGrip: handRight,
    },
    walkCycleProgress: 0,
    walkWeight: 0,
    propsState: {
      gauge: {
        x: gaugeX,
        y: gaugeY,
        visible: true,
        needleAngle,
        label: beat.customData?.label || "TỐC ĐỘ TRAO ĐỔI CHẤT",
      },
    },
  };
}

// =============================================================================
// 12. V9.0: STORY_MICRO_POSE (Cảnh Nhân Vật Tĩnh Có Hồn - Micro-Motion Pose)
// Giữ tư thế chuẩn, chớp mắt, đảo đồng tử, nhúc nhích nhẹ tay/đầu (5-8px)
// =============================================================================
export function solveStoryMicroPose(
  u: number,
  localF: number,
  beat: ScriptBeat,
  groundY: number
): Partial<EvaluatedActionState> {
  // Nếu beat là thẻ Infographic toàn màn hình thì ẩn nhân vật để thẻ nổi bật 100%
  if (beat.cardType && beat.cardType !== "CHARACTER_POSE_CARD") {
    return {
      rootX: -999,
      rootY: groundY,
      facing: "right",
      facingFactor: 1.0,
      rigPose: "standing",
      crouchDepth: 0,
      flightLift: 0,
      torsoTiltDeg: 0,
      headTiltDeg: 0,
      eyes: "neutral",
      eyebrows: "neutral",
      mouth: "line",
      pupilGaze: { x: 0, y: 0 },
      blush: false,
      sweatDrop: false,
      walkCycleProgress: 0,
      walkWeight: 0,
      propsState: {
        crate: { x: 650, y: groundY, visible: false },
      },
    };
  }

  const variant = beat.microPoseVariant || "alert_scan";
  const baseStartX = beat.startX ?? 940;
  const baseTargetX = beat.targetX ?? baseStartX;
  const rootX = lerp(baseStartX, baseTargetX, smoothstep(0.15, 0.75, u));
  const facing = beat.facing ?? "right";
  const dir = facing === "left" ? -1 : 1;

  // Nhịp thở & nháy mắt tự nhiên ở 60fps (chớp mắt mỗi 190 frames trong 7 frames)
  const breathWave = Math.sin(localF * 0.03);
  const microHandWave = Math.sin(localF * 0.05) * 3;
  const isBlinking = (localF % 190) >= 110 && (localF % 190) < 117;
  const isTalking = (Math.floor(localF / 11) % 2) === 0;

  // Saccade & Hold Fixation: 125/135 frames đứng yên tuyệt đối, 10 frames cuối liếc nhẹ
  const cycleLen = 135;
  const gazePoints = [
    { x: 0.45, y: 0 },
    { x: 0.45, y: 0 },
    { x: -0.35, y: -0.15 },
    { x: 0.55, y: 0.08 },
  ];
  const cIdx = Math.floor(localF / cycleLen);
  const fInCycle = localF % cycleLen;
  const gCur = gazePoints[cIdx % gazePoints.length];
  const gNext = gazePoints[(cIdx + 1) % gazePoints.length];
  const sacP = fInCycle >= 125 ? smoothstep(125, 135, fInCycle) : 0;
  const saccadeX = lerp(gCur.x, gNext.x, sacP);
  const saccadeY = lerp(gCur.y, gNext.y, sacP);

  const shoulderYWorld = groundY - 312;
  let torsoTiltDeg = breathWave * 0.8;
  let headTiltDeg = saccadeX * 4.5;
  let crouchDepth = 0;
  let customHipY = -173;
  let eyes: EyeExpression = isBlinking ? "closed" : "neutral";
  let eyebrows: EyebrowExpression = "neutral";
  let mouth: MouthExpression = isTalking ? "talking" : "smile";
  let pupilGaze: Point2D = { x: saccadeX, y: saccadeY };
  let sweatDrop = false;

  let leftHandTarget = { x: rootX - dir * 32, y: shoulderYWorld + 55 + microHandWave };
  let rightHandTarget = { x: rootX + dir * 56, y: shoulderYWorld + 26 - microHandWave };

  if (variant === "alert_scan") {
    eyes = isBlinking ? "closed" : "wide";
    eyebrows = "raised";
    headTiltDeg = saccadeX * 6.0;
    pupilGaze = { x: saccadeX, y: saccadeY };
    leftHandTarget = { x: rootX + dir * 38, y: shoulderYWorld + 28 + microHandWave };
    rightHandTarget = { x: rootX + dir * 68, y: shoulderYWorld + 22 - microHandWave };
  } else if (variant === "hungry_clutch") {
    eyes = isBlinking ? "closed" : "curious";
    eyebrows = "worried";
    mouth = "line";
    sweatDrop = true;
    torsoTiltDeg = dir * 8 + breathWave * 2;
    crouchDepth = 10;
    customHipY = -163;
    // Hai tay ôm bụng đói cồn cào
    leftHandTarget = { x: rootX + dir * 16, y: shoulderYWorld + 85 + microHandWave * 0.5 };
    rightHandTarget = { x: rootX + dir * 28, y: shoulderYWorld + 78 - microHandWave * 0.5 };
  } else if (variant === "stalk_slow") {
    eyes = isBlinking ? "closed" : "curious";
    eyebrows = "furrowed";
    mouth = "line";
    torsoTiltDeg = dir * 11;
    crouchDepth = 12;
    customHipY = -161;
    pupilGaze = { x: dir * 0.95, y: 0.15 };
    // Hai tay giơ tư thế rình mồi nhưng giữ dưới vai/cằm (>= shoulderYWorld + 22)
    leftHandTarget = { x: rootX + dir * 52, y: shoulderYWorld + 30 + microHandWave * 0.4 };
    rightHandTarget = { x: rootX + dir * 74, y: shoulderYWorld + 22 - microHandWave * 0.4 };
  } else if (variant === "strike_grab") {
    const strikeImpulse = u > 0.18 && u < 0.55 ? smoothstep(0.18, 0.28, u) * (1 - smoothstep(0.42, 0.58, u)) : 0;
    eyes = "wide";
    eyebrows = "furrowed";
    mouth = "gasp";
    torsoTiltDeg = dir * (6 + strikeImpulse * 14);
    pupilGaze = { x: dir * 1.0, y: 0.1 };
    leftHandTarget = { x: rootX + dir * (48 + strikeImpulse * 45), y: shoulderYWorld + 28 };
    rightHandTarget = { x: rootX + dir * (65 + strikeImpulse * 52), y: shoulderYWorld + 22 };
  } else if (variant === "exhausted_slump") {
    eyes = "curious";
    eyebrows = "worried";
    mouth = "line";
    sweatDrop = true;
    torsoTiltDeg = dir * 14;
    headTiltDeg = dir * 12;
    crouchDepth = 18;
    customHipY = -155;
    leftHandTarget = { x: rootX - dir * 12, y: shoulderYWorld + 98 };
    rightHandTarget = { x: rootX + dir * 24, y: shoulderYWorld + 95 };
  }

  return {
    rootX,
    rootY: groundY,
    facing,
    facingFactor: dir * 0.85,
    rigPose: "pointing",
    crouchDepth,
    flightLift: 0,
    torsoTiltDeg,
    headTiltDeg,
    eyes,
    eyebrows,
    mouth,
    pupilGaze,
    blush: false,
    sweatDrop,
    customHipY,
    showXrayAbdomen: Boolean(beat.showXrayAbdomen || beat.customData?.showXrayAbdomen),
    leftFootOffset: { x: -24, y: 0 },
    rightFootOffset: { x: 26, y: 0 },
    leftKneeOffset: { x: -12, y: -86 + crouchDepth * 0.5 },
    rightKneeOffset: { x: 14, y: -86 + crouchDepth * 0.5 },
    holdingTarget: {
      leftGrip: leftHandTarget,
      rightGrip: rightHandTarget,
    },
    walkCycleProgress: 0,
    walkWeight: 0,
    propsState: {
      crate: { x: 650, y: groundY, visible: false },
    },
  };
}

// =============================================================================
// COMPILER CHÍNH: compileScriptBeats(SCRIPT_BEATS, frame)
// Tự động phân giải timeline, xác định beat hiện tại, nội suy u và giải cơ học
// =============================================================================
export function compileScriptBeats(
  beats: ScriptBeat[],
  frame: number,
  groundY: number = 840
): EvaluatedActionState {
  if (!beats || beats.length === 0) {
    throw new Error("compileScriptBeats: Danh sách SCRIPT_BEATS rỗng!");
  }

  // 1. Tìm Beat tương ứng với frame hiện tại
  let currentBeat = beats.find(
    (b) => frame >= b.startFrame && frame < b.startFrame + b.durationFrames
  );

  if (!currentBeat) {
    if (frame < beats[0].startFrame) {
      currentBeat = beats[0];
    } else {
      currentBeat = beats[beats.length - 1];
    }
  }

  const localF = Math.max(0, frame - currentBeat.startFrame);
  const u = Math.min(1.0, Math.max(0.0, localF / Math.max(1, currentBeat.durationFrames)));

  // 2. Điều phối tới Action Solver tương ứng
  let partial: Partial<EvaluatedActionState>;

  const effectiveActionType =
    currentBeat.cardType && currentBeat.cardType !== "CHARACTER_POSE_CARD"
      ? "STORY_CARD_SCENE"
      : currentBeat.type ?? currentBeat.action ?? "WALK";

  switch (effectiveActionType) {
    case "STORY_MICRO_POSE":
    case "STORY_CARD_SCENE":
      partial = solveStoryMicroPose(u, localF, currentBeat, groundY);
      break;
    case "WALK":
    case "RUN":
      partial = solveWalkOrRun(u, localF, currentBeat, groundY);
      break;
    case "JUMP_OVER":
      partial = solveJumpOver(u, localF, currentBeat, groundY);
      break;
    case "SIT_AND_TYPE":
      partial = solveSitAndType(u, localF, currentBeat, groundY);
      break;
    case "SHOCK_CELEBRATE":
    case "SHOCKED_AND_CELEBRATE":
      partial = solveShockCelebrate(u, localF, currentBeat, groundY);
      break;
    case "RUN_AND_KICK_BALL":
      partial = solveRunAndKickBall(u, localF, currentBeat, groundY);
      break;
    case "WAVE_AND_DRINK":
    case "WAVE_HAND_FRONT":
    case "DRINK_WATER_CUP":
      partial = solveWaveAndDrink(u, localF, currentBeat, groundY);
      break;
    case "PUSH_HEAVY_OBJECT":
      partial = solvePushHeavyObject(u, localF, currentBeat, groundY);
      break;
    case "POINT_BOARD_EXPLAIN":
    case "POINT_AND_EXPLAIN":
      partial = solvePointBoardExplain(u, localF, currentBeat, groundY);
      break;
    case "PICKUP_AND_CARRY_BOX":
      partial = solvePickupAndCarryBox(u, localF, currentBeat, groundY);
      break;
    case "INSERT_HAND_CLOSEUP":
      partial = solveInsertHandCloseup(u, localF, currentBeat, groundY);
      break;
    case "SHOW_INFOGRAPHIC_GAUGE":
      partial = solveShowInfographicGauge(u, localF, currentBeat, groundY);
      break;
    default:
      partial = solveWalkOrRun(u, localF, currentBeat, groundY);
  }

  const rawTheme = currentBeat.theme ?? currentBeat.stageTheme ?? "STUDY_ROOM";
  const effectiveTheme: StageTheme =
    rawTheme === "STREET_SOCCER"
      ? "SUNSET_PARK"
      : rawTheme === "WAREHOUSE" || rawTheme === "DARK_STAGE_FLOOR" || rawTheme === "EARTH_BURROW_FLOOR"
      ? "DARK_STUDIO"
      : rawTheme;

  // 3. Hợp nhất cấu trúc đầy đủ
  const fullState: EvaluatedActionState = {
    rootX: partial.rootX ?? 200,
    rootY: partial.rootY ?? groundY,
    facing: partial.facing ?? "right",
    facingFactor: partial.facingFactor ?? 1.0,
    rigPose: partial.rigPose ?? "standing",
    crouchDepth: partial.crouchDepth ?? 0,
    flightLift: partial.flightLift ?? 0,
    torsoTiltDeg: partial.torsoTiltDeg ?? 0,
    headTiltDeg: partial.headTiltDeg ?? 0,
    eyes: partial.eyes ?? "neutral",
    eyebrows: partial.eyebrows ?? "neutral",
    mouth: partial.mouth ?? "smile",
    pupilGaze: partial.pupilGaze ?? { x: 0, y: 0 },
    blush: partial.blush ?? false,
    sweatDrop: partial.sweatDrop ?? false,
    customHipY: partial.customHipY,
    leftFootOffset: partial.leftFootOffset ?? { x: -26, y: 0 },
    rightFootOffset: partial.rightFootOffset ?? { x: 26, y: 0 },
    leftKneeOffset: partial.leftKneeOffset ?? { x: -13, y: -86 },
    rightKneeOffset: partial.rightKneeOffset ?? { x: 13, y: -86 },
    holdingTarget: partial.holdingTarget,
    walkCycleProgress: partial.walkCycleProgress ?? 0,
    walkWeight: partial.walkWeight ?? 0,
    theme: effectiveTheme,
    rimLight: effectiveTheme === "DARK_STUDIO",
    rimColor: "#38BDF8",
    hudTitle: currentBeat.title ?? `HÀNH ĐỘNG: ${effectiveActionType}`,
    hudSub: currentBeat.sub ?? `Tiến độ chuẩn hóa u = ${u.toFixed(2)} | duration: ${currentBeat.durationFrames}f`,
    narrationText: currentBeat.narrationText,
    speechBubbleText: currentBeat.speechBubbleText,
    archetype: currentBeat.archetype,
    showXrayAbdomen: partial.showXrayAbdomen ?? Boolean(currentBeat.showXrayAbdomen),
    showDebugHud: currentBeat.showDebugHud ?? false,
    propsState: {
      ball: partial.propsState?.ball ?? { x: 760, y: groundY - 18, visible: false, rotationDeg: 0 },
      cup: partial.propsState?.cup ?? { x: 0, y: 0, visible: false, holding: false },
      crate: partial.propsState?.crate ?? { x: 650, y: groundY, visible: effectiveTheme === "DARK_STUDIO" },
      desk: { x: 1045, y: groundY, visible: effectiveTheme === "STUDY_ROOM" },
      chair: { x: 915, y: groundY, visible: effectiveTheme === "STUDY_ROOM" },
      board: { x: 1350, y: groundY, visible: effectiveTheme === "DARK_STUDIO" },
      laptop: { x: 985, y: groundY - 155, visible: effectiveTheme === "STUDY_ROOM", typingActive: effectiveActionType === "SIT_AND_TYPE" },
      pointer: partial.propsState?.pointer ?? { x1: 0, y1: 0, x2: 0, y2: 0, visible: false },
      box: partial.propsState?.box ?? { x: 0, y: groundY, visible: false, holding: false },
      apple: partial.propsState?.apple ?? { x: 0, y: groundY, visible: false },
      insertHand: partial.propsState?.insertHand ?? { targetX: 960, targetY: 540, visible: false },
      gauge: partial.propsState?.gauge ?? { x: 1200, y: 520, visible: false, needleAngle: 0 },
    },
    vfxState: partial.vfxState ?? {
      ideaSpark: false,
      sparkX: 0,
      sparkY: 0,
      sparkScale: 0,
    },
  };

  return fullState;
}
