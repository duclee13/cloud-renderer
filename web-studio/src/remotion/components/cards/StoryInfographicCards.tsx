/**
 * STORY INFOGRAPHIC CARDS V9.0:
 * Bộ 10 Thẻ Ẩn Dụ Trực Quan & Nhãn Chú Thích Động (Visual Storytime & Infographic Cards)
 * Thiết kế theo phong cách kênh Kể chuyện / Giải thích hiện đại (ví dụ: "Điều gì xảy ra khi bỏ đói bọ ngựa 2 tháng"):
 * - Nền giấy kẻ ô (GRID_PAPER) hoặc nền chương tối kịch tính (#161822)
 * - Nét vẽ đậm 4px (#141414), bóng đổ khối rõ ràng, màu sắc tương phản mạnh
 * - 10 loại thẻ:
 *   1. CHAPTER_CARD: Thẻ tiêu đề chuyển chương / cột mốc thời gian kịch tính
 *   2. CALENDAR_FLIP_CARD: Thẻ lịch lật trang đếm ngày / tuần ("NGÀY 1" -> "TUẦN 4")
 *   3. GAUGE_RESERVE_CARD: Đồng hồ bán nguyệt 3 vùng Đỏ - Vàng - Xanh đo dự trữ năng lượng
 *   4. CANDLE_HOURGLASS_CARD: Ngọn nến cháy cạn dần & Đồng hồ cát chảy
 *   5. BALANCE_SCALE_CARD: Cán cân so sánh nghiêng ("KHÁT NƯỚC" vs "ĐÓI BỤNG", "SỢ CHẾT ĐÓI" vs "BỊ THƯƠNG")
 *   6. SIMPLE_CHART_CARD: Bảng biểu đồ đường giảm ("MỨC ĐỐT NĂNG LƯỢNG") hoặc cột đôi ("LÚC NO" vs "LÚC ĐÓI")
 *   7. TWO_DOORS_CARD: Hai cánh cửa ưu tiên sinh tồn ("DUY TRÌ SỰ SỐNG" sáng vàng vs "SINH SẢN" khóa xám)
 *   8. XRAY_BODY_CARD: Cắt lớp X-Quang cơ thể đốt dự trữ mỡ / cơ bắp kèm hộp chú thích & mũi tên cam
 *   9. STOPWATCH_TALLY_CARD: Đồng hồ bấm giờ quay nhanh & bảng khắc vạch đếm ngày (|||||||)
 *   10. CHARACTER_POSE_CARD: Nhãn chú thích kèm mũi tên chỉ (Callout Badge + Arrow), chữ tượng thanh ("CHỘP!", "HỤT!") & bóng suy nghĩ ("[?]")
 */

import React from "react";
import type { HornetNightSceneMode } from "../backgrounds/FlashlightNightStage";
import {
  SocketKey,
  RigSockets,
  UNIVERSAL_STAGE_CONSTANTS,
  resolveTargetSocketKey,
  MetricDisplayMode,
  DUAL_DECISION_PALETTE,
  computeDualDecisionMorph,
  inferMetricModeForCard,
  stripFabricatedPercentSuffix,
  formatStateBadgeLabel,
  computeSpeechSyncedWindow,
} from "../../../lib/v7/universalAnimationStandard";

export type StoryCardType =
  | "CHARACTER_POSE_CARD"
  | "CHAPTER_CARD"
  | "CALENDAR_FLIP_CARD"
  | "GAUGE_RESERVE_CARD"
  | "CANDLE_HOURGLASS_CARD"
  | "BALANCE_SCALE_CARD"
  | "SIMPLE_CHART_CARD"
  | "TWO_DOORS_CARD"
  | "XRAY_BODY_CARD"
  | "STOPWATCH_TALLY_CARD";

export interface StoryCardProps {
  cardType: StoryCardType;
  u: number; // Tiến độ chuẩn hóa trong beat [0..1]
  localFrame: number;
  durationFrames: number;
  /** V10.3: Quy chuẩn toàn cục phân loại hiển thị Định lượng vs. Định tính (No Fake Metrics) */
  metricMode?: MetricDisplayMode;
  /** V10.3: Chỉ truyền khi kịch bản có con số phần trăm thực sự xác định (ví dụ 20 cho "1/5") */
  targetPercent?: number;
  narrationText?: string;
  title?: string;
  subtitle?: string;
  highlightWord?: string;
  highlightColor?: "red" | "yellow" | "green";
  darkMode?: boolean;
  // Calendar Flip
  calendarHeader?: string;
  calendarStartLabel?: string;
  calendarEndLabel?: string;
  calendarSteps?: string[];
  // Gauge Reserve (hỗ trợ cả reserve_low_danger lẫn danger_high_red V11.0)
  gaugeFrom?: number; // 0..100
  gaugeTo?: number; // 0..100
  gaugePolarity?: "reserve_low_danger" | "danger_high_red";
  gaugeLowLabel?: string;
  gaugeMidLabel?: string;
  gaugeHighLabel?: string;
  gaugeSafeStatusLabel?: string;
  gaugeWarnStatusLabel?: string;
  gaugeStatusLabel?: string;
  // Candle & Hourglass
  candleVariant?: "candle" | "hourglass" | "both";
  candleLabel?: string;
  // Balance Scale
  leftPanLabel?: string;
  rightPanLabel?: string;
  heavySide?: "left" | "right";
  scaleTopBadge?: string;
  // Simple Chart
  chartMode?: "line" | "bars";
  chartTrend?: "falling" | "rising";
  chartTitle?: string;
  chartStartLabel?: string;
  chartEndLabel?: string;
  chartXLabels?: string[];
  leftBarLabel?: string;
  rightBarLabel?: string;
  leftBarValue?: number;
  rightBarValue?: number;
  // Two Doors (Neutral-to-Decision Dual Morph V10.3 + accentTheme V11.1/V12.0)
  accentTheme?: "GOLD_SURVIVAL" | "POSITIVE_GOLD" | "DANGER_RED";
  leftDoorTitle?: string;
  leftDoorSub?: string;
  leftNeutralSub?: string;
  leftMorphingSub?: string;
  rightDoorTitle?: string;
  rightDoorSub?: string;
  rightNeutralSub?: string;
  rightMorphingSub?: string;
  // X-Ray Body
  xrayCalloutTitle?: string;
  xrayCalloutSub?: string;
  xrayStage?: "stomach" | "fat_reserve" | "muscle_burn";
  // Stopwatch & Tally
  tallyCount?: number;
  tallyLabel?: string;
}

export interface CharacterOverlayProps {
  u: number;
  localFrame: number;
  durationFrames: number;
  characterX: number;
  characterHeadY: number;
  characterFacing: "left" | "right";
  groundY?: number;
  isMantis?: boolean;
  isHornet?: boolean;
  hornetSceneMode?: HornetNightSceneMode;
  hungerStage?: string;
  metricMode?: MetricDisplayMode;
  narrationText?: string;
  calloutTriggerPhrase?: string;
  floatingHeader?: string;
  calloutText?: string;
  calloutSub?: string;
  calloutTarget?: "head" | "hand" | "torso" | "foot" | "abdomen" | SocketKey;
  targetSocket?: SocketKey;
  sockets?: RigSockets;
  preyScreenPos?: { x: number; y: number };
  sfxPos?: { x: number; y: number };
  sfxText?: string;
  thoughtText?: string;
}

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

/**
 * V10.2: Hàm chuẩn hóa toàn cục cho mọi bộ đếm số và thanh tiến trình (Monotonic Counter Sync)
 * - Giữ nguyên trạng thái khởi đầu trong leadInFrames (0.3s = 18f) đầu cảnh
 * - Chạy mượt đơn điệu từ 0.0 -> 1.0 đúng trong thời gian đọc thoại
 * - Giữ ổn định tại giá trị đích (1.0) trong tailHoldFrames (0.7s = 42f) cuối cảnh
 */
export function computeDisplayProgress(
  localFrame: number,
  durationFrames: number,
  leadInFrames: number = 18,
  tailHoldFrames: number = 42
): number {
  const safeLead = Math.min(leadInFrames, Math.floor(durationFrames * 0.15));
  const safeTail = Math.min(tailHoldFrames, Math.floor(durationFrames * 0.25));
  const activeSpan = Math.max(1, durationFrames - safeLead - safeTail);
  return clamp01((localFrame - safeLead) / activeSpan);
}

function easeOutBack(x: number): number {
  const t = clamp01(x);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInBack(x: number): number {
  const t = clamp01(x);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * Math.pow(t, 3) - c1 * Math.pow(t, 2);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function interpolateHexColor(hexA: string, hexB: string, t: number): string {
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
 * 10. LỚP PHỦ TRÊN CẢNH NHÂN VẬT TĨNH CÓ HỒN (CHARACTER_POSE_CARD OVERLAYS):
 * - Callout Badge + Mũi tên cong chỉ vào bộ phận cơ thể
 * - Chữ tượng thanh nổ lớn (Onomatopoeia SFX Pop: "CHỘP!", "HỤT!", "CẠCH!")
 * - Bóng suy nghĩ nhỏ ("[?]", "[...]", "[💧]")
 */
export const CharacterStoryOverlays: React.FC<CharacterOverlayProps> = ({
  u,
  localFrame,
  durationFrames,
  characterX,
  characterHeadY,
  characterFacing,
  groundY = 840,
  isMantis = false,
  isHornet = false,
  hornetSceneMode,
  hungerStage,
  metricMode,
  narrationText,
  calloutTriggerPhrase,
  floatingHeader,
  calloutText: rawCalloutText,
  calloutSub: rawCalloutSub,
  calloutTarget = "head",
  targetSocket: explicitSocket,
  sockets,
  preyScreenPos,
  sfxPos,
  sfxText,
  thoughtText,
}) => {
  // V10.3: Khi callout ở chế độ định tính (QUALITATIVE_STATE), tự động lọc bỏ số % thừa
  const calloutText =
    rawCalloutText && metricMode === "QUALITATIVE_STATE"
      ? stripFabricatedPercentSuffix(rawCalloutText, "QUALITATIVE_STATE")
      : rawCalloutText;
  const calloutSub =
    rawCalloutSub && metricMode === "QUALITATIVE_STATE"
      ? stripFabricatedPercentSuffix(rawCalloutSub, "QUALITATIVE_STATE")
      : rawCalloutSub;
  const popScale = localFrame < 14 ? easeOutBack(localFrame / 14) : 1.0;
  const fadeOut = durationFrames - localFrame < 8 ? clamp01((durationFrames - localFrame) / 8) : 1.0;

  // V11.2: Speech-Synced Timed Callout — Tự động tính khung hình hiện/ẩn khớp từ khóa trong lời thoại
  // Hiện tối đa ~2.4s (144 frames) với hiệu ứng IN easeOutBack (14f) & OUT easeInBack (12f)
  const leadInFrames = 18;
  const tailHoldFrames = 42;
  const speechFrames = Math.max(60, durationFrames - leadInFrames - tailHoldFrames);
  const speechWindow = computeSpeechSyncedWindow(
    narrationText,
    calloutTriggerPhrase,
    leadInFrames,
    speechFrames,
    durationFrames,
    144
  );

  let calloutAppearFrame = speechWindow.appearFrame;
  let calloutDisappearFrame = speechWindow.disappearFrame;
  if (
    !calloutTriggerPhrase &&
    isMantis &&
    (hungerStage === "HUNGRY_STALK" || hungerStage === "CAUTIOUS_CONSERVE")
  ) {
    calloutAppearFrame = Math.floor(0.38 * durationFrames);
    calloutDisappearFrame = Math.min(durationFrames - 18, calloutAppearFrame + 144);
  }

  const isCalloutVisible = Boolean(
    calloutText && localFrame >= calloutAppearFrame && localFrame < calloutDisappearFrame
  );
  const CALLOUT_IN_FRAMES = 14;
  const CALLOUT_OUT_FRAMES = 12;
  const calloutElapsed = localFrame - calloutAppearFrame;
  const calloutRemaining = calloutDisappearFrame - localFrame;

  let calloutPopScale = 1.0;
  let calloutArrowProgress = 1.0;
  let calloutGroupOpacity = fadeOut;
  if (calloutElapsed < CALLOUT_IN_FRAMES) {
    const tIn = clamp01(calloutElapsed / CALLOUT_IN_FRAMES);
    calloutPopScale = Math.max(0, easeOutBack(tIn));
    calloutArrowProgress = smoothstep(0.05, 0.95, tIn);
    calloutGroupOpacity = fadeOut * smoothstep(0.0, 0.45, tIn);
  } else if (calloutRemaining <= CALLOUT_OUT_FRAMES) {
    const tOut = clamp01((CALLOUT_OUT_FRAMES - calloutRemaining) / CALLOUT_OUT_FRAMES);
    calloutPopScale = Math.max(0, 1 - easeInBack(tOut));
    calloutArrowProgress = 1 - smoothstep(0.15, 0.95, tOut);
    calloutGroupOpacity = fadeOut * (1 - smoothstep(0.45, 1.0, tOut));
  }

  // Mục 2.1: Xác định điểm neo giải phẫu (SocketKey) tự động và bám chính xác vào rig.sockets[resolvedSocket]
  const resolvedSocket: SocketKey =
    explicitSocket || resolveTargetSocketKey(calloutTarget, calloutText);

  const dir = characterFacing === "right" ? 1 : -1;
  let targetX = characterX - dir * 42;
  let targetY = characterHeadY - 6;
  let badgeCenterX = Math.max(280, Math.min(1640, characterX - dir * 340));
  let badgeCenterY = Math.max(170, Math.min(620, targetY - 65));

  if (sockets && sockets[resolvedSocket]) {
    targetX = sockets[resolvedSocket].x;
    targetY = sockets[resolvedSocket].y;

    if (isHornet) {
      // V11.0: Đặt hộp chú thích gọn trên nền trời đêm thoáng (phía trên-trái con ong tiêu điểm)
      // để mũi tên cam cong hướng xuống-phải tới đúng điểm neo mà không che mặt trăng hay chùm sáng
      badgeCenterX = Math.max(460, Math.min(1040, targetX - 360));
      badgeCenterY = Math.max(210, Math.min(340, targetY - 145));
    } else if (resolvedSocket === "HEAD_CENTER" || resolvedSocket === "HEAD_TOP" || resolvedSocket === "EYES_FOCUS") {
      badgeCenterX = Math.max(260, Math.min(1660, characterX - dir * 265));
      badgeCenterY = groundY - 388;
    } else if (resolvedSocket === "THORAX") {
      badgeCenterX = Math.max(260, Math.min(1660, characterX - dir * 290));
      badgeCenterY = groundY - 340;
    } else if (resolvedSocket === "ABDOMEN_CENTER") {
      // V10.1 Beat 8 (X-RAY): Đặt hộp chú thích gọn bên trái để mũi tên cong mượt tới mép trái khoang bụng X-Ray, tránh hoàn toàn khớp gối chữ Λ
      badgeCenterX = Math.max(260, Math.min(1660, characterX - dir * 415));
      badgeCenterY = groundY - 335;
    } else if (resolvedSocket === "PRIMARY_WEAPON") {
      // V10.2 Beat 10: Dịch hộp nhãn sang phải thêm +105px (characterX + 320) để mũi tên đi cong từ bên phải
      // trỏ thẳng xuống mặt trên càng trước mà tuyệt đối KHÔNG cắt ngang qua con mắt phải của bọ ngựa
      badgeCenterX = Math.max(260, Math.min(1660, characterX + dir * 320));
      badgeCenterY = groundY - 438;
    } else if (resolvedSocket === "FEET_CONTACT") {
      badgeCenterX = Math.max(260, Math.min(1660, characterX - dir * 300));
      badgeCenterY = groundY - 210;
    }
  } else if (isMantis) {
    if (resolvedSocket === "HEAD_CENTER") {
      badgeCenterX = Math.max(260, Math.min(1660, characterX - dir * 265));
      badgeCenterY = groundY - 388;
      targetX = characterX + dir * 6;
      targetY = groundY - 304;
    } else if (resolvedSocket === "THORAX") {
      badgeCenterX = Math.max(260, Math.min(1660, characterX - dir * 290));
      badgeCenterY = groundY - 340;
      targetX = characterX + dir * 34;
      targetY = groundY - 182;
    } else if (resolvedSocket === "ABDOMEN_CENTER") {
      badgeCenterX = Math.max(260, Math.min(1660, characterX - dir * 415));
      badgeCenterY = groundY - 335;
      targetX = characterX - dir * 195;
      targetY = groundY - 134;
    } else if (resolvedSocket === "PRIMARY_WEAPON") {
      badgeCenterX = Math.max(260, Math.min(1660, characterX + dir * 345));
      badgeCenterY = groundY - 418;
      targetX = characterX + dir * 136;
      targetY = groundY - 222;
    } else if (resolvedSocket === "FEET_CONTACT") {
      badgeCenterX = Math.max(260, Math.min(1660, characterX - dir * 300));
      badgeCenterY = groundY - 210;
      targetX = characterX - dir * 150;
      targetY = groundY - 20;
    }
  } else {
    if (resolvedSocket === "PRIMARY_WEAPON") {
      targetX = characterX + dir * 68;
      targetY = characterHeadY + 108;
    } else if (resolvedSocket === "THORAX") {
      targetX = characterX - dir * 24;
      targetY = characterHeadY + 115;
    } else if (resolvedSocket === "ABDOMEN_CENTER") {
      targetX = characterX - dir * 24;
      targetY = characterHeadY + 150;
    } else if (resolvedSocket === "FEET_CONTACT") {
      targetX = characterX + dir * 28;
      targetY = characterHeadY + 290;
    }
    badgeCenterY = Math.max(170, Math.min(620, targetY - 65));
  }

  // V10.1 Mục 2: Ngôi sao nổ "CHỘP!" bật nảy (spring 0 -> 1.15 -> 1.0) tại đúng strikeFrame,
  // giữ rõ nét trong 36 frames (0.6s) rồi mới mờ dần trong 12 frames (tổng 48 frames)
  const sfxStartFrame = isMantis
    ? Math.max(30, Math.floor(0.30 * durationFrames))
    : Math.floor(0.16 * durationFrames);
  const sfxElapsed = localFrame - sfxStartFrame;
  const isSfxActive = Boolean(
    sfxText &&
      sfxElapsed >= 0 &&
      (isMantis ? sfxElapsed <= 48 : localFrame < durationFrames)
  );
  const sfxSpringScale =
    sfxElapsed < 5
      ? (sfxElapsed / 5) * 1.15
      : sfxElapsed < 10
      ? 1.15 - ((sfxElapsed - 5) / 5) * 0.15
      : 1.0;
  const sfxOpacity = isMantis
    ? sfxElapsed <= 36
      ? 1.0
      : clamp01(1 - (sfxElapsed - 36) / 12)
    : fadeOut;

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 45 }}
    >
      {/* 0. TIÊU ĐỀ TỪ KHÓA NỔI BẬT KHÔNG KHUNG CHUẨN KASS BLOX V13.0 (IMPACT FLOATING TEXT y = 72px) */}
      {floatingHeader && (() => {
        const headerPopScale = localFrame < 14 ? easeOutBack(localFrame / 14) : 1.0;
        const headerText = floatingHeader.toUpperCase();
        const isDramaticHeader =
          Boolean(sfxText) ||
          hungerStage === "STARVING_XRAY" ||
          hungerStage === "BERSERK_STRIKE" ||
          hornetSceneMode === "FLASHLIGHT_ALERT" ||
          hornetSceneMode === "SWARM_BEAM_ATTACK" ||
          hornetSceneMode === "STING_RETREAT_BACKSTEP" ||
          hornetSceneMode === "FLASHLIGHT_SWITCH_OFF" ||
          headerText.includes("!");
        const textFill = isDramaticHeader ? "#FACC15" : "#FFFFFF";
        const dynamicFontSize = headerText.length > 32 ? 40 : 46;
        return (
          <g
            transform={`translate(960, 72) scale(${headerPopScale.toFixed(3)})`}
            opacity={fadeOut}
          >
            {/* Bóng đổ cứng 0 5px 0 #0F172A tạo chiều sâu nổi bật trực tiếp trên nền cảnh */}
            <text
              x={0}
              y={17}
              textAnchor="middle"
              fill="#0F172A"
              stroke="#0F172A"
              strokeWidth={16}
              strokeLinejoin="round"
              paintOrder="stroke fill"
              fontSize={dynamicFontSize}
              fontWeight={900}
              letterSpacing="1.2px"
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {headerText}
            </text>
            {/* Chữ nổi chính màu Vàng #FACC15 hoặc Trắng #FFFFFF với viền đen dày 8px (16px stroke + paint-order: stroke fill) */}
            <text
              x={0}
              y={12}
              textAnchor="middle"
              fill={textFill}
              stroke="#0F172A"
              strokeWidth={16}
              strokeLinejoin="round"
              paintOrder="stroke fill"
              fontSize={dynamicFontSize}
              fontWeight={900}
              letterSpacing="1.2px"
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {headerText}
            </text>
          </g>
        );
      })()}

      {/* A. NHÃN CHÚ THÍCH GỌN TINH TẾ V11.2 (0.78x COMPACT + easeOutBack IN 14f / easeInBack OUT 12f + ARROW SYNC) */}
      {isCalloutVisible && (() => {
        const calloutBoxW = Math.max(
          236,
          Math.min(
            356,
            Math.max((calloutText || "").length * 11.4 + 42, (calloutSub || "").length * 7.4 + 38)
          )
        );
        const calloutBoxH = calloutSub ? 64 : 48;
        const halfBoxW = calloutBoxW / 2;
        const halfBoxH = calloutBoxH / 2;
        const dxBadge = targetX - badgeCenterX;
        const isXrayLeftCurve = isMantis && resolvedSocket === "ABDOMEN_CENTER";
        const isWeaponTopCurve = isMantis && resolvedSocket === "PRIMARY_WEAPON";
        const startFromBottom =
          isXrayLeftCurve || isWeaponTopCurve || (Math.abs(dxBadge) < halfBoxW + 45 && targetY > badgeCenterY + 45);
        const startArrowX = startFromBottom
          ? badgeCenterX + (isXrayLeftCurve ? -dir * 16 : isWeaponTopCurve ? -dir * 82 : 0)
          : badgeCenterX + Math.sign(dxBadge || dir) * (halfBoxW - 4);
        const startArrowY = startFromBottom
          ? badgeCenterY + halfBoxH + 2
          : badgeCenterY + 4;
        const ctrlX = isXrayLeftCurve
          ? Math.min(startArrowX, targetX) - dir * 24
          : isWeaponTopCurve
          ? Math.max(startArrowX, targetX) + dir * 10
          : startFromBottom
          ? (startArrowX + targetX) / 2 + dir * 24
          : (startArrowX + targetX) / 2;
        const ctrlY = isXrayLeftCurve
          ? (startArrowY + targetY) / 2 + 42
          : isWeaponTopCurve
          ? (startArrowY + targetY) / 2 + 12
          : startFromBottom
          ? (startArrowY + targetY) / 2 - 10
          : Math.min(startArrowY, targetY) - 28;

        // Khoảng đệm an toàn toàn cục (Arrow Tip Stand-Off Margin = 24px dọc theo vector tiếp cận)
        const vx = targetX - ctrlX;
        const vy = targetY - ctrlY;
        const vLen = Math.hypot(vx, vy) || 1;
        const standOffPx = Math.min(24, Math.max(0, vLen - 24));
        const endX = targetX - (vx / vLen) * standOffPx;
        const endY = targetY - (vy / vLen) * standOffPx;
        const angle = Math.atan2(vy, vx) * (180 / Math.PI);
        const arrowHeadScale = smoothstep(0.62, 1.0, calloutArrowProgress);
        const arrowCurveD = `M ${startArrowX.toFixed(1)},${startArrowY.toFixed(1)} Q ${ctrlX.toFixed(
          1
        )},${ctrlY.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;

        return (
          <g opacity={calloutGroupOpacity}>
            {/* Đường mũi tên cam đồng bộ mượt hiện/ẩn theo strokeDashoffset & opacity của hộp comment */}
            <g opacity={calloutArrowProgress}>
              <path
                d={arrowCurveD}
                pathLength={100}
                fill="none"
                stroke="#141414"
                strokeWidth={6.5}
                strokeLinecap="round"
                strokeDasharray="100"
                strokeDashoffset={(100 * (1 - calloutArrowProgress)).toFixed(1)}
              />
              <path
                d={arrowCurveD}
                pathLength={100}
                fill="none"
                stroke="#F97316"
                strokeWidth={3.6}
                strokeLinecap="round"
                strokeDasharray="10 6"
                strokeDashoffset={(24 * (1 - calloutArrowProgress)).toFixed(1)}
              />
              {arrowHeadScale > 0.02 && (
                <g
                  transform={`translate(${endX.toFixed(1)}, ${endY.toFixed(1)}) rotate(${angle.toFixed(
                    1
                  )}) scale(${arrowHeadScale.toFixed(3)})`}
                >
                  <polygon
                    points="0,0 -17,-8.5 -13,0 -17,8.5"
                    fill="#F97316"
                    stroke="#141414"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                  />
                </g>
              )}
            </g>

            {/* Hộp comment màu vàng nhạt nhỏ gọn (0.78x, viền 2.5px, nảy easeOutBack IN / easeInBack OUT) */}
            <g transform={`translate(${badgeCenterX}, ${badgeCenterY}) scale(${calloutPopScale.toFixed(3)})`}>
              <rect
                x={-halfBoxW}
                y={-halfBoxH}
                width={calloutBoxW}
                height={calloutBoxH}
                rx={14}
                fill="#141414"
                transform="translate(4, 4.5)"
              />
              <rect
                x={-halfBoxW}
                y={-halfBoxH}
                width={calloutBoxW}
                height={calloutBoxH}
                rx={14}
                fill="#FEF08A"
                stroke="#141414"
                strokeWidth={2.5}
              />
              <text
                x={0}
                y={calloutSub ? -5 : 6}
                textAnchor="middle"
                fill="#141414"
                fontSize={17}
                fontWeight={900}
                fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
              >
                {calloutText}
              </text>
              {calloutSub && (
                <text
                  x={0}
                  y={18}
                  textAnchor="middle"
                  fill="#B45309"
                  fontSize={12.5}
                  fontWeight={800}
                  fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                >
                  {calloutSub}
                </text>
              )}
            </g>
          </g>
        );
      })()}

      {/* B. CHỮ TƯỢNG THANH NỔ TRUYỆN TRANH (ONOMATOPOEIA SFX POP: "CHỘP!" V10.1)
          Đặt phía trên bên phải con mồi (preyX + 55..110, preyY - 45), bật nảy spring 0 -> 1.15 -> 1.0,
          giữ rõ nét 36 frames (0.6s) rồi mờ dần trong 12 frames */}
      {isSfxActive && (() => {
        const sfxX = sfxPos
          ? Math.min(1700, Math.max(220, sfxPos.x))
          : preyScreenPos
          ? Math.min(1680, Math.max(240, preyScreenPos.x + dir * 168))
          : isMantis
          ? Math.min(1640, Math.max(280, characterX + dir * 340))
          : Math.min(1620, Math.max(300, characterX + dir * 250));
        const sfxY = sfxPos
          ? Math.max(175, Math.min(720, sfxPos.y))
          : preyScreenPos
          ? Math.max(175, Math.min(720, preyScreenPos.y - 14))
          : isMantis
          ? groundY - 245
          : Math.max(180, characterHeadY - 40);

        return (
          <g
            transform={`translate(${sfxX.toFixed(1)}, ${sfxY.toFixed(1)}) scale(${sfxSpringScale.toFixed(3)}) rotate(${
              dir * -7 + Math.sin(localFrame * 0.35) * 2.2
            })`}
            opacity={sfxOpacity}
          >
            {/* Viền răng cưa đỏ #EF4444 viền ngoài đen 3.5px */}
            <polygon
              points="0,-82 22,-48 64,-64 45,-22 86,0 45,22 64,64 22,48 0,82 -22,48 -64,64 -45,22 -86,0 -45,-22 -64,-64 -22,-48"
              fill="#EF4444"
              stroke="#141414"
              strokeWidth={3.8}
              strokeLinejoin="round"
              transform="scale(1.22, 0.90)"
            />
            {/* Nền ngôi sao vàng #FACC15 */}
            <polygon
              points="0,-64 17,-37 50,-49 35,-17 68,0 35,17 50,49 17,37 0,64 -17,37 -50,49 -35,17 -68,0 -35,-17 -50,-49 -17,-37"
              fill="#FACC15"
              stroke="#141414"
              strokeWidth={3.5}
              strokeLinejoin="round"
              transform="scale(1.08, 0.82)"
            />
            {/* Chữ trắng viền đen đậm */}
            <text
              x={0}
              y={12}
              textAnchor="middle"
              fill="#FFFFFF"
              stroke="#141414"
              strokeWidth={8}
              paintOrder="stroke"
              fontSize={36}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {sfxText}
            </text>
          </g>
        );
      })()}

      {/* C. BÓNG SUY NGHĨ TRÊN ĐẦU (THOUGHT BUBBLE: "[?]", "[...]", "[💧]") */}
      {thoughtText && (
        <g
          transform={`translate(${
            isMantis ? characterX + dir * 235 : characterX + dir * 135
          }, ${
            isMantis ? groundY - 375 : Math.max(130, characterHeadY - 95)
          }) scale(${popScale.toFixed(3)})`}
          opacity={fadeOut}
        >
          <circle cx={-dir * 38} cy={48} r={7} fill="#FFFFFF" stroke="#141414" strokeWidth={3.5} />
          <circle cx={-dir * 22} cy={30} r={11} fill="#FFFFFF" stroke="#141414" strokeWidth={3.5} />
          <rect
            x={-68}
            y={-36}
            width={136}
            height={62}
            rx={31}
            fill="#FFFFFF"
            stroke="#141414"
            strokeWidth={4.5}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fill="#141414"
            fontSize={28}
            fontWeight={900}
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {thoughtText}
          </text>
        </g>
      )}
    </svg>
  );
};

/**
 * BỘ THẺ INFOGRAPHIC ẨN DỤ TRỰC QUAN (9 LOẠI THẺ TRUNG TÂM)
 */
export const StoryInfographicCards: React.FC<StoryCardProps> = (props) => {
  const { cardType, u, localFrame, durationFrames } = props;
  if (cardType === "CHARACTER_POSE_CARD") return null;

  const enterScale = localFrame < 12 ? easeOutBack(localFrame / 12) : 1.0;
  const cameraZoom = 1.0 + 0.06 * u;

  // ===========================================================================
  // 1. CHAPTER_CARD: Thẻ Chuyển Chương / Cột Mốc Kịch Tính
  // ===========================================================================
  if (cardType === "CHAPTER_CARD") {
    const isDark = props.darkMode ?? true;
    const title = props.title || "NHƯNG ĐIỀU TỆ NHẤT CHƯA ĐẾN...";
    const subtitle = props.subtitle || "CỘT MỐC SINH TỒN";
    const highlightWord = props.highlightWord || "";
    const highlightHex =
      props.highlightColor === "yellow"
        ? "#FACC15"
        : props.highlightColor === "green"
        ? "#22C55E"
        : "#EF4444";

    // Rung nhẹ tạo cảm giác hồi hộp
    const shakeX = Math.sin(localFrame * 0.45) * 1.8;
    const shakeY = Math.cos(localFrame * 0.38) * 1.4;

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <defs>
          <radialGradient id="chapterDarkGrad" cx="50%" cy="48%" r="70%">
            <stop offset="0%" stopColor={isDark ? "#232738" : "#FFFBEB"} />
            <stop offset="100%" stopColor={isDark ? "#0D0F17" : "#F3EFE6"} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#chapterDarkGrad)" />

        {/* Họa tiết đường viền khung điện ảnh */}
        <rect
          x={90}
          y={80}
          width={1740}
          height={920}
          rx={32}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1"}
          strokeWidth={3}
          strokeDasharray="18 12"
        />

        <g
          transform={`translate(${960 + shakeX}, ${490 + shakeY}) scale(${(enterScale * cameraZoom).toFixed(3)})`}
        >
          {/* Nhãn phụ phía trên (rộng 640px để không tràn chữ) */}
          <rect
            x={-320}
            y={-155}
            width={640}
            height={56}
            rx={28}
            fill={highlightHex}
            stroke="#141414"
            strokeWidth={4.5}
          />
          <text
            x={0}
            y={-119}
            textAnchor="middle"
            fill={props.highlightColor === "yellow" ? "#141414" : "#FFFFFF"}
            fontSize={22}
            fontWeight={900}
            letterSpacing="2px"
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {subtitle.toUpperCase()}
          </text>

          {/* Tiêu đề chính khổ lớn (tự co cỡ chữ nếu tiêu đề dài > 26 ký tự để không tràn khung) */}
          <text
            x={0}
            y={-10}
            textAnchor="middle"
            fill={isDark ? "#FFFFFF" : "#141414"}
            stroke="#141414"
            strokeWidth={isDark ? 10 : 0}
            paintOrder="stroke"
            fontSize={title.length > 28 ? 54 : title.length > 22 ? 62 : 68}
            fontWeight={900}
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {title}
          </text>

          {/* Hộp nhấn từ khóa nổi bật bên dưới nếu có */}
          {highlightWord && (() => {
            const hlW = Math.max(680, Math.min(1100, highlightWord.length * 29 + 110));
            return (
              <g transform="translate(0, 95)">
                <rect
                  x={-hlW / 2}
                  y={-48}
                  width={hlW}
                  height={88}
                  rx={22}
                  fill="#141414"
                  transform="translate(6, 8)"
                />
                <rect
                  x={-hlW / 2}
                  y={-48}
                  width={hlW}
                  height={88}
                  rx={22}
                  fill={highlightHex}
                  stroke="#141414"
                  strokeWidth={5}
                />
                <text
                  x={0}
                  y={8}
                  textAnchor="middle"
                  fill={props.highlightColor === "yellow" ? "#141414" : "#FFFFFF"}
                  fontSize={highlightWord.length > 24 ? 34 : 40}
                  fontWeight={900}
                  fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                >
                  {highlightWord}
                </text>
              </g>
            );
          })()}
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 2. CALENDAR_FLIP_CARD V10.2: Lịch Đếm Ngày / Tuần Lật Trang (Monotonic Sync)
  // - Đồng bộ tuyệt đối activeStepIndex (0, 1, 2, ...) giữa tờ lịch lớn & dải nút pills bên dưới
  // - Nút i chỉ sáng vàng khi i <= activeStepIndex, tuyệt đối không nhảy cóc hay lệch mốc
  // ===========================================================================
  if (cardType === "CALENDAR_FLIP_CARD") {
    const steps =
      props.calendarSteps && props.calendarSteps.length > 0
        ? props.calendarSteps
        : [
            props.calendarStartLabel || "NGÀY 1",
            "TUẦN 1",
            "TUẦN 2",
            props.calendarEndLabel || "TUẦN 3",
          ];
    const displayP = computeDisplayProgress(localFrame, durationFrames, 18, 42);
    const totalSteps = steps.length;
    const stepPos = displayP * totalSteps;
    const activeStepIndex = Math.min(totalSteps - 1, Math.floor(stepPos));
    const flipFract = activeStepIndex < totalSteps - 1 ? stepPos - activeStepIndex : 0;
    const currentLabel = steps[activeStepIndex];
    const headerText = props.calendarHeader || "THỜI GIAN NHỊN ĐÓI TRÔI QUA";

    // Hiệu ứng lật trang gọn nhẹ chỉ ở 12% cuối mỗi mốc (không làm biến dạng chữ khi đang giữ mốc)
    const pageScaleY = flipFract > 0.88 ? 1 - ((flipFract - 0.88) / 0.12) * 0.45 : 1.0;

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <g transform={`translate(960, 470) scale(${(enterScale * cameraZoom).toFixed(3)})`}>
          {/* Bóng đổ khối lịch */}
          <rect
            x={-310}
            y={-240}
            width={620}
            height={460}
            rx={36}
            fill="#141414"
            transform="translate(14, 16)"
          />
          {/* Thân lịch trắng kem */}
          <rect
            x={-310}
            y={-240}
            width={620}
            height={460}
            rx={36}
            fill="#FFFFFF"
            stroke="#141414"
            strokeWidth={6}
          />
          {/* Phần gáy lịch màu đỏ tươi */}
          <path
            d="M -310,-204 Q -310,-240 -274,-240 L 274,-240 Q 310,-240 310,-204 L 310,-110 L -310,-110 Z"
            fill="#EF4444"
            stroke="#141414"
            strokeWidth={6}
          />
          {/* Khoen lò xo kim loại đóng gáy lịch */}
          {[-200, -100, 0, 100, 200].map((rx, i) => (
            <g key={i} transform={`translate(${rx}, -240)`}>
              <rect x={-14} y={-28} width={28} height={56} rx={12} fill="#CBD5E1" stroke="#141414" strokeWidth={5} />
              <circle cx={0} cy={16} r={9} fill="#1E293B" />
            </g>
          ))}

          {/* Tiêu đề gáy lịch */}
          <text
            x={0}
            y={-158}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize={28}
            fontWeight={900}
            letterSpacing="1.5px"
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {headerText}
          </text>

          {/* Tờ lịch đang lật ở giữa */}
          <g transform={`translate(0, -90) scale(1, ${Math.max(0.25, pageScaleY).toFixed(3)})`}>
            <rect
              x={-260}
              y={10}
              width={520}
              height={250}
              rx={22}
              fill="#FEFCE8"
              stroke="#141414"
              strokeWidth={4.5}
            />
            <text
              x={0}
              y={162}
              textAnchor="middle"
              fill="#141414"
              fontSize={96}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {currentLabel}
            </text>
          </g>

          {/* Thanh tiến độ các mốc ngày/tuần dưới chân lịch (Đồng bộ 100% với activeStepIndex) */}
          <g transform="translate(0, 275)">
            {steps.map((st, idx) => {
              const bx = (idx - (steps.length - 1) / 2) * 185;
              const isPassed = idx <= activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              return (
                <g key={idx} transform={`translate(${bx}, 0) scale(${isCurrent ? "1.06" : "1.0"})`}>
                  <rect
                    x={-78}
                    y={-26}
                    width={156}
                    height={52}
                    rx={16}
                    fill={isCurrent ? "#FACC15" : isPassed ? "#FEF08A" : "#E2E8F0"}
                    stroke="#141414"
                    strokeWidth={isCurrent ? 5 : 4}
                  />
                  <text
                    x={0}
                    y={7}
                    textAnchor="middle"
                    fill={isPassed ? "#141414" : "#64748B"}
                    fontSize={20}
                    fontWeight={900}
                    fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                  >
                    {st}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 3. GAUGE_RESERVE_CARD V10.3: Đồng Hồ Đo Bán Nguyệt 3 Vùng Đỏ - Vàng - Xanh
  // - Chạy mượt theo computeDisplayProgress (leadIn = 18f, tailHold = 42f)
  // - Tuân thủ Chính Sách Không Ham Số Thừa (Information Precision Policy):
  //   * Mặc định QUALITATIVE_STATE: Chỉ hiện nhãn trạng thái chữ đổi màu theo 3 vùng
  //     ("DỰ TRỮ AN TOÀN" -> "ĐANG CẦM CỰ" -> "BÁO ĐỘNG ĐỎ: CẠN KIỆT DỰ TRỮ"), sạch bóng số % thừa.
  //   * Chỉ gắn kèm số % khi kịch bản truyền targetPercent xác định (EXACT_QUANTITATIVE).
  // ===========================================================================
  if (cardType === "GAUGE_RESERVE_CARD") {
    const displayP = computeDisplayProgress(localFrame, durationFrames, 18, 42);
    const effectiveMetricMode = inferMetricModeForCard({
      metricMode: props.metricMode,
      cardType: "GAUGE_RESERVE_CARD",
      targetPercent: props.targetPercent,
      narrationText: props.narrationText,
      labelText: props.gaugeStatusLabel,
    });
    const isQuantitative = effectiveMetricMode === "EXACT_QUANTITATIVE";
    const isDangerHighRed = props.gaugePolarity === "danger_high_red";
    const fromVal = props.gaugeFrom ?? (isDangerHighRed ? 12 : 80);
    const toVal =
      typeof props.targetPercent === "number" && Number.isFinite(props.targetPercent)
        ? Math.max(0, Math.min(100, props.targetPercent))
        : props.gaugeTo ?? (isDangerHighRed ? 95 : 5);
    const currentVal = fromVal + (toVal - fromVal) * smoothstep(0.0, 1.0, displayP);
    const roundedVal = Math.round(currentVal);
    const needleDeg = -78 + (currentVal / 100) * 156;
    const isSafe = isDangerHighRed ? roundedVal < 35 : roundedVal > 60;
    const isWarning = isDangerHighRed
      ? roundedVal >= 35 && roundedVal <= 70
      : roundedVal >= 25 && roundedVal <= 60;
    const isDanger = isDangerHighRed ? roundedVal > 70 : roundedVal < 25;
    const title = props.title || "ĐỒNG HỒ DỰ TRỮ NĂNG LƯỢNG SINH TỒN";
    const rawStatusLabel = isSafe
      ? props.gaugeSafeStatusLabel || (isDangerHighRed ? "YÊN TĨNH" : "DỰ TRỮ AN TOÀN")
      : isWarning
      ? props.gaugeWarnStatusLabel || (isDangerHighRed ? "CẢNH GIÁC" : "ĐANG CẦM CỰ")
      : props.gaugeStatusLabel ||
        (isDangerHighRed ? "BÁO ĐỘNG ĐỎ: TẤN CÔNG HÀNG LOẠT" : "BÁO ĐỘNG ĐỎ: CẠN KIỆT DỰ TRỮ");
    const displayStatusLabel = formatStateBadgeLabel(
      rawStatusLabel,
      effectiveMetricMode,
      isQuantitative ? roundedVal : undefined
    );
    const dangerBlink = isDanger && Math.sin(localFrame * 0.36) > 0;
    const pillBg = isSafe
      ? "#DCFCE7"
      : isWarning
      ? "#FEF3C7"
      : dangerBlink
      ? "#FECACA"
      : "#FEE2E2";
    const pillTextColor = isSafe ? "#15803D" : isWarning ? "#B45309" : "#DC2626";
    const leftArcStroke = isDangerHighRed ? "#22C55E" : "#EF4444";
    const rightArcStroke = isDangerHighRed ? "#EF4444" : "#22C55E";
    const leftLabelColor = isDangerHighRed ? "#15803D" : "#DC2626";
    const rightLabelColor = isDangerHighRed ? "#DC2626" : "#15803D";
    const leftBaseLabel = props.gaugeLowLabel || (isDangerHighRed ? "YÊN TĨNH" : "KIỆT SỨC");
    const midBaseLabel = props.gaugeMidLabel || (isDangerHighRed ? "CẢNH GIÁC" : "CẦM CỰ");
    const rightBaseLabel = props.gaugeHighLabel || (isDangerHighRed ? "NGUY HIỂM" : "NO ĐỦ");
    const statusPillW = Math.max(680, Math.min(820, displayStatusLabel.length * 22 + 96));

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <g transform={`translate(960, 470) scale(${(enterScale * cameraZoom * 1.12).toFixed(3)})`}>
          {/* Tiêu đề chính trên nền lưới thoáng đãng */}
          <rect
            x={-370}
            y={-282}
            width={740}
            height={62}
            rx={31}
            fill="#141414"
            transform="translate(5, 6)"
          />
          <rect
            x={-370}
            y={-282}
            width={740}
            height={62}
            rx={31}
            fill="#FEF08A"
            stroke="#141414"
            strokeWidth={4.5}
          />
          <text
            x={0}
            y={-242}
            textAnchor="middle"
            fill="#141414"
            fontSize={30}
            fontWeight={900}
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {title}
          </text>

          {/* Vòng cung bán nguyệt 3 vùng: R = 210, outerR = 243 (arcTopY = -243) */}
          <g transform="translate(0, 115)">
            {/* Bóng đổ nhẹ dưới chân vòm */}
            <ellipse cx={0} cy={18} rx={255} ry={18} fill="rgba(15, 23, 42, 0.10)" />
            {/* Nền vòm ngoài */}
            <path
              d="M -210,0 A 210,210 0 0,1 210,0"
              fill="none"
              stroke="#141414"
              strokeWidth={66}
              strokeLinecap="butt"
            />
            {/* Vùng TRÁI: -180° đến -120° */}
            <path
              d="M -210,0 A 210,210 0 0,1 -105,-181.87"
              fill="none"
              stroke={leftArcStroke}
              strokeWidth={54}
            />
            {/* Vùng GIỮA (VÀNG): -120° đến -60° */}
            <path
              d="M -105,-181.87 A 210,210 0 0,1 105,-181.87"
              fill="none"
              stroke="#FACC15"
              strokeWidth={54}
            />
            {/* Vùng PHẢI: -60° đến 0° */}
            <path
              d="M 105,-181.87 A 210,210 0 0,1 210,0"
              fill="none"
              stroke={rightArcStroke}
              strokeWidth={54}
            />

            {/* Nhãn 3 vùng tách bạch hoàn toàn khỏi vòng cung (chỉ gắn % ở chế độ EXACT_QUANTITATIVE) */}
            <text x={-268} y={-85} textAnchor="end" fill={leftLabelColor} fontSize={23} fontWeight={900} fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif">
              {isQuantitative ? `${leftBaseLabel} (0%)` : leftBaseLabel}
            </text>
            <text x={0} y={-271} textAnchor="middle" fill="#D97706" fontSize={23} fontWeight={900} fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif">
              {isQuantitative ? `${midBaseLabel} (50%)` : midBaseLabel}
            </text>
            <text x={268} y={-85} textAnchor="start" fill={rightLabelColor} fontSize={23} fontWeight={900} fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif">
              {isQuantitative ? `${rightBaseLabel} (100%)` : rightBaseLabel}
            </text>

            {/* Kim đồng hồ xoay mượt */}
            <g transform={`rotate(${needleDeg.toFixed(2)})`}>
              <polygon
                points="-12,16 0,-182 12,16"
                fill="#141414"
                stroke="#FFFFFF"
                strokeWidth={3}
              />
              <circle cx={0} cy={-142} r={8} fill="#EF4444" />
            </g>
            {/* Tâm chốt kim */}
            <circle cx={0} cy={0} r={28} fill="#1E293B" stroke="#141414" strokeWidth={6} />
            <circle cx={0} cy={0} r={11} fill="#FACC15" />
          </g>

          {/* Nhãn trạng thái dưới đáy */}
          <g transform="translate(0, 200)">
            <rect
              x={-statusPillW / 2}
              y={-36}
              width={statusPillW}
              height={72}
              rx={20}
              fill="#141414"
              transform="translate(5, 6)"
            />
            <rect
              x={-statusPillW / 2}
              y={-36}
              width={statusPillW}
              height={72}
              rx={20}
              fill={pillBg}
              stroke="#141414"
              strokeWidth={4.5}
            />
            <text
              x={0}
              y={10}
              textAnchor="middle"
              fill={pillTextColor}
              fontSize={28}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {displayStatusLabel}
            </text>
          </g>
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 4. CANDLE_HOURGLASS_CARD V10.3: Ngôn Ngữ Không Hộp Toàn Màn Hình Tối (#0F172A)
  // - Giữ đếm đơn điệu mượt mà 100% -> 20% khi kịch bản nêu rõ tỷ lệ ("giảm còn một phần năm" / targetPercent)
  // - Nếu kịch bản định tính (QUALITATIVE_STATE) thì chỉ hiện chữ "LỬA NẾN THU NHỎ", không bịa %
  // ===========================================================================
  if (cardType === "CANDLE_HOURGLASS_CARD") {
    const title = props.title || "HẠ THẤP TRAO ĐỔI CHẤT";
    const subLabel = props.candleLabel || "TỐC ĐỘ ĐỐT NĂNG LƯỢNG GIẢM CÒN MỘT PHẦN NĂM";
    const effectiveMetricMode = inferMetricModeForCard({
      metricMode: props.metricMode,
      cardType: "CANDLE_HOURGLASS_CARD",
      targetPercent: props.targetPercent,
      narrationText: props.narrationText,
      labelText: subLabel,
    });
    const burnProgress = computeDisplayProgress(localFrame, durationFrames, 18, 42);
    const endPct =
      typeof props.targetPercent === "number" && Number.isFinite(props.targetPercent)
        ? Math.max(5, Math.min(95, props.targetPercent))
        : 20;
    const candleHeight = 225 - burnProgress * 130;
    const candleTopY = 120 - candleHeight;
    const flamePct = Math.round(100 - burnProgress * (100 - endPct)); // 100% -> 20% tuyệt đối đơn điệu!
    const minFlameScale = endPct / 100;
    const flameScale = Math.max(
      minFlameScale,
      1.0 - burnProgress * (1.0 - minFlameScale) + Math.sin(localFrame * 0.25) * 0.015
    );
    const candleStatusText = formatStateBadgeLabel(
      "LỬA NẾN THU NHỎ",
      effectiveMetricMode,
      effectiveMetricMode === "EXACT_QUANTITATIVE" ? flamePct : undefined
    );
    const headerW = Math.max(460, Math.min(860, title.length * 22 + 96));

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <defs>
          <linearGradient id="candleFullDarkBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="68%" stopColor="#161D36" />
            <stop offset="100%" stopColor="#0B0F1A" />
          </linearGradient>
          <radialGradient id="candleWarmHalo" cx="35%" cy="46%" r="44%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={(0.32 * flameScale).toFixed(2)} />
            <stop offset="45%" stopColor="#EA580C" stopOpacity={(0.12 * flameScale).toFixed(2)} />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="candleDarkFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        {/* Phông nền tối toàn màn hình #0F172A + lưới kỹ thuật chìm đồng bộ Beat 8 */}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#candleFullDarkBg)" />
        {Array.from({ length: 19 }).map((_, i) => (
          <line key={`cg_v_${i}`} x1={i * 100} y1={0} x2={i * 100} y2={840} stroke="#334155" strokeWidth={1} opacity={0.2} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`cg_h_${i}`} x1={0} y1={i * 95} x2={1920} y2={i * 95} stroke="#334155" strokeWidth={1} opacity={0.2} />
        ))}

        {/* Ánh sáng tỏa ấm từ ngọn nến lan khắp phông nền tối */}
        <rect x={0} y={0} width={1920} height={840} fill="url(#candleWarmHalo)" />

        {/* Mặt sàn tối đồng bộ với DARK_STAGE_FLOOR */}
        <rect x={0} y={840} width={1920} height={240} fill="url(#candleDarkFloor)" />
        <line x1={0} y1={840} x2={1920} y2={840} stroke="#38BDF8" strokeWidth={4} opacity={0.75} />

        {/* Tiêu đề từ khóa đỉnh khung hình (Top-Center Impact Header tại y = 82px) */}
        <g transform={`translate(960, ${UNIVERSAL_STAGE_CONSTANTS.TOP_IMPACT_HEADER_Y}) scale(${enterScale.toFixed(3)})`}>
          <rect
            x={-headerW / 2}
            y={-30}
            width={headerW}
            height={60}
            rx={30}
            fill="#141414"
            transform="translate(5, 6)"
          />
          <rect
            x={-headerW / 2}
            y={-30}
            width={headerW}
            height={60}
            rx={30}
            fill="#FACC15"
            stroke="#141414"
            strokeWidth={4.5}
          />
          <text
            x={0}
            y={9}
            textAnchor="middle"
            fill="#141414"
            fontSize={28}
            fontWeight={900}
            letterSpacing="1px"
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {title.toUpperCase()}
          </text>
        </g>

        {/* Nội dung Ngọn Nến & Đồng Hồ Cát kích thước lớn đặt thoáng đãng trực tiếp trên phông nền tối */}
        <g transform={`translate(960, 485) scale(${(enterScale * cameraZoom * 1.18).toFixed(3)})`}>
          {/* BÊN TRÁI: NGỌN NẾN ĐANG CHÁY CẠN DẦN (LỬA THU NHỎ 100% -> 35%) */}
          <g transform="translate(-285, 5)">
            <circle
              cx={0}
              cy={candleTopY - 45 * flameScale}
              r={135 * flameScale}
              fill="#FACC15"
              opacity={0.22}
            />
            <circle
              cx={0}
              cy={candleTopY - 45 * flameScale}
              r={75 * flameScale}
              fill="#F97316"
              opacity={0.34}
            />
            <ellipse cx={0} cy={135} rx={125} ry={22} fill="rgba(0,0,0,0.45)" />
            <ellipse cx={0} cy={125} rx={112} ry={20} fill="#94A3B8" stroke="#141414" strokeWidth={5} />
            <rect
              x={-50}
              y={candleTopY}
              width={100}
              height={candleHeight}
              rx={10}
              fill="#FEFCE8"
              stroke="#141414"
              strokeWidth={5}
            />
            <path
              d={`M -34,${candleTopY + 6} Q -40,${candleTopY + 42} -28,${candleTopY + 52} Q -20,${candleTopY + 42} -24,${candleTopY + 6} Z`}
              fill="#FDE047"
              stroke="#141414"
              strokeWidth={3}
            />
            <line x1={0} y1={candleTopY} x2={0} y2={candleTopY - 16} stroke="#141414" strokeWidth={5} />
            <g transform={`translate(0, ${candleTopY - 18}) scale(${flameScale.toFixed(3)})`}>
              <path
                d="M 0,-76 C 32,-38 36,0 0,6 C -36,0 -32,-38 0,-76 Z"
                fill="#F97316"
                stroke="#141414"
                strokeWidth={4}
              />
              <path
                d="M 0,-48 C 16,-24 18,-2 0,3 C -18,-2 -16,-24 0,-48 Z"
                fill="#FEF08A"
              />
            </g>
            <text
              x={0}
              y={174}
              textAnchor="middle"
              fill="#F8FAFC"
              fontSize={22}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {candleStatusText}
            </text>
          </g>

          <line x1={0} y1={-175} x2={0} y2={165} stroke="#475569" strokeWidth={3.5} strokeDasharray="12 12" opacity={0.7} />

          {/* BÊN PHẢI: ĐỒNG HỒ CÁT RÚT MỰC CÁT TỪ BẦU TRÊN XUỐNG BẦU DƯỚI */}
          <g transform="translate(285, 5)">
            <ellipse cx={0} cy={135} rx={125} ry={22} fill="rgba(0,0,0,0.45)" />
            <rect x={-98} y={-138} width={196} height={24} rx={8} fill="#D97706" stroke="#141414" strokeWidth={5} />
            <rect x={-98} y={108} width={196} height={24} rx={8} fill="#D97706" stroke="#141414" strokeWidth={5} />
            <line x1={-76} y1={-114} x2={-76} y2={108} stroke="#B45309" strokeWidth={9} />
            <line x1={76} y1={-114} x2={76} y2={108} stroke="#B45309" strokeWidth={9} />

            <path
              d="M -64,-114 C -64,-35 -12,-12 -8,0 C -12,12 -64,35 -64,108 L 64,108 C 64,35 12,12 8,0 C 12,-12 64,-35 64,-114 Z"
              fill="#1E293B"
              stroke="#94A3B8"
              strokeWidth={4.5}
            />
            {(() => {
              const topSandH = Math.max(10, 82 * (1 - burnProgress * 0.85));
              return (
                <path
                  d={`M ${-54 * (topSandH / 82)},${-6 - topSandH} L ${54 * (topSandH / 82)},${
                    -6 - topSandH
                  } L 6,-4 L -6,-4 Z`}
                  fill="#FACC15"
                />
              );
            })()}
            <line
              x1={0}
              y1={-4}
              x2={0}
              y2={105}
              stroke="#FACC15"
              strokeWidth={4.5}
              strokeDasharray="6 4"
              strokeDashoffset={-localFrame * 1.8}
            />
            {(() => {
              const botSandH = 14 + 74 * burnProgress;
              return (
                <path
                  d={`M -56,105 L 56,105 L ${16 * (1 - burnProgress * 0.45)},${105 - botSandH} L ${
                    -16 * (1 - burnProgress * 0.45)
                  },${105 - botSandH} Z`}
                  fill="#FACC15"
                />
              );
            })()}
            <text
              x={0}
              y={174}
              textAnchor="middle"
              fill="#F8FAFC"
              fontSize={22}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              THỜI GIAN ĐẾM NGƯỢC
            </text>
          </g>

          {/* Nhãn tóm tắt nổi phía dưới */}
          <rect
            x={-410}
            y={210}
            width={820}
            height={54}
            rx={27}
            fill="#141414"
            transform="translate(5, 6)"
          />
          <rect
            x={-410}
            y={210}
            width={820}
            height={54}
            rx={27}
            fill="#FEF08A"
            stroke="#141414"
            strokeWidth={4.5}
          />
          <text
            x={0}
            y={245}
            textAnchor="middle"
            fill="#141414"
            fontSize={22}
            fontWeight={900}
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {subLabel}
          </text>
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 5. BALANCE_SCALE_CARD: Cán Cân So Sánh Nghiêng Trực Tiếp Trên SOFT_GRAPH_GRID
  // u < 0.25: Đòn cân ngang 0°; u >= 0.25: Khối đỏ đập xuống làm nghiêng -18° với dao động lò xo tắt dần
  // ===========================================================================
  if (cardType === "BALANCE_SCALE_CARD") {
    const effectiveMetricMode = inferMetricModeForCard({
      metricMode: props.metricMode,
      cardType: "BALANCE_SCALE_CARD",
      narrationText: props.narrationText,
    });
    const leftLabel = stripFabricatedPercentSuffix(
      props.leftPanLabel || "CƠN ĐÓI CỒN CÀO",
      effectiveMetricMode
    );
    const rightLabel = stripFabricatedPercentSuffix(
      props.rightPanLabel || "NỖI SỢ BỊ THƯƠNG",
      effectiveMetricMode
    );
    const heavySide = props.heavySide || "left";
    const title = props.title || "CÁN CÂN QUYẾT ĐỊNH SINH TỒN";
    const targetTilt = heavySide === "left" ? -18 : 18;

    let beamTilt = 0;
    let heavyBlockDropOffsetY = 0;
    let showImpactRipples = false;

    if (u < 0.25) {
      const fallP = smoothstep(0.04, 0.25, u);
      heavyBlockDropOffsetY = -145 * (1 - fallP * fallP);
      beamTilt = 0;
    } else {
      const tSpring = (u - 0.25) / 0.75;
      const dampedSpring = 1 - Math.exp(-tSpring * 6.5) * Math.cos(tSpring * Math.PI * 5.5);
      beamTilt = targetTilt * dampedSpring;
      showImpactRipples = u >= 0.25 && u <= 0.42;
    }

    const rad = (beamTilt * Math.PI) / 180;
    const armLen = 305;
    const leftPanX = -Math.cos(rad) * armLen;
    const leftPanY = -Math.sin(rad) * armLen;
    const rightPanX = Math.cos(rad) * armLen;
    const rightPanY = Math.sin(rad) * armLen;

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <g transform={`translate(960, 480) scale(${(enterScale * cameraZoom * 1.12).toFixed(3)})`}>
          {/* Băng rôn tiêu đề nổi bật phía trên */}
          <rect
            x={-340}
            y={-288}
            width={680}
            height={60}
            rx={30}
            fill="#141414"
            transform="translate(5, 6)"
          />
          <rect
            x={-340}
            y={-288}
            width={680}
            height={60}
            rx={30}
            fill="#FEF08A"
            stroke="#141414"
            strokeWidth={4.5}
          />
          <text
            x={0}
            y={-249}
            textAnchor="middle"
            fill="#141414"
            fontSize={30}
            fontWeight={900}
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {title}
          </text>

          {/* Trụ cán cân chính giữa đặt trực tiếp trên nền lưới */}
          <g transform="translate(0, -50)">
            {/* Bóng đổ mặt sàn dưới đế cân */}
            <ellipse cx={0} cy={282} rx={210} ry={18} fill="rgba(15, 23, 42, 0.14)" />
            {/* Đế cân */}
            <rect x={-145} y={245} width={290} height={36} rx={16} fill="#475569" stroke="#141414" strokeWidth={5.5} />
            <polygon points="-26,245 -15,-65 15,-65 26,245" fill="#64748B" stroke="#141414" strokeWidth={5.5} />

            {/* Thanh đòn cân xoay theo lò xo tắt dần */}
            <g transform={`translate(0, -55) rotate(${beamTilt.toFixed(2)})`}>
              <rect x={-325} y={-12} width={650} height={24} rx={12} fill="#F59E0B" stroke="#141414" strokeWidth={5} />
            </g>
            <circle cx={0} cy={-55} r={25} fill="#FACC15" stroke="#141414" strokeWidth={5.5} />

            {/* Đĩa cân bên TRÁI (Treo thẳng đứng theo trọng lực 0° trong hệ tọa độ thế giới, mặt đĩa song song mặt đất) */}
            <g transform={`translate(${leftPanX.toFixed(1)}, ${(-55 + leftPanY).toFixed(1)}) rotate(0)`}>
              <circle cx={0} cy={0} r={9} fill="#FACC15" stroke="#141414" strokeWidth={4} />
              <line x1={0} y1={0} x2={-82} y2={162} stroke="#141414" strokeWidth={4.5} />
              <line x1={0} y1={0} x2={0} y2={80} stroke="#475569" strokeWidth={3.5} strokeDasharray="6 4" />
              <line x1={0} y1={0} x2={82} y2={162} stroke="#141414" strokeWidth={4.5} />
              <path d="M -115,162 L 115,162 Q 98,196 0,196 Q -98,196 -115,162 Z" fill="#FACC15" stroke="#141414" strokeWidth={5} />
              {/* Vệt chấn động khi khối nặng đập xuống */}
              {showImpactRipples && (
                <g opacity={1 - (u - 0.25) / 0.17}>
                  <ellipse cx={0} cy={172} rx={155} ry={28} fill="none" stroke="#EF4444" strokeWidth={4} strokeDasharray="14 8" />
                </g>
              )}
              {/* Khối nặng trên đĩa trái */}
              <g transform={`translate(0, ${heavySide === "left" ? heavyBlockDropOffsetY.toFixed(1) : "0"})`}>
                <rect
                  x={-140}
                  y={80}
                  width={280}
                  height={80}
                  rx={18}
                  fill="#141414"
                  transform="translate(5, 6)"
                />
                <rect
                  x={-140}
                  y={80}
                  width={280}
                  height={80}
                  rx={18}
                  fill={heavySide === "left" ? "#EF4444" : "#F8FAFC"}
                  stroke="#141414"
                  strokeWidth={5}
                />
                <text
                  x={0}
                  y={128}
                  textAnchor="middle"
                  fill={heavySide === "left" ? "#FFFFFF" : "#1E293B"}
                  fontSize={22}
                  fontWeight={900}
                  fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                >
                  {leftLabel}
                </text>
              </g>
            </g>

            {/* Đĩa cân bên PHẢI (Treo thẳng đứng theo trọng lực 0° trong hệ tọa độ thế giới, mặt đĩa song song mặt đất) */}
            <g transform={`translate(${rightPanX.toFixed(1)}, ${(-55 + rightPanY).toFixed(1)}) rotate(0)`}>
              <circle cx={0} cy={0} r={9} fill="#FACC15" stroke="#141414" strokeWidth={4} />
              <line x1={0} y1={0} x2={-82} y2={162} stroke="#141414" strokeWidth={4.5} />
              <line x1={0} y1={0} x2={0} y2={80} stroke="#475569" strokeWidth={3.5} strokeDasharray="6 4" />
              <line x1={0} y1={0} x2={82} y2={162} stroke="#141414" strokeWidth={4.5} />
              <path d="M -115,162 L 115,162 Q 98,196 0,196 Q -98,196 -115,162 Z" fill="#FACC15" stroke="#141414" strokeWidth={5} />
              <rect
                x={-140}
                y={80}
                width={280}
                height={80}
                rx={18}
                fill="#141414"
                transform="translate(5, 6)"
              />
              <rect
                x={-140}
                y={80}
                width={280}
                height={80}
                rx={18}
                fill={heavySide === "right" ? "#EF4444" : "#F8FAFC"}
                stroke="#141414"
                strokeWidth={5}
              />
              <text
                x={0}
                y={128}
                textAnchor="middle"
                fill={heavySide === "right" ? "#FFFFFF" : "#1E293B"}
                fontSize={22}
                fontWeight={900}
                fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
              >
                {rightLabel}
              </text>
            </g>
          </g>
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 6. SIMPLE_CHART_CARD V10.3: Biểu Đồ Phóng Khoáng Trực Tiếp Trên SOFT_GRAPH_GRID (Không Khung Hộp Trắng Thừa)
  // - Tuân thủ Information Precision Policy: Mốc trục rõ ràng khi EXACT_QUANTITATIVE (100% -> targetPercent = 20%),
  //   hoặc nhãn định tính (CAO / TRUNG BÌNH / THẤP) khi QUALITATIVE_STATE.
  // ===========================================================================
  if (cardType === "SIMPLE_CHART_CARD") {
    const mode = props.chartMode || "line";
    const chartTrend = props.chartTrend || "falling";
    const isRising = chartTrend === "rising";
    const chartTitle = props.chartTitle || props.title || "MỨC ĐỐT NĂNG LƯỢNG THEO THỜI GIAN";
    const effectiveMetricMode = inferMetricModeForCard({
      metricMode: props.metricMode,
      cardType: "SIMPLE_CHART_CARD",
      targetPercent: props.targetPercent,
      narrationText: props.narrationText,
      labelText: props.chartEndLabel,
    });
    const isQuantitative = effectiveMetricMode === "EXACT_QUANTITATIVE";
    const targetEndPct =
      typeof props.targetPercent === "number" && Number.isFinite(props.targetPercent)
        ? Math.max(0, Math.min(100, Math.round(props.targetPercent)))
        : 20;
    // Đồng bộ monotonic chuẩn V10.2 (chỉ vẽ mượt trong thời gian đọc thoại, giữ ổn định ở tail-hold)
    const displayP = computeDisplayProgress(localFrame, durationFrames, 18, 42);
    const drawProgress = smoothstep(0.03, 0.86, displayP);
    const clipWidth = Math.max(0, 690 * drawProgress);
    const startPointLabel = props.chartStartLabel
      ? stripFabricatedPercentSuffix(props.chartStartLabel, effectiveMetricMode)
      : isRising
      ? "YÊN TĨNH"
      : isQuantitative
      ? "100% (BÌNH THƯỜNG)"
      : "MỨC BÌNH THƯỜNG";
    const endBadgeLabel = isQuantitative && !isRising
      ? props.chartEndLabel || `GIẢM CÒN ${targetEndPct}% (TIẾT KIỆM)`
      : stripFabricatedPercentSuffix(
          props.chartEndLabel || (isRising ? "BÙNG NỔ BÁO ĐỘNG" : "GIẢM SÂU (TIẾT KIỆM)"),
          "QUALITATIVE_STATE"
        );
    const xTicks =
      props.chartXLabels && props.chartXLabels.length === 4
        ? [
            { x: -320, label: props.chartXLabels[0] },
            { x: -105, label: props.chartXLabels[1] },
            { x: 115, label: props.chartXLabels[2] },
            { x: 330, label: props.chartXLabels[3] },
          ]
        : props.chartXLabels && props.chartXLabels.length === 3
        ? [
            { x: -320, label: props.chartXLabels[0] },
            { x: 5, label: props.chartXLabels[1] },
            { x: 330, label: props.chartXLabels[2] },
          ]
        : [
            { x: -320, label: "Ngày 1" },
            { x: -105, label: "Tuần 2" },
            { x: 115, label: "Tuần 4" },
            { x: 330, label: "Tuần 8" },
          ];
    const lineCurveD = isRising
      ? "M -320,132 C -175,124 -55,62 95,-34 C 195,-96 270,-112 330,-116"
      : "M -320,-105 C -160,-95 -40,45 120,105 C 210,130 285,135 330,138";
    const areaCurveD = `${lineCurveD} L 330,165 L -320,165 Z`;

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <defs>
          <linearGradient id="chartRedOrangeArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={isRising ? "0.34" : "0.24"} />
            <stop offset="65%" stopColor="#F97316" stopOpacity={isRising ? "0.18" : "0.14"} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.03" />
          </linearGradient>
          <clipPath id="chartDrawClip">
            <rect x={-340} y={-180} width={clipWidth} height={360} />
          </clipPath>
        </defs>

        <g transform={`translate(960, 475) scale(${(enterScale * cameraZoom * 1.10).toFixed(3)})`}>
          {/* Băng rôn tiêu đề nổi phía trên (không đóng khung hộp chữ nhật trắng quanh biểu đồ) */}
          {(() => {
            const titleW = Math.max(740, Math.min(1020, chartTitle.length * 22 + 110));
            return (
              <>
                <rect
                  x={-titleW / 2}
                  y={-278}
                  width={titleW}
                  height={62}
                  rx={31}
                  fill="#141414"
                  transform="translate(5, 6)"
                />
                <rect
                  x={-titleW / 2}
                  y={-278}
                  width={titleW}
                  height={62}
                  rx={31}
                  fill="#FEF08A"
                  stroke="#141414"
                  strokeWidth={4.5}
                />
                <text
                  x={0}
                  y={-238}
                  textAnchor="middle"
                  fill="#141414"
                  fontSize={chartTitle.length > 34 ? 26 : 30}
                  fontWeight={900}
                  fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                >
                  {chartTitle}
                </text>
              </>
            );
          })()}

          {/* Đường lưới ngang tham chiếu nhẹ */}
          {[-105, -15, 75].map((gy, idx) => (
            <g key={`grid_row_${idx}`}>
              <line
                x1={-360}
                y1={gy}
                x2={380}
                y2={gy}
                stroke="#CBD5E1"
                strokeWidth={3}
                strokeDasharray="10 8"
              />
              <text
                x={-380}
                y={gy + 7}
                textAnchor="end"
                fill="#475569"
                fontSize={19}
                fontWeight={800}
                fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
              >
                {isQuantitative && !isRising
                  ? idx === 0
                    ? "100%"
                    : idx === 1
                    ? "60%"
                    : `${targetEndPct}%`
                  : idx === 0
                  ? "CAO"
                  : idx === 1
                  ? "VỪA"
                  : "THẤP"}
              </text>
            </g>
          ))}

          {mode === "line" ? (
            <g>
              {/* Vùng màu gradient đỏ-cam bán trong suốt bên dưới đường cong */}
              <path
                d={areaCurveD}
                fill="url(#chartRedOrangeArea)"
                clipPath="url(#chartDrawClip)"
              />

              {/* Đường cong diễn biến (tăng vọt hoặc suy giảm) */}
              <path
                d={lineCurveD}
                fill="none"
                stroke="#EF4444"
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={920}
                strokeDashoffset={920 * (1 - drawProgress)}
              />

              {/* Điểm mốc khởi đầu */}
              <circle cx={-320} cy={isRising ? 132 : -105} r={14} fill="#22C55E" stroke="#141414" strokeWidth={4.5} />
              <text
                x={-295}
                y={isRising ? 102 : -124}
                fill="#15803D"
                fontSize={21}
                fontWeight={900}
                fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
              >
                {startPointLabel}
              </text>

              {drawProgress > 0.35 && (
                <circle cx={isRising ? -45 : -105} cy={isRising ? 64 : -12} r={10} fill="#F97316" stroke="#141414" strokeWidth={3.5} />
              )}
              {drawProgress > 0.62 && (
                <circle cx={isRising ? 115 : 115} cy={isRising ? -48 : 104} r={10} fill="#EF4444" stroke="#141414" strokeWidth={3.5} />
              )}

              {drawProgress > 0.65 && (
                <g transform={isRising ? "translate(260, -168)" : "translate(260, 64)"}>
                  <circle cx={70} cy={isRising ? 52 : 74} r={16} fill="#EF4444" stroke="#141414" strokeWidth={4.5} />
                  <rect
                    x={-225}
                    y={-38}
                    width={315}
                    height={62}
                    rx={18}
                    fill="#141414"
                    transform="translate(4, 5)"
                  />
                  <rect
                    x={-225}
                    y={-38}
                    width={315}
                    height={62}
                    rx={18}
                    fill={isRising ? "#FEE2E2" : "#FEF08A"}
                    stroke="#141414"
                    strokeWidth={4}
                  />
                  <text
                    x={-68}
                    y={1}
                    textAnchor="middle"
                    fill={isRising ? "#DC2626" : "#141414"}
                    fontSize={21}
                    fontWeight={900}
                    fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                  >
                    {endBadgeLabel}
                  </text>
                </g>
              )}

              {/* Các mốc thời gian trên trục hoành */}
              {xTicks.map((tick, tIdx) => (
                <g key={`x_tick_${tIdx}`} transform={`translate(${tick.x}, 165)`}>
                  <line x1={0} y1={0} x2={0} y2={14} stroke="#141414" strokeWidth={5} strokeLinecap="round" />
                  <text
                    x={0}
                    y={44}
                    textAnchor="middle"
                    fill="#141414"
                    fontSize={22}
                    fontWeight={900}
                    fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}
            </g>
          ) : (
            <g>
              {(() => {
                const h1 = 240 * drawProgress;
                const h2 = 68 * drawProgress;
                return (
                  <>
                    <rect
                      x={-210}
                      y={165 - h1}
                      width={130}
                      height={h1}
                      rx={12}
                      fill="#22C55E"
                      stroke="#141414"
                      strokeWidth={5}
                    />
                    <text x={-145} y={208} textAnchor="middle" fill="#141414" fontSize={22} fontWeight={900} fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif">
                      {props.leftBarLabel || "KHI NO ĐỦ"}
                    </text>

                    <rect
                      x={90}
                      y={165 - h2}
                      width={130}
                      height={h2}
                      rx={12}
                      fill="#EF4444"
                      stroke="#141414"
                      strokeWidth={5}
                    />
                    <text x={155} y={208} textAnchor="middle" fill="#141414" fontSize={22} fontWeight={900} fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif">
                      {props.rightBarLabel || "KHI ĐÓI 6 TUẦN"}
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {/* Trục tọa độ chữ L đậm nét nằm trực tiếp trên nền giấy kẻ ô */}
          <line x1={-360} y1={-155} x2={-360} y2={165} stroke="#141414" strokeWidth={7} strokeLinecap="round" />
          <polygon points="-360,-172 -372,-148 -348,-148" fill="#141414" />
          <line x1={-360} y1={165} x2={395} y2={165} stroke="#141414" strokeWidth={7} strokeLinecap="round" />
          <polygon points="412,165 388,153 388,177" fill="#141414" />
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 7. TWO_DOORS_CARD V10.3: Neutral-to-Decision Dual Morph + No Fake Metrics (QUALITATIVE_STATE)
  // - Pha 1 (displayP: 0.00 -> 0.25): CẢ HAI cánh cửa bắt đầu cùng màu xám trung tính (#E2E8F0/#CBD5E1),
  //   không tỏa sáng, nhãn trạng thái trung tính ("CHẾ ĐỘ CHỜ" / "CHỜ XỬ LÝ") — tuyệt đối không ghi %.
  // - Pha 2 (displayP: 0.25 -> 0.62): Nội suy màu mượt đồng thời cho cả hai bên:
  //   * Cửa Trái: Xám trung tính (#E2E8F0) -> Vàng rực sáng (#FACC15), hào quang ấm dần, dấu tích xanh spring pop,
  //     nhãn chuyển sang "ƯU TIÊN TUYỆT ĐỐI" (sạch bóng "(100%)").
  //   * Cửa Phải: Xám trung tính (#E2E8F0) -> Xám đậm đóng băng (#64748B), ổ khóa đỏ & 2 dây xích chéo sập xuống,
  //     nhãn chuyển từ "ĐANG KHÓA CHẶT..." -> "TẠM ĐÓNG BĂNG" (sạch bóng "(79%)", "(9%)", "(0%)").
  // - Pha 3 (displayP: 0.62 -> 1.00): Các hạt ánh sáng vàng truyền từ Cửa Phải sang bồi đắp Cửa Trái & giữ kết quả.
  // ===========================================================================
  if (cardType === "TWO_DOORS_CARD") {
    const P = DUAL_DECISION_PALETTE;
    const effectiveMetricMode = inferMetricModeForCard({
      metricMode: props.metricMode,
      cardType: "TWO_DOORS_CARD",
      narrationText: props.narrationText,
    });
    const leftTitle = stripFabricatedPercentSuffix(
      props.leftDoorTitle || "DUY TRÌ SỰ SỐNG",
      effectiveMetricMode
    );
    const rightTitle = stripFabricatedPercentSuffix(
      props.rightDoorTitle || "SINH SẢN & ĐẺ TRỨNG",
      effectiveMetricMode
    );
    const leftFinalSub = stripFabricatedPercentSuffix(
      props.leftDoorSub || "ƯU TIÊN TUYỆT ĐỐI",
      effectiveMetricMode
    );
    const rightFinalSub = stripFabricatedPercentSuffix(
      props.rightDoorSub || "TẠM ĐÓNG BĂNG",
      effectiveMetricMode
    );
    const leftNeutralSub = stripFabricatedPercentSuffix(
      props.leftNeutralSub || "CHẾ ĐỘ CHỜ",
      effectiveMetricMode
    );
    const rightNeutralSub = stripFabricatedPercentSuffix(
      props.rightNeutralSub || "CHỜ XỬ LÝ",
      effectiveMetricMode
    );
    const leftMorphingSub = stripFabricatedPercentSuffix(
      props.leftMorphingSub || "ĐANG ƯU TIÊN...",
      effectiveMetricMode
    );
    const rightMorphingSub = stripFabricatedPercentSuffix(
      props.rightMorphingSub || "ĐANG KHÓA CHẶT...",
      effectiveMetricMode
    );

    const displayP = computeDisplayProgress(localFrame, durationFrames, 18, 42);
    const morph = computeDualDecisionMorph(displayP);
    const { morphT, slamT, checkPopT, energyTransferT } = morph;
    const isDangerRedTheme = props.accentTheme === "DANGER_RED";

    const chosenDoorTarget = isDangerRedTheme ? "#F97316" : P.CHOSEN_DOOR_FILL;
    const chosenFrameTarget = isDangerRedTheme ? "#FFEDD5" : P.CHOSEN_FRAME_FILL;
    const chosenPanelTarget = isDangerRedTheme ? "#FB923C" : P.CHOSEN_PANEL_FILL;
    const chosenHaloColor = isDangerRedTheme ? "#EF4444" : P.CHOSEN_HALO;
    const chosenIconTarget = isDangerRedTheme ? "#DC2626" : P.CHOSEN_ICON_BG;
    const chosenBadgeBgTarget = isDangerRedTheme ? "#FEE2E2" : P.CHOSEN_BADGE_BG;
    const chosenBadgeTextTarget = isDangerRedTheme ? "#DC2626" : P.CHOSEN_BADGE_TEXT;
    const orbOuterColor = isDangerRedTheme ? "#EF4444" : "#FACC15";
    const orbInnerColor = isDangerRedTheme ? "#FED7AA" : "#FEF08A";
    const orbStrokeColor = isDangerRedTheme ? "#DC2626" : "#F59E0B";

    // --- CỬA TRÁI (CHOSEN): Nội suy mượt Xám trung tính (#E2E8F0) -> Vàng rực sáng (#FACC15) hoặc Đỏ Cam cảnh báo (#F97316) ---
    const leftDoorFill = interpolateHexColor(P.NEUTRAL_DOOR_FILL, chosenDoorTarget, morphT);
    const leftFrameFill = interpolateHexColor(P.NEUTRAL_FRAME_FILL, chosenFrameTarget, morphT);
    const leftPanelFill = interpolateHexColor(P.NEUTRAL_PANEL_FILL, chosenPanelTarget, morphT);
    const leftTitleColor = interpolateHexColor(
      P.NEUTRAL_TITLE,
      isDangerRedTheme ? "#B91C1C" : P.CHOSEN_TITLE,
      morphT
    );
    const leftIconBg = interpolateHexColor(P.NEUTRAL_ICON_BG, chosenIconTarget, morphT);
    const leftBadgeBg = interpolateHexColor(P.NEUTRAL_BADGE_BG, chosenBadgeBgTarget, morphT);
    const leftBadgeTextColor = interpolateHexColor(
      P.NEUTRAL_BADGE_TEXT,
      chosenBadgeTextTarget,
      morphT
    );

    const leftDynamicSub =
      displayP < 0.25
        ? leftNeutralSub
        : displayP < 0.56
        ? leftMorphingSub
        : leftFinalSub;

    // Pha 1: Không tỏa sáng (0.0); Pha 2: Hào quang ấm dần lên (0.0 -> 0.36); Pha 3: Nhận năng lượng rực sáng (0.36 -> 0.58)
    let leftBoostScale = 1.0;
    let leftAuraOpacity = 0.36 * morphT;
    if (displayP >= 0.62) {
      const boostT = energyTransferT;
      leftBoostScale =
        boostT < 0.5
          ? 1.0 + 0.05 * (boostT / 0.5)
          : 1.05 - 0.025 * ((boostT - 0.5) / 0.5);
      leftAuraOpacity = 0.36 + 0.24 * Math.sin(boostT * Math.PI * 0.85);
    }

    // Dấu tích xanh bật nảy đàn hồi (spring) trong Pha 2 + nhấp nhẹ khi nhận năng lượng ở Pha 3
    const waitDotsOpacity = 1 - smoothstep(0.0, 0.35, morphT);
    const checkScale =
      checkPopT <= 0
        ? 0
        : checkPopT < 1
        ? easeOutBack(checkPopT)
        : 1.0 + 0.1 * Math.sin(clamp01(energyTransferT / 0.45) * Math.PI);

    // --- CỬA PHẢI (FROZEN): Nội suy mượt Xám trung tính (#E2E8F0) -> Xám đậm đóng băng (#64748B) ---
    const rightDoorFill = interpolateHexColor(P.NEUTRAL_DOOR_FILL, P.FROZEN_DOOR_FILL, morphT);
    const rightFrameFill = interpolateHexColor(P.NEUTRAL_FRAME_FILL, P.FROZEN_FRAME_FILL, morphT);
    const rightPanelFill = interpolateHexColor(P.NEUTRAL_PANEL_FILL, P.FROZEN_PANEL_FILL, morphT);
    const rightTitleColor = interpolateHexColor(P.NEUTRAL_TITLE, P.FROZEN_TITLE, morphT);
    const padlockBodyColor = interpolateHexColor(P.NEUTRAL_LOCK_BODY, P.FROZEN_LOCK_BODY, slamT);
    const rightAuraOpacity = 0.24 * morphT;

    // Gọng khóa ban đầu nhấc mở trung tính (-16px, -24°), sau đó sập dứt khoát xuống (0px, 0°)
    const shackleLift = -16 * (1 - slamT);
    const shackleRot = -24 * (1 - slamT);

    // Rung cửa phải ngay thời điểm ổ khóa sập chặt ở cuối Pha 2 (displayP ∈ [0.58, 0.72])
    const isSlamShaking = displayP >= 0.58 && displayP <= 0.72;
    const rightShakeX = isSlamShaking
      ? Math.sin(localFrame * 1.6) * 6 * (1 - (displayP - 0.58) / 0.14)
      : 0;

    // Nhãn trạng thái cửa phải thuần chữ định tính (KHÔNG số % thừa), màu chuyển mượt 3 bậc
    const rightDynamicSub =
      displayP < 0.25
        ? rightNeutralSub
        : displayP < 0.62
        ? rightMorphingSub
        : rightFinalSub;

    const toAmberT = smoothstep(0.25, 0.44, displayP);
    const toRedT = smoothstep(0.52, 0.64, displayP);
    const rightBadgeBg =
      displayP < 0.52
        ? interpolateHexColor(P.NEUTRAL_BADGE_BG, P.MORPHING_BADGE_BG, toAmberT)
        : interpolateHexColor(P.MORPHING_BADGE_BG, P.FROZEN_BADGE_BG, toRedT);
    const rightSubColor =
      displayP < 0.52
        ? interpolateHexColor(P.NEUTRAL_BADGE_TEXT, P.MORPHING_BADGE_TEXT, toAmberT)
        : interpolateHexColor(P.MORPHING_BADGE_TEXT, P.FROZEN_BADGE_TEXT, toRedT);

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <g transform={`translate(960, 470) scale(${(enterScale * cameraZoom).toFixed(3)})`}>
          {/* Đường chia đôi nét đứt ở giữa */}
          <line x1={0} y1={-260} x2={0} y2={260} stroke="#94A3B8" strokeWidth={5} strokeDasharray="16 12" />

          {/* Luồng hạt sáng năng lượng vàng di chuyển mượt từ cửa phải sang bồi đắp cửa trái ở Pha 3 (displayP ∈ [0.62, 0.99]) */}
          {displayP >= 0.62 && displayP <= 0.99 && (
            <g id="energy-transfer-stream">
              {[0, 1, 2, 3, 4, 5].map((pIdx) => {
                const localP = energyTransferT * 1.45 - pIdx * 0.14;
                if (localP <= 0 || localP >= 1) return null;
                const px = 310 - 620 * localP;
                const py = -45 - Math.sin(localP * Math.PI) * 115;
                return (
                  <g key={`orb_${pIdx}`} transform={`translate(${px.toFixed(1)}, ${py.toFixed(1)})`}>
                    <circle cx={0} cy={0} r={18} fill={orbOuterColor} opacity={0.38} />
                    <circle cx={0} cy={0} r={10} fill={orbInnerColor} stroke={orbStrokeColor} strokeWidth={3} />
                  </g>
                );
              })}
            </g>
          )}

          {/* =================================================================
              CỬA TRÁI: XÁM TRUNG TÍNH (#E2E8F0) -> VÀNG RỰC SÁNG HOẶC ĐỎ CAM CẢNH BÁO
             ================================================================= */}
          <g transform={`translate(-310, 0) scale(${leftBoostScale.toFixed(3)})`}>
            {/* Vầng hào quang chỉ sáng dần lên ở Pha 2 -> Pha 3 (bằng 0 ở Pha 1 trung tính) */}
            {leftAuraOpacity > 0.005 && (
              <circle cx={0} cy={-35} r={215} fill={chosenHaloColor} opacity={leftAuraOpacity} />
            )}
            <ellipse cx={0} cy={145} rx={165} ry={16} fill="rgba(15, 23, 42, 0.14)" />

            {/* Khung bao vòm cửa trái */}
            <path
              d="M -148,142 L -148,-85 A 148,148 0 0,1 148,-85 L 148,142 Z"
              fill={leftFrameFill}
              stroke="#141414"
              strokeWidth={6}
            />
            {/* Cánh cửa vòm trái */}
            <path
              d="M -122,142 L -122,-80 A 122,122 0 0,1 122,-80 L 122,142 Z"
              fill={leftDoorFill}
              stroke="#141414"
              strokeWidth={6}
            />
            {/* Ô pano trang trí trên cánh cửa trái */}
            <rect x={-85} y={12} width={170} height={102} rx={12} fill={leftPanelFill} stroke="#141414" strokeWidth={4} />
            {/* Tay nắm cửa */}
            <circle cx={86} cy={28} r={12} fill="#141414" />

            {/* Huy hiệu trạng thái trên cửa trái: Pha 1 trung tính (•••) -> Pha 2-3 dấu tích xanh hoặc chấm than đỏ (!) bật nảy spring */}
            <g transform="translate(0, -58)">
              <circle cx={0} cy={0} r={48} fill={leftIconBg} stroke="#141414" strokeWidth={5} />
              {waitDotsOpacity > 0.02 && (
                <g opacity={waitDotsOpacity}>
                  <circle cx={-18} cy={0} r={6} fill="#64748B" />
                  <circle cx={0} cy={0} r={6} fill="#64748B" />
                  <circle cx={18} cy={0} r={6} fill="#64748B" />
                </g>
              )}
              {checkScale > 0.02 && (
                <g transform={`scale(${checkScale.toFixed(3)})`}>
                  {isDangerRedTheme ? (
                    <>
                      <rect x={-5.5} y={-24} width={11} height={28} rx={5.5} fill="#FFFFFF" />
                      <circle cx={0} cy={17} r={6.5} fill="#FFFFFF" />
                    </>
                  ) : (
                    <path
                      d="M -20,-2 L -5,14 L 24,-16"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={9}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
              )}
            </g>

            {/* Tiêu đề & Nhãn trạng thái thuần chữ cửa trái (không số % thừa) */}
            <text
              x={0}
              y={196}
              textAnchor="middle"
              fill={leftTitleColor}
              fontSize={leftTitle.length > 16 ? 26 : 32}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {leftTitle}
            </text>
            <rect x={-185} y={214} width={370} height={48} rx={24} fill={leftBadgeBg} stroke="#141414" strokeWidth={4} />
            <text x={0} y={245} textAnchor="middle" fill={leftBadgeTextColor} fontSize={20} fontWeight={900} fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif">
              {leftDynamicSub}
            </text>
          </g>

          {/* =================================================================
              CỬA PHẢI: XÁM TRUNG TÍNH (#E2E8F0) -> XÁM ĐẬM ĐÓNG BĂNG (#64748B) + Ổ KHÓA ĐỎ & XÍCH CHÉO
             ================================================================= */}
          <g transform={`translate(${(310 + rightShakeX).toFixed(1)}, 0)`}>
            {rightAuraOpacity > 0.005 && (
              <circle cx={0} cy={-35} r={195} fill={rightFrameFill} opacity={rightAuraOpacity} />
            )}
            <ellipse cx={0} cy={145} rx={165} ry={16} fill="rgba(15, 23, 42, 0.14)" />

            {/* Khung bao vòm cửa phải (Xám sáng #F1F5F9 -> Xám băng #CBD5E1) */}
            <path
              d="M -148,142 L -148,-85 A 148,148 0 0,1 148,-85 L 148,142 Z"
              fill={rightFrameFill}
              stroke="#141414"
              strokeWidth={6}
            />
            {/* Cánh cửa vòm phải (Xám trung tính #E2E8F0 -> Xám đậm đóng băng #64748B) */}
            <path
              d="M -122,142 L -122,-80 A 122,122 0 0,1 122,-80 L 122,142 Z"
              fill={rightDoorFill}
              stroke="#141414"
              strokeWidth={6}
            />
            <rect
              x={-85}
              y={12}
              width={170}
              height={102}
              rx={12}
              fill={rightPanelFill}
              stroke="#141414"
              strokeWidth={4}
            />
            <circle cx={86} cy={28} r={12} fill="#141414" />

            {/* Hai dây xích chéo xuất hiện mượt và khóa chặt cửa phải trong Pha 2 */}
            {slamT > 0.30 && (
              <g opacity={smoothstep(0.30, 0.85, slamT)}>
                <line x1={-118} y1={-55} x2={118} y2={65} stroke="#1E293B" strokeWidth={12} strokeDasharray="18 10" />
                <line x1={118} y1={-55} x2={-118} y2={65} stroke="#1E293B" strokeWidth={12} strokeDasharray="18 10" />
              </g>
            )}

            {/* 2 Vòng sóng xung kích (Shockwave Ripple Rings) khi ổ khóa sập xuống tại displayP ∈ [0.58, 0.82] */}
            {displayP >= 0.58 && displayP <= 0.82 && (() => {
              const ripT = (displayP - 0.58) / 0.24;
              return (
                <g transform="translate(0, -45)">
                  <circle
                    cx={0}
                    cy={0}
                    r={45 + ripT * 115}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={6 * (1 - ripT)}
                    opacity={1 - ripT}
                  />
                  <circle
                    cx={0}
                    cy={0}
                    r={30 + ripT * 75}
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth={5 * (1 - ripT)}
                    opacity={1 - ripT}
                  />
                </g>
              );
            })()}

            {/* Ổ khóa lớn: Pha 1 xám trung tính nhấc mở -> Pha 2 sập dứt khoát và đỏ rực */}
            <g transform="translate(0, -45)">
              <g
                transform={`translate(-26, ${(-8 + shackleLift).toFixed(1)}) rotate(${shackleRot.toFixed(
                  1
                )}) translate(26, 8)`}
              >
                <path
                  d="M -26,-8 L -26,-36 A 26,26 0 0,1 26,-36 L 26,-8"
                  fill="none"
                  stroke="#141414"
                  strokeWidth={10}
                  strokeLinecap="round"
                />
                <path
                  d="M -26,-8 L -26,-36 A 26,26 0 0,1 26,-36 L 26,-8"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              </g>
              <rect
                x={-40}
                y={-8}
                width={80}
                height={64}
                rx={14}
                fill={padlockBodyColor}
                stroke="#141414"
                strokeWidth={5.5}
              />
              <circle cx={0} cy={18} r={8.5} fill="#FFFFFF" />
              <rect x={-3.5} y={22} width={7} height={15} rx={3} fill="#FFFFFF" />
            </g>

            {/* Tiêu đề & Nhãn trạng thái thuần chữ cửa phải (sạch bóng % thừa) */}
            <text
              x={0}
              y={196}
              textAnchor="middle"
              fill={rightTitleColor}
              fontSize={rightTitle.length > 16 ? 26 : 32}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {rightTitle}
            </text>
            <rect x={-185} y={214} width={370} height={48} rx={24} fill={rightBadgeBg} stroke="#141414" strokeWidth={4} />
            <text x={0} y={245} textAnchor="middle" fill={rightSubColor} fontSize={20} fontWeight={900} fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif">
              {rightDynamicSub}
            </text>
          </g>
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 8. XRAY_BODY_CARD: Cắt Lớp X-Quang Cơ Thể Đốt Mỡ / Cơ Bắp + Mũi Tên Cam
  // ===========================================================================
  if (cardType === "XRAY_BODY_CARD") {
    const stage = props.xrayStage || "fat_reserve";
    const calloutTitle =
      props.xrayCalloutTitle ||
      (stage === "muscle_burn"
        ? "TỰ ĐỐT PROTEIN CƠ BẮP!"
        : stage === "stomach"
        ? "BỮA ĂN CUỐI CÙNG CẠN SẠCH"
        : "ĐỐT THỂ MỠ DỰ TRỮ (FAT BODY)");
    const calloutSub =
      props.xrayCalloutSub ||
      (stage === "muscle_burn"
        ? "Cơ chân và ngực yếu dần từng ngày"
        : "Nguồn năng lượng khẩn cấp nuôi não & mắt");

    const scanLineY = -200 + ((localFrame * 3.5) % 400);

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <g transform={`translate(960, 470) scale(${(enterScale * cameraZoom).toFixed(3)})`}>
          {/* Màn hình X-Quang xanh đen */}
          <rect
            x={-540}
            y={-295}
            width={1080}
            height={570}
            rx={38}
            fill="#141414"
            transform="translate(12, 14)"
          />
          <rect
            x={-540}
            y={-295}
            width={1080}
            height={570}
            rx={38}
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth={6}
          />

          {/* Lưới X-Quang */}
          {[-360, -180, 0, 180, 360].map((gx, i) => (
            <line key={i} x1={gx} y1={-285} x2={gx} y2={265} stroke="#1E293B" strokeWidth={2} />
          ))}
          {[-160, 0, 160].map((gy, i) => (
            <line key={i} x1={-530} y1={gy} x2={530} y2={gy} stroke="#1E293B" strokeWidth={2} />
          ))}

          <text
            x={-480}
            y={-230}
            fill="#38BDF8"
            fontSize={24}
            fontWeight={900}
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            [X-RAY SCAN • PHÂN TÍCH NỘI TẠNG SINH TỒN]
          </text>

          {/* Hình cắt lớp cơ thể bên trái */}
          <g transform="translate(-170, 25)">
            {/* Đường viền cơ thể phát sáng */}
            <circle cx={0} cy={-165} r={54} fill="#1E293B" stroke="#38BDF8" strokeWidth={4.5} />
            <rect x={-68} y={-100} width={136} height={220} rx={48} fill="#1E293B" stroke="#38BDF8" strokeWidth={4.5} />
            {/* Xương sườn cách điệu */}
            {[-65, -30, 5].map((ry, idx) => (
              <path
                key={idx}
                d={`M -45,${ry} Q 0,${ry + 14} 45,${ry}`}
                fill="none"
                stroke="#64748B"
                strokeWidth={5}
                strokeLinecap="round"
              />
            ))}

            {/* Hạt dự trữ năng lượng (Vàng = Thể mỡ, Đỏ = Cơ bắp đang đốt) */}
            {[-28, 0, 28].map((px, i) =>
              [35, 68, 95].map((py, j) => {
                const shrink = Math.max(0.25, 1 - u * 0.65 + Math.sin(localFrame * 0.2 + i + j) * 0.08);
                const particleColor = stage === "muscle_burn" ? "#EF4444" : "#FACC15";
                return (
                  <circle
                    key={`${i}_${j}`}
                    cx={px}
                    cy={py}
                    r={13 * shrink}
                    fill={particleColor}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                );
              })
            )}

            {/* Tia quét X-Ray ngang */}
            <line
              x1={-120}
              y1={scanLineY}
              x2={120}
              y2={scanLineY}
              stroke="#38BDF8"
              strokeWidth={4}
              opacity={0.75}
            />
          </g>

          {/* Mũi tên cam chỉ từ hộp chú thích vào vùng bụng/cơ thể */}
          <path
            d="M 75,15 Q -10,-25 -95,55"
            fill="none"
            stroke="#F97316"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray="14 8"
          />
          <polygon points="-95,55 -70,40 -78,65" fill="#F97316" />

          {/* Hộp chú thích nổi bật bên phải */}
          <g transform="translate(260, 15)">
            <rect
              x={-215}
              y={-95}
              width={430}
              height={190}
              rx={26}
              fill="#FEF08A"
              stroke="#141414"
              strokeWidth={5}
            />
            <text
              x={0}
              y={-22}
              textAnchor="middle"
              fill="#141414"
              fontSize={28}
              fontWeight={900}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {calloutTitle}
            </text>
            <text
              x={0}
              y={28}
              textAnchor="middle"
              fill="#B45309"
              fontSize={21}
              fontWeight={800}
              fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
            >
              {calloutSub}
            </text>
          </g>
        </g>
      </svg>
    );
  }

  // ===========================================================================
  // 9. STOPWATCH_TALLY_CARD: Đồng Hồ Bấm Giờ Quay Nhanh & Vạch Khắc (|||||||)
  // ===========================================================================
  if (cardType === "STOPWATCH_TALLY_CARD") {
    const maxTally = props.tallyCount || 15;
    const activeTallies = Math.max(1, Math.min(maxTally, Math.ceil(u * maxTally * 1.15)));
    const tallyLabel = props.tallyLabel || "ĐẾM TỪNG NGÀY CHỜ ĐỢI CON MỒI";
    const handAngle = localFrame * 14;

    return (
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 35 }}
      >
        <g transform={`translate(960, 475) scale(${(enterScale * cameraZoom).toFixed(3)})`}>
          <rect
            x={-520}
            y={-280}
            width={1040}
            height={540}
            rx={36}
            fill="#141414"
            transform="translate(12, 14)"
          />
          <rect
            x={-520}
            y={-280}
            width={1040}
            height={540}
            rx={36}
            fill="#FFFFFF"
            stroke="#141414"
            strokeWidth={6}
          />

          <text
            x={0}
            y={-205}
            textAnchor="middle"
            fill="#141414"
            fontSize={32}
            fontWeight={900}
            fontFamily="'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif"
          >
            {tallyLabel}
          </text>

          {/* Bên trái: Đồng hồ bấm giờ quay nhanh */}
          <g transform="translate(-250, 25)">
            <rect x={-22} y={-195} width={44} height={28} rx={8} fill="#64748B" stroke="#141414" strokeWidth={5} />
            <circle cx={0} cy={0} r={150} fill="#F8FAFC" stroke="#141414" strokeWidth={7} />
            <circle cx={0} cy={0} r={128} fill="none" stroke="#CBD5E1" strokeWidth={4} strokeDasharray="12 10" />
            <g transform={`rotate(${handAngle})`}>
              <line x1={0} y1={24} x2={0} y2={-110} stroke="#EF4444" strokeWidth={8} strokeLinecap="round" />
            </g>
            <circle cx={0} cy={0} r={14} fill="#141414" />
          </g>

          {/* Bên phải: Bảng khắc vạch đếm ngày ||||||| */}
          <g transform="translate(185, 25)">
            <rect
              x={-240}
              y={-130}
              width={480}
              height={260}
              rx={24}
              fill="#FEF3C7"
              stroke="#141414"
              strokeWidth={5}
            />
            {Array.from({ length: activeTallies }).map((_, idx) => {
              const group = Math.floor(idx / 5);
              const posInGroup = idx % 5;
              const gx = -175 + group * 135;
              if (posInGroup === 4) {
                // Vạch chéo khóa cụm 5 ngày
                return (
                  <line
                    key={idx}
                    x1={gx - 12}
                    y1={55}
                    x2={gx + 82}
                    y2={-55}
                    stroke="#EF4444"
                    strokeWidth={8}
                    strokeLinecap="round"
                  />
                );
              }
              return (
                <line
                  key={idx}
                  x1={gx + posInGroup * 22}
                  y1={-60}
                  x2={gx + posInGroup * 22}
                  y2={60}
                  stroke="#141414"
                  strokeWidth={7}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        </g>
      </svg>
    );
  }

  return null;
};
