import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export type MangaIconType =
  | "questionMark"
  | "exclamation"
  | "heartLove"
  | "sparkleStar"
  | "sfxText";

export interface MangaPopUpIconItem {
  id: string;
  type: MangaIconType;
  x: number;
  y: number;
  startFrame: number;
  durationFrames?: number;
  text?: string; // Cho sfxText (ví dụ: "PHỰT!", "HEHE", "OÁI!")
  scale?: number;
}

export interface SpeedMotionArcItem {
  id: string;
  cx: number;
  cy: number;
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
  startFrame: number;
  durationFrames?: number;
}

export interface MangaVfxLayerProps {
  icons?: MangaPopUpIconItem[];
  speedArcs?: SpeedMotionArcItem[];
  colorFilter?: "none" | "sepia" | "nightSpotlight";
  spotlightTarget?: { x: number; y: number; radius?: number };
  foregroundOverlay?: "none" | "bambooBasketBars";
}

/**
 * MangaVfxLayer: Hệ thống Biểu Tượng Cảm Xúc Manga, Vệt Tốc Độ & Bộ Lọc Điện Ảnh
 * - Pop-up Icons: ?, !!, ❤️, ✨, SFX Text nảy sinh động bằng spring() chống đứng hình
 * - Speed Motion Arcs: Vệt cong trắng mờ khi đập càng, vung tay
 * - Color Filters: 'sepia' (hồi tưởng quá khứ), 'nightSpotlight' (quầng sáng đêm tối)
 * - Foreground POV: 'bambooBasketBars' (nan giỏ tre từ góc nhìn bên trong nhìn ra)
 */
export const MangaVfxLayer: React.FC<MangaVfxLayerProps> = ({
  icons = [],
  speedArcs = [],
  colorFilter = "none",
  spotlightTarget = { x: 1280, y: 720, radius: 450 },
  foregroundOverlay = "none",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <g id="manga-vfx-root-layer">
      {/* ===================================================================== */}
      {/* 1. SPEED MOTION ARCS (Vệt tốc độ khi vung tay/đập càng)              */}
      {/* ===================================================================== */}
      {speedArcs.map((arc) => {
        const localFrame = frame - arc.startFrame;
        const dur = arc.durationFrames || 18;
        if (localFrame < 0 || localFrame > dur) return null;

        const progress = localFrame / dur;
        const arcOpacity = (1 - progress) * 0.75;

        const a1 = (arc.startAngleDeg * Math.PI) / 180;
        const a2 = (arc.endAngleDeg * Math.PI) / 180;
        const x1 = arc.cx + Math.cos(a1) * arc.radius;
        const y1 = arc.cy + Math.sin(a1) * arc.radius;
        const x2 = arc.cx + Math.cos(a2) * arc.radius;
        const y2 = arc.cy + Math.sin(a2) * arc.radius;

        return (
          <g key={arc.id} opacity={arcOpacity}>
            <path
              d={`M ${x1} ${y1} A ${arc.radius} ${arc.radius} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={8}
              strokeLinecap="round"
            />
            <path
              d={`M ${x1 + 8} ${y1 + 8} A ${arc.radius - 16} ${arc.radius - 16} 0 0 1 ${x2 - 8} ${y2 - 8}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.6}
            />
          </g>
        );
      })}

      {/* ===================================================================== */}
      {/* 2. MANGA POP-UP ICONS (Bật nảy bằng spring() cạnh đầu nhân vật)       */}
      {/* ===================================================================== */}
      {icons.map((item) => {
        const localFrame = frame - item.startFrame;
        const dur = item.durationFrames || 36;
        if (localFrame < 0 || localFrame > dur) return null;

        const bounce = spring({
          frame: localFrame,
          fps,
          config: { damping: 10, stiffness: 160, mass: 0.6 },
        });

        const scaleVal = bounce * (item.scale || 1);
        const floatY = -Math.sin((localFrame / dur) * Math.PI) * 14;

        return (
          <g
            key={item.id}
            transform={`translate(${item.x}, ${item.y + floatY}) scale(${scaleVal})`}
          >
            {/* Vòng nền tròn trắng viền đen Manga */}
            <circle cx={0} cy={0} r={38} fill="#FFFFFF" stroke="#141414" strokeWidth={6} />

            {/* A. Dấu chấm hỏi ? (Vàng viền đen) */}
            {item.type === "questionMark" && (
              <text
                x={0}
                y={14}
                textAnchor="middle"
                fontFamily="sans-serif"
                fontSize={44}
                fontWeight="900"
                fill="#EAB308"
                stroke="#141414"
                strokeWidth={2}
              >
                ?
              </text>
            )}

            {/* B. Dấu chấm than !! (Đỏ rực) */}
            {item.type === "exclamation" && (
              <text
                x={0}
                y={14}
                textAnchor="middle"
                fontFamily="sans-serif"
                fontSize={40}
                fontWeight="900"
                fill="#EF4444"
                stroke="#141414"
                strokeWidth={2}
              >
                !!
              </text>
            )}

            {/* C. Trái tim ❤️ (Hồng) */}
            {item.type === "heartLove" && (
              <path
                d="M 0 16 C -20 0, -28 -14, -14 -24 C -4 -28, 0 -18, 0 -18 C 0 -18, 4 -28, 14 -24 C 28 -14, 20 0, 0 16 Z"
                fill="#EC4899"
                stroke="#141414"
                strokeWidth={4}
                transform="scale(0.85) translate(0, -2)"
              />
            )}

            {/* D. Ngôi sao 4 cánh lấp lánh ✨ (Vàng) */}
            {item.type === "sparkleStar" && (
              <path
                d="M 0 -24 Q 0 0 24 0 Q 0 0 0 24 Q 0 0 -24 0 Q 0 0 0 -24 Z"
                fill="#FACC15"
                stroke="#141414"
                strokeWidth={4}
              />
            )}

            {/* E. SFX Text tượng thanh ("PHỰT!", "HEHE") */}
            {item.type === "sfxText" && (
              <text
                x={0}
                y={8}
                textAnchor="middle"
                fontFamily="Impact, sans-serif"
                fontSize={24}
                fontWeight="900"
                fill="#16A34A"
                stroke="#141414"
                strokeWidth={1.5}
                letterSpacing={1}
              >
                {item.text || "PHỰT!"}
              </text>
            )}
          </g>
        );
      })}

      {/* ===================================================================== */}
      {/* 3. BỘ LỌC ĐIỆN ẢNH (COLOR FILTERS: SEPIA / NIGHT SPOTLIGHT)          */}
      {/* ===================================================================== */}
      {colorFilter === "sepia" && (
        <rect
          width={2560}
          height={1440}
          fill="#8B5A2B"
          opacity={0.22}
          style={{ mixBlendMode: "color" }}
        />
      )}

      {colorFilter === "nightSpotlight" && (
        <g id="night-spotlight-layer">
          <defs>
            <radialGradient id="spotlightGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="65%" stopColor="#0B132B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#050814" stopOpacity="0.88" />
            </radialGradient>
          </defs>
          <rect
            width={2560}
            height={1440}
            fill={`url(#spotlightGrad)`}
          />
        </g>
      )}

      {/* ===================================================================== */}
      {/* 4. FOREGROUND POV OVERLAY (TIỀN CẢNH NAN GIỎ TRE)                    */}
      {/* ===================================================================== */}
      {foregroundOverlay === "bambooBasketBars" && (
        <g id="bamboo-basket-bars" opacity={0.92}>
          {/* 7 thanh nan tre dọc tiền cảnh */}
          {[180, 480, 820, 1180, 1540, 1920, 2280].map((barX, idx) => (
            <g key={idx}>
              {/* Bóng đổ nan tre */}
              <rect x={barX - 24} y={0} width={48} height={1440} fill="#000000" opacity={0.25} />
              {/* Thân nan tre viền đen đậm */}
              <rect
                x={barX - 20}
                y={0}
                width={40}
                height={1440}
                fill="#B45309"
                stroke="#141414"
                strokeWidth={8}
                rx={6}
              />
              {/* Vệt sáng trên nan tre */}
              <line
                x1={barX - 10}
                y1={0}
                x2={barX - 10}
                y2={1440}
                stroke="#FDE68A"
                strokeWidth={5}
                opacity={0.4}
              />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};
