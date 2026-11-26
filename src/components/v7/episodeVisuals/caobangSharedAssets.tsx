import React from 'react';
import { GroundShadow } from '../../SceneBackdropKit';

export const INK = '#0F172A';
export const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * clamp01(t);

export type CaobangBackdropTone = 'SKY' | 'CREAM' | 'MINT' | 'CORAL' | 'LAVENDER' | 'ROSE';

const TONE_PALETTE: Record<
  CaobangBackdropTone,
  {
    bgTop: string;
    bgBot: string;
    dot: string;
    floor: string;
    floorEdge: string;
    cardBorder: string;
  }
> = {
  SKY: {
    bgTop: '#F0F9FF',
    bgBot: '#E0F2FE',
    dot: '#38BDF8',
    floor: '#BAE6FD',
    floorEdge: '#0284C7',
    cardBorder: '#0284C7',
  },
  CREAM: {
    bgTop: '#FFFBEB',
    bgBot: '#FEF3C7',
    dot: '#F59E0B',
    floor: '#FDE68A',
    floorEdge: '#D97706',
    cardBorder: '#D97706',
  },
  MINT: {
    bgTop: '#ECFDF5',
    bgBot: '#D1FAE5',
    dot: '#10B981',
    floor: '#A7F3D0',
    floorEdge: '#059669',
    cardBorder: '#059669',
  },
  CORAL: {
    bgTop: '#FFF7ED',
    bgBot: '#FFEDD5',
    dot: '#FB923C',
    floor: '#FED7AA',
    floorEdge: '#EA580C',
    cardBorder: '#EA580C',
  },
  LAVENDER: {
    bgTop: '#F5F3FF',
    bgBot: '#EDE9FE',
    dot: '#8B5CF6',
    floor: '#DDD6FE',
    floorEdge: '#7C3AED',
    cardBorder: '#7C3AED',
  },
  ROSE: {
    bgTop: '#FEF2F2',
    bgBot: '#FEE2E2',
    dot: '#F87171',
    floor: '#FECACA',
    floorEdge: '#DC2626',
    cardBorder: '#DC2626',
  },
};

/** Clean top pill title at y=84 (above y=152..786 infographic safe zone) */
export const CaobangCleanLabel: React.FC<{
  x: number;
  y: number;
  text: string;
  bg?: string;
  color?: string;
  border?: string;
  fontSize?: number;
}> = ({
  x,
  y,
  text,
  bg = '#FFFFFF',
  color = '#0F172A',
  border = '#CBD5E1',
  fontSize = 28,
}) => {
  const padX = 34;
  const estWidth = Math.min(1760, Math.max(260, text.length * fontSize * 0.56 + padX * 2));
  const h = fontSize + 28;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-estWidth / 2}
        y={-h / 2 + 4}
        width={estWidth}
        height={h}
        rx={h / 2}
        fill="#0F172A"
        opacity="0.09"
      />
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
        y={fontSize * 0.34}
        textAnchor="middle"
        fill={color}
        stroke="none"
        fontSize={fontSize}
        fontWeight="800"
        fontFamily={FONT}
      >
        {text}
      </text>
    </g>
  );
};

/** High-contrast badge pill (strictly enforces readable color pairs — never dark text on solid red!) */
export const CaobangContrastBadge: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  text: string;
  variant: 'solidRed' | 'softRed' | 'solidGreen' | 'softGreen' | 'solidBlue' | 'softAmber';
  fontSize?: number;
}> = ({ x, y, w, h = 48, text, variant, fontSize = 21 }) => {
  const styles: Record<
    typeof variant,
    { fill: string; stroke: string; textColor: string }
  > = {
    solidRed: { fill: '#DC2626', stroke: '#991B1B', textColor: '#FFFFFF' },
    softRed: { fill: '#FEE2E2', stroke: '#DC2626', textColor: '#991B1B' },
    solidGreen: { fill: '#059669', stroke: '#065F46', textColor: '#FFFFFF' },
    softGreen: { fill: '#ECFDF5', stroke: '#059669', textColor: '#065F46' },
    solidBlue: { fill: '#0284C7', stroke: '#0369A1', textColor: '#FFFFFF' },
    softAmber: { fill: '#FEF3C7', stroke: '#D97706', textColor: '#92400E' },
  };
  const s = styles[variant];
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth="3.2"
      />
      <text
        x="0"
        y={fontSize * 0.34}
        textAnchor="middle"
        fill={s.textColor}
        stroke="none"
        fontSize={fontSize}
        fontWeight="900"
        fontFamily={FONT}
      >
        {text}
      </text>
    </g>
  );
};

/** 3-layer static bright studio backdrop + clean framed card (y=152..786, inner y=172..766, safe zone y <= 830, React.memo) */
export const CaobangStageCardBackdrop: React.FC<{
  tone?: CaobangBackdropTone;
  gradId: string;
  showMainCard?: boolean;
  cardBorder?: string;
}> = React.memo(({ tone = 'SKY', gradId, showMainCard = true, cardBorder }) => {
  const pal = TONE_PALETTE[tone];
  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.bgTop} />
          <stop offset="100%" stopColor={pal.bgBot} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1920" height="1080" fill={`url(#${gradId})`} />

      <g fill={pal.dot} opacity="0.14">
        <circle cx="96" cy="110" r="34" />
        <circle cx="152" cy="166" r="14" />
        <circle cx="1828" cy="120" r="38" />
        <circle cx="1768" cy="176" r="15" />
      </g>

      {/* Grounded subtitle floor band */}
      <rect x="0" y="810" width="1920" height="270" fill={pal.floor} opacity="0.52" />
      <line x1="0" y1="810" x2="1920" y2="810" stroke={pal.floorEdge} strokeWidth="3.5" opacity="0.45" />

      {showMainCard && (
        <g>
          <GroundShadow cx={960} cy={804} rx={790} ry={14} />
          <rect
            x="140"
            y="152"
            width="1640"
            height="634"
            rx="34"
            fill="#FFFFFF"
            stroke={cardBorder ?? pal.cardBorder}
            strokeWidth="4.5"
          />
          <rect
            x="160"
            y="172"
            width="1600"
            height="594"
            rx="24"
            fill={pal.bgTop}
            opacity="0.38"
          />
        </g>
      )}
    </g>
  );
});
CaobangStageCardBackdrop.displayName = 'CaobangStageCardBackdrop';

/** Deterministic jagged sawtooth acoustic waveform path generator */
export function buildSawtoothWavePath(
  xStart: number,
  xEnd: number,
  centerY: number,
  amp: number,
  cycles: number,
  phase = 0,
  roughMod = 0.25
): string {
  const pts: string[] = [];
  const totalSteps = Math.max(8, cycles * 4);
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    const x = xStart + (xEnd - xStart) * t;
    const mod = 1 - roughMod + roughMod * Math.abs(Math.sin(t * Math.PI * 5 + phase));
    const saw = i % 2 === 0 ? (i % 4 === 0 ? -1 : 1) : 0;
    const y = centerY + saw * amp * mod;
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Clean 2D Cartoon Brain Emblem centered at (0,0) */
export const CaobangBrainEmblem: React.FC<{
  x: number;
  y: number;
  scale?: number;
  fillColor?: string;
  glowColor?: string;
  glowOpacity?: number;
}> = ({ x, y, scale = 1, fillColor = '#FBCFE8', glowColor, glowOpacity = 0 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {glowColor && glowOpacity > 0 && (
      <circle cx="0" cy="-4" r="102" fill={glowColor} opacity={glowOpacity} />
    )}
    <path
      d="M -16 44 L -20 84 L 20 84 L 16 44 Z"
      fill="#F9A8D4"
      stroke={INK}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M -72 12 C -88 -18 -74 -64 -36 -72 C -16 -90 24 -90 42 -70 C 78 -62 90 -18 72 14 C 66 38 40 54 10 50 C -2 56 -24 56 -36 48 C -60 46 -72 30 -72 12 Z"
      fill={fillColor}
      stroke={INK}
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
    <g fill="none" stroke="#BE185D" strokeWidth="3.4" strokeLinecap="round" opacity="0.58">
      <path d="M -44 -28 C -28 -44 -4 -38 -2 -18" />
      <path d="M 4 -44 C 28 -50 46 -34 40 -12" />
      <path d="M -46 8 C -28 2 -14 14 -18 28" />
      <path d="M 8 10 C 28 4 46 14 42 30" />
    </g>
  </g>
);

/** Reusable minimalist 2D face badge for cringe / calm / happy / bliss reactions */
export const CaobangFaceEmblem: React.FC<{
  x: number;
  y: number;
  r?: number;
  mode: 'cringe' | 'calm' | 'happy' | 'bliss' | 'confused';
  bg?: string;
  border?: string;
}> = ({ x, y, r = 46, mode, bg = '#FFF7ED', border = INK }) => {
  const s = r / 46;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <circle cx="0" cy="0" r="46" fill={bg} stroke={border} strokeWidth="4" />
      {mode === 'cringe' ? (
        <>
          {/* Tightly squeezed > < eyes */}
          <path d="M -22 -14 L -8 -7 L -22 0" fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 22 -14 L 8 -7 L 22 0" fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Gritted zigzag cringe mouth */}
          <path d="M -20 16 L -12 10 L -4 18 L 4 10 L 12 18 L 20 12" fill="none" stroke="#DC2626" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : mode === 'bliss' ? (
        <>
          <path d="M -22 -8 Q -14 -18 -6 -8" fill="none" stroke="#065F46" strokeWidth="4" strokeLinecap="round" />
          <path d="M 6 -8 Q 14 -18 22 -8" fill="none" stroke="#065F46" strokeWidth="4" strokeLinecap="round" />
          <path d="M -16 10 Q 0 26 16 10" fill="none" stroke="#059669" strokeWidth="4.4" strokeLinecap="round" />
          <circle cx="-24" cy="6" r="5" fill="#FCA5A5" opacity="0.65" />
          <circle cx="24" cy="6" r="5" fill="#FCA5A5" opacity="0.65" />
        </>
      ) : mode === 'confused' ? (
        <>
          <circle cx="-14" cy="-8" r="5.5" fill={INK} />
          <circle cx="14" cy="-8" r="5.5" fill={INK} />
          <line x1="-22" y1="-20" x2="-8" y2="-16" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
          <line x1="22" y1="-16" x2="8" y2="-22" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
          <path d="M -14 16 Q -5 10 0 16 Q 5 22 14 14" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : mode === 'happy' ? (
        <>
          <circle cx="-14" cy="-8" r="5" fill={INK} />
          <circle cx="14" cy="-8" r="5" fill={INK} />
          <path d="M -15 11 Q 0 25 15 11" fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="-14" cy="-8" r="4.8" fill={INK} />
          <circle cx="14" cy="-8" r="4.8" fill={INK} />
          <line x1="-12" y1="15" x2="12" y2="15" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </g>
  );
};
