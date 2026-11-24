import { NextResponse } from "next/server";
import {
  getRepoConfig,
  githubFetch,
  readGitHubError,
  WORKFLOW_FILE,
  type WorkflowRunSummary,
} from "@/lib/github";

export const dynamic = "force-dynamic";

interface GitHubRunRaw {
  id: number;
  run_number: number;
  name?: string;
  display_title?: string;
  status?: string;
  conclusion?: string | null;
  event?: string;
  head_branch?: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at?: string;
  actor?: {
    login?: string;
    avatar_url?: string;
  };
}

export async function GET() {
  const { owner, repo, branch } = getRepoConfig();

  try {
    const res = await githubFetch(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/actions/workflows/${encodeURIComponent(WORKFLOW_FILE)}/runs?per_page=10`
    );

    if (!res.ok) {
      const errMsg = await readGitHubError(res);
      return NextResponse.json(
        { error: errMsg, runs: [], repo: `${owner}/${repo}`, branch },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { workflow_runs?: GitHubRunRaw[] };
    const rawRuns = Array.isArray(data.workflow_runs) ? data.workflow_runs : [];

    const runs: WorkflowRunSummary[] = rawRuns.map((r) => ({
      id: r.id,
      runNumber: r.run_number,
      name: r.name || WORKFLOW_FILE,
      displayTitle: r.display_title || r.name || `Run #${r.run_number}`,
      status: r.status || "queued",
      conclusion: r.conclusion ?? null,
      event: r.event || "workflow_dispatch",
      branch: r.head_branch || branch,
      htmlUrl: r.html_url,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      runStartedAt: r.run_started_at || r.created_at,
      actorLogin: r.actor?.login,
      actorAvatar: r.actor?.avatar_url,
    }));

    return NextResponse.json({
      runs,
      repo: `${owner}/${repo}`,
      branch,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách workflow runs từ GitHub.",
        runs: [],
        repo: `${owner}/${repo}`,
        branch,
      },
      { status: 500 }
    );
  }
}
