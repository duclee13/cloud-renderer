import { NextResponse } from "next/server";
import {
  getRepoConfig,
  githubFetch,
  readGitHubError,
  verifyDashboardPin,
} from "@/lib/github";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ runId: string }> }
) {
  const pinCheck = verifyDashboardPin(req);
  if (!pinCheck.ok) {
    return NextResponse.json({ error: pinCheck.error }, { status: 401 });
  }

  const { runId } = await context.params;
  if (!/^\d+$/.test(runId)) {
    return NextResponse.json(
      { error: "runId không hợp lệ." },
      { status: 400 }
    );
  }

  const { owner, repo, token } = getRepoConfig();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Thiếu biến môi trường GITHUB_TOKEN trên server. Không thể hủy workflow run.",
      },
      { status: 500 }
    );
  }

  try {
    const res = await githubFetch(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/actions/runs/${runId}/cancel`,
      { method: "POST" }
    );

    if (res.status === 409) {
      return NextResponse.json({
        ok: true,
        message: "Workflow run này đã kết thúc trước đó.",
      });
    }

    if (!res.ok) {
      const errMsg = await readGitHubError(res);
      return NextResponse.json({ error: errMsg }, { status: res.status });
    }

    return NextResponse.json({
      ok: true,
      message: `Đã gửi lệnh hủy Run #${runId} trên GitHub Actions.`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Không thể kết nối GitHub API để hủy workflow run.",
      },
      { status: 500 }
    );
  }
}
