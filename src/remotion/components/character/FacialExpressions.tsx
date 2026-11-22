import React from "react";
import { EyeExpression, EyebrowExpression, MouthExpression, Point2D } from "../../types/character";

interface FacialExpressionsProps {
  headRadius: number;
  facing?: "left" | "right";
  eyes?: EyeExpression;
  eyebrows?: EyebrowExpression;
  mouth?: MouthExpression;
  pupilGaze?: Point2D;
  /** V18.2: Dịch chuyển đồng tử + đốm sáng trong phạm vi -4px..+4px hướng về mục tiêu/nhân vật đối diện */
  lookOffset?: { dx: number; dy: number };
  blush?: boolean;
  sweatDrop?: boolean;
  strokeColor?: string;
  useDotEyes?: boolean;
  showWhiskers?: boolean;
}

/**
 * FacialExpressions V18.3: Đôi Mắt 2D Tối Giản Bình Thường (Hết Kiểu Long Lanh Anime)
 * 1. Đôi mắt 2D sạch tự nhiên: 2 vòng tròng trắng viền đen sắc nét + con ngươi tròn đen đặc bên trong
 *    di chuyển mượt theo (eyeLookX, eyeLookY) — XÓA HOÀN TOÀN các chấm sáng trắng / vầng sáng anime.
 * 2. ẨN lông mày ở các biểu cảm bình thường (HAPPY, IDLE, SMILE, CALM); chỉ vẽ lông mày mảnh khi nhấn mạnh.
 * 3. Bỏ/làm dịu hẳn má hồng để gương mặt tự nhiên, chín chắn, phù hợp kể chuyện khoa học.
 * 4. Miệng chữ U cười tự nhiên & Lip-Sync mở/đóng mượt khi nói.
 */
export const FacialExpressions: React.FC<FacialExpressionsProps> = ({
  headRadius = 56,
  eyes = "neutral",
  eyebrows = "neutral",
  mouth = "smile",
  pupilGaze = { x: 0, y: 0 },
  lookOffset,
  blush = false,
  sweatDrop = false,
  strokeColor = "#141414",
}) => {
  const scale = headRadius / 56;
  const eyeDistance = 21.5 * scale;
  const eyeY = -5 * scale;
  const scleraBaseR = 10.2 * scale;

  // Lông mày mảnh tinh tế — CHỈ hiển thị khi biểu cảm cần nhấn mạnh (CURIOUS, SHOCKED, ANGRY, WORRIED)
  const isEmphasizedExpression =
    eyebrows === "inquisitive" ||
    eyebrows === "worried" ||
    eyebrows === "furrowed" ||
    eyes === "surprised" ||
    (eyebrows === "raised" && eyes === "wide");

  const browHalfW = 9.5 * scale;
  const browY = eyeY - scleraBaseR - 6.0 * scale;
  const browStrokeWidth = 3.5 * scale;

  // V18.3: Hướng nhìn đồng tử từ lookOffset (-4px..+4px) hoặc pupilGaze
  const hasLookOffset = lookOffset !== undefined;
  const clampedGazeX = Math.max(-1, Math.min(1, pupilGaze.x || 0));
  const clampedGazeY = Math.max(-1, Math.min(1, pupilGaze.y || 0));
  const rawGazeDx = hasLookOffset
    ? Math.max(-4, Math.min(4, lookOffset!.dx || 0)) * scale
    : clampedGazeX * 3.2 * scale;
  const rawGazeDy = hasLookOffset
    ? Math.max(-4, Math.min(4, lookOffset!.dy || 0)) * scale
    : clampedGazeY * 2.8 * scale;

  const leftEyeCenter = { x: -eyeDistance, y: eyeY };
  const rightEyeCenter = { x: eyeDistance, y: eyeY };

  const leftBrowX1 = -eyeDistance - browHalfW;
  const leftBrowX2 = -eyeDistance + browHalfW;
  const rightBrowX1 = eyeDistance - browHalfW;
  const rightBrowX2 = eyeDistance + browHalfW;

  const renderClean2DEye = (
    cx: number,
    cy: number,
    keyPrefix: string,
    mode: "normal" | "wide" | "surprised"
  ) => {
    const scleraR = mode === "surprised" ? 11.4 * scale : mode === "wide" ? 11.0 * scale : scleraBaseR;
    const pupilR = mode === "surprised" ? 3.8 * scale : 4.6 * scale;
    // Giữ con ngươi tròn đen đặc luôn nằm gọn bên trong tròng trắng (không chạm viền đen)
    const maxTravel = Math.max(1.5 * scale, scleraR - pupilR - 1.5 * scale);
    const mag = Math.hypot(rawGazeDx, rawGazeDy);
    const travelScale = mag > maxTravel && mag > 1e-4 ? maxTravel / mag : 1;
    const px = cx + rawGazeDx * travelScale;
    const py = cy + rawGazeDy * travelScale;

    return (
      <g key={keyPrefix}>
        {/* Tròng trắng viền đen 2D sắc nét */}
        <circle
          cx={cx}
          cy={cy}
          r={scleraR}
          fill="#FFFFFF"
          stroke={strokeColor}
          strokeWidth={3.4 * scale}
        />
        {/* Con ngươi tròn đen đặc (KHÔNG chấm sáng anime) di chuyển mượt theo hướng nhìn */}
        <circle cx={px} cy={py} r={pupilR} fill={strokeColor} />
      </g>
    );
  };

  return (
    <g className="stickman-face">
      {/* 1. Má hồng siêu nhẹ (chỉ hiện rất dịu khi bật blush chủ đích) */}
      {blush && (
        <g opacity={0.2}>
          <ellipse cx={-eyeDistance - 5 * scale} cy={eyeY + 18 * scale} rx={9.0 * scale} ry={4.8 * scale} fill="#FB7185" />
          <ellipse cx={eyeDistance + 5 * scale} cy={eyeY + 18 * scale} rx={9.0 * scale} ry={4.8 * scale} fill="#FB7185" />
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

      {/* 3. ĐÔI MẮT 2D TỐI GIẢN BÌNH THƯỜNG (TRÒNG TRẮNG VIỀN ĐEN + CON NGƯƠI ĐEN ĐẶC — 0% CHẤM SÁNG ANIME) */}
      {eyes === "closed" ? (
        <g stroke={strokeColor} strokeWidth={4.0 * scale} strokeLinecap="round" fill="none">
          <path d={`M ${leftEyeCenter.x - 9 * scale} ${eyeY + 1 * scale} Q ${leftEyeCenter.x} ${eyeY + 5 * scale} ${leftEyeCenter.x + 9 * scale} ${eyeY + 1 * scale}`} />
          <path d={`M ${rightEyeCenter.x - 9 * scale} ${eyeY + 1 * scale} Q ${rightEyeCenter.x} ${eyeY + 5 * scale} ${rightEyeCenter.x + 9 * scale} ${eyeY + 1 * scale}`} />
        </g>
      ) : (
        <g id="stickman-clean-2d-eyes">
          {renderClean2DEye(
            leftEyeCenter.x,
            leftEyeCenter.y,
            "eye_l",
            eyes === "surprised" ? "surprised" : eyes === "wide" ? "wide" : "normal"
          )}
          {renderClean2DEye(
            rightEyeCenter.x,
            rightEyeCenter.y,
            "eye_r",
            eyes === "surprised" ? "surprised" : eyes === "wide" ? "wide" : "normal"
          )}
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
