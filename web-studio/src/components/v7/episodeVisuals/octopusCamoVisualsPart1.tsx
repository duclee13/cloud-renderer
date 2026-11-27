import React from 'react';
import { Easing, interpolate } from 'remotion';
import type { EpisodeVisualProps } from './index';
import { CuteOctopus, isAnimalBlinking } from '../../AnimalSpriteKit';
import {
  INK,
  FONT,
  mixHexColor,
  OctoCleanLabel,
  OctoContrastBadge,
  OctoStageCardBackdrop,
  OctoCheckCircle,
} from './octopusCamoSharedAssets';

/* ============================================================================
 * SVG_01: OCTO_SPEED_VS_CHAMELEON (Beats 6–7, steps 0, 1)
 *   - Step 0: Left Chameleon card (several seconds to tens of seconds, hormone) vs Right CuteOctopus V23.5
 *   - Step 1: Stopwatch lights up "~0,2 – 0,3 giây!" (nerve-to-skin speed) + smooth coral->teal color shift
 * ========================================================================== */
export const OctoSpeedVsChameleonVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const shiftT =
    activeStep === 1
      ? interpolate(frame, [4, 22], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        })
      : 0;
  const octoColors = {
    main: mixHexColor('#FB923C', '#14B8A6', shiftT),
    belly: mixHexColor('#FFEDD5', '#CCFBF1', shiftT),
    spot: mixHexColor('#EA580C', '#0F766E', shiftT),
  };
  const chamBlink = isAnimalBlinking(frame, 33);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="OCEAN" gradId="octo01_bg" cardBorder="#0284C7" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'So kè tốc độ đổi màu: Tắc kè hoa hay Bạch tuộc nhanh hơn?'
            : 'Bạch tuộc chỉ mất ~0,2 giây nhờ dây thần kinh nối thẳng tới da!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {/* Left Card: Chameleon (Slow Hormone Control) */}
      <g transform="translate(185, 200)">
        <rect x={0} y={0} width={700} height={536} rx={28} fill="#FFFBEB" stroke="#D97706" strokeWidth={4} />
        <text x={350} y={54} textAnchor="middle" fill="#92400E" fontSize={28} fontWeight={900}>
          Tắc kè hoa (Chameleon)
        </text>

        {/* Cute Friendly Cartoon Chameleon on Branch */}
        <g transform="translate(350, 265)" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={0} cy={-16} r={126} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={3.2} />
          {/* Wooden branch */}
          <path d="M -112,56 Q 0,44 114,52" fill="none" stroke="#92400E" strokeWidth={12} />
          {/* Curled spiral tail */}
          <path
            d="M -52,20 C -88,24 -94,66 -68,72 C -50,76 -46,56 -60,52"
            fill="none"
            stroke="#16A34A"
            strokeWidth={13}
          />
          {/* Rounded chameleon body */}
          <path
            d="M -60,26 C -64,-34 10,-54 58,-18 C 72,-6 66,30 34,34 L -36,34 C -54,34 -60,30 -60,26 Z"
            fill="#4ADE80"
          />
          <ellipse cx={4} cy={14} rx={36} ry={14} fill="#FEF08A" stroke="none" />
          {/* Legs clutching branch */}
          <path d="M -28,32 L -32,52 M 30,32 L 34,50" stroke="#15803D" strokeWidth={8} />
          {/* Head crest + cute sparkling eye */}
          <path d="M 42,-26 L 60,-52 L 76,-20 Z" fill="#22C55E" />
          <circle cx={68} cy={-6} r={28} fill="#4ADE80" />
          <ellipse cx={72} cy={4} rx={7} ry={4} fill="#FDA4AF" opacity={0.45} stroke="none" />
          {chamBlink ? (
            <path d="M 62,-8 Q 70,-4 78,-8" fill="none" stroke={INK} strokeWidth={3.2} />
          ) : (
            <g stroke="none">
              <circle cx={70} cy={-10} r={9.5} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
              <circle cx={72} cy={-10} r={5} fill="#0F172A" />
              <circle cx={70.5} cy={-11.5} r={1.8} fill="#FFFFFF" />
            </g>
          )}
          <path d="M 66,10 Q 76,16 86,10" fill="none" strokeWidth={2.8} />
        </g>

        <OctoContrastBadge
          x={350}
          y={434}
          w={520}
          h={50}
          text="⏱  Vài giây – vài chục giây"
          variant="softAmber"
          fontSize={22}
        />
        <text x={350} y={498} textAnchor="middle" fill="#64748B" fontSize={20} fontWeight={800}>
          Cơ chế: Tín hiệu hoóc-môn lan truyền chậm
        </text>
      </g>

      {/* Center VS Circle */}
      <g transform="translate(960, 468)">
        <circle cx={0} cy={0} r={44} fill="#FEF08A" stroke={INK} strokeWidth={4} />
        <text x={0} y={10} textAnchor="middle" fill={INK} fontSize={28} fontWeight={900}>
          VS
        </text>
      </g>

      {/* Right Card: CuteOctopus V23.5 (Ultra-Fast Nerve Control) */}
      <g transform="translate(1035, 200)">
        <rect
          x={0}
          y={0}
          width={700}
          height={536}
          rx={28}
          fill={activeStep === 1 ? '#ECFDF5' : '#F0F9FF'}
          stroke={activeStep === 1 ? '#15803D' : '#0284C7'}
          strokeWidth={activeStep === 1 ? 5 : 4}
        />
        <text x={350} y={54} textAnchor="middle" fill={activeStep === 1 ? '#14532D' : '#0369A1'} fontSize={28} fontWeight={900}>
          Bạch tuộc (Octopus)
        </text>

        <g transform="translate(350, 265)">
          <circle
            cx={0}
            cy={-16}
            r={126}
            fill={activeStep === 1 ? '#DCFCE7' : '#E0F2FE'}
            stroke={activeStep === 1 ? '#22C55E' : '#38BDF8'}
            strokeWidth={3.5}
          />
          <CuteOctopus
            x={0}
            y={52}
            scale={1.18}
            frame={frame}
            pose="float"
            emotion={activeStep === 1 ? 'proud' : 'happy'}
            colorOverride={octoColors}
          />
          {/* Bright Stopwatch Emblem in Step 1 */}
          {activeStep === 1 && (
            <g transform="translate(166, -96)">
              <rect x={-12} y={-48} width={24} height={10} rx={4} fill="#15803D" stroke={INK} strokeWidth={2.4} />
              <circle cx={0} cy={0} r={38} fill="#FFFFFF" stroke="#15803D" strokeWidth={4.5} />
              <line x1={0} y1={0} x2={16} y2={-18} stroke="#EA580C" strokeWidth={4.5} strokeLinecap="round" />
              <circle cx={0} cy={0} r={4.5} fill={INK} />
            </g>
          )}
        </g>

        <OctoContrastBadge
          x={350}
          y={434}
          w={540}
          h={52}
          text={activeStep === 1 ? '⚡  ~0,2 – 0,3 giây! (Nhanh gấp hàng chục lần)' : '⚡  Sẵn sàng kích hoạt đổi màu tức thì'}
          variant={activeStep === 1 ? 'solidGreen' : 'solidBlue'}
          fontSize={activeStep === 1 ? 21 : 21}
        />
        <text x={350} y={498} textAnchor="middle" fill={activeStep === 1 ? '#15803D' : '#334155'} fontSize={20} fontWeight={800}>
          {activeStep === 1
            ? 'Điều khiển trực tiếp bằng xung thần kinh nối thẳng tới da!'
            : 'Mạng lưới thần kinh siêu tốc phủ khắp bề mặt cơ thể'}
        </text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_02: OCTO_SKIN_PIXELS (Beats 8–9, steps 0, 1)
 *   - Step 0: Microscopic skin matrix via SVG <pattern> (yellow/red/brown chromatophore pixels)
 *   - Step 1: Zoomed 1 elastic chromatophore sac with radial muscles expanding on nerve pulse
 * ========================================================================== */
const SkinPixelMatrixStatic: React.FC = React.memo(() => (
  <g id="octo02-pixel-matrix-static">
    <defs>
      <pattern id="octo02_chroma_grid_pat" x="0" y="0" width="96" height="96" patternUnits="userSpaceOnUse">
        <circle cx="24" cy="24" r="14" fill="#FACC15" stroke="#B45309" strokeWidth="2.5" />
        <circle cx="72" cy="24" r="16" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
        <circle cx="24" cy="72" r="15" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
        <circle cx="72" cy="72" r="13" fill="#F97316" stroke="#9A3412" strokeWidth="2.5" />
      </pattern>
    </defs>
    <rect x={0} y={0} width={680} height={410} rx={24} fill="#FFF7ED" stroke="#EA580C" strokeWidth={4} />
    <rect x={24} y={24} width={632} height={362} rx={16} fill="url(#octo02_chroma_grid_pat)" />
  </g>
));
SkinPixelMatrixStatic.displayName = 'SkinPixelMatrixStatic';

export const OctoSkinPixelsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const expandT =
    activeStep === 1
      ? interpolate(frame, [6, 36], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        })
      : 0.25;
  const sacR = 26 + expandT * 68;
  const signalX = interpolate(frame, [0, 24], [-255, -108], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="CORAL" gradId="octo02_bg" cardBorder="#EA580C" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Phóng đại dưới kính hiển vi: Da bạch tuộc là màn hình triệu điểm ảnh!'
            : 'Mỗi điểm ảnh là 1 túi sắc tố đàn hồi co giãn theo xung thần kinh!'
        }
        bg="#FFFFFF"
        color="#9A3412"
        border="#EA580C"
        fontSize={29}
      />

      {/* Left: Microscopic Chromatophore Pixel Matrix (<pattern>!) */}
      <g transform="translate(185, 212)">
        <SkinPixelMatrixStatic />
        <OctoContrastBadge
          x={340}
          y={456}
          w={580}
          h={50}
          text="Hàng triệu điểm ảnh sống: Vàng • Đỏ • Nâu"
          variant="softAmber"
          fontSize={21}
        />
      </g>

      {/* Center Zoom Connector Arrow */}
      <g transform="translate(918, 416)">
        <polygon points="-28,-16 8,-16 8,-34 38,0 8,34 8,16 -28,16" fill="#0284C7" stroke={INK} strokeWidth={3} />
      </g>

      {/* Right: Zoomed Single Elastic Chromatophore Sac + 8 Radial Muscles */}
      <g transform="translate(985, 212)">
        <rect x={0} y={0} width={750} height={492} rx={28} fill="#F8FAFC" stroke={activeStep === 1 ? '#0284C7' : '#CBD5E1'} strokeWidth={4} />
        <text x={375} y={48} textAnchor="middle" fill="#0369A1" fontSize={24} fontWeight={900}>
          {activeStep === 0 ? 'Phóng to 1 túi sắc tố (Trạng thái thu gọn)' : 'Cơ vòng kéo căng túi sắc tố khi nhận xung não'}
        </text>

        <g transform="translate(390, 246)">
          {/* Nerve Wire Entering from Left */}
          <path d="M -280,0 L -115,0" fill="none" stroke="#0EA5E9" strokeWidth={8} strokeLinecap="round" />
          <text x={-215} y={-22} textAnchor="middle" fill="#0369A1" fontSize={18} fontWeight={900}>
            Xung thần kinh
          </text>
          {activeStep === 1 && (
            <circle cx={signalX} cy={0} r={11} fill="#FACC15" stroke="#EA580C" strokeWidth={3.5} />
          )}

          {/* 8 Radial Muscle Fibers Pulling Outward */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = Math.cos(rad) * (sacR - 4);
            const y1 = Math.sin(rad) * (sacR - 4);
            const x2 = Math.cos(rad) * 140;
            const y2 = Math.sin(rad) * 140;
            return (
              <g key={deg}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FB7185" strokeWidth={11} strokeLinecap="round" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FDA4AF" strokeWidth={4.5} strokeLinecap="round" />
                <circle cx={x2} cy={y2} r={7} fill="#BE123C" />
              </g>
            );
          })}

          {/* Elastic Pigment Sac Expanding Smoothly */}
          <circle
            cx={0}
            cy={0}
            r={sacR}
            fill={activeStep === 1 ? '#EF4444' : '#F97316'}
            stroke={INK}
            strokeWidth={4.5}
          />
          <circle cx={-sacR * 0.25} cy={-sacR * 0.25} r={sacR * 0.28} fill="#FEF08A" opacity={0.45} stroke="none" />
        </g>

        <OctoContrastBadge
          x={375}
          y={440}
          w={630}
          h={48}
          text={
            activeStep === 1
              ? 'Sợi cơ co kéo → Túi màu bung rộng rực rỡ tức thì!'
              : 'Thả lỏng cơ → Túi sắc tố co nhỏ như hạt bụi'
          }
          variant={activeStep === 1 ? 'solidBlue' : 'softBlue'}
          fontSize={20}
        />
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_03: OCTO_3_SKIN_LAYERS (Beats 11–12, steps 0, 1)
 *   - Step 0: Clean 3-tier cutaway skin cross-section (1. Túi sắc tố, 2. Tế bào phản quang, 3. Phản xạ trắng)
 *   - Step 1: Light rays bouncing cyan-emerald off Layer 2 & ocean ambient tint off Layer 3 white mirror
 * ========================================================================== */
const Skin3LayersStaticCore: React.FC = React.memo(() => (
  <g id="octo03-3layers-static" stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
    {/* Layer 1: Chromatophores (Top, y=0..115) */}
    <rect x={0} y={0} width={760} height={115} rx={20} fill="#FEF3C7" stroke="#D97706" strokeWidth={4} />
    {[95, 225, 365, 505, 645].map((cx, i) => (
      <circle
        key={i}
        cx={cx}
        cy={58}
        r={24}
        fill={i % 3 === 0 ? '#FACC15' : i % 3 === 1 ? '#EF4444' : '#92400E'}
        stroke={INK}
        strokeWidth={3}
      />
    ))}

    {/* Layer 2: Iridophores (Middle, y=135..250) */}
    <rect x={0} y={135} width={760} height={115} rx={20} fill="#CCFBF1" stroke="#0D9488" strokeWidth={4} />
    {[85, 200, 315, 430, 545, 660].map((cx, i) => (
      <g key={i} transform={`translate(${cx}, 192)`}>
        <polygon points="-38,0 0,-22 38,0 0,22" fill={i % 2 === 0 ? '#06B6D4' : '#10B981'} stroke="#0F766E" strokeWidth={2.6} />
        <line x1={-18} y1={-4} x2={18} y2={-4} stroke="#FFFFFF" strokeWidth={3} opacity={0.85} />
      </g>
    ))}

    {/* Layer 3: Leucophores White Mirror (Bottom, y=270..385) */}
    <rect x={0} y={270} width={760} height={115} rx={20} fill="#F8FAFC" stroke="#64748B" strokeWidth={4} />
    <rect x={26} y={292} width={708} height={70} rx={14} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={3} />
    <line x1={56} y1={328} x2={704} y2={328} stroke="#BAE6FD" strokeWidth={6} strokeDasharray="24 16" strokeLinecap="round" />
  </g>
));
Skin3LayersStaticCore.displayName = 'Skin3LayersStaticCore';

export const Octo3SkinLayersVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const shimmer = 0.72 + 0.28 * Math.sin(frame * 0.22);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="MINT" gradId="octo03_bg" cardBorder="#0D9488" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Cấu trúc xưởng pha màu 3 tầng dưới làn da bạch tuộc'
            : 'Tầng phản quang bật ánh xanh ngọc • Tầng đáy làm gương nền trắng!'
        }
        bg="#FFFFFF"
        color="#0F766E"
        border="#0D9488"
        fontSize={29}
      />

      {/* Left: 3-Layer Cutaway Cross-Section */}
      <g transform="translate(185, 290)">
        <Skin3LayersStaticCore />

        {/* Animated Sunlight Rays Bouncing Off Layer 2 & Layer 3 in Step 1 */}
        {activeStep === 1 && (
          <g id="octo03-light-rays" strokeLinecap="round" strokeLinejoin="round">
            {/* Ray 1: Enters top -> hits Layer 2 -> bounces shimmering teal-cyan upward */}
            <path d="M 190,-82 L 265,172" fill="none" stroke="#FACC15" strokeWidth={7} />
            <path d="M 265,172 L 348,-76" fill="none" stroke="#06B6D4" strokeWidth={8} opacity={shimmer.toFixed(2)} />
            <polygon points="354,-90 334,-68 358,-62" fill="#06B6D4" />
            <rect x={286} y={-88} width={174} height={38} rx={19} fill="#06B6D4" />
            <text x={373} y={-63} textAnchor="middle" fill="#FFFFFF" fontSize={17} fontWeight={900}>
              Ánh xanh ngọc!
            </text>

            {/* Ray 2: Goes down to Layer 3 White Mirror -> reflects ambient ocean light */}
            <path d="M 520,-82 L 570,315" fill="none" stroke="#FDE047" strokeWidth={7} />
            <path d="M 570,315 L 650,-74" fill="none" stroke="#38BDF8" strokeWidth={8} opacity={shimmer.toFixed(2)} />
            <polygon points="654,-90 636,-68 660,-62" fill="#0284C7" />
            <rect x={578} y={-88} width={182} height={38} rx={19} fill="#0284C7" />
            <text x={669} y={-63} textAnchor="middle" fill="#FFFFFF" fontSize={17} fontWeight={900}>
              Màu nước biển!
            </text>
          </g>
        )}
      </g>

      {/* Right Column: 3 Crisp Layer Explanation Cards aligned directly beside each layer */}
      <g transform="translate(990, 290)">
        {/* Card 1 */}
        <rect x={0} y={0} width={745} height={115} rx={20} fill="#FFFBEB" stroke="#D97706" strokeWidth={3.5} />
        <circle cx={56} cy={57} r={30} fill="#F59E0B" />
        <text x={56} y={66} textAnchor="middle" fill="#FFFFFF" fontSize={26} fontWeight={900}>1</text>
        <text x={110} y={48} fill="#92400E" fontSize={24} fontWeight={900}>Tầng 1: Túi sắc tố</text>
        <text x={110} y={84} fill="#334155" fontSize={19.5} fontWeight={700}>Chứa hạt màu vàng, đỏ, nâu — mở rộng &amp; thu gọn siêu tốc</text>

        {/* Card 2 */}
        <rect
          x={0}
          y={135}
          width={745}
          height={115}
          rx={20}
          fill={activeStep === 1 ? '#CCFBF1' : '#F0FDFA'}
          stroke="#0D9488"
          strokeWidth={activeStep === 1 ? 4.5 : 3.5}
        />
        <circle cx={56} cy={192} r={30} fill="#0D9488" />
        <text x={56} y={201} textAnchor="middle" fill="#FFFFFF" fontSize={26} fontWeight={900}>2</text>
        <text x={110} y={183} fill="#0F766E" fontSize={24} fontWeight={900}>Tầng 2: Tế bào phản quang</text>
        <text x={110} y={219} fill="#334155" fontSize={19.5} fontWeight={700}>Phản xạ quang học tạo ánh xanh lam, xanh ngọc lấp lánh</text>

        {/* Card 3 */}
        <rect
          x={0}
          y={270}
          width={745}
          height={115}
          rx={20}
          fill={activeStep === 1 ? '#E0F2FE' : '#F8FAFC'}
          stroke={activeStep === 1 ? '#0284C7' : '#64748B'}
          strokeWidth={activeStep === 1 ? 4.5 : 3.5}
        />
        <circle cx={56} cy={327} r={30} fill="#0284C7" />
        <text x={56} y={336} textAnchor="middle" fill="#FFFFFF" fontSize={26} fontWeight={900}>3</text>
        <text x={110} y={318} fill="#0369A1" fontSize={24} fontWeight={900}>Tầng 3: Tế bào phản xạ trắng</text>
        <text x={110} y={354} fill="#334155" fontSize={19.5} fontWeight={700}>Tấm gương nền phản chiếu đúng màu ánh sáng xung quanh</text>
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_04: OCTO_3D_PAPILLAE (Beats 13–14, steps 0, 1)
 *   - Step 0: Flat smooth skin ("Dễ lộ dáng") vs Morphing skin beside coral rock
 *   - Step 1: Muscular papillae smoothly inflate into 3D spikes & ridges matching coral rock
 * ========================================================================== */
export const Octo3dPapillaeVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const bumpT =
    activeStep === 1
      ? interpolate(frame, [4, 34], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        })
      : 0;
  const peakH = bumpT * 78;
  const skinColor = mixHexColor('#FB923C', '#64748B', bumpT);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="CREAM" gradId="octo04_bg" cardBorder="#D97706" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Chỉ đổi màu phẳng thì chưa đủ — Bạch tuộc biến hình cả không gian 3D!'
            : 'Hàng nghìn nhú da cơ bắp tự phồng gai khớp hệt rạn san hô & đá sần!'
        }
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={29}
      />

      {/* Left Card: Flat 2D Skin (Easily Spotted) */}
      <g transform="translate(185, 200)">
        <rect x={0} y={0} width={670} height={536} rx={28} fill="#FEF2F2" stroke="#DC2626" strokeWidth={4} />
        <text x={335} y={52} textAnchor="middle" fill="#991B1B" fontSize={26} fontWeight={900}>
          Mặt da phẳng lì (Chỉ đổi màu 2D)
        </text>
        <g transform="translate(335, 316)">
          {/* Smooth flat silhouette sitting awkwardly next to jagged rock */}
          <path d="M -255,48 L 255,48" stroke="#94A3B8" strokeWidth={5} strokeLinecap="round" />
          <path d="M -230,48 C -220,-54 220,-54 230,48 Z" fill="#94A3B8" stroke={INK} strokeWidth={4.5} />
          <line x1={-160} y1={-46} x2={160} y2={-46} stroke="#DC2626" strokeWidth={4} strokeDasharray="10 8" />
          <text x={0} y={-72} textAnchor="middle" fill="#DC2626" fontSize={21} fontWeight={900}>
            Đường viền trơn nhẵn quá rõ!
          </text>
        </g>
        <OctoContrastBadge x={335} y={464} w={480} h={52} text="✕  Dễ lộ dáng trước cá mập tinh mắt!" variant="solidRed" fontSize={21} />
      </g>

      {/* Right Card: 3D Muscular Papillae Sculpting */}
      <g transform="translate(890, 200)">
        <rect
          x={0}
          y={0}
          width={845}
          height={536}
          rx={28}
          fill={activeStep === 1 ? '#ECFDF5' : '#FFFBEB'}
          stroke={activeStep === 1 ? '#15803D' : '#D97706'}
          strokeWidth={4.5}
        />
        <text x={422} y={52} textAnchor="middle" fill={activeStep === 1 ? '#14532D' : '#92400E'} fontSize={26} fontWeight={900}>
          {activeStep === 1 ? 'Da bạch tuộc bật nhú 3D khớp rạn san hô' : 'Cơ bắp dưới da chuẩn bị tạo hình 3D'}
        </text>

        <g transform="translate(422, 320)" stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
          {/* Seafloor baseline */}
          <line x1={-360} y1={52} x2={360} y2={52} stroke="#94A3B8" strokeWidth={5} />

          {/* Left side: Octopus Skin Patch morphing from flat to jagged 3D papillae */}
          <path
            d={`M -325,52 L -325,-12 Q -280,${(-18 - peakH * 0.9).toFixed(1)} -235,-12 Q -185,${(-22 - peakH * 1.15).toFixed(1)} -135,-12 Q -85,${(-18 - peakH * 0.85).toFixed(1)} -35,-12 L -35,52 Z`}
            fill={skinColor}
          />
          {/* Upward expansion arrows inside skin during Step 1 */}
          {activeStep === 1 && (
            <g stroke="#15803D" strokeWidth={4.5} fill="none">
              <path d="M -280,26 L -280,-34 M -290,-22 L -280,-36 L -270,-22" />
              <path d="M -185,26 L -185,-52 M -195,-40 L -185,-54 L -175,-40" />
              <path d="M -85,26 L -85,-32 M -95,-20 L -85,-34 L -75,-20" />
            </g>
          )}

          {/* Right side: Neighboring Jagged Coral Rock Reference */}
          <path
            d="M 45,52 L 55,-14 Q 105,-88 155,-14 Q 208,-112 260,-14 Q 305,-80 340,52 Z"
            fill="#64748B"
          />
          <ellipse cx={165} cy={-26} rx={32} ry={12} fill="#16A34A" opacity={0.55} stroke="none" />
          <ellipse cx={268} cy={4} rx={26} ry={10} fill="#15803D" opacity={0.55} stroke="none" />
          <text x={196} y={-114} textAnchor="middle" fill="#475569" fontSize={20} fontWeight={900} stroke="none">
            Tảng đá san hô bên cạnh
          </text>
          <text x={-180} y={-114} textAnchor="middle" fill={activeStep === 1 ? '#15803D' : '#B45309'} fontSize={20} fontWeight={900} stroke="none">
            Da bạch tuộc
          </text>
        </g>

        <OctoContrastBadge
          x={422}
          y={464}
          w={620}
          h={52}
          text={activeStep === 1 ? '✓  Nhú da 3D biến đổi kết cấu — Tàng hình tuyệt đối!' : 'Hàng nghìn nhú cơ sẵn sàng phồng gai sau vài giây'}
          variant={activeStep === 1 ? 'solidGreen' : 'softAmber'}
          fontSize={21}
        />
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_05: OCTO_BRAIN_TO_SKIN (Beats 15–16, steps 0, 1)
 *   - Step 0: Glowing cyan neural network radiating from central brain down all 8 tentacles
 *   - Step 1: Split-scene octopus straddling golden sand (left) & mossy rocky reef (right)
 * ========================================================================== */
export const OctoBrainToSkinVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const pulse = 0.65 + 0.35 * Math.sin(frame * 0.22);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="OCEAN" gradId="octo05_bg" cardBorder="#0284C7" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Mạng thần kinh siêu đặc biệt: 2/3 nơ-ron nằm dọc 8 chiếc xúc tu!'
            : 'Phối cảnh tự động: Nửa thân giả cát mịn, nửa kia giả đá phủ rêu xanh!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Left Dark Bio-Scan Panel */}
          <g transform="translate(185, 200)">
            <rect x={0} y={0} width={960} height={536} rx={28} fill="#0F172A" stroke="#38BDF8" strokeWidth={5} />
            <text x={480} y={50} textAnchor="middle" fill="#7DD3FC" fontSize={23} fontWeight={900}>
              MÔ PHỎNG HỆ THẦN KINH PHÂN TÁN CỦA BẠCH TUỘC
            </text>

            {/* Glowing Bio-Diagram Octopus with 8 Tentacle Nerve Cords */}
            <g transform="translate(480, 310)">
              {/* Translucent Octopus Body Outline */}
              <ellipse cx={0} cy={-86} rx={86} ry={78} fill="#0284C7" opacity={0.28} stroke="#38BDF8" strokeWidth={4} />
              {/* 8 Spreading Tentacles with glowing inner cyan nerve cords */}
              {[-185, -135, -82, -28, 28, 82, 135, 185].map((tx, i) => {
                const bx = -64 + i * 18.2;
                const endY = 128 + (i % 2 === 0 ? 12 : -6);
                return (
                  <g key={i}>
                    <path
                      d={`M ${bx},-20 C ${bx * 1.4},42 ${tx * 0.8},92 ${tx},${endY}`}
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth={22}
                      strokeLinecap="round"
                      opacity={0.38}
                    />
                    <path
                      d={`M ${bx},-20 C ${bx * 1.4},42 ${tx * 0.8},92 ${tx},${endY}`}
                      fill="none"
                      stroke="#2DD4BF"
                      strokeWidth={5.5}
                      strokeLinecap="round"
                      opacity={pulse.toFixed(2)}
                    />
                    <circle cx={tx * 0.72} cy={78} r={7} fill="#5EEAD4" />
                    <circle cx={tx} cy={endY} r={6} fill="#99F6E4" />
                  </g>
                );
              })}

              {/* Central Brain Ring */}
              <circle cx={0} cy={-94} r={34} fill="#14B8A6" stroke="#FFFFFF" strokeWidth={3.5} opacity={pulse.toFixed(2)} />
              <text x={0} y={-88} textAnchor="middle" fill="#0F172A" fontSize={18} fontWeight={900}>
                Não
              </text>
            </g>
          </g>

          {/* Right Key Fact Cards */}
          <g transform="translate(1180, 200)">
            <rect x={0} y={0} width={555} height={252} rx={24} fill="#F0FDFA" stroke="#0D9488" strokeWidth={4} />
            <text x={277} y={76} textAnchor="middle" fill="#0F766E" fontSize={54} fontWeight={900}>
              2/3
            </text>
            <text x={277} y={132} textAnchor="middle" fill="#0F172A" fontSize={24} fontWeight={900}>
              tế bào thần kinh nằm dọc 8 xúc tu
            </text>
            <text x={277} y={174} textAnchor="middle" fill="#334155" fontSize={19.5} fontWeight={700}>
              Mỗi cánh tay như 1 “bộ não mini” tự chủ
            </text>
            <OctoContrastBadge x={277} y={218} w={420} h={42} text="Phản ứng da cục bộ tức thì!" variant="solidTeal" fontSize={19} />

            <rect x={0} y={284} width={555} height={252} rx={24} fill="#EFF6FF" stroke="#0284C7" strokeWidth={4} />
            <text x={277} y={356} textAnchor="middle" fill="#0369A1" fontSize={26} fontWeight={900}>
              Không cần chờ lệnh xa từ não!
            </text>
            <text x={277} y={404} textAnchor="middle" fill="#334155" fontSize={20} fontWeight={700}>
              Từng vùng da tự chỉnh màu &amp; độ sần
            </text>
            <text x={277} y={442} textAnchor="middle" fill="#334155" fontSize={20} fontWeight={700}>
              theo đúng nền vật thể ngay dưới xúc tu
            </text>
            <OctoContrastBadge x={277} y={494} w={410} h={42} text="Độ trễ gần như bằng 0!" variant="solidBlue" fontSize={19} />
          </g>
        </g>
      ) : (
        <g>
          {/* Step 1: Split-Habitat Canvas (Left Golden Sand | Right Mossy Reef Rock) */}
          <g transform="translate(185, 200)">
            <defs>
              <clipPath id="octo05_left_clip">
                <rect x={0} y={0} width={775} height={536} rx={28} />
              </clipPath>
              <clipPath id="octo05_right_clip">
                <rect x={775} y={0} width={775} height={536} rx={28} />
              </clipPath>
            </defs>

            {/* Left Half Background: Smooth Golden Sand */}
            <rect x={0} y={0} width={775} height={536} rx={24} fill="#FEF3C7" stroke="#D97706" strokeWidth={4} />
            <circle cx={190} cy={380} r={10} fill="#F59E0B" opacity={0.32} />
            <circle cx={420} cy={420} r={14} fill="#D97706" opacity={0.25} />
            <circle cx={610} cy={220} r={11} fill="#F59E0B" opacity={0.3} />

            {/* Right Half Background: Mossy Textured Reef Rock */}
            <rect x={775} y={0} width={775} height={536} rx={24} fill="#CBD5E1" stroke="#475569" strokeWidth={4} />
            <ellipse cx={1160} cy={220} rx={120} ry={54} fill="#64748B" opacity={0.36} />
            <ellipse cx={1360} cy={390} rx={110} ry={48} fill="#16A34A" opacity={0.28} />
            <ellipse cx={980} cy={410} rx={84} ry={34} fill="#15803D" opacity={0.25} />

            {/* Crisp Vertical Boundary Line */}
            <line x1={775} y1={18} x2={775} y2={518} stroke="#0F172A" strokeWidth={4} strokeDasharray="12 10" />

            {/* Split-Camouflaged CuteOctopus right on the center boundary (x=775)! */}
            <g clipPath="url(#octo05_left_clip)">
              <CuteOctopus
                x={775}
                y={375}
                scale={1.85}
                frame={frame}
                pose="crawl"
                emotion="proud"
                colorOverride={{ main: '#FCD34D', belly: '#FEF9C3', spot: '#D97706' }}
              />
            </g>
            <g clipPath="url(#octo05_right_clip)">
              <CuteOctopus
                x={775}
                y={375}
                scale={1.85}
                frame={frame}
                pose="crawl"
                emotion="proud"
                colorOverride={{ main: '#64748B', belly: '#94A3B8', spot: '#16A34A' }}
                papillaeBumps={true}
              />
            </g>

            {/* Clean Top & Bottom Labels on Left and Right Halves */}
            <OctoContrastBadge x={385} y={64} w={420} h={48} text="Nửa trái: Giả cát vàng mịn" variant="softAmber" fontSize={22} />
            <OctoContrastBadge x={1165} y={64} w={440} h={48} text="Nửa phải: Giả đá phủ rêu 3D" variant="solidGreen" fontSize={22} />
            <OctoContrastBadge x={775} y={474} w={760} h={52} text="✓  Chia đôi cơ thể phối 2 kiểu nền khác nhau cùng một lúc!" variant="solidBlue" fontSize={21} />
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_06: OCTO_HUMAN_VS_EYE (Beats 18–19, steps 0, 1)
 *   - Step 0: Left "Mắt người" (3 RGB color cones -> colorful coral reef)
 *   - Step 1: Right "Mắt bạch tuộc" (1 photoreceptor -> grayscale B&W coral reef + big ?)
 * ========================================================================== */
const MiniCoralReefScene: React.FC<{ grayscale: boolean }> = React.memo(({ grayscale }) => (
  <g stroke={INK} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <rect x={-230} y={-88} width={460} height={176} rx={18} fill={grayscale ? '#E2E8F0' : '#BAE6FD'} />
    <rect x={-230} y={42} width={460} height={46} rx={8} fill={grayscale ? '#CBD5E1' : '#FDE68A'} stroke="none" />
    {/* Left Coral */}
    <path d="M -165,44 C -172,-6 -196,-40 -174,-48 C -156,-54 -150,-16 -144,-44 C -130,-52 -124,-14 -128,44 Z" fill={grayscale ? '#64748B' : '#F472B6'} />
    {/* Center Kelp */}
    <path d="M -36,44 Q -52,-8 -28,-54 Q -10,-8 -18,44 Z" fill={grayscale ? '#475569' : '#22C55E'} />
    {/* Right Clownfish */}
    <ellipse cx={115} cy={-16} rx={44} ry={24} fill={grayscale ? '#94A3B8' : '#FB923C'} />
    <polygon points="72,-16 48,-36 48,4" fill={grayscale ? '#64748B' : '#EA580C'} />
    <rect x={106} y={-38} width={12} height={44} rx={4} fill="#FFFFFF" stroke="none" />
    <circle cx={140} cy={-20} r={4.5} fill={INK} stroke="none" />
  </g>
));
MiniCoralReefScene.displayName = 'MiniCoralReefScene';

export const OctoHumanVsEyeVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const qPulse = 1 + Math.sin(frame * 0.16) * 0.04;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="CREAM" gradId="octo06_bg" cardBorder="#D97706" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Mắt người thấy cầu vồng rực rỡ nhờ có 3 loại tế bào cảm nhận màu'
            : 'Mắt bạch tuộc chỉ có 1 loại cảm biến → Theo lý thuyết chỉ thấy đen trắng!'
        }
        bg="#FFFFFF"
        color="#92400E"
        border="#D97706"
        fontSize={29}
      />

      {/* Left Card: Human Eye (3 RGB Cones) */}
      <g transform="translate(185, 200)">
        <rect x={0} y={0} width={745} height={536} rx={28} fill="#F0F9FF" stroke="#0284C7" strokeWidth={4} />
        <text x={372} y={52} textAnchor="middle" fill="#0369A1" fontSize={28} fontWeight={900}>
          Mắt con người (3 cảm biến màu)
        </text>
        {/* 3 RGB Sensor Pills */}
        <g transform="translate(372, 128)">
          <circle cx={-150} cy={0} r={34} fill="#EF4444" stroke={INK} strokeWidth={3.2} />
          <text x={-150} y={7} textAnchor="middle" fill="#FFFFFF" fontSize={19} fontWeight={900}>Đỏ</text>
          <circle cx={0} cy={0} r={34} fill="#22C55E" stroke={INK} strokeWidth={3.2} />
          <text x={0} y={7} textAnchor="middle" fill="#FFFFFF" fontSize={17} fontWeight={900}>X.Lá</text>
          <circle cx={150} cy={0} r={34} fill="#3B82F6" stroke={INK} strokeWidth={3.2} />
          <text x={150} y={7} textAnchor="middle" fill="#FFFFFF" fontSize={17} fontWeight={900}>X.Dương</text>
        </g>
        {/* Vibrant Color Coral Reef View */}
        <g transform="translate(372, 314)">
          <MiniCoralReefScene grayscale={false} />
        </g>
        <OctoContrastBadge x={372} y={468} w={540} h={50} text="✓  Ghép đủ triệu sắc màu rực rỡ!" variant="solidBlue" fontSize={21} />
      </g>

      {/* Right Card: Octopus Eye (Only 1 Sensor -> Grayscale Paradox!) */}
      <g transform="translate(990, 200)" opacity={activeStep === 1 ? 1 : 0.42}>
        <rect
          x={0}
          y={0}
          width={745}
          height={536}
          rx={28}
          fill="#F8FAFC"
          stroke={activeStep === 1 ? '#D97706' : '#CBD5E1'}
          strokeWidth={activeStep === 1 ? 4.8 : 3.5}
        />
        <text x={372} y={52} textAnchor="middle" fill="#0F172A" fontSize={28} fontWeight={900}>
          Mắt bạch tuộc (Chỉ 1 cảm biến sáng)
        </text>
        {/* Single Grayscale Photoreceptor Pill */}
        <g transform="translate(372, 128)">
          <circle cx={0} cy={0} r={34} fill="#64748B" stroke={INK} strokeWidth={3.2} />
          <text x={0} y={7} textAnchor="middle" fill="#FFFFFF" fontSize={18} fontWeight={900}>1</text>
          <text x={148} y={7} textAnchor="middle" fill="#475569" fontSize={20} fontWeight={800}>
            Chỉ đo độ sáng – tối
          </text>
        </g>
        {/* Grayscale B&W Coral Reef View */}
        <g transform="translate(372, 314)">
          <MiniCoralReefScene grayscale={true} />
          {activeStep === 1 && (
            <g transform={`translate(185, -62) scale(${qPulse.toFixed(3)})`}>
              <circle cx={0} cy={0} r={36} fill="#F59E0B" stroke={INK} strokeWidth={3.8} />
              <text x={0} y={13} textAnchor="middle" fill="#FFFFFF" fontSize={42} fontWeight={900}>?</text>
            </g>
          )}
        </g>
        <OctoContrastBadge
          x={372}
          y={468}
          w={560}
          h={50}
          text={activeStep === 1 ? '⚠  Chỉ thấy đen trắng — Sao ngụy trang đúng màu?' : 'Đang kiểm tra võng mạc bạch tuộc...'}
          variant={activeStep === 1 ? 'softAmber' : 'softBlue'}
          fontSize={20}
        />
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_07: OCTO_W_PUPIL_PRISM (Beats 20–22, steps 0, 1, 2)
 *   - Step 0: Round human pupil vs Wide U/W-shaped octopus pupil (2016 discovery)
 *   - Step 1: Chromatic aberration — white light splits into Blue (near), Green (mid), Red (far) focal points
 *   - Step 2: Octopus tunes focus depth across each color -> green tick "Biến lỗi quang học thành siêu năng lực!"
 * ========================================================================== */
export const OctoWPupilPrismVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = Math.min(2, step ?? visualStep ?? 0);
  const focusShift = activeStep === 2 ? Math.sin(frame * 0.14) * 28 : 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone={activeStep === 2 ? 'FOREST' : 'OCEAN'} gradId="octo07_bg" cardBorder={activeStep === 2 ? '#15803D' : '#0284C7'} />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Khám phá chấn động năm 2016: Đồng tử chữ U / chữ W kỳ lạ của bạch tuộc!'
            : activeStep === 1
            ? 'Quang sai tán sắc: Các màu ánh sáng hội tụ ở 3 khoảng cách lệch nhau!'
            : 'Chỉnh tiêu cự đọc từng màu → Biến lỗi quang học thành máy đo màu!'
        }
        bg="#FFFFFF"
        color={activeStep === 2 ? '#14532D' : '#0369A1'}
        border={activeStep === 2 ? '#15803D' : '#0284C7'}
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Left: Human Round Pupil */}
          <g transform="translate(195, 205)">
            <rect x={0} y={0} width={680} height={526} rx={28} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={4} />
            <text x={340} y={54} textAnchor="middle" fill="#334155" fontSize={27} fontWeight={900}>
              Mắt người: Đồng tử tròn
            </text>
            <g transform="translate(340, 254)">
              <ellipse cx={0} cy={0} rx={168} ry={108} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
              <circle cx={0} cy={0} r={74} fill="#38BDF8" stroke={INK} strokeWidth={4} />
              <circle cx={0} cy={0} r={34} fill="#0F172A" />
              <circle cx={-12} cy={-12} r={10} fill="#FFFFFF" />
            </g>
            <OctoContrastBadge x={340} y={454} w={480} h={48} text="Hạn chế tối đa tán sắc ánh sáng" variant="softBlue" fontSize={20} />
          </g>

          {/* Right: Octopus U/W-Shaped Wide Pupil */}
          <g transform="translate(1045, 205)">
            <rect x={0} y={0} width={680} height={526} rx={28} fill="#FFFBEB" stroke="#EA580C" strokeWidth={4.5} />
            <text x={340} y={54} textAnchor="middle" fill="#9A3412" fontSize={27} fontWeight={900}>
              Mắt bạch tuộc: Đồng tử hình chữ U / W
            </text>
            <g transform="translate(340, 254)">
              <ellipse cx={0} cy={0} rx={174} ry={116} fill="#FDBA74" stroke={INK} strokeWidth={5} />
              <ellipse cx={0} cy={0} rx={134} ry={88} fill="#FEF3C7" stroke="#D97706" strokeWidth={4} />
              {/* Wide U/W-shaped dark pupil */}
              <path
                d="M -78,-26 C -78,52 -18,56 0,20 C 18,56 78,52 78,-26"
                fill="none"
                stroke="#0F172A"
                strokeWidth={30}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={-56} cy={-18} r={7} fill="#FFFFFF" opacity={0.85} />
            </g>
            <OctoContrastBadge x={340} y={454} w={520} h={48} text="⚡  Khe rộng lệch tâm → Phóng đại tán sắc!" variant="softAmber" fontSize={20} />
          </g>
        </g>
      ) : (
        <g>
          {/* Step 1 & Step 2: Optical Chromatic Aberration & Focus Depth Tuning Diagram */}
          <g transform="translate(185, 200)">
            <rect x={0} y={0} width={1550} height={536} rx={28} fill="#0F172A" stroke={activeStep === 2 ? '#22C55E' : '#38BDF8'} strokeWidth={5} />

            {/* White incoming beam from left */}
            <rect x={60} y={208} width={350} height={56} rx={12} fill="#FFFFFF" opacity={0.92} />
            <text x={235} y={182} textAnchor="middle" fill="#F8FAFC" fontSize={22} fontWeight={900}>
              Ánh sáng trắng đi vào
            </text>

            {/* Octopus Lens (slides slightly in Step 2 to scan focal plane!) */}
            <g transform={`translate(${(435 + focusShift).toFixed(1)}, 236)`}>
              <ellipse cx={0} cy={0} rx={36} ry={142} fill="#7DD3FC" opacity={0.85} stroke="#FFFFFF" strokeWidth={4.5} />
              <text x={0} y={-162} textAnchor="middle" fill="#BAE6FD" fontSize={20} fontWeight={900}>
                {activeStep === 2 ? 'Ống kính chỉnh tiêu cự ↔' : 'Thấu kính đồng tử chữ U'}
              </text>
            </g>

            {/* 3 Split Color Beams Converging at Distinct Depths: Blue (x=820), Green (x=1040), Red (x=1260) */}
            {/* Blue (Near) */}
            <path d="M 465,126 L 820,236 L 465,346" fill="none" stroke="#3B82F6" strokeWidth={7} strokeLinecap="round" />
            <circle cx={820} cy={236} r={14} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={3} />
            <line x1={820} y1={132} x2={820} y2={216} stroke="#93C5FD" strokeWidth={3} strokeDasharray="6 6" />
            <rect x={720} y={84} width={200} height={44} rx={22} fill="#2563EB" />
            <text x={820} y={113} textAnchor="middle" fill="#FFFFFF" fontSize={20} fontWeight={900}>Xanh dương (Gần)</text>

            {/* Green (Middle) */}
            <path d="M 465,152 L 1040,236 L 465,320" fill="none" stroke="#22C55E" strokeWidth={7} strokeLinecap="round" />
            <circle cx={1040} cy={236} r={14} fill="#22C55E" stroke="#FFFFFF" strokeWidth={3} />
            <line x1={1040} y1={256} x2={1040} y2={342} stroke="#86EFAC" strokeWidth={3} strokeDasharray="6 6" />
            <rect x={944} y={346} width={192} height={44} rx={22} fill="#16A34A" />
            <text x={1040} y={375} textAnchor="middle" fill="#FFFFFF" fontSize={20} fontWeight={900}>Xanh lá (Giữa)</text>

            {/* Red (Far) */}
            <path d="M 465,178 L 1260,236 L 465,294" fill="none" stroke="#EF4444" strokeWidth={7} strokeLinecap="round" />
            <circle cx={1260} cy={236} r={14} fill="#EF4444" stroke="#FFFFFF" strokeWidth={3} />
            <line x1={1260} y1={132} x2={1260} y2={216} stroke="#FCA5A5" strokeWidth={3} strokeDasharray="6 6" />
            <rect x={1184} y={84} width={152} height={44} rx={22} fill="#DC2626" />
            <text x={1260} y={113} textAnchor="middle" fill="#FFFFFF" fontSize={20} fontWeight={900}>Đỏ (Xa)</text>

            {/* Retina Screen on Far Right */}
            <path d="M 1375,86 Q 1425,236 1375,386" fill="none" stroke="#FACC15" strokeWidth={9} strokeLinecap="round" />
            <text x={1460} y={244} textAnchor="middle" fill="#FEF08A" fontSize={20} fontWeight={900}>Võng mạc</text>

            {/* Bottom Summary Pill inside Panel (strictly clear >= 50px below Green label y=390!) */}
            {activeStep === 2 ? (
              <g transform="translate(775, 472)">
                <rect x={-390} y={-32} width={780} height={64} rx={32} fill="#15803D" stroke="#4ADE80" strokeWidth={3.5} />
                <OctoCheckCircle cx={-342} cy={0} r={19} bg="#22C55E" />
                <text x={16} y={9} textAnchor="middle" fill="#FFFFFF" fontSize={24} fontWeight={900}>
                  Biến lỗi quang học thành siêu năng lực đo màu!
                </text>
              </g>
            ) : (
              <OctoContrastBadge
                x={775}
                y={472}
                w={780}
                h={54}
                text="Ở máy ảnh là lỗi nhòe màu — Nhưng bạch tuộc tận dụng để phân màu!"
                variant="softAmber"
                fontSize={21}
              />
            )}
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_08: OCTO_SKIN_EYES (Beats 23–24, steps 0, 1)
 *   - Step 0: Magnified skin showing light-sensing opsin molecules nestled right beside chromatophores
 *   - Step 1: Lab petri dish with detached skin patch + blue lamp -> pigment sacs expand without eye/brain!
 * ========================================================================== */
export const OctoSkinEyesVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const reactT =
    activeStep === 1
      ? interpolate(frame, [8, 38], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        })
      : 0;
  const dotR = 9 + reactT * 17;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="OCEAN" gradId="octo08_bg" cardBorder="#0284C7" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Bí mật khó tin: Chính làn da bạch tuộc cũng có cảm biến nhìn ánh sáng!'
            : 'Thí nghiệm phòng lab: Mảng da rời vẫn tự đổi màu khi chiếu đèn xanh!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {/* Left Card: Opsin Light Sensors Nestled Inside Skin */}
      <g transform="translate(185, 200)">
        <rect x={0} y={0} width={730} height={536} rx={28} fill="#F0F9FF" stroke="#0284C7" strokeWidth={4} />
        <text x={365} y={52} textAnchor="middle" fill="#0369A1" fontSize={25} fontWeight={900}>
          Phân tử cảm biến ánh sáng trên da
        </text>
        <g transform="translate(45, 118)">
          <rect x={0} y={0} width={640} height={272} rx={22} fill="#FFF7ED" stroke="#EA580C" strokeWidth={4} />
          {/* Alternating Chromatophores & Tiny Cyan Opsin Light Sensors */}
          {[110, 320, 530].map((cx, idx) => (
            <g key={idx}>
              <circle cx={cx} cy={154} r={42} fill={idx === 1 ? '#EF4444' : '#F97316'} stroke={INK} strokeWidth={3.5} />
              <text x={cx} y={161} textAnchor="middle" fill="#FFFFFF" fontSize={16} fontWeight={900}>Túi màu</text>
            </g>
          ))}
          {[215, 425].map((sx, idx) => (
            <g key={idx} transform={`translate(${sx}, 96)`}>
              <circle cx={0} cy={0} r={28} fill="#E0F2FE" stroke="#0284C7" strokeWidth={3.5} />
              <circle cx={0} cy={0} r={12} fill="#0284C7" />
              <path d="M -18,-36 L 0,-28 L 18,-36" fill="none" stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" />
            </g>
          ))}
          <text x={320} y={42} textAnchor="middle" fill="#0369A1" fontSize={20} fontWeight={900}>
            ⚡ Cảm biến ánh sáng (nằm ngay cạnh túi sắc tố!)
          </text>
        </g>
        <OctoContrastBadge x={365} y={462} w={560} h={50} text="Mỗi mảng da tự cảm nhận độ sáng trực tiếp!" variant="solidBlue" fontSize={20} />
      </g>

      {/* Right Card: Lab Petri Dish Experiment (Step 1 Highlights!) */}
      <g transform="translate(950, 200)" opacity={activeStep === 1 ? 1 : 0.45}>
        <rect
          x={0}
          y={0}
          width={785}
          height={536}
          rx={28}
          fill={activeStep === 1 ? '#ECFDF5' : '#F8FAFC'}
          stroke={activeStep === 1 ? '#15803D' : '#CBD5E1'}
          strokeWidth={activeStep === 1 ? 4.8 : 3.5}
        />
        <text x={392} y={52} textAnchor="middle" fill={activeStep === 1 ? '#14532D' : '#475569'} fontSize={25} fontWeight={900}>
          Thí nghiệm mảng da tách rời (Đĩa thí nghiệm)
        </text>

        {/* Blue Lab Lamp Shining Down onto Detached Skin Patch */}
        <g transform="translate(392, 132)">
          <rect x={-48} y={-28} width={96} height={36} rx={10} fill="#334155" stroke={INK} strokeWidth={3.5} />
          <path d="M -36,8 L -126,184 L 126,184 L 36,8 Z" fill="#38BDF8" opacity={activeStep === 1 ? 0.34 : 0.12} stroke="none" />
          <ellipse cx={0} cy={12} rx={34} ry={9} fill="#38BDF8" stroke="#0284C7" strokeWidth={2.5} />
        </g>

        {/* Glass Petri Dish + Detached Skin Sample Expanding Pigment Sacs */}
        <g transform="translate(392, 336)">
          <ellipse cx={0} cy={14} rx={182} ry={58} fill="#E0F2FE" stroke="#0284C7" strokeWidth={4} />
          <ellipse cx={0} cy={6} rx={160} ry={44} fill="#FFFFFF" stroke="#7DD3FC" strokeWidth={2.8} />
          {/* Detached Skin Sample */}
          <ellipse cx={0} cy={6} rx={116} ry={30} fill="#FED7AA" stroke="#EA580C" strokeWidth={3.2} />
          {[-68, -22, 24, 68].map((px, i) => (
            <circle
              key={i}
              cx={px}
              cy={6 + (i % 2 === 0 ? -4 : 5)}
              r={dotR}
              fill={i % 2 === 0 ? '#EF4444' : '#D97706'}
              stroke={INK}
              strokeWidth={2.4}
            />
          ))}
        </g>

        <OctoContrastBadge
          x={392}
          y={462}
          w={660}
          h={52}
          text={
            activeStep === 1
              ? '✓  Không cần mắt & não — Túi màu vẫn tự nở khi gặp ánh sáng!'
              : 'Chiếu đèn xanh kiểm tra phản ứng tự động của da'
          }
          variant={activeStep === 1 ? 'solidGreen' : 'softBlue'}
          fontSize={20}
        />
      </g>
    </svg>
  );
};
