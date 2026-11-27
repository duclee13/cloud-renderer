import React from "react";

const INK = "#1E293B";
const EYE_DARK = "#0F172A";
const CHEEK_PINK = "#FDA4AF";
const STROKE_W = 4;
const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

export type CreatureEmotion =
  | "happy"
  | "curious"
  | "surprised"
  | "scared"
  | "sleepy"
  | "proud";

export interface AnimalSpriteBaseProps {
  x: number;
  y: number;
  scale?: number;
  flipX?: boolean;
  frame: number;
  emotion?: CreatureEmotion;
}

/** Smooth 5-frame blink every 110 frames, desynchronized per species via seedOffset */
export function isAnimalBlinking(frame: number, seedOffset = 0): boolean {
  const f = Math.abs(Math.floor(frame + seedOffset)) % 110;
  return f >= 105;
}

export function computeAnimalBreathScaleY(frame: number, seedOffset = 0): number {
  return 1 + 0.015 * Math.sin((frame + seedOffset) * 0.08);
}

/* ============================================================================
 * SHARED STATIC HELPERS (React.memo, pure flat 2D vector geometry)
 * ========================================================================== */

const FlatGroundShadow: React.FC<{ cx?: number; cy?: number; rx: number; ry: number }> = React.memo(
  ({ cx = 0, cy = 4, rx, ry }) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#0F172A" opacity="0.12" stroke="none" />
  )
);
FlatGroundShadow.displayName = "FlatGroundShadow";

const CatForeheadStripes: React.FC<{ color: string }> = React.memo(({ color }) => (
  <path
    d="M -9,-27 Q -7,-21 -6,-17 M 0,-29 L 0,-17 M 9,-27 Q 7,-21 6,-17"
    fill="none"
    stroke={color}
    strokeWidth={3.2}
    strokeLinecap="round"
  />
));
CatForeheadStripes.displayName = "CatForeheadStripes";

const AntCarriedLeafStatic: React.FC = React.memo(() => (
  <g>
    <path
      d="M -46,6 C -34,-26 24,-34 52,-4 C 24,22 -24,24 -46,6 Z"
      fill="#4ADE80"
      stroke={INK}
      strokeWidth={3.5}
    />
    <path
      d="M -44,6 C -20,20 22,18 48,-2 C 26,8 -14,12 -44,6 Z"
      fill="#16A34A"
      opacity="0.35"
      stroke="none"
    />
    <path d="M -38,4 Q 4,-6 44,-4" fill="none" stroke="#15803D" strokeWidth={2.8} />
  </g>
));
AntCarriedLeafStatic.displayName = "AntCarriedLeafStatic";

const LizardDorsalSpotsStatic: React.FC = React.memo(() => (
  <g fill="#16A34A" opacity="0.55" stroke="none">
    <circle cx={-26} cy={-26} r={5.5} />
    <circle cx={-8} cy={-29} r={6.5} />
    <circle cx={12} cy={-26} r={5} />
  </g>
));
LizardDorsalSpotsStatic.displayName = "LizardDorsalSpotsStatic";

const OctopusHeadSpotsStatic: React.FC<{ spotColor: string }> = React.memo(({ spotColor }) => (
  <g fill={spotColor} opacity="0.55" stroke="none">
    <circle cx={-28} cy={-26} r={7} />
    <circle cx={-16} cy={-40} r={4.5} />
    <circle cx={29} cy={-24} r={6} />
  </g>
));
OctopusHeadSpotsStatic.displayName = "OctopusHeadSpotsStatic";

const SharkGillLinesStatic: React.FC = React.memo(() => (
  <g fill="none" stroke="#1E40AF" strokeWidth={2.6} opacity="0.55" strokeLinecap="round">
    <path d="M 8,-44 Q 4,-36 8,-28" />
    <path d="M 0,-43 Q -4,-36 0,-29" />
    <path d="M -8,-42 Q -12,-36 -8,-30" />
  </g>
));
SharkGillLinesStatic.displayName = "SharkGillLinesStatic";

const SharkCuteTeethStatic: React.FC = React.memo(() => (
  <path
    d="M 28,-22 L 33,-15 L 38,-22 L 43,-15 L 48,-22 L 53,-16 L 57,-22"
    fill="#FFFFFF"
    stroke={INK}
    strokeWidth={2.4}
    strokeLinejoin="round"
    strokeLinecap="round"
  />
));
SharkCuteTeethStatic.displayName = "SharkCuteTeethStatic";

/* ============================================================================
 * SHARED CREATURE FACE & EMOTION OVERLAYS (`CreatureFace`)
 *   - Supports "front" (2 eyes + nose/mouth) and "side" (profile eye + cheek + mouth)
 *   - Sparkling eyes (#0F172A + 2 crisp #FFFFFF catchlights), smooth 110f/5f blink
 *   - Pastel rosy cheeks (#FDA4AF, opacity="0.45")
 *   - Counter-flips text glyphs (?, !, zZ) when flipX=true so symbols never mirror!
 * ========================================================================== */

export interface CreatureFaceProps {
  emotion?: CreatureEmotion;
  frame: number;
  blinkSeed?: number;
  flipX?: boolean;
  layout?: "front" | "side";
  mouthStyle?: "cat" | "smile" | "beak" | "none";
  eyeSpread?: number;
  eyeY?: number;
  eyeRadius?: number;
  cheekSpread?: number;
  cheekY?: number;
  mouthY?: number;
  badgeX?: number;
  badgeY?: number;
  parentRotationDeg?: number;
  forceHappyArcEyes?: boolean;
}

const SparkleEye: React.FC<{
  cx: number;
  cy: number;
  r: number;
  shimmerX?: number;
  shimmerY?: number;
}> = ({ cx, cy, r, shimmerX = 0, shimmerY = 0 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={EYE_DARK} stroke="none" />
    <circle
      cx={cx - r * 0.28 + shimmerX}
      cy={cy - r * 0.3 + shimmerY}
      r={Math.max(1.5, r * 0.34)}
      fill="#FFFFFF"
      stroke="none"
    />
    <circle
      cx={cx + r * 0.28 - shimmerX * 0.5}
      cy={cy + r * 0.26 - shimmerY * 0.5}
      r={Math.max(0.9, r * 0.17)}
      fill="#FFFFFF"
      stroke="none"
    />
  </g>
);

export const CreatureEmotionBadge: React.FC<{
  emotion: CreatureEmotion;
  frame: number;
  x: number;
  y: number;
  flipX?: boolean;
  parentRotationDeg?: number;
}> = ({ emotion, frame, x, y, flipX = false, parentRotationDeg = 0 }) => {
  const unflip = flipX ? -1 : 1;
  const uprightRot = Math.abs(parentRotationDeg) > 0.01 ? ` rotate(${(-parentRotationDeg).toFixed(1)})` : "";

  if (emotion === "curious") {
    const bob = Math.sin(frame * 0.14) * 3.5;
    return (
      <g transform={`translate(${x.toFixed(1)}, ${(y + bob).toFixed(1)})${uprightRot} scale(${unflip}, 1)`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fill="#FACC15"
          stroke={INK}
          strokeWidth={4.5}
          paintOrder="stroke"
          fontSize={24}
          fontWeight={900}
          fontFamily={FONT}
        >
          ?
        </text>
      </g>
    );
  }

  if (emotion === "surprised") {
    const pop = 1 + 0.08 * Math.sin(frame * 0.35);
    return (
      <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)})${uprightRot} scale(${(unflip * pop).toFixed(3)}, ${pop.toFixed(3)})`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fill="#FB923C"
          stroke={INK}
          strokeWidth={4.5}
          paintOrder="stroke"
          fontSize={25}
          fontWeight={900}
          fontFamily={FONT}
        >
          !
        </text>
      </g>
    );
  }

  if (emotion === "scared") {
    const slideY = (frame * 0.28) % 9;
    return (
      <g transform={`translate(${x.toFixed(1)}, ${(y + 8 + slideY).toFixed(1)})${uprightRot}`}>
        <path
          d="M 0,-9 C 5,-2 7,3 7,6 A 7,7 0 1,1 -7,6 C -7,3 -5,-2 0,-9 Z"
          fill="#38BDF8"
          stroke={INK}
          strokeWidth={2.4}
        />
        <circle cx={-2} cy={4} r={1.8} fill="#E0F2FE" stroke="none" />
      </g>
    );
  }

  if (emotion === "sleepy") {
    const floatT = (frame * 0.025) % 1;
    const floatT2 = (frame * 0.025 + 0.5) % 1;
    return (
      <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)})${uprightRot} scale(${unflip}, 1)`}>
        <text
          x={0}
          y={(-floatT * 18).toFixed(1)}
          textAnchor="middle"
          fill="#60A5FA"
          stroke={INK}
          strokeWidth={3.5}
          paintOrder="stroke"
          fontSize={16}
          fontWeight={900}
          fontFamily={FONT}
          opacity={(0.35 + 0.65 * Math.sin(floatT * Math.PI)).toFixed(2)}
        >
          z
        </text>
        <text
          x={12}
          y={(-8 - floatT2 * 22).toFixed(1)}
          textAnchor="middle"
          fill="#38BDF8"
          stroke={INK}
          strokeWidth={3.8}
          paintOrder="stroke"
          fontSize={21}
          fontWeight={900}
          fontFamily={FONT}
          opacity={(0.35 + 0.65 * Math.sin(floatT2 * Math.PI)).toFixed(2)}
        >
          Z
        </text>
      </g>
    );
  }

  return null;
};

export const CreatureFace: React.FC<CreatureFaceProps> = ({
  emotion = "happy",
  frame,
  blinkSeed = 17,
  flipX = false,
  layout = "front",
  mouthStyle = "smile",
  eyeSpread = 12,
  eyeY = -5,
  eyeRadius = 5.6,
  cheekSpread = 19,
  cheekY = 4,
  mouthY = 14,
  badgeX = 32,
  badgeY = -28,
  parentRotationDeg = 0,
  forceHappyArcEyes = false,
}) => {
  const blink = isAnimalBlinking(frame, blinkSeed);
  const shimmerX = emotion === "surprised" ? Math.sin(frame * 0.55) * 0.8 : 0;
  const shimmerY = emotion === "surprised" ? Math.cos(frame * 0.45) * 0.8 : 0;
  const effEyeR = emotion === "surprised" ? eyeRadius * 1.2 : emotion === "scared" ? eyeRadius * 1.08 : eyeRadius;

  if (layout === "side") {
    return (
      <g className={`creature-face-side-${emotion}`}>
        {/* Pastel Rosy Cheek */}
        <ellipse
          cx={eyeSpread + 2}
          cy={cheekY}
          rx={eyeRadius * 1.15}
          ry={eyeRadius * 0.68}
          fill={CHEEK_PINK}
          opacity="0.45"
          stroke="none"
        />

        {/* Eyebrow by emotion */}
        {emotion === "curious" && (
          <path
            d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 5} Q ${eyeSpread},${eyeY - effEyeR - 10} ${eyeSpread + effEyeR},${eyeY - effEyeR - 4}`}
            fill="none"
            stroke={INK}
            strokeWidth={2.8}
          />
        )}
        {emotion === "scared" && (
          <path
            d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 2} L ${eyeSpread + effEyeR},${eyeY - effEyeR - 7}`}
            fill="none"
            stroke={INK}
            strokeWidth={2.8}
          />
        )}
        {emotion === "proud" && (
          <path
            d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 5} Q ${eyeSpread},${eyeY - effEyeR - 8} ${eyeSpread + effEyeR},${eyeY - effEyeR - 3}`}
            fill="none"
            stroke={INK}
            strokeWidth={2.8}
          />
        )}

        {/* Eye */}
        {emotion === "sleepy" || blink ? (
          <path
            d={`M ${eyeSpread - effEyeR},${eyeY} Q ${eyeSpread},${eyeY + effEyeR * 0.65} ${eyeSpread + effEyeR},${eyeY}`}
            fill="none"
            stroke={INK}
            strokeWidth={3}
          />
        ) : emotion === "proud" || forceHappyArcEyes ? (
          <path
            d={`M ${eyeSpread - effEyeR},${eyeY + 2} Q ${eyeSpread},${eyeY - effEyeR * 0.9} ${eyeSpread + effEyeR},${eyeY + 2}`}
            fill="none"
            stroke={INK}
            strokeWidth={3.2}
          />
        ) : (
          <SparkleEye cx={eyeSpread} cy={eyeY} r={effEyeR} shimmerX={shimmerX} shimmerY={shimmerY} />
        )}

        {/* Mouth (when not beak/none) */}
        {mouthStyle !== "beak" && mouthStyle !== "none" && (
          <>
            {emotion === "surprised" ? (
              <circle cx={eyeSpread + 6} cy={mouthY} r={3.6} fill="#9F1239" stroke={INK} strokeWidth={2.4} />
            ) : emotion === "scared" ? (
              <path
                d={`M ${eyeSpread - 2},${mouthY + 2} Q ${eyeSpread + 3},${mouthY - 2} ${eyeSpread + 8},${mouthY + 2}`}
                fill="none"
                stroke={INK}
                strokeWidth={2.6}
              />
            ) : emotion === "sleepy" ? (
              <path
                d={`M ${eyeSpread},${mouthY} Q ${eyeSpread + 4},${mouthY + 2} ${eyeSpread + 8},${mouthY}`}
                fill="none"
                stroke={INK}
                strokeWidth={2.4}
              />
            ) : (
              <path
                d={`M ${eyeSpread - 2},${mouthY - 1} Q ${eyeSpread + 5},${mouthY + 6} ${eyeSpread + 11},${mouthY - 1}`}
                fill="none"
                stroke={INK}
                strokeWidth={2.8}
              />
            )}
          </>
        )}

        <CreatureEmotionBadge
          emotion={emotion}
          frame={frame}
          x={badgeX}
          y={badgeY}
          flipX={flipX}
          parentRotationDeg={parentRotationDeg}
        />
      </g>
    );
  }

  // FRONT 2-EYE EXPRESSIVE FACE
  return (
    <g className={`creature-face-front-${emotion}`}>
      {/* Pastel Rosy Cheeks (#FDA4AF, opacity="0.45") */}
      <ellipse
        cx={-cheekSpread}
        cy={cheekY}
        rx={eyeRadius * 1.25}
        ry={eyeRadius * 0.72}
        fill={CHEEK_PINK}
        opacity="0.45"
        stroke="none"
      />
      <ellipse
        cx={cheekSpread}
        cy={cheekY}
        rx={eyeRadius * 1.25}
        ry={eyeRadius * 0.72}
        fill={CHEEK_PINK}
        opacity="0.45"
        stroke="none"
      />

      {/* Emotion Eyebrows */}
      {emotion === "curious" && (
        <g fill="none" stroke={INK} strokeWidth={2.6}>
          <path d={`M ${-eyeSpread - effEyeR},${eyeY - effEyeR - 3} Q ${-eyeSpread},${eyeY - effEyeR - 5} ${-eyeSpread + effEyeR},${eyeY - effEyeR - 3}`} />
          <path d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 6} Q ${eyeSpread},${eyeY - effEyeR - 11} ${eyeSpread + effEyeR},${eyeY - effEyeR - 5}`} />
        </g>
      )}
      {emotion === "surprised" && (
        <g fill="none" stroke={INK} strokeWidth={2.6}>
          <path d={`M ${-eyeSpread - effEyeR},${eyeY - effEyeR - 5} Q ${-eyeSpread},${eyeY - effEyeR - 10} ${-eyeSpread + effEyeR},${eyeY - effEyeR - 5}`} />
          <path d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 5} Q ${eyeSpread},${eyeY - effEyeR - 10} ${eyeSpread + effEyeR},${eyeY - effEyeR - 5}`} />
        </g>
      )}
      {emotion === "scared" && (
        <g fill="none" stroke={INK} strokeWidth={2.8}>
          <line x1={-eyeSpread - effEyeR} y1={eyeY - effEyeR - 2} x2={-eyeSpread + effEyeR} y2={eyeY - effEyeR - 7} />
          <line x1={eyeSpread - effEyeR} y1={eyeY - effEyeR - 7} x2={eyeSpread + effEyeR} y2={eyeY - effEyeR - 2} />
        </g>
      )}
      {emotion === "proud" && (
        <g fill="none" stroke={INK} strokeWidth={2.6}>
          <path d={`M ${-eyeSpread - effEyeR},${eyeY - effEyeR - 4} Q ${-eyeSpread},${eyeY - effEyeR - 8} ${-eyeSpread + effEyeR},${eyeY - effEyeR - 3}`} />
          <path d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 3} Q ${eyeSpread},${eyeY - effEyeR - 8} ${eyeSpread + effEyeR},${eyeY - effEyeR - 4}`} />
        </g>
      )}

      {/* Eyes */}
      {emotion === "sleepy" || blink ? (
        <g fill="none" stroke={INK} strokeWidth={3}>
          <path d={`M ${-eyeSpread - effEyeR},${eyeY} Q ${-eyeSpread},${eyeY + effEyeR * 0.65} ${-eyeSpread + effEyeR},${eyeY}`} />
          <path d={`M ${eyeSpread - effEyeR},${eyeY} Q ${eyeSpread},${eyeY + effEyeR * 0.65} ${eyeSpread + effEyeR},${eyeY}`} />
        </g>
      ) : emotion === "proud" || forceHappyArcEyes ? (
        <g fill="none" stroke={INK} strokeWidth={3.2}>
          <path d={`M ${-eyeSpread - effEyeR},${eyeY + 2} Q ${-eyeSpread},${eyeY - effEyeR * 0.95} ${-eyeSpread + effEyeR},${eyeY + 2}`} />
          <path d={`M ${eyeSpread - effEyeR},${eyeY + 2} Q ${eyeSpread},${eyeY - effEyeR * 0.95} ${eyeSpread + effEyeR},${eyeY + 2}`} />
        </g>
      ) : (
        <g>
          <SparkleEye cx={-eyeSpread} cy={eyeY} r={effEyeR} shimmerX={shimmerX} shimmerY={shimmerY} />
          <SparkleEye cx={eyeSpread} cy={eyeY} r={effEyeR} shimmerX={shimmerX} shimmerY={shimmerY} />
        </g>
      )}

      {/* Mouth */}
      {mouthStyle !== "none" && (
        <>
          {emotion === "surprised" ? (
            <circle cx={0} cy={mouthY + 1} r={4.2} fill="#9F1239" stroke={INK} strokeWidth={2.5} />
          ) : emotion === "scared" ? (
            <path
              d={`M -7,${mouthY + 3} Q -3.5,${mouthY - 1} 0,${mouthY + 3} Q 3.5,${mouthY - 1} 7,${mouthY + 3}`}
              fill="none"
              stroke={INK}
              strokeWidth={2.6}
            />
          ) : emotion === "sleepy" ? (
            <path d={`M -4,${mouthY + 1} Q 0,${mouthY + 3} 4,${mouthY + 1}`} fill="none" stroke={INK} strokeWidth={2.4} />
          ) : mouthStyle === "cat" ? (
            <path
              d={`M -8,${mouthY} Q -4,${mouthY + (emotion === "proud" ? 6.5 : 5)} 0,${mouthY} Q 4,${mouthY + (emotion === "proud" ? 6.5 : 5)} 8,${mouthY}`}
              fill="none"
              stroke={INK}
              strokeWidth={2.8}
            />
          ) : (
            <path
              d={`M -9,${mouthY - 1} Q 0,${mouthY + (emotion === "proud" ? 8 : 6)} 9,${mouthY - 1}`}
              fill="none"
              stroke={INK}
              strokeWidth={2.8}
            />
          )}
        </>
      )}

      <CreatureEmotionBadge
        emotion={emotion}
        frame={frame}
        x={badgeX}
        y={badgeY}
        flipX={flipX}
        parentRotationDeg={parentRotationDeg}
      />
    </g>
  );
};

/* ============================================================================
 * 1. CuteCat — Expressive Cream-Orange (#FDBA74) or Silver-Gray (#E2E8F0) Cat
 *    Poses: "sit" | "stand" | "curl_midair" | "puff_fur"
 *    100% backward-compatible with Episodes 8 & 9 + V23.5 emotion & cel-shading
 * ========================================================================== */

export type CuteCatPose = "sit" | "stand" | "curl_midair" | "puff_fur";

export interface CuteCatProps extends AnimalSpriteBaseProps {
  pose?: CuteCatPose;
  variant?: "orange" | "gray";
  /** Optional Manx/tailless toggle (default true) */
  hasTail?: boolean;
  /** Disable oscillating midair tilt when parent controls exact 180°->0° righting interpolation */
  disableMidairWobble?: boolean;
}

export const CuteCat: React.FC<CuteCatProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "sit",
  variant = "orange",
  emotion,
  hasTail = true,
  disableMidairWobble = false,
}) => {
  const furMain = variant === "gray" ? "#E2E8F0" : "#FDBA74";
  const furLight = variant === "gray" ? "#F8FAFC" : "#FFF7ED";
  const furStripe = variant === "gray" ? "#94A3B8" : "#EA580C";
  const resolvedEmotion: CreatureEmotion = emotion ?? (pose === "puff_fur" ? "surprised" : "happy");
  // Subtle micro-breathing <= 0.012, ZERO whole-body rocking/wobble!
  const breathY = 1 + 0.012 * Math.sin(frame * 0.08);
  const tailWag = Math.sin(frame * 0.09) * (pose === "puff_fur" ? 5 : 13);
  const earTwitch = Math.sin(frame * 0.11) * 2.4;
  const curiousTilt = resolvedEmotion === "curious" ? 6 : 0;
  const midairRot = 0;
  const dir = flipX ? -1 : 1;

  return (
    <g
      id={`animal-cute-cat-${pose}`}
      transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Flat Ground Shadow (omitted when cat is airborne in curl_midair) */}
      {pose !== "curl_midair" && (
        <FlatGroundShadow rx={pose === "stand" || pose === "puff_fur" ? 64 : 52} ry={11} />
      )}

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {pose === "curl_midair" ? (
          /* Midair Righting Reflex Pose (Episode 9) — 100% unified chunky orange paws with white tips matching pose="stand" */
          <g transform="translate(0, -68)">
            {/* Smooth Bézier balancing tail (optional for Manx) */}
            {hasTail && (
              <>
                <path
                  d="M -50,-4 C -78,-18 -92,-48 -72,-74"
                  fill="none"
                  stroke={INK}
                  strokeWidth={14}
                />
                <path
                  d="M -50,-4 C -78,-18 -92,-48 -72,-74"
                  fill="none"
                  stroke={furMain}
                  strokeWidth={7.5}
                />
              </>
            )}
            {/* 4 Chunky Rounded Orange Paws + White Paw Tips (seamless match with pose="stand"!) */}
            <g id="cat-midair-chunky-paws">
              <g transform="translate(-40, 14) rotate(16)">
                <rect x={-8} y={0} width={16} height={42} rx={8} fill={furMain} />
                <ellipse cx={0} cy={38} rx={6.5} ry={4.2} fill={furLight} stroke="none" />
              </g>
              <g transform="translate(-14, 16) rotate(6)">
                <rect x={-8} y={0} width={16} height={40} rx={8} fill={furMain} />
                <ellipse cx={0} cy={36} rx={6.5} ry={4.2} fill={furLight} stroke="none" />
              </g>
              <g transform="translate(20, 16) rotate(-6)">
                <rect x={-8} y={0} width={16} height={40} rx={8} fill={furMain} />
                <ellipse cx={0} cy={36} rx={6.5} ry={4.2} fill={furLight} stroke="none" />
              </g>
              <g transform="translate(40, 14) rotate(-16)">
                <rect x={-8} y={0} width={16} height={42} rx={8} fill={furMain} />
                <ellipse cx={0} cy={38} rx={6.5} ry={4.2} fill={furLight} stroke="none" />
              </g>
            </g>
            {/* Arched airborne torso + cream belly + flat cel-shade */}
            <path
              d="M -56,-6 C -48,-46 38,-48 54,-6 C 60,14 34,26 0,20 C -34,26 -60,14 -56,-6 Z"
              fill={furMain}
            />
            <ellipse cx={0} cy={12} rx={34} ry={11} fill={furLight} stroke="none" />
            <path
              d="M -46,-14 C -24,-36 22,-36 44,-14 C 22,-26 -22,-26 -46,-14 Z"
              fill="#0F172A"
              opacity="0.10"
              stroke="none"
            />
            {/* Expressive Head */}
            <g transform={`translate(56, -24) rotate(${curiousTilt})`}>
              <g transform={`rotate(${(-earTwitch).toFixed(1)}, -16, -24)`}>
                <polygon points="-24,-18 -28,-48 -4,-30" fill={furMain} />
                <polygon points="-20,-22 -22,-38 -9,-28" fill="#FBCFE8" stroke="none" />
              </g>
              <g transform={`rotate(${earTwitch.toFixed(1)}, 16, -24)`}>
                <polygon points="24,-18 28,-48 4,-30" fill={furMain} />
                <polygon points="20,-22 22,-38 9,-28" fill="#FBCFE8" stroke="none" />
              </g>
              <circle cx={0} cy={0} r={30} fill={furMain} />
              <CatForeheadStripes color={furStripe} />
              <ellipse cx={0} cy={10} rx={16} ry={11} fill={furLight} stroke="none" />
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <CreatureFace
                emotion={resolvedEmotion}
                frame={frame}
                blinkSeed={17}
                flipX={flipX}
                mouthStyle="cat"
                eyeSpread={11}
                eyeY={-4}
                eyeRadius={5.2}
                cheekSpread={18}
                cheekY={4}
                mouthY={12}
                badgeX={44}
                badgeY={-34}
                parentRotationDeg={midairRot + curiousTilt}
              />
              <path d="M -22,6 L -38,2 M -22,12 L -38,14 M 22,6 L 38,2 M 22,12 L 38,14" strokeWidth={2.3} />
            </g>
          </g>
        ) : pose === "puff_fur" ? (
          /* Startled Puffed-Up Cat */
          <g>
            <g transform={`translate(-54, -68) rotate(${(-12 + tailWag).toFixed(1)})`}>
              <path d="M 0,0 C -36,-22 -38,-78 -8,-102 C 12,-82 14,-34 10,0 Z" fill={furMain} />
            </g>
            <path
              d="M -56,-34 C -58,-118 -8,-146 28,-134 C 66,-122 68,-64 56,-34 L 44,-34 L 46,0 L 28,0 L 26,-32 L -26,-32 L -28,0 L -46,0 L -44,-34 Z"
              fill={furMain}
            />
            <ellipse cx={0} cy={-56} rx={30} ry={18} fill={furLight} stroke="none" />
            <path
              d="M -48,-40 C -22,-32 22,-32 48,-40 L 40,-33 L -40,-33 Z"
              fill="#0F172A"
              opacity="0.11"
              stroke="none"
            />
            <path
              d="M -46,-84 L -56,-102 L -36,-106 L -34,-128 L -14,-124 L -2,-146 L 14,-132 L 26,-144 L 30,-124"
              fill="none"
              stroke={furStripe}
              strokeWidth={4}
            />
            <g transform={`translate(56, -98) rotate(${curiousTilt})`}>
              <polygon points="-24,-18 -30,-48 -4,-30" fill={furMain} />
              <polygon points="24,-18 30,-48 4,-30" fill={furMain} />
              <polygon points="-20,-22 -24,-39 -9,-28" fill="#FBCFE8" stroke="none" />
              <polygon points="20,-22 24,-39 9,-28" fill="#FBCFE8" stroke="none" />
              <circle cx={0} cy={0} r={32} fill={furMain} />
              <CatForeheadStripes color={furStripe} />
              <ellipse cx={0} cy={11} rx={16} ry={11} fill={furLight} stroke="none" />
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <CreatureFace
                emotion={resolvedEmotion}
                frame={frame}
                blinkSeed={17}
                flipX={flipX}
                mouthStyle="cat"
                eyeSpread={11}
                eyeY={-4}
                eyeRadius={5.8}
                cheekSpread={19}
                cheekY={5}
                mouthY={14}
                badgeX={44}
                badgeY={-36}
                parentRotationDeg={curiousTilt}
              />
              <path d="M -24,6 L -40,2 M -24,12 L -40,15 M 24,6 L 40,2 M 24,12 L 40,15" strokeWidth={2.4} />
            </g>
          </g>
        ) : pose === "stand" ? (
          /* Standing Friendly Cat */
          <g>
            {/* Smooth Bézier swaying tail */}
            <g transform={`translate(-54, -64) rotate(${tailWag.toFixed(1)})`}>
              <path d="M 0,0 C -26,-12 -36,-42 -16,-68" fill="none" stroke={INK} strokeWidth={13} />
              <path d="M 0,0 C -26,-12 -36,-42 -16,-68" fill="none" stroke={furMain} strokeWidth={6.8} />
            </g>
            {/* 4 neat rounded orange legs + small white paw tips (100% matched with curl_midair!) */}
            <g id="cat-stand-chunky-paws">
              <rect x={-44} y={-46} width={16} height={46} rx={8} fill={furMain} />
              <ellipse cx={-36} cy={-4.5} rx={6.5} ry={4} fill={furLight} stroke="none" />
              <rect x={-18} y={-44} width={16} height={44} rx={8} fill={furMain} />
              <ellipse cx={-10} cy={-4.5} rx={6.5} ry={4} fill={furLight} stroke="none" />
              <rect x={16} y={-44} width={16} height={44} rx={8} fill={furMain} />
              <ellipse cx={24} cy={-4.5} rx={6.5} ry={4} fill={furLight} stroke="none" />
              <rect x={34} y={-46} width={16} height={46} rx={8} fill={furMain} />
              <ellipse cx={42} cy={-4.5} rx={6.5} ry={4} fill={furLight} stroke="none" />
            </g>
            {/* Rounded body + cream belly + flat cel-shade */}
            <ellipse cx={0} cy={-58} rx={58} ry={34} fill={furMain} />
            <ellipse cx={6} cy={-48} rx={36} ry={18} fill={furLight} stroke="none" />
            <path
              d="M -52,-46 C -26,-26 24,-26 52,-46 C 24,-34 -24,-34 -52,-46 Z"
              fill="#0F172A"
              opacity="0.11"
              stroke="none"
            />
            {/* Head */}
            <g transform={`translate(52, -96) rotate(${curiousTilt})`}>
              <g transform={`rotate(${(-earTwitch).toFixed(1)}, -15, -24)`}>
                <polygon points="-22,-18 -26,-48 -4,-30" fill={furMain} />
                <polygon points="-18,-22 -21,-38 -8,-28" fill="#FBCFE8" stroke="none" />
              </g>
              <g transform={`rotate(${earTwitch.toFixed(1)}, 15, -24)`}>
                <polygon points="22,-18 26,-48 4,-30" fill={furMain} />
                <polygon points="18,-22 21,-38 8,-28" fill="#FBCFE8" stroke="none" />
              </g>
              <circle cx={0} cy={0} r={32} fill={furMain} />
              <CatForeheadStripes color={furStripe} />
              <ellipse cx={0} cy={11} rx={17} ry={12} fill={furLight} stroke="none" />
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <CreatureFace
                emotion={resolvedEmotion}
                frame={frame}
                blinkSeed={17}
                flipX={flipX}
                mouthStyle="cat"
                eyeSpread={11}
                eyeY={-5}
                eyeRadius={5.4}
                cheekSpread={19}
                cheekY={4}
                mouthY={13}
                badgeX={44}
                badgeY={-36}
                parentRotationDeg={curiousTilt}
              />
              <path d="M -24,6 L -40,2 M -24,12 L -40,14 M 24,6 L 40,2 M 24,12 L 40,14" strokeWidth={2.3} />
            </g>
          </g>
        ) : (
          /* Default Sitting Friendly Cat */
          <g>
            {/* Smooth Bézier curved tail */}
            <g transform={`translate(-38, -24) rotate(${tailWag.toFixed(1)})`}>
              <path d="M 0,0 C -34,-12 -42,-44 -22,-66" fill="none" stroke={INK} strokeWidth={13} />
              <path d="M 0,0 C -34,-12 -42,-44 -22,-66" fill="none" stroke={furMain} strokeWidth={6.8} />
            </g>
            {/* Pear sitting body + bright cream belly + flat cel-shade */}
            <path d="M -42,0 C -46,-54 -28,-92 0,-92 C 28,-92 46,-54 42,0 Z" fill={furMain} />
            <ellipse cx={0} cy={-38} rx={23} ry={31} fill={furLight} stroke="none" />
            <path
              d="M -40,-6 C -38,-46 -26,-78 -12,-88 C -24,-66 -30,-32 -28,-4 Z"
              fill="#0F172A"
              opacity="0.10"
              stroke="none"
            />
            {/* Front neat paws */}
            <ellipse cx={-15} cy={-4} rx={12} ry={8} fill={furLight} />
            <ellipse cx={15} cy={-4} rx={12} ry={8} fill={furLight} />
            {/* Head */}
            <g transform={`translate(0, -112) rotate(${curiousTilt})`}>
              <g transform={`rotate(${(-earTwitch).toFixed(1)}, -16, -24)`}>
                <polygon points="-24,-18 -28,-50 -4,-30" fill={furMain} />
                <polygon points="-20,-22 -23,-39 -8,-28" fill="#FBCFE8" stroke="none" />
              </g>
              <g transform={`rotate(${earTwitch.toFixed(1)}, 16, -24)`}>
                <polygon points="24,-18 28,-50 4,-30" fill={furMain} />
                <polygon points="20,-22 23,-39 8,-28" fill="#FBCFE8" stroke="none" />
              </g>
              <circle cx={0} cy={0} r={34} fill={furMain} />
              <path
                d="M -30,12 C -18,28 18,28 30,12 C 18,32 -18,32 -30,12 Z"
                fill="#0F172A"
                opacity="0.10"
                stroke="none"
              />
              <CatForeheadStripes color={furStripe} />
              <ellipse cx={0} cy={12} rx={18} ry={12} fill={furLight} stroke="none" />
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <CreatureFace
                emotion={resolvedEmotion}
                frame={frame}
                blinkSeed={17}
                flipX={flipX}
                mouthStyle="cat"
                eyeSpread={12}
                eyeY={-5}
                eyeRadius={5.6}
                cheekSpread={20}
                cheekY={5}
                mouthY={14}
                badgeX={46}
                badgeY={-36}
                parentRotationDeg={curiousTilt}
              />
              <path d="M -25,6 L -42,2 M -25,12 L -42,15 M 25,6 L 42,2 M 25,12 L 42,15" strokeWidth={2.3} />
            </g>
          </g>
        )}
      </g>
    </g>
  );
};

/* ============================================================================
 * 2. CuteDog — Expressive Warm Golden-Brown (#F59E0B / #FEF3C7) Cartoon Dog
 *    Poses: "sit" | "stand" | "yawn" | "wag"
 * ========================================================================== */

export type CuteDogPose = "sit" | "stand" | "yawn" | "wag";

export interface CuteDogProps extends AnimalSpriteBaseProps {
  pose?: CuteDogPose;
}

export const CuteDog: React.FC<CuteDogProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "sit",
  emotion,
}) => {
  const resolvedEmotion: CreatureEmotion = emotion ?? (pose === "yawn" ? "sleepy" : "happy");
  const breathY = computeAnimalBreathScaleY(frame, 20);
  const wagFreq = pose === "wag" ? 0.42 : 0.16;
  const wagAmp = pose === "wag" ? 24 : 10;
  const tailDeg = Math.sin(frame * wagFreq) * wagAmp;
  const earSway = Math.sin(frame * 0.12) * 4.5;
  const curiousTilt = resolvedEmotion === "curious" ? 6 : 0;
  const yawnAmt = pose === "yawn" ? 0.55 + 0.45 * Math.sin(frame * 0.14) : 0;
  const dir = flipX ? -1 : 1;
  const isStanding = pose === "stand" || pose === "wag";

  return (
    <g
      id={`animal-cute-dog-${pose}`}
      transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <FlatGroundShadow rx={isStanding ? 68 : 56} ry={12} />

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {/* Smooth Bézier Wagging Tail */}
        <g transform={`translate(${isStanding ? -58 : -44}, ${isStanding ? -68 : -32}) rotate(${tailDeg.toFixed(1)})`}>
          <path d="M 0,0 C -22,-14 -30,-38 -16,-58" fill="none" stroke={INK} strokeWidth={14} />
          <path d="M 0,0 C -22,-14 -30,-38 -16,-58" fill="none" stroke="#D97706" strokeWidth={7.2} />
        </g>

        {isStanding ? (
          <>
            <rect x={-48} y={-48} width={18} height={48} rx={7} fill="#F59E0B" />
            <rect x={-18} y={-46} width={18} height={46} rx={7} fill="#F59E0B" />
            <rect x={16} y={-46} width={18} height={46} rx={7} fill="#F59E0B" />
            <rect x={36} y={-48} width={18} height={48} rx={7} fill="#F59E0B" />
            <ellipse cx={0} cy={-64} rx={62} ry={36} fill="#F59E0B" />
            <ellipse cx={8} cy={-52} rx={38} ry={19} fill="#FEF3C7" stroke="none" />
            <path
              d="M -56,-52 C -26,-30 26,-30 56,-52 C 26,-38 -26,-38 -56,-52 Z"
              fill="#0F172A"
              opacity="0.11"
              stroke="none"
            />
            {/* Red collar + gold tag */}
            <path d="M 28,-86 Q 44,-68 50,-48" fill="none" stroke="#DC2626" strokeWidth={9} />
            <circle cx={46} cy={-48} r={6} fill="#FACC15" strokeWidth={2.4} />
          </>
        ) : (
          <>
            <path d="M -46,0 C -50,-56 -30,-96 0,-96 C 30,-96 50,-56 46,0 Z" fill="#F59E0B" />
            <ellipse cx={0} cy={-38} rx={25} ry={33} fill="#FEF3C7" stroke="none" />
            <path
              d="M -42,-6 C -40,-48 -26,-82 -12,-92 C -26,-68 -32,-34 -30,-4 Z"
              fill="#0F172A"
              opacity="0.11"
              stroke="none"
            />
            <ellipse cx={-16} cy={-4} rx={14} ry={9} fill="#FBBF24" />
            <ellipse cx={16} cy={-4} rx={14} ry={9} fill="#FBBF24" />
            <path d="M -26,-86 Q 0,-74 26,-86" fill="none" stroke="#DC2626" strokeWidth={9} />
            <circle cx={0} cy={-74} r={6} fill="#FACC15" strokeWidth={2.4} />
          </>
        )}

        {/* Expressive Dog Head */}
        <g transform={`translate(${isStanding ? 56 : 0}, ${isStanding ? -102 : -118}) rotate(${curiousTilt})`}>
          {/* Gently swaying floppy brown ears */}
          <ellipse
            cx={-32}
            cy={4}
            rx={13}
            ry={28}
            transform={`rotate(${(14 + earSway).toFixed(1)}, -32, -12)`}
            fill="#92400E"
          />
          <ellipse
            cx={32}
            cy={4}
            rx={13}
            ry={28}
            transform={`rotate(${(-14 - earSway).toFixed(1)}, 32, -12)`}
            fill="#92400E"
          />
          {/* Golden Head + Bright Cream Muzzle */}
          <circle cx={0} cy={0} r={36} fill="#FBBF24" />
          <path
            d="M -32,12 C -18,30 18,30 32,12 C 18,34 -18,34 -32,12 Z"
            fill="#0F172A"
            opacity="0.10"
            stroke="none"
          />
          <ellipse cx={0} cy={13} rx={23} ry={16} fill="#FEF3C7" stroke="none" />
          {/* Cute Round Nose + tiny shine */}
          <ellipse cx={0} cy={4} rx={8} ry={6} fill={INK} stroke="none" />
          <circle cx={-2.5} cy={2.2} r={2} fill="#FFFFFF" opacity="0.7" stroke="none" />

          {/* Shared Face + Special Yawn Mouth */}
          <CreatureFace
            emotion={resolvedEmotion}
            frame={frame}
            blinkSeed={43}
            flipX={flipX}
            mouthStyle={pose === "yawn" ? "none" : "smile"}
            forceHappyArcEyes={pose === "wag" && !emotion}
            eyeSpread={12}
            eyeY={-9}
            eyeRadius={5.6}
            cheekSpread={21}
            cheekY={3}
            mouthY={16}
            badgeX={36}
            badgeY={-32}
          />
          {pose === "yawn" && (
            <g>
              <ellipse cx={0} cy={19} rx={10 + yawnAmt * 4} ry={9 + yawnAmt * 5} fill="#9F1239" strokeWidth={3} />
              <ellipse cx={0} cy={24 + yawnAmt * 2} rx={7} ry={4.5} fill="#FB7185" stroke="none" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

/* ============================================================================
 * 3. CuteBird — Expressive Pastel Blue (#38BDF8) or Yellow (#FDE047) Bird
 *    Poses: "perch" | "fly"
 * ========================================================================== */

export type CuteBirdPose = "perch" | "fly";

export interface CuteBirdProps extends AnimalSpriteBaseProps {
  pose?: CuteBirdPose;
  variant?: "blue" | "yellow";
}

export const CuteBird: React.FC<CuteBirdProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "perch",
  variant = "blue",
  emotion = "happy",
}) => {
  const bodyColor = variant === "yellow" ? "#FDE047" : "#38BDF8";
  const wingColor = variant === "yellow" ? "#F59E0B" : "#0284C7";
  const bellyColor = variant === "yellow" ? "#FEF9C3" : "#E0F2FE";
  const breathY = computeAnimalBreathScaleY(frame, 35);
  const wingDeg = pose === "fly" ? Math.sin(frame * 0.35) * 42 : Math.sin(frame * 0.08) * 3.5;
  const headTilt = (pose === "perch" ? Math.sin(frame * 0.06) * 7 : 0) + (emotion === "curious" ? 6 : 0);
  const flyBobY = pose === "fly" ? Math.sin(frame * 0.18) * 10 : 0;
  const dir = flipX ? -1 : 1;

  return (
    <g
      id={`animal-cute-bird-${pose}`}
      transform={`translate(${x.toFixed(1)}, ${(y + flyBobY).toFixed(1)}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {pose === "perch" && <FlatGroundShadow cy={3} rx={34} ry={7} />}

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {pose === "perch" ? (
          <g stroke="#EA580C" strokeWidth={3.8}>
            <line x1={-10} y1={-24} x2={-10} y2={0} />
            <line x1={10} y1={-24} x2={10} y2={0} />
            <path d="M -18,0 L -2,0 M 2,0 L 18,0" />
          </g>
        ) : (
          <g stroke="#EA580C" strokeWidth={3.4}>
            <line x1={-10} y1={-22} x2={-22} y2={-8} />
            <line x1={6} y1={-22} x2={-6} y2={-8} />
          </g>
        )}

        {/* Tail feathers */}
        <polygon points="-34,-46 -66,-64 -58,-38" fill={wingColor} />

        {/* Back Wing in flight */}
        {pose === "fly" && (
          <g transform={`translate(-4, -56) rotate(${(-24 - wingDeg).toFixed(1)})`}>
            <path d="M 0,0 C -18,-36 -48,-46 -56,-14 C -42,4 -16,8 0,0 Z" fill={wingColor} />
          </g>
        )}

        {/* Plump Pastel Body + Bright Belly + Flat Cel-Shading */}
        <ellipse cx={0} cy={-48} rx={38} ry={30} fill={bodyColor} />
        <ellipse cx={8} cy={-41} rx={23} ry={18} fill={bellyColor} stroke="none" />
        <path
          d="M -34,-34 C -14,-18 18,-18 32,-34 C 14,-24 -14,-24 -34,-34 Z"
          fill="#0F172A"
          opacity="0.11"
          stroke="none"
        />

        {/* Expressive Bird Head */}
        <g transform={`translate(24, -70) rotate(${headTilt.toFixed(1)})`}>
          <circle cx={0} cy={0} r={24} fill={bodyColor} />
          {/* Cute tuft feather on crown */}
          <path d="M -4,-23 Q -10,-34 -1,-31 Q 4,-36 6,-24" fill={bodyColor} strokeWidth={3.2} />
          {/* Neat Orange Beak */}
          <polygon
            points={emotion === "surprised" ? "20,-7 38,-1 20,3" : "20,-5 38,2 20,9"}
            fill="#F97316"
          />
          {emotion === "surprised" && <polygon points="20,3 35,8 20,11" fill="#EA580C" />}
          <CreatureFace
            emotion={emotion}
            frame={frame}
            blinkSeed={71}
            flipX={flipX}
            layout="side"
            mouthStyle="beak"
            eyeSpread={8}
            eyeY={-5}
            eyeRadius={5.2}
            cheekY={5}
            badgeX={26}
            badgeY={-28}
            parentRotationDeg={headTilt}
          />
        </g>

        {/* Front Wing */}
        <g transform={`translate(-4, -48) rotate(${wingDeg.toFixed(1)})`}>
          <path
            d={
              pose === "fly"
                ? "M 0,0 C -12,-38 14,-56 36,-32 C 26,-6 12,4 0,0 Z"
                : "M -18,-6 C -6,-18 18,-10 14,8 C 2,16 -18,10 -18,-6 Z"
            }
            fill={wingColor}
          />
        </g>
      </g>
    </g>
  );
};

/* ============================================================================
 * 4. CuteAnt — Friendly Warm Amber-Brown (#B45309) 3-Segment Cartoon Ant
 *    Poses: "walk" | "carry"
 * ========================================================================== */

export type CuteAntPose = "walk" | "carry";

export interface CuteAntProps extends AnimalSpriteBaseProps {
  pose?: CuteAntPose;
}

export const CuteAnt: React.FC<CuteAntProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "walk",
  emotion = "happy",
}) => {
  const breathY = computeAnimalBreathScaleY(frame, 55);
  const legA = Math.sin(frame * 0.28) * 10;
  const legB = -legA;
  const antSway = Math.sin(frame * 0.22) * 6;
  const curiousTilt = emotion === "curious" ? 6 : 0;
  const dir = flipX ? -1 : 1;

  return (
    <g
      id={`animal-cute-ant-${pose}`}
      transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <FlatGroundShadow cy={3} rx={62} ry={9} />

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {/* 6 Alternating Tripod Legs */}
        <g fill="none" stroke={INK} strokeWidth={3.6}>
          <path d={`M -28,-28 L ${(-44 + legA).toFixed(1)},-12 L ${(-50 + legA).toFixed(1)},0`} />
          <path d={`M -18,-26 L ${(-28 + legB).toFixed(1)},-12 L ${(-32 + legB).toFixed(1)},0`} />
          <path d={`M -2,-26 L ${(-6 + legB).toFixed(1)},-12 L ${(-8 + legB).toFixed(1)},0`} />
          <path d={`M 8,-26 L ${(12 + legA).toFixed(1)},-12 L ${(14 + legA).toFixed(1)},0`} />
          <path d={`M 22,-26 L ${(32 + legA).toFixed(1)},-12 L ${(38 + legA).toFixed(1)},0`} />
          <path d={`M 30,-26 L ${(44 + legB).toFixed(1)},-12 L ${(52 + legB).toFixed(1)},0`} />
        </g>

        {/* 3 Plump Rounded Segments with Flat Highlights & Cel-Shading */}
        {/* Abdomen */}
        <ellipse cx={-38} cy={-38} rx={26} ry={20} fill="#92400E" />
        <ellipse cx={-42} cy={-45} rx={13} ry={5.5} fill="#FDE68A" stroke="none" opacity="0.38" />
        <path
          d="M -60,-32 C -46,-18 -26,-18 -16,-32 C -28,-24 -48,-24 -60,-32 Z"
          fill="#0F172A"
          opacity="0.13"
          stroke="none"
        />
        {/* Thorax */}
        <ellipse cx={2} cy={-34} rx={18} ry={14} fill="#B45309" />
        <ellipse cx={0} cy={-40} rx={9} ry={4} fill="#FDE68A" stroke="none" opacity="0.32" />

        {/* Friendly Big-Eyed Head */}
        <g transform={`translate(38, -44) rotate(${curiousTilt})`}>
          {/* 2 Soft Swaying Antennae with cute round bulbs */}
          <path
            d={`M 6,-20 C ${(14 + antSway * 0.4).toFixed(1)},-36 ${(22 + antSway).toFixed(1)},-42 ${(30 + antSway).toFixed(1)},${(-36 + antSway * 0.4).toFixed(1)}`}
            fill="none"
            strokeWidth={3.2}
          />
          <circle cx={30 + antSway} cy={-36 + antSway * 0.4} r={3.5} fill="#F59E0B" strokeWidth={2.2} />
          <path
            d={`M -6,-20 C ${(-2 - antSway * 0.4).toFixed(1)},-38 ${(6 - antSway).toFixed(1)},-44 ${(14 - antSway).toFixed(1)},${(-40 - antSway * 0.4).toFixed(1)}`}
            fill="none"
            strokeWidth={3.2}
          />
          <circle cx={14 - antSway} cy={-40 - antSway * 0.4} r={3.5} fill="#F59E0B" strokeWidth={2.2} />

          <circle cx={0} cy={0} r={23} fill="#D97706" />
          <ellipse cx={6} cy={8} rx={12} ry={9} fill="#FDE68A" stroke="none" opacity="0.55" />
          <CreatureFace
            emotion={emotion}
            frame={frame}
            blinkSeed={89}
            flipX={flipX}
            layout="side"
            mouthStyle="smile"
            eyeSpread={7}
            eyeY={-5}
            eyeRadius={5.8}
            cheekY={5}
            mouthY={10}
            badgeX={26}
            badgeY={-24}
          />
        </g>

        {/* Overhead Leaf when pose="carry" */}
        {pose === "carry" && (
          <g transform={`translate(24, ${(-88 + Math.sin(frame * 0.2) * 2.5).toFixed(1)}) rotate(-12)`}>
            <AntCarriedLeafStatic />
          </g>
        )}
      </g>
    </g>
  );
};

/* ============================================================================
 * 5. CuteLizard — Friendly Pastel-Green (#4ADE80) + Cream-Yellow (#FEF08A) Gecko
 *    Poses: "stand" | "run" | "climb"
 *    Supports `hasTail?: boolean` (default true) for tail-autotomy episodes!
 * ========================================================================== */

export type CuteLizardPose = "stand" | "run" | "climb";

export interface CuteLizardProps extends AnimalSpriteBaseProps {
  pose?: CuteLizardPose;
  hasTail?: boolean;
}

export const CuteLizard: React.FC<CuteLizardProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "stand",
  hasTail = true,
  emotion = "happy",
}) => {
  const breathY = computeAnimalBreathScaleY(frame, 13);
  const isRunning = pose === "run";
  const isClimbing = pose === "climb";
  const legSwing = Math.sin(frame * (isRunning ? 0.38 : isClimbing ? 0.2 : 0.06)) * (isRunning ? 12 : isClimbing ? 7 : 2);
  const tailWave = Math.sin(frame * 0.14) * 12;
  const runBobY = isRunning ? Math.abs(Math.sin(frame * 0.38)) * -5 : 0;
  const climbRot = isClimbing ? -62 : 0;
  const curiousTilt = emotion === "curious" ? 6 : 0;
  const dir = flipX ? -1 : 1;

  return (
    <g
      id={`animal-cute-lizard-${pose}`}
      transform={`translate(${x.toFixed(1)}, ${(y + runBobY).toFixed(1)}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {!isClimbing && <FlatGroundShadow cy={4} rx={72} ry={10} />}

      <g transform={`rotate(${climbRot}) scale(1, ${breathY.toFixed(4)})`}>
        {/* Detachable Tail vs Healed Cute Stump (`hasTail`) */}
        {hasTail ? (
          <path
            d={`M -44,-20 C -76,-16 -96,${(-32 + tailWave).toFixed(1)} -118,${(-22 - tailWave * 0.6).toFixed(1)} C -98,${(-8 + tailWave * 0.6).toFixed(1)} -74,-4 -42,-8 Z`}
            fill="#4ADE80"
          />
        ) : (
          <g id="lizard-detached-tail-stump">
            <path d="M -42,-22 C -58,-22 -60,-6 -42,-6 Z" fill="#86EFAC" />
            <ellipse cx={-54} cy={-14} rx={4.5} ry={6.5} fill="#FDA4AF" strokeWidth={2.6} />
          </g>
        )}

        {/* Back Legs with cute gecko toe pads */}
        <g fill="#22C55E">
          <path d={`M -26,-12 L ${(-36 - legSwing).toFixed(1)},0`} strokeWidth={8} />
          <circle cx={-38 - legSwing} cy={0} r={5} fill="#86EFAC" strokeWidth={2.5} />
          <path d={`M 20,-12 L ${(28 + legSwing).toFixed(1)},0`} strokeWidth={8} />
          <circle cx={30 + legSwing} cy={0} r={5} fill="#86EFAC" strokeWidth={2.5} />
        </g>

        {/* Plump Pastel Green Body + Cream-Yellow Belly (#FEF08A) + Flat Cel-Shading */}
        <ellipse cx={-4} cy={-20} rx={46} ry={20} fill="#4ADE80" />
        <ellipse cx={2} cy={-12} rx={34} ry={10} fill="#FEF08A" stroke="none" />
        <path
          d="M -44,-14 C -20,-2 16,-2 38,-14 C 16,-6 -18,-6 -44,-14 Z"
          fill="#0F172A"
          opacity="0.11"
          stroke="none"
        />
        <LizardDorsalSpotsStatic />

        {/* Front Legs */}
        <g>
          <path d={`M -16,-10 L ${(-22 + legSwing).toFixed(1)},2`} strokeWidth={8} />
          <circle cx={-23 + legSwing} cy={2} r={5} fill="#86EFAC" strokeWidth={2.5} />
          <path d={`M 26,-10 L ${(36 - legSwing).toFixed(1)},2`} strokeWidth={8} />
          <circle cx={37 - legSwing} cy={2} r={5} fill="#86EFAC" strokeWidth={2.5} />
        </g>

        {/* Friendly Rounded Gecko Head */}
        <g transform={`translate(48, -28) rotate(${curiousTilt})`}>
          <ellipse cx={0} cy={0} rx={28} ry={23} fill="#4ADE80" />
          <path d="M -14,10 Q 6,22 24,8 L 16,18 L -10,16 Z" fill="#FEF08A" stroke="none" />
          <CreatureFace
            emotion={emotion}
            frame={frame}
            blinkSeed={29}
            flipX={flipX}
            layout="side"
            mouthStyle="smile"
            eyeSpread={8}
            eyeY={-6}
            eyeRadius={5.8}
            cheekY={4}
            mouthY={9}
            badgeX={26}
            badgeY={-30}
            parentRotationDeg={climbRot + curiousTilt}
          />
        </g>
      </g>
    </g>
  );
};

/* ============================================================================
 * 6. CuteOctopus — Friendly Coral-Orange (#FB923C) or Pastel-Purple (#C084FC) Octopus
 *    Poses: "float" | "crawl" | "wave"
 * ========================================================================== */

export type CuteOctopusPose = "float" | "crawl" | "wave";

export interface CuteOctopusProps extends AnimalSpriteBaseProps {
  pose?: CuteOctopusPose;
  variant?: "coral" | "purple";
}

export const CuteOctopus: React.FC<CuteOctopusProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "float",
  variant = "coral",
  emotion = "happy",
}) => {
  const mainColor = variant === "purple" ? "#C084FC" : "#FB923C";
  const bellyColor = variant === "purple" ? "#F3E8FF" : "#FFEDD5";
  const spotColor = variant === "purple" ? "#9333EA" : "#EA580C";
  const breathY = computeAnimalBreathScaleY(frame, 41);
  const floatBobY = pose === "float" ? Math.sin(frame * 0.09) * 8 : 0;
  const curiousTilt = emotion === "curious" ? 6 : 0;
  const dir = flipX ? -1 : 1;

  const tentacleBases = [-40, -24, -8, 8, 24, 40];

  return (
    <g
      id={`animal-cute-octopus-${pose}`}
      transform={`translate(${x.toFixed(1)}, ${(y + floatBobY).toFixed(1)}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {pose === "crawl" && <FlatGroundShadow cy={5} rx={76} ry={11} />}

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {/* 6 Smooth Sine-Wave Tentacles */}
        {tentacleBases.map((bx, i) => {
          const isWavingArm = pose === "wave" && i === 5;
          const wave = Math.sin(frame * 0.1 + i * 0.95) * (pose === "crawl" ? 8 : 11);
          if (isWavingArm) {
            const hiWave = Math.sin(frame * 0.22) * 14;
            return (
              <g key={i}>
                <path
                  d={`M 34,-34 C 62,-44 76,${(-76 + hiWave).toFixed(1)} 64,${(-98 + hiWave).toFixed(1)}`}
                  fill="none"
                  stroke={INK}
                  strokeWidth={18}
                />
                <path
                  d={`M 34,-34 C 62,-44 76,${(-76 + hiWave).toFixed(1)} 64,${(-98 + hiWave).toFixed(1)}`}
                  fill="none"
                  stroke={mainColor}
                  strokeWidth={10.5}
                />
              </g>
            );
          }

          const spreadX = bx * (pose === "crawl" ? 1.55 : 1.25) + wave;
          const endY = pose === "crawl" ? -4 : 2 + Math.cos(frame * 0.1 + i) * 4;
          return (
            <g key={i}>
              <path
                d={`M ${bx},-28 C ${(bx * 1.15).toFixed(1)},-12 ${(spreadX * 0.85).toFixed(1)},${(endY - 6).toFixed(1)} ${spreadX.toFixed(1)},${endY.toFixed(1)}`}
                fill="none"
                stroke={INK}
                strokeWidth={16}
              />
              <path
                d={`M ${bx},-28 C ${(bx * 1.15).toFixed(1)},-12 ${(spreadX * 0.85).toFixed(1)},${(endY - 6).toFixed(1)} ${spreadX.toFixed(1)},${endY.toFixed(1)}`}
                fill="none"
                stroke={mainColor}
                strokeWidth={9}
              />
            </g>
          );
        })}

        {/* Round Bulbous Cute Head + Pastel Underside + Flat Cel-Shading */}
        <g transform={`translate(0, -64) rotate(${curiousTilt})`}>
          <ellipse cx={0} cy={0} rx={48} ry={44} fill={mainColor} />
          <ellipse cx={0} cy={16} rx={32} ry={20} fill={bellyColor} stroke="none" />
          <path
            d="M -42,16 C -22,38 22,38 42,16 C 22,44 -22,44 -42,16 Z"
            fill="#0F172A"
            opacity="0.11"
            stroke="none"
          />
          <OctopusHeadSpotsStatic spotColor={spotColor} />
          <CreatureFace
            emotion={emotion}
            frame={frame}
            blinkSeed={61}
            flipX={flipX}
            layout="front"
            mouthStyle="smile"
            eyeSpread={15}
            eyeY={4}
            eyeRadius={6.2}
            cheekSpread={26}
            cheekY={14}
            mouthY={18}
            badgeX={48}
            badgeY={-32}
          />
        </g>
      </g>
    </g>
  );
};

/* ============================================================================
 * 7. CuteShark — Friendly Pastel-Blue (#60A5FA) + White Belly (#F8FAFC) Shark
 *    Poses: "swim" | "rest"
 *    Round friendly face, rounded cute triangle teeth, rhythmic tail swish
 * ========================================================================== */

export type CuteSharkPose = "swim" | "rest";

export interface CuteSharkProps extends AnimalSpriteBaseProps {
  pose?: CuteSharkPose;
}

export const CuteShark: React.FC<CuteSharkProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "swim",
  emotion = "happy",
}) => {
  const breathY = computeAnimalBreathScaleY(frame, 67);
  const isSwimming = pose === "swim";
  const tailSwish = Math.sin(frame * (isSwimming ? 0.2 : 0.07)) * (isSwimming ? 15 : 5);
  const swimBobY = isSwimming ? Math.sin(frame * 0.1) * 7 : 0;
  const curiousTilt = emotion === "curious" ? 5 : 0;
  const dir = flipX ? -1 : 1;

  return (
    <g
      id={`animal-cute-shark-${pose}`}
      transform={`translate(${x.toFixed(1)}, ${(y + swimBobY).toFixed(1)}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {pose === "rest" && <FlatGroundShadow cy={5} rx={86} ry={11} />}

      <g transform={`rotate(${curiousTilt}) scale(1, ${breathY.toFixed(4)})`}>
        {/* Swishing Crescent Tail Fin */}
        <g transform={`translate(-76, -38) rotate(${tailSwish.toFixed(1)})`}>
          <path
            d="M 4,0 C -18,-18 -34,-42 -26,-48 C -12,-38 -2,-18 8,-6 C -2,8 -12,26 -24,36 C -32,30 -18,12 4,0 Z"
            fill="#60A5FA"
          />
        </g>

        {/* Rounded Friendly Dorsal Fin */}
        <path d="M -18,-68 C -14,-102 8,-104 16,-68 Z" fill="#60A5FA" />

        {/* Chubby Pastel-Blue Torso + Snow-White Belly + Flat Cel-Shading */}
        <path
          d="M -78,-38 C -66,-76 28,-82 76,-48 C 94,-35 90,-12 68,-6 C 24,8 -54,4 -78,-38 Z"
          fill="#60A5FA"
        />
        {/* Crisp White Belly */}
        <path
          d="M -56,-22 C -20,-34 38,-32 74,-18 C 58,-2 -18,4 -56,-22 Z"
          fill="#F8FAFC"
          stroke="none"
        />
        {/* Flat Cel-Shading Crescent */}
        <path
          d="M -64,-24 C -24,-2 36,0 70,-12 C 34,6 -28,4 -64,-24 Z"
          fill="#0F172A"
          opacity="0.11"
          stroke="none"
        />

        <SharkGillLinesStatic />

        {/* Cute Friendly Smile + Rounded Triangle Teeth */}
        <path d="M 24,-22 Q 44,-10 62,-22" fill="#9F1239" stroke={INK} strokeWidth={3} />
        <SharkCuteTeethStatic />

        {/* Expressive Friendly Eye + Rosy Cheek + Emotion Badge */}
        <CreatureFace
          emotion={emotion}
          frame={frame}
          blinkSeed={53}
          flipX={flipX}
          layout="side"
          mouthStyle="none"
          eyeSpread={44}
          eyeY={-44}
          eyeRadius={6.2}
          cheekY={-32}
          badgeX={66}
          badgeY={-74}
        />

        {/* Pectoral Fin */}
        <g transform={`translate(-6, -18) rotate(${(Math.sin(frame * 0.14) * 6).toFixed(1)})`}>
          <path d="M -12,0 C -22,22 4,28 16,4 Z" fill="#3B82F6" />
        </g>
      </g>
    </g>
  );
};

/* ============================================================================
 * 8. CuteDolphin — Friendly Sky-Cyan (#38BDF8) + White Belly (#F8FAFC) Dolphin
 *    Poses: "swim" | "jump"
 *    Supports `halfAsleep?: boolean` (default false) -> 1 eye closed + zZ & 1 eye wide awake!
 * ========================================================================== */

export type CuteDolphinPose = "swim" | "jump";

export interface CuteDolphinProps extends AnimalSpriteBaseProps {
  pose?: CuteDolphinPose;
  halfAsleep?: boolean;
}

export const CuteDolphin: React.FC<CuteDolphinProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "swim",
  halfAsleep = false,
  emotion = "happy",
}) => {
  const breathY = computeAnimalBreathScaleY(frame, 79);
  const isJumping = pose === "jump";
  const bodyRot = (isJumping ? -22 : 0) + (emotion === "curious" ? 5 : 0);
  const swimBobY = isJumping ? Math.sin(frame * 0.14) * -12 - 14 : Math.sin(frame * 0.1) * 7;
  const flukeDeg = Math.sin(frame * (isJumping ? 0.26 : 0.16)) * 15;
  const dir = flipX ? -1 : 1;
  const unflip = flipX ? -1 : 1;

  return (
    <g
      id={`animal-cute-dolphin-${pose}`}
      transform={`translate(${x.toFixed(1)}, ${(y + swimBobY).toFixed(1)}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Joyful splash droplets when jumping */}
      {isJumping && (
        <g fill="#BAE6FD" stroke="#0284C7" strokeWidth={2.4}>
          <circle cx={-56} cy={14} r={6} />
          <circle cx={-34} cy={22} r={4.5} />
          <circle cx={42} cy={16} r={5} />
        </g>
      )}

      <g transform={`rotate(${bodyRot}) scale(1, ${breathY.toFixed(4)})`}>
        {/* Horizontal Tail Flukes */}
        <g transform={`translate(-80, -30) rotate(${flukeDeg.toFixed(1)})`}>
          <path
            d="M 4,0 C -18,-20 -36,-22 -32,-8 C -22,-2 -10,0 -4,2 C -12,6 -24,14 -28,22 C -20,26 -4,16 6,2 Z"
            fill="#38BDF8"
          />
        </g>

        {/* Curved Dorsal Fin */}
        <path d="M -18,-66 C -16,-96 4,-96 8,-64 Z" fill="#0284C7" />

        {/* Smooth Arched Dolphin Body + Bottle-Nose Rostrum + White Belly */}
        <path
          d="M -80,-30 C -58,-76 24,-80 64,-44 C 82,-42 94,-34 90,-26 C 84,-18 68,-18 58,-18 C 20,6 -48,2 -80,-30 Z"
          fill="#38BDF8"
        />
        <path
          d="M -56,-18 C -18,-30 34,-28 66,-18 C 40,2 -22,2 -56,-18 Z"
          fill="#F8FAFC"
          stroke="none"
        />
        <path
          d="M -62,-20 C -22,0 32,2 62,-14 C 30,6 -26,4 -62,-20 Z"
          fill="#0F172A"
          opacity="0.11"
          stroke="none"
        />

        {/* Friendly Dolphin Smile */}
        <path d="M 48,-26 Q 64,-18 82,-25" fill="none" stroke={INK} strokeWidth={3} />

        {/* UNIHEMISPHERIC SLEEP (`halfAsleep === true`) vs Standard Expressive Face */}
        {halfAsleep ? (
          <g id="dolphin-half-asleep-face">
            {/* Subtle dashed hemisphere divider on forehead */}
            <line x1={38} y1={-62} x2={38} y2={-28} stroke="#0369A1" strokeWidth={2.2} strokeDasharray="4 4" opacity="0.65" />
            {/* Left Side: Sleeping Closed Eye + Rosy Cheek + Rising zZ */}
            <ellipse cx={22} cy={-34} rx={6.5} ry={4} fill={CHEEK_PINK} opacity="0.45" stroke="none" />
            <path d="M 18,-44 Q 24,-39 30,-44" fill="none" stroke={INK} strokeWidth={3.2} />
            <g transform={`translate(18, -72) scale(${unflip}, 1)`}>
              <text
                x={0}
                y={(-((frame * 0.03) % 1) * 14).toFixed(1)}
                textAnchor="middle"
                fill="#60A5FA"
                stroke={INK}
                strokeWidth={3.5}
                paintOrder="stroke"
                fontSize={18}
                fontWeight={900}
                fontFamily={FONT}
              >
                zZ
              </text>
            </g>
            {/* Right Side: Wide-Awake Sparkling Eye + Rosy Cheek */}
            <ellipse cx={54} cy={-34} rx={6.5} ry={4} fill={CHEEK_PINK} opacity="0.45" stroke="none" />
            <SparkleEye cx={52} cy={-44} r={5.8} />
          </g>
        ) : (
          <CreatureFace
            emotion={emotion}
            frame={frame}
            blinkSeed={97}
            flipX={flipX}
            layout="side"
            mouthStyle="none"
            eyeSpread={46}
            eyeY={-44}
            eyeRadius={5.8}
            cheekY={-33}
            badgeX={64}
            badgeY={-72}
            parentRotationDeg={bodyRot}
          />
        )}

        {/* Flipper */}
        <g transform={`translate(2, -16) rotate(${(Math.sin(frame * 0.14) * 8).toFixed(1)})`}>
          <path d="M -10,0 C -20,22 4,26 14,4 Z" fill="#0284C7" />
        </g>
      </g>
    </g>
  );
};
