import React from 'react';
import { GroundShadow } from '../../SceneBackdropKit';

export const INK = '#0F172A';
export const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * clamp01(t);

/** Smooth RGB hex color blend (pure deterministic JS, 0 external deps) */
export function mixHexColor(hexA: string, hexB: string, tRaw: number): string {
  const t = clamp01(tRaw);
  const parse = (h: string): [number, number, number] => {
    const clean = h.replace('#', '');
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export type OctoBackdropTone = 'OCEAN' | 'CREAM' | 'MINT' | 'CORAL' | 'FOREST' | 'ROSE' | 'SLATE';

const TONE_PALETTE: Record<
  OctoBackdropTone,
  {
    bgTop: string;
    bgBot: string;
    dot: string;
    floor: string;
    floorEdge: string;
    cardBorder: string;
  }
> = {
  OCEAN: {
    bgTop: '#F0F9FF',
    bgBot: '#E0F2FE',
    dot: '#0284C7',
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
    dot: '#0D9488',
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
  FOREST: {
    bgTop: '#F0FDF4',
    bgBot: '#DCFCE7',
    dot: '#22C55E',
    floor: '#BBF7D0',
    floorEdge: '#15803D',
    cardBorder: '#15803D',
  },
  ROSE: {
    bgTop: '#FEF2F2',
    bgBot: '#FEE2E2',
    dot: '#F87171',
    floor: '#FECACA',
    floorEdge: '#DC2626',
    cardBorder: '#DC2626',
  },
  SLATE: {
    bgTop: '#F8FAFC',
    bgBot: '#E2E8F0',
    dot: '#64748B',
    floor: '#CBD5E1',
    floorEdge: '#475569',
    cardBorder: '#334155',
  },
};

/** Clean top pill title at y=84 (above y=152..786 safe infographic card) */
export const OctoCleanLabel: React.FC<{
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
  border = '#0284C7',
  fontSize = 28,
}) => {
  const padX = 36;
  const estWidth = Math.min(1760, Math.max(280, text.length * fontSize * 0.56 + padX * 2));
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

/** High-contrast badge pill (strictly readable color pairs — red alert uses #DC2626 + #FFFFFF) */
export const OctoContrastBadge: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  text: string;
  variant: 'solidRed' | 'softRed' | 'solidGreen' | 'softGreen' | 'solidBlue' | 'softBlue' | 'softAmber' | 'solidTeal';
  fontSize?: number;
}> = ({ x, y, w, h = 48, text, variant, fontSize = 21 }) => {
  const styles: Record<typeof variant, { fill: string; stroke: string; textColor: string }> = {
    solidRed: { fill: '#DC2626', stroke: '#991B1B', textColor: '#FFFFFF' },
    softRed: { fill: '#FEE2E2', stroke: '#DC2626', textColor: '#991B1B' },
    solidGreen: { fill: '#15803D', stroke: '#14532D', textColor: '#FFFFFF' },
    softGreen: { fill: '#ECFDF5', stroke: '#15803D', textColor: '#14532D' },
    solidBlue: { fill: '#0284C7', stroke: '#0369A1', textColor: '#FFFFFF' },
    softBlue: { fill: '#EFF6FF', stroke: '#0284C7', textColor: '#0369A1' },
    softAmber: { fill: '#FEF3C7', stroke: '#D97706', textColor: '#92400E' },
    solidTeal: { fill: '#0D9488', stroke: '#0F766E', textColor: '#FFFFFF' },
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

/** 3-layer static bright studio backdrop + clean framed card (y=152..786, safe zone y <= 830, React.memo, <pattern> dots) */
export const OctoStageCardBackdrop: React.FC<{
  tone?: OctoBackdropTone;
  gradId: string;
  showMainCard?: boolean;
  cardBorder?: string;
  cardFill?: string;
}> = React.memo(({ tone = 'OCEAN', gradId, showMainCard = true, cardBorder, cardFill = '#FFFFFF' }) => {
  const pal = TONE_PALETTE[tone];
  const dotPatId = `${gradId}_dots_pat`;
  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.bgTop} />
          <stop offset="100%" stopColor={pal.bgBot} />
        </linearGradient>
        <pattern id={dotPatId} x="20" y="20" width="200" height="180" patternUnits="userSpaceOnUse">
          <circle cx="100" cy="90" r="7" fill={pal.dot} opacity="0.14" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="1920" height="1080" fill={`url(#${gradId})`} />
      <rect x="20" y="20" width="1800" height="720" fill={`url(#${dotPatId})`} />

      {/* Clean floor band below card for subtitle area y=825..1080 */}
      <rect x="0" y="825" width="1920" height="255" fill={pal.floor} opacity="0.62" />
      <line x1="0" y1="825" x2="1920" y2="825" stroke={pal.floorEdge} strokeWidth="3.5" opacity="0.38" />

      {showMainCard && (
        <g>
          <GroundShadow cx={960} cy={796} rx={790} ry={16} />
          <rect
            x="115"
            y="152"
            width="1690"
            height="634"
            rx="34"
            fill={cardFill}
            stroke={cardBorder ?? pal.cardBorder}
            strokeWidth="5"
          />
        </g>
      )}
    </g>
  );
});
OctoStageCardBackdrop.displayName = 'OctoStageCardBackdrop';

/** Clean inline green checkmark circle */
export const OctoCheckCircle: React.FC<{ cx: number; cy: number; r?: number; bg?: string }> = ({
  cx,
  cy,
  r = 18,
  bg = '#16A34A',
}) => (
  <g transform={`translate(${cx}, ${cy})`}>
    <circle cx={0} cy={0} r={r} fill={bg} stroke="#FFFFFF" strokeWidth={2.5} />
    <path
      d={`M ${(-r * 0.42).toFixed(1)},0 L ${(-r * 0.1).toFixed(1)},${(r * 0.34).toFixed(1)} L ${(r * 0.46).toFixed(1)},${(-r * 0.36).toFixed(1)}`}
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={Math.max(3, r * 0.22)}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);
