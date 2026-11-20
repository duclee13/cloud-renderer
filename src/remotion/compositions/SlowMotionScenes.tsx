import React from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
import { WalkRunReferenceScene } from "./WalkRunReferenceScene";

/**
 * SlowMotionTransitionScene:
 * Phóng chậm 4x (0.25x real-time) phân đoạn chuyển tiếp từ chuẩn bị sang chạy (f185 -> f205).
 * 21 khung hình gốc x 4 = 84 frames.
 * Hiển thị rõ số frame gốc, thời gian quy đổi, và trạng thái liên tục vận tốc góc.
 */
export const SlowMotionTransitionScene: React.FC = () => {
  const currentFrame = useCurrentFrame();
  const slowFactor = 4;
  const startOrigFrame = 185;
  const endOrigFrame = 205;

  const origFrame = Math.min(
    endOrigFrame,
    startOrigFrame + Math.floor(currentFrame / slowFactor)
  );

  return (
    <AbsoluteFill style={{ position: "relative" }}>
      {/* Cảnh gốc được render tại frame gốc cụ thể với debug markers */}
      <WalkRunReferenceScene showDebugMarkers={true} overrideFrame={origFrame} cameraMode="closeUp" />

      {/* Slow-Motion Watermark & Technical Overlay */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 30,
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          border: "2px solid #8B5CF6",
          borderRadius: 12,
          padding: "14px 22px",
          color: "#FFFFFF",
          fontFamily: "monospace",
          fontSize: 16,
          lineHeight: 1.6,
          boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
          zIndex: 100,
        }}
      >
        <div style={{ color: "#A78BFA", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
          SLOW-MOTION 0.25X | KHỚP NỐI & VẬN TỐC
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Frame gốc:</span>{" "}
          <strong style={{ color: "#FDE047", fontSize: 20 }}>f{origFrame}</strong>{" "}
          <span style={{ color: "#94A3B8" }}>({(origFrame / 60).toFixed(3)}s)</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Tốc độ xem:</span> <strong>0.25x (1 frame gốc = 4 frame clip)</strong>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Ranh giới f194-195:</span>{" "}
          <span style={{ color: "#34D399", fontWeight: 700 }}>Liên tục vận tốc góc (&lt; 3°/frame)</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Gốc vai:</span>{" "}
          <span style={{ color: "#38BDF8" }}>Gốc vai hẹp (±5px), không bắt chéo X</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * SlowMotionBrakingScene:
 * Phóng chậm 4x (0.25x real-time) phân đoạn hãm tốc từ chạy sang đứng (f320 -> f340).
 * 21 khung hình gốc x 4 = 84 frames.
 * Hiển thị rõ chân trụ kế thừa từ f329, điểm tiếp xúc mặt đất và độ trượt 0.00px.
 */
export const SlowMotionBrakingScene: React.FC = () => {
  const currentFrame = useCurrentFrame();
  const slowFactor = 4;
  const startOrigFrame = 320;
  const endOrigFrame = 340;

  const origFrame = Math.min(
    endOrigFrame,
    startOrigFrame + Math.floor(currentFrame / slowFactor)
  );

  return (
    <AbsoluteFill style={{ position: "relative" }}>
      {/* Cảnh gốc được render tại frame gốc cụ thể với debug markers */}
      <WalkRunReferenceScene showDebugMarkers={true} overrideFrame={origFrame} cameraMode="closeUp" />

      {/* Slow-Motion Watermark & Technical Overlay */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 30,
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          border: "2px solid #10B981",
          borderRadius: 12,
          padding: "14px 22px",
          color: "#FFFFFF",
          fontFamily: "monospace",
          fontSize: 16,
          lineHeight: 1.6,
          boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
          zIndex: 100,
        }}
      >
        <div style={{ color: "#34D399", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
          SLOW-MOTION 0.25X | CHÂN TRỤ & HÃM TỐC
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Frame gốc:</span>{" "}
          <strong style={{ color: "#FDE047", fontSize: 20 }}>f{origFrame}</strong>{" "}
          <span style={{ color: "#94A3B8" }}>({(origFrame / 60).toFixed(3)}s)</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Tốc độ xem:</span> <strong>0.25x (1 frame gốc = 4 frame clip)</strong>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Ranh giới f329-330:</span>{" "}
          <span style={{ color: "#34D399", fontWeight: 700 }}>Kế thừa chân phải chạm đất (0px nhảy mốc)</span>
        </div>
        <div>
          <span style={{ color: "#94A3B8" }}>Độ trượt chân trụ:</span>{" "}
          <span style={{ color: "#FDE047", fontWeight: 700 }}>0.00 px (Khoá cứng tiếp xúc)</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
