import React from "react";
import { Easing, interpolate } from "remotion";
import type { EpisodeVisualProps } from "./index";
import { CuteWoodFrog } from "../../AnimalSpriteKit";

const INK = "#1E293B";
const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

/* ============================================================================
 * EPISODE 11 (V24.0 — PURE FULL-BLEED SCIENCE VISUALS)
 *   - 8 bespoke animated SVG science visuals drawn DIRECTLY on transparent canvas
 *     above CleanExplainerStage (hideHorizon=true -> zero floor/horizon cut lines!)
 *   - 100% content strictly inside safe zone y=220..820 so KineticHeadline (y=138)
 *     and bottom subtitles (y>=880) NEVER overlap!
 *   - 100% 0-blur pure vector geometry, clean Vietnamese & standard Glucose/Urê labels.
 * ========================================================================== */

/* ----------------------------------------------------------------------------
 * 1. FROG_CLINICAL_DEATH (LAVENDER_NIGHT, 2 steps — Beats 3 & 4)
 *    - Step 0: Frozen frog centered cleanly inside dashed ring; 3 organ badges
 *      (Não, Phổi, Tim) neatly spaced OUTSIDE along perimeter (NEVER covering frog face!)
 *    - Step 1: Macro milky-white frozen eye + 70% crystal-ice water body meter
 * -------------------------------------------------------------------------- */
export const FrogClinicalDeathVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const scanX = (frame * 5) % 440;
  const fillIceT = interpolate(frame, [4, 34], [0.15, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: "block", fontFamily: FONT }}>
      {activeStep === 0 ? (
        <g id="frog-v24-clinical-death-step0">
          {/* Left: Frozen Wood Frog inside ring — 3 clean organ icons spaced along OUTER left perimeter! */}
          <g transform="translate(565, 520)">
            <circle cx={0} cy={0} r={215} fill="#0F172A" fillOpacity={0.55} stroke="#38BDF8" strokeWidth={4} strokeDasharray="12 10" />
            <CuteWoodFrog
              x={16}
              y={88}
              scale={1.42}
              frame={frame}
              pose="frozen_flat"
              freezeState="frozen_solid"
              accessory="scarf_red"
            />
            {/* Perimeter Organ Icon 1 (Top-left): Brain = 0 */}
            <g id="frog-b03-icon-brain" transform="translate(-195, -135)">
              <circle cx={0} cy={0} r={34} fill="#1E293B" stroke="#C084FC" strokeWidth={3.5} />
              <path d="M -14,2 C -18,-12 -4,-18 0,-8 C 4,-18 18,-12 14,2 C 16,12 4,16 0,10 C -4,16 -16,12 -14,2 Z" fill="#C084FC" stroke={INK} strokeWidth={2} />
              <line x1={-22} y1={22} x2={22} y2={-22} stroke="#F87171" strokeWidth={4} strokeLinecap="round" />
            </g>
            {/* Perimeter Organ Icon 2 (Mid-left): Lungs = 0 */}
            <g id="frog-b03-icon-lungs" transform="translate(-225, 0)">
              <circle cx={0} cy={0} r={34} fill="#1E293B" stroke="#38BDF8" strokeWidth={3.5} />
              <path d="M -3,-14 L -3,-2 C -18,-4 -22,12 -11,16 C -4,18 -2,10 -2,4 M 3,-14 L 3,-2 C 18,-4 22,12 11,16 C 4,18 2,10 2,4" fill="#38BDF8" stroke={INK} strokeWidth={2} />
              <line x1={-22} y1={22} x2={22} y2={-22} stroke="#F87171" strokeWidth={4} strokeLinecap="round" />
            </g>
            {/* Perimeter Organ Icon 3 (Bottom-left): Heart = 0 */}
            <g id="frog-b03-icon-heart" transform="translate(-195, 135)">
              <circle cx={0} cy={0} r={34} fill="#1E293B" stroke="#F87171" strokeWidth={3.5} />
              <path d="M 0,14 C -16,4 -19,-8 -10,-13 C -4,-16 0,-10 0,-7 C 0,-10 4,-16 10,-13 C 19,-8 16,4 0,14 Z" fill="#F87171" stroke={INK} strokeWidth={2} />
              <line x1={-22} y1={22} x2={22} y2={-22} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
            </g>
          </g>

          {/* Right: 3 Sleek Flatline Vital Strips (y=265..745) */}
          <g transform="translate(940, 270)">
            {[
              { label: "Nhịp tim", unit: "0 nhịp/phút", color: "#F87171", y: 0 },
              { label: "Nhịp thở", unit: "0 hơi thở", color: "#38BDF8", y: 165 },
              { label: "Sóng não", unit: "0 tín hiệu", color: "#C084FC", y: 330 },
            ].map((row, idx) => (
              <g key={idx} transform={`translate(0, ${row.y})`}>
                <rect x={0} y={0} width={760} height={132} rx={26} fill="#0F172A" fillOpacity={0.78} stroke={row.color} strokeWidth={3.5} />
                <text x={34} y={46} fill="#E2E8F0" fontSize={26} fontWeight={900}>
                  {row.label}
                </text>
                <line x1={34} y1={94} x2={494} y2={94} stroke={row.color} strokeWidth={4.5} opacity={0.85} />
                <circle cx={34 + ((scanX + idx * 110) % 460)} cy={94} r={8} fill="#FFFFFF" stroke={row.color} strokeWidth={3} />
                <rect x={534} y={24} width={196} height={84} rx={20} fill="#1E293B" stroke={row.color} strokeWidth={3} />
                <text x={632} y={70} textAnchor="middle" fill={row.color} fontSize={40} fontWeight={900}>
                  0
                </text>
                <text x={632} y={97} textAnchor="middle" fill="#CBD5E1" fontSize={17} fontWeight={800}>
                  {row.unit}
                </text>
              </g>
            ))}
          </g>
        </g>
      ) : (
        <g id="frog-v24-clinical-death-step1">
          <g transform="translate(555, 505)">
            <circle cx={0} cy={0} r={195} fill="#64748B" stroke={INK} strokeWidth={6} />
            <circle cx={0} cy={0} r={148} fill="#E2E8F0" stroke="#334155" strokeWidth={5} />
            <circle cx={0} cy={0} r={84} fill="#CBD5E1" stroke="#94A3B8" strokeWidth={4} />
            <path
              d="M -90,-65 L -22,-18 L 48,-76 M -76,55 L -10,12 L 84,48 M 0,-115 L 8,-25 L -16,95"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={4.5}
              strokeLinecap="round"
            />
            <rect x={-190} y={222} width={380} height={54} rx={27} fill="#0F172A" stroke="#BAE6FD" strokeWidth={3.5} />
            <text x={0} y={257} textAnchor="middle" fill="#E0F2FE" fontSize={25} fontWeight={900}>
              Mắt hóa trắng đục vì băng
            </text>
          </g>

          <g transform="translate(1320, 505)">
            <rect x={-180} y={-225} width={360} height={415} rx={38} fill="#0F172A" fillOpacity={0.78} stroke="#38BDF8" strokeWidth={4.5} />
            <rect
              x={-162}
              y={172 - Math.round(378 * fillIceT)}
              width={324}
              height={Math.round(378 * fillIceT)}
              rx={26}
              fill="#38BDF8"
              opacity={0.78}
            />
            <polygon points="-90,85 -45,10 10,85" fill="#E0F2FE" opacity={0.55} />
            <polygon points="10,115 70,25 130,115" fill="#BAE6FD" opacity={0.55} />
            <text x={0} y={-110} textAnchor="middle" fill="#FFFFFF" fontSize={78} fontWeight={900}>
              70%
            </text>
            <text x={0} y={-55} textAnchor="middle" fill="#BAE6FD" fontSize={26} fontWeight={900}>
              NƯỚC HÓA BĂNG
            </text>
            <rect x={-230} y={222} width={460} height={54} rx={27} fill="#0F172A" stroke="#F87171" strokeWidth={3.5} />
            <text x={0} y={257} textAnchor="middle" fill="#FCA5A5" fontSize={24} fontWeight={900}>
              65% – 70% nước cơ thể đông cứng
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ----------------------------------------------------------------------------
 * 2. FROG_ICE_DANGER (SOFT_SLATE, 2 steps — Beats 11 & 12)
 * -------------------------------------------------------------------------- */
export const FrogIceDangerVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pierceT = interpolate(frame, [4, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const shrinkScale = interpolate(frame, [6, 40], [1, 0.56], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: "block", fontFamily: FONT }}>
      {activeStep === 0 ? (
        <g id="frog-v24-ice-danger-step0">
          <g transform="translate(560, 505)">
            <circle cx={0} cy={0} r={168} fill="#FEF3C7" stroke={INK} strokeWidth={5.5} />
            <circle cx={0} cy={0} r={62} fill="#F59E0B" stroke={INK} strokeWidth={4} />
            <ellipse cx={-54} cy={-62} rx={26} ry={13} fill="#FFFFFF" opacity={0.78} />
            <rect x={-190} y={208} width={380} height={54} rx={27} fill="#FFFFFF" stroke="#16A34A" strokeWidth={3.5} />
            <text x={0} y={243} textAnchor="middle" fill="#166534" fontSize={25} fontWeight={900}>
              Tế bào bình thường ✓
            </text>
          </g>

          <g transform="translate(960, 505)">
            <path d="M -78,0 L 66,0" stroke="#DC2626" strokeWidth={11} strokeLinecap="round" />
            <polygon points="96,0 52,-26 52,26" fill="#DC2626" />
          </g>

          <g transform="translate(1365, 505)">
            <circle cx={0} cy={0} r={168} fill="#FEE2E2" stroke="#DC2626" strokeWidth={6} strokeDasharray="34 16" />
            <circle cx={0} cy={0} r={54} fill="#F87171" stroke={INK} strokeWidth={3.5} />
            {[25, 115, 205, 295].map((deg) => (
              <polygon
                key={deg}
                points={`0,${(-60 - pierceT * 155).toFixed(1)} -22,-32 0,-12 22,-32`}
                transform={`rotate(${deg})`}
                fill="#38BDF8"
                stroke={INK}
                strokeWidth={3.5}
              />
            ))}
            <rect x={-235} y={208} width={470} height={54} rx={27} fill="#FEE2E2" stroke="#DC2626" strokeWidth={3.5} />
            <text x={0} y={243} textAnchor="middle" fill="#991B1B" fontSize={25} fontWeight={900}>
              Băng đâm rách màng tế bào!
            </text>
          </g>
        </g>
      ) : (
        <g id="frog-v24-ice-danger-step1" transform="translate(960, 495)">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <g key={deg} transform={`rotate(${deg})`}>
              <polygon points="0,-265 -40,-198 0,-176 40,-198" fill="#38BDF8" stroke={INK} strokeWidth={3.8} />
              <path d="M 0,-102 L 0,-160" stroke="#0284C7" strokeWidth={7} strokeLinecap="round" />
              <polygon points="0,-176 -14,-148 14,-148" fill="#0284C7" />
            </g>
          ))}
          <g transform={`scale(${shrinkScale.toFixed(3)})`}>
            <path
              d="M 0,-135 Q 48,-88 105,-98 Q 92,-38 134,12 Q 86,52 94,108 Q 36,92 -8,132 Q -52,86 -108,94 Q -92,36 -132,-10 Q -88,-54 -96,-108 Q -38,-92 0,-135 Z"
              fill="#FCA5A5"
              stroke="#DC2626"
              strokeWidth={7}
            />
            <circle cx={0} cy={0} r={42} fill="#EF4444" stroke={INK} strokeWidth={4} />
          </g>
          <rect x={-285} y={232} width={570} height={56} rx={28} fill="#FEE2E2" stroke="#DC2626" strokeWidth={3.5} />
          <text x={0} y={268} textAnchor="middle" fill="#991B1B" fontSize={25} fontWeight={900}>
            Băng ngoài hút kiệt nước → Tế bào co rúm chết!
          </text>
        </g>
      )}
    </svg>
  );
};

/* ----------------------------------------------------------------------------
 * 3. FROG_EXTRACELLULAR_FREEZE (SKY_BLUE, 2 steps — Beats 15 & 16)
 * -------------------------------------------------------------------------- */
export const FrogExtracellularFreezeVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const organShrink = interpolate(frame, [6, 38], [1, 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: "block", fontFamily: FONT }}>
      {activeStep === 0 ? (
        <g id="frog-v24-extra-freeze-step0">
          {[
            { x: 750, y: 385 },
            { x: 1170, y: 385 },
            { x: 960, y: 515 },
            { x: 750, y: 645 },
            { x: 1170, y: 645 },
          ].map((ic, i) => (
            <polygon
              key={i}
              points="0,-58 50,-22 36,44 -36,44 -50,-22"
              transform={`translate(${ic.x}, ${ic.y})`}
              fill="#38BDF8"
              stroke="#0369A1"
              strokeWidth={4}
            />
          ))}

          {[
            { x: 540, y: 398 },
            { x: 960, y: 332 },
            { x: 1380, y: 398 },
            { x: 640, y: 650 },
            { x: 1280, y: 650 },
          ].map((c, i) => (
            <g key={i} transform={`translate(${c.x}, ${c.y})`}>
              <circle cx={0} cy={0} r={86} fill="#FEF3C7" stroke={INK} strokeWidth={5} />
              <circle cx={0} cy={0} r={32} fill="#F59E0B" stroke={INK} strokeWidth={3.5} />
              <circle cx={56} cy={-54} r={22} fill="#22C55E" stroke={INK} strokeWidth={3} />
              <path d="M 46,-54 L 53,-47 L 67,-62" fill="none" stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" />
            </g>
          ))}

          <rect x={620} y={754} width={680} height={54} rx={27} fill="#FFFFFF" stroke="#0284C7" strokeWidth={3.5} />
          <text x={960} y={789} textAnchor="middle" fill="#0369A1" fontSize={24} fontWeight={900}>
            Băng chỉ đóng ở khe ngoài • Màng tế bào nguyên vẹn ✓
          </text>
        </g>
      ) : (
        <g id="frog-v24-extra-freeze-step1">
          <ellipse cx={960} cy={500} rx={585} ry={238} fill="#7DD3FC" fillOpacity={0.52} stroke="#0284C7" strokeWidth={5.5} strokeDasharray="16 10" />
          <g transform={`translate(960, 500) scale(${organShrink.toFixed(3)})`}>
            <ellipse cx={0} cy={0} rx={320} ry={172} fill="#FFFBEB" stroke={INK} strokeWidth={5} />
            <path d="M -215,-22 C -215,-98 -75,-112 18,-62 C 42,-42 36,36 -25,62 C -100,88 -215,58 -215,-22 Z" fill="#B45309" stroke={INK} strokeWidth={4.5} />
            <text x={-102} y={8} textAnchor="middle" fill="#FEF3C7" fontSize={30} fontWeight={900}>
              GAN
            </text>
            <path d="M 55,-45 C 125,-95 215,-75 235,0 C 215,75 125,95 55,45 Z" fill="#FB7185" stroke={INK} strokeWidth={4.5} />
            <text x={148} y={10} textAnchor="middle" fill="#FFF1F2" fontSize={28} fontWeight={900}>
              CƠ
            </text>
          </g>
          {[
            { x1: 660, y1: 500, x2: 430, y2: 500 },
            { x1: 1260, y1: 500, x2: 1490, y2: 500 },
            { x1: 960, y1: 350, x2: 960, y2: 274 },
          ].map((ar, idx) => (
            <line key={idx} x1={ar.x1} y1={ar.y1} x2={ar.x2} y2={ar.y2} stroke="#0284C7" strokeWidth={9} strokeLinecap="round" />
          ))}
          <rect x={575} y={754} width={770} height={54} rx={27} fill="#FFFFFF" stroke="#0369A1" strokeWidth={3.5} />
          <text x={960} y={789} textAnchor="middle" fill="#0369A1" fontSize={24} fontWeight={900}>
            Đẩy hơn 50% nước ra khoang ngoài tạo lớp đệm băng an toàn
          </text>
        </g>
      )}
    </svg>
  );
};

/* ----------------------------------------------------------------------------
 * 4. FROG_AUTUMN_CYCLES (WARM_CREAM, 2 steps — Beats 21 & 22)
 * -------------------------------------------------------------------------- */
export const FrogAutumnCyclesVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const barStepT = interpolate(frame, [4, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: "block", fontFamily: FONT }}>
      {activeStep === 0 ? (
        <g id="frog-v24-autumn-cycles-step0">
          <line x1={220} y1={505} x2={1700} y2={505} stroke="#0284C7" strokeWidth={5} strokeDasharray="16 12" />
          <rect x={140} y={477} width={108} height={56} rx={18} fill="#0284C7" stroke={INK} strokeWidth={3.5} />
          <text x={194} y={514} textAnchor="middle" fill="#FFFFFF" fontSize={26} fontWeight={900}>
            0°C
          </text>

          <path
            d="M 270,505 Q 380,305 490,505 T 710,505 T 930,505 T 1150,505 T 1370,505 T 1590,505"
            fill="none"
            stroke="#EA580C"
            strokeWidth={11}
            strokeLinecap="round"
          />

          {[380, 820, 1260].map((sx, i) => (
            <g key={i} transform={`translate(${sx}, 335)`}>
              <circle cx={0} cy={0} r={34} fill="#FACC15" stroke={INK} strokeWidth={3.5} />
              <text x={0} y={-48} textAnchor="middle" fill="#B45309" fontSize={22} fontWeight={900}>
                Trưa tan
              </text>
            </g>
          ))}
          {[600, 1040, 1480].map((mx, i) => (
            <g key={i} transform={`translate(${mx}, 665)`}>
              <circle cx={0} cy={0} r={34} fill="#38BDF8" stroke={INK} strokeWidth={3.5} />
              <text x={0} y={62} textAnchor="middle" fill="#0369A1" fontSize={22} fontWeight={900}>
                Đêm đông
              </text>
            </g>
          ))}

          <rect x={620} y={754} width={680} height={54} rx={27} fill="#FFFFFF" stroke="#EA580C" strokeWidth={3.5} />
          <text x={960} y={789} textAnchor="middle" fill="#9A3412" fontSize={25} fontWeight={900}>
            10 – 15 chu kỳ đông rồi tan trước khi vào đông sâu
          </text>
        </g>
      ) : (
        <g id="frog-v24-autumn-cycles-step1">
          {[0, 1, 2, 3, 4, 5].map((bi) => {
            const maxH = 95 + bi * 62;
            const curH = Math.round(maxH * Math.min(1, Math.max(0.15, barStepT * 1.4 - bi * 0.08)));
            const bx = 365 + bi * 210;
            return (
              <g key={bi}>
                <rect
                  x={bx}
                  y={700 - curH}
                  width={136}
                  height={curH}
                  rx={20}
                  fill={bi >= 4 ? "#F59E0B" : "#FACC15"}
                  stroke={INK}
                  strokeWidth={4.5}
                />
                <text x={bx + 68} y={736} textAnchor="middle" fill="#92400E" fontSize={22} fontWeight={900}>
                  Lần {bi * 2 + 2}
                </text>
              </g>
            );
          })}
          <path d="M 380,555 Q 920,410 1480,255" fill="none" stroke="#16A34A" strokeWidth={10} strokeLinecap="round" />
          <polygon points="1512,246 1456,236 1474,286" fill="#16A34A" />
          <rect x={575} y={756} width={770} height={52} rx={26} fill="#FFFFFF" stroke="#15803D" strokeWidth={3.5} />
          <text x={960} y={790} textAnchor="middle" fill="#166534" fontSize={24} fontWeight={900}>
            Mỗi chu kỳ đông–tan kích hoạt gan nạp thêm kho đường dự trữ!
          </text>
        </g>
      )}
    </svg>
  );
};

/* ----------------------------------------------------------------------------
 * 5. FROG_GLUCOSE_ANTIFREEZE (MINT_FRESH, 3 steps — Beats 23, 24, 26)
 *    - Standard scientific spelling on SVG graphics: "Glucose" & "Urê"
 *    - Beat 24 middle column synchronized to "2 – 10×" matching Beat 25!
 * -------------------------------------------------------------------------- */
export const FrogGlucoseAntifreezeVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const barGrow = interpolate(frame, [4, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: "block", fontFamily: FONT }}>
      {activeStep === 0 && (
        <g id="frog-v24-glucose-step0">
          <g transform="translate(510, 505)">
            <circle cx={0} cy={0} r={195} fill="#FEF08A" opacity={0.45} />
            <path
              d="M -165,-38 C -165,-145 35,-168 165,-96 C 205,-66 192,42 108,76 C 12,118 -165,80 -165,-38 Z"
              fill="#B45309"
              stroke={INK}
              strokeWidth={5.5}
            />
            <text x={-6} y={-8} textAnchor="middle" fill="#FEF3C7" fontSize={40} fontWeight={900}>
              GAN
            </text>
            <text x={-6} y={34} textAnchor="middle" fill="#FDE047" fontSize={23} fontWeight={900}>
              Phá vỡ kho đường!
            </text>
          </g>

          <g transform="translate(1210, 505)">
            <path d="M -460,0 C -220,-105 140,105 440,0" fill="none" stroke={INK} strokeWidth={112} strokeLinecap="round" />
            <path d="M -460,0 C -220,-105 140,105 440,0" fill="none" stroke="#EF4444" strokeWidth={96} strokeLinecap="round" />
            {[0, 1, 2, 3, 4, 5, 6].map((gi) => {
              const t = (frame * 0.015 + gi / 7) % 1;
              const gx = -430 + t * 840;
              const gy = Math.sin(t * Math.PI * 2) * -42;
              return (
                <g key={gi} transform={`translate(${gx.toFixed(1)}, ${gy.toFixed(1)})`}>
                  <circle cx={0} cy={0} r={18} fill="#FACC15" stroke={INK} strokeWidth={3} />
                  <text x={0} y={7} textAnchor="middle" fill={INK} fontSize={18} fontWeight={900}>
                    G
                  </text>
                </g>
              );
            })}
          </g>

          <rect x={600} y={754} width={720} height={54} rx={27} fill="#FFFFFF" stroke="#D97706" strokeWidth={3.5} />
          <text x={960} y={789} textAnchor="middle" fill="#92400E" fontSize={24} fontWeight={900}>
            Gan xả ồ ạt đường Glucose chạy dọc mạch máu khắp cơ thể
          </text>
        </g>
      )}

      {activeStep === 1 && (
        <g id="frog-v24-glucose-step1">
          <line x1={320} y1={725} x2={1600} y2={725} stroke={INK} strokeWidth={5} />

          <g transform="translate(520, 725)">
            <rect x={-90} y={-28} width={180} height={28} rx={10} fill="#64748B" stroke={INK} strokeWidth={4} />
            <text x={0} y={-44} textAnchor="middle" fill="#334155" fontSize={28} fontWeight={900}>
              1×
            </text>
            <text x={0} y={44} textAnchor="middle" fill={INK} fontSize={24} fontWeight={900}>
              Người bình thường
            </text>
          </g>

          <g transform="translate(940, 725)">
            <rect x={-90} y={-88} width={180} height={88} rx={14} fill="#EF4444" stroke={INK} strokeWidth={4} />
            <text x={0} y={-106} textAnchor="middle" fill="#DC2626" fontSize={28} fontWeight={900}>
              2 – 10×
            </text>
            <text x={0} y={44} textAnchor="middle" fill="#991B1B" fontSize={24} fontWeight={900}>
              Ngưỡng nguy kịch người
            </text>
          </g>

          <g transform="translate(1390, 725)">
            <rect
              x={-110}
              y={-Math.round(435 * barGrow)}
              width={220}
              height={Math.round(435 * barGrow)}
              rx={22}
              fill="#F59E0B"
              stroke={INK}
              strokeWidth={5}
            />
            <rect x={-140} y={-Math.round(435 * barGrow) - 70} width={280} height={56} rx={28} fill="#DC2626" stroke="#FEF08A" strokeWidth={3.5} />
            <text x={0} y={-Math.round(435 * barGrow) - 33} textAnchor="middle" fill="#FFFFFF" fontSize={30} fontWeight={900}>
              100 – 200×!
            </text>
            <text x={0} y={44} textAnchor="middle" fill="#92400E" fontSize={26} fontWeight={900}>
              Ếch gỗ chống đông
            </text>
          </g>
        </g>
      )}

      {activeStep === 2 && (
        <g id="frog-v24-glucose-step2">
          <g transform="translate(470, 515)">
            <rect x={-175} y={-125} width={350} height={82} rx={30} fill="#FACC15" stroke={INK} strokeWidth={4.5} />
            <text x={0} y={-75} textAnchor="middle" fill={INK} fontSize={28} fontWeight={900}>
              Đường Glucose
            </text>
            <text x={0} y={-8} textAnchor="middle" fill="#15803D" fontSize={44} fontWeight={900}>
              +
            </text>
            <rect x={-175} y={24} width={350} height={82} rx={30} fill="#38BDF8" stroke={INK} strokeWidth={4.5} />
            <text x={0} y={74} textAnchor="middle" fill="#FFFFFF" fontSize={28} fontWeight={900}>
              Urê tích trữ
            </text>
          </g>

          <g transform="translate(835, 515)">
            <path d="M -70,0 L 62,0" stroke="#D97706" strokeWidth={11} strokeLinecap="round" />
            <polygon points="92,0 48,-26 48,26" fill="#D97706" />
          </g>

          <g transform="translate(1310, 515)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <polygon
                key={deg}
                points="0,-245 -28,-178 0,-162 28,-178"
                transform={`rotate(${deg})`}
                fill="#7DD3FC"
                stroke="#0284C7"
                strokeWidth={3.5}
              />
            ))}
            <circle cx={0} cy={0} r={150} fill="#F59E0B" stroke={INK} strokeWidth={5.5} />
            <circle cx={0} cy={0} r={126} fill="#FDE68A" stroke="#D97706" strokeWidth={4} />
            <text x={0} y={-8} textAnchor="middle" fill="#92400E" fontSize={30} fontWeight={900}>
              SI RÔ ĐẶC
            </text>
            <text x={0} y={32} textAnchor="middle" fill="#B45309" fontSize={24} fontWeight={900}>
              CHỐNG ĐÔNG ✓
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ----------------------------------------------------------------------------
 * 6. FROG_ALASKA_EXTREME (LAVENDER_NIGHT, 2 steps — Beats 29 & 30)
 *    - Step 0: Giant thermometer dropping deep to -18°C in snowy Alaska spruce woods
 *    - Step 1: Horizontal 7-Month Snow Calendar Strip ("Th1" -> "Th7") — ZERO clock dial!
 * -------------------------------------------------------------------------- */
export const FrogAlaskaExtremeVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const mercuryDrop = interpolate(frame, [4, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const monthProgress = interpolate(frame, [2, 42], [1, 7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: "block", fontFamily: FONT }}>
      {activeStep === 0 ? (
        <g id="frog-v24-alaska-step0">
          <g transform="translate(580, 505)">
            <rect x={-36} y={-245} width={72} height={370} rx={36} fill="#0F172A" stroke="#BAE6FD" strokeWidth={5} />
            <circle cx={0} cy={145} r={66} fill="#0F172A" stroke="#BAE6FD" strokeWidth={5} />
            <rect
              x={-16}
              y={Math.round(-130 + mercuryDrop * 205)}
              width={32}
              height={Math.round(270 - mercuryDrop * 205)}
              rx={12}
              fill="#38BDF8"
            />
            <circle cx={0} cy={145} r={46} fill="#38BDF8" />
            <line x1={44} y1={75} x2={98} y2={75} stroke="#38BDF8" strokeWidth={6} />
            <rect x={108} y={35} width={220} height={80} rx={26} fill="#0284C7" stroke="#E0F2FE" strokeWidth={4} />
            <text x={218} y={88} textAnchor="middle" fill="#FFFFFF" fontSize={44} fontWeight={900}>
              -18°C
            </text>
          </g>

          <g transform="translate(1285, 540)">
            <polygon points="-140,145 0,-185 140,145" fill="#1E3A5F" stroke="#7DD3FC" strokeWidth={4} />
            <polygon points="-70,-18 0,-185 70,-18 22,-42 0,-20 -22,-42" fill="#F8FAFC" />
            <CuteWoodFrog
              x={0}
              y={178}
              scale={1.36}
              frame={frame}
              pose="frozen_flat"
              freezeState="frozen_solid"
              accessory="scarf_red"
            />
            <text x={0} y={248} textAnchor="middle" fill="#BAE6FD" fontSize={26} fontWeight={900}>
              Rừng tuyết Alaska • Chịu rét sâu tới -18°C
            </text>
          </g>
        </g>
      ) : (
        <g id="frog-v24-alaska-step1">
          {/* Sleek Horizontal 7-Month Frozen Snow Calendar Strip: Th1 -> Th7 (Zero clock circle!) */}
          <g id="frog-b30-7month-calendar-strip" transform="translate(260, 295)">
            {/* Connecting snowy rail */}
            <line x1={80} y1={84} x2={1320} y2={84} stroke="#38BDF8" strokeWidth={8} strokeDasharray="14 10" opacity={0.65} />
            {Array.from({ length: 7 }).map((_, mi) => {
              const bx = mi * 204;
              const lit = mi + 1 <= Math.ceil(monthProgress);
              return (
                <g key={mi} transform={`translate(${bx}, 0)`}>
                  {/* Frosty month tile */}
                  <rect
                    x={0}
                    y={14}
                    width={176}
                    height={146}
                    rx={26}
                    fill={lit ? "#0284C7" : "#1E293B"}
                    stroke={lit ? "#E0F2FE" : "#475569"}
                    strokeWidth={4.5}
                  />
                  {/* Crisp white snow cap along top of each month tile */}
                  <path
                    d="M 12,38 Q 48,14 88,28 T 164,34 L 164,14 L 12,14 Z"
                    fill="#F8FAFC"
                    opacity={lit ? 0.92 : 0.35}
                  />
                  {/* Month label Th1..Th7 */}
                  <text x={88} y={96} textAnchor="middle" fill="#FFFFFF" fontSize={40} fontWeight={900}>
                    Th{mi + 1}
                  </text>
                  {/* Tiny snowflake star */}
                  <g transform="translate(88, 132)" stroke="#BAE6FD" strokeWidth={3} strokeLinecap="round" opacity={lit ? 0.95 : 0.35}>
                    <line x1={0} y1={-10} x2={0} y2={10} />
                    <line x1={-9} y1={-5} x2={9} y2={5} />
                    <line x1={-9} y1={5} x2={9} y2={-5} />
                  </g>
                </g>
              );
            })}
          </g>

          {/* Frozen Wood Frog resting motionless beneath the 7 winter months */}
          <CuteWoodFrog
            x={960}
            y={685}
            scale={1.38}
            frame={frame}
            pose="frozen_flat"
            freezeState="frozen_solid"
            accessory="scarf_red"
          />

          <rect x={710} y={744} width={500} height={54} rx={27} fill="#0284C7" stroke="#E0F2FE" strokeWidth={3.5} />
          <text x={960} y={779} textAnchor="middle" fill="#FFFFFF" fontSize={25} fontWeight={900}>
            7 THÁNG ĐÔNG CỨNG (~193 NGÀY)
          </text>
        </g>
      )}
    </svg>
  );
};

/* ----------------------------------------------------------------------------
 * 7. FROG_INSIDE_OUT_THAW (WARM_CREAM, 3 steps — Beats 34, 35, 37)
 *    - Step 0: Warm compact heart lowered neatly onto chest/belly below chin (ZERO face overlap!)
 *    - Step 1: Softly curving, organically branching crimson blood vessels (NO straight X!)
 *    - Step 2: ~10 hours recovery timeline -> healthy frog hops energetically
 * -------------------------------------------------------------------------- */
export const FrogInsideOutThawVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 1 + Math.sin(frame * 0.22) * 0.1;
  const progressT = interpolate(frame, [4, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: "block", fontFamily: FONT }}>
      {activeStep === 0 && (
        <g id="frog-v24-thaw-step0" transform="translate(960, 505)">
          {/* Outer frosty shell still icy blue */}
          <ellipse cx={0} cy={0} rx={305} ry={192} fill="#BAE6FD" fillOpacity={0.58} stroke="#0284C7" strokeWidth={6} strokeDasharray="16 10" />
          {/* Frog placed cleanly so head sits around y=42 and chest/belly sits around y=78..112 */}
          <CuteWoodFrog
            x={0}
            y={114}
            scale={1.52}
            frame={frame}
            pose="frozen_flat"
            freezeState="frosting"
            hideEmotionBadge={true}
            accessory="scarf_red"
          />
          {/* Compact warm glowing heart placed neatly on chest/belly BELOW frog's chin (y=82 -> zero face overlap!) */}
          <g id="frog-b34-chest-heart-glow" transform="translate(0, 82)">
            <circle cx={0} cy={0} r={44} fill="#FB7185" opacity={0.28} />
            <circle cx={0} cy={0} r={28} fill="#FACC15" opacity={0.44} />
            <path
              d="M 0,14 C -18,-1 -22,-16 -11,-23 C -4,-27 0,-19 0,-15 C 0,-19 4,-27 11,-23 C 22,-16 18,-1 0,14 Z"
              fill="#EF4444"
              stroke="#FEF08A"
              strokeWidth={3}
            />
          </g>
          <rect x={-310} y={225} width={620} height={54} rx={27} fill="#FFFFFF" stroke="#EA580C" strokeWidth={3.5} />
          <text x={0} y={260} textAnchor="middle" fill="#9A3412" fontSize={25} fontWeight={900}>
            Tim &amp; não tan ấm trước cả lớp băng ngoài da!
          </text>
        </g>
      )}

      {activeStep === 1 && (
        <g id="frog-v24-thaw-step1" transform="translate(960, 505)">
          {/* Organic Curved Branching Arterial Vessels flowing softly outward to Left & Right (NO straight X!) */}
          <g id="frog-b35-curved-vessels" fill="none" strokeLinecap="round">
            {/* Left main branching artery + soft forks */}
            <path d="M -52,-12 C -140,-58 -245,-62 -395,-18" stroke="#DC2626" strokeWidth={11} />
            <path d="M -180,-48 C -240,-98 -310,-128 -415,-122" stroke="#EF4444" strokeWidth={7} />
            <path d="M -58,28 C -150,74 -255,112 -405,94" stroke="#DC2626" strokeWidth={10} />
            <path d="M -210,82 C -265,126 -330,152 -420,156" stroke="#F87171" strokeWidth={6.5} />
            {/* Right main branching artery + soft forks */}
            <path d="M 52,-12 C 140,-58 245,-62 395,-18" stroke="#DC2626" strokeWidth={11} />
            <path d="M 180,-48 C 240,-98 310,-128 415,-122" stroke="#EF4444" strokeWidth={7} />
            <path d="M 58,28 C 150,74 255,112 405,94" stroke="#DC2626" strokeWidth={10} />
            <path d="M 210,82 C 265,126 330,152 420,156" stroke="#F87171" strokeWidth={6.5} />
          </g>
          {/* Warm animated blood pulse dots gliding outward along vessels */}
          {[0, 1, 2].map((di) => {
            const p = ((frame * 0.025 + di * 0.33) % 1);
            const dx = 95 + p * 275;
            return (
              <g key={di} fill="#FEF08A" stroke="#DC2626" strokeWidth={2.5}>
                <circle cx={-dx} cy={Number((-42 + Math.sin(p * Math.PI) * -14).toFixed(1))} r={9} />
                <circle cx={dx} cy={Number((-42 + Math.sin(p * Math.PI) * -14).toFixed(1))} r={9} />
                <circle cx={-dx} cy={Number((62 + p * 30).toFixed(1))} r={8} />
                <circle cx={dx} cy={Number((62 + p * 30).toFixed(1))} r={8} />
              </g>
            );
          })}
          {/* Pulse Shockwaves */}
          <circle
            cx={0}
            cy={0}
            r={Number((86 + (frame % 36) * 4.8).toFixed(1))}
            fill="none"
            stroke="#FB7185"
            strokeWidth={5}
            opacity={Math.max(0, 1 - (frame % 36) / 36).toFixed(2)}
          />
          {/* Beating Crimson Heart */}
          <g transform={`scale(${pulse.toFixed(3)})`}>
            <path
              d="M 0,84 C -104,16 -124,-60 -70,-94 C -30,-118 0,-78 0,-58 C 0,-78 30,-118 70,-94 C 124,-60 104,16 0,84 Z"
              fill="#EF4444"
              stroke={INK}
              strokeWidth={6}
            />
          </g>
          <rect x={-295} y={232} width={590} height={54} rx={27} fill="#FFFFFF" stroke="#DC2626" strokeWidth={3.5} />
          <text x={0} y={267} textAnchor="middle" fill="#991B1B" fontSize={25} fontWeight={900}>
            THÌNH THỊCH! Nhịp tim đầu tiên bơm máu ấm ra tứ chi
          </text>
        </g>
      )}

      {activeStep === 2 && (
        <g id="frog-v24-thaw-step2">
          <g transform="translate(360, 325)">
            <rect x={0} y={0} width={1200} height={34} rx={17} fill="#FDE68A" stroke={INK} strokeWidth={4} />
            <rect x={4} y={4} width={Math.max(36, Math.round(1192 * progressT))} height={26} rx={13} fill="#22C55E" />
            {[
              { x: 0, label: "0 giờ (Bắt đầu tan)" },
              { x: 600, label: "5 giờ (Thở lại)" },
              { x: 1200, label: "~10 giờ (Tỉnh táo 100%!)" },
            ].map((m, i) => (
              <g key={i} transform={`translate(${m.x}, 17)`}>
                <circle cx={0} cy={0} r={18} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
                <text x={0} y={-32} textAnchor="middle" fill={INK} fontSize={23} fontWeight={900}>
                  {m.label}
                </text>
              </g>
            ))}
          </g>

          <CuteWoodFrog
            x={960}
            y={735}
            scale={1.55}
            frame={frame}
            pose="hop"
            freezeState="normal"
            emotion="happy"
            accessory="scarf_red"
          />
        </g>
      )}
    </svg>
  );
};

/* ----------------------------------------------------------------------------
 * 8. FROG_VERNAL_POOL_RACE (SKY_BLUE, 3 steps — Beats 43, 46, 48)
 *    - Step 0: Cute sleeping green frog in mud (curved closed eyes + 2 tucked legs!) vs Wood Frog first to pool
 *    - Step 1: Translucent clustered frog eggs radiating gentle warmth in fish-free pool
 *    - Step 2: Evaporating pool under summer sun — legged tadpoles racing to shore!
 * -------------------------------------------------------------------------- */
export const FrogVernalPoolRaceVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const evapDrop = interpolate(frame, [0, 48], [0, 75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: "block", fontFamily: FONT }}>
      {activeStep === 0 && (
        <g id="frog-v24-vernal-step0">
          {/* Left: Frozen Lake & Cute Sleeping Green Frog in Deep Mud (2 curved sleeping eyes + 2 tucked legs!) */}
          <g transform="translate(520, 510)">
            <rect x={-310} y={-210} width={620} height={36} rx={12} fill="#E0F2FE" stroke="#64748B" strokeWidth={4} />
            <rect x={-310} y={-174} width={620} height={170} fill="#0369A1" opacity={0.72} />
            <rect x={-310} y={-4} width={620} height={164} rx={18} fill="#78350F" stroke={INK} strokeWidth={4} />
            <g id="frog-b43-sleeping-mud-frog" transform="translate(0, 84)" stroke={INK} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx={-56} cy={12} rx={21} ry={14} fill="#16A34A" />
              <ellipse cx={56} cy={12} rx={21} ry={14} fill="#16A34A" />
              <ellipse cx={0} cy={0} rx={58} ry={34} fill="#22C55E" />
              <ellipse cx={0} cy={12} rx={36} ry={15} fill="#DCFCE7" stroke="none" />
              <circle cx={-22} cy={-26} r={14} fill="#22C55E" />
              <circle cx={22} cy={-26} r={14} fill="#22C55E" />
              <path d="M -29,-26 Q -22,-20 -15,-26 M 15,-26 Q 22,-20 29,-26" fill="none" stroke={INK} strokeWidth={3.2} />
              <ellipse cx={-34} cy={-6} rx={8} ry={4.5} fill="#FDA4AF" opacity={0.65} stroke="none" />
              <ellipse cx={34} cy={-6} rx={8} ry={4.5} fill="#FDA4AF" opacity={0.65} stroke="none" />
              <path d="M -12,-4 Q 0,4 12,-4" fill="none" stroke={INK} strokeWidth={2.8} />
            </g>
            <text x={0} y={214} textAnchor="middle" fill="#334155" fontSize={24} fontWeight={900}>
              Ếch khác: còn ngủ sâu dưới hồ băng
            </text>
          </g>

          {/* Right: Wood Frog Arriving First at Sunlit Fish-Free Snowmelt Pool */}
          <g transform="translate(1390, 510)">
            <ellipse cx={0} cy={88} rx={295} ry={78} fill="#38BDF8" stroke="#0284C7" strokeWidth={5} />
            <ellipse cx={0} cy={80} rx={235} ry={48} fill="#BAE6FD" opacity={0.62} />
            <CuteWoodFrog
              x={-110}
              y={54}
              scale={1.24}
              frame={frame}
              pose="hop"
              freezeState="normal"
              emotion="proud"
              hideEmotionBadge={true}
              accessory="scarf_red"
            />
            <rect x={-235} y={182} width={470} height={54} rx={27} fill="#FFFFFF" stroke="#0284C7" strokeWidth={3.5} />
            <text x={0} y={217} textAnchor="middle" fill="#0369A1" fontSize={24} fontWeight={900}>
              Ếch gỗ tới vũng nước xuân đầu tiên ✓
            </text>
          </g>
        </g>
      )}

      {activeStep === 1 && (
        <g id="frog-v24-vernal-step1" transform="translate(960, 505)">
          <ellipse cx={0} cy={20} rx={480} ry={208} fill="#38BDF8" fillOpacity={0.38} stroke="#0284C7" strokeWidth={5} />
          <circle cx={0} cy={10} r={Number((175 + Math.sin(frame * 0.1) * 10).toFixed(1))} fill="#FEF08A" opacity={0.32} />
          <circle cx={0} cy={10} r={128} fill="#FDE047" opacity={0.38} />

          {[
            { x: 0, y: 0 },
            { x: -58, y: -22 },
            { x: 58, y: -22 },
            { x: -34, y: 42 },
            { x: 34, y: 42 },
            { x: 0, y: -62 },
            { x: -88, y: 30 },
            { x: 88, y: 30 },
            { x: 0, y: 74 },
          ].map((eg, i) => (
            <g key={i} transform={`translate(${eg.x}, ${eg.y})`}>
              <circle cx={0} cy={0} r={34} fill="#FFFFFF" fillOpacity={0.68} stroke="#0284C7" strokeWidth={3} />
              <circle cx={0} cy={0} r={13} fill={INK} />
              <circle cx={-4} cy={-4} r={3.5} fill="#FFFFFF" stroke="none" />
            </g>
          ))}

          <rect x={-325} y={240} width={650} height={54} rx={27} fill="#FFFFFF" stroke="#EA580C" strokeWidth={3.5} />
          <text x={0} y={275} textAnchor="middle" fill="#9A3412" fontSize={24} fontWeight={900}>
            Trứng tụ sát sưởi ấm nhau • Vũng nước không có cá săn mồi
          </text>
        </g>
      )}

      {activeStep === 2 && (
        <g id="frog-v24-vernal-step2">
          <g transform="translate(1520, 315)">
            <circle cx={0} cy={0} r={82} fill="#FEF08A" opacity={0.45} />
            <circle cx={0} cy={0} r={54} fill="#FACC15" stroke={INK} strokeWidth={4} />
          </g>
          {[620, 860, 1100].map((ex, i) => (
            <path
              key={i}
              d={`M ${ex},${(540 - ((frame * 2 + i * 35) % 105)).toFixed(1)} Q ${ex - 16},${(505 - ((frame * 2 + i * 35) % 105)).toFixed(1)} ${ex},${(470 - ((frame * 2 + i * 35) % 105)).toFixed(1)}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.78}
            />
          ))}

          <rect
            x={320}
            y={Math.round(525 + evapDrop)}
            width={920}
            height={Math.round(205 - evapDrop)}
            rx={28}
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth={5}
          />
          <path d="M 1180,730 C 1220,590 1350,550 1620,550 L 1620,730 Z" fill="#4ADE80" stroke={INK} strokeWidth={5} />

          {[0, 1, 2].map((ti) => {
            const tx = 560 + ti * 185 + ((frame * 2.2) % 90);
            const ty = Math.round(612 + evapDrop * 0.5 + (ti % 2) * 32);
            return (
              <g key={ti} transform={`translate(${tx.toFixed(1)}, ${ty})`} stroke={INK} strokeWidth={3}>
                <path d="M -22,0 Q -48,-10 -68,0 Q -48,10 -22,0 Z" fill="#64748B" />
                <path d="M -10,12 L -20,24 M -4,12 L -10,25" stroke="#475569" strokeWidth={4} strokeLinecap="round" />
                <ellipse cx={0} cy={0} rx={24} ry={16} fill="#92400E" />
                <circle cx={10} cy={-4} r={4} fill="#FFFFFF" stroke="none" />
                <circle cx={11} cy={-4} r={2} fill={INK} stroke="none" />
              </g>
            );
          })}

          <rect x={580} y={754} width={760} height={54} rx={27} fill="#FFFFFF" stroke="#DC2626" strokeWidth={3.5} />
          <text x={960} y={789} textAnchor="middle" fill="#991B1B" fontSize={24} fontWeight={900}>
            Nước bốc hơi dần → Nòng nọc gấp rút mọc chân chạy lên bờ!
          </text>
        </g>
      )}
    </svg>
  );
};
