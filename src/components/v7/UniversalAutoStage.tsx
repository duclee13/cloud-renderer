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
import { GroundShadow } from "../SceneBackdropKit";
import { CleanExplainerStage } from "../CleanExplainerStage";
import { ForestWinterStage } from "../ForestWinterStage";
import { KineticHeadlineLayer } from "../KineticHeadlineLayer";
import { OctopusV24ExplainerKit, isOctopusV24ExplainerMode } from "./OctopusV24ExplainerKit";
import { FrogV24ExplainerKit, isFrogV24ExplainerMode } from "./FrogV24ExplainerKit";
import {
  FOREST_PARK_BACKDROP,
  OCEAN_UNDERWATER_BACKDROP,
  BACKYARD_BALCONY_PET,
} from "../NatureBackdropKit";
import {
  HostMirrorNeuronsBoard,
  HostAcousticsCringeBoard,
  HostNatureFieldBoard,
  BackyardBalconyCatStageKit,
  OceanUnderwaterStoryKit,
  ClassroomSeatedChairsBack,
  ClassroomSeatedDesksForeground,
  ClassroomBoardScreechOverlay,
  KitchenDiningChairsBack,
  KitchenDiningTableForeground,
  LivingRoomPetDog,
  LivingRoomPetCat,
  ActorYawnWavesOverlay,
} from "./HostExplainAndStageKits";
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
//    V22.1: Tách toàn bộ lớp nền tĩnh (tường, cửa sổ, tủ, bàn, kệ sách, sàn, dãy nhà, nêm xốp)
//           sang component bọc React.memo để tránh reconcile lại DOM qua 18.000+ frames!
// =============================================================================

const MemoExplainerPolkaDotBackdrop = React.memo(ExplainerPolkaDotBackdrop);

const CityStreetStaticSkyLayer = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const skyTop = isNight ? "#0F172A" : isSunset ? "#F97316" : "#60A5FA";
  const skyMid = isNight ? "#1E293B" : isSunset ? "#FDBA74" : "#BAE6FD";
  const skyBot = isNight ? "#1E293B" : isSunset ? "#FEF3C7" : "#F0F9FF";

  return (
    <g>
      <defs>
        <linearGradient id={`city-sky-${timeOfDay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="58%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={760} fill={`url(#city-sky-${timeOfDay})`} />
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
    </g>
  );
});

const CityStreetStaticBuildingsAndLamps = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
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
    <g>
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
      {/* Đèn đường & thân cây cố định */}
      {[560, 1080, 1620].map((lx, li) => (
        <g key={`lamp_${li}`}>
          <line x1={lx} y1={470} x2={lx} y2={765} stroke="#334155" strokeWidth={8} strokeLinecap="round" />
          <path d={`M ${lx},475 Q ${lx + 24},450 ${lx + 46},468`} fill="none" stroke="#334155" strokeWidth={6} strokeLinecap="round" />
          <circle cx={lx + 46} cy={476} r={12} fill={isNight ? "#FEF08A" : "#E2E8F0"} stroke="#141414" strokeWidth={2.6} />
          {isNight && <polygon points={`${lx + 34},485 ${lx + 58},485 ${lx + 115},765 ${lx - 20},765`} fill="#FEF08A" opacity={0.14} />}
        </g>
      ))}
      {[860, 1380].map((tx, ti) => (
        <rect key={`stree_trunk_${ti}`} x={tx - 10} y={670} width={20} height={95} fill="#78350F" stroke="#141414" strokeWidth={3} />
      ))}
    </g>
  );
});

const CityStreetStaticRoadLayer = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
  return (
    <g>
      {/* Vỉa hè sáng & mặt đường nhựa (V18.0: vạch kẻ đường đẩy cao & làm dịu opacity=0.32 để phụ đề trắng luôn nổi bật) */}
      <rect x={0} y={760} width={1920} height={135} fill={isNight ? "#64748B" : "#CBD5E1"} stroke="#141414" strokeWidth={3} />
      <rect x={0} y={895} width={1920} height={185} fill={isNight ? "#1E293B" : "#475569"} stroke="#141414" strokeWidth={3} />
      <line x1={0} y1={932} x2={1920} y2={932} stroke="#FACC15" strokeWidth={6} strokeDasharray="54 38" opacity={0.32} />
    </g>
  );
});

const CityStreetBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number; groundY: number }> = ({
  timeOfDay,
  frame,
}) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const cloudDrift = frame * 0.18;
  const breeze = Math.sin(frame * 0.04) * 2.2;
  const carX = ((frame * 2.4 + 200) % 2360) - 220;

  return (
    <g id="stage-city-street">
      <CityStreetStaticSkyLayer timeOfDay={timeOfDay} />

      {/* Mây trôi 60fps */}
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

      <CityStreetStaticBuildingsAndLamps timeOfDay={timeOfDay} />

      {/* Tán cây xanh vỉa hè đung đưa 60fps */}
      {[860, 1380].map((tx, ti) => (
        <g key={`stree_${ti}`} transform={`translate(${tx}, 765)`}>
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

      <CityStreetStaticRoadLayer timeOfDay={timeOfDay} />
    </g>
  );
};

const ScienceLabAcousticsBoardStatic = React.memo(() => (
  <g id="lab-board-acoustics-voice" transform="translate(560, 165)">
    {/* Khung bảng nghiên cứu trắng/ghim gọn gàng (760x330) */}
    <rect x={0} y={0} width={760} height={330} rx={14} fill="#FFFFFF" stroke="#64748B" strokeWidth={9} />
    <rect x={0} y={0} width={760} height={330} rx={14} fill="none" stroke="#141414" strokeWidth={3} />
    {/* 4 đinh ghim góc trên/dưới */}
    <circle cx={20} cy={20} r={5.5} fill="#EF4444" stroke="#141414" strokeWidth={2} />
    <circle cx={740} cy={20} r={5.5} fill="#EF4444" stroke="#141414" strokeWidth={2} />
    <circle cx={20} cy={310} r={5.5} fill="#0284C7" stroke="#141414" strokeWidth={2} />
    <circle cx={740} cy={310} r={5.5} fill="#0284C7" stroke="#141414" strokeWidth={2} />

    {/* Thanh tiêu đề chuyên đề trên bảng */}
    <rect x={36} y={14} width={688} height={36} rx={9} fill="#EFF6FF" stroke="#0284C7" strokeWidth={2.2} />
    <text
      x={380}
      y={38}
      textAnchor="middle"
      fill="#0369A1"
      stroke="none"
      fontSize={19}
      fontWeight={900}
      fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
    >
      NGHIÊN CỨU ÂM HỌC • TRUYỀN ÂM KHÔNG KHÍ &amp; XƯƠNG SỌ
    </text>

    {/* Khung trái: Phác thảo mặt cắt Tai – Ốc tai mini */}
    <g id="lab-board-ear-sketch" transform="translate(26, 64)">
      <rect x={0} y={0} width={226} height={240} rx={12} fill="#FFF7ED" stroke="#EA580C" strokeWidth={2.6} />
      {/* Phác thảo đầu + tai ngoài + ống tai + màng nhĩ + ốc tai xoắn */}
      <g transform="translate(114, 108)">
        <path
          d="M -64,58 C -78,16 -72,-54 -16,-74 C 34,-90 76,-54 78,-4 L 90,14 L 78,24 L 74,56 C 68,72 48,80 22,80 L -64,80 Z"
          fill="#FFEDD5"
          stroke="#141414"
          strokeWidth={2.8}
          strokeLinejoin="round"
        />
        {/* Vành tai ngoài & ống tai */}
        <path d="M -38,-14 C -54,-14 -58,8 -50,26 C -44,36 -34,38 -28,32" fill="#FED7AA" stroke="#141414" strokeWidth={2.6} />
        <rect x={-38} y={2} width={34} height={14} rx={4} fill="#FDE68A" stroke="#141414" strokeWidth={2.2} />
        {/* Màng nhĩ */}
        <ellipse cx={-3} cy={9} rx={4} ry={10} fill="#38BDF8" stroke="#0284C7" strokeWidth={2.2} />
        {/* Ốc tai xoắn */}
        <path
          d="M 12,11 C 12,-5 38,-7 40,9 C 42,23 20,27 16,15 C 14,5 28,3 30,11"
          fill="none"
          stroke="#4F46E5"
          strokeWidth={3.6}
          strokeLinecap="round"
        />
        {/* Đường xanh không khí đi vào ống tai */}
        <path
          d="M 78,34 C 98,-48 16,-96 -62,-44 C -84,-28 -78,10 -44,10"
          fill="none"
          stroke="#0284C7"
          strokeWidth={3.2}
          strokeDasharray="7 5"
          strokeLinecap="round"
        />
        <polygon points="-40,10 -52,4 -50,16" fill="#0284C7" stroke="none" />
        {/* Đường cam xuyên xương hàm/sọ trực tiếp vào ốc tai */}
        <path
          d="M 30,74 C 36,52 38,38 28,22"
          fill="none"
          stroke="#EA580C"
          strokeWidth={4}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        <polygon points="26,18 20,30 34,28" fill="#EA580C" stroke="none" />
      </g>
      <text
        x={113}
        y={224}
        textAnchor="middle"
        fill="#9A3412"
        stroke="none"
        fontSize={17}
        fontWeight={800}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Tai &amp; Ốc tai (2 đường)
      </text>
    </g>

    {/* Khung giữa: 2 Đường sóng âm tần số trầm (xương sọ) vs cao (không khí) */}
    <g id="lab-board-wave-comparison" transform="translate(268, 64)">
      {/* Thẻ trên: Sóng cam gợn dài = Âm trầm xương sọ */}
      <rect x={0} y={0} width={278} height={112} rx={12} fill="#FFF7ED" stroke="#EA580C" strokeWidth={2.6} />
      <path
        d="M 22,52 Q 62,16 102,52 T 182,52 T 256,52"
        fill="none"
        stroke="#EA580C"
        strokeWidth={7.5}
        strokeLinecap="round"
      />
      <text
        x={139}
        y={97}
        textAnchor="middle"
        fill="#C2410C"
        stroke="none"
        fontSize={16.5}
        fontWeight={800}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Sóng trầm • Xương sọ
      </text>

      {/* Thẻ dưới: Sóng xanh gợn dày = Âm cao không khí */}
      <rect x={0} y={128} width={278} height={112} rx={12} fill="#F0F9FF" stroke="#0284C7" strokeWidth={2.6} />
      <path
        d="M 22,180 Q 35,152 48,180 T 74,180 T 100,180 T 126,180 T 152,180 T 178,180 T 204,180 T 230,180 T 256,180"
        fill="none"
        stroke="#0284C7"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <text
        x={139}
        y={225}
        textAnchor="middle"
        fill="#0369A1"
        stroke="none"
        fontSize={16.5}
        fontWeight={800}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Sóng cao • Không khí
      </text>
    </g>

    {/* Khung phải: Hình vẽ Âm thoa cộng hưởng */}
    <g id="lab-board-tuning-fork" transform="translate(562, 64)">
      <rect x={0} y={0} width={172} height={240} rx={12} fill="#F8FAFC" stroke="#475569" strokeWidth={2.6} />
      {/* Đế hộp cộng hưởng gỗ */}
      <rect x={38} y={164} width={96} height={26} rx={5} fill="#B45309" stroke="#141414" strokeWidth={2.5} />
      <rect x={54} y={172} width={64} height={10} rx={3} fill="#78350F" stroke="none" />
      {/* Thân âm thoa hình chữ U bằng thép */}
      <line x1={86} y1={164} x2={86} y2={116} stroke="#475569" strokeWidth={8} strokeLinecap="round" />
      <path
        d="M 62,38 L 62,92 Q 62,118 86,118 Q 110,118 110,92 L 110,38"
        fill="none"
        stroke="#64748B"
        strokeWidth={9}
        strokeLinecap="round"
      />
      {/* Cung sóng rung hai bên nhánh âm thoa */}
      <path d="M 44,50 Q 34,66 44,82" fill="none" stroke="#0284C7" strokeWidth={3} strokeLinecap="round" />
      <path d="M 32,42 Q 18,66 32,90" fill="none" stroke="#38BDF8" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M 128,50 Q 138,66 128,82" fill="none" stroke="#EA580C" strokeWidth={3} strokeLinecap="round" />
      <path d="M 140,42 Q 154,66 140,90" fill="none" stroke="#FB923C" strokeWidth={2.6} strokeLinecap="round" />
      <text
        x={86}
        y={224}
        textAnchor="middle"
        fill="#334155"
        stroke="none"
        fontSize={17}
        fontWeight={800}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Âm thoa cộng hưởng
      </text>
    </g>
  </g>
));

const ScienceLabItchNeurologyBoardStatic = React.memo(() => (
  /* Vị trí bảng đặt gọn trong vùng y = 75..409 (thuộc y=75–430) để bóng thoại nhân vật phía dưới luôn thoáng sạch */
  <g id="lab-board-itch-neurology" transform="translate(540, 75)">
    <rect x={0} y={0} width={800} height={334} rx={14} fill="#FFFFFF" stroke="#64748B" strokeWidth={9} />
    <rect x={0} y={0} width={800} height={334} rx={14} fill="none" stroke="#141414" strokeWidth={3} />
    {/* 4 đinh ghim góc */}
    <circle cx={20} cy={20} r={5.5} fill="#EF4444" stroke="#141414" strokeWidth={2} />
    <circle cx={780} cy={20} r={5.5} fill="#EF4444" stroke="#141414" strokeWidth={2} />
    <circle cx={20} cy={314} r={5.5} fill="#0284C7" stroke="#141414" strokeWidth={2} />
    <circle cx={780} cy={314} r={5.5} fill="#0284C7" stroke="#141414" strokeWidth={2} />

    {/* Tiêu đề bảng nghiên cứu */}
    <rect x={34} y={14} width={732} height={36} rx={9} fill="#FEF2F2" stroke="#EA580C" strokeWidth={2.2} />
    <text
      x={400}
      y={38}
      textAnchor="middle"
      fill="#9A3412"
      stroke="none"
      fontSize={17.5}
      fontWeight={900}
      fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
    >
      NGHIÊN CỨU DA &amp; THẦN KINH • HISTAMIN &amp; VÒNG LẶP NGỨA–GÃI
    </text>

    {/* Ô 1 (Trái): Mặt cắt da có nốt sưng đỏ + tế bào Mast xả hạt Histamin */}
    <g id="lab-board-itch-skin" transform="translate(22, 60)">
      <rect x={0} y={0} width={240} height={252} rx={12} fill="#FFF7ED" stroke="#EA580C" strokeWidth={2.4} />
      {/* Lớp da biểu bì & hạ bì + nốt sưng đỏ */}
      <path
        d="M 14,114 Q 74,114 96,92 Q 120,70 144,92 Q 166,114 226,114 L 226,192 L 14,192 Z"
        fill="#FED7AA"
        stroke="#141414"
        strokeWidth={2.4}
      />
      <path
        d="M 94,94 Q 120,72 146,94 Q 120,106 94,94 Z"
        fill="#EF4444"
        opacity={0.72}
        stroke="none"
      />
      <rect x={14} y={164} width={212} height={28} rx={6} fill="#FCA5A5" stroke="#DC2626" strokeWidth={2} />
      {/* Tế bào Mast tròn màu cam + hạt Histamin đỏ */}
      <circle cx={68} cy={142} r={20} fill="#F97316" stroke="#141414" strokeWidth={2.4} />
      <text x={68} y={146} textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize={11} fontWeight={900}>
        Mast
      </text>
      {[
        { cx: 108, cy: 126 },
        { cx: 124, cy: 142 },
        { cx: 146, cy: 120 },
        { cx: 162, cy: 144 },
        { cx: 184, cy: 130 },
        { cx: 118, cy: 110 },
      ].map((dot, idx) => (
        <circle key={`hdot_${idx}`} cx={dot.cx} cy={dot.cy} r={5.5} fill="#DC2626" stroke="#FFFFFF" strokeWidth={1.2} />
      ))}
      <text
        x={120}
        y={217}
        textAnchor="middle"
        fill="#9A3412"
        stroke="none"
        fontSize={15}
        fontWeight={800}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Tế bào Mast xả Histamin
      </text>
      <text
        x={120}
        y={237}
        textAnchor="middle"
        fill="#64748B"
        stroke="none"
        fontSize={13}
        fontWeight={700}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Sưng đỏ &amp; kích ngứa
      </text>
    </g>

    {/* Ô 2 (Giữa): Tủy sống với 2 đường tín hiệu Ngứa (cam) & Đau nhẹ (xanh dương) qua chung 1 cổng */}
    <g id="lab-board-itch-spinal" transform="translate(278, 60)">
      <rect x={0} y={0} width={244} height={252} rx={12} fill="#F0F9FF" stroke="#0284C7" strokeWidth={2.4} />
      {/* Trụ tủy sống */}
      <rect x={92} y={22} width={60} height={170} rx={24} fill="#E2E8F0" stroke="#475569" strokeWidth={2.6} />
      {/* Luồng Cam = Ngứa */}
      <path d="M 24,182 C 46,158 72,142 102,122" fill="none" stroke="#EA580C" strokeWidth={5.5} strokeLinecap="round" />
      <text x={44} y={140} textAnchor="middle" fill="#C2410C" stroke="none" fontSize={13} fontWeight={800}>
        Ngứa
      </text>
      {/* Luồng Xanh dương = Đau nhẹ vượt cổng lên não (vẽ dưới nhãn CỔNG TỦY để chữ sắc nét 100%) */}
      <path d="M 220,182 C 192,156 156,140 136,122 L 136,40" fill="none" stroke="#0284C7" strokeWidth={5.5} strokeLinecap="round" />
      <polygon points="136,28 128,44 144,44" fill="#0284C7" stroke="none" />
      <text x={194} y={140} textAnchor="middle" fill="#0369A1" stroke="none" fontSize={13} fontWeight={800}>
        Đau nhẹ
      </text>
      {/* Nhãn CỔNG TỦY đặt lớp trên cùng */}
      <rect x={74} y={92} width={96} height={30} rx={8} fill="#FEF08A" stroke="#CA8A04" strokeWidth={2.4} />
      <text x={122} y={112} textAnchor="middle" fill="#854D0E" stroke="none" fontSize={12.5} fontWeight={900}>
        CỔNG TỦY
      </text>
      <text
        x={122}
        y={217}
        textAnchor="middle"
        fill="#0369A1"
        stroke="none"
        fontSize={15}
        fontWeight={800}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Chung cổng tủy sống
      </text>
      <text
        x={122}
        y={237}
        textAnchor="middle"
        fill="#64748B"
        stroke="none"
        fontSize={13}
        fontWeight={700}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Đau nhẹ tạm át Ngứa
      </text>
    </g>

    {/* Ô 3 (Phải): Vòng xoáy mũi tên khép kín Ngứa -> Gãi -> Serotonin -> Càng ngứa! */}
    <g id="lab-board-itch-spiral" transform="translate(538, 60)">
      <rect x={0} y={0} width={240} height={252} rx={12} fill="#ECFDF5" stroke="#0D9488" strokeWidth={2.4} />
      <circle cx={120} cy={110} r={65} fill="none" stroke="#0D9488" strokeWidth={4} strokeDasharray="10 6" />
      {/* 4 nút nhãn trên vòng xoáy */}
      <rect x={80} y={22} width={80} height={26} rx={8} fill="#FFEDD5" stroke="#EA580C" strokeWidth={2} />
      <text x={120} y={40} textAnchor="middle" fill="#C2410C" stroke="none" fontSize={13} fontWeight={900}>
        1. Ngứa
      </text>
      <rect x={156} y={96} width={72} height={26} rx={8} fill="#E0F2FE" stroke="#0284C7" strokeWidth={2} />
      <text x={192} y={114} textAnchor="middle" fill="#0369A1" stroke="none" fontSize={13} fontWeight={900}>
        2. Gãi
      </text>
      <rect x={68} y={168} width={104} height={26} rx={8} fill="#CCFBF1" stroke="#0D9488" strokeWidth={2} />
      <text x={120} y={186} textAnchor="middle" fill="#0F766E" stroke="none" fontSize={12.5} fontWeight={900}>
        3. Serotonin
      </text>
      <rect x={10} y={96} width={84} height={26} rx={8} fill="#FEE2E2" stroke="#DC2626" strokeWidth={2} />
      <text x={52} y={114} textAnchor="middle" fill="#B91C1C" stroke="none" fontSize={12} fontWeight={900}>
        Càng ngứa!
      </text>
      {/* Mũi tên đỏ quay ở tâm */}
      <path d="M 102,110 A 18,18 0 1,1 124,128" fill="none" stroke="#DC2626" strokeWidth={4} strokeLinecap="round" />
      <polygon points="100,116 96,102 110,106" fill="#DC2626" stroke="none" />
      <text
        x={120}
        y={217}
        textAnchor="middle"
        fill="#0F766E"
        stroke="none"
        fontSize={15}
        fontWeight={800}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Vòng lặp Ngứa–Gãi
      </text>
      <text
        x={120}
        y={237}
        textAnchor="middle"
        fill="#64748B"
        stroke="none"
        fontSize={13}
        fontWeight={700}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Serotonin thổi bùng ngứa
      </text>
    </g>
  </g>
));

const ScienceLabStaticLayer = React.memo<{ timeOfDay: AutoTimeOfDay; labBoard?: string }>(({ timeOfDay, labBoard }) => {
  const isNight = timeOfDay === "NIGHT";
  const wallFill = isNight ? "#1E293B" : "#E0F2FE";
  const isAcoustics = labBoard === "ACOUSTICS_VOICE";
  const isItchNeurology = labBoard === "ITCH_NEUROLOGY";
  const useCompactTable = isAcoustics || isItchNeurology;

  return (
    <g>
      <defs>
        <pattern id="lab-wall-grid-pat" x={0} y={0} width={160} height={775} patternUnits="userSpaceOnUse">
          <line x1={0} y1={0} x2={0} y2={775} stroke="#94A3B8" strokeWidth={1.2} opacity={0.22} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={1920} height={775} fill={wallFill} stroke="none" />
      {/* Gạch ốp phòng thí nghiệm mờ nhẹ qua <pattern> */}
      <rect x={0} y={0} width={1920} height={775} fill="url(#lab-wall-grid-pat)" stroke="none" />
      <rect x={0} y={775} width={1920} height={305} fill={isNight ? "#334155" : "#CBD5E1"} stroke="none" />
      <line x1={0} y1={775} x2={1920} y2={775} stroke="#141414" strokeWidth={3.2} />

      {/* V21.0: Cửa sổ kính bên trái hắt vệt sáng chéo mềm nhẹ vào phòng thí nghiệm */}
      <g id="lab-window-light">
        <polygon
          points="74,392 268,166 545,775 200,775"
          fill={isNight ? "#BAE6FD" : "#FEF9C3"}
          opacity={isNight ? 0.07 : 0.18}
          stroke="none"
        />
        <g transform="translate(74, 166)">
          <rect x={0} y={0} width={194} height={226} rx={10} fill={isNight ? "#0F172A" : "#7DD3FC"} />
          <polygon points="18,14 92,14 38,104 18,104" fill="#FFFFFF" opacity={isNight ? 0.1 : 0.35} stroke="none" />
          <line x1={97} y1={0} x2={97} y2={226} stroke="#141414" strokeWidth={3} />
          <line x1={0} y1={113} x2={194} y2={113} stroke="#141414" strokeWidth={3} />
          <rect x={0} y={0} width={194} height={226} rx={10} fill="none" stroke="#94A3B8" strokeWidth={7} />
          <rect x={0} y={0} width={194} height={226} rx={10} fill="none" stroke="#141414" strokeWidth={3} />
        </g>
      </g>

      {/* V21.0: Kệ sách khoa học nhỏ treo tường bên trái (x=76..286, thoáng hẳn ngoài vùng nhân vật đứng x>=420) */}
      <g id="lab-science-bookshelf" transform="translate(76, 456)">
        <path d="M 28,96 L 28,118 L 46,96 Z" fill="#475569" stroke="#141414" strokeWidth={2.5} />
        <path d="M 182,96 L 182,118 L 164,96 Z" fill="#475569" stroke="#141414" strokeWidth={2.5} />
        <rect x={18} y={32} width={22} height={64} rx={3} fill="#EF4444" stroke="#141414" strokeWidth={2.6} />
        <line x1={23} y1={46} x2={35} y2={46} stroke="#FEF08A" strokeWidth={2.5} />
        <rect x={42} y={22} width={26} height={74} rx={3} fill="#0284C7" stroke="#141414" strokeWidth={2.6} />
        <line x1={48} y1={38} x2={62} y2={38} stroke="#E0F2FE" strokeWidth={2.5} />
        <rect x={70} y={38} width={20} height={58} rx={3} fill="#10B981" stroke="#141414" strokeWidth={2.6} />
        <rect x={96} y={26} width={24} height={70} rx={3} transform="rotate(8, 108, 96)" fill="#F59E0B" stroke="#141414" strokeWidth={2.6} />
        <g transform="translate(166, 62)">
          <path d="M -14,34 L 14,34 M 0,24 L 0,34" stroke="#334155" strokeWidth={3.2} strokeLinecap="round" />
          <path d="M 0,-22 A 23,23 0 0,1 0,24" fill="none" stroke="#475569" strokeWidth={3} />
          <circle cx={0} cy={0} r={18} fill="#38BDF8" stroke="#141414" strokeWidth={2.6} />
          <path d="M -9,-8 Q -2,-12 5,-4 Q 10,4 2,10 Q -8,8 -9,-8 Z" fill="#22C55E" stroke="none" />
        </g>
        <rect x={0} y={96} width={210} height={14} rx={4} fill={isNight ? "#64748B" : "#B45309"} stroke="#141414" strokeWidth={2.8} />
      </g>

      {/* V22.2–V22.3: Bảng nghiên cứu động theo chủ đề (ACOUSTICS_VOICE, ITCH_NEUROLOGY hoặc bảng mặc định) */}
      {isAcoustics ? (
        <ScienceLabAcousticsBoardStatic />
      ) : isItchNeurology ? (
        <ScienceLabItchNeurologyBoardStatic />
      ) : (
        <g transform="translate(560, 165)">
          <rect x={0} y={0} width={760} height={330} rx={14} fill="#FFFFFF" stroke="#64748B" strokeWidth={9} />
          <rect x={0} y={0} width={760} height={330} rx={14} fill="none" stroke="#141414" strokeWidth={3} />
          <path d="M 310,210 Q 375,90 440,210 T 570,210 T 690,150" fill="none" stroke="#10B981" strokeWidth={6} strokeLinecap="round" />
          <line x1={300} y1={260} x2={700} y2={260} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
          <line x1={300} y1={90} x2={300} y2={260} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
        </g>
      )}

      {/* Khung mặt đồng hồ treo tường */}
      <circle cx={1530} cy={220} r={54} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />

      {/* Bàn thí nghiệm gọn bên phải (tự đổi dụng cụ theo labBoard, bóng phẳng opacity="0.12") */}
      <g transform="translate(1485, 560)">
        <ellipse
          id="lab-table-shadow"
          cx={200}
          cy={useCompactTable ? 268 : 279}
          rx={210}
          ry={12}
          fill="#0F172A"
          opacity={isNight ? 0.28 : 0.12}
          stroke="none"
        />
        <ellipse cx={30} cy={useCompactTable ? 268 : 279} rx={26} ry={6} fill="#0F172A" opacity={0.12} stroke="none" />
        <ellipse cx={370} cy={useCompactTable ? 268 : 279} rx={26} ry={6} fill="#0F172A" opacity={0.12} stroke="none" />
        <rect x={0} y={100} width={400} height={24} rx={6} fill="#64748B" />
        <rect x={20} y={124} width={20} height={useCompactTable ? 144 : 155} fill="#475569" />
        <rect x={360} y={124} width={20} height={useCompactTable ? 144 : 155} fill="#475569" />

        {isAcoustics ? (
          <g id="lab-acoustics-table-props">
            {/* 1. Âm thoa đặt trên hộp cộng hưởng gỗ gọn bên trái bàn */}
            <g id="lab-table-tuning-fork" transform="translate(76, 100)">
              <rect x={-36} y={-24} width={72} height={24} rx={5} fill="#B45309" stroke="#141414" strokeWidth={3} />
              <rect x={-22} y={-16} width={44} height={9} rx={2} fill="#78350F" stroke="none" />
              <line x1={0} y1={-24} x2={0} y2={-54} stroke="#475569" strokeWidth={6.5} strokeLinecap="round" />
              <path
                d="M -18,-112 L -18,-72 Q -18,-54 0,-54 Q 18,-54 18,-72 L 18,-112"
                fill="none"
                stroke="#64748B"
                strokeWidth={7.5}
                strokeLinecap="round"
              />
            </g>

            {/* 2. Máy hiện sóng mini (Oscilloscope) chính giữa bàn */}
            <g id="lab-acoustics-oscilloscope" transform="translate(226, 100)">
              <rect x={-82} y={-92} width={164} height={92} rx={10} fill="#334155" stroke="#141414" strokeWidth={3.4} />
              <rect x={-70} y={-80} width={104} height={68} rx={6} fill="#0F172A" stroke="#141414" strokeWidth={2.6} />
              <line x1={-70} y1={-46} x2={34} y2={-46} stroke="#1E293B" strokeWidth={1.6} />
              <line x1={-18} y1={-80} x2={-18} y2={-12} stroke="#1E293B" strokeWidth={1.6} />
              {/* Núm xoay & đèn nguồn bên phải máy hiện sóng */}
              <circle cx={56} cy={-64} r={10} fill="#94A3B8" stroke="#141414" strokeWidth={2.4} />
              <circle cx={56} cy={-38} r={10} fill="#94A3B8" stroke="#141414" strokeWidth={2.4} />
              <circle cx={56} cy={-18} r={4.5} fill="#22C55E" stroke="none" />
            </g>

            {/* 3. Chồng sổ đo âm học gọn góc phải bàn */}
            <g transform="translate(348, 100)">
              <rect x={-32} y={-16} width={64} height={16} rx={3} fill="#2563EB" stroke="#141414" strokeWidth={2.6} />
              <rect x={-26} y={-30} width={54} height={14} rx={3} fill="#FEF08A" stroke="#141414" strokeWidth={2.6} />
            </g>
          </g>
        ) : isItchNeurology ? (
          <g id="lab-itch-neurology-table-props">
            {/* 1. Kính hiển vi 2D tối giản bên trái bàn */}
            <g id="lab-itch-microscope" transform="translate(88, 100)">
              <rect x={-40} y={-14} width={80} height={14} rx={4} fill="#334155" stroke="#141414" strokeWidth={3} />
              <path d="M 12,-14 C 42,-44 42,-88 10,-112" fill="none" stroke="#475569" strokeWidth={10} strokeLinecap="round" />
              <rect x={-18} y={-126} width={22} height={68} rx={5} transform="rotate(18, -7, -92)" fill="#F8FAFC" stroke="#141414" strokeWidth={3} />
              <rect x={-8} y={-136} width={16} height={12} rx={3} transform="rotate(18, -7, -92)" fill="#1E293B" stroke="#141414" strokeWidth={2.2} />
              <rect x={-32} y={-40} width={50} height={8} rx={3} fill="#1E293B" stroke="#141414" strokeWidth={2.2} />
              <circle cx={28} cy={-64} r={8} fill="#94A3B8" stroke="#141414" strokeWidth={2.2} />
            </g>

            {/* 2. Đĩa Petri có giọt mẫu hồng chính giữa bàn */}
            <g id="lab-itch-petri-dish" transform="translate(222, 100)">
              <ellipse cx={0} cy={-8} rx={46} ry={12} fill="#E0F2FE" stroke="#0284C7" strokeWidth={2.8} />
              <ellipse cx={0} cy={-14} rx={44} ry={10} fill="#FFFFFF" fillOpacity={0.78} stroke="#141414" strokeWidth={2.4} />
              <ellipse cx={-6} cy={-14} rx={18} ry={5} fill="#FB7185" stroke="#BE123C" strokeWidth={1.6} />
              <circle cx={14} cy={-12} r={4} fill="#FDA4AF" stroke="none" />
            </g>

            {/* 3. Bảng kẹp hồ sơ nghiên cứu bên phải bàn */}
            <g id="lab-itch-clipboard" transform="translate(334, 100)">
              <rect x={-36} y={-80} width={72} height={80} rx={6} fill="#B45309" stroke="#141414" strokeWidth={2.8} />
              <rect x={-28} y={-70} width={56} height={62} rx={3} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
              <rect x={-16} y={-86} width={32} height={14} rx={4} fill="#94A3B8" stroke="#141414" strokeWidth={2.2} />
              <line x1={-18} y1={-52} x2={18} y2={-52} stroke="#EA580C" strokeWidth={3} strokeLinecap="round" />
              <line x1={-18} y1={-38} x2={16} y2={-38} stroke="#64748B" strokeWidth={2.4} strokeLinecap="round" />
              <line x1={-18} y1={-24} x2={10} y2={-24} stroke="#64748B" strokeWidth={2.4} strokeLinecap="round" />
            </g>
          </g>
        ) : (
          <>
            <g transform="translate(90, 100)">
              <path d="M -14,-84 L -14,-56 L -44,0 L 44,0 L 14,-56 L 14,-84 Z" fill="#DCFCE7" />
              <path d="M -29,-28 L 29,-28 L 41,-2 L -41,-2 Z" fill="#22C55E" stroke="none" />
              <path d="M -14,-84 L -14,-56 L -44,0 L 44,0 L 14,-56 L 14,-84 Z" fill="none" stroke="#141414" strokeWidth={3.2} />
            </g>
            <g transform="translate(200, 100)">
              <circle cx={0} cy={-30} r={32} fill="#BAE6FD" />
              <path d="M -29,-20 A 30,30 0 0,0 29,-20 Z" fill="#38BDF8" stroke="none" />
              <rect x={-10} y={-88} width={20} height={30} fill="#E0F2FE" />
              <circle cx={0} cy={-30} r={32} fill="none" stroke="#141414" strokeWidth={3.2} />
            </g>
            <g transform="translate(315, 100)">
              <rect x={-36} y={-12} width={72} height={12} rx={4} fill="#334155" />
              <path d="M 10,-12 Q 36,-54 10,-92" fill="none" stroke="#475569" strokeWidth={10} strokeLinecap="round" />
              <rect x={-16} y={-108} width={20} height={62} rx={4} transform="rotate(18, -6, -77)" fill="#E2E8F0" />
              <rect x={-28} y={-36} width={44} height={8} rx={2} fill="#1E293B" />
            </g>
          </>
        )}
      </g>
    </g>
  );
});

const ScienceLabBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number; groundY: number; labBoard?: string }> = ({
  timeOfDay,
  frame,
  labBoard,
}) => {
  const secDeg = (frame * 3) % 360;
  const minDeg = (frame * 0.15 + 45) % 360;
  const isAcoustics = labBoard === "ACOUSTICS_VOICE";
  const isItchNeurology = labBoard === "ITCH_NEUROLOGY";
  const forkPulse = 0.4 + 0.55 * Math.abs(Math.sin(frame * 0.18));
  const oscWavePts = isAcoustics
    ? Array.from({ length: 18 }, (_, i) => {
        const t = i / 17;
        const px = -64 + t * 92;
        const py = -46 + Math.sin(t * Math.PI * 4 - frame * 0.22) * 16;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      }).join(" ")
    : "";

  return (
    <g id="stage-science-lab" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      <ScienceLabStaticLayer timeOfDay={timeOfDay} labBoard={labBoard} />

      {/* Kim đồng hồ treo tường 60fps */}
      <g transform="translate(1530, 220)">
        <line x1={0} y1={0} x2={Math.sin((minDeg * Math.PI) / 180) * 28} y2={-Math.cos((minDeg * Math.PI) / 180) * 28} stroke="#141414" strokeWidth={4.5} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin((secDeg * Math.PI) / 180) * 38} y2={-Math.cos((secDeg * Math.PI) / 180) * 38} stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={0} cy={0} r={4.5} fill="#141414" />
      </g>

      {isAcoustics ? (
        <g id="lab-acoustics-dynamic">
          {/* Sóng rung động nhẹ quanh âm thoa trên bàn */}
          <g transform="translate(1561, 574)" fill="none" strokeLinecap="round" opacity={forkPulse}>
            <path d="M -28,-14 Q -36,0 -28,14" stroke="#0284C7" strokeWidth={3} />
            <path d="M 28,-14 Q 36,0 28,14" stroke="#EA580C" strokeWidth={3} />
          </g>
          {/* Sóng sống động trên màn hình máy hiện sóng mini */}
          <g transform="translate(1711, 660)">
            <polyline points={oscWavePts} fill="none" stroke="#38BDF8" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      ) : isItchNeurology ? (
        <g id="lab-itch-neurology-dynamic">
          {/* Nhịp phát sáng nhẹ của giọt mẫu hồng trong đĩa Petri trên bàn */}
          <circle
            cx={1701}
            cy={646}
            r={6 + Math.sin(frame * 0.12) * 1.5}
            fill="#FB7185"
            opacity={0.45}
            stroke="none"
          />
        </g>
      ) : (
        <>
          {/* Biểu tượng nguyên tử xoay nhẹ 60fps trên bảng mặc định */}
          <g transform={`translate(715, 330) rotate(${(frame * 0.5).toFixed(1)})`}>
            <ellipse cx={0} cy={0} rx={72} ry={26} fill="none" stroke="#0284C7" strokeWidth={3.5} />
            <ellipse cx={0} cy={0} rx={72} ry={26} transform="rotate(60)" fill="none" stroke="#0284C7" strokeWidth={3.5} />
            <ellipse cx={0} cy={0} rx={72} ry={26} transform="rotate(-60)" fill="none" stroke="#0284C7" strokeWidth={3.5} />
            <circle cx={0} cy={0} r={14} fill="#FACC15" stroke="#141414" strokeWidth={3} />
          </g>

          {/* Bọt khí sủi động 60fps trong 2 bình thí nghiệm mặc định */}
          <g transform="translate(1575, 660)">
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
          <g transform="translate(1685, 660)">
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
        </>
      )}
    </g>
  );
};

const DoctorClinicStaticWallLayer = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
  const wallFill = isNight ? "#1E293B" : "#F0FDF4";

  return (
    <g>
      <rect x={0} y={0} width={1920} height={775} fill={wallFill} stroke="none" />
      <rect x={0} y={775} width={1920} height={305} fill={isNight ? "#334155" : "#E2E8F0"} stroke="none" />
      <line x1={0} y1={775} x2={1920} y2={775} stroke="#141414" strokeWidth={3.2} />
      <rect x={200} y={175} width={310} height={240} rx={12} fill={isNight ? "#0F172A" : "#7DD3FC"} />
    </g>
  );
});

const DoctorClinicStaticFurnishingsLayer = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";

  return (
    <g>
      {/* Khung cửa sổ tĩnh phía trước đám mây */}
      <g transform="translate(200, 175)">
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

      {/* Khung mặt đồng hồ phòng khám */}
      <g transform="translate(1395, 225)">
        <circle cx={0} cy={0} r={46} fill="#FFFFFF" stroke="#141414" strokeWidth={3.8} />
        <line x1={0} y1={0} x2={0} y2={-26} stroke="#141414" strokeWidth={4} strokeLinecap="round" />
      </g>

      {/* V20.2: Tủ thuốc kính nhỏ treo sát tường bên phải */}
      <g id="clinic-medicine-cabinet" transform="translate(1525, 178)">
        <rect x={0} y={0} width={215} height={240} rx={10} fill={isNight ? "#334155" : "#FFFFFF"} stroke="#141414" strokeWidth={3.5} />
        <rect x={14} y={14} width={187} height={212} rx={6} fill={isNight ? "#1E293B" : "#ECFEFF"} stroke="#141414" strokeWidth={2.4} />
        <line x1={14} y1={88} x2={201} y2={88} stroke="#64748B" strokeWidth={3} />
        <line x1={14} y1={158} x2={201} y2={158} stroke="#64748B" strokeWidth={3} />
        <rect x={30} y={50} width={22} height={36} rx={4} fill="#F59E0B" stroke="#141414" strokeWidth={2.2} />
        <rect x={33} y={42} width={16} height={8} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={68} y={44} width={24} height={42} rx={4} fill="#38BDF8" stroke="#141414" strokeWidth={2.2} />
        <rect x={72} y={36} width={16} height={8} rx={2} fill="#0F172A" stroke="#141414" strokeWidth={2} />
        <rect x={110} y={54} width={20} height={32} rx={4} fill="#34D399" stroke="#141414" strokeWidth={2.2} />
        <rect x={113} y={47} width={14} height={7} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={148} y={48} width={34} height={38} rx={4} fill="#FFFFFF" stroke="#141414" strokeWidth={2.2} />
        <line x1={165} y1={58} x2={165} y2={76} stroke="#EF4444" strokeWidth={4} />
        <line x1={156} y1={67} x2={174} y2={67} stroke="#EF4444" strokeWidth={4} />
        <rect x={32} y={122} width={26} height={34} rx={4} fill="#FB7185" stroke="#141414" strokeWidth={2.2} />
        <rect x={36} y={115} width={18} height={7} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={74} y={116} width={22} height={40} rx={4} fill="#A78BFA" stroke="#141414" strokeWidth={2.2} />
        <rect x={77} y={109} width={16} height={7} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={114} y={128} width={68} height={28} rx={4} fill="#FEF08A" stroke="#141414" strokeWidth={2.2} />
        <line x1={124} y1={142} x2={172} y2={142} stroke="#94A3B8" strokeWidth={2.4} />
        <rect x={38} y={182} width={30} height={42} rx={5} fill="#60A5FA" stroke="#141414" strokeWidth={2.2} />
        <rect x={44} y={174} width={18} height={8} rx={2} fill="#FFFFFF" stroke="#141414" strokeWidth={2} />
        <rect x={86} y={188} width={26} height={36} rx={4} fill="#4ADE80" stroke="#141414" strokeWidth={2.2} />
        <rect x={90} y={181} width={18} height={7} rx={2} fill="#141414" stroke="#141414" strokeWidth={1.8} />
        <rect x={132} y={190} width={48} height={34} rx={4} fill="#F8FAFC" stroke="#141414" strokeWidth={2.2} />
        <path d="M 32,26 L 68,26 L 44,74 L 22,74 Z" fill="#FFFFFF" stroke="none" opacity={isNight ? 0.14 : 0.42} />
        <line x1={26} y1={110} x2={26} y2={142} stroke="#475569" strokeWidth={4.5} strokeLinecap="round" />
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
});

const DoctorClinicBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number; groundY: number }> = ({
  timeOfDay,
  frame,
}) => {
  const isNight = timeOfDay === "NIGHT";
  const cloudX = ((35 + frame * 0.18) % 280) - 20;
  const secDeg = (frame * 3) % 360;

  return (
    <g id="stage-doctor-clinic" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      <DoctorClinicStaticWallLayer timeOfDay={timeOfDay} />
      {!isNight && (
        <ellipse cx={200 + Math.max(46, Math.min(265, cloudX))} cy={257} rx={36} ry={16} fill="#FFFFFF" stroke="none" opacity={0.85} />
      )}
      <DoctorClinicStaticFurnishingsLayer timeOfDay={timeOfDay} />

      {/* Kim giây đồng hồ phòng khám 60fps */}
      <g transform="translate(1395, 225)">
        <line x1={0} y1={0} x2={Math.sin((secDeg * Math.PI) / 180) * 32} y2={-Math.cos((secDeg * Math.PI) / 180) * 32} stroke="#10B981" strokeWidth={2.4} strokeLinecap="round" />
      </g>

      {/* Chậu cây xanh góc trái có tán lá đung đưa nhẹ */}
      <g id="clinic-potted-plant" transform="translate(112, 785)">
        <ellipse cx={0} cy={4} rx={46} ry={10} fill="rgba(15, 23, 42, 0.14)" stroke="none" />
        <g transform={`rotate(${(Math.sin(frame * 0.03) * 1.4).toFixed(2)}, 0, -78)`}>
          <path d="M -4,-74 C -36,-106 -52,-142 -26,-158 C -8,-146 -2,-112 0,-74 Z" fill="#16A34A" stroke="#141414" strokeWidth={2.8} />
          <path d="M 4,-74 C 36,-108 54,-144 28,-160 C 10,-148 2,-114 0,-74 Z" fill="#16A34A" stroke="#141414" strokeWidth={2.8} />
          <path d="M -6,-72 C -46,-82 -66,-108 -46,-126 C -26,-124 -12,-98 -4,-72 Z" fill="#22C55E" stroke="#141414" strokeWidth={2.8} />
          <path d="M 6,-72 C 46,-82 66,-108 46,-126 C 26,-124 12,-98 4,-72 Z" fill="#22C55E" stroke="#141414" strokeWidth={2.8} />
          <path d="M 0,-74 C -16,-122 -14,-166 0,-182 C 14,-166 16,-122 0,-74 Z" fill="#4ADE80" stroke="#141414" strokeWidth={2.8} />
        </g>
        <path d="M -36,-72 L -26,0 L 26,0 L 36,-72 Z" fill={isNight ? "#CBD5E1" : "#FFFFFF"} stroke="#141414" strokeWidth={3.2} />
        <rect x={-42} y={-82} width={84} height={14} rx={5} fill="#10B981" stroke="#141414" strokeWidth={3} />
      </g>
    </g>
  );
};

const SpaceCosmosStaticBackLayer = React.memo(() => (
  <g>
    <defs>
      <linearGradient id="space-cosmos-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#090D1E" />
        <stop offset="55%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} fill="url(#space-cosmos-grad)" />
    <ellipse cx={420} cy={320} rx={360} ry={165} fill="#7C3AED" opacity={0.16} />
    <ellipse cx={1480} cy={410} rx={410} ry={190} fill="#0284C7" opacity={0.16} />
  </g>
));

const SpaceCosmosStaticSurfaceLayer = React.memo<{ groundY: number }>(({ groundY }) => (
  <g>
    <path d={`M -40,${groundY + 18} Q 960,${groundY - 46} 1960,${groundY + 18} L 1960,1100 L -40,1100 Z`} fill="#94A3B8" stroke="#141414" strokeWidth={4} />
    <ellipse cx={360} cy={groundY + 62} rx={68} ry={18} fill="#64748B" stroke="#141414" strokeWidth={2.5} />
    <ellipse cx={1420} cy={groundY + 52} rx={84} ry={22} fill="#64748B" stroke="#141414" strokeWidth={2.5} />
    <ellipse cx={960} cy={groundY + 86} rx={52} ry={14} fill="#64748B" stroke="#141414" strokeWidth={2.5} />
  </g>
));

const SpaceCosmosBackdrop: React.FC<{ frame: number; groundY: number }> = ({ frame, groundY }) => {
  const shootP = (frame % 220) / 40;
  const planetBob = Math.sin(frame * 0.04) * 12;

  return (
    <g id="stage-space-cosmos">
      <SpaceCosmosStaticBackLayer />

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

      <SpaceCosmosStaticSurfaceLayer groundY={groundY} />
    </g>
  );
};

/**
 * V18.2 / V22.1: Bối cảnh Phòng Tiêu Âm (ANECHOIC_CHAMBER)
 * Toàn bộ >300 khối nêm xốp tĩnh được bọc React.memo -> chỉ còn đúng 1 chấm LED động theo frame!
 */
const AnechoicChamberStaticLayer = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
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

  const cols = 10;
  const rows = 5;
  const cellW = 150;
  const cellH = 132;
  const ceilPatId = `anechoic_ceil_${timeOfDay}`;
  const wallPatId = `anechoic_wall_${timeOfDay}`;
  const floorWedgePatId = `anechoic_flr_wedge_${timeOfDay}`;
  const floorWirePatId = `anechoic_flr_wire_${timeOfDay}`;

  const renderVerticalWedgeModule = (ox: number, oy: number) => (
    <g transform={`translate(${ox}, ${oy})`}>
      <rect x={0} y={0} width={cellW} height={cellH} fill={bgDeep} stroke={wedgeEdge} strokeWidth={isNight ? 1.8 : 2.6} />
      {[0, 1, 2].map((w) => {
        const wx = w * 50;
        return (
          <g key={`vw_${w}`} stroke={wedgeEdge} strokeWidth={isNight ? 1.8 : 2.6} strokeLinejoin="round">
            <polygon points={`${wx},0 ${wx + 25},14 ${wx + 25},${cellH - 14} ${wx},${cellH}`} fill={wedgeFaceB} />
            <polygon points={`${wx + 25},14 ${wx + 50},0 ${wx + 50},${cellH} ${wx + 25},${cellH - 14}`} fill={wedgeFaceA} />
            <line x1={wx + 25} y1={14} x2={wx + 25} y2={cellH - 14} stroke={wedgeHighlight} strokeWidth={isNight ? 1 : 2} />
          </g>
        );
      })}
    </g>
  );

  const renderHorizontalWedgeModule = (ox: number, oy: number) => (
    <g transform={`translate(${ox}, ${oy})`}>
      <rect x={0} y={0} width={cellW} height={cellH} fill={bgDeep} stroke={wedgeEdge} strokeWidth={isNight ? 1.8 : 2.6} />
      {[0, 1, 2].map((w) => {
        const wy = w * 44;
        return (
          <g key={`hw_${w}`} stroke={wedgeEdge} strokeWidth={isNight ? 1.8 : 2.6} strokeLinejoin="round">
            <polygon points={`0,${wy} 14,${wy + 22} ${cellW - 14},${wy + 22} ${cellW},${wy}`} fill={wedgeFaceB} />
            <polygon points={`14,${wy + 22} 0,${wy + 44} ${cellW},${wy + 44} ${cellW - 14},${wy + 22}`} fill={wedgeFaceA} />
            <line x1={14} y1={wy + 22} x2={cellW - 14} y2={wy + 22} stroke={wedgeHighlight} strokeWidth={isNight ? 1 : 2} />
          </g>
        );
      })}
    </g>
  );

  return (
    <g>
      <defs>
        <pattern id={ceilPatId} x={0} y={0} width={120} height={110} patternUnits="userSpaceOnUse">
          <g stroke={wedgeEdge} strokeWidth={isNight ? 2 : 3} strokeLinejoin="round">
            <polygon points="0,0 60,108 60,0" fill={wedgeFaceB} />
            <polygon points="60,0 60,108 120,0" fill={wedgeFaceA} />
          </g>
        </pattern>
        <pattern id={wallPatId} x={0} y={110} width={cellW * 2} height={cellH * 2} patternUnits="userSpaceOnUse">
          {renderVerticalWedgeModule(0, 0)}
          {renderHorizontalWedgeModule(cellW, 0)}
          {renderHorizontalWedgeModule(0, cellH)}
          {renderVerticalWedgeModule(cellW, cellH)}
        </pattern>
        <pattern id={floorWedgePatId} x={0} y={868} width={192} height={212} patternUnits="userSpaceOnUse">
          <g stroke={wedgeEdge} strokeWidth={isNight ? 1.5 : 2.2} opacity={isNight ? 0.55 : 0.78}>
            <polygon points="0,212 48,0 96,212" fill={wedgeFaceA} />
            <polygon points="96,212 144,0 192,212" fill={wedgeFaceB} />
          </g>
        </pattern>
        <pattern id={floorWirePatId} x={0} y={770} width={84} height={110} patternUnits="userSpaceOnUse">
          <line x1={0} y1={22} x2={84} y2={22} stroke={gridWire} strokeWidth={1.5} opacity={0.42} />
          <line x1={0} y1={46} x2={84} y2={46} stroke={gridWire} strokeWidth={1.5} opacity={0.42} />
          <line x1={0} y1={70} x2={84} y2={70} stroke={gridWire} strokeWidth={1.5} opacity={0.42} />
          <line x1={0} y1={94} x2={84} y2={94} stroke={gridWire} strokeWidth={1.5} opacity={0.42} />
          <line x1={56} y1={0} x2={28} y2={110} stroke={gridWire} strokeWidth={1.5} opacity={0.36} />
        </pattern>
      </defs>

      <rect x={0} y={0} width={1920} height={1080} fill={bgDeep} />
      <rect x={0} y={0} width={1920} height={110} fill={`url(#${ceilPatId})`} />

      {!isNight && (
        <g opacity={isSunset ? 0.55 : 0.72}>
          <rect x={420} y={12} width={280} height={10} rx={5} fill={isSunset ? "#FDE68A" : "#BAE6FD"} />
          <rect x={920} y={12} width={280} height={10} rx={5} fill={isSunset ? "#FDE68A" : "#BAE6FD"} />
          <polygon points="420,22 700,22 860,340 260,340" fill={isSunset ? "#FEF08A" : "#93C5FD"} opacity={0.07} />
          <polygon points="920,22 1200,22 1360,340 760,340" fill={isSunset ? "#FEF08A" : "#93C5FD"} opacity={0.07} />
        </g>
      )}

      <rect x={0} y={110} width={cols * cellW} height={rows * cellH} fill={`url(#${wallPatId})`} />

      <g transform="translate(1525, 215)" stroke={wedgeEdge} strokeWidth={isNight ? 2.5 : 4} strokeLinejoin="round">
        <rect x={0} y={0} width={330} height={555} rx={10} fill={doorOuter} />
        <rect x={18} y={18} width={294} height={528} rx={6} fill={doorInner} />
        {[0, 1, 2, 3].map((dw) => {
          const dy = 38 + dw * 114;
          return (
            <g key={`dw_${dw}`}>
              <polygon points={`36,${dy} 165,${dy + 42} 294,${dy} 294,${dy + 94} 165,${dy + 52} 36,${dy + 94}`} fill={wedgeFaceA} strokeWidth={isNight ? 1.6 : 2.4} />
              <line x1={36} y1={dy + 47} x2={294} y2={dy + 47} stroke={wedgeHighlight} strokeWidth={isNight ? 1 : 2} />
            </g>
          );
        })}
        <rect x={28} y={258} width={22} height={74} rx={6} fill={isNight ? "#1E293B" : "#94A3B8"} />
        <rect x={36} y={286} width={58} height={18} rx={7} fill={isNight ? "#334155" : "#CBD5E1"} />
      </g>

      <rect x={0} y={770} width={1920} height={310} fill={floorBg} />
      <rect x={0} y={868} width={1920} height={212} fill={`url(#${floorWedgePatId})`} />
      <rect x={0} y={770} width={1920} height={110} fill={isNight ? "#0B1120" : "#334155"} fillOpacity={0.74} />
      <line x1={0} y1={770} x2={1920} y2={770} stroke={wedgeEdge} strokeWidth={3.5} />
      <line x1={0} y1={880} x2={1920} y2={880} stroke={wedgeEdge} strokeWidth={3.5} />
      <rect x={0} y={770} width={1920} height={110} fill={`url(#${floorWirePatId})`} />
    </g>
  );
});

const AnechoicChamberBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number; groundY: number }> = ({
  timeOfDay,
  frame,
}) => {
  const isNight = timeOfDay === "NIGHT";
  const wedgeEdge = isNight ? "#1E293B" : "#141414";
  const ledPulse = 0.45 + 0.55 * Math.sin(frame * 0.09);

  return (
    <g id="stage-anechoic-chamber">
      <AnechoicChamberStaticLayer timeOfDay={timeOfDay} />
      <circle cx={1690} cy={191} r={7} fill={isNight ? "#1E3A8A" : "#38BDF8"} opacity={ledPulse} stroke={wedgeEdge} strokeWidth={2} />
      {isNight && <rect x={0} y={0} width={1920} height={1080} fill="#020617" opacity={0.46} />}
    </g>
  );
};

// =============================================================================
// 1B. V22.0–V22.1: 4 SÂN KHẤU ĐỜI SỐNG THÀNH PHỐ & TRƯỜNG HỌC (100% 2D PHẲNG SẠCH, y <= 830)
//     - Bóng phẳng opacity="0.12", KHÔNG feGaussianBlur / feDropShadow, tách nền tĩnh React.memo
// =============================================================================

const CityLivingRoomStaticBaseLayer = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const wallFill = isNight ? "#1E293B" : isSunset ? "#FFEDD5" : "#FFFBEB";
  const floorFill = isNight ? "#334155" : "#E5C7A3";
  return (
    <g>
      <rect x={0} y={0} width={1920} height={765} fill={wallFill} stroke="none" />
      <rect x={0} y={765} width={1920} height={315} fill={floorFill} stroke="none" />
      <line x1={0} y1={765} x2={1920} y2={765} stroke="#141414" strokeWidth={3.2} />
      <rect x={0} y={749} width={1920} height={16} fill={isNight ? "#475569" : "#D6B38E"} stroke="#141414" strokeWidth={2.5} />
    </g>
  );
});

const CityLivingRoomStaticWindowFrame = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
  return (
    <g>
      <rect x={28} y={145} width={86} height={155} fill={isNight ? "#1E293B" : "#93C5FD"} stroke="#141414" strokeWidth={2.4} />
      <rect x={126} y={108} width={104} height={192} fill={isNight ? "#334155" : "#BAE6FD"} stroke="#141414" strokeWidth={2.4} />
      <rect x={244} y={132} width={92} height={168} fill={isNight ? "#1E293B" : "#DDD6FE"} stroke="#141414" strokeWidth={2.4} />
      {[148, 188, 228].map((wy, idx) => (
        <g key={`win_lt_${idx}`} stroke="none" fill={isNight ? "#FEF08A" : "#FFFFFF"} opacity={0.8}>
          <rect x={146} y={wy} width={22} height={22} rx={3} />
          <rect x={186} y={wy} width={22} height={22} rx={3} />
        </g>
      ))}
      <line x1={210} y1={0} x2={210} y2={300} stroke="#141414" strokeWidth={4} />
      <rect x={0} y={0} width={420} height={300} rx={12} fill="none" stroke="#94A3B8" strokeWidth={8} />
      <rect x={0} y={0} width={420} height={300} rx={12} fill="none" stroke="#141414" strokeWidth={3} />
      <rect x={-18} y={-8} width={42} height={316} rx={8} fill={isNight ? "#475569" : "#FDBA74"} stroke="#141414" strokeWidth={2.8} />
      <rect x={396} y={-8} width={42} height={316} rx={8} fill={isNight ? "#475569" : "#FDBA74"} stroke="#141414" strokeWidth={2.8} />
    </g>
  );
});

const CityLivingRoomStaticFurniture = React.memo<{
  timeOfDay: AutoTimeOfDay;
  hasPetDog?: boolean;
  openFloorOutro?: boolean;
}>(({ timeOfDay, hasPetDog = false, openFloorOutro = false }) => {
    const isNight = timeOfDay === "NIGHT";
    const isSunset = timeOfDay === "SUNSET";
    const sofaX = openFloorOutro ? 870 : hasPetDog ? 540 : 650;
    const sofaY = openFloorOutro ? 536 : hasPetDog ? 592 : 565;
    const tableX = openFloorOutro ? 1515 : hasPetDog ? 1425 : 1245;
    return (
      <g>
        {/* Warm pendant ceiling lamp with soft flat cone glow in evening/sunset */}
        <g id="living-room-warm-lamp" transform="translate(960, 0)">
          <line x1={0} y1={0} x2={0} y2={92} stroke="#475569" strokeWidth={4} />
          {(isSunset || isNight) && (
            <polygon
              points="-34,112 34,112 240,620 -240,620"
              fill="#FEF08A"
              opacity={isNight ? 0.16 : 0.14}
              stroke="none"
            />
          )}
          <path d="M -42,114 Q 0,80 42,114 Z" fill="#F59E0B" stroke="#141414" strokeWidth={3} />
          <circle cx={0} cy={118} r={11} fill="#FEF9C3" stroke="#141414" strokeWidth={2.4} />
        </g>

        <g transform="translate(1150, 175)">
          <rect x={0} y={0} width={165} height={118} rx={8} fill="#FFFFFF" stroke="#141414" strokeWidth={3.4} />
          <path d="M 18,92 L 62,44 L 98,78 L 122,56 L 148,92 Z" fill="#86EFAC" stroke="#141414" strokeWidth={2.4} />
          <circle cx={122} cy={34} r={12} fill="#FDE047" stroke="#141414" strokeWidth={2.2} />
        </g>
        <g id="living-room-sofa" transform={`translate(${sofaX}, ${sofaY})`}>
          <ellipse cx={260} cy={227} rx={275} ry={12} fill="#0F172A" opacity={0.12} stroke="none" />
          <rect x={28} y={204} width={16} height={22} rx={3} fill="#78350F" />
          <rect x={476} y={204} width={16} height={22} rx={3} fill="#78350F" />
          <rect x={18} y={0} width={484} height={135} rx={24} fill={isNight ? "#0EA5E9" : "#38BDF8"} />
          <line x1={260} y1={14} x2={260} y2={130} stroke="#141414" strokeWidth={2.8} />
          <rect x={0} y={76} width={44} height={128} rx={16} fill={isNight ? "#0284C7" : "#0EA5E9"} />
          <rect x={476} y={76} width={44} height={128} rx={16} fill={isNight ? "#0284C7" : "#0EA5E9"} />
          <rect x={36} y={118} width={448} height={86} rx={16} fill={isNight ? "#0284C7" : "#0EA5E9"} />
          <rect x={62} y={54} width={66} height={62} rx={14} transform="rotate(-8, 95, 85)" fill="#FDE047" />
        </g>
        <g id="living-room-coffee-table" transform={`translate(${tableX}, 682)`}>
          <ellipse cx={145} cy={118} rx={155} ry={10} fill="#0F172A" opacity={0.12} stroke="none" />
          <rect x={24} y={26} width={16} height={90} rx={4} fill="#92400E" />
          <rect x={250} y={26} width={16} height={90} rx={4} fill="#92400E" />
          <rect x={0} y={4} width={290} height={24} rx={8} fill="#B45309" />
          <path d="M 96,4 L 102,-24 L 136,-24 L 142,4 Z" fill="#FFFFFF" stroke="#141414" strokeWidth={2.6} />
          <rect x={168} y={-14} width={26} height={18} rx={4} fill="#FEF08A" stroke="#141414" strokeWidth={2.4} />
        </g>
      </g>
    );
  }
);

const CityLivingRoomBackdrop: React.FC<{
  timeOfDay: AutoTimeOfDay;
  frame: number;
  hasPetDog?: boolean;
  openFloorOutro?: boolean;
}> = ({ timeOfDay, frame, hasPetDog = false, openFloorOutro = false }) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const cloudX = ((40 + frame * 0.16) % 360) - 20;
  const plantSway = Math.sin(frame * 0.035) * 1.6;
  const secDeg = (frame * 3) % 360;
  const minDeg = (frame * 0.15 + 60) % 360;
  const skyFill = isNight ? "#0F172A" : isSunset ? "#FB923C" : "#7DD3FC";

  return (
    <g id="stage-city-living-room" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      <CityLivingRoomStaticBaseLayer timeOfDay={timeOfDay} />

      <g id="living-room-city-window" transform="translate(140, 155)">
        <rect x={0} y={0} width={420} height={300} rx={12} fill={skyFill} />
        {isNight ? (
          <circle cx={340} cy={62} r={24} fill="#FEF08A" stroke="#141414" strokeWidth={2.4} />
        ) : (
          <g transform={`translate(${Math.max(55, Math.min(355, cloudX)).toFixed(1)}, 68)`}>
            <path
              d="M -38,10 C -50,10 -52,-6 -36,-10 C -30,-26 -6,-28 4,-14 C 16,-26 42,-20 44,-6 C 58,-4 56,10 42,10 Z"
              fill="#FFFFFF"
              stroke="#141414"
              strokeWidth={2.4}
            />
          </g>
        )}
        <CityLivingRoomStaticWindowFrame timeOfDay={timeOfDay} />
      </g>

      <g id="living-room-clock" transform="translate(960, 205)">
        <circle cx={0} cy={0} r={46} fill="#FFFFFF" stroke="#141414" strokeWidth={3.8} />
        <line x1={0} y1={0} x2={Math.sin((minDeg * Math.PI) / 180) * 24} y2={-Math.cos((minDeg * Math.PI) / 180) * 24} stroke="#141414" strokeWidth={4} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin((secDeg * Math.PI) / 180) * 32} y2={-Math.cos((secDeg * Math.PI) / 180) * 32} stroke="#EF4444" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={0} cy={0} r={4} fill="#141414" stroke="none" />
      </g>

      <CityLivingRoomStaticFurniture timeOfDay={timeOfDay} hasPetDog={hasPetDog} openFloorOutro={openFloorOutro} />

      <g id="living-room-plant" transform="translate(1735, 792)">
        <ellipse cx={0} cy={4} rx={48} ry={10} fill="#0F172A" opacity={0.12} stroke="none" />
        <g transform={`rotate(${plantSway.toFixed(2)}, 0, -76)`}>
          <path d="M -4,-74 C -40,-108 -54,-148 -26,-164 C -6,-150 -2,-114 0,-74 Z" fill="#16A34A" />
          <path d="M 4,-74 C 40,-108 54,-148 26,-164 C 6,-150 2,-114 0,-74 Z" fill="#22C55E" />
          <path d="M 0,-74 C -16,-124 -14,-170 0,-186 C 14,-170 16,-124 0,-74 Z" fill="#4ADE80" />
        </g>
        <path d="M -36,-74 L -26,0 L 26,0 L 36,-74 Z" fill="#F97316" />
        <rect x={-42} y={-84} width={84} height={14} rx={5} fill="#EA580C" />
      </g>
    </g>
  );
};

const CityStreetParkStaticSky = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const skyTop = isNight ? "#0F172A" : isSunset ? "#FB923C" : "#60A5FA";
  const skyBot = isNight ? "#1E293B" : isSunset ? "#FEF3C7" : "#E0F2FE";
  return (
    <g>
      <defs>
        <linearGradient id={`city-park-sky-${timeOfDay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={685} fill={`url(#city-park-sky-${timeOfDay})`} stroke="none" />
      {isNight ? (
        <circle cx={310} cy={155} r={38} fill="#FEF08A" stroke="#141414" strokeWidth={2.8} />
      ) : (
        <circle cx={isSunset ? 1520 : 310} cy={isSunset ? 255 : 155} r={46} fill={isSunset ? "#F97316" : "#FDE047"} />
      )}
    </g>
  );
});

const CityStreetParkStaticTownhousesAndLawn = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
  const townhouses = [
    { x: 70, w: 185, h: 235, fill: isNight ? "#334155" : "#FEF08A", roof: "#DC2626" },
    { x: 270, w: 195, h: 275, fill: isNight ? "#1E293B" : "#BAE6FD", roof: "#0284C7" },
    { x: 480, w: 175, h: 215, fill: isNight ? "#334155" : "#FBCFE8", roof: "#BE185D" },
    { x: 1245, w: 190, h: 265, fill: isNight ? "#1E293B" : "#BBF7D0", roof: "#15803D" },
    { x: 1450, w: 185, h: 225, fill: isNight ? "#334155" : "#FED7AA", roof: "#C2410C" },
    { x: 1650, w: 195, h: 255, fill: isNight ? "#1E293B" : "#DDD6FE", roof: "#6D28D9" },
  ];
  return (
    <g>
      <g id="park-distant-townhouses" opacity={0.94}>
        {townhouses.map((th, idx) => (
          <g key={`th_${idx}`}>
            <rect x={th.x} y={685 - th.h} width={th.w} height={th.h} rx={4} fill={th.fill} />
            <polygon
              points={`${th.x - 10},${685 - th.h} ${th.x + th.w / 2},${648 - th.h} ${th.x + th.w + 10},${685 - th.h}`}
              fill={th.roof}
            />
            {[0, 1].map((r) =>
              [0, 1].map((c) => (
                <rect
                  key={`thw_${r}_${c}`}
                  x={th.x + 28 + c * 78}
                  y={715 - th.h + r * 74}
                  width={42}
                  height={48}
                  rx={4}
                  fill={isNight ? "#FEF08A" : "#FFFFFF"}
                  strokeWidth={2.4}
                />
              ))
            )}
          </g>
        ))}
      </g>
      <path d="M 0,680 Q 480,645 960,672 T 1920,665 L 1920,758 L 0,758 Z" fill={isNight ? "#14532D" : "#4ADE80"} />
    </g>
  );
});

const CityStreetParkStaticWalkwayAndBenches = React.memo<{ timeOfDay: AutoTimeOfDay }>(({ timeOfDay }) => {
  const isNight = timeOfDay === "NIGHT";
  return (
    <g>
      <defs>
        <pattern id="park-walkway-seams-pat" x={0} y={755} width={124} height={71} patternUnits="userSpaceOnUse">
          <line x1={124} y1={0} x2={100} y2={71} stroke="#94A3B8" strokeWidth={2} opacity={0.25} />
        </pattern>
      </defs>
      <rect x={0} y={755} width={1920} height={325} fill={isNight ? "#475569" : "#E2E8F0"} stroke="none" />
      <line x1={0} y1={755} x2={1920} y2={755} stroke="#141414" strokeWidth={3.2} />
      <line x1={0} y1={826} x2={1920} y2={826} stroke="#94A3B8" strokeWidth={2.5} opacity={0.45} />
      <rect x={0} y={755} width={1920} height={71} fill="url(#park-walkway-seams-pat)" stroke="none" />
      {[330, 1560].map((bx, idx) => (
        <g key={`bench_${idx}`} id={idx === 0 ? "park-stone-bench" : undefined} transform={`translate(${bx}, 712)`}>
          <ellipse cx={0} cy={72} rx={118} ry={10} fill="#0F172A" opacity={0.12} stroke="none" />
          <rect x={-92} y={40} width={16} height={30} rx={3} fill="#64748B" />
          <rect x={76} y={40} width={16} height={30} rx={3} fill="#64748B" />
          <rect x={-106} y={-8} width={212} height={24} rx={6} fill="#D97706" />
          <rect x={-112} y={24} width={224} height={18} rx={6} fill="#B45309" />
        </g>
      ))}
    </g>
  );
});

const CityStreetParkBackdrop: React.FC<{ timeOfDay: AutoTimeOfDay; frame: number }> = ({ timeOfDay, frame }) => {
  const isNight = timeOfDay === "NIGHT";
  const cloudDrift = frame * 0.16;
  const breeze = Math.sin(frame * 0.038) * 1.8;

  return (
    <g id="stage-city-street-park" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      <CityStreetParkStaticSky timeOfDay={timeOfDay} />
      {!isNight &&
        [220, 880, 1460].map((bx, i) => {
          const cx = ((bx + cloudDrift * (0.85 + i * 0.12) + 120) % 2160) - 120;
          return (
            <g key={`pk_cl_${i}`} transform={`translate(${cx.toFixed(1)}, ${165 + (i % 2) * 28})`}>
              <path
                d="M -58,14 C -76,14 -80,-6 -58,-12 C -50,-34 -16,-38 -2,-20 C 14,-36 50,-30 54,-8 C 74,-4 72,14 52,14 Z"
                fill="#FFFFFF"
              />
            </g>
          );
        })}
      <CityStreetParkStaticTownhousesAndLawn timeOfDay={timeOfDay} />

      <g id="park-tree-row">
        {[155, 685, 1185, 1765].map((tx, ti) => (
          <g key={`pkt_${ti}`} transform={`translate(${tx}, 752)`}>
            <ellipse cx={0} cy={4} rx={58} ry={9} fill="#0F172A" opacity={0.12} stroke="none" />
            <rect x={-12} y={-112} width={24} height={112} fill="#78350F" />
            <g transform={`rotate(${(breeze * (ti % 2 === 0 ? 1 : -1)).toFixed(2)}, 0, -110)`}>
              <circle cx={0} cy={-152} r={62} fill={isNight ? "#166534" : "#22C55E"} />
              <circle cx={-40} cy={-128} r={40} fill={isNight ? "#15803D" : "#4ADE80"} />
              <circle cx={40} cy={-128} r={40} fill={isNight ? "#15803D" : "#16A34A"} />
            </g>
          </g>
        ))}
      </g>

      <CityStreetParkStaticWalkwayAndBenches timeOfDay={timeOfDay} />
    </g>
  );
};

const SchoolClassroomStaticRoom = React.memo<{
  timeOfDay: AutoTimeOfDay;
  seatedMode?: boolean;
  openFloorOutro?: boolean;
}>(
  ({ timeOfDay, seatedMode = false, openFloorOutro = false }) => {
    const isNight = timeOfDay === "NIGHT";
    const isSunset = timeOfDay === "SUNSET";
    return (
      <g>
        <rect x={0} y={0} width={1920} height={540} fill={isNight ? "#1E293B" : isSunset ? "#FEF3C7" : "#FEFCE8"} stroke="none" />
        <rect x={0} y={540} width={1920} height={225} fill={isNight ? "#334155" : "#DCFCE7"} stroke="none" />
        <line x1={0} y1={540} x2={1920} y2={540} stroke="#141414" strokeWidth={3} />
        <rect x={0} y={765} width={1920} height={315} fill={isNight ? "#475569" : "#E2E8F0"} stroke="none" />
        <line x1={0} y1={765} x2={1920} y2={765} stroke="#141414" strokeWidth={3.2} />
        {/* Subtle tiled floor seams via <pattern> */}
        <defs>
          <pattern id="classroom-floor-seams-pat" x={0} y={765} width={240} height={57} patternUnits="userSpaceOnUse">
            <line x1={240} y1={0} x2={214} y2={57} stroke="#94A3B8" strokeWidth={1.6} opacity={0.22} />
          </pattern>
        </defs>
        <line x1={0} y1={822} x2={1920} y2={822} stroke="#94A3B8" strokeWidth={1.6} opacity={0.22} />
        <rect x={0} y={765} width={1880} height={57} fill="url(#classroom-floor-seams-pat)" stroke="none" />

        {/* Soft diagonal classroom sunbeam falling from left window (zero blur) */}
        {!isNight && (
          <polygon
            points="88,435 358,165 690,765 250,765"
            fill={isSunset ? "#FDE68A" : "#FEF9C3"}
            opacity={isSunset ? 0.22 : 0.17}
            stroke="none"
          />
        )}

        <g id="classroom-chalkboard" transform="translate(500, 155)">
          <rect x={0} y={0} width={860} height={330} rx={12} fill="#14532D" stroke="#92400E" strokeWidth={12} />
          <rect x={0} y={0} width={860} height={330} rx={12} fill="none" stroke="#141414" strokeWidth={3} />
          <rect x={-10} y={326} width={880} height={18} rx={5} fill="#B45309" stroke="#141414" strokeWidth={3} />
          <rect x={140} y={316} width={48} height={12} rx={3} fill="#FDE047" stroke="#141414" strokeWidth={2.2} />
          <rect x={210} y={320} width={28} height={7} rx={2} fill="#FFFFFF" stroke="none" />
          <polygon points="120,245 220,95 310,245" fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.88} />
          <path d="M 430,220 Q 510,105 590,220 T 750,180" fill="none" stroke="#FEF08A" strokeWidth={4.5} strokeLinecap="round" opacity={0.9} />
          <line x1={420} y1={255} x2={765} y2={255} stroke="#FFFFFF" strokeWidth={3.2} opacity={0.75} />
        </g>

        <g transform="translate(1475, 305)">
          <rect x={0} y={0} width={320} height={170} rx={10} fill="#FDE68A" stroke="#92400E" strokeWidth={6} />
          <rect x={26} y={24} width={78} height={96} rx={4} fill="#FFFFFF" strokeWidth={2.2} />
          <rect x={122} y={28} width={78} height={92} rx={4} fill="#BAE6FD" strokeWidth={2.2} />
          <rect x={218} y={22} width={76} height={98} rx={4} fill="#FBCFE8" strokeWidth={2.2} />
        </g>

        {/* Side desks pushed cleanly back when openFloorOutro, or normal side desks when not seatedMode */}
        {!seatedMode &&
          (openFloorOutro ? [72, 1625] : [125, 1515]).map((dx, idx) => (
            <g
              key={`desk_${idx}`}
              id={idx === 0 ? "classroom-student-desks" : undefined}
              transform={openFloorOutro ? `translate(${dx}, 612) scale(0.78)` : `translate(${dx}, 648)`}
            >
              <ellipse cx={135} cy={150} rx={148} ry={10} fill="#0F172A" opacity={0.12} stroke="none" />
              <rect x={82} y={-24} width={106} height={18} rx={4} fill="#D97706" />
              <rect x={92} y={-6} width={12} height={152} fill="#78350F" />
              <rect x={166} y={-6} width={12} height={152} fill="#78350F" />
              <rect x={22} y={22} width={16} height={125} fill="#64748B" />
              <rect x={232} y={22} width={16} height={125} fill="#64748B" />
              <rect x={14} y={22} width={242} height={34} rx={4} fill="#B45309" />
              <rect x={0} y={4} width={270} height={20} rx={6} fill="#D97706" />
            </g>
          ))}
      </g>
    );
  }
);

const SchoolClassroomBackdrop: React.FC<{
  timeOfDay: AutoTimeOfDay;
  frame: number;
  seatedMode?: boolean;
  openFloorOutro?: boolean;
}> = ({
  timeOfDay,
  frame,
  seatedMode = false,
  openFloorOutro = false,
}) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const cloudX = ((30 + frame * 0.15) % 240) - 10;
  const secDeg = (frame * 3) % 360;
  const minDeg = (frame * 0.15 + 120) % 360;

  return (
    <g id="stage-school-classroom" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      <SchoolClassroomStaticRoom timeOfDay={timeOfDay} seatedMode={seatedMode} openFloorOutro={openFloorOutro} />

      <g id="classroom-window" transform="translate(88, 165)">
        <rect x={0} y={0} width={270} height={270} rx={10} fill={isNight ? "#0F172A" : isSunset ? "#FDBA74" : "#7DD3FC"} />
        {!isNight && (
          <>
            <ellipse cx={Math.max(42, Math.min(228, cloudX))} cy={70} rx={36} ry={15} fill="#FFFFFF" stroke="none" opacity={0.9} />
            {/* Outdoor campus greenery visible outside classroom window (Layer 1 depth) */}
            <path d="M 4,266 Q 68,204 136,228 Q 204,196 266,226 L 266,266 Z" fill="#4ADE80" stroke="none" />
            <circle cx={64} cy={222} r={26} fill="#22C55E" stroke="none" />
            <circle cx={216} cy={228} r={28} fill="#16A34A" stroke="none" />
          </>
        )}
        <line x1={135} y1={0} x2={135} y2={270} strokeWidth={3.5} />
        <line x1={0} y1={135} x2={270} y2={135} strokeWidth={3.5} />
        <rect x={0} y={0} width={270} height={270} rx={10} fill="none" stroke="#92400E" strokeWidth={8} />
        <rect x={0} y={0} width={270} height={270} rx={10} fill="none" stroke="#141414" strokeWidth={3} />
      </g>

      <g id="classroom-wall-clock" transform="translate(1545, 215)">
        <circle cx={0} cy={0} r={46} fill="#FFFFFF" stroke="#141414" strokeWidth={3.8} />
        <line x1={0} y1={0} x2={Math.sin((minDeg * Math.PI) / 180) * 24} y2={-Math.cos((minDeg * Math.PI) / 180) * 24} stroke="#141414" strokeWidth={4} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin((secDeg * Math.PI) / 180) * 32} y2={-Math.cos((secDeg * Math.PI) / 180) * 32} stroke="#EF4444" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={0} cy={0} r={4} fill="#141414" stroke="none" />
      </g>
    </g>
  );
};

const HomeKitchenStaticLayer = React.memo<{
  timeOfDay: AutoTimeOfDay;
  seatedDiningMode?: boolean;
}>(({ timeOfDay, seatedDiningMode = false }) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  return (
    <g>
      <rect x={0} y={0} width={1920} height={765} fill={isNight ? "#1E293B" : isSunset ? "#FFFBEB" : "#FFF7ED"} stroke="none" />
      <rect x={660} y={365} width={680} height={175} fill={isNight ? "#334155" : isSunset ? "#FEF3C7" : "#E0F2FE"} stroke="#94A3B8" strokeWidth={2} />
      <rect x={0} y={765} width={1920} height={315} fill={isNight ? "#334155" : "#E7C9A9"} stroke="none" />
      <line x1={0} y1={765} x2={1920} y2={765} stroke="#141414" strokeWidth={3.2} />

      {/* Warm golden ceiling pendant lamp for cozy dinner lighting (0 blur) */}
      {(isSunset || seatedDiningMode) && (
        <g id="kitchen-pendant-lamp">
          <polygon points="910,96 1010,96 1340,765 580,765" fill="#FEF08A" opacity={0.16} stroke="none" />
          <line x1={960} y1={0} x2={960} y2={68} stroke="#475569" strokeWidth={4} />
          <path d="M 910,104 C 910,66 1010,66 1010,104 Z" fill="#F59E0B" stroke="#141414" strokeWidth={3} />
          <ellipse cx={960} cy={104} rx={44} ry={10} fill="#FEF9C3" stroke="#D97706" strokeWidth={2} />
        </g>
      )}

      <g id="kitchen-cabinets" transform="translate(680, 145)">
        <rect x={0} y={0} width={350} height={185} rx={8} fill={isNight ? "#475569" : "#FDE68A"} />
        <line x1={175} y1={0} x2={175} y2={185} strokeWidth={3} />
        <line x1={155} y1={115} x2={155} y2={155} strokeWidth={4} strokeLinecap="round" />
        <line x1={195} y1={115} x2={195} y2={155} strokeWidth={4} strokeLinecap="round" />
        <path d="M 455,0 L 515,0 L 515,115 L 595,165 L 375,165 L 455,115 Z" fill="#94A3B8" />
      </g>

      <g transform="translate(670, 535)">
        <ellipse cx={335} cy={244} rx={345} ry={11} fill="#0F172A" opacity={0.12} stroke="none" />
        <rect x={0} y={18} width={670} height={222} rx={6} fill={isNight ? "#475569" : "#F59E0B"} />
        <rect x={-8} y={0} width={686} height={22} rx={6} fill="#F8FAFC" />
        <line x1={225} y1={22} x2={225} y2={240} strokeWidth={2.8} />
        <line x1={445} y1={22} x2={445} y2={240} strokeWidth={2.8} />
        <path d="M 115,0 L 115,-42 Q 115,-62 142,-62 L 154,-46" fill="none" stroke="#64748B" strokeWidth={7} strokeLinecap="round" />
        <g transform="translate(495, 0)">
          <rect x={-46} y={-52} width={92} height={52} rx={8} fill="#EA580C" />
          <ellipse cx={0} cy={-52} rx={48} ry={9} fill="#F97316" />
          <circle cx={0} cy={-62} r={6} fill="#1E293B" />
        </g>
      </g>

      <g transform="translate(1365, 275)">
        <ellipse cx={80} cy={504} rx={88} ry={10} fill="#0F172A" opacity={0.12} stroke="none" />
        <rect x={0} y={0} width={160} height={500} rx={14} fill={isNight ? "#64748B" : "#E0F2FE"} />
        <line x1={0} y1={185} x2={160} y2={185} strokeWidth={3.2} />
        <line x1={22} y1={95} x2={22} y2={155} strokeWidth={5} strokeLinecap="round" />
        <line x1={22} y1={215} x2={22} y2={295} strokeWidth={5} strokeLinecap="round" />
      </g>

      {!seatedDiningMode && (
        <g id="kitchen-dining-table" transform="translate(1565, 650)">
          <ellipse cx={150} cy={148} rx={162} ry={10} fill="#0F172A" opacity={0.12} stroke="none" />
          <rect x={24} y={24} width={16} height={122} rx={4} fill="#92400E" />
          <rect x={260} y={24} width={16} height={122} rx={4} fill="#92400E" />
          <rect x={0} y={0} width={300} height={24} rx={8} fill="#B45309" />
          <path d="M 105,0 Q 150,16 195,0 Z" fill="#FFFFFF" />
          <circle cx={136} cy={-10} r={12} fill="#EF4444" />
          <circle cx={162} cy={-10} r={12} fill="#FACC15" />
        </g>
      )}
    </g>
  );
});

const HomeKitchenBackdrop: React.FC<{
  timeOfDay: AutoTimeOfDay;
  frame: number;
  seatedDiningMode?: boolean;
}> = ({ timeOfDay, frame, seatedDiningMode = false }) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const cloudX = ((35 + frame * 0.16) % 250) - 10;
  const steamRise = (frame * 1.4) % 36;

  return (
    <g id="stage-home-kitchen" stroke="#141414" strokeWidth={3} strokeLinejoin="round">
      <HomeKitchenStaticLayer timeOfDay={timeOfDay} seatedDiningMode={seatedDiningMode} />

      <g id="kitchen-window" transform="translate(135, 175)">
        <rect x={0} y={0} width={300} height={250} rx={12} fill={isNight ? "#0F172A" : isSunset ? "#FDBA74" : "#7DD3FC"} />
        {!isNight && (
          <ellipse cx={Math.max(44, Math.min(256, cloudX))} cy={74} rx={36} ry={15} fill={isSunset ? "#FEF3C7" : "#FFFFFF"} stroke="none" opacity={0.88} />
        )}
        <line x1={150} y1={0} x2={150} y2={250} strokeWidth={3.5} />
        <line x1={0} y1={125} x2={300} y2={125} strokeWidth={3.5} />
        <rect x={0} y={0} width={300} height={250} rx={12} fill="none" stroke="#94A3B8" strokeWidth={8} />
        <rect x={0} y={0} width={300} height={250} rx={12} fill="none" stroke="#141414" strokeWidth={3} />
        <rect x={-16} y={246} width={332} height={18} rx={5} fill="#D97706" />
        <path d="M 222,246 L 228,216 L 258,216 L 264,246 Z" fill="#EF4444" strokeWidth={2.5} />
        <circle cx={243} cy={204} r={16} fill="#22C55E" strokeWidth={2.5} />
      </g>

      {/* Làn hơi thơm bay nhẹ 60fps trên nồi súp */}
      <g transform="translate(1165, 535)">
        {[-16, 14].map((sx, si) => {
          const sy = -76 - ((steamRise + si * 18) % 36);
          return (
            <path
              key={`stm_${si}`}
              d={`M ${sx},${sy} Q ${sx - 8},${sy - 14} ${sx},${sy - 28}`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.65}
            />
          );
        })}
      </g>
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
      {prop === "POINTER" && (
        <g id="hand-prop-pointer" transform="rotate(-22)">
          <line x1={-12} y1={0} x2={122} y2={0} stroke="#141414" strokeWidth={8.5} strokeLinecap="round" />
          <line x1={-12} y1={0} x2={24} y2={0} stroke="#1E293B" strokeWidth={5.5} strokeLinecap="round" />
          <line x1={24} y1={0} x2={116} y2={0} stroke="#E2E8F0" strokeWidth={4.2} strokeLinecap="round" />
          <circle cx={124} cy={0} r={6.5} fill="#EF4444" stroke="#141414" strokeWidth={2.4} />
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
      {prop === "BOOK" && (
        <g id="hand-prop-book" transform="translate(22, -8) rotate(-10)">
          <rect x={-22} y={-28} width={44} height={56} rx={5} fill="#2563EB" stroke="#141414" strokeWidth={3.2} />
          <rect x={-22} y={-28} width={9} height={56} rx={3} fill="#1E40AF" stroke="#141414" strokeWidth={2.8} />
          <rect x={-7} y={-16} width={20} height={12} rx={2} fill="#FEF08A" stroke="#141414" strokeWidth={2} />
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
    spec.stageType === "CITY_STREET" ||
    spec.stageType === "CITY_STREET_PARK";
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
 * V22.6: Xác định beat đang ở chế độ HOST_EXPLAIN_OVERLAY (Freeze-Frame Host kèm bảng trắng hoặc Solo Host).
 */
export function isHostExplainOverlayBeat(spec?: AutoEpisodeBeat | null): boolean {
  if (!spec) return false;
  return spec.stageType === "HOST_EXPLAIN_OVERLAY" || spec.overlayMode === "HOST_EXPLAIN";
}

/**
 * V22.6: Tự động ẩn banner tiêu đề đầu Hồi (HỒI X) ở đỉnh khung hình khi beat đang dùng HOST_EXPLAIN_OVERLAY
 * hoặc đang hiển thị Full-Screen SVG (tránh đè lên bảng trắng & pill tiêu đề của sơ đồ Full-Screen).
 * Chỉ giữ banner trên các cảnh đời thường thoáng phía trên (như SCHOOL_CLASSROOM, COUNTRYSIDE_YARD, CITY_LIVING_ROOM...).
 */
export function shouldHideTopChapterBanner(
  spec?: AutoEpisodeBeat | null,
  episodeStoryMode?: "CLASSIC_HOST" | "ANIMAL_POV" | "HUMAN_ANIMAL_POV"
): boolean {
  if (!spec) return false;
  const effectiveStoryMode = episodeStoryMode ?? spec.storyMode ?? "CLASSIC_HOST";
  if (effectiveStoryMode === "ANIMAL_POV" || effectiveStoryMode === "HUMAN_ANIMAL_POV") {
    return true;
  }
  return isFullScreenCustomVisualBeat(spec) || isHostExplainOverlayBeat(spec);
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
// 3.9. V22.4: LỚP PHỦ HỒI TƯỞNG PHẲNG (FlashbackOverlayStatic — React.memo, 0 blur)
// =============================================================================

const FlashbackOverlayStatic: React.FC = React.memo(() => (
  <g id="layer-flashback-overlay" pointerEvents="none">
    {/* Lớp màu kem/sepia mờ phẳng lên toàn khung hình */}
    <rect x={0} y={0} width={1920} height={1080} fill="#FEF3C7" opacity={0.28} />
    {/* Khung viền trắng mờ mềm 4 cạnh */}
    <rect
      x={9}
      y={9}
      width={1902}
      height={1062}
      rx={28}
      fill="none"
      stroke="#FFFFFF"
      strokeOpacity={0.6}
      strokeWidth={18}
    />
    <rect
      x={24}
      y={24}
      width={1872}
      height={1032}
      rx={22}
      fill="none"
      stroke="#F59E0B"
      strokeOpacity={0.34}
      strokeWidth={3}
    />
    {/* Tag nhỏ góc trên bên trái "Hồi tưởng" */}
    <g transform="translate(52, 46)">
      <rect
        x={0}
        y={0}
        width={172}
        height={46}
        rx={23}
        fill="#FFFBEB"
        fillOpacity={0.94}
        stroke="#D97706"
        strokeWidth={2.8}
      />
      <circle cx={26} cy={23} r={7} fill="#F59E0B" />
      <text
        x={44}
        y={30}
        fill="#92400E"
        fontSize={21}
        fontWeight={800}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        Hồi tưởng
      </text>
    </g>
  </g>
));

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
  isContinuationHost?: boolean;
}> = ({ spec, frame, localFrame, durationFrames, u, groundY = 840, fps = 60, isContinuationHost = false }) => {
  const isHostExplain = spec.stageType === "HOST_EXPLAIN_OVERLAY" || spec.overlayMode === "HOST_EXPLAIN";
  const holdHostVeilSteady = Boolean(isHostExplain && (isContinuationHost || spec.transitionIn === "CUT"));
  const effectiveStageType = isHostExplain ? (spec.freezeStage ?? "SCHOOL_CLASSROOM") : spec.stageType;
  const stageRenderFrame = isHostExplain ? (spec.freezeFrame ?? 90) : frame;
  const resolvedBoardTheme = spec.boardTheme ?? "LAB_WHITEBOARD";
  const isSoloCenterHost = Boolean(
    isHostExplain &&
      spec.actors.length === 1 &&
      (spec.actors[0].slot === "CENTER" ||
        (Array.isArray(spec.actors[0].timeline) &&
          spec.actors[0].timeline.length > 0 &&
          spec.actors[0].timeline[0].startX >= 700))
  );
  const hasHostWhiteboard = Boolean(
    isHostExplain &&
      !isSoloCenterHost &&
      (resolvedBoardTheme === "NATURE_FIELD_BOARD" ||
        spec.labBoard === "MIRROR_NEURONS_YAWN" ||
        spec.labBoard === "ACOUSTICS_CRINGE_ALARM")
  );
  const isNight = spec.timeOfDay === "NIGHT";
  const isOutdoor =
    effectiveStageType === "COUNTRYSIDE_YARD" ||
    effectiveStageType === "SIMPLE_GRASS_FIELD" ||
    effectiveStageType === "CITY_STREET" ||
    effectiveStageType === "CITY_STREET_PARK" ||
    effectiveStageType === "FOREST_PARK" ||
    effectiveStageType === "FOREST_WINTER_STAGE" ||
    effectiveStageType === "BACKYARD_BALCONY_PET" ||
    effectiveStageType === "WATER_POND_OCEAN";

  const slotBaseX = (slot: AutoActorSpec["slot"]): number =>
    slot === "LEFT" ? 490 : slot === "RIGHT" ? 1390 : 960;

  const sceneProgressP = Math.max(0, Math.min(1, localFrame / Math.max(1, durationFrames)));
  const CustomVisualComponent = resolveCustomVisualComponent(spec.customVisual);
  const hasCustomVisual = Boolean(CustomVisualComponent);
  const isFullScreenCustomVisual = Boolean(CustomVisualComponent && spec.fullScreenVisual === true);

  // V20.0 / V23.6 / V24.0: Chế độ hoạt họa tràn màn hình 1920x1080 — nhúng trực tiếp <svg> thuần (0% HTML layout overhead)
  // Khi stageType="CLEAN_EXPLAINER" kèm explainerPalette (V24.0 Full-Bleed Science Visuals) -> vẽ CleanExplainerStage làm nền tràn khung bên dưới!
  // Phụ đề phía dưới (zIndex 60) và chapterBanner phía trên (zIndex 45) vẫn do V7MovieComposition giữ ở layer trên cùng.
  if (isFullScreenCustomVisual && CustomVisualComponent) {
    const mountCleanExplainerUnderlay =
      spec.stageType === "CLEAN_EXPLAINER" && Boolean(spec.explainerPalette);
    return (
      <g id={`universal-auto-stage-${spec.id}`} data-fullscreen-visual="true">
        {mountCleanExplainerUnderlay && (
          <CleanExplainerStage
            palette={spec.explainerPalette}
            frame={stageRenderFrame}
            uid={spec.id}
          />
        )}
        <g id={`layer-custom-visual-fullscreen-${spec.id}`}>
          <svg
            x={CUSTOM_VISUAL_FULLSCREEN_RECT.left}
            y={CUSTOM_VISUAL_FULLSCREEN_RECT.top}
            width={CUSTOM_VISUAL_FULLSCREEN_RECT.width}
            height={CUSTOM_VISUAL_FULLSCREEN_RECT.height}
            viewBox="0 0 1920 1080"
            style={{ overflow: "hidden" }}
          >
            <CustomVisualComponent
              progress={sceneProgressP}
              frame={localFrame}
              fps={fps}
              step={spec.visualStep ?? 0}
              visualStep={spec.visualStep ?? 0}
            />
          </svg>
        </g>
        <KineticHeadlineLayer
          headline={spec.kineticHeadline}
          timeBadge={spec.timeBadge}
          localFrame={localFrame}
          fps={fps}
        />
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
    actorBlinkSeed: number;
    actorScale: number;
    isLieSleepMode: boolean;
    sleepAnchorX: number;
    bubbleAppear: number;
    bubbleDisappear: number;
    isSpeaking: boolean;
    isActivelyTalkingPose: boolean;
    actorX: number;
    actorGroundY: number;
    headWorldY: number;
    effectiveFacing: "LEFT" | "RIGHT";
    activeExprEnum: AutoActorExpression;
    activeHandProp: AutoHandProp;
    activeShiver: boolean;
    shiverOpacity: number;
    pose: V18PoseSnapshot["pose"] | "sittingBehindDesk";
    seatedHipY?: number;
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
    const actorScale = resolvePresetDefaultScale(actor.preset, actor.appearance); // V22.0: Hỗ trợ appearance.scale tùy chọn (BOY=0.76, Adult/CUSTOM=1.0)
    const appearanceSeedKey = actor.appearance
      ? `${actor.appearance.hairStyle || ""}_${actor.appearance.outfitStyle || ""}_${actor.appearance.outfitColor || ""}`
      : "";
    const presetHash = Array.from(`${actor.preset}:${appearanceSeedKey}`).reduce(
      (acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 100003,
      7
    );
    const actorBlinkSeed = aIdx * 97 + presetHash; // V21.0: Lệch pha chớp mắt & nhịp thở rõ rệt theo actor index + preset/appearance
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
        actorBlinkSeed,
        actorScale,
        isLieSleepMode: true,
        sleepAnchorX,
        bubbleAppear,
        bubbleDisappear,
        isSpeaking,
        isActivelyTalkingPose: false,
        actorX: sleepAnchorX,
        actorGroundY: actor.groundY ?? groundY,
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

    const defaultActorHandProp: AutoHandProp =
      actor.handProp && actor.handProp !== "NONE"
        ? actor.handProp
        : actor.appearance?.prop && actor.appearance.prop !== "NONE"
        ? actor.appearance.prop
        : "NONE";
    let actorX = baseX;
    let effectiveFacing: "LEFT" | "RIGHT" = pinSoloActorLeft ? "RIGHT" : actor.facing;
    let activeExprEnum: AutoActorExpression = actor.expression;
    let activeHandProp: AutoHandProp = defaultActorHandProp;
    let activeShiver = Boolean(actor.shiver);
    let pose: V18PoseSnapshot["pose"] | "sittingBehindDesk" = "standing";
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
        defaultActorHandProp,
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
          defaultActorHandProp,
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

    // V22.5: Hiệu ứng trượt mượt vào khung hình (~12 frame) cho Host bên trái trong HOST_EXPLAIN_OVERLAY
    // Khi chuyển liên tiếp giữa 2 beat Host cùng bối cảnh (holdHostVeilSteady), giữ BOY đứng vững không nhảy!
    if (isHostExplain && hasHostWhiteboard && aIdx === 0 && !holdHostVeilSteady) {
      const slideT = smoothstep(0, 1, Math.min(1, localFrame / 12));
      actorX = actorX - (1 - slideT) * 110;
    }

    const actorGroundY = actor.groundY ?? groundY;
    const isSeatedActor = Boolean(actor.seated === true && pose !== "walking" && pose !== "running");
    if (isSeatedActor) {
      pose = "sittingBehindDesk";
      flightLift = 0;
      crouchDepth = 0;
    }
    const seatedSeatOffset =
      effectiveStageType === "SCHOOL_CLASSROOM"
        ? 128
        : effectiveStageType === "HOME_KITCHEN"
        ? 132
        : effectiveStageType === "CITY_LIVING_ROOM"
        ? 106
        : 108;
    const seatedHipYVal = isSeatedActor
      ? Math.max(-185, Math.min(-85, -seatedSeatOffset / actorScale))
      : undefined;

    if (actor.yawning) {
      overrideMouth = "gasp";
      if (activeExprEnum !== "SURPRISED" && activeExprEnum !== "SHOCKED") {
        overrideEyes = "closed";
      }
    }

    const facingDir: 1 | -1 = effectiveFacing === "LEFT" ? -1 : 1;
    const isActorWalking = (pose === "walking" || pose === "running" || walkCycle > 0) && walkWeight > 0.02;
    const actorIdleBreathFactor = computeStickmanIdleBreathFactor(
      frame,
      actorBlinkSeed,
      true,
      isActorWalking ? walkWeight : 0
    );
    const actorEffectiveScaleY = actorScale * actorIdleBreathFactor * anticipationScaleY;
    const estHipY = seatedHipYVal !== undefined ? seatedHipYVal : -173 + crouchDepth - flightLift;
    const headWorldY = actorGroundY + (estHipY - TORSO_LEN - 70) * actorEffectiveScaleY;

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
      holdingTarget?.rightGrip?.y ?? actorGroundY - (216 + flightLift - crouchDepth * 0.65) * actorEffectiveScaleY;
    let writePenWorld: { x: number; y: number } | null = null;

    if (blendedArmPose) {
      if (v18ActionPose === "WRITE_NOTE") {
        const nbPos = projectUpperLocalToWorld(
          blendedArmPose.leftWrist,
          estHipY,
          torsoTiltDeg,
          actorX,
          actorGroundY,
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
          actorGroundY,
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
          actorGroundY,
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

    // V23.1: Hỗ trợ vẫy tay đứng vững (0px nhấc chân) khi actor.motion === "WAVE" trên timeline đứng yên
    if (
      timelineResolved &&
      actor.motion === "WAVE" &&
      (v18ActionPose === "NOD_SMILE" || v18ActionPose === "TALK_GESTURE")
    ) {
      waveRightArm = true;
      blendedArmPose = undefined;
      v18ActionPose = undefined;
      flightLift = 0;
      crouchDepth = 0;
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
      actorBlinkSeed,
      actorScale,
      isLieSleepMode: false,
      sleepAnchorX: baseX,
      bubbleAppear,
      bubbleDisappear,
      isSpeaking,
      isActivelyTalkingPose,
      actorX,
      actorGroundY,
      headWorldY,
      effectiveFacing,
      activeExprEnum,
      activeHandProp,
      activeShiver,
      shiverOpacity,
      pose,
      seatedHipY: seatedHipYVal,
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

  const seatedClassroomActors =
    !isHostExplain && effectiveStageType === "SCHOOL_CLASSROOM"
      ? resolvedActors.filter((ra) => ra.actor.seated === true)
      : [];
  const hasClassroomSeatedRow = seatedClassroomActors.length > 0;
  const seatedKitchenActors =
    !isHostExplain && effectiveStageType === "HOME_KITCHEN"
      ? resolvedActors.filter((ra) => ra.actor.seated === true)
      : [];
  const hasKitchenSeatedDinner =
    seatedKitchenActors.length > 0 ||
    Boolean(
      effectiveStageType === "HOME_KITCHEN" &&
        spec.kitchenDetail &&
        spec.kitchenDetail !== "NONE"
    );
  const isLivingRoomCatMode = Boolean(
    effectiveStageType === "CITY_LIVING_ROOM" &&
      (spec.livingRoomDetail === "CAT_RUG" ||
        spec.livingRoomDetail === "CAT_ALERT" ||
        spec.livingRoomDetail === "CAT_STAND" ||
        spec.livingRoomDetail === "CAT_SOFA")
  );
  const isLivingRoomDogMode = Boolean(
    effectiveStageType === "CITY_LIVING_ROOM" &&
      spec.livingRoomDetail &&
      spec.livingRoomDetail !== "NONE" &&
      spec.livingRoomDetail !== "OUTRO_OPEN_FLOOR" &&
      !isLivingRoomCatMode
  );
  const freezeLivingRoomCat = Boolean(
    isHostExplain && spec.freezeStage === "CITY_LIVING_ROOM" && spec.labBoard === "CAT_RIGHTING_PHYSICS"
  );
  const freezeLivingRoomDog = Boolean(
    isHostExplain &&
      spec.freezeStage === "CITY_LIVING_ROOM" &&
      (spec.labBoard === "MIRROR_NEURONS_YAWN" || !spec.labBoard)
  );
  const hasLivingRoomDog = isLivingRoomDogMode;
  const hasLivingRoomPet = isLivingRoomDogMode || isLivingRoomCatMode;
  const hostVeilOpacity = isHostExplain
    ? holdHostVeilSteady
      ? 0.84
      : 0.84 * Math.min(1, Math.max(0.25, localFrame / 12))
    : 0;

  return (
    <g id={`universal-auto-stage-${spec.id}`}>
      <g transform={`translate(${camFocusX}, ${camFocusY}) scale(${camZoom.toFixed(4)}) translate(${-camFocusX}, ${-camFocusY})`}>
        {/* 1. BỐI CẢNH (HỖ TRỢ ĐẦY ĐỦ FREEZE-FRAME CHO HOST_EXPLAIN_OVERLAY) */}
        {effectiveStageType === "COUNTRYSIDE_YARD" && (
          <CountrysideYardBackdrop
            timeOfDay={spec.timeOfDay}
            frame={stageRenderFrame}
            groundY={groundY}
            chongTreCentered={spec.actors.some((a) => a.seated === true)}
            showPorchFan={spec.yardDetail === "PORCH_FAN"}
          />
        )}
        {effectiveStageType === "SIMPLE_GRASS_FIELD" && (
          <SimpleGrassFieldBackdrop
            timeOfDay={spec.timeOfDay}
            frame={stageRenderFrame}
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
        {effectiveStageType === "BEDROOM_INDOOR" && (
          <BedroomIndoorBackdrop
            timeOfDay={spec.timeOfDay}
            frame={stageRenderFrame}
            groundY={groundY}
            rainOutside={spec.weather === "RAIN" || spec.weather === "STORM"}
          />
        )}
        {effectiveStageType === "CITY_STREET" && (
          <CityStreetBackdrop timeOfDay={spec.timeOfDay} frame={stageRenderFrame} groundY={groundY} />
        )}
        {effectiveStageType === "CITY_LIVING_ROOM" && (
          <CityLivingRoomBackdrop
            timeOfDay={spec.timeOfDay}
            frame={stageRenderFrame}
            hasPetDog={hasLivingRoomPet || freezeLivingRoomDog || freezeLivingRoomCat}
            openFloorOutro={spec.livingRoomDetail === "OUTRO_OPEN_FLOOR"}
          />
        )}
        {effectiveStageType === "CITY_STREET_PARK" && (
          <CityStreetParkBackdrop timeOfDay={spec.timeOfDay} frame={stageRenderFrame} />
        )}
        {effectiveStageType === "SCHOOL_CLASSROOM" && (
          <SchoolClassroomBackdrop
            timeOfDay={spec.timeOfDay}
            frame={stageRenderFrame}
            seatedMode={hasClassroomSeatedRow}
            openFloorOutro={spec.classroomDetail === "OUTRO_OPEN_FLOOR"}
          />
        )}
        {effectiveStageType === "HOME_KITCHEN" && (
          <HomeKitchenBackdrop
            timeOfDay={spec.timeOfDay}
            frame={stageRenderFrame}
            seatedDiningMode={hasKitchenSeatedDinner || (isHostExplain && spec.freezeStage === "HOME_KITCHEN")}
          />
        )}
        {effectiveStageType === "FOREST_PARK" && (
          <FOREST_PARK_BACKDROP timeOfDay={spec.timeOfDay} frame={stageRenderFrame} uid={spec.id} />
        )}
        {effectiveStageType === "FOREST_WINTER_STAGE" && (
          <ForestWinterStage
            season={spec.forestSeason}
            detail={spec.forestDetail}
            timeOfDay={spec.timeOfDay}
            frame={stageRenderFrame}
            localFrame={localFrame}
            durationFrames={durationFrames}
            uid={spec.id}
          />
        )}
        {effectiveStageType === "OCEAN_UNDERWATER" && (
          <OCEAN_UNDERWATER_BACKDROP timeOfDay={spec.timeOfDay} frame={stageRenderFrame} uid={spec.id} />
        )}
        {effectiveStageType === "BACKYARD_BALCONY_PET" && (
          <BACKYARD_BALCONY_PET timeOfDay={spec.timeOfDay} frame={stageRenderFrame} uid={spec.id} />
        )}
        {effectiveStageType === "SCIENCE_LAB_ROOM" && (
          <ScienceLabBackdrop
            timeOfDay={spec.timeOfDay}
            frame={stageRenderFrame}
            groundY={groundY}
            labBoard={spec.labBoard}
          />
        )}
        {effectiveStageType === "DOCTOR_CLINIC" && (
          <DoctorClinicBackdrop timeOfDay={spec.timeOfDay} frame={stageRenderFrame} groundY={groundY} />
        )}
        {effectiveStageType === "WATER_POND_OCEAN" && (
          <LotusPondBackdrop timeOfDay={spec.timeOfDay} frame={stageRenderFrame} groundY={groundY} />
        )}
        {effectiveStageType === "UNDERGROUND_EARTH_CUTAWAY" && (
          <UndergroundCrossSectionStage frame={stageRenderFrame} localFrame={isHostExplain ? 45 : localFrame} showAnts={true} />
        )}
        {effectiveStageType === "SPACE_COSMOS" && <SpaceCosmosBackdrop frame={stageRenderFrame} groundY={groundY} />}
        {effectiveStageType === "ANECHOIC_CHAMBER" && (
          <AnechoicChamberBackdrop timeOfDay={spec.timeOfDay} frame={stageRenderFrame} groundY={groundY} />
        )}
        {effectiveStageType === "CLEAN_EXPLAINER" && (
          <>
            <CleanExplainerStage palette={spec.explainerPalette} frame={stageRenderFrame} uid={spec.id} />
            {(isOctopusV24ExplainerMode(spec.oceanDetail) ||
              (spec.storyMode === "ANIMAL_POV" &&
                spec.labBoard === "OCTOPUS_INVISIBLE_CAMO" &&
                spec.actors.length === 0)) && (
              <OctopusV24ExplainerKit
                mode={spec.oceanDetail ?? "V24_EXPLAIN_INTRO_WAVE"}
                frame={stageRenderFrame}
                localFrame={localFrame}
                durationFrames={durationFrames}
              />
            )}
            {isFrogV24ExplainerMode(spec.forestDetail) && (
              <FrogV24ExplainerKit
                mode={spec.forestDetail!}
                frame={stageRenderFrame}
                localFrame={localFrame}
                durationFrames={durationFrames}
              />
            )}
          </>
        )}
        {effectiveStageType === "EXPLAINER_POLKA_DOT" && (
          <>
            <MemoExplainerPolkaDotBackdrop
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

        {/* 1.2. Ghế gỗ học sinh phía SAU nhân vật khi ngồi học trong SCHOOL_CLASSROOM */}
        {hasClassroomSeatedRow && (
          <ClassroomSeatedChairsBack
            positions={seatedClassroomActors.map((ra) => Math.round(ra.actorX))}
            groundY={groundY}
          />
        )}

        {/* 1.2B. V22.7: Ghế ăn gỗ phía SAU gia đình khi ngồi ăn tối trong HOME_KITCHEN */}
        {!isHostExplain && seatedKitchenActors.length > 0 && (
          <KitchenDiningChairsBack
            positions={seatedKitchenActors.map((ra) => Math.round(ra.actorX))}
            groundY={groundY}
          />
        )}

        {/* 1.2C. V22.7: Hiệu ứng phấn cào bảng / viết nghiêng 45 độ trên bảng đen SCHOOL_CLASSROOM */}
        {!isHostExplain &&
          effectiveStageType === "SCHOOL_CLASSROOM" &&
          (spec.classroomDetail === "CHALK_SCRATCH_WAVE" || spec.classroomDetail === "CHALK_WRITE_45DEG") && (
            <ClassroomBoardScreechOverlay mode={spec.classroomDetail} frame={localFrame} />
          )}

        {/* 1.3. Chú chó cưng / mèo cưng 2D trong CITY_LIVING_ROOM (tự đóng băng đúng loài khi HOST_EXPLAIN_OVERLAY) */}
        {(hasLivingRoomDog || freezeLivingRoomDog) && (
          <LivingRoomPetDog
            mode={hasLivingRoomDog ? spec.livingRoomDetail! : "DOG_REST"}
            frame={stageRenderFrame}
          />
        )}
        {(isLivingRoomCatMode || freezeLivingRoomCat) && (
          <LivingRoomPetCat
            mode={isLivingRoomCatMode ? spec.livingRoomDetail! : "CAT_RUG"}
            frame={stageRenderFrame}
          />
        )}

        {/* 1.3B. V23.0: Đạo cụ sân hiên & chú mèo Mướp / lưới an toàn cho BACKYARD_BALCONY_PET */}
        {effectiveStageType === "BACKYARD_BALCONY_PET" &&
          spec.balconyDetail &&
          spec.balconyDetail !== "NONE" && (
            <BackyardBalconyCatStageKit
              mode={spec.balconyDetail}
              frame={stageRenderFrame}
              localFrame={isHostExplain ? (spec.freezeFrame ?? 90) : localFrame}
              durationFrames={durationFrames}
            />
          )}

        {/* 1.3C. V23.5: Rạn san hô, chú bạch tuộc Tuộc & chú cá mập hiền cho OCEAN_UNDERWATER */}
        {effectiveStageType === "OCEAN_UNDERWATER" &&
          ((spec.oceanDetail && spec.oceanDetail !== "NONE") ||
            (isHostExplain && spec.labBoard === "OCTOPUS_INVISIBLE_CAMO")) && (
            <OceanUnderwaterStoryKit
              mode={spec.oceanDetail && spec.oceanDetail !== "NONE" ? spec.oceanDetail : "OCTO_ROCK_CAMO"}
              frame={stageRenderFrame}
              localFrame={isHostExplain ? (spec.freezeFrame ?? 90) : localFrame}
              durationFrames={durationFrames}
              bubble={spec.oceanBubble}
              speaker={spec.oceanSpeaker}
              isHostExplain={isHostExplain}
            />
          )}

        {/* 1.5. V22.5–V23.0: LỚP PHỦ TRẮNG SỮA PHẲNG & BẢNG CHUYÊN ĐỀ CHO HOST_EXPLAIN_OVERLAY (0% blur!) */}
        {isHostExplain && (
          <g id="layer-host-explain-veil">
            <rect
              x={0}
              y={0}
              width={1920}
              height={1080}
              fill="#F8FAFC"
              opacity={hostVeilOpacity.toFixed(3)}
            />
            <rect x={0} y={778} width={1920} height={302} fill="#E2E8F0" opacity={0.42} />
            <line x1={0} y1={778} x2={1920} y2={778} stroke="#CBD5E1" strokeWidth={2.5} />
            {hasHostWhiteboard &&
              (resolvedBoardTheme === "NATURE_FIELD_BOARD" ? (
                <HostNatureFieldBoard
                  highlight={spec.hostBoardHighlight}
                  frame={localFrame}
                  title={spec.natureBoardTitle}
                  labBoard={spec.labBoard}
                />
              ) : spec.labBoard === "ACOUSTICS_CRINGE_ALARM" ? (
                <HostAcousticsCringeBoard highlight={spec.hostBoardHighlight} frame={localFrame} />
              ) : (
                <HostMirrorNeuronsBoard highlight={spec.hostBoardHighlight} frame={localFrame} />
              ))}
          </g>
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

        {/* 2.5. V19.0 / V23.6: HOẠT HỌA MINH HỌA RIÊNG THEO BEAT (customVisual) — <svg> THUẦN 0% HTML OVERHEAD */}
        {CustomVisualComponent && (
          <g id={`layer-custom-visual-${spec.id}`}>
            <svg
              x={CUSTOM_VISUAL_STAGE_RECT.left}
              y={CUSTOM_VISUAL_STAGE_RECT.top}
              width={CUSTOM_VISUAL_STAGE_RECT.width}
              height={CUSTOM_VISUAL_STAGE_RECT.height}
              viewBox="0 0 1120 680"
              style={{ overflow: "visible" }}
            >
              <CustomVisualComponent
                progress={sceneProgressP}
                frame={localFrame}
                fps={fps}
                step={spec.visualStep ?? 0}
                visualStep={spec.visualStep ?? 0}
              />
            </svg>
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
                    fill={
                      actor.appearance?.hairColor ??
                      (actor.preset === "GRANDPA" || actor.preset === "GRANDMA" ? "#CBD5E1" : "#1E293B")
                    }
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

          // V18.2–V23.1: Khóa cứng ánh mắt nhìn thẳng camera (dx=0, dy=0) cho mọi beat HOST_EXPLAIN_OVERLAY hoặc actor.lookAtCamera
          let lookOffset: { dx: number; dy: number };
          if (isHostExplain || actor.lookAtCamera) {
            lookOffset = { dx: 0, dy: 0 };
          } else if (ra.v18ActionPose === "SWEEP_LIGHT") {
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
          } else if (
            ra.activeHandProp === "PHONE" ||
            ra.activeHandProp === "NOTEBOOK" ||
            ra.activeHandProp === "BOOK"
          ) {
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

          const rawEffectiveHeadTiltDeg = ra.headTiltDeg + listenerNodDeg;
          const isCameraLockedHost = isHostExplain || Boolean(actor.lookAtCamera);
          const effectiveHeadTiltDeg = isHostExplain
            ? 0
            : actor.lookAtCamera
            ? Math.max(-2, Math.min(2, rawEffectiveHeadTiltDeg))
            : rawEffectiveHeadTiltDeg;
          const effectiveTorsoTiltDeg = isHostExplain ? 0 : ra.torsoTiltDeg;
          const nodAmplitudeDeg =
            isHostExplain || ra.v18ActionPose === "NOD_SMILE" || ra.v18ActionPose === "SIP_DRINK"
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
          const rawResolvedEyes = ra.overrideEyes ?? expr.eyes;
          const hostSafeEyes: EyeExpression =
            isHostExplain && (rawResolvedEyes === "surprised" || rawResolvedEyes === "wide")
              ? "neutral"
              : rawResolvedEyes;

          const renderCupInFrontForSip =
            ra.activeHandProp === "CUP_SODA" && ra.v18ActionPose === "SIP_DRINK";

          const showFlatGroundShadow =
            isHostExplain ||
            effectiveStageType === "CLEAN_EXPLAINER" ||
            (effectiveStageType === "CITY_LIVING_ROOM" &&
              spec.livingRoomDetail === "OUTRO_OPEN_FLOOR" &&
              !actor.seated);

          return (
            <g key={`auto_actor_${spec.id}_${aIdx}`}>
              {showFlatGroundShadow && (
                <GroundShadow
                  cx={Math.round(ra.actorX)}
                  cy={Math.round(ra.actorGroundY + 4)}
                  rx={Math.round(52 * ra.actorScale)}
                  ry={11}
                />
              )}
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
                appearance={actor.appearance}
                frame={frame}
                state={{
                  x: ra.actorX,
                  y: ra.actorGroundY,
                  scale: ra.actorScale,
                  appearance: actor.appearance,
                  hideBuiltInAppearanceProp: true,
                  facing: ra.effectiveFacing === "LEFT" ? "left" : "right",
                  pose: ra.pose,
                  ...(ra.seatedHipY !== undefined ? { seatedHipY: ra.seatedHipY } : {}),
                  torsoTiltDeg: effectiveTorsoTiltDeg,
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
                  pupilGaze: isCameraLockedHost ? { x: 0, y: 0 } : undefined,
                  lookOffset: isCameraLockedHost ? { dx: 0, dy: 0 } : lookOffset,
                  blinkSeed: ra.actorBlinkSeed,
                  nodAmplitudeDeg,
                  nodFreq: ra.v18ActionPose === "TALK_GESTURE" ? 0.11 : 0.13,
                  isSpeaking: !actor.yawning && (ra.isSpeaking || ra.v18ActionPose === "TALK_GESTURE"),
                  eyes: hostSafeEyes,
                  eyebrows: ra.overrideEyebrows ?? expr.eyebrows,
                  mouth: ra.overrideMouth ?? expr.mouth,
                  blush: expr.blush,
                  sweatDrop: isHostExplain ? false : expr.sweatDrop,
                  shiver: ra.activeShiver,
                  shiverOpacity: ra.shiverOpacity,
                  shiverDarkStage:
                    isNight || spec.stageType === "SPACE_COSMOS" || spec.stageType === "ANECHOIC_CHAMBER",
                  shiverFrame: frame,
                  holdingTarget: ra.blendedArmPose ? undefined : ra.holdingTarget,
                }}
              />
              {actor.yawning && (
                <ActorYawnWavesOverlay
                  x={ra.actorX + facingDir * 24 * ra.actorScale}
                  y={ra.headWorldY + 8 * ra.actorScale}
                  facingDir={facingDir}
                  frame={frame}
                />
              )}
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

        {/* 3.4. V22.5: BÀN HỌC GỖ PHÍA TRƯỚC NHÂN VẬT NGỒI HỌC TRONG SCHOOL_CLASSROOM (KHÔNG LƠ LỬNG, KHÔNG XUYÊN BÀN) */}
        {hasClassroomSeatedRow && (
          <ClassroomSeatedDesksForeground
            desks={seatedClassroomActors.map((ra) => ({
              x: Math.round(ra.actorX),
              hasWaterBottle:
                spec.classroomDetail === "DESK_WATER_BOTTLE" && ra.actor.preset === "BOY",
            }))}
            groundY={groundY}
          />
        )}

        {/* 3.4B. V22.7: BÀN ĂN TỐI BÒ BÍT TẾT PHÍA TRƯỚC GIA ĐÌNH TRONG HOME_KITCHEN (KÈM SÓNG RÍT NĨA CỌ ĐĨA SỨ) */}
        {!isHostExplain && hasKitchenSeatedDinner && (
          <KitchenDiningTableForeground
            plateXs={
              seatedKitchenActors.length > 0
                ? seatedKitchenActors.map((ra) => Math.round(ra.actorX))
                : [580, 960, 1340]
            }
            mode={spec.kitchenDetail ?? "DINNER_STEAK"}
            scrapeX={
              Math.round(
                (seatedKitchenActors.find((ra) => ra.actor.preset === "BOY") ?? seatedKitchenActors[1])?.actorX ?? 960
              )
            }
            frame={localFrame}
            groundY={groundY}
          />
        )}

        {/* 3.5. V22.3: CHI TIẾT SÂN QUÊ NHỎ BÁM SÁT CẬU BÉ (MUỖI BAY, TIA GÃI, NỐT SƯNG, KHĂN ĐÁ) */}
        {spec.stageType === "COUNTRYSIDE_YARD" &&
          spec.yardDetail &&
          spec.yardDetail !== "PORCH_FAN" &&
          (() => {
            const boyRa = resolvedActors.find((ra) => ra.actor.preset === "BOY") ?? resolvedActors[0];
            if (!boyRa) return null;
            const bDir: 1 | -1 = boyRa.effectiveFacing === "LEFT" ? -1 : 1;
            const armX = boyRa.actorX + bDir * 44 * boyRa.actorScale;
            const armY = boyRa.headWorldY + 112 * boyRa.actorScale;

            if (spec.yardDetail === "MOSQUITO_FLY") {
              const flyT = Math.min(1, sceneProgressP * 1.15);
              const mx = armX - flyT * 145 * bDir;
              const my = armY - 12 - flyT * 96 + Math.sin(frame * 0.45) * 8;
              const wingFlap = Math.sin(frame * 1.4) * 26;
              return (
                <g id="yard-detail-mosquito-fly">
                  {/* Chấm đỏ li ti đúng trên cẳng tay cậu bé */}
                  <circle cx={armX} cy={armY} r={5.5} fill="#EF4444" stroke="#991B1B" strokeWidth={1.6} />
                  {/* Đường bay nét đứt */}
                  <path
                    d={`M ${armX},${armY - 6} Q ${(armX + mx) * 0.5},${my + 36} ${mx.toFixed(1)},${my.toFixed(1)}`}
                    fill="none"
                    stroke="#64748B"
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    opacity={0.55}
                  />
                  {/* Con muỗi 2D nhỏ bay vù đi */}
                  <g transform={`translate(${mx.toFixed(1)}, ${my.toFixed(1)}) scale(${-bDir}, 1)`}>
                    <ellipse cx={-6} cy={-8} rx={12} ry={5} transform={`rotate(${(-24 + wingFlap).toFixed(1)}, -6, -8)`} fill="#E0F2FE" stroke="#334155" strokeWidth={1.6} />
                    <ellipse cx={4} cy={-9} rx={11} ry={4.5} transform={`rotate(${(18 - wingFlap).toFixed(1)}, 4, -9)`} fill="#E0F2FE" stroke="#334155" strokeWidth={1.6} />
                    <ellipse cx={-10} cy={2} rx={12} ry={4.5} fill="#334155" stroke="#141414" strokeWidth={1.8} />
                    <circle cx={5} cy={0} r={4.5} fill="#1E293B" stroke="#141414" strokeWidth={1.6} />
                    <line x1={9} y1={1} x2={22} y2={6} stroke="#141414" strokeWidth={2} strokeLinecap="round" />
                  </g>
                </g>
              );
            }

            if (spec.yardDetail === "SCRATCH_SPARK") {
              const pulse = 0.5 + 0.5 * Math.sin(frame * 0.4);
              return (
                <g id="yard-detail-scratch-spark" transform={`translate(${armX.toFixed(1)}, ${armY.toFixed(1)})`}>
                  <circle cx={0} cy={0} r={7} fill="#FB7185" opacity={0.85} />
                  {[-28, 28].map((dx, i) => (
                    <path
                      key={i}
                      d={`M ${dx * 0.7},-14 Q ${dx},0 ${dx * 0.7},14`}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      opacity={0.55 + pulse * 0.45}
                    />
                  ))}
                </g>
              );
            }

            if (spec.yardDetail === "SWELL_BUMP") {
              const rPulse = 14 + Math.sin(frame * 0.28) * 3;
              return (
                <g id="yard-detail-swell-bump" transform={`translate(${armX.toFixed(1)}, ${armY.toFixed(1)})`}>
                  <circle cx={0} cy={0} r={rPulse + 8} fill="#FCA5A5" opacity={0.42} />
                  <circle cx={0} cy={0} r={rPulse * 0.65} fill="#EF4444" stroke="#991B1B" strokeWidth={2.2} />
                  <path d="M -26,-12 Q -34,0 -26,12 M 26,-12 Q 34,0 26,12" fill="none" stroke="#DC2626" strokeWidth={3} strokeLinecap="round" />
                </g>
              );
            }

            if (spec.yardDetail === "ICE_TOWEL") {
              const coolRise = (frame * 1.1) % 24;
              return (
                <g id="yard-detail-ice-towel" transform={`translate(${armX.toFixed(1)}, ${armY.toFixed(1)})`}>
                  {/* Khăn sạch xanh mát bọc viên đá áp gọn trên tay */}
                  <rect x={-26} y={-18} width={52} height={34} rx={11} fill="#BAE6FD" stroke="#0284C7" strokeWidth={3} />
                  <path d="M -16,-6 L 16,-6 M -12,5 L 12,5" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.85} />
                  <rect x={-10} y={-12} width={18} height={18} rx={4} fill="#E0F2FE" stroke="#38BDF8" strokeWidth={2} opacity={0.9} />
                  {/* Làn hơi mát bay nhẹ lên */}
                  {[-12, 12].map((vx, vi) => (
                    <path
                      key={vi}
                      d={`M ${vx},${(-24 - ((coolRise + vi * 12) % 24)).toFixed(1)} Q ${vx - 5},${(-32 - ((coolRise + vi * 12) % 24)).toFixed(1)} ${vx},${(-40 - ((coolRise + vi * 12) % 24)).toFixed(1)}`}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth={2.8}
                      strokeLinecap="round"
                      opacity={0.78}
                    />
                  ))}
                </g>
              );
            }
            return null;
          })()}

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
                  x={Math.max(180, Math.min(1740, headX - 90))}
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
            const hostWithBoardBubbleX = hasHostWhiteboard ? Math.min(330, Math.max(290, ra.actorX)) : null;
            // Tránh bóng thoại dài (2 dòng) đè chỏm đầu nhân vật cao hơn đứng/ngồi ngay phía trước mặt
            const closeFrontNeighbor = resolvedActors.find(
              (o) =>
                o.aIdx !== aIdx &&
                (o.actorX - ra.actorX) * facingDir > 0 &&
                Math.abs(o.actorX - ra.actorX) < 360
            );
            const bubbleX =
              hostWithBoardBubbleX !== null
                ? hostWithBoardBubbleX
                : isHostExplain
                ? ra.actorX
                : closeFrontNeighbor
                ? Math.max(180, Math.min(1740, ra.actorX - facingDir * 48))
                : Math.max(180, Math.min(1740, ra.actorX + facingDir * 85));
            const bubbleMaxW = hasHostWhiteboard ? 500 : 520;
            return (
              <ComicSpeechBubble
                key={`bubble_${spec.id}_${aIdx}`}
                x={bubbleX}
                y={headTopWorldY - 76}
                mouthX={ra.actorX + facingDir * 22 * ra.actorScale}
                mouthY={mouthWorldY}
                headTopY={headTopWorldY}
                text={actor.bubble}
                localFrame={localFrame}
                appearFrame={ra.bubbleAppear}
                disappearFrame={ra.bubbleDisappear}
                maxWidth={bubbleMaxW}
              />
            );
          })}
        </g>
      </g>

      {/* 4.5. V22.4: LỚP PHỦ HỒI TƯỞNG PHẲNG (React.memo, cố định 1920x1080 ngoài nhóm zoom camera) */}
      {spec.flashback && <FlashbackOverlayStatic />}

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

      {/* 6. V24.0 KINETIC HEADLINE & TIME BADGE (0-BLUR, NGOÀI NHÓM ZOOM CAMERA) */}
      {(spec.kineticHeadline || spec.timeBadge) && (
        <KineticHeadlineLayer
          headline={spec.kineticHeadline}
          timeBadge={spec.timeBadge}
          localFrame={localFrame}
          fps={fps}
        />
      )}
    </g>
  );
};
