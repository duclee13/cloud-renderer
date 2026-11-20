"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Mic, FileText, Check, AlertCircle, Loader2, X, Play } from "lucide-react";
import { MasterSceneGraph } from "../remotion/types/sceneGraph";

interface ScriptEditorProps {
  script: string;
  setScript: (s: string) => void;
  apiKey: string;
  isScriptOutOfSync?: boolean;
  onSceneGraphGenerated: (graph: MasterSceneGraph) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  setScript,
  apiKey,
  isScriptOutOfSync = false,
  onSceneGraphGenerated,
}) => {
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [isLoadingTts, setIsLoadingTts] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-flash-lite");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);
  const [pipelinePercent, setPipelinePercent] = useState<number>(0);

  // Lưu trạng thái hoàn thành từng phần khi bị lỗi giữa chừng để tiếp tục (Resume)
  const [partialState, setPartialState] = useState<any | null>(null);

  const [apiTrace, setApiTrace] = useState<any[]>([]);
  const [storageWarning, setStorageWarning] = useState(false);
  const requestIdRef = useRef<string | null>(null);
  const cancelPromiseRef = useRef<Promise<unknown> | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('anim.apiFix.checkpoint') || 'null');
      if (saved?.version === 1) setPartialState(saved);
    } catch {}
  }, []);
  const savePartial = (state:any) => {
    setPartialState(state);
    try {
      if (state) sessionStorage.setItem('anim.apiFix.checkpoint', JSON.stringify(state));
      else sessionStorage.removeItem('anim.apiFix.checkpoint');
      setStorageWarning(false);
    } catch {setStorageWarning(true);}
  };
  const compatiblePartial = partialState?.rawScript === script.trim() && partialState?.modelName === selectedModel ? partialState : null;
  const abortControllerRef = useRef<AbortController | null>(null);
  const isGeneratingRef = useRef<boolean>(false);

  const samplePrompts = [
    {
      title: "Chuyện con nhện Tám (Full 4 cảnh 1.1 -> 1.5)",
      content: `Cảnh 1: Tôi nhìn thấy một con nhện nhỏ trong chiếc lọ thủy tinh trên sàn nhà. Tôi bảo 'Để sau!' rồi quên bẵng nó.
Cảnh 2: Phóng cận cảnh vào chiếc lọ thủy tinh, tôi dán nhãn đặt tên cho nó là 'Tám'.
Cảnh 3: Minh họa biểu đồ đồng hồ trao đổi chất chỉ mức thấp, nó tự hạ tốc độ trao đổi chất để sống sót.
Cảnh 4: Buổi tối bình thường, tôi ngồi sau bàn học làm việc dưới ánh đèn bàn ấm áp, bên ngoài cửa sổ là trăng sao.`,
    },
    {
      title: "Mang lọ ra vườn (Cầm nắm chuẩn Anchor Point)",
      content: `Buổi sáng trời nắng đẹp, mây trôi nhẹ. Tôi dùng hai tay cầm chắc chiếc lọ thủy tinh có con nhện Tám mang ra vườn cỏ xanh bên cạnh bụi cây.`,
    },
  ];

  const handleCancelGemini = () => {
    abortControllerRef.current?.abort();
    const requestId = requestIdRef.current;
    if (requestId) cancelPromiseRef.current = fetch('/api/pipeline/generate', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'cancel',requestId}),signal:AbortSignal.timeout(5000),
    }).catch(() => {});
    setStatusMessage('Đang hủy lời gọi API; giữ phần đã hoàn thành.');
  };

  const handleGenerateGemini = async (modelOverride?: string, resumeStateParam?: any) => {
    // Chặn người dùng khởi chạy nhiều lượt tạo đồng thời
    if (isGeneratingRef.current) {
      console.warn("[ScriptEditor] Tiến trình đang chạy, từ chối khởi chạy trùng lặp.");
      return;
    }

    if (!script.trim()) {
      setErrorMessage("Vui lòng nhập nội dung kịch bản trước.");
      return;
    }

    const activeModel = typeof modelOverride === "string" && modelOverride ? modelOverride : selectedModel;
    const activeResumeState = resumeStateParam || compatiblePartial || null;
    if (activeResumeState && (activeResumeState.rawScript !== script.trim() || activeResumeState.modelName !== activeModel)) {setErrorMessage("Bản lưu khác kịch bản/model. Hãy khôi phục hoặc tạo mới.");return;}
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    setApiTrace([{time:new Date().toISOString(),type:"start",model:activeModel,requestId,resume:!!activeResumeState}]);
    requestIdRef.current = requestId;
    isGeneratingRef.current = true;
    setIsLoadingGemini(true);
    setPipelineStep(activeResumeState?.directedScenes?.length ? 3 : 1);
    setPipelinePercent(activeResumeState?.directedScenes?.length ? 60 : 5);
    setErrorMessage(null);

    const initMsg = activeResumeState?.directedScenes?.length
      ? `Đang tiếp tục từ Cảnh ${(activeResumeState.directedScenes.length) + 1} (Model: ${activeModel}, ReqId: ${requestId})...`
      : `Đang khởi động Multi-Prompt Pipeline (Model: ${activeModel}, ReqId: ${requestId})...`;
    setStatusMessage(initMsg);

    abortControllerRef.current = new AbortController();

    let hasReceivedComplete = false;

    try {
      const res = await fetch("/api/pipeline/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: script,
          apiKey,
          model: activeModel,
          requestId,
          resumeState: activeResumeState,
        }),
        signal: abortControllerRef.current.signal,
      });

      const contentType = res.headers.get("content-type") || "";

      // Kiểm tra mã HTTP lỗi trả về trực tiếp (ví dụ 400, 409 Conflict)
      if (!res.ok) {
        let errBody: any;
        try {
          errBody = await res.json();
        } catch {
          errBody = { error: `Máy chủ trả về HTTP ${res.status}` };
        }
        throw new Error(errBody.error || `Lỗi máy chủ (${res.status})`);
      }

      if (contentType.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");
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
                try {
                  const event = JSON.parse(trimmed.slice(6));
                  if (event.type !== 'heartbeat') setApiTrace(previous => [...previous.slice(-98), {
                    time:new Date().toISOString(),type:event.type,status:event.status,step:event.step || event.failedAtStep,
                    message:String(event.error || event.message || '').split(apiKey || '\u0000').join('[REDACTED]'),
                    completedScenes:event.partialState?.directedScenes?.length,requestId,
                  }]);
                  if (event.type === "progress") {
                    setPipelineStep(event.step);
                    setPipelinePercent(event.percent);
                    setStatusMessage(`[Bước ${event.step}/4] ${event.message}`);
                  } else if (event.type === "checkpoint") {
                    savePartial(event.partialState);
                  } else if (event.type === "complete") {
                    // CHỈ CẬP NHẬT VIDEO KHI NHẬN COMPLETE HỢP LỆ
                    hasReceivedComplete = true;
                    setPipelinePercent(100);
                    onSceneGraphGenerated(event.result.sceneGraph);
                    savePartial(null); // Xóa partial state sau khi thành công 100%
                    setStatusMessage(`Đã tạo Scene Graph thành công qua model ${activeModel}! Live Preview đã cập nhật.`);
                  } else if (event.type === "error") {
                    if (event.partialState) {
                      savePartial(event.partialState);
                    }
                    const statusStr = event.status ? `[HTTP ${event.status}] ` : "";
                    throw new Error(`${statusStr}${event.error}`);
                  }
                } catch (pe: any) {
                  throw pe;
                }
              }
            }
          }
        }

        // BẮT BUỘC KIỂM TRA: HTTP 200 của kết nối SSE không được coi là thành công nếu chưa nhận complete
        if (!hasReceivedComplete && !abortControllerRef.current?.signal.aborted) {
          throw new Error("Luồng dữ liệu kết thúc trước khi nhận được sự kiện 'complete' hợp lệ từ server.");
        }
      } else {
        // Fallback: nếu server trả về JSON thông thường
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Không thể sinh Scene Graph");
        }
        onSceneGraphGenerated(data.sceneGraph);
        savePartial(null);
        setStatusMessage(`Đã tạo Scene Graph thành công! Live Preview đã cập nhật.`);
      }
    } catch (err: any) {
      setApiTrace(previous => [...previous.slice(-98), {time:new Date().toISOString(),type:'client-error',message:String(err.message).split(apiKey || '\u0000').join('[REDACTED]'),requestId}]);
      if (err.name === "AbortError") {
        setStatusMessage("Đã dừng tác vụ theo yêu cầu. Dữ liệu phân cảnh hiện tại được bảo toàn.");
      } else {
        setErrorMessage(err.message || "Lỗi xử lý trong pipeline.");
      }
    } finally {
      await cancelPromiseRef.current;
      cancelPromiseRef.current = null;
      requestIdRef.current = null;
      setIsLoadingGemini(false);
      setPipelineStep(null);
      isGeneratingRef.current = false;
      abortControllerRef.current = null;
    }
  };

  const handleGenerateEdgeTts = async () => {
    if (!script.trim()) {
      setErrorMessage("Vui lòng nhập kịch bản trước khi tạo giọng đọc.");
      return;
    }

    setIsLoadingTts(true);
    setErrorMessage(null);
    setStatusMessage("Edge-TTS đang tổng hợp giọng Hoài My & bóc tách metadata timestamp...");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          voice: "vi-VN-HoaiMyNeural",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Lỗi tổng hợp giọng đọc");
      }

      setStatusMessage(`Tạo giọng đọc thành công! (${(data.durationMs / 1000).toFixed(1)}s, ${data.words.length} từ).`);
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi kết nối Edge-TTS");
    } finally {
      setIsLoadingTts(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 rounded-2xl border border-[#232326] bg-[#121215] p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white">Kịch bản & Ý tưởng phân cảnh · API FIX 1</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-zinc-400">Mô hình AI:</span>
          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              savePartial(null);
            }}
            disabled={isLoadingGemini}
            className="rounded-lg border border-[#27272A] bg-[#18181B] px-2.5 py-1 text-xs text-blue-300 font-medium focus:border-blue-500 focus:outline-none"
          >
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
            <option value="gemini-3.5-flash">gemini-3.5-flash</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash</option>
          </select>
        </div>
      </div>

      {/* Preset script chips */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            disabled={isLoadingGemini}
            onClick={() => {
              setScript(p.content);
              savePartial(null);
            }}
            className="rounded-full border border-[#27272A] bg-[#18181B] px-3 py-1 text-xs text-zinc-300 transition-colors hover:border-blue-500/40 hover:text-white"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        disabled={isLoadingGemini}
        value={script}
        onChange={(e) => {
          setScript(e.target.value);
          savePartial(null);
        }}
        placeholder="Nhập kịch bản phân đoạn của bạn ở đây... (ví dụ: Tôi phát hiện con nhện trong lọ, sau đó đặt tên cho nó là Tám...)"
        rows={6}
        className="w-full resize-none rounded-xl border border-[#27272A] bg-[#0E0E11] p-3 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {partialState && <div role="status" className="rounded-lg border border-blue-500/40 p-3 text-sm text-blue-200">
        <p>Đã lưu {partialState.directedScenes?.length || 0}/{partialState.beats?.length || 0} cảnh. {compatiblePartial ? 'Bấm tạo để tiếp tục phần còn lại.' : 'Bản lưu thuộc kịch bản/model khác.'}</p>
        {!compatiblePartial && <button type="button" disabled={isLoadingGemini} className="mr-4 mt-2 underline" onClick={() => {setScript(partialState.rawScript);setSelectedModel(partialState.modelName);}}>Khôi phục kịch bản và model</button>}
        <button type="button" disabled={isLoadingGemini} className="mt-2 underline" onClick={() => savePartial(null)}>Xóa bản lưu, tạo mới</button>
      </div>}
      {storageWarning && <p role="status" className="text-sm text-amber-200">Không lưu được vào trình duyệt. Giữ tab này để tiếp tục.</p>}
      {apiTrace.length > 0 && <button type="button" className="min-h-11 rounded-lg border border-blue-500 px-4 text-sm text-blue-200" onClick={() => {
        const url=URL.createObjectURL(new Blob([JSON.stringify({version:'API-FIX-1',events:apiTrace},null,2)],{type:'application/json'}));
        const a=document.createElement('a');a.href=url;a.download='api-run-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      }}>Tải báo cáo lượt gọi API (đã che key)</button>}
      {/* Status or Error notice */}
      {statusMessage && !errorMessage && (
        <div className="flex items-center space-x-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-300">
          {isLoadingGemini ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex flex-col space-y-2 rounded-lg bg-rose-950/40 border border-rose-500/20 px-3 py-2.5 text-xs text-rose-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>

          {/* Nút Tiếp tục từ bước/cảnh dở dang với đúng model và kịch bản */}
          {compatiblePartial && partialState.beats && (
            <div className="flex items-center gap-2 pt-1 border-t border-rose-500/20 mt-1">
              <span className="text-[11px] text-zinc-400">
                Đã giữ được {partialState.directedScenes?.length || 0}/{partialState.beats.length} cảnh trước đó.
              </span>
              <button
                type="button"
                onClick={() => handleGenerateGemini(partialState.modelName || selectedModel, partialState)}
                disabled={isLoadingGemini}
                className="flex items-center space-x-1 rounded-md bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Tiếp tục từ Cảnh {(partialState.failedAtSceneIndex ?? 0) + 1} (Model: {partialState.modelName || selectedModel})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notice khi kịch bản được thay đổi nhưng chưa bấm Sinh Scene Graph */}
      {isScriptOutOfSync && !statusMessage && !errorMessage && !isLoadingGemini && (
        <div className="flex items-center space-x-2 rounded-lg bg-amber-950/40 border border-amber-500/30 px-3 py-2 text-xs text-amber-200 animate-pulse">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>Kịch bản vừa được sửa đổi! Bấm <strong>&quot;Sinh Scene Graph&quot;</strong> bên dưới để cập nhật video.</span>
        </div>
      )}

      {/* Multi-Prompt Pipeline Stepper Progress */}
      {isLoadingGemini && (
        <div className="flex flex-col space-y-2.5 rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-300">
              {pipelineStep ? `Bước ${pipelineStep}/4: ` : "Đang xử lý: "}
              {pipelineStep === 1 && "Cắt nhịp kịch bản & Ước tính thời lượng"}
              {pipelineStep === 2 && "Thiết kế SVG 400x400 từng Object"}
              {pipelineStep === 3 && "Đạo diễn chi tiết Micro-Scenes"}
              {pipelineStep === 4 && "Khóa hình học & Ghép nối Master Graph"}
              {!pipelineStep && "Khởi động quy trình..."}
            </span>
            <span className="font-bold text-blue-400">{pipelinePercent}%</span>
          </div>

          {/* Progress Track */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-blue-950/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${Math.max(5, pipelinePercent)}%` }}
            />
          </div>

          {/* 4 Step Pills */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] text-center">
            <div className={`rounded py-1 px-1 font-medium ${(pipelineStep || 1) >= 1 ? "bg-blue-600/30 text-blue-300 border border-blue-500/40" : "bg-zinc-800/40 text-zinc-500"}`}>
              1. Cắt nhịp 3-5s
            </div>
            <div className={`rounded py-1 px-1 font-medium ${(pipelineStep || 1) >= 2 ? "bg-blue-600/30 text-blue-300 border border-blue-500/40" : "bg-zinc-800/40 text-zinc-500"}`}>
              2. Vẽ SVG 400x400
            </div>
            <div className={`rounded py-1 px-1 font-medium ${(pipelineStep || 1) >= 3 ? "bg-blue-600/30 text-blue-300 border border-blue-500/40" : "bg-zinc-800/40 text-zinc-500"}`}>
              3. Đạo diễn cảnh
            </div>
            <div className={`rounded py-1 px-1 font-medium ${(pipelineStep || 1) >= 4 ? "bg-blue-600/30 text-blue-300 border border-blue-500/40" : "bg-zinc-800/40 text-zinc-500"}`}>
              4. Ghép 1080p
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        <button
          onClick={() => handleGenerateGemini()}
          disabled={isLoadingGemini}
          className="flex w-full sm:w-auto flex-1 items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/10 transition-all hover:brightness-110 disabled:opacity-50"
        >
          {isLoadingGemini ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-blue-200" />
          )}
          <span>{isLoadingGemini ? `Đang tạo qua Pipeline (${pipelinePercent}%)...` : compatiblePartial ? "Tiếp tục bằng API từ bản lưu" : "Sinh Scene Graph với Gemini"}</span>
        </button>

        {isLoadingGemini && (
          <button
            type="button"
            onClick={handleCancelGemini}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-500/40 bg-rose-950/60 px-4 py-2.5 text-xs font-semibold text-rose-200 hover:bg-rose-900/80 transition-colors shadow-sm"
          >
            <X className="h-4 w-4 text-rose-400" />
            <span>Hủy</span>
          </button>
        )}

        <button
          onClick={handleGenerateEdgeTts}
          disabled={isLoadingTts || isLoadingGemini}
          className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl border border-[#27272A] bg-[#18181B] px-4 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#222226] hover:text-white disabled:opacity-50"
        >
          {isLoadingTts ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic className="h-4 w-4 text-amber-400" />
          )}
          <span>Tạo Giọng đọc Edge-TTS</span>
        </button>
      </div>
    </div>
  );
};
