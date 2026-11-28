import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  resolveAutoSfxPlan,
  resolveV24BgmSegments,
  VALID_AUTO_SFX_FILES,
  VALID_V24_BGM_FILES,
  type AutoSfxBeatLike,
  type AutoSfxFileName,
  type V24BgmFileName,
} from "../lib/v7/autoSfxPlanner";

import type { StoryMode } from "../lib/v7/episodeJsonSchema";

export interface AudioSfxLayerProps {
  beats: readonly AutoSfxBeatLike[];
  /** Master toggle for V23.0–V24.0 Auto-SFX layer (defaults to true) */
  sfxEnabled?: boolean;
  /** Master toggle for V24.0 Multi-Mood BGM loops (defaults to false for 100% Ep 1–10 backward compatibility) */
  bgmEnabled?: boolean;
  /** Optional V24.0 StoryMode forwarded to autoSfxPlanner for emotional/silent pop suppression */
  storyMode?: StoryMode;
  /** Skip mounting <Audio> decoders when rendering silent video chunks on Cloud 20-VM workers */
  muted?: boolean;
  /** Optional volume multiplier clamped strictly inside safe range (default 1.0 -> 0.18..0.22) */
  volumeScale?: number;
  /** Optional allowlist of verified files inside public/sfx/ */
  availableFiles?: ReadonlySet<string>;
  /** Optional allowlist of verified files inside public/bgm/ */
  availableBgmFiles?: ReadonlySet<string>;
}

const DEFAULT_AVAILABLE_SFX_FILES: ReadonlySet<string> = new Set<AutoSfxFileName>(VALID_AUTO_SFX_FILES);
const DEFAULT_AVAILABLE_BGM_FILES: ReadonlySet<string> = new Set<V24BgmFileName>(VALID_V24_BGM_FILES);

/**
 * AudioSfxLayer (Engine V23.0–V24.0 — Cloud 20-VM Optimized):
 * - Automatically attaches subtle, royalty-free local WAV SFX cues (9 files in `public/sfx/`)
 *   and optional V24 Multi-Mood BGM loops (3 files in `public/bgm/` when `bgmEnabled === true`,
 *   gentle volume 0.065 with 15-frame fade in/out, `SILENT` gaps supported).
 * - Strictly mounts ONLY `<Sequence>` active at the current `frame` (and mounts 0 `<Audio>` tags
 *   when `muted={true}` on Cloud video workers).
 */
export const AudioSfxLayer: React.FC<AudioSfxLayerProps> = ({
  beats,
  sfxEnabled = true,
  bgmEnabled = false,
  storyMode,
  muted = false,
  volumeScale = 1,
  availableFiles = DEFAULT_AVAILABLE_SFX_FILES,
  availableBgmFiles = DEFAULT_AVAILABLE_BGM_FILES,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const events = React.useMemo(
    () => (sfxEnabled && !muted ? resolveAutoSfxPlan(beats, fps, sfxEnabled, storyMode) : []),
    [beats, fps, sfxEnabled, storyMode, muted]
  );

  const bgmSegments = React.useMemo(
    () => (bgmEnabled && !muted ? resolveV24BgmSegments(beats, fps, bgmEnabled) : []),
    [beats, fps, bgmEnabled, muted]
  );

  if (muted || (events.length === 0 && bgmSegments.length === 0)) return null;

  return (
    <>
      {bgmSegments.map((seg, idx) => {
        if (frame < seg.startFrame || frame >= seg.startFrame + seg.durationFrames) {
          return null;
        }
        if (!availableBgmFiles.has(seg.fileName)) return null;
        const fadeF = Math.max(1, Math.min(seg.fadeFrames, Math.floor(seg.durationFrames / 2)));
        return (
          <Sequence
            key={`v24_bgm_${idx}_${seg.mood}_${seg.startFrame}`}
            from={seg.startFrame}
            durationInFrames={seg.durationFrames}
            layout="none"
          >
            <Audio
              src={staticFile(`bgm/${seg.fileName}`)}
              loop
              volume={(localF) => {
                const inGain = localF < fadeF ? localF / fadeF : 1;
                const remain = seg.durationFrames - 1 - localF;
                const outGain = remain < fadeF ? Math.max(0, remain / fadeF) : 1;
                return Number((seg.volume * Math.min(inGain, outGain)).toFixed(4));
              }}
            />
          </Sequence>
        );
      })}
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
