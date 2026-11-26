/**
 * AUTO-SFX PLANNER V23.0 — Shared Pure-TS Cue Resolver for Remotion <AudioSfxLayer /> & Cloud Master Audio Mixer
 * - Zero Node.js or Remotion runtime dependencies -> runs cleanly in browser/Remotion AND Node.js 24 CLI
 * - Locks volumes strictly in 0.16–0.26 safe range so SFX never drowns out VieNeu-TTS narration ("Hải Đăng")
 * - Supports explicit per-beat `sfxCue` override ("pop" | "whoosh_in" | "whoosh_out" | "ding" | "alert" | "none")
 *   and episode-wide `sfxEnabled?: boolean` (defaults to `true`).
 */

import type { AutoEpisodeBeat, AutoSfxCueId } from "./episodeJsonSchema";

export type AutoSfxFileName =
  | "pop_soft.wav"
  | "whoosh_in.wav"
  | "whoosh_out.wav"
  | "ding_warm.wav"
  | "alert_soft.wav";

export const VALID_AUTO_SFX_FILES: readonly AutoSfxFileName[] = [
  "pop_soft.wav",
  "whoosh_in.wav",
  "whoosh_out.wav",
  "ding_warm.wav",
  "alert_soft.wav",
];

export interface AutoSfxBeatLike {
  id?: string;
  startFrame: number;
  durationFrames: number;
  stageType?: string;
  autoStageSpec?: AutoEpisodeBeat;
  sfxCue?: AutoSfxCueId;
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

const SFX_SPEC_MAP: Record<
  Exclude<AutoSfxCueId, "none">,
  { fileName: AutoSfxFileName; durationSec: number; defaultVolume: number; defaultDelayFrames: number }
> = {
  pop: { fileName: "pop_soft.wav", durationSec: 0.14, defaultVolume: 0.18, defaultDelayFrames: 2 },
  whoosh_in: { fileName: "whoosh_in.wav", durationSec: 0.30, defaultVolume: 0.22, defaultDelayFrames: 0 },
  whoosh_out: { fileName: "whoosh_out.wav", durationSec: 0.26, defaultVolume: 0.20, defaultDelayFrames: 0 },
  ding: { fileName: "ding_warm.wav", durationSec: 0.46, defaultVolume: 0.20, defaultDelayFrames: 0 },
  alert: { fileName: "alert_soft.wav", durationSec: 0.28, defaultVolume: 0.18, defaultDelayFrames: 2 },
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

function isSummaryOrTipsVisual(customVisual?: string): boolean {
  if (!customVisual) return false;
  const upper = customVisual.toUpperCase();
  return (
    upper.includes("SUMMARY") ||
    upper.includes("TIPS") ||
    upper.includes("TRICKS") ||
    upper.includes("TONG_KET") ||
    upper.includes("MEO")
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
    vis.includes("ALARM")
  ) {
    return true;
  }
  return false;
}

function beatHasSpeechBubble(beat: AutoSfxBeatLike): boolean {
  const actors = beat.autoStageSpec?.actors;
  if (!Array.isArray(actors)) return false;
  return actors.some((a) => typeof a?.bubble === "string" && a.bubble.trim().length > 0);
}

/**
 * Resolves the full timeline of V23.0 Auto-SFX cues for a list of beats.
 * Only activates automatically on modern AutoStage beats (V17–V23) or beats with an explicit `sfxCue`,
 * ensuring 100% zero regression on legacy non-AutoStage compositions.
 */
export function resolveAutoSfxPlan(
  beats: readonly AutoSfxBeatLike[],
  fps = 45,
  sfxEnabled = true
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

    if (explicitCue) {
      chosenCue = explicitCue;
      reason = `Explicit sfxCue="${explicitCue}"`;
    } else {
      const currHost = isHostOverlayBeat(curr);
      const prevHost = isHostOverlayBeat(prev);
      const currSvg = isFullScreenSvgBeat(curr);

      if (currHost && !prevHost && i > 0) {
        chosenCue = "whoosh_in";
        reason = "Enter HOST_EXPLAIN_OVERLAY";
      } else if (!currHost && prevHost && !currSvg) {
        chosenCue = "whoosh_out";
        reason = "Exit HOST_EXPLAIN_OVERLAY (unfreeze)";
      } else if (currSvg && isSummaryOrTipsVisual(spec?.customVisual)) {
        chosenCue = "ding";
        reason = `Summary/Tips SVG (${spec?.customVisual})`;
      } else if (isSoftAlertBeat(curr)) {
        chosenCue = "alert";
        reason = `Alert beat (${spec?.customVisual || spec?.classroomDetail || spec?.kitchenDetail})`;
      } else if (currSvg || (!currHost && beatHasSpeechBubble(curr) && i > 0)) {
        chosenCue = "pop";
        reason = currSvg
          ? `Full-Screen SVG step (${spec?.customVisual}#${spec?.visualStep ?? 0})`
          : "New story beat speech bubble";
      }
    }

    if (!chosenCue) continue;

    const meta = SFX_SPEC_MAP[chosenCue];
    const startFrame = Math.max(0, Math.round(curr.startFrame + meta.defaultDelayFrames));
    const desiredDur = Math.max(6, Math.ceil(meta.durationSec * safeFps));
    const maxAllowedDur = Math.max(6, Math.round(curr.durationFrames) - meta.defaultDelayFrames);
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
