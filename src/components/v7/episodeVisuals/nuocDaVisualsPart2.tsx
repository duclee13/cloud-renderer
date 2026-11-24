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
  IcedDrinkGlass,
  HeadCutawayDiagram,
  SummerPorchBackdrop,
} from './nuocDaSharedAssets';

// ============================================================================
// 8. NUOCDA_THERMOSTAT_ALARM
// ============================================================================
export const NuocDaThermostatAlarmVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const isAlert = activeStep >= 1;
  const isStop = activeStep >= 2;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.22);
  const bellSwing = isAlert && !isStop ? Math.sin(frame * 0.45) * 14 : 0;

  const dialX = isStop ? lerp(960, 520, p) : 960;
  const dialY = 410;
  const coldWaveRise = activeStep === 1 ? lerp(180, 0, p) : activeStep >= 2 ? 0 : 220;

  const statusColor = isAlert ? '#EF4444' : '#10B981';
  const ringBg = isAlert ? '#FEE2E2' : '#DCFCE7';
  const tempText = activeStep === 0 ? '37.0°C' : activeStep === 1 ? '36.4°C ↓' : '36.8°C';

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd8_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="nd8_coldWave" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="nd8_sirenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
        <filter id="nd8_shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Control Room Backdrop */}
      <rect width="1920" height="1080" fill="url(#nd8_bg)" />

      {/* Subtle technical grid */}
      <g opacity="0.22" stroke="#94A3B8" strokeWidth="1.5">
        {[240, 480, 720, 960, 1200, 1440, 1680].map((gx) => (
          <line key={gx} x1={gx} y1="80" x2={gx} y2="750" />
        ))}
        {[160, 320, 480, 640].map((gy) => (
          <line key={gy} x1="120" y1={gy} x2="1800" y2={gy} />
        ))}
      </g>

      {/* Sleek Control Console Frame */}
      <rect
        x="150"
        y="95"
        width="1620"
        height="635"
        rx="34"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth="4"
        filter="url(#nd8_shadow)"
      />

      {/* Console Top Header Bar */}
      <rect x="150" y="95" width="1620" height="64" rx="34" fill="#0F172A" />
      <rect x="150" y="128" width="1620" height="31" fill="#0F172A" />
      <circle cx="205" cy="127" r="9" fill="#EF4444" />
      <circle cx="238" cy="127" r="9" fill="#F59E0B" />
      <circle cx="271" cy="127" r="9" fill="#10B981" />
      <text
        x="960"
        y="135"
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="24"
        fontWeight="700"
        letterSpacing="1.5"
      >
        TRUNG TÂM ĐIỀU NHIỆT NÃO BỘ — 37°C LOCK
      </text>

      {/* Cold Blue Wave hitting lower sensor in Step 1+ */}
      {isAlert && (
        <g opacity={activeStep === 1 ? clamp01(p * 1.4) : 0.45}>
          <path
            d={`M ${dialX - 240} ${715 + coldWaveRise} Q ${dialX - 120} ${625 + coldWaveRise} ${dialX} ${660 + coldWaveRise} T ${dialX + 240} ${655 + coldWaveRise} L ${dialX + 240} 730 L ${dialX - 240} 730 Z`}
            fill="url(#nd8_coldWave)"
          />
          {/* Lower sensor probe */}
          <rect
            x={dialX - 75}
            y="645"
            width="150"
            height="42"
            rx="14"
            fill="#0EA5E9"
            stroke="#0369A1"
            strokeWidth="3"
          />
          <text
            x={dialX}
            y="673"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="20"
            fontWeight="800"
          >
            CẢM BIẾN LẠNH
          </text>
        </g>
      )}

      {/* Main Digital Thermostat with Brain Icon */}
      <g transform={`translate(${dialX}, ${dialY})`}>
        {/* Siren glow behind thermostat in Step 1 */}
        {activeStep === 1 && (
          <circle
            cx="0"
            cy="0"
            r={235 + pulse * 32}
            fill="url(#nd8_sirenGlow)"
          />
        )}

        {/* Outer Ring */}
        <circle cx="0" cy="0" r="205" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="8" />
        <circle
          cx="0"
          cy="0"
          r="182"
          fill={ringBg}
          stroke={statusColor}
          strokeWidth="14"
          strokeDasharray={isAlert ? '24 12' : 'none'}
        />

        {/* Stylized Clean 2D Brain Icon */}
        <g transform="translate(0, -52)">
          <path
            d="M -52 12 C -74 10 -80 -22 -58 -38 C -60 -62 -28 -74 -6 -58 C 16 -74 52 -62 50 -38 C 74 -22 68 10 46 12 C 50 32 24 44 0 34 C -24 44 -54 32 -52 12 Z"
            fill="#F472B6"
            stroke={INK}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <path
            d="M 0 -55 L 0 32 M -38 -25 Q -20 -12 -32 5 M 36 -25 Q 18 -12 30 5 M -22 -42 Q -10 -30 -18 -18 M 22 -42 Q 10 -30 18 -18"
            fill="none"
            stroke="#9D174D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* Digital Temperature Readout */}
        <rect
          x="-115"
          y="22"
          width="230"
          height="74"
          rx="18"
          fill="#0F172A"
          stroke={statusColor}
          strokeWidth="3.5"
        />
        <text
          x="0"
          y="72"
          textAnchor="middle"
          fill={isAlert ? '#FCA5A5' : '#6EE7B7'}
          fontSize="44"
          fontWeight="800"
        >
          {tempText}
        </text>

        {/* Status Pill */}
        <rect
          x="-85"
          y="114"
          width="170"
          height="36"
          rx="18"
          fill={statusColor}
        />
        <text
          x="0"
          y="139"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="20"
          fontWeight="800"
        >
          {isAlert ? 'BÁO ĐỘNG!' : 'ỔN ĐỊNH'}
        </text>
      </g>

      {/* Step 1: Pulsing Red Alarm Bell & Amber Siren Ring */}
      {activeStep === 1 && (
        <g transform={`translate(1410, 385)`} opacity={clamp01(p * 1.6)}>
          <circle
            cx="0"
            cy="0"
            r={110 + pulse * 38}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="6"
            opacity={1 - pulse * 0.65}
          />
          <circle
            cx="0"
            cy="0"
            r={82 + pulse * 22}
            fill="none"
            stroke="#EF4444"
            strokeWidth="5"
            opacity={0.9 - pulse * 0.5}
          />
          <g transform={`rotate(${bellSwing})`}>
            <path
              d="M -62 36 C -62 -28 -40 -68 0 -68 C 40 -68 62 -28 62 36 L 76 54 L -76 54 Z"
              fill="#EF4444"
              stroke={INK}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="-76" r="14" fill="#F59E0B" stroke={INK} strokeWidth="4" />
            <circle cx="0" cy="64" r="18" fill="#FBBF24" stroke={INK} strokeWidth="4" />
          </g>
          <rect x="-118" y="102" width="236" height="44" rx="22" fill="#FEF2F2" stroke="#EF4444" strokeWidth="3" />
          <text x="0" y="131" textAnchor="middle" fill="#B91C1C" fontSize="22" fontWeight="800">
            CẢNH BÁO TỤT NHIỆT
          </text>
        </g>
      )}

      {/* Step 2: Stop-Hand Icon + BOY pausing with IcedDrinkGlass lowered safely */}
      {isStop && (
        <g opacity={clamp01(p * 1.5)}>
          {/* Central Stop-Hand Octagon */}
          <g transform="translate(960, 410)">
            <polygon
              points="-46,-110 46,-110 110,-46 110,46 46,110 -46,110 -110,46 -110,-46"
              fill="#EF4444"
              stroke="#FFFFFF"
              strokeWidth="8"
            />
            <polygon
              points="-46,-110 46,-110 110,-46 110,46 46,110 -46,110 -110,46 -110,-46"
              fill="none"
              stroke={INK}
              strokeWidth="4"
            />
            {/* Clean White Stop Hand */}
            <path
              d="M -34 15 L -34 -42 C -34 -50 -22 -50 -22 -42 L -22 -8 L -18 -56 C -18 -64 -6 -64 -6 -56 L -6 -8 L -2 -60 C -2 -68 10 -68 10 -60 L 10 -8 L 14 -48 C 14 -56 26 -56 26 -48 L 26 24 C 26 48 8 62 -16 62 C -38 62 -52 46 -52 24 L -52 -4 C -52 -12 -40 -12 -40 -4 L -40 15 Z"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <text x="0" y="150" textAnchor="middle" fill="#B91C1C" fontSize="26" fontWeight="800">
              DỪNG LẠI!
            </text>
          </g>

          {/* Boy pausing safely with lowered drink */}
          <SharedStickman
            x={1430}
            y={560}
            scale={0.86}
            role="BOY"
            facing="LEFT"
            pose="IDLE"
            expression="SURPRISED"
            frame={frame}
          />
          <IcedDrinkGlass
            x={1295}
            y={605}
            scale={0.62}
            fillPct={0.72}
            showFrost={true}
            frame={frame}
          />
        </g>
      )}

      {/* Bottom CleanLabel (y <= 830) */}
      <CleanLabel
        x={960}
        y={788}
        text={
          activeStep === 0
            ? 'Bộ não cực nhạy với tụt nhiệt'
            : activeStep === 1
            ? 'Bật còi báo động khẩn cấp!'
            : 'Ép bạn dừng uống lạnh quá nhanh'
        }
        bg={isAlert && !isStop ? '#FEE2E2' : '#FFFFFF'}
        color={isAlert && !isStop ? '#B91C1C' : INK}
        border={isAlert && !isStop ? '#EF4444' : '#334155'}
        fontSize={34}
      />
    </svg>
  );
};

// ============================================================================
// 9. NUOCDA_TIMELINE_60SEC
// ============================================================================
export const NuocDaTimeline60SecVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  // Horizontal timeline bar: x = 240..1680, y = 480
  const cursorX =
    activeStep === 0
      ? lerp(240, 860, p)
      : activeStep === 1
      ? lerp(860, 1580, p)
      : 1620;

  const shieldBob = Math.sin(frame * 0.08) * 7;

  // Pain curve path from x=240 (y=425) -> peak x=860 (y=215) -> x=1560 (y=425)
  const curvePath =
    'M 240 425 C 340 425, 420 340, 560 275 C 690 218, 780 210, 860 210 C 980 210, 1140 295, 1320 375 C 1430 418, 1500 425, 1580 425 L 1680 425';

  // Blood vessel width normalizes during step 1
  const vesselRadius = activeStep === 0 ? 22 : activeStep === 1 ? lerp(22, 12, p) : 12;
  const palateColor = activeStep === 0 ? '#38BDF8' : activeStep === 1 ? '#FB923C' : '#FDBA74';

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd9_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#EFF6FF" />
        </linearGradient>
        <linearGradient id="nd9_curveFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#EF4444" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="nd9_curveStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="45%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <clipPath id="nd9_progressClip">
          <rect x="220" y="160" width={Math.max(0, cursorX - 220)} height="310" />
        </clipPath>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd9_bg)" />

      {/* Main White Card */}
      <rect
        x="140"
        y="95"
        width="1640"
        height="620"
        rx="32"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth="3.5"
      />

      {/* Card Title */}
      <text x="240" y="155" fill={INK} fontSize="30" fontWeight="800">
        DIỄN BIẾN CƠN BUỐT ÓC THEO THỜI GIAN
      </text>

      {/* Y-axis faint reference */}
      <line x1="240" y1="210" x2="1680" y2="210" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
      <line x1="240" y1="318" x2="1680" y2="318" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
      <text x="224" y="218" textAnchor="end" fill="#64748B" fontSize="18" fontWeight="700">
        Đỉnh
      </text>
      <text x="224" y="430" textAnchor="end" fill="#64748B" fontSize="18" fontWeight="700">
        0
      </text>

      {/* Faint ghost pain curve */}
      <path d={curvePath} fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />

      {/* Revealed Pain Wave Curve */}
      <g clipPath="url(#nd9_progressClip)">
        <path d={`${curvePath} L 1680 425 L 240 425 Z`} fill="url(#nd9_curveFill)" />
        <path
          d={curvePath}
          fill="none"
          stroke="url(#nd9_curveStroke)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* Step 1 Inset: Palate warming & blood vessel returning to normal */}
      {activeStep === 1 && (
        <g transform="translate(1265, 145)" opacity={clamp01(p * 1.4)}>
          <rect
            x="0"
            y="0"
            width="450"
            height="148"
            rx="20"
            fill="#FFF7ED"
            stroke="#FB923C"
            strokeWidth="3"
          />
          <text x="225" y="34" textAnchor="middle" fill="#9A3412" fontSize="20" fontWeight="800">
            Vòm miệng ấm lại → Mạch máu ổn định
          </text>
          {/* Vessel diagram */}
          <rect x="45" y="64" width="360" height="54" rx="27" fill={palateColor} opacity="0.25" />
          <line
            x1="75"
            y1="91"
            x2="375"
            y2="91"
            stroke="#EF4444"
            strokeWidth={vesselRadius * 2}
            strokeLinecap="round"
          />
          <line
            x1="75"
            y1="91"
            x2="375"
            y2="91"
            stroke="#FCA5A5"
            strokeWidth={Math.max(4, vesselRadius * 0.6)}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Step 2: Green Shield Icon gently bobbing (abstract explainer icon) */}
      {activeStep === 2 && (
        <g transform={`translate(960, ${285 + shieldBob})`} opacity={clamp01(p * 1.6)}>
          <circle cx="0" cy="0" r="105" fill="#DCFCE7" opacity="0.85" />
          <path
            d="M 0 -78 L 66 -48 L 66 8 C 66 52 36 80 0 94 C -36 80 -66 52 -66 8 L -66 -48 Z"
            fill="#10B981"
            stroke="#065F46"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M -26 4 L -6 24 L 30 -18"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Horizontal Timeline Bar (x = 240..1680, y = 480) */}
      <rect x="240" y="470" width="1440" height="20" rx="10" fill="#E2E8F0" />
      <rect
        x="240"
        y="470"
        width={Math.max(0, cursorX - 240)}
        height="20"
        rx="10"
        fill={activeStep >= 1 ? '#10B981' : '#EF4444'}
      />

      {/* Animated Progress Cursor */}
      <g transform={`translate(${cursorX}, 480)`}>
        <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke={INK} strokeWidth="5" />
        <circle cx="0" cy="0" r="10" fill={activeStep >= 1 ? '#10B981' : '#EF4444'} />
      </g>

      {/* 3 Crisp Milestones */}
      {[
        { x: 350, time: '0–10 giây', desc: 'Bắt đầu nhói', active: true, color: '#F59E0B' },
        { x: 860, time: '30 giây', desc: 'Đạt đỉnh', active: cursorX >= 820, color: '#EF4444' },
        { x: 1520, time: '1–2 phút', desc: 'Hết hẳn', active: cursorX >= 1480, color: '#10B981' },
      ].map((m, idx) => (
        <g key={idx} transform={`translate(${m.x}, 480)`}>
          <circle
            cx="0"
            cy="0"
            r="14"
            fill={m.active ? m.color : '#CBD5E1'}
            stroke="#FFFFFF"
            strokeWidth="4"
          />
          <rect
            x="-135"
            y="42"
            width="270"
            height="92"
            rx="18"
            fill={m.active ? '#F8FAFC' : '#FFFFFF'}
            stroke={m.active ? m.color : '#CBD5E1'}
            strokeWidth="3"
          />
          <text
            x="0"
            y="80"
            textAnchor="middle"
            fill={m.active ? m.color : '#64748B'}
            fontSize="26"
            fontWeight="800"
          >
            {m.time}
          </text>
          <text
            x="0"
            y="115"
            textAnchor="middle"
            fill={INK}
            fontSize="22"
            fontWeight="700"
          >
            {m.desc}
          </text>
        </g>
      ))}

      {/* Bottom CleanLabel */}
      <CleanLabel
        x={960}
        y={788}
        text={
          activeStep === 0
            ? 'Bùng nhanh trong 10–30 giây'
            : activeStep === 1
            ? 'Tự hết sau 1–2 phút'
            : 'Hoàn toàn lành tính — Không hại não'
        }
        bg={activeStep === 2 ? '#DCFCE7' : '#FFFFFF'}
        color={activeStep === 2 ? '#065F46' : INK}
        border={activeStep === 2 ? '#10B981' : '#334155'}
        fontSize={34}
      />
    </svg>
  );
};

// ============================================================================
// 10. NUOCDA_MIGRAINE_LINK
// ============================================================================
export const NuocDaMigraineLinkVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.16);

  // Build live animated ultrasound waveform points for Step 2
  const wavePoints: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const wx = 860 + i * 18;
    const phase = i * 0.45 - frame * 0.18;
    const wy = 395 - Math.sin(phase) * 42 - Math.sin(phase * 2.1) * 18;
    wavePoints.push(`${wx},${wy.toFixed(1)}`);
  }

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd10_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#EEF2FF" />
        </linearGradient>
        <linearGradient id="nd10_nerveGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd10_bg)" />

      {/* STEP 0: Two clean cards merging into central highlighted nerve pathway */}
      {activeStep === 0 && (
        <g>
          {/* Left Card: Migraine */}
          <g transform={`translate(${lerp(200, 260, p)}, 165)`}>
            <rect
              x="0"
              y="0"
              width="480"
              height="200"
              rx="28"
              fill="#FFFFFF"
              stroke="#6366F1"
              strokeWidth="4.5"
            />
            <circle cx="96" cy="100" r="52" fill="#EEF2FF" />
            {/* Lightning Bolt Icon */}
            <polygon
              points="102,64 74,104 96,104 88,138 122,94 98,94"
              fill="#6366F1"
              stroke={INK}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="175" y="92" fill="#4338CA" fontSize="34" fontWeight="800">
              Đau nửa đầu
            </text>
            <text x="175" y="132" fill="#475569" fontSize="22" fontWeight="600">
              (Migraine)
            </text>
          </g>

          {/* Right Card: Brain Freeze */}
          <g transform={`translate(${lerp(1240, 1180, p)}, 165)`}>
            <rect
              x="0"
              y="0"
              width="480"
              height="200"
              rx="28"
              fill="#FFFFFF"
              stroke="#0EA5E9"
              strokeWidth="4.5"
            />
            <circle cx="96" cy="100" r="52" fill="#E0F2FE" />
            {/* Snowflake Icon */}
            <g transform="translate(96, 100)" stroke="#0284C7" strokeWidth="5" strokeLinecap="round">
              <line x1="0" y1="-30" x2="0" y2="30" />
              <line x1="-26" y1="-15" x2="26" y2="15" />
              <line x1="-26" y1="15" x2="26" y2="-15" />
            </g>
            <text x="175" y="92" fill="#0369A1" fontSize="34" fontWeight="800">
              Buốt óc do lạnh
            </text>
            <text x="175" y="132" fill="#475569" fontSize="22" fontWeight="600">
              (Brain Freeze)
            </text>
          </g>

          {/* Merging Pathways */}
          <path
            d="M 500 365 C 500 470, 740 480, 960 515"
            fill="none"
            stroke="#6366F1"
            strokeWidth="9"
            strokeLinecap="round"
            opacity={0.6 + pulse * 0.4}
          />
          <path
            d="M 1420 365 C 1420 470, 1180 480, 960 515"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="9"
            strokeLinecap="round"
            opacity={0.6 + pulse * 0.4}
          />

          {/* Central Highlighted Nerve Pathway Hub */}
          <g transform="translate(960, 585)">
            <rect
              x="-340"
              y="-75"
              width="680"
              height="145"
              rx="32"
              fill="#FFFFFF"
              stroke="url(#nd10_nerveGlow)"
              strokeWidth="6"
            />
            <circle cx="-250" cy="-2" r="36" fill="#FCE7F3" />
            <path
              d="M -270 -2 Q -255 -22 -245 -2 T -226 -2"
              fill="none"
              stroke="#DB2777"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <text x="30" y="-12" textAnchor="middle" fill="#BE185D" fontSize="34" fontWeight="800">
              Chung tuyến dây sinh ba
            </text>
            <text x="30" y="32" textAnchor="middle" fill="#475569" fontSize="23" fontWeight="600">
              Cùng kích hoạt mạch máu & tín hiệu đau vùng trán
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: HeadCutawayDiagram showing shared vascular + nerve pathway */}
      {activeStep === 1 && (
        <g>
          <HeadCutawayDiagram
            x={960}
            y={435}
            scale={1.04}
            coldPalatePct={0.65}
            foreheadPainPct={0.72}
            showTrigeminal={true}
            showVesselDilate={0.7}
            frame={frame}
          />

          {/* Left Callout */}
          <g transform="translate(150, 260)" opacity={clamp01(p * 1.5)}>
            <rect x="0" y="0" width="380" height="115" rx="22" fill="#FFFFFF" stroke="#EF4444" strokeWidth="3.5" />
            <text x="190" y="48" textAnchor="middle" fill="#B91C1C" fontSize="26" fontWeight="800">
              Mạch máu giãn nở
            </text>
            <text x="190" y="84" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="600">
              Tăng lưu lượng đột ngột
            </text>
            <line x1="380" y1="58" x2="495" y2="120" stroke="#EF4444" strokeWidth="4" strokeDasharray="8 6" />
          </g>

          {/* Right Callout */}
          <g transform="translate(1390, 260)" opacity={clamp01(p * 1.5)}>
            <rect x="0" y="0" width="380" height="115" rx="22" fill="#FFFFFF" stroke="#6366F1" strokeWidth="3.5" />
            <text x="190" y="48" textAnchor="middle" fill="#4338CA" fontSize="26" fontWeight="800">
              Dây thần kinh sinh ba
            </text>
            <text x="190" y="84" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="600">
              Truyền tín hiệu chung lên não
            </text>
            <line x1="0" y1="58" x2="-115" y2="120" stroke="#6366F1" strokeWidth="4" strokeDasharray="8 6" />
          </g>
        </g>
      )}

      {/* STEP 2: Scientist/DOCTOR beside clean ultrasound waveform monitor in lab */}
      {activeStep === 2 && (
        <g>
          {/* Lab table surface */}
          <rect x="160" y="655" width="1600" height="28" rx="14" fill="#CBD5E1" />

          {/* Doctor Stickman */}
          <SharedStickman
            x={470}
            y={590}
            scale={0.96}
            role="DOCTOR"
            facing="RIGHT"
            pose="POINT_UP"
            expression="HAPPY"
            frame={frame}
          />

          {/* Ultrasound Waveform Monitor */}
          <g transform="translate(800, 145)">
            <rect
              x="0"
              y="0"
              width="860"
              height="475"
              rx="28"
              fill="#0F172A"
              stroke="#334155"
              strokeWidth="6"
            />
            {/* Monitor Top Bar */}
            <rect x="24" y="22" width="812" height="52" rx="14" fill="#1E293B" />
            <circle cx="56" cy="48" r="8" fill="#10B981" />
            <text x="82" y="56" fill="#E2E8F0" fontSize="22" fontWeight="700">
              SIÊU ÂM DOPPLER — LƯU LƯỢNG MÁU NÃO
            </text>
            <text x="808" y="56" textAnchor="end" fill="#38BDF8" fontSize="20" fontWeight="700">
              LIVE
            </text>

            {/* Monitor Grid */}
            <g stroke="#1E293B" strokeWidth="2">
              {[150, 250, 350].map((gy) => (
                <line key={gy} x1="36" y1={gy} x2="824" y2={gy} />
              ))}
              {[180, 340, 500, 660].map((gx) => (
                <line key={gx} x1={gx} y1="92" x2={gx} y2="390" />
              ))}
            </g>

            {/* Live Waveform */}
            <polyline
              points={wavePoints.map((pt) => {
                const [px, py] = pt.split(',').map(Number);
                return `${px - 800},${py - 145}`;
              }).join(' ')}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Lab Research Pill Badge inside monitor footer */}
            <rect x="36" y="395" width="788" height="56" rx="14" fill="#1E293B" />
            <text x="430" y="431" textAnchor="middle" fill="#6EE7B7" fontSize="23" fontWeight="700">
              Mô hình an toàn để nghiên cứu cơn đau nửa đầu
            </text>
          </g>
        </g>
      )}

      {/* Bottom CleanLabel */}
      <CleanLabel
        x={960}
        y={788}
        text={
          activeStep === 0
            ? 'Chung tuyến dây sinh ba'
            : activeStep === 1
            ? 'Mạch máu & dây sinh ba cùng kích hoạt'
            : 'Giúp nghiên cứu thuốc trị đau đầu'
        }
        bg="#FFFFFF"
        color={INK}
        border="#4F46E5"
        fontSize={34}
      />
    </svg>
  );
};

// ============================================================================
// 11. NUOCDA_BRAIN_VS_TOOTH
// ============================================================================
export const NuocDaBrainVsToothVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  const leftOpacity = activeStep === 2 ? 0.45 : 1;
  const rightOpacity = activeStep === 1 ? 0.45 : 1;
  const leftHighlight = activeStep === 1;
  const rightHighlight = activeStep === 2;
  const nervePulse = 0.65 + 0.35 * Math.sin(frame * 0.2);

  const leftRows = [
    'Vị trí: Vòm miệng → Trán',
    'Nguyên nhân: Co giãn mạch máu',
    'Mức độ: Vô hại, tự hết',
  ];

  const rightRows = [
    'Vị trí: Nhói tại chân răng',
    'Nguyên nhân: Mòn men, lộ ngà',
    'Xử lý: Nên khám nha khoa',
  ];

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd11_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd11_bg)" />

      {/* Center Vertical Divider at x = 960 */}
      <line
        x1="960"
        y1="115"
        x2="960"
        y2="715"
        stroke="#CBD5E1"
        strokeWidth="4"
        strokeDasharray="12 10"
      />

      {/* LEFT COLUMN (x = 480): Buốt óc (Brain Freeze) */}
      <g opacity={leftOpacity}>
        <rect
          x="105"
          y="105"
          width="750"
          height="610"
          rx="32"
          fill="#FFFFFF"
          stroke={leftHighlight ? '#0284C7' : '#BAE6FD'}
          strokeWidth={leftHighlight ? 6 : 3.5}
        />
        <rect x="105" y="105" width="750" height="86" rx="32" fill="#E0F2FE" />
        <rect x="105" y="155" width="750" height="36" fill="#E0F2FE" />
        <text x="480" y="160" textAnchor="middle" fill="#0369A1" fontSize="34" fontWeight="800">
          Buốt óc (Brain Freeze)
        </text>

        {/* Mini Head Icon with Forehead Starburst */}
        <g transform="translate(480, 298)">
          <circle cx="0" cy="0" r="82" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="3" />
          {/* Head silhouette */}
          <path
            d="M -28 56 L -28 32 C -46 22 -52 0 -46 -22 C -40 -48 -14 -60 14 -56 C 42 -52 54 -28 50 -2 L 60 12 L 48 18 L 46 38 C 44 48 32 54 18 54 L 18 62"
            fill="#FDE68A"
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Forehead Starburst */}
          <g transform="translate(26, -34)" opacity={nervePulse}>
            <polygon
              points="0,-24 6,-8 22,-10 10,2 18,18 2,10 -12,20 -8,4 -22,-4 -6,-8"
              fill="#EF4444"
              stroke="#FEF08A"
              strokeWidth="2.5"
            />
          </g>
        </g>

        {/* 3 Clean Non-Overlapping Rows */}
        {leftRows.map((row, idx) => (
          <g key={idx} transform={`translate(150, ${412 + idx * 94})`}>
            <rect
              x="0"
              y="0"
              width="660"
              height="74"
              rx="18"
              fill="#F8FAFC"
              stroke="#BAE6FD"
              strokeWidth="2.5"
            />
            <circle cx="38" cy="37" r="12" fill="#0EA5E9" />
            <text x="68" y="46" fill={INK} fontSize="27" fontWeight="700">
              {row}
            </text>
          </g>
        ))}
      </g>

      {/* RIGHT COLUMN (x = 1440): Ê buốt răng */}
      <g opacity={rightOpacity}>
        <rect
          x="1065"
          y="105"
          width="750"
          height="610"
          rx="32"
          fill="#FFFFFF"
          stroke={rightHighlight ? '#EA580C' : '#FED7AA'}
          strokeWidth={rightHighlight ? 6 : 3.5}
        />
        <rect x="1065" y="105" width="750" height="86" rx="32" fill="#FFEDD5" />
        <rect x="1065" y="155" width="750" height="36" fill="#FFEDD5" />
        <text x="1440" y="160" textAnchor="middle" fill="#C2410C" fontSize="34" fontWeight="800">
          Ê buốt răng
        </text>

        {/* Clean 2D Tooth Cross-Section (worn enamel & exposed dentin nerve) */}
        <g transform="translate(1440, 298)">
          <circle cx="0" cy="0" r="82" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="3" />
          {/* Outer Tooth Enamel */}
          <path
            d="M -38 -42 C -18 -56 18 -56 38 -42 C 52 -30 48 6 38 26 C 32 42 26 56 16 56 C 8 56 4 36 0 36 C -4 36 -8 56 -16 56 C -26 56 -32 42 -38 26 C -48 6 -52 -30 -38 -42 Z"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Inner Yellow Dentin Layer */}
          <path
            d="M -26 -28 C -12 -38 12 -38 26 -28 C 34 -18 32 6 24 22 C 20 32 16 40 12 40 C 6 40 4 24 0 24 C -4 24 -6 40 -12 40 C -16 40 -20 32 -24 22 C -32 6 -34 -18 -26 -28 Z"
            fill="#FEF08A"
            stroke="#CA8A04"
            strokeWidth="2.5"
          />
          {/* Worn Enamel Notch on right crown */}
          <path
            d="M 28 -32 L 46 -22 L 32 -8 Z"
            fill="#FED7AA"
            stroke="#EA580C"
            strokeWidth="2.5"
          />
          {/* Exposed Red Pulp Nerve */}
          <path
            d="M -10 -12 C -4 -20 4 -20 10 -12 C 14 -2 12 16 10 34 M -10 -12 C -14 -2 -12 16 -10 34"
            fill="none"
            stroke="#EF4444"
            strokeWidth="5"
            strokeLinecap="round"
            opacity={nervePulse}
          />
          {/* Sharp pain spark at exposed notch */}
          <polyline
            points="44,-28 58,-34 52,-18 66,-22"
            fill="none"
            stroke="#EF4444"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity={nervePulse}
          />
        </g>

        {/* 3 Clean Non-Overlapping Rows */}
        {rightRows.map((row, idx) => (
          <g key={idx} transform={`translate(1110, ${412 + idx * 94})`}>
            <rect
              x="0"
              y="0"
              width="660"
              height="74"
              rx="18"
              fill="#FFF7ED"
              stroke="#FDBA74"
              strokeWidth="2.5"
            />
            <circle cx="38" cy="37" r="12" fill="#F97316" />
            <text x="68" y="46" fill={INK} fontSize="27" fontWeight="700">
              {row}
            </text>
          </g>
        ))}
      </g>

      {/* Bottom CleanLabel */}
      <CleanLabel
        x={960}
        y={788}
        text={
          activeStep === 0
            ? 'Phân biệt Buốt óc & Ê buốt răng'
            : activeStep === 1
            ? 'Buốt óc: Co giãn mạch máu, tự hết'
            : 'Ê buốt răng: Mòn men, nên khám nha khoa'
        }
        bg="#FFFFFF"
        color={INK}
        border={leftHighlight ? '#0284C7' : rightHighlight ? '#EA580C' : '#334155'}
        fontSize={34}
      />
    </svg>
  );
};

// ============================================================================
// 12. NUOCDA_COLD_AIR_TRIGGER
// ============================================================================
export const NuocDaColdAirTriggerVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const windOffset = (frame * 6) % 240;
  const waveShift = Math.sin(frame * 0.12) * 14;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd12_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="nd12_pool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd12_bg)" />

      {/* STEP 0: Clean 3-icon banner (ice cream, iced tea, winter wind/cold water) */}
      {activeStep === 0 && (
        <g>
          {/* Card 1: Ice Cream */}
          <g transform="translate(180, 185)">
            <rect x="0" y="0" width="460" height="440" rx="30" fill="#FFFFFF" stroke="#7DD3FC" strokeWidth="4" />
            {/* Cute 2D Ice Cream Cone */}
            <g transform="translate(230, 200)">
              <polygon points="-42,18 42,18 0,132" fill="#F59E0B" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
              <line x1="-22" y1="54" x2="22" y2="54" stroke="#B45309" strokeWidth="3" />
              <line x1="-12" y1="86" x2="12" y2="86" stroke="#B45309" strokeWidth="3" />
              <circle cx="-26" cy="-6" r="36" fill="#F9A8D4" stroke={INK} strokeWidth="4" />
              <circle cx="26" cy="-6" r="36" fill="#FEF08A" stroke={INK} strokeWidth="4" />
              <circle cx="0" cy="-42" r="40" fill="#93C5FD" stroke={INK} strokeWidth="4" />
            </g>
            <text x="230" y="388" textAnchor="middle" fill={INK} fontSize="30" fontWeight="800">
              Kem lạnh
            </text>
          </g>

          {/* Card 2: Iced Drink */}
          <g transform="translate(730, 185)">
            <rect x="0" y="0" width="460" height="440" rx="30" fill="#FFFFFF" stroke="#7DD3FC" strokeWidth="4" />
            <IcedDrinkGlass x={230} y={235} scale={0.78} fillPct={0.82} showFrost={true} frame={frame} />
            <text x="230" y="388" textAnchor="middle" fill={INK} fontSize="30" fontWeight="800">
              Nước đá / Trà đá
            </text>
          </g>

          {/* Card 3: Winter Wind & Cold Water */}
          <g transform="translate(1280, 185)">
            <rect x="0" y="0" width="460" height="440" rx="30" fill="#FFFFFF" stroke="#0284C7" strokeWidth="5" />
            <g transform="translate(230, 195)">
              <circle cx="0" cy="0" r="105" fill="#E0F2FE" />
              {/* Wind swirls */}
              <path
                d="M -72 -24 L 24 -24 C 46 -24 46 -56 22 -56 C 6 -56 2 -42 10 -34"
                fill="none"
                stroke="#0284C7"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M -82 10 L 54 10 C 76 10 76 42 52 42 C 36 42 32 28 40 20"
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Water droplets */}
              <path d="M -32 40 C -32 40 -48 64 -32 76 C -16 64 -32 40 -32 40 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
              <path d="M 10 46 C 10 46 -4 66 10 78 C 24 66 10 46 10 46 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
            </g>
            <text x="230" y="388" textAnchor="middle" fill="#0369A1" fontSize="30" fontWeight="800">
              Gió mùa đông & Nước lạnh
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: Stickman in brisk winter wind with icy blue air streams entering open mouth */}
      {activeStep === 1 && (
        <g>
          {/* Winter horizon & snow ground */}
          <rect x="0" y="610" width="1920" height="470" fill="#E2E8F0" />
          <path d="M 0 610 Q 480 570 960 610 T 1920 605 L 1920 680 L 0 680 Z" fill="#FFFFFF" />

          {/* Brisk Icy Blue Air Streams sweeping left -> right into mouth */}
          <g opacity={clamp01(p * 1.5)}>
            {[250, 325, 400, 475].map((wy, idx) => (
              <path
                key={idx}
                d={`M ${120 + ((windOffset + idx * 55) % 220)} ${wy} Q 540 ${wy - 22} 965 ${395 + (idx - 1.5) * 14}`}
                fill="none"
                stroke={idx % 2 === 0 ? '#0284C7' : '#38BDF8'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="65 24"
              />
            ))}
          </g>

          {/* Cold Thermometer Badge on Left */}
          <g transform="translate(260, 290)">
            <rect x="-75" y="-110" width="150" height="220" rx="26" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
            <rect x="-12" y="-76" width="24" height="118" rx="12" fill="#E0F2FE" stroke="#0369A1" strokeWidth="3" />
            <rect x="-7" y="-22" width="14" height="62" rx="7" fill="#0284C7" />
            <circle cx="0" cy="48" r="22" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
            <text x="0" y="96" textAnchor="middle" fill="#0369A1" fontSize="26" fontWeight="800">
              8°C
            </text>
          </g>

          {/* Stickman facing into the icy wind */}
          <SharedStickman
            x={1160}
            y={590}
            scale={0.96}
            role="BOY"
            facing="LEFT"
            pose="IDLE"
            expression="SURPRISED"
            frame={frame}
          />

          {/* Icy puff near mouth */}
          <circle cx="1075" cy="410" r="24" fill="#BAE6FD" opacity="0.7" />
          <circle cx="1038" cy="404" r="16" fill="#7DD3FC" opacity="0.65" />
        </g>
      )}

      {/* STEP 2: Stickman beside chilly blue swimming pool with cold thermometer */}
      {activeStep === 2 && (
        <g>
          {/* Pool deck */}
          <rect x="0" y="545" width="1920" height="535" fill="#E2E8F0" />
          <rect x="140" y="535" width="1640" height="28" rx="10" fill="#CBD5E1" />

          {/* Chilly Blue Swimming Pool */}
          <rect x="520" y="520" width="1140" height="205" rx="24" fill="url(#nd12_pool)" stroke="#0369A1" strokeWidth="5" />
          {/* Animated Water Ripples */}
          <path
            d={`M 540 555 Q ${700 + waveShift} 532 ${860 + waveShift} 555 T ${1180 + waveShift} 555 T ${1500 + waveShift} 555`}
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d={`M 590 615 Q ${780 - waveShift} 595 ${970 - waveShift} 615 T ${1350 - waveShift} 615`}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Splash arcs */}
          <path
            d="M 860 520 Q 900 445 960 475 M 990 520 Q 1030 435 1090 470"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Stickman reacting to cold water */}
          <SharedStickman
            x={365}
            y={540}
            scale={0.92}
            role="BOY"
            facing="RIGHT"
            pose="HOLD_HEAD_PAIN"
            expression="SURPRISED"
            frame={frame}
          />

          {/* Cold Thermometer Card */}
          <g transform="translate(1480, 315)">
            <rect x="-110" y="-125" width="220" height="250" rx="28" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4.5" />
            <rect x="-14" y="-88" width="28" height="122" rx="14" fill="#E0F2FE" stroke="#0369A1" strokeWidth="3" />
            <rect x="-8" y="-26" width="16" height="60" rx="8" fill="#0284C7" />
            <circle cx="0" cy="44" r="24" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
            <text x="0" y="102" textAnchor="middle" fill="#0369A1" fontSize="28" fontWeight="800">
              Nước 12°C
            </text>
          </g>
        </g>
      )}

      {/* Bottom CleanLabel */}
      <CleanLabel
        x={960}
        y={788}
        text={
          activeStep === 0
            ? 'Không chỉ nước đá hay kem!'
            : activeStep === 1
            ? 'Hít gió lạnh mùa đông qua miệng'
            : 'Nhảy xuống nước quá lạnh đột ngột'
        }
        bg="#FFFFFF"
        color={INK}
        border="#0284C7"
        fontSize={34}
      />
    </svg>
  );
};

// ============================================================================
// 13. NUOCDA_TIP_TONGUE_PALATE
// ============================================================================
export const NuocDaTipTonguePalateVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const coldPct =
    activeStep === 0 ? 0.85 : activeStep === 1 ? lerp(0.85, 0.15, p) : 0.05;
  const painPct =
    activeStep === 0 ? 0.8 : activeStep === 1 ? lerp(0.8, 0.15, p) : 0;
  const tongueUp = activeStep >= 1;
  const waveLift = (frame * 2.2) % 36;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd13_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd13_bg)" />

      {/* Main HeadCutawayDiagram */}
      <HeadCutawayDiagram
        x={760}
        y={475}
        scale={0.98}
        coldPalatePct={coldPct}
        foreheadPainPct={painPct}
        showTrigeminal={activeStep < 2}
        showVesselDilate={activeStep === 0 ? 0.7 : activeStep === 1 ? lerp(0.7, 0.2, p) : 0}
        tongueUp={tongueUp}
        frame={frame}
      />

      {/* Step 1: Warm Coral 37°C Heat Waves rising directly from pressed tongue into palate */}
      {activeStep === 1 && (
        <g transform="translate(805, 515)">
          {[-26, 0, 26].map((hx, idx) => (
            <path
              key={idx}
              d={`M ${hx} ${18 - waveLift * 0.6} Q ${hx - 10} ${-4 - waveLift * 0.6} ${hx} ${-24 - waveLift * 0.6} T ${hx} ${-56 - waveLift * 0.6}`}
              fill="none"
              stroke="#F97316"
              strokeWidth="5.5"
              strokeLinecap="round"
              opacity={0.9 - waveLift / 48}
            />
          ))}
        </g>
      )}

      {/* Right-Side Context Card */}
      {activeStep === 0 && (
        <g transform="translate(1190, 245)">
          <rect x="0" y="0" width="540" height="320" rx="28" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4.5" />
          <circle cx="270" cy="108" r="56" fill="#FEF3C7" />
          {/* Upward arrow cue */}
          <path
            d="M 270 138 L 270 76 M 242 104 L 270 74 L 298 104"
            fill="none"
            stroke="#EA580C"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="270" y="216" textAnchor="middle" fill={INK} fontSize="30" fontWeight="800">
            Đẩy mặt lưỡi lên trên
          </text>
          <text x="270" y="262" textAnchor="middle" fill="#64748B" fontSize="24" fontWeight="600">
            Áp sát vào vòm miệng đang lạnh
          </text>
        </g>
      )}

      {activeStep === 1 && (
        <g transform="translate(1190, 245)">
          <rect x="0" y="0" width="540" height="320" rx="28" fill="#FFF7ED" stroke="#F97316" strokeWidth="4.5" />
          <rect x="145" y="46" width="250" height="86" rx="22" fill="#F97316" />
          <text x="270" y="104" textAnchor="middle" fill="#FFFFFF" fontSize="46" fontWeight="800">
            37°C
          </text>
          <text x="270" y="198" textAnchor="middle" fill="#9A3412" fontSize="30" fontWeight="800">
            Sưởi ấm trực tiếp
          </text>
          <text x="270" y="246" textAnchor="middle" fill="#475569" fontSize="23" fontWeight="600">
            Làm dịu mạch máu ngay tại chỗ
          </text>
        </g>
      )}

      {activeStep === 2 && (
        <g transform="translate(1445, 410)">
          {/* Timer 5–10 giây hitting green check */}
          <circle cx="0" cy="0" r="158" fill="#FFFFFF" stroke="#10B981" strokeWidth="10" />
          <circle cx="0" cy="0" r="134" fill="#DCFCE7" />
          <path
            d="M -42 -18 L -10 16 L 52 -48"
            fill="none"
            stroke="#059669"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="-112" y="42" width="224" height="54" rx="27" fill="#059669" />
          <text x="0" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontWeight="800">
            5–10 giây
          </text>
        </g>
      )}

      {/* Bottom CleanLabel */}
      <CleanLabel
        x={960}
        y={788}
        text={
          activeStep === 0
            ? 'Mẹo 1: Áp chặt lưỡi lên vòm miệng'
            : activeStep === 1
            ? 'Lưỡi 37°C truyền ấm trực tiếp'
            : 'Hết buốt ngay sau 5–10 giây!'
        }
        bg={activeStep === 2 ? '#DCFCE7' : '#FFFFFF'}
        color={activeStep === 2 ? '#065F46' : INK}
        border={activeStep === 2 ? '#10B981' : '#EA580C'}
        fontSize={34}
      />
    </svg>
  );
};

// ============================================================================
// 14. NUOCDA_TIP_WARM_WATER
// ============================================================================
export const NuocDaTipWarmWaterVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const steamLift = (frame * 1.8) % 50;
  const breathPulse = 0.5 + 0.5 * Math.sin(frame * 0.14);

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd14_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FFEDD5" />
        </linearGradient>
        <linearGradient id="nd14_warmLiquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd14_bg)" />

      {/* STEP 0: Warm water glass (~38°C, gentle steam wisps) */}
      {activeStep === 0 && (
        <g>
          {/* Left Warm Water Glass */}
          <g transform="translate(610, 460)">
            {/* Gentle rising steam wisps */}
            {[-42, 0, 42].map((sx, idx) => (
              <path
                key={idx}
                d={`M ${sx} ${-155 - ((steamLift + idx * 16) % 50)} Q ${sx - 14} ${-185 - ((steamLift + idx * 16) % 50)} ${sx} ${-215 - ((steamLift + idx * 16) % 50)}`}
                fill="none"
                stroke="#FB923C"
                strokeWidth="6"
                strokeLinecap="round"
                opacity={0.75}
              />
            ))}

            {/* Glass body */}
            <path
              d="M -105 -130 L 105 -130 L 82 150 L -82 150 Z"
              fill="#FFFFFF"
              fillOpacity="0.85"
              stroke={INK}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Warm water inside */}
            <path
              d="M -94 -45 L 94 -45 L 76 142 L -76 142 Z"
              fill="url(#nd14_warmLiquid)"
              opacity="0.85"
            />
            {/* 38°C Badge */}
            <rect x="70" y="-115" width="128" height="54" rx="27" fill="#EA580C" />
            <text x="134" y="-79" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="800">
              ~38°C
            </text>
          </g>

          {/* Right Explainer Card */}
          <g transform="translate(960, 245)">
            <rect x="0" y="0" width="660" height="330" rx="30" fill="#FFFFFF" stroke="#FB923C" strokeWidth="4" />
            <text x="330" y="96" textAnchor="middle" fill="#C2410C" fontSize="34" fontWeight="800">
              Nước ấm hoặc nước lọc
            </text>
            <text x="330" y="160" textAnchor="middle" fill={INK} fontSize="26" fontWeight="600">
              Nhấp từng ngụm nhỏ, giữ nhẹ 2–3 giây
            </text>
            <text x="330" y="210" textAnchor="middle" fill="#64748B" fontSize="24" fontWeight="600">
              Giúp cân bằng nhiệt độ vòm miệng nhanh chóng
            </text>
            <rect x="190" y="246" width="280" height="48" rx="24" fill="#FFEDD5" />
            <text x="330" y="278" textAnchor="middle" fill="#9A3412" fontSize="22" fontWeight="800">
              Không dùng nước quá nóng
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: Stickman cupping hands over nose & mouth exhaling warm golden-peach breath */}
      {activeStep === 1 && (
        <g>
          <SharedStickman
            x={720}
            y={590}
            scale={1.0}
            role="BOY"
            facing="RIGHT"
            pose="IDLE"
            expression="HAPPY"
            frame={frame}
          />

          {/* Cupped Hands Overlay & Warm Golden-Peach Breath */}
          <g transform="translate(768, 412)">
            {/* Warm glowing breath cloud */}
            <ellipse
              cx={34 + breathPulse * 14}
              cy="4"
              rx={46 + breathPulse * 14}
              ry={32 + breathPulse * 8}
              fill="#FDBA74"
              opacity={0.45 + breathPulse * 0.25}
            />
            {/* Cupped hands shape */}
            <path
              d="M -6 -22 C 26 -24 44 -4 38 22 C 32 42 8 44 -10 34 Z"
              fill="#FDE68A"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
          </g>

          {/* Right Info Card */}
          <g transform="translate(1060, 235)" opacity={clamp01(p * 1.4)}>
            <rect x="0" y="0" width="600" height="340" rx="30" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4" />
            <circle cx="300" cy="112" r="56" fill="#FEF3C7" />
            {/* Warm breath waves icon */}
            <path
              d="M 262 112 Q 282 90 300 112 T 338 112"
              fill="none"
              stroke="#EA580C"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 268 134 Q 286 116 300 134 T 332 134"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <text x="300" y="218" textAnchor="middle" fill={INK} fontSize="30" fontWeight="800">
              Hơi thở ấm ~37°C
            </text>
            <text x="300" y="268" textAnchor="middle" fill="#64748B" fontSize="24" fontWeight="600">
              Khum 2 tay giữ hơi ấm quanh mũi & miệng
            </text>
          </g>
        </g>
      )}

      {/* STEP 2: Clean Green Badge "Hết buốt tự nhiên — Không cần thuốc" */}
      {activeStep === 2 && (
        <g opacity={clamp01(p * 1.5)}>
          <rect
            x="330"
            y="215"
            width="1260"
            height="370"
            rx="40"
            fill="#DCFCE7"
            stroke="#10B981"
            strokeWidth="6"
          />
          <circle cx="960" cy="330" r="68" fill="#10B981" />
          <path
            d="M 928 332 L 952 356 L 998 306"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="960" y="468" textAnchor="middle" fill="#065F46" fontSize="46" fontWeight="800">
            Hết buốt tự nhiên — Không cần thuốc
          </text>
          <text x="960" y="528" textAnchor="middle" fill="#047857" fontSize="28" fontWeight="600">
            Chỉ cần làm ấm nhẹ vòm miệng là cơn buốt dịu ngay
          </text>
        </g>
      )}

      {/* Bottom CleanLabel */}
      <CleanLabel
        x={960}
        y={788}
        text={
          activeStep === 0
            ? 'Mẹo 2: Nhấp ngụm nước ấm / nước lọc'
            : activeStep === 1
            ? 'Mẹo 3: Khum tay thở hơi ấm'
            : 'Hết buốt tự nhiên — Không cần thuốc'
        }
        bg={activeStep === 2 ? '#DCFCE7' : '#FFFFFF'}
        color={activeStep === 2 ? '#065F46' : INK}
        border={activeStep === 2 ? '#10B981' : '#EA580C'}
        fontSize={34}
      />
    </svg>
  );
};

// ============================================================================
// 15. NUOCDA_TIP_SIP_SLOWLY
// ============================================================================
export const NuocDaTipSipSlowlyVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const softGlow = 0.5 + 0.5 * Math.sin(frame * 0.12);

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd15_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#ECFDF5" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd15_bg)" />

      {/* STEP 0: BOY (EAT_SLOW, HAPPY) sipping small steady sip from IcedDrinkGlass */}
      {activeStep === 0 && (
        <g>
          <SharedStickman
            x={640}
            y={595}
            scale={0.98}
            role="BOY"
            facing="RIGHT"
            pose="EAT_SLOW"
            expression="HAPPY"
            frame={frame}
          />
          <IcedDrinkGlass
            x={825}
            y={515}
            scale={0.7}
            fillPct={0.78}
            showFrost={true}
            frame={frame}
          />

          {/* Pace Gauge Card */}
          <g transform="translate(1080, 230)">
            <rect x="0" y="0" width="580" height="330" rx="30" fill="#FFFFFF" stroke="#10B981" strokeWidth="4.5" />
            <text x="290" y="74" textAnchor="middle" fill="#065F46" fontSize="30" fontWeight="800">
              NHỊP UỐNG AN TOÀN
            </text>
            {/* 3 Small Sip Droplets */}
            {[150, 290, 430].map((dx, idx) => (
              <g key={idx} transform={`translate(${dx}, 170)`}>
                <circle cx="0" cy="0" r="42" fill="#DCFCE7" />
                <path
                  d="M 0 -22 C 0 -22 -18 4 0 22 C 18 4 0 -22 0 -22 Z"
                  fill="#0EA5E9"
                  stroke="#0369A1"
                  strokeWidth="3"
                />
              </g>
            ))}
            <text x="290" y="275" textAnchor="middle" fill={INK} fontSize="26" fontWeight="700">
              Ngụm nhỏ — Cách nhau vài giây
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: Cute 2D ice-cream cone resting briefly + avoiding pressing ice flat on palate */}
      {activeStep === 1 && (
        <g>
          {/* Left Card: Softening Ice Cream */}
          <g transform="translate(220, 175)">
            <rect x="0" y="0" width="660" height="460" rx="32" fill="#FFFFFF" stroke="#10B981" strokeWidth="4.5" />
            {/* Cute 2D Ice Cream Cone */}
            <g transform="translate(330, 225)">
              <circle cx="0" cy="-25" r={104 + softGlow * 8} fill="#FEF3C7" opacity="0.6" />
              <polygon points="-46,18 46,18 0,145" fill="#F59E0B" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
              <line x1="-26" y1="58" x2="26" y2="58" stroke="#B45309" strokeWidth="3" />
              <line x1="-14" y1="92" x2="14" y2="92" stroke="#B45309" strokeWidth="3" />
              <circle cx="-30" cy="-10" r="40" fill="#F9A8D4" stroke={INK} strokeWidth="4.5" />
              <circle cx="30" cy="-10" r="40" fill="#FEF08A" stroke={INK} strokeWidth="4.5" />
              <circle cx="0" cy="-50" r="44" fill="#FDE68A" stroke={INK} strokeWidth="4.5" />
              {/* Cute gentle smile on top scoop */}
              <circle cx="-12" cy="-54" r="4" fill={INK} />
              <circle cx="12" cy="-54" r="4" fill={INK} />
              <path d="M -10 -40 Q 0 -30 10 -40" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
            </g>
            <text x="330" y="422" textAnchor="middle" fill="#065F46" fontSize="28" fontWeight="800">
              Để kem mềm nhẹ vài giây
            </text>
          </g>

          {/* Right Card: Avoid pressing ice flat on upper palate */}
          <g transform="translate(1040, 175)" opacity={clamp01(p * 1.4)}>
            <rect x="0" y="0" width="660" height="460" rx="32" fill="#FFFFFF" stroke="#EF4444" strokeWidth="4.5" />
            {/* Palate arch + ice cube with red NO symbol */}
            <g transform="translate(330, 210)">
              {/* Upper palate arch */}
              <path d="M -110 20 Q 0 -75 110 20" fill="none" stroke="#FB7185" strokeWidth="18" strokeLinecap="round" />
              {/* Ice cube */}
              <rect x="-34" y="-16" width="68" height="68" rx="14" fill="#BAE6FD" stroke="#0284C7" strokeWidth="4" />
              {/* Red prohibition circle */}
              <circle cx="0" cy="12" r="88" fill="none" stroke="#EF4444" strokeWidth="12" />
              <line x1="-62" y1="-50" x2="62" y2="74" stroke="#EF4444" strokeWidth="12" strokeLinecap="round" />
            </g>
            <text x="330" y="382" textAnchor="middle" fill="#B91C1C" fontSize="28" fontWeight="800">
              Tránh áp kem / đá lạnh
            </text>
            <text x="330" y="422" textAnchor="middle" fill="#475569" fontSize="25" fontWeight="700">
              trực tiếp lên vòm miệng trên
            </text>
          </g>
        </g>
      )}

      {/* STEP 2: Green comfort thermometer + smiling BOY */}
      {activeStep === 2 && (
        <g>
          {/* Green Comfort Thermometer Card */}
          <g transform="translate(560, 395)">
            <rect x="-240" y="-215" width="480" height="430" rx="34" fill="#FFFFFF" stroke="#10B981" strokeWidth="5" />
            {/* Thermometer body */}
            <rect x="-22" y="-145" width="44" height="190" rx="22" fill="#DCFCE7" stroke="#059669" strokeWidth="4" />
            <rect x="-12" y="-75" width="24" height="125" rx="12" fill="#10B981" />
            <circle cx="0" cy="64" r="38" fill="#10B981" stroke="#059669" strokeWidth="4" />
            <text x="0" y="148" textAnchor="middle" fill="#065F46" fontSize="34" fontWeight="800">
              36.5°C — Dễ chịu
            </text>
            <text x="0" y="186" textAnchor="middle" fill="#047857" fontSize="22" fontWeight="600">
              Không sốc nhiệt vòm miệng
            </text>
          </g>

          {/* Happy Boy with Iced Drink */}
          <SharedStickman
            x={1220}
            y={590}
            scale={0.94}
            role="BOY"
            facing="LEFT"
            pose="HAPPY_WAVE"
            expression="HAPPY"
            frame={frame}
          />
          <IcedDrinkGlass
            x={1420}
            y={545}
            scale={0.68}
            fillPct={0.75}
            showFrost={true}
            frame={frame}
          />
        </g>
      )}

      {/* Bottom CleanLabel */}
      <CleanLabel
        x={960}
        y={788}
        text={
          activeStep === 0
            ? 'Uống từng ngụm nhỏ, từ tốn'
            : activeStep === 1
            ? 'Chờ kem mềm nhẹ vài giây'
            : 'Thưởng thức mát lạnh, không lo buốt đầu'
        }
        bg={activeStep === 2 ? '#DCFCE7' : '#FFFFFF'}
        color={activeStep === 2 ? '#065F46' : INK}
        border="#10B981"
        fontSize={34}
      />
    </svg>
  );
};

// ============================================================================
// 16. NUOCDA_HAPPY_SUMMER_ENJOY
// ============================================================================
export const NuocDaHappySummerEnjoyVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const stabilityBarPct = activeStep >= 1 ? lerp(0.4, 1, activeStep === 1 ? p : 1) : 0;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <radialGradient id="nd16_goldenLight" cx="85%" cy="15%" r="85%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#FDE047" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Breezy Countryside Afternoon Porch Backdrop */}
      <SummerPorchBackdrop frame={frame} heatIntensity={0} timeOfDay="AFTERNOON" />

      {/* Small Wooden Porch Table between Boy and Grandpa */}
      <g transform="translate(960, 625)">
        <rect x="-135" y="0" width="270" height="22" rx="8" fill="#B45309" stroke={INK} strokeWidth="3.5" />
        <rect x="-105" y="22" width="18" height="108" rx="4" fill="#92400E" stroke={INK} strokeWidth="3" />
        <rect x="87" y="22" width="18" height="108" rx="4" fill="#92400E" stroke={INK} strokeWidth="3" />
      </g>

      {/* IcedDrinkGlass & Ice Cream Cone on Porch Table */}
      <IcedDrinkGlass
        x={900}
        y={565}
        scale={0.58}
        fillPct={0.8}
        showFrost={true}
        frame={frame}
      />
      <g transform="translate(1025, 575) scale(0.72)">
        <polygon points="-24,10 24,10 0,72" fill="#F59E0B" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="-14" cy="-4" r="22" fill="#F9A8D4" stroke={INK} strokeWidth="3.5" />
        <circle cx="14" cy="-4" r="22" fill="#FEF08A" stroke={INK} strokeWidth="3.5" />
        <circle cx="0" cy="-24" r="24" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" />
      </g>

      {/* BOY & GRANDPA happily enjoying summer on the porch */}
      <SharedStickman
        x={640}
        y={625}
        scale={0.92}
        role="BOY"
        facing="RIGHT"
        pose={activeStep === 2 ? 'HAPPY_WAVE' : 'EAT_SLOW'}
        expression="HAPPY"
        frame={frame}
      />
      <SharedStickman
        x={1275}
        y={625}
        scale={0.96}
        role="GRANDPA"
        facing="LEFT"
        pose="SIT"
        expression={activeStep === 2 ? 'PROUD' : 'HAPPY'}
        frame={frame}
      />

      {/* Step 0 Speech Bubble */}
      {activeStep === 0 && (
        <ShortSpeechBubble
          x={520}
          y={340}
          text="Mát rượi luôn ông ạ!"
          tailDir="RIGHT"
        />
      )}

      {/* Step 1+: Clean Green Temperature Stability Bar in Upper Right */}
      {activeStep >= 1 && (
        <g transform="translate(1240, 115)" opacity={activeStep === 1 ? clamp01(p * 1.5) : 0.95}>
          <rect
            x="0"
            y="0"
            width="540"
            height="136"
            rx="24"
            fill="#FFFFFF"
            fillOpacity="0.95"
            stroke="#10B981"
            strokeWidth="4"
          />
          <text x="270" y="46" textAnchor="middle" fill="#065F46" fontSize="26" fontWeight="800">
            Nhiệt độ vòm miệng ổn định
          </text>
          <rect x="36" y="72" width="380" height="28" rx="14" fill="#DCFCE7" />
          <rect
            x="36"
            y="72"
            width={380 * stabilityBarPct}
            height="28"
            rx="14"
            fill="#10B981"
          />
          <text x="436" y="95" fill="#059669" fontSize="26" fontWeight="800">
            37°C
          </text>
        </g>
      )}

      {/* Step 2: Warm Golden Afternoon Light Overlay */}
      {activeStep === 2 && (
        <rect
          width="1920"
          height="1080"
          fill="url(#nd16_goldenLight)"
          opacity={clamp01(p * 1.3)}
          pointerEvents="none"
        />
      )}

      {/* Bottom CleanLabel for Step 2 */}
      {activeStep === 2 && (
        <CleanLabel
          x={960}
          y={788}
          text="Hiểu cơ thể, tận hưởng mùa hè trọn vẹn"
          bg="#FFFBEB"
          color="#92400E"
          border="#F59E0B"
          fontSize={34}
        />
      )}
    </svg>
  );
};

// ============================================================================
// 17. NUOCDA_SUMMARY_3_RULES
// ============================================================================
export const NuocDaSummary3RulesVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const c1 = activeStep >= 1 ? 1 : clamp01(p * 3);
  const c2 = activeStep >= 1 ? 1 : clamp01((p - 0.3) * 3);
  const c3 = activeStep >= 1 ? 1 : clamp01((p - 0.6) * 3);

  const cards = [
    {
      cx: 360,
      appear: c1,
      title: '1. Lạnh vòm miệng',
      sub: 'Mạch máu co giãn mạnh',
      accent: '#0284C7',
      bg: '#E0F2FE',
      bob: Math.sin(frame * 0.07) * 5,
      kind: 'COLD' as const,
    },
    {
      cx: 960,
      appear: c2,
      title: '2. Đau quy chiếu',
      sub: 'Dây sinh ba báo lên trán',
      accent: '#6366F1',
      bg: '#EEF2FF',
      bob: Math.sin(frame * 0.07 + 2.1) * 5,
      kind: 'NERVE' as const,
    },
    {
      cx: 1560,
      appear: c3,
      title: '3. Cắt cơn 5 giây',
      sub: 'Áp lưỡi ấm & uống chậm',
      accent: '#10B981',
      bg: '#DCFCE7',
      bob: Math.sin(frame * 0.07 + 4.2) * 5,
      kind: 'WARM' as const,
    },
  ];

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd17_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#F0FDF4" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd17_bg)" />

      {/* Header */}
      <text x="960" y="135" textAnchor="middle" fill={INK} fontSize="42" fontWeight="800">
        TÓM TẮT 3 ĐIỀU CẦN NHỚ
      </text>

      {/* 3-Card Infographic Layout at y = 190..540 */}
      {cards.map((card, idx) => (
        <g
          key={idx}
          transform={`translate(${card.cx}, ${365 + lerp(28, 0, card.appear)})`}
          opacity={card.appear}
        >
          <rect
            x="-255"
            y="-175"
            width="510"
            height="350"
            rx="32"
            fill="#FFFFFF"
            stroke={card.accent}
            strokeWidth="4.5"
          />

          {/* Subtle floating bob ONLY on the 3 abstract icon badges */}
          <g transform={`translate(0, ${-68 + card.bob})`}>
            <circle cx="0" cy="0" r="64" fill={card.bg} stroke={card.accent} strokeWidth="3.5" />
            {card.kind === 'COLD' && (
              <g stroke="#0284C7" strokeWidth="6" strokeLinecap="round">
                <line x1="0" y1="-34" x2="0" y2="34" />
                <line x1="-29" y1="-17" x2="29" y2="17" />
                <line x1="-29" y1="17" x2="29" y2="-17" />
              </g>
            )}
            {card.kind === 'NERVE' && (
              <polygon
                points="6,-34 -22,4 2,4 -8,36 26,-6 2,-6"
                fill="#6366F1"
                stroke={INK}
                strokeWidth="3"
                strokeLinejoin="round"
              />
            )}
            {card.kind === 'WARM' && (
              <g>
                <path
                  d="M -22 14 Q -10 -14 0 14 T 22 14"
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <text x="0" y="-12" textAnchor="middle" fill="#059669" fontSize="26" fontWeight="800">
                  5s
                </text>
              </g>
            )}
          </g>

          {/* Green Checkmark Badge at top-right of card */}
          <g transform="translate(198, -122)">
            <circle cx="0" cy="0" r="24" fill="#10B981" />
            <path
              d="M -10 1 L -3 8 L 11 -8"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Card Text */}
          <text x="0" y="56" textAnchor="middle" fill={INK} fontSize="34" fontWeight="800">
            {card.title}
          </text>
          <text x="0" y="106" textAnchor="middle" fill="#475569" fontSize="26" fontWeight="600">
            {card.sub}
          </text>
        </g>
      ))}

      {/* Step 0: Subtle footer label */}
      {activeStep === 0 && (
        <CleanLabel
          x={960}
          y={788}
          text="Hiểu đúng cơ chế — Không còn sợ buốt óc!"
          bg="#FFFFFF"
          color={INK}
          border="#10B981"
          fontSize={34}
        />
      )}

      {/* Step 1: BOY waving warmly with speech bubble */}
      {activeStep >= 1 && (
        <g opacity={clamp01(p * 1.6)}>
          <SharedStickman
            x={760}
            y={760}
            scale={0.82}
            role="BOY"
            facing="RIGHT"
            pose="HAPPY_WAVE"
            expression="HAPPY"
            frame={frame}
          />
          <ShortSpeechBubble
            x={1060}
            y={695}
            text="Thử ngay mẹo áp lưỡi nhé!"
            tailDir="LEFT"
          />
        </g>
      )}
    </svg>
  );
};
