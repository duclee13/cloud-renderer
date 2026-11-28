import React from 'react';
import { Easing, interpolate } from 'remotion';
import type { EpisodeVisualProps } from './index';
import { CuteOctopus } from '../../AnimalSpriteKit';
import { INK, FONT } from './octopusCamoSharedAssets';

/* ============================================================================
 * V24.0 EMOTIONAL TWIST FULL-SCREEN SVGS (EPISODE 10 — ANIMAL_POV)
 *   - Strictly zero SVG blur, drop-shadow, foreign-object, or URL filter effects
 *   - Main content strictly inside y=220..780 safe zone so KineticHeadline
 *     at y=138 and bottom subtitles at y>=880 NEVER overlap!
 *   - Static backgrounds wrapped in React.memo (no frame prop) for 20-VM 45fps.
 * ========================================================================== */

const LIFESPAN_AMBIENT_DOTS: readonly { x: number; y: number; r: number }[] = [
  { x: 140, y: 270, r: 5 },
  { x: 310, y: 460, r: 7 },
  { x: 520, y: 245, r: 4.5 },
  { x: 760, y: 740, r: 6 },
  { x: 1010, y: 240, r: 5 },
  { x: 1290, y: 745, r: 7 },
  { x: 1520, y: 255, r: 4.5 },
  { x: 1765, y: 420, r: 6.5 },
  { x: 1710, y: 690, r: 5 },
  { x: 195, y: 720, r: 6 },
];

const DeepSeaLifespanBackdropStatic: React.FC = React.memo(() => (
  <g id="octo-v24-lifespan-backdrop-static">
    <defs>
      <linearGradient id="octo_v24_deepsea_grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="55%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} fill="url(#octo_v24_deepsea_grad)" />
    {/* Soft flat seabed silhouette well below y=790 */}
    <path
      d="M 0,830 Q 480,795 960,825 T 1920,810 L 1920,1080 L 0,1080 Z"
      fill="#0B1120"
      opacity={0.72}
    />
    <line x1={0} y1={812} x2={1920} y2={812} stroke="#38BDF8" strokeWidth={2.5} opacity={0.22} />
  </g>
));
DeepSeaLifespanBackdropStatic.displayName = 'DeepSeaLifespanBackdropStatic';

/* ============================================================================
 * SVG_15 (V24): OCTO_SHORT_LIFESPAN (Beats 50–51, steps 0, 1)
 *   - Step 0: Clean short lifespan bar "1 – 2 NĂM" on calm deep ocean backdrop (y=235..770)
 *   - Step 1: Warm glowing heart lights up beside the short lifespan bar emphasizing living fully
 * ========================================================================== */
export const OctoShortLifespanVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  const barGrowT = interpolate(frame, [4, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const heartPopT = interpolate(frame, [4, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.3)),
  });
  const heartPulse = 1 + Math.sin(frame * 0.14) * 0.035;

  const octoBarWidth = activeStep === 0 ? 185 * barGrowT : 185;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <DeepSeaLifespanBackdropStatic />

      {/* Subtle ambient deep-sea motes */}
      <g stroke="none">
        {LIFESPAN_AMBIENT_DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={Number((d.y + Math.sin(frame * 0.03 + i) * 10).toFixed(1))}
            r={d.r}
            fill="#BAE6FD"
            opacity={0.22}
          />
        ))}
      </g>

      {/* Main Content Card strictly inside y=235..770 safe zone */}
      <g id="octo-v24-lifespan-content">
        <rect
          x={180}
          y={235}
          width={1560}
          height={535}
          rx={34}
          fill="#1E293B"
          fillOpacity={0.86}
          stroke={activeStep === 0 ? '#38BDF8' : '#FDA4AF'}
          strokeWidth={4.5}
        />

        {/* Left: Tuộc (bandana_green) thoughtfully looking at the lifespan panel */}
        <g id="octo-v24-lifespan-tuoc">
          <ellipse cx={415} cy={695} rx={120} ry={18} fill="#0F172A" opacity={0.35} />
          <CuteOctopus
            x={415}
            y={640}
            scale={1.38}
            frame={frame}
            pose="float"
            emotion={activeStep === 0 ? 'curious' : 'happy'}
            accessory="bandana_green"
          />
        </g>

        {activeStep === 0 ? (
          /* STEP 0: Short Lifespan Bar "1 – 2 NĂM" vs Long-Lived Ocean Species */
          <g id="octo-v24-lifespan-step0" transform="translate(650, 290)">
            <text x={0} y={32} fill="#E2E8F0" fontSize={28} fontWeight={900}>
              Vòng đời dưới đại dương
            </text>

            {/* Long reference bar: Sea Turtle / Whale (70 - 100 years) */}
            <g transform="translate(0, 74)">
              <text x={0} y={24} fill="#94A3B8" fontSize={22} fontWeight={800}>
                Rùa biển &amp; Cá voi lớn
              </text>
              <rect x={0} y={40} width={960} height={46} rx={18} fill="#334155" stroke="#64748B" strokeWidth={3} />
              <rect x={4} y={44} width={900} height={38} rx={15} fill="#475569" />
              <text x={936} y={71} textAnchor="end" fill="#CBD5E1" fontSize={22} fontWeight={900}>
                70 – 100 năm
              </text>
            </g>

            {/* Highlighted Short Lifespan Bar: Octopus 1 – 2 Years */}
            <g transform="translate(0, 206)">
              <text x={0} y={24} fill="#FDE047" fontSize={25} fontWeight={900}>
                Bạch tuộc (trí thông minh đỉnh cao)
              </text>
              <rect x={0} y={42} width={960} height={64} rx={22} fill="#0F172A" stroke="#F87171" strokeWidth={3.5} />
              <rect
                x={6}
                y={48}
                width={Math.max(24, octoBarWidth)}
                height={52}
                rx={17}
                fill="#F87171"
                stroke="#FEF08A"
                strokeWidth={3}
              />
              {/* Crisp highlight pill right beside the short bar */}
              <g transform={`translate(${Math.round(218 + (1 - barGrowT) * 20)}, 74)`} opacity={barGrowT.toFixed(2)}>
                <rect x={0} y={-24} width={220} height={48} rx={24} fill="#DC2626" stroke="#FEF08A" strokeWidth={3} />
                <text x={110} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={24} fontWeight={900}>
                  1 – 2 NĂM
                </text>
              </g>
            </g>

            {/* Bottom concise summary strip */}
            <g transform="translate(0, 355)">
              <rect x={0} y={0} width={960} height={62} rx={20} fill="#0F172A" stroke="#38BDF8" strokeWidth={2.8} />
              <text x={480} y={39} textAnchor="middle" fill="#BAE6FD" fontSize={23} fontWeight={800}>
                Cực kỳ thông minh — nhưng chỉ có 1 đến 2 năm ngắn ngủi dưới biển sâu
              </text>
            </g>
          </g>
        ) : (
          /* STEP 1: Warm Luminous Heart beside Short Lifespan -> Every Day Is Precious */
          <g id="octo-v24-lifespan-step1" transform="translate(650, 275)">
            {/* Compact short lifespan bar reminder at top */}
            <rect x={0} y={0} width={960} height={58} rx={20} fill="#0F172A" stroke="#64748B" strokeWidth={2.8} />
            <rect x={8} y={8} width={190} height={42} rx={15} fill="#FB7185" stroke="#FEF08A" strokeWidth={2.5} />
            <text x={103} y={37} textAnchor="middle" fill="#FFFFFF" fontSize={21} fontWeight={900}>
              1 – 2 NĂM
            </text>
            <text x={228} y={37} fill="#E2E8F0" fontSize={22} fontWeight={800}>
              Mỗi ngày trôi qua là một cuộc chạy đua sinh tồn
            </text>

            {/* Centerpiece Warm Glowing Heart + Precious Day Sun/Moon Cycle */}
            <g transform={`translate(480, 225) scale(${(heartPopT * heartPulse).toFixed(4)})`}>
              <circle cx={0} cy={0} r={118} fill="#FDA4AF" opacity={0.14} />
              <circle cx={0} cy={0} r={88} fill="#FB7185" opacity={0.22} />
              <path
                d="M 0,58 C -72,12 -86,-42 -48,-66 C -22,-82 0,-56 0,-42 C 0,-56 22,-82 48,-66 C 86,-42 72,12 0,58 Z"
                fill="#FB7185"
                stroke="#FEF08A"
                strokeWidth={5.5}
                strokeLinejoin="round"
              />
              <path
                d="M -46,-36 C -48,-52 -32,-58 -20,-48"
                fill="none"
                stroke="#FFF1F2"
                strokeWidth={6}
                strokeLinecap="round"
              />
            </g>

            {/* Left & Right Day-Cycle Golden Sun & Silver Moon Badges */}
            <g transform="translate(155, 225)">
              <circle cx={0} cy={0} r={46} fill="#0F172A" stroke="#FACC15" strokeWidth={3.5} />
              <circle cx={0} cy={0} r={20} fill="#FACC15" stroke={INK} strokeWidth={2.5} />
              <text x={0} y={72} textAnchor="middle" fill="#FEF08A" fontSize={20} fontWeight={900}>
                Sáng săn mồi
              </text>
            </g>
            <g transform="translate(805, 225)">
              <circle cx={0} cy={0} r={46} fill="#0F172A" stroke="#38BDF8" strokeWidth={3.5} />
              <path
                d="M 6,-20 A 20,20 0 1,0 6,20 A 15,15 0 1,1 6,-20 Z"
                fill="#BAE6FD"
                stroke={INK}
                strokeWidth={2.2}
              />
              <text x={0} y={72} textAnchor="middle" fill="#BAE6FD" fontSize={20} fontWeight={900}>
                Đêm nghỉ ngơi
              </text>
            </g>

            {/* Bottom warm pill */}
            <g transform="translate(0, 385)">
              <rect x={0} y={0} width={960} height={60} rx={20} fill="#881337" stroke="#FDA4AF" strokeWidth={3} />
              <text x={480} y={38} textAnchor="middle" fill="#FFF1F2" fontSize={24} fontWeight={900}>
                Vòng đời ngắn ngủi • Sống trọn vẹn từng khoảnh khắc đại dương
              </text>
            </g>
          </g>
        )}
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_16 (V24): OCTO_MOTHER_SACRIFICE (Beats 53–55, steps 0, 1, 2)
 *   - Step 0: Warm underwater rock cave; Mẹ Tuộc (#C4365D, flower_pink) embraces translucent white eggs
 *   - Step 1: Gentle oxygen bubble stream from Mẹ Tuộc washes & sparkles every translucent egg
 *   - Step 2: Dozens of adorable baby octopuses (ageVariant="baby") hatch & swim up toward sunlit water!
 *   - Main content strictly inside y=220..780 safe zone!
 * ========================================================================== */

const MotherCaveBackdropStatic: React.FC<{ sunlit?: boolean }> = React.memo(({ sunlit = false }) => (
  <g id="octo-v24-mother-cave-backdrop-static">
    <defs>
      <linearGradient id="octo_v24_cave_sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={sunlit ? '#0369A1' : '#0F172A'} />
        <stop offset="55%" stopColor={sunlit ? '#0284C7' : '#1E293B'} />
        <stop offset="100%" stopColor={sunlit ? '#0C4A6E' : '#172554'} />
      </linearGradient>
    </defs>

    <rect x={0} y={0} width={1920} height={1080} fill="url(#octo_v24_cave_sea)" />

    {/* Radiant sunlight shafts on Step 2 (flat polygons, 0 blur) */}
    {sunlit && (
      <g opacity={0.24}>
        <polygon points="1040,0 1320,0 920,820 660,820" fill="#FEF08A" />
        <polygon points="1390,0 1680,0 1380,820 1090,820" fill="#BAE6FD" />
        <polygon points="1720,0 1920,0 1760,820 1510,820" fill="#FEF9C3" />
      </g>
    )}

    {/* Cozy sculpted underwater rock cave interior framing y=220..790 */}
    <path
      d="M 0,220 L 1920,220 L 1920,310 C 1650,255 1290,235 960,248 C 610,260 320,315 220,475 C 165,565 185,695 255,790 L 0,790 Z"
      fill="#1E293B"
      stroke={INK}
      strokeWidth={4}
    />
    <path
      d="M 1920,270 L 1920,790 L 1660,790 C 1735,685 1745,510 1655,375 C 1605,300 1760,260 1920,270 Z"
      fill="#1E293B"
      stroke={INK}
      strokeWidth={4}
      opacity={sunlit ? 0.35 : 0.92}
    />

    {/* Warm rocky ledge & seabed at y=785..1080 (clean subtitle space below) */}
    <rect x={0} y={785} width={1920} height={295} fill="#0F172A" />
    <path
      d="M 0,785 Q 480,768 960,786 T 1920,780 L 1920,840 L 0,840 Z"
      fill="#334155"
      stroke={INK}
      strokeWidth={3.5}
    />
  </g>
));
MotherCaveBackdropStatic.displayName = 'MotherCaveBackdropStatic';

const EGG_STRANDS: readonly { x: number; eggs: readonly number[] }[] = [
  { x: 1015, eggs: [302, 342, 382, 422, 462] },
  { x: 1085, eggs: [294, 336, 378, 420, 462, 504] },
  { x: 1155, eggs: [288, 330, 372, 414, 456, 498, 538] },
  { x: 1225, eggs: [294, 336, 378, 420, 462, 504] },
  { x: 1295, eggs: [302, 342, 382, 422, 462] },
  { x: 1365, eggs: [312, 352, 392, 432] },
];

const BABY_SWIM_TARGETS: readonly {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  scale: number;
  delay: number;
}[] = [
  { sx: 640, sy: 650, ex: 920, ey: 390, scale: 0.52, delay: 0 },
  { sx: 760, sy: 690, ex: 1120, ey: 440, scale: 0.56, delay: 4 },
  { sx: 850, sy: 610, ex: 1280, ey: 330, scale: 0.48, delay: 2 },
  { sx: 950, sy: 710, ex: 1410, ey: 470, scale: 0.54, delay: 8 },
  { sx: 710, sy: 550, ex: 1060, ey: 295, scale: 0.44, delay: 6 },
  { sx: 1020, sy: 620, ex: 1520, ey: 365, scale: 0.5, delay: 5 },
  { sx: 1110, sy: 700, ex: 1620, ey: 455, scale: 0.46, delay: 10 },
  { sx: 880, sy: 515, ex: 1350, ey: 275, scale: 0.42, delay: 3 },
  { sx: 1190, sy: 600, ex: 1680, ey: 325, scale: 0.48, delay: 7 },
];

export const OctoMotherSacrificeVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  const oxygenFlowT = interpolate(frame, [0, 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MotherCaveBackdropStatic sunlit={activeStep === 2} />

      {activeStep < 2 ? (
        /* STEPS 0 & 1: Warm cave interior — Mẹ Tuộc (flower_pink) guarding & oxygenating translucent eggs */
        <g id={`octo-v24-mother-step-${activeStep}`}>
          {/* Soft flat warm sanctuary glow inside cave (0 blur!) */}
          <ellipse cx={960} cy={510} rx={580} ry={255} fill="#FEF3C7" opacity={0.09} />
          <ellipse cx={1185} cy={420} rx={270} ry={175} fill="#BAE6FD" opacity={activeStep === 1 ? 0.16 : 0.08} />

          {/* Hanging translucent pearly octopus egg strands (y=260..560) */}
          <g id="octo-v24-egg-cluster">
            {EGG_STRANDS.map((strand, sIdx) => {
              const swayX = Math.sin(frame * 0.055 + sIdx * 0.8) * (activeStep === 1 ? 7 : 3);
              return (
                <g key={sIdx}>
                  <path
                    d={`M ${strand.x},255 Q ${(strand.x + swayX * 0.6).toFixed(1)},390 ${(strand.x + swayX).toFixed(1)},${strand.eggs[strand.eggs.length - 1]}`}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth={3}
                    opacity={0.7}
                  />
                  {strand.eggs.map((ey, eIdx) => {
                    const frac = (ey - 255) / 280;
                    const ex = strand.x + swayX * frac;
                    const sparklePulse = activeStep === 1 ? 0.65 + 0.35 * Math.sin(frame * 0.18 + sIdx + eIdx) : 0.72;
                    return (
                      <g key={eIdx} transform={`translate(${ex.toFixed(1)}, ${ey})`}>
                        <ellipse
                          cx={0}
                          cy={0}
                          rx={13}
                          ry={18}
                          fill="#F8FAFC"
                          fillOpacity={0.86}
                          stroke={activeStep === 1 ? '#38BDF8' : '#CBD5E1'}
                          strokeWidth={2.4}
                        />
                        <ellipse cx={-3} cy={-5} rx={4.5} ry={6.5} fill="#FFFFFF" opacity={sparklePulse} stroke="none" />
                        <circle cx={2} cy={4} r={3.5} fill="#FDA4AF" opacity={0.55} stroke="none" />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>

          {/* Step 1: Gentle oxygen water currents & shimmering bubbles from Mẹ Tuộc toward egg clutch */}
          {activeStep === 1 && (
            <g id="octo-v24-oxygen-stream" opacity={oxygenFlowT.toFixed(3)}>
              {/* Graceful curving current ribbons */}
              <path
                d="M 790,565 Q 920,515 1030,455 T 1340,395"
                fill="none"
                stroke="#7DD3FC"
                strokeWidth={5.5}
                strokeLinecap="round"
                strokeDasharray="18 14"
                opacity={0.72}
              />
              <path
                d="M 805,605 Q 945,565 1065,505 T 1375,455"
                fill="none"
                stroke="#BAE6FD"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeDasharray="14 12"
                opacity={0.62}
              />
              {/* Drifting oxygen bubbles + tiny O2 tag */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((bi) => {
                const bx = 815 + bi * 74 + Math.sin(frame * 0.12 + bi) * 8;
                const by = 570 - bi * 24 + Math.cos(frame * 0.1 + bi) * 9;
                const br = 6 + (bi % 3) * 3.2;
                return (
                  <g key={bi} transform={`translate(${bx.toFixed(1)}, ${by.toFixed(1)})`}>
                    <circle cx={0} cy={0} r={br} fill="#E0F2FE" fillOpacity={0.78} stroke="#38BDF8" strokeWidth={2.2} />
                    <circle cx={-br * 0.3} cy={-br * 0.3} r={br * 0.28} fill="#FFFFFF" stroke="none" />
                  </g>
                );
              })}
              {/* Sparkling 4-point clean stars over washed eggs */}
              {[
                { x: 1050, y: 340 },
                { x: 1205, y: 315 },
                { x: 1320, y: 405 },
                { x: 1130, y: 490 },
              ].map((st, idx) => {
                const s = 0.72 + 0.28 * Math.sin(frame * 0.16 + idx * 1.4);
                return (
                  <path
                    key={idx}
                    d="M 0,-14 L 3.5,-3.5 L 14,0 L 3.5,3.5 L 0,14 L -3.5,3.5 L -14,0 L -3.5,-3.5 Z"
                    transform={`translate(${st.x}, ${st.y}) scale(${s.toFixed(2)})`}
                    fill="#FEF08A"
                    stroke="none"
                  />
                );
              })}
            </g>
          )}

          {/* Mẹ Tuộc (#C4365D, flower_pink) lovingly protecting her nest */}
          <g id="octo-v24-mother-octopus">
            <CuteOctopus
              x={645}
              y={742}
              scale={1.45}
              frame={frame}
              pose={activeStep === 1 ? 'wave' : 'crawl'}
              emotion="happy"
              accessory="flower_pink"
            />
          </g>

          {/* Clean caption badge cleanly inside safe zone y=680..740 */}
          <g transform="translate(1185, 695)">
            <rect
              x={-330}
              y={-28}
              width={660}
              height={56}
              rx={28}
              fill="#0F172A"
              fillOpacity={0.88}
              stroke={activeStep === 1 ? '#38BDF8' : '#FDA4AF'}
              strokeWidth={3.2}
            />
            <text x={0} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={22} fontWeight={900}>
              {activeStep === 0
                ? 'Canh giữ hàng vạn quả trứng • Không đi săn suốt nhiều tuần'
                : 'Thổi dòng nước giàu ô xy • Giữ trứng sạch và lấp lánh'}
            </text>
          </g>
        </g>
      ) : (
        /* STEP 2: Joyful hatching — dozens of adorable baby octopuses (ageVariant="baby") swimming up toward the sun! */
        <g id="octo-v24-mother-step-2">
          {/* Opened empty pearly egg shells gently swaying at cave roof */}
          <g opacity={0.55}>
            {[460, 535, 610, 685].map((ex, i) => (
              <g key={i} transform={`translate(${ex}, ${285 + (i % 2) * 24})`}>
                <path
                  d="M -12,-14 C -12,-24 12,-24 12,-14 L 10,8 L 4,2 L 0,10 L -5,2 L -10,8 Z"
                  fill="#E2E8F0"
                  stroke="#94A3B8"
                  strokeWidth={2}
                />
              </g>
            ))}
          </g>

          {/* Mẹ Tuộc smiling warmly from the lower-left cave threshold */}
          <g opacity={0.82}>
            <CuteOctopus
              x={380}
              y={758}
              scale={1.24}
              frame={frame}
              pose="crawl"
              emotion="proud"
              accessory="flower_pink"
            />
          </g>

          {/* Joyful swarm of Baby Octopuses (ageVariant="baby") swimming upward toward golden sunbeams! */}
          <g id="octo-v24-baby-octopuses">
            {BABY_SWIM_TARGETS.map((baby, idx) => {
              const t = interpolate(frame, [baby.delay, baby.delay + 120], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.quad),
              });
              const bx = baby.sx + (baby.ex - baby.sx) * t;
              const by = baby.sy + (baby.ey - baby.sy) * t + Math.sin(frame * 0.14 + idx) * 6;
              return (
                <CuteOctopus
                  key={idx}
                  x={bx}
                  y={by}
                  scale={baby.scale}
                  frame={frame + idx * 13}
                  pose="float"
                  emotion="happy"
                  ageVariant="baby"
                />
              );
            })}
          </g>

          {/* Shimmering bubbles rising with the babies */}
          <g stroke="#BAE6FD" strokeWidth={2} fill="#E0F2FE" fillOpacity={0.65}>
            {[0, 1, 2, 3, 4, 5].map((bi) => {
              const t = interpolate(frame, [0, 150], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              return (
                <circle
                  key={bi}
                  cx={760 + bi * 165}
                  cy={680 - t * 240 - (bi % 3) * 45}
                  r={5 + (bi % 3) * 2.5}
                />
              );
            })}
          </g>
        </g>
      )}
    </svg>
  );
};
