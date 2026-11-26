import React from 'react';
import type { EpisodeVisualProps } from './index';
import { CuteCat } from '../../AnimalSpriteKit';
import {
  INK,
  FONT,
  CatCleanLabel,
  CatContrastBadge,
  CatStageCardBackdrop,
  CatCheckCircle,
} from './catRightingSharedAssets';

/* ============================================================================
 * SVG_01: CAT_LOW_HEIGHT_TEST (Beats 6–7, steps 0, 1)
 *   - Step 0: Upside-down cat (back facing down, 4 paws up) cleanly above thick soft cushion
 *   - Step 1: Bright vertical ruler (~30 cm) + stopwatch (~0,3 – 0,5 giây) + 180° flip landing on 4 paws
 * ========================================================================== */
export const CatLowHeightTestVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const floatY = Math.sin(frame * 0.12) * 6;
  const flipCycle = Math.min(1, (frame % 75) / 50);
  const flipDeg = activeStep === 0 ? 180 : 180 * (1 - flipCycle);
  const dropY = activeStep === 0 ? 330 + floatY : 330 + flipCycle * 260;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="SKY" gradId="cat01_bg" cardBorder="#0284C7" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Thí nghiệm quay chậm an toàn: Thả mèo ở tư thế ngửa bụng'
            : 'Kết quả khó tin: Chỉ cần ~30 cm, mèo đã kịp lật trọn 180°!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {/* Left vertical ruler (prominent in Step 1, subtle reference in Step 0) */}
      <g transform="translate(260, 210)">
        <rect
          x={0}
          y={0}
          width={92}
          height={490}
          rx={14}
          fill={activeStep === 1 ? '#FEF9C3' : '#F8FAFC'}
          stroke={activeStep === 1 ? '#D97706' : '#94A3B8'}
          strokeWidth={4}
        />
        {[0, 1, 2, 3, 4, 5, 6].map((ti) => (
          <g key={ti} transform={`translate(0, ${44 + ti * 66})`}>
            <line x1={52} y1={0} x2={90} y2={0} stroke={activeStep === 1 ? '#B45309' : '#64748B'} strokeWidth={3.5} />
            <text x={42} y={7} textAnchor="end" fill={activeStep === 1 ? '#92400E' : '#64748B'} fontSize={18} fontWeight={800}>
              {30 - ti * 5}
            </text>
          </g>
        ))}
        {/* Highlighted 30cm label */}
        <g transform="translate(152, 245)">
          <rect x={-96} y={-32} width={192} height={64} rx={20} fill={activeStep === 1 ? '#D97706' : '#E2E8F0'} stroke={INK} strokeWidth={3} />
          <text x={0} y={10} textAnchor="middle" fill={activeStep === 1 ? '#FFFFFF' : '#475569'} fontSize={28} fontWeight={900}>
            ~30 cm
          </text>
        </g>
      </g>

      {/* Center Stage: Soft thick safety cushion + Cat drop & flip */}
      <g>
        {/* Dashed drop guideline */}
        <line x1={960} y1={270} x2={960} y2={665} stroke="#38BDF8" strokeWidth={4} strokeDasharray="12 10" opacity={0.65} />

        {/* Thick plush cushion at bottom of card (y=660..740) */}
        <g transform="translate(960, 706)">
          <ellipse cx={0} cy={16} rx={300} ry={28} fill="#0F172A" opacity={0.12} />
          <rect x={-290} y={-44} width={580} height={74} rx={36} fill="#38BDF8" stroke={INK} strokeWidth={4} />
          <rect x={-266} y={-34} width={532} height={36} rx={18} fill="#BAE6FD" stroke="#0284C7" strokeWidth={2.6} />
          <text x={0} y={16} textAnchor="middle" fill="#0C4A6E" fontSize={22} fontWeight={900}>
            Đệm dày êm ái an toàn
          </text>
        </g>

        {/* Cat Illustration */}
        {activeStep === 0 ? (
          <g transform={`translate(960, ${dropY.toFixed(1)})`}>
            {/* Gentle supporting open-hand indicators on sides */}
            <path d="M -185,18 Q -150,36 -116,14" fill="none" stroke="#94A3B8" strokeWidth={7} strokeLinecap="round" />
            <path d="M 185,18 Q 150,36 116,14" fill="none" stroke="#94A3B8" strokeWidth={7} strokeLinecap="round" />
            {/* Upside-down cat (rotated 180 deg so back faces down, 4 paws point up!) */}
            <g transform="rotate(180)">
              <CuteCat x={0} y={48} scale={1.15} frame={frame} pose="curl_midair" />
            </g>
            {/* Clean callout tags on left & right of cat */}
            <g transform="translate(240, -56)">
              <rect x={-125} y={-24} width={250} height={48} rx={24} fill="#EFF6FF" stroke="#0284C7" strokeWidth={3} />
              <text x={0} y={7} textAnchor="middle" fill="#0369A1" fontSize={20} fontWeight={900}>
                4 chân chĩa lên trời ↑
              </text>
            </g>
            <g transform="translate(240, 56)">
              <rect x={-125} y={-24} width={250} height={48} rx={24} fill="#FFF7ED" stroke="#EA580C" strokeWidth={3} />
              <text x={0} y={7} textAnchor="middle" fill="#9A3412" fontSize={20} fontWeight={900}>
                Lưng hướng xuống ↓
              </text>
            </g>
          </g>
        ) : (
          <g>
            {/* Ghost upside-down start position at top */}
            <g transform="translate(960, 290) rotate(180)" opacity={0.28}>
              <CuteCat x={0} y={45} scale={0.95} frame={0} pose="curl_midair" />
            </g>
            {/* Rotating midair arc arrow */}
            <path
              d="M 800,370 A 150,120 0 0,0 818,556"
              fill="none"
              stroke="#EA580C"
              strokeWidth={7}
              strokeLinecap="round"
            />
            <polygon points="828,566 802,554 824,538" fill="#EA580C" />
            <text x={710} y={472} textAnchor="middle" fill="#C2410C" fontSize={28} fontWeight={900}>
              180°
            </text>

            {/* Animated flipping cat landing cleanly on cushion */}
            {flipCycle < 0.85 ? (
              <g transform={`translate(960, ${dropY.toFixed(1)}) rotate(${flipDeg.toFixed(1)})`}>
                <CuteCat x={0} y={45} scale={1.08} frame={frame} pose="curl_midair" />
              </g>
            ) : (
              <CuteCat x={960} y={664} scale={1.15} frame={frame} pose="stand" />
            )}
          </g>
        )}
      </g>

      {/* Right info card: Stopwatch + Result */}
      <g transform="translate(1525, 440)">
        <rect x={-215} y={-205} width={430} height={410} rx={26} fill="#F8FAFC" stroke={activeStep === 1 ? '#15803D' : '#CBD5E1'} strokeWidth={4} />
        {/* Stopwatch icon */}
        <g transform="translate(0, -96)">
          <rect x={-16} y={-68} width={32} height={14} rx={5} fill="#475569" stroke={INK} strokeWidth={2.5} />
          <circle cx={0} cy={0} r={54} fill="#FFFFFF" stroke={activeStep === 1 ? '#15803D' : '#64748B'} strokeWidth={5} />
          <line x1={0} y1={0} x2={26} y2={-24} stroke="#EA580C" strokeWidth={5} strokeLinecap="round" />
          <circle cx={0} cy={0} r={6} fill={INK} />
        </g>
        <text x={0} y={6} textAnchor="middle" fill="#0F172A" fontSize={24} fontWeight={900}>
          {activeStep === 0 ? 'Tư thế bắt đầu' : 'Thời gian lật người'}
        </text>
        <rect x={-166} y={28} width={332} height={58} rx={20} fill={activeStep === 1 ? '#DCFCE7' : '#EFF6FF'} stroke={activeStep === 1 ? '#15803D' : '#0284C7'} strokeWidth={3} />
        <text x={0} y={65} textAnchor="middle" fill={activeStep === 1 ? '#14532D' : '#0369A1'} fontSize={25} fontWeight={900}>
          {activeStep === 0 ? 'Thả rơi tự do (0 lực đẩy)' : '~0,3 – 0,5 giây!'}
        </text>
        <text x={0} y={132} textAnchor="middle" fill="#334155" fontSize={20} fontWeight={700}>
          {activeStep === 0 ? 'Chưa kịp chớp mắt đã' : 'Tiếp đệm gọn gàng'}
        </text>
        <text x={0} y={164} textAnchor="middle" fill={activeStep === 1 ? '#15803D' : '#475569'} fontSize={21} fontWeight={900}>
          {activeStep === 0 ? 'xoay tròn giữa không trung!' : 'trên cả 4 bàn chân ✓'}
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_02: CAT_MAREY_1894 (Beats 8–9, steps 0, 1)
 *   - Step 0: Classic 1894 chronophotograph filmstrip showing 5 frames of cat mid-air rotation
 *   - Step 1: Crossed-out "Không đạp tay lấy đà" + solidRed badge "TRÁI ĐỊNH LUẬT VẬT LÝ?"
 * ========================================================================== */
export const CatMarey1894Visual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.2);

  const filmFrames = [
    { label: 'Khung 1', deg: 180, desc: 'Ngửa bụng' },
    { label: 'Khung 2', deg: 135, desc: 'Uốn lưng' },
    { label: 'Khung 3', deg: 85, desc: 'Xoay thân trước' },
    { label: 'Khung 4', deg: 30, desc: 'Thân sau đuổi kịp' },
    { label: 'Khung 5', deg: 0, desc: 'Sẵn sàng đáp 4 chân' },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="CREAM" gradId="cat02_bg" cardBorder="#B45309" cardFill="#FFFBEB" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Loạt ảnh chụp tốc độ cao lịch sử của Marey (Pháp, 1894)'
            : 'Chứng minh mèo KHÔNG đạp tay lấy đà — Cú sốc vật lý!'
        }
        bg="#FFFFFF"
        color="#92400E"
        border="#B45309"
        fontSize={29}
      />

      {/* Year & Scientist header pill inside card */}
      <g transform="translate(960, 206)">
        <rect x={-360} y={-24} width={720} height={48} rx={24} fill="#FEF3C7" stroke="#B45309" strokeWidth={3} />
        <text x={0} y={8} textAnchor="middle" fill="#78350F" fontSize={22} fontWeight={900}>
          Étienne-Jules Marey (1894) • Máy ảnh chụp liên tiếp tốc độ cao
        </text>
      </g>

      {/* Classic Filmstrip container (y=250..560) */}
      <g transform="translate(175, 250)">
        <rect x={0} y={0} width={1570} height={310} rx={20} fill="#1E293B" stroke={INK} strokeWidth={4} />
        {/* Top & bottom sprocket holes */}
        {Array.from({ length: 24 }, (_, si) => (
          <g key={si}>
            <rect x={24 + si * 64} y={12} width={34} height={18} rx={4} fill="#FEF3C7" opacity={0.85} />
            <rect x={24 + si * 64} y={280} width={34} height={18} rx={4} fill="#FEF3C7" opacity={0.85} />
          </g>
        ))}

        {/* 5 Sequential Chronophotograph Frames */}
        {filmFrames.map((ff, idx) => {
          const fx = 24 + idx * 308;
          return (
            <g key={idx} transform={`translate(${fx}, 42)`}>
              <rect x={0} y={0} width={290} height={226} rx={12} fill="#FEF9C3" stroke="#D97706" strokeWidth={3} />
              <text x={145} y={28} textAnchor="middle" fill="#92400E" fontSize={18} fontWeight={900}>
                {ff.label}
              </text>
              <g transform={`translate(145, 112) rotate(${ff.deg})`}>
                <CuteCat x={0} y={36} scale={0.66} frame={frame + idx * 14} pose={idx === 4 ? 'stand' : 'curl_midair'} />
              </g>
              <text x={145} y={210} textAnchor="middle" fill="#78350F" fontSize={17.5} fontWeight={800}>
                {ff.desc}
              </text>
              {idx < 4 && (
                <polygon points="295,113 306,104 306,122" fill="#FACC15" transform="rotate(180, 300, 113)" />
              )}
            </g>
          );
        })}
      </g>

      {/* Bottom area (y=592..752): Step 0 caption vs Step 1 Physics Shock Badge */}
      {activeStep === 0 ? (
        <g transform="translate(960, 672)">
          <rect x={-560} y={-44} width={1120} height={88} rx={24} fill="#FFFFFF" stroke="#D97706" strokeWidth={3.5} />
          <text x={0} y={-6} textAnchor="middle" fill="#92400E" fontSize={24} fontWeight={900}>
            Lần đầu tiên loài người thấy rõ từng khoảnh khắc mèo lật giữa không trung!
          </text>
          <text x={0} y={28} textAnchor="middle" fill="#475569" fontSize={20} fontWeight={700}>
            Xoay trọn 180° từ tư thế ngửa bụng sang úp bụng trong chưa đầy nửa giây
          </text>
        </g>
      ) : (
        <g>
          {/* Left box: Crossed-out push-off arrow */}
          <g transform="translate(540, 674)">
            <rect x={-350} y={-64} width={700} height={128} rx={24} fill="#FFFFFF" stroke="#DC2626" strokeWidth={3.5} />
            {/* Red crossed circle */}
            <g transform="translate(-266, 0)">
              <circle cx={0} cy={0} r={38} fill="#FEE2E2" stroke="#DC2626" strokeWidth={4} />
              <path d="M -20,-20 L 20,20 M 20,-20 L -20,20" stroke="#DC2626" strokeWidth={7} strokeLinecap="round" />
            </g>
            <text x={45} y={-10} textAnchor="middle" fill="#991B1B" fontSize={24} fontWeight={900}>
              Không đạp vào tay lấy đà!
            </text>
            <text x={45} y={28} textAnchor="middle" fill="#475569" fontSize={20} fontWeight={700}>
              Mèo tự xoay giữa khoảng không không điểm tựa
            </text>
          </g>

          {/* Right box: High-contrast solidRed alert badge */}
          <g transform={`translate(1355, 674) scale(${(1 + pulse * 0.025).toFixed(3)})`}>
            <rect x={-370} y={-64} width={740} height={128} rx={24} fill="#FEF2F2" stroke="#DC2626" strokeWidth={4} />
            <CatContrastBadge x={0} y={-16} w={610} h={54} text="⚠  TRÁI ĐỊNH LUẬT VẬT LÝ?" variant="solidRed" fontSize={25} />
            <text x={0} y={40} textAnchor="middle" fill="#991B1B" fontSize={20} fontWeight={800}>
              Làm cả Viện Hàn lâm Khoa học Pháp năm 1894 bối rối!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_03: CAT_RIGID_VS_FLEX (Beats 11–12, steps 0, 1)
 *   - Step 0: Rigid solid block (X: Không thể tự xoay) vs Flexible cat (✓: Tự uốn xoay)
 *   - Step 1: ĐH Stanford (1969) 2-cylinder flexible model + NASA astronaut research tag
 * ========================================================================== */
export const CatRigidVsFlexVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const flexAngle = Math.sin(frame * 0.14) * 14;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="MINT" gradId="cat03_bg" cardBorder="#059669" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Định luật vật lý không sai — Mèo KHÔNG phải khối gỗ cứng!'
            : 'Giải mã năm 1969 (ĐH Stanford): Mô hình 2 trục xoay nối khớp mềm'
        }
        bg="#FFFFFF"
        color="#065F46"
        border="#059669"
        fontSize={29}
      />

      {/* Top Comparison Row (y=192..540) */}
      {/* Left Card: Rigid Block */}
      <g transform="translate(185, 192)">
        <rect x={0} y={0} width={715} height={355} rx={26} fill="#FEF2F2" stroke="#DC2626" strokeWidth={4} />
        <text x={357} y={46} textAnchor="middle" fill="#991B1B" fontSize={25} fontWeight={900}>
          Khối cứng nguyên vẹn (Giả thuyết cũ)
        </text>
        {/* Solid wooden cylinder stuck upside down */}
        <g transform="translate(357, 178)">
          <rect x={-165} y={-48} width={330} height={96} rx={22} fill="#B45309" stroke={INK} strokeWidth={4} />
          <line x1={-120} y1={-16} x2={120} y2={-16} stroke="#FDE68A" strokeWidth={3} opacity={0.45} />
          <line x1={-90} y1={18} x2={105} y2={18} stroke="#78350F" strokeWidth={3} opacity={0.55} />
          <text x={0} y={10} textAnchor="middle" fill="#FFFFFF" fontSize={22} fontWeight={900}>
            1 KHỐI CỨNG ĐƠ
          </text>
        </g>
        <CatContrastBadge x={357} y={298} w={510} h={50} text="✕  Không có điểm tựa → ĐỨNG IM!" variant="solidRed" fontSize={21} />
      </g>

      {/* Center VS Pill */}
      <g transform="translate(960, 368)">
        <circle cx={0} cy={0} r={42} fill="#FEF08A" stroke={INK} strokeWidth={4} />
        <text x={0} y={10} textAnchor="middle" fill={INK} fontSize={28} fontWeight={900}>
          VS
        </text>
      </g>

      {/* Right Card: Flexible Cat */}
      <g transform="translate(1020, 192)">
        <rect x={0} y={0} width={715} height={355} rx={26} fill="#ECFDF5" stroke="#15803D" strokeWidth={4} />
        <text x={357} y={46} textAnchor="middle" fill="#14532D" fontSize={25} fontWeight={900}>
          Cơ thể mèo siêu mềm dẻo (Thực tế)
        </text>
        <g transform={`translate(357, 192) rotate(${flexAngle.toFixed(1)})`}>
          <CuteCat x={0} y={42} scale={1.15} frame={frame} pose="curl_midair" />
        </g>
        <CatContrastBadge x={357} y={298} w={540} h={50} text="✓  Tự uốn cong & xoay 2 nửa thân!" variant="solidGreen" fontSize={21} />
      </g>

      {/* Bottom Panel (y=578..752): Stanford 1969 + NASA insight in Step 1 */}
      {activeStep === 0 ? (
        <g transform="translate(960, 666)">
          <rect x={-720} y={-58} width={1440} height={116} rx={24} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={3.2} />
          <text x={0} y={-10} textAnchor="middle" fill="#0F172A" fontSize={24} fontWeight={900}>
            Khối cứng bị khóa chặt bởi định luật vật lý — nhưng sinh vật sống biết biến đổi hình dạng!
          </text>
          <text x={0} y={28} textAnchor="middle" fill="#059669" fontSize={21} fontWeight={800}>
            → Mèo không phá vỡ vật lý, mèo là bậc thầy ứng dụng vật lý!
          </text>
        </g>
      ) : (
        <g transform="translate(185, 576)">
          <rect x={0} y={0} width={1550} height={178} rx={26} fill="#EFF6FF" stroke="#0284C7" strokeWidth={4} />
          {/* Left: 2-cylinder Stanford model diagram */}
          <g transform="translate(275, 89)">
            <rect x={-195} y={-34} width={160} height={68} rx={20} fill="#38BDF8" stroke={INK} strokeWidth={3.4} transform="rotate(-12, -115, 0)" />
            <text x={-115} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={19} fontWeight={900}>Nửa trước</text>
            <circle cx={0} cy={0} r={18} fill="#FACC15" stroke={INK} strokeWidth={3.2} />
            <rect x={35} y={-34} width={160} height={68} rx={20} fill="#FB923C" stroke={INK} strokeWidth={3.4} transform="rotate(12, 115, 0)" />
            <text x={115} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={19} fontWeight={900}>Nửa sau</text>
          </g>
          {/* Middle text */}
          <text x={855} y={56} textAnchor="middle" fill="#0369A1" fontSize={25} fontWeight={900}>
            ĐH Stanford (1969) — Kane &amp; Scher
          </text>
          <text x={855} y={96} textAnchor="middle" fill="#334155" fontSize={21} fontWeight={700}>
            Chia thân mèo thành 2 trục xoay nối nhau bằng khớp eo mềm dẻo
          </text>
          <text x={855} y={136} textAnchor="middle" fill="#0F172A" fontSize={20} fontWeight={800}>
            Giải mã trọn vẹn bài toán hóc búa kéo dài 70 năm!
          </text>
          {/* Right NASA Badge */}
          <CatContrastBadge x={1355} y={89} w={330} h={64} text="🚀 NASA nghiên cứu" variant="solidBlue" fontSize={21} />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_04: CAT_VESTIBULAR_COMPASS (Beats 13–14, steps 0, 1)
 *   - Step 0: Clean cat head cross-section highlighting Eyes (blue) & Inner Ear Vestibular (amber)
 *   - Step 1: Compass needle pointing straight down ("Trọng lực ↓") + millisecond reflex timer
 * ========================================================================== */
export const CatVestibularCompassVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const compassWobble = activeStep === 1 ? Math.sin(frame * 0.2) * 5 : 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="CREAM" gradId="cat04_bg" cardBorder="#D97706" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Bước 1 nhanh hơn chớp mắt: Mèo định vị đâu là mặt đất?'
            : 'La bàn tai trong (Hệ tiền đình): Kích hoạt chỉ sau vài mili giây!'
        }
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={29}
      />

      {/* Left Side: Clean Cat Head Cross-Section (x=540, y=470) */}
      <g transform="translate(520, 470)">
        <circle cx={0} cy={0} r={240} fill="#FFFBEB" stroke="#F59E0B" strokeWidth={4} strokeDasharray="10 8" />
        {/* Cat ears */}
        <polygon points="-135,-105 -160,-230 -32,-158" fill="#FB923C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <polygon points="135,-105 160,-230 32,-158" fill="#FB923C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <polygon points="-114,-118 -132,-196 -52,-148" fill="#FBCFE8" />
        <polygon points="114,-118 132,-196 52,-148" fill="#FBCFE8" />
        {/* Head circle */}
        <circle cx={0} cy={12} r={172} fill="#FDBA74" stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={66} rx={92} ry={58} fill="#FFF7ED" />

        {/* Highlight 1: Eyes (Blue ring) */}
        <g id="cat-head-eyes-highlight">
          <circle cx={-62} cy={-16} r={42} fill="#E0F2FE" stroke="#0284C7" strokeWidth={4} />
          <circle cx={-62} cy={-16} r={18} fill="#0284C7" />
          <circle cx={-62} cy={-16} r={9} fill={INK} />
          <circle cx={-56} cy={-22} r={4} fill="#FFFFFF" />
          <circle cx={26} cy={-16} r={24} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />
          <circle cx={26} cy={-16} r={10} fill={INK} />
        </g>

        {/* Cute nose & mouth */}
        <polygon points="-14,42 14,42 0,58" fill="#FB7185" />
        <path d="M -28,74 Q -14,90 0,74 Q 14,90 28,74" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />

        {/* Highlight 2: Inner Ear Vestibular Organ (Amber spiral glow inside right ear base) */}
        <g transform="translate(106, -54)">
          <circle cx={0} cy={0} r={54} fill="#FEF3C7" stroke="#EA580C" strokeWidth={5} />
          {/* Semicircular canals + fluid icon */}
          <path d="M -24,8 A 24,24 0 1,1 24,8" fill="none" stroke="#D97706" strokeWidth={8} strokeLinecap="round" />
          <path d="M -14,14 A 14,14 0 1,1 14,14" fill="none" stroke="#F59E0B" strokeWidth={6} strokeLinecap="round" />
          <circle cx={0} cy={14} r={8} fill="#EA580C" />
        </g>

        {/* Leader arrows to right-side explanation cards */}
        <path d="M -62,-62 C -20,-175 180,-195 360,-150" fill="none" stroke="#0284C7" strokeWidth={5} strokeDasharray="10 7" />
        <path d="M 164,-54 L 360,-20" fill="none" stroke="#EA580C" strokeWidth={6} />
        <polygon points="374,-18 354,-30 356,-8" fill="#EA580C" />
      </g>

      {/* Right Column: Two Sensory Cards + Step 1 Gravity Compass */}
      <g transform="translate(920, 212)">
        {/* Card 1: Eyes */}
        <rect x={0} y={0} width={810} height={154} rx={24} fill="#F0F9FF" stroke="#0284C7" strokeWidth={4} />
        <circle cx={72} cy={77} r={42} fill="#0284C7" />
        <ellipse cx={72} cy={77} rx={26} ry={16} fill="#FFFFFF" />
        <circle cx={72} cy={77} r={9} fill={INK} />
        <text x={142} y={62} fill="#0369A1" fontSize={26} fontWeight={900}>
          1. Đôi mắt quan sát tức thì
        </text>
        <text x={142} y={104} fill="#334155" fontSize={21} fontWeight={700}>
          Ghi nhận đường chân trời &amp; hướng mặt đất ngay lập tức
        </text>

        {/* Card 2: Vestibular Inner Ear */}
        <rect x={0} y={180} width={810} height={activeStep === 1 ? 344 : 185} rx={24} fill="#FFFBEB" stroke="#EA580C" strokeWidth={4.5} />
        <circle cx={72} cy={262} r={42} fill="#EA580C" />
        <path d="M 56,268 A 18,18 0 1,1 88,268" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
        <circle cx={72} cy={272} r={6} fill="#FEF08A" />
        <text x={142} y={248} fill="#9A3412" fontSize={26} fontWeight={900}>
          2. Hệ tiền đình trong tai trong
        </text>
        <text x={142} y={288} fill="#334155" fontSize={21} fontWeight={700}>
          Ống dịch lỏng siêu nhạy hoạt động như chiếc la bàn sống
        </text>

        {activeStep === 1 && (
          <g transform="translate(40, 326)">
            <rect x={0} y={0} width={730} height={170} rx={20} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={3} />
            {/* Animated Gravity Compass pointing straight DOWN */}
            <g transform={`translate(104, 85) rotate(${compassWobble.toFixed(1)})`}>
              <circle cx={0} cy={0} r={58} fill="#FEF9C3" stroke={INK} strokeWidth={3.8} />
              <polygon points="0,-34 -12,0 12,0" fill="#CBD5E1" stroke={INK} strokeWidth={2.4} />
              <polygon points="0,40 -12,0 12,0" fill="#DC2626" stroke={INK} strokeWidth={2.4} />
              <circle cx={0} cy={0} r={7} fill="#F59E0B" stroke={INK} strokeWidth={2.4} />
            </g>
            <text x={200} y={54} fill="#B91C1C" fontSize={25} fontWeight={900}>
              Trọng lực ↓  (Xác định Trên – Dưới)
            </text>
            <text x={200} y={92} fill="#334155" fontSize={20} fontWeight={700}>
              Dù rơi trong bóng tối, tai trong vẫn báo não ngay:
            </text>
            <CatContrastBadge x={432} y={134} w={460} h={42} text="⚡ Kích hoạt sau vài mili giây!" variant="softAmber" fontSize={20} />
          </g>
        )}
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_05: CAT_FLEXIBLE_SPINE (Beats 15–16, steps 0, 1)
 *   - Step 0: Clean 2D X-ray diagram showing super-flexible cat spine vertebrae
 *   - Step 1: Zoomed shoulder inset showing "Không có xương đòn cứng" (free-floating clavicle)
 * ========================================================================== */
export const CatFlexibleSpineVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const waveAmp = Math.sin(frame * 0.14) * 18;
  const spineCount = 15;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="SKY" gradId="cat05_bg" cardBorder="#0284C7" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Bộ khung xương đặc biệt: Cột sống mèo cực kỳ mềm dẻo!'
            : 'Bí mật vùng vai: Mèo KHÔNG có xương đòn cứng cố định!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {/* Left X-Ray Screen Panel (x=175..1125, y=205..725) */}
      <g transform="translate(175, 205)">
        <rect x={0} y={0} width={activeStep === 1 ? 940 : 1570} height={520} rx={28} fill="#0F172A" stroke="#38BDF8" strokeWidth={5} />
        {/* Subtle diagnostic grid */}
        <g stroke="#1E3A5F" strokeWidth={1.8}>
          {[100, 200, 300, 400].map((gy) => (
            <line key={gy} x1={24} y1={gy} x2={activeStep === 1 ? 916 : 1546} y2={gy} />
          ))}
        </g>

        <text x={activeStep === 1 ? 470 : 785} y={48} textAnchor="middle" fill="#7DD3FC" fontSize={23} fontWeight={900}>
          MÔ PHỎNG X-QUANG 2D • CỘT SỐNG ĐÀN HỒI CỦA MÈO
        </text>

        {/* Cat silhouette outline in soft cyan */}
        <g transform={`translate(${activeStep === 1 ? 470 : 785}, 275) scale(${activeStep === 1 ? 0.92 : 1.18})`}>
          {/* Soft glowing X-ray torso silhouette */}
          <path
            d={`M -280,10 C -260,-95 -80,${(-110 + waveAmp).toFixed(1)} 40,${(-95 - waveAmp * 0.5).toFixed(1)} C 175,-85 265,-25 275,20 C 265,92 145,104 20,90 C -115,104 -255,88 -280,10 Z`}
            fill="#0284C7"
            opacity={0.22}
            stroke="#38BDF8"
            strokeWidth={3.5}
          />
          {/* Cat skull silhouette on right */}
          <circle cx={305} cy={-26} r={54} fill="#0284C7" opacity={0.28} stroke="#7DD3FC" strokeWidth={3.5} />
          <polygon points="274,-68 286,-108 310,-72" fill="#0284C7" opacity={0.3} stroke="#7DD3FC" strokeWidth={3} />
          <polygon points="316,-70 338,-106 346,-62" fill="#0284C7" opacity={0.3} stroke="#7DD3FC" strokeWidth={3} />

          {/* Articulated flexible glowing vertebrae chain */}
          {Array.from({ length: spineCount }, (_, vi) => {
            const t = vi / (spineCount - 1);
            const vx = -235 + t * 470;
            const vy = -12 + Math.sin(t * Math.PI * 1.6 + frame * 0.14) * 26;
            const isShoulder = vi >= 11 && vi <= 13;
            return (
              <g key={vi} transform={`translate(${vx.toFixed(1)}, ${vy.toFixed(1)})`}>
                <rect
                  x={-11}
                  y={-18}
                  width={22}
                  height={36}
                  rx={7}
                  fill={isShoulder && activeStep === 1 ? '#FACC15' : '#E0F2FE'}
                  stroke={isShoulder && activeStep === 1 ? '#EA580C' : '#38BDF8'}
                  strokeWidth={2.6}
                />
              </g>
            );
          })}

          {/* Highlight circle around cat shoulder when Step 1 */}
          {activeStep === 1 && (
            <circle cx={200} cy={14} r={66} fill="none" stroke="#FACC15" strokeWidth={5} strokeDasharray="10 6" />
          )}
        </g>

        {/* Bottom info tag inside X-ray panel */}
        <CatContrastBadge
          x={activeStep === 1 ? 470 : 785}
          y={462}
          w={activeStep === 1 ? 760 : 880}
          h={50}
          text="Hàng loạt đốt sống khớp lỏng + đĩa đệm đàn hồi → Xoắn cực sâu!"
          variant="solidBlue"
          fontSize={20}
        />
      </g>

      {/* Right Zoomed Shoulder Card (Step 1 only) */}
      {activeStep === 1 && (
        <g transform="translate(1145, 205)">
          <rect x={0} y={0} width={600} height={520} rx={28} fill="#FFFBEB" stroke="#EA580C" strokeWidth={4.5} />
          <text x={300} y={50} textAnchor="middle" fill="#9A3412" fontSize={25} fontWeight={900}>
            Zoom vùng vai: Khác hẳn con người!
          </text>

          {/* Box 1: Human rigid collarbone */}
          <g transform="translate(36, 82)">
            <rect x={0} y={0} width={528} height={160} rx={20} fill="#FEF2F2" stroke="#DC2626" strokeWidth={3} />
            <text x={264} y={38} textAnchor="middle" fill="#991B1B" fontSize={21} fontWeight={900}>
              ✕  Con người: Xương đòn cứng nối cố định
            </text>
            {/* Rigid horizontal collarbone bar locked between shoulders */}
            <circle cx={144} cy={96} r={18} fill="#94A3B8" stroke={INK} strokeWidth={3} />
            <circle cx={384} cy={96} r={18} fill="#94A3B8" stroke={INK} strokeWidth={3} />
            <rect x={156} y={84} width={216} height={24} rx={10} fill="#EF4444" stroke={INK} strokeWidth={3} />
            <text x={264} y={142} textAnchor="middle" fill="#64748B" fontSize={18} fontWeight={700}>
              Khóa khung vai với ngực → Khó xoay gắt
            </text>
          </g>

          {/* Box 2: Cat floating tiny clavicle */}
          <g transform="translate(36, 266)">
            <rect x={0} y={0} width={528} height={220} rx={20} fill="#ECFDF5" stroke="#15803D" strokeWidth={3.5} />
            <text x={264} y={38} textAnchor="middle" fill="#14532D" fontSize={21} fontWeight={900}>
              ✓  Loài mèo: KHÔNG có xương đòn cứng!
            </text>
            {/* Free-floating tiny bone inside soft muscle oval */}
            <ellipse cx={264} cy={104} rx={165} ry={42} fill="#BBF7D0" stroke="#16A34A" strokeWidth={2.5} strokeDasharray="8 6" />
            <rect x={234} y={96} width={60} height={16} rx={8} fill="#FFFFFF" stroke="#15803D" strokeWidth={3} />
            <path d="M 148,104 A 36,36 0 0,1 180,72" fill="none" stroke="#15803D" strokeWidth={4} strokeLinecap="round" />
            <path d="M 380,104 A 36,36 0 0,0 348,72" fill="none" stroke="#15803D" strokeWidth={4} strokeLinecap="round" />
            <text x={264} y={172} textAnchor="middle" fill="#14532D" fontSize={19} fontWeight={800}>
              Chỉ là mảnh xương nhỏ treo tự do trong cơ
            </text>
            <text x={264} y={200} textAnchor="middle" fill="#059669" fontSize={18.5} fontWeight={800}>
              → Nửa thân trước xoay vặn cực kỳ tự do!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_06: CAT_SKATER_PHYSICS (Beats 18–19, steps 0, 1)
 *   - Step 0: Figure skater with arms wide open (Quán tính lớn -> Xoay chậm)
 *   - Step 1: Figure skater with arms tucked tight (Quán tính nhỏ -> Xoay cực nhanh!)
 * ========================================================================== */
export const CatSkaterPhysicsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const slowSpinX = Math.cos(frame * 0.06);
  const fastSpinX = Math.cos(frame * 0.34);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="SKY" gradId="cat06_bg" cardBorder="#0284C7" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Quy tắc trượt băng: Dang rộng hai tay → Xoay chậm'
            : 'Thu gọn tay sát ngực → Quán tính giảm mạnh, xoay vút cực nhanh!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {/* Left Panel: Arms Wide (Slow Spin) */}
      <g transform="translate(175, 198)">
        <rect
          x={0}
          y={0}
          width={720}
          height={545}
          rx={28}
          fill="#F0F9FF"
          stroke={activeStep === 0 ? '#0284C7' : '#94A3B8'}
          strokeWidth={activeStep === 0 ? 5 : 3}
        />
        <text x={360} y={48} textAnchor="middle" fill="#0369A1" fontSize={26} fontWeight={900}>
          1. Dang rộng hai tay ra ngoài
        </text>

        {/* Ice rink oval */}
        <ellipse cx={360} cy={418} rx={210} ry={40} fill="#BAE6FD" stroke="#0284C7" strokeWidth={3} />
        {/* Slow blue spin arrows */}
        <path d="M 190,340 A 175,46 0 0,0 530,340" fill="none" stroke="#38BDF8" strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" />
        <polygon points="540,336 516,326 520,350" fill="#0284C7" />

        {/* Cute 2D Skater with wide arms */}
        <g transform="translate(360, 412)">
          {/* Skate blade + standing leg */}
          <line x1={-8} y1={-90} x2={-8} y2={0} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <line x1={12} y1={-90} x2={46} y2={-30} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <line x1={-24} y1={4} x2={14} y2={4} stroke="#0284C7" strokeWidth={6} strokeLinecap="round" />
          {/* Dress torso */}
          <polygon points="0,-195 -46,-88 46,-88" fill="#38BDF8" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {/* Arms stretched wide */}
          <line
            x1={(-145 * Math.abs(slowSpinX * 0.4 + 0.6)).toFixed(1)}
            y1={-168}
            x2={(145 * Math.abs(slowSpinX * 0.4 + 0.6)).toFixed(1)}
            y2={-168}
            stroke={INK}
            strokeWidth={7.5}
            strokeLinecap="round"
          />
          <circle cx={(-145 * Math.abs(slowSpinX * 0.4 + 0.6)).toFixed(1)} cy={-168} r={11} fill="#FDE68A" stroke={INK} strokeWidth={3} />
          <circle cx={(145 * Math.abs(slowSpinX * 0.4 + 0.6)).toFixed(1)} cy={-168} r={11} fill="#FDE68A" stroke={INK} strokeWidth={3} />
          {/* Head */}
          <circle cx={0} cy={-232} r={34} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
          <path d="M -28,-244 Q 0,-276 28,-244 Z" fill="#1E293B" />
          <circle cx={-11} cy={-232} r={4} fill={INK} />
          <circle cx={11} cy={-232} r={4} fill={INK} />
          <path d="M -9,-216 Q 0,-208 9,-216" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
        </g>

        <CatContrastBadge x={360} y={495} w={500} h={50} text="Quán tính lớn → Xoay chậm" variant="solidBlue" fontSize={22} />
      </g>

      {/* Center Transformation Arrow */}
      <g transform="translate(960, 468)" opacity={activeStep === 1 ? 1 : 0.35}>
        <polygon points="-46,-18 14,-18 14,-40 54,0 14,40 14,18 -46,18" fill="#F59E0B" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      </g>

      {/* Right Panel: Arms Tucked (Super Fast Spin — highlights brightly in Step 1) */}
      <g transform="translate(1025, 198)" opacity={activeStep === 1 ? 1 : 0.32}>
        <rect
          x={0}
          y={0}
          width={720}
          height={545}
          rx={28}
          fill="#FFF7ED"
          stroke={activeStep === 1 ? '#EA580C' : '#CBD5E1'}
          strokeWidth={activeStep === 1 ? 5 : 3}
        />
        <text x={360} y={48} textAnchor="middle" fill="#C2410C" fontSize={26} fontWeight={900}>
          2. Thu gọn hai tay sát ngực
        </text>

        {/* Ice rink oval */}
        <ellipse cx={360} cy={418} rx={210} ry={40} fill="#FED7AA" stroke="#EA580C" strokeWidth={3} />
        {/* Rapid vivid orange tornado spin rings */}
        {[0, 1, 2].map((ri) => (
          <path
            key={ri}
            d={`M ${245 - ri * 18},${350 - ri * 62} A ${115 + ri * 18},28 0 0,0 ${475 + ri * 18},${350 - ri * 62}`}
            fill="none"
            stroke={ri === 1 ? '#DC2626' : '#EA580C'}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ))}
        <polygon points="498,284 472,272 478,298" fill="#DC2626" />

        {/* Cute 2D Skater with tucked arms spinning rapidly */}
        <g transform={`translate(360, 412) scale(${(0.86 + Math.abs(fastSpinX) * 0.14).toFixed(3)}, 1)`}>
          <line x1={-6} y1={-90} x2={-6} y2={0} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <line x1={8} y1={-90} x2={8} y2={-6} stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <line x1={-22} y1={4} x2={16} y2={4} stroke="#EA580C" strokeWidth={6} strokeLinecap="round" />
          <polygon points="0,-195 -40,-88 40,-88" fill="#F97316" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {/* Arms tucked tight across chest */}
          <path d="M -26,-168 Q 0,-142 26,-168" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={-232} r={34} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
          <path d="M -28,-244 Q 0,-276 28,-244 Z" fill="#1E293B" />
          <circle cx={-10} cy={-232} r={4} fill={INK} />
          <circle cx={10} cy={-232} r={4} fill={INK} />
          <path d="M -10,-215 Q 0,-204 10,-215" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        </g>

        <CatContrastBadge x={360} y={495} w={540} h={50} text="⚡ Quán tính nhỏ → Xoay vút cực nhanh!" variant="solidGreen" fontSize={21} />
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_07: CAT_TWO_HALF_TURN (Beats 20–22, steps 0, 1, 2)
 *   - Step 0: Arch back to split Front Half (blue) and Back Half (orange)
 *   - Step 1: Tuck front paws (+90° fast) & stretch back paws (-10° slow anchor)
 *   - Step 2: Swap roles — stretch front paws & tuck back paws to complete full 180° flip!
 * ========================================================================== */
export const CatTwoHalfTurnVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = Math.min(2, step ?? visualStep ?? 0);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.22);

  const stepsMeta = [
    { num: 'Bước 1', title: 'Gập lưng tách 2 nửa' },
    { num: 'Bước 2', title: 'Thu trước – Duỗi sau' },
    { num: 'Bước 3', title: 'Đổi vai lật trọn 180°' },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="FOREST" gradId="cat07_bg" cardBorder="#15803D" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Vũ điệu xoay 2 nửa thân — Bước 1: Gập cong lưng tách 2 trục'
            : activeStep === 1
            ? 'Bước 2: Thu chân trước xoay vọt (+90°), duỗi chân sau làm mỏ neo (-10°)'
            : 'Bước 3: Đổi vai — Duỗi trước làm trụ, thu sau đuổi kịp trọn 180°!'
        }
        bg="#FFFFFF"
        color="#14532D"
        border="#15803D"
        fontSize={27}
      />

      {/* Top 3-Step Progress Pills (y=186..240) */}
      <g transform="translate(215, 186)">
        {stepsMeta.map((sm, idx) => {
          const isCurrent = idx === activeStep;
          const isDone = idx < activeStep;
          const sx = idx * 515;
          return (
            <g key={idx} transform={`translate(${sx}, 0)`}>
              <rect
                x={0}
                y={0}
                width={460}
                height={56}
                rx={28}
                fill={isCurrent ? '#15803D' : isDone ? '#DCFCE7' : '#F1F5F9'}
                stroke={isCurrent || isDone ? '#15803D' : '#CBD5E1'}
                strokeWidth={3.5}
              />
              <text
                x={230}
                y={36}
                textAnchor="middle"
                fill={isCurrent ? '#FFFFFF' : isDone ? '#14532D' : '#64748B'}
                fontSize={21}
                fontWeight={900}
              >
                {isDone ? '✓ ' : ''}{sm.num}: {sm.title}
              </text>
            </g>
          );
        })}
      </g>

      {/* Main Illustration Area (y=264..648) */}
      <g transform="translate(175, 266)">
        <rect x={0} y={0} width={1570} height={378} rx={26} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={3.5} />

        {/* Vertical dashed waist divider line */}
        <line x1={785} y1={32} x2={785} y2={346} stroke="#64748B" strokeWidth={4} strokeDasharray="12 10" />
        <rect x={695} y={14} width={180} height={34} rx={17} fill="#FEF08A" stroke={INK} strokeWidth={2.6} />
        <text x={785} y={37} textAnchor="middle" fill={INK} fontSize={17} fontWeight={900}>
          Khớp eo mềm
        </text>

        {/* Left Side: Front Half (Sky Blue theme) */}
        <g transform="translate(420, 200)">
          <rect x={-320} y={-136} width={620} height={272} rx={22} fill="#EFF6FF" stroke="#0284C7" strokeWidth={3.5} />
          <text x={-10} y={-96} textAnchor="middle" fill="#0369A1" fontSize={23} fontWeight={900}>
            Nửa thân trước (Đầu + 2 chân trước)
          </text>

          {/* Front body schematic */}
          <g transform={`translate(-10, 14) scale(0.80) rotate(${activeStep === 0 ? 180 : activeStep === 1 ? 26 : 0})`}>
            {/* Rounded body cylinder */}
            <rect x={-120} y={-38} width={210} height={76} rx={36} fill="#38BDF8" stroke={INK} strokeWidth={4} />
            {/* Cute cat head attached to front */}
            <circle cx={-122} cy={-10} r={42} fill="#FB923C" stroke={INK} strokeWidth={4} />
            <polygon points="-148,-36 -156,-72 -122,-48" fill="#FB923C" stroke={INK} strokeWidth={3.2} />
            <polygon points="-96,-36 -88,-72 -120,-48" fill="#FB923C" stroke={INK} strokeWidth={3.2} />
            <circle cx={-134} cy={-14} r={5} fill={INK} />
            <circle cx={-110} cy={-14} r={5} fill={INK} />
            {/* Front paws: tucked tight in Step 1, extended wide in Step 2 */}
            {activeStep === 1 ? (
              <g>
                <rect x={-96} y={24} width={22} height={28} rx={10} fill="#FDBA74" stroke={INK} strokeWidth={3.2} />
                <rect x={-64} y={24} width={22} height={28} rx={10} fill="#FDBA74" stroke={INK} strokeWidth={3.2} />
              </g>
            ) : (
              <g>
                <rect x={-96} y={26} width={24} height={64} rx={10} fill="#FDBA74" stroke={INK} strokeWidth={3.2} />
                <rect x={-52} y={26} width={24} height={64} rx={10} fill="#FDBA74" stroke={INK} strokeWidth={3.2} />
              </g>
            )}
          </g>

          {/* Rotation arrow badge on Front Half */}
          {activeStep === 1 && (
            <g transform="translate(200, 12)">
              <path d="M -30,-44 A 46,46 0 1,1 26,38" fill="none" stroke="#0284C7" strokeWidth={8} strokeLinecap="round" />
              <polygon points="34,46 10,44 26,24" fill="#0284C7" />
              <text x={0} y={8} textAnchor="middle" fill="#0369A1" fontSize={26} fontWeight={900}>
                +90°
              </text>
            </g>
          )}
          {activeStep === 2 && (
            <CatContrastBadge x={-10} y={108} w={390} h={40} text="Duỗi rộng chân trước làm trụ" variant="solidBlue" fontSize={18.5} />
          )}
          {activeStep === 1 && (
            <CatContrastBadge x={-10} y={108} w={420} h={40} text="Thu sát chân trước → Xoay vọt!" variant="solidBlue" fontSize={18.5} />
          )}
        </g>

        {/* Right Side: Back Half (Orange theme) */}
        <g transform="translate(1150, 200)">
          <rect x={-300} y={-136} width={620} height={272} rx={22} fill="#FFF7ED" stroke="#EA580C" strokeWidth={3.5} />
          <text x={10} y={-96} textAnchor="middle" fill="#C2410C" fontSize={23} fontWeight={900}>
            Nửa thân sau (Hông + 2 chân sau)
          </text>

          {/* Back body schematic */}
          <g transform={`translate(10, 14) scale(0.80) rotate(${activeStep === 0 ? 180 : activeStep === 1 ? 168 : 0})`}>
            <rect x={-95} y={-38} width={210} height={76} rx={36} fill="#FB923C" stroke={INK} strokeWidth={4} />
            {/* Tail */}
            <path d="M 110,-8 Q 165,-42 152,-82" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
            <path d="M 110,-8 Q 165,-42 152,-82" fill="none" stroke="#FB923C" strokeWidth={6} strokeLinecap="round" />
            {/* Rear legs: extended wide in Step 1, tucked tight to whip around in Step 2 */}
            {activeStep === 2 ? (
              <g>
                <rect x={28} y={24} width={22} height={30} rx={10} fill="#FDBA74" stroke={INK} strokeWidth={3.2} />
                <rect x={62} y={24} width={22} height={30} rx={10} fill="#FDBA74" stroke={INK} strokeWidth={3.2} />
              </g>
            ) : (
              <g>
                <rect x={18} y={26} width={24} height={68} rx={10} fill="#FDBA74" stroke={INK} strokeWidth={3.2} />
                <rect x={64} y={26} width={24} height={68} rx={10} fill="#FDBA74" stroke={INK} strokeWidth={3.2} />
              </g>
            )}
          </g>

          {activeStep === 1 && (
            <g transform="translate(-206, 12)">
              <path d="M 24,26 A 32,32 0 0,1 -16,-24" fill="none" stroke="#EA580C" strokeWidth={6} strokeLinecap="round" />
              <polygon points="-24,-30 -4,-28 -16,-12" fill="#EA580C" />
              <text x={8} y={8} textAnchor="middle" fill="#C2410C" fontSize={23} fontWeight={900}>
                -10°
              </text>
            </g>
          )}
          {activeStep === 2 && (
            <g transform={`translate(-200, 10) scale(${(1 + pulse * 0.05).toFixed(3)})`}>
              <path d="M -26,-40 A 44,44 0 1,1 24,34" fill="none" stroke="#15803D" strokeWidth={8} strokeLinecap="round" />
              <polygon points="32,42 10,40 24,22" fill="#15803D" />
              <text x={0} y={8} textAnchor="middle" fill="#14532D" fontSize={22} fontWeight={900}>
                Đuổi kịp!
              </text>
            </g>
          )}
          {activeStep === 1 && (
            <CatContrastBadge x={10} y={108} w={420} h={40} text="Duỗi rộng chân sau làm mỏ neo" variant="softAmber" fontSize={18.5} />
          )}
          {activeStep === 2 && (
            <CatContrastBadge x={10} y={108} w={420} h={40} text="Thu gọn chân sau → Xoay đuổi kịp!" variant="solidGreen" fontSize={18.5} />
          )}
        </g>
      </g>

      {/* Bottom Summary Strip (y=672..748) */}
      <g transform="translate(960, 710)">
        {activeStep === 0 && (
          <CatContrastBadge x={0} y={0} w={1160} h={58} text="Cột sống siêu dẻo gập cong hình chữ U → Tách riêng 2 trục xoay độc lập!" variant="softAmber" fontSize={22} />
        )}
        {activeStep === 1 && (
          <CatContrastBadge x={0} y={0} w={1180} h={58} text="Nửa trước xoay vọt (+90°)  +  Nửa sau xoay ngược ít (-10°)  →  Bảo toàn mô men = 0!" variant="solidBlue" fontSize={21.5} />
        )}
        {activeStep === 2 && (
          <CatContrastBadge x={0} y={0} w={1160} h={58} text="✓ Hoàn tất lật trọn 180° — Cả 4 bàn chân úp xuống mặt đất gọn gàng!" variant="solidGreen" fontSize={23} />
        )}
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_08: CAT_ZERO_ANGULAR_MOMENTUM (Beats 23–24, steps 0, 1)
 *   - Step 0: Balanced physics scale: Xoay thuận (nhanh, nhẹ) == Xoay ngược (chậm, nặng) -> Tổng mô men = 0
 *   - Step 1: 4 crisp timeline frames (0,0s -> 0,1s -> 0,2s -> 0,35s) explaining why 30 cm is enough!
 * ========================================================================== */
export const CatZeroAngularMomentumVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const microTilt = Math.sin(frame * 0.08) * 1.4;

  const timelineSteps = [
    { time: '0,0 s', deg: 180, title: 'Bắt đầu rơi ngửa', sub: 'Tai trong phát hiện ngay', color: '#64748B', bg: '#F8FAFC' },
    { time: '0,1 s', deg: 110, title: 'Đầu & chân trước xoay', sub: 'Thu sát đầu, xoay vút!', color: '#0284C7', bg: '#EFF6FF' },
    { time: '0,2 s', deg: 38, title: 'Nửa thân sau đuổi kịp', sub: 'Đổi vai thu chân sau', color: '#EA580C', bg: '#FFF7ED' },
    { time: '0,35 s', deg: 0, title: 'Sẵn sàng đáp 4 chân', sub: 'Kịp ngay từ độ cao 30 cm!', color: '#15803D', bg: '#ECFDF5' },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="MINT" gradId="cat08_bg" cardBorder="#059669" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Cân bằng hoàn hảo: Tổng mô men động lượng luôn bằng 0!'
            : 'Tốc độ chớp nhoáng 0,0s → 0,35s: Lý do thả cực thấp vẫn kịp!'
        }
        bg="#FFFFFF"
        color="#065F46"
        border="#059669"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Physics Balance Scale cleanly inside y=210..650 */}
          <g transform="translate(960, 565)">
            {/* Base pedestal */}
            <polygon points="-110,48 110,48 65,-8 -65,-8" fill="#475569" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <rect x={-18} y={-235} width={36} height={232} rx={8} fill="#64748B" stroke={INK} strokeWidth={4} />
            {/* Perfectly Level Beam */}
            <g transform={`translate(0, -220) rotate(${microTilt.toFixed(2)})`}>
              <rect x={-520} y={-14} width={1040} height={28} rx={14} fill="#F59E0B" stroke={INK} strokeWidth={4} />
              <circle cx={0} cy={0} r={22} fill="#FEF08A" stroke={INK} strokeWidth={4} />

              {/* Left Pan: Fast light forward spin */}
              <g transform="translate(-445, 14)">
                <line x1={0} y1={0} x2={-110} y2={106} stroke="#475569" strokeWidth={4} />
                <line x1={0} y1={0} x2={110} y2={106} stroke="#475569" strokeWidth={4} />
                <rect x={-215} y={102} width={430} height={148} rx={22} fill="#EFF6FF" stroke="#0284C7" strokeWidth={4} />
                <text x={0} y={146} textAnchor="middle" fill="#0369A1" fontSize={24} fontWeight={900}>
                  Xoay thuận chiều
                </text>
                <text x={0} y={184} textAnchor="middle" fill="#334155" fontSize={20} fontWeight={800}>
                  Quán tính NHỎ × Tốc độ NHANH
                </text>
                <text x={0} y={222} textAnchor="middle" fill="#0284C7" fontSize={22} fontWeight={900}>
                  (+L)
                </text>
              </g>

              {/* Right Pan: Slow heavy counter spin */}
              <g transform="translate(445, 14)">
                <line x1={0} y1={0} x2={-110} y2={106} stroke="#475569" strokeWidth={4} />
                <line x1={0} y1={0} x2={110} y2={106} stroke="#475569" strokeWidth={4} />
                <rect x={-215} y={102} width={430} height={148} rx={22} fill="#FFF7ED" stroke="#EA580C" strokeWidth={4} />
                <text x={0} y={146} textAnchor="middle" fill="#C2410C" fontSize={24} fontWeight={900}>
                  Xoay ngược chiều
                </text>
                <text x={0} y={184} textAnchor="middle" fill="#334155" fontSize={20} fontWeight={800}>
                  Quán tính LỚN × Tốc độ CHẬM
                </text>
                <text x={0} y={222} textAnchor="middle" fill="#EA580C" fontSize={22} fontWeight={900}>
                  (-L)
                </text>
              </g>
            </g>
          </g>

          {/* Bottom Equation Result Banner (well separated from scale base at y=613 -> placed at y=708) */}
          <CatContrastBadge
            x={960}
            y={708}
            w={920}
            h={60}
            text="(+L)  +  (-L)  =  0   →   TỔNG MÔ MEN ĐỘNG LƯỢNG = 0 ✓"
            variant="solidGreen"
            fontSize={23}
          />
        </g>
      ) : (
        <g>
          {/* 4 Crisp Timeline Sequence Cards (y=205..625) */}
          <g transform="translate(175, 208)">
            {timelineSteps.map((ts, idx) => {
              const cx = idx * 400;
              return (
                <g key={idx} transform={`translate(${cx}, 0)`}>
                  <rect x={0} y={0} width={370} height={418} rx={26} fill={ts.bg} stroke={ts.color} strokeWidth={4.2} />
                  {/* Time badge */}
                  <rect x={100} y={20} width={170} height={44} rx={22} fill={ts.color} />
                  <text x={185} y={50} textAnchor="middle" fill="#FFFFFF" fontSize={24} fontWeight={900}>
                    {ts.time}
                  </text>
                  {/* Cat illustration box */}
                  <rect x={28} y={82} width={314} height={212} rx={20} fill="#FFFFFF" stroke={ts.color} strokeWidth={2.5} />
                  <g transform={`translate(185, 192) rotate(${ts.deg})`}>
                    <CuteCat x={0} y={40} scale={0.86} frame={frame + idx * 18} pose={idx === 3 ? 'stand' : 'curl_midair'} />
                  </g>
                  <text x={185} y={338} textAnchor="middle" fill={ts.color} fontSize={22} fontWeight={900}>
                    {ts.title}
                  </text>
                  <text x={185} y={376} textAnchor="middle" fill="#334155" fontSize={18.5} fontWeight={700}>
                    {ts.sub}
                  </text>
                  {idx < 3 && (
                    <polygon points="376,208 394,194 394,222" fill="#059669" transform="rotate(180, 385, 208)" />
                  )}
                </g>
              );
            })}
          </g>

          {/* Bottom Highlight Pill */}
          <g transform="translate(960, 704)">
            <rect x={-640} y={-34} width={1280} height={68} rx={34} fill="#ECFDF5" stroke="#15803D" strokeWidth={3.5} />
            <CatCheckCircle cx={-590} cy={0} r={20} bg="#15803D" />
            <text x={16} y={9} textAnchor="middle" fill="#14532D" fontSize={23} fontWeight={900}>
              Chân trước thu cực sát đầu → Góc xoay diễn ra trong tích tắc dù thả rất thấp!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};
