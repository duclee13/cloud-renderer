import React from 'react';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  CleanLabel,
  SharedStickman,
  CoachBusSeat,
  CoachBusExterior,
  BusCabinBackdrop,
} from './sayXeSharedAssets';
import type { EpisodeVisualProps } from './index';

/* ============================================================================
 * Shared internal vector helpers (consistent 2D educational style, camelCase)
 * ============================================================================ */

const BrainIcon: React.FC<{
  x: number;
  y: number;
  scale?: number;
  fill?: string;
  glowColor?: string;
  glowOpacity?: number;
  shakeX?: number;
}> = ({
  x,
  y,
  scale = 1,
  fill = '#fbcfe8',
  glowColor,
  glowOpacity = 0,
  shakeX = 0,
}) => (
  <g transform={`translate(${x + shakeX}, ${y}) scale(${scale})`}>
    {glowColor && glowOpacity > 0.01 ? (
      <circle cx="0" cy="-6" r="118" fill={glowColor} fillOpacity={glowOpacity} />
    ) : null}
    {/* Brain stem */}
    <path
      d="M-14 58 C-16 86 -6 106 8 112 L28 106 C20 90 20 72 24 54 Z"
      fill="#f9a8d4"
      stroke={INK}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    {/* Cerebellum */}
    <path
      d="M16 42 C46 38 74 52 72 74 C70 92 42 96 18 82 Z"
      fill="#f472b6"
      stroke={INK}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    {/* Main cerebrum silhouette */}
    <path
      d="M-86 12 C-102 -12 -96 -52 -66 -70 C-54 -96 -14 -106 18 -96 C54 -104 92 -82 98 -46 C112 -22 106 18 82 36 C68 54 34 62 6 58 C-28 66 -68 52 -86 12 Z"
      fill={fill}
      stroke={INK}
      strokeWidth="6"
      strokeLinejoin="round"
    />
    {/* Brain folds (sulci) */}
    <g fill="none" stroke={INK} strokeWidth="4.2" strokeLinecap="round">
      <path d="M-56 -34 C-38 -52 -12 -48 2 -32" />
      <path d="M-64 4 C-44 -10 -20 -6 -4 10" />
      <path d="M12 -64 C32 -72 56 -60 62 -40" />
      <path d="M18 -18 C42 -26 68 -14 72 8" />
      <path d="M-26 28 C-8 18 14 22 26 36" />
      <path d="M-22 -74 C-10 -58 -12 -38 -24 -26" />
    </g>
  </g>
);

const EyeIcon: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pupilOffsetX?: number;
  pupilOffsetY?: number;
  irisColor?: string;
}> = ({
  x,
  y,
  scale = 1,
  pupilOffsetX = -10,
  pupilOffsetY = 0,
  irisColor = '#0284c7',
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Eyeball almond shape */}
    <path
      d="M-112 0 C-74 -66 74 -66 112 0 C74 66 -74 66 -112 0 Z"
      fill="#ffffff"
      stroke={INK}
      strokeWidth="6"
      strokeLinejoin="round"
    />
    {/* Iris */}
    <circle
      cx={pupilOffsetX}
      cy={pupilOffsetY}
      r="42"
      fill={irisColor}
      stroke={INK}
      strokeWidth="4.5"
    />
    {/* Pupil */}
    <circle cx={pupilOffsetX} cy={pupilOffsetY} r="20" fill={INK} />
    {/* Specular highlight */}
    <circle cx={pupilOffsetX - 11} cy={pupilOffsetY - 12} r="8" fill="#ffffff" />
    <circle cx={pupilOffsetX + 10} cy={pupilOffsetY + 9} r="4" fill="#ffffff" />
    {/* Upper eyelid crease */}
    <path
      d="M-98 -24 C-56 -78 56 -78 98 -24"
      fill="none"
      stroke={INK}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </g>
);

const InnerEarDiagram: React.FC<{
  x: number;
  y: number;
  scale?: number;
  tiltDeg?: number;
  slosh?: number;
  activeAlert?: boolean;
}> = ({
  x,
  y,
  scale = 1,
  tiltDeg = 0,
  slosh = 0,
  activeAlert = false,
}) => {
  const fluidColor = activeAlert ? '#0ea5e9' : '#38bdf8';
  const canalFill = '#e0f2fe';
  const hairBend = slosh * 0.9;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale}) rotate(${tiltDeg})`}>
      {/* Outer circular lens backdrop */}
      <circle
        cx="0"
        cy="0"
        r="195"
        fill="#f0f9ff"
        stroke={activeAlert ? '#ef4444' : '#0284c7'}
        strokeWidth="6"
      />

      {/* Superior semicircular canal (top loop) */}
      <path
        d="M-56 -12 C-76 -122 24 -148 48 -44"
        fill="none"
        stroke={INK}
        strokeWidth="30"
        strokeLinecap="round"
      />
      <path
        d="M-56 -12 C-76 -122 24 -148 48 -44"
        fill="none"
        stroke={canalFill}
        strokeWidth="20"
        strokeLinecap="round"
      />
      {/* Fluid wave inside superior canal */}
      <path
        d={`M${-54 + slosh * 0.25} -22 C${-66 + slosh * 0.5} -106 ${16 + slosh * 0.5} -128 ${38 + slosh * 0.25} -50`}
        fill="none"
        stroke={fluidColor}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="46 18"
        strokeDashoffset={-slosh * 2.2}
      />

      {/* Posterior semicircular canal (left loop) */}
      <path
        d="M-64 16 C-154 2 -144 -96 -62 -76"
        fill="none"
        stroke={INK}
        strokeWidth="28"
        strokeLinecap="round"
      />
      <path
        d="M-64 16 C-154 2 -144 -96 -62 -76"
        fill="none"
        stroke={canalFill}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d={`M${-70 + slosh * 0.2} 10 C${-138 + slosh * 0.45} -2 ${-130 + slosh * 0.45} -82 ${-68 + slosh * 0.2} -70`}
        fill="none"
        stroke={fluidColor}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="38 16"
        strokeDashoffset={slosh * 2.4}
      />

      {/* Lateral semicircular canal (horizontal loop) */}
      <path
        d="M-68 18 C-146 66 -74 114 -12 58"
        fill="none"
        stroke={INK}
        strokeWidth="28"
        strokeLinecap="round"
      />
      <path
        d="M-68 18 C-146 66 -74 114 -12 58"
        fill="none"
        stroke={canalFill}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d={`M${-72 + slosh * 0.25} 24 C${-126 + slosh * 0.5} 62 ${-68 + slosh * 0.5} 98 ${-18 + slosh * 0.25} 56`}
        fill="none"
        stroke={fluidColor}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="34 14"
        strokeDashoffset={-slosh * 2.6}
      />

      {/* Vestibule chamber */}
      <ellipse
        cx="-24"
        cy="12"
        rx="44"
        ry="48"
        fill={canalFill}
        stroke={INK}
        strokeWidth="5.5"
      />
      {/* Fluid surface inside vestibule */}
      <path
        d={`M-62 ${12 - slosh * 0.35} Q-24 ${22 + slosh * 0.55} 14 ${12 + slosh * 0.35} L14 48 Q-24 62 -62 48 Z`}
        fill={fluidColor}
        fillOpacity="0.65"
      />

      {/* Sensory hair cells (stereocilia) bending with slosh */}
      {[-42, -24, -6].map((hx, idx) => (
        <path
          key={idx}
          d={`M${hx} 46 Q${hx + hairBend * 0.6} 24 ${hx + hairBend} 6`}
          fill="none"
          stroke={activeAlert ? '#dc2626' : '#0369a1'}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      ))}

      {/* Cochlea spiral (right side) */}
      <path
        d="M16 14 C64 -18 118 8 114 54 C110 92 64 106 38 78 C20 58 34 28 58 34 C76 38 78 60 62 66"
        fill="#fde68a"
        stroke={INK}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

/* ============================================================================
 * 1. SayXeCarInteriorPhoneVisual (b01 -> b02)
 * ============================================================================ */
export const SayXeCarInteriorPhoneVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const shakeY = Math.sin(t * 6.5) * 2.5;
  const boyLookTilt = Math.sin(t * 2.1) * 3 - 4;
  const grandpaLookTilt = Math.sin(t * 1.7 + 1.2) * 2.5 - 3;
  const phoneGlowPulse = 0.22 + Math.sin(t * 5) * 0.06;
  const boyTilt = s >= 1 ? lerp(boyLookTilt, 18, Math.min(1, p * 4 + 0.65)) : boyLookTilt;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <BusCabinBackdrop frame={frame} shakeY={shakeY}>
        {/* Left seat & Boy */}
        <CoachBusSeat x={560} y={700} scale={1.18} />
        <SharedStickman
          x={572}
          y={688}
          scale={1.18}
          role="BOY"
          mood={s >= 1 ? 'NEUTRAL' : 'HAPPY'}
          facing="RIGHT"
          seated={true}
          holdingPhone={s >= 1}
          headTiltDeg={boyTilt}
        />

        {/* Subtle blue screen glow when reading phone (b02) */}
        {s >= 1 ? (
          <g>
            <polygon
              points="655,615 588,505 636,488 672,600"
              fill="#38bdf8"
              fillOpacity={phoneGlowPulse}
            />
            {/* Tiny animated scroll bars next to phone */}
            {[0, 1, 2].map((i) => {
              const offset = ((frame * 0.8 + i * 12) % 36) - 18;
              return (
                <line
                  key={i}
                  x1={698}
                  y1={608 + offset * 0.5}
                  x2={722}
                  y2={608 + offset * 0.5}
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeOpacity={0.65}
                />
              );
            })}
          </g>
        ) : null}

        {/* Right seat & Grandpa (always looking out window happily) */}
        <CoachBusSeat x={1230} y={700} scale={1.18} />
        <SharedStickman
          x={1242}
          y={688}
          scale={1.18}
          role="GRANDPA"
          mood="HAPPY"
          facing="RIGHT"
          seated={true}
          holdingPhone={false}
          headTiltDeg={grandpaLookTilt}
          bubble={s === 0 ? 'Gió mát quá!' : undefined}
        />
      </BusCabinBackdrop>
    </svg>
  );
};

/* ============================================================================
 * 2. SayXeCarDizzyWavesVisual (b03 -> b04)
 * ============================================================================ */
export const SayXeCarDizzyWavesVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const tiltDeg = Math.sin(frame / 10) * 3;
  const shakeY = Math.sin(frame / 7) * 5;
  const spiralAngle = (frame * 5) % 360;
  const waveShift = Math.sin(t * 5.2) * 14;
  const headWobble = Math.sin(t * 4.2) * 5 + (s >= 1 ? 10 : 14);

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <BusCabinBackdrop frame={frame} shakeY={shakeY} tiltDeg={tiltDeg}>
        {/* Subtle motion-rocking arcs near upper window */}
        <g
          fill="none"
          stroke="#64748b"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.45"
        >
          <path d="M230 250 Q260 215 305 235" />
          <path d="M1690 250 Q1660 215 1615 235" />
        </g>

        {/* Center-left bus seat & Boy */}
        <CoachBusSeat x={890} y={700} scale={1.24} />
        <SharedStickman
          x={904}
          y={688 + (s === 0 ? 4 : 0)}
          scale={1.24}
          role="BOY"
          mood="DIZZY"
          facing="RIGHT"
          seated={true}
          holdingPhone={s === 0}
          sweating={s >= 1}
          headTiltDeg={headWobble}
          bubble={s === 0 ? 'Ôi choáng quá...' : undefined}
        />

        {/* Gentle dizzy spiral above head */}
        <g transform={`translate(904, 428) rotate(${spiralAngle})`}>
          <path
            d="M0 0 C8 -10 22 -8 24 4 C26 18 6 28 -10 22 C-28 16 -34 -8 -20 -24 C-4 -40 24 -38 36 -18"
            fill="none"
            stroke="#16a34a"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeOpacity={0.75 + p * 0.2}
          />
        </g>

        {/* Pale-green nausea waves around stomach when s >= 1 (b04) */}
        {s >= 1 ? (
          <g fill="none" stroke="#4ade80" strokeLinecap="round">
            {[0, 1, 2].map((i) => {
              const yBase = 605 + i * 26;
              const phase = waveShift * (i % 2 === 0 ? 1 : -1);
              return (
                <path
                  key={i}
                  d={`M${790 + phase} ${yBase} Q${845 + phase} ${yBase - 18} ${900 + phase} ${yBase} T${1010 + phase} ${yBase}`}
                  strokeWidth="6"
                  strokeOpacity={0.7 - i * 0.14}
                />
              );
            })}
            {/* Soft green queasy aura around torso */}
            <ellipse
              cx="904"
              cy="632"
              rx={95 + Math.sin(t * 4) * 8}
              ry={58 + Math.cos(t * 4) * 6}
              fill="#bbf7d0"
              fillOpacity="0.28"
              stroke="none"
            />
          </g>
        ) : null}
      </BusCabinBackdrop>
    </svg>
  );
};

/* ============================================================================
 * 3. SayXeCarStopBreatheVisual (b05 -> b06)
 * ============================================================================ */
export const SayXeCarStopBreatheVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const cloudDrift = (frame * 0.4) % 2100;
  const breathScale = 1 + Math.sin(t * 2.2) * 0.018;
  const breezeOffset = (frame * 3.8) % 240;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="sx3_sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="1920" height="760" fill="url(#sx3_sky)" />

      {/* Soft drifting clouds */}
      {[260, 980, 1620].map((cx, idx) => {
        const xPos = ((cx + cloudDrift) % 2100) - 140;
        const yPos = 175 + (idx % 2) * 55;
        return (
          <g key={idx} transform={`translate(${xPos}, ${yPos})`} fill="#ffffff" fillOpacity="0.9">
            <circle cx="0" cy="0" r="38" />
            <circle cx="38" cy="-12" r="44" />
            <circle cx="78" cy="2" r="34" />
          </g>
        );
      })}

      {/* Distant green hills */}
      <path
        d="M0 645 Q380 510 780 610 T1560 595 T1920 620 L1920 760 L0 760 Z"
        fill="#86efac"
        stroke={INK}
        strokeWidth="4"
      />

      {/* Roadside tree canopy */}
      <g transform="translate(1070, 445)">
        <rect x="-18" y="85" width="36" height="190" rx="8" fill="#92400e" stroke={INK} strokeWidth="5" />
        <circle cx="-55" cy="52" r="78" fill="#22c55e" stroke={INK} strokeWidth="5" />
        <circle cx="52" cy="56" r="74" fill="#16a34a" stroke={INK} strokeWidth="5" />
        <circle cx="0" cy="-12" r="88" fill="#4ade80" stroke={INK} strokeWidth="5" />
      </g>

      {/* Roadside grass shoulder & asphalt road */}
      <rect x="0" y="700" width="1920" height="75" fill="#4ade80" stroke={INK} strokeWidth="4" />
      <rect x="0" y="765" width="1920" height="315" fill="#64748b" stroke={INK} strokeWidth="5" />
      <line
        x1="0"
        y1="885"
        x2="1920"
        y2="885"
        stroke="#fef08a"
        strokeWidth="10"
        strokeDasharray="64 46"
      />

      {/* Parked standard blue-and-white Coach Bus */}
      <CoachBusExterior x={95} y={405} scale={1.26} wheelAngle={0} />

      {/* Boy standing on roadside taking a deep breath */}
      <g transform={`translate(1240, 650) scale(${breathScale}) translate(-1240, -650)`}>
        <SharedStickman
          x={1240}
          y={650}
          scale={1.26}
          role="BOY"
          mood={s >= 1 ? 'HAPPY' : 'NEUTRAL'}
          facing="RIGHT"
          seated={false}
          headTiltDeg={s >= 1 ? -4 : -8 + Math.sin(t * 2.2) * 3}
          bubble={s === 0 ? 'Hít sâu nào...' : undefined}
        />
      </g>

      {/* Fresh cool breeze ribbons */}
      <g fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round">
        {[0, 1, 2].map((i) => {
          const yLine = 420 + i * 38;
          const xStart = 1040 + ((breezeOffset + i * 70) % 240);
          return (
            <path
              key={i}
              d={`M${xStart} ${yLine} Q${xStart + 55} ${yLine - 18} ${xStart + 110} ${yLine} T${xStart + 185} ${yLine - 8}`}
              strokeOpacity={0.45 + 0.35 * Math.sin(t * 3 + i)}
            />
          );
        })}
      </g>

      {/* Grandpa handing a cool water bottle to Boy when s >= 1 (b06) */}
      {s >= 1 ? (
        <g opacity={clamp01(p * 3 + 0.5)}>
          <SharedStickman
            x={1520}
            y={650}
            scale={1.26}
            role="GRANDPA"
            mood="HAPPY"
            facing="LEFT"
            seated={false}
            holdingBottle={true}
            headTiltDeg={-3}
            bubble="Uống chút nước đi con!"
          />
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 4. SayXeEyeSeesStillVisual (b13 -> b14)
 * ============================================================================ */
export const SayXeEyeSeesStillVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const signalDashOffset = -(frame * 5) % 60;
  const brainGlow = s >= 1 ? 0.22 + Math.sin(t * 5) * 0.08 : 0;
  const floatY = Math.sin(frame / 22) * 4;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#f8fafc" />

      {/* Left card: Still objects seen by the eye (Phone + Bus Seat) */}
      <rect
        x="110"
        y="265"
        width="390"
        height="495"
        rx="32"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="4.5"
      />

      {/* Phone screen (completely still) */}
      <g transform="translate(260, 415)">
        <rect x="-64" y="-105" width="128" height="210" rx="20" fill="#1e293b" stroke={INK} strokeWidth="5" />
        <rect x="-52" y="-86" width="104" height="172" rx="10" fill="#e0f2fe" />
        <rect x="-36" y="-64" width="72" height="14" rx="5" fill="#0284c7" />
        <rect x="-36" y="-36" width="60" height="10" rx="4" fill="#64748b" />
        <rect x="-36" y="-14" width="70" height="10" rx="4" fill="#64748b" />
        <rect x="-36" y="8" width="52" height="10" rx="4" fill="#64748b" />
        <rect x="-36" y="34" width="72" height="36" rx="8" fill="#bae6fd" stroke="#0284c7" strokeWidth="3" />
      </g>

      {/* Stationary bus seat reference */}
      <CoachBusSeat x={385} y={665} scale={0.72} />

      {/* Sightlines from Eye to Phone & Seat */}
      <g stroke="#94a3b8" strokeWidth="3.5" strokeDasharray="10 10" fill="none">
        <line x1="655" y1="480" x2="345" y2="360" />
        <line x1="655" y1="510" x2="345" y2="500" />
        <line x1="655" y1="530" x2="445" y2="635" />
      </g>

      {/* Enlarged Eye looking left at the phone/seat */}
      <EyeIcon x={775} y={500 + floatY} scale={1.15} pupilOffsetX={-18} pupilOffsetY={2} />

      {/* Optic nerve pathway to Brain */}
      <path
        d="M915 500 C1050 500 1165 485 1300 485"
        fill="none"
        stroke={s >= 1 ? '#bbf7d0' : '#e2e8f0'}
        strokeWidth="22"
        strokeLinecap="round"
      />

      {/* Active green signal flow when s >= 1 (b14) */}
      {s >= 1 ? (
        <g>
          <path
            d="M915 500 C1050 500 1165 485 1300 485"
            fill="none"
            stroke="#22c55e"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="24 18"
            strokeDashoffset={signalDashOffset}
          />
          {/* Traveling signal packets */}
          {[0, 1, 2].map((i) => {
            const frac = ((t * 0.85 + i / 3) % 1);
            const px = lerp(920, 1295, frac);
            const py = lerp(500, 485, frac);
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r="13"
                fill="#16a34a"
                stroke="#ffffff"
                strokeWidth="3.5"
              />
            );
          })}
          {/* Arrowhead entering brain */}
          <polygon points="1312,485 1280,466 1280,504" fill="#16a34a" />
        </g>
      ) : null}

      {/* Brain on the right */}
      <BrainIcon
        x={1470}
        y={495 + floatY}
        scale={1.32}
        glowColor="#4ade80"
        glowOpacity={brainGlow}
      />

      {/* Clean label only when signal is active (b14) */}
      {s >= 1 ? (
        <g opacity={clamp01(p * 3 + 0.5)}>
          <CleanLabel
            x={1110}
            y={215}
            text="Mắt: Đang đứng yên"
            bg="#f0fdf4"
            color="#15803d"
            border="#16a34a"
            fontSize={30}
          />
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 5. SayXeInnerEarFluidVisual (b15 -> b16)
 * ============================================================================ */
export const SayXeInnerEarFluidVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const gentleTilt = Math.sin(t * 2.0) * lerp(1.5, 7, p);
  const strongSlosh = Math.sin(t * 6.5) * 20;
  const strongTilt = Math.sin(t * 4.5) * 11;
  const signalOffset = -(frame * 6) % 56;
  const floatY = Math.sin(frame / 22) * 4;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#f8fafc" />

      {s === 0 ? (
        <g>
          {/* Centered inner ear starting balanced -> gentle tilt */}
          <InnerEarDiagram
            x={960}
            y={525 + floatY}
            scale={1.32}
            tiltDeg={gentleTilt}
            slosh={Math.sin(t * 2.0) * 5 * p}
            activeAlert={false}
          />
          <CleanLabel
            x={960}
            y={185}
            text="Hệ tiền đình"
            bg="#f0f9ff"
            color="#0369a1"
            border="#0284c7"
            fontSize={30}
          />
        </g>
      ) : (
        <g>
          {/* Motion arrows showing strong sloshing around inner ear */}
          <g fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.75">
            <path d="M350 470 Q320 520 350 570" />
            <path d="M325 485 Q300 520 325 555" />
            <path d="M920 470 Q950 520 920 570" />
            <path d="M945 485 Q970 520 945 555" />
          </g>

          {/* Inner ear sloshing strongly */}
          <InnerEarDiagram
            x={635}
            y={525 + floatY}
            scale={1.22}
            tiltDeg={strongTilt}
            slosh={strongSlosh}
            activeAlert={true}
          />

          {/* Red vestibular nerve pathway shooting to brain */}
          <path
            d="M885 520 C1030 520 1140 500 1295 500"
            fill="none"
            stroke="#fecaca"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M885 520 C1030 520 1140 500 1295 500"
            fill="none"
            stroke="#ef4444"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="24 16"
            strokeDashoffset={signalOffset}
          />
          {[0, 1, 2].map((i) => {
            const frac = (t * 1.1 + i / 3) % 1;
            const px = lerp(890, 1290, frac);
            const py = lerp(520, 500, frac);
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r="13"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="3.5"
              />
            );
          })}
          <polygon points="1310,500 1278,480 1278,520" fill="#dc2626" />

          {/* Brain receiving red motion signal */}
          <BrainIcon
            x={1470}
            y={505 + floatY}
            scale={1.32}
            glowColor="#f87171"
            glowOpacity={0.22 + Math.sin(t * 8) * 0.08}
            shakeX={Math.sin(t * 14) * 3}
          />

          <CleanLabel
            x={960}
            y={185}
            text="Tai trong: Đang di chuyển"
            bg="#fef2f2"
            color="#b91c1c"
            border="#dc2626"
            fontSize={30}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 6. SayXeSensoryConflictVisual (b17 -> b18 -> b19)
 * ============================================================================ */
export const SayXeSensoryConflictVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const greenDash = -(frame * 5) % 52;
  const redDash = (frame * 5.5) % 52;
  const rightOpacity = s >= 1 ? 1 : 0.22;
  const isConflict = s >= 2;
  const flash = 0.55 + 0.45 * Math.sin(t * 15);
  const brainShake = isConflict ? Math.sin(t * 24) * 6 : 0;
  const floatY = Math.sin(frame / 22) * 4;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#f8fafc" />

      {/* LEFT HALF: Eye -> Brain ("Đứng yên") */}
      <g opacity={1}>
        <EyeIcon x={270} y={520 + floatY} scale={1.08} pupilOffsetX={12} pupilOffsetY={0} />
        <path
          d="M405 520 L805 520"
          fill="none"
          stroke="#bbf7d0"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M405 520 L805 520"
          fill="none"
          stroke="#22c55e"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="22 14"
          strokeDashoffset={greenDash}
        />
        <polygon points="822,520 790,502 790,538" fill="#16a34a" />
        <CleanLabel
          x={575}
          y={415}
          text="Đứng yên"
          bg="#f0fdf4"
          color="#15803d"
          border="#16a34a"
          fontSize={28}
        />
      </g>

      {/* RIGHT HALF: Inner Ear -> Brain ("Đang di chuyển") */}
      <g opacity={rightOpacity}>
        <InnerEarDiagram
          x={1635}
          y={520 + floatY}
          scale={0.92}
          tiltDeg={s >= 1 ? Math.sin(t * 5) * 10 : 0}
          slosh={s >= 1 ? Math.sin(t * 6.5) * 18 : 0}
          activeAlert={s >= 1}
        />
        <path
          d="M1440 520 L1115 520"
          fill="none"
          stroke={s >= 1 ? '#fecaca' : '#cbd5e1'}
          strokeWidth="20"
          strokeLinecap="round"
        />
        {s >= 1 ? (
          <g>
            <path
              d="M1440 520 L1115 520"
              fill="none"
              stroke="#ef4444"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="22 14"
              strokeDashoffset={redDash}
            />
            <polygon points="1098,520 1130,502 1130,538" fill="#dc2626" />
          </g>
        ) : null}
        <CleanLabel
          x={1325}
          y={415}
          text="Đang di chuyển"
          bg="#fef2f2"
          color="#b91c1c"
          border="#dc2626"
          fontSize={28}
        />
      </g>

      {/* CENTER: Brain */}
      <BrainIcon
        x={960}
        y={520 + floatY}
        scale={1.34}
        glowColor={isConflict ? '#f59e0b' : undefined}
        glowOpacity={isConflict ? 0.28 * flash : 0}
        shakeX={brainShake}
      />

      {/* Conflict collision sparks right in the middle of the Brain (b19) */}
      {isConflict ? (
        <g>
          <g transform={`translate(0, ${floatY})`}>
            {/* Pulsing collision rings */}
            <circle
              cx="960"
              cy="515"
              r={64 + Math.sin(t * 10) * 14}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="6"
              strokeOpacity={flash}
            />
            {/* Jagged conflict lightning bolts */}
            <g fill="#facc15" stroke={INK} strokeWidth="4" strokeLinejoin="round" opacity={flash}>
              <polygon points="960,445 942,500 966,500 946,568 994,492 968,492" />
            </g>
            {/* Radiating spark lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
              const rad = (deg * Math.PI) / 180;
              const r1 = 92;
              const r2 = 122 + (idx % 2) * 12;
              return (
                <line
                  key={idx}
                  x1={960 + Math.cos(rad) * r1}
                  y1={515 + Math.sin(rad) * r1}
                  x2={960 + Math.cos(rad) * r2}
                  y2={515 + Math.sin(rad) * r2}
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeOpacity={0.5 + 0.5 * Math.sin(t * 14 + idx)}
                />
              );
            })}
          </g>
          <g opacity={clamp01(p * 3 + 0.5)}>
            <CleanLabel
              x={960}
              y={195}
              text="Xung đột giác quan"
              bg="#fffbeb"
              color="#b45309"
              border="#d97706"
              fontSize={32}
            />
          </g>
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 7. SayXeBrainPoisonAlarmVisual (b22 -> b23 -> b24)
 * ============================================================================ */
export const SayXeBrainPoisonAlarmVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const stickX = s >= 2 ? 520 : s === 1 ? 820 : 880;
  const stickScale = s >= 2 ? 1.22 : 1.32;
  const alertPulse = 0.55 + 0.45 * Math.sin(t * 12);
  const leafSway = Math.sin(t * 2.2) * 4;
  const floatY = Math.sin(frame / 22) * 4;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="sx7_sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#ecfccb" />
        </linearGradient>
      </defs>

      {/* Prehistoric natural sky & hills (NO vehicles, NO phones) */}
      <rect x="0" y="0" width="1920" height="1080" fill="url(#sx7_sky)" />
      <circle cx="290" cy="215" r="64" fill="#fde047" fillOpacity="0.85" />

      <path
        d="M0 640 Q420 480 860 595 T1680 565 L1920 600 L1920 1080 L0 1080 Z"
        fill="#86efac"
        stroke={INK}
        strokeWidth="4.5"
      />
      <path
        d="M0 740 Q560 705 1120 745 T1920 730 L1920 1080 L0 1080 Z"
        fill="#4ade80"
        stroke={INK}
        strokeWidth="4.5"
      />

      {/* Natural trees in background */}
      <g transform={`translate(240, 445) rotate(${leafSway * 0.4})`}>
        <rect x="-18" y="85" width="36" height="225" rx="8" fill="#92400e" stroke={INK} strokeWidth="5" />
        <circle cx="-48" cy="52" r="76" fill="#22c55e" stroke={INK} strokeWidth="5" />
        <circle cx="52" cy="58" r="72" fill="#16a34a" stroke={INK} strokeWidth="5" />
        <circle cx="0" cy="-14" r="88" fill="#4ade80" stroke={INK} strokeWidth="5" />
      </g>

      {s < 2 ? (
        <g transform={`translate(1610, 455) rotate(${-leafSway * 0.4})`}>
          <rect x="-18" y="85" width="36" height="215" rx="8" fill="#92400e" stroke={INK} strokeWidth="5" />
          <circle cx="-46" cy="54" r="70" fill="#16a34a" stroke={INK} strokeWidth="5" />
          <circle cx="48" cy="56" r="68" fill="#22c55e" stroke={INK} strokeWidth="5" />
          <circle cx="0" cy="-12" r="82" fill="#4ade80" stroke={INK} strokeWidth="5" />
        </g>
      ) : null}

      {/* Wild berry bush */}
      <g transform={`translate(${s >= 2 ? 730 : 1120}, 695)`}>
        <circle cx="-55" cy="12" r="56" fill="#15803d" stroke={INK} strokeWidth="4.5" />
        <circle cx="48" cy="14" r="52" fill="#16a34a" stroke={INK} strokeWidth="4.5" />
        <circle cx="0" cy="-22" r="64" fill="#22c55e" stroke={INK} strokeWidth="4.5" />
        {/* Wild purple-red berries */}
        {[
          [-34, -18],
          [-16, -34],
          [18, -28],
          [38, -6],
          [-6, 6],
          [26, 18],
        ].map(([bx, by], idx) => (
          <circle
            key={idx}
            cx={bx}
            cy={by}
            r="10"
            fill="#9333ea"
            stroke={INK}
            strokeWidth="3"
          />
        ))}
      </g>

      {/* Ancient Stickman (reusing SharedStickman cleanly, NO ugly trapezoid tunic/club) */}
      <SharedStickman
        x={stickX}
        y={650}
        scale={stickScale}
        role="ANCIENT"
        mood={s === 0 ? 'HAPPY' : 'DIZZY'}
        facing="RIGHT"
        seated={false}
        headTiltDeg={s === 0 ? Math.sin(t * 2) * 3 : Math.sin(t * 4.5) * 6 + 6}
      />

      {/* Wild berry cluster being eaten + dizzy halo when s >= 1 (b23 & b24) */}
      {s >= 1 ? (
        <g>
          {/* Berry cluster near hand/mouth */}
          <g transform={`translate(${stickX + 68}, 555)`}>
            <path d="M0 -18 Q10 -28 22 -20" fill="none" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="0" r="10" fill="#9333ea" stroke={INK} strokeWidth="3" />
            <circle cx="16" cy="4" r="10" fill="#a855f7" stroke={INK} strokeWidth="3" />
            <circle cx="8" cy="16" r="10" fill="#7e22ce" stroke={INK} strokeWidth="3" />
          </g>
          {/* Dizzy wavy lines around head */}
          <g
            transform={`translate(${stickX}, ${650 - 190 * stickScale})`}
            fill="none"
            stroke="#9333ea"
            strokeWidth="4.5"
            strokeLinecap="round"
          >
            <path d={`M-55 ${Math.sin(t * 6) * 5} Q-28 -18 0 0 T55 ${-Math.sin(t * 6) * 5}`} />
          </g>
        </g>
      ) : null}

      {/* Arrow to Brain with flashing warning icon when s >= 2 (b24) */}
      {s >= 2 ? (
        <g opacity={clamp01(p * 3 + 0.5)}>
          {/* Connecting arrow from head to brain */}
          <path
            d="M665 455 Q910 385 1145 470"
            fill="none"
            stroke="#dc2626"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="20 14"
            strokeDashoffset={-(frame * 4.5) % 68}
          />
          <polygon points="1165,478 1130,452 1122,486" fill="#dc2626" />

          {/* Brain on the right */}
          <BrainIcon
            x={1365}
            y={515 + floatY}
            scale={1.34}
            glowColor="#ef4444"
            glowOpacity={0.25 * alertPulse}
            shakeX={Math.sin(t * 20) * 4}
          />

          {/* Flashing warning triangle icon above/on brain */}
          <g transform={`translate(1365, ${365 + floatY}) scale(${0.95 + 0.1 * alertPulse})`}>
            <polygon
              points="0,-54 52,38 -52,38"
              fill="#facc15"
              stroke="#dc2626"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <line x1="0" y1="-22" x2="0" y2="8" stroke={INK} strokeWidth="9" strokeLinecap="round" />
            <circle cx="0" cy="24" r="5.5" fill={INK} />
          </g>

          <CleanLabel
            x={1365}
            y={205}
            text="Não tưởng bị trúng độc"
            bg="#fef2f2"
            color="#b91c1c"
            border="#dc2626"
            fontSize={30}
          />
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 8. SayXeStomachEjectNauseaVisual (b25 -> b26 -> b27)
 * ============================================================================ */
export const SayXeStomachEjectNauseaVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const downDash = -(frame * 5.5) % 48;
  const squeezeX = s >= 1 ? 1 + Math.sin(t * 7.5) * (s >= 2 ? 0.08 : 0.05) : 1;
  const squeezeY = s >= 1 ? 1 - Math.sin(t * 7.5) * (s >= 2 ? 0.07 : 0.04) : 1;
  const ejectTravel = (t * 1.15) % 1;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#f8fafc" />

      {/* Subtle anatomical torso silhouette container */}
      <path
        d="M720 845 L720 440 C720 380 790 350 865 340 L865 295 C865 170 1055 170 1055 295 L1055 340 C1130 350 1200 380 1200 440 L1200 845 Z"
        fill="#f1f5f9"
        stroke="#cbd5e1"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Esophagus tube connecting upper tract to stomach */}
      <path
        d="M942 335 L942 545 C942 575 955 590 978 595"
        fill="none"
        stroke="#fca5a5"
        strokeWidth="36"
        strokeLinecap="round"
      />
      <path
        d="M942 335 L942 545 C942 575 955 590 978 595"
        fill="none"
        stroke={INK}
        strokeWidth="42"
        strokeLinecap="round"
        strokeOpacity="0.18"
      />

      {/* Red nerve pathway from Brain downward along esophagus (b25+) */}
      <path
        d="M915 320 L915 555"
        fill="none"
        stroke="#ef4444"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="18 14"
        strokeDashoffset={downDash}
      />
      {[0, 1, 2].map((i) => {
        const frac = (t * 0.95 + i / 3) % 1;
        const py = lerp(330, 550, frac);
        return (
          <circle
            key={i}
            cx={915}
            cy={py}
            r="10"
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth="3"
          />
        );
      })}
      <polygon points="915,570 900,544 930,544" fill="#dc2626" />

      {/* Brain at top */}
      <BrainIcon
        x={960}
        y={235}
        scale={0.95}
        glowColor="#ef4444"
        glowOpacity={0.18 + Math.sin(t * 7) * 0.06}
      />

      {/* Stomach at bottom */}
      <g transform={`translate(990, 665) scale(${squeezeX}, ${squeezeY})`}>
        <path
          d="M-38 -78 C-12 -104 68 -96 102 -36 C132 18 112 96 42 112 C-24 126 -96 92 -106 34 C-112 -4 -86 -28 -52 -30 C-36 -32 -44 -60 -38 -78 Z"
          fill={s >= 1 ? '#dcfce7' : '#fed7aa'}
          stroke={INK}
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Green nausea waves inside stomach when s >= 1 (b26 & b27) */}
        {s >= 1 ? (
          <g fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round">
            <path
              d={`M-72 22 Q-32 ${4 + Math.sin(t * 6) * 10} 8 22 T84 22`}
            />
            <path
              d={`M-62 56 Q-24 ${40 - Math.sin(t * 6) * 10} 14 56 T76 56`}
              strokeOpacity="0.75"
            />
          </g>
        ) : null}
      </g>

      {/* Contraction squeeze arrows around stomach when s >= 1 */}
      {s >= 1 ? (
        <g fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${815 + Math.sin(t * 7.5) * 10} 665 L${852 + Math.sin(t * 7.5) * 10} 665`} />
          <polyline points={`${840 + Math.sin(t * 7.5) * 10},651 ${855 + Math.sin(t * 7.5) * 10},665 ${840 + Math.sin(t * 7.5) * 10},679`} />
          <path d={`M${1175 - Math.sin(t * 7.5) * 10} 665 L${1138 - Math.sin(t * 7.5) * 10} 665`} />
          <polyline points={`${1150 - Math.sin(t * 7.5) * 10},651 ${1135 - Math.sin(t * 7.5) * 10},665 ${1150 - Math.sin(t * 7.5) * 10},679`} />
        </g>
      ) : null}

      {/* Upward green ejection arrows from stomach through esophagus when s >= 2 (b27) */}
      {s >= 2 ? (
        <g opacity={clamp01(p * 3 + 0.5)}>
          {[0, 1, 2].map((i) => {
            const frac = (ejectTravel + i / 3) % 1;
            const ay = lerp(615, 365, frac);
            const alpha = Math.sin(frac * Math.PI);
            return (
              <g key={i} transform={`translate(955, ${ay})`} opacity={alpha}>
                <line x1="0" y1="26" x2="0" y2="-16" stroke="#16a34a" strokeWidth="10" strokeLinecap="round" />
                <polygon points="0,-30 -18,-6 18,-6" fill="#16a34a" />
              </g>
            );
          })}
          {/* Large clear upward reflex arrows flanking esophagus */}
          <g fill="#22c55e" stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
            <polygon
              points={`1030,${495 - Math.sin(t * 6) * 12} 1004,${532 - Math.sin(t * 6) * 12} 1020,${532 - Math.sin(t * 6) * 12} 1020,${585 - Math.sin(t * 6) * 12} 1040,${585 - Math.sin(t * 6) * 12} 1040,${532 - Math.sin(t * 6) * 12} 1056,${532 - Math.sin(t * 6) * 12}`}
            />
          </g>
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 9. SayXeReadBookVsWindowVisual (b30 -> b31 -> b32)
 * ============================================================================ */
export const SayXeReadBookVsWindowVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const leftActive = s < 2;
  const rightActive = s >= 2;
  const leftOpacity = leftActive ? 1 : 0.42;
  const rightOpacity = rightActive ? 1 : 0.24;
  const loupeScale = s === 1 ? lerp(0.85, 1, Math.min(1, p * 3 + 0.5)) : 1;
  const leftScroll = leftActive ? (frame * 2.5) % 960 : 0;
  const rightScroll = rightActive ? (frame * 2.5) % 960 : 0;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <clipPath id="sx9_leftClip">
          <rect x="0" y="0" width="956" height="1080" />
        </clipPath>
        <clipPath id="sx9_rightClip">
          <rect x="964" y="0" width="956" height="1080" />
        </clipPath>
        <clipPath id="sx9_rightWin">
          <rect x="1020" y="160" width="840" height="410" rx="28" />
        </clipPath>
        <clipPath id="sx9_leftWin">
          <rect x="60" y="160" width="840" height="410" rx="28" />
        </clipPath>
      </defs>

      {/* Base split backgrounds */}
      <rect x="0" y="0" width="960" height="1080" fill="#e2e8f0" />
      <rect x="960" y="0" width="960" height="1080" fill="#e2e8f0" />

      {/* ================= LEFT HALF: Reading phone/book (DIZZY) ================= */}
      <g clipPath="url(#sx9_leftClip)" opacity={leftOpacity}>
        {/* Left cabin window with full hills & trees (scrolls when active, frozen when inactive) */}
        <g clipPath="url(#sx9_leftWin)">
          <rect x="60" y="160" width="840" height="410" fill="#bae6fd" />
          <path
            d={`M${0 - leftScroll} 495 Q${240 - leftScroll} 410 ${480 - leftScroll} 495 T${960 - leftScroll} 495 T${1440 - leftScroll} 495 T${1920 - leftScroll} 495 L2040 570 L${0 - leftScroll} 570 Z`}
            fill="#4ade80"
            stroke={INK}
            strokeWidth="4"
          />
          {[180, 500, 820, 1140, 1460, 1780].map((tx, idx) => (
            <g key={idx} transform={`translate(${tx - leftScroll}, 455)`}>
              <rect x="-9" y="30" width="18" height="72" fill="#92400e" stroke={INK} strokeWidth="3.5" />
              <circle cx="0" cy="8" r="44" fill="#22c55e" stroke={INK} strokeWidth="4" />
            </g>
          ))}
        </g>
        <rect x="60" y="160" width="840" height="410" rx="28" fill="none" stroke={INK} strokeWidth="6" />
        <rect x="0" y="570" width="960" height="28" fill="#94a3b8" stroke={INK} strokeWidth="4.5" />
        <rect x="0" y="775" width="960" height="305" fill="#cbd5e1" stroke={INK} strokeWidth="4.5" />

        {/* Seat & Dizzy Boy reading phone */}
        <CoachBusSeat x={410} y={688} scale={1.06} />
        <SharedStickman
          x={422}
          y={676}
          scale={1.06}
          role="BOY"
          mood="DIZZY"
          facing="RIGHT"
          seated={true}
          holdingPhone={true}
          headTiltDeg={18}
        />

        {/* Magnifying glass zooming into static lines of text (b31) */}
        {s >= 1 ? (
          <g transform={`translate(690, 395) scale(${loupeScale})`}>
            {/* Dotted zoom connector from phone */}
            <line
              x1="-185"
              y1="215"
              x2="-78"
              y2="78"
              stroke="#0284c7"
              strokeWidth="4.5"
              strokeDasharray="10 8"
            />
            {/* Magnifier handle */}
            <line
              x1="76"
              y1="76"
              x2="138"
              y2="138"
              stroke={INK}
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Magnifier lens */}
            <circle cx="0" cy="0" r="112" fill="#ffffff" stroke={INK} strokeWidth="8" />
            <circle cx="0" cy="0" r="100" fill="#f8fafc" stroke="#38bdf8" strokeWidth="4" />
            {/* Completely stationary text lines inside lens */}
            <text
              x="0"
              y="-38"
              textAnchor="middle"
              fill={INK}
              fontSize="24"
              fontWeight="700"
              fontFamily={FONT}
            >
              Aa Bb Cc
            </text>
            <rect x="-68" y="-18" width="136" height="12" rx="6" fill="#475569" />
            <rect x="-68" y="8" width="118" height="12" rx="6" fill="#64748b" />
            <rect x="-68" y="34" width="130" height="12" rx="6" fill="#64748b" />
            <rect x="-68" y="60" width="92" height="12" rx="6" fill="#94a3b8" />
          </g>
        ) : null}
      </g>

      {/* ================= RIGHT HALF: Looking out window (HAPPY) ================= */}
      <g clipPath="url(#sx9_rightClip)" opacity={rightOpacity}>
        {/* Right cabin window with full hills & trees (scrolls when active, frozen when inactive) */}
        <g clipPath="url(#sx9_rightWin)">
          <rect x="1020" y="160" width="840" height="410" fill="#bae6fd" />
          <path
            d={`M${960 - rightScroll} 495 Q${1200 - rightScroll} 410 ${1440 - rightScroll} 495 T${1920 - rightScroll} 495 T${2400 - rightScroll} 495 T${2880 - rightScroll} 495 L3000 570 L${960 - rightScroll} 570 Z`}
            fill="#4ade80"
            stroke={INK}
            strokeWidth="4"
          />
          {[1140, 1460, 1780, 2100, 2420, 2740].map((tx, idx) => (
            <g key={idx} transform={`translate(${tx - rightScroll}, 455)`}>
              <rect x="-9" y="30" width="18" height="72" fill="#92400e" stroke={INK} strokeWidth="3.5" />
              <circle cx="0" cy="8" r="44" fill="#22c55e" stroke={INK} strokeWidth="4" />
            </g>
          ))}
        </g>
        <rect x="1020" y="160" width="840" height="410" rx="28" fill="none" stroke={INK} strokeWidth="6" />
        <rect x="960" y="570" width="960" height="28" fill="#94a3b8" stroke={INK} strokeWidth="4.5" />
        <rect x="960" y="775" width="960" height="305" fill="#cbd5e1" stroke={INK} strokeWidth="4.5" />

        {/* Seat & Happy Boy looking out window */}
        <CoachBusSeat x={1360} y={688} scale={1.06} />
        <SharedStickman
          x={1372}
          y={676}
          scale={1.06}
          role="BOY"
          mood="HAPPY"
          facing="RIGHT"
          seated={true}
          holdingPhone={false}
          headTiltDeg={-5 + Math.sin(t * 2) * 2.5}
        />

        {/* Subtle gaze lines out toward the scrolling trees when s >= 2 */}
        {s >= 2 ? (
          <g stroke="#16a34a" strokeWidth="4" strokeDasharray="10 10" strokeOpacity="0.65">
            <line x1="1425" y1="515" x2="1620" y2="410" />
            <line x1="1425" y1="528" x2="1655" y2="465" />
          </g>
        ) : null}
      </g>

      {/* Center vertical split divider */}
      <line x1="960" y1="0" x2="960" y2="1080" stroke={INK} strokeWidth="8" />
    </svg>
  );
};
