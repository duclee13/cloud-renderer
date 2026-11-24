import React from 'react';
import type { EpisodeVisualProps } from './index';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  CleanLabel,
  ShortSpeechBubble,
  WoodenSideTable,
  IceCreamCone,
  SharedStickman,
  IcedDrinkGlass,
  HeadCutawayDiagram,
  SummerPorchBackdrop,
} from './nuocDaSharedAssets';

/* ============================================================================
 * 1. NUOCDA_HOT_NOON_GULP — NuocDaHotNoonGulpVisual
 *    - Clean storytelling porch scene (NO % UI card, NO redundant pills!)
 *    - Expanded 38°C badge with generous right padding (>= 24px)
 *    - Properly proportioned iced glass (~1/3 boy height) on wooden table
 *    - Step 1: BOY stands clearly on left holding glass directly to mouth with both hands
 * ========================================================================== */
export const NuocDaHotNoonGulpVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const heatPulse = 1 + Math.sin(frame * 0.08) * 0.03;
  const sweatOffset = (frame * 1.6) % 48;
  const gulpFill = activeStep === 0 ? 0.92 : activeStep === 1 ? lerp(0.92, 0.14, p) : 0.14;
  const tiltDeg = lerp(-12, -32, p);
  const shiverX = activeStep === 2 ? Math.sin(frame * 0.95) * 3.2 : 0;
  const boltPulse = 0.85 + Math.sin(frame * 0.35) * 0.18;

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="nd1_tableTopGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D99B66" />
          <stop offset="100%" stopColor="#B4733D" />
        </linearGradient>
        <linearGradient id="nd1_tableLegGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8C5225" />
          <stop offset="100%" stopColor="#A66533" />
        </linearGradient>
        <radialGradient id="nd1_freezeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#EF4444" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nd1_thermoFill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>

      {/* Porch Backdrop (single custom table below — no duplicate overlapping table!) */}
      <SummerPorchBackdrop
        frame={frame}
        heatIntensity={activeStep === 2 ? 0.65 : 1}
        timeOfDay="NOON"
        showTable={false}
      />

      {/* Top-Left 38°C Thermometer Badge — widened to 292px so "Trưa nắng gắt" has >= 28px right padding */}
      <g transform={`translate(96, 68) scale(${heatPulse})`}>
        <rect
          x={0}
          y={0}
          width={292}
          height={118}
          rx={24}
          fill="#FFF7ED"
          stroke="#EA580C"
          strokeWidth={4}
        />
        <g transform="translate(34, 18)">
          <rect x={11} y={4} width={16} height={54} rx={8} fill="#FED7AA" stroke={INK} strokeWidth={3} />
          <rect x={15} y={12} width={8} height={46} rx={4} fill="url(#nd1_thermoFill)" />
          <circle cx={19} cy={66} r={14} fill="#EF4444" stroke={INK} strokeWidth={3} />
          <circle cx={15} cy={62} r={4} fill="#FCA5A5" />
        </g>
        <text x={94} y={58} fontFamily={FONT} fontSize={40} fontWeight={900} fill="#C2410C">
          38°C
        </text>
        <text x={94} y={94} fontFamily={FONT} fontSize={22} fontWeight={700} fill="#9A3412">
          Trưa nắng gắt
        </text>
      </g>

      {/* Single Wooden Porch Table on the right (feet firmly on tiled porch floor at y = 815) */}
      <g>
        <ellipse cx={1360} cy={818} rx={210} ry={16} fill="#451a03" opacity={0.2} />
        <rect x={1185} y={666} width={28} height={150} rx={5} fill="url(#nd1_tableLegGrad)" stroke={INK} strokeWidth={4} />
        <rect x={1508} y={666} width={28} height={150} rx={5} fill="url(#nd1_tableLegGrad)" stroke={INK} strokeWidth={4} />
        <rect x={1135} y={634} width={450} height={38} rx={12} fill="url(#nd1_tableTopGrad)" stroke={INK} strokeWidth={4} />
        <line x1={1158} y1={652} x2={1560} y2={652} stroke="#8C5225" strokeWidth={3} opacity={0.45} />
      </g>

      {/* STEP 0: Tired BOY arrives on left, eyeing proportioned frosty iced tea glass on table */}
      {activeStep === 0 && (
        <g>
          <SharedStickman
            x={720}
            y={700}
            scale={1.06}
            role="BOY"
            facing="RIGHT"
            pose="IDLE"
            expression="TIRED"
            frame={frame}
          />

          {/* Sweat droplets */}
          {[0, 1].map((i) => {
            const dy = (sweatOffset + i * 24) % 48;
            const alpha = 1 - dy / 48;
            return (
              <path
                key={i}
                d={`M ${660 - i * 22} ${508 + dy} q -5 10 0 15 a 6 6 0 1 0 9 -9 z`}
                fill="#38BDF8"
                stroke="#0284C7"
                strokeWidth={2}
                opacity={alpha}
              />
            );
          })}

          {/* Properly proportioned frosty glass (~1/3 of BOY height) resting flush on tabletop y = 634 */}
          <IcedDrinkGlass
            x={1355}
            y={584}
            scale={0.62}
            fillPct={0.92}
            showFrost={true}
            frame={frame}
            uid="nd1_s0"
          />

          <ShortSpeechBubble x={720} y={445} text="Nóng quá trời!" tailDir="CENTER" />
        </g>
      )}

      {/* STEP 1: BOY stands cleanly on left holding glass DIRECTLY with both bent arms to his mouth! */}
      {activeStep === 1 && (
        <g>
          <SharedStickman
            x={790}
            y={700}
            scale={1.08}
            role="BOY"
            facing="RIGHT"
            pose="DRINK_FAST"
            expression="HAPPY"
            frame={frame}
            drinkFillPct={gulpFill}
            drinkTiltDeg={tiltDeg}
            uid="nd1_s1"
          />
          <ShortSpeechBubble x={760} y={435} text="Ực ực! Đã quá!" tailDir="CENTER" />
        </g>
      )}

      {/* STEP 2: 5 seconds later — glass set back on table, BOY clutching forehead in brain-freeze pain */}
      {activeStep === 2 && (
        <g>
          <CleanLabel
            x={960}
            y={104}
            text="5 giây sau..."
            bg="#FEF2F2"
            color="#DC2626"
            border="#EF4444"
            fontSize={30}
          />

          {/* Nearly empty iced glass back on table with small condensation ring */}
          <IcedDrinkGlass
            x={1355}
            y={584}
            scale={0.62}
            fillPct={0.14}
            showFrost={true}
            frame={frame}
            uid="nd1_s2"
          />
          <ellipse cx={1355} cy={638} rx={44} ry={7} fill="#38BDF8" opacity={0.45} />

          {/* BOY clutching forehead in sudden pain */}
          <g transform={`translate(${shiverX}, 0)`}>
            <circle cx={810} cy={538} r={130 * boltPulse} fill="url(#nd1_freezeGlow)" />

            <SharedStickman
              x={810}
              y={700}
              scale={1.08}
              role="BOY"
              facing="RIGHT"
              pose="HOLD_HEAD_PAIN"
              expression="PAIN"
              frame={frame}
            />

            <g transform={`translate(810, 530) scale(${boltPulse})`}>
              {[
                { rot: -135, color: '#38BDF8' },
                { rot: -95, color: '#EF4444' },
                { rot: -55, color: '#38BDF8' },
                { rot: -18, color: '#EF4444' },
                { rot: -165, color: '#EF4444' },
                { rot: 15, color: '#38BDF8' },
              ].map((b, idx) => (
                <g key={idx} transform={`rotate(${b.rot}) translate(76, 0)`}>
                  <polyline
                    points="0,0 22,-9 16,7 44,-5 34,9 60,0"
                    fill="none"
                    stroke={b.color}
                    strokeWidth={6.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              ))}
            </g>
          </g>

          <ShortSpeechBubble x={535} y={420} text="Á! Buốt tận óc!" tailDir="RIGHT" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 2. NUOCDA_BRAIN_NOT_FROZEN — NuocDaBrainNotFrozenVisual
 *    - Stripped ALL duplicate bottom pills! Only 1 crisp top title per step.
 * ========================================================================== */
export const NuocDaBrainNotFrozenVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const warmPulse = 0.88 + Math.sin(frame * 0.09) * 0.12;
  const crossDraw = clamp01(p * 1.6);
  const crossLen = 360;
  const tissueFloat = Math.sin(frame * 0.07) * 5;

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="nd2_bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <radialGradient id="nd2_warmBrainGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FB7185" stopOpacity="0.6" />
          <stop offset="65%" stopColor="#F43F5E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nd2_iceCubeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="55%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <clipPath id="nd2_tissueClip">
          <circle cx={1360} cy={455} r={185} />
        </clipPath>
      </defs>

      <rect width={1920} height={1080} fill="url(#nd2_bgGrad)" />
      <g opacity={0.14}>
        {Array.from({ length: 12 }).map((_, r) =>
          Array.from({ length: 20 }).map((__, c) => (
            <circle key={`${r}-${c}`} cx={80 + c * 92} cy={70 + r * 72} r={2.5} fill="#94A3B8" />
          )),
        )}
      </g>

      {/* Single Top Section Title (NO duplicate bottom pills!) */}
      {activeStep === 0 && (
        <CleanLabel
          x={960}
          y={102}
          text="Đóng băng não? — Hiểu lầm phổ biến!"
          bg="#1E293B"
          color="#F8FAFC"
          border="#38BDF8"
          fontSize={34}
        />
      )}
      {activeStep === 1 && (
        <CleanLabel
          x={960}
          y={102}
          text="Sự thật: Não KHÔNG hề bị đóng băng!"
          bg="#064E3B"
          color="#ECFDF5"
          border="#10B981"
          fontSize={34}
        />
      )}
      {activeStep === 2 && (
        <CleanLabel
          x={960}
          y={102}
          text="Mô não không có dây thần kinh đau"
          bg="#312E81"
          color="#EEF2FF"
          border="#818CF8"
          fontSize={34}
        />
      )}

      {/* STEP 0: Humorous crossed-out ice cube inside cartoon brain */}
      {activeStep === 0 && (
        <g transform={`translate(960, 480) translate(0, ${tissueFloat})`}>
          <path
            d="M -225 42 C -272 -42 -230 -175 -118 -196 C -58 -232 58 -232 118 -196 C 230 -175 272 -42 225 42 C 230 122 150 175 70 154 C 28 180 -28 180 -70 154 C -150 175 -230 122 -225 42 Z"
            fill="#FDA4AF"
            stroke="#FFF1F2"
            strokeWidth={8}
          />
          <path
            d="M -155 -68 Q -112 -132 -48 -95 M 155 -68 Q 112 -132 48 -95 M -160 38 Q -102 80 -42 48 M 160 38 Q 102 80 42 48"
            fill="none"
            stroke="#E11D48"
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.55}
          />

          <g transform="translate(-88, -96)">
            <rect
              x={0}
              y={0}
              width={176}
              height={176}
              rx={26}
              fill="url(#nd2_iceCubeGrad)"
              fillOpacity={0.9}
              stroke="#E0F2FE"
              strokeWidth={6}
            />
            <path d="M 28 32 L 74 32 L 28 78 Z" fill="#FFFFFF" opacity={0.65} />
            <circle cx={128} cy={128} r={12} fill="#FFFFFF" opacity={0.45} />
            <circle cx={104} cy={145} r={7} fill="#FFFFFF" opacity={0.4} />
          </g>

          <line
            x1={-145}
            y1={-145}
            x2={145}
            y2={145}
            stroke="#EF4444"
            strokeWidth={24}
            strokeLinecap="round"
            strokeDasharray={crossLen}
            strokeDashoffset={crossLen * (1 - crossDraw)}
          />
          <line
            x1={145}
            y1={-145}
            x2={-145}
            y2={145}
            stroke="#EF4444"
            strokeWidth={24}
            strokeLinecap="round"
            strokeDasharray={crossLen}
            strokeDashoffset={crossLen * (1 - clamp01((p - 0.25) * 1.8))}
          />
        </g>
      )}

      {/* STEP 1: Warm coral-pink brain + digital thermometer locked at 37.0°C (NO duplicate bottom pill!) */}
      {activeStep === 1 && (
        <g>
          <circle cx={675} cy={430} r={195 * warmPulse} fill="url(#nd2_warmBrainGlow)" />

          <HeadCutawayDiagram
            x={675}
            y={505}
            scale={1.12}
            coldPalatePct={0.1}
            foreheadPainPct={0}
            showTrigeminal={false}
            showVesselDilate={0}
            frame={frame}
            uid="nd2_s1"
          />

          <line x1={845} y1={420} x2={1125} y2={420} stroke="#FB7185" strokeWidth={5} strokeDasharray="12 10" />
          <circle cx={845} cy={420} r={9} fill="#FB7185" />

          <g transform="translate(1130, 265)">
            <rect x={0} y={0} width={530} height={340} rx={28} fill="#0F172A" stroke="#FB7185" strokeWidth={5} />
            <text x={265} y={54} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={800} fill="#FDA4AF">
              NHIỆT ĐỘ BÊN TRONG NÃO
            </text>
            <rect x={45} y={80} width={440} height={126} rx={18} fill="#1E293B" stroke="#475569" strokeWidth={3} />
            <text x={265} y={166} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill="#FB7185">
              37.0°C
            </text>
            <line x1={55} y1={264} x2={475} y2={264} stroke="#334155" strokeWidth={3} />
            <path d="M 55 264 L 475 264" stroke="#34D399" strokeWidth={6} strokeLinecap="round" />
            <circle cx={55 + ((frame * 4.5) % 420)} cy={264} r={8} fill="#34D399" />
            <text x={265} y={308} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={700} fill="#A7F3D0">
              Ổn định tuyệt đối nhờ hộp sọ bảo vệ
            </text>
          </g>
        </g>
      )}

      {/* STEP 2: Zoomed brain tissue badge with "0 thụ thể đau" (NO duplicate bottom pill!) */}
      {activeStep === 2 && (
        <g>
          <HeadCutawayDiagram
            x={625}
            y={505}
            scale={1.08}
            coldPalatePct={0.15}
            foreheadPainPct={0}
            showTrigeminal={false}
            showVesselDilate={0}
            frame={frame}
            uid="nd2_s2"
          />

          <circle cx={630} cy={395} r={44} fill="none" stroke="#F59E0B" strokeWidth={5} strokeDasharray="8 6" />
          <line x1={674} y1={395} x2={1175} y2={440} stroke="#F59E0B" strokeWidth={4} strokeDasharray="10 8" />

          <g>
            <circle cx={1360} cy={455} r={192} fill="#1E293B" stroke="#818CF8" strokeWidth={7} />
            <g clipPath="url(#nd2_tissueClip)">
              <rect x={1160} y={260} width={400} height={400} fill="#4C1D95" opacity={0.35} />
              <path d="M 1150 380 Q 1240 310 1335 370 T 1560 360" fill="none" stroke="#F9A8D4" strokeWidth={26} strokeLinecap="round" opacity={0.75} />
              <path d="M 1150 475 Q 1260 410 1370 470 T 1565 465" fill="none" stroke="#F472B6" strokeWidth={26} strokeLinecap="round" opacity={0.75} />
              <path d="M 1150 565 Q 1255 510 1365 565 T 1565 560" fill="none" stroke="#F9A8D4" strokeWidth={24} strokeLinecap="round" opacity={0.7} />
              <circle cx={1360} cy={455} r={76} fill="#0F172A" fillOpacity={0.86} stroke="#F59E0B" strokeWidth={5} />
              <text x={1360} y={478} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill="#FBBF24">
                0
              </text>
            </g>
          </g>

          <CleanLabel
            x={1360}
            y={705}
            text="0 thụ thể đau"
            bg="#FEF3C7"
            color="#B45309"
            border="#F59E0B"
            fontSize={32}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 3. NUOCDA_PALATE_TARGET — NuocDaPalateTargetVisual
 *    - FIXED CRITICAL ANATOMY BUG: Cold blue stream now enters from OUTSIDE the
 *      mouth opening on the RIGHT, travels RIGHT -> LEFT into the oral cavity,
 *      and curves UP to hit the upper palate! ZERO blue lines behind neck/spine!
 * ========================================================================== */
export const NuocDaPalateTargetVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const palateCold = activeStep === 0 ? clamp01(p * 1.3) : 1;
  const streamOffset = -(frame * 6);
  const dropTemp = lerp(37, 8, clamp01(p * 1.3));
  const tempPct = clamp01((dropTemp - 0) / 40);
  const warnPulse = 1 + Math.sin(frame * 0.22) * 0.04;

  // HeadCutawayDiagram placed at x = 600, y = 495, scale = 1.12 (facing RIGHT):
  // -> Open mouth entrance is on the RIGHT at world (780, 574)
  // -> Upper palate (vòm miệng trên) is at world (716, 546)
  const headX = 600;
  const headY = 495;
  const palateWorldX = 716;
  const palateWorldY = 546;

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="nd3_bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="nd3_coldStreamGrad" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <clipPath id="nd3_insetClip">
          <circle cx={1435} cy={465} r={182} />
        </clipPath>
        <linearGradient id="nd3_gaugeGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      <rect width={1920} height={1080} fill="url(#nd3_bgGrad)" />

      {/* Single Top Banner */}
      <CleanLabel
        x={960}
        y={92}
        text="Điểm chịu lạnh trực tiếp: Vòm miệng trên"
        bg="#FFFFFF"
        color="#0F172A"
        border="#0284C7"
        fontSize={32}
      />

      {/* Head Cutaway Diagram facing RIGHT */}
      <HeadCutawayDiagram
        x={headX}
        y={headY}
        scale={1.12}
        coldPalatePct={palateCold}
        foreheadPainPct={activeStep === 2 ? 0.35 : 0}
        showTrigeminal={activeStep >= 1}
        showVesselDilate={0}
        frame={frame}
        uid="nd3_head"
      />

      {/* Anatomically CORRECT icy blue stream entering from OUTSIDE mouth on RIGHT -> curving UP onto upper palate */}
      <g>
        <path
          d="M 975 596 Q 868 594 786 575 Q 748 566 716 546"
          fill="none"
          stroke="url(#nd3_coldStreamGrad)"
          strokeWidth={18}
          strokeLinecap="round"
          opacity={0.88}
        />
        <path
          d="M 975 596 Q 868 594 786 575 Q 748 566 716 546"
          fill="none"
          stroke="#E0F2FE"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray="16 14"
          strokeDashoffset={streamOffset}
        />
        {/* Crisp arrow head entering from outside right */}
        <polygon points="895,591 916,580 916,602" fill="#0284C7" />

        {/* Cold splash droplets right on upper palate roof */}
        {[0, 1, 2].map((i) => {
          const r = 6 + ((frame * 0.6 + i * 7) % 16);
          return (
            <circle
              key={i}
              cx={704 + i * 15}
              cy={542 - i * 2}
              r={r * 0.42}
              fill="#38BDF8"
              opacity={0.78}
            />
          );
        })}
      </g>

      {/* STEP 0: Crisp label pointing from palate */}
      {activeStep === 0 && (
        <g>
          <path
            d="M 745 530 Q 930 430 1135 430"
            fill="none"
            stroke="#0284C7"
            strokeWidth={5}
            strokeDasharray="12 8"
          />
          <polygon points="1150,430 1126,416 1126,444" fill="#0284C7" />
          <CleanLabel
            x={1435}
            y={430}
            text="Luồng lạnh 0°C chạm vòm miệng"
            bg="#FFFFFF"
            color="#0369A1"
            border="#0284C7"
            fontSize={29}
          />
        </g>
      )}

      {/* STEP 1: Zoomed inset circle on right showing blood vessels + nerve endings */}
      {activeStep === 1 && (
        <g>
          <circle cx={palateWorldX} cy={palateWorldY} r={34} fill="none" stroke="#0284C7" strokeWidth={4} strokeDasharray="7 5" />
          <line x1={palateWorldX + 34} y1={palateWorldY - 12} x2={1245} y2={465} stroke="#0284C7" strokeWidth={4} strokeDasharray="10 8" />

          <circle cx={1435} cy={465} r={190} fill="#FFFFFF" stroke="#0284C7" strokeWidth={7} />
          <g clipPath="url(#nd3_insetClip)">
            <rect x={1245} y={275} width={380} height={380} fill="#FFF1F2" />
            <rect x={1245} y={570} width={380} height={95} fill="#FECDD3" />
            <line x1={1245} y1={570} x2={1625} y2={570} stroke="#FB7185" strokeWidth={5} />

            <g stroke="#DC2626" strokeLinecap="round" fill="none">
              <path d="M 1260 435 Q 1360 410 1460 450 T 1615 425" strokeWidth={11} />
              <path d="M 1270 500 Q 1370 525 1480 490 T 1610 515" strokeWidth={9} />
              <path d="M 1355 427 Q 1380 365 1425 330" strokeWidth={6} />
              <path d="M 1465 447 Q 1505 375 1550 340" strokeWidth={6} />
              <path d="M 1405 505 Q 1435 543 1470 561" strokeWidth={5} />
            </g>

            <g stroke="#EAB308" strokeLinecap="round" fill="none">
              <path d="M 1280 345 Q 1365 385 1430 475 L 1425 553" strokeWidth={7} />
              <path d="M 1430 475 L 1483 550" strokeWidth={5} />
              <path d="M 1430 475 L 1367 553" strokeWidth={5} />
              <path d="M 1560 360 Q 1515 425 1510 549" strokeWidth={6} />
            </g>
            {[
              [1425, 553],
              [1483, 550],
              [1367, 553],
              [1510, 549],
            ].map(([nx, ny], idx) => (
              <circle
                key={idx}
                cx={nx}
                cy={ny}
                r={7 + Math.sin(frame * 0.25 + idx) * 2.5}
                fill="#FACC15"
                stroke="#A16207"
                strokeWidth={2}
              />
            ))}
          </g>

          <CleanLabel
            x={1435}
            y={728}
            text="Mạng lưới mạch máu & dây thần kinh"
            bg="#FEFCE8"
            color="#854D0E"
            border="#EAB308"
            fontSize={26}
          />
        </g>
      )}

      {/* STEP 2: Temperature gauge dropping sharply 37°C -> 8°C */}
      {activeStep === 2 && (
        <g>
          <rect
            x={1215}
            y={235}
            width={430}
            height={420}
            rx={34}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={8}
            opacity={0.55 + Math.sin(frame * 0.22) * 0.35}
            transform={`translate(${1430 * (1 - warnPulse)}, ${445 * (1 - warnPulse)}) scale(${warnPulse})`}
          />

          <g transform="translate(1235, 255)">
            <rect x={0} y={0} width={390} height={380} rx={28} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={5} />
            <text x={195} y={48} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={800} fill="#92400E">
              NHIỆT ĐỘ VÒM MIỆNG
            </text>

            <rect x={64} y={82} width={44} height={240} rx={22} fill="#E2E8F0" stroke={INK} strokeWidth={3} />
            <rect
              x={70}
              y={88 + 228 * (1 - tempPct)}
              width={32}
              height={Math.max(18, 228 * tempPct)}
              rx={16}
              fill="url(#nd3_gaugeGrad)"
            />

            <text
              x={245}
              y={175}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={72}
              fontWeight={900}
              fill={dropTemp < 18 ? '#0284C7' : '#DC2626'}
            >
              {Math.round(dropTemp)}°C
            </text>
            <text x={245} y={236} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill="#B45309">
              37°C ↓ 8°C
            </text>
            <rect x={152} y={268} width={186} height={46} rx={14} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={3} />
            <text x={245} y={299} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={800} fill="#92400E">
              SỐC NHIỆT!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 4. NUOCDA_SPEED_VS_SLOW — NuocDaSpeedVsSlowVisual
 *    - Grounded floor + wooden side tables on BOTH halves (ZERO floating glasses!)
 *    - Left side matches narration 1-1 ("người ăn kem vèo trong chưa đầy 5 giây"):
 *      BOY holds ice cream cone eating fast, plus iced glass resting on small table!
 *    - Right side: BOY directly holds iced glass sipping slowly beside small table!
 * ========================================================================== */
export const NuocDaSpeedVsSlowVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const leftActive = activeStep === 0 || activeStep === 2;
  const rightActive = activeStep === 1 || activeStep === 2;
  const leftOpacity = leftActive ? 1 : 0.32;
  const rightOpacity = rightActive ? 1 : 0.32;
  const leftFrame = leftActive ? frame : 0;
  const rightFrame = rightActive ? frame : 0;

  const leftPain = activeStep === 0 ? p >= 0.52 : true;
  const leftThermoLevel = activeStep === 0 ? lerp(0.85, 0.2, p) : 0.2;
  const leftPulse = leftActive ? 1 + Math.sin(leftFrame * 0.2) * 0.04 : 1;
  const rightPulse = rightActive ? 1 + Math.sin(rightFrame * 0.08) * 0.025 : 1;

  const floorY = 790;

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="nd4_leftBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF2F2" />
          <stop offset="100%" stopColor="#FEE2E2" />
        </linearGradient>
        <linearGradient id="nd4_rightBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#D1FAE5" />
        </linearGradient>
      </defs>

      {/* LEFT PANEL (x = 0..960) */}
      <g opacity={leftOpacity}>
        <rect x={0} y={0} width={960} height={1080} fill="url(#nd4_leftBg)" />
        <rect x={0} y={floorY} width={960} height={290} fill="#FECACA" opacity={0.55} />
        <line x1={0} y1={floorY} x2={960} y2={floorY} stroke="#FCA5A5" strokeWidth={4} />

        <CleanLabel
          x={480}
          y={202}
          text="Ăn kem / uống vèo < 5 giây"
          bg="#FEE2E2"
          color="#B91C1C"
          border="#EF4444"
          fontSize={29}
        />

        {/* Small wooden side table resting solidly on floorY */}
        <WoodenSideTable x={525} topY={670} floorY={floorY} width={165} />

        {/* Iced glass sitting solidly on tabletop y=670 (plus extra cone when clutching head in pain) */}
        <IcedDrinkGlass
          x={502}
          y={626}
          scale={0.54}
          fillPct={leftPain ? 0.22 : 0.72}
          showFrost={true}
          frame={leftFrame}
          uid="nd4_left_gl"
        />
        {leftPain ? (
          <g>
            <ellipse cx={566} cy={670} rx={36} ry={6.5} fill="#ffffff" stroke={INK} strokeWidth={2.5} />
            <IceCreamCone x={574} y={657} scale={0.52} rotateDeg={82} />
          </g>
        ) : null}

        {/* BOY eating ice cream fast -> clutching forehead in pain, feet firmly on floorY */}
        <SharedStickman
          x={315}
          y={672}
          scale={1.04}
          role="BOY"
          facing="RIGHT"
          pose={leftPain ? 'HOLD_HEAD_PAIN' : 'EAT_CONE_FAST'}
          expression={leftPain ? 'PAIN' : 'SURPRISED'}
          frame={leftFrame}
          uid="nd4_left_boy"
        />

        {/* Red Warning Thermometer Card */}
        <g transform={`translate(668, 318) scale(${leftPulse})`}>
          <rect x={0} y={0} width={220} height={295} rx={24} fill="#FFFFFF" stroke="#EF4444" strokeWidth={4} />
          <text x={110} y={42} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={800} fill="#B91C1C">
            SỐC LẠNH
          </text>
          <rect x={40} y={66} width={34} height={156} rx={17} fill="#FEE2E2" stroke={INK} strokeWidth={3} />
          <rect
            x={45}
            y={71 + 146 * (1 - leftThermoLevel)}
            width={24}
            height={Math.max(18, 146 * leftThermoLevel)}
            rx={12}
            fill="#EF4444"
          />
          <text x={144} y={142} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill="#DC2626">
            &lt; 5s
          </text>
          <text x={144} y={184} textAnchor="middle" fontFamily={FONT} fontSize={21} fontWeight={800} fill="#991B1B">
            NGUY CƠ X2
          </text>
          <rect x={24} y={238} width={172} height={38} rx={12} fill="#FEF2F2" stroke="#EF4444" strokeWidth={2.5} />
          <text x={110} y={264} textAnchor="middle" fontFamily={FONT} fontSize={20} fontWeight={800} fill="#B91C1C">
            Tụt nhiệt gắt
          </text>
        </g>
      </g>

      {/* RIGHT PANEL (x = 960..1920) */}
      <g opacity={rightOpacity}>
        <rect x={960} y={0} width={960} height={1080} fill="url(#nd4_rightBg)" />
        <rect x={960} y={floorY} width={960} height={290} fill="#A7F3D0" opacity={0.48} />
        <line x1={960} y1={floorY} x2={1920} y2={floorY} stroke="#6EE7B7" strokeWidth={4} />

        <CleanLabel
          x={1440}
          y={202}
          text="Nhấp từng ngụm nhỏ chậm rãi"
          bg="#D1FAE5"
          color="#047857"
          border="#10B981"
          fontSize={29}
        />

        {/* Small wooden table on right panel */}
        <WoodenSideTable x={1155} topY={670} floorY={floorY} width={150} />
        <ellipse cx={1155} cy={670} rx={38} ry={6.5} fill="#ffffff" stroke={INK} strokeWidth={2.5} />
        <IceCreamCone x={1163} y={657} scale={0.52} rotateDeg={82} />

        {/* BOY directly holding IcedDrinkGlass in hand sipping slowly! */}
        <SharedStickman
          x={1360}
          y={672}
          scale={1.04}
          role="BOY"
          facing="LEFT"
          pose="SIP_GLASS"
          expression="HAPPY"
          frame={rightFrame}
          drinkFillPct={0.78}
          uid="nd4_right_boy"
        />

        {/* Green Steady Comfort Gauge */}
        <g transform={`translate(1600, 318) scale(${rightPulse})`}>
          <rect x={0} y={0} width={220} height={295} rx={24} fill="#FFFFFF" stroke="#10B981" strokeWidth={4} />
          <text x={110} y={42} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={800} fill="#047857">
            ỔN ĐỊNH
          </text>
          <rect x={40} y={66} width={34} height={156} rx={17} fill="#D1FAE5" stroke={INK} strokeWidth={3} />
          <rect x={45} y={96} width={24} height={121} rx={12} fill="#10B981" />
          <text x={144} y={142} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill="#059669">
            34°C
          </text>
          <text x={144} y={184} textAnchor="middle" fontFamily={FONT} fontSize={21} fontWeight={800} fill="#065F46">
            KỊP LÀM ẤM
          </text>
          <rect x={24} y={238} width={172} height={38} rx={12} fill="#ECFDF5" stroke="#10B981" strokeWidth={2.5} />
          <text x={110} y={264} textAnchor="middle" fontFamily={FONT} fontSize={20} fontWeight={800} fill="#047857">
            Êm dịu dễ chịu
          </text>
        </g>
      </g>

      {/* Center Vertical Divider */}
      <line x1={960} y1={165} x2={960} y2={825} stroke={INK} strokeWidth={6} />
      <circle cx={960} cy={480} r={38} fill="#0F172A" stroke="#FFFFFF" strokeWidth={5} />
      <text x={960} y={491} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={900} fill="#FACC15">
        VS
      </text>

      {/* Single Top Header */}
      {activeStep === 2 ? (
        <CleanLabel
          x={960}
          y={104}
          text="Tốc độ mới là thủ phạm chính!"
          bg="#0F172A"
          color="#FACC15"
          border="#F59E0B"
          fontSize={34}
        />
      ) : (
        <CleanLabel
          x={960}
          y={104}
          text="So sánh tốc độ ăn uống đồ lạnh"
          bg="#FFFFFF"
          color="#0F172A"
          border="#94A3B8"
          fontSize={30}
        />
      )}
    </svg>
  );
};

/* ============================================================================
 * 5. NUOCDA_VESSEL_CONSTRICT_DILATE — NuocDaVesselConstrictDilateVisual
 *    - FIXED Bug #7: Red blood cell speed lines separated by 10-12px into 2 short
 *      crisp dashes behind each RBC (never attached like a tail!)
 *    - Stripped duplicate bottom pills! Only 1 concise top title per step.
 * ========================================================================== */
export const NuocDaVesselConstrictDilateVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const squeeze = lerp(16, 72, clamp01(p * 1.4));
  const expand = lerp(-18, 56, clamp01(p * 1.4));
  const needleAngle = lerp(-68, 60, clamp01(p * 1.35)) + Math.sin(frame * 0.4) * 2.5;

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="nd5_bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="nd5_lumenCold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7F1D1D" />
          <stop offset="50%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="nd5_lumenWarm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      <rect width={1920} height={1080} fill="url(#nd5_bgGrad)" />

      {/* STEP 0: Blood vessel constricting on cold shock */}
      {activeStep === 0 && (
        <g>
          <CleanLabel
            x={960}
            y={100}
            text="Nhịp 1: Mạch máu co thắt giữ nhiệt"
            bg="#1E3A8A"
            color="#E0F2FE"
            border="#38BDF8"
            fontSize={34}
          />

          <path
            d={`M 220 375 Q 580 375 960 ${375 + squeeze} Q 1340 375 1700 375 L 1700 625 Q 1340 625 960 ${625 - squeeze} Q 580 625 220 625 Z`}
            fill="url(#nd5_lumenCold)"
            stroke="#FCA5A5"
            strokeWidth={16}
          />

          {[0, 1, 2, 3, 4, 5].map((i) => {
            const cx = 260 + ((frame * 2.4 + i * 240) % 1400);
            const distFromCenter = Math.abs(cx - 960);
            const yJitter = distFromCenter < 260 ? 0 : i % 2 === 0 ? -24 : 24;
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={500 + yJitter}
                rx={28}
                ry={16}
                fill="#EF4444"
                stroke="#FECACA"
                strokeWidth={3}
              />
            );
          })}

          {[780, 960, 1140].map((sx, idx) => {
            const bob = Math.sin(frame * 0.12 + idx) * 6;
            return (
              <g key={idx}>
                <g transform={`translate(${sx}, ${285 + bob})`}>
                  <circle cx={0} cy={0} r={22} fill="#0284C7" fillOpacity={0.35} />
                  <path
                    d="M -14 0 L 14 0 M 0 -14 L 0 14 M -10 -10 L 10 10 M 10 -10 L -10 10"
                    stroke="#7DD3FC"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                </g>
                <line x1={sx} y1={322} x2={sx} y2={372 + squeeze * 0.65} stroke="#38BDF8" strokeWidth={6} />
                <polygon
                  points={`${sx},${384 + squeeze * 0.65} ${sx - 12},${364 + squeeze * 0.65} ${sx + 12},${364 + squeeze * 0.65}`}
                  fill="#38BDF8"
                />

                <line x1={sx} y1={678} x2={sx} y2={628 - squeeze * 0.65} stroke="#38BDF8" strokeWidth={6} />
                <polygon
                  points={`${sx},${616 - squeeze * 0.65} ${sx - 12},${636 - squeeze * 0.65} ${sx + 12},${636 - squeeze * 0.65}`}
                  fill="#38BDF8"
                />
              </g>
            );
          })}
        </g>
      )}

      {/* STEP 1: Blood vessel dilating wide with rushing RBCs + 2 detached speed dashes (10–12px behind!) */}
      {activeStep === 1 && (
        <g>
          <CleanLabel
            x={960}
            y={100}
            text="Nhịp 2: Giãn phồng bơm máu ấm ồ ạt"
            bg="#7F1D1D"
            color="#FEF2F2"
            border="#F87171"
            fontSize={34}
          />

          <path
            d={`M 220 375 Q 580 375 960 ${375 - expand} Q 1340 375 1700 375 L 1700 625 Q 1340 625 960 ${625 + expand} Q 580 625 220 625 Z`}
            fill="url(#nd5_lumenWarm)"
            stroke="#FDBA74"
            strokeWidth={16}
          />

          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const cx = 250 + ((frame * 7.5 + i * 145) % 1410);
            const lane = ((i % 3) - 1) * 58;
            const cy = 500 + lane;
            return (
              <g key={i}>
                {/* 2 clean detached white speed dashes 10–12px behind left edge (cx - 26) */}
                <line
                  x1={cx - 56}
                  y1={cy - 6}
                  x2={cx - 38}
                  y2={cy - 6}
                  stroke="#FFFFFF"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  opacity={0.72}
                />
                <line
                  x1={cx - 49}
                  y1={cy + 6}
                  x2={cx - 36}
                  y2={cy + 6}
                  stroke="#FFFFFF"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  opacity={0.58}
                />
                {/* Classic biconcave red blood cell oval */}
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={26}
                  ry={15}
                  fill="#B91C1C"
                  stroke="#FEF2F2"
                  strokeWidth={3}
                />
                <ellipse cx={cx} cy={cy} rx={11} ry={5} fill="#991B1B" opacity={0.65} />
              </g>
            );
          })}

          {[780, 960, 1140].map((ax, idx) => (
            <g key={idx}>
              <line x1={ax} y1={370} x2={ax} y2={285} stroke="#FB923C" strokeWidth={7} />
              <polygon points={`${ax},270 ${ax - 13},294 ${ax + 13},294`} fill="#FB923C" />
              <line x1={ax} y1={630} x2={ax} y2={710} stroke="#FB923C" strokeWidth={7} />
              <polygon points={`${ax},725 ${ax - 13},701 ${ax + 13},701`} fill="#FB923C" />
            </g>
          ))}
        </g>
      )}

      {/* STEP 2: HeadCutawayDiagram + Pressure Gauge */}
      {activeStep === 2 && (
        <g>
          <CleanLabel
            x={960}
            y={100}
            text="Áp lực tăng vọt lên thành mạch máu"
            bg="#7C2D12"
            color="#FFF7ED"
            border="#FB923C"
            fontSize={34}
          />

          <HeadCutawayDiagram
            x={690}
            y={505}
            scale={1.12}
            coldPalatePct={0.85}
            foreheadPainPct={0.65}
            showTrigeminal={false}
            showVesselDilate={1}
            frame={frame}
            uid="nd5_s2"
          />

          <g transform="translate(1155, 255)">
            <rect x={0} y={0} width={510} height={420} rx={30} fill="#0F172A" stroke="#FB923C" strokeWidth={5} />
            <text x={255} y={52} textAnchor="middle" fontFamily={FONT} fontSize={25} fontWeight={800} fill="#FED7AA">
              ĐỒNG HỒ ÁP LỰC MẠCH MÁU
            </text>

            <g transform="translate(255, 280)">
              <path d="M -155 0 A 155 155 0 0 1 -77 -134" fill="none" stroke="#22C55E" strokeWidth={28} strokeLinecap="butt" />
              <path d="M -77 -134 A 155 155 0 0 1 77 -134" fill="none" stroke="#FACC15" strokeWidth={28} strokeLinecap="butt" />
              <path d="M 77 -134 A 155 155 0 0 1 155 0" fill="none" stroke="#F97316" strokeWidth={28} strokeLinecap="butt" />

              <g transform={`rotate(${needleAngle})`}>
                <line x1={0} y1={14} x2={0} y2={-132} stroke="#F8FAFC" strokeWidth={9} strokeLinecap="round" />
                <polygon points="0,-144 -10,-122 10,-122" fill="#EF4444" />
              </g>
              <circle cx={0} cy={0} r={18} fill="#F97316" stroke="#FFFFFF" strokeWidth={4} />
            </g>

            <rect x={145} y={332} width={220} height={54} rx={16} fill="#9A3412" stroke="#FB923C" strokeWidth={3} />
            <text x={255} y={368} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={900} fill="#FFF7ED">
              MỨC BÁO ĐỘNG
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 6. NUOCDA_TRIGEMINAL_WIRE — NuocDaTrigeminalWireVisual
 *    - Stripped duplicate bottom pill in Step 2!
 * ========================================================================== */
export const NuocDaTrigeminalWireVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const hubPulse = 1 + Math.sin(frame * 0.16) * 0.12;
  const signalPhase = (frame * 0.045) % 1;

  const branches = [
    { y: 310, title: 'Nhánh 1: Trán & Thái dương', accent: '#FACC15', bg: '#422006', anchorX: 785, anchorY: 365 },
    { y: 470, title: 'Nhánh 2: Vòm miệng & Mũi', accent: '#38BDF8', bg: '#0C4A6E', anchorX: 775, anchorY: 515 },
    { y: 630, title: 'Nhánh 3: Hàm dưới', accent: '#CBD5E1', bg: '#1E293B', anchorX: 760, anchorY: 600 },
  ];

  const pulsePts = [
    { x: 778, y: 535 },
    { x: 735, y: 465 },
    { x: 682, y: 362 },
  ];

  const getSignalPos = (t: number) => {
    const ct = clamp01(t);
    if (ct < 0.5) {
      const k = ct * 2;
      return { x: lerp(pulsePts[0].x, pulsePts[1].x, k), y: lerp(pulsePts[0].y, pulsePts[1].y, k) };
    }
    const k = (ct - 0.5) * 2;
    return { x: lerp(pulsePts[1].x, pulsePts[2].x, k), y: lerp(pulsePts[1].y, pulsePts[2].y, k) };
  };

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="nd6_bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1120" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <radialGradient id="nd6_nerveGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FACC15" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#EAB308" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={1920} height={1080} fill="url(#nd6_bgGrad)" />

      {activeStep === 0 && (
        <CleanLabel x={960} y={96} text="Dây thần kinh sinh ba" bg="#422006" color="#FEF08A" border="#FACC15" fontSize={34} />
      )}
      {activeStep === 1 && (
        <CleanLabel x={960} y={96} text="3 nhánh chính của dây thần kinh sinh ba" bg="#1E293B" color="#F8FAFC" border="#FACC15" fontSize={32} />
      )}
      {activeStep === 2 && (
        <CleanLabel x={960} y={96} text="Tín hiệu đau phóng thẳng lên não" bg="#7F1D1D" color="#FEF08A" border="#EF4444" fontSize={34} />
      )}

      <HeadCutawayDiagram
        x={720}
        y={505}
        scale={1.12}
        coldPalatePct={activeStep === 2 ? 0.95 : 0.7}
        foreheadPainPct={activeStep === 2 ? clamp01(p * 1.2) : 0}
        showTrigeminal={true}
        showVesselDilate={activeStep === 2 ? 0.55 : 0}
        frame={frame}
        uid="nd6_head"
      />

      <circle cx={735} cy={470} r={54 * hubPulse} fill="url(#nd6_nerveGlow)" />
      <circle cx={735} cy={470} r={14} fill="#FEF08A" stroke="#CA8A04" strokeWidth={4} />

      {activeStep === 0 && (
        <g>
          <line x1={752} y1={470} x2={1165} y2={470} stroke="#FACC15" strokeWidth={5} strokeDasharray="12 8" />
          <g transform="translate(1170, 350)">
            <rect x={0} y={0} width={520} height={240} rx={28} fill="#1E293B" stroke="#FACC15" strokeWidth={5} />
            <text x={260} y={66} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill="#FEF08A">
              Dây thần kinh sinh ba
            </text>
            <text x={260} y={120} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={700} fill="#E2E8F0">
              &quot;Cáp truyền tín hiệu&quot; cảm giác
            </text>
            <text x={260} y={162} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={700} fill="#E2E8F0">
              lớn nhất vùng đầu &amp; khuôn mặt
            </text>
          </g>
        </g>
      )}

      {activeStep === 1 && (
        <g>
          {branches.map((br, idx) => {
            const reveal = clamp01(p * 2.6 - idx * 0.45);
            return (
              <g key={idx} opacity={0.25 + 0.75 * reveal}>
                <path d={`M ${br.anchorX} ${br.anchorY} L 1120 ${br.y} L 1200 ${br.y}`} fill="none" stroke={br.accent} strokeWidth={4.5} strokeDasharray="10 8" />
                <circle cx={br.anchorX} cy={br.anchorY} r={8} fill={br.accent} />
                <rect x={1200} y={br.y - 52} width={460} height={104} rx={22} fill={br.bg} stroke={br.accent} strokeWidth={4} />
                <text x={1430} y={br.y + 10} textAnchor="middle" fontFamily={FONT} fontSize={27} fontWeight={800} fill="#F8FAFC">
                  {br.title}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {activeStep === 2 && (
        <g>
          <polyline points="778,535 735,465 682,362" fill="none" stroke="#FACC15" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
          <polyline points="778,535 735,465 682,362" fill="none" stroke="#FFFFFF" strokeWidth={4} strokeDasharray="16 14" strokeDashoffset={-(frame * 8)} />

          {[0, 0.33, 0.66].map((offset, idx) => {
            const pos = getSignalPos((signalPhase + offset) % 1);
            return (
              <g key={idx}>
                <circle cx={pos.x} cy={pos.y} r={22} fill="#FACC15" opacity={0.35} />
                <circle cx={pos.x} cy={pos.y} r={10} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={3} />
              </g>
            );
          })}

          <g transform="translate(1170, 315)">
            <rect x={0} y={0} width={520} height={310} rx={28} fill="#0F172A" stroke="#EF4444" strokeWidth={5} />
            <text x={260} y={54} textAnchor="middle" fontFamily={FONT} fontSize={25} fontWeight={800} fill="#FEF08A">
              XUNG ĐIỆN BÁO ĐAU
            </text>
            <rect x={40} y={80} width={440} height={138} rx={18} fill="#1E293B" stroke="#475569" strokeWidth={3} />
            <polyline
              points={`58,150 115,150 135,${106 + Math.sin(frame * 0.5) * 8} 158,194 182,${98 - Math.sin(frame * 0.5) * 8} 206,178 232,150 295,150 318,${104 + Math.cos(frame * 0.5) * 8} 342,196 368,${100 - Math.cos(frame * 0.5) * 8} 392,150 462,150`}
              fill="none"
              stroke="#FACC15"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x={260} y={268} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={800} fill="#FCA5A5">
              Truyền tốc độ cao lên trung khu não
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 7. NUOCDA_REFERRED_PAIN_MAP — NuocDaReferredPainMapVisual
 *    - Stripped duplicate bottom pills ("Lạnh ở miệng → Nhói ở trán!", etc.)!
 * ========================================================================== */
export const NuocDaReferredPainMapVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
}) => {
  const activeStep = step ?? visualStep ?? 0;

  const cableDash = -(frame * 5.5);
  const burstScale = 0.92 + Math.sin(frame * 0.25) * 0.14;
  const rippleR = 16 + ((frame * 0.9) % 28);

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="nd7_bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <radialGradient id="nd7_painBurstGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
          <stop offset="65%" stopColor="#F97316" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={1920} height={1080} fill="url(#nd7_bgGrad)" />

      {/* Single Top Header per step — ZERO duplicate bottom pills! */}
      {activeStep === 0 && (
        <CleanLabel
          x={960}
          y={96}
          text="Vì sao lạnh ở miệng lại nhói ở trán?"
          bg="#1E293B"
          color="#F8FAFC"
          border="#38BDF8"
          fontSize={32}
        />
      )}
      {activeStep === 1 && (
        <CleanLabel
          x={960}
          y={96}
          text="Lạnh ở miệng → Nhói ở trán!"
          bg="#7F1D1D"
          color="#FEF2F2"
          border="#EF4444"
          fontSize={34}
        />
      )}
      {activeStep === 2 && (
        <CleanLabel
          x={960}
          y={96}
          text="Cơ chế Đau quy chiếu (Referred Pain)"
          bg="#312E81"
          color="#EEF2FF"
          border="#818CF8"
          fontSize={34}
        />
      )}

      {/* STEP 0: Clean Switchboard Metaphor */}
      {activeStep === 0 && (
        <g transform="translate(0, 35)">
          <rect x={165} y={248} width={310} height={110} rx={24} fill="#7F1D1D" stroke="#F87171" strokeWidth={5} />
          <text x={320} y={314} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill="#FEF2F2">
            Trán
          </text>

          <rect x={165} y={502} width={310} height={110} rx={24} fill="#0C4A6E" stroke="#38BDF8" strokeWidth={5} />
          <text x={320} y={568} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill="#E0F2FE">
            Vòm miệng
          </text>

          <path d="M 475 303 C 660 303 690 415 845 425" fill="none" stroke="#F87171" strokeWidth={14} strokeLinecap="round" />
          <path d="M 475 557 C 660 557 690 445 845 435" fill="none" stroke="#38BDF8" strokeWidth={14} strokeLinecap="round" />
          <path
            d="M 475 557 C 660 557 690 445 845 435"
            fill="none"
            stroke="#E0F2FE"
            strokeWidth={6}
            strokeDasharray="16 20"
            strokeDashoffset={cableDash}
          />

          <rect x={830} y={350} width={280} height={160} rx={28} fill="#422006" stroke="#FACC15" strokeWidth={6} />
          <text x={970} y={418} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={900} fill="#FEF08A">
            TỔNG ĐÀI
          </text>
          <text x={970} y={462} textAnchor="middle" fontFamily={FONT} fontSize={25} fontWeight={800} fill="#FDE047">
            Dây sinh ba
          </text>

          <line x1={1110} y1={430} x2={1470} y2={430} stroke="#FACC15" strokeWidth={20} strokeLinecap="round" />
          <line
            x1={1110}
            y1={430}
            x2={1470}
            y2={430}
            stroke="#FFFFFF"
            strokeWidth={7}
            strokeDasharray="20 18"
            strokeDashoffset={cableDash * 1.3}
          />
          <polygon points="1485,430 1455,412 1455,448" fill="#FACC15" />

          <rect x={1490} y={350} width={275} height={160} rx={28} fill="#312E81" stroke="#818CF8" strokeWidth={6} />
          <text x={1628} y={422} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill="#EEF2FF">
            NÃO BỘ
          </text>
          <text x={1628} y={466} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={700} fill="#C7D2FE">
            Dễ hiểu nhầm vị trí!
          </text>
        </g>
      )}

      {/* STEP 1 & STEP 2: HeadCutawayDiagram showing cold origin at palate vs red pain burst on forehead */}
      {activeStep >= 1 && (
        <g>
          <HeadCutawayDiagram
            x={720}
            y={495}
            scale={1.08}
            coldPalatePct={0.9}
            foreheadPainPct={1}
            showTrigeminal={true}
            showVesselDilate={0.5}
            frame={frame}
            uid="nd7_head"
          />

          <g>
            <circle cx={832} cy={545} r={rippleR} fill="none" stroke="#38BDF8" strokeWidth={4} opacity={0.75} />
            <circle cx={832} cy={545} r={14} fill="#0284C7" stroke="#E0F2FE" strokeWidth={4} />
          </g>

          <g transform={`translate(868, 392) scale(${burstScale})`}>
            <circle cx={0} cy={0} r={66} fill="url(#nd7_painBurstGrad)" />
            <polygon
              points="0,-42 10,-14 38,-22 18,2 40,22 12,16 4,44 -8,16 -38,24 -16,2 -36,-22 -10,-14"
              fill="#EF4444"
              stroke="#FEF08A"
              strokeWidth={3.5}
            />
          </g>

          <line x1={920} y1={392} x2={1180} y2={392} stroke="#EF4444" strokeWidth={5} strokeDasharray="10 8" />
          <line x1={860} y1={545} x2={1180} y2={585} stroke="#38BDF8" strokeWidth={5} strokeDasharray="10 8" />

          <CleanLabel x={1445} y={392} text="Nơi cảm nhận đau: Trán!" bg="#FEE2E2" color="#B91C1C" border="#EF4444" fontSize={28} />

          <line x1={1445} y1={532} x2={1445} y2={450} stroke="#FACC15" strokeWidth={7} />
          <polygon points="1445,436 1431,460 1459,460" fill="#FACC15" />

          <CleanLabel x={1445} y={585} text="Nguồn lạnh thật: Vòm miệng" bg="#E0F2FE" color="#0369A1" border="#38BDF8" fontSize={28} />
        </g>
      )}
    </svg>
  );
};
