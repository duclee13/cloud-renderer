import React from "react";

const INK = "#1E293B";
const STROKE_W = 4;

export interface AnimalSpriteBaseProps {
  x: number;
  y: number;
  scale?: number;
  flipX?: boolean;
  frame: number;
}

function isAnimalBlinking(frame: number, seedOffset = 0): boolean {
  const f = Math.abs(Math.floor(frame + seedOffset)) % 110;
  return f >= 105;
}

function computeAnimalBreathScaleY(frame: number, seedOffset = 0): number {
  return 1 + 0.015 * Math.sin((frame + seedOffset) * 0.08);
}

/* ============================================================================
 * 1. CuteCat — Cream-orange (#FDBA74) or silver-gray (#E2E8F0) 2D Cartoon Cat
 *    Poses: "sit" | "stand" | "curl_midair" | "puff_fur"
 *    Matches BOY stroke="#1E293B" strokeWidth={4} + flat opacity="0.12" shadow
 * ========================================================================== */

export type CuteCatPose = "sit" | "stand" | "curl_midair" | "puff_fur";

export interface CuteCatProps extends AnimalSpriteBaseProps {
  pose?: CuteCatPose;
  variant?: "orange" | "gray";
}

export const CuteCat: React.FC<CuteCatProps> = ({
  x,
  y,
  scale = 1,
  flipX = false,
  frame,
  pose = "sit",
  variant = "orange",
}) => {
  const furMain = variant === "gray" ? "#E2E8F0" : "#FDBA74";
  const furLight = variant === "gray" ? "#F8FAFC" : "#FFEDD5";
  const furStripe = variant === "gray" ? "#94A3B8" : "#EA580C";
  const blink = isAnimalBlinking(frame, 17);
  const breathY = computeAnimalBreathScaleY(frame, 0);
  const tailWag = Math.sin(frame * 0.09) * (pose === "puff_fur" ? 5 : 14);
  const midairRot = pose === "curl_midair" ? Math.sin(frame * 0.14) * 14 : 0;
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
      {/* Flat Ground Shadow (0 blur; omitted when cat is tumbling mid-air in curl_midair) */}
      {pose !== "curl_midair" && (
        <ellipse
          cx={0}
          cy={4}
          rx={pose === "stand" || pose === "puff_fur" ? 64 : 52}
          ry={11}
          fill="#0F172A"
          opacity="0.12"
          stroke="none"
        />
      )}

      <g transform={`rotate(${midairRot.toFixed(1)}) scale(1, ${breathY.toFixed(4)})`}>
        {pose === "curl_midair" ? (
          /* Midair Righting Reflex Pose (for falling cat episode) */
          <g transform="translate(0, -68)">
            {/* Curved balancing tail */}
            <path
              d={`M -52,-4 Q -88,-38 -74,-74`}
              fill="none"
              stroke={furMain}
              strokeWidth={14}
            />
            <path d="M -52,-4 Q -88,-38 -74,-74" fill="none" stroke={INK} strokeWidth={4} />
            {/* Arched airborne torso twisting paws downward */}
            <path
              d="M -54,-6 C -48,-46 38,-48 52,-6 C 58,14 34,26 0,20 C -34,26 -58,14 -54,-6 Z"
              fill={furMain}
            />
            {/* 4 outstretched landing paws */}
            <path d="M -38,16 L -48,46 M -18,18 L -22,50 M 22,18 L 28,50 M 42,16 L 54,44" stroke={INK} strokeWidth={9} />
            <path d="M -38,16 L -48,46 M -18,18 L -22,50 M 22,18 L 28,50 M 42,16 L 54,44" stroke={furLight} strokeWidth={3.5} />
            {/* Alert Head facing forward-down */}
            <g transform="translate(56, -24)">
              <polygon points="-24,-18 -28,-48 -4,-30" fill={furMain} />
              <polygon points="24,-18 28,-48 4,-30" fill={furMain} />
              <polygon points="-20,-22 -22,-38 -9,-28" fill="#FBCFE8" stroke="none" />
              <polygon points="20,-22 22,-38 9,-28" fill="#FBCFE8" stroke="none" />
              <circle cx={0} cy={0} r={30} fill={furMain} />
              <ellipse cx={0} cy={10} rx={16} ry={11} fill={furLight} stroke="none" />
              {blink ? (
                <>
                  <line x1={-16} y1={-4} x2={-6} y2={-4} />
                  <line x1={6} y1={-4} x2={16} y2={-4} />
                </>
              ) : (
                <>
                  <circle cx={-11} cy={-4} r={5} fill={INK} stroke="none" />
                  <circle cx={11} cy={-4} r={5} fill={INK} stroke="none" />
                </>
              )}
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              {/* Whiskers */}
              <path d="M -22,6 L -38,2 M -22,12 L -38,14 M 22,6 L 38,2 M 22,12 L 38,14" strokeWidth={2.4} />
            </g>
          </g>
        ) : pose === "puff_fur" ? (
          /* Startled Puffed-Up Cat (reusable for Episode 8 & Cat episodes!) */
          <g>
            {/* Bristled upright puffy tail */}
            <g transform={`translate(-54, -68) rotate(${(-12 + tailWag).toFixed(1)})`}>
              <path d="M 0,0 C -36,-22 -38,-78 -8,-102 C 12,-82 14,-34 10,0 Z" fill={furMain} />
            </g>
            {/* High arched puffed body */}
            <path
              d="M -56,-34 C -58,-118 -8,-146 28,-134 C 66,-122 68,-64 56,-34 L 44,-34 L 46,0 L 28,0 L 26,-32 L -26,-32 L -28,0 L -46,0 L -44,-34 Z"
              fill={furMain}
            />
            {/* Bristled fur spikes along arched spine (cleanly behind head/ears) */}
            <path
              d="M -46,-84 L -56,-102 L -36,-106 L -34,-128 L -14,-124 L -2,-146 L 14,-132 L 26,-144 L 30,-124"
              fill="none"
              stroke={furStripe}
              strokeWidth={4}
            />
            {/* Startled wide-eyed cat head */}
            <g transform="translate(56, -98)">
              <polygon points="-24,-18 -30,-48 -4,-30" fill={furMain} />
              <polygon points="24,-18 30,-48 4,-30" fill={furMain} />
              <polygon points="-20,-22 -24,-39 -9,-28" fill="#FBCFE8" stroke="none" />
              <polygon points="20,-22 24,-39 9,-28" fill="#FBCFE8" stroke="none" />
              <circle cx={0} cy={0} r={32} fill={furMain} />
              <circle cx={-11} cy={-4} r={8} fill="#FFFFFF" strokeWidth={3} />
              <circle cx={-11} cy={-4} r={3.5} fill={INK} stroke="none" />
              <circle cx={11} cy={-4} r={8} fill="#FFFFFF" strokeWidth={3} />
              <circle cx={11} cy={-4} r={3.5} fill={INK} stroke="none" />
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <ellipse cx={0} cy={17} rx={6} ry={5} fill="#9F1239" strokeWidth={2.5} />
              <path d="M -24,6 L -40,2 M -24,12 L -40,15 M 24,6 L 40,2 M 24,12 L 40,15" strokeWidth={2.4} />
            </g>
          </g>
        ) : pose === "stand" ? (
          /* Standing Happy Cat */
          <g>
            {/* Swaying curved tail */}
            <g transform={`translate(-54, -64) rotate(${tailWag.toFixed(1)})`}>
              <path d="M 0,0 Q -32,-26 -16,-64" fill="none" stroke={INK} strokeWidth={13} />
              <path d="M 0,0 Q -32,-26 -16,-64" fill="none" stroke={furMain} strokeWidth={6.5} />
            </g>
            {/* 4 neat legs touching y=0 */}
            <rect x={-44} y={-46} width={16} height={46} rx={7} fill={furMain} />
            <rect x={-18} y={-44} width={16} height={44} rx={7} fill={furMain} />
            <rect x={16} y={-44} width={16} height={44} rx={7} fill={furMain} />
            <rect x={34} y={-46} width={16} height={46} rx={7} fill={furMain} />
            {/* Rounded body */}
            <ellipse cx={0} cy={-58} rx={58} ry={34} fill={furMain} />
            <ellipse cx={6} cy={-50} rx={34} ry={18} fill={furLight} stroke="none" />
            {/* Head */}
            <g transform="translate(52, -96)">
              <polygon points="-22,-18 -26,-48 -4,-30" fill={furMain} />
              <polygon points="22,-18 26,-48 4,-30" fill={furMain} />
              <polygon points="-18,-22 -21,-38 -8,-28" fill="#FBCFE8" stroke="none" />
              <polygon points="18,-22 21,-38 8,-28" fill="#FBCFE8" stroke="none" />
              <circle cx={0} cy={0} r={32} fill={furMain} />
              <ellipse cx={0} cy={11} rx={17} ry={12} fill={furLight} stroke="none" />
              {blink ? (
                <>
                  <path d="M -16,-4 Q -11,-1 -6,-4" fill="none" />
                  <path d="M 6,-4 Q 11,-1 16,-4" fill="none" />
                </>
              ) : (
                <>
                  <circle cx={-11} cy={-5} r={4.8} fill={INK} stroke="none" />
                  <circle cx={11} cy={-5} r={4.8} fill={INK} stroke="none" />
                </>
              )}
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <path d="M -8,14 Q -4,19 0,14 Q 4,19 8,14" fill="none" strokeWidth={2.8} />
              <path d="M -24,6 L -40,2 M -24,12 L -40,14 M 24,6 L 40,2 M 24,12 L 40,14" strokeWidth={2.4} />
            </g>
          </g>
        ) : (
          /* Default Sitting Cute Cat */
          <g>
            {/* Swaying curved tail wrapping around */}
            <g transform={`translate(-38, -24) rotate(${tailWag.toFixed(1)})`}>
              <path d="M 0,0 Q -36,-22 -24,-62" fill="none" stroke={INK} strokeWidth={13} />
              <path d="M 0,0 Q -36,-22 -24,-62" fill="none" stroke={furMain} strokeWidth={6.5} />
            </g>
            {/* Sitting pear body grounded at y=0 */}
            <path
              d="M -42,0 C -46,-54 -28,-92 0,-92 C 28,-92 46,-54 42,0 Z"
              fill={furMain}
            />
            <ellipse cx={0} cy={-38} rx={22} ry={30} fill={furLight} stroke="none" />
            {/* Front neat paws at y=0 */}
            <ellipse cx={-15} cy={-4} rx={12} ry={8} fill={furLight} />
            <ellipse cx={15} cy={-4} rx={12} ry={8} fill={furLight} />
            {/* Head */}
            <g transform="translate(0, -112)">
              <polygon points="-24,-18 -28,-50 -4,-30" fill={furMain} />
              <polygon points="24,-18 28,-50 4,-30" fill={furMain} />
              <polygon points="-20,-22 -23,-39 -8,-28" fill="#FBCFE8" stroke="none" />
              <polygon points="20,-22 23,-39 8,-28" fill="#FBCFE8" stroke="none" />
              <circle cx={0} cy={0} r={34} fill={furMain} />
              {/* Forehead tabby stripes */}
              <path d="M -8,-28 L -6,-18 M 0,-30 L 0,-18 M 8,-28 L 6,-18" stroke={furStripe} strokeWidth={3.2} />
              <ellipse cx={0} cy={12} rx={18} ry={12} fill={furLight} stroke="none" />
              {blink ? (
                <>
                  <path d="M -17,-4 Q -11,-1 -5,-4" fill="none" />
                  <path d="M 5,-4 Q 11,-1 17,-4" fill="none" />
                </>
              ) : (
                <>
                  <circle cx={-12} cy={-5} r={5} fill={INK} stroke="none" />
                  <circle cx={12} cy={-5} r={5} fill={INK} stroke="none" />
                </>
              )}
              <polygon points="-4,5 4,5 0,10" fill="#FB7185" stroke="none" />
              <path d="M -8,14 Q -4,19 0,14 Q 4,19 8,14" fill="none" strokeWidth={2.8} />
              <path d="M -25,6 L -42,2 M -25,12 L -42,15 M 25,6 L 42,2 M 25,12 L 42,15" strokeWidth={2.4} />
            </g>
          </g>
        )}
      </g>
    </g>
  );
};

/* ============================================================================
 * 2. CuteDog — Warm golden-brown (#F59E0B / #FEF3C7) 2D Cartoon Dog
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
}) => {
  const blink = isAnimalBlinking(frame, 43);
  const breathY = computeAnimalBreathScaleY(frame, 20);
  const wagFreq = pose === "wag" ? 0.42 : 0.16;
  const wagAmp = pose === "wag" ? 24 : 9;
  const tailDeg = Math.sin(frame * wagFreq) * wagAmp;
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
      <ellipse cx={0} cy={4} rx={isStanding ? 68 : 56} ry={12} fill="#0F172A" opacity="0.12" stroke="none" />

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {/* Wagging Tail */}
        <g transform={`translate(${isStanding ? -58 : -44}, ${isStanding ? -68 : -32}) rotate(${tailDeg.toFixed(1)})`}>
          <path d="M 0,0 Q -26,-28 -18,-56" fill="none" stroke={INK} strokeWidth={14} />
          <path d="M 0,0 Q -26,-28 -18,-56" fill="none" stroke="#D97706" strokeWidth={7} />
        </g>

        {isStanding ? (
          <>
            <rect x={-48} y={-48} width={18} height={48} rx={7} fill="#F59E0B" />
            <rect x={-18} y={-46} width={18} height={46} rx={7} fill="#F59E0B" />
            <rect x={16} y={-46} width={18} height={46} rx={7} fill="#F59E0B" />
            <rect x={36} y={-48} width={18} height={48} rx={7} fill="#F59E0B" />
            <ellipse cx={0} cy={-64} rx={62} ry={36} fill="#F59E0B" />
            <ellipse cx={8} cy={-54} rx={36} ry={18} fill="#FEF3C7" stroke="none" />
            {/* Red collar */}
            <path d="M 28,-86 Q 44,-68 50,-48" fill="none" stroke="#DC2626" strokeWidth={9} />
            <circle cx={46} cy={-48} r={6} fill="#FACC15" strokeWidth={2.4} />
          </>
        ) : (
          <>
            <path d="M -46,0 C -50,-56 -30,-96 0,-96 C 30,-96 50,-56 46,0 Z" fill="#F59E0B" />
            <ellipse cx={0} cy={-38} rx={24} ry={32} fill="#FEF3C7" stroke="none" />
            <ellipse cx={-16} cy={-4} rx={14} ry={9} fill="#FBBF24" />
            <ellipse cx={16} cy={-4} rx={14} ry={9} fill="#FBBF24" />
            <path d="M -26,-86 Q 0,-74 26,-86" fill="none" stroke="#DC2626" strokeWidth={9} />
            <circle cx={0} cy={-74} r={6} fill="#FACC15" strokeWidth={2.4} />
          </>
        )}

        {/* Expressive Dog Head */}
        <g transform={`translate(${isStanding ? 56 : 0}, ${isStanding ? -102 : -118})`}>
          {/* Floppy Brown Ears */}
          <ellipse cx={-32} cy={4} rx={13} ry={28} transform="rotate(14, -32, 4)" fill="#92400E" />
          <ellipse cx={32} cy={4} rx={13} ry={28} transform="rotate(-14, 32, 4)" fill="#92400E" />
          {/* Golden Head + Cream Muzzle */}
          <circle cx={0} cy={0} r={36} fill="#FBBF24" />
          <ellipse cx={0} cy={12} rx={22} ry={16} fill="#FEF3C7" stroke="none" />
          {/* Round Black Nose */}
          <ellipse cx={0} cy={4} rx={8} ry={6} fill={INK} stroke="none" />
          {/* Eyes */}
          {pose === "wag" ? (
            <>
              <path d="M -18,-8 Q -12,-15 -6,-8" fill="none" />
              <path d="M 6,-8 Q 12,-15 18,-8" fill="none" />
            </>
          ) : pose === "yawn" || blink ? (
            <>
              <path d="M -18,-8 Q -12,-3 -6,-8" fill="none" />
              <path d="M 6,-8 Q 12,-3 18,-8" fill="none" />
            </>
          ) : (
            <>
              <circle cx={-12} cy={-9} r={5} fill={INK} stroke="none" />
              <circle cx={12} cy={-9} r={5} fill={INK} stroke="none" />
            </>
          )}
          {/* Mouth */}
          {pose === "yawn" ? (
            <g>
              <ellipse cx={0} cy={19} rx={10 + yawnAmt * 4} ry={9 + yawnAmt * 5} fill="#9F1239" strokeWidth={3} />
              <ellipse cx={0} cy={24 + yawnAmt * 2} rx={7} ry={4.5} fill="#FB7185" stroke="none" />
            </g>
          ) : (
            <path d="M -10,16 Q 0,25 10,16" fill="none" strokeWidth={3.2} />
          )}
        </g>
      </g>
    </g>
  );
};

/* ============================================================================
 * 3. CuteBird — Pastel blue (#38BDF8) or yellow (#FDE047) 2D Cartoon Bird
 *    Poses: "perch" (head tilt) | "fly" (wing flap via Math.sin(frame * 0.35))
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
}) => {
  const bodyColor = variant === "yellow" ? "#FDE047" : "#38BDF8";
  const wingColor = variant === "yellow" ? "#F59E0B" : "#0284C7";
  const bellyColor = variant === "yellow" ? "#FEF9C3" : "#E0F2FE";
  const blink = isAnimalBlinking(frame, 71);
  const breathY = computeAnimalBreathScaleY(frame, 35);
  const wingDeg = pose === "fly" ? Math.sin(frame * 0.35) * 42 : Math.sin(frame * 0.08) * 3;
  const headTilt = pose === "perch" ? Math.sin(frame * 0.06) * 8 : 0;
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
      {/* Flat Ground Shadow (only when perched on a branch/surface) */}
      {pose === "perch" && (
        <ellipse
          cx={0}
          cy={3}
          rx={34}
          ry={7}
          fill="#0F172A"
          opacity="0.12"
          stroke="none"
        />
      )}

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {/* Slim Bird Legs when perched */}
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

        {/* Neat Tail Feathers */}
        <polygon points="-34,-46 -66,-64 -58,-38" fill={wingColor} />

        {/* Back Wing (visible when flying) */}
        {pose === "fly" && (
          <g transform={`translate(-4, -56) rotate(${(-24 - wingDeg).toFixed(1)})`}>
            <path d="M 0,0 C -18,-36 -48,-46 -56,-14 C -42,4 -16,8 0,0 Z" fill={wingColor} />
          </g>
        )}

        {/* Plump Pastel Body */}
        <ellipse cx={0} cy={-48} rx={38} ry={30} fill={bodyColor} />
        <ellipse cx={8} cy={-42} rx={22} ry={18} fill={bellyColor} stroke="none" />

        {/* Head with subtle perch tilt */}
        <g transform={`translate(24, -70) rotate(${headTilt.toFixed(1)})`}>
          <circle cx={0} cy={0} r={24} fill={bodyColor} />
          {/* Neat Orange Beak */}
          <polygon points="20,-5 38,2 20,9" fill="#F97316" />
          {/* Cute Eye */}
          {blink ? (
            <line x1={4} y1={-5} x2={13} y2={-5} />
          ) : (
            <g>
              <circle cx={8} cy={-5} r={5} fill={INK} stroke="none" />
              <circle cx={10} cy={-7} r={1.8} fill="#FFFFFF" stroke="none" />
            </g>
          )}
        </g>

        {/* Front Wing (flapping smoothly in fly pose) */}
        <g transform={`translate(-4, -48) rotate(${wingDeg.toFixed(1)})`}>
          <path
            d={pose === "fly" ? "M 0,0 C -12,-38 14,-56 36,-32 C 26,-6 12,4 0,0 Z" : "M -18,-6 C -6,-18 18,-10 14,8 C 2,16 -18,10 -18,-6 Z"}
            fill={wingColor}
          />
        </g>
      </g>
    </g>
  );
};

/* ============================================================================
 * 4. CuteAnt — Warm reddish-brown (#B45309) 2D Cartoon Ant
 *    3 clean rounded segments, 2 vibrating antennae, 6 alternating legs
 *    Poses: "walk" | "carry" (carrying green leaf above head)
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
}) => {
  const blink = isAnimalBlinking(frame, 89);
  const breathY = computeAnimalBreathScaleY(frame, 55);
  const legA = Math.sin(frame * 0.28) * 10;
  const legB = -legA;
  const antVib = Math.sin(frame * 0.32) * 5;
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
      {/* Flat Ground Shadow */}
      <ellipse cx={0} cy={3} rx={62} ry={9} fill="#0F172A" opacity="0.12" stroke="none" />

      <g transform={`scale(1, ${breathY.toFixed(4)})`}>
        {/* 6 Alternating Tripod-Gait Legs */}
        <g fill="none" stroke={INK} strokeWidth={3.6}>
          {/* Back legs */}
          <path d={`M -28,-28 L ${(-44 + legA).toFixed(1)},-12 L ${(-50 + legA).toFixed(1)},0`} />
          <path d={`M -18,-26 L ${(-28 + legB).toFixed(1)},-12 L ${(-32 + legB).toFixed(1)},0`} />
          {/* Middle legs */}
          <path d={`M -2,-26 L ${(-6 + legB).toFixed(1)},-12 L ${(-8 + legB).toFixed(1)},0`} />
          <path d={`M 8,-26 L ${(12 + legA).toFixed(1)},-12 L ${(14 + legA).toFixed(1)},0`} />
          {/* Front legs */}
          <path d={`M 22,-26 L ${(32 + legA).toFixed(1)},-12 L ${(38 + legA).toFixed(1)},0`} />
          <path d={`M 30,-26 L ${(44 + legB).toFixed(1)},-12 L ${(52 + legB).toFixed(1)},0`} />
        </g>

        {/* 3 Clean Rounded Segments: Abdomen -> Thorax -> Head */}
        <ellipse cx={-38} cy={-38} rx={26} ry={20} fill="#92400E" />
        <ellipse cx={-42} cy={-44} rx={12} ry={6} fill="#D97706" stroke="none" opacity={0.5} />
        <ellipse cx={2} cy={-34} rx={18} ry={14} fill="#B45309" />
        <circle cx={38} cy={-44} r={22} fill="#B45309" />

        {/* 2 Vibrating Antennae */}
        <path
          d={`M 44,-64 Q ${(56 + antVib * 0.5).toFixed(1)},${(-84 + antVib).toFixed(1)} ${(68 + antVib).toFixed(1)},${(-78 + antVib).toFixed(1)}`}
          fill="none"
          strokeWidth={3.2}
        />
        <path
          d={`M 32,-64 Q ${(38 - antVib * 0.4).toFixed(1)},${(-88 - antVib).toFixed(1)} ${(50 - antVib).toFixed(1)},${(-84 - antVib).toFixed(1)}`}
          fill="none"
          strokeWidth={3.2}
        />

        {/* Cute Eye & Smile */}
        {blink ? (
          <line x1={42} y1={-48} x2={50} y2={-48} strokeWidth={3} />
        ) : (
          <g>
            <circle cx={46} cy={-48} r={5.5} fill="#FFFFFF" strokeWidth={2.4} />
            <circle cx={48} cy={-48} r={2.6} fill={INK} stroke="none" />
          </g>
        )}
        <path d="M 46,-34 Q 52,-30 56,-34" fill="none" strokeWidth={2.8} />

        {/* Carried Green Leaf Overhead when pose="carry" */}
        {pose === "carry" && (
          <g transform={`translate(24, ${(-84 + Math.sin(frame * 0.2) * 2.5).toFixed(1)}) rotate(-12)`}>
            <path
              d="M -46,6 C -34,-26 24,-34 52,-4 C 24,22 -24,24 -46,6 Z"
              fill="#22C55E"
              stroke={INK}
              strokeWidth={3.5}
            />
            <path d="M -38,4 Q 4,-6 44,-4" fill="none" stroke="#15803D" strokeWidth={2.8} />
          </g>
        )}
      </g>
    </g>
  );
};
