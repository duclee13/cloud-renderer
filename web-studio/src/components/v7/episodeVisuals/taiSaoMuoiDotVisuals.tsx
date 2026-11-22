import React from 'react';
import type { EpisodeVisualProps } from './index';

// ============================================================================
// Shared Constants & Pure Math Helpers (Zero External Dependencies)
// ============================================================================

const INK = '#1e293b';
const FONT = "'Fredoka', 'Nunito', 'Quicksand', system-ui, -apple-system, sans-serif";

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const easeOutCubic = (t: number): number => {
  const c = clamp01(t);
  return 1 - (1 - c) * (1 - c) * (1 - c);
};

const easeOutBack = (t: number): number => {
  const c = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
};

const subProgress = (progress: number, start: number, end: number): number =>
  end <= start ? 1 : clamp01((progress - start) / (end - start));

// ============================================================================
// Shared CardFrame (2D Kass Blox Style: 5px #1e293b Outlines, Bright Flat Fill)
// ============================================================================

interface CardFrameProps {
  title: string;
  badge: string;
  badgeBg?: string;
  badgeText?: string;
  bg?: string;
  headerBg?: string;
  dark?: boolean;
  children: React.ReactNode;
}

const CardFrame: React.FC<CardFrameProps> = ({
  title,
  badge,
  badgeBg = '#38bdf8',
  badgeText = '#ffffff',
  bg = '#f8fafc',
  headerBg = '#ffffff',
  dark = false,
  children,
}) => {
  const borderCol = dark ? '#334155' : INK;
  const titleCol = dark ? '#f8fafc' : INK;
  const shadowCol = dark ? '#020617' : '#cbd5e1';

  return (
    <svg
      viewBox="0 0 1120 680"
      width="1120"
      height="680"
      style={{ display: 'block' }}
    >
      {/* Outer solid backdrop */}
      <rect x={0} y={0} width={1120} height={680} fill={dark ? '#020617' : '#e2e8f0'} />

      {/* Offset Kass Blox hard shadow */}
      <rect x={34} y={30} width={1064} height={632} rx={32} fill={shadowCol} />

      {/* Main Card Body */}
      <rect
        x={24}
        y={20}
        width={1064}
        height={632}
        rx={32}
        fill={bg}
        stroke={borderCol}
        strokeWidth={5}
      />

      {/* Header Bar */}
      <path
        d="M 24 52 Q 24 20 56 20 L 1056 20 Q 1088 20 1088 52 L 1088 104 L 24 104 Z"
        fill={headerBg}
        stroke={borderCol}
        strokeWidth={5}
        strokeLinejoin="round"
      />

      {/* Header Accent Dots */}
      <circle cx={60} cy={62} r={9} fill="#ef4444" stroke={INK} strokeWidth={3} />
      <circle cx={88} cy={62} r={9} fill="#facc15" stroke={INK} strokeWidth={3} />
      <circle cx={116} cy={62} r={9} fill="#22c55e" stroke={INK} strokeWidth={3} />

      {/* Card Title */}
      <text
        x={146}
        y={71}
        fill={titleCol}
        fontSize={27}
        fontWeight={800}
        fontFamily={FONT}
      >
        {title}
      </text>

      {/* Top-Right Badge */}
      <rect
        x={838}
        y={39}
        width={224}
        height={46}
        rx={23}
        fill={badgeBg}
        stroke={INK}
        strokeWidth={4}
      />
      <text
        x={950}
        y={69}
        textAnchor="middle"
        fill={badgeText}
        fontSize={19}
        fontWeight={800}
        fontFamily={FONT}
      >
        {badge}
      </text>

      {/* Scene Content */}
      {children}
    </svg>
  );
};

// ============================================================================
// Shared Animated 2D Kass Blox Mosquito Sprite
// ============================================================================

interface CartoonMosquitoProps {
  x: number;
  y: number;
  t: number;
  scale?: number;
  flipX?: boolean;
  rotation?: number;
  phase?: number;
  bloodFill?: number;
  isMale?: boolean;
  bodyColor?: string;
}

const CartoonMosquito: React.FC<CartoonMosquitoProps> = ({
  x,
  y,
  t,
  scale = 1,
  flipX = false,
  rotation = 0,
  phase = 0,
  bloodFill = 0,
  isMale = false,
  bodyColor = '#475569',
}) => {
  const wingFlap = Math.sin(t * 48 + phase) * 28;
  const wingFlap2 = Math.sin(t * 48 + phase + 0.9) * 22;
  const sx = flipX ? -scale : scale;
  const fillRatio = clamp01(bloodFill);
  const abdomenColor = fillRatio > 0.15 ? '#ef4444' : bodyColor;

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${sx}, ${scale})`}>
      {/* Back Wing */}
      <g transform={`translate(6, -14) rotate(${-22 + wingFlap2})`}>
        <ellipse
          cx={18}
          cy={-18}
          rx={28}
          ry={11}
          fill="#e0f2fe"
          fillOpacity={0.85}
          stroke={INK}
          strokeWidth={4}
        />
      </g>

      {/* 3 Bent Legs */}
      <path
        d="M -6 12 L -16 32 L -28 40 M 6 14 L 4 36 L -8 46 M 18 12 L 28 32 L 42 38"
        fill="none"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Abdomen (Striped or Blood-Filled) */}
      <g transform="rotate(14, 24, 6)">
        <ellipse
          cx={32}
          cy={8}
          rx={28 + fillRatio * 6}
          ry={13 + fillRatio * 6}
          fill={abdomenColor}
          stroke={INK}
          strokeWidth={4.5}
        />
        {/* Stripes */}
        <path
          d="M 18 -3 L 18 19 M 30 -5 L 30 21 M 42 -3 L 42 19"
          stroke={fillRatio > 0.15 ? '#991b1b' : '#f8fafc'}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      </g>

      {/* Thorax */}
      <ellipse cx={0} cy={2} rx={17} ry={14} fill="#334155" stroke={INK} strokeWidth={4.5} />

      {/* Front Wing */}
      <g transform={`translate(-2, -10) rotate(${-10 + wingFlap})`}>
        <ellipse
          cx={18}
          cy={-22}
          rx={32}
          ry={12}
          fill="#bae6fd"
          fillOpacity={0.9}
          stroke={INK}
          strokeWidth={4}
        />
      </g>

      {/* Head */}
      <circle cx={-20} cy={-2} r={13} fill="#475569" stroke={INK} strokeWidth={4.5} />

      {/* Proboscis (Shorter/Blunt for Male, Sharp Needle for Female) */}
      {isMale ? (
        <path
          d="M -32 2 Q -46 10 -52 6"
          fill="none"
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M -32 2 L -64 12"
          fill="none"
          stroke={INK}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      )}

      {/* Antennae (Feathery for Male, Sleek for Female) */}
      {isMale ? (
        <g stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M -26 -12 Q -38 -28 -50 -24" />
          <path d="M -35 -20 L -32 -28 M -41 -23 L -40 -31 M -46 -24 L -48 -31" />
          <path d="M -22 -14 Q -28 -30 -38 -32" />
        </g>
      ) : (
        <g stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none">
          <path d="M -26 -12 Q -36 -24 -44 -20" />
          <path d="M -20 -14 Q -26 -26 -34 -26" />
        </g>
      )}

      {/* Expressive Eye */}
      <circle cx={-24} cy={-4} r={6} fill="#ffffff" stroke={INK} strokeWidth={3} />
      <circle cx={-26} cy={-4} r={2.8} fill={INK} />
    </g>
  );
};

// ============================================================================
// 1. MosquitoCo2RadarVisual (key: MOSQUITO_CO2_RADAR)
// ============================================================================

export const MosquitoCo2RadarVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);
  const approach = easeOutCubic(p);

  const mosquitoX = lerp(960, 495, approach);
  const mosquitoY = 290 + Math.sin(t * 5) * 18;
  const distMeters = Math.max(2, Math.round(lerp(50, 2, approach)));

  const puffs = [0, 1, 2, 3, 4];
  const radarRings = [0, 1, 2];

  return (
    <CardFrame
      title="Ra-đa Khí CO₂ Tầm Xa 50 Mét"
      badge="TẦM XA 50M"
      badgeBg="#0284c7"
      bg="#f0f9ff"
    >
      {/* Subtle Sky Ground Band */}
      <rect x={44} y={530} width={1024} height={96} rx={20} fill="#e0f2fe" stroke={INK} strokeWidth={4} />

      {/* Distance Meter Bar */}
      <line x1={230} y1={578} x2={960} y2={578} stroke="#94a3b8" strokeWidth={6} strokeDasharray="12 10" strokeLinecap="round" />
      <line x1={230} y1={578} x2={mosquitoX} y2={578} stroke="#ef4444" strokeWidth={7} strokeLinecap="round" />
      <circle cx={230} cy={578} r={10} fill="#0284c7" stroke={INK} strokeWidth={4} />
      <circle cx={mosquitoX} cy={578} r={12} fill="#ef4444" stroke={INK} strokeWidth={4} />
      <rect x={mosquitoX - 48} y={536} width={96} height={32} rx={14} fill="#ef4444" stroke={INK} strokeWidth={3.5} />
      <text x={mosquitoX} y={558} textAnchor="middle" fill="#ffffff" fontSize={18} fontWeight={800} fontFamily={FONT}>
        {distMeters}m
      </text>

      {/* Pulsing Red/Blue Radar Waves around Mosquito */}
      {radarRings.map((idx) => {
        const wavePhase = (t * 0.9 + idx * 0.33) % 1;
        const radius = 38 + wavePhase * 135;
        const opacity = (1 - wavePhase) * 0.8;
        const col = idx % 2 === 0 ? '#ef4444' : '#0ea5e9';
        return (
          <circle
            key={idx}
            cx={mosquitoX - 24}
            cy={mosquitoY}
            r={radius}
            fill="none"
            stroke={col}
            strokeWidth={5}
            strokeOpacity={opacity}
            strokeDasharray="14 10"
          />
        );
      })}

      {/* Flowing Blue CO2 Clouds exhaled from human mouth */}
      {puffs.map((idx) => {
        const cycle = (t * 0.55 + idx * 0.2) % 1;
        const cx = lerp(248, 760, cycle);
        const cy = 345 + Math.sin(cycle * Math.PI * 3 + idx) * 28 - cycle * 45;
        const r = lerp(20, 44, cycle);
        const op = cycle < 0.15 ? cycle / 0.15 : cycle > 0.8 ? (1 - cycle) / 0.2 : 0.9;
        return (
          <g key={idx} opacity={op}>
            <circle cx={cx} cy={cy} r={r} fill="#7dd3fc" stroke={INK} strokeWidth={4} />
            <circle cx={cx + r * 0.55} cy={cy - r * 0.25} r={r * 0.65} fill="#bae6fd" stroke={INK} strokeWidth={3.5} />
            <text
              x={cx}
              y={cy + 6}
              textAnchor="middle"
              fill={INK}
              fontSize={Math.max(13, r * 0.48)}
              fontWeight={800}
              fontFamily={FONT}
            >
              CO₂
            </text>
          </g>
        );
      })}

      {/* Human Head Profile on Left */}
      <g transform="translate(150, 320)">
        {/* Shoulders / Shirt */}
        <path
          d="M -78 210 C -78 135 -42 108 0 108 C 46 108 82 135 84 210 Z"
          fill="#3b82f6"
          stroke={INK}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {/* Neck */}
        <rect x={-24} y={66} width={48} height={52} rx={14} fill="#fed7aa" stroke={INK} strokeWidth={5} />
        {/* Head */}
        <circle cx={0} cy={0} r={74} fill="#fed7aa" stroke={INK} strokeWidth={5} />
        {/* Nose pointing right */}
        <path
          d="M 68 -10 Q 94 2 70 16"
          fill="#fed7aa"
          stroke={INK}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Exhaling Mouth */}
        <ellipse
          cx={66}
          cy={32}
          rx={9 + Math.sin(t * 4) * 2.5}
          ry={12 + Math.sin(t * 4) * 2}
          fill="#fb7185"
          stroke={INK}
          strokeWidth={4}
        />
        {/* Hair */}
        <path
          d="M -72 -18 C -78 -72 -24 -94 34 -78 C 62 -70 76 -48 70 -26 C 48 -44 10 -44 -20 -30 C -40 -20 -46 6 -56 14 C -68 6 -70 -6 -72 -18 Z"
          fill="#334155"
          stroke={INK}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {/* Eye */}
        <circle cx={34} cy={-12} r={8} fill={INK} />
        <circle cx={37} cy={-15} r={2.5} fill="#ffffff" />
      </g>

      {/* Approaching Mosquito */}
      <CartoonMosquito x={mosquitoX} y={mosquitoY} t={t} scale={1.45} rotation={-6 + Math.sin(t * 6) * 4} />

      {/* Legend Pill */}
      <rect x={68} y={128} width={332} height={46} rx={16} fill="#ffffff" stroke={INK} strokeWidth={4} />
      <circle cx={96} cy={151} r={10} fill="#38bdf8" stroke={INK} strokeWidth={3} />
      <text x={116} y={158} fill={INK} fontSize={19} fontWeight={800} fontFamily={FONT}>
        Hơi thở CO₂ kích hoạt ra-đa
      </text>
    </CardFrame>
  );
};

// ============================================================================
// 2. MosquitoSweatAcidVisual (key: MOSQUITO_SWEAT_ACID)
// ============================================================================

export const MosquitoSweatAcidVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);

  const plumes = [
    { x: 250, col: '#4ade80', label: 'A-xít lắc-tích', phase: 0 },
    { x: 560, col: '#c084fc', label: 'A-xít béo', phase: 1.4 },
    { x: 840, col: '#86efac', label: 'Mùi cơ thể', phase: 2.8 },
  ];

  const bacteria = [
    { x: 210, y: 472, r: 16, col: '#a855f7' },
    { x: 295, y: 484, r: 13, col: '#22c55e' },
    { x: 470, y: 478, r: 17, col: '#22c55e' },
    { x: 585, y: 468, r: 15, col: '#a855f7' },
    { x: 740, y: 482, r: 16, col: '#22c55e' },
    { x: 875, y: 474, r: 14, col: '#a855f7' },
  ];

  const sweatDrops = [180, 385, 535, 690, 910];

  const m1X = 330 + Math.cos(t * 2.4) * 85;
  const m1Y = 230 + Math.sin(t * 3.1) * 34;
  const m2X = 690 + Math.cos(t * 2.1 + 1.5) * 95;
  const m2Y = 205 + Math.sin(t * 2.8 + 1) * 30;
  const m3X = 870 + Math.cos(t * 2.6 + 3) * 65;
  const m3Y = 285 + Math.sin(t * 3.4 + 2) * 26;

  return (
    <CardFrame
      title="Mồ Hôi + Vi Khuẩn = Bữa Tiệc Mùi Hương"
      badge="MÙI CƠ THỂ"
      badgeBg="#9333ea"
      bg="#faf5ff"
    >
      {/* Rising Green & Purple Scent Plumes */}
      {plumes.map((pl, idx) => {
        const sway = Math.sin(t * 3 + pl.phase) * 24;
        const sway2 = Math.cos(t * 2.6 + pl.phase) * 28;
        const heightScale = lerp(0.45, 1, easeOutCubic(p));
        const topY = 470 - 300 * heightScale;
        return (
          <g key={idx}>
            <path
              d={`M ${pl.x - 28} 470 C ${pl.x - 65 + sway} 390, ${pl.x + 40 + sway2} 310, ${pl.x + sway} ${topY} C ${pl.x + 55 + sway} ${topY + 40}, ${pl.x + 70 + sway2} 365, ${pl.x + 30} 470 Z`}
              fill={pl.col}
              fillOpacity={0.55}
              stroke={INK}
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <path
              d={`M ${pl.x} 455 Q ${pl.x + sway} 375 ${pl.x - sway2 * 0.6} ${topY + 35}`}
              fill="none"
              stroke={INK}
              strokeWidth={3.5}
              strokeDasharray="10 8"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* Floating Chemical Formula / Label Pill */}
      <rect x={320} y={132} width={480} height={54} rx={20} fill="#ffffff" stroke={INK} strokeWidth={4.5} />
      <circle cx={354} cy={159} r={11} fill="#4ade80" stroke={INK} strokeWidth={3} />
      <circle cx={380} cy={159} r={11} fill="#c084fc" stroke={INK} strokeWidth={3} />
      <text x={404} y={167} fill={INK} fontSize={22} fontWeight={800} fontFamily={FONT}>
        A-xít lắc-tích &amp; A-xít béo
      </text>

      {/* Skin Cross-Section Layers */}
      {/* Subcutaneous / Deep Layer */}
      <rect x={44} y={556} width={1024} height={76} rx={16} fill="#fdba74" stroke={INK} strokeWidth={5} />
      {/* Epidermis Top Surface */}
      <path
        d="M 44 494 Q 200 476 360 494 T 680 494 T 1068 494 L 1068 572 L 44 572 Z"
        fill="#fed7aa"
        stroke={INK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <text x={82} y={608} fill="#7c2d12" fontSize={20} fontWeight={800} fontFamily={FONT}>
        BỀ MẶT LÀN DA (Lỗ chân lông tiết mồ hôi + hệ vi khuẩn)
      </text>

      {/* Sweat Glands / Droplets on Skin */}
      {sweatDrops.map((dx, i) => {
        const bob = Math.sin(t * 4 + i * 1.1) * 4;
        return (
          <g key={i} transform={`translate(${dx}, ${472 + bob})`}>
            <path
              d="M 0 -24 C 14 -6 18 6 18 14 A 18 18 0 1 1 -18 14 C -18 6 -14 -6 0 -24 Z"
              fill="#38bdf8"
              stroke={INK}
              strokeWidth={4}
            />
            <circle cx={-5} cy={10} r={4} fill="#ffffff" />
          </g>
        );
      })}

      {/* Cute Round Bacteria on Skin */}
      {bacteria.map((b, i) => {
        const wiggle = Math.sin(t * 6 + i * 1.3) * 4;
        return (
          <g key={i} transform={`translate(${b.x + wiggle}, ${b.y})`}>
            <circle cx={0} cy={0} r={b.r} fill={b.col} stroke={INK} strokeWidth={4} />
            <circle cx={-4} cy={-2} r={2.5} fill="#ffffff" />
            <circle cx={4} cy={-2} r={2.5} fill="#ffffff" />
            <path d="M -4 5 Q 0 9 4 5" fill="none" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" />
          </g>
        );
      })}

      {/* 3 Buzzing Mosquitoes Attracted to Scent */}
      <CartoonMosquito x={m1X} y={m1Y} t={t} scale={1.15} flipX={Math.sin(t * 2.4) < 0} phase={0.2} />
      <CartoonMosquito x={m2X} y={m2Y} t={t} scale={1.25} flipX={false} phase={1.7} />
      <CartoonMosquito x={m3X} y={m3Y} t={t} scale={1.05} flipX={false} phase={3.1} />
    </CardFrame>
  );
};

// ============================================================================
// 3. MosquitoHeatCameraVisual (key: MOSQUITO_HEAT_CAMERA)
// ============================================================================

export const MosquitoHeatCameraVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);
  const lockEase = easeOutCubic(subProgress(p, 0.15, 0.8));

  // Crosshair glides from center-left onto the hot runner on the right
  const targetX = lerp(420, 745, lockEase) + Math.sin(t * 4) * (1 - lockEase) * 18;
  const targetY = lerp(310, 325, lockEase) + Math.cos(t * 4) * (1 - lockEase) * 14;
  const reticleScale = lerp(1.35, 1.0, lockEase) + Math.sin(t * 8) * 0.04;
  const isLocked = lockEase > 0.85;

  return (
    <CardFrame
      title="Camera Nhiệt Hồng Ngoại Của Muỗi"
      badge="CẢM BIẾN NHIỆT"
      badgeBg="#ef4444"
      bg="#0f172a"
      headerBg="#1e293b"
      dark={true}
    >
      <defs>
        <radialGradient id="heat-cool-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heat-hot-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.65" />
          <stop offset="60%" stopColor="#ef4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heat-scale-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="35%" stopColor="#06b6d4" />
          <stop offset="65%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* Thermal Grid Background */}
      <g stroke="#1e293b" strokeWidth={2}>
        {[180, 260, 340, 420, 500, 580].map((gy) => (
          <line key={gy} x1={48} y1={gy} x2={1064} y2={gy} />
        ))}
        {[160, 300, 440, 580, 720, 860, 1000].map((gx) => (
          <line key={gx} x1={gx} y1={120} x2={gx} y2={628} />
        ))}
      </g>

      {/* Camera Viewfinder Corner Brackets */}
      <g stroke="#38bdf8" strokeWidth={5} fill="none" strokeLinecap="round">
        <path d="M 64 166 L 64 134 L 96 134" />
        <path d="M 1016 134 L 1048 134 L 1048 166" />
        <path d="M 64 584 L 64 616 L 96 616" />
        <path d="M 1016 616 L 1048 616 L 1048 584" />
      </g>

      {/* REC Indicator */}
      <circle cx={98} cy={164} r={8} fill="#ef4444" fillOpacity={0.5 + 0.5 * Math.sin(t * 7)} />
      <text x={118} y={171} fill="#f8fafc" fontSize={18} fontWeight={800} fontFamily={FONT}>
        IR-CAM 60FPS
      </text>

      {/* Thermal Scale Bar on Far Right */}
      <rect x={990} y={210} width={28} height={310} rx={12} fill="url(#heat-scale-grad)" stroke="#f8fafc" strokeWidth={3.5} />
      <text x={1004} y={198} textAnchor="middle" fill="#f87171" fontSize={16} fontWeight={800} fontFamily={FONT}>
        38°C
      </text>
      <text x={1004} y={546} textAnchor="middle" fill="#38bdf8" fontSize={16} fontWeight={800} fontFamily={FONT}>
        35°C
      </text>

      {/* Divider */}
      <line x1={535} y1={148} x2={535} y2={600} stroke="#334155" strokeWidth={4} strokeDasharray="10 10" />

      {/* LEFT: Cool Person (Blue Thermal Silhouette) */}
      <circle cx={300} cy={360} r={175} fill="url(#heat-cool-glow)" />
      <g transform="translate(300, 350)">
        {/* Head */}
        <circle cx={0} cy={-112} r={44} fill="#38bdf8" stroke={INK} strokeWidth={5} />
        {/* Torso */}
        <rect x={-56} y={-60} width={112} height={154} rx={36} fill="#0284c7" stroke={INK} strokeWidth={5} />
        {/* Arms */}
        <rect x={-90} y={-48} width={30} height={124} rx={15} fill="#0ea5e9" stroke={INK} strokeWidth={5} />
        <rect x={60} y={-48} width={30} height={124} rx={15} fill="#0ea5e9" stroke={INK} strokeWidth={5} />
        {/* Legs */}
        <rect x={-46} y={88} width={38} height={106} rx={16} fill="#1d4ed8" stroke={INK} strokeWidth={5} />
        <rect x={8} y={88} width={38} height={106} rx={16} fill="#1d4ed8" stroke={INK} strokeWidth={5} />
        {/* Label */}
        <rect x={-118} y={208} width={236} height={44} rx={16} fill="#1e293b" stroke="#38bdf8" strokeWidth={3.5} />
        <text x={0} y={237} textAnchor="middle" fill="#7dd3fc" fontSize={20} fontWeight={800} fontFamily={FONT}>
          Người mát • 36.2°C
        </text>
      </g>

      {/* RIGHT: Hot Person Who Just Ran (Glowing Red/Orange/Yellow) */}
      <circle cx={745} cy={360} r={195 + Math.sin(t * 6) * 8} fill="url(#heat-hot-glow)" />
      <g transform="translate(745, 350)">
        {/* Rising Heat Wavy Lines */}
        {[-65, 0, 65].map((hx, idx) => {
          const rise = (t * 40 + idx * 20) % 36;
          return (
            <path
              key={idx}
              d={`M ${hx} ${-160 - rise} Q ${hx + 10} ${-175 - rise} ${hx} ${-190 - rise}`}
              fill="none"
              stroke="#facc15"
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeOpacity={1 - rise / 36}
            />
          );
        })}
        {/* Head */}
        <circle cx={0} cy={-112} r={44} fill="#facc15" stroke={INK} strokeWidth={5} />
        {/* Hot Core Glow inside Torso */}
        <rect x={-56} y={-60} width={112} height={154} rx={36} fill="#ef4444" stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={12} rx={36} ry={52} fill="#f97316" />
        <ellipse cx={0} cy={8} rx={20} ry={30} fill="#facc15" />
        {/* Arms (Pumping Pose) */}
        <rect x={-92} y={-48} width={30} height={116} rx={15} transform="rotate(14, -77, -48)" fill="#f97316" stroke={INK} strokeWidth={5} />
        <rect x={62} y={-48} width={30} height={116} rx={15} transform="rotate(-14, 77, -48)" fill="#f97316" stroke={INK} strokeWidth={5} />
        {/* Legs */}
        <rect x={-46} y={88} width={38} height={106} rx={16} fill="#dc2626" stroke={INK} strokeWidth={5} />
        <rect x={8} y={88} width={38} height={106} rx={16} fill="#dc2626" stroke={INK} strokeWidth={5} />
        {/* Label */}
        <rect x={-132} y={208} width={264} height={44} rx={16} fill="#450a0a" stroke="#ef4444" strokeWidth={3.5} />
        <text x={0} y={237} textAnchor="middle" fill="#fef08a" fontSize={20} fontWeight={800} fontFamily={FONT}>
          Vừa chạy xong • 37.8°C
        </text>
      </g>

      {/* Infrared Target Lock Reticle */}
      <g transform={`translate(${targetX}, ${targetY}) scale(${reticleScale})`}>
        <circle
          cx={0}
          cy={0}
          r={76}
          fill="none"
          stroke={isLocked ? '#ef4444' : '#facc15'}
          strokeWidth={5}
          strokeDasharray="24 14"
          transform={`rotate(${t * 55})`}
        />
        <circle cx={0} cy={0} r={42} fill="none" stroke="#fef08a" strokeWidth={3.5} />
        <line x1={-96} y1={0} x2={-52} y2={0} stroke="#ef4444" strokeWidth={5} strokeLinecap="round" />
        <line x1={52} y1={0} x2={96} y2={0} stroke="#ef4444" strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={-96} x2={0} y2={-52} stroke="#ef4444" strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={52} x2={0} y2={96} stroke="#ef4444" strokeWidth={5} strokeLinecap="round" />
        <rect x={-82} y={-124} width={164} height={34} rx={12} fill="#ef4444" stroke="#ffffff" strokeWidth={3} />
        <text x={0} y={-101} textAnchor="middle" fill="#ffffff" fontSize={16} fontWeight={800} fontFamily={FONT}>
          {isLocked ? 'KHÓA MỤC TIÊU!' : 'ĐANG QUÉT...'}
        </text>
      </g>
    </CardFrame>
  );
};

// ============================================================================
// 4. MosquitoBloodTypeOVisual (key: MOSQUITO_BLOOD_TYPE_O)
// ============================================================================

export const MosquitoBloodTypeOVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);

  const bars = [
    { label: 'Nhóm O', sub: 'Hấp dẫn nhất', maxH: 310, color: '#ef4444', x: 245, start: 0.05 },
    { label: 'Nhóm B', sub: 'Trung bình', maxH: 195, color: '#f59e0b', x: 525, start: 0.18 },
    { label: 'Nhóm A', sub: 'Ít bị đậu nhất', maxH: 135, color: '#38bdf8', x: 805, start: 0.3 },
  ];

  const baseY = 535;
  const barW = 154;
  const oProgress = easeOutCubic(subProgress(p, 0.05, 0.65));
  const oTopY = baseY - 310 * oProgress;

  return (
    <CardFrame
      title="Nhóm Máu O Có Thực Sự 'Ngọt' Hơn?"
      badge="NHÓM MÁU O"
      badgeBg="#ef4444"
      bg="#fff7ed"
    >
      {/* Chart Horizontal Grid Lines */}
      {[225, 305, 385, 465].map((gy) => (
        <line key={gy} x1={120} y1={gy} x2={1000} y2={gy} stroke="#fed7aa" strokeWidth={3} strokeDasharray="10 8" />
      ))}

      {/* X & Y Axes */}
      <line x1={120} y1={170} x2={120} y2={baseY} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <line x1={120} y1={baseY} x2={1010} y2={baseY} stroke={INK} strokeWidth={5} strokeLinecap="round" />

      {/* Animated Bars */}
      {bars.map((b, idx) => {
        const bp = easeOutCubic(subProgress(p, b.start, b.start + 0.55));
        const h = Math.max(12, b.maxH * bp);
        const y = baseY - h;
        return (
          <g key={idx}>
            <rect
              x={b.x - barW / 2}
              y={y}
              width={barW}
              height={h}
              rx={18}
              fill={b.color}
              stroke={INK}
              strokeWidth={5}
            />
            {/* Gloss Highlight */}
            <rect
              x={b.x - barW / 2 + 14}
              y={y + 14}
              width={18}
              height={Math.max(0, h - 28)}
              rx={9}
              fill="#ffffff"
              fillOpacity={0.3}
            />
            {/* Blood Drop Badge inside Bar */}
            {h > 75 && (
              <g transform={`translate(${b.x}, ${y + 44})`}>
                <circle cx={0} cy={0} r={24} fill="#ffffff" stroke={INK} strokeWidth={4} />
                <text x={0} y={8} textAnchor="middle" fill={INK} fontSize={22} fontWeight={900} fontFamily={FONT}>
                  {b.label.replace('Nhóm ', '')}
                </text>
              </g>
            )}
            {/* Labels below X axis */}
            <text x={b.x} y={baseY + 38} textAnchor="middle" fill={INK} fontSize={24} fontWeight={800} fontFamily={FONT}>
              {b.label}
            </text>
            <text x={b.x} y={baseY + 64} textAnchor="middle" fill="#64748b" fontSize={17} fontWeight={700} fontFamily={FONT}>
              {b.sub}
            </text>
          </g>
        );
      })}

      {/* 3 Mosquitoes Perched / Hovering on Top of Bar O */}
      <CartoonMosquito
        x={205}
        y={oTopY - 36 + Math.sin(t * 5) * 6}
        t={t}
        scale={0.95}
        flipX={true}
        rotation={12}
        phase={0}
      />
      <CartoonMosquito
        x={255}
        y={oTopY - 46 + Math.cos(t * 4.5) * 5}
        t={t}
        scale={1.0}
        flipX={false}
        rotation={-8}
        phase={1.3}
      />
      <CartoonMosquito
        x={306}
        y={oTopY - 26 + Math.sin(t * 5.5 + 1) * 7}
        t={t}
        scale={0.88}
        flipX={false}
        rotation={-16}
        phase={2.5}
      />

      {/* Callout Note: "Chỉ là 1 phần nhỏ" */}
      <g transform={`translate(760, 195) scale(${lerp(0.85, 1, easeOutBack(subProgress(p, 0.45, 0.85)))})`}>
        <rect x={-190} y={-44} width={380} height={88} rx={22} fill="#fef08a" stroke={INK} strokeWidth={5} />
        <text x={0} y={-8} textAnchor="middle" fill={INK} fontSize={23} fontWeight={900} fontFamily={FONT}>
          Chỉ là 1 phần nhỏ!
        </text>
        <text x={0} y={24} textAnchor="middle" fill="#854d0e" fontSize={17} fontWeight={700} fontFamily={FONT}>
          CO₂ &amp; mùi mồ hôi vẫn quyết định chính
        </text>
      </g>
    </CardFrame>
  );
};

// ============================================================================
// 5. MosquitoColorClothesVisual (key: MOSQUITO_COLOR_CLOTHES)
// ============================================================================

export const MosquitoColorClothesVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);

  const flyPastX = lerp(615, 1020, (t * 0.45 + p * 0.5) % 1);
  const flyPastY = 230 + Math.sin(t * 4) * 20;

  return (
    <CardFrame
      title="Màu Áo Nào Thu Hút Muỗi Nhất?"
      badge="THỊ GIÁC MUỖI"
      badgeBg="#e11d48"
      bg="#f8fafc"
    >
      {/* Left Panel: Dark Clothes */}
      <rect x={48} y={130} width={492} height={496} rx={24} fill="#fee2e2" stroke={INK} strokeWidth={5} />
      <rect x={144} y={150} width={300} height={44} rx={16} fill="#ef4444" stroke={INK} strokeWidth={4} />
      <text x={294} y={179} textAnchor="middle" fill="#ffffff" fontSize={20} fontWeight={800} fontFamily={FONT}>
        ÁO TỐI MÀU (Đen / Đỏ đậm)
      </text>

      {/* Dark/Crimson T-Shirt Illustration */}
      <g transform="translate(294, 385)">
        <path
          d="M -68 -120 L -145 -72 L -115 -10 L -76 -26 L -76 132 L 76 132 L 76 -26 L 115 -10 L 145 -72 L 68 -120 Q 0 -86 -68 -120 Z"
          fill="#991b1b"
          stroke={INK}
          strokeWidth={5.5}
          strokeLinejoin="round"
        />
        {/* Collar */}
        <path d="M -52 -114 Q 0 -76 52 -114" fill="none" stroke={INK} strokeWidth={5} />
        {/* Dark Contrast Stripe */}
        <rect x={-74} y={-20} width={148} height={36} fill="#1e293b" stroke={INK} strokeWidth={4} />
      </g>

      {/* Swarming Mosquitoes around Dark Shirt */}
      <CartoonMosquito
        x={195 + Math.cos(t * 3.2) * 26}
        y={315 + Math.sin(t * 4.1) * 18}
        t={t}
        scale={1.05}
        flipX={true}
        phase={0}
      />
      <CartoonMosquito
        x={395 + Math.cos(t * 2.8 + 1.2) * 24}
        y={330 + Math.sin(t * 3.8 + 1.2) * 22}
        t={t}
        scale={1.1}
        flipX={false}
        phase={1.1}
      />
      <CartoonMosquito
        x={295 + Math.sin(t * 3.5) * 32}
        y={465 + Math.cos(t * 4.2) * 14}
        t={t}
        scale={0.95}
        flipX={false}
        phase={2.4}
      />
      <text x={294} y={596} textAnchor="middle" fill="#991b1b" fontSize={21} fontWeight={800} fontFamily={FONT}>
        Tương phản mạnh → Muỗi bu quanh!
      </text>

      {/* Right Panel: Light Clothes */}
      <rect x={580} y={130} width={488} height={496} rx={24} fill="#ecfdf5" stroke={INK} strokeWidth={5} />
      <rect x={668} y={150} width={312} height={44} rx={16} fill="#22c55e" stroke={INK} strokeWidth={4} />
      <text x={824} y={179} textAnchor="middle" fill="#ffffff" fontSize={20} fontWeight={800} fontFamily={FONT}>
        ÁO SÁNG MÀU (Trắng / Vàng nhạt)
      </text>

      {/* Light Cream/White T-Shirt Illustration */}
      <g transform="translate(824, 385)">
        <path
          d="M -68 -120 L -145 -72 L -115 -10 L -76 -26 L -76 132 L 76 132 L 76 -26 L 115 -10 L 145 -72 L 68 -120 Q 0 -86 -68 -120 Z"
          fill="#fef9c3"
          stroke={INK}
          strokeWidth={5.5}
          strokeLinejoin="round"
        />
        <path d="M -52 -114 Q 0 -76 52 -114" fill="none" stroke={INK} strokeWidth={5} />
        <rect x={-74} y={-20} width={148} height={36} fill="#ffffff" stroke={INK} strokeWidth={4} />
      </g>

      {/* Dashed Fly-By Trajectory & Passing Mosquito */}
      <path
        d="M 610 245 Q 820 190 1030 235"
        fill="none"
        stroke="#64748b"
        strokeWidth={4}
        strokeDasharray="12 10"
        strokeLinecap="round"
      />
      <CartoonMosquito x={flyPastX} y={flyPastY} t={t} scale={1.0} flipX={true} rotation={-4} phase={0.7} />

      <text x={824} y={596} textAnchor="middle" fill="#166534" fontSize={21} fontWeight={800} fontFamily={FONT}>
        Phản xạ sáng → Muỗi bay lướt qua!
      </text>
    </CardFrame>
  );
};

// ============================================================================
// 6. MosquitoFemaleOnlyVisual (key: MOSQUITO_FEMALE_ONLY)
// ============================================================================

export const MosquitoFemaleOnlyVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);
  const eggGlow = 0.65 + 0.35 * Math.sin(t * 6);
  const badgePop = easeOutBack(subProgress(p, 0.25, 0.75));

  return (
    <CardFrame
      title="Chỉ Có Muỗi Cái Mới Đốt Người!"
      badge="SỰ THẬT THÚ VỊ"
      badgeBg="#16a34a"
      bg="#f8fafc"
    >
      {/* LEFT: Male Mosquito on Flower */}
      <rect x={48} y={130} width={492} height={496} rx={24} fill="#f0fdf4" stroke={INK} strokeWidth={5} />
      <rect x={164} y={150} width={260} height={44} rx={16} fill="#22c55e" stroke={INK} strokeWidth={4} />
      <text x={294} y={179} textAnchor="middle" fill="#ffffff" fontSize={21} fontWeight={800} fontFamily={FONT}>
        MUỖI ĐỰC (Ăn chay)
      </text>

      {/* Cute Kass Blox Flower */}
      <g transform="translate(265, 455)">
        {/* Stem & Leaves */}
        <path d="M 0 0 L 0 115" stroke="#16a34a" strokeWidth={12} strokeLinecap="round" />
        <path d="M 0 0 L 0 115" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={-34} cy={65} rx={32} ry={14} transform="rotate(-24, -34, 65)" fill="#4ade80" stroke={INK} strokeWidth={4} />
        <ellipse cx={34} cy={80} rx={32} ry={14} transform="rotate(24, 34, 80)" fill="#4ade80" stroke={INK} strokeWidth={4} />
        {/* Petals */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx={0}
            cy={-42}
            rx={22}
            ry={32}
            transform={`rotate(${deg})`}
            fill="#f472b6"
            stroke={INK}
            strokeWidth={4.5}
          />
        ))}
        {/* Flower Center */}
        <circle cx={0} cy={0} r={28} fill="#facc15" stroke={INK} strokeWidth={4.5} />
      </g>

      {/* Male Mosquito Sipping Nectar */}
      <CartoonMosquito
        x={335}
        y={378 + Math.sin(t * 4) * 6}
        t={t}
        scale={1.35}
        isMale={true}
        rotation={-12}
      />

      {/* Green Checkmark Badge: Hiền khô */}
      <g transform={`translate(294, 578) scale(${lerp(0.85, 1, badgePop)})`}>
        <rect x={-130} y={-24} width={260} height={48} rx={24} fill="#bbf7d0" stroke={INK} strokeWidth={4} />
        <text x={0} y={8} textAnchor="middle" fill="#166534" fontSize={21} fontWeight={800} fontFamily={FONT}>
          ✓ Hiền khô • Hút mật hoa
        </text>
      </g>

      {/* RIGHT: Female Mosquito with Glowing Eggs */}
      <rect x={580} y={130} width={488} height={496} rx={24} fill="#fef2f2" stroke={INK} strokeWidth={5} />
      <rect x={684} y={150} width={280} height={44} rx={16} fill="#ef4444" stroke={INK} strokeWidth={4} />
      <text x={824} y={179} textAnchor="middle" fill="#ffffff" fontSize={21} fontWeight={800} fontFamily={FONT}>
        MUỖI CÁI (Nuôi trứng)
      </text>

      {/* Female Mosquito */}
      <CartoonMosquito
        x={765}
        y={320 + Math.sin(t * 4.5) * 10}
        t={t}
        scale={1.45}
        bloodFill={lerp(0.2, 0.9, p)}
        rotation={4}
      />

      {/* Glowing Egg Cluster Callout Bubble */}
      <g transform="translate(895, 445)">
        <circle cx={0} cy={0} r={74} fill="#fef08a" fillOpacity={eggGlow * 0.45} />
        <circle cx={0} cy={0} r={58} fill="#ffffff" stroke={INK} strokeWidth={4.5} />
        {/* Cluster of Little Eggs */}
        {[
          { ex: -18, ey: -10 },
          { ex: 2, ey: -14 },
          { ex: 20, ey: -6 },
          { ex: -12, ey: 14 },
          { ex: 10, ey: 16 },
        ].map((egg, i) => (
          <ellipse
            key={i}
            cx={egg.ex}
            cy={egg.ey}
            rx={11}
            ry={16}
            transform={`rotate(${i * 14 - 20}, ${egg.ex}, ${egg.ey})`}
            fill="#fde047"
            stroke={INK}
            strokeWidth={3.5}
          />
        ))}
        {/* Blood Drop Icon next to Eggs */}
        <g transform="translate(-145, 0)">
          <path
            d="M 0 -34 C 22 -8 28 8 28 20 A 28 28 0 1 1 -28 20 C -28 8 -22 -8 0 -34 Z"
            fill="#ef4444"
            stroke={INK}
            strokeWidth={4.5}
          />
          <text x={0} y={24} textAnchor="middle" fill="#ffffff" fontSize={16} fontWeight={900} fontFamily={FONT}>
            ĐẠM
          </text>
        </g>
        <path d="M -108 0 L -70 0" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <path d="M -82 -10 L -68 0 L -82 10" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <rect x={630} y={554} width={388} height={48} rx={24} fill="#fecaca" stroke={INK} strokeWidth={4} />
      <text x={824} y={586} textAnchor="middle" fill="#991b1b" fontSize={20} fontWeight={800} fontFamily={FONT}>
        Cần chất đạm từ máu để tạo trứng
      </text>
    </CardFrame>
  );
};

// ============================================================================
// 7. MosquitoProboscisNeedleVisual (key: MOSQUITO_PROBOSCIS_NEEDLE)
// ============================================================================

export const MosquitoProboscisNeedleVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);

  const insertEase = easeOutCubic(subProgress(p, 0.05, 0.45));
  const suctionEase = clamp01(subProgress(p, 0.35, 0.95));

  const needleTipY = lerp(245, 515, insertEase);
  const salivaY = lerp(490, 530, (t * 1.4) % 1);

  return (
    <CardFrame
      title="Vòi Muỗi Hoạt Động Dưới Da Như Thế Nào?"
      badge="PHÓNG ĐẠI 100X"
      badgeBg="#dc2626"
      bg="#fff1f2"
    >
      {/* Skin Layers */}
      {/* Epidermis */}
      <rect x={44} y={280} width={1024} height={74} fill="#fed7aa" stroke={INK} strokeWidth={5} />
      {/* Dermis */}
      <rect x={44} y={354} width={1024} height={278} rx={16} fill="#fecaca" stroke={INK} strokeWidth={5} />

      {/* Blood Vessel Horizontal Tube */}
      <rect x={44} y={486} width={1024} height={82} fill="#dc2626" stroke={INK} strokeWidth={5} />
      <rect x={44} y={498} width={1024} height={14} fill="#f87171" fillOpacity={0.5} />

      {/* Flowing Red Blood Cells inside Vessel */}
      {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
        const bx = 70 + ((t * 130 + idx * 155) % 980);
        const by = 528 + Math.sin(t * 4 + idx) * 10;
        return (
          <ellipse key={idx} cx={bx} cy={by} rx={22} ry={13} fill="#991b1b" stroke="#fecaca" strokeWidth={3} />
        );
      })}

      {/* Proboscis Tube Entering Skin */}
      <g>
        {/* Outer Sheath (Labium) bending back on skin surface */}
        <path
          d={`M 544 170 Q 520 225 538 282`}
          fill="none"
          stroke="#475569"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={`M 544 170 Q 520 225 538 282`}
          fill="none"
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Inner Hollow Needle Stylet */}
        <rect
          x={550}
          y={155}
          width={24}
          height={Math.max(60, needleTipY - 155)}
          rx={10}
          fill="#e2e8f0"
          stroke={INK}
          strokeWidth={4.5}
        />

        {/* Animated Red Blood Column Being Sucked Upward */}
        {suctionEase > 0.02 && (
          <rect
            x={555}
            y={lerp(needleTipY - 10, 175, suctionEase)}
            width={14}
            height={Math.max(8, needleTipY - lerp(needleTipY - 10, 175, suctionEase) - 6)}
            rx={6}
            fill="#ef4444"
          />
        )}

        {/* Green Saliva Droplets Injected into Vessel */}
        {insertEase > 0.75 && (
          <g>
            <circle cx={596} cy={salivaY} r={14} fill="#4ade80" stroke={INK} strokeWidth={3.5} />
            <circle cx={628} cy={520 + Math.sin(t * 5) * 8} r={10} fill="#86efac" stroke={INK} strokeWidth={3} />
            <circle cx={520} cy={532 + Math.cos(t * 5) * 7} r={11} fill="#4ade80" stroke={INK} strokeWidth={3} />
          </g>
        )}
      </g>

      {/* Mosquito Head / Upper Body Perched Above Skin */}
      <g transform="translate(562, 155)">
        <ellipse cx={0} cy={-16} rx={48} ry={28} fill="#475569" stroke={INK} strokeWidth={5} />
        <circle cx={-16} cy={-18} r={9} fill="#ffffff" stroke={INK} strokeWidth={3} />
        <circle cx={-16} cy={-18} r={4} fill={INK} />
        <circle cx={16} cy={-18} r={9} fill="#ffffff" stroke={INK} strokeWidth={3} />
        <circle cx={16} cy={-18} r={4} fill={INK} />
      </g>

      {/* Callout Box 1: Green Saliva */}
      <rect x={68} y={376} width={356} height={82} rx={20} fill="#dcfce7" stroke={INK} strokeWidth={4.5} />
      <circle cx={102} cy={417} r={16} fill="#4ade80" stroke={INK} strokeWidth={3.5} />
      <text x={132} y={409} fill="#166534" fontSize={20} fontWeight={800} fontFamily={FONT}>
        Bơm nước bọt xanh:
      </text>
      <text x={132} y={437} fill={INK} fontSize={18} fontWeight={700} fontFamily={FONT}>
        Chống đông + gây tê
      </text>

      {/* Callout Box 2: Blood Suction */}
      <rect x={686} y={162} width={354} height={82} rx={20} fill="#fee2e2" stroke={INK} strokeWidth={4.5} />
      <text x={718} y={196} fill="#991b1b" fontSize={20} fontWeight={800} fontFamily={FONT}>
        Hút máu ngược lên ↑
      </text>
      <text x={718} y={224} fill={INK} fontSize={18} fontWeight={700} fontFamily={FONT}>
        Lượng máu hút: {Math.round(suctionEase * 100)}%
      </text>
    </CardFrame>
  );
};

// ============================================================================
// 8. MosquitoItchHistamineVisual (key: MOSQUITO_ITCH_HISTAMINE)
// ============================================================================

export const MosquitoItchHistamineVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);
  const swell = easeOutCubic(p);

  const bumpHeight = lerp(8, 108, swell);
  const redOpacity = lerp(0.15, 0.85, swell);

  const sparks = [
    { angle: -150, dist: 95 },
    { angle: -115, dist: 115 },
    { angle: -65, dist: 115 },
    { angle: -30, dist: 95 },
    { angle: 15, dist: 90 },
    { angle: 165, dist: 90 },
  ];

  return (
    <CardFrame
      title="Tại Sao Nốt Muỗi Đốt Lại Sưng & Ngứa?"
      badge="PHẢN ỨNG MIỄN DỊCH"
      badgeBg="#eab308"
      badgeText={INK}
      bg="#fefce8"
    >
      {/* Itch Lightning Nerve Signals Shooting Upward */}
      {[-120, 0, 120].map((offset, idx) => {
        const pulse = (t * 2.2 + idx * 0.3) % 1;
        const ly = lerp(320 - bumpHeight, 145, pulse);
        return (
          <g key={idx} transform={`translate(${560 + offset}, ${ly})`} opacity={swell * (1 - pulse * 0.7)}>
            <path
              d="M 0 -24 L -14 2 L 2 2 L -8 28 L 16 -4 L 0 -4 Z"
              fill="#facc15"
              stroke={INK}
              strokeWidth={3.5}
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* Itch Label Pill at Top */}
      <rect x={392} y={132} width={336} height={48} rx={20} fill="#ef4444" stroke={INK} strokeWidth={4} />
      <text x={560} y={163} textAnchor="middle" fill="#ffffff" fontSize={21} fontWeight={800} fontFamily={FONT}>
        ⚡ Tín hiệu NGỨA gửi lên não!
      </text>

      {/* Swelling Skin Surface Cross-Section */}
      <path
        d={`M 44 430 L 310 430 C 410 430 465 ${430 - bumpHeight} 560 ${430 - bumpHeight} C 655 ${430 - bumpHeight} 710 430 810 430 L 1068 430 L 1068 632 L 44 632 Z`}
        fill="#fed7aa"
        stroke={INK}
        strokeWidth={5}
        strokeLinejoin="round"
      />

      {/* Red Inflammation Glow inside Bump */}
      <ellipse
        cx={560}
        cy={435 - bumpHeight * 0.35}
        rx={165}
        ry={50 + bumpHeight * 0.45}
        fill="#ef4444"
        fillOpacity={redOpacity * 0.45}
      />

      {/* Mosquito Saliva Droplet Trapped Under Skin */}
      <circle cx={560} cy={455} r={24} fill="#4ade80" stroke={INK} strokeWidth={4.5} />
      <text x={560} y={461} textAnchor="middle" fill={INK} fontSize={13} fontWeight={900} fontFamily={FONT}>
        Nước bọt
      </text>

      {/* Immune Mast Cells Releasing Yellow Histamine Sparks */}
      {[-150, 150].map((mx, idx) => (
        <g key={idx} transform={`translate(${560 + mx}, 525)`}>
          <circle cx={0} cy={0} r={40} fill="#38bdf8" stroke={INK} strokeWidth={4.5} />
          <circle cx={-10} cy={-6} r={5} fill={INK} />
          <circle cx={10} cy={-6} r={5} fill={INK} />
          <path d="M -10 10 Q 0 18 10 10" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <text x={0} y={62} textAnchor="middle" fill={INK} fontSize={17} fontWeight={800} fontFamily={FONT}>
            Tế bào miễn dịch
          </text>
        </g>
      ))}

      {/* Flying Yellow Histamine Particles */}
      {sparks.map((sp, i) => {
        const rad = (sp.angle * Math.PI) / 180;
        const travel = ((t * 1.1 + i * 0.16) % 1) * sp.dist * Math.max(0.3, swell);
        const sx = 560 + Math.cos(rad) * (35 + travel);
        const sy = 455 + Math.sin(rad) * (35 + travel);
        return (
          <g key={i} transform={`translate(${sx}, ${sy})`}>
            <circle cx={0} cy={0} r={10} fill="#facc15" stroke={INK} strokeWidth={3} />
          </g>
        );
      })}

      {/* Histamine Badge */}
      <rect x={762} y={248} width={262} height={74} rx={20} fill="#fef08a" stroke={INK} strokeWidth={4.5} />
      <text x={893} y={280} textAnchor="middle" fill={INK} fontSize={22} fontWeight={900} fontFamily={FONT}>
        Hít-xta-min
      </text>
      <text x={893} y={307} textAnchor="middle" fill="#854d0e" fontSize={17} fontWeight={700} fontFamily={FONT}>
        Gây sưng đỏ &amp; ngứa rát
      </text>
    </CardFrame>
  );
};

// ============================================================================
// 9. MosquitoScratchLoopVisual (key: MOSQUITO_SCRATCH_LOOP)
// ============================================================================

export const MosquitoScratchLoopVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);

  // Active step highlights cyclically
  const activeStep = Math.floor((t * 1.2 + p * 4) % 4);

  const nodes = [
    { x: 560, y: 186, w: 230, label: '1. Gãi mạnh', color: '#fb923c' },
    { x: 865, y: 345, w: 230, label: '2. Da kích ứng', color: '#f87171' },
    { x: 560, y: 492, w: 292, label: '3. Tiết thêm Hít-xta-min', color: '#facc15' },
    { x: 255, y: 345, w: 230, label: '4. Ngứa dữ hơn!', color: '#ef4444' },
  ];

  return (
    <CardFrame
      title="Vòng Xoáy Càng Gãi Càng Ngứa!"
      badge="TRÁNH GÃI MẠNH"
      badgeBg="#f97316"
      bg="#fff7ed"
    >
      {/* Rotating Dashed Circle Orbit */}
      <circle
        cx={560}
        cy={342}
        r={156}
        fill="none"
        stroke="#f97316"
        strokeWidth={8}
        strokeDasharray="24 18"
        transform={`rotate(${t * 38}, 560, 342)`}
      />

      {/* Directional Curved Arrowheads */}
      {[45, 135, 225, 315].map((deg) => (
        <g key={deg} transform={`rotate(${deg + t * 38}, 560, 342)`}>
          <polygon points="560,174 578,186 560,198" fill={INK} />
        </g>
      ))}

      {/* Central Icon: Swollen Bump Warning */}
      <circle cx={560} cy={342} r={64} fill="#fee2e2" stroke={INK} strokeWidth={5} />
      <text x={560} y={336} textAnchor="middle" fill="#dc2626" fontSize={22} fontWeight={900} fontFamily={FONT}>
        VÒNG LẶP
      </text>
      <text x={560} y={366} textAnchor="middle" fill={INK} fontSize={22} fontWeight={900} fontFamily={FONT}>
        NGỨA!
      </text>

      {/* 4 Cycle Nodes */}
      {nodes.map((n, idx) => {
        const isActive = idx === activeStep;
        const sc = isActive ? 1.07 : 1.0;
        return (
          <g key={idx} transform={`translate(${n.x}, ${n.y}) scale(${sc})`}>
            <rect
              x={-n.w / 2}
              y={-32}
              width={n.w}
              height={64}
              rx={22}
              fill={n.color}
              stroke={INK}
              strokeWidth={isActive ? 6 : 4.5}
            />
            <text
              x={0}
              y={8}
              textAnchor="middle"
              fill={idx === 2 ? INK : '#ffffff'}
              fontSize={22}
              fontWeight={800}
              fontFamily={FONT}
            >
              {n.label}
            </text>
          </g>
        );
      })}

      {/* Bottom Green Tip Banner: Ice Cube Relief */}
      <rect x={165} y={560} width={790} height={64} rx={22} fill="#22c55e" stroke={INK} strokeWidth={5} />
      {/* Ice Cube Icon */}
      <g transform="translate(216, 592)">
        <rect x={-20} y={-20} width={40} height={40} rx={10} fill="#bae6fd" stroke={INK} strokeWidth={3.5} />
        <path d="M -10 -10 L 0 -10 M -10 -10 L -10 0" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
      </g>
      <text x={580} y={600} textAnchor="middle" fill="#ffffff" fontSize={23} fontWeight={800} fontFamily={FONT}>
        Mẹo: Chườm đá lạnh để làm dịu ngay
      </text>
    </CardFrame>
  );
};

// ============================================================================
// 10. MosquitoFanWindVisual (key: MOSQUITO_FAN_WIND)
// ============================================================================

export const MosquitoFanWindVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);
  const pushEase = easeOutCubic(p);

  const bladeAngle = (t * 720) % 360;
  const mosquitoX = lerp(580, 955, pushEase) + Math.sin(t * 9) * 10;
  const mosquitoY = 315 + Math.cos(t * 7) * 28;
  const mosquitoRot = lerp(0, 28, pushEase) + Math.sin(t * 14) * 14;

  return (
    <CardFrame
      title="Vũ Khí Bí Mật: Chiếc Quạt Điện!"
      badge="ĐUỔI MUỖI 60FPS"
      badgeBg="#0ea5e9"
      bg="#f0f9ff"
    >
      {/* Flowing Wind Streamlines */}
      {[210, 290, 370, 450].map((wy, idx) => {
        const dashOffset = -(t * 420 + idx * 75);
        return (
          <path
            key={idx}
            d={`M 320 ${wy} Q 540 ${wy - 22} 760 ${wy} T 1045 ${wy}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray="65 38"
            strokeDashoffset={dashOffset}
          />
        );
      })}

      {/* Dispersing CO2 Puffs Blowing Away */}
      {[0, 1, 2, 3].map((idx) => {
        const cx = lerp(420 + idx * 45, 920 + idx * 30, pushEase);
        const cy = 240 + idx * 55 + Math.sin(t * 6 + idx) * 18;
        const opacity = Math.max(0.08, 1 - pushEase * 0.9);
        return (
          <g key={idx} opacity={opacity}>
            <circle cx={cx} cy={cy} r={lerp(30, 14, pushEase)} fill="#bae6fd" stroke={INK} strokeWidth={3.5} />
            <text x={cx} y={cy + 5} textAnchor="middle" fill={INK} fontSize={14} fontWeight={800} fontFamily={FONT}>
              CO₂
            </text>
          </g>
        );
      })}

      {/* Electric Desk Fan on Left */}
      <g transform="translate(205, 345)">
        {/* Stand & Base */}
        <rect x={-18} y={118} width={36} height={95} rx={10} fill="#94a3b8" stroke={INK} strokeWidth={5} />
        <rect x={-90} y={200} width={180} height={36} rx={18} fill="#0284c7" stroke={INK} strokeWidth={5} />
        {/* Outer Protective Cage */}
        <circle cx={0} cy={0} r={126} fill="#ffffff" stroke={INK} strokeWidth={6} />
        {/* Spinning Fan Blades */}
        <g transform={`rotate(${bladeAngle})`}>
          {[0, 120, 240].map((deg) => (
            <ellipse
              key={deg}
              cx={0}
              cy={-58}
              rx={30}
              ry={54}
              transform={`rotate(${deg})`}
              fill="#38bdf8"
              stroke={INK}
              strokeWidth={4.5}
            />
          ))}
        </g>
        {/* Center Cap */}
        <circle cx={0} cy={0} r={24} fill="#0284c7" stroke={INK} strokeWidth={5} />
      </g>

      {/* Mosquito Being Blown Backward */}
      <CartoonMosquito
        x={mosquitoX}
        y={mosquitoY}
        t={t}
        scale={1.35}
        rotation={mosquitoRot}
      />

      {/* Bottom Info Banner */}
      <rect x={360} y={548} width={670} height={58} rx={20} fill="#ffffff" stroke={INK} strokeWidth={4.5} />
      <text x={695} y={585} textAnchor="middle" fill={INK} fontSize={22} fontWeight={800} fontFamily={FONT}>
        Gió quạt thổi tan khí CO₂ &amp; đẩy muỗi bay giật lùi!
      </text>
    </CardFrame>
  );
};

// ============================================================================
// 11. MosquitoPreventionCheckVisual (key: MOSQUITO_PREVENTION_CHECK)
// ============================================================================

export const MosquitoPreventionCheckVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);

  const check1 = easeOutBack(subProgress(p, 0.12, 0.36));
  const check2 = easeOutBack(subProgress(p, 0.42, 0.66));
  const check3 = easeOutBack(subProgress(p, 0.72, 0.96));

  const cards = [
    { x: 205, title: 'Tắm sạch mồ hôi', sub: 'Giảm mùi a-xít lắc-tích', bg: '#e0f2fe', check: check1 },
    { x: 560, title: 'Mặc áo sáng màu', sub: 'Tránh áo đen & đỏ đậm', bg: '#fef9c3', check: check2 },
    { x: 915, title: 'Bật quạt & úp nước', sub: 'Đuổi muỗi & diệt lăng quăng', bg: '#dcfce7', check: check3 },
  ];

  return (
    <CardFrame
      title="3 Bí Kíp Phòng Muỗi Cực Hiệu Quả"
      badge="CHECKLIST AN TOÀN"
      badgeBg="#16a34a"
      bg="#f8fafc"
    >
      {cards.map((c, idx) => (
        <g key={idx} transform={`translate(${c.x}, 380)`}>
          {/* Card Base */}
          <rect x={-152} y={-225} width={304} height={450} rx={28} fill={c.bg} stroke={INK} strokeWidth={5} />

          {/* Custom Icon Area */}
          <circle cx={0} cy={-64} r={88} fill="#ffffff" stroke={INK} strokeWidth={4.5} />

          {idx === 0 && (
            /* Showerhead + Water Drops */
            <g transform="translate(0, -68)">
              <path d="M -38 -42 Q 0 -64 36 -22" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
              <ellipse cx={28} cy={-16} rx={26} ry={12} transform="rotate(-35, 28, -16)" fill="#94a3b8" stroke={INK} strokeWidth={4} />
              {[-22, 0, 22].map((dx, di) => {
                const dy = ((t * 55 + di * 18) % 44);
                return (
                  <circle key={di} cx={dx + 8} cy={8 + dy} r={6} fill="#38bdf8" stroke={INK} strokeWidth={2.5} />
                );
              })}
            </g>
          )}

          {idx === 1 && (
            /* Crisp White T-Shirt */
            <g transform="translate(0, -64) scale(0.54)">
              <path
                d="M -68 -110 L -138 -62 L -110 -8 L -74 -22 L -74 118 L 74 118 L 74 -22 L 110 -8 L 138 -62 L 68 -110 Q 0 -78 -68 -110 Z"
                fill="#ffffff"
                stroke={INK}
                strokeWidth={8}
                strokeLinejoin="round"
              />
              <path d="M -48 -104 Q 0 -70 48 -104" fill="none" stroke={INK} strokeWidth={7} />
            </g>
          )}

          {idx === 2 && (
            /* Mini Spinning Fan + Overturned Water Bucket */
            <g transform="translate(0, -64)">
              {/* Mini Fan Left */}
              <g transform="translate(-32, -8)">
                <circle cx={0} cy={0} r={34} fill="#e0f2fe" stroke={INK} strokeWidth={4} />
                <g transform={`rotate(${(t * 540) % 360})`}>
                  {[0, 120, 240].map((d) => (
                    <ellipse key={d} cx={0} cy={-16} rx={8} ry={15} transform={`rotate(${d})`} fill="#0ea5e9" stroke={INK} strokeWidth={2.5} />
                  ))}
                </g>
                <circle cx={0} cy={0} r={7} fill={INK} />
              </g>
              {/* Overturned Bucket Right */}
              <g transform="translate(36, 14) rotate(160)">
                <path d="M -24 -22 L 24 -22 L 18 22 L -18 22 Z" fill="#f97316" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              </g>
            </g>
          )}

          {/* Title & Subtitle */}
          <text x={0} y={76} textAnchor="middle" fill={INK} fontSize={24} fontWeight={800} fontFamily={FONT}>
            {c.title}
          </text>
          <text x={0} y={110} textAnchor="middle" fill="#475569" fontSize={18} fontWeight={700} fontFamily={FONT}>
            {c.sub}
          </text>

          {/* Animated Green Checkmark Pop */}
          <g transform={`translate(0, 168) scale(${Math.max(0.001, c.check)})`}>
            <circle cx={0} cy={0} r={30} fill="#22c55e" stroke={INK} strokeWidth={4.5} />
            <path
              d="M -12 0 L -3 10 L 14 -10"
              fill="none"
              stroke="#ffffff"
              strokeWidth={6.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      ))}
    </CardFrame>
  );
};

// ============================================================================
// 12. MosquitoSummaryRadarVisual (key: MOSQUITO_SUMMARY_RADAR)
// ============================================================================

export const MosquitoSummaryRadarVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / (fps || 60);
  const p = clamp01(progress);
  const flight = easeOutCubic(p);

  const mosquitoX = lerp(120, 965, flight);
  const mosquitoY = 235 + Math.sin(flight * Math.PI * 3 + t * 4) * 20;

  const stages = [
    {
      x: 230,
      threshold: 0.15,
      tag: 'CHẶNG 1 • XA 50M',
      title: 'Khí CO₂',
      desc: 'Đánh hơi từ hơi thở',
      color: '#38bdf8',
    },
    {
      x: 560,
      threshold: 0.5,
      tag: 'CHẶNG 2 • GẦN 5M',
      title: 'Mùi mồ hôi & Màu áo',
      desc: 'A-xít da & áo tối màu',
      color: '#a855f7',
    },
    {
      x: 890,
      threshold: 0.82,
      tag: 'CHẶNG 3 • SÁT DA',
      title: 'Thân nhiệt',
      desc: 'Khóa mạch máu ấm',
      color: '#ef4444',
    },
  ];

  return (
    <CardFrame
      title="Hành Trình 3 Chặng Khóa Mục Tiêu Của Muỗi"
      badge="TỔNG KẾT RA-ĐA"
      badgeBg="#6366f1"
      bg="#f8fafc"
    >
      {/* Flight Track Line */}
      <line x1={120} y1={355} x2={965} y2={355} stroke="#cbd5e1" strokeWidth={10} strokeLinecap="round" />
      <line x1={120} y1={355} x2={mosquitoX} y2={355} stroke="#6366f1" strokeWidth={10} strokeLinecap="round" />

      {/* Dashed Aerial Path */}
      <path
        d="M 120 235 Q 340 185 560 235 T 965 235"
        fill="none"
        stroke="#94a3b8"
        strokeWidth={4.5}
        strokeDasharray="12 10"
        strokeLinecap="round"
      />

      {/* 3 Milestone Nodes & Cards */}
      {stages.map((st, idx) => {
        const active = flight >= st.threshold;
        const pulse = active ? 1 + Math.sin(t * 6 + idx) * 0.05 : 1;
        return (
          <g key={idx}>
            {/* Connector Stem */}
            <line x1={st.x} y1={355} x2={st.x} y2={410} stroke={INK} strokeWidth={4.5} />

            {/* Milestone Circle on Track */}
            <g transform={`translate(${st.x}, 355) scale(${pulse})`}>
              <circle
                cx={0}
                cy={0}
                r={26}
                fill={active ? st.color : '#e2e8f0'}
                stroke={INK}
                strokeWidth={5}
              />
              <text
                x={0}
                y={8}
                textAnchor="middle"
                fill={active ? '#ffffff' : '#64748b'}
                fontSize={22}
                fontWeight={900}
                fontFamily={FONT}
              >
                {idx + 1}
              </text>
            </g>

            {/* Stage Detail Card */}
            <g transform={`translate(${st.x}, 512)`}>
              <rect
                x={-148}
                y={-96}
                width={296}
                height={184}
                rx={24}
                fill={active ? '#ffffff' : '#f1f5f9'}
                stroke={active ? st.color : INK}
                strokeWidth={active ? 6 : 4.5}
              />
              <rect x={-124} y={-76} width={248} height={36} rx={14} fill={st.color} stroke={INK} strokeWidth={3.5} />
              <text x={0} y={-52} textAnchor="middle" fill="#ffffff" fontSize={16} fontWeight={800} fontFamily={FONT}>
                {st.tag}
              </text>
              <text x={0} y={14} textAnchor="middle" fill={INK} fontSize={23} fontWeight={900} fontFamily={FONT}>
                {st.title}
              </text>
              <text x={0} y={50} textAnchor="middle" fill="#475569" fontSize={18} fontWeight={700} fontFamily={FONT}>
                {st.desc}
              </text>
            </g>
          </g>
        );
      })}

      {/* Target Bullseye at Far Right */}
      <g transform="translate(1015, 235)">
        <circle cx={0} cy={0} r={34} fill="#fee2e2" stroke="#ef4444" strokeWidth={5} />
        <circle cx={0} cy={0} r={18} fill="#ef4444" stroke={INK} strokeWidth={3.5} />
        <circle cx={0} cy={0} r={6} fill="#ffffff" />
      </g>

      {/* Flying Mosquito */}
      <CartoonMosquito x={mosquitoX} y={mosquitoY} t={t} scale={1.25} flipX={true} rotation={4} />
    </CardFrame>
  );
};
