import React from 'react';
import type { EpisodeVisualProps } from './index';
import {
  INK,
  FONT,
  clamp01,
  lerp,
  CleanLabel,
  ShortSpeechBubble,
  SharedStickman,
  IcedDrinkGlass,
  HeadCutawayDiagram,
  SummerPorchBackdrop,
} from './nuocDaSharedAssets';

/* ============================================================================
 * 1. NUOCDA_HOT_NOON_GULP — NuocDaHotNoonGulpVisual
 * ========================================================================== */
export const NuocDaHotNoonGulpVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  const heatPulse = 1 + Math.sin(frame * 0.08) * 0.04;
  const sweatOffset = (frame * 1.6) % 48;
  const gulpFill = activeStep === 0 ? 0.92 : activeStep === 1 ? lerp(0.9, 0.25, p) : 0.25;
  const tiltDeg = lerp(-14, -40, p);
  const shiverX = activeStep === 2 ? Math.sin(frame * 0.95) * 3.2 : 0;
  const boltPulse = 0.85 + Math.sin(frame * 0.35) * 0.18;
  const flowDashOffset = -(frame * 5.5);

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
        <linearGradient id="nd1_coldFlowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#E0F2FE" />
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

      {/* Porch Backdrop */}
      <SummerPorchBackdrop
        frame={frame}
        heatIntensity={activeStep === 2 ? 0.7 : 1}
        timeOfDay="NOON"
      />

      {/* Top-Left 38°C Thermometer Badge */}
      <g transform={`translate(110, 72) scale(${heatPulse})`}>
        <rect
          x={0}
          y={0}
          width={236}
          height={118}
          rx={24}
          fill="#FFF7ED"
          stroke="#EA580C"
          strokeWidth={4}
        />
        {/* Thermometer Icon */}
        <g transform="translate(36, 18)">
          <rect x={11} y={4} width={16} height={54} rx={8} fill="#FED7AA" stroke={INK} strokeWidth={3} />
          <rect x={15} y={12} width={8} height={46} rx={4} fill="url(#nd1_thermoFill)" />
          <circle cx={19} cy={66} r={14} fill="#EF4444" stroke={INK} strokeWidth={3} />
          <circle cx={15} cy={62} r={4} fill="#FCA5A5" />
        </g>
        <text
          x={92}
          y={58}
          fontFamily={FONT}
          fontSize={40}
          fontWeight={900}
          fill="#C2410C"
        >
          38°C
        </text>
        <text
          x={92}
          y={94}
          fontFamily={FONT}
          fontSize={21}
          fontWeight={700}
          fill="#9A3412"
        >
          Trưa nắng gắt
        </text>
      </g>

      {/* Wooden Porch Table (kept at y <= 820) */}
      <g>
        <rect
          x={1140}
          y={660}
          width={34}
          height={160}
          rx={6}
          fill="url(#nd1_tableLegGrad)"
          stroke={INK}
          strokeWidth={4}
        />
        <rect
          x={1490}
          y={660}
          width={34}
          height={160}
          rx={6}
          fill="url(#nd1_tableLegGrad)"
          stroke={INK}
          strokeWidth={4}
        />
        <rect
          x={1085}
          y={626}
          width={490}
          height={42}
          rx={12}
          fill="url(#nd1_tableTopGrad)"
          stroke={INK}
          strokeWidth={4}
        />
        <line x1={1110} y1={646} x2={1550} y2={646} stroke="#8C5225" strokeWidth={3} opacity={0.45} />
      </g>

      {/* STEP 0: Tired BOY arrives, eyeing frosty iced drink */}
      {activeStep === 0 && (
        <g>
          <SharedStickman
            x={710}
            y={765}
            scale={1.12}
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
                d={`M ${648 - i * 24} ${462 + dy} q -6 12 0 18 a 7 7 0 1 0 10 -10 z`}
                fill="#38BDF8"
                stroke="#0284C7"
                strokeWidth={2}
                opacity={alpha}
              />
            );
          })}

          {/* Frosty glass on wooden table */}
          <IcedDrinkGlass
            x={1325}
            y={542}
            scale={1.12}
            fillPct={0.92}
            showFrost={true}
            frame={frame}
          />

          {/* Subtle cool mist curls */}
          <path
            d={`M 1295 ${418 - Math.sin(frame * 0.08) * 6} Q 1280 392 1300 370`}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.75}
          />
          <path
            d={`M 1352 ${422 - Math.cos(frame * 0.08) * 6} Q 1370 396 1348 372`}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.75}
          />

          <ShortSpeechBubble x={710} y={295} text="Nóng quá trời!" tailDir="CENTER" />

          <CleanLabel
            x={1330}
            y={765}
            text="Ly nước đá lạnh 0°C"
            bg="#E0F2FE"
            color="#0369A1"
            border="#0284C7"
            fontSize={26}
          />
        </g>
      )}

      {/* STEP 1: BOY drinking fast, liquid level dropping smoothly */}
      {activeStep === 1 && (
        <g>
          <CleanLabel
            x={960}
            y={112}
            text="Uống một hơi thật nhanh!"
            bg="#DBEAFE"
            color="#1D4ED8"
            border="#3B82F6"
            fontSize={30}
          />

          <SharedStickman
            x={820}
            y={765}
            scale={1.12}
            role="BOY"
            facing="RIGHT"
            pose="DRINK_FAST"
            expression="HAPPY"
            frame={frame}
          />

          {/* Tilted IcedDrinkGlass near BOY's mouth */}
          <g transform={`translate(995, 500) rotate(${tiltDeg})`}>
            <IcedDrinkGlass
              x={0}
              y={0}
              scale={0.95}
              fillPct={gulpFill}
              showFrost={true}
              frame={frame}
            />
          </g>

          {/* Cold blue flow lines streaming into mouth */}
          <g>
            <path
              d="M 960 492 Q 915 480 868 504"
              fill="none"
              stroke="url(#nd1_coldFlowGrad)"
              strokeWidth={11}
              strokeLinecap="round"
              strokeDasharray="18 14"
              strokeDashoffset={flowDashOffset}
            />
            <path
              d="M 966 512 Q 918 505 872 522"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray="12 12"
              strokeDashoffset={flowDashOffset * 1.2}
            />
          </g>

          {/* Fill Level Progress Card on right */}
          <g transform="translate(1390, 270)">
            <rect
              x={0}
              y={0}
              width={320}
              height={255}
              rx={24}
              fill="#FFFFFF"
              fillOpacity={0.94}
              stroke="#0284C7"
              strokeWidth={4}
            />
            <text
              x={160}
              y={46}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={24}
              fontWeight={800}
              fill="#0F172A"
            >
              Lượng nước trong ly
            </text>
            <rect x={44} y={76} width={232} height={36} rx={18} fill="#E2E8F0" stroke={INK} strokeWidth={3} />
            <rect
              x={47}
              y={79}
              width={Math.max(12, 226 * gulpFill)}
              height={30}
              rx={15}
              fill="#0EA5E9"
            />
            <text
              x={160}
              y={160}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={44}
              fontWeight={900}
              fill="#0369A1"
            >
              {Math.round(gulpFill * 100)}%
            </text>
            <text
              x={160}
              y={212}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={22}
              fontWeight={700}
              fill="#475569"
            >
              Uống cạn liên tục
            </text>
          </g>
        </g>
      )}

      {/* STEP 2: 5 seconds later — brain freeze pain */}
      {activeStep === 2 && (
        <g>
          <CleanLabel
            x={960}
            y={112}
            text="5 giây sau..."
            bg="#FEF2F2"
            color="#DC2626"
            border="#EF4444"
            fontSize={32}
          />

          {/* Glass dropped back onto table with small splash */}
          <IcedDrinkGlass
            x={1330}
            y={542}
            scale={1.08}
            fillPct={0.25}
            showFrost={true}
            frame={frame}
          />
          <ellipse cx={1330} cy={632} rx={72} ry={10} fill="#38BDF8" opacity={0.45} />

          {/* BOY clutching forehead in pain */}
          <g transform={`translate(${shiverX}, 0)`}>
            <circle cx={855} cy={455} r={145 * boltPulse} fill="url(#nd1_freezeGlow)" />

            <SharedStickman
              x={855}
              y={765}
              scale={1.12}
              role="BOY"
              facing="RIGHT"
              pose="HOLD_HEAD_PAIN"
              expression="PAIN"
              frame={frame}
            />

            {/* Jagged electric blue & red freeze-bolt spikes radiating from forehead */}
            <g transform={`translate(855, 445) scale(${boltPulse})`}>
              {[
                { rot: -135, color: '#38BDF8' },
                { rot: -95, color: '#EF4444' },
                { rot: -55, color: '#38BDF8' },
                { rot: -18, color: '#EF4444' },
                { rot: -165, color: '#EF4444' },
                { rot: 15, color: '#38BDF8' },
              ].map((b, idx) => (
                <g key={idx} transform={`rotate(${b.rot}) translate(86, 0)`}>
                  <polyline
                    points="0,0 24,-10 18,8 48,-6 38,10 68,0"
                    fill="none"
                    stroke={b.color}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              ))}
            </g>
          </g>

          <ShortSpeechBubble x={520} y={295} text="Á! Buốt tận óc!" tailDir="RIGHT" />

          <CleanLabel
            x={1330}
            y={765}
            text="Cơn buốt nhói dữ dội ở trán!"
            bg="#FEE2E2"
            color="#B91C1C"
            border="#EF4444"
            fontSize={26}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 2. NUOCDA_BRAIN_NOT_FROZEN — NuocDaBrainNotFrozenVisual
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
          <circle cx={1360} cy={435} r={185} />
        </clipPath>
      </defs>

      {/* Dark-Slate Science Explainer Background */}
      <rect width={1920} height={1080} fill="url(#nd2_bgGrad)" />
      {/* Subtle scientific grid dots */}
      <g opacity={0.14}>
        {Array.from({ length: 12 }).map((_, r) =>
          Array.from({ length: 20 }).map((__, c) => (
            <circle key={`${r}-${c}`} cx={80 + c * 92} cy={70 + r * 72} r={2.5} fill="#94A3B8" />
          )),
        )}
      </g>

      {/* Top Section Title */}
      {activeStep === 0 && (
        <CleanLabel
          x={960}
          y={94}
          text="Đóng băng não?"
          bg="#1E293B"
          color="#F8FAFC"
          border="#38BDF8"
          fontSize={36}
        />
      )}
      {activeStep === 1 && (
        <CleanLabel
          x={960}
          y={94}
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
          y={94}
          text="Mô não không có dây thần kinh đau"
          bg="#312E81"
          color="#EEF2FF"
          border="#818CF8"
          fontSize={34}
        />
      )}

      {/* STEP 0: Humorous crossed-out ice cube inside cartoon brain */}
      {activeStep === 0 && (
        <g>
          {/* Cartoon Brain Silhouette */}
          <g transform={`translate(960, 445) translate(0, ${tissueFloat})`}>
            <path
              d="M -210 40 C -255 -40 -215 -165 -110 -185 C -55 -220 55 -220 110 -185 C 215 -165 255 -40 210 40 C 215 115 140 165 65 145 C 25 170 -25 170 -65 145 C -140 165 -215 115 -210 40 Z"
              fill="#FDA4AF"
              stroke="#FFF1F2"
              strokeWidth={8}
            />
            {/* Brain folds */}
            <path
              d="M -145 -65 Q -105 -125 -45 -90 M 145 -65 Q 105 -125 45 -90 M -150 35 Q -95 75 -40 45 M 150 35 Q 95 75 40 45"
              fill="none"
              stroke="#E11D48"
              strokeWidth={7}
              strokeLinecap="round"
              opacity={0.55}
            />

            {/* Humorous Ice Cube Inside Brain */}
            <g transform="translate(-85, -92)">
              <rect
                x={0}
                y={0}
                width={170}
                height={170}
                rx={26}
                fill="url(#nd2_iceCubeGrad)"
                fillOpacity={0.9}
                stroke="#E0F2FE"
                strokeWidth={6}
              />
              <path d="M 28 32 L 72 32 L 28 78 Z" fill="#FFFFFF" opacity={0.65} />
              <circle cx={125} cy={125} r={12} fill="#FFFFFF" opacity={0.45} />
              <circle cx={102} cy={142} r={7} fill="#FFFFFF" opacity={0.4} />
            </g>

            {/* Bold Red X Slashing Across */}
            <line
              x1={-135}
              y1={-135}
              x2={135}
              y2={135}
              stroke="#EF4444"
              strokeWidth={24}
              strokeLinecap="round"
              strokeDasharray={crossLen}
              strokeDashoffset={crossLen * (1 - crossDraw)}
            />
            <line
              x1={135}
              y1={-135}
              x2={-135}
              y2={135}
              stroke="#EF4444"
              strokeWidth={24}
              strokeLinecap="round"
              strokeDasharray={crossLen}
              strokeDashoffset={crossLen * (1 - clamp01((p - 0.25) * 1.8))}
            />
          </g>

          <CleanLabel
            x={960}
            y={750}
            text="Đóng băng não? — Hoàn toàn là hiểu lầm!"
            bg="#FEF2F2"
            color="#DC2626"
            border="#EF4444"
            fontSize={30}
          />
        </g>
      )}

      {/* STEP 1: Warm coral-pink brain + digital thermometer locked at 37.0°C */}
      {activeStep === 1 && (
        <g>
          {/* Warm coral-pink glow behind brain */}
          <circle cx={675} cy={410} r={195 * warmPulse} fill="url(#nd2_warmBrainGlow)" />

          <HeadCutawayDiagram
            x={675}
            y={490}
            scale={1.12}
            coldPalatePct={0.1}
            foreheadPainPct={0}
            showTrigeminal={false}
            showVesselDilate={0}
            frame={frame}
          />

          {/* Connector line to digital thermometer */}
          <line
            x1={845}
            y1={400}
            x2={1125}
            y2={400}
            stroke="#FB7185"
            strokeWidth={5}
            strokeDasharray="12 10"
          />
          <circle cx={845} cy={400} r={9} fill="#FB7185" />

          {/* Digital Thermometer Card */}
          <g transform="translate(1130, 245)">
            <rect
              x={0}
              y={0}
              width={530}
              height={340}
              rx={28}
              fill="#0F172A"
              stroke="#FB7185"
              strokeWidth={5}
            />
            <text
              x={265}
              y={54}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={24}
              fontWeight={800}
              fill="#FDA4AF"
            >
              NHIỆT ĐỘ BÊN TRONG NÃO
            </text>

            {/* Digital Display Screen */}
            <rect x={45} y={80} width={440} height={126} rx={18} fill="#1E293B" stroke="#475569" strokeWidth={3} />
            <text
              x={265}
              y={166}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={74}
              fontWeight={900}
              fill="#FB7185"
            >
              37.0°C
            </text>

            {/* Flat steady temperature trace */}
            <line x1={55} y1={264} x2={475} y2={264} stroke="#334155" strokeWidth={3} />
            <path
              d="M 55 264 L 475 264"
              stroke="#34D399"
              strokeWidth={6}
              strokeLinecap="round"
            />
            <circle
              cx={55 + ((frame * 4.5) % 420)}
              cy={264}
              r={8}
              fill="#34D399"
            />
            <text
              x={265}
              y={308}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={22}
              fontWeight={700}
              fill="#A7F3D0"
            >
              Ổn định tuyệt đối nhờ hộp sọ bảo vệ
            </text>
          </g>

          <CleanLabel
            x={1395}
            y={735}
            text="Não vẫn ấm ổn định 37°C"
            bg="#FFF1F2"
            color="#BE123C"
            border="#FB7185"
            fontSize={30}
          />
        </g>
      )}

      {/* STEP 2: Zoomed brain tissue badge with "0 thụ thể đau" */}
      {activeStep === 2 && (
        <g>
          <HeadCutawayDiagram
            x={625}
            y={490}
            scale={1.08}
            coldPalatePct={0.15}
            foreheadPainPct={0}
            showTrigeminal={false}
            showVesselDilate={0}
            frame={frame}
          />

          {/* Magnifying focus circle on cortex */}
          <circle cx={630} cy={380} r={44} fill="none" stroke="#F59E0B" strokeWidth={5} strokeDasharray="8 6" />
          <line x1={674} y1={380} x2={1175} y2={420} stroke="#F59E0B" strokeWidth={4} strokeDasharray="10 8" />

          {/* Zoomed Brain Tissue Circle */}
          <g>
            <circle cx={1360} cy={435} r={192} fill="#1E293B" stroke="#818CF8" strokeWidth={7} />
            <g clipPath="url(#nd2_tissueClip)">
              <rect x={1160} y={240} width={400} height={400} fill="#4C1D95" opacity={0.35} />
              {/* Soft stylized brain cortex folds */}
              <path
                d="M 1150 360 Q 1240 290 1335 350 T 1560 340"
                fill="none"
                stroke="#F9A8D4"
                strokeWidth={26}
                strokeLinecap="round"
                opacity={0.75}
              />
              <path
                d="M 1150 455 Q 1260 390 1370 450 T 1565 445"
                fill="none"
                stroke="#F472B6"
                strokeWidth={26}
                strokeLinecap="round"
                opacity={0.75}
              />
              <path
                d="M 1150 545 Q 1255 490 1365 545 T 1565 540"
                fill="none"
                stroke="#F9A8D4"
                strokeWidth={24}
                strokeLinecap="round"
                opacity={0.7}
              />
              {/* Clean central 0-receptor emblem */}
              <circle cx={1360} cy={435} r={76} fill="#0F172A" fillOpacity={0.86} stroke="#F59E0B" strokeWidth={5} />
              <text
                x={1360}
                y={458}
                textAnchor="middle"
                fontFamily={FONT}
                fontSize={72}
                fontWeight={900}
                fill="#FBBF24"
              >
                0
              </text>
            </g>
          </g>

          <CleanLabel
            x={1360}
            y={678}
            text="0 thụ thể đau"
            bg="#FEF3C7"
            color="#B45309"
            border="#F59E0B"
            fontSize={32}
          />
          <CleanLabel
            x={1360}
            y={765}
            text="Mô não không có dây thần kinh đau"
            bg="#1E293B"
            color="#E2E8F0"
            border="#64748B"
            fontSize={26}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 3. NUOCDA_PALATE_TARGET — NuocDaPalateTargetVisual
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
  const warnPulse = 1 + Math.sin(frame * 0.22) * 0.05;

  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="nd3_bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <linearGradient id="nd3_coldStreamGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <clipPath id="nd3_insetClip">
          <circle cx={1420} cy={460} r={182} />
        </clipPath>
        <linearGradient id="nd3_gaugeGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      <rect width={1920} height={1080} fill="url(#nd3_bgGrad)" />

      {/* Top Banner */}
      <CleanLabel
        x={960}
        y={88}
        text="Điểm chịu lạnh trực tiếp: Vòm miệng trên"
        bg="#FFFFFF"
        color="#0F172A"
        border="#0284C7"
        fontSize={32}
      />

      {/* Head Cutaway Diagram centered left */}
      <HeadCutawayDiagram
        x={760}
        y={500}
        scale={1.12}
        coldPalatePct={palateCold}
        foreheadPainPct={activeStep === 2 ? 0.35 : 0}
        showTrigeminal={activeStep >= 1}
        showVesselDilate={0}
        frame={frame}
      />

      {/* Animated Icy Blue Liquid Stream entering mouth & hitting upper palate */}
      <g>
        <path
          d="M 415 588 Q 545 578 688 538"
          fill="none"
          stroke="url(#nd3_coldStreamGrad)"
          strokeWidth={18}
          strokeLinecap="round"
          opacity={0.85}
        />
        <path
          d="M 415 588 Q 545 578 688 538"
          fill="none"
          stroke="#E0F2FE"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray="16 14"
          strokeDashoffset={streamOffset}
        />
        {/* Cold splash droplets at upper palate */}
        {[0, 1, 2].map((i) => {
          const r = 6 + ((frame * 0.6 + i * 7) % 16);
          return (
            <circle
              key={i}
              cx={695 + i * 16}
              cy={530 - i * 5}
              r={r * 0.45}
              fill="#38BDF8"
              opacity={0.75}
            />
          );
        })}
      </g>

      {/* STEP 0: Crisp arrow + CleanLabel on right */}
      {activeStep === 0 && (
        <g>
          <path
            d="M 855 525 Q 1005 470 1130 470"
            fill="none"
            stroke="#0284C7"
            strokeWidth={6}
            strokeDasharray="12 8"
          />
          <polygon points="1145,470 1122,456 1122,484" fill="#0284C7" />

          <CleanLabel
            x={1420}
            y={470}
            text="Lạnh 0°C chạm vòm miệng"
            bg="#FFFFFF"
            color="#0369A1"
            border="#0284C7"
            fontSize={30}
          />
          <CleanLabel
            x={1420}
            y={575}
            text="Lớp niêm mạc phía trên rất mỏng"
            bg="#E0F2FE"
            color="#0C4A6E"
            border="#38BDF8"
            fontSize={24}
          />
        </g>
      )}

      {/* STEP 1: Zoomed inset circle on right showing blood vessels + nerve endings */}
      {activeStep === 1 && (
        <g>
          <circle cx={755} cy={525} r={34} fill="none" stroke="#0284C7" strokeWidth={4} strokeDasharray="7 5" />
          <line x1={789} y1={520} x2={1235} y2={460} stroke="#0284C7" strokeWidth={4} strokeDasharray="10 8" />

          <circle cx={1420} cy={460} r={190} fill="#FFFFFF" stroke="#0284C7" strokeWidth={7} />
          <g clipPath="url(#nd3_insetClip)">
            {/* Palate lining background */}
            <rect x={1230} y={270} width={380} height={380} fill="#FFF1F2" />
            <rect x={1230} y={565} width={380} height={95} fill="#FECDD3" />
            <line x1={1230} y1={565} x2={1610} y2={565} stroke="#FB7185" strokeWidth={5} />

            {/* Dense tiny red blood vessels */}
            <g stroke="#DC2626" strokeLinecap="round" fill="none">
              <path d="M 1245 430 Q 1345 405 1445 445 T 1600 420" strokeWidth={11} />
              <path d="M 1255 495 Q 1355 520 1465 485 T 1595 510" strokeWidth={9} />
              <path d="M 1340 422 Q 1365 360 1410 325" strokeWidth={6} />
              <path d="M 1450 442 Q 1490 370 1535 335" strokeWidth={6} />
              <path d="M 1390 500 Q 1420 538 1455 556" strokeWidth={5} />
            </g>

            {/* Yellow nerve endings right behind lining */}
            <g stroke="#EAB308" strokeLinecap="round" fill="none">
              <path d="M 1265 340 Q 1350 380 1415 470 L 1410 548" strokeWidth={7} />
              <path d="M 1415 470 L 1468 545" strokeWidth={5} />
              <path d="M 1415 470 L 1352 548" strokeWidth={5} />
              <path d="M 1545 355 Q 1500 420 1495 544" strokeWidth={6} />
            </g>
            {[
              [1410, 548],
              [1468, 545],
              [1352, 548],
              [1495, 544],
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
            x={1420}
            y={735}
            text="Mạng lưới mạch máu & dây thần kinh"
            bg="#FEFCE8"
            color="#854D0E"
            border="#EAB308"
            fontSize={26}
          />
        </g>
      )}

      {/* STEP 2: Temperature gauge dropping sharply 37°C -> 8°C + pulsing amber warning ring */}
      {activeStep === 2 && (
        <g>
          {/* Pulsing amber warning ring */}
          <rect
            x={1205}
            y={220}
            width={430}
            height={420}
            rx={34}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={8}
            opacity={0.55 + Math.sin(frame * 0.22) * 0.35}
            transform={`translate(${1420 * (1 - warnPulse)}, ${430 * (1 - warnPulse)}) scale(${warnPulse})`}
          />

          {/* Gauge Card */}
          <g transform="translate(1225, 240)">
            <rect
              x={0}
              y={0}
              width={390}
              height={380}
              rx={28}
              fill="#FFFFFF"
              stroke="#F59E0B"
              strokeWidth={5}
            />
            <text
              x={195}
              y={48}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={24}
              fontWeight={800}
              fill="#92400E"
            >
              NHIỆT ĐỘ VÒM MIỆNG
            </text>

            {/* Vertical thermometer bar */}
            <rect x={64} y={82} width={44} height={240} rx={22} fill="#E2E8F0" stroke={INK} strokeWidth={3} />
            <rect
              x={70}
              y={88 + 228 * (1 - tempPct)}
              width={32}
              height={Math.max(18, 228 * tempPct)}
              rx={16}
              fill="url(#nd3_gaugeGrad)"
            />

            {/* Numeric readout & drop indicator */}
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
            <text
              x={245}
              y={236}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={28}
              fontWeight={800}
              fill="#B45309"
            >
              37°C ↓ 8°C
            </text>
            <rect x={152} y={268} width={186} height={46} rx={14} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={3} />
            <text
              x={245}
              y={299}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={22}
              fontWeight={800}
              fill="#92400E"
            >
              SỐC NHIỆT!
            </text>
          </g>

          <CleanLabel
            x={1420}
            y={745}
            text="Tụt nhiệt đột ngột → Báo động!"
            bg="#FEF3C7"
            color="#B45309"
            border="#F59E0B"
            fontSize={28}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 4. NUOCDA_SPEED_VS_SLOW — NuocDaSpeedVsSlowVisual
 * ========================================================================== */
export const NuocDaSpeedVsSlowVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  // CRITICAL SPLIT-SCREEN RULE:
  // step 0: Left active & animated; Right dimmed (0.32) & COMPLETELY FROZEN (frame=0)
  // step 1: Right active & animated; Left dimmed (0.32) & COMPLETELY FROZEN (frame=0)
  // step 2: Both panels active at full brightness side-by-side
  const leftActive = activeStep === 0 || activeStep === 2;
  const rightActive = activeStep === 1 || activeStep === 2;
  const leftOpacity = leftActive ? 1 : 0.32;
  const rightOpacity = rightActive ? 1 : 0.32;
  const leftFrame = leftActive ? frame : 0;
  const rightFrame = rightActive ? frame : 0;

  const leftPain = activeStep === 0 ? p >= 0.5 : true;
  const leftThermoLevel = activeStep === 0 ? lerp(0.85, 0.2, p) : 0.2;
  const leftPulse = leftActive ? 1 + Math.sin(leftFrame * 0.2) * 0.05 : 1;
  const rightPulse = rightActive ? 1 + Math.sin(rightFrame * 0.08) * 0.03 : 1;

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

      {/* LEFT PANEL (x = 0..960, center x = 480) */}
      <g opacity={leftOpacity}>
        <rect x={0} y={0} width={960} height={1080} fill="url(#nd4_leftBg)" />

        <CleanLabel
          x={480}
          y={202}
          text="Uống vèo < 5 giây"
          bg="#FEE2E2"
          color="#B91C1C"
          border="#EF4444"
          fontSize={30}
        />

        <SharedStickman
          x={365}
          y={675}
          scale={1.06}
          role="BOY"
          facing="RIGHT"
          pose={leftPain ? 'HOLD_HEAD_PAIN' : 'DRINK_FAST'}
          expression={leftPain ? 'PAIN' : 'SURPRISED'}
          frame={leftFrame}
        />

        {/* Iced glass beside BOY on left */}
        <IcedDrinkGlass
          x={525}
          y={580}
          scale={0.82}
          fillPct={leftPain ? 0.2 : 0.72}
          showFrost={true}
          frame={leftFrame}
        />

        {/* Red Warning Thermometer Card */}
        <g transform={`translate(645, 315) scale(${leftPulse})`}>
          <rect x={0} y={0} width={225} height={295} rx={24} fill="#FFFFFF" stroke="#EF4444" strokeWidth={4} />
          <text
            x={112}
            y={42}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={22}
            fontWeight={800}
            fill="#B91C1C"
          >
            SỐC LẠNH
          </text>
          <rect x={44} y={66} width={34} height={156} rx={17} fill="#FEE2E2" stroke={INK} strokeWidth={3} />
          <rect
            x={49}
            y={71 + 146 * (1 - leftThermoLevel)}
            width={24}
            height={Math.max(18, 146 * leftThermoLevel)}
            rx={12}
            fill="#EF4444"
          />
          <text
            x={145}
            y={140}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={36}
            fontWeight={900}
            fill="#DC2626"
          >
            &lt; 5s
          </text>
          <text
            x={145}
            y={184}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={22}
            fontWeight={800}
            fill="#991B1B"
          >
            CẢNH BÁO
          </text>
          <rect x={28} y={238} width={169} height={38} rx={12} fill="#FEF2F2" stroke="#EF4444" strokeWidth={2.5} />
          <text
            x={112}
            y={264}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={20}
            fontWeight={800}
            fill="#B91C1C"
          >
            Tụt nhiệt gắt
          </text>
        </g>

        <CleanLabel
          x={480}
          y={768}
          text="Nguy cơ buốt gấp 2 lần"
          bg="#DC2626"
          color="#FFFFFF"
          border="#991B1B"
          fontSize={28}
        />
      </g>

      {/* RIGHT PANEL (x = 960..1920, center x = 1440) */}
      <g opacity={rightOpacity}>
        <rect x={960} y={0} width={960} height={1080} fill="url(#nd4_rightBg)" />

        <CleanLabel
          x={1440}
          y={202}
          text="Nhấp từng ngụm nhỏ"
          bg="#D1FAE5"
          color="#047857"
          border="#10B981"
          fontSize={30}
        />

        <SharedStickman
          x={1375}
          y={675}
          scale={1.06}
          role="BOY"
          facing="LEFT"
          pose="EAT_SLOW"
          expression="HAPPY"
          frame={rightFrame}
        />

        <IcedDrinkGlass
          x={1210}
          y={580}
          scale={0.82}
          fillPct={0.78}
          showFrost={true}
          frame={rightFrame}
        />

        {/* Green Steady Comfort Gauge */}
        <g transform={`translate(1590, 315) scale(${rightPulse})`}>
          <rect x={0} y={0} width={225} height={295} rx={24} fill="#FFFFFF" stroke="#10B981" strokeWidth={4} />
          <text
            x={112}
            y={42}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={22}
            fontWeight={800}
            fill="#047857"
          >
            ỔN ĐỊNH
          </text>
          <rect x={44} y={66} width={34} height={156} rx={17} fill="#D1FAE5" stroke={INK} strokeWidth={3} />
          <rect x={49} y={96} width={24} height={121} rx={12} fill="#10B981" />
          <text
            x={145}
            y={140}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={34}
            fontWeight={900}
            fill="#059669"
          >
            34°C
          </text>
          <text
            x={145}
            y={184}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={22}
            fontWeight={800}
            fill="#065F46"
          >
            AN TOÀN
          </text>
          <rect x={28} y={238} width={169} height={38} rx={12} fill="#ECFDF5" stroke="#10B981" strokeWidth={2.5} />
          <text
            x={112}
            y={264}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={20}
            fontWeight={800}
            fill="#047857"
          >
            Êm dịu dễ chịu
          </text>
        </g>

        <CleanLabel
          x={1440}
          y={768}
          text="Vòm miệng kịp làm ấm"
          bg="#059669"
          color="#FFFFFF"
          border="#065F46"
          fontSize={28}
        />
      </g>

      {/* Center Vertical Divider at x = 960 */}
      <line x1={960} y1={165} x2={960} y2={825} stroke={INK} strokeWidth={6} />
      <circle cx={960} cy={480} r={38} fill="#0F172A" stroke="#FFFFFF" strokeWidth={5} />
      <text
        x={960}
        y={491}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={28}
        fontWeight={900}
        fill="#FACC15"
      >
        VS
      </text>

      {/* Top Comparison Header */}
      {activeStep === 2 ? (
        <CleanLabel
          x={960}
          y={110}
          text="Tốc độ mới là thủ phạm chính!"
          bg="#0F172A"
          color="#FACC15"
          border="#F59E0B"
          fontSize={34}
        />
      ) : (
        <CleanLabel
          x={960}
          y={110}
          text="So sánh tốc độ uống nước lạnh"
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
 * ========================================================================== */
export const NuocDaVesselConstrictDilateVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

  // Step 0 constriction amplitude; Step 1 dilation amplitude
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

      {/* STEP 0: Blood vessel cross-section squeezing narrow */}
      {activeStep === 0 && (
        <g>
          <CleanLabel
            x={960}
            y={94}
            text="Nhịp 1: Co thắt giữ nhiệt"
            bg="#1E3A8A"
            color="#E0F2FE"
            border="#38BDF8"
            fontSize={34}
          />

          {/* Horizontal Blood Vessel Cross-Section (centered at y = 480) */}
          <path
            d={`M 220 355 Q 580 355 960 ${355 + squeeze} Q 1340 355 1700 355 L 1700 605 Q 1340 605 960 ${605 - squeeze} Q 580 605 220 605 Z`}
            fill="url(#nd5_lumenCold)"
            stroke="#FCA5A5"
            strokeWidth={16}
          />

          {/* Slowed red blood cells squeezing through center */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const cx = 260 + ((frame * 2.4 + i * 240) % 1400);
            const distFromCenter = Math.abs(cx - 960);
            const yJitter = distFromCenter < 260 ? 0 : (i % 2 === 0 ? -24 : 24);
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={480 + yJitter}
                rx={28}
                ry={16}
                fill="#EF4444"
                stroke="#FECACA"
                strokeWidth={3}
              />
            );
          })}

          {/* Icy blue snowflakes touching vessel walls + inward squeeze arrows */}
          {[780, 960, 1140].map((sx, idx) => {
            const bob = Math.sin(frame * 0.12 + idx) * 6;
            return (
              <g key={idx}>
                {/* Top snowflake */}
                <g transform={`translate(${sx}, ${265 + bob})`}>
                  <circle cx={0} cy={0} r={22} fill="#0284C7" fillOpacity={0.35} />
                  <path
                    d="M -14 0 L 14 0 M 0 -14 L 0 14 M -10 -10 L 10 10 M 10 -10 L -10 10"
                    stroke="#7DD3FC"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                </g>
                {/* Downward constriction arrow */}
                <line x1={sx} y1={302} x2={sx} y2={352 + squeeze * 0.65} stroke="#38BDF8" strokeWidth={6} />
                <polygon
                  points={`${sx},${364 + squeeze * 0.65} ${sx - 12},${344 + squeeze * 0.65} ${sx + 12},${344 + squeeze * 0.65}`}
                  fill="#38BDF8"
                />

                {/* Upward constriction arrow from bottom */}
                <line x1={sx} y1={658} x2={sx} y2={608 - squeeze * 0.65} stroke="#38BDF8" strokeWidth={6} />
                <polygon
                  points={`${sx},${596 - squeeze * 0.65} ${sx - 12},${616 - squeeze * 0.65} ${sx + 12},${616 - squeeze * 0.65}`}
                  fill="#38BDF8"
                />
              </g>
            );
          })}

          <CleanLabel
            x={960}
            y={758}
            text="Mạch máu co hẹp ngay khi gặp lạnh"
            bg="#0C4A6E"
            color="#E0F2FE"
            border="#38BDF8"
            fontSize={28}
          />
        </g>
      )}

      {/* STEP 1: Blood vessel rebounding wide open with rushing warm blood cells */}
      {activeStep === 1 && (
        <g>
          <CleanLabel
            x={960}
            y={94}
            text="Nhịp 2: Giãn phồng bơm máu ấm"
            bg="#7F1D1D"
            color="#FEF2F2"
            border="#F87171"
            fontSize={34}
          />

          {/* Expanded Blood Vessel Cross-Section */}
          <path
            d={`M 220 355 Q 580 355 960 ${355 - expand} Q 1340 355 1700 355 L 1700 605 Q 1340 605 960 ${605 + expand} Q 580 605 220 605 Z`}
            fill="url(#nd5_lumenWarm)"
            stroke="#FDBA74"
            strokeWidth={16}
          />

          {/* Rapid rushing warm red blood cells */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const cx = 245 + ((frame * 7.5 + i * 145) % 1420);
            const lane = (i % 3 - 1) * 58;
            return (
              <g key={i}>
                <line
                  x1={cx - 52}
                  y1={480 + lane}
                  x2={cx - 24}
                  y2={480 + lane}
                  stroke="#FEF08A"
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={0.7}
                />
                <ellipse
                  cx={cx}
                  cy={480 + lane}
                  rx={26}
                  ry={15}
                  fill="#B91C1C"
                  stroke="#FEF2F2"
                  strokeWidth={3}
                />
              </g>
            );
          })}

          {/* Outward dilation arrows */}
          {[780, 960, 1140].map((ax, idx) => (
            <g key={idx}>
              <line x1={ax} y1={350} x2={ax} y2={265} stroke="#FB923C" strokeWidth={7} />
              <polygon points={`${ax},250 ${ax - 13},274 ${ax + 13},274`} fill="#FB923C" />
              <line x1={ax} y1={610} x2={ax} y2={690} stroke="#FB923C" strokeWidth={7} />
              <polygon points={`${ax},705 ${ax - 13},681 ${ax + 13},681`} fill="#FB923C" />
            </g>
          ))}

          <CleanLabel
            x={960}
            y={768}
            text="Máu ấm ùa về làm thành mạch giãn phồng đột ngột"
            bg="#991B1B"
            color="#FEF2F2"
            border="#FCA5A5"
            fontSize={28}
          />
        </g>
      )}

      {/* STEP 2: HeadCutawayDiagram with showVesselDilate=1 + Pressure Gauge */}
      {activeStep === 2 && (
        <g>
          <CleanLabel
            x={960}
            y={94}
            text="Áp lực tăng vọt lên thành mạch"
            bg="#7C2D12"
            color="#FFF7ED"
            border="#FB923C"
            fontSize={34}
          />

          <HeadCutawayDiagram
            x={690}
            y={495}
            scale={1.12}
            coldPalatePct={0.85}
            foreheadPainPct={0.65}
            showTrigeminal={false}
            showVesselDilate={1}
            frame={frame}
          />

          {/* Clean Pressure Gauge Card on Right */}
          <g transform="translate(1155, 225)">
            <rect
              x={0}
              y={0}
              width={510}
              height={420}
              rx={30}
              fill="#0F172A"
              stroke="#FB923C"
              strokeWidth={5}
            />
            <text
              x={255}
              y={52}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={25}
              fontWeight={800}
              fill="#FED7AA"
            >
              ĐỒNG HỒ ÁP LỰC MẠCH MÁU
            </text>

            {/* Semicircular Gauge Arcs */}
            <g transform="translate(255, 280)">
              {/* Green zone */}
              <path
                d="M -155 0 A 155 155 0 0 1 -77 -134"
                fill="none"
                stroke="#22C55E"
                strokeWidth={28}
                strokeLinecap="butt"
              />
              {/* Yellow zone */}
              <path
                d="M -77 -134 A 155 155 0 0 1 77 -134"
                fill="none"
                stroke="#FACC15"
                strokeWidth={28}
                strokeLinecap="butt"
              />
              {/* Orange-Red Danger zone */}
              <path
                d="M 77 -134 A 155 155 0 0 1 155 0"
                fill="none"
                stroke="#F97316"
                strokeWidth={28}
                strokeLinecap="butt"
              />

              {/* Animated Needle */}
              <g transform={`rotate(${needleAngle})`}>
                <line x1={0} y1={14} x2={0} y2={-132} stroke="#F8FAFC" strokeWidth={9} strokeLinecap="round" />
                <polygon points="0,-144 -10,-122 10,-122" fill="#EF4444" />
              </g>
              <circle cx={0} cy={0} r={18} fill="#F97316" stroke="#FFFFFF" strokeWidth={4} />
            </g>

            <rect x={145} y={332} width={220} height={54} rx={16} fill="#9A3412" stroke="#FB923C" strokeWidth={3} />
            <text
              x={255}
              y={368}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={28}
              fontWeight={900}
              fill="#FFF7ED"
            >
              MỨC BÁO ĐỘNG
            </text>
          </g>

          <CleanLabel
            x={1410}
            y={745}
            text="Thành mạch căng tức kích hoạt dây thần kinh"
            bg="#FFF7ED"
            color="#C2410C"
            border="#F97316"
            fontSize={25}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 6. NUOCDA_TRIGEMINAL_WIRE — NuocDaTrigeminalWireVisual
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
    {
      y: 310,
      title: 'Nhánh 1: Trán & Thái dương',
      accent: '#FACC15',
      bg: '#422006',
      anchorX: 785,
      anchorY: 365,
    },
    {
      y: 470,
      title: 'Nhánh 2: Vòm miệng & Mũi',
      accent: '#38BDF8',
      bg: '#0C4A6E',
      anchorX: 775,
      anchorY: 515,
    },
    {
      y: 630,
      title: 'Nhánh 3: Hàm dưới',
      accent: '#CBD5E1',
      bg: '#1E293B',
      anchorX: 760,
      anchorY: 600,
    },
  ];

  // Electric signal interpolation along palate -> ganglion -> brain
  const pulsePts = [
    { x: 778, y: 535 },
    { x: 735, y: 465 },
    { x: 682, y: 362 },
  ];

  const getSignalPos = (t: number) => {
    const ct = clamp01(t);
    if (ct < 0.5) {
      const k = ct * 2;
      return {
        x: lerp(pulsePts[0].x, pulsePts[1].x, k),
        y: lerp(pulsePts[0].y, pulsePts[1].y, k),
      };
    }
    const k = (ct - 0.5) * 2;
    return {
      x: lerp(pulsePts[1].x, pulsePts[2].x, k),
      y: lerp(pulsePts[1].y, pulsePts[2].y, k),
    };
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

      {/* Top Header */}
      {activeStep === 0 && (
        <CleanLabel
          x={960}
          y={90}
          text="Dây thần kinh sinh ba"
          bg="#422006"
          color="#FEF08A"
          border="#FACC15"
          fontSize={34}
        />
      )}
      {activeStep === 1 && (
        <CleanLabel
          x={960}
          y={90}
          text="3 nhánh chính của dây thần kinh sinh ba"
          bg="#1E293B"
          color="#F8FAFC"
          border="#FACC15"
          fontSize={32}
        />
      )}
      {activeStep === 2 && (
        <CleanLabel
          x={960}
          y={90}
          text="Tín hiệu đau phóng thẳng lên não"
          bg="#7F1D1D"
          color="#FEF08A"
          border="#EF4444"
          fontSize={34}
        />
      )}

      {/* Head Cutaway Diagram on Left */}
      <HeadCutawayDiagram
        x={720}
        y={500}
        scale={1.12}
        coldPalatePct={activeStep === 2 ? 0.95 : 0.7}
        foreheadPainPct={activeStep === 2 ? clamp01(p * 1.2) : 0}
        showTrigeminal={true}
        showVesselDilate={activeStep === 2 ? 0.55 : 0}
        frame={frame}
      />

      {/* Glowing Yellow Trigeminal Hub Highlight */}
      <circle cx={735} cy={465} r={54 * hubPulse} fill="url(#nd6_nerveGlow)" />
      <circle cx={735} cy={465} r={14} fill="#FEF08A" stroke="#CA8A04" strokeWidth={4} />

      {/* STEP 0: Highlighted Trigeminal Nerve Hub Card */}
      {activeStep === 0 && (
        <g>
          <line
            x1={752}
            y1={465}
            x2={1165}
            y2={465}
            stroke="#FACC15"
            strokeWidth={5}
            strokeDasharray="12 8"
          />
          <g transform="translate(1170, 345)">
            <rect
              x={0}
              y={0}
              width={520}
              height={240}
              rx={28}
              fill="#1E293B"
              stroke="#FACC15"
              strokeWidth={5}
            />
            <text
              x={260}
              y={66}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={30}
              fontWeight={900}
              fill="#FEF08A"
            >
              Dây thần kinh sinh ba
            </text>
            <text
              x={260}
              y={120}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={24}
              fontWeight={700}
              fill="#E2E8F0"
            >
              &quot;Cáp truyền tín hiệu&quot; cảm giác
            </text>
            <text
              x={260}
              y={162}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={24}
              fontWeight={700}
              fill="#E2E8F0"
            >
              lớn nhất vùng đầu &amp; khuôn mặt
            </text>
          </g>
        </g>
      )}

      {/* STEP 1: Three non-overlapping callout cards stacked neatly at x=1430, y=310, 470, 630 */}
      {activeStep === 1 && (
        <g>
          {branches.map((br, idx) => {
            const reveal = clamp01(p * 2.6 - idx * 0.45);
            return (
              <g key={idx} opacity={0.25 + 0.75 * reveal}>
                <path
                  d={`M ${br.anchorX} ${br.anchorY} L 1120 ${br.y} L 1200 ${br.y}`}
                  fill="none"
                  stroke={br.accent}
                  strokeWidth={4.5}
                  strokeDasharray="10 8"
                />
                <circle cx={br.anchorX} cy={br.anchorY} r={8} fill={br.accent} />

                {/* Callout Card centered at x=1430, y=br.y (height=104, gap=56) */}
                <rect
                  x={1200}
                  y={br.y - 52}
                  width={460}
                  height={104}
                  rx={22}
                  fill={br.bg}
                  stroke={br.accent}
                  strokeWidth={4}
                />
                <text
                  x={1430}
                  y={br.y + 10}
                  textAnchor="middle"
                  fontFamily={FONT}
                  fontSize={27}
                  fontWeight={800}
                  fill="#F8FAFC"
                >
                  {br.title}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* STEP 2: Bright electric signal pulses traveling rapidly upward into brain */}
      {activeStep === 2 && (
        <g>
          {/* Glowing electric highway from palate -> ganglion -> brain */}
          <polyline
            points="778,535 735,465 682,362"
            fill="none"
            stroke="#FACC15"
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          <polyline
            points="778,535 735,465 682,362"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4}
            strokeDasharray="16 14"
            strokeDashoffset={-(frame * 8)}
          />

          {/* 3 rapid electric pulse orbs */}
          {[0, 0.33, 0.66].map((offset, idx) => {
            const pos = getSignalPos((signalPhase + offset) % 1);
            return (
              <g key={idx}>
                <circle cx={pos.x} cy={pos.y} r={22} fill="#FACC15" opacity={0.35} />
                <circle cx={pos.x} cy={pos.y} r={10} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={3} />
              </g>
            );
          })}

          {/* Signal Oscilloscope Card on Right */}
          <g transform="translate(1170, 290)">
            <rect
              x={0}
              y={0}
              width={520}
              height={310}
              rx={28}
              fill="#0F172A"
              stroke="#EF4444"
              strokeWidth={5}
            />
            <text
              x={260}
              y={54}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={25}
              fontWeight={800}
              fill="#FEF08A"
            >
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
            <text
              x={260}
              y={268}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={24}
              fontWeight={800}
              fill="#FCA5A5"
            >
              Truyền tốc độ cao lên trung khu não
            </text>
          </g>

          <CleanLabel
            x={1430}
            y={735}
            text="Tín hiệu đau phóng thẳng lên não"
            bg="#FEF08A"
            color="#713F12"
            border="#EAB308"
            fontSize={27}
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 7. NUOCDA_REFERRED_PAIN_MAP — NuocDaReferredPainMapVisual
 * ========================================================================== */
export const NuocDaReferredPainMapVisual: React.FC<EpisodeVisualProps> = ({
  frame = 0,
  step,
  visualStep,
  progress = 0,
}) => {
  const activeStep = step ?? visualStep ?? 0;
  const p = clamp01(progress);

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

      {/* Top Header */}
      {activeStep === 0 && (
        <CleanLabel
          x={960}
          y={90}
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
          y={90}
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
          y={90}
          text="Lạnh ở miệng → Nhói ở trán!"
          bg="#312E81"
          color="#EEF2FF"
          border="#818CF8"
          fontSize={34}
        />
      )}

      {/* STEP 0: Clean Switchboard Metaphor — 2 cables merging into 1 shared cable */}
      {activeStep === 0 && (
        <g>
          {/* Input 1: Forehead */}
          <rect x={165} y={248} width={310} height={110} rx={24} fill="#7F1D1D" stroke="#F87171" strokeWidth={5} />
          <text
            x={320}
            y={314}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={34}
            fontWeight={900}
            fill="#FEF2F2"
          >
            Trán
          </text>

          {/* Input 2: Palate */}
          <rect x={165} y={502} width={310} height={110} rx={24} fill="#0C4A6E" stroke="#38BDF8" strokeWidth={5} />
          <text
            x={320}
            y={568}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={34}
            fontWeight={900}
            fill="#E0F2FE"
          >
            Vòm miệng
          </text>

          {/* Merging Cables */}
          <path
            d="M 475 303 C 660 303 690 415 845 425"
            fill="none"
            stroke="#F87171"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d="M 475 557 C 660 557 690 445 845 435"
            fill="none"
            stroke="#38BDF8"
            strokeWidth={14}
            strokeLinecap="round"
          />
          {/* Animated pulses on palate cable */}
          <path
            d="M 475 557 C 660 557 690 445 845 435"
            fill="none"
            stroke="#E0F2FE"
            strokeWidth={6}
            strokeDasharray="16 20"
            strokeDashoffset={cableDash}
          />

          {/* Central Switchboard Hub */}
          <rect x={830} y={350} width={280} height={160} rx={28} fill="#422006" stroke="#FACC15" strokeWidth={6} />
          <text
            x={970}
            y={418}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={28}
            fontWeight={900}
            fill="#FEF08A"
          >
            TỔNG ĐÀI
          </text>
          <text
            x={970}
            y={462}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={25}
            fontWeight={800}
            fill="#FDE047"
          >
            Dây sinh ba
          </text>

          {/* Single Shared Output Cable */}
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

          {/* Brain Receiver Box */}
          <rect x={1490} y={350} width={275} height={160} rx={28} fill="#312E81" stroke="#818CF8" strokeWidth={6} />
          <text
            x={1628}
            y={422}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={34}
            fontWeight={900}
            fill="#EEF2FF"
          >
            NÃO BỘ
          </text>
          <text
            x={1628}
            y={466}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={22}
            fontWeight={700}
            fill="#C7D2FE"
          >
            Dễ hiểu nhầm vị trí!
          </text>

          <CleanLabel
            x={960}
            y={755}
            text="Chung tổng đài dây sinh ba"
            bg="#FEF9C3"
            color="#854D0E"
            border="#EAB308"
            fontSize={32}
          />
        </g>
      )}

      {/* STEP 1 & STEP 2: HeadCutawayDiagram showing cold origin at palate vs red pain burst on forehead */}
      {activeStep >= 1 && (
        <g>
          <HeadCutawayDiagram
            x={720}
            y={455}
            scale={1.06}
            coldPalatePct={0.9}
            foreheadPainPct={1}
            showTrigeminal={true}
            showVesselDilate={0.5}
            frame={frame}
          />

          {/* Blue Cold Origin Dot at Palate */}
          <g>
            <circle cx={780} cy={512} r={rippleR} fill="none" stroke="#38BDF8" strokeWidth={4} opacity={0.75} />
            <circle cx={780} cy={512} r={14} fill="#0284C7" stroke="#E0F2FE" strokeWidth={4} />
          </g>

          {/* Red Perceived Pain Burst on Forehead */}
          <g transform={`translate(815, 345) scale(${burstScale})`}>
            <circle cx={0} cy={0} r={66} fill="url(#nd7_painBurstGrad)" />
            <polygon
              points="0,-42 10,-14 38,-22 18,2 40,22 12,16 4,44 -8,16 -38,24 -16,2 -36,-22 -10,-14"
              fill="#EF4444"
              stroke="#FEF08A"
              strokeWidth={3.5}
            />
          </g>

          {/* Connectors to Right Callout Labels */}
          <line x1={865} y1={345} x2={1165} y2={345} stroke="#EF4444" strokeWidth={5} strokeDasharray="10 8" />
          <line x1={805} y1={512} x2={1165} y2={545} stroke="#38BDF8" strokeWidth={5} strokeDasharray="10 8" />

          {/* Right-side Mapped Explanation Labels */}
          <CleanLabel
            x={1435}
            y={345}
            text="Nơi cảm nhận đau: Trán!"
            bg="#FEE2E2"
            color="#B91C1C"
            border="#EF4444"
            fontSize={28}
          />

          {/* Upward Misrouting Arrow between labels */}
          <line x1={1435} y1={492} x2={1435} y2={406} stroke="#FACC15" strokeWidth={7} />
          <polygon points="1435,392 1421,416 1449,416" fill="#FACC15" />

          <CleanLabel
            x={1435}
            y={545}
            text="Nguồn lạnh thật: Vòm miệng"
            bg="#E0F2FE"
            color="#0369A1"
            border="#38BDF8"
            fontSize={28}
          />

          {/* Bottom Badge at y=760 */}
          {activeStep === 1 ? (
            <CleanLabel
              x={960}
              y={760}
              text="Lạnh ở miệng → Nhói ở trán!"
              bg="#FEF2F2"
              color="#DC2626"
              border="#EF4444"
              fontSize={32}
            />
          ) : (
            <g opacity={0.4 + 0.6 * clamp01(p * 1.5)}>
              <CleanLabel
                x={960}
                y={760}
                text="Cơ chế Đau quy chiếu (Referred Pain)"
                bg="#EEF2FF"
                color="#3730A3"
                border="#6366F1"
                fontSize={32}
              />
            </g>
          )}
        </g>
      )}
    </svg>
  );
};
