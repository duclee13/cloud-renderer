import type { CharacterArchetype, CharacterPreset } from "../components/character/StickmanArchetypes";

export type { CharacterPreset };

export type StickmanPoseType =
  | "standing"
  | "sittingBehindDesk"
  | "holdingObject"
  | "walking"
  | "running"
  | "jumping"
  | "crouching"
  | "pointing"
  | "shrugging"
  | "waving";

export type EyeExpression =
  | "neutral"
  | "wide"
  | "surprised"
  | "happy"
  | "closed"
  | "curious";

export type EyebrowExpression =
  | "neutral"
  | "raised"
  | "inquisitive"
  | "worried"
  | "furrowed";

export type MouthExpression =
  | "smile"
  | "circleOpen"
  | "line"
  | "talking"
  | "gasp";

export interface Point2D {
  x: number;
  y: number;
}

export interface StickmanAnchors {
  headCenter: Point2D;
  mouth: Point2D;
  neck: Point2D;
  hip: Point2D;
  leftShoulder: Point2D;
  rightShoulder: Point2D;
  leftElbow: Point2D;
  rightElbow: Point2D;
  leftWrist: Point2D;
  rightWrist: Point2D;
  leftHand: Point2D;
  rightHand: Point2D;
  leftHip: Point2D;
  rightHip: Point2D;
  leftKnee: Point2D;
  rightKnee: Point2D;
  leftFoot: Point2D;
  rightFoot: Point2D;
  root?: Point2D;
}

export interface LimbAngleOverrides {
  leftUpperArm?: number;
  leftLowerArm?: number;
  leftHand?: number;
  rightUpperArm?: number;
  rightLowerArm?: number;
  rightHand?: number;
  leftThigh?: number;
  leftCalf?: number;
  leftFoot?: number;
  rightThigh?: number;
  rightCalf?: number;
  rightFoot?: number;
  head?: number;
  torso?: number;
}

export interface StickmanState {
  visible?: boolean;
  x: number;
  y: number;
  slot?: string; // Semantic slot e.g. "floor.center", "desk.seat"
  scale?: number;
  rotation?: number;
  facing?: "left" | "right";
  facingFactor?: number; // Continuous facing [-1, 1] (+1 right, 0 front, -1 left)
  pose: StickmanPoseType;
  eyes?: EyeExpression;
  eyebrows?: EyebrowExpression;
  mouth?: MouthExpression;
  pupilGaze?: Point2D; // -1 to +1 relative offset
  blush?: boolean;
  sweatDrop?: boolean;
  holdingTarget?: {
    leftGrip?: Point2D;
    rightGrip?: Point2D;
  };
  pointingTarget?: Point2D;
  walkCycleProgress?: number; // 0 to 1 for continuous walk
  walkWeight?: number; // 0 (standing flat) to 1 (full stride) for smooth deceleration
  limbAngles?: LimbAngleOverrides;
  isSpeaking?: boolean; // True only when character is actually talking (not voiceover)
  typingProgress?: number; // 0 to 1 for typing micro-animation
  seatedHipY?: number; // Custom seated hip height
  hat?: boolean; // Mũ rơm vàng theo phong cách One Piece / Video Cua
  archetype?: CharacterArchetype; // Modular Character Archetypes (Storytime 2D)
  /** V14.0: 5 Preset Người Que Thuần chuẩn kể chuyện đời sống (không viền sáng rỗng ruột, nét đen 6px đặc) */
  characterPreset?: CharacterPreset;
  /** Độ dày nét thân/tay/chân tùy chỉnh (mặc định 6px khi dùng characterPreset, 12px cho legacy) */
  limbStrokeWidth?: number;
  showDebugMarkers?: boolean; // Hiển thị khung xương và điểm neo kỹ thuật
  crouchDepth?: number; // Hạ thấp hông khi cúi/nhún nhảy (0 - 65px)
  torsoTiltDeg?: number; // Nghiêng trục thân quanh khớp hông (độ, e.g. 15 chạy, 45-52 cúi nhặt)
  flightLift?: number; // Chiều cao bay bổng trên không khi nhảy/chạy
  leftFootOffset?: Point2D; // Tọa độ tương đối bàn chân trái bảo toàn L=175px
  rightFootOffset?: Point2D; // Tọa độ tương đối bàn chân phải bảo toàn L=175px
  leftKneeOffset?: Point2D; // Tọa độ tương đối đầu gối trái (Forward Kinematics sinh học)
  rightKneeOffset?: Point2D; // Tọa độ tương đối đầu gối phải (Forward Kinematics sinh học)
  customHipY?: number; // Độ cao hông tự động khóa theo chân trụ chạm đất
  rimLight?: boolean; // Viền sáng tương phản nổi bật trên nền tối (Rim Light / Dark Theme)
  rimColor?: string; // Màu viền sáng (mặc định #38BDF8 cyan)
  shiver?: boolean; // V11.3: Trạng thái sợ hãi / run rẩy truyện tranh (sway êm 1.4px + Comic Shiver Lines)
  shiverDarkStage?: boolean; // V11.3: Nền tối dùng nét trắng/xám sáng (#F1F5F9), nền sáng dùng nét xám đậm (#334155)
  shiverFrame?: number; // V11.3: Frame điều khiển nhịp sway êm & đảo cụm nét run mỗi 8 frames
  /** V14.1: Vẫy tay liên tục 60fps (cánh tay trên -115°, cẳng tay -150° + sin(frame*0.28)*28°), hoạt động kể cả khi đang đi bộ */
  waveRightArm?: boolean;
  waveLeftArm?: boolean;
  wavePhaseOffset?: number;
  /** V14.1: Gật gù đầu mượt 60fps (Math.sin(frame * nodFreq) * nodAmplitudeDeg) */
  nodAmplitudeDeg?: number;
  nodFreq?: number;
  /** V14.1: Bật nhịp thở nhẹ & chớp mắt tự nhiên mỗi 3 giây (mặc định true cho characterPreset) */
  enableIdleLife?: boolean;
  /** V18.0: Tư thế đứng chống hông quan sát tự nhiên (thay dáng squat lơ lửng của SIT_OBSERVE cũ) */
  handsOnHips?: boolean;
  /** V18.0: Hệ số xoay ngang mượt cho TURN_AROUND (mặc định 1.0; thu hẹp về 0.18 khi quay người) */
  turnScaleX?: number;
  /** V18.0: Tư thế 60fps chi tiết từ Keyframe Action Timeline (18+ ActionPoseV18) */
  v18ActionPose?: string;
  v18SegmentProgress?: number;
  v18LocalFrame?: number;
  /** V18.2: Ánh mắt có hồn — dịch chuyển đồng tử + đốm sáng trong phạm vi -4px..+4px (hệ trục cục bộ: dx>0 nhìn tới trước, dy>0 nhìn xuống) */
  lookOffset?: { dx: number; dy: number };
  /** V18.2: Góc nghiêng đầu theo ánh nhìn/mục tiêu (độ) */
  headTiltDeg?: number;
  /** V18.2: Nén dọc nhún lấy đà trước khi bật nhảy (VD: 0.92 trong 4 frames đầu của JUMP_BACK / ARMS_UP_CHEER) */
  anticipationScaleY?: number;
  /** V18.2: Seed cố định theo nhân vật cho chu kỳ chớp mắt tự nhiên 2.8–3.6s (6 frames) không bị nhảy khi di chuyển */
  blinkSeed?: number;
  /** V18.2: Khớp tay đã nội suy mượt 10 frames giữa 2 keyframe liền kề (vẫn qua enforceRigidTwoBoneIK để khóa cứng xương 65/58px) */
  blendedArmPose?: {
    leftElbow: Point2D;
    leftWrist: Point2D;
    rightElbow: Point2D;
    rightWrist: Point2D;
    allowNearHead?: boolean;
  };
}

export interface PropAnchorPorts {
  leftGrip: Point2D;
  rightGrip: Point2D;
  surfaceDecal: Point2D;
  lidCenter?: Point2D;
  baseCenter?: Point2D;
}
