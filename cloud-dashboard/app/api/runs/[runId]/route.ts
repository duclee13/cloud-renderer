import { NextResponse } from "next/server";
import {
  getRepoConfig,
  githubFetch,
  readGitHubError,
  WORKFLOW_FILE,
  type JobStepDetail,
  type RunArtifactItem,
  type RunDetailPayload,
  type StageJobSummary,
  type StageVisualState,
  type VmChunkStatus,
  type VmRealtimeTelemetry,
  type WorkflowRunSummary,
} from "@/lib/github";
import {
  getAllVmTelemetryFromRedis,
  isUpstashConfigured,
} from "@/lib/redis";

export const dynamic = "force-dynamic";

interface GitHubStepRaw {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
  started_at?: string | null;
  completed_at?: string | null;
}

interface GitHubJobRaw {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  html_url: string | null;
  steps?: GitHubStepRaw[];
}

interface GitHubArtifactRaw {
  id: number;
  name: string;
  size_in_bytes: number;
  expired: boolean;
  created_at: string;
  expires_at: string;
}

function mapVisualState(
  status: string,
  conclusion: string | null
): StageVisualState {
  if (status === "in_progress") return "in_progress";
  if (status === "queued" || status === "waiting" || status === "pending") {
    return "queued";
  }
  if (status === "completed") {
    if (conclusion === "success") return "success";
    if (conclusion === "skipped") return "skipped";
    if (conclusion === "cancelled") return "cancelled";
    return "error";
  }
  return "pending";
}

function computeDurationSec(
  startedAt: string | null | undefined,
  completedAt: string | null | undefined
): number | null {
  if (!startedAt) return null;
  const startMs = Date.parse(startedAt);
  if (!Number.isFinite(startMs)) return null;
  const endMs = completedAt ? Date.parse(completedAt) : Date.now();
  if (!Number.isFinite(endMs)) return null;
  return Math.max(0, Math.round((endMs - startMs) / 1000));
}

function summarizeJob(
  job: GitHubJobRaw | undefined,
  fallbackName: string
): StageJobSummary {
  if (!job) {
    return {
      id: null,
      name: fallbackName,
      visualState: "pending",
      status: "pending",
      conclusion: null,
      startedAt: null,
      completedAt: null,
      durationSec: null,
      currentStepName: null,
      completedSteps: 0,
      totalSteps: 0,
      steps: [],
      htmlUrl: null,
    };
  }

  const rawSteps = Array.isArray(job.steps) ? job.steps : [];
  const steps: JobStepDetail[] = rawSteps.map((s) => ({
    number: s.number,
    name: s.name,
    status: s.status,
    conclusion: s.conclusion ?? null,
    startedAt: s.started_at ?? null,
    completedAt: s.completed_at ?? null,
    durationSec: computeDurationSec(s.started_at, s.completed_at),
  }));

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const inProgressStep = steps.find((s) => s.status === "in_progress");
  const failedStep = steps.find(
    (s) => s.conclusion === "failure" || s.conclusion === "timed_out"
  );
  const visualState = mapVisualState(job.status, job.conclusion);

  const currentStepName =
    visualState === "in_progress"
      ? inProgressStep?.name || "Đang khởi tạo runner..."
      : visualState === "error"
      ? failedStep?.name || "Bước thực thi gặp lỗi"
      : null;

  return {
    id: job.id,
    name: job.name || fallbackName,
    visualState,
    status: job.status,
    conclusion: job.conclusion ?? null,
    startedAt: job.started_at ?? null,
    completedAt: job.completed_at ?? null,
    durationSec: computeDurationSec(job.started_at, job.completed_at),
    currentStepName,
    completedSteps,
    totalSteps,
    steps,
    htmlUrl: job.html_url ?? null,
  };
}

function jobStepFraction(stage: StageJobSummary): number {
  if (stage.visualState === "success" || stage.visualState === "skipped") {
    return 1;
  }
  if (stage.visualState === "in_progress") {
    if (stage.totalSteps > 0) {
      return Math.min(
        0.95,
        Math.max(0.06, (stage.completedSteps + 0.4) / stage.totalSteps)
      );
    }
    return 0.25;
  }
  return 0;
}

function resolveVmEffectivePercent(
  summary: StageJobSummary,
  telemetry: VmRealtimeTelemetry | null
): number {
  if (summary.visualState === "success" || summary.visualState === "skipped") {
    return 100;
  }
  if (telemetry && Number.isFinite(telemetry.percent)) {
    if (summary.visualState === "in_progress") {
      return Math.max(2, Math.min(99.5, telemetry.percent));
    }
    return Math.max(0, Math.min(100, telemetry.percent));
  }
  if (summary.visualState === "in_progress") {
    // Trước khi tới bước renderMedia (đang checkout / apt-get / npm ci), phản ánh mượt tối đa ~18%
    return Math.round(jobStepFraction(summary) * 22);
  }
  return 0;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ runId: string }> }
) {
  const { runId } = await context.params;
  if (!/^\d+$/.test(runId)) {
    return NextResponse.json(
      { error: "runId không hợp lệ." },
      { status: 400 }
    );
  }

  const { owner, repo, branch } = getRepoConfig();
  const urlObj = new URL(req.url);
  const expectedVmsParam = Number(urlObj.searchParams.get("expectedVms") || 16);
  const fallbackVms = [8, 12, 16, 18, 20].includes(expectedVmsParam)
    ? expectedVmsParam
    : 16;

  try {
    const baseRepoPath = `/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}`;

    // Gọi song song GitHub Run + Jobs (per_page=100) + Artifacts + Redis HGETALL render_run:{runId}
    const [runRes, jobsRes, artifactsRes, telemetryMap] = await Promise.all([
      githubFetch(`${baseRepoPath}/actions/runs/${runId}`),
      githubFetch(`${baseRepoPath}/actions/runs/${runId}/jobs?per_page=100`),
      githubFetch(
        `${baseRepoPath}/actions/runs/${runId}/artifacts?per_page=100`
      ),
      getAllVmTelemetryFromRedis(runId),
    ]);

    if (!runRes.ok) {
      const errMsg = await readGitHubError(runRes);
      return NextResponse.json({ error: errMsg }, { status: runRes.status });
    }

    const runRaw = await runRes.json();
    const jobsData = jobsRes.ok
      ? ((await jobsRes.json()) as { jobs?: GitHubJobRaw[] })
      : { jobs: [] };
    const artifactsData = artifactsRes.ok
      ? ((await artifactsRes.json()) as { artifacts?: GitHubArtifactRaw[] })
      : { artifacts: [] };

    const rawJobs = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];
    const rawArtifacts = Array.isArray(artifactsData.artifacts)
      ? artifactsData.artifacts
      : [];

    const run: WorkflowRunSummary = {
      id: runRaw.id,
      runNumber: runRaw.run_number,
      name: runRaw.name || WORKFLOW_FILE,
      displayTitle:
        runRaw.display_title || runRaw.name || `Run #${runRaw.run_number}`,
      status: runRaw.status || "queued",
      conclusion: runRaw.conclusion ?? null,
      event: runRaw.event || "workflow_dispatch",
      branch: runRaw.head_branch || branch,
      htmlUrl: runRaw.html_url,
      createdAt: runRaw.created_at,
      updatedAt: runRaw.updated_at,
      runStartedAt: runRaw.run_started_at || runRaw.created_at,
      actorLogin: runRaw.actor?.login,
      actorAvatar: runRaw.actor?.avatar_url,
    };

    // 1. Stage 1: Job 1 — Load JSON Script + VieNeu-TTS (Hải Đăng)
    const stage1Raw = rawJobs.find((j) =>
      /^Job\s*1\b|VieNeu-TTS|Load JSON Script/i.test(j.name)
    );
    const stage1 = summarizeJob(
      stage1Raw,
      "Job 1 — Load JSON Script + VieNeu-TTS (Hải Đăng)"
    );

    // 2. Stage 2: Job 2 — Render Chunk M/N
    const parsedChunks = new Map<
      number,
      { job: GitHubJobRaw; declaredTotal: number }
    >();
    let detectedTotalVms = 0;
    let skippedStage2Job: GitHubJobRaw | undefined;

    for (const j of rawJobs) {
      const chunkMatch = j.name.match(/Render Chunk\s+(\d+)\s*\/\s*(\d+)/i);
      if (chunkMatch) {
        const vmIdx = Number(chunkMatch[1]);
        const vmTotal = Number(chunkMatch[2]);
        if (vmIdx >= 1 && vmIdx <= 64) {
          parsedChunks.set(vmIdx, { job: j, declaredTotal: vmTotal });
          if (vmTotal > detectedTotalVms) detectedTotalVms = vmTotal;
        }
      } else if (
        /^Job\s*2\b|render_chunks/i.test(j.name) &&
        j.conclusion === "skipped"
      ) {
        skippedStage2Job = j;
      }
    }

    for (const t of telemetryMap.values()) {
      if (t.totalVms > detectedTotalVms) {
        detectedTotalVms = t.totalVms;
      }
    }

    // 3. Stage 3: Job 3 — Stitch Final Handcrafted Movie (FFmpeg Lossless)
    const stage3Raw = rawJobs.find((j) =>
      /^Job\s*3\b|Stitch Final|stitch_final_movie/i.test(j.name)
    );
    const stage3 = summarizeJob(
      stage3Raw,
      "Job 3 — Stitch Final Handcrafted Movie (FFmpeg Lossless)"
    );

    // 4. Artifacts
    const artifacts: RunArtifactItem[] = rawArtifacts.map((a) => ({
      id: a.id,
      name: a.name,
      sizeInBytes: a.size_in_bytes,
      expired: Boolean(a.expired),
      createdAt: a.created_at,
      expiresAt: a.expires_at,
      artifactPageUrl: `https://github.com/${owner}/${repo}/actions/runs/${run.id}/artifacts/${a.id}`,
      isFinalMovie: /^final-handcrafted-movie-/i.test(a.name),
      isPreviewPack: /^preview-handcrafted-movie-/i.test(a.name),
    }));

    const primaryArtifact =
      artifacts.find((a) => a.isFinalMovie && !a.expired) ||
      artifacts.find((a) => a.isPreviewPack && !a.expired) ||
      null;

    const isPreviewOnly = Boolean(
      artifacts.some((a) => a.isPreviewPack) ||
        (skippedStage2Job && stage3.visualState === "skipped") ||
        (stage1.visualState === "success" &&
          parsedChunks.size === 0 &&
          stage3.visualState === "skipped")
    );

    const totalVms =
      detectedTotalVms > 0
        ? detectedTotalVms
        : parsedChunks.size > 0
        ? Math.max(...parsedChunks.keys())
        : telemetryMap.size > 0
        ? Math.max(...telemetryMap.keys())
        : fallbackVms;

    const stage2Vms: VmChunkStatus[] = Array.from(
      { length: totalVms },
      (_, idx) => {
        const vmIndex = idx + 1;
        const found = parsedChunks.get(vmIndex);
        const rawTel = telemetryMap.get(vmIndex) || null;

        if (found) {
          const base = summarizeJob(
            found.job,
            `Job 2 — Render Chunk ${vmIndex}/${totalVms}`
          );
          const telemetry: VmRealtimeTelemetry | null = rawTel
            ? base.visualState === "success"
              ? {
                  ...rawTel,
                  phase: "completed",
                  renderedFrames:
                    rawTel.totalFrames > 0
                      ? rawTel.totalFrames
                      : rawTel.renderedFrames,
                  percent: 100,
                  etaSec: 0,
                }
              : rawTel
            : null;
          return {
            ...base,
            vmIndex,
            totalVms,
            effectivePercent: resolveVmEffectivePercent(base, telemetry),
            telemetry,
          };
        }

        if (isPreviewOnly) {
          return {
            id: null,
            name: `Job 2 — Render Chunk ${vmIndex}/${totalVms}`,
            visualState: "skipped",
            status: "completed",
            conclusion: "skipped",
            startedAt: null,
            completedAt: null,
            durationSec: null,
            currentStepName: "Bỏ qua (Preview-Only)",
            completedSteps: 0,
            totalSteps: 0,
            steps: [],
            htmlUrl: null,
            vmIndex,
            totalVms,
            effectivePercent: 100,
            telemetry: null,
          };
        }

        const runDoneWithoutSpawning = run.status === "completed";
        const placeholderState: StageVisualState = runDoneWithoutSpawning
          ? "cancelled"
          : rawTel
          ? "in_progress"
          : "pending";
        return {
          id: null,
          name: `Job 2 — Render Chunk ${vmIndex}/${totalVms}`,
          visualState: placeholderState,
          status: runDoneWithoutSpawning
            ? "completed"
            : rawTel
            ? "in_progress"
            : "pending",
          conclusion: runDoneWithoutSpawning ? "cancelled" : null,
          startedAt: null,
          completedAt: null,
          durationSec: null,
          currentStepName: runDoneWithoutSpawning
            ? null
            : "Chờ Stage 1 hoàn tất...",
          completedSteps: 0,
          totalSteps: 0,
          steps: [],
          htmlUrl: null,
          vmIndex,
          totalVms,
          effectivePercent: rawTel ? rawTel.percent : 0,
          telemetry: rawTel,
        };
      }
    );

    const stage2Summary = {
      completed: stage2Vms.filter((v) => v.visualState === "success").length,
      inProgress: stage2Vms.filter((v) => v.visualState === "in_progress")
        .length,
      failed: stage2Vms.filter(
        (v) => v.visualState === "error" || v.visualState === "cancelled"
      ).length,
      queued: stage2Vms.filter(
        (v) => v.visualState === "pending" || v.visualState === "queued"
      ).length,
      total: totalVms,
    };

    // Thống kê tổng số frame thực tế từ các VM đã gửi telemetry
    let sumRenderedFrames = 0;
    let sumTotalFrames = 0;
    let activeTelemetryCount = 0;
    for (const vm of stage2Vms) {
      if (vm.telemetry && vm.telemetry.totalFrames > 0) {
        sumRenderedFrames += vm.telemetry.renderedFrames;
        sumTotalFrames += vm.telemetry.totalFrames;
        activeTelemetryCount++;
      }
    }

    const avgVmPercent =
      totalVms > 0
        ? Number(
            (
              stage2Vms.reduce((sum, vm) => sum + vm.effectivePercent, 0) /
              totalVms
            ).toFixed(1)
          )
        : 0;

    // 5. Tính phần trăm tiến độ tổng thể (0..100%) dựa trên trung bình thực tế tất cả VM
    let overallProgressPct = 0;
    if (run.status === "completed" && run.conclusion === "success") {
      overallProgressPct = 100;
    } else if (isPreviewOnly) {
      overallProgressPct = Math.round(jobStepFraction(stage1) * 100);
    } else if (
      stage2Summary.inProgress > 0 ||
      stage2Summary.completed > 0 ||
      activeTelemetryCount > 0
    ) {
      if (stage3.visualState === "in_progress") {
        overallProgressPct = Math.min(
          99,
          Math.round(92 + jobStepFraction(stage3) * 7)
        );
      } else {
        // Khi đang ở Stage 2, phản ánh trực tiếp trung bình thực tế của dàn VM (kèm 10% nền Stage 1 đã xong)
        overallProgressPct = Math.min(
          99,
          Math.max(10, Math.round(10 + avgVmPercent * 0.82))
        );
      }
    } else {
      overallProgressPct = Math.round(jobStepFraction(stage1) * 10);
    }

    const payload: RunDetailPayload = {
      run,
      isPreviewOnly,
      redisEnabled: isUpstashConfigured(),
      totalVms,
      overallProgressPct,
      avgVmPercent,
      telemetryFramesSummary: {
        renderedFrames: sumRenderedFrames,
        totalFrames: sumTotalFrames,
        activeTelemetryCount,
      },
      stage1,
      stage2Vms,
      stage2Summary,
      stage3,
      artifacts,
      primaryArtifact,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Không thể tải chi tiết jobs/artifacts của workflow run.",
      },
      { status: 500 }
    );
  }
}
