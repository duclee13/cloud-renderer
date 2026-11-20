"use client";

import React, { useState } from "react";
import {
  Code2,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  BookOpen,
} from "lucide-react";
import { AnimScriptIR, CompilerDiagnostic, compileAnimScript } from "../animscript";
import {
  DEMO_1_SCRIPT,
  DEMO_2_SCRIPT,
  DEMO_3_SCRIPT,
  DEMO_4_SPIDER_SCRIPT,
} from "../remotion/compositions/demoPresets";

interface AnimScriptEditorProps {
  currentScript: string;
  onScriptChange: (newScript: string) => void;
  onIRCompiled: (ir: AnimScriptIR, diagnostics: CompilerDiagnostic[]) => void;
  apiKey: string;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
}

export const AnimScriptEditor: React.FC<AnimScriptEditorProps> = ({
  currentScript,
  onScriptChange,
  onIRCompiled,
  apiKey,
  selectedModel,
  setSelectedModel,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<CompilerDiagnostic[]>([]);
  const [promptInput, setPromptInput] = useState<string>(
    "Tôi nhìn thấy một con nhện nhỏ trong chiếc lọ thủy tinh trên sàn nhà. Tôi bảo 'Để sau!' rồi quên bẵng nó."
  );

  const handleCompile = (codeToCompile = currentScript) => {
    try {
      const { ir, diagnostics: diags } = compileAnimScript(codeToCompile);
      setDiagnostics(diags);
      onIRCompiled(ir, diags);
      if (diags.some((d) => d.severity === "error")) {
        setErrorMessage("Phát hiện lỗi cú pháp hoặc anchor. Hãy xem bảng chẩn đoán bên dưới.");
      } else {
        setErrorMessage(null);
        setStatusMessage("Biên dịch thành công! Đã cập nhật Live Preview.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi biên dịch.");
    }
  };

  const handleGenerateAI = async () => {
    if (!promptInput.trim()) {
      setErrorMessage("Vui lòng nhập kịch bản cần sinh AnimScript.");
      return;
    }
    if (!apiKey.trim()) {
      setErrorMessage("Vui lòng cấu hình Gemini API Key trong Cài đặt.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage("Đang kết nối Gemini API để sinh mã AnimScript...");

    try {
      const res = await fetch("/api/animscript/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          apiKey,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Máy chủ trả về HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const event = JSON.parse(trimmed.slice(6));
              if (event.type === "progress") {
                setStatusMessage(event.message);
              } else if (event.type === "complete") {
                const generatedCode = event.result.script;
                onScriptChange(generatedCode);
                setDiagnostics(event.result.diagnostics || []);
                onIRCompiled(event.result.ir, event.result.diagnostics || []);
                setStatusMessage(
                  `Sinh mã thành công qua model ${selectedModel} (qua ${event.result.correctionRounds} vòng kiểm thử tự động)!`
                );
              } else if (event.type === "error") {
                throw new Error(event.error);
              }
            }
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi sinh AnimScript.");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadPreset = (code: string) => {
    onScriptChange(code);
    handleCompile(code);
  };

  const errors = diagnostics.filter((d) => d.severity === "error");
  const warnings = diagnostics.filter((d) => d.severity === "warning");

  return (
    <div className="flex flex-col space-y-4 rounded-2xl border border-[#232326] bg-[#121215] p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#232326] pb-3">
        <div className="flex items-center space-x-2">
          <Code2 className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">
            AnimScript v0.1 IDE & Compiler
          </h2>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="rounded-lg border border-[#27272A] bg-[#18181B] px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Siêu nhanh)</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            <option value="gemini-2.5-pro">gemini-2.5-pro</option>
          </select>
        </div>
      </div>

      {/* Preset Demos Selector */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] text-zinc-500 font-medium">Mẫu kiểm chứng:</span>
        <button
          onClick={() => loadPreset(DEMO_1_SCRIPT)}
          className="rounded-md border border-[#27272A] bg-[#18181B] px-2 py-1 text-[11px] text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
        >
          1. Đồng cỏ: Đi bộ & Nhảy
        </button>
        <button
          onClick={() => loadPreset(DEMO_2_SCRIPT)}
          className="rounded-md border border-[#27272A] bg-[#18181B] px-2 py-1 text-[11px] text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
        >
          2. Cầm cốc IK & Mang đi
        </button>
        <button
          onClick={() => loadPreset(DEMO_3_SCRIPT)}
          className="rounded-md border border-[#27272A] bg-[#18181B] px-2 py-1 text-[11px] text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
        >
          3. Ngồi bàn làm việc (Che thân)
        </button>
        <button
          onClick={() => loadPreset(DEMO_4_SPIDER_SCRIPT)}
          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/20 transition-colors font-medium"
        >
          4. Chuyện Nhện Tám (Full 4 cảnh)
        </button>
      </div>

      {/* Natural Language Prompt to DSL Generator */}
      <div className="flex flex-col space-y-2 rounded-xl border border-[#232326] bg-[#0E0E11] p-3">
        <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
          <span>Tạo mã tự động từ kịch bản tiếng Việt qua Gemini API:</span>
          <span className="text-[10px] text-zinc-500">Tự sửa lỗi tối đa 2 vòng</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ví dụ: Người tiến đến bàn, cầm cốc nước mang qua cửa sổ..."
            className="flex-1 rounded-lg border border-[#27272A] bg-[#18181B] px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang sinh...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sinh DSL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DSL Code Area */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-300">
            Mã nguồn AnimScript (Cú pháp Python):
          </label>
          <button
            onClick={() => handleCompile()}
            className="flex items-center space-x-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <Play className="h-3 w-3 fill-emerald-300" />
            <span>Biên dịch & Cập nhật Preview</span>
          </button>
        </div>
        <textarea
          value={currentScript}
          onChange={(e) => {
            onScriptChange(e.target.value);
          }}
          rows={14}
          className="w-full rounded-xl border border-[#27272A] bg-[#0A0A0C] p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
          spellCheck={false}
        />
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div className="flex items-center space-x-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 p-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-2 rounded-lg bg-rose-950/40 border border-rose-800/40 p-2.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Compiler Diagnostics Panel */}
      <div className="rounded-xl border border-[#232326] bg-[#0E0E11] p-3 text-xs">
        <div className="flex items-center justify-between border-b border-[#232326] pb-2 mb-2">
          <span className="font-semibold text-zinc-200">
            Kết quả kiểm duyệt Compiler:
          </span>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className={errors.length > 0 ? "text-rose-400 font-bold" : "text-zinc-500"}>
              {errors.length} lỗi
            </span>
            <span className={warnings.length > 0 ? "text-amber-400 font-bold" : "text-zinc-500"}>
              {warnings.length} cảnh báo
            </span>
          </div>
        </div>

        {diagnostics.length === 0 ? (
          <div className="flex items-center space-x-2 text-zinc-400 py-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Mã nguồn hoàn toàn hợp lệ, không có lỗi cấu trúc nào.</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {diagnostics.map((d, idx) => (
              <div
                key={idx}
                className={`rounded p-2 text-[11px] flex flex-col space-y-0.5 ${
                  d.severity === "error"
                    ? "bg-rose-950/30 border border-rose-900/40 text-rose-300"
                    : "bg-amber-950/30 border border-amber-900/40 text-amber-300"
                }`}
              >
                <div className="flex items-center space-x-1.5 font-medium">
                  {d.severity === "error" ? (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  )}
                  <span>
                    Dòng {d.line}, Cột {d.column} [{d.code}]: {d.message}
                  </span>
                </div>
                {d.fixSuggestion && (
                  <div className="pl-5 text-zinc-400 text-[10px]">
                    👉 Gợi ý: {d.fixSuggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
