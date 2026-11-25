import React from 'react';
import type { EpisodeVisualProps } from './index';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  CleanLabel,
  ShortSpeechBubble,
  WoodenSideTable,
  SharedStickman,
  IcedDrinkGlass,
  HeadCutawayDiagram,
  SummerPorchBackdrop,
} from './nuocDaSharedAssets';

// ============================================================================
// 8. NUOCDA_THERMOSTAT_ALARM
//    - Deleted fake macOS browser window frame, dark title bar & traffic-light dots
//    - High-contrast "CẢM BIẾN LẠNH" badge in Step 1
//    - Step 2: BOY grounded on floor holding lowered iced glass directly in hand (0 floating!)
//    - Single top title only (NO duplicate bottom pill)
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

  const dialX = activeStep === 0 ? 960 : activeStep === 1 ? 660 : lerp(660, 415, p);
  const dialY = 455;
  const dialScale = isStop ? 0.88 : 1;
  const coldWaveRise = activeStep === 1 ? lerp(110, 0, p) : 0;

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
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.16" />
        </linearGradient>
        <radialGradient id="nd8_sirenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Clean Light Backdrop — NO fake macOS console window or tech grid */}
      <rect width="1920" height="1080" fill="url(#nd8_bg)" />

      {/* Grounded Floor in Step 2 so BOY stands solidly */}
      {isStop && (
        <g>
          <rect x="0" y="790" width="1920" height="290" fill="#CBD5E1" opacity="0.55" />
          <line x1="0" y1="790" x2="1920" y2="790" stroke="#94A3B8" strokeWidth="4" />
        </g>
      )}

      {/* Single Top Title (y = 92) */}
      <CleanLabel
        x={960}
        y={92}
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

      {/* Step 1: Cold Blue Wave rising beneath thermostat + high-contrast CẢM BIẾN LẠNH badge */}
      {activeStep === 1 && (
        <g>
          <path
            d={`M ${dialX - 240} ${745 + coldWaveRise} Q ${dialX - 120} ${660 + coldWaveRise} ${dialX} ${692 + coldWaveRise} T ${dialX + 240} ${686 + coldWaveRise} L ${dialX + 240} 790 L ${dialX - 240} 790 Z`}
            fill="url(#nd8_coldWave)"
            opacity={clamp01(p * 1.4)}
          />
          <rect
            x={dialX - 108}
            y="704"
            width="216"
            height="48"
            rx="24"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="4"
          />
          <text
            x={dialX}
            y="736"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="22"
            fontWeight="800"
          >
            CẢM BIẾN LẠNH
          </text>
        </g>
      )}

      {/* Main Clean 2D Brain Thermostat Dial */}
      <g transform={`translate(${dialX}, ${dialY}) scale(${dialScale})`}>
        {activeStep === 1 && (
          <circle cx="0" cy="0" r={235 + pulse * 30} fill="url(#nd8_sirenGlow)" />
        )}

        <circle cx="0" cy="0" r="208" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="7" />
        <circle
          cx="0"
          cy="0"
          r="184"
          fill={ringBg}
          stroke={statusColor}
          strokeWidth="14"
          strokeDasharray={isAlert ? '24 12' : 'none'}
        />

        {/* Clean 2D Brain Icon */}
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

        <rect x="-85" y="114" width="170" height="36" rx="18" fill={statusColor} />
        <text x="0" y="139" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="800">
          {isAlert ? 'BÁO ĐỘNG!' : 'ỔN ĐỊNH'}
        </text>
      </g>

      {/* Step 1: Pulsing Red Alarm Bell & Amber Siren Rings */}
      {activeStep === 1 && (
        <g transform="translate(1320, 445)" opacity={clamp01(p * 1.6)}>
          <circle
            cx="0"
            cy="0"
            r={116 + pulse * 40}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="6"
            opacity={1 - pulse * 0.65}
          />
          <circle
            cx="0"
            cy="0"
            r={86 + pulse * 24}
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
          <rect
            x="-130"
            y="104"
            width="260"
            height="46"
            rx="23"
            fill="#FEF2F2"
            stroke="#EF4444"
            strokeWidth="3.5"
          />
          <text x="0" y="134" textAnchor="middle" fill="#B91C1C" fontSize="23" fontWeight="800">
            CẢNH BÁO TỤT NHIỆT
          </text>
        </g>
      )}

      {/* Step 2: Stop-Hand Icon + BOY grounded on floor pausing with iced glass held directly in hand */}
      {isStop && (
        <g opacity={clamp01(p * 1.5)}>
          {/* Central Stop-Hand Octagon */}
          <g transform="translate(935, 450)">
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
            <path
              d="M -34 15 L -34 -42 C -34 -50 -22 -50 -22 -42 L -22 -8 L -18 -56 C -18 -64 -6 -64 -6 -56 L -6 -8 L -2 -60 C -2 -68 10 -68 10 -60 L 10 -8 L 14 -48 C 14 -56 26 -56 26 -48 L 26 24 C 26 48 8 62 -16 62 C -38 62 -52 46 -52 24 L -52 -4 C -52 -12 -40 -12 -40 -4 L -40 15 Z"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <text x="0" y="152" textAnchor="middle" fill="#B91C1C" fontSize="28" fontWeight="800">
              DỪNG LẠI!
            </text>
          </g>

          {/* Small wooden table beside Boy ready to set glass down */}
          <WoodenSideTable x={1320} topY={680} floorY={790} width={146} />
          <ellipse cx={1320} cy={680} rx={32} ry={5} fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />

          {/* BOY grounded on y=790 directly holding his iced glass paused */}
          <SharedStickman
            x={1520}
            y={674}
            scale={1.02}
            role="BOY"
            facing="LEFT"
            pose="HOLD_DRINK_PAUSE"
            expression="SURPRISED"
            drinkFillPct={0.72}
            frame={frame}
            uid="nd8_s2_boy"
          />
          <ShortSpeechBubble x={1520} y={448} text="Khoan đã!" tailDir="CENTER" />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 9. NUOCDA_TIMELINE_60SEC
//    - Single crisp top title (NO duplicate bottom pill), strictly y <= 820
// ============================================================================
export const NuocDaTimeline60SecVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const cursorX =
    activeStep === 0
      ? lerp(240, 860, p)
      : activeStep === 1
        ? lerp(860, 1580, p)
        : 1620;

  const shieldBob = Math.sin(frame * 0.08) * 7;

  const curvePath =
    'M 240 480 C 340 480, 420 395, 560 330 C 690 273, 780 265, 860 265 C 980 265, 1140 350, 1320 430 C 1430 473, 1500 480, 1580 480 L 1680 480';

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
          <rect x="220" y="215" width={Math.max(0, cursorX - 220)} height="310" />
        </clipPath>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd9_bg)" />

      {/* Single Top Title */}
      <CleanLabel
        x={960}
        y={92}
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

      {/* Main White Timeline Card (y = 158..780 <= 830) */}
      <rect
        x="140"
        y="158"
        width="1640"
        height="618"
        rx="32"
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth="3.5"
      />

      <text x="240" y="216" fill={INK} fontSize="28" fontWeight="800">
        DIỄN BIẾN CƠN BUỐT ÓC THEO THỜI GIAN
      </text>

      <line x1="240" y1="265" x2="1680" y2="265" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
      <line x1="240" y1="373" x2="1680" y2="373" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
      <text x="224" y="273" textAnchor="end" fill="#64748B" fontSize="18" fontWeight="700">
        Đỉnh
      </text>
      <text x="224" y="485" textAnchor="end" fill="#64748B" fontSize="18" fontWeight="700">
        0
      </text>

      <path d={curvePath} fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />

      <g clipPath="url(#nd9_progressClip)">
        <path d={`${curvePath} L 1680 480 L 240 480 Z`} fill="url(#nd9_curveFill)" />
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
        <g transform="translate(1265, 200)" opacity={clamp01(p * 1.4)}>
          <rect x="0" y="0" width="450" height="148" rx="20" fill="#FFF7ED" stroke="#FB923C" strokeWidth="3" />
          <text x="225" y="34" textAnchor="middle" fill="#9A3412" fontSize="20" fontWeight="800">
            Vòm miệng ấm lại → Mạch máu ổn định
          </text>
          <rect x="45" y="64" width="360" height="54" rx="27" fill={palateColor} opacity="0.25" />
          <line x1="75" y1="91" x2="375" y2="91" stroke="#EF4444" strokeWidth={vesselRadius * 2} strokeLinecap="round" />
          <line x1="75" y1="91" x2="375" y2="91" stroke="#FCA5A5" strokeWidth={Math.max(4, vesselRadius * 0.6)} strokeLinecap="round" />
        </g>
      )}

      {/* Step 2: Green Shield Icon */}
      {activeStep === 2 && (
        <g transform={`translate(960, ${340 + shieldBob})`} opacity={clamp01(p * 1.6)}>
          <circle cx="0" cy="0" r="102" fill="#DCFCE7" opacity="0.85" />
          <path
            d="M 0 -76 L 64 -46 L 64 8 C 64 50 35 78 0 92 C -35 78 -64 50 -64 8 L -64 -46 Z"
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

      {/* Horizontal Timeline Bar */}
      <rect x="240" y="525" width="1440" height="20" rx="10" fill="#E2E8F0" />
      <rect
        x="240"
        y="525"
        width={Math.max(0, cursorX - 240)}
        height="20"
        rx="10"
        fill={activeStep >= 1 ? '#10B981' : '#EF4444'}
      />

      <g transform={`translate(${cursorX}, 535)`}>
        <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke={INK} strokeWidth="5" />
        <circle cx="0" cy="0" r="10" fill={activeStep >= 1 ? '#10B981' : '#EF4444'} />
      </g>

      {[
        { x: 350, time: '0–10 giây', desc: 'Bắt đầu nhói', active: true, color: '#F59E0B' },
        { x: 860, time: '30 giây', desc: 'Đạt đỉnh', active: cursorX >= 820, color: '#EF4444' },
        { x: 1520, time: '1–2 phút', desc: 'Hết hẳn', active: cursorX >= 1480, color: '#10B981' },
      ].map((m, idx) => (
        <g key={idx} transform={`translate(${m.x}, 535)`}>
          <circle cx="0" cy="0" r="14" fill={m.active ? m.color : '#CBD5E1'} stroke="#FFFFFF" strokeWidth="4" />
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
          <text x="0" y="80" textAnchor="middle" fill={m.active ? m.color : '#64748B'} fontSize="26" fontWeight="800">
            {m.time}
          </text>
          <text x="0" y="115" textAnchor="middle" fill={INK} fontSize="22" fontWeight="700">
            {m.desc}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ============================================================================
// 10. NUOCDA_MIGRAINE_LINK
//     - Step 0: DELETED redundant bottom pill "Chung tuyến dây sinh ba"
//     - Step 1 & 2: Single top title only; DOCTOR grounded firmly on lab floor
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

  const wavePoints: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const wx = 860 + i * 18;
    const phase = i * 0.45 - frame * 0.18;
    const wy = 425 - Math.sin(phase) * 42 - Math.sin(phase * 2.1) * 18;
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

      {/* Single Top Header for Step 1 & Step 2 (Step 0 hub card itself is the clean visual title!) */}
      {activeStep === 1 && (
        <CleanLabel
          x={960}
          y={92}
          text="Mạch máu & dây sinh ba cùng kích hoạt"
          bg="#FFFFFF"
          color={INK}
          border="#4F46E5"
          fontSize={34}
        />
      )}
      {activeStep === 2 && (
        <CleanLabel
          x={960}
          y={92}
          text="Giúp nghiên cứu thuốc trị đau đầu"
          bg="#FFFFFF"
          color={INK}
          border="#4F46E5"
          fontSize={34}
        />
      )}

      {/* STEP 0: Two clean cards merging into central hub (ZERO duplicate bottom pill!) */}
      {activeStep === 0 && (
        <g transform="translate(0, 36)">
          <g transform={`translate(${lerp(200, 260, p)}, 160)`}>
            <rect x="0" y="0" width="480" height="200" rx="28" fill="#FFFFFF" stroke="#6366F1" strokeWidth="4.5" />
            <circle cx="96" cy="100" r="52" fill="#EEF2FF" />
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

          <g transform={`translate(${lerp(1240, 1180, p)}, 160)`}>
            <rect x="0" y="0" width="480" height="200" rx="28" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="4.5" />
            <circle cx="96" cy="100" r="52" fill="#E0F2FE" />
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

          <path
            d="M 500 360 C 500 468, 740 480, 960 515"
            fill="none"
            stroke="#6366F1"
            strokeWidth="9"
            strokeLinecap="round"
            opacity={0.6 + pulse * 0.4}
          />
          <path
            d="M 1420 360 C 1420 468, 1180 480, 960 515"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="9"
            strokeLinecap="round"
            opacity={0.6 + pulse * 0.4}
          />

          <g transform="translate(960, 600)">
            <rect
              x="-345"
              y="-76"
              width="690"
              height="152"
              rx="32"
              fill="#FFFFFF"
              stroke="url(#nd10_nerveGlow)"
              strokeWidth="6"
            />
            <circle cx="-254" cy="-2" r="36" fill="#FCE7F3" />
            <path
              d="M -274 -2 Q -259 -22 -249 -2 T -230 -2"
              fill="none"
              stroke="#DB2777"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <text x="30" y="-12" textAnchor="middle" fill="#BE185D" fontSize="34" fontWeight="800">
              Chung tuyến dây sinh ba
            </text>
            <text x="30" y="34" textAnchor="middle" fill="#475569" fontSize="23" fontWeight="600">
              Cùng kích hoạt mạch máu &amp; tín hiệu đau vùng trán
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: HeadCutawayDiagram showing shared vascular + nerve pathway */}
      {activeStep === 1 && (
        <g>
          <HeadCutawayDiagram
            x={960}
            y={490}
            scale={1.06}
            coldPalatePct={0.65}
            foreheadPainPct={0.72}
            showTrigeminal={true}
            showVesselDilate={0.7}
            frame={frame}
            uid="nd10_s1"
          />

          <g transform="translate(150, 300)" opacity={clamp01(p * 1.5)}>
            <rect x="0" y="0" width="380" height="118" rx="22" fill="#FFFFFF" stroke="#EF4444" strokeWidth="3.5" />
            <text x="190" y="50" textAnchor="middle" fill="#B91C1C" fontSize="26" fontWeight="800">
              Mạch máu giãn nở
            </text>
            <text x="190" y="86" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="600">
              Tăng lưu lượng đột ngột
            </text>
            <line x1="380" y1="60" x2="495" y2="122" stroke="#EF4444" strokeWidth="4" strokeDasharray="8 6" />
          </g>

          <g transform="translate(1390, 300)" opacity={clamp01(p * 1.5)}>
            <rect x="0" y="0" width="380" height="118" rx="22" fill="#FFFFFF" stroke="#6366F1" strokeWidth="3.5" />
            <text x="190" y="50" textAnchor="middle" fill="#4338CA" fontSize="26" fontWeight="800">
              Dây thần kinh sinh ba
            </text>
            <text x="190" y="86" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="600">
              Truyền tín hiệu chung lên não
            </text>
            <line x1="0" y1="60" x2="-115" y2="122" stroke="#6366F1" strokeWidth="4" strokeDasharray="8 6" />
          </g>
        </g>
      )}

      {/* STEP 2: DOCTOR grounded on floor beside live Doppler waveform monitor */}
      {activeStep === 2 && (
        <g>
          {/* Grounded lab floor at y = 786 */}
          <rect x="0" y="786" width="1920" height="294" fill="#E2E8F0" />
          <line x1="0" y1="786" x2="1920" y2="786" stroke="#94A3B8" strokeWidth="4" />

          {/* Monitor Stand legs resting firmly on floor y = 786 */}
          <rect x="1150" y="655" width="160" height="26" rx="8" fill="#64748B" stroke={INK} strokeWidth="3.5" />
          <rect x="1212" y="681" width="36" height="90" fill="#475569" stroke={INK} strokeWidth="3.5" />
          <rect x="1105" y="766" width="250" height="20" rx="8" fill="#334155" stroke={INK} strokeWidth="3.5" />

          {/* Doctor Stickman grounded firmly at y = 786 */}
          <SharedStickman
            x={475}
            y={670}
            scale={1.02}
            role="DOCTOR"
            facing="RIGHT"
            pose="POINT_UP"
            expression="HAPPY"
            frame={frame}
          />

          {/* Ultrasound Waveform Monitor */}
          <g transform="translate(800, 175)">
            <rect x="0" y="0" width="860" height="480" rx="28" fill="#0F172A" stroke="#334155" strokeWidth="6" />
            <rect x="24" y="22" width="812" height="52" rx="14" fill="#1E293B" />
            <circle cx="56" cy="48" r="8" fill="#10B981" />
            <text x="82" y="56" fill="#E2E8F0" fontSize="22" fontWeight="700">
              SIÊU ÂM DOPPLER — LƯU LƯỢNG MÁU NÃO
            </text>
            <text x="808" y="56" textAnchor="end" fill="#38BDF8" fontSize="20" fontWeight="700">
              LIVE
            </text>

            <g stroke="#1E293B" strokeWidth="2">
              {[150, 250, 350].map((gy) => (
                <line key={gy} x1="36" y1={gy} x2="824" y2={gy} />
              ))}
              {[180, 340, 500, 660].map((gx) => (
                <line key={gx} x1={gx} y1="92" x2={gx} y2="390" />
              ))}
            </g>

            <polyline
              points={wavePoints
                .map((pt) => {
                  const [px, py] = pt.split(',').map(Number);
                  return `${px - 800},${py - 175}`;
                })
                .join(' ')}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <rect x="36" y="398" width="788" height="56" rx="14" fill="#1E293B" />
            <text x="430" y="434" textAnchor="middle" fill="#6EE7B7" fontSize="23" fontWeight="700">
              Mô hình an toàn để nghiên cứu cơn đau nửa đầu
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 11. NUOCDA_BRAIN_VS_TOOTH
//     - Fixed Bug #10: Lively continuous `frame`-driven animations on BOTH icons:
//       * Left icon: pulsing/rotating red forehead starburst, expanding shockwave
//         ring, nerve pulse dash, AND mini constricting/dilating blood vessel!
//       * Right icon: icy blue cold wave arrows sweeping into worn enamel notch,
//         flashing red-yellow pain bolts, pulsing exposed pulp nerve & cold shiver!
//     - Single top header only (NO duplicate bottom pill)
// ============================================================================
export const NuocDaBrainVsToothVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  const leftOpacity = activeStep === 2 ? 0.42 : 1;
  const rightOpacity = activeStep === 1 ? 0.42 : 1;
  const leftHighlight = activeStep === 1;
  const rightHighlight = activeStep === 2;

  const leftActive = activeStep !== 2;
  const rightActive = activeStep !== 1;

  // Left animations (Buốt óc)
  const starScale = leftActive ? 0.84 + 0.28 * Math.abs(Math.sin(frame * 0.22)) : 0.9;
  const starRot = leftActive ? Math.sin(frame * 0.14) * 14 : 0;
  const shockR = leftActive ? 14 + (frame % 26) * 1.4 : 18;
  const shockAlpha = leftActive ? Math.max(0, 1 - (frame % 26) / 26) : 0;
  const miniVesselWidth = leftActive ? 7.5 + Math.sin(frame * 0.2) * 3.8 : 7.5;
  const nerveDash = leftActive ? -(frame * 3.4) : 0;

  // Right animations (Ê buốt răng)
  const toothShiverX = rightActive ? Math.sin(frame * 0.65) * 2.1 : 0;
  const zapPulse = rightActive ? 0.45 + 0.55 * Math.abs(Math.sin(frame * 0.3)) : 0.6;
  const pulpWidth = rightActive ? 5 + 2.2 * Math.sin(frame * 0.26) : 5;
  const coldArrowShift = rightActive ? (frame * 1.6) % 18 : 0;

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

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
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

      {/* Center Vertical Divider */}
      <line x1="960" y1="158" x2="960" y2="765" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="12 10" />

      {/* LEFT COLUMN: Buốt óc (Brain Freeze) */}
      <g opacity={leftOpacity}>
        <rect
          x="105"
          y="150"
          width="750"
          height="620"
          rx="32"
          fill="#FFFFFF"
          stroke={leftHighlight ? '#0284C7' : '#BAE6FD'}
          strokeWidth={leftHighlight ? 6 : 3.5}
        />
        <rect x="105" y="150" width="750" height="86" rx="32" fill="#E0F2FE" />
        <rect x="105" y="200" width="750" height="36" fill="#E0F2FE" />
        <text x="480" y="205" textAnchor="middle" fill="#0369A1" fontSize="34" fontWeight="800">
          Buốt óc (Brain Freeze)
        </text>

        {/* Animated Head + Forehead Starburst + Mini Pulsing Blood Vessel */}
        <g transform="translate(480, 348)">
          <circle cx="0" cy="0" r="90" fill="#F0F9FF" stroke="#7DD3FC" strokeWidth="3.5" />

          {/* Head silhouette */}
          <path
            d="M -28 56 L -28 32 C -46 22 -52 0 -46 -22 C -40 -48 -14 -60 14 -56 C 42 -52 54 -28 50 -2 L 60 12 L 48 18 L 46 38 C 44 48 32 54 18 54 L 18 62"
            fill="#FDE68A"
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Cold palate dot + animated nerve signal travelling up to forehead */}
          <circle cx="28" cy="24" r={6 + Math.sin(frame * 0.2) * 2} fill="#0EA5E9" stroke="#E0F2FE" strokeWidth="2" />
          <path
            d="M 26 22 Q 4 -4 26 -34"
            fill="none"
            stroke="#FACC15"
            strokeWidth="4"
            strokeDasharray="6 6"
            strokeDashoffset={nerveDash}
          />

          {/* Expanding red shockwave ring on forehead */}
          <circle cx="26" cy="-34" r={shockR} fill="none" stroke="#EF4444" strokeWidth="3.2" opacity={shockAlpha} />

          {/* Pulsing & twisting red Forehead Starburst */}
          <g transform={`translate(26, -34) rotate(${starRot}) scale(${starScale})`}>
            <polygon
              points="0,-24 6,-8 22,-10 10,2 18,18 2,10 -12,20 -8,4 -22,-4 -6,-8"
              fill="#EF4444"
              stroke="#FEF08A"
              strokeWidth="2.5"
            />
          </g>

          {/* Mini Animated Blood Vessel inset on left side of icon */}
          <g transform="translate(-145, 0)">
            <rect x="-56" y="-42" width="112" height="84" rx="18" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="2.8" />
            <line x1="-40" y1="0" x2="40" y2="0" stroke="#EF4444" strokeWidth={miniVesselWidth * 2} strokeLinecap="round" />
            <line x1="-40" y1="0" x2="40" y2="0" stroke="#FECACA" strokeWidth={Math.max(3, miniVesselWidth * 0.6)} strokeLinecap="round" />
            <text x="0" y="34" textAnchor="middle" fill="#B91C1C" fontSize="14" fontWeight="800">
              Co ↔ Giãn
            </text>
          </g>
        </g>

        {leftRows.map((row, idx) => (
          <g key={idx} transform={`translate(150, ${462 + idx * 94})`}>
            <rect x="0" y="0" width="660" height="74" rx="18" fill="#F8FAFC" stroke="#BAE6FD" strokeWidth="2.5" />
            <circle cx="38" cy="37" r="12" fill="#0EA5E9" />
            <text x="68" y="46" fill={INK} fontSize="27" fontWeight="700">
              {row}
            </text>
          </g>
        ))}
      </g>

      {/* RIGHT COLUMN: Ê buốt răng */}
      <g opacity={rightOpacity}>
        <rect
          x="1065"
          y="150"
          width="750"
          height="620"
          rx="32"
          fill="#FFFFFF"
          stroke={rightHighlight ? '#EA580C' : '#FED7AA'}
          strokeWidth={rightHighlight ? 6 : 3.5}
        />
        <rect x="1065" y="150" width="750" height="86" rx="32" fill="#FFEDD5" />
        <rect x="1065" y="200" width="750" height="36" fill="#FFEDD5" />
        <text x="1440" y="205" textAnchor="middle" fill="#C2410C" fontSize="34" fontWeight="800">
          Ê buốt răng
        </text>

        {/* Animated 2D Tooth Cross-Section with cold attack & flashing nerve zaps */}
        <g transform={`translate(1440, 348)`}>
          <circle cx="0" cy="0" r="90" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="3.5" />

          <g transform={`translate(${toothShiverX}, 0)`}>
            <path
              d="M -38 -42 C -18 -56 18 -56 38 -42 C 52 -30 48 6 38 26 C 32 42 26 56 16 56 C 8 56 4 36 0 36 C -4 36 -8 56 -16 56 C -26 56 -32 42 -38 26 C -48 6 -52 -30 -38 -42 Z"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M -26 -28 C -12 -38 12 -38 26 -28 C 34 -18 32 6 24 22 C 20 32 16 40 12 40 C 6 40 4 24 0 24 C -4 24 -6 40 -12 40 C -16 40 -20 32 -24 22 C -32 6 -34 -18 -26 -28 Z"
              fill="#FEF08A"
              stroke="#CA8A04"
              strokeWidth="2.5"
            />
            {/* Worn Enamel Notch */}
            <path d="M 28 -32 L 46 -22 L 32 -8 Z" fill="#FED7AA" stroke="#EA580C" strokeWidth="2.8" />

            {/* Pulsing Exposed Red Pulp Nerve */}
            <path
              d="M -10 -12 C -4 -20 4 -20 10 -12 C 14 -2 12 16 10 34 M -10 -12 C -14 -2 -12 16 -10 34"
              fill="none"
              stroke="#EF4444"
              strokeWidth={pulpWidth}
              strokeLinecap="round"
              opacity={0.7 + zapPulse * 0.3}
            />
          </g>

          {/* Animated icy cold wave hitting the worn notch */}
          <g transform={`translate(${14 - coldArrowShift}, -20)`} opacity={rightActive ? 0.9 : 0.35}>
            <path d="M 68 0 L 42 0 M 50 -8 L 40 0 L 50 8" fill="none" stroke="#0284C7" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 74 14 L 50 14" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Flashing electric pain bolts shooting from notch to pulp */}
          <g opacity={zapPulse}>
            <polyline
              points="40,-24 58,-38 52,-18 72,-28"
              fill="none"
              stroke="#EF4444"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="34,-18 20,-12 24,-2 10,-6"
              fill="none"
              stroke="#FACC15"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Mini label badge on right side of icon */}
          <g transform="translate(145, 0)">
            <rect x="-56" y="-42" width="112" height="84" rx="18" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="2.8" />
            <polygon
              points="4,-24 -16,2 0,2 -8,26 18,-4 2,-4"
              fill="#F97316"
              stroke="#9A3412"
              strokeWidth="2.2"
              strokeLinejoin="round"
              opacity={zapPulse}
            />
            <text x="0" y="34" textAnchor="middle" fill="#C2410C" fontSize="14" fontWeight="800">
              Ê nhói răng
            </text>
          </g>
        </g>

        {rightRows.map((row, idx) => (
          <g key={idx} transform={`translate(1110, ${462 + idx * 94})`}>
            <rect x="0" y="0" width="660" height="74" rx="18" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="2.5" />
            <circle cx="38" cy="37" r="12" fill="#F97316" />
            <text x="68" y="46" fill={INK} fontSize="27" fontWeight="700">
              {row}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// ============================================================================
// 12. NUOCDA_COLD_AIR_TRIGGER
//     - Fixed Bug #11:
//       * Step 1 (04:35, b45): Stickman BOY riding a 2D BICYCLE with spinning
//         spoked wheels, hands gripping handlebars, pedaling into winter headwind!
//       * Step 2 (04:41, b46): Stickman BOY leaping/plunging into a chilly blue
//         lake off a wooden dock with big splashing water plumes & shivering shock!
//     - Single top title only (NO duplicate bottom pill)
// ============================================================================
export const NuocDaColdAirTriggerVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const windOffset = (frame * 7) % 240;
  const wheelAngle = -(frame * 9) % 360;
  const pedalRad = ((frame * 9) * Math.PI) / 180;
  const roadDashOffset = (frame * 10) % 140;
  const scarfWave = Math.sin(frame * 0.34) * 9;

  // Step 2 lake jump & plunge physics
  const plungeT = clamp01(p / 0.36);
  const inWater = p >= 0.36;
  const splashT = clamp01((p - 0.36) / 0.64);
  const jumpX = lerp(520, 910, plungeT);
  const jumpY = lerp(455, 575, plungeT) - Math.sin(plungeT * Math.PI) * 145;
  const waterBob = Math.sin(frame * 0.16) * 5;
  const shiverX = Math.sin(frame * 0.72) * 3.2;
  const waveShift = Math.sin(frame * 0.14) * 14;

  // Bicycle pedal coordinates around bottom bracket (1072, 672)
  const pedal1X = 1072 + Math.cos(pedalRad) * 26;
  const pedal1Y = 672 + Math.sin(pedalRad) * 26;
  const pedal2X = 1072 - Math.cos(pedalRad) * 26;
  const pedal2Y = 672 - Math.sin(pedalRad) * 26;

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
        <linearGradient id="nd12_lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd12_bg)" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={92}
        text={
          activeStep === 0
            ? 'Không chỉ nước đá hay kem!'
            : activeStep === 1
              ? 'Chạy xe ngược gió lạnh mùa đông'
              : 'Nhảy ùm xuống hồ nước quá lạnh'
        }
        bg="#FFFFFF"
        color={INK}
        border="#0284C7"
        fontSize={34}
      />

      {/* STEP 0: Clean 3-icon banner */}
      {activeStep === 0 && (
        <g>
          <g transform="translate(180, 210)">
            <rect x="0" y="0" width="460" height="450" rx="30" fill="#FFFFFF" stroke="#7DD3FC" strokeWidth="4" />
            <g transform="translate(230, 205)">
              <polygon points="-42,18 42,18 0,132" fill="#F59E0B" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
              <line x1="-22" y1="54" x2="22" y2="54" stroke="#B45309" strokeWidth="3" />
              <line x1="-12" y1="86" x2="12" y2="86" stroke="#B45309" strokeWidth="3" />
              <circle cx="-26" cy="-6" r="36" fill="#F9A8D4" stroke={INK} strokeWidth="4" />
              <circle cx="26" cy="-6" r="36" fill="#FEF08A" stroke={INK} strokeWidth="4" />
              <circle cx="0" cy="-42" r="40" fill="#93C5FD" stroke={INK} strokeWidth="4" />
            </g>
            <text x="230" y="396" textAnchor="middle" fill={INK} fontSize="30" fontWeight="800">
              Kem lạnh
            </text>
          </g>

          <g transform="translate(730, 210)">
            <rect x="0" y="0" width="460" height="450" rx="30" fill="#FFFFFF" stroke="#7DD3FC" strokeWidth="4" />
            <IcedDrinkGlass x={230} y={240} scale={0.78} fillPct={0.82} showFrost={true} frame={frame} uid="nd12_s0" />
            <text x="230" y="396" textAnchor="middle" fill={INK} fontSize="30" fontWeight="800">
              Nước đá / Trà đá
            </text>
          </g>

          <g transform="translate(1280, 210)">
            <rect x="0" y="0" width="460" height="450" rx="30" fill="#FFFFFF" stroke="#0284C7" strokeWidth="5" />
            <g transform="translate(230, 200)">
              <circle cx="0" cy="0" r="105" fill="#E0F2FE" />
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
              <path d="M -32 40 C -32 40 -48 64 -32 76 C -16 64 -32 40 -32 40 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
              <path d="M 10 46 C 10 46 -4 66 10 78 C 24 66 10 46 10 46 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
            </g>
            <text x="230" y="396" textAnchor="middle" fill="#0369A1" fontSize="30" fontWeight="800">
              Gió mùa đông &amp; Nước lạnh
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: Stickman BOY riding a 2D Bicycle into brisk winter headwind (04:35, b45) */}
      {activeStep === 1 && (
        <g>
          {/* Winter Hills & Road (tires touch y = 760 <= 830) */}
          <path d="M 0 650 Q 460 560 960 635 T 1920 620 L 1920 760 L 0 760 Z" fill="#DBEAFE" />
          <rect x="0" y="756" width="1920" height="324" fill="#64748B" />
          <line x1="0" y1="756" x2="1920" y2="756" stroke="#334155" strokeWidth="5" />
          {/* Moving dashed road stripe moving rightward to sell cycling leftward speed */}
          <line
            x1="-140"
            y1="808"
            x2="2060"
            y2="808"
            stroke="#E2E8F0"
            strokeWidth="8"
            strokeDasharray="65 75"
            strokeDashoffset={-roadDashOffset}
            opacity="0.7"
          />

          {/* Cold Thermometer Badge on Left */}
          <g transform="translate(230, 325)">
            <rect x="-78" y="-110" width="156" height="220" rx="26" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
            <rect x="-12" y="-76" width="24" height="118" rx="12" fill="#E0F2FE" stroke="#0369A1" strokeWidth="3" />
            <rect x="-7" y="-22" width="14" height="62" rx="7" fill="#0284C7" />
            <circle cx="0" cy="48" r="22" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
            <text x="0" y="96" textAnchor="middle" fill="#0369A1" fontSize="26" fontWeight="800">
              8°C
            </text>
          </g>

          {/* Icy Blue Headwind Streaks rushing LEFT -> RIGHT straight into rider's open mouth */}
          {[295, 365, 435, 505].map((wy, idx) => (
            <path
              key={idx}
              d={`M ${280 + ((windOffset + idx * 55) % 240)} ${wy} Q 610 ${wy - 18} 945 ${420 + (idx - 1.5) * 20}`}
              fill="none"
              stroke={idx % 2 === 0 ? '#0284C7' : '#38BDF8'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="62 28"
            />
          ))}

          {/* 2D BICYCLE + RIDER (BOY facing LEFT pedaling smoothly) */}
          <g>
            {/* Ground shadow under bike */}
            <ellipse cx="1040" cy="760" rx="265" ry="14" fill="#0F172A" opacity="0.22" />

            {/* Front Wheel (cx=865, cy=678, r=78) spinning counterclockwise */}
            <g transform="translate(865, 678)">
              <circle cx="0" cy="0" r="78" fill="none" stroke="#1E293B" strokeWidth="13" />
              <circle cx="0" cy="0" r="68" fill="none" stroke="#94A3B8" strokeWidth="4" />
              <g transform={`rotate(${wheelAngle})`} stroke="#475569" strokeWidth="3">
                {[0, 45, 90, 135].map((deg) => (
                  <line key={deg} x1="-68" y1="0" x2="68" y2="0" transform={`rotate(${deg})`} />
                ))}
              </g>
              <circle cx="0" cy="0" r="10" fill="#334155" stroke="#F8FAFC" strokeWidth="3" />
            </g>

            {/* Rear Wheel (cx=1215, cy=678, r=78) spinning counterclockwise */}
            <g transform="translate(1215, 678)">
              <circle cx="0" cy="0" r="78" fill="none" stroke="#1E293B" strokeWidth="13" />
              <circle cx="0" cy="0" r="68" fill="none" stroke="#94A3B8" strokeWidth="4" />
              <g transform={`rotate(${wheelAngle})`} stroke="#475569" strokeWidth="3">
                {[0, 45, 90, 135].map((deg) => (
                  <line key={deg} x1="-68" y1="0" x2="68" y2="0" transform={`rotate(${deg})`} />
                ))}
              </g>
              <circle cx="0" cy="0" r="10" fill="#334155" stroke="#F8FAFC" strokeWidth="3" />
            </g>

            {/* Back Leg pedaling to far pedal */}
            <path
              d={`M 1138 538 L ${(1138 + pedal2X) / 2 - 28} ${(538 + pedal2Y) / 2 - 12} L ${pedal2X} ${pedal2Y}`}
              fill="none"
              stroke="#475569"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Crisp Red Bicycle Diamond Frame */}
            <g fill="none" stroke="#DC2626" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
              {/* Front fork & stem */}
              <path d="M 865 678 L 932 522" />
              {/* Top tube, down tube, seat tube, rear stays */}
              <path d="M 924 548 L 1126 558 L 1072 672 L 924 548" />
              <path d="M 1126 558 L 1215 678 L 1072 672" />
              {/* Seat post */}
              <path d="M 1126 558 L 1136 534" stroke="#334155" strokeWidth="8" />
              {/* Handlebars */}
              <path d="M 932 522 L 914 494 L 948 494" stroke="#334155" strokeWidth="8" />
            </g>
            {/* Saddle */}
            <path d="M 1110 534 L 1164 534" stroke={INK} strokeWidth="11" strokeLinecap="round" />

            {/* Chainring & Crank */}
            <circle cx="1072" cy="672" r="18" fill="#E2E8F0" stroke="#334155" strokeWidth="4" />
            <line x1={pedal1X} y1={pedal1Y} x2={pedal2X} y2={pedal2Y} stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <line x1={pedal1X - 10} y1={pedal1Y} x2={pedal1X + 10} y2={pedal1Y} stroke={INK} strokeWidth="6" strokeLinecap="round" />

            {/* Back Arm gripping handlebar */}
            <path
              d="M 1044 468 L 986 498 L 944 494"
              fill="none"
              stroke="#475569"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Fluttering Red Scarf trailing behind neck */}
            <path
              d={`M 1042 464 Q 1094 ${452 + scarfWave * 0.5} 1148 ${468 + scarfWave} Q 1120 ${484 + scarfWave * 0.7} 1054 476 Z`}
              fill="#EF4444"
              stroke={INK}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Rider Torso leaning forward into headwind */}
            <line x1="1138" y1="536" x2="1044" y2="466" stroke={INK} strokeWidth="8" strokeLinecap="round" />

            {/* Front Leg pedaling */}
            <path
              d={`M 1138 538 L ${(1138 + pedal1X) / 2 - 28} ${(538 + pedal1Y) / 2 - 12} L ${pedal1X} ${pedal1Y}`}
              fill="none"
              stroke={INK}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Front Arm gripping handlebar */}
            <path
              d="M 1044 468 L 992 508 L 946 496"
              fill="none"
              stroke={INK}
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Rider Head (BOY facing LEFT with wavy hair & open mouth into icy wind) */}
            <g transform="translate(996, 428) rotate(-8)">
              <circle cx="0" cy="0" r="40" fill="#FFFFFF" stroke={INK} strokeWidth="5.5" />
              {/* BOY wavy black hair (facing LEFT) */}
              <path
                d="M 38 -8 C 40 -38 14 -48 0 -44 C -8 -51 -20 -46 -22 -40 C -36 -37 -40 -22 -38 -8 C -28 -16 -14 -14 -4 -20 C 8 -12 24 -16 38 -8 Z"
                fill="#0F172A"
              />
              {/* Wide cold-shocked eyes facing LEFT */}
              <circle cx="-18" cy="-2" r="6.8" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
              <circle cx="-20" cy="-2" r="3.2" fill={INK} />
              <circle cx="5" cy="-2" r="6.8" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
              <circle cx="3" cy="-2" r="3.2" fill={INK} />
              {/* Open mouth breathing hard */}
              <ellipse cx="-14" cy="19" rx="8" ry="10" fill="#FCA5A5" stroke={INK} strokeWidth="3.2" />
              {/* Subtle forehead chill/pain sparks */}
              <path d="M -32 -34 L -48 -44 M -40 -18 L -56 -22" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Icy breath cloud entering mouth */}
            <circle cx="942" cy="442" r="18" fill="#BAE6FD" opacity="0.72" />
            <circle cx="912" cy="438" r="12" fill="#7DD3FC" opacity="0.65" />
          </g>
        </g>
      )}

      {/* STEP 2: Stickman BOY leaping & plunging into chilly blue lake (04:41, b46) */}
      {activeStep === 2 && (
        <g>
          {/* Distant cool treeline */}
          <path d="M 0 580 Q 480 515 960 560 T 1920 545 L 1920 620 L 0 620 Z" fill="#CBD5E1" opacity="0.7" />

          {/* Wooden Pier / Dock on Left */}
          <g>
            <rect x="115" y="545" width="32" height="240" fill="#78350F" stroke={INK} strokeWidth="4" />
            <rect x="375" y="545" width="32" height="240" fill="#78350F" stroke={INK} strokeWidth="4" />
            <rect x="0" y="518" width="490" height="32" rx="6" fill="#B45309" stroke={INK} strokeWidth="4.5" />
            <line x1="150" y1="518" x2="150" y2="550" stroke={INK} strokeWidth="3" />
            <line x1="300" y1="518" x2="300" y2="550" stroke={INK} strokeWidth="3" />
          </g>

          {/* Back Lake Surface */}
          <rect x="0" y="585" width="1920" height="495" fill="url(#nd12_lake)" />
          <path
            d={`M 0 585 Q ${320 + waveShift} 565 ${640 + waveShift} 585 T ${1280 + waveShift} 585 T ${1920 + waveShift} 585 L 1920 630 L 0 630 Z`}
            fill="#7DD3FC"
            opacity="0.5"
          />

          {/* BOY leaping off pier -> plunging waist-deep into icy lake */}
          {!inWater ? (
            /* Mid-air dive/jump arc off the dock */
            <g transform={`translate(${jumpX}, ${jumpY}) rotate(${lerp(18, 42, plungeT)})`}>
              <g stroke={INK} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 0 0 L -42 36 L -74 72" />
                <path d="M 0 0 L -20 48 L -42 88" />
                <line x1="0" y1="0" x2="48" y2="-76" />
                <path d="M 38 -60 L 78 -88 L 106 -64" />
                <path d="M 38 -60 L 66 -30 L 96 -22" />
              </g>
              <g transform="translate(72, -108)">
                <circle cx="0" cy="0" r="36" fill="#FFFFFF" stroke={INK} strokeWidth="5" />
                <path
                  d="M -34 -8 C -36 -34 -12 -44 0 -40 C 8 -47 18 -42 20 -37 C 32 -34 36 -20 34 -8 C 24 -16 14 -14 4 -20 C -8 -12 -20 -16 -34 -8 Z"
                  fill="#0F172A"
                />
                <circle cx="8" cy="-2" r="5.5" fill="#FFFFFF" stroke={INK} strokeWidth="2.4" />
                <circle cx="10" cy="-2" r="2.8" fill={INK} />
                <ellipse cx="14" cy="14" rx="7" ry="8" fill="#FCA5A5" stroke={INK} strokeWidth="2.8" />
              </g>
            </g>
          ) : (
            /* Plunged into icy lake water — shivering with big splash plumes! */
            <g>
              {/* Expanding cold lake ripple rings */}
              <ellipse
                cx="910"
                cy="606"
                rx={120 + ((frame * 3) % 140)}
                ry={22 + ((frame * 0.5) % 24)}
                fill="none"
                stroke="#E0F2FE"
                strokeWidth="5"
                opacity={Math.max(0.15, 1 - ((frame * 3) % 140) / 140)}
              />

              {/* BOY upper body shivering in cold lake water */}
              <g transform={`translate(${910 + shiverX}, ${610 + waterBob})`}>
                {/* Shoulders & clutching arms */}
                <line x1="0" y1="14" x2="0" y2="-56" stroke={INK} strokeWidth="8" strokeLinecap="round" />
                <path d="M 0 -44 L -48 -78 L -30 -110" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0 -44 L 48 -78 L 30 -110" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

                {/* Head in icy chill shock */}
                <g transform="translate(0, -104)">
                  <circle cx="0" cy="0" r="39" fill="#FFFFFF" stroke={INK} strokeWidth="5.5" />
                  <path
                    d="M -36 -8 C -38 -36 -12 -46 0 -42 C 8 -49 18 -44 20 -39 C 34 -36 38 -22 36 -8 C 26 -16 14 -14 4 -20 C -8 -12 -22 -16 -36 -8 Z"
                    fill="#0F172A"
                  />
                  {/* Pain squinted eyes */}
                  <path d="M -16 -6 L -4 -2 L -16 3 M 20 -6 L 8 -2 L 20 3" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Shivering wavy mouth */}
                  <path d="M -12 18 Q -6 12 0 18 Q 6 12 12 18 Q 6 24 0 22 Q -6 24 -12 18 Z" fill="#FCA5A5" stroke={INK} strokeWidth="3" />
                  {/* Cold & forehead pain sparks */}
                  <path d="M -38 -26 L -54 -36 M 38 -26 L 54 -36 M 0 -48 L 0 -64" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
                </g>
              </g>

              {/* Big Dynamic Water Splash Plumes & Flying Droplets */}
              <g opacity={Math.max(0.45, 1 - splashT * 0.35)}>
                <path
                  d={`M 835 595 Q 765 ${465 - Math.sin(frame * 0.25) * 18} 700 ${515 - Math.sin(frame * 0.25) * 12}`}
                  fill="none"
                  stroke="#E0F2FE"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d={`M 985 595 Q 1055 ${460 - Math.cos(frame * 0.25) * 18} 1125 ${512 - Math.cos(frame * 0.25) * 12}`}
                  fill="none"
                  stroke="#E0F2FE"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M 800 600 Q 845 520 880 572 M 1020 600 Q 975 520 940 572"
                  fill="none"
                  stroke="#BAE6FD"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                {[
                  [690, 480],
                  [745, 442],
                  [1085, 445],
                  [1140, 485],
                  [820, 465],
                  [1005, 465],
                ].map(([dx, dy], idx) => (
                  <circle
                    key={idx}
                    cx={dx}
                    cy={dy + Math.sin(frame * 0.28 + idx) * 12}
                    r={idx % 2 === 0 ? 10 : 7}
                    fill="#FFFFFF"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />
                ))}
              </g>

              {/* Foreground Lake Wave overlapping chest so BOY is genuinely immersed in water */}
              <path
                d={`M 620 612 Q ${760 - waveShift} 588 ${910 - waveShift} 612 T ${1200 - waveShift} 612 L 1200 668 L 620 668 Z`}
                fill="#0284C7"
                opacity="0.88"
              />
              <path
                d={`M 640 612 Q ${775 - waveShift} 592 ${910 - waveShift} 612 T ${1180 - waveShift} 612`}
                fill="none"
                stroke="#E0F2FE"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Cold Thermometer Card on Upper Right */}
          <g transform="translate(1525, 315)">
            <rect x="-112" y="-125" width="224" height="250" rx="28" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4.5" />
            <rect x="-14" y="-88" width="28" height="122" rx="14" fill="#E0F2FE" stroke="#0369A1" strokeWidth="3" />
            <rect x="-8" y="-26" width="16" height="60" rx="8" fill="#0284C7" />
            <circle cx="0" cy="44" r="24" fill="#0284C7" stroke="#0369A1" strokeWidth="3" />
            <text x="0" y="102" textAnchor="middle" fill="#0369A1" fontSize="28" fontWeight="800">
              Nước 12°C
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 13. NUOCDA_TIP_TONGUE_PALATE
//     - Single crisp top title only (NO duplicate bottom pill), unique uid
// ============================================================================
export const NuocDaTipTonguePalateVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const coldPct = activeStep === 0 ? 0.85 : activeStep === 1 ? lerp(0.85, 0.15, p) : 0.05;
  const painPct = activeStep === 0 ? 0.8 : activeStep === 1 ? lerp(0.8, 0.15, p) : 0;
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

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={92}
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

      <HeadCutawayDiagram
        x={760}
        y={505}
        scale={1.0}
        coldPalatePct={coldPct}
        foreheadPainPct={painPct}
        showTrigeminal={activeStep < 2}
        showVesselDilate={activeStep === 0 ? 0.7 : activeStep === 1 ? lerp(0.7, 0.2, p) : 0}
        tongueUp={tongueUp}
        frame={frame}
        uid="nd13_head"
      />

      {activeStep === 1 && (
        <g transform="translate(805, 545)">
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

      {activeStep === 0 && (
        <g transform="translate(1190, 285)">
          <rect x="0" y="0" width="540" height="320" rx="28" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4.5" />
          <circle cx="270" cy="108" r="56" fill="#FEF3C7" />
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
        <g transform="translate(1190, 285)">
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
        <g transform="translate(1445, 455)">
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
    </svg>
  );
};

// ============================================================================
// 14. NUOCDA_TIP_WARM_WATER
//     - Fixed Bug #12: Step 0 BOY holds steaming warm glass directly in hand beside
//       grounded wooden side table (ZERO floating glass!)
//     - Fixed Step 1: BOY uses CUP_BREATH pose so real arms connect to cupped hands
//     - Fixed Part 1 #4 (05:31–05:36, Step 2): DELETED giant green text box &
//       duplicate pill; replaced with lively Stickman exhaling in relief as red
//       forehead pain spikes shrink & dissolve into emerald calm sparkles!
// ============================================================================
export const NuocDaTipWarmWaterVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const breathPulse = 0.5 + 0.5 * Math.sin(frame * 0.14);
  const painFade = clamp01(1 - p * 1.45);
  const calmFade = clamp01((p - 0.3) * 1.6);
  const sighDrift = (frame * 1.8) % 44;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <linearGradient id="nd14_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={activeStep === 2 ? '#F0FDF4' : '#FFF7ED'} />
          <stop offset="100%" stopColor={activeStep === 2 ? '#DCFCE7' : '#FFEDD5'} />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#nd14_bg)" />

      {/* Grounded Floor (y = 790 <= 830) */}
      <rect x="0" y="790" width="1920" height="290" fill={activeStep === 2 ? '#BBF7D0' : '#FED7AA'} opacity="0.52" />
      <line x1="0" y1="790" x2="1920" y2="790" stroke={activeStep === 2 ? '#86EFAC' : '#FDBA74'} strokeWidth="4" />

      {/* Single Top Header (NO duplicate bottom pill!) */}
      <CleanLabel
        x={960}
        y={92}
        text={
          activeStep === 0
            ? 'Mẹo 2: Nhấp ngụm nước ấm (~38°C)'
            : activeStep === 1
              ? 'Mẹo 3: Khum tay thở hơi ấm'
              : 'Hết buốt tự nhiên — Không cần thuốc'
        }
        bg={activeStep === 2 ? '#DCFCE7' : '#FFFFFF'}
        color={activeStep === 2 ? '#065F46' : INK}
        border={activeStep === 2 ? '#10B981' : '#EA580C'}
        fontSize={34}
      />

      {/* STEP 0: Grounded BOY directly holding & sipping steaming warm water beside wooden table */}
      {activeStep === 0 && (
        <g>
          {/* Wooden Side Table with Warm Carafe/Pitcher resting solidly on tabletop */}
          <WoodenSideTable x={775} topY={676} floorY={790} width={160} />
          <g transform="translate(775, 622)">
            {/* Warm water carafe sitting flush on tabletop (bottom y = +54 -> 676) */}
            <path
              d="M -26 -38 L 26 -38 L 36 46 Q 36 54 26 54 L -26 54 Q -36 54 -36 46 Z"
              fill="#FFF7ED"
              stroke={INK}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M -28 2 L 28 2 L 32 46 Q 32 50 24 50 L -24 50 Q -32 50 -32 46 Z" fill="#FB923C" opacity="0.8" />
            <path d="M 28 -24 C 52 -24 52 18 32 22" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
            <rect x="-24" y="-48" width="48" height="12" rx="5" fill="#EA580C" stroke={INK} strokeWidth="3" />
          </g>

          {/* BOY holding & sipping steaming warm water glass directly in hand! */}
          <SharedStickman
            x={530}
            y={674}
            scale={1.02}
            role="BOY"
            facing="RIGHT"
            pose="SIP_WARM"
            expression="RELIEF"
            frame={frame}
            uid="nd14_s0_boy"
          />

          {/* Compact ~38°C Temp Badge */}
          <g transform="translate(658, 496)">
            <rect x="-56" y="-24" width="112" height="44" rx="22" fill="#EA580C" stroke="#FFFFFF" strokeWidth="3" />
            <text x="0" y="7" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800">
              ~38°C
            </text>
          </g>

          {/* Right Explainer Card */}
          <g transform="translate(1000, 260)">
            <rect x="0" y="0" width="660" height="335" rx="30" fill="#FFFFFF" stroke="#FB923C" strokeWidth="4" />
            <text x="330" y="92" textAnchor="middle" fill="#C2410C" fontSize="34" fontWeight="800">
              Nước ấm hoặc nước lọc
            </text>
            <text x="330" y="158" textAnchor="middle" fill={INK} fontSize="26" fontWeight="600">
              Nhấp từng ngụm nhỏ, giữ nhẹ 2–3 giây
            </text>
            <text x="330" y="210" textAnchor="middle" fill="#64748B" fontSize="24" fontWeight="600">
              Cân bằng nhiệt độ vòm miệng nhanh chóng
            </text>
            <rect x="180" y="248" width="300" height="48" rx="24" fill="#FFEDD5" />
            <text x="330" y="280" textAnchor="middle" fill="#9A3412" fontSize="22" fontWeight="800">
              Không dùng nước quá nóng
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: BOY lifting BOTH real arms (CUP_BREATH) to cup warm breath around mouth */}
      {activeStep === 1 && (
        <g>
          <SharedStickman
            x={655}
            y={674}
            scale={1.02}
            role="BOY"
            facing="RIGHT"
            pose="CUP_BREATH"
            expression="RELIEF"
            frame={frame}
          />

          {/* Warm glowing breath cloud right at Boy's cupped hands (655 + 42*1.02 = 698, 674 - 122*1.02 = 550) */}
          <g transform="translate(705, 545)">
            <ellipse
              cx={26 + breathPulse * 14}
              cy="0"
              rx={46 + breathPulse * 14}
              ry={32 + breathPulse * 8}
              fill="#FDBA74"
              opacity={0.45 + breathPulse * 0.25}
            />
            <path
              d="M -6 -20 C 20 -22 36 -4 30 20 C 24 38 4 40 -10 28 Z"
              fill="#FDE68A"
              stroke={INK}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </g>

          <g transform="translate(1050, 260)" opacity={clamp01(p * 1.4)}>
            <rect x="0" y="0" width="600" height="340" rx="30" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4" />
            <circle cx="300" cy="112" r="56" fill="#FEF3C7" />
            <path d="M 262 112 Q 282 90 300 112 T 338 112" fill="none" stroke="#EA580C" strokeWidth="7" strokeLinecap="round" />
            <path d="M 268 134 Q 286 116 300 134 T 332 134" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
            <text x="300" y="218" textAnchor="middle" fill={INK} fontSize="30" fontWeight="800">
              Hơi thở ấm ~37°C
            </text>
            <text x="300" y="268" textAnchor="middle" fill="#64748B" fontSize="24" fontWeight="600">
              Khum 2 tay giữ hơi ấm quanh mũi &amp; miệng
            </text>
          </g>
        </g>
      )}

      {/* STEP 2 (05:31–05:36): Storytelling Stickman exhaling in relief as forehead pain spikes dissolve! */}
      {activeStep === 2 && (
        <g>
          {/* Soft calm emerald aura blooming behind BOY */}
          <circle cx="960" cy="530" r={175 + calmFade * 65} fill="#86EFAC" opacity={0.28 * calmFade} />

          {/* BOY exhaling happily in relief, feet grounded squarely on y = 790 */}
          <SharedStickman
            x={960}
            y={662}
            scale={1.12}
            role="BOY"
            facing="RIGHT"
            pose="RELIEF_SIGH"
            expression="RELIEF"
            frame={frame}
          />

          {/* Gentle warm sigh puff curving out from smiling mouth */}
          <g transform={`translate(${1018 + sighDrift * 0.7}, ${516 - sighDrift * 0.2})`} opacity={Math.max(0.15, 0.85 - sighDrift / 52)}>
            <path d="M 0 0 Q 24 -12 46 0 T 86 -6" fill="none" stroke="#10B981" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 8 18 Q 30 8 50 18 T 82 14" fill="none" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round" />
          </g>

          {/* Red forehead pain spikes shrinking & fading completely out! */}
          {painFade > 0.02 && (
            <g transform={`translate(960, 495) scale(${0.5 + 0.6 * painFade})`} opacity={painFade}>
              {[-135, -90, -45, -165, -15].map((rot, idx) => (
                <g key={idx} transform={`rotate(${rot}) translate(74, 0)`}>
                  <polyline
                    points="0,0 18,-8 14,6 36,-4"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              ))}
            </g>
          )}

          {/* Fresh green calm sparkles blooming around head */}
          <g opacity={calmFade}>
            {[
              { sx: 830, sy: 445, s: 1.0 },
              { sx: 1095, sy: 430, s: 1.1 },
              { sx: 1135, sy: 540, s: 0.85 },
              { sx: 810, sy: 560, s: 0.85 },
            ].map((sp, idx) => {
              const sc = sp.s * (0.85 + 0.2 * Math.sin(frame * 0.16 + idx * 1.4));
              return (
                <g key={idx} transform={`translate(${sp.sx}, ${sp.sy}) scale(${sc})`}>
                  <path
                    d="M 0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </g>

          <ShortSpeechBubble x={710} y={405} text="Nhẹ cả đầu rồi!" tailDir="RIGHT" />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 15. NUOCDA_TIP_SIP_SLOWLY
//     - Fixed Bug #12: ZERO floating glasses!
//       * Step 0 (05:37): BOY directly holds & sips iced glass beside grounded wooden table
//       * Step 2 (05:48–05:53): BOY stands relaxed holding his iced glass smiling beside grounded wooden table
//     - Single top title only (NO duplicate bottom pill)
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

      {/* Grounded Floor for Step 0 & Step 2 */}
      {activeStep !== 1 && (
        <g>
          <rect x="0" y="790" width="1920" height="290" fill="#BBF7D0" opacity="0.48" />
          <line x1="0" y1="790" x2="1920" y2="790" stroke="#86EFAC" strokeWidth="4" />
        </g>
      )}

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={92}
        text={
          activeStep === 0
            ? 'Phòng ngừa: Uống từng ngụm nhỏ'
            : activeStep === 1
              ? 'Chờ kem mềm nhẹ vài giây'
              : 'Thưởng thức mát lạnh, không lo buốt đầu'
        }
        bg={activeStep === 2 ? '#DCFCE7' : '#FFFFFF'}
        color={activeStep === 2 ? '#065F46' : INK}
        border="#10B981"
        fontSize={34}
      />

      {/* STEP 0 (05:37): BOY directly holding & sipping iced glass beside small wooden table */}
      {activeStep === 0 && (
        <g>
          <WoodenSideTable x={815} topY={678} floorY={790} width={150} />
          <ellipse cx={815} cy={678} rx={36} ry={6} fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />

          <SharedStickman
            x={585}
            y={674}
            scale={1.02}
            role="BOY"
            facing="RIGHT"
            pose="SIP_GLASS"
            expression="HAPPY"
            drinkFillPct={0.78}
            frame={frame}
            uid="nd15_s0_boy"
          />

          {/* Pace Gauge Card */}
          <g transform="translate(1055, 260)">
            <rect x="0" y="0" width="600" height="335" rx="30" fill="#FFFFFF" stroke="#10B981" strokeWidth="4.5" />
            <text x="300" y="74" textAnchor="middle" fill="#065F46" fontSize="30" fontWeight="800">
              NHỊP UỐNG AN TOÀN
            </text>
            {[155, 300, 445].map((dx, idx) => (
              <g key={idx} transform={`translate(${dx}, 172)`}>
                <circle cx="0" cy="0" r="42" fill="#DCFCE7" />
                <path
                  d="M 0 -22 C 0 -22 -18 4 0 22 C 18 4 0 -22 0 -22 Z"
                  fill="#0EA5E9"
                  stroke="#0369A1"
                  strokeWidth="3"
                />
              </g>
            ))}
            <text x="300" y="278" textAnchor="middle" fill={INK} fontSize="26" fontWeight="700">
              Ngụm nhỏ — Cách nhau vài giây
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: Softening Ice Cream vs Avoid pressing ice flat on upper palate */}
      {activeStep === 1 && (
        <g>
          <g transform="translate(220, 200)">
            <rect x="0" y="0" width="660" height="475" rx="32" fill="#FFFFFF" stroke="#10B981" strokeWidth="4.5" />
            <g transform="translate(330, 232)">
              <circle cx="0" cy="-25" r={104 + softGlow * 8} fill="#FEF3C7" opacity="0.6" />
              <polygon points="-46,18 46,18 0,145" fill="#F59E0B" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
              <line x1="-26" y1="58" x2="26" y2="58" stroke="#B45309" strokeWidth="3" />
              <line x1="-14" y1="92" x2="14" y2="92" stroke="#B45309" strokeWidth="3" />
              <circle cx="-30" cy="-10" r="40" fill="#F9A8D4" stroke={INK} strokeWidth="4.5" />
              <circle cx="30" cy="-10" r="40" fill="#FEF08A" stroke={INK} strokeWidth="4.5" />
              <circle cx="0" cy="-50" r="44" fill="#FDE68A" stroke={INK} strokeWidth="4.5" />
              <circle cx="-12" cy="-54" r="4" fill={INK} />
              <circle cx="12" cy="-54" r="4" fill={INK} />
              <path d="M -10 -40 Q 0 -30 10 -40" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
            </g>
            <text x="330" y="430" textAnchor="middle" fill="#065F46" fontSize="28" fontWeight="800">
              Để kem mềm nhẹ vài giây
            </text>
          </g>

          <g transform="translate(1040, 200)" opacity={clamp01(p * 1.4)}>
            <rect x="0" y="0" width="660" height="475" rx="32" fill="#FFFFFF" stroke="#EF4444" strokeWidth="4.5" />
            <g transform="translate(330, 215)">
              <path d="M -110 20 Q 0 -75 110 20" fill="none" stroke="#FB7185" strokeWidth="18" strokeLinecap="round" />
              <rect x="-34" y="-16" width="68" height="68" rx="14" fill="#BAE6FD" stroke="#0284C7" strokeWidth="4" />
              <circle cx="0" cy="12" r="88" fill="none" stroke="#EF4444" strokeWidth="12" />
              <line x1="-62" y1="-50" x2="62" y2="74" stroke="#EF4444" strokeWidth="12" strokeLinecap="round" />
            </g>
            <text x="330" y="388" textAnchor="middle" fill="#B91C1C" fontSize="28" fontWeight="800">
              Tránh áp kem / đá lạnh
            </text>
            <text x="330" y="430" textAnchor="middle" fill="#475569" fontSize="25" fontWeight="700">
              trực tiếp lên vòm miệng trên
            </text>
          </g>
        </g>
      )}

      {/* STEP 2 (05:48–05:53): BOY standing relaxed holding his iced tea glass & smiling beside wooden side table */}
      {activeStep === 2 && (
        <g>
          <g transform="translate(540, 445)">
            <rect x="-240" y="-215" width="480" height="430" rx="34" fill="#FFFFFF" stroke="#10B981" strokeWidth="5" />
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

          {/* Wooden Side Table with empty coaster grounded on floor y = 790 (glass is held in BOY's hand) */}
          <WoodenSideTable x={1445} topY={678} floorY={790} width={170} />
          <ellipse cx={1445} cy={678} rx={36} ry={6} fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />

          {/* Happy BOY standing squarely on floor y = 790 holding his iced tea glass relaxedly */}
          <SharedStickman
            x={1210}
            y={674}
            scale={1.02}
            role="BOY"
            facing="LEFT"
            pose="HOLD_DRINK_PAUSE"
            expression="PROUD"
            drinkFillPct={0.75}
            frame={frame}
            uid="nd15_s2_boy"
          />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 16. NUOCDA_HAPPY_SUMMER_ENJOY
//     - Steps 0, 1, 2 (06:07–06:24, b60..b62): Breezy Afternoon Porch
//       * DELETED green overlay box "Nhiệt độ vòm miệng ổn định 37°C"
//       * DELETED bottom pill "Hiểu cơ thể, tận hưởng mùa hè trọn vẹn"
//       * REAL wooden chairs with legs firmly on porch floor (y = 805) under BOTH
//         BOY and GRANDPA — zero floating characters!
//       * NO upside-down ice cream cone balancing on tip: BOY holds his iced tea
//         glass in hand & GRANDPA holds his ice cream cone in hand!
//     - Step 3 (05:55, b58) & Step 4 (06:02, b59): Sunny Afternoon Countryside Yard
//       * Step 3: BOY directly holds & sips small iced tea glass ("Uống chậm mát quá!")
//       * Step 4: GRANDPA stands close to BOY & physically pats BOY's shoulder!
// ============================================================================
export const NuocDaHappySummerEnjoyVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  // STEPS 3 & 4: Afternoon Countryside Yard (Bug #13 — b58 sip & b59 real shoulder pat!)
  if (activeStep === 3 || activeStep === 4) {
    const cloudShift = (frame * 0.32) % 1920;
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="100%"
        height="100%"
        style={{ display: 'block', fontFamily: FONT }}
      >
        <defs>
          <linearGradient id="nd16_yardSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="55%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
          <linearGradient id="nd16_yardGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Warm Afternoon Countryside Yard Backdrop */}
        <rect x="0" y="0" width="1920" height="720" fill="url(#nd16_yardSky)" />

        {/* Soft Afternoon Sun */}
        <circle cx="290" cy="175" r="118" fill="#FEF08A" opacity="0.35" />
        <circle cx="290" cy="175" r="56" fill="#FDE047" stroke="#F59E0B" strokeWidth="4" />

        {/* Gentle drifting clouds */}
        <g opacity="0.88" transform={`translate(${-cloudShift * 0.2}, 0)`}>
          <path d="M 520 195 C 550 155 620 150 665 175 C 705 142 780 148 815 182 C 855 170 895 186 905 208 L 520 208 Z" fill="#FFFFFF" />
          <path d="M 1180 160 C 1210 125 1275 122 1318 144 C 1358 115 1430 120 1465 150 C 1500 138 1538 154 1546 174 L 1180 174 Z" fill="#FFFFFF" />
        </g>

        {/* Green Hills & Trees */}
        <path d="M 0 605 Q 420 520 880 580 T 1920 555 L 1920 720 L 0 720 Z" fill="#4ADE80" />
        <path d="M 0 640 Q 520 580 1040 630 T 1920 615 L 1920 720 L 0 720 Z" fill="#22C55E" />

        {[
          { x: 165, y: 525, r: 66 },
          { x: 385, y: 548, r: 58 },
          { x: 1740, y: 515, r: 72 },
        ].map((t, idx) => (
          <g key={idx}>
            <rect x={t.x - 12} y={t.y + 18} width="24" height="165" fill="#78350F" stroke={INK} strokeWidth="3.5" />
            <circle cx={t.x} cy={t.y} r={t.r} fill="#15803D" stroke={INK} strokeWidth="4" />
            <circle cx={t.x - t.r * 0.52} cy={t.y + 18} r={t.r * 0.64} fill="#16A34A" stroke={INK} strokeWidth="3.5" />
            <circle cx={t.x + t.r * 0.52} cy={t.y + 18} r={t.r * 0.62} fill="#15803D" stroke={INK} strokeWidth="3.5" />
          </g>
        ))}

        {/* Cozy Wooden Garden Fence */}
        <g>
          <rect x="0" y="640" width="1920" height="14" fill="#B45309" stroke={INK} strokeWidth="3" />
          <rect x="0" y="676" width="1920" height="14" fill="#B45309" stroke={INK} strokeWidth="3" />
          {[90, 210, 330, 450, 570, 690, 810, 930, 1050, 1170, 1290, 1410, 1530, 1650, 1770].map((fx) => (
            <rect key={fx} x={fx} y="622" width="22" height="90" rx="4" fill="#D97706" stroke={INK} strokeWidth="3" />
          ))}
        </g>

        {/* Cozy Countryside Red-Roof House on Right */}
        <g transform="translate(1320, 405)">
          <rect x="26" y="108" width="335" height="202" fill="#FEF3C7" stroke={INK} strokeWidth="4.5" />
          <polygon points="0,115 194,10 388,115" fill="#DC2626" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <rect x="72" y="155" width="76" height="76" rx="4" fill="#38BDF8" stroke="#78350F" strokeWidth="5" />
          <line x1="110" y1="155" x2="110" y2="231" stroke="#78350F" strokeWidth="4" />
          <line x1="72" y1="193" x2="148" y2="193" stroke="#78350F" strokeWidth="4" />
          <rect x="218" y="168" width="84" height="142" rx="4" fill="#92400E" stroke={INK} strokeWidth="4.5" />
          <circle cx="234" cy="242" r="6" fill="#FDE047" />
        </g>

        {/* Flat Sandy Courtyard Ground (feet stand firmly at y = 800 <= 830) */}
        <rect x="0" y="710" width="1920" height="370" fill="url(#nd16_yardGround)" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="920" cy="804" rx="280" ry="18" fill="#78350F" opacity="0.16" />

        {/* STEP 3 (b58, 05:55): BOY holding & sipping small iced tea glass directly in hand! */}
        {activeStep === 3 && (
          <g>
            <SharedStickman
              x={670}
              y={682}
              scale={1.04}
              role="BOY"
              facing="RIGHT"
              pose="SIP_GLASS"
              expression="HAPPY"
              drinkFillPct={0.82}
              frame={frame}
              uid="nd16_s3_boy"
            />
            <ShortSpeechBubble x={670} y={445} text="Uống chậm mát quá!" tailDir="CENTER" />

            <SharedStickman
              x={1145}
              y={678}
              scale={1.08}
              role="GRANDPA"
              facing="LEFT"
              pose="IDLE"
              expression="HAPPY"
              frame={frame}
            />
          </g>
        )}

        {/* STEP 4 (b59, 06:02): GRANDPA close beside BOY physically patting BOY's shoulder! */}
        {activeStep === 4 && (
          <g>
            <SharedStickman
              x={842}
              y={682}
              scale={1.04}
              role="BOY"
              facing="RIGHT"
              pose="HOLD_DRINK_PAUSE"
              expression="PROUD"
              drinkFillPct={0.62}
              frame={frame}
              uid="nd16_s4_boy"
            />
            {/* Rendered AFTER BOY so Grandpa's patting hand lands squarely ON Boy's shoulder (x=847, y≈600)! */}
            <SharedStickman
              x={968}
              y={678}
              scale={1.08}
              role="GRANDPA"
              facing="LEFT"
              pose="PAT_SHOULDER"
              expression="PROUD"
              frame={frame}
            />
            {/* Gentle celebratory pat motion ticks right above shoulder contact */}
            <g transform="translate(848, 578)" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" opacity={0.45 + 0.5 * Math.abs(Math.sin(frame * 0.18))}>
              <line x1="-14" y1="-6" x2="-24" y2="-16" />
              <line x1="0" y1="-10" x2="0" y2="-22" />
              <line x1="14" y1="-6" x2="24" y2="-16" />
            </g>
            <ShortSpeechBubble x={1075} y={434} text="Chuẩn bài luôn cháu!" tailDir="LEFT" />
          </g>
        )}
      </svg>
    );
  }

  // STEPS 0, 1, 2 (06:07–06:24, b60..b62): Breezy Afternoon Porch — Clean Kass-Blox Storytelling!
  return (
    <svg
      viewBox="0 0 1920 1080"
      width="100%"
      height="100%"
      style={{ display: 'block', fontFamily: FONT }}
    >
      <defs>
        <radialGradient id="nd16_goldenLight" cx="85%" cy="15%" r="85%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#FDE047" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Breezy Afternoon Porch Backdrop (showTable=false so zero duplicate tables!) */}
      <SummerPorchBackdrop frame={frame} heatIntensity={0} timeOfDay="AFTERNOON" showTable={false} />

      {/* Grounded Floor Shadows on Tiled Porch Floor (y = 805 <= 830) */}
      <ellipse cx="682" cy="806" rx="76" ry="12" fill="#451A03" opacity="0.2" />
      <ellipse cx="960" cy="806" rx="150" ry="14" fill="#451A03" opacity="0.22" />
      <ellipse cx="1238" cy="806" rx="76" ry="12" fill="#451A03" opacity="0.2" />

      {/* REAL Wooden Porch Chair on LEFT (legs grounded on tiled porch floor at y = 805) */}
      <g>
        {/* Backrest post & slats */}
        <rect x="618" y="600" width="18" height="205" rx="4" fill="#92400E" stroke={INK} strokeWidth="3.8" />
        <rect x="614" y="616" width="26" height="22" rx="4" fill="#B45309" stroke={INK} strokeWidth="3.2" />
        <rect x="614" y="654" width="26" height="22" rx="4" fill="#B45309" stroke={INK} strokeWidth="3.2" />
        {/* Front chair leg */}
        <rect x="716" y="722" width="16" height="83" rx="3" fill="#92400E" stroke={INK} strokeWidth="3.6" />
        {/* Horizontal brace */}
        <rect x="636" y="760" width="80" height="10" fill="#78350F" stroke={INK} strokeWidth="2.8" />
        {/* Chair seat at y = 708 */}
        <rect x="614" y="706" width="124" height="18" rx="6" fill="#B45309" stroke={INK} strokeWidth="3.8" />
      </g>

      {/* REAL Wooden Porch Chair on RIGHT under GRANDPA (legs grounded on tiled porch floor at y = 805) */}
      <g>
        {/* Backrest post & slats */}
        <rect x="1284" y="600" width="18" height="205" rx="4" fill="#92400E" stroke={INK} strokeWidth="3.8" />
        <rect x="1280" y="616" width="26" height="22" rx="4" fill="#B45309" stroke={INK} strokeWidth="3.2" />
        <rect x="1280" y="654" width="26" height="22" rx="4" fill="#B45309" stroke={INK} strokeWidth="3.2" />
        {/* Front chair leg */}
        <rect x="1188" y="722" width="16" height="83" rx="3" fill="#92400E" stroke={INK} strokeWidth="3.6" />
        {/* Horizontal brace */}
        <rect x="1204" y="760" width="80" height="10" fill="#78350F" stroke={INK} strokeWidth="2.8" />
        {/* Chair seat at y = 708 */}
        <rect x="1182" y="706" width="124" height="18" rx="6" fill="#B45309" stroke={INK} strokeWidth="3.8" />
      </g>

      {/* Single Wooden Porch Table between Boy and Grandpa (legs grounded at y = 805) */}
      <g>
        <rect x="850" y="690" width="20" height="115" rx="4" fill="#92400E" stroke={INK} strokeWidth="3.8" />
        <rect x="1050" y="690" width="20" height="115" rx="4" fill="#92400E" stroke={INK} strokeWidth="3.8" />
        <rect x="870" y="752" width="180" height="12" fill="#78350F" stroke={INK} strokeWidth="3" />
        <rect x="824" y="668" width="272" height="24" rx="8" fill="#B45309" stroke={INK} strokeWidth="4" />
        {/* Small coaster on table — ZERO upside-down balancing ice cream cone! */}
        <ellipse cx="920" cy="668" rx="34" ry="5.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
      </g>

      {/* BOY: Seated solidly on left chair across Steps 0–2 holding his iced tea glass (sipping in Steps 0–1, smiling & nodding warmly with GRANDPA in Step 2) */}
      <SharedStickman
        x={682}
        y={706}
        scale={0.98}
        role="BOY"
        facing="RIGHT"
        pose="SIT_HOLD_DRINK"
        expression={activeStep === 2 ? 'PROUD' : 'HAPPY'}
        drinkFillPct={activeStep === 2 ? 0.72 : 0.78}
        frame={frame}
        uid="nd16_boy_s0"
      />

      {/* GRANDPA: Seated solidly on right wooden chair holding the colorful ice cream cone directly in hand! */}
      <SharedStickman
        x={1238}
        y={706}
        scale={1.0}
        role="GRANDPA"
        facing="LEFT"
        pose="SIT_HOLD_CONE"
        expression={activeStep === 2 ? 'PROUD' : 'HAPPY'}
        frame={frame}
      />

      {/* Step 0 Speech Bubble */}
      {activeStep === 0 && (
        <ShortSpeechBubble x={595} y={475} text="Mát rượi luôn ông ạ!" tailDir="RIGHT" />
      )}

      {/* Step 1 & 2: Warm Golden Afternoon Sunlight only — ZERO UI overlay boxes or bottom pills! */}
      {activeStep >= 1 && (
        <rect
          width="1920"
          height="1080"
          fill="url(#nd16_goldenLight)"
          opacity={activeStep === 1 ? clamp01(p * 0.85) : 1}
          pointerEvents="none"
        />
      )}
    </svg>
  );
};

// ============================================================================
// 17. NUOCDA_SUMMARY_3_RULES
//     - Fixed Bug #14 (06:32–06:37): Speech bubble "Thử ngay mẹo áp lưỡi nhé!"
//       now uses `tailDir="SIDE_LEFT"` aligned straight at BOY's smiling face!
//     - Stripped unnecessary bottom pill in Step 0
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
      <text x="960" y="128" textAnchor="middle" fill={INK} fontSize="42" fontWeight="800">
        TÓM TẮT 3 ĐIỀU CẦN NHỚ
      </text>

      {/* 3-Card Summary Layout (y = 185..535) */}
      {cards.map((card, idx) => (
        <g
          key={idx}
          transform={`translate(${card.cx}, ${360 + lerp(28, 0, card.appear)})`}
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

          <text x="0" y="56" textAnchor="middle" fill={INK} fontSize="34" fontWeight="800">
            {card.title}
          </text>
          <text x="0" y="106" textAnchor="middle" fill="#475569" fontSize="26" fontWeight="600">
            {card.sub}
          </text>
        </g>
      ))}

      {/* Step 1 (06:32–06:37): BOY waving with SIDE_LEFT speech bubble aiming straight at his face */}
      {activeStep >= 1 && (
        <g opacity={clamp01(p * 1.6)}>
          <ellipse cx="705" cy="816" rx="52" ry="9" fill="#0F172A" opacity="0.12" />
          <SharedStickman
            x={705}
            y={716}
            scale={0.86}
            role="BOY"
            facing="RIGHT"
            pose="HAPPY_WAVE"
            expression="HAPPY"
            frame={frame}
          />
          <ShortSpeechBubble
            x={1012}
            y={604}
            text="Thử ngay mẹo áp lưỡi nhé!"
            tailDir="SIDE_LEFT"
          />
        </g>
      )}
    </svg>
  );
};
