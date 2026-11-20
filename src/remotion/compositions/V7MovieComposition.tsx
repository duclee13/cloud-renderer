/**
 * V7MovieComposition.tsx: Production Explainer Movie Composition
 * Tích hợp 100% lõi chuyển động sinh học V7.3 (Zero-Hardcoded-Frames).
 * Hỗ trợ:
 * 1. Audio-driven playback qua Remotion Sequence + Audio
 * 2. Phụ đề phim điện ảnh chuyên nghiệp (Cinematic Subtitles)
 * 3. Bóng thoại nhân vật (SpeechBubble)
 * 4. Mở rộng 9 Theme bối cảnh và 12 Hành động tương tác
 * 5. Cờ showDebugHud (mặc định false khi xuất phim thật)
 */

import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Sequence, Audio } from "remotion";
import { StickmanRig } from "../components/character/StickmanRig";
import { MantisRig } from "../components/character/MantisRig";
import { BackgroundStage } from "../components/backgrounds/BackgroundStage";
import {
  FlashlightNightSceneLayer,
  computeHornetNightPrimarySockets,
  HornetNightSceneMode,
} from "../components/backgrounds/FlashlightNightStage";
import { KassStorySceneLayer } from "../../components/v7/KassStageLibrary";
import { GaugeMeter } from "../components/props/GaugeMeter";
import { InsertHandShot } from "../components/vfx/InsertHandShot";
import { SpeechBubble, calculateSafeSpeechBubble } from "../components/ui/SpeechBubble";
import {
  StoryInfographicCards,
  CharacterStoryOverlays,
} from "../components/cards/StoryInfographicCards";
import { generateSfxDataUrl } from "../../lib/sfxGenerator";
import { compileScriptBeats, ScriptBeat } from "../../animscript/actionLibrary";
import {
  resolveVitalityPreset,
  resolveActionIntent,
  computeMantisRigSockets,
  computeStickmanRigSockets,
  computeMantisPreyWorldPos,
  projectPointToStageScreen,
  projectSocketsToStageScreen,
  shouldRenderMinimalistCallout,
} from "../../lib/v7/universalAnimationStandard";
import { SCRIPT_BEATS as DEFAULT_BEATS } from "./TestV7AutoScriptShowcase";

export interface HybridRenderConfig {
  chromiumOptions: { gl: "angle" | "swangle"; enableMultiProcessOnLinux?: boolean };
  hardwareAcceleration: "if-possible";
  concurrency: number;
  imageFormat: "jpeg";
  jpegQuality: number;
  x264Preset: "veryfast";
  hwEncoder?: "h264_qsv" | "h264_mf" | "libx264";
  globalQuality?: number;
  preview?: boolean;
  width?: number;
  height?: number;
  fps?: number;
}

export interface V7SoundDesignPayload {
  bgmSegments?: {
    trackId: "BGM_STORY_CALM" | "BGM_TENSE_PULSE" | "BGM_WARM_OUTRO";
    startFrame: number;
    endFrame: number;
    volume: number;
    fadeInSec: number;
    fadeOutSec: number;
  }[];
  sfxCues?: {
    effectId: "sfx_pop" | "sfx_whoosh" | "sfx_switch_click" | "sfx_ding" | "sfx_lock" | "sfx_alert";
    frame: number;
    volume: number;
    reason?: string;
  }[];
  bgmAudioUrls?: Partial<Record<"BGM_STORY_CALM" | "BGM_TENSE_PULSE" | "BGM_WARM_OUTRO", string>>;
  sfxAudioUrls?: Partial<
    Record<"sfx_pop" | "sfx_whoosh" | "sfx_switch_click" | "sfx_ding" | "sfx_lock" | "sfx_alert", string>
  >;
}

export interface V7MoviePayload {
  title?: string;
  totalDurationFrames: number;
  fps: number;
  beats: ScriptBeat[];
  showDebugHud?: boolean;
  renderConfig?: HybridRenderConfig;
  soundDesign?: V7SoundDesignPayload;
}

export interface V7MovieCompositionProps {
  payload?: V7MoviePayload;
  v7MoviePayload?: V7MoviePayload;
  beats?: ScriptBeat[];
  showDebugHud?: boolean;
}

export const V7MovieComposition: React.FC<V7MovieCompositionProps> = (props) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const groundY = 840;

  const rawBeats =
    props.payload?.beats ||
    props.v7MoviePayload?.beats ||
    props.beats ||
    (props as any).sceneGraph?.beats ||
    (props as any).sceneGraph?.v7MoviePayload?.beats ||
    DEFAULT_BEATS;

  const beats: ScriptBeat[] = Array.isArray(rawBeats) && rawBeats.length > 0 ? rawBeats : DEFAULT_BEATS;

  // Đánh giá trạng thái động học toàn diện V7.3
  const evaluated = compileScriptBeats(beats, frame, groundY);

  // Xác định beat hiện tại và tiến độ chuẩn hóa u để đồng bộ hiển thị bóng thoại
  let activeBeatIndex = 0;
  let activeBeatLocalF = frame;
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    if (frame >= b.startFrame && frame < b.startFrame + b.durationFrames) {
      activeBeatIndex = i;
      activeBeatLocalF = frame - b.startFrame;
      break;
    }
  }
  const currentBeat = beats[activeBeatIndex] || beats[0];
  const beatProgressU = Math.min(1.0, Math.max(0.0, activeBeatLocalF / Math.max(1, currentBeat.durationFrames)));

  // Hiệu ứng chuyển cảnh điện ảnh mượt (Scene Crossfade & Camera Pan nhẹ) 8 frames đầu/cuối khi đổi theme
  const normalizeTheme = (t?: string) =>
    t === "STREET_SOCCER" ? "SUNSET_PARK" : t === "WAREHOUSE" ? "DARK_STUDIO" : t || "STUDY_ROOM";
  const curThemeNorm = normalizeTheme(currentBeat.theme ?? currentBeat.stageTheme);
  const prevBeat = activeBeatIndex > 0 ? beats[activeBeatIndex - 1] : null;
  const nextBeat = activeBeatIndex < beats.length - 1 ? beats[activeBeatIndex + 1] : null;
  const hasThemeChangeStart = Boolean(prevBeat && normalizeTheme(prevBeat.theme ?? prevBeat.stageTheme) !== curThemeNorm);
  const hasThemeChangeEnd = Boolean(nextBeat && normalizeTheme(nextBeat.theme ?? nextBeat.stageTheme) !== curThemeNorm);

  let transitionOverlayOpacity = 0;
  let cameraPanX = 0;
  const remainingFrames = currentBeat.durationFrames - activeBeatLocalF;

  if (hasThemeChangeStart && activeBeatLocalF < 8) {
    const p = activeBeatLocalF / 8;
    transitionOverlayOpacity = (1 - p) * 0.45;
    cameraPanX = (1 - p) * 16;
  } else if (hasThemeChangeEnd && remainingFrames < 8) {
    const p = remainingFrames / 8;
    transitionOverlayOpacity = (1 - p) * 0.45;
    cameraPanX = -(1 - p) * 16;
  }

  const shouldShowHud = Boolean(
    props.showDebugHud ??
    props.payload?.showDebugHud ??
    props.v7MoviePayload?.showDebugHud ??
    evaluated.showDebugHud ??
    false
  );

  const stickmanState = {
    x: evaluated.rootX,
    y: evaluated.rootY,
    scale: 1.0,
    facing: evaluated.facing,
    facingFactor: evaluated.facingFactor,
    pose: evaluated.rigPose,
    torsoTiltDeg: evaluated.torsoTiltDeg,
    crouchDepth: evaluated.crouchDepth,
    flightLift: evaluated.flightLift,
    walkCycleProgress: evaluated.walkCycleProgress,
    walkWeight: evaluated.walkWeight,
    leftFootOffset: evaluated.leftFootOffset,
    rightFootOffset: evaluated.rightFootOffset,
    leftKneeOffset: evaluated.leftKneeOffset,
    rightKneeOffset: evaluated.rightKneeOffset,
    customHipY: evaluated.customHipY,
    limbAngles: {
      head: evaluated.headTiltDeg,
    },
    eyes: evaluated.eyes,
    eyebrows: evaluated.eyebrows,
    mouth: evaluated.mouth,
    pupilGaze: evaluated.pupilGaze,
    blush: evaluated.blush,
    sweatDrop: evaluated.sweatDrop,
    holdingTarget: evaluated.holdingTarget,
    hat: evaluated.archetype === "oldMan" || !evaluated.archetype,
    archetype: (evaluated.archetype || "oldMan") as any,
    rimLight: evaluated.rimLight,
    rimColor: evaluated.rimColor,
  };

  const isInfographicCardBeat = Boolean(
    currentBeat.cardType && currentBeat.cardType !== "CHARACTER_POSE_CARD"
  );
  const isCharacterPoseBeat = Boolean(
    currentBeat.cardType === "CHARACTER_POSE_CARD" ||
      currentBeat.type === "STORY_MICRO_POSE" ||
      currentBeat.action === "STORY_MICRO_POSE" ||
      currentBeat.cameraZoom
  );
  const [zoomStart, zoomEnd] = currentBeat.cameraZoom || [1.0, 1.12];
  const stageCameraScale = isCharacterPoseBeat
    ? zoomStart + (zoomEnd - zoomStart) * beatProgressU
    : 1.0;

  const isKassStoryBeat = Boolean(!isInfographicCardBeat && currentBeat.kassSceneMode);

  const isHornetNightBeat = Boolean(
    !isInfographicCardBeat &&
      !isKassStoryBeat &&
      (evaluated.theme === "NIGHT_GARDEN_FLASHLIGHT" ||
        (currentBeat.archetype || evaluated.archetype) === "hornet")
  );
  const activeHornetMode: HornetNightSceneMode =
    currentBeat.hornetSceneMode || "NIGHT_CALM";
  const isHornetNestCloseup =
    isHornetNightBeat &&
    (activeHornetMode === "NIGHT_CALM" || activeHornetMode === "PHEROMONE_ALARM_WAVES");
  const stageCamOriginX = isKassStoryBeat
    ? 960
    : isHornetNestCloseup
    ? 1260
    : isHornetNightBeat
    ? 960
    : evaluated.rootX > 0
    ? evaluated.rootX
    : 960;
  const stageCamOriginY = isKassStoryBeat
    ? 520
    : isHornetNestCloseup
    ? 410
    : isHornetNightBeat
    ? 520
    : groundY - 210;

  return (
    <AbsoluteFill style={{ width, height, overflow: "hidden", backgroundColor: "#0A0A0C" }}>
      {/* Font Be Vietnam Pro */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&display=swap');
      `}</style>

      {/* =========================================================================
          1. ĐỒNG BỘ ÂM THANH TTS NHẤN NHÁ TỪNG MỆNH ĐỀ & SFX (REMOTION SEQUENCE)
         ========================================================================= */}
      {beats.map((beat, idx) => {
        const sfxElements: React.ReactNode[] = [];
        if (beat.sfxType) {
          sfxElements.push(
            <Sequence
              key={`beat_sfx_${idx}_${beat.startFrame}`}
              from={beat.startFrame}
              durationInFrames={Math.min(35, beat.durationFrames)}
            >
              <Audio src={generateSfxDataUrl(beat.sfxType)} volume={0.25} />
            </Sequence>
          );
        }
        if (beat.sfxText) {
          const popOffset = Math.max(4, Math.floor(0.18 * beat.durationFrames));
          sfxElements.push(
            <Sequence
              key={`beat_sfx_pop_${idx}_${beat.startFrame}`}
              from={beat.startFrame + popOffset}
              durationInFrames={Math.min(25, Math.max(10, beat.durationFrames - popOffset))}
            >
              <Audio src={generateSfxDataUrl("sfx_pop")} volume={0.28} />
            </Sequence>
          );
        }

        if (beat.audioUrl) {
          return (
            <React.Fragment key={`beat_audio_single_${idx}_${beat.startFrame}`}>
              {sfxElements}
              <Sequence
                from={beat.startFrame}
                durationInFrames={beat.durationFrames}
              >
                <Audio src={beat.audioUrl} />
              </Sequence>
            </React.Fragment>
          );
        }

        if (beat.subClauseAudios && beat.subClauseAudios.length > 0) {
          return (
            <React.Fragment key={`beat_audio_group_${idx}_${beat.startFrame}`}>
              {sfxElements}
              {beat.subClauseAudios.map((clause, cIdx) => (
                <Sequence
                  key={`beat_clause_${idx}_${cIdx}`}
                  from={beat.startFrame + clause.startOffsetFrames}
                  durationInFrames={Math.max(10, clause.durationFrames)}
                >
                  <Audio src={clause.audioUrl} />
                </Sequence>
              ))}
            </React.Fragment>
          );
        }

        return <React.Fragment key={`beat_sfx_only_${idx}`}>{sfxElements}</React.Fragment>;
      })}

      {/* =========================================================================
          1B. V13.0 NHẠC NỀN BGM (3 HỒI CROSSFADE -22dB) & 6 SFX TỰ ĐỘNG (CHO REMOTION PREVIEW)
         ========================================================================= */}
      {(() => {
        const activeSound = props.payload?.soundDesign ?? props.v7MoviePayload?.soundDesign;
        if (!activeSound) return null;
        return (
          <>
            {(activeSound.bgmSegments || []).map((seg, sIdx) => {
              const src = activeSound.bgmAudioUrls?.[seg.trackId];
              if (!src) return null;
              const segDur = Math.max(1, seg.endFrame - seg.startFrame);
              const fadeInF = Math.max(1, Math.round((seg.fadeInSec || 0.5) * fps));
              const fadeOutF = Math.max(1, Math.round((seg.fadeOutSec || 0.8) * fps));
              return (
                <Sequence
                  key={`v13_bgm_${sIdx}_${seg.trackId}_${seg.startFrame}`}
                  from={seg.startFrame}
                  durationInFrames={segDur}
                >
                  <Audio
                    src={src}
                    loop
                    volume={(f) => {
                      const inGain = f < fadeInF ? f / fadeInF : 1;
                      const remain = segDur - 1 - f;
                      const outGain = remain < fadeOutF ? Math.max(0, remain / fadeOutF) : 1;
                      return seg.volume * inGain * outGain;
                    }}
                  />
                </Sequence>
              );
            })}
            {(activeSound.sfxCues || []).map((cue, cIdx) => {
              const src = activeSound.sfxAudioUrls?.[cue.effectId];
              if (!src) return null;
              return (
                <Sequence
                  key={`v13_sfx_${cIdx}_${cue.effectId}_${cue.frame}`}
                  from={cue.frame}
                  durationInFrames={36}
                >
                  <Audio src={src} volume={cue.volume} />
                </Sequence>
              );
            })}
          </>
        );
      })()}

      {/* =========================================================================
          2. PHÔNG NỀN ĐA LỚP THEO THEME (10 THEME VECTOR 2K + 5 BỐI CẢNH ĐỜI SỐNG V14.0)
         ========================================================================= */}
      {!isKassStoryBeat && (
        <BackgroundStage theme={evaluated.theme} frame={frame} groundY={groundY} />
      )}

      {/* =========================================================================
          3. SÂN KHẤU SVG CHÍNH CHỨA ĐẠO CỤ VÀ NHÂN VẬT THEO ĐỘ SÂU CEL-SHADING
         ========================================================================= */}
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transformOrigin: `${stageCamOriginX}px ${stageCamOriginY}px`,
          transform:
            cameraPanX !== 0 || stageCameraScale !== 1.0
              ? `translateX(${cameraPanX.toFixed(1)}px) scale(${stageCameraScale.toFixed(3)})`
              : undefined,
        }}
      >
        {/* ĐẠO CỤ CẢNH 1: STUDY_ROOM */}
        {evaluated.theme === "STUDY_ROOM" && (
          <g id="props-study-room">
            {/* Ghế tựa văn phòng gọn gàng ở X = 915 (đảm bảo khi nhân vật đứng ăn mừng ở X = 845 không chạm ghế) */}
            <g id="prop-chair" transform={`translate(915, ${groundY})`}>
              <ellipse cx={0} cy={2} rx={36} ry={9} fill="rgba(0,0,0,0.22)" />
              <line x1={-22} y1={-85} x2={-26} y2={0} stroke="#1E293B" strokeWidth={8} strokeLinecap="round" />
              <line x1={22} y1={-85} x2={26} y2={0} stroke="#1E293B" strokeWidth={8} strokeLinecap="round" />
              <rect x={-32} y={-85} width={64} height={16} rx={6} fill="#D97706" stroke="#1E293B" strokeWidth={5} />
              <rect x={-34} y={-205} width={15} height={125} rx={6} fill="#B45309" stroke="#1E293B" strokeWidth={5} />
            </g>

            {/* Bàn làm việc từ X = 955 đến X = 1135 */}
            <g id="prop-desk" transform={`translate(1045, ${groundY})`}>
              <ellipse cx={0} cy={2} rx={95} ry={14} fill="rgba(0,0,0,0.22)" />
              <line x1={-75} y1={-155} x2={-75} y2={0} stroke="#78350F" strokeWidth={12} strokeLinecap="round" />
              <line x1={75} y1={-155} x2={75} y2={0} stroke="#78350F" strokeWidth={12} strokeLinecap="round" />
              <rect x={-90} y={-155} width={180} height={18} rx={6} fill="#92400E" stroke="#1E293B" strokeWidth={6} />
            </g>

            {/* Laptop mở nắp nhìn nghiêng (Side-View Open Laptop) */}
            <g id="prop-laptop">
              <rect x={965} y={677} width={52} height={8} rx={3} fill="#94A3B8" stroke="#141414" strokeWidth={4} />
              <line x1={970} y1={680} x2={1008} y2={680} stroke="#475569" strokeWidth={2} strokeLinecap="round" />
              <polygon points="1012,677 1030,632 1038,635 1020,677" fill="#38BDF8" stroke="#141414" strokeWidth={4} />
              <line x1={1016} y1={674} x2={1032} y2={636} stroke="#FFFFFF" strokeWidth={2} opacity={0.8} />
            </g>

            {/* Hiệu ứng bóng đèn ý tưởng */}
            {evaluated.vfxState.ideaSpark && (
              <g
                id="vfx-idea-spark"
                transform={`translate(${evaluated.vfxState.sparkX}, ${evaluated.vfxState.sparkY}) scale(${evaluated.vfxState.sparkScale})`}
              >
                <circle cx={0} cy={0} r={42} fill="#FEF08A" opacity={0.45} />
                <circle cx={0} cy={0} r={28} fill="#FACC15" stroke="#1E293B" strokeWidth={6} />
                <rect x={-8} y={24} width={16} height={10} fill="#94A3B8" stroke="#1E293B" strokeWidth={3} />
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i * Math.PI) / 4;
                  return (
                    <line
                      key={`spark_ray_${i}`}
                      x1={Math.cos(angle) * 36}
                      y1={Math.sin(angle) * 36}
                      x2={Math.cos(angle) * 48}
                      y2={Math.sin(angle) * 48}
                      stroke="#CA8A04"
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            )}
          </g>
        )}

        {/* ĐẠO CỤ CẢNH 2: SUNSET_PARK */}
        {evaluated.theme === "SUNSET_PARK" && (
          <g id="props-sunset-park">
            {evaluated.propsState.ball?.visible && (
              <g
                id="prop-soccer-ball"
                transform={`translate(${evaluated.propsState.ball.x}, ${evaluated.propsState.ball.y}) rotate(${evaluated.propsState.ball.rotationDeg})`}
              >
                {evaluated.propsState.ball.y >= groundY - 35 && (
                  <ellipse cx={0} cy={18} rx={18} ry={5} fill="rgba(0,0,0,0.25)" />
                )}
                <circle cx={0} cy={0} r={18} fill="#F8FAFC" stroke="#1E293B" strokeWidth={5} />
                <polygon points="0,-8 7,-2 4,6 -4,6 -7,-2" fill="#1E293B" />
                <line x1={0} y1={-8} x2={0} y2={-18} stroke="#1E293B" strokeWidth={3} />
                <line x1={7} y1={-2} x2={16} y2={-6} stroke="#1E293B" strokeWidth={3} />
                <line x1={4} y1={6} x2={12} y2={14} stroke="#1E293B" strokeWidth={3} />
                <line x1={-4} y1={6} x2={-12} y2={14} stroke="#1E293B" strokeWidth={3} />
                <line x1={-7} y1={-2} x2={-16} y2={-6} stroke="#1E293B" strokeWidth={3} />
              </g>
            )}

            {evaluated.propsState.cup?.visible && (
              <g id="prop-water-cup" transform={`translate(${evaluated.propsState.cup.x}, ${evaluated.propsState.cup.y})`}>
                <rect x={-9} y={-16} width={18} height={24} rx={4} fill="#38BDF8" stroke="#1E293B" strokeWidth={4} />
                <path d="M 9,-10 C 15,-10 15,0 9,0" fill="none" stroke="#1E293B" strokeWidth={3} />
              </g>
            )}
          </g>
        )}

        {/* ĐẠO CỤ CẢNH 3: DARK_STUDIO (Ẩn bảng/thùng khi ở chế độ Storytime hoặc nhân vật Bọ Ngựa) */}
        {evaluated.theme === "DARK_STUDIO" &&
          !isInfographicCardBeat &&
          (currentBeat.archetype || evaluated.archetype) !== "mantis" &&
          currentBeat.type !== "STORY_MICRO_POSE" && (
          <g id="props-dark-studio">
            {evaluated.propsState.crate?.visible && (
              <g id="prop-heavy-crate" transform={`translate(${evaluated.propsState.crate.x}, ${groundY})`}>
                <ellipse cx={0} cy={2} rx={75} ry={14} fill="rgba(0,0,0,0.45)" />
                <rect x={-58} y={-140} width={115} height={140} rx={8} fill="#475569" stroke="#1E293B" strokeWidth={8} />
                <g clipPath="url(#hazard-clip-v7)">
                  <clipPath id="hazard-clip-v7">
                    <rect x={-58} y={-95} width={115} height={36} rx={2} />
                  </clipPath>
                  <rect x={-58} y={-95} width={115} height={36} fill="#FACC15" />
                  <line x1={-65} y1={-95} x2={-45} y2={-59} stroke="#1E293B" strokeWidth={9} />
                  <line x1={-40} y1={-95} x2={-20} y2={-59} stroke="#1E293B" strokeWidth={9} />
                  <line x1={-15} y1={-95} x2={5} y2={-59} stroke="#1E293B" strokeWidth={9} />
                  <line x1={10} y1={-95} x2={30} y2={-59} stroke="#1E293B" strokeWidth={9} />
                  <line x1={35} y1={-95} x2={55} y2={-59} stroke="#1E293B" strokeWidth={9} />
                </g>
                <rect x={-62} y={-75} width={7} height={26} rx={3} fill="#0F172A" />
                <rect x={55} y={-75} width={7} height={26} rx={3} fill="#0F172A" />
              </g>
            )}

            <g id="prop-presentation-board" transform={`translate(1350, ${groundY})`}>
              <ellipse cx={0} cy={2} rx={180} ry={16} fill="rgba(0,0,0,0.5)" />
              <line x1={-125} y1={-180} x2={-145} y2={0} stroke="#64748B" strokeWidth={10} strokeLinecap="round" />
              <line x1={125} y1={-180} x2={145} y2={0} stroke="#64748B" strokeWidth={10} strokeLinecap="round" />
              <line x1={-155} y1={0} x2={-135} y2={0} stroke="#64748B" strokeWidth={12} strokeLinecap="round" />
              <line x1={135} y1={0} x2={155} y2={0} stroke="#64748B" strokeWidth={12} strokeLinecap="round" />
              <rect x={-170} y={-450} width={340} height={270} rx={12} fill="#0B132B" stroke="#38BDF8" strokeWidth={8} />
              <line x1={-140} y1={-220} x2={140} y2={-220} stroke="#1E293B" strokeWidth={3} />
              <line x1={-140} y1={-290} x2={140} y2={-290} stroke="#1E293B" strokeWidth={3} />
              <line x1={-140} y1={-360} x2={140} y2={-360} stroke="#1E293B" strokeWidth={3} />
              <line x1={-140} y1={-430} x2={-140} y2={-200} stroke="#1E293B" strokeWidth={4} />
              <path d="M -130,-230 Q -30,-240 10,-310 T 110,-410" fill="none" stroke="#10B981" strokeWidth={7} strokeLinecap="round" />
              <circle cx={-80} cy={-240} r={8} fill="#FACC15" stroke="#FFFFFF" strokeWidth={3} />
              <circle cx={10} cy={-310} r={10} fill="#FACC15" stroke="#FFFFFF" strokeWidth={4} />
              <circle cx={90} cy={-380} r={12} fill="#EF4444" stroke="#FFFFFF" strokeWidth={4} />
              <text x={0} y={-420} textAnchor="middle" fill="#38BDF8" fontSize={18} fontWeight="900" fontFamily="'Be Vietnam Pro', sans-serif">
                GROWTH PIPELINE V8.0
              </text>
            </g>

            {evaluated.propsState.pointer?.visible && (
              <line
                x1={evaluated.propsState.pointer.x1}
                y1={evaluated.propsState.pointer.y1}
                x2={evaluated.propsState.pointer.x2}
                y2={evaluated.propsState.pointer.y2}
                stroke="#FACC15"
                strokeWidth={5}
                strokeLinecap="round"
              />
            )}
          </g>
        )}

        {/* ĐẠO CỤ MỞ RỘNG V8: HỘP CÁC-TÔNG, TÁO, ĐỒNG HỒ GAUGE, INSERT HAND */}
        {evaluated.propsState.box?.visible && (
          <g id="prop-carry-box" transform={`translate(${evaluated.propsState.box.x}, ${evaluated.propsState.box.y})`}>
            <ellipse cx={0} cy={2} rx={60} ry={12} fill="rgba(0,0,0,0.25)" />
            <rect x={-55} y={-85} width={110} height={85} rx={6} fill="#D97706" stroke="#1E293B" strokeWidth={6} />
            <line x1={-55} y1={-50} x2={55} y2={-50} stroke="#B45309" strokeWidth={4} />
          </g>
        )}

        {evaluated.propsState.apple?.visible && (
          <g id="prop-carry-apple" transform={`translate(${evaluated.propsState.apple.x}, ${evaluated.propsState.apple.y})`}>
            <circle cx={0} cy={0} r={18} fill="#EF4444" stroke="#1E293B" strokeWidth={4} />
            <path d="M 0,-18 Q 8,-30 12,-26" fill="none" stroke="#78350F" strokeWidth={3} />
            <ellipse cx={8} cy={-24} rx={6} ry={3} fill="#22C55E" />
          </g>
        )}

        {/* Đồng hồ đo bán nguyệt GaugeMeter */}
        {evaluated.propsState.gauge?.visible && (
          <g id="prop-gauge-meter" transform={`translate(${evaluated.propsState.gauge.x}, ${evaluated.propsState.gauge.y})`}>
            <GaugeMeter
              needleAngle={evaluated.propsState.gauge.needleAngle}
              label={evaluated.propsState.gauge.label}
            />
          </g>
        )}

        {/* NHÂN VẬT CHÍNH: SÂN KHẤU ĐỜI SỐNG KASS V14.0, ĐÈN PIN ONG BẮP CÀY V11.0, BỌ NGỰA 2D HOẶC NGƯỜI QUE */}
        {isKassStoryBeat && currentBeat.kassSceneMode ? (
          <KassStorySceneLayer
            mode={currentBeat.kassSceneMode}
            frame={frame}
            localFrame={activeBeatLocalF}
            durationFrames={currentBeat.durationFrames}
            u={beatProgressU}
            groundY={groundY}
          />
        ) : isHornetNightBeat ? (
          <FlashlightNightSceneLayer
            mode={activeHornetMode}
            frame={frame}
            localFrame={activeBeatLocalF}
            durationFrames={currentBeat.durationFrames}
            u={beatProgressU}
            groundY={groundY}
          />
        ) : (
          evaluated.rootX > -500 &&
          !isInfographicCardBeat &&
          ((currentBeat.archetype || evaluated.archetype) === "mantis" ? (
            <MantisRig
              x={evaluated.rootX}
              y={groundY}
              facing={evaluated.facing}
              frame={frame}
              localFrame={activeBeatLocalF}
              durationFrames={currentBeat.durationFrames}
              u={beatProgressU}
              hungerStage={currentBeat.hungerStage}
              vitalityPreset={currentBeat.vitalityPreset}
              actionIntent={currentBeat.actionIntent}
              narrationText={currentBeat.narrationText}
              variant={currentBeat.microPoseVariant}
              headTiltDeg={evaluated.headTiltDeg}
              pupilGaze={evaluated.pupilGaze}
              sweatDrop={evaluated.sweatDrop}
              showXrayAbdomen={Boolean(
                evaluated.showXrayAbdomen ||
                  currentBeat.showXrayAbdomen ||
                  currentBeat.customData?.showXrayAbdomen
              )}
            />
          ) : (
            <StickmanRig state={stickmanState} frame={frame} renderPart="all" />
          ))
        )}

        {/* Cận cảnh bàn tay vươn vào InsertHandShot */}
        {evaluated.propsState.insertHand?.visible && (
          <InsertHandShot
            targetX={evaluated.propsState.insertHand.targetX}
            targetY={evaluated.propsState.insertHand.targetY}
            showDashedCircle={true}
          />
        )}
      </svg>

      {/* =========================================================================
          3B. THẺ INFOGRAPHIC ẨN DỤ TRỰC QUAN V9.0 & NHÃN CHÚ THÍCH ĐỘNG
         ========================================================================= */}
      {isInfographicCardBeat && currentBeat.cardType && (
        <StoryInfographicCards
          cardType={currentBeat.cardType}
          u={beatProgressU}
          localFrame={activeBeatLocalF}
          durationFrames={currentBeat.durationFrames}
          metricMode={currentBeat.metricMode}
          narrationText={currentBeat.narrationText}
          title={currentBeat.headerTitle || currentBeat.title}
          {...(currentBeat.cardProps || {})}
        />
      )}

      {!isInfographicCardBeat &&
        (evaluated.rootX > 0 || isHornetNightBeat || isKassStoryBeat) &&
        (currentBeat.calloutText ||
          currentBeat.sfxText ||
          currentBeat.thoughtText ||
          currentBeat.floatingHeader) && (() => {
          const isMantisBeat = (currentBeat.archetype || evaluated.archetype) === "mantis";
          const showXray = Boolean(
            evaluated.showXrayAbdomen ||
              currentBeat.showXrayAbdomen ||
              currentBeat.customData?.showXrayAbdomen
          );
          const vPreset = resolveVitalityPreset({
            vitalityPreset: currentBeat.vitalityPreset,
            hungerStage: currentBeat.hungerStage,
            microPoseVariant: currentBeat.microPoseVariant,
            showXrayAbdomen: showXray,
            narrationText: currentBeat.narrationText,
          });
          const aIntent = resolveActionIntent({
            actionIntent: currentBeat.actionIntent,
            vitalityPreset: vPreset,
            hungerStage: currentBeat.hungerStage,
            microPoseVariant: currentBeat.microPoseVariant,
            showXrayAbdomen: showXray,
            narrationText: currentBeat.narrationText,
          });
          const rawSockets = isHornetNightBeat
            ? computeHornetNightPrimarySockets({
                mode: activeHornetMode,
                u: beatProgressU,
                localFrame: activeBeatLocalF,
              })
            : isMantisBeat
            ? computeMantisRigSockets({
                x: evaluated.rootX,
                y: groundY,
                facing: evaluated.facing,
                u: beatProgressU,
                localFrame: activeBeatLocalF,
                durationFrames: currentBeat.durationFrames,
                vitalityPreset: vPreset,
                actionIntent: aIntent,
              })
            : computeStickmanRigSockets({
                x: evaluated.rootX,
                y: groundY,
                facing: evaluated.facing,
                customHipY: evaluated.customHipY,
                flightLift: evaluated.flightLift,
              });

          const camOriginX = stageCamOriginX;
          const camOriginY = stageCamOriginY;
          const activeSockets = projectSocketsToStageScreen(
            rawSockets,
            camOriginX,
            camOriginY,
            stageCameraScale,
            cameraPanX
          );

          const preyScreenPos =
            isMantisBeat && aIntent === "STRIKE_AND_CAPTURE"
              ? projectPointToStageScreen(
                  computeMantisPreyWorldPos({
                    x: evaluated.rootX,
                    y: groundY,
                    facing: evaluated.facing,
                    localFrame: activeBeatLocalF,
                    durationFrames: currentBeat.durationFrames,
                  }),
                  camOriginX,
                  camOriginY,
                  stageCameraScale,
                  cameraPanX
                )
              : undefined;

          const hornetSfxPos = isHornetNightBeat
            ? activeHornetMode === "SWARM_BEAM_ATTACK"
              ? { x: 985, y: 292 }
              : { x: 1090, y: 565 }
            : undefined;

          const allowMinimalistCallout = shouldRenderMinimalistCallout({
            calloutText: currentBeat.calloutText,
            calloutSub: currentBeat.calloutSub,
            sfxText: currentBeat.sfxText,
            showXrayAbdomen: showXray,
          });

          return (
            <CharacterStoryOverlays
              u={beatProgressU}
              localFrame={activeBeatLocalF}
              durationFrames={currentBeat.durationFrames}
              characterX={evaluated.rootX}
              characterHeadY={groundY - (evaluated.customHipY ? Math.abs(evaluated.customHipY) : 173) - 180}
              characterFacing={evaluated.facing}
              groundY={groundY}
              isMantis={isMantisBeat}
              isHornet={isHornetNightBeat}
              hornetSceneMode={activeHornetMode}
              hungerStage={currentBeat.hungerStage || vPreset}
              metricMode={currentBeat.metricMode}
              narrationText={currentBeat.narrationText}
              calloutTriggerPhrase={allowMinimalistCallout ? currentBeat.calloutTriggerPhrase : undefined}
              floatingHeader={currentBeat.floatingHeader}
              calloutText={allowMinimalistCallout ? currentBeat.calloutText : undefined}
              calloutSub={allowMinimalistCallout ? currentBeat.calloutSub : undefined}
              calloutTarget={currentBeat.calloutTarget}
              targetSocket={currentBeat.targetSocket}
              sockets={activeSockets}
              preyScreenPos={preyScreenPos}
              sfxPos={hornetSfxPos}
              sfxText={currentBeat.sfxText}
              thoughtText={currentBeat.thoughtText}
            />
          );
        })()}

      {/* =========================================================================
          4. BÓNG THOẠI TRÊN ĐẦU NHÂN VẬT (SPEECH BUBBLE V8.1: CLAMP & POP-IN)
         ========================================================================= */}
      {!isKassStoryBeat && evaluated.speechBubbleText && evaluated.rootX > 0 && evaluated.rootX < width && (() => {
        const effectiveAction = currentBeat.type ?? currentBeat.action;
        let bubbleStartU = 0.05;
        let bubbleEndU = 0.95;
        if (effectiveAction === "RUN_AND_KICK_BALL") {
          bubbleStartU = 0.44;
          bubbleEndU = 0.96;
        } else if (effectiveAction === "SHOCK_CELEBRATE" || effectiveAction === "SHOCKED_AND_CELEBRATE") {
          bubbleStartU = 0.12;
          bubbleEndU = 0.96;
        }

        // Ẩn bóng thoại ngoài cửa sổ hiển thị cao trào
        if (beatProgressU < bubbleStartU || beatProgressU > bubbleEndU) {
          return null;
        }

        // Hiệu ứng đàn hồi khi xuất hiện (Spring Pop-in 0.75 -> 1.04 -> 1.00 trong 8 frames đầu & Fade-out 6 frames cuối)
        const bubbleStartFrame = Math.round(bubbleStartU * currentBeat.durationFrames);
        const bubbleEndFrame = Math.round(bubbleEndU * currentBeat.durationFrames);
        const framesSinceAppear = activeBeatLocalF - bubbleStartFrame;
        const framesUntilHide = bubbleEndFrame - activeBeatLocalF;
        let popScale = 1.0;
        let popOpacity = 1.0;
        if (framesSinceAppear < 8) {
          const t = Math.max(0, Math.min(1, framesSinceAppear / 8));
          if (t < 0.65) {
            popScale = 0.75 + (1.04 - 0.75) * (t / 0.65);
          } else {
            popScale = 1.04 - (1.04 - 1.00) * ((t - 0.65) / 0.35);
          }
          popOpacity = t;
        } else if (framesUntilHide < 6) {
          popOpacity = Math.max(0, Math.min(1, framesUntilHide / 6));
        }

        // Tọa độ đầu chuẩn (không bị nhân đôi flightLift từ customHipY!)
        const isSittingBeat = effectiveAction === "SIT_AND_TYPE";
        const baseHipHeight = isSittingBeat ? 85 : 173;
        const actualHeadCenterY = groundY - baseHipHeight - 130 - evaluated.flightLift;
        // Không cộng toàn bộ flightLift vào bubbleY; giữ bóng thoại ở tầm đẹp và cách mép trên >= 85px
        const dampedHeadYForBubble = groundY - baseHipHeight - 130 - evaluated.flightLift * 0.35;
        const bubbleSafe = calculateSafeSpeechBubble(
          { x: evaluated.rootX, y: dampedHeadYForBubble },
          evaluated.speechBubbleText,
          evaluated.facing
        );

        const bubbleWidth = Math.max(220, Math.min(720, evaluated.speechBubbleText.length * 24 + 80));
        const bubbleHeight = 130;

        // Kẹp biên vùng an toàn tuyệt đối (Hard Viewport Safe-Area Clamp 1920x1080):
        // SAFE_TOP = 85px (cách mép trên màn hình tối thiểu 85px!), SAFE_MARGIN_X = 40px
        const SAFE_TOP = 85;
        const SAFE_MARGIN_X = 40;
        const rawBubbleTopY = bubbleSafe.position.y - bubbleHeight / 2;
        const clampedBubbleTopY = Math.max(SAFE_TOP, rawBubbleTopY);
        const safeCenterY = clampedBubbleTopY + bubbleHeight / 2;

        const rawBubbleLeftX = bubbleSafe.position.x - bubbleWidth / 2;
        const clampedBubbleLeftX = Math.max(
          SAFE_MARGIN_X,
          Math.min(1920 - SAFE_MARGIN_X - bubbleWidth, rawBubbleLeftX)
        );
        const safeCenterX = clampedBubbleLeftX + bubbleWidth / 2;

        // Cập nhật tailAnchor tương đối so với center bóng thoại để đuôi luôn chỉ thẳng về miệng nhân vật
        const mouthGlobalX = evaluated.rootX + (evaluated.facing === "left" ? -25 : 25);
        const mouthGlobalY = actualHeadCenterY + 35;
        const safeTailAnchor = {
          x: Math.max(-bubbleWidth / 2 + 35, Math.min(bubbleWidth / 2 - 35, mouthGlobalX - safeCenterX)),
          y: Math.max(75, Math.min(165, mouthGlobalY - safeCenterY)),
        };

        return (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <g
              transform={`translate(${safeCenterX}, ${safeCenterY}) scale(${popScale})`}
              style={{
                opacity: popOpacity,
                transformOrigin: "0 0",
              }}
            >
              <SpeechBubble
                x={0}
                y={0}
                tailAnchor={safeTailAnchor}
                text={evaluated.speechBubbleText}
              />
            </g>
          </svg>
        );
      })()}

      {/* =========================================================================
          4B. HIỆU ỨNG CHUYỂN CẢNH ĐIỆN ẢNH MƯỢT (SCENE CROSSFADE OVERLAY)
         ========================================================================= */}
      {transitionOverlayOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#090D16",
            opacity: transitionOverlayOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* =========================================================================
          5. PHỤ ĐỀ KHÔNG HỘP CHUẨN KASS BLOX V13.0 (CHỮ TRẮNG VIỀN ĐEN TRỰC TIẾP)
             - Bỏ hoàn toàn thanh hộp nền đen che mặt đất & chân nhân vật
             - bottom: 34px, maxWidth: 1420px, 37px, weight 800, stroke 7px #0F172A, paint-order: stroke fill
         ========================================================================= */}
      {evaluated.narrationText && (
        <div
          style={{
            position: "absolute",
            bottom: 34,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: 1420,
            width: "92%",
            padding: "0 20px",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 60,
          }}
        >
          <span
            style={{
              fontFamily: "'Be Vietnam Pro', 'Segoe UI', Tahoma, sans-serif",
              fontSize: 37,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.32,
              letterSpacing: "0.2px",
              WebkitTextStroke: "7px #0F172A",
              paintOrder: "stroke fill",
              textShadow: "0 3px 6px rgba(0, 0, 0, 0.65)",
            }}
          >
            {evaluated.narrationText}
          </span>
        </div>
      )}

      {/* =========================================================================
          6. DEBUG HUD CHẨN ĐOÁN (CHỈ HIỂN THỊ KHI BẬT showDebugHud)
         ========================================================================= */}
      {shouldShowHud && (
        <>
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 50,
              background: "rgba(255, 255, 255, 0.96)",
              padding: "18px 28px",
              borderRadius: 18,
              border: "4px solid #141414",
              boxShadow: "0 8px 0 #141414",
              maxWidth: 920,
              fontFamily: "'Be Vietnam Pro', sans-serif",
              zIndex: 70,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: "#141414" }}>
              {evaluated.hudTitle}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#475569", marginTop: 4 }}>
              {evaluated.hudSub}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 50,
              background: "rgba(15, 23, 42, 0.94)",
              color: "#FFFFFF",
              padding: "8px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Courier New', monospace",
              display: "flex",
              gap: 16,
              border: "2px solid #38BDF8",
              zIndex: 70,
            }}
          >
            <span>FRAME: {frame} / {beats.reduce((acc, b) => Math.max(acc, b.startFrame + b.durationFrames), 1080)}</span>
            <span>THEME: {evaluated.theme}</span>
            <span>ROOT_X: {Math.round(evaluated.rootX)}px</span>
            <span>LIFT: {Math.round(evaluated.flightLift)}px</span>
            <span>TILT: {Math.round(evaluated.torsoTiltDeg)}°</span>
            <span>POSE: {evaluated.rigPose}</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
