"use client";

import React from "react";
import { CheckCircle2, Download, ExternalLink, X, XCircle } from "lucide-react";
import type { RenderToastItem } from "@/lib/useRenderNotifications";

interface RenderNotificationToastStackProps {
  toasts: RenderToastItem[];
  onDismiss: (id: string) => void;
  onSelectRun?: (runId: number) => void;
}

export function RenderNotificationToastStack({
  toasts,
  onDismiss,
  onSelectRun,
}: RenderNotificationToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Thông báo trạng thái Cloud Render"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col gap-3"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.kind === "success";
        return (
          <div
            key={toast.id}
            role={isSuccess ? "status" : "alert"}
            className={`toast-slide-in pointer-events-auto overflow-hidden rounded-2xl border bg-[#0f172a]/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl ${
              isSuccess
                ? "border-emerald-400/50 shadow-emerald-500/15"
                : "border-rose-500/55 shadow-rose-500/15"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                  isSuccess
                    ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
                    : "border-rose-400/35 bg-rose-500/15 text-rose-300"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <XCircle className="h-5 w-5" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-white">{toast.title}</p>
                  <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    aria-label="Đóng thông báo"
                    className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <p className="mt-1 break-words text-xs leading-relaxed text-slate-300">
                  {toast.message}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {isSuccess ? (
                    <a
                      href={toast.artifactUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.3)] transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Mở trang tải Artifact</span>
                    </a>
                  ) : (
                    <a
                      href={toast.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-rose-400/45 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Kiểm tra log GitHub</span>
                    </a>
                  )}

                  {onSelectRun && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRun(toast.runId);
                        onDismiss(toast.id);
                      }}
                      className="inline-flex min-h-[34px] cursor-pointer items-center rounded-xl border border-white/10 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      Xem Run #{toast.runNumber}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
