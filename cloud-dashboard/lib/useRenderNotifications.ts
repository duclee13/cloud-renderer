"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RunDetailPayload, WorkflowRunSummary } from "@/lib/github";

export const DEFAULT_DASHBOARD_TITLE =
  "Cloud Render Control — 2D Animation Factory";
const NOTIFY_ENABLED_STORAGE_KEY = "cloud_dashboard_notify_enabled_v1";
const NOTIFIED_RUNS_SESSION_KEY = "cloud_dashboard_notified_runs_v1";
const TOAST_AUTO_DISMISS_MS = 12_000;
const MAX_STORED_NOTIFIED_IDS = 100;

export type NotificationPermissionState =
  | NotificationPermission
  | "unsupported";

export interface RenderToastItem {
  id: string;
  runId: number;
  runNumber: number;
  kind: "success" | "error";
  title: string;
  message: string;
  label: string;
  artifactUrl: string;
  htmlUrl: string;
  createdAtMs: number;
}

interface UseRenderNotificationsParams {
  runs: WorkflowRunSummary[];
  runDetail: RunDetailPayload | null;
  loadingRuns: boolean;
  hasAnyActiveRun: boolean;
  onSelectRun?: (runId: number) => void;
}

function isStatusActive(status: string | null | undefined): boolean {
  return (
    status === "queued" ||
    status === "in_progress" ||
    status === "waiting" ||
    status === "pending"
  );
}

function isStatusTerminal(status: string | null | undefined): boolean {
  return status === "completed";
}

function getBrowserNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return window.Notification.permission;
}

function readNotifiedRunIdsFromSession(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(NOTIFIED_RUNS_SESSION_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
    );
  } catch {
    return new Set();
  }
}

function persistNotifiedRunIdsToSession(ids: Set<number>): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = Array.from(ids).slice(-MAX_STORED_NOTIFIED_IDS);
    window.sessionStorage.setItem(
      NOTIFIED_RUNS_SESSION_KEY,
      JSON.stringify(trimmed)
    );
  } catch {
    // ignore storage quota or private-mode restrictions
  }
}

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext || w.webkitAudioContext || null;
}

export function useRenderNotifications({
  runs,
  runDetail,
  loadingRuns,
  hasAnyActiveRun,
  onSelectRun,
}: UseRenderNotificationsParams) {
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermissionState>("default");
  const [toasts, setToasts] = useState<RenderToastItem[]>([]);
  const [finishedTabTitle, setFinishedTabTitle] = useState<string | null>(null);

  // Refs for anti-spam tracking, AudioContext reuse & latest callbacks
  const prevRunStatusMapRef = useRef<Map<number, string>>(new Map());
  const hasSeededInitialRunsRef = useRef(false);
  const notifiedRunIdsRef = useRef<Set<number>>(new Set());
  const notifyEnabledRef = useRef(false);
  const runDetailRef = useRef<RunDetailPayload | null>(null);
  const onSelectRunRef = useRef(onSelectRun);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimersRef = useRef<Map<string, number>>(new Map());
  const lastDispatchedLabelRef = useRef<string | null>(null);

  notifyEnabledRef.current = notifyEnabled;
  runDetailRef.current = runDetail;
  onSelectRunRef.current = onSelectRun;

  // Hydrate preference, browser Notification permission & sessionStorage set on client mount (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentPerm = getBrowserNotificationPermission();
    setPermission(currentPerm);
    notifiedRunIdsRef.current = readNotifiedRunIdsFromSession();

    try {
      const saved = window.localStorage.getItem(NOTIFY_ENABLED_STORAGE_KEY);
      if (saved === "1") {
        setNotifyEnabled(true);
      } else if (saved === "0") {
        setNotifyEnabled(false);
      } else if (currentPerm === "granted") {
        setNotifyEnabled(true);
      }
    } catch {
      // ignore localStorage restrictions
    }
  }, []);

  // Remember latest dispatched episode/output label so toast & OS alert display the exact filename
  const rememberDispatchedLabel = useCallback((label: string | null | undefined) => {
    const clean = (label || "").trim();
    if (clean) {
      lastDispatchedLabelRef.current = clean;
    }
  }, []);

  // Unlock/reuse Web AudioContext safely during a user gesture
  const ensureAudioContext = useCallback((): AudioContext | null => {
    const Ctor = getAudioContextConstructor();
    if (!Ctor) return null;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new Ctor();
      }
      if (audioCtxRef.current.state === "suspended") {
        void audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Synthesize gentle 2-note "ting-ting" chime via Web Audio API (no external MP3 required)
  const playChime = useCallback(
    (isSuccess: boolean) => {
      if (!notifyEnabledRef.current) return;
      const ctx = ensureAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const notes = isSuccess
          ? [
              { freq: 1046.5, start: 0, dur: 0.24, gain: 0.11 }, // C6
              { freq: 1318.51, start: 0.14, dur: 0.42, gain: 0.12 }, // E6
            ]
          : [
              { freq: 440, start: 0, dur: 0.2, gain: 0.09 }, // A4
              { freq: 329.63, start: 0.16, dur: 0.34, gain: 0.09 }, // E4
            ];

        for (const n of notes) {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = isSuccess ? "sine" : "triangle";
          osc.frequency.setValueAtTime(n.freq, now + n.start);

          gainNode.gain.setValueAtTime(0.0001, now + n.start);
          gainNode.gain.exponentialRampToValueAtTime(
            n.gain,
            now + n.start + 0.018
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.0001,
            now + n.start + n.dur
          );

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(now + n.start);
          osc.stop(now + n.start + n.dur + 0.02);
        }
      } catch {
        // ignore audio autoplay restriction errors
      }
    },
    [ensureAudioContext]
  );

  // Dismiss a toast & cancel its auto-hide timer
  const dismissToast = useCallback((toastId: string) => {
    const timer = toastTimersRef.current.get(toastId);
    if (timer !== undefined && typeof window !== "undefined") {
      window.clearTimeout(timer);
      toastTimersRef.current.delete(toastId);
    }
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Push an in-app toast with 12-second auto-dismiss
  const pushToast = useCallback(
    (toast: RenderToastItem) => {
      setToasts((prev) => {
        const filtered = prev.filter((item) => item.runId !== toast.runId);
        return [...filtered.slice(-2), toast];
      });

      if (typeof window !== "undefined") {
        const existingTimer = toastTimersRef.current.get(toast.id);
        if (existingTimer !== undefined) {
          window.clearTimeout(existingTimer);
        }
        const timerId = window.setTimeout(() => {
          toastTimersRef.current.delete(toast.id);
          setToasts((prev) => prev.filter((item) => item.id !== toast.id));
        }, TOAST_AUTO_DISMISS_MS);
        toastTimersRef.current.set(toast.id, timerId);
      }
    },
    []
  );

  // Trigger OS Notification + In-App Toast + Chime + Tab Title for a real active -> terminal transition
  const dispatchCompletionAlert = useCallback(
    (run: WorkflowRunSummary) => {
      const isSuccess = run.conclusion === "success";
      const detail =
        runDetailRef.current?.run.id === run.id ? runDetailRef.current : null;

      const label =
        detail?.primaryArtifact?.name ||
        lastDispatchedLabelRef.current ||
        run.displayTitle ||
        `Run #${run.runNumber}`;

      const artifactUrl =
        detail?.primaryArtifact?.artifactPageUrl || `${run.htmlUrl}#artifacts`;

      const title = isSuccess
        ? "✅ Render video hoàn tất!"
        : "❌ Render gặp lỗi";
      const message = isSuccess
        ? `${label} đã sẵn sàng tải xuống.`
        : `Workflow #${run.id} dừng lại, bấm để kiểm tra log.`;

      // 1. Always show In-App Toast in bottom-right corner (works even without OS Notification permission)
      pushToast({
        id: `render-toast-${run.id}`,
        runId: run.id,
        runNumber: run.runNumber,
        kind: isSuccess ? "success" : "error",
        title,
        message,
        label,
        artifactUrl,
        htmlUrl: run.htmlUrl,
        createdAtMs: Date.now(),
      });

      // 2. Play gentle 2-note AudioContext chime (controlled by bell toggle)
      playChime(isSuccess);

      // 3. Update document.title completion state (resets on window focus / tab return)
      setFinishedTabTitle(
        isSuccess
          ? "✅ Xong! | Cloud Renderer"
          : "❌ Lỗi render | Cloud Renderer"
      );

      // 4. Fire Desktop / OS Notification if enabled & granted (works even in background tab / other apps)
      if (
        notifyEnabledRef.current &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        window.Notification.permission === "granted"
      ) {
        try {
          const n = new window.Notification(title, {
            body: message,
            tag: `render-done-${run.id}`,
          });
          n.onclick = () => {
            try {
              window.focus();
            } catch {
              // ignore focus error
            }
            onSelectRunRef.current?.(run.id);
            n.close();
          };
        } catch {
          // ignore Notification constructor errors in restricted environments
        }
      }
    },
    [playChime, pushToast]
  );

  // Header Bell Toggle — strictly calls Notification.requestPermission() inside user click gesture
  const toggleNotifications = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (notifyEnabled) {
      setNotifyEnabled(false);
      try {
        window.localStorage.setItem(NOTIFY_ENABLED_STORAGE_KEY, "0");
      } catch {
        // ignore
      }
      return;
    }

    // Turning ON: unlock AudioContext inside user gesture & persist enabled state
    ensureAudioContext();
    setNotifyEnabled(true);
    try {
      window.localStorage.setItem(NOTIFY_ENABLED_STORAGE_KEY, "1");
    } catch {
      // ignore
    }

    if ("Notification" in window) {
      const currentPerm = window.Notification.permission;
      setPermission(currentPerm);
      if (currentPerm === "default") {
        try {
          const result = await window.Notification.requestPermission();
          setPermission(result);
        } catch {
          // ignore permission dialog failure
        }
      }
    } else {
      setPermission("unsupported");
    }
  }, [notifyEnabled, ensureAudioContext]);

  // Anti-spam run status transition detector (ONLY fires on active -> terminal within current session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loadingRuns && runs.length === 0) return;

    const candidatesMap = new Map<number, WorkflowRunSummary>();
    for (const r of runs) {
      candidatesMap.set(r.id, r);
    }
    if (runDetail?.run) {
      const existing = candidatesMap.get(runDetail.run.id);
      // Prefer terminal runDetail status immediately if it arrived ahead of the runs list
      if (
        !existing ||
        (isStatusActive(existing.status) && isStatusTerminal(runDetail.run.status))
      ) {
        candidatesMap.set(runDetail.run.id, runDetail.run);
      }
    }
    const candidates = Array.from(candidatesMap.values());

    // Initial page load / F5 seed: snapshot all existing run statuses WITHOUT firing notifications
    if (!hasSeededInitialRunsRef.current) {
      if (candidates.length > 0 || !loadingRuns) {
        for (const r of candidates) {
          prevRunStatusMapRef.current.set(r.id, r.status);
        }
        hasSeededInitialRunsRef.current = true;
      }
      return;
    }

    // Subsequent polls: detect genuine active -> completed/failed/cancelled transitions
    for (const r of candidates) {
      const prevStatus = prevRunStatusMapRef.current.get(r.id);
      prevRunStatusMapRef.current.set(r.id, r.status);

      if (
        isStatusActive(prevStatus) &&
        isStatusTerminal(r.status) &&
        !notifiedRunIdsRef.current.has(r.id)
      ) {
        notifiedRunIdsRef.current.add(r.id);
        persistNotifiedRunIdsToSession(notifiedRunIdsRef.current);
        dispatchCompletionAlert(r);
      }
    }
  }, [runs, runDetail, loadingRuns, dispatchCompletionAlert]);

  // Upgrade active toast's artifact link & exact MP4 name as soon as runDetail arrives
  useEffect(() => {
    if (!runDetail?.run || !runDetail.primaryArtifact) return;
    const artifact = runDetail.primaryArtifact;
    const detailRunId = runDetail.run.id;

    setToasts((prev) => {
      let changed = false;
      const next = prev.map((t) => {
        if (t.runId !== detailRunId || t.kind !== "success") return t;
        if (
          t.artifactUrl === artifact.artifactPageUrl &&
          t.label === artifact.name
        ) {
          return t;
        }
        changed = true;
        return {
          ...t,
          label: artifact.name,
          message: `${artifact.name} đã sẵn sàng tải xuống.`,
          artifactUrl: artifact.artifactPageUrl,
        };
      });
      return changed ? next : prev;
    });
  }, [runDetail]);

  // Dynamic document.title sync + reset back to default title when user returns/focuses tab
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (hasAnyActiveRun) {
      const activeDetail =
        runDetail?.run && isStatusActive(runDetail.run.status)
          ? runDetail
          : null;
      const pct = activeDetail?.overallProgressPct ?? 0;
      document.title =
        pct > 0
          ? `⏳ ${pct}% Đang render... | Cloud Renderer`
          : "⏳ Đang render... | Cloud Renderer";
      return;
    }

    if (finishedTabTitle) {
      document.title = finishedTabTitle;
      return;
    }

    document.title = DEFAULT_DASHBOARD_TITLE;
  }, [hasAnyActiveRun, runDetail, finishedTabTitle]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const resetFinishedTitle = () => {
      if (document.visibilityState === "visible") {
        setFinishedTabTitle(null);
      }
    };

    window.addEventListener("focus", resetFinishedTitle);
    document.addEventListener("visibilitychange", resetFinishedTitle);

    return () => {
      window.removeEventListener("focus", resetFinishedTitle);
      document.removeEventListener("visibilitychange", resetFinishedTitle);
    };
  }, []);

  // Cleanup timers, AudioContext & title on unmount
  useEffect(() => {
    const timersMap = toastTimersRef.current;
    return () => {
      if (typeof window !== "undefined") {
        timersMap.forEach((tid) => window.clearTimeout(tid));
        timersMap.clear();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        void audioCtxRef.current.close().catch(() => {});
      }
      if (typeof document !== "undefined") {
        document.title = DEFAULT_DASHBOARD_TITLE;
      }
    };
  }, []);

  return {
    notifyEnabled,
    permission,
    toasts,
    toggleNotifications,
    dismissToast,
    rememberDispatchedLabel,
  };
}
