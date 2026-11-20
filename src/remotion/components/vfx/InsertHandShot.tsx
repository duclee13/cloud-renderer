import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface InsertHandShotProps {
  targetX: number;
  targetY: number;
  fromSide?: "right" | "left";
  showDashedCircle?: boolean;
  startFrame?: number;
}

/**
 * InsertHandShot: Tuyệt chiêu "Cảnh Cận Tay Tương Tác" (Storytime 2D Art Style)
 * Thay thế 2-Bone IK phức tạp khi thực hiện tương tác tinh tế (chỉ tay, ấn nút, chạm, dán nhãn).
 * Thanh cánh tay vươn mượt mà từ mép màn hình vào điểm tâm kèm bàn tay tròn trắng lớn và vòng tròn đỏ nét đứt xoay.
 */
export const InsertHandShot: React.FC<InsertHandShotProps> = ({
  targetX,
  targetY,
  fromSide = "right",
  showDashedCircle = true,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - startFrame);
  const reachProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.9 },
  });

  const edgeX = fromSide === "right" ? 1980 : -60;
  const edgeY = targetY + 140;

  // Điểm dừng lệch sang mép phải dưới của nhãn dán để chữ chính giữa lộ rõ 100%
  const stopX = fromSide === "right" ? targetX + 95 : targetX - 95;
  const stopY = targetY + 28;

  // Sau khi chạm dán nhãn xong (localFrame > 35), rút nhẹ cánh tay ra ngoài để đọc rõ chữ
  const retract = localFrame > 35 ? Math.min(45, (localFrame - 35) * 2.5) : 0;
  const finalTargetX = fromSide === "right" ? stopX + retract : stopX - retract;

  const currentHandX = edgeX + (finalTargetX - edgeX) * reachProgress;
  const currentHandY = edgeY + (stopY - edgeY) * reachProgress;

  return (
    <g id="insert-closeup-hand-layer">
      {/* Vòng tròn đỏ nét đứt khoanh vùng điểm chú ý */}
      {showDashedCircle && reachProgress > 0.65 && (
        <circle
          cx={targetX}
          cy={targetY}
          r={56}
          fill="none"
          stroke="#EF4444"
          strokeWidth={6}
          strokeDasharray="16 12"
          transform={`rotate(${frame * 1.2}, ${targetX}, ${targetY})`}
        />
      )}

      {/* Thanh cánh tay thò từ mép màn hình vào */}
      <line
        x1={edgeX}
        y1={edgeY}
        x2={currentHandX}
        y2={currentHandY}
        stroke="#141414"
        strokeWidth={18}
        strokeLinecap="round"
      />

      {/* Bàn tay tròn trắng viền đen đặc trưng */}
      <circle
        cx={currentHandX}
        cy={currentHandY}
        r={32}
        fill="#FFFFFF"
        stroke="#141414"
        strokeWidth={10}
      />
    </g>
  );
};
