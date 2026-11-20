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
 * FacialExpressions V16.0: Khuôn Mặt Thân Thiện, Tối Giản & Ấm Áp
 * 1. Mắt tròn đen to hơn ~25% (r ≈ 9.6px), rõ nét ngay cả ở cỡ nhỏ, kèm chấm sáng trắng & vầng sáng lưỡi liềm (dot + crescent highlight).
 * 2. ẨN hoàn toàn lông mày ở các biểu cảm mặc định (HAPPY, IDLE, SMILE, CALM) cho gương mặt thoáng hiền;
 *    CHỈ vẽ lông mày mảnh tinh tế (3.4px) khi biểu cảm cần nhấn mạnh (CURIOUS, SHOCKED, ANGRY, WORRIED).
 * 3. Xóa hoàn toàn vệt cong cằm màu xám cũ (không còn cảm giác già).
 * 4. Miệng chữ U cười tròn mềm thân thiện; Lip-Sync mở/đóng tròn tự nhiên khi nói.
 */
export const FacialExpressions: React.FC<FacialExpressionsProps> = ({
  headRadius = 56,
  eyes = "neutral",
  eyebrows = "neutral",
  mouth = "smile",
  pupilGaze = { x: 0, y: 0 },
  blush = false,
  sweatDrop = false,
  strokeColor = "#141414",
}) => {
  const scale = headRadius / 56;
  const eyeDistance = 21.5 * scale;
  const eyeY = -5 * scale;
  // V16.0: Mắt tròn đen to hơn ~25% so với cũ (7.5 -> 9.6 * scale)
  const eyeR = 9.6 * scale;

  // Lông mày mảnh tinh tế — CHỈ hiển thị khi biểu cảm cần nhấn mạnh (CURIOUS, SHOCKED, ANGRY, WORRIED)
  const isEmphasizedExpression =
    eyebrows === "inquisitive" ||
    eyebrows === "worried" ||
    eyebrows === "furrowed" ||
    eyes === "surprised" ||
    (eyebrows === "raised" && eyes === "wide");

  const browHalfW = 9.5 * scale;
  const browY = eyeY - eyeR - 6.5 * scale;
  const browStrokeWidth = 3.5 * scale;

  // Gaze offset nhẹ cho ánh nhìn sống động
  const clampedGazeX = Math.max(-1, Math.min(1, pupilGaze.x || 0));
  const clampedGazeY = Math.max(-1, Math.min(1, pupilGaze.y || 0));
  const gazeDx = clampedGazeX * 2.4 * scale;
  const gazeDy = clampedGazeY * 2.0 * scale;

  const leftEyeCenter = { x: -eyeDistance, y: eyeY };
  const rightEyeCenter = { x: eyeDistance, y: eyeY };

  const leftBrowX1 = -eyeDistance - browHalfW;
  const leftBrowX2 = -eyeDistance + browHalfW;
  const rightBrowX1 = eyeDistance - browHalfW;
  const rightBrowX2 = eyeDistance + browHalfW;

  const renderFriendlyGlossyEye = (cx: number, cy: number, keyPrefix: string, isExtraWide = false) => {
    const r = isExtraWide ? eyeR * 1.08 : eyeR;
    const ex = cx + gazeDx;
    const ey = cy + gazeDy;
    return (
      <g key={keyPrefix}>
        {/* Tròng mắt tròn đen lớn thân thiện */}
        <circle cx={ex} cy={ey} r={r} fill={strokeColor} />
        {/* Chấm sáng trắng chính góc trên-trái (dot highlight) */}
        <circle cx={ex - r * 0.32} cy={ey - r * 0.30} r={r * 0.33} fill="#FFFFFF" />
        {/* Vầng sáng lưỡi liềm nhỏ góc dưới-phải (crescent/sparkle highlight) */}
        <path
          d={`M ${ex + r * 0.14} ${ey + r * 0.44} A ${r * 0.48} ${r * 0.48} 0 0 0 ${ex + r * 0.46} ${ey + r * 0.12}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={1.8 * scale}
          strokeLinecap="round"
          opacity={0.85}
        />
      </g>
    );
  };

  return (
    <g className="stickman-face">
      {/* 1. Má hồng mềm mại ấm áp (Blush cheeks) */}
      {blush && (
        <g opacity={0.48}>
          <ellipse cx={-eyeDistance - 5 * scale} cy={eyeY + 18 * scale} rx={11.5 * scale} ry={6.2 * scale} fill="#FB7185" />
          <ellipse cx={eyeDistance + 5 * scale} cy={eyeY + 18 * scale} rx={11.5 * scale} ry={6.2 * scale} fill="#FB7185" />
        </g>
      )}

      {/* 2. LÔNG MÀY MẢNH TINH TẾ — ẨN HOÀN TOÀN Ở MẶC ĐỊNH (HAPPY/IDLE/SMILE/CALM), CHỈ HIỆN KHI NHẤN MẠNH */}
      {isEmphasizedExpression && (
        <g stroke={strokeColor} strokeWidth={browStrokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {eyebrows === "inquisitive" && (
            <>
              <path d={`M ${leftBrowX1} ${browY + 1} Q ${-eyeDistance} ${browY - 2 * scale} ${leftBrowX2} ${browY + 1}`} />
              <path d={`M ${rightBrowX1} ${browY - 5 * scale} Q ${eyeDistance} ${browY - 8 * scale} ${rightBrowX2} ${browY - 3 * scale}`} />
            </>
          )}
          {eyebrows === "worried" && (
            <>
              <path d={`M ${leftBrowX1} ${browY + 2 * scale} Q ${-eyeDistance} ${browY - 2 * scale} ${leftBrowX2} ${browY - 4 * scale}`} />
              <path d={`M ${rightBrowX1} ${browY - 4 * scale} Q ${eyeDistance} ${browY - 2 * scale} ${rightBrowX2} ${browY + 2 * scale}`} />
            </>
          )}
          {eyebrows === "furrowed" && (
            <>
              <line x1={leftBrowX1} y1={browY - 3 * scale} x2={leftBrowX2} y2={browY + 3 * scale} />
              <line x1={rightBrowX1} y1={browY + 3 * scale} x2={rightBrowX2} y2={browY - 3 * scale} />
            </>
          )}
          {(eyes === "surprised" || (eyebrows === "raised" && eyes === "wide")) &&
            eyebrows !== "worried" &&
            eyebrows !== "furrowed" &&
            eyebrows !== "inquisitive" && (
              <>
                <path d={`M ${leftBrowX1} ${browY - 4 * scale} Q ${-eyeDistance} ${browY - 9 * scale} ${leftBrowX2} ${browY - 4 * scale}`} />
                <path d={`M ${rightBrowX1} ${browY - 4 * scale} Q ${eyeDistance} ${browY - 9 * scale} ${rightBrowX2} ${browY - 4 * scale}`} />
              </>
            )}
        </g>
      )}

      {/* 3. ĐÔI MẮT TRÒN ĐEN TO THÂN THIỆN KÈM CHẤM SÁNG TRẮNG */}
      {eyes === "closed" ? (
        <g stroke={strokeColor} strokeWidth={4.2 * scale} strokeLinecap="round" fill="none">
          <path d={`M ${leftEyeCenter.x - 9 * scale} ${eyeY + 1 * scale} Q ${leftEyeCenter.x} ${eyeY + 5 * scale} ${leftEyeCenter.x + 9 * scale} ${eyeY + 1 * scale}`} />
          <path d={`M ${rightEyeCenter.x - 9 * scale} ${eyeY + 1 * scale} Q ${rightEyeCenter.x} ${eyeY + 5 * scale} ${rightEyeCenter.x + 9 * scale} ${eyeY + 1 * scale}`} />
        </g>
      ) : eyes === "surprised" ? (
        <g id="stickman-surprised-eyes">
          {[leftEyeCenter, rightEyeCenter].map((ec, i) => (
            <g key={`surp_eye_${i}`}>
              <circle cx={ec.x} cy={ec.y} r={11.5 * scale} fill="#FFFFFF" stroke={strokeColor} strokeWidth={3.8 * scale} />
              <circle cx={ec.x + gazeDx} cy={ec.y + gazeDy} r={5.4 * scale} fill={strokeColor} />
              <circle cx={ec.x + gazeDx - 1.8 * scale} cy={ec.y + gazeDy - 1.8 * scale} r={2.2 * scale} fill="#FFFFFF" />
            </g>
          ))}
        </g>
      ) : (
        <g id="stickman-friendly-glossy-eyes">
          {renderFriendlyGlossyEye(leftEyeCenter.x, leftEyeCenter.y, "eye_l", eyes === "wide")}
          {renderFriendlyGlossyEye(rightEyeCenter.x, rightEyeCenter.y, "eye_r", eyes === "wide")}
        </g>
      )}

      {/* 4. MIỆNG CƯỜI CHỮ U TRÒN MỀM & LIP-SYNC TRÒN TỰ NHIÊN (ĐÃ XÓA BỎ HOÀN TOÀN VỆT CẰM XÁM!) */}
      <g stroke={strokeColor} strokeWidth={4.6 * scale} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {mouth === "smile" && (
          <path d={`M ${-12.5 * scale} ${17 * scale} Q 0 ${29.5 * scale} ${12.5 * scale} ${17 * scale}`} />
        )}
        {mouth === "circleOpen" && (
          <circle cx={0} cy={22 * scale} r={7.2 * scale} fill="#9F1239" stroke={strokeColor} strokeWidth={3.8 * scale} />
        )}
        {mouth === "line" && (
          <path d={`M ${-10 * scale} ${21 * scale} Q 0 ${22.5 * scale} ${10 * scale} ${21 * scale}`} />
        )}
        {mouth === "talking" && (
          <g>
            <path
              d={`M ${-11.5 * scale} ${17 * scale} Q 0 ${15.5 * scale} ${11.5 * scale} ${17 * scale} Q ${11.5 * scale} ${31 * scale} 0 ${31 * scale} Q ${-11.5 * scale} ${31 * scale} ${-11.5 * scale} ${17 * scale} Z`}
              fill="#9F1239"
              stroke={strokeColor}
              strokeWidth={3.8 * scale}
            />
            <ellipse cx={0} cy={27 * scale} rx={5.2 * scale} ry={2.8 * scale} fill="#FB7185" stroke="none" />
          </g>
        )}
        {mouth === "gasp" && (
          <g>
            <ellipse cx={0} cy={22.5 * scale} rx={9.5 * scale} ry={12.5 * scale} fill="#9F1239" stroke={strokeColor} strokeWidth={4.0 * scale} />
            <ellipse cx={0} cy={29.5 * scale} rx={5.5 * scale} ry={3.2 * scale} fill="#FB7185" stroke="none" />
          </g>
        )}
      </g>

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
