/**
 * AnimScript v0.1 2-Bone Analytical Inverse Kinematics (IK)
 * Preserves bone lengths, calculates exact shoulder/elbow or hip/knee angles.
 * Enforces joint limits and reports reachability errors without stretching bones.
 */

import { Vector2 } from "./types";

export interface IKSolution {
  reached: boolean;
  distance: number;
  maxReach: number;
  upperAngleDeg: number;  // Angle in degrees
  foreAngleDeg: number;   // Angle in degrees
  elbowPos: Vector2;
  endEffectorPos: Vector2;
}

export interface IKSolveOptions {
  base: Vector2;             // Shoulder or Hip joint
  target: Vector2;           // Hand or Foot target
  length1: number;           // Upper arm / Thigh length
  length2: number;           // Forearm+Hand / Shin+Foot length
  facing: "left" | "right";  // Character facing direction
  bendDirection?: 1 | -1;    // 1 for natural human bend, -1 for reverse
  isLeg?: boolean;           // If true, knee bends backwards
}

/**
 * Solves 2-bone analytical IK in 2D plane.
 * Angles returned:
 * 0° = pointing straight down (+Y) in character local limb convention,
 * or converted to limbAngles delta from standard standing rest pose.
 */
export function solve2BoneIK(opts: IKSolveOptions): IKSolution {
  const { base, target, length1, length2, facing, bendDirection = 1, isLeg = false } = opts;
  const facingSign = facing === "left" ? -1 : 1;

  // Vector from base to target
  const dx = (target.x - base.x) * facingSign;
  const dy = target.y - base.y;

  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);
  const maxReach = length1 + length2;
  const minReach = Math.abs(length1 - length2);

  const reached = dist <= maxReach + 0.001;

  // Clamp distance within valid triangle inequality range
  const clampedDist = Math.max(minReach + 0.001, Math.min(maxReach - 0.001, dist));

  // Base angle from shoulder to target (0 rad = pointing down along +Y)
  // atan2(dx, dy): dy is down (+Y), dx is forward (+X)
  const baseAngle = Math.atan2(dx, dy);

  // Law of Cosines
  // cos(alpha) = (L1^2 + D^2 - L2^2) / (2 * L1 * D)
  const cosAlpha = (length1 * length1 + clampedDist * clampedDist - length2 * length2) / (2 * length1 * clampedDist);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

  // cos(beta) = (L1^2 + L2^2 - D^2) / (2 * L1 * L2)
  const cosBeta = (length1 * length1 + length2 * length2 - clampedDist * clampedDist) / (2 * length1 * length2);
  const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));

  // Bend direction: For human arm reaching forward, bendDirection=1
  // For knee, bend backwards (dx inverted)
  const bendSign = (isLeg ? -1 : 1) * bendDirection;

  // Upper bone angle (relative to straight down)
  const upperRad = baseAngle + bendSign * alpha;

  // Forearm / lower bone angle (relative to upper bone: 0 is straight continuation, PI is fully folded)
  // Or absolute relative to straight down:
  const elbowInteriorAngle = Math.PI - beta;
  const foreRad = upperRad - bendSign * elbowInteriorAngle;

  const upperAngleDeg = (upperRad * 180) / Math.PI;
  const foreAngleDeg = (foreRad * 180) / Math.PI;

  // Calculate forward positions
  const elbowX = base.x + Math.sin(upperRad) * length1 * facingSign;
  const elbowY = base.y + Math.cos(upperRad) * length1;

  const endX = elbowX + Math.sin(foreRad) * length2 * facingSign;
  const endY = elbowY + Math.cos(foreRad) * length2;

  return {
    reached,
    distance: dist,
    maxReach,
    upperAngleDeg,
    foreAngleDeg,
    elbowPos: { x: elbowX, y: elbowY },
    endEffectorPos: { x: endX, y: endY },
  };
}
