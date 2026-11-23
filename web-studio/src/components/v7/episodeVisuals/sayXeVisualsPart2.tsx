import React from 'react';
import type { EpisodeVisualProps } from './index';

// ============================================================================
// Shared Style Constants & 60fps Math Helpers
// ============================================================================

const INK = '#1e293b';
const FONT = "'Be Vietnam Pro', 'Inter', 'Segoe UI', system-ui, sans-serif";

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const easeOutCubic = (t: number): number => {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
};

const easeOutBack = (t: number): number => {
  const c = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
};

const stepProgress = (progress: number, start: number, end: number): number => {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
};

// Reusable clean 2D Stickman Eyes (white sclera + dark pupil, NO anime sparkles)
const StickmanEyes: React.FC<{
  cx: number;
  cy: number;
  spacing?: number;
  eyeR?: number;
  pupilR?: number;
  lookX?: number;
  lookY?: number;
  dizzy?: boolean;
}> = ({
  cx,
  cy,
  spacing = 18,
  eyeR = 9,
  pupilR = 4.5,
  lookX = 0,
  lookY = 0,
  dizzy = false,
}) => {
  if (dizzy) {
    return (
      <g>
        {[-1, 1].map((side) => {
          const ex = cx + side * spacing;
          return (
            <g key={side}>
              <circle cx={ex} cy={cy} r={eyeR + 1} fill="#ffffff" stroke={INK} strokeWidth={3.5} />
              <path
                d={`M ${ex - 4} ${cy - 4} L ${ex + 4} ${cy + 4} M ${ex + 4} ${cy - 4} L ${ex - 4} ${cy + 4}`}
                stroke={INK}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>
    );
  }
  return (
    <g>
      {[-1, 1].map((side) => {
        const ex = cx + side * spacing;
        return (
          <g key={side}>
            <circle cx={ex} cy={cy} r={eyeR} fill="#ffffff" stroke={INK} strokeWidth={3.5} />
            <circle cx={ex + lookX} cy={cy + lookY} r={pupilR} fill={INK} />
          </g>
        );
      })}
    </g>
  );
};

// Reusable Green Checkmark Badge
const CheckBadge: React.FC<{
  cx: number;
  cy: number;
  r?: number;
  scale?: number;
}> = ({ cx, cy, r = 24, scale = 1 }) => (
  <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
    <circle cx={0} cy={0} r={r} fill="#22c55e" stroke={INK} strokeWidth={5} />
    <path
      d={`M ${-r * 0.42} ${r * 0.02} L ${-r * 0.1} ${r * 0.34} L ${r * 0.44} ${-r * 0.32}`}
      fill="none"
      stroke="#ffffff"
      strokeWidth={5.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

// ============================================================================
// 1. SayXeDriverPredictsVisual
// ============================================================================

export const SayXeDriverPredictsVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;
  // Smooth continuous left/right steering wave synced 100% with road curve & body lean
  const steer = Math.sin(t * 1.45);
  const wheelAngle = steer * 48;
  const curveX = steer * 240;
  const bodyLean = steer * 7;
  const roadDashOffset = -((frame * 14) % 120);

  const badgePop = easeOutBack(stepProgress(progress, 0.04, 0.22));
  const arrowPulse = 1 + 0.06 * Math.sin(t * 6);

  // Steering wheel center & hand anchor coordinates
  const wheelCx = 760;
  const wheelCy = 700;
  const wheelR = 112;
  const leftHandRad = ((205 + wheelAngle) * Math.PI) / 180;
  const rightHandRad = ((-25 + wheelAngle) * Math.PI) / 180;
  const leftHandX = wheelCx + Math.cos(leftHandRad) * wheelR;
  const leftHandY = wheelCy + Math.sin(leftHandRad) * wheelR;
  const rightHandX = wheelCx + Math.cos(rightHandRad) * wheelR;
  const rightHandY = wheelCy + Math.sin(rightHandRad) * wheelR;

  // Driver head & shoulder position
  const driverX = 760 + steer * 16;
  const headY = 475;
  const shoulderY = 565;

  // Prediction arrow direction matches steering sign
  const turningRight = steer >= 0;
  const arrowDir = turningRight ? 1 : -1;

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sx-driver-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <clipPath id="sx-driver-windshield">
          <path d="M 140 140 L 1780 140 L 1880 650 L 40 650 Z" />
        </clipPath>
      </defs>

      {/* Cabin outer dark frame (full bleed) */}
      <rect x={0} y={0} width={1920} height={1080} fill="#334155" />

      {/* Panoramic Windshield View */}
      <g clipPath="url(#sx-driver-windshield)">
        {/* Sky */}
        <rect x={0} y={130} width={1920} height={310} fill="url(#sx-driver-sky)" />

        {/* Distant rolling hills shifting smoothly with curve */}
        <path
          d={`M ${-200 - curveX * 0.25} 430 Q ${360 - curveX * 0.25} 300 ${860 - curveX * 0.25} 430 T ${1960 - curveX * 0.25} 430 L 2200 660 L -200 660 Z`}
          fill="#86efac"
          stroke={INK}
          strokeWidth={5}
        />
        <path
          d={`M ${-150 - curveX * 0.4} 450 Q ${620 - curveX * 0.4} 360 ${1220 - curveX * 0.4} 450 T ${2200 - curveX * 0.4} 450 L 2200 660 L -200 660 Z`}
          fill="#4ade80"
          stroke={INK}
          strokeWidth={5}
        />

        {/* Curved Highway */}
        <path
          d={`M ${960 + curveX} 415 Q ${960 + curveX * 0.35} 520 420 660 L 1500 660 Q ${960 + curveX * 0.35} 520 ${960 + curveX} 415 Z`}
          fill="#64748b"
          stroke={INK}
          strokeWidth={6}
        />
        {/* Road White Edge Lines */}
        <path
          d={`M ${960 + curveX} 415 Q ${960 + curveX * 0.35} 520 460 660`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <path
          d={`M ${960 + curveX} 415 Q ${960 + curveX * 0.35} 520 1460 660`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Animated Center Yellow Dashed Line */}
        <path
          d={`M ${960 + curveX} 418 Q ${960 + curveX * 0.35} 525 960 660`}
          fill="none"
          stroke="#facc15"
          strokeWidth={10}
          strokeDasharray="34 26"
          strokeDashoffset={roadDashOffset}
          strokeLinecap="round"
        />

        {/* Roadside Trees gliding smoothly */}
        {[0, 1, 2, 3].map((i) => {
          const cycle = ((frame * 0.018 + i * 0.25) % 1);
          const scale = 0.25 + cycle * 1.15;
          const yPos = lerp(420, 620, cycle * cycle);
          const leftX = lerp(890 + curveX, 170, cycle * cycle);
          const rightX = lerp(1030 + curveX, 1750, cycle * cycle);
          return (
            <g key={i}>
              <g transform={`translate(${leftX}, ${yPos}) scale(${scale})`}>
                <rect x={-9} y={0} width={18} height={42} fill="#92400e" stroke={INK} strokeWidth={5} />
                <circle cx={0} cy={-16} r={34} fill="#16a34a" stroke={INK} strokeWidth={5} />
              </g>
              <g transform={`translate(${rightX}, ${yPos}) scale(${scale})`}>
                <rect x={-9} y={0} width={18} height={42} fill="#92400e" stroke={INK} strokeWidth={5} />
                <circle cx={0} cy={-16} r={34} fill="#15803d" stroke={INK} strokeWidth={5} />
              </g>
            </g>
          );
        })}
      </g>

      {/* Windshield Frame Outline */}
      <path
        d="M 140 140 L 1780 140 L 1880 650 L 40 650 Z"
        fill="none"
        stroke={INK}
        strokeWidth={7}
        strokeLinejoin="round"
      />

      {/* Rearview Mirror */}
      <line x1={960} y1={140} x2={960} y2={185} stroke={INK} strokeWidth={7} />
      <rect x={850} y={180} width={220} height={48} rx={18} fill="#cbd5e1" stroke={INK} strokeWidth={6} />

      {/* Full-width Car Dashboard */}
      <path
        d="M 0 640 L 1920 640 L 1920 1080 L 0 1080 Z"
        fill="#475569"
        stroke={INK}
        strokeWidth={7}
      />
      {/* Instrument Cluster Hood */}
      <path
        d="M 560 640 Q 760 565 960 640 Z"
        fill="#1e293b"
        stroke={INK}
        strokeWidth={6}
      />
      {/* Speedometer & Tachometer dials */}
      <circle cx={690} cy={622} r={24} fill="#0f172a" stroke="#38bdf8" strokeWidth={4} />
      <circle cx={830} cy={622} r={24} fill="#0f172a" stroke="#22c55e" strokeWidth={4} />
      <line x1={690} y1={622} x2={704} y2={610} stroke="#facc15" strokeWidth={4} strokeLinecap="round" />
      <line x1={830} y1={622} x2={842} y2={612} stroke="#4ade80" strokeWidth={4} strokeLinecap="round" />

      {/* Steering Wheel (smoothly rotating 60fps) */}
      <g transform={`translate(${wheelCx}, ${wheelCy}) rotate(${wheelAngle})`}>
        <circle cx={0} cy={0} r={wheelR} fill="none" stroke={INK} strokeWidth={20} />
        <circle cx={0} cy={0} r={wheelR} fill="none" stroke="#334155" strokeWidth={10} />
        {/* Top green alignment stripe on wheel */}
        <line x1={0} y1={-wheelR - 8} x2={0} y2={-wheelR + 8} stroke="#22c55e" strokeWidth={8} strokeLinecap="round" />
        {/* Spokes */}
        <line x1={-wheelR + 10} y1={0} x2={wheelR - 10} y2={0} stroke={INK} strokeWidth={14} />
        <line x1={0} y1={0} x2={0} y2={wheelR - 10} stroke={INK} strokeWidth={14} />
        <circle cx={0} cy={0} r={28} fill="#94a3b8" stroke={INK} strokeWidth={6} />
      </g>

      {/* Driver Stickman (leaning smoothly in sync with steering) */}
      <g transform={`rotate(${bodyLean}, ${wheelCx}, 830)`}>
        {/* Driver Seat Backrest behind */}
        <rect x={driverX - 115} y={530} width={230} height={310} rx={44} fill="#1e40af" stroke={INK} strokeWidth={6} />
        <rect x={driverX - 65} y={405} width={130} height={95} rx={30} fill="#1d4ed8" stroke={INK} strokeWidth={6} />

        {/* Torso */}
        <line x1={driverX} y1={shoulderY} x2={driverX} y2={820} stroke={INK} strokeWidth={14} strokeLinecap="round" />

        {/* Driver Head (looking straight ahead out windshield) */}
        <circle cx={driverX} cy={headY} r={66} fill="#ffffff" stroke={INK} strokeWidth={6} />
        {/* Cap */}
        <path
          d={`M ${driverX - 64} ${headY - 22} Q ${driverX} ${headY - 88} ${driverX + 64} ${headY - 22} Z`}
          fill="#2563eb"
          stroke={INK}
          strokeWidth={6}
        />
        <path
          d={`M ${driverX - 68} ${headY - 22} L ${driverX + 78} ${headY - 22}`}
          stroke={INK}
          strokeWidth={7}
          strokeLinecap="round"
        />

        {/* Clean 2D Eyes looking toward turn direction */}
        <StickmanEyes
          cx={driverX}
          cy={headY + 4}
          spacing={22}
          eyeR={10}
          pupilR={5}
          lookX={steer * 3.5}
          lookY={-1}
        />
        {/* Confident calm smile */}
        <path
          d={`M ${driverX - 20} ${headY + 30} Q ${driverX} ${headY + 46} ${driverX + 20} ${headY + 30}`}
          fill="none"
          stroke={INK}
          strokeWidth={5.5}
          strokeLinecap="round"
        />
      </g>

      {/* Driver Arms gripping the rotating steering wheel */}
      <path
        d={`M ${driverX - 12} ${shoulderY + 18} Q ${driverX - 150} ${shoulderY + 90} ${leftHandX} ${leftHandY}`}
        fill="none"
        stroke={INK}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <path
        d={`M ${driverX + 12} ${shoulderY + 18} Q ${driverX + 150} ${shoulderY + 90} ${rightHandX} ${rightHandY}`}
        fill="none"
        stroke={INK}
        strokeWidth={11}
        strokeLinecap="round"
      />
      {/* Hands */}
      <circle cx={leftHandX} cy={leftHandY} r={14} fill="#ffffff" stroke={INK} strokeWidth={5} />
      <circle cx={rightHandX} cy={rightHandY} r={14} fill="#ffffff" stroke={INK} strokeWidth={5} />

      {/* Green Prediction Arrow above Driver Head synced 100% with turn direction */}
      <g transform={`translate(${driverX}, 305) scale(${arrowPulse})`}>
        <g transform={`scale(${arrowDir}, 1)`}>
          <path
            d="M -95 24 Q 0 -36 80 -8"
            fill="none"
            stroke={INK}
            strokeWidth={22}
            strokeLinecap="round"
          />
          <path
            d="M -95 24 Q 0 -36 80 -8"
            fill="none"
            stroke="#22c55e"
            strokeWidth={12}
            strokeLinecap="round"
          />
          <polygon
            points="112,-2 64,-34 72,22"
            fill="#22c55e"
            stroke={INK}
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </g>
        <text
          x={0}
          y={66}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={28}
          fontWeight={800}
          fill="#15803d"
          stroke="#ffffff"
          strokeWidth={6}
          paintOrder="stroke"
        >
          {turningRight ? 'DỰ ĐOÁN: RẼ PHẢI' : 'DỰ ĐOÁN: RẼ TRÁI'}
        </text>
      </g>

      {/* Main Callout Badge (Safe Zone y = 155..235, right side) */}
      <g transform={`translate(1415, 225) scale(${badgePop})`}>
        <rect
          x={-315}
          y={-48}
          width={630}
          height={96}
          rx={24}
          fill="#dcfce7"
          stroke={INK}
          strokeWidth={6}
        />
        <CheckBadge cx={-262} cy={0} r={24} />
        <text
          x={24}
          y={11}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={31}
          fontWeight={900}
          fill="#14532d"
        >
          NÃO DỰ ĐOÁN TRƯỚC → 0% SAY!
        </text>
      </g>
    </svg>
  );
};

// ============================================================================
// 2. SayXePassengerBlindsidedVisual
// ============================================================================

export const SayXePassengerBlindsidedVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;
  // Periodic sudden brake / sharp cornering jolt cycle every ~2.6s
  const cycleT = (t % 2.6) / 2.6;
  const joltWave =
    cycleT > 0.35 && cycleT < 0.78
      ? Math.sin(((cycleT - 0.35) / 0.43) * Math.PI)
      : 0;
  const jolt = Math.pow(joltWave, 0.7);
  const microShake = jolt > 0.2 ? Math.sin(frame * 1.4) * 5 * jolt : 0;

  // Passenger leans sharply forward/right when blindsided
  const bodyAngle = 14 + jolt * 24;
  const headDrop = jolt * 18;
  const scrollX = (frame * 10) % 420;
  const alertPop = easeOutBack(stepProgress(progress, 0.05, 0.2));

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <clipPath id="sx-pass-window">
          <rect x={140} y={160} width={1640} height={350} rx={36} />
        </clipPath>
      </defs>

      {/* Car Interior Wall Background (Full Bleed) */}
      <rect x={0} y={0} width={1920} height={1080} fill="#e2e8f0" />

      {/* Side Window showing fast passing scenery */}
      <g clipPath="url(#sx-pass-window)">
        <rect x={140} y={160} width={1640} height={350} fill="#bae6fd" />
        {/* Passing buildings & trees */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const bx = 140 + i * 420 - scrollX;
          return (
            <g key={i} transform={`translate(${bx}, 0)`}>
              <rect x={20} y={290} width={130} height={220} fill="#94a3b8" stroke={INK} strokeWidth={5} />
              <rect x={45} y={320} width={30} height={36} fill="#e0f2fe" stroke={INK} strokeWidth={3} />
              <rect x={95} y={320} width={30} height={36} fill="#e0f2fe" stroke={INK} strokeWidth={3} />
              <rect x={240} y={390} width={22} height={120} fill="#92400e" stroke={INK} strokeWidth={5} />
              <circle cx={251} cy={365} r={55} fill="#22c55e" stroke={INK} strokeWidth={5} />
            </g>
          );
        })}
        {/* Speed motion streaks during brake/swerve */}
        {jolt > 0.15 && (
          <g opacity={jolt * 0.85}>
            <line x1={260} y1={230} x2={580} y2={230} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />
            <line x1={1150} y1={270} x2={1560} y2={270} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
      </g>
      <rect x={140} y={160} width={1640} height={350} rx={36} fill="none" stroke={INK} strokeWidth={7} />

      {/* Car Interior Cabin Lower Panel */}
      <rect x={0} y={540} width={1920} height={540} fill="#cbd5e1" stroke={INK} strokeWidth={7} />

      {/* Back Seat Cushion & Backrest */}
      <path
        d="M 650 380 L 760 380 Q 815 380 825 435 L 860 715 L 1160 715 Q 1215 715 1215 770 L 1215 845 L 650 845 Z"
        fill="#475569"
        stroke={INK}
        strokeWidth={7}
        strokeLinejoin="round"
      />

      {/* Passenger Stickman jolted forward while glued to phone */}
      <g transform={`translate(${940 + microShake}, 725) rotate(${bodyAngle})`}>
        {/* Seated Legs */}
        <path
          d="M 0 0 L 185 0 L 210 120"
          fill="none"
          stroke={INK}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Torso */}
        <line x1={0} y1={0} x2={0} y2={-215} stroke={INK} strokeWidth={14} strokeLinecap="round" />

        {/* Head tilted down staring at phone */}
        <g transform={`translate(24, ${-275 + headDrop}) rotate(22)`}>
          <circle cx={0} cy={0} r={62} fill="#ffffff" stroke={INK} strokeWidth={6} />
          <StickmanEyes
            cx={12}
            cy={8}
            spacing={17}
            eyeR={9.5}
            pupilR={4.5}
            lookX={3}
            lookY={4}
            dizzy={jolt > 0.62}
          />
          {/* Surprised / uneasy mouth */}
          <ellipse
            cx={12}
            cy={34}
            rx={11 + jolt * 6}
            ry={6 + jolt * 8}
            fill={jolt > 0.4 ? '#fca5a5' : 'none'}
            stroke={INK}
            strokeWidth={5}
          />
        </g>

        {/* Arms holding glowing smartphone */}
        <path
          d="M 4 -180 L 95 -110 L 175 -135"
          fill="none"
          stroke={INK}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 4 -165 L 85 -92 L 170 -122"
          fill="none"
          stroke={INK}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Smartphone */}
        <g transform="translate(185, -135) rotate(-18)">
          <rect x={-16} y={-44} width={32} height={88} rx={8} fill="#1e293b" stroke={INK} strokeWidth={5} />
          <rect x={-10} y={-34} width={20} height={68} rx={4} fill="#38bdf8" />
          {/* Phone screen glow cone */}
          <polygon points="-12,-34 -120,-135 -120,-20 -12,34" fill="#38bdf8" fillOpacity={0.2} />
        </g>
      </g>

      {/* Red Inertia Force Arrows pushing from left */}
      {[0, 1, 2].map((idx) => {
        const ay = 435 + idx * 92;
        const pushX = lerp(290, 445, jolt) + idx * 14;
        return (
          <g key={idx} transform={`translate(${pushX}, ${ay})`} opacity={0.45 + jolt * 0.55}>
            <path
              d="M 0 -16 L 155 -16 L 155 -36 L 225 0 L 155 36 L 155 16 L 0 16 Z"
              fill="#ef4444"
              stroke={INK}
              strokeWidth={5.5}
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      {/* Inertia Label */}
      <g transform={`translate(${410 + jolt * 45}, 355)`}>
        <rect x={-165} y={-32} width={330} height={64} rx={16} fill="#fee2e2" stroke="#dc2626" strokeWidth={5} />
        <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={900} fill="#b91c1c">
          LỰC QUÁN TÍNH ĐẨY!
        </text>
      </g>

      {/* Conflict Lightning Bolts & Question Marks popping around head */}
      <g transform={`translate(${1080 + jolt * 75}, 310)`}>
        {/* Left yellow lightning bolt */}
        <g transform={`translate(-150, -35) scale(${0.75 + jolt * 0.45}) rotate(-18)`}>
          <polygon
            points="0,-55 -28,5 -4,5 -18,55 30,-8 4,-8"
            fill="#facc15"
            stroke={INK}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </g>
        {/* Right red lightning bolt */}
        <g transform={`translate(165, -20) scale(${0.75 + jolt * 0.45}) rotate(22)`}>
          <polygon
            points="0,-55 -28,5 -4,5 -18,55 30,-8 4,-8"
            fill="#ef4444"
            stroke={INK}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </g>
        {/* Question marks */}
        <text
          x={-65}
          y={-72 - jolt * 18}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={72}
          fontWeight={900}
          fill="#f97316"
          stroke={INK}
          strokeWidth={5}
          paintOrder="stroke"
        >
          ?
        </text>
        <text
          x={95}
          y={-85 - jolt * 24}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={86}
          fontWeight={900}
          fill="#ef4444"
          stroke={INK}
          strokeWidth={5}
          paintOrder="stroke"
        >
          ?!
        </text>
      </g>

      {/* Top Alert Banner (Safe Zone y = 155..225) */}
      <g transform={`translate(1430, 215) scale(${alertPop})`}>
        <rect x={-310} y={-44} width={620} height={88} rx={22} fill="#fee2e2" stroke={INK} strokeWidth={6} />
        <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontSize={31} fontWeight={900} fill="#991b1b">
          BỊ BẤT NGỜ → XUNG ĐỘT TÍN HIỆU!
        </text>
      </g>
    </svg>
  );
};

// ============================================================================
// 3. SayXeAgeGroupChartVisual
// ============================================================================

export const SayXeAgeGroupChartVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;
  const floatY = Math.sin(t * 3) * 5;

  const baselineY = 720;
  const maxChartH = 440;

  const bars = [
    {
      label: '2 – 12 tuổi',
      subLabel: 'Hệ tiền đình đang nhạy',
      tag: 'NHẠY NHẤT',
      ratio: 0.94,
      color: '#ef4444',
      lightBg: '#fee2e2',
      textColor: '#991b1b',
      start: 0.08,
      end: 0.42,
      cx: 480,
    },
    {
      label: '13 – 25 tuổi',
      subLabel: 'Mức độ trung bình',
      tag: 'TRUNG BÌNH',
      ratio: 0.58,
      color: '#f97316',
      lightBg: '#ffedd5',
      textColor: '#9a3412',
      start: 0.25,
      end: 0.62,
      cx: 960,
    },
    {
      label: 'Người lớn quen đi xe',
      subLabel: 'Não đã quen thích nghi',
      tag: 'ÍT SAY NHẤT',
      ratio: 0.28,
      color: '#22c55e',
      lightBg: '#dcfce7',
      textColor: '#166534',
      start: 0.44,
      end: 0.8,
      cx: 1440,
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      {/* Clean full-bleed bright studio canvas */}
      <rect x={0} y={0} width={1920} height={1080} fill="#f8fafc" />

      {/* Section Title (Safe Zone y = 140..205) */}
      <text
        x={960}
        y={186}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={44}
        fontWeight={900}
        fill={INK}
      >
        ĐỘ NHẠY SAY XE THEO ĐỘ TUỔI
      </text>

      {/* Subtle Horizontal Grid Lines */}
      {[0.25, 0.5, 0.75, 1].map((frac, idx) => {
        const gy = baselineY - frac * maxChartH;
        return (
          <g key={idx}>
            <line
              x1={230}
              y1={gy}
              x2={1720}
              y2={gy}
              stroke="#cbd5e1"
              strokeWidth={3}
              strokeDasharray="12 12"
            />
          </g>
        );
      })}

      {/* Y-Axis & X-Axis */}
      <line x1={230} y1={245} x2={230} y2={baselineY} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <polygon points="230,222 214,254 246,254" fill={INK} />
      <line x1={230} y1={baselineY} x2={1740} y2={baselineY} stroke={INK} strokeWidth={7} strokeLinecap="round" />

      {/* Y-Axis Label */}
      <text
        x={150}
        y={490}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={28}
        fontWeight={800}
        fill="#475569"
        transform="rotate(-90, 150, 490)"
      >
        MỨC ĐỘ NHẠY SAY XE
      </text>

      {/* Animated Bars */}
      {bars.map((bar, idx) => {
        const p = easeOutCubic(stepProgress(progress, bar.start, bar.end));
        const h = Math.max(8, bar.ratio * maxChartH * p);
        const topY = baselineY - h;
        const barW = 240;
        const tagScale = easeOutBack(stepProgress(progress, bar.end - 0.08, bar.end + 0.1));

        return (
          <g key={idx}>
            {/* Flat offset shadow */}
            <rect
              x={bar.cx - barW / 2 + 12}
              y={topY + 10}
              width={barW}
              height={Math.max(0, h - 10)}
              rx={20}
              fill="#cbd5e1"
            />
            {/* Main Column */}
            <rect
              x={bar.cx - barW / 2}
              y={topY}
              width={barW}
              height={h}
              rx={20}
              fill={bar.color}
              stroke={INK}
              strokeWidth={6}
            />
            {/* Clean highlight stripe */}
            {h > 36 && (
              <rect
                x={bar.cx - barW / 2 + 18}
                y={topY + 16}
                width={22}
                height={Math.max(8, h - 32)}
                rx={11}
                fill="#ffffff"
                fillOpacity={0.28}
              />
            )}

            {/* Floating Tag Pill above Bar */}
            <g transform={`translate(${bar.cx}, ${topY - 46 + floatY * (idx === 0 ? 1 : 0.6)}) scale(${tagScale})`}>
              <rect
                x={-118}
                y={-28}
                width={236}
                height={56}
                rx={28}
                fill={bar.lightBg}
                stroke={INK}
                strokeWidth={5}
              />
              <text
                x={0}
                y={9}
                textAnchor="middle"
                fontFamily={FONT}
                fontSize={26}
                fontWeight={900}
                fill={bar.textColor}
              >
                {bar.tag}
              </text>
            </g>

            {/* X-Axis Category Labels (y = 768..820, safely above y=890) */}
            <text
              x={bar.cx}
              y={776}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={34}
              fontWeight={900}
              fill={INK}
            >
              {bar.label}
            </text>
            <text
              x={bar.cx}
              y={818}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={25}
              fontWeight={600}
              fill="#475569"
            >
              {bar.subLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ============================================================================
// 4. SayXeTipLookHorizonVisual
// ============================================================================

export const SayXeTipLookHorizonVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;
  const sunRot = t * 18;
  const roadOffset = -((frame * 12) % 120);
  const mountainShift = (frame * 0.6) % 640;
  const hudPop = easeOutBack(stepProgress(progress, 0.06, 0.24));

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sx-horizon-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="65%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
        <clipPath id="sx-horizon-glass">
          <path d="M 110 135 L 1810 135 L 1900 735 L 20 735 Z" />
        </clipPath>
      </defs>

      {/* Cabin Interior Frame (Full Bleed) */}
      <rect x={0} y={0} width={1920} height={1080} fill="#1e293b" />

      {/* Wide Panoramic Windshield Scenery */}
      <g clipPath="url(#sx-horizon-glass)">
        {/* Sky */}
        <rect x={0} y={130} width={1920} height={400} fill="url(#sx-horizon-sky)" />

        {/* Radiant Sun on the Horizon */}
        <g transform={`translate(960, 440)`}>
          <g transform={`rotate(${sunRot})`}>
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1={0}
                y1={-105}
                x2={0}
                y2={-135}
                stroke="#facc15"
                strokeWidth={9}
                strokeLinecap="round"
                transform={`rotate(${deg})`}
              />
            ))}
          </g>
          <circle cx={0} cy={0} r={76} fill="#fde047" stroke={INK} strokeWidth={6} />
        </g>

        {/* Distant Mountain Range (slow smooth parallax) */}
        <g transform={`translate(${-mountainShift}, 0)`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <polygon
              key={i}
              points={`${i * 640 - 120},520 ${i * 640 + 180},335 ${i * 640 + 480},520`}
              fill="#60a5fa"
              stroke={INK}
              strokeWidth={5}
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Closer Green Hills & Horizon Line */}
        <rect x={0} y={510} width={1920} height={240} fill="#4ade80" stroke={INK} strokeWidth={5} />

        {/* Straight Open Highway into Horizon */}
        <polygon
          points="910,510 1010,510 1560,745 360,745"
          fill="#64748b"
          stroke={INK}
          strokeWidth={6}
        />
        <line
          x1={960}
          y1={514}
          x2={960}
          y2={745}
          stroke="#facc15"
          strokeWidth={11}
          strokeDasharray="36 24"
          strokeDashoffset={roadOffset}
        />

        {/* Trees smoothly streaming past both sides of road */}
        {[0, 1, 2, 3, 4].map((i) => {
          const cycle = (frame * 0.015 + i * 0.2) % 1;
          const ease = cycle * cycle;
          const scale = 0.28 + ease * 1.25;
          const ty = lerp(512, 700, ease);
          const lx = lerp(855, 110, ease);
          const rx = lerp(1065, 1810, ease);
          return (
            <g key={i}>
              <g transform={`translate(${lx}, ${ty}) scale(${scale})`}>
                <rect x={-10} y={0} width={20} height={44} fill="#92400e" stroke={INK} strokeWidth={5} />
                <circle cx={0} cy={-20} r={36} fill="#16a34a" stroke={INK} strokeWidth={5} />
              </g>
              <g transform={`translate(${rx}, ${ty}) scale(${scale})`}>
                <rect x={-10} y={0} width={20} height={44} fill="#92400e" stroke={INK} strokeWidth={5} />
                <circle cx={0} cy={-20} r={36} fill="#15803d" stroke={INK} strokeWidth={5} />
              </g>
            </g>
          );
        })}

        {/* Horizon Sightline Guide */}
        <line
          x1={220}
          y1={510}
          x2={1700}
          y2={510}
          stroke="#ffffff"
          strokeWidth={4}
          strokeDasharray="16 14"
          strokeOpacity={0.75}
        />
      </g>

      {/* Windshield Border & Dashboard */}
      <path d="M 110 135 L 1810 135 L 1900 735 L 20 735 Z" fill="none" stroke={INK} strokeWidth={7} />
      <rect x={0} y={735} width={1920} height={345} fill="#334155" stroke={INK} strokeWidth={7} />
      {/* Steering wheel top arc on left */}
      <path
        d="M 430 840 A 150 150 0 0 1 730 840"
        fill="none"
        stroke={INK}
        strokeWidth={22}
        strokeLinecap="round"
      />

      {/* Top Sync HUD: Eye + Inner Ear with Green Checkmarks (Safe Zone y = 155..285) */}
      <g transform={`translate(960, 225) scale(${hudPop})`}>
        <rect
          x={-480}
          y={-64}
          width={960}
          height={128}
          rx={30}
          fill="#ffffff"
          fillOpacity={0.95}
          stroke={INK}
          strokeWidth={6}
        />

        {/* Icon 1: Eye (Mắt) */}
        <g transform="translate(-375, 0)">
          <path
            d="M -48 0 Q 0 -38 48 0 Q 0 38 -48 0 Z"
            fill="#e0f2fe"
            stroke={INK}
            strokeWidth={5.5}
            strokeLinejoin="round"
          />
          <circle cx={0} cy={0} r={17} fill="#0284c7" stroke={INK} strokeWidth={4.5} />
          <circle cx={0} cy={0} r={7} fill={INK} />
          <CheckBadge cx={42} cy={-26} r={17} />
        </g>

        {/* Plus Sign */}
        <text x={-292} y={13} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill="#22c55e">
          +
        </text>

        {/* Icon 2: Inner Ear / Vestibular Spiral (Tai Trong) */}
        <g transform="translate(-210, 0)">
          <circle cx={0} cy={0} r={34} fill="#fef3c7" stroke={INK} strokeWidth={5.5} />
          <path
            d="M -14 14 C -24 -6, -6 -24, 14 -14 C 24 -4, 16 16, 2 14 C -8 12, -8 0, 2 -2"
            fill="none"
            stroke={INK}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <CheckBadge cx={32} cy={-26} r={17} />
        </g>

        {/* Divider */}
        <line x1={-142} y1={-40} x2={-142} y2={40} stroke="#cbd5e1" strokeWidth={4} />

        {/* Sync Banner Text */}
        <text
          x={155}
          y={12}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={36}
          fontWeight={900}
          fill="#15803d"
        >
          ĐỒNG BỘ 100% — HẾT CHOÁNG
        </text>
      </g>
    </svg>
  );
};

// ============================================================================
// 5. SayXeTipFrontSeatVisual
// ============================================================================

export const SayXeTipFrontSeatVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;
  // Bus suspension bounce + pitch (front/middle stays steady, rear tail oscillates hard!)
  const baseBounce = Math.sin(t * 4.5) * 6;
  const pitchDeg = Math.sin(t * 4.5 - 0.6) * 3.4;
  const wheelRot = (frame * 9) % 360;
  const roadShift = (frame * 11) % 240;

  const badgePop = easeOutBack(stepProgress(progress, 0.06, 0.25));

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      {/* Bright Sky Background (Full Bleed) */}
      <rect x={0} y={0} width={1920} height={1080} fill="#e0f2fe" />
      <rect x={0} y={710} width={1920} height={370} fill="#cbd5e1" />

      {/* Undulating Wavy Road Surface */}
      <path
        d={`M ${-240 - roadShift} 735 ${Array.from({ length: 12 })
          .map((_, i) => {
            const x1 = -240 - roadShift + i * 240 + 120;
            const x2 = -240 - roadShift + (i + 1) * 240;
            return `Q ${x1} 718 ${x2} 735`;
          })
          .join(' ')} L 2160 850 L -240 850 Z`}
        fill="#64748b"
        stroke={INK}
        strokeWidth={6}
      />

      {/* Bus Cross-Section pivoting around Front/Mid Wheelbase */}
      <g transform={`translate(760, ${660 + baseBounce}) rotate(${pitchDeg}) translate(-760, -660)`}>
        {/* Bus Main Body Shell */}
        <path
          d="M 270 355 Q 270 305 335 305 L 1605 305 Q 1655 305 1655 355 L 1655 660 Q 1655 690 1625 690 L 295 690 Q 260 690 260 655 L 260 470 Q 260 420 270 355 Z"
          fill="#ffffff"
          stroke={INK}
          strokeWidth={7}
          strokeLinejoin="round"
        />

        {/* Lower Skirt Accent Stripe */}
        <path
          d="M 263 590 L 1652 590 L 1652 655 Q 1652 686 1622 686 L 295 686 Q 263 686 263 655 Z"
          fill="#3b82f6"
          stroke={INK}
          strokeWidth={6}
        />

        {/* GREEN ZONE: Front & Mid-Wheelbase (Stable) */}
        <rect
          x={430}
          y={332}
          width={760}
          height={240}
          rx={22}
          fill="#22c55e"
          fillOpacity={0.22}
          stroke="#16a34a"
          strokeWidth={6}
          strokeDasharray="16 10"
        />

        {/* RED ZONE: Rear Overhang (High Bounce Amplitude) */}
        <rect
          x={1245}
          y={332}
          width={380}
          height={240}
          rx={22}
          fill="#ef4444"
          fillOpacity={0.26}
          stroke="#dc2626"
          strokeWidth={6}
          strokeDasharray="16 10"
        />

        {/* Driver Seat & Wheel at Front */}
        <rect x={310} y={485} width={65} height={85} rx={12} fill="#475569" stroke={INK} strokeWidth={5} />
        <line x1={295} y1={520} x2={345} y2={480} stroke={INK} strokeWidth={8} strokeLinecap="round" />

        {/* Calm Passengers in Green Zone */}
        {[560, 770, 980].map((px, i) => (
          <g key={i} transform={`translate(${px}, 545)`}>
            {/* Seat */}
            <path d="M -32 25 L -32 -55 L 22 -55" fill="none" stroke="#64748b" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            {/* Calm Stickman */}
            <line x1={8} y1={15} x2={8} y2={-62} stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <circle cx={8} cy={-95} r={28} fill="#ffffff" stroke={INK} strokeWidth={5} />
            <StickmanEyes cx={3} cy={-98} spacing={9} eyeR={5} pupilR={2.5} lookX={-1} />
            <path d="M -6 -82 Q 3 -73 12 -82" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}

        {/* Bouncing Passenger in Red Rear Zone */}
        <g transform={`translate(1445, ${545 + Math.sin(t * 9) * 14})`}>
          <path d="M -32 25 L -32 -55 L 22 -55" fill="none" stroke="#64748b" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          <line x1={8} y1={15} x2={8} y2={-62} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <circle cx={8} cy={-95} r={28} fill="#ffffff" stroke={INK} strokeWidth={5} />
          <StickmanEyes cx={3} cy={-98} spacing={9} eyeR={5} pupilR={2.5} dizzy />
          <path d="M -8 -78 Q 3 -88 14 -78" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        </g>

        {/* Front & Rear Wheels */}
        {[520, 1210].map((wx, idx) => (
          <g key={idx} transform={`translate(${wx}, 690)`}>
            <circle cx={0} cy={0} r={66} fill="#1e293b" stroke={INK} strokeWidth={6} />
            <circle cx={0} cy={0} r={34} fill="#cbd5e1" stroke={INK} strokeWidth={5} />
            <g transform={`rotate(${wheelRot})`}>
              <line x1={-26} y1={0} x2={26} y2={0} stroke={INK} strokeWidth={5} />
              <line x1={0} y1={-26} x2={0} y2={26} stroke={INK} strokeWidth={5} />
            </g>
          </g>
        ))}
      </g>

      {/* Big Vertical Shake Arrows at Rear Overhang */}
      <g transform={`translate(1735, ${495 + pitchDeg * 14})`}>
        <path
          d="M 0 -95 L 0 95"
          stroke="#dc2626"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <polygon points="0,-118 -20,-82 20,-82" fill="#dc2626" stroke={INK} strokeWidth={4} />
        <polygon points="0,118 -20,82 20,82" fill="#dc2626" stroke={INK} strokeWidth={4} />
      </g>

      {/* Top Labels with Pointer Lines (Safe Zone y = 155..245) */}
      <g transform={`translate(760, 200) scale(${badgePop})`}>
        <line x1={0} y1={42} x2={0} y2={115} stroke="#16a34a" strokeWidth={6} strokeDasharray="10 8" />
        <rect x={-315} y={-44} width={630} height={88} rx={22} fill="#dcfce7" stroke={INK} strokeWidth={6} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill="#14532d">
          ✓ ÍT XÓC NHẤT (NÊN NGỒI)
        </text>
      </g>

      <g transform={`translate(1465, 200) scale(${badgePop})`}>
        <line x1={0} y1={42} x2={0} y2={115} stroke="#dc2626" strokeWidth={6} strokeDasharray="10 8" />
        <rect x={-225} y={-44} width={450} height={88} rx={22} fill="#fee2e2" stroke={INK} strokeWidth={6} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill="#991b1b">
          ✗ XÓC MẠNH NHẤT
        </text>
      </g>
    </svg>
  );
};

// ============================================================================
// 6. SayXeTipFreshAirGingerVisual
// ============================================================================

export const SayXeTipFreshAirGingerVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;
  const windOffset = -((frame * 9) % 120);
  const calmFactor = easeOutCubic(stepProgress(progress, 0.15, 0.85));
  const waveAmp = lerp(24, 4, calmFactor);

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      {/* Split Background (Full Bleed) */}
      <rect x={0} y={0} width={960} height={1080} fill="#e0f2fe" />
      <rect x={960} y={0} width={960} height={1080} fill="#fef3c7" />
      <line x1={960} y1={0} x2={960} y2={1080} stroke={INK} strokeWidth={7} />

      {/* ================= LEFT HALF: FRESH AIR AC VENT ================= */}
      <g transform="translate(480, 190)">
        <rect x={-320} y={-40} width={640} height={80} rx={20} fill="#ffffff" stroke={INK} strokeWidth={6} />
        <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill="#0369a1">
          GIÓ MÁT ĐIỀU HÒA — TỈNH TÁO
        </text>
      </g>

      {/* AC Vent Grille */}
      <g transform="translate(115, 415)">
        <rect x={0} y={0} width={145} height={195} rx={24} fill="#334155" stroke={INK} strokeWidth={6} />
        {[34, 68, 102, 136, 166].map((ly) => (
          <line key={ly} x1={22} y1={ly} x2={123} y2={ly} stroke="#94a3b8" strokeWidth={8} strokeLinecap="round" />
        ))}
      </g>

      {/* Smooth Animated Cool Breeze Ribbons */}
      {[450, 515, 580].map((wy, idx) => (
        <path
          key={idx}
          d={`M 275 ${wy} Q 360 ${wy - 28} 445 ${wy} T 595 ${wy}`}
          fill="none"
          stroke={idx === 1 ? '#0ea5e9' : '#38bdf8'}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray="65 35"
          strokeDashoffset={windOffset + idx * 24}
        />
      ))}

      {/* Refreshed Stickman Boy */}
      <g transform={`translate(715, 535) rotate(${Math.sin(t * 2.5) * 2.5})`}>
        {/* Torso & relaxed arms */}
        <line x1={0} y1={65} x2={0} y2={265} stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <path d="M 0 115 L -75 185" stroke={INK} strokeWidth={11} strokeLinecap="round" />
        <path d="M 0 115 L 75 185" stroke={INK} strokeWidth={11} strokeLinecap="round" />
        {/* Head */}
        <circle cx={0} cy={0} r={74} fill="#ffffff" stroke={INK} strokeWidth={6} />
        {/* Rosy fresh cheeks */}
        <circle cx={-38} cy={18} r={12} fill="#fda4af" fillOpacity={0.65} />
        <circle cx={38} cy={18} r={12} fill="#fda4af" fillOpacity={0.65} />
        <StickmanEyes cx={0} cy={-6} spacing={24} eyeR={11} pupilR={5} lookX={-3} />
        {/* Wide refreshed smile */}
        <path d="M -26 24 Q 0 50 26 24" fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
        {/* Hair strands gently fluttering in breeze */}
        <path
          d={`M -20 -72 Q ${0 + Math.sin(t * 7) * 10} -106 24 -76`}
          fill="none"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
        />
      </g>

      {/* ================= RIGHT HALF: WARM GINGER TEA ================= */}
      <g transform="translate(1440, 190)">
        <rect x={-320} y={-40} width={640} height={80} rx={20} fill="#ffffff" stroke={INK} strokeWidth={6} />
        <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill="#b45309">
          TRÀ GỪNG ẤM — DỊU DẠ DÀY
        </text>
      </g>

      {/* Steaming Ginger Tea Cup */}
      <g transform="translate(1235, 610)">
        {/* Saucer */}
        <ellipse cx={0} cy={88} rx={155} ry={28} fill="#ffffff" stroke={INK} strokeWidth={6} />
        {/* Cup Handle */}
        <path
          d="M 102 -50 C 168 -50, 168 48, 96 48"
          fill="none"
          stroke={INK}
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d="M 102 -50 C 156 -50, 156 48, 96 48"
          fill="none"
          stroke="#ffffff"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Cup Body */}
        <path
          d="M -112 -82 L 112 -82 L 92 65 Q 84 85 0 85 Q -84 85 -92 65 Z"
          fill="#ffffff"
          stroke={INK}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {/* Warm Amber Tea Surface */}
        <ellipse cx={0} cy={-82} rx={112} ry={24} fill="#f59e0b" stroke={INK} strokeWidth={6} />

        {/* Rising Animated Fragrant Steam Curls */}
        {[-45, 0, 45].map((sx, i) => {
          const drift = Math.sin(t * 3.5 + i * 1.4) * 14;
          return (
            <path
              key={i}
              d={`M ${sx} -112 Q ${sx - 18 + drift} -162 ${sx + drift * 0.5} -205 T ${sx - drift * 0.6} -275`}
              fill="none"
              stroke="#fb923c"
              strokeWidth={7}
              strokeLinecap="round"
              strokeOpacity={0.75}
            />
          );
        })}

        {/* Fresh Golden Ginger Slices beside Cup */}
        <g transform="translate(-145, 92) rotate(-14)">
          <ellipse cx={0} cy={0} rx={52} ry={28} fill="#fde047" stroke={INK} strokeWidth={5.5} />
          <ellipse cx={0} cy={0} rx={36} ry={17} fill="#fef08a" stroke="#ca8a04" strokeWidth={3} />
        </g>
        <g transform="translate(-75, 118) rotate(12)">
          <ellipse cx={0} cy={0} rx={48} ry={25} fill="#facc15" stroke={INK} strokeWidth={5.5} />
          <ellipse cx={0} cy={0} rx={32} ry={14} fill="#fef08a" stroke="#ca8a04" strokeWidth={3} />
        </g>
      </g>

      {/* Stomach Calmness Meter Card (Right side) */}
      <g transform="translate(1665, 555)">
        {/* Stylized Stomach Silhouette */}
        <path
          d="M -45 -130 C -45 -65, -135 -45, -135 45 C -135 135, -35 170, 55 140 C 135 112, 135 -15, 70 -55 C 25 -82, 20 -115, 20 -130"
          fill={calmFactor > 0.5 ? '#dcfce7' : '#fee2e2'}
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Animated Stomach Wave smoothing from turbulent red to calm green */}
        <path
          d={`M -95 45 Q -45 ${45 - waveAmp * Math.sin(t * 6)} 0 45 T 90 45`}
          fill="none"
          stroke={calmFactor > 0.5 ? '#16a34a' : '#ef4444'}
          strokeWidth={9}
          strokeLinecap="round"
        />
        <text
          x={0}
          y={205}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={27}
          fontWeight={900}
          fill={calmFactor > 0.5 ? '#15803d' : '#b91c1c'}
        >
          {calmFactor > 0.5 ? 'ÊM DỊU HẲN ✓' : 'ĐANG CỒN CÀO...'}
        </text>
      </g>
    </svg>
  );
};

// ============================================================================
// 7. SayXeTipPutPhoneDownVisual
// ============================================================================

export const SayXeTipPutPhoneDownVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;
  // Phase 1 (0..0.38): Phone smoothly drops into pocket
  const stashP = easeOutCubic(stepProgress(progress, 0.05, 0.38));
  // Phase 2 (0.32..1): Boy lifts head, enjoys music, looks out window
  const relaxP = easeOutCubic(stepProgress(progress, 0.28, 0.58));

  const bgScroll = (frame * 7) % 520;
  const musicBob = Math.sin(t * 4.2) * 6 * relaxP;
  const headTilt = lerp(24, -4, relaxP);

  // Phone position sliding smoothly into pocket
  const phoneX = lerp(935, 815, stashP);
  const phoneY = lerp(575, 715, stashP);
  const phoneOpacity = 1 - stepProgress(progress, 0.36, 0.48);

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <clipPath id="sx-putdown-win">
          <rect x={160} y={165} width={1600} height={375} rx={36} />
        </clipPath>
      </defs>

      {/* Warm Car Cabin Wall (Full Bleed) */}
      <rect x={0} y={0} width={1920} height={1080} fill="#f1f5f9" />

      {/* Peaceful Window Scenery scrolling smoothly at 60fps */}
      <g clipPath="url(#sx-putdown-win)">
        <rect x={160} y={165} width={1600} height={375} fill="#bae6fd" />
        {[0, 1, 2, 3, 4].map((i) => {
          const sx = 160 + i * 520 - bgScroll;
          return (
            <g key={i} transform={`translate(${sx}, 0)`}>
              {/* Fluffy cloud */}
              <ellipse cx={160} cy={245} rx={70} ry={30} fill="#ffffff" />
              <ellipse cx={210} cy={238} rx={45} ry={25} fill="#ffffff" />
              {/* Rolling green hill */}
              <path
                d="M 0 540 Q 260 365 520 540 Z"
                fill="#86efac"
                stroke={INK}
                strokeWidth={5}
              />
              {/* Tree */}
              <rect x={390} y={445} width={18} height={95} fill="#92400e" stroke={INK} strokeWidth={4.5} />
              <circle cx={399} cy={425} r={42} fill="#22c55e" stroke={INK} strokeWidth={4.5} />
            </g>
          );
        })}
      </g>
      <rect x={160} y={165} width={1600} height={375} rx={36} fill="none" stroke={INK} strokeWidth={7} />

      {/* Car Interior Lower Panel */}
      <rect x={0} y={565} width={1920} height={515} fill="#e2e8f0" stroke={INK} strokeWidth={7} />

      {/* Seat */}
      <path
        d="M 560 400 L 665 400 Q 715 400 725 450 L 755 715 L 1045 715 Q 1090 715 1090 765 L 1090 845 L 560 845 Z"
        fill="#3b82f6"
        stroke={INK}
        strokeWidth={7}
        strokeLinejoin="round"
      />

      {/* Stickman Boy */}
      <g transform={`translate(815, ${715 + musicBob})`}>
        {/* Legs */}
        <path d="M 0 0 L 175 0 L 195 125" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        {/* Torso */}
        <line x1={0} y1={0} x2={0} y2={-225} stroke={INK} strokeWidth={14} strokeLinecap="round" />

        {/* Pocket badge */}
        <path d="M -24 -40 L 24 -40 L 20 8 Q 0 22 -20 8 Z" fill="#1d4ed8" stroke={INK} strokeWidth={5} />

        {/* Head lifting up to gaze out window with Headphones */}
        <g transform={`translate(8, -290) rotate(${headTilt})`}>
          <circle cx={0} cy={0} r={66} fill="#ffffff" stroke={INK} strokeWidth={6} />
          {/* Headphone Band */}
          <path
            d="M -68 -8 A 68 68 0 0 1 68 -8"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d="M -68 -8 A 68 68 0 0 1 68 -8"
            fill="none"
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* Earcups */}
          <rect x={-78} y={-16} width={24} height={54} rx={12} fill="#f59e0b" stroke={INK} strokeWidth={5} />
          <rect x={54} y={-16} width={24} height={54} rx={12} fill="#f59e0b" stroke={INK} strokeWidth={5} />

          {/* Clean 2D Eyes looking happily outward */}
          <StickmanEyes cx={14} cy={-2} spacing={18} eyeR={9.5} pupilR={4.5} lookX={4} lookY={-2} />
          {/* Happy smile */}
          <path d="M -8 24 Q 14 44 36 24" fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
        </g>

        {/* Arm stashing phone then resting comfortably */}
        <path
          d={`M 0 -180 Q ${lerp(90, 48, relaxP)} ${lerp(-95, -70, relaxP)} ${lerp(115, 65, stashP)} ${lerp(-135, -18, stashP)}`}
          fill="none"
          stroke={INK}
          strokeWidth={11}
          strokeLinecap="round"
        />
      </g>

      {/* Smartphone sliding into pocket */}
      {phoneOpacity > 0.02 && (
        <g transform={`translate(${phoneX}, ${phoneY}) rotate(${lerp(-15, 8, stashP)})`} opacity={phoneOpacity}>
          <rect x={-18} y={-38} width={36} height={76} rx={8} fill="#1e293b" stroke={INK} strokeWidth={5} />
          <rect x={-12} y={-28} width={24} height={56} rx={4} fill="#94a3b8" />
        </g>
      )}

      {/* Floating Musical Notes (60fps smooth rise) */}
      {[0, 1, 2, 3].map((i) => {
        const noteCycle = (t * 0.55 + i * 0.25) % 1;
        const nx = 960 + i * 95 + Math.sin(noteCycle * Math.PI * 2) * 28;
        const ny = lerp(420, 210, noteCycle);
        const op = Math.sin(noteCycle * Math.PI) * relaxP;
        const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#22c55e'];
        return (
          <text
            key={i}
            x={nx}
            y={ny}
            fontFamily={FONT}
            fontSize={i % 2 === 0 ? 58 : 48}
            fontWeight={900}
            fill={colors[i]}
            stroke={INK}
            strokeWidth={3.5}
            paintOrder="stroke"
            opacity={op}
          >
            {i % 2 === 0 ? '♫' : '♪'}
          </text>
        );
      })}

      {/* Top Clean Banner (Safe Zone y = 155..225) */}
      <g transform="translate(1390, 225)">
        <rect x={-320} y={-44} width={640} height={88} rx={22} fill="#dcfce7" stroke={INK} strokeWidth={6} />
        <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontSize={31} fontWeight={900} fill="#14532d">
          CẤT ĐIỆN THOẠI — NGHE NHẠC THƯ GIÃN
        </text>
      </g>
    </svg>
  );
};

// ============================================================================
// 8. SayXeHappyTripReturnVisual
// ============================================================================

export const SayXeHappyTripReturnVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;
  const hillShift = (frame * 5) % 640;
  const boyBob = Math.sin(t * 3.4) * 5;
  const grandpaNod = Math.sin(t * 2.3) * 6;
  const bannerPop = easeOutBack(stepProgress(progress, 0.05, 0.22));

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sx-sunset-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="48%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
        <clipPath id="sx-sunset-win">
          <rect x={120} y={160} width={1680} height={390} rx={36} />
        </clipPath>
      </defs>

      {/* Warm Sunset Cabin Interior (Full Bleed) */}
      <rect x={0} y={0} width={1920} height={1080} fill="#fef3c7" />

      {/* Panoramic Sunset Window */}
      <g clipPath="url(#sx-sunset-win)">
        <rect x={120} y={160} width={1680} height={390} fill="url(#sx-sunset-sky)" />

        {/* Low Golden Setting Sun */}
        <circle cx={960} cy={435} r={96} fill="#fef08a" fillOpacity={0.35} />
        <circle cx={960} cy={435} r={66} fill="#fde047" stroke={INK} strokeWidth={5} />

        {/* Rolling Sunset Countryside Hills */}
        <g transform={`translate(${-hillShift}, 0)`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${i * 640}, 0)`}>
              <path
                d="M 0 550 Q 320 390 640 550 Z"
                fill="#fb923c"
                stroke={INK}
                strokeWidth={5}
              />
              <path
                d="M 160 550 Q 440 435 720 550 Z"
                fill="#ea580c"
                stroke={INK}
                strokeWidth={5}
              />
            </g>
          ))}
        </g>

        {/* Warm Sunbeam Slant */}
        <polygon points="820,160 1160,160 1480,550 1050,550" fill="#fef08a" fillOpacity={0.18} />
      </g>
      <rect x={120} y={160} width={1680} height={390} rx={36} fill="none" stroke={INK} strokeWidth={7} />

      {/* Cabin Lower Interior */}
      <rect x={0} y={575} width={1920} height={505} fill="#fde68a" stroke={INK} strokeWidth={7} />

      {/* Shared Wide Back Seat */}
      <rect x={440} y={530} width={1040} height={310} rx={42} fill="#b45309" stroke={INK} strokeWidth={7} />
      <rect x={440} y={715} width={1040} height={125} rx={30} fill="#d97706" stroke={INK} strokeWidth={7} />

      {/* BOY STICKMAN (Left Seat — Healthy, Headphones, Smiling) */}
      <g transform={`translate(730, ${690 + boyBob})`}>
        <line x1={0} y1={0} x2={0} y2={-195} stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <path d="M 0 -145 L -65 -65" stroke={INK} strokeWidth={11} strokeLinecap="round" />
        <path d="M 0 -145 L 65 -65" stroke={INK} strokeWidth={11} strokeLinecap="round" />
        {/* Head */}
        <circle cx={0} cy={-255} r={62} fill="#ffffff" stroke={INK} strokeWidth={6} />
        {/* Headphones */}
        <path d="M -64 -262 A 64 64 0 0 1 64 -262" fill="none" stroke="#3b82f6" strokeWidth={13} strokeLinecap="round" />
        <rect x={-74} y={-270} width={22} height={48} rx={10} fill="#3b82f6" stroke={INK} strokeWidth={5} />
        <rect x={52} y={-270} width={22} height={48} rx={10} fill="#3b82f6" stroke={INK} strokeWidth={5} />
        {/* Healthy rosy cheeks + clean 2D eyes */}
        <circle cx={-32} cy={-240} r={10} fill="#fda4af" fillOpacity={0.7} />
        <circle cx={32} cy={-240} r={10} fill="#fda4af" fillOpacity={0.7} />
        <StickmanEyes cx={0} cy={-260} spacing={20} eyeR={9.5} pupilR={4.5} lookX={2} />
        <path d="M -22 -232 Q 0 -210 22 -232" fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
      </g>

      {/* Subtle Floating Music Note near Boy */}
      <text
        x={615}
        y={375 + Math.sin(t * 4) * 12}
        fontFamily={FONT}
        fontSize={48}
        fontWeight={900}
        fill="#3b82f6"
        stroke={INK}
        strokeWidth={3.5}
        paintOrder="stroke"
      >
        ♪
      </text>

      {/* GRANDPA STICKMAN (Right Seat — White Hair, Glasses, Nodding Happily) */}
      <g transform="translate(1190, 690)">
        <line x1={0} y1={0} x2={0} y2={-215} stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <path d="M 0 -160 L -65 -72" stroke={INK} strokeWidth={11} strokeLinecap="round" />
        <path d="M 0 -160 L 65 -72" stroke={INK} strokeWidth={11} strokeLinecap="round" />

        {/* Nodding Head */}
        <g transform={`translate(0, -278) rotate(${grandpaNod})`}>
          <circle cx={0} cy={0} r={66} fill="#ffffff" stroke={INK} strokeWidth={6} />
          {/* White Hair Tufts */}
          <path d="M -55 -40 Q -65 -75 -30 -64" fill="#e2e8f0" stroke={INK} strokeWidth={5} />
          <path d="M 55 -40 Q 65 -75 30 -64" fill="#e2e8f0" stroke={INK} strokeWidth={5} />

          {/* Clean 2D Eyes + Round Glasses */}
          <StickmanEyes cx={0} cy={-8} spacing={22} eyeR={9} pupilR={4.5} lookX={-2} />
          <circle cx={-22} cy={-8} r={17} fill="none" stroke={INK} strokeWidth={4.5} />
          <circle cx={22} cy={-8} r={17} fill="none" stroke={INK} strokeWidth={4.5} />
          <line x1={-5} y1={-8} x2={5} y2={-8} stroke={INK} strokeWidth={4.5} />

          {/* Warm Mustache & Smile */}
          <path d="M -24 22 Q -10 12 0 20 Q 10 12 24 22" fill="none" stroke="#94a3b8" strokeWidth={7} strokeLinecap="round" />
          <path d="M -18 34 Q 0 48 18 34" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
      </g>

      {/* Top Warm Banner (Safe Zone y = 155..225) */}
      <g transform={`translate(960, 212) scale(${bannerPop})`}>
        <rect x={-370} y={-40} width={740} height={80} rx={22} fill="#ffffff" fillOpacity={0.94} stroke={INK} strokeWidth={6} />
        <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill="#9a3412">
          CHUYẾN XE CHIỀU CHỦ NHẬT — KHỎE RE!
        </text>
      </g>
    </svg>
  );
};

// ============================================================================
// 9. SayXeSummary3RulesVisual
// ============================================================================

export const SayXeSummary3RulesVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
}) => {
  const t = frame / 60;

  const cards = [
    {
      num: '1',
      line1: '1. Nhìn ra',
      line2: 'đường chân trời',
      start: 0.06,
      end: 0.28,
      activeBg: '#e0f2fe',
      accent: '#0284c7',
      cx: 370,
    },
    {
      num: '2',
      line1: '2. Cất điện thoại,',
      line2: 'nghe nhạc',
      start: 0.34,
      end: 0.56,
      activeBg: '#fef3c7',
      accent: '#d97706',
      cx: 960,
    },
    {
      num: '3',
      line1: '3. Ngồi ghế trước',
      line2: '& giữ gió thoáng',
      start: 0.62,
      end: 0.84,
      activeBg: '#dcfce7',
      accent: '#16a34a',
      cx: 1550,
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      {/* Clean Full-Bleed Canvas */}
      <rect x={0} y={0} width={1920} height={1080} fill="#f8fafc" />

      {/* Header (Safe Zone y = 145..215) */}
      <text
        x={960}
        y={192}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={48}
        fontWeight={900}
        fill={INK}
      >
        3 BÍ KÍP CHỐNG SAY XE HIỆU QUẢ
      </text>

      {/* 3 Large Illustrated Cards (y = 250..815) */}
      {cards.map((card, idx) => {
        const reveal = easeOutBack(stepProgress(progress, card.start, card.end));
        const lit = progress >= card.start;
        const liftY = lit ? -10 + Math.sin(t * 2.8 + idx * 1.2) * 4 : 18;
        const cardW = 520;
        const cardH = 540;
        const topY = 265;

        return (
          <g
            key={card.num}
            transform={`translate(${card.cx}, ${topY + cardH / 2 + liftY}) scale(${0.86 + 0.14 * clamp01(reveal)})`}
            opacity={0.35 + 0.65 * clamp01(reveal)}
          >
            {/* Flat drop shadow */}
            <rect
              x={-cardW / 2 + 14}
              y={-cardH / 2 + 14}
              width={cardW}
              height={cardH}
              rx={34}
              fill="#cbd5e1"
            />
            {/* Card Body */}
            <rect
              x={-cardW / 2}
              y={-cardH / 2}
              width={cardW}
              height={cardH}
              rx={34}
              fill={lit ? card.activeBg : '#ffffff'}
              stroke={INK}
              strokeWidth={6}
            />

            {/* Green Checkmark Badge popping in at top-right */}
            <CheckBadge
              cx={cardW / 2 - 42}
              cy={-cardH / 2 + 42}
              r={30}
              scale={easeOutBack(stepProgress(progress, card.start + 0.08, card.end + 0.06))}
            />

            {/* Custom Vector Icon Circle */}
            <circle cx={0} cy={-72} r={118} fill="#ffffff" stroke={INK} strokeWidth={6} />

            {/* Card 1 Icon: Horizon + Sun + Eye */}
            {idx === 0 && (
              <g transform="translate(0, -72)">
                <circle cx={0} cy={-16} r={34} fill="#fde047" stroke={INK} strokeWidth={5} />
                <path d="M -84 26 L -32 -18 L 16 26 L 52 -6 L 84 26 Z" fill="#4ade80" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                <line x1={-90} y1={26} x2={90} y2={26} stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
                {/* Eye above horizon */}
                <path d="M -38 -64 Q 0 -90 38 -64 Q 0 -38 -38 -64 Z" fill="#e0f2fe" stroke={INK} strokeWidth={4.5} />
                <circle cx={0} cy={-64} r={10} fill={INK} />
              </g>
            )}

            {/* Card 2 Icon: Headphones + Music Note + Phone Off */}
            {idx === 1 && (
              <g transform="translate(0, -72)">
                {/* Headphones */}
                <path
                  d="M -64 12 A 64 64 0 0 1 64 12"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={14}
                  strokeLinecap="round"
                />
                <path
                  d="M -64 12 A 64 64 0 0 1 64 12"
                  fill="none"
                  stroke={INK}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
                <rect x={-76} y={4} width={26} height={54} rx={12} fill="#f59e0b" stroke={INK} strokeWidth={5} />
                <rect x={50} y={4} width={26} height={54} rx={12} fill="#f59e0b" stroke={INK} strokeWidth={5} />
                {/* Music Note center */}
                <text x={0} y={32} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill="#3b82f6" stroke={INK} strokeWidth={3} paintOrder="stroke">
                  ♫
                </text>
              </g>
            )}

            {/* Card 3 Icon: Front Car Seat + Cool Breeze Waves */}
            {idx === 2 && (
              <g transform="translate(0, -72)">
                {/* Seat Silhouette */}
                <path
                  d="M -52 -54 L -32 40 L 42 40"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth={18}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M -52 -54 L -32 40 L 42 40"
                  fill="none"
                  stroke={INK}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Cool Breeze Waves */}
                <path d="M 4 -34 Q 32 -50 60 -34 T 88 -34" fill="none" stroke="#0ea5e9" strokeWidth={7} strokeLinecap="round" />
                <path d="M 14 -6 Q 42 -22 70 -6 T 94 -6" fill="none" stroke="#38bdf8" strokeWidth={7} strokeLinecap="round" />
              </g>
            )}

            {/* Rule Text */}
            <text
              x={0}
              y={128}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={38}
              fontWeight={900}
              fill={INK}
            >
              {card.line1}
            </text>
            <text
              x={0}
              y={178}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={38}
              fontWeight={900}
              fill={card.accent}
            >
              {card.line2}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
