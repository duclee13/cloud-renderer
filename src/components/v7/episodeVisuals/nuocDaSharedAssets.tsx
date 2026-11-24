import React from 'react';

export const INK = '#1e293b';
export const FONT = 'Inter, "Segoe UI", Arial, sans-serif';

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

/** Clean auto-sized pill label that NEVER overflows text */
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
  const w = Math.max(170, text.length * 14 + 54);
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
      <text x="0" y="9" textAnchor="middle" fill={INK} fontSize="22" fontWeight="700" fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
};

/**
 * Consistent full-body V21.0 Stickman matching StickmanRig.tsx:
 * - BOY: black wavy hair dome on top, normal 2D eyes (no anime sparkles)
 * - GRANDPA: bald top with two gray/white side hair tufts, gray mustache, brown buttoned vest
 * - DOCTOR: short black hair, round glasses, white lab coat with stethoscope accent
 * - ALWAYS draws natural bent elbows & knees with rounded linecaps/joins
 */
export const SharedStickman: React.FC<{
  x: number;
  y: number;
  scale?: number;
  role: 'BOY' | 'GRANDPA' | 'DOCTOR';
  facing?: 'LEFT' | 'RIGHT';
  pose?: 'IDLE' | 'SIT' | 'DRINK_FAST' | 'HOLD_HEAD_PAIN' | 'EAT_SLOW' | 'POINT_UP' | 'HAPPY_WAVE';
  expression?: 'HAPPY' | 'PAIN' | 'SURPRISED' | 'CURIOUS' | 'PROUD' | 'TIRED';
  frame?: number;
}> = ({
  x,
  y,
  scale = 1,
  role,
  facing = 'RIGHT',
  pose = 'IDLE',
  expression = 'HAPPY',
  frame = 0,
}) => {
  const dir = facing === 'RIGHT' ? 1 : -1;
  const breath = Math.sin(frame * 0.08) * 1.6;
  const waveOffset = Math.sin(frame * 0.24) * 14;
  const gulpBob = pose === 'DRINK_FAST' ? Math.sin(frame * 0.34) * 3.5 : 0;
  const slowEatBob = pose === 'EAT_SLOW' ? Math.sin(frame * 0.11) * 4.5 : 0;
  const painShiverX = pose === 'HOLD_HEAD_PAIN' ? Math.sin(frame * 0.55) * 2.4 : 0;
  const painShiverY = pose === 'HOLD_HEAD_PAIN' ? Math.cos(frame * 0.45) * 1.4 : 0;

  const headTiltDeg =
    pose === 'DRINK_FAST'
      ? -11 + Math.sin(frame * 0.34) * 2.5
      : pose === 'HOLD_HEAD_PAIN'
        ? 8 + Math.sin(frame * 0.4) * 2
        : pose === 'EAT_SLOW'
          ? 3 + Math.sin(frame * 0.11) * 2
          : pose === 'POINT_UP'
            ? -9
            : pose === 'HAPPY_WAVE'
              ? Math.sin(frame * 0.12) * 4
              : Math.sin(frame * 0.06) * 1.5;

  const isSeated = pose === 'SIT';

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g transform={`scale(${scale * dir}, ${scale})`}>
        {/* Legs — ALWAYS complete with natural bent knees */}
        {isSeated ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L68 0 L76 92" />
            <path d="M-4 6 L54 8 L60 92" />
          </g>
        ) : pose === 'HOLD_HEAD_PAIN' ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-24 54 L-34 114" />
            <path d="M0 0 L24 54 L34 114" />
          </g>
        ) : pose === 'DRINK_FAST' ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-22 56 L-30 114" />
            <path d="M0 0 L22 54 L32 114" />
          </g>
        ) : (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-17 58 L-26 114" />
            <path d="M0 0 L19 58 L28 114" />
          </g>
        )}

        {/* Back Arm (behind torso/coat) — ALWAYS bent elbow */}
        {pose === 'HOLD_HEAD_PAIN' ? (
          <path
            d={`M0 ${-84 + breath} L${-46 + painShiverX} ${-116 + breath + painShiverY} L${-26 + painShiverX} ${-150 + breath + painShiverY}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'DRINK_FAST' ? (
          <path
            d={`M0 ${-84 + breath} L18 ${-64 + breath} L42 ${-108 + breath + gulpBob}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'EAT_SLOW' ? (
          <path
            d={`M0 ${-84 + breath} L-24 ${-48 + breath} L-10 ${-20 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'SIT' ? (
          <path
            d={`M0 ${-84 + breath} L-16 ${-36 + breath} L12 ${-18 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M0 ${-84 + breath} L-26 ${-50 + breath} L-18 ${-14 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Torso */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={-104 + breath}
          stroke={INK}
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Role-specific torso attire */}
        {role === 'GRANDPA' ? (
          <g transform={`translate(0, ${breath})`}>
            {/* Brown buttoned vest over stick torso */}
            <path
              d="M-21 -94 L-9 -98 L0 -74 L9 -98 L21 -94 L24 -10 Q24 -4 16 -4 L-16 -4 Q-24 -4 -24 -10 Z"
              fill="#92400e"
              stroke={INK}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Inner shirt V-collar */}
            <path
              d="M-9 -98 L0 -74 L9 -98 Z"
              fill="#fef3c7"
              stroke={INK}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Center button placket + 3 buttons */}
            <line x1="0" y1="-74" x2="0" y2="-4" stroke="#78350f" strokeWidth="2.8" />
            <circle cx="5" cy="-58" r="2.8" fill="#fde68a" stroke={INK} strokeWidth="1.8" />
            <circle cx="5" cy="-39" r="2.8" fill="#fde68a" stroke={INK} strokeWidth="1.8" />
            <circle cx="5" cy="-20" r="2.8" fill="#fde68a" stroke={INK} strokeWidth="1.8" />
            {/* Small side pocket */}
            <path d="M-17 -32 L-7 -32" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : role === 'DOCTOR' ? (
          <g transform={`translate(0, ${breath})`}>
            {/* White lab coat */}
            <path
              d="M-23 -94 L-10 -100 L0 -68 L10 -100 L23 -94 L29 18 Q29 24 22 24 L-22 24 Q-29 24 -29 18 Z"
              fill="#ffffff"
              stroke={INK}
              strokeWidth="4.2"
              strokeLinejoin="round"
            />
            {/* Lab coat lapels & inner shirt */}
            <path
              d="M-10 -100 L0 -68 L10 -100 Z"
              fill="#e0f2fe"
              stroke={INK}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M-10 -100 L-16 -74 L-4 -66" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M10 -100 L16 -74 L4 -66" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinejoin="round" />
            <line x1="0" y1="-68" x2="0" y2="24" stroke="#cbd5e1" strokeWidth="2.5" />
            {/* Chest pocket */}
            <rect x="6" y="-48" width="14" height="12" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            {/* Stethoscope draped around neck */}
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
            <circle cx="12" cy="-44" r="3" fill="#64748b" stroke={INK} strokeWidth="1.8" />
          </g>
        ) : null}

        {/* Front Arm (in front of torso/coat) — ALWAYS bent elbow */}
        {pose === 'HOLD_HEAD_PAIN' ? (
          <path
            d={`M0 ${-84 + breath} L${46 + painShiverX} ${-114 + breath + painShiverY} L${28 + painShiverX} ${-148 + breath + painShiverY}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'DRINK_FAST' ? (
          <path
            d={`M0 ${-84 + breath} L36 ${-68 + breath} L48 ${-114 + breath + gulpBob}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'EAT_SLOW' ? (
          <g>
            <path
              d={`M0 ${-84 + breath} L34 ${-62 + breath} L48 ${-104 + breath + slowEatBob}`}
              fill="none"
              stroke={INK}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Small spoon held gently */}
            <path
              d={`M48 ${-104 + breath + slowEatBob} L34 ${-116 + breath + slowEatBob}`}
              fill="none"
              stroke="#64748b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <ellipse
              cx="30"
              cy={-119 + breath + slowEatBob}
              rx="6"
              ry="3.6"
              fill="#cbd5e1"
              stroke={INK}
              strokeWidth="2"
            />
          </g>
        ) : pose === 'SIT' ? (
          <path
            d={`M0 ${-84 + breath} L26 ${-38 + breath} L52 ${-20 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'POINT_UP' ? (
          <path
            d={`M0 ${-84 + breath} L34 ${-96 + breath} L58 ${-150 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'HAPPY_WAVE' ? (
          <path
            d={`M0 ${-84 + breath} L38 ${-104 + breath} L${54 + waveOffset} ${-154 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M0 ${-84 + breath} L28 ${-52 + breath} L20 ${-14 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Head */}
        <g transform={`translate(${painShiverX * 0.6}, ${-142 + breath + painShiverY * 0.5}) rotate(${headTiltDeg})`}>
          <circle cx="0" cy="0" r="38" fill="#ffffff" stroke={INK} strokeWidth="5.5" />

          {/* Subtle forehead pain flush when in PAIN */}
          {expression === 'PAIN' ? (
            <ellipse cx="8" cy="-16" rx="18" ry="8" fill="#fecaca" opacity="0.65" />
          ) : null}

          {/* Hair — matched to StickmanRig.tsx */}
          {role === 'BOY' ? (
            <path
              d="M-36 -8 C-38 -36 -12 -46 0 -42 C8 -49 18 -44 20 -39 C34 -36 38 -22 36 -8 C26 -16 14 -14 4 -20 C-8 -12 -22 -16 -36 -8 Z"
              fill="#0f172a"
            />
          ) : role === 'GRANDPA' ? (
            <g>
              {/* Bald top with two gray/white side hair tufts */}
              <path d="M-38 -12 C-48 -14 -48 6 -36 6 Z" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
              <path d="M38 -12 C48 -14 48 6 36 6 Z" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
              {/* Subtle forehead line */}
              <path d="M-8 -24 Q4 -27 16 -24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* DOCTOR: neat short black hair */}
              <path
                d="M-36 -8 C-37 -34 -16 -43 2 -42 C22 -41 37 -28 36 -8 C25 -18 14 -22 4 -18 C-8 -22 -24 -18 -36 -8 Z"
                fill="#0f172a"
              />
            </g>
          )}

          {/* Eyes — normal 2D eyes (no anime sparkles!), pinched wince for PAIN, droopy lids for TIRED */}
          {expression === 'PAIN' ? (
            <g fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M-10 -6 L2 -2 L-10 3" />
              <path d="M25 -6 L13 -2 L25 3" />
            </g>
          ) : expression === 'TIRED' ? (
            <g>
              <circle cx="-4" cy="-1" r="6.2" fill="#ffffff" stroke={INK} strokeWidth="2.4" />
              <circle cx="-2.5" cy="0.5" r="2.9" fill={INK} />
              <path d="M-10.5 -4 L2.5 -2.5 L2.5 -8 L-10.5 -8 Z" fill="#ffffff" />
              <line x1="-10.5" y1="-3.5" x2="2.5" y2="-2.2" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />

              <circle cx="19" cy="-1" r="6.2" fill="#ffffff" stroke={INK} strokeWidth="2.4" />
              <circle cx="20.5" cy="0.5" r="2.9" fill={INK} />
              <path d="M12.5 -2.5 L25.5 -4 L25.5 -8 L12.5 -8 Z" fill="#ffffff" />
              <line x1="12.5" y1="-2.2" x2="25.5" y2="-3.5" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <circle cx="-4" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
              <circle cx="-2" cy="-2" r="3.2" fill={INK} />
              <circle cx="19" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
              <circle cx="21" cy="-2" r="3.2" fill={INK} />
            </g>
          )}

          {/* DOCTOR round glasses over eyes */}
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

          {/* Expressions: Eyebrows, Mouth, and Subtle Cheek/Sweat/Pain Accents */}
          {expression === 'PAIN' ? (
            <g>
              <line x1="-12" y1="-15" x2="2" y2="-10" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="27" y1="-15" x2="13" y2="-10" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
              {/* Wavy grimace mouth */}
              <path
                d="M-3 20 Q2 13 8 18 Q14 13 19 20 Q14 25 8 23 Q2 25 -3 20 Z"
                fill="#fca5a5"
                stroke={INK}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Pain zing ticks near forehead */}
              <path
                d="M28 -36 L38 -46 M36 -24 L48 -28"
                stroke="#ef4444"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          ) : expression === 'SURPRISED' ? (
            <g>
              <path d="M-11 -15 Q-4 -20 3 -15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M12 -15 Q19 -20 26 -15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="9" cy="19" rx="6.5" ry="8.5" fill="#fca5a5" stroke={INK} strokeWidth="3" />
            </g>
          ) : expression === 'CURIOUS' ? (
            <g>
              <line x1="-11" y1="-13" x2="2" y2="-13" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M13 -16 Q19 -21 26 -15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M2 18 Q9 15 15 18" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : expression === 'PROUD' ? (
            <g>
              <path d="M-11 -14 Q-4 -18 3 -14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M12 -14 Q19 -18 26 -14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="-14" cy="9" rx="6" ry="3.5" fill="#fecdd3" opacity="0.7" />
              <ellipse cx="26" cy="9" rx="6" ry="3.5" fill="#fecdd3" opacity="0.7" />
              <path d="M-3 14 Q8 26 20 14" fill="none" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
            </g>
          ) : expression === 'TIRED' ? (
            <g>
              <line x1="-12" y1="-11" x2="1" y2="-14" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <line x1="27" y1="-11" x2="14" y2="-14" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              {/* Tired panting mouth */}
              <path
                d="M1 19 Q9 13 17 19 Q9 24 1 19 Z"
                fill="#fca5a5"
                stroke={INK}
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              {/* Summer heat sweat drop */}
              <path
                d="M-27 -16 C-32 -7 -32 2 -27 2 C-22 2 -22 -7 -27 -16 Z"
                fill="#38bdf8"
                stroke={INK}
                strokeWidth="2.2"
              />
            </g>
          ) : (
            <g>
              <path d="M-10 -14 Q-4 -17 2 -14" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <path d="M13 -14 Q19 -17 25 -14" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
              <path d="M-2 15 Q8 24 18 15" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

/**
 * Crisp 2D cartoon-realistic tall glass of Vietnamese iced tea / ice water:
 * - Translucent bobbing ice cubes, condensation droplets, striped straw
 * - Dynamic liquid fill level (fillPct 0..1)
 * - Optional chilly blue frost aura lines
 */
export const IcedDrinkGlass: React.FC<{
  x: number;
  y: number;
  scale?: number;
  fillPct?: number;
  showFrost?: boolean;
  frame?: number;
}> = ({ x, y, scale = 1, fillPct = 0.82, showFrost = true, frame = 0 }) => {
  const fill = clamp01(fillPct);
  const liquidTopY = lerp(68, -58, fill);
  const halfWidthAtTop = lerp(34, 47, (68 - liquidTopY) / 126);

  const iceCubes = [
    { cx: -16, cy: liquidTopY + 18, rot: -14, size: 24, phase: 0 },
    { cx: 14, cy: liquidTopY + 15, rot: 18, size: 23, phase: 1.6 },
    { cx: -2, cy: liquidTopY + 38, rot: 8, size: 22, phase: 3.1 },
    { cx: 18, cy: liquidTopY + 46, rot: -20, size: 20, phase: 4.4 },
  ];

  const droplets = [
    { cx: -34, cy: -16, r: 3.4 },
    { cx: -26, cy: 14, r: 4.2 },
    { cx: -30, cy: 42, r: 3.1 },
    { cx: 28, cy: -8, r: 3.8 },
    { cx: 33, cy: 26, r: 4.0 },
    { cx: 22, cy: 52, r: 3.0 },
    { cx: 4, cy: 28, r: 2.8 },
  ];

  const frostPulse = 0.65 + Math.sin(frame * 0.14) * 0.25;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        <linearGradient id="nd_sa_glass_liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.88" />
          <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="nd_sa_glass_body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="28%" stopColor="#e0f2fe" stopOpacity="0.22" />
          <stop offset="75%" stopColor="#bae6fd" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.48" />
        </linearGradient>
        <radialGradient id="nd_sa_glass_frost_aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.42" />
          <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <clipPath id="nd_sa_glass_inner_clip">
          <path d="M-48 -78 L48 -78 L36 74 Q35 80 28 80 L-28 80 Q-35 80 -36 74 Z" />
        </clipPath>
      </defs>

      {/* Soft table shadow under glass */}
      <ellipse cx="0" cy="86" rx="44" ry="9" fill="#0f172a" opacity="0.18" />

      {/* Optional chilly blue frost aura & cold-air wisps */}
      {showFrost ? (
        <g opacity={frostPulse}>
          <ellipse cx="0" cy="4" rx="88" ry="104" fill="url(#nd_sa_glass_frost_aura)" />
          <g fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round">
            <path d={`M-68 ${-36 + Math.sin(frame * 0.1) * 4} Q-80 -18 -68 0 Q-58 18 -68 36`} />
            <path d={`M68 ${-28 + Math.cos(frame * 0.1) * 4} Q80 -10 68 8 Q58 26 68 44`} />
            <path d={`M-56 ${-64 + Math.sin(frame * 0.12) * 3} Q-64 -52 -56 -40`} strokeWidth="2.4" />
            <path d={`M58 ${-58 + Math.cos(frame * 0.12) * 3} Q66 -46 58 -34`} strokeWidth="2.4" />
          </g>
          {/* Crisp tiny frost stars */}
          {[
            [-74, -52],
            [76, -42],
            [-78, 22],
            [74, 34],
          ].map(([fx, fy], idx) => (
            <g key={`frost-star-${idx}`} transform={`translate(${fx}, ${fy + Math.sin(frame * 0.11 + idx) * 3})`}>
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ))}
        </g>
      ) : null}

      {/* Drinking straw (back portion above rim + angled through glass) */}
      <g>
        <path
          d="M22 -128 L34 -132 L38 -124 L26 -116 L2 68 L-8 68 L16 -122 Z"
          fill="#f43f5e"
          stroke={INK}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Crisp white straw stripes */}
        <path
          d="M17 -106 L25 -103 M13 -84 L21 -81 M9 -62 L17 -59"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* Glass back fill */}
      <path
        d="M-50 -80 L50 -80 L38 76 Q37 84 29 84 L-29 84 Q-37 84 -38 76 Z"
        fill="url(#nd_sa_glass_body)"
      />

      {/* Clipped liquid & bobbing translucent ice cubes */}
      <g clipPath="url(#nd_sa_glass_inner_clip)">
        {fill > 0.02 ? (
          <g>
            {/* Liquid body */}
            <rect x="-56" y={liquidTopY} width="112" height={150} fill="url(#nd_sa_glass_liquid)" />
            {/* Liquid surface meniscus */}
            <ellipse
              cx="0"
              cy={liquidTopY}
              rx={halfWidthAtTop}
              ry="7.5"
              fill="#e0f2fe"
              fillOpacity="0.72"
              stroke="#0284c7"
              strokeWidth="2"
            />

            {/* Gently bobbing translucent ice cubes */}
            {iceCubes.map((cube, idx) => {
              if (cube.cy > 64) return null;
              const bobY = Math.sin(frame * 0.09 + cube.phase) * 2.8;
              const bobRot = cube.rot + Math.cos(frame * 0.07 + cube.phase) * 3;
              const half = cube.size / 2;
              return (
                <g
                  key={`ice-${idx}`}
                  transform={`translate(${cube.cx}, ${cube.cy + bobY}) rotate(${bobRot})`}
                >
                  <rect
                    x={-half}
                    y={-half}
                    width={cube.size}
                    height={cube.size}
                    rx="5"
                    fill="#f0f9ff"
                    fillOpacity="0.78"
                    stroke="#0284c7"
                    strokeWidth="2.4"
                  />
                  <path
                    d={`M${-half + 4} ${-half + 5} L${half - 5} ${-half + 5} L${-half + 4} ${half - 6} Z`}
                    fill="#ffffff"
                    opacity="0.7"
                  />
                </g>
              );
            })}
          </g>
        ) : null}

        {/* Thick glass bottom */}
        <path
          d="M-40 68 L40 68 L38 82 L-38 82 Z"
          fill="#e0f2fe"
          fillOpacity="0.65"
          stroke="#94a3b8"
          strokeWidth="2"
        />
      </g>

      {/* Glass outer silhouette & rim */}
      <path
        d="M-50 -80 L-38 76 Q-37 84 -29 84 L29 84 Q37 84 38 76 L50 -80"
        fill="none"
        stroke={INK}
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="0" cy="-80" rx="50" ry="9" fill="#e0f2fe" fillOpacity="0.35" stroke={INK} strokeWidth="4" />

      {/* Glossy vertical specular highlight */}
      <path
        d="M-36 -60 L-28 58"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6.5"
        strokeLinecap="round"
        opacity="0.68"
      />
      <path
        d="M-24 -54 L-19 20"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Crisp condensation droplets on outer glass */}
      {droplets.map((d, idx) => (
        <g key={`drop-${idx}`} transform={`translate(${d.cx}, ${d.cy})`}>
          <path
            d={`M0 ${-d.r * 1.45} C${-d.r} ${-d.r * 0.2} ${-d.r} ${d.r} 0 ${d.r} C${d.r} ${d.r} ${d.r} ${-d.r * 0.2} 0 ${-d.r * 1.45} Z`}
            fill="#e0f2fe"
            stroke="#0284c7"
            strokeWidth="1.8"
          />
          <circle cx={-d.r * 0.28} cy={d.r * 0.15} r={d.r * 0.28} fill="#ffffff" />
        </g>
      ))}
    </g>
  );
};

/**
 * Clean, scientifically accurate side-profile 2D anatomical cutaway of a head (~520x520 local space centered at 0,0):
 * - Crisp head silhouette facing right, skull rim, pink brain with warm 37°C glow
 * - Oral cavity with upper palate (vòm miệng) and movable warm pink tongue (tongueUp presses flat to palate)
 * - Anterior cerebral artery that constricts (showVesselDilate < 0) or widens & pulses (showVesselDilate > 0)
 * - 3-branch trigeminal nerve (V1 forehead, V2 palate, V3 jaw) with animated impulse pulses when showTrigeminal
 * - Icy cyan frost highlight on palate (coldPalatePct 0..1)
 * - Pulsing red pain starburst on forehead (foreheadPainPct 0..1)
 */
export const HeadCutawayDiagram: React.FC<{
  x: number;
  y: number;
  scale?: number;
  coldPalatePct?: number;
  foreheadPainPct?: number;
  showTrigeminal?: boolean;
  showVesselDilate?: number;
  tongueUp?: boolean;
  frame: number;
}> = ({
  x,
  y,
  scale = 1,
  coldPalatePct = 0,
  foreheadPainPct = 0,
  showTrigeminal = false,
  showVesselDilate = 0,
  tongueUp = false,
  frame,
}) => {
  const cold = clamp01(coldPalatePct);
  const pain = clamp01(foreheadPainPct);
  const dilate = Math.max(-1, Math.min(1, showVesselDilate));

  const brainWarmPulse = 0.55 + Math.sin(frame * 0.08) * 0.14;
  const vesselPulse = dilate > 0 ? Math.sin(frame * 0.34) * (2.6 * dilate) : Math.sin(frame * 0.12) * 0.7;
  const arteryWidth =
    dilate < 0
      ? lerp(10, 4.4, -dilate)
      : dilate > 0
        ? lerp(10, 18.5, dilate) + vesselPulse
        : 10 + vesselPulse;
  const arteryColor = dilate < 0 ? '#be123c' : dilate > 0 ? '#ef4444' : '#dc2626';
  const nerveDashOffset = -(frame * 3.4);
  const painPulse = 0.82 + Math.sin(frame * 0.36) * 0.18;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id="nd_sa_head_brain_glow" cx="46%" cy="42%" r="52%">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.46" />
          <stop offset="55%" stopColor="#f472b6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nd_sa_head_cold_palate" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#0ea5e9" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nd_sa_head_pain_burst" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ef4444" stopOpacity="0.72" />
          <stop offset="75%" stopColor="#dc2626" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nd_sa_head_skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>
      </defs>

      {/* Head & Neck Side-Profile Silhouette (centered in ~520x520 local space) */}
      <path
        d="M-78 242
           L-82 162
           C-156 136 -212 68 -212 -24
           C-212 -148 -124 -232 4 -232
           C94 -232 154 -182 162 -106
           C164 -84 162 -64 166 -48
           L202 -6
           C207 0 204 10 194 12
           L174 16
           C178 26 176 36 168 42
           L146 46
           L146 84
           L172 90
           C177 98 175 112 164 124
           C154 136 132 146 106 146
           L78 148
           L78 242 Z"
        fill="url(#nd_sa_head_skin)"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Cranial Skull Cutaway Rim */}
      <path
        d="M-66 128
           C-138 106 -184 44 -184 -32
           C-184 -134 -108 -206 4 -206
           C82 -206 134 -162 140 -94
           C142 -72 132 -48 112 -36
           L56 -22
           C24 -12 4 14 2 52
           L2 128 Z"
        fill="#f8fafc"
        stroke="#94a3b8"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Warm 37°C Brain Ambient Glow */}
      <ellipse cx="-26" cy="-74" rx="148" ry="118" fill="url(#nd_sa_head_brain_glow)" opacity={brainWarmPulse} />

      {/* Pink Brain (Cerebrum + Cerebellum + Brainstem) */}
      <g>
        {/* Brainstem descending into neck */}
        <path
          d="M-24 22 C-22 68 -30 124 -36 196 L-6 196 C0 124 8 68 12 22 Z"
          fill="#fbcfe8"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Cerebellum at lower back of skull */}
        <path
          d="M-112 30 C-138 44 -138 90 -96 102 C-66 110 -34 94 -26 66 C-22 44 -54 24 -112 30 Z"
          fill="#f472b6"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M-118 56 Q-84 52 -46 60 M-110 76 Q-78 72 -44 78"
          fill="none"
          stroke="#be185d"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Main Pink Cerebrum */}
        <path
          d="M-158 -24
             C-166 -110 -98 -182 4 -182
             C74 -182 124 -140 126 -80
             C128 -34 98 -10 52 -6
             C18 -4 -2 18 -16 32
             C-56 44 -118 46 -144 18
             C-154 6 -156 -8 -158 -24 Z"
          fill="#f9a8d4"
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Clean stylized gyri/sulci brain folds */}
        <g fill="none" stroke="#be185d" strokeWidth="3.2" strokeLinecap="round" opacity="0.65">
          <path d="M-118 -64 C-92 -92 -42 -96 -14 -72" />
          <path d="M-98 -124 C-60 -148 4 -146 38 -118" />
          <path d="M-128 -18 C-98 -32 -62 -24 -42 -42" />
          <path d="M10 -122 C44 -128 84 -108 92 -72" />
          <path d="M-46 -68 C-14 -52 28 -58 58 -82" />
          <path d="M22 -34 C54 -38 82 -44 102 -62" />
          <path d="M-80 2 C-50 10 -18 4 6 -14" />
        </g>
      </g>

      {/* Nasal Cavity + Pharynx + Oral Cavity */}
      <g>
        {/* Nasal passage above palate */}
        <path
          d="M42 -12 C78 -18 134 -12 162 4 C164 16 154 24 134 26 L56 26 C42 26 34 12 42 -12 Z"
          fill="#fda4af"
          stroke={INK}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Oral cavity & throat interior */}
        <path
          d="M150 44
             C118 36 74 36 44 50
             C24 62 18 98 18 148
             L18 226
             L48 226
             L48 134
             C52 114 72 108 106 108
             L152 104
             L152 44 Z"
          fill="#9f1239"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Upper Palate (Vòm miệng — hard & soft palate roof) */}
        <path
          d="M164 42
             C130 30 80 30 46 46
             C36 52 30 62 28 70
             C40 62 56 54 84 52
             C114 50 144 52 164 52 Z"
          fill="#fecdd3"
          stroke={INK}
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        {/* Upper & Lower Front Teeth accents */}
        <rect x="148" y="48" width="11" height="13" rx="3" fill="#ffffff" stroke={INK} strokeWidth="2.4" />
        <rect x="148" y="86" width="11" height="13" rx="3" fill="#ffffff" stroke={INK} strokeWidth="2.4" />

        {/* Movable Warm Pink Tongue */}
        {tongueUp ? (
          <g>
            {/* Tongue pressed flat against the upper palate (vòm miệng) */}
            <path
              d="M48 106
                 C54 74 74 54 110 52
                 C132 51 146 54 148 64
                 C148 76 122 86 92 94
                 C72 100 58 106 48 106 Z"
              fill="#fb7185"
              stroke={INK}
              strokeWidth="3.4"
              strokeLinejoin="round"
            />
            {/* Warm golden-orange heat waves transferring from tongue to palate */}
            <g fill="none" stroke="#fb923c" strokeWidth="3.2" strokeLinecap="round" opacity={0.7 + Math.sin(frame * 0.2) * 0.25}>
              <path d={`M82 ${50 - (frame % 12) * 0.6} Q88 42 82 34`} />
              <path d={`M106 ${48 - ((frame + 4) % 12) * 0.6} Q112 40 106 32`} />
              <path d={`M128 ${50 - ((frame + 8) % 12) * 0.6} Q134 42 128 34`} />
            </g>
          </g>
        ) : (
          /* Tongue resting naturally on the floor of the mouth */
          <path
            d="M46 108
               C56 84 82 76 116 78
               C136 80 146 86 144 96
               C136 106 96 108 46 108 Z"
            fill="#fb7185"
            stroke={INK}
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
        )}
      </g>

      {/* Icy Cyan Frost Highlight on Upper Palate (coldPalatePct 0..1) */}
      {cold > 0.01 ? (
        <g opacity={cold}>
          <ellipse cx="104" cy="46" rx="64" ry="26" fill="url(#nd_sa_head_cold_palate)" />
          <path
            d="M52 50 C82 36 124 36 154 46"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M58 50 C86 38 122 38 148 46"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 6"
          />
          {/* Tiny frost crystals along palate */}
          {[
            [74, 44],
            [102, 40],
            [130, 44],
          ].map(([cx, cy], idx) => (
            <g key={`palate-ice-${idx}`} transform={`translate(${cx}, ${cy})`}>
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
            </g>
          ))}
        </g>
      ) : null}

      {/* Anterior Cerebral Artery (constricts when showVesselDilate < 0, dilates & pulses when > 0) */}
      <g>
        {/* Outer artery glow when dilating */}
        {dilate > 0.1 ? (
          <path
            d="M22 44 C26 6 36 -38 64 -76 C84 -102 74 -138 28 -154"
            fill="none"
            stroke="#fca5a5"
            strokeWidth={arteryWidth + 10}
            strokeLinecap="round"
            opacity={0.45 * dilate}
          />
        ) : null}
        {/* Main anterior cerebral artery trunk */}
        <path
          d="M22 44 C26 6 36 -38 64 -76 C84 -102 74 -138 28 -154"
          fill="none"
          stroke={INK}
          strokeWidth={arteryWidth + 4}
          strokeLinecap="round"
        />
        <path
          d="M22 44 C26 6 36 -38 64 -76 C84 -102 74 -138 28 -154"
          fill="none"
          stroke={arteryColor}
          strokeWidth={arteryWidth}
          strokeLinecap="round"
        />
        {/* Inner specular blood-flow highlight */}
        <path
          d="M22 44 C26 6 36 -38 64 -76 C84 -102 74 -138 28 -154"
          fill="none"
          stroke="#fecaca"
          strokeWidth={Math.max(2, arteryWidth * 0.28)}
          strokeLinecap="round"
          strokeDasharray="12 16"
          strokeDashoffset={-(frame * (dilate > 0 ? 4.2 : 1.8))}
        />
        {/* Small arterial branches */}
        <path
          d="M62 -74 C82 -82 100 -88 114 -84 M56 -124 C36 -134 12 -132 -12 -122"
          fill="none"
          stroke={arteryColor}
          strokeWidth={Math.max(3, arteryWidth * 0.45)}
          strokeLinecap="round"
        />

        {/* Visual constriction chevrons when showVesselDilate < -0.15 */}
        {dilate < -0.15 ? (
          <g fill="none" stroke="#0284c7" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" opacity={-dilate}>
            <path d="M30 -54 L44 -48 L32 -40" />
            <path d="M84 -38 L70 -44 L82 -52" />
          </g>
        ) : null}

        {/* Visual dilation outward pulse rings when showVesselDilate > 0.15 */}
        {dilate > 0.15 ? (
          <g fill="none" stroke="#ef4444" strokeWidth="3" opacity={0.75 * dilate}>
            <circle cx="64" cy="-76" r={16 + (frame % 18) * 1.4} opacity={1 - (frame % 18) / 18} />
            <circle cx="64" cy="-76" r={16 + ((frame + 9) % 18) * 1.4} opacity={1 - ((frame + 9) % 18) / 18} />
          </g>
        ) : null}
      </g>

      {/* 3-Branch Trigeminal Nerve (Dây thần kinh sinh ba: V1 Forehead, V2 Palate, V3 Jaw) */}
      {showTrigeminal ? (
        <g>
          {/* Soft glowing yellow-cyan nerve halo */}
          <g fill="none" stroke="#38bdf8" strokeWidth="9" strokeLinecap="round" opacity="0.32">
            <path d="M10 4 C44 -34 92 -72 138 -96" />
            <path d="M10 4 C54 18 96 36 138 44" />
            <path d="M10 4 C46 44 82 82 126 108" />
          </g>
          {/* Crisp golden-yellow nerve lines */}
          <g fill="none" stroke="#facc15" strokeWidth="4.4" strokeLinecap="round">
            {/* V1: Ophthalmic branch -> forehead / temples */}
            <path d="M10 4 C44 -34 92 -72 138 -96" />
            {/* V2: Maxillary branch -> upper palate */}
            <path d="M10 4 C54 18 96 36 138 44" />
            {/* V3: Mandibular branch -> lower jaw */}
            <path d="M10 4 C46 44 82 82 126 108" />
          </g>
          {/* Animated electric nerve impulses traveling palate -> ganglion -> forehead */}
          <g fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="7 18">
            <path d="M138 44 C96 36 54 18 10 4" strokeDashoffset={nerveDashOffset} />
            <path d="M10 4 C44 -34 92 -72 138 -96" strokeDashoffset={nerveDashOffset} />
          </g>
          {/* Trigeminal Ganglion Hub */}
          <circle cx="10" cy="4" r="11" fill="#fde047" stroke={INK} strokeWidth="3" />
          <circle cx="10" cy="4" r="4.5" fill="#0ea5e9" />
          {/* Branch endpoint nodes */}
          <circle cx="138" cy="-96" r="6" fill="#fde047" stroke={INK} strokeWidth="2.4" />
          <circle cx="138" cy="44" r="6" fill="#38bdf8" stroke={INK} strokeWidth="2.4" />
          <circle cx="126" cy="108" r="5.5" fill="#fde047" stroke={INK} strokeWidth="2.4" />
        </g>
      ) : null}

      {/* Pulsing Red Pain Starburst on Forehead (foreheadPainPct 0..1) */}
      {pain > 0.01 ? (
        <g transform={`translate(138, -96) scale(${lerp(0.65, 1.12, pain) * painPulse})`} opacity={pain}>
          <circle cx="0" cy="0" r="62" fill="url(#nd_sa_head_pain_burst)" />
          {/* Pulsing shockwave ring */}
          <circle
            cx="0"
            cy="0"
            r={24 + (frame % 20) * 2.2}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3.5"
            opacity={1 - (frame % 20) / 20}
          />
          {/* Sharp 8-point comic-scientific pain starburst */}
          <path
            d="M0 -42 L9 -15 L36 -26 L16 -4 L44 6 L15 14 L28 38 L4 18 L-10 42 L-11 14 L-38 22 L-16 0 L-40 -14 L-12 -14 L-22 -38 L-2 -18 Z"
            fill="#ef4444"
            stroke="#fef08a"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="0" r="10" fill="#fef08a" />
        </g>
      ) : null}
    </g>
  );
};

/**
 * Full 1920x1080 warm Vietnamese countryside summer porch backdrop:
 * - Bright sunny summer sky (NOON) or golden pleasant afternoon (AFTERNOON)
 * - Radiant sun with rotating rays, drifting clouds, lush green countryside trees
 * - House wall with open wooden-shuttered window, wooden porch pillar, tiled floor, wooden table
 * - Optional rising heat shimmer waves when heatIntensity > 0
 * - Bottom y = 900..1080 kept clear of critical labels for subtitles
 */
export const SummerPorchBackdrop: React.FC<{
  frame: number;
  heatIntensity?: number;
  timeOfDay?: 'NOON' | 'AFTERNOON';
}> = ({ frame, heatIntensity = 0, timeOfDay = 'NOON' }) => {
  const isAfternoon = timeOfDay === 'AFTERNOON';
  const heat = clamp01(heatIntensity);
  const cloudDrift = (frame * 0.38) % 1920;
  const sunSpin = (frame * 0.25) % 360;
  const sunCx = isAfternoon ? 320 : 370;
  const sunCy = isAfternoon ? 230 : 145;

  const skyGradId = isAfternoon ? 'nd_sa_porch_sky_afternoon' : 'nd_sa_porch_sky_noon';
  const wallFill = isAfternoon ? '#fde68a' : '#fef3c7';
  const floorFill = isAfternoon ? '#d97706' : '#e7c39c';

  return (
    <g>
      <defs>
        <linearGradient id="nd_sa_porch_sky_noon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="52%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>

        <linearGradient id="nd_sa_porch_sky_afternoon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="48%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>

        <radialGradient id="nd_sa_porch_sun_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.98" />
          <stop offset="38%" stopColor="#fde047" stopOpacity="0.58" />
          <stop offset="72%" stopColor="#fb923c" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="nd_sa_porch_floor_shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78350f" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#451a03" stopOpacity="0.28" />
        </linearGradient>

        <linearGradient id="nd_sa_porch_sunbeam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Summer Sky */}
      <rect x="0" y="0" width="1920" height="780" fill={`url(#${skyGradId})`} />

      {/* Radiant Sun & Slowly Rotating Rays */}
      <g transform={`translate(${sunCx}, ${sunCy})`}>
        <circle cx="0" cy="0" r="195" fill="url(#nd_sa_porch_sun_glow)" />
        <g transform={`rotate(${sunSpin})`} stroke="#fef08a" strokeWidth="6" strokeLinecap="round" opacity="0.78">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line key={`ray-${deg}`} x1="78" y1="0" x2="112" y2="0" transform={`rotate(${deg})`} />
          ))}
        </g>
        <circle cx="0" cy="0" r="62" fill="#fef08a" stroke="#f59e0b" strokeWidth="4.5" />
        <circle cx="-12" cy="-12" r="22" fill="#ffffff" opacity="0.45" />
      </g>

      {/* Soft Drifting Summer Clouds */}
      <g opacity={isAfternoon ? '0.82' : '0.92'}>
        {[0, 1920].map((offset) => (
          <g key={`cloud-set-${offset}`} transform={`translate(${offset - cloudDrift}, 0)`}>
            <path
              d="M90 250 C120 205 190 198 240 222 C280 182 365 186 405 224 C450 208 505 225 520 255 Z"
              fill={isAfternoon ? '#ffedd5' : '#ffffff'}
            />
            <path
              d="M660 190 C695 148 770 144 825 170 C875 130 970 135 1015 176 C1065 162 1120 178 1135 205 L660 205 Z"
              fill={isAfternoon ? '#fed7aa' : '#f8fafc'}
            />
          </g>
        ))}
      </g>

      {/* Distant Green Countryside Hills */}
      <path
        d="M0 615 Q260 535 550 585 T1080 570 L1080 770 L0 770 Z"
        fill={isAfternoon ? '#4d7c0f' : '#22c55e'}
        opacity="0.72"
      />

      {/* Lush Green Trees along the Yard */}
      {[
        { tx: 105, ty: 545, r: 72, c: '#15803d', hi: '#22c55e' },
        { tx: 270, ty: 575, r: 64, c: '#166534', hi: '#16a34a' },
        { tx: 455, ty: 540, r: 80, c: '#15803d', hi: '#4ade80' },
        { tx: 650, ty: 570, r: 68, c: '#166534', hi: '#22c55e' },
        { tx: 815, ty: 555, r: 74, c: '#15803d', hi: '#4ade80' },
      ].map((t, idx) => (
        <g key={`summer-tree-${idx}`}>
          <rect x={t.tx - 12} y={t.ty + 22} width="24" height="190" fill="#78350f" stroke={INK} strokeWidth="3.5" />
          <circle cx={t.tx} cy={t.ty} r={t.r} fill={t.c} stroke={INK} strokeWidth="4" />
          <circle cx={t.tx - t.r * 0.56} cy={t.ty + 20} r={t.r * 0.68} fill={t.c} stroke={INK} strokeWidth="3.5" />
          <circle cx={t.tx + t.r * 0.56} cy={t.ty + 22} r={t.r * 0.65} fill={t.c} stroke={INK} strokeWidth="3.5" />
          <circle cx={t.tx - t.r * 0.18} cy={t.ty - t.r * 0.25} r={t.r * 0.42} fill={t.hi} opacity="0.55" />
        </g>
      ))}

      {/* Warm Sunlight Wash Diagonal Across Yard */}
      <polygon points="180,155 760,155 1120,765 260,765" fill="url(#nd_sa_porch_sunbeam)" />

      {/* Optional Rising Heat Shimmer Waves in Sunny Yard (heatIntensity > 0) */}
      {heat > 0.01 ? (
        <g
          fill="none"
          stroke={isAfternoon ? '#fb923c' : '#fef08a'}
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity={heat * 0.62}
        >
          {[140, 340, 540, 740, 860].map((hx, idx) => {
            const rise = (frame * 1.8 + idx * 34) % 140;
            const yBase = 685 - rise;
            const waveOp = Math.sin((rise / 140) * Math.PI);
            return (
              <path
                key={`heat-wave-${idx}`}
                d={`M${hx} ${yBase} Q${hx - 18} ${yBase - 24} ${hx} ${yBase - 48} Q${hx + 18} ${yBase - 72} ${hx} ${yBase - 96}`}
                opacity={waveOp}
              />
            );
          })}
        </g>
      ) : null}

      {/* Vietnamese Countryside House Wall (right & center-right) */}
      <rect x="920" y="140" width="1000" height="625" fill={wallFill} stroke={INK} strokeWidth="5" />
      {/* Lower wall dado trim */}
      <rect x="920" y="612" width="1000" height="153" fill="#d97706" opacity="0.22" />
      <line x1="920" y1="612" x2="1920" y2="612" stroke={INK} strokeWidth="4" />

      {/* Open Wooden-Shuttered Countryside Window */}
      <g transform="translate(1070, 305)">
        {/* Window frame & cool shaded interior */}
        <rect x="0" y="0" width="268" height="216" rx="6" fill="#78350f" stroke={INK} strokeWidth="5" />
        <rect x="14" y="14" width="240" height="188" rx="3" fill="#334155" stroke={INK} strokeWidth="3.5" />
        {/* Soft sunlit curtain inside open window */}
        <path
          d={`M16 16 L84 16 Q${70 + Math.sin(frame * 0.08) * 6} 104 54 198 L16 198 Z`}
          fill="#fef9c3"
          opacity="0.82"
          stroke={INK}
          strokeWidth="2.5"
        />
        {/* Wooden window bars */}
        <line x1="134" y1="14" x2="134" y2="202" stroke="#78350f" strokeWidth="6" />
        <line x1="14" y1="108" x2="254" y2="108" stroke="#78350f" strokeWidth="6" />
        {/* Open side shutters with slats */}
        <rect x="-48" y="4" width="44" height="208" rx="4" fill="#15803d" stroke={INK} strokeWidth="4" />
        <rect x="272" y="4" width="44" height="208" rx="4" fill="#15803d" stroke={INK} strokeWidth="4" />
        {[36, 70, 104, 138, 172].map((sy) => (
          <g key={`shutter-${sy}`} stroke={INK} strokeWidth="2.4" opacity="0.55">
            <line x1="-40" y1={sy} x2="-12" y2={sy} />
            <line x1="280" y1={sy} x2="308" y2={sy} />
          </g>
        ))}
      </g>

      {/* Traditional Wooden Paneled Door */}
      <g transform="translate(1540, 285)">
        <rect x="0" y="0" width="210" height="475" rx="6" fill="#92400e" stroke={INK} strokeWidth="5" />
        <rect x="18" y="20" width="174" height="195" rx="4" fill="#b45309" stroke={INK} strokeWidth="3.5" />
        <rect x="18" y="240" width="174" height="210" rx="4" fill="#b45309" stroke={INK} strokeWidth="3.5" />
        <circle cx="32" cy="250" r="9" fill="#fde047" stroke={INK} strokeWidth="3" />
      </g>

      {/* Porch Roof Overhang (terracotta tile edge + wooden beam) */}
      <path d="M160 0 L1920 0 L1920 142 L205 142 L160 105 Z" fill="#9a3412" stroke={INK} strokeWidth="5" />
      <rect x="205" y="132" width="1715" height="28" fill="#78350f" stroke={INK} strokeWidth="4.5" />

      {/* Wooden Porch Pillar (left framing column) */}
      <g>
        <rect x="240" y="160" width="48" height="605" fill="#92400e" stroke={INK} strokeWidth="5" />
        <rect x="248" y="164" width="10" height="595" fill="#b45309" opacity="0.55" />
        <rect x="228" y="742" width="72" height="26" rx="4" fill="#78350f" stroke={INK} strokeWidth="4" />
        <rect x="232" y="158" width="64" height="22" rx="3" fill="#78350f" stroke={INK} strokeWidth="4" />
      </g>

      {/* Tiled Porch Floor (y = 760..1080) */}
      <rect x="0" y="760" width="1920" height="320" fill={floorFill} stroke={INK} strokeWidth="5" />
      {/* Horizontal tile grout lines */}
      <g stroke="#78350f" strokeWidth="2.5" opacity="0.38">
        <line x1="0" y1="815" x2="1920" y2="815" />
        <line x1="0" y1="885" x2="1920" y2="885" />
        <line x1="0" y1="975" x2="1920" y2="975" />
      </g>
      {/* Perspective tile grout lines */}
      <g stroke="#78350f" strokeWidth="2.5" opacity="0.32">
        {[120, 320, 520, 720, 920, 1120, 1320, 1520, 1720].map((gx) => (
          <line key={`ptile-${gx}`} x1={gx} y1="760" x2={gx + (gx - 960) * 0.32} y2="1080" />
        ))}
      </g>
      {/* Floor shading gradient */}
      <rect x="0" y="760" width="1920" height="320" fill="url(#nd_sa_porch_floor_shade)" />

      {/* Sturdy Wooden Porch Table (centered at x = 960, tabletop y = 696) */}
      <g>
        {/* Floor shadow under table */}
        <ellipse cx="960" cy="836" rx="220" ry="22" fill="#451a03" opacity="0.22" />
        {/* Back table legs */}
        <rect x="815" y="718" width="20" height="106" rx="3" fill="#78350f" stroke={INK} strokeWidth="4" />
        <rect x="1085" y="718" width="20" height="106" rx="3" fill="#78350f" stroke={INK} strokeWidth="4" />
        {/* Front table legs */}
        <rect x="780" y="720" width="24" height="118" rx="3" fill="#92400e" stroke={INK} strokeWidth="4.2" />
        <rect x="1116" y="720" width="24" height="118" rx="3" fill="#92400e" stroke={INK} strokeWidth="4.2" />
        {/* Table apron bar */}
        <rect x="784" y="718" width="352" height="22" fill="#78350f" stroke={INK} strokeWidth="4" />
        {/* Tabletop surface */}
        <rect x="752" y="692" width="416" height="30" rx="8" fill="#b45309" stroke={INK} strokeWidth="4.5" />
        <line x1="770" y1="704" x2="1150" y2="704" stroke="#d97706" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      </g>
    </g>
  );
};
