import { NextResponse } from "next/server";
import {
  getRepoConfig,
  githubFetch,
  readGitHubError,
  WORKFLOW_FILE,
  WORKFLOW_NAME,
  type EpisodeFileItem,
} from "@/lib/github";

export const dynamic = "force-dynamic";

interface GitHubContentEntry {
  name: string;
  path: string;
  size: number;
  type: string;
  html_url?: string;
}

export async function GET() {
  const { owner, repo, branch, token, pinRequired } = getRepoConfig();

  try {
    const res = await githubFetch(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/contents/web-studio/episodes?ref=${encodeURIComponent(branch)}`
    );

    if (!res.ok) {
      const errMsg = await readGitHubError(res);
      const hint = !token
        ? " (Chưa cấu hình biến môi trường GITHUB_TOKEN trên server)"
        : "";
      return NextResponse.json(
        {
          error: `${errMsg}${hint}`,
          episodes: [],
          repo: `${owner}/${repo}`,
          branch,
          workflowFile: WORKFLOW_FILE,
          workflowName: WORKFLOW_NAME,
          hasToken: Boolean(token),
          pinRequired,
        },
        { status: res.status }
      );
    }

    const raw = (await res.json()) as unknown;
    const entries: GitHubContentEntry[] = Array.isArray(raw) ? raw : [];

    const episodes: EpisodeFileItem[] = entries
      .filter(
        (item) =>
          item.type === "file" &&
          item.name.toLowerCase().endsWith(".json") &&
          item.name !== "current_episode.json"
      )
      .map((item) => ({
        name: item.name,
        path: `episodes/${item.name}`,
        suggestedOutput: item.name.replace(/\.json$/i, ".mp4"),
        size: item.size,
        htmlUrl: item.html_url,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));

    return NextResponse.json({
      episodes,
      repo: `${owner}/${repo}`,
      branch,
      workflowFile: WORKFLOW_FILE,
      workflowName: WORKFLOW_NAME,
      hasToken: Boolean(token),
      pinRequired,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Không thể kết nối GitHub Contents API.",
        episodes: [],
        repo: `${owner}/${repo}`,
        branch,
        workflowFile: WORKFLOW_FILE,
        workflowName: WORKFLOW_NAME,
        hasToken: Boolean(token),
        pinRequired,
      },
      { status: 500 }
    );
  }
}
