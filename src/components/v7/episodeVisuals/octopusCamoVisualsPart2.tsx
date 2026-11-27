import React from 'react';
import { Easing, interpolate } from 'remotion';
import type { EpisodeVisualProps } from './index';
import { CuteOctopus } from '../../AnimalSpriteKit';
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
 * SVG_09: OCTO_POLARIZED_LIGHT (Beats 25–26, steps 0, 1)
 *   - Step 0: Polarized light vision comparison: Human eye (translucent silver fish fades)
 *             vs Octopus eye (crystal high-contrast polarized target revealed!)
 *   - Step 1: Eye cross-section comparison: Human eye (Blind Spot) vs Octopus eye (0 Blind Spot)
 * ========================================================================== */
const PolarizedWavePatternDefs = React.memo(() => (
  <defs>
    <pattern id="octo09_pol_pat" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <line x1="0" y1="14" x2="28" y2="14" stroke="#0EA5E9" strokeWidth="1.8" opacity="0.24" />
      <line x1="14" y1="0" x2="14" y2="28" stroke="#38BDF8" strokeWidth="1.2" opacity="0.16" />
    </pattern>
  </defs>
));
PolarizedWavePatternDefs.displayName = 'PolarizedWavePatternDefs';

export const OctoPolarizedLightVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const scanX = interpolate(frame % 90, [0, 90], [90, 620]);
  const revealT = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <PolarizedWavePatternDefs />
      <OctoStageCardBackdrop tone="OCEAN" gradId="octo09_bg" cardBorder="#0284C7" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Siêu thị giác phân cực: Phát hiện con mồi trong suốt dưới biển!'
            : 'Cấu tạo võng mạc ngược: Mắt bạch tuộc KHÔNG HỀ CÓ ĐIỂM MÙ!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <>
          {/* Left View: Human Eye — Transparent Silver Fish Almost Invisible */}
          <g transform="translate(170, 200)">
            <rect x={0} y={0} width={745} height={536} rx={28} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={4} />
            <text x={372} y={52} textAnchor="middle" fill="#334155" fontSize={27} fontWeight={900}>
              Góc nhìn Mắt người
            </text>

            {/* Bright open seawater box */}
            <rect x={44} y={84} width={657} height={316} rx={22} fill="#BAE6FD" stroke="#64748B" strokeWidth={3} />
            {/* Soft sunbeams */}
            <polygon points="150,84 220,84 170,400 100,400" fill="#E0F2FE" opacity={0.45} />
            <polygon points="420,84 510,84 445,400 355,400" fill="#E0F2FE" opacity={0.4} />

            {/* Nearly invisible translucent silver fish */}
            <g transform="translate(380, 245)" opacity={0.26}>
              <path
                d="M -115,0 C -85,-48 35,-50 96,0 C 35,50 -85,48 -115,0 Z"
                fill="#E2E8F0"
                stroke="#64748B"
                strokeWidth={3}
                strokeDasharray="8 6"
              />
              <polygon points="-110,0 -158,-34 -146,0 -158,34" fill="#E2E8F0" stroke="#64748B" strokeWidth={3} />
              <circle cx={58} cy={-8} r={6} fill="#64748B" />
            </g>

            {/* Question mark icon */}
            <g transform="translate(615, 146)">
              <circle cx={0} cy={0} r={30} fill="#FFFFFF" stroke="#64748B" strokeWidth={3} />
              <text x={0} y={11} textAnchor="middle" fill="#475569" fontSize={32} fontWeight={900}>
                ?
              </text>
            </g>

            <OctoContrastBadge
              x={372}
              y={456}
              w={560}
              h={50}
              text="Cá bạc trong suốt hòa lẫn nền nước — rất khó thấy"
              variant="softBlue"
              fontSize={20}
            />
          </g>

          {/* Right View: Octopus Eye — Polarized Contrast Reveals Fish Crystal Clear */}
          <g transform="translate(1005, 200)">
            <rect x={0} y={0} width={745} height={536} rx={28} fill="#ECFDF5" stroke="#0D9488" strokeWidth={4.5} />
            <text x={372} y={52} textAnchor="middle" fill="#0F766E" fontSize={27} fontWeight={900}>
              Góc nhìn Mắt bạch tuộc (Phân cực)
            </text>

            {/* Polarized water box using <pattern> */}
            <rect x={44} y={84} width={657} height={316} rx={22} fill="#0C4A6E" stroke="#0D9488" strokeWidth={3.5} />
            <rect x={44} y={84} width={657} height={316} rx={22} fill="url(#octo09_pol_pat)" />

            {/* Moving scan beam */}
            <line x1={scanX} y1={88} x2={scanX} y2={396} stroke="#38BDF8" strokeWidth={3.5} opacity={0.55} />

            {/* Vivid high-contrast highlighted fish target */}
            <g transform={`translate(380, 245) scale(${(0.95 + revealT * 0.05).toFixed(3)})`}>
              <ellipse cx={0} cy={0} rx={164} ry={76} fill="none" stroke="#38BDF8" strokeWidth={3.5} strokeDasharray="12 8" />
              <path
                d="M -115,0 C -85,-48 35,-50 96,0 C 35,50 -85,48 -115,0 Z"
                fill="#F59E0B"
                stroke="#FFFFFF"
                strokeWidth={4.5}
              />
              <path d="M -55,-26 L -35,26 M -8,-34 L 12,34 M 36,-24 L 50,24" stroke="#FEF08A" strokeWidth={5} strokeLinecap="round" />
              <polygon points="-110,0 -158,-34 -146,0 -158,34" fill="#F97316" stroke="#FFFFFF" strokeWidth={4} />
              <circle cx={60} cy={-8} r={8} fill="#FFFFFF" />
              <circle cx={62} cy={-8} r={4} fill={INK} />
            </g>

            {/* Clean angle polarization pill top-left inside viewer */}
            <g transform="translate(154, 130)">
              <rect x={-90} y={-20} width={180} height={40} rx={14} fill="#0F172A" stroke="#38BDF8" strokeWidth={2.5} />
              <text x={0} y={7} textAnchor="middle" fill="#7DD3FC" fontSize={18} fontWeight={900}>
                Phân cực 0° / 90°
              </text>
            </g>

            <OctoContrastBadge
              x={372}
              y={456}
              w={560}
              h={50}
              text="Lộ rõ con mồi phát sáng rực rỡ giữa đại dương!"
              variant="solidTeal"
              fontSize={20}
            />
          </g>
        </>
      ) : (
        <>
          {/* Step 1: Eye Wiring Cross-Section Comparison (Human Blind Spot vs Octopus 0 Blind Spot) */}
          <g transform="translate(170, 200)">
            <rect x={0} y={0} width={745} height={536} rx={28} fill="#FEF2F2" stroke="#DC2626" strokeWidth={4} />
            <text x={372} y={54} textAnchor="middle" fill="#991B1B" fontSize={27} fontWeight={900}>
              Mắt người (Có điểm mù)
            </text>

            {/* Simplified clean eye cross-section */}
            <g transform="translate(372, 245)" stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
              <circle cx={0} cy={0} r={128} fill="#FFFFFF" />
              {/* Retina arc on right */}
              <path d="M 46,-116 A 122,122 0 0 1 46,116" fill="none" stroke="#F59E0B" strokeWidth={14} strokeLinecap="round" />
              {/* Gap in retina = Blind Spot */}
              <rect x={110} y={-20} width={30} height={40} fill="#FEE2E2" stroke="none" />
              {/* Nerve fibers crossing IN FRONT of retina and punching through */}
              <path d="M 88,-72 Q 70,-16 146,-6" fill="none" stroke="#DC2626" strokeWidth={5} />
              <path d="M 88,72 Q 70,16 146,6" fill="none" stroke="#DC2626" strokeWidth={5} />
              {/* Light ray arrow coming from left */}
              <path d="M -210,0 L -140,0" fill="none" stroke="#0284C7" strokeWidth={6} strokeLinecap="round" />
              <polygon points="-126,0 -146,-11 -146,11" fill="#0284C7" stroke="none" />
              <text x={-186} y={-20} textAnchor="middle" fill="#0369A1" stroke="none" fontSize={18} fontWeight={900}>
                Ánh sáng
              </text>
              {/* Clean callout outside eyeball to top-right */}
              <path d="M 122,-18 L 195,-78" fill="none" stroke="#DC2626" strokeWidth={3.5} strokeDasharray="6 4" />
              <rect x={160} y={-114} width={175} height={42} rx={14} fill="#DC2626" stroke="#991B1B" strokeWidth={2.5} />
              <text x={247} y={-87} textAnchor="middle" fill="#FFFFFF" stroke="none" fontSize={18} fontWeight={900}>
                Lỗ điểm mù!
              </text>
            </g>

            <OctoContrastBadge
              x={372}
              y={456}
              w={560}
              h={50}
              text="Dây thần kinh nằm TRƯỚC võng mạc → tạo 1 điểm mù"
              variant="softRed"
              fontSize={19}
            />
          </g>

          <g transform="translate(1005, 200)">
            <rect x={0} y={0} width={745} height={536} rx={28} fill="#F0FDF4" stroke="#15803D" strokeWidth={4.5} />
            <text x={372} y={54} textAnchor="middle" fill="#15803D" fontSize={27} fontWeight={900}>
              Mắt bạch tuộc (0 điểm mù!)
            </text>

            {/* Clean Octopus eye cross-section with wires neatly BEHIND retina */}
            <g transform="translate(372, 245)" stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
              <circle cx={0} cy={0} r={128} fill="#FFFFFF" />
              {/* Unbroken continuous retina arc */}
              <path d="M 46,-116 A 122,122 0 0 1 46,116" fill="none" stroke="#16A34A" strokeWidth={15} strokeLinecap="round" />
              {/* Nerve fibers exiting neatly BEHIND the retina */}
              <path d="M 124,-64 Q 158,-44 198,-12" fill="none" stroke="#0D9488" strokeWidth={5} />
              <path d="M 134,0 L 198,0" fill="none" stroke="#0D9488" strokeWidth={5} />
              <path d="M 124,64 Q 158,44 198,12" fill="none" stroke="#0D9488" strokeWidth={5} />
              {/* Light ray arrow coming from left */}
              <path d="M -210,0 L -140,0" fill="none" stroke="#0284C7" strokeWidth={6} strokeLinecap="round" />
              <polygon points="-126,0 -146,-11 -146,11" fill="#0284C7" stroke="none" />
              <text x={-186} y={-20} textAnchor="middle" fill="#0369A1" stroke="none" fontSize={18} fontWeight={900}>
                Ánh sáng
              </text>
              {/* Clean badge outside */}
              <OctoCheckCircle cx={224} cy={-86} r={24} />
              <text x={224} y={-44} textAnchor="middle" fill="#15803D" stroke="none" fontSize={19} fontWeight={900}>
                Liên mạch 100%
              </text>
            </g>

            <OctoContrastBadge
              x={372}
              y={456}
              w={560}
              h={50}
              text="Dây thần kinh nằm SAU võng mạc → 0 điểm mù!"
              variant="solidGreen"
              fontSize={20}
            />
          </g>
        </>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_10: OCTO_DREAMING_SLEEP (Beats 31–32, steps 0, 1)
 *   - Step 0: 2 sleep phases side by side: Quiet Sleep (pale white) vs Active Sleep (~1 min color bursts)
 *   - Step 1: Dream hypothesis: sleeping CuteOctopus cycling colors + dream cloud with crab
 * ========================================================================== */
export const OctoDreamingSleepVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const dreamPhase = (Math.sin(frame * 0.12) + 1) / 2;
  const activeColors = {
    main: mixHexColor('#FB923C', '#0EA5E9', dreamPhase),
    belly: mixHexColor('#FFEDD5', '#E0F2FE', dreamPhase),
    spot: mixHexColor('#DC2626', '#1D4ED8', dreamPhase),
  };

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="OCEAN" gradId="octo10_bg" cardBorder="#0284C7" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Hai giai đoạn ngủ kỳ lạ của bạch tuộc: Ngủ yên & Ngủ động!'
            : 'Giả thuyết thú vị: Bạch tuộc đổi màu vì đang MƠ săn mồi!'
        }
        bg="#FFFFFF"
        color="#0369A1"
        border="#0284C7"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <>
          {/* Left Card: Quiet Sleep */}
          <g transform="translate(175, 200)">
            <rect x={0} y={0} width={735} height={536} rx={28} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={4} />
            <text x={368} y={54} textAnchor="middle" fill="#334155" fontSize={28} fontWeight={900}>
              1. Ngủ yên (Quiet Sleep)
            </text>

            {/* Sandy seabed inside card */}
            <rect x={48} y={84} width={639} height={310} rx={22} fill="#E0F2FE" stroke="#CBD5E1" strokeWidth={3} />
            <path d="M 48,332 Q 368,312 687,332 L 687,394 L 48,394 Z" fill="#FDE68A" />

            <CuteOctopus
              x={368}
              y={352}
              scale={1.15}
              frame={frame}
              pose="crawl"
              emotion="sleepy"
              colorOverride={{ main: '#E2E8F0', belly: '#F8FAFC', spot: '#94A3B8' }}
            />

            <OctoContrastBadge
              x={368}
              y={446}
              w={530}
              h={48}
              text="Da trắng nhạt • Bất động • Thở rất chậm"
              variant="softBlue"
              fontSize={20}
            />
            <text x={368} y={506} textAnchor="middle" fill="#64748B" fontSize={19} fontWeight={800}>
              Cơ thể nghỉ ngơi sâu, giữ nhịp tim đều đặn
            </text>
          </g>

          {/* Right Card: Active Sleep (~1 min) */}
          <g transform="translate(1010, 200)">
            <rect x={0} y={0} width={735} height={536} rx={28} fill="#FFF7ED" stroke="#EA580C" strokeWidth={4.5} />
            <text x={368} y={54} textAnchor="middle" fill="#C2410C" fontSize={28} fontWeight={900}>
              2. Ngủ động (~1 phút • Active Sleep)
            </text>

            <rect x={48} y={84} width={639} height={310} rx={22} fill="#0F172A" stroke="#F59E0B" strokeWidth={3.5} />
            <path d="M 48,332 Q 368,312 687,332 L 687,394 L 48,394 Z" fill="#334155" />

            {/* Subtle pulsing color burst rings around sleeping octopus (zero blur) */}
            <circle cx={368} cy={258} r={118 + dreamPhase * 12} fill="none" stroke="#38BDF8" strokeWidth={4} strokeDasharray="14 10" opacity={0.7} />
            <CuteOctopus
              x={368}
              y={352}
              scale={1.15}
              frame={frame}
              pose="crawl"
              emotion="sleepy"
              colorOverride={activeColors}
              papillaeBumps={dreamPhase > 0.5}
            />

            <OctoContrastBadge
              x={368}
              y={446}
              w={550}
              h={48}
              text="Da chớp đổi màu liên tục • Mắt đảo nhanh!"
              variant="softAmber"
              fontSize={20}
            />
            <text x={368} y={506} textAnchor="middle" fill="#9A3412" fontSize={19} fontWeight={800}>
              Kéo dài khoảng 1 phút mỗi chu kỳ ~30–40 phút
            </text>
          </g>
        </>
      ) : (
        /* Step 1: Dream Cloud Visualization */
        <g>
          <rect x={175} y={196} width={1570} height={492} rx={28} fill="#0F172A" stroke="#0284C7" strokeWidth={4} />
          {/* Soft deep ocean floor */}
          <path d="M 175,604 Q 960,566 1745,604 L 1745,688 L 175,688 Z" fill="#1E293B" />

          {/* Sleeping CuteOctopus cycling colors gently on left */}
          <CuteOctopus
            x={575}
            y={626}
            scale={1.45}
            frame={frame}
            pose="crawl"
            emotion="sleepy"
            colorOverride={activeColors}
            papillaeBumps={dreamPhase > 0.55}
          />

          {/* Connecting thought-dream bubble dots */}
          <circle cx={790} cy={470} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
          <circle cx={852} cy={432} r={22} fill="#FFFFFF" stroke={INK} strokeWidth={3.2} />

          {/* Large Dream Cloud on right containing cute reef + crab */}
          <g transform="translate(1240, 386)">
            <rect x={-325} y={-148} width={650} height={292} rx={78} fill="#FFFFFF" stroke="#38BDF8" strokeWidth={5} />
            <text x={0} y={-92} textAnchor="middle" fill="#0369A1" fontSize={25} fontWeight={900}>
              Giấc mơ đại dương (Chiếu lại ký ức!)
            </text>

            {/* Bright mini reef scene inside dream cloud */}
            <rect x={-250} y={-68} width={500} height={152} rx={22} fill="#E0F2FE" stroke="#7DD3FC" strokeWidth={3} />
            {/* Mini pink coral */}
            <path d="M -185,82 C -192,42 -210,16 -196,6 C -182,-2 -166,22 -162,48 C -152,18 -134,8 -126,20 C -118,32 -136,56 -144,82 Z" fill="#F472B6" stroke={INK} strokeWidth={3} />
            {/* Mini cute crab */}
            <g transform={`translate(${(24 + Math.sin(frame * 0.14) * 24).toFixed(1)}, 34)`} stroke={INK} strokeWidth={3}>
              <path d="M -38,14 L -56,28 M -28,20 L -42,36 M 38,14 L 56,28 M 28,20 L 42,36" stroke="#DC2626" strokeWidth={5} strokeLinecap="round" />
              <ellipse cx={0} cy={6} rx={42} ry={26} fill="#EF4444" />
              <circle cx={-16} cy={-22} r={8} fill="#FFFFFF" />
              <circle cx={16} cy={-22} r={8} fill="#FFFFFF" />
              <circle cx={-16} cy={-22} r={3.5} fill={INK} stroke="none" />
              <circle cx={16} cy={-22} r={3.5} fill={INK} stroke="none" />
              <path d="M -10,12 Q 0,20 10,12" fill="none" strokeWidth={2.8} strokeLinecap="round" />
            </g>
            {/* Mini swimming coral fish */}
            <g transform="translate(154, -18)" stroke={INK} strokeWidth={2.8}>
              <ellipse cx={0} cy={0} rx={26} ry={16} fill="#FBBF24" />
              <polygon points="24,0 44,-14 44,14" fill="#F59E0B" />
              <circle cx={-10} cy={-3} r={3} fill={INK} stroke="none" />
            </g>

            <text x={0} y={118} textAnchor="middle" fill="#334155" fontSize={21} fontWeight={800}>
              Màu da đổi nhịp nhàng theo từng khung cảnh trong mơ!
            </text>
          </g>

          <OctoContrastBadge
            x={960}
            y={738}
            w={920}
            h={48}
            text="Rất giống giấc ngủ REM tạo ra giấc mơ sống động ở con người!"
            variant="solidBlue"
            fontSize={22}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_11: OCTO_COMMUNICATION_MOOD (Beats 33–34, steps 0, 1)
 *   - Step 0: 2 clean mood cards: Dark vivid (Aggressive) vs Pale white (Calm/Peaceful)
 *   - Step 1: Blue-ringed octopus flashing neon blue rings + HIGH-CONTRAST #DC2626/#FFFFFF badge
 *             "CẢNH BÁO CỰC ĐỘC!"
 * ========================================================================== */
export const OctoCommunicationMoodVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const flashPulse = 0.5 + 0.5 * Math.sin(frame * 0.28);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop
        tone={activeStep === 1 ? 'ROSE' : 'CORAL'}
        gradId="octo11_bg"
        cardBorder={activeStep === 1 ? '#DC2626' : '#EA580C'}
      />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Ngôn ngữ màu sắc: Làn da bạch tuộc báo hiệu cảm xúc tức thì!'
            : 'Bạch tuộc đốm xanh: Bật sáng vòng xanh cảnh báo độc tố chết người!'
        }
        bg={activeStep === 1 ? '#DC2626' : '#FFFFFF'}
        color={activeStep === 1 ? '#FFFFFF' : '#C2410C'}
        border={activeStep === 1 ? '#991B1B' : '#EA580C'}
        fontSize={29}
      />

      {activeStep === 0 ? (
        <>
          {/* Left Card: Dark Bold = Aggressive / Territorial */}
          <g transform="translate(175, 200)">
            <rect x={0} y={0} width={735} height={536} rx={28} fill="#FEF2F2" stroke="#DC2626" strokeWidth={4.5} />
            <text x={368} y={54} textAnchor="middle" fill="#991B1B" fontSize={28} fontWeight={900}>
              Màu sẫm rực = Cảnh báo / Hung hăng
            </text>

            <circle cx={368} cy={240} r={144} fill="#FEE2E2" stroke="#EF4444" strokeWidth={3.5} />
            <CuteOctopus
              x={368}
              y={338}
              scale={1.25}
              frame={frame}
              pose="float"
              emotion="surprised"
              colorOverride={{ main: '#B91C1C', belly: '#FCA5A5', spot: '#7F1D1D' }}
              papillaeBumps={true}
            />

            <OctoContrastBadge
              x={368}
              y={442}
              w={520}
              h={48}
              text="Đang tranh lãnh thổ — chớ lại gần!"
              variant="solidRed"
              fontSize={21}
            />
            <text x={368} y={504} textAnchor="middle" fill="#7F1D1D" fontSize={19} fontWeight={800}>
              Phồng người + bật sắc tố đậm để thị uy đối thủ
            </text>
          </g>

          {/* Right Card: Pale White = Calm / Yielding */}
          <g transform="translate(1010, 200)">
            <rect x={0} y={0} width={735} height={536} rx={28} fill="#F0F9FF" stroke="#0284C7" strokeWidth={4} />
            <text x={368} y={54} textAnchor="middle" fill="#0369A1" fontSize={28} fontWeight={900}>
              Màu trắng nhạt = Bình tĩnh / Nhường nhịn
            </text>

            <circle cx={368} cy={240} r={144} fill="#E0F2FE" stroke="#38BDF8" strokeWidth={3.5} />
            <CuteOctopus
              x={368}
              y={338}
              scale={1.25}
              frame={frame}
              pose="wave"
              emotion="happy"
              colorOverride={{ main: '#E2E8F0', belly: '#F8FAFC', spot: '#94A3B8' }}
            />

            <OctoContrastBadge
              x={368}
              y={442}
              w={520}
              h={48}
              text="Hòa bình — mình muốn tránh xung đột!"
              variant="softBlue"
              fontSize={21}
            />
            <text x={368} y={504} textAnchor="middle" fill="#334155" fontSize={19} fontWeight={800}>
              Thu nhỏ túi sắc tố gửi tín hiệu thân thiện, không tấn công
            </text>
          </g>
        </>
      ) : (
        /* Step 1: Blue-Ringed Octopus High-Contrast Warning */
        <g>
          {/* Left Hero Frame with Flashing Blue-Ringed Octopus */}
          <g transform="translate(185, 200)">
            <rect x={0} y={0} width={760} height={536} rx={28} fill="#FFFBEB" stroke="#DC2626" strokeWidth={4.5} />
            {/* Flashing alert halo rings behind creature (0 blur) */}
            <circle cx={380} cy={262} r={176} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={4} />
            <circle
              cx={380}
              cy={262}
              r={192 + flashPulse * 10}
              fill="none"
              stroke="#2563EB"
              strokeWidth={5}
              strokeDasharray="16 12"
              opacity={0.4 + flashPulse * 0.55}
            />

            <CuteOctopus
              x={380}
              y={378}
              scale={1.55}
              frame={frame}
              pose="float"
              emotion="surprised"
              colorOverride={{ main: '#F59E0B', belly: '#FEF3C7', spot: '#B45309' }}
              blueRings={true}
            />

            <text x={380} y={492} textAnchor="middle" fill="#92400E" fontSize={23} fontWeight={900}>
              Bạch tuộc đốm xanh (Hapalochlaena)
            </text>
          </g>

          {/* Right High-Contrast Warning Info Card */}
          <g transform="translate(990, 200)">
            <rect x={0} y={0} width={745} height={536} rx={28} fill="#FFFFFF" stroke="#DC2626" strokeWidth={4.5} />

            {/* Mandatory High-Contrast Red Warning Badge (#DC2626 + #FFFFFF) */}
            <OctoContrastBadge
              x={372}
              y={74}
              w={560}
              h={64}
              text="⚠  CẢNH BÁO CỰC ĐỘC!"
              variant="solidRed"
              fontSize={29}
            />

            {/* 3 Clear Fact Strips */}
            <g transform="translate(46, 136)">
              <rect x={0} y={0} width={653} height={106} rx={18} fill="#EFF6FF" stroke="#2563EB" strokeWidth={3.2} />
              <circle cx={46} cy={53} r={22} fill="#1E3A8A" stroke="#38BDF8" strokeWidth={5} />
              <text x={88} y={46} fill="#1E3A8A" fontSize={22} fontWeight={900}>
                Hàng chục vòng xanh dương phát sáng rực rỡ
              </text>
              <text x={88} y={78} fill="#334155" fontSize={19} fontWeight={700}>
                Bật tắt chớp liên tục chỉ trong 0,3 giây khi bị đe dọa!
              </text>
            </g>

            <g transform="translate(46, 264)">
              <rect x={0} y={0} width={653} height={106} rx={18} fill="#FEF2F2" stroke="#DC2626" strokeWidth={3.2} />
              <text x={36} y={46} fill="#991B1B" fontSize={22} fontWeight={900}>
                Ngược hoàn toàn với tàng hình:
              </text>
              <text x={36} y={78} fill="#334155" fontSize={19} fontWeight={700}>
                Không trốn đi — cố tình thật NỔI BẬT để dọa kẻ thù tránh xa!
              </text>
            </g>

            <g transform="translate(46, 392)">
              <rect x={0} y={0} width={653} height={106} rx={18} fill="#F0FDF4" stroke="#15803D" strokeWidth={3.2} />
              <text x={36} y={46} fill="#15803D" fontSize={22} fontWeight={900}>
                Quy tắc an toàn ngoài biển:
              </text>
              <text x={36} y={78} fill="#334155" fontSize={19} fontWeight={700}>
                Thấy sinh vật biển có vòng xanh neon rực → Tuyệt đối không chạm!
              </text>
            </g>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_12: OCTO_MIMIC_MASTER (Beats 35–36, steps 0, 1)
 *   - Step 0: Hero Mimic Octopus intro "Bạch tuộc bắt chước — Diễn viên số 1 đại dương"
 *   - Step 1: 3 clean disguise cards (bottom y=646, caption y=738 => 92px >= 50px clear!)
 *             1. Cá sư tử   |   2. Cá bơn dẹt   |   3. Rắn biển sọc
 * ========================================================================== */
export const OctoMimicMasterVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="CREAM" gradId="octo12_bg" cardBorder="#D97706" />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Bạch tuộc bắt chước — Diễn viên số 1 đại dương!'
            : '3 vai diễn kinh điển khiến mọi kẻ săn mồi phải né tránh!'
        }
        bg="#FFFFFF"
        color="#B45309"
        border="#D97706"
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Central Hero Showcase */}
          <rect x={185} y={196} width={1550} height={470} rx={28} fill="#FFFBEB" stroke="#F59E0B" strokeWidth={4} />
          <circle cx={960} cy={418} r={178} fill="#FEF3C7" stroke="#D97706" strokeWidth={4} strokeDasharray="14 10" />

          <CuteOctopus
            x={960}
            y={548}
            scale={1.5}
            frame={frame}
            pose="wave"
            emotion="proud"
            colorOverride={{ main: '#D97706', belly: '#FEF3C7', spot: '#78350F' }}
          />

          {/* Clean floating role badges on left & right (well clear of mascot) */}
          <g transform="translate(415, 345)">
            <rect x={-165} y={-44} width={330} height={88} rx={22} fill="#FFFFFF" stroke="#EA580C" strokeWidth={3.5} />
            <text x={0} y={-6} textAnchor="middle" fill="#C2410C" fontSize={22} fontWeight={900}>
              Đổi màu sọc nâu-trắng
            </text>
            <text x={0} y={26} textAnchor="middle" fill="#475569" fontSize={18} fontWeight={700}>
              Chỉ trong tích tắc!
            </text>
          </g>
          <g transform="translate(1505, 345)">
            <rect x={-165} y={-44} width={330} height={88} rx={22} fill="#FFFFFF" stroke="#0284C7" strokeWidth={3.5} />
            <text x={0} y={-6} textAnchor="middle" fill="#0369A1" fontSize={22} fontWeight={900}>
              Uốn dẻo 8 xúc tu
            </text>
            <text x={0} y={26} textAnchor="middle" fill="#475569" fontSize={18} fontWeight={700}>
              Đóng giả hình dáng loài khác!
            </text>
          </g>

          <OctoContrastBadge
            x={960}
            y={732}
            w={940}
            h={50}
            text="Không chỉ tàng hình — nó còn đóng giả hơn 15 loài sinh vật độc!"
            variant="softAmber"
            fontSize={22}
          />
        </g>
      ) : (
        /* Step 1: 3 Classic Disguises (cards y=198..646, bottom caption y=738 => 92px >= 50px gap!) */
        <g>
          {/* Card 1: Cá sư tử gai độc */}
          <g transform="translate(168, 198)">
            <rect x={0} y={0} width={502} height={448} rx={26} fill="#FEF2F2" stroke="#EA580C" strokeWidth={4} />
            <OctoContrastBadge x={251} y={44} w={300} h={42} text="1. Cá sư tử" variant="solidRed" fontSize={21} />

            {/* Clean Stylized Lionfish Illustration */}
            <g transform="translate(251, 212)" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
              <circle cx={0} cy={0} r={108} fill="#FFEDD5" stroke="#FB923C" strokeWidth={3} />
              {/* Fanned striped spines mimicking octopus arms */}
              {[-62, -38, -14, 10, 34, 58].map((ang, i) => (
                <path
                  key={i}
                  d="M 0,0 L 0,-96"
                  transform={`rotate(${ang})`}
                  stroke={i % 2 === 0 ? '#9A3412' : '#FFFFFF'}
                  strokeWidth={8}
                />
              ))}
              {/* Body */}
              <ellipse cx={8} cy={14} rx={58} ry={34} fill="#F97316" />
              <path d="M -24,-14 L -18,44 M 2,-18 L 8,48 M 28,-14 L 34,42" stroke="#7C2D12" strokeWidth={7} />
              <circle cx={42} cy={4} r={8} fill="#FFFFFF" />
              <circle cx={44} cy={4} r={4} fill={INK} stroke="none" />
            </g>

            <text x={251} y={368} textAnchor="middle" fill="#9A3412" fontSize={21} fontWeight={900}>
              Xòe 8 xúc tu thành gai độc
            </text>
            <text x={251} y={404} textAnchor="middle" fill="#475569" fontSize={18} fontWeight={700}>
              Bơi lơ lửng dọa cá lớn tránh xa
            </text>
          </g>

          {/* Card 2: Cá bơn dẹt */}
          <g transform="translate(709, 198)">
            <rect x={0} y={0} width={502} height={448} rx={26} fill="#F0F9FF" stroke="#0284C7" strokeWidth={4} />
            <OctoContrastBadge x={251} y={44} w={300} h={42} text="2. Cá bơn dẹt" variant="solidBlue" fontSize={21} />

            {/* Clean Stylized Flatfish / Flounder Illustration */}
            <g transform="translate(251, 212)" stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
              <circle cx={0} cy={0} r={108} fill="#E0F2FE" stroke="#38BDF8" strokeWidth={3} />
              {/* Flat sandy seabed line */}
              <line x1={-88} y1={56} x2={88} y2={56} stroke="#D97706" strokeWidth={5} strokeLinecap="round" />
              {/* Leaf-shaped gliding flatfish */}
              <path
                d="M -92,16 C -54,-36 44,-36 92,16 C 44,44 -54,44 -92,16 Z"
                fill="#0EA5E9"
              />
              <path d="M -64,14 Q -10,0 56,14" fill="none" stroke="#BAE6FD" strokeWidth={5} strokeLinecap="round" />
              <circle cx={44} cy={2} r={7.5} fill="#FFFFFF" />
              <circle cx={46} cy={2} r={3.5} fill={INK} stroke="none" />
              <circle cx={28} cy={-6} r={7.5} fill="#FFFFFF" />
              <circle cx={30} cy={-6} r={3.5} fill={INK} stroke="none" />
            </g>

            <text x={251} y={368} textAnchor="middle" fill="#0369A1" fontSize={21} fontWeight={900}>
              Ép dẹt thân &amp; kéo xúc tu về sau
            </text>
            <text x={251} y={404} textAnchor="middle" fill="#475569" fontSize={18} fontWeight={700}>
              Lướt sát đáy cát nhanh hệt cá bơn độc
            </text>
          </g>

          {/* Card 3: Rắn biển sọc */}
          <g transform="translate(1250, 198)">
            <rect x={0} y={0} width={502} height={448} rx={26} fill="#FFFBEB" stroke="#D97706" strokeWidth={4} />
            <OctoContrastBadge x={251} y={44} w={300} h={42} text="3. Rắn biển sọc" variant="softAmber" fontSize={21} />

            {/* Clean Stylized Banded Sea Snake Illustration (2 arms sticking out of burrow) */}
            <g transform="translate(251, 212)" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
              <circle cx={0} cy={0} r={108} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={3} />
              {/* Sand mound & burrow */}
              <ellipse cx={0} cy={46} rx={52} ry={18} fill="#92400E" />
              {/* Waving striped arms like sea snake */}
              <path
                d="M -16,42 C -58,12 -74,-34 -34,-62 C -14,-74 8,-62 24,-46"
                fill="none"
                stroke="#1E293B"
                strokeWidth={22}
              />
              <path
                d="M -16,42 C -58,12 -74,-34 -34,-62 C -14,-74 8,-62 24,-46"
                fill="none"
                stroke="#FDE047"
                strokeWidth={14}
                strokeDasharray="14 14"
              />
              <path
                d="M 16,42 C 56,20 76,-12 52,-42"
                fill="none"
                stroke="#1E293B"
                strokeWidth={18}
              />
              <path
                d="M 16,42 C 56,20 76,-12 52,-42"
                fill="none"
                stroke="#FDE047"
                strokeWidth={11}
                strokeDasharray="12 12"
              />
            </g>

            <text x={251} y={368} textAnchor="middle" fill="#92400E" fontSize={21} fontWeight={900}>
              Giấu 6 xúc tu, thò 2 tay sọc đen-vàng
            </text>
            <text x={251} y={404} textAnchor="middle" fill="#475569" fontSize={18} fontWeight={700}>
              Đóng giả loài rắn biển cực độc!
            </text>
          </g>

          {/* Bottom caption pill cleanly separated by 92px >= 50px below cards */}
          <OctoContrastBadge
            x={960}
            y={738}
            w={980}
            h={48}
            text="Thông minh chọn đúng vai diễn khắc chế từng kẻ săn mồi trước mặt!"
            variant="solidTeal"
            fontSize={21}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_13: OCTO_ENERGY_COST (Beats 38–39, steps 0, 1)
 *   - Step 0: 2-Bar Energy Chart (baseline y=574, labels y=612, bottom caption y=738 => 164px >= 50px clear!)
 *   - Step 1: Resting pale CuteOctopus inside rocky cave + green battery "Chế độ tiết kiệm năng lượng"
 * ========================================================================== */
export const OctoEnergyCostVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const barGrow = interpolate(frame, [4, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const restBarH = Math.round(256 * barGrow);
  const camoBarH = Math.round(244 * barGrow);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop
        tone={activeStep === 0 ? 'CORAL' : 'MINT'}
        gradId="octo13_bg"
        cardBorder={activeStep === 0 ? '#EA580C' : '#059669'}
      />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Cái giá của phép tàng hình: Siêu tốn năng lượng!'
            : 'Chiến thuật tiết kiệm pin: Thả lỏng cơ da khi vào hang an toàn!'
        }
        bg="#FFFFFF"
        color={activeStep === 0 ? '#C2410C' : '#065F46'}
        border={activeStep === 0 ? '#EA580C' : '#059669'}
        fontSize={29}
      />

      {activeStep === 0 ? (
        <g>
          {/* Clean Chart Area (y=198..645, baseline at y=572 -> 166px clear above y=738 caption!) */}
          <rect x={185} y={196} width={1550} height={464} rx={28} fill="#FFFBEB" stroke="#F59E0B" strokeWidth={3.5} />

          {/* Grid lines */}
          {[292, 385, 478].map((gy) => (
            <line key={gy} x1={290} y1={gy} x2={1610} y2={gy} stroke="#E2E8F0" strokeWidth={2.5} strokeDasharray="10 8" />
          ))}

          {/* Y & X Axes */}
          <line x1={290} y1={246} x2={290} y2={572} stroke="#475569" strokeWidth={4} strokeLinecap="round" />
          <line x1={290} y1={572} x2={1610} y2={572} stroke="#475569" strokeWidth={4.5} strokeLinecap="round" />

          <text x={244} y={266} textAnchor="middle" fill="#475569" fontSize={19} fontWeight={900}>
            Năng lượng
          </text>

          {/* Bar 1: Cơ thể nghỉ ngơi */}
          <rect
            x={475}
            y={572 - restBarH}
            width={260}
            height={restBarH}
            rx={18}
            fill="#0EA5E9"
            stroke={INK}
            strokeWidth={3.5}
          />
          <text x={605} y={554 - restBarH} textAnchor="middle" fill="#0369A1" fontSize={23} fontWeight={900}>
            ~100% mức nghỉ ngơi
          </text>
          <text x={605} y={616} textAnchor="middle" fill="#0F172A" fontSize={23} fontWeight={900}>
            Cơ thể nghỉ ngơi
          </text>

          {/* Center ≈ Comparison Pill */}
          <g transform="translate(950, 420)">
            <circle cx={0} cy={0} r={44} fill="#FEF08A" stroke={INK} strokeWidth={3.8} />
            <text x={0} y={12} textAnchor="middle" fill={INK} fontSize={38} fontWeight={900}>
              ≈
            </text>
          </g>

          {/* Bar 2: Bật chế độ đổi màu */}
          <rect
            x={1165}
            y={572 - camoBarH}
            width={260}
            height={camoBarH}
            rx={18}
            fill="#EF4444"
            stroke={INK}
            strokeWidth={3.5}
          />
          <text x={1295} y={554 - camoBarH} textAnchor="middle" fill="#B91C1C" fontSize={23} fontWeight={900}>
            Tốn gần ngang cả cơ thể!
          </text>
          <text x={1295} y={616} textAnchor="middle" fill="#991B1B" fontSize={23} fontWeight={900}>
            Bật chế độ đổi màu
          </text>

          {/* Low battery icon beside Bar 2 */}
          <g transform="translate(1515, 365)">
            <rect x={-36} y={-56} width={72} height={112} rx={12} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />
            <rect x={-16} y={-68} width={32} height={12} rx={4} fill="#64748B" stroke={INK} strokeWidth={3} />
            <rect x={-26} y={24} width={52} height={22} rx={5} fill="#DC2626" />
            <text x={0} y={84} textAnchor="middle" fill="#DC2626" fontSize={18} fontWeight={900}>
              Hao pin!
            </text>
          </g>

          {/* Bottom caption pill cleanly at y=738 (166px clear of baseline y=572!) */}
          <OctoContrastBadge
            x={960}
            y={738}
            w={980}
            h={50}
            text="Kéo căng hàng triệu sợi cơ quanh túi sắc tố tiêu tốn năng lượng cực lớn!"
            variant="softRed"
            fontSize={21}
          />
        </g>
      ) : (
        /* Step 1: Safe Cave Power-Saving Mode */
        <g>
          {/* Left Cave Scene */}
          <g transform="translate(185, 200)">
            <rect x={0} y={0} width={845} height={536} rx={28} fill="#E0F2FE" stroke="#0284C7" strokeWidth={4} />
            {/* Dark cozy stone cave arch */}
            <path
              d="M 96,464 C 96,170 250,114 422,114 C 594,114 748,170 748,464 Z"
              fill="#64748B"
              stroke={INK}
              strokeWidth={4.5}
            />
            <path
              d="M 164,464 C 164,234 278,186 422,186 C 566,186 680,234 680,464 Z"
              fill="#1E293B"
              stroke={INK}
              strokeWidth={3.5}
            />
            <rect x={44} y={454} width={757} height={50} rx={16} fill="#FDE68A" stroke="#D97706" strokeWidth={3} />

            {/* Pale relaxed CuteOctopus resting comfortably inside cave */}
            <CuteOctopus
              x={422}
              y={452}
              scale={1.32}
              frame={frame}
              pose="crawl"
              emotion="sleepy"
              colorOverride={{ main: '#E2E8F0', belly: '#F8FAFC', spot: '#94A3B8' }}
            />
            <text x={422} y={76} textAnchor="middle" fill="#0369A1" fontSize={25} fontWeight={900}>
              Hang đá an toàn ban đêm
            </text>
          </g>

          {/* Right Green Battery Saver Panel */}
          <g transform="translate(1075, 200)">
            <rect x={0} y={0} width={660} height={536} rx={28} fill="#F0FDF4" stroke="#15803D" strokeWidth={4.5} />

            {/* Full Green Battery Icon */}
            <g transform="translate(330, 148)">
              <rect x={-96} y={-44} width={182} height={88} rx={16} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
              <rect x={86} y={-18} width={16} height={36} rx={5} fill="#15803D" stroke={INK} strokeWidth={3} />
              <rect x={-82} y={-30} width={34} height={60} rx={7} fill="#22C55E" />
              <rect x={-40} y={-30} width={34} height={60} rx={7} fill="#22C55E" />
              <rect x={2} y={-30} width={34} height={60} rx={7} fill="#22C55E" />
              <rect x={44} y={-30} width={30} height={60} rx={7} fill="#4ADE80" />
            </g>

            <OctoContrastBadge
              x={330}
              y={264}
              w={520}
              h={54}
              text="Chế độ tiết kiệm năng lượng"
              variant="solidGreen"
              fontSize={23}
            />

            <rect x={42} y={322} width={576} height={176} rx={20} fill="#FFFFFF" stroke="#86EFAC" strokeWidth={3} />
            <text x={330} y={374} textAnchor="middle" fill="#14532D" fontSize={22} fontWeight={900}>
              • Thả lỏng toàn bộ cơ túi sắc tố về màu nhạt
            </text>
            <text x={330} y={422} textAnchor="middle" fill="#334155" fontSize={21} fontWeight={700}>
              • Giảm tiêu hao năng lượng khi không có kẻ thù
            </text>
            <text x={330} y={468} textAnchor="middle" fill="#15803D" fontSize={21} fontWeight={800}>
              • Tích trữ sức cho lần săn mồi tiếp theo!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_14: OCTO_HUMAN_TECH (Beats 40–42, steps 0, 1, 2)
 *   - Step 0: Da bạch tuộc -> Da nhân tạo thông minh (chip + elastic multi-layer skin)
 *   - Step 1: 2 apps: Robot mềm thám hiểm biển & Màn hình điện tử dẻo siêu tiết kiệm điện
 *   - Step 2: Green coral reef protection hero card "Giữ biển sạch • Bảo vệ rạn san hô"
 * ========================================================================== */
export const OctoHumanTechVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop
        tone={activeStep === 2 ? 'FOREST' : 'OCEAN'}
        gradId="octo14_bg"
        cardBorder={activeStep === 2 ? '#15803D' : '#0284C7'}
      />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Cảm hứng từ đại dương: Chế tạo da nhân tạo thông minh!'
            : activeStep === 1
              ? 'Ứng dụng tương lai: Robot mềm & Màn hình dẻo tiết kiệm điện'
              : 'Bảo vệ rạn san hô sạch đẹp chính là bảo vệ ngôi nhà bạch tuộc!'
        }
        bg={activeStep === 2 ? '#15803D' : '#FFFFFF'}
        color={activeStep === 2 ? '#FFFFFF' : '#0369A1'}
        border={activeStep === 2 ? '#14532D' : '#0284C7'}
        fontSize={29}
      />

      {activeStep === 0 && (
        <g>
          {/* Left: Octopus Biological Skin */}
          <g transform="translate(185, 204)">
            <rect x={0} y={0} width={630} height={520} rx={28} fill="#FFF7ED" stroke="#EA580C" strokeWidth={4} />
            <text x={315} y={54} textAnchor="middle" fill="#C2410C" fontSize={27} fontWeight={900}>
              Làn da bạch tuộc tự nhiên
            </text>
            <circle cx={315} cy={246} r={136} fill="#FFEDD5" stroke="#FB923C" strokeWidth={3.5} />
            <CuteOctopus x={315} y={340} scale={1.25} frame={frame} pose="wave" emotion="happy" papillaeBumps={true} />
            <OctoContrastBadge x={315} y={454} w={470} h={46} text="Tự đổi màu + tạo gai sần theo ánh sáng" variant="softAmber" fontSize={19} />
          </g>

          {/* Center Arrow */}
          <g transform="translate(960, 464)">
            <path d="M -98,0 L 66,0" fill="none" stroke="#0284C7" strokeWidth={12} strokeLinecap="round" />
            <polygon points="98,0 56,-26 56,26" fill="#0284C7" />
            <text x={0} y={-34} textAnchor="middle" fill="#0369A1" fontSize={21} fontWeight={900}>
              Mô phỏng sinh học
            </text>
          </g>

          {/* Right: Smart Artificial Material Skin */}
          <g transform="translate(1105, 204)">
            <rect x={0} y={0} width={630} height={520} rx={28} fill="#F0F9FF" stroke="#0284C7" strokeWidth={4.5} />
            <text x={315} y={54} textAnchor="middle" fill="#0369A1" fontSize={27} fontWeight={900}>
              Da nhân tạo thông minh
            </text>

            {/* Layered flexible elastomer + embedded optical microchip */}
            <g transform="translate(315, 250)" stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
              <path d="M -185,48 Q -92,16 0,48 T 185,48 L 185,84 Q 92,52 0,84 T -185,84 Z" fill="#38BDF8" />
              <path d="M -185,10 Q -92,-22 0,10 T 185,10 L 185,48 Q 92,16 0,48 T -185,48 Z" fill="#14B8A6" />
              <path d="M -185,-26 Q -92,-58 0,-26 T 185,-26 L 185,10 Q 92,-22 0,10 T -185,10 Z" fill="#F59E0B" />
              {/* Microchip perched above */}
              <rect x={-48} y={-114} width={96} height={68} rx={14} fill="#1E293B" stroke="#38BDF8" strokeWidth={4} />
              <text x={0} y={-72} textAnchor="middle" fill="#7DD3FC" stroke="none" fontSize={21} fontWeight={900}>
                CHIP
              </text>
              <line x1={0} y1={-46} x2={0} y2={-18} stroke="#0284C7" strokeWidth={5} />
            </g>

            <OctoContrastBadge x={315} y={454} w={480} h={46} text="Vật liệu đàn hồi đổi màu & độ nhám 3D!" variant="solidBlue" fontSize={19} />
          </g>
        </g>
      )}

      {activeStep === 1 && (
        <g>
          {/* Left App Card: Soft Ocean Exploration Robot */}
          <g transform="translate(175, 200)">
            <rect x={0} y={0} width={735} height={536} rx={28} fill="#ECFDF5" stroke="#0D9488" strokeWidth={4.5} />
            <text x={368} y={54} textAnchor="middle" fill="#0F766E" fontSize={27} fontWeight={900}>
              1. Robot mềm thám hiểm đại dương
            </text>

            {/* Clean soft silicone underwater exploration robot */}
            <g transform="translate(368, 245)" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
              <rect x={-260} y={-124} width={520} height={242} rx={24} fill="#BAE6FD" stroke="#0284C7" strokeWidth={3} />
              {/* Soft silicone tentacles */}
              <path d="M -60,24 C -96,52 -118,86 -82,92" fill="none" stroke="#14B8A6" strokeWidth={16} />
              <path d="M -20,30 C -34,68 -24,96 -6,96" fill="none" stroke="#14B8A6" strokeWidth={16} />
              <path d="M 20,30 C 34,68 24,96 6,96" fill="none" stroke="#14B8A6" strokeWidth={16} />
              <path d="M 60,24 C 96,52 118,86 82,92" fill="none" stroke="#14B8A6" strokeWidth={16} />
              {/* Soft dome head with camera lens */}
              <path d="M -76,28 C -78,-58 78,-58 76,28 Z" fill="#2DD4BF" />
              <circle cx={0} cy={-10} r={24} fill="#0F172A" stroke="#FFFFFF" strokeWidth={4} />
              <circle cx={0} cy={-10} r={10} fill="#38BDF8" stroke="none" />
              <circle cx={-5} cy={-15} r={4} fill="#FFFFFF" stroke="none" />
            </g>

            <OctoContrastBadge x={368} y={442} w={540} h={48} text="Bơi êm ái, không làm tổn thương san hô!" variant="solidTeal" fontSize={20} />
            <text x={368} y={504} textAnchor="middle" fill="#334155" fontSize={19} fontWeight={800}>
              Lách qua khe đá hẹp nghiên cứu sinh vật biển an toàn
            </text>
          </g>

          {/* Right App Card: Ultra-Low-Power Flexible Display */}
          <g transform="translate(1010, 200)">
            <rect x={0} y={0} width={735} height={536} rx={28} fill="#F0F9FF" stroke="#0284C7" strokeWidth={4.5} />
            <text x={368} y={54} textAnchor="middle" fill="#0369A1" fontSize={27} fontWeight={900}>
              2. Màn hình dẻo siêu tiết kiệm điện
            </text>

            {/* Clean curved flexible reflective screen */}
            <g transform="translate(368, 245)" stroke={INK} strokeWidth={3.8} strokeLinejoin="round">
              <path
                d="M -220,-90 Q 0,-138 220,-90 L 220,92 Q 0,44 -220,92 Z"
                fill="#FFFFFF"
                stroke="#0284C7"
                strokeWidth={7}
              />
              {/* Vivid reflective RGB tiles on flexible screen */}
              <rect x={-162} y={-52} width={96} height={86} rx={14} fill="#F59E0B" />
              <rect x={-48} y={-62} width={96} height={86} rx={14} fill="#10B981" />
              <rect x={66} y={-52} width={96} height={86} rx={14} fill="#38BDF8" />
              <text x={0} y={64} textAnchor="middle" fill="#0369A1" stroke="none" fontSize={20} fontWeight={900}>
                Phản chiếu ánh sáng tự nhiên — không cần đèn nền!
              </text>
            </g>

            <OctoContrastBadge x={368} y={442} w={540} h={48} text="Uốn cong mềm mại • Dùng ít điện cực kỳ!" variant="solidBlue" fontSize={20} />
            <text x={368} y={504} textAnchor="middle" fill="#334155" fontSize={19} fontWeight={800}>
              Học hỏi tầng phản quang &amp; phản xạ trắng dưới da bạch tuộc
            </text>
          </g>
        </g>
      )}

      {activeStep === 2 && (
        /* Step 2: Coral Reef Protection Green Hero Card */
        <g>
          <rect x={185} y={198} width={1550} height={542} rx={30} fill="#F0FDF4" stroke="#15803D" strokeWidth={5} />

          {/* Left Clean Vibrant Coral Reef Scene */}
          <g transform="translate(232, 242)">
            <rect x={0} y={0} width={720} height={454} rx={24} fill="#BAE6FD" stroke="#0284C7" strokeWidth={3.5} />
            {/* Crystal sunrays */}
            <polygon points="140,0 240,0 180,454 60,454" fill="#FFFFFF" opacity={0.32} />
            <polygon points="430,0 530,0 470,454 350,454" fill="#FFFFFF" opacity={0.28} />
            {/* Clean bright sand */}
            <path d="M 0,368 Q 360,334 720,368 L 720,454 L 0,454 Z" fill="#FDE68A" />
            {/* Colorful healthy corals */}
            <path d="M 96,390 C 86,326 62,286 84,270 C 102,258 118,296 124,334 C 134,292 158,274 170,292 C 180,310 156,348 148,390 Z" fill="#F472B6" stroke={INK} strokeWidth={3.5} />
            <path d="M 548,396 C 542,334 568,286 592,284 C 612,282 612,324 600,352 C 626,318 652,312 660,334 C 668,354 634,378 614,396 Z" fill="#F59E0B" stroke={INK} strokeWidth={3.5} />
            <CuteOctopus x={360} y={376} scale={1.25} frame={frame} pose="wave" emotion="happy" />
          </g>

          {/* Right Conservation Message & Green Tick */}
          <g transform="translate(1000, 250)">
            <OctoCheckCircle cx={345} cy={52} r={42} bg="#15803D" />
            <OctoContrastBadge
              x={345}
              y={144}
              w={630}
              h={62}
              text="Giữ biển sạch • Bảo vệ rạn san hô"
              variant="solidGreen"
              fontSize={26}
            />
            <rect x={28} y={204} width={634} height={230} rx={22} fill="#FFFFFF" stroke="#86EFAC" strokeWidth={3.2} />
            <text x={345} y={258} textAnchor="middle" fill="#14532D" fontSize={23} fontWeight={900}>
              Vì sao rạn san hô quan trọng?
            </text>
            <text x={345} y={306} textAnchor="middle" fill="#334155" fontSize={21} fontWeight={700}>
              • Là nơi trú ẩn và săn mồi của hàng nghìn loài biển
            </text>
            <text x={345} y={352} textAnchor="middle" fill="#334155" fontSize={21} fontWeight={700}>
              • Không xả rác nhựa giúp đại dương luôn trong xanh
            </text>
            <text x={345} y={400} textAnchor="middle" fill="#15803D" fontSize={22} fontWeight={900}>
              Bảo vệ biển sạch là giữ nhà cho bậc thầy tàng hình!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * SVG_15: OCTO_QUICK_QUIZ (Beats 47–49, steps 0, 1, 2)
 *   - Nature Field Board quiz framed cleanly inside y=170..750
 *   - CuteOctopus (curious -> proud) on left, question & A/B/C on right
 *   - Step 2 lights up B ("Đồng tử tán sắc & da cảm biến ánh sáng") + "✓ CHÍNH XÁC!"
 * ========================================================================== */
export const OctoQuickQuizVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const isRevealed = activeStep >= 2;

  const options = [
    { key: 'A', label: 'A. Ngửi mùi nước biển', correct: false },
    { key: 'B', label: 'B. Đồng tử tán sắc & da cảm biến ánh sáng', correct: true },
    { key: 'C', label: 'C. Nghe âm thanh sóng biển', correct: false },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="FOREST" gradId="octo15_bg" showMainCard={false} />
      <OctoCleanLabel
        x={960}
        y={84}
        text={
          isRevealed
            ? 'ĐÁP ÁN CHÍNH XÁC: B — ĐỒNG TỬ TÁN SẮC & DA CẢM BIẾN!'
            : 'ĐỐ VUI ĐẠI DƯƠNG • KIỂM TRA TRÍ NHỚ SIÊU TỐC!'
        }
        bg="#15803D"
        color="#FFFFFF"
        border="#14532D"
        fontSize={29}
      />

      {/* Nature Field Board Frame locked neatly inside y=170..750 */}
      <rect x={140} y={170} width={1640} height={580} rx={30} fill="#FFFBEB" stroke="#B45309" strokeWidth={12} />
      <rect x={140} y={170} width={1640} height={580} rx={30} fill="none" stroke={INK} strokeWidth={3.5} />

      {/* Deep green quiz header strip inside board */}
      <rect x={196} y={194} width={1528} height={50} rx={14} fill="#15803D" stroke="#14532D" strokeWidth={2.6} />
      <text x={960} y={227} textAnchor="middle" fill="#FFFFFF" fontSize={23} fontWeight={900}>
        SỔ TAY THIÊN NHIÊN • CÂU HỎI KHÁM PHÁ BẠCH TUỘC TÀNG HÌNH
      </text>

      {/* Left Mascot Column */}
      <g transform="translate(200, 268)">
        <rect x={0} y={0} width={410} height={446} rx={24} fill="#ECFDF5" stroke="#16A34A" strokeWidth={3.5} />
        <circle cx={205} cy={196} r={134} fill="#DCFCE7" stroke="#22C55E" strokeWidth={3} />
        <CuteOctopus
          x={205}
          y={292}
          scale={1.22}
          frame={frame}
          pose={isRevealed ? 'wave' : 'float'}
          emotion={isRevealed ? 'proud' : 'curious'}
        />
        <OctoContrastBadge
          x={205}
          y={394}
          w={330}
          h={46}
          text={isRevealed ? 'Tuyệt vời quá bạn ơi!' : 'Bạn chọn đáp án nào?'}
          variant={isRevealed ? 'solidGreen' : 'softAmber'}
          fontSize={20}
        />
      </g>

      {/* Right Question & Options Column */}
      <g transform="translate(646, 268)">
        {/* Question Box */}
        <rect x={0} y={0} width={1074} height={110} rx={20} fill="#FFFFFF" stroke="#0284C7" strokeWidth={3.8} />
        <text x={537} y={46} textAnchor="middle" fill="#0F172A" fontSize={25} fontWeight={900}>
          Điều gì giúp bạch tuộc nhận biết màu sắc chuẩn xác
        </text>
        <text x={537} y={84} textAnchor="middle" fill="#0369A1" fontSize={25} fontWeight={900}>
          dù đôi mắt của nó bị mù màu?
        </text>

        {activeStep === 0 ? (
          <g transform="translate(0, 140)">
            <rect x={0} y={0} width={1074} height={306} rx={24} fill="#F0FDF4" stroke="#86EFAC" strokeWidth={3.5} strokeDasharray="14 10" />
            <text x={537} y={136} textAnchor="middle" fill="#15803D" fontSize={32} fontWeight={900}>
              Sẵn sàng thử trí nhớ sau 46 beat khám phá nhé!
            </text>
            <text x={537} y={188} textAnchor="middle" fill="#475569" fontSize={23} fontWeight={800}>
              3 lựa chọn A • B • C sẽ bật ngay ở bước tiếp theo...
            </text>
          </g>
        ) : (
          <g transform="translate(0, 134)">
            {options.map((opt, idx) => {
              const rowY = idx * 106;
              const isRightReveal = isRevealed && opt.correct;
              const isDimmed = isRevealed && !opt.correct;
              return (
                <g key={opt.key} transform={`translate(0, ${rowY})`} opacity={isDimmed ? 0.42 : 1}>
                  <rect
                    x={0}
                    y={0}
                    width={1074}
                    height={88}
                    rx={20}
                    fill={isRightReveal ? '#DCFCE7' : '#FFFFFF'}
                    stroke={isRightReveal ? '#15803D' : '#CBD5E1'}
                    strokeWidth={isRightReveal ? 5.5 : 3.2}
                  />
                  <text
                    x={42}
                    y={54}
                    fill={isRightReveal ? '#14532D' : '#0F172A'}
                    fontSize={25}
                    fontWeight={900}
                  >
                    {opt.label}
                  </text>
                  {isRightReveal && (
                    <g transform="translate(918, 44)">
                      <rect x={-124} y={-24} width={248} height={48} rx={24} fill="#15803D" stroke="#14532D" strokeWidth={2.5} />
                      <text x={0} y={8} textAnchor="middle" fill="#FFFFFF" fontSize={22} fontWeight={900}>
                        ✓ CHÍNH XÁC!
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}
      </g>
    </svg>
  );
};

/* ============================================================================
 * SVG_16: OCTO_SUMMARY_3_CARDS (Beats 53–55, steps 0, 1, 2)
 *   - Title: "TÓM TẮT 3 ĐIỀU CẦN NHỚ"
 *   - Progressive reveal synced 1-to-1 with narration:
 *     step 0 -> Card 1 ("1. Màn hình da 3 lớp")
 *     step 1 -> Card 1 + Card 2 ("2. Điêu khắc nhú da 3D")
 *     step 2 -> All 3 Cards ("3. Mắt chữ U & Da cảm biến")
 * ========================================================================== */
export const OctoSummary3CardsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const popScale = interpolate(frame, [0, 14], [0.94, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const cards = [
    {
      idx: 0,
      x: 168,
      title: '1. Màn hình da 3 lớp',
      badge: 'Đổi màu chỉ ~0,2 giây',
      line1: 'Túi sắc tố + Tế bào phản quang',
      line2: '+ Tầng gương phản xạ trắng',
      bg: '#FFF7ED',
      border: '#EA580C',
      titleColor: '#C2410C',
      variant: 'softAmber' as const,
    },
    {
      idx: 1,
      x: 709,
      title: '2. Điêu khắc nhú da 3D',
      badge: 'Giả kết cấu san hô & đá',
      line1: 'Hàng nghìn nhú cơ tự phồng gai',
      line2: 'hòa vào địa hình ba chiều!',
      bg: '#ECFDF5',
      border: '#0D9488',
      titleColor: '#0F766E',
      variant: 'solidTeal' as const,
    },
    {
      idx: 2,
      x: 1250,
      title: '3. Mắt chữ U & Da cảm biến',
      badge: 'Đoán màu nhờ tán sắc',
      line1: 'Biến lỗi quang học thành máy đo',
      line2: 'cùng cảm biến ánh sáng trên da!',
      bg: '#EFF6FF',
      border: '#0284C7',
      titleColor: '#0369A1',
      variant: 'solidBlue' as const,
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <OctoStageCardBackdrop tone="FOREST" gradId="octo16_bg" cardBorder="#15803D" />
      <OctoCleanLabel
        x={960}
        y={84}
        text="TÓM TẮT 3 ĐIỀU CẦN NHỚ • BÍ MẬT BẠCH TUỘC TÀNG HÌNH"
        bg="#15803D"
        color="#FFFFFF"
        border="#14532D"
        fontSize={30}
      />

      {cards.map((c) => {
        const isShown = activeStep >= c.idx;
        const isCurrent = activeStep === c.idx;
        const s = isCurrent ? popScale : 1;

        return (
          <g key={c.idx} transform={`translate(${c.x + 251}, 468) scale(${s.toFixed(3)}) translate(-251, -264)`}>
            {isShown ? (
              <g>
                <rect
                  x={0}
                  y={0}
                  width={502}
                  height={528}
                  rx={28}
                  fill={c.bg}
                  stroke={c.border}
                  strokeWidth={isCurrent ? 5.5 : 4}
                />
                {/* Check badge top-right */}
                <OctoCheckCircle cx={456} cy={46} r={22} bg="#15803D" />

                <text x={251} y={56} textAnchor="middle" fill={c.titleColor} fontSize={25} fontWeight={900}>
                  {c.title}
                </text>

                {/* Custom crisp vector emblem per card */}
                <g transform="translate(251, 210)">
                  <circle cx={0} cy={0} r={108} fill="#FFFFFF" stroke={c.border} strokeWidth={3.5} />
                  {c.idx === 0 && (
                    /* 3 Skin Layers Emblem */
                    <g stroke={INK} strokeWidth={3}>
                      <rect x={-72} y={-58} width={144} height={32} rx={10} fill="#FB923C" />
                      <circle cx={-36} cy={-42} r={8} fill="#FDE047" />
                      <circle cx={0} cy={-42} r={8} fill="#EF4444" />
                      <circle cx={36} cy={-42} r={8} fill="#78350F" />
                      <rect x={-72} y={-16} width={144} height={32} rx={10} fill="#2DD4BF" />
                      <rect x={-72} y={26} width={144} height={32} rx={10} fill="#F8FAFC" />
                    </g>
                  )}
                  {c.idx === 1 && (
                    /* 3D Papillae Coral Bumps Emblem */
                    <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
                      <path
                        d="M -78,44 C -68,-6 -50,-48 -36,-10 C -22,-58 0,-64 12,-14 C 28,-54 52,-44 62,-4 C 72,14 78,30 78,44 Z"
                        fill="#14B8A6"
                      />
                      <path d="M -52,44 L 52,44" stroke="#0F766E" strokeWidth={5} />
                      <text x={0} y={76} textAnchor="middle" fill="#0F766E" stroke="none" fontSize={20} fontWeight={900}>
                        3D TEXTURE
                      </text>
                    </g>
                  )}
                  {c.idx === 2 && (
                    /* U-Shaped Pupil + Prism Spectrum Emblem */
                    <g stroke={INK} strokeWidth={3.2}>
                      <ellipse cx={0} cy={-6} rx={72} ry={56} fill="#FEF3C7" />
                      <path
                        d="M -36,-22 C -36,24 36,24 36,-22 L 16,-22 C 16,2 -16,2 -16,-22 Z"
                        fill="#0F172A"
                      />
                      {/* RGB prism bars underneath */}
                      <rect x={-48} y={56} width={28} height={14} rx={5} fill="#EF4444" stroke="none" />
                      <rect x={-14} y={56} width={28} height={14} rx={5} fill="#22C55E" stroke="none" />
                      <rect x={20} y={56} width={28} height={14} rx={5} fill="#3B82F6" stroke="none" />
                    </g>
                  )}
                </g>

                <OctoContrastBadge x={251} y={368} w={420} h={48} text={c.badge} variant={c.variant} fontSize={21} />

                <text x={251} y={442} textAnchor="middle" fill="#0F172A" fontSize={20} fontWeight={800}>
                  {c.line1}
                </text>
                <text x={251} y={476} textAnchor="middle" fill="#475569" fontSize={20} fontWeight={800}>
                  {c.line2}
                </text>
              </g>
            ) : (
              /* Pending subtle card slot */
              <g opacity={0.34}>
                <rect x={0} y={0} width={502} height={528} rx={28} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={3.5} strokeDasharray="14 10" />
                <text x={251} y={268} textAnchor="middle" fill="#64748B" fontSize={26} fontWeight={900}>
                  Bí mật số {c.idx + 1}...
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
