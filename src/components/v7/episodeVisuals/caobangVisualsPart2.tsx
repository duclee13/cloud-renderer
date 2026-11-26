import React from 'react';
import type { EpisodeVisualProps } from './index';
import {
  INK,
  FONT,
  CaobangCleanLabel,
  CaobangContrastBadge,
  CaobangStageCardBackdrop,
  CaobangBrainEmblem,
  CaobangFaceEmblem,
} from './caobangSharedAssets';

/* ============================================================================
 * SVG_09: CAOBANG_ANCESTOR_FUR (Beat 27, step 0)
 *   - Cute 2D side-by-side comparison: Startled puffed-up cat vs Human arm goosebumps
 * ========================================================================== */
export const CaobangAncestorFurVisual: React.FC<EpisodeVisualProps> = ({ frame = 0 }) => {
  const puff = 1 + 0.04 * Math.sin(frame * 0.2);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="CREAM" gradId="cb09_bg" cardBorder="#D97706" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text="Dấu tích tiến hóa: Phản xạ xù lông dọa kẻ thù từ tổ tiên xa xưa"
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={29}
      />

      {/* Left Card: Cute Startled Puffed-Up Cat (x=215..915, y=205..675) */}
      <g transform="translate(215, 205)">
        <rect x="0" y="0" width="700" height="470" rx="28" fill="#FFFBEB" stroke="#D97706" strokeWidth="4.2" />
        <CaobangContrastBadge x={350} y={48} w={420} h={46} text="Động vật nhiều lông (Mèo, Vượn)" variant="softAmber" fontSize={21} />

        {/* Cute flat 2D startled puffed-up cat */}
        <g transform={`translate(350, 260) scale(${puff.toFixed(3)})`}>
          {/* Puffed-up bristled tail */}
          <path d="M 96,12 C 155,-18 175,-90 132,-128 C 110,-102 104,-52 72,-10 Z" fill="#F59E0B" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
          {/* Arched puffed back body */}
          <path
            d="M -110,65 C -115,-55 -40,-112 20,-105 C 88,-96 118,-25 112,65 L 82,65 L 82,112 L 54,112 L 54,68 L -54,68 L -54,112 L -82,112 L -82,65 Z"
            fill="#FBBF24"
            stroke={INK}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Bristled fur spikes along arched back */}
          <path d="M -88,-46 L -102,-74 L -68,-74 L -64,-104 L -32,-92 L -14,-122 L 12,-98 L 38,-122 L 54,-92 L 84,-100 L 82,-68" fill="none" stroke="#B45309" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Startled cat head */}
          <g transform="translate(-108, -22)">
            <polygon points="-34,-26 -42,-66 -10,-42" fill="#F59E0B" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            <polygon points="34,-26 42,-66 10,-42" fill="#F59E0B" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="0" cy="0" r="42" fill="#FBBF24" stroke={INK} strokeWidth="4.2" />
            <circle cx="-14" cy="-6" r="10" fill="#FFFFFF" stroke={INK} strokeWidth="2.8" />
            <circle cx="-14" cy="-6" r="4.5" fill={INK} />
            <circle cx="14" cy="-6" r="10" fill="#FFFFFF" stroke={INK} strokeWidth="2.8" />
            <circle cx="14" cy="-6" r="4.5" fill={INK} />
            <polygon points="-5,6 5,6 0,12" fill="#FB7185" />
            <ellipse cx="0" cy="22" rx="9" ry="7" fill="#9F1239" stroke={INK} strokeWidth="2.4" />
          </g>
        </g>

        <text x="350" y="424" textAnchor="middle" fill="#92400E" stroke="none" fontSize="24" fontWeight="900">
          Xù lông dựng đứng → Trông to gấp đôi để dọa kẻ thù!
        </text>
      </g>

      {/* Right Card: Human Arm Goosebumps (x=1005..1705, y=205..675) */}
      <g transform="translate(1005, 205)">
        <rect x="0" y="0" width="700" height="470" rx="28" fill="#EFF6FF" stroke="#0284C7" strokeWidth="4.2" />
        <CaobangContrastBadge x={350} y={48} w={380} h={46} text="Con người hiện đại (Ít lông)" variant="solidBlue" fontSize={21} />

        {/* Human forearm silhouette with visible tiny goosebumps */}
        <g transform="translate(350, 265)">
          <path
            d="M -230,36 L 145,16 C 185,12 222,22 232,46 C 238,62 214,76 178,74 L -230,96 Z"
            fill="#FDE68A"
            stroke={INK}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Tiny goosebump mounds & fine upright hairs along upper edge of forearm */}
          {[-170, -118, -66, -14, 38, 90].map((gx, gi) => (
            <g key={gi} transform={`translate(${gx}, ${26 - gi * 1.8})`}>
              <path d="M -12,6 Q 0,-12 12,6" fill="#FDE68A" stroke="#D97706" strokeWidth="3.2" />
              <line x1="0" y1="-4" x2="0" y2="-32" stroke="#334155" strokeWidth="3.2" strokeLinecap="round" />
            </g>
          ))}
          {/* Zoom highlight bubble */}
          <rect x="-150" y="-116" width="300" height="58" rx="18" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.4" />
          <text x="0" y="-79" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="23" fontWeight="900">
            Lông mảnh → Chỉ nổi hạt da gà
          </text>
        </g>

        <text x="350" y="424" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="24" fontWeight="900">
          Vẫn còn phản xạ cổ xưa nhưng chỉ thấy sởn gai ốc!
        </text>
      </g>

      <text x="960" y="734" textAnchor="middle" fill="#78350F" stroke="none" fontSize="24" fontWeight="900">
        Cùng một cơ chế phòng vệ: Tổ tiên xù lông bảo vệ mình, còn chúng ta nổi da gà rùng mình!
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_10: CAOBANG_MUSIC_EXPERIMENT (Beats 33–34, steps 0, 1)
 *   - Step 0: German study — Center speaker sends SAME chalkboard recording to Group A & Group B
 *   - Step 1: Shocking results! Bar comparison with strict BASELINE_Y=646 & CAPTION_Y=722 (76px separation!)
 * ========================================================================== */
export const CaobangMusicExperimentVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const BASELINE_Y = 646;
  const CAPTION_Y = 724;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="LAVENDER" gradId="cb10_bg" cardBorder="#7C3AED" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Thí nghiệm tại Đức: Hai nhóm nghe CÙNG MỘT đoạn ghi âm cào bảng!'
            : 'Kết quả gây sốc: Chỉ cần đổi “nhãn tâm lý”, mức khó chịu giảm hẳn!'
        }
        bg="#FFFFFF"
        color="#5B21B6"
        border="#7C3AED"
        fontSize={28}
      />

      {activeStep === 0 ? (
        <g>
          {/* Left Group A Card */}
          <g transform="translate(230, 260)">
            <rect x="0" y="0" width="460" height="340" rx="26" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4" />
            <CaobangFaceEmblem x={230} y={120} r={54} mode="calm" bg="#FFFFFF" border="#DC2626" />
            {/* Headphones arc */}
            <path d="M 168,118 C 168,48 292,48 292,118" fill="none" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
            <rect x="156" y="102" width="20" height="40" rx="8" fill="#DC2626" stroke={INK} strokeWidth="3" />
            <rect x="284" y="102" width="20" height="40" rx="8" fill="#DC2626" stroke={INK} strokeWidth="3" />
            <text x="230" y="226" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="29" fontWeight="900">
              Nhóm A
            </text>
            <text x="230" y="268" textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="700">
              Được báo trước:
            </text>
            <text x="230" y="302" textAnchor="middle" fill="#B91C1C" stroke="none" fontSize="22" fontWeight="900">
              “Đây là tiếng móng tay cào bảng”
            </text>
          </g>

          {/* Center Identical Audio Source Speaker */}
          <g transform="translate(960, 420)">
            <rect x="-150" y="-110" width="300" height="220" rx="24" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="4.2" />
            <polygon points="-46,-18 -14,-18 24,-48 24,48 -14,18 -46,18" fill="#7C3AED" stroke={INK} strokeWidth="3.5" />
            <path d="M 38,-22 Q 58,0 38,22" fill="none" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" />
            <text x="0" y="84" textAnchor="middle" fill="#5B21B6" stroke="none" fontSize="21" fontWeight="900">
              1 File ghi âm giống hệt
            </text>
          </g>

          {/* Signal arrows left & right */}
          <path d="M 800,420 L 704,420" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" strokeDasharray="12 8" strokeDashoffset={frame * 3} />
          <path d="M 1120,420 L 1216,420" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" strokeDasharray="12 8" strokeDashoffset={-(frame * 3)} />

          {/* Right Group B Card */}
          <g transform="translate(1230, 260)">
            <rect x="0" y="0" width="460" height="340" rx="26" fill="#ECFDF5" stroke="#059669" strokeWidth="4" />
            <CaobangFaceEmblem x={230} y={120} r={54} mode="calm" bg="#FFFFFF" border="#059669" />
            <path d="M 168,118 C 168,48 292,48 292,118" fill="none" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
            <rect x="156" y="102" width="20" height="40" rx="8" fill="#059669" stroke={INK} strokeWidth="3" />
            <rect x="284" y="102" width="20" height="40" rx="8" fill="#059669" stroke={INK} strokeWidth="3" />
            <text x="230" y="226" textAnchor="middle" fill="#065F46" stroke="none" fontSize="29" fontWeight="900">
              Nhóm B
            </text>
            <text x="230" y="268" textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="700">
              Được báo trước:
            </text>
            <text x="230" y="302" textAnchor="middle" fill="#047857" stroke="none" fontSize="22" fontWeight="900">
              “Đây là đoạn nhạc hiện đại”
            </text>
          </g>
        </g>
      ) : (
        <g>
          {/* Baseline strictly at y=646 (78px above caption at y=724 — ZERO overlap!) */}
          <line x1="300" y1={BASELINE_Y} x2="1620" y2={BASELINE_Y} stroke="#334155" strokeWidth="5" strokeLinecap="round" />

          {/* Group A Bar: Very High Discomfort (h=336 -> topY=310) */}
          <g>
            <rect x="430" y={BASELINE_Y - 336} width="420" height="336" rx="24" fill="#DC2626" stroke="#991B1B" strokeWidth="4.5" />
            <CaobangFaceEmblem x={640} y={BASELINE_Y - 392} r={46} mode="cringe" bg="#FEE2E2" border="#DC2626" />
            <text x="640" y={BASELINE_Y - 210} textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="30" fontWeight="900">
              Nhóm A
            </text>
            <text x="640" y={BASELINE_Y - 166} textAnchor="middle" fill="#FEE2E2" stroke="none" fontSize="22" fontWeight="800">
              (Biết là tiếng cào bảng)
            </text>
            <rect x="480" y={BASELINE_Y - 118} width="320" height="58" rx="18" fill="#FFFFFF" />
            <text x="640" y={BASELINE_Y - 80} textAnchor="middle" fill="#991B1B" stroke="none" fontSize="24" fontWeight="900">
              CỰC KỲ KHÓ CHỊU!
            </text>
          </g>

          {/* Group B Bar: Noticeably Lower Discomfort (h=190 -> topY=456) */}
          <g>
            <rect x="1070" y={BASELINE_Y - 190} width="420" height="190" rx="24" fill="#10B981" stroke="#065F46" strokeWidth="4.5" />
            <CaobangFaceEmblem x={1280} y={BASELINE_Y - 246} r={46} mode="calm" bg="#ECFDF5" border="#059669" />
            <text x="1280" y={BASELINE_Y - 122} textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="30" fontWeight="900">
              Nhóm B
            </text>
            <text x="1280" y={BASELINE_Y - 82} textAnchor="middle" fill="#ECFDF5" stroke="none" fontSize="21" fontWeight="800">
              (Tưởng là nhạc hiện đại)
            </text>
            <text x="1280" y={BASELINE_Y - 34} textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="23" fontWeight="900">
              Dễ chịu hơn rõ rệt!
            </text>
          </g>
        </g>
      )}

      <text x="960" y={CAPTION_Y} textAnchor="middle" fill="#4C1D95" stroke="none" fontSize="24" fontWeight="900">
        {activeStep === 0
          ? 'Cả hai nhóm đều nghe cùng một sóng âm vật lý giống nhau 100%'
          : 'Cùng một âm thanh, nhưng suy nghĩ trong đầu thay đổi hoàn toàn mức độ rùng mình!'}
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_11: CAOBANG_BRAIN_EXPECTATION (Beats 35–36, steps 0, 1)
 *   - Step 0: Equation diagram: Tín hiệu âm thanh (Tai) + Kỳ vọng & Ký ức (Não) = Cơn rùng mình x2
 *   - Step 1: Clock & early trigger arrow flipping red brain alarm switch BEFORE sound peaks
 * ========================================================================== */
export const CaobangBrainExpectationVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.24);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="SKY" gradId="cb11_bg" cardBorder="#0284C7" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Công thức cơn rùng mình: Không chỉ do Tai, mà còn do Suy nghĩ trong Não!'
            : 'Não kích hoạt trước cả khi âm thanh kịp lớn lên!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={28}
      />

      {activeStep === 0 ? (
        <g>
          {/* Piece 1: Tai */}
          <g transform="translate(215, 280)">
            <rect x="0" y="0" width="400" height="310" rx="26" fill="#EFF6FF" stroke="#0284C7" strokeWidth="4" />
            <circle cx="200" cy="108" r="56" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.8" />
            <path d="M 205,76 C 176,76 170,138 202,138 C 218,138 218,118 208,112" fill="none" stroke="#0369A1" strokeWidth="6" strokeLinecap="round" />
            <text x="200" y="214" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="26" fontWeight="900">
              Tín hiệu âm thanh
            </text>
            <text x="200" y="254" textAnchor="middle" fill="#475569" stroke="none" fontSize="22" fontWeight="800">
              (Từ ống tai)
            </text>
          </g>

          {/* Plus sign */}
          <text x="668" y="452" textAnchor="middle" fill="#0284C7" stroke="none" fontSize="72" fontWeight="900">
            +
          </text>

          {/* Piece 2: Não */}
          <g transform="translate(720, 280)">
            <rect x="0" y="0" width="440" height="310" rx="26" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="4" />
            <CaobangBrainEmblem x={220} y={108} scale={0.78} />
            <text x="220" y="220" textAnchor="middle" fill="#5B21B6" stroke="none" fontSize="26" fontWeight="900">
              Kỳ vọng &amp; Ký ức
            </text>
            <text x="220" y="258" textAnchor="middle" fill="#475569" stroke="none" fontSize="22" fontWeight="800">
              (Từ suy nghĩ trong não)
            </text>
          </g>

          {/* Equals sign */}
          <text x="1216" y="452" textAnchor="middle" fill="#DC2626" stroke="none" fontSize="72" fontWeight="900">
            =
          </text>

          {/* Result: Cơn rùng mình x2 */}
          <g transform="translate(1270, 280)">
            <rect x="0" y="0" width="435" height="310" rx="26" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4.8" />
            <CaobangFaceEmblem x={218} y={108} r={54} mode="cringe" bg="#FEE2E2" border="#DC2626" />
            <CaobangContrastBadge x={218} y={214} w={340} h={52} text="CƠN RÙNG MÌNH ×2!" variant="solidRed" fontSize={23} />
            <text x="218" y="276" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="20" fontWeight="800">
              Cảm giác ghê răng tăng vọt!
            </text>
          </g>
        </g>
      ) : (
        <g>
          {/* Left Clock Anticipation Card */}
          <g transform="translate(235, 258)">
            <rect x="0" y="0" width="470" height="350" rx="26" fill="#FFFBEB" stroke="#D97706" strokeWidth="4.2" />
            {/* Crisp Clock Icon */}
            <g transform="translate(235, 134)">
              <circle cx="0" cy="0" r="68" fill="#FFFFFF" stroke="#D97706" strokeWidth="6" />
              <line x1="0" y1="0" x2="0" y2="-38" stroke={INK} strokeWidth="6" strokeLinecap="round" />
              <line x1="0" y1="0" x2="30" y2="-16" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" />
              <circle cx="0" cy="0" r="7" fill={INK} />
            </g>
            <CaobangContrastBadge x={235} y={248} w={360} h={48} text="BẬT SỚM TRƯỚC CẢ TIẾNG RÍT!" variant="softAmber" fontSize={20} />
            <text x="235" y="308" textAnchor="middle" fill="#78350F" stroke="none" fontSize="20" fontWeight="800">
              Biết chắc sắp nghe tiếng cào bảng
            </text>
          </g>

          {/* Fast red arrow flipping brain alarm switch */}
          <path d="M 725,432 L 940,432" stroke="#DC2626" strokeWidth="11" strokeLinecap="round" strokeDasharray="16 10" strokeDashoffset={-(frame * 5)} />
          <polygon points="962,432 928,412 928,452" fill="#DC2626" />

          {/* Right Brain Alarm Switch ON Card */}
          <g transform="translate(990, 258)">
            <rect x="0" y="0" width="690" height="350" rx="26" fill="#FEF2F2" stroke="#DC2626" strokeWidth={4.5 + pulse} />
            <CaobangBrainEmblem x={190} y={175} scale={1.1} glowColor="#DC2626" glowOpacity={0.25} />
            {/* Switch ON graphic */}
            <g transform="translate(490, 128)">
              <rect x="-110" y="-38" width="220" height="76" rx="38" fill="#DC2626" stroke="#991B1B" strokeWidth="4" />
              <circle cx="66" cy="0" r="28" fill="#FFFFFF" />
              <text x="-28" y="9" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="26" fontWeight="900">
                BẬT!
              </text>
            </g>
            <text x="490" y="222" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="25" fontWeight="900">
              Vùng khó chịu sáng rực
            </text>
            <text x="490" y="262" textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="700">
              ngay từ giây đầu tiên!
            </text>
          </g>
        </g>
      )}

      <text x="960" y="730" textAnchor="middle" fill="#0C4A6E" stroke="none" fontSize="24" fontWeight="900">
        {activeStep === 0
          ? 'Suy nghĩ và trải nghiệm cũ trong đầu cộng hưởng làm cơn rùng mình dữ dội hơn nhiều'
          : 'Đó là lý do chỉ cần tưởng tượng cảnh cào bảng thôi bạn cũng đã thấy rợn người!'}
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_12: CAOBANG_WHY_SOME_IMMUNE (Beats 38–39, steps 0, 1)
 *   - Step 0: Comparing 2 ear canals with slightly different lengths (peak hit vs shifted peak)
 *   - Step 1: 2 clean secondary factor cards underneath (Độ nhạy hạch hạnh nhân & Tuổi tác)
 * ========================================================================== */
export const CaobangWhySomeImmuneVisual: React.FC<EpisodeVisualProps> = ({
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="MINT" gradId="cb12_bg" cardBorder="#059669" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Vì sao có người nghe cào bảng vẫn tỉnh bơ? 1. Hình dáng ống tai khác nhau'
            : '2. Khác biệt về độ nhạy Hạch hạnh nhân & thính lực theo tuổi tác'
        }
        bg="#FFFFFF"
        color="#065F46"
        border="#059669"
        fontSize={28}
      />

      {/* Top Comparison: 2 Ear Canals (y=205..520) */}
      <g transform="translate(215, 205)">
        <rect x="0" y="0" width="705" height="312" rx="24" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4" />
        <text x="352" y="48" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="25" fontWeight="900">
          Ống tai cộng hưởng đúng đỉnh đỏ
        </text>
        {/* Standard canal */}
        <rect x="85" y="96" width="380" height="72" rx="18" fill="#FFEDD5" stroke={INK} strokeWidth="3.5" />
        <ellipse cx="472" cy="132" rx="14" ry="38" fill="#DC2626" stroke={INK} strokeWidth="3.5" />
        <path d="M 105,132 L 145,108 L 195,156 L 255,98 L 325,164 L 395,96 L 448,132" fill="none" stroke="#DC2626" strokeWidth="5.5" strokeLinejoin="round" />
        <CaobangFaceEmblem x={588} y={132} r={42} mode="cringe" bg="#FEE2E2" border="#DC2626" />
        <CaobangContrastBadge x={352} y={248} w={500} h={46} text="Đỉnh cộng hưởng trùng khớp → Rất chói!" variant="solidRed" fontSize={20} />
      </g>

      <g transform="translate(1000, 205)">
        <rect x="0" y="0" width="705" height="312" rx="24" fill="#ECFDF5" stroke="#059669" strokeWidth="4" />
        <text x="352" y="48" textAnchor="middle" fill="#065F46" stroke="none" fontSize="25" fontWeight="900">
          Ống tai dài/cong hơi khác một chút
        </text>
        {/* Slightly different canal */}
        <rect x="65" y="102" width="420" height="60" rx="18" fill="#D1FAE5" stroke={INK} strokeWidth="3.5" />
        <ellipse cx="492" cy="132" rx="12" ry="32" fill="#059669" stroke={INK} strokeWidth="3.5" />
        <path d="M 90,132 Q 140,118 190,132 T 290,132 T 390,132 T 468,132" fill="none" stroke="#059669" strokeWidth="4.5" />
        <CaobangFaceEmblem x={598} y={132} r={42} mode="calm" bg="#FFFFFF" border="#059669" />
        <CaobangContrastBadge x={352} y={248} w={500} h={46} text="Đỉnh cộng hưởng lệch nhẹ → Bớt chói hơn!" variant="softGreen" fontSize={20} />
      </g>

      {/* Bottom Area: Step 0 caption vs Step 1 2 secondary factor cards */}
      {activeStep === 0 ? (
        <g transform="translate(960, 640)">
          <rect x="-560" y="-44" width="1120" height="88" rx="22" fill="#ECFDF5" stroke="#059669" strokeWidth="3.5" />
          <text x="0" y="10" textAnchor="middle" fill="#065F46" stroke="none" fontSize="25" fontWeight="900">
            Chỉ cần khác biệt vài mi-li-mét ở ống tai cũng đủ làm cảm giác chói tai nhẹ đi!
          </text>
        </g>
      ) : (
        <g>
          <g transform="translate(215, 558)">
            <rect x="0" y="0" width="705" height="162" rx="24" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4" />
            <circle cx="84" cy="81" r="46" fill="#FFFFFF" stroke="#EA580C" strokeWidth="3.5" />
            <CaobangBrainEmblem x={84} y={81} scale={0.42} />
            <text x="154" y="68" textAnchor="start" fill="#9A3412" stroke="none" fontSize="25" fontWeight="900">
              Độ nhạy Hạch hạnh nhân khác nhau
            </text>
            <text x="154" y="108" textAnchor="start" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
              Ngưỡng bật còi báo động ở mỗi người không giống nhau
            </text>
          </g>

          <g transform="translate(1000, 558)">
            <rect x="0" y="0" width="705" height="162" rx="24" fill="#EFF6FF" stroke="#0284C7" strokeWidth="4" />
            <circle cx="84" cy="81" r="46" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.5" />
            <text x="84" y="92" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="34" fontWeight="900">
              Hz↓
            </text>
            <text x="154" y="68" textAnchor="start" fill="#0369A1" stroke="none" fontSize="25" fontWeight="900">
              Thính lực tần số cao giảm theo tuổi
            </text>
            <text x="154" y="108" textAnchor="start" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
              Càng lớn tuổi, độ nhạy với dải âm rít cao thường dịu dần
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_13: CAOBANG_GRIMA_VS_FRISSON (Beats 40–41, steps 0, 1)
 *   - Step 0: Left Coral-Red Card highlighted: Grima (Rùng mình khó chịu)
 *   - Step 1: Right Emerald-Teal Card lights up: Frisson (Nổi da gà sảng khoái) + shared nervous system bridge!
 * ========================================================================== */
export const CaobangGrimaVsFrissonVisual: React.FC<EpisodeVisualProps> = ({
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="SKY" gradId="cb13_bg" cardBorder="#0284C7" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Tâm lý học đặt hẳn một tên gọi riêng: Cảm xúc “Grima”'
            : 'Hai mặt của cùng một hệ thần kinh: Grima (Ghê răng) vs Frisson (Thăng hoa)'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={28}
      />

      {/* Left Card: GRIMA */}
      <g transform="translate(215, 205)">
        <rect x="0" y="0" width="690" height="405" rx="28" fill="#FEF2F2" stroke="#EA580C" strokeWidth="4.8" />
        <CaobangContrastBadge x={345} y={56} w={300} h={52} text="GRIMA" variant="solidRed" fontSize={28} />
        <CaobangFaceEmblem x={345} y={176} r={58} mode="cringe" bg="#FEE2E2" border="#DC2626" />
        <text x="345" y="286" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="28" fontWeight="900">
          Rùng mình khó chịu
        </text>
        <text x="345" y="330" textAnchor="middle" fill="#334155" stroke="none" fontSize="22" fontWeight="800">
          Tiếng cào bảng • Nĩa cọ đĩa sứ • Xốp cọ nhau
        </text>
        <text x="345" y="370" textAnchor="middle" fill="#B91C1C" stroke="none" fontSize="20" fontWeight="700">
          Muốn bịt tai &amp; né tránh ngay lập tức
        </text>
      </g>

      {/* Right Card: FRISSON */}
      <g transform="translate(1015, 205)" opacity={activeStep === 1 ? 1 : 0.35}>
        <rect x="0" y="0" width="690" height="405" rx="28" fill="#ECFDF5" stroke="#059669" strokeWidth="4.8" />
        <CaobangContrastBadge
          x={345}
          y={56}
          w={300}
          h={52}
          text={activeStep === 1 ? 'FRISSON' : '? ? ?'}
          variant="solidGreen"
          fontSize={28}
        />
        {activeStep === 1 ? (
          <>
            <CaobangFaceEmblem x={345} y={176} r={58} mode="bliss" bg="#D1FAE5" border="#059669" />
            <text x="438" y="156" fill="#059669" stroke="none" fontSize="36" fontWeight="900">♪</text>
            <text x="242" y="168" fill="#0D9488" stroke="none" fontSize="32" fontWeight="900">♫</text>
            <text x="345" y="286" textAnchor="middle" fill="#065F46" stroke="none" fontSize="28" fontWeight="900">
              Nổi da gà sảng khoái
            </text>
            <text x="345" y="330" textAnchor="middle" fill="#334155" stroke="none" fontSize="22" fontWeight="800">
              Nghe đoạn nhạc hay tuyệt vời • Cao trào cảm xúc
            </text>
            <text x="345" y="370" textAnchor="middle" fill="#047857" stroke="none" fontSize="20" fontWeight="700">
              Cảm giác thăng hoa &amp; đầy hứng khởi
            </text>
          </>
        ) : (
          <text x="345" y="235" textAnchor="middle" fill="#64748B" stroke="none" fontSize="48" fontWeight="900">
            ?
          </text>
        )}
      </g>

      {/* Bottom Shared Nervous System Bridge */}
      <g transform="translate(960, 686)">
        <rect x="-560" y="-44" width="1120" height="88" rx="24" fill="#EFF6FF" stroke="#0284C7" strokeWidth="3.8" />
        <text x="0" y="9" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="24" fontWeight="900">
          {activeStep === 0
            ? 'Grima là cảm giác ghê răng khó chịu tách biệt hẳn với nỗi sợ hay ghê tởm thông thường'
            : 'Cả Grima lẫn Frisson đều xuất phát từ CÙNG MỘT hệ thần kinh giao cảm nổi da gà!'}
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_14: CAOBANG_3_TIPS (Beats 43–45, steps 0, 1, 2)
 *   - Exact 3-step spotlight matching Beats 43, 44, 45!
 *   - Step 0 (Beat 43): Tip 1 — Tilted 45° chalk (✓) vs 90° upright chalk (✕)
 *   - Step 1 (Beat 44): Tip 2 — Tilted fork cushioned on food instead of bare porcelain
 *   - Step 2 (Beat 45): Tip 3 — Drop shoulders & breathe slowly -> red brain alarm turns calm green
 * ========================================================================== */
export const Caobang3TipsVisual: React.FC<EpisodeVisualProps> = ({
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="MINT" gradId="cb14_bg" cardBorder="#059669" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Mẹo 1: Cầm nghiêng viên phấn 45° xuôi chiều viết để triệt tiêu dính–trượt'
            : activeStep === 1
            ? 'Mẹo 2: Đặt nghiêng đầu nĩa & lót thức ăn bên dưới khi cắt trên đĩa sứ'
            : 'Mẹo 3: Thả lỏng hai vai & hít thở chậm để tắt còi báo động trong não'
        }
        bg="#FFFFFF"
        color="#065F46"
        border="#059669"
        fontSize={27}
      />

      {/* 3 Tip Cards side by side (y=205..675) */}
      {/* CARD 1: Mẹo 1 — Phấn nghiêng 45 độ */}
      <g transform="translate(205, 205)" opacity={activeStep === 0 ? 1 : 0.42}>
        <rect
          x="0"
          y="0"
          width="480"
          height="466"
          rx="26"
          fill={activeStep === 0 ? '#ECFDF5' : '#F8FAFC'}
          stroke={activeStep === 0 ? '#059669' : '#CBD5E1'}
          strokeWidth={activeStep === 0 ? 5.5 : 3}
        />
        <CaobangContrastBadge x={240} y={48} w={300} h={46} text="MẸO 1 • VIẾT BẢNG" variant="solidGreen" fontSize={20} />

        {/* Mini chalkboard comparison: 45 deg (✓) vs 90 deg (✕) */}
        <rect x="34" y="96" width="412" height="214" rx="18" fill="#14532D" stroke="#92400E" strokeWidth="5" />
        {/* Left: 45° smooth chalk */}
        <g transform="translate(136, 206)">
          <g transform="rotate(45)">
            <rect x="-34" y="-9" width="68" height="18" rx="5" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
          </g>
          <text x="0" y="-62" textAnchor="middle" fill="#86EFAC" stroke="none" fontSize="22" fontWeight="900">
            45° • ÊM ✓
          </text>
        </g>
        <line x1="240" y1="116" x2="240" y2="290" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.55" />
        {/* Right: 90° upright screech chalk */}
        <g transform="translate(342, 206)">
          <rect x="-9" y="-34" width="18" height="68" rx="5" fill="#FEF08A" stroke={INK} strokeWidth="3" />
          <path d="M 22,-18 L 36,-24 L 30,2 L 42,14" fill="none" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          <text x="0" y="-62" textAnchor="middle" fill="#FCA5A5" stroke="none" fontSize="22" fontWeight="900">
            90° • RÍT ✕
          </text>
        </g>

        <text x="240" y="362" textAnchor="middle" fill="#065F46" stroke="none" fontSize="24" fontWeight="900">
          Cầm nghiêng 45° &amp; nhẹ tay
        </text>
        <text x="240" y="404" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          Lướt êm ru, hết hiện tượng dính–trượt
        </text>
      </g>

      {/* CARD 2: Mẹo 2 — Nghiêng nĩa & lót thức ăn */}
      <g transform="translate(720, 205)" opacity={activeStep === 1 ? 1 : 0.42}>
        <rect
          x="0"
          y="0"
          width="480"
          height="466"
          rx="26"
          fill={activeStep === 1 ? '#ECFDF5' : '#F8FAFC'}
          stroke={activeStep === 1 ? '#059669' : '#CBD5E1'}
          strokeWidth={activeStep === 1 ? 5.5 : 3}
        />
        <CaobangContrastBadge x={240} y={48} w={300} h={46} text="MẸO 2 • BÀN ĂN" variant="solidGreen" fontSize={20} />

        {/* Plate + steak cushion + tilted fork */}
        <rect x="34" y="96" width="412" height="214" rx="18" fill="#FFFFFF" stroke="#059669" strokeWidth="3.2" />
        <g transform="translate(240, 232)">
          <ellipse cx="0" cy="18" rx="135" ry="32" fill="#F8FAFC" stroke="#64748B" strokeWidth="3.8" />
          {/* Food cushion on plate */}
          <ellipse cx="0" cy="4" rx="74" ry="22" fill="#B45309" stroke={INK} strokeWidth="3" />
          {/* Tilted fork resting gently on food */}
          <g transform="translate(-32, -38) rotate(36)">
            <rect x="-5" y="-44" width="10" height="44" rx="4" fill="#94A3B8" stroke={INK} strokeWidth="2.6" />
            <path d="M -8,0 L -8,18 M 0,0 L 0,20 M 8,0 L 8,18" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Smooth green sound arcs */}
          <path d="M 76,-52 Q 96,-40 76,-28 M 94,-60 Q 118,-40 94,-20" fill="none" stroke="#10B981" strokeWidth="4.2" strokeLinecap="round" />
        </g>

        <text x="240" y="362" textAnchor="middle" fill="#065F46" stroke="none" fontSize="24" fontWeight="900">
          Nghiêng nĩa &amp; lót thức ăn
        </text>
        <text x="240" y="404" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          Tránh để kim loại cọ thẳng mặt sứ
        </text>
      </g>

      {/* CARD 3: Mẹo 3 — Thả lỏng vai & hít thở chậm */}
      <g transform="translate(1235, 205)" opacity={activeStep === 2 ? 1 : 0.42}>
        <rect
          x="0"
          y="0"
          width="480"
          height="466"
          rx="26"
          fill={activeStep === 2 ? '#ECFDF5' : '#F8FAFC'}
          stroke={activeStep === 2 ? '#059669' : '#CBD5E1'}
          strokeWidth={activeStep === 2 ? 5.5 : 3}
        />
        <CaobangContrastBadge x={240} y={48} w={300} h={46} text="MẸO 3 • DỊU NÃO" variant="solidGreen" fontSize={20} />

        {/* Calm breathing + green light inside brain */}
        <rect x="34" y="96" width="412" height="214" rx="18" fill="#FFFFFF" stroke="#059669" strokeWidth="3.2" />
        <g transform="translate(148, 205)">
          <CaobangFaceEmblem x={0} y={-22} r={38} mode="bliss" bg="#D1FAE5" border="#059669" />
          {/* Relaxed dropped shoulders */}
          <path d="M -52,66 C -48,24 -22,18 0,18 C 22,18 48,24 52,66 Z" fill="#10B981" stroke={INK} strokeWidth="3.2" />
          <path d="M -58,28 L -58,50 M 58,28 L 58,50" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
        </g>
        {/* Alarm light switched from Red -> Calm Green */}
        <g transform="translate(342, 205)">
          <circle cx="0" cy="-22" r="40" fill="#10B981" stroke="#065F46" strokeWidth="4" />
          <path d="M -16,-22 L -4,-10 L 18,-34" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <text x="0" y="54" textAnchor="middle" fill="#065F46" stroke="none" fontSize="20" fontWeight="900">
            An toàn rồi!
          </text>
        </g>

        <text x="240" y="362" textAnchor="middle" fill="#065F46" stroke="none" fontSize="24" fontWeight="900">
          Thả lỏng vai &amp; thở chậm
        </text>
        <text x="240" y="404" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          Tắt báo động đỏ ở Hạch hạnh nhân
        </text>
      </g>

      <text x="960" y="732" textAnchor="middle" fill="#065F46" stroke="none" fontSize="23" fontWeight="900">
        Áp dụng ngay tại lớp học và bàn ăn để nói lời tạm biệt cơn rùng mình khó chịu!
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_15: CAOBANG_SOUND_CHECK (Beats 50–51, steps 0, 1)
 *   - Step 0: Interactive sound check ranking card + cringe gauge (y=190..740)
 *   - Step 1: 4 crisp candidate cards (1. Móng tay cào bảng, 2. Nĩa cọ đĩa sứ, 3. Miếng xốp cọ nhau, 4. Phấn rít trên bảng)
 * ========================================================================== */
export const CaobangSoundCheckVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const meterPct = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(frame * 0.08));

  const candidates = [
    { x: 225, y: 215, num: '1', title: 'Móng tay cào bảng', sub: 'Kinh điển trong lớp học', color: '#DC2626', bg: '#FEF2F2' },
    { x: 985, y: 215, num: '2', title: 'Nĩa cọ đĩa sứ', sub: 'Ám ảnh trên bàn ăn tối', color: '#EA580C', bg: '#FFF7ED' },
    { x: 225, y: 425, num: '3', title: 'Miếng xốp cọ nhau', sub: 'Tiếng ken két gai người', color: '#7C3AED', bg: '#F5F3FF' },
    { x: 985, y: 425, num: '4', title: 'Phấn rít trên bảng', sub: 'Cầm phấn dựng thẳng 90°', color: '#0284C7', bg: '#EFF6FF' },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="CORAL" gradId="cb15_bg" cardBorder="#EA580C" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Thử thách nhanh: Đâu là “khắc tinh âm thanh” số một của não bạn?'
            : '4 ứng cử viên nổi tiếng nhất — Tiếng nào làm bạn sởn gai ốc ngay lập tức?'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={28}
      />

      {candidates.map((c, ci) => (
        <g key={ci} transform={`translate(${c.x}, ${c.y})`} opacity={activeStep === 1 ? 1 : 0.6}>
          <rect x="0" y="0" width="710" height="176" rx="24" fill={c.bg} stroke={c.color} strokeWidth="4" />
          {/* Crisp numbered circle strictly on left (cx=76) -> text starts at x=148 */}
          <circle cx="76" cy="88" r="44" fill={c.color} />
          <text x="76" y="101" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="38" fontWeight="900">
            {c.num}
          </text>
          <text x="148" y="80" textAnchor="start" fill={c.color} stroke="none" fontSize="30" fontWeight="900">
            {activeStep === 1 ? c.title : `Ứng cử viên số ${c.num}`}
          </text>
          <text x="148" y="122" textAnchor="start" fill="#334155" stroke="none" fontSize="22" fontWeight="700">
            {activeStep === 1 ? c.sub : 'Đang đo mức độ sởn gai ốc...'}
          </text>
        </g>
      ))}

      {/* Clean Cringe Evaluation Gauge below cards (y=646..726) */}
      <g transform="translate(260, 646)">
        <text x="0" y="22" textAnchor="start" fill="#065F46" stroke="none" fontSize="22" fontWeight="900">
          Bình thường
        </text>
        <text x="1400" y="22" textAnchor="end" fill="#991B1B" stroke="none" fontSize="22" fontWeight="900">
          Sởn gai ốc 10/10!
        </text>
        <rect x="175" y="-2" width="1020" height="30" rx="15" fill="#F1F5F9" stroke="#64748B" strokeWidth="3" />
        <rect x="178" y="1" width={Math.round(1014 * meterPct)} height="24" rx="12" fill="#EA580C" />
        <circle cx={178 + Math.round(1014 * meterPct)} cy="13" r="18" fill="#DC2626" stroke="#FFFFFF" strokeWidth="4" />
      </g>

      <text x="960" y="738" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="22" fontWeight="800">
        Hãy chọn ra 1 âm thanh khiến bạn rùng mình mạnh nhất để chia sẻ ở cuối video nhé!
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_16: CAOBANG_SUMMARY_3_CARDS (Beats 55–57, steps 0, 1, 2)
 *   - Strict 1-to-1 progressive card reveal matching "thứ nhất / thứ hai / thứ ba":
 *     - Step 0 (Beat 55): Card 1 revealed
 *     - Step 1 (Beat 56): Cards 1 + 2 revealed
 *     - Step 2 (Beat 57): All 3 cards revealed
 * ========================================================================== */
export const CaobangSummary3CardsVisual: React.FC<EpisodeVisualProps> = ({
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  const cards = [
    {
      x: 200,
      num: '1',
      title: 'Ống tai khuếch đại',
      badge: 'Dải tần 2.000–4.000 Hz',
      desc1: 'Ma sát dính–trượt tạo sóng rít',
      desc2: 'lọt đúng vùng ống tai phóng đại!',
      color: '#0284C7',
      bg: '#EFF6FF',
      badgeVariant: 'solidBlue' as const,
      unlocked: activeStep >= 0,
    },
    {
      x: 720,
      num: '2',
      title: 'Báo động hạch hạnh nhân',
      badge: 'Phản xạ nổi da gà cổ xưa',
      desc1: 'Sóng nhám giống tiếng hét cảnh báo',
      desc2: 'kéo cơ dựng lông gây rùng mình!',
      color: '#DC2626',
      bg: '#FEF2F2',
      badgeVariant: 'solidRed' as const,
      unlocked: activeStep >= 1,
    },
    {
      x: 1240,
      num: '3',
      title: 'Tâm lý khuếch đại',
      badge: 'Nghiêng phấn • Thả lỏng vai',
      desc1: 'Suy nghĩ trong đầu làm ghê răng x2;',
      desc2: 'nghiêng phấn 45° & thở chậm là dịu!',
      color: '#059669',
      bg: '#ECFDF5',
      badgeVariant: 'solidGreen' as const,
      unlocked: activeStep >= 2,
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="SKY" gradId="cb16_bg" cardBorder="#0284C7" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text="TÓM TẮT 3 ĐIỀU CẦN NHỚ"
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={31}
      />

      {cards.map((c, ci) => (
        <g key={ci} transform={`translate(${c.x}, 205)`}>
          <rect
            x="0"
            y="0"
            width="480"
            height="478"
            rx="28"
            fill={c.unlocked ? c.bg : '#F8FAFC'}
            stroke={c.unlocked ? c.color : '#CBD5E1'}
            strokeWidth={c.unlocked ? 5 : 3}
          />
          {c.unlocked ? (
            <>
              <circle cx="240" cy="86" r="46" fill={c.color} />
              <text x="240" y="101" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="42" fontWeight="900">
                {c.num}
              </text>
              <text x="240" y="182" textAnchor="middle" fill={c.color} stroke="none" fontSize="28" fontWeight="900">
                {c.title}
              </text>
              <CaobangContrastBadge x={240} y={248} w={390} h={48} text={c.badge} variant={c.badgeVariant} fontSize={20} />
              <rect x="26" y="302" width="428" height="136" rx="18" fill="#FFFFFF" stroke={c.color} strokeWidth="2.4" />
              <text x="240" y="356" textAnchor="middle" fill="#0F172A" stroke="none" fontSize="19.5" fontWeight="800">
                {c.desc1}
              </text>
              <text x="240" y="396" textAnchor="middle" fill="#334155" stroke="none" fontSize="19.5" fontWeight="800">
                {c.desc2}
              </text>
            </>
          ) : (
            <>
              <circle cx="240" cy="196" r="48" fill="#E2E8F0" />
              <text x="240" y="212" textAnchor="middle" fill="#64748B" stroke="none" fontSize="42" fontWeight="900">
                {c.num}
              </text>
              <text x="240" y="294" textAnchor="middle" fill="#94A3B8" stroke="none" fontSize="24" fontWeight="800">
                Điểm nhớ thứ {c.num}...
              </text>
            </>
          )}
        </g>
      ))}

      <text x="960" y="736" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="23" fontWeight="900">
        {activeStep === 0
          ? 'Điều 1/3: Cấu tạo ống tai cộng hưởng mạnh nhất ở dải 2.000 – 4.000 Hz'
          : activeStep === 1
          ? 'Điều 2/3: Hạch hạnh nhân nhận nhầm sóng nhám thành tiếng hét báo nguy'
          : 'Đủ 3 bí mật: Vật lý ống tai • Báo động não bộ • Mẹo cắt rùng mình tức thì!'}
      </text>
    </svg>
  );
};
