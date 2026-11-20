import React from "react";
import { Point2D } from "../../types/character";

export interface SpeechBubbleProps {
  x: number;
  y: number;
  text: string;
  hasMusicNote?: boolean;
  tailAnchor?: Point2D;
  bubbleArtwork?: React.ReactNode;
}

/**
 * Tính toán vị trí Speech Bubble chuẩn xác để KHÔNG BAO GIỜ che mặt hay đầu nhân vật
 */
export function calculateSafeSpeechBubble(
  headCenter: Point2D,
  text: string,
  facing: "left" | "right" = "right",
  headRadius: number = 95
): {
  position: Point2D;
  tailAnchor: Point2D;
} {
  const width = Math.max(220, Math.min(720, text.length * 24 + 80));
  const height = 130;

  // Đặt bong bóng chếch lên phía trước mặt của nhân vật, giữ khoảng đệm an toàn >= 40px ngoài vòng tròn đầu
  const offsetX = facing === "left" ? -(headRadius + width / 2 + 30) : (headRadius + width / 2 + 30);
  const offsetY = -(headRadius + height / 2 + 20);

  const bubbleX = headCenter.x + offsetX;
  const bubbleY = headCenter.y + offsetY;

  // Điểm gốc miệng của nhân vật trong hệ tọa độ cục bộ của bubble
  const mouthLocalX = facing === "left" ? width / 2 - 20 : -width / 2 + 20;
  const mouthLocalY = height / 2 + 65;

  return {
    position: { x: bubbleX, y: bubbleY },
    tailAnchor: { x: mouthLocalX, y: mouthLocalY },
  };
}

/**
 * SpeechBubble Wrapper Component (Figma-to-React Standard)
 */
export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  x,
  y,
  text,
  hasMusicNote = false,
  tailAnchor = { x: -40, y: 90 },
  bubbleArtwork,
}) => {
  const width = Math.max(220, Math.min(720, text.length * 24 + 80));
  const height = 130;
  const radius = 65;

  const tailBaseX = Math.max(-width / 2 + 50, Math.min(width / 2 - 50, tailAnchor.x * 0.4));

  return (
    <g id="speech-bubble-wrapper" transform={`translate(${x}, ${y})`}>
      {/* =========================================================================
          FIGMA SVG BUBBLE ARTWORK (Nếu có khung vẽ tùy biến từ Figma)
         ========================================================================= */}
      {bubbleArtwork ? (
        bubbleArtwork
      ) : (
        /* Mặc định vector bubble capsule */
        <g id="default-bubble-vector">
          {/* Đuôi bóng thoại */}
          <polygon
            points={`${tailBaseX - 32},${height / 2 - 10} ${tailBaseX + 32},${height / 2 - 10} ${tailAnchor.x},${tailAnchor.y}`}
            fill="#FFFFFF"
            stroke="#141414"
            strokeWidth={8}
            strokeLinejoin="round"
          />
          {/* Thân bóng thoại hình viên thuốc */}
          <rect
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            rx={radius}
            ry={radius}
            fill="#FFFFFF"
            stroke="#141414"
            strokeWidth={8}
            strokeLinejoin="round"
          />
          {/* Miếng vá màu trắng xóa đường viền ngăn cách giữa thân và đuôi */}
          <polygon
            points={`${tailBaseX - 25},${height / 2 - 14} ${tailBaseX + 25},${height / 2 - 14} ${tailAnchor.x * 0.5 + tailBaseX * 0.5},${height / 2 + 10}`}
            fill="#FFFFFF"
            stroke="none"
          />
        </g>
      )}

      {/* Bubble text content (>= 48px standard) */}
      <text
        x={0}
        y={18}
        textAnchor="middle"
        fontSize={50}
        fontWeight="800"
        fontFamily="'Segoe UI', Roboto, 'Be Vietnam Pro', -apple-system, sans-serif"
        fill="#141414"
      >
        {text}
      </text>

      {/* Musical note decoration */}
      {hasMusicNote && (
        <text
          x={tailAnchor.x + 30}
          y={tailAnchor.y - 12}
          fontSize={44}
          fill="#666666"
        >
          ♪
        </text>
      )}
    </g>
  );
};
