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
 * Consistent full-body V20.2 Stickman matching StickmanRig.tsx:
 * - BOY: black wavy hair dome on top (NOT a flat bowl cap!), normal 2D eyes
 * - GRANDPA: bald top with two gray/white side hair tufts, gray mustache, brown buttoned vest
 * - DOCTOR: black short hair, round glasses, white lab coat with stethoscope accent
 * - ALWAYS draws natural bent elbows & knees with rounded linecaps/joins
 */
export const SharedStickman: React.FC<{
  x: number;
  y: number;
  scale?: number;
  role: 'BOY' | 'GRANDPA' | 'DOCTOR';
  facing?: 'LEFT' | 'RIGHT';
  pose?: 'IDLE' | 'SIT' | 'COVER_HEAD' | 'REACH_SWITCH' | 'POINT_UP' | 'HAPPY_WAVE' | 'LOOK_WINDOW';
  expression?: 'HAPPY' | 'WORRIED' | 'SURPRISED' | 'CURIOUS' | 'PROUD' | 'NEUTRAL';
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
  const shiverX = pose === 'COVER_HEAD' ? Math.sin(frame * 0.45) * 2.2 : 0;
  const headTiltDeg =
    pose === 'LOOK_WINDOW'
      ? -7
      : pose === 'COVER_HEAD'
        ? 8
        : pose === 'POINT_UP'
          ? -10
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
        ) : pose === 'COVER_HEAD' ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-22 56 L-30 114" />
            <path d="M0 0 L22 56 L30 114" />
          </g>
        ) : pose === 'REACH_SWITCH' ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-20 56 L-28 114" />
            <path d="M0 0 L24 54 L34 114" />
          </g>
        ) : (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-17 58 L-26 114" />
            <path d="M0 0 L19 58 L28 114" />
          </g>
        )}

        {/* Back Arm (behind torso/coat) — ALWAYS bent elbow */}
        {pose === 'COVER_HEAD' ? (
          <path
            d={`M0 ${-84 + breath} L${-42 + shiverX} ${-118 + breath} L${-18 + shiverX} ${-166 + breath}`}
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
        ) : pose === 'REACH_SWITCH' ? (
          <path
            d={`M0 ${-84 + breath} L-28 ${-52 + breath} L-18 ${-18 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'LOOK_WINDOW' ? (
          <path
            d={`M0 ${-84 + breath} L-22 ${-50 + breath} L-6 ${-22 + breath}`}
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
        {pose === 'COVER_HEAD' ? (
          <path
            d={`M0 ${-84 + breath} L${44 + shiverX} ${-116 + breath} L${18 + shiverX} ${-166 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'SIT' ? (
          <path
            d={`M0 ${-84 + breath} L26 ${-38 + breath} L52 ${-20 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'REACH_SWITCH' ? (
          <path
            d={`M0 ${-84 + breath} L38 ${-88 + breath} L76 ${-108 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'POINT_UP' ? (
          <g stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={`M0 ${-84 + breath} L34 ${-96 + breath} L58 ${-150 + breath}`} />
          </g>
        ) : pose === 'HAPPY_WAVE' ? (
          <path
            d={`M0 ${-84 + breath} L38 ${-104 + breath} L${54 + waveOffset} ${-154 + breath}`}
            fill="none"
            stroke={INK}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : pose === 'LOOK_WINDOW' ? (
          <path
            d={`M0 ${-84 + breath} L36 ${-72 + breath} L56 ${-112 + breath}`}
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
        <g transform={`translate(0, ${-142 + breath}) rotate(${headTiltDeg})`}>
          <circle cx="0" cy="0" r="38" fill="#ffffff" stroke={INK} strokeWidth="5.5" />

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
              {/* Subtle forehead smile line */}
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

          {/* Normal 2D Eyes (no anime sparkles!) */}
          <g>
            <circle cx="-4" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
            <circle cx="-2" cy="-2" r="3.2" fill={INK} />
            <circle cx="19" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
            <circle cx="21" cy="-2" r="3.2" fill={INK} />
          </g>

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

          {/* Expressions: Eyebrows, Mouth, and Subtle Cheek/Sweat Accents */}
          {expression === 'WORRIED' ? (
            <g>
              <line x1="-12" y1="-12" x2="2" y2="-16" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <line x1="27" y1="-12" x2="13" y2="-16" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M-2 21 Q8 14 18 21" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
              <path
                d="M-28 -18 C-34 -8 -34 2 -28 2 C-22 2 -22 -8 -28 -18 Z"
                fill="#38bdf8"
                stroke={INK}
                strokeWidth="2.4"
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
      </g>
    </g>
  );
};

/**
 * Clean, realistic 2D cartoon-scientific Winged Termite (Mối cánh):
 * - Warm brown head with beaded straight antennae (râu thẳng chuỗi hạt)
 * - Straight thick waist / thorax-abdomen (KHÔNG thắt eo!)
 * - 6 articulated tiny legs
 * - 4 equal-length translucent pale-cream/amber veined wings flapping smoothly at 60fps
 * - Supports post-shedding crawling state (wingsAttached=false) & animated wing-drop (wingDropProgress 0..1)
 */
export const WingedTermite: React.FC<{
  x: number;
  y: number;
  scale?: number;
  angleDeg?: number;
  frame: number;
  phase?: number;
  wingsAttached?: boolean;
  wingDropProgress?: number;
  highlightParts?: boolean;
}> = ({
  x,
  y,
  scale = 1,
  angleDeg = 0,
  frame,
  phase = 0,
  wingsAttached = true,
  wingDropProgress = 0,
  highlightParts = false,
}) => {
  const flap = Math.sin(frame * 0.7 + phase);
  const drop = clamp01(wingDropProgress);
  const showWings = wingsAttached || drop > 0;
  const crawlWiggle = !wingsAttached ? Math.sin(frame * 0.35 + phase) * 3.5 : 0;

  // Wing flap angles (4 equal-length wings rooted at thorax x = 4..-4)
  const foreAngleTop = -34 + flap * 24 - drop * 38;
  const hindAngleTop = -18 + flap * 18 - drop * 28;
  const foreAngleBot = 34 - flap * 24 + drop * 38;
  const hindAngleBot = 18 - flap * 18 + drop * 28;

  const wingDx = -drop * 46;
  const wingDyTop = -drop * 26 + drop * drop * 58;
  const wingDyBot = drop * 36 + drop * drop * 52;
  const wingOpacity = drop > 0 ? clamp01(1 - drop * 0.85) : 1;

  // Beaded antennae bead coordinates (straight/gently curved, NOT elbowed like ants)
  const topAntBeads = [
    [40, -9],
    [47, -13],
    [54, -17],
    [61, -20],
    [68, -22],
  ];
  const botAntBeads = [
    [40, 9],
    [47, 13],
    [54, 17],
    [61, 20],
    [68, 22],
  ];

  const renderWing = (wAngle: number, tx: number, ty: number, key: string) => (
    <g key={key} transform={`translate(${tx}, ${ty}) rotate(${wAngle})`} opacity={wingOpacity}>
      {/* Equal-length elongated teardrop termite wing */}
      <path
        d="M0 0 C-14 -16 -54 -22 -84 -10 C-94 -6 -94 6 -84 10 C-54 22 -14 16 0 0 Z"
        fill="#fef3c7"
        fillOpacity="0.72"
        stroke="#b45309"
        strokeWidth="2.2"
      />
      {/* Delicate amber longitudinal veins */}
      <path d="M-4 -1 C-28 -7 -58 -8 -84 -3" fill="none" stroke="#d97706" strokeWidth="1.4" opacity="0.85" />
      <path d="M-4 1 C-28 4 -56 7 -82 3" fill="none" stroke="#d97706" strokeWidth="1.1" opacity="0.7" />
      <path d="M-24 -6 L-34 -12 M-46 -7 L-58 -12 M-64 -5 L-74 -8" stroke="#d97706" strokeWidth="0.9" opacity="0.6" />
      {/* Basal wing suture line */}
      <line x1="-5" y1="-5" x2="-5" y2="5" stroke="#92400e" strokeWidth="1.8" strokeDasharray="2 2" />
    </g>
  );

  return (
    <g transform={`translate(${x}, ${y}) rotate(${angleDeg}) scale(${scale})`}>
      {/* 6 Articulated Tiny Legs (3 pairs attached to thorax, bent knees) */}
      <g stroke="#5c2d0c" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Front pair */}
        <path d={`M14 -9 L24 ${-22 + crawlWiggle} L34 ${-26 + crawlWiggle}`} />
        <path d={`M14 9 L24 ${22 - crawlWiggle} L34 ${26 - crawlWiggle}`} />
        {/* Middle pair */}
        <path d={`M2 -10 L4 ${-26 - crawlWiggle} L-4 ${-34 - crawlWiggle}`} />
        <path d={`M2 10 L4 ${26 + crawlWiggle} L-4 ${34 + crawlWiggle}`} />
        {/* Hind pair */}
        <path d={`M-9 -10 L-18 ${-26 + crawlWiggle} L-30 ${-32 + crawlWiggle}`} />
        <path d={`M-9 10 L-18 ${26 - crawlWiggle} L-30 ${32 - crawlWiggle}`} />
      </g>

      {/* Straight thick abdomen & thorax (KHÔNG thắt eo!) */}
      <g>
        {/* Abdomen (broadly joined to thorax) */}
        <path
          d="M-6 -12 C-24 -14 -46 -11 -52 0 C-46 11 -24 14 -6 12 Z"
          fill="#b45309"
          stroke={INK}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Abdominal segments */}
        <path d="M-16 -12 Q-14 0 -16 12" fill="none" stroke="#78350f" strokeWidth="2.2" />
        <path d="M-26 -12 Q-24 0 -26 12" fill="none" stroke="#78350f" strokeWidth="2.2" />
        <path d="M-36 -11 Q-34 0 -36 11" fill="none" stroke="#78350f" strokeWidth="2.2" />
        <path d="M-44 -8 Q-42 0 -44 8" fill="none" stroke="#78350f" strokeWidth="2" />
        {/* Soft dorsal highlight */}
        <ellipse cx="-26" cy="-4" rx="16" ry="3.5" fill="#f59e0b" opacity="0.35" />

        {/* Broad Thorax (same width as abdomen — NO pinched ant waist!) */}
        <rect
          x="-11"
          y="-11.5"
          width="28"
          height="23"
          rx="9"
          fill="#92400e"
          stroke={INK}
          strokeWidth="2.8"
        />
        {/* Pronotum collar line */}
        <path d="M6 -11 Q8 0 6 11" fill="none" stroke="#78350f" strokeWidth="2.2" />
      </g>

      {/* Warm brown head + eyes + tiny mandibles */}
      <g>
        <ellipse cx="26" cy="0" rx="12.5" ry="11" fill="#78350f" stroke={INK} strokeWidth="2.8" />
        {/* Tiny mandibles */}
        <path d="M37 -3 L43 -1 M37 3 L43 1" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        {/* Compound eyes */}
        <circle cx="29" cy="-6.5" r="2.6" fill="#0f172a" />
        <circle cx="29" cy="6.5" r="2.6" fill="#0f172a" />
        <circle cx="29.8" cy="-7.2" r="0.9" fill="#ffffff" />
        <circle cx="29.8" cy="5.8" r="0.9" fill="#ffffff" />
      </g>

      {/* Beaded straight antennae (Râu thẳng chuỗi hạt) */}
      <g>
        <path d="M35 -6 L68 -22" fill="none" stroke="#5c2d0c" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M35 6 L68 22" fill="none" stroke="#5c2d0c" strokeWidth="2.2" strokeLinecap="round" />
        {topAntBeads.map(([bx, by], i) => (
          <circle key={`ta-${i}`} cx={bx} cy={by} r="2.5" fill="#92400e" stroke={INK} strokeWidth="1.2" />
        ))}
        {botAntBeads.map(([bx, by], i) => (
          <circle key={`ba-${i}`} cx={bx} cy={by} r="2.5" fill="#92400e" stroke={INK} strokeWidth="1.2" />
        ))}
      </g>

      {/* 4 Equal-Length Translucent Pale-Cream/Amber Veined Wings */}
      {showWings ? (
        <g>
          {renderWing(hindAngleTop, -4 + wingDx, -6 + wingDyTop, 'hind-top')}
          {renderWing(hindAngleBot, -4 + wingDx, 6 + wingDyBot, 'hind-bot')}
          {renderWing(foreAngleTop, 5 + wingDx, -6 + wingDyTop, 'fore-top')}
          {renderWing(foreAngleBot, 5 + wingDx, 6 + wingDyBot, 'fore-bot')}
        </g>
      ) : null}

      {/* Optional scientific callout highlights (antennae, straight waist, equal wings) */}
      {highlightParts ? (
        <g fill="none" stroke="#38bdf8" strokeWidth="2.6" strokeDasharray="5 4">
          {/* Straight beaded antennae highlight */}
          <ellipse cx="53" cy="-16" rx="19" ry="9" transform="rotate(-24 53 -16)" />
          {/* Straight thick waist highlight */}
          <rect x="-15" y="-16" width="22" height="32" rx="8" stroke="#fbbf24" />
          {/* Equal wings highlight */}
          {showWings ? <ellipse cx="-42" cy="-26" rx="48" ry="18" transform="rotate(-14 -42 -26)" stroke="#34d399" /> : null}
        </g>
      ) : null}
    </g>
  );
};

/**
 * Full 1920x1080 realistic Vietnamese countryside night porch scene:
 * - Deep indigo storm sky, slowly drifting dark rain clouds, distant trees/hills
 * - Warm house wall with wooden door/window, porch ceiling with hanging tube/bulb lamp
 * - Soft radial glow cone (cool WHITE or warm YELLOW) when lampOn !== false
 * - Tiled porch floor (y = 760..1080), wooden porch pillar, optional diagonal rain streaks
 * - Bottom y = 900..1080 kept clear of critical text/labels for subtitles
 */
export const PorchNightBackdrop: React.FC<{
  frame: number;
  lampOn?: boolean;
  lampColor?: 'WHITE' | 'YELLOW';
  rainIntensity?: number;
  showClouds?: boolean;
}> = ({ frame, lampOn = true, lampColor = 'WHITE', rainIntensity = 0, showClouds = true }) => {
  const cloudDrift = (frame * 0.45) % 1920;
  const rainLevel = clamp01(rainIntensity);
  const isYellow = lampColor === 'YELLOW';

  const glowId = isYellow ? 'mcPorchGlowYellow' : 'mcPorchGlowWhite';
  const coneId = isYellow ? 'mcPorchConeYellow' : 'mcPorchConeWhite';
  const bulbFill = !lampOn ? '#64748b' : isYellow ? '#fef08a' : '#f0f9ff';
  const wallFill = !lampOn ? '#475569' : isYellow ? '#78624a' : '#64748b';
  const floorBase = !lampOn ? '#334155' : isYellow ? '#5c4636' : '#475569';

  const rainStreaks = Array.from({ length: 44 }, (_, i) => {
    const seedX = (i * 97) % 2100;
    const seedY = (i * 173) % 1100;
    const speed = 18 + (i % 5) * 4;
    const rx = ((seedX - frame * (speed * 0.35)) % 2100 + 2100) % 2100 - 100;
    const ry = (seedY + frame * speed) % 1080;
    const len = 34 + (i % 4) * 14;
    return { x: rx, y: ry, len, op: 0.28 + (i % 3) * 0.14 };
  });

  return (
    <g>
      <defs>
        <linearGradient id="mcPorchSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#090e1f" />
          <stop offset="55%" stopColor="#16213e" />
          <stop offset="100%" stopColor="#24355a" />
        </linearGradient>

        <radialGradient id="mcPorchGlowWhite" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#bae6fd" stopOpacity="0.55" />
          <stop offset="68%" stopColor="#7dd3fc" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="mcPorchGlowYellow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.95" />
          <stop offset="32%" stopColor="#fde047" stopOpacity="0.52" />
          <stop offset="68%" stopColor="#f59e0b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="mcPorchConeWhite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="mcPorchConeYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.44" />
          <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="mcPorchFloorShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Deep indigo storm sky */}
      <rect x="0" y="0" width="1920" height="780" fill="url(#mcPorchSkyGrad)" />

      {/* Slowly drifting dark rain clouds */}
      {showClouds ? (
        <g opacity="0.88">
          {[0, 1920].map((offset) => (
            <g key={offset} transform={`translate(${offset - cloudDrift}, 0)`}>
              <path
                d="M-40 220 C30 155 150 145 240 185 C310 130 460 130 530 185 C610 155 720 175 760 225 L760 270 L-40 270 Z"
                fill="#1e293b"
              />
              <path
                d="M640 265 C720 190 860 185 960 225 C1040 165 1210 165 1300 220 C1390 190 1510 215 1560 275 L640 275 Z"
                fill="#172033"
              />
              <path
                d="M1280 215 C1360 150 1510 145 1610 185 C1690 135 1840 145 1920 205 L1920 260 L1280 260 Z"
                fill="#1e293b"
              />
            </g>
          ))}
        </g>
      ) : null}

      {/* Distant hills & countryside tree silhouettes */}
      <path
        d="M0 640 Q260 555 540 605 T1120 595 L1120 770 L0 770 Z"
        fill="#132238"
      />
      {/* Tree silhouettes along left yard */}
      {[110, 260, 440, 620, 790].map((tx, idx) => {
        const r = 56 + (idx % 3) * 18;
        const ty = 580 + (idx % 2) * 26;
        return (
          <g key={`tree-${idx}`} fill="#0c1729">
            <rect x={tx - 10} y={ty + 20} width="20" height="160" />
            <circle cx={tx} cy={ty} r={r} />
            <circle cx={tx - r * 0.55} cy={ty + 18} r={r * 0.68} />
            <circle cx={tx + r * 0.55} cy={ty + 22} r={r * 0.65} />
          </g>
        );
      })}

      {/* Warm Vietnamese countryside house wall (right & back-center) */}
      <rect x="920" y="140" width="1000" height="625" fill={wallFill} stroke={INK} strokeWidth="5" />
      {/* Wall dado / lower wainscot trim */}
      <rect x="920" y="610" width="1000" height="155" fill="#334155" opacity="0.45" />
      <line x1="920" y1="610" x2="1920" y2="610" stroke={INK} strokeWidth="4" />

      {/* Traditional Wooden Paneled Door */}
      <g transform="translate(1520, 285)">
        <rect x="0" y="0" width="210" height="475" rx="6" fill="#7c2d12" stroke={INK} strokeWidth="5" />
        <rect x="18" y="20" width="174" height="195" rx="4" fill="#9a3412" stroke={INK} strokeWidth="3.5" />
        <rect x="18" y="240" width="174" height="210" rx="4" fill="#9a3412" stroke={INK} strokeWidth="3.5" />
        <circle cx="32" cy="250" r="9" fill="#fbbf24" stroke={INK} strokeWidth="3" />
      </g>

      {/* Wooden-Shuttered Countryside Window with warm indoor glow */}
      <g transform="translate(1110, 320)">
        <rect x="0" y="0" width="260" height="210" rx="6" fill="#78350f" stroke={INK} strokeWidth="5" />
        <rect x="14" y="14" width="232" height="182" rx="3" fill="#fef08a" opacity={lampOn ? '0.78' : '0.45'} stroke={INK} strokeWidth="3.5" />
        {/* Window muntin bars */}
        <line x1="130" y1="14" x2="130" y2="196" stroke="#78350f" strokeWidth="6" />
        <line x1="14" y1="105" x2="246" y2="105" stroke="#78350f" strokeWidth="6" />
        {/* Open side shutters */}
        <rect x="-44" y="4" width="40" height="202" rx="4" fill="#92400e" stroke={INK} strokeWidth="4" />
        <rect x="264" y="4" width="40" height="202" rx="4" fill="#92400e" stroke={INK} strokeWidth="4" />
      </g>

      {/* Porch Roof Overhang & Ceiling Beam */}
      <path d="M160 0 L1920 0 L1920 155 L210 155 L160 115 Z" fill="#1e293b" stroke={INK} strokeWidth="5" />
      <rect x="210" y="135" width="1710" height="26" fill="#78350f" stroke={INK} strokeWidth="4.5" />

      {/* Wooden Porch Pillar (left framing column) */}
      <g>
        <rect x="240" y="155" width="46" height="610" fill="#78350f" stroke={INK} strokeWidth="5" />
        <rect x="228" y="742" width="70" height="26" rx="4" fill="#5c2d0c" stroke={INK} strokeWidth="4" />
        <rect x="232" y="155" width="62" height="22" rx="3" fill="#5c2d0c" stroke={INK} strokeWidth="4" />
      </g>

      {/* Tiled Porch Floor (y = 760..1080) */}
      <rect x="0" y="760" width="1920" height="320" fill={floorBase} stroke={INK} strokeWidth="5" />
      {/* Horizontal tile grout lines */}
      <g stroke={INK} strokeWidth="2.5" opacity="0.4">
        <line x1="0" y1="815" x2="1920" y2="815" />
        <line x1="0" y1="885" x2="1920" y2="885" />
        <line x1="0" y1="975" x2="1920" y2="975" />
      </g>
      {/* Perspective tile lines */}
      <g stroke={INK} strokeWidth="2.5" opacity="0.35">
        {[120, 320, 520, 720, 920, 1120, 1320, 1520, 1720].map((gx) => (
          <line key={`tile-${gx}`} x1={gx} y1="760" x2={gx + (gx - 960) * 0.32} y2="1080" />
        ))}
      </g>
      {/* Floor shading gradient */}
      <rect x="0" y="760" width="1920" height="320" fill="url(#mcPorchFloorShade)" />

      {/* Hanging Porch Lamp (x = 960, y = 225) + Glow Cone */}
      {lampOn ? (
        <g>
          {/* Soft downward light cone */}
          <polygon points="875,235 1045,235 1440,840 480,840" fill={`url(#${coneId})`} />
          {/* Soft floor light pool */}
          <ellipse
            cx="960"
            cy="820"
            rx="430"
            ry="68"
            fill={isYellow ? '#fde047' : '#bae6fd'}
            opacity="0.16"
          />
          {/* Radial halo around lamp */}
          <circle cx="960" cy="232" r="245" fill={`url(#${glowId})`} />
        </g>
      ) : null}

      {/* Lamp cord, metal shade, and bulb */}
      <g>
        <line x1="960" y1="155" x2="960" y2="202" stroke={INK} strokeWidth="5" />
        <path
          d="M914 224 Q960 186 1006 224 Z"
          fill="#334155"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <ellipse cx="960" cy="236" rx="22" ry="26" fill={bulbFill} stroke={INK} strokeWidth="4" />
        {lampOn ? (
          <ellipse cx="954" cy="228" rx="7" ry="10" fill="#ffffff" opacity="0.75" />
        ) : null}
      </g>

      {/* Optional diagonal falling rain streaks */}
      {rainLevel > 0 ? (
        <g stroke="#bae6fd" strokeWidth="2.6" strokeLinecap="round" opacity={rainLevel * 0.85}>
          {rainStreaks.map((r, i) => (
            <line
              key={`rain-${i}`}
              x1={r.x}
              y1={r.y}
              x2={r.x - r.len * 0.32}
              y2={r.y + r.len}
              opacity={r.op}
            />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/**
 * Full 1920x1080 cross-section Soil Cutaway Backdrop:
 * - Night sky (y = 0..240) with optional rain on top
 * - Grass & old tree trunk/roots (y = 240..300)
 * - Rich layered dark-brown soil (y = 300..1080) with organic underground chambers
 *   and winding tunnels connected to surface exit holes
 * - Optional humidityGlow pulsing through soil and chambers
 * - Bottom y = 900..1080 kept clear of critical text/labels for subtitles
 */
export const SoilCutawayBackdrop: React.FC<{
  frame: number;
  rainOnTop?: boolean;
  humidityGlow?: boolean;
}> = ({ frame, rainOnTop = false, humidityGlow = false }) => {
  const cloudShift = (frame * 0.35) % 1920;
  const humidPulse = 0.55 + Math.sin(frame * 0.08) * 0.25;

  const topRain = Array.from({ length: 34 }, (_, i) => {
    const sx = (i * 113) % 2000;
    const sy = (i * 47) % 240;
    const rx = ((sx - frame * 4.5) % 2000 + 2000) % 2000 - 40;
    const ry = (sy + frame * 15) % 245;
    return { x: rx, y: ry, len: 22 + (i % 3) * 8 };
  });

  const pebbles = [
    [140, 410, 14, 9],
    [480, 390, 11, 7],
    [760, 440, 16, 10],
    [1380, 395, 13, 8],
    [1720, 460, 18, 11],
    [220, 680, 15, 9],
    [610, 740, 12, 8],
    [1490, 690, 17, 10],
    [1780, 760, 14, 9],
    [350, 880, 16, 10],
    [1240, 875, 15, 8],
    [1640, 910, 13, 8],
  ];

  return (
    <g>
      <defs>
        <linearGradient id="mcSoilSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1120" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="mcSoilDepthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c3a21" />
          <stop offset="28%" stopColor="#452715" />
          <stop offset="68%" stopColor="#331c0e" />
          <stop offset="100%" stopColor="#231208" />
        </linearGradient>

        <radialGradient id="mcSoilHumidityGrad" cx="50%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#2dd4bf" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Night sky (y = 0..248) */}
      <rect x="0" y="0" width="1920" height="255" fill="url(#mcSoilSkyGrad)" />

      {/* Subtle drifting storm clouds in top sky */}
      <g opacity="0.72">
        {[0, 1920].map((off) => (
          <g key={`sc-${off}`} transform={`translate(${off - cloudShift}, 0)`}>
            <path
              d="M80 120 C140 70 260 65 340 100 C410 55 540 60 600 105 C670 85 750 100 780 135 L80 135 Z"
              fill="#1e293b"
            />
            <path
              d="M1020 110 C1100 60 1240 55 1330 95 C1420 50 1570 60 1640 110 L1020 110 Z"
              fill="#172033"
            />
          </g>
        ))}
      </g>

      {/* Old Tree Trunk & Roots (left side, grounded at y = 240..300) */}
      <g>
        <path
          d="M250 115 C255 180 245 235 205 280 L435 280 C395 235 385 180 390 115 Z"
          fill="#5c3a21"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Bark lines */}
        <path d="M292 135 C295 185 288 230 272 268" fill="none" stroke="#3b2211" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M342 130 C338 185 345 225 362 268" fill="none" stroke="#3b2211" strokeWidth="3.5" strokeLinecap="round" />
        {/* Canopy silhouette peeking at top-left */}
        <circle cx="240" cy="70" r="85" fill="#14532d" stroke={INK} strokeWidth="4" />
        <circle cx="340" cy="58" r="95" fill="#166534" stroke={INK} strokeWidth="4" />
        <circle cx="430" cy="82" r="72" fill="#14532d" stroke={INK} strokeWidth="4" />
      </g>

      {/* Grass Surface Strip (y = 240..300) */}
      <path
        d="M0 262 Q240 246 480 260 T960 256 T1440 262 T1920 254 L1920 306 L0 306 Z"
        fill="#15803d"
        stroke={INK}
        strokeWidth="4.5"
      />
      {/* Grass blades */}
      <g stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" fill="none">
        {[90, 175, 520, 640, 810, 1140, 1290, 1480, 1650, 1810].map((gx, i) => (
          <path key={`gb-${i}`} d={`M${gx} 260 L${gx - 6} 238 M${gx + 6} 260 L${gx + 12} 240`} />
        ))}
      </g>

      {/* Rich Layered Dark-Brown Soil (y = 300..1080) */}
      <rect x="0" y="298" width="1920" height="782" fill="url(#mcSoilDepthGrad)" />
      {/* Topsoil wavy strata boundary */}
      <path
        d="M0 300 Q320 318 640 298 T1280 312 T1920 296 L1920 330 L0 330 Z"
        fill="#6b4226"
        opacity="0.55"
      />
      {/* Mid-soil & deep-soil subtle strata bands */}
      <path
        d="M0 540 Q480 515 960 545 T1920 530 L1920 580 Q1440 595 960 570 T0 585 Z"
        fill="#2b170b"
        opacity="0.32"
      />
      <path
        d="M0 810 Q480 785 960 820 T1920 800 L1920 1080 L0 1080 Z"
        fill="#1c0e06"
        opacity="0.45"
      />

      {/* Underground Tree Roots reaching into topsoil */}
      <g fill="none" stroke="#6b4226" strokeLinecap="round">
        <path d="M265 292 C230 355 170 400 115 450" strokeWidth="18" />
        <path d="M315 296 C305 375 265 440 235 510" strokeWidth="14" />
        <path d="M375 294 C420 365 480 410 555 445" strokeWidth="16" />
        <path d="M265 292 C230 355 170 400 115 450" stroke="#3b2211" strokeWidth="4" />
        <path d="M375 294 C420 365 480 410 555 445" stroke="#3b2211" strokeWidth="4" />
      </g>

      {/* Scattered Soil Pebbles */}
      <g fill="#4b3222" stroke="#231208" strokeWidth="2.5">
        {pebbles.map(([px, py, rx, ry], i) => (
          <ellipse key={`peb-${i}`} cx={px} cy={py} rx={rx} ry={ry} />
        ))}
      </g>

      {/* Organic Underground Termite Tunnels & Chambers connected to Surface Exit Holes */}
      <g>
        {/* Dark tunnel outer rim */}
        <g fill="none" stroke="#1e0f07" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round">
          {/* Surface exit tunnel 1 (center-left) */}
          <path d="M690 278 C685 360 735 420 790 485 C830 530 865 565 920 600" />
          {/* Surface exit tunnel 2 (center-right) */}
          <path d="M1010 276 C1015 365 990 445 970 535" />
          {/* Surface exit tunnel 3 (right) */}
          <path d="M1320 280 C1310 370 1240 455 1175 535 C1120 600 1070 630 1015 645" />
          {/* Deep side branch tunnels */}
          <path d="M840 645 C740 680 650 715 560 725" />
          <path d="M1085 655 C1190 695 1290 720 1395 725" />
        </g>

        {/* Warm earthy tunnel interior */}
        <g fill="none" stroke="#7c4a2d" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round">
          <path d="M690 278 C685 360 735 420 790 485 C830 530 865 565 920 600" />
          <path d="M1010 276 C1015 365 990 445 970 535" />
          <path d="M1320 280 C1310 370 1240 455 1175 535 C1120 600 1070 630 1015 645" />
          <path d="M840 645 C740 680 650 715 560 725" />
          <path d="M1085 655 C1190 695 1290 720 1395 725" />
        </g>

        {/* Main Central Nest Chamber */}
        <ellipse cx="965" cy="635" rx="195" ry="112" fill="#7c4a2d" stroke="#1e0f07" strokeWidth="8" />
        <ellipse cx="965" cy="645" rx="165" ry="82" fill="#8f5838" opacity="0.5" />

        {/* Left Staging Chamber */}
        <ellipse cx="525" cy="725" rx="115" ry="68" fill="#7c4a2d" stroke="#1e0f07" strokeWidth="7" />
        <ellipse cx="525" cy="732" rx="90" ry="48" fill="#8f5838" opacity="0.45" />

        {/* Right Staging Chamber */}
        <ellipse cx="1415" cy="725" rx="120" ry="70" fill="#7c4a2d" stroke="#1e0f07" strokeWidth="7" />
        <ellipse cx="1415" cy="732" rx="95" ry="50" fill="#8f5838" opacity="0.45" />

        {/* Upper Waiting Pocket */}
        <ellipse cx="785" cy="480" rx="82" ry="48" fill="#7c4a2d" stroke="#1e0f07" strokeWidth="6.5" />

        {/* Surface Exit Hole Mounds (y = 264..285) */}
        {[690, 1010, 1320].map((hx, idx) => (
          <g key={`exit-${idx}`}>
            <path
              d={`M${hx - 36} 280 Q${hx} 254 ${hx + 36} 280 Z`}
              fill="#5c3a21"
              stroke={INK}
              strokeWidth="3.5"
            />
            <ellipse cx={hx} cy="276" rx="18" ry="8" fill="#1e0f07" />
          </g>
        ))}
      </g>

      {/* Optional Humidity Glow pulsing through topsoil & chambers */}
      {humidityGlow ? (
        <g opacity={humidPulse}>
          <rect x="0" y="250" width="1920" height="630" fill="url(#mcSoilHumidityGrad)" />
          {/* Gentle moisture aura inside central & staging chambers */}
          <ellipse cx="965" cy="635" rx="175" ry="92" fill="#38bdf8" opacity="0.16" />
          <ellipse cx="525" cy="725" rx="95" ry="52" fill="#2dd4bf" opacity="0.15" />
          <ellipse cx="1415" cy="725" rx="100" ry="54" fill="#2dd4bf" opacity="0.15" />
        </g>
      ) : null}

      {/* Optional Rain Falling on Top Sky + Tiny Surface Splashes */}
      {rainOnTop ? (
        <g>
          <g stroke="#bae6fd" strokeWidth="2.4" strokeLinecap="round" opacity="0.78">
            {topRain.map((r, i) => (
              <line key={`tr-${i}`} x1={r.x} y1={r.y} x2={r.x - r.len * 0.28} y2={r.y + r.len} />
            ))}
          </g>
          {[180, 560, 880, 1180, 1520, 1780].map((sx, i) => {
            const p = ((frame * 0.12 + i * 0.37) % 1);
            return (
              <ellipse
                key={`sp-${i}`}
                cx={sx}
                cy="258"
                rx={6 + p * 18}
                ry={2 + p * 4}
                fill="none"
                stroke="#bae6fd"
                strokeWidth="2"
                opacity={1 - p}
              />
            );
          })}
        </g>
      ) : null}
    </g>
  );
};
