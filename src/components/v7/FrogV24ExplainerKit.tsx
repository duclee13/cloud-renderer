import React from "react";
import { Easing, interpolate } from "remotion";
import { CuteWoodFrog } from "../AnimalSpriteKit";
import { GroundShadow } from "../SceneBackdropKit";
import type { ForestDetailId } from "../../lib/v7/episodeJsonSchema";

const INK = "#1E293B";
const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

export function isFrogV24ExplainerMode(detail?: ForestDetailId): boolean {
  return typeof detail === "string" && detail.startsWith("V24_FROG_EXPLAIN_");
}

/* ============================================================================
 * REUSABLE TEASER SILHOUETTE: 8-Legged Chubby Glowing Tardigrade (Gấu nước)
 *   - Pure crisp flat 2D vectors (zero blur filters — layered semi-transparent contour halo!)
 *   - Used in Beat 60 (Ice vs Fire), Beat 61 (Deep Space + TẬP 12 badge), Beat 62 (Mini cameo)
 * ========================================================================== */

export const TardigradeSilhouetteHero: React.FC<{
  x: number;
  y: number;
  scale?: number;
  frame: number;
  glowColor?: string;
}> = ({ x, y, scale = 1, frame, glowColor = "#38BDF8" }) => {
  const floatY = Math.sin(frame * 0.07) * 10;
  const legWiggle = Math.sin(frame * 0.14) * 5;

  return (
    <g
      id="v24-tardigrade-silhouette-teaser"
      transform={`translate(${x.toFixed(1)}, ${(y + floatY).toFixed(1)}) scale(${scale.toFixed(3)})`}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx={0} cy={0} rx={165} ry={102} fill={glowColor} opacity={0.12} stroke="none" />
      <ellipse cx={0} cy={0} rx={138} ry={82} fill={glowColor} opacity={0.18} stroke="none" />

      {/* Back row of 4 chubby clawed stubby legs */}
      <g fill="#0F172A" stroke={glowColor} strokeWidth={4}>
        <path d="M -72,30 C -84,56 -72,72 -58,68 C -48,64 -48,46 -50,30 Z" transform={`rotate(${legWiggle.toFixed(1)}, -64, 30)`} />
        <path d="M -26,38 C -34,64 -20,78 -8,72 C 2,66 2,48 -2,36 Z" transform={`rotate(${(-legWiggle).toFixed(1)}, -16, 38)`} />
        <path d="M 24,38 C 18,64 32,78 44,72 C 54,66 52,48 46,36 Z" transform={`rotate(${legWiggle.toFixed(1)}, 34, 38)`} />
        <path d="M 74,26 C 72,54 88,68 98,60 C 106,52 100,34 92,22 Z" transform={`rotate(${(-legWiggle).toFixed(1)}, 86, 26)`} />
      </g>

      {/* Outer Cyan Rim Halo + Chubby 4-Segment Water-Bear Silhouette Body */}
      <path
        d="M -112,-2 C -114,-34 -88,-52 -58,-48 C -40,-60 -12,-62 10,-52 C 34,-62 66,-56 84,-42 C 110,-38 122,-16 118,8 C 114,34 86,44 58,42 C 36,50 6,52 -16,44 C -42,50 -74,44 -94,28 C -108,22 -114,12 -112,-2 Z"
        fill="#0F172A"
        stroke={glowColor}
        strokeWidth={6}
      />
      <path
        d="M -52,-42 C -46,-14 -46,16 -52,36 M -4,-46 C 2,-16 2,18 -4,40 M 46,-42 C 52,-14 52,16 46,36"
        fill="none"
        stroke={glowColor}
        strokeWidth={3.2}
        opacity={0.55}
      />

      {/* Front row of 4 chubby stubby legs with cute tiny glowing claws */}
      <g fill="#1E293B" stroke={glowColor} strokeWidth={3.8}>
        <g transform={`rotate(${(-legWiggle).toFixed(1)}, -76, 22)`}>
          <path d="M -86,20 C -96,46 -84,64 -70,60 C -60,56 -60,38 -64,22 Z" />
          <path d="M -82,58 L -88,68 M -75,60 L -78,70 M -68,58 L -68,68" stroke="#BAE6FD" strokeWidth={2.5} />
        </g>
        <g transform={`rotate(${legWiggle.toFixed(1)}, -32, 30)`}>
          <path d="M -42,28 C -48,56 -34,72 -20,66 C -10,60 -12,42 -18,28 Z" />
          <path d="M -36,66 L -40,76 M -28,68 L -29,78 M -20,65 L -18,75" stroke="#BAE6FD" strokeWidth={2.5} />
        </g>
        <g transform={`rotate(${(-legWiggle).toFixed(1)}, 20, 30)`}>
          <path d="M 10,28 C 6,56 20,72 34,66 C 44,60 40,42 34,28 Z" />
          <path d="M 16,66 L 14,76 M 24,68 L 24,78 M 32,65 L 35,75" stroke="#BAE6FD" strokeWidth={2.5} />
        </g>
        <g transform={`rotate(${legWiggle.toFixed(1)}, 68, 20)`}>
          <path d="M 60,18 C 60,46 76,60 88,52 C 96,44 90,26 82,16 Z" />
          <path d="M 68,52 L 68,62 M 76,54 L 78,64 M 84,50 L 90,59" stroke="#BAE6FD" strokeWidth={2.5} />
        </g>
      </g>

      {/* Iconic Round Circular Tardigrade Snout + 2 Tiny Glowing Mystery Eyes */}
      <ellipse cx={-106} cy={4} rx={14} ry={17} fill="#020617" stroke="#7DD3FC" strokeWidth={4} />
      <ellipse cx={-106} cy={4} rx={6} ry={8} fill={glowColor} opacity={0.45} stroke="none" />
      <circle cx={-82} cy={-16} r={5.5} fill="#E0F2FE" stroke="none" />
      <circle cx={-66} cy={-14} r={4.5} fill="#E0F2FE" stroke="none" />
    </g>
  );
};

/* ============================================================================
 * MAIN COMPONENT: FrogV24ExplainerKit (23 Non-SVG CLEAN_EXPLAINER Beats)
 *   - Drawn full-bleed inside y=220..780 directly over CleanExplainerStage
 *   - All bottom caption pills kept comfortably above y=790 horizon (bottom <= 740,
 *     and Beats 17/27/33 pills lifted to y <= 665, >= 125px clear above horizon!)
 *   - Zero white PowerPoint frames, zero blur/dropShadow/foreignObject!
 * ========================================================================== */

export const FrogV24ExplainerKit: React.FC<{
  mode: ForestDetailId;
  frame: number;
  localFrame: number;
  durationFrames: number;
}> = ({ mode, frame, localFrame, durationFrames }) => {
  const activeLocal = Math.max(0, localFrame);
  const safeDur = Math.max(1, durationFrames);
  const popT = interpolate(activeLocal, [0, 14], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.25)),
  });

  return (
    <g id={`frog-v24-explainer-kit-${mode}`} style={{ fontFamily: FONT }}>
      {/* BEAT 5: Nhưng tôi chưa chết — Frozen frog with warm golden spark & glowing gold crack */}
      {mode === "V24_FROG_EXPLAIN_B05_NOT_DEAD" && (() => {
        const glowPulse = 0.55 + 0.45 * Math.sin(frame * 0.14);
        const crackT = interpolate(activeLocal, [8, 38], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <g>
            <circle cx={960} cy={635} r={Number((175 + glowPulse * 24).toFixed(1))} fill="#FACC15" opacity={0.14} />
            <circle cx={960} cy={635} r={115} fill="#FEF08A" opacity={0.16} />
            <GroundShadow cx={960} cy={792} rx={165} ry={18} />
            <CuteWoodFrog
              x={960}
              y={748}
              scale={1.48}
              frame={frame}
              pose="frozen_flat"
              freezeState="frozen_solid"
              heartGlowT={0.55 + 0.45 * glowPulse}
              accessory="scarf_red"
            />
            <path
              d="M 900,665 L 938,632 L 962,648 L 1012,608 L 1044,622"
              fill="none"
              stroke="#FDE047"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={crackT.toFixed(2)}
            />
          </g>
        );
      })()}

      {/* BEAT 7: Tôi là ếch gỗ — Protagonist beside smoothly curved North America & Alaska Peninsula map! */}
      {mode === "V24_FROG_EXPLAIN_B07_NORTH_MAP" && (
        <g>
          <GroundShadow cx={610} cy={792} rx={155} ry={18} />
          <CuteWoodFrog
            x={610}
            y={758}
            scale={1.5}
            frame={frame}
            pose="wave"
            freezeState="normal"
            emotion="happy"
            accessory="scarf_red"
          />
          {/* Smooth curved North America silhouette with gentle Alaska peninsula + Hudson Bay */}
          <g transform={`translate(1255, 495) scale(${popT.toFixed(3)})`}>
            <path
              d="M -258,-92 C -268,-128 -228,-168 -178,-164 C -144,-162 -118,-182 -68,-184 C -24,-186 24,-176 58,-192 C 110,-206 164,-176 184,-130 C 198,-96 176,-54 148,-24 C 138,-12 162,16 146,48 C 128,84 82,118 46,148 C 16,174 -4,202 -36,196 C -68,190 -78,144 -96,112 C -118,76 -156,52 -174,6 C -184,-20 -184,-48 -206,-60 C -228,-72 -252,-68 -258,-92 Z"
              fill="#6EE7B7"
              stroke={INK}
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Smooth northern Wood Frog habitat overlay sweeping cleanly across Alaska & Canada */}
            <path
              d="M -250,-92 C -256,-122 -220,-156 -174,-154 C -138,-154 -114,-172 -66,-174 C -22,-176 26,-168 62,-182 C 106,-194 150,-168 168,-128 C 176,-100 156,-62 126,-36 C 58,-20 -72,-16 -166,-44 C -204,-56 -244,-66 -250,-92 Z"
              fill="#B4693E"
              fillOpacity={0.78}
              stroke="#7C2D12"
              strokeWidth={3}
            />
            {/* Bold Arctic Circle dashed line */}
            <line x1={-285} y1={-120} x2={245} y2={-120} stroke="#0284C7" strokeWidth={5.5} strokeDasharray="14 10" />
            <rect x={-160} y={-240} width={320} height={46} rx={23} fill="#0284C7" stroke={INK} strokeWidth={3.2} />
            <text x={0} y={-209} textAnchor="middle" fill="#FFFFFF" fontSize={22} fontWeight={900}>
              VÒNG BẮC CỰC
            </text>
            {/* Location pin in Alaska peninsula */}
            <circle cx={-196} cy={-114} r={13} fill="#EF4444" stroke="#FFFFFF" strokeWidth={3.5} />
            <rect x={-195} y={196} width={390} height={48} rx={24} fill="#FFFFFF" stroke={INK} strokeWidth={3.2} />
            <text x={0} y={228} textAnchor="middle" fill={INK} fontSize={21} fontWeight={900}>
              Lưỡng cư duy nhất vượt Bắc Cực
            </text>
          </g>
        </g>
      )}

      {/* BEAT 8: Làm sao sống nổi? — Curious frog gazing at slow-spinning large snowflake */}
      {mode === "V24_FROG_EXPLAIN_B08_SNOWFLAKE_MYSTERY" && (
        <g>
          <GroundShadow cx={660} cy={792} rx={155} ry={18} />
          <CuteWoodFrog
            x={660}
            y={758}
            scale={1.48}
            frame={frame}
            pose="sit"
            freezeState="normal"
            emotion="curious"
            accessory="scarf_red"
          />
          <g transform={`translate(1280, 500) rotate(${(frame * 0.45).toFixed(1)})`}>
            <circle cx={0} cy={0} r={185} fill="#E0F2FE" opacity={0.62} stroke="#38BDF8" strokeWidth={4} strokeDasharray="12 10" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`} stroke="#0284C7" strokeWidth={9} strokeLinecap="round">
                <line x1={0} y1={0} x2={0} y2={-152} />
                <line x1={0} y1={-66} x2={-30} y2={-92} strokeWidth={7} />
                <line x1={0} y1={-66} x2={30} y2={-92} strokeWidth={7} />
                <line x1={0} y1={-112} x2={-24} y2={-132} strokeWidth={6} />
                <line x1={0} y1={-112} x2={24} y2={-132} strokeWidth={6} />
              </g>
            ))}
            <circle cx={0} cy={0} r={22} fill="#BAE6FD" stroke={INK} strokeWidth={4} />
          </g>
        </g>
      )}

      {/* BEAT 10: Băng rất nguy hiểm — Round water drop expanding into spiky ice needles */}
      {mode === "V24_FROG_EXPLAIN_B10_WATER_NEEDLES" && (() => {
        const burstT = interpolate(activeLocal, [8, 36], [0.72, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.back(1.3)),
        });
        return (
          <g>
            <g transform="translate(520, 485)">
              <path
                d="M 0,-138 C 78,-30 102,42 102,88 C 102,146 56,184 0,184 C -56,184 -102,146 -102,88 C -102,42 -78,-30 0,-138 Z"
                fill="#38BDF8"
                stroke={INK}
                strokeWidth={5}
              />
              <ellipse cx={-34} cy={52} rx={18} ry={34} fill="#E0F2FE" opacity={0.7} stroke="none" />
              <text x={0} y={232} textAnchor="middle" fill={INK} fontSize={26} fontWeight={900}>
                Giọt nước lỏng
              </text>
            </g>

            <g transform="translate(910, 485)">
              <path d="M -95,0 L 75,0" stroke="#0284C7" strokeWidth={12} strokeLinecap="round" />
              <polygon points="105,0 60,-28 60,28" fill="#0284C7" />
              <rect x={-90} y={-68} width={180} height={42} rx={21} fill="#DC2626" stroke={INK} strokeWidth={3} />
              <text x={0} y={-40} textAnchor="middle" fill="#FFFFFF" fontSize={21} fontWeight={900}>
                ĐÓNG BĂNG!
              </text>
            </g>

            <g transform={`translate(1360, 485) scale(${burstT.toFixed(3)})`}>
              <circle cx={0} cy={0} r={185} fill="#FEE2E2" opacity={0.62} stroke="#EF4444" strokeWidth={4} strokeDasharray="10 8" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <polygon
                  key={deg}
                  points="0,-178 -22,-55 0,-30 22,-55"
                  transform={`rotate(${deg})`}
                  fill={deg % 90 === 0 ? "#38BDF8" : "#BAE6FD"}
                  stroke={INK}
                  strokeWidth={3.5}
                  strokeLinejoin="round"
                />
              ))}
              <polygon points="0,-56 48,-26 48,26 0,56 -48,26 -48,-26" fill="#E0F2FE" stroke={INK} strokeWidth={4} />
              <text x={0} y={232} textAnchor="middle" fill="#B91C1C" fontSize={26} fontWeight={900}>
                Nở to + Mũi kim sắc nhọn!
              </text>
            </g>
          </g>
        );
      })()}

      {/* BEAT 14: Không chống lại băng — Calm hero gesturing peacefully toward winter wind */}
      {mode === "V24_FROG_EXPLAIN_B14_EMBRACE_FREEZE" && (
        <g>
          <GroundShadow cx={660} cy={792} rx={155} ry={18} />
          <CuteWoodFrog
            x={660}
            y={758}
            scale={1.48}
            frame={frame}
            pose="wave"
            freezeState="normal"
            emotion="proud"
            accessory="scarf_red"
          />
          <g transform="translate(1060, 435)" fill="none" stroke="#0284C7" strokeWidth={8} strokeLinecap="round">
            <path d={`M ${(580 - (frame * 3) % 120).toFixed(1)},-90 Q 340,-125 180,-75 Q 60,-40 120,10 Q 170,40 140,-15`} opacity={0.78} />
            <path d={`M ${(620 - (frame * 2.4) % 120).toFixed(1)},45 Q 390,10 220,55 Q 95,90 155,135 Q 205,165 175,108`} stroke="#38BDF8" opacity={0.85} />
            <path d={`M ${(540 - (frame * 2.8) % 120).toFixed(1)},155 Q 320,135 160,175`} stroke="#7DD3FC" opacity={0.85} />
          </g>
          <g transform="translate(1290, 636)">
            <rect x={-235} y={-28} width={470} height={56} rx={28} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />
            <text x={0} y={8} textAnchor="middle" fill="#0369A1" fontSize={24} fontWeight={900}>
              Chủ động đóng băng có kiểm soát ✓
            </text>
          </g>
        </g>
      )}

      {/* BEAT 17: Đóng băng chậm rãi — Caption pill lifted cleanly to y <= 665 (>= 125px clear of y=790 horizon!) */}
      {mode === "V24_FROG_EXPLAIN_B17_SLOW_FREEZE" && (() => {
        const crystalGrow = interpolate(activeLocal, [4, 48], [0.25, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <g>
            {/* Left: Crisp Thermometer at -1°C */}
            <g transform="translate(470, 445)">
              <rect x={-24} y={-195} width={48} height={310} rx={24} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
              <circle cx={0} cy={125} r={48} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
              <rect x={-11} y={-8} width={22} height={135} rx={10} fill="#38BDF8" />
              <circle cx={0} cy={125} r={32} fill="#38BDF8" />
              <line x1={30} y1={-8} x2={60} y2={-8} stroke="#0284C7" strokeWidth={5} />
              <rect x={68} y={-32} width={122} height={48} rx={20} fill="#0284C7" stroke={INK} strokeWidth={3.2} />
              <text x={129} y={0} textAnchor="middle" fill="#FFFFFF" fontSize={25} fontWeight={900}>
                -1°C
              </text>
            </g>

            {/* Right: Orderly blood vessel + slow outer crystals */}
            <g transform="translate(1160, 435)">
              <rect x={-350} y={-48} width={700} height={96} rx={48} fill="#FCA5A5" stroke={INK} strokeWidth={5} />
              <rect x={-334} y={-32} width={668} height={64} rx={32} fill="#EF4444" opacity={0.82} />
              {[-240, -100, 40, 180].map((mx, i) => (
                <g key={i} transform={`translate(${(mx + ((frame * 1.4) % 90)).toFixed(1)}, ${i % 2 === 0 ? -7 : 9})`}>
                  <circle cx={0} cy={0} r={13} fill="#FEF08A" stroke={INK} strokeWidth={2.8} />
                  <circle cx={0} cy={0} r={4.5} fill="#0284C7" stroke="none" />
                </g>
              ))}
              {[-250, -115, 20, 155, 275].map((cx, i) => (
                <g key={i} transform={`translate(${cx}, ${i % 2 === 0 ? -98 : 98}) scale(${crystalGrow.toFixed(2)})`}>
                  <polygon points="0,-34 25,-10 18,24 -18,24 -25,-10" fill="#BAE6FD" stroke="#0284C7" strokeWidth={3.5} />
                </g>
              ))}
            </g>

            {/* Caption Pill safely at y=608..662 (<= 665, >= 125px above horizon!) */}
            <g id="frog-b17-caption-pill">
              <rect x={855} y={608} width={610} height={54} rx={27} fill="#FFFFFF" stroke="#15803D" strokeWidth={3.5} />
              <text x={1160} y={643} textAnchor="middle" fill="#15803D" fontSize={23} fontWeight={900}>
                Phân tử dẫn băng: kết tinh từ từ, không gây sốc!
              </text>
            </g>
          </g>
        );
      })()}

      {/* BEAT 18: Khoan đã... — Curious frog pointing at a cell surrounded on 4 sides by ice */}
      {mode === "V24_FROG_EXPLAIN_B18_WAIT_HOW" && (
        <g>
          <GroundShadow cx={610} cy={792} rx={150} ry={18} />
          <CuteWoodFrog
            x={610}
            y={758}
            scale={1.44}
            frame={frame}
            pose="sit"
            freezeState="normal"
            emotion="curious"
            accessory="scarf_red"
          />
          <g transform="translate(1260, 470)">
            {[0, 90, 180, 270].map((deg) => (
              <polygon
                key={deg}
                points="0,-175 -34,-105 0,-88 34,-105"
                transform={`rotate(${deg})`}
                fill="#7DD3FC"
                stroke={INK}
                strokeWidth={4}
              />
            ))}
            <circle cx={0} cy={0} r={82} fill="#FEF3C7" stroke={INK} strokeWidth={5} />
            <circle cx={0} cy={0} r={32} fill="#F59E0B" stroke={INK} strokeWidth={3.5} />
            <text x={0} y={214} textAnchor="middle" fill={INK} fontSize={25} fontWeight={900}>
              Băng bao vây bốn phía — giữ lõi tế bào sao đây?
            </text>
          </g>
        </g>
      )}

      {/* BEAT 19: Cần chất chống đông — Golden glowing flask + shielded cell */}
      {mode === "V24_FROG_EXPLAIN_B19_ANTIFREEZE_BREW" && (
        <g>
          <g transform={`translate(640, 490) scale(${popT.toFixed(3)})`}>
            <circle cx={0} cy={15} r={160} fill="#FEF08A" opacity={0.42} stroke="none" />
            <path
              d="M -36,-145 L 36,-145 L 36,-80 L 114,76 C 130,112 106,150 66,150 L -66,150 C -106,150 -130,112 -114,76 L -36,-80 Z"
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth={5}
            />
            <path
              d="M -76,12 L 76,12 L 104,76 C 116,106 96,136 64,136 L -64,136 C -96,136 -116,106 -104,76 Z"
              fill="#F59E0B"
            />
            <circle cx={-28} cy={76} r={12} fill="#FEF08A" stroke="none" />
            <circle cx={24} cy={96} r={9} fill="#FEF08A" stroke="none" />
            <circle cx={8} cy={50} r={7} fill="#FEF08A" stroke="none" />
            <rect x={-48} y={-160} width={96} height={22} rx={10} fill="#92400E" stroke={INK} strokeWidth={4} />
            <text x={0} y={208} textAnchor="middle" fill="#92400E" fontSize={26} fontWeight={900}>
              Nước chống đông tự nhiên
            </text>
          </g>

          <g transform="translate(960, 490)">
            <path d="M -75,0 L 65,0" stroke="#D97706" strokeWidth={10} strokeLinecap="round" />
            <polygon points="92,0 52,-24 52,24" fill="#D97706" />
          </g>

          <g transform="translate(1310, 490)">
            <circle cx={0} cy={0} r={150} fill="#FEF08A" opacity={0.35} stroke="#D97706" strokeWidth={6} />
            <circle cx={0} cy={0} r={112} fill="#FFFBEB" stroke={INK} strokeWidth={5} />
            <circle cx={0} cy={0} r={44} fill="#F59E0B" stroke={INK} strokeWidth={4} />
            <circle cx={92} cy={-92} r={34} fill="#22C55E" stroke={INK} strokeWidth={4} />
            <path d="M 76,-92 L 88,-80 L 110,-104" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
            <text x={0} y={208} textAnchor="middle" fill="#15803D" fontSize={26} fontWeight={900}>
              Khiên bảo vệ tế bào 7 tháng!
            </text>
          </g>
        </g>
      )}

      {/* BEAT 25: Người là nguy kịch — Human red alert vs Wood Frog green safe checkmark */}
      {mode === "V24_FROG_EXPLAIN_B25_HUMAN_VS_FROG" && (
        <g>
          <g transform="translate(560, 480)">
            <circle cx={0} cy={-105} r={52} fill="#FDE68A" stroke={INK} strokeWidth={5} />
            <path d="M -74,90 C -74,-12 -44,-46 0,-46 C 44,-46 74,-12 74,90 Z" fill="#64748B" stroke={INK} strokeWidth={5} />
            <circle cx={96} cy={-105} r={36} fill="#EF4444" stroke={INK} strokeWidth={4} />
            <text x={96} y={-91} textAnchor="middle" fill="#FFFFFF" fontSize={42} fontWeight={900}>
              !
            </text>
            <rect x={-230} y={122} width={460} height={60} rx={30} fill="#FEE2E2" stroke="#DC2626" strokeWidth={4} />
            <text x={0} y={161} textAnchor="middle" fill="#991B1B" fontSize={25} fontWeight={900}>
              Người: ×2–10 lần • Nguy hiểm!
            </text>
          </g>

          <g transform="translate(960, 480)">
            <line x1={0} y1={-205} x2={0} y2={205} stroke="#94A3B8" strokeWidth={4} strokeDasharray="10 10" />
            <circle cx={0} cy={0} r={42} fill="#1E293B" stroke="#FFFFFF" strokeWidth={4} />
            <text x={0} y={10} textAnchor="middle" fill="#FACC15" fontSize={28} fontWeight={900}>
              VS
            </text>
          </g>

          <g transform="translate(1360, 480)">
            <CuteWoodFrog
              x={0}
              y={96}
              scale={1.42}
              frame={frame}
              pose="sit"
              freezeState="normal"
              emotion="proud"
              hideEmotionBadge={true}
              accessory="scarf_red"
            />
            <circle cx={110} cy={-105} r={36} fill="#22C55E" stroke={INK} strokeWidth={4} />
            <path d="M 92,-105 L 105,-92 L 128,-118" fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
            <rect x={-245} y={122} width={490} height={60} rx={30} fill="#DCFCE7" stroke="#16A34A" strokeWidth={4} />
            <text x={0} y={161} textAnchor="middle" fill="#166534" fontSize={25} fontWeight={900}>
              Ếch gỗ: ×100–200 lần • An toàn!
            </text>
          </g>
        </g>
      )}

      {/* BEAT 27: Giữ nước trong tế bào — Caption pill cleanly at y=608..662 (<= 665, >= 125px above y=790 horizon!) */}
      {mode === "V24_FROG_EXPLAIN_B27_CELL_HYDRATED" && (
        <g>
          <g transform="translate(960, 415)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
              const push = Math.sin(frame * 0.1 + idx) * 5;
              return (
                <polygon
                  key={deg}
                  points={`0,${(-190 - push).toFixed(1)} -24,${(-134 - push).toFixed(1)} 0,${(-120 - push).toFixed(1)} 24,${(-134 - push).toFixed(1)}`}
                  transform={`rotate(${deg})`}
                  fill="#7DD3FC"
                  stroke="#0284C7"
                  strokeWidth={3.5}
                />
              );
            })}
            <circle cx={0} cy={0} r={116} fill="#FDE68A" stroke="#D97706" strokeWidth={7} />
            <circle cx={0} cy={0} r={98} fill="#FEF3C7" stroke={INK} strokeWidth={4} />
            <circle cx={-8} cy={-6} r={38} fill="#F59E0B" stroke={INK} strokeWidth={3.8} />
            <ellipse cx={-34} cy={-40} rx={18} ry={9} fill="#FFFFFF" opacity={0.75} stroke="none" />
          </g>
          <g id="frog-b27-caption-pill">
            <rect x={700} y={608} width={520} height={54} rx={27} fill="#FFFFFF" stroke="#15803D" strokeWidth={3.5} />
            <text x={960} y={643} textAnchor="middle" fill="#15803D" fontSize={24} fontWeight={900}>
              Tế bào căng tròn khỏe mạnh suốt mùa đông ✓
            </text>
          </g>
        </g>
      )}

      {/* BEAT 33: Rã đông rất khó — Caption pill cleanly at y=608..662 (<= 665, >= 125px above y=790 horizon!) */}
      {mode === "V24_FROG_EXPLAIN_B33_THAW_RISK" && (
        <g>
          <GroundShadow cx={610} cy={792} rx={155} ry={18} />
          <CuteWoodFrog
            x={610}
            y={758}
            scale={1.45}
            frame={frame}
            pose="sit"
            freezeState="frosting"
            emotion="surprised"
            accessory="scarf_red"
          />
          <g transform="translate(1275, 425)">
            <ellipse cx={0} cy={112} rx={195} ry={30} fill="#7DD3FC" stroke="#0284C7" strokeWidth={3.5} />
            <rect x={-120} y={-118} width={240} height={212} rx={38} fill="#BAE6FD" fillOpacity={0.62} stroke="#0284C7" strokeWidth={4.5} />
            <polygon points="0,-68 62,-16 44,54 -44,54 -62,-16" fill="#0369A1" stroke={INK} strokeWidth={4} />
            <text x={0} y={12} textAnchor="middle" fill="#E0F2FE" fontSize={22} fontWeight={900}>
              LÕI CỨNG
            </text>
            <circle cx={124} cy={-106} r={36} fill="#DC2626" stroke={INK} strokeWidth={4} />
            <path d="M 108,-122 L 140,-90 M 140,-122 L 108,-90" stroke="#FFFFFF" strokeWidth={7.5} strokeLinecap="round" />
          </g>
          <g id="frog-b33-caption-pill">
            <rect x={1015} y={608} width={520} height={54} rx={27} fill="#FEE2E2" stroke="#DC2626" strokeWidth={3.5} />
            <text x={1275} y={643} textAnchor="middle" fill="#991B1B" fontSize={23} fontWeight={900}>
              Tan ngoài trước mà tim còn đông = Hỏng ngay!
            </text>
          </g>
        </g>
      )}

      {/* BEAT 36: Hơi thở đầu tiên — Frog blinking awake with puffing throat & cool spring breeze */}
      {mode === "V24_FROG_EXPLAIN_B36_FIRST_BREATH" && (
        <g>
          <GroundShadow cx={810} cy={792} rx={165} ry={18} />
          <CuteWoodFrog
            x={810}
            y={758}
            scale={1.54}
            frame={frame}
            pose="sit"
            freezeState="normal"
            emotion="happy"
            throatPuff={true}
            accessory="scarf_red"
          />
          <g transform="translate(1150, 480)" fill="none" stroke="#0284C7" strokeWidth={7} strokeLinecap="round">
            <path d="M 320,-75 Q 160,-105 40,-45 Q -60,0 -145,25" />
            <path d="M 350,10 Q 190,-15 65,25 Q -40,55 -135,50" stroke="#38BDF8" />
            <path d="M 290,95 Q 150,75 45,95 Q -35,105 -120,78" stroke="#0EA5E9" />
            <g transform="translate(230, 145)">
              <circle cx={0} cy={0} r={66} fill="#FFFFFF" stroke="#0284C7" strokeWidth={4} />
              <path d="M -6,-30 L -6,-6 C -34,-10 -44,24 -22,34 C -8,40 -4,26 -4,10 M 6,-30 L 6,-6 C 34,-10 44,24 22,34 C 8,40 4,26 4,10" fill="#FDA4AF" stroke={INK} strokeWidth={3.2} />
            </g>
          </g>
        </g>
      )}

      {/* BEAT 38: Dọn sạch kho đường — Golden glucose streaming back into liver -> green energy */}
      {mode === "V24_FROG_EXPLAIN_B38_CLEANUP_SUGAR" && (
        <g>
          <g transform="translate(560, 495)">
            <rect x={-260} y={-50} width={520} height={100} rx={50} fill="#FCA5A5" stroke={INK} strokeWidth={4.5} />
            <rect x={-244} y={-34} width={488} height={68} rx={34} fill="#EF4444" opacity={0.78} />
            {[0, 1, 2, 3, 4].map((si) => {
              const sx = -210 + ((frame * 3.8 + si * 92) % 430);
              return <circle key={si} cx={sx} cy={si % 2 === 0 ? -10 : 12} r={13} fill="#FACC15" stroke={INK} strokeWidth={2.6} />;
            })}
            <text x={0} y={108} textAnchor="middle" fill={INK} fontSize={25} fontWeight={900}>
              Đường dư từ mạch máu
            </text>
          </g>

          <g transform="translate(960, 495)">
            <path d="M -82,0 L 68,0" stroke="#16A34A" strokeWidth={11} strokeLinecap="round" />
            <polygon points="98,0 54,-26 54,26" fill="#16A34A" />
          </g>

          <g transform="translate(1355, 490)">
            <path
              d="M -145,-35 C -145,-125 25,-145 140,-85 C 175,-60 165,30 95,62 C 10,98 -145,65 -145,-35 Z"
              fill="#B45309"
              stroke={INK}
              strokeWidth={5}
            />
            <text x={-5} y={-10} textAnchor="middle" fill="#FEF3C7" fontSize={32} fontWeight={900}>
              GAN
            </text>
            <rect x={-165} y={105} width={330} height={62} rx={18} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
            <rect x={-153} y={117} width={285} height={38} rx={12} fill="#22C55E" />
            <text x={0} y={145} textAnchor="middle" fill="#FFFFFF" fontSize={22} fontWeight={900}>
              CẤT LÀM NĂNG LƯỢNG ✓
            </text>
          </g>
        </g>
      )}

      {/* BEAT 40: Tại sao phải liều? — Cute green sleeping pond frog (curved closed eyes + 2 tucked legs!) vs Wood Frog on surface */}
      {mode === "V24_FROG_EXPLAIN_B40_MUD_VS_SURFACE" && (
        <g>
          {/* Left: Green Pond Frog Snoozing in Warm Mud */}
          <g transform="translate(535, 475)">
            <rect x={-310} y={-205} width={620} height={145} rx={24} fill="#38BDF8" stroke={INK} strokeWidth={4} />
            <rect x={-310} y={-68} width={620} height={225} rx={24} fill="#78350F" stroke={INK} strokeWidth={4} />
            {/* Adorable sleeping green pond frog with 2 tucked legs, raised eye bumps, curved sleeping eyes & cheeks */}
            <g id="frog-b40-sleeping-mud-frog" transform="translate(0, 56)" stroke={INK} strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round">
              {/* 2 neat tucked hind legs */}
              <ellipse cx={-66} cy={14} rx={24} ry={16} fill="#16A34A" />
              <ellipse cx={66} cy={14} rx={24} ry={16} fill="#16A34A" />
              {/* Plump green body + pale belly */}
              <ellipse cx={0} cy={0} rx={68} ry={40} fill="#22C55E" />
              <ellipse cx={0} cy={14} rx={44} ry={18} fill="#DCFCE7" stroke="none" />
              {/* 2 raised eye bumps + curved peaceful sleeping eyes */}
              <circle cx={-26} cy={-30} r={16} fill="#22C55E" />
              <circle cx={26} cy={-30} r={16} fill="#22C55E" />
              <path d="M -34,-30 Q -26,-23 -18,-30 M 18,-30 Q 26,-23 34,-30" fill="none" stroke={INK} strokeWidth={3.5} />
              <ellipse cx={-40} cy={-8} rx={9} ry={5} fill="#FDA4AF" opacity={0.65} stroke="none" />
              <ellipse cx={40} cy={-8} rx={9} ry={5} fill="#FDA4AF" opacity={0.65} stroke="none" />
              <path d="M -14,-6 Q 0,3 14,-6" fill="none" stroke={INK} strokeWidth={3} />
            </g>
            <text x={82} y={-4} fill="#FEF08A" stroke={INK} strokeWidth={4} paintOrder="stroke" fontSize={30} fontWeight={900}>
              zZ
            </text>
            <rect x={-255} y={178} width={510} height={54} rx={27} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />
            <text x={0} y={213} textAnchor="middle" fill={INK} fontSize={24} fontWeight={900}>
              Ếch khác: ngủ ấm dưới bùn hồ
            </text>
          </g>

          {/* Right: Wood Frog Freezing on Surface */}
          <g transform="translate(1385, 475)">
            <rect x={-310} y={-205} width={620} height={362} rx={24} fill="#E2E8F0" stroke={INK} strokeWidth={4} />
            <CuteWoodFrog
              x={0}
              y={94}
              scale={1.34}
              frame={frame}
              pose="frozen_flat"
              freezeState="frozen_solid"
              accessory="scarf_red"
            />
            <rect x={-255} y={178} width={510} height={54} rx={27} fill="#FEE2E2" stroke="#DC2626" strokeWidth={3.5} />
            <text x={0} y={213} textAnchor="middle" fill="#991B1B" fontSize={24} fontWeight={900}>
              Ếch gỗ: đóng băng ngay trên mặt đất!
            </text>
          </g>
        </g>
      )}

      {/* BEAT 41: Vì mùa hè quá ngắn — Solemn frog gazing up toward rising golden spring sun */}
      {mode === "V24_FROG_EXPLAIN_B41_SHORT_SUMMER" && (
        <g>
          <g transform="translate(1340, 445)">
            <circle cx={0} cy={0} r={195} fill="#FEF08A" opacity={0.14} />
            <circle cx={0} cy={0} r={128} fill="#FDE047" opacity={0.22} />
            <circle cx={0} cy={0} r={74} fill="#FACC15" stroke="#FEF08A" strokeWidth={4} />
          </g>
          <GroundShadow cx={740} cy={792} rx={155} ry={18} />
          <CuteWoodFrog
            x={740}
            y={758}
            scale={1.48}
            frame={frame}
            pose="sit"
            freezeState="normal"
            emotion="curious"
            hideEmotionBadge={true}
            accessory="scarf_red"
          />
        </g>
      )}

      {/* BEAT 47: Mối nguy âm thầm (SILENT) — Single droplet falling into dark still water */}
      {mode === "V24_FROG_EXPLAIN_B47_SILENT_RIPPLE" && (() => {
        const fallT = interpolate(activeLocal, [0, 32], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.quad),
        });
        const rippleT = interpolate(activeLocal, [30, safeDur], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <g>
            {fallT < 0.98 && (
              <path
                d="M 0,-26 C 18,-4 20,18 0,26 C -20,18 -18,-4 0,-26 Z"
                transform={`translate(960, ${(310 + fallT * 315).toFixed(1)})`}
                fill="#7DD3FC"
                stroke="#E0F2FE"
                strokeWidth={3}
              />
            )}
            <ellipse cx={960} cy={635} rx={360} ry={46} fill="#0F172A" opacity={0.55} />
            {rippleT > 0 && (
              <g fill="none" stroke="#7DD3FC" strokeWidth={4}>
                <ellipse
                  cx={960}
                  cy={635}
                  rx={Number((40 + rippleT * 340).toFixed(1))}
                  ry={Number((10 + rippleT * 52).toFixed(1))}
                  opacity={(1 - rippleT * 0.8).toFixed(2)}
                />
                <ellipse
                  cx={960}
                  cy={635}
                  rx={Number((18 + rippleT * 210).toFixed(1))}
                  ry={Number((6 + rippleT * 32).toFixed(1))}
                  opacity={(1 - rippleT * 0.65).toFixed(2)}
                />
              </g>
            )}
          </g>
        );
      })()}

      {/* BEAT 50: Hơn 70% không qua nổi — KEPT EXACTLY AS APPROVED! */}
      {mode === "V24_FROG_EXPLAIN_B50_SURVIVAL_70PCT" && (() => {
        const fadeT = interpolate(activeLocal, [10, 48], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <g>
            <GroundShadow cx={480} cy={792} rx={140} ry={16} />
            <CuteWoodFrog
              x={480}
              y={758}
              scale={1.36}
              frame={frame}
              pose="sit"
              freezeState="normal"
              emotion="curious"
              hideEmotionBadge={true}
              accessory="scarf_red"
            />
            <g transform="translate(880, 325)">
              {Array.from({ length: 20 }).map((_, idx) => {
                const col = idx % 5;
                const row = Math.floor(idx / 5);
                const survives = idx >= 14;
                const op = survives ? 0.95 : 0.85 - fadeT * 0.68;
                return (
                  <g key={idx} transform={`translate(${col * 165}, ${row * 102})`}>
                    <circle cx={0} cy={0} r={survives ? 32 : 24} fill={survives ? "#FACC15" : "#94A3B8"} opacity={(op * 0.25).toFixed(2)} />
                    <circle
                      cx={0}
                      cy={0}
                      r={survives ? 17 : 13}
                      fill={survives ? "#FEF08A" : "#64748B"}
                      stroke={survives ? "#F59E0B" : "#334155"}
                      strokeWidth={3}
                      opacity={op.toFixed(2)}
                    />
                  </g>
                );
              })}
              <text x={330} y={425} textAnchor="middle" fill="#FDA4AF" fontSize={26} fontWeight={900}>
                Hơn 70% ếch non không qua nổi mùa đông đầu tiên
              </text>
            </g>
          </g>
        );
      })()}

      {/* BEAT 51: Chỉ khoảng 3 năm — Minimalist ~3 NĂM timeline above peaceful hero */}
      {mode === "V24_FROG_EXPLAIN_B51_LIFESPAN_3Y" && (() => {
        const barT = interpolate(activeLocal, [4, 34], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <g>
            <GroundShadow cx={580} cy={792} rx={150} ry={18} />
            <CuteWoodFrog
              x={580}
              y={758}
              scale={1.42}
              frame={frame}
              pose="sit"
              freezeState="normal"
              emotion="curious"
              hideEmotionBadge={true}
              accessory="scarf_red"
            />
            <g transform="translate(880, 470)">
              <rect x={0} y={0} width={760} height={24} rx={12} fill="#312E81" stroke="#818CF8" strokeWidth={3} />
              <rect x={4} y={4} width={Math.max(24, Math.round(752 * barT))} height={16} rx={8} fill="#FDA4AF" />
              {[0, 1, 2].map((yi) => (
                <g key={yi} transform={`translate(${125 + yi * 255}, 12)`}>
                  <circle cx={0} cy={0} r={22} fill="#1E1B4B" stroke="#FEF08A" strokeWidth={4} />
                  <text x={0} y={64} textAnchor="middle" fill="#E0E7FF" fontSize={24} fontWeight={900}>
                    Năm {yi + 1}
                  </text>
                </g>
              ))}
              <rect x={235} y={-110} width={290} height={64} rx={32} fill="#881337" stroke="#FDA4AF" strokeWidth={3.5} />
              <text x={380} y={-69} textAnchor="middle" fill="#FFF1F2" fontSize={32} fontWeight={900}>
                ~ 3 NĂM
              </text>
            </g>
          </g>
        );
      })()}

      {/* BEAT 52: Mỗi năm một ván cược — 3 luminous winter rings each cradling a glowing heart */}
      {mode === "V24_FROG_EXPLAIN_B52_THREE_WAGERS" && (
        <g>
          {[0, 1, 2].map((wi) => {
            const cx = 480 + wi * 480;
            const pulse = 1 + Math.sin(frame * 0.12 + wi * 1.1) * 0.05;
            return (
              <g key={wi} transform={`translate(${cx}, 495)`}>
                <circle cx={0} cy={0} r={148} fill="#312E81" fillOpacity={0.55} stroke="#7DD3FC" strokeWidth={5} strokeDasharray="14 10" />
                <circle cx={0} cy={0} r={108} fill="#1E1B4B" stroke="#FDA4AF" strokeWidth={4} />
                <g transform={`scale(${pulse.toFixed(3)})`}>
                  <path
                    d="M 0,40 C -48,8 -58,-28 -32,-44 C -14,-54 0,-36 0,-28 C 0,-36 14,-54 32,-44 C 58,-28 48,8 0,40 Z"
                    fill="#FB7185"
                    stroke="#FEF08A"
                    strokeWidth={4}
                  />
                </g>
                <text x={0} y={196} textAnchor="middle" fill="#E0E7FF" fontSize={26} fontWeight={900}>
                  Mùa đông {wi + 1}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* BEAT 59: Nhưng chưa là gì... — Frog looking right toward magnifying glass zooming a glowing speck */}
      {mode === "V24_FROG_EXPLAIN_B59_TOUGHER_CREATURE" && (
        <g>
          <GroundShadow cx={650} cy={792} rx={155} ry={18} />
          <CuteWoodFrog
            x={650}
            y={758}
            scale={1.46}
            frame={frame}
            pose="sit"
            freezeState="normal"
            emotion="curious"
            accessory="scarf_red"
          />
          <g transform={`translate(1260, 495) scale(${popT.toFixed(3)})`}>
            <line x1={96} y1={96} x2={205} y2={205} stroke="#92400E" strokeWidth={28} strokeLinecap="round" />
            <line x1={96} y1={96} x2={205} y2={205} stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <circle cx={0} cy={0} r={142} fill="#0F172A" stroke={INK} strokeWidth={10} />
            <circle cx={0} cy={0} r={124} fill="#1E1B4B" stroke="#38BDF8" strokeWidth={4} />
            <circle cx={0} cy={0} r={Number((32 + Math.sin(frame * 0.16) * 6).toFixed(1))} fill="#38BDF8" opacity={0.28} />
            <text x={0} y={24} textAnchor="middle" fill="#FACC15" fontSize={74} fontWeight={900}>
              ?
            </text>
          </g>
        </g>
      )}

      {/* BEAT 60: Nhỏ hơn hạt cát — Glowing 8-legged Tardigrade Silhouette between Ice & Fire! */}
      {mode === "V24_FROG_EXPLAIN_B60_TARDIGRADE_TEASER" && (
        <g>
          <g transform="translate(420, 495)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <polygon key={deg} points="0,-145 -22,-55 0,-36 22,-55" transform={`rotate(${deg})`} fill="#38BDF8" stroke="#E0F2FE" strokeWidth={3} />
            ))}
            <rect x={-130} y={168} width={260} height={50} rx={25} fill="#0284C7" stroke="#BAE6FD" strokeWidth={3} />
            <text x={0} y={201} textAnchor="middle" fill="#FFFFFF" fontSize={23} fontWeight={900}>
              ĐÓNG BĂNG CỰC SÂU
            </text>
          </g>

          <g transform="translate(1500, 495)">
            <path
              d="M 0,-158 C 58,-96 98,-32 82,58 C 72,118 36,144 0,144 C -36,144 -72,118 -82,58 C -98,-32 -58,-96 0,-158 Z"
              fill="#EA580C"
              stroke="#FEF08A"
              strokeWidth={4}
            />
            <path d="M 0,-86 C 34,-44 50,12 42,64 C 36,104 18,124 0,124 C -18,124 -36,104 -42,64 C -50,12 -34,-44 0,-86 Z" fill="#FACC15" stroke="none" />
            <rect x={-125} y={168} width={250} height={50} rx={25} fill="#DC2626" stroke="#FEF08A" strokeWidth={3} />
            <text x={0} y={201} textAnchor="middle" fill="#FFFFFF" fontSize={24} fontWeight={900}>
              ĐUN SÔI 100°C+
            </text>
          </g>

          <TardigradeSilhouetteHero x={960} y={505} scale={1.38} frame={frame} glowColor="#38BDF8" />
        </g>
      )}

      {/* BEAT 61: Tập sau: Gấu nước! — Glowing Tardigrade floating in starry cosmos + TẬP 12 badge! */}
      {mode === "V24_FROG_EXPLAIN_B61_TARDIGRADE_SPACE" && (
        <g>
          {[
            { x: 240, y: 310, r: 6 },
            { x: 430, y: 660, r: 5 },
            { x: 640, y: 270, r: 7 },
            { x: 1180, y: 265, r: 6 },
            { x: 1640, y: 640, r: 7 },
            { x: 1710, y: 325, r: 5 },
            { x: 320, y: 485, r: 4.5 },
            { x: 1320, y: 710, r: 5.5 },
          ].map((s, si) => (
            <path
              key={si}
              d={`M 0,${-s.r * 2} L ${s.r * 0.55},${-s.r * 0.55} L ${s.r * 2},0 L ${s.r * 0.55},${s.r * 0.55} L 0,${s.r * 2} L ${-s.r * 0.55},${s.r * 0.55} L ${-s.r * 2},0 L ${-s.r * 0.55},${-s.r * 0.55} Z`}
              transform={`translate(${s.x}, ${s.y})`}
              fill="#FEF08A"
              opacity={(0.55 + 0.45 * Math.sin(frame * 0.1 + si)).toFixed(2)}
            />
          ))}
          <g transform="translate(360, 385)">
            <circle cx={0} cy={0} r={54} fill="#6366F1" stroke="#A5B4FC" strokeWidth={3.5} />
            <ellipse cx={0} cy={4} rx={96} ry={22} fill="none" stroke="#FDE047" strokeWidth={5} transform="rotate(-16)" />
          </g>

          <TardigradeSilhouetteHero x={860} y={530} scale={1.42} frame={frame} glowColor="#7DD3FC" />

          <g id="v24-ep12-teaser-badge" transform={`translate(1440, 480) scale(${popT.toFixed(3)})`}>
            <circle cx={0} cy={0} r={122} fill="#FACC15" opacity={0.2} />
            <circle cx={0} cy={0} r={96} fill="#FACC15" stroke={INK} strokeWidth={6} />
            <text x={0} y={-8} textAnchor="middle" fill={INK} fontSize={32} fontWeight={900}>
              TẬP 12
            </text>
            <text x={0} y={34} textAnchor="middle" fill="#9A3412" fontSize={26} fontWeight={900}>
              GẤU NƯỚC
            </text>
          </g>
        </g>
      )}

      {/* BEAT 62: Hẹn gặp tập sau! — Wood Frog waving warmly beside mini Tardigrade icon */}
      {mode === "V24_FROG_EXPLAIN_B62_OUTRO_WAVE" && (
        <g id="frog-v24-outro-wave">
          <GroundShadow cx={740} cy={792} rx={165} ry={18} />
          <CuteWoodFrog
            x={740}
            y={758}
            scale={1.52}
            frame={frame}
            pose="wave"
            freezeState="normal"
            emotion="happy"
            accessory="scarf_red"
          />
          <g transform="translate(1310, 505)">
            <circle cx={0} cy={0} r={148} fill="#1E1B4B" stroke={INK} strokeWidth={5} />
            <TardigradeSilhouetteHero x={0} y={-8} scale={0.78} frame={frame} glowColor="#38BDF8" />
            <rect x={-135} y={118} width={270} height={48} rx={24} fill="#FACC15" stroke={INK} strokeWidth={3.5} />
            <text x={0} y={150} textAnchor="middle" fill={INK} fontSize={22} fontWeight={900}>
              Tập sau: Gấu nước!
            </text>
          </g>
        </g>
      )}
    </g>
  );
};
