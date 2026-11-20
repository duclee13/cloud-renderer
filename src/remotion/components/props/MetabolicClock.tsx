import React from "react";
import { interpolate, Easing } from "remotion";

export interface MetabolicClockProps {
  x: number;
  y: number;
  scale?: number;
  frame: number;
  startFrame?: number;
  durationInFrames?: number;
}

/**
 * MetabolicClock: Minh họa đồng hồ đo tốc độ trao đổi chất tối giản & khoa học
 * - Làm chủ thể trung tâm rõ ràng, tỷ lệ chuẩn 2K
 * - Kim chuyển động rõ ràng từ mức bình thường xuống mức cực thấp
 * - Không có trục hay đường trang trí thừa thãi
 */
export const MetabolicClock: React.FC<MetabolicClockProps> = ({
  x,
  y,
  scale = 1.6,
  frame,
  startFrame = 0,
  durationInFrames = 360,
}) => {
  // Kim chuyển động mượt mà từ -15 độ xuống -68 độ (vùng tiết kiệm tối đa)
  const needleProgress = interpolate(
    frame - startFrame,
    [15, 110],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
  );

  const needleAngle = interpolate(needleProgress, [0, 1], [-15, -68]);

  return (
    <g id="metabolic-clock-wrapper" transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. Bóng đổ nền sau đồng hồ */}
      <ellipse cx={0} cy={16} rx={250} ry={20} fill="#000000" opacity={0.12} />

      {/* 2. Khung viền ngoài đồng hồ bán nguyệt */}
      <path
        d="M -240 0 A 240 240 0 0 1 240 0 Z"
        fill="#FFFFFF"
        stroke="#141414"
        strokeWidth={12}
        strokeLinejoin="round"
      />

      {/* 3. Ba cung màu thể hiện mức trao đổi chất */}
      <g stroke="#141414" strokeWidth={8} strokeLinejoin="round">
        {/* Vùng Xanh lá: Thấp / Tiết kiệm năng lượng sinh tồn (-90° đến -30°) */}
        <path
          d="M -225 0 A 225 225 0 0 1 -112.5 -194.8 L -70 -121.2 A 140 140 0 0 0 -140 0 Z"
          fill="#22C55E"
        />

        {/* Vùng Vàng: Trung bình (-30° đến +30°) */}
        <path
          d="M -112.5 -194.8 A 225 225 0 0 1 112.5 -194.8 L 70 -121.2 A 140 140 0 0 0 -70 -121.2 Z"
          fill="#F59E0B"
        />

        {/* Vùng Đỏ: Cao (+30° đến +90°) */}
        <path
          d="M 112.5 -194.8 A 225 225 0 0 1 225 0 L 140 0 A 140 140 0 0 0 70 -121.2 Z"
          fill="#EF4444"
        />

        {/* Thanh đế phẳng */}
        <line x1={-245} y1={0} x2={245} y2={0} stroke="#141414" strokeWidth={12} strokeLinecap="round" />
      </g>

      {/* 4. Vạch chia thang đo chuẩn mực */}
      <g stroke="#141414" strokeWidth={6} strokeLinecap="round">
        {/* Vạch chính */}
        <line x1={-112.5} y1={-194.8} x2={-128} y2={-221} />
        <line x1={0} y1={-225} x2={0} y2={-250} />
        <line x1={112.5} y1={-194.8} x2={128} y2={-221} />

        {/* Vạch phụ */}
        <line x1={-172} y1={-144} x2={-188} y2={-158} strokeWidth={4} />
        <line x1={-58} y1={-217} x2={-64} y2={-240} strokeWidth={4} />
        <line x1={58} y1={-217} x2={64} y2={-240} strokeWidth={4} />
        <line x1={172} y1={-144} x2={188} y2={-158} strokeWidth={4} />
      </g>

      {/* Nhãn chữ mức độ: THẤP - BÌNH THƯỜNG - CAO */}
      <text x={-155} y={-95} fontSize={18} fontWeight="900" fill="#141414" textAnchor="middle" fontFamily="var(--font-be-vietnam-pro), sans-serif">
        THẤP
      </text>
      <text x={0} y={-145} fontSize={18} fontWeight="900" fill="#141414" textAnchor="middle" fontFamily="var(--font-be-vietnam-pro), sans-serif">
        VỪA
      </text>
      <text x={155} y={-95} fontSize={18} fontWeight="900" fill="#141414" textAnchor="middle" fontFamily="var(--font-be-vietnam-pro), sans-serif">
        CAO
      </text>

      {/* 5. Kim đồng hồ chỉ thị (quay theo needleAngle) */}
      <g transform={`rotate(${needleAngle})`}>
        {/* Thân kim vuốt nhọn */}
        <polygon points="-7,15 0,-215 7,15" fill="#141414" />
        <polygon points="-3,10 0,-210 3,10" fill="#EF4444" />
      </g>

      {/* Chốt trục kim tròn */}
      <circle cx={0} cy={0} r={22} fill="#141414" />
      <circle cx={0} cy={0} r={9} fill="#FFFFFF" />

      {/* 6. Hộp thẻ ghi nhận chỉ số hiện tại */}
      <g transform="translate(0, 65)">
        <rect
          x={-170}
          y={-28}
          width={340}
          height={56}
          rx={14}
          fill="#FFFFFF"
          stroke="#141414"
          strokeWidth={6}
        />
        <text
          x={0}
          y={10}
          textAnchor="middle"
          fill="#141414"
          fontSize={24}
          fontWeight="900"
          fontFamily="var(--font-be-vietnam-pro), sans-serif"
          letterSpacing="1px"
        >
          TRAO ĐỔI CHẤT: THẤP
        </text>
      </g>
    </g>
  );
};
