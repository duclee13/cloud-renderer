/**
 * UNIVERSAL AUTO STAGE V19.0 — Engine Đa Lớp "Nhất Cử Nhất Động" (20 ActionPoseV18 + Camera Zoom + Topmost SpeechBubble Layer + Auto-Center Solo Explainer + Custom Beat Visuals)
 * - Tương thích ngược 100% với kịch bản JSON V17 (nếu actor không có timeline[] thì vẫn chạy theo motion/slot cũ)
 * - Hỗ trợ Keyframe Action Timeline 60fps liên hoàn: nội suy mượt x, facing, expression, handProp & 20 tư thế ngay trong 1 cảnh
 * - Hỗ trợ Camera Zoom theo beat (fromScale -> toScale, focusX, focusY) mà không làm lệch phụ đề/tiêu đề
 * - V18.4: Viết lại dáng tay TALK_GESTURE & NOD_SMILE tự nhiên (góc khuỷu mở rộng, gật nhẹ 2 nhịp rồi dừng),
 *          tách SpeechBubble lên lớp trên cùng (sau tất cả actors), và tự căn giữa nhân vật đơn trên EXPLAINER_POLKA_DOT không có visualProp.
 * - V19.0: Hỗ trợ hoạt họa minh họa riêng theo từng beat (`beat.customVisual` -> `EPISODE_VISUAL_REGISTRY`), render bên phải (680,150,1120x680)
 *          trên nền sân khấu & dưới SpeechBubble/phụ đề, đồng thời tự động giữ nhân vật đơn ở bên trái (x ≈ 420, quay mặt RIGHT).
 */

import React from "react";
import {
  StickmanRig,
  ComicSpeechBubble,
  isComicBubbleActive,
  computeV18ActionArmsUpper,
  computeGentleDoubleNodDeg,
  computeSipDrinkWave,
  computeStickmanIdleBreathFactor,
  resolveStickmanExpressionPreset,
  enforceRigidTwoBoneIK,
  resolvePresetDefaultScale,
  TORSO_LEN,
  ARM_L1,
  ARM_L2,
} from "./StickmanRig";
import {
  CountrysideYardBackdrop,
  BedroomIndoorBackdrop,
  UndergroundCrossSectionStage,
  ExplainerPolkaDotBackdrop,
  SimpleGrassFieldBackdrop,
} from "./KassStageLibrary";
import { LotusPondBackdrop } from "./TadpoleMovieStages";
import { CuratedAnimatedProp } from "./AutoPropLibrary";
import { EPISODE_VISUAL_REGISTRY, type EpisodeVisualProps } from "./episodeVisuals";
import { resolvePendulumArms } from "../../animscript/motionGraph";
import { smoothstep, lerpNum } from "../../lib/v7/universalAnimationStandard";
import {
  VALID_AUTO_PROP_IDS,
  type AutoEpisodeBeat,
  type AutoActorSpec,
  type AutoHandProp,
  type AutoActorExpression,
  type AutoTimeOfDay,
  type AutoWeather,
  type AutoPropId,
  type ActionPoseV18,
  type ActorKeyframe,
} from "../../lib/v7/episodeJsonSchema";
import type { EyeExpression, EyebrowExpression, MouthExpression, Point2D } from "../../remotion/types/character";

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

      {/* Vỉa hè sáng & mặt đường nhựa (V18.0: vạch kẻ đường đẩy cao & làm dịu opacity=0.32 để phụ đề trắng luôn nổi bật) */}
      <rect x={0} y={760} width={1920} height={135} fill={isNight ? "#64748B" : "#CBD5E1"} stroke="#141414" strokeWidth={3} />
      <rect x={0} y={895} width={1920} height={185} fill={isNight ? "#1E293B" : "#475569"} stroke="#141414" strokeWidth={3} />
      <line x1={0} y1={932} x2={1920} y2={932} stroke="#FACC15" strokeWidth={6} strokeDasharray="54 38" opacity={0.32} />
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

      {/* V20.2: Tủ thuốc kính nhỏ treo sát tường bên phải (trên giường khám, thoáng sạch không che nhân vật) */}
      <g id="clinic-medicine-cabinet" transform="translate(1525, 178)">
        <rect
          x={0}
          y={0}
          width={215}
          height={240}
          rx={10}
          fill={isNight ? "#334155" : "#FFFFFF"}
          stroke="#141414"
          strokeWidth={3.5}
        />
        {/* Khoang tủ kính phía trong */}
        <rect
          x={14}
          y={14}
          width={187}
          height={212}
          rx={6}
          fill={isNight ? "#1E293B" : "#ECFEFF"}
          stroke="#141414"
          strokeWidth={2.4}
        />
        {/* 2 đợt kính ngang */}
        <line x1={14} y1={88} x2={201} y2={88} stroke="#64748B" strokeWidth={3} />
        <line x1={14} y1={158} x2={201} y2={158} stroke="#64748B" strokeWidth={3} />
        {/* Hàng 1: 3 lọ thuốc nhỏ gọn */}
        <rect x={30} y={50} width={22} height={36} rx={4} fill="#F59E0B" stroke="#141414" strokeWidth={2.2} />
        <rect x={33} y={42} width={16} height={8} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={68} y={44} width={24} height={42} rx={4} fill="#38BDF8" stroke="#141414" strokeWidth={2.2} />
        <rect x={72} y={36} width={16} height={8} rx={2} fill="#0F172A" stroke="#141414" strokeWidth={2} />
        <rect x={110} y={54} width={20} height={32} rx={4} fill="#34D399" stroke="#141414" strokeWidth={2.2} />
        <rect x={113} y={47} width={14} height={7} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={148} y={48} width={34} height={38} rx={4} fill="#FFFFFF" stroke="#141414" strokeWidth={2.2} />
        <line x1={165} y1={58} x2={165} y2={76} stroke="#EF4444" strokeWidth={4} />
        <line x1={156} y1={67} x2={174} y2={67} stroke="#EF4444" strokeWidth={4} />
        {/* Hàng 2: 3 lọ thuốc & hộp gạc y tế */}
        <rect x={32} y={122} width={26} height={34} rx={4} fill="#FB7185" stroke="#141414" strokeWidth={2.2} />
        <rect x={36} y={115} width={18} height={7} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={74} y={116} width={22} height={40} rx={4} fill="#A78BFA" stroke="#141414" strokeWidth={2.2} />
        <rect x={77} y={109} width={16} height={7} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={114} y={128} width={68} height={28} rx={4} fill="#FEF08A" stroke="#141414" strokeWidth={2.2} />
        <line x1={124} y1={142} x2={172} y2={142} stroke="#94A3B8" strokeWidth={2.4} />
        {/* Hàng 3: 2 lọ dung dịch & cốc chia vạch */}
        <rect x={38} y={182} width={30} height={42} rx={5} fill="#60A5FA" stroke="#141414" strokeWidth={2.2} />
        <rect x={44} y={174} width={18} height={8} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={86} y={188} width={26} height={36} rx={4} fill="#4ADE80" stroke="#141414" strokeWidth={2.2} />
        <rect x={90} y={181} width={18} height={7} rx={2} fill="#141414" stroke="#141414" strokeWidth={1.8} />
        <rect x={132} y={190} width={48} height={34} rx={4} fill="#F8FAFC" stroke="#141414" strokeWidth={2.2} />
        {/* Vệt phản chiếu mặt kính + tay nắm cửa tủ */}
        <path d="M 32,26 L 68,26 L 44,74 L 22,74 Z" fill="#FFFFFF" stroke="none" opacity={isNight ? 0.14 : 0.42} />
        <line x1={26} y1={110} x2={26} y2={142} stroke="#475569" strokeWidth={4.5} strokeLinecap="round" />
      </g>

      {/* V20.2: Chậu cây xanh nhỏ ở góc trái phòng khám (cân bằng bố cục, không che nhân vật) */}
      <g id="clinic-potted-plant" transform="translate(112, 785)">
        <ellipse cx={0} cy={4} rx={46} ry={10} fill="rgba(15, 23, 42, 0.14)" stroke="none" />
        {/* Tán lá xanh nhiều lớp nhẹ nhàng */}
        <g transform={`rotate(${(Math.sin(frame * 0.03) * 1.4).toFixed(2)}, 0, -78)`}>
          <path
            d="M -4,-74 C -36,-106 -52,-142 -26,-158 C -8,-146 -2,-112 0,-74 Z"
            fill="#16A34A"
            stroke="#141414"
            strokeWidth={2.8}
          />
          <path
            d="M 4,-74 C 36,-108 54,-144 28,-160 C 10,-148 2,-114 0,-74 Z"
            fill="#16A34A"
            stroke="#141414"
            strokeWidth={2.8}
          />
          <path
            d="M -6,-72 C -46,-82 -66,-108 -46,-126 C -26,-124 -12,-98 -4,-72 Z"
            fill="#22C55E"
            stroke="#141414"
            strokeWidth={2.8}
          />
          <path
            d="M 6,-72 C 46,-82 66,-108 46,-126 C 26,-124 12,-98 4,-72 Z"
            fill="#22C55E"
            stroke="#141414"
            strokeWidth={2.8}
          />
          <path
            d="M 0,-74 C -16,-122 -14,-166 0,-182 C 14,-166 16,-122 0,-74 Z"
            fill="#4ADE80"
            stroke="#141414"
            strokeWidth={2.8}
          />
        </g>
        {/* Chậu sứ trắng-xanh gọn gàng */}
        <path d="M -36,-72 L -26,0 L 26,0 L 36,-72 Z" fill={isNight ? "#CBD5E1" : "#FFFFFF"} stroke="#141414" strokeWidth={3.2} />
        <rect x={-42} y={-82} width={84} height={14} rx={5} fill="#10B981" stroke="#141414" strokeWidth={3} />
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

/**
 * V18.2: Bối cảnh Phòng Tiêu Âm (ANECHOIC_CHAMBER)
 * - Tường sau, trần và sàn phủ khối nêm xốp tam giác 3D tối giản tông xám-xanh đậm
 * - Cửa cách âm dày chuyên dụng bên phải
 * - Khi timeOfDay === "NIGHT": tối om thật sự (không bảng trắng, không đèn rực!) để làm nổi nhân vật & tia đèn pin
 */
const AnechoicChamberBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number; groundY: number }> = ({
  timeOfDay,
  frame,
  groundY,
}) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";

  const bgDeep = isNight ? "#050811" : "#111827";
  const wedgeFaceA = isNight ? "#0B1120" : isSunset ? "#313B4F" : "#334155";
  const wedgeFaceB = isNight ? "#0F172A" : isSunset ? "#434E64" : "#475569";
  const wedgeEdge = isNight ? "#1E293B" : "#141414";
  const wedgeHighlight = isNight ? "#172033" : "#64748B";
  const doorOuter = isNight ? "#0B1120" : "#1E293B";
  const doorInner = isNight ? "#111827" : "#334155";
  const floorBg = isNight ? "#070B14" : "#1E293B";
  const gridWire = isNight ? "#1E293B" : "#64748B";
  const ledPulse = 0.45 + 0.55 * Math.sin(frame * 0.09);

  // Lưới khối nêm xốp tam giác 3D phủ tường sau (x = 0..1500, y = 110..770)
  const cols = 10;
  const rows = 5;
  const cellW = 150;
  const cellH = 132;

  return (
    <g id="stage-anechoic-chamber">
      {/* Nền tối sâu của phòng tiêu âm */}
      <rect x={0} y={0} width={1920} height={1080} fill={bgDeep} />

      {/* 1. Hàng nêm xốp tiêu âm tam giác 3D rủ từ trần (y = 0..110) */}
      <g stroke={wedgeEdge} strokeWidth={isNight ? 2 : 3} strokeLinejoin="round">
        {Array.from({ length: 16 }).map((_, ci) => {
          const x0 = ci * 120;
          return (
            <g key={`ceil_w_${ci}`}>
              <polygon points={`${x0},0 ${x0 + 60},108 ${x0 + 60},0`} fill={wedgeFaceB} />
              <polygon points={`${x0 + 60},0 ${x0 + 60},108 ${x0 + 120},0`} fill={wedgeFaceA} />
            </g>
          );
        })}
      </g>

      {/* Đèn thanh trần dịu nhẹ (CHỈ bật khi không phải NIGHT; ban đêm tắt hẳn tối om thật sự!) */}
      {!isNight && (
        <g opacity={isSunset ? 0.55 : 0.72}>
          <rect x={420} y={12} width={280} height={10} rx={5} fill={isSunset ? "#FDE68A" : "#BAE6FD"} />
          <rect x={920} y={12} width={280} height={10} rx={5} fill={isSunset ? "#FDE68A" : "#BAE6FD"} />
          <polygon points="420,22 700,22 860,340 260,340" fill={isSunset ? "#FEF08A" : "#93C5FD"} opacity={0.07} />
          <polygon points="920,22 1200,22 1360,340 760,340" fill={isSunset ? "#FEF08A" : "#93C5FD"} opacity={0.07} />
        </g>
      )}

      {/* 2. Tường sau phủ kín mô-đun nêm xốp 3D xen kẽ ngang-dọc chuẩn phòng tiêu âm */}
      <g stroke={wedgeEdge} strokeWidth={isNight ? 1.8 : 2.6} strokeLinejoin="round">
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => {
            const bx = c * cellW;
            const by = 110 + r * cellH;
            const isVertical = (r + c) % 2 === 0;
            return (
              <g key={`wall_mod_${r}_${c}`} transform={`translate(${bx}, ${by})`}>
                <rect x={0} y={0} width={cellW} height={cellH} fill={bgDeep} />
                {isVertical ? (
                  [0, 1, 2].map((w) => {
                    const wx = w * 50;
                    return (
                      <g key={`vw_${w}`}>
                        <polygon points={`${wx},0 ${wx + 25},14 ${wx + 25},${cellH - 14} ${wx},${cellH}`} fill={wedgeFaceB} />
                        <polygon points={`${wx + 25},14 ${wx + 50},0 ${wx + 50},${cellH} ${wx + 25},${cellH - 14}`} fill={wedgeFaceA} />
                        <line x1={wx + 25} y1={14} x2={wx + 25} y2={cellH - 14} stroke={wedgeHighlight} strokeWidth={isNight ? 1 : 2} />
                      </g>
                    );
                  })
                ) : (
                  [0, 1, 2].map((w) => {
                    const wy = w * 44;
                    return (
                      <g key={`hw_${w}`}>
                        <polygon points={`0,${wy} 14,${wy + 22} ${cellW - 14},${wy + 22} ${cellW},${wy}`} fill={wedgeFaceB} />
                        <polygon points={`14,${wy + 22} 0,${wy + 44} ${cellW},${wy + 44} ${cellW - 14},${wy + 22}`} fill={wedgeFaceA} />
                        <line x1={14} y1={wy + 22} x2={cellW - 14} y2={wy + 22} stroke={wedgeHighlight} strokeWidth={isNight ? 1 : 2} />
                      </g>
                    );
                  })
                )}
              </g>
            );
          })
        )}
      </g>

      {/* 3. Cửa cách âm dày nặng bên phải (x = 1525..1855, y = 215..770) */}
      <g transform="translate(1525, 215)" stroke={wedgeEdge} strokeWidth={isNight ? 2.5 : 4} strokeLinejoin="round">
        {/* Khung thép dày & gioăng cao su cách âm */}
        <rect x={0} y={0} width={330} height={555} rx={10} fill={doorOuter} />
        <rect x={18} y={18} width={294} height={528} rx={6} fill={doorInner} />
        {/* Nêm xốp gắn ngay trên mặt cửa cách âm */}
        {[0, 1, 2, 3].map((dw) => {
          const dy = 38 + dw * 114;
          return (
            <g key={`dw_${dw}`}>
              <polygon points={`36,${dy} 165,${dy + 42} 294,${dy} 294,${dy + 94} 165,${dy + 52} 36,${dy + 94}`} fill={wedgeFaceA} strokeWidth={isNight ? 1.6 : 2.4} />
              <line x1={36} y1={dy + 47} x2={294} y2={dy + 47} stroke={wedgeHighlight} strokeWidth={isNight ? 1 : 2} />
            </g>
          );
        })}
        {/* Tay nắm khóa áp suất inox bên trái cửa */}
        <rect x={28} y={258} width={22} height={74} rx={6} fill={isNight ? "#1E293B" : "#94A3B8"} />
        <rect x={36} y={286} width={58} height={18} rx={7} fill={isNight ? "#334155" : "#CBD5E1"} />
        {/* Đèn báo trạng thái nhỏ xíu (chấm LED dịu, hoàn toàn không gây chói ban đêm) */}
        <circle cx={165} cy={-24} r={7} fill={isNight ? "#1E3A8A" : "#38BDF8"} opacity={ledPulse} stroke={wedgeEdge} strokeWidth={2} />
      </g>

      {/* 4. Sàn lưới thép treo + khối nêm xốp sàn bên dưới (y = 770..1080) */}
      <rect x={0} y={770} width={1920} height={310} fill={floorBg} />
      {/* Hàng đỉnh nêm xốp nhấp nhô dưới sàn lưới */}
      <g stroke={wedgeEdge} strokeWidth={isNight ? 1.5 : 2.2} opacity={isNight ? 0.55 : 0.78}>
        {Array.from({ length: 20 }).map((_, fi) => {
          const fx = fi * 96;
          return (
            <polygon
              key={`flr_w_${fi}`}
              points={`${fx},1080 ${fx + 48},868 ${fx + 96},1080`}
              fill={fi % 2 === 0 ? wedgeFaceA : wedgeFaceB}
            />
          );
        })}
      </g>
      {/* Sàn đi bộ lưới cáp căng phẳng tại groundY (840) */}
      <rect x={0} y={770} width={1920} height={110} fill={isNight ? "#0B1120" : "#334155"} fillOpacity={0.74} />
      <line x1={0} y1={770} x2={1920} y2={770} stroke={wedgeEdge} strokeWidth={3.5} />
      <line x1={0} y1={880} x2={1920} y2={880} stroke={wedgeEdge} strokeWidth={3.5} />
      {/* Đường lưới cáp mảnh */}
      {[792, 816, 840, 864].map((gy) => (
        <line key={`glh_${gy}`} x1={0} y1={gy} x2={1920} y2={gy} stroke={gridWire} strokeWidth={1.5} opacity={0.42} />
      ))}
      {Array.from({ length: 24 }).map((_, gi) => (
        <line key={`glv_${gi}`} x1={gi * 84} y1={770} x2={gi * 84 - 28} y2={880} stroke={gridWire} strokeWidth={1.5} opacity={0.36} />
      ))}

      {/* Lớp phủ tối đêm sâu cho cảm giác phòng tiêu âm tắt đèn tối om thật sự */}
      {isNight && <rect x={0} y={0} width={1920} height={1080} fill="#020617" opacity={0.46} />}
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
  return resolveStickmanExpressionPreset(expr);
}

const HandPropGraphic: React.FC<{
  prop: AutoHandProp;
  x: number;
  y: number;
  facingDir: 1 | -1;
  isNight: boolean;
  frame: number;
  extraTiltDeg?: number;
  propScale?: number;
  isSipping?: boolean;
}> = ({ prop, x, y, facingDir, isNight, frame, extraTiltDeg = 0, propScale = 1.0, isSipping = false }) => {
  if (prop === "NONE") return null;
  const sway = isSipping ? extraTiltDeg : Math.abs(extraTiltDeg) > 0.1 ? extraTiltDeg : Math.sin(frame * 0.14) * 6;
  return (
    <g
      transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${(facingDir * propScale).toFixed(
        3
      )}, ${propScale.toFixed(3)}) rotate(${sway.toFixed(1)})`}
    >
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
        <g transform={isSipping ? "translate(8, 10)" : "translate(12, -6)"}>
          {/* V20.0: Thân ly đặt gọn ngoài biên má/cằm (0px đè mặt) và ống hút xoay gập VÀO PHÍA MIỆNG chạm trực tiếp tâm miệng tròn nhỏ (o) khi SIP_DRINK */}
          <path
            d={isSipping ? "M -2,-22 L -5,-34 L -69.5,-42.0" : "M -2,-22 L -8,-40 L -24,-36"}
            fill="none"
            stroke="#EF4444"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M -15,-22 L -11,18 L 11,18 L 15,-22 Z" fill="#F97316" stroke="#141414" strokeWidth={3} />
          <rect x={-17} y={-26} width={34} height={8} rx={3} fill="#FFFFFF" stroke="#141414" strokeWidth={2.5} />
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
// 3. BỐ TRÍ TỌA ĐỘ THÔNG MINH CHO KHO 16 ĐẠO CỤ VECTOR 60FPS + BÓNG SUY NGHĨ NGOÀI TRỜI (V18.0)
// =============================================================================

const VALID_RENDERABLE_PROP_SET = new Set<string>(
  VALID_AUTO_PROP_IDS.filter((id) => id !== "NONE")
);

/** Chuẩn hóa `visualProp` (cắt khoảng trắng, viết hoa, kiểm tra hợp lệ) để đồng nhất giữa render đạo cụ & tự căn giữa EXPLAINER_POLKA_DOT */
export function normalizeVisualPropId(rawProp?: string | null): AutoPropId {
  if (typeof rawProp !== "string") return "NONE";
  const key = rawProp.trim().toUpperCase();
  return VALID_RENDERABLE_PROP_SET.has(key) ? (key as AutoPropId) : "NONE";
}

function resolveCuratedPropPlacement(spec: AutoEpisodeBeat): {
  propId: AutoPropId;
  x: number;
  y: number;
  scale: number;
  inThoughtBubble: boolean;
  tailSide: -1 | 0 | 1;
} {
  const propId: AutoPropId = normalizeVisualPropId(spec.visualProp);
  if (propId === "NONE") {
    return { propId: "NONE", x: 960, y: 360, scale: 1, inThoughtBubble: false, tailSide: 0 };
  }

  // MOON_STARS luôn đặt trên bầu trời hoặc khung cửa sổ
  if (propId === "MOON_STARS") {
    if (spec.stageType === "BEDROOM_INDOOR") {
      return { propId, x: 420, y: 222, scale: 0.78, inThoughtBubble: false, tailSide: 0 };
    }
    if (spec.stageType === "DOCTOR_CLINIC") {
      return { propId, x: 355, y: 288, scale: 0.76, inThoughtBubble: false, tailSide: 0 };
    }
    return { propId, x: 1520, y: 215, scale: 0.94, inThoughtBubble: false, tailSide: 0 };
  }

  // V18.0 Fix #1: Trên các bối cảnh ngoài trời có nhà/cây (COUNTRYSIDE_YARD, SIMPLE_GRASS_FIELD, CITY_STREET),
  // đặt visualProp trong bóng suy nghĩ tròn nền trắng viền đen mềm ở vùng trời trống (x=960, y=230),
  // KHÔNG BAO GIỜ đè lên mái ngói, tòa nhà hay tán cây xoài!
  const isOutdoorWithBuildingsOrTrees =
    spec.stageType === "COUNTRYSIDE_YARD" ||
    spec.stageType === "SIMPLE_GRASS_FIELD" ||
    spec.stageType === "CITY_STREET";
  if (isOutdoorWithBuildingsOrTrees) {
    const firstSlot = spec.actors[0]?.slot;
    const tailSide: -1 | 0 | 1 = firstSlot === "LEFT" ? -1 : firstSlot === "RIGHT" ? 1 : 0;
    return {
      propId,
      x: 960,
      y: 230,
      scale: 0.8,
      inThoughtBubble: true,
      tailSide,
    };
  }

  // Cảnh EXPLAINER_POLKA_DOT không có nhân vật: đặt chính giữa khung thẻ trắng
  if (spec.stageType === "EXPLAINER_POLKA_DOT" && spec.actors.length === 0) {
    return { propId, x: 960, y: 495, scale: 1.45, inThoughtBubble: false, tailSide: 0 };
  }

  if (spec.actors.length === 0) {
    return { propId, x: 960, y: 465, scale: 1.25, inThoughtBubble: false, tailSide: 0 };
  }

  if (spec.actors.length >= 2) {
    const hasApproach = spec.actors.some((a) => a.motion === "APPROACH_OTHER");
    return {
      propId,
      x: hasApproach ? 1320 : 960,
      y: hasApproach ? 310 : 320,
      scale: 0.98,
      inThoughtBubble: false,
      tailSide: 0,
    };
  }

  // Cảnh có 1 nhân vật: đặt đối diện nhân vật để cân bằng bố cục
  const onlySlot = spec.actors[0].slot;
  if (onlySlot === "LEFT") {
    return { propId, x: 1190, y: 365, scale: 1.08, inThoughtBubble: false, tailSide: 0 };
  }
  if (onlySlot === "RIGHT") {
    return { propId, x: 710, y: 365, scale: 1.08, inThoughtBubble: false, tailSide: 0 };
  }
  return { propId, x: 1360, y: 350, scale: 1.02, inThoughtBubble: false, tailSide: 0 };
}

/** V18.2: Số frame nội suy mượt các khớp tay/thân khi chuyển keyframe liền kề (10 frames ≈ 0.167s @ 60fps) */
const V18_POSE_BLEND_FRAMES = 10;

interface V18ArmPoseJoints {
  leftElbow: Point2D;
  leftWrist: Point2D;
  rightElbow: Point2D;
  rightWrist: Point2D;
  allowNearHead: boolean;
}

interface V18PoseSnapshot {
  actorX: number;
  effectiveFacing: "LEFT" | "RIGHT";
  pose: "standing" | "walking" | "running" | "jumping" | "crouching" | "pointing" | "waving";
  walkWeight: number;
  walkCycle: number;
  torsoTiltDeg: number;
  headTiltDeg: number;
  flightLift: number;
  crouchDepth: number;
  anticipationScaleY: number;
  turnScaleX: number;
  v18ActionPose?: ActionPoseV18;
  arms: V18ArmPoseJoints;
  hasCustomV18Arms: boolean;
  handPropTiltDeg: number;
  activeShiver: boolean;
  activeHandProp: AutoHandProp;
  overrideEyes?: EyeExpression;
  overrideEyebrows?: EyebrowExpression;
  overrideMouth?: MouthExpression;
  sweepSin: number;
  sipWave: number;
}

function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

function wrapAngleRad(a: number): number {
  let diff = ((a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function lerpAngleRad(a: number, b: number, t: number): number {
  return a + wrapAngleRad(b - a) * t;
}

/**
 * V18.4–V20.0: Nội suy cánh tay 2 đốt theo không gian góc khớp FK (góc bắp tay + góc gập khuỷu tương đối `fore - upper`),
 * bảo toàn cứng ARM_L1=65 / ARM_L2=58 ở mọi frame trung gian và mở khớp khuỷu tự nhiên khi chuyển từ các pose giơ cao
 * như SIP_DRINK / FACEPALM sang NOD_SMILE / TALK_GESTURE (0% lật khuỷu qua ngực).
 */
export function blendArmJointsFK(
  prevElbow: Point2D,
  prevWrist: Point2D,
  currElbow: Point2D,
  currWrist: Point2D,
  t: number
): { elbow: Point2D; wrist: Point2D } {
  const sh: Point2D = { x: 0, y: -TORSO_LEN };
  const pRigid = enforceRigidTwoBoneIK(sh, prevWrist, ARM_L1, ARM_L2, -1, prevElbow);
  const cRigid = enforceRigidTwoBoneIK(sh, currWrist, ARM_L1, ARM_L2, -1, currElbow);
  const pUpper = Math.atan2(pRigid.joint.x - sh.x, pRigid.joint.y - sh.y);
  const pFore = Math.atan2(pRigid.end.x - pRigid.joint.x, pRigid.end.y - pRigid.joint.y);
  const cUpper = Math.atan2(cRigid.joint.x - sh.x, cRigid.joint.y - sh.y);
  const cFore = Math.atan2(cRigid.end.x - cRigid.joint.x, cRigid.end.y - cRigid.joint.y);
  const pFlex = wrapAngleRad(pFore - pUpper);
  const cFlex = wrapAngleRad(cFore - cUpper);
  const uAngle = lerpAngleRad(pUpper, cUpper, t);
  const fAngle = uAngle + lerpNum(pFlex, cFlex, t);
  const elbow: Point2D = {
    x: sh.x + ARM_L1 * Math.sin(uAngle),
    y: sh.y + ARM_L1 * Math.cos(uAngle),
  };
  const wrist: Point2D = {
    x: elbow.x + ARM_L2 * Math.sin(fAngle),
    y: elbow.y + ARM_L2 * Math.cos(fAngle),
  };
  return { elbow, wrist };
}

/** Tính vị trí tay con lắc mặc định (dùng cho WALK/RUN/TURN_AROUND làm điểm gốc cho blendPose 10 frames!) */
function computePendulumArmJoints(walkCycle: number, walkWeight: number, isRunning: boolean): V18ArmPoseJoints {
  const sy = -TORSO_LEN;
  const p = resolvePendulumArms(walkCycle * Math.PI * 2, walkWeight, 1, isRunning);
  return {
    leftElbow: { x: p.leftArm.elbowRel.x, y: sy + p.leftArm.elbowRel.y },
    leftWrist: { x: p.leftArm.handRel.x, y: sy + p.leftArm.handRel.y },
    rightElbow: { x: p.rightArm.elbowRel.x, y: sy + p.rightArm.elbowRel.y },
    rightWrist: { x: p.rightArm.handRel.x, y: sy + p.rightArm.handRel.y },
    allowNearHead: false,
  };
}

/** V18.2–V18.4: Nội suy mượt khớp tay (góc FK) / thân / đầu / vị trí trong 10 frames đầu của keyframe mới (easeOutCubic) */
function blendPose(prev: V18PoseSnapshot, curr: V18PoseSnapshot, rawT: number): V18PoseSnapshot {
  const t = easeOutCubic(rawT);
  const sameFacing = prev.effectiveFacing === curr.effectiveFacing;
  const blendedArms: V18ArmPoseJoints = sameFacing
    ? (() => {
        const left = blendArmJointsFK(
          prev.arms.leftElbow,
          prev.arms.leftWrist,
          curr.arms.leftElbow,
          curr.arms.leftWrist,
          t
        );
        const right = blendArmJointsFK(
          prev.arms.rightElbow,
          prev.arms.rightWrist,
          curr.arms.rightElbow,
          curr.arms.rightWrist,
          t
        );
        return {
          leftElbow: left.elbow,
          leftWrist: left.wrist,
          rightElbow: right.elbow,
          rightWrist: right.wrist,
          allowNearHead: prev.arms.allowNearHead || curr.arms.allowNearHead,
        };
      })()
    : curr.arms;
  return {
    ...curr,
    actorX: lerpNum(prev.actorX, curr.actorX, t),
    torsoTiltDeg: lerpNum(prev.torsoTiltDeg, curr.torsoTiltDeg, t),
    headTiltDeg: lerpNum(prev.headTiltDeg, curr.headTiltDeg, t),
    flightLift: lerpNum(prev.flightLift, curr.flightLift, t),
    crouchDepth: lerpNum(prev.crouchDepth, curr.crouchDepth, t),
    walkWeight: lerpNum(prev.walkWeight, curr.walkWeight, t),
    handPropTiltDeg: lerpNum(prev.handPropTiltDeg, curr.handPropTiltDeg, t),
    arms: blendedArms,
    hasCustomV18Arms: sameFacing ? (prev.hasCustomV18Arms || curr.hasCustomV18Arms) : curr.hasCustomV18Arms,
  };
}

/** V18.2: Tính toàn bộ động học 60fps của 1 keyframe (đủ 19 ActionPoseV18, 6-frame TURN_AROUND, 4-frame anticipation squash) */
function evaluateV18KeyframeKinematics(
  kf: ActorKeyframe,
  prevKf: ActorKeyframe | null,
  segU: number,
  segLocalFrame: number,
  frame: number,
  defaultHandProp: AutoHandProp,
  defaultShiver: boolean
): V18PoseSnapshot {
  const easeX = smoothstep(0, 1, segU);
  const moveDist = Math.abs(kf.endX - kf.startX);

  let actorX = lerpNum(kf.startX, kf.endX, easeX);
  let effectiveFacing: "LEFT" | "RIGHT" = kf.facing;
  let activeHandProp: AutoHandProp = kf.handProp !== undefined ? kf.handProp : defaultHandProp;
  let activeShiver = Boolean(kf.shiver ?? defaultShiver);
  let pose: V18PoseSnapshot["pose"] = "standing";
  let walkWeight = 0;
  let walkCycle = 0;
  let torsoTiltDeg = 0;
  let headTiltDeg = 0;
  let flightLift = 0;
  let crouchDepth = 0;
  let anticipationScaleY = 1.0;
  let turnScaleX = 1.0;
  let v18ActionPose: ActionPoseV18 | undefined;
  let handPropTiltDeg = 0;
  let overrideEyes: EyeExpression | undefined;
  let overrideEyebrows: EyebrowExpression | undefined;
  let overrideMouth: MouthExpression | undefined;
  let sweepSin = 0;
  let sipWave = 0;

  // V19.1: Chặn tuyệt đối lỗi đi bộ / chạy tại chỗ (Moonwalk) — nếu WALK/RUN mà |endX - startX| < 10
  // thì tự động chuyển về đứng yên tự nhiên (TALK_GESTURE) với walkWeight = 0.
  const effectivePose: ActionPoseV18 =
    (kf.pose === "WALK" || kf.pose === "RUN") && moveDist < 10 ? "TALK_GESTURE" : kf.pose;

  switch (effectivePose) {
    case "WALK": {
      walkCycle = (Math.abs(actorX - kf.startX) / 145) % 1;
      walkWeight = Math.min(smoothstep(0, 0.1, segU), 1 - smoothstep(0.9, 1.0, segU));
      pose = walkWeight > 0.05 ? "walking" : "standing";
      torsoTiltDeg = 6.5 * walkWeight;
      break;
    }
    case "RUN": {
      walkCycle = (Math.abs(actorX - kf.startX) / 165) % 1;
      walkWeight = Math.min(smoothstep(0, 0.08, segU), 1 - smoothstep(0.92, 1.0, segU));
      pose = walkWeight > 0.05 ? "running" : "standing";
      torsoTiltDeg = 16 * walkWeight;
      flightLift = Math.max(0, Math.sin(walkCycle * Math.PI * 2)) * 12 * walkWeight;
      break;
    }
    case "TURN_AROUND": {
      // V18.2: Lật mặt cực nhanh trong đúng 6 frames (0.1s) thay vì ép dẹt kéo dài cả chặng!
      const oldFacing = prevKf ? prevKf.facing : kf.facing === "RIGHT" ? "LEFT" : "RIGHT";
      if (oldFacing !== kf.facing && segLocalFrame < 6) {
        const turnT = Math.max(0, Math.min(1, segLocalFrame / 6));
        const cosTurn = Math.cos(turnT * Math.PI);
        if (turnT < 0.5) {
          effectiveFacing = oldFacing;
          turnScaleX = Math.max(0.32, cosTurn);
        } else {
          effectiveFacing = kf.facing;
          turnScaleX = Math.max(0.32, -cosTurn);
        }
        torsoTiltDeg = Math.sin(turnT * Math.PI) * 5;
        headTiltDeg = Math.sin(turnT * Math.PI) * 7;
      } else {
        effectiveFacing = kf.facing;
        turnScaleX = 1.0;
      }
      break;
    }
    case "CROUCH_LOOK": {
      // V18.3: Bỏ dáng gập gối hình chữ Z kỳ quặc — giữ hai chân đứng thẳng tự nhiên, hơi nghiêng thân 12° + đầu hơi cúi nhìn mục tiêu
      crouchDepth = 0;
      pose = "standing";
      torsoTiltDeg = 12;
      headTiltDeg = 10 + Math.sin(frame * 0.09) * 2.5;
      v18ActionPose = "CROUCH_LOOK";
      break;
    }
    case "REACH_GRAB": {
      const reachT = smoothstep(0, 0.55, segU);
      torsoTiltDeg = 16 * reachT;
      headTiltDeg = 4 * reachT;
      v18ActionPose = "REACH_GRAB";
      break;
    }
    case "POINT_UP": {
      torsoTiltDeg = -3;
      headTiltDeg = -13;
      v18ActionPose = "POINT_UP";
      break;
    }
    case "POINT_FORWARD": {
      torsoTiltDeg = 6;
      v18ActionPose = "POINT_FORWARD";
      break;
    }
    case "SCRATCH_HEAD": {
      // V20.2: Làm chậm nhịp nghiêng đầu đồng bộ với tay gãi đầu từ tốn
      torsoTiltDeg = 2;
      headTiltDeg = -10 + Math.sin(frame * 0.09) * 2.5;
      v18ActionPose = "SCRATCH_HEAD";
      break;
    }
    case "FACEPALM": {
      torsoTiltDeg = 6;
      headTiltDeg = 12 + Math.sin(frame * 0.1) * 2;
      v18ActionPose = "FACEPALM";
      break;
    }
    case "JUMP_BACK": {
      // V20.1: Giật mình phản xạ tự nhiên, hết xiêu vẹo — hai chân đứng vững trên mặt đất (flightLift = 0),
      // hơi chùng gối nhẹ tự nhiên (crouchDepth 10px -> 6px), hai tay đưa nhẹ ngang ngực góc khuỷu mở rộng 110°–130°
      const dipT = Math.max(0, Math.min(1, segLocalFrame / 16));
      const startlePulse = Math.sin(dipT * Math.PI);
      flightLift = 0;
      pose = "standing";
      crouchDepth = 6 + 4 * startlePulse;
      anticipationScaleY = 1 - 0.025 * startlePulse;
      torsoTiltDeg = -1.5 - 3.5 * startlePulse;
      if (moveDist < 4) {
        const initDir: 1 | -1 = kf.facing === "LEFT" ? -1 : 1;
        actorX = Math.max(180, Math.min(1740, kf.startX - initDir * smoothstep(0, 0.25, segU) * 36));
      }
      activeShiver = true;
      v18ActionPose = "JUMP_BACK";
      break;
    }
    case "ARMS_UP_CHEER": {
      // V18.2: 4 frames nhún lấy đà (scaleY = 0.92) trước khi bật nhảy ăn mừng!
      if (segLocalFrame < 4) {
        const antT = Math.sin(((segLocalFrame + 1) / 4) * Math.PI);
        anticipationScaleY = 1 - 0.08 * antT;
        crouchDepth = 14 * antT;
        flightLift = 0;
        pose = "crouching";
      } else {
        flightLift = Math.abs(Math.sin((segLocalFrame - 4) * 0.16)) * 34;
        torsoTiltDeg = -3;
      }
      v18ActionPose = "ARMS_UP_CHEER";
      break;
    }
    case "SIP_DRINK": {
      // V20.0: Nâng ly nước lên sát cằm/miệng (ngoài biên má), hơi nghiêng đầu & ly về phía miệng để đầu ống hút chạm trực tiếp miệng tròn nhỏ (o)
      sipWave = computeSipDrinkWave(segLocalFrame);
      torsoTiltDeg = 2 * sipWave;
      headTiltDeg = 4 * sipWave;
      handPropTiltDeg = -10 * sipWave;
      overrideMouth = "sip";
      if (activeHandProp === "NONE") activeHandProp = "CUP_SODA";
      v18ActionPose = "SIP_DRINK";
      break;
    }
    case "WRITE_NOTE": {
      torsoTiltDeg = 8;
      headTiltDeg = 12;
      if (activeHandProp === "NONE") activeHandProp = "NOTEBOOK";
      v18ActionPose = "WRITE_NOTE";
      break;
    }
    case "SWEEP_LIGHT": {
      sweepSin = Math.sin(segLocalFrame * 0.11);
      torsoTiltDeg = 6;
      headTiltDeg = sweepSin * 14;
      handPropTiltDeg = sweepSin * 26;
      if (activeHandProp === "NONE") activeHandProp = "FLASHLIGHT";
      v18ActionPose = "SWEEP_LIGHT";
      break;
    }
    case "PAT_SHOULDER": {
      torsoTiltDeg = 7;
      v18ActionPose = "PAT_SHOULDER";
      break;
    }
    case "STRETCH_YAWN": {
      const stretchP = Math.sin(Math.min(1, Math.max(0.15, segU)) * Math.PI);
      torsoTiltDeg = -7 * stretchP;
      headTiltDeg = -10 * stretchP;
      overrideMouth = "gasp";
      if (stretchP > 0.35) overrideEyes = "closed";
      v18ActionPose = "STRETCH_YAWN";
      break;
    }
    case "SHIVER_PANIC": {
      crouchDepth = 0;
      torsoTiltDeg = -4;
      activeShiver = true;
      overrideEyes = "wide";
      overrideEyebrows = "worried";
      overrideMouth = "worried";
      v18ActionPose = "SHIVER_PANIC";
      break;
    }
    case "TALK_GESTURE": {
      // V18.4: Nhịp thân và đầu chậm rãi tự nhiên, đồng bộ với sóng sin tay chậm (frame * 0.055)
      torsoTiltDeg = 2 + Math.sin(frame * 0.055) * 1.4;
      headTiltDeg = Math.sin(frame * 0.08) * 2.2;
      v18ActionPose = "TALK_GESTURE";
      break;
    }
    case "NOD_SMILE": {
      // V18.4: Cả 2 tay thả lỏng tự nhiên xuôi bên hông (không vung vẩy), chỉ gật đầu nhẹ 2 nhịp êm ái rồi dừng hẳn
      torsoTiltDeg = 1.5;
      headTiltDeg = computeGentleDoubleNodDeg(segLocalFrame);
      overrideMouth = "smile";
      v18ActionPose = "NOD_SMILE";
      break;
    }
    default:
      break;
  }

  const v18Arms = v18ActionPose
    ? computeV18ActionArmsUpper(v18ActionPose, false, { x: 0, y: -TORSO_LEN }, frame, segLocalFrame, segU)
    : null;
  const arms: V18ArmPoseJoints = v18Arms ?? computePendulumArmJoints(walkCycle, walkWeight, pose === "running");

  return {
    actorX,
    effectiveFacing,
    pose,
    walkWeight,
    walkCycle,
    torsoTiltDeg,
    headTiltDeg,
    flightLift,
    crouchDepth,
    anticipationScaleY,
    turnScaleX,
    v18ActionPose,
    arms,
    hasCustomV18Arms: Boolean(v18Arms),
    handPropTiltDeg,
    activeShiver,
    activeHandProp,
    overrideEyes,
    overrideEyebrows,
    overrideMouth,
    sweepSin,
    sipWave,
  };
}

/** V18.0: Tìm keyframe đang hoạt động trong timeline[] theo tiến độ p (0..1) */
function resolveActiveTimelineKeyframe(
  timeline: ActorKeyframe[],
  p: number
): { kf: ActorKeyframe; prevKf: ActorKeyframe | null; prevPrevKf: ActorKeyframe | null; index: number; segU: number } {
  let activeIdx = 0;
  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i];
    if (p >= item.fromPct && p <= item.toPct) {
      activeIdx = i;
      break;
    }
    if (p > item.toPct) {
      activeIdx = i;
    }
  }
  const kf = timeline[activeIdx];
  const prevKf = activeIdx > 0 ? timeline[activeIdx - 1] : null;
  const prevPrevKf = activeIdx > 1 ? timeline[activeIdx - 2] : null;
  const span = kf.toPct - kf.fromPct;
  const segU = span > 1e-4 ? Math.max(0, Math.min(1, (p - kf.fromPct) / span)) : 1;
  return { kf, prevKf, prevPrevKf, index: activeIdx, segU };
}

/** V18.0–V20.0: Chiếu tọa độ cổ tay trong hệ trục thân trên StickmanRig sang tọa độ SVG toàn cục (khít 0px với đạo cụ cầm tay kể cả khi thở!) */
function projectUpperLocalToWorld(
  localPt: { x: number; y: number },
  hipY: number,
  torsoTiltDeg: number,
  actorX: number,
  groundY: number,
  scaleX: number,
  facingDir: 1 | -1,
  scaleY: number = scaleX
): { x: number; y: number } {
  const rad = (torsoTiltDeg * Math.PI) / 180;
  const cosT = Math.cos(rad);
  const sinT = Math.sin(rad);
  const rx = localPt.x * cosT - localPt.y * sinT;
  const ry = hipY + localPt.x * sinT + localPt.y * cosT;
  return {
    x: actorX + rx * scaleX * facingDir,
    y: groundY + ry * scaleY,
  };
}

/** V19.0: Vùng hiển thị sạch bên phải sân khấu cho hoạt họa minh họa riêng của beat (customVisual) */
export const CUSTOM_VISUAL_STAGE_RECT = {
  left: 680,
  top: 150,
  width: 1120,
  height: 680,
} as const;

/** V20.0: Vùng hiển thị tràn toàn màn hình 1920x1080 cho hoạt họa khi beat.fullScreenVisual === true */
export const CUSTOM_VISUAL_FULLSCREEN_RECT = {
  left: 0,
  top: 0,
  width: 1920,
  height: 1080,
} as const;

/** V19.0: Tọa độ X mặc định giữ nhân vật đơn ở bên trái khi beat có customVisual bên phải */
export const SOLO_CUSTOM_VISUAL_ACTOR_X = 420;

/** V19.0: Tra cứu component hoạt họa minh họa riêng theo `beat.customVisual` trong `EPISODE_VISUAL_REGISTRY` */
export function resolveCustomVisualComponent(
  customVisual?: string | null
): React.FC<EpisodeVisualProps> | null {
  if (typeof customVisual !== "string") return null;
  const key = customVisual.trim();
  if (!key) return null;
  if (!Object.prototype.hasOwnProperty.call(EPISODE_VISUAL_REGISTRY, key)) {
    return null;
  }
  return EPISODE_VISUAL_REGISTRY[key] ?? null;
}

/**
 * V20.0: Xác định beat có render hoạt họa tràn toàn màn hình 1920x1080 hay không:
 * chỉ bật khi `beat.fullScreenVisual === true` VÀ `beat.customVisual` khớp trong `EPISODE_VISUAL_REGISTRY`.
 */
export function isFullScreenCustomVisualBeat(spec: AutoEpisodeBeat): boolean {
  return Boolean(spec.fullScreenVisual === true && resolveCustomVisualComponent(spec.customVisual));
}

/**
 * V19.0–V20.0: Khi beat có `customVisual` hợp lệ trong registry (chế độ khung bên phải V19, KHÔNG bật fullScreenVisual)
 * và chỉ có 1 nhân vật, tự động giữ nhân vật ở bên trái (`x ≈ 420`, quay mặt `RIGHT`) để không đè lên hình minh họa bên phải.
 */
export function shouldPinSoloActorLeftForCustomVisual(spec: AutoEpisodeBeat): boolean {
  return (
    Boolean(resolveCustomVisualComponent(spec.customVisual)) &&
    spec.fullScreenVisual !== true &&
    Array.isArray(spec.actors) &&
    spec.actors.length === 1
  );
}

/**
 * V18.4–V19.0: Khi beat dùng EXPLAINER_POLKA_DOT, chỉ có 1 nhân vật và KHÔNG có visualProp / customVisual,
 * tự động căn nhân vật vào khu vực giữa khung hình (x ≈ 960) để chống trống 70% màn hình.
 */
export function shouldCenterSoloExplainerBeat(spec: AutoEpisodeBeat): boolean {
  const hasVisualProp = normalizeVisualPropId(spec.visualProp) !== "NONE";
  const hasCustomVisual = Boolean(resolveCustomVisualComponent(spec.customVisual));
  return (
    spec.stageType === "EXPLAINER_POLKA_DOT" &&
    Array.isArray(spec.actors) &&
    spec.actors.length === 1 &&
    !hasVisualProp &&
    !hasCustomVisual
  );
}

/**
 * V18.4: Tìm mốc bắt đầu (fromPct) của chuỗi keyframe liên tiếp cùng pose (vd: NOD_SMILE | NOD_SMILE trong b10/b11/b36/b42/b43)
 * để nhịp gật đầu 2 lần của NOD_SMILE KHÔNG bị reset gật lại giữa chừng khi chia thành 2 segment liền nhau.
 */
export function resolveContiguousPoseRunStartPct(
  timeline: ActorKeyframe[],
  activeIndex: number
): number {
  if (!timeline || activeIndex < 0 || activeIndex >= timeline.length) return 0;
  const pose = timeline[activeIndex].pose;
  let j = activeIndex;
  while (j > 0 && timeline[j - 1].pose === pose) {
    j--;
  }
  return timeline[j].fromPct;
}

function computeSoloActorAnchorX(timeline: ActorKeyframe[]): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const kf of timeline) {
    if (kf.pose === "WALK" || kf.pose === "RUN") continue;
    const dur = Math.max(0.05, kf.toPct - kf.fromPct);
    const midX = (kf.startX + kf.endX) * 0.5;
    weightedSum += midX * dur;
    totalWeight += dur;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : timeline[timeline.length - 1].endX;
}

/**
 * V18.4: Tính độ dịch ngang để đưa vị trí đứng diễn chủ đạo của timeline về giữa khung hình (x = 960),
 * giữ nguyên quãng đường di chuyển và nhịp bước chân (walkCycle).
 */
export function computeSoloExplainerCenterShiftX(timeline: ActorKeyframe[]): number {
  if (!timeline || timeline.length === 0) return 0;
  return 960 - computeSoloActorAnchorX(timeline);
}

export function centerSoloExplainerTimeline(timeline: ActorKeyframe[]): ActorKeyframe[] {
  const shiftX = computeSoloExplainerCenterShiftX(timeline);
  if (Math.abs(shiftX) < 1e-3) return timeline;
  return timeline.map((kf) => ({
    ...kf,
    startX: Math.max(180, Math.min(1740, Math.round(kf.startX + shiftX))),
    endX: Math.max(180, Math.min(1740, Math.round(kf.endX + shiftX))),
  }));
}

/**
 * V19.0: Dịch chuyển timeline của nhân vật đơn về bên trái (`x ≈ 420`, kẹp an toàn trong 180..560)
 * và quay mặt sang phải (`RIGHT`) khi beat có hoạt họa minh họa riêng bên phải (`customVisual`).
 */
export function pinSoloCustomVisualTimeline(timeline: ActorKeyframe[]): ActorKeyframe[] {
  if (!timeline || timeline.length === 0) return timeline;
  const shiftX = SOLO_CUSTOM_VISUAL_ACTOR_X - computeSoloActorAnchorX(timeline);
  return timeline.map((kf) => ({
    ...kf,
    startX: Math.max(180, Math.min(560, Math.round(kf.startX + shiftX))),
    endX: Math.max(180, Math.min(560, Math.round(kf.endX + shiftX))),
    facing: "RIGHT",
  }));
}

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
  fps?: number;
}> = ({ spec, frame, localFrame, durationFrames, u, groundY = 840, fps = 60 }) => {
  const isNight = spec.timeOfDay === "NIGHT";
  const isOutdoor =
    spec.stageType === "COUNTRYSIDE_YARD" ||
    spec.stageType === "SIMPLE_GRASS_FIELD" ||
    spec.stageType === "CITY_STREET" ||
    spec.stageType === "WATER_POND_OCEAN";

  const slotBaseX = (slot: AutoActorSpec["slot"]): number =>
    slot === "LEFT" ? 490 : slot === "RIGHT" ? 1390 : 960;

  const sceneProgressP = Math.max(0, Math.min(1, localFrame / Math.max(1, durationFrames)));
  const CustomVisualComponent = resolveCustomVisualComponent(spec.customVisual);
  const hasCustomVisual = Boolean(CustomVisualComponent);
  const isFullScreenCustomVisual = Boolean(CustomVisualComponent && spec.fullScreenVisual === true);

  // V20.0: Chế độ hoạt họa tràn màn hình 1920x1080 — ẩn toàn bộ nền sân khấu mặc định, actors, thời tiết, speechBubble & callout vàng.
  // Phụ đề phía dưới (zIndex 60) và chapterBanner phía trên (zIndex 45) vẫn do V7MovieComposition giữ ở layer trên cùng.
  if (isFullScreenCustomVisual && CustomVisualComponent) {
    return (
      <g id={`universal-auto-stage-${spec.id}`} data-fullscreen-visual="true">
        <g id={`layer-custom-visual-fullscreen-${spec.id}`}>
          <foreignObject
            x={CUSTOM_VISUAL_FULLSCREEN_RECT.left}
            y={CUSTOM_VISUAL_FULLSCREEN_RECT.top}
            width={CUSTOM_VISUAL_FULLSCREEN_RECT.width}
            height={CUSTOM_VISUAL_FULLSCREEN_RECT.height}
            style={{ overflow: "hidden" }}
          >
            <div
              className="v20-fullscreen-visual-host"
              style={{
                width: `${CUSTOM_VISUAL_FULLSCREEN_RECT.width}px`,
                height: `${CUSTOM_VISUAL_FULLSCREEN_RECT.height}px`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <style>{`.v20-fullscreen-visual-host > div { width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; } .v20-fullscreen-visual-host > svg, .v20-fullscreen-visual-host > div > svg:only-child { width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; display: block; }`}</style>
              <CustomVisualComponent
                progress={sceneProgressP}
                frame={localFrame}
                fps={fps}
                step={spec.visualStep ?? 0}
                visualStep={spec.visualStep ?? 0}
              />
            </div>
          </foreignObject>
        </g>
      </g>
    );
  }

  const propPlacement = resolveCuratedPropPlacement(spec);
  const pinSoloActorLeft = shouldPinSoloActorLeftForCustomVisual(spec);
  const centerSoloExplainer = shouldCenterSoloExplainerBeat(spec);

  // V18.0–V18.4 Camera Zoom mượt theo spec.camera (mặc định zoom nhẹ 1.0 -> 1.03 quanh focusX/focusY; phụ đề & tiêu đề luôn cố định)
  const isDramaticOrActive =
    spec.bgmMood === "BGM_TENSE_PULSE" ||
    spec.stageType === "EXPLAINER_POLKA_DOT" ||
    spec.actors.some((a) => (a.timeline && a.timeline.length > 0) || a.motion !== "IDLE_TALK");
  const camFromScale = spec.camera?.fromScale ?? 1.0;
  const camToScale = spec.camera?.toScale ?? (isDramaticOrActive ? 1.03 : 1.018);
  const camFocusX = centerSoloExplainer ? 960 : (spec.camera?.focusX ?? 960);
  const camFocusY = spec.camera?.focusY ?? 520;
  const camZoom = lerpNum(camFromScale, camToScale, smoothstep(0.0, 1.0, u));

  // ===========================================================================
  // PASS 1 (V18.3): Tính động học + 10-frame Smooth Pose Blending + Tỷ lệ trẻ con/người lớn (BOY=0.76, Adult=1.0)
  // Hỗ trợ tối đa 3 nhân vật cùng lúc trên sân khấu!
  // ===========================================================================

  interface ResolvedActorRenderData {
    actor: AutoActorSpec;
    aIdx: number;
    actorScale: number;
    isLieSleepMode: boolean;
    sleepAnchorX: number;
    bubbleAppear: number;
    bubbleDisappear: number;
    isSpeaking: boolean;
    isActivelyTalkingPose: boolean;
    actorX: number;
    headWorldY: number;
    effectiveFacing: "LEFT" | "RIGHT";
    activeExprEnum: AutoActorExpression;
    activeHandProp: AutoHandProp;
    activeShiver: boolean;
    shiverOpacity: number;
    pose: V18PoseSnapshot["pose"];
    walkWeight: number;
    walkCycle: number;
    torsoTiltDeg: number;
    headTiltDeg: number;
    flightLift: number;
    crouchDepth: number;
    anticipationScaleY: number;
    waveRightArm: boolean;
    waveLeftArm: boolean;
    handsOnHips: boolean;
    turnScaleX: number;
    v18ActionPose?: ActionPoseV18;
    v18SegmentProgress: number;
    v18LocalFrame: number;
    blendedArmPose?: V18ArmPoseJoints;
    handPropTiltDeg: number;
    overrideEyes?: EyeExpression;
    overrideEyebrows?: EyebrowExpression;
    overrideMouth?: MouthExpression;
    holdingTarget?: { leftGrip?: { x: number; y: number }; rightGrip?: { x: number; y: number } };
    handGripX: number;
    handGripY: number;
    writePenWorld: { x: number; y: number } | null;
    sweepSin: number;
    sipWave: number;
  }

  const resolvedActors: ResolvedActorRenderData[] = spec.actors.map((actor, aIdx) => {
    const actorScale = resolvePresetDefaultScale(actor.preset); // V18.3: BOY=0.76, Người lớn=1.0
    const baseX = pinSoloActorLeft
      ? SOLO_CUSTOM_VISUAL_ACTOR_X
      : centerSoloExplainer
      ? 960
      : slotBaseX(actor.slot);
    const effectiveTimeline =
      actor.timeline && actor.timeline.length > 0
        ? pinSoloActorLeft
          ? pinSoloCustomVisualTimeline(actor.timeline)
          : centerSoloExplainer
          ? centerSoloExplainerTimeline(actor.timeline)
          : actor.timeline
        : null;
    const hasTimeline = Boolean(effectiveTimeline && effectiveTimeline.length > 0);
    const timelineResolved = hasTimeline
      ? resolveActiveTimelineKeyframe(effectiveTimeline!, sceneProgressP)
      : null;

    const bubbleStartPct = actor.bubbleStartPct ?? 0.15;
    const bubbleEndPct = actor.bubbleEndPct ?? 0.9;
    const bubbleAppear = Math.max(4, Math.round(durationFrames * bubbleStartPct));
    const bubbleDisappear = Math.max(bubbleAppear + 12, Math.round(durationFrames * bubbleEndPct));
    const isSpeaking = Boolean(
      actor.bubble && isComicBubbleActive(localFrame, bubbleAppear, bubbleDisappear)
    );

    const isLieSleepMode =
      (timelineResolved && timelineResolved.kf.pose === "LIE_SLEEP") ||
      (!timelineResolved && actor.motion === "SLEEP_BED");

    if (isLieSleepMode) {
      const sleepAnchorX = timelineResolved ? timelineResolved.kf.endX : baseX;
      return {
        actor,
        aIdx,
        actorScale,
        isLieSleepMode: true,
        sleepAnchorX,
        bubbleAppear,
        bubbleDisappear,
        isSpeaking,
        isActivelyTalkingPose: false,
        actorX: sleepAnchorX,
        headWorldY: 610,
        effectiveFacing: actor.facing,
        activeExprEnum: actor.expression,
        activeHandProp: "NONE",
        activeShiver: false,
        shiverOpacity: 0,
        pose: "standing",
        walkWeight: 0,
        walkCycle: 0,
        torsoTiltDeg: 0,
        headTiltDeg: 0,
        flightLift: 0,
        crouchDepth: 0,
        anticipationScaleY: 1.0,
        waveRightArm: false,
        waveLeftArm: false,
        handsOnHips: false,
        turnScaleX: 1.0,
        v18SegmentProgress: 0.5,
        v18LocalFrame: localFrame,
        handPropTiltDeg: 0,
        handGripX: sleepAnchorX,
        handGripY: 610,
        writePenWorld: null,
        sweepSin: 0,
        sipWave: 0,
      };
    }

    let actorX = baseX;
    let effectiveFacing: "LEFT" | "RIGHT" = pinSoloActorLeft ? "RIGHT" : actor.facing;
    let activeExprEnum: AutoActorExpression = actor.expression;
    let activeHandProp: AutoHandProp = actor.handProp || "NONE";
    let activeShiver = Boolean(actor.shiver);
    let pose: V18PoseSnapshot["pose"] = "standing";
    let walkWeight = 0;
    let walkCycle = 0;
    let torsoTiltDeg = 0;
    let headTiltDeg = 0;
    let flightLift = 0;
    let crouchDepth = 0;
    let anticipationScaleY = 1.0;
    let waveRightArm = false;
    let waveLeftArm = false;
    let handsOnHips = false;
    let turnScaleX = 1.0;
    let v18ActionPose: ActionPoseV18 | undefined;
    let v18SegmentProgress = 0.5;
    let v18LocalFrame = localFrame;
    let blendedArmPose: V18ArmPoseJoints | undefined;
    let handPropTiltDeg = 0;
    let overrideEyes: EyeExpression | undefined;
    let overrideEyebrows: EyebrowExpression | undefined;
    let overrideMouth: MouthExpression | undefined;
    let holdingTarget: { leftGrip?: { x: number; y: number }; rightGrip?: { x: number; y: number } } | undefined;
    let sweepSin = 0;
    let sipWave = 0;

    if (timelineResolved) {
      const { kf, prevKf, prevPrevKf, index, segU } = timelineResolved;
      const segLocalFrame = Math.max(0, localFrame - Math.round(kf.fromPct * durationFrames));
      // V18.4: Với chuỗi NOD_SMILE nối tiếp (vd: b10/b11/b36/b42/b43), giữ nguyên mốc thời gian từ đầu chuỗi để chỉ gật đúng 2 nhịp rồi dừng!
      const poseLocalFrame =
        kf.pose === "NOD_SMILE"
          ? Math.max(
              0,
              localFrame - Math.round(resolveContiguousPoseRunStartPct(effectiveTimeline!, index) * durationFrames)
            )
          : segLocalFrame;
      v18SegmentProgress = segU;
      v18LocalFrame = poseLocalFrame;
      activeExprEnum = kf.expression;

      let snap = evaluateV18KeyframeKinematics(
        kf,
        prevKf,
        segU,
        poseLocalFrame,
        frame,
        actor.handProp || "NONE",
        Boolean(actor.shiver)
      );

      // V18.2–V18.4 Smooth Joint Blending: Nội suy mượt (easeOutCubic + góc FK) 10 frames đầu giữa keyframe k và keyframe k+1!
      if (index > 0 && prevKf && prevKf.pose !== "LIE_SLEEP" && segLocalFrame < V18_POSE_BLEND_FRAMES) {
        const prevStartPct =
          prevKf.pose === "NOD_SMILE"
            ? resolveContiguousPoseRunStartPct(effectiveTimeline!, index - 1)
            : prevKf.fromPct;
        const prevDurFrames = Math.max(1, Math.round((prevKf.toPct - prevStartPct) * durationFrames));
        const prevSnap = evaluateV18KeyframeKinematics(
          prevKf,
          prevPrevKf,
          1.0,
          prevDurFrames,
          frame,
          actor.handProp || "NONE",
          Boolean(actor.shiver)
        );
        const blendT = segLocalFrame / V18_POSE_BLEND_FRAMES;
        snap = blendPose(prevSnap, snap, blendT);
        if (snap.hasCustomV18Arms) {
          blendedArmPose = snap.arms;
        }
      } else if (snap.hasCustomV18Arms) {
        blendedArmPose = snap.arms;
      }

      actorX = snap.actorX;
      effectiveFacing = snap.effectiveFacing;
      pose = snap.pose;
      walkWeight = snap.walkWeight;
      walkCycle = snap.walkCycle;
      torsoTiltDeg = snap.torsoTiltDeg;
      headTiltDeg = snap.headTiltDeg;
      flightLift = snap.flightLift;
      crouchDepth = snap.crouchDepth;
      anticipationScaleY = snap.anticipationScaleY;
      turnScaleX = snap.turnScaleX;
      v18ActionPose = snap.v18ActionPose;
      handPropTiltDeg = snap.handPropTiltDeg;
      activeShiver = snap.activeShiver;
      activeHandProp = snap.activeHandProp;
      overrideEyes = snap.overrideEyes;
      overrideEyebrows = snap.overrideEyebrows;
      overrideMouth = snap.overrideMouth;
      sweepSin = snap.sweepSin;
      sipWave = snap.sipWave;
    } else {
      // NHÁNH V17 LEGACY (100% tương thích ngược)
      const partner = spec.actors.length > 1 ? spec.actors[aIdx === 0 ? 1 : 0] : undefined;
      const partnerBaseX = partner ? slotBaseX(partner.slot) : 960;

      switch (actor.motion) {
        case "WALK_IN": {
          const walkFromLeft =
            pinSoloActorLeft ||
            actor.slot === "LEFT" ||
            (actor.slot === "CENTER" && actor.facing === "RIGHT");
          const startX = walkFromLeft ? baseX - 320 : baseX + 320;
          const wt = smoothstep(0.0, 0.45, u);
          actorX = lerpNum(startX, baseX, wt);
          walkWeight = u <= 0.47 ? Math.min(smoothstep(0.0, 0.07, u), 1 - smoothstep(0.38, 0.47, u)) : 0;
          walkCycle = (Math.abs(actorX - startX) / 140) % 1;
          pose = walkWeight > 0.05 ? "walking" : "standing";
          torsoTiltDeg = walkWeight * 7.5;
          if (u < 0.44) {
            effectiveFacing = startX < baseX ? "RIGHT" : "LEFT";
          }
          break;
        }
        case "RUN_CHASE": {
          const runRight = actor.facing === "RIGHT";
          const startX = runRight ? Math.max(180, baseX - 240) : Math.min(1740, baseX + 240);
          const endX = runRight ? Math.min(1740, startX + 480) : Math.max(180, startX - 480);
          actorX = lerpNum(startX, endX, smoothstep(0.0, 0.96, u));
          walkCycle = (localFrame / 20) % 1;
          walkWeight = Math.min(smoothstep(0.0, 0.06, u), 1 - smoothstep(0.92, 1.0, u));
          pose = walkWeight > 0.05 ? "running" : "standing";
          torsoTiltDeg = 15 * walkWeight;
          flightLift = Math.max(0, Math.sin(walkCycle * Math.PI * 2)) * 12 * walkWeight;
          effectiveFacing = runRight ? "RIGHT" : "LEFT";
          break;
        }
        case "WAVE":
          waveRightArm = true;
          break;
        case "THINK_STROLL": {
          const phase = localFrame * 0.034 + aIdx * 1.3;
          const offset = Math.sin(phase) * 130;
          const velocityX = Math.cos(phase);
          actorX = Math.max(200, Math.min(1720, baseX + offset));
          effectiveFacing = velocityX >= 0 ? "RIGHT" : "LEFT";
          const turnSmooth = Math.min(1, Math.abs(velocityX) * 2.4);
          walkWeight = 0.35 + 0.55 * turnSmooth;
          walkCycle = (localFrame / 32) % 1;
          pose = "walking";
          torsoTiltDeg = 5 * turnSmooth;
          break;
        }
        case "POINT_AT": {
          torsoTiltDeg = 6;
          const pDir: 1 | -1 = effectiveFacing === "LEFT" ? -1 : 1;
          holdingTarget = { rightGrip: { x: actorX + pDir * 105, y: groundY - 215 } };
          break;
        }
        case "JUMP_SHOCK": {
          // V18.3: Tiết chế giật mình tự nhiên (-20px trong 15 frames = 0.25s rồi tiếp đất đứng vững ngay!)
          if (localFrame < 15) {
            const jp = localFrame / 15;
            flightLift = Math.sin(jp * Math.PI) * 20;
            pose = "jumping";
            torsoTiltDeg = -7 * Math.sin(jp * Math.PI);
          } else {
            flightLift = 0;
            pose = "standing";
            torsoTiltDeg = -2;
          }
          const initDir: 1 | -1 = actor.facing === "LEFT" ? -1 : 1;
          const recoilT = smoothstep(0.0, 0.28, u);
          actorX = Math.max(180, Math.min(1740, baseX - initDir * recoilT * 60));
          activeShiver = true;
          break;
        }
        case "APPROACH_OTHER": {
          if (partner) {
            const bothApproach = partner.motion === "APPROACH_OTHER";
            if (bothApproach && aIdx === 0) {
              const dirToPartner = partnerBaseX >= baseX ? 1 : -1;
              const targetX = baseX + dirToPartner * 140;
              const wt = smoothstep(0.0, 0.36, u);
              actorX = lerpNum(baseX, targetX, wt);
              effectiveFacing = dirToPartner > 0 ? "RIGHT" : "LEFT";
              walkWeight = u <= 0.38 ? Math.min(smoothstep(0.0, 0.07, u), 1 - smoothstep(0.3, 0.38, u)) : 0;
              walkCycle = (Math.abs(actorX - baseX) / 135) % 1;
              pose = walkWeight > 0.05 ? "walking" : "standing";
              torsoTiltDeg = walkWeight * 6;
            } else {
              const receiverAnchorX =
                bothApproach && aIdx === 1
                  ? partnerBaseX + (baseX >= partnerBaseX ? 140 : -140)
                  : partnerBaseX;
              const dirToReceiver = receiverAnchorX >= baseX ? 1 : -1;
              const stopX = receiverAnchorX - dirToReceiver * 142;
              const wt = smoothstep(0.0, 0.52, u);
              actorX = lerpNum(baseX, stopX, wt);
              effectiveFacing = dirToReceiver > 0 ? "RIGHT" : "LEFT";
              walkWeight = u <= 0.54 ? Math.min(smoothstep(0.0, 0.07, u), 1 - smoothstep(0.44, 0.54, u)) : 0;
              walkCycle = (Math.abs(actorX - baseX) / 140) % 1;
              pose = walkWeight > 0.05 ? "walking" : "standing";
              torsoTiltDeg = walkWeight * 7 + (1 - walkWeight) * 4;
              const reachT = smoothstep(0.42, 0.62, u);
              if (reachT > 0.02) {
                holdingTarget = {
                  rightGrip: {
                    x: actorX + dirToReceiver * (74 + reachT * 36),
                    y: groundY - 210 - reachT * 26,
                  },
                };
              }
            }
          } else if (pinSoloActorLeft) {
            const startX = 260;
            const stopX = SOLO_CUSTOM_VISUAL_ACTOR_X;
            const wt = smoothstep(0.0, 0.45, u);
            actorX = lerpNum(startX, stopX, wt);
            effectiveFacing = "RIGHT";
            walkWeight = u <= 0.47 ? Math.min(smoothstep(0.0, 0.07, u), 1 - smoothstep(0.38, 0.47, u)) : 0;
            walkCycle = (Math.abs(actorX - startX) / 140) % 1;
            pose = walkWeight > 0.05 ? "walking" : "standing";
            torsoTiltDeg = walkWeight * 7;
          } else if (centerSoloExplainer) {
            const startX = actor.slot === "RIGHT" ? 1140 : 780;
            const stopX = 960;
            const dirToCenter: 1 | -1 = stopX >= startX ? 1 : -1;
            const wt = smoothstep(0.0, 0.45, u);
            actorX = lerpNum(startX, stopX, wt);
            effectiveFacing = dirToCenter > 0 ? "RIGHT" : "LEFT";
            walkWeight = u <= 0.47 ? Math.min(smoothstep(0.0, 0.07, u), 1 - smoothstep(0.38, 0.47, u)) : 0;
            walkCycle = (Math.abs(actorX - startX) / 140) % 1;
            pose = walkWeight > 0.05 ? "walking" : "standing";
            torsoTiltDeg = walkWeight * 7;
          } else {
            const stopX = baseX < 960 ? 820 : 1100;
            const dirToCenter: 1 | -1 = stopX >= baseX ? 1 : -1;
            const wt = smoothstep(0.0, 0.45, u);
            actorX = lerpNum(baseX, stopX, wt);
            effectiveFacing = dirToCenter > 0 ? "RIGHT" : "LEFT";
            walkWeight = u <= 0.47 ? Math.min(smoothstep(0.0, 0.07, u), 1 - smoothstep(0.38, 0.47, u)) : 0;
            walkCycle = (Math.abs(actorX - baseX) / 140) % 1;
            pose = walkWeight > 0.05 ? "walking" : "standing";
            torsoTiltDeg = walkWeight * 7;
          }
          break;
        }
        case "HOP_PAIN": {
          flightLift = Math.abs(Math.sin(localFrame * 0.22)) * 42;
          torsoTiltDeg = -8;
          activeShiver = true;
          break;
        }
        case "SIT_OBSERVE": {
          crouchDepth = 0;
          pose = "standing";
          torsoTiltDeg = 4;
          handsOnHips = true;
          headTiltDeg = -7 + Math.sin(frame * 0.08) * 3;
          break;
        }
        case "CELEBRATE": {
          flightLift = Math.abs(Math.sin(localFrame * 0.16)) * 38;
          waveRightArm = true;
          waveLeftArm = true;
          break;
        }
        default: {
          if (partner && partner.motion === "APPROACH_OTHER") {
            effectiveFacing = partnerBaseX >= baseX ? "RIGHT" : "LEFT";
          }
          torsoTiltDeg = 2;
          break;
        }
      }
    }

    if (pinSoloActorLeft) {
      actorX = Math.max(180, Math.min(560, actorX));
      effectiveFacing = "RIGHT";
    }

    const facingDir: 1 | -1 = effectiveFacing === "LEFT" ? -1 : 1;
    const actorBlinkSeed = aIdx * 13 + (actor.preset.charCodeAt(0) || 7);
    const actorIdleBreathFactor = computeStickmanIdleBreathFactor(frame, actorBlinkSeed, true);
    const actorEffectiveScaleY = actorScale * actorIdleBreathFactor * anticipationScaleY;
    const estHipY = -173 + crouchDepth - flightLift;
    const headWorldY = groundY + (estHipY - TORSO_LEN - 70) * actorEffectiveScaleY;

    // V18.3: Khóa cứng thời lượng nét run `shiver` chỉ nháy trong 30 frames đầu (0.5s) rồi tắt dần mượt mà!
    const shiverAgeFrames = timelineResolved ? v18LocalFrame : localFrame;
    let shiverOpacity = 0;
    if (activeShiver) {
      if (shiverAgeFrames >= 30) {
        activeShiver = false;
        shiverOpacity = 0;
      } else if (shiverAgeFrames >= 20) {
        shiverOpacity = Math.max(0, 1 - (shiverAgeFrames - 20) / 10);
      } else {
        shiverOpacity = 1.0;
      }
    }

    let handGripX = holdingTarget?.rightGrip?.x ?? actorX + facingDir * 84 * actorScale;
    let handGripY =
      holdingTarget?.rightGrip?.y ?? groundY - (216 + flightLift - crouchDepth * 0.65) * actorEffectiveScaleY;
    let writePenWorld: { x: number; y: number } | null = null;

    if (blendedArmPose) {
      if (v18ActionPose === "WRITE_NOTE") {
        const nbPos = projectUpperLocalToWorld(
          blendedArmPose.leftWrist,
          estHipY,
          torsoTiltDeg,
          actorX,
          groundY,
          actorScale,
          facingDir,
          actorEffectiveScaleY
        );
        handGripX = nbPos.x;
        handGripY = nbPos.y;
        writePenWorld = projectUpperLocalToWorld(
          blendedArmPose.rightWrist,
          estHipY,
          torsoTiltDeg,
          actorX,
          groundY,
          actorScale,
          facingDir,
          actorEffectiveScaleY
        );
      } else {
        const rwPos = projectUpperLocalToWorld(
          blendedArmPose.rightWrist,
          estHipY,
          torsoTiltDeg,
          actorX,
          groundY,
          actorScale,
          facingDir,
          actorEffectiveScaleY
        );
        handGripX = rwPos.x;
        handGripY = rwPos.y;
      }
    } else if (activeHandProp !== "NONE") {
      waveRightArm = false;
      handsOnHips = false;
      holdingTarget = {
        ...(holdingTarget || {}),
        rightGrip: { x: handGripX, y: handGripY },
      };
    }

    const isActivelyTalkingPose = Boolean(
      isSpeaking ||
        v18ActionPose === "TALK_GESTURE" ||
        v18ActionPose === "POINT_FORWARD" ||
        v18ActionPose === "PAT_SHOULDER" ||
        (!timelineResolved && (actor.motion === "APPROACH_OTHER" || actor.motion === "POINT_AT"))
    );

    return {
      actor,
      aIdx,
      actorScale,
      isLieSleepMode: false,
      sleepAnchorX: baseX,
      bubbleAppear,
      bubbleDisappear,
      isSpeaking,
      isActivelyTalkingPose,
      actorX,
      headWorldY,
      effectiveFacing,
      activeExprEnum,
      activeHandProp,
      activeShiver,
      shiverOpacity,
      pose,
      walkWeight,
      walkCycle,
      torsoTiltDeg,
      headTiltDeg,
      flightLift,
      crouchDepth,
      anticipationScaleY,
      waveRightArm,
      waveLeftArm,
      handsOnHips,
      turnScaleX,
      v18ActionPose,
      v18SegmentProgress,
      v18LocalFrame,
      blendedArmPose,
      handPropTiltDeg,
      overrideEyes,
      overrideEyebrows,
      overrideMouth,
      holdingTarget,
      handGripX,
      handGripY,
      writePenWorld,
      sweepSin,
      sipWave,
    };
  });

  return (
    <g id={`universal-auto-stage-${spec.id}`}>
      <g transform={`translate(${camFocusX}, ${camFocusY}) scale(${camZoom.toFixed(4)}) translate(${-camFocusX}, ${-camFocusY})`}>
        {/* 1. BỐI CẢNH (11 BỐI CẢNH SỐNG ĐỘNG 60FPS — BAO GỒM PHÒNG TIÊU ÂM ANECHOIC_CHAMBER V18.2) */}
        {spec.stageType === "COUNTRYSIDE_YARD" && (
          <CountrysideYardBackdrop timeOfDay={spec.timeOfDay} frame={frame} groundY={groundY} />
        )}
        {spec.stageType === "SIMPLE_GRASS_FIELD" && (
          <SimpleGrassFieldBackdrop
            timeOfDay={spec.timeOfDay}
            frame={frame}
            groundY={groundY}
            weather={
              spec.weather === "FLOOD"
                ? "FLOOD"
                : spec.weather === "RAIN" || spec.weather === "STORM"
                ? "RAIN"
                : "CLEAR"
            }
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
        {spec.stageType === "ANECHOIC_CHAMBER" && (
          <AnechoicChamberBackdrop timeOfDay={spec.timeOfDay} frame={frame} groundY={groundY} />
        )}
        {spec.stageType === "EXPLAINER_POLKA_DOT" && (
          <>
            <ExplainerPolkaDotBackdrop
              palette={spec.timeOfDay === "NIGHT" ? "lavender" : spec.timeOfDay === "SUNSET" ? "mint" : "cream"}
            />
            {/* Khung thẻ trắng tối giản làm nổi bật đạo cụ vector 60fps */}
            {propPlacement.propId !== "NONE" && spec.actors.length === 0 && (
              <g transform="translate(960, 495)">
                <rect x={-560} y={-255} width={1120} height={495} rx={36} fill="#141414" transform="translate(8, 10)" />
                <rect
                  x={-560}
                  y={-255}
                  width={1120}
                  height={495}
                  rx={36}
                  fill="#FFFFFF"
                  stroke="#141414"
                  strokeWidth={4.5}
                />
              </g>
            )}
          </>
        )}

        {/* 2. ĐẠO CỤ CHỦ ĐỀ CHUẨN VECTOR 60FPS TỪ KHO 16 ĐẠO CỤ (AutoPropLibrary) */}
        {propPlacement.propId !== "NONE" && (
          <g id="curated-prop-layer">
            {/* V18.0 Fix #1: Bóng suy nghĩ tròn nền trắng viền đen mềm trên vùng trời trống ngoài trời */}
            {propPlacement.inThoughtBubble && (() => {
              const floatY = Math.sin(frame * 0.065) * 6;
              const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1.0;
              const tx = propPlacement.tailSide;
              return (
                <g
                  id="outdoor-thought-prop-bubble"
                  transform={`translate(${propPlacement.x}, ${(propPlacement.y + floatY).toFixed(1)}) scale(${enter.toFixed(3)})`}
                >
                  <ellipse cx={4} cy={7} rx={104} ry={88} fill="rgba(15, 23, 42, 0.14)" />
                  <ellipse cx={0} cy={0} rx={102} ry={86} fill="#FFFFFF" stroke="#141414" strokeWidth={3.8} />
                  <ellipse cx={0} cy={0} rx={93} ry={77} fill="#F8FAFC" opacity={0.65} />
                  {tx !== 0 && (
                    <>
                      <circle cx={tx * 54} cy={96} r={11} fill="#FFFFFF" stroke="#141414" strokeWidth={3.2} />
                      <circle cx={tx * 80} cy={118} r={6.5} fill="#FFFFFF" stroke="#141414" strokeWidth={2.8} />
                    </>
                  )}
                </g>
              );
            })()}
            <CuratedAnimatedProp
              propId={propPlacement.propId}
              x={propPlacement.x}
              y={propPlacement.y}
              scale={propPlacement.scale}
              frame={frame}
              localFrame={localFrame}
            />
          </g>
        )}

        {/* 2.5. V19.0: HOẠT HỌA MINH HỌA RIÊNG THEO BEAT (customVisual) — NẰM TRÊN NỀN SÂN KHẤU, DƯỚI NHÂN VẬT / SPEECHBUBBLE / PHỤ ĐỀ */}
        {CustomVisualComponent && (
          <g id={`layer-custom-visual-${spec.id}`}>
            <foreignObject
              x={CUSTOM_VISUAL_STAGE_RECT.left}
              y={CUSTOM_VISUAL_STAGE_RECT.top}
              width={CUSTOM_VISUAL_STAGE_RECT.width}
              height={CUSTOM_VISUAL_STAGE_RECT.height}
              style={{ overflow: "visible" }}
            >
              <div
                style={{
                  width: `${CUSTOM_VISUAL_STAGE_RECT.width}px`,
                  height: `${CUSTOM_VISUAL_STAGE_RECT.height}px`,
                  position: "relative",
                }}
              >
                <CustomVisualComponent
                  progress={sceneProgressP}
                  frame={localFrame}
                  fps={fps}
                  step={spec.visualStep ?? 0}
                  visualStep={spec.visualStep ?? 0}
                />
              </div>
            </foreignObject>
          </g>
        )}

        {/* 3. PASS 2 (V18.2): RENDER NHÂN VẬT VỚI ÁNH MẮT CÓ HỒN + LISTENER NOD + SMOOTH BLEND */}
        {resolvedActors.map((ra) => {
          const { actor, aIdx } = ra;

          if (ra.isLieSleepMode) {
            const breathe = Math.sin(frame * 0.08) * 2.5;
            const isClinic = spec.stageType === "DOCTOR_CLINIC";
            const isBedroom = spec.stageType === "BEDROOM_INDOOR";
            const headX = isBedroom ? 1522 : isClinic ? 1685 : ra.sleepAnchorX + 80;
            const headY = isBedroom ? 610 : isClinic ? 622 : groundY - 62;
            const blanketX = isBedroom ? 1200 : isClinic ? 1365 : ra.sleepAnchorX - 180;
            const blanketY = isBedroom ? 648 : isClinic ? 650 : groundY - 46;
            const blanketW = isBedroom ? 295 : isClinic ? 285 : 230;
            return (
              <g key={`actor_sleep_${aIdx}`}>
                <path
                  d={`M ${blanketX},${blanketY + 34} Q ${blanketX + blanketW * 0.45},${
                    blanketY - 16 - breathe
                  } ${blanketX + blanketW},${blanketY + 12} L ${blanketX + blanketW},${
                    blanketY + 72
                  } L ${blanketX},${blanketY + 72} Z`}
                  fill={isClinic ? "#38BDF8" : "#60A5FA"}
                  stroke="#141414"
                  strokeWidth={3.5}
                  strokeLinejoin="round"
                />
                <g transform={`translate(${headX}, ${(headY + breathe * 0.4).toFixed(1)}) rotate(-12)`}>
                  <circle cx={0} cy={0} r={46} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />
                  <path
                    d="M -39,-20 C -40,-50 -10,-56 12,-52 C 30,-48 40,-34 39,-20 Q 22,-32 10,-25 Q 0,-36 -12,-24 Q -26,-32 -39,-20 Z"
                    fill={actor.preset === "GRANDPA" || actor.preset === "GRANDMA" ? "#CBD5E1" : "#1E293B"}
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
                      x={headX + 22 + zi * 26}
                      y={headY - 64 - p * 85}
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

          const expr = mapAutoExpression(ra.activeExprEnum);
          const facingDir: 1 | -1 = ra.effectiveFacing === "LEFT" ? -1 : 1;
          // V18.3–V20.1: Hỗ trợ 2–3 nhân vật:
          // - Với ánh mắt (frontPartner): CHỈ chọn nhân vật đứng CÙNG PHÍA TRƯỚC mặt (rawLocalDx >= -10),
          //   TUYỆT ĐỐI không liếc mắt ngược về phía sau gáy khi có người đứng sau lưng!
          const otherCandidates = resolvedActors.filter((o) => o.aIdx !== aIdx && !o.isLieSleepMode);
          const inFrontCandidates = otherCandidates.filter((o) => (o.actorX - ra.actorX) * facingDir >= -10);
          const frontPartner =
            inFrontCandidates.find((o) => o.isSpeaking || o.isActivelyTalkingPose) ??
            [...inFrontCandidates].sort((a, b) => Math.abs(a.actorX - ra.actorX) - Math.abs(b.actorX - ra.actorX))[0];
          const otherActor =
            frontPartner ??
            otherCandidates.find((o) => o.isSpeaking || o.isActivelyTalkingPose) ??
            [...otherCandidates].sort((a, b) => Math.abs(a.actorX - ra.actorX) - Math.abs(b.actorX - ra.actorX))[0];

          // V18.2–V20.1: Tính hướng ánh mắt tự động (dx khóa cứng 0..+4px theo chiều facing, không bao giờ nhìn ngược sau gáy!)
          let lookOffset: { dx: number; dy: number };
          if (ra.v18ActionPose === "SWEEP_LIGHT") {
            lookOffset = { dx: 3.4, dy: Math.max(-3.6, Math.min(3.6, ra.sweepSin * 3.4)) };
          } else if (ra.v18ActionPose === "WRITE_NOTE") {
            lookOffset = { dx: 2.6, dy: 3.6 };
          } else if (ra.v18ActionPose === "CROUCH_LOOK") {
            lookOffset = { dx: 3.5, dy: 3.2 };
          } else if (ra.v18ActionPose === "SIP_DRINK") {
            lookOffset = { dx: 2.8, dy: 2.4 - ra.sipWave * 1.6 };
          } else if (ra.v18ActionPose === "POINT_UP") {
            lookOffset = { dx: 2.4, dy: -3.6 };
          } else if (frontPartner) {
            // Cảnh 2–3 nhân vật: chỉ nhìn thẳng vào nhân vật đứng trước mặt (BOY 0.76 tự liếc nhẹ lên mặt người lớn 1.0 và ngược lại!)
            const rawLocalDx = Math.max(0, (frontPartner.actorX - ra.actorX) * facingDir);
            const rawDy = frontPartner.headWorldY - ra.headWorldY;
            const aimedDx = Math.max(1.8, Math.min(3.8, rawLocalDx / 90));
            lookOffset = {
              dx: aimedDx,
              dy: Math.max(-2.8, Math.min(2.8, rawDy / 65)),
            };
          } else if (
            propPlacement.propId !== "NONE" &&
            (propPlacement.inThoughtBubble || propPlacement.y < ra.headWorldY - 40) &&
            (propPlacement.x - ra.actorX) * facingDir >= -40
          ) {
            const rawLocalDx = Math.max(0, (propPlacement.x - ra.actorX) * facingDir);
            const rawDy = propPlacement.y - ra.headWorldY;
            lookOffset = {
              dx: Math.max(0, Math.min(3.6, rawLocalDx / 135)),
              dy: Math.max(-3.8, Math.min(-1.5, rawDy / 85)),
            };
          } else if (hasCustomVisual) {
            lookOffset = { dx: 3.0, dy: -0.6 };
          } else if (ra.activeHandProp === "PHONE" || ra.activeHandProp === "NOTEBOOK") {
            lookOffset = { dx: 2.8, dy: 2.8 };
          } else {
            lookOffset = {
              dx: 1.8 + Math.sin(frame * 0.03 + aIdx * 1.7) * 0.65,
              dy: Math.cos(frame * 0.025 + aIdx * 1.1) * 0.45,
            };
          }
          lookOffset = {
            dx: Math.max(0, Math.min(4, lookOffset.dx)),
            dy: Math.max(-4, Math.min(4, lookOffset.dy)),
          };

          // V18.2/V18.4 listenerNod: Người đứng nghe trong cảnh 2–3 người có nhịp gật đầu phản hồi nhẹ tự nhiên
          // (Riêng NOD_SMILE tự quản lý đúng 2 nhịp gật êm ái rồi dừng hẳn nên không cộng thêm listenerNod!)
          const isListeningToPartner = Boolean(
            otherActor &&
              !ra.isSpeaking &&
              (otherActor.isSpeaking || otherActor.isActivelyTalkingPose) &&
              ra.pose === "standing" &&
              ra.v18ActionPose !== "JUMP_BACK" &&
              ra.v18ActionPose !== "SHIVER_PANIC" &&
              ra.v18ActionPose !== "FACEPALM" &&
              ra.v18ActionPose !== "NOD_SMILE" &&
              ra.v18ActionPose !== "SIP_DRINK"
          );
          const listenerNodDeg = isListeningToPartner
            ? Math.sin(frame * 0.14 + aIdx) * 3.6 * (0.45 + 0.55 * Math.max(0, Math.sin(frame * 0.035)))
            : 0;

          const effectiveHeadTiltDeg = ra.headTiltDeg + listenerNodDeg;
          const nodAmplitudeDeg =
            ra.v18ActionPose === "NOD_SMILE" || ra.v18ActionPose === "SIP_DRINK"
              ? 0
              : ra.v18ActionPose === "SWEEP_LIGHT" || ra.v18ActionPose === "FACEPALM"
              ? 0.5
              : ra.v18ActionPose === "TALK_GESTURE"
              ? 2.0
              : isListeningToPartner
              ? 1.2
              : actor.motion === "IDLE_TALK" || actor.motion === "WAVE" || actor.motion === "APPROACH_OTHER"
              ? 3.2
              : 1.5;

          const renderCupInFrontForSip =
            ra.activeHandProp === "CUP_SODA" && ra.v18ActionPose === "SIP_DRINK";

          return (
            <g key={`auto_actor_${spec.id}_${aIdx}`}>
              {ra.activeHandProp !== "NONE" && !renderCupInFrontForSip && (
                <HandPropGraphic
                  prop={ra.activeHandProp}
                  x={ra.handGripX}
                  y={ra.handGripY}
                  facingDir={facingDir}
                  isNight={isNight}
                  frame={frame}
                  extraTiltDeg={ra.handPropTiltDeg}
                  propScale={ra.actorScale < 0.9 ? 0.85 : 1.0}
                />
              )}
              <StickmanRig
                characterPreset={actor.preset}
                frame={frame}
                state={{
                  x: ra.actorX,
                  y: groundY,
                  scale: ra.actorScale,
                  facing: ra.effectiveFacing === "LEFT" ? "left" : "right",
                  pose: ra.pose,
                  torsoTiltDeg: ra.torsoTiltDeg,
                  headTiltDeg: effectiveHeadTiltDeg,
                  flightLift: ra.flightLift,
                  crouchDepth: ra.crouchDepth,
                  anticipationScaleY: ra.anticipationScaleY,
                  walkCycleProgress: ra.walkCycle,
                  walkWeight: ra.walkWeight,
                  waveRightArm: ra.waveRightArm,
                  waveLeftArm: ra.waveLeftArm,
                  wavePhaseOffset: aIdx * 1.4,
                  handsOnHips: ra.handsOnHips,
                  turnScaleX: ra.turnScaleX,
                  v18ActionPose: ra.v18ActionPose,
                  v18SegmentProgress: ra.v18SegmentProgress,
                  v18LocalFrame: ra.v18LocalFrame,
                  blendedArmPose: ra.blendedArmPose,
                  lookOffset,
                  blinkSeed: aIdx * 13 + (actor.preset.charCodeAt(0) || 7),
                  nodAmplitudeDeg,
                  nodFreq: ra.v18ActionPose === "TALK_GESTURE" ? 0.11 : 0.13,
                  isSpeaking: ra.isSpeaking,
                  eyes: ra.overrideEyes ?? expr.eyes,
                  eyebrows: ra.overrideEyebrows ?? expr.eyebrows,
                  mouth: ra.overrideMouth ?? expr.mouth,
                  blush: expr.blush,
                  sweatDrop: expr.sweatDrop,
                  shiver: ra.activeShiver,
                  shiverOpacity: ra.shiverOpacity,
                  shiverDarkStage:
                    isNight || spec.stageType === "SPACE_COSMOS" || spec.stageType === "ANECHOIC_CHAMBER",
                  shiverFrame: frame,
                  holdingTarget: ra.blendedArmPose ? undefined : ra.holdingTarget,
                }}
              />
              {renderCupInFrontForSip && (
                <HandPropGraphic
                  prop="CUP_SODA"
                  x={ra.handGripX}
                  y={ra.handGripY}
                  facingDir={facingDir}
                  isNight={isNight}
                  frame={frame}
                  extraTiltDeg={ra.handPropTiltDeg}
                  propScale={ra.actorScale}
                  isSipping={true}
                />
              )}
              {ra.v18ActionPose === "SCRATCH_HEAD" &&
                (ra.activeExprEnum === "CURIOUS" ||
                  ra.activeExprEnum === "THINKING" ||
                  ra.activeExprEnum === "WORRIED") &&
                (() => {
                  const qPop = ra.v18LocalFrame < 12 ? easeOutBack(ra.v18LocalFrame / 12) : 1.0;
                  const qFloatY = Math.sin(frame * 0.065 + aIdx) * 5;
                  const qRot = Math.sin(frame * 0.045 + aIdx) * 6;
                  const qX = ra.actorX + facingDir * 56 * ra.actorScale;
                  const qY = ra.headWorldY - 58 * ra.actorScale + qFloatY;
                  const qScale = ra.actorScale * qPop;
                  return (
                    <g
                      id={`actor-scratch-question-mark-${aIdx}`}
                      transform={`translate(${qX.toFixed(1)}, ${qY.toFixed(1)}) rotate(${qRot.toFixed(
                        1
                      )}) scale(${qScale.toFixed(3)})`}
                    >
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#FACC15"
                        stroke="#141414"
                        strokeWidth={7}
                        strokeLinejoin="round"
                        paintOrder="stroke"
                        fontSize={44}
                        fontWeight={900}
                        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                      >
                        ?
                      </text>
                    </g>
                  );
                })()}
              {ra.writePenWorld && (
                <g
                  transform={`translate(${ra.writePenWorld.x.toFixed(1)}, ${ra.writePenWorld.y.toFixed(
                    1
                  )}) scale(${facingDir}, 1) rotate(-32)`}
                >
                  <line x1={-6} y1={0} x2={22} y2={-8} stroke="#141414" strokeWidth={7} strokeLinecap="round" />
                  <line x1={-4} y1={0} x2={19} y2={-7} stroke="#FACC15" strokeWidth={3.5} strokeLinecap="round" />
                  <circle cx={-7} cy={1} r={2.2} fill="#141414" />
                </g>
              )}
              {spec.stageType === "SPACE_COSMOS" &&
                (() => {
                  const tRad = (ra.torsoTiltDeg * facingDir * Math.PI) / 180;
                  const headWorldX = ra.actorX + Math.sin(tRad) * 169 * ra.actorScale;
                  const helmetWorldY =
                    groundY - (ra.flightLift - ra.crouchDepth * 0.85 + 173 + Math.cos(tRad) * 169) * ra.actorScale;
                  return (
                    <g
                      transform={`translate(${headWorldX.toFixed(1)}, ${helmetWorldY.toFixed(1)}) scale(${ra.actorScale.toFixed(
                        2
                      )})`}
                    >
                      <circle
                        cx={0}
                        cy={0}
                        r={66}
                        fill="#E0F2FE"
                        fillOpacity={0.22}
                        stroke="#CBD5E1"
                        strokeWidth={5}
                      />
                      <path
                        d="M -36,-35 A 46,46 0 0,1 25,-42"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={5}
                        strokeLinecap="round"
                        opacity={0.75}
                      />
                    </g>
                  );
                })()}
            </g>
          );
        })}

        {/* 4. HIỆU ỨNG THỜI TIẾT ĐỘNG 60FPS */}
        <WeatherOverlayLayer weather={spec.weather} frame={frame} isOutdoor={isOutdoor} />

        {/* 5. V18.4 LỚP BÓNG THOẠI TRÊN CÙNG (Z-INDEX CAO NHẤT — LUÔN VẼ SAU TẤT CẢ NHÂN VẬT & THỜI TIẾT) */}
        <g id="layer-speech-bubbles-top">
          {resolvedActors.map((ra) => {
            const { actor, aIdx } = ra;
            if (!actor.bubble) return null;

            if (ra.isLieSleepMode) {
              const isClinic = spec.stageType === "DOCTOR_CLINIC";
              const isBedroom = spec.stageType === "BEDROOM_INDOOR";
              const headX = isBedroom ? 1522 : isClinic ? 1685 : ra.sleepAnchorX + 80;
              const headY = isBedroom ? 610 : isClinic ? 622 : groundY - 62;
              return (
                <ComicSpeechBubble
                  key={`bubble_sleep_${spec.id}_${aIdx}`}
                  x={Math.max(240, Math.min(1680, headX - 90))}
                  y={headY - 190}
                  mouthX={headX - 8}
                  mouthY={headY + 12}
                  headTopY={headY - 48}
                  text={actor.bubble}
                  localFrame={localFrame}
                  appearFrame={ra.bubbleAppear}
                  disappearFrame={ra.bubbleDisappear}
                />
              );
            }

            const facingDir: 1 | -1 = ra.effectiveFacing === "LEFT" ? -1 : 1;
            const headTopWorldY = ra.headWorldY - 58 * ra.actorScale;
            const mouthWorldY = ra.headWorldY + 22 * ra.actorScale;
            return (
              <ComicSpeechBubble
                key={`bubble_${spec.id}_${aIdx}`}
                x={Math.max(220, Math.min(1700, ra.actorX + facingDir * 85))}
                y={headTopWorldY - 76}
                mouthX={ra.actorX + facingDir * 22 * ra.actorScale}
                mouthY={mouthWorldY}
                headTopY={headTopWorldY}
                text={actor.bubble}
                localFrame={localFrame}
                appearFrame={ra.bubbleAppear}
                disappearFrame={ra.bubbleDisappear}
              />
            );
          })}
        </g>
      </g>

      {/* 5. NHÃN CALLOUT VÀNG TỐI GIẢN — V18.2 AUTO-WIDTH THEO ĐỘ DÀI CHỮ; V19.1 TỰ ẨN KHI CÓ customVisual */}
      {spec.callout && !hasCustomVisual &&
        (() => {
          const rawCx = spec.callout.x ?? 960;
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
          const w = Math.min(1760, Math.max(260, Math.round(spec.callout.text.length * 14.5 + 68)));
          const safeCx = Math.max(w / 2 + 24, Math.min(1920 - w / 2 - 24, rawCx));
          return (
            <g transform={`translate(${safeCx.toFixed(1)}, ${cy}) scale(${s.toFixed(3)})`}>
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
