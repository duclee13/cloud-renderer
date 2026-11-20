import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Easing,
} from "remotion";
import { StickmanRig } from "../components/character/StickmanRig";
import { DynamicProp } from "../components/props/DynamicProp";
import { DynamicBackground } from "../components/backgrounds/DynamicBackground";
import { SubtitleBox } from "../components/ui/SubtitleBox";
import { SpeechBubble } from "../components/ui/SpeechBubble";
import { SvgDefsLibrary } from "../vfx/SvgDefsLibrary";
import { HandInteraction } from "../components/character/HandInteraction";
import { MetabolicClock } from "../components/props/MetabolicClock";
import { StickmanState } from "../types/character";

/**
 * FixedStoryScene: Composition dựng kịch bản chuẩn 4 cảnh theo đúng nghiệm thu
 *
 * Cảnh 1 (0 -> 360f / 0s -> 6s):
 *   Phát hiện con nhện nhỏ trong lọ trên sàn.
 *   Tôi nói "Để sau!" (bong bóng thoại không che mặt, lọ chưa có nhãn).
 *   Tôi quay đi và bước đi, bỏ qua nó.
 *
 * Cảnh 2 (360 -> 720f / 6s -> 12s):
 *   Cận cảnh chiếc lọ thủy tinh.
 *   Bàn tay đưa nhãn "Tám" tới, dán nhãn lên lọ, rồi rút tay ra.
 *   Nhãn ở lại trên lọ, không phải bong bóng thoại.
 *
 * Cảnh 3 (720 -> 1080f / 12s -> 18s):
 *   Minh họa mức trao đổi chất thấp bằng đồng hồ có kim chuyển động rõ ràng.
 *   Đồng hồ là chủ thể chính, không có đường trục trang trí thừa.
 *
 * Cảnh 4 (1080 -> 1560f / 18s -> 26s):
 *   Buổi tối, nhân vật ngồi làm việc sau bàn, tay đặt đúng vùng bàn phím laptop.
 *   Đèn bàn ấm áp, cửa sổ có trăng sao. Tư thế ngồi đúng chuẩn, không vung tay.
 */
export const FixedStoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const DESIGN_WIDTH = 2560;
  const DESIGN_HEIGHT = 1440;
  const FLOOR_Y = 1120;

  // Xác định cảnh hiện tại
  let sceneIndex = 1;
  let sceneLocalFrame = frame;

  if (frame < 360) {
    sceneIndex = 1;
    sceneLocalFrame = frame;
  } else if (frame < 720) {
    sceneIndex = 2;
    sceneLocalFrame = frame - 360;
  } else if (frame < 1080) {
    sceneIndex = 3;
    sceneLocalFrame = frame - 720;
  } else {
    sceneIndex = 4;
    sceneLocalFrame = frame - 1080;
  }

  // =========================================================================
  // SCENE 1 LOGIC (0 -> 360 frames)
  // =========================================================================
  // Timeline:
  // 0 - 60: Đứng nhìn lọ nhện trên sàn (chân đứng vững, tách biệt)
  // 60 - 180: Nói "Để sau!" (bong bóng thoại ở góc trên trước mặt, miệng cử động)
  // 180 - 360: Quay người bước đi sang phải, bỏ qua chiếc lọ
  const s1CharState: StickmanState = {
    x: 1450,
    y: FLOOR_Y,
    scale: 1.0,
    facing: "left",
    pose: "standing",
    eyes: "neutral",
    eyebrows: "raised",
    mouth: "smile",
    pupilGaze: { x: -0.7, y: 0.4 },
    isSpeaking: false,
    walkCycleProgress: 0,
    walkWeight: 0,
  };

  let s1BubbleVisible = false;

  if (sceneIndex === 1) {
    if (sceneLocalFrame >= 60 && sceneLocalFrame < 190) {
      s1BubbleVisible = true;
      s1CharState.isSpeaking = true;
      s1CharState.mouth = "talking";
      s1CharState.eyes = "happy";
    }

    if (sceneLocalFrame >= 190) {
      // Quay người sang phải và bước đi
      s1CharState.facing = "right";
      s1CharState.pose = "walking";
      s1CharState.eyes = "neutral";
      s1CharState.pupilGaze = { x: 0.6, y: 0 };

      const walkStart = 190;
      const walkDur = 160;
      const walkProgress = Math.min(1, Math.max(0, (sceneLocalFrame - walkStart) / walkDur));
      const easedWalk = interpolate(walkProgress, [0, 1], [0, 1], {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      s1CharState.x = interpolate(easedWalk, [0, 1], [1450, 2250]);
      s1CharState.walkCycleProgress = (sceneLocalFrame * 0.02) % 1;
      s1CharState.walkWeight = 1.0;
      // Nhấp nhô tự nhiên
      s1CharState.y = FLOOR_Y - Math.abs(Math.sin(sceneLocalFrame * 0.02 * Math.PI * 2)) * 6;
    }
  }

  // =========================================================================
  // SCENE 2 LOGIC (360 -> 720 frames): Cận cảnh chiếc lọ dán nhãn "Tám"
  // =========================================================================
  // Bàn tay đưa nhãn từ ngoài vào ở frame 45, dán dính vào lọ ở frame 95, rút về ở frame 140
  const s2JarTargetPos = { x: 1280, y: 640 };

  // =========================================================================
  // SCENE 3 LOGIC (720 -> 1080 frames): Đồng hồ tốc độ trao đổi chất thấp
  // =========================================================================

  // =========================================================================
  // SCENE 4 LOGIC (1080 -> 1560 frames): Ngồi làm việc sau bàn đêm ấm cúng
  // =========================================================================
  const s4DeskX = 1380;
  const s4DeskY = FLOOR_Y;
  const s4DeskSurfaceY = 760;
  const s4WorkerX = 1380;

  const s4CharState: StickmanState = {
    x: s4WorkerX,
    y: FLOOR_Y,
    scale: 1.0,
    facing: "left", // Ngồi làm việc nhìn về phía laptop và đèn bàn bên trái
    pose: "sittingBehindDesk",
    eyes: "neutral",
    eyebrows: "neutral",
    mouth: "smile",
    pupilGaze: { x: -0.4, y: 0.5 },
    typingProgress: sceneIndex === 4 ? (sceneLocalFrame * 0.05) % 1 : 0,
    seatedHipY: -220, // Độ cao ghế ngồi chuẩn mực
  };

  return (
    <AbsoluteFill style={{ width: "100%", height: "100%", backgroundColor: "#F8EFE3", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
        className="w-full h-full select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <SvgDefsLibrary />

        {/* ===================================================================
            CẢNH 1: Phát hiện con nhện trong lọ trên sàn -> Nói "Để sau!" rồi đi
        =================================================================== */}
        {sceneIndex === 1 && (
          <g id="scene-01-container">
            {/* Background phòng khách ban ngày */}
            <DynamicBackground preset="livingRoomDay" />

            {/* Chiếc lọ thủy tinh chứa nhện đặt TRÊN SÀN (nhỏ, tỷ lệ cảnh toàn 0.42, KHÔNG CÓ NHÃN) */}
            <g id="scene1-jar-on-floor">
              <DynamicProp
                id="glass-jar"
                x={880}
                y={FLOOR_Y}
                scale={0.42}
                anchorPoint="bottomCenter"
                defaultDimensions={{ width: 320, height: 420 }}
              >
                {/* Con nhện nhỏ bên trong lọ */}
                <DynamicProp
                  id="spider"
                  x={0}
                  y={0}
                  scale={0.4}
                  anchorPoint="center"
                  defaultDimensions={{ width: 320, height: 240 }}
                />
              </DynamicProp>
            </g>

            {/* Cây cảnh trang trí góc xa bên trái */}
            <DynamicProp
              id="potted-plant"
              x={350}
              y={FLOOR_Y}
              scale={0.9}
              anchorPoint="bottomCenter"
              defaultDimensions={{ width: 280, height: 350 }}
            />

            {/* Nhân vật người que đứng vững chãi, hai chân tách biệt rõ ràng */}
            <g id="scene1-stickman">
              <StickmanRig state={s1CharState} renderPart="all" />
            </g>

            {/* Bong bóng thoại "Để sau!" xuất hiện góc trên trước mặt, KHÔNG CHE MẶT */}
            {s1BubbleVisible && (
              <g id="scene1-speech-bubble">
                <SpeechBubble
                  x={1120}
                  y={160}
                  text="Để sau!"
                  tailAnchor={{ x: 230, y: 220 }}
                />
              </g>
            )}

            {/* Phụ đề cảnh 1 */}
            <SubtitleBox
              text="Tôi nhìn thấy một con nhện nhỏ trong chiếc lọ thủy tinh trên sàn nhà. Tôi bảo 'Để sau!' rồi quên bẵng nó."
              currentFrame={frame}
              fps={fps}
              x={1280}
              y={1320}
            />
          </g>
        )}

        {/* ===================================================================
            CẢNH 2: Cận chiếc lọ, bàn tay đưa nhãn "Tám" tới dán rồi rút ra
        =================================================================== */}
        {sceneIndex === 2 && (
          <g id="scene-02-container">
            {/* Background trung tính cho cảnh cận */}
            <rect x={0} y={0} width={DESIGN_WIDTH} height={DESIGN_HEIGHT} fill="#F4EFE6" />

            {/* Họa tiết trang nhã phía sau */}
            <g stroke="#E8DFD1" strokeWidth={30} opacity={0.5}>
              {Array.from({ length: 30 }).map((_, idx) => (
                <line key={idx} x1={idx * 100} y1={0} x2={idx * 100} y2={DESIGN_HEIGHT} />
              ))}
            </g>

            {/* Chiếc lọ thủy tinh hiển thị rõ ràng cận cảnh ở giữa màn hình (Scale 1.7) */}
            <g id="scene2-jar-closeup">
              <DynamicProp
                id="glass-jar"
                x={1280}
                y={730}
                scale={1.7}
                anchorPoint="center"
                defaultDimensions={{ width: 320, height: 420 }}
              >
                {/* Con nhện Tám nhìn tò mò bên trong lọ */}
                <DynamicProp
                  id="spider"
                  x={0}
                  y={15}
                  scale={0.52}
                  anchorPoint="center"
                  defaultDimensions={{ width: 320, height: 240 }}
                />
              </DynamicProp>
            </g>

            {/* Bàn tay đưa nhãn "Tám" tới dán lên thân lọ rồi rút về */}
            <HandInteraction
              frame={sceneLocalFrame}
              fps={fps}
              targetPos={s2JarTargetPos}
              originPos={{ x: 2150, y: 520 }}
              labelText="Tám"
              startFrame={30}
              applyFrame={95}
              retractFrame={170}
              endFrame={240}
            />

            {/* Phụ đề cảnh 2 */}
            <SubtitleBox
              text="Chiếc lọ thủy tinh được dán nhãn đặt tên cho nó là 'Tám'."
              currentFrame={frame}
              fps={fps}
              x={1280}
              y={1320}
            />
          </g>
        )}

        {/* ===================================================================
            CẢNH 3: Đồng hồ đo mức trao đổi chất thấp, kim chuyển động rõ ràng
        =================================================================== */}
        {sceneIndex === 3 && (
          <g id="scene-03-container">
            {/* Background đồ họa sạch sẽ */}
            <DynamicBackground preset="infographicStripes" />

            {/* Đồng hồ đo trao đổi chất là chủ thể duy nhất, kim quay rõ ràng */}
            <MetabolicClock
              x={1280}
              y={620}
              scale={1.8}
              frame={sceneLocalFrame}
              startFrame={15}
              durationInFrames={360}
            />

            {/* Phụ đề cảnh 3 */}
            <SubtitleBox
              text="Nó tự hạ tốc độ trao đổi chất để sống sót."
              currentFrame={frame}
              fps={fps}
              x={1280}
              y={1320}
            />
          </g>
        )}

        {/* ===================================================================
            CẢNH 4: Buổi tối, nhân vật ngồi làm việc sau bàn, tay đặt đúng bàn phím
        =================================================================== */}
        {sceneIndex === 4 && (
          <g id="scene-04-container">
            {/* Background phòng ngủ/làm việc đêm có cửa sổ trăng sao */}
            <DynamicBackground preset="livingRoomNight" />

            {/* LAYER 1: Ghế ngồi công thái học phía sau bàn */}
            <g id="scene4-ergonomic-chair" transform={`translate(${s4WorkerX}, ${FLOOR_Y})`}>
              {/* Chân ghế và trụ kim loại */}
              <rect x={-8} y={-220} width={16} height={220} fill="#27272A" />
              <ellipse cx={0} cy={0} rx={95} ry={14} fill="#18181B" />
              {/* Đệm ngồi ghế */}
              <rect x={-95} y={-235} width={190} height={28} rx={12} fill="#334155" stroke="#141414" strokeWidth={8} />
              {/* Tựa lưng ghế */}
              <rect x={25} y={-520} width={38} height={300} rx={18} fill="#334155" stroke="#141414" strokeWidth={8} />
            </g>

            {/* LAYER 2: Chân sau của bàn học */}
            <g id="scene4-desk-back">
              <DynamicProp
                id="desk-back"
                x={s4DeskX}
                y={s4DeskY}
                scale={1.0}
                defaultDimensions={{ width: 1100, height: 400 }}
              />
            </g>

            {/* LAYER 3: Thân và đầu người que ngồi ghế (hai đùi hướng về trước dưới gầm bàn) */}
            <g id="scene4-worker-seated-body">
              <StickmanRig state={s4CharState} renderPart="bodyOnly" />
            </g>

            {/* LAYER 4: Mặt bàn học và chân trước che khuất phần dưới cơ thể */}
            <g id="scene4-desk-front">
              <DynamicProp
                id="desk-front"
                x={s4DeskX}
                y={s4DeskY}
                scale={1.0}
                defaultDimensions={{ width: 1100, height: 400 }}
              />
            </g>

            {/* LAYER 5: Các vật dụng trên mặt bàn gỗ (y = s4DeskSurfaceY = 760) */}
            {/* 5A. Laptop mở màn hình hiển thị code, bàn phím đặt ngay trước mặt nhân vật */}
            <g id="scene4-laptop">
              <DynamicProp
                id="laptop"
                x={1260}
                y={s4DeskSurfaceY}
                scale={0.9}
                anchorPoint="bottomCenter"
                defaultDimensions={{ width: 340, height: 260 }}
              />
            </g>

            {/* 5B. Đèn bàn ấm áp đặt bên trái bàn học */}
            <g id="scene4-desk-lamp">
              <DynamicProp
                id="desk-lamp"
                x={960}
                y={s4DeskSurfaceY}
                scale={1.05}
                anchorPoint="bottomCenter"
                defaultDimensions={{ width: 390, height: 150 }}
              />
            </g>

            {/* 5C. Nón ánh sáng vàng ấm tỏa từ đèn bàn xuống mặt bàn và laptop */}
            <g id="scene4-warm-light-glow" opacity={0.88 + 0.05 * Math.sin(frame * 0.08)}>
              <ellipse cx={1160} cy={s4DeskSurfaceY + 5} rx={320} ry={45} fill="url(#tableSurfaceGlow)" />
              <polygon
                points={`980,${s4DeskSurfaceY - 120} 850,${s4DeskSurfaceY + 10} 1420,${s4DeskSurfaceY + 10}`}
                fill="url(#lightConeGradient)"
                opacity={0.8}
              />
            </g>

            {/* 5D. Chiếc lọ chứa nhện "Tám" (đã có nhãn) để bên phải bàn */}
            <g id="scene4-jar-with-tam">
              <DynamicProp
                id="glass-jar"
                x={1760}
                y={s4DeskSurfaceY}
                scale={0.52}
                anchorPoint="bottomCenter"
                label="Tám"
                defaultDimensions={{ width: 320, height: 420 }}
              >
                <DynamicProp
                  id="spider"
                  x={0}
                  y={0}
                  scale={0.45}
                  anchorPoint="center"
                  defaultDimensions={{ width: 320, height: 240 }}
                />
              </DynamicProp>
            </g>

            {/* LAYER 6: Cánh tay người que đặt CHUẨN XÁC trên vùng bàn phím laptop */}
            {/* Bàn tay gõ nhẹ nhịp nhàng, tuyệt đối không vung tay trong không khí */}
            <g id="scene4-worker-hands-on-keyboard">
              <StickmanRig state={s4CharState} renderPart="armsOnly" />
            </g>

            {/* Phụ đề cảnh 4 */}
            <SubtitleBox
              text="Buổi tối bình thường, tôi ngồi sau bàn học làm việc dưới ánh đèn bàn ấm áp, bên ngoài cửa sổ là trăng sao."
              currentFrame={frame}
              fps={fps}
              x={1280}
              y={1320}
            />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
