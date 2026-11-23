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

export type StickmanRole = 'BOY' | 'GRANDPA' | 'ANCIENT';
export type StickmanMood = 'HAPPY' | 'NEUTRAL' | 'DIZZY' | 'SURPRISED' | 'RELAXED';

/**
 * Consistent full-body Stickman (NO horns, NO bear ears, NO cut-off legs).
 * Origin (0, 0) is at the hip/seat level when seated, or waist when standing.
 */
export const SharedStickman: React.FC<{
  x: number;
  y: number;
  scale?: number;
  role?: StickmanRole;
  mood?: StickmanMood;
  facing?: 'RIGHT' | 'LEFT';
  seated?: boolean;
  holdingPhone?: boolean;
  headphones?: boolean;
  sweating?: boolean;
  headTiltDeg?: number;
}> = ({
  x,
  y,
  scale = 1,
  role = 'BOY',
  mood = 'HAPPY',
  facing = 'RIGHT',
  seated = false,
  holdingPhone = false,
  headphones = false,
  sweating = false,
  headTiltDeg = 0,
}) => {
  const dir = facing === 'RIGHT' ? 1 : -1;
  const faceFill = mood === 'DIZZY' ? '#dcfce7' : '#ffffff';

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale * dir}, ${scale})`}>
      {/* Legs — ALWAYS drawn completely */}
      {seated ? (
        <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M0 0 L68 0 L76 92" />
          <path d="M-4 6 L54 8 L60 92" />
        </g>
      ) : (
        <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M0 0 L-26 112" />
          <path d="M0 0 L28 112" />
        </g>
      )}

      {/* Torso */}
      <line x1="0" y1="0" x2="0" y2="-104" stroke={INK} strokeWidth="7" strokeLinecap="round" />

      {/* Arms */}
      {holdingPhone ? (
        <g>
          <path d="M0 -84 L38 -40 L72 -48" fill="none" stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0 -84 L28 -32 L68 -44" fill="none" stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Phone */}
          <g transform="translate(76, -54) rotate(18)">
            <rect x="-12" y="-22" width="24" height="44" rx="5" fill="#1e293b" stroke={INK} strokeWidth="3" />
            <rect x="-8" y="-17" width="16" height="32" rx="2" fill="#7dd3fc" />
          </g>
        </g>
      ) : mood === 'DIZZY' ? (
        <g stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M0 -84 L-26 -42 L-6 -20" />
          <path d="M0 -84 L30 -44 L10 -18" />
        </g>
      ) : seated ? (
        <g stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M0 -84 L26 -38 L52 -20" />
          <path d="M0 -84 L-16 -36 L12 -18" />
        </g>
      ) : (
        <g stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M0 -84 L-26 -24" />
          <path d="M0 -84 L28 -24" />
        </g>
      )}

      {/* Head */}
      <g transform={`translate(0, -142) rotate(${headTiltDeg})`}>
        <circle cx="0" cy="0" r="38" fill={faceFill} stroke={INK} strokeWidth="5.5" />

        {/* Hair — clean & smooth, NO horns, NO bear ears */}
        {role === 'BOY' ? (
          <path
            d="M-36 -10 C-36 -42 36 -42 36 -10 C22 -20 -18 -20 -36 -10 Z"
            fill="#1e293b"
          />
        ) : role === 'GRANDPA' ? (
          <g>
            <path
              d="M-34 -16 C-28 -40 28 -40 34 -16 C20 -26 -20 -26 -34 -16 Z"
              fill="#cbd5e1"
              stroke={INK}
              strokeWidth="3"
            />
            {/* Neat round glasses */}
            <circle cx="-4" cy="-2" r="10" fill="none" stroke={INK} strokeWidth="3" />
            <circle cx="19" cy="-2" r="10" fill="none" stroke={INK} strokeWidth="3" />
            <line x1="6" y1="-2" x2="9" y2="-2" stroke={INK} strokeWidth="3" />
            {/* Small gray mustache */}
            <path d="M-2 13 Q8 9 18 13" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
          </g>
        ) : (
          <path
            d="M-37 -8 C-38 -42 38 -42 37 -8 C20 -22 -18 -22 -37 -8 Z"
            fill="#475569"
          />
        )}

        {/* Headphones if worn */}
        {headphones ? (
          <g>
            <path d="M-40 -4 A40 40 0 0 1 40 -4" fill="none" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
            <rect x="-46" y="-12" width="12" height="24" rx="6" fill="#f59e0b" stroke={INK} strokeWidth="3" />
            <rect x="34" y="-12" width="12" height="24" rx="6" fill="#f59e0b" stroke={INK} strokeWidth="3" />
          </g>
        ) : null}

        {/* Eyes — clean normal 2D eyes (white sclera + solid black pupil, looking forward) */}
        {mood === 'RELAXED' ? (
          <g stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M-10 -2 Q-4 -8 2 -2" />
            <path d="M13 -2 Q19 -8 25 -2" />
          </g>
        ) : (
          <g>
            <circle cx="-4" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
            <circle cx="-2" cy="-2" r="3.2" fill={INK} />
            <circle cx="19" cy="-2" r="6.5" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
            <circle cx="21" cy="-2" r="3.2" fill={INK} />
          </g>
        )}

        {/* Eyebrows & Mouth */}
        {mood === 'DIZZY' ? (
          <g>
            <line x1="-12" y1="-15" x2="2" y2="-11" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <line x1="27" y1="-15" x2="13" y2="-11" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <path d="M-4 17 Q3 11 10 17 Q17 23 24 17" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          </g>
        ) : mood === 'SURPRISED' ? (
          <g>
            <path d="M-11 -15 Q-4 -20 3 -15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <path d="M12 -15 Q19 -20 26 -15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="9" cy="18" rx="7" ry="9" fill="#fca5a5" stroke={INK} strokeWidth="3" />
          </g>
        ) : mood === 'NEUTRAL' ? (
          <line x1="1" y1="16" x2="17" y2="16" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        ) : (
          <path d="M-2 14 Q8 24 18 14" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        )}

        {/* Sweat drop */}
        {sweating ? (
          <path
            d="M-28 -18 C-34 -8 -34 2 -28 2 C-22 2 -22 -8 -28 -18 Z"
            fill="#38bdf8"
            stroke={INK}
            strokeWidth="2.5"
          />
        ) : null}
      </g>
    </g>
  );
};

/** Properly proportioned blue coach bus seat (consistent across EVERY bus interior scene) */
export const CoachBusSeat: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Seat leg */}
    <rect x="-12" y="18" width="24" height="78" rx="6" fill="#64748b" stroke={INK} strokeWidth="4.5" />
    {/* Seat cushion */}
    <rect x="-42" y="-12" width="120" height="34" rx="14" fill="#3b82f6" stroke={INK} strokeWidth="5" />
    {/* Seat backrest (proportional to stickman!) */}
    <rect x="-46" y="-138" width="38" height="154" rx="16" fill="#2563eb" stroke={INK} strokeWidth="5" />
    {/* Headrest accent */}
    <rect x="-42" y="-132" width="30" height="34" rx="10" fill="#60a5fa" />
    {/* Armrest */}
    <rect x="-10" y="-36" width="84" height="16" rx="8" fill="#1d4ed8" stroke={INK} strokeWidth="4" />
  </g>
);

/** Consistent sleek blue-and-white Coach Bus exterior */
export const CoachBusExterior: React.FC<{
  x: number;
  y: number;
  scale?: number;
  wheelAngle?: number;
  highlightMiddle?: boolean;
}> = ({ x, y, scale = 1, wheelAngle = 0, highlightMiddle = false }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Bus body */}
    <path
      d="M0 40 Q0 0 42 0 L680 0 Q720 0 720 42 L720 225 Q720 245 700 245 L24 245 Q0 245 0 220 Z"
      fill="#f8fafc"
      stroke={INK}
      strokeWidth="6"
    />
    {/* Lower blue stripe */}
    <path
      d="M4 165 L716 165 L716 225 Q716 241 700 241 L24 241 Q4 241 4 220 Z"
      fill="#2563eb"
    />
    <rect x="4" y="148" width="712" height="18" fill="#60a5fa" />

    {/* Windshield (right side = front of bus) */}
    <path d="M625 26 L706 26 Q712 26 712 44 L712 130 L625 130 Z" fill="#bae6fd" stroke={INK} strokeWidth="4.5" />
    {/* Passenger windows */}
    {[42, 185, 328, 471].map((wx, i) => (
      <rect
        key={i}
        x={wx}
        y="26"
        width="124"
        height="98"
        rx="14"
        fill={highlightMiddle && (i === 1 || i === 2) ? '#bbf7d0' : highlightMiddle && i === 0 ? '#fecaca' : '#bae6fd'}
        stroke={INK}
        strokeWidth="4.5"
      />
    ))}
    {/* Headlight */}
    <rect x="694" y="182" width="22" height="28" rx="6" fill="#fef08a" stroke={INK} strokeWidth="3.5" />

    {/* Wheels */}
    {[165, 555].map((cx, i) => (
      <g key={i} transform={`translate(${cx}, 248) rotate(${wheelAngle})`}>
        <circle cx="0" cy="0" r="46" fill="#1e293b" stroke={INK} strokeWidth="5" />
        <circle cx="0" cy="0" r="24" fill="#cbd5e1" stroke={INK} strokeWidth="4" />
        <line x1="-16" y1="0" x2="16" y2="0" stroke={INK} strokeWidth="4" />
        <line x1="0" y1="-16" x2="0" y2="16" stroke={INK} strokeWidth="4" />
      </g>
    ))}
  </g>
);

/** Clean modern 4-seat Sedan Car (Ô tô con) for b52 */
export const SedanCarExterior: React.FC<{
  x: number;
  y: number;
  scale?: number;
  wheelAngle?: number;
  highlightFrontSeat?: boolean;
}> = ({ x, y, scale = 1, wheelAngle = 0, highlightFrontSeat = false }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Car body */}
    <path
      d="M25 130 L85 118 L175 28 Q195 12 225 12 L430 12 Q465 12 490 34 L575 112 L645 124 Q672 130 672 162 L672 205 Q672 222 652 222 L28 222 Q8 222 8 202 L8 158 Q8 135 25 130 Z"
      fill="#38bdf8"
      stroke={INK}
      strokeWidth="6"
      strokeLinejoin="round"
    />
    {/* Rear passenger window */}
    <path
      d="M128 112 L192 38 Q204 28 224 28 L315 28 L315 112 Z"
      fill={highlightFrontSeat ? '#fee2e2' : '#e0f2fe'}
      stroke={INK}
      strokeWidth="4.5"
    />
    {/* Front passenger window */}
    <path
      d="M335 28 L428 28 Q452 28 468 44 L535 112 L335 112 Z"
      fill={highlightFrontSeat ? '#bbf7d0' : '#e0f2fe'}
      stroke={INK}
      strokeWidth="4.5"
    />
    {/* Headlight & taillight */}
    <rect x="642" y="142" width="24" height="24" rx="6" fill="#fef08a" stroke={INK} strokeWidth="3.5" />
    <rect x="12" y="144" width="18" height="24" rx="5" fill="#ef4444" stroke={INK} strokeWidth="3.5" />

    {/* Wheels */}
    {[160, 520].map((cx, i) => (
      <g key={i} transform={`translate(${cx}, 222) rotate(${wheelAngle})`}>
        <circle cx="0" cy="0" r="46" fill="#1e293b" stroke={INK} strokeWidth="5" />
        <circle cx="0" cy="0" r="24" fill="#cbd5e1" stroke={INK} strokeWidth="4" />
        <line x1="-16" y1="0" x2="16" y2="0" stroke={INK} strokeWidth="4" />
        <line x1="0" y1="-16" x2="0" y2="16" stroke={INK} strokeWidth="4" />
      </g>
    ))}
  </g>
);

/** Consistent Coach Bus interior wall + scrolling window scenery (Day or Sunset) */
export const BusCabinBackdrop: React.FC<{
  frame: number;
  sunset?: boolean;
  shakeY?: number;
  tiltDeg?: number;
  children?: React.ReactNode;
}> = ({ frame, sunset = false, shakeY = 0, tiltDeg = 0, children }) => {
  const scroll = (frame * 7) % 1920;
  const skyTop = sunset ? '#fb923c' : '#bae6fd';
  const skyBot = sunset ? '#fde68a' : '#e0f2fe';
  const hillColor = sunset ? '#ea580c' : '#4ade80';
  const treeColor = sunset ? '#c2410c' : '#22c55e';
  const wallColor = sunset ? '#fef3c7' : '#e2e8f0';

  return (
    <g transform={`translate(960, ${540 + shakeY}) rotate(${tiltDeg}) translate(-960, -540)`}>
      {/* Cabin upper wall */}
      <rect x="-80" y="-80" width="2080" height="1240" fill={wallColor} />

      {/* Panoramic bus window */}
      <defs>
        <clipPath id={sunset ? 'busWinSunset' : 'busWinDay'}>
          <rect x="90" y="145" width="1740" height="440" rx="34" />
        </clipPath>
        <linearGradient id={sunset ? 'skyGradSunset' : 'skyGradDay'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${sunset ? 'busWinSunset' : 'busWinDay'})`}>
        <rect x="90" y="145" width="1740" height="440" fill={`url(#${sunset ? 'skyGradSunset' : 'skyGradDay'})`} />
        {sunset ? <circle cx="960" cy="390" r="85" fill="#fde047" /> : null}

        {/* Rolling hills */}
        <path
          d={`M${-scroll} 585 Q${320 - scroll} 400 ${640 - scroll} 510 T${1280 - scroll} 490 T${1920 - scroll} 510 T${2560 - scroll} 490 T${3200 - scroll} 510 L3900 585 Z`}
          fill={hillColor}
          stroke={INK}
          strokeWidth="4"
        />
        {/* Scrolling trees */}
        {[220, 680, 1180, 1640, 2140, 2600, 3100, 3560].map((tx, idx) => (
          <g key={idx} transform={`translate(${tx - scroll}, 465)`}>
            <rect x="-10" y="32" width="20" height="75" fill="#92400e" stroke={INK} strokeWidth="3.5" />
            <circle cx="0" cy="10" r="46" fill={treeColor} stroke={INK} strokeWidth="4" />
          </g>
        ))}
      </g>

      {/* Window frame & vertical pillar */}
      <rect x="90" y="145" width="1740" height="440" rx="34" fill="none" stroke={INK} strokeWidth="7" />
      <rect x="945" y="145" width="30" height="440" fill="#cbd5e1" stroke={INK} strokeWidth="5" />

      {/* Cabin lower panel & floor */}
      <rect x="-80" y="585" width="2080" height="32" fill="#94a3b8" stroke={INK} strokeWidth="5" />
      <rect x="-80" y="795" width="2080" height="360" fill="#cbd5e1" stroke={INK} strokeWidth="5" />

      {children}
    </g>
  );
};
