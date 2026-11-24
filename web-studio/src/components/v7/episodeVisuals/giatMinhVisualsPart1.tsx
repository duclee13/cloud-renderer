import React from 'react';
import type { EpisodeVisualProps } from './index';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  CleanLabel,
  ShortSpeechBubble,
  CozyBedBlanket,
  SharedStickman,
  BedroomNightBackdrop,
} from './giatMinhSharedAssets';

/* ============================================================================
 * 1. GiatMinhBedroomFallJerkVisual (GIATMINH_BEDROOM_FALL_JERK, step 0..2)
 *    - step 0: Cậu bé nằm tựa gối tự nhiên đắp chăn buồn ngủ ríu mắt trong phòng tối
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
    const fallY = lerp(380, 545, p) + Math.sin(t * 7) * 8;
    const cliffY = lerp(185, 80, p);
    const speedLines = [180, 290, 410, 540, 690, 1210, 1360, 1500, 1630, 1750];

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

        {[180, 310, 450, 610].map((r, idx) => (
          <ellipse
            key={idx}
            cx="960"
            cy="630"
            rx={r + ((t * 90) % 140)}
            ry={(r + ((t * 90) % 140)) * 0.42}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            opacity={0.22 - idx * 0.04}
            strokeDasharray="18 16"
          />
        ))}

        <g transform={`translate(0, ${cliffY})`}>
          <path
            d="M0 -140 L760 -140 L820 0 L680 42 L0 42 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="5"
          />
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

        <SharedStickman
          x={960}
          y={fallY}
          scale={1.3}
          role="BOY"
          facing="RIGHT"
          pose="FALLING"
          expression="SHOCKED"
          frame={frame}
          rotationDeg={-16 + Math.sin(t * 5) * 6}
          limbColor="#e2e8f0"
        />

        <ShortSpeechBubble x={960} y={fallY - 250} text="Á! Hụt chân rơi!" tailDir="CENTER" />
        <CleanLabel
          x={960}
          y={810}
          text="Ảo giác bước hụt chân rơi xuống vực sâu"
          bg="#0f172a"
          color="#bae6fd"
          border="#38bdf8"
          fontSize={28}
        />
      </svg>
    );
  }

  const isJerk = activeStep >= 2;
  const kickLift = isJerk ? lerp(32, 95, clamp01(p * 1.8)) + Math.sin(t * 9) * 8 : 0;
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

      {/* Boy lying naturally propped on pillow (head at ~485,512 at -12°, neck joined under blanket) */}
      <SharedStickman
        x={638}
        y={isJerk ? 566 : 580}
        scale={1.2}
        role="BOY"
        facing="RIGHT"
        pose={isJerk ? 'JERK_AWAKE' : 'SLEEP_BED'}
        expression={isJerk ? 'SHOCKED' : p > 0.58 ? 'SLEEPING' : 'SLEEPY'}
        frame={frame}
      />

      {/* Soft curved quilt over torso & legs (kicked upward cleanly in step 2) */}
      <CozyBedBlanket
        x={548}
        y={isJerk ? 548 - kickLift * 0.35 : 566}
        width={420}
        height={84}
        fill="#2563eb"
        accentFill="#93c5fd"
        kickLift={kickLift}
        breathOffset={Math.sin(t * 1.8) * 2.5}
      />

      {isJerk ? (
        <g fill="none" stroke="#fde047" strokeWidth="5" strokeLinecap="round">
          <path d="M470 382 L442 346 M520 364 L512 318 M572 372 L588 332" />
          <path d="M815 445 Q862 415 898 450" />
        </g>
      ) : null}

      {/* Step 0: Sleep bubbles floating on far left of pillow + SpeechBubble shifted higher & right -> 0% overlap */}
      {activeStep === 0 ? (
        <g>
          {[0, 1, 2].map((i) => {
            const floatY = (t * 26 + i * 32) % 88;
            const op = Math.sin((floatY / 88) * Math.PI);
            return (
              <circle
                key={i}
                cx={432 - i * 16 + Math.sin(t * 2 + i) * 6}
                cy={452 - floatY - i * 14}
                r={8 + i * 4}
                fill="#bae6fd"
                fillOpacity={0.35 * op}
                stroke="#7dd3fc"
                strokeWidth="2.5"
                opacity={op}
              />
            );
          })}
          <ShortSpeechBubble x={685} y={325} text="Buồn ngủ ríu mắt..." tailDir="LEFT" />
        </g>
      ) : null}

      {/* Step 2: Pounding heart + pulse rings + speech bubble */}
      {isJerk ? (
        <g>
          <g transform="translate(930, 280)">
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
          <ShortSpeechBubble x={615} y={290} text="Tim đập thình thịch!" tailDir="LEFT" />
          <CleanLabel
            x={960}
            y={812}
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
    const zoomScale = lerp(0.92, 1.15, p);
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

          <path
            d="M-150 220 L-150 90 C-200 40 -205 -120 -110 -195 C-15 -265 145 -245 195 -140 C225 -75 215 15 170 68 L170 220 Z"
            fill="#1e293b"
            stroke="#7dd3fc"
            strokeWidth="6"
          />
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
          <circle cx="-22" cy="46" r="13" fill="#ef4444" />
          <circle cx="32" cy="46" r="13" fill="#22c55e" />
          <rect x="-36" y="76" width="92" height="14" rx="7" fill="#38bdf8" opacity={0.6 + Math.sin(t * 6) * 0.35} />
        </g>

        <CleanLabel
          x={960}
          y={135}
          text="Bên trong Trung tâm Điều khiển Thân Não"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={30}
        />
        <CleanLabel
          x={960}
          y={812}
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

        <g transform={`translate(${sliderX}, 189)`}>
          <circle cx="0" cy="0" r="26" fill="#ffffff" stroke={INK} strokeWidth="6" />
          <circle cx="0" cy="0" r="11" fill="#ef4444" />
        </g>
      </g>

      {activeStep === 0 ? (
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
        <g>
          <rect x="210" y="315" width="640" height="460" rx="28" fill="#0b1220" stroke="#38bdf8" strokeWidth="4.5" />
          <g transform="translate(530, 495)">
            <circle cx="0" cy="0" r="114" fill="#f8fafc" stroke={INK} strokeWidth="7" />
            <rect x="-24" y="-140" width="48" height="22" rx="6" fill="#94a3b8" stroke={INK} strokeWidth="4" />
            <path d="M0 -94 A94 94 0 0 1 82 -44" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />
            <g transform={`rotate(${lerp(-60, 52, clamp01(p * 1.4))})`}>
              <line x1="0" y1="10" x2="0" y2="-80" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
            </g>
            <circle cx="0" cy="0" r="12" fill={INK} />
            <text x="0" y="64" textAnchor="middle" fill="#dc2626" fontSize="33" fontWeight="800" fontFamily={FONT}>
              &lt; 1 giây
            </text>
          </g>
          <CleanLabel x={530} y={715} text="Cú giật cực ngắn!" bg="#fef2f2" color="#991b1b" border="#ef4444" fontSize={26} />

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
        <g>
          <rect x="210" y="315" width="700" height="475" rx="28" fill="#0b1220" stroke="#fde047" strokeWidth="4.5" />
          <g transform="translate(560, 515)">
            <circle cx="0" cy="0" r={88 + Math.sin(t * 8) * 14} fill="#fef08a" fillOpacity="0.24" />
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

          <rect x="1010" y="315" width="700" height="475" rx="28" fill="#0b1220" stroke="#38bdf8" strokeWidth="4.5" />
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
 * 2B. GiatMinhBodyWindDownVisual (GIATMINH_BODY_WIND_DOWN, step 0..2) — NEW for b17..b19
 *     - step 0 (b17): Giao diện "Chuyển chế độ Thức → Ngủ" với đồng hồ sinh học & trình tự nghỉ ngơi
 *     - step 1 (b18): 4 chỉ số trực quan hoạt họa mượt: Nhịp tim giảm, Hơi thở đều, Thân nhiệt hạ, Cơ thả lỏng
 *     - step 2 (b19): Phóng to vào Thân Não: "Trung tâm Đánh thức" tắt dần để "Trung tâm Giấc ngủ" tiếp quản
 * ============================================================================ */
export const GiatMinhBodyWindDownVisual: React.FC<EpisodeVisualProps> = ({
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
    const modeKnobX = lerp(-86, 86, clamp01(p * 1.3));
    const stepBadges = [
      '1. Nhịp tim chậm',
      '2. Hơi thở đều',
      '3. Hạ thân nhiệt',
      '4. Cơ thả lỏng',
    ];

    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="gm2b_bg0" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1920" height="1080" fill="url(#gm2b_bg0)" />

        <CleanLabel
          x={960}
          y={115}
          text="TRÌNH TỰ CHUYỂN CHẾ ĐỘ: TỈNH TÁO → NGHỈ NGƠI"
          bg="#e0f2fe"
          color="#075985"
          border="#0284c7"
          fontSize={29}
        />

        {/* Left Panel: Biological Circadian Clock + Mode Switch */}
        <g transform="translate(140, 185)">
          <rect x="0" y="0" width="760" height="445" rx="28" fill="#0b1220" stroke="#38bdf8" strokeWidth="4.5" />
          <text x="380" y="62" textAnchor="middle" fill="#bae6fd" fontSize="28" fontWeight="800" fontFamily={FONT}>
            Đồng hồ sinh học bật chế độ Ngủ
          </text>

          {/* Sun -> Moon Mode Toggle */}
          <g transform="translate(380, 195)">
            <rect x="-155" y="-48" width="310" height="96" rx="48" fill="#1e293b" stroke="#60a5fa" strokeWidth="4.5" />
            <text x="-95" y="10" textAnchor="middle" fill="#fde047" fontSize="24" fontWeight="800" fontFamily={FONT}>
              THỨC
            </text>
            <text x="95" y="10" textAnchor="middle" fill="#93c5fd" fontSize="24" fontWeight="800" fontFamily={FONT}>
              NGỦ
            </text>
            <circle cx={modeKnobX} cy="0" r="38" fill="#38bdf8" stroke="#ffffff" strokeWidth="4" />
          </g>

          <text x="380" y="345" textAnchor="middle" fill="#cbd5e1" fontSize="24" fontWeight="600" fontFamily={FONT}>
            Cơ thể hạ dần năng lượng theo đúng thứ tự
          </text>
        </g>

        {/* Right Panel: Boy closing eyes peacefully on pillow */}
        <g transform="translate(980, 185)">
          <rect x="0" y="0" width="800" height="445" rx="28" fill="#0b1220" stroke="#818cf8" strokeWidth="4.5" />
          <text x="400" y="62" textAnchor="middle" fill="#c7d2fe" fontSize="28" fontWeight="800" fontFamily={FONT}>
            Nhắm mắt bắt đầu vào giấc
          </text>

          <g transform="translate(115, 295)">
            <rect x="0" y="40" width="570" height="76" rx="20" fill="#f8fafc" stroke={INK} strokeWidth="4" />
            <ellipse
              cx="92"
              cy="18"
              rx="66"
              ry="26"
              transform="rotate(14 92 18)"
              fill="#bae6fd"
              stroke={INK}
              strokeWidth="3.5"
            />
            <SharedStickman
              x={245}
              y={34}
              scale={1.08}
              role="BOY"
              facing="RIGHT"
              pose="SLEEP_BED"
              expression="SLEEPING"
              frame={frame}
            />
            <CozyBedBlanket
              x={168}
              y={22}
              width={355}
              height={72}
              fill="#3b82f6"
              accentFill="#93c5fd"
              breathOffset={Math.sin(t * 1.8) * 2}
            />
          </g>
        </g>

        {/* Sequential 4-Step Pipeline Row */}
        <g transform="translate(0, 695)">
          {stepBadges.map((label, idx) => {
            const active = p * 4 >= idx * 0.75;
            const cx = 270 + idx * 460;
            return (
              <CleanLabel
                key={label}
                x={cx}
                y={0}
                text={label}
                bg={active ? '#ecfdf5' : '#1e293b'}
                color={active ? '#065f46' : '#94a3b8'}
                border={active ? '#10b981' : '#475569'}
                fontSize={24}
              />
            );
          })}
        </g>

        <CleanLabel
          x={960}
          y={812}
          text="Khi nhắm mắt ngủ, toàn bộ cơ thể giảm tốc theo một kịch bản nhịp nhàng"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={26}
        />
      </svg>
    );
  }

  if (activeStep === 1) {
    const bpm = Math.round(lerp(76, 58, clamp01(p * 1.2)));
    const tempVal = lerp(37.0, 36.4, clamp01(p * 1.2)).toFixed(1);
    const lungScale = 1 + Math.sin(t * 2.1) * 0.1;
    const muscleSag = lerp(6, 42, clamp01(p * 1.2));

    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <rect x="0" y="0" width="1920" height="1080" fill="#09111f" />

        <CleanLabel
          x={960}
          y={108}
          text="4 CHỈ SỐ SINH LÝ ĐỒNG LOẠT DỊU XUỐNG KHI VÀO GIẤC"
          bg="#ecfdf5"
          color="#065f46"
          border="#10b981"
          fontSize={28}
        />

        {/* Card 1 (Top-Left): Slowing Heart Rate (ECG spacing widens) */}
        <g transform="translate(130, 168)">
          <rect x="0" y="0" width="800" height="275" rx="26" fill="#0f172a" stroke="#34d399" strokeWidth="4.5" />
          <text x="48" y="54" fill="#a7f3d0" fontSize="27" fontWeight="800" fontFamily={FONT}>
            1. Nhịp tim chậm lại
          </text>
          <text x="752" y="54" textAnchor="end" fill="#6ee7b7" fontSize="28" fontWeight="800" fontFamily={FONT}>
            {bpm} nhịp/phút ↓
          </text>
          <polyline
            points="55,175 165,175 190,145 210,205 235,105 260,215 285,175 465,175 490,148 510,202 535,112 560,210 585,175 745,175"
            fill="none"
            stroke="#34d399"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Card 2 (Top-Right): Steady Deep Breathing */}
        <g transform="translate(990, 168)">
          <rect x="0" y="0" width="800" height="275" rx="26" fill="#0f172a" stroke="#38bdf8" strokeWidth="4.5" />
          <text x="48" y="54" fill="#bae6fd" fontSize="27" fontWeight="800" fontFamily={FONT}>
            2. Hơi thở đều đặn, êm sâu
          </text>
          <g transform={`translate(155, 168) scale(${lungScale})`}>
            <ellipse cx="-28" cy="0" rx="30" ry="48" fill="#0284c7" fillOpacity="0.45" stroke="#7dd3fc" strokeWidth="4" />
            <ellipse cx="28" cy="0" rx="30" ry="48" fill="#0284c7" fillOpacity="0.45" stroke="#7dd3fc" strokeWidth="4" />
            <line x1="0" y1="-58" x2="0" y2="-16" stroke="#bae6fd" strokeWidth="5" strokeLinecap="round" />
          </g>
          <path
            d={`M290 172 ${Array.from({ length: 24 }, (_, i) => {
              const x = 290 + i * 19;
              const y = 172 + Math.sin(i * 0.48 - t * 2.5) * 32;
              return `L${x} ${y.toFixed(1)}`;
            }).join(' ')}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        </g>

        {/* Card 3 (Bottom-Left): Slight Core Temperature Drop */}
        <g transform="translate(130, 472)">
          <rect x="0" y="0" width="800" height="275" rx="26" fill="#0f172a" stroke="#60a5fa" strokeWidth="4.5" />
          <text x="48" y="54" fill="#bfdbfe" fontSize="27" fontWeight="800" fontFamily={FONT}>
            3. Thân nhiệt hạ nhẹ
          </text>
          <text x="752" y="54" textAnchor="end" fill="#93c5fd" fontSize="28" fontWeight="800" fontFamily={FONT}>
            {tempVal}°C ❄️
          </text>
          {/* Horizontal thermometer */}
          <g transform="translate(95, 165)">
            <rect x="0" y="-22" width="560" height="44" rx="22" fill="#1e293b" stroke="#94a3b8" strokeWidth="4.5" />
            <rect
              x="8"
              y="-12"
              width={lerp(430, 275, clamp01(p * 1.2))}
              height="24"
              rx="12"
              fill="#38bdf8"
            />
            <circle cx="0" cy="0" r="34" fill="#0284c7" stroke="#e0f2fe" strokeWidth="4.5" />
          </g>
        </g>

        {/* Card 4 (Bottom-Right): Complete Muscle Relaxation */}
        <g transform="translate(990, 472)">
          <rect x="0" y="0" width="800" height="275" rx="26" fill="#0f172a" stroke="#a78bfa" strokeWidth="4.5" />
          <text x="48" y="54" fill="#ddd6fe" fontSize="27" fontWeight="800" fontFamily={FONT}>
            4. Toàn bộ cơ bắp thả lỏng
          </text>
          <text x="752" y="54" textAnchor="end" fill="#c4b5fd" fontSize="26" fontWeight="800" fontFamily={FONT}>
            Mềm dần 100%
          </text>
          {/* Relaxing muscle fiber curves */}
          <g transform="translate(110, 145)" fill="none" strokeLinecap="round">
            <path
              d={`M0 0 Q290 ${muscleSag} 580 0`}
              stroke="#a78bfa"
              strokeWidth="12"
            />
            <path
              d={`M25 28 Q290 ${28 + muscleSag} 555 28`}
              stroke="#818cf8"
              strokeWidth="8"
              opacity="0.8"
            />
          </g>
        </g>

        <CleanLabel
          x={960}
          y={812}
          text="Toàn thân buông lỏng êm ái để chuẩn bị bước sang giấc ngủ sâu"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={26}
        />
      </svg>
    );
  }

  // Step 2 (b19): Zoomed Brainstem Handoff between Wake Center (powering down) & Sleep Center (taking over)
  const wakeLevel = lerp(0.85, 0.16, clamp01(p * 1.25));
  const sleepLevel = lerp(0.2, 0.92, clamp01(p * 1.25));
  const batonX = lerp(690, 1230, clamp01(p * 1.25));

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#090f1d" />

      <CleanLabel
        x={960}
        y={110}
        text="BÊN TRONG THÂN NÃO: HAI ĐỘI NGŨ BÀN GIAO CA TRỰC"
        bg="#fef9c3"
        color={INK}
        border="#eab308"
        fontSize={29}
      />

      {/* Top Central Brain + Highlighted Brainstem Silhouette */}
      <g transform="translate(960, 265)">
        <ellipse cx="0" cy="-24" rx="132" ry="86" fill="#f472b6" fillOpacity="0.85" stroke={INK} strokeWidth="5" />
        <path
          d="M-78 -42 Q0 -75 78 -36 M-88 -2 Q0 -32 88 2"
          fill="none"
          stroke="#be185d"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Brainstem */}
        <path
          d="M-36 42 L36 42 L26 126 L-26 126 Z"
          fill="#fde047"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <text x="0" y="92" textAnchor="middle" fill={INK} fontSize="20" fontWeight="800" fontFamily={FONT}>
          THÂN NÃO
        </text>
      </g>

      {/* Left Station: Wakefulness Center (Turning OFF) */}
      <g transform="translate(150, 425)">
        <rect x="0" y="0" width="620" height="315" rx="28" fill="#1e293b" stroke="#f97316" strokeWidth="4.5" />
        <text x="310" y="64" textAnchor="middle" fill="#fdba74" fontSize="30" fontWeight="800" fontFamily={FONT}>
          TRUNG TÂM ĐÁNH THỨC
        </text>
        <text x="310" y="110" textAnchor="middle" fill="#cbd5e1" fontSize="23" fontWeight="600" fontFamily={FONT}>
          Hạ dần công suất để tắt nguồn nghỉ ca
        </text>
        {/* Power bar dropping */}
        <rect x="70" y="155" width="480" height="44" rx="22" fill="#0f172a" stroke="#64748b" strokeWidth="3.5" />
        <rect x="76" y="161" width={Math.max(36, 468 * wakeLevel)} height="32" rx="16" fill="#f97316" />
        <text x="310" y="258" textAnchor="middle" fill="#fed7aa" fontSize="26" fontWeight="800" fontFamily={FONT}>
          Năng lượng: {Math.round(wakeLevel * 100)}% ↓
        </text>
      </g>

      {/* Center Handoff Arrow + Moving Control Signal */}
      <g>
        <line x1="790" y1="582" x2="1130" y2="582" stroke="#475569" strokeWidth="8" strokeDasharray="14 10" />
        <polygon points="1145,582 1112,562 1112,602" fill="#34d399" />
        <g transform={`translate(${batonX}, 582)`}>
          <circle cx="0" cy="0" r="26" fill="#fef08a" stroke={INK} strokeWidth="4" />
        </g>
        <text x="960" y="535" textAnchor="middle" fill="#fef08a" fontSize="23" fontWeight="800" fontFamily={FONT}>
          BÀN GIAO
        </text>
      </g>

      {/* Right Station: Sleep Center (Taking Over) */}
      <g transform="translate(1150, 425)">
        <rect x="0" y="0" width="620" height="315" rx="28" fill="#1e293b" stroke="#34d399" strokeWidth="4.5" />
        <text x="310" y="64" textAnchor="middle" fill="#6ee7b7" fontSize="30" fontWeight="800" fontFamily={FONT}>
          TRUNG TÂM GIẤC NGỦ
        </text>
        <text x="310" y="110" textAnchor="middle" fill="#cbd5e1" fontSize="23" fontWeight="600" fontFamily={FONT}>
          Bật sáng tiếp quản quyền điều khiển đêm
        </text>
        <rect x="70" y="155" width="480" height="44" rx="22" fill="#0f172a" stroke="#64748b" strokeWidth="3.5" />
        <rect x="76" y="161" width={Math.max(36, 468 * sleepLevel)} height="32" rx="16" fill="#10b981" />
        <text x="310" y="258" textAnchor="middle" fill="#a7f3d0" fontSize="26" fontWeight="800" fontFamily={FONT}>
          Tiếp quản: {Math.round(sleepLevel * 100)}% ↑
        </text>
      </g>

      <CleanLabel
        x={960}
        y={812}
        text="Trung tâm Đánh thức tắt đi để Trung tâm Giấc ngủ lên nắm quyền"
        bg="#ecfdf5"
        color="#065f46"
        border="#10b981"
        fontSize={26}
      />
    </svg>
  );
};

/* ============================================================================
 * 3. GiatMinhBrainstemHandoffVisual (GIATMINH_BRAINSTEM_HANDOFF, step 0..2)
 *    - Left column: 2 boxes with strictly separated text column (left) & switch/slider column (right) — 0% overlap!
 *    - Right column: Upper half = zoomed Brain & Brainstem diagram with Red + Blue nuclei;
 *      Lower half = Boy lying naturally on bed receiving golden nerve impulse down to his leg!
 *    - Summary label strictly at y = 812 (<= 820)
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
  const redFlicker = 0.62 + Math.abs(Math.sin(t * 10)) * 0.38;

  // 2-segment nerve path inside Right Panel: Brainstem (455, 283) -> Hip (450, 534) -> Foot (585, 536)
  const impulseX =
    pulsePos < 0.65
      ? lerp(455, 425, pulsePos / 0.65)
      : lerp(450, 585, (pulsePos - 0.65) / 0.35);
  const impulseY =
    pulsePos < 0.65
      ? lerp(283, 534, pulsePos / 0.65)
      : lerp(534, 532, (pulsePos - 0.65) / 0.35);

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

      {/* ======================================================================
          LEFT PANEL: Two Strictly Partitioned Control Cards (0% text overlap!)
         ====================================================================== */}
      <g transform="translate(80, 105)">
        <rect x="0" y="0" width="810" height="655" rx="30" fill="#0f172a" stroke="#475569" strokeWidth="5" />
        <text x="405" y="58" textAnchor="middle" fill="#f8fafc" fontSize="29" fontWeight="800" fontFamily={FONT}>
          Lệch nhịp Bàn giao trong Thân Não
        </text>

        {/* Box 1: Đội Đánh Thức (Text x=32..515 | Divider x=535 | Switch x=555..715) */}
        <g transform="translate(35, 92)">
          <rect x="0" y="0" width="740" height="215" rx="22" fill="#1e293b" stroke="#ef4444" strokeWidth="4.5" />
          <circle cx="56" cy="108" r="32" fill="#ef4444" opacity={redFlicker} stroke="#fecaca" strokeWidth="3.5" />
          <text x="108" y="76" fill="#fca5a5" fontSize="26" fontWeight="800" fontFamily={FONT}>
            ĐỘI ĐÁNH THỨC
          </text>
          <text x="108" y="118" fill="#e2e8f0" fontSize="21" fontWeight="600" fontFamily={FONT}>
            Công tắc đỏ vẫn nhấp nháy,
          </text>
          <text x="108" y="150" fill="#fecaca" fontSize="21" fontWeight="700" fontFamily={FONT}>
            chưa kịp tắt nguồn hẳn!
          </text>

          {/* Dedicated Right Control Column */}
          <line x1="530" y1="24" x2="530" y2="191" stroke="#334155" strokeWidth="3" />
          <g transform="translate(635, 92)">
            <rect x="-64" y="-30" width="128" height="60" rx="30" fill="#7f1d1d" stroke="#f87171" strokeWidth="4" />
            <circle cx={24 + Math.sin(t * 14) * 6} cy="0" r="22" fill="#fde047" stroke={INK} strokeWidth="3" />
            <text x="0" y="62" textAnchor="middle" fill="#fca5a5" fontSize="19" fontWeight="800" fontFamily={FONT}>
              CHƯA TẮT
            </text>
          </g>
        </g>

        {/* Clash Bolt between Box 1 & Box 2 */}
        <g transform="translate(405, 345)">
          <polygon
            points="-16,-28 12,-6 -3,-6 18,28 -16,4 0,4"
            fill={activeStep >= 1 ? '#fde047' : '#64748b'}
            stroke={INK}
            strokeWidth="2.5"
            transform={`scale(${activeStep >= 1 ? 1.2 + Math.sin(t * 12) * 0.14 : 1})`}
          />
        </g>

        {/* Box 2: Đội Ngủ Nghỉ (Text x=32..515 | Divider x=535 | Slider x=555..715) */}
        <g transform="translate(35, 385)">
          <rect x="0" y="0" width="740" height="215" rx="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="4.5" />
          <circle cx="56" cy="108" r="32" fill="#0284c7" stroke="#bae6fd" strokeWidth="3.5" />
          <text x="108" y="76" fill="#7dd3fc" fontSize="26" fontWeight="800" fontFamily={FONT}>
            ĐỘI NGỦ NGHỈ (Cơ bắp)
          </text>
          <text x="108" y="118" fill="#e2e8f0" fontSize="21" fontWeight="600" fontFamily={FONT}>
            Toàn bộ cơ bắp lại buông
          </text>
          <text x="108" y="150" fill="#bae6fd" fontSize="21" fontWeight="700" fontFamily={FONT}>
            thả lỏng tụt dốc quá nhanh!
          </text>

          {/* Dedicated Right Control Column */}
          <line x1="530" y1="24" x2="530" y2="191" stroke="#334155" strokeWidth="3" />
          <g transform="translate(635, 88)">
            <rect x="-22" y="-58" width="44" height="116" rx="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="3.8" />
            <rect x="-14" y="18" width="28" height="32" rx="9" fill="#38bdf8" />
            <text x="0" y="88" textAnchor="middle" fill="#7dd3fc" fontSize="19" fontWeight="800" fontFamily={FONT}>
              TỤT NHANH ↓
            </text>
          </g>
        </g>
      </g>

      {/* ======================================================================
          RIGHT PANEL: Upper Zoomed Brain/Brainstem + Lower Bed Scene (Full Height!)
         ====================================================================== */}
      <g transform="translate(930, 105)">
        <rect x="0" y="0" width="910" height="655" rx="30" fill="#0f172a" stroke="#475569" strokeWidth="5" />
        <text x="455" y="56" textAnchor="middle" fill="#fde047" fontSize="28" fontWeight="800" fontFamily={FONT}>
          {activeStep === 0
            ? 'Thân não phát hiện cơ bắp tụt lực đột ngột'
            : activeStep === 1
              ? 'Xung điện vàng phóng dọc dây thần kinh xuống chân!'
              : 'Cơ chân giật nảy mạnh — Đánh thức tức thì!'}
        </text>

        {/* UPPER HALF: Zoomed Brain & Brainstem Diagram with Red + Blue Regions */}
        <g transform="translate(455, 185)">
          <rect
            x="-395"
            y="-105"
            width="790"
            height="215"
            rx="22"
            fill="#16213a"
            stroke="#334155"
            strokeWidth="3.5"
          />
          {/* Cerebral Cortex */}
          <ellipse cx="0" cy="-26" rx="126" ry="72" fill="#f472b6" fillOpacity="0.88" stroke={INK} strokeWidth="4.5" />
          <path
            d="M-74 -40 Q0 -68 74 -34 M-82 -6 Q0 -28 82 -2"
            fill="none"
            stroke="#be185d"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          {/* Brainstem housing 2 glowing centers */}
          <path
            d="M-46 28 L46 28 L34 98 L-34 98 Z"
            fill="#1e293b"
            stroke="#e2e8f0"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Red Wake Region (left of brainstem) */}
          <circle cx="-16" cy="62" r="15" fill="#ef4444" opacity={redFlicker} stroke="#fef08a" strokeWidth="3" />
          {/* Blue Sleep Region (right of brainstem) */}
          <circle cx="16" cy="62" r="15" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="3" />

          {/* Clean side callouts with leader lines */}
          <line x1="-32" y1="62" x2="-150" y2="62" stroke="#f87171" strokeWidth="3" strokeDasharray="6 5" />
          <text x="-162" y="69" textAnchor="end" fill="#fca5a5" fontSize="21" fontWeight="800" fontFamily={FONT}>
            Vùng Đánh Thức (Đỏ)
          </text>

          <line x1="32" y1="62" x2="150" y2="62" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 5" />
          <text x="162" y="69" textAnchor="start" fill="#7dd3fc" fontSize="21" fontWeight="800" fontFamily={FONT}>
            Vùng Ngủ Nghỉ (Xanh)
          </text>
        </g>

        {/* LOWER HALF: Boy Lying Naturally on Bed + Nerve Pathway */}
        <g transform="translate(155, 520)">
          <rect x="0" y="18" width="620" height="72" rx="20" fill="#334155" stroke="#64748b" strokeWidth="4" />
          <ellipse
            cx="102"
            cy="-2"
            rx="64"
            ry="24"
            transform="rotate(14 102 -2)"
            fill="#bae6fd"
            stroke={INK}
            strokeWidth="3.5"
          />

          <SharedStickman
            x={295}
            y={activeStep === 2 ? 4 : 14}
            scale={1.15}
            role="BOY"
            facing="RIGHT"
            pose={activeStep === 2 ? 'JERK_AWAKE' : 'SLEEP_BED'}
            expression={activeStep === 2 ? 'SHOCKED' : 'SLEEPING'}
            frame={frame}
            limbColor="#cbd5e1"
          />
        </g>

        {/* Luminous Nerve Tract from Upper Brainstem (445, 283) -> Spine -> Boy's Leg */}
        <path
          d={
            activeStep === 2
              ? 'M455 283 C430 375 385 465 450 524 L518 482 L585 445'
              : 'M455 283 C430 375 385 475 450 534 L520 522 L585 536'
          }
          fill="none"
          stroke={activeStep >= 1 ? '#fde047' : '#38bdf8'}
          strokeWidth={activeStep >= 1 ? 6 : 4.5}
          strokeDasharray={activeStep >= 1 ? 'none' : '12 8'}
          strokeLinecap="round"
        />

        {/* Step 1: Golden electric impulse racing down nerve */}
        {activeStep === 1 ? (
          <g transform={`translate(${impulseX}, ${impulseY})`}>
            <circle cx="0" cy="0" r="26" fill="#fde047" fillOpacity="0.38" />
            <polygon
              points="-12,-24 10,-4 -2,-4 14,24 -12,2 0,2"
              fill="#fef08a"
              stroke={INK}
              strokeWidth="2.5"
            />
          </g>
        ) : null}

        {/* Step 2: Muscle jolt burst at kicked leg */}
        {activeStep === 2 ? (
          <g transform="translate(590, 435)">
            <circle cx="0" cy="0" r="36" fill="#fde047" fillOpacity="0.3" />
            <path
              d="M-24 -18 L-42 -36 M8 -26 L18 -50 M28 -8 L54 -18"
              stroke="#fde047"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        ) : null}
      </g>

      <CleanLabel
        x={960}
        y={812}
        text={
          activeStep === 0
            ? 'Lỗi bàn giao ca giữa vùng Đánh thức (đỏ) và vùng Ngủ nghỉ (xanh)'
            : activeStep === 1
              ? 'Thân não phóng thẳng tia xung điện vàng xuống dây thần kinh chân tay'
              : 'Cơ chân co giật mạnh một nhịp kéo bạn tỉnh táo hoàn toàn!'
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

      <circle cx="1580" cy="185" r="78" fill="#fef9c3" opacity="0.9" />
      <circle cx="1580" cy="185" r="118" fill="#fef08a" opacity="0.14" />

      <path d="M0 765 Q380 695 760 750 T1520 735 L1920 760 L1920 1080 L0 1080 Z" fill="#051b14" />

      <g>
        <path d="M140 0 L360 0 L410 1080 L110 1080 Z" fill="#451a03" stroke={INK} strokeWidth="6" />
        <path
          d="M330 330 C640 315 1040 332 1420 355 C1445 362 1445 398 1415 405 C1030 395 640 392 340 420 Z"
          fill="#78350f"
          stroke={INK}
          strokeWidth="6"
        />
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

      {activeStep >= 1 ? (
        <g transform={`translate(${predatorX}, 712)`}>
          <path
            d="M-95 25 C-75 -18 -15 -22 45 -12 L88 -26 L108 -6 L92 14 L62 14 L68 58 L46 58 L38 22 L-42 22 L-54 58 L-76 58 L-68 24 C-112 22 -135 -4 -124 -22"
            fill="#020617"
            stroke="#334155"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
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

      <g transform={`translate(860, ${342 + slipDropY}) rotate(${slipAngle})`}>
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
        <ellipse cx="0" cy="-12" rx="64" ry="36" fill="#92400e" stroke={INK} strokeWidth="5" />
        <g transform="translate(68, -24)">
          <circle cx="0" cy="0" r="34" fill="#92400e" stroke={INK} strokeWidth="4.5" />
          <circle cx="-8" cy="-28" r="11" fill="#78350f" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="8" cy="4" rx="22" ry="18" fill="#fed7aa" stroke={INK} strokeWidth="3" />
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

        {activeStep === 2 ? (
          <g stroke="#78350f" strokeWidth="12" strokeLinecap="round" fill="none">
            <path d="M36 8 L54 58 L46 98" />
            <path d="M-32 10 L-22 62 L-30 102" />
          </g>
        ) : activeStep === 3 ? (
          <g stroke="#78350f" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none">
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

      {activeStep === 2 ? (
        <g>
          <path d="M865 465 L865 565" stroke="#ef4444" strokeWidth="8" strokeDasharray="12 10" />
          <polygon points="865,588 845,556 885,556" fill="#ef4444" />
          <ShortSpeechBubble x={880} y={225} text="Cơ mềm nhũn → Sắp tuột cành!" tailDir="CENTER" />
        </g>
      ) : null}

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
            <path
              d="M-42 -16 Q-56 0 -42 16 M42 -16 Q56 0 42 16"
              fill="none"
              stroke="#fde047"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>
          <ShortSpeechBubble x={645} y={220} text="Giật mình bám chặt kịp lúc!" tailDir="RIGHT" />
        </g>
      ) : null}

      <CleanLabel
        x={960}
        y={815}
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

        {/* Left Card: Modern Plush Bed with natural head pose & curved blanket */}
        <g transform="translate(150, 155)">
          <rect x="0" y="0" width="740" height="610" rx="30" fill="#1e293b" stroke="#38bdf8" strokeWidth="5" />
          <text x="370" y="68" textAnchor="middle" fill="#bae6fd" fontSize="30" fontWeight="800" fontFamily={FONT}>
            Thực tế: Giường nệm êm ái 100%
          </text>
          <rect x="95" y="385" width="550" height="84" rx="22" fill="#f8fafc" stroke={INK} strokeWidth="4.5" />
          <ellipse
            cx="182"
            cy="362"
            rx="62"
            ry="24"
            transform="rotate(14 182 362)"
            fill="#bae6fd"
            stroke={INK}
            strokeWidth="3.5"
          />
          <SharedStickman
            x={335}
            y={378}
            scale={1.1}
            role="BOY"
            facing="RIGHT"
            pose="SLEEP_BED"
            expression="SLEEPING"
            frame={frame}
          />
          <CozyBedBlanket
            x={255}
            y={365}
            width={345}
            height={72}
            fill="#38bdf8"
            accentFill="#bae6fd"
            breathOffset={Math.sin(t * 1.8) * 2}
          />
          <CleanLabel x={370} y={530} text="An toàn trên nệm phẳng" bg="#e0f2fe" color="#075985" border="#0284c7" fontSize={25} />
        </g>

        {/* Right Card: Ancient Switch Inside Brain */}
        <g transform="translate(1030, 155)">
          <rect x="0" y="0" width="740" height="610" rx="30" fill="#1e293b" stroke="#f59e0b" strokeWidth="5" />
          <text x="370" y="68" textAnchor="middle" fill="#fde68a" fontSize="30" fontWeight="800" fontFamily={FONT}>
            Trong não: Công tắc triệu năm tuổi
          </text>
          <g transform={`translate(370, 310) scale(${1 + Math.sin(t * 3) * 0.03})`}>
            <ellipse cx="0" cy="0" rx="135" ry="95" fill="#f472b6" stroke={INK} strokeWidth="5.5" />
            <path
              d="M-85 -25 Q0 -65 85 -20 M-95 20 Q0 -15 95 22"
              fill="none"
              stroke="#be185d"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="-32" cy="-8" r="10" fill="#ffffff" stroke={INK} strokeWidth="3" />
            <circle cx="-30" cy="-8" r="4.5" fill={INK} />
            <circle cx="32" cy="-8" r="10" fill="#ffffff" stroke={INK} strokeWidth="3" />
            <circle cx="34" cy="-8" r="4.5" fill={INK} />
          </g>
          <ShortSpeechBubble x={370} y={160} text="Coi chừng ngã khỏi cây!" tailDir="CENTER" />
          <CleanLabel x={370} y={530} text="Chưa kịp cập nhật thời hiện đại!" bg="#fef3c7" color="#92400e" border="#f59e0b" fontSize={25} />
        </g>
      </svg>
    );
  }

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

      <g transform="translate(300, 540)">
        <rect x="0" y="75" width="840" height="88" rx="22" fill="#334155" stroke="#64748b" strokeWidth="4.5" />
        <ellipse
          cx="128"
          cy="52"
          rx="68"
          ry="26"
          transform="rotate(14 128 52)"
          fill="#bae6fd"
          stroke={INK}
          strokeWidth="4"
        />

        <SharedStickman
          x={335}
          y={isDreamStitch ? 56 : 68}
          scale={1.26}
          role="BOY"
          facing="RIGHT"
          pose={isDreamStitch ? 'JERK_AWAKE' : 'SLEEP_BED'}
          expression={isDreamStitch ? 'SHOCKED' : 'SLEEPING'}
          frame={frame}
          limbColor="#cbd5e1"
        />

        {/* Cyan Test-Ping Nerve Line from Head (175, 0) -> Spine -> Foot (475, 68) */}
        <path
          d={
            isDreamStitch
              ? 'M225 -62 C255 -15 295 38 335 56 L402 -8 L475 -46'
              : 'M182 2 C225 32 280 58 335 68 L410 56 L482 74'
          }
          fill="none"
          stroke="#22d3ee"
          strokeWidth="5.5"
          strokeDasharray="12 8"
        />

        {!isDreamStitch ? (
          <g transform={`translate(${lerp(182, 482, pingT)}, ${lerp(2, 74, pingT)})`}>
            <circle cx="0" cy="0" r="24" fill="#22d3ee" fillOpacity="0.35" />
            <circle cx="0" cy="0" r="11" fill="#ecfeff" stroke="#0891b2" strokeWidth="3" />
          </g>
        ) : null}
      </g>

      {!isDreamStitch ? (
        <g>
          <ShortSpeechBubble x={545} y={375} text="Ping! Cơ đã khóa chưa?" tailDir="LEFT" />
          <CleanLabel
            x={960}
            y={812}
            text="Giả thuyết 2: Não gửi xung kiểm tra (Test Ping) trước khi vào giấc mơ"
            bg="#ecfeff"
            color="#155e75"
            border="#06b6d4"
            fontSize={27}
          />
        </g>
      ) : (
        <g>
          <circle cx="595" cy="420" r="12" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />
          <circle cx="650" cy="375" r="19" fill="#e2e8f0" stroke={INK} strokeWidth="3.5" />

          <g transform="translate(1285, 335)">
            <rect
              x="-340"
              y="-200"
              width="680"
              height="380"
              rx="42"
              fill="#1e293b"
              stroke="#fde047"
              strokeWidth="6"
            />
            <path d="M-334 -18 L-95 -18 L-65 174 L-334 174 Z" fill="#334155" />
            <SharedStickman
              x={85}
              y={10 + Math.sin(t * 6) * 12}
              scale={0.85}
              role="BOY"
              facing="RIGHT"
              pose="FALLING"
              expression="SHOCKED"
              frame={frame}
              rotationDeg={-16}
            />
            <text x="0" y="-140" textAnchor="middle" fill="#fef08a" fontSize="27" fontWeight="800" fontFamily={FONT}>
              Não nửa tỉnh nửa mơ tự dựng cảnh rơi!
            </text>
          </g>

          <CleanLabel
            x={960}
            y={812}
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

        <g transform="translate(420, 235)">
          <circle cx="0" cy="0" r="96" fill="#f8fafc" stroke={INK} strokeWidth="7" />
          <line x1="0" y1="0" x2="28" y2="-46" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          <line x1="0" y1="0" x2="0" y2="-74" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="0" cy="0" r="8" fill={INK} />
          <rect x="-78" y="114" width="156" height="44" rx="12" fill="#ef4444" stroke={INK} strokeWidth="3.5" />
          <text x="0" y="144" textAnchor="middle" fill="#ffffff" fontSize="25" fontWeight="800" fontFamily={FONT}>
            01:05 SÁNG
          </text>
        </g>

        {/* Low Body Energy Battery (5% — bar on left, text cleanly separated on right) */}
        <g transform="translate(1460, 235)">
          <rect x="-135" y="-44" width="258" height="88" rx="18" fill="#1e293b" stroke="#94a3b8" strokeWidth="5" />
          <rect x="123" y="-20" width="16" height="40" rx="5" fill="#94a3b8" />
          <rect
            x="-120"
            y="-30"
            width="32"
            height="60"
            rx="8"
            fill="#ef4444"
            opacity={0.5 + Math.abs(Math.sin(t * 6)) * 0.5}
          />
          <text x="22" y="10" textAnchor="middle" fill="#fca5a5" fontSize="28" fontWeight="800" fontFamily={FONT}>
            Pin: 5%
          </text>
          <text x="0" y="80" textAnchor="middle" fill="#cbd5e1" fontSize="23" fontWeight="700" fontFamily={FONT}>
            Cơ thể kiệt sức
          </text>
        </g>

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
          limbColor="#e2e8f0"
        />

        <g>
          <polygon points="1085,430 1165,430 1245,605 900,605" fill="#fef08a" opacity="0.22" />
          <rect x="870" y="600" width="430" height="26" rx="8" fill="#92400e" stroke={INK} strokeWidth="4.5" />
          <rect x="900" y="626" width="24" height="140" fill="#78350f" stroke={INK} strokeWidth="4" />
          <rect x="1246" y="626" width="24" height="140" fill="#78350f" stroke={INK} strokeWidth="4" />
          <rect x="1030" y="576" width="110" height="24" rx="4" fill="#3b82f6" stroke={INK} strokeWidth="3.5" />
          <rect x="1040" y="554" width="98" height="22" rx="4" fill="#f59e0b" stroke={INK} strokeWidth="3.5" />
          <rect x="1175" y="586" width="64" height="14" rx="6" fill="#334155" stroke={INK} strokeWidth="3.5" />
          <path d="M1208 586 L1228 475 L1145 435" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
          <path d="M1105 445 L1165 415 L1180 450 Z" fill="#facc15" stroke={INK} strokeWidth="4" />
        </g>

        <ShortSpeechBubble x={770} y={375} text="Mắt díp cứng lại rồi..." tailDir="LEFT" />
        <CleanLabel
          x={960}
          y={815}
          text="Thủ phạm #1: Thức quá khuya và để cơ thể thiếu ngủ kiệt sức"
          bg="#fef2f2"
          color="#991b1b"
          border="#ef4444"
          fontSize={28}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#0f172a" />

      <g transform="translate(130, 145)">
        <rect x="0" y="0" width="740" height="605" rx="28" fill="#1e293b" stroke="#475569" strokeWidth="5" />
        <text x="370" y="65" textAnchor="middle" fill="#f8fafc" fontSize="29" fontWeight="800" fontFamily={FONT}>
          Đổ ập xuống giường vì kiệt sức
        </text>
        <rect x="90" y="385" width="560" height="84" rx="22" fill="#e2e8f0" stroke={INK} strokeWidth="4.5" />
        <ellipse
          cx="180"
          cy="362"
          rx="62"
          ry="24"
          transform="rotate(14 180 362)"
          fill="#bae6fd"
          stroke={INK}
          strokeWidth="3.5"
        />
        <SharedStickman
          x={345}
          y={lerp(335, 378, clamp01(p * 2))}
          scale={1.14}
          role="BOY"
          facing="RIGHT"
          pose="SLEEP_BED"
          expression="EXHAUSTED"
          frame={frame}
        />
        <CozyBedBlanket x={265} y={366} width={340} height={70} fill="#475569" accentFill="#94a3b8" />
        <CleanLabel x={370} y={530} text="Vừa đặt lưng đã sập nguồn!" bg="#ffedd5" color="#9a3412" border="#f97316" fontSize={25} />
      </g>

      <g transform="translate(940, 145)">
        <rect x="0" y="0" width="850" height="605" rx="28" fill="#1e293b" stroke="#ef4444" strokeWidth="5" />
        <text x="425" y="65" textAnchor="middle" fill="#fca5a5" fontSize="29" fontWeight="800" fontFamily={FONT}>
          Đồ thị Chuyển giao vào Giấc ngủ
        </text>

        <line x1="95" y1="130" x2="95" y2="465" stroke="#94a3b8" strokeWidth="4" />
        <line x1="95" y1="465" x2="770" y2="465" stroke="#94a3b8" strokeWidth="4" />

        <path
          d="M110 165 C290 175 430 390 735 425"
          fill="none"
          stroke="#4ade80"
          strokeWidth="5"
          strokeDasharray="14 10"
        />
        <text x="580" y="372" fill="#86efac" fontSize="22" fontWeight="700" fontFamily={FONT}>
          Ngủ đủ giấc (Êm ái)
        </text>

        <path
          d="M110 165 L235 180 L285 430 L325 315 L368 440 L735 440"
          fill="none"
          stroke="#ef4444"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="325" cy="315" r={18 + Math.sin(t * 10) * 5} fill="#fde047" stroke="#dc2626" strokeWidth="4" />
        <text x="348" y="272" fill="#fef08a" fontSize="24" fontWeight="800" fontFamily={FONT}>
          ⚡ Xóc thần kinh → Giật nảy!
        </text>
      </g>

      <CleanLabel
        x={960}
        y={815}
        text="Não rơi vào giấc quá gấp khiến quá trình bàn giao bị xóc mạnh!"
        bg="#fef9c3"
        color={INK}
        border="#eab308"
        fontSize={27}
      />
    </svg>
  );
};
