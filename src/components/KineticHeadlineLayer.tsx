import React from "react";
import { interpolate, spring } from "remotion";
import type {
  KineticHeadlinePosition,
  KineticHeadlineSpec,
  KineticHeadlineTone,
} from "../lib/v7/episodeJsonSchema";

const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";
const STROKE_INK = "#0F172A";

const TONE_COLOR_MAP: Record<KineticHeadlineTone, string> = {
  GOLD: "#FACC15",
  ALERT: "#F87171",
  SUCCESS: "#4ADE80",
  INFO: "#38BDF8",
  EMOTION: "#FDA4AF",
};

const POSITION_COORDS: Record<KineticHeadlinePosition, { x: number; y: number }> = {
  TOP_CENTER: { x: 960, y: 138 },
  TOP_LEFT: { x: 360, y: 138 },
  TOP_RIGHT: { x: 1560, y: 138 },
};

export interface KineticHeadlineLayerProps {
  headline?: KineticHeadlineSpec;
  timeBadge?: string;
  localFrame: number;
  fps?: number;
}

/**
 * KineticHeadlineLayer (Engine V24.0 — Story-First Animal & Kinetic Engine)
 * - Replaces heavy static boards with crisp 0-blur broadcast kinetic headlines (2–4 punchy words)
 *   and an optional top-left timeBadge pill (e.g. "22:00", "03:00", "-3 GIỜ", "#1").
 * - Pure flat SVG (<text paintOrder="stroke">), clamped spring pop-in (zero unbounded loops),
 *   zero SVG blur/drop-shadow/foreign-object filters.
 */
export const KineticHeadlineLayer: React.FC<KineticHeadlineLayerProps> = ({
  headline,
  timeBadge,
  localFrame,
  fps = 45,
}) => {
  const hasHeadline = Boolean(headline && typeof headline.text === "string" && headline.text.trim().length > 0);
  const cleanBadge = typeof timeBadge === "string" ? timeBadge.trim() : "";
  const hasBadge = cleanBadge.length > 0;

  if (!hasHeadline && !hasBadge) return null;

  const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 45;

  // Clamped 8-frame pop-in for timeBadge
  const badgeScale = interpolate(localFrame, [0, 8], [0.84, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeOpacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeWidth = Math.min(420, Math.max(132, cleanBadge.length * 22 + 52));

  // Clamped spring pop-in for KineticHeadline
  let headlineNode: React.ReactNode = null;
  if (hasHeadline && headline) {
    const cleanText = headline.text.trim();
    const cleanSub = typeof headline.subText === "string" ? headline.subText.trim() : "";
    const tone: KineticHeadlineTone = headline.tone ?? "GOLD";
    const fillColor = TONE_COLOR_MAP[tone] ?? TONE_COLOR_MAP.GOLD;
    const position: KineticHeadlinePosition = headline.position ?? "TOP_CENTER";
    const coords = POSITION_COORDS[position] ?? POSITION_COORDS.TOP_CENTER;
    const delay = Math.max(0, Math.round(headline.delayFrames ?? 0));
    const tiltDeg = typeof headline.tiltDeg === "number" && Number.isFinite(headline.tiltDeg) ? headline.tiltDeg : -2;
    const fontSize = cleanText.length > 18 ? 52 : 64;

    const animFrame = Math.max(0, localFrame - delay);
    const springVal = spring({
      frame: animFrame,
      fps: safeFps,
      config: { damping: 14, stiffness: 220, mass: 0.7 },
    });
    const clampedSpring = Math.max(0, Math.min(1.06, springVal));
    const scale = interpolate(clampedSpring, [0, 1], [0.65, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const opacity =
      localFrame < delay
        ? 0
        : interpolate(clampedSpring, [0, 0.35, 1], [0, 0.88, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

    headlineNode = (
      <g
        id="layer-kinetic-headline"
        data-tone={tone}
        data-position={position}
        opacity={opacity.toFixed(3)}
        transform={`translate(${coords.x}, ${coords.y}) rotate(${tiltDeg.toFixed(2)}) scale(${scale.toFixed(4)})`}
      >
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fill={fillColor}
          stroke={STROKE_INK}
          strokeWidth={14}
          strokeLinejoin="round"
          strokeLinecap="round"
          paintOrder="stroke"
          fontFamily={FONT}
          fontSize={fontSize}
          fontWeight={900}
        >
          {cleanText}
        </text>
        {cleanSub && (
          <text
            x={0}
            y={52}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            stroke={STROKE_INK}
            strokeWidth={8}
            strokeLinejoin="round"
            strokeLinecap="round"
            paintOrder="stroke"
            fontFamily={FONT}
            fontSize={34}
            fontWeight={800}
          >
            {cleanSub}
          </text>
        )}
      </g>
    );
  }

  return (
    <g id="v24-kinetic-headline-and-badge-layer" pointerEvents="none">
      {hasBadge && (
        <g
          id="layer-v24-time-badge"
          opacity={badgeOpacity.toFixed(3)}
          transform={`translate(86, 72) scale(${badgeScale.toFixed(4)})`}
        >
          <rect
            x={0}
            y={0}
            width={badgeWidth}
            height={58}
            rx={16}
            fill={STROKE_INK}
            fillOpacity={0.88}
            stroke="#FACC15"
            strokeWidth={3}
          />
          <text
            x={badgeWidth / 2}
            y={30}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            stroke="none"
            fontFamily={FONT}
            fontSize={34}
            fontWeight={900}
          >
            {cleanBadge}
          </text>
        </g>
      )}
      {headlineNode}
    </g>
  );
};
