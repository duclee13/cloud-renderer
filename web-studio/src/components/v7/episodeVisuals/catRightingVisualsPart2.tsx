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
 * SVG_09: CAT_TAIL_MYTH (Beats 26–27, steps 0, 1)
 *   - Step 0: Mass & role comparison — Body & 4 legs (Main engine) vs Light tail (Minor balance helper)
 *   - Step 1: Tailless cat (Manx) smoothly flipping 180° + green tick "Vẫn lật 180° bình thường!"
 * ========================================================================== */
export const CatTailMythVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const flipCycle = Math.min(1, (frame % 72) / 50);
  const taillessRot = 180 * (1 - flipCycle);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="CORAL" gradId="cat09_bg" cardBorder="#EA580C" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Giải oan cho chiếc đuôi: Đuôi KHÔNG phải cánh quạt xoay người!'
            : 'Bằng chứng rõ nhất: Mèo sinh ra không có đuôi vẫn lật trọn 180°!'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Left Larger Card: Body & 4 Legs (Main Engine) */}
          <g transform="translate(185, 204)">
            <rect x={0} y={0} width={860} height={530} rx={28} fill="#ECFDF5" stroke="#15803D" strokeWidth={4.5} />
            <text x={430} y={52} textAnchor="middle" fill="#14532D" fontSize={27} fontWeight={900}>
              Thân mềm &amp; 4 chân (~95% khối lượng)
            </text>
            <g transform="translate(430, 275)">
              <circle cx={0} cy={-26} r={140} fill="#DCFCE7" stroke="#22C55E" strokeWidth={3.5} />
              <CuteCat x={0} y={40} scale={1.32} frame={frame} pose="curl_midair" />
            </g>
            <CatContrastBadge
              x={430}
              y={468}
              w={640}
              h={56}
              text="✓  ĐỘNG CƠ XOAY CHÍNH GIÚP LẬT 180°"
              variant="solidGreen"
              fontSize={22}
            />
          </g>

          {/* Right Card: Tail (Minor Helper, NOT Propeller) */}
          <g transform="translate(1080, 204)">
            <rect x={0} y={0} width={655} height={530} rx={28} fill="#FEF2F2" stroke="#DC2626" strokeWidth={4} />
            <text x={327} y={52} textAnchor="middle" fill="#991B1B" fontSize={26} fontWeight={900}>
              Chiếc đuôi (~5% khối lượng)
            </text>
            {/* Crossed-out helicopter propeller tail diagram */}
            <g transform="translate(327, 240)">
              <circle cx={0} cy={0} r={116} fill="#FFFFFF" stroke="#FCA5A5" strokeWidth={3.5} />
              {/* Curved fluffy orange tail */}
              <path d="M -22,60 Q 48,10 18,-66" fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" />
              <path d="M -22,60 Q 48,10 18,-66" fill="none" stroke="#FB923C" strokeWidth={14} strokeLinecap="round" />
              {/* Spin dashes + Red X */}
              <ellipse cx={16} cy={-64} rx={62} ry={16} fill="none" stroke="#94A3B8" strokeWidth={3.5} strokeDasharray="8 6" />
              <path d="M -68,-68 L 68,68 M 68,-68 L -68,68" stroke="#DC2626" strokeWidth={9} strokeLinecap="round" opacity={0.85} />
            </g>
            <text x={327} y={406} textAnchor="middle" fill="#475569" fontSize={21} fontWeight={800}>
              Quá nhẹ → Chỉ hỗ trợ giữ thăng bằng phụ
            </text>
            <CatContrastBadge
              x={327}
              y={468}
              w={520}
              h={54}
              text="✕  Không phải cánh quạt trực thăng!"
              variant="softRed"
              fontSize={21}
            />
          </g>
        </g>
      ) : (
        <g>
          {/* Step 1: Cute Tailless Manx Cat flipping cleanly and landing on cushion */}
          <g transform="translate(195, 205)">
            <rect x={0} y={0} width={1530} height={532} rx={28} fill="#F0FDF4" stroke="#15803D" strokeWidth={4.5} />

            {/* Left: Tailless Cat Flipping Mid-Air */}
            <g transform="translate(470, 265)">
              <circle cx={0} cy={0} r={170} fill="#FFFFFF" stroke="#22C55E" strokeWidth={4} strokeDasharray="10 8" />
              {/* Rotation arrow */}
              <path d="M -126,-116 A 168,168 0 0,1 132,-106" fill="none" stroke="#15803D" strokeWidth={7} strokeLinecap="round" />
              <polygon points="142,-96 116,-102 132,-122" fill="#15803D" />

              {/* Custom Tailless Manx Cat matching CuteCat stroke style */}
              <g transform={`rotate(${taillessRot.toFixed(1)})`}>
                <g stroke={INK} strokeWidth={4.2} strokeLinejoin="round" strokeLinecap="round">
                  {/* Tiny round stubby tailless rear (Manx highlight!) */}
                  <circle cx={-64} cy={-8} r={11} fill="#FDBA74" />
                  {/* Highlight dashed ring around tailless rear */}
                  <circle cx={-64} cy={-8} r={26} fill="none" stroke="#EA580C" strokeWidth={3.5} strokeDasharray="6 5" />
                  {/* Flexible arched body */}
                  <path d="M -58,0 C -46,-46 18,-48 56,-8 C 68,6 58,34 32,34 L -36,34 C -58,34 -68,18 -58,0 Z" fill="#FB923C" />
                  <ellipse cx={-2} cy={14} rx={36} ry={15} fill="#FFF7ED" stroke="none" />
                  {/* 4 cute paws */}
                  <rect x={-44} y={24} width={16} height={34} rx={7} fill="#FB923C" />
                  <rect x={-18} y={26} width={16} height={32} rx={7} fill="#FB923C" />
                  <rect x={16} y={26} width={16} height={32} rx={7} fill="#FB923C" />
                  <rect x={40} y={24} width={16} height={34} rx={7} fill="#FB923C" />
                  {/* Cute Cat Head */}
                  <g transform="translate(64, -22)">
                    <polygon points="-20,-18 -24,-46 -4,-28" fill="#FB923C" />
                    <polygon points="20,-18 24,-46 4,-28" fill="#FB923C" />
                    <polygon points="-16,-22 -19,-36 -8,-26" fill="#FBCFE8" stroke="none" />
                    <polygon points="16,-22 19,-36 8,-26" fill="#FBCFE8" stroke="none" />
                    <circle cx={0} cy={0} r={32} fill="#FB923C" />
                    <ellipse cx={0} cy={10} rx={16} ry={11} fill="#FFF7ED" stroke="none" />
                    <circle cx={-10} cy={-4} r={4.5} fill={INK} stroke="none" />
                    <circle cx={10} cy={-4} r={4.5} fill={INK} stroke="none" />
                    <polygon points="-4,4 4,4 0,9" fill="#FB7185" stroke="none" />
                    <path d="M -7,13 Q -3.5,18 0,13 Q 3.5,18 7,13" fill="none" strokeWidth={2.6} />
                  </g>
                </g>
              </g>
            </g>

            {/* Right: Proof details + Green Check Badge */}
            <g transform="translate(1105, 250)">
              <rect x={-345} y={-185} width={690} height={370} rx={24} fill="#FFFFFF" stroke="#86EFAC" strokeWidth={3.5} />
              <CatContrastBadge x={0} y={-120} w={480} h={52} text="Giống mèo Manx (Cụt đuôi tự nhiên)" variant="softAmber" fontSize={21} />
              <text x={0} y={-34} textAnchor="middle" fill="#0F172A" fontSize={25} fontWeight={900}>
                Không có chiếc đuôi dài làm đối trọng...
              </text>
              <text x={0} y={14} textAnchor="middle" fill="#334155" fontSize={22} fontWeight={700}>
                nhưng nhờ cột sống siêu dẻo &amp; xoay 2 nửa thân:
              </text>
              <g transform="translate(0, 96)">
                <rect x={-290} y={-36} width={580} height={72} rx={36} fill="#15803D" stroke="#14532D" strokeWidth={3.5} />
                <CatCheckCircle cx={-236} cy={0} r={20} bg="#22C55E" />
                <text x={24} y={9} textAnchor="middle" fill="#FFFFFF" fontSize={25} fontWeight={900}>
                  Vẫn lật 180° bình thường!
                </text>
              </g>
            </g>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_10: CAT_SPRING_LEGS (Beats 32–33, steps 0, 1)
 *   - Step 0: Cat touching ground with arched back & 4 green spring shock absorbers under paws
 *   - Step 1: Impact force chart (Axis baseline cleanly at y=580, caption at y=710 -> >= 80px gap!)
 * ========================================================================== */
export const CatSpringLegsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const bounce = Math.sin(frame * 0.16) * 8;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="MINT" gradId="cat10_bg" cardBorder="#059669" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Tuyệt chiêu chạm đất êm ru: Bộ đệm lò xo giảm xóc 4 chân!'
            : 'So sánh lực va chạm: Chùng chân lò xo dàn trải lực êm hơn hẳn!'
        }
        bg="#FFFFFF"
        color="#065F46"
        border="#059669"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Left main illustration: Cat compressing on 4 green shock-absorber springs */}
          <g transform="translate(185, 202)">
            <rect x={0} y={0} width={960} height={536} rx={28} fill="#F0FDF4" stroke="#15803D" strokeWidth={4} />
            {/* Ground floor line */}
            <line x1={70} y1={452} x2={890} y2={452} stroke="#0F172A" strokeWidth={5} strokeLinecap="round" />
            <ellipse cx={480} cy={456} rx={250} ry={16} fill="#0F172A" opacity={0.12} />

            {/* 4 Animated Green Shock Springs beneath paws */}
            {[-125, -52, 48, 118].map((sx, si) => {
              const topY = 344 + bounce;
              const botY = 450;
              const mid1 = topY + (botY - topY) * 0.25;
              const mid2 = topY + (botY - topY) * 0.5;
              const mid3 = topY + (botY - topY) * 0.75;
              return (
                <g key={si} transform={`translate(${480 + sx}, 0)`}>
                  <path
                    d={`M 0,${topY.toFixed(1)} L 16,${mid1.toFixed(1)} L -16,${mid2.toFixed(1)} L 16,${mid3.toFixed(1)} L 0,${botY}`}
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Cute cushioned paw pad at bottom */}
                  <ellipse cx={0} cy={botY - 4} rx={22} ry={9} fill="#FDBA74" stroke={INK} strokeWidth={3} />
                </g>
              );
            })}

            {/* Arched cat body bouncing smoothly on the 4 springs */}
            <g transform={`translate(480, ${(358 + bounce).toFixed(1)})`}>
              <CuteCat x={0} y={0} scale={1.55} frame={frame} pose="stand" />
            </g>

            {/* Curved arch indicator arrow over spine */}
            <path d="M 355,142 Q 475,92 595,142" fill="none" stroke="#0284C7" strokeWidth={5} strokeDasharray="10 7" strokeLinecap="round" />
            <text x={475} y={82} textAnchor="middle" fill="#0369A1" fontSize={22} fontWeight={900}>
              Cong nhẹ lưng giúp hấp thụ chấn động
            </text>
          </g>

          {/* Right callout cards: 2 structural cushions */}
          <g transform="translate(1180, 202)">
            <rect x={0} y={0} width={555} height={252} rx={24} fill="#FFFFFF" stroke="#059669" strokeWidth={3.8} />
            <circle cx={72} cy={80} r={36} fill="#DCFCE7" stroke="#15803D" strokeWidth={3.5} />
            <text x={72} y={90} textAnchor="middle" fill="#15803D" fontSize={28} fontWeight={900}>1</text>
            <text x={130} y={76} fill="#14532D" fontSize={24} fontWeight={900}>Khớp chân gập lò xo</text>
            <text x={130} y={114} fill="#334155" fontSize={19.5} fontWeight={700}>Cơ bắp &amp; gân co giãn chậm rãi</text>
            <text x={42} y={178} fill="#334155" fontSize={19.5} fontWeight={700}>Chùng cả 4 chân ngay lúc chạm đất</text>
            <text x={42} y={214} fill="#059669" fontSize={20} fontWeight={900}>→ Kéo dài thời gian hãm phanh!</text>

            <rect x={0} y={284} width={555} height={252} rx={24} fill="#FFFBEB" stroke="#D97706" strokeWidth={3.8} />
            <circle cx={72} cy={364} r={36} fill="#FEF3C7" stroke="#D97706" strokeWidth={3.5} />
            <text x={72} y={374} textAnchor="middle" fill="#92400E" fontSize={28} fontWeight={900}>2</text>
            <text x={130} y={360} fill="#92400E" fontSize={24} fontWeight={900}>Đệm thịt bàn chân dày</text>
            <text x={130} y={398} fill="#334155" fontSize={19.5} fontWeight={700}>Lớp mỡ &amp; mô đàn hồi tự nhiên</text>
            <text x={42} y={462} fill="#334155" fontSize={19.5} fontWeight={700}>Giống bộ đế giày thể thao êm ái</text>
            <text x={42} y={498} fill="#B45309" fontSize={20} fontWeight={900}>→ Chống trượt &amp; êm ru không tiếng động!</text>
          </g>
        </g>
      ) : (
        <g>
          {/* Step 1: Impact Force Graph — STRICT baseline at y=578, x-label at y=616, caption pill at y=710 (>= 90px clear!) */}
          <g>
            {/* Chart background card y=200..650 */}
            <rect x={185} y={196} width={1550} height={456} rx={26} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={3.5} />

            {/* Y-axis & X-axis (baseline strictly at y=578!) */}
            <line x1={310} y1={245} x2={310} y2={578} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
            <line x1={310} y1={578} x2={1645} y2={578} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
            <polygon points="310,232 300,252 320,252" fill={INK} />
            <polygon points="1658,578 1638,568 1638,588" fill={INK} />
            <text x={286} y={260} textAnchor="end" fill="#0F172A" fontSize={20} fontWeight={900}>Lực va chạm</text>
            <text x={1610} y={616} textAnchor="end" fill="#475569" fontSize={20} fontWeight={800}>Thời gian chạm đất →</text>

            {/* Red Tall Sharp Spike: Rigid landing */}
            <path
              d="M 410,578 Q 515,578 555,270 Q 595,578 700,578 Z"
              fill="#FCA5A5"
              opacity={0.55}
            />
            <path
              d="M 410,578 Q 515,578 555,270 Q 595,578 700,578"
              fill="none"
              stroke="#DC2626"
              strokeWidth={6.5}
              strokeLinecap="round"
            />
            <g transform="translate(555, 250)">
              <rect x={-195} y={-28} width={390} height={50} rx={25} fill="#DC2626" />
              <text x={0} y={6} textAnchor="middle" fill="#FFFFFF" fontSize={20} fontWeight={900}>
                Rơi cứng đơ: Đỉnh lực nhọn, đau!
              </text>
            </g>

            {/* Green Low Wide Smooth Curve: Cat spring-leg landing */}
            <path
              d="M 850,578 Q 1010,435 1190,435 Q 1370,435 1530,578 Z"
              fill="#86EFAC"
              opacity={0.58}
            />
            <path
              d="M 850,578 Q 1010,435 1190,435 Q 1370,435 1530,578"
              fill="none"
              stroke="#15803D"
              strokeWidth={7}
              strokeLinecap="round"
            />
            <g transform="translate(1190, 385)">
              <rect x={-230} y={-28} width={460} height={52} rx={26} fill="#15803D" />
              <text x={0} y={6} textAnchor="middle" fill="#FFFFFF" fontSize={20} fontWeight={900}>
                Chùng chân lò xo: Dàn lực đều, êm ru!
              </text>
            </g>

            {/* Axis sub-labels strictly above y=624 */}
            <text x={555} y={618} textAnchor="middle" fill="#B91C1C" fontSize={19} fontWeight={900}>
              Va chạm tức thời (rất ngắn)
            </text>
            <text x={1190} y={618} textAnchor="middle" fill="#15803D" fontSize={19} fontWeight={900}>
              Hấp thụ lực kéo dài &amp; phân tán đều
            </text>
          </g>

          {/* Bottom Summary Pill cleanly separated at y=714 (136px below chart line y=578!) */}
          <CatContrastBadge
            x={960}
            y={714}
            w={1220}
            h={58}
            text="Kéo dài thời gian giảm tốc → Lực dội vào khung xương giảm đi rất nhiều! ✓"
            variant="softGreen"
            fontSize={22}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_11: CAT_PARACHUTE_VELOCITY (Beats 34–35, steps 0, 1)
 *   - Step 0: Cat spreading all 4 legs & fluffy fur horizontally like a mini parachute in upward airflow
 *   - Step 1: Terminal velocity comparison bars (Axis baseline y=575, caption pill y=710 -> >= 85px gap!)
 * ========================================================================== */
export const CatParachuteVelocityVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const windRise = (frame * 3.2) % 90;
  const hoverY = Math.sin(frame * 0.14) * 10;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="SKY" gradId="cat11_bg" cardBorder="#0284C7" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Tuyệt chiêu số 2 khi rơi cao: Xòe 4 chân thành chiếc dù lượn tí hon!'
            : 'Vận tốc rơi cực đại: Mèo chỉ rơi nhanh bằng MỘT NỬA con người!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Bright sky wind tunnel card */}
          <rect x={185} y={196} width={1550} height={542} rx={28} fill="#E0F2FE" stroke="#0284C7" strokeWidth={4} />

          {/* Upward animated cyan air-resistance wind arrows */}
          {[360, 560, 760, 960, 1160, 1360, 1560].map((wx, wi) => {
            const wy = 660 - ((windRise + wi * 38) % 160);
            return (
              <g key={wi} transform={`translate(${wx}, ${wy.toFixed(1)})`} opacity={0.78}>
                <line x1={0} y1={52} x2={0} y2={0} stroke="#0284C7" strokeWidth={5.5} strokeLinecap="round" />
                <polygon points="0,-10 -11,10 11,10" fill="#0284C7" />
              </g>
            );
          })}

          {/* Parachute-Spread Flying-Squirrel-Style Cute Cat */}
          <g transform={`translate(960, ${(415 + hoverY).toFixed(1)})`} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round">
            {/* Air drag canopy arc beneath cat */}
            <path d="M -250,48 Q 0,108 250,48" fill="none" stroke="#38BDF8" strokeWidth={7} strokeDasharray="14 10" />
            {/* 4 Legs spread wide horizontally */}
            <path d="M -110,-28 L -220,-62 L -208,-34 L -112,4 Z" fill="#FB923C" />
            <path d="M 110,-28 L 220,-62 L 208,-34 L 112,4 Z" fill="#FB923C" />
            <path d="M -104,24 L -216,66 L -198,92 L -94,48 Z" fill="#FB923C" />
            <path d="M 104,24 L 216,66 L 198,92 L 94,48 Z" fill="#FB923C" />
            {/* Puffed wide fluffy torso */}
            <ellipse cx={0} cy={4} rx={124} ry={62} fill="#FB923C" />
            <ellipse cx={0} cy={14} rx={82} ry={38} fill="#FFF7ED" stroke="none" />
            {/* Head facing forward */}
            <g transform="translate(0, -68)">
              <polygon points="-32,-16 -40,-56 -8,-30" fill="#FB923C" />
              <polygon points="32,-16 40,-56 8,-30" fill="#FB923C" />
              <polygon points="-26,-20 -31,-42 -12,-28" fill="#FBCFE8" stroke="none" />
              <polygon points="26,-20 31,-42 12,-28" fill="#FBCFE8" stroke="none" />
              <circle cx={0} cy={0} r={42} fill="#FB923C" />
              <ellipse cx={0} cy={14} rx={22} ry={14} fill="#FFF7ED" stroke="none" />
              <circle cx={-14} cy={-5} r={5.5} fill={INK} stroke="none" />
              <circle cx={14} cy={-5} r={5.5} fill={INK} stroke="none" />
              <polygon points="-5,6 5,6 0,12" fill="#FB7185" stroke="none" />
              <path d="M -10,18 Q -5,24 0,18 Q 5,24 10,18" fill="none" strokeWidth={3.2} />
            </g>
          </g>

          <CatContrastBadge
            x={960}
            y={682}
            w={820}
            h={56}
            text="↑  Tư thế dù lượn tăng lực cản không khí tối đa!"
            variant="solidBlue"
            fontSize={23}
          />
        </g>
      ) : (
        <g>
          {/* Step 1: Speed comparison bar chart — baseline y=572, bar names y=612, bottom pill y=712 (>= 100px gap!) */}
          <rect x={185} y={196} width={1550} height={452} rx={26} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={3.5} />

          {/* Clean Axis Baseline at y=572 */}
          <line x1={320} y1={572} x2={1600} y2={572} stroke={INK} strokeWidth={5} strokeLinecap="round" />

          {/* Left Tall Bar: Human Free-Fall (~190-210 km/h) */}
          <g transform="translate(650, 0)">
            <rect x={-140} y={272} width={280} height={300} rx={22} fill="#EF4444" stroke={INK} strokeWidth={4} />
            <text x={0} y={252} textAnchor="middle" fill="#B91C1C" fontSize={28} fontWeight={900}>
              ~190 – 210 km/h
            </text>
            <text x={0} y={432} textAnchor="middle" fill="#FFFFFF" fontSize={25} fontWeight={900}>
              Rơi rất nhanh
            </text>
            <text x={0} y={616} textAnchor="middle" fill="#991B1B" fontSize={24} fontWeight={900}>
              Người rơi tự do
            </text>
          </g>

          {/* Center Ratio Comparison Callout */}
          <g transform="translate(960, 420)">
            <circle cx={0} cy={0} r={62} fill="#FEF08A" stroke={INK} strokeWidth={4} />
            <text x={0} y={-4} textAnchor="middle" fill={INK} fontSize={28} fontWeight={900}>
              ≈ 1/2
            </text>
            <text x={0} y={26} textAnchor="middle" fill="#92400E" fontSize={16.5} fontWeight={900}>
              tốc độ!
            </text>
          </g>

          {/* Right Half-Height Bar: Cat Parachute (~97-100 km/h) */}
          <g transform="translate(1270, 0)">
            <rect x={-140} y={422} width={280} height={150} rx={22} fill="#16A34A" stroke={INK} strokeWidth={4} />
            <text x={0} y={400} textAnchor="middle" fill="#14532D" fontSize={28} fontWeight={900}>
              ~97 – 100 km/h
            </text>
            <text x={0} y={506} textAnchor="middle" fill="#FFFFFF" fontSize={23} fontWeight={900}>
              Cản gió tốt hơn!
            </text>
            <text x={0} y={616} textAnchor="middle" fill="#14532D" fontSize={24} fontWeight={900}>
              Mèo xòe dù lượn
            </text>
          </g>

          {/* Bottom Caption Pill well clear below chart baseline (y=714 vs baseline y=572!) */}
          <CatContrastBadge
            x={960}
            y={714}
            w={1180}
            h={58}
            text="Thân nhẹ + Diện tích cản gió lớn → Vận tốc rơi cực đại của mèo chỉ ~100 km/h!"
            variant="solidBlue"
            fontSize={22}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_12: CAT_HIGH_RISE_TRUTH (Beats 37–38, steps 0, 1)
 *   - Step 0: High-contrast solidRed banner "MÈO KHÔNG HỀ BẤT TỬ!" + 3 vet injury risks
 *   - Step 1: Survivorship Bias diagram (chart baseline y=572, caption pill y=712 -> >= 85px gap!)
 * ========================================================================== */
export const CatHighRiseTruthVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.22);

  const risks = [
    {
      x: 215,
      num: '1',
      title: 'Gãy chân & xương chậu',
      sub1: 'Lực va chạm từ tầng cao vượt',
      sub2: 'giới hạn chịu lực của khớp chân',
    },
    {
      x: 725,
      num: '2',
      title: 'Chấn thương hàm & mặt',
      sub1: 'Cằm đập mạnh xuống nền cứng',
      sub2: 'ngay sau khi 4 chân chạm đất',
    },
    {
      x: 1235,
      num: '3',
      title: 'Tổn thương phổi & nội tạng',
      sub1: 'Tràn khí lồng ngực, dập phổi',
      sub2: 'cần cấp cứu thú y khẩn cấp!',
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="ROSE" gradId="cat12_bg" cardBorder="#DC2626" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Sự thật thú y: Hội chứng nhà cao tầng ở mèo!'
            : 'Giải mã tin đồn tầng 7: Bẫy thống kê “Thiên lệch sống sót”!'
        }
        bg="#FFFFFF"
        color="#991B1B"
        border="#DC2626"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* High-contrast solidRed Hero Banner */}
          <g transform={`translate(960, 248) scale(${(1 + pulse * 0.018).toFixed(3)})`}>
            <CatContrastBadge
              x={0}
              y={0}
              w={820}
              h={72}
              text="⚠   MÈO KHÔNG HỀ BẤT TỬ (KHÔNG CÓ 9 MẠNG!)"
              variant="solidRed"
              fontSize={27}
            />
          </g>

          {/* 3 Clean Vet Risk Cards (y=325..665) */}
          {risks.map((r, idx) => (
            <g key={idx} transform={`translate(${r.x}, 325)`}>
              <rect x={0} y={0} width={470} height={335} rx={26} fill="#FEF2F2" stroke="#DC2626" strokeWidth={4} />
              <circle cx={235} cy={82} r={44} fill="#DC2626" />
              <text x={235} y={96} textAnchor="middle" fill="#FFFFFF" fontSize={36} fontWeight={900}>
                {r.num}
              </text>
              <text x={235} y={176} textAnchor="middle" fill="#991B1B" fontSize={25} fontWeight={900}>
                {r.title}
              </text>
              <rect x={28} y={204} width={414} height={106} rx={16} fill="#FFFFFF" stroke="#FCA5A5" strokeWidth={2.5} />
              <text x={235} y={248} textAnchor="middle" fill="#334155" fontSize={19} fontWeight={700}>
                {r.sub1}
              </text>
              <text x={235} y={282} textAnchor="middle" fill="#334155" fontSize={19} fontWeight={700}>
                {r.sub2}
              </text>
            </g>
          ))}

          {/* Bottom Vet Advisory */}
          <CatContrastBadge
            x={960}
            y={722}
            w={1180}
            h={54}
            text="Bác sĩ thú y cảnh báo: Mèo ngã từ ban công cao rất dễ chấn thương nặng!"
            variant="softRed"
            fontSize={22}
          />
        </g>
      ) : (
        <g>
          {/* Step 1: Survivorship Bias Chart — Baseline strictly y=574, bottom pill y=714 (>= 100px gap!) */}
          <rect x={185} y={196} width={1550} height={452} rx={26} fill="#FFFBEB" stroke="#D97706" strokeWidth={3.8} />
          <text x={960} y={244} textAnchor="middle" fill="#92400E" fontSize={26} fontWeight={900}>
            Lỗ hổng thống kê: Thiên lệch sống sót (Survivorship Bias)
          </text>

          {/* Clean Baseline y=574 */}
          <line x1={275} y1={574} x2={1645} y2={574} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />

          {/* Left Column: Survived -> Brought to Vet Clinic (Counted!) */}
          <g transform="translate(565, 0)">
            <rect x={-230} y={288} width={460} height={286} rx={22} fill="#ECFDF5" stroke="#15803D" strokeWidth={4} />
            <text x={0} y={340} textAnchor="middle" fill="#14532D" fontSize={24} fontWeight={900}>
              Ca may mắn sống sót
            </text>
            <text x={0} y={386} textAnchor="middle" fill="#334155" fontSize={20} fontWeight={700}>
              Chủ đưa tới phòng khám thú y
            </text>
            <CatContrastBadge x={0} y={468} w={370} h={52} text="✓ Được ghi vào số liệu cũ" variant="solidGreen" fontSize={20} />
            <text x={0} y={616} textAnchor="middle" fill="#14532D" fontSize={21} fontWeight={900}>
              Phần nổi nhìn thấy được
            </text>
          </g>

          {/* Right Column: Fatal immediately -> Never reached clinic (Missing from data!) */}
          <g transform="translate(1335, 0)">
            <rect x={-250} y={288} width={500} height={286} rx={22} fill="#FEF2F2" stroke="#DC2626" strokeWidth={4} strokeDasharray="12 8" />
            <text x={0} y={340} textAnchor="middle" fill="#991B1B" fontSize={24} fontWeight={900}>
              Ca tử vong ngay tại chỗ
            </text>
            <text x={0} y={386} textAnchor="middle" fill="#334155" fontSize={20} fontWeight={700}>
              Không được đưa tới phòng khám
            </text>
            <CatContrastBadge x={0} y={468} w={410} h={52} text="✕ Bị bỏ sót khỏi bảng thống kê!" variant="solidRed" fontSize={20} />
            <text x={0} y={616} textAnchor="middle" fill="#991B1B" fontSize={21} fontWeight={900}>
              Phần chìm gây hiểu lầm nghiêm trọng!
            </text>
          </g>

          {/* Bottom Summary Pill cleanly at y=714 */}
          <CatContrastBadge
            x={960}
            y={714}
            w={1240}
            h={56}
            text="Kết luận khoa học: Rơi từ tầng càng cao thì nguy cơ tử vong càng lớn!"
            variant="solidRed"
            fontSize={22}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_13: CAT_WHEN_FAILS (Beats 39–40, steps 0, 1)
 *   - Step 0: Clean 3-card preview of biological limits (y=210..720)
 *   - Step 1: 3 vivid revealed cases (<3-4 weeks kitten, obese/senior cat, <20-30cm too low)
 * ========================================================================== */
export const CatWhenFailsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  const limits = [
    {
      x: 190,
      num: '1',
      title: 'Mèo con < 3–4 tuần',
      sub1: 'Phản xạ chưa phát triển',
      sub2: '(Hoàn thiện lúc 6–9 tuần)',
      color: '#0284C7',
      bg: '#F0F9FF',
      icon: 'KITTEN',
    },
    {
      x: 720,
      num: '2',
      title: 'Mèo béo phì / lớn tuổi',
      sub1: 'Cơ thể nặng nề, xương khớp cứng',
      sub2: '→ Tốc độ xoay chậm hơn nhiều',
      color: '#D97706',
      bg: '#FFFBEB',
      icon: 'CHUBBY',
    },
    {
      x: 1250,
      num: '3',
      title: 'Rơi quá sát đất',
      sub1: 'Độ cao dưới 20–30 cm',
      sub2: '→ Không đủ thời gian lật 180°',
      color: '#DC2626',
      bg: '#FEF2F2',
      icon: 'LOW',
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="CREAM" gradId="cat13_bg" cardBorder="#D97706" />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Phản xạ lật người của mèo vẫn có những giới hạn sinh học rõ ràng'
            : '3 trường hợp mèo KHÔNG kịp xoay người tiếp đất 4 chân!'
        }
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={29}
      />

      {limits.map((item, idx) => (
        <g key={idx} transform={`translate(${item.x}, 210)`} opacity={activeStep === 1 ? 1 : 0.72}>
          <rect x={0} y={0} width={480} height={515} rx={28} fill={item.bg} stroke={item.color} strokeWidth={4.5} />
          {/* Header badge */}
          <rect x={36} y={24} width={408} height={52} rx={26} fill={item.color} />
          <text x={240} y={58} textAnchor="middle" fill="#FFFFFF" fontSize={23} fontWeight={900}>
            {activeStep === 1 ? `${item.num}. ${item.title}` : `Giới hạn số ${item.num}`}
          </text>

          {/* Illustration box */}
          <rect x={36} y={98} width={408} height={240} rx={22} fill="#FFFFFF" stroke={item.color} strokeWidth={2.8} />

          {activeStep === 0 ? (
            <g transform="translate(240, 218)">
              <circle cx={0} cy={0} r={58} fill={item.bg} stroke={item.color} strokeWidth={4} strokeDasharray="8 6" />
              <text x={0} y={18} textAnchor="middle" fill={item.color} fontSize={54} fontWeight={900}>
                ?
              </text>
            </g>
          ) : (
            <g transform="translate(240, 218)">
              {item.icon === 'KITTEN' && (
                <g>
                  <CuteCat x={0} y={70} scale={0.78} frame={frame} pose="sit" />
                  <CatContrastBadge x={0} y={-82} w={230} h={38} text="< 3–4 tuần tuổi" variant="solidBlue" fontSize={18} />
                </g>
              )}
              {item.icon === 'CHUBBY' && (
                <g transform="scale(1.18, 0.96)">
                  <CuteCat x={0} y={76} scale={0.95} frame={frame + 20} pose="sit" />
                </g>
              )}
              {item.icon === 'LOW' && (
                <g>
                  {/* Low floor & ruler */}
                  <line x1={-150} y1={84} x2={150} y2={84} stroke={INK} strokeWidth={5} strokeLinecap="round" />
                  <rect x={-135} y={-20} width={34} height={104} rx={8} fill="#FEF08A" stroke="#D97706" strokeWidth={3} />
                  <text x={-118} y={-32} textAnchor="middle" fill="#DC2626" fontSize={19} fontWeight={900}>&lt;20cm</text>
                  <g transform="translate(36, 16) rotate(135)">
                    <CuteCat x={0} y={32} scale={0.74} frame={frame} pose="curl_midair" />
                  </g>
                </g>
              )}
            </g>
          )}

          {/* Description lines */}
          <text x={240} y={398} textAnchor="middle" fill="#0F172A" fontSize={21} fontWeight={900}>
            {activeStep === 1 ? item.sub1 : 'Đang mở hồ sơ sinh học...'}
          </text>
          <text x={240} y={442} textAnchor="middle" fill={item.color} fontSize={20} fontWeight={800}>
            {activeStep === 1 ? item.sub2 : 'Không phải lúc nào cũng xoay kịp!'}
          </text>
        </g>
      ))}
    </svg>
  );
};

/* ============================================================================
 * SVG_14: CAT_OTHER_ANIMALS_NASA (Beats 42–44, steps 0, 1, 2)
 *   - Step 0: 3 cute animal cards (Thỏ, Thằn lằn, Bọ que) with rotation arrows
 *   - Step 1: Cat -> NASA zero-gravity astronaut & robotics inspiration
 *   - Step 2: Green Pet Safety Card: Balcony safety net window + green tick
 * ========================================================================== */
export const CatOtherAnimalsNasaVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = Math.min(2, step ?? visualStep ?? 0);
  const floatAstro = Math.sin(frame * 0.08) * 10;
  const rotAstro = Math.sin(frame * 0.05) * 14;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop
        tone={activeStep === 2 ? 'FOREST' : activeStep === 1 ? 'SKY' : 'MINT'}
        gradId="cat14_bg"
        cardBorder={activeStep === 2 ? '#15803D' : '#0284C7'}
      />
      <CatCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Không chỉ mèo — nhiều loài vật nhỏ khác cũng biết xoay giữa không trung!'
            : activeStep === 1
            ? 'NASA tài trợ nghiên cứu cú xoay của mèo cho phi hành gia & robot!'
            : 'Bài học an toàn cho chủ nuôi: Lắp lưới ban công & không thả thử mèo!'
        }
        bg="#FFFFFF"
        color={activeStep === 2 ? '#14532D' : '#0369A1'}
        border={activeStep === 2 ? '#15803D' : '#0284C7'}
        fontSize={28}
      />

      {activeStep === 0 && (
        <g>
          {/* Card 1: Cute Rabbit (Thỏ) */}
          <g transform="translate(195, 210)">
            <rect x={0} y={0} width={475} height={515} rx={28} fill="#FFF7ED" stroke="#EA580C" strokeWidth={4} />
            <text x={237} y={54} textAnchor="middle" fill="#C2410C" fontSize={28} fontWeight={900}>1. Loài Thỏ</text>
            <g transform="translate(237, 250)" stroke={INK} strokeWidth={4} strokeLinejoin="round">
              <circle cx={0} cy={0} r={118} fill="#FFFFFF" stroke="#FDBA74" strokeWidth={3.5} />
              {/* Rabbit ears */}
              <ellipse cx={-20} cy={-78} rx={15} ry={44} transform="rotate(-12, -20, -78)" fill="#F8FAFC" />
              <ellipse cx={20} cy={-78} rx={15} ry={44} transform="rotate(12, 20, -78)" fill="#F8FAFC" />
              <ellipse cx={-20} cy={-78} rx={7} ry={28} transform="rotate(-12, -20, -78)" fill="#FBCFE8" stroke="none" />
              <ellipse cx={20} cy={-78} rx={7} ry={28} transform="rotate(12, 20, -78)" fill="#FBCFE8" stroke="none" />
              {/* Cute round bunny head & body */}
              <ellipse cx={0} cy={40} rx={52} ry={36} fill="#F8FAFC" />
              <circle cx={0} cy={-16} r={38} fill="#F8FAFC" />
              <circle cx={-13} cy={-20} r={4.5} fill={INK} stroke="none" />
              <circle cx={13} cy={-20} r={4.5} fill={INK} stroke="none" />
              <polygon points="-5,-8 5,-8 0,-2" fill="#FB7185" stroke="none" />
              {/* Rotation arrow */}
              <path d="M -88,-52 A 98,98 0 0,1 88,-52" fill="none" stroke="#EA580C" strokeWidth={5.5} strokeLinecap="round" />
              <polygon points="96,-44 74,-48 86,-66" fill="#EA580C" stroke="none" />
            </g>
            <text x={237} y={426} textAnchor="middle" fill="#334155" fontSize={21} fontWeight={800}>
              Uốn thân &amp; xoay chỉnh tư thế
            </text>
            <text x={237} y={464} textAnchor="middle" fill="#C2410C" fontSize={20} fontWeight={900}>
              nhanh nhạy giữa không trung!
            </text>
          </g>

          {/* Card 2: Cute Gecko / Lizard (Thằn lằn) */}
          <g transform="translate(722, 210)">
            <rect x={0} y={0} width={475} height={515} rx={28} fill="#ECFDF5" stroke="#15803D" strokeWidth={4} />
            <text x={237} y={54} textAnchor="middle" fill="#14532D" fontSize={28} fontWeight={900}>2. Thằn lằn</text>
            <g transform="translate(237, 250)" stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
              <circle cx={0} cy={0} r={118} fill="#FFFFFF" stroke="#86EFAC" strokeWidth={3.5} />
              {/* Cute green gecko body + swinging tail */}
              <path d="M -84,26 Q -45,54 -14,22" fill="none" stroke="#16A34A" strokeWidth={14} />
              <ellipse cx={16} cy={6} rx={48} ry={22} fill="#22C55E" />
              <circle cx={72} cy={-4} r={24} fill="#4ADE80" />
              <circle cx={78} cy={-10} r={4.5} fill={INK} stroke="none" />
              <path d="M -10,20 L -24,46 M 38,20 L 52,46 M -4,-12 L -20,-34 M 40,-12 L 56,-34" stroke="#15803D" strokeWidth={7} />
              <path d="M -88,-52 A 98,98 0 0,1 88,-52" fill="none" stroke="#15803D" strokeWidth={5.5} />
              <polygon points="96,-44 74,-48 86,-66" fill="#15803D" stroke="none" />
            </g>
            <text x={237} y={426} textAnchor="middle" fill="#334155" fontSize={21} fontWeight={800}>
              Vung chiếc đuôi dài cực linh hoạt
            </text>
            <text x={237} y={464} textAnchor="middle" fill="#15803D" fontSize={20} fontWeight={900}>
              để lật úp đáp gọn trên cành cây!
            </text>
          </g>

          {/* Card 3: Cute Stick Insect (Bọ que) */}
          <g transform="translate(1250, 210)">
            <rect x={0} y={0} width={475} height={515} rx={28} fill="#EFF6FF" stroke="#0284C7" strokeWidth={4} />
            <text x={237} y={54} textAnchor="middle" fill="#0369A1" fontSize={28} fontWeight={900}>3. Bọ que</text>
            <g transform="translate(237, 250)" stroke={INK} strokeWidth={4} strokeLinecap="round">
              <circle cx={0} cy={0} r={118} fill="#FFFFFF" stroke="#7DD3FC" strokeWidth={3.5} />
              {/* Cute twig-like insect */}
              <line x1={-66} y1={14} x2={68} y2={-10} stroke="#92400E" strokeWidth={12} />
              <circle cx={72} cy={-12} r={11} fill="#B45309" />
              <path d="M -30,8 L -48,46 M 4,2 L -8,44 M 36,-4 L 30,38 M -24,6 L -38,-32 M 12,0 L 8,-38 M 44,-6 L 56,-40" stroke="#78350F" strokeWidth={4.5} />
              <path d="M -88,-52 A 98,98 0 0,1 88,-52" fill="none" stroke="#0284C7" strokeWidth={5.5} />
              <polygon points="96,-44 74,-48 86,-66" fill="#0284C7" stroke="none" />
            </g>
            <text x={237} y={426} textAnchor="middle" fill="#334155" fontSize={21} fontWeight={800}>
              Tự chỉnh cân bằng giữa không trung
            </text>
            <text x={237} y={464} textAnchor="middle" fill="#0284C7" fontSize={20} fontWeight={900}>
              bằng cách điều khiển chân khí động!
            </text>
          </g>
        </g>
      )}

      {activeStep === 1 && (
        <g>
          {/* Left: CuteCat Inspiration */}
          <g transform="translate(200, 212)">
            <rect x={0} y={0} width={520} height={510} rx={28} fill="#FFFBEB" stroke="#D97706" strokeWidth={4} />
            <text x={260} y={56} textAnchor="middle" fill="#92400E" fontSize={26} fontWeight={900}>
              Cảm hứng từ loài mèo
            </text>
            <g transform="translate(260, 276)">
              <circle cx={0} cy={0} r={135} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={3.5} />
              <CuteCat x={0} y={42} scale={1.25} frame={frame} pose="curl_midair" />
            </g>
            <CatContrastBadge x={260} y={454} w={420} h={48} text="Tự xoay không cần điểm tựa" variant="softAmber" fontSize={20} />
          </g>

          {/* Center Arrow */}
          <g transform="translate(808, 466)">
            <polygon points="-58,-22 22,-22 22,-48 68,0 22,48 22,22 -58,22" fill="#0284C7" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
            <text x={0} y={-68} textAnchor="middle" fill="#0369A1" fontSize={22} fontWeight={900}>NASA</text>
          </g>

          {/* Right: Zero-Gravity Astronaut inside Bright Space Station */}
          <g transform="translate(910, 212)">
            <rect x={0} y={0} width={815} height={510} rx={28} fill="#0F172A" stroke="#38BDF8" strokeWidth={5} />
            {/* Twinkling space stars */}
            {[95, 220, 680, 745, 160, 620].map((sx, si) => (
              <circle key={si} cx={sx} cy={65 + (si % 3) * 140} r={4 + (si % 2) * 2} fill="#FEF08A" opacity={0.8} />
            ))}
            <text x={407} y={54} textAnchor="middle" fill="#7DD3FC" fontSize={25} fontWeight={900}>
              Môi trường không trọng lực ngoài vũ trụ
            </text>

            {/* Cute floating rotating astronaut */}
            <g transform={`translate(407, ${(255 + floatAstro).toFixed(1)}) rotate(${rotAstro.toFixed(1)})`} stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
              {/* Rotation orbit ring */}
              <ellipse cx={0} cy={0} rx={155} ry={70} fill="none" stroke="#38BDF8" strokeWidth={4} strokeDasharray="10 8" opacity={0.75} />
              {/* Backpack */}
              <rect x={-48} y={-32} width={96} height={82} rx={16} fill="#CBD5E1" />
              {/* Suit torso */}
              <rect x={-38} y={-24} width={76} height={86} rx={20} fill="#FFFFFF" />
              <rect x={-18} y={-6} width={36} height={24} rx={6} fill="#38BDF8" />
              {/* Arms & Legs */}
              <path d="M -38,-8 L -84,-34 M 38,-8 L 84,-34" stroke="#FFFFFF" strokeWidth={20} />
              <path d="M -38,-8 L -84,-34 M 38,-8 L 84,-34" stroke={INK} strokeWidth={4} />
              <path d="M -20,62 L -40,108 M 20,62 L 42,108" stroke="#FFFFFF" strokeWidth={22} />
              <path d="M -20,62 L -40,108 M 20,62 L 42,108" stroke={INK} strokeWidth={4} />
              {/* Astronaut helmet */}
              <circle cx={0} cy={-64} r={42} fill="#FFFFFF" />
              <ellipse cx={0} cy={-62} rx={28} ry={22} fill="#0284C7" />
              <path d="M -16,-70 Q -4,-78 10,-70" fill="none" stroke="#E0F2FE" strokeWidth={4} />
            </g>

            <CatContrastBadge
              x={407}
              y={452}
              w={690}
              h={54}
              text="🚀 Ứng dụng vào phi hành gia & robot không gian!"
              variant="solidBlue"
              fontSize={22}
            />
          </g>
        </g>
      )}

      {activeStep === 2 && (
        <g>
          {/* Step 2: Bright Forest-Green Safety Card — Balcony Window with Protective Steel Net */}
          <g transform="translate(195, 204)">
            <rect x={0} y={0} width={1530} height={534} rx={28} fill="#ECFDF5" stroke="#15803D" strokeWidth={5} />

            {/* Left: Clean Balcony Window with Steel Safety Net + Happy Sunbathing Cat */}
            <g transform="translate(80, 48)">
              <rect x={0} y={0} width={600} height={438} rx={24} fill="#BAE6FD" stroke="#15803D" strokeWidth={5} />
              {/* Sunny clouds outside */}
              <circle cx={495} cy={82} r={44} fill="#FEF08A" />
              <g fill="#FFFFFF" opacity={0.9}>
                <ellipse cx={165} cy={95} rx={68} ry={22} />
                <circle cx={145} cy={80} r={24} />
                <circle cx={182} cy={82} r={20} />
              </g>
              {/* Protective steel mesh grid across window */}
              <g stroke="#334155" strokeWidth={3} opacity={0.55}>
                {Array.from({ length: 11 }, (_, i) => (
                  <line key={`nv_${i}`} x1={48 + i * 50} y1={0} x2={48 + i * 50} y2={350} />
                ))}
                {[60, 120, 180, 240, 300].map((hy) => (
                  <line key={`nh_${hy}`} x1={0} y1={hy} x2={600} y2={hy} />
                ))}
              </g>
              {/* Windowsill */}
              <rect x={0} y={350} width={600} height={88} rx={10} fill="#FEF3C7" stroke={INK} strokeWidth={4} />
              {/* Happy CuteCat safely enjoying sun inside the balcony net */}
              <CuteCat x={300} y={356} scale={1.08} frame={frame} pose="sit" />
            </g>

            {/* Right: 2 Clear Safety Commitments */}
            <g transform="translate(740, 62)">
              <text x={365} y={40} textAnchor="middle" fill="#14532D" fontSize={30} fontWeight={900}>
                Yêu thú cưng là giữ an toàn!
              </text>

              <rect x={0} y={76} width={730} height={116} rx={22} fill="#FFFFFF" stroke="#16A34A" strokeWidth={3.5} />
              <CatCheckCircle cx={56} cy={134} r={24} bg="#16A34A" />
              <text x={106} y={124} fill="#14532D" fontSize={24} fontWeight={900}>
                1. Lắp lưới chắn ban công &amp; cửa sổ tầng cao
              </text>
              <text x={106} y={162} fill="#334155" fontSize={20} fontWeight={700}>
                Giúp mèo thoải mái ngắm cảnh, tắm nắng an toàn 100%
              </text>

              <rect x={0} y={214} width={730} height={116} rx={22} fill="#FEF2F2" stroke="#DC2626" strokeWidth={3.5} />
              <circle cx={56} cy={272} r={24} fill="#DC2626" />
              <text x={56} y={282} textAnchor="middle" fill="#FFFFFF" fontSize={26} fontWeight={900}>✕</text>
              <text x={106} y={262} fill="#991B1B" fontSize={24} fontWeight={900}>
                2. Tuyệt đối không tự thả ngược mèo để thử
              </text>
              <text x={106} y={300} fill="#334155" fontSize={20} fontWeight={700}>
                Gây hoảng sợ và chấn thương nếu rơi quá thấp hoặc va cạnh bàn
              </text>

              <CatContrastBadge
                x={365}
                y={386}
                w={690}
                h={56}
                text="✓  Lắp lưới ban công  •  Không tự thả thử mèo!"
                variant="solidGreen"
                fontSize={23}
              />
            </g>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_15: CAT_QUICK_QUIZ (Beats 49–51, steps 0, 1, 2)
 *   - Forest Nature-Field-Board Quiz Style cleanly inside y=152..786
 *   - Step 0: Quiz intro + question
 *   - Step 1: 3 crisp options (A, B, C)
 *   - Step 2: Option B glows vibrant green with checkmark, A & C dim gently
 * ========================================================================== */
export const CatQuickQuizVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = Math.min(2, step ?? visualStep ?? 0);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.22);

  const options = [
    { key: 'A', label: 'Cái đuôi dài quay tròn như cánh quạt trực thăng', correct: false },
    { key: 'B', label: 'Cột sống siêu dẻo kết hợp kỹ thuật thu – duỗi 4 chân', correct: true },
    { key: 'C', label: 'Bộ ria mép dài hai bên má giữ thăng bằng', correct: false },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="FOREST" gradId="cat15_bg" cardBorder="#15803D" cardFill="#FFFBEB" />
      <CatCleanLabel
        x={960}
        y={84}
        text="ĐỐ VUI NHANH • SỔ TAY THIÊN NHIÊN"
        bg="#15803D"
        color="#FFFFFF"
        border="#14532D"
        fontSize={29}
      />

      {/* Question Banner inside card (y=190..330) */}
      <g transform="translate(200, 192)">
        <rect x={0} y={0} width={1520} height={136} rx={26} fill="#ECFDF5" stroke="#15803D" strokeWidth={4} />
        <text x={760} y={54} textAnchor="middle" fill="#14532D" fontSize={27} fontWeight={900}>
          Câu hỏi kiểm tra trí nhớ:
        </text>
        <text x={760} y={102} textAnchor="middle" fill="#0F172A" fontSize={26} fontWeight={800}>
          Bộ phận nào đóng vai trò QUAN TRỌNG NHẤT giúp mèo tự lật 180° giữa không trung?
        </text>
      </g>

      {activeStep === 0 ? (
        <g transform="translate(960, 545)">
          <circle cx={0} cy={-26} r={145} fill="#FEF3C7" stroke="#D97706" strokeWidth={4} />
          <CuteCat x={0} y={64} scale={1.32} frame={frame} pose="sit" />
          <g transform="translate(155, -108)">
            <circle cx={0} cy={0} r={42} fill="#15803D" stroke={INK} strokeWidth={4} />
            <text x={0} y={15} textAnchor="middle" fill="#FFFFFF" fontSize={46} fontWeight={900}>?</text>
          </g>
          <text x={0} y={168} textAnchor="middle" fill="#14532D" fontSize={26} fontWeight={900}>
            Bạn có 3 giây để chọn đáp án chính xác nhất nhé!
          </text>
        </g>
      ) : (
        <g transform="translate(240, 366)">
          {options.map((opt, idx) => {
            const oy = idx * 124;
            const isReveal = activeStep === 2;
            const isWinner = isReveal && opt.correct;
            const isLoser = isReveal && !opt.correct;
            return (
              <g
                key={opt.key}
                transform={`translate(0, ${oy}) scale(${isWinner ? (1 + pulse * 0.015).toFixed(3) : '1'})`}
                opacity={isLoser ? 0.42 : 1}
              >
                <rect
                  x={0}
                  y={0}
                  width={1440}
                  height={98}
                  rx={24}
                  fill={isWinner ? '#DCFCE7' : '#FFFFFF'}
                  stroke={isWinner ? '#15803D' : '#CBD5E1'}
                  strokeWidth={isWinner ? 5.5 : 3.5}
                />
                <circle
                  cx={66}
                  cy={49}
                  r={32}
                  fill={isWinner ? '#15803D' : '#F59E0B'}
                  stroke={INK}
                  strokeWidth={3}
                />
                <text x={66} y={60} textAnchor="middle" fill="#FFFFFF" fontSize={30} fontWeight={900}>
                  {opt.key}
                </text>
                <text
                  x={128}
                  y={58}
                  fill={isWinner ? '#14532D' : '#0F172A'}
                  fontSize={26}
                  fontWeight={isWinner ? 900 : 800}
                >
                  {opt.label}
                </text>
                {isWinner && (
                  <g transform="translate(1280, 49)">
                    <rect x={-125} y={-26} width={250} height={52} rx={26} fill="#15803D" />
                    <CatCheckCircle cx={-90} cy={0} r={16} bg="#22C55E" />
                    <text x={20} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={21} fontWeight={900}>
                      CHÍNH XÁC!
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_16: CAT_SUMMARY_3_CARDS (Beats 55–57, steps 0, 1, 2)
 *   - Exact 1-by-1 synced reveal:
 *     Step 0 (Beat 55 "Thứ nhất"): Card 1 bright
 *     Step 1 (Beat 56 "Thứ hai"):  Card 1 + Card 2 bright
 *     Step 2 (Beat 57 "Thứ ba"):   All 3 cards bright
 * ========================================================================== */
export const CatSummary3CardsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = Math.min(2, step ?? visualStep ?? 0);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.18);

  const cards = [
    {
      x: 175,
      num: '1',
      title: 'La bàn tai trong',
      badge: 'Xác định trên–dưới tức thì',
      line1: 'Hệ tiền đình trong tai trong',
      line2: 'báo chiều rơi sau vài mili giây!',
      color: '#15803D',
      bg: '#ECFDF5',
    },
    {
      x: 715,
      num: '2',
      title: 'Xoay 2 nửa thân',
      badge: 'Bảo toàn mô men = 0',
      line1: 'Cột sống siêu dẻo + thu duỗi chân',
      line2: 'tự lật 180° dù thả sát đệm 30 cm!',
      color: '#D97706',
      bg: '#FFFBEB',
    },
    {
      x: 1255,
      num: '3',
      title: 'Lò xo & An toàn',
      badge: 'Mèo không hề bất tử!',
      line1: '4 chân lò xo & dù lượn giảm sốc,',
      line2: 'nhưng hãy lắp lưới ban công bảo vệ!',
      color: '#0284C7',
      bg: '#EFF6FF',
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CatStageCardBackdrop tone="FOREST" gradId="cat16_bg" cardBorder="#15803D" />
      <CatCleanLabel
        x={960}
        y={84}
        text="TÓM TẮT 3 ĐIỀU CẦN NHỚ"
        bg="#15803D"
        color="#FFFFFF"
        border="#14532D"
        fontSize={31}
      />

      {cards.map((c, idx) => {
        const revealed = idx <= activeStep;
        const isCurrent = idx === activeStep;
        return (
          <g
            key={c.num}
            transform={`translate(${c.x}, 205) scale(${isCurrent ? (1 + pulse * 0.012).toFixed(3) : '1'})`}
            opacity={revealed ? 1 : 0.24}
          >
            <rect
              x={0}
              y={0}
              width={490}
              height={535}
              rx={30}
              fill={revealed ? c.bg : '#F8FAFC'}
              stroke={revealed ? c.color : '#CBD5E1'}
              strokeWidth={isCurrent ? 6 : 4}
            />

            {/* Top number circle */}
            <circle cx={245} cy={72} r={42} fill={revealed ? c.color : '#94A3B8'} stroke={INK} strokeWidth={3.5} />
            <text x={245} y={86} textAnchor="middle" fill="#FFFFFF" fontSize={38} fontWeight={900}>
              {c.num}
            </text>

            {/* Title */}
            <text x={245} y={158} textAnchor="middle" fill={revealed ? c.color : '#64748B'} fontSize={29} fontWeight={900}>
              {c.title}
            </text>

            {/* Clean Icon Illustration */}
            <g transform="translate(245, 272)">
              <circle cx={0} cy={0} r={76} fill="#FFFFFF" stroke={revealed ? c.color : '#CBD5E1'} strokeWidth={3.8} />
              {idx === 0 && (
                <g>
                  <circle cx={0} cy={0} r={48} fill="#DCFCE7" stroke={INK} strokeWidth={3.2} />
                  <polygon points="0,-28 -11,0 11,0" fill="#94A3B8" stroke={INK} strokeWidth={2.2} />
                  <polygon points="0,34 -11,0 11,0" fill="#EA580C" stroke={INK} strokeWidth={2.2} />
                  <circle cx={0} cy={0} r={6} fill="#FACC15" stroke={INK} strokeWidth={2} />
                </g>
              )}
              {idx === 1 && (
                <g>
                  <CuteCat x={0} y={42} scale={0.68} frame={frame} pose="curl_midair" />
                </g>
              )}
              {idx === 2 && (
                <g>
                  {/* Shield + Paw + Green Check */}
                  <path d="M 0,-46 L 40,-30 L 36,14 C 34,36 16,48 0,54 C -16,48 -34,36 -36,14 L -40,-30 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth={4} strokeLinejoin="round" />
                  <CatCheckCircle cx={0} cy={2} r={22} bg="#16A34A" />
                </g>
              )}
            </g>

            {/* Crisp badge pill */}
            <rect x={40} y={376} width={410} height={44} rx={22} fill={revealed ? c.color : '#94A3B8'} />
            <text x={245} y={405} textAnchor="middle" fill="#FFFFFF" fontSize={20} fontWeight={900}>
              {c.badge}
            </text>

            {/* 2 clean summary lines */}
            <text x={245} y={462} textAnchor="middle" fill="#0F172A" fontSize={20} fontWeight={800}>
              {c.line1}
            </text>
            <text x={245} y={498} textAnchor="middle" fill="#334155" fontSize={20} fontWeight={800}>
              {c.line2}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
