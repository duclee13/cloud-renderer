import React from "react";
import { EyeExpression, EyebrowExpression, MouthExpression, Point2D } from "../../types/character";

interface FacialExpressionsProps {
  headRadius: number;
  facing?: "left" | "right";
  eyes?: EyeExpression;
  eyebrows?: EyebrowExpression;
  mouth?: MouthExpression;
  pupilGaze?: Point2D;
  blush?: boolean;
  sweatDrop?: boolean;
  strokeColor?: string;
  useDotEyes?: boolean;
  showWhiskers?: boolean;
}

/**
 * FacialExpressions: Khuôn mặt Đối xứng Tuyệt đối 100% (Storytime 2D Art Style)
 * - Mắt trái: cx = -22, cy = -6; Mắt phải: cx = +22, cy = -6 (r = 7.5px hoặc oval cân đối kèm phản quang)
 * - Hai lông mày có độ dài 22px, độ dày 6px, đối xứng hoàn toàn qua trục x = 0
 * - Miệng cười mượt mà, má hồng blush và bóng cằm cel-shading
 */
export const FacialExpressions: React.FC<FacialExpressionsProps> = ({
  headRadius = 56,
  facing = "right",
  eyes = "neutral",
  eyebrows = "neutral",
  mouth = "smile",
  pupilGaze = { x: 0, y: 0 },
  blush = false,
  sweatDrop = false,
  strokeColor = "#141414",
  useDotEyes = false,
  showWhiskers = false,
}) => {
  // Chuẩn hóa tỷ lệ: nếu headRadius = 56, eyeDistance = 22, eyeY = -6
  const scale = headRadius / 56;
  const eyeDistance = 22 * scale;
  const eyeY = -6 * scale;
  const eyeR = 7.5 * scale;
  const pupilRadius = 4.2 * scale;

  // Lông mày chuẩn 22px đối xứng
  const browHalfW = 11 * scale;
  const browY = eyeY - eyeR - 7 * scale;
  const browStrokeWidth = 6 * scale;

  // Gaze offset: con ngươi di chuyển trong mắt
  const clampedGazeX = Math.max(-1, Math.min(1, pupilGaze.x || 0));
  const clampedGazeY = Math.max(-1, Math.min(1, pupilGaze.y || 0));
  const maxPupilDx = 3.5 * scale;
  const maxPupilDy = 3.0 * scale;
  const gazeDx = clampedGazeX * maxPupilDx;
  const gazeDy = clampedGazeY * maxPupilDy;

  const leftEyeCenter = { x: -eyeDistance, y: eyeY };
  const rightEyeCenter = { x: eyeDistance, y: eyeY };

  // Tọa độ 2 lông mày đối xứng tuyệt đối qua trục x = 0
  const leftBrowX1 = -eyeDistance - browHalfW;
  const leftBrowX2 = -eyeDistance + browHalfW;
  const rightBrowX1 = eyeDistance - browHalfW;
  const rightBrowX2 = eyeDistance + browHalfW;

  return (
    <g className="stickman-face">
      {/* Má hồng (Blush cheeks) */}
      {blush && (
        <g opacity={0.65}>
          <ellipse cx={-eyeDistance - 4} cy={eyeY + 22 * scale} rx={14 * scale} ry={8 * scale} fill="#F472B6" />
          <ellipse cx={eyeDistance + 4} cy={eyeY + 22 * scale} rx={14 * scale} ry={8 * scale} fill="#F472B6" />
        </g>
      )}

      {/* 2. HAI LÔNG MÀY ĐỐI XỨNG TUYỆT ĐỐI */}
      <g stroke={strokeColor} strokeWidth={browStrokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {eyebrows === "neutral" && (
          <>
            <line x1={leftBrowX1} y1={browY + 1} x2={leftBrowX2} y2={browY - 2} />
            <line x1={rightBrowX1} y1={browY - 2} x2={rightBrowX2} y2={browY + 1} />
          </>
        )}
        {eyebrows === "raised" && (
          <>
            <line x1={leftBrowX1} y1={browY - 8 * scale} x2={leftBrowX2} y2={browY - 10 * scale} />
            <line x1={rightBrowX1} y1={browY - 10 * scale} x2={rightBrowX2} y2={browY - 8 * scale} />
          </>
        )}
        {eyebrows === "inquisitive" && (
          <>
            <line x1={leftBrowX1} y1={browY} x2={leftBrowX2} y2={browY} />
            <line x1={rightBrowX1} y1={browY - 6 * scale} x2={rightBrowX2} y2={browY - 2 * scale} />
          </>
        )}
        {eyebrows === "worried" && (
          <>
            <line x1={leftBrowX1} y1={browY - 5 * scale} x2={leftBrowX2} y2={browY + 3 * scale} />
            <line x1={rightBrowX1} y1={browY + 3 * scale} x2={rightBrowX2} y2={browY - 5 * scale} />
          </>
        )}
        {eyebrows === "furrowed" && (
          <>
            <line x1={leftBrowX1} y1={browY + 4 * scale} x2={leftBrowX2} y2={browY - 4 * scale} />
            <line x1={rightBrowX1} y1={browY - 4 * scale} x2={rightBrowX2} y2={browY + 4 * scale} />
          </>
        )}
      </g>

      {/* 3. MẮT ĐỐI XỨNG 100% CÓ PHẢN QUANG */}
      {useDotEyes ? (
        <g>
          <circle cx={leftEyeCenter.x + gazeDx} cy={leftEyeCenter.y + gazeDy} r={5 * scale} fill={strokeColor} />
          <circle cx={rightEyeCenter.x + gazeDx} cy={rightEyeCenter.y + gazeDy} r={5 * scale} fill={strokeColor} />
        </g>
      ) : eyes === "closed" ? (
        <g stroke={strokeColor} strokeWidth={Math.max(4, 5 * scale)} strokeLinecap="round" fill="none">
          <line x1={leftEyeCenter.x - eyeR} y1={leftEyeCenter.y} x2={leftEyeCenter.x + eyeR} y2={leftEyeCenter.y} />
          <line x1={rightEyeCenter.x - eyeR} y1={rightEyeCenter.y} x2={rightEyeCenter.x + eyeR} y2={rightEyeCenter.y} />
        </g>
      ) : eyes === "happy" ? (
        <g stroke={strokeColor} strokeWidth={Math.max(4, 5 * scale)} strokeLinecap="round" fill="none">
          <path d={`M ${leftEyeCenter.x - eyeR} ${eyeY + 2 * scale} Q ${leftEyeCenter.x} ${eyeY - 6 * scale} ${leftEyeCenter.x + eyeR} ${eyeY + 2 * scale}`} />
          <path d={`M ${rightEyeCenter.x - eyeR} ${eyeY + 2 * scale} Q ${rightEyeCenter.x} ${eyeY - 6 * scale} ${rightEyeCenter.x + eyeR} ${eyeY + 2 * scale}`} />
        </g>
      ) : (
        <g id="stickman-symmetric-eyes">
          {/* Mắt trái */}
          <circle
            cx={leftEyeCenter.x}
            cy={leftEyeCenter.y}
            r={eyeR}
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth={4.5 * scale}
          />
          <circle
            cx={leftEyeCenter.x + gazeDx}
            cy={leftEyeCenter.y + gazeDy}
            r={pupilRadius}
            fill={strokeColor}
          />
          {/* Điểm phản quang mắt trái (catchlight radius ~2px) */}
          <circle
            cx={leftEyeCenter.x + gazeDx - 1.5 * scale}
            cy={leftEyeCenter.y + gazeDy - 1.5 * scale}
            r={2.2 * scale}
            fill="#FFFFFF"
          />

          {/* Mắt phải */}
          <circle
            cx={rightEyeCenter.x}
            cy={rightEyeCenter.y}
            r={eyeR}
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth={4.5 * scale}
          />
          <circle
            cx={rightEyeCenter.x + gazeDx}
            cy={rightEyeCenter.y + gazeDy}
            r={pupilRadius}
            fill={strokeColor}
          />
          {/* Điểm phản quang mắt phải (catchlight radius ~2px) */}
          <circle
            cx={rightEyeCenter.x + gazeDx - 1.5 * scale}
            cy={rightEyeCenter.y + gazeDy - 1.5 * scale}
            r={2.2 * scale}
            fill="#FFFFFF"
          />
        </g>
      )}

      {/* 4. MIỆNG CƯỜI MỘT NÉT */}
      <g stroke={strokeColor} strokeWidth={Math.max(5, 5.5 * scale)} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {mouth === "smile" && (
          <path d={`M ${-16 * scale} ${18 * scale} Q 0 ${28 * scale} ${16 * scale} ${18 * scale}`} />
        )}
        {mouth === "circleOpen" && (
          <circle cx={0} cy={22 * scale} r={8 * scale} fill={strokeColor} />
        )}
        {mouth === "line" && (
          <line x1={-14 * scale} y1={20 * scale} x2={14 * scale} y2={20 * scale} />
        )}
        {mouth === "talking" && (
          <path d={`M ${-14 * scale} ${18 * scale} Q 0 ${32 * scale} ${14 * scale} ${18 * scale} Z`} fill="#881337" strokeWidth={Math.max(4, 4.5 * scale)} />
        )}
        {mouth === "gasp" && (
          <ellipse cx={0} cy={23 * scale} rx={10 * scale} ry={14 * scale} fill="#141414" />
        )}
      </g>

      {/* 5. VỆT XÁM NHẸ DƯỚI CẰM (Chin cel-shading) */}
      <path
        d={`M ${-14 * scale} ${30 * scale} Q 0 ${38 * scale} ${14 * scale} ${30 * scale}`}
        fill="none"
        stroke="#CBD5E1"
        strokeWidth={3.5 * scale}
        strokeLinecap="round"
        opacity={0.8}
      />

      {/* Giọt mồ hôi lo lắng (Sweat drop) */}
      {sweatDrop && (
        <path
          d={`M ${headRadius - 10 * scale} ${-headRadius / 2} C ${headRadius - 4 * scale} ${-headRadius / 2 - 10 * scale}, ${headRadius + 8 * scale} ${-headRadius / 2}, ${headRadius - 2 * scale} ${-headRadius / 2 + 14 * scale} C ${headRadius - 8 * scale} ${-headRadius / 2 + 8 * scale}, ${headRadius - 14 * scale} ${-headRadius / 2 - 2 * scale}, ${headRadius - 10 * scale} ${-headRadius / 2} Z`}
          fill="#38BDF8"
          stroke={strokeColor}
          strokeWidth={3 * scale}
        />
      )}
    </g>
  );
};
