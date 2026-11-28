import React from "react";
import type { ExplainerPaletteId } from "../lib/v7/episodeJsonSchema";

export interface CleanExplainerStageProps {
  palette?: ExplainerPaletteId;
  frame: number;
  uid?: string;
  /** V24.0: Hide studio floor band & y=790 horizon line on full-bleed FROG_* science visuals */
  hideHorizon?: boolean;
}

interface CleanExplainerPaletteColors {
  bgTop: string;
  bgBottom: string;
  floorFill: string;
  horizonStroke: string;
  dotFill: string;
  dotOpacity: number;
}

export const CLEAN_EXPLAINER_PALETTES: Record<ExplainerPaletteId, CleanExplainerPaletteColors> = {
  SKY_BLUE: {
    bgTop: "#E0F2FE",
    bgBottom: "#BAE6FD",
    floorFill: "#93C5FD",
    horizonStroke: "#1E293B",
    dotFill: "#FFFFFF",
    dotOpacity: 0.22,
  },
  WARM_CREAM: {
    bgTop: "#FFFBEB",
    bgBottom: "#FDE68A",
    floorFill: "#FCD34D",
    horizonStroke: "#1E293B",
    dotFill: "#FFFFFF",
    dotOpacity: 0.22,
  },
  LAVENDER_NIGHT: {
    bgTop: "#1E1B4B",
    bgBottom: "#312E81",
    floorFill: "#4338CA",
    horizonStroke: "#1E293B",
    dotFill: "#FFFFFF",
    dotOpacity: 0.22,
  },
  MINT_FRESH: {
    bgTop: "#ECFDF5",
    bgBottom: "#A7F3D0",
    floorFill: "#6EE7B7",
    horizonStroke: "#1E293B",
    dotFill: "#FFFFFF",
    dotOpacity: 0.22,
  },
  ALERT_CORAL: {
    bgTop: "#FEF2F2",
    bgBottom: "#FECACA",
    floorFill: "#FCA5A5",
    horizonStroke: "#1E293B",
    dotFill: "#FFFFFF",
    dotOpacity: 0.22,
  },
  SOFT_SLATE: {
    bgTop: "#F8FAFC",
    bgBottom: "#E2E8F0",
    floorFill: "#CBD5E1",
    horizonStroke: "#1E293B",
    dotFill: "#FFFFFF",
    dotOpacity: 0.22,
  },
};

const AMBIENT_DOTS: readonly { x: number; y: number; r: number }[] = [
  { x: 165, y: 195, r: 6 },
  { x: 340, y: 410, r: 8 },
  { x: 520, y: 240, r: 5 },
  { x: 690, y: 540, r: 7 },
  { x: 860, y: 290, r: 4.5 },
  { x: 1055, y: 470, r: 9 },
  { x: 1230, y: 215, r: 6 },
  { x: 1410, y: 590, r: 5.5 },
  { x: 1565, y: 310, r: 8.5 },
  { x: 1735, y: 485, r: 5 },
  { x: 255, y: 650, r: 7 },
  { x: 1675, y: 175, r: 4.5 },
];

/** Layer 1 (Static React.memo — zero frame prop for 20-VM 45fps performance) */
const CleanExplainerStaticBackdrop: React.FC<{
  palette: ExplainerPaletteId;
  gradId: string;
  hideHorizon?: boolean;
}> = React.memo(({ palette, gradId, hideHorizon = false }) => {
  const colors = CLEAN_EXPLAINER_PALETTES[palette] ?? CLEAN_EXPLAINER_PALETTES.SKY_BLUE;
  return (
    <g id={`clean-explainer-static-${palette}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.bgTop} />
          <stop offset="100%" stopColor={colors.bgBottom} />
        </linearGradient>
      </defs>
      {hideHorizon ? (
        /* Full-bleed gradient canvas with zero horizon line cutting across science diagrams */
        <rect x={0} y={0} width={1920} height={1080} fill={`url(#${gradId})`} stroke="none" />
      ) : (
        <>
          {/* Clean gradient sky/backdrop */}
          <rect x={0} y={0} width={1920} height={790} fill={`url(#${gradId})`} stroke="none" />
          {/* Flat studio floor band y=790..1080 */}
          <rect x={0} y={790} width={1920} height={290} fill={colors.floorFill} stroke="none" />
          {/* Crisp horizon line */}
          <line
            x1={0}
            y1={790}
            x2={1920}
            y2={790}
            stroke={colors.horizonStroke}
            strokeWidth={3}
          />
        </>
      )}
    </g>
  );
});
CleanExplainerStaticBackdrop.displayName = "CleanExplainerStaticBackdrop";

/**
 * CleanExplainerStage (Engine V24.0 — Non-Freeze Scientific Explanation Stage)
 * - 2-layer flat SVG (1920x1080): React.memo gradient + optional floor (`y=790`) + 12 slow ambient dots.
 * - Zero blur, zero drop-shadow, zero foreignObject; safe to layer with AnimalSpriteKit or customVisuals.
 */
export const CleanExplainerStage: React.FC<CleanExplainerStageProps> = ({
  palette = "SKY_BLUE",
  frame,
  uid = "default",
  hideHorizon = false,
}) => {
  const safePalette: ExplainerPaletteId =
    palette in CLEAN_EXPLAINER_PALETTES ? palette : "SKY_BLUE";
  const colors = CLEAN_EXPLAINER_PALETTES[safePalette];
  const gradId = `clean-explainer-grad-${safePalette}-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <g id="stage-clean-explainer" data-palette={safePalette} data-hide-horizon={hideHorizon ? "true" : "false"}>
      <CleanExplainerStaticBackdrop palette={safePalette} gradId={gradId} hideHorizon={hideHorizon} />
      {/* Layer 2: 12 subtle ambient light dots drifting gently (0 blur, near-0 render cost) */}
      <g id="clean-explainer-ambient-dots" stroke="none">
        {AMBIENT_DOTS.map((dot, i) => {
          const dy = Math.sin(frame * 0.03 + i) * 14;
          return (
            <circle
              key={i}
              cx={dot.x}
              cy={Number((dot.y + dy).toFixed(1))}
              r={dot.r}
              fill={colors.dotFill}
              opacity={colors.dotOpacity}
            />
          );
        })}
      </g>
    </g>
  );
};
