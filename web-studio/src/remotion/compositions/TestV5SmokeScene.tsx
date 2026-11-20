import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { StickmanRig } from "../components/character/StickmanRig";
import { DynamicBackground } from "../components/backgrounds/DynamicBackground";
import { DynamicProp } from "../components/props/DynamicProp";
import { InsertHandShot } from "../components/vfx/InsertHandShot";
import { GaugeMeter } from "../components/props/GaugeMeter";
import { ProfileCard } from "../components/ui/InfographicCards";
import { MangaVfxLayer } from "../vfx/MangaVfxLayer";
import { SpeechBubble } from "../components/ui/SpeechBubble";

/**
 * TestV5SmokeScene: Composition nghiệm thu thực tế Art Style V5 Storytime 2D
 * Tổng thời lượng: 480 frames (8.0 giây @ 60fps), độ phân giải 1920x1080
 * - Cảnh 1 (0s - 3s): Ông lão mũ rơm đi bộ trên cỏ, dừng lại nhìn lọ thủy tinh, bật icon ? và nói "Ơ kìa!"
 * - Cảnh 2 (3s - 5.5s): Nền Studio chấm bi kem cận cảnh chiếc lọ, cánh tay cận cảnh InsertHandShot vươn vào dán nhãn "TÁM"
 * - Cảnh 3 (5.5s - 8s): Nền giấy kẻ ngang, nhà khoa học áo blouse trắng thuyết trình cạnh GaugeMeter và thẻ hồ sơ
 */
export const TestV5SmokeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // =========================================================================
  // SCENE 1: (Frames 0 - 180 | 0.0s - 3.0s) - Bãi cỏ, Ông lão đi bộ & phát hiện lọ
  // =========================================================================
  if (frame < 180) {
    const isWalking = frame < 135;
    const walkProgress = Math.min(1, frame / 135);
    const charX = interpolate(walkProgress, [0, 1], [320, 1020], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    // Nhịp bước đi tự nhiên ~0.6s / chu kỳ
    const walkCycle = (frame / 36) % 1;

    return (
      <AbsoluteFill style={{ width, height, overflow: "hidden", backgroundColor: "#F7F3EE" }}>
        {/* Nền bãi cỏ ban ngày */}
        <DynamicBackground preset="gardenDay" />

        <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Đường mặt đất tiếp xúc */}
          <line x1={0} y1={860} x2={width} y2={860} stroke="#4B5563" strokeWidth={3} opacity={0.3} />

          {/* Đạo cụ: Lọ thủy tinh trên mặt đất */}
          <DynamicProp id="glass-jar" x={1360} y={860} scale={0.7} />

          {/* Nhân vật: Ông lão mũ rơm vàng, râu má, bàn tay tròn trắng */}
          <StickmanRig
            state={{
              x: charX,
              y: 860,
              scale: 0.95,
              facing: "right",
              pose: isWalking ? "walking" : "standing",
              walkCycleProgress: isWalking ? walkCycle : 0,
              walkWeight: isWalking ? 1.0 : 0.0,
              eyes: isWalking ? "neutral" : "surprised",
              eyebrows: isWalking ? "neutral" : "raised",
              mouth: frame >= 140 ? "talking" : "smile",
              hat: true,
              archetype: "oldMan",
            }}
          />

          {/* Bong bóng lời thoại "Ơ kìa!" khi dừng lại */}
          {frame >= 140 && (
            <SpeechBubble
              x={1040}
              y={250}
              text="Ơ kìa!"
              tailAnchor={{ x: -20, y: 110 }}
            />
          )}

          {/* Manga Pop-up Icon ? bật nảy cạnh đầu */}
          <MangaVfxLayer
            icons={[
              {
                id: "q_icon",
                type: "questionMark",
                x: 1120,
                y: 440,
                startFrame: 140,
                durationFrames: 40,
                scale: 0.85,
              },
            ]}
          />
        </svg>
      </AbsoluteFill>
    );
  }

  // =========================================================================
  // SCENE 2: (Frames 180 - 330 | 3.0s - 5.5s) - Cận cảnh lọ & Cánh tay InsertHandShot
  // =========================================================================
  if (frame >= 180 && frame < 330) {
    const localFrame = frame - 180;
    const jarX = 960;
    const jarY = 750;

    return (
      <AbsoluteFill style={{ width, height, overflow: "hidden", backgroundColor: "#FAF5E8" }}>
        {/* Nền Studio chấm bi kem */}
        <DynamicBackground preset="dottedCream" />

        <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Lọ thủy tinh cận cảnh phóng to ở trung tâm */}
          <DynamicProp id="glass-jar" x={jarX} y={jarY} scale={1.25} anchorPoint="center" />

          {/* Nhãn dán chữ "TÁM" xuất hiện khi tay chạm tới */}
          {localFrame >= 40 && (
            <g transform={`translate(${jarX}, ${jarY - 30})`}>
              {/* Tấm nhãn decal nền vàng kem viền đen đậm */}
              <rect
                x={-90}
                y={-40}
                width={180}
                height={80}
                rx={12}
                fill="#FEF08A"
                stroke="#141414"
                strokeWidth={7}
              />
              <text
                x={0}
                y={14}
                textAnchor="middle"
                fontFamily="sans-serif"
                fontSize={38}
                fontWeight="900"
                fill="#141414"
                letterSpacing={3}
              >
                TÁM
              </text>
            </g>
          )}

          {/* Cảnh cận tay tương tác: Vươn từ mép phải vào dán nhãn */}
          <InsertHandShot
            targetX={jarX}
            targetY={jarY - 30}
            fromSide="right"
            startFrame={180}
            showDashedCircle={true}
          />

          {/* Manga VFX: Ngôi sao lấp lánh khi dán nhãn hoàn tất */}
          <MangaVfxLayer
            icons={[
              {
                id: "star_finish",
                type: "sparkleStar",
                x: jarX + 110,
                y: jarY - 80,
                startFrame: 235,
                durationFrames: 50,
                scale: 0.9,
              },
            ]}
          />
        </svg>
      </AbsoluteFill>
    );
  }

  // =========================================================================
  // SCENE 3: (Frames 330 - 480 | 5.5s - 8.0s) - Giấy kẻ ngang, Nhà khoa học & Infographics
  // =========================================================================
  const scientistX = 480;
  const scientistY = 900;

  return (
    <AbsoluteFill style={{ width, height, overflow: "hidden", backgroundColor: "#F9F4E8" }}>
      {/* Nền Studio giấy vở kẻ ngang */}
      <DynamicBackground preset="linedPaper" />

      <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Nhân vật Nhà khoa học: áo blouse trắng, kính tròn, tóc nâu */}
        <StickmanRig
          state={{
            x: scientistX,
            y: scientistY,
            scale: 0.95,
            facing: "right",
            pose: "pointing",
            limbAngles: {
              rightUpperArm: -68,
              leftUpperArm: 24,
            },
            eyes: "neutral",
            eyebrows: "raised",
            mouth: "talking",
            hat: false,
            archetype: "scientist",
          }}
        />

        {/* Lời thoại thuyết trình */}
        <SpeechBubble
          x={520}
          y={230}
          text="Chỉ số trao đổi chất!"
          tailAnchor={{ x: -40, y: 120 }}
        />

        {/* Đồ họa Infographic Bên Phải: Đồng hồ đo GaugeMeter (20%) */}
        <GaugeMeter
          x={1400}
          y={520}
          scale={1.1}
          value={20}
          label="TRAO ĐỔI CHẤT: 20%"
        />

        {/* Thẻ Hồ Sơ Sinh Vật ProfileCard */}
        <ProfileCard
          x={1400}
          y={760}
          headerTitle="HỒ SƠ: CUA DỪA"
          attributes={["Tuổi thọ: 60 năm", "Nặng: ~4 kg"]}
          width={480}
        />

        {/* Manga VFX: Dấu chấm than hưng phấn */}
        <MangaVfxLayer
          icons={[
            {
              id: "sc_excl",
              type: "exclamation",
              x: scientistX + 110,
              y: 530,
              startFrame: 345,
              durationFrames: 50,
              scale: 0.8,
            },
          ]}
        />
      </svg>
    </AbsoluteFill>
  );
};
