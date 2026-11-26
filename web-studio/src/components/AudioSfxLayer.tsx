import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import {
  resolveAutoSfxPlan,
  VALID_AUTO_SFX_FILES,
  type AutoSfxBeatLike,
  type AutoSfxFileName,
} from "../lib/v7/autoSfxPlanner";

export interface AudioSfxLayerProps {
  beats: readonly AutoSfxBeatLike[];
  /** Master toggle for V23.0 Auto-SFX layer (defaults to true) */
  sfxEnabled?: boolean;
  /** Optional volume multiplier clamped strictly inside safe range (default 1.0 -> 0.18..0.22) */
  volumeScale?: number;
  /** Optional allowlist of verified files inside public/sfx/ */
  availableFiles?: ReadonlySet<string>;
}

const DEFAULT_AVAILABLE_SFX_FILES: ReadonlySet<string> = new Set<AutoSfxFileName>(VALID_AUTO_SFX_FILES);

/**
 * AudioSfxLayer (Engine V23.0):
 * - Automatically attaches subtle, royalty-free WAV cues (pop_soft, whoosh_in, whoosh_out, ding_warm, alert_soft)
 *   to beat transitions in V7MovieComposition without ever overpowering VieNeu-TTS narration.
 * - Safe volume range: 0.16–0.26.
 * - Supports per-beat `sfxCue` overrides ("pop" | "whoosh_in" | "whoosh_out" | "ding" | "alert" | "none")
 *   and episode-wide `sfxEnabled?: boolean`.
 */
export const AudioSfxLayer: React.FC<AudioSfxLayerProps> = ({
  beats,
  sfxEnabled = true,
  volumeScale = 1,
  availableFiles = DEFAULT_AVAILABLE_SFX_FILES,
}) => {
  const { fps } = useVideoConfig();

  const events = React.useMemo(
    () => resolveAutoSfxPlan(beats, fps, sfxEnabled),
    [beats, fps, sfxEnabled]
  );

  if (!sfxEnabled || events.length === 0) return null;

  return (
    <>
      {events.map((ev) => {
        if (!availableFiles.has(ev.fileName)) return null;
        const safeVol = Math.max(0.16, Math.min(0.26, Number((ev.volume * volumeScale).toFixed(3))));
        return (
          <Sequence
            key={`v23_autosfx_${ev.beatIndex}_${ev.cueId}_${ev.startFrame}`}
            from={ev.startFrame}
            durationInFrames={ev.durationFrames}
            layout="none"
          >
            <Audio src={staticFile(`sfx/${ev.fileName}`)} volume={safeVol} />
          </Sequence>
        );
      })}
    </>
  );
};
