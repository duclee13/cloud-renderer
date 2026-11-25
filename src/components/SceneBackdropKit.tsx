import React from 'react';

const INK = '#0F172A';

/* ============================================================================
 * 1. GroundShadow — Flat grounding oval (zero blur/filter overhead at 45fps)
 * ========================================================================== */
export interface GroundShadowProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export const GroundShadow: React.FC<GroundShadowProps> = React.memo(({ cx, cy, rx, ry }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#0F172A" opacity="0.12" />
));
GroundShadow.displayName = 'GroundShadow';

/* ============================================================================
 * 2. OutdoorCityRoadBackdrop — 3-Layer Depth Outdoor Scene (viewBox 1920x1080)
 *    - Layer 1 (Background): Time-of-day sky gradient, subtle top-right sun,
 *      distant city skyline silhouette (y=420..565), slow-drifting 2-tier clouds.
 *    - Layer 2 (Midground): Seamless modulo parallax 2-tone park hills, tiled
 *      sidewalk + curb (y=615..685), repeating 2-tone trees, slim street lamps,
 *      park benches, low fence, and asphalt road (y=685..880 + subtitle base)
 *      with smoothly scrolling dashed lane markings (all key marks y <= 830).
 *    - Layer 3 (Grounding): Pair with <GroundShadow /> on foreground actors/cars.
 * ========================================================================== */
export type OutdoorTimeOfDay = 'morning' | 'afternoon' | 'sunset';

export interface OutdoorCityRoadBackdropProps {
  frame: number;
  scrollSpeed?: number;
  timeOfDay?: OutdoorTimeOfDay;
  uid?: string;
}

const SKY_PALETTE: Record<
  OutdoorTimeOfDay,
  {
    top: string;
    mid: string;
    horizon: string;
    sunCore: string;
    sunHalo: string;
    sunY: number;
    sunX: number;
    cloudBottom: string;
    skylineBack: string;
    skylineFront: string;
    windowFill: string;
  }
> = {
  morning: {
    top: '#BAE6FD',
    mid: '#E0F2FE',
    horizon: '#F0F9FF',
    sunCore: '#FEF08A',
    sunHalo: '#FEF9C3',
    sunX: 1685,
    sunY: 174,
    cloudBottom: '#DBEAFE',
    skylineBack: '#E2E8F0',
    skylineFront: '#CBD5E1',
    windowFill: '#F8FAFC',
  },
  afternoon: {
    top: '#93C5FD',
    mid: '#DBEAFE',
    horizon: '#EFF6FF',
    sunCore: '#FDE68A',
    sunHalo: '#FEF3C7',
    sunX: 1580,
    sunY: 166,
    cloudBottom: '#E0F2FE',
    skylineBack: '#E2E8F0',
    skylineFront: '#CBD5E1',
    windowFill: '#F8FAFC',
  },
  sunset: {
    top: '#FDBA74',
    mid: '#FED7AA',
    horizon: '#FEF3C7',
    sunCore: '#FDE047',
    sunHalo: '#FEF08A',
    sunX: 1635,
    sunY: 245,
    cloudBottom: '#FED7AA',
    skylineBack: '#CBD5E1',
    skylineFront: '#94A3B8',
    windowFill: '#FEF9C3',
  },
};

const StaticSkyAndSkylineLayer: React.FC<{
  timeOfDay: OutdoorTimeOfDay;
  skyGradId: string;
}> = React.memo(({ timeOfDay, skyGradId }) => {
  const pal = SKY_PALETTE[timeOfDay];

  const backBuildings: Array<{ x: number; y: number; w: number; h: number }> = [
    { x: 20, y: 458, w: 92, h: 120 },
    { x: 132, y: 432, w: 78, h: 146 },
    { x: 256, y: 468, w: 110, h: 110 },
    { x: 404, y: 422, w: 86, h: 156 },
    { x: 540, y: 452, w: 102, h: 126 },
    { x: 705, y: 438, w: 84, h: 140 },
    { x: 856, y: 464, w: 118, h: 114 },
    { x: 1026, y: 426, w: 90, h: 152 },
    { x: 1180, y: 454, w: 104, h: 124 },
    { x: 1350, y: 430, w: 88, h: 148 },
    { x: 1510, y: 456, w: 112, h: 122 },
    { x: 1682, y: 428, w: 94, h: 150 },
    { x: 1810, y: 462, w: 98, h: 116 },
  ];

  const frontBuildings: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    windows?: Array<{ dx: number; dy: number }>;
  }> = [
    { x: 74, y: 486, w: 82, h: 98, windows: [{ dx: 16, dy: 18 }, { dx: 46, dy: 18 }, { dx: 16, dy: 42 }] },
    { x: 210, y: 468, w: 74, h: 116, windows: [{ dx: 14, dy: 20 }, { dx: 42, dy: 38 }] },
    { x: 342, y: 492, w: 96, h: 92 },
    { x: 486, y: 462, w: 76, h: 122, windows: [{ dx: 16, dy: 18 }, { dx: 44, dy: 18 }, { dx: 44, dy: 44 }] },
    { x: 642, y: 488, w: 94, h: 96 },
    { x: 786, y: 470, w: 80, h: 114, windows: [{ dx: 18, dy: 22 }, { dx: 46, dy: 22 }] },
    { x: 960, y: 486, w: 92, h: 98 },
    { x: 1112, y: 464, w: 78, h: 120, windows: [{ dx: 16, dy: 18 }, { dx: 44, dy: 38 }] },
    { x: 1278, y: 488, w: 96, h: 96 },
    { x: 1432, y: 466, w: 84, h: 118, windows: [{ dx: 18, dy: 20 }, { dx: 48, dy: 20 }, { dx: 18, dy: 46 }] },
    { x: 1612, y: 484, w: 94, h: 100 },
    { x: 1756, y: 472, w: 86, h: 112, windows: [{ dx: 18, dy: 22 }, { dx: 48, dy: 42 }] },
  ];

  return (
    <g>
      <defs>
        <linearGradient id={skyGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.top} />
          <stop offset="58%" stopColor={pal.mid} />
          <stop offset="100%" stopColor={pal.horizon} />
        </linearGradient>
      </defs>

      {/* Sky Canvas */}
      <rect x="0" y="0" width="1920" height="630" fill={`url(#${skyGradId})`} />

      {/* Subtle Top-Right Sun (flat layered circles, zero blur, core opacity 0.35) */}
      <g>
        <circle cx={pal.sunX} cy={pal.sunY} r="118" fill={pal.sunHalo} opacity="0.14" />
        <circle cx={pal.sunX} cy={pal.sunY} r="80" fill={pal.sunHalo} opacity="0.22" />
        <circle cx={pal.sunX} cy={pal.sunY} r="50" fill={pal.sunCore} opacity="0.35" />
      </g>

      {/* Distant City Skyline — Back Tier (y=420..565, low-contrast atmospheric silhouette) */}
      <g fill={pal.skylineBack}>
        {backBuildings.map((b, idx) => (
          <rect key={`bk_${idx}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="4" />
        ))}
        {/* Subtle rooftop spires for authentic skyline variety */}
        <rect x="442" y="406" width="10" height="20" rx="2" />
        <rect x="1066" y="410" width="10" height="20" rx="2" />
        <rect x="1724" y="412" width="10" height="20" rx="2" />
      </g>

      {/* Distant City Skyline — Front Tier with restrained glowing window panes */}
      <g>
        {frontBuildings.map((b, idx) => (
          <g key={`fr_${idx}`}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="4" fill={pal.skylineFront} />
            {b.windows?.map((w, wi) => (
              <rect
                key={wi}
                x={b.x + w.dx}
                y={b.y + w.dy}
                width="16"
                height="12"
                rx="2"
                fill={pal.windowFill}
                opacity="0.62"
              />
            ))}
          </g>
        ))}
      </g>
    </g>
  );
});
StaticSkyAndSkylineLayer.displayName = 'StaticSkyAndSkylineLayer';

const ParkHillTile: React.FC = React.memo(() => (
  <g>
    {/* C1-periodic smooth 2-tone park hills (horizontal tangents at x=0 and x=960 -> zero seam) */}
    <path
      d="M 0 572 C 130 572 210 534 360 534 C 510 534 590 584 720 584 C 830 584 870 572 960 572 L 960 622 L 0 622 Z"
      fill="#86EFAC"
    />
    <path
      d="M 0 594 C 145 594 245 566 420 566 C 595 566 680 604 815 604 C 895 604 915 594 960 594 L 960 622 L 0 622 Z"
      fill="#4ADE80"
    />
  </g>
));
ParkHillTile.displayName = 'ParkHillTile';

const StaticSidewalkAndRoadBase: React.FC = React.memo(() => (
  <g>
    {/* Tiled Park Sidewalk + Curb (y=615..685) */}
    <rect x="0" y="615" width="1920" height="58" fill="#E2E8F0" />
    <line x1="0" y1="615" x2="1920" y2="615" stroke="#94A3B8" strokeWidth="3" />
    {/* Raised Curb Face */}
    <rect x="0" y="673" width="1920" height="12" fill="#CBD5E1" />
    <line x1="0" y1="673" x2="1920" y2="673" stroke="#F8FAFC" strokeWidth="2.5" />
    <line x1="0" y1="685" x2="1920" y2="685" stroke="#334155" strokeWidth="4" />

    {/* Asphalt Road (y=685..880 main road surface + y=880..1080 calm dark subtitle backdrop) */}
    <rect x="0" y="685" width="1920" height="195" fill="#475569" />
    <rect x="0" y="880" width="1920" height="200" fill="#334155" />
    {/* Gutter Shadow Band & Upper Road Shoulder Edge Stripe (y <= 830) */}
    <rect x="0" y="687" width="1920" height="9" fill="#334155" opacity="0.6" />
    <line x1="0" y1="704" x2="1920" y2="704" stroke="#E2E8F0" strokeWidth="3.5" opacity="0.55" />
    <line x1="0" y1="864" x2="1920" y2="864" stroke="#64748B" strokeWidth="3" opacity="0.5" />
  </g>
));
StaticSidewalkAndRoadBase.displayName = 'StaticSidewalkAndRoadBase';

const SidewalkSeamTile: React.FC = React.memo(() => (
  <g>
    {/* 8 evenly spaced sidewalk slab seams per 960px tile (120px pitch -> seamless loop) */}
    {[0, 120, 240, 360, 480, 600, 720, 840].map((sx) => (
      <g key={sx}>
        <line x1={sx} y1="615" x2={sx - 22} y2="673" stroke="#CBD5E1" strokeWidth="2.5" />
        <line x1={sx - 22} y1="673" x2={sx - 22} y2="685" stroke="#94A3B8" strokeWidth="2" />
      </g>
    ))}
    <line x1="0" y1="644" x2="960" y2="644" stroke="#CBD5E1" strokeWidth="2" opacity="0.7" />
  </g>
));
SidewalkSeamTile.displayName = 'SidewalkSeamTile';

const MidgroundParkPropsTile: React.FC = React.memo(() => {
  const fencePosts = Array.from({ length: 15 }, (_, idx) => idx * 64 + 32);
  const trees = [
    { x: 138, scale: 1.0, trunkH: 72 },
    { x: 486, scale: 0.92, trunkH: 66 },
    { x: 816, scale: 1.04, trunkH: 76 },
  ];
  const lamps = [308, 692];
  const benches = [232, 604];

  return (
    <g>
      {/* Low Park Fence running continuously edge-to-edge (0..960) */}
      <g>
        <rect x="0" y="593" width="960" height="5" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
        <rect x="0" y="606" width="960" height="5" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
        {fencePosts.map((px) => (
          <rect
            key={px}
            x={px - 4}
            y="586"
            width="8"
            height="32"
            rx="2"
            fill="#E2E8F0"
            stroke="#64748B"
            strokeWidth="1.6"
          />
        ))}
      </g>

      {/* Slim Street Lamps (2 per 960px tile) */}
      {lamps.map((lx) => (
        <g key={`lamp_${lx}`} transform={`translate(${lx}, 626)`}>
          <GroundShadow cx={0} cy={2} rx={16} ry={4} />
          <rect x="-8" y="-12" width="16" height="12" rx="3" fill="#334155" />
          <rect x="-3.5" y="-196" width="7" height="186" fill="#475569" />
          <path d="M 0 -194 Q 4 -210 28 -206" fill="none" stroke="#475569" strokeWidth="5.5" strokeLinecap="round" />
          <ellipse cx="32" cy="-201" rx="14" ry="5" fill="#FEF08A" opacity="0.9" />
          <path d="M 16 -204 Q 32 -214 48 -204 Z" fill="#334155" />
        </g>
      ))}

      {/* 2-Tone Round-Canopy Park Trees (3 per 960px tile) */}
      {trees.map((t, idx) => (
        <g key={`tree_${idx}`} transform={`translate(${t.x}, 618) scale(${t.scale})`}>
          <GroundShadow cx={0} cy={3} rx={48} ry={8} />
          {/* Trunk + subtle bark highlight */}
          <rect x="-11" y={-t.trunkH} width="22" height={t.trunkH} rx="5" fill="#92400E" stroke={INK} strokeWidth="2.6" />
          <rect x="-5" y={-t.trunkH + 6} width="5" height={t.trunkH - 12} rx="2" fill="#B45309" opacity="0.65" />
          {/* Rear / lower shaded canopy tone */}
          <circle cx="-28" cy={-t.trunkH - 16} r="36" fill="#16A34A" />
          <circle cx="28" cy={-t.trunkH - 14} r="34" fill="#16A34A" />
          <circle cx="0" cy={-t.trunkH - 42} r="44" fill="#16A34A" />
          {/* Front / upper sunlit canopy tone */}
          <circle cx="-18" cy={-t.trunkH - 28} r="30" fill="#22C55E" />
          <circle cx="18" cy={-t.trunkH - 26} r="28" fill="#22C55E" />
          <circle cx="0" cy={-t.trunkH - 52} r="34" fill="#22C55E" />
          {/* Crisp top-right highlight puff */}
          <circle cx="12" cy={-t.trunkH - 60} r="16" fill="#4ADE80" opacity="0.85" />
        </g>
      ))}

      {/* Low Manicured Park Shrubs */}
      {[70, 412, 748, 895].map((bx, idx) => (
        <g key={`bush_${idx}`} transform={`translate(${bx}, 618)`}>
          <circle cx="-14" cy="-8" r="14" fill="#15803D" />
          <circle cx="14" cy="-7" r="13" fill="#15803D" />
          <circle cx="0" cy="-14" r="16" fill="#22C55E" />
        </g>
      ))}

      {/* Park Benches grounded cleanly on sidewalk (y = 638) */}
      {benches.map((bx) => (
        <g key={`bench_${bx}`} transform={`translate(${bx}, 638)`}>
          <GroundShadow cx={0} cy={3} rx={44} ry={6} />
          {/* Stone / Cast-Iron Legs */}
          <rect x="-32" y="-14" width="8" height="16" rx="2" fill="#475569" />
          <rect x="24" y="-14" width="8" height="16" rx="2" fill="#475569" />
          {/* Wooden Slats (Backrest + Seat) */}
          <rect x="-38" y="-34" width="76" height="8" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="1.8" />
          <rect x="-38" y="-23" width="76" height="7" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1.8" />
          <rect x="-42" y="-14" width="84" height="8" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="1.8" />
        </g>
      ))}
    </g>
  );
});
MidgroundParkPropsTile.displayName = 'MidgroundParkPropsTile';

const CLOUD_SPECS: Array<{ baseX: number; y: number; scale: number }> = [
  { baseX: 210, y: 174, scale: 1.02 },
  { baseX: 660, y: 228, scale: 0.86 },
  { baseX: 1180, y: 186, scale: 0.94 },
  { baseX: 1620, y: 248, scale: 0.82 },
  { baseX: 2010, y: 196, scale: 0.96 },
];

export const OutdoorCityRoadBackdrop: React.FC<OutdoorCityRoadBackdropProps> = ({
  frame,
  scrollSpeed = 3,
  timeOfDay = 'morning',
  uid = 'default',
}) => {
  const pal = SKY_PALETTE[timeOfDay];
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '');
  const skyGradId = `sbk_sky_${timeOfDay}_${safeUid}`;

  const TILE_W = 960;
  const hillOffset = (((frame * scrollSpeed * 0.45) % TILE_W) + TILE_W) % TILE_W;
  const midOffset = (((frame * scrollSpeed) % TILE_W) + TILE_W) % TILE_W;
  const sidewalkOffset = (((frame * scrollSpeed * 1.15) % TILE_W) + TILE_W) % TILE_W;
  const laneDashOffset = (((frame * scrollSpeed * 1.6) % 140) + 140) % 140;

  return (
    <g>
      {/* Layer 1: Static Sky, Soft Sun, Distant City Skyline */}
      <StaticSkyAndSkylineLayer timeOfDay={timeOfDay} skyGradId={skyGradId} />

      {/* Layer 1 Dynamic: 5 Two-Tier Clouds drifting gently via (frame * 0.4) % 2200 */}
      <g opacity="0.82">
        {CLOUD_SPECS.map((c, idx) => {
          const cx = ((((c.baseX - frame * 0.4) % 2200) + 2200) % 2200) - 160;
          return (
            <g key={idx} transform={`translate(${cx.toFixed(1)}, ${c.y}) scale(${c.scale})`}>
              {/* Soft lower cloud tier */}
              <rect x="-76" y="4" width="152" height="24" rx="12" fill={pal.cloudBottom} />
              <circle cx="-42" cy="4" r="24" fill={pal.cloudBottom} />
              <circle cx="38" cy="6" r="22" fill={pal.cloudBottom} />
              {/* Bright upper cloud tier */}
              <rect x="-66" y="-2" width="132" height="22" rx="11" fill="#FFFFFF" />
              <circle cx="-32" cy="-8" r="24" fill="#FFFFFF" />
              <circle cx="6" cy="-18" r="30" fill="#FFFFFF" />
              <circle cx="42" cy="-6" r="21" fill="#FFFFFF" />
            </g>
          );
        })}
      </g>

      {/* Layer 2A: Parallax Rolling 2-Tone Park Hills (3 tiles guarantee 100% coverage over [0, 1920]) */}
      <g>
        {[0, 1, 2].map((k) => (
          <g key={`hill_${k}`} transform={`translate(${(-hillOffset + k * TILE_W).toFixed(1)}, 0)`}>
            <ParkHillTile />
          </g>
        ))}
      </g>

      {/* Layer 2B: Static Sidewalk Curb & Asphalt Road Surface */}
      <StaticSidewalkAndRoadBase />

      {/* Layer 2C: Scrolling Sidewalk Slab Joints */}
      <g>
        {[0, 1, 2].map((k) => (
          <g key={`sw_${k}`} transform={`translate(${(-sidewalkOffset + k * TILE_W).toFixed(1)}, 0)`}>
            <SidewalkSeamTile />
          </g>
        ))}
      </g>

      {/* Layer 2D: Parallax Midground Fence, Trees, Street Lamps & Park Benches */}
      <g>
        {[0, 1, 2].map((k) => (
          <g key={`mid_${k}`} transform={`translate(${(-midOffset + k * TILE_W).toFixed(1)}, 0)`}>
            <MidgroundParkPropsTile />
          </g>
        ))}
      </g>

      {/* Layer 2E: Smoothly Scrolling Asphalt Dashed Center Line (y = 782 <= 830) */}
      <line
        x1="-140"
        y1="782"
        x2="2060"
        y2="782"
        stroke="#F8FAFC"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="76 64"
        strokeDashoffset={laneDashOffset.toFixed(1)}
        opacity="0.82"
      />
    </g>
  );
};

/* ============================================================================
 * 3. DetailedSedanCar — Crisp 2D Cartoon Sedan (facing RIGHT, ground contact y=0)
 *    - Ground contact sits cleanly at local y = 0 so scaling never floats tires.
 *    - Features 2-tone rounded body, front/rear windows with diagonal sheen,
 *      B-pillar, door seams + handles, side mirror, glowing headlight + red
 *      taillight, dark bumpers, 2 rotating 4-spoke alloy wheels, and GroundShadow.
 * ========================================================================== */
export interface DetailedSedanCarProps {
  x: number;
  y: number;
  color?: string;
  scale?: number;
  wheelRotation?: number;
}

const StaticCarBody: React.FC<{ color: string }> = React.memo(({ color }) => (
  <g>
    {/* Flat Ground Contact Shadow under Chassis */}
    <GroundShadow cx={0} cy={4} rx={182} ry={13} />

    {/* Main 2-Tone Rounded Sedan Body */}
    <path
      d="M -176 -34 L -178 -72 C -178 -86 -166 -94 -144 -96 L -108 -102 L -66 -138 C -52 -148 -36 -152 -12 -152 L 50 -152 C 74 -152 92 -144 108 -126 L 136 -96 L 166 -88 C 178 -84 184 -74 184 -60 L 184 -34 Z"
      fill={color}
      stroke={INK}
      strokeWidth="4.5"
      strokeLinejoin="round"
    />

    {/* Darker Lower Rocker Band (universal shade overlay for any hex body color) */}
    <path
      d="M -176 -56 L 184 -56 L 184 -34 L -176 -34 Z"
      fill="#0F172A"
      opacity="0.18"
    />

    {/* Subtle Upper Roof & Hood Highlight */}
    <path
      d="M -56 -144 L 46 -144 C 66 -144 82 -137 96 -123"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="4.5"
      strokeLinecap="round"
      opacity="0.32"
    />
    <path
      d="M 132 -90 L 164 -82"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="3.5"
      strokeLinecap="round"
      opacity="0.3"
    />

    {/* Rear & Front Side Windows with Crisp Diagonal White Reflection Sheen */}
    {/* Rear Window */}
    <path
      d="M -92 -96 L -58 -134 C -48 -141 -36 -143 -18 -143 L -8 -143 L -8 -96 Z"
      fill="#BAE6FD"
      stroke={INK}
      strokeWidth="3.4"
      strokeLinejoin="round"
    />
    <polygon points="-76,-98 -44,-141 -26,-141 -58,-98" fill="#FFFFFF" opacity="0.46" />

    {/* Front Window */}
    <path
      d="M 8 -143 L 48 -143 C 66 -143 80 -136 94 -120 L 116 -96 L 8 -96 Z"
      fill="#BAE6FD"
      stroke={INK}
      strokeWidth="3.4"
      strokeLinejoin="round"
    />
    <polygon points="24,-98 56,-141 74,-141 42,-98" fill="#FFFFFF" opacity="0.52" />

    {/* B-Pillar Divider between Rear & Front Windows */}
    <rect x="-8" y="-145" width="16" height="51" fill="#1E293B" stroke={INK} strokeWidth="2.6" />

    {/* Door Seams & Door Handles */}
    <path d="M -2 -94 L -2 -40" fill="none" stroke={INK} strokeWidth="2.4" opacity="0.42" />
    <path d="M 96 -94 L 100 -54 L 84 -40" fill="none" stroke={INK} strokeWidth="2.4" opacity="0.4" />
    <path d="M -86 -94 L -94 -58 L -78 -40" fill="none" stroke={INK} strokeWidth="2.4" opacity="0.4" />
    {/* Rear & Front Door Handles */}
    <rect x="-46" y="-82" width="22" height="7" rx="3.5" fill="#E2E8F0" stroke={INK} strokeWidth="2.2" />
    <rect x="28" y="-82" width="22" height="7" rx="3.5" fill="#E2E8F0" stroke={INK} strokeWidth="2.2" />

    {/* Side Wing Mirror */}
    <path d="M 88 -94 L 94 -102 L 112 -102 C 117 -102 119 -96 116 -91 L 96 -90 Z" fill={color} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />

    {/* Red Taillight (Rear) */}
    <rect x="-180" y="-86" width="16" height="22" rx="5" fill="#DC2626" stroke={INK} strokeWidth="2.8" />
    <rect x="-176" y="-81" width="7" height="12" rx="2.5" fill="#FCA5A5" />

    {/* Bright Glowing Headlight (Front) + Front Grille */}
    <path
      d="M 164 -84 L 182 -78 C 185 -74 185 -64 182 -60 L 164 -60 Z"
      fill="#FEF08A"
      stroke={INK}
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <rect x="169" y="-76" width="9" height="11" rx="3" fill="#FFFFFF" opacity="0.9" />
    <rect x="172" y="-54" width="12" height="12" rx="3" fill="#334155" stroke={INK} strokeWidth="2" />

    {/* Dark Gray Rear & Front Bumpers */}
    <rect x="-188" y="-52" width="28" height="20" rx="7" fill="#334155" stroke={INK} strokeWidth="3.2" />
    <rect x="160" y="-52" width="28" height="20" rx="7" fill="#334155" stroke={INK} strokeWidth="3.2" />

    {/* Wheel Wells (Cutout Arches) */}
    <path d="M -148 -34 A 42 42 0 0 1 -64 -34 Z" fill="#0F172A" />
    <path d="M 70 -34 A 42 42 0 0 1 154 -34 Z" fill="#0F172A" />
  </g>
));
StaticCarBody.displayName = 'StaticCarBody';

const CarWheel: React.FC<{ cx: number; cy: number; rotation: number }> = ({ cx, cy, rotation }) => (
  <g transform={`translate(${cx}, ${cy})`}>
    {/* Rubber Tire (radius 36 -> bottom touches y = 0) */}
    <circle cx="0" cy="0" r="36" fill="#1E293B" stroke={INK} strokeWidth="3.8" />
    <circle cx="0" cy="0" r="24" fill="#E2E8F0" stroke="#475569" strokeWidth="2.6" />
    <circle cx="0" cy="0" r="18" fill="#64748B" />
    {/* Rotating 4-Spoke Alloy Rim */}
    <g transform={`rotate(${(rotation % 360).toFixed(1)})`}>
      <rect x="-4.5" y="-20" width="9" height="40" rx="3" fill="#F1F5F9" stroke="#334155" strokeWidth="1.6" />
      <rect x="-20" y="-4.5" width="40" height="9" rx="3" fill="#F1F5F9" stroke="#334155" strokeWidth="1.6" />
      <circle cx="0" cy="-12" r="2" fill="#475569" />
      <circle cx="0" cy="12" r="2" fill="#475569" />
      <circle cx="-12" cy="0" r="2" fill="#475569" />
      <circle cx="12" cy="0" r="2" fill="#475569" />
    </g>
    {/* Center Hub Cap */}
    <circle cx="0" cy="0" r="7" fill="#CBD5E1" stroke="#334155" strokeWidth="2.2" />
  </g>
);

export const DetailedSedanCar: React.FC<DetailedSedanCarProps> = ({
  x,
  y,
  color = '#EF4444',
  scale = 1,
  wheelRotation = 0,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <StaticCarBody color={color} />
    <CarWheel cx={-106} cy={-36} rotation={wheelRotation} />
    <CarWheel cx={112} cy={-36} rotation={wheelRotation} />
  </g>
);

/* ============================================================================
 * 4. IndoorWarmRoomBackdrop — 3-Layer Cozy Interior (viewBox 1920x1080, memo)
 *    - 2-tone wall with chair rail & baseboard + light-wood floor with grain
 *      (floor horizon at y = 795 <= 830; y = 830..1080 stays clean for captions).
 *    - Left window overlooking blue sky with draped fabric curtains & sill.
 *    - Framed wall art + upper-right wooden wall shelf & grounded corner plant
 *      so walls never look bare while leaving center/mid-right open for actors.
 * ========================================================================== */
export type IndoorRoomVariant = 'living' | 'study' | 'hallway';

export interface IndoorWarmRoomBackdropProps {
  variant?: IndoorRoomVariant;
  uid?: string;
}

const ROOM_PALETTE: Record<
  IndoorRoomVariant,
  {
    wallTop: string;
    wallBottom: string;
    wainscot: string;
    chairRail: string;
    floorTop: string;
    floorBottom: string;
    grain: string;
    curtainMain: string;
    curtainFold: string;
    artAccent: string;
  }
> = {
  living: {
    wallTop: '#FFFBEB',
    wallBottom: '#FEF3C7',
    wainscot: '#FDE68A',
    chairRail: '#D97706',
    floorTop: '#E6C29F',
    floorBottom: '#D4A373',
    grain: '#92400E',
    curtainMain: '#38BDF8',
    curtainFold: '#0284C7',
    artAccent: '#10B981',
  },
  study: {
    wallTop: '#F8FAFC',
    wallBottom: '#EFF6FF',
    wainscot: '#DBEAFE',
    chairRail: '#60A5FA',
    floorTop: '#EED3B1',
    floorBottom: '#DFB88C',
    grain: '#92400E',
    curtainMain: '#34D399',
    curtainFold: '#059669',
    artAccent: '#3B82F6',
  },
  hallway: {
    wallTop: '#F0F9FF',
    wallBottom: '#E0F2FE',
    wainscot: '#BAE6FD',
    chairRail: '#38BDF8',
    floorTop: '#E2D4C0',
    floorBottom: '#CFC0AA',
    grain: '#78716C',
    curtainMain: '#60A5FA',
    curtainFold: '#2563EB',
    artAccent: '#F59E0B',
  },
};

export const IndoorWarmRoomBackdrop: React.FC<IndoorWarmRoomBackdropProps> = React.memo(
  ({ variant = 'living', uid = 'default' }) => {
    const pal = ROOM_PALETTE[variant];
    const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '');
    const wallGradId = `sbk_wall_${variant}_${safeUid}`;
    const floorGradId = `sbk_floor_${variant}_${safeUid}`;
    const winSkyGradId = `sbk_wsky_${variant}_${safeUid}`;

    return (
      <g>
        <defs>
          <linearGradient id={wallGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.wallTop} />
            <stop offset="100%" stopColor={pal.wallBottom} />
          </linearGradient>
          <linearGradient id={floorGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.floorTop} />
            <stop offset="100%" stopColor={pal.floorBottom} />
          </linearGradient>
          <linearGradient id={winSkyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
        </defs>

        {/* Layer 1: 2-Tone Architectural Wall, Chair Rail & Baseboard */}
        <rect x="0" y="0" width="1920" height="795" fill={`url(#${wallGradId})`} />
        <rect x="0" y="548" width="1920" height="226" fill={pal.wainscot} opacity="0.45" />
        {/* Subtle vertical wainscot panel seams */}
        {[240, 480, 720, 960, 1200, 1440, 1680].map((px) => (
          <line key={px} x1={px} y1="554" x2={px} y2="772" stroke={pal.chairRail} strokeWidth="1.5" opacity="0.16" />
        ))}
        {/* Chair Rail Molding */}
        <rect x="0" y="544" width="1920" height="8" fill="#FFFFFF" opacity="0.78" />
        <line x1="0" y1="552" x2="1920" y2="552" stroke={pal.chairRail} strokeWidth="2.5" opacity="0.35" />
        {/* Baseboard Molding grounded cleanly at floor line y = 795 */}
        <rect x="0" y="772" width="1920" height="23" fill="#F8FAFC" />
        <line x1="0" y1="772" x2="1920" y2="772" stroke="#CBD5E1" strokeWidth="2.5" />

        {/* Light-Wood Floor (y = 795..1080) with subtle wood-plank grain lines */}
        <rect x="0" y="795" width="1920" height="285" fill={`url(#${floorGradId})`} />
        <line x1="0" y1="795" x2="1920" y2="795" stroke="#92400E" strokeWidth="3.5" opacity="0.48" />
        {[836, 886, 944, 1008].map((fy, idx) => (
          <g key={fy} opacity="0.18">
            <line x1="0" y1={fy} x2="1920" y2={fy} stroke={pal.grain} strokeWidth="2" />
            {[180, 560, 940, 1320, 1700].map((jx) => (
              <line
                key={jx}
                x1={jx + (idx % 2) * 165}
                y1={fy - 44}
                x2={jx + (idx % 2) * 165}
                y2={fy}
                stroke={pal.grain}
                strokeWidth="1.8"
              />
            ))}
          </g>
        ))}

        {/* Soft Sunbeam Falling from Left Window onto Floor */}
        <polygon points="118,452 406,184 685,795 235,795" fill="#FEF9C3" opacity="0.2" />

        {/* Layer 2A: Left Window Overlooking Blue Sky + Draped Fabric Curtains (x=108..418, y=178..466) */}
        <g transform="translate(116, 180)">
          {/* Window Sky Pane */}
          <rect x="0" y="0" width="292" height="270" rx="10" fill={`url(#${winSkyGradId})`} stroke="#64748B" strokeWidth="7" />
          {/* Soft Distant Clouds & Greenery glimpsed outside */}
          <g opacity="0.88">
            <circle cx="96" cy="86" r="24" fill="#FFFFFF" />
            <circle cx="122" cy="80" r="28" fill="#FFFFFF" />
            <circle cx="150" cy="88" r="22" fill="#FFFFFF" />
            <path d="M 4 266 Q 82 214 156 238 T 288 228 L 288 266 Z" fill="#86EFAC" />
          </g>
          {/* Glass Diagonal Reflection */}
          <polygon points="16,14 134,14 68,256 16,256" fill="#FFFFFF" opacity="0.34" />
          {/* Window Muntins */}
          <line x1="146" y1="0" x2="146" y2="270" stroke="#FFFFFF" strokeWidth="7" />
          <line x1="0" y1="135" x2="292" y2="135" stroke="#FFFFFF" strokeWidth="7" />
          <rect x="0" y="0" width="292" height="270" rx="10" fill="none" stroke={INK} strokeWidth="3.2" opacity="0.6" />
          {/* Wooden Windowsill */}
          <rect x="-18" y="266" width="328" height="16" rx="5" fill="#D97706" stroke={INK} strokeWidth="2.8" opacity="0.88" />

          {/* Curtain Rod & Finials */}
          <rect x="-36" y="-18" width="364" height="8" rx="4" fill="#475569" stroke={INK} strokeWidth="2" />
          <circle cx="-38" cy="-14" r="8" fill="#64748B" stroke={INK} strokeWidth="2" />
          <circle cx="330" cy="-14" r="8" fill="#64748B" stroke={INK} strokeWidth="2" />

          {/* Left & Right Draped Fabric Curtains */}
          <path
            d="M -24 -12 L 54 -12 C 44 76 34 156 16 206 C 34 246 40 280 42 308 L -24 308 Z"
            fill={pal.curtainMain}
            stroke={pal.curtainFold}
            strokeWidth="2.6"
            opacity="0.92"
          />
          <path d="M 4 -10 C 0 88 -4 166 -10 306" fill="none" stroke={pal.curtainFold} strokeWidth="2.2" opacity="0.45" />
          <rect x="-24" y="198" width="44" height="10" rx="5" fill="#FEF3C7" stroke={pal.curtainFold} strokeWidth="2" />

          <path
            d="M 316 -12 L 238 -12 C 248 76 258 156 276 206 C 258 246 252 280 250 308 L 316 308 Z"
            fill={pal.curtainMain}
            stroke={pal.curtainFold}
            strokeWidth="2.6"
            opacity="0.92"
          />
          <path d="M 288 -10 C 292 88 296 166 302 306" fill="none" stroke={pal.curtainFold} strokeWidth="2.2" opacity="0.45" />
          <rect x="272" y="198" width="44" height="10" rx="5" fill="#FEF3C7" stroke={pal.curtainFold} strokeWidth="2" />
        </g>

        {/* Layer 2B: Center-Upper Framed Wall Art (y=194..336, well below top CleanLabel & behind actors) */}
        <g opacity="0.72">
          {/* Left Framed Landscape Art */}
          <g transform="translate(755, 196)">
            <rect x="0" y="0" width="156" height="128" rx="8" fill="#B45309" stroke={INK} strokeWidth="2.8" />
            <rect x="11" y="11" width="134" height="106" rx="4" fill="#F8FAFC" />
            <rect x="17" y="17" width="122" height="94" rx="2" fill="#E0F2FE" />
            <circle cx="110" cy="40" r="14" fill="#FDE047" />
            <path d="M 17 111 L 56 64 L 94 94 L 118 76 L 139 111 Z" fill={pal.artAccent} opacity="0.85" />
          </g>

          {/* Right Framed Botanical / Geometric Art */}
          <g transform="translate(945, 196)">
            <rect x="0" y="0" width="156" height="128" rx="8" fill="#B45309" stroke={INK} strokeWidth="2.8" />
            <rect x="11" y="11" width="134" height="106" rx="4" fill="#F8FAFC" />
            <rect x="17" y="17" width="122" height="94" rx="2" fill="#FEF9C3" />
            <path d="M 78 98 C 78 72 52 54 44 38 C 68 42 78 60 78 74 C 78 58 92 42 114 36 C 106 56 86 72 78 98 Z" fill="#16A34A" />
            <line x1="78" y1="98" x2="78" y2="54" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>

        {/* Layer 2C: Upper-Right Wooden Wall Bookshelf with Books & Mini Plant (x=1565..1845, y=188..318) */}
        <g transform="translate(1570, 190)" opacity="0.84">
          {/* Wall Shelf Plank & Brackets */}
          <rect x="26" y="112" width="10" height="22" rx="3" fill="#78350F" />
          <rect x="234" y="112" width="10" height="22" rx="3" fill="#78350F" />
          <rect x="0" y="98" width="270" height="16" rx="5" fill="#B45309" stroke={INK} strokeWidth="2.6" />
          {/* Neat Row of Books */}
          <rect x="20" y="34" width="26" height="64" rx="4" fill="#60A5FA" stroke={INK} strokeWidth="2.2" />
          <rect x="50" y="22" width="28" height="76" rx="4" fill="#34D399" stroke={INK} strokeWidth="2.2" />
          <rect x="82" y="38" width="24" height="60" rx="4" fill="#FBBF24" stroke={INK} strokeWidth="2.2" />
          <rect x="110" y="28" width="28" height="70" rx="4" fill="#F87171" stroke={INK} strokeWidth="2.2" />
          <rect x="142" y="42" width="24" height="56" rx="4" fill="#A78BFA" stroke={INK} strokeWidth="2.2" />
          {/* Mini Potted Plant on Right End of Shelf */}
          <path d="M 196 98 L 204 66 L 238 66 L 246 98 Z" fill="#F97316" stroke={INK} strokeWidth="2.4" />
          <circle cx="212" cy="54" r="14" fill="#16A34A" stroke={INK} strokeWidth="2" />
          <circle cx="230" cy="56" r="13" fill="#22C55E" stroke={INK} strokeWidth="2" />
          <circle cx="221" cy="44" r="14" fill="#4ADE80" stroke={INK} strokeWidth="2" />
        </g>

        {/* Layer 2D: Far-Left Low Wooden Sideboard (x=130..365, grounded at y=795, clear of x>=520 actors) */}
        <g transform="translate(142, 668)" opacity="0.88">
          <GroundShadow cx={108} cy={130} rx={116} ry={9} />
          <rect x="18" y="96" width="14" height="31" rx="3" fill="#78350F" stroke={INK} strokeWidth="2.6" />
          <rect x="184" y="96" width="14" height="31" rx="3" fill="#78350F" stroke={INK} strokeWidth="2.6" />
          <rect x="0" y="0" width="216" height="98" rx="9" fill="#B45309" stroke={INK} strokeWidth="3.2" />
          <line x1="108" y1="10" x2="108" y2="88" stroke={INK} strokeWidth="2.4" />
          <circle cx="92" cy="48" r="4.5" fill="#FDE047" stroke={INK} strokeWidth="1.8" />
          <circle cx="124" cy="48" r="4.5" fill="#FDE047" stroke={INK} strokeWidth="1.8" />
          {/* Small Stack of Books on Sideboard */}
          <rect x="28" y="-16" width="76" height="16" rx="3.5" fill="#3B82F6" stroke={INK} strokeWidth="2.2" />
          <rect x="38" y="-30" width="58" height="14" rx="3.5" fill="#10B981" stroke={INK} strokeWidth="2.2" />
        </g>

        {/* Layer 2E: Far-Right Potted Indoor Plant (x=1745, grounded cleanly at y=795, clear of x<=1500 actors) */}
        <g transform="translate(1748, 795)" opacity="0.92">
          <GroundShadow cx={0} cy={3} rx={48} ry={9} />
          <path d="M -4 -76 C -42 -116 -54 -162 -24 -176 C -4 -160 -2 -120 0 -76 Z" fill="#16A34A" stroke={INK} strokeWidth="2.8" />
          <path d="M 4 -76 C 42 -116 54 -162 24 -176 C 4 -160 2 -120 0 -76 Z" fill="#22C55E" stroke={INK} strokeWidth="2.8" />
          <path d="M 0 -76 C -16 -130 -14 -180 0 -196 C 14 -180 16 -130 0 -76 Z" fill="#4ADE80" stroke={INK} strokeWidth="2.8" />
          <path d="M -34 -76 L -24 0 L 24 0 L 34 -76 Z" fill="#F97316" stroke={INK} strokeWidth="3.2" />
          <rect x="-40" y="-88" width="80" height="15" rx="5" fill="#EA580C" stroke={INK} strokeWidth="3.2" />
        </g>
      </g>
    );
  }
);
IndoorWarmRoomBackdrop.displayName = 'IndoorWarmRoomBackdrop';
