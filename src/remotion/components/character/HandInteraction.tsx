import React from "react";
import { interpolate, Easing } from "remotion";
import { Point2D } from "../../types/character";

export interface HandInteractionProps {
  frame: number;
  fps?: number;
  targetPos: Point2D;
  originPos?: Point2D;
  labelText?: string;
  startFrame?: number;
  applyFrame?: number;
  retractFrame?: number;
  endFrame?: number;
}

/**
 * HandInteraction: Component bàn tay tương tác vật lý (Dán nhãn, chạm, cầm nắm)
 * - Tiếp cận mục tiêu đúng tọa độ tương tác
 * - Không kéo giãn xương phi tự nhiên (duy trì tỷ lệ bắp tay và cẳng tay)
 * - Ép nhãn vào bề mặt với micro-press, sau đó rút tay về dứt khoát
 * - Nhãn dán lưu lại vĩnh viễn trên vật thể sau khi dán
 */
export const HandInteraction: React.FC<HandInteractionProps> = ({
  frame,
  fps = 60,
  targetPos,
  originPos = { x: 2150, y: 520 },
  labelText = "Tám",
  startFrame = 25,
  applyFrame = 70,
  retractFrame = 105,
  endFrame = 150,
}) => {
  // Trạng thái nhãn dán: Có hiển thị trên lọ không? (Hiển thị ngay từ khi chạm applyFrame trở đi)
  const isLabelAdhered = frame >= applyFrame;

  // Nếu chưa đến thời điểm bắt đầu hành động, chỉ render nhãn nếu đã dán
  const isHandActive = frame >= startFrame && frame <= endFrame;

  // Tính vị trí bàn tay theo thời gian
  let handX = originPos.x;
  let handY = originPos.y;
  let handRotation = 15; // Độ nghiêng cầm nhãn
  let handScale = 1.0;

  if (frame < startFrame) {
    handX = originPos.x;
    handY = originPos.y;
  } else if (frame < applyFrame) {
    // 1. Pha đưa nhãn tới (Approach)
    const p = interpolate(frame, [startFrame, applyFrame], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    handX = interpolate(p, [0, 1], [originPos.x, targetPos.x]);
    handY = interpolate(p, [0, 1], [originPos.y, targetPos.y]);
    handRotation = interpolate(p, [0, 1], [25, 0]);
  } else if (frame < retractFrame) {
    // 2. Pha dán nhãn & miết nhẹ (Contact & Press)
    const pressProgress = interpolate(frame, [applyFrame, applyFrame + 15, retractFrame], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    handX = targetPos.x;
    handY = targetPos.y + pressProgress * 3; // Nhẹ nhàng miết vào kính
    handRotation = 0;
    handScale = 1.0 + pressProgress * 0.02;
  } else if (frame <= endFrame) {
    // 3. Pha rút tay về (Retract)
    const r = interpolate(frame, [retractFrame, endFrame], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    handX = interpolate(r, [0, 1], [targetPos.x, originPos.x + 80]);
    handY = interpolate(r, [0, 1], [targetPos.y, originPos.y + 40]);
    handRotation = interpolate(r, [0, 1], [0, 20]);
  } else {
    // Tay đã rút hoàn toàn ra khỏi khung hình
    handX = originPos.x + 200;
  }

  // Kích thước nhãn dán
  const labelW = 200;
  const labelH = 80;

  return (
    <g id="hand-interaction-layer">
      {/* 1. NHÃN DÁN ĐÃ DÍNH TRÊN BỀ MẶT LỌ (Lưu lại vĩnh viễn trên kính) */}
      {isLabelAdhered && (
        <g id="adhered-label-sticker" transform={`translate(${targetPos.x}, ${targetPos.y})`}>
          {/* Bóng đổ nhẹ của tem dán trên mặt kính */}
          <rect
            x={-labelW / 2 + 3}
            y={-labelH / 2 + 5}
            width={labelW}
            height={labelH}
            rx={14}
            fill="#0284C7"
            opacity={0.3}
          />
          {/* Thân tem dán trắng viền đỏ sắc nét */}
          <rect
            x={-labelW / 2}
            y={-labelH / 2}
            width={labelW}
            height={labelH}
            rx={14}
            fill="#FFFFFF"
            stroke="#141414"
            strokeWidth={7}
          />
          {/* Viền chỉ trang trí bên trong tem */}
          <rect
            x={-labelW / 2 + 8}
            y={-labelH / 2 + 8}
            width={labelW - 16}
            height={labelH - 16}
            rx={8}
            fill="none"
            stroke="#E11D48"
            strokeWidth={3}
            strokeDasharray="8 4"
          />
          {/* Chữ trên nhãn: "Tám" (Chữ hoa đậm, rõ ràng, căn giữa) */}
          <text
            x={0}
            y={15}
            textAnchor="middle"
            fill="#E11D48"
            fontSize={44}
            fontWeight="900"
            fontFamily="var(--font-be-vietnam-pro), sans-serif"
            letterSpacing="2px"
          >
            {labelText}
          </text>
        </g>
      )}

      {/* 2. CÁNH TAY & BÀN TAY CẦM NHÃN TỚI DÁN */}
      {isHandActive && (
        <g
          id="active-hand-rig"
          transform={`translate(${handX}, ${handY}) rotate(${handRotation}) scale(${handScale})`}
        >
          {/* Nhãn dán ĐANG ĐƯỢC CẦM TRÊN TAY (chỉ hiển thị trước khi apply) */}
          {!isLabelAdhered && (
            <g id="carried-label-sticker">
              <rect
                x={-labelW / 2}
                y={-labelH / 2}
                width={labelW}
                height={labelH}
                rx={14}
                fill="#FFFFFF"
                stroke="#141414"
                strokeWidth={7}
              />
              <rect
                x={-labelW / 2 + 8}
                y={-labelH / 2 + 8}
                width={labelW - 16}
                height={labelH - 16}
                rx={8}
                fill="none"
                stroke="#E11D48"
                strokeWidth={3}
                strokeDasharray="8 4"
              />
              <text
                x={0}
                y={15}
                textAnchor="middle"
                fill="#E11D48"
                fontSize={44}
                fontWeight="900"
                fontFamily="var(--font-be-vietnam-pro), sans-serif"
                letterSpacing="2px"
              >
                {labelText}
              </text>
            </g>
          )}

          {/* CẲNG TAY VÀ BÀN TAY NGƯỜI QUE VỚI KHỚP KHUỶU TAY VÀ NGÓN TAY RÕ RÀNG */}
          <g id="forearm-and-hand" stroke="#141414" strokeLinecap="round" strokeLinejoin="round">
            {/* Cẳng tay nối từ khuỷu tay đến cổ tay */}
            <line x1={35} y1={-15} x2={260} y2={-90} strokeWidth={18} />

            {/* Bắp tay nối từ ngoài khung hình vào khuỷu tay */}
            <line x1={260} y1={-90} x2={620} y2={-190} strokeWidth={20} />

            {/* Khớp khuỷu tay */}
            <circle cx={260} cy={-90} r={11} fill="#141414" strokeWidth={0} />

            {/* Khớp cổ tay */}
            <circle cx={35} cy={-15} r={10} fill="#141414" strokeWidth={0} />

            {/* Lòng bàn tay */}
            <ellipse cx={18} cy={-8} rx={22} ry={16} fill="#FFFFFF" strokeWidth={12} />

            {/* Ngón cái kẹp trên mép nhãn */}
            <path
              d="M 12,-18 C 2,-28 -10,-18 -16,-6"
              fill="none"
              strokeWidth={13}
            />

            {/* Ngón trỏ miết mặt nhãn */}
            <path
              d="M 22,2 C 10,14 -4,8 -12,-2"
              fill="none"
              strokeWidth={13}
            />

            {/* Các ngón còn lại co nhẹ tự nhiên */}
            <path
              d="M 30,8 C 20,20 6,14 0,4"
              fill="none"
              strokeWidth={12}
            />
          </g>
        </g>
      )}
    </g>
  );
};
