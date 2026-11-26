import React from "react";
import type { AutoTimeOfDay } from "../lib/v7/episodeJsonSchema";

const INK = "#1E293B";

export interface NatureBackdropProps {
  frame: number;
  timeOfDay?: AutoTimeOfDay;
  uid?: string;
}

/* ============================================================================
 * 1. FOREST_PARK_BACKDROP — 3-Layer Daytime Forest / Nature Park (1920x1080)
 *    - Layer 1 (Background, React.memo + 3 slow clouds): soft sky #E0F2FE -> #BAE6FD,
 *      distant pastel blue/mint hills (#93C5FD, #6EE7B7), clouds drifting by frame * 0.18
 *    - Layer 2 (Midground, React.memo): 2-tone rounded canopy trees (#16A34A, #22C55E),
 *      warm brown trunks (#92400E), 2 flat diagonal sunbeams (#FEF9C3 opacity=0.16, 0 blur)
 *    - Layer 3 (Foreground, React.memo): bright grass meadow + clean path y=730..1080,
 *      side grass tufts & flowers strictly at x < 220 & x > 1700 so center is open for actors
 * ========================================================================== */

const ForestParkStaticBackground: React.FC<{ gradId: string; isSunset: boolean; isNight: boolean }> = React.memo(
  ({ gradId, isSunset, isNight }) => (
    <g id="forest-park-layer-bg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#1E293B" : isSunset ? "#FDBA74" : "#E0F2FE"} />
          <stop offset="100%" stopColor={isNight ? "#334155" : isSunset ? "#FEF3C7" : "#BAE6FD"} />
        </linearGradient>
      </defs>

      {/* Sky Canvas */}
      <rect x={0} y={0} width={1920} height={740} fill={`url(#${gradId})`} stroke="none" />

      {/* Soft Sun / Moon Halo (flat circles, zero blur) */}
      <circle cx={1660} cy={160} r={86} fill={isNight ? "#E2E8F0" : "#FEF9C3"} opacity={isNight ? 0.18 : 0.35} stroke="none" />
      <circle cx={1660} cy={160} r={46} fill={isNight ? "#F8FAFC" : "#FEF08A"} opacity={isNight ? 0.85 : 0.7} stroke="none" />

      {/* Distant Rolling Blue-Mint Mountains & Hills */}
      <path
        d="M 0,580 Q 260,395 540,510 T 1120,475 T 1650,490 T 1920,445 L 1920,740 L 0,740 Z"
        fill={isNight ? "#334155" : "#93C5FD"}
        opacity={isNight ? 0.8 : 0.72}
        stroke="none"
      />
      <path
        d="M 0,625 Q 320,505 680,580 T 1360,545 T 1920,585 L 1920,740 L 0,740 Z"
        fill={isNight ? "#1E3A2F" : "#6EE7B7"}
        opacity={0.85}
        stroke="none"
      />
    </g>
  )
);
ForestParkStaticBackground.displayName = "ForestParkStaticBackground";

const ForestParkStaticMidAndFore: React.FC<{ isNight: boolean }> = React.memo(({ isNight }) => {
  const trees = [
    { x: 115, scale: 1.05, back: false },
    { x: 295, scale: 0.86, back: true },
    { x: 495, scale: 0.94, back: false },
    { x: 745, scale: 0.78, back: true },
    { x: 1190, scale: 0.80, back: true },
    { x: 1425, scale: 0.96, back: false },
    { x: 1635, scale: 0.88, back: true },
    { x: 1810, scale: 1.08, back: false },
  ];

  return (
    <g id="forest-park-layer-mid-fore">
      {/* Layer 2: Layered 2-tone rounded canopy trees */}
      {trees.map((t, ti) => (
        <g key={`fp_tree_${ti}`} transform={`translate(${t.x}, 730) scale(${t.scale})`}>
          {/* Trunk */}
          <rect
            x={-17}
            y={-215}
            width={34}
            height={215}
            rx={10}
            fill={isNight ? "#78350F" : "#92400E"}
            stroke={INK}
            strokeWidth={3.2}
          />
          {/* Subtle V-branch */}
          <path d="M 0,-125 L 26,-160 M 0,-145 L -24,-176" stroke="#78350F" strokeWidth={8} strokeLinecap="round" />
          {/* Dark Canopy Base */}
          <circle cx={-48} cy={-232} r={66} fill={isNight ? "#14532D" : "#16A34A"} stroke={INK} strokeWidth={3.2} />
          <circle cx={48} cy={-232} r={66} fill={isNight ? "#14532D" : "#16A34A"} stroke={INK} strokeWidth={3.2} />
          <circle cx={0} cy={-278} r={78} fill={isNight ? "#14532D" : "#16A34A"} stroke={INK} strokeWidth={3.2} />
          {/* Brighter Top-Right Leaf Highlight */}
          <circle cx={-26} cy={-248} r={46} fill={isNight ? "#15803D" : "#22C55E"} stroke="none" opacity={0.92} />
          <circle cx={34} cy={-258} r={52} fill={isNight ? "#15803D" : "#22C55E"} stroke="none" opacity={0.92} />
          <circle cx={8} cy={-300} r={52} fill={isNight ? "#16A34A" : "#4ADE80"} stroke="none" opacity={0.48} />
        </g>
      ))}

      {/* 2 Flat Diagonal Sunbeams (0 blur!) */}
      {!isNight && (
        <g id="forest-park-sunbeams" stroke="none">
          <polygon points="1220,0 1445,0 910,760 620,760" fill="#FEF9C3" opacity={0.16} />
          <polygon points="1540,0 1750,0 1320,760 1070,760" fill="#FEF9C3" opacity={0.16} />
        </g>
      )}

      {/* Layer 3: Bright Meadow & Clean Central Dirt/Stone Path (y=730..1080) */}
      <rect x={0} y={730} width={1920} height={350} fill={isNight ? "#14532D" : "#86EFAC"} stroke="none" />
      <line x1={0} y1={730} x2={1920} y2={730} stroke="#15803D" strokeWidth={3.2} />
      {/* Clean curved dirt/stone walking trail spanning center open zone */}
      <path
        d="M 0,782 Q 480,756 960,766 T 1920,782 L 1920,1080 L 0,1080 Z"
        fill={isNight ? "#64748B" : "#FDE68A"}
        stroke="none"
        opacity={isNight ? 0.55 : 0.72}
      />
      <path
        d="M 0,782 Q 480,756 960,766 T 1920,782"
        fill="none"
        stroke={isNight ? "#475569" : "#D97706"}
        strokeWidth={3}
        opacity={0.45}
      />
      {/* Subtle flat stepping pebbles along edges of path */}
      {[320, 610, 1290, 1580].map((px, pi) => (
        <ellipse
          key={`fp_peb_${pi}`}
          cx={px}
          cy={802 + (pi % 2) * 14}
          rx={24}
          ry={7}
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth={1.8}
          opacity={0.75}
        />
      ))}

      {/* Side Edge Bushes & Tiny Flowers STRICTLY at x < 220 and x > 1700 */}
      <g id="forest-park-side-foliage" stroke={INK} strokeWidth={2.8} strokeLinejoin="round">
        {/* Left edge */}
        <path d="M -10,805 C 12,732 76,728 96,766 C 126,742 178,754 188,805 Z" fill="#22C55E" />
        <circle cx={62} cy={768} r={8} fill="#FEF08A" stroke="#CA8A04" strokeWidth={2} />
        <circle cx={142} cy={782} r={7.5} fill="#FBCFE8" stroke="#DB2777" strokeWidth={2} />
        {/* Right edge */}
        <path d="M 1732,805 C 1746,752 1796,744 1824,768 C 1848,728 1906,734 1930,805 Z" fill="#22C55E" />
        <circle cx={1782} cy={780} r={8} fill="#FEF08A" stroke="#CA8A04" strokeWidth={2} />
        <circle cx={1856} cy={764} r={7.5} fill="#BAE6FD" stroke="#0284C7" strokeWidth={2} />
      </g>
    </g>
  );
});
ForestParkStaticMidAndFore.displayName = "ForestParkStaticMidAndFore";

export const FOREST_PARK_BACKDROP: React.FC<NatureBackdropProps> = ({
  frame,
  timeOfDay = "DAY",
  uid = "fp",
}) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const gradId = `forest_park_sky_${uid}_${timeOfDay}`;
  const drift = frame * 0.18;
  const clouds = [
    { base: 240, y: 122, s: 1.0 },
    { base: 880, y: 92, s: 0.85 },
    { base: 1460, y: 146, s: 0.92 },
  ];

  return (
    <g id="stage-forest-park">
      <ForestParkStaticBackground gradId={gradId} isSunset={isSunset} isNight={isNight} />
      {/* 3 Slow-Drifting White Clouds */}
      {!isNight && (
        <g id="forest-park-clouds" fill="#FFFFFF" opacity={0.92} stroke="none">
          {clouds.map((c, ci) => {
            const cx = ((c.base + drift) % 2160) - 120;
            return (
              <g key={`fpc_${ci}`} transform={`translate(${cx.toFixed(1)}, ${c.y}) scale(${c.s})`}>
                <ellipse cx={0} cy={8} rx={78} ry={22} />
                <circle cx={-34} cy={-4} r={28} />
                <circle cx={6} cy={-16} r={36} />
                <circle cx={44} cy={-4} r={24} />
              </g>
            );
          })}
        </g>
      )}
      <ForestParkStaticMidAndFore isNight={isNight} />
    </g>
  );
};
export const ForestParkBackdrop = FOREST_PARK_BACKDROP;

/* ============================================================================
 * 2. OCEAN_UNDERWATER_BACKDROP — 3-Layer Bright Underwater Scene (1920x1080)
 *    - Layer 1: Readable ocean gradient #38BDF8 -> #0284C7 -> #0369A1 (never pitch black!),
 *      gentle surface waves y=0..90, 3 diagonal light shafts (#E0F2FE opacity=0.14)
 *    - Layer 2: Distant flat coral reef silhouettes (opacity=0.25), 9 rising circular bubbles
 *    - Layer 3: Soft golden sand floor (#FDE68A y=790..1080), 5 swaying kelp ribbons at edges
 *      (Math.sin(frame * 0.05 + i) * 10), neat pastel corals in bottom corners
 * ========================================================================== */

const OceanStaticBase: React.FC<{ gradId: string }> = React.memo(({ gradId }) => (
  <g id="ocean-underwater-static-base">
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="52%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>

    {/* Bright Readable Ocean Water Body */}
    <rect x={0} y={0} width={1920} height={820} fill={`url(#${gradId})`} stroke="none" />

    {/* 3 Diagonal Underwater Light Shafts (0 blur!) */}
    <g id="ocean-light-shafts" fill="#E0F2FE" opacity={0.14} stroke="none">
      <polygon points="220,0 440,0 740,810 430,810" />
      <polygon points="820,0 1090,0 1320,810 980,810" />
      <polygon points="1390,0 1640,0 1830,810 1520,810" />
    </g>

    {/* Layer 2 Static: Distant Coral Reef Silhouettes (flat opacity=0.25) */}
    <path
      d="M 0,795 L 0,635 Q 120,575 235,645 Q 340,600 455,668 Q 575,625 690,695 L 1220,705 Q 1345,620 1475,665 Q 1600,590 1745,650 Q 1835,605 1920,645 L 1920,795 Z"
      fill="#0C4A6E"
      opacity={0.25}
      stroke="none"
    />

    {/* Layer 3 Static: Soft Golden Sand Floor (y=790..1080) */}
    <path
      d="M 0,796 Q 480,774 960,796 T 1920,792 L 1920,1080 L 0,1080 Z"
      fill="#FDE68A"
      stroke="none"
    />
    <path d="M 0,796 Q 480,774 960,796 T 1920,792" fill="none" stroke="#D97706" strokeWidth={3.5} opacity={0.55} />
    {/* Subtle sand ripples */}
    <g fill="none" stroke="#F59E0B" strokeWidth={3} strokeLinecap="round" opacity={0.35}>
      <path d="M 380,842 Q 460,832 540,842" />
      <path d="M 880,858 Q 980,846 1080,858" />
      <path d="M 1340,838 Q 1430,828 1520,838" />
    </g>

    {/* Neat Pastel Corner Corals (strictly at far left & far right edges) */}
    <g id="ocean-corner-corals" stroke={INK} strokeWidth={3} strokeLinejoin="round">
      {/* Left coral cluster */}
      <path d="M 54,820 L 42,742 C 38,718 68,718 68,744 L 74,772 L 96,722 C 106,704 132,718 122,740 L 106,784 L 138,760 C 154,748 170,768 152,786 L 126,820 Z" fill="#FB7185" />
      <ellipse cx={210} cy={812} rx={36} ry={18} fill="#FDBA74" />
      {/* Right coral cluster */}
      <path d="M 1780,820 L 1762,764 C 1752,742 1778,732 1790,754 L 1806,780 L 1824,724 C 1832,704 1860,712 1854,736 L 1844,778 L 1872,748 C 1888,734 1906,754 1890,776 L 1862,820 Z" fill="#C084FC" />
      <ellipse cx={1704} cy={814} rx={34} ry={16} fill="#5EEAD4" />
    </g>
  </g>
));
OceanStaticBase.displayName = "OceanStaticBase";

export const OCEAN_UNDERWATER_BACKDROP: React.FC<NatureBackdropProps> = ({
  frame,
  uid = "oc",
}) => {
  const gradId = `ocean_water_grad_${uid}`;
  const waveShift = Math.sin(frame * 0.04) * 18;

  const bubbles = [
    { x: 185, speed: 1.4, offset: 120, r: 14 },
    { x: 340, speed: 1.1, offset: 540, r: 10 },
    { x: 560, speed: 1.6, offset: 820, r: 16 },
    { x: 780, speed: 1.25, offset: 290, r: 11 },
    { x: 1040, speed: 1.5, offset: 680, r: 13 },
    { x: 1260, speed: 1.05, offset: 150, r: 9 },
    { x: 1480, speed: 1.45, offset: 910, r: 15 },
    { x: 1680, speed: 1.2, offset: 430, r: 12 },
    { x: 1810, speed: 1.55, offset: 760, r: 10 },
  ];

  const kelps = [
    { x: 96, h: 205, color: "#10B981" },
    { x: 158, h: 165, color: "#34D399" },
    { x: 256, h: 138, color: "#059669" },
    { x: 1665, h: 155, color: "#059669" },
    { x: 1748, h: 210, color: "#10B981" },
  ];

  return (
    <g id="stage-ocean-underwater">
      <OceanStaticBase gradId={gradId} />

      {/* Animated Gentle Surface Ripples at y=0..90 */}
      <g id="ocean-surface-waves" stroke="none">
        <path
          d={`M 0,0 L 1920,0 L 1920,56 Q ${(1440 + waveShift).toFixed(1)},86 960,56 T 0,56 Z`}
          fill="#7DD3FC"
          opacity={0.55}
        />
        <path
          d={`M 0,0 L 1920,0 L 1920,34 Q ${(480 - waveShift).toFixed(1)},56 960,34 T 1920,34 Z`}
          fill="#E0F2FE"
          opacity={0.5}
        />
      </g>

      {/* 9 Rising Circular Bubbles */}
      <g id="ocean-rising-bubbles">
        {bubbles.map((b, bi) => {
          const y = 1080 - ((frame * b.speed + b.offset) % 1080);
          const x = b.x + Math.sin(frame * 0.05 + bi) * 8;
          return (
            <g key={`oc_bub_${bi}`} transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)})`}>
              <circle cx={0} cy={0} r={b.r} fill="#E0F2FE" opacity={0.34} stroke="#FFFFFF" strokeWidth={2.2} />
              <circle cx={-b.r * 0.32} cy={-b.r * 0.32} r={b.r * 0.24} fill="#FFFFFF" opacity={0.8} stroke="none" />
            </g>
          );
        })}
      </g>

      {/* 5 Swaying Kelp Ribbons at Side Edges */}
      <g id="ocean-swaying-kelp" fill="none" strokeLinecap="round">
        {kelps.map((k, ki) => {
          const sway = Math.sin(frame * 0.05 + ki) * 10;
          const baseY = 815;
          const topY = baseY - k.h;
          const midY = baseY - k.h * 0.52;
          return (
            <path
              key={`oc_kelp_${ki}`}
              d={`M ${k.x},${baseY} Q ${(k.x - 18 + sway).toFixed(1)},${midY.toFixed(1)} ${(k.x + sway * 1.4).toFixed(1)},${topY.toFixed(1)}`}
              stroke={k.color}
              strokeWidth={14}
              opacity={0.9}
            />
          );
        })}
      </g>
    </g>
  );
};
export const OceanUnderwaterBackdrop = OCEAN_UNDERWATER_BACKDROP;

/* ============================================================================
 * 3. BACKYARD_BALCONY_PET — 3-Layer Bright Patio / Balcony for BOY & Pets (1920x1080)
 *    - Layer 1: Bright afternoon sky + green treeline behind fence
 *    - Layer 2: Warm white/beige wooden picket fence (y=460..720), potted plants,
 *      sliding glass patio door cleanly placed on left edge
 *    - Layer 3: Bright tiled wooden/stone patio deck (y=720..1080) with subtle flat seams,
 *      spacious open center x=350..1550 for BOY + CuteCat / CuteDog with flat ground shadows
 * ========================================================================== */

const BackyardBalconyStaticBase: React.FC<{ gradId: string; isSunset: boolean; isNight: boolean }> = React.memo(
  ({ gradId, isSunset, isNight }) => {
    const picketXs = Array.from({ length: 24 }, (_, idx) => 380 + idx * 66);
    return (
      <g id="backyard-balcony-static-base">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isNight ? "#1E293B" : isSunset ? "#FDBA74" : "#BAE6FD"} />
            <stop offset="100%" stopColor={isNight ? "#334155" : isSunset ? "#FEF3C7" : "#F0F9FF"} />
          </linearGradient>
        </defs>

        {/* Layer 1: Bright Afternoon Sky */}
        <rect x={0} y={0} width={1920} height={720} fill={`url(#${gradId})`} stroke="none" />

        {/* Distant Green Treeline behind fence */}
        <path
          d="M 320,520 Q 430,360 560,435 Q 690,335 840,425 Q 980,350 1120,430 Q 1270,335 1420,420 Q 1570,340 1720,430 Q 1820,380 1920,435 L 1920,540 L 320,540 Z"
          fill={isNight ? "#14532D" : "#4ADE80"}
          stroke="none"
          opacity={0.85}
        />
        <path
          d="M 320,535 Q 480,415 650,485 Q 830,400 1020,475 Q 1210,395 1410,480 Q 1630,405 1920,475 L 1920,560 L 320,560 Z"
          fill={isNight ? "#166534" : "#22C55E"}
          stroke="none"
        />

        {/* Layer 2: Warm White/Beige Wooden Fence (y=460..720) */}
        <g id="balcony-wooden-fence" stroke={INK} strokeWidth={2.8} strokeLinejoin="round">
          <rect x={360} y={512} width={1560} height={24} fill="#E7E5E4" />
          <rect x={360} y={644} width={1560} height={24} fill="#E7E5E4" />
          {picketXs.map((px, pi) => (
            <path
              key={`bp_${pi}`}
              d={`M ${px},476 L ${px + 22},456 L ${px + 44},476 L ${px + 44},720 L ${px},720 Z`}
              fill="#FAF7F2"
            />
          ))}
        </g>

        {/* Left Edge House Wall & Sliding Glass Patio Door (x=0..365) */}
        <g id="balcony-patio-door" stroke={INK} strokeWidth={3.2} strokeLinejoin="round">
          <rect x={0} y={0} width={365} height={720} fill={isNight ? "#334155" : "#FEF3C7"} />
          {/* Sliding glass door frame */}
          <rect x={44} y={135} width={276} height={585} rx={8} fill="#FFFFFF" stroke="#64748B" strokeWidth={8} />
          <rect x={58} y={150} width={248} height={556} rx={4} fill={isNight ? "#1E293B" : "#E0F2FE"} />
          {/* Diagonal flat glass reflections */}
          <polygon points="82,168 158,168 96,420 68,420" fill="#FFFFFF" opacity={0.45} stroke="none" />
          <polygon points="184,168 220,168 138,510 112,510" fill="#FFFFFF" opacity={0.32} stroke="none" />
          <line x1={182} y1={150} x2={182} y2={706} stroke="#64748B" strokeWidth={6} />
          <rect x={162} y={425} width={10} height={56} rx={4} fill="#94A3B8" />
        </g>

        {/* Potted Plants at Right Edge & Door Edge (leaving x=380..1620 completely open!) */}
        <g id="balcony-potted-plants" stroke={INK} strokeWidth={2.8} strokeLinejoin="round">
          {/* Right edge terracotta planter */}
          <g transform="translate(1745, 720)">
            <ellipse cx={0} cy={6} rx={68} ry={10} fill="#0F172A" opacity={0.12} stroke="none" />
            <path d="M -52,-86 L 52,-86 L 40,0 L -40,0 Z" fill="#EA580C" />
            <rect x={-58} y={-102} width={116} height={18} rx={6} fill="#F97316" />
            <circle cx={-28} cy={-128} r={34} fill="#16A34A" />
            <circle cx={28} cy={-132} r={36} fill="#22C55E" />
            <circle cx={0} cy={-162} r={40} fill="#4ADE80" />
          </g>
          {/* Small pot near sliding door */}
          <g transform="translate(320, 720)">
            <path d="M -32,-54 L 32,-54 L 24,0 L -24,0 Z" fill="#D97706" />
            <circle cx={0} cy={-80} r={30} fill="#22C55E" />
            <circle cx={-18} cy={-68} r={18} fill="#16A34A" />
          </g>
        </g>

        {/* Layer 3: Bright Clean Patio Floor (y=720..1080) with subtle perspective tile seams */}
        <rect x={0} y={720} width={1920} height={360} fill={isNight ? "#475569" : "#F5E6D3"} stroke="none" />
        <line x1={0} y1={720} x2={1920} y2={720} stroke={INK} strokeWidth={3.2} />
        <g stroke={isNight ? "#64748B" : "#D6BFA3"} strokeWidth={2.2} opacity={0.62}>
          <line x1={0} y1={792} x2={1920} y2={792} />
          <line x1={0} y1={876} x2={1920} y2={876} />
          {[240, 480, 720, 960, 1200, 1440, 1680].map((tx) => (
            <line key={`bpt_${tx}`} x1={tx} y1={720} x2={tx - 48} y2={1080} />
          ))}
        </g>
      </g>
    );
  }
);
BackyardBalconyStaticBase.displayName = "BackyardBalconyStaticBase";

export const BACKYARD_BALCONY_PET: React.FC<NatureBackdropProps> = ({
  frame,
  timeOfDay = "DAY",
  uid = "bbp",
}) => {
  const isNight = timeOfDay === "NIGHT";
  const isSunset = timeOfDay === "SUNSET";
  const gradId = `backyard_balcony_sky_${uid}_${timeOfDay}`;
  const drift = frame * 0.16;

  return (
    <g id="stage-backyard-balcony-pet">
      <BackyardBalconyStaticBase gradId={gradId} isSunset={isSunset} isNight={isNight} />
      {!isNight && (
        <g fill="#FFFFFF" opacity={0.88} stroke="none">
          {[
            { base: 640, y: 112, s: 0.9 },
            { base: 1380, y: 144, s: 0.82 },
          ].map((c, ci) => {
            const cx = ((c.base + drift) % 1620) + 340;
            return (
              <g key={`bbc_${ci}`} transform={`translate(${cx.toFixed(1)}, ${c.y}) scale(${c.s})`}>
                <ellipse cx={0} cy={6} rx={64} ry={18} />
                <circle cx={-26} cy={-4} r={24} />
                <circle cx={8} cy={-12} r={30} />
                <circle cx={38} cy={-2} r={20} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};
export const BackyardBalconyPetBackdrop = BACKYARD_BALCONY_PET;
