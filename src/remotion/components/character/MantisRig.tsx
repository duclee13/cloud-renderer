/**
 * MANTIS RIG V9.3 (MASTER PATCH):
 * 1. Biến thái cơ thể & khuôn mặt theo 4 cấp độ đói (hungerStage):
 *    - WELL_FED (Beat 2): Xanh tươi #58B947, bụng căng đầy (scaleY = 1.05, 56px), mắt sáng, cười tự tin,
 *      ngực vươn cao (-30°), diễn hoạt XOAY ĐẦU 180° thật sự (headYaw -1 -> +1, nghiêng ±22°)
 *    - HUNGRY_STALK (Beat 4): Xanh trầm #4D9E3F, bụng thon (scaleY = 0.78, 42px), mắt khép hờ tập trung,
 *      ngực hạ thấp (-42°), diễn hoạt BƯỚC 2 BƯỚC CHẬM RÃI (frame 0..192) rồi PHANH ĐỨNG IM BẤT ĐỘNG
 *    - STARVING_XRAY (Beat 8): Xanh úa vàng #7A9A38, bụng xẹp co rút dần (scaleY: 0.68 -> 0.48),
 *      8 hạt mỡ vàng co nhỏ về 0 & bốc hơi thành hạt sáng bay lên, 3 dải cơ đỏ mảnh đi & nhấp nháy,
 *      mắt trũng sâu có quầng thâm, mày nhíu đau đớn, miệng hé thở dốc, râu cụp rủ, thân run nhẹ
 *    - BERSERK_STRIKE (Beat 10): Bụng xẹp mỏng (scaleY = 0.52), mày chữ V dữ tợn, đồng tử co nhỏ sắc bén,
 *      Con Mồi (ruồi đen cánh trắng + đường bay nét đứt) bay vào -> Phóng càng 0.1s (5 frames) ->
 *      Thu gập chữ Z về ngực KẸP CHẶT CON MỒI + đầu cúi nhìn con mồi
 * 2. Giải phẫu 4 chân đi bộ chữ Λ (Insect Λ-Leg Geometry):
 *    - Khớp đùi-ống chân (femur-tibia knee joint) nhô cao lên trên mặt lưng bụng 18px-26px
 *      tạo hình chữ Λ rõ rệt kèm bàn chân nhỏ (tarsus) bám sàn.
 */

import React from "react";
import {
  VitalityPreset,
  ActionIntent,
  RigSockets,
  VITALITY_PRESET_SPECS,
  resolveVitalityPreset,
  resolveActionIntent,
  computeSaccadeFixation,
  computeMantisRigSockets,
  COMIC_SHIVER_CONFIG,
  computeComicShiverMotion,
} from "../../../lib/v7/universalAnimationStandard";

export type MantisPoseVariant =
  | "alert_scan"
  | "hungry_clutch"
  | "stalk_slow"
  | "strike_grab"
  | "exhausted_slump"
  | "calm_explain";

export type MantisHungerStage =
  | "WELL_FED"
  | "HUNGRY_STALK"
  | "STARVING_XRAY"
  | "BERSERK_STRIKE";

export interface MantisRigProps {
  x: number;
  y: number;
  facing?: "left" | "right";
  frame: number;
  localFrame: number;
  durationFrames?: number;
  u: number;
  variant?: MantisPoseVariant;
  hungerStage?: MantisHungerStage;
  vitalityPreset?: VitalityPreset;
  actionIntent?: ActionIntent;
  narrationText?: string;
  headTiltDeg?: number;
  pupilGaze?: { x: number; y: number };
  sweatDrop?: boolean;
  showXrayAbdomen?: boolean;
  onSocketsComputed?: (sockets: RigSockets) => void;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

function interpolateHex(hexA: string, hexB: string, t: number): string {
  const p = clamp01(t);
  const parse = (h: string) => {
    const c = h.replace("#", "");
    return [
      parseInt(c.substring(0, 2), 16),
      parseInt(c.substring(2, 4), 16),
      parseInt(c.substring(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * p);
  const g = Math.round(g1 + (g2 - g1) * p);
  const b = Math.round(b1 + (b2 - b1) * p);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
    .toString(16)
    .padStart(2, "0")}`;
}

/**
 * Vẽ 1 chân đi bộ hình chữ Λ chuẩn giải phẫu côn trùng (Femur vươn lên đỉnh gối Λ cao hơn lưng -> Tibia cắm xuống -> Tarsus bám sàn)
 */
function renderLambdaWalkingLeg(params: {
  key: string;
  hipX: number;
  hipY: number;
  kneeX: number;
  kneeY: number;
  ankleX: number;
  ankleY: number;
  toeX: number;
  fillMain: string;
  isBackLayer: boolean;
}) {
  const { key, hipX, hipY, kneeX, kneeY, ankleX, ankleY, toeX, fillMain, isBackLayer } = params;
  const femurOuterW = isBackLayer ? 14 : 16;
  const femurInnerW = isBackLayer ? 7 : 8.5;
  const tibiaOuterW = isBackLayer ? 11 : 12.5;
  const tibiaInnerW = isBackLayer ? 5 : 6;

  return (
    <g key={key}>
      {/* Đùi (Femur) hướng chéo lên đỉnh gối chữ Λ */}
      <line
        x1={hipX}
        y1={hipY}
        x2={kneeX}
        y2={kneeY}
        stroke="#111827"
        strokeWidth={femurOuterW}
        strokeLinecap="round"
      />
      <line
        x1={hipX}
        y1={hipY}
        x2={kneeX}
        y2={kneeY}
        stroke={fillMain}
        strokeWidth={femurInnerW}
        strokeLinecap="round"
      />

      {/* Ống chân (Tibia) từ đỉnh gối Λ cắm xuống cổ chân + bàn chân nhỏ (Tarsus) bám ngang sàn */}
      <polyline
        points={`${kneeX},${kneeY} ${ankleX},${ankleY} ${toeX},0`}
        fill="none"
        stroke="#111827"
        strokeWidth={tibiaOuterW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`${kneeX},${kneeY} ${ankleX},${ankleY} ${toeX},0`}
        fill="none"
        stroke={fillMain}
        strokeWidth={tibiaInnerW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gai nhọn nhỏ ở đỉnh khớp gối chữ Λ */}
      <polygon
        points={`${kneeX - 4},${kneeY + 2} ${kneeX},${kneeY - 9} ${kneeX + 4},${kneeY + 2}`}
        fill="#111827"
      />
      <circle cx={kneeX} cy={kneeY} r={4.5} fill={fillMain} stroke="#111827" strokeWidth={2.5} />
    </g>
  );
}

/**
 * Vẽ 1 bên càng bọ ngựa chữ Z có gai răng cưa
 */
function renderRaptorialForeleg(params: {
  key: string;
  shoulderX: number;
  shoulderY: number;
  extend: number; // 0 = gập chữ Z thu gọn, 1 = phóng thẳng vồ mồi
  holdingPrey: number; // 0..1: khi thu càng về kẹp chặt con mồi
  twitchDeg: number;
  fillMain: string;
  fillLight: string;
  isBack: boolean;
}) {
  const {
    key,
    shoulderX,
    shoulderY,
    extend,
    holdingPrey,
    twitchDeg,
    fillMain,
    fillLight,
    isBack,
  } = params;
  const offsetX = isBack ? -10 : 0;
  const offsetY = isBack ? 6 : 0;

  const coxaEndX = shoulderX + offsetX + 14 + extend * 56 + holdingPrey * 10;
  const coxaEndY = shoulderY + offsetY + 58 - extend * 38 - holdingPrey * 8;

  const twitchLiftY = -twitchDeg * 1.15;
  const twitchForwardX = twitchDeg * 0.65;

  const femurEndX =
    shoulderX + offsetX + 56 + extend * 82 + holdingPrey * 16 + twitchForwardX;
  const femurEndY =
    shoulderY + offsetY + 8 + extend * 4 - holdingPrey * 4 + twitchLiftY;

  // Khi holdingPrey = 1, cẳng càng khép chặt vào đùi càng tạo gọng kìm kẹp con ruồi
  const tibiaEndX =
    shoulderX +
    offsetX +
    36 +
    extend * 148 +
    holdingPrey * 12 +
    twitchForwardX * 1.3;
  const tibiaEndY =
    shoulderY +
    offsetY +
    70 -
    extend * 34 -
    holdingPrey * 22 +
    twitchLiftY * 1.4;

  const clawTipX = tibiaEndX + 24 + extend * 18 - holdingPrey * 6;
  const clawTipY = tibiaEndY + 10 - extend * 4 - holdingPrey * 8 + twitchLiftY * 0.5;

  const teethIndices = [0.28, 0.48, 0.68, 0.85];

  return (
    <g key={key}>
      <line
        x1={shoulderX + offsetX}
        y1={shoulderY + offsetY}
        x2={coxaEndX}
        y2={coxaEndY}
        stroke="#111827"
        strokeWidth={18}
        strokeLinecap="round"
      />
      <line
        x1={shoulderX + offsetX}
        y1={shoulderY + offsetY}
        x2={coxaEndX}
        y2={coxaEndY}
        stroke={fillMain}
        strokeWidth={10}
        strokeLinecap="round"
      />

      <line
        x1={coxaEndX}
        y1={coxaEndY}
        x2={femurEndX}
        y2={femurEndY}
        stroke="#111827"
        strokeWidth={22}
        strokeLinecap="round"
      />
      <line
        x1={coxaEndX}
        y1={coxaEndY}
        x2={femurEndX}
        y2={femurEndY}
        stroke={fillLight}
        strokeWidth={14}
        strokeLinecap="round"
      />

      {teethIndices.map((t, idx) => {
        const tx = coxaEndX + (femurEndX - coxaEndX) * t;
        const ty = coxaEndY + (femurEndY - coxaEndY) * t + 7;
        return (
          <polygon
            key={`tooth_${idx}`}
            points={`${tx - 4},${ty} ${tx + 3},${ty + 11} ${tx + 7},${ty}`}
            fill="#FEF08A"
            stroke="#111827"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        );
      })}

      <line
        x1={femurEndX}
        y1={femurEndY}
        x2={tibiaEndX}
        y2={tibiaEndY}
        stroke="#111827"
        strokeWidth={15}
        strokeLinecap="round"
      />
      <line
        x1={femurEndX}
        y1={femurEndY}
        x2={tibiaEndX}
        y2={tibiaEndY}
        stroke={fillMain}
        strokeWidth={8}
        strokeLinecap="round"
      />

      <path
        d={`M ${tibiaEndX},${tibiaEndY - 3} Q ${(tibiaEndX + clawTipX) / 2},${tibiaEndY + 8} ${clawTipX},${clawTipY} Q ${
          (tibiaEndX + clawTipX) / 2 - 2
        },${tibiaEndY + 2} ${tibiaEndX - 3},${tibiaEndY + 3} Z`}
        fill="#FACC15"
        stroke="#111827"
        strokeWidth={3}
        strokeLinejoin="round"
      />

      <circle cx={coxaEndX} cy={coxaEndY} r={6} fill={fillLight} stroke="#111827" strokeWidth={3} />
      <circle cx={femurEndX} cy={femurEndY} r={6.5} fill={fillLight} stroke="#111827" strokeWidth={3} />
    </g>
  );
}

/**
 * Vẽ Con Mồi (Con Ruồi đen cánh trắng) bay vào hoặc bị kẹp trong càng
 */
function renderPreyFly(params: {
  x: number;
  y: number;
  rotationDeg: number;
  wingFlutter: number;
  isCaught: boolean;
}) {
  const { x, y, rotationDeg, wingFlutter, isCaught } = params;
  const wingSpread = isCaught ? 8 + wingFlutter * 4 : 12 + wingFlutter * 8;
  return (
    <g
      transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) scale(${
        isCaught ? "1.28" : "1.12"
      }) rotate(${rotationDeg.toFixed(1)})`}
    >
      {/* 2 cánh trắng sáng vỗ nhanh */}
      <ellipse
        cx={-3}
        cy={-12 - wingSpread * 0.3}
        rx={14}
        ry={7}
        fill="#FFFFFF"
        fillOpacity={0.95}
        stroke="#111827"
        strokeWidth={2.5}
        transform={`rotate(${-28 - wingSpread})`}
      />
      <ellipse
        cx={5}
        cy={-11 - wingSpread * 0.3}
        rx={12.5}
        ry={6.5}
        fill="#F8FAFC"
        fillOpacity={0.95}
        stroke="#111827"
        strokeWidth={2.5}
        transform={`rotate(${24 + wingSpread})`}
      />
      {/* Thân ruồi đen có sọc xám */}
      <ellipse cx={0} cy={0} rx={14} ry={9} fill="#1E293B" stroke="#111827" strokeWidth={3} />
      <line x1={3} y1={-6} x2={3} y2={6} stroke="#64748B" strokeWidth={2} />
      <line x1={8} y1={-5} x2={8} y2={5} stroke="#64748B" strokeWidth={2} />
      {/* Đầu & mắt đỏ tươi của ruồi */}
      <circle cx={-11} cy={-1} r={7} fill="#0F172A" stroke="#111827" strokeWidth={2.5} />
      <circle cx={-13} cy={-2.5} r={4} fill="#EF4444" stroke="#111827" strokeWidth={1.5} />
      <circle cx={-14} cy={-3.5} r={1.3} fill="#FFFFFF" />
    </g>
  );
}

export const MantisRig: React.FC<MantisRigProps> = ({
  x,
  y,
  facing = "right",
  frame,
  localFrame,
  durationFrames = 360,
  u,
  variant = "alert_scan",
  hungerStage: explicitStage,
  vitalityPreset: explicitVitality,
  actionIntent: explicitIntent,
  narrationText,
  sweatDrop = false,
  showXrayAbdomen = false,
  onSocketsComputed,
}) => {
  const dir = facing === "left" ? -1 : 1;

  // Chuẩn hóa VitalityPreset & ActionIntent theo Mục 3 & Mục 4 của UNIVERSAL_2D_STORYTIME_ENGINE_STANDARD_V10.md
  const vitalityPreset: VitalityPreset = resolveVitalityPreset({
    vitalityPreset: explicitVitality,
    hungerStage: explicitStage,
    microPoseVariant: variant,
    showXrayAbdomen,
    narrationText,
  });

  const actionIntent: ActionIntent = resolveActionIntent({
    actionIntent: explicitIntent,
    vitalityPreset,
    hungerStage: explicitStage,
    microPoseVariant: variant,
    showXrayAbdomen,
    narrationText,
  });

  const hungerStage: MantisHungerStage =
    explicitStage ||
    (vitalityPreset === "DEPLETED_STARVING"
      ? "STARVING_XRAY"
      : vitalityPreset === "DESPERATE_CLIMAX"
      ? "BERSERK_STRIKE"
      : vitalityPreset === "CAUTIOUS_CONSERVE"
      ? "HUNGRY_STALK"
      : "WELL_FED");

  const vitalitySpec = VITALITY_PRESET_SPECS[vitalityPreset];

  // Xuất tọa độ thực tế 8 điểm neo giải phẫu (RigSockets) theo Mục 2.1
  if (onSocketsComputed) {
    onSocketsComputed(
      computeMantisRigSockets({
        x,
        y,
        facing,
        u,
        localFrame,
        durationFrames,
        vitalityPreset,
        actionIntent,
      })
    );
  }

  // 1. BẢNG MÀU & TỶ LỆ BỤNG THEO VITALITY PRESET (abdomenScaleY: 1.05 -> 0.78 -> 0.65..0.46 -> 0.50)
  const colorPrimary = vitalitySpec.colorPrimary;
  const colorLight = vitalitySpec.colorLight;
  const colorDark = vitalitySpec.colorDark;
  const abdomenScaleY = lerpNum(
    vitalitySpec.abdomenScaleYStart,
    vitalitySpec.abdomenScaleYEnd,
    clamp01(u * 1.05)
  );
  const thoraxLeanDeg = vitalitySpec.thoraxLeanDeg;

  // V11.3: Chuyển động run rẩy cực nhẹ & êm (Math.sin(frame * 0.35) * 1.4px) + Comic Shiver Lines khi đói kiệt sức
  const isStarvingShiver =
    vitalitySpec.tremorAmplitudePx > 0 ||
    vitalityPreset === "DEPLETED_STARVING" ||
    hungerStage === "STARVING_XRAY";
  const shiverMotion = isStarvingShiver ? computeComicShiverMotion(frame) : null;
  const starveTremorX = shiverMotion ? shiverMotion.swayX : 0;
  const breathY = Math.sin(frame * 0.03) * 0.6;

  // =========================================================================
  // 2. DIỄN HOẠT 3 PHA MỤC 4.2: BƯỚC CHẬM TRONG 38% THỜI LƯỢNG ĐẦU RỒI PHANH ĐỨNG IM (STEP_AND_FREEZE)
  // - Pha 1 & 2 (u ∈ [0.00, 0.38]): Bước 2 bước chậm rãi từ -76px đến 0px
  // - Pha 3 (u ∈ [0.38, 1.00]): Phanh dừng hẳn, hạ trọng tâm và khóa cứng tư thế bất động!
  // =========================================================================
  let walkOffsetX = 0;
  let step1LiftY = 0;
  let step1SwingX = 0;
  let step2LiftY = 0;
  let step2SwingX = 0;
  let freezeCrouchDrop = 0;

  if (actionIntent === "STEP_AND_FREEZE") {
    if (u <= 0.38) {
      // Nhịp bước 1: u ∈ [0.03, 0.19] (-76px -> -38px)
      const s1 = smoothstep(0.03, 0.19, u);
      // Nhịp bước 2: u ∈ [0.21, 0.37] (-38px -> 0px)
      const s2 = smoothstep(0.21, 0.37, u);
      walkOffsetX = -76 + 38 * s1 + 38 * s2;

      if (u >= 0.03 && u <= 0.19) {
        const p1 = (u - 0.03) / 0.16;
        step1LiftY = -Math.sin(p1 * Math.PI) * 22;
        step1SwingX = Math.sin(p1 * Math.PI) * 14;
      }
      if (u >= 0.21 && u <= 0.37) {
        const p2 = (u - 0.21) / 0.16;
        step2LiftY = -Math.sin(p2 * Math.PI) * 22;
        step2SwingX = Math.sin(p2 * Math.PI) * 14;
      }
    } else {
      // Pha 3 (u > 0.38): Dừng hẳn và hạ thấp trọng tâm bất động
      walkOffsetX = 0;
      freezeCrouchDrop = smoothstep(0.38, 0.43, u) * 8;
    }
  }

  const postureDrop =
    vitalitySpec.postureDropPx +
    freezeCrouchDrop +
    (step1LiftY + step2LiftY) * 0.12;

  const hipOffsetY = -145 + postureDrop + breathY;

  // =========================================================================
  // 3. DIỄN HOẠT 3 PHA MỤC 4.1: XOAY ĐẦU 180° (-25° TRÁI -> +25° PHẢI) & CƠ CHẾ MẮT SACCADE FIXATION
  // - Pha 1 (0% - 20%): Nhìn thẳng
  // - Pha 2 (20% - 55%): Cụm Đầu + Mắt + Râu xoay hẳn sang trái (headYaw = -1, góc nghiêng -25°)
  // - Pha 3 (55% - 90%): Xoay vọt 180° sang phải (headYaw = +1, góc nghiêng +25°)
  // =========================================================================
  let headYaw = 0; // -1 = quay trái, +1 = quay phải
  let headRotateDeg = 0;
  let pupilFixX = 4;
  let pupilFixY = 0;

  if (actionIntent === "OBSERVE_ROTATE_180") {
    if (u >= 0.20 && u < 0.55) {
      // Pha 2: Quay hẳn sang trái (-1) và giữ quan sát
      headYaw = -smoothstep(0.20, 0.30, u);
    } else if (u >= 0.55 && u <= 0.92) {
      // Pha 3: Xoay vọt 180° từ trái (-1) sang phải (+1)
      const turnRight = smoothstep(0.55, 0.68, u);
      const returnCenter = u > 0.85 ? smoothstep(0.85, 0.94, u) : 0;
      headYaw = lerpNum(-1, 1, turnRight) * (1 - returnCenter);
    }
    headRotateDeg = headYaw * 25;
    pupilFixX = headYaw * 8.5 + (headYaw === 0 ? 4 : 0);
    pupilFixY = Math.abs(headYaw) * -2;
  } else {
    // Cơ chế Saccade & Hold Fixation chuẩn Mục 3.1 (Cấm đảo mắt hình sin)
    const saccade = computeSaccadeFixation(localFrame, 1);
    pupilFixX = saccade.x;
    pupilFixY = saccade.y;
    headRotateDeg =
      (vitalityPreset === "DEPLETED_STARVING" ? 10 : 3) +
      saccade.headMicroDeg * 0.4;
  }

  // =========================================================================
  // 4. DIỄN HOẠT 3 PHA MỤC 4.4 (STRIKE_AND_CAPTURE):
  // - Pha 1 (0% - 30%): Con mồi (ruồi đen cánh trắng có đường bay nét đứt) bay vào tầm vồ
  // - Pha 2 (30% - 35%, 5 frames = 0.08s): Đôi càng phóng vọt ra chạm mồi + nổ CHỘP!
  // - Pha 3 (36% - 100%): Lập tức thu càng chữ Z về trước ngực kẹp chặt con mồi + đầu cúi nhìn mồi
  // =========================================================================
  const strikeFrame = Math.max(30, Math.floor(0.30 * durationFrames));
  let strikeExtend = 0;
  let holdingPrey = 0;
  let preyState: {
    visible: boolean;
    x: number;
    y: number;
    rot: number;
    caught: boolean;
    showTrail: boolean;
  } = { visible: false, x: 0, y: 0, rot: 0, caught: false, showTrail: false };

  if (actionIntent === "STRIKE_AND_CAPTURE") {
    if (localFrame < strikeFrame) {
      // Con ruồi bay vèo từ góc phải (+540, -330) vào tầm vồ (+225, -210)
      const flyP = clamp01(localFrame / strikeFrame);
      const flyX = lerpNum(540, 225, flyP);
      const flyY =
        lerpNum(-330, -210, flyP) + Math.sin(localFrame * 0.25) * 18 * (1 - flyP * 0.5);
      preyState = {
        visible: true,
        x: flyX,
        y: flyY,
        rot: -12 + Math.cos(localFrame * 0.25) * 10,
        caught: false,
        showTrail: true,
      };
      pupilFixX = 8.0;
      pupilFixY = -2.0 * (1 - flyP);
      headRotateDeg = 4;

      // Phóng càng trong đúng 5 frames (strikeFrame - 4 -> strikeFrame)
      if (localFrame >= strikeFrame - 4) {
        strikeExtend = smoothstep(strikeFrame - 4, strikeFrame, localFrame);
      }
    } else if (localFrame <= strikeFrame + 4) {
      strikeExtend = 1.0;
      preyState = {
        visible: true,
        x: 225,
        y: -210,
        rot: 15,
        caught: true,
        showTrail: false,
      };
      pupilFixX = 8.5;
      pupilFixY = 2.0;
      headRotateDeg = 10;
    } else {
      // Pha 3 (36% - 100%): Thu càng chữ Z về ngực & KẸP CHẶT CON MỒI
      const retractP = smoothstep(strikeFrame + 4, strikeFrame + 16, localFrame);
      strikeExtend = 1.0 - retractP * 0.84;
      holdingPrey = retractP;

      const caughtX = lerpNum(225, 134, retractP);
      const caughtY = lerpNum(-210, -214, retractP);
      preyState = {
        visible: true,
        x: caughtX,
        y: caughtY,
        rot: 18,
        caught: true,
        showTrail: false,
      };
      headRotateDeg = lerpNum(10, 18, retractP);
      pupilFixX = 5.5;
      pupilFixY = 5.5;
    }
  }

  // Chớp mắt tự nhiên (mỗi 190 frames chớp 7 frames)
  const blinkFrame = localFrame % 190;
  const isBlinking =
    hungerStage !== "BERSERK_STRIKE" && blinkFrame >= 110 && blinkFrame < 117;

  // Cựa nhẹ đôi càng ở trạng thái tĩnh (mỗi 150 frames khẽ nhích 7° trong 18 frames)
  const twitchFrame = localFrame % 150;
  const isTwitchWindow =
    hungerStage !== "BERSERK_STRIKE" &&
    (hungerStage !== "HUNGRY_STALK" || localFrame > 205) &&
    twitchFrame >= 55 &&
    twitchFrame < 73;
  const twitchDeg = isTwitchWindow
    ? Math.sin(((twitchFrame - 55) / 18) * Math.PI) * 6.5
    : 0;

  // Tọa độ dịch chuyển ngang của ngực & đầu khi nghiêng ngực (thoraxLeanDeg)
  const thoraxShiftX = thoraxLeanDeg * 1.15;
  const thoraxDropY = thoraxLeanDeg * 0.85;
  const neckX = 65 + thoraxShiftX;
  const neckY = -265 + postureDrop + thoraxDropY + breathY;
  const shoulderX = 58 + thoraxShiftX * 0.88;
  const shoulderY = -244 + postureDrop + thoraxDropY * 0.88 + breathY;

  // Đung đưa râu (ở STARVING_XRAY râu cụp rủ xuống hai bên)
  const antennaWave1 = Math.sin(frame * 0.08) * 3.0;
  const antennaWave2 = Math.cos(frame * 0.075) * 2.5;

  // 8 hạt dự trữ thể mỡ bên trong bụng X-Ray (co nhỏ về 0 & bốc hơi thành hạt sáng bay lên, hạt cuối biến mất ở u = 0.85)
  const fatParticles = [
    { cx: -182, cy: -140, r: 10.5, vanishU: 0.28 },
    { cx: -158, cy: -150, r: 11.0, vanishU: 0.36 },
    { cx: -150, cy: -130, r: 10.0, vanishU: 0.44 },
    { cx: -126, cy: -142, r: 11.5, vanishU: 0.52 },
    { cx: -102, cy: -150, r: 10.5, vanishU: 0.60 },
    { cx: -94, cy: -130, r: 10.0, vanishU: 0.68 },
    { cx: -68, cy: -140, r: 11.0, vanishU: 0.76 },
    { cx: -40, cy: -143, r: 9.5, vanishU: 0.85 },
  ];

  const xrayScanX = -215 + ((localFrame * 3.2) % 195);

  return (
    <g
      id="mantis-rig-v9-3"
      transform={`translate(${(x + dir * walkOffsetX + starveTremorX).toFixed(
        1
      )}, ${y}) scale(${dir}, 1)`}
    >
      {/* Bóng tiếp xúc mặt đất */}
      <ellipse cx={-35} cy={3} rx={175} ry={15} fill="rgba(0,0,0,0.22)" />

      {/* =====================================================================
          1. HAI CHÂN ĐI BỘ LỚP SAU (HÌNH CHỮ Λ — ĐỈNH GỐI CAO HƠN LƯNG BỤNG 18-26PX)
         ===================================================================== */}
      <g id="mantis-back-legs-lambda">
        {/* Chân sau trong (Back Hind Leg): Đỉnh gối Λ tại y = hipOffsetY - 46 (-191px) */}
        {renderLambdaWalkingLeg({
          key: "back-hind-leg",
          hipX: -52,
          hipY: hipOffsetY,
          kneeX: -136 + step2SwingX * 0.5,
          kneeY: hipOffsetY - 46 + step2LiftY * 0.6,
          ankleX: -202 + step2SwingX,
          ankleY: -7 + step2LiftY,
          toeX: -186 + step2SwingX,
          fillMain: colorDark,
          isBackLayer: true,
        })}
        {/* Chân giữa trong (Back Middle Leg): Đỉnh gối Λ tại y = hipOffsetY - 40 (-185px) */}
        {renderLambdaWalkingLeg({
          key: "back-mid-leg",
          hipX: 6,
          hipY: hipOffsetY + 2,
          kneeX: 30 + step1SwingX * 0.5,
          kneeY: hipOffsetY - 40 + step1LiftY * 0.6,
          ankleX: 54 + step1SwingX,
          ankleY: -7 + step1LiftY,
          toeX: 70 + step1SwingX,
          fillMain: colorDark,
          isBackLayer: true,
        })}
      </g>

      {/* =====================================================================
          2. CÀNG GAI PHÍA SAU (LỚP SAU)
         ===================================================================== */}
      {renderRaptorialForeleg({
        key: "back-claw",
        shoulderX: shoulderX + 2,
        shoulderY: shoulderY + 2,
        extend: strikeExtend * 0.94,
        holdingPrey,
        twitchDeg: twitchDeg * 0.85,
        fillMain: colorDark,
        fillLight: colorPrimary,
        isBack: true,
      })}

      {/* =====================================================================
          3. THÂN BỤNG DÀI NẰM NGANG — BIẾN THÁI ĐỘ DÀY THEO CẤP ĐỘ ĐÓI (abdomenScaleY)
             & DIỄN HOẠT ĐỐT HẠT MỠ BỐC HƠI TRONG BỤNG X-RAY (Beat 8)
         ===================================================================== */}
      <g
        id="mantis-abdomen"
        transform={`translate(0, ${hipOffsetY}) scale(1, ${abdomenScaleY.toFixed(
          3
        )}) translate(0, 145)`}
      >
        {!showXrayAbdomen ? (
          <g>
            <path
              d="M -4,-145 C -38,-178 -160,-174 -225,-138 C -165,-106 -38,-112 -4,-145 Z"
              fill={colorPrimary}
              stroke="#111827"
              strokeWidth={4.5}
              strokeLinejoin="round"
            />
            <path
              d="M -22,-154 C -75,-168 -148,-164 -202,-142"
              fill="none"
              stroke={colorLight}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.75}
            />
            {[-45, -82, -118, -154, -186].map((sx, idx) => (
              <path
                key={`seg_${idx}`}
                d={`M ${sx},${-164 + idx * 1.5} Q ${sx - 10},-140 ${sx},${-118 - idx * 1.2}`}
                fill="none"
                stroke={colorDark}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            ))}
          </g>
        ) : (
          <g id="mantis-abdomen-xray">
            <defs>
              <clipPath id="mantisAbdomenXrayClip">
                <path d="M -4,-145 C -38,-178 -160,-174 -225,-138 C -165,-106 -38,-112 -4,-145 Z" />
              </clipPath>
            </defs>
            <path
              d="M -4,-145 C -38,-178 -160,-174 -225,-138 C -165,-106 -38,-112 -4,-145 Z"
              fill="#0B132B"
              fillOpacity={0.94}
              stroke="#38BDF8"
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <g clipPath="url(#mantisAbdomenXrayClip)">
              {[-180, -140, -100, -60].map((gxLine, i) => (
                <line
                  key={`xl_${i}`}
                  x1={gxLine}
                  y1={-180}
                  x2={gxLine}
                  y2={-105}
                  stroke="#1E3A5F"
                  strokeWidth={2}
                />
              ))}

              {/* 3 Dải cơ màu đỏ mảnh dần đi (7.5px -> 3.0px) và nhấp nháy cảnh báo */}
              {(() => {
                const muscleWidth = lerpNum(7.5, 3.0, clamp01(u * 1.15));
                const muscleBlink = 0.45 + 0.55 * Math.abs(Math.sin(localFrame * 0.26));
                return (
                  <g opacity={muscleBlink}>
                    <path
                      d="M -205,-144 Q -120,-166 -20,-152"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth={muscleWidth}
                      strokeLinecap="round"
                    />
                    <path
                      d="M -202,-136 Q -115,-118 -22,-130"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth={muscleWidth}
                      strokeLinecap="round"
                    />
                    <path
                      d="M -195,-140 Q -110,-142 -26,-142"
                      fill="none"
                      stroke="#F87171"
                      strokeWidth={muscleWidth * 0.85}
                      strokeDasharray="12 6"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })()}

              {/* 8 Hạt mỡ vàng co nhỏ dần bán kính về 0 (hạt cuối biến mất ở u = 0.85) */}
              {fatParticles.map((p, idx) => {
                const burnStart = p.vanishU - 0.22;
                const burnP = clamp01((u - burnStart) / 0.22);
                const radiusScale = 1 - smoothstep(0, 1, burnP);
                const fillCol = interpolateHex("#FACC15", "#F97316", burnP);
                if (radiusScale <= 0.02) return null;
                return (
                  <g key={`fat_${idx}`}>
                    {burnP > 0.1 && burnP < 0.95 && (
                      <circle
                        cx={p.cx}
                        cy={p.cy}
                        r={p.r * radiusScale * 1.6}
                        fill="#F97316"
                        opacity={0.45}
                      />
                    )}
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r={Math.max(0.5, p.r * radiusScale)}
                      fill={fillCol}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  </g>
                );
              })}

              {/* Tia quét dọc X-Ray */}
              <line
                x1={xrayScanX}
                y1={-180}
                x2={xrayScanX}
                y2={-105}
                stroke="#38BDF8"
                strokeWidth={4.5}
                opacity={0.85}
              />
            </g>

            {/* Các hạt sáng năng lượng bốc hơi bay lên phía trên bụng khi hạt mỡ tiêu biến */}
            {fatParticles.map((p, idx) => {
              const vapStart = p.vanishU - 0.14;
              const vapEnd = p.vanishU + 0.14;
              if (u < vapStart || u > vapEnd) return null;
              const vapP = (u - vapStart) / (vapEnd - vapStart);
              const moteY = p.cy - vapP * 75;
              const moteX = p.cx + Math.sin(vapP * Math.PI * 2 + idx) * 10;
              return (
                <g key={`vapor_${idx}`} opacity={1 - vapP}>
                  <circle cx={moteX} cy={moteY} r={6 * (1 - vapP * 0.5)} fill="#FEF08A" />
                  <circle cx={moteX + 6} cy={moteY - 12} r={3.5 * (1 - vapP * 0.5)} fill="#F97316" />
                </g>
              );
            })}

            <path
              d="M -4,-145 C -38,-178 -160,-174 -225,-138 C -165,-106 -38,-112 -4,-145 Z"
              fill="none"
              stroke="#38BDF8"
              strokeWidth={4.5}
              strokeLinejoin="round"
            />
          </g>
        )}
      </g>

      {/* =====================================================================
          4. NGỰC THON DÀI (PROTHORAX — GÓC NGHIÊNG THEO CẤP ĐỘ ĐÓI)
         ===================================================================== */}
      <g id="mantis-thorax">
        <path
          d={`M -12,${hipOffsetY + 3} Q ${18 + thoraxShiftX * 0.5},${
            hipOffsetY - 65 + thoraxDropY * 0.5
          } ${neckX - 9},${neckY - 3} Q ${neckX + 5},${neckY - 7} ${neckX + 9},${
            neckY + 5
          } Q ${42 + thoraxShiftX * 0.5},${hipOffsetY - 50 + thoraxDropY * 0.5} 10,${
            hipOffsetY + 7
          } Z`}
          fill={colorPrimary}
          stroke="#111827"
          strokeWidth={4.5}
          strokeLinejoin="round"
        />
        <line
          x1={10}
          y1={hipOffsetY - 11}
          x2={neckX - 9}
          y2={neckY + 15}
          stroke={colorLight}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.75}
        />
      </g>

      {/* =====================================================================
          5. ĐẦU TAM GIÁC BO GÓC, 2 MẮT BIỂU CẢM & 2 RÂU (XOAY 180° / MỆT MỎI / HUNG DỮ)
         ===================================================================== */}
      <g
        id="mantis-head"
        transform={`translate(${(neckX + headYaw * 14).toFixed(1)}, ${neckY.toFixed(
          1
        )}) rotate(${headRotateDeg.toFixed(2)})`}
      >
        {/* 2 Râu trên đỉnh đầu: Vươn cao ở WELL_FED, cụp rủ xuống hai bên ở STARVING_XRAY */}
        {hungerStage === "STARVING_XRAY" ? (
          <>
            <path
              d="M -6,-52 Q -42,-48 -78,-14"
              fill="none"
              stroke="#111827"
              strokeWidth={4.5}
              strokeLinecap="round"
            />
            <path
              d="M 20,-52 Q 56,-48 92,-12"
              fill="none"
              stroke="#111827"
              strokeWidth={4.5}
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <g transform={`rotate(${(antennaWave1 + headYaw * 12).toFixed(2)}, -4, -56)`}>
              <path
                d="M -4,-56 Q -28,-118 -72,-124"
                fill="none"
                stroke="#111827"
                strokeWidth={4.5}
                strokeLinecap="round"
              />
              <path
                d="M -4,-56 Q -28,-118 -72,-124"
                fill="none"
                stroke={colorLight}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </g>
            <g transform={`rotate(${(antennaWave2 + headYaw * 12).toFixed(2)}, 18, -58)`}>
              <path
                d="M 18,-58 Q 42,-122 86,-126"
                fill="none"
                stroke="#111827"
                strokeWidth={4.5}
                strokeLinecap="round"
              />
              <path
                d="M 18,-58 Q 42,-122 86,-126"
                fill="none"
                stroke={colorLight}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </g>
          </>
        )}

        {/* Đầu hình tam giác bo góc */}
        <path
          d="M -26,-52 Q 8,-70 42,-52 Q 46,-28 16,-4 Q 8,2 0,-4 Q -28,-28 -26,-52 Z"
          fill={colorLight}
          stroke="#111827"
          strokeWidth={4.5}
          strokeLinejoin="round"
        />

        {/* 2 Mắt tròn to biểu cảm (dịch chuyển parallax theo headYaw khi xoay đầu 180°) */}
        {[
          { cx: -16 + headYaw * 6, cy: -50 },
          { cx: 28 + headYaw * 6, cy: -50 },
        ].map((eye, idx) => {
          const clipId = `mantisEyeClipV93_${idx}`;
          const pupilR = hungerStage === "BERSERK_STRIKE" ? 6.2 : 10.5;
          return (
            <g key={`eye_${idx}`} transform={`translate(${eye.cx.toFixed(1)}, ${eye.cy})`}>
              <defs>
                <clipPath id={clipId}>
                  <circle cx={0} cy={0} r={22} />
                </clipPath>
              </defs>
              <circle cx={0} cy={0} r={24} fill="#FFFFFF" stroke="#111827" strokeWidth={4} />
              <g clipPath={`url(#${clipId})`}>
                {isBlinking ? (
                  <path
                    d="M -22,2 Q 0,10 22,2"
                    fill="none"
                    stroke="#111827"
                    strokeWidth={4.5}
                    strokeLinecap="round"
                  />
                ) : (
                  <>
                    {/* Con ngươi đen + đốm sáng */}
                    <circle cx={pupilFixX} cy={pupilFixY} r={pupilR} fill="#111827" />
                    <circle
                      cx={pupilFixX - pupilR * 0.32}
                      cy={pupilFixY - pupilR * 0.32}
                      r={pupilR * 0.34}
                      fill="#FFFFFF"
                    />

                    {/* Mí mắt theo 4 cấp độ đói */}
                    {hungerStage === "HUNGRY_STALK" && (
                      <rect
                        x={-26}
                        y={-26}
                        width={52}
                        height={19}
                        fill={colorPrimary}
                        stroke="#111827"
                        strokeWidth={3.5}
                      />
                    )}
                    {hungerStage === "STARVING_XRAY" && (
                      <path
                        d={
                          idx === 0
                            ? "M -26,-26 L 26,-26 L 26,4 L -26,-6 Z"
                            : "M -26,-26 L 26,-26 L 26,-6 L -26,4 Z"
                        }
                        fill={colorPrimary}
                        stroke="#111827"
                        strokeWidth={3.5}
                      />
                    )}
                    {hungerStage === "BERSERK_STRIKE" && (
                      <polygon
                        points={
                          idx === 0
                            ? "-26,-26 26,-26 26,4 -26,-12"
                            : "-26,-26 26,-26 26,-12 -26,4"
                        }
                        fill={colorPrimary}
                        stroke="#111827"
                        strokeWidth={3.5}
                      />
                    )}
                  </>
                )}
              </g>

              {/* Quầng thâm trũng sâu dưới mắt khi đói kiệt sức (STARVING_XRAY) */}
              {hungerStage === "STARVING_XRAY" && (
                <path
                  d="M -18,22 Q 0,31 18,22"
                  fill="none"
                  stroke="#334155"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  opacity={0.85}
                />
              )}
            </g>
          );
        })}

        {/* Lông mày nhíu chặt đau đớn (STARVING_XRAY) hoặc chữ V sắc lẹm (BERSERK_STRIKE) */}
        {hungerStage === "STARVING_XRAY" && (
          <g>
            <line x1={-32} y1={-66} x2={-4} y2={-76} stroke="#111827" strokeWidth={5} strokeLinecap="round" />
            <line x1={44} y1={-66} x2={16} y2={-76} stroke="#111827" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {hungerStage === "BERSERK_STRIKE" && (
          <g>
            <line x1={-36} y1={-76} x2={-2} y2={-62} stroke="#111827" strokeWidth={5.5} strokeLinecap="round" />
            <line x1={48} y1={-76} x2={14} y2={-62} stroke="#111827" strokeWidth={5.5} strokeLinecap="round" />
          </g>
        )}

        {/* Miệng theo 4 cấp độ đói */}
        {hungerStage === "WELL_FED" && (
          <path
            d={`M ${-2 + headYaw * 4},-18 Q ${8 + headYaw * 4},-9 ${18 + headYaw * 4},-18`}
            fill="none"
            stroke="#111827"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        )}
        {hungerStage === "HUNGRY_STALK" && (
          <line x1={-1} y1={-16} x2={17} y2={-16} stroke="#111827" strokeWidth={3.8} strokeLinecap="round" />
        )}
        {hungerStage === "STARVING_XRAY" && (
          <ellipse cx={8} cy={-14} rx={7.5} ry={5} fill="#111827" stroke="#0F172A" strokeWidth={2} />
        )}
        {hungerStage === "BERSERK_STRIKE" && (
          <polygon points="0,-18 16,-18 8,-9" fill="#111827" />
        )}

        {/* Giọt mồ hôi khi đói/kiệt sức */}
        {(sweatDrop || hungerStage === "STARVING_XRAY") && (
          <path
            d="M -38,-46 Q -44,-34 -38,-28 Q -32,-34 -38,-46 Z"
            fill="#38BDF8"
            stroke="#111827"
            strokeWidth={2.5}
          />
        )}

        {/* V11.3: Comic Shiver Lines hai bên đầu & cổ khi Bọ Ngựa run rẩy đói kiệt sức */}
        {shiverMotion && (() => {
          const isAlt = shiverMotion.tick === 1;
          const dy = shiverMotion.lineOffsetY;
          const tilt = shiverMotion.lineTiltDeg;
          return (
            <g
              id="mantis-comic-shiver-lines"
              fill="none"
              stroke={COMIC_SHIVER_CONFIG.LIGHT_STAGE_COLOR}
              strokeWidth={COMIC_SHIVER_CONFIG.STROKE_WIDTH_PX}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            >
              {/* Cụm nét run bên TRÁI đầu bọ ngựa (cách mép mắt trái ~18px) */}
              <g transform={`translate(-60, ${(-48 + dy).toFixed(1)}) rotate(${tilt.toFixed(1)})`}>
                <path
                  d={
                    isAlt
                      ? "M 2,-18 L -4,-7 L 3,4 L -4,15"
                      : "M -2,-16 L 4,-5 L -3,6 L 3,17"
                  }
                />
                <path
                  d={isAlt ? "M -9,-10 Q -15,0 -9,11" : "M -10,-12 Q -4,-1 -10,10"}
                  opacity={0.8}
                />
              </g>
              {/* Cụm nét run bên PHẢI đầu bọ ngựa (cách mép mắt phải ~18px) */}
              <g transform={`translate(72, ${(-48 - dy).toFixed(1)}) rotate(${(-tilt).toFixed(1)})`}>
                <path
                  d={
                    isAlt
                      ? "M -2,-18 L 4,-7 L -3,4 L 4,15"
                      : "M 2,-16 L -4,-5 L 3,6 L -3,17"
                  }
                />
                <path
                  d={isAlt ? "M 9,-10 Q 15,0 9,11" : "M 10,-12 Q 4,-1 10,10"}
                  opacity={0.8}
                />
              </g>
            </g>
          );
        })()}
      </g>

      {/* =====================================================================
          6. HAI CHÂN ĐI BỘ LỚP TRƯỚC (HÌNH CHỮ Λ — ĐỈNH GỐI CAO HƠN LƯNG BỤNG 18-26PX)
         ===================================================================== */}
      <g id="mantis-front-legs-lambda">
        {/* Chân sau ngoài (Front Hind Leg): Đỉnh gối Λ tại y = hipOffsetY - 52 (-197px) */}
        {renderLambdaWalkingLeg({
          key: "front-hind-leg",
          hipX: -42,
          hipY: hipOffsetY + 4,
          kneeX: -112 + step1SwingX * 0.5,
          kneeY: hipOffsetY - 52 + step1LiftY * 0.6,
          ankleX: -168 + step1SwingX,
          ankleY: -7 + step1LiftY,
          toeX: -150 + step1SwingX,
          fillMain: colorPrimary,
          isBackLayer: false,
        })}
        {/* Chân giữa ngoài (Front Middle Leg): Đỉnh gối Λ tại y = hipOffsetY - 44 (-189px) */}
        {renderLambdaWalkingLeg({
          key: "front-mid-leg",
          hipX: -4,
          hipY: hipOffsetY + 6,
          kneeX: -26 + step2SwingX * 0.5,
          kneeY: hipOffsetY - 44 + step2LiftY * 0.6,
          ankleX: -36 + step2SwingX,
          ankleY: -7 + step2LiftY,
          toeX: -18 + step2SwingX,
          fillMain: colorPrimary,
          isBackLayer: false,
        })}
      </g>

      {/* =====================================================================
          7. CÀNG GAI TRƯỚC CHỮ Z (LỚP TRÊN — KẸP CHẶT CON MỒI Ở BEAT 10)
         ===================================================================== */}
      {renderRaptorialForeleg({
        key: "front-claw",
        shoulderX,
        shoulderY,
        extend: strikeExtend,
        holdingPrey,
        twitchDeg,
        fillMain: colorPrimary,
        fillLight: colorLight,
        isBack: false,
      })}

      {/* =====================================================================
          8. CON MỒI (CON RUỒI ĐEN CÁNH TRẮNG + ĐƯỜNG BAY NÉT ĐỨT Ở BEAT 10)
             Hiển thị rõ ràng giữa đôi càng trước và càng sau khi bị kẹp chặt
         ===================================================================== */}
      {preyState.visible && (
        <g id="mantis-prey-fly">
          {preyState.showTrail && (
            <path
              d={`M 560,-340 Q 390,-290 ${preyState.x + 18},${preyState.y - 4}`}
              fill="none"
              stroke="#475569"
              strokeWidth={3.5}
              strokeDasharray="10 8"
              strokeLinecap="round"
              opacity={0.75}
            />
          )}
          {renderPreyFly({
            x: preyState.x,
            y: preyState.y,
            rotationDeg: preyState.rot,
            wingFlutter: Math.sin(localFrame * 1.4),
            isCaught: preyState.caught,
          })}
        </g>
      )}

      {/* Vệt gió tốc độ trong khoảnh khắc phóng càng 0.1s */}
      {strikeExtend > 0.35 && (
        <g id="mantis-strike-speedlines" opacity={Math.min(1, strikeExtend)}>
          <line x1={125} y1={-255} x2={245} y2={-255} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
          <line x1={140} y1={-215} x2={265} y2={-215} stroke="#F97316" strokeWidth={4} strokeLinecap="round" />
          <line x1={115} y1={-175} x2={225} y2={-175} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};
