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

export type AnimalAccessoryType =
  | "none"
  | "tie_blue"
  | "scarf_red"
  | "flower_pink"
  | "glasses_round"
  | "cap_orange"
  | "crown_gold"
  | "bandana_green"
  | "hat_black";

export type AnimalAgeVariant = "adult" | "baby" | "elder";

export interface AnimalSpriteBaseProps {
  x: number;
  y: number;
  scale?: number;
  flipX?: boolean;
  frame: number;
  emotion?: CreatureEmotion;
  /** V24.0: Optional character-identifying micro-prop (default "none") */
  accessory?: AnimalAccessoryType;
  /** V24.0: Optional age variant ("adult" | "baby" | "elder", default "adult") */
  ageVariant?: AnimalAgeVariant;
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
 * V24.0 MICRO-PROPS ACCESSORY HELPER (`AnimalAccessory`) — 0 blur, stroke="#1E293B" strokeWidth={3}
 *   - Supports 8 character-identifying micro-props across all 8 AnimalSpriteKit species:
 *     "tie_blue" | "scarf_red" | "flower_pink" | "glasses_round"
 *     | "cap_orange" | "crown_gold" | "bandana_green" | "hat_black"
 * ========================================================================== */

export interface AnimalAccessoryProps {
  type?: AnimalAccessoryType;
  anchorX: number;
  anchorY: number;
  scale?: number;
  layout?: "front" | "side";
  eyeSpread?: number;
}

export const AnimalAccessory: React.FC<AnimalAccessoryProps> = React.memo(
  ({ type = "none", anchorX, anchorY, scale = 1, layout = "front", eyeSpread = 12 }) => {
    if (!type || type === "none") return null;

    return (
      <g
        id={`animal-accessory-${type}`}
        transform={`translate(${anchorX.toFixed(1)}, ${anchorY.toFixed(1)}) scale(${scale.toFixed(3)})`}
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {type === "tie_blue" && (
          <g>
            {/* Clean collar knot + crisp blue tie hanging on chest/neck */}
            <polygon points="-7,-3 7,-3 5,6 -5,6" fill="#1D4ED8" />
            <polygon points="-5,6 5,6 9,26 0,34 -9,26" fill="#3B82F6" />
            <line x1={-4} y1={14} x2={5} y2={11} stroke="#93C5FD" strokeWidth={2.2} />
            <line x1={-5} y1={22} x2={6} y2={19} stroke="#93C5FD" strokeWidth={2.2} />
          </g>
        )}

        {type === "scarf_red" && (
          <g>
            {/* Cozy wrapped red scarf + trailing end */}
            <rect x={-26} y={-7} width={52} height={14} rx={7} fill="#EF4444" />
            <path d="M 8,5 L 18,28 L 28,24 L 20,4 Z" fill="#DC2626" />
            <line x1={-14} y1={-4} x2={-14} y2={4} stroke="#FCA5A5" strokeWidth={2.4} />
            <line x1={2} y1={-4} x2={2} y2={4} stroke="#FCA5A5" strokeWidth={2.4} />
          </g>
        )}

        {type === "bandana_green" && (
          <g>
            {/* Triangle explorer green bandana tied around neck */}
            <rect x={-24} y={-6} width={48} height={10} rx={5} fill="#15803D" />
            <polygon points="-16,3 16,3 0,24" fill="#22C55E" />
            <circle cx={0} cy={12} r={2.5} fill="#DCFCE7" stroke="none" />
          </g>
        )}

        {type === "flower_pink" && (
          <g>
            {/* Cute 5-petal pastel pink blossom with warm yellow center */}
            <circle cx={0} cy={-9} r={6.5} fill="#F472B6" />
            <circle cx={9} cy={-3} r={6.5} fill="#F472B6" />
            <circle cx={6} cy={7} r={6.5} fill="#F472B6" />
            <circle cx={-6} cy={7} r={6.5} fill="#F472B6" />
            <circle cx={-9} cy={-3} r={6.5} fill="#F472B6" />
            <circle cx={0} cy={0} r={5} fill="#FACC15" />
          </g>
        )}

        {type === "cap_orange" && (
          <g>
            {/* Sporty rounded orange baseball cap with front brim */}
            <path d="M -24,6 C -24,-18 20,-18 22,6 Z" fill="#F97316" />
            <path d="M 4,6 L 34,8 C 32,14 14,13 0,10 Z" fill="#EA580C" />
            <circle cx={-2} cy={-14} r={3.5} fill="#FDE047" />
          </g>
        )}

        {type === "crown_gold" && (
          <g>
            {/* Little royal gold 3-point crown */}
            <polygon points="-18,8 -20,-12 -8,-2 0,-18 8,-2 20,-12 18,8" fill="#FACC15" />
            <rect x={-18} y={4} width={36} height={6} rx={3} fill="#EAB308" />
            <circle cx={0} cy={-3} r={2.8} fill="#EF4444" stroke="none" />
          </g>
        )}

        {type === "hat_black" && (
          <g>
            {/* Classic detective / gentleman top hat with gold band */}
            <ellipse cx={0} cy={6} rx={28} ry={6} fill="#1E293B" />
            <rect x={-18} y={-20} width={36} height={26} rx={5} fill="#334155" />
            <rect x={-18} y={-2} width={36} height={6} fill="#FACC15" stroke="none" />
          </g>
        )}

        {type === "glasses_round" && (
          layout === "side" ? (
            <g>
              <line x1={-18} y1={-1} x2={-9} y2={-1} stroke={INK} strokeWidth={3} />
              <circle cx={0} cy={0} r={10} fill="#E0F2FE" fillOpacity={0.42} stroke={INK} strokeWidth={3} />
              <path d="M -4,-4 L -1,-1" stroke="#FFFFFF" strokeWidth={2} />
            </g>
          ) : (
            <g>
              <circle cx={-eyeSpread} cy={0} r={10} fill="#E0F2FE" fillOpacity={0.42} stroke={INK} strokeWidth={3} />
              <circle cx={eyeSpread} cy={0} r={10} fill="#E0F2FE" fillOpacity={0.42} stroke={INK} strokeWidth={3} />
              <path d={`M ${-eyeSpread + 10},0 Q 0,-3 ${eyeSpread - 10},0`} fill="none" stroke={INK} strokeWidth={3} />
            </g>
          )
        )}
      </g>
    );
  }
);
AnimalAccessory.displayName = "AnimalAccessory";

/** Subtle flat translucent veil for ageVariant === "elder" (0 CSS/SVG filters) */
const AnimalElderDesatVeil: React.FC<{ rx: number; ry: number; cx?: number; cy?: number }> = React.memo(
  ({ rx, ry, cx = 0, cy = 0 }) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#E2E8F0" opacity="0.2" stroke="none" />
  )
);
AnimalElderDesatVeil.displayName = "AnimalElderDesatVeil";

function isHeadAccessory(type?: AnimalAccessoryType): boolean {
  return type === "flower_pink" || type === "cap_orange" || type === "crown_gold" || type === "hat_black";
}
function isNeckAccessory(type?: AnimalAccessoryType): boolean {
  return type === "tie_blue" || type === "scarf_red" || type === "bandana_green";
}

/* ============================================================================
 * SHARED CREATURE FACE & EMOTION OVERLAYS (`CreatureFace`)
 *   - Supports "front" (2 eyes + nose/mouth) and "side" (profile eye + cheek + mouth)
 *   - Sparkling eyes (#0F172A + 2 crisp #FFFFFF catchlights), smooth 110f/5f blink
 *   - Pastel rosy cheeks (#FDA4AF, opacity="0.45"; richer 0.62 for baby)
 *   - V24.0 ageVariant: "baby" (1.12x eye scale + richer blush) | "elder" (#94A3B8 silver eyebrows)
 *   - Counter-flips text glyphs (?, !, zZ) when flipX=true so symbols never mirror!
 * ========================================================================== */

export interface CreatureFaceProps {
  emotion?: CreatureEmotion;
  ageVariant?: AnimalAgeVariant;
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
  /** Suppress floating emotion badge (?, !, sweat, zZ) on solemn/stealth beats */
  hideEmotionBadge?: boolean;
  /** Suppress pastel pink cheeks when camouflaged into stone */
  hideCheeks?: boolean;
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
  ageVariant = "adult",
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
  hideEmotionBadge = false,
  hideCheeks = false,
}) => {
  const blink = isAnimalBlinking(frame, blinkSeed);
  const shimmerX = emotion === "surprised" ? Math.sin(frame * 0.55) * 0.8 : 0;
  const shimmerY = emotion === "surprised" ? Math.cos(frame * 0.45) * 0.8 : 0;
  const babyEyeMul = ageVariant === "baby" ? 1.12 : 1;
  const effEyeR =
    (emotion === "surprised" ? eyeRadius * 1.2 : emotion === "scared" ? eyeRadius * 1.08 : eyeRadius) * babyEyeMul;
  const cheekOpacity = ageVariant === "baby" ? "0.62" : "0.45";
  const cheekScale = ageVariant === "baby" ? 1.12 : 1;
  const browStroke = ageVariant === "elder" ? "#94A3B8" : INK;
  const browWidth = ageVariant === "elder" ? 3.5 : 2.8;

  if (layout === "side") {
    return (
      <g className={`creature-face-side-${emotion}`} strokeOpacity={1}>
        {/* Pastel Rosy Cheek */}
        {!hideCheeks && (
          <ellipse
            cx={eyeSpread + 2}
            cy={cheekY}
            rx={eyeRadius * 1.15 * cheekScale}
            ry={eyeRadius * 0.68 * cheekScale}
            fill={CHEEK_PINK}
            opacity={cheekOpacity}
            stroke="none"
          />
        )}

        {/* Eyebrow by emotion (plus soft silver-gray brow for ageVariant="elder") */}
        {emotion === "curious" && (
          <path
            d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 5} Q ${eyeSpread},${eyeY - effEyeR - 10} ${eyeSpread + effEyeR},${eyeY - effEyeR - 4}`}
            fill="none"
            stroke={browStroke}
            strokeWidth={browWidth}
          />
        )}
        {emotion === "scared" && (
          <path
            d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 2} L ${eyeSpread + effEyeR},${eyeY - effEyeR - 7}`}
            fill="none"
            stroke={browStroke}
            strokeWidth={browWidth}
          />
        )}
        {emotion === "proud" && (
          <path
            d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 5} Q ${eyeSpread},${eyeY - effEyeR - 8} ${eyeSpread + effEyeR},${eyeY - effEyeR - 3}`}
            fill="none"
            stroke={browStroke}
            strokeWidth={browWidth}
          />
        )}
        {ageVariant === "elder" && emotion !== "curious" && emotion !== "scared" && emotion !== "proud" && (
          <path
            d={`M ${eyeSpread - effEyeR - 1},${eyeY - effEyeR - 4} Q ${eyeSpread},${eyeY - effEyeR - 7} ${eyeSpread + effEyeR + 1},${eyeY - effEyeR - 4}`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth={3.5}
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

        {!hideEmotionBadge && (
          <CreatureEmotionBadge
            emotion={emotion}
            frame={frame}
            x={badgeX}
            y={badgeY}
            flipX={flipX}
            parentRotationDeg={parentRotationDeg}
          />
        )}
      </g>
    );
  }

  // FRONT 2-EYE EXPRESSIVE FACE
  return (
    <g className={`creature-face-front-${emotion}`} strokeOpacity={1}>
      {/* Pastel Rosy Cheeks (#FDA4AF, opacity="0.45"; richer 0.62 for baby; hidden in rock camo) */}
      {!hideCheeks && (
        <>
          <ellipse
            cx={-cheekSpread}
            cy={cheekY}
            rx={eyeRadius * 1.25 * cheekScale}
            ry={eyeRadius * 0.72 * cheekScale}
            fill={CHEEK_PINK}
            opacity={cheekOpacity}
            stroke="none"
          />
          <ellipse
            cx={cheekSpread}
            cy={cheekY}
            rx={eyeRadius * 1.25 * cheekScale}
            ry={eyeRadius * 0.72 * cheekScale}
            fill={CHEEK_PINK}
            opacity={cheekOpacity}
            stroke="none"
          />
        </>
      )}

      {/* Emotion Eyebrows (plus soft silver-gray brows for ageVariant="elder") */}
      {emotion === "curious" && (
        <g fill="none" stroke={browStroke} strokeWidth={ageVariant === "elder" ? 3.5 : 2.6}>
          <path d={`M ${-eyeSpread - effEyeR},${eyeY - effEyeR - 3} Q ${-eyeSpread},${eyeY - effEyeR - 5} ${-eyeSpread + effEyeR},${eyeY - effEyeR - 3}`} />
          <path d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 6} Q ${eyeSpread},${eyeY - effEyeR - 11} ${eyeSpread + effEyeR},${eyeY - effEyeR - 5}`} />
        </g>
      )}
      {emotion === "surprised" && (
        <g fill="none" stroke={browStroke} strokeWidth={ageVariant === "elder" ? 3.5 : 2.6}>
          <path d={`M ${-eyeSpread - effEyeR},${eyeY - effEyeR - 5} Q ${-eyeSpread},${eyeY - effEyeR - 10} ${-eyeSpread + effEyeR},${eyeY - effEyeR - 5}`} />
          <path d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 5} Q ${eyeSpread},${eyeY - effEyeR - 10} ${eyeSpread + effEyeR},${eyeY - effEyeR - 5}`} />
        </g>
      )}
      {emotion === "scared" && (
        <g fill="none" stroke={browStroke} strokeWidth={ageVariant === "elder" ? 3.5 : 2.8}>
          <line x1={-eyeSpread - effEyeR} y1={eyeY - effEyeR - 2} x2={-eyeSpread + effEyeR} y2={eyeY - effEyeR - 7} />
          <line x1={eyeSpread - effEyeR} y1={eyeY - effEyeR - 7} x2={eyeSpread + effEyeR} y2={eyeY - effEyeR - 2} />
        </g>
      )}
      {emotion === "proud" && (
        <g fill="none" stroke={browStroke} strokeWidth={ageVariant === "elder" ? 3.5 : 2.6}>
          <path d={`M ${-eyeSpread - effEyeR},${eyeY - effEyeR - 4} Q ${-eyeSpread},${eyeY - effEyeR - 8} ${-eyeSpread + effEyeR},${eyeY - effEyeR - 3}`} />
          <path d={`M ${eyeSpread - effEyeR},${eyeY - effEyeR - 3} Q ${eyeSpread},${eyeY - effEyeR - 8} ${eyeSpread + effEyeR},${eyeY - effEyeR - 4}`} />
        </g>
      )}
      {ageVariant === "elder" && (emotion === "happy" || emotion === "sleepy") && (
        <g fill="none" stroke="#94A3B8" strokeWidth={3.5}>
          <path d={`M ${-eyeSpread - effEyeR - 1},${eyeY - effEyeR - 4} Q ${-eyeSpread},${eyeY - effEyeR - 7} ${-eyeSpread + effEyeR + 1},${eyeY - effEyeR - 4}`} />
          <path d={`M ${eyeSpread - effEyeR - 1},${eyeY - effEyeR - 4} Q ${eyeSpread},${eyeY - effEyeR - 7} ${eyeSpread + effEyeR + 1},${eyeY - effEyeR - 4}`} />
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

      {!hideEmotionBadge && (
        <CreatureEmotionBadge
          emotion={emotion}
          frame={frame}
          x={badgeX}
          y={badgeY}
          flipX={flipX}
          parentRotationDeg={parentRotationDeg}
        />
      )}
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
  accessory = "none",
  ageVariant = "adult",
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
            {ageVariant === "elder" && <AnimalElderDesatVeil cx={0} cy={-6} rx={54} ry={28} />}
            {isNeckAccessory(accessory) && (
              <AnimalAccessory type={accessory} anchorX={34} anchorY={-8} scale={0.92} />
            )}
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
              {ageVariant === "elder" && <AnimalElderDesatVeil rx={30} ry={30} />}
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <CreatureFace
                emotion={resolvedEmotion}
                ageVariant={ageVariant}
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
              {accessory === "glasses_round" && (
                <AnimalAccessory type="glasses_round" anchorX={0} anchorY={-4} eyeSpread={11} scale={0.92} />
              )}
              {isHeadAccessory(accessory) && (
                <AnimalAccessory
                  type={accessory}
                  anchorX={accessory === "flower_pink" ? -16 : 0}
                  anchorY={accessory === "flower_pink" ? -24 : -28}
                  scale={0.92}
                />
              )}
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
            {ageVariant === "elder" && <AnimalElderDesatVeil cx={0} cy={-78} rx={56} ry={46} />}
            {isNeckAccessory(accessory) && (
              <AnimalAccessory type={accessory} anchorX={38} anchorY={-68} />
            )}
            <g transform={`translate(56, -98) rotate(${curiousTilt})`}>
              <polygon points="-24,-18 -30,-48 -4,-30" fill={furMain} />
              <polygon points="24,-18 30,-48 4,-30" fill={furMain} />
              <polygon points="-20,-22 -24,-39 -9,-28" fill="#FBCFE8" stroke="none" />
              <polygon points="20,-22 24,-39 9,-28" fill="#FBCFE8" stroke="none" />
              <circle cx={0} cy={0} r={32} fill={furMain} />
              <CatForeheadStripes color={furStripe} />
              <ellipse cx={0} cy={11} rx={16} ry={11} fill={furLight} stroke="none" />
              {ageVariant === "elder" && <AnimalElderDesatVeil rx={32} ry={32} />}
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <CreatureFace
                emotion={resolvedEmotion}
                ageVariant={ageVariant}
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
              {accessory === "glasses_round" && (
                <AnimalAccessory type="glasses_round" anchorX={0} anchorY={-4} eyeSpread={11} />
              )}
              {isHeadAccessory(accessory) && (
                <AnimalAccessory
                  type={accessory}
                  anchorX={accessory === "flower_pink" ? -17 : 0}
                  anchorY={accessory === "flower_pink" ? -25 : -30}
                />
              )}
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
            {ageVariant === "elder" && <AnimalElderDesatVeil cx={0} cy={-58} rx={56} ry={33} />}
            {isNeckAccessory(accessory) && (
              <AnimalAccessory type={accessory} anchorX={36} anchorY={-66} />
            )}
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
              {ageVariant === "elder" && <AnimalElderDesatVeil rx={32} ry={32} />}
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <CreatureFace
                emotion={resolvedEmotion}
                ageVariant={ageVariant}
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
              {accessory === "glasses_round" && (
                <AnimalAccessory type="glasses_round" anchorX={0} anchorY={-5} eyeSpread={11} />
              )}
              {isHeadAccessory(accessory) && (
                <AnimalAccessory
                  type={accessory}
                  anchorX={accessory === "flower_pink" ? -17 : 0}
                  anchorY={accessory === "flower_pink" ? -25 : -30}
                />
              )}
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
            {ageVariant === "elder" && <AnimalElderDesatVeil cx={0} cy={-46} rx={42} ry={44} />}
            {/* Front neat paws */}
            <ellipse cx={-15} cy={-4} rx={12} ry={8} fill={furLight} />
            <ellipse cx={15} cy={-4} rx={12} ry={8} fill={furLight} />
            {isNeckAccessory(accessory) && (
              <AnimalAccessory type={accessory} anchorX={0} anchorY={-80} />
            )}
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
              {ageVariant === "elder" && <AnimalElderDesatVeil rx={34} ry={34} />}
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <CreatureFace
                emotion={resolvedEmotion}
                ageVariant={ageVariant}
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
              {accessory === "glasses_round" && (
                <AnimalAccessory type="glasses_round" anchorX={0} anchorY={-5} eyeSpread={12} />
              )}
              {isHeadAccessory(accessory) && (
                <AnimalAccessory
                  type={accessory}
                  anchorX={accessory === "flower_pink" ? -18 : 0}
                  anchorY={accessory === "flower_pink" ? -26 : -32}
                />
              )}
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
  accessory = "none",
  ageVariant = "adult",
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
            {ageVariant === "elder" && <AnimalElderDesatVeil cx={0} cy={-64} rx={60} ry={35} />}
            {/* Red collar + gold tag */}
            <path d="M 28,-86 Q 44,-68 50,-48" fill="none" stroke="#DC2626" strokeWidth={9} />
            <circle cx={46} cy={-48} r={6} fill="#FACC15" strokeWidth={2.4} />
            {isNeckAccessory(accessory) && (
              <AnimalAccessory type={accessory} anchorX={44} anchorY={-68} />
            )}
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
            {ageVariant === "elder" && <AnimalElderDesatVeil cx={0} cy={-48} rx={45} ry={45} />}
            <ellipse cx={-16} cy={-4} rx={14} ry={9} fill="#FBBF24" />
            <ellipse cx={16} cy={-4} rx={14} ry={9} fill="#FBBF24" />
            <path d="M -26,-86 Q 0,-74 26,-86" fill="none" stroke="#DC2626" strokeWidth={9} />
            <circle cx={0} cy={-74} r={6} fill="#FACC15" strokeWidth={2.4} />
            {isNeckAccessory(accessory) && (
              <AnimalAccessory type={accessory} anchorX={0} anchorY={-82} />
            )}
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
          {ageVariant === "elder" && <AnimalElderDesatVeil rx={36} ry={36} />}
          {/* Cute Round Nose + tiny shine */}
          <ellipse cx={0} cy={4} rx={8} ry={6} fill={INK} stroke="none" />
          <circle cx={-2.5} cy={2.2} r={2} fill="#FFFFFF" opacity="0.7" stroke="none" />

          {/* Shared Face + Special Yawn Mouth */}
          <CreatureFace
            emotion={resolvedEmotion}
            ageVariant={ageVariant}
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
          {accessory === "glasses_round" && (
            <AnimalAccessory type="glasses_round" anchorX={0} anchorY={-9} eyeSpread={12} />
          )}
          {isHeadAccessory(accessory) && (
            <AnimalAccessory
              type={accessory}
              anchorX={accessory === "flower_pink" ? -22 : 0}
              anchorY={accessory === "flower_pink" ? -24 : -34}
            />
          )}
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
  accessory = "none",
  ageVariant = "adult",
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
        {ageVariant === "elder" && <AnimalElderDesatVeil cx={0} cy={-48} rx={37} ry={29} />}
        {isNeckAccessory(accessory) && (
          <AnimalAccessory type={accessory} anchorX={18} anchorY={-50} scale={0.72} />
        )}

        {/* Expressive Bird Head */}
        <g transform={`translate(24, -70) rotate(${headTilt.toFixed(1)})`}>
          <circle cx={0} cy={0} r={24} fill={bodyColor} />
          {/* Cute tuft feather on crown */}
          <path d="M -4,-23 Q -10,-34 -1,-31 Q 4,-36 6,-24" fill={bodyColor} strokeWidth={3.2} />
          {ageVariant === "elder" && <AnimalElderDesatVeil rx={24} ry={24} />}
          {/* Neat Orange Beak */}
          <polygon
            points={emotion === "surprised" ? "20,-7 38,-1 20,3" : "20,-5 38,2 20,9"}
            fill="#F97316"
          />
          {emotion === "surprised" && <polygon points="20,3 35,8 20,11" fill="#EA580C" />}
          <CreatureFace
            emotion={emotion}
            ageVariant={ageVariant}
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
          {accessory === "glasses_round" && (
            <AnimalAccessory type="glasses_round" anchorX={8} anchorY={-5} layout="side" scale={0.82} />
          )}
          {isHeadAccessory(accessory) && (
            <AnimalAccessory
              type={accessory}
              anchorX={accessory === "flower_pink" ? -10 : 0}
              anchorY={accessory === "flower_pink" ? -18 : -24}
              scale={0.78}
            />
          )}
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
  accessory = "none",
  ageVariant = "adult",
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
        {ageVariant === "elder" && <AnimalElderDesatVeil cx={-18} cy={-36} rx={44} ry={20} />}
        {isNeckAccessory(accessory) && (
          <AnimalAccessory type={accessory} anchorX={16} anchorY={-34} scale={0.68} />
        )}

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
          {ageVariant === "elder" && <AnimalElderDesatVeil rx={23} ry={23} />}
          <CreatureFace
            emotion={emotion}
            ageVariant={ageVariant}
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
          {accessory === "glasses_round" && (
            <AnimalAccessory type="glasses_round" anchorX={7} anchorY={-5} layout="side" scale={0.84} />
          )}
          {isHeadAccessory(accessory) && (
            <AnimalAccessory
              type={accessory}
              anchorX={accessory === "flower_pink" ? -12 : -2}
              anchorY={accessory === "flower_pink" ? -17 : -22}
              scale={0.74}
            />
          )}
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
  accessory = "none",
  ageVariant = "adult",
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
        {ageVariant === "elder" && <AnimalElderDesatVeil cx={-4} cy={-20} rx={45} ry={19} />}
        {isNeckAccessory(accessory) && (
          <AnimalAccessory type={accessory} anchorX={24} anchorY={-20} scale={0.74} />
        )}

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
          {ageVariant === "elder" && <AnimalElderDesatVeil rx={27} ry={22} />}
          <CreatureFace
            emotion={emotion}
            ageVariant={ageVariant}
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
          {accessory === "glasses_round" && (
            <AnimalAccessory type="glasses_round" anchorX={8} anchorY={-6} layout="side" scale={0.86} />
          )}
          {isHeadAccessory(accessory) && (
            <AnimalAccessory
              type={accessory}
              anchorX={accessory === "flower_pink" ? -12 : 0}
              anchorY={accessory === "flower_pink" ? -18 : -24}
              scale={0.8}
            />
          )}
        </g>
      </g>
    </g>
  );
};

/* ============================================================================
 * 6. CuteOctopus — Friendly Plum-Red (#C4365D) or Pastel-Purple (#C084FC) Octopus
 *    Poses: "float" | "crawl" | "wave"
 * ========================================================================== */

export type CuteOctopusPose = "float" | "crawl" | "wave";

export interface CuteOctopusProps extends AnimalSpriteBaseProps {
  pose?: CuteOctopusPose;
  variant?: "coral" | "purple";
  /** Optional custom skin colors (for smooth rock/sand/coral/sleep camo transitions) */
  colorOverride?: { main: string; belly: string; spot: string };
  /** Show subtle 3D rocky skin papillae bumps when camouflaged on reef stone */
  papillaeBumps?: boolean;
  /** Show mottled mossy rock patches & stone ridges for seamless reef-stone camouflage */
  rockCamoTexture?: boolean;
  /** Optional body outline opacity (default 1; lower to 0.45 when disguised as rock) */
  strokeOpacity?: number;
  /** Suppress floating emotion badge (?, !, sweat, zZ) on solemn/stealth beats */
  hideEmotionBadge?: boolean;
  /** Suppress rosy cheeks when disguised as stone */
  hideCheeks?: boolean;
  /** Show bright warning blue rings (Blue-Ringed Octopus) */
  blueRings?: boolean;
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
  accessory = "none",
  ageVariant = "adult",
  colorOverride,
  papillaeBumps = false,
  rockCamoTexture = false,
  strokeOpacity = 1,
  hideEmotionBadge = false,
  hideCheeks = false,
  blueRings = false,
}) => {
  const mainColor = colorOverride?.main ?? (variant === "purple" ? "#C084FC" : "#C4365D");
  const bellyColor = colorOverride?.belly ?? (variant === "purple" ? "#F3E8FF" : "#FCE7F3");
  const spotColor = colorOverride?.spot ?? (variant === "purple" ? "#9333EA" : "#FCE7F3");
  const celShadeFill = colorOverride ? "#0F172A" : variant === "purple" ? "#581C87" : "#881337";
  const celShadeOpacity = colorOverride ? "0.11" : "0.18";
  const bodyStrokeOpacity = Math.max(0.15, Math.min(1, strokeOpacity));
  const breathY = 1 + 0.012 * Math.sin((frame + 41) * 0.08);
  const floatBobY = pose === "float" ? Math.sin(frame * 0.09) * 7 : 0;
  const curiousTilt = emotion === "curious" ? 5 : 0;
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
      {pose === "crawl" && !rockCamoTexture && <FlatGroundShadow cy={5} rx={76} ry={11} />}

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {/* 6 Smooth Sine-Wave Tentacles */}
        {tentacleBases.map((bx, i) => {
          const isWavingArm = pose === "wave" && i === 5;
          const wave = Math.sin(frame * 0.1 + i * 0.95) * (pose === "crawl" ? 7 : 10);
          if (isWavingArm) {
            const hiWave = Math.sin(frame * 0.22) * 12;
            return (
              <g key={i}>
                <path
                  d={`M 34,-34 C 62,-44 76,${(-76 + hiWave).toFixed(1)} 64,${(-98 + hiWave).toFixed(1)}`}
                  fill="none"
                  stroke={INK}
                  strokeOpacity={bodyStrokeOpacity}
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
                strokeOpacity={bodyStrokeOpacity}
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

        {isNeckAccessory(accessory) && (
          <AnimalAccessory type={accessory} anchorX={0} anchorY={-24} scale={1.06} />
        )}

        {/* Round Bulbous Cute Head + Pastel Underside + Flat Cel-Shading */}
        <g transform={`translate(0, -64) rotate(${curiousTilt})`}>
          {papillaeBumps && (
            <g fill={mainColor} stroke={INK} strokeOpacity={bodyStrokeOpacity} strokeWidth={3.2}>
              <path d="M -40,-24 L -48,-36 L -28,-36 Z" />
              <path d="M -12,-42 L -2,-56 L 10,-42 Z" />
              <path d="M 26,-36 L 42,-40 L 42,-22 Z" />
            </g>
          )}
          <ellipse cx={0} cy={0} rx={48} ry={44} fill={mainColor} strokeOpacity={bodyStrokeOpacity} />
          <ellipse cx={0} cy={16} rx={32} ry={20} fill={bellyColor} stroke="none" />
          <path
            d="M -42,16 C -22,38 22,38 42,16 C 22,44 -22,44 -42,16 Z"
            fill={celShadeFill}
            opacity={celShadeOpacity}
            stroke="none"
          />
          {rockCamoTexture && (
            <g id="octo-rock-camo-texture" stroke="none">
              {/* Mossy reef stone patches & rough rock pits matching OceanReefRocksAndCoralsStatic */}
              <ellipse cx={-22} cy={-24} rx={15} ry={7} fill="#16A34A" opacity={0.45} />
              <ellipse cx={21} cy={-20} rx={13} ry={6} fill="#15803D" opacity={0.42} />
              <path d="M -36,-8 Q -18,-18 2,-12 Q 20,-6 36,-14" fill="none" stroke="#475569" strokeWidth={2.6} opacity={0.55} />
              <circle cx={-30} cy={12} r={5.5} fill="#475569" opacity={0.52} />
              <circle cx={31} cy={8} r={6} fill="#475569" opacity={0.5} />
              <circle cx={-4} cy={-31} r={4.5} fill="#94A3B8" opacity={0.45} />
              <circle cx={14} cy={27} r={4} fill="#475569" opacity={0.45} />
            </g>
          )}
          {blueRings ? (
            <g fill="none" stroke="#0EA5E9" strokeWidth={4.2}>
              <circle cx={-26} cy={-24} r={7.5} fill="#0F172A" />
              <circle cx={0} cy={-30} r={8.5} fill="#0F172A" />
              <circle cx={27} cy={-22} r={7.5} fill="#0F172A" />
              <circle cx={-34} cy={-4} r={6} fill="#0F172A" />
              <circle cx={34} cy={-4} r={6} fill="#0F172A" />
            </g>
          ) : (
            <OctopusHeadSpotsStatic spotColor={spotColor} />
          )}
          {ageVariant === "elder" && <AnimalElderDesatVeil rx={47} ry={43} />}
          <CreatureFace
            emotion={emotion}
            ageVariant={ageVariant}
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
            hideEmotionBadge={hideEmotionBadge}
            hideCheeks={hideCheeks}
          />
          {accessory === "glasses_round" && (
            <AnimalAccessory type="glasses_round" anchorX={0} anchorY={4} eyeSpread={15} scale={1.12} />
          )}
          {isHeadAccessory(accessory) && (
            <AnimalAccessory
              type={accessory}
              anchorX={accessory === "flower_pink" ? -26 : 0}
              anchorY={accessory === "flower_pink" ? -34 : -44}
              scale={1.06}
            />
          )}
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
  accessory = "none",
  ageVariant = "adult",
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
        {ageVariant === "elder" && <AnimalElderDesatVeil cx={4} cy={-36} rx={68} ry={30} />}

        <SharkGillLinesStatic />
        {isNeckAccessory(accessory) && (
          <AnimalAccessory type={accessory} anchorX={14} anchorY={-28} scale={0.96} />
        )}

        {/* Cute Friendly Smile + Rounded Triangle Teeth */}
        <path d="M 24,-22 Q 44,-10 62,-22" fill="#9F1239" stroke={INK} strokeWidth={3} />
        <SharkCuteTeethStatic />

        {/* Expressive Friendly Eye + Rosy Cheek + Emotion Badge */}
        <CreatureFace
          emotion={emotion}
          ageVariant={ageVariant}
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
        {accessory === "glasses_round" && (
          <AnimalAccessory type="glasses_round" anchorX={44} anchorY={-44} layout="side" scale={1} />
        )}
        {isHeadAccessory(accessory) && (
          <AnimalAccessory
            type={accessory}
            anchorX={accessory === "flower_pink" ? 26 : 36}
            anchorY={accessory === "flower_pink" ? -64 : -68}
            scale={0.95}
          />
        )}

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
  accessory = "none",
  ageVariant = "adult",
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
        {ageVariant === "elder" && <AnimalElderDesatVeil cx={2} cy={-34} rx={64} ry={28} />}
        {isNeckAccessory(accessory) && (
          <AnimalAccessory type={accessory} anchorX={22} anchorY={-24} scale={0.9} />
        )}

        {/* Friendly Dolphin Smile */}
        <path d="M 48,-26 Q 64,-18 82,-25" fill="none" stroke={INK} strokeWidth={3} />

        {/* UNIHEMISPHERIC SLEEP (`halfAsleep === true`) vs Standard Expressive Face */}
        {halfAsleep ? (
          <g id="dolphin-half-asleep-face">
            {/* Subtle dashed hemisphere divider on forehead */}
            <line x1={38} y1={-62} x2={38} y2={-28} stroke="#0369A1" strokeWidth={2.2} strokeDasharray="4 4" opacity="0.65" />
            {/* Left Side: Sleeping Closed Eye + Rosy Cheek + Rising zZ */}
            <ellipse
              cx={22}
              cy={-34}
              rx={ageVariant === "baby" ? 7.3 : 6.5}
              ry={ageVariant === "baby" ? 4.5 : 4}
              fill={CHEEK_PINK}
              opacity={ageVariant === "baby" ? "0.62" : "0.45"}
              stroke="none"
            />
            {ageVariant === "elder" && (
              <path d="M 16,-52 Q 24,-55 31,-52" fill="none" stroke="#94A3B8" strokeWidth={3.4} />
            )}
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
            <ellipse
              cx={54}
              cy={-34}
              rx={ageVariant === "baby" ? 7.3 : 6.5}
              ry={ageVariant === "baby" ? 4.5 : 4}
              fill={CHEEK_PINK}
              opacity={ageVariant === "baby" ? "0.62" : "0.45"}
              stroke="none"
            />
            {ageVariant === "elder" && (
              <path d="M 45,-53 Q 52,-56 59,-53" fill="none" stroke="#94A3B8" strokeWidth={3.4} />
            )}
            <SparkleEye cx={52} cy={-44} r={ageVariant === "baby" ? 6.5 : 5.8} />
          </g>
        ) : (
          <CreatureFace
            emotion={emotion}
            ageVariant={ageVariant}
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
        {accessory === "glasses_round" && (
          <AnimalAccessory
            type="glasses_round"
            anchorX={halfAsleep ? 52 : 46}
            anchorY={-44}
            layout="side"
            scale={0.94}
          />
        )}
        {isHeadAccessory(accessory) && (
          <AnimalAccessory
            type={accessory}
            anchorX={accessory === "flower_pink" ? 22 : 34}
            anchorY={accessory === "flower_pink" ? -62 : -66}
            scale={0.92}
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

/* ============================================================================
 * 9. CuteWoodFrog — Northern Wood Frog (Lithobates sylvaticus) for Episode 11 V24.0
 *    - Signature Palette: Warm chestnut-brown back (#B4693E), warm cream belly (#FDE68A),
 *      signature dark-slate robber's mask (#1E293B) sweeping past both eyes, crisp #1E293B strokeWidth=4
 *    - 3 freezeState modes:
 *      * "normal": Warm chestnut-brown, sparkling dark eyes, gentle breathing
 *      * "frosting": Cool frost-tinted back, subtle ice crystals clinging along ridge
 *      * "frozen_solid": Ice-slate body (#94A3B8/#BAE6FD), milky-white frozen eyes, sharp 0-blur ice crust, 0 motion
 *    - Supports all 8 accessories (esp. "scarf_red"), ageVariant ("adult" | "baby" | "elder"),
 *      throatPuff (spring breath/chorus), heartGlowT (0..1 warm inner revive spark), 0 blur, 0 body wobble!
 * ========================================================================== */

export type CuteWoodFrogPose = "sit" | "hop" | "wave" | "frozen_flat";
export type WoodFrogFreezeState = "normal" | "frosting" | "frozen_solid";

export interface CuteWoodFrogProps extends AnimalSpriteBaseProps {
  pose?: CuteWoodFrogPose;
  freezeState?: WoodFrogFreezeState;
  hideEmotionBadge?: boolean;
  /** Gently expands vocal sac / throat for first spring breath & mating chorus */
  throatPuff?: boolean;
  /** 0..1 warm golden heartbeat glow inside chest when frozen_solid */
  heartGlowT?: number;
}

const WoodFrogIceCrustStatic: React.FC = React.memo(() => (
  <g id="wood-frog-ice-crust" stroke="#0284C7" strokeWidth={2.6} strokeLinejoin="round">
    {/* Translucent faceted ice plates encasing frozen frog (0 blur, pure crisp polygons) */}
    <polygon points="-66,-18 -46,-54 -8,-66 36,-58 68,-26 62,4 -62,4" fill="#BAE6FD" fillOpacity={0.34} />
    <polygon points="-58,-4 -40,-44 -22,-32 -36,2" fill="#E0F2FE" fillOpacity={0.55} />
    <polygon points="18,-56 44,-48 56,-14 34,-24" fill="#E0F2FE" fillOpacity={0.5} />
    {/* Sharp protruding crystal spikes along upper rim */}
    <polygon points="-44,-48 -54,-72 -30,-56" fill="#E0F2FE" fillOpacity={0.82} />
    <polygon points="-4,-62 4,-84 16,-60" fill="#BAE6FD" fillOpacity={0.85} />
    <polygon points="36,-52 54,-70 48,-40" fill="#E0F2FE" fillOpacity={0.82} />
    <polygon points="-62,-16 -78,-26 -58,-4" fill="#BAE6FD" fillOpacity={0.78} />
    <polygon points="60,-18 78,-28 62,-4" fill="#E0F2FE" fillOpacity={0.78} />
    {/* Crisp specular ice facets */}
    <path d="M -32,-48 L -14,-54 M 12,-46 L 28,-38 M -44,-22 L -28,-16" stroke="#FFFFFF" strokeWidth={2.4} opacity={0.85} />
  </g>
));
WoodFrogIceCrustStatic.displayName = "WoodFrogIceCrustStatic";

const WoodFrogFrostEdgeStatic: React.FC = React.memo(() => (
  <g id="wood-frog-frost-edge" stroke="#38BDF8" strokeWidth={2.2} strokeLinejoin="round">
    <polygon points="-40,-44 -48,-60 -30,-48" fill="#E0F2FE" fillOpacity={0.82} />
    <polygon points="10,-54 18,-68 24,-50" fill="#BAE6FD" fillOpacity={0.82} />
    <polygon points="44,-36 58,-46 50,-26" fill="#E0F2FE" fillOpacity={0.82} />
    <circle cx={-16} cy={-44} r={3.5} fill="#FFFFFF" stroke="none" opacity={0.85} />
    <circle cx={34} cy={-38} r={3} fill="#FFFFFF" stroke="none" opacity={0.85} />
  </g>
));
WoodFrogFrostEdgeStatic.displayName = "WoodFrogFrostEdgeStatic";

export const CuteWoodFrog: React.FC<CuteWoodFrogProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "sit",
  freezeState = "normal",
  emotion = "happy",
  accessory = "none",
  ageVariant = "adult",
  hideEmotionBadge = false,
  throatPuff = false,
  heartGlowT = 0,
}) => {
  const isFrozen = freezeState === "frozen_solid";
  const isFrosting = freezeState === "frosting";
  const isHopping = pose === "hop" && !isFrozen;
  const isWaving = pose === "wave" && !isFrozen;
  const isFlat = pose === "frozen_flat" || isFrozen;

  const ageScale = ageVariant === "baby" ? 0.72 : 1;
  const effScale = scale * ageScale;
  const dir = flipX ? -1 : 1;

  // Strictly 0 body wobble; frozen frog stays completely motionless!
  const breathY = isFrozen ? 1 : computeAnimalBreathScaleY(frame, 41);
  const hopArcY = isHopping ? -Math.abs(Math.sin(frame * 0.22)) * 34 : 0;
  const waveDeg = isWaving ? Math.sin(frame * 0.26) * 20 : 0;
  const puffScale = throatPuff && !isFrozen ? 1 + 0.22 * (0.5 + 0.5 * Math.sin(frame * 0.22)) : 1;

  // Palette locked by freezeState (chestnut brown #B4693E + cream #FDE68A -> frosting -> ice slate #94A3B8/#BAE6FD)
  const backColor = isFrozen ? "#94A3B8" : isFrosting ? "#8E7A70" : "#B4693E";
  const ridgeColor = isFrozen ? "#CBD5E1" : isFrosting ? "#A8988E" : "#C97D4F";
  const bellyColor = isFrozen ? "#BAE6FD" : isFrosting ? "#E2E8F0" : "#FDE68A";
  const legDarkColor = isFrozen ? "#64748B" : isFrosting ? "#736259" : "#96522C";
  const maskColor = isFrozen ? "#334155" : "#1E293B";

  const eyeRadius = ageVariant === "baby" ? 8.2 : 7.2;
  const blinking = !isFrozen && isAnimalBlinking(frame, 63);
  const effectiveHideBadge = hideEmotionBadge || isFrozen;

  return (
    <g
      id={`animal-cute-wood-frog-${pose}`}
      data-freeze-state={freezeState}
      transform={`translate(${x.toFixed(1)}, ${(y + hopArcY).toFixed(1)}) scale(${(dir * effScale).toFixed(3)}, ${effScale.toFixed(3)})`}
      stroke={INK}
      strokeWidth={STROKE_W}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {!isHopping && <FlatGroundShadow cy={4} rx={isFlat ? 68 : 62} ry={10} />}

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {/* Folded Back Hind Legs (or extended when hopping!) */}
        {isHopping ? (
          <g fill={legDarkColor}>
            <path d="M -38,-14 C -68,-6 -86,10 -92,22 C -76,20 -56,8 -34,-2 Z" />
            <path d="M 38,-14 C 66,-6 84,10 90,22 C 74,20 54,8 34,-2 Z" />
          </g>
        ) : (
          <g fill={legDarkColor}>
            {/* Left & Right folded muscular frog thighs + webbed feet */}
            <ellipse cx={-48} cy={-16} rx={22} ry={17} />
            <path d="M -68,-4 C -74,2 -64,6 -44,4 L -32,2 L -56,-8 Z" fill={backColor} />
            <ellipse cx={48} cy={-16} rx={22} ry={17} />
            <path d="M 68,-4 C 74,2 64,6 44,4 L 32,2 L 56,-8 Z" fill={backColor} />
          </g>
        )}

        {/* Plump Rounded Wood Frog Body */}
        <ellipse
          cx={0}
          cy={isFlat ? -24 : -30}
          rx={isFlat ? 54 : 50}
          ry={isFlat ? 26 : 33}
          fill={backColor}
        />

        {/* Subtle Dorsal Tan Ridge + Cel-Shade */}
        <path
          d={
            isFlat
              ? "M -34,-34 Q 0,-42 34,-34"
              : "M -32,-42 Q 0,-52 32,-42"
          }
          fill="none"
          stroke={ridgeColor}
          strokeWidth={4.5}
          opacity={0.75}
        />
        <ellipse
          cx={0}
          cy={isFlat ? -15 : -19}
          rx={isFlat ? 35 : 33}
          ry={isFlat ? 15 : 21}
          fill={bellyColor}
          stroke="none"
        />
        <path
          d={
            isFlat
              ? "M -46,-14 C -20,2 20,2 46,-14 C 20,-4 -20,-4 -46,-14 Z"
              : "M -44,-14 C -18,4 18,4 44,-14 C 18,-3 -18,-3 -44,-14 Z"
          }
          fill="#0F172A"
          opacity="0.11"
          stroke="none"
        />
        {ageVariant === "elder" && <AnimalElderDesatVeil cx={0} cy={-28} rx={48} ry={28} />}

        {/* Optional Vocal Sac / First-Breath Throat Puff */}
        {throatPuff && !isFrozen && (
          <ellipse
            cx={0}
            cy={-28}
            rx={(21 * puffScale).toFixed(1)}
            ry={(14 * puffScale).toFixed(1)}
            fill="#FEF3C7"
            stroke={INK}
            strokeWidth={3}
          />
        )}

        {/* Optional Warm Inner Heart Glow (Beat 5 & Beat 58 revive spark!) */}
        {heartGlowT > 0.01 && (
          <g id="wood-frog-inner-heart-glow" transform="translate(0, -24)" opacity={Math.min(1, heartGlowT).toFixed(2)}>
            <circle cx={0} cy={0} r={22} fill="#FACC15" opacity={0.28} stroke="none" />
            <circle cx={0} cy={0} r={13} fill="#FB7185" opacity={0.48} stroke="none" />
            <path
              d="M 0,7 C -9,1 -11,-6 -6,-9 C -3,-11 0,-7 0,-5 C 0,-7 3,-11 6,-9 C 11,-6 9,1 0,7 Z"
              fill="#FDE047"
              stroke="#EA580C"
              strokeWidth={1.8}
            />
          </g>
        )}

        {/* Front Arms: Standing / Waving */}
        {!isFlat && (
          <g>
            {/* Left arm planted firmly */}
            <path d="M -26,-26 C -34,-14 -32,-4 -26,2" fill="none" stroke={backColor} strokeWidth={11} />
            <path d="M -26,-26 C -34,-14 -32,-4 -26,2" fill="none" stroke={INK} strokeWidth={STROKE_W} />
            <ellipse cx={-26} cy={3} rx={8} ry={4.5} fill={backColor} strokeWidth={3} />

            {/* Right arm (waves happily when pose="wave") */}
            {isWaving ? (
              <g transform={`translate(28, -28) rotate(${(-46 + waveDeg).toFixed(1)})`}>
                <path d="M 0,0 C 10,-12 18,-22 24,-30" fill="none" stroke={backColor} strokeWidth={11} />
                <path d="M 0,0 C 10,-12 18,-22 24,-30" fill="none" stroke={INK} strokeWidth={STROKE_W} />
                <circle cx={26} cy={-32} r={7.5} fill={backColor} strokeWidth={3} />
              </g>
            ) : (
              <g>
                <path d="M 26,-26 C 34,-14 32,-4 26,2" fill="none" stroke={backColor} strokeWidth={11} />
                <path d="M 26,-26 C 34,-14 32,-4 26,2" fill="none" stroke={INK} strokeWidth={STROKE_W} />
                <ellipse cx={26} cy={3} rx={8} ry={4.5} fill={backColor} strokeWidth={3} />
              </g>
            )}
          </g>
        )}

        {/* Neck Accessory (e.g. Protagonist "scarf_red"!) */}
        {isNeckAccessory(accessory) && (
          <g>
            <AnimalAccessory type={accessory} anchorX={0} anchorY={isFlat ? -28 : -36} scale={0.96} />
            {isFrozen && (
              <rect
                x={-26}
                y={isFlat ? -35 : -43}
                width={52}
                height={14}
                rx={7}
                fill="#E0F2FE"
                opacity={0.42}
                stroke="#38BDF8"
                strokeWidth={2}
              />
            )}
          </g>
        )}

        {/* Head + Signature Wood Frog Dark Robber's Mask Sweeping Across Both Eyes */}
        <g transform={`translate(0, ${isFlat ? -40 : -52})`}>
          {/* Raised Frog Eye Bumps */}
          <circle cx={-21} cy={-16} r={14.5} fill={backColor} />
          <circle cx={21} cy={-16} r={14.5} fill={backColor} />

          {/* Wide Friendly Amphibian Head Dome */}
          <ellipse cx={0} cy={0} rx={42} ry={24} fill={backColor} />

          {/* Signature Wood Frog Dark Mask Sweeping Behind/Across Eyes */}
          <path
            d="M -41,-4 C -36,-16 -16,-18 -6,-10 C -4,-4 -14,2 -32,2 C -38,2 -41,0 -41,-4 Z"
            fill={maskColor}
            stroke="none"
          />
          <path
            d="M 41,-4 C 36,-16 16,-18 6,-10 C 4,-4 14,2 32,2 C 38,2 41,0 41,-4 Z"
            fill={maskColor}
            stroke="none"
          />
          {/* Authentic Crisp Thin White Upper-Lip Stripe */}
          <path
            d="M -33,3 Q 0,9 33,3"
            fill="none"
            stroke={isFrozen ? "#E0F2FE" : "#F8FAFC"}
            strokeWidth={3.2}
            opacity={0.85}
          />

          {/* Eyes: Milky-White Frozen vs Expressive CreatureFace */}
          {isFrozen ? (
            <g id="wood-frog-frozen-eyes">
              <circle cx={-21} cy={-13} r={eyeRadius + 1.5} fill="#F1F5F9" stroke="#334155" strokeWidth={2.8} />
              <circle cx={21} cy={-13} r={eyeRadius + 1.5} fill="#F1F5F9" stroke="#334155" strokeWidth={2.8} />
              <circle cx={-21} cy={-13} r={eyeRadius * 0.55} fill="#CBD5E1" stroke="none" />
              <circle cx={21} cy={-13} r={eyeRadius * 0.55} fill="#CBD5E1" stroke="none" />
              {/* Tiny crystalline frost glints */}
              <path d="M -25,-16 L -18,-10 M 17,-16 L 24,-10" stroke="#FFFFFF" strokeWidth={2} />
              {/* Still frozen mouth line */}
              <path d="M -14,9 Q 0,11 14,9" fill="none" stroke={INK} strokeWidth={2.8} />
            </g>
          ) : (
            <g>
              {/* Soft white sclera behind cute sparkling eyes */}
              {!blinking && emotion !== "sleepy" && (
                <>
                  <circle cx={-21} cy={-13} r={eyeRadius + 2.2} fill="#FFFFFF" stroke={INK} strokeWidth={2.6} />
                  <circle cx={21} cy={-13} r={eyeRadius + 2.2} fill="#FFFFFF" stroke={INK} strokeWidth={2.6} />
                </>
              )}
              <CreatureFace
                emotion={emotion}
                ageVariant={ageVariant}
                frame={frame}
                blinkSeed={63}
                flipX={flipX}
                layout="front"
                mouthStyle="smile"
                eyeSpread={21}
                eyeY={-13}
                eyeRadius={eyeRadius - 0.6}
                cheekSpread={29}
                cheekY={5}
                mouthY={10}
                badgeX={44}
                badgeY={-26}
                hideEmotionBadge={effectiveHideBadge}
              />
            </g>
          )}

          {accessory === "glasses_round" && (
            <AnimalAccessory type="glasses_round" anchorX={0} anchorY={-13} eyeSpread={21} scale={0.96} />
          )}
          {isHeadAccessory(accessory) && (
            <AnimalAccessory
              type={accessory}
              anchorX={accessory === "flower_pink" ? -26 : 0}
              anchorY={accessory === "flower_pink" ? -24 : -30}
              scale={0.86}
            />
          )}
        </g>

        {/* Frosting or Solid Ice Encasement Overlay (0 blur!) */}
        {isFrosting && <WoodFrogFrostEdgeStatic />}
        {isFrozen && <WoodFrogIceCrustStatic />}
      </g>
    </g>
  );
};
