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
  DeskLamp,
  SharedStickman,
  VocalEarCutawayDiagram,
} from './ghiAmSharedAssets';

/* ============================================================================
 * 1. GHIAM_PHONE_SHOCK (b01–b03, steps 0, 1, 2)
 *    - Cozy study room: wooden desk + real wooden chair (feet grounded at y=804) + desk lamp.
 *    - Storytelling scene: ZERO header/bottom pills, ZERO AI-slop UI windows!
 *    - Step 0: BOY seated on chair holding phone recording ("Đọc mượt quá!").
 *    - Step 1: Phone set flat/propped ON wooden desk; BOY taps play ("Nghe lại xem!").
 *    - Step 2: Sharp sound waves blast from phone on desk; BOY covers both ears in shock ("Giọng ai thế?!").
 * ========================================================================== */
export const GhiAmPhoneShockVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const waveShift = (frame * 3.4) % 44;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga1_wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="ga1_floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2c29d" />
          <stop offset="100%" stopColor="#c79e72" />
        </linearGradient>
      </defs>

      {/* Study Room Wall & Floor (floor contact line at y = 804 <= 830) */}
      <rect x="0" y="0" width="1920" height="750" fill="url(#ga1_wall)" />
      <rect x="0" y="750" width="1920" height="330" fill="url(#ga1_floor)" stroke={INK} strokeWidth="4.5" />

      {/* Warm Afternoon Study Window on Left */}
      <g transform="translate(150, 145)">
        <rect x="0" y="0" width="310" height="260" rx="10" fill="#bae6fd" stroke="#92400e" strokeWidth="8" />
        <polygon points="10,10 150,10 90,250 10,250" fill="#ffffff" opacity="0.32" />
        <line x1="155" y1="0" x2="155" y2="260" stroke="#92400e" strokeWidth="7" />
        <line x1="0" y1="130" x2="310" y2="130" stroke="#92400e" strokeWidth="7" />
        <rect x="-18" y="256" width="346" height="20" rx="6" fill="#b45309" stroke={INK} strokeWidth="3.5" />
      </g>

      {/* Wall Bookshelf on Right */}
      <g transform="translate(1375, 165)">
        <rect x="0" y="106" width="360" height="22" rx="6" fill="#b45309" stroke={INK} strokeWidth="3.8" />
        <rect x="28" y="26" width="34" height="80" rx="4" fill="#3b82f6" stroke={INK} strokeWidth="3" />
        <rect x="64" y="14" width="36" height="92" rx="4" fill="#10b981" stroke={INK} strokeWidth="3" />
        <rect x="102" y="34" width="32" height="72" rx="4" fill="#f59e0b" stroke={INK} strokeWidth="3" />
        <rect x="140" y="22" width="38" height="84" rx="4" fill="#ef4444" stroke={INK} strokeWidth="3" />
        {/* Potted plant on shelf */}
        <path d="M 244 106 L 254 66 L 298 66 L 308 106 Z" fill="#d97706" stroke={INK} strokeWidth="3.2" />
        <path d="M 276 66 C 254 44 252 24 270 16 C 280 28 280 48 276 66 Z" fill="#22c55e" stroke={INK} strokeWidth="3" />
        <path d="M 276 66 C 298 44 306 28 292 18 C 280 30 278 48 276 66 Z" fill="#16a34a" stroke={INK} strokeWidth="3" />
      </g>

      {/* Real Wooden Study Chair on Left (legs grounded at y = 804) */}
      <WoodenChair x={690} seatY={708} floorY={804} facing="RIGHT" />

      {/* Real Wooden Study Desk on Right (legs grounded at y = 804, tabletop y = 668) */}
      <WoodenTable x={1095} topY={668} floorY={804} width={450} />

      {/* Open Biology Notebook resting solidly on desk */}
      <g transform="translate(1070, 668)">
        <polygon points="-58,0 -8,-14 48,-14 68,0" fill="#ffffff" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
        <line x1="-2" y1="-14" x2="2" y2="0" stroke="#94a3b8" strokeWidth="2.5" />
      </g>

      {/* Cozy Desk Lamp resting solidly on right side of desk */}
      <DeskLamp x={1255} y={668} scale={1.08} lit={true} />

      {/* STEP 0 (b01): BOY seated holding phone recording */}
      {activeStep === 0 && (
        <g>
          <SharedStickman
            x={690}
            y={708}
            scale={1.0}
            role="BOY"
            facing="RIGHT"
            pose="SIT_HOLD_PHONE"
            expression="HAPPY"
            phoneMode="RECORDING"
            frame={frame}
          />
          {/* Subtle warm voice ripples from mouth to held phone */}
          {[0, 1].map((i) => {
            const d = 10 + ((frame * 1.4 + i * 16) % 30);
            return (
              <path
                key={i}
                d={`M ${726 + d * 0.6} ${570 - d * 0.3} Q ${736 + d * 0.8} 576 ${726 + d * 0.6} ${586 + d * 0.3}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.4"
                strokeLinecap="round"
                opacity={1 - d / 44}
              />
            );
          })}
          <ShortSpeechBubble x={610} y={472} text="Đọc mượt quá!" tailDir="RIGHT" />
        </g>
      )}

      {/* STEP 1 (b02): Phone placed solidly on wooden desk; BOY taps Play */}
      {activeStep === 1 && (
        <g>
          <SmartphoneProp x={918} y={668} scale={1.15} mode="PLAYING" flatOnTable={true} frame={frame} />
          <SharedStickman
            x={728}
            y={708}
            scale={1.0}
            role="BOY"
            facing="RIGHT"
            pose="SIT_TAP_DESK"
            expression="HAPPY"
            frame={frame}
          />
          {/* Tap ring right at phone screen */}
          <circle
            cx="902"
            cy="638"
            r={12 + (frame % 18) * 1.2}
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.5"
            opacity={1 - (frame % 18) / 18}
          />
          <ShortSpeechBubble x={655} y={472} text="Nghe lại xem!" tailDir="RIGHT" />
        </g>
      )}

      {/* STEP 2 (b03): Sharp sound waves burst from phone on desk; BOY covers both ears shocked */}
      {activeStep === 2 && (
        <g>
          <SmartphoneProp x={928} y={668} scale={1.18} mode="PLAYING" flatOnTable={true} frame={frame} />
          {/* Spiky high-pitched blue sound waves shooting left toward BOY */}
          {[0, 1, 2, 3].map((i) => {
            const dist = 28 + ((waveShift + i * 36) % 144);
            const op = Math.max(0.15, 1 - dist / 155);
            return (
              <path
                key={i}
                d={`M ${900 - dist} ${622 - dist * 0.45} Q ${874 - dist} ${612 - dist * 0.2} ${900 - dist} ${640 + dist * 0.12}`}
                fill="none"
                stroke={i % 2 === 0 ? '#0284c7' : '#38bdf8'}
                strokeWidth="5.5"
                strokeLinecap="round"
                opacity={op}
              />
            );
          })}
          {/* Sharp zigzag audio spikes */}
          <polyline
            points="890,614 862,598 866,612 834,592 840,606 806,584"
            fill="none"
            stroke="#0284c7"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <SharedStickman
            x={690}
            y={708}
            scale={1.0}
            role="BOY"
            facing="RIGHT"
            pose="SIT_COVER_EARS"
            expression="SHOCKED"
            frame={frame}
          />
          <ShortSpeechBubble x={600} y={462} text="Giọng ai thế?!" tailDir="RIGHT" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 2. GHIAM_MYTH_BROKEN_MIC (b06–b08, steps 0, 1, 2)
 *    - Soft light blue-slate studio backdrop (#EEF2F7) so 100% of stickman limbs stay crisp!
 *    - Step 0: Studio condenser mic on real table + crisp red X myth-busting mark.
 *    - Step 1: Wooden table + smartphone playing; 2 friends nodding normally (non-overlapping check badge).
 *    - Step 2: Same table + smartphone playing; BOY alone recoils covering ears.
 * ========================================================================== */
export const GhiAmMythBrokenMicVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);
  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.18);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga2_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="55%" stopColor="#eef2f7" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga2_bg)" />

      {/* Subtle studio acoustic wall pattern */}
      <g opacity="0.24" stroke="#94a3b8" strokeWidth="2.5">
        {[220, 420, 620, 820, 1020, 1220, 1420, 1620].map((gx) => (
          <line key={gx} x1={gx} y1="150" x2={gx} y2="795" />
        ))}
      </g>

      {/* Studio Floor grounded at y = 795 <= 830 */}
      <rect x="0" y="795" width="1920" height="285" fill="#cbd5e1" />
      <line x1="0" y1="795" x2="1920" y2="795" stroke="#94a3b8" strokeWidth="4" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={88}
        text={
          activeStep === 0
            ? 'Không phải do bộ thu âm hay loa hỏng!'
            : activeStep === 1
              ? 'Người ngoài nghe thấy giống hệt giọng thật'
              : 'Chỉ duy nhất bạn mới thấy giọng mình lạ'
        }
        bg="#ffffff"
        color="#0f172a"
        border={activeStep === 0 ? '#ef4444' : activeStep === 1 ? '#10b981' : '#0284c7'}
        fontSize={32}
      />

      {/* STEP 0: High-end Studio Condenser Mic on Real Table + Red X Myth Stamp */}
      {activeStep === 0 && (
        <g>
          <WoodenTable x={960} topY={640} floorY={795} width={440} />
          <StudioMicOnStand x={960} y={640} scale={1.45} />

          {/* Clean studio sound rings around mic */}
          <circle cx="960" cy="365" r={105 + pulse * 14} fill="none" stroke="#0284c7" strokeWidth="4" opacity="0.32" />

          {/* Clean Red X Myth Badge overlaid lightly on "Lỗi thiết bị" */}
          <g transform="translate(1325, 390)" opacity={clamp01(p * 2)}>
            <rect x="-185" y="-92" width="370" height="184" rx="28" fill="#ffffff" stroke="#ef4444" strokeWidth="5" />
            <circle cx="0" cy="-22" r="38" fill="#fee2e2" stroke="#ef4444" strokeWidth="5" />
            <line x1="-16" y1="-38" x2="16" y2="-6" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
            <line x1="16" y1="-38" x2="-16" y2="-6" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
            <text x="0" y="56" textAnchor="middle" fill="#b91c1c" fontSize="26" fontWeight="800">
              Không phải do máy thu!
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: 2 Friends listening to Smartphone on wooden table nodding happily */}
      {activeStep === 1 && (
        <g>
          <WoodenTable x={560} topY={665} floorY={795} width={260} />
          <SmartphoneProp x={560} y={665} scale={1.18} mode="PLAYING" flatOnTable={true} frame={frame} />

          {/* Smooth emerald sound waves traveling right toward 2 friends */}
          {[0, 1, 2].map((i) => {
            const dx = 40 + ((frame * 3 + i * 52) % 160);
            return (
              <path
                key={i}
                d={`M ${620 + dx} ${600 - dx * 0.12} Q ${642 + dx} 618 ${620 + dx} ${638 + dx * 0.12}`}
                fill="none"
                stroke="#059669"
                strokeWidth="5"
                strokeLinecap="round"
                opacity={1 - dx / 185}
              />
            );
          })}

          <SharedStickman
            x={1060}
            y={679}
            scale={1.02}
            role="FRIEND_A"
            facing="LEFT"
            pose="NOD_SMILE"
            expression="HAPPY"
            frame={frame}
          />
          <SharedStickman
            x={1360}
            y={679}
            scale={1.02}
            role="FRIEND_B"
            facing="LEFT"
            pose="NOD_SMILE"
            expression="PROUD"
            frame={frame + 14}
          />

          {/* Clean green approval check above friends — generous 16px+ spacing between icon and "G" */}
          <g transform="translate(1210, 415)">
            <rect x="-182" y="-36" width="364" height="72" rx="36" fill="#ecfdf5" stroke="#10b981" strokeWidth="4" />
            <circle cx="-142" cy="0" r="18" fill="#10b981" />
            <path d="M -150 0 L -144 6 L -133 -6" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <text x="-106" y="9" textAnchor="start" fill="#065f46" fontSize="24" fontWeight="800">
              Giống hệt ngoài đời!
            </text>
          </g>
        </g>
      )}

      {/* STEP 2: Same wooden table & phone, but BOY stands recoiling covering ears */}
      {activeStep === 2 && (
        <g>
          <WoodenTable x={560} topY={665} floorY={795} width={260} />
          <SmartphoneProp x={560} y={665} scale={1.18} mode="PLAYING" flatOnTable={true} frame={frame} />

          {[0, 1, 2].map((i) => {
            const dx = 40 + ((frame * 3.4 + i * 52) % 160);
            return (
              <path
                key={i}
                d={`M ${620 + dx} ${595 - dx * 0.14} Q ${642 + dx} 618 ${620 + dx} ${642 + dx * 0.14}`}
                fill="none"
                stroke="#0284c7"
                strokeWidth="5"
                strokeLinecap="round"
                opacity={1 - dx / 185}
              />
            );
          })}

          <SharedStickman
            x={1175}
            y={679}
            scale={1.02}
            role="BOY"
            facing="LEFT"
            pose="STAND_COVER_EARS"
            expression="SHOCKED"
            frame={frame}
          />

          <ShortSpeechBubble x={1175} y={445} text="Sao kỳ cục thế?!" tailDir="CENTER" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 3. GHIAM_AIR_CONDUCTION (b11–b14, steps 0, 1, 2, 3)
 *    - Clean side-profile head cutaway facing RIGHT.
 *    - Step 0: Vocal cords in neck vibrate gently.
 *    - Step 1: Blue sound waves exit RIGHT mouth opening & arc outside through open air.
 *    - Step 2: Blue waves enter outer ear canal & vibrate eardrum.
 *    - Step 3: Magnified zoom lens of the 3 ossicles passing vibrations into the cochlea.
 * ========================================================================== */
export const GhiAmAirConductionVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);
  const ossicleRock = Math.sin(frame * 0.42) * 5;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga3_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga3_bg)" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Đường 1: Dây thanh quản rung trong cổ họng'
            : activeStep === 1
              ? 'Sóng âm thoát ra miệng, vòng qua không khí'
              : activeStep === 2
                ? 'Sóng không khí đi vào vành tai làm rung màng nhĩ'
                : 'Chuỗi 3 xương con truyền rung động vào ốc tai'
        }
        bg="#ffffff"
        color="#0369a1"
        border="#0284c7"
        fontSize={31}
      />

      {/* Right-facing Head Cutaway shifted cleanly left in Step 3 to make room for Ossicles Zoom */}
      <VocalEarCutawayDiagram
        x={activeStep === 3 ? 670 : 940}
        y={505}
        scale={activeStep === 3 ? 1.06 : 1.12}
        frame={frame}
        uid="ga3_cut"
        vocalActive={true}
        airStage={activeStep === 0 ? 0 : activeStep === 1 ? 1 : activeStep === 2 ? 2 : 3}
        boneStage={0}
      />

      {/* Step-specific Clean Scientific Callout */}
      {activeStep === 0 && (
        <g transform="translate(1340, 620)">
          <rect x="0" y="0" width="380" height="106" rx="22" fill="#ffffff" stroke="#ea580c" strokeWidth="4" />
          <text x="190" y="45" textAnchor="middle" fill="#c2410c" fontSize="26" fontWeight="800">
            Dây thanh quản
          </text>
          <text x="190" y="82" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="600">
            Rung tạo sóng âm lời nói
          </text>
          <line x1="0" y1="54" x2="-315" y2="80" stroke="#ea580c" strokeWidth="4" strokeDasharray="8 6" />
        </g>
      )}

      {activeStep === 1 && (
        <g transform="translate(1335, 420)">
          <rect x="0" y="0" width="400" height="110" rx="22" fill="#ffffff" stroke="#0284c7" strokeWidth="4" />
          <text x="200" y="46" textAnchor="middle" fill="#0369a1" fontSize="26" fontWeight="800">
            Truyền qua không khí
          </text>
          <text x="200" y="84" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="600">
            Ra cửa miệng → vòng tới vành tai
          </text>
          <line x1="0" y1="58" x2="-135" y2="128" stroke="#0284c7" strokeWidth="4" strokeDasharray="8 6" />
        </g>
      )}

      {activeStep === 2 && (
        <g transform="translate(160, 445)">
          <rect x="0" y="0" width="400" height="110" rx="22" fill="#ffffff" stroke="#0284c7" strokeWidth="4" />
          <text x="200" y="46" textAnchor="middle" fill="#0369a1" fontSize="26" fontWeight="800">
            Màng nhĩ rung động
          </text>
          <text x="200" y="84" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="600">
            Đón trọn nhịp sóng từ ống tai
          </text>
          <line x1="400" y1="58" x2="680" y2="82" stroke="#0284c7" strokeWidth="4" strokeDasharray="8 6" />
        </g>
      )}

      {/* STEP 3: Magnified Zoom Circle of Eardrum → 3 Ossicles → Cochlea */}
      {activeStep === 3 && (
        <g opacity={clamp01(0.4 + p * 3)}>
          {/* Dotted connector lines from middle ear to zoom lens */}
          <line x1="650" y1="522" x2="1125" y2="275" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="8 8" opacity="0.72" />
          <line x1="650" y1="528" x2="1125" y2="715" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="8 8" opacity="0.72" />

          <g transform="translate(1395, 495)">
            <circle cx="0" cy="0" r="245" fill="#ffffff" stroke="#0284c7" strokeWidth="6" />
            <text x="0" y="-176" textAnchor="middle" fill="#0f172a" fontSize="25" fontWeight="900">
              PHÓNG ĐẠI TAI GIỮA &amp; ỐC TAI
            </text>

            {/* Eardrum on left of zoom */}
            <ellipse cx={-160 + ossicleRock * 0.4} cy="10" rx="14" ry="72" fill="#bae6fd" stroke="#0284c7" strokeWidth="5" />
            <text x="-160" y="116" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="800">
              Màng nhĩ
            </text>

            {/* 3 Ossicles (Xương búa, xương đe, xương bàn đạp) rocking smoothly */}
            <g transform={`translate(${ossicleRock * 0.6}, 0)`}>
              {/* 1. Malleus (Xương búa) */}
              <path d="M -146 10 L -98 -34 L -82 -20 L -110 24 Z" fill="#fef3c7" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
              {/* 2. Incus (Xương đe) */}
              <path d="M -86 -26 L -34 -30 L -24 22 L -54 24 L -60 -6 Z" fill="#fde68a" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
              {/* 3. Stapes (Xương bàn đạp - stirrup) */}
              <path d="M -26 6 L 26 -14 L 26 26 Z" fill="none" stroke="#d97706" strokeWidth="7" strokeLinejoin="round" />
              <line x1="28" y1="-18" x2="28" y2="30" stroke={INK} strokeWidth="5" strokeLinecap="round" />
            </g>
            <text x="-46" y="-66" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="800">
              3 xương con
            </text>

            {/* Cochlea spiral on right of zoom */}
            <g transform="translate(116, 6)">
              <circle cx="0" cy="0" r="72" fill="#eef2ff" stroke="#4f46e5" strokeWidth="4.5" />
              <path
                d="M -52 10 C -52 -46 46 -52 52 0 C 56 46 -18 54 -28 16 C -34 -14 14 -20 18 6 C 20 20 0 22 -4 12"
                fill="none"
                stroke="#4338ca"
                strokeWidth="9"
                strokeLinecap="round"
              />
            </g>
            <text x="116" y="116" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="800">
              Ốc tai → Não
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 4. GHIAM_BONE_CONDUCTION (b15–b18, steps 0, 1, 2, 3)
 *    - Same right-facing head cutaway for instant visual comparison.
 *    - Step 0: Vocal cords vibrate emitting warm orange bone waves.
 *    - Step 1: Orange wave travels strictly INSIDE jaw & skull bone (ZERO tail behind neck!).
 *    - Step 2: Orange wave hits cochlea directly, visibly bypassing eardrum.
 *    - Step 3: BOTH blue air path + orange bone path merge into the glowing cochlea.
 * ========================================================================== */
export const GhiAmBoneConductionVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga4_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#ffedd5" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga4_bg)" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Đường 2: Lối đi bí mật qua xương sọ'
            : activeStep === 1
              ? 'Rung động dội ngược BÊN TRONG xương hàm & hộp sọ'
              : activeStep === 2
                ? 'Đập thẳng vào ốc tai, bỏ qua hoàn toàn màng nhĩ'
                : 'Ốc tai nhận bản hòa trộn cả 2 đường cùng lúc!'
        }
        bg="#ffffff"
        color={activeStep === 3 ? '#6d28d9' : '#c2410c'}
        border={activeStep === 3 ? '#7c3aed' : '#ea580c'}
        fontSize={31}
      />

      <VocalEarCutawayDiagram
        x={940}
        y={505}
        scale={1.12}
        frame={frame}
        uid="ga4_cut"
        vocalActive={true}
        airStage={activeStep === 3 ? 3 : 0}
        boneStage={activeStep === 0 ? 1 : activeStep === 1 ? 1 : activeStep === 2 ? 2 : 3}
      />

      {activeStep === 1 && (
        <g transform="translate(1335, 515)">
          <rect x="0" y="0" width="410" height="114" rx="22" fill="#ffffff" stroke="#ea580c" strokeWidth="4" />
          <text x="205" y="48" textAnchor="middle" fill="#c2410c" fontSize="26" fontWeight="800">
            Dẫn truyền nội bộ
          </text>
          <text x="205" y="86" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="600">
            Xuyên xương hàm &amp; hộp sọ
          </text>
          <line x1="0" y1="60" x2="-340" y2="80" stroke="#ea580c" strokeWidth="4" strokeDasharray="8 6" />
        </g>
      )}

      {activeStep === 2 && (
        <g transform="translate(150, 460)">
          <rect x="0" y="0" width="420" height="118" rx="22" fill="#ffffff" stroke="#ea580c" strokeWidth="4" />
          <text x="210" y="48" textAnchor="middle" fill="#c2410c" fontSize="26" fontWeight="800">
            Đi thẳng vào ốc tai
          </text>
          <text x="210" y="88" textAnchor="middle" fill="#64748b" fontSize="21" fontWeight="600">
            Bỏ qua vành tai ngoài &amp; màng nhĩ
          </text>
          <line x1="420" y1="58" x2="770" y2="62" stroke="#ea580c" strokeWidth="4" strokeDasharray="8 6" />
        </g>
      )}

      {activeStep === 3 && (
        <g>
          <g transform="translate(145, 310)">
            <rect x="0" y="0" width="380" height="96" rx="22" fill="#e0f2fe" stroke="#0284c7" strokeWidth="4" />
            <text x="190" y="42" textAnchor="middle" fill="#0369a1" fontSize="25" fontWeight="800">
              1. Đường không khí
            </text>
            <text x="190" y="75" textAnchor="middle" fill="#0284c7" fontSize="20" fontWeight="600">
              Qua miệng → màng nhĩ
            </text>
          </g>
          <g transform="translate(1395, 310)">
            <rect x="0" y="0" width="380" height="96" rx="22" fill="#ffedd5" stroke="#ea580c" strokeWidth="4" />
            <text x="190" y="42" textAnchor="middle" fill="#c2410c" fontSize="25" fontWeight="800">
              2. Đường xương sọ
            </text>
            <text x="190" y="75" textAnchor="middle" fill="#ea580c" fontSize="20" fontWeight="600">
              Xuyên xương → ốc tai
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 5. GHIAM_DUAL_PATH_SPLIT (b19–b20, steps 0, 1)
 *    - Split-Screen with real floors & wooden tables on BOTH sides.
 *    - Step 0 (b19): LEFT side bright & animated (air wave only); RIGHT side frozen & dark-dimmed!
 *    - Step 1 (b20): BOTH sides bright & animated simultaneously for direct contrast!
 * ========================================================================== */
export const GhiAmDualPathSplitVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const rightActive = activeStep >= 1;
  const rFrame = rightActive ? frame : 0;
  const leftWave = (frame * 3.6) % 72;
  const rightAir = (rFrame * 3.6) % 60;
  const rightBone = (rFrame * 2.8) % 52;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <rect x="0" y="0" width="960" height="1080" fill="#f0f9ff" />
      <rect x="960" y="0" width="960" height="1080" fill="#fff7ed" />

      {/* Grounded Floor on both sides (y = 790 <= 830) */}
      <rect x="0" y="790" width="960" height="290" fill="#bae6fd" opacity="0.55" />
      <rect x="960" y="790" width="960" height="290" fill="#fed7aa" opacity="0.55" />
      <line x1="0" y1="790" x2="1920" y2="790" stroke="#94a3b8" strokeWidth="4" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={82}
        text={
          activeStep === 0
            ? 'Người ngoài & máy thu chỉ nhận 1 đường không khí'
            : 'So sánh trực tiếp: 1 đường vs 2 đường âm thanh'
        }
        bg="#ffffff"
        color={INK}
        border={activeStep === 0 ? '#0284c7' : '#7c3aed'}
        fontSize={31}
      />

      {/* === LEFT HALF: Người ngoài & Máy thu âm (ALWAYS BRIGHT & ANIMATED) === */}
      <g>
        <rect x="195" y="152" width="570" height="60" rx="30" fill="#0284c7" />
        <text x="480" y="191" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800">
          NGƯỜI NGOÀI &amp; MÁY THU (CHỈ 1 ĐƯỜNG)
        </text>

        {/* BOY speaking on left */}
        <SharedStickman x={175} y={674} scale={1.0} role="BOY" facing="RIGHT" pose="TALK_GESTURE" expression="HAPPY" frame={frame} />

        {/* Wooden table with smartphone recorder */}
        <WoodenTable x={495} topY={664} floorY={790} width={210} />
        <SmartphoneProp x={495} y={664} scale={1.1} mode="RECORDING" flatOnTable={true} frame={frame} />

        {/* Friend standing listening on right of left panel */}
        <SharedStickman x={795} y={674} scale={1.0} role="FRIEND_A" facing="LEFT" pose="NOD_SMILE" expression="HAPPY" frame={frame} />

        {/* Single BLUE air wave traveling straight from BOY → phone → Friend */}
        {[0, 1, 2, 3].map((i) => {
          const xw = 245 + ((leftWave + i * 115) % 450);
          return (
            <path
              key={i}
              d={`M ${xw} 510 Q ${xw + 24} 540 ${xw} 570`}
              fill="none"
              stroke="#0284c7"
              strokeWidth="6"
              strokeLinecap="round"
              opacity={0.85}
            />
          );
        })}
        <text x="495" y="455" textAnchor="middle" fill="#0369a1" fontSize="24" fontWeight="800">
          Chỉ 1 luồng sóng không khí
        </text>
      </g>

      {/* === RIGHT HALF: Chính bạn khi nói (FROZEN & DIMMED IN STEP 0, BRIGHT IN STEP 1) === */}
      <g>
        <rect x="1155" y="152" width="570" height="60" rx="30" fill="#ea580c" />
        <text x="1440" y="191" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800">
          CHÍNH BẠN KHI NÓI (CẢ 2 ĐƯỜNG)
        </text>

        {/* BOY speaking in right panel with dual wave rings */}
        <SharedStickman
          x={1435}
          y={674}
          scale={1.05}
          role="BOY"
          facing="RIGHT"
          pose="TALK_GESTURE"
          expression="HAPPY"
          frame={rFrame}
        />

        {/* Blue exterior Air Wave curving from mouth to ear */}
        <path
          d="M 1495 538 C 1585 524 1590 422 1455 412 C 1345 404 1320 492 1388 525"
          fill="none"
          stroke="#0284c7"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeDasharray="16 10"
          strokeDashoffset={-rightAir}
        />
        {/* Warm orange internal Bone Conduction glow pulsing right inside head */}
        <circle
          cx="1435"
          cy="525"
          r={24 + (rightBone % 24)}
          fill="none"
          stroke="#ea580c"
          strokeWidth="6"
          opacity={rightActive ? 0.85 - (rightBone % 24) / 30 : 0.6}
        />

        {/* Compact dual legend badges inside right half */}
        <g transform="translate(1150, 315)">
          <rect x="-135" y="-32" width="270" height="64" rx="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3.5" />
          <text x="0" y="9" textAnchor="middle" fill="#0369a1" fontSize="22" fontWeight="800">
            1. Sóng không khí
          </text>
        </g>
        <g transform="translate(1725, 315)">
          <rect x="-135" y="-32" width="270" height="64" rx="18" fill="#ffedd5" stroke="#ea580c" strokeWidth="3.5" />
          <text x="0" y="9" textAnchor="middle" fill="#c2410c" fontSize="22" fontWeight="800">
            2. Sóng xương sọ
          </text>
        </g>

        {/* Step 0 Dim Overlay freezing & dimming the right side completely */}
        {!rightActive && (
          <rect x="960" y="135" width="960" height="945" fill="#0f172a" opacity="0.58" />
        )}
      </g>

      {/* Crisp Center Split Divider */}
      <line x1="960" y1="135" x2="960" y2="830" stroke={INK} strokeWidth="6" />
    </svg>
  );
};

/* ============================================================================
 * 6. GHIAM_SKULL_BASS_FILTER (b23–b26, steps 0, 1, 2, 3)
 *    - Step 0: Acoustic wooden guitar resonance body ≈ skull resonance chamber.
 *    - Step 1: Long orange low-frequency bass waves pass & amplify through skull bone.
 *    - Step 2: Dense blue high-frequency treble waves mostly exit out into open air.
 *    - Step 3: Warm rich composite waveform in your head ("Trầm ấm, dày vang").
 * ========================================================================== */
export const GhiAmSkullBassFilterVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const phase = frame * 0.14;

  // Build smooth animated sine waves
  const makeSine = (x0: number, y0: number, len: number, amp: number, cycles: number, speed: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      const px = x0 + t * len;
      const py = y0 + Math.sin(t * Math.PI * 2 * cycles - frame * speed) * amp;
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga6_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga6_bg)" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Hộp sọ giống hệt một chiếc thùng đàn gỗ'
            : activeStep === 1
              ? 'Xương sọ khuếch đại mạnh dải âm trầm'
              : activeStep === 2
                ? 'Âm cao truyền kém qua xương, thoát ra không khí'
                : 'Giọng tự nghe trong đầu luôn trầm ấm hơn thực tế'
        }
        bg="#ffffff"
        color="#92400e"
        border="#d97706"
        fontSize={31}
      />

      {/* STEP 0: Guitar Soundbox ≈ Skull Resonance Chamber */}
      {activeStep === 0 && (
        <g>
          {/* Left Card: Acoustic Wooden Guitar Body */}
          <g transform="translate(520, 485)">
            <rect x="-275" y="-270" width="550" height="540" rx="34" fill="#ffffff" stroke="#d97706" strokeWidth="5" />
            {/* Wooden Guitar Body */}
            <path
              d="M -60 -150 C -115 -140 -122 -55 -84 -18 C -138 25 -134 150 -52 162 L 52 162 C 134 150 138 25 84 -18 C 122 -55 115 -140 60 -150 Z"
              fill="#d97706"
              stroke={INK}
              strokeWidth="5"
            />
            <circle cx="0" cy="-12" r="46" fill="#451a03" stroke="#fde68a" strokeWidth="6" />
            {/* Vibrating Strings */}
            {[-12, -4, 4, 12].map((sx, idx) => (
              <line
                key={idx}
                x1={sx + Math.sin(phase + idx) * 2.5}
                y1="-150"
                x2={sx}
                y2="110"
                stroke="#fef3c7"
                strokeWidth="2.8"
              />
            ))}
            <rect x="-46" y="102" width="92" height="18" rx="4" fill="#451a03" stroke={INK} strokeWidth="3" />
            {/* Warm resonance rings inside soundbox */}
            <circle cx="0" cy="-12" r={62 + (frame % 26) * 2.4} fill="none" stroke="#f97316" strokeWidth="4" opacity={1 - (frame % 26) / 26} />
            <text x="0" y="226" textAnchor="middle" fill="#92400e" fontSize="30" fontWeight="800">
              Thùng đàn gỗ cộng hưởng
            </text>
          </g>

          {/* Center ≈ badge */}
          <circle cx="960" cy="485" r="56" fill="#f59e0b" stroke={INK} strokeWidth="5" />
          <text x="960" y="502" textAnchor="middle" fill="#ffffff" fontSize="58" fontWeight="900">
            ≈
          </text>

          {/* Right Card: Skull Resonance Chamber */}
          <g transform="translate(1400, 485)">
            <rect x="-275" y="-270" width="550" height="540" rx="34" fill="#ffffff" stroke="#ea580c" strokeWidth="5" />
            {/* Stylized Skull Resonance Silhouette */}
            <path
              d="M -112 -24 C -118 -124 -52 -184 26 -184 C 102 -184 148 -132 146 -42 C 144 10 120 44 106 78 L 106 132 L -42 132 L -56 80 C -92 56 -110 20 -112 -24 Z"
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            {[0, 1, 2].map((i) => {
              const r = 34 + ((frame * 1.8 + i * 28) % 84);
              return (
                <circle key={i} cx="14" cy="-36" r={r} fill="none" stroke="#ea580c" strokeWidth="5" opacity={1 - r / 120} />
              );
            })}
            <text x="0" y="226" textAnchor="middle" fill="#c2410c" fontSize="30" fontWeight="800">
              Hộp sọ &amp; mô mềm
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: Low-frequency Long Orange Bass Waves passing strongly through thick Skull Bone Wall */}
      {activeStep === 1 && (
        <g>
          {/* Thick Bone Filter Barrier in Center */}
          <rect x="865" y="195" width="190" height="575" rx="32" fill="#fef3c7" stroke="#d97706" strokeWidth="6" />
          <text x="960" y="255" textAnchor="middle" fill="#92400e" fontSize="26" fontWeight="800">
            XƯƠNG SỌ
          </text>
          {/* Bone porous texture dots */}
          {[320, 420, 520, 620, 700].map((by, idx) => (
            <g key={idx} opacity="0.45">
              <circle cx={918 + (idx % 2) * 35} cy={by} r="10" fill="#f59e0b" />
              <circle cx={995 - (idx % 2) * 30} cy={by + 20} r="8" fill="#d97706" />
            </g>
          ))}

          {/* Incoming Orange Low-Frequency Wave (Left) */}
          <polyline points={makeSine(160, 485, 690, 46, 2.2, 0.16)} fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round" />
          {/* Amplified Thick Orange Wave exiting Right! */}
          <polyline points={makeSine(1065, 485, 695, 76, 2.2, 0.16)} fill="none" stroke="#ea580c" strokeWidth="15" strokeLinecap="round" />
          <polygon points="1775,485 1742,464 1742,506" fill="#ea580c" />

          <CleanLabel x={460} y={660} text="Sóng âm trầm (gợn dài)" bg="#ffffff" color="#c2410c" border="#f97316" fontSize={24} />
          <CleanLabel x={1440} y={660} text="Cộng hưởng dày & ấm hơn!" bg="#ffedd5" color="#9a3412" border="#ea580c" fontSize={25} />
        </g>
      )}

      {/* STEP 2: High-frequency Dense Blue Waves blocked/weakened by skull, exiting mostly into air */}
      {activeStep === 2 && (
        <g>
          <rect x="865" y="195" width="190" height="575" rx="32" fill="#fef3c7" stroke="#d97706" strokeWidth="6" />
          <text x="960" y="255" textAnchor="middle" fill="#92400e" fontSize="26" fontWeight="800">
            XƯƠNG SỌ
          </text>

          {/* Incoming High-Frequency Dense Blue Wave */}
          <polyline points={makeSine(160, 485, 690, 42, 9.5, 0.34)} fill="none" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />

          {/* Tiny dampened blue ripple through bone */}
          <polyline points={makeSine(1065, 485, 640, 10, 9.5, 0.34)} fill="none" stroke="#94a3b8" strokeWidth="3.5" strokeDasharray="8 8" opacity="0.65" />

          {/* Blue high-frequency wave deflecting UP & OUT into open air */}
          <path
            d="M 850 475 C 760 400 720 315 580 250"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="14 10"
            strokeDashoffset={-(frame * 3.8)}
          />
          <polygon points="566,244 596,240 582,268" fill="#0ea5e9" />

          <CleanLabel x={460} y={248} text="Thoát ra ngoài không khí" bg="#e0f2fe" color="#0369a1" border="#0284c7" fontSize={24} />
          <CleanLabel x={1420} y={630} text="Truyền rất yếu qua xương" bg="#f1f5f9" color="#475569" border="#94a3b8" fontSize={24} />
        </g>
      )}

      {/* STEP 3: Composite Warm Voice Inside Your Head */}
      {activeStep === 3 && (
        <g>
          <rect x="260" y="190" width="1400" height="575" rx="38" fill="#ffffff" stroke="#ea580c" strokeWidth="5.5" />

          {/* Rich Layered Composite Waveform (Warm Orange Bass Glow + Crisp Blue Voice Core) */}
          <polyline points={makeSine(360, 465, 1200, 92, 3.2, 0.14)} fill="none" stroke="#fed7aa" strokeWidth="36" strokeLinecap="round" />
          <polyline points={makeSine(360, 465, 1200, 92, 3.2, 0.14)} fill="none" stroke="#ea580c" strokeWidth="14" strokeLinecap="round" />
          <polyline points={makeSine(360, 465, 1200, 46, 8.5, 0.24)} fill="none" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" opacity="0.78" />

          <text x="960" y="275" textAnchor="middle" fill="#9a3412" fontSize="34" fontWeight="900">
            GIỌNG NÓI BẠN TỰ NGHE TRONG ĐẦU
          </text>
          <text x="960" y="685" textAnchor="middle" fill="#c2410c" fontSize="30" fontWeight="800">
            Trầm hơn • Vang hơn • Giàu nội lực hơn
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 7. GHIAM_RECORDING_STRIP_BASS (b27–b30, steps 0, 1, 2, 3)
 *    - Step 0: Smartphone on wooden table playing back recording.
 *    - Step 1: Clean 2D frequency bar spectrum showing orange bass layer DROPPED OFF, blue highs left.
 *    - Step 2: Head cutaway with orange bone-conduction channel fading out completely.
 *    - Step 3: Side-by-side waveform contrast: stripped thin high blue voice reaching ear.
 * ========================================================================== */
export const GhiAmRecordingStripBassVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const bassBars = [180, 210, 195, 165, 130];
  const highBars = [145, 185, 205, 170, 150, 120];
  const bassDrop = activeStep === 1 ? clamp01(p * 1.6) : 1;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga7_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga7_bg)" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Khi phát bản ghi âm: Không còn đường xương sọ'
            : activeStep === 1
              ? 'Lớp âm trầm từ hộp sọ bị tắt sạch!'
              : activeStep === 2
                ? 'Chỉ còn sóng không khí đi vào màng nhĩ'
                : 'Đây mới là giọng thật người ngoài vẫn nghe'
        }
        bg="#ffffff"
        color="#0369a1"
        border="#0284c7"
        fontSize={31}
      />

      {/* STEP 0: Phone on wooden table playing blue air-only waves */}
      {activeStep === 0 && (
        <g>
          <rect x="0" y="795" width="1920" height="285" fill="#cbd5e1" />
          <line x1="0" y1="795" x2="1920" y2="795" stroke="#94a3b8" strokeWidth="4" />

          <WoodenTable x={960} topY={645} floorY={795} width={380} />
          <SmartphoneProp x={960} y={645} scale={1.55} mode="PLAYING" flatOnTable={true} frame={frame} />

          {[0, 1, 2, 3].map((i) => {
            const r = 60 + ((frame * 3.4 + i * 58) % 230);
            return (
              <circle
                key={i}
                cx="960"
                cy="550"
                r={r}
                fill="none"
                stroke="#0284c7"
                strokeWidth="6"
                opacity={Math.max(0.08, 1 - r / 290)}
              />
            );
          })}
          <CleanLabel x={960} y={255} text="Loa điện thoại chỉ phát qua không khí" bg="#e0f2fe" color="#0369a1" border="#0284c7" fontSize={26} />
        </g>
      )}

      {/* STEP 1: Clean Frequency Spectrum Bars — Orange Bass Layer Drops to Zero */}
      {activeStep === 1 && (
        <g transform="translate(260, 195)">
          <rect x="0" y="0" width="1400" height="575" rx="34" fill="#ffffff" stroke="#94a3b8" strokeWidth="4.5" />
          <line x1="110" y1="455" x2="1290" y2="455" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />

          {/* Left Group: Bass (Âm trầm xương sọ — DROPS TO ZERO) */}
          {bassBars.map((bh, idx) => {
            const h = lerp(bh, 14, bassDrop);
            return (
              <rect
                key={`b-${idx}`}
                x={160 + idx * 88}
                y={455 - h}
                width="58"
                height={h}
                rx="10"
                fill={bassDrop > 0.7 ? '#cbd5e1' : '#f97316'}
                stroke={bassDrop > 0.7 ? '#94a3b8' : '#c2410c'}
                strokeWidth="3.5"
              />
            );
          })}
          <text x="365" y="512" textAnchor="middle" fill="#dc2626" fontSize="27" fontWeight="800">
            Âm trầm xương sọ (BỊ MẤT)
          </text>
          {/* Red X over muted bass area */}
          <g transform="translate(365, 295)" opacity={bassDrop}>
            <circle cx="0" cy="0" r="46" fill="#fee2e2" stroke="#ef4444" strokeWidth="5" />
            <line x1="-18" y1="-18" x2="18" y2="18" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
            <line x1="18" y1="-18" x2="-18" y2="18" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
          </g>

          {/* Divider */}
          <line x1="650" y1="95" x2="650" y2="530" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="10 10" />

          {/* Right Group: Mid/High (Âm trung & cao — ACTIVE BLUE) */}
          {highBars.map((hh, idx) => {
            const animH = hh + Math.sin(frame * 0.28 + idx * 1.1) * 24;
            return (
              <rect
                key={`h-${idx}`}
                x={710 + idx * 88}
                y={455 - animH}
                width="58"
                height={animH}
                rx="10"
                fill="#0ea5e9"
                stroke="#0369a1"
                strokeWidth="3.5"
              />
            );
          })}
          <text x="975" y="512" textAnchor="middle" fill="#0369a1" fontSize="27" fontWeight="800">
            Âm trung &amp; cao (CÒN LẠI)
          </text>
        </g>
      )}

      {/* STEP 2: Head Cutaway where Orange Bone Channel Fades Completely Out */}
      {activeStep === 2 && (
        <g>
          <VocalEarCutawayDiagram
            x={940}
            y={505}
            scale={1.12}
            frame={frame}
            uid="ga7_cut"
            vocalActive={false}
            airStage={3}
            boneStage={1}
            boneFadeOpacity={lerp(0.65, 0.06, p)}
          />
          <g transform="translate(1340, 480)">
            <rect x="0" y="0" width="400" height="114" rx="22" fill="#ffffff" stroke="#ef4444" strokeWidth="4" />
            <text x="200" y="46" textAnchor="middle" fill="#b91c1c" fontSize="26" fontWeight="800">
              Đường xương sọ biến mất
            </text>
            <text x="200" y="84" textAnchor="middle" fill="#475569" fontSize="21" fontWeight="600">
              Chỉ còn sóng xanh đi vào tai
            </text>
          </g>
        </g>
      )}

      {/* STEP 3: Comparison Card — Warm Thick Faded vs Thin High Blue Real Voice */}
      {activeStep === 3 && (
        <g>
          <g transform="translate(500, 465)" opacity="0.45">
            <rect x="-320" y="-235" width="640" height="470" rx="34" fill="#fff7ed" stroke="#fdba74" strokeWidth="4" />
            <text x="0" y="-155" textAnchor="middle" fill="#9a3412" fontSize="30" fontWeight="800">
              Giọng bạn quen trong đầu
            </text>
            <path d="M -230 0 Q -150 -85 -70 0 T 90 0 T 230 0" fill="none" stroke="#ea580c" strokeWidth="22" strokeLinecap="round" />
            <text x="0" y="155" textAnchor="middle" fill="#9a3412" fontSize="26" fontWeight="700">
              Dày • Trầm ấm (có xương sọ)
            </text>
          </g>

          <g transform="translate(1420, 465)">
            <rect x="-320" y="-235" width="640" height="470" rx="34" fill="#ffffff" stroke="#0284c7" strokeWidth="6" />
            <text x="0" y="-155" textAnchor="middle" fill="#0369a1" fontSize="30" fontWeight="800">
              Giọng trong bản ghi âm
            </text>
            <path
              d="M -230 0 Q -200 -55 -170 0 T -110 0 T -50 0 T 10 0 T 70 0 T 130 0 T 190 0 T 230 0"
              fill="none"
              stroke="#0284c7"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <text x="0" y="155" textAnchor="middle" fill="#0369a1" fontSize="26" fontWeight="800">
              Mỏng &amp; cao hơn — Đúng giọng thật!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 8. GHIAM_VOICE_CONFRONTATION (b33–b36, steps 0, 1, 2, 3)
 *    - Step 0: Brain storing golden "Bản mẫu giọng quen thuộc (trầm ấm)" card.
 *    - Step 1: Blue recording waveform flies in & tries matching → visibly out of phase!
 *    - Step 2: Brain emits gentle mismatch alert ring ("Lệch pha!").
 *    - Step 3: BOY standing on grounded floor looking slightly embarrassed/sheepish.
 * ========================================================================== */
export const GhiAmVoiceConfrontationVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);
  const flyX = activeStep === 1 ? lerp(380, 0, clamp01(p * 1.4)) : 0;
  const shakeX = activeStep === 2 ? Math.sin(frame * 0.55) * 5 : 0;

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ display: 'block', fontFamily: FONT }}>
      <defs>
        <linearGradient id="ga8_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf2f8" />
          <stop offset="100%" stopColor="#fce7f3" />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill="url(#ga8_bg)" />

      {/* Single Top Header */}
      <CleanLabel
        x={960}
        y={84}
        text={
          activeStep === 0
            ? 'Tâm lý học: Phản ứng đối đầu giọng nói'
            : activeStep === 1
              ? 'Não khớp thử bản ghi âm nhưng bị lệch pha!'
              : activeStep === 2
                ? 'Tín hiệu báo lệch gây cảm giác bất an'
                : 'Não thấy lạ nên bạn bỗng thấy ngượng'
        }
        bg="#ffffff"
        color="#9d174d"
        border="#db2777"
        fontSize={31}
      />

      {/* STEPS 0, 1, 2: Clean Stylized Brain Memory Matching Scene */}
      {activeStep <= 2 && (
        <g transform={`translate(${960 + shakeX}, 470)`}>
          {/* Gentle alert ripple in Step 2 */}
          {activeStep === 2 && (
            <circle
              cx="0"
              cy="0"
              r={245 + (frame % 24) * 4.5}
              fill="none"
              stroke="#ef4444"
              strokeWidth="6"
              opacity={1 - (frame % 24) / 24}
            />
          )}

          {/* Stylized 2D Brain Silhouette */}
          <path
            d="M -290 35 C -335 -105 -220 -255 -30 -255 C 165 -255 315 -140 305 20 C 295 145 190 215 60 205 C 10 200 -20 245 -75 240 C -175 230 -265 155 -290 35 Z"
            fill="#fbcfe8"
            stroke="#be185d"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Stored Golden Memory Card inside Brain */}
          <g transform="translate(0, -45)">
            <rect x="-235" y="-92" width="470" height="162" rx="24" fill="#fffbeb" stroke="#d97706" strokeWidth="5" />
            <text x="0" y="-44" textAnchor="middle" fill="#92400e" fontSize="24" fontWeight="800">
              BẢN MẪU GIỌNG QUEN THUỘC
            </text>
            <path d="M -175 18 Q -120 -32 -65 18 T 45 18 T 175 18" fill="none" stroke="#ea580c" strokeWidth="13" strokeLinecap="round" />
          </g>

          {/* Step 1 & 2: Incoming Blue Recording Card trying to match → MISMATCH */}
          {activeStep >= 1 && (
            <g transform={`translate(${flyX}, 125)`}>
              <rect
                x="-235"
                y="-56"
                width="470"
                height="122"
                rx="22"
                fill="#e0f2fe"
                stroke={activeStep === 2 ? '#ef4444' : '#0284c7'}
                strokeWidth="5"
              />
              <text x="0" y="-16" textAnchor="middle" fill="#0369a1" fontSize="22" fontWeight="800">
                Bản ghi âm mới (cao &amp; mỏng)
              </text>
              <path
                d="M -175 26 Q -150 -8 -125 26 T -75 26 T -25 26 T 25 26 T 75 26 T 125 26 T 175 26"
                fill="none"
                stroke="#0284c7"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Step 2 Mismatch Badge */}
          {activeStep === 2 && (
            <g transform="translate(275, -145)">
              <rect x="-118" y="-42" width="236" height="84" rx="42" fill="#fee2e2" stroke="#ef4444" strokeWidth="5" />
              <text x="0" y="10" textAnchor="middle" fill="#b91c1c" fontSize="28" fontWeight="900">
                Lệch pha!
              </text>
            </g>
          )}
        </g>
      )}

      {/* STEP 3: BOY grounded on floor looking awkward/embarrassed */}
      {activeStep === 3 && (
        <g>
          <rect x="0" y="795" width="1920" height="285" fill="#fbcfe8" opacity="0.45" />
          <line x1="0" y1="795" x2="1920" y2="795" stroke="#f472b6" strokeWidth="4" />

          <SharedStickman
            x={820}
            y={679}
            scale={1.04}
            role="BOY"
            facing="RIGHT"
            pose="IDLE"
            expression="EMBARRASSED"
            frame={frame}
          />

          {/* Clean thought bubble showing mismatched warm vs thin blue wave */}
          <g transform="translate(1210, 390)">
            <circle cx="-245" cy="95" r="12" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
            <circle cx="-205" cy="65" r="18" fill="#ffffff" stroke={INK} strokeWidth="3.5" />
            <rect x="-185" y="-120" width="440" height="235" rx="44" fill="#ffffff" stroke={INK} strokeWidth="4.5" />
            <path d="M -125 -32 Q -75 -76 -25 -32 T 75 -32 T 185 -32" fill="none" stroke="#ea580c" strokeWidth="11" strokeLinecap="round" />
            <text x="35" y="12" textAnchor="middle" fill="#ef4444" fontSize="26" fontWeight="900">
              ≠
            </text>
            <path d="M -125 56 Q -105 24 -85 56 T -45 56 T -5 56 T 35 56 T 75 56 T 115 56 T 185 56" fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>
      )}
    </svg>
  );
};
