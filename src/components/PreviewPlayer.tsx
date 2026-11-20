"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { MasterSceneGraph } from "../remotion/types/sceneGraph";
import { MainScene } from "../remotion/Composition";
import { AnimScriptScene } from "../remotion/compositions/AnimScriptScene";
import { V7MovieComposition, V7MoviePayload } from "../remotion/compositions/V7MovieComposition";
import { AnimScriptIR } from "../animscript";
import { RotateCcw, RefreshCw, Sparkles, Film, Eye, EyeOff } from "lucide-react";

// Dynamic import with SSR disabled for client-only Remotion player
const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

interface PreviewPlayerProps {
  sceneGraph?: MasterSceneGraph;
  animScriptIR?: AnimScriptIR;
  v7MoviePayload?: V7MoviePayload;
  showDebugHud?: boolean;
  onToggleDebugHud?: (show: boolean) => void;
  playerRefProp?: React.RefObject<any>;
  version?: number;
  onRefresh?: () => void;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  sceneGraph,
  animScriptIR,
  v7MoviePayload,
  showDebugHud = false,
  onToggleDebugHud,
  playerRefProp,
  version = 0,
  onRefresh,
}) => {
  const localRef = useRef<any>(null);
  const activeRef = playerRefProp || localRef;

  // Kiểm tra chế độ hiển thị
  const isV7Movie = Boolean(v7MoviePayload && Array.isArray(v7MoviePayload.beats) && v7MoviePayload.beats.length > 0);
  const isAnimScript = !isV7Movie && Boolean(animScriptIR && animScriptIR.scenes?.length > 0);

  // Tính toán an toàn tuyệt đối tổng số frame, không bao giờ để bị NaN
  const safeScenes = Array.isArray(sceneGraph?.scenes) ? sceneGraph.scenes : [];
  const calculatedTotal = safeScenes.reduce((acc, s) => {
    const start = Number(s?.startFrame) || 0;
    const dur = Number(s?.durationInFrames) || 120;
    return Math.max(acc, start + dur);
  }, 480);

  const rawTotal = isV7Movie
    ? v7MoviePayload?.totalDurationFrames || 1080
    : isAnimScript
    ? animScriptIR?.totalDurationFrames || 360
    : Number(sceneGraph?.totalDurationInFrames) || calculatedTotal;
  const totalFrames = Math.max(60, isNaN(rawTotal) ? 480 : Math.round(rawTotal));

  const handleRewind = () => {
    if (activeRef.current) {
      activeRef.current.seekTo(0);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-[#232326] bg-[#121215] p-3 shadow-2xl">
      {/* 1080p Preview Monitor Frame */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#09090B] border border-[#1E1E22] shadow-inner">
        {isV7Movie ? (
          <Player
            key={`v7movie-player-${totalFrames}-${version}-${showDebugHud}`}
            ref={activeRef}
            component={V7MovieComposition as any}
            inputProps={{ payload: v7MoviePayload, showDebugHud }}
            durationInFrames={totalFrames}
            fps={60}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: "100%", height: "100%" }}
            controls
            loop
            autoPlay={false}
          />
        ) : isAnimScript ? (
          <Player
            key={`animscript-player-${totalFrames}-${version}`}
            ref={activeRef}
            component={AnimScriptScene as any}
            inputProps={{ ir: animScriptIR! }}
            durationInFrames={totalFrames}
            fps={60}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: "100%", height: "100%" }}
            controls
            loop
            autoPlay={false}
          />
        ) : (
          <Player
            key={`remotion-player-${sceneGraph?.title || "preview"}-${totalFrames}-${version}`}
            ref={activeRef}
            component={MainScene}
            inputProps={{ sceneGraph }}
            durationInFrames={totalFrames}
            fps={60}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{
              width: "100%",
              height: "100%",
            }}
            controls
            loop
            autoPlay={false}
          />
        )}
      </div>

      {/* Control Bar & Resolution Info */}
      <div className="mt-3 flex w-full items-center justify-between px-2 text-xs text-[#8E8E93]">
        <div className="flex items-center space-x-2">
          <span className={`inline-block h-2 w-2 rounded-full ${isV7Movie ? "bg-emerald-400" : "bg-blue-500"} animate-pulse`} />
          <span className="font-mono text-zinc-300">1920 x 1080 (Full HD)</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-zinc-300">60.0 FPS</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-zinc-400">
            {totalFrames} frames ({(totalFrames / 60).toFixed(1)}s)
          </span>
          {isV7Movie && (
            <>
              <span className="text-zinc-600">|</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                V8 AUTO-MOVIE
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onToggleDebugHud && (
            <button
              onClick={() => onToggleDebugHud(!showDebugHud)}
              title={showDebugHud ? "Click để ẩn thanh HUD kỹ thuật" : "Click để hiện thanh HUD kỹ thuật"}
              className={`flex items-center space-x-1 rounded-lg border px-2 py-1 text-[11px] transition-colors ${
                showDebugHud
                  ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                  : "border-[#27272A] bg-[#18181B] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {showDebugHud ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              <span>{showDebugHud ? "HUD: Bật" : "HUD: Tắt"}</span>
            </button>
          )}

          <button
            onClick={handleRewind}
            title="Quay về khung hình đầu tiên (Frame 0)"
            className="flex items-center space-x-1 rounded-lg border border-[#27272A] bg-[#18181B] px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
            <span>Frame 0</span>
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Làm mới lại toàn bộ tài nguyên đồ họa (Hot Reload Preview)"
              className="flex items-center space-x-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-300 hover:text-white hover:bg-blue-600/30 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
              <span>Làm mới Preview</span>
            </button>
          )}

          <span className="text-[11px] text-zinc-500 hidden sm:inline">GPU Vector 1080p</span>
        </div>
      </div>
    </div>
  );
};
