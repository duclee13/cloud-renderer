import React from 'react';
import type { EpisodeVisualProps } from './index';
import { GroundShadow } from '../../SceneBackdropKit';
import {
  INK,
  FONT,
  NgapCleanLabel,
  NgapStageCardBackdrop,
  NgapBrainEmblem,
  NgapFaceBadge,
} from './ngapSharedAssets';

/* ============================================================================
 * SVG_01: NGAP_DOMINO_EFFECT (Beats 7–8, steps 0, 1)
 *   - Step 0: Video screen on left + 10 minimalist silhouettes (6 light up orange yawning: 50%–65%)
 *   - Step 1: 3 cards (Nhìn thấy, Nghe tiếng, Đọc / Nghĩ tới) firing arrows into brain
 * ========================================================================== */
export const NgapDominoEffectVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.2);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="CREAM" gradId="ng01_bg" cardBorder="#EA580C" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Thí nghiệm: 50% – 65% người lớn ngáp theo sau khi xem video ngáp'
            : 'Không cần nhìn tận mắt: Nghe tiếng hay đọc chữ cũng đủ kích hoạt!'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Left Video Screen Emblem */}
          <g transform="translate(390, 465)">
            <GroundShadow cx={0} cy={176} rx={165} ry={12} />
            <rect x="-165" y="-128" width="330" height="240" rx="22" fill="#1E293B" stroke={INK} strokeWidth="5" />
            <rect x="-145" y="-108" width="290" height="196" rx="14" fill="#FFF7ED" stroke="#EA580C" strokeWidth="3.5" />
            <NgapFaceBadge x={0} y={-14} r={54} mode="yawn" bg="#FEF3C7" border="#EA580C" />
            <rect x="-44" y="112" width="88" height="24" rx="6" fill="#475569" stroke={INK} strokeWidth="3" />
            <rect x="-86" y="136" width="172" height="16" rx="8" fill="#64748B" stroke={INK} strokeWidth="3" />
            <text x="0" y="196" textAnchor="middle" fill="#1E293B" stroke="none" fontSize="22" fontWeight="900">
              Video người đang ngáp
            </text>
          </g>

          {/* Animated Wave Arrow to 10-person Grid */}
          <path
            d="M 590 465 L 705 465"
            fill="none"
            stroke="#EA580C"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="16 12"
            strokeDashoffset={-(frame * 4)}
          />
          <polygon points="722,465 692,448 692,482" fill="#EA580C" />

          {/* 10 Minimalist People Grid (2 rows x 5 cols): 6 lit orange yawning */}
          {Array.from({ length: 10 }).map((_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const px = 835 + col * 195;
            const py = row === 0 ? 335 : 550;
            const isYawning = i < 6;
            const activePop = isYawning && frame > i * 6 ? 1 : isYawning ? 0.85 : 1;
            return (
              <g key={i} transform={`translate(${px}, ${py}) scale(${activePop})`}>
                {isYawning && (
                  <circle cx="0" cy="0" r={62 + pulse * 5} fill="#FB923C" opacity="0.22" />
                )}
                <NgapFaceBadge
                  x={0}
                  y={-18}
                  r={40}
                  mode={isYawning ? 'yawn' : 'calm'}
                  bg={isYawning ? '#FFEDD5' : '#F1F5F9'}
                  border={isYawning ? '#EA580C' : '#64748B'}
                />
                <path
                  d="M -32 62 C -32 34 -18 24 0 24 C 18 24 32 34 32 62 Z"
                  fill={isYawning ? '#F97316' : '#CBD5E1'}
                  stroke={isYawning ? '#9A3412' : '#475569'}
                  strokeWidth="3.2"
                />
              </g>
            );
          })}

          {/* Crisp Result Badge below Grid */}
          <rect x="920" y="668" width="600" height="70" rx="22" fill="#FFF7ED" stroke="#EA580C" strokeWidth="3.8" />
          <text x="1220" y="712" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="27" fontWeight="900">
            6 / 10 người lớn (50% – 65%) ngáp theo!
          </text>
        </g>
      ) : (
        <g>
          {/* 3 Trigger Cards on Left shooting arrows into Central-Right Brain */}
          {[
            { y: 270, title: '1. Nhìn thấy', sub: 'Thấy người đối diện hoặc video', color: '#0284C7', bg: '#F0F9FF', icon: 'EYE' },
            { y: 465, title: '2. Nghe tiếng', sub: 'Chỉ nghe âm thanh qua điện thoại', color: '#EA580C', bg: '#FFF7ED', icon: 'EAR' },
            { y: 660, title: '3. Đọc / Nghĩ tới', sub: 'Thấy chữ "Ngáp" trên giấy/màn hình', color: '#7C3AED', bg: '#F5F3FF', icon: 'TEXT' },
          ].map((c, idx) => (
            <g key={idx}>
              <g transform={`translate(275, ${c.y - 68})`}>
                <rect x="0" y="0" width="650" height="136" rx="22" fill={c.bg} stroke={c.color} strokeWidth="4" />
                <circle cx="78" cy="68" r="42" fill="#FFFFFF" stroke={c.color} strokeWidth="3.5" />
                {c.icon === 'EYE' && (
                  <g transform="translate(78, 68)">
                    <path d="M -26 0 Q 0 -22 26 0 Q 0 22 -26 0 Z" fill="#E0F2FE" stroke={c.color} strokeWidth="3.5" />
                    <circle cx="0" cy="0" r="10" fill={c.color} />
                    <circle cx="0" cy="0" r="4.5" fill={INK} />
                  </g>
                )}
                {c.icon === 'EAR' && (
                  <g transform="translate(78, 68)" fill="none" stroke={c.color} strokeWidth="4" strokeLinecap="round">
                    <path d="M -10 -14 Q 6 -22 10 -4 Q 12 10 0 18" />
                    <path d="M -22 -10 Q -28 0 -22 10" />
                    <path d="M -14 -6 Q -18 0 -14 6" />
                  </g>
                )}
                {c.icon === 'TEXT' && (
                  <text x="78" y="76" textAnchor="middle" fill={c.color} stroke="none" fontSize="22" fontWeight="900">
                    NGÁP
                  </text>
                )}
                <text x="148" y="58" textAnchor="start" fill={c.color} stroke="none" fontSize="28" fontWeight="900">
                  {c.title}
                </text>
                <text x="148" y="96" textAnchor="start" fill="#334155" stroke="none" fontSize="21" fontWeight="700">
                  {c.sub}
                </text>
              </g>
              <path
                d={`M 940 ${c.y} C 1070 ${c.y} 1120 465 1255 465`}
                fill="none"
                stroke={c.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="16 12"
                strokeDashoffset={-(frame * 4.2 + idx * 14)}
              />
            </g>
          ))}
          <polygon points="1272,465 1244,448 1244,482" fill="#EA580C" />

          {/* Brain Emblem on Right */}
          <NgapBrainEmblem
            x={1465}
            y={455}
            scale={1.45}
            glowColor="#FB923C"
            glowOpacity={0.25 + pulse * 0.14}
            highlightMirror={true}
          />
          <rect x="1310" y="616" width="310" height="58" rx="18" fill="#FFF7ED" stroke="#EA580C" strokeWidth="3.5" />
          <text x="1465" y="653" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="23" fontWeight="900">
            Não kích hoạt cơn ngáp!
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_02: NGAP_MYTH_OXYGEN (Beats 10–11, steps 0, 1)
 *   - Step 0: Lungs + thought cloud "Thiếu O2?" + big question mark
 *   - Step 1: CO2 experiment bars: Nhịp thở shoots UP vs Số lần ngáp FLAT + Red X on Thiếu O2
 * ========================================================================== */
export const NgapMythOxygenVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const breath = Math.sin(frame * 0.12) * 4;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="SKY" gradId="ng02_bg" cardBorder="#0284C7" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Hiểu nhầm quen thuộc: Ngáp có phải vì cơ thể đang thiếu O2?'
            : 'Thí nghiệm khoa học bác bỏ: Tăng CO2 chỉ làm thở nhanh hơn, KHÔNG ngáp thêm!'
        }
        bg="#FFFFFF"
        color={activeStep === 0 ? '#0369A1' : '#991B1B'}
        border={activeStep === 0 ? '#0284C7' : '#EF4444'}
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Clean 2D Lungs on Left-Center */}
          <g transform={`translate(710, 480) scale(${(1 + breath * 0.008).toFixed(3)})`}>
            {/* Trachea */}
            <rect x="-18" y="-175" width="36" height="96" rx="10" fill="#BAE6FD" stroke={INK} strokeWidth="4" />
            <line x1="-16" y1="-145" x2="16" y2="-145" stroke="#0284C7" strokeWidth="3.5" />
            <line x1="-16" y1="-120" x2="16" y2="-120" stroke="#0284C7" strokeWidth="3.5" />
            {/* Left & Right Lung lobes */}
            <path
              d="M -22 -86 C -95 -96 -155 -25 -150 75 C -145 145 -85 170 -36 142 C -18 130 -16 80 -18 -20 Z"
              fill="#FDA4AF"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <path
              d="M 22 -86 C 95 -96 155 -25 150 75 C 145 145 85 170 36 142 C 18 130 16 80 18 -20 Z"
              fill="#FDA4AF"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <text x="0" y="205" textAnchor="middle" fill="#0F172A" stroke="none" fontSize="25" fontWeight="900">
              Lá phổi con người
            </text>
          </g>

          {/* Thought Cloud "Thiếu O2?" on Right */}
          <g transform="translate(1245, 435)">
            <path
              d="M -165 55 C -220 55 -235 -18 -175 -42 C -165 -115 -65 -140 -10 -95 C 45 -140 165 -115 175 -35 C 235 -15 225 55 165 55 Z"
              fill="#E0F2FE"
              stroke="#0284C7"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <text x="0" y="-12" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="42" fontWeight="900">
              Thiếu O<tspan dy="7" fontSize="28">2</tspan><tspan dy="-7">?</tspan>
            </text>
            <text x="0" y="34" textAnchor="middle" fill="#475569" stroke="none" fontSize="22" fontWeight="700">
              Lời đồn dân gian truyền miệng
            </text>
            <circle cx="170" cy="-108" r="42" fill="#FEF08A" stroke="#D97706" strokeWidth="4" />
            <text x="170" y="-93" textAnchor="middle" fill="#B45309" stroke="none" fontSize="44" fontWeight="900">
              ?
            </text>
          </g>
        </g>
      ) : (
        <g>
          {/* Left Header Pill: Khi hít thêm CO2 */}
          <rect x="245" y="210" width="930" height="62" rx="18" fill="#EFF6FF" stroke="#0284C7" strokeWidth="3.2" />
          <text x="710" y="250" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="25" fontWeight="900">
            Thí nghiệm tăng khí CO<tspan dy="5" fontSize="18">2</tspan><tspan dy="-5"> (Provine et al.): So sánh 2 phản ứng</tspan>
          </text>

          {/* Bar Chart Baseline */}
          <line x1="280" y1="640" x2="1140" y2="640" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />

          {/* Column 1: Nhịp thở tăng vọt */}
          <g transform="translate(475, 0)">
            <rect x="-85" y="335" width="170" height="305" rx="18" fill="#10B981" stroke={INK} strokeWidth="4" />
            <path d="M 0 320 L 0 288" stroke="#059669" strokeWidth="7" strokeLinecap="round" />
            <polygon points="0,272 -14,296 14,296" fill="#059669" />
            <text x="0" y="475" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="28" fontWeight="900">
              TĂNG VỌT
            </text>
            <text x="0" y="688" textAnchor="middle" fill="#065F46" stroke="none" fontSize="25" fontWeight="900">
              Nhịp thở
            </text>
            <text x="0" y="720" textAnchor="middle" fill="#475569" stroke="none" fontSize="19" fontWeight="700">
              Thở nhanh &amp; sâu hơn hẳn
            </text>
          </g>

          {/* Column 2: Số lần ngáp đứng yên */}
          <g transform="translate(915, 0)">
            <rect x="-85" y="542" width="170" height="98" rx="18" fill="#CBD5E1" stroke="#475569" strokeWidth="4" />
            <text x="0" y="598" textAnchor="middle" fill="#334155" stroke="none" fontSize="24" fontWeight="900">
              KHÔNG ĐỔI
            </text>
            <text x="0" y="688" textAnchor="middle" fill="#334155" stroke="none" fontSize="25" fontWeight="900">
              Số lần ngáp
            </text>
            <text x="0" y="720" textAnchor="middle" fill="#64748B" stroke="none" fontSize="19" fontWeight="700">
              Không hề tăng thêm
            </text>
          </g>

          {/* Right Verdict Card: Bold Red X on Thiếu O2 */}
          <g transform="translate(1455, 455)">
            <rect x="-215" y="-175" width="430" height="350" rx="26" fill="#FEF2F2" stroke="#EF4444" strokeWidth="4.5" />
            <circle cx="0" cy="-62" r="64" fill="#FEE2E2" stroke="#EF4444" strokeWidth="4" />
            <text x="0" y="-47" textAnchor="middle" fill="#7F1D1D" stroke="none" fontSize="38" fontWeight="900">
              O<tspan dy="6" fontSize="25">2</tspan>
            </text>
            {/* Big crisp Red X across O2 badge */}
            <line x1="-50" y1="-112" x2="50" y2="-12" stroke="#DC2626" strokeWidth="7.5" strokeLinecap="round" opacity="0.88" />
            <line x1="50" y1="-112" x2="-50" y2="-12" stroke="#DC2626" strokeWidth="7.5" strokeLinecap="round" opacity="0.88" />
            <text x="0" y="54" textAnchor="middle" fill="#B91C1C" stroke="none" fontSize="30" fontWeight="900">
              KHÔNG PHẢI THIẾU O<tspan dy="5" fontSize="20">2</tspan><tspan dy="-5">!</tspan>
            </text>
            <text x="0" y="102" textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="700">
              Ngáp không dùng để nạp thêm ô-xy
            </text>
            <text x="0" y="134" textAnchor="middle" fill="#475569" stroke="none" fontSize="19" fontWeight="700">
              cho máu hay lá phổi
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_03: NGAP_BRAIN_COOLING (Beats 12–13, steps 0, 1)
 *   - Step 0: Warm amber brain + thermometer high slightly
 *   - Step 1: Cool blue airflow + jaw stretch blood flow + thermometer cools down "Tỉnh táo hơn!"
 * ========================================================================== */
export const NgapBrainCoolingVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.18);
  const mercuryTopY = activeStep === 0 ? 315 : 470;
  const mercuryColor = activeStep === 0 ? '#F97316' : '#0EA5E9';

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone={activeStep === 0 ? 'CORAL' : 'SKY'} gradId="ng03_bg" cardBorder={activeStep === 0 ? '#EA580C' : '#0284C7'} />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Tác dụng thật: Cái ngáp giúp chuyển trạng thái & điều hòa nhiệt cho não'
            : 'Hít khí mát + giãn cơ hàm → Tăng tuần hoàn máu & hạ nhiệt dịu cho não!'
        }
        bg="#FFFFFF"
        color={activeStep === 0 ? '#9A3412' : '#0369A1'}
        border={activeStep === 0 ? '#EA580C' : '#0284C7'}
        fontSize={29}
      />

      {/* Left/Center Diagram */}
      {activeStep === 1 && (
        <g>
          {/* Cool Airflow Box on Left */}
          <rect x="225" y="340" width="335" height="230" rx="24" fill="#F0F9FF" stroke="#0284C7" strokeWidth="3.8" />
          <text x="392" y="392" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="24" fontWeight="900">
            Luồng khí mát hít sâu
          </text>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M 265 ${436 + i * 38} Q 385 ${420 + i * 38} 515 ${436 + i * 38}`}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="18 12"
              strokeDashoffset={-(frame * 4.5 + i * 10)}
            />
          ))}
          {/* Connecting cool stream into brain */}
          <path
            d="M 568 455 L 775 455"
            fill="none"
            stroke="#0284C7"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="20 12"
            strokeDashoffset={-(frame * 5)}
          />
          <polygon points="794,455 764,438 764,472" fill="#0284C7" />
          <text x="680" y="424" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="20" fontWeight="800">
            Tản nhiệt xoang mũi
          </text>
        </g>
      )}

      {/* Center Brain Emblem */}
      <NgapBrainEmblem
        x={activeStep === 0 ? 790 : 970}
        y={455}
        scale={1.55}
        fillColor={activeStep === 0 ? '#FDBA74' : '#BAE6FD'}
        glowColor={activeStep === 0 ? '#FB923C' : '#38BDF8'}
        glowOpacity={0.26 + pulse * 0.14}
      />
      <rect
        x={activeStep === 0 ? 590 : 770}
        y="625"
        width="400"
        height="64"
        rx="20"
        fill={activeStep === 0 ? '#FFF7ED' : '#E0F2FE'}
        stroke={activeStep === 0 ? '#EA580C' : '#0284C7'}
        strokeWidth="3.5"
      />
      <text
        x={activeStep === 0 ? 790 : 970}
        y="666"
        textAnchor="middle"
        fill={activeStep === 0 ? '#9A3412' : '#0369A1'}
        stroke="none"
        fontSize="24"
        fontWeight="900"
      >
        {activeStep === 0 ? 'Não hơi ấm khi mệt / buồn ngủ' : 'Giãn cơ hàm → Tăng máu lên não'}
      </text>

      {/* Clean Vertical Thermometer on Right */}
      <g transform="translate(1360, 0)">
        <rect x="-28" y="255" width="56" height="340" rx="28" fill="#F8FAFC" stroke={INK} strokeWidth="4.5" />
        <circle cx="0" cy="610" r="48" fill="#F8FAFC" stroke={INK} strokeWidth="4.5" />
        {/* Mercury bar */}
        <rect x="-14" y={mercuryTopY} width="28" height={600 - mercuryTopY} rx="14" fill={mercuryColor} />
        <circle cx="0" cy="610" r="34" fill={mercuryColor} />
        {/* Scale ticks */}
        {[300, 360, 420, 480, 540].map((ty) => (
          <line key={ty} x1="36" y1={ty} x2="54" y2={ty} stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
        ))}
        {/* Status Callout Box beside Thermometer */}
        <rect
          x="76"
          y={activeStep === 0 ? 295 : 445}
          width="290"
          height="100"
          rx="20"
          fill={activeStep === 0 ? '#FFF7ED' : '#ECFDF5'}
          stroke={activeStep === 0 ? '#EA580C' : '#10B981'}
          strokeWidth="3.5"
        />
        <text
          x="221"
          y={activeStep === 0 ? 338 : 488}
          textAnchor="middle"
          fill={activeStep === 0 ? '#9A3412' : '#065F46'}
          stroke="none"
          fontSize="24"
          fontWeight="900"
        >
          {activeStep === 0 ? 'Nhiệt não hơi tăng' : 'Tỉnh táo hơn!'}
        </text>
        <text
          x="221"
          y={activeStep === 0 ? 372 : 522}
          textAnchor="middle"
          fill="#334155"
          stroke="none"
          fontSize="19"
          fontWeight="700"
        >
          {activeStep === 0 ? 'Cần nút chuyển trạng thái' : 'Hạ nhiệt nhẹ & tỉnh giấc'}
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_04: NGAP_TWO_TYPES (Beat 15, step 0)
 *   - Side-by-side 2 crisp cards: Ngáp tự nhiên vs Ngáp lây
 * ========================================================================== */
export const NgapTwoTypesVisual: React.FC<EpisodeVisualProps> = () => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
    <NgapStageCardBackdrop tone="LAVENDER" gradId="ng04_bg" cardBorder="#4F46E5" />
    <NgapCleanLabel
      x={960}
      y={84}
      text="Khoa học phân tách rạch ròi 2 loại ngáp hoàn toàn khác nhau"
      bg="#FFFFFF"
      color="#3730A3"
      border="#4F46E5"
      fontSize={30}
    />

    {/* Left Card: Ngáp tự nhiên */}
    <g transform="translate(215, 210)">
      <rect x="0" y="0" width="690" height="520" rx="28" fill="#F0F9FF" stroke="#0284C7" strokeWidth="4.5" />
      <rect x="34" y="28" width="622" height="60" rx="18" fill="#0284C7" />
      <text x="345" y="68" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="28" fontWeight="900">
        1. NGÁP TỰ NHIÊN (Spontaneous)
      </text>
      <NgapFaceBadge x={345} y={195} r={66} mode="yawn" bg="#E0F2FE" border="#0284C7" />
      <g transform="translate(56, 305)">
        <rect x="0" y="0" width="578" height="82" rx="16" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="3" />
        <text x="289" y="34" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="23" fontWeight="900">
          Xuất hiện ngay từ trong bụng mẹ
        </text>
        <text x="289" y="66" textAnchor="middle" fill="#334155" stroke="none" fontSize="19" fontWeight="700">
          Có sẵn ở hầu hết các loài động vật có xương sống
        </text>
      </g>
      <g transform="translate(56, 408)">
        <rect x="0" y="0" width="578" height="82" rx="16" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="3" />
        <text x="289" y="34" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="23" fontWeight="900">
          Nguyên nhân sinh lý cá nhân
        </text>
        <text x="289" y="66" textAnchor="middle" fill="#334155" stroke="none" fontSize="19" fontWeight="700">
          Khi mệt mỏi, buồn ngủ, buồn chán hoặc chuyển giấc
        </text>
      </g>
    </g>

    {/* Center VS Pill */}
    <circle cx="960" cy="470" r="42" fill="#FEF08A" stroke={INK} strokeWidth="4.5" />
    <text x="960" y="481" textAnchor="middle" fill="#92400E" stroke="none" fontSize="28" fontWeight="900">
      VS
    </text>

    {/* Right Card: Ngáp lây */}
    <g transform="translate(1015, 210)">
      <rect x="0" y="0" width="690" height="520" rx="28" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4.5" />
      <rect x="34" y="28" width="622" height="60" rx="18" fill="#EA580C" />
      <text x="345" y="68" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="28" fontWeight="900">
        2. NGÁP LÂY (Contagious)
      </text>
      <NgapFaceBadge x={250} y={195} r={54} mode="yawn" bg="#FFEDD5" border="#EA580C" />
      <path d="M 314 195 L 374 195" stroke="#EA580C" strokeWidth="7" strokeLinecap="round" />
      <polygon points="384,195 366,184 366,206" fill="#EA580C" />
      <NgapFaceBadge x={445} y={195} r={54} mode="yawn" bg="#FFEDD5" border="#EA580C" />
      <g transform="translate(56, 305)">
        <rect x="0" y="0" width="578" height="82" rx="16" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="3" />
        <text x="289" y="34" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="23" fontWeight="900">
          Phản xạ xã hội đặc biệt của bộ não
        </text>
        <text x="289" y="66" textAnchor="middle" fill="#334155" stroke="none" fontSize="19" fontWeight="700">
          Kích hoạt khi nhìn, nghe hoặc nghĩ tới người khác ngáp
        </text>
      </g>
      <g transform="translate(56, 408)">
        <rect x="0" y="0" width="578" height="82" rx="16" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="3" />
        <text x="289" y="34" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="23" fontWeight="900">
          Cơ chế bắt chước tự động
        </text>
        <text x="289" y="66" textAnchor="middle" fill="#334155" stroke="none" fontSize="19" fontWeight="700">
          Gắn liền với mạng lưới nơ-ron gương &amp; kết nối bầy đàn
        </text>
      </g>
    </g>
  </svg>
);

/* ============================================================================
 * SVG_05: NGAP_MIRROR_CIRCUIT (Beats 16–17, steps 0, 1)
 *   - Step 0: Eye sees yawning person -> blue signal races into motor/mirror cortex
 *   - Step 1: Split panel: "Tự mình làm" AND "Nhìn người khác làm" light up same golden neuron cluster
 * ========================================================================== */
export const NgapMirrorCircuitVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.22);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="SKY" gradId="ng05_bg" cardBorder="#0284C7" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Mạch bắt chước tự động: Từ đôi mắt chạy thẳng vào vùng nơ-ron gương'
            : 'Như tấm gương vô hình: Tự làm hay chỉ nhìn thấy đều bật sáng cùng tế bào não!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Left: Yawning person cue */}
          <g transform="translate(420, 465)">
            <rect x="-155" y="-155" width="310" height="310" rx="28" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4" />
            <NgapFaceBadge x={0} y={-24} r={74} mode="yawn" bg="#FFEDD5" border="#EA580C" />
            <text x="0" y="96" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="24" fontWeight="900">
              Người đối diện ngáp
            </text>
            <text x="0" y="128" textAnchor="middle" fill="#475569" stroke="none" fontSize="19" fontWeight="700">
              Tín hiệu thị giác phát ra
            </text>
          </g>

          {/* Animated Sight Beam to Observer Head Profile */}
          <path
            d="M 595 455 L 925 455"
            fill="none"
            stroke="#0284C7"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="22 14"
            strokeDashoffset={-(frame * 5)}
          />
          <polygon points="944,455 914,438 914,472" fill="#0284C7" />
          <rect x="645" y="388" width="245" height="44" rx="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.8" />
          <text x="768" y="418" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="20" fontWeight="900">
            Ánh mắt thu tín hiệu
          </text>

          {/* Right: Clean Head Cross-Section Profile with glowing Mirror Neuron Cortex */}
          <g transform="translate(1285, 470)">
            {/* Head Silhouette facing LEFT */}
            <path
              d="M -185 18 C -190 -135 -75 -215 65 -200 C 190 -185 255 -80 235 65 C 222 148 160 198 65 215 L -95 215 L -115 148 L -170 132 L -162 84 L -202 68 Z"
              fill="#FEF3C7"
              stroke={INK}
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Eye on left face */}
            <ellipse cx="-142" cy="-12" rx="18" ry="11" fill="#FFFFFF" stroke={INK} strokeWidth="3.2" />
            <circle cx="-148" cy="-12" r="5.5" fill={INK} />

            {/* Brain inside Head */}
            <NgapBrainEmblem
              x={38}
              y={-42}
              scale={1.32}
              glowColor="#F97316"
              glowOpacity={0.28 + pulse * 0.16}
              highlightMirror={true}
            />
            {/* Optic nerve signal path from Eye to Mirror Cortex */}
            <path
              d="M -124 -12 C -70 -12 -40 -52 24 -64"
              fill="none"
              stroke="#EA580C"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="14 10"
              strokeDashoffset={-(frame * 4.5)}
            />
            <rect x="-86" y="128" width="380" height="58" rx="16" fill="#FFF7ED" stroke="#EA580C" strokeWidth="3.2" />
            <text x="104" y="165" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="22" fontWeight="900">
              Vùng Nơ-ron gương bật sáng!
            </text>
          </g>
        </g>
      ) : (
        <g>
          {/* Left Panel: Tự mình làm */}
          <g transform="translate(220, 220)">
            <rect x="0" y="0" width="470" height="490" rx="26" fill="#F0F9FF" stroke="#0284C7" strokeWidth="4" />
            <text x="235" y="54" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="28" fontWeight="900">
              Tự mình hành động
            </text>
            <NgapFaceBadge x={235} y={195} r={70} mode="yawn" bg="#E0F2FE" border="#0284C7" />
            <text x="235" y="325" textAnchor="middle" fill="#334155" stroke="none" fontSize="22" fontWeight="800">
              Khi tự mở miệng ngáp
            </text>
            <rect x="65" y="365" width="340" height="72" rx="18" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
            <text x="235" y="409" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="22" fontWeight="900">
              Kích hoạt cụm nơ-ron A
            </text>
          </g>

          {/* Right Panel: Nhìn người khác làm */}
          <g transform="translate(1230, 220)">
            <rect x="0" y="0" width="470" height="490" rx="26" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4" />
            <text x="235" y="54" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="28" fontWeight="900">
              Nhìn người khác làm
            </text>
            <NgapFaceBadge x={235} y={195} r={70} mode="alert" bg="#FFEDD5" border="#EA580C" />
            <text x="235" y="325" textAnchor="middle" fill="#334155" stroke="none" fontSize="22" fontWeight="800">
              Chỉ quan sát bằng mắt
            </text>
            <rect x="65" y="365" width="340" height="72" rx="18" fill="#FFFFFF" stroke="#EA580C" strokeWidth="3" />
            <text x="235" y="409" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="22" fontWeight="900">
              Bật sáng ĐÚNG cụm A!
            </text>
          </g>

          {/* Center Mirror Brain receiving both arrows */}
          <path d="M 700 465 L 810 465" stroke="#0284C7" strokeWidth="10" strokeLinecap="round" strokeDasharray="16 10" strokeDashoffset={-(frame * 4)} />
          <polygon points="826,465 800,450 800,480" fill="#0284C7" />
          <path d="M 1220 465 L 1110 465" stroke="#EA580C" strokeWidth="10" strokeLinecap="round" strokeDasharray="16 10" strokeDashoffset={-(frame * 4)} />
          <polygon points="1094,465 1120,450 1120,480" fill="#EA580C" />

          <NgapBrainEmblem
            x={960}
            y={455}
            scale={1.38}
            glowColor="#F59E0B"
            glowOpacity={0.3 + pulse * 0.18}
            highlightMirror={true}
          />
          <rect x="780" y="616" width="360" height="62" rx="18" fill="#FEF3C7" stroke="#D97706" strokeWidth="3.5" />
          <text x="960" y="655" textAnchor="middle" fill="#92400E" stroke="none" fontSize="23" fontWeight="900">
            Cùng 1 nhóm Nơ-ron gương!
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_06: NGAP_AUTO_TRIGGER (Beats 18–19, steps 0, 1)
 *   - Step 0: Prefrontal brake blocks small mimic signals (Gãi đầu, Vẫy tay)
 *   - Step 1: Powerful Yawn surge breaks through brake -> opens jaw automatically
 * ========================================================================== */
export const NgapAutoTriggerVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="CREAM" gradId="ng06_bg" cardBorder="#D97706" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Vỏ não trước trán giữ phanh: Ngăn ta bắt chước mọi cử chỉ thường'
            : 'Phản xạ ngáp quá mạnh: Đẩy bung chốt phanh kéo mở cơ hàm!'
        }
        bg="#FFFFFF"
        color={activeStep === 0 ? '#0369A1' : '#9A3412'}
        border={activeStep === 0 ? '#0284C7' : '#EA580C'}
        fontSize={29}
      />

      {/* Top Track: Minor gestures blocked by Prefrontal Brake */}
      <g>
        <rect x="230" y="255" width="760" height="110" rx="24" fill="#F1F5F9" stroke="#64748B" strokeWidth="3.8" />
        <text x="470" y="302" textAnchor="middle" fill="#334155" stroke="none" fontSize="25" fontWeight="900">
          Cử chỉ nhẹ: Gãi đầu, vẫy tay...
        </text>
        <path
          d="M 275 335 L 870 335"
          fill="none"
          stroke="#64748B"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="16 12"
          strokeDashoffset={-(frame * 2.5)}
        />
        {/* Closed Brake Barrier at x=995 */}
        <rect x="985" y="220" width="32" height="180" rx="10" fill="#0284C7" stroke={INK} strokeWidth="3.5" />
        <rect x="1040" y="268" width="295" height="82" rx="18" fill="#EFF6FF" stroke="#0284C7" strokeWidth="3.2" />
        <text x="1188" y="304" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="22" fontWeight="900">
          Vỏ não kiểm soát
        </text>
        <text x="1188" y="334" textAnchor="middle" fill="#475569" stroke="none" fontSize="18" fontWeight="700">
          Giữ phanh chặn gọn ✓
        </text>
      </g>

      {/* Bottom Track: Powerful Contagious Yawn Signal */}
      <g>
        <rect x="230" y="485" width="1125" height="135" rx="28" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4.2" />
        <text x="530" y="534" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="26" fontWeight="900">
          Tín hiệu NGÁP cổ xưa &amp; cực mạnh
        </text>
        <path
          d={activeStep === 1 ? 'M 275 578 L 1390 578' : 'M 275 578 L 930 578'}
          fill="none"
          stroke="#EA580C"
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray="24 14"
          strokeDashoffset={-(frame * 6)}
        />
        <polygon
          points={activeStep === 1 ? '1412,578 1376,558 1376,598' : '952,578 920,560 920,596'}
          fill="#EA580C"
        />

        {/* Brake Latch: closed in step 0, pushed open upward in step 1 */}
        <g transform={activeStep === 1 ? 'translate(1001, 485) rotate(-52)' : 'translate(1001, 485)'}>
          <rect x="-14" y="0" width="28" height="135" rx="8" fill={activeStep === 1 ? '#F97316' : '#0284C7'} stroke={INK} strokeWidth="3.5" />
        </g>

        {activeStep === 1 && (
          <g transform="translate(1080, 668)">
            <rect x="-245" y="-26" width="490" height="58" rx="18" fill="#FEF2F2" stroke="#EF4444" strokeWidth="3.2" />
            <text x="0" y="12" textAnchor="middle" fill="#B91C1C" stroke="none" fontSize="23" fontWeight="900">
              Vượt ngưỡng phanh → Tự mở cơ hàm!
            </text>
          </g>
        )}
      </g>

      {/* Right Outcome Face: Calm in step 0, Wide Yawn in step 1 */}
      <g transform="translate(1570, 550)">
        <NgapFaceBadge
          x={0}
          y={0}
          r={84}
          mode={activeStep === 1 ? 'yawn' : 'calm'}
          bg={activeStep === 1 ? '#FFEDD5' : '#F8FAFC'}
          border={activeStep === 1 ? '#EA580C' : '#64748B'}
        />
        <text x="0" y="124" textAnchor="middle" fill={activeStep === 1 ? '#9A3412' : '#475569'} stroke="none" fontSize="24" fontWeight="900">
          {activeStep === 1 ? 'Miệng tự ngáp theo!' : 'Đang giữ trạng thái'}
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_07: NGAP_TRIBE_SYNC (Beats 22–23, steps 0, 1)
 *   - Step 0: 5 minimalist figures around warm campfire inside bright warm-ivory card (NO dark screen)
 *   - Step 1: Contagious orange wave spreads 1 -> 5, alert eye badges light up on all 5
 * ========================================================================== */
export const NgapTribeSyncVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const flicker = Math.sin(frame * 0.25) * 6;
  const people = [
    { x: 420, y: 505 },
    { x: 655, y: 395 },
    { x: 960, y: 345 },
    { x: 1265, y: 395 },
    { x: 1500, y: 505 },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="CREAM" gradId="ng07_bg" cardBorder="#D97706" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Giả thuyết tiến hóa: Công cụ đồng bộ nhịp sinh học cho bầy đàn'
            : 'Một người ngáp → Cả nhóm đồng loạt chuyển sang trạng thái cảnh giác!'
        }
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={29}
      />

      {/* Warm Campfire in Lower Center (bright warm sunset-ivory card, never black!) */}
      <g transform="translate(960, 625)">
        <ellipse cx="0" cy="48" rx="165" ry="26" fill="#FDE68A" opacity="0.65" />
        <rect x="-66" y="34" width="132" height="18" rx="7" transform="rotate(-12)" fill="#92400E" stroke={INK} strokeWidth="3.2" />
        <rect x="-66" y="34" width="132" height="18" rx="7" transform="rotate(12)" fill="#78350F" stroke={INK} strokeWidth="3.2" />
        <path
          d={`M -48 34 C -58 -18 -20 -46 0 ${-92 - flicker} C 26 -42 58 -14 48 34 Z`}
          fill="#F97316"
          stroke={INK}
          strokeWidth="3.8"
          strokeLinejoin="round"
        />
        <path
          d={`M -26 34 C -30 0 -10 -22 0 ${-54 - flicker * 0.6} C 14 -20 30 2 26 34 Z`}
          fill="#FACC15"
          stroke="none"
        />
        <text x="0" y="96" textAnchor="middle" fill="#92400E" stroke="none" fontSize="22" fontWeight="900">
          Sinh hoạt bầy đàn thời tổ tiên
        </text>
      </g>

      {/* Step 1: Contagious ripple wave spreading from Person #1 */}
      {activeStep === 1 && (
        <g fill="none" stroke="#EA580C" strokeLinecap="round">
          {[0, 1, 2].map((ri) => {
            const rad = 110 + ((frame * 4 + ri * 140) % 440);
            const op = Math.max(0, 1 - (rad - 110) / 440) * 0.55;
            return (
              <circle
                key={ri}
                cx={people[0].x}
                cy={people[0].y}
                r={rad}
                strokeWidth="6"
                strokeDasharray="16 14"
                opacity={op.toFixed(2)}
              />
            );
          })}
        </g>
      )}

      {/* 5 Minimalist Tribe Members */}
      {people.map((p, idx) => {
        const isLeader = idx === 0;
        const isSynced = activeStep === 1;
        return (
          <g key={idx} transform={`translate(${p.x}, ${p.y})`}>
            <GroundShadow cx={0} cy={92} rx={52} ry={10} />
            <NgapFaceBadge
              x={0}
              y={0}
              r={46}
              mode={isLeader || isSynced ? 'yawn' : 'calm'}
              bg={isSynced || isLeader ? '#FFEDD5' : '#FFFFFF'}
              border={isSynced || isLeader ? '#EA580C' : '#64748B'}
            />
            <path
              d="M -36 90 C -36 56 -20 46 0 46 C 20 46 36 56 36 90 Z"
              fill={isLeader ? '#EA580C' : isSynced ? '#F59E0B' : '#94A3B8'}
              stroke={INK}
              strokeWidth="3.4"
            />
            {/* Alert Eye Emblem above each member in Step 1 */}
            {isSynced && (
              <g transform="translate(0, -82)">
                <rect x="-56" y="-22" width="112" height="40" rx="14" fill="#ECFDF5" stroke="#10B981" strokeWidth="3" />
                <path d="M -32 -2 Q -18 -14 -4 -2 Q -18 10 -32 -2 Z" fill="#FFFFFF" stroke="#059669" strokeWidth="2.4" />
                <circle cx="-18" cy="-2" r="4.5" fill="#059669" />
                <text x="22" y="5" textAnchor="middle" fill="#065F46" stroke="none" fontSize="15" fontWeight="900">
                  Tỉnh!
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ============================================================================
 * SVG_08: NGAP_FAMILIARITY_LADDER (Beats 24–25, steps 0, 1)
 *   - Step 0: Clean 3-tier social closeness ladder frame (y=190..750)
 *   - Step 1: Populated color-coded 3 tiers: Gia đình & Người thân > Bạn bè > Người lạ
 * ========================================================================== */
export const NgapFamiliarityLadderVisual: React.FC<EpisodeVisualProps> = ({
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="CORAL" gradId="ng08_bg" cardBorder="#EA580C" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Bằng chứng gắn kết xã hội: Lây ngáp không xảy ra đồng đều với mọi người'
            : 'Thang độ lây ngáp: Gia đình & Người thân > Bạn bè > Người lạ'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={29}
      />

      {/* Baseline */}
      <line x1="250" y1="680" x2="1670" y2="680" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

      {/* 3 Descending Stairs */}
      {[
        {
          x: 340,
          w: 360,
          h: 390,
          fill: activeStep === 1 ? '#EF4444' : '#F1F5F9',
          border: activeStep === 1 ? '#991B1B' : '#94A3B8',
          badge: 'BẬC 1 • MẠNH NHẤT',
          title: 'Gia đình & Người thân',
          sub: 'Lây nhanh nhất, tỷ lệ cao nhất',
          tagBg: '#FEF2F2',
          tagColor: '#B91C1C',
        },
        {
          x: 780,
          w: 360,
          h: 270,
          fill: activeStep === 1 ? '#F59E0B' : '#F1F5F9',
          border: activeStep === 1 ? '#B45309' : '#94A3B8',
          badge: 'BẬC 2 • KHÁ CAO',
          title: 'Bạn bè quen biết',
          sub: 'Thường xuyên trò chuyện, gần gũi',
          tagBg: '#FFFBEB',
          tagColor: '#B45309',
        },
        {
          x: 1220,
          w: 360,
          h: 155,
          fill: activeStep === 1 ? '#94A3B8' : '#F1F5F9',
          border: activeStep === 1 ? '#475569' : '#94A3B8',
          badge: 'BẬC 3 • THẤP HƠN',
          title: 'Người lạ',
          sub: 'Vẫn có thể lây nhưng chậm hơn',
          tagBg: '#F8FAFC',
          tagColor: '#475569',
        },
      ].map((bar, idx) => {
        const topY = 680 - bar.h;
        return (
          <g key={idx}>
            <rect
              x={bar.x}
              y={topY}
              width={bar.w}
              height={bar.h}
              rx="22"
              fill={bar.fill}
              stroke={bar.border}
              strokeWidth="4.5"
            />
            {activeStep === 1 ? (
              <>
                <rect
                  x={bar.x + 28}
                  y={topY - 56}
                  width={bar.w - 56}
                  height="42"
                  rx="14"
                  fill={bar.tagBg}
                  stroke={bar.border}
                  strokeWidth="2.8"
                />
                <text
                  x={bar.x + bar.w / 2}
                  y={topY - 28}
                  textAnchor="middle"
                  fill={bar.tagColor}
                  stroke="none"
                  fontSize="19"
                  fontWeight="900"
                >
                  {bar.badge}
                </text>
                <text
                  x={bar.x + bar.w / 2}
                  y={topY + bar.h / 2 - 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  stroke="none"
                  fontSize="26"
                  fontWeight="900"
                >
                  {bar.title}
                </text>
                <text
                  x={bar.x + bar.w / 2}
                  y={topY + bar.h / 2 + 30}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  stroke="none"
                  fontSize="18"
                  fontWeight="700"
                  opacity="0.94"
                >
                  {bar.sub}
                </text>
              </>
            ) : (
              <text
                x={bar.x + bar.w / 2}
                y={topY + bar.h / 2 + 8}
                textAnchor="middle"
                fill="#64748B"
                stroke="none"
                fontSize="36"
                fontWeight="900"
              >
                ?
              </text>
            )}
          </g>
        );
      })}

      <text x="960" y="736" textAnchor="middle" fill="#7C2D12" stroke="none" fontSize="23" fontWeight="800">
        {activeStep === 1
          ? 'Mức độ gắn bó tình cảm càng sâu sắc → Khả năng lây ngáp càng cao!'
          : 'Mức độ lây ngáp thay đổi rõ rệt theo mức độ thân thiết xã hội'}
      </text>
    </svg>
  );
};
