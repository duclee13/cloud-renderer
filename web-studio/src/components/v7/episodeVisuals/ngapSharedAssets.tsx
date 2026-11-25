import React from 'react';
import { GroundShadow } from '../../SceneBackdropKit';

export const INK = '#0F172A';
export const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * clamp01(t);

export type NgapBackdropTone = 'SKY' | 'CREAM' | 'MINT' | 'CORAL' | 'LAVENDER';

const TONE_PALETTE: Record<
  NgapBackdropTone,
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
};

/** Clean top pill title at y=84 (above y=150..780 infographic safe zone) */
export const NgapCleanLabel: React.FC<{
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
  fontSize = 29,
}) => {
  const padX = 34;
  const estWidth = Math.max(240, text.length * fontSize * 0.56 + padX * 2);
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

/** 3-layer static bright studio backdrop + clean framed card (y=152..786, safe zone y <= 830, React.memo) */
export const NgapStageCardBackdrop: React.FC<{
  tone?: NgapBackdropTone;
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
NgapStageCardBackdrop.displayName = 'NgapStageCardBackdrop';

/** Clean 2D Cartoon Brain Emblem centered at (0,0) */
export const NgapBrainEmblem: React.FC<{
  x: number;
  y: number;
  scale?: number;
  fillColor?: string;
  glowColor?: string;
  glowOpacity?: number;
  highlightMirror?: boolean;
}> = ({
  x,
  y,
  scale = 1,
  fillColor = '#FBCFE8',
  glowColor,
  glowOpacity = 0,
  highlightMirror = false,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {glowColor && glowOpacity > 0 && (
      <circle cx="0" cy="-4" r="96" fill={glowColor} opacity={glowOpacity} />
    )}
    <path
      d="M -14 42 L -18 80 L 18 80 L 14 42 Z"
      fill="#F9A8D4"
      stroke={INK}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M -68 10 C -84 -16 -70 -60 -34 -68 C -16 -84 22 -84 40 -66 C 74 -58 84 -16 68 12 C 62 36 38 52 10 48 C -2 54 -22 54 -34 46 C -56 44 -68 28 -68 10 Z"
      fill={fillColor}
      stroke={INK}
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
    <g fill="none" stroke="#BE185D" strokeWidth="3.4" strokeLinecap="round" opacity="0.68">
      <path d="M -42 -26 C -26 -42 -4 -36 -2 -18" />
      <path d="M 4 -42 C 26 -48 44 -32 38 -12" />
      <path d="M -44 8 C -26 2 -14 14 -18 28" />
      <path d="M 8 10 C 26 4 44 14 40 30" />
      <path d="M -10 -12 C 4 -18 18 -8 12 6" />
    </g>
    {highlightMirror && (
      <g>
        <circle cx="-12" cy="-22" r="14" fill="#F97316" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="20" cy="-14" r="13" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="4" cy="10" r="12" fill="#EA580C" stroke="#FFFFFF" strokeWidth="3" />
      </g>
    )}
  </g>
);

/** Reusable minimalist 2D face icon (yawning, calm, happy, alert) */
export const NgapFaceBadge: React.FC<{
  x: number;
  y: number;
  r?: number;
  mode: 'yawn' | 'calm' | 'happy' | 'alert' | 'clamped';
  bg?: string;
  border?: string;
}> = ({ x, y, r = 46, mode, bg = '#FFF7ED', border = INK }) => {
  const s = r / 46;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <circle cx="0" cy="0" r="46" fill={bg} stroke={border} strokeWidth="4" />
      {mode === 'yawn' ? (
        <>
          <path d="M -22 -10 Q -14 -4 -6 -10" fill="none" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
          <path d="M 6 -10 Q 14 -4 22 -10" fill="none" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
          <ellipse cx="0" cy="14" rx="13" ry="17" fill="#9F1239" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="0" cy="23" rx="7.5" ry="4.5" fill="#FB7185" />
        </>
      ) : mode === 'clamped' ? (
        <>
          <line x1="-22" y1="-16" x2="-8" y2="-10" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
          <line x1="22" y1="-16" x2="8" y2="-10" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
          <circle cx="-14" cy="-4" r="4.5" fill={INK} />
          <circle cx="14" cy="-4" r="4.5" fill={INK} />
          <line x1="-18" y1="16" x2="18" y2="16" stroke="#DC2626" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="-12" y1="11" x2="-12" y2="21" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
          <line x1="0" y1="11" x2="0" y2="21" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="11" x2="12" y2="21" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : mode === 'alert' ? (
        <>
          <circle cx="-15" cy="-8" r="8.5" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
          <circle cx="-15" cy="-8" r="4" fill={INK} />
          <circle cx="15" cy="-8" r="8.5" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
          <circle cx="15" cy="-8" r="4" fill={INK} />
          <path d="M -12 16 Q 0 26 12 16" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : mode === 'happy' ? (
        <>
          <circle cx="-14" cy="-8" r="5" fill={INK} />
          <circle cx="14" cy="-8" r="5" fill={INK} />
          <path d="M -15 12 Q 0 26 15 12" fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="-14" cy="-8" r="4.8" fill={INK} />
          <circle cx="14" cy="-8" r="4.8" fill={INK} />
          <line x1="-11" y1="16" x2="11" y2="16" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </g>
  );
};

/** Cute reusable 2D Dog Emblem for SVG_11 & SVG_12 */
export const NgapDogEmblem: React.FC<{
  x: number;
  y: number;
  scale?: number;
  yawning?: boolean;
  tint?: string;
}> = ({ x, y, scale = 1, yawning = false, tint = '#FBBF24' }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} stroke={INK} strokeWidth="3.2" strokeLinejoin="round">
    <ellipse cx="-32" cy="-6" rx="14" ry="26" transform="rotate(14, -32, -6)" fill="#92400E" />
    <ellipse cx="32" cy="-6" rx="14" ry="26" transform="rotate(-14, 32, -6)" fill="#92400E" />
    <circle cx="0" cy="0" r="34" fill={tint} />
    <ellipse cx="0" cy="10" rx="22" ry="16" fill="#FEF3C7" stroke="none" />
    {yawning ? (
      <>
        <path d="M -17 -8 Q -11 -3 -5 -8" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M 5 -8 Q 11 -3 17 -8" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
        <ellipse cx="0" cy="2" rx="7" ry="5" fill={INK} />
        <ellipse cx="0" cy="18" rx="11" ry="12" fill="#9F1239" stroke={INK} strokeWidth="2.8" />
        <ellipse cx="0" cy="24" rx="7" ry="4.5" fill="#FB7185" stroke="none" />
      </>
    ) : (
      <>
        <circle cx="-12" cy="-8" r="4.2" fill={INK} />
        <circle cx="12" cy="-8" r="4.2" fill={INK} />
        <ellipse cx="0" cy="2" rx="7" ry="5" fill={INK} />
        <path d="M -10 14 Q 0 21 10 14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </>
    )}
  </g>
);
