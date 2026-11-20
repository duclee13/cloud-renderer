/**
 * UNIVERSAL AUTO STAGE V17.0 — Kho 10 Bối Cảnh Sống Động 60fps & Bộ Dựng Tự Động Từ JSON
 * - Tái sử dụng StickmanRig (mặt thân thiện V16, bóng thoại đệm >= 30px, Lip-Sync Micro Talk) & KassStageLibrary
 * - Đủ 10 bối cảnh 2D phẳng nét viền đen gọn đẹp đồng nhất V16 (tất cả đều có chuyển động môi trường 60fps)
 * - Đủ 11 động tác diễn xuất liên tục 60fps + 9 đạo cụ cầm tay (handProp) + customProps SVG 200x200 an toàn
 */

import React from "react";
import { StickmanRig, ComicSpeechBubble, isComicBubbleActive } from "./StickmanRig";
import {
  CountrysideYardBackdrop,
  BedroomIndoorBackdrop,
  UndergroundCrossSectionStage,
  ExplainerPolkaDotBackdrop,
  SimpleGrassFieldBackdrop,
} from "./KassStageLibrary";
import { LotusPondBackdrop } from "./TadpoleMovieStages";
import { smoothstep, lerpNum } from "../../lib/v7/universalAnimationStandard";
import {
  sanitizeSvgInner,
  type AutoEpisodeBeat,
  type AutoActorSpec,
  type AutoCustomPropSpec,
  type AutoHandProp,
  type AutoActorExpression,
  type AutoTimeOfDay,
  type AutoWeather,
} from "../../lib/v7/episodeJsonSchema";
import type { EyeExpression, EyebrowExpression, MouthExpression } from "../../remotion/types/character";

function easeOutBack(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

// =============================================================================
// 1. 6 BỐI CẢNH MỚI BỔ SUNG CHO ĐỦ 10 BỐI CẢNH PHỔ QUÁT (100% CÓ CHUYỂN ĐỘNG 60FPS)
// =============================================================================

const CityStreetBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number; groundY: number }> = ({
  timeOfDay,
  frame,
  groundY,
}) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const cloudDrift = frame * 0.18;
  const breeze = Math.sin(frame * 0.04) * 2.2;
  const carX = ((frame * 2.4 + 200) % 2360) - 220;

  const skyTop = isNight ? "#0F172A" : isSunset ? "#F97316" : "#60A5FA";
  const skyMid = isNight ? "#1E293B" : isSunset ? "#FDBA74" : "#BAE6FD";
  const skyBot = isNight ? "#1E293B" : isSunset ? "#FEF3C7" : "#F0F9FF";
  const winGlow = isNight ? "#FEF08A" : "#BAE6FD";

  const buildings = [
    { x: 60, w: 230, h: 360, fill: isNight ? "#334155" : "#FDE68A" },
    { x: 315, w: 260, h: 430, fill: isNight ? "#1E293B" : "#BFDBFE" },
    { x: 605, w: 220, h: 310, fill: isNight ? "#334155" : "#BBF7D0" },
    { x: 1120, w: 250, h: 455, fill: isNight ? "#1E293B" : "#FECACA" },
    { x: 1400, w: 240, h: 350, fill: isNight ? "#334155" : "#DDD6FE" },
    { x: 1665, w: 220, h: 400, fill: isNight ? "#1E293B" : "#FED7AA" },
  ];

  return (
    <g id="stage-city-street">
      <defs>
        <linearGradient id={`city-sky-${timeOfDay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="58%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={760} fill={`url(#city-sky-${timeOfDay})`} />

      {/* Trăng / Mặt trời + Mây trôi 60fps */}
      {isNight ? (
        <g transform="translate(260, 175)">
          <path d="M 10,-44 A 46,46 0 1,0 10,44 A 34,34 0 1,1 10,-44 Z" fill="#FEF08A" stroke="#141414" strokeWidth={2.5} />
        </g>
      ) : (
        <g transform={`translate(${isSunset ? 1560 : 280}, ${isSunset ? 340 : 170})`}>
          <circle cx={0} cy={0} r={78} fill="#FEF08A" opacity={0.34} />
          <circle cx={0} cy={0} r={46} fill={isSunset ? "#FB923C" : "#FDE047"} stroke="#141414" strokeWidth={3} />
        </g>
      )}

      {!isNight &&
        [
          { bx: 240, y: 195, s: 0.95 },
          { bx: 880, y: 205, s: 1.05 },
          { bx: 1480, y: 198, s: 0.9 },
        ].map((c, i) => {
          const cx = ((c.bx + cloudDrift * (0.85 + i * 0.14) + 120) % 2160) - 120;
          return (
            <g key={`city_c_${i}`} transform={`translate(${cx.toFixed(1)}, ${c.y}) scale(${c.s})`}>
              <path
                d="M -68,18 C -86,18 -92,-6 -68,-12 C -62,-38 -22,-44 -6,-24 C 12,-44 54,-36 58,-10 C 82,-6 80,18 58,18 Z"
                fill={isSunset ? "#FFEDD5" : "#FFFFFF"}
                stroke="#141414"
                strokeWidth={3}
              />
            </g>
          );
        })}

      {/* Dãy nhà phố pastel 2D phẳng */}
      {buildings.map((b, bi) => (
        <g key={`bld_${bi}`} stroke="#141414" strokeWidth={3.2} strokeLinejoin="round">
          <rect x={b.x} y={760 - b.h} width={b.w} height={b.h} rx={6} fill={b.fill} />
          <rect x={b.x - 6} y={752 - b.h} width={b.w + 12} height={14} rx={4} fill="#64748B" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => {
              const wx = b.x + 28 + col * ((b.w - 56) / 2.6);
              const wy = 795 - b.h + row * 72;
              if (wy > 680) return null;
              return <rect key={`w_${row}_${col}`} x={wx} y={wy} width={38} height={44} rx={5} fill={winGlow} strokeWidth={2.5} />;
            })
          )}
        </g>
      ))}

      {/* Đèn đường & cây xanh vỉa hè đung đưa 60fps */}
      {[560, 1080, 1620].map((lx, li) => (
        <g key={`lamp_${li}`}>
          <line x1={lx} y1={470} x2={lx} y2={765} stroke="#334155" strokeWidth={8} strokeLinecap="round" />
          <path d={`M ${lx},475 Q ${lx + 24},450 ${lx + 46},468`} fill="none" stroke="#334155" strokeWidth={6} strokeLinecap="round" />
          <circle cx={lx + 46} cy={476} r={12} fill={isNight ? "#FEF08A" : "#E2E8F0"} stroke="#141414" strokeWidth={2.6} />
          {isNight && <polygon points={`${lx + 34},485 ${lx + 58},485 ${lx + 115},765 ${lx - 20},765`} fill="#FEF08A" opacity={0.14} />}
        </g>
      ))}
      {[860, 1380].map((tx, ti) => (
        <g key={`stree_${ti}`} transform={`translate(${tx}, 765)`}>
          <rect x={-10} y={-95} width={20} height={95} fill="#78350F" stroke="#141414" strokeWidth={3} />
          <g transform={`rotate(${(breeze * (ti % 2 === 0 ? 1 : -1)).toFixed(2)}, 0, -90)`}>
            <circle cx={0} cy={-125} r={54} fill={isNight ? "#14532D" : "#22C55E"} stroke="#141414" strokeWidth={3} />
            <circle cx={-34} cy={-106} r={34} fill={isNight ? "#166534" : "#4ADE80"} stroke="#141414" strokeWidth={3} />
            <circle cx={34} cy={-106} r={34} fill={isNight ? "#166534" : "#4ADE80"} stroke="#141414" strokeWidth={3} />
          </g>
        </g>
      ))}

      {/* Chiếc xe hơi hoạt hình chạy êm trên mặt đường xa */}
      <g transform={`translate(${carX.toFixed(1)}, 738)`}>
        <path d="M -52,0 L -42,-28 L 28,-28 L 48,-4 L 62,0 L 62,18 L -58,18 L -58,0 Z" fill="#EF4444" stroke="#141414" strokeWidth={3} strokeLinejoin="round" />
        <rect x={-32} y={-22} width={26} height={18} rx={3} fill="#E0F2FE" stroke="#141414" strokeWidth={2.2} />
        <rect x={2} y={-22} width={24} height={18} rx={3} fill="#E0F2FE" stroke="#141414" strokeWidth={2.2} />
        <circle cx={-32} cy={18} r={12} fill="#1E293B" stroke="#141414" strokeWidth={3} />
        <circle cx={32} cy={18} r={12} fill="#1E293B" stroke="#141414" strokeWidth={3} />
        <circle cx={-32} cy={18} r={4.5} fill="#CBD5E1" />
        <circle cx={32} cy={18} r={4.5} fill="#CBD5E1" />
      </g>

      {/* Vỉa hè sáng & mặt đường nhựa */}
      <rect x={0} y={760} width={1920} height={135} fill={isNight ? "#64748B" : "#CBD5E1"} stroke="#141414" strokeWidth={3} />
      <rect x={0} y={895} width={1920} height={185} fill={isNight ? "#1E293B" : "#475569"} stroke="#141414" strokeWidth={3} />
      <line x1={0} y1={975} x2={1920} y2={975} stroke="#FACC15" strokeWidth={8} strokeDasharray="54 38" />
    </g>
  );
};

const ScienceLabBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number; groundY: number }> = ({
  timeOfDay,
  frame,
  groundY,
}) => {
  const isNight = timeOfDay === "NIGHT";
  const wallFill = isNight ? "#1E293B" : "#E0F2FE";
  const secDeg = (frame * 3) % 360;
  const minDeg = (frame * 0.15 + 45) % 360;

  return (
    <g id="stage-science-lab" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      <rect x={0} y={0} width={1920} height={775} fill={wallFill} stroke="none" />
      {/* Gạch ốp phòng thí nghiệm mờ nhẹ */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`lgv_${i}`} x1={i * 160} y1={0} x2={i * 160} y2={775} stroke="#94A3B8" strokeWidth={1.2} opacity={0.22} />
      ))}
      <rect x={0} y={775} width={1920} height={305} fill={isNight ? "#334155" : "#CBD5E1"} stroke="none" />
      <line x1={0} y1={775} x2={1920} y2={775} stroke="#141414" strokeWidth={3.2} />

      {/* Bảng trắng khoa học chính giữa tường */}
      <g transform="translate(560, 165)">
        <rect x={0} y={0} width={760} height={330} rx={14} fill="#FFFFFF" stroke="#64748B" strokeWidth={9} />
        <rect x={0} y={0} width={760} height={330} rx={14} fill="none" stroke="#141414" strokeWidth={3} />
        {/* Biểu tượng nguyên tử xoay nhẹ 60fps trên bảng */}
        <g transform={`translate(155, 165) rotate(${(frame * 0.5).toFixed(1)})`}>
          <ellipse cx={0} cy={0} rx={72} ry={26} fill="none" stroke="#0284C7" strokeWidth={3.5} />
          <ellipse cx={0} cy={0} rx={72} ry={26} transform="rotate(60)" fill="none" stroke="#0284C7" strokeWidth={3.5} />
          <ellipse cx={0} cy={0} rx={72} ry={26} transform="rotate(-60)" fill="none" stroke="#0284C7" strokeWidth={3.5} />
          <circle cx={0} cy={0} r={14} fill="#FACC15" stroke="#141414" strokeWidth={3} />
        </g>
        {/* Sóng sin & đồ thị thí nghiệm vẽ tay */}
        <path d="M 310,210 Q 375,90 440,210 T 570,210 T 690,150" fill="none" stroke="#10B981" strokeWidth={6} strokeLinecap="round" />
        <line x1={300} y1={260} x2={700} y2={260} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
        <line x1={300} y1={90} x2={300} y2={260} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
      </g>

      {/* Đồng hồ treo tường kim quay 60fps */}
      <g transform="translate(1530, 220)">
        <circle cx={0} cy={0} r={54} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />
        <line x1={0} y1={0} x2={Math.sin((minDeg * Math.PI) / 180) * 28} y2={-Math.cos((minDeg * Math.PI) / 180) * 28} stroke="#141414" strokeWidth={4.5} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin((secDeg * Math.PI) / 180) * 38} y2={-Math.cos((secDeg * Math.PI) / 180) * 38} stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={0} cy={0} r={4.5} fill="#141414" />
      </g>

      {/* Bàn thí nghiệm gọn bên phải (x=1485..1895, thoáng sạch cho nhân vật slot RIGHT đứng cạnh!) */}
      <g transform="translate(1485, 560)">
        <rect x={0} y={100} width={400} height={24} rx={6} fill="#64748B" />
        <rect x={20} y={124} width={20} height={155} fill="#475569" />
        <rect x={360} y={124} width={20} height={155} fill="#475569" />
        {/* Bình tam giác dung dịch xanh lá sủi bọt */}
        <g transform="translate(90, 100)">
          <path d="M -14,-84 L -14,-56 L -44,0 L 44,0 L 14,-56 L 14,-84 Z" fill="#DCFCE7" />
          <path d="M -29,-28 L 29,-28 L 41,-2 L -41,-2 Z" fill="#22C55E" stroke="none" />
          <path d="M -14,-84 L -14,-56 L -44,0 L 44,0 L 14,-56 L 14,-84 Z" fill="none" stroke="#141414" strokeWidth={3.2} />
          {[0, 1, 2].map((bi) => {
            const p = (frame * 0.025 + bi * 0.33) % 1;
            return (
              <circle
                key={`fb_${bi}`}
                cx={-10 + bi * 10}
                cy={lerpNum(-12, -108, p)}
                r={5 + (bi % 2) * 2}
                fill="#86EFAC"
                stroke="#141414"
                strokeWidth={1.8}
                opacity={Math.sin(p * Math.PI)}
              />
            );
          })}
        </g>
        {/* Bình tròn dung dịch xanh dương sủi bọt */}
        <g transform="translate(200, 100)">
          <circle cx={0} cy={-30} r={32} fill="#BAE6FD" />
          <path d="M -29,-20 A 30,30 0 0,0 29,-20 Z" fill="#38BDF8" stroke="none" />
          <rect x={-10} y={-88} width={20} height={30} fill="#E0F2FE" />
          <circle cx={0} cy={-30} r={32} fill="none" stroke="#141414" strokeWidth={3.2} />
          {[0, 1].map((bi) => {
            const p = (frame * 0.022 + bi * 0.5) % 1;
            return (
              <circle
                key={`fb2_${bi}`}
                cx={-5 + bi * 10}
                cy={lerpNum(-22, -112, p)}
                r={5.5}
                fill="#7DD3FC"
                stroke="#141414"
                strokeWidth={1.8}
                opacity={Math.sin(p * Math.PI)}
              />
            );
          })}
        </g>
        {/* Kính hiển vi đơn giản */}
        <g transform="translate(315, 100)">
          <rect x={-36} y={-12} width={72} height={12} rx={4} fill="#334155" />
          <path d="M 10,-12 Q 36,-54 10,-92" fill="none" stroke="#475569" strokeWidth={10} strokeLinecap="round" />
          <rect x={-16} y={-108} width={20} height={62} rx={4} transform="rotate(18, -6, -77)" fill="#E2E8F0" />
          <rect x={-28} y={-36} width={44} height={8} rx={2} fill="#1E293B" />
        </g>
      </g>
    </g>
  );
};

const DoctorClinicBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number; groundY: number }> = ({
  timeOfDay,
  frame,
  groundY,
}) => {
  const isNight = timeOfDay === "NIGHT";
  const wallFill = isNight ? "#1E293B" : "#F0FDF4";
  const cloudX = ((35 + frame * 0.18) % 280) - 20;
  const secDeg = (frame * 3) % 360;

  return (
    <g id="stage-doctor-clinic" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      <rect x={0} y={0} width={1920} height={775} fill={wallFill} stroke="none" />
      <rect x={0} y={775} width={1920} height={305} fill={isNight ? "#334155" : "#E2E8F0"} stroke="none" />
      <line x1={0} y1={775} x2={1920} y2={775} stroke="#141414" strokeWidth={3.2} />

      {/* Cửa sổ sáng có mây trôi 60fps */}
      <g transform="translate(200, 175)">
        <rect x={0} y={0} width={310} height={240} rx={12} fill={isNight ? "#0F172A" : "#7DD3FC"} />
        {!isNight && <ellipse cx={Math.max(46, Math.min(265, cloudX))} cy={82} rx={36} ry={16} fill="#FFFFFF" stroke="none" opacity={0.85} />}
        <line x1={155} y1={0} x2={155} y2={240} strokeWidth={3} />
        <line x1={0} y1={120} x2={310} y2={120} strokeWidth={3} />
        <rect x={0} y={0} width={310} height={240} rx={12} fill="none" stroke="#94A3B8" strokeWidth={8} />
        <rect x={0} y={0} width={310} height={240} rx={12} fill="none" stroke="#141414" strokeWidth={3} />
      </g>

      {/* Biểu tượng chữ thập y tế xanh + Bảng đo thị lực */}
      <g transform="translate(760, 250)">
        <circle cx={0} cy={0} r={66} fill="#FFFFFF" stroke="#10B981" strokeWidth={6} />
        <rect x={-14} y={-38} width={28} height={76} rx={5} fill="#10B981" stroke="#141414" strokeWidth={2.5} />
        <rect x={-38} y={-14} width={76} height={28} rx={5} fill="#10B981" stroke="#141414" strokeWidth={2.5} />
      </g>
      <g transform="translate(960, 170)">
        <rect x={0} y={0} width={210} height={265} rx={10} fill="#FFFFFF" stroke="#141414" strokeWidth={3.5} />
        <text x={105} y={62} textAnchor="middle" fill="#141414" stroke="none" fontSize={44} fontWeight={900}>E</text>
        <text x={105} y={115} textAnchor="middle" fill="#141414" stroke="none" fontSize={30} fontWeight={800}>F P</text>
        <text x={105} y={160} textAnchor="middle" fill="#141414" stroke="none" fontSize={22} fontWeight={700}>T O Z</text>
        <line x1={32} y1={195} x2={178} y2={195} stroke="#EF4444" strokeWidth={4} />
        <line x1={32} y1={225} x2={178} y2={225} stroke="#22C55E" strokeWidth={4} />
      </g>

      {/* Đồng hồ phòng khám kim quay 60fps */}
      <g transform="translate(1395, 225)">
        <circle cx={0} cy={0} r={46} fill="#FFFFFF" stroke="#141414" strokeWidth={3.8} />
        <line x1={0} y1={0} x2={0} y2={-26} stroke="#141414" strokeWidth={4} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin((secDeg * Math.PI) / 180) * 32} y2={-Math.cos((secDeg * Math.PI) / 180) * 32} stroke="#10B981" strokeWidth={2.4} strokeLinecap="round" />
      </g>

      {/* Giường khám y tế bên phải */}
      <g transform="translate(1310, 620)">
        <rect x={0} y={40} width={450} height={42} rx={10} fill="#38BDF8" />
        <ellipse cx={380} cy={30} rx={52} ry={18} fill="#FFFFFF" />
        <rect x={28} y={82} width={18} height={138} fill="#94A3B8" />
        <rect x={404} y={82} width={18} height={138} fill="#94A3B8" />
      </g>
    </g>
  );
};

const SpaceCosmosBackdrop: React.FC<{ frame: number; groundY: number }> = ({ frame, groundY }) => {
  const shootP = (frame % 220) / 40;
  const planetBob = Math.sin(frame * 0.04) * 12;

  return (
    <g id="stage-space-cosmos">
      <defs>
        <linearGradient id="space-cosmos-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#090D1E" />
          <stop offset="55%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#space-cosmos-grad)" />

      {/* Tinh vân mềm dịu */}
      <ellipse cx={420} cy={320} rx={360} ry={165} fill="#7C3AED" opacity={0.16} />
      <ellipse cx={1480} cy={410} rx={410} ry={190} fill="#0284C7" opacity={0.16} />

      {/* Bầu trời sao lấp lánh 60fps */}
      {Array.from({ length: 42 }).map((_, i) => {
        const sx = (i * 197 + 73) % 1880 + 20;
        const sy = (i * 131 + 41) % 720 + 25;
        const tw = 0.35 + Math.abs(Math.sin(frame * (0.05 + (i % 4) * 0.02) + i)) * 0.65;
        return <circle key={`cstar_${i}`} cx={sx} cy={sy} r={2 + (i % 3) * 1.4} fill="#FEF9C3" opacity={tw} />;
      })}

      {/* Sao băng lướt ngang định kỳ */}
      {shootP < 1 && (
        <line
          x1={lerpNum(1580, 920, shootP)}
          y1={lerpNum(110, 340, shootP)}
          x2={lerpNum(1690, 1030, shootP)}
          y2={lerpNum(70, 300, shootP)}
          stroke="#FEF08A"
          strokeWidth={4}
          strokeLinecap="round"
          opacity={Math.sin(shootP * Math.PI)}
        />
      )}

      {/* Trái đất xanh phía xa bên trái */}
      <g transform={`translate(285, ${(260 + planetBob * 0.6).toFixed(1)})`}>
        <circle cx={0} cy={0} r={74} fill="#38BDF8" stroke="#141414" strokeWidth={3.5} />
        <path d="M -38,-22 Q -10,-46 18,-26 Q 32,-6 8,14 Q -24,22 -38,-22 Z" fill="#4ADE80" stroke="#141414" strokeWidth={2.2} />
        <path d="M 22,12 Q 48,18 42,42 Q 16,52 10,32 Z" fill="#4ADE80" stroke="#141414" strokeWidth={2.2} />
      </g>

      {/* Sao Thổ có vành đai bồng bềnh bên phải */}
      <g transform={`translate(1590, ${(255 - planetBob).toFixed(1)}) rotate(-16)`}>
        <ellipse cx={0} cy={0} rx={128} ry={28} fill="none" stroke="#FDE68A" strokeWidth={14} opacity={0.85} />
        <circle cx={0} cy={0} r={62} fill="#FB923C" stroke="#141414" strokeWidth={3.5} />
        <path d="M -126,2 A 128,28 0 0,0 126,2" fill="none" stroke="#FACC15" strokeWidth={10} />
      </g>

      {/* Bề mặt hành tinh/Mặt Trăng cong gọn phía dưới tại groundY = 840 */}
      <path d={`M -40,${groundY + 18} Q 960,${groundY - 46} 1960,${groundY + 18} L 1960,1100 L -40,1100 Z`} fill="#94A3B8" stroke="#141414" strokeWidth={4} />
      <ellipse cx={360} cy={groundY + 62} rx={68} ry={18} fill="#64748B" stroke="#141414" strokeWidth={2.5} />
      <ellipse cx={1420} cy={groundY + 52} rx={84} ry={22} fill="#64748B" stroke="#141414" strokeWidth={2.5} />
      <ellipse cx={960} cy={groundY + 86} rx={52} ry={14} fill="#64748B" stroke="#141414" strokeWidth={2.5} />
    </g>
  );
};

/** Lớp thời tiết động 60fps phủ trên các cảnh ngoài trời (RAIN / STORM / FLOOD) */
const WeatherOverlayLayer: React.FC<{ weather: AutoWeather; frame: number; isOutdoor: boolean }> = ({
  weather,
  frame,
  isOutdoor,
}) => {
  if (!isOutdoor || weather === "CLEAR") return null;
  const isStorm = weather === "STORM";
  const isRain = weather === "RAIN" || isStorm;
  const flash = isStorm && (frame % 150 === 12 || frame % 150 === 14);

  return (
    <g id="universal-weather-overlay">
      {weather === "FLOOD" && (
        <g>
          <rect x={0} y={788} width={1920} height={292} fill="#38BDF8" opacity={0.55} />
          <line x1={0} y1={788} x2={1920} y2={788} stroke="#0369A1" strokeWidth={3.5} />
          {[220, 620, 1020, 1420].map((wx, wi) => {
            const s = Math.sin(frame * 0.06 + wi) * 22;
            return (
              <path
                key={`fw_${wi}`}
                d={`M ${wx + s},826 Q ${wx + 55 + s},816 ${wx + 110 + s},826`}
                fill="none"
                stroke="#E0F2FE"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}
      {isRain && (
        <g stroke="#BAE6FD" strokeLinecap="round">
          {flash && <rect x={0} y={0} width={1920} height={1080} fill="#FEF9C3" opacity={0.28} stroke="none" />}
          {Array.from({ length: isStorm ? 72 : 48 }).map((_, ri) => {
            const bx = ((ri * 199 + (ri % 5) * 37) % 2140) - 40;
            const y = ((ri * 281 + frame * (isStorm ? 28 : 22)) % 1160) - 80;
            const x = bx - y * 0.18;
            return (
              <line
                key={`urain_${ri}`}
                x1={x.toFixed(1)}
                y1={y.toFixed(1)}
                x2={(x - 13).toFixed(1)}
                y2={(y + 42).toFixed(1)}
                strokeWidth={ri % 3 === 0 ? 3 : 2}
                opacity={ri % 3 === 0 ? 0.72 : 0.45}
              />
            );
          })}
        </g>
      )}
    </g>
  );
};

// =============================================================================
// 2. ĐẠO CỤ CẦM TAY (9 HAND PROPS) & ÁNH XẠ BIỂU CẢM V16
// =============================================================================

function mapAutoExpression(expr: AutoActorExpression): {
  eyes: EyeExpression;
  eyebrows: EyebrowExpression;
  mouth: MouthExpression;
  blush: boolean;
  sweatDrop: boolean;
} {
  switch (expr) {
    case "HAPPY":
      return { eyes: "happy", eyebrows: "neutral", mouth: "smile", blush: true, sweatDrop: false };
    case "PROUD":
      return { eyes: "happy", eyebrows: "neutral", mouth: "smile", blush: true, sweatDrop: false };
    case "CURIOUS":
      return { eyes: "curious", eyebrows: "inquisitive", mouth: "smile", blush: false, sweatDrop: false };
    case "THINKING":
      return { eyes: "curious", eyebrows: "inquisitive", mouth: "line", blush: false, sweatDrop: false };
    case "SHOCKED":
      return { eyes: "surprised", eyebrows: "worried", mouth: "gasp", blush: false, sweatDrop: true };
    case "SCARED":
      return { eyes: "wide", eyebrows: "worried", mouth: "circleOpen", blush: false, sweatDrop: true };
    case "TIRED":
      return { eyes: "closed", eyebrows: "worried", mouth: "line", blush: false, sweatDrop: true };
    case "ANGRY":
      return { eyes: "wide", eyebrows: "furrowed", mouth: "circleOpen", blush: false, sweatDrop: false };
    default:
      return { eyes: "happy", eyebrows: "neutral", mouth: "smile", blush: false, sweatDrop: false };
  }
}

const HandPropGraphic: React.FC<{
  prop: AutoHandProp;
  x: number;
  y: number;
  facingDir: 1 | -1;
  isNight: boolean;
  frame: number;
}> = ({ prop, x, y, facingDir, isNight, frame }) => {
  if (prop === "NONE") return null;
  const sway = Math.sin(frame * 0.14) * 6;
  return (
    <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${facingDir}, 1) rotate(${sway.toFixed(1)})`}>
      {prop === "STICK" && (
        <g transform="rotate(-24)">
          <path d="M -10,0 L 112,-4" stroke="#141414" strokeWidth={10} strokeLinecap="round" />
          <path d="M -10,0 L 112,-4" stroke="#92400E" strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={116} cy={-12} rx={11} ry={6} fill="#4ADE80" stroke="#141414" strokeWidth={2.2} />
        </g>
      )}
      {prop === "MAGNIFYING_GLASS" && (
        <g transform="rotate(-32)">
          <line x1={-6} y1={0} x2={52} y2={0} stroke="#141414" strokeWidth={11} strokeLinecap="round" />
          <line x1={-6} y1={0} x2={52} y2={0} stroke="#78350F" strokeWidth={6} strokeLinecap="round" />
          <circle cx={78} cy={0} r={28} fill="#E0F2FE" fillOpacity={0.55} stroke="#141414" strokeWidth={5.5} />
          <path d="M 64,-12 A 16,16 0 0,1 88,-16" fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      {prop === "BUCKET" && (
        <g transform="translate(6, 48)">
          <path d="M -24,-28 Q 0,-52 24,-28" fill="none" stroke="#475569" strokeWidth={3.5} />
          <path d="M -26,-28 L -19,22 Q 0,29 19,22 L 26,-28 Z" fill="#38BDF8" stroke="#141414" strokeWidth={3} />
          <ellipse cx={0} cy={-28} rx={26} ry={7} fill="#0EA5E9" stroke="#141414" strokeWidth={2.6} />
        </g>
      )}
      {prop === "NOTEBOOK" && (
        <g transform="translate(22, -8) rotate(-8)">
          <rect x={-22} y={-28} width={44} height={56} rx={5} fill="#FEF9C3" stroke="#141414" strokeWidth={3} />
          <line x1={-13} y1={-12} x2={14} y2={-12} stroke="#64748B" strokeWidth={2.4} />
          <line x1={-13} y1={2} x2={12} y2={2} stroke="#64748B" strokeWidth={2.4} />
          <line x1={-13} y1={16} x2={10} y2={16} stroke="#64748B" strokeWidth={2.4} />
        </g>
      )}
      {prop === "PHONE" && (
        <g transform="translate(14, -14) rotate(-14)">
          <rect x={-14} y={-24} width={28} height={48} rx={5} fill="#1E293B" stroke="#141414" strokeWidth={3} />
          <rect x={-10} y={-18} width={20} height={34} rx={2} fill="#38BDF8" />
        </g>
      )}
      {prop === "FLASHLIGHT" && (
        <g transform="rotate(-10)">
          <polygon points="48,-12 310,-85 310,62 48,12" fill="#FEF08A" opacity={isNight ? 0.36 : 0.16} />
          <rect x={-10} y={-9} width={48} height={18} rx={5} fill="#FACC15" stroke="#141414" strokeWidth={3} />
          <polygon points="36,-11 52,-15 52,15 36,11" fill="#64748B" stroke="#141414" strokeWidth={3} />
        </g>
      )}
      {prop === "CUP_SODA" && (
        <g transform="translate(16, -6)">
          <path d="M 4,-22 L 10,-44 L 22,-46" fill="none" stroke="#EF4444" strokeWidth={4} strokeLinecap="round" />
          <path d="M -16,-22 L -12,20 L 12,20 L 16,-22 Z" fill="#F97316" stroke="#141414" strokeWidth={3} />
          <rect x={-18} y={-26} width={36} height={8} rx={3} fill="#FFFFFF" stroke="#141414" strokeWidth={2.5} />
        </g>
      )}
      {prop === "NET" && (
        <g transform="rotate(-18)">
          <line x1={-12} y1={0} x2={125} y2={0} stroke="#141414" strokeWidth={9} strokeLinecap="round" />
          <line x1={-12} y1={0} x2={125} y2={0} stroke="#92400E" strokeWidth={5.5} strokeLinecap="round" />
          <ellipse cx={148} cy={0} rx={28} ry={20} fill="#E0F2FE" fillOpacity={0.62} stroke="#141414" strokeWidth={3.2} />
        </g>
      )}
    </g>
  );
};

// =============================================================================
// 3. CUSTOM PROPS 200x200 AN TOÀN VỚI 5 HIỆU ỨNG 60FPS & CALLOUT VÀNG TỐI GIẢN
// =============================================================================

const AnimatedCustomProp: React.FC<{
  prop: AutoCustomPropSpec;
  idx: number;
  frame: number;
  localFrame: number;
}> = ({ prop, idx, frame, localFrame }) => {
  const safeSvg = sanitizeSvgInner(prop.svgInner);
  if (!safeSvg) return null;

  const baseScale = prop.scale ?? 1.0;
  const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1.0;
  let dx = 0;
  let dy = 0;
  let rot = 0;
  let animScale = 1.0;

  switch (prop.animation) {
    case "FLOAT":
      dy = Math.sin(frame * 0.07 + idx * 1.4) * 12;
      break;
    case "PULSE":
      animScale = 1 + Math.sin(frame * 0.1 + idx) * 0.065;
      break;
    case "BOUNCE":
      dy = -Math.abs(Math.sin(frame * 0.12 + idx * 1.1)) * 24;
      break;
    case "SPIN":
      rot = (frame * 1.45 + idx * 45) % 360;
      break;
    case "SHAKE":
      dx = Math.sin(frame * 0.65 + idx) * 5;
      rot = Math.sin(frame * 0.5 + idx) * 4.5;
      break;
    default:
      break;
  }

  const finalScale = baseScale * enter * animScale;

  return (
    <g transform={`translate(${(prop.x + dx).toFixed(1)}, ${(prop.y + dy).toFixed(1)})`}>
      <g transform={`rotate(${rot.toFixed(1)}) scale(${finalScale.toFixed(3)})`}>
        <svg
          x={-100}
          y={-100}
          width={200}
          height={200}
          viewBox="0 0 200 200"
          overflow="visible"
          dangerouslySetInnerHTML={{ __html: safeSvg }}
        />
      </g>
      {prop.label && (
        <g transform={`translate(0, ${(104 * baseScale + 20).toFixed(1)})`}>
          {(() => {
            const w = Math.max(120, Math.min(340, prop.label.length * 14 + 36));
            return (
              <>
                <rect x={-w / 2} y={-20} width={w} height={38} rx={19} fill="#FFFFFF" stroke="#141414" strokeWidth={3} />
                <text
                  x={0}
                  y={6}
                  textAnchor="middle"
                  fill="#141414"
                  fontSize={20}
                  fontWeight={900}
                  fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                >
                  {prop.label}
                </text>
              </>
            );
          })()}
        </g>
      )}
    </g>
  );
};

// =============================================================================
// 4. COMPONENT CHÍNH: UniversalAutoStage (RENDER TOÀN BỘ AUTO EPISODE BEAT 60FPS)
// =============================================================================

export const UniversalAutoStage: React.FC<{
  spec: AutoEpisodeBeat;
  frame: number;
  localFrame: number;
  durationFrames: number;
  u: number;
  groundY?: number;
}> = ({ spec, frame, localFrame, durationFrames, u, groundY = 840 }) => {
  const isNight = spec.timeOfDay === "NIGHT";
  const isOutdoor =
    spec.stageType === "COUNTRYSIDE_YARD" ||
    spec.stageType === "SIMPLE_GRASS_FIELD" ||
    spec.stageType === "CITY_STREET" ||
    spec.stageType === "WATER_POND_OCEAN";

  const slotBaseX = (slot: AutoActorSpec["slot"]): number =>
    slot === "LEFT" ? 490 : slot === "RIGHT" ? 1390 : 960;

  const bubbleAppear = Math.max(24, Math.min(90, Math.round(durationFrames * 0.26)));

  return (
    <g id={`universal-auto-stage-${spec.id}`}>
      {/* 1. BỐI CẢNH (10 BỐI CẢNH SỐNG ĐỘNG 60FPS) */}
      {spec.stageType === "COUNTRYSIDE_YARD" && (
        <CountrysideYardBackdrop timeOfDay={spec.timeOfDay} frame={frame} groundY={groundY} />
      )}
      {spec.stageType === "SIMPLE_GRASS_FIELD" && (
        <SimpleGrassFieldBackdrop
          timeOfDay={spec.timeOfDay}
          frame={frame}
          groundY={groundY}
          weather={spec.weather === "FLOOD" ? "FLOOD" : spec.weather === "RAIN" || spec.weather === "STORM" ? "RAIN" : "CLEAR"}
        />
      )}
      {spec.stageType === "BEDROOM_INDOOR" && (
        <BedroomIndoorBackdrop
          timeOfDay={spec.timeOfDay}
          frame={frame}
          groundY={groundY}
          rainOutside={spec.weather === "RAIN" || spec.weather === "STORM"}
        />
      )}
      {spec.stageType === "CITY_STREET" && (
        <CityStreetBackdrop timeOfDay={spec.timeOfDay} frame={frame} groundY={groundY} />
      )}
      {spec.stageType === "SCIENCE_LAB_ROOM" && (
        <ScienceLabBackdrop timeOfDay={spec.timeOfDay} frame={frame} groundY={groundY} />
      )}
      {spec.stageType === "DOCTOR_CLINIC" && (
        <DoctorClinicBackdrop timeOfDay={spec.timeOfDay} frame={frame} groundY={groundY} />
      )}
      {spec.stageType === "WATER_POND_OCEAN" && (
        <LotusPondBackdrop timeOfDay={spec.timeOfDay} frame={frame} groundY={groundY} />
      )}
      {spec.stageType === "UNDERGROUND_EARTH_CUTAWAY" && (
        <UndergroundCrossSectionStage frame={frame} localFrame={localFrame} showAnts={true} />
      )}
      {spec.stageType === "SPACE_COSMOS" && <SpaceCosmosBackdrop frame={frame} groundY={groundY} />}
      {spec.stageType === "EXPLAINER_POLKA_DOT" && (
        <>
          <ExplainerPolkaDotBackdrop
            palette={spec.timeOfDay === "NIGHT" ? "lavender" : spec.timeOfDay === "SUNSET" ? "mint" : "cream"}
          />
          {/* Khung thẻ trắng tối giản làm nổi bật đạo cụ giải thích của AI */}
          {spec.customProps.length > 0 && spec.actors.length === 0 && (
            <g transform="translate(960, 495)">
              <rect x={-560} y={-255} width={1120} height={495} rx={36} fill="#141414" transform="translate(8, 10)" />
              <rect x={-560} y={-255} width={1120} height={495} rx={36} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
            </g>
          )}
        </>
      )}

      {/* 2. ĐẠO CỤ CHỦ ĐỀ DO AI SINH (customProps 0..2, hoạt ảnh 60fps) */}
      {spec.customProps.map((prop, idx) => (
        <AnimatedCustomProp key={`cprop_${spec.id}_${idx}`} prop={prop} idx={idx} frame={frame} localFrame={localFrame} />
      ))}

      {/* 3. NHÂN VẬT NGƯỜI QUE THUẦN V16 (0..2 ACTORS, 11 ĐỘNG TÁC 60FPS + 9 HAND PROPS) */}
      {spec.actors.map((actor, aIdx) => {
        const baseX = slotBaseX(actor.slot);
        const facingDir: 1 | -1 = actor.facing === "LEFT" ? -1 : 1;
        const expr = mapAutoExpression(actor.expression);
        const isSpeaking = Boolean(actor.bubble && isComicBubbleActive(localFrame, bubbleAppear));

        // Trường hợp đặc biệt SLEEP_BED trên BEDROOM_INDOOR: nằm gọn trên giường ngủ
        if (actor.motion === "SLEEP_BED" && spec.stageType === "BEDROOM_INDOOR") {
          const breathe = Math.sin(frame * 0.08) * 2.5;
          return (
            <g key={`actor_sleep_${aIdx}`}>
              <g transform={`translate(1522, ${(610 + breathe * 0.4).toFixed(1)}) rotate(-12)`}>
                <circle cx={0} cy={0} r={46} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />
                <path
                  d="M -39,-20 C -40,-50 -10,-56 12,-52 C 30,-48 40,-34 39,-20 Q 22,-32 10,-25 Q 0,-36 -12,-24 Q -26,-32 -39,-20 Z"
                  fill="#1E293B"
                  stroke="#141414"
                  strokeWidth={3.2}
                />
                <path d="M -23,-2 Q -15,4 -7,-2" fill="none" stroke="#141414" strokeWidth={3.8} strokeLinecap="round" />
                <path d="M 7,-2 Q 15,4 23,-2" fill="none" stroke="#141414" strokeWidth={3.8} strokeLinecap="round" />
                <path d="M -8,14 Q 0,20 8,14" fill="none" stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
              </g>
              {[0, 1, 2].map((zi) => {
                const p = (frame * 0.015 + zi * 0.33) % 1;
                return (
                  <text
                    key={`szzz_${zi}`}
                    x={1545 + zi * 26}
                    y={545 - p * 85}
                    fill="#FEF08A"
                    stroke="#141414"
                    strokeWidth={4}
                    paintOrder="stroke"
                    fontSize={22 + zi * 6}
                    fontWeight={900}
                    opacity={Math.sin(p * Math.PI)}
                  >
                    Z
                  </text>
                );
              })}
            </g>
          );
        }

        // Tính tọa độ & thông số động học 60fps theo 11 động tác
        let actorX = baseX;
        let pose: "standing" | "walking" | "running" | "jumping" | "crouching" | "pointing" | "waving" = "standing";
        let walkWeight = 0;
        let walkCycle = 0;
        let torsoTiltDeg = 0;
        let flightLift = 0;
        let crouchDepth = 0;
        let waveRightArm = false;
        let waveLeftArm = false;
        let holdingTarget: { leftGrip?: { x: number; y: number }; rightGrip?: { x: number; y: number } } | undefined;

        switch (actor.motion) {
          case "WALK_IN": {
            const startX = actor.slot === "RIGHT" ? baseX + 320 : baseX - 320;
            const wt = smoothstep(0.02, 0.62, u);
            actorX = lerpNum(startX, baseX, wt);
            walkWeight = u <= 0.65 ? Math.min(smoothstep(0.02, 0.1, u), 1 - smoothstep(0.55, 0.65, u)) : 0;
            walkCycle = (Math.abs(actorX - startX) / 160) % 1;
            pose = walkWeight > 0.05 ? "walking" : "standing";
            torsoTiltDeg = walkWeight * 7;
            break;
          }
          case "RUN_CHASE": {
            const startX = actor.facing === "RIGHT" ? Math.max(220, baseX - 240) : Math.min(1680, baseX + 240);
            const endX = actor.facing === "RIGHT" ? Math.min(1620, baseX + 340) : Math.max(280, baseX - 340);
            actorX = lerpNum(startX, endX, smoothstep(0.0, 0.96, u));
            walkCycle = (localFrame / 28) % 1;
            walkWeight = Math.min(smoothstep(0.0, 0.08, u), 1 - smoothstep(0.92, 1.0, u));
            pose = walkWeight > 0.05 ? "running" : "standing";
            torsoTiltDeg = 14 * walkWeight;
            flightLift = Math.max(0, Math.sin(walkCycle * Math.PI * 2)) * 10 * walkWeight;
            break;
          }
          case "WAVE":
            waveRightArm = true;
            break;
          case "THINK_STROLL": {
            const offset = Math.sin(localFrame * 0.032) * 85;
            actorX = baseX + offset;
            walkWeight = 0.72;
            walkCycle = (localFrame / 42) % 1;
            pose = "walking";
            torsoTiltDeg = 4;
            break;
          }
          case "POINT_AT": {
            torsoTiltDeg = 6;
            holdingTarget = { rightGrip: { x: actorX + facingDir * 105, y: groundY - 215 } };
            break;
          }
          case "JUMP_SHOCK": {
            const jp = Math.min(1, localFrame / 36);
            flightLift = Math.sin(jp * Math.PI) * 86;
            pose = jp < 0.9 ? "jumping" : "standing";
            torsoTiltDeg = -10;
            holdingTarget = {
              leftGrip: { x: actorX - 88, y: groundY - 235 - flightLift },
              rightGrip: { x: actorX + 88, y: groundY - 235 - flightLift },
            };
            break;
          }
          case "HOP_PAIN": {
            flightLift = Math.abs(Math.sin(localFrame * 0.22)) * 42;
            torsoTiltDeg = -8;
            break;
          }
          case "SIT_OBSERVE": {
            crouchDepth = 48;
            torsoTiltDeg = 12;
            pose = "crouching";
            break;
          }
          case "CELEBRATE": {
            flightLift = Math.abs(Math.sin(localFrame * 0.16)) * 38;
            waveRightArm = true;
            waveLeftArm = true;
            break;
          }
          default:
            // IDLE_TALK / SLEEP_BED ngoài phòng ngủ
            torsoTiltDeg = 2;
            break;
        }

        // Gắn đạo cụ cầm tay (handProp) khít 0px tại cổ tay phải (nằm dưới vùng an toàn đầu!)
        const activeHandProp: AutoHandProp = actor.handProp || "NONE";
        const handGripX = actorX + facingDir * 82;
        const handGripY = groundY - 208 - flightLift + (crouchDepth * 0.65);
        if (activeHandProp !== "NONE") {
          waveRightArm = false;
          holdingTarget = {
            ...(holdingTarget || {}),
            rightGrip: { x: handGripX, y: handGripY },
          };
        }

        return (
          <g key={`auto_actor_${spec.id}_${aIdx}`}>
            {activeHandProp !== "NONE" && (
              <HandPropGraphic
                prop={activeHandProp}
                x={handGripX}
                y={handGripY}
                facingDir={facingDir}
                isNight={isNight}
                frame={frame}
              />
            )}
            <StickmanRig
              characterPreset={actor.preset}
              frame={frame}
              state={{
                x: actorX,
                y: groundY,
                scale: 0.96,
                facing: actor.facing === "LEFT" ? "left" : "right",
                pose,
                torsoTiltDeg,
                flightLift,
                crouchDepth,
                walkCycleProgress: walkCycle,
                walkWeight,
                waveRightArm,
                waveLeftArm,
                wavePhaseOffset: aIdx * 1.4,
                nodAmplitudeDeg: actor.motion === "IDLE_TALK" || actor.motion === "WAVE" ? 3.2 : 1.5,
                nodFreq: 0.13,
                isSpeaking,
                eyes: actor.motion === "SLEEP_BED" ? "closed" : expr.eyes,
                eyebrows: expr.eyebrows,
                mouth: expr.mouth,
                blush: expr.blush,
                sweatDrop: expr.sweatDrop,
                shiver: Boolean(actor.shiver || actor.motion === "JUMP_SHOCK" || actor.motion === "HOP_PAIN"),
                shiverDarkStage: isNight || spec.stageType === "SPACE_COSMOS",
                shiverFrame: frame,
                holdingTarget,
              }}
            />
            {/* Mũ phi hành gia kính trong căn đúng tâm đầu theo lượng giác góc nghiêng thân */}
            {spec.stageType === "SPACE_COSMOS" && (() => {
              const tRad = (torsoTiltDeg * facingDir * Math.PI) / 180;
              const headWorldX = actorX + Math.sin(tRad) * 169 * 0.96;
              const headWorldY = groundY - flightLift + crouchDepth * 0.85 - (173 + Math.cos(tRad) * 169) * 0.96;
              return (
                <g transform={`translate(${headWorldX.toFixed(1)}, ${headWorldY.toFixed(1)})`}>
                  <circle cx={0} cy={0} r={66} fill="#E0F2FE" fillOpacity={0.22} stroke="#CBD5E1" strokeWidth={5} />
                  <path d="M -36,-35 A 46,46 0 0,1 25,-42" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
                </g>
              );
            })()}
            {actor.bubble && (
              <ComicSpeechBubble
                x={Math.max(220, Math.min(1700, actorX + facingDir * 95))}
                y={groundY - 495 - flightLift * 0.4}
                mouthX={actorX + facingDir * 24}
                mouthY={groundY - 315 - flightLift}
                headTopY={groundY - 405 - flightLift}
                text={actor.bubble}
                localFrame={localFrame}
                appearFrame={bubbleAppear}
              />
            )}
          </g>
        );
      })}

      {/* 4. HIỆU ỨNG THỜI TIẾT ĐỘNG 60FPS */}
      <WeatherOverlayLayer weather={spec.weather} frame={frame} isOutdoor={isOutdoor} />

      {/* 5. NHÃN CALLOUT VÀNG TỐI GIẢN (MINIMALIST CALLOUT POLICY) */}
      {spec.callout && (() => {
        const cx = spec.callout.x ?? 960;
        const cy = spec.callout.y ?? 210;
        const appearF = 14;
        const hideF = Math.max(appearF + 24, durationFrames - 14);
        if (localFrame < appearF) return null;
        const s =
          localFrame < appearF + 12
            ? easeOutBack((localFrame - appearF) / 12)
            : localFrame > hideF
            ? Math.max(0, 1 - (localFrame - hideF) / 12)
            : 1;
        const w = Math.max(180, Math.min(540, spec.callout.text.length * 16 + 52));
        return (
          <g transform={`translate(${cx}, ${cy}) scale(${s.toFixed(3)})`}>
            <rect x={-w / 2 + 5} y={-24} width={w} height={54} rx={18} fill="#141414" />
            <rect x={-w / 2} y={-29} width={w} height={54} rx={18} fill="#FEF08A" stroke="#141414" strokeWidth={3.8} />
            <text
              x={0}
              y={7}
              textAnchor="middle"
              fill="#141414"
              fontSize={24}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {spec.callout.text}
            </text>
          </g>
        );
      })()}
    </g>
  );
};
