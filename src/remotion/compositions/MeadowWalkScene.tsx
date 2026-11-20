import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Easing,
} from "remotion";
import { StickmanRig } from "../components/character/StickmanRig";
import { DynamicBackground } from "../components/backgrounds/DynamicBackground";
import { SubtitleBox } from "../components/ui/SubtitleBox";
import { SvgDefsLibrary } from "../vfx/SvgDefsLibrary";
import { EnvironmentVfxLayer } from "../vfx/EnvironmentVfxLayer";
import { StickmanState } from "../types/character";

/**
 * MeadowWalkScene: Cảnh kiểm thử độc lập - Người que đi bộ trên đồng cỏ
 * Mục đích:
 * 1. Xác nhận rig nhân vật có 2 chân tách biệt rõ ràng, tiếp đất phẳng 100%.
 * 2. Walk cycle mượt mà, không trượt chân (moonwalk), vung tay đối xứng tự nhiên.
 * 3. Tỷ lệ nhân vật dùng được cho mọi bối cảnh ngoài câu chuyện con nhện.
 */
export const MeadowWalkScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const DESIGN_WIDTH = 2560;
  const DESIGN_HEIGHT = 1440;
  const FLOOR_Y = 1120;
  const TOTAL_FRAMES = 300; // 5 giây @ 60fps

  // Quãng đường đi bộ từ x = 400 sang x = 2160
  const walkProgress = Math.min(1, Math.max(0, frame / TOTAL_FRAMES));
  const easedProgress = interpolate(walkProgress, [0, 1], [0, 1], {
    easing: Easing.linear,
  });

  const charX = interpolate(easedProgress, [0, 1], [400, 2160]);

  // Chu kỳ bước đi: ~50 frames cho 1 chu kỳ 2 bước
  const walkCycle = (frame * 0.02) % 1;
  const verticalBob = Math.abs(Math.sin(frame * 0.02 * Math.PI * 2)) * 6;

  const walkerState: StickmanState = {
    x: charX,
    y: FLOOR_Y - verticalBob,
    scale: 1.0,
    facing: "right",
    pose: "walking",
    eyes: "happy",
    eyebrows: "neutral",
    mouth: "smile",
    pupilGaze: { x: 0.6, y: 0.1 },
    walkCycleProgress: walkCycle,
    walkWeight: 1.0,
  };

  return (
    <AbsoluteFill style={{ width: "100%", height: "100%", backgroundColor: "#E9F5EB", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
        className="w-full h-full select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <SvgDefsLibrary />

        {/* 1. Bối cảnh thiên nhiên ngoài trời (Đồng cỏ xanh, đồi thoai thoải, bầu trời trong) */}
        <DynamicBackground preset="gardenDay" />

        {/* 2. Hiệu ứng môi trường: Mây trôi nhẹ, tia nắng ấm, ngọn gió thoảng */}
        <EnvironmentVfxLayer
          effects={["cloudDrift", "sunbeams", "windBreeze"]}
          lighting={{ preset: "sunbeams" }}
          backgroundPreset="gardenDay"
          frame={frame}
          fps={fps}
          canvasWidth={DESIGN_WIDTH}
          canvasHeight={DESIGN_HEIGHT}
        />

        {/* 3. Nhân vật người que bước đi tự nhiên trên bãi cỏ */}
        <g id="meadow-walker">
          <StickmanRig state={walkerState} renderPart="all" />
        </g>

        {/* 4. Phụ đề kiểm thử rig */}
        <SubtitleBox
          text="Kiểm tra rig: Người đi bộ tự nhiên trên đồng cỏ xanh mướt."
          currentFrame={frame}
          fps={fps}
          x={1280}
          y={1320}
        />
      </svg>
    </AbsoluteFill>
  );
};
