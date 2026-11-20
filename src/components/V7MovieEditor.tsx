"use client";

import React, { useState } from "react";
import {
  Film,
  Sparkles,
  Play,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tv,
  Layers,
  Activity,
  User,
  Sliders,
  Eye,
  EyeOff,
} from "lucide-react";
import { ScriptBeat } from "../animscript/actionLibrary";
import { V7MoviePayload } from "../remotion/compositions/V7MovieComposition";

export interface V7MovieEditorProps {
  payload?: V7MoviePayload;
  onPayloadGenerated: (payload: V7MoviePayload) => void;
  apiKey: string;
  selectedModel: string;
  showDebugHud: boolean;
  onToggleDebugHud: (show: boolean) => void;
}

const STORY_PRESETS = [
  {
    title: "🦗 Điều gì xảy ra khi bỏ đói bọ ngựa 2 tháng? (Storytime V9.0)",
    desc: "Đan xen Cảnh nhân vật tĩnh có hồn + 9 Thẻ Infographic ẩn dụ + Giọng đọc nhấn nhá & SFX",
    text: "Điều gì sẽ xảy ra... nếu một sát thủ săn mồi đỉnh cao như bọ ngựa... phải nhịn đói suốt hai tháng trời? Ngày đầu tiên, nó vẫn cực kỳ tỉnh táo — chiếc đầu xoay 180 độ để sục sạo từng kẽ lá. Nhưng tuần 1, tuần 2 trôi qua... nó đứng bất động hàng giờ để tiết kiệm năng lượng. Bước sang tuần thứ 5, nó tự đốt thể mỡ và cơ bắp của chính mình trước khi chạm vạch đỏ kiệt sức ở tuần thứ 8!",
    archetype: "mantis",
  },
  {
    title: "🏖️ Khám Phá Bãi Biển & Hộp Kho Báu",
    desc: "Bãi biển nhiệt đới, uống nước dừa, nhặt hộp trôi dạt và đo năng lượng",
    text: "Chào mừng các bạn đến với bãi biển nhiệt đới tuyệt đẹp đầy nắng vàng và sóng biếc! Hãy uống một ngụm nước dừa mát lạnh để nạp năng lượng. Kìa, trên bờ cát có một chiếc hộp bí ẩn trôi dạt vào, chúng ta hãy nhấc nó lên khám phá. Năng lượng khám phá của bạn đã đạt mức tối đa một trăm phần trăm!",
    archetype: "boyCrown",
  },
  {
    title: "🔬 Bài Giảng Khoa Học & Quả Táo Rơi",
    desc: "Phòng khách, quan sát quả táo đỏ mọng, thuyết minh trọng lực và reo hò",
    text: "Giáo sư bước vào phòng nghiên cứu chuẩn bị cho bài học vật lý kỳ thú. Hãy quan sát thật kỹ quả táo chín đỏ mọng này trên tay. Định luật vạn vật hấp dẫn giải thích tại sao quả táo luôn rơi thẳng đứng xuống mặt đất. Một phát hiện khoa học vĩ đại làm thay đổi thế giới!",
    archetype: "scientist",
  },
  {
    title: "⚽ Sáng Tạo, Sút Bóng & Vượt Thử Thách",
    desc: "Bàn học công thái học, ăn mừng chiến thắng, sút bóng hoàng hôn và nhảy thùng hàng",
    text: "Mỗi buổi sáng bắt đầu bằng việc đi tới bàn làm việc tập trung cao độ. Ngồi vào ghế công thái học, ngón tay lướt nhanh trên bàn phím để sáng tạo nên những dòng mã hoàn hảo. Bất ngờ nhận được thông báo dự án đạt giải nhất! Chiều về ra sân bóng đường phố, tung cú sút tuyệt đẹp vào lưới. Đối mặt với thử thách, luôn sẵn sàng bật cao vượt qua mọi chướng ngại vật!",
    archetype: "default",
  },
];

export const V7MovieEditor: React.FC<V7MovieEditorProps> = ({
  payload,
  onPayloadGenerated,
  apiKey,
  selectedModel,
  showDebugHud,
  onToggleDebugHud,
}) => {
  const [promptText, setPromptText] = useState(STORY_PRESETS[0].text);
  const [voice, setVoice] = useState("vi-VN-HoaiMyNeural");
  const [archetype, setArchetype] = useState("mantis");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);

  const handleGenerateMovie = async () => {
    if (!promptText.trim()) {
      setErrorMessage("Vui lòng nhập kịch bản hoặc chọn một câu chuyện mẫu.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage("Đang gọi AI phân tích phân cảnh & tổng hợp giọng đọc Edge-TTS...");

    try {
      const res = await fetch("/api/v7-movie/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          apiKey,
          model: selectedModel,
          voice,
          archetype,
          showDebugHud,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể tạo phim hoạt hình tự động.");
      }

      onPayloadGenerated(data.payload);
      setStatusMessage(
        `Thành công! Đã tạo bộ phim ${data.payload.beats.length} phân cảnh (${(
          data.payload.totalDurationFrames / 60
        ).toFixed(1)} giây).`
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi trong quá trình tạo phim tự động.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudio = (index: number, audioUrl?: string) => {
    if (!audioUrl) return;
    try {
      const audio = new Audio(audioUrl);
      setPlayingAudioIndex(index);
      audio.onended = () => setPlayingAudioIndex(null);
      audio.onerror = () => setPlayingAudioIndex(null);
      audio.play();
    } catch {
      setPlayingAudioIndex(null);
    }
  };

  const currentBeats = payload?.beats || [];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
              V8 Auto Movie Studio
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                PRODUCTION
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Nhập kịch bản Tiếng Việt ➔ Tự động phân cảnh & Thuyết minh Edge-TTS
            </p>
          </div>
        </div>

        {/* Debug HUD Toggle */}
        <button
          onClick={() => onToggleDebugHud(!showDebugHud)}
          title={showDebugHud ? "Đang hiện HUD kỹ thuật (Click để ẩn)" : "Đang ẩn HUD (Click để hiện)"}
          className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-all ${
            showDebugHud
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
        >
          {showDebugHud ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showDebugHud ? "HUD: Bật" : "HUD: Tắt"}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Story Presets */}
        <div>
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Kịch bản mẫu 1-Click (Story Presets)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {STORY_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptText(p.text);
                  setArchetype(p.archetype);
                }}
                className="text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all text-xs"
              >
                <div className="font-semibold text-slate-200">{p.title}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Script Textarea */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Nội dung kịch bản hoặc câu chuyện (Tiếng Việt):
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={4}
            placeholder="Nhập nội dung kịch bản hoạt hình của bạn ở đây..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Voice and Archetype Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Giọng đọc Edge-TTS:
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="vi-VN-HoaiMyNeural">Hoài My (Nữ miền Bắc)</option>
              <option value="vi-VN-NamMinhNeural">Nam Minh (Nam miền Bắc)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Kiểu nhân vật:
            </label>
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="mantis">Bọ Ngựa 2D (Storytime)</option>
              <option value="default">Người que cơ bản</option>
              <option value="oldMan">Ông lão râu bạc</option>
              <option value="scientist">Nhà khoa học kính cận</option>
              <option value="girl">Cô gái tóc bím</option>
              <option value="boyCrown">Cậu bé vương miện</option>
            </select>
          </div>
        </div>

        {/* Generate CTA Button */}
        <button
          onClick={handleGenerateMovie}
          disabled={isGenerating}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang phân tích kịch bản & tạo âm thanh...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              TẠO PHIM TỰ ĐỘNG (GEMINI + EDGE-TTS)
            </>
          )}
        </button>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{statusMessage}</div>
          </div>
        )}

        {/* Beats Output List */}
        {currentBeats.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Danh sách Phân Cảnh ({currentBeats.length} beats)
              </span>
              <span>
                Tổng: {payload?.totalDurationFrames} frames (~
                {((payload?.totalDurationFrames || 0) / 60).toFixed(1)}s)
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {currentBeats.map((beat, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-300">
                      #{i + 1}. {beat.headerTitle || beat.type || beat.action}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">
                        {beat.durationFrames}f ({(beat.durationFrames / 60).toFixed(1)}s)
                      </span>
                      {beat.audioUrl && (
                        <button
                          onClick={() => handlePlayAudio(i, beat.audioUrl)}
                          className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                            playingAudioIndex === i ? "text-emerald-400" : "text-slate-400"
                          }`}
                          title="Nghe thử giọng đọc phân cảnh này"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800/50 rounded">
                      🎬 {beat.cardType || beat.type || beat.action}
                    </span>
                    <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-800/50 rounded">
                      🏞️ {beat.theme || beat.stageTheme}
                    </span>
                    {beat.voiceTone && (
                      <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded">
                        🎙️ {beat.voiceTone}
                      </span>
                    )}
                    {beat.sfxType && (
                      <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/50 rounded">
                        🔊 {beat.sfxType}
                      </span>
                    )}
                  </div>

                  {beat.narrationText && (
                    <div className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/70 p-2 rounded border border-slate-800/40">
                      "{beat.narrationText}"
                    </div>
                  )}

                  {beat.speechBubbleText && (
                    <div className="text-amber-300/90 text-[10px] italic">
                      💬 Thoại: "{beat.speechBubbleText}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
