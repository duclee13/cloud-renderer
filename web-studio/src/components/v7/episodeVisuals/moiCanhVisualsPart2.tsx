import React from 'react';
import type { EpisodeVisualProps } from './index';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  CleanLabel,
  ShortSpeechBubble,
  SharedStickman,
  WingedTermite,
  PorchNightBackdrop,
  SoilCutawayBackdrop,
} from './moiCanhSharedAssets';

const easeOutCubic = (t: number) => {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
};

const easeInOutCubic = (t: number) => {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

/* ============================================================================
 * 1. MoiCanhTandemRunningVisual (MOICANH_TANDEM_RUNNING)
 * Top-down / angled porch tile view: pheromone calling -> tandem running -> pause & resume
 * ============================================================================ */
export const MoiCanhTandemRunningVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  // Continuous non-resetting positions across steps 0 -> 1 -> 2
  let femaleX = 740;
  let femaleY = 545;
  let maleX = 420;
  let maleY = 552;
  let femaleAngle = 0;
  let maleAngle = 0;
  let showPauseCue = false;

  if (activeStep === 0) {
    const p = easeOutCubic(progress);
    femaleX = 740;
    femaleY = 545;
    // Female raises/sways abdomen gently while calling
    femaleAngle = -6 + Math.sin(frame * 0.1) * 4;
    // Male approaches from left sensing pheromone rings
    maleX = lerp(290, 560, p);
    maleY = 548 + Math.sin(frame * 0.25) * 4;
    maleAngle = Math.sin(frame * 0.25) * 3;
  } else if (activeStep === 1) {
    const p = easeInOutCubic(progress);
    femaleX = lerp(740, 1110, p);
    femaleY = 545 + Math.sin(p * Math.PI * 2) * 14 + Math.sin(frame * 0.4) * 2.5;
    maleX = femaleX - 152;
    maleY = 545 + Math.sin((p - 0.08) * Math.PI * 2) * 14 + Math.sin(frame * 0.4 + 0.6) * 2.5;
    femaleAngle = Math.cos(p * Math.PI * 2) * 4;
    maleAngle = Math.cos((p - 0.08) * Math.PI * 2) * 4;
  } else {
    // Step 2: brief obstacle separation -> female pauses with "..." -> male catches up -> both head to dark corner
    const p = clamp01(progress);
    if (p < 0.35) {
      const t = easeOutCubic(p / 0.35);
      femaleX = lerp(1110, 1265, t);
      femaleY = lerp(545, 525, t);
      maleX = lerp(958, 1020, t);
      maleY = lerp(545, 578, t);
      femaleAngle = -3;
      maleAngle = 12;
      showPauseCue = t > 0.55;
    } else if (p < 0.68) {
      const t = easeInOutCubic((p - 0.35) / 0.33);
      femaleX = 1265;
      femaleY = 525;
      maleX = lerp(1020, 1118, t);
      maleY = lerp(578, 528, t);
      femaleAngle = Math.sin(frame * 0.08) * 3;
      maleAngle = lerp(-14, 0, t);
      showPauseCue = t < 0.82;
    } else {
      const t = easeInOutCubic((p - 0.68) / 0.32);
      femaleX = lerp(1265, 1650, t);
      femaleY = lerp(525, 485, t) + Math.sin(frame * 0.42) * 2;
      maleX = femaleX - 148;
      maleY = lerp(528, 492, t) + Math.sin(frame * 0.42 + 0.5) * 2;
      femaleAngle = -8;
      maleAngle = -6;
    }
  }

  const scentFade = activeStep === 0 ? 1 : activeStep === 1 ? clamp01(1 - progress * 2.5) : 0;

  const topLabel =
    activeStep === 0
      ? 'Phát tín hiệu gọi bạn đời'
      : activeStep === 1
      ? 'Chạy nối đuôi nhau'
      : 'Lạc nhau sẽ dừng chờ, rồi đi tiếp về góc tối';

  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mc10_tileBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5e6d3" />
          <stop offset="65%" stopColor="#e8d0b5" />
          <stop offset="100%" stopColor="#d6b899" />
        </linearGradient>
        <linearGradient id="mc10_cornerShadow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e1b18" stopOpacity="0" />
          <stop offset="60%" stopColor="#1e1b18" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#0f0d0b" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="mc10_scentGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Warm ceramic porch floor */}
      <rect x="0" y="0" width="1920" height="1080" fill="url(#mc10_tileBg)" />

      {/* Subtle angled porcelain tile grid */}
      <g stroke="#c4a484" strokeWidth="3.5" opacity="0.55">
        {[180, 420, 660, 900, 1140, 1380, 1620].map((tx) => (
          <line key={tx} x1={tx} y1="0" x2={tx - 60} y2="1080" />
        ))}
        {[220, 460, 700, 940].map((ty) => (
          <line key={ty} x1="0" y1={ty} x2="1920" y2={ty} />
        ))}
      </g>

      {/* Scattered shed translucent wings on porch tiles */}
      {[
        { x: 340, y: 310, r: 24 },
        { x: 410, y: 740, r: -18 },
        { x: 860, y: 330, r: 42 },
        { x: 1320, y: 730, r: -30 },
      ].map((w, i) => (
        <ellipse
          key={i}
          cx={w.x}
          cy={w.y}
          rx="36"
          ry="10"
          transform={`rotate(${w.r} ${w.x} ${w.y})`}
          fill="#ffffff"
          fillOpacity="0.45"
          stroke="#94a3b8"
          strokeWidth="2"
        />
      ))}

      {/* Dark wooden baseboard & cozy dark corner crevice on the right */}
      <rect x="1630" y="0" width="290" height="1080" fill="url(#mc10_cornerShadow)" />
      <rect x="1740" y="180" width="180" height="720" fill="#3f2718" stroke={INK} strokeWidth="5" />
      {/* Wood grain on baseboard */}
      <path d="M1775 210 L1775 870 M1820 200 L1820 880" stroke="#5c3a21" strokeWidth="4" opacity="0.6" />
      {/* Dark inviting crevice opening */}
      <path
        d="M1740 430 L1708 465 L1708 535 L1740 570 Z"
        fill="#090706"
        stroke="#27180f"
        strokeWidth="4"
      />
      <text
        x="1798"
        y="375"
        textAnchor="middle"
        fill="#fde68a"
        fontSize="24"
        fontWeight="700"
        fontFamily={FONT}
        opacity="0.9"
      >
        Góc tối
      </text>

      {/* Small pebble & dried leaf obstacle on tiles */}
      <g transform="translate(1080, 585)">
        <ellipse cx="0" cy="6" rx="34" ry="18" fill="#78716c" opacity="0.25" />
        <path
          d="M-28 0 Q-18 -20 6 -16 Q32 -12 28 6 Q18 20 -12 16 Q-32 12 -28 0 Z"
          fill="#a8a29e"
          stroke={INK}
          strokeWidth="3.5"
        />
        <ellipse cx="44" cy="-16" rx="18" ry="8" transform="rotate(-22 44 -16)" fill="#a16207" stroke={INK} strokeWidth="3" />
      </g>

      {/* Concentric pink/lavender scent rings from female abdomen (step 0) */}
      {scentFade > 0.01 ? (
        <g opacity={scentFade}>
          <circle cx={femaleX - 38} cy={femaleY} r="130" fill="url(#mc10_scentGlow)" />
          {[0, 1, 2, 3].map((idx) => {
            const cycle = ((frame * 0.018 + idx * 0.25) % 1);
            const r = lerp(26, 230, cycle);
            const op = (1 - cycle) * 0.78;
            return (
              <circle
                key={idx}
                cx={femaleX - 38}
                cy={femaleY}
                r={r}
                fill="none"
                stroke={idx % 2 === 0 ? '#ec4899' : '#a855f7'}
                strokeWidth="4.5"
                strokeDasharray="14 10"
                opacity={op}
              />
            );
          })}
        </g>
      ) : null}

      {/* Soft tandem motion path cue (step >= 1) */}
      {activeStep >= 1 ? (
        <path
          d="M 420 548 Q 840 520 1240 535 T 1690 495"
          fill="none"
          stroke="#d97706"
          strokeWidth="5"
          strokeDasharray="16 14"
          strokeLinecap="round"
          opacity="0.38"
        />
      ) : null}

      {/* Male wingless termite (follower) */}
      <WingedTermite
        x={maleX}
        y={maleY}
        scale={1.48}
        angleDeg={maleAngle}
        frame={frame}
        phase={1.3}
        wingsAttached={false}
      />

      {/* Female wingless termite (leader) */}
      <WingedTermite
        x={femaleX}
        y={femaleY}
        scale={1.55}
        angleDeg={femaleAngle}
        frame={frame}
        phase={0}
        wingsAttached={false}
      />

      {/* Role tag pills floating cleanly above the pair */}
      <g opacity={activeStep === 0 ? 1 : 0.88}>
        <rect x={femaleX - 48} y={femaleY - 108} width="96" height="36" rx="18" fill="#fdf2f8" stroke="#db2777" strokeWidth="3" />
        <text x={femaleX} y={femaleY - 83} textAnchor="middle" fill="#9d174d" fontSize="21" fontWeight="800" fontFamily={FONT}>
          Con cái
        </text>
        <rect x={maleX - 50} y={maleY - 108} width="100" height="36" rx="18" fill="#eff6ff" stroke="#2563eb" strokeWidth="3" />
        <text x={maleX} y={maleY - 83} textAnchor="middle" fill="#1e40af" fontSize="21" fontWeight="800" fontFamily={FONT}>
          Con đực
        </text>
      </g>

      {/* Female patient pause "..." cue in step 2 */}
      {showPauseCue ? (
        <g transform={`translate(${femaleX + 42}, ${femaleY - 148})`}>
          <rect x="-48" y="-28" width="96" height="50" rx="22" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
          <path d="M-12 22 L-22 36 L4 22 Z" fill="#ffffff" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="-20" cy="-3" r="5.5" fill={INK} opacity={0.4 + 0.6 * ((Math.sin(frame * 0.2) + 1) / 2)} />
          <circle cx="0" cy="-3" r="5.5" fill={INK} opacity={0.4 + 0.6 * ((Math.sin(frame * 0.2 - 1) + 1) / 2)} />
          <circle cx="20" cy="-3" r="5.5" fill={INK} opacity={0.4 + 0.6 * ((Math.sin(frame * 0.2 - 2) + 1) / 2)} />
        </g>
      ) : null}

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={128}
        text={topLabel}
        bg="#fffbeb"
        border="#d97706"
        color="#78350f"
        fontSize={29}
      />
    </svg>
  );
};

/* ============================================================================
 * 2. MoiCanhNewColonyWoodVisual (MOICANH_NEW_COLONY_WOOD)
 * Damp wooden doorframe crack -> sealed mud chamber & eggs -> years later hollowed beam colony
 * ============================================================================ */
export const MoiCanhNewColonyWoodVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = easeOutCubic(progress);

  const topLabel =
    activeStep === 0
      ? 'Chui vào khe gỗ ẩm'
      : activeStep === 1
      ? 'Bịt hang & đẻ lứa trứng đầu'
      : 'Tổ mối mới âm thầm lớn dần trong gỗ';

  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mc11_woodBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="50%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#5c280c" />
        </linearGradient>
        <radialGradient id="mc11_chamberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1c0a00" />
        </radialGradient>
        <linearGradient id="mc11_dampPatch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Shared underground soil cutaway backdrop */}
      <SoilCutawayBackdrop frame={frame} rainOnTop={activeStep === 0} humidityGlow={activeStep <= 1} />

      {/* STEP 0: Cross-section of damp wooden doorframe & cracked baseboard in dimly lit room */}
      {activeStep === 0 ? (
        <g>
          {/* Dim indoor room wall backdrop */}
          <rect x="0" y="0" width="1920" height="720" fill="#1e293b" opacity="0.88" />
          {/* Floor slab */}
          <rect x="0" y="700" width="1920" height="380" fill="#334155" stroke={INK} strokeWidth="5" />

          {/* Wooden doorframe cross-section */}
          <rect x="640" y="190" width="280" height="530" fill="url(#mc11_woodBeam)" stroke={INK} strokeWidth="6" />
          {/* Cracked wooden baseboard extending right */}
          <rect x="920" y="540" width="760" height="180" fill="url(#mc11_woodBeam)" stroke={INK} strokeWidth="6" />
          {/* Wood grain lines */}
          <g stroke="#451a03" strokeWidth="3.5" opacity="0.45">
            <line x1="700" y1="210" x2="700" y2="700" />
            <line x1="780" y1="210" x2="780" y2="700" />
            <line x1="855" y1="210" x2="855" y2="700" />
            <line x1="950" y1="590" x2="1650" y2="590" />
            <line x1="950" y1="655" x2="1650" y2="655" />
          </g>

          {/* Damp moisture stain around base of doorframe */}
          <ellipse cx="900" cy="655" rx="220" ry="95" fill="url(#mc11_dampPatch)" />
          {/* Subtle water droplets on damp wood */}
          {[
            { x: 750, y: 635 },
            { x: 830, y: 675 },
            { x: 1030, y: 615 },
          ].map((d, i) => (
            <path
              key={i}
              d={`M ${d.x} ${d.y - 12} Q ${d.x + 10} ${d.y + 4} ${d.x} ${d.y + 10} Q ${d.x - 10} ${d.y + 4} ${d.x} ${d.y - 12} Z`}
              fill="#38bdf8"
              opacity={0.7 + 0.25 * Math.sin(frame * 0.1 + i)}
            />
          ))}

          {/* Dark wood crack opening */}
          <path
            d="M 920 605 L 1065 612 L 1140 650 L 1060 688 L 920 676 Z"
            fill="#090706"
            stroke="#27180f"
            strokeWidth="4"
          />

          {/* Tandem termite pair crawling smoothly into the dark crack */}
          <WingedTermite
            x={lerp(740, 1020, p)}
            y={lerp(668, 646, p) + Math.sin(frame * 0.35) * 2}
            scale={1.15}
            angleDeg={-6}
            frame={frame}
            phase={0}
            wingsAttached={false}
          />
          <WingedTermite
            x={lerp(605, 895, p)}
            y={lerp(674, 654, p) + Math.sin(frame * 0.35 + 0.6) * 2}
            scale={1.12}
            angleDeg={-5}
            frame={frame}
            phase={1.1}
            wingsAttached={false}
          />

          <CleanLabel
            x={1320}
            y={475}
            text="Gỗ ẩm, nứt nẻ = nơi trú lý tưởng"
            bg="#e0f2fe"
            border="#0284c7"
            color="#0c4a6e"
            fontSize={24}
          />
        </g>
      ) : null}

      {/* STEP 1: Inside sealed cozy wood/soil chamber — mud pellets & pearlescent eggs */}
      {activeStep === 1 ? (
        <g>
          {/* Rich cross-section wooden/soil frame around chamber */}
          <rect x="200" y="205" width="1520" height="635" rx="34" fill="url(#mc11_woodBeam)" stroke={INK} strokeWidth="7" />
          {/* Wood texture rings */}
          <g stroke="#451a03" strokeWidth="4" opacity="0.38" fill="none">
            <path d="M 230 270 Q 960 220 1690 270" />
            <path d="M 230 785 Q 960 830 1690 785" />
          </g>

          {/* Left entrance tunnel */}
          <path d="M 200 490 L 580 490 L 580 590 L 200 590 Z" fill="#1c0a00" stroke="#451a03" strokeWidth="4" />

          {/* Mud pellets plugging the entrance smoothly */}
          {[
            { cx: 525, cy: 512, r: 22 },
            { cx: 540, cy: 545, r: 24 },
            { cx: 522, cy: 572, r: 21 },
            { cx: 486, cy: 524, r: 20 },
            { cx: 492, cy: 562, r: 22 },
            { cx: 454, cy: 542, r: 21 },
          ].map((pellet, i) => {
            const appear = clamp01((p - i * 0.08) * 3.5);
            return (
              <circle
                key={i}
                cx={pellet.cx}
                cy={pellet.cy}
                r={pellet.r * appear}
                fill="#a16207"
                stroke="#451a03"
                strokeWidth="3.5"
              />
            );
          })}

          {/* Cozy sealed nuptial chamber */}
          <ellipse
            cx="1040"
            cy="540"
            rx="460"
            ry="225"
            fill="url(#mc11_chamberGlow)"
            stroke="#b45309"
            strokeWidth="7"
          />

          {/* Neat cluster of tiny pearlescent eggs in the center */}
          <g transform="translate(1045, 595)">
            {[
              [-46, 10], [-24, 18], [0, 14], [26, 18], [48, 8],
              [-36, -4], [-12, 2], [14, -2], [38, -6],
              [-22, -16], [4, -18], [26, -15], [-6, -28], [14, -27],
            ].map(([ex, ey], idx) => {
              const eggScale = clamp01((p - 0.2 - idx * 0.03) * 3.5);
              return (
                <ellipse
                  key={idx}
                  cx={ex}
                  cy={ey}
                  rx={12 * eggScale}
                  ry={7.5 * eggScale}
                  transform={`rotate(${(idx % 3 - 1) * 18} ${ex} ${ey})`}
                  fill="#fef9c3"
                  stroke="#d97706"
                  strokeWidth="2.2"
                />
              );
            })}
          </g>

          {/* King & Queen tending the eggs */}
          <WingedTermite
            x={855 + Math.sin(frame * 0.08) * 8}
            y={540}
            scale={1.45}
            angleDeg={8}
            frame={frame}
            phase={0}
            wingsAttached={false}
          />
          <WingedTermite
            x={1235 - Math.sin(frame * 0.08) * 8}
            y={545}
            scale={1.38}
            angleDeg={172}
            frame={frame}
            phase={1.5}
            wingsAttached={false}
          />

          <CleanLabel
            x={475}
            y={435}
            text="Bịt kín bằng bùn"
            bg="#fef3c7"
            border="#b45309"
            color="#78350f"
            fontSize={22}
          />
          <CleanLabel
            x={1045}
            y={715}
            text="Lứa trứng đầu tiên"
            bg="#fef9c3"
            border="#ca8a04"
            color="#713f12"
            fontSize={22}
          />
        </g>
      ) : null}

      {/* STEP 2: Time-lapse cutaway ("Sau vài năm") — hollowed wooden beam with galleries, workers & new alates */}
      {activeStep === 2 ? (
        <g>
          {/* Large wooden beam cross-section */}
          <rect x="170" y="215" width="1580" height="625" rx="30" fill="url(#mc11_woodBeam)" stroke={INK} strokeWidth="7" />

          {/* Intricate hollowed-out branching galleries */}
          <g fill="#1c0a00" stroke="#451a03" strokeWidth="6" strokeLinejoin="round">
            {/* Central royal chamber */}
            <ellipse cx="960" cy="610" rx="220" ry="110" />
            {/* Left & right feeding tunnels */}
            <path d="M 270 360 Q 520 340 760 460 L 730 530 Q 490 420 270 430 Z" />
            <path d="M 260 660 Q 510 690 755 610 L 755 675 Q 500 760 260 725 Z" />
            <path d="M 1165 565 Q 1410 510 1650 610 L 1650 680 Q 1400 585 1165 635 Z" />
            {/* Upper staging chamber for new winged alates */}
            <ellipse cx="1360" cy="365" rx="260" ry="95" />
            <path d="M 1060 515 L 1220 425 L 1270 455 L 1110 545 Z" />
          </g>

          {/* Plump termite queen & egg pile in central chamber */}
          <g transform="translate(955, 615)">
            <ellipse cx="-20" cy="6" rx="95" ry="34" fill="#fde68a" stroke={INK} strokeWidth="4" />
            {[-60, -30, 0, 30].map((sx) => (
              <line key={sx} x1={sx} y1="-24" x2={sx} y2="36" stroke="#b45309" strokeWidth="3" opacity="0.65" />
            ))}
            <ellipse cx="86" cy="4" rx="26" ry="18" fill="#92400e" stroke={INK} strokeWidth="3.5" />
            <circle cx="114" cy="4" r="14" fill="#78350f" stroke={INK} strokeWidth="3.5" />
          </g>

          {/* Dozens of tiny animated worker termites scurrying through the galleries */}
          {[
            { x0: 310, y0: 392, x1: 690, y1: 488, spd: 0.008 },
            { x0: 360, y0: 405, x1: 650, y1: 472, spd: 0.0095 },
            { x0: 300, y0: 695, x1: 710, y1: 645, spd: 0.007 },
            { x0: 420, y0: 705, x1: 680, y1: 655, spd: 0.01 },
            { x0: 1200, y0: 605, x1: 1590, y1: 642, spd: 0.0085 },
            { x0: 1240, y0: 590, x1: 1540, y1: 625, spd: 0.0065 },
            { x0: 780, y0: 615, x1: 860, y1: 615, spd: 0.012 },
            { x0: 1080, y0: 625, x1: 1150, y1: 605, spd: 0.011 },
          ].map((t, idx) => {
            const cycle = (frame * t.spd + idx * 0.23) % 2;
            const u = cycle <= 1 ? cycle : 2 - cycle;
            const wx = lerp(t.x0, t.x1, u);
            const wy = lerp(t.y0, t.y1, u);
            return (
              <g key={idx} transform={`translate(${wx}, ${wy})`}>
                <ellipse cx="0" cy="0" rx="14" ry="7" fill="#fef3c7" stroke={INK} strokeWidth="2.2" />
                <circle cx={cycle <= 1 ? 12 : -12} cy="0" r="6" fill="#d97706" stroke={INK} strokeWidth="2" />
              </g>
            );
          })}

          {/* New batch of winged alates ready to swarm in upper chamber */}
          {[
            { x: 1240, y: 365, a: -12 },
            { x: 1365, y: 345, a: -6 },
            { x: 1490, y: 375, a: -15 },
          ].map((al, i) => (
            <WingedTermite
              key={i}
              x={al.x}
              y={al.y}
              scale={0.78}
              angleDeg={al.a}
              frame={frame}
              phase={i * 1.4}
              wingsAttached={true}
            />
          ))}

          {/* Time-lapse badge */}
          <CleanLabel
            x={1560}
            y={235}
            text="Sau vài năm"
            bg="#fee2e2"
            border="#dc2626"
            color="#991b1b"
            fontSize={26}
          />
          <CleanLabel
            x={1360}
            y={480}
            text="Lứa mối cánh mới chờ bay"
            bg="#fef3c7"
            border="#d97706"
            color="#78350f"
            fontSize={22}
          />
          <CleanLabel
            x={490}
            y={290}
            text="Đường hầm đục rỗng gỗ"
            bg="#ffffff"
            border={INK}
            color={INK}
            fontSize={22}
          />
        </g>
      ) : null}

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={128}
        text={topLabel}
        bg="#fffbeb"
        border="#b45309"
        color="#78350f"
        fontSize={29}
      />
    </svg>
  );
};

/* ============================================================================
 * 3. MoiCanhTermiteVsAntVisual (MOICANH_TERMITE_VS_ANT)
 * Clean side-by-side scientific comparison board: Mối cánh (left) vs Kiến cánh (right)
 * ============================================================================ */
export const MoiCanhTermiteVsAntVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  // Non-resetting progressive reveal for left & right callouts
  const leftCallout1 = activeStep === 0 ? 0 : activeStep === 1 ? easeOutCubic(clamp01(progress * 2.5)) : 1;
  const leftCallout2 = activeStep === 0 ? 0 : activeStep === 1 ? easeOutCubic(clamp01((progress - 0.3) * 2.5)) : 1;
  const leftCallout3 = activeStep === 0 ? 0 : activeStep === 1 ? easeOutCubic(clamp01((progress - 0.6) * 2.5)) : 1;

  const rightCallout1 = activeStep < 2 ? 0 : easeOutCubic(clamp01(progress * 2.5));
  const rightCallout2 = activeStep < 2 ? 0 : easeOutCubic(clamp01((progress - 0.3) * 2.5));
  const rightCallout3 = activeStep < 2 ? 0 : easeOutCubic(clamp01((progress - 0.6) * 2.5));

  const wingShimmer = Math.sin(frame * 0.12) * 1.8;

  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mc12_leftPanel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="mc12_rightPanel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>

      {/* Split scientific comparison board */}
      <rect x="0" y="0" width="960" height="1080" fill="url(#mc12_leftPanel)" />
      <rect x="960" y="0" width="960" height="1080" fill="url(#mc12_rightPanel)" />

      {/* Center vertical divider */}
      <line x1="960" y1="185" x2="960" y2="855" stroke="#94a3b8" strokeWidth="5" strokeDasharray="14 12" />
      <circle cx="960" cy="520" r="34" fill="#ffffff" stroke={INK} strokeWidth="4.5" />
      <text x="960" y="531" textAnchor="middle" fill={INK} fontSize="26" fontWeight="900" fontFamily={FONT}>
        VS
      </text>

      {/* Top main heading */}
      <CleanLabel
        x={960}
        y={116}
        text="Phân biệt nhanh Mối cánh & Kiến cánh"
        bg="#ffffff"
        border={INK}
        color={INK}
        fontSize={29}
      />

      {/* Column headers */}
      <CleanLabel
        x={480}
        y={202}
        text="Mối cánh"
        bg="#fef08a"
        border="#b45309"
        color="#78350f"
        fontSize={30}
      />
      <CleanLabel
        x={1440}
        y={202}
        text="Kiến cánh"
        bg="#bae6fd"
        border="#0369a1"
        color="#0c4a6e"
        fontSize={30}
      />

      {/* ================= LEFT SPECIMEN: MỐI CÁNH (x = 480, y = 525) ================= */}
      <g transform="translate(480, 525)">
        {/* Subtle focus backdrop circle */}
        <circle
          cx="0"
          cy="0"
          r="215"
          fill="#ffffff"
          fillOpacity={activeStep === 1 ? 0.72 : 0.45}
          stroke={activeStep === 1 ? '#d97706' : '#fcd34d'}
          strokeWidth={activeStep === 1 ? 6 : 3}
        />

        {/* 6 legs */}
        <g stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M-28 -52 L-72 -78 L-96 -62" />
          <path d="M28 -52 L72 -78 L96 -62" />
          <path d="M-34 -10 L-88 -12 L-112 14" />
          <path d="M34 -10 L88 -12 L112 14" />
          <path d="M-34 32 L-82 58 L-102 96" />
          <path d="M34 32 L82 58 L102 96" />
        </g>

        {/* 2 PAIRS OF EQUAL-LENGTH WINGS */}
        <g transform={`rotate(${wingShimmer})`}>
          {/* Hind wings (exact same length as front wings) */}
          <ellipse cx="-82" cy="86" rx="34" ry="138" transform="rotate(24 -82 86)" fill="#ffffff" fillOpacity="0.62" stroke="#92400e" strokeWidth="3.5" />
          <ellipse cx="82" cy="86" rx="34" ry="138" transform="rotate(-24 82 86)" fill="#ffffff" fillOpacity="0.62" stroke="#92400e" strokeWidth="3.5" />
          {/* Fore wings (equal length) */}
          <ellipse cx="-96" cy="54" rx="35" ry="138" transform="rotate(34 -96 54)" fill="#fef9c3" fillOpacity="0.7" stroke="#78350f" strokeWidth="3.8" />
          <ellipse cx="96" cy="54" rx="35" ry="138" transform="rotate(-34 96 54)" fill="#fef9c3" fillOpacity="0.7" stroke="#78350f" strokeWidth="3.8" />
          {/* Wing veins */}
          <line x1="-22" y1="-22" x2="-155" y2="145" stroke="#b45309" strokeWidth="2.5" opacity="0.55" />
          <line x1="22" y1="-22" x2="155" y2="145" stroke="#b45309" strokeWidth="2.5" opacity="0.55" />
        </g>

        {/* STRAIGHT THICK WAIST & SEGMENTED BODY */}
        <rect x="-38" y="-64" width="76" height="205" rx="36" fill="#92400e" stroke={INK} strokeWidth="5" />
        {/* Abdomen segments */}
        {[-12, 22, 56, 90].map((sy) => (
          <path key={sy} d={`M-34 ${sy} Q0 ${sy + 10} 34 ${sy}`} fill="none" stroke="#451a03" strokeWidth="3.5" opacity="0.7" />
        ))}
        {/* Thorax collar */}
        <ellipse cx="0" cy="-64" rx="36" ry="26" fill="#78350f" stroke={INK} strokeWidth="4.5" />
        {/* Head */}
        <circle cx="0" cy="-108" r="32" fill="#78350f" stroke={INK} strokeWidth="5" />
        <circle cx="-18" cy="-114" r="6" fill={INK} />
        <circle cx="18" cy="-114" r="6" fill={INK} />

        {/* STRAIGHT BEADED ANTENNAE */}
        <g fill="#78350f" stroke={INK} strokeWidth="2.5">
          {[0, 1, 2, 3, 4, 5].map((b) => (
            <React.Fragment key={b}>
              <circle cx={-16 - b * 8} cy={-136 - b * 12} r="5.5" />
              <circle cx={16 + b * 8} cy={-136 - b * 12} r="5.5" />
            </React.Fragment>
          ))}
        </g>
      </g>

      {/* LEFT CALLOUTS (step >= 1) */}
      {leftCallout1 > 0.01 ? (
        <g opacity={leftCallout1}>
          <circle cx="430" cy="355" r="36" fill="none" stroke="#dc2626" strokeWidth="4.5" strokeDasharray="8 6" />
          <line x1="396" y1="340" x2="265" y2="305" stroke="#dc2626" strokeWidth="4" />
          <CleanLabel x={178} y={295} text="Râu thẳng" bg="#ffffff" border="#dc2626" color="#991b1b" fontSize={24} />
        </g>
      ) : null}
      {leftCallout2 > 0.01 ? (
        <g opacity={leftCallout2}>
          <ellipse cx="480" cy="512" rx="52" ry="34" fill="none" stroke="#d97706" strokeWidth="4.5" strokeDasharray="8 6" />
          <line x1="428" y1="512" x2="265" y2="512" stroke="#d97706" strokeWidth="4" />
          <CleanLabel x={178} y={512} text="Eo thẳng" bg="#ffffff" border="#d97706" color="#92400e" fontSize={24} />
        </g>
      ) : null}
      {leftCallout3 > 0.01 ? (
        <g opacity={leftCallout3}>
          <circle cx="605" cy="692" r="40" fill="none" stroke="#16a34a" strokeWidth="4.5" strokeDasharray="8 6" />
          <line x1="585" y1="726" x2="520" y2="778" stroke="#16a34a" strokeWidth="4" />
          <CleanLabel x={480} y={808} text="2 cặp cánh bằng nhau" bg="#dcfce7" border="#16a34a" color="#14532d" fontSize={25} />
        </g>
      ) : null}

      {/* ================= RIGHT SPECIMEN: KIẾN CÁNH (x = 1440, y = 525) ================= */}
      <g transform="translate(1440, 525)">
        {/* Subtle focus backdrop circle */}
        <circle
          cx="0"
          cy="0"
          r="215"
          fill="#ffffff"
          fillOpacity={activeStep === 2 ? 0.72 : 0.45}
          stroke={activeStep === 2 ? '#0284c7' : '#bae6fd'}
          strokeWidth={activeStep === 2 ? 6 : 3}
        />

        {/* 6 legs */}
        <g stroke="#1e293b" strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M-24 -56 L-76 -84 L-100 -64" />
          <path d="M24 -56 L76 -84 L100 -64" />
          <path d="M-26 -24 L-90 -24 L-116 6" />
          <path d="M26 -24 L90 -24 L116 6" />
          <path d="M-24 12 L-86 52 L-108 98" />
          <path d="M24 12 L86 52 L108 98" />
        </g>

        {/* UNEQUAL WINGS: Front wings noticeably LONGER than hind wings */}
        <g transform={`rotate(${-wingShimmer})`}>
          {/* Shorter hind wings */}
          <ellipse cx="-66" cy="48" rx="22" ry="74" transform="rotate(24 -66 48)" fill="#e0f2fe" fillOpacity="0.65" stroke="#0369a1" strokeWidth="3.5" />
          <ellipse cx="66" cy="48" rx="22" ry="74" transform="rotate(-24 66 48)" fill="#e0f2fe" fillOpacity="0.65" stroke="#0369a1" strokeWidth="3.5" />
          {/* Much longer fore wings */}
          <ellipse cx="-102" cy="46" rx="38" ry="148" transform="rotate(34 -102 46)" fill="#ffffff" fillOpacity="0.72" stroke="#0f172a" strokeWidth="3.8" />
          <ellipse cx="102" cy="46" rx="38" ry="148" transform="rotate(-34 102 46)" fill="#ffffff" fillOpacity="0.72" stroke="#0f172a" strokeWidth="3.8" />
          <line x1="-20" y1="-34" x2="-165" y2="148" stroke="#334155" strokeWidth="2.5" opacity="0.55" />
          <line x1="20" y1="-34" x2="165" y2="148" stroke="#334155" strokeWidth="2.5" opacity="0.55" />
        </g>

        {/* PINCHED NARROW WASP-LIKE WAIST */}
        {/* Gaster (abdomen) */}
        <ellipse cx="0" cy="84" rx="44" ry="64" fill="#334155" stroke={INK} strokeWidth="5" />
        <path d="M-38 72 Q0 82 38 72 M-34 104 Q0 114 34 104" fill="none" stroke="#0f172a" strokeWidth="3.5" opacity="0.6" />
        {/* Narrow petiole (pinched waist) */}
        <rect x="-11" y="-8" width="22" height="32" rx="9" fill="#1e293b" stroke={INK} strokeWidth="4" />
        {/* Thorax */}
        <ellipse cx="0" cy="-46" rx="32" ry="38" fill="#334155" stroke={INK} strokeWidth="5" />
        {/* Head */}
        <ellipse cx="0" cy="-108" rx="30" ry="26" fill="#1e293b" stroke={INK} strokeWidth="5" />
        <circle cx="-17" cy="-112" r="6" fill="#f8fafc" />
        <circle cx="17" cy="-112" r="6" fill="#f8fafc" />

        {/* ELBOWED / BENT ANTENNAE */}
        <g fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-14 -130 L-38 -174 L-84 -158" />
          <path d="M14 -130 L38 -174 L84 -158" />
        </g>
      </g>

      {/* RIGHT CALLOUTS (step >= 2) */}
      {rightCallout1 > 0.01 ? (
        <g opacity={rightCallout1}>
          <circle cx="1498" cy="356" r="36" fill="none" stroke="#dc2626" strokeWidth="4.5" strokeDasharray="8 6" />
          <line x1="1532" y1="342" x2="1645" y2="305" stroke="#dc2626" strokeWidth="4" />
          <CleanLabel x={1736} y={295} text="Râu gập khuỷu" bg="#ffffff" border="#dc2626" color="#991b1b" fontSize={23} />
        </g>
      ) : null}
      {rightCallout2 > 0.01 ? (
        <g opacity={rightCallout2}>
          <circle cx="1440" cy="532" r="34" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeDasharray="8 6" />
          <line x1="1474" y1="532" x2="1645" y2="532" stroke="#0284c7" strokeWidth="4" />
          <CleanLabel x={1738} y={532} text="Eo thắt nhỏ" bg="#ffffff" border="#0284c7" color="#0c4a6e" fontSize={24} />
        </g>
      ) : null}
      {rightCallout3 > 0.01 ? (
        <g opacity={rightCallout3}>
          <circle cx="1565" cy="672" r="42" fill="none" stroke="#7c3aed" strokeWidth="4.5" strokeDasharray="8 6" />
          <line x1="1540" y1="712" x2="1485" y2="778" stroke="#7c3aed" strokeWidth="4" />
          <CleanLabel x={1440} y={808} text="Cánh trước dài hơn" bg="#ede9fe" border="#7c3aed" color="#4c1d95" fontSize={25} />
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================================
 * 4. MoiCanhTipTurnOffLightsVisual (MOICANH_TIP_TURN_OFF_LIGHTS)
 * Step 0: Flip white porch light switch OFF -> Step 1: Close window mesh & draw curtains -> Step 2: Termites disperse
 * ============================================================================ */
export const MoiCanhTipTurnOffLightsVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = easeOutCubic(progress);

  const switchFlipped = activeStep > 0 || progress > 0.48;

  const topLabel =
    activeStep === 0
      ? 'Mẹo 1: Tắt đèn trắng'
      : activeStep === 1
      ? 'Đóng cửa & kéo rèm'
      : 'Đàn mối tự tản đi';

  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mc13_curtain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="50%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <pattern id="mc13_meshPattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.55" />
        </pattern>
      </defs>

      {/* STEP 0: Porch with bright white lamp -> Stickman flips wall switch OFF */}
      {activeStep === 0 ? (
        <g>
          <PorchNightBackdrop
            frame={frame}
            lampOn={!switchFlipped}
            lampColor="WHITE"
            rainIntensity={0.22}
            showClouds={true}
          />

          {/* Swarming termites around porch lamp; they begin drifting away once light clicks off */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const ang = frame * 0.065 + i * 0.9;
            const driftOut = switchFlipped ? clamp01((progress - 0.48) * 2.2) : 0;
            const radX = lerp(130 + (i % 3) * 35, 420 + i * 35, driftOut);
            const radY = lerp(75 + (i % 2) * 25, 210 + i * 20, driftOut);
            const tx = 960 + Math.cos(ang) * radX;
            const ty = 290 + Math.sin(ang) * radY;
            return (
              <WingedTermite
                key={i}
                x={tx}
                y={ty}
                scale={0.74}
                angleDeg={(ang * 180) / Math.PI + 90}
                frame={frame}
                phase={i * 0.8}
                wingsAttached={true}
              />
            );
          })}

          {/* Wall switch inset on right wall */}
          <g transform="translate(1415, 465)">
            <rect x="-56" y="-74" width="112" height="148" rx="18" fill="#f8fafc" stroke={INK} strokeWidth="5" />
            <rect x="-24" y="-36" width="48" height="72" rx="8" fill="#e2e8f0" stroke={INK} strokeWidth="4" />
            {/* Switch rocker */}
            <rect
              x="-18"
              y={switchFlipped ? 2 : -30}
              width="36"
              height="28"
              rx="5"
              fill={switchFlipped ? '#ef4444' : '#22c55e'}
              stroke={INK}
              strokeWidth="3"
            />
            <text
              x="0"
              y="60"
              textAnchor="middle"
              fill={switchFlipped ? '#dc2626' : '#15803d'}
              fontSize="20"
              fontWeight="800"
              fontFamily={FONT}
            >
              {switchFlipped ? 'OFF' : 'ON'}
            </text>
          </g>

          {/* Click sound cue when flipped */}
          {switchFlipped ? (
            <g transform="translate(1330, 390)" opacity={clamp01((progress - 0.48) * 4)}>
              <rect x="-58" y="-26" width="116" height="46" rx="16" fill="#fef08a" stroke={INK} strokeWidth="3.5" />
              <text x="0" y="6" textAnchor="middle" fill={INK} fontSize="24" fontWeight="900" fontFamily={FONT}>
                TÁCH!
              </text>
            </g>
          ) : null}

          {/* Boy reaching to flip the switch */}
          <SharedStickman
            x={1560}
            y={715}
            scale={1.1}
            role="BOY"
            facing="LEFT"
            pose="REACH_SWITCH"
            expression={switchFlipped ? 'HAPPY' : 'CURIOUS'}
            frame={frame}
          />
        </g>
      ) : null}

      {/* STEP 1: Window & mesh screen sliding shut, curtains drawn tight blocking light rays */}
      {activeStep === 1 ? (
        <g>
          {/* Cozy indoor wall */}
          <rect x="0" y="0" width="1920" height="1080" fill="#fef3c7" />
          {/* Window opening revealing dark rainy night outside */}
          <rect x="340" y="210" width="1240" height="600" rx="14" fill="#0f172a" stroke="#78350f" strokeWidth="18" />

          {/* Night stars / raindrops outside window */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const rx = 420 + i * 145;
            const ry = 240 + ((frame * 7 + i * 95) % 520);
            return (
              <line
                key={i}
                x1={rx}
                y1={ry}
                x2={rx - 10}
                y2={ry + 32}
                stroke="#93c5fd"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.55"
              />
            );
          })}

          {/* Sliding fine-mesh insect screen */}
          {(() => {
            const screenSlide = easeOutCubic(clamp01(progress * 1.9));
            const sx = lerp(1580, 349, screenSlide);
            return (
              <g>
                <rect
                  x={sx}
                  y="219"
                  width={Math.max(0, 1571 - sx)}
                  height="582"
                  fill="url(#mc13_meshPattern)"
                  stroke="#94a3b8"
                  strokeWidth="6"
                />
              </g>
            );
          })()}

          {/* Thick warm curtains drawing smoothly from both sides */}
          {(() => {
            const curtainClose = easeInOutCubic(clamp01((progress - 0.35) * 1.65));
            const curtainW = lerp(120, 622, curtainClose);
            return (
              <g>
                {/* Curtain rod */}
                <rect x="280" y="186" width="1360" height="22" rx="11" fill="#78350f" stroke={INK} strokeWidth="4" />
                {/* Left curtain */}
                <rect x="340" y="208" width={curtainW} height="620" fill="url(#mc13_curtain)" stroke={INK} strokeWidth="5" />
                {/* Right curtain */}
                <rect x={1580 - curtainW} y="208" width={curtainW} height="620" fill="url(#mc13_curtain)" stroke={INK} strokeWidth="5" />
                {/* Curtain vertical pleats */}
                {curtainW > 200 ? (
                  <g stroke="#7c2d12" strokeWidth="4" opacity="0.55">
                    <line x1={340 + curtainW * 0.33} y1="215" x2={340 + curtainW * 0.33} y2="820" />
                    <line x1={340 + curtainW * 0.66} y1="215" x2={340 + curtainW * 0.66} y2="820" />
                    <line x1={1580 - curtainW * 0.33} y1="215" x2={1580 - curtainW * 0.33} y2="820" />
                    <line x1={1580 - curtainW * 0.66} y1="215" x2={1580 - curtainW * 0.66} y2="820" />
                  </g>
                ) : null}
              </g>
            );
          })()}

          {/* Shield badge confirming no indoor light leaks */}
          {progress > 0.78 ? (
            <CleanLabel
              x={960}
              y={520}
              text="Chặn ánh sáng lọt ra ngoài"
              bg="#dcfce7"
              border="#16a34a"
              color="#14532d"
              fontSize={28}
            />
          ) : null}
        </g>
      ) : null}

      {/* STEP 2: Darkened peaceful porch — remaining termites disperse outward into dark garden */}
      {activeStep === 2 ? (
        <g>
          <PorchNightBackdrop
            frame={frame}
            lampOn={false}
            lampColor="YELLOW"
            rainIntensity={0.2}
            showClouds={true}
          />

          {/* Termites dispersing smoothly left & right away from dark porch */}
          {[
            { sx: 880, sy: 340, ex: 110, ey: 250, ang: 195 },
            { sx: 940, sy: 380, ex: 180, ey: 470, ang: 170 },
            { sx: 910, sy: 440, ex: 240, ey: 620, ang: 155 },
            { sx: 1020, sy: 350, ex: 1810, ey: 240, ang: -15 },
            { sx: 1050, sy: 410, ex: 1740, ey: 490, ang: 10 },
            { sx: 990, sy: 460, ex: 1690, ey: 640, ang: 24 },
          ].map((t, i) => {
            const tx = lerp(t.sx, t.ex, p);
            const ty = lerp(t.sy, t.ey, p) + Math.sin(frame * 0.2 + i) * 10;
            return (
              <g key={i} opacity={clamp01(1.15 - p * 0.85)}>
                <WingedTermite
                  x={tx}
                  y={ty}
                  scale={0.78}
                  angleDeg={t.ang}
                  frame={frame}
                  phase={i * 1.1}
                  wingsAttached={true}
                />
              </g>
            );
          })}

          {/* Peaceful checkmark badge on the calm porch */}
          <CleanLabel
            x={960}
            y={540}
            text="Hiên nhà tối mát — mối tự bay ra vườn"
            bg="#dcfce7"
            border="#16a34a"
            color="#14532d"
            fontSize={27}
          />
        </g>
      ) : null}

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={128}
        text={topLabel}
        bg="#f0fdf4"
        border="#16a34a"
        color="#14532d"
        fontSize={29}
      />
    </svg>
  );
};

/* ============================================================================
 * 5. MoiCanhTipWaterBasinTrapVisual (MOICANH_TIP_WATER_BASIN_TRAP)
 * Step 0: 1 low lamp ON -> Step 1: Blue water basin + dish soap drops -> Step 2: Light reflection traps termites
 * ============================================================================ */
export const MoiCanhTipWaterBasinTrapVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = easeOutCubic(progress);

  const basinAlpha = activeStep === 0 ? 0 : activeStep === 1 ? easeOutCubic(clamp01(progress * 2.2)) : 1;
  const soapBottleAlpha = activeStep === 1 ? clamp01(Math.sin(progress * Math.PI) * 1.8) : 0;

  const topLabel =
    activeStep === 0
      ? 'Mẹo 2: Chỉ bật 1 đèn thấp'
      : activeStep === 1
      ? 'Chậu nước + vài giọt nước rửa chén'
      : 'Gom gọn, không cần hóa chất';

  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mc14_roomBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="72%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="mc14_lightCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.58" />
          <stop offset="65%" stopColor="#fde047" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id="mc14_waterReflect" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Dim room interior */}
      <rect x="0" y="0" width="1920" height="1080" fill="url(#mc14_roomBg)" />
      {/* Floor surface */}
      <rect x="0" y="725" width="1920" height="355" fill="#475569" stroke={INK} strokeWidth="5" />

      {/* Ceiling light fixtures clearly OFF */}
      <g transform="translate(460, 70)" opacity="0.6">
        <rect x="-85" y="0" width="170" height="22" rx="10" fill="#64748b" stroke={INK} strokeWidth="3.5" />
        <text x="0" y="50" textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="700" fontFamily={FONT}>
          Đèn trần: TẮT
        </text>
      </g>
      <g transform="translate(1460, 70)" opacity="0.6">
        <rect x="-85" y="0" width="170" height="22" rx="10" fill="#64748b" stroke={INK} strokeWidth="3.5" />
        <text x="0" y="50" textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="700" fontFamily={FONT}>
          Đèn trần: TẮT
        </text>
      </g>

      {/* Low hanging lamp at x = 960, y = 340 */}
      <line x1="960" y1="0" x2="960" y2="285" stroke="#94a3b8" strokeWidth="6" />
      {/* Warm light cone downward */}
      <polygon points="890,348 1030,348 1245,745 675,745" fill="url(#mc14_lightCone)" />
      {/* Lamp shade */}
      <path d="M 885 348 Q 960 265 1035 348 Z" fill="#f59e0b" stroke={INK} strokeWidth="5" />
      {/* Warm glowing bulb */}
      <circle cx="960" cy="356" r="24" fill="#fef08a" stroke="#eab308" strokeWidth="4" />

      {/* Blue plastic water basin underneath (x = 960, y = 700) */}
      {basinAlpha > 0.01 ? (
        <g opacity={basinAlpha}>
          {/* Basin outer body */}
          <path
            d="M 710 685 L 755 795 Q 960 830 1165 795 L 1210 685 Z"
            fill="#2563eb"
            stroke={INK}
            strokeWidth="5.5"
          />
          {/* Basin rim */}
          <ellipse cx="960" cy="685" rx="250" ry="62" fill="#3b82f6" stroke={INK} strokeWidth="5.5" />
          {/* Water surface with glowing light reflection */}
          <ellipse
            cx="960"
            cy="690"
            rx="226"
            ry="50"
            fill={activeStep >= 2 ? 'url(#mc14_waterReflect)' : '#38bdf8'}
            stroke="#0284c7"
            strokeWidth="3"
          />
          {/* Gentle animated water ripples */}
          {[0, 1, 2].map((rIdx) => {
            const cyc = (frame * 0.022 + rIdx * 0.33) % 1;
            return (
              <ellipse
                key={rIdx}
                cx={960 + (rIdx - 1) * 45}
                cy={692 + (rIdx % 2) * 6}
                rx={lerp(18, 125, cyc)}
                ry={lerp(5, 28, cyc)}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                opacity={(1 - cyc) * 0.65}
              />
            );
          })}
        </g>
      ) : null}

      {/* Dish-soap bottle squeezing 3 green drops into water (step 1) */}
      {soapBottleAlpha > 0.01 ? (
        <g opacity={soapBottleAlpha}>
          <g transform="translate(1225, 520) rotate(-42)">
            <rect x="-36" y="-70" width="72" height="128" rx="22" fill="#22c55e" stroke={INK} strokeWidth="4.5" />
            <rect x="-14" y="-96" width="28" height="28" rx="6" fill="#fef08a" stroke={INK} strokeWidth="4" />
            <path d="M-8 -96 L0 -116 L8 -96 Z" fill="#fef08a" stroke={INK} strokeWidth="3.5" />
            <rect x="-24" y="-28" width="48" height="44" rx="8" fill="#ffffff" opacity="0.9" />
            <text x="0" y="2" textAnchor="middle" fill="#15803d" fontSize="15" fontWeight="800" fontFamily={FONT}>
              SOAP
            </text>
          </g>
          {/* 3 falling green dish-soap drops */}
          {[0, 1, 2].map((d) => {
            const dropCycle = (frame * 0.035 + d * 0.33) % 1;
            const dx = lerp(1110, 1020, dropCycle);
            const dy = lerp(550, 685, dropCycle * dropCycle);
            return (
              <path
                key={d}
                d={`M ${dx} ${dy - 12} Q ${dx + 10} ${dy + 4} ${dx} ${dy + 11} Q ${dx - 10} ${dy + 4} ${dx} ${dy - 12} Z`}
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="2.5"
              />
            );
          })}
        </g>
      ) : null}

      {/* Termites: step 0/1 circling the low lamp; step 2 spiraling gently down into water reflection */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        if (activeStep < 2) {
          const ang = frame * 0.06 + i * 0.92;
          const gather = activeStep === 0 ? p : 1;
          const radX = lerp(360 + i * 35, 115 + (i % 3) * 32, gather);
          const radY = lerp(170 + i * 18, 62 + (i % 2) * 24, gather);
          const tx = 960 + Math.cos(ang) * radX;
          const ty = 405 + Math.sin(ang) * radY;
          return (
            <WingedTermite
              key={i}
              x={tx}
              y={ty}
              scale={0.72}
              angleDeg={(ang * 180) / Math.PI + 90}
              frame={frame}
              phase={i * 0.7}
              wingsAttached={true}
            />
          );
        } else {
          // Step 2: dip down into glowing water reflection & settle cleanly inside basin
          const stagger = clamp01((progress - i * 0.09) * 1.85);
          const ang = frame * 0.075 + i * 0.92;
          const spiralR = lerp(135, 22 + (i % 3) * 38, stagger);
          const tx = 960 + Math.cos(ang) * spiralR;
          const ty = lerp(410, 688 + ((i % 3) - 1) * 12, easeInOutCubic(stagger));
          return (
            <WingedTermite
              key={i}
              x={tx}
              y={ty}
              scale={lerp(0.72, 0.56, stagger)}
              angleDeg={stagger > 0.85 ? (i * 47) % 360 : (ang * 180) / Math.PI + 90}
              frame={frame}
              phase={i * 0.7}
              wingsAttached={true}
            />
          );
        }
      })}

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={128}
        text={topLabel}
        bg="#e0f2fe"
        border="#0284c7"
        color="#0c4a6e"
        fontSize={29}
      />
    </svg>
  );
};

/* ============================================================================
 * 6. MoiCanhTipWoodMoistureVisual (MOICANH_TIP_WOOD_MOISTURE)
 * Step 0: Dry raised wooden cabinet + airflow + green hygrometer
 * Step 1: Caulking nozzle sealing baseboard/doorframe crack
 * Step 2: Hovering checklist shield icon: "Gỗ khô + Khe kín = Không có tổ mối"
 * ============================================================================ */
export const MoiCanhTipWoodMoistureVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = easeOutCubic(progress);

  const flowDash = -(frame * 3.5) % 44;

  const topLabel =
    activeStep === 0
      ? 'Mẹo 3: Giữ đồ gỗ khô thoáng'
      : activeStep === 1
      ? 'Trám kín khe nứt tường & gỗ'
      : 'Mẹo 3: Ngăn mối lập tổ lâu dài';

  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mc15_wallBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="mc15_cabinetWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="mc15_shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>

      {/* Clean bright home room backdrop */}
      <rect x="0" y="0" width="1920" height="720" fill="url(#mc15_wallBg)" />
      <rect x="0" y="720" width="1920" height="360" fill="#e2e8f0" stroke={INK} strokeWidth="5" />

      {/* STEP 0: Dry wooden cabinet raised on dry feet + airflow lines + green hygrometer */}
      {activeStep === 0 ? (
        <g>
          {/* Dry floor tile lines */}
          <g stroke="#cbd5e1" strokeWidth="3">
            {[280, 560, 840, 1120, 1400, 1680].map((lx) => (
              <line key={lx} x1={lx} y1="720" x2={lx - 90} y2="1080" />
            ))}
          </g>

          {/* Wooden cabinet raised cleanly on dry feet */}
          <g transform="translate(310, 320)">
            {/* Dry cabinet feet creating clear air gap */}
            <rect x="44" y="340" width="32" height="62" rx="6" fill="#78350f" stroke={INK} strokeWidth="4.5" />
            <rect x="444" y="340" width="32" height="62" rx="6" fill="#78350f" stroke={INK} strokeWidth="4.5" />
            {/* Cabinet main body */}
            <rect x="0" y="0" width="520" height="345" rx="18" fill="url(#mc15_cabinetWood)" stroke={INK} strokeWidth="6" />
            {/* Cabinet doors */}
            <rect x="24" y="24" width="224" height="296" rx="10" fill="#f59e0b" stroke="#78350f" strokeWidth="4" />
            <rect x="272" y="24" width="224" height="296" rx="10" fill="#f59e0b" stroke="#78350f" strokeWidth="4" />
            {/* Handles */}
            <circle cx="222" cy="172" r="10" fill="#fef3c7" stroke={INK} strokeWidth="3.5" />
            <circle cx="298" cy="172" r="10" fill="#fef3c7" stroke={INK} strokeWidth="3.5" />
          </g>

          {/* Gentle cyan airflow lines sweeping underneath & around cabinet */}
          <g fill="none" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" strokeDasharray="28 16" strokeDashoffset={flowDash}>
            <path d="M 180 692 Q 560 680 960 695" />
            <path d="M 220 440 Q 255 340 315 280" />
            <path d="M 850 380 Q 920 330 1000 350" />
          </g>
          <CleanLabel x={570} y={770} text="Chân tủ kê cao, thoáng khí" bg="#e0f2fe" border="#0284c7" color="#0c4a6e" fontSize={23} />

          {/* Wall-mounted Hygrometer in GREEN zone */}
          <g transform="translate(1355, 455)">
            <circle cx="0" cy="0" r="158" fill="#ffffff" stroke={INK} strokeWidth="6.5" />
            {/* Color zones arc */}
            <path d="M -112 45 A 120 120 0 0 1 -55 -106" fill="none" stroke="#f59e0b" strokeWidth="22" strokeLinecap="round" />
            <path d="M -45 -111 A 120 120 0 0 1 65 -100" fill="none" stroke="#22c55e" strokeWidth="24" strokeLinecap="round" />
            <path d="M 75 -92 A 120 120 0 0 1 112 45" fill="none" stroke="#ef4444" strokeWidth="22" strokeLinecap="round" />

            {/* Needle settling smoothly into green dry zone */}
            {(() => {
              const needleDeg = lerp(52, 6, p) + Math.sin(frame * 0.08) * 2;
              return (
                <g transform={`rotate(${needleDeg})`}>
                  <line x1="0" y1="16" x2="0" y2="-96" stroke={INK} strokeWidth="7" strokeLinecap="round" />
                  <circle cx="0" cy="0" r="14" fill="#16a34a" stroke={INK} strokeWidth="4" />
                </g>
              );
            })()}
            <text x="0" y="68" textAnchor="middle" fill="#15803d" fontSize="28" fontWeight="900" fontFamily={FONT}>
              50% RH
            </text>
            <text x="0" y="102" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="700" fontFamily={FONT}>
              Độ ẩm lý tưởng
            </text>
          </g>
        </g>
      ) : null}

      {/* STEP 1: Close-up of caulking/sealant nozzle smoothly sealing crack along wooden baseboard & doorframe */}
      {activeStep === 1 ? (
        <g>
          {/* Close-up wooden doorframe (left) & baseboard (bottom) */}
          <rect x="240" y="210" width="380" height="580" fill="url(#mc15_cabinetWood)" stroke={INK} strokeWidth="6" />
          <rect x="620" y="555" width="1040" height="235" fill="#b45309" stroke={INK} strokeWidth="6" />
          <rect x="620" y="210" width="1040" height="345" fill="#fefce8" stroke={INK} strokeWidth="5" />

          {/* Dark crack along top of baseboard joint */}
          <path
            d="M 622 555 L 1540 555"
            stroke="#1c0a00"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Smooth glossy ivory sealant bead being laid along the crack */}
          {(() => {
            const nozzleX = lerp(640, 1500, p);
            return (
              <g>
                <line
                  x1="628"
                  y1="555"
                  x2={nozzleX}
                  y2="555"
                  stroke="#fffbeb"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <line
                  x1="628"
                  y1="551"
                  x2={nozzleX}
                  y2="551"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                {/* Caulking / sealant gun nozzle gliding smoothly */}
                <g transform={`translate(${nozzleX}, 548) rotate(-32)`}>
                  {/* Tapered nozzle tip */}
                  <polygon points="0,0 78,-18 78,18" fill="#f8fafc" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
                  {/* Tube body */}
                  <rect x="76" y="-34" width="210" height="68" rx="12" fill="#0ea5e9" stroke={INK} strokeWidth="5" />
                  <rect x="112" y="-20" width="132" height="40" rx="8" fill="#ffffff" opacity="0.92" />
                  <text x="178" y="8" textAnchor="middle" fill="#0369a1" fontSize="22" fontWeight="800" fontFamily={FONT}>
                    KEO TRÁM
                  </text>
                </g>
              </g>
            );
          })()}

          <CleanLabel
            x={1140}
            y={715}
            text="Không để hở khe chân tường & khung cửa"
            bg="#ffffff"
            border="#b45309"
            color="#78350f"
            fontSize={24}
          />
        </g>
      ) : null}

      {/* STEP 2: Abstract hovering checklist shield icon */}
      {activeStep === 2 ? (
        <g>
          {/* Soft calm backdrop card */}
          <rect x="330" y="215" width="1260" height="615" rx="38" fill="#ffffff" stroke="#16a34a" strokeWidth="6" />

          {/* Gently hovering shield explainer icon */}
          <g transform={`translate(960, ${445 + Math.sin(frame * 0.08) * 6})`}>
            <path
              d="M 0 -145 L 125 -95 L 112 38 Q 92 122 0 162 Q -92 122 -112 38 L -125 -95 Z"
              fill="url(#mc15_shieldGrad)"
              stroke={INK}
              strokeWidth="6.5"
              strokeLinejoin="round"
            />
            <path
              d="M -46 6 L -12 40 L 54 -34"
              fill="none"
              stroke="#ffffff"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Two crisp check pills flanking the shield */}
          <CleanLabel
            x={575}
            y={460}
            text="✓ Đồ gỗ khô thoáng"
            bg="#dcfce7"
            border="#16a34a"
            color="#14532d"
            fontSize={26}
          />
          <CleanLabel
            x={1345}
            y={460}
            text="✓ Khe nứt trám kín"
            bg="#dcfce7"
            border="#16a34a"
            color="#14532d"
            fontSize={26}
          />

          {/* Bottom formula badge */}
          <CleanLabel
            x={960}
            y={740}
            text="Gỗ khô + Khe kín = Không có tổ mối"
            bg="#fef9c3"
            border="#ca8a04"
            color="#713f12"
            fontSize={30}
          />
        </g>
      ) : null}

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={128}
        text={topLabel}
        bg="#f0fdf4"
        border="#16a34a"
        color="#14532d"
        fontSize={29}
      />
    </svg>
  );
};

/* ============================================================================
 * 7. MoiCanhPeacefulRainyNightVisual (MOICANH_PEACEFUL_RAINY_NIGHT)
 * Step 0: Cozy room looking out closed window onto rainy night — BOY & GRANDPA happy, zero termites
 * Step 1: Soft exterior view of rain-washed garden, warm amber light & glistening puddles
 * Step 2: Back inside cozy room — BOY & GRANDPA smiling warmly with subtle warm vignette
 * ============================================================================ */
export const MoiCanhPeacefulRainyNightVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = easeOutCubic(progress);

  const topLabel =
    activeStep === 0
      ? 'Trong nhà sạch bóng, không còn mối bay'
      : activeStep === 1
      ? 'Ngoài hiên mưa rơi êm dịu, bình yên'
      : 'Hiểu đúng khoa học, đón mưa thật thảnh thơi';

  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mc16_roomWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <clipPath id="mc16_windowClip">
          <rect x="440" y="195" width="1040" height="445" rx="14" />
        </clipPath>
        <radialGradient id="mc16_warmVignette" cx="50%" cy="48%" r="60%">
          <stop offset="55%" stopColor="#f59e0b" stopOpacity="0" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.32" />
        </radialGradient>
        <radialGradient id="mc16_gardenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* STEP 0 & STEP 2: Warm cozy Vietnamese living room looking out large closed glass window */}
      {activeStep !== 1 ? (
        <g>
          {/* Cozy cream/warm wall & wooden floor */}
          <rect x="0" y="0" width="1920" height="725" fill="url(#mc16_roomWall)" />
          <rect x="0" y="725" width="1920" height="355" fill="#b45309" stroke={INK} strokeWidth="5" />

          {/* Rainy countryside night outside the closed glass window */}
          <g clipPath="url(#mc16_windowClip)">
            <PorchNightBackdrop
              frame={frame}
              lampOn={true}
              lampColor="YELLOW"
              rainIntensity={0.72}
              showClouds={true}
            />
            {/* Diagonal rain streaks sliding on window glass */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
              const rx = 470 + i * 105;
              const ry = 190 + ((frame * 8 + i * 73) % 460);
              return (
                <line
                  key={i}
                  x1={rx}
                  y1={ry}
                  x2={rx - 14}
                  y2={ry + 38}
                  stroke="#e0f2fe"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              );
            })}
          </g>

          {/* Closed wooden window frame & center mullion */}
          <rect x="440" y="195" width="1040" height="445" rx="14" fill="none" stroke="#78350f" strokeWidth="18" />
          <line x1="960" y1="195" x2="960" y2="640" stroke="#78350f" strokeWidth="12" />
          <rect x="415" y="638" width="1090" height="24" rx="8" fill="#92400e" stroke={INK} strokeWidth="4.5" />

          {/* Cozy indoor warm table lamp on left */}
          <g transform="translate(245, 625)">
            <ellipse cx="0" cy="-65" rx="120" ry="95" fill="url(#mc16_gardenGlow)" opacity="0.5" />
            <rect x="-55" y="55" width="110" height="55" rx="8" fill="#78350f" stroke={INK} strokeWidth="4.5" />
            <rect x="-12" y="-12" width="24" height="68" fill="#d97706" stroke={INK} strokeWidth="4" />
            <polygon points="-48,-12 48,-12 32,-78 -32,-78" fill="#fef08a" stroke={INK} strokeWidth="4.5" />
          </g>

          {/* Potted indoor plant on right */}
          <g transform="translate(1675, 645)">
            <polygon points="-38,25 38,25 28,82 -28,82" fill="#c2410c" stroke={INK} strokeWidth="4.5" />
            <path d="M 0 25 Q -45 -35 -18 -72 Q 0 -35 0 25 Z" fill="#16a34a" stroke={INK} strokeWidth="3.5" />
            <path d="M 0 25 Q 45 -35 18 -72 Q 0 -35 0 25 Z" fill="#22c55e" stroke={INK} strokeWidth="3.5" />
            <path d="M 0 25 Q 0 -60 0 -92" fill="none" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* BOY and GRANDPA calmly by the window */}
          <SharedStickman
            x={activeStep === 0 ? 745 : 795}
            y={742}
            scale={activeStep === 0 ? 1.06 : 1.12}
            role="BOY"
            facing="RIGHT"
            pose={activeStep === 0 ? 'LOOK_WINDOW' : 'HAPPY_WAVE'}
            expression="HAPPY"
            frame={frame}
          />
          <SharedStickman
            x={activeStep === 0 ? 1175 : 1125}
            y={742}
            scale={activeStep === 0 ? 1.08 : 1.14}
            role="GRANDPA"
            facing="LEFT"
            pose={activeStep === 0 ? 'LOOK_WINDOW' : 'IDLE'}
            expression={activeStep === 0 ? 'HAPPY' : 'PROUD'}
            frame={frame}
          />

          {/* Step 0 speech bubble */}
          {activeStep === 0 ? (
            <g opacity={easeOutCubic(clamp01(progress * 2.2))}>
              <ShortSpeechBubble
                x={735}
                y={415}
                text="Sạch bóng luôn ông ạ!"
                tailDir="LEFT"
              />
            </g>
          ) : null}

          {/* Step 2 warm cozy vignette */}
          {activeStep === 2 ? (
            <rect x="0" y="0" width="1920" height="1080" fill="url(#mc16_warmVignette)" opacity={lerp(0.25, 0.9, p)} />
          ) : null}
        </g>
      ) : null}

      {/* STEP 1: Soft exterior view of rainy countryside night, warm amber garden light & puddles */}
      {activeStep === 1 ? (
        <g>
          <PorchNightBackdrop
            frame={frame}
            lampOn={true}
            lampColor="YELLOW"
            rainIntensity={0.78}
            showClouds={true}
          />

          {/* Warm amber garden lantern glow */}
          <circle cx="960" cy="420" r="240" fill="url(#mc16_gardenGlow)" opacity="0.65" />

          {/* Swaying rain-washed garden trees on left & right */}
          {(() => {
            const sway = Math.sin(frame * 0.05) * 3.5;
            return (
              <g>
                <g transform={`translate(220, 740) rotate(${sway})`}>
                  <rect x="-18" y="-210" width="36" height="215" fill="#451a03" stroke={INK} strokeWidth="4" />
                  <circle cx="0" cy="-240" r="105" fill="#15803d" stroke={INK} strokeWidth="5" />
                  <circle cx="-68" cy="-190" r="76" fill="#166534" stroke={INK} strokeWidth="4.5" />
                  <circle cx="70" cy="-195" r="74" fill="#16a34a" stroke={INK} strokeWidth="4.5" />
                </g>
                <g transform={`translate(1700, 740) rotate(${-sway})`}>
                  <rect x="-18" y="-210" width="36" height="215" fill="#451a03" stroke={INK} strokeWidth="4" />
                  <circle cx="0" cy="-240" r="105" fill="#15803d" stroke={INK} strokeWidth="5" />
                  <circle cx="-66" cy="-195" r="74" fill="#16a34a" stroke={INK} strokeWidth="4.5" />
                  <circle cx="68" cy="-190" r="76" fill="#166534" stroke={INK} strokeWidth="4.5" />
                </g>
              </g>
            );
          })()}

          {/* Glistening puddles on garden ground with animated raindrop ripples */}
          {[
            { cx: 560, cy: 785, rx: 145, ry: 30 },
            { cx: 1020, cy: 810, rx: 195, ry: 36 },
            { cx: 1420, cy: 778, rx: 130, ry: 26 },
          ].map((pud, idx) => {
            const cyc = (frame * 0.028 + idx * 0.35) % 1;
            return (
              <g key={idx}>
                <ellipse cx={pud.cx} cy={pud.cy} rx={pud.rx} ry={pud.ry} fill="#38bdf8" fillOpacity="0.38" stroke="#bae6fd" strokeWidth="2.5" />
                <ellipse
                  cx={pud.cx + (idx - 1) * 18}
                  cy={pud.cy}
                  rx={lerp(12, pud.rx * 0.65, cyc)}
                  ry={lerp(3, pud.ry * 0.65, cyc)}
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="3"
                  opacity={(1 - cyc) * 0.78}
                />
              </g>
            );
          })}
        </g>
      ) : null}

      {/* Top safe-zone label */}
      <CleanLabel
        x={960}
        y={124}
        text={topLabel}
        bg="#fef3c7"
        border="#d97706"
        color="#78350f"
        fontSize={29}
      />
    </svg>
  );
};

/* ============================================================================
 * 8. MoiCanhSummary3RulesVisual (MOICANH_SUMMARY_3_RULES)
 * Modern 3-card infographic layout (subtle bob ONLY on the 3 abstract icon badges)
 * Step 0: Cards 1, 2, 3 animate in sequentially with crisp checkmarks
 * Step 1: All 3 cards stay crisp + BOY waves warmly beside "Chia sẻ cho cả nhà nhé!"
 * ============================================================================ */
export const MoiCanhSummary3RulesVisual: React.FC<EpisodeVisualProps> = ({
  progress,
  frame,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  // Non-resetting progressive card reveal
  const c1 = activeStep === 0 ? easeOutCubic(clamp01(progress * 2.8)) : 1;
  const c2 = activeStep === 0 ? easeOutCubic(clamp01((progress - 0.28) * 2.8)) : 1;
  const c3 = activeStep === 0 ? easeOutCubic(clamp01((progress - 0.56) * 2.8)) : 1;

  const closingAppear = activeStep >= 1 ? easeOutCubic(clamp01(progress * 2.2)) : 0;

  const cards = [
    {
      cx: 360,
      title: '1. Bay đêm ẩm sắp mưa',
      sub: 'Tìm bạn đời lập tổ mới',
      accent: '#0284c7',
      bg: '#e0f2fe',
      lit: c1,
    },
    {
      cx: 960,
      title: '2. Bu đèn vì loạn hướng',
      sub: 'Phản xạ hướng lưng về sáng',
      accent: '#d97706',
      bg: '#fef3c7',
      lit: c2,
    },
    {
      cx: 1560,
      title: '3. Xử lý cực gọn',
      sub: 'Tắt đèn trắng & bẫy nước',
      accent: '#16a34a',
      bg: '#dcfce7',
      lit: c3,
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="mc17_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
      </defs>

      {/* Soft warm cream / slate-blue explainer backdrop */}
      <rect x="0" y="0" width="1920" height="1080" fill="url(#mc17_bg)" />

      {/* Top safe-zone heading */}
      <CleanLabel
        x={960}
        y={114}
        text="Tóm tắt 3 điều dễ nhớ về mối cánh"
        bg="#ffffff"
        border={INK}
        color={INK}
        fontSize={30}
      />

      {/* 3 Infographic Cards (static crisp card frames; gentle bob ONLY on the 3 abstract icon badges) */}
      {cards.map((card, i) => {
        const cardX = card.cx - 255;
        const cardY = 190 + lerp(22, 0, card.lit);
        const iconBobY = Math.sin(frame / 20 + i * 1.2) * 5;
        return (
          <g key={i} transform={`translate(${cardX}, ${cardY})`} opacity={lerp(0.18, 1, card.lit)}>
            {/* Card body */}
            <rect
              x="0"
              y="0"
              width="510"
              height="440"
              rx="32"
              fill="#ffffff"
              stroke={card.lit > 0.5 ? card.accent : '#cbd5e1'}
              strokeWidth="6"
            />
            {/* Top colored header band */}
            <path d="M 0 32 Q 0 0 32 0 L 478 0 Q 510 0 510 32 L 510 198 L 0 198 Z" fill={card.bg} />

            {/* Abstract icon badge with subtle floating bob */}
            <g transform={`translate(255, ${104 + iconBobY})`}>
              <circle cx="0" cy="0" r="68" fill="#ffffff" stroke={card.accent} strokeWidth="5.5" />
              {i === 0 ? (
                /* Rain cloud + winged termite icon */
                <g>
                  <path
                    d="M -38 -12 Q -42 -34 -18 -36 Q -6 -52 16 -42 Q 38 -40 38 -16 Q 46 -4 34 4 L -32 4 Q -46 0 -38 -12 Z"
                    fill="#94a3b8"
                    stroke={INK}
                    strokeWidth="3.5"
                  />
                  <line x1="-18" y1="12" x2="-24" y2="26" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="0" y1="12" x2="-6" y2="26" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="18" y1="12" x2="12" y2="26" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                  <WingedTermite x={8} y={32} scale={0.46} angleDeg={-18} frame={frame} phase={0} wingsAttached={true} />
                </g>
              ) : i === 1 ? (
                /* Glowing lamp + curved orbit icon */
                <g>
                  <circle cx="0" cy="-6" r="24" fill="#fef08a" stroke="#d97706" strokeWidth="4" />
                  <rect x="-10" y="16" width="20" height="12" rx="4" fill="#64748b" stroke={INK} strokeWidth="3" />
                  <ellipse
                    cx="0"
                    cy="-4"
                    rx="48"
                    ry="24"
                    transform="rotate(-22)"
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="4"
                    strokeDasharray="10 7"
                  />
                </g>
              ) : (
                /* Light switch OFF + water basin icon */
                <g>
                  <rect x="-42" y="-32" width="34" height="48" rx="6" fill="#f1f5f9" stroke={INK} strokeWidth="3.5" />
                  <rect x="-34" y="-8" width="18" height="16" rx="3" fill="#ef4444" stroke={INK} strokeWidth="2.5" />
                  <path d="M 2 6 L 46 6 L 40 32 L 8 32 Z" fill="#2563eb" stroke={INK} strokeWidth="3.5" />
                  <ellipse cx="24" cy="6" rx="22" ry="7" fill="#38bdf8" stroke={INK} strokeWidth="3" />
                </g>
              )}
            </g>

            {/* Title */}
            <text
              x="255"
              y="264"
              textAnchor="middle"
              fill={INK}
              fontSize="30"
              fontWeight="800"
              fontFamily={FONT}
            >
              {card.title}
            </text>

            {/* Subtitle */}
            <text
              x="255"
              y="314"
              textAnchor="middle"
              fill="#475569"
              fontSize="24"
              fontWeight="600"
              fontFamily={FONT}
            >
              {card.sub}
            </text>

            {/* Crisp checkmark */}
            {card.lit > 0.65 ? (
              <g transform="translate(255, 382)">
                <circle cx="0" cy="0" r="26" fill={card.bg} stroke={card.accent} strokeWidth="4.5" />
                <path
                  d="M -11 1 L -3 9 L 13 -8"
                  fill="none"
                  stroke={card.accent}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : null}
          </g>
        );
      })}

      {/* STEP 1: BOY waves warmly beside friendly closing badge (strictly above y = 870) */}
      {closingAppear > 0.01 ? (
        <g opacity={closingAppear}>
          <SharedStickman
            x={710}
            y={822}
            scale={0.76}
            role="BOY"
            facing="RIGHT"
            pose="HAPPY_WAVE"
            expression="HAPPY"
            frame={frame}
          />
          <ShortSpeechBubble x={1060} y={758} text="Chia sẻ cho cả nhà nhé!" tailDir="LEFT" />
        </g>
      ) : null}
    </svg>
  );
};
