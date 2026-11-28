import React from "react";
import { Easing, interpolate } from "remotion";
import { CuteWoodFrog } from "./AnimalSpriteKit";
import { GroundShadow } from "./SceneBackdropKit";
import type { AutoTimeOfDay, ForestDetailId, ForestSeasonId } from "../lib/v7/episodeJsonSchema";

const INK = "#1E293B";

export interface ForestWinterStageProps {
  season?: ForestSeasonId;
  detail?: ForestDetailId;
  timeOfDay?: AutoTimeOfDay;
  frame: number;
  localFrame: number;
  durationFrames: number;
  uid?: string;
}

interface SeasonPalette {
  skyTop: string;
  skyBottom: string;
  farHill: string;
  midHill: string;
  pineBack: string;
  pineFront: string;
  trunk: string;
  snowCap: string | null;
  mapleCanopy: string | null;
  floorBase: string;
  floorBand: string;
  floorStroke: string;
  showPool: boolean;
  showSunbeams: boolean;
  sunbeamColor: string;
}

const SEASON_PALETTES: Record<ForestSeasonId, SeasonPalette> = {
  DEEP_WINTER: {
    skyTop: "#94A3B8",
    skyBottom: "#E2E8F0",
    farHill: "#CBD5E1",
    midHill: "#E2E8F0",
    pineBack: "#334155",
    pineFront: "#1E3A5F",
    trunk: "#475569",
    snowCap: "#F8FAFC",
    mapleCanopy: null,
    floorBase: "#F1F5F9",
    floorBand: "#E2E8F0",
    floorStroke: "#94A3B8",
    showPool: false,
    showSunbeams: false,
    sunbeamColor: "#FFFFFF",
  },
  AUTUMN: {
    skyTop: "#FDE68A",
    skyBottom: "#FEF3C7",
    farHill: "#FDBA74",
    midHill: "#FB923C",
    pineBack: "#166534",
    pineFront: "#15803D",
    trunk: "#78350F",
    snowCap: null,
    mapleCanopy: "#EA580C",
    floorBase: "#F59E0B",
    floorBand: "#D97706",
    floorStroke: "#92400E",
    showPool: false,
    showSunbeams: true,
    sunbeamColor: "#FEF9C3",
  },
  EARLY_WINTER: {
    skyTop: "#CBD5E1",
    skyBottom: "#E0F2FE",
    farHill: "#94A3B8",
    midHill: "#CBD5E1",
    pineBack: "#334155",
    pineFront: "#1E3A2F",
    trunk: "#57534E",
    snowCap: "#E0F2FE",
    mapleCanopy: "#B45309",
    floorBase: "#CBD5E1",
    floorBand: "#94A3B8",
    floorStroke: "#475569",
    showPool: false,
    showSunbeams: false,
    sunbeamColor: "#BAE6FD",
  },
  SPRING_THAW: {
    skyTop: "#7DD3FC",
    skyBottom: "#E0F2FE",
    farHill: "#93C5FD",
    midHill: "#6EE7B7",
    pineBack: "#15803D",
    pineFront: "#166534",
    trunk: "#78350F",
    snowCap: "#F8FAFC",
    mapleCanopy: null,
    floorBase: "#86EFAC",
    floorBand: "#4ADE80",
    floorStroke: "#15803D",
    showPool: true,
    showSunbeams: true,
    sunbeamColor: "#FEF08A",
  },
  SUMMER: {
    skyTop: "#38BDF8",
    skyBottom: "#BAE6FD",
    farHill: "#6EE7B7",
    midHill: "#34D399",
    pineBack: "#16A34A",
    pineFront: "#15803D",
    trunk: "#78350F",
    snowCap: null,
    mapleCanopy: "#22C55E",
    floorBase: "#4ADE80",
    floorBand: "#22C55E",
    floorStroke: "#15803D",
    showPool: false,
    showSunbeams: true,
    sunbeamColor: "#FEF9C3",
  },
};

const BACK_PINES: readonly { x: number; scale: number }[] = [
  { x: 95, scale: 1.08 },
  { x: 255, scale: 0.92 },
  { x: 430, scale: 1.02 },
  { x: 640, scale: 0.82 },
  { x: 1295, scale: 0.84 },
  { x: 1495, scale: 1.0 },
  { x: 1685, scale: 0.94 },
  { x: 1835, scale: 1.1 },
];

const FALLING_PARTICLES: readonly { x: number; y: number; r: number; speed: number; drift: number }[] = [
  { x: 140, y: 120, r: 5.5, speed: 1.3, drift: 18 },
  { x: 310, y: 260, r: 4.5, speed: 1.05, drift: 14 },
  { x: 495, y: 90, r: 6.0, speed: 1.4, drift: 22 },
  { x: 675, y: 310, r: 4.5, speed: 1.15, drift: 16 },
  { x: 865, y: 180, r: 5.0, speed: 1.25, drift: 18 },
  { x: 1055, y: 250, r: 5.5, speed: 1.35, drift: 20 },
  { x: 1245, y: 130, r: 4.5, speed: 1.1, drift: 15 },
  { x: 1430, y: 295, r: 6.0, speed: 1.45, drift: 22 },
  { x: 1615, y: 165, r: 5.0, speed: 1.2, drift: 18 },
  { x: 1780, y: 240, r: 5.5, speed: 1.3, drift: 16 },
  { x: 220, y: 420, r: 4.5, speed: 1.0, drift: 14 },
  { x: 1510, y: 440, r: 4.5, speed: 1.1, drift: 16 },
];

/* ============================================================================
 * STATIC 3-LAYER BOREAL FOREST BACKDROP (React.memo — ZERO frame prop!)
 * ========================================================================== */

const ForestWinterBackdropStatic: React.FC<{
  season: ForestSeasonId;
  isNight: boolean;
  gradId: string;
}> = React.memo(({ season, isNight, gradId }) => {
  const pal = SEASON_PALETTES[season] ?? SEASON_PALETTES.DEEP_WINTER;
  const skyTop = isNight ? "#0F172A" : pal.skyTop;
  const skyBottom = isNight ? "#1E293B" : pal.skyBottom;

  return (
    <g id={`forest-winter-backdrop-static-${season}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBottom} />
        </linearGradient>
      </defs>

      {/* Layer 1: Sky + Moon/Sun + Distant Boreal Ridge */}
      <rect x={0} y={0} width={1920} height={745} fill={`url(#${gradId})`} stroke="none" />

      {isNight ? (
        <g id="forest-winter-moon" transform="translate(1620, 170)">
          <circle cx={0} cy={0} r={74} fill="#BAE6FD" opacity={0.14} stroke="none" />
          <path
            d="M 14,-38 A 40,40 0 1,0 14,38 A 30,30 0 1,1 14,-38 Z"
            fill="#F8FAFC"
            stroke="#94A3B8"
            strokeWidth={2.5}
          />
          {[
            { x: -1240, y: -60 },
            { x: -920, y: 45 },
            { x: -610, y: -35 },
            { x: -290, y: 20 },
            { x: 160, y: 80 },
          ].map((s, si) => (
            <circle key={si} cx={s.x} cy={s.y} r={3.5} fill="#E0F2FE" opacity={0.72} stroke="none" />
          ))}
        </g>
      ) : (
        <g id="forest-winter-sun" transform="translate(1640, 165)" opacity={season === "DEEP_WINTER" ? 0.52 : 0.85}>
          <circle cx={0} cy={0} r={86} fill="#FEF9C3" opacity={0.28} stroke="none" />
          <circle cx={0} cy={0} r={44} fill="#FEF08A" stroke="none" />
        </g>
      )}

      {/* Distant Mountain & Forest Silhouette Hills */}
      <path
        d="M 0,565 Q 280,405 580,505 T 1180,470 T 1700,490 T 1920,445 L 1920,745 L 0,745 Z"
        fill={isNight ? "#1E293B" : pal.farHill}
        opacity={0.82}
        stroke="none"
      />
      <path
        d="M 0,635 Q 340,520 720,585 T 1420,550 T 1920,595 L 1920,745 L 0,745 Z"
        fill={isNight ? "#0F172A" : pal.midHill}
        opacity={0.88}
        stroke="none"
      />

      {/* Layer 2: Northern Spruce/Pine Trees (2-tier flat vector polygons + optional snow caps / autumn maples) */}
      <g id="forest-winter-trees-layer">
        {BACK_PINES.map((t, ti) => {
          const isMaple = Boolean(pal.mapleCanopy) && ti % 2 === 1;
          const pineFill = isNight ? "#0F172A" : ti % 2 === 0 ? pal.pineFront : pal.pineBack;
          return (
            <g key={ti} transform={`translate(${t.x}, 740) scale(${t.scale})`}>
              <rect x={-14} y={-195} width={28} height={195} rx={7} fill={isNight ? "#1E293B" : pal.trunk} stroke={INK} strokeWidth={3} />
              {isMaple ? (
                <g>
                  <circle cx={-44} cy={-222} r={58} fill={isNight ? "#7C2D12" : pal.mapleCanopy!} stroke={INK} strokeWidth={3} />
                  <circle cx={44} cy={-222} r={58} fill={isNight ? "#9A3412" : pal.mapleCanopy!} stroke={INK} strokeWidth={3} />
                  <circle cx={0} cy={-268} r={68} fill={isNight ? "#7C2D12" : season === "AUTUMN" ? "#DC2626" : "#16A34A"} stroke={INK} strokeWidth={3} />
                  <circle cx={14} cy={-282} r={40} fill={season === "AUTUMN" ? "#F59E0B" : "#4ADE80"} opacity={isNight ? 0.25 : 0.7} stroke="none" />
                </g>
              ) : (
                <g>
                  {/* 3 crisp layered pine tiers */}
                  <polygon points="0,-325 -78,-185 78,-185" fill={pineFill} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                  <polygon points="0,-275 -92,-125 92,-125" fill={pineFill} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                  <polygon points="0,-215 -102,-65 102,-65" fill={pineFill} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                  {pal.snowCap && (
                    <g fill={isNight ? "#CBD5E1" : pal.snowCap} stroke="none" opacity={season === "SPRING_THAW" ? 0.55 : 0.92}>
                      <polygon points="0,-325 -38,-256 -12,-268 0,-252 16,-266 38,-256" />
                      <polygon points="-46,-195 -88,-128 -52,-142 -24,-130 -44,-162" />
                      <polygon points="46,-195 88,-128 52,-142 24,-130 44,-162" />
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* Optional Flat Sunbeams (0 blur!) */}
      {pal.showSunbeams && !isNight && (
        <g id="forest-winter-sunbeams" stroke="none">
          <polygon points="1160,0 1400,0 880,780 600,780" fill={pal.sunbeamColor} opacity={0.18} />
          <polygon points="1480,0 1720,0 1290,780 1030,780" fill={pal.sunbeamColor} opacity={0.18} />
        </g>
      )}

      {/* Layer 3: Forest Floor (y=735..1080) with Seasonal Snow, Leaf Litter, or Vernal Pool */}
      <rect x={0} y={735} width={1920} height={345} fill={isNight ? "#1E293B" : pal.floorBase} stroke="none" />
      <path
        d="M 0,760 Q 480,736 960,756 T 1920,748 L 1920,1080 L 0,1080 Z"
        fill={isNight ? "#0F172A" : pal.floorBand}
        opacity={0.72}
        stroke="none"
      />
      <line x1={0} y1={735} x2={1920} y2={735} stroke={isNight ? "#334155" : pal.floorStroke} strokeWidth={3.2} />

      {/* Cozy Leaf-Litter Hollow Pocket centered around x=820, y=805 for winter/autumn continuity */}
      {(season === "DEEP_WINTER" || season === "EARLY_WINTER" || season === "AUTUMN") && (
        <g id="forest-leaf-litter-pocket" transform="translate(820, 816)">
          <ellipse cx={0} cy={8} rx={175} ry={30} fill={season === "DEEP_WINTER" ? "#92400E" : "#B45309"} opacity={0.72} stroke={INK} strokeWidth={3} />
          <ellipse cx={-68} cy={0} rx={48} ry={16} fill="#C2410C" stroke={INK} strokeWidth={2.5} />
          <ellipse cx={58} cy={2} rx={52} ry={17} fill="#D97706" stroke={INK} strokeWidth={2.5} />
          <ellipse cx={-12} cy={10} rx={58} ry={15} fill="#9A3412" stroke={INK} strokeWidth={2.5} />
          {season !== "AUTUMN" && (
            <path
              d="M -140,-4 Q -80,-18 -20,-6 Q 40,-18 115,-4"
              fill="none"
              stroke="#E0F2FE"
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.85}
            />
          )}
        </g>
      )}

      {/* Clear Snowmelt Vernal Pool in SPRING_THAW */}
      {pal.showPool && (
        <g id="forest-vernal-pool-static" transform="translate(980, 818)">
          <ellipse cx={0} cy={6} rx={485} ry={66} fill={isNight ? "#0C4A6E" : "#38BDF8"} stroke={isNight ? "#38BDF8" : "#0284C7"} strokeWidth={4} />
          <ellipse cx={-20} cy={-4} rx={410} ry={44} fill={isNight ? "#0369A1" : "#BAE6FD"} opacity={0.55} stroke="none" />
          {/* Residual melting snow patches on left bank */}
          <ellipse cx={-480} cy={-38} rx={110} ry={22} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={2.5} opacity={0.82} />
          <ellipse cx={470} cy={-32} rx={95} ry={19} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={2.5} opacity={0.78} />
        </g>
      )}
    </g>
  );
});
ForestWinterBackdropStatic.displayName = "ForestWinterBackdropStatic";

/* ============================================================================
 * MAIN COMPONENT: ForestWinterStage + Continuous Story Choreography (20 Beats)
 * ========================================================================== */

export const ForestWinterStage: React.FC<ForestWinterStageProps> = ({
  season = "DEEP_WINTER",
  detail = "NONE",
  timeOfDay = "DAY",
  frame,
  localFrame,
  durationFrames,
  uid = "forest",
}) => {
  const isNight = timeOfDay === "NIGHT";
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `forest-winter-grad-${season}-${isNight ? "n" : "d"}-${safeUid}`;
  const activeLocal = Math.max(0, localFrame);
  const safeDur = Math.max(1, durationFrames);

  const isBlizzard = detail === "FROG_FOREST_B28_BLIZZARD";
  const isSilentStill = detail === "FROG_FOREST_B31_ABSOLUTE_SILENCE";
  const showSnowflakes = season === "DEEP_WINTER" || season === "EARLY_WINTER";
  const showFallingLeaves = season === "AUTUMN";

  return (
    <g id="stage-forest-winter" data-season={season} data-detail={detail}>
      <ForestWinterBackdropStatic season={season} isNight={isNight} gradId={gradId} />

      {/* Dynamic Ambient Particles: Snowflakes or Autumn Maple Leaves */}
      {showSnowflakes && (
        <g id="forest-snow-particles" stroke="none">
          {FALLING_PARTICLES.map((p, i) => {
            const speedMult = isBlizzard ? 3.2 : isSilentStill ? 0.15 : 1;
            const py = (p.y + frame * p.speed * speedMult) % 760;
            const px = isBlizzard
              ? (p.x - frame * 4.5 * p.speed + 1920 * 10) % 1920
              : p.x + Math.sin(frame * 0.03 + i) * p.drift;
            return (
              <circle
                key={i}
                cx={Number(px.toFixed(1))}
                cy={Number(py.toFixed(1))}
                r={p.r}
                fill="#FFFFFF"
                opacity={isSilentStill ? 0.55 : 0.85}
              />
            );
          })}
        </g>
      )}

      {showFallingLeaves && (
        <g id="forest-autumn-leaves">
          {FALLING_PARTICLES.slice(0, 8).map((p, i) => {
            const py = (p.y + frame * p.speed * 0.9) % 760;
            const px = p.x + Math.sin(frame * 0.04 + i * 1.4) * 34;
            const rot = Math.sin(frame * 0.06 + i) * 32;
            const leafColor = i % 3 === 0 ? "#DC2626" : i % 3 === 1 ? "#EA580C" : "#F59E0B";
            return (
              <path
                key={i}
                d="M -12,0 C -6,-10 6,-10 14,0 C 6,10 -6,10 -12,0 Z"
                transform={`translate(${px.toFixed(1)}, ${py.toFixed(1)}) rotate(${rot.toFixed(1)})`}
                fill={leafColor}
                stroke={INK}
                strokeWidth={2}
              />
            );
          })}
        </g>
      )}

      {/* =====================================================================
          STORY CHOREOGRAPHY LAYER — 20 Continuous Wood Frog Forest Beats
         ===================================================================== */}

      {/* Beat 1 (GIỮA MÙA ĐÔNG): Frozen solid stone-frog under snow-rimmed leaf pocket */}
      {detail === "FROG_FOREST_B01_FROZEN_STONE" && (
        <CuteWoodFrog
          x={820}
          y={805}
          scale={1.2}
          frame={frame}
          pose="frozen_flat"
          freezeState="frozen_solid"
          accessory="scarf_red"
        />
      )}

      {/* Beat 2 (GIỮA MÙA ĐÔNG): Exact continuous frog coords (x=820, y=805) while hiker's boot sweeps past! */}
      {detail === "FROG_FOREST_B02_BOOT_NEAR_MISS" && (() => {
        const bootX = interpolate(activeLocal, [0, safeDur], [1540, 1070], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const chipT = interpolate(activeLocal, [22, 60], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <CuteWoodFrog
              x={820}
              y={805}
              scale={1.2}
              frame={frame}
              pose="frozen_flat"
              freezeState="frozen_solid"
              accessory="scarf_red"
            />
            {/* Winter Hiker Boot passing right beside the frozen frog */}
            <g id="forest-hiker-boot" transform={`translate(${bootX.toFixed(1)}, 788)`} stroke={INK} strokeWidth={4.5} strokeLinejoin="round">
              <GroundShadow cx={20} cy={22} rx={125} ry={16} />
              <path d="M -20,-185 L 78,-185 L 86,-42 L -110,-28 C -126,-26 -132,-4 -116,12 L 96,12 C 110,12 114,-4 108,-26 L 96,-185" fill="#475569" />
              <rect x={-122} y={4} width={228} height={18} rx={7} fill="#1E293B" />
              {/* Boot laces */}
              <path d="M -18,-130 L 18,-126 M -20,-102 L 16,-98 M -24,-74 L 12,-70" stroke="#CBD5E1" strokeWidth={4} />
            </g>
            {/* Tiny flying ice chips */}
            {chipT > 0 && chipT < 1 && (
              <g fill="#E0F2FE" stroke="#0284C7" strokeWidth={2.2} opacity={(1 - chipT).toFixed(2)}>
                <polygon points={`${(955 - chipT * 48).toFixed(1)},${(790 - chipT * 42).toFixed(1)} ${(965 - chipT * 48).toFixed(1)},${(782 - chipT * 42).toFixed(1)} ${(962 - chipT * 48).toFixed(1)},${(796 - chipT * 42).toFixed(1)}`} />
                <polygon points={`${(980 - chipT * 26).toFixed(1)},${(794 - chipT * 58).toFixed(1)} ${(992 - chipT * 26).toFixed(1)},${(786 - chipT * 58).toFixed(1)} ${(988 - chipT * 26).toFixed(1)},${(800 - chipT * 58).toFixed(1)}`} />
              </g>
            )}
          </>
        );
      })()}

      {/* Beat 6 (ĐẦU XUÂN): Thaw & joyful high spring leap out of the leaf bed! */}
      {detail === "FROG_FOREST_B06_SPRING_REVIVE" && (() => {
        const thawDone = activeLocal >= 16;
        const hopX = interpolate(activeLocal, [16, safeDur], [790, 1120], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        });
        return (
          <>
            {[0, 1, 2, 3, 4].map((si) => (
              <path
                key={si}
                d="M 0,-11 L 3,-3 L 11,0 L 3,3 L 0,11 L -3,3 L -11,0 L -3,-3 Z"
                transform={`translate(${760 + si * 95}, ${(560 + Math.sin(frame * 0.1 + si) * 24).toFixed(1)})`}
                fill="#FEF08A"
                stroke="#D97706"
                strokeWidth={1.6}
                opacity={0.85}
              />
            ))}
            <CuteWoodFrog
              x={thawDone ? hopX : 790}
              y={796}
              scale={1.22}
              frame={frame}
              pose={thawDone ? "hop" : "sit"}
              freezeState={thawDone ? "normal" : "frosting"}
              emotion="happy"
              accessory="scarf_red"
            />
          </>
        );
      })()}

      {/* Beat 9 (CUỐI THU): Autumn forest feast & leaf-pile scouting */}
      {detail === "FROG_FOREST_B09_AUTUMN_PREP" && (() => {
        const fx = interpolate(activeLocal, [0, safeDur], [720, 960], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            {/* Cute little forest beetle ahead */}
            <g transform="translate(1150, 804)" stroke={INK} strokeWidth={2.5}>
              <ellipse cx={0} cy={-6} rx={14} ry={9} fill="#1E293B" />
              <circle cx={-12} cy={-6} r={5} fill="#334155" />
            </g>
            <CuteWoodFrog
              x={fx}
              y={802}
              scale={1.22}
              frame={frame}
              pose="hop"
              freezeState="normal"
              emotion="happy"
              accessory="scarf_red"
            />
          </>
        );
      })()}

      {/* Beat 13 (ĐÊM LẠNH ĐẦU TIÊN): Single bright ice crystal lands on frog's back -> instant alarm ripples */}
      {detail === "FROG_FOREST_B13_FIRST_FROST" && (() => {
        const flakeY = interpolate(activeLocal, [0, 34], [320, 720], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.quad),
        });
        const touched = activeLocal >= 32;
        const ringT = interpolate(activeLocal, [32, 72], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <>
            <CuteWoodFrog
              x={880}
              y={802}
              scale={1.24}
              frame={frame}
              pose="sit"
              freezeState={touched ? "frosting" : "normal"}
              emotion={touched ? "surprised" : "curious"}
              accessory="scarf_red"
            />
            {/* Falling crystalline snowflake */}
            <g transform={`translate(880, ${flakeY.toFixed(1)})`} stroke="#E0F2FE" strokeWidth={3.5} strokeLinecap="round">
              <line x1={0} y1={-16} x2={0} y2={16} />
              <line x1={-14} y1={-8} x2={14} y2={8} />
              <line x1={-14} y1={8} x2={14} y2={-8} />
              <circle cx={0} cy={0} r={4} fill="#FFFFFF" stroke="none" />
            </g>
            {touched && (
              <g fill="none" stroke="#38BDF8" strokeWidth={3.5} opacity={(1 - ringT * 0.75).toFixed(2)}>
                <circle cx={880} cy={725} r={Number((24 + ringT * 95).toFixed(1))} />
                <circle cx={880} cy={725} r={Number((12 + ringT * 58).toFixed(1))} stroke="#FACC15" />
              </g>
            )}
          </>
        );
      })()}

      {/* Beat 20 (CUỐI THU): Rapid night-freeze / noon-thaw cycle in forest */}
      {detail === "FROG_FOREST_B20_FREEZE_THAW_CYCLE" && (() => {
        const cyclePhase = Math.sin(activeLocal * 0.085);
        const isColdHalf = cyclePhase < 0;
        return (
          <>
            {/* Cold blue vs warm sun atmosphere tint */}
            <rect
              x={0}
              y={0}
              width={1920}
              height={1080}
              fill={isColdHalf ? "#0F172A" : "#FEF08A"}
              opacity={isColdHalf ? 0.34 : 0.14}
              stroke="none"
            />
            {/* Top-right switching Moon <-> Sun emblem */}
            <g transform="translate(1540, 290)" stroke={INK} strokeWidth={3.5}>
              <circle cx={0} cy={0} r={54} fill={isColdHalf ? "#1E293B" : "#FEF9C3"} />
              {isColdHalf ? (
                <path d="M 8,-22 A 24,24 0 1,0 8,22 A 18,18 0 1,1 8,-22 Z" fill="#BAE6FD" />
              ) : (
                <circle cx={0} cy={0} r={24} fill="#FACC15" />
              )}
            </g>
            <CuteWoodFrog
              x={880}
              y={802}
              scale={1.22}
              frame={frame}
              pose="sit"
              freezeState={isColdHalf ? "frosting" : "normal"}
              emotion="curious"
              hideEmotionBadge={true}
              accessory="scarf_red"
            />
          </>
        );
      })()}

      {/* Beat 28 (GIỮA MÙA ĐÔNG): Northern snowstorm burying the leaf hollow */}
      {detail === "FROG_FOREST_B28_BLIZZARD" && (
        <>
          <CuteWoodFrog
            x={820}
            y={805}
            scale={1.2}
            frame={frame}
            pose="frozen_flat"
            freezeState="frozen_solid"
            accessory="scarf_red"
          />
          {/* Sweeping diagonal wind streaks */}
          <g stroke="#F8FAFC" strokeWidth={4} strokeLinecap="round" opacity={0.55}>
            {[0, 1, 2, 3, 4].map((wi) => {
              const wx = 1920 - ((frame * 18 + wi * 390) % 2100);
              const wy = 280 + wi * 110;
              return <line key={wi} x1={wx} y1={wy} x2={wx - 165} y2={wy + 46} />;
            })}
          </g>
        </>
      )}

      {/* Beat 31 (GIỮA MÙA ĐÔNG — SILENT): Absolute silence beneath snowy leaf dome */}
      {detail === "FROG_FOREST_B31_ABSOLUTE_SILENCE" && (
        <>
          <rect x={0} y={0} width={1920} height={1080} fill="#0F172A" opacity={0.28} stroke="none" />
          <CuteWoodFrog
            x={820}
            y={805}
            scale={1.2}
            frame={frame}
            pose="frozen_flat"
            freezeState="frozen_solid"
            accessory="scarf_red"
          />
        </>
      )}

      {/* Beat 32 (ĐẦU XUÂN): Warm spring sunlight & dripping snowmelt drops onto frog */}
      {detail === "FROG_FOREST_B32_SPRING_SUNLIGHT" && (
        <>
          {[0, 1, 2].map((di) => {
            const dropY = 340 + ((frame * 5.2 + di * 155) % 410);
            const dropX = 760 + di * 65;
            return (
              <path
                key={di}
                d="M 0,-12 C 8,-2 9,8 0,12 C -9,8 -8,-2 0,-12 Z"
                transform={`translate(${dropX}, ${dropY.toFixed(1)})`}
                fill="#7DD3FC"
                stroke="#0284C7"
                strokeWidth={2}
              />
            );
          })}
          <CuteWoodFrog
            x={820}
            y={805}
            scale={1.2}
            frame={frame}
            pose="sit"
            freezeState="frosting"
            emotion="sleepy"
            hideEmotionBadge={true}
            accessory="scarf_red"
          />
        </>
      )}

      {/* Beat 39 (ĐẦU XUÂN): Urgent sprint hopping across melting snow patches */}
      {detail === "FROG_FOREST_B39_RUSH_FORWARD" && (() => {
        const fx = interpolate(activeLocal, [0, safeDur], [580, 1150], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <CuteWoodFrog
            x={fx}
            y={796}
            scale={1.2}
            frame={frame}
            pose="hop"
            freezeState="normal"
            emotion="surprised"
            accessory="scarf_red"
          />
        );
      })()}

      {/* Beat 42 (GIỮA XUÂN): Arriving first at the vernal pool while far lake stays iced */}
      {detail === "FROG_FOREST_B42_FIRST_TO_POOL" && (
        <>
          {/* Distant frozen white lake patch on horizon */}
          <ellipse cx={1460} cy={712} rx={190} ry={16} fill="#E0F2FE" stroke="#94A3B8" strokeWidth={2.5} opacity={0.85} />
          <CuteWoodFrog
            x={760}
            y={796}
            scale={1.22}
            frame={frame}
            pose="sit"
            freezeState="normal"
            emotion="proud"
            hideEmotionBadge={true}
            accessory="scarf_red"
          />
        </>
      )}

      {/* Beat 44 (GIỮA XUÂN): Swimming peacefully in crystal-clear predator-free vernal pool */}
      {detail === "FROG_FOREST_B44_SAFE_NO_FISH" && (() => {
        const swimX = interpolate(activeLocal, [0, safeDur], [770, 980], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rippleR = 54 + (frame % 45) * 2.2;
        return (
          <>
            <ellipse
              cx={swimX}
              cy={814}
              rx={rippleR}
              ry={rippleR * 0.25}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={3}
              opacity={Math.max(0, 1 - (frame % 45) / 45).toFixed(2)}
            />
            <CuteWoodFrog
              x={swimX}
              y={802}
              scale={1.2}
              frame={frame}
              pose="sit"
              freezeState="normal"
              emotion="happy"
              hideEmotionBadge={true}
              accessory="scarf_red"
            />
          </>
        );
      })()}

      {/* Beat 45 (ĐÊM XUÂN): Moonlit vernal pool wood-frog chorus with warm sound waves! */}
      {detail === "FROG_FOREST_B45_SPRING_CHORUS" && (
        <>
          {[
            { x: 520, y: 804, s: 0.96, flip: false, isHero: false },
            { x: 690, y: 816, s: 1.02, flip: false, isHero: false },
            { x: 920, y: 802, s: 1.18, flip: false, isHero: true },
            { x: 1170, y: 812, s: 1.0, flip: true, isHero: false },
            { x: 1350, y: 800, s: 0.94, flip: true, isHero: false },
          ].map((f, idx) => {
            const waveR = 26 + ((frame + idx * 14) % 42) * 2.4;
            const waveOp = Math.max(0, 1 - ((frame + idx * 14) % 42) / 42) * 0.72;
            return (
              <g key={idx}>
                <circle
                  cx={f.x}
                  cy={f.y - 54}
                  r={waveR}
                  fill="none"
                  stroke="#FDE047"
                  strokeWidth={3}
                  opacity={waveOp.toFixed(2)}
                />
                <CuteWoodFrog
                  x={f.x}
                  y={f.y}
                  scale={f.s}
                  flipX={f.flip}
                  frame={frame + idx * 9}
                  pose="sit"
                  freezeState="normal"
                  emotion="happy"
                  throatPuff={true}
                  hideEmotionBadge={true}
                  accessory={f.isHero ? "scarf_red" : "none"}
                />
              </g>
            );
          })}
        </>
      )}

      {/* Beat 49 (MÙA HÈ): Dozens of tiny newborn baby wood frogs hopping onto leafy shore! */}
      {detail === "FROG_FOREST_B49_BABIES_ON_LAND" && (
        <g id="forest-baby-frogs-parade">
          {[0, 1, 2, 3, 4, 5].map((bi) => {
            const bx = interpolate(activeLocal, [0, safeDur], [520 + bi * 145, 680 + bi * 145], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <CuteWoodFrog
                key={bi}
                x={bx}
                y={796 + (bi % 2) * 14}
                scale={0.76}
                frame={frame + bi * 11}
                pose="hop"
                freezeState="normal"
                ageVariant="baby"
                emotion="happy"
                hideEmotionBadge={true}
              />
            );
          })}
        </g>
      )}

      {/* Beat 53 (MÙA HÈ): Proud adult hero watching young froglets hop through sunlit leaves */}
      {detail === "FROG_FOREST_B53_PROUD_WATCH" && (
        <>
          <CuteWoodFrog
            x={680}
            y={802}
            scale={1.22}
            frame={frame}
            pose="sit"
            freezeState="normal"
            emotion="proud"
            hideEmotionBadge={true}
            accessory="scarf_red"
          />
          {[0, 1, 2].map((bi) => {
            const bx = interpolate(activeLocal, [0, safeDur], [1020 + bi * 140, 1140 + bi * 140], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <CuteWoodFrog
                key={bi}
                x={bx}
                y={806 + (bi % 2) * 10}
                scale={0.78}
                frame={frame + bi * 13}
                pose="hop"
                freezeState="normal"
                ageVariant="baby"
                emotion="happy"
                hideEmotionBadge={true}
              />
            );
          })}
        </>
      )}

      {/* Beat 54 (MÙA HÈ): Peaceful hero seated on sunlit emerald mossy forest boulder */}
      {detail === "FROG_FOREST_B54_MOSS_ROCK_REST" && (
        <>
          <g transform="translate(920, 818)" stroke={INK} strokeWidth={3.5}>
            <GroundShadow cx={0} cy={10} rx={145} ry={16} />
            <path d="M -130,8 C -125,-34 -72,-54 0,-54 C 76,-54 126,-32 132,8 Z" fill="#64748B" />
            <path d="M -98,-26 C -54,-52 54,-52 100,-24 C 66,-10 -64,-10 -98,-26 Z" fill="#22C55E" stroke="none" />
          </g>
          <CuteWoodFrog
            x={920}
            y={772}
            scale={1.26}
            frame={frame}
            pose="sit"
            freezeState="normal"
            emotion="happy"
            hideEmotionBadge={true}
            accessory="scarf_red"
          />
        </>
      )}

      {/* Beat 55 (CUỐI THU): Red maple leaves drifting down as cool north wind returns */}
      {detail === "FROG_FOREST_B55_LEAVES_FALL_AGAIN" && (() => {
        const heroLeafY = interpolate(activeLocal, [0, safeDur], [280, 620], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const heroLeafX = 1120 + Math.sin(frame * 0.08) * 38;
        return (
          <>
            <path
              d="M -28,0 C -14,-22 14,-22 32,0 C 14,22 -14,22 -28,0 Z"
              transform={`translate(${heroLeafX.toFixed(1)}, ${heroLeafY.toFixed(1)}) rotate(${(Math.sin(frame * 0.07) * 24).toFixed(1)})`}
              fill="#DC2626"
              stroke={INK}
              strokeWidth={3}
            />
            <CuteWoodFrog
              x={920}
              y={802}
              scale={1.22}
              frame={frame}
              pose="sit"
              freezeState="normal"
              emotion="curious"
              hideEmotionBadge={true}
              accessory="scarf_red"
            />
          </>
        );
      })()}

      {/* Beat 56 (CUỐI THU): Continuous from Beat 55 (x=920 -> 820) tucking into leaf hollow */}
      {detail === "FROG_FOREST_B56_PREPARE_AGAIN" && (() => {
        const fx = interpolate(activeLocal, [0, Math.min(48, safeDur)], [920, 820], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <CuteWoodFrog
            x={fx}
            y={802}
            scale={1.2}
            flipX={true}
            frame={frame}
            pose={activeLocal < 46 ? "hop" : "sit"}
            freezeState="normal"
            emotion="happy"
            accessory="scarf_red"
          />
        );
      })()}

      {/* Beat 57 (ĐẦU ĐÔNG): Continuous at x=820, y=805 — eyes peacefully closed as frost arrives */}
      {detail === "FROG_FOREST_B57_SEE_YOU_SPRING" && (
        <CuteWoodFrog
          x={820}
          y={805}
          scale={1.2}
          frame={frame}
          pose="sit"
          freezeState="frosting"
          emotion="sleepy"
          hideEmotionBadge={true}
          accessory="scarf_red"
        />
      )}

      {/* Beat 58 (GIỮA MÙA ĐÔNG): Full circle back to Beat 1 (x=820, y=805) with warm glowing heart spark! */}
      {detail === "FROG_FOREST_B58_STILL_ALIVE" && (
        <CuteWoodFrog
          x={820}
          y={805}
          scale={1.2}
          frame={frame}
          pose="frozen_flat"
          freezeState="frozen_solid"
          heartGlowT={0.65 + 0.35 * Math.sin(frame * 0.16)}
          accessory="scarf_red"
        />
      )}
    </g>
  );
};
