/**
 * FLASHLIGHT NIGHT STAGE V11.0 (NIGHT_GARDEN_FLASHLIGHT)
 * Bối cảnh khu vườn ban đêm + Tổ ong bắp cày treo cành cây (HornetNest) +
 * Nhân vật người áo cam (StickmanRig archetype="explorerOrange") cầm đèn pin +
 * Chùm sáng đèn pin hình nón vàng ấm bán trong suốt (Flashlight Beam Cone) + Đàn ong bắp cày (HornetRig).
 * Tuân thủ 100% UNIVERSAL_2D_STORYTIME_ENGINE_STANDARD_V10.md (1920x1080 @ 60fps, groundY=840).
 */

import React from "react";
import { StickmanRig } from "../character/StickmanRig";
import {
  HornetRig,
  HornetMoodState,
  computeHornetRigSockets,
} from "../character/HornetRig";
import {
  RigSockets,
  smoothstep,
  lerpNum,
  computeComicShiverMotion,
} from "../../../lib/v7/universalAnimationStandard";

export type HornetNightSceneMode =
  | "NIGHT_CALM_DISTANT"
  | "NIGHT_CALM"
  | "APPROACH_RAISE_FLASHLIGHT"
  | "FLASHLIGHT_ALERT"
  | "PHEROMONE_ALARM_WAVES"
  | "NEST_BUZZING_RED_EYES"
  | "SWARM_BEAM_ATTACK"
  | "STING_RETREAT_BACKSTEP"
  | "FLASHLIGHT_SWITCH_OFF"
  | "STEALTH_EXIT_LEFT";

export interface FlashlightNightStageProps {
  mode: HornetNightSceneMode;
  frame: number;
  localFrame: number;
  durationFrames: number;
  u: number;
  groundY?: number;
}

const NEST_X = 1365;
const NEST_Y = 355;
const NEST_ENTRANCE_X = 1308;
const NEST_ENTRANCE_Y = 420;

/**
 * Tính tọa độ con ong tiêu điểm (primary hornet) theo tiến trình cảnh u ∈ [0, 1]
 * để Callout Arrow và hiệu ứng SFX bám chính xác từng pixel trong mọi frame.
 */
export function computeHornetNightFocusActor(params: {
  mode: HornetNightSceneMode;
  u: number;
  localFrame: number;
}): {
  x: number;
  y: number;
  facing: "left" | "right";
  scale: number;
  rotationDeg: number;
  moodState: HornetMoodState;
} {
  const { mode, u, localFrame } = params;

  if (
    mode === "NIGHT_CALM" ||
    mode === "NIGHT_CALM_DISTANT" ||
    mode === "APPROACH_RAISE_FLASHLIGHT" ||
    mode === "STEALTH_EXIT_LEFT"
  ) {
    // V11.2/V12.0: Thu nhỏ tỉ lệ ong chuẩn thực tế (~0.42x -> thân dài ~68px, gọn sát miệng lỗ tổ)
    return {
      x: 1278,
      y: 422 + Math.sin(localFrame * 0.06) * 1.8,
      facing: "left",
      scale: 0.44,
      rotationDeg: -5,
      moodState: "SLEEPING_CALM",
    };
  }

  if (mode === "PHEROMONE_ALARM_WAVES") {
    return {
      x: 1264,
      y: 412 + Math.sin(localFrame * 0.75) * 2.8,
      facing: "left",
      scale: 0.45,
      rotationDeg: -10,
      moodState: "ALERT_BLINDED",
    };
  }

  if (mode === "NEST_BUZZING_RED_EYES") {
    return {
      x: 1254,
      y: 406 + Math.sin(localFrame * 0.9) * 2.5,
      facing: "left",
      scale: 0.45,
      rotationDeg: -14,
      moodState: "ALERT_BLINDED",
    };
  }

  if (mode === "FLASHLIGHT_ALERT") {
    const beamOn = u >= 0.14;
    const startleLift = beamOn ? smoothstep(0.14, 0.28, u) : 0;
    return {
      x: lerpNum(1278, 1244, startleLift),
      y: lerpNum(422, 398, startleLift) + Math.sin(localFrame * 0.9) * (beamOn ? 2.2 : 0.9),
      facing: "left",
      scale: lerpNum(0.44, 0.46, startleLift),
      rotationDeg: lerpNum(-5, -14, startleLift),
      moodState: beamOn ? "ALERT_BLINDED" : "SLEEPING_CALM",
    };
  }

  if (mode === "FLASHLIGHT_SWITCH_OFF") {
    const offT = u >= 0.35 ? smoothstep(0.35, 0.55, u) : 0;
    return {
      x: lerpNum(845, 920, offT) + Math.sin(localFrame * 0.18) * 18 * offT,
      y: lerpNum(510, 445, offT) + Math.cos(localFrame * 0.22) * 14 * offT,
      facing: offT > 0.5 && Math.floor(localFrame / 36) % 2 === 1 ? "right" : "left",
      scale: 0.43,
      rotationDeg: lerpNum(-15, 4, offT),
      moodState: u >= 0.35 ? "ALERT_BLINDED" : "AGGRESSIVE_SWARM",
    };
  }

  if (mode === "STING_RETREAT_BACKSTEP") {
    const chaseT = smoothstep(0.0, 0.94, u);
    return {
      x: lerpNum(840, 505, chaseT),
      y: lerpNum(520, 610, chaseT) + Math.sin(localFrame * 0.55) * 5,
      facing: "left",
      scale: 0.44,
      rotationDeg: -16,
      moodState: "AGGRESSIVE_SWARM",
    };
  }

  // SWARM_BEAM_ATTACK V11.2/V12.0: Ong đầu đàn tỉ lệ thực tế (~0.44x, ~72px) lao thẳng dọc theo chùm sáng đèn pin
  const diveT = smoothstep(0.0, 0.92, u);
  const leadProgress = lerpNum(0.20, 0.92, diveT);
  const startX = 1248;
  const startY = 414;
  const targetX = 672;
  const targetY = 584;
  return {
    x: lerpNum(startX, targetX, leadProgress),
    y: lerpNum(startY, targetY, leadProgress) + Math.sin(localFrame * 0.45) * 4,
    facing: "left",
    scale: lerpNum(0.40, 0.45, leadProgress),
    rotationDeg: -17,
    moodState: "AGGRESSIVE_SWARM",
  };
}

/**
 * Xuất bảng 8 điểm neo RigSockets của Ong Bắp Cày tiêu điểm cho hệ thống Callout toàn cục V10.
 */
export function computeHornetNightPrimarySockets(params: {
  mode: HornetNightSceneMode;
  u: number;
  localFrame: number;
}): RigSockets {
  const actor = computeHornetNightFocusActor(params);
  return computeHornetRigSockets({
    x: actor.x,
    y: actor.y,
    facing: actor.facing,
    scale: actor.scale,
    rotationDeg: actor.rotationDeg,
    moodState: actor.moodState,
  });
}

/**
 * Tổ Ong Bắp Cày (HornetNest) hình bầu dục vân giấy nâu đặc trưng treo trên cành cây ban đêm
 */
const HornetNest: React.FC<{
  x: number;
  y: number;
  beamIntensity: number;
  localFrame: number;
  buzzIntensity?: number;
  redEyesIntensity?: number;
}> = ({ x, y, beamIntensity, localFrame, buzzIntensity = 0, redEyesIntensity = 0 }) => {
  const swayDeg = Math.sin(localFrame * 0.04) * 1.1;
  const buzzOffsetX = buzzIntensity > 0 ? Math.sin(localFrame * 0.9) * 2.6 * buzzIntensity : 0;
  const buzzOffsetY = buzzIntensity > 0 ? Math.cos(localFrame * 0.75) * 1.4 * buzzIntensity : 0;
  return (
    <g
      transform={`translate(${(x + buzzOffsetX).toFixed(1)}, ${(y + buzzOffsetY).toFixed(1)}) rotate(${swayDeg.toFixed(
        2
      )}, 0, -135)`}
    >
      <defs>
        <clipPath id="hornet-nest-clip">
          <path d="M 0,-138 C 78,-128 118,-52 108,35 C 98,108 46,142 0,142 C -48,142 -100,106 -110,32 C -118,-54 -76,-128 0,-138 Z" />
        </clipPath>
        <radialGradient id="nest-lit-glow" cx="35%" cy="62%" r="65%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity={(0.46 * beamIntensity).toFixed(2)} />
          <stop offset="65%" stopColor="#F59E0B" stopOpacity={(0.18 * beamIntensity).toFixed(2)} />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Vầng sáng bao quanh tổ khi bị đèn pin rọi trúng */}
      {beamIntensity > 0.02 && (
        <ellipse cx={-10} cy={12} rx={155} ry={170} fill="url(#nest-lit-glow)" />
      )}

      {/* Cuống bám cành cây */}
      <path d="M -22,-152 L 22,-152 L 16,-126 L -16,-126 Z" fill="#78350F" stroke="#141414" strokeWidth={4} />

      {/* Thân tổ ong bầu dục vân giấy nâu */}
      <path
        d="M 0,-138 C 78,-128 118,-52 108,35 C 98,108 46,142 0,142 C -48,142 -100,106 -110,32 C -118,-54 -76,-128 0,-138 Z"
        fill="#92400E"
      />
      <g clipPath="url(#hornet-nest-clip)">
        {/* Các dải vân giấy uốn lượn tự nhiên của tổ ong bắp cày */}
        <path d="M -130,-95 Q -35,-112 30,-88 T 130,-96 L 130,-52 Q 35,-68 -30,-48 T -130,-56 Z" fill="#B45309" />
        <path d="M -130,-42 Q -40,-24 35,-44 T 130,-32 L 130,8 Q 40,-10 -35,12 T -130,2 Z" fill="#78350F" />
        <path d="M -130,16 Q -30,36 45,14 T 130,28 L 130,72 Q 35,52 -35,74 T -130,62 Z" fill="#A16207" />
        <path d="M -130,78 Q -25,94 40,76 T 130,90 L 130,150 L -130,150 Z" fill="#713F12" />

        {/* Đường vân sọc mảnh tạo chiều sâu vỏ giấy */}
        {[-76, -24, 34, 88].map((wy, idx) => (
          <path
            key={`nest_wave_${idx}`}
            d={`M -115,${wy} Q -35,${wy + 16} 35,${wy - 10} T 115,${wy + 6}`}
            fill="none"
            stroke="#451A03"
            strokeWidth={3}
            opacity={0.55}
          />
        ))}

        {/* Bóng tối nửa phải tổ (chiều sâu 3D) */}
        <path
          d="M 25,-145 C 105,-120 125,0 92,145 L 135,145 L 135,-145 Z"
          fill="#0F172A"
          opacity={(0.48 - 0.24 * beamIntensity).toFixed(2)}
        />
        {/* Ánh vàng đèn pin hắt sáng mặt trái tổ */}
        {beamIntensity > 0.02 && (
          <ellipse
            cx={-48}
            cy={48}
            rx={88}
            ry={110}
            fill="#FEF08A"
            opacity={(0.28 * beamIntensity).toFixed(2)}
          />
        )}
      </g>

      {/* Viền đen đậm chuẩn 4.5px */}
      <path
        d="M 0,-138 C 78,-128 118,-52 108,35 C 98,108 46,142 0,142 C -48,142 -100,106 -110,32 C -118,-54 -76,-128 0,-138 Z"
        fill="none"
        stroke="#141414"
        strokeWidth={4.5}
      />

      {/* Cửa tổ ong tối sâu ở góc dưới-trái */}
      <ellipse
        cx={-54}
        cy={62}
        rx={26}
        ry={33}
        fill="#090D16"
        stroke="#451A03"
        strokeWidth={5}
      />
      <ellipse cx={-54} cy={62} rx={26} ry={33} fill="none" stroke="#141414" strokeWidth={3.5} />

      {/* V12.0 Beat 10: 6 cặp mắt đỏ giận dữ ló ra từ trong miệng tổ tối khi tiếng vo ve vang lên */}
      {redEyesIntensity > 0.02 && (
        <g id="nest-red-eyes-peering">
          {[
            { cx: -60, cy: 46, delay: 0.0 },
            { cx: -45, cy: 50, delay: 0.14 },
            { cx: -65, cy: 61, delay: 0.28 },
            { cx: -48, cy: 65, delay: 0.42 },
            { cx: -59, cy: 76, delay: 0.56 },
            { cx: -43, cy: 78, delay: 0.70 },
          ].map((pair, pIdx) => {
            const pairAlpha = Math.max(0, Math.min(1, (redEyesIntensity - pair.delay) / 0.28));
            if (pairAlpha <= 0.02) return null;
            const pulse = 0.8 + 0.2 * Math.sin(localFrame * 0.25 + pIdx * 1.3);
            return (
              <g key={`red_eye_${pIdx}`} opacity={(pairAlpha * pulse).toFixed(2)}>
                {/* Hào quang đỏ nhẹ quanh cặp mắt */}
                <ellipse cx={pair.cx} cy={pair.cy} rx={9} ry={5} fill="#EF4444" opacity={0.35} />
                {/* 2 mắt đỏ xếch sắc lẹm */}
                <polygon
                  points={`${pair.cx - 6},${pair.cy - 2} ${pair.cx - 1.5},${pair.cy + 0.5} ${pair.cx - 5.5},${pair.cy + 2}`}
                  fill="#FF2E2E"
                />
                <polygon
                  points={`${pair.cx + 6},${pair.cy - 2} ${pair.cx + 1.5},${pair.cy + 0.5} ${pair.cx + 5.5},${pair.cy + 2}`}
                  fill="#FF2E2E"
                />
                {/* Đốm sáng nhỏ bên trong mắt */}
                <circle cx={pair.cx - 3.6} cy={pair.cy} r={0.9} fill="#FEF08A" />
                <circle cx={pair.cx + 3.6} cy={pair.cy} r={0.9} fill="#FEF08A" />
              </g>
            );
          })}
        </g>
      )}

      {/* Sóng rung âm thanh vo ve quanh viền tổ ong khi đàn bên trong kích động */}
      {buzzIntensity > 0.1 && (() => {
        const buzzTick = Math.floor(localFrame / 6) % 2;
        const arcShift = buzzTick === 0 ? 0 : 4;
        return (
          <g
            id="nest-buzz-waves"
            fill="none"
            stroke="#FDBA74"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={(0.65 * buzzIntensity).toFixed(2)}
          >
            <path d={`M ${-124 - arcShift},-26 Q ${-138 - arcShift},12 ${-122 - arcShift},52`} />
            <path d={`M ${-138 - arcShift},-10 Q ${-150 - arcShift},14 ${-136 - arcShift},38`} opacity={0.7} />
            <path d={`M ${124 + arcShift},-24 Q ${138 + arcShift},12 ${120 + arcShift},50`} />
            <path d={`M ${138 + arcShift},-8 Q ${150 + arcShift},14 ${134 + arcShift},36`} opacity={0.7} />
          </g>
        );
      })()}
    </g>
  );
};

/**
 * Phông nền bầu trời đêm xanh thẫm (#1E293B -> #0F172A) + Trăng lưỡi liềm + Cây vườn + Mặt đất đêm
 */
export const NightGardenBackdrop: React.FC<{ frame?: number; groundY?: number }> = ({
  frame = 0,
  groundY = 840,
}) => {
  const stars = [
    { x: 140, y: 110, r: 2.6, ph: 0 },
    { x: 420, y: 140, r: 3.1, ph: 1.1 },
    { x: 660, y: 95, r: 2.3, ph: 2.3 },
    { x: 890, y: 155, r: 2.8, ph: 0.7 },
    { x: 1120, y: 118, r: 2.4, ph: 1.9 },
    { x: 1560, y: 90, r: 3.0, ph: 2.8 },
    { x: 1780, y: 135, r: 2.2, ph: 0.4 },
    { x: 320, y: 310, r: 2.0, ph: 1.5 },
    { x: 780, y: 265, r: 2.4, ph: 2.6 },
    { x: 1010, y: 295, r: 1.9, ph: 0.9 },
  ];

  return (
    <g id="night-garden-backdrop">
      <defs>
        <linearGradient id="night-sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="58%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#090E1A" />
        </linearGradient>
        <radialGradient id="moon-soft-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#93C5FD" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="night-grass-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14382A" />
          <stop offset="100%" stopColor="#091D15" />
        </linearGradient>
      </defs>

      {/* Bầu trời đêm xanh thẫm */}
      <rect x={0} y={0} width={1920} height={groundY} fill="url(#night-sky-grad)" />

      {/* Các ngôi sao lấp lánh nhẹ */}
      {stars.map((s, idx) => {
        const op = 0.42 + 0.42 * Math.sin(frame * 0.045 + s.ph);
        return <circle key={`star_${idx}`} cx={s.x} cy={s.y} r={s.r} fill="#FEF9C3" opacity={op} />;
      })}

      {/* Trăng lưỡi liềm vàng dịu ở góc trên trái */}
      <g transform="translate(225, 195)">
        <circle cx={0} cy={0} r={120} fill="url(#moon-soft-halo)" />
        <path
          d="M 12,-52 A 54,54 0 1,0 12,52 A 42,42 0 1,1 12,-52 Z"
          fill="#FEF08A"
          stroke="#141414"
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
      </g>

      {/* Bóng cây & bụi rậm đêm xa tạo chiều sâu */}
      <path
        d={`M 0,${groundY} L 0,680 Q 150,615 310,690 Q 490,605 690,685 Q 890,625 1090,700 Q 1320,615 1560,675 Q 1760,620 1920,670 L 1920,${groundY} Z`}
        fill="#111C2E"
        opacity={0.9}
      />
      <path
        d={`M 0,${groundY} L 0,745 Q 190,690 390,752 Q 610,705 840,762 Q 1120,700 1390,750 Q 1670,695 1920,748 L 1920,${groundY} Z`}
        fill="#0D221D"
        stroke="#071310"
        strokeWidth={3}
      />

      {/* Thân cây lớn bên mép phải đỡ cành treo tổ ong */}
      <path
        d={`M 1835,${groundY} Q 1825,520 1850,140 L 1925,140 L 1925,${groundY} Z`}
        fill="#1F1612"
        stroke="#141414"
        strokeWidth={4.5}
      />
      {/* Cành cây vươn từ phải sang trái đỡ tổ ong bắp cày */}
      <path
        d="M 1925,172 Q 1630,192 1350,218 Q 1230,228 1135,248 Q 1128,262 1145,268 Q 1245,252 1365,246 Q 1635,234 1925,222 Z"
        fill="#3B2314"
        stroke="#141414"
        strokeWidth={4.5}
        strokeLinejoin="round"
      />
      {/* Tán lá đêm trên cành cây */}
      <g fill="#14532D" stroke="#141414" strokeWidth={3.5}>
        <ellipse cx={1675} cy={175} rx={68} ry={34} transform="rotate(-12, 1675, 175)" />
        <ellipse cx={1555} cy={186} rx={58} ry={28} transform="rotate(8, 1555, 186)" />
        <ellipse cx={1210} cy={220} rx={52} ry={26} transform="rotate(-16, 1210, 220)" />
        <ellipse cx={1135} cy={258} rx={44} ry={22} transform="rotate(14, 1135, 258)" />
      </g>

      {/* Mặt đất cỏ đêm dưới y = 840 */}
      <rect x={0} y={groundY} width={1920} height={1080 - groundY} fill="url(#night-grass-grad)" />
      <line x1={0} y1={groundY} x2={1920} y2={groundY} stroke="#141414" strokeWidth={5} />
    </g>
  );
};

/**
 * Sân khấu tương tác Đèn Pin & Tổ Ong Bắp Cày Ban Đêm (dùng bên trong SVG sân khấu chính của V7MovieComposition)
 */
export const FlashlightNightSceneLayer: React.FC<FlashlightNightStageProps> = ({
  mode,
  frame,
  localFrame,
  u,
  groundY = 840,
}) => {
  const isDistant = mode === "NIGHT_CALM_DISTANT";
  const isCalm = mode === "NIGHT_CALM" || isDistant;
  const isApproach = mode === "APPROACH_RAISE_FLASHLIGHT";
  const isAlert = mode === "FLASHLIGHT_ALERT";
  const isPheromone = mode === "PHEROMONE_ALARM_WAVES";
  const isBuzzingEyes = mode === "NEST_BUZZING_RED_EYES";
  const isSwarm = mode === "SWARM_BEAM_ATTACK";
  const isRetreat = mode === "STING_RETREAT_BACKSTEP";
  const isSwitchOff = mode === "FLASHLIGHT_SWITCH_OFF";
  const isStealthExit = mode === "STEALTH_EXIT_LEFT";

  const switchOffTriggered = isSwitchOff && u >= 0.35;

  // Cường độ chùm sáng đèn pin theo từng phân cảnh của cả 4 Hồi V12.0
  const beamIntensity =
    isCalm || isApproach || isStealthExit
      ? 0
      : isAlert
      ? smoothstep(0.14, 0.24, u)
      : isPheromone
      ? 0.72
      : isBuzzingEyes
      ? 0.88
      : isSwitchOff
      ? switchOffTriggered
        ? 0
        : 1.0
      : 1.0;

  // Trạng thái run rẩy Comic Shiver Lines êm nhẹ (Math.sin(frame * 0.35) * 1.4px)
  const shouldShiver =
    isBuzzingEyes || isSwarm || isRetreat || (isSwitchOff && !switchOffTriggered);
  const shiverMotion = shouldShiver ? computeComicShiverMotion(frame) : null;

  // Vị trí, hướng mặt & Chu Kỳ Bước Chân Sinh Học (V12.1: Khóa quãng đường deltaX với strideLength -> 0% trượt sàn!)
  const STRIDE_LENGTH_PX = 95; // 1 bước chân = 95px (1 chu kỳ 2 bước đầy đủ = 190px, khớp tuyệt đối với biên độ chân trụ resolvePendulumLegs!)
  const approachWalkT = isApproach ? smoothstep(0.05, 0.62, u) : 0;
  const approachRaiseT = isApproach ? smoothstep(0.56, 0.88, u) : 0;
  const retreatWalkT = isRetreat ? smoothstep(0.05, 0.92, u) : 0;
  const stealthExitT = isStealthExit ? smoothstep(0.03, 0.96, u) : 0;

  const explorerX = isDistant
    ? 335
    : isCalm
    ? 435
    : isApproach
    ? lerpNum(325, 505, approachWalkT)
    : isAlert || isPheromone
    ? 510
    : isBuzzingEyes
    ? 490
    : isRetreat
    ? lerpNum(495, 285, retreatWalkT)
    : isSwitchOff
    ? 455
    : isStealthExit
    ? lerpNum(490, -110, stealthExitT)
    : 465;

  const explorerY = groundY;
  const explorerFacing: "left" | "right" = isStealthExit ? "left" : "right";

  // Động học bước chân sinh học V12.1 chuẩn theo quãng đường thực tế deltaX:
  // - Beat 4 (moveDir = +1): Bước tới phải (325 -> 505, deltaX = 180px)
  // - Beat 15 (moveDir = -1, facing = right): Bước giật lùi (495 -> 285, deltaX = -210px)
  // - Beat 19 (moveDir = -1, facing = left): Cúi thấp quay lưng bước nhanh sang trái (490 -> -110, deltaX = 600px)
  let walkCycleProgress = 0;
  let walkWeight = 0;
  let explorerPose: "standing" | "walking" | "crouching" = "standing";

  if (isApproach && u >= 0.05 && u <= 0.63) {
    const deltaX = Math.abs(explorerX - 325);
    // 1 chu kỳ bước chân đầy đủ (2 bước) = 165px -> nhịp bước gọn bám sàn tuyệt đối!
    walkCycleProgress = (deltaX / (STRIDE_LENGTH_PX * 1.75)) % 1;
    // Ramp mượt ở 12% đầu & 12% cuối, giữ full 1.0 suốt đoạn bước đi để gập gối hình số 4 rõ nét!
    const rampIn = smoothstep(0.05, 0.12, u);
    const rampOut = 1 - smoothstep(0.55, 0.63, u);
    walkWeight = Math.min(rampIn, rampOut);
    explorerPose = walkWeight > 0.05 ? "walking" : "standing";
  } else if (isRetreat && u >= 0.05 && u <= 0.93) {
    const deltaX = Math.abs(495 - explorerX);
    walkCycleProgress = (10 - deltaX / (STRIDE_LENGTH_PX * 1.75)) % 1;
    const rampIn = smoothstep(0.05, 0.12, u);
    const rampOut = 1 - smoothstep(0.85, 0.93, u);
    walkWeight = Math.min(rampIn, rampOut);
    explorerPose = walkWeight > 0.05 ? "walking" : "crouching";
  } else if (isStealthExit && u >= 0.03) {
    const deltaX = Math.abs(490 - explorerX);
    // Beat 19: walkPhase = (|deltaX| / strideLengthPx) * 2π (nhịp bước nhanh, chân trụ bám đất, chân lăng gập gối số 4)
    walkCycleProgress = (deltaX / (STRIDE_LENGTH_PX * 1.65)) % 1;
    walkWeight = smoothstep(0.03, 0.09, u);
    explorerPose = "walking";
  } else if (isSwarm || (isSwitchOff && !switchOffTriggered)) {
    explorerPose = "crouching";
  }

  // Nhún hông sinh học đồng bộ tay cầm đèn pin (-|sin(walkPhase)| * 5px)
  const walkHipBobY =
    walkWeight > 0.05 ? -Math.abs(Math.sin(walkCycleProgress * Math.PI * 2)) * 5 * walkWeight : 0;

  const crouchDepth =
    isSwarm
      ? 16
      : isSwitchOff && !switchOffTriggered
      ? 14
      : 0; // V12.1: Khi bước đi (Beat 4, 15, 19) giữ crouchDepth=0 để chân trụ duỗi thẳng 100% bám sàn & chân lăng gập gối hình số 4 (>) rõ nét, diễn tả dáng cúi người qua torsoTiltDeg=16°!

  // Lưu ý hệ tọa độ StickmanRig: khi facing="left" (scale(-1, 1)), torsoTiltDeg=+16 nghiêng thân gập về trước hướng sang TRÁI (-16° thế giới)
  const torsoTiltDeg = isCalm
    ? 2
    : isApproach
    ? lerpNum(6, 7, approachRaiseT)
    : isAlert || isPheromone
    ? 7
    : isBuzzingEyes
    ? -4
    : isSwarm || isRetreat
    ? -14
    : isSwitchOff
    ? switchOffTriggered
      ? 3
      : -12
    : isStealthExit
    ? 16 // Cúi gập người về trước hướng sang trái (-16° theo trục thế giới) đúng kịch bản "cúi thấp người, quay lưng bước nhanh"
    : 0;

  // Tọa độ tay cầm đèn pin (khóa cứng qua 2-bone IK vào rightGrip & đồng bộ sway 1.4px + nhịp nhún hông walkHipBobY!)
  const swayOffsetX = shiverMotion ? shiverMotion.swayX : 0;
  let gripX = explorerX + 76 + swayOffsetX;
  let gripY = groundY - 208 + walkHipBobY;

  if (isApproach) {
    gripX = explorerX + lerpNum(74, 98, approachRaiseT);
    gripY = groundY - lerpNum(206, 236, approachRaiseT) + walkHipBobY;
  } else if (isAlert || isPheromone || isBuzzingEyes) {
    gripX = explorerX + 98 + swayOffsetX;
    gripY = groundY - 236;
  } else if (isSwarm || isRetreat) {
    gripX = explorerX + 84 + swayOffsetX;
    gripY = groundY - 220 + walkHipBobY;
  } else if (isSwitchOff) {
    const dropT = switchOffTriggered ? smoothstep(0.35, 0.55, u) : 0;
    gripX = explorerX + lerpNum(84, 72, dropT) + swayOffsetX;
    gripY = groundY - lerpNum(220, 200, dropT);
  } else if (isStealthExit) {
    gripX = explorerX - 66;
    gripY = groundY - 194 + walkHipBobY;
  }

  // Hướng đèn pin chĩa thẳng vào cửa tổ ong khi nâng lên/bật, chúc xuống khi tắt
  const aimAtNestDeg =
    (Math.atan2(NEST_Y + 25 - gripY, NEST_X - 20 - gripX) * 180) / Math.PI;
  const flashAngleDeg = isCalm
    ? 28
    : isApproach
    ? lerpNum(28, aimAtNestDeg, approachRaiseT)
    : isSwitchOff
    ? lerpNum(aimAtNestDeg, 26, switchOffTriggered ? smoothstep(0.35, 0.55, u) : 0)
    : isStealthExit
    ? 148
    : aimAtNestDeg;

  const flashRad = (flashAngleDeg * Math.PI) / 180;
  const lensX = gripX + Math.cos(flashRad) * 44;
  const lensY = gripY + Math.sin(flashRad) * 44;

  // 2 cạnh mở của chùm sáng hình nón (Flashlight Beam Cone) phủ trọn tổ ong bắp cày
  const beamLen = 980;
  const halfSpreadRad = (13.5 * Math.PI) / 180;
  const coneTopX = lensX + Math.cos(flashRad - halfSpreadRad) * beamLen;
  const coneTopY = lensY + Math.sin(flashRad - halfSpreadRad) * beamLen;
  const coneBotX = lensX + Math.cos(flashRad + halfSpreadRad) * beamLen;
  const coneBotY = lensY + Math.sin(flashRad + halfSpreadRad) * beamLen;

  const focusActor = computeHornetNightFocusActor({ mode, u, localFrame });

  // Đội hình 7 con ong bắp cày nhỏ gọn (0.34x..0.44x) cho cảnh tấn công & rượt đuổi (Beat 12 & Beat 15)
  const swarmDiveT = smoothstep(0.0, 0.92, u);
  const retreatShiftX = isRetreat ? lerpNum(0, -165, retreatWalkT) : 0;
  const swarmHornets =
    isSwarm || isRetreat
      ? [
          {
            id: "swarm_lead",
            x: focusActor.x,
            y: focusActor.y,
            scale: focusActor.scale,
            rot: focusActor.rotationDeg,
            seed: 1,
          },
          {
            id: "swarm_2",
            x: lerpNum(1292, 775, smoothstep(0.03, 0.93, swarmDiveT)) + retreatShiftX * 0.85,
            y: lerpNum(378, 502, smoothstep(0.03, 0.93, swarmDiveT)) + Math.sin(localFrame * 0.52 + 1.1) * 5,
            scale: 0.41,
            rot: -15,
            seed: 2,
          },
          {
            id: "swarm_3",
            x: lerpNum(1318, 862, smoothstep(0.07, 0.95, swarmDiveT)) + retreatShiftX * 0.78,
            y: lerpNum(448, 576, smoothstep(0.07, 0.95, swarmDiveT)) + Math.cos(localFrame * 0.48 + 2.0) * 5,
            scale: 0.40,
            rot: -18,
            seed: 3,
          },
          {
            id: "swarm_4",
            x: lerpNum(1340, 962, smoothstep(0.11, 0.97, swarmDiveT)) + retreatShiftX * 0.70,
            y: lerpNum(388, 468, smoothstep(0.11, 0.97, swarmDiveT)) + Math.sin(localFrame * 0.58 + 2.9) * 5,
            scale: 0.38,
            rot: -14,
            seed: 4,
          },
          {
            id: "swarm_5",
            x: lerpNum(1355, 1058, smoothstep(0.15, 0.99, swarmDiveT)) + retreatShiftX * 0.62,
            y: lerpNum(452, 536, smoothstep(0.15, 0.99, swarmDiveT)) + Math.cos(localFrame * 0.54 + 3.7) * 4,
            scale: 0.37,
            rot: -16,
            seed: 5,
          },
          {
            id: "swarm_6",
            x: lerpNum(1332, 1145, smoothstep(0.18, 1.0, swarmDiveT)) + retreatShiftX * 0.52,
            y: lerpNum(414, 434, smoothstep(0.18, 1.0, swarmDiveT)) + Math.sin(localFrame * 0.62 + 4.4) * 4,
            scale: 0.36,
            rot: -15,
            seed: 6,
          },
          {
            id: "swarm_7",
            x: lerpNum(1322, 1218, smoothstep(0.22, 1.0, swarmDiveT)) + retreatShiftX * 0.40,
            y: lerpNum(438, 488, smoothstep(0.22, 1.0, swarmDiveT)) + Math.cos(localFrame * 0.57 + 5.1) * 4,
            scale: 0.34,
            rot: -17,
            seed: 7,
          },
        ]
      : [];

  // Đội hình 6 con ong cho Beat 17 (FLASHLIGHT_SWITCH_OFF): Đang lao theo sáng -> tắt đèn ở u=0.35 -> bay ngơ ngác [?]
  const switchOffScatterT = switchOffTriggered ? smoothstep(0.35, 0.62, u) : 0;
  const switchOffHornets = isSwitchOff
    ? [
        {
          id: "off_1",
          x: lerpNum(790, 825, switchOffScatterT) + Math.sin(localFrame * 0.14) * 20 * switchOffScatterT,
          y: lerpNum(555, 470, switchOffScatterT) + Math.cos(localFrame * 0.17) * 14 * switchOffScatterT,
          scale: 0.42,
          facing: (switchOffScatterT > 0.55 && Math.floor(localFrame / 34) % 2 === 1 ? "right" : "left") as "left" | "right",
          rot: lerpNum(-15, 6, switchOffScatterT),
          seed: 1,
          showQuestion: true,
        },
        {
          id: "off_2",
          x: lerpNum(885, 935, switchOffScatterT) + Math.cos(localFrame * 0.16 + 1.2) * 22 * switchOffScatterT,
          y: lerpNum(492, 392, switchOffScatterT) + Math.sin(localFrame * 0.15 + 1.2) * 14 * switchOffScatterT,
          scale: 0.40,
          facing: (switchOffScatterT > 0.45 ? "right" : "left") as "left" | "right",
          rot: lerpNum(-14, -8, switchOffScatterT),
          seed: 2,
          showQuestion: true,
        },
        {
          id: "off_3",
          x: lerpNum(965, 1005, switchOffScatterT) + Math.sin(localFrame * 0.15 + 2.1) * 18 * switchOffScatterT,
          y: lerpNum(545, 575, switchOffScatterT) + Math.cos(localFrame * 0.18 + 2.1) * 12 * switchOffScatterT,
          scale: 0.39,
          facing: "left" as "left" | "right",
          rot: lerpNum(-16, 10, switchOffScatterT),
          seed: 3,
          showQuestion: true,
        },
        {
          id: "off_4",
          x: lerpNum(1055, 1110, switchOffScatterT) + Math.cos(localFrame * 0.17 + 3.0) * 18 * switchOffScatterT,
          y: lerpNum(452, 355, switchOffScatterT) + Math.sin(localFrame * 0.14 + 3.0) * 15 * switchOffScatterT,
          scale: 0.38,
          facing: (switchOffScatterT > 0.5 ? "right" : "left") as "left" | "right",
          rot: lerpNum(-15, 4, switchOffScatterT),
          seed: 4,
          showQuestion: true,
        },
        {
          id: "off_5",
          x: lerpNum(1135, 1185, switchOffScatterT) + Math.sin(localFrame * 0.13 + 3.8) * 16 * switchOffScatterT,
          y: lerpNum(505, 485, switchOffScatterT) + Math.cos(localFrame * 0.16 + 3.8) * 12 * switchOffScatterT,
          scale: 0.36,
          facing: "left" as "left" | "right",
          rot: lerpNum(-14, -5, switchOffScatterT),
          seed: 5,
          showQuestion: false,
        },
        {
          id: "off_6",
          x: lerpNum(1210, 1245, switchOffScatterT) + Math.cos(localFrame * 0.14 + 4.6) * 12 * switchOffScatterT,
          y: lerpNum(432, 412, switchOffScatterT) + Math.sin(localFrame * 0.17 + 4.6) * 10 * switchOffScatterT,
          scale: 0.35,
          facing: "left" as "left" | "right",
          rot: lerpNum(-12, 2, switchOffScatterT),
          seed: 6,
          showQuestion: false,
        },
      ]
    : [];

  // Rung tổ ong & cặp mắt đỏ cho Beat 9 (PHEROMONE) và Beat 10 (BUZZING_RED_EYES)
  const nestBuzzIntensity = isPheromone
    ? 0.55
    : isBuzzingEyes
    ? 0.45 + 0.55 * u
    : isSwarm || isRetreat
    ? 0.35
    : 0;
  const nestRedEyesIntensity = isBuzzingEyes ? smoothstep(0.08, 0.88, u) : 0;

  // Biểu cảm khuôn mặt Tèo theo từng phân cảnh
  const explorerEyes: "curious" | "wide" | "surprised" | "neutral" =
    isCalm || isApproach
      ? "curious"
      : isAlert || isPheromone
      ? "wide"
      : isBuzzingEyes || isSwarm || isRetreat || (isSwitchOff && !switchOffTriggered)
      ? "surprised"
      : isSwitchOff
      ? "wide"
      : "neutral";

  const explorerEyebrows: "neutral" | "raised" | "worried" =
    isCalm || isApproach || isStealthExit
      ? "neutral"
      : isAlert || isPheromone || (isSwitchOff && switchOffTriggered)
      ? "raised"
      : "worried";

  const explorerMouth: "line" | "circleOpen" | "gasp" | "smile" =
    isCalm || isApproach
      ? "line"
      : isAlert || isPheromone
      ? "circleOpen"
      : isBuzzingEyes || isSwarm || isRetreat || (isSwitchOff && !switchOffTriggered)
      ? "gasp"
      : isSwitchOff
      ? "line"
      : "smile";

  const switchClickFlash =
    isSwitchOff && u >= 0.34 && u <= 0.45
      ? Math.sin(((u - 0.34) / 0.11) * Math.PI)
      : 0;

  return (
    <g id="flashlight-night-scene-layer">
      <defs>
        <linearGradient
          id="flashlight-beam-grad"
          x1={lensX}
          y1={lensY}
          x2={(coneTopX + coneBotX) / 2}
          y2={(coneTopY + coneBotY) / 2}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FEF9C3" stopOpacity={(0.66 * beamIntensity).toFixed(2)} />
          <stop offset="45%" stopColor="#FDE047" stopOpacity={(0.34 * beamIntensity).toFixed(2)} />
          <stop offset="85%" stopColor="#FACC15" stopOpacity={(0.18 * beamIntensity).toFixed(2)} />
          <stop offset="100%" stopColor="#FACC15" stopOpacity="0.02" />
        </linearGradient>
        <radialGradient id="pheromone-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#F97316" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Tổ ong bắp cày bầu dục vân nâu treo trên cành cây (có rung & mắt đỏ ở Beat 9-10) */}
      <HornetNest
        x={NEST_X}
        y={NEST_Y}
        beamIntensity={beamIntensity}
        localFrame={localFrame}
        buzzIntensity={nestBuzzIntensity}
        redEyesIntensity={nestRedEyesIntensity}
      />

      {/* 1B. V12.0 Beat 9: Các vòng sóng hóa học PHEROMONE BÁO ĐỘNG màu cam đỏ lan tỏa từ cửa tổ */}
      {isPheromone && (
        <g id="pheromone-alarm-waves">
          <circle cx={NEST_ENTRANCE_X} cy={NEST_ENTRANCE_Y} r={145} fill="url(#pheromone-core-glow)" />
          {[0, 0.25, 0.5, 0.75].map((phaseOffset, wIdx) => {
            const waveP = ((localFrame * 0.012 + phaseOffset) % 1);
            const r = 34 + waveP * 255;
            const op = Math.max(0, (1 - waveP) * 0.85);
            return (
              <circle
                key={`phero_ring_${wIdx}`}
                cx={NEST_ENTRANCE_X}
                cy={NEST_ENTRANCE_Y}
                r={r.toFixed(1)}
                fill="none"
                stroke={wIdx % 2 === 0 ? "#F97316" : "#EF4444"}
                strokeWidth={(5.2 - waveP * 2.4).toFixed(1)}
                strokeDasharray={wIdx % 2 === 0 ? "18 10" : "10 12"}
                opacity={op.toFixed(2)}
              />
            );
          })}
          {/* Các hạt mùi pheromone nhỏ bay tỏa ra khắp các tầng tổ */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((dIdx) => {
            const p = ((localFrame * 0.014 + dIdx * 0.1) % 1);
            const angle = -2.6 + dIdx * 0.62;
            const dist = 28 + p * 215;
            const dx = NEST_ENTRANCE_X + Math.cos(angle) * dist;
            const dy = NEST_ENTRANCE_Y + Math.sin(angle) * dist - p * 18;
            return (
              <circle
                key={`phero_dot_${dIdx}`}
                cx={dx.toFixed(1)}
                cy={dy.toFixed(1)}
                r={(5.5 * (1 - p * 0.45)).toFixed(1)}
                fill={dIdx % 2 === 0 ? "#FB923C" : "#FCA5A5"}
                stroke="#7C2D12"
                strokeWidth={1.5}
                opacity={(0.88 * (1 - p)).toFixed(2)}
              />
            );
          })}
        </g>
      )}

      {/* 2. Chùm sáng hình nón vàng ấm bán trong suốt (Flashlight Beam Cone) */}
      {beamIntensity > 0.02 && (
        <g id="flashlight-beam-cone">
          <polygon
            points={`${lensX.toFixed(1)},${lensY.toFixed(1)} ${coneTopX.toFixed(1)},${coneTopY.toFixed(
              1
            )} ${coneBotX.toFixed(1)},${coneBotY.toFixed(1)}`}
            fill="url(#flashlight-beam-grad)"
          />
          {/* Tia lõi sáng mảnh tạo cảm giác chùm sáng đèn pin LED sắc nét */}
          <line
            x1={lensX}
            y1={lensY}
            x2={NEST_ENTRANCE_X}
            y2={NEST_ENTRANCE_Y}
            stroke="#FEF9C3"
            strokeWidth={6}
            opacity={(0.22 * beamIntensity).toFixed(2)}
            strokeLinecap="round"
          />
          {/* Các hạt bụi đêm lấp lánh bên trong chùm sáng */}
          {[0.18, 0.34, 0.52, 0.68, 0.82].map((f, idx) => {
            const mx = lerpNum(lensX, NEST_X - 30, f) + Math.sin(localFrame * 0.08 + idx * 2) * 14;
            const my = lerpNum(lensY, NEST_Y + 30, f) + Math.cos(localFrame * 0.07 + idx * 3) * 18;
            return (
              <circle
                key={`dust_${idx}`}
                cx={mx}
                cy={my}
                r={3 + (idx % 2) * 1.5}
                fill="#FEF9C3"
                opacity={(0.58 * beamIntensity).toFixed(2)}
              />
            );
          })}
        </g>
      )}

      {/* 3. Nhân vật người áo cam (StickmanRig archetype="explorerOrange" — Tèo áo cam + bóng 3D lưỡi liềm trên mặt) */}
      <StickmanRig
        state={{
          x: explorerX,
          y: explorerY,
          scale: 1.0,
          facing: explorerFacing,
          pose: explorerPose,
          torsoTiltDeg,
          crouchDepth,
          flightLift: 0,
          walkCycleProgress,
          walkWeight,
          eyes: explorerEyes,
          eyebrows: explorerEyebrows,
          mouth: explorerMouth,
          pupilGaze: isStealthExit ? { x: 0.6, y: 0.1 } : { x: 0.7, y: -0.45 },
          sweatDrop: shouldShiver,
          holdingTarget: {
            rightGrip: { x: gripX, y: gripY },
          },
          hat: false,
          archetype: "explorerOrange",
          rimLight: true,
          rimColor: beamIntensity > 0.1 ? "#FEF08A" : "#93C5FD",
          shiver: shouldShiver,
          shiverDarkStage: true,
          shiverFrame: frame,
        }}
        frame={frame}
        renderPart="all"
      />

      {/* 4. Đạo cụ Đèn Pin cầm chặt trong tay nhân vật */}
      <g transform={`translate(${gripX.toFixed(1)}, ${gripY.toFixed(1)}) rotate(${flashAngleDeg.toFixed(1)})`}>
        {/* Thân đèn pin trụ thép */}
        <rect
          x={-16}
          y={-11}
          width={42}
          height={22}
          rx={6}
          fill="#334155"
          stroke="#141414"
          strokeWidth={4}
        />
        {/* Nút bấm công tắc đỏ */}
        <rect
          x={2}
          y={-15}
          width={11}
          height={6}
          rx={2}
          fill={isApproach && u > 0.78 ? "#F87171" : "#EF4444"}
          stroke="#141414"
          strokeWidth={2.5}
        />
        {/* Vòng nhấp nháy ngay nút bấm khi sắp bấm ở Beat 4 hoặc khoảnh khắc TÁCH tắt phụt ở Beat 17 */}
        {isApproach && u > 0.78 && (
          <circle
            cx={7.5}
            cy={-14}
            r={10 + Math.sin(localFrame * 0.45) * 4}
            fill="none"
            stroke="#FEF08A"
            strokeWidth={2.5}
            opacity={0.85}
          />
        )}
        {switchClickFlash > 0.05 && (
          <g transform="translate(7.5, -16)" opacity={switchClickFlash.toFixed(2)}>
            <circle cx={0} cy={0} r={16 * switchClickFlash} fill="#FFFFFF" opacity={0.75} />
            <line x1={-16} y1={0} x2={16} y2={0} stroke="#FEF08A" strokeWidth={3.5} strokeLinecap="round" />
            <line x1={0} y1={-16} x2={0} y2={16} stroke="#FEF08A" strokeWidth={3.5} strokeLinecap="round" />
          </g>
        )}
        {/* Đầu chóa đèn vàng rực */}
        <polygon
          points="24,-12 44,-18 44,18 24,12"
          fill="#FACC15"
          stroke="#141414"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* Mặt kính đèn pin phát sáng */}
        <ellipse
          cx={44}
          cy={0}
          rx={5}
          ry={16}
          fill={beamIntensity > 0.05 ? "#FFFFFF" : "#CBD5E1"}
          stroke="#141414"
          strokeWidth={3.5}
        />
        {/* Lóe sáng ngay đầu kính khi bật đèn */}
        {beamIntensity > 0.05 && (
          <circle cx={46} cy={0} r={22 * beamIntensity} fill="#FEF08A" opacity={0.55} />
        )}
      </g>

      {/* 5. Ong Bắp Cày (HornetRig) tỉ lệ thực tế V11.2/V12.0 (0.34x–0.45x -> thân dài ~56px–74px) */}
      {isSwarm || isRetreat ? (
        swarmHornets.map((h) => (
          <HornetRig
            key={h.id}
            x={h.x}
            y={h.y}
            facing="left"
            scale={h.scale}
            rotationDeg={h.rot}
            frame={frame}
            localFrame={localFrame}
            moodState="AGGRESSIVE_SWARM"
            seed={h.seed}
            showWindStreaks={true}
          />
        ))
      ) : isSwitchOff ? (
        switchOffHornets.map((h) => (
          <g key={h.id}>
            <HornetRig
              x={h.x}
              y={h.y}
              facing={h.facing}
              scale={h.scale}
              rotationDeg={h.rot}
              frame={frame}
              localFrame={localFrame}
              moodState={switchOffTriggered ? "ALERT_BLINDED" : "AGGRESSIVE_SWARM"}
              seed={h.seed}
              showWindStreaks={!switchOffTriggered}
              hideExclamation={switchOffTriggered}
            />
            {/* Dấu chấm hỏi [?] nổi lên trên đầu đàn ong ngơ ngác sau khi tắt phụt đèn pin */}
            {switchOffTriggered && h.showQuestion && switchOffScatterT > 0.2 && (
              <g
                transform={`translate(${h.x.toFixed(1)}, ${(h.y - 44 - Math.sin(localFrame * 0.14 + h.seed) * 4).toFixed(
                  1
                )}) scale(${Math.min(1, switchOffScatterT * 1.25).toFixed(2)})`}
              >
                <rect
                  x={-16}
                  y={-18}
                  width={32}
                  height={30}
                  rx={10}
                  fill="#FEF08A"
                  stroke="#141414"
                  strokeWidth={2.5}
                />
                <text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  fill="#141414"
                  fontSize={21}
                  fontWeight={900}
                  fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                >
                  ?
                </text>
              </g>
            )}
          </g>
        ))
      ) : isStealthExit ? (
        /* V12.1 Beat 19: Nối tiếp tự nhiên từ Beat 17 — 3 con ong nhỏ vẫn bay lơ lửng ngơ ngác [?] quanh cửa tổ trong bóng đêm */
        [
          {
            id: "lost_1",
            x: 1175 + Math.sin(localFrame * 0.09) * 28,
            y: 410 + Math.cos(localFrame * 0.11) * 18,
            scale: 0.41,
            facing: (Math.floor(localFrame / 42) % 2 === 0 ? "left" : "right") as "left" | "right",
            rot: Math.sin(localFrame * 0.08) * 8,
            seed: 1,
          },
          {
            id: "lost_2",
            x: 1248 + Math.cos(localFrame * 0.1 + 1.4) * 22,
            y: 352 + Math.sin(localFrame * 0.12 + 1.4) * 16,
            scale: 0.38,
            facing: (Math.floor((localFrame + 20) / 46) % 2 === 0 ? "right" : "left") as "left" | "right",
            rot: Math.cos(localFrame * 0.09) * 7,
            seed: 2,
          },
          {
            id: "lost_3",
            x: 1236 + Math.sin(localFrame * 0.08 + 2.6) * 20,
            y: 472 + Math.cos(localFrame * 0.1 + 2.6) * 14,
            scale: 0.37,
            facing: "left" as "left" | "right",
            rot: Math.sin(localFrame * 0.07 + 1.5) * 6,
            seed: 3,
          },
        ].map((h) => (
          <g key={h.id}>
            <HornetRig
              x={h.x}
              y={h.y}
              facing={h.facing}
              scale={h.scale}
              rotationDeg={h.rot}
              frame={frame}
              localFrame={localFrame}
              moodState="ALERT_BLINDED"
              seed={h.seed}
              hideExclamation={true}
            />
            <g
              transform={`translate(${h.x.toFixed(1)}, ${(h.y - 42 - Math.sin(localFrame * 0.12 + h.seed) * 4).toFixed(
                1
              )})`}
            >
              <rect
                x={-15}
                y={-17}
                width={30}
                height={28}
                rx={9}
                fill="#FEF08A"
                stroke="#141414"
                strokeWidth={2.5}
              />
              <text
                x={0}
                y={4}
                textAnchor="middle"
                fill="#141414"
                fontSize={19}
                fontWeight={900}
                fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
              >
                ?
              </text>
            </g>
          </g>
        ))
      ) : (
        <>
          {/* Ong lính canh #2 đậu sát mép dưới miệng lỗ tổ */}
          <HornetRig
            x={(isAlert && u >= 0.16) || isPheromone || isBuzzingEyes ? 1318 : 1326}
            y={(isAlert && u >= 0.16) || isPheromone || isBuzzingEyes ? 452 : 458}
            facing="left"
            scale={0.39}
            rotationDeg={(isAlert && u >= 0.16) || isPheromone || isBuzzingEyes ? -8 : 10}
            frame={frame}
            localFrame={localFrame}
            moodState={
              (isAlert && u >= 0.18) || isPheromone || isBuzzingEyes
                ? "ALERT_BLINDED"
                : "SLEEPING_CALM"
            }
            seed={9}
          />
          {/* Ong lính canh #3 đậu sát mép trên cửa tổ */}
          <HornetRig
            x={(isAlert && u >= 0.16) || isPheromone || isBuzzingEyes ? 1286 : 1300}
            y={(isAlert && u >= 0.16) || isPheromone || isBuzzingEyes ? 366 : 382}
            facing="left"
            scale={0.37}
            rotationDeg={(isAlert && u >= 0.16) || isPheromone || isBuzzingEyes ? -16 : 6}
            frame={frame}
            localFrame={localFrame}
            moodState={
              (isAlert && u >= 0.16) || isPheromone || isBuzzingEyes
                ? "ALERT_BLINDED"
                : "SLEEPING_CALM"
            }
            seed={14}
          />
          {/* Ong lính canh tiêu điểm #1 ngay cửa tổ */}
          <HornetRig
            x={focusActor.x}
            y={focusActor.y}
            facing={focusActor.facing}
            scale={focusActor.scale}
            rotationDeg={focusActor.rotationDeg}
            frame={frame}
            localFrame={localFrame}
            moodState={focusActor.moodState}
            seed={1}
          />
        </>
      )}
    </g>
  );
};
