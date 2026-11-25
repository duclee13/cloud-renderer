import React from 'react';
import type { EpisodeVisualProps } from './index';
import { GroundShadow } from '../../SceneBackdropKit';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  MuoiCleanLabel,
  MuoiStageCardBackdrop,
  MuoiBrainEmblem,
  MuoiSkinLayers,
} from './muoiGaiSharedAssets';

/* ============================================================================
 * SVG_09: MUOI_SEROTONIN_TRAP (Beats 31–33, steps 0, 1, 2)
 *   - Step 0: Brain releases teal "Serotonin" molecules down to spinal cord to soothe pain.
 *   - Step 1: Serotonin branches sideways at spinal junction, lighting up orange "GRPR" itch neurons!
 *   - Step 2: Double-thickness orange itch impulses rocket upward back to brain ("Ngứa x2!").
 * ========================================================================== */
export const MuoiSerotoninTrapVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.24);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="TEAL" gradId="mg9_bg" cardBorder="#0D9488" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Não tiết Serotonin chảy xuống tủy sống để giảm đau'
            : activeStep === 1
              ? 'Trớ trêu: Serotonin đi lạc kích sáng tế bào ngứa GRPR!'
              : 'Xăng đổ vào lửa: Xung ngứa phóng ngược lên não gấp đôi!'
        }
        bg="#FFFFFF"
        color={activeStep === 2 ? '#991B1B' : '#0F766E'}
        border={activeStep === 2 ? '#DC2626' : '#0D9488'}
        fontSize={30}
      />

      {/* Top Center-Left Brain releasing Serotonin */}
      <MuoiBrainEmblem
        x={580}
        y={315}
        scale={1.2}
        glowColor={activeStep === 2 ? '#EA580C' : '#14B8A6'}
        glowOpacity={0.3}
      />
      <text x="580" y="448" textAnchor="middle" fill="#0F172A" fontSize="24" fontWeight="900">
        Não bộ
      </text>

      {/* Descending Teal Serotonin Stream: Brain (580, 415) → Spinal Cord Junction (580, 615) */}
      <path
        d="M 580 462 L 580 612"
        fill="none"
        stroke="#0D9488"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="16 12"
        strokeDashoffset={-(frame * 4)}
      />
      <polygon points="580,628 564,600 596,600" fill="#0D9488" />
      {[0, 1, 2].map((i) => {
        const sy = 465 + ((frame * 2.8 + i * 48) % 140);
        return <circle key={i} cx={580 + Math.sin(i + frame * 0.1) * 14} cy={sy} r="10" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="2.5" />;
      })}
      <rect x="245" y="510" width="280" height="58" rx="16" fill="#CCFBF1" stroke="#0D9488" strokeWidth="3.5" />
      <text x="385" y="547" textAnchor="middle" fill="#0F766E" fontSize="23" fontWeight="900">
        Serotonin giảm đau
      </text>

      {/* Spinal Cord Junction Box */}
      <g transform="translate(580, 685)">
        <rect x="-150" y="-50" width="300" height="100" rx="24" fill="#E2E8F0" stroke="#475569" strokeWidth="4" />
        <text x="0" y="-6" textAnchor="middle" fill="#1E293B" fontSize="24" fontWeight="900">
          Ngã ba tủy sống
        </text>
        <text x="0" y="28" textAnchor="middle" fill="#475569" fontSize="19" fontWeight="700">
          Trạm giảm đau &amp; ngứa sát nhau
        </text>
      </g>

      {/* Step 1 & 2: Serotonin branches right into GRPR Itch Neurons */}
      <g opacity={activeStep >= 1 ? 1 : 0.35}>
        <path
          d="M 730 685 L 1062 685"
          fill="none"
          stroke="#14B8A6"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray="16 10"
          strokeDashoffset={-(frame * 4.2)}
        />
        <polygon points="1080,685 1052,670 1052,700" fill="#14B8A6" />

        {/* Glowing GRPR Itch Neuron Cluster — Labels cleanly outside above & below circle */}
        <g transform="translate(1155, 660)">
          {activeStep >= 1 && (
            <circle cx="0" cy="0" r={72 + pulse * 8} fill="#FB923C" opacity="0.28" />
          )}
          <circle cx="0" cy="0" r="60" fill="#FFEDD5" stroke="#EA580C" strokeWidth="5" />
          <circle cx="-18" cy="-12" r="14" fill="#EA580C" />
          <circle cx="18" cy="-10" r="14" fill="#F97316" />
          <circle cx="0" cy="18" r="16" fill="#DC2626" />
          <rect x="-98" y="-110" width="196" height="36" rx="14" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2.8" />
          <text x="0" y="-85" textAnchor="middle" fill="#9A3412" fontSize="22" fontWeight="900">
            Tế bào GRPR
          </text>
          <text x="0" y="96" textAnchor="middle" fill="#C2410C" fontSize="20" fontWeight="800">
            (Chuyên truyền ngứa!)
          </text>
        </g>
      </g>

      {/* Step 2: Double-Thickness Amplified Orange Surge Rocketting Up Back to Brain */}
      {activeStep === 2 && (
        <g>
          <path
            d="M 1155 538 C 1155 360 995 270 720 295"
            fill="none"
            stroke="#FB923C"
            strokeWidth="28"
            strokeLinecap="round"
            opacity="0.34"
          />
          <path
            d="M 1155 538 C 1155 360 995 270 720 295"
            fill="none"
            stroke="#DC2626"
            strokeWidth="13"
            strokeLinecap="round"
            strokeDasharray="24 14"
            strokeDashoffset={-(frame * 6.5)}
          />
          <polygon points="702,298 734,278 736,314" fill="#DC2626" />

          <rect x="1205" y="255" width="445" height="122" rx="24" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4.5" />
          <text x="1428" y="305" textAnchor="middle" fill="#991B1B" fontSize="29" fontWeight="900">
            TÍN HIỆU NGỨA × 2!
          </text>
          <text x="1428" y="346" textAnchor="middle" fill="#7F1D1D" fontSize="21" fontWeight="700">
            Phóng lên não nhanh &amp; mạnh gấp đôi
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_10: MUOI_VICIOUS_SPIRAL (Beat 34, step 0)
 *   - Clean 4-node closed loop spinning smoothly inside a bright card; center: "Vòng lặp Ngứa–Gãi".
 * ========================================================================== */
export const MuoiViciousSpiralVisual: React.FC<EpisodeVisualProps> = ({ frame = 0 }) => {
  const dashShift = -(frame * 3.8);
  const spinDeg = (frame * 1.4) % 360;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="CREAM" gradId="mg10_bg" cardBorder="#DC2626" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text="Vòng lặp ác nghiệt khép kín từ da lên não"
        bg="#FFFFFF"
        color="#991B1B"
        border="#DC2626"
        fontSize={31}
      />

      {/* Animated Circular Track */}
      <circle
        cx="960"
        cy="472"
        r="228"
        fill="none"
        stroke="#DC2626"
        strokeWidth="10"
        strokeDasharray="24 14"
        strokeDashoffset={dashShift}
      />

      {/* Rotating Inner Spiral Badge */}
      <g transform="translate(960, 472)">
        <g transform={`rotate(${spinDeg.toFixed(1)})`}>
          <path d="M -98 0 A 98 98 0 0 1 82 -54" fill="none" stroke="#F97316" strokeWidth="7" strokeLinecap="round" />
          <path d="M 98 0 A 98 98 0 0 1 -82 54" fill="none" stroke="#0D9488" strokeWidth="7" strokeLinecap="round" />
        </g>
        <circle cx="0" cy="0" r="88" fill="#FEF2F2" stroke="#DC2626" strokeWidth="5" />
        <text x="0" y="-8" textAnchor="middle" fill="#991B1B" fontSize="24" fontWeight="900">
          Vòng lặp
        </text>
        <text x="0" y="26" textAnchor="middle" fill="#DC2626" fontSize="25" fontWeight="900">
          Ngứa–Gãi
        </text>
      </g>

      {/* Node 1 (Top): 1. Ngứa */}
      <g transform="translate(960, 232)">
        <rect x="-180" y="-44" width="360" height="88" rx="22" fill="#FFEDD5" stroke="#EA580C" strokeWidth="4.5" />
        <text x="0" y="-4" textAnchor="middle" fill="#9A3412" fontSize="25" fontWeight="900">
          1. Histamin gây ngứa
        </text>
        <text x="0" y="26" textAnchor="middle" fill="#7C2D12" fontSize="19" fontWeight="700">
          Muỗi đốt → Báo động lên não
        </text>
      </g>

      {/* Node 2 (Right): 2. Gãi tạo đau nhẹ */}
      <g transform="translate(1410, 472)">
        <rect x="-195" y="-52" width="390" height="104" rx="22" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4.5" />
        <text x="0" y="-8" textAnchor="middle" fill="#0369A1" fontSize="25" fontWeight="900">
          2. Gãi tạo đau nhẹ
        </text>
        <text x="0" y="26" textAnchor="middle" fill="#475569" fontSize="19" fontWeight="700">
          Át ngứa vài giây (tạm dịu)
        </text>
      </g>

      {/* Node 3 (Bottom): 3. Não tiết Serotonin */}
      <g transform="translate(960, 706)">
        <rect x="-215" y="-44" width="430" height="88" rx="22" fill="#CCFBF1" stroke="#0D9488" strokeWidth="4.5" />
        <text x="0" y="-4" textAnchor="middle" fill="#0F766E" fontSize="25" fontWeight="900">
          3. Não tiết Serotonin
        </text>
        <text x="0" y="26" textAnchor="middle" fill="#115E59" fontSize="19" fontWeight="700">
          Chạy xuống tủy sống để giảm đau
        </text>
      </g>

      {/* Node 4 (Left): 4. Kích GRPR -> Càng ngứa! */}
      <g transform="translate(510, 472)">
        <rect x="-195" y="-52" width="390" height="104" rx="22" fill="#FEE2E2" stroke="#DC2626" strokeWidth="4.5" />
        <text x="0" y="-8" textAnchor="middle" fill="#991B1B" fontSize="25" fontWeight="900">
          4. Kích tế bào GRPR
        </text>
        <text x="0" y="26" textAnchor="middle" fill="#7F1D1D" fontSize="19" fontWeight="700">
          Thổi bùng cơn ngứa mới mạnh x2!
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_11: MUOI_SKIN_DAMAGE (Beats 37–38, steps 0, 1)
 *   - Step 0: Scratched epidermis tear opens door for purple/teal bacteria entering dermis.
 *   - Step 1: Tissue darkens crimson + warning triangle badge "Viêm nhiễm & Sẹo thâm".
 * ========================================================================== */
export const MuoiSkinDamageVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="ROSE" gradId="mg11_bg" cardBorder="#BE123C" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Gãi rách biểu bì → Mở cửa cho vi khuẩn xâm nhập'
            : 'Viêm nhiễm kéo dài → Nốt sưng cứng & dễ để lại sẹo thâm'
        }
        bg="#FFFFFF"
        color="#9F1239"
        border="#E11D48"
        fontSize={31}
      />

      <MuoiSkinLayers
        bumpHeight={66}
        bumpRedness={activeStep === 1 ? 0.95 : 0.72}
        capillaryDilation={0.85}
        tornCrack={true}
      />

      {/* Darkened Inflamed Tissue Overlay in Step 1 */}
      {activeStep === 1 && (
        <ellipse cx="960" cy="488" rx="225" ry="96" fill="#9F1239" opacity="0.34" />
      )}

      {/* Cartoon Bacteria slipping through epidermis tear into dermis */}
      {[
        { bx: 942, by: 270, color: '#7C3AED' },
        { bx: 984, by: 300, color: '#0D9488' },
        { bx: 958, by: 350, color: '#9333EA' },
        { bx: 922, by: 455, color: '#7C3AED' },
        { bx: 1002, by: 472, color: '#0D9488' },
      ].map((b, i) => {
        const yDrop = activeStep === 0 ? lerp(0, 120, p) : 135;
        const wiggle = Math.sin(frame * 0.25 + i * 1.4) * 6;
        return (
          <g key={i} transform={`translate(${b.bx + wiggle}, ${Math.min(545, b.by + yDrop * (i < 3 ? 1 : 0.3))})`}>
            <rect x="-18" y="-10" width="36" height="20" rx="10" fill={b.color} stroke={INK} strokeWidth="2.8" />
            <circle cx="-6" cy="-2" r="2.6" fill="#FFFFFF" />
            <circle cx="6" cy="-2" r="2.6" fill="#FFFFFF" />
          </g>
        );
      })}

      {/* Step 0 Callout: Hàng rào bị rách */}
      {activeStep === 0 && (
        <g transform="translate(1215, 224)">
          <rect x="0" y="0" width="420" height="92" rx="20" fill="#F3E8FF" stroke="#7C3AED" strokeWidth="4" />
          <text x="210" y="40" textAnchor="middle" fill="#5B21B6" fontSize="24" fontWeight="900">
            Vi khuẩn dưới kẽ móng tay
          </text>
          <text x="210" y="74" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="700">
            Chui thẳng qua vết trầy biểu bì
          </text>
          <line x1="0" y1="48" x2="-210" y2="118" stroke="#7C3AED" strokeWidth="3.8" strokeDasharray="8 6" />
        </g>
      )}

      {/* Step 1 Warning Triangle Badge: "Viêm nhiễm & Sẹo thâm" */}
      {activeStep === 1 && (
        <g transform="translate(1210, 210)">
          <rect x="0" y="0" width="460" height="122" rx="24" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4.5" />
          <g transform="translate(62, 62)">
            <polygon points="0,-32 32,26 -32,26" fill="#FACC15" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            <text x="0" y="16" textAnchor="middle" fill={INK} fontSize="28" fontWeight="900">
              !
            </text>
          </g>
          <text x="275" y="54" textAnchor="middle" fill="#991B1B" fontSize="26" fontWeight="900">
            Viêm nhiễm &amp; Sẹo thâm
          </text>
          <text x="275" y="92" textAnchor="middle" fill="#7F1D1D" fontSize="20" fontWeight="700">
            Sưng cứng lâu ngày, khó lành sạch
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_12: MUOI_COOLING_METHOD (Beats 42–44, steps 0, 1, 2 — STRICT 1-1 SYNC)
 *   - Step 0 (Beat 42): Forearm with red bump + clean cool blue towel-wrapped ice cube radiating frost.
 *   - Step 1 (Beat 43): Close-up capillary visibly constricting narrower & swelling flattening down!
 *   - Step 2 (Beat 44): Spinal gate: cool blue "Lạnh" signal shuts out orange "Ngứa" with NO Serotonin!
 * ========================================================================== */
export const MuoiCoolingMethodVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="SKY" gradId="mg12_bg" cardBorder="#0284C7" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Cách 1: Chườm viên đá bọc khăn sạch lên nốt đốt'
            : activeStep === 1
              ? 'Hơi lạnh làm co mạch máu → Nốt sưng đỏ nhanh xẹp!'
              : 'Tín hiệu Lạnh khóa cổng ngứa — Không kích hoạt Serotonin!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={30}
      />

      {/* STEP 0 (Beat 42): Forearm + Cool Blue Towel-Wrapped Ice Pack */}
      {activeStep === 0 && (
        <g>
          {/* Forearm resting cleanly across center */}
          <path
            d="M 270 595 L 1285 575 C 1340 574 1378 608 1378 650 C 1378 692 1340 726 1285 726 L 270 740 Z"
            fill="#FED7AA"
            stroke={INK}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Red Swollen Bump on top of forearm */}
          <ellipse cx="820" cy="582" rx="68" ry="26" fill="#EF4444" opacity="0.72" />

          {/* Clean Sky-Blue Towel Wrapping an Ice Cube applied straight onto bump */}
          <g transform={`translate(820, ${485 + Math.sin(frame * 0.14) * 5})`}>
            <rect x="-126" y="-58" width="252" height="132" rx="34" fill="#BAE6FD" stroke="#0284C7" strokeWidth="5" />
            <rect x="-98" y="-34" width="196" height="84" rx="22" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="3.5" />
            {/* Stylized Translucent Ice Cube Glimpse */}
            <rect x="-36" y="-26" width="72" height="68" rx="14" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.8" />
            <line x1="-22" y1="-10" x2="8" y2="-10" stroke="#7DD3FC" strokeWidth="5" strokeLinecap="round" />
            <line x1="-22" y1="6" x2="18" y2="6" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" />
            {/* Crisp Cool Vapor Waves */}
            {[-175, -155, 155, 175].map((vx, i) => (
              <path
                key={i}
                d={`M ${vx} -25 Q ${vx + (i < 2 ? -18 : 18)} 8 ${vx} 42`}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="5.5"
                strokeLinecap="round"
                opacity={0.45 + 0.5 * Math.sin(frame * 0.16 + i)}
              />
            ))}
          </g>

          {/* Right Tip Card */}
          <g transform="translate(1210, 238)">
            <rect x="0" y="0" width="465" height="235" rx="26" fill="#F0F9FF" stroke="#0284C7" strokeWidth="4" />
            <text x="232" y="64" textAnchor="middle" fill="#0369A1" fontSize="27" fontWeight="900">
              Chườm lạnh 2–3 phút
            </text>
            <text x="232" y="114" textAnchor="middle" fill="#475569" fontSize="22" fontWeight="700">
              • Bọc đá bằng khăn sạch
            </text>
            <text x="232" y="156" textAnchor="middle" fill="#475569" fontSize="22" fontWeight="700">
              • Không áp đá trần trực tiếp
            </text>
            <text x="232" y="198" textAnchor="middle" fill="#059669" fontSize="22" fontWeight="800">
              → Làm dịu ngứa tức thì ✓
            </text>
          </g>
        </g>
      )}

      {/* STEP 1 (Beat 43): Vasoconstriction — Capillary Constricts & Bump Flattens */}
      {activeStep === 1 && (
        <g>
          <MuoiSkinLayers
            bumpHeight={lerp(82, 18, p)}
            bumpRedness={lerp(0.85, 0.25, p)}
            capillaryDilation={lerp(0.92, 0.12, p)}
          />
          {/* Cooling Downward Arrows flattening bump */}
          {[845, 960, 1075].map((cx, i) => (
            <g key={i} transform={`translate(${cx}, ${222 + Math.sin(frame * 0.18 + i) * 7})`}>
              <line x1="0" y1="0" x2="0" y2="76" stroke="#0284C7" strokeWidth="6.5" strokeLinecap="round" />
              <polygon points="0,88 -12,68 12,68" fill="#0284C7" />
            </g>
          ))}
          {/* Pinching Arrows around Capillary showing Vasoconstriction */}
          <g stroke="#0284C7" strokeWidth="5.5" strokeLinecap="round">
            <line x1="960" y1="548" x2="960" y2="594" />
            <polygon points="960,604 948,586 972,586" fill="#0284C7" stroke="none" />
            <line x1="960" y1="716" x2="960" y2="674" />
            <polygon points="960,664 948,682 972,682" fill="#0284C7" stroke="none" />
          </g>
          <rect x="1220" y="218" width="445" height="92" rx="22" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4" />
          <text x="1442" y="258" textAnchor="middle" fill="#0369A1" fontSize="25" fontWeight="900">
            Co mạch máu dưới da
          </text>
          <text x="1442" y="292" textAnchor="middle" fill="#047857" fontSize="21" fontWeight="800">
            Giảm sưng phồng &amp; tấy đỏ rõ rệt ✓
          </text>
        </g>
      )}

      {/* STEP 2 (Beat 44): Spinal Gate — Cool Blue "Lạnh" Signal Blocks Orange "Ngứa" Safely */}
      {activeStep === 2 && (
        <g>
          {/* Orange Itch Blocked Outside Gate */}
          <rect x="230" y="286" width="560" height="72" rx="22" fill="#FFEDD5" stroke="#EA580C" strokeWidth="3.5" />
          <path d="M 265 322 L 735 322" fill="none" stroke="#EA580C" strokeWidth="9" strokeDasharray="16 14" strokeDashoffset={-(frame * 2)} />
          <rect x="786" y="262" width="24" height="122" rx="8" fill="#0284C7" stroke={INK} strokeWidth="3.5" />
          <text x="485" y="266" textAnchor="middle" fill="#C2410C" fontSize="23" fontWeight="900">
            Tín hiệu NGỨA (Bị khóa êm!)
          </text>

          {/* Cool Cyan/Blue Cold Signal Flowing Smoothly Through Gate to Brain */}
          <rect x="230" y="504" width="1125" height="80" rx="26" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4.5" />
          <path
            d="M 265 544 L 1380 544"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="24 14"
            strokeDashoffset={-(frame * 5)}
          />
          <polygon points="1396,544 1366,528 1366,560" fill="#0EA5E9" />
          <text x="530" y="626" textAnchor="middle" fill="#0369A1" fontSize="25" fontWeight="900">
            Tín hiệu MÁT LẠNH đi qua cổng tủy sống
          </text>

          <MuoiBrainEmblem x={1545} y={475} scale={1.18} glowColor="#38BDF8" glowOpacity={0.32} />

          {/* Bottom Green Highlight Badge: No Pain, No Serotonin */}
          <g transform="translate(960, 712)">
            <rect x="-360" y="-34" width="720" height="68" rx="34" fill="#ECFDF5" stroke="#10B981" strokeWidth="4.5" />
            <text x="0" y="10" textAnchor="middle" fill="#065F46" fontSize="25" fontWeight="900">
              ✓ Không gây đau rát • Không kích hoạt Serotonin!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_13: MUOI_PRESS_OR_CREAM (Beats 45–46, steps 0, 1)
 *   - Step 0 (Beat 45): Left card active: perpendicular fingertip press (✓) vs clawing nails (✕).
 *   - Step 1 (Beat 46): Right card active: cool water stream + soothing antihistamine ointment shrinking bump.
 * ========================================================================== */
export const MuoiPressOrCreamVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);
  const pressY = Math.sin(frame * 0.16) * 8;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="MINT" gradId="mg13_bg" showMainCard={false} />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Cách 2: Ấn giữ nhẹ hoặc vỗ quanh nốt thay vì cào móng tay'
            : 'Cách 3: Rửa nước mát & bôi kem làm dịu / kháng Histamin'
        }
        bg="#FFFFFF"
        color="#065F46"
        border="#10B981"
        fontSize={30}
      />

      {/* LEFT CARD: Ấn nhẹ (✓) vs Cào móng (✕) */}
      <g transform="translate(150, 168)" opacity={activeStep === 0 ? 1 : 0.55}>
        <GroundShadow cx={380} cy={622} rx={360} ry={12} />
        <rect
          x="0"
          y="0"
          width="760"
          height="602"
          rx="32"
          fill="#FFFFFF"
          stroke={activeStep === 0 ? '#10B981' : '#94A3B8'}
          strokeWidth={activeStep === 0 ? '6' : '4'}
        />
        <text x="380" y="64" textAnchor="middle" fill="#065F46" fontSize="27" fontWeight="900">
          Ấn giữ nhẹ ✓  vs  Cào móng tay ✕
        </text>

        {/* Sub-box Left: Perpendicular Press ✓ */}
        <g transform="translate(44, 98)">
          <rect x="0" y="0" width="320" height="408" rx="22" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
          <path d="M 32 308 L 288 308 L 288 352 L 32 352 Z" fill="#FED7AA" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="160" cy="304" rx="44" ry="14" fill="#FB7185" />
          {/* Vertical Finger Pressing Down Gently */}
          <g transform={`translate(160, ${215 + pressY})`}>
            <rect x="-26" y="-110" width="52" height="175" rx="26" fill="#FDE68A" stroke={INK} strokeWidth="4" />
            <rect x="-16" y="34" width="32" height="24" rx="10" fill="#FFFFFF" stroke={INK} strokeWidth="2.4" />
          </g>
          <circle cx="272" cy="48" r="24" fill="#10B981" />
          <path d="M 262 49 L 270 57 L 284 41" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="160" y="388" textAnchor="middle" fill="#065F46" fontSize="22" fontWeight="900">
            Ấn thẳng vuông góc ✓
          </text>
        </g>

        {/* Sub-box Right: Claw Scratch ✕ */}
        <g transform="translate(396, 98)">
          <rect x="0" y="0" width="320" height="408" rx="22" fill="#FEF2F2" stroke="#EF4444" strokeWidth="4" />
          <path d="M 32 308 L 288 308 L 288 352 L 32 352 Z" fill="#FED7AA" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="160" cy="302" rx="52" ry="18" fill="#EF4444" />
          {/* Diagonal Scratching Claw Lines */}
          <path d="M 110 278 L 208 318 M 126 266 L 218 302" stroke="#DC2626" strokeWidth="5.5" strokeLinecap="round" />
          <g transform="translate(195, 195) rotate(28)">
            <rect x="-22" y="-85" width="44" height="145" rx="22" fill="#FDE68A" stroke={INK} strokeWidth="4" />
          </g>
          <circle cx="272" cy="48" r="24" fill="#EF4444" />
          <path d="M 262 38 L 282 58 M 282 38 L 262 58" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          <text x="160" y="388" textAnchor="middle" fill="#991B1B" fontSize="22" fontWeight="900">
            Cào rách da ✕
          </text>
        </g>

        <text x="380" y="556" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="700">
          Áp lực nhẹ chặn tín hiệu ngứa mà không làm xước da
        </text>
      </g>

      {/* RIGHT CARD: Rửa nước mát & Bôi kem kháng Histamin */}
      <g transform="translate(1010, 168)" opacity={activeStep === 1 ? 1 : 0.48}>
        <GroundShadow cx={380} cy={622} rx={360} ry={12} />
        <rect
          x="0"
          y="0"
          width="760"
          height="602"
          rx="32"
          fill="#FFFFFF"
          stroke={activeStep === 1 ? '#0284C7' : '#94A3B8'}
          strokeWidth={activeStep === 1 ? '6' : '4'}
        />
        <text x="380" y="64" textAnchor="middle" fill="#0369A1" fontSize="27" fontWeight="900">
          Rửa nước mát &amp; Kem làm dịu
        </text>

        {/* Cool Water Faucet on Left */}
        <g transform="translate(185, 195)">
          <path d="M -85 0 L 18 0 Q 45 0 45 28 L 45 48" fill="none" stroke="#64748B" strokeWidth="20" strokeLinecap="round" />
          <rect x="-16" y="-22" width="42" height="12" rx="6" fill="#0284C7" />
          {/* Animated cool water drops */}
          {[0, 1, 2].map((di) => (
            <circle
              key={di}
              cx={45 + (di - 1) * 14}
              cy={68 + ((frame * 3 + di * 36) % 108)}
              r="9"
              fill="#38BDF8"
            />
          ))}
        </g>

        {/* Soothing Antihistamine Ointment Tube on Right */}
        <g transform="translate(530, 232) rotate(-35)">
          <rect x="-28" y="-85" width="56" height="128" rx="12" fill="#10B981" stroke={INK} strokeWidth="4" />
          <rect x="-22" y="-56" width="44" height="58" rx="6" fill="#FFFFFF" />
          <text x="0" y="-22" textAnchor="middle" fill="#065F46" fontSize="14" fontWeight="900">
            KEM
          </text>
          <polygon points="-16,43 16,43 8,66 -8,66" fill="#CBD5E1" stroke={INK} strokeWidth="3.2" />
          {/* Soothing Cream Drop */}
          <circle cx="0" cy={86 + Math.sin(frame * 0.14) * 5} r="14" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="3" />
        </g>

        {/* Skin below shrinking back to normal peach tone */}
        <g transform="translate(380, 442)">
          <rect x="-270" y="0" width="540" height="66" rx="20" fill="#FED7AA" stroke={INK} strokeWidth="4" />
          <ellipse
            cx="0"
            cy="2"
            rx={activeStep === 1 ? lerp(74, 22, p) : 64}
            ry={activeStep === 1 ? lerp(24, 6, p) : 20}
            fill="#EF4444"
            opacity={activeStep === 1 ? lerp(0.75, 0.2, p) : 0.65}
          />
        </g>

        <text x="380" y="556" textAnchor="middle" fill="#0369A1" fontSize="22" fontWeight="800">
          Khóa phản ứng Histamin ngay tại gốc ✓
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_14: MUOI_COMPARISON_SCRATCH_VS_ICE (Beat 47, step 0)
 *   - Clean 2-column comparison: Red "Gãi (10 giây dịu → Ngứa x2)" vs Green/Blue "Chườm lạnh (Co mạch → Dịu hẳn)".
 * ========================================================================== */
export const MuoiComparisonScratchVsIceVisual: React.FC<EpisodeVisualProps> = () => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
    <MuoiStageCardBackdrop tone="CREAM" gradId="mg14_bg" showMainCard={false} />

    <MuoiCleanLabel
      x={960}
      y={84}
      text="So sánh nhanh: Gãi móng tay vs Chườm lạnh an toàn"
      bg="#FFFFFF"
      color="#0F172A"
      border="#64748B"
      fontSize={31}
    />

    {/* Left Column: Red — Gãi */}
    <g transform="translate(160, 168)">
      <GroundShadow cx={375} cy={622} rx={355} ry={12} />
      <rect x="0" y="0" width="750" height="602" rx="32" fill="#FFFFFF" stroke="#DC2626" strokeWidth="5.5" />
      <rect x="0" y="0" width="750" height="106" rx="32" fill="#FEE2E2" />
      <rect x="0" y="68" width="750" height="38" fill="#FEE2E2" />
      <text x="375" y="64" textAnchor="middle" fill="#991B1B" fontSize="30" fontWeight="900">
        ✕  GÃI BẰNG MÓNG TAY
      </text>

      {[
        { y: 158, title: '10 giây đầu: Đau nhẹ tạm át ngứa', sub: 'Cảm giác sảng khoái giả ngắn ngủi' },
        { y: 274, title: 'Tại da: Vỡ thêm dưỡng bào Mast', sub: 'Xả gấp đôi lượng Histamin gây sưng' },
        { y: 390, title: 'Tại não: Tiết Serotonin kích GRPR', sub: 'Trả giá bằng cơn ngứa dữ gấp đôi!' },
        { y: 506, title: 'Nguy cơ: Trầy da, nhiễm trùng, sẹo thâm', sub: 'Lâu lành suốt nhiều tuần' },
      ].map((row, idx) => (
        <g key={idx} transform={`translate(46, ${row.y})`}>
          <rect x="0" y="-26" width="658" height="92" rx="18" fill="#FFF1F2" stroke="#FECDD3" strokeWidth="2.5" />
          <circle cx="38" cy="20" r="18" fill="#EF4444" />
          <path d="M 31 13 L 45 27 M 45 13 L 31 27" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <text x="76" y="14" fill="#991B1B" fontSize="22" fontWeight="900">
            {row.title}
          </text>
          <text x="76" y="46" fill="#64748B" fontSize="18" fontWeight="600">
            {row.sub}
          </text>
        </g>
      ))}
    </g>

    {/* Center VS Badge */}
    <g transform="translate(960, 468)">
      <circle cx="0" cy="0" r="44" fill="#0F172A" stroke="#FFFFFF" strokeWidth="5" />
      <text x="0" y="11" textAnchor="middle" fill="#FEF08A" fontSize="30" fontWeight="900">
        VS
      </text>
    </g>

    {/* Right Column: Emerald/Blue — Chườm lạnh */}
    <g transform="translate(1010, 168)">
      <GroundShadow cx={375} cy={622} rx={355} ry={12} />
      <rect x="0" y="0" width="750" height="602" rx="32" fill="#FFFFFF" stroke="#10B981" strokeWidth="5.5" />
      <rect x="0" y="0" width="750" height="106" rx="32" fill="#DCFCE7" />
      <rect x="0" y="68" width="750" height="38" fill="#DCFCE7" />
      <text x="375" y="64" textAnchor="middle" fill="#065F46" fontSize="30" fontWeight="900">
        ✓  CHƯỜM LẠNH / ẤN NHẸ
      </text>

      {[
        { y: 158, title: 'Tại da: Hơi lạnh làm co mạch máu', sub: 'Nốt sưng phồng và tấy đỏ xẹp nhanh' },
        { y: 274, title: 'Tủy sống: Tín hiệu Lạnh khóa cổng ngứa', sub: 'Cắt cơn ngứa êm ái ngay tức thì' },
        { y: 390, title: 'Tại não: Không đau → Không tiết Serotonin', sub: 'Cắt đứt tận gốc vòng lặp Ngứa–Gãi!' },
        { y: 506, title: 'An toàn: Bảo vệ nguyên vẹn hàng rào da', sub: 'Da phục hồi sạch đẹp, không sẹo thâm' },
      ].map((row, idx) => (
        <g key={idx} transform={`translate(46, ${row.y})`}>
          <rect x="0" y="-26" width="658" height="92" rx="18" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2.5" />
          <circle cx="38" cy="20" r="18" fill="#10B981" />
          <path d="M 30 20 L 36 26 L 47 13" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="76" y="14" fill="#065F46" fontSize="22" fontWeight="900">
            {row.title}
          </text>
          <text x="76" y="46" fill="#475569" fontSize="18" fontWeight="600">
            {row.sub}
          </text>
        </g>
      ))}
    </g>
  </svg>
);

/* ============================================================================
 * SVG_15: MUOI_SKIN_RECOVERY (Beat 54, step 0)
 *   - 3-milestone timeline: "15 phút" → "2 giờ" → "Phục hồi sạch".
 * ========================================================================== */
export const MuoiSkinRecoveryVisual: React.FC<EpisodeVisualProps> = ({ frame = 0 }) => {
  const milestones = [
    {
      x: 410,
      time: '15 phút',
      title: 'Dịu đỏ nhanh',
      sub: 'Không cào xước thêm',
      bumpRx: 72,
      bumpRy: 26,
      bumpColor: '#F87171',
      border: '#F59E0B',
      pillBg: '#FEF3C7',
      pillText: '#B45309',
    },
    {
      x: 960,
      time: '2 giờ',
      title: 'Histamin tự phân hủy',
      sub: 'Nốt sưng xẹp rõ rệt',
      bumpRx: 44,
      bumpRy: 12,
      bumpColor: '#FCA5A5',
      border: '#0EA5E9',
      pillBg: '#E0F2FE',
      pillText: '#0369A1',
    },
    {
      x: 1510,
      time: 'Phục hồi sạch',
      title: 'Da lành nguyên vẹn ✓',
      sub: 'Không thâm, không sẹo',
      bumpRx: 0,
      bumpRy: 0,
      bumpColor: 'none',
      border: '#10B981',
      pillBg: '#DCFCE7',
      pillText: '#065F46',
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="MINT" gradId="mg15_bg" cardBorder="#10B981" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text="Không gãi: Histamin tự phân hủy &amp; da phục hồi sạch đẹp"
        bg="#FFFFFF"
        color="#065F46"
        border="#10B981"
        fontSize={31}
      />

      {/* Connecting Timeline Arrows */}
      <g stroke="#10B981" strokeWidth="7" strokeLinecap="round">
        <line x1="650" y1="468" x2="718" y2="468" strokeDasharray="12 10" strokeDashoffset={-(frame * 2.5)} />
        <polygon points="732,468 710,456 710,480" fill="#10B981" stroke="none" />
        <line x1="1200" y1="468" x2="1268" y2="468" strokeDasharray="12 10" strokeDashoffset={-(frame * 2.5)} />
        <polygon points="1282,468 1260,456 1260,480" fill="#10B981" stroke="none" />
      </g>

      {milestones.map((m, idx) => (
        <g key={idx} transform={`translate(${m.x}, 468)`}>
          <GroundShadow cx={0} cy={258} rx={210} ry={10} />
          <rect x="-220" y="-235" width="440" height="472" rx="28" fill="#FFFFFF" stroke={m.border} strokeWidth="4.5" />
          {/* Time Pill */}
          <rect x="-135" y="-202" width="270" height="54" rx="27" fill={m.pillBg} stroke={m.border} strokeWidth="3" />
          <text x="0" y="-166" textAnchor="middle" fill={m.pillText} fontSize="25" fontWeight="900">
            {m.time}
          </text>

          {/* Clean Skin Cutaway Snapshot */}
          <rect x="-175" y="-82" width="350" height="175" rx="20" fill="#FFFBEB" stroke="#E2E8F0" strokeWidth="3" />
          <path
            d={`M -165 28 Q -65 28 -36 ${28 - m.bumpRy} Q 0 ${28 - m.bumpRy * 1.45} 36 ${28 - m.bumpRy} Q 65 28 165 28 L 165 82 L -165 82 Z`}
            fill="#FED7AA"
            stroke={INK}
            strokeWidth="3.8"
          />
          {m.bumpRx > 0 ? (
            <ellipse cx="0" cy={26 - m.bumpRy * 0.4} rx={m.bumpRx} ry={m.bumpRy} fill={m.bumpColor} opacity="0.72" />
          ) : (
            <g transform="translate(0, -28)">
              <circle cx="0" cy="0" r="28" fill="#10B981" />
              <path d="M -11 1 L -3 9 L 13 -9" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          <text x="0" y="148" textAnchor="middle" fill="#0F172A" fontSize="25" fontWeight="900">
            {m.title}
          </text>
          <text x="0" y="188" textAnchor="middle" fill="#64748B" fontSize="20" fontWeight="700">
            {m.sub}
          </text>
        </g>
      ))}
    </svg>
  );
};

/* ============================================================================
 * SVG_16: MUOI_SUMMARY_3_CARDS (Beats 56–58, steps 0, 1, 2 — STRICT 1-1 SYNC)
 *   - Title: "TÓM TẮT 3 ĐIỀU CẦN NHỚ"
 *   - Step 0 (Beat 56, "thứ nhất"): Card 1 crisp & visible.
 *   - Step 1 (Beat 57, "thứ hai"): Cards 1 + 2 crisp & visible.
 *   - Step 2 (Beat 58, "thứ ba"): All 3 Cards crisp & visible.
 * ========================================================================== */
export const MuoiSummary3CardsVisual: React.FC<EpisodeVisualProps> = ({
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);
  const popScale = lerp(0.92, 1, clamp01(p * 3.5));

  const cards = [
    {
      num: '1',
      x: 400,
      title: 'Histamin gây ngứa',
      badge: 'Phản ứng miễn dịch',
      desc1: 'Muỗi bơm nước bọt khiến',
      desc2: 'dưỡng bào xả Histamin',
      accent: '#EA580C',
      bg: '#FFF7ED',
      iconType: 'HISTAMINE' as const,
    },
    {
      num: '2',
      x: 960,
      title: 'Serotonin làm ngứa thêm',
      badge: 'Gãi = Ngứa x2',
      desc1: 'Não tiết Serotonin giảm đau',
      desc2: 'lại kích sáng tế bào ngứa',
      accent: '#0D9488',
      bg: '#F0FDFA',
      iconType: 'SEROTONIN' as const,
    },
    {
      num: '3',
      x: 1520,
      title: 'Chườm lạnh / Ấn nhẹ',
      badge: 'Cắt cơn ngứa an toàn',
      desc1: 'Co mạch giảm sưng và khóa',
      desc2: 'cổng ngứa êm tại tủy sống',
      accent: '#0284C7',
      bg: '#F0F9FF',
      iconType: 'COOL' as const,
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="CREAM" gradId="mg16_bg" showMainCard={false} />

      <MuoiCleanLabel
        x={960}
        y={88}
        text="TÓM TẮT 3 ĐIỀU CẦN NHỚ"
        bg="#FFFFFF"
        color="#0F172A"
        border="#0284C7"
        fontSize={34}
      />

      {cards.map((c, idx) => {
        const visible = idx <= activeStep;
        const isCurrent = idx === activeStep;
        const s = isCurrent ? popScale : 1;
        if (!visible) {
          return (
            <g key={c.num} transform={`translate(${c.x}, 476)`} opacity="0.24">
              <rect x="-235" y="-270" width="470" height="540" rx="30" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="4" strokeDasharray="14 10" />
              <circle cx="0" cy="0" r="44" fill="#E2E8F0" />
              <text x="0" y="16" textAnchor="middle" fill="#64748B" fontSize="42" fontWeight="900">
                {c.num}
              </text>
            </g>
          );
        }

        return (
          <g key={c.num} transform={`translate(${c.x}, 476) scale(${s.toFixed(3)})`}>
            <GroundShadow cx={0} cy={286} rx={225} ry={12} />
            <rect x="-235" y="-270" width="470" height="540" rx="30" fill="#FFFFFF" stroke={c.accent} strokeWidth={isCurrent ? '6.5' : '4.5'} />

            {/* Top Number Badge */}
            <circle cx="0" cy="-210" r="34" fill={c.accent} stroke="#FFFFFF" strokeWidth="4" />
            <text x="0" y="-198" textAnchor="middle" fill="#FFFFFF" fontSize="32" fontWeight="900">
              {c.num}
            </text>

            {/* Clean Visual Icon Box */}
            <rect x="-175" y="-154" width="350" height="172" rx="22" fill={c.bg} stroke={c.accent} strokeWidth="3" />
            {c.iconType === 'HISTAMINE' && (
              <g transform="translate(0, -68)">
                <circle cx="-46" cy="0" r="34" fill="#F97316" stroke={INK} strokeWidth="3.5" />
                <text x="-46" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">
                  Mast
                </text>
                {[
                  { dx: 18, dy: -26 },
                  { dx: 48, dy: -10 },
                  { dx: 30, dy: 18 },
                  { dx: 74, dy: 14 },
                  { dx: 64, dy: -32 },
                ].map((d, di) => (
                  <circle key={di} cx={d.dx} cy={d.dy} r="10" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2.2" />
                ))}
              </g>
            )}
            {c.iconType === 'SEROTONIN' && (
              <g transform="translate(0, -68)">
                <ellipse cx="0" cy="0" rx="108" ry="58" fill="#FFFFFF" stroke="#DC2626" strokeWidth="6" strokeDasharray="16 10" />
                <text x="0" y="-8" textAnchor="middle" fill="#0F766E" fontSize="22" fontWeight="900">
                  Serotonin
                </text>
                <text x="0" y="24" textAnchor="middle" fill="#DC2626" fontSize="23" fontWeight="900">
                  → Ngứa ×2!
                </text>
              </g>
            )}
            {c.iconType === 'COOL' && (
              <g transform="translate(0, -68)">
                <rect x="-66" y="-42" width="132" height="84" rx="20" fill="#BAE6FD" stroke="#0284C7" strokeWidth="4" />
                <rect x="-30" y="-24" width="60" height="48" rx="10" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="3.2" />
                <circle cx="62" cy="-34" r="20" fill="#10B981" />
                <path d="M 54 -34 L 60 -28 L 71 -41" fill="none" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}

            {/* Main Card Title */}
            <text x="0" y="72" textAnchor="middle" fill="#0F172A" fontSize="27" fontWeight="900">
              {c.title}
            </text>

            {/* Key Takeaway Pill */}
            <rect x="-170" y="96" width="340" height="46" rx="23" fill={c.bg} stroke={c.accent} strokeWidth="2.8" />
            <text x="0" y="127" textAnchor="middle" fill={c.accent} fontSize="21" fontWeight="900">
              {c.badge}
            </text>

            {/* Concise 2-Line Description */}
            <text x="0" y="190" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="700">
              {c.desc1}
            </text>
            <text x="0" y="224" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="700">
              {c.desc2}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
