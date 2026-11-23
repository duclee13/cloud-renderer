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

export type StickmanRole = 'BOY' | 'GRANDPA' | 'ANCIENT';
export type StickmanMood = 'HAPPY' | 'NEUTRAL' | 'DIZZY' | 'SURPRISED' | 'RELAXED';

/**
 * Consistent full-body Stickman matching StickmanRig.tsx:
 * - Wavy bangs + tiny cowlick for BOY (identical to main stage)
 * - Side gray hair tufts + round glasses for GRANDPA (identical to main stage)
 * - Natural bent elbows & knees when standing (never rigid straight sticks)
 * - Optional holdingBottle puts water bottle directly inside Grandpa's hand (never floating!)
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
  holdingBottle?: boolean;
  headphones?: boolean;
  sweating?: boolean;
  headTiltDeg?: number;
  bubble?: string;
}> = ({
  x,
  y,
  scale = 1,
  role = 'BOY',
  mood = 'HAPPY',
  facing = 'RIGHT',
  seated = false,
  holdingPhone = false,
  holdingBottle = false,
  headphones = false,
  sweating = false,
  headTiltDeg = 0,
  bubble,
}) => {
  const dir = facing === 'RIGHT' ? 1 : -1;
  const faceFill = mood === 'DIZZY' ? '#dcfce7' : '#ffffff';

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g transform={`scale(${scale * dir}, ${scale})`}>
        {/* Legs — ALWAYS complete with natural knee bends */}
        {seated ? (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L68 0 L76 92" />
            <path d="M-4 6 L54 8 L60 92" />
          </g>
        ) : (
          <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L-17 58 L-26 114" />
            <path d="M0 0 L19 58 L28 114" />
          </g>
        )}

        {/* Torso */}
        <line x1="0" y1="0" x2="0" y2="-104" stroke={INK} strokeWidth="7" strokeLinecap="round" />

        {/* Arms — natural elbow bends */}
        {holdingBottle ? (
          <g>
            {/* Back arm relaxed */}
            <path d="M0 -84 L-24 -50 L-16 -16" fill="none" stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Front arm extended holding water bottle */}
            <path d="M0 -84 L38 -58 L78 -62" fill="none" stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            <g transform="translate(86, -68) rotate(-8)">
              <rect x="-12" y="-24" width="24" height="48" rx="7" fill="#e0f2fe" stroke={INK} strokeWidth="3.5" />
              <rect x="-12" y="-6" width="24" height="20" fill="#38bdf8" />
              <rect x="-7" y="-33" width="14" height="10" rx="3" fill="#0284c7" stroke={INK} strokeWidth="3" />
            </g>
          </g>
        ) : holdingPhone ? (
          <g>
            <path d="M0 -84 L38 -40 L72 -48" fill="none" stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0 -84 L28 -32 L68 -44" fill="none" stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <path d="M0 -84 L-26 -50 L-18 -14" />
            <path d="M0 -84 L28 -52 L20 -14" />
          </g>
        )}

        {/* Head */}
        <g transform={`translate(0, -142) rotate(${headTiltDeg})`}>
          <circle cx="0" cy="0" r="38" fill={faceFill} stroke={INK} strokeWidth="5.5" />

          {/* Hair — 100% matched to StickmanRig.tsx */}
          {role === 'BOY' ? (
            <path
              d="M-36 -8 C-38 -36 -12 -46 0 -42 C8 -49 18 -44 20 -39 C34 -36 38 -22 36 -8 C26 -16 14 -14 4 -20 C-8 -12 -22 -16 -36 -8 Z"
              fill="#0f172a"
            />
          ) : role === 'GRANDPA' ? (
            <g>
              {/* Side gray hair tufts matching StickmanRig GRANDPA */}
              <path d="M-38 -12 C-48 -14 -48 6 -36 6 Z" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
              <path d="M38 -12 C48 -14 48 6 36 6 Z" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
              {/* Round glasses */}
              <circle cx="-4" cy="-2" r="10" fill="none" stroke={INK} strokeWidth="3" />
              <circle cx="19" cy="-2" r="10" fill="none" stroke={INK} strokeWidth="3" />
              <line x1="6" y1="-2" x2="9" y2="-2" stroke={INK} strokeWidth="3" />
              {/* Mustache */}
              <path d="M-2 13 Q8 9 18 13" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : (
            <path
              d="M-36 -8 C-38 -36 -10 -44 2 -40 C16 -46 36 -32 36 -8 C20 -18 -18 -18 -36 -8 Z"
              fill="#475569"
            />
          )}

          {/* Headphones */}
          {headphones ? (
            <g>
              <path d="M-40 -4 A40 40 0 0 1 40 -4" fill="none" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
              <rect x="-46" y="-12" width="12" height="24" rx="6" fill="#f59e0b" stroke={INK} strokeWidth="3" />
              <rect x="34" y="-12" width="12" height="24" rx="6" fill="#f59e0b" stroke={INK} strokeWidth="3" />
            </g>
          ) : null}

          {/* Eyes */}
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

          {/* Mouth & Eyebrows */}
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

      {/* Optional upright speech bubble */}
      {bubble ? <ShortSpeechBubble x={0} y={-228 * scale} text={bubble} /> : null}
    </g>
  );
};

/** Mini stickman passenger drawn neatly inside car/bus windows */
const MiniWindowPassenger: React.FC<{ x: number; y: number; dizzy?: boolean; driver?: boolean }> = ({
  x,
  y,
  dizzy = false,
  driver = false,
}) => (
  <g transform={`translate(${x}, ${y})`}>
    <line x1="0" y1="18" x2="0" y2="48" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
    {driver ? (
      <path d="M0 24 L20 28" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    ) : (
      <path d="M0 24 L14 34" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    )}
    <circle cx="0" cy="0" r="18" fill={dizzy ? '#dcfce7' : '#ffffff'} stroke={INK} strokeWidth="3.5" />
    {driver ? (
      <path d="M-17 -5 C-15 -22 15 -22 17 -5 L24 -5 L17 -2 Z" fill="#2563eb" stroke={INK} strokeWidth="2.5" />
    ) : (
      <path d="M-16 -4 C-14 -20 14 -20 16 -4 C6 -10 -6 -10 -16 -4 Z" fill="#0f172a" />
    )}
    <circle cx="-3" cy="0" r="2.2" fill={INK} />
    <circle cx="7" cy="0" r="2.2" fill={INK} />
    {dizzy ? (
      <path d="M-4 9 Q2 5 8 9" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    ) : (
      <path d="M-3 7 Q2 12 7 7" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    )}
  </g>
);

/** Properly proportioned blue coach bus seat (consistent across EVERY bus interior scene) */
export const CoachBusSeat: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x="-12" y="18" width="24" height="78" rx="6" fill="#64748b" stroke={INK} strokeWidth="4.5" />
    <rect x="-42" y="-12" width="120" height="34" rx="14" fill="#3b82f6" stroke={INK} strokeWidth="5" />
    <rect x="-46" y="-138" width="38" height="154" rx="16" fill="#2563eb" stroke={INK} strokeWidth="5" />
    <rect x="-42" y="-132" width="30" height="34" rx="10" fill="#60a5fa" />
    <rect x="-10" y="-36" width="84" height="16" rx="8" fill="#1d4ed8" stroke={INK} strokeWidth="4" />
  </g>
);

/** Consistent sleek blue-and-white Coach Bus exterior with optional stickmen inside */
export const CoachBusExterior: React.FC<{
  x: number;
  y: number;
  scale?: number;
  wheelAngle?: number;
  highlightMiddle?: boolean;
  showPassengers?: boolean;
}> = ({ x, y, scale = 1, wheelAngle = 0, highlightMiddle = false, showPassengers = false }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <path
      d="M0 40 Q0 0 42 0 L680 0 Q720 0 720 42 L720 225 Q720 245 700 245 L24 245 Q0 245 0 220 Z"
      fill="#f8fafc"
      stroke={INK}
      strokeWidth="6"
    />
    <path
      d="M4 165 L716 165 L716 225 Q716 241 700 241 L24 241 Q4 241 4 220 Z"
      fill="#2563eb"
    />
    <rect x="4" y="148" width="712" height="18" fill="#60a5fa" />

    {/* Windshield (right side = front) */}
    <path d="M625 26 L706 26 Q712 26 712 44 L712 130 L625 130 Z" fill="#bae6fd" stroke={INK} strokeWidth="4.5" />
    {showPassengers ? <MiniWindowPassenger x={658} y={76} driver={true} /> : null}

    {/* Passenger windows */}
    {[42, 185, 328, 471].map((wx, i) => (
      <g key={i}>
        <rect
          x={wx}
          y="26"
          width="124"
          height="98"
          rx="14"
          fill={highlightMiddle && (i === 1 || i === 2) ? '#bbf7d0' : highlightMiddle && i === 0 ? '#fecaca' : '#bae6fd'}
          stroke={INK}
          strokeWidth="4.5"
        />
        {showPassengers ? <MiniWindowPassenger x={wx + 62} y={76} dizzy={highlightMiddle && i === 0} /> : null}
      </g>
    ))}

    <rect x="694" y="182" width="22" height="28" rx="6" fill="#fef08a" stroke={INK} strokeWidth="3.5" />

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

/** Clean modern 4-seat Sedan Car (Ô tô con) with stickmen inside */
export const SedanCarExterior: React.FC<{
  x: number;
  y: number;
  scale?: number;
  wheelAngle?: number;
  highlightFrontSeat?: boolean;
  showPassengers?: boolean;
}> = ({ x, y, scale = 1, wheelAngle = 0, highlightFrontSeat = false, showPassengers = false }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
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
    {showPassengers ? <MiniWindowPassenger x={242} y={70} dizzy={highlightFrontSeat} /> : null}

    {/* Front passenger window */}
    <path
      d="M335 28 L428 28 Q452 28 468 44 L535 112 L335 112 Z"
      fill={highlightFrontSeat ? '#bbf7d0' : '#e0f2fe'}
      stroke={INK}
      strokeWidth="4.5"
    />
    {showPassengers ? <MiniWindowPassenger x={402} y={70} dizzy={false} /> : null}

    <rect x="642" y="142" width="24" height="24" rx="6" fill="#fef08a" stroke={INK} strokeWidth="3.5" />
    <rect x="12" y="144" width="18" height="24" rx="5" fill="#ef4444" stroke={INK} strokeWidth="3.5" />

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

/** Consistent Coach Bus interior wall + realistic ~55km/h scrolling window scenery */
export const BusCabinBackdrop: React.FC<{
  frame: number;
  sunset?: boolean;
  shakeY?: number;
  tiltDeg?: number;
  speed?: number;
  children?: React.ReactNode;
}> = ({ frame, sunset = false, shakeY = 0, tiltDeg = 0, speed = 2.6, children }) => {
  const scroll = (frame * speed) % 1920;
  const skyTop = sunset ? '#fb923c' : '#bae6fd';
  const skyBot = sunset ? '#fde68a' : '#e0f2fe';
  const hillColor = sunset ? '#ea580c' : '#4ade80';
  const treeColor = sunset ? '#c2410c' : '#22c55e';
  const wallColor = sunset ? '#fef3c7' : '#e2e8f0';

  return (
    <g transform={`translate(960, ${540 + shakeY}) rotate(${tiltDeg}) translate(-960, -540)`}>
      <rect x="-80" y="-80" width="2080" height="1240" fill={wallColor} />

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

        <path
          d={`M${-scroll} 585 Q${320 - scroll} 400 ${640 - scroll} 510 T${1280 - scroll} 490 T${1920 - scroll} 510 T${2560 - scroll} 490 T${3200 - scroll} 510 L3900 585 Z`}
          fill={hillColor}
          stroke={INK}
          strokeWidth="4"
        />
        {[220, 680, 1180, 1640, 2140, 2600, 3100, 3560].map((tx, idx) => (
          <g key={idx} transform={`translate(${tx - scroll}, 465)`}>
            <rect x="-10" y="32" width="20" height="75" fill="#92400e" stroke={INK} strokeWidth="3.5" />
            <circle cx="0" cy="10" r="46" fill={treeColor} stroke={INK} strokeWidth="4" />
          </g>
        ))}
      </g>

      <rect x="90" y="145" width="1740" height="440" rx="34" fill="none" stroke={INK} strokeWidth="7" />
      <rect x="945" y="145" width="30" height="440" fill="#cbd5e1" stroke={INK} strokeWidth="5" />

      <rect x="-80" y="585" width="2080" height="32" fill="#94a3b8" stroke={INK} strokeWidth="5" />
      <rect x="-80" y="795" width="2080" height="360" fill="#cbd5e1" stroke={INK} strokeWidth="5" />

      {children}
    </g>
  );
};
