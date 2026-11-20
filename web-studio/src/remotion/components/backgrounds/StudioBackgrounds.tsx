import React from "react";
import { useCurrentFrame } from "remotion";

export interface StudioBackgroundsProps {
  preset: "linedPaper" | "dottedCream" | "radialSunburst";
}

/**
 * StudioBackgrounds: 3 Nền Studio Tối Giản (Cua Dừa 2D Explainer Style)
 * - linedPaper: Giấy vở kẻ ngang màu kem (cho giải thích khoa học, hồ sơ, lịch sử)
 * - dottedCream: Nền chấm bi kem tối giản (cho cận cảnh, insert hand)
 * - radialSunburst: Nền tia mặt trời đồng tâm xoay nhẹ (cho thành tích, số liệu ấn tượng, cao trào)
 */
export const StudioBackgrounds: React.FC<StudioBackgroundsProps> = ({ preset }) => {
  const frame = useCurrentFrame();

  if (preset === "linedPaper") {
    const lines = [];
    for (let y = 96; y < 1440; y += 56) {
      lines.push(
        <line key={y} x1={0} y1={y} x2={2560} y2={y} stroke="#E5DEC9" strokeWidth={3} />
      );
    }
    return (
      <svg viewBox="0 0 2560 1440" className="w-full h-full">
        <rect width="2560" height="1440" fill="#F9F4E8" />
        {lines}
        <line x1={220} y1={0} x2={220} y2={1440} stroke="#F2B8B5" strokeWidth={4} />
      </svg>
    );
  }

  if (preset === "radialSunburst") {
    const rays = [];
    const numRays = 18;
    for (let i = 0; i < numRays; i++) {
      const a1 = ((i * 360) / numRays) * (Math.PI / 180);
      const a2 = (((i + 0.5) * 360) / numRays) * (Math.PI / 180);
      const r = 1800;
      const x1 = 1280 + Math.cos(a1) * r;
      const y1 = 720 + Math.sin(a1) * r;
      const x2 = 1280 + Math.cos(a2) * r;
      const y2 = 720 + Math.sin(a2) * r;
      rays.push(
        <polygon
          key={i}
          points={`1280,720 ${x1},${y1} ${x2},${y2}`}
          fill="#FDE68A"
          opacity={0.55}
        />
      );
    }
    return (
      <svg viewBox="0 0 2560 1440" className="w-full h-full">
        <rect width="2560" height="1440" fill="#FEF3C7" />
        <g transform={`rotate(${frame * 0.12}, 1280, 720)`}>{rays}</g>
      </svg>
    );
  }

  // Mặc định: dottedCream
  return (
    <svg viewBox="0 0 2560 1440" className="w-full h-full">
      <defs>
        <pattern id="studioDots" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
          <circle cx="32" cy="32" r="3.5" fill="#E2D9C5" />
        </pattern>
      </defs>
      <rect width="2560" height="1440" fill="#FAF5E8" />
      <rect width="2560" height="1440" fill="url(#studioDots)" />
    </svg>
  );
};
