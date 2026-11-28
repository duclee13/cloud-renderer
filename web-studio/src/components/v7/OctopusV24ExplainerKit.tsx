import React from "react";
import { Easing, interpolate } from "remotion";
import { CuteOctopus } from "../AnimalSpriteKit";
import { GroundShadow } from "../SceneBackdropKit";
import type { OceanDetailId } from "../../lib/v7/episodeJsonSchema";

const INK = "#1E293B";
const FONT = "'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif";

function mixHex(hexA: string, hexB: string, tRaw: number): string {
  const t = Math.max(0, Math.min(1, tRaw));
  const p = (h: string): [number, number, number] => {
    const c = h.replace("#", "");
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = p(hexA);
  const [r2, g2, b2] = p(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function isOctopusV24ExplainerMode(detail?: OceanDetailId): boolean {
  return typeof detail === "string" && detail.startsWith("V24_EXPLAIN_");
}

const ColorblindRainbowStatic: React.FC = React.memo(() => (
  <g id="octo-v24-colorblind-card-static" transform="translate(990, 290)">
    <rect x={0} y={0} width={600} height={410} rx={30} fill="#1E293B" stroke="#818CF8" strokeWidth={4} />
    <text x={300} y={48} textAnchor="middle" fill="#E0E7FF" fontSize={24} fontWeight={900} fontFamily={FONT}>
      Thế giới cầu vồng (Mắt người)
    </text>
    {/* Rainbow strip */}
    <g transform="translate(46, 72)">
      {[
        "#EF4444",
        "#F97316",
        "#FACC15",
        "#22C55E",
        "#38BDF8",
        "#6366F1",
        "#A855F7",
      ].map((c, i) => (
        <rect
          key={i}
          x={i * 72}
          y={0}
          width={74}
          height={64}
          rx={i === 0 || i === 6 ? 10 : 0}
          fill={c}
          stroke={INK}
          strokeWidth={2.5}
        />
      ))}
    </g>
    {/* Down arrow */}
    <path d="M 300,152 L 300,206" stroke="#FACC15" strokeWidth={6} strokeLinecap="round" />
    <polygon points="300,222 286,200 314,200" fill="#FACC15" />

    <text x={300} y={260} textAnchor="middle" fill="#CBD5E1" fontSize={24} fontWeight={900} fontFamily={FONT}>
      Mắt bạch tuộc (1 cảm biến)
    </text>
    {/* Monochrome grayscale strip */}
    <g transform="translate(46, 282)">
      {[
        "#1E293B",
        "#334155",
        "#475569",
        "#64748B",
        "#94A3B8",
        "#CBD5E1",
        "#E2E8F0",
      ].map((c, i) => (
        <rect
          key={i}
          x={i * 72}
          y={0}
          width={74}
          height={64}
          rx={i === 0 || i === 6 ? 10 : 0}
          fill={c}
          stroke={INK}
          strokeWidth={2.5}
        />
      ))}
    </g>
  </g>
));
ColorblindRainbowStatic.displayName = "ColorblindRainbowStatic";

const BlueMysteryPigmentsStatic: React.FC = React.memo(() => (
  <g id="octo-v24-blue-mystery-static" transform="translate(1010, 290)">
    <rect x={0} y={0} width={570} height={415} rx={30} fill="#FFFFFF" stroke="#0284C7" strokeWidth={4.5} />
    <text x={285} y={48} textAnchor="middle" fill="#0369A1" fontSize={25} fontWeight={900} fontFamily={FONT}>
      Túi sắc tố chỉ có 3 màu gốc
    </text>
    {/* 3 basic pigment circles */}
    <g transform="translate(115, 130)">
      <circle cx={0} cy={0} r={42} fill="#FACC15" stroke={INK} strokeWidth={4} />
      <text x={0} y={68} textAnchor="middle" fill="#854D0E" fontSize={21} fontWeight={900} fontFamily={FONT}>
        Vàng
      </text>
    </g>
    <g transform="translate(285, 130)">
      <circle cx={0} cy={0} r={42} fill="#EF4444" stroke={INK} strokeWidth={4} />
      <text x={0} y={68} textAnchor="middle" fill="#991B1B" fontSize={21} fontWeight={900} fontFamily={FONT}>
        Đỏ
      </text>
    </g>
    <g transform="translate(455, 130)">
      <circle cx={0} cy={0} r={42} fill="#92400E" stroke={INK} strokeWidth={4} />
      <text x={0} y={68} textAnchor="middle" fill="#78350F" fontSize={21} fontWeight={900} fontFamily={FONT}>
        Nâu
      </text>
    </g>
    {/* Mystery teal question emblem */}
    <g transform="translate(285, 310)">
      <rect x={-185} y={-52} width={370} height={104} rx={26} fill="#ECFEFF" stroke="#06B6D4" strokeWidth={4} />
      <circle cx={-122} cy={0} r={34} fill="#06B6D4" stroke={INK} strokeWidth={3.5} />
      <text x={-122} y={12} textAnchor="middle" fill="#FFFFFF" fontSize={38} fontWeight={900} fontFamily={FONT}>
        ?
      </text>
      <text x={32} y={-4} textAnchor="middle" fill="#0E7490" fontSize={24} fontWeight={900} fontFamily={FONT}>
        Xanh ngọc &amp; Trắng
      </text>
      <text x={32} y={26} textAnchor="middle" fill="#155E75" fontSize={20} fontWeight={800} fontFamily={FONT}>
        Lấy từ đâu ra nhỉ?
      </text>
    </g>
  </g>
));
BlueMysteryPigmentsStatic.displayName = "BlueMysteryPigmentsStatic";

export interface OctopusV24ExplainerKitProps {
  mode: OceanDetailId;
  frame: number;
  localFrame: number;
  durationFrames?: number;
}

/**
 * OctopusV24ExplainerKit (Engine V24.0 — 13 Non-Freeze CLEAN_EXPLAINER Scenes for Episode 10 ANIMAL_POV)
 * - Populates every CLEAN_EXPLAINER beat with foreground CuteOctopus (Tuộc / Mẹ Tuộc) + bespoke clean vector props
 * - Strictly 0 blur, 0 drop-shadow, 0 foreignObject, 0 body wobble, safe y=220..790 grounding
 */
export const OctopusV24ExplainerKit: React.FC<OctopusV24ExplainerKitProps> = ({
  mode,
  frame,
  localFrame,
  durationFrames = 180,
}) => {
  const safeMode: OceanDetailId = isOctopusV24ExplainerMode(mode) ? mode : "V24_EXPLAIN_INTRO_WAVE";

  // Beat 7: Smooth clamped color showcase: golden sand -> moss green -> plum-red (#C4365D)
  const camoStage1 = interpolate(localFrame, [0, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const camoStage2 = interpolate(localFrame, [38, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const beat7Main =
    localFrame < 36
      ? mixHex("#EAB308", "#16A34A", camoStage1)
      : mixHex("#16A34A", "#C4365D", camoStage2);
  const beat7Belly =
    localFrame < 36
      ? mixHex("#FEF9C3", "#DCFCE7", camoStage1)
      : mixHex("#DCFCE7", "#FCE7F3", camoStage2);

  // Beat 42: Clamped battery drain 38% -> 12%
  const batteryLevel = interpolate(localFrame, [6, 56], [0.38, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Beat 56: Gentle clamped mother opacity fade (1.0 -> 0.24)
  const motherFadeOpacity = interpolate(localFrame, [10, Math.max(40, durationFrames - 18)], [1, 0.24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Beat 57: Smooth rising starlight motes
  const moteRiseT = interpolate(localFrame, [0, Math.max(60, durationFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g id={`octopus-v24-explainer-kit-${safeMode}`}>
      {/* BEAT 5: Chào, tôi là Tuộc (scale=1.5, bandana_green, happy wave straight at camera) */}
      {safeMode === "V24_EXPLAIN_INTRO_WAVE" && (
        <g>
          <GroundShadow cx={960} cy={792} rx={155} ry={20} />
          <CuteOctopus
            x={960}
            y={748}
            scale={1.5}
            frame={frame}
            pose="wave"
            emotion="happy"
            accessory="bandana_green"
          />
        </g>
      )}

      {/* BEAT 6: Mù màu?! — Tuộc (curious) beside rainbow -> grayscale card */}
      {safeMode === "V24_EXPLAIN_COLORBLIND_GRAY" && (
        <g>
          <GroundShadow cx={610} cy={792} rx={145} ry={18} />
          <CuteOctopus
            x={610}
            y={754}
            scale={1.42}
            frame={frame}
            pose="crawl"
            emotion="curious"
            accessory="bandana_green"
          />
          <ColorblindRainbowStatic />
        </g>
      )}

      {/* BEAT 7: Vẫn tàng hình đỉnh! — Tuộc (proud) morphing sand -> moss -> plum-red */}
      {safeMode === "V24_EXPLAIN_CAMO_PROUD" && (
        <g>
          <GroundShadow cx={960} cy={792} rx={160} ry={18} />
          {/* 3 crisp floating palette rings */}
          {[
            { x: 485, y: 470, fill: "#EAB308", label: "Vàng cát" },
            { x: 1435, y: 470, fill: "#16A34A", label: "Xanh rêu" },
            { x: 1435, y: 635, fill: "#C4365D", label: "Đỏ mận" },
          ].map((sw, idx) => (
            <g key={idx} transform={`translate(${sw.x}, ${(sw.y + Math.sin(frame * 0.08 + idx) * 6).toFixed(1)})`}>
              <rect x={-110} y={-34} width={220} height={68} rx={34} fill="#1E293B" stroke="#E2E8F0" strokeWidth={3} />
              <circle cx={-66} cy={0} r={20} fill={sw.fill} stroke="#FFFFFF" strokeWidth={3} />
              <text x={22} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={22} fontWeight={900} fontFamily={FONT}>
                {sw.label}
              </text>
            </g>
          ))}
          <CuteOctopus
            x={960}
            y={712}
            scale={1.5}
            frame={frame}
            pose="float"
            emotion="proud"
            accessory="bandana_green"
            colorOverride={{ main: beat7Main, belly: beat7Belly, spot: "#FCE7F3" }}
          />
        </g>
      )}

      {/* BEAT 13: Màu xanh ở đâu ra? — Tuộc (curious) pointing toward 3 pigment circles + turquoise ? */}
      {safeMode === "V24_EXPLAIN_BLUE_MYSTERY" && (
        <g>
          <GroundShadow cx={650} cy={792} rx={145} ry={18} />
          <CuteOctopus
            x={650}
            y={748}
            scale={1.45}
            frame={frame}
            pose="wave"
            emotion="curious"
            accessory="bandana_green"
          />
          <BlueMysteryPigmentsStatic />
        </g>
      )}

      {/* BEAT 21: Câu đố khó nhất — Tuộc (scale=1.5, curious) chin-thinking beside monochrome reef riddle */}
      {safeMode === "V24_EXPLAIN_THINKING_CHIN" && (
        <g>
          <GroundShadow cx={820} cy={792} rx={155} ry={18} />
          <CuteOctopus
            x={820}
            y={758}
            scale={1.5}
            frame={frame}
            pose="crawl"
            emotion="curious"
            accessory="bandana_green"
          />
          {/* Curled thinking tentacle gracefully raised toward chin */}
          <path
            d="M 885,710 C 930,685 935,642 895,638"
            fill="none"
            stroke={INK}
            strokeWidth={18}
            strokeLinecap="round"
          />
          <path
            d="M 885,710 C 930,685 935,642 895,638"
            fill="none"
            stroke="#C4365D"
            strokeWidth={10.5}
            strokeLinecap="round"
          />
          {/* Floating monochrome reef puzzle card (widened +80px so text never touches border) */}
          <g transform={`translate(1345, ${(455 + Math.sin(frame * 0.08) * 6).toFixed(1)})`}>
            <rect x={-225} y={-118} width={450} height={236} rx={28} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
            <rect x={-190} y={-88} width={380} height={120} rx={18} fill="#CBD5E1" stroke="#64748B" strokeWidth={3} />
            {/* Monochrome reef silhouette */}
            <path d="M -145,32 Q -95,-44 -48,32 M -26,32 Q 24,-60 76,32 M 82,32 Q 124,-28 158,32" fill="#64748B" />
            <circle cx={142} cy={-48} r={28} fill="#F59E0B" stroke={INK} strokeWidth={3} />
            <text x={142} y={-38} textAnchor="middle" fill="#FFFFFF" fontSize={32} fontWeight={900} fontFamily={FONT}>
              ?
            </text>
            <text x={0} y={84} textAnchor="middle" fill="#92400E" fontSize={20.5} fontWeight={900} fontFamily={FONT}>
              Đen trắng → Sao pha chuẩn màu?
            </text>
          </g>
        </g>
      )}

      {/* BEAT 27: Chưa hết đâu nhé! — Tuộc eyes closed happily surrounded by light-sensor sparkles */}
      {safeMode === "V24_EXPLAIN_EYES_CLOSED_SENSE" && (
        <g>
          <GroundShadow cx={960} cy={792} rx={155} ry={18} />
          {/* Gentle pulsing light-sensor sparkle dots around skin */}
          {[
            { x: 700, y: 465, c: "#FACC15" },
            { x: 1220, y: 465, c: "#0EA5E9" },
            { x: 645, y: 615, c: "#34D399" },
            { x: 1275, y: 615, c: "#FACC15" },
            { x: 785, y: 375, c: "#38BDF8" },
            { x: 1135, y: 375, c: "#F472B6" },
            { x: 725, y: 715, c: "#0EA5E9" },
            { x: 1195, y: 715, c: "#34D399" },
          ].map((sp, i) => {
            const sc = 0.72 + 0.34 * Math.sin(frame * 0.16 + i * 1.1);
            return (
              <g key={i} transform={`translate(${sp.x}, ${sp.y}) scale(${sc.toFixed(2)})`}>
                <circle cx={0} cy={0} r={16} fill={sp.c} opacity={0.22} />
                <path
                  d="M 0,-13 L 3.5,-3.5 L 13,0 L 3.5,3.5 L 0,13 L -3.5,3.5 L -13,0 L -3.5,-3.5 Z"
                  fill={sp.c}
                  stroke={INK}
                  strokeWidth={2}
                />
              </g>
            );
          })}
          <CuteOctopus
            x={960}
            y={718}
            scale={1.5}
            frame={frame}
            pose="float"
            emotion="proud"
            accessory="bandana_green"
          />
        </g>
      )}

      {/* BEAT 42: Cái giá phải trả — Tuộc (sleepy) beside draining red low-battery indicator */}
      {safeMode === "V24_EXPLAIN_LOW_BATTERY" && (
        <g>
          <GroundShadow cx={660} cy={792} rx={150} ry={18} />
          <CuteOctopus
            x={660}
            y={758}
            scale={1.45}
            frame={frame}
            pose="crawl"
            emotion="sleepy"
            accessory="bandana_green"
          />
          {/* Crisp low-battery monitor panel */}
          <g transform="translate(1080, 345)">
            <rect x={0} y={0} width={450} height={315} rx={30} fill="#FFFFFF" stroke="#DC2626" strokeWidth={4.5} />
            <text x={225} y={52} textAnchor="middle" fill="#991B1B" fontSize={26} fontWeight={900} fontFamily={FONT}>
              Năng lượng đổi màu
            </text>
            {/* Battery outline */}
            <rect x={68} y={96} width={286} height={112} rx={22} fill="#FEF2F2" stroke={INK} strokeWidth={5} />
            <rect x={354} y={128} width={24} height={48} rx={8} fill={INK} />
            {/* Animated red bar */}
            <rect
              x={82}
              y={110}
              width={Math.max(24, Math.round(258 * batteryLevel))}
              height={84}
              rx={13}
              fill="#EF4444"
              stroke="#991B1B"
              strokeWidth={3}
            />
            <text x={225} y={266} textAnchor="middle" fill="#DC2626" fontSize={25} fontWeight={900} fontFamily={FONT}>
              PIN YẾU • CỰC TỐN SỨC!
            </text>
          </g>
        </g>
      )}

      {/* BEAT 48: Giấc mơ của tôi — Tuộc sleeping peacefully amidst warm drifting cave sparkles */}
      {safeMode === "V24_EXPLAIN_NIGHT_DREAM" && (
        <g>
          {/* Soft dark cave silhouette behind Tuộc */}
          <path
            d="M 520,790 C 535,440 725,305 960,305 C 1195,305 1385,440 1400,790 Z"
            fill="#0F172A"
            opacity={0.46}
          />
          <GroundShadow cx={960} cy={792} rx={155} ry={18} />
          {/* Warm dream light motes */}
          {[
            { x: 675, y: 420, c: "#FEF08A" },
            { x: 1245, y: 440, c: "#FDA4AF" },
            { x: 785, y: 345, c: "#7DD3FC" },
            { x: 1130, y: 355, c: "#FEF08A" },
            { x: 615, y: 575, c: "#FDA4AF" },
            { x: 1305, y: 560, c: "#7DD3FC" },
          ].map((m, i) => (
            <circle
              key={i}
              cx={m.x}
              cy={Number((m.y + Math.sin(frame * 0.05 + i) * 14).toFixed(1))}
              r={7 + (i % 3) * 3}
              fill={m.c}
              opacity={0.48}
            />
          ))}
          <CuteOctopus
            x={960}
            y={758}
            scale={1.48}
            frame={frame}
            pose="crawl"
            emotion="sleepy"
            accessory="bandana_green"
          />
        </g>
      )}

      {/* BEAT 49: Có một sự thật... (SILENT) — Tuộc solemn, eyes open straight at viewer (no '?' badge) */}
      {safeMode === "V24_EXPLAIN_SILENT_TRUTH" && (
        <g>
          <ellipse cx={960} cy={610} rx={260} ry={220} fill="#4338CA" opacity={0.18} />
          <GroundShadow cx={960} cy={792} rx={155} ry={18} />
          <CuteOctopus
            x={960}
            y={728}
            scale={1.52}
            frame={frame}
            pose="float"
            emotion="curious"
            hideEmotionBadge={true}
            accessory="bandana_green"
          />
        </g>
      )}

      {/* BEAT 52: Câu chuyện về mẹ — Mẹ Tuộc (flower_pink) in gentle luminous halo */}
      {safeMode === "V24_EXPLAIN_MOTHER_MEMORY" && (
        <g>
          <circle cx={960} cy={575} r={255} fill="#FDA4AF" opacity={0.12} />
          <circle cx={960} cy={575} r={185} fill="#FEF08A" opacity={0.14} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <circle
              key={i}
              cx={540 + i * 120}
              cy={Number((690 - ((i * 57 + frame * 0.4) % 340)).toFixed(1))}
              r={5 + (i % 3) * 2.5}
              fill={i % 2 === 0 ? "#FEF08A" : "#FDA4AF"}
              opacity={0.55}
            />
          ))}
          <GroundShadow cx={960} cy={792} rx={155} ry={18} />
          <CuteOctopus
            x={960}
            y={722}
            scale={1.5}
            frame={frame}
            pose="float"
            emotion="happy"
            accessory="flower_pink"
          />
        </g>
      )}

      {/* BEAT 56: Sự hy sinh thầm lặng — Mẹ Tuộc smiling & gently fading into rising warm light motes */}
      {safeMode === "V24_EXPLAIN_MOTHER_FADE" && (
        <g>
          <circle cx={960} cy={565} r={220} fill="#FEF08A" opacity={(0.16 * motherFadeOpacity).toFixed(3)} />
          <g opacity={motherFadeOpacity.toFixed(3)}>
            <CuteOctopus
              x={960}
              y={720}
              scale={1.48}
              frame={frame}
              pose="float"
              emotion="happy"
              accessory="flower_pink"
            />
          </g>
          {/* Warm rising golden-pink starlight specks replacing the faded form */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const lift = interpolate(localFrame, [0, Math.max(60, durationFrames)], [0, 260], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <circle
                key={i}
                cx={720 + i * 54 + Math.sin(frame * 0.06 + i) * 10}
                cy={Number((680 - (i % 4) * 55 - lift * (0.55 + (i % 3) * 0.22)).toFixed(1))}
                r={5 + (i % 3) * 2.5}
                fill={i % 2 === 0 ? "#FEF08A" : "#FDA4AF"}
                opacity={0.78}
              />
            );
          })}
        </g>
      )}

      {/* BEAT 57: Chưa từng gặp mẹ — Tuộc looking upward at warm drifting light motes (no '?' badge) */}
      {safeMode === "V24_EXPLAIN_LOOK_UP_LIGHTS" && (
        <g>
          <GroundShadow cx={880} cy={792} rx={150} ry={18} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <g
              key={i}
              transform={`translate(${(680 + i * 95 + Math.sin(frame * 0.05 + i) * 12).toFixed(1)}, ${(
                580 -
                (i % 4) * 48 -
                moteRiseT * 210
              ).toFixed(1)})`}
            >
              <circle cx={0} cy={0} r={12} fill={i % 2 === 0 ? "#FEF08A" : "#FDA4AF"} opacity={0.22} />
              <circle cx={0} cy={0} r={5} fill="#FFFFFF" opacity={0.85} />
            </g>
          ))}
          <CuteOctopus
            x={880}
            y={758}
            scale={1.46}
            frame={frame}
            pose="crawl"
            emotion="curious"
            hideEmotionBadge={true}
            accessory="bandana_green"
          />
        </g>
      )}

      {/* BEAT 65: Còn bạn thì sao? — Tuộc waving warmly amidst gentle light specks (no quiz cards!) */}
      {safeMode === "V24_EXPLAIN_OUTRO_CHOICE" && (
        <g id="octo-v24-outro-gentle-wave">
          <GroundShadow cx={960} cy={792} rx={160} ry={18} />
          {/* Gentle floating luminous specks matching the warm reflective closing mood */}
          {[
            { x: 560, y: 420, r: 7, c: "#FFFFFF" },
            { x: 690, y: 560, r: 5.5, c: "#FEF08A" },
            { x: 780, y: 360, r: 6.5, c: "#FFFFFF" },
            { x: 1140, y: 375, r: 6.5, c: "#FEF08A" },
            { x: 1245, y: 545, r: 5.5, c: "#FFFFFF" },
            { x: 1365, y: 430, r: 7, c: "#FFFFFF" },
            { x: 640, y: 690, r: 4.5, c: "#FEF08A" },
            { x: 1290, y: 685, r: 4.5, c: "#FEF08A" },
          ].map((dot, idx) => (
            <g
              key={idx}
              transform={`translate(${dot.x}, ${(dot.y + Math.sin(frame * 0.06 + idx * 1.1) * 10).toFixed(1)})`}
            >
              <circle cx={0} cy={0} r={dot.r * 1.9} fill={dot.c} opacity={0.22} />
              <circle cx={0} cy={0} r={dot.r} fill={dot.c} opacity={0.82} />
            </g>
          ))}
          <CuteOctopus
            x={960}
            y={748}
            scale={1.5}
            frame={frame}
            pose="wave"
            emotion="happy"
            accessory="bandana_green"
          />
        </g>
      )}
    </g>
  );
};
