/**
 * FIRE ANT MOVIE STAGES V15.0 ("7 Ngày Với Tổ Kiến Lửa Dưới Gốc Xoài" — 4 Hồi, 40 Phân Cảnh)
 * Tái sử dụng 100% 5 Bối Cảnh Đời Sống + 5 Preset Người Que Thuần + ComicSpeechBubble (đệm >=30px, Lip-Sync Micro Talk)
 * Đảm bảo >= 85% phân cảnh động 60fps liên tục, không bao giờ dùng Math.floor nhấp nháy tay chân!
 */

import React from "react";
import { StickmanRig, ComicSpeechBubble, isComicBubbleActive } from "./StickmanRig";
import { smoothstep, lerpNum } from "../../lib/v7/universalAnimationStandard";

export type FireAntV15SceneMode =
  // Hồi 1 mở rộng
  | "GARDEN_STROLL_MANGO"
  | "EXPLAIN_QUEEN_COLONY"
  | "YARD_EVENING_CURIOUS"
  // Hồi 2: Cuộc phản công & Tổ vệ tinh
  | "BEDROOM_NIGHT_PLAN"
  | "YARD_MORNING_MARCH"
  | "GARDEN_WATER_SPLASH"
  | "GARDEN_SATELLITE_MOUNDS"
  | "UNDERGROUND_EGG_EVACUATION"
  | "EXPLAIN_SATELLITE_NETWORK"
  | "GARDEN_FOOTSTEP_VIBRATION"
  | "EXPLAIN_VIBRATION_CO2"
  | "GARDEN_SCOUT_CLIMB_SHOE"
  | "GARDEN_SURPRISE_HOP"
  // Hồi 3: Chiến thuật đồng loạt & Trận mưa lớn
  | "EXPLAIN_SYNC_ATTACK"
  | "YARD_GRANDPA_RESCUE"
  | "YARD_GRANDPA_WISDOM"
  | "BEDROOM_GRAB_MAGNIFIER"
  | "GARDEN_MAGNIFIER_OBSERVE"
  | "EXPLAIN_SOLDIER_VS_WORKER"
  | "GARDEN_ANTS_CARRY_CATERPILLAR"
  | "EXPLAIN_PHEROMONE_TRAIL"
  | "GARDEN_DARK_CLOUDS_RAIN"
  | "YARD_WATCH_RAIN_WINDOW"
  // Hồi 4: Chiếc bè kiến sống & Bài học dưới gốc xoài
  | "GARDEN_FLOODED_MORNING"
  | "GARDEN_RED_PATCH_WATER"
  | "EXPLAIN_LIVING_ANT_RAFT"
  | "EXPLAIN_AIR_BUBBLE_PHYSICS"
  | "GARDEN_RAFT_DRIFT_SAFE"
  | "GARDEN_GRANDPA_BOY_NONLA"
  | "YARD_SUNNY_NOTEBOOK"
  | "EXPLAIN_SEVEN_DAY_NOTEBOOK"
  | "YARD_SUMMER_FAREWELL"
  | "EXPLAIN_WARM_SERIES_OUTRO";

export interface KassStageBackdropsKit {
  CountrysideYardBackdrop: React.FC<{ timeOfDay?: "DAY" | "SUNSET" | "NIGHT"; frame?: number; groundY?: number }>;
  BedroomIndoorBackdrop: React.FC<{ timeOfDay?: "DAY" | "SUNSET" | "NIGHT"; frame?: number; groundY?: number; rainOutside?: boolean }>;
  UndergroundCrossSectionStage: React.FC<{ frame?: number; localFrame?: number; showAnts?: boolean; evacuateEggs?: boolean }>;
  ExplainerPolkaDotBackdrop: React.FC<{ palette?: "mint" | "cream" | "lavender" }>;
  MagnifyingGlassOverlay: React.FC<{ x: number; y: number; radius?: number; handleAngleDeg?: number; localFrame?: number }>;
  SimpleGrassFieldBackdrop: React.FC<{
    timeOfDay?: "DAY" | "SUNSET" | "NIGHT";
    frame?: number;
    groundY?: number;
    weather?: "CLEAR" | "RAIN" | "FLOOD";
    showRainbow?: boolean;
  }>;
  FireAntMound: React.FC<{
    x: number;
    y: number;
    scale?: number;
    swarmLevel?: "calm" | "emerging" | "boiling";
    localFrame: number;
    u: number;
  }>;
}

function easeOutBack(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

/** Nón lá Việt Nam đội gọn trên đỉnh đầu người que (thoáng sạch gương mặt, không che trán) */
const VietnameseConicalHat: React.FC<{ x: number; y: number; scale?: number; tiltDeg?: number }> = ({
  x,
  y,
  scale = 1,
  tiltDeg = 0,
}) => (
  <g transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${tiltDeg.toFixed(1)}) scale(${scale})`}>
    <polygon points="0,-54 -78,10 78,10" fill="#FDE68A" stroke="#141414" strokeWidth={3.2} strokeLinejoin="round" />
    <line x1={-46} y1={-14} x2={46} y2={-14} stroke="#D97706" strokeWidth={2.2} />
    <line x1={-62} y1={-2} x2={62} y2={-2} stroke="#D97706" strokeWidth={2.2} />
    <line x1={-72} y1={7} x2={72} y2={7} stroke="#B45309" strokeWidth={2.5} />
  </g>
);

/** Chiếc bè kiến lửa sống nổi trên mặt nước (tái sử dụng cho Beats 32, 35, 36) */
const FloatingLivingAntRaft: React.FC<{ x: number; y: number; scale?: number; frame: number }> = ({
  x,
  y,
  scale = 1,
  frame,
}) => {
  const bobY = Math.sin(frame * 0.09) * 5;
  const tilt = Math.sin(frame * 0.07) * 2.4;
  return (
    <g transform={`translate(${x.toFixed(1)}, ${(y + bobY).toFixed(1)}) rotate(${tilt.toFixed(2)}) scale(${scale})`}>
      {/* Vòng sóng nước gợn quanh bè kiến */}
      <ellipse cx={0} cy={14} rx={125 + Math.sin(frame * 0.1) * 6} ry={16} fill="none" stroke="#E0F2FE" strokeWidth={3} opacity={0.75} />
      <ellipse cx={0} cy={16} rx={152 + Math.cos(frame * 0.08) * 8} ry={20} fill="none" stroke="#BAE6FD" strokeWidth={2.2} opacity={0.5} />
      {/* Đệm bọt khí trắng bạc nâng dưới đáy bè */}
      <ellipse cx={0} cy={10} rx={96} ry={14} fill="#E0F2FE" opacity={0.82} />
      {/* Thân chiếc bè kết từ hàng chục nghìn con kiến đỏ móc chân */}
      <path
        d="M -98,8 Q -92,-24 0,-30 Q 92,-24 98,8 Q 48,18 0,18 Q -48,18 -98,8 Z"
        fill="#B91C1C"
        stroke="#141414"
        strokeWidth={3.2}
      />
      {/* Các lớp chấm kiến đỏ bám dày trên mặt bè */}
      {Array.from({ length: 24 }).map((_, i) => {
        const ax = -74 + (i % 8) * 21 + ((i * 7) % 5);
        const ay = -16 + Math.floor(i / 8) * 10 + Math.sin(frame * 0.18 + i) * 1.4;
        return <ellipse key={`raft_ant_${i}`} cx={ax} cy={ay} rx={5} ry={3} fill={i % 2 === 0 ? "#EF4444" : "#991B1B"} />;
      })}
      {/* Trứng kiến trắng khô ráo + Kiến chúa ở chính giữa đỉnh bè */}
      {[-18, -8, 4, 14, 22].map((ex, i) => (
        <ellipse key={`raft_egg_${i}`} cx={ex} cy={-24 + (i % 2) * 3} rx={5.5} ry={3.4} fill="#FEF9C3" stroke="#78350F" strokeWidth={1.3} />
      ))}
      <ellipse cx={0} cy={-30} rx={11} ry={6.5} fill="#DC2626" stroke="#141414" strokeWidth={2} />
    </g>
  );
};

export const FireAntV15SceneLayer: React.FC<{
  mode: FireAntV15SceneMode;
  frame: number;
  localFrame: number;
  durationFrames: number;
  u: number;
  groundY?: number;
  backdrops: KassStageBackdropsKit;
}> = ({ mode, frame, localFrame, u, groundY = 840, backdrops }) => {
  const STRIDE_CYCLE_PX = 160;
  const {
    CountrysideYardBackdrop,
    BedroomIndoorBackdrop,
    UndergroundCrossSectionStage,
    ExplainerPolkaDotBackdrop,
    MagnifyingGlassOverlay,
    SimpleGrassFieldBackdrop,
    FireAntMound,
  } = backdrops;

  // =========================================================================
  // HỒI 1 MỞ RỘNG (Beats 2, 9, 10)
  // =========================================================================
  if (mode === "GARDEN_STROLL_MANGO") {
    const walkT = smoothstep(0.03, 0.72, u);
    const boyX = lerpNum(280, 820, walkT);
    const walkWeight = u <= 0.74 ? Math.min(smoothstep(0.03, 0.10, u), 1 - smoothstep(0.64, 0.74, u)) : 0;
    const walkCycle = (Math.abs(boyX - 280) / STRIDE_CYCLE_PX) % 1;
    const bubbleAppear = 135;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    const dfX = 950 + Math.sin(frame * 0.08) * 140;
    const dfY = 470 + Math.cos(frame * 0.14) * 38;

    return (
      <g id="v15-garden-stroll-mango">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <FireAntMound x={1255} y={groundY} swarmLevel="calm" localFrame={localFrame} u={u} />
        {/* Chú chuồn chuồn nhỏ bay lượn 60fps trên bãi cỏ */}
        <g transform={`translate(${dfX.toFixed(1)}, ${dfY.toFixed(1)}) rotate(${(Math.sin(frame * 0.08) * 12).toFixed(1)})`}>
          <line x1={-16} y1={0} x2={16} y2={0} stroke="#0284C7" strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={-2} cy={-7} rx={12} ry={4 + Math.sin(frame * 0.9) * 2} fill="#E0F2FE" stroke="#141414" strokeWidth={1.6} />
          <ellipse cx={-2} cy={7} rx={12} ry={4 + Math.cos(frame * 0.9) * 2} fill="#E0F2FE" stroke="#141414" strokeWidth={1.6} />
        </g>
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            torsoTiltDeg: walkWeight * 6,
            walkCycleProgress: walkCycle,
            walkWeight,
            isSpeaking: isTalking,
            eyes: "curious",
            eyebrows: "raised",
            mouth: "smile",
            pupilGaze: { x: 0.85, y: 0.2 },
          }}
        />
        <ComicSpeechBubble
          x={boyX + 150}
          y={groundY - 495}
          mouthX={boyX + 28}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Kìa, cái gì thế?"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "EXPLAIN_QUEEN_COLONY") {
    const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
    const pulse = 1 + Math.sin(frame * 0.09) * 0.035;
    return (
      <g id="v15-explain-queen-colony">
        <ExplainerPolkaDotBackdrop palette="mint" />
        <g transform={`translate(960, 505) scale(${enter.toFixed(3)})`}>
          {[
            { dx: -470, title: "1 KIẾN CHÚA", sub: "Đẻ hàng nghìn trứng/ngày", color: "#FEE2E2", badge: "TRUNG TÂM" },
            { dx: 0, title: "KIẾN THỢ", sub: "Đào hang & kiếm thức ăn", color: "#FEF3C7", badge: "XÂY DỰNG" },
            { dx: 470, title: "KIẾN LÍNH", sub: "Canh gác bảo vệ tổ", color: "#DBEAFE", badge: "BẢO VỆ" },
          ].map((card, i) => {
            const cardPop = localFrame >= i * 16 ? Math.min(1, easeOutBack((localFrame - i * 16) / 14)) : 0.01;
            return (
              <g key={`col_${i}`} transform={`translate(${card.dx}, 0) scale(${cardPop.toFixed(3)})`}>
                <rect x={-195} y={-215} width={390} height={415} rx={30} fill="#141414" transform="translate(8, 10)" />
                <rect x={-195} y={-215} width={390} height={415} rx={30} fill="#FFFFFF" stroke="#141414" strokeWidth={4} />
                <circle cx={0} cy={-62} r={86} fill={card.color} stroke="#141414" strokeWidth={3.5} />
                {/* Biểu tượng kiến hoạt hình sống động 60fps */}
                <g transform={`translate(0, -56) scale(${(i === 0 ? 1.3 : i === 2 ? 1.15 : 1.0) * pulse}) rotate(${(Math.sin(frame * 0.07 + i) * 5).toFixed(1)})`}>
                  <ellipse cx={-28} cy={0} rx={22} ry={14} fill="#DC2626" stroke="#141414" strokeWidth={3} />
                  <ellipse cx={2} cy={0} rx={13} ry={10} fill="#EF4444" stroke="#141414" strokeWidth={3} />
                  <circle cx={26} cy={-2} r={i === 2 ? 17 : 13} fill="#B91C1C" stroke="#141414" strokeWidth={3} />
                  {i === 0 && <polygon points="18,-18 22,-32 28,-22 34,-32 38,-18" fill="#FACC15" stroke="#141414" strokeWidth={2.5} />}
                  <circle cx={31} cy={-6} r={3.5} fill="#FFFFFF" />
                  <circle cx={32} cy={-6} r={1.8} fill="#141414" />
                </g>
                <rect x={-95} y={48} width={190} height={34} rx={17} fill="#FACC15" stroke="#141414" strokeWidth={2.5} />
                <text x={0} y={71} textAnchor="middle" fill="#141414" fontSize={18} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                  {card.badge}
                </text>
                <text x={0} y={125} textAnchor="middle" fill="#141414" fontSize={28} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                  {card.title}
                </text>
                <text x={0} y={162} textAnchor="middle" fill="#475569" fontSize={20} fontWeight={700} fontFamily="'Be Vietnam Pro', sans-serif">
                  {card.sub}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    );
  }

  if (mode === "YARD_EVENING_CURIOUS") {
    const bubbleAppear = 105;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-yard-evening-curious">
        <CountrysideYardBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 780,
            y: groundY,
            scale: 0.96,
            facing: "left",
            pose: "standing",
            torsoTiltDeg: -4,
            walkWeight: 0,
            isSpeaking: isTalking,
            nodAmplitudeDeg: 3,
            nodFreq: 0.1,
            eyes: "curious",
            eyebrows: "inquisitive",
            mouth: "smile",
            holdingTarget: { rightGrip: { x: 750, y: groundY - 295 } },
          }}
        />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: 1385,
            y: groundY - 24,
            scale: 0.96,
            facing: "left",
            pose: "standing",
            torsoTiltDeg: 3,
            walkWeight: 0,
            nodAmplitudeDeg: 3.5,
            nodFreq: 0.11,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
          }}
        />
        <ComicSpeechBubble
          x={630}
          y={groundY - 495}
          mouthX={755}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Chưa xong đâu!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  // =========================================================================
  // HỒI 2: CUỘC PHẢN CÔNG & TỔ VỆ TINH (Beats 11–20)
  // =========================================================================
  if (mode === "BEDROOM_NIGHT_PLAN") {
    const bubbleAppear = 90;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    const bulbPulse = 1 + Math.sin(frame * 0.15) * 0.08;
    return (
      <g id="v15-bedroom-night-plan">
        <BedroomIndoorBackdrop timeOfDay="NIGHT" frame={frame} groundY={groundY} />
        {/* Nhân vật BOY ngồi suy nghĩ kế hoạch bên mép giường */}
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 1090,
            y: groundY,
            scale: 0.95,
            facing: "left",
            pose: "standing",
            customHipY: -120,
            torsoTiltDeg: -6,
            walkWeight: 0,
            isSpeaking: isTalking,
            nodAmplitudeDeg: 3.2,
            nodFreq: 0.13,
            eyes: "curious",
            eyebrows: "inquisitive",
            mouth: "smile",
            holdingTarget: { rightGrip: { x: 1055, y: groundY - 255 } },
          }}
        />
        {/* Bóng đèn nảy ý tưởng sáng lấp lánh 60fps */}
        <g transform={`translate(935, 365) scale(${bulbPulse.toFixed(3)})`}>
          <circle cx={0} cy={0} r={44} fill="#FEF08A" opacity={0.35} />
          <circle cx={0} cy={0} r={28} fill="#FACC15" stroke="#141414" strokeWidth={3.5} />
          <rect x={-9} y={24} width={18} height={11} rx={3} fill="#94A3B8" stroke="#141414" strokeWidth={2.5} />
        </g>
        <ComicSpeechBubble
          x={965}
          y={groundY - 470}
          mouthX={1068}
          mouthY={groundY - 265}
          headTopY={groundY - 360}
          text="Mai biết tay tôi!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "YARD_MORNING_MARCH") {
    const walkT = smoothstep(0.02, 0.85, u);
    const boyX = lerpNum(1220, 440, walkT);
    const walkWeight = u <= 0.86 ? Math.min(smoothstep(0.02, 0.08, u), 1 - smoothstep(0.78, 0.86, u)) : 0;
    const walkCycle = (Math.abs(1220 - boyX) / STRIDE_CYCLE_PX) % 1;
    const bucketX = boyX - 65;
    const bucketY = groundY - 175 + Math.sin(walkCycle * Math.PI * 2) * 8;
    return (
      <g id="v15-yard-morning-march">
        <CountrysideYardBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        {/* Chiếc xô nước nhựa xanh mang theo */}
        <g transform={`translate(${bucketX.toFixed(1)}, ${bucketY.toFixed(1)})`}>
          <path d="M -22,-22 Q 0,-42 22,-22" fill="none" stroke="#141414" strokeWidth={3} />
          <polygon points="-24,-22 24,-22 18,22 -18,22" fill="#38BDF8" stroke="#141414" strokeWidth={3} />
        </g>
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "left",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            torsoTiltDeg: walkWeight * 8,
            walkCycleProgress: walkCycle,
            walkWeight,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            holdingTarget: { rightGrip: { x: bucketX, y: bucketY - 26 } },
          }}
        />
      </g>
    );
  }

  if (mode === "GARDEN_WATER_SPLASH") {
    const boyX = 885;
    const pourT = smoothstep(0.16, 0.45, u);
    const bucketRot = lerpNum(0, 58, pourT);
    const bubbleAppear = 130;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-garden-water-splash">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <FireAntMound x={1230} y={groundY} swarmLevel="calm" localFrame={localFrame} u={u} />
        {/* Dòng nước dội xối xả 60fps lên mô đất */}
        {u >= 0.25 && u <= 0.88 && (
          <g>
            <path
              d={`M 1030,635 Q 1125,650 1205,745`}
              fill="none"
              stroke="#38BDF8"
              strokeWidth={18}
              strokeLinecap="round"
              opacity={0.85}
            />
            {[0, 1, 2, 3, 4, 5].map((d) => {
              const dt = ((localFrame * 0.08 + d * 0.17) % 1);
              const dx = 1205 + Math.cos(d * 1.1) * dt * 75;
              const dy = 748 - Math.sin(dt * Math.PI) * 52;
              return <circle key={`drop_${d}`} cx={dx} cy={dy} r={6 * (1 - dt * 0.5)} fill="#7DD3FC" stroke="#0284C7" strokeWidth={2} />;
            })}
          </g>
        )}
        {/* Xô nước đang nghiêng dội */}
        <g transform={`translate(1005, 632) rotate(${bucketRot.toFixed(1)})`}>
          <polygon points="-24,-22 24,-22 18,22 -18,22" fill="#38BDF8" stroke="#141414" strokeWidth={3} />
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
            torsoTiltDeg: 10 + pourT * 8,
            walkWeight: 0,
            isSpeaking: isTalking,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            holdingTarget: { rightGrip: { x: 995, y: 630 }, leftGrip: { x: 970, y: 642 } },
          }}
        />
        <ComicSpeechBubble
          x={boyX + 125}
          y={groundY - 495}
          mouthX={boyX + 35}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Xong phim nhé!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "GARDEN_SATELLITE_MOUNDS") {
    const walkT = smoothstep(0.03, 0.36, u);
    const boyX = lerpNum(440, 740, walkT);
    const walkWeight = u <= 0.38 ? Math.min(smoothstep(0.03, 0.1, u), 1 - smoothstep(0.3, 0.38, u)) : 0;
    const walkCycle = (Math.abs(boyX - 440) / STRIDE_CYCLE_PX) % 1;
    const pop1 = u >= 0.32 ? easeOutBack(Math.min(1, (u - 0.32) / 0.12)) : 0.01;
    const pop2 = u >= 0.44 ? easeOutBack(Math.min(1, (u - 0.44) / 0.12)) : 0.01;
    const bubbleAppear = 125;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-garden-satellite-mounds">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        {/* Mô chính + 2 mô vệ tinh mới mọc phồng lên quanh gốc xoài! */}
        <FireAntMound x={1235} y={groundY} scale={1.0} swarmLevel="emerging" localFrame={localFrame} u={u} />
        <g transform={`translate(1030, ${groundY + 14}) scale(${(0.72 * pop1).toFixed(3)})`}>
          <FireAntMound x={0} y={0} swarmLevel="emerging" localFrame={localFrame} u={u} />
        </g>
        <g transform={`translate(1415, ${groundY + 24}) scale(${(0.68 * pop2).toFixed(3)})`}>
          <FireAntMound x={0} y={0} swarmLevel="emerging" localFrame={localFrame} u={u} />
        </g>
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            torsoTiltDeg: walkWeight > 0.04 ? 6 : -6,
            walkCycleProgress: walkCycle,
            walkWeight,
            isSpeaking: isTalking,
            eyes: u >= 0.34 ? "surprised" : "curious",
            eyebrows: "raised",
            mouth: "circleOpen",
            sweatDrop: u >= 0.34,
          }}
        />
        <ComicSpeechBubble
          x={boyX + 125}
          y={groundY - 495}
          mouthX={boyX + 28}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Ơ, mọc thêm tổ?!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "UNDERGROUND_EGG_EVACUATION") {
    return (
      <g id="v15-underground-egg-evacuation">
        <UndergroundCrossSectionStage frame={frame} localFrame={localFrame} showAnts={true} evacuateEggs={true} />
      </g>
    );
  }

  if (mode === "EXPLAIN_SATELLITE_NETWORK") {
    const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
    const dashOffset = -(frame * 2.2) % 40;
    return (
      <g id="v15-explain-satellite-network">
        <ExplainerPolkaDotBackdrop palette="lavender" />
        <g transform={`translate(960, 505) scale(${enter.toFixed(3)})`}>
          <rect x={-640} y={-245} width={1280} height={470} rx={36} fill="#141414" transform="translate(8, 10)" />
          <rect x={-640} y={-245} width={1280} height={470} rx={36} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
          {/* Mặt đất ngang */}
          <rect x={-595} y={-22} width={1190} height={22} rx={6} fill="#86EFAC" stroke="#141414" strokeWidth={3} />
          <rect x={-595} y={0} width={1190} height={195} rx={16} fill="#78350F" opacity={0.18} />
          {/* Đường hầm nối ngầm giữa 3 tổ vệ tinh chạy sáng 60fps */}
          <path
            d="M -380,-4 Q -190,115 0,48 Q 190,120 380,-4"
            fill="none"
            stroke="#EA580C"
            strokeWidth={14}
            strokeLinecap="round"
            opacity={0.3}
          />
          <path
            d="M -380,-4 Q -190,115 0,48 Q 190,120 380,-4"
            fill="none"
            stroke="#DC2626"
            strokeWidth={6}
            strokeDasharray="16 12"
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
          {/* 3 mô đất nối mạng */}
          {[
            { x: -380, label: "TỔ VỆ TINH A", s: 0.78 },
            { x: 0, label: "TỔ CHÍNH", s: 1.05 },
            { x: 380, label: "TỔ VỆ TINH B", s: 0.78 },
          ].map((m, idx) => (
            <g key={`sat_m_${idx}`} transform={`translate(${m.x}, -12)`}>
              <path
                d={`M ${-95 * m.s},0 Q ${-82 * m.s},${-82 * m.s} 0,${-88 * m.s} Q ${82 * m.s},${-82 * m.s} ${95 * m.s},0 Z`}
                fill="#B45309"
                stroke="#141414"
                strokeWidth={3.5}
              />
              <text x={0} y={-105 * m.s} textAnchor="middle" fill="#141414" fontSize={23} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                {m.label}
              </text>
            </g>
          ))}
          <text x={0} y={155} textAnchor="middle" fill="#9A3412" fontSize={26} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            ĐƯỜNG HẦM NGẦM LIÊN THÔNG — DI TẢN TỨC THÌ
          </text>
        </g>
      </g>
    );
  }

  if (mode === "GARDEN_FOOTSTEP_VIBRATION") {
    const walkT = smoothstep(0.05, 0.78, u);
    const boyX = lerpNum(460, 885, walkT);
    const walkWeight = u <= 0.80 ? Math.min(smoothstep(0.05, 0.12, u), 1 - smoothstep(0.70, 0.80, u)) : 0;
    const walkCycle = (Math.abs(boyX - 460) / STRIDE_CYCLE_PX) % 1;
    return (
      <g id="v15-garden-footstep-vibration">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <FireAntMound x={1235} y={groundY} swarmLevel="emerging" localFrame={localFrame} u={u} />
        {/* Vòng sóng rung chấn lan tỏa từ bước chân xuyên mặt cỏ tới mô đất */}
        {[0, 1, 2].map((r) => {
          const p = (localFrame * 0.032 + r * 0.33) % 1;
          return (
            <ellipse
              key={`vib_${r}`}
              cx={boyX + 18}
              cy={groundY + 4}
              rx={35 + p * 360}
              ry={10 + p * 48}
              fill="none"
              stroke="#FACC15"
              strokeWidth={4.5 * (1 - p * 0.6)}
              opacity={(1 - p) * 0.85}
            />
          );
        })}
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            torsoTiltDeg: 9,
            walkCycleProgress: walkCycle,
            walkWeight,
            eyes: "curious",
            eyebrows: "inquisitive",
            mouth: "line",
          }}
        />
      </g>
    );
  }

  if (mode === "EXPLAIN_VIBRATION_CO2") {
    const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
    return (
      <g id="v15-explain-vib-co2">
        <ExplainerPolkaDotBackdrop palette="cream" />
        <g transform={`translate(960, 495) scale(${enter.toFixed(3)})`}>
          {/* Thẻ Trái: Rung động bước chân */}
          <g transform="translate(-370, 0)">
            <rect x={-285} y={-225} width={570} height={435} rx={34} fill="#141414" transform="translate(8, 10)" />
            <rect x={-285} y={-225} width={570} height={435} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
            {[0, 1, 2].map((w) => {
              const p = (frame * 0.03 + w * 0.33) % 1;
              return (
                <ellipse key={`sw_${w}`} cx={0} cy={35} rx={38 + p * 165} ry={14 + p * 42} fill="none" stroke="#F59E0B" strokeWidth={5} opacity={1 - p} />
              );
            })}
            <path d="M -32,-120 L -32,-10 L 42,-10 Q 52,18 -40,18 L -52,-120 Z" fill="#334155" stroke="#141414" strokeWidth={4} />
            <text x={0} y={145} textAnchor="middle" fill="#141414" fontSize={28} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
              RUNG ĐỘNG BƯỚC CHÂN
            </text>
          </g>
          {/* Thẻ Phải: Luồng khí CO2 từ hơi thở */}
          <g transform="translate(370, 0)">
            <rect x={-285} y={-225} width={570} height={435} rx={34} fill="#141414" transform="translate(8, 10)" />
            <rect x={-285} y={-225} width={570} height={435} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
            {[0, 1, 2, 3].map((b) => {
              const p = (frame * 0.025 + b * 0.25) % 1;
              const bx = -135 + p * 255;
              const by = -45 + Math.sin(p * Math.PI * 2 + b) * 32;
              return (
                <g key={`co2_${b}`} transform={`translate(${bx.toFixed(1)}, ${by.toFixed(1)})`} opacity={Math.sin(p * Math.PI)}>
                  <circle cx={0} cy={0} r={24} fill="#DBEAFE" stroke="#2563EB" strokeWidth={3} />
                  <text x={0} y={7} textAnchor="middle" fill="#1E40AF" fontSize={18} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                    CO₂
                  </text>
                </g>
              );
            })}
            <MagnifyingGlassOverlay x={125} y={-35} radius={68} handleAngleDeg={48} localFrame={localFrame} />
            <text x={0} y={145} textAnchor="middle" fill="#141414" fontSize={28} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
              HƠI THỞ &amp; KHÍ CO₂
            </text>
          </g>
        </g>
      </g>
    );
  }

  if (mode === "GARDEN_SCOUT_CLIMB_SHOE") {
    const boyX = 955;
    const bubbleAppear = 90;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-garden-scout-climb">
        <SimpleGrassFieldBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <FireAntMound x={1155} y={groundY} scale={0.82} swarmLevel="emerging" localFrame={localFrame} u={u} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: 14,
            walkWeight: 0,
            isSpeaking: isTalking,
            eyes: "curious",
            eyebrows: "inquisitive",
            mouth: "line",
            pupilGaze: { x: 0.7, y: 0.7 },
          }}
        />
        {/* Hàng kiến lửa âm thầm bò dọc theo ống chân cậu bé (không cắn ngay!) */}
        {[0, 1, 2, 3, 4, 5].map((a) => {
          const climbP = smoothstep(0.08 + a * 0.08, 0.92, u);
          const ay = lerpNum(groundY - 4, groundY - 125 - a * 12, climbP);
          const ax = boyX + 18 + Math.sin(localFrame * 0.2 + a) * 3;
          return (
            <ellipse key={`leg_ant_${a}`} cx={ax} cy={ay} rx={4.5} ry={2.8} fill="#DC2626" stroke="#141414" strokeWidth={1.2} />
          );
        })}
        <ComicSpeechBubble
          x={boyX - 150}
          y={groundY - 495}
          mouthX={boyX + 20}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Im ắng lạ nha..."
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "GARDEN_SURPRISE_HOP") {
    const hopHeight = Math.abs(Math.sin(localFrame * 0.24)) * 74;
    const boyX = lerpNum(940, 740, smoothstep(0.05, 0.85, u));
    const bubbleAppear = 18;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-garden-surprise-hop">
        <SimpleGrassFieldBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <FireAntMound x={1220} y={groundY} swarmLevel="boiling" localFrame={localFrame} u={u} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.98,
            facing: "left",
            pose: "jumping",
            flightLift: hopHeight,
            torsoTiltDeg: -10,
            walkWeight: 0,
            isSpeaking: isTalking,
            eyes: "surprised",
            eyebrows: "worried",
            mouth: "gasp",
            sweatDrop: true,
            shiver: true,
            shiverDarkStage: false,
            shiverFrame: frame,
          }}
        />
        <ComicSpeechBubble
          x={boyX - 150}
          y={groundY - 525 - hopHeight * 0.25}
          mouthX={boyX - 24}
          mouthY={groundY - 320 - hopHeight}
          headTopY={groundY - 410 - hopHeight}
          text="ỐI GIỜI ƠI!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  // =========================================================================
  // HỒI 3: CHIẾN THUẬT ĐỒNG LOẠT & TRẬN MƯA LỚN (Beats 21–30)
  // =========================================================================
  if (mode === "EXPLAIN_SYNC_ATTACK") {
    const step = u < 0.34 ? 1 : u < 0.66 ? 2 : 3;
    return (
      <g id="v15-explain-sync-attack">
        <ExplainerPolkaDotBackdrop palette="mint" />
        <g transform="translate(960, 500)">
          {[
            { dx: -470, num: "BƯỚC 1", title: "LEO LÊN ÂM THẦM", active: step >= 1, color: "#FEF9C3" },
            { dx: 0, num: "BƯỚC 2", title: "ĐỢI ĐỦ QUÂN SỐ", active: step >= 2, color: "#FFEDD5" },
            { dx: 470, num: "BƯỚC 3", title: "CẮN ĐỒNG LOẠT!", active: step >= 3, color: "#FEE2E2" },
          ].map((c, idx) => (
            <g key={`sync_${idx}`} transform={`translate(${c.dx}, 0) scale(${c.active ? 1.03 : 0.94})`} opacity={c.active ? 1 : 0.55}>
              <rect x={-195} y={-205} width={390} height={395} rx={30} fill="#141414" transform="translate(8, 10)" />
              <rect x={-195} y={-205} width={390} height={395} rx={30} fill={c.active ? c.color : "#FFFFFF"} stroke="#141414" strokeWidth={4} />
              <rect x={-82} y={-172} width={164} height={42} rx={21} fill={idx === 2 && c.active ? "#DC2626" : "#141414"} />
              <text x={0} y={-144} textAnchor="middle" fill="#FFFFFF" fontSize={21} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                {c.num}
              </text>
              {/* Biểu tượng đàn kiến nhịp đồng bộ */}
              {[-55, 0, 55].map((ax, ai) => (
                <g
                  key={`sa_${ai}`}
                  transform={`translate(${ax}, ${-30 + (idx === 2 && c.active ? Math.sin(frame * 0.45) * 6 : Math.sin(frame * 0.1 + ai) * 4)})`}
                >
                  <ellipse cx={0} cy={0} rx={16} ry={10} fill="#DC2626" stroke="#141414" strokeWidth={2.5} />
                  <circle cx={14} cy={-2} r={8} fill="#991B1B" stroke="#141414" strokeWidth={2.2} />
                </g>
              ))}
              <text x={0} y={115} textAnchor="middle" fill="#141414" fontSize={27} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                {c.title}
              </text>
            </g>
          ))}
        </g>
      </g>
    );
  }

  if (mode === "YARD_GRANDPA_RESCUE") {
    const walkT = smoothstep(0.04, 0.55, u);
    const grandpaX = lerpNum(1415, 1045, walkT);
    const grandpaY = lerpNum(groundY - 24, groundY, walkT);
    const walkWeight = u <= 0.56 ? Math.min(smoothstep(0.04, 0.12, u), 1 - smoothstep(0.46, 0.56, u)) : 0;
    const walkCycle = (Math.abs(1415 - grandpaX) / STRIDE_CYCLE_PX) % 1;
    const bubbleAppear = 110;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-yard-grandpa-rescue">
        <CountrysideYardBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 760,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "crouching",
            crouchDepth: 26,
            torsoTiltDeg: 10,
            walkWeight: 0,
            eyes: "closed",
            eyebrows: "worried",
            mouth: "line",
            sweatDrop: true,
          }}
        />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: grandpaX,
            y: grandpaY,
            scale: 0.98,
            facing: "left",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            torsoTiltDeg: walkWeight > 0.04 ? 8 : 6,
            walkCycleProgress: walkCycle,
            walkWeight,
            isSpeaking: isTalking,
            nodAmplitudeDeg: 3.5,
            nodFreq: 0.12,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
          }}
        />
        <ComicSpeechBubble
          x={grandpaX - 150}
          y={grandpaY - 495}
          mouthX={grandpaX - 32}
          mouthY={grandpaY - 315}
          headTopY={grandpaY - 405}
          text="Để ông bôi cho!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "YARD_GRANDPA_WISDOM") {
    const bubbleAppear = 85;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-yard-grandpa-wisdom">
        <CountrysideYardBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 785,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "standing",
            walkWeight: 0,
            nodAmplitudeDeg: 4,
            nodFreq: 0.11,
            eyes: "curious",
            eyebrows: "neutral",
            mouth: "smile",
          }}
        />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: 1180,
            y: groundY,
            scale: 0.98,
            facing: "left",
            pose: "standing",
            walkWeight: 0,
            isSpeaking: isTalking,
            nodAmplitudeDeg: 3.2,
            nodFreq: 0.12,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            holdingTarget: { leftGrip: { x: 1090, y: groundY - 235 + Math.sin(frame * 0.12) * 8 } },
          }}
        />
        <ComicSpeechBubble
          x={1165}
          y={groundY - 505}
          mouthX={1150}
          mouthY={groundY - 315}
          headTopY={groundY - 405}
          text="Quan sát chứ đừng phá!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "BEDROOM_GRAB_MAGNIFIER") {
    const walkT = smoothstep(0.05, 0.55, u);
    const boyX = lerpNum(1030, 825, walkT);
    const walkWeight = u <= 0.57 ? Math.min(smoothstep(0.05, 0.12, u), 1 - smoothstep(0.47, 0.57, u)) : 0;
    const walkCycle = (Math.abs(1030 - boyX) / STRIDE_CYCLE_PX) % 1;
    const bubbleAppear = 105;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-bedroom-grab-magnifier">
        <BedroomIndoorBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "left",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            walkCycleProgress: walkCycle,
            walkWeight,
            isSpeaking: isTalking,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            blush: true,
            holdingTarget: { rightGrip: { x: boyX - 88, y: groundY - 265 } },
          }}
        />
        {/* Kính lúp trên tay cậu bé */}
        <g transform={`translate(${(boyX - 110).toFixed(1)}, ${groundY - 285})`}>
          <line x1={12} y1={14} x2={34} y2={38} stroke="#78350F" strokeWidth={8} strokeLinecap="round" />
          <circle cx={0} cy={0} r={24} fill="#E0F2FE" fillOpacity={0.55} stroke="#141414" strokeWidth={4} />
        </g>
        <ComicSpeechBubble
          x={boyX - 140}
          y={groundY - 495}
          mouthX={boyX - 24}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Đi thám hiểm thôi!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "GARDEN_MAGNIFIER_OBSERVE") {
    const boyX = 875;
    return (
      <g id="v15-garden-magnifier-observe">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <FireAntMound x={1235} y={groundY} swarmLevel="emerging" localFrame={localFrame} u={u} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "crouching",
            crouchDepth: 34,
            torsoTiltDeg: 18,
            walkWeight: 0,
            nodAmplitudeDeg: 2.5,
            nodFreq: 0.09,
            eyes: "curious",
            eyebrows: "inquisitive",
            mouth: "smile",
            holdingTarget: { rightGrip: { x: boyX + 98, y: groundY - 195 } },
          }}
        />
        <MagnifyingGlassOverlay x={boyX + 150} y={groundY - 210} radius={52} handleAngleDeg={145} localFrame={localFrame} />
      </g>
    );
  }

  if (mode === "EXPLAIN_SOLDIER_VS_WORKER") {
    const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
    return (
      <g id="v15-explain-soldier-worker">
        <ExplainerPolkaDotBackdrop palette="cream" />
        <g transform={`translate(960, 495) scale(${enter.toFixed(3)})`}>
          {[
            { dx: -365, title: "KIẾN THỢ", sub: "Nhanh nhẹn • Tha thức ăn & chăm trứng", bigHead: false },
            { dx: 365, title: "KIẾN LÍNH", sub: "Đầu to • Hàm khỏe canh gác tiền tiêu", bigHead: true },
          ].map((item, i) => (
            <g key={`sw_card_${i}`} transform={`translate(${item.dx}, 0)`}>
              <rect x={-275} y={-225} width={550} height={435} rx={34} fill="#141414" transform="translate(8, 10)" />
              <rect x={-275} y={-225} width={550} height={435} rx={34} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
              <g transform={`translate(0, -45) rotate(${(Math.sin(frame * 0.08 + i * 2) * 5).toFixed(1)})`}>
                <ellipse cx={-54} cy={0} rx={38} ry={25} fill="#DC2626" stroke="#141414" strokeWidth={4} />
                <ellipse cx={2} cy={0} rx={24} ry={17} fill="#EF4444" stroke="#141414" strokeWidth={4} />
                <circle cx={46} cy={-2} r={item.bigHead ? 32 : 21} fill="#B91C1C" stroke="#141414" strokeWidth={4} />
                {item.bigHead && (
                  <path d="M 74,-12 L 96,-20 M 74,8 L 96,16" stroke="#141414" strokeWidth={5} strokeLinecap="round" />
                )}
                <circle cx={54} cy={-10} r={6} fill="#FFFFFF" />
                <circle cx={56} cy={-10} r={3} fill="#141414" />
              </g>
              <MagnifyingGlassOverlay x={68} y={-55} radius={74} handleAngleDeg={46} localFrame={localFrame} />
              <text x={0} y={128} textAnchor="middle" fill="#141414" fontSize={32} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                {item.title}
              </text>
              <text x={0} y={168} textAnchor="middle" fill="#475569" fontSize={21} fontWeight={700} fontFamily="'Be Vietnam Pro', sans-serif">
                {item.sub}
              </text>
            </g>
          ))}
        </g>
      </g>
    );
  }

  if (mode === "GARDEN_ANTS_CARRY_CATERPILLAR") {
    const carryX = lerpNum(640, 1140, smoothstep(0.05, 0.92, u));
    const bubbleAppear = 100;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-garden-carry-caterpillar">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <FireAntMound x={1270} y={groundY} swarmLevel="calm" localFrame={localFrame} u={u} />
        {/* Chiếc lá/con sâu xanh lớn được 10 chú kiến đỏ khiêng đều nhịp về tổ */}
        <g transform={`translate(${carryX.toFixed(1)}, ${(groundY - 22 + Math.sin(frame * 0.25) * 3).toFixed(1)})`}>
          <ellipse cx={0} cy={-16} rx={68} ry={22} fill="#84CC16" stroke="#141414" strokeWidth={3.5} />
          <path d="M -45,-16 Q 0,-28 45,-16" fill="none" stroke="#4D7C0F" strokeWidth={3} />
          {[-54, -36, -18, 0, 18, 36, 54].map((ax, i) => (
            <ellipse key={`carry_ant_${i}`} cx={ax} cy={12 + (i % 2) * 4} rx={6} ry={3.5} fill="#DC2626" stroke="#141414" strokeWidth={1.5} />
          ))}
        </g>
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 470,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: 8,
            walkWeight: 0,
            isSpeaking: isTalking,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            blush: true,
          }}
        />
        <ComicSpeechBubble
          x={565}
          y={groundY - 495}
          mouthX={495}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Khỏe thật sự!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "EXPLAIN_PHEROMONE_TRAIL") {
    const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
    return (
      <g id="v15-explain-pheromone-trail">
        <ExplainerPolkaDotBackdrop palette="lavender" />
        <g transform={`translate(960, 500) scale(${enter.toFixed(3)})`}>
          <rect x={-640} y={-235} width={1280} height={455} rx={36} fill="#141414" transform="translate(8, 10)" />
          <rect x={-640} y={-235} width={1280} height={455} rx={36} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
          {/* Đường mùi Pheromone phát sáng lấp lánh */}
          <path d="M -520,65 Q -240,-95 0,25 T 520,-35" fill="none" stroke="#C084FC" strokeWidth={30} strokeLinecap="round" opacity={0.32} />
          <path d="M -520,65 Q -240,-95 0,25 T 520,-35" fill="none" stroke="#9333EA" strokeWidth={6} strokeDasharray="10 14" strokeDashoffset={-(frame * 2) % 48} strokeLinecap="round" />
          {/* Hàng 8 kiến đỏ đi nối đuôi theo chính xác vệt Pheromone */}
          {Array.from({ length: 8 }).map((_, i) => {
            const t = ((frame * 0.004 + i * 0.125) % 1);
            const ax = lerpNum(-510, 510, t);
            const ay = 15 + Math.sin(t * Math.PI * 2.5) * -68;
            return (
              <g key={`ph_ant_${i}`} transform={`translate(${ax.toFixed(1)}, ${ay.toFixed(1)})`}>
                <circle cx={-12} cy={0} r={14} fill="#FACC15" opacity={0.3} />
                <ellipse cx={-6} cy={0} rx={11} ry={6.5} fill="#DC2626" stroke="#141414" strokeWidth={2} />
                <circle cx={9} cy={-1} r={6} fill="#991B1B" stroke="#141414" strokeWidth={2} />
              </g>
            );
          })}
          <text x={0} y={165} textAnchor="middle" fill="#6B21A8" fontSize={28} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            DẤU MÙI PHEROMONE DẪN ĐƯỜNG CHÍNH XÁC TỪNG BƯỚC
          </text>
        </g>
      </g>
    );
  }

  if (mode === "GARDEN_DARK_CLOUDS_RAIN") {
    return (
      <g id="v15-garden-heavy-rain">
        <SimpleGrassFieldBackdrop timeOfDay="NIGHT" weather="RAIN" frame={frame} groundY={groundY} />
        <FireAntMound x={1235} y={groundY} swarmLevel="calm" localFrame={localFrame} u={u} />
      </g>
    );
  }

  if (mode === "YARD_WATCH_RAIN_WINDOW") {
    const bubbleAppear = 85;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-watch-rain-window">
        <BedroomIndoorBackdrop timeOfDay="NIGHT" frame={frame} groundY={groundY} rainOutside={true} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 685,
            y: groundY,
            scale: 0.96,
            facing: "left",
            pose: "standing",
            torsoTiltDeg: 8,
            walkWeight: 0,
            isSpeaking: isTalking,
            eyes: "wide",
            eyebrows: "worried",
            mouth: "line",
            sweatDrop: true,
          }}
        />
        <ComicSpeechBubble
          x={840}
          y={groundY - 495}
          mouthX={665}
          mouthY={groundY - 310}
          headTopY={groundY - 405}
          text="Tổ kiến ngập mất rồi!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  // =========================================================================
  // HỒI 4: CHIẾC BÈ KIẾN SỐNG & BÀI HỌC DƯỚI GỐC XOÀI (Beats 31–40)
  // =========================================================================
  if (mode === "GARDEN_FLOODED_MORNING") {
    const walkT = smoothstep(0.04, 0.72, u);
    const boyX = lerpNum(320, 690, walkT);
    const grandpaX = lerpNum(180, 520, walkT);
    const walkWeight = u <= 0.74 ? Math.min(smoothstep(0.04, 0.12, u), 1 - smoothstep(0.64, 0.74, u)) : 0;
    const walkCycle = (Math.abs(boyX - 320) / STRIDE_CYCLE_PX) % 1;
    return (
      <g id="v15-garden-flooded-morning">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" weather="FLOOD" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: grandpaX,
            y: groundY,
            scale: 0.98,
            facing: "right",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            walkCycleProgress: walkCycle,
            walkWeight,
            eyes: "curious",
            eyebrows: "neutral",
            mouth: "smile",
          }}
        />
        <VietnameseConicalHat x={grandpaX} y={groundY - 398} scale={0.95} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.95,
            facing: "right",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            walkCycleProgress: (walkCycle + 0.35) % 1,
            walkWeight,
            eyes: "wide",
            eyebrows: "worried",
            mouth: "line",
          }}
        />
        <VietnameseConicalHat x={boyX} y={groundY - 388} scale={0.88} />
      </g>
    );
  }

  if (mode === "GARDEN_RED_PATCH_WATER") {
    const raftX = lerpNum(1335, 1175, smoothstep(0.05, 0.95, u));
    const bubbleAppear = 75;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-garden-red-patch">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" weather="FLOOD" frame={frame} groundY={groundY} />
        <FloatingLivingAntRaft x={raftX} y={818} scale={0.95} frame={frame} />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{ x: 520, y: groundY, scale: 0.98, facing: "right", pose: "standing", walkWeight: 0, eyes: "wide", eyebrows: "raised", mouth: "smile" }}
        />
        <VietnameseConicalHat x={520} y={groundY - 398} scale={0.95} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 700,
            y: groundY,
            scale: 0.95,
            facing: "right",
            pose: "pointing",
            pointingTarget: { x: raftX, y: 810 },
            walkWeight: 0,
            isSpeaking: isTalking,
            eyes: "surprised",
            eyebrows: "raised",
            mouth: "circleOpen",
          }}
        />
        <VietnameseConicalHat x={700} y={groundY - 388} scale={0.88} />
        <ComicSpeechBubble
          x={745}
          y={groundY - 525}
          mouthX={725}
          mouthY={groundY - 310}
          headTopY={groundY - 435}
          text="Ông ơi, nhìn kìa!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "EXPLAIN_LIVING_ANT_RAFT") {
    const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
    const waveShift = (frame * 2.2) % 160;
    return (
      <g id="v15-explain-living-raft">
        <ExplainerPolkaDotBackdrop palette="mint" />
        <g transform={`translate(960, 500) scale(${enter.toFixed(3)})`}>
          <rect x={-640} y={-235} width={1280} height={455} rx={36} fill="#141414" transform="translate(8, 10)" />
          <rect x={-640} y={-235} width={1280} height={455} rx={36} fill="#E0F2FE" stroke="#141414" strokeWidth={4.5} />
          {/* Mặt sóng nước chuyển động 60fps */}
          <path
            d={`M -640,45 Q ${-480 + waveShift * 0.3},18 -320,45 T 0,45 T 320,45 T 640,45 L 640,220 L -640,220 Z`}
            fill="#38BDF8"
            opacity={0.75}
          />
          <FloatingLivingAntRaft x={0} y={24} scale={2.2} frame={frame} />
          <text x={0} y={-155} textAnchor="middle" fill="#141414" fontSize={30} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            KIẾN THỢ MÓC CHÂN THÀNH BÈ — GIỮ TRỨNG &amp; KIẾN CHÚA KHÔ RÁO!
          </text>
        </g>
      </g>
    );
  }

  if (mode === "EXPLAIN_AIR_BUBBLE_PHYSICS") {
    const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
    return (
      <g id="v15-explain-air-bubbles">
        <ExplainerPolkaDotBackdrop palette="cream" />
        <g transform={`translate(960, 495) scale(${enter.toFixed(3)})`}>
          <rect x={-600} y={-225} width={1200} height={445} rx={36} fill="#141414" transform="translate(8, 10)" />
          <rect x={-600} y={-225} width={1200} height={445} rx={36} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
          {/* Lớp nước bên dưới + Bọt khí bạc bao quanh thân kiến */}
          <rect x={-565} y={10} width={1130} height={175} rx={22} fill="#BAE6FD" opacity={0.75} />
          <g transform={`translate(0, ${(Math.sin(frame * 0.08) * 6).toFixed(1)})`}>
            {/* Vầng bọt khí bạc giữ nổi */}
            <ellipse cx={0} cy={12} rx={165} ry={66} fill="#F0F9FF" stroke="#0284C7" strokeWidth={4} strokeDasharray="10 8" />
            {[-110, -55, 10, 70, 120].map((bx, i) => (
              <circle
                key={`airb_${i}`}
                cx={bx}
                cy={48 + Math.sin(frame * 0.14 + i) * 7}
                r={13 + (i % 2) * 5}
                fill="#FFFFFF"
                stroke="#0284C7"
                strokeWidth={2.5}
              />
            ))}
            {/* Chú kiến phóng đại với lớp lông li ti giữ bọt khí */}
            <ellipse cx={-58} cy={-4} rx={44} ry={28} fill="#DC2626" stroke="#141414" strokeWidth={4} />
            <ellipse cx={6} cy={-4} rx={26} ry={18} fill="#EF4444" stroke="#141414" strokeWidth={4} />
            <circle cx={52} cy={-6} r={24} fill="#B91C1C" stroke="#141414" strokeWidth={4} />
          </g>
          <MagnifyingGlassOverlay x={15} y={-8} radius={132} handleAngleDeg={42} localFrame={localFrame} />
          <text x={0} y={168} textAnchor="middle" fill="#0369A1" fontSize={27} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            LỚP LÔNG LI TI GIỮ BỌT KHÍ BẠC — NỔI &amp; THỞ DƯỚI NƯỚC
          </text>
        </g>
      </g>
    );
  }

  if (mode === "GARDEN_RAFT_DRIFT_SAFE") {
    const raftX = lerpNum(560, 1185, smoothstep(0.04, 0.88, u));
    return (
      <g id="v15-garden-raft-drift-safe">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" weather="FLOOD" showRainbow={true} frame={frame} groundY={groundY} />
        <FloatingLivingAntRaft x={raftX} y={815} scale={1.08} frame={frame} />
      </g>
    );
  }

  if (mode === "GARDEN_GRANDPA_BOY_NONLA") {
    const bubbleAppear = 85;
    const isTalking = isComicBubbleActive(localFrame, bubbleAppear);
    return (
      <g id="v15-garden-grandpa-boy-nonla">
        <SimpleGrassFieldBackdrop timeOfDay="DAY" weather="FLOOD" showRainbow={true} frame={frame} groundY={groundY} />
        <FloatingLivingAntRaft x={1210} y={815} scale={0.95} frame={frame} />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{ x: 540, y: groundY, scale: 0.98, facing: "right", pose: "standing", walkWeight: 0, nodAmplitudeDeg: 3.5, nodFreq: 0.1, eyes: "happy", eyebrows: "neutral", mouth: "smile" }}
        />
        <VietnameseConicalHat x={540} y={groundY - 398} scale={0.95} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 735,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "standing",
            walkWeight: 0,
            isSpeaking: isTalking,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            blush: true,
          }}
        />
        <VietnameseConicalHat x={735} y={groundY - 388} scale={0.88} />
        <ComicSpeechBubble
          x={875}
          y={groundY - 525}
          mouthX={755}
          mouthY={groundY - 310}
          headTopY={groundY - 438}
          text="Tuyệt quá ông ơi!"
          localFrame={localFrame}
          appearFrame={bubbleAppear}
        />
      </g>
    );
  }

  if (mode === "YARD_SUNNY_NOTEBOOK") {
    return (
      <g id="v15-yard-sunny-notebook">
        <CountrysideYardBackdrop timeOfDay="DAY" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: 845,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: "standing",
            torsoTiltDeg: 10,
            walkWeight: 0,
            nodAmplitudeDeg: 2.8,
            nodFreq: 0.13,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            holdingTarget: { rightGrip: { x: 920, y: groundY - 210 + Math.sin(frame * 0.25) * 6 } },
          }}
        />
        {/* Quyển sổ ghi chép nhỏ trên tay */}
        <rect x={905} y={groundY - 235} width={54} height={64} rx={6} fill="#FEF9C3" stroke="#141414" strokeWidth={3.5} />
        <line x1={916} y1={groundY - 215} x2={948} y2={groundY - 215} stroke="#94A3B8" strokeWidth={2.5} />
        <line x1={916} y1={groundY - 198} x2={944} y2={groundY - 198} stroke="#94A3B8" strokeWidth={2.5} />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: 1120,
            y: groundY,
            scale: 0.98,
            facing: "left",
            pose: "standing",
            torsoTiltDeg: 6,
            walkWeight: 0,
            nodAmplitudeDeg: 4,
            nodFreq: 0.12,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
          }}
        />
      </g>
    );
  }

  if (mode === "EXPLAIN_SEVEN_DAY_NOTEBOOK") {
    const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
    const activeIdx = Math.min(3, Math.floor(smoothstep(0.08, 0.85, u) * 4));
    const entries = [
      { day: "NGÀY 1", note: "Phát hiện mô đất dưới gốc xoài" },
      { day: "NGÀY 3", note: "Mạng lưới tổ vệ tinh thông minh" },
      { day: "NGÀY 5", note: "Soi kính lúp & dấu mùi Pheromone" },
      { day: "NGÀY 7", note: "Chiếc bè kiến sống vượt cơn mưa" },
    ];
    return (
      <g id="v15-explain-seven-day-notebook">
        <ExplainerPolkaDotBackdrop palette="mint" />
        <g transform={`translate(960, 500) scale(${enter.toFixed(3)})`}>
          <rect x={-520} y={-235} width={1040} height={465} rx={32} fill="#141414" transform="translate(8, 10)" />
          <rect x={-520} y={-235} width={1040} height={465} rx={32} fill="#FFFBEB" stroke="#141414" strokeWidth={4.5} />
          <line x1={0} y1={-235} x2={0} y2={230} stroke="#CBD5E1" strokeWidth={4} />
          {entries.map((item, i) => {
            const isLeft = i < 2;
            const cx = isLeft ? -260 : 260;
            const cy = (i % 2 === 0 ? -95 : 85);
            const isDone = i <= activeIdx;
            return (
              <g key={`nb_${i}`} transform={`translate(${cx}, ${cy})`} opacity={isDone ? 1 : 0.42}>
                <rect x={-215} y={-62} width={430} height={124} rx={20} fill={isDone ? "#FFFFFF" : "#F1F5F9"} stroke="#141414" strokeWidth={3.5} />
                <rect x={-195} y={-44} width={118} height={36} rx={12} fill="#FACC15" stroke="#141414" strokeWidth={2.5} />
                <text x={-136} y={-19} textAnchor="middle" fill="#141414" fontSize={19} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
                  {item.day}
                </text>
                <text x={-192} y={32} textAnchor="start" fill="#141414" fontSize={22} fontWeight={800} fontFamily="'Be Vietnam Pro', sans-serif">
                  {item.note}
                </text>
              </g>
            );
          })}
        </g>
      </g>
    );
  }

  if (mode === "YARD_SUMMER_FAREWELL") {
    const walkT = smoothstep(0.18, 0.85, u);
    const boyX = lerpNum(760, 320, walkT);
    const walkWeight = u >= 0.18 && u <= 0.86 ? Math.min(smoothstep(0.18, 0.25, u), 1 - smoothstep(0.78, 0.86, u)) : 0;
    const walkCycle = (Math.abs(760 - boyX) / STRIDE_CYCLE_PX) % 1;
    return (
      <g id="v15-yard-summer-farewell">
        <CountrysideYardBackdrop timeOfDay="SUNSET" frame={frame} groundY={groundY} />
        <StickmanRig
          characterPreset="BOY"
          frame={frame}
          state={{
            x: boyX,
            y: groundY,
            scale: 0.96,
            facing: "right",
            pose: walkWeight > 0.04 ? "walking" : "standing",
            walkCycleProgress: walkCycle,
            walkWeight,
            waveRightArm: true,
            wavePhaseOffset: 0.4,
            nodAmplitudeDeg: 3,
            nodFreq: 0.12,
            eyes: "happy",
            eyebrows: "raised",
            mouth: "smile",
            blush: true,
          }}
        />
        <StickmanRig
          characterPreset="GRANDPA"
          frame={frame}
          state={{
            x: 1415,
            y: groundY - 26,
            scale: 0.96,
            facing: "left",
            pose: "standing",
            walkWeight: 0,
            waveRightArm: true,
            wavePhaseOffset: 1.8,
            nodAmplitudeDeg: 4,
            nodFreq: 0.11,
            eyes: "happy",
            eyebrows: "neutral",
            mouth: "smile",
          }}
        />
      </g>
    );
  }

  // Mặc định: EXPLAIN_WARM_SERIES_OUTRO
  const enter = localFrame < 14 ? easeOutBack(localFrame / 14) : 1;
  return (
    <g id="v15-explain-warm-outro">
      <ExplainerPolkaDotBackdrop palette="cream" />
      <g transform={`translate(960, 495) scale(${enter.toFixed(3)})`}>
        <rect x={-480} y={-215} width={960} height={415} rx={36} fill="#141414" transform="translate(8, 10)" />
        <rect x={-480} y={-215} width={960} height={415} rx={36} fill="#FFFFFF" stroke="#141414" strokeWidth={4.5} />
        {/* Cuốn sổ mùa hè + Kính lúp nhỏ ấm áp */}
        <g transform="translate(-210, -15)">
          <rect x={-120} y={-115} width={240} height={225} rx={22} fill="#FEF08A" stroke="#141414" strokeWidth={4} />
          <text x={0} y={-40} textAnchor="middle" fill="#141414" fontSize={26} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            SỔ TAY MÙA HÈ
          </text>
          <text x={0} y={32} textAnchor="middle" fill="#DC2626" fontSize={68} fontWeight={900} fontFamily="'Be Vietnam Pro', sans-serif">
            7 NGÀY
          </text>
          <text x={0} y={82} textAnchor="middle" fill="#475569" fontSize={22} fontWeight={800} fontFamily="'Be Vietnam Pro', sans-serif">
            DƯỚI GỐC XOÀI
          </text>
        </g>
        <g transform="translate(200, -15)">
          <circle cx={0} cy={0} r={118} fill="#DCFCE7" stroke="#141414" strokeWidth={4} />
          <path d="M -68,45 Q -56,-34 0,-38 Q 56,-34 68,45 Z" fill="#B45309" stroke="#141414" strokeWidth={3.5} />
          <MagnifyingGlassOverlay x={8} y={-6} radius={118} handleAngleDeg={42} localFrame={localFrame} />
        </g>
      </g>
    </g>
  );
};
