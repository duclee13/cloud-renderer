/**
 * HORNET RIG V11.0 (Ong Bắp Cày 2D Vector — chuẩn UNIVERSAL_2D_STORYTIME_ENGINE_STANDARD_V10.md)
 * - Viền đen dày 3.5px (#141414), bụng sọc vàng rực (#FACC15) xen kẽ đen tuyền (#111827), ngòi đốt nhọn ở đuôi
 * - 2 cặp cánh trong suốt có gân cánh vỗ rung tốc độ cao (wingFlutter)
 * - Đầu tròn vàng cam, râu cong phân đốt, 2 mắt to biểu cảm theo 3 trạng thái:
 *   1. SLEEPING_CALM: Mắt nhắm lim dim ngủ yên, cánh xếp gọn trong cửa tổ, bọt chữ Zzz nhẹ
 *   2. ALERT_BLINDED: Mắt mở trừng chói lòa kèm tia lóe sáng khi bị đèn pin chiếu thẳng vào
 *   3. AGGRESSIVE_SWARM: Lông mày chữ V giận dữ, ngòi đốt chĩa ra, cánh vỗ tốc độ cao + vệt gió lao thẳng
 * - Hỗ trợ đầy đủ 8 điểm neo giải phẫu RigSockets (HEAD_CENTER, ABDOMEN_CENTER, PRIMARY_WEAPON tại ngòi đốt...)
 */

import React from "react";
import {
  RigSockets,
  computeSaccadeFixation,
} from "../../../lib/v7/universalAnimationStandard";

export type HornetMoodState =
  | "SLEEPING_CALM"
  | "ALERT_BLINDED"
  | "AGGRESSIVE_SWARM";

export interface HornetRigProps {
  x: number;
  y: number;
  facing?: "left" | "right";
  scale?: number;
  rotationDeg?: number;
  frame?: number;
  localFrame?: number;
  moodState?: HornetMoodState;
  seed?: number;
  showWindStreaks?: boolean;
  hideExclamation?: boolean;
  onSocketsComputed?: (sockets: RigSockets) => void;
}

/**
 * Biến đổi tọa độ cục bộ của Ong Bắp Cày (mặc định hướng sang PHẢI khi facing="right")
 * sang tọa độ sân khấu thực tế (World Space) sau khi nhân scale, lật facing và xoay rotationDeg.
 */
function localToHornetWorld(
  lx: number,
  ly: number,
  x: number,
  y: number,
  dir: 1 | -1,
  scale: number,
  rotationDeg: number
): { x: number; y: number } {
  const rad = (rotationDeg * Math.PI) / 180;
  const sx = lx * dir * scale;
  const sy = ly * scale;
  return {
    x: x + sx * Math.cos(rad) - sy * Math.sin(rad),
    y: y + sx * Math.sin(rad) + sy * Math.cos(rad),
  };
}

/**
 * Tính 8 điểm neo giải phẫu RigSockets cho HornetRig (tự động bám theo mọi góc xoay/lật/tỉ lệ).
 */
export function computeHornetRigSockets(params: {
  x: number;
  y: number;
  facing?: "left" | "right";
  scale?: number;
  rotationDeg?: number;
  moodState?: HornetMoodState;
}): RigSockets {
  const {
    x,
    y,
    facing = "left",
    scale = 1.0,
    rotationDeg = 0,
    moodState = "ALERT_BLINDED",
  } = params;
  const dir: 1 | -1 = facing === "right" ? 1 : -1;
  const stingerExtra = moodState === "AGGRESSIVE_SWARM" ? -14 : 0;

  return {
    HEAD_TOP: localToHornetWorld(44, -44, x, y, dir, scale, rotationDeg),
    HEAD_CENTER: localToHornetWorld(48, -6, x, y, dir, scale, rotationDeg),
    EYES_FOCUS: localToHornetWorld(60, -10, x, y, dir, scale, rotationDeg),
    MOUTH: localToHornetWorld(64, 14, x, y, dir, scale, rotationDeg),
    THORAX: localToHornetWorld(4, -2, x, y, dir, scale, rotationDeg),
    ABDOMEN_CENTER: localToHornetWorld(-56, 8, x, y, dir, scale, rotationDeg),
    PRIMARY_WEAPON: localToHornetWorld(-118 + stingerExtra, 18, x, y, dir, scale, rotationDeg),
    FEET_CONTACT: localToHornetWorld(4, 42, x, y, dir, scale, rotationDeg),
  };
}

export const HornetRig: React.FC<HornetRigProps> = ({
  x,
  y,
  facing = "left",
  scale = 1.0,
  rotationDeg = 0,
  frame = 0,
  localFrame = 0,
  moodState = "SLEEPING_CALM",
  seed = 0,
  showWindStreaks = false,
  hideExclamation = false,
  onSocketsComputed,
}) => {
  const dir: 1 | -1 = facing === "right" ? 1 : -1;
  const clipId = `hornet-abd-clip-${seed}-${Math.round(x)}-${Math.round(y)}`;
  const wingGradId = `hornet-wing-grad-${seed}`;

  // Saccade fixation mắt chuẩn V10 (chỉ áp dụng khi tỉnh táo; cấm đảo mắt hình sin)
  const saccade = computeSaccadeFixation(frame, seed + 13);

  // Chuyển động cánh & thân theo từng trạng thái biểu cảm
  const isSleeping = moodState === "SLEEPING_CALM";
  const isAlert = moodState === "ALERT_BLINDED";
  const isAggressive = moodState === "AGGRESSIVE_SWARM";

  // Nhịp rung cánh tốc độ cao (wingFlutter)
  const foreWingDeg = isSleeping
    ? -16 + Math.sin(localFrame * 0.06 + seed) * 2.2
    : isAlert
    ? -46 + Math.sin(localFrame * 1.55 + seed * 1.7) * 20
    : -52 + Math.sin(localFrame * 2.6 + seed * 2.3) * 34;

  const hindWingDeg = isSleeping
    ? -8 + Math.sin(localFrame * 0.06 + seed) * 1.5
    : isAlert
    ? -26 - Math.sin(localFrame * 1.55 + seed * 1.7) * 16
    : -30 - Math.sin(localFrame * 2.6 + seed * 2.3) * 28;

  // Nhịp thở / rung giật nhẹ
  const bobY = isSleeping
    ? Math.sin(localFrame * 0.06 + seed) * 2.5
    : isAlert
    ? Math.sin(localFrame * 0.9 + seed) * 2.2
    : Math.sin(localFrame * 1.6 + seed * 1.9) * 4.5;

  const stingerExtendPx = isAggressive ? 14 : isAlert ? 5 : 0;

  if (onSocketsComputed) {
    onSocketsComputed(
      computeHornetRigSockets({
        x,
        y: y + bobY,
        facing,
        scale,
        rotationDeg,
        moodState,
      })
    );
  }

  return (
    <g
      transform={`translate(${x.toFixed(1)}, ${(y + bobY).toFixed(1)}) rotate(${rotationDeg.toFixed(
        1
      )}) scale(${(dir * scale).toFixed(3)}, ${scale.toFixed(3)})`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M -14,-8 C -34,-34 -88,-30 -110,12 C -86,42 -30,38 -14,14 Z" />
        </clipPath>
        <linearGradient id={wingGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#BAE6FD" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Vệt gió lao thẳng tốc độ cao (AGGRESSIVE_SWARM) */}
      {(isAggressive || showWindStreaks) && (
        <g opacity={0.78}>
          <line
            x1={-125}
            y1={-32}
            x2={-195 - (localFrame % 12) * 2.5}
            y2={-36}
            stroke="#FEF08A"
            strokeWidth={3.5}
            strokeLinecap="round"
            opacity={0.75}
          />
          <line
            x1={-135}
            y1={8}
            x2={-225 - ((localFrame + 5) % 12) * 3}
            y2={10}
            stroke="#FFFFFF"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.85}
          />
          <line
            x1={-118}
            y1={42}
            x2={-185 - ((localFrame + 9) % 12) * 2}
            y2={46}
            stroke="#FDE047"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.65}
          />
        </g>
      )}

      {/* 1. CÁNH SAU (HINDWING) — Mờ trong suốt, vỗ ngược pha */}
      <g transform={`translate(-4, -18) rotate(${hindWingDeg.toFixed(1)})`}>
        <path
          d="M 0,0 C -26,-48 -84,-42 -96,-12 C -100,2 -60,12 0,0 Z"
          fill={`url(#${wingGradId})`}
          stroke="#141414"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d="M -6,-2 Q -46,-22 -84,-10"
          fill="none"
          stroke="#64748B"
          strokeWidth={1.6}
          opacity={0.65}
        />
      </g>

      {/* 2. CHÂN ONG PHÍA XA (BACK LEGS) */}
      <g stroke="#141414" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={isAggressive ? "M -4,18 L -20,34 L -36,36" : "M -4,18 L -14,36 L -24,44"} />
        <path d={isAggressive ? "M 16,18 L 6,34 L -8,38" : "M 16,18 L 14,36 L 8,44"} />
      </g>

      {/* 3. NGÒI ĐỐT NHỌN (PRIMARY_WEAPON) ở mũi đuôi */}
      <g transform={`translate(${(-stingerExtendPx).toFixed(1)}, 0)`}>
        <polygon
          points="-102,8 -128,19 -100,19"
          fill="#111827"
          stroke="#141414"
          strokeWidth={2.8}
          strokeLinejoin="round"
        />
        <line x1={-105} y1={11} x2={-122} y2={18} stroke="#E2E8F0" strokeWidth={1.6} />
        {isAggressive && (
          <g transform="translate(-130, 19)">
            <circle cx={0} cy={0} r={5} fill="#EF4444" opacity={0.85} />
            <circle cx={0} cy={0} r={10} fill="#EF4444" opacity={0.32} />
          </g>
        )}
      </g>

      {/* 4. BỤNG SỌC VÀNG RỰC (#FACC15) XEN KẼ ĐEN TUYỀN (#111827) */}
      <g id="hornet-abdomen">
        <path
          d="M -14,-8 C -34,-34 -88,-30 -110,12 C -86,42 -30,38 -14,14 Z"
          fill="#FACC15"
        />
        <g clipPath={`url(#${clipId})`}>
          {/* 3 dải sọc đen cong đặc trưng ong bắp cày */}
          <path d="M -38,-38 Q -28,4 -40,44 L -24,44 Q -12,4 -22,-38 Z" fill="#111827" />
          <path d="M -68,-38 Q -58,6 -70,44 L -52,44 Q -40,6 -50,-38 Z" fill="#111827" />
          <path d="M -98,-32 Q -88,8 -98,42 L -80,42 Q -70,8 -80,-32 Z" fill="#111827" />
          {/* Vệt sáng cel-shading dọc sống lưng */}
          <path
            d="M -22,-14 C -44,-26 -74,-22 -94,-4"
            fill="none"
            stroke="#FEF08A"
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.55}
          />
          {/* Vùng tối cel-shading dưới bụng */}
          <path
            d="M -20,24 C -44,34 -76,32 -98,18"
            fill="none"
            stroke="#B45309"
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.4}
          />
        </g>
        {/* Viền đen sắc nét bao trọn bụng (giữ độ nét chuẩn ở tỉ lệ thực tế 0.40x–0.45x) */}
        <path
          d="M -14,-8 C -34,-34 -88,-30 -110,12 C -86,42 -30,38 -14,14 Z"
          fill="none"
          stroke="#141414"
          strokeWidth={4.8}
          strokeLinejoin="round"
        />
      </g>

      {/* 5. NGỰC (THORAX) NÂU ĐEN & ĐAI VÀNG */}
      <g id="hornet-thorax">
        <ellipse
          cx={6}
          cy={2}
          rx={28}
          ry={24}
          fill="#1F2937"
          stroke="#141414"
          strokeWidth={4.8}
        />
        <path
          d="M -6,-18 Q 8,-10 -2,20"
          fill="none"
          stroke="#F59E0B"
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.9}
        />
        <ellipse
          cx={6}
          cy={2}
          rx={28}
          ry={24}
          fill="none"
          stroke="#141414"
          strokeWidth={4.8}
        />
      </g>

      {/* 6. CHÂN ONG PHÍA GẦN (FRONT LEGS) */}
      <g stroke="#141414" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={isAggressive ? "M 20,16 L 14,34 L 2,40" : "M 20,16 L 26,34 L 34,42"} />
        <path d={isAggressive ? "M 2,20 L -12,38 L -28,40" : "M 2,20 L -4,38 L -12,46"} />
      </g>

      {/* 7. CÁNH TRƯỚC (FOREWING) — Rộng, mờ, vỗ tốc độ cao + vệt mờ chuyển động */}
      <g transform={`translate(2, -16) rotate(${foreWingDeg.toFixed(1)})`}>
        {isAggressive && (
          <path
            d="M 0,0 C -22,-78 -100,-72 -118,-26 C -124,-6 -70,8 0,0 Z"
            fill="#E0F2FE"
            opacity={0.28}
            transform="rotate(14)"
          />
        )}
        <path
          d="M 0,0 C -18,-72 -94,-66 -112,-24 C -118,-4 -66,10 0,0 Z"
          fill={`url(#${wingGradId})`}
          stroke="#141414"
          strokeWidth={3.2}
          strokeLinejoin="round"
        />
        <path
          d="M -6,-4 Q -52,-40 -102,-20"
          fill="none"
          stroke="#475569"
          strokeWidth={2}
          opacity={0.7}
        />
        <path
          d="M -30,-22 L -56,-44 M -54,-26 L -82,-36"
          fill="none"
          stroke="#64748B"
          strokeWidth={1.6}
          opacity={0.6}
        />
      </g>

      {/* 8. ĐẦU, RÂU CONG & BIỂU CẢM 3 TRẠNG THÁI */}
      <g id="hornet-head" transform="translate(46, -4)">
        {/* Hai râu cong phân đốt */}
        <path
          d={
            isSleeping
              ? "M 4,-22 Q 16,-40 34,-34"
              : isAlert
              ? "M 2,-22 Q -4,-52 14,-56"
              : "M 4,-22 Q 18,-48 38,-40"
          }
          fill="none"
          stroke="#141414"
          strokeWidth={3.8}
          strokeLinecap="round"
        />
        <path
          d={
            isSleeping
              ? "M 14,-20 Q 28,-34 42,-26"
              : isAlert
              ? "M 12,-20 Q 14,-50 32,-50"
              : "M 14,-20 Q 28,-42 46,-30"
          }
          fill="none"
          stroke="#141414"
          strokeWidth={3.8}
          strokeLinecap="round"
        />

        {/* Khối đầu vàng cam viền đen sắc nét */}
        <ellipse
          cx={0}
          cy={0}
          rx={24}
          ry={25}
          fill="#FACC15"
          stroke="#141414"
          strokeWidth={4.8}
        />
        {/* Má cel-shading nhẹ */}
        <path
          d="M -16,12 A 22,22 0 0,0 14,18"
          fill="none"
          stroke="#D97706"
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.55}
        />

        {/* Hàm kìm dưới miệng */}
        {isAggressive ? (
          <g>
            <path d="M 8,19 L 22,28 L 14,14 Z" fill="#111827" stroke="#141414" strokeWidth={2.5} />
            <path d="M 16,12 L 28,16 L 18,6 Z" fill="#111827" stroke="#141414" strokeWidth={2.5} />
          </g>
        ) : (
          <path d="M 10,17 L 19,21" stroke="#141414" strokeWidth={3} strokeLinecap="round" />
        )}

        {/* MẮT & BIỂU CẢM THEO 3 TRẠNG THÁI */}
        {isSleeping && (
          <g id="hornet-eyes-sleeping">
            {/* Mắt nhắm lim dim */}
            <path
              d="M -8,-4 Q 0,4 8,-4"
              fill="none"
              stroke="#141414"
              strokeWidth={3.8}
              strokeLinecap="round"
            />
            <path
              d="M 11,-4 Q 17,3 22,-4"
              fill="none"
              stroke="#141414"
              strokeWidth={3.5}
              strokeLinecap="round"
            />
            {/* Chữ Zzz bay nhẹ lên trời (khử lật gương khi facing="left" để chữ luôn xuôi chiều, rõ ở tỉ lệ 0.42x) */}
            <g
              transform={`translate(24, ${(-44 - ((localFrame * 0.45) % 28)).toFixed(1)}) scale(${dir}, 1)`}
              opacity={Math.max(0.28, 1 - ((localFrame * 0.45) % 28) / 28)}
            >
              <text
                x={0}
                y={0}
                textAnchor="middle"
                fill="#93C5FD"
                stroke="#0F172A"
                strokeWidth={5}
                paintOrder="stroke"
                fontSize={30}
                fontWeight={900}
                fontFamily="'Be Vietnam Pro', Arial, sans-serif"
              >
                Zzz
              </text>
            </g>
          </g>
        )}

        {isAlert && (
          <g id="hornet-eyes-alert-blinded">
            {/* Hai mắt mở trừng trừng chói lòa */}
            <ellipse cx={2} cy={-5} rx={11} ry={13} fill="#FFFFFF" stroke="#141414" strokeWidth={3.8} />
            <ellipse cx={18} cy={-5} rx={8.5} ry={11} fill="#FFFFFF" stroke="#141414" strokeWidth={3.8} />
            {/* Đồng tử co nhỏ giật mình (saccade hold, không đảo hình sin) */}
            <circle cx={4 + saccade.x * 0.25} cy={-5 + saccade.y * 0.25} r={3.6} fill="#141414" />
            <circle cx={19 + saccade.x * 0.2} cy={-5 + saccade.y * 0.2} r={3.0} fill="#141414" />
            {/* Tia chói ánh đèn phản chiếu trên mắt & dấu (!) chỉ hiện khi còn ánh đèn chói */}
            {!hideExclamation && (
              <>
                <g transform="translate(8, -11)">
                  <path
                    d="M 0,-14 L 3,-3 L 14,0 L 3,3 L 0,14 L -3,3 L -14,0 L -3,-3 Z"
                    fill="#FEF08A"
                    stroke="#F59E0B"
                    strokeWidth={1.8}
                  />
                </g>
                <g transform="translate(-8, -50) rotate(-12) scale(1.35)">
                  <rect x={-4.5} y={-22} width={9} height={20} rx={4.5} fill="#EF4444" stroke="#141414" strokeWidth={3} />
                  <circle cx={0} cy={6} r={5} fill="#EF4444" stroke="#141414" strokeWidth={3} />
                </g>
              </>
            )}
          </g>
        )}

        {isAggressive && (
          <g id="hornet-eyes-aggressive">
            {/* Mắt đỏ rực giận dữ */}
            <ellipse cx={2} cy={-4} rx={10.5} ry={11.5} fill="#FEF08A" stroke="#141414" strokeWidth={3.2} />
            <ellipse cx={18} cy={-4} rx={8} ry={10} fill="#FEF08A" stroke="#141414" strokeWidth={3.2} />
            <circle cx={6} cy={-3} r={4} fill="#DC2626" />
            <circle cx={20} cy={-3} r={3.2} fill="#DC2626" />
            <circle cx={7} cy={-4} r={1.8} fill="#141414" />
            <circle cx={21} cy={-4} r={1.5} fill="#141414" />
            {/* Lông mày chữ V giận dữ đậm nét */}
            <line x1={-12} y1={-18} x2={12} y2={-9} stroke="#141414" strokeWidth={5.5} strokeLinecap="round" />
            <line x1={26} y1={-16} x2={12} y2={-9} stroke="#141414" strokeWidth={5.2} strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
};
