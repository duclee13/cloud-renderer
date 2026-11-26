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
  buildSawtoothWavePath,
} from './caobangSharedAssets';

/* ============================================================================
 * SVG_01: CAOBANG_TOP_WORST_SOUNDS (Beats 7–8, steps 0, 1)
 *   - Step 0: 4 iconic hated sounds cards (Móng tay cào bảng, Dao cọ chai, Nĩa cào đĩa, Xốp cọ nhau)
 *   - Step 1: 3 glowing physiological reaction cards underneath (Rùng mình, Nổi da gà, Ê buốt chân răng)
 * ========================================================================== */
export const CaobangTopWorstSoundsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.22);

  const sounds = [
    { x: 225, title: 'Móng tay', sub: 'cào bảng đen', color: '#DC2626', bg: '#FEF2F2', icon: 'NAIL' },
    { x: 595, title: 'Dao cọ', sub: 'chai thủy tinh', color: '#EA580C', bg: '#FFF7ED', icon: 'BOTTLE' },
    { x: 965, title: 'Nĩa cào', sub: 'mặt đĩa sứ', color: '#D97706', bg: '#FFFBEB', icon: 'FORK' },
    { x: 1335, title: 'Xốp trắng', sub: 'cọ vào nhau', color: '#7C3AED', bg: '#F5F3FF', icon: 'FOAM' },
  ];

  const reactions = [
    { x: 265, title: 'Rùng mình', sub: 'Lạnh dọc sống lưng', color: '#DC2626', bg: '#FEE2E2', icon: 'SHIVER' },
    { x: 750, title: 'Nổi da gà', sub: 'Da nổi hạt khắp tay', color: '#EA580C', bg: '#FFEDD5', icon: 'GOOSE' },
    { x: 1235, title: 'Ê buốt răng', sub: 'Tim đập nhanh nhẹ', color: '#B45309', bg: '#FEF3C7', icon: 'TOOTH' },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="CORAL" gradId="cb01_bg" cardBorder="#EA580C" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Hội những âm thanh bị ghét nhất lịch sử loài người'
            : 'Phản ứng sinh lý tức thì khi âm thanh lọt vào tai!'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={29}
      />

      {/* Top row: 4 iconic sound cards (y=205..535) */}
      {sounds.map((s, idx) => (
        <g key={idx} transform={`translate(${s.x}, 205)`}>
          <rect x="0" y="0" width="340" height="325" rx="24" fill={s.bg} stroke={s.color} strokeWidth="4" />
          <rect x="26" y="22" width="288" height="176" rx="18" fill="#FFFFFF" stroke={s.color} strokeWidth="2.6" />

          {s.icon === 'NAIL' && (
            <g transform="translate(170, 110)">
              <rect x="-102" y="-62" width="204" height="124" rx="10" fill="#14532D" stroke="#92400E" strokeWidth="6" />
              <path d="M -32,-38 L -22,36 M 0,-42 L 10,32 M 32,-38 L 42,36" stroke="#FEF08A" strokeWidth="4" strokeDasharray="8 5" strokeLinecap="round" />
              {/* Jagged red screech waves */}
              <path d="M -82,-12 L -64,-22 L -56,2 L -74,16" fill="none" stroke="#EF4444" strokeWidth="4.2" strokeLinecap="round" />
              <path d="M 62,-16 L 80,-26 L 74,4 L 88,18" fill="none" stroke="#EF4444" strokeWidth="4.2" strokeLinecap="round" />
            </g>
          )}

          {s.icon === 'BOTTLE' && (
            <g transform="translate(170, 110)">
              {/* Glass bottle */}
              <path d="M -18,-62 L 18,-62 L 18,-34 L 38,-8 L 38,62 L -38,62 L -38,-8 L -18,-34 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="3.8" strokeLinejoin="round" />
              {/* Knife blade scraping side */}
              <path d="M 22,-8 L 96,-42 L 102,-28 L 26,6 Z" fill="#CBD5E1" stroke={INK} strokeWidth="3" />
              <path d="M 10,-28 L 28,-42 L 22,-18" fill="none" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {s.icon === 'FORK' && (
            <g transform="translate(170, 110)">
              {/* Porcelain plate */}
              <ellipse cx="0" cy="24" rx="92" ry="30" fill="#F8FAFC" stroke="#64748B" strokeWidth="4" />
              <ellipse cx="0" cy="24" rx="60" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.4" />
              {/* Angled metal fork scraping plate */}
              <g transform="translate(14, -18) rotate(-26)">
                <rect x="-5" y="-44" width="10" height="44" rx="4" fill="#94A3B8" stroke={INK} strokeWidth="2.8" />
                <path d="M -8,0 L -8,20 M 0,0 L 0,22 M 8,0 L 8,20" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              </g>
              <path d="M -46,-16 L -32,-28 L -26,-8 M 44,-16 L 58,-28 L 52,-8" fill="none" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {s.icon === 'FOAM' && (
            <g transform="translate(170, 110)">
              {/* Two white styrofoam blocks rubbing */}
              <rect x="-92" y="-34" width="84" height="72" rx="10" fill="#F8FAFC" stroke="#7C3AED" strokeWidth="3.5" />
              <rect x="8" y="-26" width="84" height="72" rx="10" fill="#F1F5F9" stroke="#7C3AED" strokeWidth="3.5" />
              {[-68, -40, 34, 64].map((dx, di) => (
                <circle key={di} cx={dx} cy={di % 2 === 0 ? -4 : 16} r="5.5" fill="#CBD5E1" />
              ))}
              {/* Friction sparks between blocks */}
              <path d="M -2,-52 L 6,-34 L -4,-16 M -2,44 L 8,58" fill="none" stroke="#EA580C" strokeWidth="4.2" strokeLinecap="round" />
            </g>
          )}

          <text x="170" y="246" textAnchor="middle" fill={s.color} stroke="none" fontSize="26" fontWeight="900">
            {s.title}
          </text>
          <text x="170" y="284" textAnchor="middle" fill="#334155" stroke="none" fontSize="22" fontWeight="800">
            {s.sub}
          </text>
        </g>
      ))}

      {/* Bottom area: Step 0 subtle prompt vs Step 1 3 glowing reaction cards */}
      {activeStep === 0 ? (
        <g transform="translate(960, 648)">
          <rect x="-560" y="-44" width="1120" height="88" rx="24" fill="#FFF7ED" stroke="#EA580C" strokeWidth="3.6" />
          <text x="0" y="10" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="26" fontWeight="900">
            Cả 4 âm thanh quen thuộc này đều kích hoạt cùng một phản xạ trong não!
          </text>
        </g>
      ) : (
        <g>
          {reactions.map((r, ri) => (
            <g key={ri} transform={`translate(${r.x}, 574)`}>
              <rect
                x="0"
                y="0"
                width="420"
                height="148"
                rx="24"
                fill={r.bg}
                stroke={r.color}
                strokeWidth={4 + pulse * 1.2}
              />
              {/* Clean circular icon strictly on left (cx=68) -> text starts x=136 (zero overlap!) */}
              <circle cx="68" cy="74" r="42" fill="#FFFFFF" stroke={r.color} strokeWidth="3.4" />
              {r.icon === 'SHIVER' && (
                <g transform="translate(68, 74)">
                  <path d="M -18,-18 L -8,-6 L -18,6 L -8,18" fill="none" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 8,-18 L 18,-6 L 8,6 L 18,18" fill="none" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}
              {r.icon === 'GOOSE' && (
                <g transform="translate(68, 74)">
                  <path d="M -24,14 Q -14,-2 -4,14 Q 6,-2 16,14 L 24,14" fill="none" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
                  <line x1="-14" y1="6" x2="-14" y2="-16" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="6" y2="-16" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
                </g>
              )}
              {r.icon === 'TOOTH' && (
                <g transform="translate(68, 74)">
                  <path d="M -16,-14 C -16,-24 16,-24 16,-14 L 12,16 L 4,6 L -4,6 L -12,16 Z" fill="#FEF3C7" stroke="#B45309" strokeWidth="3.4" strokeLinejoin="round" />
                  <path d="M -26,-16 L -18,-10 M 26,-16 L 18,-10" stroke="#EF4444" strokeWidth="3.4" strokeLinecap="round" />
                </g>
              )}
              <text x="132" y="66" textAnchor="start" fill={r.color} stroke="none" fontSize="27" fontWeight="900">
                {r.title}
              </text>
              <text x="132" y="106" textAnchor="start" fill="#334155" stroke="none" fontSize="20" fontWeight="800">
                {r.sub}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_02: CAOBANG_STICK_SLIP (Beats 10–11, steps 0, 1)
 *   - Step 0: Microscopic rough surface of chalkboard/plate + fingernail tip touching ridges
 *   - Step 1: Animated Stick -> Slip -> Stick -> Slip arrows firing jagged red-orange waves
 * ========================================================================== */
export const CaobangStickSlipVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const slipCycle = (frame % 48) / 48;
  // Jerky stick-slip horizontal jump in step 1
  const nailSlideX = activeStep === 1 ? Math.floor(slipCycle * 4) * 58 + (slipCycle * 4 % 1 > 0.72 ? 42 : 0) : 0;
  const wavePath = buildSawtoothWavePath(1120, 1650, 445, 76, 8, frame * 0.3, 0.25);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="SKY" gradId="cb02_bg" cardBorder="#0284C7" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Phóng đại hàng nghìn lần: Bề mặt bảng & đĩa sứ thực ra rất gồ ghề!'
            : 'Ma sát dính–trượt (Stick–Slip): Bám chặt rồi bật trượt hàng nghìn lần/giây'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={28}
      />

      {/* Left/Center Microscope Circular Viewport (cx=620, cy=445, r=230) */}
      <g transform="translate(620, 445)">
        <circle cx="0" cy="0" r="232" fill="#E0F2FE" stroke="#0284C7" strokeWidth="10" />
        <circle cx="0" cy="0" r="218" fill="#F8FAFC" stroke="#0369A1" strokeWidth="3.5" />

        {/* Microscopic jagged chalkboard ridges along lower half of scope */}
        <path
          d="M -204,68 L -178,36 L -150,72 L -120,30 L -90,68 L -58,34 L -26,70 L 4,30 L 36,68 L 68,32 L 100,70 L 132,34 L 164,68 L 196,38 L 208,68 L 190,126 C 110,200 -110,200 -190,126 Z"
          fill="#14532D"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Magnified Fingernail / Blade Tip sliding across rough ridges */}
        <g transform={`translate(${(-108 + nailSlideX * 0.65).toFixed(1)}, -22)`}>
          <path
            d="M -52,-112 L 14,-112 L 42,46 C 44,64 16,68 4,52 L -52,-112 Z"
            fill="#FDE68A"
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Fingernail plate */}
          <path d="M 4,-16 L 26,-16 L 38,44 C 38,56 18,58 10,46 Z" fill="#FFF1F2" stroke="#FB7185" strokeWidth="3" />
          {/* Impact spark at contact point in Step 1 */}
          {activeStep === 1 && (
            <g transform="translate(26, 56)">
              <circle cx="0" cy="0" r="14" fill="#F97316" opacity="0.88" />
              <path d="M -22,-10 L -10,-4 M 22,-10 L 10,-4 M 0,-26 L 0,-12" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}
        </g>

        {/* Microscope magnification badge at top of lens */}
        <rect x="-92" y="-204" width="184" height="40" rx="16" fill="#0284C7" />
        <text x="0" y="-177" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="19" fontWeight="900">
          PHÓNG ĐẠI 1000×
        </text>
      </g>

      {/* Right Panel: Step 0 explanation vs Step 1 Stick-Slip chain + jagged acoustic wave */}
      {activeStep === 0 ? (
        <g transform="translate(960, 255)">
          <rect x="0" y="0" width="710" height="380" rx="26" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
          <text x="355" y="64" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="29" fontWeight="900">
            Mắt thường thấy phẳng lì...
          </text>
          <text x="355" y="114" textAnchor="middle" fill="#334155" stroke="none" fontSize="24" fontWeight="800">
            Nhưng dưới kính hiển vi, mặt bảng đen
          </text>
          <text x="355" y="152" textAnchor="middle" fill="#334155" stroke="none" fontSize="24" fontWeight="800">
            và đĩa sứ đầy những đỉnh nhám li ti!
          </text>
          <rect x="75" y="206" width="560" height="122" rx="20" fill="#F0F9FF" stroke="#38BDF8" strokeWidth="3" />
          <text x="355" y="256" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="25" fontWeight="900">
            Đầu móng tay / lưỡi dao vướng vào từng đỉnh nhám
          </text>
          <text x="355" y="298" textAnchor="middle" fill="#475569" stroke="none" fontSize="22" fontWeight="700">
            → Không thể lướt đi êm ái liên tục!
          </text>
        </g>
      ) : (
        <g>
          {/* Stick -> Slip -> Stick -> Slip pill sequence above wave */}
          <g transform="translate(950, 218)">
            {[
              { x: 0, label: 'BÁM', bg: '#FEE2E2', border: '#DC2626', color: '#991B1B' },
              { x: 185, label: 'TRƯỢT', bg: '#FFEDD5', border: '#EA580C', color: '#9A3412' },
              { x: 370, label: 'BÁM', bg: '#FEE2E2', border: '#DC2626', color: '#991B1B' },
              { x: 555, label: 'TRƯỢT', bg: '#FFEDD5', border: '#EA580C', color: '#9A3412' },
            ].map((item, ii) => (
              <g key={ii}>
                <rect x={item.x} y="0" width="144" height="58" rx="16" fill={item.bg} stroke={item.border} strokeWidth="3.5" />
                <text x={item.x + 72} y="37" textAnchor="middle" fill={item.color} stroke="none" fontSize="23" fontWeight="900">
                  {item.label}
                </text>
                {ii < 3 && (
                  <path d={`M ${item.x + 150} 29 L ${item.x + 178} 29`} stroke="#DC2626" strokeWidth="4.5" strokeLinecap="round" />
                )}
              </g>
            ))}
          </g>

          {/* Wave emission box */}
          <rect x="950" y="316" width="730" height="260" rx="24" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4" />
          <text x="1315" y="358" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="23" fontWeight="900">
            Phát ra hàng loạt xung sóng âm răng cưa sắc nhọn!
          </text>
          <path d={wavePath} fill="none" stroke="#DC2626" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />

          <CaobangContrastBadge
            x={1315}
            y={634}
            w={620}
            h={54}
            text="Rung bật liên hồi → Tạo tiếng rít chói tai!"
            variant="solidRed"
            fontSize={22}
          />
        </g>
      )}

      {/* Clean bottom caption safely inside white card y <= 760 */}
      <text x="960" y="734" textAnchor="middle" fill="#0F172A" stroke="none" fontSize="23" fontWeight="800">
        {activeStep === 0
          ? 'Móng tay, phấn cứng hay dao kim loại đều trượt trên bề mặt siêu nhám'
          : 'Hàng nghìn nhịp dính–trượt mỗi giây chính là nguồn phát tiếng cào bảng rợn người'}
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_03: CAOBANG_FREQ_BAND (Beats 12–13, steps 0, 1)
 *   - Step 0: Human hearing scale 20 Hz -> 20.000 Hz, pointer & ? at ultra-high end
 *   - Step 1: Ultra-high crossed out; mid-high 2.000–4.000 Hz highlighted with HIGH-CONTRAST red badge "VÙNG NGUY HIỂM!"
 * ========================================================================== */
export const CaobangFreqBandVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.22);
  const RULER_Y = 470;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="ROSE" gradId="cb03_bg" cardBorder="#DC2626" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Hiểu nhầm phổ biến: Tiếng cào bảng chói là vì tần số cao tít?'
            : 'Kết quả lọc tần số: Thủ phạm nằm gọn ở dải 2.000 – 4.000 Hz!'
        }
        bg="#FFFFFF"
        color="#991B1B"
        border="#DC2626"
        fontSize={29}
      />

      {/* Spectrum Bar (x=240..1680, y=420..520) */}
      <rect x="240" y="420" width="1440" height="100" rx="22" fill="#F1F5F9" stroke="#475569" strokeWidth="4" />

      {/* Low Bass Band: 20 - 500 Hz */}
      <rect x="244" y="424" width="330" height="92" rx="18" fill="#E0F2FE" />
      <text x="409" y="478" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="22" fontWeight="800">
        Âm trầm (20–500 Hz)
      </text>

      {/* Mid Band: 500 - 2.000 Hz */}
      <rect x="578" y="424" width="260" height="92" fill="#ECFDF5" />
      <text x="708" y="478" textAnchor="middle" fill="#065F46" stroke="none" fontSize="22" fontWeight="800">
        Trung (500–2k)
      </text>

      {/* TARGET CULPRIT BAND: 2.000 - 4.000 Hz (x=842..1202) */}
      <rect
        x="842"
        y={activeStep === 1 ? 404 : 424}
        width="360"
        height={activeStep === 1 ? 132 : 92}
        rx="16"
        fill={activeStep === 1 ? '#FEE2E2' : '#FEF3C7'}
        stroke={activeStep === 1 ? '#DC2626' : '#D97706'}
        strokeWidth={activeStep === 1 ? 6 + pulse * 1.5 : 3}
      />
      <text
        x="1022"
        y={activeStep === 1 ? 478 : 478}
        textAnchor="middle"
        fill={activeStep === 1 ? '#991B1B' : '#92400E'}
        stroke="none"
        fontSize={activeStep === 1 ? 30 : 24}
        fontWeight="900"
      >
        2.000 – 4.000 Hz
      </text>

      {/* Ultra-High Band: 8.000 - 20.000 Hz (x=1206..1676) */}
      <rect
        x="1206"
        y="424"
        width="470"
        height="92"
        rx="18"
        fill={activeStep === 0 ? '#FEF3C7' : '#E2E8F0'}
        stroke={activeStep === 0 ? '#EA580C' : '#94A3B8'}
        strokeWidth={activeStep === 0 ? 4.5 : 2.5}
      />
      <text x="1441" y="478" textAnchor="middle" fill={activeStep === 0 ? '#9A3412' : '#64748B'} stroke="none" fontSize="23" fontWeight="800">
        Tần số siêu cao (8k – 20.000 Hz)
      </text>

      {/* Scale Tick Marks & Axis Labels below spectrum bar (y=558, well above y=724 caption!) */}
      {[
        { x: 244, label: '20 Hz' },
        { x: 576, label: '500 Hz' },
        { x: 842, label: '2.000 Hz' },
        { x: 1202, label: '4.000 Hz' },
        { x: 1676, label: '20.000 Hz' },
      ].map((t, ti) => (
        <g key={ti}>
          <line x1={t.x} y1={RULER_Y + 62} x2={t.x} y2={RULER_Y + 80} stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          <text x={t.x} y={RULER_Y + 112} textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="800">
            {t.label}
          </text>
        </g>
      ))}

      {/* Step 0: Question pointer above Ultra-High Band */}
      {activeStep === 0 ? (
        <g transform="translate(1441, 290)">
          <rect x="-185" y="-56" width="370" height="92" rx="22" fill="#FFFBEB" stroke="#D97706" strokeWidth="4" />
          <circle cx="-132" cy="-10" r="28" fill="#D97706" />
          <text x="-132" y="1" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="32" fontWeight="900">
            ?
          </text>
          <text x="26" y="-14" textAnchor="middle" fill="#92400E" stroke="none" fontSize="22" fontWeight="900">
            Mọi người hay đoán
          </text>
          <text x="26" y="18" textAnchor="middle" fill="#475569" stroke="none" fontSize="20" fontWeight="700">
            nốt cao chót vót nhất?
          </text>
          <path d="M 0,44 L 0,104" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
          <polygon points="0,118 -14,94 14,94" fill="#D97706" />
        </g>
      ) : (
        <>
          {/* Step 1: HIGH-CONTRAST solid red #DC2626 + white #FFFFFF badge above 2.000–4.000 Hz */}
          <g transform="translate(1022, 286)">
            <CaobangContrastBadge
              x={0}
              y={-12}
              w={350}
              h={64}
              text="VÙNG NGUY HIỂM!"
              variant="solidRed"
              fontSize={27}
            />
            <path d="M 0,28 L 0,94" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
            <polygon points="0,108 -16,84 16,84" fill="#DC2626" />
          </g>

          {/* Ultra-high band cleanly crossed out with clear contrast badge */}
          <g transform="translate(1441, 470)">
            <line x1="-190" y1="-34" x2="190" y2="34" stroke="#DC2626" strokeWidth="6.5" strokeLinecap="round" opacity="0.85" />
            <line x1="190" y1="-34" x2="-190" y2="34" stroke="#DC2626" strokeWidth="6.5" strokeLinecap="round" opacity="0.85" />
          </g>
          <CaobangContrastBadge
            x={1441}
            y={322}
            w={330}
            h={52}
            text="✕ Lọc bỏ vẫn khó chịu!"
            variant="softRed"
            fontSize={20}
          />
        </>
      )}

      {/* Bottom caption cleanly separated (>= 120px below ticks!) */}
      <text x="960" y="724" textAnchor="middle" fill="#7F1D1D" stroke="none" fontSize="24" fontWeight="900">
        {activeStep === 0
          ? 'Tai người nghe được từ 20 Hz (rất trầm) đến 20.000 Hz (siêu cao)'
          : 'Lọc bỏ dải 2.000 – 4.000 Hz đi, tiếng cào bảng bỗng bớt ghê tai đi rõ rệt!'}
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_04: CAOBANG_EAR_CANAL_AMP (Beats 15–16, steps 0, 1)
 *   - Step 0: Outer ear anatomy (y=180..740): Vành tai, Ống tai dài ~2,5 cm, Màng nhĩ
 *   - Step 1: 2.000–4.000 Hz wave doubles in amplitude inside ear canal like a megaphone
 * ========================================================================== */
export const CaobangEarCanalAmpVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.24);

  // Build wave that grows in amplitude as it travels from x=590 to x=1225
  const wavePts: string[] = [];
  const steps = 44;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = 570 + t * 640;
    const amp = activeStep === 1 ? 18 + t * 52 : 16;
    const y = 445 + Math.sin(t * Math.PI * 10 - frame * 0.35) * amp;
    wavePts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="CREAM" gradId="cb04_bg" cardBorder="#D97706" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Giải phẫu tai ngoài: Ống tai người là một đường ống dài ~2,5 cm'
            : 'Hiệu ứng cộng hưởng: Ống tai hoạt động như chiếc loa phóng đại tự nhiên!'
        }
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={28}
      />

      {/* Outer Ear Pinna (left side) */}
      <g transform="translate(470, 445)">
        <path
          d="M 10,-190 C -140,-195 -195,-45 -165,85 C -145,175 -55,215 10,165 C 45,138 38,80 12,56 C -25,22 -28,-62 12,-96 C 42,-122 50,-188 10,-190 Z"
          fill="#FDE68A"
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M -25,-128 C -98,-128 -126,-28 -102,60 C -88,112 -40,136 -8,108"
          fill="none"
          stroke="#B45309"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Ear Canal Corridor (x=545..1240, y=355..535) */}
      <path
        d="M 545,375 C 740,360 1010,348 1245,355 L 1245,535 C 1010,542 740,530 545,515 Z"
        fill={activeStep === 1 ? '#FFEDD5' : '#FEF3C7'}
        stroke={INK}
        strokeWidth="5"
      />
      {/* Canal lining walls */}
      <path d="M 545,375 C 740,360 1010,348 1245,355" fill="none" stroke="#EA580C" strokeWidth="9" strokeLinecap="round" opacity="0.45" />
      <path d="M 545,515 C 740,530 1010,542 1245,535" fill="none" stroke="#EA580C" strokeWidth="9" strokeLinecap="round" opacity="0.45" />

      {/* Eardrum (Màng nhĩ) at x=1255 */}
      <ellipse
        cx="1255"
        cy="445"
        rx={24 + (activeStep === 1 ? pulse * 5 : 0)}
        ry="92"
        fill={activeStep === 1 ? '#EF4444' : '#FCA5A5'}
        stroke={INK}
        strokeWidth="5"
      />

      {/* Acoustic wave traveling through canal */}
      <path
        d={wavePts.join(' ')}
        fill="none"
        stroke={activeStep === 1 ? '#DC2626' : '#0284C7'}
        strokeWidth={activeStep === 1 ? 7 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Clean measurement bracket above ear canal (~2,5 cm) */}
      <g transform="translate(0, 292)">
        <line x1="560" y1="0" x2="1230" y2="0" stroke="#0369A1" strokeWidth="4" />
        <line x1="560" y1="-14" x2="560" y2="14" stroke="#0369A1" strokeWidth="4" />
        <line x1="1230" y1="-14" x2="1230" y2="14" stroke="#0369A1" strokeWidth="4" />
        <rect x="755" y="-26" width="280" height="50" rx="16" fill="#EFF6FF" stroke="#0284C7" strokeWidth="3.2" />
        <text x="895" y="7" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="24" fontWeight="900">
          Ống tai dài ~2,5 cm
        </text>
      </g>

      {/* Anatomy Labels cleanly placed below canal (y=612..650) */}
      <text x="410" y="675" textAnchor="middle" fill="#92400E" stroke="none" fontSize="24" fontWeight="900">
        Vành tai
      </text>
      <text x="1255" y="596" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="25" fontWeight="900">
        Màng nhĩ
      </text>

      {/* Right side Megaphone Amplifier Badge in Step 1 */}
      {activeStep === 1 ? (
        <g transform="translate(1530, 445)">
          <rect x="-170" y="-145" width="340" height="290" rx="26" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4.5" />
          {/* Megaphone icon */}
          <g transform="translate(-12, -32)">
            <polygon points="-58,-18 -20,-18 28,-54 28,54 -20,18 -58,18" fill="#DC2626" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            <rect x="-46" y="18" width="16" height="32" rx="5" fill="#991B1B" stroke={INK} strokeWidth="3" />
            <path d="M 46,-28 Q 72,0 46,28" fill="none" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" />
            <path d="M 66,-44 Q 100,0 66,44" fill="none" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
          </g>
          <CaobangContrastBadge x={0} y={76} w={278} h={48} text="KHUẾCH ĐẠI ×2!" variant="solidRed" fontSize={22} />
          <text x="0" y="124" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="20" fontWeight="800">
            Đúng dải 2.000–4.000 Hz
          </text>
        </g>
      ) : (
        <g transform="translate(1530, 445)">
          <rect x="-170" y="-110" width="340" height="220" rx="24" fill="#FFFFFF" stroke="#D97706" strokeWidth="3.8" />
          <text x="0" y="-36" textAnchor="middle" fill="#92400E" stroke="none" fontSize="25" fontWeight="900">
            Đường dẫn âm thanh
          </text>
          <text x="0" y="14" textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="700">
            Hội tụ sóng âm từ ngoài
          </text>
          <text x="0" y="50" textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="700">
            vào đập rung màng nhĩ
          </text>
        </g>
      )}

      <text x="960" y="734" textAnchor="middle" fill="#78350F" stroke="none" fontSize="23" fontWeight="800">
        {activeStep === 0
          ? 'Độ dài và độ cong hình chữ S của ống tai quyết định tần số cộng hưởng tự nhiên'
          : 'Mọi âm thanh rơi vào dải 2.000 – 4.000 Hz đều bị ống tai tự động tăng âm lượng cực mạnh!'}
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_05: CAOBANG_WHY_EVOLVED_EAR (Beats 17–18, steps 0, 1)
 *   - Step 0: 3 clean useful survival cards in 2.000–4.000 Hz band
 *   - Step 1: Red arrow "Tiếng cào bảng" sneaks right into the priority band -> alarm bell rings!
 * ========================================================================== */
export const CaobangWhyEvolvedEarVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const bellTilt = activeStep === 1 ? Math.sin(frame * 0.5) * 14 : 0;

  const cards = [
    { x: 255, title: 'Phụ âm lời nói', sub: 'Nghe rõ giao tiếp hàng ngày', color: '#0284C7', bg: '#F0F9FF', icon: 'SPEECH' },
    { x: 765, title: 'Tiếng trẻ em khóc', sub: 'Phát hiện con cần giúp ngay', color: '#059669', bg: '#ECFDF5', icon: 'BABY' },
    { x: 1275, title: 'Tiếng hét cầu cứu', sub: 'Cảnh báo nguy hiểm sinh tồn', color: '#D97706', bg: '#FFFBEB', icon: 'SCREAM' },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="MINT" gradId="cb05_bg" cardBorder="#059669" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Tại sao tự nhiên tạo chiếc loa 2.000–4.000 Hz? Vì lợi ích sinh tồn!'
            : 'Tác dụng phụ ngoài ý muốn: Tiếng cào bảng lọt đúng vào dải tần ưu tiên!'
        }
        bg="#FFFFFF"
        color="#065F46"
        border="#059669"
        fontSize={28}
      />

      {/* Highlighted Priority Band container (y=200..515) */}
      <rect x="215" y="198" width="1490" height="320" rx="28" fill="#FFFFFF" stroke="#059669" strokeWidth="4" strokeDasharray="14 8" />
      <CaobangContrastBadge x={960} y={200} w={480} h={46} text="DẢI TẦN ƯU TIÊN: 2.000 – 4.000 Hz" variant="solidGreen" fontSize={21} />

      {/* 3 Useful Evolution Cards */}
      {cards.map((c, ci) => (
        <g key={ci} transform={`translate(${c.x}, 244)`}>
          <rect x="0" y="0" width="390" height="246" rx="22" fill={c.bg} stroke={c.color} strokeWidth="3.8" />
          <circle cx="195" cy="78" r="46" fill="#FFFFFF" stroke={c.color} strokeWidth="3.5" />
          {c.icon === 'SPEECH' && (
            <g transform="translate(195, 78)">
              <rect x="-24" y="-18" width="48" height="32" rx="10" fill="#BAE6FD" stroke="#0284C7" strokeWidth="3" />
              <line x1="-14" y1="-4" x2="14" y2="-4" stroke="#0369A1" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="-14" y1="5" x2="8" y2="5" stroke="#0369A1" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
          {c.icon === 'BABY' && (
            <g transform="translate(195, 78)">
              <circle cx="0" cy="0" r="24" fill="#FEF3C7" stroke={INK} strokeWidth="3" />
              <path d="M -10,-6 L -4,-2 M 10,-6 L 4,-2" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="0" cy="10" rx="8" ry="6" fill="#FB7185" stroke={INK} strokeWidth="2.4" />
            </g>
          )}
          {c.icon === 'SCREAM' && (
            <g transform="translate(195, 78)">
              <polygon points="-22,-8 -8,-8 12,-22 12,22 -8,8 -22,8" fill="#F59E0B" stroke={INK} strokeWidth="3" />
              <path d="M 18,-12 Q 28,0 18,12" fill="none" stroke="#D97706" strokeWidth="3.6" strokeLinecap="round" />
            </g>
          )}
          <text x="195" y="164" textAnchor="middle" fill={c.color} stroke="none" fontSize="25" fontWeight="900">
            {c.title}
          </text>
          <text x="195" y="202" textAnchor="middle" fill="#334155" stroke="none" fontSize="19" fontWeight="700">
            {c.sub}
          </text>
        </g>
      ))}

      {/* Bottom Area: Step 0 summary vs Step 1 Red intruder arrow + ringing bell */}
      {activeStep === 0 ? (
        <g transform="translate(960, 636)">
          <rect x="-560" y="-44" width="1120" height="88" rx="22" fill="#ECFDF5" stroke="#059669" strokeWidth="3.6" />
          <text x="0" y="9" textAnchor="middle" fill="#065F46" stroke="none" fontSize="25" fontWeight="900">
            Nhờ ưu ái dải tần này, loài người giao tiếp rõ ràng &amp; sinh tồn tốt hơn!
          </text>
        </g>
      ) : (
        <g>
          {/* Red intruder box + arrow shooting straight up into the priority band */}
          <g transform="translate(650, 646)">
            <rect x="-280" y="-48" width="560" height="96" rx="22" fill="#FEE2E2" stroke="#DC2626" strokeWidth="4.2" />
            <text x="0" y="-6" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="26" fontWeight="900">
              Tiếng móng tay cào bảng / cọ đĩa
            </text>
            <text x="0" y="28" textAnchor="middle" fill="#B91C1C" stroke="none" fontSize="20" fontWeight="800">
              Vô tình rơi TRÙNG KHÍT vào dải 2.000–4.000 Hz!
            </text>
          </g>

          {/* Upward red arrow piercing band */}
          <path d="M 960,602 L 960,530" stroke="#DC2626" strokeWidth="10" strokeLinecap="round" />
          <polygon points="960,512 940,544 980,544" fill="#DC2626" />

          {/* Ringing Alarm Bell on Right */}
          <g transform="translate(1310, 646)">
            <rect x="-250" y="-48" width="500" height="96" rx="22" fill="#DC2626" stroke="#991B1B" strokeWidth="4" />
            <g transform={`translate(-186, 0) rotate(${bellTilt.toFixed(1)})`}>
              <path d="M -20,16 L 20,16 L 15,-10 C 12,-24 -12,-24 -15,-10 Z" fill="#FACC15" stroke={INK} strokeWidth="3" />
              <circle cx="0" cy="20" r="6" fill="#FEF08A" stroke={INK} strokeWidth="2.4" />
            </g>
            <text x="26" y="-4" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="25" fontWeight="900">
              BÁO ĐỘNG RUNG CHUÔNG!
            </text>
            <text x="26" y="28" textAnchor="middle" fill="#FEE2E2" stroke="none" fontSize="19" fontWeight="700">
              Bị phóng to ngoài ý muốn!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_06: CAOBANG_AMYGDALA_LOOP (Beats 20–22, steps 0, 1, 2)
 *   - Step 0 (Beat 20): Brain cross-section with Auditory Cortex (blue) & Amygdala (coral-orange)
 *   - Step 1 (Beat 21): Auditory Cortex fires signal -> Amygdala turns red siren "NGUY HIỂM!" (high-contrast white on red)
 *   - Step 2 (Beat 22): Amygdala fires feedback arrow BACK to Auditory Cortex -> two-way glowing spiral loop!
 * ========================================================================== */
export const CaobangAmygdalaLoopVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.25);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="LAVENDER" gradId="cb06_bg" cardBorder="#7C3AED" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Ảnh quét não fMRI: Hai vùng não trò chuyện khi nghe tiếng cào bảng'
            : activeStep === 1
            ? 'Hạch hạnh nhân (Amygdala) lập tức bật còi báo động đỏ!'
            : 'Vòng xoáy phản hồi hai chiều: Càng nhạy càng thấy khó chịu tột độ!'
        }
        bg="#FFFFFF"
        color="#5B21B6"
        border="#7C3AED"
        fontSize={28}
      />

      {/* Large Clean Central Brain Diagram (cx=960, cy=455) */}
      <g transform="translate(960, 455)">
        {/* Brain outer silhouette */}
        <path
          d="M -275,38 C -325,-65 -265,-200 -125,-215 C -55,-265 85,-265 145,-202 C 280,-178 322,-42 262,55 C 238,132 138,178 36,162 C -18,186 -90,186 -138,156 C -222,150 -270,102 -275,38 Z"
          fill="#FDE2E4"
          stroke={INK}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Brain stem */}
        <path d="M -38,162 L -52,248 L 52,248 L 38,162 Z" fill="#F9A8D4" stroke={INK} strokeWidth="5" strokeLinejoin="round" />

        {/* Node 1: Vỏ não thính giác (Left-upper inside brain, cx=-128, cy=-42) */}
        <circle
          cx="-128"
          cy="-42"
          r={activeStep === 2 ? 64 + pulse * 6 : 56}
          fill="#0284C7"
          opacity="0.22"
        />
        <circle cx="-128" cy="-42" r="46" fill="#0284C7" stroke="#FFFFFF" strokeWidth="5" />
        <text x="-128" y="-34" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="22" fontWeight="900">
          THÍNH
        </text>

        {/* Node 2: Hạch hạnh nhân / Amygdala (Right-lower inside brain, cx=112, cy=28) */}
        <circle
          cx="112"
          cy="28"
          r={activeStep >= 1 ? 66 + pulse * 8 : 54}
          fill={activeStep >= 1 ? '#DC2626' : '#F97316'}
          opacity={activeStep >= 1 ? 0.28 : 0.2}
        />
        <circle
          cx="112"
          cy="28"
          r="46"
          fill={activeStep >= 1 ? '#DC2626' : '#EA580C'}
          stroke="#FFFFFF"
          strokeWidth="5"
        />
        <text x="112" y="38" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize={activeStep >= 1 ? 34 : 21} fontWeight="900">
          {activeStep >= 1 ? '!' : 'BÁO'}
        </text>

        {/* Step 1+: Forward Arrow (Auditory Cortex -> Amygdala) */}
        {activeStep >= 1 && (
          <g>
            <path
              d="M -78,-62 Q 30,-118 98,-26"
              fill="none"
              stroke="#EA580C"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="16 10"
              strokeDashoffset={-(frame * 4)}
            />
            <polygon points="108,-14 82,-22 100,-42" fill="#EA580C" />
          </g>
        )}

        {/* Step 2: Feedback Return Arrow (Amygdala -> Auditory Cortex) */}
        {activeStep >= 2 && (
          <g>
            <path
              d="M 64,56 Q -38,118 -114,18"
              fill="none"
              stroke="#DC2626"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray="16 10"
              strokeDashoffset={-(frame * 5)}
            />
            <polygon points="-122,4 -96,16 -116,34" fill="#DC2626" />
          </g>
        )}
      </g>

      {/* Left Callout Card: Vỏ não thính giác (strictly outside brain, x=190..590) */}
      <g transform="translate(195, 290)">
        <rect x="0" y="0" width="380" height="196" rx="22" fill="#EFF6FF" stroke="#0284C7" strokeWidth="4" />
        <text x="190" y="48" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="26" fontWeight="900">
          Vỏ não thính giác
        </text>
        <text x="190" y="92" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          Tiếp nhận &amp; phân tích
        </text>
        <text x="190" y="124" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          tiếng cào bảng từ tai
        </text>
        {activeStep === 2 && (
          <CaobangContrastBadge x={190} y={162} w={310} h={42} text="BỊ KÍCH NHẠY GẤP BỘI!" variant="solidBlue" fontSize={18} />
        )}
      </g>

      {/* Right Callout Card: Hạch hạnh nhân (strictly outside brain, x=1345..1725) */}
      <g transform="translate(1345, 290)">
        <rect
          x="0"
          y="0"
          width="380"
          height="218"
          rx="22"
          fill={activeStep >= 1 ? '#FEF2F2' : '#FFF7ED'}
          stroke={activeStep >= 1 ? '#DC2626' : '#EA580C'}
          strokeWidth="4.2"
        />
        <text x="190" y="48" textAnchor="middle" fill={activeStep >= 1 ? '#991B1B' : '#9A3412'} stroke="none" fontSize="26" fontWeight="900">
          Hạch hạnh nhân
        </text>
        <text x="190" y="84" textAnchor="middle" fill="#64748B" stroke="none" fontSize="19" fontWeight="800">
          (Amygdala • Trung tâm sợ hãi)
        </text>
        {activeStep >= 1 ? (
          <>
            {/* Strict high-contrast red alarm badge: #DC2626 + #FFFFFF */}
            <CaobangContrastBadge x={190} y={134} w={290} h={50} text="CÒI BÁO: NGUY HIỂM!" variant="solidRed" fontSize={21} />
            <text x="190" y="192" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="19" fontWeight="800">
              {activeStep === 2 ? 'Bắn tín hiệu ngược về vỏ thính giác!' : 'Bật phản ứng khẩn cấp tức thì!'}
            </text>
          </>
        ) : (
          <text x="190" y="148" textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="700">
            Trung tâm báo động cảm xúc
          </text>
        )}
      </g>

      {/* Bottom caption */}
      <text x="960" y="742" textAnchor="middle" fill="#4C1D95" stroke="none" fontSize="23" fontWeight="900">
        {activeStep === 0
          ? 'Máy quét não cho thấy sự tương tác đặc biệt mạnh giữa hai vùng não này'
          : activeStep === 1
          ? 'Chỉ sau tích tắc, Hạch hạnh nhân nhận diện âm thanh này như tín hiệu đe dọa'
          : 'Vòng lặp Vỏ não thính giác ↔ Hạch hạnh nhân khuếch đại cơn rùng mình lên mức cực đại!'}
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_07: CAOBANG_SCREAM_TEXTURE (Beats 23–24, steps 0, 1)
 *   - Step 0: Stacked waveform comparison: Tiếng hét cảnh báo vs Tiếng cào bảng (nearly identical sawtooth!)
 *   - Step 1: Sensory conflict: Tai báo: Nguy hiểm! (red) vs Mắt báo: Bình thường (blue) -> confused brain
 * ========================================================================== */
export const CaobangScreamTextureVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const screamWave = buildSawtoothWavePath(560, 1640, 326, 62, 16, frame * 0.16, 0.3);
  const scrapeWave = buildSawtoothWavePath(560, 1640, 566, 60, 16, frame * 0.16 + 0.25, 0.28);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="CORAL" gradId="cb07_bg" cardBorder="#EA580C" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Cấu trúc sóng âm răng cưa: Tiếng cào bảng giống hệt tiếng hét hoảng loạn!'
            : 'Xung đột giác quan: Tai báo nguy khẩn cấp nhưng Mắt báo bình yên!'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={28}
      />

      {activeStep === 0 ? (
        <g>
          {/* Top Waveform Card: Tiếng hét cảnh báo */}
          <rect x="215" y="218" width="1490" height="212" rx="24" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4" />
          <text x="380" y="310" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="27" fontWeight="900">
            Tiếng hét cảnh báo
          </text>
          <text x="380" y="348" textAnchor="middle" fill="#B91C1C" stroke="none" fontSize="20" fontWeight="700">
            Sóng nhám gắt (Roughness)
          </text>
          <path d={screamWave} fill="none" stroke="#DC2626" strokeWidth="5.2" strokeLinejoin="round" />

          {/* Center Match Badge */}
          <CaobangContrastBadge x={960} y={446} w={420} h={48} text="≈ CẤU TRÚC SÓNG TRÙNG KHỚP!" variant="solidRed" fontSize={21} />

          {/* Bottom Waveform Card: Tiếng cào bảng */}
          <rect x="215" y="478" width="1490" height="202" rx="24" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4" />
          <text x="380" y="566" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="27" fontWeight="900">
            Tiếng cào bảng
          </text>
          <text x="380" y="604" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="20" fontWeight="700">
            Biến thiên dồn dập giống hệt
          </text>
          <path d={scrapeWave} fill="none" stroke="#EA580C" strokeWidth="5.2" strokeLinejoin="round" />

          <text x="960" y="736" textAnchor="middle" fill="#7C2D12" stroke="none" fontSize="23" fontWeight="900">
            Độ nhám biên độ 30–150 Hz trong sóng âm đánh thức bản năng cảnh giác cổ xưa!
          </text>
        </g>
      ) : (
        <g>
          {/* Left Opposing Card: Tai báo Nguy hiểm! */}
          <g transform="translate(220, 260)">
            <rect x="0" y="0" width="470" height="330" rx="26" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4.5" />
            <circle cx="235" cy="96" r="56" fill="#FEE2E2" stroke="#DC2626" strokeWidth="4" />
            {/* Ear icon */}
            <path d="M 240,66 C 212,66 206,126 238,126 C 254,126 254,106 244,100" fill="none" stroke="#991B1B" strokeWidth="6" strokeLinecap="round" />
            <CaobangContrastBadge x={235} y={196} w={360} h={52} text="TAI BÁO: NGUY HIỂM!" variant="solidRed" fontSize={23} />
            <text x="235" y="268" textAnchor="middle" fill="#7F1D1D" stroke="none" fontSize="21" fontWeight="800">
              “Có tiếng hét khẩn cấp gần đây!”
            </text>
          </g>

          {/* Right Opposing Card: Mắt báo Bình thường */}
          <g transform="translate(1230, 260)">
            <rect x="0" y="0" width="470" height="330" rx="26" fill="#EFF6FF" stroke="#0284C7" strokeWidth="4.5" />
            <circle cx="235" cy="96" r="56" fill="#DBEAFE" stroke="#0284C7" strokeWidth="4" />
            {/* Eye icon */}
            <path d="M 197,96 Q 235,66 273,96 Q 235,126 197,96 Z" fill="#FFFFFF" stroke="#0369A1" strokeWidth="4" />
            <circle cx="235" cy="96" r="14" fill="#0369A1" />
            <CaobangContrastBadge x={235} y={196} w={360} h={52} text="MẮT BÁO: BÌNH THƯỜNG" variant="solidBlue" fontSize={22} />
            <text x="235" y="268" textAnchor="middle" fill="#0C4A6E" stroke="none" fontSize="21" fontWeight="800">
              “Lớp học yên ắng, chẳng có thú dữ!”
            </text>
          </g>

          {/* Connecting conflict arrows into center Brain */}
          <path d="M 704,425 L 814,425" stroke="#DC2626" strokeWidth="9" strokeLinecap="round" />
          <polygon points="830,425 802,408 802,442" fill="#DC2626" />
          <path d="M 1216,425 L 1106,425" stroke="#0284C7" strokeWidth="9" strokeLinecap="round" />
          <polygon points="1090,425 1118,408 1118,442" fill="#0284C7" />

          {/* Center Confused Brain + Exclamation badge */}
          <CaobangBrainEmblem x={960} y={425} scale={1.25} glowColor="#F97316" glowOpacity={0.22} />
          <g transform="translate(960, 250)">
            <rect x="-82" y="-32" width="164" height="60" rx="22" fill="#FACC15" stroke={INK} strokeWidth="4" />
            <text x="0" y="10" textAnchor="middle" fill={INK} stroke="none" fontSize="34" fontWeight="900">
              !? XUNG ĐỘT
            </text>
          </g>

          <text x="960" y="726" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="24" fontWeight="900">
            Mâu thuẫn giữa Tai (báo nguy) và Mắt (bình yên) khiến não khó chịu &amp; căng cứng!
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_08: CAOBANG_GOOSEBUMPS_REFLEX (Beats 25–26, steps 0, 1)
 *   - Step 0: Sympathetic nerve electric impulse racing to skin hair follicles & relaxed muscles
 *   - Step 1: Tiny arrector pili muscles contract -> hairs stand upright -> goosebumps "Nổi da gà!"
 * ========================================================================== */
export const CaobangGoosebumpsReflexVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const sparkX = 240 + ((frame * 14) % 340);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CaobangStageCardBackdrop tone="CREAM" gradId="cb08_bg" cardBorder="#EA580C" />
      <CaobangCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Xung điện từ Hạch hạnh nhân chạy dọc hệ thần kinh giao cảm xuống da'
            : 'Cơ dựng lông đồng loạt co rút → Kéo sợi lông dựng đứng tạo Nổi da gà!'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={28}
      />

      {/* Left Sympathetic Nerve Signal Panel (x=200..570) */}
      <g transform="translate(200, 235)">
        <rect x="0" y="0" width="350" height="410" rx="24" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4" />
        <CaobangBrainEmblem x={175} y={118} scale={0.82} glowColor="#EF4444" glowOpacity={0.22} />
        <text x="175" y="246" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="24" fontWeight="900">
          Hệ thần kinh
        </text>
        <text x="175" y="278" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="24" fontWeight="900">
          giao cảm
        </text>
        <CaobangContrastBadge x={175} y={346} w={280} h={48} text="⚡ Xung báo động!" variant="solidRed" fontSize={21} />
      </g>

      {/* Orange Electric Impulse Cable to Skin */}
      <path
        d="M 556,455 L 672,455"
        fill="none"
        stroke="#F97316"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="18 12"
        strokeDashoffset={-(frame * 5)}
      />
      <circle cx={Math.min(665, Math.max(565, sparkX + 340))} cy="455" r="14" fill="#FACC15" stroke="#DC2626" strokeWidth="3.5" />

      {/* Magnified Skin Cross-Section Frame (x=680..1710, y=220..660) */}
      <g transform="translate(680, 220)">
        <rect x="0" y="0" width="1030" height="430" rx="28" fill="#FFFFFF" stroke="#D97706" strokeWidth="4.2" />

        {/* Dermis & Epidermis Skin Surface: flat in Step 0, bumpy goosebumps in Step 1! */}
        <path
          d={
            activeStep === 1
              ? 'M 24,225 Q 150,225 190,180 Q 230,225 360,225 Q 470,225 510,180 Q 550,225 680,225 Q 790,225 830,180 Q 870,225 1006,225 L 1006,406 L 24,406 Z'
              : 'M 24,225 L 1006,225 L 1006,406 L 24,406 Z'
          }
          fill="#FDE68A"
          stroke="#D97706"
          strokeWidth="4.5"
        />
        {/* Subcutaneous pink tissue layer */}
        <rect x="26" y="328" width="978" height="76" rx="14" fill="#FED7AA" stroke="none" opacity="0.7" />

        {/* 3 Hair Follicles + Tiny Arrector Pili Muscles */}
        {[190, 510, 830].map((hx, hi) => (
          <g key={hi}>
            {/* Follicle root pocket */}
            <ellipse cx={hx} cy="336" rx="22" ry="30" fill="#F59E0B" stroke={INK} strokeWidth="3.2" />
            {/* Hair shaft: tilted relaxed in Step 0, pulled straight upright in Step 1 */}
            {activeStep === 1 ? (
              <line x1={hx} y1="332" x2={hx} y2="62" stroke="#1E293B" strokeWidth="9" strokeLinecap="round" />
            ) : (
              <path d={`M ${hx},332 Q ${hx + 16},210 ${hx + 84},122`} fill="none" stroke="#1E293B" strokeWidth="9" strokeLinecap="round" />
            )}
            {/* Arrector pili muscle band */}
            <path
              d={activeStep === 1 ? `M ${hx + 14},312 L ${hx + 66},236` : `M ${hx + 14},320 L ${hx + 88},238`}
              stroke={activeStep === 1 ? '#DC2626' : '#FB7185'}
              strokeWidth={activeStep === 1 ? 14 : 9}
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Clean labels inside skin diagram (zero overlap with hairs!) */}
        <text x="350" y="382" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="22" fontWeight="900">
          {activeStep === 1 ? 'Cơ dựng lông CO RÚT mạnh!' : 'Cơ dựng lông (đang thả lỏng)'}
        </text>
        {activeStep === 1 && (
          <CaobangContrastBadge x={680} y={84} w={250} h={52} text="NỔI DA GÀ!" variant="solidRed" fontSize={25} />
        )}
      </g>

      {/* Bottom caption safely at y=724 (64px below card diagram bottom!) */}
      <text x="960" y="726" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="24" fontWeight="900">
        {activeStep === 0
          ? 'Xung thần kinh giao cảm lan tới từng nang lông trên cánh tay và sau gáy chỉ trong tích tắc'
          : 'Hàng nghìn bó cơ siêu nhỏ cùng co lại tạo cảm giác rùng mình và da nổi nốt đặc trưng!'}
      </text>
    </svg>
  );
};
