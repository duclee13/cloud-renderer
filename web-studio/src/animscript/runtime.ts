/**
 * AnimScript v0.1 Runtime Evaluator
 * Pure deterministic frame evaluator: evaluateFrame(ir, frame, fps) => EvaluatedFrameState
 * Frame-order independent, 0 side effects, strictly math & physics driven.
 */

import {
  AnimScriptIR,
  SceneIR,
  EvaluatedFrameState,
  EvaluatedObjectState,
  EvaluatedCameraState,
  CharacterPose,
  Vector2,
  ActionClipIR,
} from "./types";
import {
  PROP_REGISTRY,
  HUMANOID_RIG,
  calculateCharacterAnchors,
} from "./registry/assetRegistry";
import { solve2BoneIK } from "./ik";
import { resolveLegAntiMerging, cosineSmooth, quinticSmooth } from "./motionGraph";

// Smooth ease-in-out easing function
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

export function evaluateFrame(
  ir: AnimScriptIR,
  frame: number,
  fps = 60
): EvaluatedFrameState {
  // 1. Identify active scene
  let activeScene: SceneIR = ir.scenes[0];
  for (const sc of ir.scenes) {
    if (frame >= sc.startFrame && frame < sc.startFrame + sc.durationFrames) {
      activeScene = sc;
      break;
    }
  }

  if (!activeScene) {
    activeScene = ir.scenes[ir.scenes.length - 1] || {
      id: "empty",
      name: "Empty",
      startFrame: 0,
      durationFrames: 60,
      objects: {},
      actionClips: [],
      cameraKeyframes: [],
      subtitles: [],
      speechBubbles: [],
      propLabels: [],
    };
  }

  const sceneFrame = frame - activeScene.startFrame;

  // 2. Initialize object states from scene definitions
  const evaluatedObjects: Record<string, EvaluatedObjectState> = {};
  for (const [id, obj] of Object.entries(activeScene.objects)) {
    evaluatedObjects[id] = {
      id: obj.id,
      name: obj.name,
      kind: obj.kind,
      assetType: obj.assetType,
      transform: { ...obj.initialTransform },
      pose: obj.initialPose
        ? {
            ...obj.initialPose,
            limbAngles: { ...obj.initialPose.limbAngles },
            heldObjects: { ...obj.initialPose.heldObjects },
          }
        : undefined,
      props: { ...obj.props },
      layerSplits: {
        behindDesk: false,
        handsFront: false,
      },
    };
  }

  // 3. Process action clips in deterministic order up to sceneFrame
  // Sort clips by startFrame
  const sortedClips = [...activeScene.actionClips].sort(
    (a, b) => a.startFrame - b.startFrame
  );

  for (const clip of sortedClips) {
    applyActionClip(clip, sceneFrame, evaluatedObjects, activeScene);
  }

  // 3b. Synchronize held objects with holding character's hand
  for (const obj of Object.values(evaluatedObjects)) {
    if (obj.props?.isFrozen) {
      obj.transform.x = obj.props.frozenX;
      obj.transform.y = obj.props.frozenY;
    }
    if (obj.kind === "character" && obj.pose?.heldObjects) {
      const anchors = calculateCharacterAnchors(
        obj.transform.x,
        obj.transform.y,
        obj.props?.height || 600,
        obj.pose.facing,
        obj.pose
      );
      if (obj.pose.heldObjects.rightHand) {
        const held = evaluatedObjects[obj.pose.heldObjects.rightHand];
        if (held && !held.props?.isFrozen) {
          const hand = anchors.right_hand;
          const propDef = PROP_REGISTRY[held.assetType];
          const w = held.props?.width || propDef?.defaultWidth || 100;
          const h = held.props?.height || propDef?.defaultHeight || 100;
          const g = propDef?.anchors?.grip ? propDef.anchors.grip(w, h) : { x: 0, y: 0 };
          held.transform.x = hand.x - g.x;
          held.transform.y = hand.y - g.y;
        }
      }
      if (obj.pose.heldObjects.leftHand) {
        const held = evaluatedObjects[obj.pose.heldObjects.leftHand];
        if (held && !held.props?.isFrozen) {
          const hand = anchors.left_hand;
          const propDef = PROP_REGISTRY[held.assetType];
          const w = held.props?.width || propDef?.defaultWidth || 100;
          const h = held.props?.height || propDef?.defaultHeight || 100;
          const g = propDef?.anchors?.grip ? propDef.anchors.grip(w, h) : { x: 0, y: 0 };
          held.transform.x = hand.x - g.x;
          held.transform.y = hand.y - g.y;
        }
      }
      if (obj.pose.heldObjects.bothHands) {
        const held = evaluatedObjects[obj.pose.heldObjects.bothHands];
        if (held) {
          const midHandX = (anchors.left_hand.x + anchors.right_hand.x) / 2;
          const midHandY = (anchors.left_hand.y + anchors.right_hand.y) / 2;
          const propDef = PROP_REGISTRY[held.assetType];
          const w = held.props?.width || propDef?.defaultWidth || 100;
          const h = held.props?.height || propDef?.defaultHeight || 100;
          const g = propDef?.anchors?.grip ? propDef.anchors.grip(w, h) : { x: 0, y: -h / 2 };
          held.transform.x = midHandX - g.x;
          held.transform.y = midHandY - g.y;
          if (held.props?.isFrozen) delete held.props.isFrozen;
        }
      }
    }
  }

  // 3c. Synchronize supported objects (e.g. apple on moving tray)
  for (const obj of Object.values(evaluatedObjects)) {
    if (obj.kind === "prop" && obj.props?.supportedBy) {
      // Check if this object is currently held by any character
      let isHeld = false;
      for (const char of Object.values(evaluatedObjects)) {
        if (char.kind === "character" && char.pose?.heldObjects) {
          if (
            char.pose.heldObjects.rightHand === obj.id ||
            char.pose.heldObjects.leftHand === obj.id ||
            char.pose.heldObjects.bothHands === obj.id
          ) {
            isHeld = true;
            break;
          }
        }
      }
      if (isHeld) {
        // Carried by character hands; do not snap back to previous furniture support
        continue;
      }

      const parent = evaluatedObjects[obj.props.supportedBy];
      if (parent) {
        const parentDef = PROP_REGISTRY[parent.assetType];
        const pw = parent.props?.width || parentDef?.defaultWidth || 100;
        const ph = parent.props?.height || parentDef?.defaultHeight || 100;
        const anchorName = obj.props.supportAnchor || "surface";
        const surf = parentDef?.anchors[anchorName]
          ? parentDef.anchors[anchorName](pw, ph)
          : (parentDef?.anchors["surface"]
              ? parentDef.anchors["surface"](pw, ph)
              : { x: 0, y: -ph * 0.65 });
        const offsetX = obj.props.supportOffsetX || 0;
        obj.transform.x = parent.transform.x + surf.x + offsetX;
        obj.transform.y = parent.transform.y + surf.y;
        if (obj.props?.isFrozen) delete obj.props.isFrozen;
      }
    }
  }

  // 4. Evaluate Camera
  const cameraState: EvaluatedCameraState = evaluateCamera(
    activeScene.cameraKeyframes,
    sceneFrame,
    ir.video.width,
    ir.video.height
  );

  // 5. Evaluate Subtitles, Speech Bubbles, and Prop Labels
  const activeSubtitles = activeScene.subtitles.filter(
    (s) => sceneFrame >= s.startFrame && sceneFrame < s.startFrame + s.durationFrames
  );

  const activeSpeechBubbles = activeScene.speechBubbles.filter(
    (b) => sceneFrame >= b.startFrame && sceneFrame < b.startFrame + b.durationFrames
  );

  // If character is speaking in active speech bubble, animate mouth
  for (const bubble of activeSpeechBubbles) {
    const char = evaluatedObjects[bubble.characterId];
    if (char && char.pose) {
      // Mouth flap frequency ~4Hz
      const mouthCycle = Math.sin((sceneFrame / 60) * Math.PI * 8);
      char.pose.mouthOpen = mouthCycle > 0;
    }
  }

  const activePropLabels = activeScene.propLabels.filter(
    (l) => sceneFrame >= l.startFrame
  );

  return {
    frame,
    sceneId: activeScene.id,
    sceneName: activeScene.name,
    camera: cameraState,
    objects: evaluatedObjects,
    activeSubtitles,
    activeSpeechBubbles,
    activePropLabels,
  };
}

function applyActionClip(
  clip: ActionClipIR,
  sceneFrame: number,
  objects: Record<string, EvaluatedObjectState>,
  scene: SceneIR
): void {
  const { action, startFrame, durationFrames, endFrame, params, targetId } = clip;

  // Progress 0..1 clamped
  const rawProgress = (sceneFrame - startFrame) / Math.max(1, durationFrames);
  const progress = clamp01(rawProgress);
  const isStarted = sceneFrame >= startFrame;

  if (!isStarted) return;

  const targetObj = objects[targetId.split(".")[0]];
  if (!targetObj) return;

  const easedProgress = easeInOut(progress);

  switch (action) {
    case "walk": {
      const fromX = params.fromX ?? targetObj.transform.x;
      let toX = params.to ? (Array.isArray(params.to) ? params.to[0] : params.to) : fromX;
      if (typeof toX !== "number") toX = fromX + 300;

      // Coordinate root translation
      targetObj.transform.x = fromX + (toX - fromX) * progress;
      if (targetObj.pose) {
        targetObj.pose.x = targetObj.transform.x;
        targetObj.pose.facing = toX >= fromX ? "right" : "left";

        const bones = HUMANOID_RIG.getBones(targetObj.props?.height || 600);
        const facingDir = targetObj.pose.facing === "left" ? -1 : 1;
        const groundY = targetObj.props?.groundY ?? targetObj.transform.y;

        const hasNextClip = scene.actionClips.some(
          (c) => c !== clip && c.targetId === targetId && sceneFrame >= c.startFrame - 2 && c.startFrame >= startFrame
        );

        // If completed clip and no subsequent clip follows, restore idle stand pose
        if (sceneFrame >= endFrame && !hasNextClip) {
          targetObj.pose.limbAngles = {
            leftThigh: -6,
            leftShin: 0,
            rightThigh: 8,
            rightShin: 0,
            leftUpperArm: targetObj.pose.heldObjects?.leftHand ? -35 : -14,
            leftForearm: targetObj.pose.heldObjects?.leftHand ? -75 : -26,
            rightUpperArm: targetObj.pose.heldObjects?.rightHand ? -35 : -18,
            rightForearm: targetObj.pose.heldObjects?.rightHand ? -75 : -34,
          };
          targetObj.pose.feet = {
            left: { x: targetObj.transform.x - bones.pelvicHalfWidth * facingDir, y: groundY },
            right: { x: targetObj.transform.x + bones.pelvicHalfWidth * facingDir, y: groundY },
          };
          break;
        }

        // Stride cycles (each stride ~24 frames)
        const strides = (durationFrames / 60) * 2; // ~2 strides per second
        const phase = progress * strides * Math.PI * 2;

        const leftThigh = Math.sin(phase) * 26;
        const leftShin = Math.max(0, -Math.sin(phase) * 32);
        const rightThigh = -Math.sin(phase) * 26;
        const rightShin = Math.max(0, Math.sin(phase) * 32);

        // Ground lock / vertical bounce
        const groundBounce = -Math.abs(Math.sin(phase)) * 6;
        targetObj.transform.y = groundY + groundBounce;

        // Arm swing (preserved if holding object!)
        const rightArmHeld = Boolean(targetObj.pose.heldObjects?.rightHand || targetObj.pose.heldObjects?.bothHands);
        const leftArmHeld = Boolean(targetObj.pose.heldObjects?.leftHand || targetObj.pose.heldObjects?.bothHands);

        const rightArmAngle = rightArmHeld ? -35 : -18 - Math.sin(phase) * 20;
        const rightForeAngle = rightArmHeld ? -75 : -34 - Math.sin(phase) * 20;
        const leftArmAngle = leftArmHeld ? -35 : -14 + Math.sin(phase) * 20;
        const leftForeAngle = leftArmHeld ? -75 : -26 + Math.sin(phase) * 20;

        targetObj.pose.limbAngles = {
          leftThigh,
          leftShin,
          rightThigh,
          rightShin,
          rightUpperArm: rightArmAngle,
          rightForearm: rightForeAngle,
          leftUpperArm: leftArmAngle,
          leftForearm: leftForeAngle,
        };

        // Contact / Stance foot kinematics:
        // Symmetrical dynamic foot placement relative to current character position (eliminates stuck foot bug)
        const footStride = Math.sin(phase) * 30 * facingDir;
        const rawLeft = { x: -bones.pelvicHalfWidth * facingDir - footStride, y: 0 };
        const rawRight = { x: bones.pelvicHalfWidth * facingDir + footStride, y: 0 };
        const resolvedFeet = resolveLegAntiMerging(rawLeft, rawRight, phase, 1.0, 30);
        targetObj.pose.feet = {
          left: { x: targetObj.transform.x + resolvedFeet.left.x, y: groundY + resolvedFeet.left.y },
          right: { x: targetObj.transform.x + resolvedFeet.right.x, y: groundY + resolvedFeet.right.y },
        };
      }
      break;
    }

    case "run": {
      const fromX = params.fromX ?? targetObj.transform.x;
      let toX = params.to ? (Array.isArray(params.to) ? params.to[0] : params.to) : fromX;
      if (typeof toX !== "number") toX = fromX + 450;

      // Coordinate root translation
      targetObj.transform.x = fromX + (toX - fromX) * progress;
      if (targetObj.pose) {
        targetObj.pose.x = targetObj.transform.x;
        targetObj.pose.facing = toX >= fromX ? "right" : "left";

        const bones = HUMANOID_RIG.getBones(targetObj.props?.height || 600);
        const facingDir = targetObj.pose.facing === "left" ? -1 : 1;
        const groundY = targetObj.props?.groundY ?? targetObj.transform.y;

        const hasNextClip = scene.actionClips.some(
          (c) => c !== clip && c.targetId === targetId && sceneFrame >= c.startFrame - 2 && c.startFrame >= startFrame
        );

        if (sceneFrame >= endFrame && !hasNextClip) {
          targetObj.transform.y = groundY;
          targetObj.pose.headTilt = 0;
          targetObj.pose.limbAngles = {
            leftThigh: -6,
            leftShin: 0,
            rightThigh: 8,
            rightShin: 0,
            leftUpperArm: targetObj.pose.heldObjects?.leftHand ? -35 : -14,
            leftForearm: targetObj.pose.heldObjects?.leftHand ? -75 : -26,
            rightUpperArm: targetObj.pose.heldObjects?.rightHand ? -35 : -18,
            rightForearm: targetObj.pose.heldObjects?.rightHand ? -75 : -34,
          };
          targetObj.pose.feet = {
            left: { x: targetObj.transform.x - bones.pelvicHalfWidth * facingDir, y: groundY },
            right: { x: targetObj.transform.x + bones.pelvicHalfWidth * facingDir, y: groundY },
          };
          break;
        }

        // Run cadence: faster ~3.5 strides/s
        const strides = (durationFrames / 60) * 3.5;
        const phase = progress * strides * Math.PI * 2;

        // Forward torso lean during running
        targetObj.pose.headTilt = 16 * facingDir;

        // High knee drive and leg articulation
        const leftThigh = Math.sin(phase) * 44;
        const leftShin = Math.max(0, -Math.sin(phase) * 55);
        const rightThigh = -Math.sin(phase) * 44;
        const rightShin = Math.max(0, Math.sin(phase) * 55);

        // Flight phase: root lifts ~12px in air during double float
        const flightLift = Math.abs(Math.cos(phase * 2)) * 12;
        targetObj.transform.y = groundY - flightLift;

        // Dynamic arm pumping
        const rightArmHeld = Boolean(targetObj.pose.heldObjects?.rightHand || targetObj.pose.heldObjects?.bothHands);
        const leftArmHeld = Boolean(targetObj.pose.heldObjects?.leftHand || targetObj.pose.heldObjects?.bothHands);

        const rightArmAngle = rightArmHeld ? -35 : -18 - Math.sin(phase) * 42;
        const rightForeAngle = rightArmHeld ? -75 : -(65 + Math.abs(Math.sin(phase)) * 25);
        const leftArmAngle = leftArmHeld ? -35 : -14 + Math.sin(phase) * 42;
        const leftForeAngle = leftArmHeld ? -75 : -(65 + Math.abs(Math.sin(phase)) * 25);

        targetObj.pose.limbAngles = {
          leftThigh,
          leftShin,
          rightThigh,
          rightShin,
          rightUpperArm: rightArmAngle,
          rightForearm: rightForeAngle,
          leftUpperArm: leftArmAngle,
          leftForearm: leftForeAngle,
        };

        targetObj.pose.feet = {
          left: { x: targetObj.transform.x - bones.pelvicHalfWidth * facingDir + Math.sin(phase) * 45 * facingDir, y: groundY },
          right: { x: targetObj.transform.x + bones.pelvicHalfWidth * facingDir - Math.sin(phase) * 45 * facingDir, y: groundY },
        };
      }
      break;
    }

    case "jump": {
      const fromX = params.fromX ?? targetObj.transform.x;
      let toX = params.to ? (Array.isArray(params.to) ? params.to[0] : params.to) : fromX;
      if (typeof toX !== "number") toX = fromX + 200;

      const groundY = targetObj.props?.groundY ?? targetObj.transform.y;
      const jumpHeight = params.height ?? 150;

      if (sceneFrame >= endFrame) {
        targetObj.transform.x = toX;
        targetObj.transform.y = groundY;
        if (targetObj.pose) {
          targetObj.pose.x = toX;
          targetObj.pose.y = groundY;
          targetObj.pose.headTilt = 0;
          targetObj.pose.limbAngles = {
            leftThigh: -6, leftShin: 0, rightThigh: 8, rightShin: 0,
            leftUpperArm: -14, leftForearm: -26, rightUpperArm: -18, rightForearm: -34
          };
          const bones = HUMANOID_RIG.getBones(targetObj.props?.height || 600);
          const facingDir = targetObj.pose.facing === "left" ? -1 : 1;
          targetObj.pose.feet = {
            left: { x: toX - bones.pelvicHalfWidth * facingDir, y: groundY },
            right: { x: toX + bones.pelvicHalfWidth * facingDir, y: groundY },
          };
        }
        break;
      }

      // Phase 1: Anticipation Crouch (0.0 .. 0.18)
      if (progress < 0.18) {
        const p1 = progress / 0.18;
        const crouch = Math.sin(p1 * Math.PI * 0.5) * 35;
        targetObj.transform.y = groundY + crouch;
        if (targetObj.pose) {
          targetObj.pose.crouchDepth = crouch;
          targetObj.pose.limbAngles = {
            leftThigh: -28 * p1, leftShin: 56 * p1,
            rightThigh: -28 * p1, rightShin: 56 * p1,
            leftUpperArm: -35 * p1, leftForearm: 15 * p1,
            rightUpperArm: -35 * p1, rightForearm: 15 * p1,
          };
        }
      }
      // Phase 2: Explosive Takeoff Thrust (0.18 .. 0.28)
      else if (progress < 0.28) {
        const p2 = (progress - 0.18) / 0.1;
        targetObj.transform.y = groundY + 35 * (1 - p2);
        if (targetObj.pose) {
          targetObj.pose.crouchDepth = 35 * (1 - p2);
          targetObj.pose.limbAngles = {
            leftThigh: -28 * (1 - p2) + (-6) * p2, leftShin: 56 * (1 - p2),
            rightThigh: -28 * (1 - p2) + 8 * p2, rightShin: 56 * (1 - p2),
            leftUpperArm: -35 * (1 - p2) + 35 * p2, leftForearm: 15 * (1 - p2) + 40 * p2,
            rightUpperArm: -35 * (1 - p2) + 35 * p2, rightForearm: 15 * (1 - p2) + 40 * p2,
          };
        }
      }
      // Phase 3: Airborne Parabolic Flight Arc (0.28 .. 0.74)
      else if (progress < 0.74) {
        const tau = (progress - 0.28) / 0.46;
        targetObj.transform.x = fromX + (toX - fromX) * tau;
        // Parabolic trajectory: 4 * tau * (1 - tau)
        const arcY = 4 * tau * (1 - tau) * jumpHeight;
        targetObj.transform.y = groundY - arcY;

        if (targetObj.pose) {
          targetObj.pose.x = targetObj.transform.x;
          targetObj.pose.y = targetObj.transform.y;
          targetObj.pose.crouchDepth = 0;
          // Tucked knees in air (Counter-clockwise thigh, clockwise shin)
          targetObj.pose.limbAngles = {
            leftThigh: -42, leftShin: 85,
            rightThigh: -38, rightShin: 75,
            leftUpperArm: -40, leftForearm: 35,
            rightUpperArm: 40, rightForearm: 35,
          };
        }
      }
      // Phase 4: Landing Cushion Impact Absorption (0.74 .. 0.88)
      else if (progress < 0.88) {
        const p4 = (progress - 0.74) / 0.14;
        targetObj.transform.x = toX;
        const cushion = Math.sin(p4 * Math.PI) * 36 * (1 - p4 * 0.4);
        targetObj.transform.y = groundY + cushion;

        if (targetObj.pose) {
          targetObj.pose.x = toX;
          targetObj.pose.y = targetObj.transform.y;
          targetObj.pose.crouchDepth = cushion;
          targetObj.pose.limbAngles = {
            leftThigh: -32 * Math.sin(p4 * Math.PI), leftShin: 64 * Math.sin(p4 * Math.PI),
            rightThigh: -32 * Math.sin(p4 * Math.PI), rightShin: 64 * Math.sin(p4 * Math.PI),
            leftUpperArm: -15, leftForearm: 10,
            rightUpperArm: 15, rightForearm: 10,
          };
        }
      }
      // Phase 5: Recovery to Upright Stand (0.88 .. 1.0)
      else {
        const p5 = (progress - 0.88) / 0.12;
        targetObj.transform.x = toX;
        targetObj.transform.y = groundY;

        if (targetObj.pose) {
          targetObj.pose.x = toX;
          targetObj.pose.y = groundY;
          targetObj.pose.limbAngles = {
            leftThigh: -6 * p5, leftShin: 0,
            rightThigh: 8 * p5, rightShin: 0,
            leftUpperArm: -14, leftForearm: -26,
            rightUpperArm: -18, rightForearm: -34,
          };
        }
      }
      break;
    }

    case "reach": {
      // 2-bone analytical IK solver
      if (targetObj.kind === "character" && targetObj.pose) {
        const isRight = !targetId.includes("left");
        const bones = HUMANOID_RIG.getBones(targetObj.props?.height || 600);
        let shoulderPos = {
          x: targetObj.transform.x + (isRight ? bones.shoulderHalfWidth : -bones.shoulderHalfWidth),
          y: targetObj.transform.y - (bones.thighLength + bones.shinLength + bones.torsoLength) + 10,
        };

        let targetPos: Vector2 = { x: targetObj.transform.x + 100, y: targetObj.transform.y - 100 };
        if (params.to) {
          if (Array.isArray(params.to)) {
            targetPos = { x: params.to[0], y: params.to[1] };
          } else if (params.to.objectId) {
            const refObj = objects[params.to.objectId];
            if (refObj) {
              const propDef = PROP_REGISTRY[refObj.assetType];
              const offset = propDef?.anchors[params.to.anchorName]?.(
                refObj.props?.width || 100,
                refObj.props?.height || 100
              ) || { x: 0, y: 0 };
              targetPos = { x: refObj.transform.x + offset.x, y: refObj.transform.y + offset.y };
            }
          }
        }

        // Adaptive crouch if target is on or near the floor
        const standingReachLimit = shoulderPos.y + bones.upperArmLength + bones.forearmLength + bones.handLength - 10;
        if (targetPos.y > standingReachLimit) {
          const neededCrouch = Math.min(125, (targetPos.y - standingReachLimit) * 1.15);
          const currentCrouch = neededCrouch * easedProgress;
          targetObj.pose.crouchDepth = currentCrouch;
          const standingLegLength = bones.thighLength + bones.shinLength;
          const cosA = Math.max(-1, Math.min(1, 1 - currentCrouch / standingLegLength));
          const alpha = (Math.acos(cosA) * 180) / Math.PI;
          targetObj.pose.limbAngles = {
            ...targetObj.pose.limbAngles,
            leftThigh: -alpha,
            leftShin: alpha,
            rightThigh: -alpha,
            rightShin: alpha,
          };
          shoulderPos.y += currentCrouch;
        }

        const ikSol = solve2BoneIK({
          base: shoulderPos,
          target: targetPos,
          length1: bones.upperArmLength,
          length2: bones.forearmLength + bones.handLength,
          facing: targetObj.pose.facing,
          bendDirection: 1,
        });

        // In SVG convention: negative angle = forward reach!
        const targetU = -ikSol.upperAngleDeg;
        const targetF = -ikSol.foreAngleDeg;

        const initialU = isRight ? -18 : -14;
        const initialF = isRight ? -34 : -26;

        const currentU = initialU + (targetU - initialU) * easedProgress;
        const currentF = initialF + (targetF - initialF) * easedProgress;

        if (isRight) {
          targetObj.pose.limbAngles = {
            ...targetObj.pose.limbAngles,
            rightUpperArm: currentU,
            rightForearm: currentF,
          };
        } else {
          targetObj.pose.limbAngles = {
            ...targetObj.pose.limbAngles,
            leftUpperArm: currentU,
            leftForearm: currentF,
          };
        }
      }
      break;
    }

    case "grab": {
      const objName = params.object;
      const hand = params.hand || "right";
      const grabbedObj = objects[objName];

      if (targetObj.pose) {
        if (hand === "both") {
          targetObj.pose.heldObjects = { ...targetObj.pose.heldObjects, bothHands: objName };
          targetObj.pose.limbAngles = {
            ...targetObj.pose.limbAngles,
            leftUpperArm: -35,
            leftForearm: -75,
            rightUpperArm: -35,
            rightForearm: -75,
          };
        } else if (hand === "right") {
          targetObj.pose.heldObjects = { ...targetObj.pose.heldObjects, rightHand: objName };
          targetObj.pose.limbAngles = {
            ...targetObj.pose.limbAngles,
            rightUpperArm: -35,
            rightForearm: -75,
          };
        } else {
          targetObj.pose.heldObjects = { ...targetObj.pose.heldObjects, leftHand: objName };
          targetObj.pose.limbAngles = {
            ...targetObj.pose.limbAngles,
            leftUpperArm: -35,
            leftForearm: -75,
          };
        }
      }

      // If contact phase reached (progress >= 0.5), bind object to hand
      if (grabbedObj && progress >= 0.5) {
        if (grabbedObj.props?.supportedBy) {
          delete grabbedObj.props.supportedBy;
          delete grabbedObj.props.supportAnchor;
          delete grabbedObj.props.supportOffsetX;
        }
        if (grabbedObj.props?.isFrozen) {
          delete grabbedObj.props.isFrozen;
          delete grabbedObj.props.frozenX;
          delete grabbedObj.props.frozenY;
        }
        const anchors = calculateCharacterAnchors(
          targetObj.transform.x,
          targetObj.transform.y,
          targetObj.props?.height || 600,
          targetObj.pose?.facing || "right",
          targetObj.pose
        );
        const handPos = hand === "both"
          ? { x: (anchors.left_hand.x + anchors.right_hand.x) / 2, y: (anchors.left_hand.y + anchors.right_hand.y) / 2 }
          : (hand === "right" ? anchors.right_hand : anchors.left_hand);
        const propDef = PROP_REGISTRY[grabbedObj.assetType];
        const w = grabbedObj.props?.width || propDef?.defaultWidth || 100;
        const h = grabbedObj.props?.height || propDef?.defaultHeight || 100;
        const g = propDef?.anchors?.grip ? propDef.anchors.grip(w, h) : { x: 0, y: 0 };
        grabbedObj.transform.x = handPos.x - g.x;
        grabbedObj.transform.y = handPos.y - g.y;
      }
      break;
    }

    case "release": {
      const objName = params.object;
      const hand = params.hand || "right";
      const detachedObj = objects[objName];
      if (detachedObj && targetObj) {
        const anchors = calculateCharacterAnchors(
          targetObj.transform.x,
          targetObj.transform.y,
          targetObj.props?.height || 600,
          targetObj.pose?.facing || "right",
          targetObj.pose
        );
        const handPos = hand === "right" ? anchors.right_hand : anchors.left_hand;
        const propDef = PROP_REGISTRY[detachedObj.assetType];
        const w = detachedObj.props?.width || propDef?.defaultWidth || 100;
        const h = detachedObj.props?.height || propDef?.defaultHeight || 100;
        const g = propDef?.anchors?.grip ? propDef.anchors.grip(w, h) : { x: 0, y: 0 };
        detachedObj.transform.x = handPos.x - g.x;
        detachedObj.transform.y = handPos.y - g.y;
        detachedObj.props = {
          ...detachedObj.props,
          isFrozen: true,
          frozenX: detachedObj.transform.x,
          frozenY: detachedObj.transform.y,
        };
      }
      if (targetObj.pose?.heldObjects) {
        if (hand === "right") delete targetObj.pose.heldObjects.rightHand;
        else delete targetObj.pose.heldObjects.leftHand;
      }
      break;
    }

    case "put_down": {
      const objName = params.object;
      const surfaceAnchor = params.on;
      const putObj = objects[objName];

      if (putObj && surfaceAnchor && surfaceAnchor.objectId) {
        const destObj = objects[surfaceAnchor.objectId];
        if (destObj) {
          const propDef = PROP_REGISTRY[destObj.assetType];
          const offset = propDef?.anchors[surfaceAnchor.anchorName]?.(
            destObj.props?.width || 100,
            destObj.props?.height || 100
          ) || { x: 0, y: 0 };
          const targetX = destObj.transform.x + offset.x;
          const targetY = destObj.transform.y + offset.y;

          // Start position is held hand minus grip
          const anchors = calculateCharacterAnchors(
            targetObj.transform.x,
            targetObj.transform.y,
            targetObj.props?.height || 600,
            targetObj.pose?.facing || "right",
            targetObj.pose
          );
          const isLeft = targetObj.pose?.heldObjects?.leftHand === objName;
          const handPos = isLeft ? anchors.left_hand : anchors.right_hand;
          const putPropDef = PROP_REGISTRY[putObj.assetType];
          const pw = putObj.props?.width || putPropDef?.defaultWidth || 100;
          const ph = putObj.props?.height || putPropDef?.defaultHeight || 100;
          const g = putPropDef?.anchors?.grip ? putPropDef.anchors.grip(pw, ph) : { x: 0, y: 0 };

          const startX = handPos.x - g.x;
          const startY = handPos.y - g.y;

          // Parabolic clearance arc to prevent intersecting table edge
          const arcY = 35 * 4 * easedProgress * (1 - easedProgress);
          putObj.transform.x = startX + (targetX - startX) * easedProgress;
          putObj.transform.y = startY + (targetY - startY) * easedProgress - arcY;

          // Solve IK for arm to smoothly place object onto surface
          const bones = HUMANOID_RIG.getBones(targetObj.props?.height || 600);
          const facingDir = targetObj.pose?.facing === "left" ? -1 : 1;
          const shoulderPos = {
            x: targetObj.transform.x + (isLeft ? -bones.shoulderHalfWidth : bones.shoulderHalfWidth) * facingDir,
            y: targetObj.transform.y - (bones.thighLength + bones.shinLength + bones.torsoLength) + 10,
          };
          const placeTargetPos = {
            x: putObj.transform.x + g.x,
            y: putObj.transform.y + g.y,
          };
          const ikSol = solve2BoneIK({
            base: shoulderPos,
            target: placeTargetPos,
            length1: bones.upperArmLength,
            length2: bones.forearmLength + bones.handLength,
            facing: targetObj.pose?.facing || "right",
            bendDirection: 1,
          });

          if (isLeft) {
            targetObj.pose!.limbAngles = {
              ...targetObj.pose!.limbAngles,
              leftUpperArm: -ikSol.upperAngleDeg,
              leftForearm: -ikSol.foreAngleDeg,
            };
          } else {
            targetObj.pose!.limbAngles = {
              ...targetObj.pose!.limbAngles,
              rightUpperArm: -ikSol.upperAngleDeg,
              rightForearm: -ikSol.foreAngleDeg,
            };
          }

          if (progress >= 0.95) {
            putObj.transform.x = targetX;
            putObj.transform.y = targetY;
            putObj.props = {
              ...putObj.props,
              supportedBy: destObj.id,
              supportAnchor: surfaceAnchor.anchorName,
            };
            if (putObj.props?.isFrozen) {
              delete putObj.props.isFrozen;
              delete putObj.props.frozenX;
              delete putObj.props.frozenY;
            }
            if (targetObj.pose?.heldObjects) {
              delete targetObj.pose.heldObjects.rightHand;
              delete targetObj.pose.heldObjects.leftHand;
              delete targetObj.pose.heldObjects.bothHands;
            }
          } else {
            putObj.props = {
              ...putObj.props,
              isFrozen: true,
              frozenX: putObj.transform.x,
              frozenY: putObj.transform.y,
            };
          }
        }
      }
      break;
    }

    case "pickup": {
      const objName = params.object || (params as any)[0];
      const hand = params.hand || "right";
      const grabbedObj = objects[objName];
      if (!targetObj || !targetObj.pose || !grabbedObj) break;

      const bones = HUMANOID_RIG.getBones(targetObj.props?.height || 600);
      const standingLegLength = bones.thighLength + bones.shinLength; // 310px
      const groundY = targetObj.props?.groundY ?? targetObj.transform.y;
      const facingDir = targetObj.pose.facing === "left" ? -1 : 1;
      const isRight = hand === "right";

      // Calculate prop grip world pos when sitting on floor
      const propDef = PROP_REGISTRY[grabbedObj.assetType];
      const pw = grabbedObj.props?.width || propDef?.defaultWidth || 100;
      const ph = grabbedObj.props?.height || propDef?.defaultHeight || 100;
      const gOffset = propDef?.anchors?.grip ? propDef.anchors.grip(pw, ph) : { x: 0, y: -ph / 2 };
      const floorGripPos: Vector2 = {
        x: grabbedObj.transform.x + gOffset.x,
        y: grabbedObj.transform.y + gOffset.y,
      };

      // 5 PHASES:
      // Phase 1 (0.0 .. 0.35): lower_body & reach (crouch & IK reach to floor cup grip)
      // Phase 2 (0.35 .. 0.45): grasp (contact made, cup remains on floor)
      // Phase 3 (0.45 .. 0.65): lift_clear (LIFT WHILE STILL CROUCHED!)
      // Phase 4 (0.65 .. 0.90): rise_with_object (knees/hips extend, cup follows to waist)
      // Phase 5 (0.90 .. 1.0): settle_holding (upright standing holding cup)

      if (progress < 0.35) {
        // Phase 1: Crouch & Reach
        const p1 = easeInOut(progress / 0.35);
        const crouch = 120 * p1;
        targetObj.pose.crouchDepth = crouch;
        targetObj.pose.headTilt = 20 * p1 * facingDir;
        const cosA = Math.max(-1, Math.min(1, 1 - crouch / standingLegLength));
        const alpha = (Math.acos(cosA) * 180) / Math.PI;

        // Crouch leg angles (hips lower, knees bend forward, feet locked at groundY)
        targetObj.pose.limbAngles = {
          ...targetObj.pose.limbAngles,
          leftThigh: -alpha,
          leftShin: alpha,
          rightThigh: -alpha,
          rightShin: alpha,
        };

        // Cup remains on floor
        grabbedObj.transform.x = floorGripPos.x - gOffset.x;
        grabbedObj.transform.y = groundY;
        grabbedObj.props = {
          ...grabbedObj.props,
          isFrozen: true,
          frozenX: grabbedObj.transform.x,
          frozenY: groundY,
        };

        // Shoulder position lowered by crouch
        const shoulderPos = {
          x: targetObj.transform.x + (isRight ? bones.shoulderHalfWidth : -bones.shoulderHalfWidth) * facingDir,
          y: targetObj.transform.y - (bones.thighLength + bones.shinLength + bones.torsoLength) + 10 + crouch,
        };

        const idleHandPos = {
          x: shoulderPos.x + 15 * facingDir,
          y: shoulderPos.y + bones.upperArmLength + bones.forearmLength,
        };
        const curTarget = {
          x: idleHandPos.x + (floorGripPos.x - idleHandPos.x) * p1,
          y: idleHandPos.y + (floorGripPos.y - idleHandPos.y) * p1,
        };

        const ikSol = solve2BoneIK({
          base: shoulderPos,
          target: curTarget,
          length1: bones.upperArmLength,
          length2: bones.forearmLength + bones.handLength,
          facing: targetObj.pose.facing,
          bendDirection: 1,
        });

        if (isRight) {
          targetObj.pose.limbAngles.rightUpperArm = -ikSol.upperAngleDeg;
          targetObj.pose.limbAngles.rightForearm = -ikSol.foreAngleDeg;
        } else {
          targetObj.pose.limbAngles.leftUpperArm = -ikSol.upperAngleDeg;
          targetObj.pose.limbAngles.leftForearm = -ikSol.foreAngleDeg;
        }
      } else if (progress < 0.45) {
        // Phase 2: Grasp (contact made, cup remains on floor)
        targetObj.pose.crouchDepth = 120;
        targetObj.pose.headTilt = 20 * facingDir;
        const cosA = Math.max(-1, Math.min(1, 1 - 120 / standingLegLength));
        const alpha = (Math.acos(cosA) * 180) / Math.PI;
        targetObj.pose.limbAngles = {
          ...targetObj.pose.limbAngles,
          leftThigh: -alpha,
          leftShin: alpha,
          rightThigh: -alpha,
          rightShin: alpha,
        };

        // Cup strictly on floor during contact/grasp
        grabbedObj.transform.x = floorGripPos.x - gOffset.x;
        grabbedObj.transform.y = groundY;
        grabbedObj.props = {
          ...grabbedObj.props,
          isFrozen: true,
          frozenX: grabbedObj.transform.x,
          frozenY: groundY,
        };
        if (grabbedObj.props?.supportedBy) {
          delete grabbedObj.props.supportedBy;
          delete grabbedObj.props.supportAnchor;
        }

        if (isRight) {
          targetObj.pose.heldObjects = { ...targetObj.pose.heldObjects, rightHand: objName };
        } else {
          targetObj.pose.heldObjects = { ...targetObj.pose.heldObjects, leftHand: objName };
        }

        const shoulderPos = {
          x: targetObj.transform.x + (isRight ? bones.shoulderHalfWidth : -bones.shoulderHalfWidth) * facingDir,
          y: targetObj.transform.y - (bones.thighLength + bones.shinLength + bones.torsoLength) + 10 + 120,
        };
        const ikSol = solve2BoneIK({
          base: shoulderPos,
          target: floorGripPos,
          length1: bones.upperArmLength,
          length2: bones.forearmLength + bones.handLength,
          facing: targetObj.pose.facing,
          bendDirection: 1,
        });
        if (isRight) {
          targetObj.pose.limbAngles.rightUpperArm = -ikSol.upperAngleDeg;
          targetObj.pose.limbAngles.rightForearm = -ikSol.foreAngleDeg;
        } else {
          targetObj.pose.limbAngles.leftUpperArm = -ikSol.upperAngleDeg;
          targetObj.pose.limbAngles.leftForearm = -ikSol.foreAngleDeg;
        }
      } else if (progress < 0.65) {
        // Phase 3: LIFT_CLEAR (CRITICAL REQUIREMENT)
        // Character is STILL CROUCHED (crouchDepth = 110, knees bent)!
        // Arm bends upward, lifting cup 95px off the floor!
        const p3 = easeInOut((progress - 0.45) / 0.2);
        targetObj.pose.crouchDepth = 110;
        targetObj.pose.headTilt = 18 * facingDir;
        const cosA = Math.max(-1, Math.min(1, 1 - 110 / standingLegLength));
        const alpha = (Math.acos(cosA) * 180) / Math.PI;
        targetObj.pose.limbAngles = {
          ...targetObj.pose.limbAngles,
          leftThigh: -alpha,
          leftShin: alpha,
          rightThigh: -alpha,
          rightShin: alpha,
        };

        const shoulderPos = {
          x: targetObj.transform.x + (isRight ? bones.shoulderHalfWidth : -bones.shoulderHalfWidth) * facingDir,
          y: targetObj.transform.y - (bones.thighLength + bones.shinLength + bones.torsoLength) + 10 + 110,
        };

        const liftedHandPos = {
          x: floorGripPos.x,
          y: floorGripPos.y - 95 * p3,
        };

        const ikSol = solve2BoneIK({
          base: shoulderPos,
          target: liftedHandPos,
          length1: bones.upperArmLength,
          length2: bones.forearmLength + bones.handLength,
          facing: targetObj.pose.facing,
          bendDirection: 1,
        });

        if (isRight) {
          targetObj.pose.limbAngles.rightUpperArm = -ikSol.upperAngleDeg;
          targetObj.pose.limbAngles.rightForearm = -ikSol.foreAngleDeg;
        } else {
          targetObj.pose.limbAngles.leftUpperArm = -ikSol.upperAngleDeg;
          targetObj.pose.limbAngles.leftForearm = -ikSol.foreAngleDeg;
        }

        // Cup position lifts off floor continuously
        grabbedObj.transform.x = liftedHandPos.x - gOffset.x;
        grabbedObj.transform.y = groundY - 95 * p3;
        grabbedObj.props = {
          ...grabbedObj.props,
          isFrozen: true,
          frozenX: grabbedObj.transform.x,
          frozenY: grabbedObj.transform.y,
        };
      } else if (progress < 0.90) {
        // Phase 4: Rise with object
        const p4 = easeInOut((progress - 0.65) / 0.25);
        const curCrouch = 110 * (1 - p4);
        targetObj.pose.crouchDepth = curCrouch;
        targetObj.pose.headTilt = 18 * (1 - p4) * facingDir;
        const cosA = Math.max(-1, Math.min(1, 1 - curCrouch / standingLegLength));
        const alpha = (Math.acos(cosA) * 180) / Math.PI;

        // Legs extend smoothly to upright
        targetObj.pose.limbAngles = {
          ...targetObj.pose.limbAngles,
          leftThigh: -alpha * (1 - p4) - 6 * p4,
          leftShin: alpha * (1 - p4),
          rightThigh: -alpha * (1 - p4) + 8 * p4,
          rightShin: alpha * (1 - p4),
        };

        if (isRight) {
          targetObj.pose.limbAngles.rightUpperArm = -25 + (-35 - (-25)) * p4;
          targetObj.pose.limbAngles.rightForearm = -55 + (-75 - (-55)) * p4;
        } else {
          targetObj.pose.limbAngles.leftUpperArm = -25 + (-35 - (-25)) * p4;
          targetObj.pose.limbAngles.leftForearm = -55 + (-75 - (-55)) * p4;
        }

        // Exact waist holding position matching Phase 5
        const uprightAnchors = calculateCharacterAnchors(
          targetObj.transform.x,
          targetObj.transform.y,
          targetObj.props?.height || 600,
          targetObj.pose?.facing || "right",
          {
            ...targetObj.pose,
            crouchDepth: 0,
            limbAngles: {
              ...targetObj.pose.limbAngles,
              rightUpperArm: -35,
              rightForearm: -75,
              leftUpperArm: -35,
              leftForearm: -75,
            },
          }
        );
        const finalHand = isRight ? uprightAnchors.right_hand : uprightAnchors.left_hand;
        const targetHoldX = finalHand.x - gOffset.x;
        const targetHoldY = finalHand.y - gOffset.y;

        const startRiseX = floorGripPos.x - gOffset.x;
        const startRiseY = groundY - 95;
        grabbedObj.transform.x = startRiseX + (targetHoldX - startRiseX) * p4;
        grabbedObj.transform.y = startRiseY + (targetHoldY - startRiseY) * p4;
        grabbedObj.props = {
          ...grabbedObj.props,
          isFrozen: true,
          frozenX: grabbedObj.transform.x,
          frozenY: grabbedObj.transform.y,
        };
      } else {
        // Phase 5: Settle holding
        targetObj.pose.crouchDepth = 0;
        targetObj.pose.headTilt = 0;
        targetObj.pose.limbAngles = {
          ...targetObj.pose.limbAngles,
          leftThigh: -6,
          leftShin: 0,
          rightThigh: 8,
          rightShin: 0,
          rightUpperArm: isRight ? -35 : -18,
          rightForearm: isRight ? -75 : -34,
          leftUpperArm: !isRight ? -35 : -14,
          leftForearm: !isRight ? -75 : -26,
        };
        if (isRight) {
          targetObj.pose.heldObjects = { ...targetObj.pose.heldObjects, rightHand: objName };
        } else {
          targetObj.pose.heldObjects = { ...targetObj.pose.heldObjects, leftHand: objName };
        }
        if (grabbedObj.props?.isFrozen) {
          delete grabbedObj.props.isFrozen;
          delete grabbedObj.props.frozenX;
          delete grabbedObj.props.frozenY;
        }
      }

      targetObj.pose.feet = {
        left: { x: targetObj.transform.x - bones.pelvicHalfWidth * facingDir, y: groundY },
        right: { x: targetObj.transform.x + bones.pelvicHalfWidth * facingDir, y: groundY },
      };
      break;
    }

    case "sit": {
      if (targetObj.kind === "character" && targetObj.pose) {
        targetObj.pose.isSitting = true;
        targetObj.layerSplits = {
          behindDesk: true,
          handsFront: true,
        };

        const bones = HUMANOID_RIG.getBones(targetObj.props?.height || 600);
        const standingLegLength = bones.thighLength + bones.shinLength; // 310

        // Continuous descent: hip lowers from -350 to -220 (StickmanRig maps [-350, -220] to [-standingLegLength, -180])
        const eased = easeInOut(progress);
        targetObj.pose.sittingHipY = -350 + (-220 - (-350)) * eased;

        // Torso leans forward slightly during descent to balance
        targetObj.pose.headTilt = 10 * Math.sin(progress * Math.PI);

        // Legs fold smoothly from standing to sitting
        const leftThigh = 8 + (-85 - 8) * eased;
        const rightThigh = -6 + (-88 - (-6)) * eased;
        const leftCalf = -4 + (85 - (-4)) * eased;
        const rightCalf = 6 + (85 - 6) * eased;

        const cleanAngles = { ...targetObj.pose.limbAngles };
        delete (cleanAngles as any).leftForearm;
        delete (cleanAngles as any).rightForearm;
        delete (cleanAngles as any).leftShin;
        delete (cleanAngles as any).rightShin;

        targetObj.pose.limbAngles = {
          ...cleanAngles,
          leftThigh,
          leftCalf,
          rightThigh,
          rightCalf,
          rightUpperArm: -18 + (-38 - (-18)) * eased,
          rightLowerArm: -16 + (-48 - (-16)) * eased,
          leftUpperArm: -14 + (-34 - (-14)) * eased,
          leftLowerArm: -12 + (-48 - (-12)) * eased,
          leftForearm: undefined,
          rightForearm: undefined,
          leftShin: undefined,
          rightShin: undefined,
        };

        const facingDir = targetObj.pose.facing === "left" ? -1 : 1;
        const groundY = targetObj.props?.groundY ?? targetObj.transform.y;
        targetObj.pose.feet = {
          left: { x: targetObj.transform.x - bones.pelvicHalfWidth * facingDir, y: groundY },
          right: { x: targetObj.transform.x + bones.pelvicHalfWidth * facingDir, y: groundY },
        };
      }
      break;
    }

    case "stand": {
      if (targetObj.kind === "character" && targetObj.pose) {
        const bones = HUMANOID_RIG.getBones(targetObj.props?.height || 600);
        const standingLegLength = bones.thighLength + bones.shinLength; // 310

        const eased = easeInOut(progress);
        // Continuous ascent: hip rises from -220 back to -350
        targetObj.pose.sittingHipY = -220 + (-350 - (-220)) * eased;

        // Torso tilts forward to shift center of mass
        targetObj.pose.headTilt = 12 * Math.sin(progress * Math.PI);

        // Legs extend smoothly from sitting to standing
        const leftThigh = -85 + (8 - (-85)) * eased;
        const rightThigh = -88 + (-6 - (-88)) * eased;
        const leftCalf = 85 + (-4 - 85) * eased;
        const rightCalf = 85 + (6 - 85) * eased;

        const cleanAngles = { ...targetObj.pose.limbAngles };
        delete (cleanAngles as any).leftForearm;
        delete (cleanAngles as any).rightForearm;
        delete (cleanAngles as any).leftShin;
        delete (cleanAngles as any).rightShin;

        targetObj.pose.limbAngles = {
          ...cleanAngles,
          leftThigh,
          leftCalf,
          rightThigh,
          rightCalf,
          rightUpperArm: -38 + (-18 - (-38)) * eased,
          rightLowerArm: -48 + (-16 - (-48)) * eased,
          leftUpperArm: -34 + (-14 - (-34)) * eased,
          leftLowerArm: -48 + (-12 - (-48)) * eased,
          leftForearm: undefined,
          rightForearm: undefined,
          leftShin: undefined,
          rightShin: undefined,
        };

        if (progress >= 0.98) {
          targetObj.pose.isSitting = false;
          targetObj.pose.sittingHipY = -350;
          targetObj.pose.headTilt = 0;
          targetObj.layerSplits = {
            behindDesk: false,
            handsFront: false,
          };
        }

        const facingDir = targetObj.pose.facing === "left" ? -1 : 1;
        const groundY = targetObj.props?.groundY ?? targetObj.transform.y;
        targetObj.pose.feet = {
          left: { x: targetObj.transform.x - bones.pelvicHalfWidth * facingDir, y: groundY },
          right: { x: targetObj.transform.x + bones.pelvicHalfWidth * facingDir, y: groundY },
        };
      }
      break;
    }

    case "look_at": {
      if (targetObj.pose) {
        let tgtX = targetObj.transform.x + 100;
        let tgtY = targetObj.transform.y - 400;
        if (params.target && Array.isArray(params.target)) {
          tgtX = params.target[0];
          tgtY = params.target[1];
        }
        const dx = tgtX - targetObj.transform.x;
        const dy = tgtY - (targetObj.transform.y - 450);
        const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
        targetObj.pose.headTilt = Math.max(-25, Math.min(25, (angle - 90) * 0.3));
        targetObj.pose.eyeGaze = {
          x: Math.max(-1, Math.min(1, dx / 400)),
          y: Math.max(-1, Math.min(1, dy / 400)),
        };
        if (params.eyes) (targetObj.pose as any).eyes = params.eyes;
        if (params.eyebrows) (targetObj.pose as any).eyebrows = params.eyebrows;
      }
      break;
    }

    case "move": {
      // Do not move root character if targeting a sub-part or limb
      if (targetId.includes(".")) {
        break;
      }
      const fromX = params.fromX ?? targetObj.transform.x;
      const fromY = params.fromY ?? targetObj.transform.y;
      const toX = params.to ? (Array.isArray(params.to) ? params.to[0] : params.to) : fromX;
      const toY = params.to ? (Array.isArray(params.to) ? params.to[1] : fromY) : fromY;

      targetObj.transform.x = fromX + (toX - fromX) * easedProgress;
      targetObj.transform.y = fromY + (toY - fromY) * easedProgress;
      if (targetObj.pose) {
        targetObj.pose.x = targetObj.transform.x;
        targetObj.pose.y = targetObj.transform.y;
      }
      break;
    }

    case "rotate": {
      const fromDeg = params.fromDeg ?? targetObj.transform.rotationDeg;
      const toDeg = params.angle ?? fromDeg;
      targetObj.transform.rotationDeg = fromDeg + (toDeg - fromDeg) * easedProgress;
      break;
    }
  }
}

function evaluateCamera(
  keyframes: SceneIR["cameraKeyframes"],
  sceneFrame: number,
  viewW: number,
  viewH: number
): EvaluatedCameraState {
  const defaultCamera: EvaluatedCameraState = { x: viewW / 2, y: viewH / 2, zoom: 1.0 };
  if (!keyframes || keyframes.length === 0) {
    return defaultCamera;
  }

  // If before first keyframe, camera stays at default view
  if (sceneFrame < keyframes[0].frame) {
    return defaultCamera;
  }

  // If only 1 keyframe
  if (keyframes.length === 1) {
    return { x: keyframes[0].x, y: keyframes[0].y, zoom: keyframes[0].zoom };
  }

  // Find surrounding keyframes
  for (let i = 0; i < keyframes.length - 1; i++) {
    const kf1 = keyframes[i];
    const kf2 = keyframes[i + 1];
    if (sceneFrame >= kf1.frame && sceneFrame <= kf2.frame) {
      const t = clamp01((sceneFrame - kf1.frame) / Math.max(1, kf2.frame - kf1.frame));
      const easedT = easeInOut(t);
      return {
        x: kf1.x + (kf2.x - kf1.x) * easedT,
        y: kf1.y + (kf2.y - kf1.y) * easedT,
        zoom: kf1.zoom + (kf2.zoom - kf1.zoom) * easedT,
      };
    }
  }

  const last = keyframes[keyframes.length - 1];
  return { x: last.x, y: last.y, zoom: last.zoom };
}
