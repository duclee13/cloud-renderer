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
  SedanCarExterior,
  BusCabinBackdrop,
} from './sayXeSharedAssets';
import type { EpisodeVisualProps } from './index';

const easeOutCubic = (t: number) => {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
};

/* ============================================================================
 * 1. SayXeDriverPredictsVisual (b35, b36, b37)
 * Góc nhìn TỪ PHÍA SAU LƯNG/VAI BÁC TÀI nhìn thẳng ra kính chắn gió phía trước
 * ============================================================================ */
export const SayXeDriverPredictsVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;

  // Steering angle: s=0 gentle straight, s=1 eases left to -30deg, s>=2 stays in left turn
  const turnFactor =
    s === 0 ? 0 : s === 1 ? easeOutCubic(clamp01(progress * 1.25)) : 1;
  const microSway = Math.sin(frame * 0.06) * 2.5;
  const steerAngle = lerp(0, -32, turnFactor) + microSway;
  const rad = (steerAngle * Math.PI) / 180;

  // Road curve offset matching steering direction (negative steer = left curve)
  const curveShift = lerp(0, -210, turnFactor);
  const roadDashOffset = -(frame * 14) % 120;
  const roadScroll = (frame * 5) % 400;

  // Steering wheel center
  const wheelCx = 760;
  const wheelCy = 660;
  const wheelR = 112;

  // Hand grip points at 9 o'clock and 3 o'clock rotated by steerAngle
  const leftHandX = wheelCx + Math.cos(Math.PI + rad) * wheelR;
  const leftHandY = wheelCy + Math.sin(Math.PI + rad) * wheelR;
  const rightHandX = wheelCx + Math.cos(rad) * wheelR;
  const rightHandY = wheelCy + Math.sin(rad) * wheelR;

  // Foot pedal inset (s >= 1)
  const pedalAlpha = s === 0 ? 0 : s === 1 ? easeOutCubic(clamp01(progress * 1.6)) : 1;
  const brakePress = s >= 1 ? 0.5 + 0.5 * Math.sin(frame * 0.08) : 0;

  // Green predicted path (s >= 2)
  const predictDraw = s >= 2 ? easeOutCubic(clamp01(progress * 1.4)) : 0;
  const predictFlow = -(frame * 8) % 60;

  const topLabel =
    s === 0
      ? 'Bác tài chủ động cầm lái'
      : s === 1
      ? 'Chủ động xoay vô lăng & rà phanh'
      : 'Não đã tính trước hướng rẽ';

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="driverSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <clipPath id="driverWindshieldClip">
          <path d="M130 130 L1790 130 L1850 565 L70 565 Z" />
        </clipPath>
      </defs>

      {/* Cabin interior shell */}
      <rect x="0" y="0" width="1920" height="1080" fill="#1e293b" />

      {/* Windshield scenery looking straight ahead */}
      <g clipPath="url(#driverWindshieldClip)">
        {/* Sky */}
        <rect x="60" y="120" width="1800" height="270" fill="url(#driverSkyGrad)" />

        {/* Soft clouds */}
        <g opacity="0.85">
          <ellipse cx={360 + ((frame * 0.5) % 240)} cy="220" rx="85" ry="28" fill="#ffffff" />
          <ellipse cx={1420 - ((frame * 0.4) % 220)} cy="205" rx="95" ry="30" fill="#ffffff" />
        </g>

        {/* Distant rolling hills */}
        <path
          d={`M60 390 Q460 290 880 360 T1860 350 L1860 570 L60 570 Z`}
          fill="#86efac"
          stroke={INK}
          strokeWidth="4"
        />
        <path
          d={`M60 420 Q600 355 1120 395 T1860 385 L1860 570 L60 570 Z`}
          fill="#4ade80"
        />

        {/* Highway curving smoothly ahead */}
        <path
          d={`M430 570 Q${740 + curveShift * 0.5} 455 ${940 + curveShift} 365 L${1000 + curveShift} 365 Q${1210 + curveShift * 0.5} 455 1510 570 Z`}
          fill="#475569"
          stroke={INK}
          strokeWidth="5"
        />
        {/* Road shoulder lines */}
        <path
          d={`M460 570 Q${755 + curveShift * 0.5} 455 ${946 + curveShift} 365`}
          fill="none"
          stroke="#f8fafc"
          strokeWidth="5"
        />
        <path
          d={`M1480 570 Q${1195 + curveShift * 0.5} 455 ${994 + curveShift} 365`}
          fill="none"
          stroke="#f8fafc"
          strokeWidth="5"
        />
        {/* Center dashed lane line */}
        <path
          d={`M970 570 Q${970 + curveShift * 0.48} 455 ${970 + curveShift} 365`}
          fill="none"
          stroke="#fde047"
          strokeWidth="8"
          strokeDasharray="34 26"
          strokeDashoffset={roadDashOffset}
          strokeLinecap="round"
        />

        {/* Passing roadside posts for 60fps speed cues */}
        {[0, 1, 2, 3].map((i) => {
          const t = ((roadScroll + i * 100) % 400) / 400;
          const py = lerp(372, 560, t * t);
          const scale = lerp(0.25, 1.1, t * t);
          const leftX = lerp(915 + curveShift, 340, t * t);
          const rightX = lerp(1025 + curveShift, 1590, t * t);
          return (
            <g key={i} opacity={clamp01(t * 2)}>
              <rect
                x={leftX - 6 * scale}
                y={py - 32 * scale}
                width={12 * scale}
                height={36 * scale}
                rx={3 * scale}
                fill="#f8fafc"
                stroke={INK}
                strokeWidth={2.5 * scale}
              />
              <rect
                x={rightX - 6 * scale}
                y={py - 32 * scale}
                width={12 * scale}
                height={36 * scale}
                rx={3 * scale}
                fill="#f8fafc"
                stroke={INK}
                strokeWidth={2.5 * scale}
              />
            </g>
          );
        })}

        {/* s >= 2: Green predicted curve on the road matching steering direction */}
        {predictDraw > 0.01 ? (
          <g opacity={predictDraw}>
            {/* Glow band */}
            <path
              d={`M970 568 Q${960 + curveShift * 0.5} 458 ${968 + curveShift} 372`}
              fill="none"
              stroke="#4ade80"
              strokeWidth="34"
              strokeLinecap="round"
              strokeOpacity="0.32"
              strokeDasharray="320"
              strokeDashoffset={320 * (1 - predictDraw)}
            />
            {/* Crisp flowing green trajectory line */}
            <path
              d={`M970 568 Q${960 + curveShift * 0.5} 458 ${968 + curveShift} 372`}
              fill="none"
              stroke="#16a34a"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="24 16"
              strokeDashoffset={predictFlow}
            />
            {/* Arrowhead at destination curve */}
            <g
              transform={`translate(${968 + curveShift}, 372) rotate(-32)`}
              opacity={clamp01((predictDraw - 0.4) * 2)}
            >
              <polygon points="0,-24 -20,14 20,14" fill="#22c55e" stroke={INK} strokeWidth="3.5" />
            </g>
          </g>
        ) : null}
      </g>

      {/* Windshield frame & A-pillars */}
      <path
        d="M130 130 L1790 130 L1850 565 L70 565 Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="22"
        strokeLinejoin="round"
      />
      {/* Rearview mirror */}
      <g transform="translate(960, 168)">
        <rect x="-12" y="-42" width="24" height="30" fill="#334155" />
        <rect x="-110" y="-14" width="220" height="44" rx="14" fill="#334155" stroke="#0f172a" strokeWidth="5" />
        <rect x="-98" y="-5" width="196" height="26" rx="8" fill="#bae6fd" opacity="0.65" />
      </g>

      {/* Dashboard */}
      <path
        d="M0 565 L1920 565 L1920 1080 L0 1080 Z"
        fill="#334155"
        stroke="#0f172a"
        strokeWidth="6"
      />
      {/* Dashboard upper cowl & instrument cluster */}
      <path
        d="M520 565 Q760 510 1000 565 L1000 660 L520 660 Z"
        fill="#1e293b"
        stroke="#0f172a"
        strokeWidth="5"
      />
      {/* Speedometer & RPM dials */}
      <g transform="translate(690, 610)">
        <circle cx="0" cy="0" r="34" fill="#0f172a" stroke="#64748b" strokeWidth="3.5" />
        <path d="M-22 14 A26 26 0 1 1 22 14" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1="0" x2="14" y2="-16" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <g transform="translate(830, 610)">
        <circle cx="0" cy="0" r="34" fill="#0f172a" stroke="#64748b" strokeWidth="3.5" />
        <path d="M-22 14 A26 26 0 1 1 22 14" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1="0" x2="6" y2="-18" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* Steering wheel (rotates smoothly with road curve) */}
      <g transform={`translate(${wheelCx}, ${wheelCy}) rotate(${steerAngle})`}>
        <circle cx="0" cy="0" r={wheelR} fill="none" stroke="#0f172a" strokeWidth="26" />
        <circle cx="0" cy="0" r={wheelR} fill="none" stroke="#475569" strokeWidth="10" />
        {/* Top center alignment marker */}
        <rect x="-7" y={-wheelR - 12} width="14" height="24" rx="4" fill="#ef4444" />
        {/* Spokes */}
        <line x1={-wheelR + 10} y1="0" x2={wheelR - 10} y2="0" stroke="#1e293b" strokeWidth="18" />
        <line x1="0" y1="0" x2="0" y2={wheelR - 10} stroke="#1e293b" strokeWidth="18" />
        {/* Center horn pad */}
        <circle cx="0" cy="0" r="34" fill="#1e293b" stroke="#0f172a" strokeWidth="5" />
        <circle cx="0" cy="0" r="14" fill="#64748b" />
      </g>

      {/* DRIVER SEEN FROM BEHIND (shoulders, back of head/cap, arms reaching forward to wheel) */}
      <g>
        {/* Left arm reaching forward from left shoulder to steering wheel */}
        <path
          d={`M565 800 Q545 705 ${leftHandX} ${leftHandY}`}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="42"
          strokeLinecap="round"
        />
        <path
          d={`M565 800 Q545 705 ${leftHandX} ${leftHandY}`}
          fill="none"
          stroke={INK}
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.25"
        />
        {/* Right arm reaching forward from right shoulder to steering wheel */}
        <path
          d={`M955 800 Q975 705 ${rightHandX} ${rightHandY}`}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="42"
          strokeLinecap="round"
        />
        {/* Hands gripping steering wheel */}
        <circle cx={leftHandX} cy={leftHandY} r="22" fill="#fed7aa" stroke={INK} strokeWidth="4.5" />
        <circle cx={rightHandX} cy={rightHandY} r="22" fill="#fed7aa" stroke={INK} strokeWidth="4.5" />

        {/* Driver shoulders & upper back (uniform shirt seen from behind) */}
        <path
          d="M520 960 L545 790 Q560 735 660 725 L860 725 Q960 735 975 790 L1000 960 Z"
          fill="#2563eb"
          stroke={INK}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Collar back */}
        <path
          d="M700 725 L760 752 L820 725"
          fill="none"
          stroke="#eff6ff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Driver seat backrest behind the driver */}
        <path
          d="M595 835 Q595 790 650 790 L870 790 Q925 790 925 835 L940 1080 L580 1080 Z"
          fill="#475569"
          stroke={INK}
          strokeWidth="6"
        />
        <rect x="650" y="818" width="220" height="22" rx="11" fill="#64748b" />

        {/* Neck (back view) */}
        <rect x="726" y="675" width="68" height="58" rx="18" fill="#fed7aa" stroke={INK} strokeWidth="5" />

        {/* Back of driver's head & cap (NO face, looking straight ahead!) */}
        <g transform={`translate(760, 615) rotate(${steerAngle * 0.15})`}>
          {/* Ears visible from behind */}
          <ellipse cx="-78" cy="6" rx="14" ry="22" fill="#fed7aa" stroke={INK} strokeWidth="4.5" />
          <ellipse cx="78" cy="6" rx="14" ry="22" fill="#fed7aa" stroke={INK} strokeWidth="4.5" />
          {/* Back of head / short dark hair */}
          <circle cx="0" cy="0" r="78" fill="#1e293b" stroke={INK} strokeWidth="5.5" />
          {/* Lower nape hair contour */}
          <path d="M-56 42 Q0 76 56 42 L48 64 Q0 82 -48 64 Z" fill="#334155" />
          {/* Driver cap crown (back view with rear adjustment strap) */}
          <path
            d="M-80 -8 C-80 -76 80 -76 80 -8 Z"
            fill="#0f172a"
            stroke={INK}
            strokeWidth="5"
          />
          <path
            d="M-34 -8 A34 24 0 0 1 34 -8 Z"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="3"
          />
          <rect x="-28" y="-12" width="56" height="10" rx="5" fill="#94a3b8" />
        </g>
      </g>

      {/* s >= 1: Picture-in-picture inset showing foot feathering brake / gas pedals */}
      {pedalAlpha > 0.01 ? (
        <g transform="translate(1365, 560)" opacity={pedalAlpha}>
          <rect
            x="0"
            y="0"
            width="430"
            height="255"
            rx="24"
            fill="#f8fafc"
            stroke={INK}
            strokeWidth="5.5"
          />
          <text
            x="215"
            y="42"
            textAnchor="middle"
            fill={INK}
            fontSize="24"
            fontWeight="700"
            fontFamily={FONT}
          >
            Chân rà phanh &amp; ga
          </text>
          {/* Pedal bay background */}
          <rect x="28" y="60" width="374" height="168" rx="16" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
          {/* Brake pedal (left) */}
          <g transform={`translate(135, ${120 + brakePress * 10})`}>
            <rect x="-8" y="-50" width="16" height="45" fill="#64748b" stroke={INK} strokeWidth="3" />
            <rect
              x="-42"
              y="-10"
              width="84"
              height="52"
              rx="10"
              fill={brakePress > 0.5 ? '#fca5a5' : '#475569'}
              stroke={INK}
              strokeWidth="4"
            />
            <text x="0" y="23" textAnchor="middle" fill={brakePress > 0.5 ? '#7f1d1d' : '#ffffff'} fontSize="18" fontWeight="700" fontFamily={FONT}>
              PHANH
            </text>
          </g>
          {/* Gas pedal (right) */}
          <g transform={`translate(285, ${126 + (1 - brakePress) * 10})`}>
            <rect x="-8" y="-56" width="16" height="45" fill="#64748b" stroke={INK} strokeWidth="3" />
            <rect
              x="-32"
              y="-14"
              width="64"
              height="74"
              rx="10"
              fill={brakePress <= 0.5 ? '#86efac' : '#475569'}
              stroke={INK}
              strokeWidth="4"
            />
            <text x="0" y="30" textAnchor="middle" fill={brakePress <= 0.5 ? '#14532d' : '#ffffff'} fontSize="18" fontWeight="700" fontFamily={FONT}>
              GA
            </text>
          </g>
          {/* Driver shoe silhouette pressing pedal */}
          <g transform={`translate(${lerp(285, 135, brakePress)}, ${186 + brakePress * 6}) rotate(${lerp(10, -8, brakePress)})`}>
            <path
              d="M-32 22 L-24 -28 Q0 -40 24 -26 L34 22 Q0 34 -32 22 Z"
              fill="#1e293b"
              stroke={INK}
              strokeWidth="4"
            />
          </g>
        </g>
      ) : null}

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={148}
        text={topLabel}
        bg={s >= 2 ? '#dcfce7' : '#ffffff'}
        border={s >= 2 ? '#16a34a' : INK}
        color={INK}
        fontSize={28}
      />
    </svg>
  );
};

/* ============================================================================
 * 2. SayXePassengerBlindsidedVisual (b38, b39, b40)
 * BusCabinBackdrop + CoachBusSeat + SharedStickman (seated, holdingPhone, full legs)
 * ============================================================================ */
export const SayXePassengerBlindsidedVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;

  // s >= 2: Sudden brake impulse!
  const brakeImpulse =
    s >= 2
      ? Math.sin(clamp01(progress * 2.4) * Math.PI) * 1 +
        Math.sin(frame * 0.42) * 0.25 * clamp01(1 - progress * 0.6)
      : 0;

  const cabinShakeY = s >= 2 ? Math.sin(frame * 0.7) * 5 : Math.sin(frame * 0.14) * 2.5;
  const cabinTilt = s >= 2 ? lerp(0, 2.2, clamp01(progress * 3)) : Math.sin(frame * 0.06) * 0.6;

  // Boy lurches slightly forward on brake
  const lurchX = s >= 2 ? brakeImpulse * 28 : 0;
  const headTilt = s >= 2 ? 4 - brakeImpulse * 10 : 20;

  // Outside warning signs visibility (s >= 1)
  const signAlpha = s === 0 ? 0 : s === 1 ? easeOutCubic(clamp01(progress * 1.6)) : 1;
  const signSlide = s === 1 ? lerp(180, 0, easeOutCubic(clamp01(progress * 1.4))) : 0;

  const topLabel =
    s === 0
      ? 'Hành khách ngồi sau, cắm mặt vào điện thoại'
      : s === 1
      ? 'Không nhìn thấy khúc cua hay đèn đỏ bên ngoài'
      : 'Phanh gấp ập tới bất ngờ';

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <BusCabinBackdrop frame={frame} shakeY={cabinShakeY} tiltDeg={cabinTilt}>
        {/* s >= 1: Road curve warning sign & red traffic light visible through right bus window */}
        {signAlpha > 0.01 ? (
          <g opacity={signAlpha} transform={`translate(${signSlide}, 0)`}>
            {/* Yellow sharp curve sign outside window */}
            <g transform="translate(1235, 365)">
              <rect x="-8" y="68" width="16" height="150" fill="#64748b" stroke={INK} strokeWidth="4" />
              <g transform="rotate(45)">
                <rect
                  x="-58"
                  y="-58"
                  width="116"
                  height="116"
                  rx="14"
                  fill="#fde047"
                  stroke={INK}
                  strokeWidth="6"
                />
              </g>
              {/* Curved arrow icon */}
              <path
                d="M-12 34 L-12 4 Q-12 -18 12 -18 L24 -18"
                fill="none"
                stroke={INK}
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon points="34,-18 14,-32 14,-4" fill={INK} />
            </g>

            {/* Red traffic light outside window */}
            <g transform="translate(1525, 345)">
              <rect x="-8" y="88" width="16" height="150" fill="#64748b" stroke={INK} strokeWidth="4" />
              <rect x="-42" y="-86" width="84" height="184" rx="18" fill="#1e293b" stroke={INK} strokeWidth="5" />
              {/* Glowing red light */}
              <circle cx="0" cy="-42" r="24" fill="#ef4444" stroke={INK} strokeWidth="3.5" />
              <circle
                cx="0"
                cy="-42"
                r={32 + Math.sin(frame * 0.2) * 5}
                fill="#ef4444"
                opacity="0.28"
              />
              <circle cx="0" cy="10" r="20" fill="#475569" />
              <circle cx="0" cy="60" r="20" fill="#475569" />
            </g>
          </g>
        ) : null}

        {/* Standard proportioned CoachBusSeat (bottom of leg rests on floor y=795) */}
        <CoachBusSeat x={640} y={685} scale={1.15} />

        {/* Boy seated with FULL LEGS touching the floor + holding phone */}
        <g transform={`translate(${lurchX}, 0)`}>
          <SharedStickman
            x={656}
            y={682}
            scale={1.22}
            role="BOY"
            mood={s >= 2 ? 'SURPRISED' : 'NEUTRAL'}
            facing="RIGHT"
            seated={true}
            holdingPhone={true}
            sweating={s >= 2}
            headTiltDeg={headTilt}
          />
        </g>

        {/* Subtle gaze line down to phone when s <= 1 */}
        {s <= 1 ? (
          <line
            x1="696"
            y1="528"
            x2="742"
            y2="606"
            stroke="#38bdf8"
            strokeWidth="4"
            strokeDasharray="8 8"
            strokeLinecap="round"
            opacity="0.85"
          />
        ) : null}

        {/* s >= 2: Inertia forward push arrows */}
        {s >= 2 ? (
          <g opacity={easeOutCubic(clamp01(progress * 2.2))}>
            {[490, 560, 630].map((ay, idx) => {
              const offset = ((frame * 6 + idx * 24) % 48) - 24;
              return (
                <g key={idx} transform={`translate(${410 + offset}, ${ay})`}>
                  <line
                    x1="0"
                    y1="0"
                    x2="110"
                    y2="0"
                    stroke="#ef4444"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <polygon points="132,0 100,-16 100,16" fill="#ef4444" />
                </g>
              );
            })}
            <CleanLabel
              x={465}
              y={715}
              text="Lực quán tính đẩy tới"
              bg="#fee2e2"
              border="#ef4444"
              color="#991b1b"
              fontSize={22}
            />
          </g>
        ) : null}
      </BusCabinBackdrop>

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={148}
        text={topLabel}
        bg={s >= 2 ? '#fee2e2' : '#ffffff'}
        border={s >= 2 ? '#ef4444' : INK}
        color={INK}
        fontSize={28}
      />
    </svg>
  );
};

/* ============================================================================
 * 3. SayXeAgeGroupChartVisual (b43, b44, b45)
 * Biểu đồ cột tăng lũy tiến KHÔNG BAO GIỜ RESET VỀ 0
 * ============================================================================ */
export const SayXeAgeGroupChartVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;

  // Strict non-resetting progressive bar growth
  const b1 = s === 0 ? easeOutCubic(clamp01(progress * 1.35)) : 1;
  const b2 = s === 0 ? 0 : s === 1 ? easeOutCubic(clamp01(progress * 1.35)) : 1;
  const b3 = s <= 1 ? 0 : easeOutCubic(clamp01(progress * 1.35));

  const chartLeft = 360;
  const chartRight = 1600;
  const chartTop = 260;
  const chartBottom = 710;
  const maxBarH = chartBottom - chartTop; // 450px

  const bars = [
    {
      cx: 590,
      label: '2 – 12 tuổi',
      sub: 'Tiền đình rất nhạy cảm',
      targetPct: 0.88,
      valueText: 'Cao nhất',
      fill: '#f97316',
      lightFill: '#ffedd5',
      grow: b1,
    },
    {
      cx: 980,
      label: '13 – 25 tuổi',
      sub: 'Não đang thích nghi dần',
      targetPct: 0.56,
      valueText: 'Trung bình',
      fill: '#eab308',
      lightFill: '#fef9c3',
      grow: b2,
    },
    {
      cx: 1370,
      label: 'Người lớn',
      sub: 'Quen nhịp chuyển động',
      targetPct: 0.28,
      valueText: 'Thấp hơn',
      fill: '#10b981',
      lightFill: '#d1fae5',
      grow: b3,
    },
  ];

  const barWidth = 190;

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Crisp studio background */}
      <rect x="0" y="0" width="1920" height="1080" fill="#f8fafc" />

      {/* Main chart card container inside safe zone y=110..840 */}
      <rect
        x="170"
        y="195"
        width="1580"
        height="635"
        rx="32"
        fill="#ffffff"
        stroke={INK}
        strokeWidth="5"
      />

      {/* Horizontal grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick, idx) => {
        const gy = chartBottom - tick * maxBarH;
        return (
          <g key={idx}>
            <line
              x1={chartLeft}
              y1={gy}
              x2={chartRight}
              y2={gy}
              stroke={tick === 0 ? INK : '#e2e8f0'}
              strokeWidth={tick === 0 ? 5 : 3}
              strokeDasharray={tick === 0 ? undefined : '10 10'}
            />
            <text
              x={chartLeft - 24}
              y={gy + 8}
              textAnchor="end"
              fill="#64748b"
              fontSize="22"
              fontWeight="700"
              fontFamily={FONT}
            >
              {tick === 0 ? 'Thấp' : tick === 0.5 ? 'Vừa' : tick === 1 ? 'Rất cao' : ''}
            </text>
          </g>
        );
      })}

      {/* Vertical Y-axis */}
      <line
        x1={chartLeft}
        y1={chartTop - 16}
        x2={chartLeft}
        y2={chartBottom}
        stroke={INK}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <text
        x="248"
        y="485"
        textAnchor="middle"
        fill={INK}
        fontSize="24"
        fontWeight="700"
        fontFamily={FONT}
        transform="rotate(-90 248 485)"
      >
        Mức độ dễ say xe
      </text>

      {/* 3 Bars */}
      {bars.map((bar, i) => {
        const curH = bar.targetPct * maxBarH * bar.grow;
        const barY = chartBottom - curH;
        const visible = bar.grow > 0.01;
        return (
          <g key={i}>
            {visible ? (
              <g>
                {/* Bar body */}
                <rect
                  x={bar.cx - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={curH}
                  rx="18"
                  fill={bar.fill}
                  stroke={INK}
                  strokeWidth="5"
                />
                {/* Soft highlight strip */}
                {curH > 36 ? (
                  <rect
                    x={bar.cx - barWidth / 2 + 16}
                    y={barY + 14}
                    width="24"
                    height={Math.max(12, curH - 28)}
                    rx="12"
                    fill="#ffffff"
                    opacity="0.28"
                  />
                ) : null}
                {/* Value pill above bar */}
                <g opacity={clamp01((bar.grow - 0.35) * 2)}>
                  <rect
                    x={bar.cx - 84}
                    y={barY - 56}
                    width="168"
                    height="42"
                    rx="21"
                    fill={bar.lightFill}
                    stroke={bar.fill}
                    strokeWidth="3.5"
                  />
                  <text
                    x={bar.cx}
                    y={barY - 27}
                    textAnchor="middle"
                    fill={INK}
                    fontSize="22"
                    fontWeight="700"
                    fontFamily={FONT}
                  >
                    {bar.valueText}
                  </text>
                </g>
              </g>
            ) : null}

            {/* X-axis category label (appears when bar activates) */}
            <g opacity={visible ? clamp01(bar.grow * 2) : 0.18}>
              <text
                x={bar.cx}
                y={chartBottom + 44}
                textAnchor="middle"
                fill={INK}
                fontSize="28"
                fontWeight="800"
                fontFamily={FONT}
              >
                {bar.label}
              </text>
              <text
                x={bar.cx}
                y={chartBottom + 78}
                textAnchor="middle"
                fill="#475569"
                fontSize="21"
                fontWeight="600"
                fontFamily={FONT}
              >
                {bar.sub}
              </text>
            </g>
          </g>
        );
      })}

      {/* Downward adaptation trend arrow in s >= 2 */}
      {s >= 2 ? (
        <g opacity={clamp01((b3 - 0.3) * 2)}>
          <path
            d="M715 300 Q1050 385 1340 505"
            fill="none"
            stroke="#0f766e"
            strokeWidth="6"
            strokeDasharray="14 10"
            strokeLinecap="round"
          />
          <polygon points="1362,515 1330,490 1322,520" fill="#0f766e" />
        </g>
      ) : null}

      {/* Top title */}
      <CleanLabel
        x={960}
        y={148}
        text="Mức độ dễ say xe theo nhóm tuổi"
        bg="#ffffff"
        border={INK}
        color={INK}
        fontSize={28}
      />
    </svg>
  );
};

/* ============================================================================
 * 4. SayXeTipLookHorizonVisual (b50, b51)
 * Nhìn thẳng ra đường chân trời + đồng bộ Mắt và Tai trong
 * ============================================================================ */
export const SayXeTipLookHorizonVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const syncAppear = s >= 1 ? easeOutCubic(clamp01(progress * 1.5)) : 0;
  const cloudDrift = (frame * 0.7) % 1920;
  const roadDashOffset = -(frame * 12) % 90;
  const pulse = 1 + Math.sin(frame * 0.1) * 0.04;

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="horizonSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="65%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
        <clipPath id="horizonWindshieldClip">
          <rect x="110" y="135" width="1700" height="680" rx="44" />
        </clipPath>
      </defs>

      {/* Vehicle interior frame */}
      <rect x="0" y="0" width="1920" height="1080" fill="#1e293b" />

      {/* Panoramic windshield view of open horizon */}
      <g clipPath="url(#horizonWindshieldClip)">
        <rect x="110" y="135" width="1700" height="400" fill="url(#horizonSkyGrad)" />

        {/* Warm sun near horizon */}
        <circle cx="960" cy="435" r="88" fill="#fde047" opacity="0.35" />
        <circle cx="960" cy="435" r="56" fill="#facc15" />

        {/* Drifting clouds */}
        {[240, 820, 1460].map((cx, i) => {
          const xPos = ((cx + cloudDrift) % 2100) - 180;
          return (
            <g key={i} transform={`translate(${xPos}, ${235 + (i % 2) * 42})`} opacity="0.9">
              <ellipse cx="0" cy="0" rx="85" ry="28" fill="#ffffff" />
              <ellipse cx="42" cy="6" rx="58" ry="22" fill="#ffffff" />
            </g>
          );
        })}

        {/* Far mountain silhouette */}
        <path
          d="M110 475 L340 345 L560 445 L820 330 L1080 440 L1360 320 L1620 435 L1810 375 L1810 530 L110 530 Z"
          fill="#60a5fa"
          opacity="0.7"
        />
        {/* Near green hills */}
        <path
          d="M110 510 Q480 420 960 468 T1810 475 L1810 820 L110 820 Z"
          fill="#4ade80"
          stroke={INK}
          strokeWidth="4"
        />

        {/* Straight highway leading cleanly to horizon */}
        <path
          d="M650 820 L925 468 L995 468 L1270 820 Z"
          fill="#475569"
          stroke={INK}
          strokeWidth="4.5"
        />
        <line
          x1="960"
          y1="820"
          x2="960"
          y2="468"
          stroke="#fde047"
          strokeWidth="8"
          strokeDasharray="34 26"
          strokeDashoffset={roadDashOffset}
          strokeLinecap="round"
        />

        {/* Subtle horizon guide line & focus point */}
        <line
          x1="200"
          y1="468"
          x2="1720"
          y2="468"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeDasharray="16 14"
          opacity="0.75"
        />
        <g transform={`translate(960, 468) scale(${pulse})`}>
          <circle cx="0" cy="0" r="34" fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray="10 8" />
          <circle cx="0" cy="0" r="8" fill="#ffffff" />
        </g>
      </g>

      {/* Windshield border */}
      <rect
        x="110"
        y="135"
        width="1700"
        height="680"
        rx="44"
        fill="none"
        stroke="#0f172a"
        strokeWidth="18"
      />

      {/* s >= 1: Eye & Inner Ear Sync Card */}
      {syncAppear > 0.01 ? (
        <g
          transform={`translate(960, ${lerp(720, 675, syncAppear)})`}
          opacity={syncAppear}
        >
          <rect
            x="-460"
            y="-108"
            width="920"
            height="216"
            rx="30"
            fill="#ffffff"
            fillOpacity="0.96"
            stroke="#16a34a"
            strokeWidth="5.5"
          />

          {/* Left: Eye icon */}
          <g transform="translate(-270, -14)">
            <circle cx="0" cy="0" r="56" fill="#e0f2fe" stroke={INK} strokeWidth="4" />
            <path
              d="M-38 0 Q0 -28 38 0 Q0 28 -38 0 Z"
              fill="#ffffff"
              stroke={INK}
              strokeWidth="4.5"
            />
            <circle cx="0" cy="0" r="14" fill="#2563eb" stroke={INK} strokeWidth="3" />
            <circle cx="3" cy="-3" r="4.5" fill="#ffffff" />
            <text
              x="0"
              y="84"
              textAnchor="middle"
              fill={INK}
              fontSize="23"
              fontWeight="700"
              fontFamily={FONT}
            >
              Mắt thấy đang đi
            </text>
          </g>

          {/* Center sync checkmark */}
          <g transform="translate(0, -14)">
            <line x1="-180" y1="0" x2="-58" y2="0" stroke="#16a34a" strokeWidth="7" strokeLinecap="round" />
            <line x1="58" y1="0" x2="180" y2="0" stroke="#16a34a" strokeWidth="7" strokeLinecap="round" />
            <circle cx="0" cy="0" r="46" fill="#dcfce7" stroke="#16a34a" strokeWidth="5.5" />
            <path
              d="M-18 2 L-4 16 L22 -14"
              fill="none"
              stroke="#16a34a"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="0"
              y="84"
              textAnchor="middle"
              fill="#15803d"
              fontSize="25"
              fontWeight="800"
              fontFamily={FONT}
            >
              Mắt và tai đồng bộ
            </text>
          </g>

          {/* Right: Inner Ear / Vestibular icon */}
          <g transform="translate(270, -14)">
            <circle cx="0" cy="0" r="56" fill="#fef3c7" stroke={INK} strokeWidth="4" />
            <path
              d="M-14 26 C-28 24 -30 -4 -12 -22 C6 -36 30 -24 28 -2 C26 16 10 22 4 12 C-2 2 10 -10 14 -2"
              fill="none"
              stroke="#d97706"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <text
              x="0"
              y="84"
              textAnchor="middle"
              fill={INK}
              fontSize="23"
              fontWeight="700"
              fontFamily={FONT}
            >
              Tai cảm nhận khớp
            </text>
          </g>
        </g>
      ) : null}

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={148}
        text={s === 0 ? 'Mẹo 1: Nhìn thẳng ra đường chân trời' : 'Mắt và tai đồng bộ'}
        bg={s >= 1 ? '#dcfce7' : '#ffffff'}
        border={s >= 1 ? '#16a34a' : INK}
        color={INK}
        fontSize={28}
      />
    </svg>
  );
};

/* ============================================================================
 * 5. SayXeTipFrontSeatVisual (b52, b53)
 * s === 0: SedanCarExterior (Ô tô con: Ngồi ghế trước)
 * s >= 1: CoachBusExterior (Xe khách: Chọn ghế giữa)
 * ============================================================================ */
export const SayXeTipFrontSeatVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const isBus = s >= 1;

  const wheelAngle = (frame * (isBus ? 7 : 8)) % 360;
  const roadScroll = (frame * 10) % 160;
  const suspensionBounce = isBus
    ? Math.sin(frame * 0.14) * 3.5
    : Math.sin(frame * 0.16) * 2.5;
  const arrowBob = Math.sin(frame * 0.12) * 8;

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="seatTipSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
      </defs>

      {/* Clean sky background */}
      <rect x="0" y="0" width="1920" height="720" fill="url(#seatTipSky)" />

      {/* Soft distant hills */}
      <path
        d="M0 700 Q360 560 760 650 T1520 620 T1920 660 L1920 740 L0 740 Z"
        fill="#bbf7d0"
      />

      {/* Flat road surface */}
      <rect x="0" y="715" width="1920" height="365" fill="#475569" />
      <line x1="0" y1="715" x2="1920" y2="715" stroke={INK} strokeWidth="6" />
      <line
        x1={-roadScroll}
        y1="805"
        x2={1920 + 160}
        y2="805"
        stroke="#fde047"
        strokeWidth="10"
        strokeDasharray="80 80"
        strokeLinecap="round"
      />

      {!isBus ? (
        /* s === 0 (b52): SedanCarExterior with highlighted front seat */
        <g>
          {/* Ground shadow */}
          <ellipse cx="960" cy="726" rx="430" ry="20" fill="#1e293b" opacity="0.28" />

          {/* Sedan car (width 672 * 1.32 = 887 -> x=516, wheel bottom y=405 + 268*1.32 = 758 -> place at y=368 so wheel bottom = 722) */}
          <SedanCarExterior
            x={516}
            y={368 + suspensionBounce}
            scale={1.32}
            wheelAngle={wheelAngle}
            highlightFrontSeat={true}
          />

          {/* Green pointer arrow to front seat window */}
          <g transform={`translate(1070, ${282 + arrowBob})`}>
            <line x1="0" y1="0" x2="0" y2="80" stroke="#16a34a" strokeWidth="10" strokeLinecap="round" />
            <polygon points="0,104 -18,72 18,72" fill="#16a34a" />
          </g>
          <CleanLabel
            x={1135}
            y={245}
            text="Ghế trước: Tầm nhìn rộng"
            bg="#dcfce7"
            border="#16a34a"
            color="#14532d"
            fontSize={24}
          />

          {/* Subtle muted pointer for rear seat */}
          <CleanLabel
            x={640}
            y={285}
            text="Ghế sau: Khuất tầm nhìn"
            bg="#fee2e2"
            border="#ef4444"
            color="#991b1b"
            fontSize={22}
          />
        </g>
      ) : (
        /* s >= 1 (b53): CoachBusExterior (same bus from Act 1) with middle seats highlighted */
        <g>
          {/* Ground shadow */}
          <ellipse cx="960" cy="728" rx="475" ry="22" fill="#1e293b" opacity="0.28" />

          {/* Coach bus (width 720 * 1.3 = 936 -> x=492, wheel bottom y = 342 + 294*1.3 = 724) */}
          <CoachBusExterior
            x={492}
            y={340 + suspensionBounce}
            scale={1.3}
            wheelAngle={wheelAngle}
            highlightMiddle={true}
          />

          {/* Green arrow pointing to middle seats (windows 1 & 2 around x = 492 + 320*1.3 = 908) */}
          <g transform={`translate(910, ${248 + arrowBob})`}>
            <line x1="0" y1="0" x2="0" y2="66" stroke="#16a34a" strokeWidth="10" strokeLinecap="round" />
            <polygon points="0,88 -18,58 18,58" fill="#16a34a" />
          </g>
          <CleanLabel
            x={960}
            y={220}
            text="Ghế giữa: Gần trục, ít xóc"
            bg="#dcfce7"
            border="#16a34a"
            color="#14532d"
            fontSize={24}
          />

          {/* Red pointer to rear tail seat (window 0 around x = 492 + 104*1.3 = 627) */}
          <g transform={`translate(625, ${270 - arrowBob * 0.6})`}>
            <line x1="0" y1="0" x2="0" y2="48" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
            <polygon points="0,68 -15,42 15,42" fill="#ef4444" />
          </g>
          <CleanLabel
            x={475}
            y={255}
            text="Đuôi xe: Xóc mạnh"
            bg="#fee2e2"
            border="#ef4444"
            color="#991b1b"
            fontSize={22}
          />
        </g>
      )}

      {/* Top safe-zone label (exact V20.1 spec) */}
      <CleanLabel
        x={960}
        y={144}
        text={!isBus ? 'Ô tô con: Ngồi ghế trước' : 'Xe khách: Chọn ghế giữa'}
        bg="#ffffff"
        border={INK}
        color={INK}
        fontSize={28}
      />
    </svg>
  );
};

/* ============================================================================
 * 6. SayXeTipFreshAirGingerVisual (b54, b55)
 * s === 0: Bên trái sáng (cửa gió điều hòa mát), bên phải mờ nhẹ
 * s >= 1: Bên phải sáng (trà gừng ấm + lát gừng), bên trái giữ nguyên sáng
 * ============================================================================ */
export const SayXeTipFreshAirGingerVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const rightAlpha = s === 0 ? 0.25 : lerp(0.25, 1, easeOutCubic(clamp01(progress * 1.5)));
  const breezePhase = (frame * 5) % 80;
  const steamPhase = (frame * 1.4) % 60;

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Crisp neutral background */}
      <rect x="0" y="0" width="1920" height="1080" fill="#f8fafc" />

      {/* LEFT PANEL: Cool AC Vent + Happy Boy */}
      <g>
        <rect
          x="110"
          y="205"
          width="810"
          height="620"
          rx="34"
          fill="#f0f9ff"
          stroke="#0284c7"
          strokeWidth="5.5"
        />

        {/* AC Vent housing on left */}
        <g transform="translate(175, 360)">
          <rect x="0" y="0" width="110" height="150" rx="22" fill="#334155" stroke={INK} strokeWidth="5" />
          <rect x="16" y="18" width="78" height="114" rx="12" fill="#1e293b" />
          {[36, 58, 80, 102, 124].map((ly, i) => (
            <line
              key={i}
              x1="24"
              y1={ly}
              x2="86"
              y2={ly - 6}
              stroke="#94a3b8"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Animated cool air waves flowing toward the boy's face */}
        {[385, 435, 485].map((wy, idx) => (
          <path
            key={idx}
            d={`M310 ${wy} Q385 ${wy - 22} 455 ${wy} T595 ${wy - 8}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="34 22"
            strokeDashoffset={-(breezePhase + idx * 18)}
          />
        ))}

        {/* Boy seated comfortably enjoying the fresh breeze (FULL LEGS) */}
        <SharedStickman
          x={730}
          y={615}
          scale={1.15}
          role="BOY"
          mood="HAPPY"
          facing="LEFT"
          seated={true}
          headTiltDeg={Math.sin(frame * 0.08) * 3}
        />

        {/* Seat cushion under boy */}
        <rect x="650" y="618" width="140" height="24" rx="12" fill="#3b82f6" stroke={INK} strokeWidth="4.5" />

        <CleanLabel
          x={515}
          y={768}
          text="Hướng cửa gió mát vào mặt"
          bg="#ffffff"
          border="#0284c7"
          color="#0369a1"
          fontSize={24}
        />
      </g>

      {/* RIGHT PANEL: Warm Ginger Tea + Fresh Ginger Slices */}
      <g opacity={rightAlpha}>
        <rect
          x="1000"
          y="205"
          width="810"
          height="620"
          rx="34"
          fill="#fffbeb"
          stroke="#d97706"
          strokeWidth="5.5"
        />

        {/* Table surface inside right panel */}
        <line x1="1060" y1="670" x2="1750" y2="670" stroke="#b45309" strokeWidth="5" strokeLinecap="round" />

        {/* Rising warm steam wisps */}
        {[1315, 1375, 1435].map((sx, idx) => {
          const lift = (steamPhase + idx * 20) % 60;
          const op = Math.sin((lift / 60) * Math.PI) * 0.8;
          return (
            <path
              key={idx}
              d={`M${sx} ${425 - lift} Q${sx - 18} ${390 - lift} ${sx} ${355 - lift} T${sx + 8} ${300 - lift}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="6"
              strokeLinecap="round"
              opacity={op}
            />
          );
        })}

        {/* Warm mug of ginger tea */}
        <g transform="translate(1375, 555)">
          {/* Mug handle */}
          <path
            d="M112 -52 C164 -52 164 42 112 42"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M112 -52 C164 -52 164 42 112 42"
            fill="none"
            stroke={INK}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Mug body */}
          <path
            d="M-112 -90 L112 -90 L98 92 Q95 112 72 112 L-72 112 Q-95 112 -98 92 Z"
            fill="#ffffff"
            stroke={INK}
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          {/* Amber ginger tea surface */}
          <ellipse cx="0" cy="-90" rx="112" ry="26" fill="#fbbf24" stroke={INK} strokeWidth="5" />
          <ellipse cx="0" cy="-90" rx="92" ry="16" fill="#f59e0b" />
          {/* Floating ginger slice in tea */}
          <ellipse cx="-26" cy="-90" rx="28" ry="9" fill="#fef08a" stroke="#b45309" strokeWidth="3" />
          {/* Calm leaf emblem on mug */}
          <path
            d="M0 44 C-28 24 -24 -16 0 -24 C24 -16 28 24 0 44 Z"
            fill="#bbf7d0"
            stroke="#16a34a"
            strokeWidth="4"
          />
          <line x1="0" y1="44" x2="0" y2="-16" stroke="#16a34a" strokeWidth="3.5" />
        </g>

        {/* Fresh yellow ginger slices on plate beside mug */}
        <g transform="translate(1615, 635)">
          <ellipse cx="0" cy="24" rx="88" ry="16" fill="#fed7aa" stroke={INK} strokeWidth="4" />
          {/* Ginger slice 1 */}
          <ellipse cx="-24" cy="4" rx="44" ry="26" fill="#fde047" stroke="#a16207" strokeWidth="4.5" />
          <ellipse cx="-24" cy="4" rx="28" ry="15" fill="#fef9c3" />
          {/* Ginger slice 2 */}
          <ellipse cx="28" cy="12" rx="42" ry="24" fill="#facc15" stroke="#a16207" strokeWidth="4.5" />
          <ellipse cx="28" cy="12" rx="26" ry="13" fill="#fef08a" />
        </g>

        <CleanLabel
          x={1405}
          y={768}
          text="Trà gừng ấm làm dịu dạ dày"
          bg="#ffffff"
          border="#d97706"
          color="#92400e"
          fontSize={24}
        />
      </g>

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={148}
        text={s === 0 ? 'Mẹo 3: Hướng cửa gió mát lên mặt' : 'Kết hợp gừng ấm làm dịu dạ dày'}
        bg="#ffffff"
        border={INK}
        color={INK}
        fontSize={28}
      />
    </svg>
  );
};

/* ============================================================================
 * 7. SayXeTipPutPhoneDownVisual (b56, b57)
 * BusCabinBackdrop + CoachBusSeat + SharedStickman + CleanLabel (không bao giờ tràn chữ)
 * ============================================================================ */
export const SayXeTipPutPhoneDownVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const putDownT = s === 0 ? easeOutCubic(clamp01(progress * 1.25)) : 1;
  const phoneY = lerp(550, 700, putDownT);
  const phoneX = lerp(895, 1140, putDownT);
  const phoneRot = lerp(16, 72, putDownT);

  const cabinShakeY = Math.sin(frame * 0.1) * 2.5;
  const relaxHeadTilt = s >= 1 ? -5 + Math.sin(frame * 0.06) * 3.5 : lerp(14, 0, putDownT);

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <BusCabinBackdrop frame={frame} shakeY={cabinShakeY}>
        {/* Standard CoachBusSeat */}
        <CoachBusSeat x={730} y={685} scale={1.15} />

        {/* Boy seated with full legs */}
        <SharedStickman
          x={746}
          y={682}
          scale={1.22}
          role="BOY"
          mood={s >= 1 ? 'RELAXED' : 'HAPPY'}
          facing="RIGHT"
          seated={true}
          holdingPhone={false}
          headphones={s >= 1}
          headTiltDeg={relaxHeadTilt}
        />

        {/* s === 0: Phone smoothly lowering into travel bag */}
        {s === 0 ? (
          <g>
            {/* Travel bag on cabin floor */}
            <g transform="translate(1140, 742)">
              <rect x="-66" y="-42" width="132" height="92" rx="18" fill="#0f766e" stroke={INK} strokeWidth="5" />
              <path d="M-32 -42 C-32 -70 32 -70 32 -42" fill="none" stroke={INK} strokeWidth="6" />
              <rect x="-46" y="-12" width="92" height="36" rx="8" fill="#14b8a6" stroke={INK} strokeWidth="3.5" />
            </g>

            {/* Curved downward arrow guiding phone into bag */}
            <path
              d="M930 520 Q1075 510 1135 645"
              fill="none"
              stroke="#0284c7"
              strokeWidth="6"
              strokeDasharray="12 10"
              strokeLinecap="round"
            />
            <polygon points="1142,664 1118,638 1148,632" fill="#0284c7" />

            {/* Phone moving down into bag */}
            <g transform={`translate(${phoneX}, ${phoneY}) rotate(${phoneRot})`} opacity={lerp(1, 0.35, putDownT)}>
              <rect x="-24" y="-44" width="48" height="88" rx="10" fill="#1e293b" stroke={INK} strokeWidth="4.5" />
              <rect x="-17" y="-34" width="34" height="64" rx="4" fill="#7dd3fc" />
            </g>
          </g>
        ) : (
          /* s >= 1: Floating musical notes around boy with headphones */
          <g>
            {[0, 1, 2].map((idx) => {
              const phase = ((frame * 1.4 + idx * 38) % 115) / 115;
              const nx = 855 + idx * 78 + Math.sin(phase * Math.PI * 2 + idx) * 18;
              const ny = 495 - phase * 155;
              const op = Math.sin(phase * Math.PI);
              return (
                <text
                  key={idx}
                  x={nx}
                  y={ny}
                  fill={idx % 2 === 0 ? '#f59e0b' : '#2563eb'}
                  fontSize={idx === 1 ? '56' : '46'}
                  fontWeight="800"
                  fontFamily={FONT}
                  opacity={op}
                >
                  {idx % 2 === 0 ? '♪' : '♫'}
                </text>
              );
            })}
          </g>
        )}
      </BusCabinBackdrop>

      {/* Auto-sized CleanLabel — NEVER overflows text */}
      <CleanLabel
        x={960}
        y={148}
        text={
          s === 0
            ? 'Mẹo 4: Cất điện thoại, tránh nhìn màn hình'
            : 'Đeo tai nghe nghe nhạc và thư giãn'
        }
        bg={s >= 1 ? '#fef3c7' : '#ffffff'}
        border={s >= 1 ? '#d97706' : INK}
        color={INK}
        fontSize={28}
      />
    </svg>
  );
};

/* ============================================================================
 * 8. SayXeHappyTripReturnVisual (b58, b59)
 * BusCabinBackdrop (sunset=true) + 2 CoachBusSeat + BOY (headphones) + GRANDPA
 * ĐẦY ĐỦ CẢ CHÂN CHẠM SÀN XE — không cụt chân, không sofa nâu!
 * ============================================================================ */
export const SayXeHappyTripReturnVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;
  const gentleGlide = Math.sin(frame * 0.08) * 2;
  const headBob = Math.sin(frame * 0.06) * 3;

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <BusCabinBackdrop frame={frame} sunset={true} shakeY={gentleGlide}>
        {/* Warm golden sunset glow ray in s >= 1 */}
        {s >= 1 ? (
          <path
            d="M720 145 L1240 145 L1540 795 L420 795 Z"
            fill="#fde047"
            opacity={0.14 + Math.sin(frame * 0.05) * 0.03}
          />
        ) : null}

        {/* Seat 1 (Left-center): GRANDPA */}
        <CoachBusSeat x={560} y={685} scale={1.15} />
        <SharedStickman
          x={576}
          y={682}
          scale={1.22}
          role="GRANDPA"
          mood="HAPPY"
          facing="RIGHT"
          seated={true}
          headTiltDeg={headBob * 0.7}
        />

        {/* Seat 2 (Right-center): BOY wearing headphones */}
        <CoachBusSeat x={1100} y={685} scale={1.15} />
        <SharedStickman
          x={1116}
          y={682}
          scale={1.22}
          role="BOY"
          mood={s >= 1 ? 'RELAXED' : 'HAPPY'}
          facing="RIGHT"
          seated={true}
          headphones={true}
          headTiltDeg={-headBob}
        />

        {/* Floating peaceful music notes near boy */}
        {[0, 1, 2].map((idx) => {
          const phase = ((frame * 1.2 + idx * 42) % 126) / 126;
          const nx = 1215 + idx * 64 + Math.sin(phase * Math.PI * 2) * 14;
          const ny = 490 - phase * 140;
          const op = Math.sin(phase * Math.PI) * (s >= 1 ? 0.95 : 0.7);
          return (
            <text
              key={idx}
              x={nx}
              y={ny}
              fill={idx % 2 === 0 ? '#ea580c' : '#d97706'}
              fontSize={idx === 1 ? '50' : '42'}
              fontWeight="800"
              fontFamily={FONT}
              opacity={op}
            >
              {idx % 2 === 0 ? '♪' : '♫'}
            </text>
          );
        })}
      </BusCabinBackdrop>

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={148}
        text={
          s === 0
            ? 'Chuyến xe chiều Chủ nhật trở về thành phố'
            : 'Êm ái và tỉnh táo suốt chặng đường về'
        }
        bg="#fef3c7"
        border="#d97706"
        color="#78350f"
        fontSize={28}
      />
    </svg>
  );
};

/* ============================================================================
 * 9. SayXeSummary3RulesVisual (b60, b61)
 * 3 thẻ nguyên tắc sáng lũy tiến KHÔNG RESET
 * ============================================================================ */
export const SayXeSummary3RulesVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  step,
  visualStep,
}) => {
  const s = step ?? visualStep ?? 0;

  // Strict non-resetting card illumination
  const c1 = s === 0 ? easeOutCubic(clamp01(progress * 2.2)) : 1;
  const c2 = s === 0 ? easeOutCubic(clamp01((progress - 0.38) * 2.2)) : 1;
  const c3 = s === 0 ? 0 : easeOutCubic(clamp01(progress * 2.0));

  const cards = [
    {
      x: 140,
      num: '1',
      title: 'Nhìn ra đường chân trời',
      sub1: 'Ngẩng đầu nhìn thẳng phía trước',
      sub2: 'để mắt và tai trong đồng bộ',
      accent: '#0284c7',
      bg: '#e0f2fe',
      lit: c1,
    },
    {
      x: 710,
      num: '2',
      title: 'Cất điện thoại, nghe nhạc',
      sub1: 'Tránh nhìn màn hình rung lắc,',
      sub2: 'đeo tai nghe thư giãn mắt',
      accent: '#d97706',
      bg: '#fef3c7',
      lit: c2,
    },
    {
      x: 1280,
      num: '3',
      title: 'Chọn ghế ít xóc & giữ thoáng',
      sub1: 'Ghế trước ô tô con / giữa xe khách,',
      sub2: 'giữ gió mát và trà gừng ấm',
      accent: '#16a34a',
      bg: '#dcfce7',
      lit: c3,
    },
  ];

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Clean background */}
      <rect x="0" y="0" width="1920" height="1080" fill="#f8fafc" />

      {/* Top safe-zone heading */}
      <CleanLabel
        x={960}
        y={148}
        text="3 nguyên tắc dễ nhớ giúp phòng say xe"
        bg="#ffffff"
        border={INK}
        color={INK}
        fontSize={28}
      />

      {/* 3 Rule Cards inside y=230..790 */}
      {cards.map((card, i) => {
        const opacity = lerp(0.24, 1, card.lit);
        const liftY = lerp(18, 0, card.lit);
        return (
          <g
            key={i}
            transform={`translate(${card.x}, ${235 + liftY})`}
            opacity={opacity}
          >
            {/* Card body */}
            <rect
              x="0"
              y="0"
              width="500"
              height="545"
              rx="32"
              fill="#ffffff"
              stroke={card.lit > 0.5 ? card.accent : '#cbd5e1'}
              strokeWidth="6"
            />
            {/* Top colored header band */}
            <path
              d="M0 32 Q0 0 32 0 L468 0 Q500 0 500 32 L500 220 L0 220 Z"
              fill={card.bg}
            />
            {/* Number badge */}
            <circle cx="56" cy="56" r="30" fill={card.accent} stroke={INK} strokeWidth="4" />
            <text
              x="56"
              y="67"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="30"
              fontWeight="800"
              fontFamily={FONT}
            >
              {card.num}
            </text>

            {/* Card icon */}
            {i === 0 ? (
              /* Horizon + Eye icon */
              <g transform="translate(250, 122)">
                <circle cx="0" cy="0" r="64" fill="#ffffff" stroke={card.accent} strokeWidth="5" />
                <path d="M-46 18 L-12 -18 L18 8 L46 -12 L46 34 L-46 34 Z" fill="#86efac" />
                <circle cx="16" cy="-24" r="14" fill="#facc15" />
                <line x1="-54" y1="18" x2="54" y2="18" stroke={INK} strokeWidth="3.5" />
              </g>
            ) : i === 1 ? (
              /* Headphones + Music note icon */
              <g transform="translate(250, 122)">
                <circle cx="0" cy="0" r="64" fill="#ffffff" stroke={card.accent} strokeWidth="5" />
                <path d="M-36 12 A36 36 0 0 1 36 12" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
                <rect x="-46" y="4" width="18" height="32" rx="8" fill="#f59e0b" stroke={INK} strokeWidth="4" />
                <rect x="28" y="4" width="18" height="32" rx="8" fill="#f59e0b" stroke={INK} strokeWidth="4" />
                <text x="0" y="20" textAnchor="middle" fill="#d97706" fontSize="34" fontWeight="800" fontFamily={FONT}>
                  ♫
                </text>
              </g>
            ) : (
              /* Middle Seat + Cool Breeze icon */
              <g transform="translate(250, 122)">
                <circle cx="0" cy="0" r="64" fill="#ffffff" stroke={card.accent} strokeWidth="5" />
                <rect x="-34" y="-26" width="18" height="58" rx="7" fill="#2563eb" stroke={INK} strokeWidth="3.5" />
                <rect x="-32" y="16" width="52" height="18" rx="7" fill="#3b82f6" stroke={INK} strokeWidth="3.5" />
                <path d="M4 -20 Q22 -30 38 -20" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
                <path d="M10 -4 Q26 -14 42 -4" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
              </g>
            )}

            {/* Title */}
            <text
              x="250"
              y="296"
              textAnchor="middle"
              fill={INK}
              fontSize="29"
              fontWeight="800"
              fontFamily={FONT}
            >
              {card.title}
            </text>

            {/* Subtitle lines */}
            <text
              x="250"
              y="360"
              textAnchor="middle"
              fill="#475569"
              fontSize="24"
              fontWeight="600"
              fontFamily={FONT}
            >
              {card.sub1}
            </text>
            <text
              x="250"
              y="398"
              textAnchor="middle"
              fill="#475569"
              fontSize="24"
              fontWeight="600"
              fontFamily={FONT}
            >
              {card.sub2}
            </text>

            {/* Checkmark indicator when lit */}
            {card.lit > 0.6 ? (
              <g transform="translate(250, 476)">
                <circle cx="0" cy="0" r="28" fill={card.bg} stroke={card.accent} strokeWidth="4.5" />
                <path
                  d="M-12 1 L-3 10 L14 -9"
                  fill="none"
                  stroke={card.accent}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};
