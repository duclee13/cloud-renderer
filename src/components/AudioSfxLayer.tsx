import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
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
  /** Skip mounting <Audio> decoders when rendering silent video chunks on Cloud 20-VM workers */
  muted?: boolean;
  /** Optional volume multiplier clamped strictly inside safe range (default 1.0 -> 0.18..0.22) */
  volumeScale?: number;
  /** Optional allowlist of verified files inside public/sfx/ */
  availableFiles?: ReadonlySet<string>;
}

const DEFAULT_AVAILABLE_SFX_FILES: ReadonlySet<string> = new Set<AutoSfxFileName>(VALID_AUTO_SFX_FILES);

/**
 * AudioSfxLayer (Engine V23.0 — Cloud 20-VM Optimized):
 * - Automatically attaches subtle, royalty-free local WAV cues (< 40 KB each in `public/sfx/`)
 *   to beat transitions in V7MovieComposition without overpowering VieNeu-TTS narration.
 * - Strictly mounts ONLY the `<Sequence premountFor={0}>` active at the current `frame`
 *   (and mounts 0 `<Audio>` tags when `muted={true}` on Cloud video workers), preventing
 *   Chromium/FFmpeg from opening dozens of concurrent audio decoders per worker.
 */
export const AudioSfxLayer: React.FC<AudioSfxLayerProps> = ({
  beats,
  sfxEnabled = true,
  muted = false,
  volumeScale = 1,
  availableFiles = DEFAULT_AVAILABLE_SFX_FILES,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const events = React.useMemo(
    () => (sfxEnabled && !muted ? resolveAutoSfxPlan(beats, fps, sfxEnabled) : []),
    [beats, fps, sfxEnabled, muted]
  );

  if (!sfxEnabled || muted || events.length === 0) return null;

  return (
    <>
      {events.map((ev) => {
        if (frame < ev.startFrame || frame >= ev.startFrame + ev.durationFrames) {
          return null;
        }
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
