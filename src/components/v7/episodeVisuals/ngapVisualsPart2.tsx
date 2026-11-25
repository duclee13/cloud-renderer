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
  NgapDogEmblem,
} from './ngapSharedAssets';

/* ============================================================================
 * SVG_09: NGAP_BABY_AGE_4_5 (Beats 26–27, steps 0, 1)
 *   - Step 0: Left card: Baby 0–3 tuổi playing calmly next to yawning adult + green shield "Không lây ngáp"
 *   - Step 1: Right card lights up: Milestone 4–5 tuổi + glowing social brain + child yawns back!
 * ========================================================================== */
export const NgapBabyAge45Visual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.2);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="MINT" gradId="ng09_bg" cardBorder="#0D9488" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Trẻ sơ sinh & dưới 3 tuổi: Biết ngáp tự nhiên nhưng miễn nhiễm ngáp lây!'
            : 'Từ 4 – 5 tuổi: Não cảm xúc xã hội trưởng thành → Bắt đầu lây ngáp!'
        }
        bg="#FFFFFF"
        color="#0F766E"
        border="#0D9488"
        fontSize={29}
      />

      {/* Left Card: 0–3 tuổi */}
      <g transform="translate(215, 210)">
        <rect x="0" y="0" width="690" height="520" rx="28" fill="#ECFDF5" stroke="#10B981" strokeWidth="4.5" />
        <rect x="195" y="28" width="300" height="52" rx="18" fill="#10B981" />
        <text x="345" y="63" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="26" fontWeight="900">
          0 – 3 TUỔI
        </text>

        {/* Adult yawning on left */}
        <NgapFaceBadge x={155} y={230} r={58} mode="yawn" bg="#FEF3C7" border="#D97706" />
        <text x="155" y="316" textAnchor="middle" fill="#92400E" stroke="none" fontSize="20" fontWeight="800">
          Người lớn ngáp
        </text>

        {/* Green Shield blocking contagion */}
        <g transform="translate(345, 230)">
          <path
            d="M 0 -58 L 48 -38 L 42 16 C 36 46 16 62 0 70 C -16 62 -36 46 -42 16 L -48 -38 Z"
            fill="#D1FAE5"
            stroke="#059669"
            strokeWidth="4.2"
          />
          <text x="0" y="2" textAnchor="middle" fill="#065F46" stroke="none" fontSize="18" fontWeight="900">
            MIỄN
          </text>
          <text x="0" y="25" textAnchor="middle" fill="#065F46" stroke="none" fontSize="18" fontWeight="900">
            NHIỄM
          </text>
        </g>

        {/* Calm Baby + toy blocks on right */}
        <NgapFaceBadge x={535} y={225} r={52} mode="happy" bg="#FFFFFF" border="#10B981" />
        <rect x="498" y="294" width="32" height="32" rx="6" fill="#38BDF8" stroke={INK} strokeWidth="2.6" />
        <rect x="536" y="294" width="32" height="32" rx="6" fill="#FACC15" stroke={INK} strokeWidth="2.6" />
        <text x="535" y="354" textAnchor="middle" fill="#065F46" stroke="none" fontSize="20" fontWeight="800">
          Em bé vẫn chơi vui
        </text>

        <rect x="75" y="405" width="540" height="78" rx="18" fill="#FFFFFF" stroke="#10B981" strokeWidth="3" />
        <text x="345" y="440" textAnchor="middle" fill="#065F46" stroke="none" fontSize="22" fontWeight="900">
          Không bị lây ngáp từ người khác
        </text>
        <text x="345" y="468" textAnchor="middle" fill="#475569" stroke="none" fontSize="18" fontWeight="700">
          Vùng não thấu hiểu cảm xúc xã hội chưa hoàn thiện
        </text>
      </g>

      {/* Arrow between cards */}
      <path d="M 920 470 L 995 470" stroke="#0D9488" strokeWidth="9" strokeLinecap="round" />
      <polygon points="1010,470 984,454 984,486" fill="#0D9488" />

      {/* Right Card: 4–5 tuổi */}
      <g transform="translate(1015, 210)" opacity={activeStep === 1 ? 1 : 0.35}>
        <rect x="0" y="0" width="690" height="520" rx="28" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4.5" />
        <rect x="175" y="28" width="340" height="52" rx="18" fill="#EA580C" />
        <text x="345" y="63" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="26" fontWeight="900">
          MỐC 4 – 5 TUỔI ★
        </text>

        <NgapFaceBadge x={155} y={230} r={58} mode="yawn" bg="#FFEDD5" border="#EA580C" />
        <text x="155" y="316" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="20" fontWeight="800">
          Người lớn ngáp
        </text>

        <NgapBrainEmblem
          x={345}
          y={220}
          scale={0.78}
          glowColor="#FB923C"
          glowOpacity={activeStep === 1 ? 0.3 + pulse * 0.16 : 0}
          highlightMirror={true}
        />

        <NgapFaceBadge x={535} y={230} r={56} mode="yawn" bg="#FEF3C7" border="#EA580C" />
        <text x="535" y="316" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="20" fontWeight="900">
          Trẻ ngáp theo ngay!
        </text>

        <rect x="75" y="405" width="540" height="78" rx="18" fill="#FFFFFF" stroke="#EA580C" strokeWidth="3" />
        <text x="345" y="440" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="22" fontWeight="900">
          Bắt đầu xuất hiện phản xạ lây ngáp
        </text>
        <text x="345" y="468" textAnchor="middle" fill="#475569" stroke="none" fontSize="18" fontWeight="700">
          Khả năng đặt mình vào vị trí người khác phát triển mạnh
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_10: NGAP_NOT_COLD_HEARTED (Beat 29, step 0)
 *   - Center brain + 4 clean factor cards around it + green "Hoàn toàn bình thường!"
 * ========================================================================== */
export const NgapNotColdHeartedVisual: React.FC<EpisodeVisualProps> = ({ frame = 0 }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.18);
  const factors = [
    { x: 245, y: 220, title: '1. Tuổi tác', sub: 'Người lớn tuổi ít lây hơn người trẻ', color: '#0284C7', bg: '#F0F9FF' },
    { x: 1215, y: 220, title: '2. Hướng ánh mắt', sub: 'Không nhìn vào mặt/mắt → khó lây', color: '#7C3AED', bg: '#F5F3FF' },
    { x: 245, y: 500, title: '3. Độ mệt mỏi', sub: 'Tỉnh táo hay tập trung cao độ ít lây', color: '#EA580C', bg: '#FFF7ED' },
    { x: 1215, y: 500, title: '4. Nhiệt độ phòng', sub: 'Trời mát hay ấm ảnh hưởng độ nhạy', color: '#0D9488', bg: '#F0FDFA' },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="MINT" gradId="ng10_bg" cardBorder="#10B981" />
      <NgapCleanLabel
        x={960}
        y={84}
        text="Không lây ngáp KHÔNG có nghĩa là vô cảm — Phụ thuộc 4 yếu tố!"
        bg="#FFFFFF"
        color="#065F46"
        border="#10B981"
        fontSize={29}
      />

      {/* Connecting lines from 4 factor cards to center brain */}
      <g stroke="#94A3B8" strokeWidth="4.5" strokeDasharray="10 8">
        <line x1="705" y1="295" x2="865" y2="395" />
        <line x1="1215" y1="295" x2="1055" y2="395" />
        <line x1="705" y1="570" x2="865" y2="480" />
        <line x1="1215" y1="570" x2="1055" y2="480" />
      </g>

      {/* Center Brain */}
      <NgapBrainEmblem
        x={960}
        y={435}
        scale={1.25}
        glowColor="#10B981"
        glowOpacity={0.2 + pulse * 0.12}
      />

      {/* 4 Factor Cards */}
      {factors.map((f, i) => (
        <g key={i} transform={`translate(${f.x}, ${f.y})`}>
          <rect x="0" y="0" width="460" height="146" rx="22" fill={f.bg} stroke={f.color} strokeWidth="4" />
          <text x="230" y="58" textAnchor="middle" fill={f.color} stroke="none" fontSize="26" fontWeight="900">
            {f.title}
          </text>
          <text x="230" y="102" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
            {f.sub}
          </text>
        </g>
      ))}

      {/* Bottom Reassurance Green Pill */}
      <rect x="590" y="675" width="740" height="72" rx="24" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
      <circle cx="642" cy="711" r="20" fill="#10B981" />
      <path d="M 633 711 L 640 718 L 652 704" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="980" y="720" textAnchor="middle" fill="#065F46" stroke="none" fontSize="25" fontWeight="900">
        Thí nghiệm &gt;300 người lớn: Hoàn toàn bình thường!
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_11: NGAP_SOCIAL_ANIMALS (Beats 34–35, steps 0, 1)
 *   - Step 0: 3 species cards (Tinh tinh, Sói bầy đàn, Con người) connected by social arcs
 *   - Step 1: Cross-species highlight: Owner yawning -> heart/wave arrow -> Pet dog yawning!
 * ========================================================================== */
export const NgapSocialAnimalsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.2);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="CREAM" gradId="ng11_bg" cardBorder="#D97706" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Không chỉ con người: Nhiều loài vật sống bầy đàn đều biết lây ngáp!'
            : 'Kỳ diệu hơn: Chó nhà còn biết lây ngáp XUYÊN LOÀI trực tiếp từ con người!'
        }
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Social connecting wave behind the 3 cards */}
          <path
            d="M 480 460 Q 960 320 1440 460"
            fill="none"
            stroke="#EA580C"
            strokeWidth="8"
            strokeDasharray="16 12"
            strokeDashoffset={-(frame * 4)}
          />

          {/* Card 1: Tinh tinh */}
          <g transform="translate(240, 240)">
            <rect x="0" y="0" width="420" height="450" rx="26" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4.2" />
            {/* Cute 2D Chimp Face */}
            <g transform="translate(210, 185)" stroke={INK} strokeWidth="3.8">
              <circle cx="-68" cy="-4" r="24" fill="#D97706" />
              <circle cx="68" cy="-4" r="24" fill="#D97706" />
              <circle cx="0" cy="0" r="64" fill="#78350F" />
              <ellipse cx="0" cy="14" rx="46" ry="38" fill="#FDE68A" stroke="none" />
              <path d="M -26 -12 Q -18 -5 -10 -12" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
              <path d="M 10 -12 Q 18 -5 26 -12" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
              <ellipse cx="0" cy="24" rx="14" ry="16" fill="#9F1239" />
            </g>
            <text x="210" y="336" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="28" fontWeight="900">
              Tinh tinh &amp; Bonobo
            </text>
            <text x="210" y="378" textAnchor="middle" fill="#475569" stroke="none" fontSize="20" fontWeight="700">
              Lây ngáp rõ trong đàn thân thiết
            </text>
          </g>

          {/* Card 2: Sói bầy đàn */}
          <g transform="translate(750, 240)">
            <rect x="0" y="0" width="420" height="450" rx="26" fill="#F0F9FF" stroke="#0284C7" strokeWidth="4.2" />
            {/* Cute 2D Wolf Face */}
            <g transform="translate(210, 185)" stroke={INK} strokeWidth="3.8" strokeLinejoin="round">
              <polygon points="-58,-34 -34,-82 -8,-46" fill="#64748B" />
              <polygon points="58,-34 34,-82 8,-46" fill="#64748B" />
              <path d="M -62 -14 C -62 -64 62 -64 62 -14 L 44 48 L 0 64 L -44 48 Z" fill="#94A3B8" />
              <path d="M -42 12 L 0 -10 L 42 12 L 32 48 L 0 60 L -32 48 Z" fill="#F8FAFC" stroke="none" />
              <circle cx="-20" cy="-10" r="5" fill={INK} />
              <circle cx="20" cy="-10" r="5" fill={INK} />
              <polygon points="-10,16 10,16 0,28" fill={INK} />
              <ellipse cx="0" cy="42" rx="12" ry="12" fill="#9F1239" />
            </g>
            <text x="210" y="336" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="28" fontWeight="900">
              Sói bầy đàn
            </text>
            <text x="210" y="378" textAnchor="middle" fill="#475569" stroke="none" fontSize="20" fontWeight="700">
              Gắn bó chặt chẽ theo nhóm
            </text>
          </g>

          {/* Card 3: Con người */}
          <g transform="translate(1260, 240)">
            <rect x="0" y="0" width="420" height="450" rx="26" fill="#ECFDF5" stroke="#10B981" strokeWidth="4.2" />
            <NgapFaceBadge x={210} y={185} r={66} mode="yawn" bg="#D1FAE5" border="#059669" />
            <text x="210" y="336" textAnchor="middle" fill="#065F46" stroke="none" fontSize="28" fontWeight="900">
              Con người
            </text>
            <text x="210" y="378" textAnchor="middle" fill="#475569" stroke="none" fontSize="20" fontWeight="700">
              Phản xạ kết nối cộng đồng
            </text>
          </g>
        </g>
      ) : (
        <g>
          {/* Cross-Species Highlight: Owner -> Heart/Wave -> Pet Dog */}
          <g transform="translate(495, 455)">
            <rect x="-195" y="-175" width="390" height="350" rx="28" fill="#EFF6FF" stroke="#2563EB" strokeWidth="4.5" />
            <NgapFaceBadge x={0} y={-28} r={76} mode="yawn" bg="#DBEAFE" border="#2563EB" />
            <text x="0" y="102" textAnchor="middle" fill="#1D4ED8" stroke="none" fontSize="27" fontWeight="900">
              Người chủ ngáp
            </text>
            <text x="0" y="136" textAnchor="middle" fill="#475569" stroke="none" fontSize="19" fontWeight="700">
              Phát tín hiệu xã hội quen thuộc
            </text>
          </g>

          {/* Animated Heart + Wave Bridge */}
          <path
            d="M 710 455 L 1190 455"
            fill="none"
            stroke="#EA580C"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="22 14"
            strokeDashoffset={-(frame * 5)}
          />
          <polygon points="1210,455 1178,436 1178,474" fill="#EA580C" />
          <g transform={`translate(960, 390) scale(${(1 + pulse * 0.1).toFixed(3)})`}>
            <circle cx="0" cy="0" r="46" fill="#FFE4E6" stroke="#E11D48" strokeWidth="3.5" />
            <path
              d="M 0 18 C -24 -2 -24 -22 -8 -22 C 0 -22 0 -10 0 -10 C 0 -10 0 -22 8 -22 C 24 -22 24 -2 0 18 Z"
              fill="#F43F5E"
              stroke="#9F1239"
              strokeWidth="2.6"
            />
          </g>
          <text x="960" y="514" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="23" fontWeight="900">
            Lây ngáp XUYÊN LOÀI!
          </text>
          <text x="960" y="548" textAnchor="middle" fill="#475569" stroke="none" fontSize="19" fontWeight="700">
            Hàng nghìn năm tiến hóa sống cùng con người
          </text>

          {/* Right: Cute Pet Dog Yawning Back */}
          <g transform="translate(1425, 455)">
            <rect x="-195" y="-175" width="390" height="350" rx="28" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4.5" />
            <NgapDogEmblem x={0} y={-24} scale={2.15} yawning={true} />
            <text x="0" y="102" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="27" fontWeight="900">
              Chó cưng ngáp theo!
            </text>
            <text x="0" y="136" textAnchor="middle" fill="#475569" stroke="none" fontSize="19" fontWeight="700">
              Ngước nhìn rồi há miệng ngáp ngay
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_12: NGAP_DOG_EXPERIMENT (Beats 36–38, steps 0, 1, 2 — 1-to-1 sync!)
 *   - Step 0: London study: 21 / 29 dogs (72%) yawned when watching real human yawns
 *   - Step 1: Control column lights up: Fake mouth opening -> 0 / 29 dogs + green check!
 *   - Step 2: Japan study comparison bar below: Chủ nhân >> Người lạ
 * ========================================================================== */
export const NgapDogExperimentVisual: React.FC<EpisodeVisualProps> = ({
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="SKY" gradId="ng12_bg" cardBorder="#0284C7" />
      <NgapCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Thí nghiệm Luân Đôn: 21 / 29 chú chó (72%) ngáp theo khi thấy người ngáp!'
            : activeStep === 1
              ? 'Đối chứng chuẩn xác: Há miệng giả → 0 / 29 chú chó bị đánh lừa!'
              : 'Nghiên cứu Nhật Bản: Chó lây ngáp từ CHỦ NHÂN nhiều hơn hẳn người lạ!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={28}
      />

      {/* Top-Left Box: 21 / 29 Dogs Matrix */}
      <g transform="translate(210, 200)">
        <rect x="0" y="0" width="840" height="335" rx="24" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4" />
        <text x="420" y="46" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="25" fontWeight="900">
          Người làm mẫu NGÁP THẬT → 21 / 29 chú chó (72%)
        </text>
        {/* 29 clean dog dots arranged in 3 tidy rows (10 + 10 + 9) */}
        {Array.from({ length: 29 }).map((_, idx) => {
          const row = Math.floor(idx / 10);
          const col = idx % 10;
          const cx = 75 + col * 76 + (row === 2 ? 38 : 0);
          const cy = 112 + row * 72;
          const yawned = idx < 21;
          return (
            <g key={idx} transform={`translate(${cx}, ${cy})`}>
              <circle
                cx="0"
                cy="0"
                r="24"
                fill={yawned ? '#F97316' : '#E2E8F0'}
                stroke={yawned ? '#9A3412' : '#94A3B8'}
                strokeWidth="2.8"
              />
              <circle cx="-7" cy="-5" r="2.8" fill={yawned ? '#FFFFFF' : '#64748B'} />
              <circle cx="7" cy="-5" r="2.8" fill={yawned ? '#FFFFFF' : '#64748B'} />
              {yawned ? (
                <ellipse cx="0" cy="8" rx="6" ry="7.5" fill="#7F1D1D" />
              ) : (
                <line x1="-6" y1="8" x2="6" y2="8" stroke="#64748B" strokeWidth="2.6" strokeLinecap="round" />
              )}
            </g>
          );
        })}
        <text x="420" y="314" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="20" fontWeight="800">
          Cam = Ngáp theo (21)   •   Xám = Không ngáp (8)
        </text>
      </g>

      {/* Top-Right Box: Control Column (Step 1+) */}
      <g transform="translate(1090, 200)" opacity={activeStep >= 1 ? 1 : 0.35}>
        <rect x="0" y="0" width="620" height="335" rx="24" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
        <text x="310" y="46" textAnchor="middle" fill="#065F46" stroke="none" fontSize="25" fontWeight="900">
          Đối chứng: HÁ MIỆNG GIẢ
        </text>
        <text x="310" y="156" textAnchor="middle" fill="#059669" stroke="none" fontSize="72" fontWeight="900">
          0 / 29
        </text>
        <text x="310" y="206" textAnchor="middle" fill="#334155" stroke="none" fontSize="22" fontWeight="800">
          Không chú chó nào bị đánh lừa!
        </text>
        <rect x="85" y="244" width="450" height="58" rx="18" fill="#FFFFFF" stroke="#10B981" strokeWidth="3.2" />
        <circle cx="122" cy="273" r="16" fill="#10B981" />
        <path d="M 115 273 L 120 278 L 130 267" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="328" y="281" textAnchor="middle" fill="#065F46" stroke="none" fontSize="20" fontWeight="900">
          Khẳng định phản xạ lây ngáp thật!
        </text>
      </g>

      {/* Bottom Bar Comparison: Japan Study (Step 2) */}
      <g transform="translate(210, 565)" opacity={activeStep === 2 ? 1 : 0.3}>
        <rect x="0" y="0" width="1500" height="185" rx="24" fill="#F8FAFC" stroke={activeStep === 2 ? '#EA580C' : '#CBD5E1'} strokeWidth="4" />
        <text x="42" y="44" textAnchor="start" fill="#0F172A" stroke="none" fontSize="23" fontWeight="900">
          Nghiên cứu Nhật Bản (Romero et al.): Tần suất chó ngáp theo
        </text>

        {/* Bar 1: Chủ nhân */}
        <text x="42" y="102" textAnchor="start" fill="#9A3412" stroke="none" fontSize="22" fontWeight="900">
          Chủ nhân quen thuộc
        </text>
        <rect x="335" y="72" width="920" height="40" rx="14" fill="#F97316" stroke={INK} strokeWidth="3" />
        <text x="1280" y="101" textAnchor="start" fill="#C2410C" stroke="none" fontSize="23" fontWeight="900">
          Cao vượt trội!
        </text>

        {/* Bar 2: Người lạ */}
        <text x="42" y="156" textAnchor="start" fill="#475569" stroke="none" fontSize="22" fontWeight="800">
          Người lạ mặt
        </text>
        <rect x="335" y="126" width="320" height="40" rx="14" fill="#94A3B8" stroke="#475569" strokeWidth="3" />
        <text x="680" y="155" textAnchor="start" fill="#64748B" stroke="none" fontSize="21" fontWeight="800">
          Thấp hơn nhiều
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_13: NGAP_SUPPRESS_BACKFIRE (Beat 41, step 0)
 *   - Person clamping mouth tightly + rising orange-red pressure bar -> "Càng cố nhịn → Càng muốn ngáp!"
 * ========================================================================== */
export const NgapSuppressBackfireVisual: React.FC<EpisodeVisualProps> = ({ frame = 0 }) => {
  const fillPct = 0.62 + 0.34 * (0.5 + 0.5 * Math.sin(frame * 0.14));
  const barH = Math.round(fillPct * 340);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="CORAL" gradId="ng13_bg" cardBorder="#DC2626" />
      <NgapCleanLabel
        x={960}
        y={84}
        text="Cảnh báo khoa học: Càng gồng miệng nhịn ngáp càng phản tác dụng!"
        bg="#FFFFFF"
        color="#991B1B"
        border="#DC2626"
        fontSize={30}
      />

      {/* Left: Person clamping mouth tightly shut */}
      <g transform="translate(560, 465)">
        <rect x="-220" y="-205" width="440" height="410" rx="28" fill="#FEF2F2" stroke="#EF4444" strokeWidth="4.2" />
        <NgapFaceBadge x={0} y={-40} r={86} mode="clamped" bg="#FEE2E2" border="#DC2626" />
        <text x="0" y="102" textAnchor="middle" fill="#991B1B" stroke="none" fontSize="27" fontWeight="900">
          Cố mím chặt miệng
        </text>
        <text x="0" y="140" textAnchor="middle" fill="#475569" stroke="none" fontSize="20" fontWeight="700">
          Gồng cơ hàm chống lại phản xạ
        </text>
      </g>

      {/* Center Arrow */}
      <path d="M 810 465 L 950 465" stroke="#DC2626" strokeWidth="12" strokeLinecap="round" strokeDasharray="18 12" strokeDashoffset={-(frame * 5)} />
      <polygon points="972,465 940,446 940,484" fill="#DC2626" />

      {/* Right: Rising Pressure Meter */}
      <g transform="translate(1060, 235)">
        <rect x="0" y="0" width="590" height="460" rx="28" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4.2" />
        <text x="295" y="50" textAnchor="middle" fill="#9A3412" stroke="none" fontSize="26" fontWeight="900">
          Áp lực thôi thúc trong vỏ não
        </text>
        {/* Meter Track */}
        <rect x="75" y="84" width="90" height="340" rx="22" fill="#F1F5F9" stroke={INK} strokeWidth="4" />
        <rect x="85" y={84 + (340 - barH)} width="70" height={barH} rx="16" fill="#EF4444" />
        {/* Warning Callout beside gauge */}
        <g transform="translate(200, 128)">
          <rect x="0" y="0" width="348" height="196" rx="22" fill="#FEF2F2" stroke="#EF4444" strokeWidth="3.2" />
          <text x="174" y="56" textAnchor="middle" fill="#B91C1C" stroke="none" fontSize="26" fontWeight="900">
            Càng cố nhịn
          </text>
          <text x="174" y="100" textAnchor="middle" fill="#DC2626" stroke="none" fontSize="30" fontWeight="900">
            → Càng muốn ngáp!
          </text>
          <text x="174" y="148" textAnchor="middle" fill="#334155" stroke="none" fontSize="19" fontWeight="700">
            Cảm giác bức bối trong não
          </text>
          <text x="174" y="176" textAnchor="middle" fill="#334155" stroke="none" fontSize="19" fontWeight="700">
            dâng cao hơn hẳn!
          </text>
        </g>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_14: NGAP_3_SMART_TRICKS (Beats 42–44, steps 0, 1, 2 — 1-to-1 sync!)
 *   - Step 0: Card 1 active (Chuyển hướng ánh mắt)
 *   - Step 1: Card 2 active (Hít thở sâu bằng mũi)
 *   - Step 2: Card 3 active (Nhấp ngụm nước mát + green check!)
 * ========================================================================== */
export const Ngap3SmartTricksVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="MINT" gradId="ng14_bg" cardBorder="#059669" />
      <NgapCleanLabel
        x={960}
        y={84}
        text="3 mẹo khoa học giúp cắt cơn lây ngáp cực nhanh & lịch sự"
        bg="#FFFFFF"
        color="#065F46"
        border="#059669"
        fontSize={30}
      />

      {/* Card 1: Chuyển hướng ánh mắt */}
      <g transform="translate(215, 215)" opacity={activeStep === 0 ? 1 : 0.52}>
        <rect
          x="0"
          y="0"
          width="465"
          height="515"
          rx="26"
          fill={activeStep === 0 ? '#F0F9FF' : '#F8FAFC'}
          stroke={activeStep === 0 ? '#0284C7' : '#CBD5E1'}
          strokeWidth={activeStep === 0 ? 5.5 : 3.2}
        />
        <rect x="28" y="26" width="409" height="54" rx="16" fill="#0284C7" />
        <text x="232" y="61" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="24" fontWeight="900">
          MẸO 1: ĐỔI ÁNH MẮT
        </text>
        {/* Eye shifting toward open book */}
        <g transform="translate(232, 210)">
          <circle cx="-70" cy="0" r="52" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
          <path d="M -100 0 Q -70 -26 -40 0 Q -70 26 -100 0 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3.2" />
          <circle cx="-56" cy="0" r="10" fill={INK} />
          <path d="M -8 0 L 42 0" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" strokeDasharray="8 6" strokeDashoffset={-(frame * 3)} />
          <polygon points="52,0 36,-10 36,10" fill="#0284C7" />
          <rect x="64" y="-36" width="68" height="72" rx="10" fill="#FEF3C7" stroke={INK} strokeWidth="3.2" />
          <line x1="78" y1="-12" x2="118" y2="-12" stroke="#64748B" strokeWidth="3.2" />
          <line x1="78" y1="6" x2="114" y2="6" stroke="#64748B" strokeWidth="3.2" />
        </g>
        <text x="232" y="346" textAnchor="middle" fill="#0369A1" stroke="none" fontSize="24" fontWeight="900">
          Nhìn sang vở hoặc cửa sổ
        </text>
        <text x="232" y="388" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          Cắt ngay luồng tín hiệu thị giác
        </text>
        <text x="232" y="420" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          từ người đang ngáp đối diện
        </text>
      </g>

      {/* Card 2: Hít thở sâu bằng mũi */}
      <g transform="translate(728, 215)" opacity={activeStep === 1 ? 1 : 0.52}>
        <rect
          x="0"
          y="0"
          width="465"
          height="515"
          rx="26"
          fill={activeStep === 1 ? '#F0FDFA' : '#F8FAFC'}
          stroke={activeStep === 1 ? '#0D9488' : '#CBD5E1'}
          strokeWidth={activeStep === 1 ? 5.5 : 3.2}
        />
        <rect x="28" y="26" width="409" height="54" rx="16" fill="#0D9488" />
        <text x="232" y="61" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="24" fontWeight="900">
          MẸO 2: HÍT THỞ MŨI
        </text>
        <g transform="translate(232, 210)">
          {/* Cool airflow curves entering upward toward brain */}
          <path d="M -98 28 Q -42 28 -18 -8" fill="none" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" strokeDasharray="14 10" strokeDashoffset={-(frame * 4)} />
          <path d="M -98 54 Q -36 54 -4 14" fill="none" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" strokeDasharray="14 10" strokeDashoffset={-(frame * 4)} />
          <NgapBrainEmblem x={64} y={-6} scale={0.92} fillColor="#BAE6FD" glowColor="#14B8A6" glowOpacity={activeStep === 1 ? 0.3 : 0.1} />
        </g>
        <text x="232" y="346" textAnchor="middle" fill="#0F766E" stroke="none" fontSize="24" fontWeight="900">
          Hít sâu mũi, thở ra chậm
        </text>
        <text x="232" y="388" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          Làm mát vùng xoang mũi &amp;
        </text>
        <text x="232" y="420" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          đánh lạc hướng phản xạ mở hàm
        </text>
      </g>

      {/* Card 3: Nhấp ngụm nước mát */}
      <g transform="translate(1240, 215)" opacity={activeStep === 2 ? 1 : 0.52}>
        <rect
          x="0"
          y="0"
          width="465"
          height="515"
          rx="26"
          fill={activeStep === 2 ? '#ECFDF5' : '#F8FAFC'}
          stroke={activeStep === 2 ? '#10B981' : '#CBD5E1'}
          strokeWidth={activeStep === 2 ? 5.5 : 3.2}
        />
        <rect x="28" y="26" width="409" height="54" rx="16" fill="#059669" />
        <text x="232" y="61" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="24" fontWeight="900">
          MẸO 3: UỐNG NƯỚC MÁT
        </text>
        {/* Cool Water Glass + Ice Cube */}
        <g transform="translate(232, 210)">
          <path d="M -46 -62 L -36 64 L 36 64 L 46 -62 Z" fill="#E0F2FE" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M -39 -18 L -34 58 L 34 58 L 39 -18 Z" fill="#38BDF8" opacity="0.85" />
          <rect x="-18" y="-32" width="28" height="28" rx="6" transform="rotate(-14, -4, -18)" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.8" />
          <circle cx="64" cy="-42" r="24" fill="#10B981" stroke={INK} strokeWidth="3" />
          <path d="M 54 -42 L 61 -35 L 75 -49" fill="none" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x="232" y="346" textAnchor="middle" fill="#065F46" stroke="none" fontSize="24" fontWeight="900">
          Nhấp một ngụm nước lạnh
        </text>
        <text x="232" y="388" textAnchor="middle" fill="#334155" stroke="none" fontSize="20" fontWeight="700">
          Động tác nuốt &amp; hơi mát vòm họng
        </text>
        <rect x="78" y="428" width="308" height="50" rx="16" fill="#D1FAE5" stroke="#059669" strokeWidth="3" />
        <text x="232" y="460" textAnchor="middle" fill="#065F46" stroke="none" fontSize="21" fontWeight="900">
          Cắt cơn ngáp nhanh ✓
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_15: NGAP_VIEWER_CHALLENGE (Beats 48–49, steps 0, 1)
 *   - Step 0: Warm cream card + stopwatch + "THỬ THÁCH NHANH CHO BẠN!"
 *   - Step 1: 3 clean choice cards: 0 lần, 1–2 lần, Trên 3 lần
 * ========================================================================== */
export const NgapViewerChallengeVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const handDeg = (frame * 6) % 360;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="CREAM" gradId="ng15_bg" cardBorder="#D97706" />
      <NgapCleanLabel
        x={960}
        y={84}
        text="Câu hỏi vui dành riêng cho chính bạn đang xem video!"
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={30}
      />

      {/* Stopwatch + Big Headline */}
      <g transform="translate(960, 315)">
        <circle cx="-360" cy="0" r="68" fill="#FFFFFF" stroke="#D97706" strokeWidth="6" />
        <rect x="-378" y="-86" width="36" height="16" rx="5" fill="#D97706" stroke={INK} strokeWidth="2.8" />
        <line
          x1="-360"
          y1="0"
          x2={(-360 + Math.sin((handDeg * Math.PI) / 180) * 44).toFixed(1)}
          y2={(-Math.cos((handDeg * Math.PI) / 180) * 44).toFixed(1)}
          stroke="#EF4444"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="-360" cy="0" r="6" fill={INK} />

        <text x="85" y="-8" textAnchor="middle" fill="#B45309" stroke="none" fontSize="46" fontWeight="900">
          THỬ THÁCH NHANH CHO BẠN!
        </text>
        <text x="85" y="42" textAnchor="middle" fill="#334155" stroke="none" fontSize="26" fontWeight="800">
          Từ đầu video tới giờ, bạn đã lỡ ngáp theo mấy lần?
        </text>
      </g>

      {/* Step 1: 3 Interactive Choice Badges */}
      <g opacity={activeStep === 1 ? 1 : 0.28}>
        {[
          { x: 245, title: '0 lần', sub: 'Miễn nhiễm / Siêu tập trung!', bg: '#ECFDF5', border: '#10B981', color: '#065F46', face: 'alert' as const },
          { x: 755, title: '1 – 2 lần', sub: 'Phản xạ bình thường!', bg: '#FFFBEB', border: '#F59E0B', color: '#B45309', face: 'happy' as const },
          { x: 1265, title: 'Trên 3 lần', sub: 'Nơ-ron gương siêu nhạy!', bg: '#FFF7ED', border: '#EA580C', color: '#9A3412', face: 'yawn' as const },
        ].map((opt, idx) => (
          <g key={idx} transform={`translate(${opt.x}, 455)`}>
            <GroundShadow cx={205} cy={272} rx={185} ry={10} />
            <rect x="0" y="0" width="410" height="260" rx="26" fill={opt.bg} stroke={opt.border} strokeWidth="4.5" />
            <NgapFaceBadge x={205} y={84} r={48} mode={opt.face} bg="#FFFFFF" border={opt.border} />
            <text x="205" y="182" textAnchor="middle" fill={opt.color} stroke="none" fontSize="34" fontWeight="900">
              {opt.title}
            </text>
            <text x="205" y="224" textAnchor="middle" fill="#334155" stroke="none" fontSize="21" fontWeight="800">
              {opt.sub}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_16: NGAP_SUMMARY_3_CARDS (Beats 55–57, steps 0, 1, 2 — Exact 1-to-1 sync!)
 *   - Step 0 (Beat 55 "Thứ nhất"): Card 1 crisp & visible
 *   - Step 1 (Beat 56 "Thứ hai"): Card 1 + Card 2 visible
 *   - Step 2 (Beat 57 "Thứ ba"): All 3 cards visible!
 * ========================================================================== */
export const NgapSummary3CardsVisual: React.FC<EpisodeVisualProps> = ({
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <NgapStageCardBackdrop tone="SKY" gradId="ng16_bg" cardBorder="#2563EB" />
      <NgapCleanLabel
        x={960}
        y={84}
        text="TÓM TẮT 3 ĐIỀU CẦN NHỚ"
        bg="#FFFFFF"
        color="#1D4ED8"
        border="#2563EB"
        fontSize={32}
      />

      {/* Card 1 (Beat 55: Thứ nhất) */}
      <g transform="translate(215, 215)">
        <GroundShadow cx={232} cy={522} rx={210} ry={11} />
        <rect x="0" y="0" width="465" height="510" rx="28" fill="#EFF6FF" stroke="#2563EB" strokeWidth="4.8" />
        <circle cx="232" cy="84" r="42" fill="#2563EB" />
        <text x="232" y="98" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="38" fontWeight="900">
          1
        </text>
        <text x="232" y="182" textAnchor="middle" fill="#1D4ED8" stroke="none" fontSize="29" fontWeight="900">
          Không phải thiếu O<tspan dy="5" fontSize="20">2</tspan>
        </text>
        <rect x="36" y="218" width="393" height="240" rx="20" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="3" />
        <text x="232" y="286" textAnchor="middle" fill="#0F172A" stroke="none" fontSize="23" fontWeight="800">
          Ngáp tự nhiên giúp bộ não
        </text>
        <text x="232" y="330" textAnchor="middle" fill="#0284C7" stroke="none" fontSize="25" fontWeight="900">
          tỉnh táo &amp; tản nhiệt nhẹ
        </text>
        <text x="232" y="382" textAnchor="middle" fill="#475569" stroke="none" fontSize="20" fontWeight="700">
          qua luồng khí mát &amp; giãn cơ hàm
        </text>
      </g>

      {/* Card 2 (Beat 56: Thứ hai) */}
      <g transform="translate(728, 215)" opacity={activeStep >= 1 ? 1 : 0.14}>
        <GroundShadow cx={232} cy={522} rx={210} ry={11} />
        <rect x="0" y="0" width="465" height="510" rx="28" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4.8" />
        <circle cx="232" cy="84" r="42" fill="#EA580C" />
        <text x="232" y="98" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="38" fontWeight="900">
          2
        </text>
        <text x="232" y="182" textAnchor="middle" fill="#C2410C" stroke="none" fontSize="28" fontWeight="900">
          Phản xạ phản chiếu não
        </text>
        <rect x="36" y="218" width="393" height="240" rx="20" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="3" />
        <text x="232" y="286" textAnchor="middle" fill="#0F172A" stroke="none" fontSize="23" fontWeight="800">
          Kích hoạt hệ nơ-ron gương
        </text>
        <text x="232" y="330" textAnchor="middle" fill="#EA580C" stroke="none" fontSize="24" fontWeight="900">
          Mạnh nhất với người thân
        </text>
        <text x="232" y="382" textAnchor="middle" fill="#475569" stroke="none" fontSize="20" fontWeight="700">
          &amp; bắt đầu từ mốc 4–5 tuổi
        </text>
      </g>

      {/* Card 3 (Beat 57: Thứ ba) */}
      <g transform="translate(1240, 215)" opacity={activeStep >= 2 ? 1 : 0.14}>
        <GroundShadow cx={232} cy={522} rx={210} ry={11} />
        <rect x="0" y="0" width="465" height="510" rx="28" fill="#ECFDF5" stroke="#059669" strokeWidth="4.8" />
        <circle cx="232" cy="84" r="42" fill="#059669" />
        <text x="232" y="98" textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize="38" fontWeight="900">
          3
        </text>
        <text x="232" y="182" textAnchor="middle" fill="#065F46" stroke="none" fontSize="29" fontWeight="900">
          Mẹo cắt cơn ngáp
        </text>
        <rect x="36" y="218" width="393" height="240" rx="20" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="3" />
        <text x="232" y="278" textAnchor="middle" fill="#065F46" stroke="none" fontSize="23" fontWeight="900">
          • Chuyển hướng ánh mắt
        </text>
        <text x="232" y="328" textAnchor="middle" fill="#065F46" stroke="none" fontSize="23" fontWeight="900">
          • Hít thở sâu bằng mũi
        </text>
        <text x="232" y="378" textAnchor="middle" fill="#065F46" stroke="none" fontSize="23" fontWeight="900">
          • Nhấp ngụm nước mát
        </text>
        <text x="232" y="426" textAnchor="middle" fill="#475569" stroke="none" fontSize="18" fontWeight="700">
          (Tinh tinh &amp; chó cưng cũng lây ngáp!)
        </text>
      </g>
    </svg>
  );
};
