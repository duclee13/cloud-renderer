import { NextResponse } from "next/server";
import {
  getRepoConfig,
  githubFetch,
  readGitHubError,
  RENDER_QUALITY_OPTIONS,
  verifyDashboardPin,
  WORKFLOW_FILE,
  type RenderQualityOption,
} from "@/lib/github";

export const dynamic = "force-dynamic";

interface DispatchBody {
  episode_file?: string;
  total_chapters?: string | number;
  quality?: string;
  fps?: string | number;
  output_name?: string;
  preview_only?: boolean;
}

const ALLOWED_VMS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
]);
const ALLOWED_QUALITIES = new Set<string>(RENDER_QUALITY_OPTIONS);
const ALLOWED_FPS = new Set([30, 40, 45, 60]);

export async function POST(req: Request) {
  const pinCheck = verifyDashboardPin(req);
  if (!pinCheck.ok) {
    return NextResponse.json({ error: pinCheck.error }, { status: 401 });
  }

  const { owner, repo, branch, token } = getRepoConfig();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Thiếu biến môi trường GITHUB_TOKEN trên server. Hãy cấu hình GITHUB_TOKEN (quyền Actions: Read & Write).",
      },
      { status: 500 }
    );
  }

  let body: DispatchBody;
  try {
    body = (await req.json()) as DispatchBody;
  } catch {
    return NextResponse.json(
      { error: "Body JSON gửi lên không hợp lệ." },
      { status: 400 }
    );
  }

  const rawEpisode = String(body.episode_file || "")
    .trim()
    .replace(/^web-studio\//, "")
    .replace(/^\/+/, "");
  if (!rawEpisode || !rawEpisode.toLowerCase().endsWith(".json") || rawEpisode.includes("..")) {
    return NextResponse.json(
      { error: "Đường dẫn episode_file không hợp lệ (cần file .json trong episodes/)." },
      { status: 400 }
    );
  }
  const episodeFile = rawEpisode.startsWith("episodes/")
    ? rawEpisode
    : `episodes/${rawEpisode}`;

  const chaptersNum = Number(body.total_chapters ?? 20);
  if (!Number.isInteger(chaptersNum) || !ALLOWED_VMS.has(chaptersNum)) {
    return NextResponse.json(
      {
        error:
          "Số lượng máy ảo (total_chapters) không hợp lệ với matrix của render-json-movie.yml (hỗ trợ 1–20).",
      },
      { status: 400 }
    );
  }

  const normalizedQuality = String(body.quality || "1080p")
    .trim()
    .toLowerCase();
  if (!ALLOWED_QUALITIES.has(normalizedQuality)) {
    return NextResponse.json(
      {
        error:
          "Tham số quality không hợp lệ (chỉ hỗ trợ 720p, 1080p, 1440p, 4k).",
      },
      { status: 400 }
    );
  }
  const quality = normalizedQuality as RenderQualityOption;

  const fpsNum = Number(body.fps ?? 45);
  if (!Number.isInteger(fpsNum) || !ALLOWED_FPS.has(fpsNum)) {
    return NextResponse.json(
      {
        error: "Tham số fps không hợp lệ (hỗ trợ 30, 45, 60).",
      },
      { status: 400 }
    );
  }

  const fallbackOut = episodeFile
    .replace(/^episodes\//, "")
    .replace(/\.json$/i, ".mp4");
  const rawOutput = String(body.output_name || fallbackOut)
    .trim()
    .replace(/[\\/]+/g, "_")
    .replace(/\.\.+/g, ".");
  const outputName = rawOutput.toLowerCase().endsWith(".mp4")
    ? rawOutput
    : `${rawOutput}.mp4`;

  const previewOnly = Boolean(body.preview_only);

  try {
    const res = await githubFetch(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/actions/workflows/${encodeURIComponent(WORKFLOW_FILE)}/dispatches`,
      {
        method: "POST",
        body: JSON.stringify({
          ref: branch,
          inputs: {
            episode_file: episodeFile,
            total_chapters: String(chaptersNum),
            quality,
            fps: String(fpsNum),
            output_name: outputName,
            preview_only: previewOnly,
          },
        }),
      }
    );

    if (!res.ok) {
      const errMsg = await readGitHubError(res);
      return NextResponse.json({ error: errMsg }, { status: res.status });
    }

    return NextResponse.json({
      ok: true,
      message: previewOnly
        ? `Đã kích hoạt Preview Render (4 ảnh đại diện) cho ${episodeFile}!`
        : `Đã kích hoạt Cloud Render (${chaptersNum} VMs • ${quality.toUpperCase()} @ ${fpsNum}fps) cho ${episodeFile} -> ${outputName}!`,
      dispatched: {
        ref: branch,
        episode_file: episodeFile,
        total_chapters: String(chaptersNum),
        quality,
        fps: String(fpsNum),
        output_name: outputName,
        preview_only: previewOnly,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Lỗi kết nối khi gọi GitHub workflow_dispatch.",
      },
      { status: 500 }
    );
  }
}
