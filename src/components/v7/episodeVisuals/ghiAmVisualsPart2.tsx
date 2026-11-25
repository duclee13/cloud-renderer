import React from 'react';
import type { EpisodeVisualProps } from './index';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  CleanLabel,
  ShortSpeechBubble,
  WoodenTable,
  WoodenChair,
  SmartphoneProp,
  StudioMicOnStand,
  SharedStickman,
  CountrysideYardBackdrop,
  CountrysidePorchBackdrop,
} from './ghiAmSharedAssets';

/* ============================================================================
 * 9. GHIAM_SELF_IMAGE_EXPECTATION (b37–b40, steps 0, 1, 2, 3)
 *    - Step 0: BOY worries his voice sounds childish/thin.
 *    - Step 1: 2 friends listening to smartphone on wooden table nod approvingly.
 *    - Step 2: Balance scale comparing "Tự chê quá gắt" vs "Người ngoài thấy dễ nghe".
 *    - Step 3: BOY exhaling happily in relief with calm green sparkles.
 * ========================================================================== */
export const GhiAmSelfImageExpectationVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);
  const scaleTilt = lerp(-12, 10, clamp01(p * 1.4));
  const calmFade = clamp01(p * 1.6);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga9_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#ecfdf5" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga9_bg)" />

      {/* Grounded Floor at y = 795 <= 830 */}
      <rect x="0" y="795" width="1920" height="285" fill="#bbf7d0" opacity="0.45" />
      <line x1="0" y1="795" x2="1920" y2="795" stroke="#86efac" strokeWidth="4" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Bạn hay tự chê giọng mình nghe hơi trẻ con'
            : activeStep === 1
              ? 'Nhưng người ngoài lại thấy rất dễ nghe!'
              : activeStep === 2
                ? 'Não bộ tự chấm điểm quá khắt khe'
                : 'Giọng thật của bạn hoàn toàn bình thường'
        }
        bg="#ffffff"
        color="#065f46"
        border="#10b981"
        fontSize={31}
      />

      {/* STEP 0: BOY worriedly imagining a thin voice */}
      {activeStep === 0 && (
        <g>
          <SharedStickman x={760} y={679} scale={1.04} role="BOY" facing="RIGHT" pose="IDLE" expression="WORRIED" frame={frame} />
          <g transform="translate(1190, 390)">
            <circle cx="-235" cy="95" r="12" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
            <circle cx="-195" cy="65" r="18" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
            <rect x="-175" y="-108" width="440" height="215" rx="44" fill="#ffffff" stroke="#94a3b8" strokeWidth="4.5" />
            <path d="M -115 -14 Q -95 -42 -75 -14 T -35 -14 T 5 -14 T 45 -14 T 85 -14 T 125 -14 T 165 -14" fill="none" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" />
            <text x="45" y="64" textAnchor="middle" fill="#64748b" fontSize="26" fontWeight="800">
              Nghe mỏng &amp; trẻ con quá?
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: 2 Friends listening to phone on wooden table nodding warmly */}
      {activeStep === 1 && (
        <g>
          <WoodenTable x={560} topY={665} floorY={795} width={250} />
          <SmartphoneProp x={560} y={665} scale={1.18} mode="PLAYING" flatOnTable={true} frame={frame} />
          <SharedStickman x={1060} y={679} scale={1.04} role="FRIEND_A" facing="LEFT" pose="NOD_SMILE" expression="HAPPY" frame={frame} />
          <SharedStickman x={1350} y={679} scale={1.04} role="FRIEND_B" facing="LEFT" pose="NOD_SMILE" expression="PROUD" frame={frame + 12} />
          <ShortSpeechBubble x={1205} y={445} text="Giọng dễ nghe mà!" tailDir="CENTER" />
        </g>
      )}

      {/* STEP 2: Grounded Balance Scale */}
      {activeStep === 2 && (
        <g transform="translate(960, 795)">
          {/* Heavy Base resting squarely on floor y = 795 */}
          <path d="M -150 0 L -115 -34 L 115 -34 L 150 0 Z" fill="#475569" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
          <rect x="-14" y="-445" width="28" height="412" rx="8" fill="#64748b" stroke={INK} strokeWidth="4.5" />
          <circle cx="0" cy="-445" r="22" fill="#f59e0b" stroke={INK} strokeWidth="4.5" />

          {/* Tilting Scale Beam */}
          <g transform={`translate(0, -445) rotate(${scaleTilt})`}>
            <rect x="-390" y="-12" width="780" height="24" rx="12" fill="#334155" stroke={INK} strokeWidth="4" />

            {/* Left Pan: Tự chê quá gắt */}
            <g transform={`translate(-340, 0) rotate(${-scaleTilt})`}>
              <line x1="0" y1="0" x2="-85" y2="145" stroke="#64748b" strokeWidth="4" />
              <line x1="0" y1="0" x2="85" y2="145" stroke="#64748b" strokeWidth="4" />
              <path d="M -115 145 L 115 145 Q 95 190 0 190 Q -95 190 -115 145 Z" fill="#fecaca" stroke="#ef4444" strokeWidth="4.5" />
              <rect x="-145" y="64" width="290" height="72" rx="18" fill="#ffffff" stroke="#ef4444" strokeWidth="4" />
              <text x="0" y="109" textAnchor="middle" fill="#b91c1c" fontSize="25" fontWeight="800">
                Tự chê quá gắt
              </text>
            </g>

            {/* Right Pan: Người ngoài thấy dễ nghe */}
            <g transform={`translate(340, 0) rotate(${-scaleTilt})`}>
              <line x1="0" y1="0" x2="-85" y2="145" stroke="#64748b" strokeWidth="4" />
              <line x1="0" y1="0" x2="85" y2="145" stroke="#64748b" strokeWidth="4" />
              <path d="M -115 145 L 115 145 Q 95 190 0 190 Q -95 190 -115 145 Z" fill="#bbf7d0" stroke="#10b981" strokeWidth="4.5" />
              <rect x="-165" y="64" width="330" height="72" rx="18" fill="#ffffff" stroke="#10b981" strokeWidth="4" />
              <text x="0" y="109" textAnchor="middle" fill="#065f46" fontSize="24" fontWeight="800">
                Người ngoài thấy dễ nghe
              </text>
            </g>
          </g>
        </g>
      )}

      {/* STEP 3: BOY exhaling happily in relief */}
      {activeStep === 3 && (
        <g>
          <circle cx="960" cy="535" r={175 + calmFade * 55} fill="#86efac" opacity={0.28 * calmFade} />
          <SharedStickman x={960} y={679} scale={1.06} role="BOY" facing="RIGHT" pose="RELIEF_SIGH" expression="RELIEF" frame={frame} />
          <g opacity={calmFade}>
            {[
              { sx: 815, sy: 455, s: 1.0 },
              { sx: 1110, sy: 440, s: 1.1 },
              { sx: 1135, sy: 550, s: 0.85 },
            ].map((sp, idx) => (
              <g key={idx} transform={`translate(${sp.sx}, ${sp.sy}) scale(${sp.s * (0.85 + 0.2 * Math.sin(frame * 0.16 + idx))})`}>
                <path d="M 0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              </g>
            ))}
          </g>
          <ShortSpeechBubble x={715} y={425} text="Nhẹ cả người luôn!" tailDir="RIGHT" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 10. GHIAM_MIRROR_ANALOGY (b41–b44, steps 0, 1, 2, 3)
 *     - Step 0: BOY looking in wall mirror (hair parted RIGHT in reflection).
 *     - Step 1: BOY holding phone taking non-flipped photo (hair parted LEFT).
 *     - Step 2: BOY comparing mirror vs photo looking slightly unfamiliar.
 *     - Step 3: Friends & Grandpa seeing BOY directly — completely natural!
 * ========================================================================== */
export const GhiAmMirrorAnalogyVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga10_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga10_bg)" />
      <rect x="0" y="795" width="1920" height="285" fill="#cbd5e1" opacity="0.6" />
      <line x1="0" y1="795" x2="1920" y2="795" stroke="#94a3b8" strokeWidth="4" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Soi gương mỗi ngày: Hình ảnh đã bị lật trái – phải'
            : activeStep === 1
              ? 'Ảnh chụp thường giữ nguyên chiều thật'
              : activeStep === 2
                ? 'Mắt chưa quen nên bạn thấy ảnh mình hơi lạ'
                : 'Người ngoài nhìn trực tiếp lại thấy rất tự nhiên'
        }
        bg="#ffffff"
        color="#1e40af"
        border="#3b82f6"
        fontSize={31}
      />

      {/* STEP 0: Wall Mirror with RIGHT-parted familiar reflection */}
      {activeStep === 0 && (
        <g>
          <SharedStickman x={650} y={679} scale={1.04} role="BOY" facing="RIGHT" pose="IDLE" expression="HAPPY" hairPartSide="LEFT" frame={frame} />

          {/* Framed Wall Mirror */}
          <g transform="translate(1220, 445)">
            <rect x="-155" y="-245" width="310" height="445" rx="28" fill="#b45309" stroke={INK} strokeWidth="6" />
            <rect x="-134" y="-224" width="268" height="403" rx="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
            {/* Mirror glass sheen */}
            <polygon points="-120,-210 -45,-210 -120,-65" fill="#ffffff" opacity="0.45" />
            {/* Flipped portrait inside mirror: hair parted clearly on RIGHT */}
            <g transform="translate(0, -10)">
              <circle cx="0" cy="-42" r="58" fill="#ffffff" stroke={INK} strokeWidth="5" />
              <path d="M -54 -54 C -56 -96 -14 -110 18 -104 C 42 -100 58 -80 56 -54 C 44 -66 30 -76 22 -76 C 8 -60 -22 -58 -54 -54 Z" fill="#0f172a" />
              {/* Little part arrow showing right side */}
              <circle cx="-18" cy="-42" r="6" fill={INK} />
              <circle cx="18" cy="-42" r="6" fill={INK} />
              <path d="M -14 -14 Q 0 -2 14 -14" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            </g>
            <text x="0" y="138" textAnchor="middle" fill="#0369a1" fontSize="24" fontWeight="800">
              Gương soi (đã lật)
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: BOY holding phone taking non-flipped photo */}
      {activeStep === 1 && (
        <g>
          <SharedStickman x={620} y={679} scale={1.04} role="BOY" facing="RIGHT" pose="HOLD_PHONE_SELFIE" expression="CURIOUS" hairPartSide="LEFT" frame={frame} />

          {/* Crisp Photo Card showing unflipped LEFT-parted true view */}
          <g transform="translate(1240, 445)">
            <rect x="-165" y="-225" width="330" height="425" rx="22" fill="#ffffff" stroke={INK} strokeWidth="5" />
            <rect x="-138" y="-198" width="276" height="310" rx="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3.5" />
            <g transform="translate(0, -40)">
              <circle cx="0" cy="-22" r="58" fill="#ffffff" stroke={INK} strokeWidth="5" />
              <path d="M -56 -34 C -58 -60 -42 -80 -18 -84 C 14 -90 56 -76 54 -34 C 22 -38 -8 -40 -22 -56 C -30 -56 -44 -46 -56 -34 Z" fill="#0f172a" />
              <circle cx="-18" cy="-22" r="6" fill={INK} />
              <circle cx="18" cy="-22" r="6" fill={INK} />
              <path d="M -14 6 Q 0 18 14 6" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            </g>
            <text x="0" y="160" textAnchor="middle" fill="#b45309" fontSize="25" fontWeight="800">
              Ảnh chụp (chiều thật)
            </text>
          </g>
        </g>
      )}

      {/* STEP 2: Side-by-side comparison — BOY slightly embarrassed */}
      {activeStep === 2 && (
        <g>
          <SharedStickman x={540} y={679} scale={1.04} role="BOY" facing="RIGHT" pose="IDLE" expression="EMBARRASSED" frame={frame} />

          <g transform="translate(1030, 455)">
            <rect x="-145" y="-180" width="290" height="340" rx="22" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4.5" />
            <circle cx="0" cy="-35" r="54" fill="#ffffff" stroke={INK} strokeWidth="4.5" />
            <path d="M -50 -45 C -52 -84 -12 -96 16 -92 C 38 -88 52 -70 50 -45 C 38 -56 26 -64 20 -64 C 8 -50 -20 -48 -50 -45 Z" fill="#0f172a" />
            <circle cx="-16" cy="-35" r="5.5" fill={INK} />
            <circle cx="16" cy="-35" r="5.5" fill={INK} />
            <path d="M -12 -10 Q 0 2 12 -10" fill="none" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
            <text x="0" y="110" textAnchor="middle" fill="#0369a1" fontSize="24" fontWeight="800">
              Quen trong gương
            </text>
          </g>

          <text x="1255" y="468" textAnchor="middle" fill="#ef4444" fontSize="54" fontWeight="900">
            ↔
          </text>

          <g transform="translate(1480, 455)">
            <rect x="-145" y="-180" width="290" height="340" rx="22" fill="#fef3c7" stroke="#ea580c" strokeWidth="4.5" />
            <circle cx="0" cy="-35" r="54" fill="#ffffff" stroke={INK} strokeWidth="4.5" />
            <path d="M -50 -45 C -52 -70 -38 -88 -16 -92 C 12 -96 52 -84 50 -45 C 20 -48 -8 -50 -20 -64 C -26 -64 -38 -56 -50 -45 Z" fill="#0f172a" />
            <circle cx="-16" cy="-35" r="5.5" fill={INK} />
            <circle cx="16" cy="-35" r="5.5" fill={INK} />
            <path d="M -12 -10 Q 0 2 12 -10" fill="none" stroke={INK} strokeWidth="3.8" strokeLinecap="round" />
            <text x="0" y="110" textAnchor="middle" fill="#c2410c" fontSize="24" fontWeight="800">
              Chiều thật hơi lạ
            </text>
          </g>
        </g>
      )}

      {/* STEP 3: Friends & Grandpa looking at BOY directly — completely natural! */}
      {activeStep === 3 && (
        <g>
          <SharedStickman x={580} y={679} scale={1.04} role="BOY" facing="RIGHT" pose="NOD_SMILE" expression="HAPPY" frame={frame} />
          <SharedStickman x={1120} y={679} scale={1.04} role="FRIEND_A" facing="LEFT" pose="NOD_SMILE" expression="PROUD" frame={frame} />
          <SharedStickman x={1420} y={675} scale={1.08} role="GRANDPA" facing="LEFT" pose="NOD_SMILE" expression="PROUD" frame={frame + 10} />
          <ShortSpeechBubble x={1265} y={435} text="Hài hòa, tự nhiên!" tailDir="CENTER" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 11. GHIAM_EXPERIMENT_HANDS (b47–b50, steps 0, 1, 2, 3)
 *     - Two 5-second experiments!
 *     - Steps 0–1: BOY physically plugs both ears with fingertips → orange skull waves resonate strongly inside.
 *     - Steps 2–3: BOY holds 2 upright cardboard panels right in front of ears blocking direct waves & catching air reflection.
 * ========================================================================== */
export const GhiAmExperimentHandsVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga11_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#fef9c3" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga11_bg)" />
      <rect x="0" y="795" width="1920" height="285" fill="#fde68a" opacity="0.55" />
      <line x1="0" y1="795" x2="1920" y2="795" stroke="#f59e0b" strokeWidth="4" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Thí nghiệm 1 (5 giây): Bịt nhẹ hai lỗ tai rồi nói'
            : activeStep === 1
              ? 'Âm ù vang trầm đặc trong đầu = Truyền qua xương sọ!'
              : activeStep === 2
                ? 'Thí nghiệm 2: Dựng 2 tấm bìa ngay trước vành tai'
                : 'Chắn sóng trực tiếp → Nghe gần giống bản ghi âm!'
        }
        bg="#ffffff"
        color={activeStep <= 1 ? '#c2410c' : '#0369a1'}
        border={activeStep <= 1 ? '#ea580c' : '#0284c7'}
        fontSize={31}
      />

      {/* STEPS 0 & 1: BOY physically plugging both ears with fingers */}
      {activeStep <= 1 && (
        <g>
          {/* Resonating Orange Bone Waves inside head in Step 1 */}
          {activeStep === 1 &&
            [0, 1, 2].map((i) => {
              const r = 46 + ((frame * 2.2 + i * 32) % 96);
              return (
                <circle
                  key={i}
                  cx="760"
                  cy="515"
                  r={r}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="7"
                  opacity={1 - r / 145}
                />
              );
            })}

          <SharedStickman
            x={760}
            y={679}
            scale={1.08}
            role="BOY"
            facing="RIGHT"
            pose="PLUG_EARS"
            expression={activeStep === 1 ? 'SURPRISED' : 'CURIOUS'}
            frame={frame}
          />

          {/* Compact Explanatory Graphic Card on Right */}
          <g transform="translate(1150, 290)">
            <rect x="0" y="0" width="540" height="340" rx="30" fill="#ffffff" stroke="#ea580c" strokeWidth="4.5" />
            <circle cx="270" cy="112" r="62" fill="#ffedd5" stroke="#ea580c" strokeWidth="4" />
            <path d="M 224 112 Q 247 72 270 112 T 316 112" fill="none" stroke="#ea580c" strokeWidth="10" strokeLinecap="round" />
            <text x="270" y="226" textAnchor="middle" fill="#c2410c" fontSize="29" fontWeight="800">
              {activeStep === 0 ? 'Chặn đường không khí' : 'Nghe rõ âm trầm xương sọ!'}
            </text>
            <text x="270" y="274" textAnchor="middle" fill="#475569" fontSize="23" fontWeight="600">
              {activeStep === 0 ? 'Bịt nhẹ 2 tai và đọc 1 câu ngắn' : 'Giọng bỗng ù vang và dày hẳn lên'}
            </text>
          </g>
        </g>
      )}

      {/* STEPS 2 & 3: BOY holding 2 upright cardboard panels vertically in front of ears */}
      {activeStep >= 2 && (
        <g>
          <SharedStickman
            x={760}
            y={679}
            scale={1.08}
            role="BOY"
            facing="RIGHT"
            pose="HOLD_CARDBOARDS"
            expression={activeStep === 3 ? 'HAPPY' : 'CURIOUS'}
            frame={frame}
          />

          {/* Step 3: Reflected Blue Air Waves looping past cardboard walls into ears */}
          {activeStep === 3 && (
            <g>
              <path
                d="M 815 538 C 910 532 955 415 845 375 C 725 335 615 415 680 486"
                fill="none"
                stroke="#0284c7"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="16 10"
                strokeDashoffset={-(frame * 3.5)}
              />
              <polygon points="688,494 666,488 682,472" fill="#0284c7" />
            </g>
          )}

          {/* Right Explainer Card */}
          <g transform="translate(1150, 290)">
            <rect x="0" y="0" width="540" height="340" rx="30" fill="#ffffff" stroke="#0284c7" strokeWidth="4.5" />
            <rect x="200" y="64" width="26" height="96" rx="6" fill="#fbbf24" stroke={INK} strokeWidth="3.8" />
            <rect x="314" y="64" width="26" height="96" rx="6" fill="#fbbf24" stroke={INK} strokeWidth="3.8" />
            <path d="M 244 112 Q 270 86 296 112" fill="none" stroke="#0284c7" strokeWidth="5.5" strokeLinecap="round" />
            <text x="270" y="226" textAnchor="middle" fill="#0369a1" fontSize="28" fontWeight="800">
              {activeStep === 2 ? 'Hai bức tường chắn nhỏ' : 'Đón sóng phản xạ không khí'}
            </text>
            <text x="270" y="274" textAnchor="middle" fill="#475569" fontSize="22" fontWeight="600">
              {activeStep === 2 ? 'Dựng thẳng ngay trước vành tai' : 'Giọng nghe ra giống hệt bản ghi âm'}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 12. GHIAM_BONE_HEADPHONES (b51–b54, steps 0, 1, 2, 3)
 *     - Step 0: Close-up cheekbone placement leaving ear canal visibly open.
 *     - Step 1: BOY jogging briskly outdoors wearing bone-conduction headphones.
 *     - Step 2: Orange music waves through cheekbone + blue car horn wave into open ear safely!
 *     - Step 3: Medical bone-conduction hearing aid bypassing damaged eardrum directly to cochlea.
 * ========================================================================== */
export const GhiAmBoneHeadphonesVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const roadDash = (frame * 9) % 140;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga12_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga12_bg)" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Tai nghe truyền âm qua xương gò má'
            : activeStep === 1
              ? 'Áp sát trước tai — Lỗ tai mở thoáng hoàn toàn'
              : activeStep === 2
                ? 'Vừa nghe nhạc vừa nghe rõ tiếng còi xe an toàn'
                : 'Ứng dụng y học: Máy trợ thính dẫn truyền xương'
        }
        bg="#ffffff"
        color="#0e7490"
        border="#06b6d4"
        fontSize={31}
      />

      {/* STEP 0: Clean Side Close-up of Bone-Conduction Headphones */}
      {activeStep === 0 && (
        <g transform="translate(960, 485)">
          <circle cx="0" cy="0" r="265" fill="#ffffff" stroke="#06b6d4" strokeWidth="5.5" />
          {/* Side Profile Head facing right */}
          <path
            d="M -65 185 L -68 122 C -126 102 -156 42 -152 -32 C -148 -124 -80 -184 12 -184 C 86 -184 134 -138 136 -66 L 160 -20 L 140 -6 L 136 44 C 134 78 106 108 66 112 L 52 185 Z"
            fill="#ffedd5"
            stroke={INK}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Clearly Open Outer Ear */}
          <path d="M -42 -16 C -68 -18 -76 16 -64 46 C -54 64 -34 62 -28 46" fill="#fed7aa" stroke={INK} strokeWidth="4.5" />
          <circle cx="-48" cy="22" r="11" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
          {/* Wrap-around Headband curving behind ear onto cheekbone */}
          <path d="M -146 38 C -98 28 -78 -34 -30 -32 C 0 -30 8 -8 8 12" fill="none" stroke="#1e293b" strokeWidth="11" strokeLinecap="round" />
          {/* Orange Cheekbone Transducer Pad IN FRONT of ear */}
          <rect x="-8" y="4" width="38" height="28" rx="14" fill="#f97316" stroke={INK} strokeWidth="4" />
          {/* Pulsing orange internal bone wave into inner ear */}
          {[0, 1].map((i) => (
            <circle
              key={i}
              cx="11"
              cy="18"
              r={20 + ((frame * 1.6 + i * 22) % 44)}
              fill="none"
              stroke="#ea580c"
              strokeWidth="4"
              opacity={1 - ((frame * 1.6 + i * 22) % 44) / 46}
            />
          ))}

          {/* Neat side pointers */}
          <text x="-375" y="18" textAnchor="middle" fill="#0369a1" fontSize="25" fontWeight="800">
            Lỗ tai mở thoáng
          </text>
          <line x1="-260" y1="18" x2="-66" y2="22" stroke="#0284c7" strokeWidth="4" strokeDasharray="8 6" />

          <text x="385" y="18" textAnchor="middle" fill="#c2410c" fontSize="25" fontWeight="800">
            Loa áp xương gò má
          </text>
          <line x1="255" y1="18" x2="36" y2="18" stroke="#ea580c" strokeWidth="4" strokeDasharray="8 6" />
        </g>
      )}

      {/* STEPS 1 & 2: Outdoor Park Jogging with Bone Headphones (+ Car Horn Safety in Step 2) */}
      {(activeStep === 1 || activeStep === 2) && (
        <g>
          {/* Park Hills & Trees */}
          <path d="M 0 620 Q 480 530 960 600 T 1920 580 L 1920 755 L 0 755 Z" fill="#86efac" />
          {/* Running Path grounded at y = 755..820 */}
          <rect x="0" y="750" width="1920" height="330" fill="#64748b" />
          <line x1="0" y1="750" x2="1920" y2="750" stroke="#334155" strokeWidth="5" />
          <line
            x1="-140"
            y1="804"
            x2="2060"
            y2="804"
            stroke="#f8fafc"
            strokeWidth="8"
            strokeDasharray="65 75"
            strokeDashoffset={roadDash}
            opacity="0.7"
          />

          {/* Jogging BOY wearing Bone-Conduction Headphones */}
          <SharedStickman
            x={1060}
            y={668}
            scale={1.06}
            role="BOY"
            facing="RIGHT"
            pose="JOG_BONE_HEADPHONES"
            expression="HAPPY"
            frame={frame}
          />

          {/* Orange Music Notes near head */}
          <g transform={`translate(1155, ${468 + Math.sin(frame * 0.2) * 8})`}>
            <circle cx="0" cy="18" r="9" fill="#ea580c" />
            <path d="M 8 18 L 8 -20 L 34 -26 L 34 10" fill="none" stroke="#ea580c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="26" cy="12" r="9" fill="#ea580c" />
          </g>

          {/* Step 2: Car behind BOY honking — Blue warning waves clearly reach open ear! */}
          {activeStep === 2 && (
            <g>
              {/* Clean 2D Cartoon Car on Left */}
              <g transform="translate(320, 684)">
                <path d="M -160 14 L -135 -46 L -45 -84 L 78 -84 L 138 -36 L 170 -20 L 170 42 L -160 42 Z" fill="#ef4444" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
                <path d="M -110 -38 L -42 -70 L 65 -70 L 108 -38 Z" fill="#bae6fd" stroke={INK} strokeWidth="3.5" />
                <circle cx="-92" cy="48" r="34" fill="#1e293b" stroke={INK} strokeWidth="4" />
                <circle cx="-92" cy="48" r="14" fill="#cbd5e1" />
                <circle cx="96" cy="48" r="34" fill="#1e293b" stroke={INK} strokeWidth="4" />
                <circle cx="96" cy="48" r="14" fill="#cbd5e1" />
              </g>
              {/* Blue Honk Waves traveling from car to BOY's open ear */}
              {[0, 1, 2].map((i) => {
                const dx = 40 + ((frame * 4 + i * 70) % 240);
                return (
                  <path
                    key={i}
                    d={`M ${515 + dx} ${545 - dx * 0.14} Q ${545 + dx} ${565 - dx * 0.14} ${515 + dx} ${595 - dx * 0.14}`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    opacity={1 - dx / 270}
                  />
                );
              })}
              <CleanLabel x={665} y={445} text="Tiếng còi xe (Lọt vào tai mở!)" bg="#e0f2fe" color="#0369a1" border="#0284c7" fontSize={23} />
            </g>
          )}
        </g>
      )}

      {/* STEP 3: Medical Bone-Conduction Hearing Aid Diagram */}
      {activeStep === 3 && (
        <g transform="translate(960, 485)">
          <rect x="-580" y="-265" width="1160" height="530" rx="38" fill="#ffffff" stroke="#0891b2" strokeWidth="5" />

          {/* Cross-section of Ear Canal (blocked/damaged) vs Temporal Bone Direct Bypass */}
          <g transform="translate(-80, 10)">
            {/* Damaged/Blocked Outer Ear Canal marked with soft red barrier */}
            <path d="M -320 -24 L -110 -24 L -110 24 L -320 24 Z" fill="#fee2e2" stroke="#ef4444" strokeWidth="4" />
            <line x1="-225" y1="-34" x2="-185" y2="34" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
            <line x1="-185" y1="-34" x2="-225" y2="34" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
            <text x="-215" y="78" textAnchor="middle" fill="#b91c1c" fontSize="22" fontWeight="800">
              Ống tai / Màng nhĩ tổn thương
            </text>

            {/* Bone-Anchored Hearing Aid Unit Behind/Above Ear */}
            <rect x="-255" y="-168" width="94" height="52" rx="18" fill="#0ea5e9" stroke={INK} strokeWidth="4" />
            <text x="-208" y="-186" textAnchor="middle" fill="#0369a1" fontSize="22" fontWeight="800">
              Máy trợ thính xương
            </text>

            {/* Temporal Bone Block */}
            <rect x="-145" y="-148" width="300" height="96" rx="18" fill="#fef3c7" stroke="#d97706" strokeWidth="4" />

            {/* Warm Orange Vibrations passing straight through bone into Cochlea */}
            <path
              d="M -155 -140 C -55 -130 65 -105 165 -28"
              fill="none"
              stroke="#ea580c"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="16 10"
              strokeDashoffset={-(frame * 3.4)}
            />
            <polygon points="175,-20 152,-22 166,-40" fill="#ea580c" />

            {/* Healthy Cochlea Spiral */}
            <g transform="translate(245, 0)">
              <circle cx="0" cy="0" r="78" fill="#dcfce7" stroke="#10b981" strokeWidth="4.5" />
              <path
                d="M -48 10 C -48 -42 42 -48 48 0 C 52 42 -16 50 -26 14 C -30 -12 12 -18 16 6"
                fill="none"
                stroke="#059669"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <text x="0" y="116" textAnchor="middle" fill="#065f46" fontSize="24" fontWeight="800">
                Ốc tai nghe rõ!
              </text>
            </g>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 13. GHIAM_GET_USED_TO_VOICE (b55–b56, steps 0, 1)
 *     - Step 0: BOY seated on real wooden chair beside wooden desk with studio mic,
 *       practicing listening across 3 stages: Lần 1 (awkward) → Lần 10 (calm) → Lần 30 (happy!).
 *     - Step 1: Brain updates its memory card cleanly + BOY smiling confidently.
 * ========================================================================== */
export const GhiAmGetUsedToVoiceVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const stageIdx = activeStep === 1 ? 2 : p < 0.34 ? 0 : p < 0.68 ? 1 : 2;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga13_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga13_bg)" />
      <rect x="0" y="795" width="1920" height="285" fill="#bbf7d0" opacity="0.55" />
      <line x1="0" y1="795" x2="1920" y2="795" stroke="#4ade80" strokeWidth="4" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Bí quyết hết ngại: Tập nghe lại nhiều lần'
            : 'Bộ não cập nhật bản mẫu mới → Hết lạ tai!'
        }
        bg="#ffffff"
        color="#065f46"
        border="#10b981"
        fontSize={31}
      />

      {/* Left: Grounded Wooden Chair + Wooden Desk + Studio Mic + Seated BOY */}
      <WoodenChair x={365} seatY={699} floorY={795} facing="RIGHT" />
      <WoodenTable x={665} topY={655} floorY={795} width={310} />
      <StudioMicOnStand x={690} y={655} scale={0.78} />
      <SharedStickman
        x={365}
        y={699}
        scale={1.0}
        role="BOY"
        facing="RIGHT"
        pose="SIT_RELAX_CHAT"
        expression={activeStep === 1 || stageIdx === 2 ? 'PROUD' : stageIdx === 1 ? 'HAPPY' : 'EMBARRASSED'}
        frame={frame}
      />

      {/* STEP 0: 3-Step Progression Cards (Lần 1 → Lần 10 → Lần 30) */}
      {activeStep === 0 && (
        <g transform="translate(965, 250)">
          {[
            { x: 0, label: 'Lần 1', sub: 'Hơi ngượng', active: stageIdx >= 0, mood: 'AWK' },
            { x: 290, label: 'Lần 10', sub: 'Bình thản', active: stageIdx >= 1, mood: 'CALM' },
            { x: 580, label: 'Lần 30', sub: 'Cười tươi!', active: stageIdx >= 2, mood: 'JOY' },
          ].map((item, idx) => (
            <g key={idx} transform={`translate(${item.x}, 0)`} opacity={item.active ? 1 : 0.35}>
              <rect
                x="0"
                y="0"
                width="245"
                height="340"
                rx="28"
                fill="#ffffff"
                stroke={idx === 2 ? '#10b981' : idx === 1 ? '#0284c7' : '#f59e0b'}
                strokeWidth={item.active ? 5 : 3}
              />
              {/* Mini Face */}
              <circle cx="122" cy="122" r="56" fill="#fffbeb" stroke={INK} strokeWidth="4.5" />
              <circle cx="104" cy="112" r="5.5" fill={INK} />
              <circle cx="140" cy="112" r="5.5" fill={INK} />
              {item.mood === 'AWK' && <path d="M 102 142 Q 112 132 122 142 T 142 142" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />}
              {item.mood === 'CALM' && <line x1="104" y1="142" x2="140" y2="142" stroke={INK} strokeWidth="4" strokeLinecap="round" />}
              {item.mood === 'JOY' && <path d="M 100 134 Q 122 158 144 134" fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" />}

              <text x="122" y="242" textAnchor="middle" fill={INK} fontSize="30" fontWeight="900">
                {item.label}
              </text>
              <text x="122" y="286" textAnchor="middle" fill="#475569" fontSize="23" fontWeight="700">
                {item.sub}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* STEP 1: Brain Updated with Both Templates + Green Checkmark */}
      {activeStep === 1 && (
        <g transform="translate(1360, 445)">
          <rect x="-360" y="-235" width="720" height="470" rx="36" fill="#ffffff" stroke="#10b981" strokeWidth="5.5" />
          <text x="0" y="-160" textAnchor="middle" fill="#065f46" fontSize="30" fontWeight="900">
            BỘ NÃO ĐÃ CẬP NHẬT BẢN MẪU MỚI
          </text>

          <rect x="-290" y="-110" width="265" height="175" rx="22" fill="#fff7ed" stroke="#ea580c" strokeWidth="4" />
          <text x="-158" y="-58" textAnchor="middle" fill="#c2410c" fontSize="22" fontWeight="800">
            Giọng trong đầu
          </text>
          <path d="M -250 12 Q -205 -28 -160 12 T -65 12" fill="none" stroke="#ea580c" strokeWidth="10" strokeLinecap="round" />

          <rect x="25" y="-110" width="265" height="175" rx="22" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
          <text x="158" y="-58" textAnchor="middle" fill="#0369a1" fontSize="22" fontWeight="800">
            Giọng ghi âm
          </text>
          <path d="M 65 12 Q 88 -22 111 12 T 157 12 T 203 12 T 250 12" fill="none" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />

          {/* Big Green Checkmark */}
          <circle cx="0" cy="148" r="44" fill="#10b981" />
          <path d="M -18 148 L -5 162 L 22 134" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 14. GHIAM_YARD_PRACTICE (b57–b58, steps 0, 1)
 *     - Storytelling afternoon countryside yard (NO header pill, NO bottom pill!).
 *     - Step 0 (b57): BOY holds 2 small cardboard panels in front of ears testing his voice ("Nghe rõ hẳn!").
 *     - Step 1 (b58): GRANDPA stands right beside BOY physically patting BOY's shoulder ("Giỏi lắm cháu!").
 * ========================================================================== */
export const GhiAmYardPracticeVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <CountrysideYardBackdrop frame={frame} uid="ga14_yard" />
      <ellipse cx="920" cy="804" rx="285" ry="18" fill="#78350f" opacity="0.16" />

      {/* STEP 0 (b57): BOY holding 2 cardboard walls in front of ears smiling */}
      {activeStep === 0 && (
        <g>
          <SharedStickman
            x={675}
            y={682}
            scale={1.04}
            role="BOY"
            facing="RIGHT"
            pose="HOLD_CARDBOARDS"
            expression="HAPPY"
            frame={frame}
          />
          <ShortSpeechBubble x={675} y={438} text="Nghe rõ hẳn!" tailDir="CENTER" />

          <SharedStickman
            x={1145}
            y={678}
            scale={1.08}
            role="GRANDPA"
            facing="LEFT"
            pose="NOD_SMILE"
            expression="HAPPY"
            frame={frame}
          />
        </g>
      )}

      {/* STEP 1 (b58): GRANDPA stands close beside BOY physically patting BOY's shoulder! */}
      {activeStep === 1 && (
        <g>
          <SharedStickman
            x={842}
            y={682}
            scale={1.04}
            role="BOY"
            facing="RIGHT"
            pose="IDLE"
            expression="PROUD"
            frame={frame}
          />
          {/* Rendered AFTER BOY so Grandpa's patting hand lands squarely ON Boy's shoulder (x=847, y≈600)! */}
          <SharedStickman
            x={968}
            y={678}
            scale={1.08}
            role="GRANDPA"
            facing="LEFT"
            pose="PAT_SHOULDER"
            expression="PROUD"
            frame={frame}
          />
          {/* Gentle pat lines right above real shoulder contact */}
          <g transform="translate(848, 578)" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" opacity={0.45 + 0.5 * Math.abs(Math.sin(frame * 0.18))}>
            <line x1="-14" y1="-6" x2="-24" y2="-16" />
            <line x1="0" y1="-10" x2="0" y2="-22" />
            <line x1="14" y1="-6" x2="24" y2="-16" />
          </g>
          <ShortSpeechBubble x={1075} y={432} text="Giỏi lắm cháu!" tailDir="LEFT" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 15. GHIAM_PORCH_HAPPY_END (b59–b61, steps 0, 1, 2)
 *     - Breezy Afternoon Porch with 2 real wooden chairs + 1 wooden table (legs grounded at y=804).
 *     - Storytelling scene: ZERO header/bottom pills!
 *     - Step 0 (b59): BOY seated holding phone recording with GRANDPA ("Thu thử nhé ông!").
 *     - Step 1 (b60): Phone placed solidly ON wooden table playing gentle sound waves; both seated laughing;
 *                     GRANDPA has bubble "Nghe hay phết!".
 *     - Step 2 (b61): Both BOY & GRANDPA stay seated comfortably chatting & smiling warmly
 *                     (ZERO standing up, ZERO waving into empty air!).
 * ========================================================================== */
export const GhiAmPorchHappyEndVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <radialGradient id="ga15_goldenLight" cx="85%" cy="15%" r="85%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#fde047" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <CountrysidePorchBackdrop frame={frame} uid="ga15_porch" />

      {/* Two Real Wooden Porch Chairs & One Wooden Table between them (all legs grounded at y = 804 <= 830) */}
      <WoodenChair x={682} seatY={708} floorY={804} facing="RIGHT" />
      <WoodenChair x={1238} seatY={708} floorY={804} facing="LEFT" />
      <WoodenTable x={960} topY={668} floorY={804} width={272} />

      {/* Steps 1 & 2: Smartphone resting solidly ON wooden porch table */}
      {activeStep >= 1 && (
        <g>
          <SmartphoneProp
            x={960}
            y={668}
            scale={1.12}
            mode={activeStep === 1 ? 'PLAYING' : 'IDLE'}
            flatOnTable={true}
            frame={frame}
          />
          {activeStep === 1 &&
            [0, 1].map((i) => {
              const r = 24 + ((frame * 2 + i * 28) % 56);
              return (
                <circle
                  key={i}
                  cx="960"
                  cy="622"
                  r={r}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="4"
                  opacity={1 - r / 84}
                />
              );
            })}
        </g>
      )}

      {/* BOY: Seated solidly on left wooden chair across ALL 3 steps! */}
      <SharedStickman
        x={682}
        y={708}
        scale={1.0}
        role="BOY"
        facing="RIGHT"
        pose={activeStep === 0 ? 'SIT_HOLD_PHONE' : 'SIT_RELAX_CHAT'}
        expression={activeStep === 2 ? 'PROUD' : 'HAPPY'}
        phoneMode="RECORDING"
        frame={frame}
      />

      {/* GRANDPA: Seated solidly on right wooden chair across ALL 3 steps! */}
      <SharedStickman
        x={1238}
        y={708}
        scale={1.0}
        role="GRANDPA"
        facing="LEFT"
        pose="SIT_RELAX_CHAT"
        expression={activeStep >= 1 ? 'PROUD' : 'HAPPY'}
        frame={frame + 12}
      />

      {/* Step 0 & Step 1 Speech Bubbles */}
      {activeStep === 0 && (
        <ShortSpeechBubble x={605} y={472} text="Thu thử nhé ông!" tailDir="RIGHT" />
      )}
      {activeStep === 1 && (
        <ShortSpeechBubble x={1315} y={472} text="Nghe hay phết!" tailDir="LEFT" />
      )}

      {/* Step 2 Warm Golden Afternoon Glow */}
      {activeStep >= 2 && (
        <rect
          width="1920"
          height="1080"
          fill="url(#ga15_goldenLight)"
          opacity={clamp01(0.45 + p * 0.55)}
          pointerEvents="none"
        />
      )}
    </svg>
  );
};

/* ============================================================================
 * 16. GHIAM_SUMMARY_OUTRO (b62–b64, steps 0, 1, 2)
 *     - Bright clean summary layout (all elements strictly y <= 820).
 *     - Step 0 (b62): Card 1 appears (Hai đường truyền âm).
 *     - Step 1 (b63): Cards 2 (Xương sọ tăng âm trầm) & 3 (Người ngoài thấy bình thường) appear.
 *     - Step 2 (b64): All 3 cards stay bright + BOY stands bottom-left plugging ears playfully,
 *       with ShortSpeechBubble tailDir="SIDE_LEFT" aiming straight at BOY's smiling face!
 * ========================================================================== */
export const GhiAmSummaryOutroVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const c1 = activeStep === 0 ? clamp01(p * 2.4) : 1;
  const c2 = activeStep === 0 ? 0 : activeStep === 1 ? clamp01(p * 2.2) : 1;
  const c3 = activeStep === 0 ? 0 : activeStep === 1 ? clamp01((p - 0.35) * 2.4) : 1;

  const cards = [
    {
      cx: 360,
      appear: c1,
      title: '1. Hai đường truyền',
      sub: 'Không khí & xương sọ',
      accent: '#0284c7',
      bg: '#e0f2fe',
      bob: Math.sin(frame * 0.07) * 5,
      kind: 'DUAL' as const,
    },
    {
      cx: 960,
      appear: c2,
      title: '2. Xương sọ tăng trầm',
      sub: 'Ghi âm mất lớp âm trầm',
      accent: '#ea580c',
      bg: '#ffedd5',
      bob: Math.sin(frame * 0.07 + 2.1) * 5,
      kind: 'BASS' as const,
    },
    {
      cx: 1560,
      appear: c3,
      title: '3. Rất bình thường',
      sub: 'Người ngoài thấy dễ nghe',
      accent: '#10b981',
      bg: '#dcfce7',
      bob: Math.sin(frame * 0.07 + 4.2) * 5,
      kind: 'OK' as const,
    },
  ];

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga16_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f0fdf4" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga16_bg)" />

      <text x="960" y="128" textAnchor="middle" fill={INK} fontSize="42" fontWeight="800">
        TÓM TẮT 3 ĐIỀU CẦN NHỚ
      </text>

      {cards.map((card, idx) => (
        <g
          key={idx}
          transform={`translate(${card.cx}, ${360 + lerp(28, 0, card.appear)})`}
          opacity={card.appear}
        >
          <rect
            x="-255"
            y="-175"
            width="510"
            height="350"
            rx="32"
            fill="#ffffff"
            stroke={card.accent}
            strokeWidth="4.5"
          />

          <g transform={`translate(0, ${-68 + card.bob})`}>
            <circle cx="0" cy="0" r="64" fill={card.bg} stroke={card.accent} strokeWidth="3.5" />
            {card.kind === 'DUAL' && (
              <g fill="none" strokeLinecap="round">
                <path d="M -32 -10 Q -16 -32 0 -10 T 32 -10" stroke="#0284c7" strokeWidth="6" />
                <path d="M -32 16 Q -16 -6 0 16 T 32 16" stroke="#ea580c" strokeWidth="7" />
              </g>
            )}
            {card.kind === 'BASS' && (
              <path d="M -34 2 Q -17 -34 0 2 T 34 2" fill="none" stroke="#ea580c" strokeWidth="11" strokeLinecap="round" />
            )}
            {card.kind === 'OK' && (
              <path d="M -22 2 L -6 18 L 24 -16" fill="none" stroke="#059669" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>

          <g transform="translate(198, -122)">
            <circle cx="0" cy="0" r="24" fill="#10b981" />
            <path d="M -10 1 L -3 8 L 11 -8" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          <text x="0" y="56" textAnchor="middle" fill={INK} fontSize="33" fontWeight="800">
            {card.title}
          </text>
          <text x="0" y="106" textAnchor="middle" fill="#475569" fontSize="25" fontWeight="600">
            {card.sub}
          </text>
        </g>
      ))}

      {/* Step 2 (b64): BOY bottom-left playfully plugging ears + SIDE_LEFT bubble aiming straight at his face */}
      {activeStep >= 2 && (
        <g opacity={clamp01(p * 1.8)}>
          <ellipse cx="705" cy="816" rx="52" ry="9" fill="#0f172a" opacity="0.12" />
          <SharedStickman
            x={705}
            y={716}
            scale={0.86}
            role="BOY"
            facing="RIGHT"
            pose="PLUG_EARS"
            expression="HAPPY"
            frame={frame}
          />
          <ShortSpeechBubble x={985} y={596} text="Thử bịt tai xem!" tailDir="SIDE_LEFT" />
        </g>
      )}
    </svg>
  );
};
