/**
 * TADPOLE MOVIE STAGES V16.1 ("Sẽ Ra Sao Nếu Bạn Đem 50 Con Nòng Nọc Về Nuôi Trong Phòng Ngủ?")
 * 64 Micro-Beats (4 Hồi × 16 Micro-Beats) — Chuẩn V16.0:
 * - Tái sử dụng StickmanRig V16 (mặt thân thiện mới, Lip-Sync Micro Talk, ComicSpeechBubble đệm >= 30px)
 * - Bối cảnh Ao Sen Làng Quê (LOTUS_POND_STAGE: DAY / SUNSET / NIGHT, sóng gợn 60fps, 4 lá sen, 1 bông sen hồng, cỏ bờ, mây trôi)
 * - Bối cảnh Phòng Ngủ Có Bể Kính (BEDROOM_TANK_STAGE: TANK_SWIM, TANK_METAMORPHOSIS, BEDROOM_2AM_CHAOS, BEDROOM_PEACEFUL_SLEEP)
 * - 9 Cảnh Giải Thích Khoa Học Tối Giản (EXPLAINER_POLKA_DOT — không bịa số % thừa, hoạt ảnh sinh học 60fps)
 */

import React from "react";
import { StickmanRig, ComicSpeechBubble, isComicBubbleActive } from "./StickmanRig";
import { smoothstep, lerpNum } from "../../lib/v7/universalAnimationStandard";
import type { KassStageBackdropsKit } from "./FireAntMovieStages";

export type TadpoleV16SceneMode =
  // Hồi 1 (1–16)
  | "TAD_POND_INTRO_STROLL"
  | "TAD_POND_SPOT_SWARM"
  | "TAD_POND_CLOSE_PEEK"
  | "TAD_POND_GENIUS_IDEA"
  | "TAD_POND_SCOOP_NET"
  | "TAD_POND_BUCKET_COUNT"
  | "TAD_POND_GRAB_WEEDS"
  | "TAD_YARD_CARRY_HOME"
  | "TAD_YARD_GRANDPA_ASK"
  | "TAD_YARD_BOY_BRAG"
  | "TAD_BEDROOM_SETUP_TANK"
  | "TAD_BEDROOM_POUR_WATER"
  | "TAD_EXPLAIN_GILLS_WATER"
  | "TAD_TANK_SWIM_CLOSEUP"
  | "TAD_BEDROOM_FEED_LETTUCE"
  | "TAD_BEDROOM_NIGHT_WATCH"
  // Hồi 2 (17–32)
  | "TAD_BEDROOM_WEEK2_MORNING"
  | "TAD_TANK_HIND_LEGS_CLOSEUP"
  | "TAD_EXPLAIN_4STAGE_CYCLE"
  | "TAD_EXPLAIN_HIND_LEGS_SWIM"
  | "TAD_BEDROOM_BOY_NOTEBOOK"
  | "TAD_TANK_GULP_AIR_SURFACE"
  | "TAD_EXPLAIN_LUNGS_DEVELOP"
  | "TAD_BEDROOM_ADD_ROCK_ISLAND"
  | "TAD_TANK_FRONT_LEGS_POP"
  | "TAD_TANK_STOP_EATING"
  | "TAD_TANK_TAIL_SHRINK_VIEW"
  | "TAD_EXPLAIN_TAIL_REABSORB"
  | "TAD_EXPLAIN_STOMACH_SHIFT"
  | "TAD_TANK_CLIMB_ROCK"
  | "TAD_BEDROOM_CROWDED_TANK"
  | "TAD_BEDROOM_FORGET_LID"
  // Hồi 3 (33–48)
  | "TAD_BEDROOM_2AM_SILENT"
  | "TAD_BEDROOM_2AM_LID_PUSH"
  | "TAD_BEDROOM_2AM_FIRST_ESCAPE"
  | "TAD_BEDROOM_2AM_WALL_CLING"
  | "TAD_BEDROOM_2AM_FIRST_CROAK"
  | "TAD_EXPLAIN_VOCAL_SAC"
  | "TAD_BEDROOM_2AM_SLEEP_STIR"
  | "TAD_BEDROOM_2AM_NOSE_JUMP"
  | "TAD_BEDROOM_2AM_CHAOS_SWARM"
  | "TAD_EXPLAIN_FROG_SPRING"
  | "TAD_BEDROOM_2AM_BOY_CHASE"
  | "TAD_BEDROOM_2AM_FOOTSTEPS"
  | "TAD_BEDROOM_2AM_GRANDPA_LIGHTS"
  | "TAD_BEDROOM_2AM_FROG_ON_LAMP"
  | "TAD_BEDROOM_2AM_AWKWARD_SMILE"
  | "TAD_BEDROOM_TEAM_CATCH"
  // Hồi 4 (49–64)
  | "TAD_BEDROOM_BUCKET_FULL"
  | "TAD_BEDROOM_DAWN_WINDOW"
  | "TAD_YARD_MORNING_WALK"
  | "TAD_POND_ARRIVE_MORNING"
  | "TAD_POND_RELEASE_FROGS"
  | "TAD_POND_SWIM_SCATTER"
  | "TAD_POND_WAVE_GOODBYE"
  | "TAD_POND_GRANDPA_CHAT"
  | "TAD_EXPLAIN_MOSQUITO_HERO"
  | "TAD_POND_SUNSET_CATCH_BUGS"
  | "TAD_BEDROOM_CLEAN_TANK"
  | "TAD_BEDROOM_OPEN_NOTEBOOK"
  | "TAD_BEDROOM_PEACEFUL_SLEEP"
  | "TAD_POND_MOONLIGHT_FROGS"
  | "TAD_YARD_BOY_SMILE_CLOSING"
  | "TAD_POND_WARM_OUTRO";

export function isTadpoleV16SceneMode(mode: string): mode is TadpoleV16SceneMode {
  return mode.startsWith("TAD_");
}

function easeOutBack(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

// =============================================================================
// 1. ĐẠO CỤ SINH VẬT 60FPS: NÒNG NỌC BƠI UỐN ĐUÔI, ẾCH XANH THÂN THIỆN, XÔ NƯỚC, VỢT LƯỚI
// =============================================================================

type TadpoleGrowthStage = "tadpole" | "backLegs" | "fourLegs" | "shortTail";

/** Nòng nọc đen bơi uốn đuôi hình sin liên tục 60fps (hỗ trợ mọc chân sau, chân trước, thu ngắn đuôi) */
const SwimmingTadpole: React.FC<{
  x: number;
  y: number;
  scale?: number;
  angleDeg?: number;
  frame: number;
  phase?: number;
  stage?: TadpoleGrowthStage;
  tailRatio?: number; // 1.0 = đuôi dài, 0.25 = đuôi ngắn dần
}> = ({
  x,
  y,
  scale = 1,
  angleDeg = 0,
  frame,
  phase = 0,
  stage = "tadpole",
  tailRatio,
}) => {
  const effectiveTail =
    tailRatio !== undefined
      ? tailRatio
      : stage === "shortTail"
      ? 0.35
      : stage === "fourLegs"
      ? 0.72
      : 1.0;
  const wag1 = Math.sin(frame * 0.38 + phase) * 8 * effectiveTail;
  const wag2 = Math.sin(frame * 0.38 + phase - 1.2) * 12 * effectiveTail;
  const tailLen = 34 * effectiveTail;
  const legKick = Math.sin(frame * 0.24 + phase) * 5;
  const bodyColor = stage === "shortTail" ? "#15803D" : stage === "fourLegs" ? "#1E3A2F" : "#1E293B";
  const tailColor = stage === "shortTail" ? "#4ADE80" : "#334155";

  return (
    <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${angleDeg.toFixed(1)}) scale(${scale})`}>
      {/* Đuôi uốn sóng hình sin 60fps */}
      {effectiveTail > 0.08 && (
        <>
          <path
            d={`M -11,0 Q ${(-11 - tailLen * 0.45).toFixed(1)},${wag1.toFixed(1)} ${(-11 - tailLen).toFixed(1)},${wag2.toFixed(1)}`}
            fill="none"
            stroke={tailColor}
            strokeWidth={6.5 * Math.max(0.55, effectiveTail)}
            strokeLinecap="round"
            opacity={0.55}
          />
          <path
            d={`M -11,0 Q ${(-11 - tailLen * 0.45).toFixed(1)},${wag1.toFixed(1)} ${(-11 - tailLen).toFixed(1)},${wag2.toFixed(1)}`}
            fill="none"
            stroke="#141414"
            strokeWidth={3.2}
            strokeLinecap="round"
          />
        </>
      )}

      {/* Chân sau mọc từ gốc đuôi (backLegs / fourLegs / shortTail) */}
      {(stage === "backLegs" || stage === "fourLegs" || stage === "shortTail") && (
        <g stroke="#141414" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d={`M -8,7 L ${(-15 - legKick * 0.4).toFixed(1)},${(14 + legKick * 0.3).toFixed(1)} L ${(-21 - legKick * 0.5).toFixed(1)},12`} />
          <path d={`M -8,-7 L ${(-15 + legKick * 0.4).toFixed(1)},${(-14 - legKick * 0.3).toFixed(1)} L ${(-21 + legKick * 0.5).toFixed(1)},-12`} />
        </g>
      )}

      {/* Chân trước nhỏ gọn (fourLegs / shortTail) */}
      {(stage === "fourLegs" || stage === "shortTail") && (
        <g stroke="#141414" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 5,8 L 10,14 L 14,12" />
          <path d="M 5,-8 L 10,-14 L 14,-12" />
        </g>
      )}

      {/* Thân bầu dục tròn thân thiện */}
      <ellipse cx={0} cy={0} rx={13} ry={9.2} fill={bodyColor} stroke="#141414" strokeWidth={2.6} />
      {/* Mắt sáng tròn nhỏ dễ thương */}
      <circle cx={6.5} cy={-3.5} r={2.6} fill="#FFFFFF" />
      <circle cx={7.3} cy={-3.5} r={1.3} fill="#141414" />
    </g>
  );
};

/** Chú ếch xanh thân thiện hoạt hình 60fps (hỗ trợ tư thế ngồi, nhảy, phồng túi thanh quản, thè lưỡi bắt muỗi) */
const CuteGreenFrog: React.FC<{
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  pose?: "sit" | "jump" | "cling";
  croaking?: boolean;
  tongueTarget?: { dx: number; dy: number } | null;
  frame: number;
  phase?: number;
}> = ({
  x,
  y,
  scale = 1,
  facing = 1,
  pose = "sit",
  croaking = false,
  tongueTarget = null,
  frame,
  phase = 0,
}) => {
  const breathe = Math.sin(frame * 0.14 + phase) * 1.4;
  const sacScale = croaking ? 0.55 + Math.abs(Math.sin(frame * 0.24 + phase)) * 0.72 : 0;

  return (
    <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${(facing * scale).toFixed(3)}, ${scale.toFixed(3)})`}>
      {pose === "jump" ? (
        /* Tư thế đang bật nhảy căng chân sau như lò xo */
        <g transform="rotate(-24)">
          <path d="M -14,6 L -34,18 L -46,12" fill="none" stroke="#15803D" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -14,6 L -34,18 L -46,12" fill="none" stroke="#141414" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={0} cy={0} rx={20} ry={13} fill="#22C55E" stroke="#141414" strokeWidth={2.8} />
          <ellipse cx={2} cy={4} rx={13} ry={7} fill="#DCFCE7" stroke="none" />
          <path d="M 10,6 L 22,12" fill="none" stroke="#141414" strokeWidth={3.2} strokeLinecap="round" />
          {/* Đôi mắt tròn lồi đáng yêu */}
          <circle cx={10} cy={-11} r={6.5} fill="#22C55E" stroke="#141414" strokeWidth={2.6} />
          <circle cx={11} cy={-11} r={4.2} fill="#FFFFFF" />
          <circle cx={12.2} cy={-11} r={2.3} fill="#141414" />
          <circle cx={11.5} cy={-12} r={0.9} fill="#FFFFFF" />
        </g>
      ) : pose === "cling" ? (
        /* Tư thế bám chặt trên tường / cửa sổ / rèm */
        <g>
          <path d="M -12,12 L -20,24 M 12,12 L 20,24 M -12,-6 L -20,-16 M 12,-6 L 20,-16" stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
          <ellipse cx={0} cy={2} rx={15} ry={18} fill="#22C55E" stroke="#141414" strokeWidth={2.8} />
          <ellipse cx={0} cy={5} rx={9.5} ry={11} fill="#BBF7D0" stroke="none" />
          <circle cx={-8} cy={-14} r={5.5} fill="#FFFFFF" stroke="#141414" strokeWidth={2.4} />
          <circle cx={8} cy={-14} r={5.5} fill="#FFFFFF" stroke="#141414" strokeWidth={2.4} />
          <circle cx={-7} cy={-14} r={2.4} fill="#141414" />
          <circle cx={9} cy={-14} r={2.4} fill="#141414" />
        </g>
      ) : (
        /* Tư thế ngồi chuẩn thân thiện */
        <g transform={`translate(0, ${breathe.toFixed(1)})`}>
          {/* Bóng nhẹ dưới chân */}
          <ellipse cx={0} cy={14} rx={22} ry={5.5} fill="#0F172A" opacity={0.18} />
          {/* Đùi sau gập gọn hình chữ Z */}
          <ellipse cx={-12} cy={6} rx={12} ry={9} fill="#16A34A" stroke="#141414" strokeWidth={2.6} />
          {/* Thân tròn xanh mướt + bụng kem sáng */}
          <ellipse cx={0} cy={0} rx={20} ry={14.5} fill="#22C55E" stroke="#141414" strokeWidth={2.8} />
          <ellipse cx={4} cy={4} rx={12.5} ry={8.5} fill="#DCFCE7" stroke="none" />
          {/* 2 chân trước chống gọn */}
          <path d="M 8,7 L 11,15 L 16,15 M -1,8 L 0,15 L 5,15" fill="none" stroke="#141414" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          {/* Túi thanh quản phồng xẹp khi kêu Ộp Oạp */}
          {croaking && sacScale > 0.08 && (
            <ellipse
              cx={17}
              cy={5}
              rx={(10 * sacScale).toFixed(1)}
              ry={(8.5 * sacScale).toFixed(1)}
              fill="#FEF08A"
              stroke="#141414"
              strokeWidth={2.4}
              opacity={0.94}
            />
          )}
          {/* Lưỡi hồng dính phóng ra bắt muỗi */}
          {tongueTarget && (
            <g>
              <line
                x1={16}
                y1={-1}
                x2={tongueTarget.dx}
                y2={tongueTarget.dy}
                stroke="#FB7185"
                strokeWidth={5.5}
                strokeLinecap="round"
              />
              <circle cx={tongueTarget.dx} cy={tongueTarget.dy} r={4.5} fill="#F43F5E" />
            </g>
          )}
          {/* 2 mắt tròn to có chấm sáng trắng thân thiện */}
          <circle cx={6} cy={-13} r={7.2} fill="#22C55E" stroke="#141414" strokeWidth={2.6} />
          <circle cx={15} cy={-12} r={6.6} fill="#22C55E" stroke="#141414" strokeWidth={2.6} />
          <circle cx={7} cy={-13} r={4.6} fill="#FFFFFF" />
          <circle cx={15.6} cy={-12} r={4.2} fill="#FFFFFF" />
          <circle cx={8.2} cy={-13} r={2.5} fill="#141414" />
          <circle cx={16.7} cy={-12} r={2.3} fill="#141414" />
          <circle cx={7.5} cy={-14} r={0.95} fill="#FFFFFF" />
          <circle cx={16} cy={-13} r={0.85} fill="#FFFFFF" />
          {/* Miệng cười tươi */}
          <path d="M 8,0 Q 14,4 19,-1" fill="none" stroke="#141414" strokeWidth={2.4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** Xô nhựa xanh đựng nòng nọc / ếch con (có thể nghiêng đổ) */
const BlueWaterBucket: React.FC<{
  x: number;
  y: number;
  tiltDeg?: number;
  scale?: number;
  hasWater?: boolean;
}> = ({ x, y, tiltDeg = 0, scale = 1, hasWater = true }) => (
  <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${tiltDeg.toFixed(1)}) scale(${scale})`}>
    {/* Quai xách sắt cong */}
    <path d="M -30,-34 Q 0,-64 30,-34" fill="none" stroke="#475569" strokeWidth={4} strokeLinecap="round" />
    {/* Thân xô nhựa xanh dương */}
    <path d="M -32,-34 L -24,26 Q 0,34 24,26 L 32,-34 Z" fill="#38BDF8" stroke="#141414" strokeWidth={3.2} strokeLinejoin="round" />
    <ellipse cx={0} cy={-34} rx={32} ry={9} fill={hasWater ? "#0EA5E9" : "#BAE6FD"} stroke="#141414" strokeWidth={3} />
    {hasWater && <ellipse cx={0} cy={-33} rx={24} ry={5} fill="#E0F2FE" opacity={0.55} />}
  </g>
);

/** Nhãn tiếng kêu "Ộp!" / "Oạp!" nhỏ gọn chuẩn truyện tranh (tránh che mặt nhân vật) */
const MiniCroakTag: React.FC<{
  x: number;
  y: number;
  text: string;
  frame: number;
  phase?: number;
  scale?: number;
}> = ({ x, y, text, frame, phase = 0, scale = 1 }) => {
  const pulse = 0.88 + Math.abs(Math.sin(frame * 0.16 + phase)) * 0.22;
  const bobY = Math.sin(frame * 0.12 + phase) * 5;
  const w = Math.max(82, text.length * 16 + 34);
  return (
    <g transform={`translate(${x.toFixed(1)}, ${(y + bobY).toFixed(1)}) scale(${(pulse * scale).toFixed(3)})`}>
      <rect x={-w / 2} y={-22} width={w} height={42} rx={21} fill="#FFFFFF" stroke="#141414" strokeWidth={3.2} />
      <text
        x={0}
        y={7}
        textAnchor="middle"
        fill="#15803D"
        fontSize={22}
        fontWeight={900}
        fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
      >
        {text}
      </text>
    </g>
  );
};

// =============================================================================
// 2. BỐI CẢNH MỚI 1: AO SEN LÀNG QUÊ (LOTUS_POND_STAGE — DAY / SUNSET / NIGHT)
// =============================================================================

export const LotusPondBackdrop: React.FC<{
  timeOfDay?: "DAY" | "SUNSET" | "NIGHT";
  frame?: number;
  groundY?: number;
}> = ({ timeOfDay = "DAY", frame = 0, groundY = 840 }) => {
  const isSunset = timeOfDay === "SUNSET";
  const isNight = timeOfDay === "NIGHT";
  const cloudDrift = frame * 0.18;
  const breeze = Math.sin(frame * 0.045) * 3.5;

  const skyTop = isNight ? "#0F172A" : isSunset ? "#F97316" : "#60A5FA";
  const skyMid = isNight ? "#1E293B" : isSunset ? "#FDBA74" : "#BAE6FD";
  const skyBot = isNight ? "#1E293B" : isSunset ? "#FEF3C7" : "#E0F2FE";
  const hillFill = isNight ? "#14532D" : isSunset ? "#65A30D" : "#86EFAC";
  const bankFill = isNight ? "#166534" : isSunset ? "#4D7C0F" : "#4ADE80";
  const pondTop = isNight ? "#1E3A5F" : isSunset ? "#0284C7" : "#38BDF8";
  const pondBot = isNight ? "#0F172A" : isSunset ? "#0369A1" : "#0284C7";
  const padFill = isNight ? "#15803D" : "#22C55E";
  const padDark = isNight ? "#14532D" : "#16A34A";

  const lotusPads = [
    { x: 1120, y: 765, rx: 86, ry: 25, hasFlower: false },
    { x: 1380, y: 720, rx: 94, ry: 27, hasFlower: true },
    { x: 1640, y: 785, rx: 98, ry: 28, hasFlower: false },
    { x: 1275, y: 858, rx: 88, ry: 25, hasFlower: false },
  ];

  return (
    <g id="stage-lotus-pond">
      <defs>
        <linearGradient id={`lotus-sky-${timeOfDay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="56%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id={`lotus-water-${timeOfDay}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pondTop} />
          <stop offset="100%" stopColor={pondBot} />
        </linearGradient>
      </defs>

      {/* Bầu trời */}
      <rect x={0} y={0} width={1920} height={680} fill={`url(#lotus-sky-${timeOfDay})`} />

      {/* Mặt trời (DAY / SUNSET) hoặc Trăng sao (NIGHT) */}
      {isNight ? (
        <g>
          <g transform="translate(1540, 175)">
            <circle cx={0} cy={0} r={82} fill="#FEF08A" opacity={0.18} />
            <path d="M 10,-48 A 50,50 0 1,0 10,48 A 37,37 0 1,1 10,-48 Z" fill="#FEF08A" stroke="#141414" strokeWidth={2.6} />
          </g>
          {[
            [240, 140], [480, 210], [790, 130], [1120, 185], [1340, 120], [1740, 220],
          ].map(([sx, sy], i) => (
            <circle key={`star_${i}`} cx={sx} cy={sy} r={3 + (i % 2) * 1.5} fill="#FEF9C3" opacity={0.6 + Math.sin(frame * 0.08 + i) * 0.35} />
          ))}
        </g>
      ) : (
        <g transform={`translate(${isSunset ? 1520 : 320}, ${isSunset ? 390 : 175})`}>
          <circle cx={0} cy={0} r={isSunset ? 115 : 82} fill="#FEF08A" opacity={0.34} />
          <circle cx={0} cy={0} r={isSunset ? 62 : 46} fill={isSunset ? "#FB923C" : "#FDE047"} stroke="#141414" strokeWidth={3} />
        </g>
      )}

      {/* Mây trôi chậm 60fps (y >= 195 thoáng tiêu đề nổi) */}
      {!isNight &&
        [
          { bx: 240, y: 200, s: 1.0 },
          { bx: 920, y: 196, s: 1.12 },
          { bx: 1520, y: 215, s: 0.92 },
        ].map((c, idx) => {
          const cx = ((c.bx + cloudDrift * (0.9 + idx * 0.14) + 120) % 2160) - 120;
          return (
            <g key={`pond_cloud_${idx}`} transform={`translate(${cx.toFixed(1)}, ${c.y}) scale(${c.s})`}>
              <path
                d="M -68,18 C -86,18 -92,-6 -68,-12 C -62,-38 -22,-44 -6,-24 C 12,-44 54,-36 58,-10 C 82,-6 80,18 58,18 Z"
                fill={isSunset ? "#FFEDD5" : "#FFFFFF"}
                stroke="#141414"
                strokeWidth={3}
                strokeLinejoin="round"
              />
            </g>
          );
        })}

      {/* Lũy tre xanh & đồi làng quê phía xa */}
      <path
        d="M -20,660 Q 340,515 740,595 T 1520,555 T 1940,610 L 1940,700 L -20,700 Z"
        fill={hillFill}
        stroke="#141414"
        strokeWidth={3}
      />

      {/* Mặt nước Ao Sen chiếm rộng bên phải & phía dưới */}
      <rect x={0} y={645} width={1920} height={435} fill={`url(#lotus-water-${timeOfDay})`} />
      <line x1={0} y1={645} x2={1920} y2={645} stroke="#141414" strokeWidth={3} />

      {/* Sóng gợn lăn tăn 60fps trên mặt ao */}
      {[
        { x: 960, y: 690, w: 120 },
        { x: 1480, y: 685, w: 135 },
        { x: 1020, y: 825, w: 145 },
        { x: 1470, y: 855, w: 160 },
        { x: 1120, y: 920, w: 140 },
        { x: 1620, y: 910, w: 150 },
      ].map((rp, i) => {
        const shift = Math.sin(frame * 0.065 + i * 1.3) * 18;
        return (
          <path
            key={`pond_ripple_${i}`}
            d={`M ${(rp.x + shift).toFixed(1)},${rp.y} Q ${(rp.x + rp.w * 0.5 + shift).toFixed(1)},${rp.y - 7} ${(rp.x + rp.w + shift).toFixed(1)},${rp.y}`}
            fill="none"
            stroke={isNight ? "#93C5FD" : "#E0F2FE"}
            strokeWidth={3.2}
            strokeLinecap="round"
            opacity={isNight ? 0.42 : 0.72}
          />
        );
      })}

      {/* 4 lá sen xanh dập dềnh 60fps + 1 bông sen hồng nở rực rỡ */}
      {lotusPads.map((pad, idx) => {
        const bobY = Math.sin(frame * 0.06 + idx * 1.4) * 3.5;
        return (
          <g key={`lotus_pad_${idx}`} transform={`translate(${pad.x}, ${(pad.y + bobY).toFixed(1)})`}>
            {/* Vòng sóng nhỏ quanh lá sen */}
            <ellipse cx={0} cy={4} rx={pad.rx + 10} ry={pad.ry + 4} fill="none" stroke="#E0F2FE" strokeWidth={2} opacity={0.45} />
            {/* Lá sen tròn có khe khuyết chữ V đặc trưng */}
            <path
              d={`M 0,0 L ${(pad.rx * 0.88).toFixed(1)},${(-pad.ry * 0.35).toFixed(1)} A ${pad.rx},${pad.ry} 0 1,0 ${(pad.rx * 0.92).toFixed(1)},${(pad.ry * 0.28).toFixed(1)} Z`}
              fill={idx % 2 === 0 ? padFill : padDark}
              stroke="#141414"
              strokeWidth={3}
              strokeLinejoin="round"
            />
            {/* Gân lá sen thanh mảnh */}
            <line x1={-pad.rx * 0.55} y1={-4} x2={-6} y2={0} stroke="#14532D" strokeWidth={2} opacity={0.45} />
            <line x1={-pad.rx * 0.35} y1={10} x2={-4} y2={2} stroke="#14532D" strokeWidth={2} opacity={0.45} />

            {/* 1 bông sen hồng nở rộ phía trên lá sen thứ 2 */}
            {pad.hasFlower && (
              <g transform="translate(-8, -14)">
                <path d="M 0,6 C -26,-6 -34,-26 -14,-34 C -4,-22 0,-8 0,6 Z" fill="#F472B6" stroke="#141414" strokeWidth={2.6} />
                <path d="M 0,6 C 26,-6 34,-26 14,-34 C 4,-22 0,-8 0,6 Z" fill="#F472B6" stroke="#141414" strokeWidth={2.6} />
                <path d="M 0,6 C -22,-14 -20,-42 0,-46 C 20,-42 22,-14 0,6 Z" fill="#FBCFE8" stroke="#141414" strokeWidth={2.6} />
                <path d="M 0,6 C -14,-8 -10,-32 0,-36 C 10,-32 14,-8 0,6 Z" fill="#F9A8D4" stroke="#141414" strokeWidth={2.4} />
                <ellipse cx={0} cy={-8} rx={9} ry={5} fill="#FACC15" stroke="#141414" strokeWidth={2} />
              </g>
            )}
          </g>
        );
      })}

      {/* Bờ cỏ xanh bên trái để cậu bé & ông nội đứng (từ x=0 đến x=930) */}
      <path
        d={`M -20,625 Q 480,618 835,665 Q 960,700 940,815 Q 915,910 860,1090 L -20,1090 Z`}
        fill={bankFill}
        stroke="#141414"
        strokeWidth={3.5}
      />
      {/* Đường viền đất nâu dịu sát mép nước */}
      <path
        d="M 835,665 Q 960,700 940,815 Q 915,910 860,1090"
        fill="none"
        stroke="#78350F"
        strokeWidth={10}
        opacity={0.35}
      />

      {/* Bụi cỏ ven bờ đung đưa nhẹ theo gió 60fps */}
      {[
        { x: 160, y: 690 },
        { x: 380, y: 660 },
        { x: 760, y: 710 },
        { x: 840, y: 820 },
        { x: 1810, y: 670 },
      ].map((g, i) => (
        <g key={`pond_grass_${i}`} transform={`translate(${g.x}, ${g.y}) rotate(${(breeze * (i % 2 === 0 ? 1 : -1)).toFixed(1)})`}>
          <path d="M -14,6 Q -20,-18 -10,-32 M 0,6 Q 2,-22 0,-38 M 14,6 Q 20,-16 12,-28" fill="none" stroke="#15803D" strokeWidth={4.2} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

// =============================================================================
// 3. BỐI CẢNH MỚI 2: BỂ KÍNH PHÒNG NGỦ (GLASS AQUARIUM TANK + 2:00 AM WALL CLOCK)
// =============================================================================

/** Chiếc bể kính trong suốt đặt trên bàn gỗ cạnh giường ngủ (sóng nước 60fps, rong xanh, đá nổi, nắp lưới, nòng nọc/ếch) */
const BedroomGlassTank: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  frame: number;
  lidState?: "closed" | "ajar" | "open" | "none";
  hasRockIsland?: boolean;
  hasLettuce?: boolean;
  emptyClean?: boolean;
  tadpoleStage?: TadpoleGrowthStage;
  tadpoleCount?: number;
  frogOnRockCount?: number;
  gulpAir?: boolean;
  tailRatio?: number;
}> = ({
  x,
  y,
  w = 340,
  h = 205,
  frame,
  lidState = "none",
  hasRockIsland = false,
  hasLettuce = false,
  emptyClean = false,
  tadpoleStage = "tadpole",
  tadpoleCount = 12,
  frogOnRockCount = 0,
  gulpAir = false,
  tailRatio,
}) => {
  const waterTopY = 48;
  const waveShift = Math.sin(frame * 0.11) * 4.5;
  const clipId = `tank-clip-${Math.round(x)}-${Math.round(y)}-${w}`;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Bàn gỗ đặt bể kính ngay cạnh giường */}
      <rect x={-26} y={h} width={w + 52} height={24} rx={6} fill="#92400E" stroke="#141414" strokeWidth={3.2} />
      <rect x={-12} y={h + 24} width={22} height={148} rx={4} fill="#78350F" stroke="#141414" strokeWidth={3} />
      <rect x={w - 10} y={h + 24} width={22} height={148} rx={4} fill="#78350F" stroke="#141414" strokeWidth={3} />

      {/* Thân kính trong suốt phía sau */}
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#E0F2FE" fillOpacity={0.42} stroke="#141414" strokeWidth={3.5} />

      <defs>
        <clipPath id={clipId}>
          <rect x={3} y={3} width={w - 6} height={h - 6} rx={6} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {!emptyClean && (
          <>
            {/* Khối nước xanh trong dao động 60fps */}
            <path
              d={`M -10,${(waterTopY + waveShift).toFixed(1)} Q ${(w * 0.25).toFixed(1)},${(waterTopY - waveShift).toFixed(1)} ${(w * 0.5).toFixed(1)},${(waterTopY + waveShift).toFixed(1)} T ${(w + 10).toFixed(1)},${(waterTopY - waveShift).toFixed(1)} L ${w + 10},${h + 10} L -10,${h + 10} Z`}
              fill="#7DD3FC"
              fillOpacity={0.62}
            />
            <path
              d={`M -10,${(waterTopY + waveShift).toFixed(1)} Q ${(w * 0.25).toFixed(1)},${(waterTopY - waveShift).toFixed(1)} ${(w * 0.5).toFixed(1)},${(waterTopY + waveShift).toFixed(1)} T ${(w + 10).toFixed(1)},${(waterTopY - waveShift).toFixed(1)}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={3}
              opacity={0.8}
            />

            {/* Lớp cát sỏi đáy bể */}
            <path d={`M 0,${h - 24} Q ${w * 0.5},${h - 32} ${w},${h - 22} L ${w},${h} L 0,${h} Z`} fill="#D6B27C" stroke="#141414" strokeWidth={2.2} />

            {/* Rong xanh đung đưa 60fps */}
            {[w * 0.16, w * 0.28, w * 0.82].map((wx, wi) => {
              const sway = Math.sin(frame * 0.065 + wi * 1.4) * 9;
              return (
                <path
                  key={`weed_${wi}`}
                  d={`M ${wx},${h - 22} Q ${wx + sway},${h - 72} ${wx - sway * 0.7},${h - 118}`}
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth={7}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Hòn cuội đảo nhỏ nhô lên mặt nước (khi hasRockIsland=true) */}
            {hasRockIsland && (
              <g>
                <path
                  d={`M ${w * 0.54},${h - 20} Q ${w * 0.62},${waterTopY - 12} ${w * 0.72},${waterTopY - 10} Q ${w * 0.84},${waterTopY - 6} ${w * 0.88},${h - 20} Z`}
                  fill="#94A3B8"
                  stroke="#141414"
                  strokeWidth={3}
                />
                <path
                  d={`M ${w * 0.60},${waterTopY - 2} Q ${w * 0.72},${waterTopY - 8} ${w * 0.80},${waterTopY - 2}`}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={0.75}
                />
              </g>
            )}

            {/* Vài mẩu lá rau cải luộc mềm nổi trong bể */}
            {hasLettuce &&
              [0, 1, 2].map((li) => {
                const lx = w * 0.34 + li * 48 + Math.sin(frame * 0.04 + li) * 6;
                const ly = waterTopY + 18 + (li % 2) * 26;
                return (
                  <ellipse
                    key={`let_${li}`}
                    cx={lx}
                    cy={ly}
                    rx={14}
                    ry={7}
                    transform={`rotate(${li * 25 - 15}, ${lx}, ${ly})`}
                    fill="#86EFAC"
                    stroke="#15803D"
                    strokeWidth={2}
                  />
                );
              })}

            {/* Đàn nòng nọc bơi uốn đuôi hình sin phân bổ đều khắp bể kính 60fps */}
            {Array.from({ length: tadpoleCount }).map((_, ti) => {
              const speed = 0.020 + (ti % 4) * 0.005;
              const tPhase = frame * speed + (ti / Math.max(1, tadpoleCount)) * Math.PI * 2;
              const rawX = 52 + ((Math.sin(tPhase) + 1) * 0.5) * (w - 104);
              const dir = Math.cos(tPhase) >= 0 ? 1 : -1;
              const isGulping = gulpAir && ti % 3 === 0;
              const baseY = isGulping
                ? waterTopY + 18 + Math.abs(Math.sin(frame * 0.055 + ti * 1.3)) * 72
                : waterTopY + 34 + ((ti * 41) % Math.max(44, h - waterTopY - 76)) + Math.sin(frame * 0.08 + ti) * 10;
              const angle = dir >= 0 ? Math.sin(frame * 0.09 + ti) * 14 : 180 + Math.sin(frame * 0.09 + ti) * 14;
              return (
                <SwimmingTadpole
                  key={`tank_tad_${ti}`}
                  x={rawX}
                  y={Math.min(h - 34, Math.max(waterTopY + 16, baseY))}
                  scale={w > 460 ? 1.12 : 0.72}
                  angleDeg={angle}
                  frame={frame}
                  phase={ti * 1.1}
                  stage={tadpoleStage}
                  tailRatio={tailRatio}
                />
              );
            })}

            {/* Bong bóng khí bay lên khi nòng nọc ngoi lên đớp khí */}
            {gulpAir &&
              [0, 1, 2, 3, 4, 5].map((bi) => {
                const bx = 60 + ((bi * 67) % Math.max(80, w - 110)) + Math.sin(frame * 0.1 + bi) * 5;
                const prog = (frame * 0.018 + bi * 0.19) % 1;
                const by = lerpNum(waterTopY + 70, waterTopY + 4, prog);
                return (
                  <circle
                    key={`air_bub_${bi}`}
                    cx={bx}
                    cy={by}
                    r={4 + (bi % 3) * 2.2}
                    fill="#FFFFFF"
                    fillOpacity={0.75}
                    stroke="#0284C7"
                    strokeWidth={1.6}
                  />
                );
              })}

            {/* Các chú ếch con xanh mướt ngồi trên mỏm đá đảo nhỏ */}
            {hasRockIsland &&
              Array.from({ length: frogOnRockCount }).map((_, fi) => (
                <CuteGreenFrog
                  key={`rock_frog_${fi}`}
                  x={w * 0.62 + fi * 28}
                  y={waterTopY - 18 - (fi % 2) * 4}
                  scale={w > 460 ? 0.85 : 0.56}
                  facing={fi % 2 === 0 ? -1 : 1}
                  pose="sit"
                  frame={frame}
                  phase={fi * 1.5}
                />
              ))}
          </>
        )}

        {/* Vệt phản chiếu ánh sáng trên mặt kính */}
        <polygon points={`22,12 52,12 24,${h - 16} 8,${h - 16}`} fill="#FFFFFF" opacity={0.34} />
        <polygon points={`64,12 78,12 50,${h - 16} 40,${h - 16}`} fill="#FFFFFF" opacity={0.22} />
      </g>

      {/* Viền khung bể kính đen gọn */}
      <rect x={0} y={0} width={w} height={h} rx={8} fill="none" stroke="#141414" strokeWidth={4} />
      <rect x={-4} y={h - 6} width={w + 8} height={10} rx={3} fill="#1E293B" stroke="#141414" strokeWidth={2.5} />

      {/* Nắp lưới trên miệng bể (closed / ajar / open — bản lề mở HẤT LÊN TRÊN, không bao giờ cắm vào nước!) */}
      {lidState === "closed" && (
        <rect x={-5} y={-10} width={w + 10} height={11} rx={4} fill="#64748B" stroke="#141414" strokeWidth={3} />
      )}
      {lidState === "ajar" && (
        <g transform="translate(-4, -2) rotate(-14)">
          <rect x={0} y={-10} width={w + 8} height={11} rx={4} fill="#64748B" stroke="#141414" strokeWidth={3} />
        </g>
      )}
      {lidState === "open" && (
        /* Nắp lưới bị đẩy lệch bung hẳn sang trái miệng bể (mở toang phía phải, hoàn toàn thoáng sạch dưới đồng hồ 2:00 AM!) */
        <g transform="translate(-38, -6) rotate(-16)">
          <rect x={0} y={-10} width={w * 0.68} height={11} rx={4} fill="#64748B" stroke="#141414" strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/** Đồng hồ treo tường chỉ rõ 2:00 AM trong phòng ngủ đêm đại náo */
const WallClock2AM: React.FC<{ x: number; y: number; frame: number; glow?: boolean }> = ({
  x,
  y,
  frame,
  glow = true,
}) => {
  const secDeg = (frame * 2) % 360;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {glow && <circle cx={0} cy={0} r={66} fill="#FEF08A" opacity={0.14} />}
      <circle cx={0} cy={0} r={48} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />
      <circle cx={0} cy={0} r={41} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={2} />
      {/* Vạch giờ 12, 3, 6, 9 */}
      <line x1={0} y1={-37} x2={0} y2={-29} stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={37} y1={0} x2={29} y2={0} stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={0} y1={37} x2={0} y2={29} stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={-37} y1={0} x2={-29} y2={0} stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
      {/* Kim giờ chỉ đúng số 2 (60 độ), kim phút chỉ đúng số 12 (0 độ) */}
      <line x1={0} y1={0} x2={21} y2={-12} stroke="#141414" strokeWidth={5} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={-30} stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
      <line
        x1={0}
        y1={0}
        x2={(Math.sin((secDeg * Math.PI) / 180) * 32).toFixed(1)}
        y2={(-Math.cos((secDeg * Math.PI) / 180) * 32).toFixed(1)}
        stroke="#EF4444"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={0} cy={0} r={4.5} fill="#141414" />
      {/* Nhãn 2:00 AM gọn bên dưới đồng hồ */}
      <rect x={-48} y={56} width={96} height={28} rx={10} fill="#1E293B" stroke="#FACC15" strokeWidth={2.5} />
      <text
        x={0}
        y={76}
        textAnchor="middle"
        fill="#FEF08A"
        fontSize={16}
        fontWeight={900}
        fontFamily="'Be Vietnam Pro', sans-serif"
      >
        2:00 AM
      </text>
    </g>
  );
};

/** Cậu bé nằm ngủ trên chiếc giường bên phải của BedroomIndoorBackdrop (có thể ngủ yên hoặc giật mình ngồi bật dậy!) */
const BoyInBedroomBed: React.FC<{
  mode: "sleeping" | "startled" | "awakeWatch";
  frame: number;
  frogOnNose?: boolean;
}> = ({ mode, frame, frogOnNose = false }) => {
  const breathe = Math.sin(frame * 0.08) * 2.5;
  if (mode === "startled") {
    // Giật bắn người ngồi bật dậy trên giường + nét run truyện tranh!
    const jitter = Math.sin(frame * 0.85) * 3;
    return (
      <g transform={`translate(${(1470 + jitter).toFixed(1)}, 638)`}>
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 0,
            y: 195,
            scale: 0.92,
            facing: "left",
            pose: "standing",
            torsoTiltDeg: -10,
            walkWeight: 0,
            isSpeaking: true,
            eyes: "surprised",
            eyebrows: "worried",
            mouth: "gasp",
            sweatDrop: true,
            shiver: true,
            shiverDarkStage: true,
            shiverFrame: frame,
            holdingTarget: {
              leftGrip: { x: -92, y: -58 + Math.sin(frame * 0.5) * 10 },
              rightGrip: { x: 88, y: -52 + Math.cos(frame * 0.5) * 10 },
            },
          }}
        />
        {/* Chăn xanh hất ngang hông */}
        <path d="M -295,60 L -50,45 Q 35,55 45,105 L -295,105 Z" fill="#93C5FD" stroke="#141414" strokeWidth={3} />
        {frogOnNose && (
          <CuteGreenFrog x={-48} y={-122 + Math.sin(frame * 0.35) * 6} scale={0.78} facing={1} pose="jump" frame={frame} />
        )}
      </g>
    );
  }

  // Nằm gối đầu bên phải giường (x≈1510, y≈610), đắp chăn xanh ngủ ngon
  return (
    <g id="boy-sleeping-in-bed">
      {/* Đầu cậu bé nằm nghiêng trên gối trắng */}
      <g transform={`translate(1522, ${(610 + breathe * 0.4).toFixed(1)}) rotate(-12)`}>
        <circle cx={0} cy={0} r={46} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />
        {/* Tóc mái mềm V16.0 */}
        <path
          d="M -39,-20 C -40,-50 -10,-56 12,-52 C 30,-48 40,-34 39,-20 Q 22,-32 10,-25 Q 0,-36 -12,-24 Q -26,-32 -39,-20 Z"
          fill="#1E293B"
          stroke="#141414"
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
        {mode === "awakeWatch" ? (
          <>
            <circle cx={-16} cy={-4} r={7.5} fill="#141414" />
            <circle cx={-18} cy={-6} r={2.5} fill="#FFFFFF" />
            <circle cx={14} cy={-4} r={7.5} fill="#141414" />
            <circle cx={12} cy={-6} r={2.5} fill="#FFFFFF" />
            <path d="M -10,14 Q 0,23 10,14" fill="none" stroke="#141414" strokeWidth={3.8} strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Mắt nhắm hiền hòa + miệng cười nhẹ ngủ ngon */}
            <path d="M -23,-2 Q -15,4 -7,-2" fill="none" stroke="#141414" strokeWidth={3.8} strokeLinecap="round" />
            <path d="M 7,-2 Q 15,4 23,-2" fill="none" stroke="#141414" strokeWidth={3.8} strokeLinecap="round" />
            <path d="M -8,14 Q 0,20 8,14" fill="none" stroke="#141414" strokeWidth={3.5} strokeLinecap="round" />
          </>
        )}
      </g>
      {/* Chữ Zzz bay nhẹ lên khi ngủ */}
      {mode === "sleeping" &&
        [0, 1, 2].map((zi) => {
          const p = (frame * 0.015 + zi * 0.33) % 1;
          const zx = 1545 + zi * 26 + Math.sin(frame * 0.07 + zi) * 6;
          const zy = 545 - p * 85;
          return (
            <text
              key={`zzz_${zi}`}
              x={zx}
              y={zy}
              fill="#FEF08A"
              stroke="#141414"
              strokeWidth={4}
              paintOrder="stroke"
              fontSize={22 + zi * 6}
              fontWeight={900}
              opacity={Math.sin(p * Math.PI)}
              fontFamily="'Be Vietnam Pro', sans-serif"
            >
              Z
            </text>
          );
        })}
    </g>
  );
};

// =============================================================================
// 4. BỘ ĐIỀU PHỐI 64 MICRO-BEATS TADPOLE V16.1
// =============================================================================

export const TadpoleV16SceneLayer: React.FC<{
  mode: TadpoleV16SceneMode;
  frame: number;
  localFrame: number;
  durationFrames: number;
  u: number;
  groundY?: number;
  backdrops: KassStageBackdropsKit;
}> = ({ mode, frame, localFrame, durationFrames, u, groundY = 840, backdrops }) => {
  const {
    CountrysideYardBackdrop,
    BedroomIndoorBackdrop,
    ExplainerPolkaDotBackdrop,
    MagnifyingGlassOverlay,
  } = backdrops;
  const STRIDE_PX = 160;
  const defaultBubbleAppear = Math.max(36, Math.min(105, Math.round(durationFrames * 0.34)));

  // -------------------------------------------------------------------------
  // HỒI 1 (Beats 1–16): AO SEN & LẬP BỂ KÍNH TRONG PHÒNG NGỦ
  // -------------------------------------------------------------------------

  if (mode === "TAD_POND_INTRO_STROLL") {
    const walkT = smoothstep(0.02, 0.72, u);
    const boyX = lerpNum(200, 620, walkT);
    const walkW = u <= 0.75 ? Math.min(smoothstep(0.02, 0.1, u), 1 - smoothstep(0.65, 0.75, u)) : 0;
    const walkC = (Math.abs(boyX - 200) / STRIDE_PX) % 1;
    const handX = boyX + 74;
    const handY = groundY - 210;
    return (
      <g id="tad-1-intro-stroll">
        <LotusPondBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        {/* Vợt lưới gỗ cầm gọn trên tay phải */}
        <g transform={`translate(${handX.toFixed(1)}, ${handY.toFixed(1)}) rotate(-26)`}>
          <line x1={-12} y1={0} x2={125} y2={0} stroke="#78350F" strokeWidth={8} strokeLinecap="round" />
          <ellipse cx={148} cy={0} rx={26} ry={18} fill="#E0F2FE" fillOpacity={0.55} stroke="#141414" strokeWidth={3.2} />
        </g>
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: walkW > 0.05 ? "walking" : "standing",
            torsoTiltDeg: walkW * 8,
            walkCycleProgress: walkC,
            walkWeight: walkW,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
            blush: true,
            holdingTarget: { rightGrip: { x: handX, y: handY } },
          }}
        />
      </g>
    );
  }

  if (mode === "TAD_POND_SPOT_SWARM" || mode === "TAD_POND_CLOSE_PEEK" || mode === "TAD_POND_GENIUS_IDEA") {
    const boyX = mode === "TAD_POND_SPOT_SWARM" ? lerpNum(620, 745, smoothstep(0.05, 0.6, u)) : 745;
    const walkW = mode === "TAD_POND_SPOT_SWARM" && u < 0.62 ? Math.min(smoothstep(0.05, 0.14, u), 1 - smoothstep(0.52, 0.62, u)) : 0;
    const walkC = (Math.abs(boyX - 620) / STRIDE_PX) % 1;
    const bubbleText =
      mode === "TAD_POND_CLOSE_PEEK"
        ? "Ồ, nòng nọc kìa!"
        : mode === "TAD_POND_GENIUS_IDEA"
        ? "Đem về nuôi thôi!"
        : "";
    const isTalk = bubbleText ? isComicBubbleActive(localFrame, defaultBubbleAppear) : false;

    return (
      <g id={`tad-${mode}`}>
        <LotusPondBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        {/* Đàn nòng nọc đen bơi ríu rít sát mép bờ ao sen */}
        {Array.from({ length: 14 }).map((_, i) => {
          const sx = 985 + ((i * 53) % 340) + Math.sin(frame * 0.045 + i) * 28;
          const sy = 715 + ((i * 39) % 165) + Math.cos(frame * 0.055 + i) * 14;
          const dir = Math.cos(frame * 0.045 + i) >= 0 ? 0 : 180;
          return <SwimmingTadpole key={`pond_t_${i}`} x={sx} y={sy} scale={0.78} angleDeg={dir} frame={frame} phase={i} />;
        })}
        {/* Bóng đèn ý tưởng bật sáng trong beat GENIUS_IDEA */}
        {mode === "TAD_POND_GENIUS_IDEA" && u > 0.22 && (
          <g transform={`translate(${boyX + 95}, ${groundY - 405}) scale(${easeOutBack(Math.min(1, (u - 0.22) / 0.14)).toFixed(3)})`}>
            <circle cx={0} cy={0} r={34} fill="#FEF08A" opacity={0.55} />
            <circle cx={0} cy={0} r={22} fill="#FACC15" stroke="#141414" strokeWidth={3.5} />
            <rect x={-7} y={20} width={14} height={9} rx={2} fill="#94A3B8" stroke="#141414" strokeWidth={2.5} />
          </g>
        )}
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: walkW > 0.05 ? "walking" : "standing",
            torsoTiltDeg: mode === "TAD_POND_GENIUS_IDEA" ? 4 : 16,
            walkCycleProgress: walkC,
            walkWeight: walkW,
            isSpeaking: isTalk,
            eyes: mode === "TAD_POND_GENIUS_IDEA" ? "happy" : "curious",
            eyebrows: mode === "TAD_POND_GENIUS_IDEA" ? "neutral" : "inquisitive",
            mouth: "smile",
            blush: mode === "TAD_POND_GENIUS_IDEA",
            pupilGaze: { x: 0.85, y: 0.45 },
          }}
        />
        {bubbleText && (
          <ComicSpeechBubble
            x={boyX - 105}
            y={groundY - 495}
            mouthX={boyX + 18}
            mouthY={groundY - 315}
            headTopY={groundY - 405}
            text={bubbleText}
            localFrame={localFrame}
            appearFrame={defaultBubbleAppear}
          />
        )}
      </g>
    );
  }

  // STILL #1 TARGET: Cậu bé cầm vợt lưới vớt nòng nọc ở ao sen!
  if (mode === "TAD_POND_SCOOP_NET") {
    const boyX = 745;
    const scoopWave = Math.sin(u * Math.PI * 2.2);
    const handX = boyX + 86 + scoopWave * 10;
    const handY = groundY - 195 + scoopWave * 14;
    const netRot = 28 - scoopWave * 14;
    const netRad = (netRot * Math.PI) / 180;
    const netTipX = handX + 188 * Math.cos(netRad);
    const netTipY = handY + 188 * Math.sin(netRad);

    return (
      <g id="tad-5-pond-scoop-net">
        <LotusPondBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        {/* Xô nước xanh đặt sẵn trên bờ cỏ ngay sau cậu bé */}
        <BlueWaterBucket x={580} y={groundY - 24} scale={1.15} hasWater={true} />
        {/* Đàn nòng nọc bơi lượn dưới mặt nước quanh vợt */}
        {Array.from({ length: 14 }).map((_, i) => {
          const sx = 980 + ((i * 58) % 360) + Math.sin(frame * 0.05 + i) * 24;
          const sy = 720 + ((i * 37) % 155) + Math.cos(frame * 0.06 + i) * 10;
          return <SwimmingTadpole key={`scoop_t_${i}`} x={sx} y={sy} scale={0.82} angleDeg={i % 2 === 0 ? 15 : 165} frame={frame} phase={i} />;
        })}
        {/* Vòng sóng nước bắn lên ngay chỗ vợt lưới nhúng xuống ao */}
        <ellipse
          cx={netTipX}
          cy={Math.max(720, netTipY)}
          rx={38 + Math.sin(frame * 0.18) * 10}
          ry={11 + Math.sin(frame * 0.18) * 3}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3.5}
          opacity={0.82}
        />
        {/* Vợt lưới gỗ cầm khít tay phải cậu bé */}
        <g transform={`translate(${handX.toFixed(1)}, ${handY.toFixed(1)}) rotate(${netRot.toFixed(1)})`}>
          <line x1={-16} y1={0} x2={165} y2={0} stroke="#141414" strokeWidth={11} strokeLinecap="round" />
          <line x1={-16} y1={0} x2={165} y2={0} stroke="#92400E" strokeWidth={6.5} strokeLinecap="round" />
          {/* Vòng lưới trắng đan ô bắt nòng nọc */}
          <ellipse cx={194} cy={0} rx={36} ry={24} fill="#E0F2FE" fillOpacity={0.68} stroke="#141414" strokeWidth={3.5} />
          <line x1={174} y1={-18} x2={174} y2={18} stroke="#94A3B8" strokeWidth={1.8} />
          <line x1={194} y1={-22} x2={194} y2={22} stroke="#94A3B8" strokeWidth={1.8} />
          <line x1={214} y1={-18} x2={214} y2={18} stroke="#94A3B8" strokeWidth={1.8} />
          <line x1={164} y1={0} x2={224} y2={0} stroke="#94A3B8" strokeWidth={1.8} />
          {/* 3 chú nòng nọc nhỏ nằm trong vợt */}
          <circle cx={188} cy={-5} r={5} fill="#1E293B" />
          <circle cx={202} cy={6} r={5} fill="#1E293B" />
          <circle cx={195} cy={-2} r={4.5} fill="#1E293B" />
        </g>
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: 18,
            walkWeight: 0,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
            blush: true,
            pupilGaze: { x: 0.85, y: 0.45 },
            holdingTarget: { rightGrip: { x: handX, y: handY } },
          }}
        />
      </g>
    );
  }

  if (mode === "TAD_POND_BUCKET_COUNT" || mode === "TAD_POND_GRAB_WEEDS") {
    const boyX = 695;
    const isCount = mode === "TAD_POND_BUCKET_COUNT";
    const isTalk = isCount && isComicBubbleActive(localFrame, defaultBubbleAppear);
    return (
      <g id={`tad-${mode}`}>
        <LotusPondBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        {/* Xô nước đầy nòng nọc đặt trước mặt BOY + khung phóng to bên trên */}
        <BlueWaterBucket x={835} y={groundY - 22} scale={1.25} hasWater={true} />
        {/* Vòng tròn phóng đại miệng xô cho thấy 50 chú nòng nọc & rong xanh */}
        <g transform="translate(1240, 410)">
          <circle cx={0} cy={0} r={148} fill="#7DD3FC" stroke="#141414" strokeWidth={5} />
          {!isCount && (
            <>
              <path d="M -75,85 Q -45,10 -65,-70" fill="none" stroke="#16A34A" strokeWidth={11} strokeLinecap="round" />
              <path d="M 55,95 Q 80,25 45,-65" fill="none" stroke="#22C55E" strokeWidth={10} strokeLinecap="round" />
            </>
          )}
          {Array.from({ length: 14 }).map((_, i) => {
            const ang = (i / 14) * Math.PI * 2 + frame * 0.02;
            const rad = 32 + (i % 3) * 34;
            return (
              <SwimmingTadpole
                key={`bkt_t_${i}`}
                x={Math.cos(ang) * rad}
                y={Math.sin(ang) * rad}
                scale={0.92}
                angleDeg={(ang * 180) / Math.PI + 90}
                frame={frame}
                phase={i}
              />
            );
          })}
          <MagnifyingGlassOverlay x={0} y={0} radius={148} handleAngleDeg={42} localFrame={localFrame} />
        </g>
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: 14,
            walkWeight: 0,
            isSpeaking: isTalk,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
            blush: true,
            pupilGaze: { x: 0.7, y: 0.45 },
          }}
        />
        {isCount && (
          <ComicSpeechBubble
            x={boyX - 90}
            y={groundY - 495}
            mouthX={boyX + 24}
            mouthY={groundY - 315}
            headTopY={groundY - 405}
            text="Hơn 50 con luôn!"
            localFrame={localFrame}
            appearFrame={defaultBubbleAppear}
          />
        )}
      </g>
    );
  }

  if (mode === "TAD_YARD_CARRY_HOME" || mode === "TAD_YARD_GRANDPA_ASK" || mode === "TAD_YARD_BOY_BRAG") {
    const isCarry = mode === "TAD_YARD_CARRY_HOME";
    const boyX = isCarry ? lerpNum(240, 820, smoothstep(0.02, 0.92, u)) : 810;
    const walkW = isCarry ? Math.min(smoothstep(0.02, 0.1, u), 1 - smoothstep(0.84, 0.94, u)) : 0;
    const walkC = (Math.abs(boyX - 240) / STRIDE_PX) % 1;
    const handX = boyX + 64;
    const handY = mode === "TAD_YARD_BOY_BRAG" ? groundY - 210 : groundY - 168;
    const grandpaTalk = mode === "TAD_YARD_GRANDPA_ASK" && isComicBubbleActive(localFrame, defaultBubbleAppear);
    const boyTalk = mode === "TAD_YARD_BOY_BRAG" && isComicBubbleActive(localFrame, defaultBubbleAppear);

    return (
      <g id={`tad-${mode}`}>
        <CountrysideYardBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <BlueWaterBucket x={handX + 8} y={handY + 52} scale={1.0} hasWater={true} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: walkW > 0.05 ? "walking" : "standing",
            torsoTiltDeg: walkW * 7,
            walkCycleProgress: walkC,
            walkWeight: walkW,
            isSpeaking: boyTalk,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
            blush: true,
            holdingTarget: { rightGrip: { x: handX, y: handY } },
          }}
        />
        {!isCarry && (
          <StickmanRig
            characterPreset="GRANDPA"
            frame={frame}
            state={{
              x: 1380,
              y: groundY - 26,
              scale: 0.96,
              facing: "left",
              pose: "standing",
              torsoTiltDeg: 4,
              walkWeight: 0,
              isSpeaking: grandpaTalk,
              nodAmplitudeDeg: 3.5,
              nodFreq: 0.12,
              eyes: mode === "TAD_YARD_GRANDPA_ASK" ? "curious" : "happy",
              eyebrows: mode === "TAD_YARD_GRANDPA_ASK" ? "inquisitive" : "neutral",
              mouth: "smile",
            }}
          />
        )}
        {mode === "TAD_YARD_GRANDPA_ASK" && (
          <ComicSpeechBubble
            x={1240}
            y={groundY - 520}
            mouthX={1350}
            mouthY={groundY - 335}
            headTopY={groundY - 430}
            text="Gì trong xô thế cháu?"
            localFrame={localFrame}
            appearFrame={defaultBubbleAppear}
          />
        )}
        {mode === "TAD_YARD_BOY_BRAG" && (
          <ComicSpeechBubble
            x={boyX + 95}
            y={groundY - 495}
            mouthX={boyX + 25}
            mouthY={groundY - 315}
            headTopY={groundY - 405}
            text="Thú cưng im re ông ạ!"
            localFrame={localFrame}
            appearFrame={defaultBubbleAppear}
          />
        )}
      </g>
    );
  }

  if (
    mode === "TAD_BEDROOM_SETUP_TANK" ||
    mode === "TAD_BEDROOM_POUR_WATER" ||
    mode === "TAD_BEDROOM_FEED_LETTUCE" ||
    mode === "TAD_BEDROOM_NIGHT_WATCH"
  ) {
    const isNightWatch = mode === "TAD_BEDROOM_NIGHT_WATCH";
    const isSunset = mode === "TAD_BEDROOM_FEED_LETTUCE";
    const timeOfDay = isNightWatch ? "NIGHT" : isSunset ? "SUNSET" : "DAY";
    const boyX = 430;
    const pourTilt = mode === "TAD_BEDROOM_POUR_WATER" ? lerpNum(15, 62, smoothstep(0.15, 0.72, u)) : 0;

    return (
      <g id={`tad-${mode}`}>
        <BedroomIndoorBackdrop timeOfDay={timeOfDay} frame={frame} groundY={groundY} />
        <BedroomGlassTank
          x={580}
          y={465}
          w={345}
          h={205}
          frame={frame}
          emptyClean={mode === "TAD_BEDROOM_SETUP_TANK"}
          hasLettuce={mode === "TAD_BEDROOM_FEED_LETTUCE"}
          tadpoleStage="tadpole"
          tadpoleCount={mode === "TAD_BEDROOM_SETUP_TANK" ? 0 : 14}
        />
        {mode === "TAD_BEDROOM_POUR_WATER" && (
          <>
            <BlueWaterBucket x={545} y={405} tiltDeg={pourTilt} scale={0.95} hasWater={true} />
            <path
              d="M 575,425 Q 625,450 645,515"
              fill="none"
              stroke="#38BDF8"
              strokeWidth={14}
              strokeLinecap="round"
              opacity={0.78}
            />
          </>
        )}
        {isNightWatch ? (
          <BoyInBedroomBed mode="awakeWatch" frame={frame} />
        ) : (
          <StickmanRig
            characterPreset="BOY"
            frame={frame}
            state={{
              x: boyX,
              y: groundY,
              scale: 0.96,
              facing: "right",
              pose: "standing",
              torsoTiltDeg: 10,
              walkWeight: 0,
              eyes: "happy",
              eyebrows: "neutral",
              mouth: "smile",
              blush: true,
              holdingTarget:
                mode === "TAD_BEDROOM_POUR_WATER"
                  ? { rightGrip: { x: 520, y: 425 } }
                  : mode === "TAD_BEDROOM_FEED_LETTUCE"
                  ? { rightGrip: { x: 540, y: 525 + Math.sin(frame * 0.18) * 14 } }
                  : undefined,
            }}
          />
        )}
      </g>
    );
  }

  // Cận cảnh bể kính bơi lượn (Hồi 1 Beat 14) & Cận cảnh nòng nọc mọc chân (Hồi 2 Beat 18 - STILL #2!) & các cận bể Hồi 2
  if (
    mode === "TAD_TANK_SWIM_CLOSEUP" ||
    mode === "TAD_TANK_HIND_LEGS_CLOSEUP" ||
    mode === "TAD_TANK_GULP_AIR_SURFACE" ||
    mode === "TAD_TANK_FRONT_LEGS_POP" ||
    mode === "TAD_TANK_STOP_EATING" ||
    mode === "TAD_TANK_TAIL_SHRINK_VIEW" ||
    mode === "TAD_TANK_CLIMB_ROCK"
  ) {
    const isSunset = mode === "TAD_TANK_FRONT_LEGS_POP" || mode === "TAD_TANK_CLIMB_ROCK";
    const stage: TadpoleGrowthStage =
      mode === "TAD_TANK_SWIM_CLOSEUP"
        ? "tadpole"
        : mode === "TAD_TANK_HIND_LEGS_CLOSEUP" || mode === "TAD_TANK_GULP_AIR_SURFACE"
        ? "backLegs"
        : mode === "TAD_TANK_FRONT_LEGS_POP" || mode === "TAD_TANK_STOP_EATING"
        ? "fourLegs"
        : "shortTail";
    const hasRock = mode === "TAD_TANK_FRONT_LEGS_POP" || mode === "TAD_TANK_STOP_EATING" || mode === "TAD_TANK_TAIL_SHRINK_VIEW" || mode === "TAD_TANK_CLIMB_ROCK";
    const tailRatio = mode === "TAD_TANK_TAIL_SHRINK_VIEW" ? lerpNum(0.85, 0.22, smoothstep(0.1, 0.9, u)) : undefined;
    const bubbleText =
      mode === "TAD_TANK_HIND_LEGS_CLOSEUP"
        ? "Ủa, mọc chân rồi!"
        : mode === "TAD_TANK_STOP_EATING"
        ? "Sao không ăn rau nhỉ?"
        : "";
    const isTalk = bubbleText ? isComicBubbleActive(localFrame, defaultBubbleAppear) : false;

    return (
      <g id={`tad-${mode}`}>
        <BedroomIndoorBackdrop timeOfDay={isSunset ? "SUNSET" : "DAY"} frame={frame} groundY={groundY} />
        {/* Bể kính lớn phóng rõ đặt cạnh giường để nhìn rõ từng chú nòng nọc mọc chân, đớp khí & leo đá */}
        <BedroomGlassTank
          x={520}
          y={405}
          w={475}
          h={265}
          frame={frame}
          hasRockIsland={hasRock}
          hasLettuce={mode === "TAD_TANK_STOP_EATING"}
          tadpoleStage={stage}
          tadpoleCount={mode === "TAD_TANK_CLIMB_ROCK" ? 7 : 11}
          frogOnRockCount={mode === "TAD_TANK_CLIMB_ROCK" ? 4 : mode === "TAD_TANK_TAIL_SHRINK_VIEW" ? 1 : 0}
          gulpAir={mode === "TAD_TANK_GULP_AIR_SURFACE" || mode === "TAD_TANK_HIND_LEGS_CLOSEUP"}
          tailRatio={tailRatio}
        />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 375,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: 14,
            walkWeight: 0,
            isSpeaking: isTalk,
            eyes: mode === "TAD_TANK_STOP_EATING" || mode === "TAD_TANK_HIND_LEGS_CLOSEUP" ? "curious" : "happy",
            eyebrows: mode === "TAD_TANK_STOP_EATING" || mode === "TAD_TANK_HIND_LEGS_CLOSEUP" ? "inquisitive" : "neutral",
            mouth: "smile",
            blush: mode === "TAD_TANK_SWIM_CLOSEUP" || mode === "TAD_TANK_CLIMB_ROCK",
            pupilGaze: { x: 0.9, y: 0.15 },
          }}
        />
        {bubbleText && (
          <ComicSpeechBubble
            x={375}
            y={groundY - 495}
            mouthX={395}
            mouthY={groundY - 315}
            headTopY={groundY - 405}
            text={bubbleText}
            localFrame={localFrame}
            appearFrame={defaultBubbleAppear}
          />
        )}
      </g>
    );
  }

  // Các cảnh rộng phòng ngủ Hồi 2 (tuần 2 thức dậy, ghi sổ tay, xếp đá đảo, bể đông ếch, đậy hờ nắp lưới)
  if (
    mode === "TAD_BEDROOM_WEEK2_MORNING" ||
    mode === "TAD_BEDROOM_BOY_NOTEBOOK" ||
    mode === "TAD_BEDROOM_ADD_ROCK_ISLAND" ||
    mode === "TAD_BEDROOM_CROWDED_TANK" ||
    mode === "TAD_BEDROOM_FORGET_LID"
  ) {
    const isNight = mode === "TAD_BEDROOM_FORGET_LID";
    const isSunset = mode === "TAD_BEDROOM_CROWDED_TANK";
    const boyX =
      mode === "TAD_BEDROOM_WEEK2_MORNING"
        ? lerpNum(960, 460, smoothstep(0.08, 0.72, u))
        : 430;
    const walkW = mode === "TAD_BEDROOM_WEEK2_MORNING" && u < 0.74 ? Math.min(smoothstep(0.08, 0.16, u), 1 - smoothstep(0.64, 0.74, u)) : 0;
    const walkC = (Math.abs(960 - boyX) / STRIDE_PX) % 1;

    return (
      <g id={`tad-${mode}`}>
        <BedroomIndoorBackdrop timeOfDay={isNight ? "NIGHT" : isSunset ? "SUNSET" : "DAY"} frame={frame} groundY={groundY} />
        <BedroomGlassTank
          x={580}
          y={465}
          w={355}
          h={205}
          frame={frame}
          lidState={isNight ? "ajar" : "none"}
          hasRockIsland={mode !== "TAD_BEDROOM_WEEK2_MORNING" && mode !== "TAD_BEDROOM_BOY_NOTEBOOK"}
          tadpoleStage={mode === "TAD_BEDROOM_CROWDED_TANK" || isNight ? "shortTail" : "backLegs"}
          tadpoleCount={mode === "TAD_BEDROOM_CROWDED_TANK" || isNight ? 5 : 11}
          frogOnRockCount={mode === "TAD_BEDROOM_CROWDED_TANK" || isNight ? 5 : 0}
          gulpAir={mode === "TAD_BEDROOM_ADD_ROCK_ISLAND"}
        />
        {isNight ? (
          <BoyInBedroomBed mode="sleeping" frame={frame} />
        ) : (
          <>
            {mode === "TAD_BEDROOM_BOY_NOTEBOOK" && (
              <g transform="translate(500, 625) rotate(-8)">
                <rect x={-26} y={-32} width={52} height={64} rx={5} fill="#FEF9C3" stroke="#141414" strokeWidth={3} />
                <line x1={-16} y1={-14} x2={16} y2={-14} stroke="#64748B" strokeWidth={2.5} />
                <line x1={-16} y1={0} x2={14} y2={0} stroke="#64748B" strokeWidth={2.5} />
                <line x1={-16} y1={14} x2={12} y2={14} stroke="#64748B" strokeWidth={2.5} />
              </g>
            )}
            <StickmanRig
              characterPreset="BOY"
              frame={frame}
              state={{
                x: boyX,
                y: groundY,
                scale: 0.96,
                facing: mode === "TAD_BEDROOM_WEEK2_MORNING" && walkW > 0.05 ? "left" : "right",
                pose: walkW > 0.05 ? "walking" : "standing",
                torsoTiltDeg: walkW > 0.05 ? 8 : 10,
                walkCycleProgress: walkC,
                walkWeight: walkW,
                eyes: mode === "TAD_BEDROOM_WEEK2_MORNING" ? "curious" : "happy",
                eyebrows: mode === "TAD_BEDROOM_WEEK2_MORNING" ? "inquisitive" : "neutral",
                mouth: "smile",
                blush: true,
                holdingTarget:
                  mode === "TAD_BEDROOM_BOY_NOTEBOOK"
                    ? { rightGrip: { x: 492, y: 630 } }
                    : undefined,
              }}
            />
          </>
        )}
      </g>
    );
  }

  // -------------------------------------------------------------------------
  // HỒI 3 (Beats 33–48): ĐẠI NÁO 2 GIỜ SÁNG — ẾCH NHẢY KHẮP PHÒNG & ÔNG NỘI BẬT ĐÈN!
  // -------------------------------------------------------------------------

  if (
    mode === "TAD_BEDROOM_2AM_SILENT" ||
    mode === "TAD_BEDROOM_2AM_LID_PUSH" ||
    mode === "TAD_BEDROOM_2AM_FIRST_ESCAPE" ||
    mode === "TAD_BEDROOM_2AM_WALL_CLING" ||
    mode === "TAD_BEDROOM_2AM_FIRST_CROAK" ||
    mode === "TAD_BEDROOM_2AM_SLEEP_STIR" ||
    mode === "TAD_BEDROOM_2AM_NOSE_JUMP" ||
    mode === "TAD_BEDROOM_2AM_CHAOS_SWARM" ||
    mode === "TAD_BEDROOM_2AM_BOY_CHASE" ||
    mode === "TAD_BEDROOM_2AM_FOOTSTEPS"
  ) {
    const isChaosHeavy =
      mode === "TAD_BEDROOM_2AM_WALL_CLING" ||
      mode === "TAD_BEDROOM_2AM_FIRST_CROAK" ||
      mode === "TAD_BEDROOM_2AM_SLEEP_STIR" ||
      mode === "TAD_BEDROOM_2AM_NOSE_JUMP" ||
      mode === "TAD_BEDROOM_2AM_CHAOS_SWARM" ||
      mode === "TAD_BEDROOM_2AM_BOY_CHASE" ||
      mode === "TAD_BEDROOM_2AM_FOOTSTEPS";

    const isCroakingMode =
      mode === "TAD_BEDROOM_2AM_FIRST_CROAK" ||
      mode === "TAD_BEDROOM_2AM_SLEEP_STIR" ||
      mode === "TAD_BEDROOM_2AM_NOSE_JUMP" ||
      mode === "TAD_BEDROOM_2AM_CHAOS_SWARM" ||
      mode === "TAD_BEDROOM_2AM_BOY_CHASE" ||
      mode === "TAD_BEDROOM_2AM_FOOTSTEPS";

    const lidState =
      mode === "TAD_BEDROOM_2AM_SILENT"
        ? "ajar"
        : mode === "TAD_BEDROOM_2AM_LID_PUSH"
        ? u > 0.45
          ? "open"
          : "ajar"
        : "open";

    const chaseBoyX =
      mode === "TAD_BEDROOM_2AM_BOY_CHASE"
        ? lerpNum(1120, 620, smoothstep(0.05, 0.9, u))
        : 1080;
    const chaseWalkC = (Math.abs(1120 - chaseBoyX) / 145) % 1;

    return (
      <g id={`tad-${mode}`}>
        <BedroomIndoorBackdrop timeOfDay="NIGHT" frame={frame} groundY={groundY} />
        {/* Đồng hồ treo tường chỉ rõ 2:00 AM */}
        <WallClock2AM x={830} y={225} frame={frame} />

        {/* Bể kính cạnh giường đã bật mở nắp lưới */}
        <BedroomGlassTank
          x={575}
          y={465}
          w={345}
          h={205}
          frame={frame}
          lidState={lidState}
          hasRockIsland={true}
          tadpoleStage="shortTail"
          tadpoleCount={mode === "TAD_BEDROOM_2AM_SILENT" ? 4 : 1}
          frogOnRockCount={mode === "TAD_BEDROOM_2AM_SILENT" || mode === "TAD_BEDROOM_2AM_LID_PUSH" ? 4 : 1}
        />

        {/* Ếch tiên phong đẩy nắp bể / nhảy vọt ra ngoài */}
        {(mode === "TAD_BEDROOM_2AM_LID_PUSH" || mode === "TAD_BEDROOM_2AM_FIRST_ESCAPE") &&
          [0, 1, 2, 3].map((fi) => {
            const p = (u * 1.4 + fi * 0.22) % 1;
            const fx = lerpNum(720, 420 + fi * 220, p);
            const fy = 455 - Math.sin(p * Math.PI) * 145 + p * 230;
            return <CuteGreenFrog key={`esc_${fi}`} x={fx} y={fy} scale={0.85} facing={fx > 720 ? 1 : -1} pose="jump" frame={frame} phase={fi} />;
          })}

        {/* Hàng chục chú ếch xanh bám trên cửa sổ, tường, đèn ngủ, bàn & nhảy bật khắp phòng! */}
        {isChaosHeavy && (
          <g id="bedroom-2am-frog-swarm">
            {/* Bám trên cửa sổ & tường */}
            <CuteGreenFrog x={355} y={240} scale={0.78} pose="cling" frame={frame} phase={0.2} />
            <CuteGreenFrog x={510} y={320} scale={0.74} pose="cling" frame={frame} phase={1.4} />
            <CuteGreenFrog x={210} y={485} scale={0.78} pose="cling" frame={frame} phase={2.1} />
            <CuteGreenFrog x={1020} y={335} scale={0.76} pose="cling" frame={frame} phase={3.3} />
            <CuteGreenFrog x={1350} y={295} scale={0.78} pose="cling" frame={frame} phase={4.1} />
            {/* Ngồi trên chao đèn ngủ, thành bể, cạnh tủ */}
            <CuteGreenFrog x={1042} y={556} scale={0.78} facing={-1} pose="sit" croaking={isCroakingMode} frame={frame} phase={0.8} />
            <CuteGreenFrog x={625} y={456} scale={0.82} facing={1} pose="sit" croaking={isCroakingMode} frame={frame} phase={1.9} />
            <CuteGreenFrog x={420} y={818} scale={0.88} facing={1} pose="sit" croaking={isCroakingMode} frame={frame} phase={2.7} />
            <CuteGreenFrog x={920} y={824} scale={0.86} facing={-1} pose="sit" croaking={isCroakingMode} frame={frame} phase={3.5} />
            {/* 5 chú ếch bật nhảy vòng cung parabol liên tục 60fps quanh phòng! */}
            {[
              { x0: 260, x1: 520, y0: 815, h: 210, sp: 0.024 },
              { x0: 660, x1: 1020, y0: 470, h: 175, sp: 0.028 },
              { x0: 1120, x1: 1440, y0: 650, h: 190, sp: 0.022 },
              { x0: 1220, x1: 860, y0: 825, h: 225, sp: 0.026 },
              { x0: 480, x1: 790, y0: 820, h: 195, sp: 0.03 },
            ].map((j, ji) => {
              const t = (frame * j.sp + ji * 0.27) % 1;
              const jx = lerpNum(j.x0, j.x1, t);
              const jy = j.y0 - Math.sin(t * Math.PI) * j.h;
              return (
                <CuteGreenFrog
                  key={`hop_${ji}`}
                  x={jx}
                  y={jy}
                  scale={0.84}
                  facing={j.x1 >= j.x0 ? 1 : -1}
                  pose="jump"
                  frame={frame}
                  phase={ji}
                />
              );
            })}
          </g>
        )}

        {/* Nhân vật BOY: ngủ yên / giật bắn vì ếch nhảy trúng mũi / hoảng hốt vung tay đuổi bắt */}
        {mode === "TAD_BEDROOM_2AM_BOY_CHASE" || mode === "TAD_BEDROOM_2AM_CHAOS_SWARM" || mode === "TAD_BEDROOM_2AM_FOOTSTEPS" ? (
          <StickmanRig
            characterPreset="BOY"
            frame={frame}
            state={{
              x: mode === "TAD_BEDROOM_2AM_BOY_CHASE" ? chaseBoyX : 1140,
              y: groundY,
              scale: 0.96,
              facing: "left",
              pose: mode === "TAD_BEDROOM_2AM_BOY_CHASE" ? "running" : "standing",
              torsoTiltDeg: mode === "TAD_BEDROOM_2AM_BOY_CHASE" ? 14 : -10,
              walkCycleProgress: mode === "TAD_BEDROOM_2AM_BOY_CHASE" ? chaseWalkC : 0,
              walkWeight: mode === "TAD_BEDROOM_2AM_BOY_CHASE" ? 1 : 0,
              isSpeaking: mode === "TAD_BEDROOM_2AM_BOY_CHASE" && isComicBubbleActive(localFrame, defaultBubbleAppear),
              eyes: "surprised",
              eyebrows: "worried",
              mouth: "gasp",
              sweatDrop: true,
              shiver: mode === "TAD_BEDROOM_2AM_CHAOS_SWARM",
              shiverDarkStage: true,
              shiverFrame: frame,
            holdingTarget: {
              leftGrip: { x: (mode === "TAD_BEDROOM_2AM_BOY_CHASE" ? chaseBoyX : 1140) - 96, y: groundY - 255 + Math.sin(frame * 0.45) * 14 },
              rightGrip: { x: (mode === "TAD_BEDROOM_2AM_BOY_CHASE" ? chaseBoyX : 1140) + 88, y: groundY - 245 + Math.cos(frame * 0.45) * 14 },
            },
          }}
        />
        ) : mode === "TAD_BEDROOM_2AM_NOSE_JUMP" ? (
          <BoyInBedroomBed mode="startled" frame={frame} frogOnNose={true} />
        ) : (
          <BoyInBedroomBed mode="sleeping" frame={frame} />
        )}

        {/* Bóng thoại "Ộp! Oạp!" rải quanh phòng (không đè lên đầu/mặt nhân vật!) */}
        {isCroakingMode && (
          <g id="croak-bubbles-2am">
            <MiniCroakTag x={365} y={175} text="Ộp! Oạp!" frame={frame} phase={0.2} scale={1.08} />
            <MiniCroakTag x={630} y={365} text="Ộp!" frame={frame} phase={1.5} scale={0.96} />
            <MiniCroakTag x={985} y={445} text="Oạp!" frame={frame} phase={2.4} scale={0.98} />
            <MiniCroakTag x={1355} y={230} text="Ộp! Oạp!" frame={frame} phase={3.2} scale={1.04} />
            <MiniCroakTag x={450} y={745} text="Ộp!" frame={frame} phase={4.0} scale={0.92} />
          </g>
        )}

        {mode === "TAD_BEDROOM_2AM_NOSE_JUMP" && (
          <ComicSpeechBubble
            x={1340}
            y={255}
            mouthX={1435}
            mouthY={465}
            headTopY={390}
            text="ÁAA! CÁI GÌ THẾ!"
            localFrame={localFrame}
            appearFrame={10}
          />
        )}
        {mode === "TAD_BEDROOM_2AM_BOY_CHASE" && (
          <ComicSpeechBubble
            x={chaseBoyX}
            y={groundY - 500}
            mouthX={chaseBoyX - 24}
            mouthY={groundY - 315}
            headTopY={groundY - 405}
            text="Đứng lại đã!"
            localFrame={localFrame}
            appearFrame={defaultBubbleAppear}
          />
        )}
      </g>
    );
  }

  // Ông nội bật đèn chạy vào đứng hình + ếch ngồi trên đèn ngủ + hai ông cháu cười & hợp lực bắt ếch!
  if (
    mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS" ||
    mode === "TAD_BEDROOM_2AM_FROG_ON_LAMP" ||
    mode === "TAD_BEDROOM_2AM_AWKWARD_SMILE" ||
    mode === "TAD_BEDROOM_TEAM_CATCH" ||
    mode === "TAD_BEDROOM_BUCKET_FULL"
  ) {
    const isTeamCatch = mode === "TAD_BEDROOM_TEAM_CATCH";
    const isBucketFull = mode === "TAD_BEDROOM_BUCKET_FULL";
    const grandpaX = mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS" ? lerpNum(180, 315, smoothstep(0.02, 0.3, u)) : isTeamCatch ? lerpNum(340, 620, smoothstep(0.1, 0.85, u)) : 335;
    const boyX = isTeamCatch ? lerpNum(1120, 880, smoothstep(0.1, 0.85, u)) : 1120;
    const gpWalkW = isTeamCatch ? 0.8 : 0;
    const gpWalkC = (frame / 32) % 1;
    const boyWalkC = (frame / 28) % 1;

    const gpBubble =
      mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS"
        ? "Trời đất ơi!"
        : mode === "TAD_BEDROOM_2AM_AWKWARD_SMILE"
        ? "Im re dữ chưa con?"
        : "";
    const isGpTalk = gpBubble ? isComicBubbleActive(localFrame, defaultBubbleAppear) : false;

    return (
      <g id={`tad-${mode}`}>
        {/* Đèn trần bật sáng trưng! */}
        <BedroomIndoorBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        {/* Cửa phòng ngủ mở toang bên trái */}
        <rect x={40} y={335} width={165} height={435} rx={8} fill="#78350F" stroke="#141414" strokeWidth={4} />
        <rect x={58} y={355} width={129} height={395} fill="#0F172A" />

        <WallClock2AM x={830} y={225} frame={frame} glow={false} />
        <BedroomGlassTank x={575} y={465} w={345} h={205} frame={frame} lidState="open" hasRockIsland={true} tadpoleCount={0} frogOnRockCount={0} />

        {!isBucketFull ? (
          <>
            <CuteGreenFrog x={1042} y={556} scale={0.86} facing={-1} pose="sit" croaking={mode === "TAD_BEDROOM_2AM_FROG_ON_LAMP"} frame={frame} phase={0.4} />
            <CuteGreenFrog x={355} y={240} scale={0.76} pose="cling" frame={frame} phase={1.2} />
            <CuteGreenFrog x={510} y={325} scale={0.74} pose="cling" frame={frame} phase={2.1} />
            <CuteGreenFrog x={920} y={824} scale={0.86} facing={-1} pose="sit" frame={frame} phase={3.0} />
            <CuteGreenFrog x={755} y={824 - Math.abs(Math.sin(frame * 0.14)) * 95} scale={0.84} facing={1} pose="jump" frame={frame} phase={0.7} />
            {mode === "TAD_BEDROOM_2AM_FROG_ON_LAMP" && (
              <MiniCroakTag x={1042} y={485} text="Ộp!" frame={frame} phase={0.5} scale={1.15} />
            )}
          </>
        ) : (
          /* Xô xanh gom đủ đàn ếch đặt giữa phòng */
          <g>
            <BlueWaterBucket x={745} y={groundY - 24} scale={1.32} hasWater={true} />
            <CuteGreenFrog x={725} y={groundY - 72} scale={0.62} facing={1} pose="sit" frame={frame} phase={0.2} />
            <CuteGreenFrog x={765} y={groundY - 70} scale={0.62} facing={-1} pose="sit" frame={frame} phase={1.5} />
          </g>
        )}

        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: grandpaX,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: gpWalkW > 0.05 ? "walking" : "standing",
            torsoTiltDeg: mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS" ? -8 : isTeamCatch ? 14 : 4,
            walkCycleProgress: gpWalkC,
            walkWeight: gpWalkW,
            isSpeaking: isGpTalk,
            eyes: mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS" ? "surprised" : "happy",
            eyebrows: mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS" ? "worried" : "neutral",
            mouth: mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS" ? "gasp" : "smile",
            sweatDrop: mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS",
          }}
        />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "left",
            pose: isTeamCatch ? "walking" : "standing",
            torsoTiltDeg: isTeamCatch ? 12 : 4,
            walkCycleProgress: boyWalkC,
            walkWeight: isTeamCatch ? 0.85 : 0,
            eyes: mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS" ? "wide" : "happy",
            eyebrows: mode === "TAD_BEDROOM_2AM_GRANDPA_LIGHTS" ? "worried" : "neutral",
            mouth: "smile",
            sweatDrop: mode === "TAD_BEDROOM_2AM_AWKWARD_SMILE",
            blush: isBucketFull,
          }}
        />

        {gpBubble && (
          <ComicSpeechBubble
            x={grandpaX + 110}
            y={groundY - 500}
            mouthX={grandpaX + 32}
            mouthY={groundY - 315}
            headTopY={groundY - 405}
            text={gpBubble}
            localFrame={localFrame}
            appearFrame={defaultBubbleAppear}
          />
        )}
      </g>
    );
  }

  // -------------------------------------------------------------------------
  // HỒI 4 (Beats 50–64): THẢ ĐÀN ẾCH VỀ AO SEN & ĐÊM NGỦ NGON LÀNH
  // -------------------------------------------------------------------------

  if (mode === "TAD_BEDROOM_DAWN_WINDOW" || mode === "TAD_BEDROOM_CLEAN_TANK" || mode === "TAD_BEDROOM_OPEN_NOTEBOOK") {
    const isEmpty = mode !== "TAD_BEDROOM_DAWN_WINDOW";
    return (
      <g id={`tad-${mode}`}>
        <BedroomIndoorBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <BedroomGlassTank x={580} y={465} w={345} h={205} frame={frame} emptyClean={isEmpty} tadpoleCount={0} />
        {mode === "TAD_BEDROOM_DAWN_WINDOW" && (
          <g>
            <BlueWaterBucket x={495} y={groundY - 22} scale={1.2} hasWater={true} />
            <CuteGreenFrog x={495} y={groundY - 78 - Math.abs(Math.sin(frame * 0.14)) * 22} scale={0.68} pose="jump" frame={frame} />
          </g>
        )}
        {mode === "TAD_BEDROOM_OPEN_NOTEBOOK" && (
          <g transform="translate(500, 620) rotate(-6)">
            <rect x={-32} y={-36} width={64} height={72} rx={6} fill="#FEF9C3" stroke="#141414" strokeWidth={3.2} />
            <circle cx={-6} cy={-6} r={8} fill="#1E293B" />
            <path d="M -14,-6 Q -24,0 -26,-8" fill="none" stroke="#141414" strokeWidth={2.5} />
            <circle cx={12} cy={12} r={8} fill="#22C55E" stroke="#141414" strokeWidth={2} />
          </g>
        )}
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 410,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: 6,
            walkWeight: 0,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
            blush: true,
          }}
        />
      </g>
    );
  }

  if (mode === "TAD_YARD_MORNING_WALK" || mode === "TAD_YARD_BOY_SMILE_CLOSING") {
    const isWalk = mode === "TAD_YARD_MORNING_WALK";
    const boyX = isWalk ? lerpNum(320, 960, smoothstep(0.04, 0.92, u)) : 860;
    const gpX = isWalk ? boyX - 245 : 1340;
    const walkW = isWalk ? 0.9 : 0;
    const walkC = (Math.abs(boyX - 320) / STRIDE_PX) % 1;

    return (
      <g id={`tad-${mode}`}>
        <CountrysideYardBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        {isWalk && <BlueWaterBucket x={boyX + 68} y={groundY - 115} scale={1.0} hasWater={true} />}
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: gpX,
            y: isWalk ? groundY : groundY - 26,
            scale: 0.96,
            facing: isWalk ? "right" : "left",
            pose: isWalk ? "walking" : "standing",
            torsoTiltDeg: isWalk ? 6 : 3,
            walkCycleProgress: walkC,
            walkWeight: walkW,
            waveRightArm: !isWalk,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
          }}
        />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: isWalk ? "walking" : "standing",
            torsoTiltDeg: isWalk ? 7 : 0,
            walkCycleProgress: walkC,
            walkWeight: walkW,
            waveRightArm: !isWalk,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
            blush: true,
            holdingTarget: isWalk ? { rightGrip: { x: boyX + 60, y: groundY - 168 } } : undefined,
          }}
        />
      </g>
    );
  }

  // STILL #4 TARGET: Hai ông cháu nghiêng xô thả đàn ếch nhảy xuống ao sen bơi tản ra!
  if (
    mode === "TAD_POND_ARRIVE_MORNING" ||
    mode === "TAD_POND_RELEASE_FROGS" ||
    mode === "TAD_POND_SWIM_SCATTER" ||
    mode === "TAD_POND_WAVE_GOODBYE" ||
    mode === "TAD_POND_GRANDPA_CHAT" ||
    mode === "TAD_POND_SUNSET_CATCH_BUGS" ||
    mode === "TAD_POND_MOONLIGHT_FROGS" ||
    mode === "TAD_POND_WARM_OUTRO"
  ) {
    const isSunset = mode === "TAD_POND_SUNSET_CATCH_BUGS" || mode === "TAD_POND_WARM_OUTRO";
    const isNight = mode === "TAD_POND_MOONLIGHT_FROGS";
    const isRelease = mode === "TAD_POND_RELEASE_FROGS";
    const isWave = mode === "TAD_POND_WAVE_GOODBYE" || mode === "TAD_POND_WARM_OUTRO";
    const isCatchBugs = mode === "TAD_POND_SUNSET_CATCH_BUGS" || isNight;
    const timeOfDay = isNight ? "NIGHT" : isSunset ? "SUNSET" : "DAY";

    const boyX = mode === "TAD_POND_ARRIVE_MORNING" ? lerpNum(320, 740, smoothstep(0.05, 0.78, u)) : 755;
    const gpX = mode === "TAD_POND_ARRIVE_MORNING" ? boyX - 230 : 515;
    const walkW = mode === "TAD_POND_ARRIVE_MORNING" && u < 0.8 ? Math.min(smoothstep(0.05, 0.14, u), 1 - smoothstep(0.7, 0.8, u)) : 0;
    const walkC = (Math.abs(boyX - 320) / STRIDE_PX) % 1;
    const releaseTilt = isRelease ? lerpNum(28, 76, smoothstep(0.1, 0.55, u)) : 0;
    const isTalkRelease = isRelease && isComicBubbleActive(localFrame, defaultBubbleAppear);

    return (
      <g id={`tad-${mode}`}>
        <LotusPondBackdrop timeOfDay={timeOfDay} frame={frame} groundY={groundY} />

        {/* Cảnh nghiêng xô thả đàn ếch nhảy vòng cung ùm xuống ao sen (STILL #4!) */}
        {isRelease && (
          <g id="pond-release-frogs-arc">
            <BlueWaterBucket x={855} y={groundY - 120} tiltDeg={releaseTilt} scale={1.18} hasWater={true} />
            {/* Dòng nước & 8 chú ếch xanh nhảy vòng cung parabol xuống mặt nước + lá sen */}
            <path d="M 885,710 Q 950,735 980,790" fill="none" stroke="#BAE6FD" strokeWidth={12} strokeLinecap="round" opacity={0.72} />
            {[
              { tx: 1120, ty: 752, h: 175, off: 0.0 },
              { tx: 1275, ty: 842, h: 145, off: 0.16 },
              { tx: 1380, ty: 706, h: 215, off: 0.32 },
              { tx: 1055, ty: 810, h: 120, off: 0.48 },
              { tx: 1525, ty: 770, h: 195, off: 0.64 },
              { tx: 1190, ty: 790, h: 155, off: 0.80 },
            ].map((arc, ai) => {
              const p = (u * 1.35 + arc.off) % 1;
              const fx = lerpNum(885, arc.tx, p);
              const fy = lerpNum(715, arc.ty, p) - Math.sin(p * Math.PI) * arc.h;
              return (
                <g key={`rel_f_${ai}`}>
                  <CuteGreenFrog x={fx} y={fy} scale={0.86} facing={1} pose={p > 0.88 ? "sit" : "jump"} frame={frame} phase={ai} />
                  {p > 0.82 && (
                    <ellipse cx={arc.tx} cy={arc.ty + 14} rx={16 + (p - 0.82) * 180} ry={5 + (p - 0.82) * 45} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={1 - (p - 0.82) / 0.18} />
                  )}
                </g>
              );
            })}
            {/* Vài chú ếch đã đáp xuống lá sen ngồi vẫy vui vẻ */}
            <CuteGreenFrog x={1120} y={748} scale={0.88} facing={-1} pose="sit" frame={frame} phase={0.5} />
            <CuteGreenFrog x={1635} y={768} scale={0.88} facing={-1} pose="sit" frame={frame} phase={1.7} />
          </g>
        )}

        {/* Các cảnh đàn ếch bơi tản ra, ngồi lá sen kêu Ộp! & thè lưỡi bắt muỗi */}
        {!isRelease && mode !== "TAD_POND_ARRIVE_MORNING" && (
          <g id="pond-happy-frogs">
            <CuteGreenFrog
              x={1115}
              y={748}
              scale={0.9}
              facing={-1}
              pose="sit"
              croaking={mode === "TAD_POND_WAVE_GOODBYE" || isNight}
              tongueTarget={isCatchBugs && Math.sin(frame * 0.14) > 0.4 ? { dx: 62, dy: -46 } : null}
              frame={frame}
              phase={0.3}
            />
            <CuteGreenFrog
              x={1360}
              y={704}
              scale={0.88}
              facing={1}
              pose="sit"
              croaking={isNight}
              tongueTarget={isCatchBugs && Math.cos(frame * 0.12) > 0.45 ? { dx: 58, dy: -42 } : null}
              frame={frame}
              phase={1.6}
            />
            <CuteGreenFrog x={1635} y={768} scale={0.92} facing={-1} pose="sit" croaking={isNight} frame={frame} phase={2.8} />
            <CuteGreenFrog x={1270} y={840} scale={0.86} facing={1} pose="sit" frame={frame} phase={3.4} />
            {/* Muỗi nhỏ bay vo ve bị bắt trên ao */}
            {isCatchBugs &&
              [
                [1060, 695],
                [1425, 658],
                [1540, 710],
              ].map(([mx, my], mi) => (
                <g key={`bug_${mi}`} transform={`translate(${(mx + Math.sin(frame * 0.18 + mi) * 18).toFixed(1)}, ${(my + Math.cos(frame * 0.22 + mi) * 10).toFixed(1)})`}>
                  <ellipse cx={0} cy={0} rx={4.5} ry={2.5} fill="#1E293B" />
                  <ellipse cx={-2} cy={-4} rx={5} ry={2} fill="#E0F2FE" opacity={0.85} />
                  <ellipse cx={2} cy={-4} rx={5} ry={2} fill="#E0F2FE" opacity={0.85} />
                </g>
              ))}
            {(mode === "TAD_POND_WAVE_GOODBYE" || isNight) && (
              <MiniCroakTag x={1115} y={678} text="Ộp!" frame={frame} phase={0.4} scale={1.0} />
            )}
            {isNight && <MiniCroakTag x={1635} y={696} text="Oạp!" frame={frame} phase={2.1} scale={0.96} />}
          </g>
        )}

        {/* Hai ông cháu đứng trên bờ ao sen (ẩn ở cảnh thuần phong cảnh trăng sao TAD_POND_MOONLIGHT_FROGS) */}
        {!isNight && (
          <>
            <StickmanRig
              characterPreset="GRANDPA"
              frame={frame}
              state={{
                x: gpX,
                y: groundY - 8,
                scale: 0.96,
                facing: "right",
                pose: walkW > 0.05 ? "walking" : "standing",
                torsoTiltDeg: isRelease ? 12 : 4,
                walkCycleProgress: walkC,
                walkWeight: walkW,
                waveRightArm: isWave,
                wavePhaseOffset: 1.2,
                nodAmplitudeDeg: 3.5,
                nodFreq: 0.12,
                eyes: "happy",
                eyebrows: "neutral",
                mouth: "smile",
              }}
            />
            <StickmanRig
              characterPreset="BOY"
              frame={frame}
              state={{
                x: boyX,
                y: groundY,
                scale: 0.96,
                facing: "right",
                pose: walkW > 0.05 ? "walking" : "standing",
                torsoTiltDeg: isRelease ? 16 : 4,
                walkCycleProgress: walkC,
                walkWeight: walkW,
                waveRightArm: isWave,
                isSpeaking: isTalkRelease,
                eyes: "happy",
                eyebrows: "neutral",
                mouth: "smile",
                blush: true,
                holdingTarget: isRelease
                  ? { rightGrip: { x: 828, y: groundY - 145 } }
                  : mode === "TAD_POND_ARRIVE_MORNING"
                  ? { rightGrip: { x: boyX + 60, y: groundY - 168 } }
                  : undefined,
              }}
            />
            {mode === "TAD_POND_ARRIVE_MORNING" && <BlueWaterBucket x={boyX + 68} y={groundY - 116} scale={1.0} hasWater={true} />}
            {isRelease && (
              <ComicSpeechBubble
                x={boyX - 65}
                y={groundY - 495}
                mouthX={boyX + 20}
                mouthY={groundY - 315}
                headTopY={groundY - 405}
                text="Về nhà mới vui nha!"
                localFrame={localFrame}
                appearFrame={defaultBubbleAppear}
              />
            )}
          </>
        )}
      </g>
    );
  }

  // Đêm cuối cùng cậu bé ngủ ngon lành + cửa sổ ánh trăng có ếch ngồi lá sen bắt muỗi!
  if (mode === "TAD_BEDROOM_PEACEFUL_SLEEP") {
    return (
      <g id="tad-61-peaceful-sleep">
        <BedroomIndoorBackdrop timeOfDay="NIGHT" frame={frame} groundY={groundY} />
        {/* Mở rộng cảnh ngoài cửa sổ: mặt ao ánh trăng + lá sen + 2 chú ếch bắt muỗi */}
        <g transform="translate(260, 175)">
          <rect x={4} y={175} width={352} height={81} fill="#1E3A5F" />
          <ellipse cx={115} cy={222} rx={42} ry={12} fill="#16A34A" stroke="#141414" strokeWidth={2} />
          <ellipse cx={255} cy={215} rx={44} ry={12} fill="#15803D" stroke="#141414" strokeWidth={2} />
          <CuteGreenFrog
            x={115}
            y={208}
            scale={0.52}
            facing={1}
            pose="sit"
            tongueTarget={Math.sin(frame * 0.14) > 0.35 ? { dx: 48, dy: -32 } : null}
            frame={frame}
          />
          <CuteGreenFrog x={255} y={201} scale={0.52} facing={-1} pose="sit" frame={frame} phase={1.8} />
          <rect x={0} y={0} width={360} height={260} rx={12} fill="none" stroke="#92400E" strokeWidth={10} />
          <rect x={0} y={0} width={360} height={260} rx={12} fill="none" stroke="#141414" strokeWidth={3} />
        </g>
        {/* Bể kính sạch bóng trống trơn đặt gọn cạnh giường */}
        <BedroomGlassTank x={580} y={465} w={345} h={205} frame={frame} emptyClean={true} tadpoleCount={0} />
        {/* Cậu bé ngủ ngon lành mỉm cười */}
        <BoyInBedroomBed mode="sleeping" frame={frame} />
      </g>
    );
  }

  // -------------------------------------------------------------------------
  // 9 CẢNH GIẢI THÍCH KHOA HỌC TỐI GIẢN (EXPLAINER_POLKA_DOT — 60FPS, KHÔNG BỊA %)
  // -------------------------------------------------------------------------

  const enterScale = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;

  if (mode === "TAD_EXPLAIN_4STAGE_CYCLE") {
    const stages: { label: string; sub: string; kind: "eggs" | TadpoleGrowthStage }[] = [
      { label: "1. TRỨNG", sub: "Bọc thạch trong", kind: "eggs" },
      { label: "2. NÒNG NỌC", sub: "Thở bằng mang", kind: "tadpole" },
      { label: "3. CHÂN SAU", sub: "Bơi khỏe hơn", kind: "backLegs" },
      { label: "4. ẾCH CON", sub: "Thu đuôi, thở phổi", kind: "shortTail" },
    ];
    return (
      <g id="tad-explain-4stage">
        <ExplainerPolkaDotBackdrop palette="mint" />
        <g transform={`translate(960, 495) scale(${enterScale.toFixed(3)})`}>
          {stages.map((st, i) => {
            const dx = -585 + i * 390;
            const pop = localFrame >= i * 14 ? Math.min(1, easeOutBack((localFrame - i * 14) / 14)) : 0.01;
            return (
              <g key={`st4_${i}`}>
                <g transform={`translate(${dx}, 0) scale(${pop.toFixed(3)})`}>
                  <rect x={-155} y={-205} width={310} height={400} rx={28} fill="#141414" transform="translate(7, 9)" />
                  <rect x={-155} y={-205} width={310} height={400} rx={28} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />
                  <circle cx={0} cy={-48} r={88} fill="#E0F2FE" stroke="#141414" strokeWidth={3.5} />
                  {st.kind === "eggs" ? (
                    <g>
                      {[[-26, -16], [10, -24], [32, 6], [-18, 22], [18, 28], [-4, 0]].map(([ex, ey], ei) => (
                        <g key={`eg_${ei}`} transform={`translate(${ex}, ${ey - 48 + Math.sin(frame * 0.09 + ei) * 3})`}>
                          <circle cx={0} cy={0} r={16} fill="#FFFFFF" fillOpacity={0.7} stroke="#38BDF8" strokeWidth={2} />
                          <circle cx={0} cy={0} r={6.5} fill="#1E293B" />
                        </g>
                      ))}
                    </g>
                  ) : st.kind === "shortTail" ? (
                    <CuteGreenFrog x={0} y={-44} scale={1.65} facing={1} pose="sit" frame={frame} phase={i} />
                  ) : (
                    <SwimmingTadpole x={10} y={-48} scale={2.1} angleDeg={Math.sin(frame * 0.07 + i) * 8} frame={frame} phase={i} stage={st.kind} />
                  )}
                  <text x={0} y={96} textAnchor="middle" fill="#141414" fontSize={26} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                    {st.label}
                  </text>
                  <text x={0} y={136} textAnchor="middle" fill="#475569" fontSize={21} fontWeight={700} fontFamily="'Be Vietnam Pro', sans-serif">
                    {st.sub}
                  </text>
                </g>
                {i < 3 && (
                  <path
                    d={`M ${dx + 168},-10 L ${dx + 212},-10 M ${dx + 198},-24 L ${dx + 214},-10 L ${dx + 198},4`}
                    fill="none"
                    stroke="#141414"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            );
          })}
        </g>
      </g>
    );
  }

  if (mode === "TAD_EXPLAIN_TAIL_REABSORB") {
    const shrinkT = smoothstep(0.12, 0.88, u);
    const tailLenRatio = lerpNum(1.1, 0.15, shrinkT);
    return (
      <g id="tad-explain-tail-reabsorb">
        <ExplainerPolkaDotBackdrop palette="mint" />
        <g transform={`translate(960, 495) scale(${enterScale.toFixed(3)})`}>
          <rect x={-520} y={-235} width={1040} height={460} rx={34} fill="#141414" transform="translate(8, 10)" />
          <rect x={-520} y={-235} width={1040} height={460} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
          <text x={0} y={-160} textAnchor="middle" fill="#15803D" fontSize={32} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            CƠ CHẾ TỰ HẤP THỤ ĐUÔI THÀNH NĂNG LƯỢNG
          </text>
          {/* Hình ảnh nòng nọc biến đổi thu ngắn đuôi trực tiếp + các hạt năng lượng vàng chảy về thân */}
          <g transform="translate(55, -10)">
            <SwimmingTadpole x={0} y={0} scale={4.2} angleDeg={0} frame={frame} stage="shortTail" tailRatio={tailLenRatio} />
            {[0, 1, 2, 3, 4].map((oi) => {
              const p = (frame * 0.025 + oi * 0.2) % 1;
              const ox = lerpNum(-185 * tailLenRatio - 40, 12, p);
              const oy = Math.sin(p * Math.PI * 2 + oi) * 18;
              return (
                <circle
                  key={`orb_${oi}`}
                  cx={ox}
                  cy={oy}
                  r={10}
                  fill="#FACC15"
                  stroke="#141414"
                  strokeWidth={2.5}
                  opacity={Math.sin(p * Math.PI)}
                />
              );
            })}
          </g>
          <rect x={-330} y={120} width={660} height={54} rx={18} fill="#FEF9C3" stroke="#141414" strokeWidth={3} />
          <text x={0} y={156} textAnchor="middle" fill="#141414" fontSize={24} fontWeight={800} fontFamily="'Be Vietnam Pro', sans-serif">
            Đuôi ngắn dần → Năng lượng chuyển về nuôi cơ thể lớn lên
          </text>
        </g>
      </g>
    );
  }

  if (mode === "TAD_EXPLAIN_VOCAL_SAC") {
    const wavePulse = (frame * 0.03) % 1;
    return (
      <g id="tad-explain-vocal-sac">
        <ExplainerPolkaDotBackdrop palette="lavender" />
        <g transform={`translate(960, 495) scale(${enterScale.toFixed(3)})`}>
          <rect x={-520} y={-235} width={1040} height={460} rx={34} fill="#141414" transform="translate(8, 10)" />
          <rect x={-520} y={-235} width={1040} height={460} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
          <text x={0} y={-160} textAnchor="middle" fill="#6D28D9" fontSize={32} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            TÚI THANH QUẢN PHỒNG XẸP KHUẾCH ĐẠI TIẾNG KÊU
          </text>
          {/* Chú ếch xanh phóng lớn đang phồng túi thanh quản vàng rực */}
          <CuteGreenFrog x={-130} y={10} scale={4.2} facing={1} pose="sit" croaking={true} frame={frame} />
          {/* Các vòng sóng âm thanh lan tỏa mạnh sang phải */}
          {[0, 1, 2].map((ri) => {
            const p = (wavePulse + ri * 0.33) % 1;
            const r = 45 + p * 225;
            return (
              <path
                key={`sw_${ri}`}
                d={`M ${(60 + r * 0.5).toFixed(1)},${(-r * 0.65).toFixed(1)} A ${r},${r} 0 0,1 ${(60 + r * 0.5).toFixed(1)},${(r * 0.65).toFixed(1)}`}
                fill="none"
                stroke="#7C3AED"
                strokeWidth={7}
                strokeLinecap="round"
                opacity={1 - p}
              />
            );
          })}
          <MiniCroakTag x={275} y={-45} text="ỘP! OẠP!" frame={frame} scale={1.45} />
        </g>
      </g>
    );
  }

  if (mode === "TAD_EXPLAIN_MOSQUITO_HERO") {
    const tongueOut = Math.sin(frame * 0.16) > 0.1;
    const bugX = 245 + Math.sin(frame * 0.14) * 20;
    const bugY = -72 + Math.cos(frame * 0.18) * 14;
    return (
      <g id="tad-explain-mosquito-hero">
        <ExplainerPolkaDotBackdrop palette="mint" />
        <g transform={`translate(960, 495) scale(${enterScale.toFixed(3)})`}>
          <rect x={-520} y={-235} width={1040} height={460} rx={34} fill="#141414" transform="translate(8, 10)" />
          <rect x={-520} y={-235} width={1040} height={460} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
          <text x={0} y={-160} textAnchor="middle" fill="#15803D" fontSize={32} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            CHIẾN BINH BẮT MUỖI TỰ NHIÊN QUANH AO
          </text>
          {/* Lá sen xanh lớn nâng đỡ chú ếch */}
          <ellipse cx={-165} cy={78} rx={155} ry={34} fill="#4ADE80" stroke="#141414" strokeWidth={4} />
          <CuteGreenFrog
            x={-165}
            y={24}
            scale={3.4}
            facing={1}
            pose="sit"
            tongueTarget={tongueOut ? { dx: (bugX + 165) / 3.4, dy: (bugY - 24) / 3.4 } : null}
            frame={frame}
          />
          {/* Chú muỗi bay vo ve bên phải */}
          <g transform={`translate(${bugX.toFixed(1)}, ${bugY.toFixed(1)}) scale(2.2)`}>
            <ellipse cx={0} cy={0} rx={9} ry={4.5} fill="#1E293B" stroke="#141414" strokeWidth={1.5} />
            <ellipse cx={-3} cy={-8} rx={9} ry={3.5} fill="#E0F2FE" stroke="#141414" strokeWidth={1.2} />
            <ellipse cx={4} cy={-8} rx={9} ry={3.5} fill="#E0F2FE" stroke="#141414" strokeWidth={1.2} />
            <line x1={-9} y1={1} x2={-17} y2={4} stroke="#141414" strokeWidth={1.5} />
          </g>
        </g>
      </g>
    );
  }

  // Các cảnh Explainer tối giản còn lại (Gills/Water, HindLegsSwim, LungsDevelop, StomachShift, FrogSpring)
  const palette = mode === "TAD_EXPLAIN_LUNGS_DEVELOP" ? "lavender" : "cream";
  const headerTitle =
    mode === "TAD_EXPLAIN_GILLS_WATER"
      ? "MANG NÒNG NỌC & NƯỚC AO SẠCH"
      : mode === "TAD_EXPLAIN_HIND_LEGS_SWIM"
      ? "CHÂN SAU MỌC TRƯỚC — ĐẠP NƯỚC MẠNH HƠN"
      : mode === "TAD_EXPLAIN_LUNGS_DEVELOP"
      ? "PHỔI NON PHÁT TRIỂN — TẬP ĐỚP KHÔNG KHÍ"
      : mode === "TAD_EXPLAIN_STOMACH_SHIFT"
      ? "CHUYỂN TỪ ĂN RÊU SANG SĂN CÔN TRÙNG"
      : "CẶP CHÂN SAU BẬT XA NHƯ LÒ XO";

  return (
    <g id={`tad-${mode}`}>
      <ExplainerPolkaDotBackdrop palette={palette} />
      <g transform={`translate(960, 495) scale(${enterScale.toFixed(3)})`}>
        <rect x={-520} y={-235} width={1040} height={460} rx={34} fill="#141414" transform="translate(8, 10)" />
        <rect x={-520} y={-235} width={1040} height={460} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
        <text x={0} y={-160} textAnchor="middle" fill="#141414" fontSize={30} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
          {headerTitle}
        </text>
        {mode === "TAD_EXPLAIN_FROG_SPRING" ? (
          <g>
            {/* Vòng cung bật nhảy xa minh họa lò xo chân ếch */}
            <path d="M -320,75 Q 0,-185 310,75" fill="none" stroke="#22C55E" strokeWidth={7} strokeDasharray="14 12" strokeLinecap="round" />
            <CuteGreenFrog
              x={lerpNum(-300, 290, (frame * 0.016) % 1)}
              y={70 - Math.sin(((frame * 0.016) % 1) * Math.PI) * 195}
              scale={2.4}
              facing={1}
              pose="jump"
              frame={frame}
            />
            <line x1={-370} y1={105} x2={370} y2={105} stroke="#94A3B8" strokeWidth={5} strokeLinecap="round" />
          </g>
        ) : (
          <g transform="translate(0, 10)">
            <circle cx={0} cy={0} r={138} fill="#E0F2FE" stroke="#141414" strokeWidth={4} />
            <SwimmingTadpole
              x={15}
              y={10}
              scale={3.6}
              angleDeg={mode === "TAD_EXPLAIN_LUNGS_DEVELOP" ? -28 : Math.sin(frame * 0.08) * 8}
              frame={frame}
              stage={
                mode === "TAD_EXPLAIN_GILLS_WATER"
                  ? "tadpole"
                  : mode === "TAD_EXPLAIN_HIND_LEGS_SWIM" || mode === "TAD_EXPLAIN_LUNGS_DEVELOP"
                  ? "backLegs"
                  : "fourLegs"
              }
            />
            {/* Bong bóng oxy O2 bay lên minh họa hô hấp */}
            {(mode === "TAD_EXPLAIN_GILLS_WATER" || mode === "TAD_EXPLAIN_LUNGS_DEVELOP") &&
              [0, 1, 2, 3].map((oi) => {
                const p = (frame * 0.02 + oi * 0.25) % 1;
                return (
                  <g key={`o2_${oi}`} transform={`translate(${(58 + oi * 22).toFixed(1)}, ${(35 - p * 145).toFixed(1)})`}>
                    <circle cx={0} cy={0} r={14} fill="#FFFFFF" stroke="#0284C7" strokeWidth={2.5} opacity={Math.sin(p * Math.PI)} />
                    <text x={0} y={5} textAnchor="middle" fill="#0369A1" fontSize={12} fontWeight={900} opacity={Math.sin(p * Math.PI)}>
                      O₂
                    </text>
                  </g>
                );
              })}
            <MagnifyingGlassOverlay x={0} y={0} radius={138} handleAngleDeg={42} localFrame={localFrame} />
          </g>
        )}
      </g>
    </g>
  );
};
