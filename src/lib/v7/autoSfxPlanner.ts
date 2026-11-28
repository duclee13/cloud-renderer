/**
 * AUTO-SFX & V24 BGM PLANNER (V23.0 + V24.0 Story-First Kinetic Engine)
 * - Shared Pure-TS Cue Resolver for Remotion <AudioSfxLayer /> & Cloud Master Audio Mixer
 * - Zero Node.js or Remotion runtime dependencies -> runs cleanly in browser/Remotion AND Node.js 24 CLI
 * - Locks SFX volumes strictly in 0.16–0.26 and V24 BGM volume at 0.065 so nothing drowns out VieNeu-TTS ("Hải Đăng")
 * - Supports V23 + V24 per-beat `sfxCue` override and episode-wide `sfxEnabled` / `bgmEnabled`
 * - 100% zero regression on Episodes 1–10 (V24 rules trigger ONLY when V24 fields are present)
 */

import type { AutoEpisodeBeat, AutoSfxCueId, StoryMode, V24BgmMood } from "./episodeJsonSchema.ts";

export type AutoSfxFileName =
  | "pop_soft.wav"
  | "whoosh_in.wav"
  | "whoosh_out.wav"
  | "ding_warm.wav"
  | "alert_soft.wav"
  | "headline_pop.wav"
  | "tick_clock.wav"
  | "heartbeat_soft.wav"
  | "sparkle_warm.wav";

export const VALID_AUTO_SFX_FILES: readonly AutoSfxFileName[] = [
  "pop_soft.wav",
  "whoosh_in.wav",
  "whoosh_out.wav",
  "ding_warm.wav",
  "alert_soft.wav",
  "headline_pop.wav",
  "tick_clock.wav",
  "heartbeat_soft.wav",
  "sparkle_warm.wav",
];

export type V24BgmFileName = "bgm_curious.wav" | "bgm_tense.wav" | "bgm_emotional.wav";

export const VALID_V24_BGM_FILES: readonly V24BgmFileName[] = [
  "bgm_curious.wav",
  "bgm_tense.wav",
  "bgm_emotional.wav",
];

export const V24_BGM_DEFAULT_VOLUME = 0.065;
export const V24_BGM_FADE_FRAMES = 15;

export interface AutoSfxBeatLike {
  id?: string;
  startFrame: number;
  durationFrames: number;
  stageType?: string;
  autoStageSpec?: AutoEpisodeBeat;
  sfxCue?: AutoSfxCueId;
  bgmMood?: string;
}

export interface ResolvedAutoSfxEvent {
  beatIndex: number;
  beatId: string;
  cueId: Exclude<AutoSfxCueId, "none">;
  fileName: AutoSfxFileName;
  startFrame: number;
  durationFrames: number;
  volume: number;
  reason: string;
}

export interface ResolvedV24BgmSegment {
  mood: Exclude<V24BgmMood, "SILENT">;
  fileName: V24BgmFileName;
  startFrame: number;
  durationFrames: number;
  volume: number;
  fadeFrames: number;
}

const SFX_SPEC_MAP: Record<
  Exclude<AutoSfxCueId, "none">,
  { fileName: AutoSfxFileName; durationSec: number; defaultVolume: number; defaultDelayFrames: number }
> = {
  pop: { fileName: "pop_soft.wav", durationSec: 0.14, defaultVolume: 0.18, defaultDelayFrames: 2 },
  whoosh_in: { fileName: "whoosh_in.wav", durationSec: 0.30, defaultVolume: 0.22, defaultDelayFrames: 0 },
  whoosh_out: { fileName: "whoosh_out.wav", durationSec: 0.26, defaultVolume: 0.20, defaultDelayFrames: 0 },
  ding: { fileName: "ding_warm.wav", durationSec: 0.46, defaultVolume: 0.20, defaultDelayFrames: 0 },
  alert: { fileName: "alert_soft.wav", durationSec: 0.28, defaultVolume: 0.18, defaultDelayFrames: 2 },
  headline_pop: { fileName: "headline_pop.wav", durationSec: 0.14, defaultVolume: 0.18, defaultDelayFrames: 2 },
  tick: { fileName: "tick_clock.wav", durationSec: 0.10, defaultVolume: 0.20, defaultDelayFrames: 0 },
  heartbeat: { fileName: "heartbeat_soft.wav", durationSec: 0.48, defaultVolume: 0.22, defaultDelayFrames: 0 },
  sparkle: { fileName: "sparkle_warm.wav", durationSec: 0.54, defaultVolume: 0.20, defaultDelayFrames: 2 },
};

const V24_BGM_FILE_MAP: Record<Exclude<V24BgmMood, "SILENT">, V24BgmFileName> = {
  CURIOUS: "bgm_curious.wav",
  TENSE: "bgm_tense.wav",
  EMOTIONAL: "bgm_emotional.wav",
};

function isHostOverlayBeat(beat?: AutoSfxBeatLike): boolean {
  if (!beat) return false;
  const spec = beat.autoStageSpec;
  if (spec) {
    return spec.stageType === "HOST_EXPLAIN_OVERLAY" || spec.overlayMode === "HOST_EXPLAIN";
  }
  return beat.stageType === "HOST_EXPLAIN_OVERLAY";
}

function isFullScreenSvgBeat(beat?: AutoSfxBeatLike): boolean {
  const spec = beat?.autoStageSpec;
  return Boolean(spec && spec.fullScreenVisual === true && typeof spec.customVisual === "string" && spec.customVisual.trim());
}

function isSummaryOrTipsVisual(customVisual?: string, visualStep = 0): boolean {
  if (!customVisual) return false;
  const upper = customVisual.toUpperCase();
  return (
    upper.includes("SUMMARY") ||
    upper.includes("TIPS") ||
    upper.includes("TRICKS") ||
    upper.includes("TONG_KET") ||
    upper.includes("MEO") ||
    (upper === "CAT_QUICK_QUIZ" && visualStep === 2) ||
    (upper === "CAT_OTHER_ANIMALS_NASA" && visualStep === 2) ||
    (upper === "OCTO_QUICK_QUIZ" && visualStep === 2) ||
    (upper === "OCTO_HUMAN_TECH" && visualStep === 2)
  );
}

function isSoftAlertBeat(beat: AutoSfxBeatLike): boolean {
  const spec = beat.autoStageSpec;
  if (!spec) return false;
  if (spec.classroomDetail === "CHALK_SCRATCH_WAVE" || spec.kitchenDetail === "FORK_SCRAPE_WAVE") {
    return true;
  }
  const vis = (spec.customVisual || "").toUpperCase();
  const step = spec.visualStep ?? 0;
  if (
    (vis.includes("FREQ_BAND") && step === 1) ||
    (vis.includes("AMYGDALA_LOOP") && step === 1) ||
    (vis === "CAT_MAREY_1894" && step === 1) ||
    (vis === "CAT_HIGH_RISE_TRUTH" && step === 0) ||
    (vis === "OCTO_COMMUNICATION_MOOD" && step === 1) ||
    vis.includes("ALARM")
  ) {
    return true;
  }
  return false;
}

function beatHasSpeechBubble(beat: AutoSfxBeatLike): boolean {
  if (typeof beat.autoStageSpec?.oceanBubble === "string" && beat.autoStageSpec.oceanBubble.trim().length > 0) {
    return true;
  }
  const actors = beat.autoStageSpec?.actors;
  if (!Array.isArray(actors)) return false;
  return actors.some((a) => typeof a?.bubble === "string" && a.bubble.trim().length > 0);
}

function normalizeTimeBadge(beat?: AutoSfxBeatLike): string {
  const raw = beat?.autoStageSpec?.timeBadge;
  return typeof raw === "string" ? raw.trim() : "";
}

function beatHasKineticHeadline(beat?: AutoSfxBeatLike): boolean {
  const txt = beat?.autoStageSpec?.kineticHeadline?.text;
  return typeof txt === "string" && txt.trim().length > 0;
}

/**
 * Resolves the full timeline of V23.0 + V24.0 Auto-SFX cues for a list of beats.
 * Only activates automatically on modern AutoStage beats (V17–V24) or beats with an explicit `sfxCue`,
 * ensuring 100% zero regression on legacy non-AutoStage compositions and Episodes 1–10.
 */
export function resolveAutoSfxPlan(
  beats: readonly AutoSfxBeatLike[],
  fps = 45,
  sfxEnabled = true,
  episodeStoryMode?: StoryMode
): ResolvedAutoSfxEvent[] {
  if (!sfxEnabled || !Array.isArray(beats) || beats.length === 0) return [];

  const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 45;
  const events: ResolvedAutoSfxEvent[] = [];
  let lastEventEndFrame = -1;

  for (let i = 0; i < beats.length; i++) {
    const curr = beats[i];
    const prev = i > 0 ? beats[i - 1] : undefined;
    const spec = curr.autoStageSpec;
    const explicitCue: AutoSfxCueId | undefined = curr.sfxCue ?? spec?.sfxCue;

    // Preserve legacy non-autoStage beats untouched unless they explicitly opt in via sfxCue
    if (!spec && !explicitCue) continue;
    if (explicitCue === "none") continue;

    let chosenCue: Exclude<AutoSfxCueId, "none"> | null = null;
    let reason = "";
    let extraDelayFrames = 0;

    if (explicitCue) {
      chosenCue = explicitCue;
      reason = `Explicit sfxCue="${explicitCue}"`;
    } else {
      const currHost = isHostOverlayBeat(curr);
      const prevHost = isHostOverlayBeat(prev);
      const currSvg = isFullScreenSvgBeat(curr);
      const currBadge = normalizeTimeBadge(curr);
      const prevBadge = normalizeTimeBadge(prev);
      const hasNewTimeBadge = Boolean(currBadge && currBadge !== prevBadge);
      const hasKineticHeadline = beatHasKineticHeadline(curr);
      const effectiveStoryMode = spec?.storyMode ?? episodeStoryMode;
      const isV24StoryMode =
        effectiveStoryMode === "ANIMAL_POV" || effectiveStoryMode === "HUMAN_ANIMAL_POV";
      const currBgmMood = normalizeV24BgmMood(spec?.bgmMood ?? curr.bgmMood);
      const muteAutoPopInEmotional =
        isV24StoryMode && (currBgmMood === "EMOTIONAL" || currBgmMood === "SILENT");

      if (currHost && !prevHost && i > 0) {
        chosenCue = "whoosh_in";
        reason = "Enter HOST_EXPLAIN_OVERLAY";
      } else if (!currHost && prevHost && !currSvg) {
        chosenCue = "whoosh_out";
        reason = "Exit HOST_EXPLAIN_OVERLAY (unfreeze)";
      } else if (currSvg && isSummaryOrTipsVisual(spec?.customVisual, spec?.visualStep ?? 0)) {
        chosenCue = "ding";
        reason = `Summary/Tips SVG (${spec?.customVisual})`;
      } else if (isSoftAlertBeat(curr)) {
        chosenCue = "alert";
        reason = `Alert beat (${spec?.customVisual || spec?.classroomDetail || spec?.kitchenDetail})`;
      } else if (hasNewTimeBadge) {
        chosenCue = "tick";
        reason = `V24 timeBadge changed ("${currBadge}")`;
      } else if (hasKineticHeadline && !muteAutoPopInEmotional) {
        chosenCue = "headline_pop";
        extraDelayFrames = Math.max(0, Math.round(spec?.kineticHeadline?.delayFrames ?? 0));
        reason = `V24 kineticHeadline ("${spec?.kineticHeadline?.text?.trim()}")`;
      } else if (!muteAutoPopInEmotional && (currSvg || (!currHost && beatHasSpeechBubble(curr) && i > 0))) {
        chosenCue = "pop";
        reason = currSvg
          ? `Full-Screen SVG step (${spec?.customVisual}#${spec?.visualStep ?? 0})`
          : "New story beat speech bubble";
      }
    }

    if (!chosenCue) continue;

    const meta = SFX_SPEC_MAP[chosenCue];
    const totalDelay = meta.defaultDelayFrames + extraDelayFrames;
    const startFrame = Math.max(0, Math.round(curr.startFrame + totalDelay));
    const desiredDur = Math.max(6, Math.ceil(meta.durationSec * safeFps));
    const maxAllowedDur = Math.max(6, Math.round(curr.durationFrames) - totalDelay);
    const durationFrames = Math.min(desiredDur, maxAllowedDur);

    // Avoid overlapping audio sequences back-to-back
    if (startFrame < lastEventEndFrame) continue;

    events.push({
      beatIndex: i,
      beatId: curr.id || spec?.id || `beat_${i + 1}`,
      cueId: chosenCue,
      fileName: meta.fileName,
      startFrame,
      durationFrames,
      volume: meta.defaultVolume,
      reason,
    });
    lastEventEndFrame = startFrame + durationFrames;
  }

  return events;
}

function normalizeV24BgmMood(raw?: string): V24BgmMood | null {
  if (typeof raw !== "string") return null;
  const norm = raw.trim().toUpperCase();
  if (norm === "CURIOUS" || norm === "TENSE" || norm === "EMOTIONAL" || norm === "SILENT") {
    return norm;
  }
  if (norm === "BGM_STORY_CALM") return "CURIOUS";
  if (norm === "BGM_TENSE_PULSE") return "TENSE";
  if (norm === "BGM_WARM_OUTRO") return "EMOTIONAL";
  return null;
}

/**
 * V24.0 Multi-Mood BGM Segment Resolver:
 * - Only activates when `bgmEnabled === true` (defaults to `false` so Episodes 1–10 never change audio!)
 * - Groups contiguous beats sharing the same V24 `bgmMood` into seamless looped segments
 * - Volume locked at ultra-gentle 0.065 with 15-frame fade-in / fade-out
 * - `bgmMood === "SILENT"` cuts music cleanly to create dramatic silence
 */
export function resolveV24BgmSegments(
  beats: readonly AutoSfxBeatLike[],
  _fps = 45,
  bgmEnabled = false
): ResolvedV24BgmSegment[] {
  if (!bgmEnabled || !Array.isArray(beats) || beats.length === 0) return [];

  const segments: ResolvedV24BgmSegment[] = [];
  let active: ResolvedV24BgmSegment | null = null;

  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const startFrame = Math.max(0, Math.round(b.startFrame));
    const dur = Math.max(1, Math.round(b.durationFrames));
    const mood = normalizeV24BgmMood(b.autoStageSpec?.bgmMood ?? b.bgmMood) ?? "CURIOUS";

    if (mood === "SILENT") {
      if (active) {
        segments.push(active);
        active = null;
      }
      continue;
    }

    if (active && active.mood === mood && startFrame <= active.startFrame + active.durationFrames + 2) {
      active.durationFrames = Math.max(active.durationFrames, startFrame + dur - active.startFrame);
    } else {
      if (active) segments.push(active);
      active = {
        mood,
        fileName: V24_BGM_FILE_MAP[mood],
        startFrame,
        durationFrames: dur,
        volume: V24_BGM_DEFAULT_VOLUME,
        fadeFrames: V24_BGM_FADE_FRAMES,
      };
    }
  }
  if (active) segments.push(active);

  return segments;
}
