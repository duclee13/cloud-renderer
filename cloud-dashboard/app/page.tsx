"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cloud,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Film,
  Gauge,
  GitBranch,
  History,
  KeyRound,
  Layers,
  ListChecks,
  Loader2,
  Play,
  RefreshCw,
  Server,
  ShieldAlert,
  Sparkles,
  Square,
  Upload,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import type {
  EpisodeFileItem,
  RunDetailPayload,
  StageJobSummary,
  StageVisualState,
  VmChunkStatus,
  WorkflowRunSummary,
} from "@/lib/github";

const VM_COUNT_OPTIONS = [8, 12, 16, 20] as const;
const PIN_STORAGE_KEY = "cloud_dashboard_pin_v1";
const POLL_INTERVAL_MS = 4000; // Auto-poll 4 giây/lần khi run đang chạy
const SAFE_EPISODE_FILENAME_RE = /^[a-zA-Z0-9._-]+$/;

interface LocalEpisodeDraft {
  originalName: string;
  filename: string;
  content: string;
  sizeBytes: number;
  title: string;
  beatsCount: number;
}

type UploadPipelinePhase =
  | "idle"
  | "uploading"
  | "committed"
  | "dispatched"
  | "error";

function sanitizeEpisodeFilename(rawName: string): string {
  const baseOnly = rawName
    .trim()
    .replace(/^.*[\\/]/, "")
    .replace(/\.json$/i, "");
  const ascii = baseOnly
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "");
  const cleanStem = ascii || `episode_${Date.now()}`;
  return `${cleanStem}.json`;
}

function formatDuration(sec: number | null | undefined): string {
  if (sec === null || sec === undefined || !Number.isFinite(sec) || sec < 0) {
    return "--:--";
  }
  const total = Math.floor(sec);
  const hrs = Math.floor((total / 3600));
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

function formatRelativeTime(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return iso;
  const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (diffSec < 45) return "Vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  const d = new Date(ts);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isRunActive(
  run: Pick<WorkflowRunSummary, "status"> | null | undefined
): boolean {
  if (!run) return false;
  return (
    run.status === "queued" ||
    run.status === "in_progress" ||
    run.status === "waiting" ||
    run.status === "pending"
  );
}

function getRunStatusMeta(
  status: string,
  conclusion: string | null
): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  if (status === "in_progress") {
    return {
      label: "Đang Render",
      badgeClass:
        "bg-sky-500/15 text-sky-300 border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.15)]",
      dotClass: "bg-sky-400 animate-pulse",
    };
  }
  if (status === "queued" || status === "waiting" || status === "pending") {
    return {
      label: "Đang xếp hàng",
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-400/35",
      dotClass: "bg-amber-400 animate-pulse",
    };
  }
  if (status === "completed") {
    if (conclusion === "success") {
      return {
        label: "Hoàn tất",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/35",
        dotClass: "bg-emerald-400",
      };
    }
    if (conclusion === "cancelled") {
      return {
        label: "Đã hủy",
        badgeClass: "bg-slate-500/20 text-slate-300 border-slate-400/30",
        dotClass: "bg-slate-400",
      };
    }
    return {
      label: "Thất bại",
      badgeClass: "bg-rose-500/15 text-rose-300 border-rose-400/40",
      dotClass: "bg-rose-400",
    };
  }
  return {
    label: status,
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    dotClass: "bg-slate-400",
  };
}

function getStageCardTheme(state: StageVisualState) {
  switch (state) {
    case "in_progress":
      return {
        border: "border-sky-400/70 vm-card-rendering bg-sky-950/25",
        badge: "bg-sky-500/20 text-sky-200 border-sky-400/40",
        bar: "bg-gradient-to-r from-sky-500 to-cyan-300",
        label: "in_progress",
        viLabel: "Đang chạy",
      };
    case "success":
      return {
        border: "border-emerald-500/45 bg-emerald-950/20 hover:border-emerald-400/65",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
        bar: "bg-emerald-400",
        label: "completed",
        viLabel: "Xong",
      };
    case "error":
      return {
        border: "border-rose-500/55 bg-rose-950/25 hover:border-rose-400/75",
        badge: "bg-rose-500/20 text-rose-300 border-rose-400/40",
        bar: "bg-rose-500",
        label: "failure",
        viLabel: "Lỗi",
      };
    case "cancelled":
      return {
        border: "border-slate-600/50 bg-slate-900/50 opacity-80",
        badge: "bg-slate-700/40 text-slate-300 border-slate-500/40",
        bar: "bg-slate-500",
        label: "cancelled",
        viLabel: "Đã hủy",
      };
    case "skipped":
      return {
        border: "border-slate-700/50 bg-slate-900/35 opacity-75",
        badge: "bg-slate-700/35 text-slate-400 border-slate-600/40",
        bar: "bg-slate-600",
        label: "skipped",
        viLabel: "Bỏ qua",
      };
    case "queued":
    case "pending":
    default:
      return {
        border: "border-slate-800 bg-[#0d1424]/90 hover:border-slate-700",
        badge: "bg-slate-800 text-slate-400 border-slate-700",
        bar: "bg-slate-700",
        label: "queued",
        viLabel: "Chờ",
      };
  }
}

export default function CloudDashboardPage() {
  // Metadata & Episodes
  const [repoLabel, setRepoLabel] = useState("duclee13/cloud-renderer");
  const [branchLabel, setBranchLabel] = useState("main");
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [pinRequired, setPinRequired] = useState(false);

  const [episodes, setEpisodes] = useState<EpisodeFileItem[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [episodesError, setEpisodesError] = useState<string | null>(null);

  // Dispatch Form State
  const [sourceMode, setSourceMode] = useState<"github" | "local">("github");
  const [selectedEpisode, setSelectedEpisode] = useState("");
  const [localDraft, setLocalDraft] = useState<LocalEpisodeDraft | null>(null);
  const [localParseError, setLocalParseError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPipelinePhase>("idle");
  const [lastUploadMeta, setLastUploadMeta] = useState<{
    commitSha: string | null;
    overwritten: boolean;
    episodeFile: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [vmCount, setVmCount] = useState<number>(16);
  const [outputName, setOutputName] = useState("");
  const [outputTouched, setOutputTouched] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Runs & Selected Run Monitor State
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [runsError, setRunsError] = useState<string | null>(null);

  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [runDetail, setRunDetail] = useState<RunDetailPayload | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancellingRunId, setCancellingRunId] = useState<number | null>(null);

  // Drawer / Modal state for inspecting steps of any clicked VM or Stage
  const [inspectedTarget, setInspectedTarget] = useState<{
    title: string;
    job: StageJobSummary;
    vm?: VmChunkStatus;
  } | null>(null);

  // Live 1s wall-clock ticker for active runs
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const selectedRunIdRef = useRef<number | null>(null);
  selectedRunIdRef.current = selectedRunId;

  // Restore PIN from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PIN_STORAGE_KEY);
      if (saved) setPin(saved);
    } catch {
      // ignore storage restrictions
    }
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    if (!inspectedTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspectedTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspectedTarget]);

  const handlePinChange = (val: string) => {
    setPin(val);
    try {
      window.localStorage.setItem(PIN_STORAGE_KEY, val);
    } catch {
      // ignore
    }
  };

  // Load Episodes
  const fetchEpisodes = useCallback(async () => {
    setLoadingEpisodes(true);
    setEpisodesError(null);
    try {
      const res = await fetch("/api/episodes", { cache: "no-store" });
      const data = await res.json();
      if (data.repo) setRepoLabel(data.repo);
      if (data.branch) setBranchLabel(data.branch);
      if (typeof data.hasToken === "boolean") setHasToken(data.hasToken);
      if (typeof data.pinRequired === "boolean") setPinRequired(data.pinRequired);

      if (!res.ok) {
        setEpisodesError(data.error || "Không thể tải danh sách tập phim.");
        return;
      }

      const list: EpisodeFileItem[] = Array.isArray(data.episodes)
        ? data.episodes
        : [];
      setEpisodes(list);

      if (list.length > 0) {
        setSelectedEpisode((prev) => {
          if (prev && list.some((e) => e.path === prev)) return prev;
          const preferred = list[list.length - 1];
          setOutputName(preferred.suggestedOutput);
          setOutputTouched(false);
          return preferred.path;
        });
      }
    } catch (err) {
      setEpisodesError(
        err instanceof Error ? err.message : "Lỗi mạng khi tải episodes."
      );
    } finally {
      setLoadingEpisodes(false);
    }
  }, []);

  // Load Detail of a Specific Run
  const fetchRunDetail = useCallback(
    async (runId: number, showSpinner = false) => {
      if (showSpinner) setLoadingDetail(true);
      try {
        const res = await fetch(
          `/api/runs/${runId}?expectedVms=${vmCount}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (res.ok && data?.run) {
          const payload = data as RunDetailPayload;
          setRunDetail(payload);

          // Nếu đang mở Drawer xem chi tiết 1 VM/Stage thì cập nhật live luôn!
          setInspectedTarget((prev) => {
            if (!prev) return null;
            if (prev.vm) {
              const updatedVm = payload.stage2Vms.find(
                (v) => v.vmIndex === prev.vm?.vmIndex
              );
              if (updatedVm) {
                return { ...prev, job: updatedVm, vm: updatedVm };
              }
            } else if (prev.title.startsWith("Stage 1")) {
              return { ...prev, job: payload.stage1 };
            } else if (prev.title.startsWith("Stage 3")) {
              return { ...prev, job: payload.stage3 };
            }
            return prev;
          });
        }
      } catch {
        // silent background poll error
      } finally {
        if (showSpinner) setLoadingDetail(false);
      }
    },
    [vmCount]
  );

  // Load Recent 10 Runs
  const fetchRuns = useCallback(
    async (autoSelectLatest = false, showSpinner = false) => {
      if (showSpinner) setLoadingRuns(true);
      try {
        const res = await fetch("/api/runs", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setRunsError(data.error || "Không thể tải lịch sử workflow runs.");
          return;
        }
        setRunsError(null);
        const list: WorkflowRunSummary[] = Array.isArray(data.runs)
          ? data.runs
          : [];
        setRuns(list);

        if (list.length > 0) {
          const currentSelected = selectedRunIdRef.current;
          if (autoSelectLatest || currentSelected === null) {
            const targetId = list[0].id;
            setSelectedRunId(targetId);
            fetchRunDetail(targetId, currentSelected === null);
          } else if (currentSelected) {
            fetchRunDetail(currentSelected, false);
          }
        }
      } catch (err) {
        setRunsError(
          err instanceof Error ? err.message : "Lỗi kết nối khi tải runs."
        );
      } finally {
        if (showSpinner) setLoadingRuns(false);
      }
    },
    [fetchRunDetail]
  );

  // Initial load
  useEffect(() => {
    fetchEpisodes();
    fetchRuns(true, true);
  }, [fetchEpisodes, fetchRuns]);

  // Auto-poll every 4s when any run (or selected run) is active
  const hasAnyActiveRun = useMemo(
    () => runs.some((r) => isRunActive(r)) || isRunActive(runDetail?.run),
    [runs, runDetail]
  );

  useEffect(() => {
    if (!hasAnyActiveRun) return;

    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      fetchRuns(false, false);
    }, POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchRuns(false, false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hasAnyActiveRun, fetchRuns]);

  // 1-second smooth elapsed timer when viewing an active run
  useEffect(() => {
    if (!isRunActive(runDetail?.run)) return;
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [runDetail?.run]);

  // Switch between GitHub dropdown and Local .json upload
  const handleSwitchSourceMode = (mode: "github" | "local") => {
    setSourceMode(mode);
    setDispatchFeedback(null);
    if (mode === "local" && localDraft && !outputTouched) {
      setOutputName(localDraft.filename.replace(/\.json$/i, ".mp4"));
    } else if (mode === "github" && selectedEpisode && !outputTouched) {
      const found = episodes.find((e) => e.path === selectedEpisode);
      setOutputName(
        found
          ? found.suggestedOutput
          : selectedEpisode.replace(/^episodes\//, "").replace(/\.json$/i, ".mp4")
      );
    }
  };

  // Read & validate local .json file via FileReader
  const handleLocalFileChosen = (file: File | null | undefined) => {
    if (!file) return;
    setDispatchFeedback(null);
    setUploadPhase("idle");
    setLastUploadMeta(null);

    if (!file.name.toLowerCase().endsWith(".json")) {
      setLocalDraft(null);
      setLocalParseError("Vui lòng chọn đúng định dạng file kịch bản .json.");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setLocalDraft(null);
      setLocalParseError("Không thể đọc nội dung file từ máy tính.");
    };
    reader.onload = () => {
      const rawText = typeof reader.result === "string" ? reader.result : "";
      if (!rawText.trim()) {
        setLocalDraft(null);
        setLocalParseError("File .json đang trống.");
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        const val = JSON.parse(rawText);
        if (!val || typeof val !== "object" || Array.isArray(val)) {
          setLocalDraft(null);
          setLocalParseError("Cấu trúc gốc của file JSON phải là một Object.");
          return;
        }
        parsed = val as Record<string, unknown>;
      } catch (err) {
        setLocalDraft(null);
        setLocalParseError(
          `File JSON lỗi cú pháp: ${
            err instanceof Error ? err.message : "Không thể parse JSON"
          }`
        );
        return;
      }

      if (!Array.isArray(parsed.beats) || parsed.beats.length === 0) {
        setLocalDraft(null);
        setLocalParseError(
          "Kịch bản thiếu mảng 'beats' hoặc chưa có beat nào (beats.length === 0)."
        );
        return;
      }

      const safeFilename = sanitizeEpisodeFilename(file.name);
      if (safeFilename === "current_episode.json") {
        setLocalDraft(null);
        setLocalParseError(
          "Không dùng tên trùng với current_episode.json. Hãy đổi tên file kịch bản trước khi tải lên."
        );
        return;
      }

      const rawTitle =
        (typeof parsed.title === "string" && parsed.title.trim()) ||
        (typeof parsed.episodeTitle === "string" && parsed.episodeTitle.trim()) ||
        safeFilename.replace(/\.json$/i, "");

      setLocalParseError(null);
      setLocalDraft({
        originalName: file.name,
        filename: safeFilename,
        content: rawText,
        sizeBytes: file.size,
        title: rawTitle,
        beatsCount: parsed.beats.length,
      });

      const suggestedMp4 = safeFilename.replace(/\.json$/i, ".mp4");
      setOutputName(suggestedMp4);
      setOutputTouched(false);
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleLocalFilenameChange = (val: string) => {
    if (!localDraft) return;
    const trimmed = val.trim();
    setLocalDraft({ ...localDraft, filename: trimmed });
    if (!outputTouched && trimmed) {
      const cleanMp4 = trimmed.toLowerCase().endsWith(".json")
        ? trimmed.replace(/\.json$/i, ".mp4")
        : `${trimmed}.mp4`;
      setOutputName(cleanMp4);
    }
  };

  // Handle Episode Change -> auto-suggest output_name unless manually overridden
  const handleSelectEpisode = (epPath: string) => {
    setSelectedEpisode(epPath);
    const found = episodes.find((e) => e.path === epPath);
    if (found && !outputTouched) {
      setOutputName(found.suggestedOutput);
    } else if (!outputTouched && epPath) {
      setOutputName(
        epPath.replace(/^episodes\//, "").replace(/\.json$/i, ".mp4")
      );
    }
  };

  const resetSuggestedOutput = () => {
    if (sourceMode === "local" && localDraft) {
      const base = localDraft.filename.toLowerCase().endsWith(".json")
        ? localDraft.filename.replace(/\.json$/i, ".mp4")
        : `${localDraft.filename}.mp4`;
      setOutputName(base);
      setOutputTouched(false);
      return;
    }
    const found = episodes.find((e) => e.path === selectedEpisode);
    const nextOut = found
      ? found.suggestedOutput
      : selectedEpisode.replace(/^episodes\//, "").replace(/\.json$/i, ".mp4");
    setOutputName(nextOut);
    setOutputTouched(false);
  };

  // Dispatch Cloud Render (either from GitHub selection or Upload & Run from local file)
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceMode === "local") {
      if (!localDraft) {
        setDispatchFeedback({
          type: "error",
          text: "Vui lòng kéo-thả hoặc chọn một file kịch bản .json từ máy tính.",
        });
        return;
      }

      const fn = localDraft.filename.trim();
      if (
        !fn ||
        !SAFE_EPISODE_FILENAME_RE.test(fn) ||
        !fn.endsWith(".json") ||
        fn === ".json" ||
        fn.includes("..")
      ) {
        setDispatchFeedback({
          type: "error",
          text: "Tên file trên GitHub chỉ được chứa ký tự [a-zA-Z0-9._-] và kết thúc bằng .json.",
        });
        return;
      }

      setDispatching(true);
      setDispatchFeedback(null);
      setLastUploadMeta(null);
      setUploadPhase("uploading");

      try {
        const res = await fetch("/api/episodes/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-dashboard-pin": pin.trim(),
          },
          body: JSON.stringify({
            filename: fn,
            content: localDraft.content,
            autoDispatch: true,
            totalChapters: vmCount,
            outputName: outputName.trim(),
            previewOnly,
          }),
        });

        const data = await res.json();

        if (data?.commitSha || data?.episodeFile) {
          setLastUploadMeta({
            commitSha: data.commitSha || null,
            overwritten: Boolean(data.overwritten),
            episodeFile: data.episodeFile || `episodes/${fn}`,
          });
        }

        if (!res.ok) {
          setUploadPhase("error");
          let errText =
            data?.error || "Không thể tải kịch bản lên GitHub và chạy Render.";
          if (res.status === 401) {
            errText =
              data?.error ||
              "Sai hoặc thiếu mã PIN bảo mật (401). Vui lòng kiểm tra lại mã PIN.";
          } else if (res.status === 403) {
            errText =
              data?.error ||
              'Từ chối quyền GitHub (403): Hãy kiểm tra GITHUB_TOKEN đã được cấp quyền "Contents: Read and write" và "Actions: Read and write" chưa.';
          }
          setDispatchFeedback({
            type: "error",
            text: errText,
          });
          if (data?.commitSha) {
            void fetchEpisodes();
          }
          return;
        }

        setUploadPhase("committed");
        window.setTimeout(() => {
          setUploadPhase("dispatched");
        }, 320);

        setDispatchFeedback({
          type: "success",
          text:
            data.message ||
            `Đã commit ${data.episodeFile} & kích hoạt Cloud Render thành công!`,
        });

        if (typeof data.episodeFile === "string") {
          setSelectedEpisode(data.episodeFile);
        }

        await fetchEpisodes();
        fetchRuns(true, false);
        window.setTimeout(() => fetchRuns(true, false), 2500);
        window.setTimeout(() => fetchRuns(true, false), 6000);
      } catch (err) {
        setUploadPhase("error");
        setDispatchFeedback({
          type: "error",
          text:
            err instanceof Error
              ? err.message
              : "Lỗi kết nối tới API /api/episodes/upload.",
        });
      } finally {
        setDispatching(false);
      }
      return;
    }

    if (!selectedEpisode) {
      setDispatchFeedback({
        type: "error",
        text: "Vui lòng chọn một file kịch bản tập phim (.json).",
      });
      return;
    }

    setDispatching(true);
    setDispatchFeedback(null);

    try {
      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dashboard-pin": pin.trim(),
        },
        body: JSON.stringify({
          episode_file: selectedEpisode,
          total_chapters: String(vmCount),
          output_name: outputName.trim(),
          preview_only: previewOnly,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let errText = data.error || "Không thể khởi chạy workflow.";
        if (res.status === 401) {
          errText =
            data.error ||
            "Sai hoặc thiếu mã PIN bảo mật (401). Vui lòng kiểm tra lại mã PIN.";
        }
        setDispatchFeedback({
          type: "error",
          text: errText,
        });
        return;
      }

      setDispatchFeedback({
        type: "success",
        text:
          data.message ||
          "Đã gửi lệnh workflow_dispatch thành công! Đang đồng bộ Run mới...",
      });

      window.setTimeout(() => fetchRuns(true, false), 2500);
      window.setTimeout(() => fetchRuns(true, false), 6000);
    } catch (err) {
      setDispatchFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Lỗi kết nối tới API /api/dispatch.",
      });
    } finally {
      setDispatching(false);
    }
  };

  // Cancel Active Run
  const handleCancelRun = async (runId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCancellingRunId(runId);
    try {
      const res = await fetch(`/api/runs/${runId}/cancel`, {
        method: "POST",
        headers: {
          "x-dashboard-pin": pin.trim(),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setDispatchFeedback({
          type: "error",
          text: data.error || "Không thể hủy workflow run.",
        });
        return;
      }
      setDispatchFeedback({
        type: "success",
        text: data.message || `Đã gửi yêu cầu hủy Run #${runId}.`,
      });
      window.setTimeout(() => fetchRuns(false, false), 1800);
    } catch (err) {
      setDispatchFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi khi gọi API hủy run.",
      });
    } finally {
      setCancellingRunId(null);
    }
  };

  // Select a run from History table
  const handleSelectRunRow = (runId: number) => {
    setSelectedRunId(runId);
    fetchRunDetail(runId, true);
  };

  // Compute live elapsed seconds for currently monitored run
  const monitoredRunElapsedSec = useMemo(() => {
    if (!runDetail?.run) return null;
    const r = runDetail.run;
    const startMs = Date.parse(r.runStartedAt || r.createdAt);
    if (!Number.isFinite(startMs)) return null;
    if (isRunActive(r)) {
      return Math.max(0, Math.round((nowMs - startMs) / 1000));
    }
    const endMs = Date.parse(r.updatedAt);
    if (!Number.isFinite(endMs)) return null;
    return Math.max(0, Math.round((endMs - startMs) / 1000));
  }, [runDetail, nowMs]);

  return (
    <div className="min-h-screen bg-[#090d16] bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(14,165,233,0.14),transparent)]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090d16]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.18)]">
              <Cloud className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                  Cloud Render Studio
                </h1>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-300">
                  Level 2 Telemetry
                </span>
              </div>
              <p className="font-mono text-xs text-slate-400">
                {repoLabel} • {branchLabel} • render-json-movie.yml
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {runDetail && (
              <span
                title={
                  runDetail.redisEnabled
                    ? "Upstash Redis đã kết nối — nhận trực tiếp % frame, FPS & ETA từ dàn VM"
                    : "Chưa cấu hình Upstash Redis — đang dùng chế độ fallback GitHub Jobs API"
                }
                className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
                  runDetail.redisEnabled
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-700 bg-slate-900/80 text-slate-400"
                }`}
              >
                <Database className="h-3 w-3" aria-hidden="true" />
                <span>
                  {runDetail.redisEnabled ? "Redis Live" : "GitHub Fallback"}
                </span>
              </span>
            )}

            {hasAnyActiveRun && (
              <div
                className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200"
                role="status"
                aria-live="polite"
              >
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                <span>Auto-Poll 4s</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                fetchEpisodes();
                fetchRuns(false, true);
              }}
              aria-label="Làm mới dữ liệu từ GitHub"
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/40 hover:bg-slate-800/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  loadingRuns || loadingDetail ? "animate-spin text-sky-400" : ""
                }`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>
      </header>

      {/* MISSING GITHUB_TOKEN BANNER */}
      {hasToken === false && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-200">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-amber-100">
                Chưa cấu hình biến môi trường{" "}
                <code className="font-mono">GITHUB_TOKEN</code>
              </p>
              <p className="mt-0.5 text-xs text-amber-200/85">
                Hãy thêm <code className="font-mono">GITHUB_TOKEN</code>,{" "}
                <code className="font-mono">UPSTASH_REDIS_REST_URL</code>,{" "}
                <code className="font-mono">UPSTASH_REDIS_REST_TOKEN</code> và{" "}
                <code className="font-mono">PROGRESS_SECRET</code> trên Vercel
                theo mẫu <code className="font-mono">.env.example</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ================================================================
              1. LAUNCH NEW CLOUD RENDER PANEL (LEFT 4 COLS ON DESKTOP)
             ================================================================ */}
          <section
            aria-labelledby="launch-heading"
            className="rounded-2xl border border-white/10 bg-[#111827]/85 p-5 shadow-2xl backdrop-blur-md lg:col-span-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="launch-heading"
                    className="text-base font-bold text-white"
                  >
                    Khởi chạy Render mới
                  </h2>
                  <p className="text-xs text-slate-400">
                    VieNeu-TTS (Hải Đăng) + Parallel VMs
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4">
              {/* Source Mode Tabs: Chọn trên GitHub | Tải .json từ máy */}
              <div
                role="tablist"
                aria-label="Nguồn kịch bản tập phim"
                className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-[#0b1120] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={sourceMode === "github"}
                  onClick={() => handleSwitchSourceMode("github")}
                  className={`flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    sourceMode === "github"
                      ? "bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.15)]"
                      : "border border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Chọn trên GitHub</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={sourceMode === "local"}
                  onClick={() => handleSwitchSourceMode("local")}
                  className={`flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    sourceMode === "local"
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                      : "border border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Tải .json từ máy</span>
                </button>
              </div>

              {sourceMode === "github" ? (
                /* TAB 1: Episode Dropdown on GitHub */
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="episode-select"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Tập kịch bản JSON
                    </label>
                    <span className="font-mono text-[11px] text-slate-400">
                      {loadingEpisodes
                        ? "Đang tải..."
                        : `${episodes.length} tập sẵn sàng`}
                    </span>
                  </div>

                  {episodes.length > 0 ? (
                    <select
                      id="episode-select"
                      value={selectedEpisode}
                      onChange={(e) => handleSelectEpisode(e.target.value)}
                      className="min-h-[44px] w-full cursor-pointer rounded-xl border border-white/10 bg-[#0b1120] px-3.5 py-2.5 font-mono text-xs text-slate-100 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                    >
                      {episodes.map((ep) => (
                        <option key={ep.path} value={ep.path}>
                          {ep.name} ({Math.max(1, Math.round(ep.size / 1024))} KB)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="episode-select"
                      type="text"
                      value={selectedEpisode}
                      onChange={(e) => handleSelectEpisode(e.target.value)}
                      placeholder="episodes/tai_sao_bi_say_xe_v20.json"
                      className="min-h-[44px] w-full rounded-xl border border-white/10 bg-[#0b1120] px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                    />
                  )}

                  {episodesError && (
                    <p className="mt-1.5 text-xs text-amber-300">{episodesError}</p>
                  )}
                </div>
              ) : (
                /* TAB 2: Drag & Drop or Pick Local .json File */
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      handleLocalFileChosen(f);
                      e.target.value = "";
                    }}
                    className="sr-only"
                    aria-label="Chọn file kịch bản JSON từ máy tính"
                  />

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingFile(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isDraggingFile) setIsDraggingFile(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingFile(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDraggingFile(false);
                      const dropped = e.dataTransfer.files?.[0];
                      handleLocalFileChosen(dropped);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-4 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isDraggingFile
                        ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                        : localDraft
                        ? "border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400/60"
                        : "border-slate-700 bg-[#0b1120]/90 text-slate-300 hover:border-sky-400/50 hover:bg-[#0e1628]"
                    }`}
                  >
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900/90 text-emerald-300">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <p className="text-xs font-semibold text-slate-100">
                      {localDraft
                        ? "Bấm hoặc kéo-thả để đổi file .json khác"
                        : "Kéo-thả file .json vào đây hoặc bấm để chọn"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Tự động commit lên{" "}
                      <code className="font-mono text-slate-300">
                        web-studio/episodes/
                      </code>{" "}
                      nhánh {branchLabel}
                    </p>
                  </div>

                  {localParseError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200"
                    >
                      <XCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
                        aria-hidden="true"
                      />
                      <span>{localParseError}</span>
                    </div>
                  )}

                  {localDraft && (
                    <div className="space-y-2.5 rounded-xl border border-emerald-500/30 bg-[#0b1120] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <FileText
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p
                              className="truncate text-xs font-bold text-white"
                              title={localDraft.title}
                            >
                              {localDraft.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="rounded-md border border-emerald-400/30 bg-emerald-500/15 px-1.5 py-0.5 font-mono font-semibold text-emerald-300">
                                {localDraft.beatsCount} beats
                              </span>
                              <span className="font-mono text-slate-400">
                                {Math.max(1, Math.round(localDraft.sizeBytes / 1024))} KB
                              </span>
                              {episodes.some(
                                (ep) => ep.name === localDraft.filename.trim()
                              ) ? (
                                <span className="rounded-md border border-amber-400/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                                  Ghi đè bản cũ
                                </span>
                              ) : (
                                <span className="rounded-md border border-sky-400/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">
                                  Tạo file mới
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setLocalDraft(null);
                            setUploadPhase("idle");
                            setLastUploadMeta(null);
                          }}
                          aria-label="Xóa file đã chọn"
                          className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <div>
                        <label
                          htmlFor="local-filename-input"
                          className="mb-1 block text-[11px] font-medium text-slate-400"
                        >
                          Tên file lưu trong{" "}
                          <code className="font-mono text-slate-300">
                            web-studio/episodes/
                          </code>
                        </label>
                        <input
                          id="local-filename-input"
                          type="text"
                          value={localDraft.filename}
                          onChange={(e) => handleLocalFilenameChange(e.target.value)}
                          className="min-h-[36px] w-full rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1.5 font-mono text-xs text-emerald-200 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3-Step Upload -> Commit -> Dispatch Progress Indicator */}
                  {uploadPhase !== "idle" && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="rounded-xl border border-white/10 bg-[#0b1120]/95 p-3"
                    >
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                        {/* Step 1: Uploading */}
                        <div
                          className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${
                            uploadPhase === "uploading"
                              ? "border-sky-400/50 bg-sky-500/15 text-sky-200"
                              : uploadPhase === "committed" ||
                                uploadPhase === "dispatched" ||
                                Boolean(lastUploadMeta?.commitSha)
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          {uploadPhase === "uploading" ? (
                            <Loader2
                              className="h-3.5 w-3.5 shrink-0 animate-spin"
                              aria-hidden="true"
                            />
                          ) : uploadPhase === "committed" ||
                            uploadPhase === "dispatched" ||
                            Boolean(lastUploadMeta?.commitSha) ? (
                            <CheckCircle2
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <XCircle
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <span className="truncate">Tải lên GitHub</span>
                        </div>

                        {/* Step 2: Committed */}
                        <div
                          className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${
                            uploadPhase === "committed" ||
                            uploadPhase === "dispatched" ||
                            Boolean(lastUploadMeta?.commitSha)
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : uploadPhase === "uploading"
                              ? "border-slate-800 bg-slate-900/70 text-slate-500"
                              : "border-rose-500/35 bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          {uploadPhase === "committed" ||
                          uploadPhase === "dispatched" ||
                          Boolean(lastUploadMeta?.commitSha) ? (
                            <CheckCircle2
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
                          )}
                          <span className="truncate">
                            {lastUploadMeta?.commitSha
                              ? `Commit ${lastUploadMeta.commitSha.slice(0, 7)}`
                              : "Đã commit"}
                          </span>
                        </div>

                        {/* Step 3: Dispatched VM */}
                        <div
                          className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 ${
                            uploadPhase === "dispatched"
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : uploadPhase === "committed"
                              ? "border-sky-400/50 bg-sky-500/15 text-sky-200"
                              : uploadPhase === "error" &&
                                Boolean(lastUploadMeta?.commitSha)
                              ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                              : "border-slate-800 bg-slate-900/70 text-slate-500"
                          }`}
                        >
                          {uploadPhase === "dispatched" ? (
                            <CheckCircle2
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : uploadPhase === "committed" ? (
                            <Loader2
                              className="h-3.5 w-3.5 shrink-0 animate-spin"
                              aria-hidden="true"
                            />
                          ) : uploadPhase === "error" &&
                            Boolean(lastUploadMeta?.commitSha) ? (
                            <XCircle
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
                          )}
                          <span className="truncate">Khởi chạy VM</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VM Count Selector (8 / 12 / 16 / 20) */}
              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Số lượng Máy ảo song song (VMs)
                </span>
                <div
                  role="radiogroup"
                  aria-label="Số lượng máy ảo render"
                  className="grid grid-cols-4 gap-2"
                >
                  {VM_COUNT_OPTIONS.map((count) => {
                    const active = vmCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={previewOnly}
                        onClick={() => setVmCount(count)}
                        className={`min-h-[44px] cursor-pointer rounded-xl border font-mono text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-40 ${
                          active
                            ? "border-sky-400 bg-sky-500/20 text-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.2)]"
                            : "border-white/10 bg-[#0b1120] text-slate-400 hover:border-white/25 hover:text-slate-200"
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Output MP4 Name */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="output-name-input"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Tên file MP4 xuất ra
                  </label>
                  {outputTouched && (
                    <button
                      type="button"
                      onClick={resetSuggestedOutput}
                      className="cursor-pointer text-[11px] font-medium text-sky-400 hover:text-sky-300"
                    >
                      Đặt lại gợi ý
                    </button>
                  )}
                </div>
                <input
                  id="output-name-input"
                  type="text"
                  value={outputName}
                  onChange={(e) => {
                    setOutputName(e.target.value);
                    setOutputTouched(true);
                  }}
                  placeholder="ten_tap_phim.mp4"
                  required
                  className="min-h-[44px] w-full rounded-xl border border-white/10 bg-[#0b1120] px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                />
              </div>

              {/* Preview Only Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1120]/90 px-3.5 py-3">
                <div className="pr-3">
                  <label
                    htmlFor="preview-only-toggle"
                    className="block cursor-pointer text-xs font-semibold text-slate-200"
                  >
                    Chế độ Preview-Only (~3 phút)
                  </label>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Chỉ xuất 4 ảnh đại diện kiểm tra bố cục, bỏ qua dàn VM
                  </p>
                </div>
                <button
                  id="preview-only-toggle"
                  type="button"
                  role="switch"
                  aria-checked={previewOnly}
                  onClick={() => setPreviewOnly((v) => !v)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    previewOnly
                      ? "border-sky-400/50 bg-sky-500"
                      : "border-slate-700 bg-slate-800"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                      previewOnly ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Dashboard PIN */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="dashboard-pin-input"
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    <KeyRound
                      className="h-3.5 w-3.5 text-slate-400"
                      aria-hidden="true"
                    />
                    <span>Mã PIN bảo vệ</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {pinRequired ? "Bắt buộc" : "Lưu localStorage"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="dashboard-pin-input"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    placeholder={
                      pinRequired ? "Nhập mã PIN..." : "Để trống nếu không đặt PIN"
                    }
                    autoComplete="off"
                    className="min-h-[44px] w-full rounded-xl border border-white/10 bg-[#0b1120] py-2.5 pl-3.5 pr-11 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((s) => !s)}
                    aria-label={showPin ? "Ẩn mã PIN" : "Hiện mã PIN"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-2 text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {dispatchFeedback && (
                <div
                  role="alert"
                  className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
                    dispatchFeedback.type === "success"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                  }`}
                >
                  {dispatchFeedback.type === "success" ? (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <ShieldAlert
                      className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
                      aria-hidden="true"
                    />
                  )}
                  <span>{dispatchFeedback.text}</span>
                </div>
              )}

              {/* Primary CTA: Run Cloud Render / Upload & Run Cloud Render */}
              <button
                type="submit"
                disabled={
                  dispatching ||
                  (sourceMode === "github"
                    ? !selectedEpisode
                    : !localDraft || Boolean(localParseError))
                }
                className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,197,94,0.32)] transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {dispatching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>
                      {sourceMode === "local"
                        ? "Đang tải lên GitHub & khởi chạy VM..."
                        : "Đang gửi lệnh lên GitHub..."}
                    </span>
                  </>
                ) : sourceMode === "local" ? (
                  <>
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {previewOnly
                        ? "Upload & Run Cloud Render (Preview)"
                        : `Upload & Run Cloud Render (${vmCount} VMs)`}
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    <span>
                      {previewOnly
                        ? "Run Preview Render (4 Stills)"
                        : `Run Cloud Render (${vmCount} VMs)`}
                    </span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* ================================================================
              2. LIVE 3-STAGE PIPELINE MONITOR (RIGHT 8 COLS ON DESKTOP)
             ================================================================ */}
          <section
            aria-labelledby="monitor-heading"
            className="rounded-2xl border border-white/10 bg-[#111827]/85 p-5 shadow-2xl backdrop-blur-md lg:col-span-8"
          >
            {/* Monitor Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                  <Activity className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="monitor-heading"
                      className="text-base font-bold text-white"
                    >
                      Live 3-Stage Pipeline Monitor
                    </h2>
                    {runDetail?.run && (
                      <span className="rounded-md border border-white/10 bg-slate-900 px-2 py-0.5 font-mono text-xs font-semibold text-sky-300">
                        Run #{runDetail.run.runNumber}
                      </span>
                    )}
                    {runDetail?.run &&
                      (() => {
                        const meta = getRunStatusMeta(
                          runDetail.run.status,
                          runDetail.run.conclusion
                        );
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`}
                            />
                            {meta.label}
                          </span>
                        );
                      })()}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {runDetail?.run
                      ? `${runDetail.run.displayTitle} • Khởi chạy ${formatRelativeTime(
                          runDetail.run.createdAt
                        )}`
                      : "Chọn một lần chạy hoặc nhấn Run Cloud Render để theo dõi trực tiếp"}
                  </p>
                </div>
              </div>

              {runDetail?.run && (
                <div className="flex flex-wrap items-center gap-2">
                  {isRunActive(runDetail.run) && (
                    <button
                      type="button"
                      onClick={() => handleCancelRun(runDetail.run.id)}
                      disabled={cancellingRunId === runDetail.run.id}
                      className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-50"
                    >
                      {cancellingRunId === runDetail.run.id ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Square
                          className="h-3.5 w-3.5 fill-current"
                          aria-hidden="true"
                        />
                      )}
                      <span>Cancel Run</span>
                    </button>
                  )}

                  <a
                    href={runDetail.run.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/10 bg-[#0b1120] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-400/40 hover:text-white"
                  >
                    <span>GitHub Logs</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>

            {loadingDetail && !runDetail ? (
              <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2
                  className="h-7 w-7 animate-spin text-sky-400"
                  aria-hidden="true"
                />
                <p className="text-xs">
                  Đang đồng bộ dàn máy ảo &amp; telemetry từ GitHub + Redis...
                </p>
              </div>
            ) : !runDetail ? (
              <div className="flex h-72 flex-col items-center justify-center gap-2 text-center text-slate-400">
                <Server className="h-9 w-9 text-slate-600" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-300">
                  Chưa có workflow run nào được chọn
                </p>
                <p className="max-w-md text-xs text-slate-500">
                  Khi kích hoạt Cloud Render, tiến độ % frame, FPS và ETA từng
                  máy ảo sẽ hiển thị trực tiếp tại đây.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                {/* OVERALL PROGRESS BAR + ELAPSED TIMER */}
                <div className="rounded-xl border border-white/10 bg-[#0b1120]/90 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="font-mono text-2xl font-bold text-white">
                        {runDetail.overallProgressPct}%
                      </span>
                      <span className="text-xs text-slate-300">
                        {runDetail.isPreviewOnly
                          ? "Chế độ Preview-Only (4 ảnh đại diện)"
                          : `Trung bình VM: ${runDetail.avgVmPercent}% • ${runDetail.stage2Summary.completed}/${runDetail.stage2Summary.total} VMs xong`}
                      </span>
                      {runDetail.telemetryFramesSummary.totalFrames > 0 && (
                        <span className="rounded-md border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] text-sky-200">
                          {formatNumber(
                            runDetail.telemetryFramesSummary.renderedFrames
                          )}{" "}
                          /{" "}
                          {formatNumber(
                            runDetail.telemetryFramesSummary.totalFrames
                          )}{" "}
                          frames
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/90 px-3 py-1 font-mono text-xs text-slate-200">
                      <Clock
                        className="h-3.5 w-3.5 text-sky-400"
                        aria-hidden="true"
                      />
                      <span>{formatDuration(monitoredRunElapsedSec)}</span>
                    </div>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={runDetail.overallProgressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        runDetail.run.conclusion === "failure"
                          ? "bg-rose-500"
                          : runDetail.overallProgressPct === 100
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
                      }`}
                      style={{ width: `${runDetail.overallProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* ============================================================
                    3-STAGE PIPELINE VISUALIZER
                   ============================================================ */}
                <div className="space-y-4">
                  {/* STAGE 1: Cloud VieNeu-TTS */}
                  <StageBannerCard
                    stageNumber={1}
                    title="Stage 1 — Cloud VieNeu-TTS (Hải Đăng)"
                    subtitle="Kiểm định kịch bản JSON & tổng hợp giọng đọc ONNX CPU int8"
                    icon={<Volume2 className="h-4 w-4" aria-hidden="true" />}
                    job={runDetail.stage1}
                    onInspect={() =>
                      setInspectedTarget({
                        title: "Stage 1 — Cloud VieNeu-TTS (Hải Đăng)",
                        job: runDetail.stage1,
                      })
                    }
                  />

                  <div
                    className="flex justify-center text-slate-600"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </div>

                  {/* STAGE 2: 16–20 VM Matrix Grid */}
                  <div className="rounded-xl border border-white/10 bg-[#0b1120]/80 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/20 font-mono text-xs font-bold text-sky-300">
                          2
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            Stage 2 — Lưới {runDetail.totalVms} Máy Ảo Render Song Song
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Bấm vào từng thẻ VM để xem chi tiết danh sách steps &amp; thời gian từng bước
                          </p>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                          Chờ ({runDetail.stage2Summary.queued})
                        </span>
                        <span className="inline-flex items-center gap-1 text-sky-300">
                          <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                          Đang chạy ({runDetail.stage2Summary.inProgress})
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Xong ({runDetail.stage2Summary.completed})
                        </span>
                        {runDetail.stage2Summary.failed > 0 && (
                          <span className="inline-flex items-center gap-1 text-rose-300">
                            <span className="h-2 w-2 rounded-full bg-rose-400" />
                            Lỗi ({runDetail.stage2Summary.failed})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-4">
                      {runDetail.stage2Vms.map((vm) => (
                        <VmCard
                          key={vm.vmIndex}
                          vm={vm}
                          onInspect={() =>
                            setInspectedTarget({
                              title: `VM ${String(vm.vmIndex).padStart(
                                2,
                                "0"
                              )} / ${vm.totalVms}`,
                              job: vm,
                              vm,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="flex justify-center text-slate-600"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </div>

                  {/* STAGE 3: FFmpeg Lossless Concat & Artifact */}
                  <StageBannerCard
                    stageNumber={3}
                    title="Stage 3 — FFmpeg Lossless Concat & Artifact"
                    subtitle="Ghép nối toàn bộ chunk (-c copy) & đóng gói MP4 thành phẩm"
                    icon={<Layers className="h-4 w-4" aria-hidden="true" />}
                    job={runDetail.stage3}
                    onInspect={() =>
                      setInspectedTarget({
                        title: "Stage 3 — FFmpeg Lossless Concat & Artifact",
                        job: runDetail.stage3,
                      })
                    }
                    actionSlot={
                      runDetail.run.status === "completed" &&
                      runDetail.run.conclusion === "success" ? (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/12 p-3">
                          <div className="flex items-center gap-2.5">
                            <Film
                              className="h-4 w-4 shrink-0 text-emerald-300"
                              aria-hidden="true"
                            />
                            <span className="text-xs font-semibold text-emerald-100">
                              {runDetail.primaryArtifact
                                ? `${runDetail.primaryArtifact.name} (${formatBytes(
                                    runDetail.primaryArtifact.sizeInBytes
                                  )})`
                                : "Video MP4 đã đóng gói trên GitHub Artifacts"}
                            </span>
                          </div>
                          <a
                            href={
                              runDetail.primaryArtifact
                                ? runDetail.primaryArtifact.artifactPageUrl
                                : `${runDetail.run.htmlUrl}#artifacts`
                            }
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-[0_0_18px_rgba(52,211,153,0.35)] transition hover:bg-emerald-300"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Mở trang tải Artifact (.mp4)</span>
                          </a>
                        </div>
                      ) : null
                    }
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ====================================================================
            3. RENDER HISTORY TABLE (RECENT 10 WORKFLOW RUNS)
           ==================================================================== */}
        <section
          aria-labelledby="history-heading"
          className="rounded-2xl border border-white/10 bg-[#111827]/85 p-5 shadow-2xl backdrop-blur-md"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <History className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="history-heading"
                  className="text-base font-bold text-white"
                >
                  Lịch sử Render (10 lần gần nhất)
                </h2>
                <p className="text-xs text-slate-400">
                  Bấm vào một dòng bất kỳ để xem lại chi tiết tiến độ dàn VM của
                  lần chạy đó
                </p>
              </div>
            </div>
          </div>

          {runsError && (
            <div className="mb-4 rounded-xl border border-rose-500/35 bg-rose-500/10 p-3 text-xs text-rose-200">
              {runsError}
            </div>
          )}

          {loadingRuns && runs.length === 0 ? (
            <div className="flex h-32 items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2
                className="h-4 w-4 animate-spin text-sky-400"
                aria-hidden="true"
              />
              <span>Đang tải lịch sử runs...</span>
            </div>
          ) : runs.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              Chưa có lịch sử chạy nào cho workflow render-json-movie.yml.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 pl-3 pr-3 font-semibold">Run</th>
                    <th className="px-3 py-2.5 font-semibold">
                      Tiêu đề / Sự kiện
                    </th>
                    <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                    <th className="px-3 py-2.5 font-semibold">Khởi tạo</th>
                    <th className="px-3 py-2.5 font-semibold">Thời lượng</th>
                    <th className="py-2.5 pl-3 pr-3 text-right font-semibold">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {runs.map((r) => {
                    const selected = r.id === selectedRunId;
                    const active = isRunActive(r);
                    const meta = getRunStatusMeta(r.status, r.conclusion);
                    const startMs = Date.parse(r.runStartedAt || r.createdAt);
                    const endMs = active ? nowMs : Date.parse(r.updatedAt);
                    const durSec =
                      Number.isFinite(startMs) && Number.isFinite(endMs)
                        ? Math.max(0, Math.round((endMs - startMs) / 1000))
                        : null;

                    return (
                      <tr
                        key={r.id}
                        onClick={() => handleSelectRunRow(r.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectRunRow(r.id);
                          }
                        }}
                        aria-selected={selected}
                        className={`cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 ${
                          selected ? "bg-sky-500/12" : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <td className="whitespace-nowrap py-3 pl-3 pr-3 font-mono font-bold text-sky-300">
                          #{r.runNumber}
                        </td>
                        <td className="max-w-[280px] truncate px-3 py-3 font-medium text-slate-100">
                          <div>{r.displayTitle}</div>
                          <div className="font-mono text-[11px] text-slate-400">
                            {r.branch} • {r.actorLogin || r.event}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`}
                            />
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-slate-300">
                          {formatRelativeTime(r.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-mono text-slate-300">
                          {formatDuration(durSec)}
                        </td>
                        <td className="whitespace-nowrap py-3 pl-3 pr-3 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {active && (
                              <button
                                type="button"
                                onClick={(e) => handleCancelRun(r.id, e)}
                                disabled={cancellingRunId === r.id}
                                className="inline-flex min-h-[32px] cursor-pointer items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-200 hover:bg-rose-500/25 disabled:opacity-50"
                              >
                                {cancellingRunId === r.id ? (
                                  <Loader2
                                    className="h-3 w-3 animate-spin"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <XCircle
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />
                                )}
                                <span>Cancel</span>
                              </button>
                            )}
                            <a
                              href={r.htmlUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Mở Run #${r.runNumber} trên GitHub`}
                              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-white/10 bg-[#0b1120] px-2.5 py-1 text-[11px] text-slate-300 hover:border-sky-400/40 hover:text-white"
                            >
                              <span>GitHub</span>
                              <ExternalLink
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ====================================================================
          STEP INSPECTOR DRAWER / MODAL (CLICK ANY VM OR STAGE CARD)
         ==================================================================== */}
      {inspectedTarget && (
        <StepInspectorDrawer
          title={inspectedTarget.title}
          job={inspectedTarget.job}
          vm={inspectedTarget.vm}
          onClose={() => setInspectedTarget(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Subcomponents: Stage Banner Card, Level-2 VM Card & Step Inspector Drawer
// ============================================================================

function StageBannerCard({
  stageNumber,
  title,
  subtitle,
  icon,
  job,
  onInspect,
  actionSlot,
}: {
  stageNumber: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  job: StageJobSummary;
  onInspect: () => void;
  actionSlot?: React.ReactNode;
}) {
  const theme = getStageCardTheme(job.visualState);
  const stepPct =
    job.visualState === "success"
      ? 100
      : job.totalSteps > 0
      ? Math.round((job.completedSteps / job.totalSteps) * 100)
      : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onInspect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onInspect();
        }
      }}
      className={`cursor-pointer rounded-xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${theme.border}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-xs font-bold text-white">
            {stageNumber}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sky-300">{icon}</span>
              <h3 className="text-sm font-bold text-white">{title}</h3>
            </div>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {job.durationSec !== null && (
            <span className="font-mono text-xs text-slate-300">
              {formatDuration(job.durationSec)}
            </span>
          )}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${theme.badge}`}
          >
            {theme.viLabel}
          </span>
          {job.htmlUrl && (
            <a
              href={job.htmlUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Xem log ${title}`}
              className="rounded-lg border border-white/10 bg-slate-900/70 p-1.5 text-slate-300 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {(job.currentStepName || job.totalSteps > 0) && (
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-mono text-[11px] text-slate-300">
              {job.currentStepName ||
                (job.visualState === "success"
                  ? "Đã hoàn thành tất cả các bước (bấm để xem chi tiết steps)"
                  : "Đang chờ cấp phát máy ảo Ubuntu...")}
            </span>
            {job.totalSteps > 0 && (
              <span className="shrink-0 font-mono text-[11px] text-slate-400">
                {job.completedSteps}/{job.totalSteps} steps
              </span>
            )}
          </div>
          {job.visualState === "in_progress" && job.totalSteps > 0 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-300"
                style={{ width: `${Math.max(8, stepPct)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {actionSlot}
    </div>
  );
}

function VmCard({
  vm,
  onInspect,
}: {
  vm: VmChunkStatus;
  onInspect: () => void;
}) {
  const theme = getStageCardTheme(vm.visualState);
  const tel = vm.telemetry;
  const hasRealFrames = Boolean(tel && tel.totalFrames > 0);
  const barWidth = Math.max(
    0,
    Math.min(
      100,
      vm.visualState === "success"
        ? 100
        : vm.visualState === "in_progress"
        ? Math.max(4, vm.effectivePercent)
        : vm.effectivePercent
    )
  );

  return (
    <button
      type="button"
      onClick={onInspect}
      className={`flex w-full cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${theme.border}`}
    >
      {/* Row 1: VM Number + Percent / Status Badge */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Cpu
            className={`h-3.5 w-3.5 ${
              vm.visualState === "in_progress"
                ? "text-sky-400"
                : vm.visualState === "success"
                ? "text-emerald-400"
                : vm.visualState === "error"
                ? "text-rose-400"
                : "text-slate-500"
            }`}
            aria-hidden="true"
          />
          <span className="font-mono text-xs font-bold text-white">
            VM {String(vm.vmIndex).padStart(2, "0")}
          </span>
        </div>

        <span
          className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold ${theme.badge}`}
        >
          {vm.visualState === "in_progress" || hasRealFrames
            ? `${Math.round(vm.effectivePercent)}%`
            : theme.viLabel}
        </span>
      </div>

      {/* Row 2: Smooth Progress Bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90">
        <div
          className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Row 3: Real Frame Telemetry OR Fallback Current Step */}
      <div className="mt-2 min-h-[34px]">
        {hasRealFrames && tel ? (
          <div className="space-y-0.5">
            <p className="font-mono text-[11px] font-semibold text-slate-100">
              {formatNumber(tel.renderedFrames)} / {formatNumber(tel.totalFrames)}{" "}
              <span className="text-[10px] font-normal text-slate-400">
                frames
              </span>
            </p>
            <div className="flex items-center justify-between font-mono text-[10px] text-sky-300">
              <span>{tel.fps > 0 ? `${tel.fps.toFixed(1)} fps` : tel.phase}</span>
              <span className="text-slate-400">
                {vm.visualState === "success" || tel.etaSec <= 0
                  ? "ETA 00:00"
                  : `ETA ${formatDuration(tel.etaSec)}`}
              </span>
            </div>
          </div>
        ) : vm.visualState === "in_progress" ? (
          <p
            title={vm.currentStepName || undefined}
            className="line-clamp-2 text-[11px] leading-snug text-sky-200"
          >
            {vm.currentStepName || "Đang khởi tạo máy ảo..."}
          </p>
        ) : vm.visualState === "error" ? (
          <p
            title={vm.currentStepName || undefined}
            className="line-clamp-2 text-[11px] leading-snug text-rose-300"
          >
            {vm.currentStepName || "Render thất bại"}
          </p>
        ) : vm.visualState === "success" ? (
          <p className="text-[11px] text-emerald-300/90">
            Chunk #{vm.vmIndex} hoàn tất
          </p>
        ) : vm.visualState === "skipped" ? (
          <p className="text-[11px] text-slate-400">Preview-Only</p>
        ) : (
          <p className="text-[11px] text-slate-500">
            {vm.currentStepName || "Chờ Stage 1..."}
          </p>
        )}
      </div>

      {/* Row 4: Footer Elapsed Duration & Step Count */}
      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 font-mono text-[10px] text-slate-400">
        <span>{formatDuration(vm.durationSec)}</span>
        <span className="text-slate-500">
          {vm.totalSteps > 0
            ? `${vm.completedSteps}/${vm.totalSteps} steps`
            : "Chi tiết →"}
        </span>
      </div>
    </button>
  );
}

function StepInspectorDrawer({
  title,
  job,
  vm,
  onClose,
}: {
  title: string;
  job: StageJobSummary;
  vm?: VmChunkStatus;
  onClose: () => void;
}) {
  const theme = getStageCardTheme(job.visualState);
  const tel = vm?.telemetry;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        className="flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#0d1424] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 id="drawer-title" className="text-base font-bold text-white">
                {title}
              </h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${theme.badge}`}
              >
                {theme.viLabel}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-400">{job.name}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ chi tiết"
            className="cursor-pointer rounded-xl border border-white/10 bg-slate-900 p-2 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* Telemetry Box if VM has real-time Redis telemetry */}
          {tel && tel.totalFrames > 0 && (
            <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-200">
                  <Gauge className="h-4 w-4 text-sky-400" aria-hidden="true" />
                  Telemetry Thời Gian Thực (Redis)
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {tel.percent.toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
                <div className="rounded-lg bg-slate-950/60 p-2.5">
                  <div className="text-[10px] text-slate-400">FRAMES</div>
                  <div className="mt-0.5 font-bold text-slate-100">
                    {formatNumber(tel.renderedFrames)}/{formatNumber(tel.totalFrames)}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2.5">
                  <div className="text-[10px] text-slate-400">TỐC ĐỘ</div>
                  <div className="mt-0.5 font-bold text-emerald-300">
                    {tel.fps > 0 ? `${tel.fps.toFixed(1)} fps` : "--"}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2.5">
                  <div className="text-[10px] text-slate-400">DỰ KIẾN (ETA)</div>
                  <div className="mt-0.5 font-bold text-amber-300">
                    {tel.etaSec > 0 ? formatDuration(tel.etaSec) : "00:00"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Steps List */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <ListChecks className="h-4 w-4 text-sky-400" aria-hidden="true" />
                Danh sách Steps ({job.completedSteps}/{job.totalSteps})
              </span>
              {job.durationSec !== null && (
                <span className="font-mono text-xs text-slate-400">
                  Tổng: {formatDuration(job.durationSec)}
                </span>
              )}
            </div>

            {job.steps.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 text-center text-xs text-slate-400">
                Máy ảo chưa khởi tạo danh sách bước thực thi trên GitHub Actions.
              </div>
            ) : (
              <div className="space-y-2">
                {job.steps.map((step) => {
                  const isRunning = step.status === "in_progress";
                  const isSuccess =
                    step.status === "completed" && step.conclusion === "success";
                  const isSkipped =
                    step.status === "completed" && step.conclusion === "skipped";
                  const isFailed =
                    step.status === "completed" &&
                    (step.conclusion === "failure" ||
                      step.conclusion === "timed_out");

                  return (
                    <div
                      key={step.number}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-xs ${
                        isRunning
                          ? "border-sky-400/50 bg-sky-500/12 text-sky-100"
                          : isFailed
                          ? "border-rose-500/50 bg-rose-500/12 text-rose-100"
                          : isSuccess
                          ? "border-white/10 bg-slate-900/75 text-slate-200"
                          : "border-white/5 bg-slate-900/35 text-slate-500"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        {isRunning ? (
                          <Loader2
                            className="h-4 w-4 shrink-0 animate-spin text-sky-400"
                            aria-hidden="true"
                          />
                        ) : isSuccess ? (
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-emerald-400"
                            aria-hidden="true"
                          />
                        ) : isFailed ? (
                          <XCircle
                            className="h-4 w-4 shrink-0 text-rose-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-600 font-mono text-[9px] text-slate-400">
                            {step.number}
                          </span>
                        )}
                        <span
                          className={`truncate ${
                            isSkipped ? "line-through opacity-60" : "font-medium"
                          }`}
                          title={step.name}
                        >
                          {step.number}. {step.name}
                        </span>
                      </div>

                      <span className="shrink-0 font-mono text-[11px] text-slate-400">
                        {isSkipped
                          ? "skipped"
                          : formatDuration(step.durationSec)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        {job.htmlUrl && (
          <div className="border-t border-white/10 p-4">
            <a
              href={job.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-xs font-bold text-sky-200 transition hover:bg-sky-500/25"
            >
              <span>Xem Raw Logs đầy đủ trên GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
