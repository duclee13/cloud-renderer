import React from 'react';
import type { EpisodeVisualProps } from './index';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  CleanLabel,
  ShortSpeechBubble,
  SharedStickman,
  WingedTermite,
  PorchNightBackdrop,
  SoilCutawayBackdrop,
} from './moiCanhSharedAssets';

/* ============================================================================
 * Internal vector helpers (consistent 2D educational style, camelCase)
 * ============================================================================ */

const WorkerTermite: React.FC<{
  x: number;
  y: number;
  scale?: number;
  angleDeg?: number;
}> = ({ x, y, scale = 1, angleDeg = 0 }) => (
  <g transform={`translate(${x}, ${y}) rotate(${angleDeg}) scale(${scale})`}>
    {/* Legs */}
    <g stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none">
      <path d="M-8 6 L-15 15" />
      <path d="M0 7 L-2 17" />
      <path d="M8 6 L14 15" />
      <path d="M-8 -6 L-15 -15" />
      <path d="M0 -7 L-2 -17" />
      <path d="M8 -6 L14 -15" />
    </g>
    {/* Abdomen */}
    <ellipse cx="-14" cy="0" rx="14" ry="8.5" fill="#fef3c7" stroke={INK} strokeWidth="2.8" />
    {/* Thorax */}
    <ellipse cx="3" cy="0" rx="7" ry="6" fill="#fde68a" stroke={INK} strokeWidth="2.6" />
    {/* Head */}
    <circle cx="15" cy="0" r="7.5" fill="#fcd34d" stroke={INK} strokeWidth="2.8" />
    {/* Antennae */}
    <path d="M21 -3 Q28 -9 33 -7" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <path d="M21 3 Q28 9 33 7" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </g>
);

const SoldierTermite: React.FC<{
  x: number;
  y: number;
  scale?: number;
  angleDeg?: number;
}> = ({ x, y, scale = 1, angleDeg = 0 }) => (
  <g transform={`translate(${x}, ${y}) rotate(${angleDeg}) scale(${scale})`}>
    {/* Legs */}
    <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
      <path d="M-10 7 L-18 17" />
      <path d="M-1 8 L-3 18" />
      <path d="M7 7 L14 16" />
      <path d="M-10 -7 L-18 -17" />
      <path d="M-1 -8 L-3 -18" />
      <path d="M7 -7 L14 -16" />
    </g>
    {/* Abdomen */}
    <ellipse cx="-16" cy="0" rx="13" ry="8" fill="#fef3c7" stroke={INK} strokeWidth="2.8" />
    {/* Thorax */}
    <ellipse cx="0" cy="0" rx="7" ry="6.2" fill="#f59e0b" stroke={INK} strokeWidth="2.6" />
    {/* Elongated amber soldier head */}
    <ellipse cx="15" cy="0" rx="11" ry="8.5" fill="#d97706" stroke={INK} strokeWidth="3" />
    {/* Curved dark mandibles */}
    <path d="M24 -4 Q35 -9 38 -2" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M24 4 Q35 9 38 2" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
    {/* Antennae */}
    <path d="M22 -7 Q28 -14 34 -13" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <path d="M22 7 Q28 14 34 13" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </g>
);

const DetachedWing: React.FC<{
  x: number;
  y: number;
  angleDeg?: number;
  scale?: number;
  opacity?: number;
}> = ({ x, y, angleDeg = 0, scale = 1, opacity = 0.85 }) => (
  <g transform={`translate(${x}, ${y}) rotate(${angleDeg}) scale(${scale})`} opacity={opacity}>
    <path
      d="M0 0 C14 -10 46 -11 64 -2 C50 9 18 10 0 0 Z"
      fill="#e0f2fe"
      fillOpacity="0.72"
      stroke="#94a3b8"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path d="M4 0 L54 -1" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
  </g>
);

/* ============================================================================
 * 1. MoiCanhHumidPorchLampVisual (MOICANH_HUMID_PORCH_LAMP)
 * ============================================================================ */
export const MoiCanhHumidPorchLampVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const lampDimFactor = activeStep === 2 ? lerp(1, 0, clamp01(p * 1.35)) : 1;
  const lampIsOn = activeStep < 2 || p < 0.45;
  const switchFlipped = activeStep === 2 && p >= 0.35;

  const swarmSpecs = [
    { rx: 160, ry: 72, speed: 2.8, phase: 0.0, scale: 0.72, dir: 1 },
    { rx: 215, ry: 95, speed: 2.3, phase: 0.9, scale: 0.78, dir: -1 },
    { rx: 135, ry: 60, speed: 3.4, phase: 1.7, scale: 0.66, dir: 1 },
    { rx: 260, ry: 112, speed: 2.0, phase: 2.4, scale: 0.82, dir: 1 },
    { rx: 185, ry: 82, speed: 2.9, phase: 3.1, scale: 0.7, dir: -1 },
    { rx: 295, ry: 126, speed: 1.85, phase: 3.9, scale: 0.76, dir: 1 },
    { rx: 115, ry: 52, speed: 3.8, phase: 4.5, scale: 0.64, dir: -1 },
    { rx: 240, ry: 102, speed: 2.45, phase: 5.2, scale: 0.8, dir: 1 },
    { rx: 325, ry: 138, speed: 1.7, phase: 0.4, scale: 0.74, dir: -1 },
    { rx: 150, ry: 68, speed: 3.1, phase: 1.3, scale: 0.68, dir: 1 },
    { rx: 205, ry: 90, speed: 2.6, phase: 2.1, scale: 0.75, dir: -1 },
    { rx: 275, ry: 118, speed: 2.15, phase: 2.8, scale: 0.79, dir: 1 },
    { rx: 125, ry: 56, speed: 3.55, phase: 3.6, scale: 0.65, dir: 1 },
    { rx: 340, ry: 145, speed: 1.65, phase: 4.3, scale: 0.73, dir: -1 },
    { rx: 175, ry: 78, speed: 3.0, phase: 5.0, scale: 0.71, dir: 1 },
    { rx: 230, ry: 98, speed: 2.5, phase: 5.8, scale: 0.77, dir: -1 },
    { rx: 285, ry: 122, speed: 1.95, phase: 0.7, scale: 0.8, dir: 1 },
    { rx: 142, ry: 64, speed: 3.25, phase: 1.9, scale: 0.67, dir: -1 },
    { rx: 310, ry: 132, speed: 1.8, phase: 3.3, scale: 0.75, dir: 1 },
    { rx: 195, ry: 86, speed: 2.7, phase: 4.8, scale: 0.72, dir: -1 },
  ];

  const fallingWings = [
    { x0: 710, y0: 360, drift: 26, rot: 22 },
    { x0: 780, y0: 320, drift: -22, rot: -35 },
    { x0: 845, y0: 410, drift: 18, rot: 48 },
    { x0: 910, y0: 340, drift: -30, rot: -15 },
    { x0: 980, y0: 385, drift: 24, rot: 65 },
    { x0: 1055, y0: 330, drift: -18, rot: -42 },
    { x0: 1120, y0: 395, drift: 28, rot: 14 },
    { x0: 1185, y0: 350, drift: -24, rot: 54 },
    { x0: 760, y0: 450, drift: 16, rot: -28 },
    { x0: 880, y0: 465, drift: -14, rot: 36 },
    { x0: 1020, y0: 440, drift: 20, rot: -52 },
    { x0: 1140, y0: 470, drift: -20, rot: 18 },
  ];

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id="mc1_lampGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="35%" stopColor="#e0f2fe" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mc1_lampCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="mc1_woodTop" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      <PorchNightBackdrop
        frame={frame}
        lampOn={lampIsOn}
        lampColor="WHITE"
        rainIntensity={0}
        showClouds={true}
      />

      {/* Smooth light cone & halo from white porch lamp (fades smoothly in step 2) */}
      <g opacity={lampDimFactor}>
        <polygon points="900,190 1020,190 1420,860 500,860" fill="url(#mc1_lampCone)" />
        <circle cx="960" cy="220" r="240" fill="url(#mc1_lampGlow)" />
      </g>

      {/* Wall light switch plate on right porch pillar */}
      <g transform="translate(1510, 470)">
        <rect x="-22" y="-36" width="44" height="72" rx="8" fill="#f1f5f9" stroke={INK} strokeWidth="4" />
        <rect
          x="-9"
          y={switchFlipped ? 2 : -18}
          width="18"
          height="20"
          rx="3"
          fill={switchFlipped ? '#64748b' : '#facc15'}
          stroke={INK}
          strokeWidth="3"
        />
        <circle cx="0" cy="-24" r="3" fill="#94a3b8" />
        <circle cx="0" cy="24" r="3" fill="#94a3b8" />
      </g>

      {/* Humid rising heat/vapor waves in step 0 */}
      {activeStep === 0 ? (
        <g fill="none" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" opacity="0.42">
          {[320, 490, 1340, 1540].map((wx, i) => {
            const dy = ((t * 36 + i * 28) % 90);
            const alpha = Math.sin((dy / 90) * Math.PI);
            return (
              <path
                key={i}
                d={`M${wx} ${740 - dy} Q${wx - 16} ${710 - dy} ${wx} ${680 - dy} T${wx} ${620 - dy}`}
                strokeOpacity={alpha * 0.75}
              />
            );
          })}
        </g>
      ) : null}

      {/* Wooden porch stools */}
      <g>
        <rect x="530" y="725" width="120" height="22" rx="6" fill="#92400e" stroke={INK} strokeWidth="4" />
        <line x1="550" y1="747" x2="542" y2="835" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        <line x1="630" y1="747" x2="638" y2="835" stroke={INK} strokeWidth="8" strokeLinecap="round" />

        <rect x="1150" y="725" width="120" height="22" rx="6" fill="#92400e" stroke={INK} strokeWidth="4" />
        <line x1="1170" y1="747" x2="1162" y2="835" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        <line x1="1250" y1="747" x2="1258" y2="835" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* Boy */}
      <SharedStickman
        x={590}
        y={690}
        scale={1.15}
        role="BOY"
        facing="RIGHT"
        pose={activeStep === 0 ? 'SIT' : activeStep === 1 ? 'POINT_UP' : 'COVER_HEAD'}
        expression={activeStep === 0 ? 'NEUTRAL' : activeStep === 1 ? 'SURPRISED' : 'WORRIED'}
        frame={frame}
      />

      {/* Grandpa: sits in step 0 & 1, stands & reaches wall switch in step 2 */}
      <SharedStickman
        x={activeStep === 2 ? lerp(1250, 1410, clamp01(p * 2.5)) : 1210}
        y={activeStep === 2 ? 660 : 690}
        scale={1.15}
        role="GRANDPA"
        facing={activeStep === 2 ? 'RIGHT' : 'LEFT'}
        pose={activeStep === 2 ? 'REACH_SWITCH' : 'SIT'}
        expression={activeStep === 0 ? 'HAPPY' : activeStep === 1 ? 'SURPRISED' : 'WORRIED'}
        frame={frame}
      />

      {/* Wooden tea table in front */}
      <g>
        <rect x="700" y="688" width="400" height="26" rx="8" fill="url(#mc1_woodTop)" stroke={INK} strokeWidth="4.5" />
        <rect x="735" y="714" width="22" height="122" rx="4" fill="#78350f" stroke={INK} strokeWidth="4" />
        <rect x="1043" y="714" width="22" height="122" rx="4" fill="#78350f" stroke={INK} strokeWidth="4" />
        {/* Teapot & cups */}
        <ellipse cx="900" cy="672" rx="28" ry="18" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
        <path d="M926 668 Q944 662 940 676" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M874 670 Q858 662 862 652" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <rect x="888" y="650" width="24" height="7" rx="3" fill="#cbd5e1" stroke={INK} strokeWidth="3" />
        <rect x="815" y="670" width="22" height="18" rx="4" fill="#f8fafc" stroke={INK} strokeWidth="3" />
        <rect x="965" y="670" width="22" height="18" rx="4" fill="#f8fafc" stroke={INK} strokeWidth="3" />
      </g>

      {/* Swarm of 20 WingedTermites orbiting bright porch lamp in step 1 & scattering in step 2 */}
      {activeStep >= 1 ? (
        <g>
          {swarmSpecs.map((sp, idx) => {
            const scatter = activeStep === 2 ? lerp(1, 2.35, clamp01(p * 1.25)) : 1;
            const theta = t * sp.speed * sp.dir + sp.phase;
            const rx = sp.rx * scatter;
            const ry = sp.ry * scatter;
            const tx = 960 + Math.cos(theta) * rx;
            const ty = 235 + Math.sin(theta) * ry;
            const vx = -Math.sin(theta) * rx * sp.dir;
            const vy = Math.cos(theta) * ry * sp.dir;
            const angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
            const fadeOut = activeStep === 2 ? lerp(1, 0.25, clamp01(p * 1.3)) : 1;
            return (
              <g key={idx} opacity={fadeOut}>
                <WingedTermite
                  x={tx}
                  y={ty}
                  scale={sp.scale}
                  angleDeg={angleDeg}
                  frame={frame}
                  phase={sp.phase}
                  wingsAttached={true}
                />
              </g>
            );
          })}
        </g>
      ) : null}

      {/* Shed wings drifting onto table & floor in step 2 */}
      {activeStep === 2 ? (
        <g>
          {fallingWings.map((w, idx) => {
            const wy = lerp(w.y0, 682 + (idx % 3) * 48, clamp01(p * 1.2 + (idx % 4) * 0.08));
            const wx = w.x0 + Math.sin(t * 3 + idx) * w.drift;
            return (
              <DetachedWing
                key={idx}
                x={wx}
                y={wy}
                angleDeg={w.rot + Math.sin(t * 4 + idx) * 18}
                scale={0.78}
                opacity={0.85}
              />
            );
          })}
        </g>
      ) : null}

      {/* Subtle room darkening overlay as lamp turns off in step 2 */}
      {activeStep === 2 ? (
        <rect
          x="0"
          y="0"
          width="1920"
          height="1080"
          fill="#020617"
          opacity={lerp(0, 0.38, clamp01(p * 1.35))}
        />
      ) : null}

      {/* Step speech bubbles (kept cleanly above y = 870) */}
      {activeStep === 0 ? (
        <ShortSpeechBubble x={560} y={405} text="Oi bức quá..." tailDir="LEFT" />
      ) : null}
      {activeStep === 1 ? (
        <ShortSpeechBubble x={560} y={405} text="Gì đông thế?!" tailDir="LEFT" />
      ) : null}
      {activeStep === 2 ? (
        <ShortSpeechBubble x={1355} y={375} text="Tắt đèn ngay!" tailDir="RIGHT" />
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 2. MoiCanhUndergroundColonyVisual (MOICANH_UNDERGROUND_COLONY)
 * ============================================================================ */
export const MoiCanhUndergroundColonyVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const queenPulse = 1 + Math.sin(t * 2.4) * 0.025;
  const exitGlowOpacity = activeStep >= 2 ? 0.35 + Math.sin(t * 4.5) * 0.18 : 0;

  const waitingAlatesLeft = [
    { x: 430, y: 405, a: -72 },
    { x: 485, y: 390, a: -82 },
    { x: 540, y: 382, a: -90 },
    { x: 595, y: 392, a: -98 },
    { x: 645, y: 410, a: -108 },
    { x: 495, y: 445, a: -80 },
    { x: 585, y: 448, a: -100 },
  ];
  const waitingAlatesRight = [
    { x: 1275, y: 410, a: -72 },
    { x: 1325, y: 392, a: -82 },
    { x: 1380, y: 382, a: -90 },
    { x: 1435, y: 390, a: -98 },
    { x: 1490, y: 405, a: -108 },
    { x: 1335, y: 448, a: -80 },
    { x: 1425, y: 445, a: -100 },
  ];

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id="mc2_tunnelGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mc2_queenBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="55%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>

      <SoilCutawayBackdrop
        frame={frame}
        rainOnTop={false}
        humidityGlow={activeStep >= 1}
      />

      {/* Underground tunnel network & chambers */}
      <g>
        {/* Connecting tunnels */}
        <path
          d="M540 275 L540 390 C540 530 680 650 820 675 M1380 275 L1380 390 C1380 530 1240 650 1100 675 M960 540 L960 660"
          fill="none"
          stroke="#451a03"
          strokeWidth="56"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M540 275 L540 390 C540 530 680 650 820 675 M1380 275 L1380 390 C1380 530 1240 650 1100 675 M960 540 L960 660"
          fill="none"
          stroke="#78350f"
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Closed soil exit plugs at surface */}
        <ellipse cx="540" cy="272" rx="34" ry="15" fill="#92400e" stroke={INK} strokeWidth="4" />
        <ellipse cx="1380" cy="272" rx="34" ry="15" fill="#92400e" stroke={INK} strokeWidth="4" />

        {/* Upper left & right waiting chambers */}
        <ellipse cx="540" cy="418" rx="168" ry="82" fill="#451a03" stroke="#290f02" strokeWidth="6" />
        <ellipse cx="540" cy="418" rx="154" ry="70" fill="#6b2f0e" />

        <ellipse cx="1380" cy="418" rx="168" ry="82" fill="#451a03" stroke="#290f02" strokeWidth="6" />
        <ellipse cx="1380" cy="418" rx="154" ry="70" fill="#6b2f0e" />

        {/* Deep central royal chamber */}
        <ellipse cx="960" cy="690" rx="285" ry="118" fill="#451a03" stroke="#290f02" strokeWidth="7" />
        <ellipse cx="960" cy="690" rx="268" ry="102" fill="#6b2f0e" />
      </g>

      {/* Step 2: Highlight glow connecting waiting alates to exit tunnels */}
      {activeStep >= 2 ? (
        <g opacity={clamp01(p * 2.5 + 0.3)}>
          <path
            d="M540 410 L540 278"
            fill="none"
            stroke="#fde047"
            strokeWidth="22"
            strokeLinecap="round"
            strokeOpacity={exitGlowOpacity}
          />
          <path
            d="M1380 410 L1380 278"
            fill="none"
            stroke="#fde047"
            strokeWidth="22"
            strokeLinecap="round"
            strokeOpacity={exitGlowOpacity}
          />
          <circle cx="540" cy="275" r="46" fill="url(#mc2_tunnelGlow)" opacity={exitGlowOpacity * 1.4} />
          <circle cx="1380" cy="275" r="46" fill="url(#mc2_tunnelGlow)" opacity={exitGlowOpacity * 1.4} />
          {/* Upward dashed exit cue arrows */}
          <path
            d="M540 365 L540 296"
            stroke="#fef08a"
            strokeWidth="6"
            strokeDasharray="10 8"
            strokeDashoffset={-(frame * 2.2) % 36}
          />
          <polygon points="540,282 527,304 553,304" fill="#fef08a" />
          <path
            d="M1380 365 L1380 296"
            stroke="#fef08a"
            strokeWidth="6"
            strokeDasharray="10 8"
            strokeDashoffset={-(frame * 2.2) % 36}
          />
          <polygon points="1380,282 1367,304 1393,304" fill="#fef08a" />
        </g>
      ) : null}

      {/* Deep chamber: Large pale Queen termite */}
      <g transform={`translate(950, 695) scale(${queenPulse})`}>
        {/* Elongated translucent-cream abdomen */}
        <ellipse cx="-24" cy="0" rx="112" ry="44" fill="url(#mc2_queenBody)" stroke={INK} strokeWidth="4.5" />
        {/* Soft abdominal segments */}
        {[-88, -56, -24, 8, 40].map((sx, idx) => (
          <path
            key={idx}
            d={`M${sx} -36 Q${sx + 8} 0 ${sx} 36`}
            fill="none"
            stroke="#d97706"
            strokeWidth="3"
            strokeOpacity="0.4"
          />
        ))}
        {/* Thorax & Head */}
        <ellipse cx="96" cy="2" rx="18" ry="14" fill="#f59e0b" stroke={INK} strokeWidth="3.8" />
        <circle cx="122" cy="2" r="14" fill="#d97706" stroke={INK} strokeWidth="3.8" />
        <path d="M134 -3 Q146 -11 154 -8" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M134 7 Q146 15 154 12" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      </g>

      {/* Egg clusters near Queen */}
      <g fill="#fefce8" stroke="#ca8a04" strokeWidth="1.8">
        {[
          [795, 730], [810, 736], [824, 728], [805, 720], [818, 742],
          [1105, 728], [1120, 735], [1132, 724], [1114, 718],
        ].map(([ex, ey], idx) => (
          <ellipse key={idx} cx={ex} cy={ey} rx="7.5" ry="5" />
        ))}
      </g>

      {/* Worker termites tending eggs & moving gently */}
      <WorkerTermite x={765 + Math.sin(t * 2.2) * 8} y={718} scale={0.95} angleDeg={14} />
      <WorkerTermite x={838 + Math.cos(t * 2.5) * 7} y={632} scale={0.9} angleDeg={22} />
      <WorkerTermite x={1095 - Math.sin(t * 2.3) * 8} y={640} scale={0.92} angleDeg={162} />
      <WorkerTermite x={1158 + Math.sin(t * 2.0) * 6} y={715} scale={0.92} angleDeg={-165} />
      <WorkerTermite x={715 + Math.sin(t * 2.6) * 9} y={615} scale={0.88} angleDeg={32} />

      {/* Soldier termites guarding tunnel junctions */}
      <SoldierTermite x={645} y={558 + Math.sin(t * 3) * 3} scale={1.08} angleDeg={-125} />
      <SoldierTermite x={1275} y={558 + Math.cos(t * 3) * 3} scale={1.08} angleDeg={-55} />
      <SoldierTermite x={960} y={558 + Math.sin(t * 2.8) * 3} scale={1.05} angleDeg={-90} />

      {/* Step 1+: 14 grown WingedTermites packed in upper waiting chambers */}
      {activeStep >= 1 ? (
        <g opacity={clamp01(activeStep > 1 ? 1 : p * 2.4 + 0.25)}>
          {waitingAlatesLeft.map((al, idx) => (
            <WingedTermite
              key={`l_${idx}`}
              x={al.x}
              y={al.y + Math.sin(t * 4 + idx) * 2.5}
              scale={0.74}
              angleDeg={al.a}
              frame={frame}
              phase={idx * 0.7}
              wingsAttached={true}
            />
          ))}
          {waitingAlatesRight.map((al, idx) => (
            <WingedTermite
              key={`r_${idx}`}
              x={al.x}
              y={al.y + Math.cos(t * 4 + idx) * 2.5}
              scale={0.74}
              angleDeg={al.a}
              frame={frame}
              phase={idx * 0.8 + 1.1}
              wingsAttached={true}
            />
          ))}
        </g>
      ) : null}

      {/* Clean scientific labels (all strictly above y = 870) */}
      <CleanLabel x={960} y={828} text="Mối chúa" bg="#fef3c7" color={INK} border="#d97706" fontSize={26} />
      <CleanLabel x={755} y={790} text="Mối thợ" bg="#fffbeb" color={INK} border="#b45309" fontSize={24} />
      <CleanLabel x={1250} y={625} text="Mối lính" bg="#ffedd5" color={INK} border="#ea580c" fontSize={24} />

      {activeStep >= 1 ? (
        <CleanLabel
          x={960}
          y={395}
          text="Mối cánh trưởng thành"
          bg="#e0f2fe"
          color="#0c4a6e"
          border="#0284c7"
          fontSize={27}
        />
      ) : null}

      {/* Step 2: Subtle calendar / 1-year growth badge */}
      {activeStep >= 2 ? (
        <g transform="translate(960, 140)" opacity={clamp01(p * 2.5 + 0.35)}>
          <rect x="-250" y="-42" width="500" height="84" rx="22" fill="#0f172a" fillOpacity="0.92" stroke="#fde047" strokeWidth="4" />
          {/* Mini calendar icon */}
          <g transform="translate(-202, 0)">
            <rect x="-24" y="-22" width="48" height="46" rx="7" fill="#ffffff" stroke={INK} strokeWidth="3" />
            <rect x="-24" y="-22" width="48" height="15" rx="5" fill="#ef4444" stroke={INK} strokeWidth="3" />
            <text x="0" y="14" textAnchor="middle" fill={INK} fontSize="18" fontWeight="800" fontFamily={FONT}>
              365
            </text>
          </g>
          <text
            x="24"
            y="10"
            textAnchor="middle"
            fill="#fef08a"
            fontSize="30"
            fontWeight="800"
            fontFamily={FONT}
          >
            Nuôi cả năm chờ 1 đêm
          </text>
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 3. MoiCanhWeatherTriggerVisual (MOICANH_WEATHER_TRIGGER)
 * ============================================================================ */
export const MoiCanhWeatherTriggerVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const barometerAngle = lerp(-35, -125, clamp01(p * 1.25));
  const humidityVal = Math.round(lerp(68, 88, clamp01(p * 1.3)));
  const humidityAngle = lerp(-120, 62, clamp01(p * 1.3));
  const treeSway = Math.sin(t * 2.6) * 8;

  if (activeStep === 0) {
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="mc3_stormSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="55%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="mc3_gardenGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>
        </defs>

        {/* Left: Darkening storm sky over damp garden */}
        <rect x="0" y="0" width="1920" height="1080" fill="url(#mc3_stormSky)" />

        {/* Heavy pre-rain clouds drifting */}
        {[170, 520, 820].map((cx, idx) => {
          const drift = Math.sin(t * 0.7 + idx) * 18;
          return (
            <g key={idx} transform={`translate(${cx + drift}, ${165 + (idx % 2) * 48})`} fill="#475569" stroke="#1e293b" strokeWidth="4">
              <circle cx="0" cy="0" r="68" />
              <circle cx="62" cy="-22" r="82" />
              <circle cx="136" cy="-6" r="70" />
              <circle cx="64" cy="24" r="62" />
            </g>
          );
        })}

        {/* Distant dark hills & swaying garden trees */}
        <path d="M0 645 Q300 570 610 635 T1050 640 L1050 1080 L0 1080 Z" fill="url(#mc3_gardenGround)" stroke={INK} strokeWidth="4" />
        {[210, 480, 760].map((tx, idx) => (
          <g key={idx} transform={`translate(${tx}, 630)`}>
            <rect x="-12" y="-120" width="24" height="130" rx="5" fill="#451a03" stroke={INK} strokeWidth="3.5" />
            <g transform={`rotate(${treeSway * (idx % 2 === 0 ? 1 : 0.8)}, 0, -110)`}>
              <circle cx="-36" cy="-145" r="56" fill="#15803d" stroke={INK} strokeWidth="4" />
              <circle cx="34" cy="-140" r="52" fill="#166534" stroke={INK} strokeWidth="4" />
              <circle cx="0" cy="-185" r="62" fill="#16a34a" stroke={INK} strokeWidth="4" />
            </g>
          </g>
        ))}

        {/* Damp garden mist ribbons */}
        <g fill="none" stroke="#93c5fd" strokeWidth="6" strokeLinecap="round" opacity="0.32">
          <path d={`M60 725 Q260 ${705 + Math.sin(t * 2) * 8} 460 725 T900 720`} />
          <path d={`M110 785 Q340 ${765 - Math.sin(t * 2) * 8} 580 785 T940 780`} />
        </g>

        {/* Right: Meteorological gauges panel */}
        <rect
          x="1050"
          y="95"
          width="800"
          height="745"
          rx="32"
          fill="#0f172a"
          fillOpacity="0.88"
          stroke="#475569"
          strokeWidth="5"
        />

        {/* Gauge 1: Barometer dropping */}
        <g transform="translate(1225, 235)">
          <circle cx="0" cy="0" r="82" fill="#f8fafc" stroke={INK} strokeWidth="6" />
          <path d="M-60 22 A64 64 0 0 1 60 22" fill="none" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
          <path d="M-60 22 A64 64 0 0 1 -16 -60" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
          <g transform={`rotate(${barometerAngle})`}>
            <line x1="0" y1="10" x2="0" y2="-56" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
          </g>
          <circle cx="0" cy="0" r="11" fill={INK} />
          <text x="0" y="52" textAnchor="middle" fill="#475569" fontSize="18" fontWeight="800" fontFamily={FONT}>
            hPa ↓
          </text>
        </g>
        <CleanLabel x={1575} y={235} text="Áp suất giảm" bg="#fee2e2" color="#991b1b" border="#ef4444" fontSize={30} />

        {/* Gauge 2: Thermometer warm ~28°C */}
        <g transform="translate(1225, 465)">
          <rect x="-22" y="-76" width="44" height="118" rx="22" fill="#f8fafc" stroke={INK} strokeWidth="5" />
          <circle cx="0" cy="52" r="32" fill="#f97316" stroke={INK} strokeWidth="5" />
          <rect x="-10" y={-44 + Math.sin(t * 2) * 3} width="20" height="94" rx="10" fill="#f97316" />
          {[-50, -30, -10, 10].map((ty, idx) => (
            <line key={idx} x1="26" y1={ty} x2="40" y2={ty} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          ))}
        </g>
        <CleanLabel x={1575} y={465} text="Ấm ~28°C" bg="#ffedd5" color="#9a3412" border="#f97316" fontSize={30} />

        {/* Gauge 3: Hygrometer rising past 85% */}
        <g transform="translate(1225, 695)">
          <circle cx="0" cy="0" r="82" fill="#f8fafc" stroke={INK} strokeWidth="6" />
          <path d="M-58 26 A64 64 0 1 1 58 26" fill="none" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
          <path d="M18 -60 A64 64 0 0 1 58 26" fill="none" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
          <g transform={`rotate(${humidityAngle})`}>
            <line x1="0" y1="10" x2="0" y2="-56" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
          </g>
          <circle cx="0" cy="0" r="11" fill={INK} />
          <text x="0" y="52" textAnchor="middle" fill="#0369a1" fontSize="22" fontWeight="800" fontFamily={FONT}>
            {humidityVal}%
          </text>
        </g>
        <CleanLabel x={1575} y={695} text="Độ ẩm > 80%" bg="#e0f2fe" color="#075985" border="#0284c7" fontSize={30} />
      </svg>
    );
  }

  if (activeStep === 1) {
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="mc3_drySunBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="mc3_humidNightBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* Left half: Harsh dry sun */}
        <rect x="0" y="0" width="960" height="1080" fill="url(#mc3_drySunBg)" />
        {/* Blazing sun */}
        <g transform="translate(210, 210)">
          <circle cx="0" cy="0" r="84" fill="#facc15" stroke="#ea580c" strokeWidth="6" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1={Math.cos((deg * Math.PI) / 180) * 102}
              y1={Math.sin((deg * Math.PI) / 180) * 102}
              x2={Math.cos((deg * Math.PI) / 180) * 145}
              y2={Math.sin((deg * Math.PI) / 180) * 145}
              stroke="#ea580c"
              strokeWidth="9"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Right half: Humid night mist */}
        <rect x="960" y="0" width="960" height="1080" fill="url(#mc3_humidNightBg)" />
        {/* Soft glowing humidity droplets */}
        {[
          [1160, 240], [1340, 185], [1560, 250], [1720, 340],
          [1240, 620], [1480, 560], [1690, 610], [1390, 380],
        ].map(([dx, dy], idx) => (
          <path
            key={idx}
            d={`M${dx} ${dy - 18 + Math.sin(t * 2.5 + idx) * 8} C${dx + 14} ${dy + 2} ${dx + 14} ${dy + 20} ${dx} ${dy + 20} C${dx - 14} ${dy + 20} ${dx - 14} ${dy + 2} ${dx} ${dy - 18 + Math.sin(t * 2.5 + idx) * 8} Z`}
            fill="#38bdf8"
            fillOpacity="0.55"
            stroke="#bae6fd"
            strokeWidth="2.5"
          />
        ))}

        {/* Center divider */}
        <line x1="960" y1="0" x2="960" y2="1080" stroke="#ffffff" strokeWidth="6" strokeDasharray="16 14" opacity="0.7" />

        {/* Large close-up WingedTermite spanning center */}
        <g>
          {/* Soft translucent body aura */}
          <ellipse cx="960" cy="485" rx="225" ry="125" fill="#ffffff" fillOpacity="0.16" />
          <WingedTermite
            x={960}
            y={485 + Math.sin(t * 3) * 6}
            scale={2.25}
            angleDeg={0}
            frame={frame}
            wingsAttached={true}
          />
        </g>

        {/* Moisture evaporation arrows on left dry half */}
        <g stroke="#dc2626" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.82">
          {[760, 825, 890].map((ex, idx) => {
            const dy = ((t * 55 + idx * 24) % 72);
            return (
              <path
                key={idx}
                d={`M${ex} ${430 - dy} Q${ex - 12} ${400 - dy} ${ex} ${375 - dy}`}
                strokeOpacity={Math.sin((dy / 72) * Math.PI)}
              />
            );
          })}
        </g>

        {/* Red X badge (left) & Green check badge (right) */}
        <g transform="translate(480, 705)">
          <circle cx="0" cy="0" r="44" fill="#ef4444" stroke="#ffffff" strokeWidth="5" />
          <path d="M-18 -18 L18 18 M18 -18 L-18 18" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        </g>
        <CleanLabel
          x={480}
          y={805}
          text="Nắng khô: Mất nước nhanh"
          bg="#fee2e2"
          color="#991b1b"
          border="#ef4444"
          fontSize={30}
        />

        <g transform="translate(1440, 705)">
          <circle cx="0" cy="0" r="44" fill="#22c55e" stroke="#ffffff" strokeWidth="5" />
          <polyline points="-20,2 -5,17 22,-16" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <CleanLabel
          x={1440}
          y={805}
          text="Đêm ẩm: An toàn"
          bg="#dcfce7"
          color="#166534"
          border="#22c55e"
          fontSize={30}
        />
      </svg>
    );
  }

  // step 2: Raindrops softening top soil layer ready for digging
  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="mc3_softSoil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b1d0a" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#5c2d0c" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <SoilCutawayBackdrop frame={frame} rainOnTop={true} humidityGlow={true} />

      {/* Darkened damp soft topsoil band soaking deeper with progress */}
      <rect
        x="0"
        y="275"
        width="1920"
        height={lerp(95, 220, clamp01(p * 1.3))}
        fill="url(#mc3_softSoil)"
      />

      {/* Water seepage droplets soaking into the damp soil */}
      {[260, 520, 780, 1080, 1360, 1640].map((sx, idx) => {
        const dropY = 295 + ((t * 68 + idx * 38) % 165);
        return (
          <circle
            key={idx}
            cx={sx}
            cy={dropY}
            r="7"
            fill="#38bdf8"
            fillOpacity={0.75 * Math.sin(((dropY - 295) / 165) * Math.PI)}
          />
        );
      })}

      {/* Illustrated new burrow pocket being easily dug into the softened earth */}
      <g transform="translate(960, 410)">
        <path
          d="M0 -132 C0 -65 35 -30 85 15 C120 45 125 95 75 118 C25 140 -45 115 -50 68 C-55 25 -15 -35 -18 -132 Z"
          fill="#290f02"
          fillOpacity="0.82"
          stroke="#fde047"
          strokeWidth="4.5"
          strokeDasharray="12 10"
        />
        <WingedTermite x={26} y={62} scale={0.95} angleDeg={18} frame={frame} wingsAttached={false} />
        {/* Downward digging arrow */}
        <line x1="0" y1="-115" x2="18" y2="-48" stroke="#fde047" strokeWidth="6" strokeLinecap="round" />
        <polygon points="22,-32 6,-54 30,-60" fill="#fde047" />
      </g>

      <CleanLabel
        x={960}
        y={765}
        text="Đất mềm: Dễ đào hang mới"
        bg="#fef3c7"
        color="#78350f"
        border="#f59e0b"
        fontSize={34}
      />
    </svg>
  );
};

/* ============================================================================
 * 4. MoiCanhSwarmEmergenceVisual (MOICANH_SWARM_EMERGENCE)
 * ============================================================================ */
export const MoiCanhSwarmEmergenceVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  if (activeStep === 2) {
    // Wide night garden view with multiple swarms & predator catching 1-2 while dozens escape
    const mounds = [340, 740, 1140, 1520];
    const tongueCycle = Math.max(0, Math.sin(t * 3.8));
    const tongueLen = tongueCycle > 0.72 ? lerp(0, 135, (tongueCycle - 0.72) / 0.28) : 0;

    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="mc4_wideSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="65%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#mc4_wideSky)" />

        {/* Subtle stars */}
        {[180, 420, 690, 1020, 1310, 1680, 1810].map((sx, idx) => (
          <circle
            key={idx}
            cx={sx}
            cy={95 + (idx % 3) * 58}
            r={idx % 2 === 0 ? 3 : 2}
            fill="#e2e8f0"
            opacity={0.45 + Math.sin(t * 3 + idx) * 0.25}
          />
        ))}

        {/* Garden silhouette bushes & ground */}
        <path
          d="M0 730 Q260 660 540 725 T1120 715 T1680 730 L1920 710 L1920 1080 L0 1080 Z"
          fill="#14532d"
          stroke={INK}
          strokeWidth="4"
        />
        <rect x="0" y="750" width="1920" height="330" fill="#1c1917" />

        {/* Multiple soil mounds with swarms rising */}
        {mounds.map((mx, mIdx) => (
          <g key={mIdx}>
            <path
              d={`M${mx - 72} 770 Q${mx} 705 ${mx + 72} 770 Z`}
              fill="#78350f"
              stroke={INK}
              strokeWidth="4"
            />
            <ellipse cx={mx} cy="738" rx="14" ry="7" fill="#1c1917" />
            {/* 6 rising WingedTermites per mound = 24 total escaping! */}
            {[0, 1, 2, 3, 4, 5].map((j) => {
              const frac = (t * 0.42 + j / 6 + mIdx * 0.17) % 1;
              const spreadX = Math.sin(j * 2.1 + mIdx) * 145 * frac;
              const tx = mx + spreadX;
              const ty = lerp(732, 165, frac);
              const angle = -90 + Math.sin(j * 2.1 + mIdx) * 28;
              return (
                <WingedTermite
                  key={j}
                  x={tx}
                  y={ty}
                  scale={lerp(0.55, 0.72, frac)}
                  angleDeg={angle}
                  frame={frame}
                  phase={j + mIdx}
                  wingsAttached={true}
                />
              );
            })}
          </g>
        ))}

        {/* Small garden frog on right catching 1 low termite */}
        <g transform="translate(1660, 755)">
          {/* Frog body */}
          <ellipse cx="0" cy="0" rx="56" ry="36" fill="#22c55e" stroke={INK} strokeWidth="4.5" />
          <ellipse cx="-24" cy="18" rx="22" ry="14" fill="#16a34a" stroke={INK} strokeWidth="4" />
          <ellipse cx="26" cy="20" rx="26" ry="16" fill="#16a34a" stroke={INK} strokeWidth="4" />
          {/* Frog eyes */}
          <circle cx="-32" cy="-26" r="14" fill="#ffffff" stroke={INK} strokeWidth="4" />
          <circle cx="-34" cy="-26" r="6" fill={INK} />
          <circle cx="-8" cy="-28" r="14" fill="#ffffff" stroke={INK} strokeWidth="4" />
          <circle cx="-10" cy="-28" r="6" fill={INK} />
          {/* Flicking pink tongue */}
          {tongueLen > 4 ? (
            <g>
              <line
                x1="-44"
                y1="-4"
                x2={-44 - tongueLen}
                y2={-4 - tongueLen * 0.55}
                stroke="#f472b6"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx={-44 - tongueLen} cy={-4 - tongueLen * 0.55} r="8" fill="#ec4899" />
            </g>
          ) : null}
        </g>

        <CleanLabel
          x={960}
          y={128}
          text="Bay đồng loạt để sống sót"
          bg="#0f172a"
          color="#fef08a"
          border="#facc15"
          fontSize={34}
        />
      </svg>
    );
  }

  // step 0 & step 1: Close-up of surface soil mounds at night
  const holeRadius = activeStep === 0 ? lerp(5, 28, clamp01(p * 1.25)) : 28;
  const emergenceStream = Array.from({ length: 18 }, (_, i) => ({
    mound: i % 2 === 0 ? 640 : 1280,
    phase: (i * 0.13) % 1,
    dir: i % 3 === 0 ? -1 : 1,
    spread: 110 + (i % 4) * 55,
  }));

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="mc4_nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1920" height="1080" fill="url(#mc4_nightSky)" />

      {/* Ground soil horizon */}
      <rect x="0" y="640" width="1920" height="440" fill="#451a03" stroke={INK} strokeWidth="5" />

      {/* Two large close-up soil mounds */}
      {[640, 1280].map((mx, idx) => (
        <g key={idx}>
          <path
            d={`M${mx - 230} 650 Q${mx - 90} 510 ${mx} 525 Q${mx + 95} 510 ${mx + 230} 650 Z`}
            fill="#78350f"
            stroke={INK}
            strokeWidth="6"
          />
          {/* Opening exit hole */}
          <ellipse cx={mx} cy="542" rx={holeRadius} ry={holeRadius * 0.52} fill="#0c0a09" stroke="#290f02" strokeWidth="4" />

          {/* Step 0: Worker termites pushing up soil crumbs */}
          {activeStep === 0 ? (
            <g>
              <WorkerTermite x={mx - 12} y={554 - Math.sin(t * 6 + idx) * 4} scale={0.9} angleDeg={-75} />
              <WorkerTermite x={mx + 14} y={556 - Math.cos(t * 6 + idx) * 4} scale={0.9} angleDeg={-105} />
              {[0, 1, 2, 3, 4].map((c) => {
                const frac = (t * 1.1 + c * 0.22 + idx * 0.3) % 1;
                const cx = mx + (c - 2) * 28 * frac;
                const cy = 536 - Math.sin(frac * Math.PI) * 58 + frac * 18;
                return (
                  <circle
                    key={c}
                    cx={cx}
                    cy={cy}
                    r={5 + (c % 2) * 2.5}
                    fill="#92400e"
                    stroke={INK}
                    strokeWidth="2"
                    opacity={1 - frac * 0.6}
                  />
                );
              })}
            </g>
          ) : null}

          {/* Step 1: Soldier termites ringing the exit hole guarding */}
          {activeStep === 1 ? (
            <g>
              <SoldierTermite x={mx - 58} y={556} scale={0.95} angleDeg={-155} />
              <SoldierTermite x={mx + 58} y={556} scale={0.95} angleDeg={-25} />
              <SoldierTermite x={mx - 36} y={584} scale={0.9} angleDeg={165} />
              <SoldierTermite x={mx + 36} y={584} scale={0.9} angleDeg={15} />
            </g>
          ) : null}
        </g>
      ))}

      {/* Step 1: Continuous upward stream of 18 WingedTermites launching diagonally */}
      {activeStep === 1 ? (
        <g>
          {emergenceStream.map((item, idx) => {
            const frac = (t * 0.48 + item.phase) % 1;
            const tx = item.mound + item.dir * item.spread * frac * 1.45;
            const ty = lerp(535, 115, frac);
            const angle = -90 + item.dir * 34;
            return (
              <WingedTermite
                key={idx}
                x={tx}
                y={ty}
                scale={lerp(0.68, 0.94, frac)}
                angleDeg={angle}
                frame={frame}
                phase={idx * 0.5}
                wingsAttached={true}
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 5. MoiCanhOldMoonMythVisual (MOICANH_OLD_MOON_MYTH)
 * ============================================================================ */
export const MoiCanhOldMoonMythVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  if (activeStep === 0) {
    // Classic textbook diagram: crescent moon + parallel rays -> spiraling into lamp
    const spiralT = (t * 0.35) % 1;
    const spiralAngle = lerp(0.4, Math.PI * 3.6, spiralT);
    const spiralR = lerp(245, 58, spiralT);
    const stx = 1360 + Math.cos(spiralAngle) * spiralR;
    const sty = 485 + Math.sin(spiralAngle) * spiralR;
    const tangAngle = ((spiralAngle + Math.PI / 2) * 180) / Math.PI;

    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <radialGradient id="mc5_lampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#facc15" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Textbook blueprint dark slate board */}
        <rect x="0" y="0" width="1920" height="1080" fill="#0f172a" />
        {/* Subtle blueprint grid */}
        <g stroke="#1e293b" strokeWidth="2">
          {Array.from({ length: 19 }, (_, i) => (
            <line key={`v${i}`} x1={(i + 1) * 100} y1="0" x2={(i + 1) * 100} y2="1080" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={(i + 1) * 100} x2="1920" y2={(i + 1) * 100} />
          ))}
        </g>

        {/* Crescent Moon in upper left */}
        <g transform="translate(275, 225)">
          <path
            d="M20 -72 A76 76 0 1 0 20 72 A58 58 0 1 1 20 -72 Z"
            fill="#fef08a"
            stroke="#facc15"
            strokeWidth="4"
          />
        </g>

        {/* Dashed parallel light rays from Moon */}
        <g stroke="#93c5fd" strokeWidth="4" strokeDasharray="14 12" opacity="0.65">
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={350 + i * 25}
              y1={205 + i * 65}
              x2={860 + i * 25}
              y2={395 + i * 65}
            />
          ))}
        </g>

        {/* Straight-line termite keeping fixed angle to moon rays */}
        <line x1="290" y1="620" x2="820" y2="545" stroke="#38bdf8" strokeWidth="5" strokeDasharray="10 10" />
        <WingedTermite
          x={lerp(330, 760, (t * 0.28) % 1)}
          y={lerp(614, 554, (t * 0.28) % 1)}
          scale={1.0}
          angleDeg={-8}
          frame={frame}
          wingsAttached={true}
        />

        {/* Divider arrow between Moon and Lamp */}
        <path d="M905 495 L1005 495" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
        <polygon points="1025,495 995,478 995,512" fill="#94a3b8" />

        {/* Right: Lamp with radial rays & inward spiral */}
        <circle cx="1360" cy="485" r="240" fill="url(#mc5_lampGlow)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1={1360 + Math.cos((deg * Math.PI) / 180) * 52}
            y1={485 + Math.sin((deg * Math.PI) / 180) * 52}
            x2={1360 + Math.cos((deg * Math.PI) / 180) * 230}
            y2={485 + Math.sin((deg * Math.PI) / 180) * 230}
            stroke="#fde047"
            strokeWidth="3"
            strokeDasharray="10 10"
            opacity="0.55"
          />
        ))}
        {/* Spiral path */}
        <path
          d="M1590 545 C1565 710 1330 755 1205 645 C1100 550 1125 360 1255 300 C1375 245 1515 320 1510 455 C1505 555 1405 605 1320 565 C1265 540 1265 450 1325 435"
          fill="none"
          stroke="#fb923c"
          strokeWidth="5.5"
          strokeDasharray="12 8"
        />
        {/* Bulb */}
        <circle cx="1360" cy="485" r="34" fill="#fef9c3" stroke={INK} strokeWidth="5" />
        {/* Spiraling termite */}
        <WingedTermite x={stx} y={sty} scale={0.95} angleDeg={tangAngle} frame={frame} wingsAttached={true} />

        <CleanLabel
          x={960}
          y={115}
          text="Giả thuyết cũ: Nhầm đèn là trăng"
          bg="#1e293b"
          color="#f8fafc"
          border="#64748b"
          fontSize={32}
        />
      </svg>
    );
  }

  // step 1 & step 2: 2024 high-speed 3D motion-capture lab scene
  const labAngle = t * 2.4;
  const bugX = 960 + Math.cos(labAngle) * 165;
  const bugY = 395 + Math.sin(labAngle) * 85;
  const strikeProg = activeStep === 2 ? clamp01(p * 1.8) : 0;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="mc5_labBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="mc5_bulbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#fde047" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="1920" height="1080" fill="url(#mc5_labBg)" />

      {/* 3D motion-capture floor grid */}
      <g stroke="#1e3a8a" strokeWidth="2.5" opacity="0.55">
        <line x1="160" y1="780" x2="1760" y2="780" />
        <line x1="280" y1="710" x2="1640" y2="710" />
        <line x1="400" y1="650" x2="1520" y2="650" />
        {[420, 620, 820, 960, 1100, 1300, 1500].map((gx, idx) => (
          <line key={idx} x1={gx} y1="650" x2={960 + (gx - 960) * 1.45} y2="850" />
        ))}
      </g>

      {/* Hanging lab bulb */}
      <line x1="960" y1="0" x2="960" y2="335" stroke="#64748b" strokeWidth="6" />
      <circle cx="960" cy="375" r="170" fill="url(#mc5_bulbGlow)" />
      <rect x="944" y="325" width="32" height="24" rx="5" fill="#475569" stroke={INK} strokeWidth="3" />
      <circle cx="960" cy="375" r="30" fill="#fef9c3" stroke={INK} strokeWidth="4.5" />

      {/* Cyan laser tracking cones from both cameras */}
      <polygon points="395,555 830,270 1090,515" fill="#06b6d4" fillOpacity="0.13" />
      <polygon points="1525,555 1090,270 830,515" fill="#06b6d4" fillOpacity="0.13" />
      <line x1="395" y1="555" x2={bugX} y2={bugY} stroke="#22d3ee" strokeWidth="3.5" strokeDasharray="10 8" />
      <line x1="1525" y1="555" x2={bugX} y2={bugY} stroke="#22d3ee" strokeWidth="3.5" strokeDasharray="10 8" />

      {/* 3D tracked orbit ellipse */}
      <ellipse
        cx="960"
        cy="395"
        rx="165"
        ry="85"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="4.5"
        strokeDasharray="14 10"
        strokeDashoffset={-(frame * 2.5) % 48}
      />

      {/* Tracked termite + bounding reticle */}
      <WingedTermite
        x={bugX}
        y={bugY}
        scale={1.0}
        angleDeg={((labAngle + Math.PI / 2) * 180) / Math.PI}
        frame={frame}
        wingsAttached={true}
      />
      <circle cx={bugX} cy={bugY} r="44" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="8 6" />

      {/* Left High-Speed Camera on Tripod */}
      <g transform="translate(340, 565)">
        <line x1="0" y1="35" x2="-68" y2="235" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
        <line x1="0" y1="35" x2="0" y2="245" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
        <line x1="0" y1="35" x2="68" y2="235" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
        <g transform="rotate(-16)">
          <rect x="-56" y="-34" width="102" height="68" rx="12" fill="#334155" stroke={INK} strokeWidth="5" />
          <rect x="46" y="-22" width="32" height="44" rx="6" fill="#0ea5e9" stroke={INK} strokeWidth="4.5" />
          <circle cx="-18" cy="-12" r="7" fill="#ef4444" />
        </g>
      </g>

      {/* Right High-Speed Camera on Tripod */}
      <g transform="translate(1580, 565)">
        <line x1="0" y1="35" x2="-68" y2="235" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
        <line x1="0" y1="35" x2="0" y2="245" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
        <line x1="0" y1="35" x2="68" y2="235" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
        <g transform="rotate(16)">
          <rect x="-46" y="-34" width="102" height="68" rx="12" fill="#334155" stroke={INK} strokeWidth="5" />
          <rect x="-78" y="-22" width="32" height="44" rx="6" fill="#0ea5e9" stroke={INK} strokeWidth="4.5" />
          <circle cx="18" cy="-12" r="7" fill="#ef4444" />
        </g>
      </g>

      {activeStep === 1 ? (
        <CleanLabel
          x={960}
          y={115}
          text="Camera tốc độ cao 2024"
          bg="#083344"
          color="#67e8f9"
          border="#06b6d4"
          fontSize={34}
        />
      ) : null}

      {/* Step 2: Red strikethrough over "Mê ánh sáng", revealing "Bẫy định hướng của não bộ" */}
      {activeStep === 2 ? (
        <g opacity={clamp01(p * 2.5 + 0.35)}>
          <rect x="190" y="610" width="1540" height="220" rx="28" fill="#0f172a" fillOpacity="0.94" stroke="#38bdf8" strokeWidth="4.5" />

          {/* Left: Crossed-out myth */}
          <g transform="translate(530, 720)">
            <rect x="-220" y="-48" width="440" height="96" rx="20" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
            <text x="0" y="12" textAnchor="middle" fill="#94a3b8" fontSize="34" fontWeight="800" fontFamily={FONT}>
              Mê ánh sáng
            </text>
            {/* Animated red strikethrough + X */}
            <line
              x1="-185"
              y1="0"
              x2={lerp(-185, 185, strikeProg)}
              y2="0"
              stroke="#ef4444"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <g transform="translate(-250, 0)">
              <circle cx="0" cy="0" r="34" fill="#ef4444" stroke="#ffffff" strokeWidth="4" />
              <path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
            </g>
          </g>

          {/* Center transition arrow */}
          <path d="M815 720 L925 720" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
          <polygon points="948,720 916,700 916,740" fill="#38bdf8" />

          {/* Right: True scientific mechanism */}
          <g transform="translate(1325, 720)">
            <rect x="-335" y="-54" width="670" height="108" rx="22" fill="#082f49" stroke="#38bdf8" strokeWidth="5" />
            <text x="0" y="13" textAnchor="middle" fill="#e0f2fe" fontSize="34" fontWeight="800" fontFamily={FONT}>
              Bẫy định hướng của não bộ
            </text>
          </g>
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 6. MoiCanhDorsalLightSkyVisual (MOICANH_DORSAL_LIGHT_SKY)
 * ============================================================================ */
export const MoiCanhDorsalLightSkyVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  if (activeStep === 0) {
    const hoverY = Math.sin(t * 3.2) * 10;
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="mc6_balanceBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="52%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#mc6_balanceBg)" />

        {/* Upper light hemisphere glow */}
        <ellipse cx="960" cy="110" rx="760" ry="210" fill="#bae6fd" fillOpacity="0.22" />

        {/* Horizontal horizon guide */}
        <line x1="240" y1="470" x2="1680" y2="470" stroke="#64748b" strokeWidth="3" strokeDasharray="12 12" opacity="0.5" />

        {/* Large close-up WingedTermite in mid-flight */}
        <WingedTermite
          x={960}
          y={470 + hoverY}
          scale={2.25}
          angleDeg={0}
          frame={frame}
          wingsAttached={true}
        />

        {/* Upward dorsal arrow */}
        <g transform={`translate(960, ${345 + hoverY})`}>
          <line x1="0" y1="0" x2="0" y2="-115" stroke="#fde047" strokeWidth="11" strokeLinecap="round" />
          <polygon points="0,-142 -24,-102 24,-102" fill="#fde047" />
        </g>
        <CleanLabel
          x={960}
          y={148}
          text="Lưng hướng lên sáng"
          bg="#fef9c3"
          color="#713f12"
          border="#eab308"
          fontSize={34}
        />

        {/* Downward ventral arrow */}
        <g transform={`translate(960, ${580 + hoverY})`}>
          <line x1="0" y1="0" x2="0" y2="105" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round" />
          <polygon points="0,132 -24,92 24,92" fill="#94a3b8" />
        </g>
        <CleanLabel
          x={960}
          y={775}
          text="Bụng hướng xuống đất"
          bg="#1e293b"
          color="#e2e8f0"
          border="#64748b"
          fontSize={34}
        />
      </svg>
    );
  }

  // step 1 & step 2: Wide natural night sky with luminous upper hemisphere vs dark ground
  const flyX = activeStep === 2 ? lerp(290, 1610, p) : 960;
  const flyY = 395 + Math.sin(t * 4) * 5;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="mc6_skyDome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
          <stop offset="55%" stopColor="#1d4ed8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="mc6_moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#bae6fd" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Luminous blue-silver upper sky */}
      <rect x="0" y="0" width="1920" height="630" fill="#0f172a" />
      <rect x="0" y="0" width="1920" height="630" fill="url(#mc6_skyDome)" />

      {/* Glowing moon & stars */}
      <circle cx="1520" cy="185" r="240" fill="url(#mc6_moonGlow)" />
      <circle cx="1520" cy="185" r="54" fill="#f8fafc" stroke="#bae6fd" strokeWidth="4" />
      {[190, 380, 620, 840, 1080, 1280, 1740].map((sx, idx) => (
        <circle
          key={idx}
          cx={sx}
          cy={115 + (idx % 3) * 72}
          r={idx % 2 === 0 ? 4 : 2.5}
          fill="#ffffff"
          opacity={0.6 + Math.sin(t * 2.8 + idx) * 0.3}
        />
      ))}

      {/* Dark ground silhouette below */}
      <path
        d="M0 610 Q320 555 680 605 T1360 595 T1920 615 L1920 1080 L0 1080 Z"
        fill="#090d16"
        stroke="#1e293b"
        strokeWidth="4"
      />
      <rect x="0" y="640" width="1920" height="440" fill="#050811" />

      {/* Step 1: Contrast callouts */}
      {activeStep === 1 ? (
        <g>
          <CleanLabel
            x={960}
            y={128}
            text="Tự nhiên: Trời luôn sáng hơn đất"
            bg="#e0f2fe"
            color="#0c4a6e"
            border="#38bdf8"
            fontSize={34}
          />
          <CleanLabel x={310} y={320} text="Bầu trời sáng" bg="#0284c7" color="#ffffff" border="#bae6fd" fontSize={26} />
          <CleanLabel x={310} y={745} text="Mặt đất tối" bg="#1e293b" color="#cbd5e1" border="#475569" fontSize={26} />
        </g>
      ) : null}

      {/* Step 2: Steady level flight from left to right with green trajectory line */}
      {activeStep === 2 ? (
        <g>
          <line
            x1="240"
            y1="395"
            x2={flyX}
            y2="395"
            stroke="#4ade80"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1={flyX}
            y1="395"
            x2="1680"
            y2="395"
            stroke="#4ade80"
            strokeWidth="5"
            strokeDasharray="16 14"
            opacity="0.45"
          />
          {/* Upward dorsal light reference arrow above flying termite */}
          <line x1={flyX} y1={flyY - 58} x2={flyX} y2={flyY - 118} stroke="#fde047" strokeWidth="6" strokeLinecap="round" />
          <polygon points={`${flyX},${flyY - 134} ${flyX - 13},${flyY - 110} ${flyX + 13},${flyY - 110}`} fill="#fde047" />
          <WingedTermite
            x={flyX}
            y={flyY}
            scale={1.32}
            angleDeg={0}
            frame={frame}
            wingsAttached={true}
          />
          <CleanLabel
            x={960}
            y={128}
            text="Bay thẳng, giữ thăng bằng ổn định"
            bg="#dcfce7"
            color="#166534"
            border="#22c55e"
            fontSize={34}
          />
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 7. MoiCanhLampTrapOrbitVisual (MOICANH_LAMP_TRAP_ORBIT)
 * ============================================================================ */
export const MoiCanhLampTrapOrbitVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const bulbX = 1150;
  const bulbY = 420;

  // Step 0 approaching termite
  const approachX = lerp(240, 815, p);
  const approachY = lerp(420, 405, p);

  // Step 1 orbiting termite with back strictly facing the bulb
  const orbitR = 235;
  const orbitTheta = -Math.PI - t * 2.15;
  const orbX = bulbX + Math.cos(orbitTheta) * orbitR;
  const orbY = bulbY + Math.sin(orbitTheta) * orbitR;
  // Back of WingedTermite points along local -Y; align local -Y toward bulb:
  // Vector termite->bulb = (-cos, -sin) -> angle = orbitTheta + PI -> local -Y at angleDeg - 90
  const orbAngleDeg = ((orbitTheta + Math.PI) * 180) / Math.PI + 90;

  // Step 2 chaotic orbiting termites
  const chaoticSwarm = [
    { rx: 165, ry: 120, tilt: -18, speed: 2.8, phase: 0.0, scale: 0.78 },
    { rx: 245, ry: 165, tilt: 14, speed: -2.2, phase: 0.8, scale: 0.82 },
    { rx: 205, ry: 185, tilt: 32, speed: 2.5, phase: 1.5, scale: 0.75 },
    { rx: 285, ry: 140, tilt: -26, speed: -1.9, phase: 2.3, scale: 0.8 },
    { rx: 140, ry: 110, tilt: 10, speed: 3.2, phase: 3.1, scale: 0.72 },
    { rx: 265, ry: 210, tilt: -8, speed: 2.1, phase: 3.9, scale: 0.84 },
    { rx: 190, ry: 145, tilt: 22, speed: -2.6, phase: 4.6, scale: 0.76 },
    { rx: 310, ry: 175, tilt: -14, speed: 1.85, phase: 5.4, scale: 0.79 },
    { rx: 225, ry: 130, tilt: 40, speed: -2.4, phase: 1.1, scale: 0.74 },
    { rx: 175, ry: 160, tilt: -34, speed: 2.9, phase: 2.9, scale: 0.77 },
    { rx: 255, ry: 195, tilt: 18, speed: -2.05, phase: 4.2, scale: 0.81 },
  ];

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id="mc7_bulbHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#fef08a" stopOpacity="0.62" />
          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dark night background */}
      <rect x="0" y="0" width="1920" height="1080" fill="#090d16" />

      {/* Hanging glowing porch bulb at (1150, 420) */}
      <line x1={bulbX} y1="0" x2={bulbX} y2={bulbY - 58} stroke="#64748b" strokeWidth="8" />
      <circle cx={bulbX} cy={bulbY} r="360" fill="url(#mc7_bulbHalo)" />
      <rect x={bulbX - 22} y={bulbY - 64} width="44" height="30" rx="6" fill="#475569" stroke={INK} strokeWidth="4" />
      <circle cx={bulbX} cy={bulbY} r="44" fill="#fef9c3" stroke={INK} strokeWidth="5" />

      {/* Step 0: Approaching termite & sudden sideways light vector hijack */}
      {activeStep === 0 ? (
        <g>
          {/* Fading sky vector */}
          <line
            x1={approachX}
            y1={approachY - 45}
            x2={approachX}
            y2={approachY - 125}
            stroke="#93c5fd"
            strokeWidth="5"
            strokeDasharray="8 8"
            opacity={lerp(0.85, 0.18, p)}
          />
          {/* Dominant sideways/downward light vector toward bulb */}
          <line
            x1={approachX + 42}
            y1={approachY}
            x2={lerp(approachX + 90, bulbX - 68, clamp01(p * 1.2))}
            y2={lerp(approachY, bulbY, clamp01(p * 1.2))}
            stroke="#facc15"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="14 10"
          />
          <polygon
            points={`${lerp(approachX + 108, bulbX - 52, clamp01(p * 1.2))},${bulbY} ${lerp(approachX + 82, bulbX - 78, clamp01(p * 1.2))},${bulbY - 16} ${lerp(approachX + 82, bulbX - 78, clamp01(p * 1.2))},${bulbY + 16}`}
            fill="#facc15"
          />
          <WingedTermite
            x={approachX}
            y={approachY}
            scale={1.35}
            angleDeg={lerp(0, 14, p)}
            frame={frame}
            wingsAttached={true}
          />
        </g>
      ) : null}

      {/* Step 1: Closed glowing orange/yellow orbit loop with back strictly locked toward bulb */}
      {activeStep === 1 ? (
        <g>
          <circle
            cx={bulbX}
            cy={bulbY}
            r={orbitR}
            fill="none"
            stroke="#f97316"
            strokeWidth="8"
            strokeDasharray="22 14"
            strokeDashoffset={-(frame * 3.2) % 72}
          />
          {/* Radial vector showing back locked onto the bulb */}
          <line
            x1={orbX}
            y1={orbY}
            x2={bulbX}
            y2={bulbY}
            stroke="#fde047"
            strokeWidth="5"
            strokeDasharray="10 8"
            opacity="0.8"
          />
          <WingedTermite
            x={orbX}
            y={orbY}
            scale={1.35}
            angleDeg={orbAngleDeg}
            frame={frame}
            wingsAttached={true}
          />
          <CleanLabel
            x={500}
            y={155}
            text="Nghiêng lưng → Bay vòng tròn"
            bg="#431407"
            color="#fed7aa"
            border="#f97316"
            fontSize={32}
          />
        </g>
      ) : null}

      {/* Step 2: 11 termites in chaotic banking orbits + 2 flipping upside-down & dropping */}
      {activeStep === 2 ? (
        <g>
          {chaoticSwarm.map((sp, idx) => {
            const ang = t * sp.speed + sp.phase;
            const lx = Math.cos(ang) * sp.rx;
            const ly = Math.sin(ang) * sp.ry;
            const rad = (sp.tilt * Math.PI) / 180;
            const tx = bulbX + lx * Math.cos(rad) - ly * Math.sin(rad);
            const ty = bulbY + lx * Math.sin(rad) + ly * Math.cos(rad);
            const backToBulbAngle = (Math.atan2(bulbY - ty, bulbX - tx) * 180) / Math.PI + 90;
            return (
              <WingedTermite
                key={idx}
                x={tx}
                y={ty}
                scale={sp.scale}
                angleDeg={backToBulbAngle}
                frame={frame}
                phase={sp.phase}
                wingsAttached={true}
              />
            );
          })}

          {/* 2 termites flipping upside-down beneath the bulb and dropping downward */}
          {[
            { bx: bulbX - 65, delay: 0.0 },
            { bx: bulbX + 75, delay: 0.45 },
          ].map((drop, idx) => {
            const frac = (t * 0.52 + drop.delay) % 1;
            const dy = lerp(bulbY + 95, 815, frac);
            const dx = drop.bx + Math.sin(t * 7 + idx) * 18;
            return (
              <g key={idx}>
                <line
                  x1={drop.bx}
                  y1={bulbY + 75}
                  x2={dx}
                  y2={dy - 24}
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeDasharray="8 8"
                  opacity="0.7"
                />
                <WingedTermite
                  x={dx}
                  y={dy}
                  scale={0.95}
                  angleDeg={180 + Math.sin(t * 9 + idx) * 24}
                  frame={frame}
                  phase={idx * 2}
                  wingsAttached={true}
                />
              </g>
            );
          })}

          <CleanLabel
            x={490}
            y={155}
            text="Loạn hướng & rơi kiệt sức"
            bg="#450a0a"
            color="#fecaca"
            border="#ef4444"
            fontSize={32}
          />
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 8. MoiCanhWhiteVsYellowLightVisual (MOICANH_WHITE_VS_YELLOW_LIGHT)
 * ============================================================================ */
export const MoiCanhWhiteVsYellowLightVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  // STRICT V20.2 SPLIT-SCREEN RULE:
  // step 0: Left active, Right dimmed (0.35) & COMPLETELY FROZEN (frame = 0)
  // step 1: Right active, Left dimmed (0.35) & COMPLETELY FROZEN (frame = 0)
  // step 2: Both active at full brightness
  const leftActive = activeStep === 0 || activeStep === 2;
  const rightActive = activeStep === 1 || activeStep === 2;

  const leftOpacity = leftActive ? 1 : 0.35;
  const rightOpacity = rightActive ? 1 : 0.35;

  const leftFrame = leftActive ? frame : 0;
  const rightFrame = rightActive ? frame : 0;

  const leftT = leftFrame / Math.max(1, fps);
  const rightT = rightFrame / Math.max(1, fps);

  const whiteSwarm = [
    { rx: 220, ry: 72, speed: 2.6, phase: 0.1, scale: 0.72, dir: 1 },
    { rx: 265, ry: 96, speed: 2.2, phase: 0.8, scale: 0.76, dir: -1 },
    { rx: 185, ry: 60, speed: 3.1, phase: 1.5, scale: 0.68, dir: 1 },
    { rx: 295, ry: 118, speed: 1.9, phase: 2.2, scale: 0.78, dir: 1 },
    { rx: 240, ry: 85, speed: 2.5, phase: 2.9, scale: 0.71, dir: -1 },
    { rx: 165, ry: 52, speed: 3.5, phase: 3.6, scale: 0.65, dir: 1 },
    { rx: 315, ry: 132, speed: 1.75, phase: 4.3, scale: 0.75, dir: -1 },
    { rx: 205, ry: 68, speed: 2.9, phase: 5.0, scale: 0.7, dir: 1 },
    { rx: 280, ry: 108, speed: 2.05, phase: 5.7, scale: 0.77, dir: -1 },
    { rx: 230, ry: 78, speed: 2.75, phase: 0.5, scale: 0.73, dir: 1 },
    { rx: 195, ry: 64, speed: 3.05, phase: 1.2, scale: 0.69, dir: -1 },
    { rx: 305, ry: 125, speed: 1.85, phase: 1.9, scale: 0.74, dir: 1 },
    { rx: 250, ry: 90, speed: 2.35, phase: 2.6, scale: 0.75, dir: -1 },
    { rx: 175, ry: 56, speed: 3.3, phase: 3.3, scale: 0.67, dir: 1 },
    { rx: 270, ry: 102, speed: 2.15, phase: 4.0, scale: 0.76, dir: -1 },
    { rx: 215, ry: 74, speed: 2.8, phase: 4.7, scale: 0.72, dir: 1 },
    { rx: 290, ry: 114, speed: 1.95, phase: 5.4, scale: 0.74, dir: -1 },
    { rx: 155, ry: 48, speed: 3.6, phase: 6.0, scale: 0.64, dir: 1 },
  ];

  const yellowPassers = [
    { yBase: 410, speed: 0.18, phase: 0.1, scale: 0.74 },
    { yBase: 515, speed: 0.14, phase: 0.55, scale: 0.7 },
    { yBase: 285, speed: 0.16, phase: 0.82, scale: 0.68 },
  ];

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <clipPath id="mc8_leftClip">
          <rect x="0" y="0" width="956" height="1080" />
        </clipPath>
        <clipPath id="mc8_rightClip">
          <rect x="964" y="0" width="956" height="1080" />
        </clipPath>
        <radialGradient id="mc8_whiteGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="40%" stopColor="#bae6fd" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mc8_yellowGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.88" />
          <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base dark canvas */}
      <rect x="0" y="0" width="1920" height="1080" fill="#090d16" />

      {/* ================= LEFT PANEL: Cool White/Blue Fluorescent Tube ================= */}
      <g clipPath="url(#mc8_leftClip)" opacity={leftOpacity}>
        <rect x="0" y="0" width="960" height="1080" fill="#0b1528" />

        {/* Cool white-blue glow */}
        <ellipse cx="480" cy="345" rx="370" ry="230" fill="url(#mc8_whiteGlow)" />

        {/* Fluorescent tube fixture */}
        <line x1="340" y1="0" x2="340" y2="318" stroke="#64748b" strokeWidth="6" />
        <line x1="620" y1="0" x2="620" y2="318" stroke="#64748b" strokeWidth="6" />
        <rect x="295" y="316" width="370" height="18" rx="6" fill="#475569" stroke={INK} strokeWidth="4" />
        <rect x="305" y="334" width="350" height="26" rx="13" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="4.5" />

        {/* 18 WingedTermites swarming densely (uses leftFrame -> frozen when inactive) */}
        {whiteSwarm.map((sp, idx) => {
          const theta = leftT * sp.speed * sp.dir + sp.phase;
          const tx = 480 + Math.cos(theta) * sp.rx;
          const ty = 355 + Math.sin(theta) * sp.ry;
          const vx = -Math.sin(theta) * sp.rx * sp.dir;
          const vy = Math.cos(theta) * sp.ry * sp.dir;
          const angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
          return (
            <WingedTermite
              key={idx}
              x={tx}
              y={ty}
              scale={sp.scale}
              angleDeg={angleDeg}
              frame={leftFrame}
              phase={sp.phase}
              wingsAttached={true}
            />
          );
        })}

        {/* Title & short-wavelength badge */}
        <CleanLabel x={480} y={115} text="Đèn trắng xanh" bg="#e0f2fe" color="#0c4a6e" border="#38bdf8" fontSize={34} />
        <CleanLabel
          x={480}
          y={710}
          text="Bước sóng ngắn (Xanh / UV)"
          bg="#082f49"
          color="#7dd3fc"
          border="#0284c7"
          fontSize={26}
        />

        {activeStep === 2 ? (
          <CleanLabel x={480} y={805} text="Thu hút mạnh" bg="#fee2e2" color="#991b1b" border="#ef4444" fontSize={32} />
        ) : null}
      </g>

      {/* ================= RIGHT PANEL: Warm Amber/Yellow Bulb ================= */}
      <g clipPath="url(#mc8_rightClip)" opacity={rightOpacity}>
        <rect x="960" y="0" width="960" height="1080" fill="#14100a" />

        {/* Warm amber glow */}
        <circle cx="1440" cy="355" r="300" fill="url(#mc8_yellowGlow)" />

        {/* Hanging warm amber bulb */}
        <line x1="1440" y1="0" x2="1440" y2="295" stroke="#78716c" strokeWidth="7" />
        <rect x="1420" y="292" width="40" height="28" rx="6" fill="#57534e" stroke={INK} strokeWidth="4" />
        <circle cx="1440" cy="355" r="46" fill="#fde047" stroke="#d97706" strokeWidth="5" />

        {/* Only 3 termites passing sparsely (uses rightFrame -> frozen when inactive) */}
        {yellowPassers.map((pItem, idx) => {
          const frac = (rightT * pItem.speed + pItem.phase) % 1;
          const tx = lerp(1040, 1840, frac);
          const ty = pItem.yBase + Math.sin(frac * Math.PI * 2 + idx) * 22;
          return (
            <WingedTermite
              key={idx}
              x={tx}
              y={ty}
              scale={pItem.scale}
              angleDeg={Math.cos(frac * Math.PI * 2 + idx) * 10}
              frame={rightFrame}
              phase={idx * 1.4}
              wingsAttached={true}
            />
          );
        })}

        {/* Title & long-wavelength badge */}
        <CleanLabel x={1440} y={115} text="Đèn vàng ấm" bg="#fef3c7" color="#78350f" border="#f59e0b" fontSize={34} />
        <CleanLabel
          x={1440}
          y={710}
          text="Bước sóng dài (Vàng / Cam)"
          bg="#451a03"
          color="#fde68a"
          border="#d97706"
          fontSize={26}
        />

        {activeStep === 2 ? (
          <CleanLabel x={1440} y={805} text="Ít thu hút hơn" bg="#dcfce7" color="#166534" border="#22c55e" fontSize={32} />
        ) : null}
      </g>

      {/* Center vertical split divider */}
      <line x1="960" y1="0" x2="960" y2="1080" stroke={INK} strokeWidth="8" />
    </svg>
  );
};

/* ============================================================================
 * 9. MoiCanhWingSheddingVisual (MOICANH_WING_SHEDDING)
 * ============================================================================ */
export const MoiCanhWingSheddingVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  if (activeStep === 0) {
    // Gliding down from night sky toward tiled porch floor + "10–15 phút bay"
    const glideX = lerp(350, 1020, p);
    const glideY = lerp(225, 625, p);
    const glideAngle = lerp(26, 4, p);

    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="mc9_nightBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1920" height="585" fill="url(#mc9_nightBg)" />

        {/* Tiled porch floor */}
        <rect x="0" y="585" width="1920" height="495" fill="#d6d3d1" stroke={INK} strokeWidth="5" />
        <g stroke="#a8a29e" strokeWidth="3.5">
          {[650, 730, 825].map((ty) => (
            <line key={ty} x1="0" y1={ty} x2="1920" y2={ty} />
          ))}
          {[220, 460, 700, 960, 1220, 1460, 1700].map((tx) => (
            <line key={tx} x1={tx} y1="585" x2={960 + (tx - 960) * 1.45} y2="1080" />
          ))}
        </g>

        {/* Glide trail */}
        <path
          d={`M350 225 Q680 390 ${glideX} ${glideY}`}
          fill="none"
          stroke="#bae6fd"
          strokeWidth="5"
          strokeDasharray="14 12"
          opacity="0.65"
        />

        <WingedTermite
          x={glideX}
          y={glideY}
          scale={1.45}
          angleDeg={glideAngle}
          frame={frame}
          wingsAttached={true}
        />

        {/* Subtle timer badge */}
        <g transform="translate(1520, 155)">
          <rect x="-210" y="-44" width="420" height="88" rx="22" fill="#0f172a" fillOpacity="0.92" stroke="#38bdf8" strokeWidth="4" />
          <circle cx="-158" cy="0" r="24" fill="#e0f2fe" stroke={INK} strokeWidth="3.5" />
          <line x1="-158" y1="0" x2="-158" y2="-13" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="-158" y1="0" x2="-146" y2="5" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
          <text x="26" y="11" textAnchor="middle" fill="#e0f2fe" fontSize="32" fontWeight="800" fontFamily={FONT}>
            10–15 phút bay
          </text>
        </g>
      </svg>
    );
  }

  if (activeStep === 1) {
    // Macro close-up: termite landing, arching abdomen slightly, 4 wings snapping cleanly off at suture
    const dropProg = clamp01(p * 1.4);
    const archAngle = Math.sin(clamp01(p * 1.6) * Math.PI) * -7;
    const snapPulse = p > 0.2 && p < 0.65 ? Math.sin(((p - 0.2) / 0.45) * Math.PI) : 0;

    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="mc9_macroBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1920" height="635" fill="url(#mc9_macroBg)" />
        {/* Warm macro porch tile surface */}
        <rect x="0" y="635" width="1920" height="445" fill="#e7e5e4" stroke={INK} strokeWidth="6" />
        <line x1="960" y1="635" x2="960" y2="1080" stroke="#a8a29e" strokeWidth="5" />
        <line x1="0" y1="775" x2="1920" y2="775" stroke="#a8a29e" strokeWidth="4" />

        {/* Soft ground contact shadow */}
        <ellipse cx="960" cy="672" rx="185" ry="26" fill="#0f172a" fillOpacity="0.22" />

        {/* Macro WingedTermite shedding all 4 wings cleanly */}
        <WingedTermite
          x={960}
          y={548}
          scale={2.55}
          angleDeg={archAngle}
          frame={frame}
          wingsAttached={true}
          wingDropProgress={dropProg}
        />

        {/* Suture snap callout ring & crisp micro-sparks */}
        <g transform="translate(972, 505)">
          <circle
            cx="0"
            cy="0"
            r="56"
            fill="none"
            stroke="#facc15"
            strokeWidth="5"
            strokeDasharray="12 9"
            opacity="0.88"
          />
          {snapPulse > 0.05 ? (
            <g stroke="#fde047" strokeWidth="6" strokeLinecap="round" opacity={snapPulse}>
              <line x1="-22" y1="-68" x2="-34" y2="-92" />
              <line x1="0" y1="-74" x2="0" y2="-102" />
              <line x1="22" y1="-68" x2="34" y2="-92" />
            </g>
          ) : null}
        </g>

        <CleanLabel
          x={960}
          y={145}
          text="Tự gãy rụng ở khớp cánh"
          bg="#fef9c3"
          color="#713f12"
          border="#eab308"
          fontSize={36}
        />
      </svg>
    );
  }

  // step 2: Morning sunlight slant on porch floor covered with dozens of scattered detached wings
  const scatteredWings = [
    { x: 260, y: 650, a: 18 }, { x: 340, y: 715, a: -42 }, { x: 420, y: 630, a: 64 },
    { x: 495, y: 765, a: -15 }, { x: 560, y: 680, a: 32 }, { x: 635, y: 795, a: -68 },
    { x: 700, y: 645, a: 12 }, { x: 775, y: 735, a: 85 }, { x: 840, y: 665, a: -26 },
    { x: 915, y: 785, a: 44 }, { x: 985, y: 700, a: -54 }, { x: 1055, y: 640, a: 22 },
    { x: 1125, y: 755, a: -12 }, { x: 1195, y: 685, a: 72 }, { x: 1270, y: 790, a: -38 },
    { x: 1345, y: 655, a: 28 }, { x: 1420, y: 740, a: -60 }, { x: 1490, y: 780, a: 16 },
    { x: 310, y: 790, a: 52 }, { x: 465, y: 705, a: -32 }, { x: 610, y: 730, a: 40 },
    { x: 740, y: 815, a: -18 }, { x: 880, y: 725, a: 66 }, { x: 1020, y: 805, a: -45 },
    { x: 1160, y: 715, a: 14 }, { x: 1310, y: 715, a: -22 }, { x: 1450, y: 680, a: 48 },
    { x: 530, y: 825, a: -75 }, { x: 675, y: 695, a: 36 }, { x: 815, y: 760, a: -48 },
  ];

  const scurryX = lerp(920, 1615, p);
  const scurryY = lerp(685, 618, p) + Math.sin(t * 14) * 3;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="mc9_morningWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="mc9_sunShaft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Morning sunlit porch wall & baseboard */}
      <rect x="0" y="0" width="1920" height="560" fill="url(#mc9_morningWall)" />
      <rect x="0" y="535" width="1920" height="34" fill="#b45309" stroke={INK} strokeWidth="4" />

      {/* Dark corner crack on the right where wingless termite heads */}
      <path d="M1685 569 L1745 569 L1730 538 L1695 545 Z" fill="#1c1917" />

      {/* Sunlit tiled porch floor */}
      <rect x="0" y="569" width="1920" height="511" fill="#f5f5f4" stroke={INK} strokeWidth="5" />
      <g stroke="#d6d3d1" strokeWidth="3.5">
        {[645, 735, 835].map((ty) => (
          <line key={ty} x1="0" y1={ty} x2="1920" y2={ty} />
        ))}
        {[240, 480, 720, 960, 1200, 1440, 1680].map((tx) => (
          <line key={tx} x1={tx} y1="569" x2={960 + (tx - 960) * 1.4} y2="1080" />
        ))}
      </g>

      {/* Warm morning sunlight diagonal shafts */}
      <polygon points="0,0 520,0 1320,880 580,880" fill="url(#mc9_sunShaft)" />
      <polygon points="620,0 920,0 1660,880 1380,880" fill="url(#mc9_sunShaft)" />

      {/* 30 scattered translucent detached termite wings across the porch floor */}
      {scatteredWings.map((w, idx) => (
        <DetachedWing key={idx} x={w.x} y={w.y} angleDeg={w.a} scale={0.86} opacity={0.88} />
      ))}

      {/* Wingless termite scurrying away toward the right corner */}
      <WingedTermite
        x={scurryX}
        y={scurryY}
        scale={1.15}
        angleDeg={-10}
        frame={frame}
        wingsAttached={false}
      />

      <CleanLabel
        x={960}
        y={135}
        text="Thảm cánh rụng sáng hôm sau"
        bg="#fffbeb"
        color="#78350f"
        border="#f59e0b"
        fontSize={36}
      />
    </svg>
  );
};
