import crypto from "node:crypto";

export const WORKFLOW_FILE = "render-json-movie.yml";
export const WORKFLOW_NAME =
  "Render Handcrafted JSON Movie (Cloud VieNeu-TTS + 20 VMs @ 45fps)";

export const RENDER_QUALITY_OPTIONS = ["720p", "1080p", "1440p", "4k"] as const;
export type RenderQualityOption = (typeof RENDER_QUALITY_OPTIONS)[number];

export const RENDER_FPS_OPTIONS = [30, 45, 60] as const;
export type RenderFpsOption = (typeof RENDER_FPS_OPTIONS)[number];

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  pinRequired: boolean;
}

export function getRepoConfig(): RepoConfig {
  const owner = (process.env.GITHUB_OWNER || "duclee13").trim();
  const repo = (process.env.GITHUB_REPO || "cloud-renderer").trim();
  const branch = (process.env.GITHUB_BRANCH || "main").trim();
  const token = (process.env.GITHUB_TOKEN || "").trim();
  const pinRequired = Boolean((process.env.DASHBOARD_PIN || "").trim());

  return { owner, repo, branch, token, pinRequired };
}

export function timingSafeMatch(expected: string, provided: string): boolean {
  const expectedHash = crypto.createHash("sha256").update(expected).digest();
  const providedHash = crypto.createHash("sha256").update(provided).digest();
  return crypto.timingSafeEqual(expectedHash, providedHash);
}

export function verifyDashboardPin(req: Request): {
  ok: boolean;
  error?: string;
} {
  const expectedPin = (process.env.DASHBOARD_PIN || "").trim();
  if (!expectedPin) {
    return { ok: true };
  }

  const providedPin = (req.headers.get("x-dashboard-pin") || "").trim();
  if (!providedPin) {
    return {
      ok: false,
      error: "Vui lòng nhập mã PIN bảo mật để thực hiện thao tác này.",
    };
  }

  if (!timingSafeMatch(expectedPin, providedPin)) {
    return {
      ok: false,
      error: "Mã PIN không chính xác. Vui lòng kiểm tra lại.",
    };
  }

  return { ok: true };
}

export function verifyProgressSecret(req: Request): {
  ok: boolean;
  error?: string;
} {
  const expectedSecret = (process.env.PROGRESS_SECRET || "").trim();
  if (!expectedSecret) {
    return {
      ok: false,
      error: "PROGRESS_SECRET chưa được cấu hình trên server.",
    };
  }

  const providedSecret = (req.headers.get("x-progress-secret") || "").trim();
  if (!providedSecret || !timingSafeMatch(expectedSecret, providedSecret)) {
    return {
      ok: false,
      error: "Header x-progress-secret không hợp lệ.",
    };
  }

  return { ok: true };
}

export async function githubFetch(
  apiPath: string,
  init: RequestInit = {}
): Promise<Response> {
  const { token } = getRepoConfig();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("User-Agent", "cloud-renderer-dashboard/2.0");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = apiPath.startsWith("https://")
    ? apiPath
    : `https://api.github.com${apiPath.startsWith("/") ? "" : "/"}${apiPath}`;

  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function readGitHubError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.message === "string") {
      return `GitHub API (${res.status}): ${data.message}`;
    }
  } catch {
    // ignore JSON parse failure
  }
  return `GitHub API trả về mã lỗi HTTP ${res.status}`;
}

// ============================================================================
// Shared DTO Types (Server Routes <-> Dashboard Client)
// ============================================================================

export interface EpisodeFileItem {
  name: string;
  path: string;
  suggestedOutput: string;
  size: number;
  htmlUrl?: string;
}

export interface WorkflowRunSummary {
  id: number;
  runNumber: number;
  name: string;
  displayTitle: string;
  status: string;
  conclusion: string | null;
  event: string;
  branch: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  runStartedAt: string;
  actorLogin?: string;
  actorAvatar?: string;
}

export type StageVisualState =
  | "pending"
  | "queued"
  | "in_progress"
  | "success"
  | "error"
  | "cancelled"
  | "skipped";

export interface JobStepDetail {
  number: number;
  name: string;
  status: string; // "queued" | "in_progress" | "completed"
  conclusion: string | null; // "success" | "failure" | "skipped" | "cancelled" | null
  startedAt: string | null;
  completedAt: string | null;
  durationSec: number | null;
}

export interface VmRealtimeTelemetry {
  runId: string;
  vmIndex: number;
  totalVms: number;
  phase: string; // "bundling" | "rendering" | "muxing" | "completed"
  renderedFrames: number;
  totalFrames: number;
  percent: number; // 0..100
  fps: number;
  etaSec: number;
  updatedAt: string;
}

export interface StageJobSummary {
  id: number | null;
  name: string;
  visualState: StageVisualState;
  status: string;
  conclusion: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationSec: number | null;
  currentStepName: string | null;
  completedSteps: number;
  totalSteps: number;
  steps: JobStepDetail[];
  htmlUrl: string | null;
}

export interface VmChunkStatus extends StageJobSummary {
  vmIndex: number;
  totalVms: number;
  effectivePercent: number; // 0..100 (ưu tiên telemetry thật từ Redis, fallback sang tiến độ steps)
  telemetry: VmRealtimeTelemetry | null;
}

export interface RunArtifactItem {
  id: number;
  name: string;
  sizeInBytes: number;
  expired: boolean;
  createdAt: string;
  expiresAt: string;
  artifactPageUrl: string;
  isFinalMovie: boolean;
  isPreviewPack: boolean;
}

export interface RunDetailPayload {
  run: WorkflowRunSummary;
  isPreviewOnly: boolean;
  redisEnabled: boolean;
  totalVms: number;
  overallProgressPct: number;
  avgVmPercent: number;
  telemetryFramesSummary: {
    renderedFrames: number;
    totalFrames: number;
    activeTelemetryCount: number;
  };
  stage1: StageJobSummary;
  stage2Vms: VmChunkStatus[];
  stage2Summary: {
    completed: number;
    inProgress: number;
    failed: number;
    queued: number;
    total: number;
  };
  stage3: StageJobSummary;
  artifacts: RunArtifactItem[];
  primaryArtifact: RunArtifactItem | null;
  fetchedAt: string;
}
