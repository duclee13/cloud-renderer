import React from 'react';
import type { EpisodeVisualProps } from './index';

const STROKE = '#1e293b';
const FONT = "'Nunito', 'Quicksand', 'Segoe UI', sans-serif";

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);

interface Eye2DProps {
  cx: number;
  cy: number;
  r?: number;
  pupilDx?: number;
  pupilDy?: number;
  pupilR?: number;
}

const Eye2D: React.FC<Eye2DProps> = ({
  cx,
  cy,
  r = 11,
  pupilDx = 0,
  pupilDy = 0,
  pupilR = 4.5,
}) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke={STROKE} strokeWidth={4} />
    <circle cx={cx + pupilDx} cy={cy + pupilDy} r={pupilR} fill={STROKE} />
  </g>
);

interface LabelPillProps {
  cx: number;
  cy: number;
  width: number;
  height?: number;
  text: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  fontSize?: number;
  opacity?: number;
}

const LabelPill: React.FC<LabelPillProps> = ({
  cx,
  cy,
  width,
  height = 68,
  text,
  bgColor,
  borderColor,
  textColor,
  fontSize = 30,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <rect
      x={cx - width / 2}
      y={cy - height / 2}
      width={width}
      height={height}
      rx={height / 2}
      fill={bgColor}
      stroke={borderColor}
      strokeWidth={6}
    />
    <text
      x={cx}
      y={cy + fontSize * 0.34}
      textAnchor="middle"
      fontFamily={FONT}
      fontWeight={800}
      fontSize={fontSize}
      fill={textColor}
    >
      {text}
    </text>
  </g>
);

interface CartoonBrainProps {
  cx: number;
  cy: number;
  scale?: number;
  fill?: string;
  accent?: string;
}

const CartoonBrain: React.FC<CartoonBrainProps> = ({
  cx,
  cy,
  scale = 1,
  fill = '#fbcfe8',
  accent = '#f472b6',
}) => (
  <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
    {/* Brainstem */}
    <path
      d="M -22 72 L -16 125 Q 0 134 16 125 L 22 72 Z"
      fill={accent}
      stroke={STROKE}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    {/* Main lobes */}
    <path
      d="M -120 18
         C -148 10, -155 -35, -128 -62
         C -132 -102, -88 -132, -42 -120
         C -24 -144, 24 -144, 42 -120
         C 88 -132, 132 -102, 128 -62
         C 155 -35, 148 10, 120 18
         C 138 56, 102 92, 54 84
         C 34 100, -34 100, -54 84
         C -102 92, -138 56, -120 18 Z"
      fill={fill}
      stroke={STROKE}
      strokeWidth={7}
      strokeLinejoin="round"
    />
    {/* Center fissure */}
    <path
      d="M 0 -116 C -6 -55, 6 10, 0 82"
      fill="none"
      stroke={STROKE}
      strokeWidth={5.5}
      strokeLinecap="round"
    />
    {/* Gyri folds left */}
    <path
      d="M -98 -45 C -72 -62, -46 -44, -44 -20 C -42 2, -74 14, -92 0"
      fill="none"
      stroke={STROKE}
      strokeWidth={5}
      strokeLinecap="round"
    />
    <path
      d="M -86 38 C -60 22, -32 34, -30 56"
      fill="none"
      stroke={STROKE}
      strokeWidth={5}
      strokeLinecap="round"
    />
    <path
      d="M -72 -88 C -52 -96, -30 -84, -26 -64"
      fill="none"
      stroke={STROKE}
      strokeWidth={5}
      strokeLinecap="round"
    />
    {/* Gyri folds right */}
    <path
      d="M 98 -45 C 72 -62, 46 -44, 44 -20 C 42 2, 74 14, 92 0"
      fill="none"
      stroke={STROKE}
      strokeWidth={5}
      strokeLinecap="round"
    />
    <path
      d="M 86 38 C 60 22, 32 34, 30 56"
      fill="none"
      stroke={STROKE}
      strokeWidth={5}
      strokeLinecap="round"
    />
    <path
      d="M 72 -88 C 52 -96, 30 -84, 26 -64"
      fill="none"
      stroke={STROKE}
      strokeWidth={5}
      strokeLinecap="round"
    />
  </g>
);

interface SemicircularCanalsProps {
  cx: number;
  cy: number;
  scale?: number;
  sloshPhase: number;
  tiltDeg?: number;
  clipId: string;
}

const SemicircularCanals: React.FC<SemicircularCanalsProps> = ({
  cx,
  cy,
  scale = 1,
  sloshPhase,
  tiltDeg = 0,
  clipId,
}) => {
  const sloshX = Math.sin(sloshPhase) * 24;
  const hairBend = Math.sin(sloshPhase) * 26;

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${tiltDeg}) scale(${scale})`}>
      <defs>
        <clipPath id={clipId}>
          <circle cx={-12} cy={-84} r={78} />
          <circle cx={78} cy={-38} r={66} />
          <ellipse cx={-66} cy={4} rx={72} ry={50} />
          <circle cx={0} cy={52} r={54} />
        </clipPath>
      </defs>

      {/* Outer canal tubes (3 semicircular loops) */}
      {/* Top loop */}
      <circle
        cx={-12}
        cy={-84}
        r={84}
        fill="none"
        stroke={STROKE}
        strokeWidth={36}
      />
      <circle
        cx={-12}
        cy={-84}
        r={84}
        fill="none"
        stroke="#fb923c"
        strokeWidth={24}
      />
      {/* Right loop */}
      <circle
        cx={78}
        cy={-38}
        r={72}
        fill="none"
        stroke={STROKE}
        strokeWidth={34}
      />
      <circle
        cx={78}
        cy={-38}
        r={72}
        fill="none"
        stroke="#f472b6"
        strokeWidth={22}
      />
      {/* Left horizontal loop */}
      <ellipse
        cx={-66}
        cy={4}
        rx={78}
        ry={54}
        fill="none"
        stroke={STROKE}
        strokeWidth={34}
      />
      <ellipse
        cx={-66}
        cy={4}
        rx={78}
        ry={54}
        fill="none"
        stroke="#fb7185"
        strokeWidth={22}
      />

      {/* Inner fluid blue channel */}
      <circle
        cx={-12}
        cy={-84}
        r={84}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={13}
        strokeDasharray="34 18"
        strokeDashoffset={-sloshX * 2.5}
        strokeLinecap="round"
      />
      <circle
        cx={78}
        cy={-38}
        r={72}
        fill="none"
        stroke="#0ea5e9"
        strokeWidth={12}
        strokeDasharray="28 16"
        strokeDashoffset={sloshX * 2.2}
        strokeLinecap="round"
      />
      <ellipse
        cx={-66}
        cy={4}
        rx={78}
        ry={54}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={12}
        strokeDasharray="30 16"
        strokeDashoffset={-sloshX * 2.8}
        strokeLinecap="round"
      />

      {/* Central vestibule / ampulla bulb */}
      <path
        d="M -68 24 C -74 96, -34 134, 18 134 C 76 134, 102 88, 92 26 C 84 -12, 42 -26, 0 -22 C -46 -18, -64 -6, -68 24 Z"
        fill="#fed7aa"
        stroke={STROKE}
        strokeWidth={7}
        strokeLinejoin="round"
      />

      {/* Sloshing fluid wave inside vestibule */}
      <g clipPath={`url(#${clipId})`}>
        <path
          d={`M -160 ${44 + Math.sin(sloshPhase) * 14}
              Q -60 ${24 - Math.sin(sloshPhase) * 20}, 20 ${46 + Math.cos(sloshPhase) * 14}
              T 180 ${42 - Math.sin(sloshPhase) * 16}
              L 180 180 L -160 180 Z`}
          fill="#38bdf8"
          fillOpacity={0.85}
        />
        {/* Fluid bubbles */}
        <circle cx={-18 + sloshX * 0.7} cy={78} r={7} fill="#e0f2fe" />
        <circle cx={28 + sloshX * 0.9} cy={92} r={5} fill="#e0f2fe" />
        <circle cx={-42 + sloshX * 0.5} cy={98} r={4.5} fill="#bae6fd" />
      </g>

      {/* Vestibule outline re-stroke for crispness */}
      <path
        d="M -68 24 C -74 96, -34 134, 18 134 C 76 134, 102 88, 92 26 C 84 -12, 42 -26, 0 -22 C -46 -18, -64 -6, -68 24 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth={7}
        strokeLinejoin="round"
      />

      {/* Sensory hair cells (sợi lông cảm biến) bending with fluid */}
      {[-34, -14, 6, 26, 46].map((hx, idx) => (
        <g key={hx} transform={`translate(${hx}, 122)`}>
          <path
            d={`M 0 0 Q ${hairBend * 0.6} -24, ${hairBend + (idx % 2 === 0 ? 4 : -4)} -48`}
            fill="none"
            stroke="#facc15"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d={`M 0 0 Q ${hairBend * 0.6} -24, ${hairBend + (idx % 2 === 0 ? 4 : -4)} -48`}
            fill="none"
            stroke={STROKE}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={0} cy={2} r={6} fill="#f97316" stroke={STROKE} strokeWidth={3.5} />
        </g>
      ))}
    </g>
  );
};

/* ============================================================================
 * 1. SayXeCarInteriorPhoneVisual
 * Bên trong khoang xe khách đang chạy: cảnh bên ngoài trôi vù vù 60fps sang trái,
 * xe nhún nhẹ theo Math.sin(frame/5). Ghế trước ông nội vui vẻ nhìn ra cửa sổ;
 * ghế sau cậu bé cúi đầu cầm điện thoại sáng xanh chăm chú đọc truyện.
 * ============================================================================ */
export const SayXeCarInteriorPhoneVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const bounceY = Math.sin(frame / 5) * 4.5;
  const wheelRumble = Math.cos(frame / 2.5) * 1.5;
  const cloudShift = (frame * 1.6) % 2400;
  const hillShift = (frame * 4.2) % 2200;
  const treeShift = (frame * 12) % 2400;
  const poleShift = (frame * 17) % 2400;
  const phoneScroll = (frame * 1.8 + progress * 120) % 60;
  const screenGlow = 0.24 + Math.sin(frame / 10) * 0.05;

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <clipPath id="sx1-win-clip">
          <rect x={80} y={145} width={1760} height={415} rx={36} />
        </clipPath>
        <linearGradient id="sx1-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="sx1-phone-glow" x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity={screenGlow + 0.2} />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Full-bleed bus cabin interior background */}
      <rect x={0} y={0} width={1920} height={1080} fill="#e2e8f0" />
      <rect x={0} y={0} width={1920} height={140} fill="#cbd5e1" />
      <rect x={0} y={580} width={1920} height={500} fill="#94a3b8" />

      {/* Panoramic window scenery scrolling fast to the left */}
      <g clipPath="url(#sx1-win-clip)">
        <rect x={80} y={145} width={1760} height={415} fill="url(#sx1-sky)" />

        {/* Distant clouds */}
        {[0, 1].map((loop) => (
          <g key={`c-${loop}`} transform={`translate(${loop * 2400 - cloudShift}, 0)`}>
            {[260, 820, 1460, 2040].map((cx, idx) => (
              <g key={cx} transform={`translate(${cx}, ${205 + (idx % 2) * 32})`}>
                <ellipse cx={0} cy={0} rx={78} ry={28} fill="#ffffff" />
                <circle cx={-32} cy={-12} r={26} fill="#ffffff" />
                <circle cx={18} cy={-18} r={32} fill="#ffffff" />
              </g>
            ))}
          </g>
        ))}

        {/* Rolling distant hills */}
        {[0, 1].map((loop) => (
          <g key={`h-${loop}`} transform={`translate(${loop * 2200 - hillShift}, 0)`}>
            <path
              d="M 0 560 L 0 430 Q 280 330 560 420 T 1100 400 T 1650 430 T 2200 410 L 2200 560 Z"
              fill="#86efac"
              stroke={STROKE}
              strokeWidth={4}
            />
          </g>
        ))}

        {/* Fast passing trees */}
        {[0, 1].map((loop) => (
          <g key={`t-${loop}`} transform={`translate(${loop * 2400 - treeShift}, 0)`}>
            {[160, 460, 820, 1140, 1520, 1860, 2180].map((tx, idx) => {
              const h = 115 + (idx % 3) * 28;
              return (
                <g key={tx} transform={`translate(${tx}, ${560 - h})`}>
                  <rect x={-12} y={h * 0.45} width={24} height={h * 0.65} fill="#92400e" stroke={STROKE} strokeWidth={5} />
                  <circle cx={0} cy={h * 0.3} r={54} fill="#22c55e" stroke={STROKE} strokeWidth={5} />
                  <circle cx={-30} cy={h * 0.42} r={36} fill="#4ade80" stroke={STROKE} strokeWidth={5} />
                  <circle cx={30} cy={h * 0.42} r={36} fill="#4ade80" stroke={STROKE} strokeWidth={5} />
                </g>
              );
            })}
          </g>
        ))}

        {/* Fast utility poles & wires */}
        {[0, 1].map((loop) => (
          <g key={`p-${loop}`} transform={`translate(${loop * 2400 - poleShift}, 0)`}>
            {[300, 1100, 1900].map((px) => (
              <g key={px}>
                <line x1={px} y1={170} x2={px} y2={560} stroke="#475569" strokeWidth={12} />
                <line x1={px - 42} y1={215} x2={px + 42} y2={215} stroke="#475569" strokeWidth={8} />
                <path
                  d={`M ${px} 215 Q ${px + 400} 255 ${px + 800} 215`}
                  fill="none"
                  stroke="#334155"
                  strokeWidth={4}
                />
              </g>
            ))}
          </g>
        ))}

        {/* Speed lines in window */}
        {[230, 340, 470].map((ly, i) => {
          const lx = 1920 - ((frame * (22 + i * 5) + i * 520) % 2100);
          return (
            <line
              key={ly}
              x1={lx}
              y1={ly}
              x2={lx + 150}
              y2={ly}
              stroke="#ffffff"
              strokeWidth={4}
              strokeOpacity={0.55}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* Bus cabin frame & interior bouncing gently with Math.sin(frame/5) */}
      <g transform={`translate(0, ${bounceY + wheelRumble})`}>
        {/* Window border & pillar */}
        <rect
          x={80}
          y={145}
          width={1760}
          height={415}
          rx={36}
          fill="none"
          stroke={STROKE}
          strokeWidth={8}
        />
        {/* Window vertical divider pillar */}
        <rect x={950} y={145} width={44} height={415} fill="#cbd5e1" stroke={STROKE} strokeWidth={7} />
        {/* Window sill */}
        <rect x={40} y={555} width={1840} height={36} rx={14} fill="#64748b" stroke={STROKE} strokeWidth={6} />

        {/* === FRONT SEAT (RIGHT): GRANDPA STICKMAN HAPPILY LOOKING OUT WINDOW === */}
        <g transform="translate(1360, 0)">
          {/* Seat backrest */}
          <rect
            x={-165}
            y={470}
            width={110}
            height={365}
            rx={34}
            fill="#2563eb"
            stroke={STROKE}
            strokeWidth={7}
          />
          {/* Seat cushion */}
          <rect
            x={-140}
            y={740}
            width={320}
            height={88}
            rx={28}
            fill="#3b82f6"
            stroke={STROKE}
            strokeWidth={7}
          />
          {/* Grandpa stickman body */}
          <line x1={-15} y1={520} x2={-15} y2={735} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
          {/* Seated thighs & legs */}
          <path
            d="M -15 735 L 115 735 L 140 845"
            fill="none"
            stroke={STROKE}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Relaxed arm on window sill */}
          <path
            d="M -15 575 L 75 595 L 130 562"
            fill="none"
            stroke={STROKE}
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Grandpa head gently bobbing */}
          <g transform={`translate(-8, ${435 + Math.sin(frame / 9) * 3})`}>
            <circle cx={0} cy={0} r={74} fill="#ffffff" stroke={STROKE} strokeWidth={7} />
            {/* White hair tufts */}
            <path
              d="M -52 -52 Q -30 -84 0 -74 Q 32 -84 52 -52"
              fill="none"
              stroke="#94a3b8"
              strokeWidth={10}
              strokeLinecap="round"
            />
            {/* Clean 2D eyes looking out right/ahead */}
            <Eye2D cx={14} cy={-12} r={11} pupilDx={4} pupilDy={-1} />
            <Eye2D cx={46} cy={-12} r={11} pupilDx={4} pupilDy={-1} />
            {/* Round glasses */}
            <circle cx={14} cy={-12} r={19} fill="none" stroke={STROKE} strokeWidth={4} />
            <circle cx={46} cy={-12} r={19} fill="none" stroke={STROKE} strokeWidth={4} />
            <line x1={33} y1={-12} x2={27} y2={-12} stroke={STROKE} strokeWidth={4} />
            {/* Friendly mustache & warm smile */}
            <path d="M 10 16 Q 28 4 46 16" fill="none" stroke="#94a3b8" strokeWidth={8} strokeLinecap="round" />
            <path d="M 12 28 Q 30 44 48 26" fill="none" stroke={STROKE} strokeWidth={5.5} strokeLinecap="round" />
          </g>
          {/* Cheerful music/relax note near grandpa */}
          <g
            transform={`translate(98, ${335 + Math.sin(frame / 10) * 8})`}
            opacity={0.7 + 0.3 * Math.sin(frame / 12)}
          >
            <path
              d="M 0 28 L 0 0 L 26 -8 L 26 20"
              fill="none"
              stroke="#0284c7"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={-6} cy={28} r={7} fill="#0284c7" />
            <circle cx={20} cy={20} r={7} fill="#0284c7" />
          </g>
        </g>

        {/* === BACK SEAT (LEFT): BOY STICKMAN LOOKING DOWN AT PHONE === */}
        <g transform="translate(560, 0)">
          {/* Seat backrest */}
          <rect
            x={-165}
            y={470}
            width={110}
            height={365}
            rx={34}
            fill="#2563eb"
            stroke={STROKE}
            strokeWidth={7}
          />
          {/* Seat cushion */}
          <rect
            x={-140}
            y={740}
            width={320}
            height={88}
            rx={28}
            fill="#3b82f6"
            stroke={STROKE}
            strokeWidth={7}
          />

          {/* Phone light cone shining onto boy's face */}
          <polygon points="155,615 -20,400 105,360 205,585" fill="url(#sx1-phone-glow)" />

          {/* Boy stickman hunched torso */}
          <path
            d="M -18 735 Q -8 620 20 530"
            fill="none"
            stroke={STROKE}
            strokeWidth={8}
            strokeLinecap="round"
          />
          {/* Seated legs */}
          <path
            d="M -18 735 L 105 735 L 125 845"
            fill="none"
            stroke={STROKE}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Both arms holding smartphone */}
          <path
            d="M 8 575 L 88 640 L 154 612"
            fill="none"
            stroke={STROKE}
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 18 565 L 110 618 L 166 596"
            fill="none"
            stroke={STROKE}
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing smartphone */}
          <g transform="translate(178, 598) rotate(22)">
            <rect x={-26} y={-50} width={52} height={100} rx={12} fill="#1e293b" stroke={STROKE} strokeWidth={5} />
            <rect x={-19} y={-40} width={38} height={78} rx={6} fill="#38bdf8" />
            {/* Scrolling comic lines */}
            <line x1={-12} y1={-25 + (phoneScroll % 20)} x2={12} y2={-25 + (phoneScroll % 20)} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
            <line x1={-12} y1={-5 + (phoneScroll % 20)} x2={8} y2={-5 + (phoneScroll % 20)} stroke="#e0f2fe" strokeWidth={4} strokeLinecap="round" />
            <line x1={-12} y1={15 + (phoneScroll % 20)} x2={12} y2={15 + (phoneScroll % 20)} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
          </g>

          {/* Boy head tilted down focused on phone */}
          <g transform={`translate(40, 456) rotate(${24 + Math.sin(frame / 14) * 2})`}>
            <circle cx={0} cy={0} r={68} fill="#ffffff" stroke={STROKE} strokeWidth={7} />
            {/* Spiky hair tuft */}
            <path
              d="M -30 -64 L -12 -86 L 2 -66 L 20 -82 L 26 -60"
              fill="none"
              stroke={STROKE}
              strokeWidth={6.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Clean 2D eyes looking down at phone */}
            <Eye2D cx={14} cy={-6} r={11} pupilDx={4} pupilDy={4} />
            <Eye2D cx={44} cy={-6} r={11} pupilDx={4} pupilDy={4} />
            {/* Focused eyebrows */}
            <line x1={2} y1={-24} x2={24} y2={-20} stroke={STROKE} strokeWidth={5} strokeLinecap="round" />
            <line x1={34} y1={-20} x2={56} y2={-24} stroke={STROKE} strokeWidth={5} strokeLinecap="round" />
            {/* Small absorbed smile */}
            <path d="M 18 24 Q 30 32 42 24" fill="none" stroke={STROKE} strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>

        {/* Armrests */}
        <rect x={420} y={675} width={220} height={24} rx={12} fill="#1d4ed8" stroke={STROKE} strokeWidth={5.5} />
        <rect x={1220} y={675} width={220} height={24} rx={12} fill="#1d4ed8" stroke={STROKE} strokeWidth={5.5} />
      </g>
    </svg>
  );
};

/* ============================================================================
 * 2. SayXeCarDizzyWavesVisual
 * Cận cảnh trong khoang xe rung lắc mạnh hơn, cậu bé stickman mặt tái xanh nhạt,
 * lông mày nhíu khổ sở, mồ hôi rơi, có vòng xoáy chóng mặt quay tròn quanh đầu
 * và sóng xanh cồn cào quanh bụng.
 * ============================================================================ */
export const SayXeCarDizzyWavesVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const intensity = 0.75 + 0.35 * easeOutCubic(progress);
  const shakeX = Math.sin(frame / 2.2) * 8 * intensity;
  const shakeY = Math.cos(frame / 2.8) * 11 * intensity;
  const tilt = Math.sin(frame / 4.5) * 2.8 * intensity;
  const swirlAngle = (frame * 5.5) % 360;
  const bgScroll = (frame * 16) % 2400;
  const sweat1Y = (frame * 2.6) % 130;
  const sweat2Y = (frame * 2.6 + 65) % 130;
  const waveShift = (frame * 6) % 240;

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <clipPath id="sx2-win-clip">
          <rect x={110} y={135} width={1700} height={470} rx={36} />
        </clipPath>
      </defs>

      {/* Cabin interior shaking */}
      <g transform={`translate(${shakeX}, ${shakeY}) rotate(${tilt}, 960, 540)`}>
        <rect x={-60} y={-60} width={2040} height={1200} fill="#e2e8f0" />

        {/* Fast motion-blurred window scenery */}
        <g clipPath="url(#sx2-win-clip)">
          <rect x={110} y={135} width={1700} height={470} fill="#bae6fd" />
          {[0, 1].map((loop) => (
            <g key={loop} transform={`translate(${loop * 2400 - bgScroll}, 0)`}>
              {[220, 680, 1180, 1680, 2120].map((tx) => (
                <g key={tx}>
                  <rect x={tx - 16} y={420} width={32} height={190} fill="#78350f" />
                  <ellipse cx={tx} cy={385} rx={88} ry={66} fill="#4ade80" stroke={STROKE} strokeWidth={5} />
                </g>
              ))}
            </g>
          ))}
          {/* Horizontal motion streaks */}
          {[220, 310, 410, 510].map((y, idx) => (
            <line
              key={y}
              x1={180 + ((frame * 24 + idx * 390) % 1500)}
              y1={y}
              x2={420 + ((frame * 24 + idx * 390) % 1500)}
              y2={y}
              stroke="#ffffff"
              strokeWidth={6}
              strokeOpacity={0.65}
              strokeLinecap="round"
            />
          ))}
        </g>

        <rect x={110} y={135} width={1700} height={470} rx={36} fill="none" stroke={STROKE} strokeWidth={8} />
        <rect x={60} y={595} width={1800} height={40} rx={16} fill="#64748b" stroke={STROKE} strokeWidth={6} />

        {/* Big close-up bus seat behind boy */}
        <rect x={680} y={370} width={560} height={495} rx={65} fill="#3b82f6" stroke={STROKE} strokeWidth={8} />
        <rect x={755} y={325} width={410} height={100} rx={38} fill="#2563eb" stroke={STROKE} strokeWidth={7} />

        {/* === CLOSE-UP BOY STICKMAN (CENTER) === */}
        <g transform="translate(960, 0)">
          {/* Churning green nausea waves around belly (y = 610..815) */}
          {[0, 1, 2].map((row) => {
            const wy = 645 + row * 56;
            const dir = row % 2 === 0 ? 1 : -1;
            const ox = Math.sin(frame / 4 + row) * 18 * dir;
            return (
              <path
                key={row}
                d={`M ${-250 + ox} ${wy}
                    Q ${-175 + ox} ${wy - 26}, ${-100 + ox} ${wy}
                    T ${50 + ox} ${wy}
                    T ${200 + ox} ${wy}
                    T ${270 + ox} ${wy}`}
                fill="none"
                stroke={row === 1 ? '#22c55e' : '#4ade80'}
                strokeWidth={12}
                strokeLinecap="round"
                strokeOpacity={0.85}
              />
            );
          })}

          {/* Nausea bubbles rising from belly */}
          {[-170, -110, 130, 185].map((bx, i) => {
            const by = 780 - ((waveShift + i * 55) % 180);
            return (
              <circle
                key={bx}
                cx={bx + Math.sin(frame / 6 + i) * 10}
                cy={by}
                r={10 + (i % 2) * 5}
                fill="#86efac"
                stroke="#16a34a"
                strokeWidth={4}
              />
            );
          })}

          {/* Boy stick torso */}
          <line x1={0} y1={520} x2={0} y2={820} stroke={STROKE} strokeWidth={10} strokeLinecap="round" />

          {/* Left arm clutching churning stomach */}
          <path
            d="M 0 585 Q -120 635 -15 710"
            fill="none"
            stroke={STROKE}
            strokeWidth={9}
            strokeLinecap="round"
          />
          {/* Right arm drooping with phone */}
          <path
            d="M 0 585 Q 145 630 215 715"
            fill="none"
            stroke={STROKE}
            strokeWidth={9}
            strokeLinecap="round"
          />
          {/* Tilted smartphone in hand */}
          <g transform="translate(232, 725) rotate(28)">
            <rect x={-26} y={-48} width={52} height={96} rx={12} fill="#1e293b" stroke={STROKE} strokeWidth={5} />
            <rect x={-19} y={-38} width={38} height={74} rx={6} fill="#38bdf8" />
          </g>

          {/* Boy Head — pale sickly green tint */}
          <g transform={`translate(0, 420) rotate(${Math.sin(frame / 5) * 4})`}>
            <circle cx={0} cy={0} r={116} fill="#dcfce7" stroke={STROKE} strokeWidth={8} />
            {/* Messy hair */}
            <path
              d="M -48 -106 L -22 -140 L 0 -114 L 26 -138 L 44 -105"
              fill="none"
              stroke={STROKE}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Sickly green cheek shading */}
            <ellipse cx={-64} cy={18} rx={22} ry={13} fill="#86efac" />
            <ellipse cx={64} cy={18} rx={22} ry={13} fill="#86efac" />

            {/* Clean 2D eyes wobbling uncomfortably */}
            <Eye2D
              cx={-42}
              cy={-10}
              r={18}
              pupilDx={Math.cos(frame / 4) * 5}
              pupilDy={Math.sin(frame / 4) * 5}
              pupilR={7}
            />
            <Eye2D
              cx={42}
              cy={-10}
              r={18}
              pupilDx={Math.sin(frame / 4) * 5}
              pupilDy={Math.cos(frame / 4) * 5}
              pupilR={7}
            />

            {/* Furrowed distressed eyebrows */}
            <path d="M -72 -32 L -18 -46" fill="none" stroke={STROKE} strokeWidth={7} strokeLinecap="round" />
            <path d="M 72 -32 L 18 -46" fill="none" stroke={STROKE} strokeWidth={7} strokeLinecap="round" />

            {/* Wavy queasy mouth */}
            <path
              d="M -42 46 Q -22 30 0 46 T 42 46"
              fill="none"
              stroke={STROKE}
              strokeWidth={7}
              strokeLinecap="round"
            />

            {/* Falling sweat drops */}
            <path
              d={`M -112 ${-55 + sweat1Y} Q -124 ${-35 + sweat1Y} -112 ${-24 + sweat1Y} Q -100 ${-35 + sweat1Y} -112 ${-55 + sweat1Y} Z`}
              fill="#38bdf8"
              stroke={STROKE}
              strokeWidth={4}
              opacity={1 - sweat1Y / 130}
            />
            <path
              d={`M 118 ${-40 + sweat2Y} Q 106 ${-20 + sweat2Y} 118 ${-9 + sweat2Y} Q 130 ${-20 + sweat2Y} 118 ${-40 + sweat2Y} Z`}
              fill="#38bdf8"
              stroke={STROKE}
              strokeWidth={4}
              opacity={1 - sweat2Y / 130}
            />
          </g>

          {/* Spinning dizzy halo spirals around head (y = 155..275, safely below 130) */}
          <g transform="translate(0, 225)">
            <ellipse
              cx={0}
              cy={0}
              rx={175}
              ry={44}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={7}
              strokeDasharray="36 22"
              strokeDashoffset={-frame * 5}
              strokeLinecap="round"
            />
            {/* Spinning mini spirals left & right */}
            {[-215, 215].map((sx, idx) => (
              <g
                key={sx}
                transform={`translate(${sx}, 22) rotate(${idx === 0 ? swirlAngle : -swirlAngle})`}
              >
                <path
                  d="M 0 0 C 12 -12, 26 2, 18 18 C 8 34, -22 30, -28 8 C -34 -18, -8 -40, 22 -34"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        </g>

        {/* Vibration impact marks on left & right */}
        {[-1, 1].map((side) => (
          <g
            key={side}
            transform={`translate(${960 + side * 520}, 420) scale(${side}, 1)`}
            opacity={0.55 + 0.45 * Math.abs(Math.sin(frame / 3))}
          >
            <path d="M 0 -45 Q 25 0 0 45" fill="none" stroke="#ef4444" strokeWidth={7} strokeLinecap="round" />
            <path d="M 28 -65 Q 58 0 28 65" fill="none" stroke="#f97316" strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  );
};

/* ============================================================================
 * 3. SayXeCarStopBreatheVisual
 * Xe khách đỗ bên vệ đường cạnh tán cây xanh mát; cậu bé đứng hít thở sâu
 * (vòng gió trong lành xanh nhạt), ông nội đứng bên cạnh cầm chai nước mát
 * đưa tới mỉm cười hiền.
 * ============================================================================ */
export const SayXeCarStopBreatheVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const breath = Math.sin(frame / 16);
  const breezeDash = -frame * 4.5;
  const leafSway = Math.sin(frame / 18) * 3.2;
  const hazardBlink = Math.sin(frame / 7) > 0;
  const offerShift = easeOutCubic(progress) * 16;

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sx3-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
      </defs>

      {/* Bright sunny sky */}
      <rect x={0} y={0} width={1920} height={740} fill="url(#sx3-sky)" />

      {/* Warm sun top-left (below title zone) */}
      <g transform="translate(190, 215)">
        <circle cx={0} cy={0} r={52} fill="#fde047" stroke={STROKE} strokeWidth={6} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1={Math.cos(((deg + frame * 0.4) * Math.PI) / 180) * 68}
            y1={Math.sin(((deg + frame * 0.4) * Math.PI) / 180) * 68}
            x2={Math.cos(((deg + frame * 0.4) * Math.PI) / 180) * 86}
            y2={Math.sin(((deg + frame * 0.4) * Math.PI) / 180) * 86}
            stroke="#facc15"
            strokeWidth={6}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Soft drifting clouds */}
      {[540, 1080].map((cx, i) => (
        <g key={cx} transform={`translate(${cx + Math.sin(frame / 50 + i) * 28}, ${210 + i * 35})`}>
          <ellipse cx={0} cy={0} rx={82} ry={28} fill="#ffffff" stroke="#cbd5e1" strokeWidth={3} />
          <circle cx={-30} cy={-14} r={26} fill="#ffffff" />
          <circle cx={20} cy={-18} r={32} fill="#ffffff" />
        </g>
      ))}

      {/* Grassy roadside verge & paved road */}
      <path d="M 0 680 Q 600 645 1280 675 T 1920 660 L 1920 820 L 0 820 Z" fill="#86efac" stroke={STROKE} strokeWidth={6} />
      <rect x={0} y={795} width={1920} height={285} fill="#94a3b8" stroke={STROKE} strokeWidth={6} />
      <line x1={0} y1={845} x2={1920} y2={845} stroke="#f8fafc" strokeWidth={8} strokeDasharray="70 50" />

      {/* Big shady roadside tree on right */}
      <g transform={`translate(1660, 740)`}>
        <path
          d="M -42 0 L -28 -360 L 28 -360 L 46 0 Z"
          fill="#92400e"
          stroke={STROKE}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <g transform={`rotate(${leafSway}, 0, -340)`}>
          <circle cx={-120} cy={-380} r={125} fill="#22c55e" stroke={STROKE} strokeWidth={7} />
          <circle cx={70} cy={-400} r={135} fill="#22c55e" stroke={STROKE} strokeWidth={7} />
          <circle cx={-25} cy={-485} r={130} fill="#4ade80" stroke={STROKE} strokeWidth={7} />
          <circle cx={-50} cy={-360} r={110} fill="#4ade80" />
        </g>
      </g>

      {/* === PARKED PASSENGER BUS (LEFT) === */}
      <g transform="translate(80, 415)">
        {/* Bus shadow */}
        <ellipse cx={365} cy={385} rx={360} ry={22} fill="#475569" fillOpacity={0.35} />
        {/* Main body */}
        <rect x={20} y={20} width={710} height={320} rx={36} fill="#facc15" stroke={STROKE} strokeWidth={7} />
        {/* Accent stripe */}
        <rect x={20} y={215} width={710} height={42} fill="#3b82f6" stroke={STROKE} strokeWidth={6} />
        {/* Bus windows */}
        {[58, 225, 392].map((wx) => (
          <rect key={wx} x={wx} y={62} width={145} height={120} rx={18} fill="#e0f2fe" stroke={STROKE} strokeWidth={6} />
        ))}
        {/* Open passenger door */}
        <rect x={575} y={70} width={115} height={265} rx={14} fill="#334155" stroke={STROKE} strokeWidth={6} />
        <rect x={655} y={78} width={35} height={248} rx={8} fill="#bae6fd" stroke={STROKE} strokeWidth={5} />
        {/* Blinking hazard light */}
        <circle
          cx={724}
          cy={285}
          r={14}
          fill={hazardBlink ? '#f97316' : '#fed7aa'}
          stroke={STROKE}
          strokeWidth={4.5}
        />
        {/* Wheels */}
        {[170, 520].map((cx) => (
          <g key={cx} transform={`translate(${cx}, 340)`}>
            <circle cx={0} cy={0} r={48} fill="#1e293b" stroke={STROKE} strokeWidth={6} />
            <circle cx={0} cy={0} r={22} fill="#cbd5e1" stroke={STROKE} strokeWidth={4} />
          </g>
        ))}
      </g>

      {/* === BOY STICKMAN BREATHING FRESH AIR (CENTER-RIGHT) === */}
      <g transform="translate(1055, 0)">
        {/* Fresh air light-blue wind swirls */}
        <path
          d="M -210 470 C -130 435, -75 495, -20 465 C 25 440, 5 395, -35 408"
          fill="none"
          stroke="#38bdf8"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray="46 22"
          strokeDashoffset={breezeDash}
        />
        <path
          d="M -180 545 C -90 520, -40 570, 35 535 C 75 516, 65 480, 35 488"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray="40 24"
          strokeDashoffset={breezeDash * 0.85}
        />
        <path
          d="M -140 390 Q -65 360 -5 392"
          fill="none"
          stroke="#38bdf8"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="30 18"
          strokeDashoffset={breezeDash * 1.1}
        />

        {/* Standing shadow */}
        <ellipse cx={0} cy={805} rx={58} ry={14} fill="#15803d" fillOpacity={0.28} />
        {/* Legs */}
        <line x1={0} y1={665} x2={-36} y2={800} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
        <line x1={0} y1={665} x2={36} y2={800} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
        {/* Torso gently expanding with breath */}
        <line x1={0} y1={525 - breath * 4} x2={0} y2={665} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
        {/* Arms relaxed / hands on hips or open */}
        <path
          d={`M 0 ${560 - breath * 4} L -52 ${612} L -28 ${650}`}
          fill="none"
          stroke={STROKE}
          strokeWidth={7.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M 0 ${560 - breath * 4} L 54 ${608} L 34 ${648}`}
          fill="none"
          stroke={STROKE}
          strokeWidth={7.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Boy head — relieved & healthy white */}
        <g transform={`translate(0, ${458 - breath * 5})`}>
          <circle cx={0} cy={0} r={66} fill="#ffffff" stroke={STROKE} strokeWidth={7} />
          <path
            d="M -28 -62 L -10 -84 L 4 -64 L 22 -80 L 28 -58"
            fill="none"
            stroke={STROKE}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Clean 2D calm happy eyes */}
          <Eye2D cx={-22} cy={-8} r={10.5} pupilDx={2} pupilDy={-1} />
          <Eye2D cx={22} cy={-8} r={10.5} pupilDx={2} pupilDy={-1} />
          {/* Relieved happy smile */}
          <path d="M -22 20 Q 0 40 22 20" fill="none" stroke={STROKE} strokeWidth={5.5} strokeLinecap="round" />
        </g>
      </g>

      {/* === GRANDPA STICKMAN OFFERING COOL WATER BOTTLE === */}
      <g transform="translate(1375, 0)">
        <ellipse cx={0} cy={805} rx={62} ry={14} fill="#15803d" fillOpacity={0.28} />
        {/* Legs */}
        <line x1={0} y1={655} x2={-34} y2={800} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
        <line x1={0} y1={655} x2={34} y2={800} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
        {/* Torso */}
        <line x1={0} y1={500} x2={0} y2={655} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
        {/* Back arm */}
        <path d="M 0 540 L 48 615 L 28 650" fill="none" stroke={STROKE} strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Extended arm offering water bottle */}
        <path
          d={`M 0 540 L ${-74 - offerShift * 0.5} 562 L ${-148 - offerShift} 540`}
          fill="none"
          stroke={STROKE}
          strokeWidth={7.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cool Water Bottle */}
        <g transform={`translate(${-162 - offerShift}, 530) rotate(-14)`}>
          <rect x={-18} y={-34} width={36} height={74} rx={10} fill="#e0f2fe" stroke={STROKE} strokeWidth={5} />
          <rect x={-14} y={-4} width={28} height={40} rx={6} fill="#38bdf8" />
          <rect x={-10} y={-48} width={20} height={15} rx={4} fill="#0284c7" stroke={STROKE} strokeWidth={4.5} />
          {/* Cool sparkle lines */}
          <line x1={-32} y1={-18} x2={-44} y2={-24} stroke="#38bdf8" strokeWidth={4.5} strokeLinecap="round" />
          <line x1={-34} y1={4} x2={-48} y2={4} stroke="#38bdf8" strokeWidth={4.5} strokeLinecap="round" />
        </g>

        {/* Grandpa Head smiling kindly */}
        <g transform="translate(-4, 428)">
          <circle cx={0} cy={0} r={70} fill="#ffffff" stroke={STROKE} strokeWidth={7} />
          <path
            d="M -48 -48 Q -24 -80 0 -70 Q 26 -80 48 -48"
            fill="none"
            stroke="#94a3b8"
            strokeWidth={10}
            strokeLinecap="round"
          />
          {/* Clean 2D eyes looking kindly left toward boy */}
          <Eye2D cx={-38} cy={-10} r={10.5} pupilDx={-3} pupilDy={0} />
          <Eye2D cx={-6} cy={-10} r={10.5} pupilDx={-3} pupilDy={0} />
          <circle cx={-38} cy={-10} r={18} fill="none" stroke={STROKE} strokeWidth={4} />
          <circle cx={-6} cy={-10} r={18} fill="none" stroke={STROKE} strokeWidth={4} />
          <line x1={-20} y1={-10} x2={-24} y2={-10} stroke={STROKE} strokeWidth={4} />
          {/* White mustache & kind smile */}
          <path d="M -42 16 Q -24 4 -6 16" fill="none" stroke="#94a3b8" strokeWidth={8} strokeLinecap="round" />
          <path d="M -38 28 Q -22 44 -6 26" fill="none" stroke={STROKE} strokeWidth={5.5} strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
};

/* ============================================================================
 * 4. SayXeEyeSeesStillVisual
 * Hoạt họa tràn màn hình giải thích Mắt: bên trái đôi mắt phóng đại nhìn thẳng
 * vào màn hình điện thoại & ghế xe đứng im; mũi tên xanh lá chạy sáng gửi tín
 * hiệu tới bộ não bên phải với nhãn rõ nét "MẮT BÁO: ĐANG ĐỨNG YÊN!".
 * ============================================================================ */
export const SayXeEyeSeesStillVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const reveal = easeOutCubic(progress);
  const pulsePos = (frame * 7) % 380;
  const eyeScanY = Math.sin(frame / 18) * 5;
  const brainGlow = 0.2 + 0.15 * Math.sin(frame / 10);

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      {/* Full-screen fresh mint studio backdrop */}
      <rect x={0} y={0} width={1920} height={1080} fill="#f0fdf4" />
      <circle cx={440} cy={520} r={340} fill="#dcfce7" fillOpacity={0.55} />
      <circle cx={1520} cy={510} r={270} fill="#dcfce7" fillOpacity={0.55} />

      {/* === LEFT: STATIC PHONE & CAR SEAT + MAGNIFIED EYE === */}
      {/* Static car seat silhouette & phone being watched */}
      <g transform="translate(150, 320)">
        {/* Car seat back (completely still) */}
        <rect x={0} y={70} width={155} height={290} rx={28} fill="#cbd5e1" stroke={STROKE} strokeWidth={6} />
        <rect x={24} y={28} width={108} height={54} rx={18} fill="#94a3b8" stroke={STROKE} strokeWidth={6} />
        {/* Smartphone held still */}
        <rect x={112} y={135} width={96} height={174} rx={18} fill="#1e293b" stroke={STROKE} strokeWidth={6} />
        <rect x={124} y={152} width={72} height={138} rx={8} fill="#38bdf8" />
        {/* Static text lines on screen */}
        <line x1={136} y1={178} x2={184} y2={178} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
        <line x1={136} y1={202} x2={176} y2={202} stroke="#e0f2fe" strokeWidth={5} strokeLinecap="round" />
        <line x1={136} y1={226} x2={184} y2={226} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
        <line x1={136} y1={250} x2={168} y2={250} stroke="#e0f2fe" strokeWidth={5} strokeLinecap="round" />
        {/* "ĐỨNG IM" mini tag */}
        <rect x={26} y={388} width={196} height={46} rx={23} fill="#ffffff" stroke="#16a34a" strokeWidth={4.5} />
        <text x={124} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill="#166534">
          GHẾ &amp; ĐIỆN THOẠI IM
        </text>
      </g>

      {/* Sightline cone from phone/seat to magnified eye */}
      <polygon
        points="355,455 570,385 570,635 355,595"
        fill="#4ade80"
        fillOpacity={0.2}
      />
      <line x1={355} y1={465} x2={560} y2={420} stroke="#16a34a" strokeWidth={4.5} strokeDasharray="12 10" />
      <line x1={355} y1={585} x2={560} y2={600} stroke="#16a34a" strokeWidth={4.5} strokeDasharray="12 10" />

      {/* Magnified Clean 2D Eye */}
      <g transform="translate(655, 510)">
        <path
          d="M -185 0 Q 0 -145 185 0 Q 0 145 -185 0 Z"
          fill="#ffffff"
          stroke={STROKE}
          strokeWidth={8}
          strokeLinejoin="round"
        />
        {/* Iris & Pupil (clean 2D, no anime sparkles) */}
        <circle cx={-18} cy={eyeScanY} r={66} fill="#3b82f6" stroke={STROKE} strokeWidth={6} />
        <circle cx={-26} cy={eyeScanY} r={32} fill={STROKE} />
        {/* Upper eyelid crease */}
        <path d="M -150 -38 Q 0 -130 150 -38" fill="none" stroke={STROKE} strokeWidth={5} strokeLinecap="round" />
      </g>

      {/* === CENTER: BRIGHT GREEN SIGNAL ARROW TO BRAIN === */}
      <g transform="translate(880, 510)">
        {/* Arrow shaft */}
        <line
          x1={0}
          y1={0}
          x2={395}
          y2={0}
          stroke="#bbf7d0"
          strokeWidth={28}
          strokeLinecap="round"
        />
        <line
          x1={0}
          y1={0}
          x2={395}
          y2={0}
          stroke="#22c55e"
          strokeWidth={14}
          strokeDasharray="34 22"
          strokeDashoffset={-frame * 6}
          strokeLinecap="round"
        />
        {/* Traveling bright signal orb */}
        <circle cx={pulsePos} cy={0} r={16} fill="#ffffff" stroke="#16a34a" strokeWidth={6} />
        {/* Arrowhead */}
        <polygon
          points="382,-34 446,0 382,34"
          fill="#22c55e"
          stroke={STROKE}
          strokeWidth={6}
          strokeLinejoin="round"
        />
      </g>

      {/* === RIGHT: CARTOON BRAIN RECEIVING CALM SIGNAL === */}
      <g transform="translate(1545, 510)">
        <circle cx={0} cy={0} r={195} fill="#4ade80" fillOpacity={brainGlow} />
        <CartoonBrain cx={0} cy={0} scale={1.18} fill="#fbcfe8" accent="#f472b6" />
        {/* Green checkmark badge on brain */}
        <g transform={`translate(110, -115) scale(${0.85 + 0.15 * reveal})`}>
          <circle cx={0} cy={0} r={42} fill="#22c55e" stroke={STROKE} strokeWidth={6} />
          <path d="M -18 2 L -4 16 L 20 -14" fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Crisp main callout label (inside safe zone y = 130..850) */}
      <LabelPill
        cx={960}
        cy={215}
        width={680}
        height={78}
        text="MẮT BÁO: ĐANG ĐỨNG YÊN!"
        bgColor="#dcfce7"
        borderColor="#16a34a"
        textColor="#14532d"
        fontSize={34}
        opacity={0.4 + 0.6 * reveal}
      />
    </svg>
  );
};

/* ============================================================================
 * 5. SayXeInnerEarFluidVisual
 * Hoạt họa tràn màn hình giải thích Tai Trong (hệ tiền đình): bên trái là 3 ống
 * vòng bán khuyên màu cam/hồng chứa chất lỏng xanh dương chao đảo mạnh trái-phải
 * theo nhịp xe chạy, các sợi lông cảm biến nghiêng ngả liên tục; mũi tên đỏ chạy
 * tới bộ não với nhãn "TAI TRONG BÁO: ĐANG LAO TỚI & LẮC LƯ!".
 * ============================================================================ */
export const SayXeInnerEarFluidVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const reveal = easeOutCubic(progress);
  const sloshPhase = frame / 6.5;
  const tiltDeg = Math.sin(sloshPhase) * 8;
  const pulsePos = (frame * 9.5) % 380;
  const brainShake = Math.sin(frame / 3) * 6;

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      {/* Warm amber-cream full-screen backdrop */}
      <rect x={0} y={0} width={1920} height={1080} fill="#fffbeb" />
      <circle cx={480} cy={530} r={330} fill="#fef3c7" fillOpacity={0.85} />
      <circle cx={1545} cy={520} r={270} fill="#fee2e2" fillOpacity={0.65} />

      {/* === LEFT: 3 SEMICIRCULAR CANALS + SLOSHING BLUE FLUID + HAIR CELLS === */}
      {/* Swaying motion arrows around inner ear */}
      <g opacity={0.75 + 0.25 * Math.abs(Math.sin(sloshPhase))}>
        <path
          d="M 180 510 Q 140 430 180 350"
          fill="none"
          stroke="#ef4444"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <polygon points="172,340 195,358 164,366" fill="#ef4444" />
        <path
          d="M 780 350 Q 820 430 780 510"
          fill="none"
          stroke="#ef4444"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <polygon points="788,520 765,502 796,494" fill="#ef4444" />
      </g>

      <SemicircularCanals
        cx={480}
        cy={520}
        scale={1.32}
        sloshPhase={sloshPhase}
        tiltDeg={tiltDeg}
        clipId="sx5-vestibule-clip"
      />

      {/* Component callout captions (inside safe zone y = 130..850) */}
      <g>
        <rect x={235} y={760} width={490} height={54} rx={27} fill="#ffffff" stroke="#f97316" strokeWidth={5} />
        <text x={480} y={796} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill="#9a3412">
          3 ỐNG BÁN KHUYÊN • LÔNG CẢM BIẾN
        </text>
      </g>

      {/* === CENTER: URGENT RED SIGNAL ARROW TO BRAIN === */}
      <g transform="translate(865, 520)">
        <line x1={0} y1={0} x2={400} y2={0} stroke="#fecaca" strokeWidth={30} strokeLinecap="round" />
        <line
          x1={0}
          y1={0}
          x2={400}
          y2={0}
          stroke="#ef4444"
          strokeWidth={15}
          strokeDasharray="34 20"
          strokeDashoffset={-frame * 9}
          strokeLinecap="round"
        />
        {/* Urgent red signal pulse */}
        <circle cx={pulsePos} cy={0} r={18} fill="#facc15" stroke="#dc2626" strokeWidth={6} />
        <polygon
          points="386,-36 452,0 386,36"
          fill="#ef4444"
          stroke={STROKE}
          strokeWidth={6}
          strokeLinejoin="round"
        />
      </g>

      {/* === RIGHT: BRAIN SHAKING FROM RED MOTION SIGNAL === */}
      <g transform={`translate(${1545 + brainShake}, 520)`}>
        <CartoonBrain cx={0} cy={0} scale={1.18} fill="#fbcfe8" accent="#f472b6" />
        {/* Red alert exclamation badge */}
        <g transform={`translate(115, -115) scale(${0.9 + 0.12 * Math.sin(frame / 4)})`}>
          <circle cx={0} cy={0} r={42} fill="#ef4444" stroke={STROKE} strokeWidth={6} />
          <line x1={0} y1={-18} x2={0} y2={4} stroke="#ffffff" strokeWidth={9} strokeLinecap="round" />
          <circle cx={0} cy={18} r={5.5} fill="#ffffff" />
        </g>
      </g>

      {/* Main callout label */}
      <LabelPill
        cx={960}
        cy={208}
        width={910}
        height={78}
        text="TAI TRONG BÁO: ĐANG LAO TỚI & LẮC LƯ!"
        bgColor="#fee2e2"
        borderColor="#dc2626"
        textColor="#991b1b"
        fontSize={33}
        opacity={0.4 + 0.6 * reveal}
      />
    </svg>
  );
};

/* ============================================================================
 * 6. SayXeSensoryConflictVisual
 * Màn hình chia đôi đối xứng với Bộ Não ở chính giữa đang nhấp nháy đèn báo động
 * đỏ "XUNG ĐỘT GIÁC QUAN!": bên trái là Mắt gửi tia xanh "ĐỨNG YÊN", bên phải là
 * Tai Trong gửi tia đỏ "CHUYỂN ĐỘNG MẠNH", hai luồng va vào nhau tóe tia sét ngay tại não!
 * ============================================================================ */
export const SayXeSensoryConflictVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const alarmFlash = 0.55 + 0.45 * Math.sin(frame / 3.5);
  const sparkScale = 0.85 + 0.25 * Math.abs(Math.sin(frame / 2.2));
  const brainJitterX = Math.sin(frame * 1.4) * 5;
  const brainJitterY = Math.cos(frame * 1.7) * 4;
  const reveal = easeOutCubic(progress);

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      {/* Symmetrical split full-screen background */}
      <rect x={0} y={0} width={960} height={1080} fill="#ecfdf5" />
      <rect x={960} y={0} width={960} height={1080} fill="#fef2f2" />
      <line x1={960} y1={0} x2={960} y2={1080} stroke={STROKE} strokeWidth={6} strokeDasharray="18 14" strokeOpacity={0.35} />

      {/* === LEFT SIDE: EYE SENDING GREEN BEAM "ĐỨNG YÊN" === */}
      <g transform="translate(275, 510)">
        <path
          d="M -155 0 Q 0 -122 155 0 Q 0 122 -155 0 Z"
          fill="#ffffff"
          stroke={STROKE}
          strokeWidth={8}
        />
        <circle cx={14} cy={0} r={54} fill="#3b82f6" stroke={STROKE} strokeWidth={6} />
        <circle cx={22} cy={0} r={26} fill={STROKE} />
      </g>

      {/* Green beam rightward to brain */}
      <g>
        <line x1={445} y1={510} x2={795} y2={510} stroke="#86efac" strokeWidth={34} strokeLinecap="round" />
        <line
          x1={445}
          y1={510}
          x2={795}
          y2={510}
          stroke="#16a34a"
          strokeWidth={14}
          strokeDasharray="30 18"
          strokeDashoffset={-frame * 7}
          strokeLinecap="round"
        />
        <polygon points="775,478 835,510 775,542" fill="#16a34a" stroke={STROKE} strokeWidth={5} strokeLinejoin="round" />
      </g>

      <LabelPill
        cx={340}
        cy={695}
        width={300}
        height={64}
        text="ĐỨNG YÊN"
        bgColor="#dcfce7"
        borderColor="#16a34a"
        textColor="#14532d"
        fontSize={30}
      />

      {/* === RIGHT SIDE: INNER EAR SENDING RED BEAM "CHUYỂN ĐỘNG MẠNH" === */}
      <SemicircularCanals
        cx={1645}
        cy={505}
        scale={0.92}
        sloshPhase={frame / 5.5}
        tiltDeg={Math.sin(frame / 5.5) * 9}
        clipId="sx6-ear-clip"
      />

      {/* Red beam leftward to brain */}
      <g>
        <line x1={1475} y1={510} x2={1125} y2={510} stroke="#fca5a5" strokeWidth={34} strokeLinecap="round" />
        <line
          x1={1475}
          y1={510}
          x2={1125}
          y2={510}
          stroke="#dc2626"
          strokeWidth={14}
          strokeDasharray="30 18"
          strokeDashoffset={-frame * 9}
          strokeLinecap="round"
        />
        <polygon points="1145,478 1085,510 1145,542" fill="#dc2626" stroke={STROKE} strokeWidth={5} strokeLinejoin="round" />
      </g>

      <LabelPill
        cx={1580}
        cy={695}
        width={420}
        height={64}
        text="CHUYỂN ĐỘNG MẠNH"
        bgColor="#fee2e2"
        borderColor="#dc2626"
        textColor="#991b1b"
        fontSize={28}
      />

      {/* === CENTER: BRAIN WITH FLASHING RED ALARM & COLLISION LIGHTNING === */}
      <g transform={`translate(${960 + brainJitterX}, ${510 + brainJitterY})`}>
        {/* Flashing red alarm halo */}
        <circle cx={0} cy={-185} r={85 + alarmFlash * 24} fill="#ef4444" fillOpacity={0.28 * alarmFlash} />
        <circle cx={0} cy={-185} r={54} fill="#ef4444" fillOpacity={0.45 * alarmFlash} />

        {/* Siren beacon mounted on top of brain (y = 195..315, below y = 130) */}
        <rect x={-46} y={-168} width={92} height={24} rx={8} fill="#475569" stroke={STROKE} strokeWidth={5.5} />
        <path
          d="M -34 -168 L -26 -222 Q 0 -240 26 -222 L 34 -168 Z"
          fill={alarmFlash > 0.6 ? '#ef4444' : '#fca5a5'}
          stroke={STROKE}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {/* Flashing rays */}
        {[-65, -30, 0, 30, 65].map((deg) => (
          <line
            key={deg}
            x1={Math.sin((deg * Math.PI) / 180) * 58}
            y1={-200 - Math.cos((deg * Math.PI) / 180) * 58}
            x2={Math.sin((deg * Math.PI) / 180) * 92}
            y2={-200 - Math.cos((deg * Math.PI) / 180) * 92}
            stroke="#ef4444"
            strokeWidth={7}
            strokeLinecap="round"
            strokeOpacity={alarmFlash}
          />
        ))}

        {/* Brain */}
        <CartoonBrain cx={0} cy={0} scale={1.15} fill="#fbcfe8" accent="#f472b6" />

        {/* Electric collision lightning bolts right at center of brain */}
        <g transform={`scale(${sparkScale})`}>
          <polygon
            points="-18,-88 26,-16 -2,-10 32,76 -26,8 4,2"
            fill="#facc15"
            stroke={STROKE}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          {/* Sparks flying out */}
          <line x1={-68} y1={-55} x2={-102} y2={-85} stroke="#f97316" strokeWidth={7} strokeLinecap="round" />
          <line x1={68} y1={-55} x2={102} y2={-85} stroke="#f97316" strokeWidth={7} strokeLinecap="round" />
          <line x1={-76} y1={55} x2={-110} y2={82} stroke="#facc15" strokeWidth={7} strokeLinecap="round" />
          <line x1={76} y1={55} x2={110} y2={82} stroke="#facc15" strokeWidth={7} strokeLinecap="round" />
        </g>
      </g>

      {/* Main flashing conflict banner (y = 785, well above subtitle zone 890) */}
      <LabelPill
        cx={960}
        cy={790}
        width={620}
        height={80}
        text="XUNG ĐỘT GIÁC QUAN!"
        bgColor={alarmFlash > 0.65 ? '#ef4444' : '#dc2626'}
        borderColor={STROKE}
        textColor="#ffffff"
        fontSize={36}
        opacity={0.45 + 0.55 * reveal}
      />
    </svg>
  );
};

/* ============================================================================
 * 7. SayXeBrainPoisonAlarmVisual
 * Hoạt họa tiến hóa hài hước: bên trái khung hồi tưởng thời tiền sử (stickman
 * tiền sử cầm chùm quả độc màu tím có đầu lâu nhỏ, đầu xoay mòng mòng) nối mũi
 * tên sang bên phải là bộ não hiện đại bật còi báo động đỏ "CẢNH BÁO: BỊ TRÚNG ĐỘC!".
 * ============================================================================ */
export const SayXeBrainPoisonAlarmVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const reveal = easeOutCubic(progress);
  const spinDeg = (frame * 6) % 360;
  const sirenBeam = (frame * 5) % 360;
  const alarmPulse = 0.5 + 0.5 * Math.sin(frame / 3.2);

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      {/* Full-bleed split: prehistoric warm parchment left, modern alert right */}
      <rect x={0} y={0} width={920} height={1080} fill="#fef3c7" />
      <rect x={920} y={0} width={1000} height={1080} fill="#f8fafc" />

      {/* === LEFT: PREHISTORIC FLASHBACK SCENE === */}
      {/* Distant prehistoric volcano & jungle hills */}
      <path d="M 0 720 L 180 510 L 250 510 L 420 720 Z" fill="#d97706" fillOpacity={0.35} />
      <path d="M 0 715 Q 240 650 520 700 T 920 695 L 920 1080 L 0 1080 Z" fill="#bef264" stroke={STROKE} strokeWidth={6} />
      {/* Prehistoric giant fern leaves */}
      <path d="M 75 720 Q 110 580 195 545" fill="none" stroke="#15803d" strokeWidth={10} strokeLinecap="round" />
      <path d="M 760 715 Q 795 585 865 555" fill="none" stroke="#15803d" strokeWidth={10} strokeLinecap="round" />

      {/* Organic wavy flashback cloud edge */}
      <path
        d="M 920 130 Q 885 250 925 370 T 920 620 T 915 860 L 920 1080"
        fill="none"
        stroke="#d97706"
        strokeWidth={7}
        strokeDasharray="18 12"
      />

      {/* Prehistoric Stickman */}
      <g transform="translate(415, 0)">
        {/* Shadow */}
        <ellipse cx={0} cy={768} rx={74} ry={16} fill="#65a30d" fillOpacity={0.45} />
        {/* Legs */}
        <line x1={0} y1={635} x2={-44} y2={762} stroke={STROKE} strokeWidth={8.5} strokeLinecap="round" />
        <line x1={0} y1={635} x2={44} y2={762} stroke={STROKE} strokeWidth={8.5} strokeLinecap="round" />
        {/* Torso with caveman spotted fur tunic */}
        <line x1={0} y1={485} x2={0} y2={635} stroke={STROKE} strokeWidth={8.5} strokeLinecap="round" />
        <path
          d="M -28 520 L 22 505 L 36 635 L -36 635 Z"
          fill="#f59e0b"
          stroke={STROKE}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <circle cx={-8} cy={555} r={7} fill="#92400e" />
        <circle cx={14} cy={585} r={8} fill="#92400e" />
        <circle cx={-12} cy={605} r={6} fill="#92400e" />

        {/* Left arm holding wooden club */}
        <path d="M -18 545 L -98 595 L -132 545" fill="none" stroke={STROKE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M -135 552 L -175 458 Q -158 435 -134 452 L -116 546 Z"
          fill="#b45309"
          stroke={STROKE}
          strokeWidth={5.5}
          strokeLinejoin="round"
        />

        {/* Right arm holding cluster of purple poison berries */}
        <path d="M 18 545 L 124 530 L 185 495" fill="none" stroke={STROKE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />

        {/* Cluster of Purple Poison Berries + Tiny Cartoon Skull */}
        <g transform={`translate(212, 475) rotate(${Math.sin(frame / 8) * 6})`}>
          {/* Stem & leaves */}
          <path d="M -25 18 Q 0 -22 35 -15" fill="none" stroke="#15803d" strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={22} cy={-26} rx={22} ry={11} fill="#22c55e" stroke={STROKE} strokeWidth={4.5} transform="rotate(-20, 22, -26)" />
          {/* Berries */}
          {[
            { x: -12, y: 12 },
            { x: 16, y: 8 },
            { x: 4, y: 34 },
            { x: -20, y: 38 },
            { x: 26, y: 34 },
          ].map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={17} fill="#9333ea" stroke={STROKE} strokeWidth={5} />
          ))}
          {/* Tiny floating skull icon above berries */}
          <g transform={`translate(8, ${-72 + Math.sin(frame / 7) * 6})`}>
            <circle cx={0} cy={-4} r={22} fill="#ffffff" stroke={STROKE} strokeWidth={4.5} />
            <rect x={-12} y={10} width={24} height={14} rx={4} fill="#ffffff" stroke={STROKE} strokeWidth={4.5} />
            <circle cx={-8} cy={-5} r={5} fill={STROKE} />
            <circle cx={8} cy={-5} r={5} fill={STROKE} />
            <line x1={-4} y1={14} x2={-4} y2={23} stroke={STROKE} strokeWidth={3} />
            <line x1={4} y1={14} x2={4} y2={23} stroke={STROKE} strokeWidth={3} />
          </g>
        </g>

        {/* Caveman head spinning dizzily */}
        <g transform={`translate(0, 412) rotate(${Math.sin(frame / 5) * 7})`}>
          <circle cx={0} cy={0} r={72} fill="#dcfce7" stroke={STROKE} strokeWidth={7} />
          {/* Wild caveman hair */}
          <path
            d="M -64 -38 L -78 -68 L -40 -66 L -34 -96 L -4 -74 L 24 -98 L 36 -66 L 74 -70 L 62 -36"
            fill="#451a03"
            stroke={STROKE}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          {/* Clean 2D dizzy eyes */}
          <Eye2D cx={-24} cy={-8} r={13} pupilDx={Math.cos(frame / 3) * 5} pupilDy={Math.sin(frame / 3) * 5} />
          <Eye2D cx={24} cy={-8} r={13} pupilDx={-Math.cos(frame / 3) * 5} pupilDy={-Math.sin(frame / 3) * 5} />
          {/* Wavy dizzy mouth */}
          <path d="M -24 28 Q -10 18 0 28 T 24 28" fill="none" stroke={STROKE} strokeWidth={5.5} strokeLinecap="round" />
        </g>

        {/* Spinning dizzy halo above caveman */}
        <g transform="translate(0, 278)">
          <ellipse cx={0} cy={0} rx={115} ry={28} fill="none" stroke="#9333ea" strokeWidth={6} strokeDasharray="28 18" strokeDashoffset={-frame * 5} />
          <g transform={`translate(128, -6) rotate(${spinDeg})`}>
            <path d="M 0 0 C 8 -8, 18 2, 12 12 C 4 22, -14 18, -18 4 C -22 -12, -4 -26, 16 -22" fill="none" stroke="#a855f7" strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
      </g>

      <LabelPill
        cx={455}
        cy={200}
        width={620}
        height={66}
        text="HỒI TƯỞNG THỜI TIỀN SỬ"
        bgColor="#fde68a"
        borderColor="#b45309"
        textColor="#78350f"
        fontSize={28}
      />

      {/* === CENTER: EVOLUTION ARROW === */}
      <g transform="translate(865, 505)">
        <line
          x1={0}
          y1={0}
          x2={215}
          y2={0}
          stroke="#f97316"
          strokeWidth={22}
          strokeDasharray="34 18"
          strokeDashoffset={-frame * 6}
          strokeLinecap="round"
        />
        <polygon points="198,-36 266,0 198,36" fill="#f97316" stroke={STROKE} strokeWidth={6} strokeLinejoin="round" />
      </g>

      {/* === RIGHT: MODERN BRAIN WITH RED EMERGENCY SIREN === */}
      <g transform="translate(1480, 505)">
        {/* Pulsing red alert rings */}
        <circle cx={0} cy={-20} r={245 + alarmPulse * 30} fill="#ef4444" fillOpacity={0.14 * alarmPulse} />
        <circle cx={0} cy={-20} r={190} fill="#fee2e2" fillOpacity={0.65} />

        {/* Rotating siren light beams */}
        <g transform={`translate(0, -210) rotate(${sirenBeam})`} opacity={0.35 + 0.3 * alarmPulse}>
          <polygon points="0,0 -48,-170 48,-170" fill="#ef4444" />
          <polygon points="0,0 -48,170 48,170" fill="#ef4444" />
        </g>

        {/* Big red siren dome on top of brain */}
        <rect x={-58} y={-172} width={116} height={28} rx={10} fill="#334155" stroke={STROKE} strokeWidth={6} />
        <path
          d="M -42 -172 L -32 -238 Q 0 -260 32 -238 L 42 -172 Z"
          fill={alarmPulse > 0.5 ? '#ef4444' : '#f87171'}
          stroke={STROKE}
          strokeWidth={6}
          strokeLinejoin="round"
        />

        {/* Modern Brain */}
        <CartoonBrain cx={0} cy={10} scale={1.2} fill="#fbcfe8" accent="#f472b6" />
      </g>

      {/* Bold red alarm label (inside safe zone y = 130..850) */}
      <LabelPill
        cx={1480}
        cy={790}
        width={680}
        height={80}
        text="CẢNH BÁO: BỊ TRÚNG ĐỘC!"
        bgColor={alarmPulse > 0.5 ? '#ef4444' : '#dc2626'}
        borderColor={STROKE}
        textColor="#ffffff"
        fontSize={34}
        opacity={0.4 + 0.6 * reveal}
      />
    </svg>
  );
};

/* ============================================================================
 * 8. SayXeStomachEjectNauseaVisual
 * Bộ não phía trên phát xung thần kinh đỏ chạy dọc xuống dạ dày lớn phía dưới;
 * dạ dày co bóp nhào lộn với các gợn sóng xanh lá buồn nôn chuẩn bị tống
 * "chất độc tưởng tượng" ra ngoài.
 * ============================================================================ */
export const SayXeStomachEjectNauseaVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const reveal = easeOutCubic(progress);
  const squeezeX = 1 + Math.sin(frame / 4) * 0.065;
  const squeezeY = 1 - Math.sin(frame / 4) * 0.065;
  const stomachRot = Math.sin(frame / 5.5) * 4;
  const nervePulse1 = (frame * 7.5) % 190;
  const nervePulse2 = (frame * 7.5 + 95) % 190;
  const ejectBounce = Math.sin(frame / 5) * 10;

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <clipPath id="sx8-stomach-clip">
          <path
            d="M 885 510
               C 875 565, 815 570, 770 618
               C 712 680, 725 785, 812 820
               C 902 855, 1068 830, 1118 755
               C 1168 680, 1138 580, 1055 565
               C 1005 556, 972 588, 955 552
               L 948 510 Z"
          />
        </clipPath>
      </defs>

      {/* Warm cream-peach full-screen backdrop */}
      <rect x={0} y={0} width={1920} height={1080} fill="#fff7ed" />
      <circle cx={960} cy={260} r={220} fill="#fee2e2" fillOpacity={0.7} />
      <circle cx={960} cy={690} r={290} fill="#dcfce7" fillOpacity={0.55} />

      {/* === TOP: BRAIN FIRING RED NERVE SIGNALS (y = 145..380) === */}
      <g transform="translate(960, 260)">
        <CartoonBrain cx={0} cy={0} scale={0.82} fill="#fca5a5" accent="#ef4444" />
        {/* Signal rings around brain */}
        <circle
          cx={0}
          cy={0}
          r={132 + (frame % 30) * 1.6}
          fill="none"
          stroke="#ef4444"
          strokeWidth={5}
          strokeOpacity={1 - (frame % 30) / 30}
        />
      </g>

      {/* === MIDDLE: VERTICAL NERVE CORD WITH RED IMPULSES === */}
      <g>
        <path
          d="M 960 362 C 940 420, 980 465, 920 520"
          fill="none"
          stroke={STROKE}
          strokeWidth={22}
          strokeLinecap="round"
        />
        <path
          d="M 960 362 C 940 420, 980 465, 920 520"
          fill="none"
          stroke="#fecaca"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d="M 960 362 C 940 420, 980 465, 920 520"
          fill="none"
          stroke="#ef4444"
          strokeWidth={8}
          strokeDasharray="24 20"
          strokeDashoffset={-frame * 8}
          strokeLinecap="round"
        />
        {/* Bright nerve spark orbs traveling down */}
        <circle cx={952 - (nervePulse1 / 190) * 28} cy={365 + nervePulse1 * 0.8} r={14} fill="#facc15" stroke="#dc2626" strokeWidth={5} />
        <circle cx={952 - (nervePulse2 / 190) * 28} cy={365 + nervePulse2 * 0.8} r={12} fill="#ef4444" stroke="#ffffff" strokeWidth={4} />
      </g>

      {/* === BOTTOM: LARGE CHURNING STOMACH WITH GREEN NAUSEA WAVES === */}
      <g
        transform={`translate(940, 685) rotate(${stomachRot}) scale(${squeezeX}, ${squeezeY}) translate(-940, -685)`}
      >
        {/* Stomach outer shape */}
        <path
          d="M 885 510
             C 875 565, 815 570, 770 618
             C 712 680, 725 785, 812 820
             C 902 855, 1068 830, 1118 755
             C 1168 680, 1138 580, 1055 565
             C 1005 556, 972 588, 955 552
             L 948 510 Z"
          fill="#fda4af"
          stroke={STROKE}
          strokeWidth={8}
          strokeLinejoin="round"
        />

        {/* Churning green nausea fluid inside stomach */}
        <g clipPath="url(#sx8-stomach-clip)">
          <path
            d={`M 680 ${690 + Math.sin(frame / 4) * 16}
                Q 790 ${655 - Math.sin(frame / 4) * 24}, 910 ${695 + Math.cos(frame / 4) * 18}
                T 1190 ${685 - Math.sin(frame / 4) * 20}
                L 1190 880 L 680 880 Z`}
            fill="#4ade80"
          />
          <path
            d={`M 680 ${725 - Math.sin(frame / 4) * 14}
                Q 810 ${700 + Math.sin(frame / 4) * 18}, 940 ${730 - Math.cos(frame / 4) * 14}
                T 1190 ${720 + Math.sin(frame / 4) * 16}
                L 1190 880 L 680 880 Z`}
            fill="#22c55e"
            fillOpacity={0.75}
          />
          {/* Rising nausea bubbles */}
          {[820, 915, 1015].map((bx, i) => (
            <circle
              key={bx}
              cx={bx + Math.sin(frame / 5 + i) * 10}
              cy={790 - ((frame * 3.2 + i * 45) % 140)}
              r={12 - i * 2}
              fill="#dcfce7"
              stroke="#15803d"
              strokeWidth={3.5}
            />
          ))}
        </g>

        {/* Crisp outline overlay */}
        <path
          d="M 885 510
             C 875 565, 815 570, 770 618
             C 712 680, 725 785, 812 820
             C 902 855, 1068 830, 1118 755
             C 1168 680, 1138 580, 1055 565
             C 1005 556, 972 588, 955 552
             L 948 510"
          fill="none"
          stroke={STROKE}
          strokeWidth={8}
          strokeLinejoin="round"
        />

        {/* Squeeze motion lines outside stomach */}
        <path d="M 682 655 Q 658 710 682 765" fill="none" stroke="#16a34a" strokeWidth={7} strokeLinecap="round" />
        <path d="M 1185 625 Q 1212 685 1185 745" fill="none" stroke="#16a34a" strokeWidth={7} strokeLinecap="round" />
      </g>

      {/* Upward "eject" arrows next to esophagus */}
      <g transform={`translate(765, ${535 + ejectBounce})`}>
        <line x1={0} y1={55} x2={0} y2={-25} stroke="#22c55e" strokeWidth={12} strokeLinecap="round" />
        <polygon points="-24,-15 0,-52 24,-15" fill="#22c55e" stroke={STROKE} strokeWidth={5} strokeLinejoin="round" />
      </g>

      {/* Left & Right clear Vietnamese callouts (inside y = 130..850) */}
      <LabelPill
        cx={1470}
        cy={260}
        width={520}
        height={72}
        text="NÃO PHÁT XUNG TỐNG ĐỘC!"
        bgColor="#fee2e2"
        borderColor="#dc2626"
        textColor="#991b1b"
        fontSize={28}
        opacity={0.4 + 0.6 * reveal}
      />
      <LabelPill
        cx={1495}
        cy={685}
        width={540}
        height={72}
        text="DẠ DÀY CO BÓP → BUỒN NÔN!"
        bgColor="#dcfce7"
        borderColor="#16a34a"
        textColor="#14532d"
        fontSize={28}
        opacity={0.4 + 0.6 * reveal}
      />
      <LabelPill
        cx={430}
        cy={520}
        width={430}
        height={66}
        text="CHẤT ĐỘC TƯỞNG TƯỢNG"
        bgColor="#fef3c7"
        borderColor="#d97706"
        textColor="#92400e"
        fontSize={26}
        opacity={0.4 + 0.6 * reveal}
      />
    </svg>
  );
};

/* ============================================================================
 * 9. SayXeReadBookVsWindowVisual
 * So sánh chia đôi tràn màn hình:
 * - Bên trái (nền đỏ nhạt): cậu bé cúi đọc sách/điện thoại trên xe rung
 *   → dấu "✗ Lệch pha mạnh → Say xe"
 * - Bên phải (nền xanh nhạt): cậu bé nhìn ra cửa sổ thấy cây cối trôi qua
 *   → dấu "✓ Mắt & Tai đồng bộ → Êm ru"
 * ============================================================================ */
export const SayXeReadBookVsWindowVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  progress,
}) => {
  const reveal = easeOutCubic(progress);
  const roughShakeY = Math.sin(frame / 2.6) * 8;
  const roughShakeX = Math.cos(frame / 3.1) * 4;
  const smoothBounce = Math.sin(frame / 7) * 2.5;
  const treeScroll = (frame * 9.5) % 900;
  const swirlAngle = (frame * 5) % 360;

  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{ display: 'block' }}>
      <defs>
        <clipPath id="sx9-left-win">
          <rect x={85} y={245} width={790} height={240} rx={24} />
        </clipPath>
        <clipPath id="sx9-right-win">
          <rect x={1045} y={245} width={790} height={240} rx={24} />
        </clipPath>
      </defs>

      {/* Split full-screen backgrounds */}
      <rect x={0} y={0} width={960} height={1080} fill="#fef2f2" />
      <rect x={960} y={0} width={960} height={1080} fill="#f0fdf4" />

      {/* === LEFT PANEL: READING PHONE / BOOK ON SHAKING BUS === */}
      <g transform={`translate(${roughShakeX}, ${roughShakeY})`}>
        {/* Bus window (ignored scenery) */}
        <g clipPath="url(#sx9-left-win)">
          <rect x={85} y={245} width={790} height={240} fill="#e2e8f0" />
          {[0, 1].map((loop) => (
            <g key={`lt-${loop}`} transform={`translate(${85 + loop * 900 - treeScroll}, 0)`}>
              {[150, 450, 750].map((tx) => (
                <g key={tx}>
                  <rect x={tx - 10} y={405} width={20} height={85} fill="#94a3b8" />
                  <circle cx={tx} cy={385} r={42} fill="#cbd5e1" />
                </g>
              ))}
            </g>
          ))}
        </g>
        <rect x={85} y={245} width={790} height={240} rx={24} fill="none" stroke={STROKE} strokeWidth={7} />

        {/* Car seat */}
        <rect x={225} y={450} width={95} height={245} rx={28} fill="#f87171" stroke={STROKE} strokeWidth={6.5} />
        <rect x={250} y={625} width={255} height={70} rx={22} fill="#ef4444" stroke={STROKE} strokeWidth={6.5} />

        {/* Boy hunched reading phone/book */}
        <g transform="translate(390, 0)">
          <path d="M -30 622 Q -20 535 12 475" fill="none" stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
          <path d="M -30 622 L 75 622 L 95 705" fill="none" stroke={STROKE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 0 515 L 78 560 L 135 535" fill="none" stroke={STROKE} strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Open book / phone */}
          <g transform="translate(154, 526) rotate(18)">
            <rect x={-36} y={-28} width={72} height={54} rx={8} fill="#38bdf8" stroke={STROKE} strokeWidth={5} />
            <line x1={0} y1={-28} x2={0} y2={26} stroke={STROKE} strokeWidth={4} />
            <line x1={-24} y1={-10} x2={-8} y2={-10} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
            <line x1={8} y1={-10} x2={24} y2={-10} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
            <line x1={-24} y1={6} x2={-8} y2={6} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
            <line x1={8} y1={6} x2={24} y2={6} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
          </g>

          {/* Sickly green head tilted down */}
          <g transform="translate(32, 412) rotate(24)">
            <circle cx={0} cy={0} r={58} fill="#dcfce7" stroke={STROKE} strokeWidth={7} />
            <path d="M -24 -54 L -8 -74 L 4 -56 L 20 -70 L 24 -50" fill="none" stroke={STROKE} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
            <Eye2D cx={12} cy={-6} r={9.5} pupilDx={3} pupilDy={3} />
            <Eye2D cx={38} cy={-6} r={9.5} pupilDx={3} pupilDy={3} />
            <path d="M 10 20 Q 22 12 34 20" fill="none" stroke={STROKE} strokeWidth={5} strokeLinecap="round" />
          </g>

          {/* Dizzy spiral above head */}
          <g transform={`translate(115, 338) rotate(${swirlAngle})`}>
            <path
              d="M 0 0 C 8 -8, 18 2, 12 12 C 4 22, -14 18, -18 4 C -22 -12, -4 -26, 16 -22"
              fill="none"
              stroke="#ef4444"
              strokeWidth={5.5}
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>

      {/* === RIGHT PANEL: LOOKING OUT WINDOW AT PASSING TREES === */}
      <g transform={`translate(0, ${smoothBounce})`}>
        {/* Bright sunny window with scrolling green trees */}
        <g clipPath="url(#sx9-right-win)">
          <rect x={1045} y={245} width={790} height={240} fill="#bae6fd" />
          <circle cx={1750} cy={305} r={34} fill="#fde047" />
          <path d="M 1045 485 L 1045 425 Q 1280 385 1520 420 T 1835 410 L 1835 485 Z" fill="#86efac" />
          {[0, 1].map((loop) => (
            <g key={`rt-${loop}`} transform={`translate(${1045 + loop * 900 - treeScroll}, 0)`}>
              {[140, 440, 740].map((tx) => (
                <g key={tx}>
                  <rect x={tx - 10} y={405} width={20} height={85} fill="#92400e" stroke={STROKE} strokeWidth={4} />
                  <circle cx={tx} cy={382} r={44} fill="#22c55e" stroke={STROKE} strokeWidth={5} />
                  <circle cx={tx - 24} cy={394} r={28} fill="#4ade80" stroke={STROKE} strokeWidth={4} />
                </g>
              ))}
            </g>
          ))}
        </g>
        <rect x={1045} y={245} width={790} height={240} rx={24} fill="none" stroke={STROKE} strokeWidth={7} />

        {/* Car seat */}
        <rect x={1185} y={450} width={95} height={245} rx={28} fill="#4ade80" stroke={STROKE} strokeWidth={6.5} />
        <rect x={1210} y={625} width={255} height={70} rx={22} fill="#22c55e" stroke={STROKE} strokeWidth={6.5} />

        {/* Boy sitting upright, smiling & looking out the window */}
        <g transform="translate(1345, 0)">
          <line x1={-25} y1={475} x2={-25} y2={622} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
          <path d="M -25 622 L 80 622 L 100 705" fill="none" stroke={STROKE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -25 520 L 42 545 L 92 520" fill="none" stroke={STROKE} strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Sightline looking out toward trees */}
          <line x1={48} y1={392} x2={255} y2={355} stroke="#16a34a" strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" />

          {/* Healthy smiling head */}
          <g transform="translate(-20, 405)">
            <circle cx={0} cy={0} r={58} fill="#ffffff" stroke={STROKE} strokeWidth={7} />
            <path d="M -24 -54 L -8 -74 L 4 -56 L 20 -70 L 24 -50" fill="none" stroke={STROKE} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
            <Eye2D cx={10} cy={-8} r={9.5} pupilDx={3.5} pupilDy={-1} />
            <Eye2D cx={36} cy={-8} r={9.5} pupilDx={3.5} pupilDy={-1} />
            <path d="M 8 18 Q 24 34 40 16" fill="none" stroke={STROKE} strokeWidth={5.5} strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* Center vertical split divider */}
      <line x1={960} y1={130} x2={960} y2={860} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />

      {/* Top comparison headers (safely at y = 180, well below y = 115) */}
      <LabelPill
        cx={480}
        cy={182}
        width={510}
        height={62}
        text="CÚI ĐỌC SÁCH / ĐIỆN THOẠI"
        bgColor="#fee2e2"
        borderColor="#ef4444"
        textColor="#991b1b"
        fontSize={26}
      />
      <LabelPill
        cx={1440}
        cy={182}
        width={510}
        height={62}
        text="NHÌN RA CỬA SỔ XA"
        bgColor="#dcfce7"
        borderColor="#22c55e"
        textColor="#14532d"
        fontSize={26}
      />

      {/* Bottom result badges (safely at y = 785, well above subtitle zone y = 890) */}
      <LabelPill
        cx={480}
        cy={785}
        width={650}
        height={78}
        text="✗ Lệch pha mạnh → Say xe"
        bgColor="#fee2e2"
        borderColor="#dc2626"
        textColor="#991b1b"
        fontSize={32}
        opacity={0.4 + 0.6 * reveal}
      />
      <LabelPill
        cx={1440}
        cy={785}
        width={680}
        height={78}
        text="✓ Mắt & Tai đồng bộ → Êm ru"
        bgColor="#dcfce7"
        borderColor="#16a34a"
        textColor="#14532d"
        fontSize={32}
        opacity={0.4 + 0.6 * reveal}
      />
    </svg>
  );
};
