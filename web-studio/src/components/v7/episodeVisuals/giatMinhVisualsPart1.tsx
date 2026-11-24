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
  BedroomNightBackdrop,
} from './giatMinhSharedAssets';

/* ============================================================================
 * 1. GiatMinhBedroomFallJerkVisual (GIATMINH_BEDROOM_FALL_JERK, step 0..2)
 *    - step 0: Cậu bé nằm đắp chăn buồn ngủ ríu mắt trong phòng tối
 *    - step 1: Ảo giác hụt chân rơi tự do giữa khoảng không tối có tia tốc độ
 *    - step 2: Giật nảy người đá tung chăn trên giường, tim đập thình thịch
 * ============================================================================ */
export const GiatMinhBedroomFallJerkVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  if (activeStep === 1) {
    // Step 1: Free-fall abyss illusion with upward speed lines & receding cliff
    const fallY = lerp(390, 560, p) + Math.sin(t * 7) * 8;
    const cliffY = lerp(190, 85, p);
    const speedLines = [
      180, 290, 410, 540, 690, 1210, 1360, 1500, 1630, 1750,
    ];

    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <radialGradient id="gm1_abyssBg" cx="50%" cy="55%" r="65%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="55%" stopColor="#060b19" />
            <stop offset="100%" stopColor="#02040a" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#gm1_abyssBg)" />

        {/* Swirling vertigo depth rings */}
        {[180, 310, 450, 610].map((r, idx) => (
          <ellipse
            key={idx}
            cx="960"
            cy="640"
            rx={r + ((t * 90) % 140)}
            ry={(r + ((t * 90) % 140)) * 0.42}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            opacity={0.22 - idx * 0.04}
            strokeDasharray="18 16"
          />
        ))}

        {/* Receding dark cliff ledge at top where foot slipped */}
        <g transform={`translate(0, ${cliffY})`}>
          <path
            d="M0 -140 L760 -140 L820 0 L680 42 L0 42 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="5"
          />
          {/* Falling pebbles from cliff edge */}
          {[0, 1, 2, 3].map((k) => (
            <circle
              key={k}
              cx={805 + k * 28}
              cy={40 + ((t * 210 + k * 55) % 240)}
              r={7 - k}
              fill="#64748b"
            />
          ))}
        </g>

        {/* Upward rushing speed streaks */}
        <g stroke="#bae6fd" strokeLinecap="round">
          {speedLines.map((lx, idx) => {
            const sy = 1080 - ((frame * (24 + (idx % 4) * 5) + idx * 170) % 1180);
            const len = 110 + (idx % 3) * 48;
            return (
              <line
                key={idx}
                x1={lx}
                y1={sy}
                x2={lx}
                y2={sy + len}
                strokeWidth={idx % 2 === 0 ? 4.5 : 3}
                opacity={0.55}
              />
            );
          })}
        </g>

        {/* Boy tumbling in free-fall */}
        <SharedStickman
          x={960}
          y={fallY}
          scale={1.32}
          role="BOY"
          facing="RIGHT"
          pose="FALLING"
          expression="SHOCKED"
          frame={frame}
          rotationDeg={-18 + Math.sin(t * 5) * 7}
        />

        <ShortSpeechBubble x={960} y={fallY - 255} text="Á! Hụt chân rơi!" tailDir="CENTER" />
        <CleanLabel
          x={960}
          y={815}
          text="Ảo giác bước hụt chân rơi xuống vực sâu"
          bg="#0f172a"
          color="#bae6fd"
          border="#38bdf8"
          fontSize={28}
        />
      </svg>
    );
  }

  // Step 0 (drowsy tucked in bed) & Step 2 (sudden hypnic jerk kicking blanket + pounding heart)
  const isJerk = activeStep >= 2;
  const kickLift = isJerk ? lerp(28, 95, clamp01(p * 1.8)) + Math.sin(t * 9) * 8 : 0;
  const heartScale = 1 + Math.abs(Math.sin(t * 9.5)) * 0.24;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <BedroomNightBackdrop
        frame={frame}
        mode="NIGHT"
        clockText="23:18"
        lampOn={false}
        showBed={true}
      />

      {/* Boy lying on mattress (head on pillow around x=470, hips at x=640, y=585) */}
      <SharedStickman
        x={645}
        y={isJerk ? 568 : 586}
        scale={1.22}
        role="BOY"
        facing="RIGHT"
        pose={isJerk ? 'JERK_AWAKE' : 'SLEEP_BED'}
        expression={isJerk ? 'SHOCKED' : p > 0.55 ? 'SLEEPING' : 'SLEEPY'}
        frame={frame}
      />

      {/* Cozy duvet blanket over Boy (tucked smoothly in step 0, kicked up in step 2) */}
      {isJerk ? (
        <g transform={`translate(0, ${-kickLift * 0.55})`}>
          <path
            d={`M545 595 Q720 ${465 - kickLift * 0.6} 935 ${505 - kickLift * 0.45} L985 635 Q760 600 545 638 Z`}
            fill="#2563eb"
            stroke={INK}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Motion shock arcs around kicked foot & shoulders */}
          <g fill="none" stroke="#fde047" strokeWidth="5" strokeLinecap="round">
            <path d="M420 390 L388 356 M468 368 L458 322 M522 378 L538 334" />
            <path d="M840 435 Q885 405 920 442" />
            <path d="M860 398 Q912 365 952 410" />
          </g>
        </g>
      ) : (
        <path
          d={`M528 ${576 + Math.sin(t * 1.8) * 2.5} Q730 ${548 + Math.sin(t * 1.8) * 3} 995 578 L1005 648 L522 648 Z`}
          fill="#2563eb"
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      )}

      {/* Step 0: Gentle floating sleep bubbles */}
      {activeStep === 0 ? (
        <g>
          {[0, 1, 2].map((i) => {
            const floatY = ((t * 28 + i * 34) % 96);
            const op = Math.sin((floatY / 96) * Math.PI);
            return (
              <circle
                key={i}
                cx={465 + i * 26 + Math.sin(t * 2 + i) * 8}
                cy={415 - floatY}
                r={9 + i * 4}
                fill="#bae6fd"
                fillOpacity={0.35 * op}
                stroke="#7dd3fc"
                strokeWidth="2.5"
                opacity={op}
              />
            );
          })}
          <ShortSpeechBubble x={540} y={335} text="Buồn ngủ ríu mắt..." tailDir="LEFT" />
        </g>
      ) : null}

      {/* Step 2: Pounding heart + pulse rings + speech bubble */}
      {isJerk ? (
        <g>
          <g transform="translate(885, 285)">
            <circle
              cx="0"
              cy="0"
              r={68 + ((t * 85) % 55)}
              fill="none"
              stroke="#fb7185"
              strokeWidth="4"
              opacity={1 - ((t * 85) % 55) / 55}
            />
            <circle cx="0" cy="0" r="66" fill="#0f172a" fillOpacity="0.88" stroke="#f43f5e" strokeWidth="4.5" />
            <g transform={`scale(${heartScale})`}>
              <path
                d="M0 28 C-36 4 -42 -24 -20 -32 C-8 -36 0 -24 0 -16 C0 -24 8 -36 20 -32 C42 -24 36 4 0 28 Z"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            </g>
          </g>
          <ShortSpeechBubble x={535} y={310} text="Tim đập thình thịch!" tailDir="LEFT" />
          <CleanLabel
            x={960}
            y={822}
            text="Giật cơ lúc vào giấc (Hypnic Jerk) — Bật tỉnh hoàn toàn"
            bg="#fff1f2"
            color="#9f1239"
            border="#e11d48"
            fontSize={27}
          />
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 2. GiatMinhSleepBorderN1Visual (GIATMINH_SLEEP_BORDER_N1, step 0..3)
 *    - step 0: Thanh chuyển giao Thức -> Ngủ nông N1 (60-70% người từng gặp)
 *    - step 1: Đồng hồ < 1 giây + đồ thị nhịp tim nhảy vọt
 *    - step 2: Lóe sáng & cảnh hụt bậc cầu thang
 *    - step 3: Phóng to vào phòng điều khiển não bộ
 * ============================================================================ */
export const GiatMinhSleepBorderN1Visual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  if (activeStep === 3) {
    // Step 3: Zoom into the glowing Brain Control Room
    const zoomScale = lerp(0.92, 1.16, p);
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <radialGradient id="gm2_brainZoomBg" cx="50%" cy="46%" r="60%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="65%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1920" height="1080" fill="url(#gm2_brainZoomBg)" />

        <g transform={`translate(960, 455) scale(${zoomScale})`}>
          {/* Outer glowing focus rings */}
          {[330, 260, 195].map((r, i) => (
            <circle
              key={i}
              cx="0"
              cy="0"
              r={r}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeDasharray="14 12"
              opacity={0.28 + i * 0.12}
            />
          ))}

          {/* Stylized Side-Profile Head & Glowing Brain */}
          <path
            d="M-150 220 L-150 90 C-200 40 -205 -120 -110 -195 C-15 -265 145 -245 195 -140 C225 -75 215 15 170 68 L170 220 Z"
            fill="#1e293b"
            stroke="#7dd3fc"
            strokeWidth="6"
          />
          {/* Cerebral Cortex Lobes */}
          <path
            d="M-125 -45 C-145 -135 -65 -205 25 -195 C115 -185 165 -115 140 -35 C118 22 45 35 -15 24 C-65 35 -112 10 -125 -45 Z"
            fill="#f472b6"
            fillOpacity="0.88"
            stroke={INK}
            strokeWidth="5"
          />
          <path
            d="M-75 -115 Q-15 -145 45 -110 M-85 -65 Q-10 -85 75 -58 M-35 -165 Q20 -135 85 -145"
            fill="none"
            stroke="#be185d"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Highlighted Control Room Window inside Brainstem */}
          <rect
            x="-58"
            y="10"
            width="136"
            height="104"
            rx="18"
            fill="#0f172a"
            stroke="#fde047"
            strokeWidth="5"
          />
          {/* Control switches & indicators inside window */}
          <circle cx="-22" cy="46" r="13" fill="#ef4444" />
          <circle cx="32" cy="46" r="13" fill="#22c55e" />
          <rect x="-36" y="76" width="92" height="14" rx="7" fill="#38bdf8" opacity={0.6 + Math.sin(t * 6) * 0.35} />
        </g>

        <CleanLabel
          x={960}
          y={145}
          text="Bên trong Trung tâm Điều khiển Thân Não"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={30}
        />
        <CleanLabel
          x={960}
          y={820}
          text="Tại sao não đột ngột đánh thức cơ bắp ngay lúc sắp ngủ?"
          bg="#e0f2fe"
          color="#0c4a6e"
          border="#0284c7"
          fontSize={28}
        />
      </svg>
    );
  }

  const sliderX =
    activeStep === 0
      ? lerp(390, 960, clamp01(p * 1.25)) + Math.sin(t * 4) * 10
      : 960;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="gm2_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="gm2_stageBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1920" height="1080" fill="url(#gm2_bg)" />

      {/* Top Sleep Transition Spectrum Bar (Wake -> N1 Border -> Deep Sleep) */}
      <g transform="translate(0, 20)">
        <rect
          x="210"
          y="155"
          width="1500"
          height="68"
          rx="34"
          fill="url(#gm2_stageBar)"
          stroke="#e2e8f0"
          strokeWidth="5"
        />
        {/* Highlighted N1 Border Zone */}
        <rect
          x="760"
          y="143"
          width="400"
          height="92"
          rx="22"
          fill="none"
          stroke="#fde047"
          strokeWidth="5"
          strokeDasharray="12 8"
        />
        <text x="390" y="128" textAnchor="middle" fill="#fde68a" fontSize="26" fontWeight="800" fontFamily={FONT}>
          1. CÒN TỈNH TÁO
        </text>
        <text x="960" y="124" textAnchor="middle" fill="#fef08a" fontSize="28" fontWeight="800" fontFamily={FONT}>
          ⚡ RANH GIỚI NGỦ NÔNG (N1)
        </text>
        <text x="1530" y="128" textAnchor="middle" fill="#c7d2fe" fontSize="26" fontWeight="800" fontFamily={FONT}>
          3. NGỦ SÂU
        </text>

        {/* Moving pointer */}
        <g transform={`translate(${sliderX}, 189)`}>
          <circle cx="0" cy="0" r="26" fill="#ffffff" stroke={INK} strokeWidth="6" />
          <circle cx="0" cy="0" r="11" fill="#ef4444" />
        </g>
      </g>

      {activeStep === 0 ? (
        /* Step 0: Brainwave shift + 60-70% population stat card */
        <g>
          <rect
            x="240"
            y="320"
            width="1440"
            height="430"
            rx="28"
            fill="#0b1220"
            stroke="#334155"
            strokeWidth="4.5"
          />
          <text x="960" y="385" textAnchor="middle" fill="#e2e8f0" fontSize="28" fontWeight="700" fontFamily={FONT}>
            Sóng não đang dịu dần từ Tỉnh táo sang Thiu thiu ngủ (Giai đoạn N1)
          </text>
          {/* Animated EEG wave transitioning from fast ripples to slower N1 wave */}
          <path
            d={`M310 520 ${Array.from({ length: 52 }, (_, i) => {
              const x = 310 + i * 25;
              const freq = i < 22 ? 0.95 : 0.38;
              const amp = i < 22 ? 24 : 46;
              const y = 520 + Math.sin(i * freq - t * 6) * amp;
              return `L${x} ${y.toFixed(1)}`;
            }).join(' ')}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <CleanLabel
            x={960}
            y={675}
            text="60% – 70% dân số thế giới đều từng trải qua!"
            bg="#ecfdf5"
            color="#065f46"
            border="#10b981"
            fontSize={29}
          />
        </g>
      ) : activeStep === 1 ? (
        /* Step 1: Stopwatch < 1 second + Heart-rate spike chart */
        <g>
          {/* Left card: < 1 second stopwatch */}
          <rect x="210" y="315" width="640" height="460" rx="28" fill="#0b1220" stroke="#38bdf8" strokeWidth="4.5" />
          <g transform="translate(530, 505)">
            <circle cx="0" cy="0" r="118" fill="#f8fafc" stroke={INK} strokeWidth="7" />
            <rect x="-24" y="-144" width="48" height="22" rx="6" fill="#94a3b8" stroke={INK} strokeWidth="4" />
            <path d="M0 -98 A98 98 0 0 1 86 -46" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />
            <g transform={`rotate(${lerp(-85, 58, clamp01(p * 1.4))})`}>
              <line x1="0" y1="14" x2="0" y2="-84" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
            </g>
            <circle cx="0" cy="0" r="12" fill={INK} />
            <text x="0" y="64" textAnchor="middle" fill="#dc2626" fontSize="34" fontWeight="800" fontFamily={FONT}>
              &lt; 1 giây
            </text>
          </g>
          <CleanLabel x={530} y={715} text="Cú giật cực ngắn!" bg="#fef2f2" color="#991b1b" border="#ef4444" fontSize={26} />

          {/* Right card: Sudden heart rate spike */}
          <rect x="910" y="315" width="800" height="460" rx="28" fill="#0b1220" stroke="#f43f5e" strokeWidth="4.5" />
          <text x="1310" y="382" textAnchor="middle" fill="#fda4af" fontSize="28" fontWeight="800" fontFamily={FONT}>
            Nhịp tim &amp; hơi thở vọt lên tức thì
          </text>
          <polyline
            points="970,565 1060,565 1110,565 1145,530 1175,585 1215,395 1250,625 1290,445 1330,590 1375,475 1425,565 1640,565"
            fill="none"
            stroke="#fb7185"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <CleanLabel
            x={1310}
            y={715}
            text="65 → 108 nhịp/phút làm bạn nhớ rất rõ"
            bg="#fff1f2"
            color="#9f1239"
            border="#f43f5e"
            fontSize={26}
          />
        </g>
      ) : (
        /* Step 2: Sensory flash + Missing a stair step */
        <g>
          {/* Left panel: Sensory light flash in the mind */}
          <rect x="210" y="315" width="700" height="475" rx="28" fill="#0b1220" stroke="#fde047" strokeWidth="4.5" />
          <g transform="translate(560, 515)">
            <circle
              cx="0"
              cy="0"
              r={88 + Math.sin(t * 8) * 14}
              fill="#fef08a"
              fillOpacity="0.24"
            />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={Math.cos(rad) * 42}
                  y1={Math.sin(rad) * 42}
                  x2={Math.cos(rad) * (96 + Math.sin(t * 9) * 12)}
                  y2={Math.sin(rad) * (96 + Math.sin(t * 9) * 12)}
                  stroke="#fde047"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx="0" cy="0" r="32" fill="#fef9c3" stroke="#eab308" strokeWidth="4" />
          </g>
          <CleanLabel x={560} y={725} text="Tia sáng lóe trong đầu" bg="#fef9c3" color={INK} border="#eab308" fontSize={26} />

          {/* Right panel: Stepping off a staircase step */}
          <rect x="1010" y="315" width="700" height="475" rx="28" fill="#0b1220" stroke="#38bdf8" strokeWidth="4.5" />
          {/* Staircase */}
          <path
            d="M1070 540 L1240 540 L1240 625 L1410 625 L1410 715 L1640 715"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <SharedStickman
            x={1335}
            y={lerp(470, 515, clamp01(p * 1.4))}
            scale={0.95}
            role="BOY"
            facing="RIGHT"
            pose="FALLING"
            expression="SHOCKED"
            frame={frame}
            rotationDeg={12}
          />
          <CleanLabel x={1360} y={735} text="Giấc mơ chớp nhoáng: Hụt bậc thang!" bg="#e0f2fe" color="#0c4a6e" border="#0284c7" fontSize={25} />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 3. GiatMinhBrainstemHandoffVisual (GIATMINH_BRAINSTEM_HANDOFF, step 0..2)
 *    - step 0: Sơ đồ thân não: Đội Đánh Thức (công tắc đỏ chưa tắt hẳn) vs cơ bắp thả lỏng quá nhanh
 *    - step 1: Giằng co phóng tia xung điện vàng chạy dọc dây thần kinh xuống chân tay
 *    - step 2: Cơ chân giật mạnh bật tỉnh
 * ============================================================================ */
export const GiatMinhBrainstemHandoffVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const pulsePos = clamp01(p * 1.35);
  const redFlicker = 0.65 + Math.abs(Math.sin(t * 10)) * 0.35;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="gm3_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1920" height="1080" fill="url(#gm3_bg)" />

      {/* Left Zone: Brainstem Handoff Control Panel */}
      <g transform="translate(120, 115)">
        <rect x="0" y="0" width="760" height="690" rx="30" fill="#0f172a" stroke="#475569" strokeWidth="5" />
        <text x="380" y="64" textAnchor="middle" fill="#f8fafc" fontSize="30" fontWeight="800" fontFamily={FONT}>
          Bàn giao ca trong Thân Não (Brainstem)
        </text>

        {/* Team 1: Wakefulness System (Red switch flickering — NOT fully off) */}
        <g transform="translate(60, 115)">
          <rect x="0" y="0" width="640" height="195" rx="22" fill="#1e293b" stroke="#ef4444" strokeWidth="4.5" />
          <circle cx="72" cy="98" r="38" fill="#ef4444" opacity={redFlicker} stroke="#fecaca" strokeWidth="4" />
          <text x="140" y="76" fill="#fca5a5" fontSize="27" fontWeight="800" fontFamily={FONT}>
            ĐỘI ĐÁNH THỨC (Tỉnh táo)
          </text>
          <text x="140" y="122" fill="#e2e8f0" fontSize="23" fontWeight="600" fontFamily={FONT}>
            Công tắc đỏ vẫn nhấp nháy, chưa tắt hẳn!
          </text>
          {/* Toggle lever stuck halfway */}
          <rect x="495" y="68" width="108" height="54" rx="27" fill="#7f1d1d" stroke="#f87171" strokeWidth="4" />
          <circle cx={555 + Math.sin(t * 14) * 6} cy="95" r="21" fill="#fde047" />
        </g>

        {/* VS Spark in Step 1+ */}
        {activeStep >= 1 ? (
          <g transform="translate(380, 355)">
            <polygon
              points="-18,-36 14,-8 -4,-8 22,36 -18,4 0,4"
              fill="#fde047"
              stroke={INK}
              strokeWidth="3"
              transform={`scale(${1.25 + Math.sin(t * 12) * 0.15})`}
            />
          </g>
        ) : null}

        {/* Team 2: Sleep & Muscle Relaxation System (Dropping super fast) */}
        <g transform="translate(60, 395)">
          <rect x="0" y="0" width="640" height="195" rx="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="4.5" />
          <circle cx="72" cy="98" r="38" fill="#0284c7" stroke="#bae6fd" strokeWidth="4" />
          <text x="140" y="76" fill="#7dd3fc" fontSize="27" fontWeight="800" fontFamily={FONT}>
            ĐỘI NGỦ NGHỈ (Cơ bắp)
          </text>
          <text x="140" y="122" fill="#e2e8f0" fontSize="23" fontWeight="600" fontFamily={FONT}>
            Cơ bắp lại thả lỏng tụt dốc quá nhanh!
          </text>
          {/* Downward meter */}
          <rect x="515" y="42" width="36" height="112" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="3.5" />
          <rect x="521" y="116" width="24" height="32" rx="8" fill="#38bdf8" />
        </g>
      </g>

      {/* Right Zone: Full Body Neural Pathway from Brainstem -> Spine -> Leg Muscle */}
      <g transform="translate(950, 115)">
        <rect x="0" y="0" width="850" height="690" rx="30" fill="#0f172a" stroke="#475569" strokeWidth="5" />

        {/* Anatomical Silhouette + Glowing Brainstem + Spinal Nerve to Leg */}
        <g transform="translate(430, 390)">
          {/* Bed mattress line */}
          <rect x="-340" y="120" width="690" height="58" rx="18" fill="#334155" stroke="#64748b" strokeWidth="4" />
          <ellipse cx="-245" cy="108" rx="58" ry="22" fill="#bae6fd" stroke={INK} strokeWidth="3.5" />

          {/* Boy on bed */}
          <SharedStickman
            x={-75}
            y={activeStep === 2 ? 96 : 112}
            scale={1.25}
            role="BOY"
            facing="RIGHT"
            pose={activeStep === 2 ? 'JERK_AWAKE' : 'SLEEP_BED'}
            expression={activeStep === 2 ? 'SHOCKED' : 'SLEEPING'}
            frame={frame}
          />

          {/* Glowing Brainstem Node + Nerve Path along spine & leg */}
          <circle cx="-215" cy="72" r="18" fill="#f43f5e" stroke="#fef08a" strokeWidth="4" />
          <path
            d={
              activeStep === 2
                ? 'M-215 72 C-165 82 -115 92 -75 96 L-12 32 L58 -12'
                : 'M-215 72 C-165 92 -115 106 -75 112 L-4 102 L68 118'
            }
            fill="none"
            stroke={activeStep >= 1 ? '#fde047' : '#38bdf8'}
            strokeWidth={activeStep >= 1 ? 6 : 4}
            strokeDasharray={activeStep >= 1 ? 'none' : '10 8'}
            strokeLinecap="round"
          />

          {/* Step 1: Bright golden electric impulse racing down nerve */}
          {activeStep === 1 ? (
            <g
              transform={`translate(${lerp(-215, 62, pulsePos)}, ${lerp(
                72,
                114,
                pulsePos
              )})`}
            >
              <circle cx="0" cy="0" r="26" fill="#fde047" fillOpacity="0.4" />
              <polygon
                points="-12,-24 10,-4 -2,-4 14,24 -12,2 0,2"
                fill="#fef08a"
                stroke={INK}
                strokeWidth="2.5"
              />
            </g>
          ) : null}

          {/* Step 2: Muscle contraction burst at leg */}
          {activeStep === 2 ? (
            <g transform="translate(55, -24)">
              <circle cx="0" cy="0" r="38" fill="#fde047" fillOpacity="0.32" />
              <path
                d="M-28 -18 L-48 -36 M8 -28 L18 -54 M32 -8 L58 -18"
                stroke="#fde047"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>
          ) : null}
        </g>

        <text x="425" y="64" textAnchor="middle" fill="#fde047" fontSize="29" fontWeight="800" fontFamily={FONT}>
          {activeStep === 0
            ? 'Hai hệ thống lệch nhịp trong tích tắc'
            : activeStep === 1
              ? 'Xung điện vàng phóng thẳng dọc tủy sống!'
              : 'Cơ chân co giật mạnh — Đánh thức tức thì!'}
        </text>
      </g>

      <CleanLabel
        x={960}
        y={842}
        text={
          activeStep === 0
            ? 'Lỗi bàn giao ca giữa trung tâm Tỉnh táo và trung tâm Ngủ nghỉ'
            : activeStep === 1
              ? 'Thân não bắn nhầm 1 tia lệnh vận động xuống tay chân'
              : 'Cơ bắp nảy mạnh 1 nhịp rồi trở lại bình thường ngay'
        }
        bg="#fef9c3"
        color={INK}
        border="#eab308"
        fontSize={26}
      />
    </svg>
  );
};

/* ============================================================================
 * 4. GiatMinhPrimateTreeBranchVisual (GIATMINH_PRIMATE_TREE_BRANCH, step 0..3)
 *    - step 0: Rừng đêm cổ đại với tổ tiên linh trưởng ngủ trên cành cây cao
 *    - step 1: Thú săn mồi lảng vảng dưới đất
 *    - step 2: Cơ mềm nhũn sắp tuột khỏi cành cây
 *    - step 3: Não bật chuông báo động đỏ giật mình bám chặt cành kịp lúc
 * ============================================================================ */
export const GiatMinhPrimateTreeBranchVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);
  const p = clamp01(progress);

  const slipAngle = activeStep === 2 ? lerp(4, 28, clamp01(p * 1.4)) : 0;
  const slipDropY = activeStep === 2 ? lerp(0, 32, clamp01(p * 1.4)) : 0;
  const predatorX = 1180 + Math.sin(t * 1.6) * 65;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="gm4_jungleSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040b16" />
          <stop offset="55%" stopColor="#0f2439" />
          <stop offset="100%" stopColor="#06281e" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1920" height="1080" fill="url(#gm4_jungleSky)" />

      {/* Full prehistoric moon */}
      <circle cx="1580" cy="185" r="78" fill="#fef9c3" opacity="0.9" />
      <circle cx="1580" cy="185" r="118" fill="#fef08a" opacity="0.14" />

      {/* Distant jungle silhouettes */}
      <path d="M0 780 Q380 710 760 765 T1520 750 L1920 775 L1920 1080 L0 1080 Z" fill="#051b14" />

      {/* Giant Ancient Tree Trunk & High Horizontal Branch */}
      <g>
        <path
          d="M140 0 L360 0 L410 1080 L110 1080 Z"
          fill="#451a03"
          stroke={INK}
          strokeWidth="6"
        />
        {/* High sturdy branch at y ~ 365 */}
        <path
          d="M330 330 C640 315 1040 332 1420 355 C1445 362 1445 398 1415 405 C1030 395 640 392 340 420 Z"
          fill="#78350f"
          stroke={INK}
          strokeWidth="6"
        />
        {/* Canopy leaves */}
        {[380, 620, 910, 1190, 1410].map((lx, i) => (
          <ellipse
            key={i}
            cx={lx}
            cy={135 + (i % 2) * 35}
            rx="165"
            ry="72"
            fill={i % 2 === 0 ? '#064e3b' : '#065f46'}
            stroke={INK}
            strokeWidth="4"
          />
        ))}
      </g>

      {/* Step 1+: Prowling predator silhouette on dark jungle ground below */}
      {activeStep >= 1 ? (
        <g transform={`translate(${predatorX}, 748)`}>
          {/* Crouching big cat silhouette */}
          <path
            d="M-95 25 C-75 -18 -15 -22 45 -12 L88 -26 L108 -6 L92 14 L62 14 L68 58 L46 58 L38 22 L-42 22 L-54 58 L-76 58 L-68 24 C-112 22 -135 -4 -124 -22"
            fill="#020617"
            stroke="#334155"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Glowing amber predator eyes */}
          <circle cx="82" cy="-12" r="5.5" fill="#f59e0b" />
          <circle cx="96" cy="-11" r="5" fill="#f59e0b" />

          {activeStep === 1 ? (
            <CleanLabel
              x={0}
              y={-65}
              text="Thú săn mồi rình dưới gốc cây!"
              bg="#450a0a"
              color="#fecaca"
              border="#ef4444"
              fontSize={24}
            />
          ) : null}
        </g>
      ) : null}

      {/* Ancient Primate Ancestor on high branch (x=860, y=342) */}
      <g transform={`translate(860, ${342 + slipDropY}) rotate(${slipAngle})`}>
        {/* Curved primate tail */}
        <path
          d={
            activeStep === 3
              ? 'M-58 12 C-105 42 -92 92 -52 74 C-28 62 -32 34 -48 34'
              : 'M-58 8 C-115 -18 -135 45 -98 86'
          }
          fill="none"
          stroke="#92400e"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Primate body */}
        <ellipse cx="0" cy="-12" rx="64" ry="36" fill="#92400e" stroke={INK} strokeWidth="5" />
        {/* Primate head */}
        <g transform="translate(68, -24)">
          <circle cx="0" cy="0" r="34" fill="#92400e" stroke={INK} strokeWidth="4.5" />
          <circle cx="-8" cy="-28" r="11" fill="#78350f" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="8" cy="4" rx="22" ry="18" fill="#fed7aa" stroke={INK} strokeWidth="3" />
          {/* Eyes: closed in step 0..2, wide awake in step 3 */}
          {activeStep === 3 ? (
            <g>
              <circle cx="4" cy="-2" r="6" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
              <circle cx="6" cy="-2" r="3" fill={INK} />
              <circle cx="19" cy="-2" r="6" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
              <circle cx="21" cy="-2" r="3" fill={INK} />
              <ellipse cx="13" cy="12" rx="5" ry="6" fill="#ef4444" stroke={INK} strokeWidth="2.5" />
            </g>
          ) : (
            <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round">
              <path d="M0 -1 Q6 4 11 -1" />
              <path d="M15 -1 Q20 4 25 -1" />
              <path d="M8 11 Q14 15 20 11" />
            </g>
          )}
        </g>

        {/* Primate limbs: relaxed/slipping in step 2 vs tightly gripping branch in step 3 */}
        {activeStep === 2 ? (
          <g stroke="#78350f" strokeWidth="12" strokeLinecap="round" fill="none">
            <path d="M36 8 L54 58 L46 98" />
            <path d="M-32 10 L-22 62 L-30 102" />
          </g>
        ) : activeStep === 3 ? (
          <g stroke="#78350f" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Clamping tightly around branch! */}
            <path d="M36 6 L48 36 L22 52" />
            <path d="M-32 8 L-20 38 L-46 52" />
          </g>
        ) : (
          <g stroke="#78350f" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M34 8 L46 36 L34 54" />
            <path d="M-30 8 L-18 36 L-30 54" />
          </g>
        )}
      </g>

      {/* Step 2: Falling leaves & red downward danger arrows */}
      {activeStep === 2 ? (
        <g>
          <path
            d="M865 465 L865 575"
            stroke="#ef4444"
            strokeWidth="8"
            strokeDasharray="12 10"
          />
          <polygon points="865,598 845,566 885,566" fill="#ef4444" />
          <ShortSpeechBubble x={880} y={225} text="Cơ mềm nhũn → Sắp tuột cành!" tailDir="CENTER" />
        </g>
      ) : null}

      {/* Step 3: Red Brain Alarm Bell ringing -> instant grip reflex */}
      {activeStep === 3 ? (
        <g>
          <g transform={`translate(930, 195) rotate(${Math.sin(t * 24) * 14})`}>
            <circle cx="0" cy="0" r="54" fill="#ef4444" fillOpacity="0.25" />
            <path
              d="M-28 18 L28 18 L22 -10 C22 -28 -22 -28 -22 -10 Z"
              fill="#ef4444"
              stroke="#fef08a"
              strokeWidth="4"
            />
            <circle cx="0" cy="24" r="8" fill="#fde047" />
            <path d="M-42 -16 Q-56 0 -42 16 M42 -16 Q56 0 42 16" fill="none" stroke="#fde047" strokeWidth="4.5" strokeLinecap="round" />
          </g>
          <ShortSpeechBubble x={645} y={220} text="Giật mình bám chặt kịp lúc!" tailDir="RIGHT" />
        </g>
      ) : null}

      <CleanLabel
        x={960}
        y={835}
        text={
          activeStep === 0
            ? 'Giả thuyết Tiến hóa: Tổ tiên linh trưởng ngủ trên cành cây cao'
            : activeStep === 1
              ? 'Ngã xuống đất ban đêm là cực kỳ nguy hiểm trước thú dữ'
              : activeStep === 2
                ? 'Cơ thả lỏng quá nhanh = Tín hiệu cơ thể đang tuột khỏi cành'
                : 'Phản xạ giật cơ khẩn cấp giúp tổ tiên chụp lấy cành cây sống sót!'
        }
        bg="#fef9c3"
        color={INK}
        border="#d97706"
        fontSize={26}
      />
    </svg>
  );
};

/* ============================================================================
 * 5. GiatMinhBrainTestPingVisual (GIATMINH_BRAIN_TEST_PING, step 0..2)
 *    - step 0: So sánh vui nằm giường nệm êm vs công tắc cổ xưa trong não
 *    - step 1: Não bắn tín hiệu kiểm tra (test ping) xuống chân xem đã khóa cử động chưa
 *    - step 2: Chân đá nhẹ và não nửa tỉnh nửa mơ tự ghép khung cảnh rơi xuống vực
 * ============================================================================ */
export const GiatMinhBrainTestPingVisual: React.FC<EpisodeVisualProps> = ({
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
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <rect x="0" y="0" width="1920" height="1080" fill="#0f172a" />

        {/* Left Card: Modern Plush Bed */}
        <g transform="translate(150, 165)">
          <rect x="0" y="0" width="740" height="610" rx="30" fill="#1e293b" stroke="#38bdf8" strokeWidth="5" />
          <text x="370" y="68" textAnchor="middle" fill="#bae6fd" fontSize="30" fontWeight="800" fontFamily={FONT}>
            Thực tế: Giường nệm êm ái 100%
          </text>
          <rect x="95" y="380" width="550" height="88" rx="24" fill="#f8fafc" stroke={INK} strokeWidth="4.5" />
          <ellipse cx="175" cy="368" rx="58" ry="22" fill="#bae6fd" stroke={INK} strokeWidth="3.5" />
          <SharedStickman
            x={330}
            y={374}
            scale={1.15}
            role="BOY"
            facing="RIGHT"
            pose="SLEEP_BED"
            expression="SLEEPING"
            frame={frame}
          />
          <path d="M235 368 Q405 344 595 372 L605 435 L230 435 Z" fill="#38bdf8" stroke={INK} strokeWidth="4" />
          <CleanLabel x={370} y={530} text="An toàn trên nệm phẳng" bg="#e0f2fe" color="#075985" border="#0284c7" fontSize={25} />
        </g>

        {/* Right Card: Ancient Switch Inside Brain */}
        <g transform="translate(1030, 165)">
          <rect x="0" y="0" width="740" height="610" rx="30" fill="#1e293b" stroke="#f59e0b" strokeWidth="5" />
          <text x="370" y="68" textAnchor="middle" fill="#fde68a" fontSize="30" fontWeight="800" fontFamily={FONT}>
            Trong não: Công tắc triệu năm tuổi
          </text>
          {/* Cartoon Brain holding tree-branch warning sign */}
          <g transform={`translate(370, 295) scale(${1 + Math.sin(t * 3) * 0.03})`}>
            <ellipse cx="0" cy="0" rx="135" ry="98" fill="#f472b6" stroke={INK} strokeWidth="5.5" />
            <path d="M-85 -25 Q0 -65 85 -20 M-95 20 Q0 -15 95 22" fill="none" stroke="#be185d" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="-32" cy="-8" r="10" fill="#ffffff" stroke={INK} strokeWidth="3" />
            <circle cx="-30" cy="-8" r="4.5" fill={INK} />
            <circle cx="32" cy="-8" r="10" fill="#ffffff" stroke={INK} strokeWidth="3" />
            <circle cx="34" cy="-8" r="4.5" fill={INK} />
          </g>
          <ShortSpeechBubble x={370} y={155} text="Coi chừng ngã khỏi cây!" tailDir="CENTER" />
          <CleanLabel x={370} y={530} text="Chưa kịp cập nhật thời hiện đại!" bg="#fef3c7" color="#92400e" border="#f59e0b" fontSize={25} />
        </g>
      </svg>
    );
  }

  // Step 1 (Brain Test Ping down to foot) & Step 2 (Foot kicks + Dream bubble stitches cliff scene)
  const pingT = clamp01(p * 1.45);
  const isDreamStitch = activeStep >= 2;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#0b1220" />

      {/* Bed & Boy */}
      <g transform="translate(330, 560)">
        <rect x="0" y="75" width="840" height="92" rx="22" fill="#334155" stroke="#64748b" strokeWidth="4.5" />
        <ellipse cx="115" cy="60" rx="68" ry="25" fill="#bae6fd" stroke={INK} strokeWidth="4" />

        <SharedStickman
          x={335}
          y={isDreamStitch ? 56 : 70}
          scale={1.32}
          role="BOY"
          facing="RIGHT"
          pose={isDreamStitch ? 'JERK_AWAKE' : 'SLEEP_BED'}
          expression={isDreamStitch ? 'SHOCKED' : 'SLEEPING'}
          frame={frame}
        />

        {/* Cyan Test-Ping Nerve Line from Head (x=155, y=42) to Foot (x=485, y=68) */}
        <path
          d={
            isDreamStitch
              ? 'M155 38 C235 48 290 55 335 56 L410 -12 L485 -54'
              : 'M155 48 C235 62 290 68 335 70 L408 58 L485 76'
          }
          fill="none"
          stroke="#22d3ee"
          strokeWidth="5.5"
          strokeDasharray="12 8"
        />

        {!isDreamStitch ? (
          <g transform={`translate(${lerp(155, 485, pingT)}, ${lerp(48, 74, pingT)})`}>
            <circle cx="0" cy="0" r="24" fill="#22d3ee" fillOpacity="0.35" />
            <circle cx="0" cy="0" r="11" fill="#ecfeff" stroke="#0891b2" strokeWidth="3" />
          </g>
        ) : null}
      </g>

      {!isDreamStitch ? (
        <g>
          <ShortSpeechBubble x={520} y={395} text="Ping! Cơ đã khóa chưa?" tailDir="LEFT" />
          <CleanLabel
            x={960}
            y={825}
            text="Giả thuyết 2: Não gửi xung kiểm tra (Test Ping) trước khi vào giấc mơ"
            bg="#ecfeff"
            color="#155e75"
            border="#06b6d4"
            fontSize={27}
          />
        </g>
      ) : (
        /* Step 2: Thought cloud showing the brain instantly inventing a cliff-fall story */
        <g>
          {/* Thought cloud trail from Boy's head */}
          <circle cx="595" cy="445" r="12" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
          <circle cx="645" cy="395" r="19" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />

          {/* Dream Cloud Frame on upper-right */}
          <g transform="translate(1265, 345)">
            <rect
              x="-340"
              y="-205"
              width="680"
              height="390"
              rx="42"
              fill="#1e293b"
              stroke="#fde047"
              strokeWidth="6"
            />
            {/* Mini cliff + falling stickman inside dream cloud */}
            <path d="M-334 -20 L-95 -20 L-65 180 L-334 180 Z" fill="#334155" />
            <SharedStickman
              x={85}
              y={10 + Math.sin(t * 6) * 12}
              scale={0.86}
              role="BOY"
              facing="RIGHT"
              pose="FALLING"
              expression="SHOCKED"
              frame={frame}
              rotationDeg={-16}
            />
            <text x="0" y="-145" textAnchor="middle" fill="#fef08a" fontSize="27" fontWeight="800" fontFamily={FONT}>
              Não nửa tỉnh nửa mơ tự dựng cảnh rơi!
            </text>
          </g>

          <CleanLabel
            x={960}
            y={825}
            text="Cơ chưa khóa nên chân đá nhẹ → Não ghép ngay giấc mơ hụt chân hợp lý!"
            bg="#fef9c3"
            color={INK}
            border="#eab308"
            fontSize={26}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 6. GiatMinhCulpritFatigueVisual (GIATMINH_CULPRIT_FATIGUE, step 0..1)
 *    - step 0: Đồng hồ 1 giờ sáng, cậu bé ngồi bàn học mắt thâm quầng kiệt sức
 *    - step 1: Đổ ập xuống giường rơi vào giấc quá gấp làm đường chuyển giao bị xóc mạnh
 * ============================================================================ */
export const GiatMinhCulpritFatigueVisual: React.FC<EpisodeVisualProps> = ({
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
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <rect x="0" y="0" width="1920" height="1080" fill="#0b1120" />
        <rect x="0" y="750" width="1920" height="330" fill="#291d16" stroke={INK} strokeWidth="4" />

        {/* Wall Analog + Digital Clock showing 01:00 AM */}
        <g transform="translate(420, 235)">
          <circle cx="0" cy="0" r="96" fill="#f8fafc" stroke={INK} strokeWidth="7" />
          {/* 1 o'clock hands */}
          <line x1="0" y1="0" x2="28" y2="-46" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          <line x1="0" y1="0" x2="0" y2="-74" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="0" cy="0" r="8" fill={INK} />
          <rect x="-78" y="114" width="156" height="44" rx="12" fill="#ef4444" stroke={INK} strokeWidth="3.5" />
          <text x="0" y="144" textAnchor="middle" fill="#ffffff" fontSize="25" fontWeight="800" fontFamily={FONT}>
            01:05 SÁNG
          </text>
        </g>

        {/* Low Body Energy Battery (5%) */}
        <g transform="translate(1460, 235)">
          <rect x="-130" y="-44" width="248" height="88" rx="18" fill="#1e293b" stroke="#94a3b8" strokeWidth="5" />
          <rect x="118" y="-20" width="16" height="40" rx="5" fill="#94a3b8" />
          <rect
            x="-116"
            y="-30"
            width="34"
            height="60"
            rx="8"
            fill="#ef4444"
            opacity={0.5 + Math.abs(Math.sin(t * 6)) * 0.5}
          />
          <text x="5" y="10" textAnchor="middle" fill="#fca5a5" fontSize="28" fontWeight="800" fontFamily={FONT}>
            Pin: 5%
          </text>
          <text x="0" y="80" textAnchor="middle" fill="#cbd5e1" fontSize="23" fontWeight="700" fontFamily={FONT}>
            Cơ thể kiệt sức
          </text>
        </g>

        {/* Study Chair + Boy exhausted at desk */}
        <g>
          <rect x="735" y="650" width="120" height="20" rx="6" fill="#475569" stroke={INK} strokeWidth="4" />
          <line x1="755" y1="670" x2="748" y2="765" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <line x1="835" y1="670" x2="842" y2="765" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        </g>

        <SharedStickman
          x={790}
          y={640}
          scale={1.25}
          role="BOY"
          facing="RIGHT"
          pose="SIT_DESK"
          expression="EXHAUSTED"
          frame={frame}
        />

        {/* Study Desk, Stack of Books & Bright Desk Lamp */}
        <g>
          <polygon points="1085,430 1165,430 1245,605 900,605" fill="#fef08a" opacity="0.22" />
          <rect x="870" y="600" width="430" height="26" rx="8" fill="#92400e" stroke={INK} strokeWidth="4.5" />
          <rect x="900" y="626" width="24" height="140" fill="#78350f" stroke={INK} strokeWidth="4" />
          <rect x="1246" y="626" width="24" height="140" fill="#78350f" stroke={INK} strokeWidth="4" />
          {/* Books stack */}
          <rect x="1030" y="576" width="110" height="24" rx="4" fill="#3b82f6" stroke={INK} strokeWidth="3.5" />
          <rect x="1040" y="554" width="98" height="22" rx="4" fill="#f59e0b" stroke={INK} strokeWidth="3.5" />
          {/* Desk lamp */}
          <rect x="1175" y="586" width="64" height="14" rx="6" fill="#334155" stroke={INK} strokeWidth="3.5" />
          <path d="M1208 586 L1228 475 L1145 435" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
          <path d="M1105 445 L1165 415 L1180 450 Z" fill="#facc15" stroke={INK} strokeWidth="4" />
        </g>

        <ShortSpeechBubble x={770} y={375} text="Mắt díp cứng lại rồi..." tailDir="LEFT" />
        <CleanLabel
          x={960}
          y={830}
          text="Thủ phạm #1: Thức quá khuya và để cơ thể thiếu ngủ kiệt sức"
          bg="#fef2f2"
          color="#991b1b"
          border="#ef4444"
          fontSize={28}
        />
      </svg>
    );
  }

  // Step 1: Crashing straight into sleep -> steep jagged sleep descent curve
  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#0f172a" />

      {/* Left: Boy crashing onto bed */}
      <g transform="translate(130, 155)">
        <rect x="0" y="0" width="740" height="610" rx="28" fill="#1e293b" stroke="#475569" strokeWidth="5" />
        <text x="370" y="65" textAnchor="middle" fill="#f8fafc" fontSize="29" fontWeight="800" fontFamily={FONT}>
          Đổ ập xuống giường vì kiệt sức
        </text>
        <rect x="90" y="385" width="560" height="86" rx="22" fill="#e2e8f0" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="170" cy="370" rx="58" ry="22" fill="#bae6fd" stroke={INK} strokeWidth="3.5" />
        <SharedStickman
          x={340}
          y={lerp(330, 380, clamp01(p * 2))}
          scale={1.18}
          role="BOY"
          facing="RIGHT"
          pose="SLEEP_BED"
          expression="EXHAUSTED"
          frame={frame}
        />
        <CleanLabel x={370} y={532} text="Vừa đặt lưng đã sập nguồn!" bg="#ffedd5" color="#9a3412" border="#f97316" fontSize={25} />
      </g>

      {/* Right: Smooth Sleep Ramp vs Steep Exhausted Plunge */}
      <g transform="translate(940, 155)">
        <rect x="0" y="0" width="850" height="610" rx="28" fill="#1e293b" stroke="#ef4444" strokeWidth="5" />
        <text x="425" y="65" textAnchor="middle" fill="#fca5a5" fontSize="29" fontWeight="800" fontFamily={FONT}>
          Đồ thị Chuyển giao vào Giấc ngủ
        </text>

        {/* Axes */}
        <line x1="95" y1="130" x2="95" y2="465" stroke="#94a3b8" strokeWidth="4" />
        <line x1="95" y1="465" x2="770" y2="465" stroke="#94a3b8" strokeWidth="4" />

        {/* Normal gentle green curve */}
        <path
          d="M110 165 C290 175 430 390 735 425"
          fill="none"
          stroke="#4ade80"
          strokeWidth="5"
          strokeDasharray="14 10"
        />
        <text x="595" y="375" fill="#86efac" fontSize="22" fontWeight="700" fontFamily={FONT}>
          Ngủ đủ giấc (Êm ái)
        </text>

        {/* Steep jagged plunge (Fatigue) */}
        <path
          d="M110 165 L235 180 L285 430 L325 315 L368 440 L735 440"
          fill="none"
          stroke="#ef4444"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Shock star at the bottom of the plunge */}
        <circle cx="325" cy="315" r={18 + Math.sin(t * 10) * 5} fill="#fde047" stroke="#dc2626" strokeWidth="4" />
        <text x="335" y="275" fill="#fef08a" fontSize="24" fontWeight="800" fontFamily={FONT}>
          ⚡ Xóc thần kinh → Giật nảy!
        </text>
      </g>

      <CleanLabel
        x={960}
        y={835}
        text="Não rơi vào giấc quá gấp khiến quá trình bàn giao bị xóc mạnh!"
        bg="#fef9c3"
        color={INK}
        border="#eab308"
        fontSize={27}
      />
    </svg>
  );
};
