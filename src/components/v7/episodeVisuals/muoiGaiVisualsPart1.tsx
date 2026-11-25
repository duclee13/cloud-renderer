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
  MuoiMosquito2D,
  MuoiBrainEmblem,
  MuoiSkinLayers,
} from './muoiGaiSharedAssets';

/* ============================================================================
 * SVG_01: MUOI_INTRO_VICIOUS_CYCLE (Beats 8–9, steps 0, 1)
 *   - Step 0: 3-step circular cycle card: 1. Muỗi chích → 2. Gãi thấy dịu → 3. Ngứa gấp đôi!
 *   - Step 1: Nodes 2 & 3 glow orange; dashed red feedback arrow surges back into swollen center bump.
 * ========================================================================== */
export const MuoiIntroViciousCycleVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.16);
  const dashShift = -(frame * 3.2);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="CREAM" gradId="mg1_bg" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Cái bẫy quen thuộc: Càng gãi lại càng ngứa!'
            : 'Phản xạ gãi kích hoạt chuỗi phản ứng từ da lên não'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={31}
      />

      {/* Circular track connecting the 3 nodes (y=195..735) */}
      <circle
        cx="960"
        cy="472"
        r="212"
        fill="none"
        stroke={activeStep === 1 ? '#EF4444' : '#CBD5E1'}
        strokeWidth={activeStep === 1 ? '8' : '6'}
        strokeDasharray="18 12"
        strokeDashoffset={dashShift}
      />

      {/* Center Swollen Bump Emblem */}
      <g transform="translate(960, 472)">
        <circle
          cx="0"
          cy="0"
          r={activeStep === 1 ? 84 + pulse * 10 : 76}
          fill="#FEE2E2"
          stroke={activeStep === 1 ? '#DC2626' : '#EF4444'}
          strokeWidth="5"
        />
        <path d="M -54 24 Q -24 24 -12 2 Q 0 -18 12 2 Q 24 24 54 24 L 54 44 L -54 44 Z" fill="#FED7AA" stroke={INK} strokeWidth="3.5" />
        <ellipse cx="0" cy="4" rx={activeStep === 1 ? 26 : 18} ry={activeStep === 1 ? 15 : 10} fill="#EF4444" />
        <text x="0" y="64" textAnchor="middle" fill="#991B1B" fontSize="19" fontWeight="900">
          {activeStep === 1 ? 'Sưng ngứa x2!' : 'Nốt muỗi đốt'}
        </text>
      </g>

      {/* Step 1 Node (Top): 1. Muỗi chích */}
      <g transform="translate(960, 245)">
        <rect x="-178" y="-54" width="356" height="108" rx="24" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4.5" />
        <MuoiMosquito2D x={-118} y={-2} scale={0.55} angleDeg={12} frame={frame} />
        <text x="26" y="-6" textAnchor="middle" fill="#B45309" fontSize="26" fontWeight="900">
          1. Muỗi chích
        </text>
        <text x="26" y="28" textAnchor="middle" fill="#64748B" fontSize="20" fontWeight="700">
          Nổi nốt đỏ &amp; râm ran
        </text>
      </g>

      {/* Step 2 Node (Bottom-Right): 2. Gãi thấy dịu */}
      <g transform="translate(1320, 615)">
        {activeStep === 1 && (
          <rect
            x="-194"
            y="-68"
            width="388"
            height="136"
            rx="30"
            fill="none"
            stroke="#F97316"
            strokeWidth="7"
            opacity={pulse}
          />
        )}
        <rect x="-182" y="-56" width="364" height="112" rx="24" fill="#EFF6FF" stroke="#0284C7" strokeWidth="4.5" />
        <text x="0" y="-8" textAnchor="middle" fill="#0369A1" fontSize="26" fontWeight="900">
          2. Gãi thấy dịu
        </text>
        <text x="0" y="28" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="700">
          Êm ngay trong ~10 giây
        </text>
      </g>

      {/* Step 3 Node (Bottom-Left): 3. Ngứa gấp đôi! */}
      <g transform="translate(600, 615)">
        {activeStep === 1 && (
          <rect
            x="-194"
            y="-68"
            width="388"
            height="136"
            rx="30"
            fill="none"
            stroke="#EA580C"
            strokeWidth="7"
            opacity={pulse}
          />
        )}
        <rect x="-182" y="-56" width="364" height="112" rx="24" fill="#FEF2F2" stroke="#DC2626" strokeWidth="4.5" />
        <text x="0" y="-8" textAnchor="middle" fill="#B91C1C" fontSize="26" fontWeight="900">
          3. Ngứa gấp đôi!
        </text>
        <text x="0" y="28" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="700">
          Sưng to &amp; càng muốn gãi
        </text>
      </g>

      {/* Red surge arrow from Node 3 back into Center Bump in Step 1 */}
      {activeStep === 1 && (
        <g>
          <path
            d="M 755 568 Q 845 538 892 508"
            fill="none"
            stroke="#DC2626"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="16 10"
            strokeDashoffset={dashShift}
          />
          <polygon points="902,502 878,504 890,522" fill="#DC2626" />
          <path
            d="M 1165 568 Q 1080 538 1028 508"
            fill="none"
            stroke="#EA580C"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="16 10"
            strokeDashoffset={dashShift}
          />
          <polygon points="1018,502 1042,504 1030,522" fill="#EA580C" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_02: MUOI_SALIVA_SKIN (Beats 12–14, steps 0, 1, 2)
 *   - Step 0: Mosquito proboscis pierces skin to capillary, injecting purple "Nước bọt muỗi".
 *   - Step 1: Surrounding orange "Tế bào Mast" cells pop up red "!" alarm badges.
 *   - Step 2: Mast cells burst releasing showers of red "Histamin" granules into dermis.
 * ========================================================================== */
export const MuoiSalivaSkinVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);
  const salivaDropY = 425 + ((frame * 2.2) % 135);
  const mastCells = [
    { cx: 690, cy: 495 },
    { cx: 1225, cy: 500 },
    { cx: 815, cy: 538 },
    { cx: 1115, cy: 535 },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="ROSE" gradId="mg2_bg" cardBorder="#F97316" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Muỗi bơm nước bọt chống đông máu vào da'
            : activeStep === 1
              ? 'Hệ miễn dịch phát hiện kẻ xâm nhập lạ!'
              : 'Tế bào Mast vỡ ra, xả ồ ạt chất Histamin'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={31}
      />

      <MuoiSkinLayers bumpHeight={activeStep === 2 ? 42 : 16} bumpRedness={activeStep === 2 ? 0.55 : 0.22} capillaryDilation={activeStep === 2 ? 0.45 : 0.15} />

      {/* Mosquito inserting proboscis downward into capillary */}
      <g>
        <MuoiMosquito2D x={910} y={248} scale={1.18} angleDeg={42} frame={frame} />
        <line x1="960" y1="304" x2="960" y2="625" stroke={INK} strokeWidth="6.5" strokeLinecap="round" />
        <line x1="960" y1="304" x2="960" y2="625" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" />
      </g>

      {/* Purple Saliva Droplets labeled "Nước bọt muỗi" */}
      <g>
        {[0, 1, 2].map((i) => {
          const dy = 420 + ((salivaDropY + i * 48 - 420) % 150);
          const dx = Math.sin(i * 2.1 + frame * 0.08) * 18;
          return (
            <circle
              key={i}
              cx={960 + dx}
              cy={dy}
              r="11"
              fill="#9333EA"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          );
        })}
        <rect x="1040" y="308" width="235" height="48" rx="14" fill="#F3E8FF" stroke="#9333EA" strokeWidth="3.2" />
        <text x="1158" y="340" textAnchor="middle" fill="#6B21A8" fontSize="22" fontWeight="800">
          Nước bọt muỗi
        </text>
        <line x1="1040" y1="336" x2="974" y2="435" stroke="#9333EA" strokeWidth="3.2" strokeDasharray="7 5" />
      </g>

      {/* Orange Mast Cells */}
      {mastCells.map((mc, idx) => (
        <g key={idx} transform={`translate(${mc.cx}, ${mc.cy})`}>
          {activeStep === 1 && (
            <circle
              cx="0"
              cy="0"
              r={42 + ((frame * 1.4 + idx * 10) % 28)}
              fill="none"
              stroke="#EF4444"
              strokeWidth="4"
              opacity={1 - ((frame * 1.4 + idx * 10) % 28) / 28}
            />
          )}
          <circle
            cx="0"
            cy="0"
            r="34"
            fill="#F97316"
            stroke={INK}
            strokeWidth="3.8"
            strokeDasharray={activeStep === 2 ? '12 7' : undefined}
          />
          <text x="0" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="900">
            Mast
          </text>

          {/* Step 1: Alarm "!" badge */}
          {activeStep === 1 && (
            <g transform="translate(26, -28)">
              <circle cx="0" cy="0" r="18" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
              <text x="0" y="7" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900">
                !
              </text>
            </g>
          )}

          {/* Step 2: Bursting Histamin red granules spreading outward */}
          {activeStep === 2 &&
            [0, 1, 2, 3, 4, 5].map((hi) => {
              const ang = (hi * Math.PI) / 3 + idx * 0.4;
              const dist = 38 + lerp(0, 72, clamp01(p * 1.2)) + ((frame * 1.5 + hi * 9) % 36);
              return (
                <circle
                  key={hi}
                  cx={Math.cos(ang) * dist}
                  cy={Math.sin(ang) * dist * 0.65}
                  r="8"
                  fill="#DC2626"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              );
            })}
        </g>
      ))}

      {/* Clean Callout Badges for Tế bào Mast & Histamin */}
      {activeStep >= 1 && (
        <g transform="translate(415, 290)">
          <rect x="0" y="0" width="210" height="48" rx="14" fill="#FFEDD5" stroke="#EA580C" strokeWidth="3.2" />
          <text x="105" y="32" textAnchor="middle" fill="#9A3412" fontSize="22" fontWeight="800">
            Tế bào Mast
          </text>
          <line x1="150" y1="48" x2="262" y2="176" stroke="#EA580C" strokeWidth="3.2" strokeDasharray="7 5" />
        </g>
      )}

      {activeStep === 2 && (
        <g transform="translate(1345, 290)">
          <rect x="0" y="0" width="235" height="48" rx="14" fill="#FEE2E2" stroke="#DC2626" strokeWidth="3.2" />
          <text x="118" y="32" textAnchor="middle" fill="#991B1B" fontSize="22" fontWeight="800">
            Hạt Histamin đỏ
          </text>
          <line x1="80" y1="48" x2="-78" y2="178" stroke="#DC2626" strokeWidth="3.2" strokeDasharray="7 5" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_03: MUOI_HISTAMINE_SWELLING (Beats 15–16, steps 0, 1)
 *   - Step 0: Capillary dilates wider, white blood cells arrive, skin bulges into red bump.
 *   - Step 1: Histamin molecules lock into Y-shaped receptors on an orange itch sensory nerve fiber.
 * ========================================================================== */
export const MuoiHistamineSwellingVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);
  const dilation = activeStep === 0 ? lerp(0.25, 0.92, p) : 0.92;
  const bumpH = activeStep === 0 ? lerp(32, 86, p) : 86;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="ROSE" gradId="mg3_bg" cardBorder="#DC2626" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Histamin làm giãn mao mạch → Da sưng phồng tấy đỏ'
            : 'Histamin gắn vào thụ thể chữ Y trên dây thần kinh ngứa'
        }
        bg="#FFFFFF"
        color="#991B1B"
        border="#DC2626"
        fontSize={31}
      />

      <MuoiSkinLayers bumpHeight={bumpH} bumpRedness={0.85} capillaryDilation={dilation} />

      {/* White Blood Cells gliding inside dilated capillary */}
      {[0, 1, 2, 3].map((wi) => {
        const wx = 320 + ((frame * 3 + wi * 340) % 1300);
        return (
          <g key={wi} transform={`translate(${wx}, 635)`}>
            <circle cx="0" cy="0" r="19" fill="#F8FAFC" stroke="#0284C7" strokeWidth="3.2" />
            <circle cx="-4" cy="-2" r="7" fill="#93C5FD" />
            <circle cx="5" cy="3" r="5" fill="#60A5FA" />
          </g>
        );
      })}

      {/* Upward Dilation Arrows showing swelling push */}
      {activeStep === 0 && (
        <g stroke="#DC2626" strokeWidth="5" strokeLinecap="round" fill="none">
          {[855, 960, 1065].map((ax, i) => (
            <g key={i} transform={`translate(${ax}, ${470 - Math.sin(frame * 0.16 + i) * 6})`}>
              <line x1="0" y1="75" x2="0" y2="10" />
              <polygon points="0,0 -11,18 11,18" fill="#DC2626" stroke="none" />
            </g>
          ))}
          <rect x="1220" y="216" width="380" height="84" rx="20" fill="#FEE2E2" stroke="#DC2626" strokeWidth="3.8" />
          <text x="1410" y="254" textAnchor="middle" fill="#991B1B" fontSize="24" fontWeight="900">
            Mạch giãn + Bạch cầu tới
          </text>
          <text x="1410" y="284" textAnchor="middle" fill="#7F1D1D" fontSize="19" fontWeight="700">
            Đẩy mặt da đội lên sưng đỏ
          </text>
        </g>
      )}

      {/* Step 1: Orange Itch Sensory Nerve Fiber + Y-Shaped Receptors + Docked Histamin */}
      {activeStep === 1 && (
        <g>
          <path
            d="M 1680 500 C 1450 500 1320 470 1180 462 C 1070 456 1010 442 960 442 C 900 442 845 456 760 468"
            fill="none"
            stroke="#EA580C"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 760 468 C 845 456 900 442 960 442 C 1010 442 1070 456 1180 462 C 1320 470 1450 500 1680 500"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="18 22"
            strokeDashoffset={-(frame * 5)}
          />
          {/* 3 Y-shaped Receptors catching Red Histamin dots */}
          {[835, 960, 1085].map((rx, idx) => (
            <g key={idx} transform={`translate(${rx}, ${idx === 1 ? 442 : 458})`}>
              <path d="M 0 0 L 0 -24 M 0 -24 L -15 -40 M 0 -24 L 15 -40" fill="none" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" />
              <circle cx="0" cy="-42" r="13" fill="#DC2626" stroke="#FFFFFF" strokeWidth="3" />
              <circle
                cx="0"
                cy="-42"
                r={18 + ((frame * 1.4 + idx * 8) % 20)}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
                opacity={1 - ((frame * 1.4 + idx * 8) % 20) / 20}
              />
            </g>
          ))}
          <rect x="1195" y="216" width="435" height="84" rx="20" fill="#FFEDD5" stroke="#EA580C" strokeWidth="3.8" />
          <text x="1412" y="254" textAnchor="middle" fill="#9A3412" fontSize="24" fontWeight="900">
            Khớp nối chữ Y (Thụ thể ngứa)
          </text>
          <text x="1412" y="284" textAnchor="middle" fill="#C2410C" fontSize="19" fontWeight="700">
            Histamin bấm nút → Phát xung ngứa!
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_04: MUOI_NERVE_SIGNAL_UP (Beats 17–18, steps 0, 1)
 *   - Step 0: Minimalist body silhouette inside light card; orange pulses race arm → spine → brain.
 *   - Step 1: Brain glows orange + return motor command arrow bounces back down to hand ("Gãi ngay!").
 * ========================================================================== */
export const MuoiNerveSignalUpVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.22);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="CREAM" gradId="mg4_bg" cardBorder="#EA580C" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Xung điện ngứa chạy từ cánh tay → Tủy sống → Vỏ não'
            : 'Não nhận báo động ngứa & phát lệnh bàn tay gãi ngay!'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={31}
      />

      {/* Minimalist Upper-Body Human Silhouette centered at x=780 */}
      <g transform="translate(760, 495)">
        {/* Head & Torso & Arms */}
        <circle cx="0" cy="-210" r="72" fill="#FFF7ED" stroke={INK} strokeWidth="5" />
        <path
          d="M -26 -140 L -26 -108 L -112 -86 L -225 45 L -185 75 L -98 -22 L -92 225 L 92 225 L 98 -22 L 185 75 L 225 45 L 112 -86 L 26 -108 L 26 -140 Z"
          fill="#F8FAFC"
          stroke={INK}
          strokeWidth="4.8"
          strokeLinejoin="round"
        />
        {/* Spine Column */}
        <rect x="-14" y="-128" width="28" height="315" rx="14" fill="#E2E8F0" stroke="#64748B" strokeWidth="3.2" />
        {/* Brain inside Head */}
        <MuoiBrainEmblem
          x={0}
          y={-218}
          scale={0.58}
          glowColor="#F97316"
          glowOpacity={activeStep === 1 ? 0.35 + pulse * 0.25 : 0.14}
        />

        {/* Red Mosquito Bite on Left Forearm */}
        <circle cx="-192" cy="48" r="16" fill="#EF4444" stroke="#991B1B" strokeWidth="3.5" />
        <circle cx="-192" cy="48" r={22 + (frame % 18)} fill="none" stroke="#EF4444" strokeWidth="3.5" opacity={1 - (frame % 18) / 18} />

        {/* Ascending Orange Itch Impulse: Forearm → Shoulder → Spine → Brain */}
        <path
          d="M -186 42 L -102 -56 L 0 -72 L 0 -198"
          fill="none"
          stroke="#EA580C"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="20 14"
          strokeDashoffset={-(frame * 4.5)}
        />
        <polygon points="0,-208 -12,-188 12,-188" fill="#EA580C" />

        {/* Step 1: Return Reflex Command Arrow down to Right Hand */}
        {activeStep === 1 && (
          <g>
            <path
              d="M 24 -188 L 24 -76 L 106 -54 L 190 42"
              fill="none"
              stroke="#0284C7"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="18 12"
              strokeDashoffset={-(frame * 4.5)}
            />
            <polygon points="198,50 176,44 192,28" fill="#0284C7" />
          </g>
        )}
      </g>

      {/* Right Side Step Cards (x=1140..1690) */}
      <g transform="translate(1155, 250)">
        <rect x="0" y="0" width="525" height="128" rx="22" fill="#FFEDD5" stroke="#EA580C" strokeWidth="4" />
        <text x="262" y="50" textAnchor="middle" fill="#9A3412" fontSize="26" fontWeight="900">
          1. Đường cảm giác ngứa (Cam)
        </text>
        <text x="262" y="90" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="700">
          Cánh tay → Tủy sống → Vỏ não
        </text>

        <rect
          x="0"
          y="168"
          width="525"
          height="128"
          rx="22"
          fill={activeStep === 1 ? '#E0F2FE' : '#F8FAFC'}
          stroke={activeStep === 1 ? '#0284C7' : '#CBD5E1'}
          strokeWidth="4"
          opacity={activeStep === 1 ? 1 : 0.6}
        />
        <text
          x="262"
          y="218"
          textAnchor="middle"
          fill={activeStep === 1 ? '#0369A1' : '#64748B'}
          fontSize="26"
          fontWeight="900"
        >
          2. Phản xạ từ não bộ (Xanh)
        </text>
        <text x="262" y="258" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="700">
          {activeStep === 1 ? 'Ra lệnh: Đưa tay gãi ngay!' : 'Chờ não bộ xử lý tín hiệu'}
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_05: MUOI_PAIN_GATE_THEORY (Beats 21–22, steps 0, 1)
 *   - Step 0: Close-up finger/nail lightly scratching swollen bump, creating blue "Đau nhẹ" sparks.
 *   - Step 1: 2-lane highway (orange "Ngứa" & blue "Đau nhẹ") converging into 1 shared spinal cord gate.
 * ========================================================================== */
export const MuoiPainGateTheoryVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const scratchX = Math.sin(frame * 0.35) * 34;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="SKY" gradId="mg5_bg" cardBorder="#0284C7" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Móng tay gãi tạo ra cảm giác đau rát nhẹ trên mặt da'
            : 'Cả Ngứa & Đau nhẹ đều đi chung 1 cổng ở tủy sống'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={31}
      />

      {activeStep === 0 ? (
        <g>
          <MuoiSkinLayers bumpHeight={68} bumpRedness={0.8} capillaryDilation={0.7} />
          {/* Scratching Finger & Fingernail moving back and forth across bump */}
          <g transform={`translate(${960 + scratchX}, 290)`}>
            <path
              d="M 160 -110 L 20 12 C -2 32 -28 24 -22 0 L 90 -132 Z"
              fill="#FDE68A"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <path d="M -20 4 C -28 18 -14 34 2 22 L 10 12 L -12 -6 Z" fill="#FFFFFF" stroke={INK} strokeWidth="3.2" />
            {/* Blue Electric "Đau nhẹ" Sparks */}
            {[-46, 0, 46].map((sx, idx) => (
              <path
                key={idx}
                d={`M ${sx - 12} 44 L ${sx} 22 L ${sx + 10} 44`}
                fill="none"
                stroke="#0284C7"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
          <rect x="1220" y="218" width="420" height="84" rx="20" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4" />
          <text x="1430" y="256" textAnchor="middle" fill="#0369A1" fontSize="25" fontWeight="900">
            Tia xung xanh: Đau nhẹ
          </text>
          <text x="1430" y="286" textAnchor="middle" fill="#475569" fontSize="20" fontWeight="700">
            Ma sát móng tay phát tín hiệu đau rát
          </text>
        </g>
      ) : (
        /* Step 1: 2-Lane Convergence into Spinal Cord Control Gate */
        <g>
          {/* Orange Lane (Top Left) = Ngứa */}
          <path d="M 240 345 C 470 345 610 405 795 450" fill="none" stroke="#FFEDD5" strokeWidth="52" strokeLinecap="round" />
          <path
            d="M 240 345 C 470 345 610 405 795 450"
            fill="none"
            stroke="#EA580C"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="20 14"
            strokeDashoffset={-(frame * 3.8)}
          />
          <rect x="235" y="246" width="275" height="60" rx="18" fill="#FFEDD5" stroke="#EA580C" strokeWidth="3.8" />
          <text x="372" y="285" textAnchor="middle" fill="#9A3412" fontSize="25" fontWeight="900">
            Làn tín hiệu NGỨA
          </text>

          {/* Blue Lane (Bottom Left) = Đau nhẹ */}
          <path d="M 240 610 C 470 610 610 550 795 505" fill="none" stroke="#E0F2FE" strokeWidth="52" strokeLinecap="round" />
          <path
            d="M 240 610 C 470 610 610 550 795 505"
            fill="none"
            stroke="#0284C7"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="20 14"
            strokeDashoffset={-(frame * 4.6)}
          />
          <rect x="235" y="646" width="295" height="60" rx="18" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3.8" />
          <text x="382" y="685" textAnchor="middle" fill="#0369A1" fontSize="25" fontWeight="900">
            Làn tín hiệu ĐAU NHẸ
          </text>

          {/* Shared Spinal Cord Gate Hub in Center-Right */}
          <g transform="translate(985, 478)">
            <rect x="-155" y="-125" width="310" height="250" rx="32" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="5" />
            <text x="0" y="-66" textAnchor="middle" fill="#854D0E" fontSize="25" fontWeight="900">
              CỔNG TỦY SỐNG
            </text>
            <text x="0" y="-32" textAnchor="middle" fill="#A16207" fontSize="19" fontWeight="700">
              Trạm trung chuyển chung
            </text>
            <rect x="-98" y="2" width="196" height="82" rx="18" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="3.5" />
            <text x="0" y="51" textAnchor="middle" fill="#0F172A" fontSize="23" fontWeight="800">
              2 làn → 1 cổng
            </text>
          </g>

          {/* Outgoing Track Toward Brain on Far Right */}
          <line x1="1140" y1="478" x2="1410" y2="478" stroke="#94A3B8" strokeWidth="26" strokeLinecap="round" opacity="0.35" />
          <MuoiBrainEmblem x={1535} y={478} scale={1.1} />
          <text x="1535" y="616" textAnchor="middle" fill="#0F172A" fontSize="24" fontWeight="800">
            Lên não bộ
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_06: MUOI_PAIN_OVERRIDES_ITCH (Beats 23–24, steps 0, 1)
 *   - Step 0: Spinal gate drops barrier blocking Orange (Ngứa), opens wide for Blue (Đau nhẹ).
 *   - Step 1: Blue pain wave reaches brain while Orange itch wave is halted outside the gate.
 * ========================================================================== */
export const MuoiPainOverridesItchVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="SKY" gradId="mg6_bg" cardBorder="#0284C7" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Tín hiệu Đau nhẹ luôn được ưu tiên cao hơn Ngứa'
            : 'Đau nhẹ tạm chặn đứng luồng Ngứa trước cổng tủy sống'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={31}
      />

      {/* Top Track: Orange Itch BLOCKED by Red/White Gate Barrier */}
      <g>
        <rect x="230" y="302" width="590" height="72" rx="22" fill="#FFEDD5" stroke="#EA580C" strokeWidth="3.5" />
        <path
          d="M 260 338 L 745 338"
          fill="none"
          stroke="#EA580C"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="18 14"
          strokeDashoffset={-(frame * 2)}
        />
        {/* Closed Barrier Bar at x=820 */}
        <rect x="812" y="274" width="24" height="128" rx="8" fill="#DC2626" stroke={INK} strokeWidth="3.5" />
        <g transform="translate(824, 240)">
          <rect x="-86" y="-24" width="172" height="44" rx="14" fill="#FEE2E2" stroke="#DC2626" strokeWidth="3.2" />
          <text x="0" y="6" textAnchor="middle" fill="#991B1B" fontSize="20" fontWeight="900">
            CHẶN NGỨA ✕
          </text>
        </g>
        <text x="495" y="280" textAnchor="middle" fill="#C2410C" fontSize="24" fontWeight="900">
          Tín hiệu NGỨA (Bị giữ ngoài cổng)
        </text>
      </g>

      {/* Bottom Track: Blue Pain PRIORITY OPEN directly to Brain */}
      <g>
        <rect x="230" y="538" width="1125" height="80" rx="26" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4" />
        {/* Open Green Gate Signal */}
        <circle cx="824" cy="500" r="20" fill="#10B981" stroke={INK} strokeWidth="3.2" />
        <text x="955" y="508" textAnchor="middle" fill="#065F46" fontSize="22" fontWeight="900">
          ƯU TIÊN CHẠY THẲNG ✓
        </text>
        <path
          d={activeStep === 1 ? 'M 260 578 L 1380 578' : 'M 260 578 L 1120 578'}
          fill="none"
          stroke="#0284C7"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="24 14"
          strokeDashoffset={-(frame * 5.2)}
        />
        <polygon
          points={activeStep === 1 ? '1395,578 1365,562 1365,594' : '1138,578 1108,562 1108,594'}
          fill="#0284C7"
        />
        <text x="510" y="662" textAnchor="middle" fill="#0369A1" fontSize="24" fontWeight="900">
          Tín hiệu ĐAU NHẸ (Vượt cổng lên não)
        </text>
      </g>

      {/* Brain on Far Right receiving Blue wave */}
      <MuoiBrainEmblem
        x={1545}
        y={490}
        scale={1.25}
        glowColor={activeStep === 1 ? '#38BDF8' : undefined}
        glowOpacity={activeStep === 1 ? 0.34 : 0}
      />
      <text x="1545" y="646" textAnchor="middle" fill="#0369A1" fontSize="24" fontWeight="900">
        {activeStep === 1 ? 'Não bị đánh lạc hướng!' : 'Não bộ ưu tiên xử lý đau'}
      </text>
    </svg>
  );
};

/* ============================================================================
 * SVG_07: MUOI_DOPAMINE_REWARD (Beat 25, step 0)
 *   - Brain emblem inside bright card showing green check "Tạm dịu!" + golden Dopamin sparkles.
 * ========================================================================== */
export const MuoiDopamineRewardVisual: React.FC<EpisodeVisualProps> = ({ frame = 0 }) => {
  const floatY = Math.sin(frame * 0.12) * 8;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="MINT" gradId="mg7_bg" cardBorder="#10B981" />

      <MuoiCleanLabel
        x={960}
        y={84}
        text="Não tạm quên ngứa &amp; thưởng chút Dopamin sảng khoái"
        bg="#FFFFFF"
        color="#065F46"
        border="#10B981"
        fontSize={31}
      />

      {/* Glowing Center Brain Reward Card */}
      <g transform={`translate(760, ${475 + floatY})`}>
        <MuoiBrainEmblem x={0} y={0} scale={1.55} glowColor="#FDE047" glowOpacity={0.34} />
        {/* Golden Dopamin Sparkle Granules radiating outward */}
        {[
          { x: -165, y: -115, r: 15 },
          { x: -195, y: 20, r: 11 },
          { x: 168, y: -110, r: 16 },
          { x: 195, y: 24, r: 12 },
          { x: 110, y: -165, r: 13 },
          { x: -100, y: -162, r: 12 },
        ].map((sp, i) => {
          const s = 0.85 + 0.25 * Math.sin(frame * 0.18 + i);
          return (
            <g key={i} transform={`translate(${sp.x}, ${sp.y}) scale(${s})`}>
              <circle cx="0" cy="0" r={sp.r} fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
            </g>
          );
        })}
        {/* Green Check Pill "Tạm dịu!" */}
        <g transform="translate(0, 170)">
          <rect x="-126" y="-32" width="252" height="64" rx="32" fill="#ECFDF5" stroke="#10B981" strokeWidth="4.5" />
          <circle cx="-86" cy="0" r="19" fill="#10B981" />
          <path d="M -94 1 L -88 7 L -76 -7" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="16" y="9" textAnchor="middle" fill="#065F46" fontSize="27" fontWeight="900">
            Tạm dịu!
          </text>
        </g>
      </g>

      {/* Right Explanatory Box */}
      <g transform="translate(1135, 290)">
        <rect x="0" y="0" width="540" height="340" rx="28" fill="#FEFCE8" stroke="#EAB308" strokeWidth="4.5" />
        <circle cx="270" cy="96" r="52" fill="#FEF08A" stroke="#CA8A04" strokeWidth="4" />
        <text x="270" y="106" textAnchor="middle" fill="#854D0E" fontSize="24" fontWeight="900">
          Dopamin
        </text>
        <text x="270" y="206" textAnchor="middle" fill="#854D0E" fontSize="28" fontWeight="900">
          Cảm giác &quot;đã ngứa&quot; tức thì
        </text>
        <text x="270" y="252" textAnchor="middle" fill="#475569" fontSize="22" fontWeight="700">
          Chất thưởng nhẹ khiến ta càng
        </text>
        <text x="270" y="286" textAnchor="middle" fill="#475569" fontSize="22" fontWeight="700">
          nghiện cảm giác gãi thêm lần nữa!
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_08: MUOI_DOUBLE_BACKFIRE (Beats 28–30, steps 0, 1, 2)
 *   - Step 0: Clean 2-card split: Left "1. Phản ứng tại da" | Right "2. Phản ứng từ não".
 *   - Step 1: Left card activates: extra Mast cells rupture, 2x dense Histamin, wider red swelling.
 *   - Step 2: Right card activates: Brain lights up preparing descending teal Serotonin wave!
 * ========================================================================== */
export const MuoiDoubleBackfireVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const leftActive = activeStep === 0 || activeStep === 1;
  const rightActive = activeStep === 0 || activeStep === 2;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <MuoiStageCardBackdrop tone="ROSE" gradId="mg8_bg" showMainCard={false} />

      <MuoiCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Vừa dừng tay: 2 phản ứng phản chủ cùng lúc bùng lên!'
            : activeStep === 1
              ? '1. Tại da: Lực gãi làm vỡ thêm dưỡng bào → Xả Histamin x2'
              : '2. Từ não: Chuẩn bị bơm chất dẫn truyền xuống tủy sống!'
        }
        bg="#FFFFFF"
        color="#991B1B"
        border="#DC2626"
        fontSize={30}
      />

      {/* LEFT CARD: 1. Phản ứng tại da */}
      <g transform="translate(150, 168)" opacity={leftActive ? 1 : 0.45}>
        <GroundShadow cx={380} cy={622} rx={360} ry={12} />
        <rect
          x="0"
          y="0"
          width="760"
          height="602"
          rx="32"
          fill="#FFFFFF"
          stroke={activeStep === 1 ? '#DC2626' : '#F97316'}
          strokeWidth={activeStep === 1 ? '6.5' : '4.5'}
        />
        <rect x="44" y="34" width="672" height="58" rx="18" fill="#FEE2E2" stroke="#DC2626" strokeWidth="3" />
        <text x="380" y="72" textAnchor="middle" fill="#991B1B" fontSize="27" fontWeight="900">
          1. Phản ứng tại da
        </text>

        {/* Mini swollen skin cutaway + 2x Mast rupture */}
        <path
          d="M 60 325 Q 240 325 305 268 Q 380 218 455 268 Q 520 325 700 325 L 700 475 L 60 475 Z"
          fill="#FED7AA"
          stroke={INK}
          strokeWidth="3.8"
        />
        <ellipse cx="380" cy="296" rx={activeStep === 1 ? 150 : 95} ry={activeStep === 1 ? 46 : 28} fill="#EF4444" opacity="0.55" />
        {/* Bursting Mast Cells + Dense Red Histamin Dots */}
        {[220, 380, 540].map((mx, i) => (
          <g key={i} transform={`translate(${mx}, 405)`}>
            <circle cx="0" cy="0" r="30" fill="#F97316" stroke={INK} strokeWidth="3.2" strokeDasharray={activeStep === 1 ? '9 5' : undefined} />
            <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900">
              Mast
            </text>
          </g>
        ))}
        {(activeStep === 1 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 1, 2, 3]).map((hi) => {
          const hx = 160 + ((hi * 49 + Math.sin(frame * 0.1 + hi) * 10) % 440);
          const hy = 328 + ((hi * 31) % 95);
          return <circle key={hi} cx={hx} cy={hy} r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />;
        })}

        <text x="380" y="532" textAnchor="middle" fill="#991B1B" fontSize="24" fontWeight="800">
          {activeStep === 1 ? 'Histamin tăng dày gấp đôi, nốt sưng lan rộng!' : 'Tế bào Mast quanh vết đốt dễ bị vỡ thêm'}
        </text>
      </g>

      {/* RIGHT CARD: 2. Phản ứng từ não */}
      <g transform="translate(1010, 168)" opacity={rightActive ? 1 : 0.45}>
        <GroundShadow cx={380} cy={622} rx={360} ry={12} />
        <rect
          x="0"
          y="0"
          width="760"
          height="602"
          rx="32"
          fill="#FFFFFF"
          stroke={activeStep === 2 ? '#0D9488' : '#0284C7'}
          strokeWidth={activeStep === 2 ? '6.5' : '4.5'}
        />
        <rect x="44" y="34" width="672" height="58" rx="18" fill="#CCFBF1" stroke="#0D9488" strokeWidth="3" />
        <text x="380" y="72" textAnchor="middle" fill="#0F766E" fontSize="27" fontWeight="900">
          2. Phản ứng từ não bộ
        </text>

        <MuoiBrainEmblem
          x={380}
          y={245}
          scale={1.25}
          glowColor="#14B8A6"
          glowOpacity={activeStep === 2 ? 0.36 : 0.12}
        />

        {/* Teal Signal Arrow Descending from Brain to Spine */}
        <path
          d="M 380 355 L 380 468"
          fill="none"
          stroke="#0D9488"
          strokeWidth={activeStep === 2 ? '12' : '7'}
          strokeLinecap="round"
          strokeDasharray="16 12"
          strokeDashoffset={-(frame * 4)}
        />
        <polygon points="380,485 362,458 398,458" fill="#0D9488" />
        {activeStep === 2 && (
          <g transform="translate(530, 412)">
            <rect x="-112" y="-26" width="224" height="52" rx="16" fill="#CCFBF1" stroke="#0D9488" strokeWidth="3.5" />
            <text x="0" y="8" textAnchor="middle" fill="#0F766E" fontSize="22" fontWeight="900">
              Chất thủ phạm?
            </text>
          </g>
        )}

        <text x="380" y="532" textAnchor="middle" fill="#0F766E" fontSize="24" fontWeight="800">
          {activeStep === 2 ? 'Não bơm tín hiệu xanh ngọc xuống tủy sống!' : 'Phản xạ giảm đau ngược chiều từ não'}
        </text>
      </g>
    </svg>
  );
};
