/**
 * AnimScript v0.1 Asset & Rig Registry
 * Strongly typed registry for props, character rigs, anchors, and interaction slots.
 */

import { Vector2, CharacterPose } from "../types";

export interface PropAnchorDef {
  name: string;
  // Offset relative to the prop pivot point
  calcOffset: (w: number, h: number) => Vector2;
}

export interface PropAssetDef {
  type: string;
  defaultWidth: number;
  defaultHeight: number;
  // Pivot point relative to bounding box top-left (0,0)
  pivot: (w: number, h: number) => Vector2;
  anchors: Record<string, (w: number, h: number) => Vector2>;
  occlusionTags?: string[];
}

export interface CharacterBoneLengths {
  headRadius: number;
  neckLength: number;
  torsoLength: number;
  pelvicHalfWidth: number;
  shoulderHalfWidth: number;
  upperArmLength: number;
  forearmLength: number;
  handLength: number;
  thighLength: number;
  shinLength: number;
  footLength: number;
}

export interface JointLimits {
  minDeg: number;
  maxDeg: number;
}

export interface CharacterRigDef {
  type: string;
  defaultHeight: number;
  getBones: (height: number) => CharacterBoneLengths;
  jointLimits: Record<string, JointLimits>;
}

// ============================================================================
// STANDARD PROP ASSET DEFINITIONS
// ============================================================================

export const PROP_REGISTRY: Record<string, PropAssetDef> = {
  desk: {
    type: "desk",
    defaultWidth: 800,
    defaultHeight: 450,
    pivot: (w, h) => ({ x: w / 2, y: h }), // Bottom-center
    anchors: {
      "surface": (w, h) => ({ x: 0, y: -h * 0.65 }),
      "surface.center": (w, h) => ({ x: 0, y: -h * 0.65 }),
      "surface.left": (w, h) => ({ x: -w * 0.35, y: -h * 0.65 }),
      "surface.right": (w, h) => ({ x: w * 0.35, y: -h * 0.65 }),
      "seat": (w, h) => ({ x: 0, y: -h * 0.45 }),
      "approach.left": (w, h) => ({ x: -w * 0.55, y: 0 }),
      "approach.right": (w, h) => ({ x: w * 0.55, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
    occlusionTags: ["surface", "deskBehind"],
  },

  chair: {
    type: "chair",
    defaultWidth: 240,
    defaultHeight: 400,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "seat": (w, h) => ({ x: 0, y: -h * 0.45 }),
      "backrest": (w, h) => ({ x: -w * 0.35, y: -h * 0.85 }),
      "approach.left": (w, h) => ({ x: -w * 0.6, y: 0 }),
      "approach.right": (w, h) => ({ x: w * 0.6, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
  },

  cup: {
    type: "cup",
    defaultWidth: 60,
    defaultHeight: 90,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "grip": (w, h) => ({ x: w * 0.45, y: -h * 0.45 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
  },

  jar: {
    type: "jar",
    defaultWidth: 140,
    defaultHeight: 200,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "label_slot": (w, h) => ({ x: 0, y: -h * 0.5 }),
      "grip": (w, h) => ({ x: 0, y: -h * 0.5 }),
      "opening": (w, h) => ({ x: 0, y: -h * 0.85 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
  },

  laptop: {
    type: "laptop",
    defaultWidth: 180,
    defaultHeight: 110,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "keyboard": (w, h) => ({ x: 0, y: -h * 0.15 }),
      "screen": (w, h) => ({ x: 0, y: -h * 0.7 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
  },

  lamp: {
    type: "lamp",
    defaultWidth: 140,
    defaultHeight: 220,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "base": (w, h) => ({ x: 0, y: 0 }),
      "bulb": (w, h) => ({ x: w * 0.25, y: -h * 0.8 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
  },

  clock: {
    type: "clock",
    defaultWidth: 260,
    defaultHeight: 260,
    pivot: (w, h) => ({ x: w / 2, y: h / 2 }), // Center pivot
    anchors: {
      "needle": (w, h) => ({ x: 0, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: -h / 2 }),
      "bottommid": (w, h) => ({ x: 0, y: h / 2 }),
      "center": (w, h) => ({ x: 0, y: 0 }),
    },
  },

  metabolic_clock: {
    type: "metabolic_clock",
    defaultWidth: 260,
    defaultHeight: 260,
    pivot: (w, h) => ({ x: w / 2, y: h / 2 }),
    anchors: {
      "needle": (w, h) => ({ x: 0, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: -h / 2 }),
      "bottommid": (w, h) => ({ x: 0, y: h / 2 }),
      "center": (w, h) => ({ x: 0, y: 0 }),
    },
  },

  spider: {
    type: "spider",
    defaultWidth: 70,
    defaultHeight: 50,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
    },
  },

  window: {
    type: "window",
    defaultWidth: 400,
    defaultHeight: 320,
    pivot: (w, h) => ({ x: w / 2, y: h / 2 }),
    anchors: {
      "center": (w, h) => ({ x: 0, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: -h / 2 }),
      "bottommid": (w, h) => ({ x: 0, y: h / 2 }),
    },
  },

  meadow: {
    type: "meadow",
    defaultWidth: 1920,
    defaultHeight: 200,
    pivot: (w, h) => ({ x: w / 2, y: 0 }),
    anchors: {
      "surface.left": (w, h) => ({ x: -w * 0.4, y: 0 }),
      "surface.center": (w, h) => ({ x: 0, y: 0 }),
      "surface.right": (w, h) => ({ x: w * 0.4, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: 0 }),
      "bottommid": (w, h) => ({ x: 0, y: h }),
      "center": (w, h) => ({ x: 0, y: h / 2 }),
    },
  },

  tray: {
    type: "tray",
    defaultWidth: 240,
    defaultHeight: 40,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "surface": (w, h) => ({ x: 0, y: -h * 0.5 }),
      "surface.center": (w, h) => ({ x: 0, y: -h * 0.5 }),
      "surface.left": (w, h) => ({ x: -w * 0.3, y: -h * 0.5 }),
      "surface.right": (w, h) => ({ x: w * 0.3, y: -h * 0.5 }),
      "grip.left": (w, h) => ({ x: -w * 0.45, y: -h * 0.5 }),
      "grip.right": (w, h) => ({ x: w * 0.45, y: -h * 0.5 }),
      "grip": (w, h) => ({ x: 0, y: -h * 0.5 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
    occlusionTags: ["surface"],
  },

  apple: {
    type: "apple",
    defaultWidth: 40,
    defaultHeight: 40,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "grip": (w, h) => ({ x: 0, y: -h * 0.5 }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
  },

  cardboard_box: {
    type: "cardboard_box",
    defaultWidth: 160,
    defaultHeight: 135,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "grip": (w, h) => ({ x: 0, y: -h * 0.45 }),
      "grip.left": (w, h) => ({ x: -w * 0.46, y: -h * 0.42 }),
      "grip.right": (w, h) => ({ x: w * 0.46, y: -h * 0.42 }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
  },

  box: {
    type: "box",
    defaultWidth: 160,
    defaultHeight: 135,
    pivot: (w, h) => ({ x: w / 2, y: h }),
    anchors: {
      "grip": (w, h) => ({ x: 0, y: -h * 0.45 }),
      "grip.left": (w, h) => ({ x: -w * 0.46, y: -h * 0.42 }),
      "grip.right": (w, h) => ({ x: w * 0.46, y: -h * 0.42 }),
      "bottommid": (w, h) => ({ x: 0, y: 0 }),
      "topmid": (w, h) => ({ x: 0, y: -h }),
      "center": (w, h) => ({ x: 0, y: -h / 2 }),
    },
  },
};

// ============================================================================
// CHARACTER RIG DEFINITION (HUMANOID)
// ============================================================================

export function getHumanoidBones(height: number): CharacterBoneLengths {
  const scale = height / 600;
  return {
    headRadius: 54 * scale,
    neckLength: 12 * scale,
    torsoLength: 155 * scale,
    pelvicHalfWidth: 0,
    shoulderHalfWidth: 0,
    upperArmLength: 70 * scale,
    forearmLength: 65 * scale,
    handLength: 0,
    thighLength: 90 * scale,
    shinLength: 85 * scale,
    footLength: 0,
  };
}

export const HUMANOID_RIG: CharacterRigDef = {
  type: "human",
  defaultHeight: 600,
  getBones: getHumanoidBones,
  jointLimits: {
    leftShoulder: { minDeg: -180, maxDeg: 180 },
    rightShoulder: { minDeg: -180, maxDeg: 180 },
    leftElbow: { minDeg: -150, maxDeg: 150 },
    rightElbow: { minDeg: -150, maxDeg: 150 },
    leftHip: { minDeg: -120, maxDeg: 120 },
    rightHip: { minDeg: -120, maxDeg: 120 },
    leftKnee: { minDeg: -140, maxDeg: 140 },
    rightKnee: { minDeg: -140, maxDeg: 140 },
    neck: { minDeg: -40, maxDeg: 40 },
  },
};

/**
 * Tính toán vị trí các điểm neo và khớp trên Character dựa trên chiều cao và pose hiện tại.
 */
export function calculateCharacterAnchors(
  rootX: number,
  rootY: number,
  height: number,
  facing: "left" | "right",
  pose?: CharacterPose
): Record<string, Vector2> {
  const bones = getHumanoidBones(height);
  const facingDir = facing === "left" ? -1 : 1;

  const isSitting = Boolean(pose?.isSitting);
  const standingLegLength = bones.thighLength + bones.shinLength; // 310 px for h=600
  let hipY: number;
  if (pose?.sittingHipY !== undefined) {
    const sittingRatio = Math.max(0, Math.min(1, (pose.sittingHipY - (-350)) / 130));
    hipY = rootY - standingLegLength + sittingRatio * (standingLegLength - 180);
  } else {
    hipY = isSitting ? rootY - 180 : rootY - standingLegLength;
  }
  if (pose?.crouchDepth) {
    hipY += pose.crouchDepth;
  }

  const spineTiltRad = ((pose?.headTilt ?? 0) * Math.PI) / 180;
  const neckX = rootX - Math.sin(spineTiltRad) * bones.torsoLength * facingDir;
  const neckY = hipY - Math.cos(spineTiltRad) * bones.torsoLength;

  const headCenterX = neckX - Math.sin(spineTiltRad) * (bones.neckLength + bones.headRadius) * facingDir;
  const headCenterY = neckY - Math.cos(spineTiltRad) * (bones.neckLength + bones.headRadius);
  const headTopY = headCenterY - bones.headRadius;

  // Điểm neo vai nằm sát 2 bên đỉnh thân, gần chỗ nối cổ với thân (neck + 4px theo hệ trục thân)
  const neckDownX = Math.sin(spineTiltRad) * 4 * facingDir;
  const neckDownY = Math.cos(spineTiltRad) * 4;
  const cosTilt = Math.cos(spineTiltRad);
  const sinTilt = Math.sin(spineTiltRad);

  const leftShoulderX = neckX + neckDownX - cosTilt * bones.shoulderHalfWidth * facingDir;
  const leftShoulderY = neckY + neckDownY - sinTilt * bones.shoulderHalfWidth;
  const rightShoulderX = neckX + neckDownX + cosTilt * bones.shoulderHalfWidth * facingDir;
  const rightShoulderY = neckY + neckDownY + sinTilt * bones.shoulderHalfWidth;
  const shoulderY = (leftShoulderY + rightShoulderY) / 2;

  const leftHipX = rootX - bones.pelvicHalfWidth * facingDir;
  const rightHipX = rootX + bones.pelvicHalfWidth * facingDir;

  // Lấy góc tay từ pose theo quy ước SVG: góc âm vươn về phía trước, góc dương lùi về sau
  const rUAngle = ((pose?.limbAngles?.rightUpperArm ?? (isSitting ? -38 : -18)) * Math.PI) / 180;
  let rFAngle = rUAngle;
  if (pose?.limbAngles?.rightForearm !== undefined) {
    rFAngle = (pose.limbAngles.rightForearm * Math.PI) / 180;
  } else if (pose?.limbAngles?.rightLowerArm !== undefined) {
    rFAngle = (((pose?.limbAngles?.rightUpperArm ?? 0) + pose.limbAngles.rightLowerArm) * Math.PI) / 180;
  } else {
    rFAngle = ((isSitting ? -82 : -34) * Math.PI) / 180;
  }

  const lUAngle = ((pose?.limbAngles?.leftUpperArm ?? (isSitting ? -34 : -14)) * Math.PI) / 180;
  let lFAngle = lUAngle;
  if (pose?.limbAngles?.leftForearm !== undefined) {
    lFAngle = (pose.limbAngles.leftForearm * Math.PI) / 180;
  } else if (pose?.limbAngles?.leftLowerArm !== undefined) {
    lFAngle = (((pose?.limbAngles?.leftUpperArm ?? 0) + pose.limbAngles.leftLowerArm) * Math.PI) / 180;
  } else {
    lFAngle = ((isSitting ? -82 : -26) * Math.PI) / 180;
  }

  // Tính vị trí khuỷu, cổ tay và bàn tay phải (đồng nhất 100% với StickmanRig)
  const rightElbow = {
    x: rightShoulderX - Math.sin(rUAngle) * bones.upperArmLength * facingDir,
    y: shoulderY + Math.cos(rUAngle) * bones.upperArmLength,
  };
  const rightWrist = {
    x: rightElbow.x - Math.sin(rFAngle) * bones.forearmLength * facingDir,
    y: rightElbow.y + Math.cos(rFAngle) * bones.forearmLength,
  };
  const rightHand = {
    x: rightWrist.x - Math.sin(rFAngle) * bones.handLength * facingDir,
    y: rightWrist.y + Math.cos(rFAngle) * bones.handLength,
  };

  // Tính vị trí khuỷu, cổ tay và bàn tay trái
  const leftElbow = {
    x: leftShoulderX - Math.sin(lUAngle) * bones.upperArmLength * facingDir,
    y: shoulderY + Math.cos(lUAngle) * bones.upperArmLength,
  };
  const leftWrist = {
    x: leftElbow.x - Math.sin(lFAngle) * bones.forearmLength * facingDir,
    y: leftElbow.y + Math.cos(lFAngle) * bones.forearmLength,
  };
  const leftHand = {
    x: leftWrist.x - Math.sin(lFAngle) * bones.handLength * facingDir,
    y: leftWrist.y + Math.cos(lFAngle) * bones.handLength,
  };

  // Vị trí đầu gối và bàn chân
  const leftThighRad = ((pose?.limbAngles?.leftThigh ?? (isSitting ? -85 : 0)) * Math.PI) / 180;
  let leftShinWorldRad = leftThighRad;
  if (pose?.limbAngles?.leftShin !== undefined) {
    leftShinWorldRad = (pose.limbAngles.leftShin * Math.PI) / 180;
  } else if (pose?.limbAngles?.leftCalf !== undefined) {
    leftShinWorldRad = (((pose?.limbAngles?.leftThigh ?? 0) + pose.limbAngles.leftCalf) * Math.PI) / 180;
  } else {
    leftShinWorldRad = (isSitting ? 0 : 0);
  }

  const rightThighRad = ((pose?.limbAngles?.rightThigh ?? (isSitting ? -88 : 0)) * Math.PI) / 180;
  let rightShinWorldRad = rightThighRad;
  if (pose?.limbAngles?.rightShin !== undefined) {
    rightShinWorldRad = (pose.limbAngles.rightShin * Math.PI) / 180;
  } else if (pose?.limbAngles?.rightCalf !== undefined) {
    rightShinWorldRad = (((pose?.limbAngles?.rightThigh ?? 0) + pose.limbAngles.rightCalf) * Math.PI) / 180;
  } else {
    rightShinWorldRad = (isSitting ? 0 : 0);
  }

  const leftKnee = {
    x: leftHipX - Math.sin(leftThighRad) * bones.thighLength * facingDir,
    y: hipY + Math.cos(leftThighRad) * bones.thighLength,
  };
  const rightKnee = {
    x: rightHipX - Math.sin(rightThighRad) * bones.thighLength * facingDir,
    y: hipY + Math.cos(rightThighRad) * bones.thighLength,
  };

  const leftFoot = pose?.feet?.left ?? (isSitting ? { x: leftKnee.x, y: rootY } : {
    x: leftKnee.x - Math.sin(leftShinWorldRad) * bones.shinLength * facingDir,
    y: leftKnee.y + Math.cos(leftShinWorldRad) * bones.shinLength,
  });
  const rightFoot = pose?.feet?.right ?? (isSitting ? { x: rightKnee.x, y: rootY } : {
    x: rightKnee.x - Math.sin(rightShinWorldRad) * bones.shinLength * facingDir,
    y: rightKnee.y + Math.cos(rightShinWorldRad) * bones.shinLength,
  });

  return {
    topmid: { x: rootX, y: headTopY },
    bottommid: { x: rootX, y: rootY },
    center: { x: rootX, y: (headTopY + rootY) / 2 },
    face: { x: rootX, y: headCenterY },
    eyes: { x: rootX + 12 * facingDir, y: headCenterY - 4 },
    mouth: { x: rootX + 14 * facingDir, y: headCenterY + 12 },
    "head.topmid": { x: rootX, y: headTopY },
    "head.center": { x: rootX, y: headCenterY },
    "head.bottommid": { x: rootX, y: headCenterY + bones.headRadius },
    neck: { x: rootX, y: neckY },
    torso: { x: rootX, y: (neckY + hipY) / 2 },
    pelvis: { x: rootX, y: hipY },
    left_shoulder: { x: leftShoulderX, y: shoulderY },
    right_shoulder: { x: rightShoulderX, y: shoulderY },
    left_elbow: leftElbow,
    right_elbow: rightElbow,
    left_wrist: leftWrist,
    right_wrist: rightWrist,
    left_hand: leftHand,
    right_hand: rightHand,
    left_hip: { x: leftHipX, y: hipY },
    right_hip: { x: rightHipX, y: hipY },
    left_knee: leftKnee,
    right_knee: rightKnee,
    left_ankle: leftFoot,
    right_ankle: rightFoot,
    left_foot: leftFoot,
    right_foot: rightFoot,
  };
}
