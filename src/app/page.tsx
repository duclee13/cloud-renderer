"use client";

import React, { useState, useEffect } from "react";
import { StudioHeader } from "../components/StudioHeader";
import { PreviewPlayer } from "../components/PreviewPlayer";
import { ScriptEditor } from "../components/ScriptEditor";
import { AnimScriptEditor } from "../components/AnimScriptEditor";
import { V7MovieEditor } from "../components/V7MovieEditor";
import { TimelineViewer } from "../components/TimelineViewer";
import { SettingsModal } from "../components/SettingsModal";
import { RenderModal } from "../components/RenderModal";
import { defaultMockSceneGraph } from "../remotion/Composition";
import { MasterSceneGraph, SceneGraphScene } from "../remotion/types/sceneGraph";
import { AnimScriptIR, CompilerDiagnostic, compileAnimScript } from "../animscript";
import { DEMO_4_SPIDER_SCRIPT, DEMO_4_SPIDER_IR } from "../remotion/compositions/demoPresets";
import { V7MoviePayload } from "../remotion/compositions/V7MovieComposition";
import { SCRIPT_BEATS as DEFAULT_V7_BEATS } from "../remotion/compositions/TestV7AutoScriptShowcase";
import { Code2, Film, Sparkles } from "lucide-react";

export default function StudioPage() {
  const [engineMode, setEngineMode] = useState<"v8" | "animscript" | "legacy">("v8");
  const [v7MoviePayload, setV7MoviePayload] = useState<V7MoviePayload>({
    title: "Bộ Phim Hoạt Hình 2D Tự Động V8",
    totalDurationFrames: 1080,
    fps: 60,
    beats: DEFAULT_V7_BEATS,
    showDebugHud: false,
  });
  const [showDebugHud, setShowDebugHud] = useState<boolean>(false);

  const [animScriptCode, setAnimScriptCode] = useState<string>(DEMO_4_SPIDER_SCRIPT);
  const [animScriptIR, setAnimScriptIR] = useState<AnimScriptIR>(DEMO_4_SPIDER_IR);
  const [compilerDiagnostics, setCompilerDiagnostics] = useState<CompilerDiagnostic[]>([]);

  const [sceneGraph, setSceneGraph] = useState<MasterSceneGraph>(defaultMockSceneGraph);
  const [script, setScript] = useState<string>(
    `Cảnh 1: Tôi nhìn thấy một con nhện nhỏ trong chiếc lọ thủy tinh trên sàn nhà. Tôi bảo 'Để sau!' rồi quên bẵng nó.\nCảnh 2: Phóng cận cảnh vào chiếc lọ thủy tinh, tôi dán nhãn đặt tên cho nó là 'Tám'.\nCảnh 3: Minh họa biểu đồ đồng hồ trao đổi chất chỉ mức thấp, nó tự hạ tốc độ trao đổi chất để sống sót.\nCảnh 4: Buổi tối bình thường, tôi ngồi sau bàn học làm việc dưới ánh đèn bàn ấm áp, bên ngoài cửa sổ là trăng sao.`
  );

  // Settings State (Loaded from localStorage)
  const [geminiKey, setGeminiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-flash-lite");
  const [githubToken, setGithubToken] = useState("");
  const [githubOwner, setGithubOwner] = useState("duclee13");
  const [githubRepo, setGithubRepo] = useState("2d-anim-renderer");

  const [lastGeneratedScript, setLastGeneratedScript] = useState<string>("");
  const isScriptOutOfSync = script.trim() !== lastGeneratedScript.trim();

  const [sceneVersion, setSceneVersion] = useState<number>(Date.now());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const playerRef = React.useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGeminiKey(localStorage.getItem("STICKMAN_GEMINI_KEY") || "");
      setGithubToken(localStorage.getItem("STICKMAN_GH_TOKEN") || "");
      setGithubOwner(localStorage.getItem("STICKMAN_GH_OWNER") || "duclee13");
      setGithubRepo(localStorage.getItem("STICKMAN_GH_REPO") || "2d-anim-renderer");
    }
  }, []);

  const handleSceneGraphGenerated = (newGraph: MasterSceneGraph) => {
    setSceneGraph(newGraph);
    setLastGeneratedScript(script);
    setSceneVersion(Date.now());
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
    }, 100);
  };

  const handleIRCompiled = (newIR: AnimScriptIR, diags: CompilerDiagnostic[]) => {
    setAnimScriptIR(newIR);
    setCompilerDiagnostics(diags);
    setSceneVersion(Date.now());
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
    }, 100);
  };

  const handleRefreshPreview = () => {
    setSceneVersion(Date.now());
  };

  const handleSelectScene = (scene: SceneGraphScene) => {
    if (playerRef.current) {
      const targetFrame = Number(scene.startFrame) || 0;
      playerRef.current.seekTo(targetFrame);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0C]">
      {/* Studio Apple Header */}
      <StudioHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRenderModal={() => setIsRenderModalOpen(true)}
        isReadyToRender={!!lastGeneratedScript && !isScriptOutOfSync}
      />

      {/* Engine Switcher Bar */}
      <div className="border-b border-[#1E1E22] bg-[#0E0E12] px-6 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-zinc-400 font-medium">Chế độ Engine:</span>
          <div className="inline-flex rounded-lg border border-[#27272A] bg-[#141418] p-0.5">
            <button
              onClick={() => setEngineMode("v8")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                engineMode === "v8"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>V8 Auto Movie (Khuyên dùng)</span>
            </button>
            <button
              onClick={() => setEngineMode("animscript")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                engineMode === "animscript"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>AnimScript v0.1</span>
            </button>
            <button
              onClick={() => setEngineMode("legacy")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                engineMode === "legacy"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span>Legacy SceneGraph</span>
            </button>
          </div>
        </div>
        <div className="text-zinc-500 text-[11px]">
          {engineMode === "v8"
            ? "Lõi V7.3 + Tự động phân cảnh AI + Thuyết minh Edge-TTS + Subtitle Điện ảnh (Zero-HUD)"
            : engineMode === "animscript"
            ? "Mô hình toán học + IK 2-khớp + Frame-deterministic pure engine"
            : "Hệ thống SceneGraph tiền nhiệm"}
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="mx-auto grid max-w-[1780px] grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: 1080p 60FPS Live Preview Player (7 Cols) */}
          <div className="flex flex-col space-y-6 lg:col-span-7">
            <PreviewPlayer
              sceneGraph={sceneGraph}
              animScriptIR={engineMode === "animscript" ? animScriptIR : undefined}
              v7MoviePayload={engineMode === "v8" ? v7MoviePayload : undefined}
              showDebugHud={showDebugHud}
              onToggleDebugHud={setShowDebugHud}
              playerRefProp={playerRef}
              version={sceneVersion}
              onRefresh={handleRefreshPreview}
            />
            {engineMode === "legacy" && (
              <TimelineViewer sceneGraph={sceneGraph} onSelectScene={handleSelectScene} />
            )}
          </div>

          {/* Right Column: Editor & Scene Parameters (5 Cols) */}
          <div className="flex flex-col space-y-6 lg:col-span-5">
            {engineMode === "v8" ? (
              <V7MovieEditor
                payload={v7MoviePayload}
                onPayloadGenerated={(newPayload) => {
                  setV7MoviePayload(newPayload);
                  setSceneVersion(Date.now());
                  setTimeout(() => {
                    if (playerRef.current) {
                      playerRef.current.seekTo(0);
                    }
                  }, 100);
                }}
                apiKey={geminiKey}
                selectedModel={selectedModel}
                showDebugHud={showDebugHud}
                onToggleDebugHud={setShowDebugHud}
              />
            ) : engineMode === "animscript" ? (
              <AnimScriptEditor
                currentScript={animScriptCode}
                onScriptChange={setAnimScriptCode}
                onIRCompiled={handleIRCompiled}
                apiKey={geminiKey}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              />
            ) : (
              <ScriptEditor
                script={script}
                setScript={setScript}
                apiKey={geminiKey}
                isScriptOutOfSync={isScriptOutOfSync}
                onSceneGraphGenerated={handleSceneGraphGenerated}
              />
            )}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiKey={geminiKey}
        setGeminiKey={setGeminiKey}
        githubToken={githubToken}
        setGithubToken={setGithubToken}
        githubOwner={githubOwner}
        setGithubOwner={setGithubOwner}
        githubRepo={githubRepo}
        setGithubRepo={setGithubRepo}
      />

      {/* Cloud Render Modal */}
      <RenderModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        sceneGraph={sceneGraph}
        githubToken={githubToken}
        githubOwner={githubOwner}
        githubRepo={githubRepo}
        isScriptOutOfSync={isScriptOutOfSync}
        currentScript={script}
        geminiKey={geminiKey}
        onSceneGraphGenerated={handleSceneGraphGenerated}
        engineMode={engineMode}
        animScriptIR={animScriptIR}
        v7MoviePayload={v7MoviePayload}
      />
    </div>
  );
}
