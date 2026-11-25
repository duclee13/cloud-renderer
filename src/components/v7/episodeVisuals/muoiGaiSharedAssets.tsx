import React from 'react';
import { GroundShadow } from '../../SceneBackdropKit';

export const INK = '#0F172A';
export const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * clamp01(t);

export type MuoiBackdropTone = 'CREAM' | 'SKY' | 'MINT' | 'ROSE' | 'TEAL';

const TONE_PALETTE: Record<
  MuoiBackdropTone,
  {
    bgTop: string;
    bgBot: string;
    dot: string;
    floor: string;
    floorEdge: string;
    cardBorder: string;
  }
> = {
  CREAM: {
    bgTop: '#FFFBEB',
    bgBot: '#FEF3C7',
    dot: '#F59E0B',
    floor: '#FDE68A',
    floorEdge: '#F59E0B',
    cardBorder: '#F59E0B',
  },
  SKY: {
    bgTop: '#F0F9FF',
    bgBot: '#E0F2FE',
    dot: '#38BDF8',
    floor: '#BAE6FD',
    floorEdge: '#0284C7',
    cardBorder: '#0284C7',
  },
  MINT: {
    bgTop: '#ECFDF5',
    bgBot: '#D1FAE5',
    dot: '#10B981',
    floor: '#A7F3D0',
    floorEdge: '#059669',
    cardBorder: '#10B981',
  },
  ROSE: {
    bgTop: '#FFF1F2',
    bgBot: '#FFE4E6',
    dot: '#FB7185',
    floor: '#FECDD3',
    floorEdge: '#E11D48',
    cardBorder: '#EF4444',
  },
  TEAL: {
    bgTop: '#F0FDFA',
    bgBot: '#CCFBF1',
    dot: '#14B8A6',
    floor: '#99F6E4',
    floorEdge: '#0D9488',
    cardBorder: '#0D9488',
  },
};

/** Clean top title pill positioned cleanly at y = 84 (above diagram zone y=150..780) */
export const MuoiCleanLabel: React.FC<{
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
  const estWidth = Math.max(220, text.length * fontSize * 0.56 + padX * 2);
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
        fontSize={fontSize}
        fontWeight="800"
        fontFamily={FONT}
      >
        {text}
      </text>
    </g>
  );
};

/** Layered static studio backdrop + optional clean framed stage card (y=152..786, safe zone y <= 830, wrapped in React.memo) */
export const MuoiStageCardBackdrop: React.FC<{
  tone?: MuoiBackdropTone;
  gradId: string;
  showMainCard?: boolean;
  cardBorder?: string;
}> = React.memo(({ tone = 'CREAM', gradId, showMainCard = true, cardBorder }) => {
  const pal = TONE_PALETTE[tone];
  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.bgTop} />
          <stop offset="100%" stopColor={pal.bgBot} />
        </linearGradient>
      </defs>

      {/* Layer 1: Warm clean full-screen canvas */}
      <rect x="0" y="0" width="1920" height="1080" fill={`url(#${gradId})`} />

      {/* Subtle atmospheric geometric dots in upper/outer corners */}
      <g fill={pal.dot} opacity="0.14">
        <circle cx="96" cy="110" r="34" />
        <circle cx="152" cy="166" r="14" />
        <circle cx="1828" cy="120" r="38" />
        <circle cx="1768" cy="176" r="15" />
      </g>

      {/* Calm grounded lower band (y=808..1080) keeping subtitle area crisp & readable */}
      <rect x="0" y="810" width="1920" height="270" fill={pal.floor} opacity="0.52" />
      <line x1="0" y1="810" x2="1920" y2="810" stroke={pal.floorEdge} strokeWidth="3.5" opacity="0.45" />

      {/* Layer 2: Framed foreground whiteboard/infographic card (y=152..784) so visuals never float in empty space */}
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
MuoiStageCardBackdrop.displayName = 'MuoiStageCardBackdrop';

/** Crisp 2D Mosquito Vector (facing RIGHT by default, centered at thorax) */
export const MuoiMosquito2D: React.FC<{
  x: number;
  y: number;
  scale?: number;
  angleDeg?: number;
  frame?: number;
}> = ({ x, y, scale = 1, angleDeg = 0, frame = 0 }) => {
  const wingFlap = Math.sin(frame * 1.1) * 18;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angleDeg}) scale(${scale})`}>
      {/* Fluttering translucent wings */}
      <ellipse
        cx="-10"
        cy="-24"
        rx="32"
        ry="11"
        transform={`rotate(${(-28 + wingFlap).toFixed(1)}, -10, -24)`}
        fill="#E0F2FE"
        fillOpacity="0.82"
        stroke="#475569"
        strokeWidth="2.8"
      />
      <ellipse
        cx="6"
        cy="-22"
        rx="28"
        ry="10"
        transform={`rotate(${(18 - wingFlap).toFixed(1)}, 6, -22)`}
        fill="#BAE6FD"
        fillOpacity="0.72"
        stroke="#475569"
        strokeWidth="2.6"
      />
      {/* Long slender jointed legs */}
      <g fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M -18 8 L -38 28 L -52 54" />
        <path d="M -2 10 L -6 34 L -18 58" />
        <path d="M 14 8 L 28 32 L 42 54" />
      </g>
      {/* Striped Abdomen */}
      <ellipse cx="-26" cy="4" rx="28" ry="11" transform="rotate(-14, -26, 4)" fill="#475569" stroke={INK} strokeWidth="3.2" />
      <line x1="-38" y1="-2" x2="-34" y2="12" stroke="#E2E8F0" strokeWidth="3" />
      <line x1="-26" y1="-4" x2="-22" y2="11" stroke="#E2E8F0" strokeWidth="3" />
      <line x1="-14" y1="-5" x2="-10" y2="9" stroke="#E2E8F0" strokeWidth="3" />
      {/* Thorax & Head */}
      <ellipse cx="6" cy="-4" rx="14" ry="12" fill="#334155" stroke={INK} strokeWidth="3.2" />
      <circle cx="24" cy="-2" r="9.5" fill="#1E293B" stroke={INK} strokeWidth="3" />
      <circle cx="27" cy="-4" r="3" fill="#EF4444" />
      {/* Proboscis needle */}
      <line x1="32" y1="2" x2="72" y2="34" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
      <line x1="32" y1="2" x2="72" y2="34" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
};

/** Clean 2D Cartoon Brain Emblem centered at (0, 0) */
export const MuoiBrainEmblem: React.FC<{
  x: number;
  y: number;
  scale?: number;
  glowColor?: string;
  glowOpacity?: number;
}> = ({ x, y, scale = 1, glowColor, glowOpacity = 0 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {glowColor && glowOpacity > 0 && (
      <circle cx="0" cy="-4" r="96" fill={glowColor} opacity={glowOpacity} />
    )}
    {/* Brainstem */}
    <path
      d="M -14 42 L -18 82 L 18 82 L 14 42 Z"
      fill="#F9A8D4"
      stroke={INK}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    {/* Main Cortex */}
    <path
      d="M -68 10 C -84 -16 -70 -60 -34 -68 C -16 -84 22 -84 40 -66 C 74 -58 84 -16 68 12 C 62 36 38 52 10 48 C -2 54 -22 54 -34 46 C -56 44 -68 28 -68 10 Z"
      fill="#FBCFE8"
      stroke={INK}
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
    {/* Cortical folds */}
    <g fill="none" stroke="#BE185D" strokeWidth="3.6" strokeLinecap="round" opacity="0.72">
      <path d="M -42 -26 C -26 -42 -4 -36 -2 -18" />
      <path d="M 4 -42 C 26 -48 44 -32 38 -12" />
      <path d="M -44 8 C -26 2 -14 14 -18 28" />
      <path d="M 8 10 C 26 4 44 14 40 30" />
      <path d="M -10 -12 C 4 -18 18 -8 12 6" />
    </g>
  </g>
);

/** Reusable Clean Anatomical Skin Cross-Section (x=220..1700, y=280..740) */
export const MuoiSkinLayers: React.FC<{
  bumpHeight?: number; // 0..95
  bumpRedness?: number; // 0..1
  capillaryDilation?: number; // 0..1 (0 = normal 34px, 1 = swollen 66px)
  tornCrack?: boolean;
}> = ({ bumpHeight = 36, bumpRedness = 0.65, capillaryDilation = 0.35, tornCrack = false }) => {
  const surfaceY = 395;
  const peakY = surfaceY - bumpHeight;
  const capRadius = 17 + capillaryDilation * 17;
  const capCenterY = 635;

  return (
    <g>
      {/* Subcutaneous / Deep Dermis Layer */}
      <rect x="220" y="540" width="1480" height="190" rx="18" fill="#FEF3C7" stroke={INK} strokeWidth="3.5" />
      {/* Dermis Pink Layer */}
      <path
        d={`M 220 ${surfaceY + 46} Q 720 ${surfaceY + 46} 835 ${peakY + 44} Q 960 ${peakY + 24} 1085 ${peakY + 44} Q 1200 ${surfaceY + 46} 1700 ${surfaceY + 46} L 1700 570 L 220 570 Z`}
        fill="#FFE4E6"
        stroke={INK}
        strokeWidth="3.5"
      />
      {/* Epidermis Top Barrier Layer */}
      <path
        d={`M 220 ${surfaceY} Q 720 ${surfaceY} 835 ${peakY + 18} Q 960 ${peakY - 10} 1085 ${peakY + 18} Q 1200 ${surfaceY} 1700 ${surfaceY} L 1700 ${surfaceY + 46} Q 1200 ${surfaceY + 46} 1085 ${peakY + 48} Q 960 ${peakY + 26} 835 ${peakY + 48} Q 720 ${surfaceY + 46} 220 ${surfaceY + 46} Z`}
        fill="#FED7AA"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Red Swelling Blush on Bump */}
      {bumpRedness > 0.02 && (
        <ellipse
          cx="960"
          cy={peakY + 28}
          rx={105 + bumpHeight * 0.9}
          ry={26 + bumpHeight * 0.38}
          fill="#EF4444"
          opacity={bumpRedness * 0.55}
        />
      )}
      {/* Optional Scratch Tear Crack through Epidermis */}
      {tornCrack && (
        <path
          d={`M 915 ${peakY + 4} L 938 ${peakY + 58} L 966 ${peakY + 72} L 992 ${peakY + 52} L 1012 ${peakY + 6} Z`}
          fill="#991B1B"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      )}

      {/* Horizontal Capillary Blood Vessel */}
      <rect
        x="220"
        y={capCenterY - capRadius}
        width="1480"
        height={capRadius * 2}
        rx={capRadius * 0.45}
        fill="#EF4444"
        stroke="#991B1B"
        strokeWidth="4"
      />
      <line
        x1="248"
        y1={capCenterY - capRadius * 0.42}
        x2="1672"
        y2={capCenterY - capRadius * 0.42}
        stroke="#FCA5A5"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Clean Left Anatomical Layer Labels */}
      <text x="246" y={surfaceY + 30} fill="#9A3412" fontSize="21" fontWeight="800" fontFamily={FONT}>
        Biểu bì
      </text>
      <text x="246" y="510" fill="#9F1239" fontSize="21" fontWeight="800" fontFamily={FONT}>
        Hạ bì
      </text>
      <text x="246" y={capCenterY + 7} fill="#FFFFFF" fontSize="20" fontWeight="800" fontFamily={FONT}>
        Mao mạch
      </text>
    </g>
  );
};
