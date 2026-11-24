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
 * 7. GiatMinhCulpritCaffeineVisual (GIATMINH_CULPRIT_CAFFEINE, step 0..1)
 *    - step 0: Ly cà phê, trà đặc, nước tăng lực chiều muộn kèm đồng hồ 6–8 tiếng
 *    - step 1: Tín hiệu cà-phê-in giữ trung tâm tỉnh táo nửa thức nửa ngủ dễ bật co giật
 * ============================================================================ */
export const GiatMinhCulpritCaffeineVisual: React.FC<EpisodeVisualProps> = ({
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
    const arcSweep = lerp(40, 240, clamp01(p * 1.3));
    const radEnd = ((arcSweep - 90) * Math.PI) / 180;
    const endX = Math.cos(radEnd) * 112;
    const endY = Math.sin(radEnd) * 112;
    const largeArc = arcSweep > 180 ? 1 : 0;

    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <rect x="0" y="0" width="1920" height="1080" fill="#0f172a" />

        {/* Left Card: Late Afternoon Caffeine Drinks */}
        <g transform="translate(130, 145)">
          <rect x="0" y="0" width="900" height="635" rx="30" fill="#1e293b" stroke="#f59e0b" strokeWidth="5" />
          <text x="450" y="68" textAnchor="middle" fill="#fde68a" fontSize="30" fontWeight="800" fontFamily={FONT}>
            Đồ uống chứa Cà-phê-in lúc chiều muộn (16:30 – 19:00)
          </text>

          {/* 1. Coffee Cup */}
          <g transform="translate(195, 340)">
            <path d="M-64 -55 L64 -55 L52 78 L-52 78 Z" fill="#78350f" stroke={INK} strokeWidth="5" />
            <rect x="-72" y="-72" width="144" height="22" rx="8" fill="#f8fafc" stroke={INK} strokeWidth="4.5" />
            <rect x="-56" y="-8" width="112" height="40" fill="#d97706" stroke={INK} strokeWidth="3.5" />
            <text x="0" y="128" textAnchor="middle" fill="#fef3c7" fontSize="24" fontWeight="700" fontFamily={FONT}>
              Cà phê
            </text>
          </g>

          {/* 2. Milk Tea / Strong Tea */}
          <g transform="translate(450, 340)">
            <path d="M-58 -60 L58 -60 L46 78 L-46 78 Z" fill="#fed7aa" stroke={INK} strokeWidth="5" />
            <line x1="12" y1="-112" x2="-6" y2="62" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
            {/* Boba pearls */}
            {[-26, -8, 12, 28].map((bx, idx) => (
              <circle key={idx} cx={bx} cy="62" r="8" fill="#291d16" />
            ))}
            <text x="0" y="128" textAnchor="middle" fill="#fef3c7" fontSize="24" fontWeight="700" fontFamily={FONT}>
              Trà đặc / Trà sữa
            </text>
          </g>

          {/* 3. Energy Drink Can */}
          <g transform="translate(705, 340)">
            <rect x="-48" y="-68" width="96" height="146" rx="14" fill="#2563eb" stroke={INK} strokeWidth="5" />
            <polygon points="-8,-30 16,-4 0,-4 12,32 -16,4 0,4" fill="#fde047" stroke={INK} strokeWidth="2.5" />
            <text x="0" y="128" textAnchor="middle" fill="#fef3c7" fontSize="24" fontWeight="700" fontFamily={FONT}>
              Nước tăng lực
            </text>
          </g>

          <CleanLabel x={450} y={555} text="Uống buổi chiều tối vẫn tác động tới tận đêm!" bg="#fef3c7" color="#92400e" border="#f59e0b" fontSize={25} />
        </g>

        {/* Right Card: 6-8 Hour Persistence Clock */}
        <g transform="translate(1090, 145)">
          <rect x="0" y="0" width="700" height="635" rx="30" fill="#1e293b" stroke="#ef4444" strokeWidth="5" />
          <text x="350" y="68" textAnchor="middle" fill="#fca5a5" fontSize="30" fontWeight="800" fontFamily={FONT}>
            Thời gian lưu lại trong máu
          </text>

          <g transform="translate(350, 315)">
            <circle cx="0" cy="0" r="136" fill="#f8fafc" stroke={INK} strokeWidth="7" />
            <path
              d={`M0 -112 A112 112 0 ${largeArc} 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`}
              fill="none"
              stroke="#f97316"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="12" fill={INK} />
            <line x1="0" y1="0" x2="0" y2="-86" stroke={INK} strokeWidth="7" strokeLinecap="round" />
            <line x1="0" y1="0" x2={endX * 0.72} y2={endY * 0.72} stroke="#ea580c" strokeWidth="7" strokeLinecap="round" />
            <text x="0" y="58" textAnchor="middle" fill="#c2410c" fontSize="32" fontWeight="800" fontFamily={FONT}>
              6 – 8 tiếng
            </text>
          </g>

          <CleanLabel x={350} y={555} text="23:30 đêm vẫn chưa tan hết!" bg="#fef2f2" color="#991b1b" border="#ef4444" fontSize={26} />
        </g>

        <CleanLabel
          x={960}
          y={840}
          text="Thủ phạm #2: Cà-phê-in chiều muộn âm thầm kích thích hệ thần kinh nhiều giờ liền"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={26}
        />
      </svg>
    );
  }

  // Step 1: Tired body vs Buzzing Caffeine-kept Wake Center -> Twitching muscles
  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#0b1220" />

      <g transform="translate(220, 145)">
        <rect x="0" y="0" width="1480" height="635" rx="32" fill="#1e293b" stroke="#f59e0b" strokeWidth="5" />

        {/* Boy tossing on bed */}
        <g transform="translate(460, 395)">
          <rect x="-290" y="65" width="640" height="84" rx="22" fill="#334155" stroke="#64748b" strokeWidth="4.5" />
          <ellipse cx="-200" cy="52" rx="58" ry="22" fill="#bae6fd" stroke={INK} strokeWidth="3.5" />
          <SharedStickman
            x={-30}
            y={56}
            scale={1.25}
            role="BOY"
            facing="RIGHT"
            pose={Math.sin(t * 5) > 0.55 ? 'JERK_AWAKE' : 'SLEEP_BED'}
            expression="EXHAUSTED"
            frame={frame}
          />
        </g>

        {/* Buzzing Caffeine Wake Center Callout on Right */}
        <g transform="translate(1090, 315)">
          <circle
            cx="0"
            cy="0"
            r={138 + Math.sin(t * 12) * 8}
            fill="#f59e0b"
            fillOpacity="0.18"
            stroke="#fbbf24"
            strokeWidth="4"
            strokeDasharray="12 10"
          />
          <ellipse cx="0" cy="0" rx="108" ry="82" fill="#f472b6" stroke={INK} strokeWidth="5" />
          {/* Orbiting amber caffeine sparks */}
          {[0, 1, 2, 3].map((k) => {
            const a = t * 3.2 + (k * Math.PI) / 2;
            return (
              <g key={k} transform={`translate(${Math.cos(a) * 122}, ${Math.sin(a) * 92})`}>
                <circle cx="0" cy="0" r="16" fill="#f59e0b" stroke={INK} strokeWidth="3" />
                <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="800" fontFamily={FONT}>
                  C
                </text>
              </g>
            );
          })}
          <text x="0" y="8" textAnchor="middle" fill={INK} fontSize="24" fontWeight="800" fontFamily={FONT}>
            Nửa thức nửa ngủ!
          </text>
        </g>

        <ShortSpeechBubble x={420} y={245} text="Người mệt rã rời mà não cứ tỉnh!" tailDir="LEFT" />
        <CleanLabel
          x={740}
          y={560}
          text="Cà-phê-in giữ trung tâm tỉnh táo sáng đèn → Rất dễ bật giật cơ!"
          bg="#fffbeb"
          color="#92400e"
          border="#f59e0b"
          fontSize={26}
        />
      </g>
    </svg>
  );
};

/* ============================================================================
 * 8. GiatMinhCulpritStressScreenVisual (GIATMINH_CULPRIT_STRESS_SCREEN, step 0..1)
 *    - step 0: Não căng thẳng thi cử/công việc bật đèn cảnh giác cao độ
 *    - step 1: Chia đôi: tập nặng sát giờ ngủ & lướt điện thoại sáng chói trong phòng tối
 * ============================================================================ */
export const GiatMinhCulpritStressScreenVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);

  if (activeStep === 0) {
    // Step 0: Stress / Anxiety keeping Brain Alert Siren ON
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <rect x="0" y="0" width="1920" height="1080" fill="#0f172a" />

        {/* Swirling stress badges around Boy */}
        <SharedStickman
          x={960}
          y={660}
          scale={1.38}
          role="BOY"
          facing="RIGHT"
          pose="IDLE"
          expression="WORRIED"
          frame={frame}
        />

        {/* Red Alert Siren above head */}
        <g transform="translate(960, 225)">
          <circle
            cx="0"
            cy="0"
            r={82 + Math.sin(t * 10) * 12}
            fill="#ef4444"
            fillOpacity="0.22"
          />
          <path d="M-34 28 L34 28 L26 -24 C26 -46 -26 -46 -26 -24 Z" fill="#ef4444" stroke="#fef08a" strokeWidth="4.5" />
          <rect x="-46" y="28" width="92" height="16" rx="6" fill="#475569" stroke={INK} strokeWidth="3.5" />
          <text x="0" y="-68" textAnchor="middle" fill="#fca5a5" fontSize="28" fontWeight="800" fontFamily={FONT}>
            🚨 NÃO BẬT CHẾ ĐỘ CẢNH GIÁC CAO ĐỘ
          </text>
        </g>

        {/* Floating Exam / Deadline Stress Cards */}
        <CleanLabel
          x={450}
          y={360 + Math.sin(t * 2.4) * 10}
          text="Lo thi cử & điểm số"
          bg="#fee2e2"
          color="#991b1b"
          border="#ef4444"
          fontSize={27}
        />
        <CleanLabel
          x={1470}
          y={360 + Math.cos(t * 2.4) * 10}
          text="Áp lực bài vở / công việc"
          bg="#ffedd5"
          color="#9a3412"
          border="#f97316"
          fontSize={27}
        />
        <CleanLabel
          x={470}
          y={545 + Math.cos(t * 2.1) * 8}
          text="Suy nghĩ miên man trên giường"
          bg="#fef3c7"
          color="#92400e"
          border="#eab308"
          fontSize={25}
        />
        <CleanLabel
          x={1450}
          y={545 + Math.sin(t * 2.1) * 8}
          text="Khó buông lỏng cơ bắp"
          bg="#fce7f3"
          color="#9d174d"
          border="#ec4899"
          fontSize={25}
        />

        <CleanLabel
          x={960}
          y={840}
          text="Thủ phạm #3: Lo âu căng thẳng giữ hệ thần kinh luôn căng như dây đàn"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={27}
        />
      </svg>
    );
  }

  // Step 1: Split screen — Heavy late-night workout vs Bright phone screen in dark room
  const liftY = Math.sin(t * 6) * 18;
  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Left Half: Late-night heavy workout */}
      <rect x="0" y="0" width="960" height="1080" fill="#1e1b2e" />
      <g transform="translate(480, 125)">
        <CleanLabel x={0} y={0} text="Tập quá nặng sát giờ ngủ (22:30)" bg="#fee2e2" color="#991b1b" border="#ef4444" fontSize={27} />
      </g>
      <SharedStickman
        x={480}
        y={640}
        scale={1.28}
        role="BOY"
        facing="RIGHT"
        pose="STRETCH_MORNING"
        expression="EXHAUSTED"
        frame={frame}
      />
      {/* Heavy barbell held overhead */}
      <g transform={`translate(480, ${402 + liftY})`}>
        <line x1="-165" y1="0" x2="165" y2="0" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
        <rect x="-155" y="-36" width="28" height="72" rx="6" fill="#334155" stroke={INK} strokeWidth="4" />
        <rect x="127" y="-36" width="28" height="72" rx="6" fill="#334155" stroke={INK} strokeWidth="4" />
      </g>
      <CleanLabel
        x={480}
        y={825}
        text="Thân nhiệt & nhịp tim tăng cao"
        bg="#fff1f2"
        color="#9f1239"
        border="#f43f5e"
        fontSize={26}
      />

      {/* Right Half: Glaring blue smartphone light in pitch-dark bedroom */}
      <rect x="960" y="0" width="960" height="1080" fill="#050814" />
      <g transform="translate(1440, 125)">
        <CleanLabel x={0} y={0} text="Lướt điện thoại sáng chói trong tối" bg="#e0f2fe" color="#075985" border="#38bdf8" fontSize={27} />
      </g>

      <g transform="translate(1440, 565)">
        <rect x="-320" y="65" width="640" height="84" rx="22" fill="#1e293b" stroke="#475569" strokeWidth="4" />
        <ellipse cx="-220" cy="52" rx="56" ry="22" fill="#334155" stroke={INK} strokeWidth="3.5" />
        <SharedStickman
          x={-45}
          y={58}
          scale={1.22}
          role="BOY"
          facing="RIGHT"
          pose="SLEEP_BED"
          expression="SLEEPY"
          frame={frame}
        />
        {/* Harsh blue light cone blasting from phone onto face */}
        <polygon
          points="-95,-35 -75,-48 -235,8 -205,58"
          fill="#38bdf8"
          opacity={0.42 + Math.sin(t * 8) * 0.1}
        />
        <rect
          x="-102"
          y="-54"
          width="24"
          height="42"
          rx="5"
          fill="#e0f2fe"
          stroke="#38bdf8"
          strokeWidth="3.5"
          transform="rotate(24 -90 -33)"
        />
      </g>

      <CleanLabel
        x={1440}
        y={825}
        text="Ánh sáng xanh đánh lừa não rằng trời còn sáng!"
        bg="#ecfeff"
        color="#155e75"
        border="#06b6d4"
        fontSize={26}
      />

      {/* Center Divider */}
      <line x1="960" y1="0" x2="960" y2="1080" stroke="#475569" strokeWidth="5" strokeDasharray="16 12" />
    </svg>
  );
};

/* ============================================================================
 * 9. GiatMinhVsSleepParalysisVisual (GIATMINH_VS_SLEEP_PARALYSIS, step 0..1)
 *    - step 0: Bảng so sánh Bóng đè (mơ sâu, bất động) vs Giật cơ đầu giấc (< 1 giây)
 *    - step 1: Cậu bé ngủ gục vẹo người trên bàn học/ghế xe buýt rồi giật mình tỉnh dậy
 * ============================================================================ */
export const GiatMinhVsSleepParalysisVisual: React.FC<EpisodeVisualProps> = ({
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

        <CleanLabel
          x={960}
          y={115}
          text="Phân biệt rõ: Bóng đè ≠ Giật cơ lúc mới chợp mắt"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={30}
        />

        {/* Left Column: Sleep Paralysis (Bóng đè) */}
        <g transform="translate(140, 195)">
          <rect x="0" y="0" width="760" height="625" rx="30" fill="#1e1b4b" stroke="#818cf8" strokeWidth="5" />
          <text x="380" y="72" textAnchor="middle" fill="#c7d2fe" fontSize="34" fontWeight="800" fontFamily={FONT}>
            🔒 BÓNG ĐÈ (Sleep Paralysis)
          </text>
          <line x1="60" y1="102" x2="700" y2="102" stroke="#4f46e5" strokeWidth="3" />

          <g fill="#e0e7ff" fontSize="26" fontWeight="700" fontFamily={FONT}>
            <text x="75" y="175">• Thời điểm: Giấc MƠ SÂU (REM)</text>
            <text x="75" y="245">• Cơ bắp: Đã bị não KHÓA BẤT ĐỘNG</text>
            <text x="75" y="315">• Cảm giác: Tỉnh nhận thức nhưng</text>
            <text x="105" y="358" fill="#a5b4fc">không nhúc nhích được tay chân</text>
          </g>

          {/* Padlock icon over sleeping figure */}
          <g transform="translate(380, 495)">
            <rect x="-220" y="18" width="440" height="58" rx="16" fill="#312e81" stroke="#6366f1" strokeWidth="3.5" />
            <rect x="-32" y="-36" width="64" height="52" rx="10" fill="#fbbf24" stroke={INK} strokeWidth="4" />
            <path d="M-18 -36 L-18 -54 A18 18 0 0 1 18 -54 L18 -36" fill="none" stroke="#fbbf24" strokeWidth="8" />
          </g>
        </g>

        {/* Right Column: Hypnic Jerk (Giật cơ đầu giấc) */}
        <g transform="translate(1020, 195)">
          <rect x="0" y="0" width="760" height="625" rx="30" fill="#064e3b" stroke="#34d399" strokeWidth="5" />
          <text x="380" y="72" textAnchor="middle" fill="#a7f3d0" fontSize="34" fontWeight="800" fontFamily={FONT}>
            ⚡ GIẬT CƠ ĐẦU GIẤC (Hypnic Jerk)
          </text>
          <line x1="60" y1="102" x2="700" y2="102" stroke="#10b981" strokeWidth="3" />

          <g fill="#ecfdf5" fontSize="26" fontWeight="700" fontFamily={FONT}>
            <text x="75" y="175">• Thời điểm: MỚI CHỢP MẮT (&lt; 1 giây)</text>
            <text x="75" y="245">• Cơ bắp: CHƯA KHÓA, co nảy tự nhiên</text>
            <text x="75" y="315">• Cảm giác: Hụt chân giật 1 nhịp rồi</text>
            <text x="105" y="358" fill="#6ee7b7">cử động bình thường ngay lập tức!</text>
          </g>

          <CleanLabel x={380} y={505} text="Phản xạ lành tính & vô hại" bg="#ecfdf5" color="#065f46" border="#10b981" fontSize={27} />
        </g>
      </svg>
    );
  }

  // Step 1: Dozing off crookedly on classroom desk / swaying bus seat -> wake-up jerk
  const wokeUp = p > 0.52;
  const busSway = Math.sin(t * 3.8) * 5;

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <rect x="0" y="0" width="1920" height="1080" fill="#0f172a" />

      {/* Left Scene: Slumped on Classroom Desk */}
      <g transform="translate(140, 145)">
        <rect x="0" y="0" width="760" height="635" rx="30" fill="#1e293b" stroke="#38bdf8" strokeWidth="5" />
        <text x="380" y="66" textAnchor="middle" fill="#bae6fd" fontSize="29" fontWeight="800" fontFamily={FONT}>
          Ngủ gục vẹo người trên bàn học
        </text>

        <SharedStickman
          x={290}
          y={465}
          scale={1.2}
          role="BOY"
          facing="RIGHT"
          pose={wokeUp ? 'SIT_DESK' : 'SLUMP_DESK'}
          expression={wokeUp ? 'SHOCKED' : 'SLEEPING'}
          frame={frame}
        />
        {/* Wooden Desk */}
        <rect x="360" y="425" width="280" height="24" rx="6" fill="#92400e" stroke={INK} strokeWidth="4.5" />
        <rect x="385" y="449" width="20" height="135" fill="#78350f" stroke={INK} strokeWidth="4" />
        <rect x="595" y="449" width="20" height="135" fill="#78350f" stroke={INK} strokeWidth="4" />
        {wokeUp ? (
          <ShortSpeechBubble x={295} y={215} text="Ơ! Tưởng ngã ghế!" tailDir="LEFT" />
        ) : null}
      </g>

      {/* Right Scene: Nodding off on Bus Seat */}
      <g transform="translate(1020, 145)">
        <rect x="0" y="0" width="760" height="635" rx="30" fill="#1e293b" stroke="#f59e0b" strokeWidth="5" />
        <text x="380" y="66" textAnchor="middle" fill="#fde68a" fontSize="29" fontWeight="800" fontFamily={FONT}>
          Ngủ gật lắc lư trên ghế xe buýt
        </text>

        <g transform={`translate(350, 465) rotate(${wokeUp ? 0 : busSway + 8})`}>
          {/* Bus high-back seat */}
          <path d="M-95 -165 L-55 -165 L-45 35 L75 35 L75 65 L-85 65 Z" fill="#2563eb" stroke={INK} strokeWidth="4.5" />
          <SharedStickman
            x={-20}
            y={18}
            scale={1.18}
            role="BOY"
            facing="RIGHT"
            pose={wokeUp ? 'SIT_DESK' : 'SLUMP_DESK'}
            expression={wokeUp ? 'SHOCKED' : 'SLEEPING'}
            frame={frame}
          />
        </g>
      </g>

      <CleanLabel
        x={960}
        y={840}
        text="Tư thế chênh vênh mất thăng bằng càng khiến não dễ bấm còi báo động!"
        bg="#fef9c3"
        color={INK}
        border="#eab308"
        fontSize={26}
      />
    </svg>
  );
};

/* ============================================================================
 * 10. GiatMinhTipScheduleCaffeineVisual (GIATMINH_TIP_SCHEDULE_CAFFEINE, step 0..3)
 *     - step 0: Mẹo 1 ngủ đúng giờ cố định
 *     - step 1: Ngủ đủ 7–8 tiếng mỗi đêm
 *     - step 2: Mẹo 2 dấu chặn cà phê/trà sau 14:00 & dừng tập nặng 2–3 tiếng trước ngủ
 *     - step 3: Nhịp tim và cơ bắp lắng dịu êm ái
 * ============================================================================ */
export const GiatMinhTipScheduleCaffeineVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="gm10_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#081326" />
          <stop offset="100%" stopColor="#0f2942" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1920" height="1080" fill="url(#gm10_bg)" />

      {activeStep === 0 || activeStep === 1 ? (
        /* Step 0 & 1: Tip 1 — Consistent Sleep Schedule + 7-8 Hours Full Recovery */
        <g>
          <CleanLabel
            x={960}
            y={120}
            text="MẸO 1: Giữ nhịp đồng hồ sinh học đều đặn mỗi tối"
            bg="#ecfdf5"
            color="#065f46"
            border="#10b981"
            fontSize={30}
          />

          {/* Left Card: Fixed 22:30 Bedtime + 7-Day Streak */}
          <g transform="translate(150, 195)">
            <rect x="0" y="0" width="760" height="585" rx="30" fill="#0f172a" stroke="#34d399" strokeWidth="5" />
            <text x="380" y="70" textAnchor="middle" fill="#a7f3d0" fontSize="30" fontWeight="800" fontFamily={FONT}>
              Đi ngủ đúng khung giờ cố định (22:30)
            </text>

            {/* Clock at 22:30 */}
            <g transform="translate(380, 245)">
              <circle cx="0" cy="0" r="105" fill="#f8fafc" stroke={INK} strokeWidth="6" />
              <line x1="0" y1="0" x2="-48" y2="-36" stroke={INK} strokeWidth="8" strokeLinecap="round" />
              <line x1="0" y1="0" x2="0" y2="74" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              <circle cx="0" cy="0" r="9" fill={INK} />
            </g>

            {/* 7-day checkmarks */}
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, idx) => (
              <g key={d} transform={`translate(${115 + idx * 88}, 455)`}>
                <circle cx="0" cy="0" r="30" fill="#10b981" stroke={INK} strokeWidth="3.5" />
                <text x="0" y="8" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="800" fontFamily={FONT}>
                  {d}
                </text>
              </g>
            ))}
          </g>

          {/* Right Card: Step 1 highlights 7-8 hours quality sleep */}
          <g transform="translate(1010, 195)" opacity={activeStep >= 1 ? 1 : 0.48}>
            <rect
              x="0"
              y="0"
              width="760"
              height="585"
              rx="30"
              fill="#0f172a"
              stroke={activeStep >= 1 ? '#fde047' : '#475569'}
              strokeWidth="5"
            />
            <text x="380" y="70" textAnchor="middle" fill="#fef08a" fontSize="30" fontWeight="800" fontFamily={FONT}>
              Ngủ đủ 7 – 8 tiếng chất lượng
            </text>

            {/* Full 100% Green Battery */}
            <g transform="translate(380, 245)">
              <rect x="-175" y="-58" width="335" height="116" rx="22" fill="#1e293b" stroke="#e2e8f0" strokeWidth="5" />
              <rect x="160" y="-26" width="20" height="52" rx="6" fill="#e2e8f0" />
              {[0, 1, 2, 3].map((b) => (
                <rect key={b} x={-155 + b * 76} y="-40" width="64" height="80" rx="10" fill="#22c55e" />
              ))}
            </g>

            <CleanLabel
              x={380}
              y={455}
              text="Hệ thần kinh hạ cánh êm ru, không rơi gấp!"
              bg="#fef9c3"
              color={INK}
              border="#eab308"
              fontSize={25}
            />
          </g>
        </g>
      ) : (
        /* Step 2 & 3: Tip 2 — No Caffeine after 14:00 + Finish heavy exercise early -> Calm heart & muscles */
        <g>
          <CleanLabel
            x={960}
            y={120}
            text="MẸO 2: Ngưng Cà-phê-in sau 14:00 & Tập thể thao sớm"
            bg="#e0f2fe"
            color="#075985"
            border="#0284c7"
            fontSize={30}
          />

          {/* Top-left & Top-right rules */}
          <g transform="translate(150, 195)">
            <rect x="0" y="0" width="760" height="340" rx="28" fill="#0f172a" stroke="#f87171" strokeWidth="4.5" />
            {/* Coffee with prohibition slash */}
            <g transform="translate(160, 170)">
              <rect x="-42" y="-52" width="84" height="104" rx="10" fill="#78350f" stroke={INK} strokeWidth="4" />
              <circle cx="0" cy="0" r="82" fill="none" stroke="#ef4444" strokeWidth="12" />
              <line x1="-58" y1="-58" x2="58" y2="58" stroke="#ef4444" strokeWidth="12" />
            </g>
            <text x="485" y="155" textAnchor="middle" fill="#fecaca" fontSize="30" fontWeight="800" fontFamily={FONT}>
              Sau 14:00 chiều:
            </text>
            <text x="485" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="25" fontWeight="700" fontFamily={FONT}>
              Tránh cà phê, trà đặc, tăng lực
            </text>
          </g>

          <g transform="translate(1010, 195)">
            <rect x="0" y="0" width="760" height="340" rx="28" fill="#0f172a" stroke="#38bdf8" strokeWidth="4.5" />
            <g transform="translate(160, 170)">
              <line x1="-68" y1="0" x2="68" y2="0" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
              <rect x="-64" y="-34" width="24" height="68" rx="6" fill="#38bdf8" stroke={INK} strokeWidth="3.5" />
              <rect x="40" y="-34" width="24" height="68" rx="6" fill="#38bdf8" stroke={INK} strokeWidth="3.5" />
            </g>
            <text x="485" y="155" textAnchor="middle" fill="#bae6fd" fontSize="30" fontWeight="800" fontFamily={FONT}>
              Trước giờ ngủ 2 – 3 tiếng:
            </text>
            <text x="485" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="25" fontWeight="700" fontFamily={FONT}>
              Hoàn tất các bài tập vận động mạnh
            </text>
          </g>

          {/* Bottom Calming Wave Banner (highlighted strongly in Step 3) */}
          <g transform="translate(150, 565)" opacity={activeStep >= 3 ? 1 : 0.65}>
            <rect
              x="0"
              y="0"
              width="1620"
              height="245"
              rx="28"
              fill="#064e3b"
              fillOpacity="0.65"
              stroke="#34d399"
              strokeWidth="5"
            />
            <path
              d={`M80 125 ${Array.from({ length: 48 }, (_, i) => {
                const x = 80 + i * 31;
                const y = 125 + Math.sin(i * 0.35 - t * 3) * 24;
                return `L${x} ${y.toFixed(1)}`;
              }).join(' ')}`}
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <CleanLabel
              x={810}
              y={192}
              text="Nhịp tim và hóc-môn căng thẳng lắng xuống thật êm dịu trước giờ ngủ!"
              bg="#ecfdf5"
              color="#065f46"
              border="#10b981"
              fontSize={26}
            />
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 11. GiatMinhTipWindDownRoomVisual (GIATMINH_TIP_WINDDOWN_ROOM, step 0..1)
 *     - step 0: Mẹo 3 đồng hồ 20 phút thư giãn (cất điện thoại, tắm ấm, hít thở sâu)
 *     - step 1: Phòng ngủ mát mẻ ánh sáng dịu, cậu bé yên tâm vào giấc êm ru
 * ============================================================================ */
export const GiatMinhTipWindDownRoomVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);

  if (activeStep === 0) {
    const breathScale = 1 + Math.sin(t * 2.2) * 0.08;
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <rect x="0" y="0" width="1920" height="1080" fill="#0f172a" />

        <CleanLabel
          x={960}
          y={120}
          text="MẸO 3: Tạo khoảng đệm thư giãn 20 phút trước khi lên giường"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={30}
        />

        {/* 3 Relaxing Habit Cards */}
        {/* Card 1: Put Phone Away */}
        <g transform="translate(150, 225)">
          <rect x="0" y="0" width="500" height="535" rx="28" fill="#1e293b" stroke="#38bdf8" strokeWidth="4.5" />
          <g transform="translate(250, 210)">
            <rect x="-52" y="-88" width="104" height="176" rx="18" fill="#0f172a" stroke="#94a3b8" strokeWidth="5" />
            <text x="0" y="8" textAnchor="middle" fill="#38bdf8" fontSize="28" fontWeight="800" fontFamily={FONT}>
              OFF
            </text>
          </g>
          <CleanLabel x={250} y={440} text="1. Cất điện thoại sớm" bg="#e0f2fe" color="#075985" border="#0284c7" fontSize={26} />
        </g>

        {/* Card 2: Warm Shower / Foot Bath */}
        <g transform="translate(710, 225)">
          <rect x="0" y="0" width="500" height="535" rx="28" fill="#1e293b" stroke="#fbbf24" strokeWidth="4.5" />
          <g transform="translate(250, 205)">
            <path d="M-75 -55 Q0 -110 75 -55 Z" fill="#cbd5e1" stroke={INK} strokeWidth="4.5" />
            {[-42, -14, 14, 42].map((dx, i) => (
              <line
                key={i}
                x1={dx}
                y1={-32 + ((t * 45 + i * 18) % 65)}
                x2={dx}
                y2={-8 + ((t * 45 + i * 18) % 65)}
                stroke="#7dd3fc"
                strokeWidth="6"
                strokeLinecap="round"
              />
            ))}
          </g>
          <CleanLabel x={250} y={440} text="2. Tắm ấm nhẹ nhàng" bg="#fef3c7" color="#92400e" border="#f59e0b" fontSize={26} />
        </g>

        {/* Card 3: Slow Deep Breathing */}
        <g transform="translate(1270, 225)">
          <rect x="0" y="0" width="500" height="535" rx="28" fill="#1e293b" stroke="#34d399" strokeWidth="4.5" />
          <g transform={`translate(250, 210) scale(${breathScale})`}>
            <circle cx="0" cy="0" r="88" fill="#10b981" fillOpacity="0.22" stroke="#34d399" strokeWidth="5" />
            <circle cx="0" cy="0" r="48" fill="#34d399" fillOpacity="0.45" />
          </g>
          <CleanLabel x={250} y={440} text="3. Hít thở sâu êm dịu" bg="#ecfdf5" color="#065f46" border="#10b981" fontSize={26} />
        </g>

        <CleanLabel
          x={960}
          y={835}
          text="20 phút không màn hình giúp sóng não chuyển sang chế độ nghỉ ngơi tự nhiên"
          bg="#ecfdf5"
          color="#065f46"
          border="#10b981"
          fontSize={26}
        />
      </svg>
    );
  }

  // Step 1: Cozy cool dim-lit bedroom — Boy peacefully drifting to sleep
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
        clockText="22:30"
        lampOn={true}
        showBed={true}
      />

      <SharedStickman
        x={645}
        y={586}
        scale={1.22}
        role="BOY"
        facing="RIGHT"
        pose="SLEEP_BED"
        expression="SLEEPING"
        frame={frame}
      />
      <path
        d={`M528 ${576 + Math.sin(t * 1.6) * 2} Q730 ${548 + Math.sin(t * 1.6) * 2.5} 995 578 L1005 648 L522 648 Z`}
        fill="#0284c7"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Cool Room Badge + Safe Signal Shield */}
      <CleanLabel
        x={560}
        y={145}
        text="🌡️ Phòng mát 25°C • Ánh sáng dịu ấm"
        bg="#e0f2fe"
        color="#075985"
        border="#0284c7"
        fontSize={27}
      />
      <ShortSpeechBubble x={565} y={355} text="An toàn tuyệt đối → Ngủ êm ru!" tailDir="LEFT" />
    </svg>
  );
};

/* ============================================================================
 * 12. GiatMinhPeacefulSummaryVisual (GIATMINH_PEACEFUL_SUMMARY, step 0..4)
 *     - step 0: Sáng hôm sau nắng dịu qua rèm, cậu bé vươn vai sảng khoái ngủ một mạch tới sáng
 *     - step 1: Ông nội vỗ vai cậu bé cười ấm áp
 *     - step 2..3: Thẻ tóm tắt 3 điều dễ nhớ (70% vô hại / Lỗi bàn giao + tiến hóa / 3 mẹo ngủ êm)
 *     - step 4: Cậu bé vẫy tay kèm ShortSpeechBubble "Chia sẻ cho bạn bè nhé!"
 * ============================================================================ */
export const GiatMinhPeacefulSummaryVisual: React.FC<EpisodeVisualProps> = ({
  frame,
  fps,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const t = frame / Math.max(1, fps);

  if (activeStep === 0) {
    // Step 0: Morning sunlit bedroom — Boy stretching joyfully
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <BedroomNightBackdrop
          frame={frame}
          mode="MORNING"
          clockText="06:30"
          lampOn={false}
          showBed={true}
        />

        {/* Neatly folded blanket on bed */}
        <rect x="760" y="566" width="265" height="66" rx="16" fill="#38bdf8" stroke={INK} strokeWidth="4.5" />

        {/* Boy standing beside bed stretching happily in morning sun */}
        <SharedStickman
          x={620}
          y={660}
          scale={1.3}
          role="BOY"
          facing="RIGHT"
          pose="STRETCH_MORNING"
          expression="PROUD"
          frame={frame}
        />

        <ShortSpeechBubble x={620} y={330} text="Ngủ một mạch tới sáng!" tailDir="CENTER" />
        <CleanLabel
          x={960}
          y={835}
          text="Thức dậy tràn đầy năng lượng sau một đêm ngủ sâu êm ái"
          bg="#fef9c3"
          color={INK}
          border="#eab308"
          fontSize={27}
        />
      </svg>
    );
  }

  if (activeStep === 1) {
    // Step 1: Warm sunny morning yard — Grandpa patting Boy's shoulder proudly
    return (
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="gm12_morningYardSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#fef9c3" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1920" height="760" fill="url(#gm12_morningYardSky)" />
        <circle cx="1610" cy="185" r="78" fill="#fde047" stroke="#f59e0b" strokeWidth="5" />
        <rect x="0" y="745" width="1920" height="335" fill="#4ade80" stroke={INK} strokeWidth="5" />
        <ellipse cx="960" cy="810" rx="520" ry="44" fill="#22c55e" opacity="0.45" />

        {/* Grandpa on left patting Boy's shoulder warmly */}
        <SharedStickman
          x={820}
          y={645}
          scale={1.34}
          role="GRANDPA"
          facing="RIGHT"
          pose="PAT_SHOULDER"
          expression="PROUD"
          frame={frame}
        />
        <SharedStickman
          x={1055}
          y={665}
          scale={1.18}
          role="BOY"
          facing="LEFT"
          pose="IDLE"
          expression="HAPPY"
          frame={frame}
        />

        <ShortSpeechBubble x={775} y={355} text="Hiểu rõ cơ thể là hết lo!" tailDir="RIGHT" />
        <CleanLabel
          x={960}
          y={835}
          text="Khoa học biến nỗi sợ vô hình thành kiến thức thú vị mỗi ngày"
          bg="#ffffff"
          color={INK}
          border="#10b981"
          fontSize={27}
        />
      </svg>
    );
  }

  // Steps 2, 3, 4: 3 Easy-to-Remember Takeaways + Boy Waving in Step 4
  const showCard3Bright = activeStep >= 3;
  const isFinalWave = activeStep >= 4;

  const summaryCards = [
    {
      num: '1',
      title: '60% – 70% mọi người đều từng gặp',
      desc: 'Chỉ là phản xạ giật cơ đầu giấc hoàn toàn lành tính',
      bg: '#ecfdf5',
      border: '#10b981',
      badgeBg: '#10b981',
      active: true,
    },
    {
      num: '2',
      title: 'Lỗi bàn giao Thân Não & Tiến hóa',
      desc: 'Cơ thả lỏng nhanh khiến công tắc cổ xưa tưởng sắp ngã cây',
      bg: '#fef9c3',
      border: '#eab308',
      badgeBg: '#eab308',
      active: true,
    },
    {
      num: '3',
      title: '3 Bí quyết vào giấc êm ru',
      desc: 'Ngủ đúng giờ • Tránh trà/cà phê chiều • Thư giãn 20 phút',
      bg: '#e0f2fe',
      border: '#0284c7',
      badgeBg: '#0284c7',
      active: showCard3Bright,
    },
  ];

  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="gm12_sumBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1920" height="1080" fill="url(#gm12_sumBg)" />

      <CleanLabel
        x={960}
        y={115}
        text="GHI NHỚ NHANH 3 ĐIỀU KHOA HỌC THÚ VỊ"
        bg="#fef08a"
        color={INK}
        border="#ca8a04"
        fontSize={30}
      />

      {/* Summary Cards Column (shifted right when Boy waves on the left in Step 4) */}
      <g transform={`translate(${isFinalWave ? 640 : 340}, 185)`}>
        {summaryCards.map((c, idx) => (
          <g
            key={c.num}
            transform={`translate(0, ${idx * 205})`}
            opacity={c.active ? 1 : 0.42}
          >
            <rect
              x="0"
              y="0"
              width={isFinalWave ? 1140 : 1240}
              height="175"
              rx="28"
              fill={c.bg}
              stroke={c.border}
              strokeWidth="5"
            />
            <circle cx="88" cy="88" r="46" fill={c.badgeBg} stroke={INK} strokeWidth="4" />
            <text x="88" y="102" textAnchor="middle" fill="#ffffff" fontSize="38" fontWeight="800" fontFamily={FONT}>
              {c.num}
            </text>
            <text x="165" y="74" fill={INK} fontSize="31" fontWeight="800" fontFamily={FONT}>
              {c.title}
            </text>
            <text x="165" y="124" fill="#334155" fontSize="25" fontWeight="600" fontFamily={FONT}>
              {c.desc}
            </text>
          </g>
        ))}
      </g>

      {/* Step 4: Cheerful Boy waving goodbye + ShortSpeechBubble "Chia sẻ cho bạn bè nhé!" */}
      {isFinalWave ? (
        <g>
          <SharedStickman
            x={335}
            y={665 + Math.sin(t * 2.5) * 3}
            scale={1.38}
            role="BOY"
            facing="RIGHT"
            pose="HAPPY_WAVE"
            expression="PROUD"
            frame={frame}
          />
          <ShortSpeechBubble x={345} y={355} text="Chia sẻ cho bạn bè nhé!" tailDir="LEFT" />
        </g>
      ) : null}
    </svg>
  );
};
