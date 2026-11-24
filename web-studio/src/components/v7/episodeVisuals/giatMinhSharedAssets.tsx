import React from 'react';

export const INK = '#1e293b';
export const FONT = 'Inter, "Segoe UI", Arial, sans-serif';

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** Clean auto-sized pill label that NEVER overflows text and stays crisp at 1080p */
export const CleanLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  bg?: string;
  color?: string;
  border?: string;
  fontSize?: number;
}> = ({ x, y, text, bg = '#ffffff', color = INK, border = INK, fontSize = 26 }) => {
  const estWidth = Math.max(180, text.length * fontSize * 0.62 + 64);
  const h = fontSize + 28;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-estWidth / 2}
        y={-h / 2}
        width={estWidth}
        height={h}
        rx={h / 2}
        fill={bg}
        stroke={border}
        strokeWidth="4"
      />
      <text
        x="0"
        y={fontSize * 0.35}
        textAnchor="middle"
        fill={color}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily={FONT}
      >
        {text}
      </text>
    </g>
  );
};

/** Short crisp speech bubble for storytelling beats */
export const ShortSpeechBubble: React.FC<{
  x: number;
  y: number;
  text: string;
  tailDir?: 'LEFT' | 'RIGHT' | 'CENTER';
}> = ({ x, y, text, tailDir = 'CENTER' }) => {
  const w = Math.max(176, text.length * 14.2 + 56);
  const h = 54;
  const tailX = tailDir === 'LEFT' ? -w * 0.22 : tailDir === 'RIGHT' ? w * 0.22 : 0;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="27" fill="#ffffff" stroke={INK} strokeWidth="4" />
      <path
        d={`M${tailX - 10} ${h / 2 - 2} L${tailX} ${h / 2 + 16} L${tailX + 12} ${h / 2 - 2} Z`}
        fill="#ffffff"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect x={tailX - 12} y={h / 2 - 6} width="26" height="8" fill="#ffffff" />
      <text x="0" y="8" textAnchor="middle" fill={INK} fontSize="22" fontWeight="700" fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
};

export type GiatMinhStickmanPose =
  | 'IDLE'
  | 'SLEEP_BED'
  | 'JERK_AWAKE'
  | 'FALLING'
  | 'SIT_DESK'
  | 'SLUMP_DESK'
  | 'STRETCH_MORNING'
  | 'PAT_SHOULDER'
  | 'HAPPY_WAVE';

export type GiatMinhStickmanExpression =
  | 'HAPPY'
  | 'SLEEPY'
  | 'SLEEPING'
  | 'EXHAUSTED'
  | 'SHOCKED'
  | 'WORRIED'
  | 'PROUD'
  | 'NEUTRAL';

/**
 * Soft curved quilt/blanket draped naturally over torso & upper legs on the bed
 * (never a harsh rectangle cutting across feet; leaves head, neck, pillow & ankles natural).
 */
export const CozyBedBlanket: React.FC<{
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  accentFill?: string;
  kickLift?: number;
  breathOffset?: number;
}> = ({
  x,
  y,
  width = 360,
  height = 76,
  fill = '#2563eb',
  accentFill = '#60a5fa',
  kickLift = 0,
  breathOffset = 0,
}) => {
  const topArch = -24 - breathOffset - kickLift * 0.55;
  const footLift = -kickLift * 0.35;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Main rounded soft duvet */}
      <path
        d={`M0 8 C18 ${topArch} ${width * 0.55} ${topArch - 6} ${width} ${10 + footLift} C${width + 12} ${height * 0.55 + footLift} ${width + 4} ${height} ${width - 14} ${height} L14 ${height} C-4 ${height} -8 ${height * 0.45} 0 8 Z`}
        fill={fill}
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      {/* Folded top collar trim near chest/shoulders */}
      <path
        d={`M4 12 C12 ${topArch + 6} 34 ${topArch + 4} 46 8 L38 ${height - 4} L12 ${height - 4} Z`}
        fill={accentFill}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Subtle soft quilt seam curves */}
      <path
        d={`M${width * 0.36} ${topArch * 0.45 + 10} Q${width * 0.4} ${height * 0.55} ${width * 0.34} ${height - 8}`}
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d={`M${width * 0.68} ${topArch * 0.35 + 12} Q${width * 0.72} ${height * 0.55} ${width * 0.66} ${height - 8}`}
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
    </g>
  );
};

/**
 * Consistent full-body V21.0 Stickman matching StickmanRig.tsx:
 * - BOY: black wavy hair dome on top, normal 2D eyes
 * - GRANDPA: bald top with two gray/white side hair tufts, gray mustache, brown buttoned vest
 * - DOCTOR: neat short black hair, round glasses, white lab coat with stethoscope
 * - SLEEP_BED / JERK_AWAKE: Head rests naturally propped on pillow at a gentle -12°..0° angle
 *   (face upright/slightly angled up, neck smoothly joined to shoulders, zero blocky rectangles!)
 */
export const SharedStickman: React.FC<{
  x: number;
  y: number;
  scale?: number;
  role: 'BOY' | 'GRANDPA' | 'DOCTOR';
  facing?: 'LEFT' | 'RIGHT';
  pose?: GiatMinhStickmanPose;
  expression?: GiatMinhStickmanExpression;
  frame?: number;
  rotationDeg?: number;
  limbColor?: string;
}> = ({
  x,
  y,
  scale = 1,
  role,
  facing = 'RIGHT',
  pose = 'IDLE',
  expression = 'HAPPY',
  frame = 0,
  rotationDeg = 0,
  limbColor = INK,
}) => {
  const dir = facing === 'RIGHT' ? 1 : -1;
  const breath = Math.sin(frame * 0.075) * 1.6;
  const waveOffset = Math.sin(frame * 0.22) * 13;
  const stretchBreath = Math.sin(frame * 0.1) * 4;
  const fallFlail = Math.sin(frame * 0.34) * 10;
  const jerkTremor = pose === 'JERK_AWAKE' ? Math.sin(frame * 0.42) * 2.2 : 0;

  // Bed poses: hip at (0, 0) on mattress, legs extending right (+X) with natural bent knees,
  // torso & neck reclining gently up-left onto pillow, head at natural -12° (or -4° when jolting awake)
  if (pose === 'SLEEP_BED' || pose === 'JERK_AWAKE') {
    const isJerking = pose === 'JERK_AWAKE';
    const sleepChestRise = Math.sin(frame * 0.07) * 2;

    const shoulderX = isJerking ? -66 : -88;
    const shoulderY = isJerking ? -58 : -24 - sleepChestRise;
    const neckX = isJerking ? -74 : -104;
    const neckY = isJerking ? -74 : -34 - sleepChestRise;
    const headX = isJerking ? -84 : -128;
    const headY = isJerking ? -108 : -56 - sleepChestRise;
    const bedHeadDeg = isJerking ? -4 : -12;

    return (
      <g transform={`translate(${x}, ${y}) rotate(${rotationDeg})`}>
        <g transform={`scale(${scale * dir}, ${scale})`}>
          {/* Legs on bed — pure stickman lines with natural bent knees */}
          {isJerking ? (
            <g stroke={limbColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Back leg bent on mattress */}
              <path d="M0 4 L58 -10 L116 8" />
              {/* Front leg kicking upward in reflex */}
              <path d={`M0 0 L52 ${-50 + jerkTremor} L110 ${-80 - jerkTremor}`} />
            </g>
          ) : (
            <g stroke={limbColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M0 4 L60 -10 L118 6" />
              <path d="M-2 -2 L56 -18 L112 -2" />
            </g>
          )}

          {/* Back Arm (natural bent elbow) */}
          {isJerking ? (
            <path
              d={`M${shoulderX} ${shoulderY} L${shoulderX + 36} ${shoulderY - 34 + jerkTremor} L${shoulderX + 76} ${shoulderY - 22 - jerkTremor}`}
              fill="none"
              stroke={limbColor}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d={`M${shoulderX} ${shoulderY} L${shoulderX + 32} ${shoulderY - 12} L${shoulderX + 64} ${shoulderY - 2}`}
              fill="none"
              stroke={limbColor}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Spine + Neck smoothly connecting hip -> shoulder -> head */}
          <path
            d={`M0 0 L${shoulderX} ${shoulderY} L${neckX} ${neckY}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Front Arm resting gently on chest/abdomen (or reflexively raised in JERK_AWAKE) */}
          {isJerking ? (
            <path
              d={`M${shoulderX} ${shoulderY + 4} L${shoulderX + 42} ${shoulderY - 16 - jerkTremor} L${shoulderX + 82} ${shoulderY - 4 + jerkTremor}`}
              fill="none"
              stroke={limbColor}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d={`M${shoulderX + 2} ${shoulderY + 4} L${shoulderX + 34} ${shoulderY + 22} L${shoulderX + 68} ${shoulderY + 12}`}
              fill="none"
              stroke={limbColor}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Head resting naturally on pillow at gentle -12°..0° angle (NEVER face-down!) */}
          <g transform={`translate(${headX}, ${headY}) rotate(${bedHeadDeg})`}>
            <StickmanHead role={role} expression={expression} frame={frame} />
          </g>
        </g>
      </g>
    );
  }

  const headTiltDeg =
    pose === 'SLUMP_DESK'
      ? 26
      : pose === 'SIT_DESK'
        ? 8
        : pose === 'STRETCH_MORNING'
          ? -8 + Math.sin(frame * 0.08) * 3
          : pose === 'FALLING'
            ? -12 + Math.sin(frame * 0.25) * 6
            : pose === 'HAPPY_WAVE'
              ? Math.sin(frame * 0.12) * 4
              : Math.sin(frame * 0.06) * 1.5;

  const torsoTopX = pose === 'SLUMP_DESK' ? 28 : pose === 'SIT_DESK' ? 8 : 0;
  const torsoTopY = pose === 'SLUMP_DESK' ? -82 : -104 + breath;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotationDeg})`}>
      <g transform={`scale(${scale * dir}, ${scale})`}>
        {/* Legs — ALWAYS natural bent knees */}
        {pose === 'SIT_DESK' || pose === 'SLUMP_DESK' ? (
          <g stroke={limbColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L66 2 L74 94" />
            <path d="M-4 6 L52 10 L58 94" />
          </g>
        ) : pose === 'FALLING' ? (
          <g stroke={limbColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={`M0 0 L${-34 - fallFlail * 0.5} 44 L${-58 - fallFlail} 96`} />
            <path d={`M0 0 L${36 + fallFlail * 0.5} 38 L${54 + fallFlail} 92`} />
          </g>
        ) : (
          <g stroke={limbColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-17 58 L-26 114" />
            <path d="M0 0 L19 58 L28 114" />
          </g>
        )}

        {/* Back Arm (behind torso/coat) — ALWAYS bent elbow */}
        {pose === 'STRETCH_MORNING' ? (
          <path
            d={`M0 ${-84 + breath} L-38 ${-124 + breath - stretchBreath} L-24 ${-172 + breath - stretchBreath}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'FALLING' ? (
          <path
            d={`M0 ${-84 + breath} L-44 ${-116 - fallFlail} L-68 ${-160 - fallFlail}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'SIT_DESK' ? (
          <path
            d={`M6 ${-80 + breath} L28 ${-44 + breath} L60 ${-36 + breath}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'SLUMP_DESK' ? (
          <path
            d="M20 -68 L48 -42 L82 -36"
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M0 ${-84 + breath} L-26 ${-50 + breath} L-18 ${-14 + breath}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Torso */}
        <line
          x1="0"
          y1="0"
          x2={torsoTopX}
          y2={torsoTopY}
          stroke={limbColor}
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Role-specific torso attire */}
        {role === 'GRANDPA' ? (
          <g transform={`translate(${torsoTopX * 0.4}, ${breath})`}>
            <path
              d="M-21 -94 L-9 -98 L0 -74 L9 -98 L21 -94 L24 -10 Q24 -4 16 -4 L-16 -4 Q-24 -4 -24 -10 Z"
              fill="#92400e"
              stroke={INK}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M-9 -98 L0 -74 L9 -98 Z"
              fill="#fef3c7"
              stroke={INK}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <line x1="0" y1="-74" x2="0" y2="-4" stroke="#78350f" strokeWidth="2.8" />
            <circle cx="5" cy="-58" r="2.8" fill="#fde68a" stroke={INK} strokeWidth="1.8" />
            <circle cx="5" cy="-39" r="2.8" fill="#fde68a" stroke={INK} strokeWidth="1.8" />
            <circle cx="5" cy="-20" r="2.8" fill="#fde68a" stroke={INK} strokeWidth="1.8" />
            <path d="M-17 -32 L-7 -32" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : role === 'DOCTOR' ? (
          <g transform={`translate(${torsoTopX * 0.4}, ${breath})`}>
            <path
              d="M-23 -94 L-10 -100 L0 -68 L10 -100 L23 -94 L29 18 Q29 24 22 24 L-22 24 Q-29 24 -29 18 Z"
              fill="#ffffff"
              stroke={INK}
              strokeWidth="4.2"
              strokeLinejoin="round"
            />
            <path
              d="M-10 -100 L0 -68 L10 -100 Z"
              fill="#e0f2fe"
              stroke={INK}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <line x1="0" y1="-68" x2="0" y2="24" stroke="#cbd5e1" strokeWidth="2.5" />
            <rect x="6" y="-48" width="14" height="12" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <path
              d="M-13 -98 C-18 -72 -18 -54 -11 -44"
              fill="none"
              stroke="#334155"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            <path
              d="M13 -98 C18 -72 18 -56 12 -46"
              fill="none"
              stroke="#334155"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            <circle cx="-11" cy="-40" r="6" fill="#0ea5e9" stroke={INK} strokeWidth="2.5" />
            <circle cx="-11" cy="-40" r="2.2" fill="#e0f2fe" />
          </g>
        ) : null}

        {/* Front Arm (in front of torso/coat) — ALWAYS bent elbow */}
        {pose === 'HAPPY_WAVE' ? (
          <path
            d={`M0 ${-84 + breath} L38 ${-104 + breath} L${54 + waveOffset} ${-154 + breath}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'STRETCH_MORNING' ? (
          <path
            d={`M0 ${-84 + breath} L42 ${-122 + breath - stretchBreath} L30 ${-172 + breath - stretchBreath}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'PAT_SHOULDER' ? (
          <path
            d={`M0 ${-84 + breath} L42 ${-74 + breath} L82 ${-68 + Math.sin(frame * 0.16) * 4}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'FALLING' ? (
          <path
            d={`M0 ${-84 + breath} L46 ${-112 + fallFlail} L72 ${-154 + fallFlail}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'SIT_DESK' ? (
          <path
            d={`M8 ${-80 + breath} L36 ${-42 + breath} L74 ${-34 + breath}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'SLUMP_DESK' ? (
          <path
            d="M22 -66 L54 -38 L92 -32"
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M0 ${-84 + breath} L28 ${-52 + breath} L20 ${-14 + breath}`}
            fill="none"
            stroke={limbColor}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Head */}
        <g
          transform={`translate(${pose === 'SLUMP_DESK' ? 48 : torsoTopX}, ${
            pose === 'SLUMP_DESK' ? -108 : -142 + breath
          }) rotate(${headTiltDeg})`}
        >
          <StickmanHead role={role} expression={expression} frame={frame} />
        </g>
      </g>
    </g>
  );
};

const StickmanHead: React.FC<{
  role: 'BOY' | 'GRANDPA' | 'DOCTOR';
  expression: GiatMinhStickmanExpression;
  frame: number;
}> = ({ role, expression, frame }) => {
  const blinkCycle = (frame + (role === 'BOY' ? 17 : role === 'GRANDPA' ? 53 : 91)) % 240;
  const isBlinking = blinkCycle < 5;
  const eyesClosed = expression === 'SLEEPING' || isBlinking;
  const eyesHalfDroop = expression === 'SLEEPY' || expression === 'EXHAUSTED';

  return (
    <g>
      <circle cx="0" cy="0" r="38" fill="#ffffff" stroke={INK} strokeWidth="5.5" />

      {/* Hair — matched to StickmanRig.tsx */}
      {role === 'BOY' ? (
        <path
          d="M-36 -8 C-38 -36 -12 -46 0 -42 C8 -49 18 -44 20 -39 C34 -36 38 -22 36 -8 C26 -16 14 -14 4 -20 C-8 -12 -22 -16 -36 -8 Z"
          fill="#0f172a"
        />
      ) : role === 'GRANDPA' ? (
        <g>
          <path d="M-38 -12 C-48 -14 -48 6 -36 6 Z" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
          <path d="M38 -12 C48 -14 48 6 36 6 Z" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
          <path d="M-8 -24 Q4 -27 16 -24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        <path
          d="M-36 -8 C-37 -34 -16 -43 2 -42 C22 -41 37 -28 36 -8 C25 -18 14 -22 4 -18 C-8 -22 -24 -18 -36 -8 Z"
          fill="#0f172a"
        />
      )}

      {/* Eyes */}
      {eyesClosed ? (
        <g fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round">
          <path d="M-11 -1 Q-4 4 3 -1" />
          <path d="M12 -1 Q19 4 26 -1" />
        </g>
      ) : (
        <g>
          <circle cx="-4" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
          <circle cx="-2" cy="-2" r={expression === 'SHOCKED' ? 3.8 : 3.2} fill={INK} />
          <circle cx="19" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
          <circle cx="21" cy="-2" r={expression === 'SHOCKED' ? 3.8 : 3.2} fill={INK} />

          {/* Heavy half-closed upper lids when sleepy / exhausted */}
          {eyesHalfDroop ? (
            <g>
              <path d="M-11 -6 L3 -6 L3 -1 L-11 -1 Z" fill="#ffffff" />
              <path d="M12 -6 L26 -6 L26 -1 L12 -1 Z" fill="#ffffff" />
              <line x1="-11" y1="-1" x2="3" y2="-1" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="12" y1="-1" x2="26" y2="-1" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
            </g>
          ) : null}

          {/* Dark eye bags when EXHAUSTED */}
          {expression === 'EXHAUSTED' ? (
            <g fill="none" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round">
              <path d="M-10 6 Q-4 10 2 6" />
              <path d="M13 6 Q19 10 25 6" />
            </g>
          ) : null}
        </g>
      )}

      {/* DOCTOR round glasses */}
      {role === 'DOCTOR' ? (
        <g fill="none" stroke={INK} strokeWidth="3">
          <circle cx="-4" cy="-2" r="10.5" />
          <circle cx="19" cy="-2" r="10.5" />
          <line x1="6.5" y1="-2" x2="8.5" y2="-2" />
          <line x1="-14.5" y1="-3" x2="-35" y2="-6" strokeWidth="2.6" />
          <line x1="29.5" y1="-3" x2="36" y2="-5" strokeWidth="2.6" />
        </g>
      ) : null}

      {/* GRANDPA gray mustache */}
      {role === 'GRANDPA' ? (
        <path d="M-3 11 Q8 6 19 11" fill="none" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" />
      ) : null}

      {/* Eyebrows & Mouth */}
      {expression === 'SHOCKED' ? (
        <g>
          <path d="M-12 -16 Q-4 -22 4 -16" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M11 -16 Q19 -22 27 -16" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="9" cy="19" rx="7" ry="9" fill="#fca5a5" stroke={INK} strokeWidth="3.2" />
          <path
            d="M-28 -18 C-34 -8 -34 2 -28 2 C-22 2 -22 -8 -28 -18 Z"
            fill="#38bdf8"
            stroke={INK}
            strokeWidth="2.4"
          />
        </g>
      ) : expression === 'WORRIED' || expression === 'EXHAUSTED' ? (
        <g>
          <line x1="-12" y1="-12" x2="2" y2="-15" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <line x1="27" y1="-12" x2="13" y2="-15" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M-1 21 Q8 14 17 21" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
        </g>
      ) : expression === 'SLEEPY' || expression === 'SLEEPING' ? (
        <g>
          <path d="M-10 -12 Q-4 -14 2 -12" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M13 -12 Q19 -14 25 -12" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          {expression === 'SLEEPING' ? (
            <path d="M2 16 Q9 20 16 16" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          ) : (
            <ellipse cx="9" cy="18" rx="4.2" ry="5" fill="#cbd5e1" stroke={INK} strokeWidth="2.6" />
          )}
        </g>
      ) : expression === 'PROUD' ? (
        <g>
          <path d="M-11 -14 Q-4 -18 3 -14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M12 -14 Q19 -18 26 -14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="-14" cy="9" rx="6" ry="3.5" fill="#fecdd3" opacity="0.7" />
          <ellipse cx="26" cy="9" rx="6" ry="3.5" fill="#fecdd3" opacity="0.7" />
          <path d="M-3 14 Q8 26 20 14" fill="none" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
        </g>
      ) : expression === 'NEUTRAL' ? (
        <g>
          <line x1="-10" y1="-13" x2="2" y2="-13" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
          <line x1="13" y1="-13" x2="25" y2="-13" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
          <line x1="1" y1="17" x2="17" y2="17" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M-10 -14 Q-4 -17 2 -14" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M13 -14 Q19 -17 25 -14" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M-2 15 Q8 24 18 15" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/**
 * Cozy 1920x1080 Bedroom Backdrop (supports NIGHT moonlight & MORNING golden sunlight):
 * - Wooden bed with headboard, angled fluffy pillow, and mattress
 * - Window with curtains, crescent moon & twinkling stars (or warm morning sun)
 * - Nightstand with digital clock & warm lamp, wall bookshelf
 * - Keeps y >= 830 clean of text for subtitles
 */
export const BedroomNightBackdrop: React.FC<{
  frame: number;
  mode?: 'NIGHT' | 'MORNING';
  clockText?: string;
  lampOn?: boolean;
  showBed?: boolean;
}> = ({
  frame,
  mode = 'NIGHT',
  clockText = '23:15',
  lampOn = false,
  showBed = true,
}) => {
  const isMorning = mode === 'MORNING';
  const starTwinkle = 0.55 + Math.sin(frame * 0.09) * 0.35;

  return (
    <g>
      <defs>
        <linearGradient id="gmBedWallNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="65%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#263449" />
        </linearGradient>
        <linearGradient id="gmBedWallMorning" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="65%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>
        <linearGradient id="gmSkyNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="gmSkyMorning" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="65%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <linearGradient id="gmMoonBeam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gmSunBeam" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#fde047" stopOpacity="0.02" />
        </linearGradient>
        <radialGradient id="gmNightLampGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.65" />
          <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Wall */}
      <rect
        x="0"
        y="0"
        width="1920"
        height="760"
        fill={isMorning ? 'url(#gmBedWallMorning)' : 'url(#gmBedWallNight)'}
      />

      {/* Baseboard & Warm Wooden Floor */}
      <rect
        x="0"
        y="742"
        width="1920"
        height="22"
        fill={isMorning ? '#92400e' : '#334155'}
        stroke={INK}
        strokeWidth="4"
      />
      <rect
        x="0"
        y="764"
        width="1920"
        height="316"
        fill={isMorning ? '#b45309' : '#3b281d'}
        stroke={INK}
        strokeWidth="4"
      />
      <g stroke={INK} strokeWidth="2.5" opacity="0.32">
        <line x1="0" y1="825" x2="1920" y2="825" />
        <line x1="0" y1="895" x2="1920" y2="895" />
        <line x1="0" y1="980" x2="1920" y2="980" />
      </g>

      {/* Soft bedside rug */}
      <ellipse
        cx="860"
        cy="830"
        rx="440"
        ry="44"
        fill={isMorning ? '#fde68a' : '#1e3a5f'}
        stroke={INK}
        strokeWidth="4"
        opacity="0.85"
      />

      {/* Wall Bookshelf (upper-left) */}
      <g transform="translate(170, 175)">
        <rect x="0" y="72" width="280" height="18" rx="6" fill="#78350f" stroke={INK} strokeWidth="4" />
        <rect x="24" y="16" width="26" height="56" rx="4" fill="#ef4444" stroke={INK} strokeWidth="3.5" />
        <rect x="54" y="8" width="30" height="64" rx="4" fill="#3b82f6" stroke={INK} strokeWidth="3.5" />
        <rect x="88" y="20" width="24" height="52" rx="4" fill="#10b981" stroke={INK} strokeWidth="3.5" />
        <path d="M198 44 L236 44 L230 72 L204 72 Z" fill="#d97706" stroke={INK} strokeWidth="3.5" />
        <path
          d="M217 44 C202 22 194 26 205 14 C214 26 218 20 217 8 C224 22 236 20 229 44 Z"
          fill="#22c55e"
          stroke={INK}
          strokeWidth="3"
        />
      </g>

      {/* Bedroom Window with Moonlight or Morning Sun */}
      <g transform="translate(1280, 145)">
        <rect
          x="0"
          y="0"
          width="380"
          height="320"
          rx="12"
          fill={isMorning ? 'url(#gmSkyMorning)' : 'url(#gmSkyNight)'}
          stroke={INK}
          strokeWidth="6"
        />

        {isMorning ? (
          <g>
            <circle cx="285" cy="92" r="46" fill="#fde047" stroke="#f59e0b" strokeWidth="4" />
            <path d="M40 245 Q120 205 210 238 T365 232 L365 314 L6 314 L6 250 Z" fill="#86efac" opacity="0.7" />
          </g>
        ) : (
          <g>
            <path
              d="M285 58 A38 38 0 1 0 322 114 A30 30 0 1 1 285 58 Z"
              fill="#fef08a"
              stroke="#eab308"
              strokeWidth="2.5"
            />
            {[
              [78, 72],
              [148, 52],
              [206, 98],
              [96, 158],
              [176, 182],
              [298, 192],
            ].map(([sx, sy], i) => (
              <circle
                key={i}
                cx={sx}
                cy={sy}
                r={i % 2 === 0 ? 3.5 : 2.5}
                fill="#fef9c3"
                opacity={clamp01(starTwinkle + (i % 3) * 0.12)}
              />
            ))}
          </g>
        )}

        <line x1="190" y1="0" x2="190" y2="320" stroke={INK} strokeWidth="6" />
        <line x1="0" y1="165" x2="380" y2="165" stroke={INK} strokeWidth="6" />
        <rect x="-18" y="316" width="416" height="20" rx="6" fill="#78350f" stroke={INK} strokeWidth="4.5" />

        <path
          d="M-12 -8 L64 -8 C52 110 46 210 26 334 L-16 334 Z"
          fill={isMorning ? '#38bdf8' : '#334155'}
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path
          d="M316 -8 L392 -8 L396 334 L354 334 C334 210 328 110 316 -8 Z"
          fill={isMorning ? '#38bdf8' : '#334155'}
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <line x1="-26" y1="-10" x2="406" y2="-10" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* Soft Moonbeam / Sunbeam across bedroom */}
      {isMorning ? (
        <polygon points="1310,165 1640,165 1120,760 560,760" fill="url(#gmSunBeam)" />
      ) : (
        <polygon points="1310,165 1630,165 1180,760 660,760" fill="url(#gmMoonBeam)" />
      )}

      {/* Bedside Nightstand + Digital Clock + Warm Lamp */}
      <g transform="translate(1160, 580)">
        {lampOn ? <circle cx="55" cy="-58" r="160" fill="url(#gmNightLampGlow)" /> : null}
        <rect x="0" y="0" width="136" height="175" rx="8" fill="#78350f" stroke={INK} strokeWidth="4.5" />
        <rect x="14" y="18" width="108" height="52" rx="4" fill="#92400e" stroke={INK} strokeWidth="3.5" />
        <circle cx="68" cy="44" r="6" fill="#fbbf24" stroke={INK} strokeWidth="2.5" />

        <rect x="10" y="-42" width="92" height="40" rx="8" fill="#0f172a" stroke={INK} strokeWidth="3.8" />
        <text
          x="56"
          y="-15"
          textAnchor="middle"
          fill={isMorning ? '#4ade80' : '#38bdf8'}
          fontSize="21"
          fontWeight="800"
          fontFamily={FONT}
        >
          {clockText}
        </text>

        <line x1="114" y1="0" x2="114" y2="-38" stroke={INK} strokeWidth="5" />
        <path
          d="M92 -38 L136 -38 L126 -72 L102 -72 Z"
          fill={lampOn ? '#fef08a' : '#cbd5e1'}
          stroke={INK}
          strokeWidth="3.8"
          strokeLinejoin="round"
        />
      </g>

      {/* Cozy Wooden Bed Frame + Angled Fluffy Pillow + Mattress */}
      {showBed ? (
        <g transform="translate(340, 480)">
          <rect x="0" y="-45" width="38" height="335" rx="10" fill="#78350f" stroke={INK} strokeWidth="5" />
          <rect x="34" y="108" width="680" height="96" rx="22" fill="#f8fafc" stroke={INK} strokeWidth="4.5" />
          {/* Fluffy angled pillow supporting head naturally at ~ -12° */}
          <ellipse
            cx="126"
            cy="78"
            rx="78"
            ry="32"
            transform="rotate(14 126 78)"
            fill="#e0f2fe"
            stroke={INK}
            strokeWidth="4"
          />
          <rect x="28" y="182" width="696" height="46" rx="8" fill="#92400e" stroke={INK} strokeWidth="5" />
          <rect x="716" y="76" width="32" height="214" rx="8" fill="#78350f" stroke={INK} strokeWidth="5" />
          <rect x="44" y="228" width="26" height="62" rx="4" fill="#5c2d0c" stroke={INK} strokeWidth="4" />
        </g>
      ) : null}
    </g>
  );
};
