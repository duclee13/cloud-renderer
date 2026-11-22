import React from 'react';
import type { EpisodeVisualProps } from './index';

const INK = '#1e293b';
const FONT = 'Inter, "Segoe UI", Arial, sans-serif';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);

const CardFrame: React.FC<{ title: string; badge?: string; children: React.ReactNode }> = ({
  title,
  badge,
  children,
}) => (
  <svg viewBox="0 0 1120 680" width="1120" height="680" style={{ display: 'block' }}>
    <rect
      x="18"
      y="18"
      width="1084"
      height="644"
      rx="32"
      fill="#ffffff"
      fillOpacity="0.94"
      stroke={INK}
      strokeWidth="6"
    />
    <rect x="44" y="42" width="1032" height="62" rx="18" fill="#fef3c7" stroke={INK} strokeWidth="4" />
    <text
      x="72"
      y="83"
      fill={INK}
      fontSize="30"
      fontWeight="800"
      fontFamily={FONT}
    >
      {title}
    </text>
    {badge ? (
      <g>
        <rect x="810" y="52" width="246" height="42" rx="14" fill="#fde047" stroke={INK} strokeWidth="3.5" />
        <text
          x="933"
          y="80"
          textAnchor="middle"
          fill={INK}
          fontSize="22"
          fontWeight="800"
          fontFamily={FONT}
        >
          {badge}
        </text>
      </g>
    ) : null}
    {children}
  </svg>
);

/** 1. Tách 3 thành phần của viên kẹo cao su */
export const GumIngredientsSplitVisual: React.FC<EpisodeVisualProps> = ({ progress, frame }) => {
  const split = clamp01(progress * 1.5);
  const stretch = 1 + Math.sin(frame / 10) * 0.08;
  const sugarX = lerp(520, 260, split);
  const mintX = lerp(520, 820, split);
  const baseY = lerp(340, 495, split);

  return (
    <CardFrame title="CẤU TẠO 1 VIÊN KẸO CAO SU" badge="3 THÀNH PHẦN">
      {/* Đường & Chất tạo ngọt */}
      <g transform={`translate(${sugarX}, 250)`}>
        <rect x="-150" y="-65" width="300" height="130" rx="22" fill="#e0f2fe" stroke={INK} strokeWidth="4.5" />
        <rect x="-125" y="-32" width="38" height="38" rx="6" fill="#ffffff" stroke={INK} strokeWidth="3.5" transform="rotate(-12 -106 -13)" />
        <rect x="-82" y="-12" width="32" height="32" rx="6" fill="#ffffff" stroke={INK} strokeWidth="3.5" transform="rotate(14 -66 4)" />
        <text x="-30" y="-6" fill={INK} fontSize="24" fontWeight="800" fontFamily={FONT}>Đường &amp; Vị ngọt</text>
        <text x="-30" y="28" fill="#15803d" fontSize="21" fontWeight="700" fontFamily={FONT}>✓ Hòa tan nhanh</text>
      </g>

      {/* Tinh dầu bạc hà */}
      <g transform={`translate(${mintX}, 250)`}>
        <rect x="-165" y="-65" width="330" height="130" rx="22" fill="#dcfce7" stroke={INK} strokeWidth="4.5" />
        <path d="M-130 15 C-135 -25 -90 -42 -68 -22 C-65 10 -95 30 -130 15 Z" fill="#22c55e" stroke={INK} strokeWidth="3.5" />
        <line x1="-126" y1="12" x2="-78" y2="-16" stroke={INK} strokeWidth="3" />
        <text x="-48" y="-6" fill={INK} fontSize="24" fontWeight="800" fontFamily={FONT}>Tinh dầu bạc hà</text>
        <text x="-48" y="28" fill="#15803d" fontSize="21" fontWeight="700" fontFamily={FONT}>✓ Hấp thụ hết</text>
      </g>

      {/* Cốt nhựa dẻo thực phẩm */}
      <g transform={`translate(560, ${baseY})`}>
        <rect x="-320" y="-82" width="640" height="156" rx="26" fill="#fce7f3" stroke={INK} strokeWidth="5" />
        <g transform={`translate(-185, -4) scale(${stretch}, ${1 / stretch})`}>
          <ellipse cx="0" cy="0" rx="72" ry="38" fill="#f472b6" stroke={INK} strokeWidth="4.5" />
          <ellipse cx="-20" cy="-12" rx="22" ry="8" fill="#fbcfe8" />
        </g>
        <text x="-85" y="-12" fill={INK} fontSize="27" fontWeight="800" fontFamily={FONT}>Cốt nhựa dẻo thực phẩm</text>
        <text x="-85" y="24" fill="#be185d" fontSize="22" fontWeight="700" fontFamily={FONT}>✗ Dai nhách — không tan trong bụng</text>
      </g>

      {/* Mũi tên tách */}
      <path d="M560 325 L560 398" stroke={INK} strokeWidth="4.5" strokeDasharray="10 8" />
    </CardFrame>
  );
};

/** 2. Thực quản co bóp đẩy viên kẹo trượt xuống dạ dày (5–10 giây) */
export const EsophagusSlideVisual: React.FC<EpisodeVisualProps> = ({ progress, frame }) => {
  const gumY = lerp(175, 515, progress);
  const squeezeOffset = Math.sin(frame / 6) * 5;

  return (
    <CardFrame title="THỰC QUẢN ĐẨY KẸO XUỐNG DẠ DÀY" badge="5 – 10 GIÂY">
      {/* Ống thực quản */}
      <path
        d={`M430 140 L430 430 C430 480 350 485 350 545 C350 615 470 635 585 615 C690 595 720 510 660 450 C610 400 520 420 520 380 L520 140 Z`}
        fill="#fed7aa"
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Lớp thành trong hồng */}
      <path
        d="M448 145 L448 435 C448 492 375 500 375 548 C375 595 475 612 575 595 C655 580 682 515 636 468 C590 422 502 440 502 382 L502 145 Z"
        fill="#fecaca"
      />
      {/* Sóng cơ bóp thực quản phía sau viên kẹo */}
      {gumY < 420 ? (
        <g>
          <path
            d={`M395 ${gumY - 46} Q430 ${gumY - 30} 448 ${gumY - 30}`}
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d={`M555 ${gumY - 46} Q520 ${gumY - 30} 502 ${gumY - 30}`}
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      ) : null}

      {/* Viên kẹo cao su hồng trượt xuống */}
      <g transform={`translate(${gumY > 440 ? lerp(475, 515, (gumY - 440) / 80) : 475}, ${gumY})`}>
        <ellipse
          cx="0"
          cy="0"
          rx={24 + squeezeOffset * 0.4}
          ry={19 - squeezeOffset * 0.3}
          fill="#f472b6"
          stroke={INK}
          strokeWidth="4"
        />
        <ellipse cx="-7" cy="-5" rx="8" ry="4" fill="#fbcfe8" />
      </g>

      {/* Chú thích bên phải */}
      <g transform="translate(740, 210)">
        <rect x="0" y="0" width="310" height="92" rx="18" fill="#fff7ed" stroke={INK} strokeWidth="4" />
        <text x="20" y="38" fill={INK} fontSize="24" fontWeight="800" fontFamily={FONT}>Cơ thực quản</text>
        <text x="20" y="70" fill="#c2410c" fontSize="20" fontWeight="700" fontFamily={FONT}>Co bóp đẩy xuống liên tục</text>
      </g>
      <g transform="translate(740, 470)">
        <rect x="0" y="0" width="310" height="92" rx="18" fill="#fef2f2" stroke={INK} strokeWidth="4" />
        <text x="20" y="38" fill={INK} fontSize="24" fontWeight="800" fontFamily={FONT}>Khoang dạ dày</text>
        <text x="20" y="70" fill="#b91c1c" fontSize="20" fontWeight="700" fontFamily={FONT}>Đón viên kẹo sau ~10 giây</text>
      </g>
    </CardFrame>
  );
};

/** 3. Dạ dày tiết a-xít sủi bọt hòa tan đường & bạc hà, giữ nguyên lõi nhựa dẻo */
export const StomachAcidDissolveVisual: React.FC<EpisodeVisualProps> = ({ progress, frame }) => {
  const wave = Math.sin(frame / 7) * 8;
  const gumBob = Math.sin(frame / 9) * 10;
  const dissolveOpacity = clamp01(1 - progress * 1.15);
  const scatter = lerp(0, 95, progress);

  return (
    <CardFrame title="DẠ DÀY TIẾT DỊCH VỊ A-XÍT & EN-DIM" badge="30 PHÚT ĐẦU">
      {/* Khung dạ dày lớn */}
      <path
        d="M270 155 L270 250 C140 270 120 470 230 565 C350 660 660 645 735 520 C800 410 725 275 615 265 C540 258 495 295 450 265 C405 235 390 190 390 155 Z"
        fill="#fecaca"
        stroke={INK}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      {/* Bể dịch vị a-xít màu vàng xanh sủi bọt */}
      <path
        d={`M185 ${415 + wave} Q340 ${395 - wave} 490 ${415 + wave} T735 ${410 - wave} C745 505 680 610 475 618 C275 625 180 540 185 ${415 + wave} Z`}
        fill="#bef264"
        fillOpacity="0.88"
        stroke="#4d7c0f"
        strokeWidth="4"
      />

      {/* Bọt khí a-xít nổi lên */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const bx = 245 + i * 82;
        const by = 565 - ((frame * 2.4 + i * 47) % 145);
        return (
          <circle
            key={i}
            cx={bx}
            cy={by}
            r={7 + (i % 3) * 3}
            fill="#ecfccb"
            stroke="#4d7c0f"
            strokeWidth="2.5"
          />
        );
      })}

      {/* Hạt đường & bạc hà tách ra rồi tan biến */}
      {[
        { dx: -1, dy: -0.9, c: '#ffffff' },
        { dx: 1.1, dy: -0.8, c: '#4ade80' },
        { dx: -1.2, dy: 0.3, c: '#4ade80' },
        { dx: 1.2, dy: 0.4, c: '#ffffff' },
        { dx: 0.2, dy: -1.1, c: '#86efac' },
      ].map((p, idx) => (
        <circle
          key={idx}
          cx={455 + p.dx * (48 + scatter)}
          cy={470 + gumBob + p.dy * (36 + scatter)}
          r={11 * dissolveOpacity + 2}
          fill={p.c}
          fillOpacity={dissolveOpacity}
          stroke={INK}
          strokeOpacity={dissolveOpacity}
          strokeWidth="2.5"
        />
      ))}

      {/* Lõi nhựa dẻo hồng vẫn còn nguyên vẹn */}
      <g transform={`translate(455, ${475 + gumBob})`}>
        <ellipse cx="0" cy="0" rx="44" ry="29" fill="#f472b6" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="-12" cy="-9" rx="14" ry="6" fill="#fbcfe8" />
      </g>

      {/* Chú thích bên phải */}
      <g transform="translate(785, 225)">
        <rect x="0" y="0" width="280" height="110" rx="20" fill="#f0fdf4" stroke={INK} strokeWidth="4" />
        <text x="18" y="42" fill="#15803d" fontSize="23" fontWeight="800" fontFamily={FONT}>✓ Đường &amp; bạc hà</text>
        <text x="18" y="80" fill={INK} fontSize="20" fontWeight="600" fontFamily={FONT}>Phân giải sạch sau 30p</text>
      </g>
      <g transform="translate(785, 375)">
        <rect x="0" y="0" width="280" height="110" rx="20" fill="#fdf2f8" stroke={INK} strokeWidth="4" />
        <text x="18" y="42" fill="#be185d" fontSize="23" fontWeight="800" fontFamily={FONT}>• Lõi nhựa dẻo</text>
        <text x="18" y="80" fill={INK} fontSize="20" fontWeight="600" fontFamily={FONT}>Nằm nguyên, trôi tiếp</text>
      </g>
    </CardFrame>
  );
};

/** 4. En-dim lao vào cốt nhựa dẻo nhưng bật ngược ra */
export const EnzymeBounceOffVisual: React.FC<EpisodeVisualProps> = ({ frame }) => {
  const cycle = (frame % 48) / 48;
  const hit = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
  const enzDist = lerp(175, 78, hit);
  const sparkOpacity = hit > 0.82 ? 1 : 0;

  return (
    <CardFrame title="EN-DIM TIÊU HÓA BÓ TAY VỚI CỐT NHỰA DẺO" badge="KHÔNG CẮT ĐƯỢC">
      {/* Cục cốt nhựa dẻo lớn ở giữa */}
      <g transform="translate(560, 385)">
        <ellipse cx="0" cy="0" rx="125" ry="78" fill="#f472b6" stroke={INK} strokeWidth="6" />
        <path d="M-75 -10 Q-30 -45 10 -10 T85 -10" fill="none" stroke="#9d174d" strokeWidth="5" strokeLinecap="round" />
        <path d="M-65 25 Q-20 -5 25 25 T75 20" fill="none" stroke="#9d174d" strokeWidth="5" strokeLinecap="round" />
        <text x="0" y="118" textAnchor="middle" fill={INK} fontSize="26" fontWeight="800" fontFamily={FONT}>
          Chuỗi phân tử dẻo cực bền
        </text>
      </g>

      {/* En-dim bên trái lao vào rồi bật ra */}
      <g transform={`translate(${440 - enzDist}, 385)`}>
        <path d="M0 0 L42 -28 A50 50 0 1 0 42 28 Z" fill="#facc15" stroke={INK} strokeWidth="4.5" />
        <circle cx="-6" cy="-22" r="5" fill={INK} />
        <text x="0" y="82" textAnchor="middle" fill={INK} fontSize="22" fontWeight="800" fontFamily={FONT}>En-dim</text>
      </g>

      {/* En-dim bên phải lao vào rồi bật ra */}
      <g transform={`translate(${680 + enzDist}, 385) scale(-1, 1)`}>
        <path d="M0 0 L42 -28 A50 50 0 1 0 42 28 Z" fill="#38bdf8" stroke={INK} strokeWidth="4.5" />
        <circle cx="-6" cy="-22" r="5" fill={INK} />
      </g>
      <text x={680 + enzDist} y="467" textAnchor="middle" fill={INK} fontSize="22" fontWeight="800" fontFamily={FONT}>En-dim</text>

      {/* Tia lửa bật ngược */}
      <g opacity={sparkOpacity}>
        <line x1="420" y1="355" x2="395" y2="330" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
        <line x1="420" y1="415" x2="395" y2="440" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
        <line x1="700" y1="355" x2="725" y2="330" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
        <line x1="700" y1="415" x2="725" y2="440" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
      </g>
    </CardFrame>
  );
};

/** 5. Lớp dịch nhầy ẩm ướt giúp viên kẹo trượt tuột không dính */
export const MucusSlipDemoVisual: React.FC<EpisodeVisualProps> = ({ progress, frame }) => {
  const slideX = lerp(210, 890, progress);
  const shine = Math.sin(frame / 8) * 14;

  return (
    <CardFrame title="LỚP MÀNG NHẦY CHỐNG DÍNH TỰ NHIÊN" badge="TRƠN TUỘT">
      {/* Thành niêm mạc dạ dày/ruột phía dưới */}
      <rect x="80" y="455" width="960" height="125" rx="22" fill="#fda4af" stroke={INK} strokeWidth="5.5" />
      <text x="560" y="535" textAnchor="middle" fill="#881337" fontSize="28" fontWeight="800" fontFamily={FONT}>
        THÀNH NIÊM MẠC DẠ DÀY &amp; RUỘT NON
      </text>

      {/* Lớp dịch nhầy xanh óng ánh phủ kín phía trên */}
      <path
        d={`M80 455 Q200 ${418 + shine * 0.4} 320 442 T560 442 T800 442 T1040 442 L1040 480 L80 480 Z`}
        fill="#38bdf8"
        fillOpacity="0.82"
        stroke="#0284c7"
        strokeWidth="4.5"
      />
      <text x="560" y="410" textAnchor="middle" fill="#0369a1" fontSize="24" fontWeight="800" fontFamily={FONT}>
        Lớp dịch nhầy ẩm ướt (như mặt bàn ngập nước xà phòng)
      </text>

      {/* Viên kẹo trượt vèo trên lớp màng nhầy */}
      <g transform={`translate(${slideX}, 395)`}>
        {/* Vệt trượt tốc độ */}
        <line x1="-115" y1="12" x2="-58" y2="12" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
        <line x1="-95" y1="26" x2="-52" y2="26" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="0" cy="14" rx="46" ry="26" fill="#f472b6" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="-12" cy="6" rx="14" ry="5" fill="#fbcfe8" />
      </g>

      {/* So sánh nhỏ ở góc trên */}
      <rect x="95" y="140" width="430" height="125" rx="20" fill="#fef2f2" stroke={INK} strokeWidth="4" />
      <text x="120" y="188" fill="#b91c1c" fontSize="24" fontWeight="800" fontFamily={FONT}>✗ Đế giày / Tóc (khô ráo)</text>
      <text x="120" y="230" fill={INK} fontSize="21" fontWeight="600" fontFamily={FONT}>Bám dính cứng ngắc khó gỡ</text>

      <rect x="595" y="140" width="430" height="125" rx="20" fill="#f0f9ff" stroke={INK} strokeWidth="4" />
      <text x="620" y="188" fill="#0369a1" fontSize="24" fontWeight="800" fontFamily={FONT}>✓ Trong bụng (ẩm ướt 24/7)</text>
      <text x="620" y="230" fill={INK} fontSize="21" fontWeight="600" fontFamily={FONT}>Trượt đi ngay, không bám nổi</text>
    </CardFrame>
  );
};

/** 6. Dạ dày co bóp nhào trộn và đẩy viên kẹo qua cửa van sang ruột non */
export const StomachChurnPushVisual: React.FC<EpisodeVisualProps> = ({ progress, frame }) => {
  const pulse = 1 + Math.sin(frame / 7) * 0.04;
  const gumX = lerp(330, 885, progress);
  const gumY = progress < 0.55 ? 430 + Math.sin(frame / 6) * 14 : lerp(430, 415, (progress - 0.55) / 0.45);

  return (
    <CardFrame title="DẠ DÀY CO BÓP ĐẨY KẸO QUA CỬA VAN" badge="NHÀO TRỘN → ĐẨY ĐI">
      {/* Dạ dày co bóp */}
      <g transform={`translate(380, 400) scale(${pulse}, ${2 - pulse}) translate(-380, -400)`}>
        <path
          d="M250 180 L250 260 C130 285 125 480 235 555 C345 625 540 590 615 470 L660 470 L660 365 L605 365 C555 290 455 320 405 275 C365 240 355 195 355 180 Z"
          fill="#fecaca"
          stroke={INK}
          strokeWidth="6.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Đường nối sang ruột non */}
      <path d="M645 372 L995 372 L995 462 L645 462 Z" fill="#fed7aa" stroke={INK} strokeWidth="5.5" />
      {/* Cửa van môn vị */}
      <rect x="632" y="345" width="28" height="145" rx="10" fill="#fde047" stroke={INK} strokeWidth="4" />
      <text x="646" y="325" textAnchor="middle" fill={INK} fontSize="22" fontWeight="800" fontFamily={FONT}>Cửa van</text>
      <text x="845" y="335" textAnchor="middle" fill="#c2410c" fontSize="24" fontWeight="800" fontFamily={FONT}>Vào ruột non →</text>

      {/* Viên kẹo + mẩu thức ăn đi qua van */}
      <circle cx={gumX - 75} cy={gumY + 12} r="14" fill="#fbbf24" stroke={INK} strokeWidth="3" />
      <circle cx={gumX + 55} cy={gumY - 8} r="12" fill="#4ade80" stroke={INK} strokeWidth="3" />
      <g transform={`translate(${gumX}, ${gumY})`}>
        <ellipse cx="0" cy="0" rx="34" ry="22" fill="#f472b6" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="-9" cy="-6" rx="10" ry="4" fill="#fbcfe8" />
      </g>
    </CardFrame>
  );
};

/** 7. So sánh vỏ hạt ngô, hạt vừng, chất xơ rau và cốt kẹo cao su cùng đi trên băng chuyền */
export const CornHuskVsGumVisual: React.FC<EpisodeVisualProps> = ({ progress, frame }) => {
  const shift = ((frame * 3.2) % 120);
  const travel = lerp(0, 140, progress);

  return (
    <CardFrame title="NHỮNG THỨ CƠ THỂ KHÔNG TIÊU HÓA ĐƯỢC" badge="ĐẨY ĐI NHƯ NHAU">
      {/* Băng chuyền tiêu hóa */}
      <rect x="75" y="390" width="970" height="72" rx="36" fill="#e2e8f0" stroke={INK} strokeWidth="5.5" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle
          key={i}
          cx={120 + ((i * 120 + shift) % 900)}
          cy="426"
          r="15"
          fill="#94a3b8"
          stroke={INK}
          strokeWidth="3.5"
        />
      ))}

      {/* 4 vật đi cùng tốc độ */}
      <g transform={`translate(${170 + travel}, 330)`}>
        <ellipse cx="0" cy="0" rx="38" ry="30" fill="#facc15" stroke={INK} strokeWidth="4.5" />
        <text x="0" y="-50" textAnchor="middle" fill={INK} fontSize="22" fontWeight="800" fontFamily={FONT}>Vỏ hạt ngô</text>
      </g>
      <g transform={`translate(${380 + travel}, 335)`}>
        <ellipse cx="-16" cy="4" rx="14" ry="8" fill="#fef3c7" stroke={INK} strokeWidth="3.5" />
        <ellipse cx="14" cy="-6" rx="14" ry="8" fill="#fef3c7" stroke={INK} strokeWidth="3.5" />
        <ellipse cx="4" cy="14" rx="14" ry="8" fill="#fef3c7" stroke={INK} strokeWidth="3.5" />
        <text x="0" y="-55" textAnchor="middle" fill={INK} fontSize="22" fontWeight="800" fontFamily={FONT}>Hạt vừng</text>
      </g>
      <g transform={`translate(${595 + travel}, 330)`}>
        <path d="M-35 15 Q0 -25 35 15" fill="none" stroke="#16a34a" strokeWidth="14" strokeLinecap="round" />
        <text x="0" y="-50" textAnchor="middle" fill={INK} fontSize="22" fontWeight="800" fontFamily={FONT}>Chất xơ rau</text>
      </g>
      <g transform={`translate(${815 + travel}, 330)`}>
        <ellipse cx="0" cy="0" rx="40" ry="25" fill="#f472b6" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="-12" cy="-7" rx="12" ry="5" fill="#fbcfe8" />
        <text x="0" y="-50" textAnchor="middle" fill="#be185d" fontSize="23" fontWeight="800" fontFamily={FONT}>Cốt kẹo cao su</text>
      </g>

      <text x="560" y="545" textAnchor="middle" fill={INK} fontSize="26" fontWeight="700" fontFamily={FONT}>
        Không lấy được dinh dưỡng → Hệ tiêu hóa cứ đẩy thẳng ra ngoài!
      </text>
    </CardFrame>
  );
};

/** 8. Nhu động ruột bóp phía sau, thả phía trước đẩy viên kẹo như vuốt tuýp kem */
export const IntestinePeristalsisVisual: React.FC<EpisodeVisualProps> = ({ progress, frame }) => {
  const gumX = lerp(220, 880, progress);
  const squeezeX = gumX - 85;
  const waveGlow = 0.65 + Math.sin(frame / 6) * 0.25;

  return (
    <CardFrame title="BĂNG CHUYỀN NHU ĐỘNG RUỘT (24/7)" badge="1 – 3 NGÀY">
      {/* Ống ruột có đoạn thắt co bóp ngay phía sau viên kẹo */}
      <path
        d={`M110 265 L${Math.max(120, squeezeX - 60)} 265 Q${squeezeX} 312 ${squeezeX + 60} 265 L1000 265 L1000 445 L${squeezeX + 60} 445 Q${squeezeX} 398 ${Math.max(120, squeezeX - 60)} 445 L110 445 Z`}
        fill="#fed7aa"
        stroke={INK}
        strokeWidth="6.5"
        strokeLinejoin="round"
      />
      {/* Lớp dịch nhầy bên trong ống ruột */}
      <rect x="116" y="335" width="878" height="40" fill="#bae6fd" fillOpacity="0.45" />

      {/* Mũi tên lực bóp cơ thành ruột */}
      <g opacity={waveGlow}>
        <path d={`M${squeezeX} 210 L${squeezeX} 275`} stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
        <path d={`M${squeezeX - 16} 255 L${squeezeX} 278 L${squeezeX + 16} 255`} fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
        <path d={`M${squeezeX} 500 L${squeezeX} 435`} stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
        <path d={`M${squeezeX - 16} 455 L${squeezeX} 432 L${squeezeX + 16} 455`} fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* Viên kẹo cao su bị đẩy trượt về trước */}
      <g transform={`translate(${gumX}, 355)`}>
        <ellipse cx="0" cy="0" rx="40" ry="26" fill="#f472b6" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="-12" cy="-7" rx="12" ry="5" fill="#fbcfe8" />
        <path d="M55 0 L105 0" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
        <path d="M90 -14 L108 0 L90 14" fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
      </g>

      <rect x="160" y="535" width="800" height="76" rx="20" fill="#f0fdf4" stroke={INK} strokeWidth="4" />
      <text x="560" y="582" textAnchor="middle" fill={INK} fontSize="24" fontWeight="800" fontFamily={FONT}>
        Bóp phía sau — Thả phía trước (giống vuốt tuýp kem đánh răng)
      </text>
    </CardFrame>
  );
};

/** 9. Ngoại lệ: Nuốt nhiều viên liên tiếp dính thành khối gây tắc ruột */
export const GumClumpBlockageVisual: React.FC<EpisodeVisualProps> = ({ progress, frame }) => {
  const pulse = 1 + Math.sin(frame / 5) * 0.05;
  const incomingX = lerp(160, 440, progress);

  return (
    <CardFrame title="NGOẠI LỆ: NUỐT NHIỀU VIÊN LIÊN TIẾP" badge="NGUY CƠ TẮC">
      {/* Ống ruột hẹp */}
      <rect x="90" y="255" width="940" height="190" rx="24" fill="#fed7aa" stroke={INK} strokeWidth="6.5" />

      {/* Viên kẹo mới chạy tới dính thêm */}
      <ellipse cx={incomingX} cy="350" rx="30" ry="20" fill="#f472b6" stroke={INK} strokeWidth="4" />

      {/* Khối bã kẹo lớn + vỏ hạt chặn ngang ống ruột */}
      <g transform={`translate(595, 350) scale(${pulse})`}>
        <ellipse cx="-35" cy="-22" rx="46" ry="34" fill="#ec4899" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="32" cy="-18" rx="44" ry="32" fill="#f472b6" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="-20" cy="30" rx="48" ry="34" fill="#db2777" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="38" cy="28" rx="42" ry="30" fill="#f472b6" stroke={INK} strokeWidth="4.5" />
        {/* Vỏ hạt lẫn vào */}
        <ellipse cx="4" cy="4" rx="18" ry="9" fill="#475569" stroke={INK} strokeWidth="3" transform="rotate(28 4 4)" />
        <ellipse cx="-48" cy="18" rx="16" ry="8" fill="#475569" stroke={INK} strokeWidth="3" transform="rotate(-22 -48 18)" />
      </g>

      <rect x="170" y="510" width="780" height="88" rx="20" fill="#fef2f2" stroke="#dc2626" strokeWidth="4.5" />
      <text x="560" y="564" textAnchor="middle" fill="#b91c1c" fontSize="25" fontWeight="800" fontFamily={FONT}>
        Nhiều cục kẹo + vỏ hạt kết khối → Làm hẹp hoặc tắc đường ruột
      </text>
    </CardFrame>
  );
};

/** 10. Hạt dưa hấu trong dạ dày tối om + a-xít không thể nảy mầm */
export const WatermelonSeedStomachVisual: React.FC<EpisodeVisualProps> = ({ frame }) => {
  const bob = Math.sin(frame / 8) * 10;

  return (
    <CardFrame title="NUỐT HẠT DƯA HẤU CÓ MỌC CÂY KHÔNG?" badge="KHÔNG THỂ">
      {/* Khoang dạ dày tối om */}
      <rect x="95" y="150" width="470" height="440" rx="30" fill="#1e293b" stroke={INK} strokeWidth="6" />
      <rect x="115" y="420" width="430" height="150" rx="20" fill="#84cc16" fillOpacity="0.85" />
      {/* Hạt dưa hấu trôi bồng bềnh */}
      <g transform={`translate(330, ${450 + bob})`}>
        <path d="M0 -34 C22 -10 24 22 0 34 C-24 22 -22 -10 0 -34 Z" fill="#0f172a" stroke="#f8fafc" strokeWidth="4" />
        <ellipse cx="-5" cy="-6" rx="4" ry="10" fill="#475569" />
      </g>
      <text x="330" y="220" textAnchor="middle" fill="#f8fafc" fontSize="26" fontWeight="800" fontFamily={FONT}>
        TRONG BỤNG:
      </text>
      <text x="330" y="265" textAnchor="middle" fill="#fca5a5" fontSize="24" fontWeight="700" fontFamily={FONT}>
        ✗ Tối om, không nắng
      </text>
      <text x="330" y="305" textAnchor="middle" fill="#bef264" fontSize="24" fontWeight="700" fontFamily={FONT}>
        ✗ Ngập a-xít mạnh
      </text>

      {/* Khung đối chiếu điều kiện nảy mầm */}
      <rect x="615" y="150" width="420" height="440" rx="30" fill="#f0fdf4" stroke={INK} strokeWidth="5" />
      <circle cx="825" cy="255" r="46" fill="#fde047" stroke={INK} strokeWidth="4.5" />
      <path d="M720 475 L930 475 L910 535 L740 535 Z" fill="#92400e" stroke={INK} strokeWidth="4.5" />
      <path d="M825 475 L825 395" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="798" cy="405" rx="26" ry="14" fill="#22c55e" stroke={INK} strokeWidth="3.5" transform="rotate(-25 798 405)" />
      <ellipse cx="852" cy="405" rx="26" ry="14" fill="#22c55e" stroke={INK} strokeWidth="3.5" transform="rotate(25 852 405)" />
      <text x="825" y="352" textAnchor="middle" fill="#15803d" fontSize="24" fontWeight="800" fontFamily={FONT}>
        Cần ánh sáng + đất ẩm!
      </text>
    </CardFrame>
  );
};

/** 11. Tóm tắt 3 chặng hành trình 1–3 ngày */
export const GumSummaryTimelineVisual: React.FC<EpisodeVisualProps> = ({ progress }) => {
  const dotX = lerp(220, 900, progress);

  return (
    <CardFrame title="TÓM GỌN 3 Ý SIÊU DỄ NHỚ" badge="1 – 3 NGÀY">
      {/* Thanh đường đi */}
      <line x1="200" y1="245" x2="920" y2="245" stroke="#cbd5e1" strokeWidth="14" strokeLinecap="round" />
      <line x1="200" y1="245" x2={dotX} y2="245" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" />
      <ellipse cx={dotX} cy="245" rx="30" ry="20" fill="#f472b6" stroke={INK} strokeWidth="4.5" />

      {/* 3 thẻ tóm tắt */}
      {[
        { x: 75, num: '1', title: 'Đường & Mùi thơm', sub: 'Tiêu hóa sạch sẽ', bg: '#dcfce7' },
        { x: 405, num: '2', title: 'Màng nhầy ẩm ướt', sub: 'Chống dính tuyệt đối', bg: '#e0f2fe' },
        { x: 735, num: '3', title: 'Sau 1 – 3 ngày', sub: 'Rời cơ thể tự nhiên', bg: '#fef3c7' },
      ].map((c) => (
        <g key={c.num} transform={`translate(${c.x}, 325)`}>
          <rect x="0" y="0" width="305" height="235" rx="24" fill={c.bg} stroke={INK} strokeWidth="4.5" />
          <circle cx="52" cy="52" r="26" fill="#ffffff" stroke={INK} strokeWidth="4" />
          <text x="52" y="61" textAnchor="middle" fill={INK} fontSize="26" fontWeight="800" fontFamily={FONT}>{c.num}</text>
          <text x="24" y="128" fill={INK} fontSize="25" fontWeight="800" fontFamily={FONT}>{c.title}</text>
          <text x="24" y="175" fill="#334155" fontSize="22" fontWeight="600" fontFamily={FONT}>{c.sub}</text>
        </g>
      ))}
    </CardFrame>
  );
};
