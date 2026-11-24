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

interface UploadEpisodeBody {
  filename?: string;
  content?: string;
  autoDispatch?: boolean;
  totalChapters?: string | number;
  quality?: string;
  fps?: string | number;
  outputName?: string;
  previewOnly?: boolean;
}

const ALLOWED_FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;
const ALLOWED_VM_COUNTS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
]);
const ALLOWED_QUALITIES = new Set<string>(RENDER_QUALITY_OPTIONS);
const ALLOWED_FPS = new Set([30, 40, 45, 60]);

export async function POST(req: Request) {
  // 1. Kiểm tra bảo mật x-dashboard-pin bằng timingSafeEqual giống /api/dispatch
  const pinCheck = verifyDashboardPin(req);
  if (!pinCheck.ok) {
    return NextResponse.json(
      {
        error:
          pinCheck.error ||
          "Mã PIN bảo mật không chính xác hoặc còn trống (401).",
      },
      { status: 401 }
    );
  }

  const { owner, repo, branch, token } = getRepoConfig();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Thiếu biến môi trường GITHUB_TOKEN trên server. Hãy cấu hình GITHUB_TOKEN với quyền Contents: Read and write và Actions: Read and write.",
      },
      { status: 500 }
    );
  }

  // 2. Đọc và kiểm tra JSON body
  let body: UploadEpisodeBody;
  try {
    body = (await req.json()) as UploadEpisodeBody;
  } catch {
    return NextResponse.json(
      { error: "Body JSON gửi lên không hợp lệ." },
      { status: 400 }
    );
  }

  const filename = String(body.filename || "").trim();
  if (
    !filename ||
    !ALLOWED_FILENAME_REGEX.test(filename) ||
    !filename.endsWith(".json") ||
    filename === ".json" ||
    filename.includes("..")
  ) {
    return NextResponse.json(
      {
        error:
          "Tên file không hợp lệ: chỉ cho phép ký tự [a-zA-Z0-9._-], không chứa '..' và phải kết thúc bằng .json.",
      },
      { status: 400 }
    );
  }

  if (filename === "current_episode.json") {
    return NextResponse.json(
      {
        error:
          "Không được ghi đè trực tiếp file hệ thống current_episode.json. Hãy đặt tên riêng cho tập phim (ví dụ: tap_01.json).",
      },
      { status: 400 }
    );
  }

  if (typeof body.content !== "string" || !body.content.trim()) {
    return NextResponse.json(
      { error: "Nội dung file kịch bản (.json) đang trống." },
      { status: 400 }
    );
  }

  const rawContent = body.content;
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawContent);
  } catch (err) {
    return NextResponse.json(
      {
        error: `File JSON bị lỗi cú pháp: ${
          err instanceof Error ? err.message : "Không thể parse JSON"
        }.`,
      },
      { status: 400 }
    );
  }

  if (
    !parsedJson ||
    typeof parsedJson !== "object" ||
    Array.isArray(parsedJson) ||
    !Array.isArray((parsedJson as { beats?: unknown }).beats) ||
    (parsedJson as { beats: unknown[] }).beats.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "Kịch bản JSON thiếu mảng 'beats' hợp lệ (cần ít nhất 1 beat trong trường 'beats').",
      },
      { status: 400 }
    );
  }

  const autoDispatch = Boolean(body.autoDispatch);
  const chaptersNum = Number(body.totalChapters ?? 20);
  if (autoDispatch && (!Number.isInteger(chaptersNum) || !ALLOWED_VM_COUNTS.has(chaptersNum))) {
    return NextResponse.json(
      {
        error:
          "Số lượng máy ảo (totalChapters) không hợp lệ với matrix của render-json-movie.yml (hỗ trợ 1–20).",
      },
      { status: 400 }
    );
  }

  const normalizedQuality = String(body.quality || "1080p")
    .trim()
    .toLowerCase();
  if (autoDispatch && !ALLOWED_QUALITIES.has(normalizedQuality)) {
    return NextResponse.json(
      {
        error:
          "Tham số quality không hợp lệ (chỉ hỗ trợ 720p, 1080p, 1440p, 4k).",
      },
      { status: 400 }
    );
  }
  const quality = (
    ALLOWED_QUALITIES.has(normalizedQuality) ? normalizedQuality : "1080p"
  ) as RenderQualityOption;

  const fpsNum = Number(body.fps ?? 45);
  if (autoDispatch && (!Number.isInteger(fpsNum) || !ALLOWED_FPS.has(fpsNum))) {
    return NextResponse.json(
      {
        error: "Tham số fps không hợp lệ (hỗ trợ 30, 45, 60).",
      },
      { status: 400 }
    );
  }

  const episodeFile = `episodes/${filename}`;
  const fallbackOut = filename.replace(/\.json$/i, ".mp4");
  const rawOutput = String(body.outputName || fallbackOut)
    .trim()
    .replace(/[\\/]+/g, "_")
    .replace(/\.\.+/g, ".");
  const outputName = rawOutput.toLowerCase().endsWith(".mp4")
    ? rawOutput
    : `${rawOutput}.mp4`;
  const previewOnly = Boolean(body.previewOnly);

  const githubContentsPath = `/repos/${encodeURIComponent(
    owner
  )}/${encodeURIComponent(
    repo
  )}/contents/web-studio/episodes/${encodeURIComponent(filename)}`;

  try {
    // 3. Kiểm tra xem file đã tồn tại trên nhánh main chưa để lấy sha (ghi đè an toàn)
    let existingSha: string | undefined;
    const checkRes = await githubFetch(
      `${githubContentsPath}?ref=${encodeURIComponent(branch)}`
    );

    if (checkRes.status === 200) {
      const existingData = (await checkRes.json()) as { sha?: unknown };
      if (typeof existingData?.sha === "string" && existingData.sha.trim()) {
        existingSha = existingData.sha.trim();
      }
    } else if (checkRes.status === 401) {
      return NextResponse.json(
        {
          error:
            "GITHUB_TOKEN không hợp lệ hoặc đã hết hạn (401). Vui lòng kiểm tra lại cấu hình trên server.",
        },
        { status: 401 }
      );
    } else if (checkRes.status === 403) {
      const detail = await readGitHubError(checkRes);
      return NextResponse.json(
        {
          error: `Từ chối truy cập GitHub Contents API (403): Hãy cấp quyền "Contents: Read and write" cho GITHUB_TOKEN trên repo ${owner}/${repo}. (${detail})`,
        },
        { status: 403 }
      );
    } else if (checkRes.status !== 404) {
      const errMsg = await readGitHubError(checkRes);
      return NextResponse.json({ error: errMsg }, { status: checkRes.status });
    }

    // 4. PUT nội dung UTF-8 base64 lên web-studio/episodes/<filename>
    const base64Content = Buffer.from(rawContent, "utf8").toString("base64");
    const putPayload: Record<string, unknown> = {
      message: `Upload episode script ${filename} via Cloud Dashboard`,
      content: base64Content,
      branch,
    };
    if (existingSha) {
      putPayload.sha = existingSha;
    }

    const putRes = await githubFetch(githubContentsPath, {
      method: "PUT",
      body: JSON.stringify(putPayload),
    });

    if (!putRes.ok) {
      const detail = await readGitHubError(putRes);
      if (putRes.status === 403 || putRes.status === 404) {
        return NextResponse.json(
          {
            error: `Không thể ghi file lên GitHub (${putRes.status}): GITHUB_TOKEN hiện tại thiếu quyền "Contents: Read and write" trên repo ${owner}/${repo}. Chi tiết: ${detail}`,
          },
          { status: putRes.status === 403 ? 403 : putRes.status }
        );
      }
      return NextResponse.json({ error: detail }, { status: putRes.status });
    }

    const putData = (await putRes.json()) as {
      commit?: { sha?: string };
      content?: { sha?: string };
    };
    const commitSha =
      putData?.commit?.sha || putData?.content?.sha || null;
    const overwritten = Boolean(existingSha);

    // 5. Nếu autoDispatch === true, chờ ~1s để GitHub cập nhật ref main rồi gọi workflow_dispatch
    let dispatched = false;
    if (autoDispatch) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dispatchRes = await githubFetch(
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

      if (!dispatchRes.ok) {
        const dispatchErr = await readGitHubError(dispatchRes);
        const permHint =
          dispatchRes.status === 403
            ? ' Hãy kiểm tra thêm quyền "Actions: Read and write" của GITHUB_TOKEN.'
            : "";
        return NextResponse.json(
          {
            ok: false,
            episodeFile,
            commitSha,
            overwritten,
            dispatched: false,
            error: `Đã commit ${episodeFile} lên nhánh ${branch} thành công, nhưng lỗi khi gọi workflow_dispatch (${dispatchRes.status}): ${dispatchErr}.${permHint}`,
          },
          { status: dispatchRes.status }
        );
      }

      dispatched = true;
    }

    return NextResponse.json({
      ok: true,
      episodeFile,
      commitSha,
      overwritten,
      dispatched,
      message: dispatched
        ? previewOnly
          ? `Đã commit ${episodeFile} (${overwritten ? "cập nhật" : "mới"}) & khởi chạy Preview Render!`
          : `Đã commit ${episodeFile} (${overwritten ? "cập nhật" : "mới"}) & khởi chạy Cloud Render (${chaptersNum} VMs • ${quality.toUpperCase()} @ ${fpsNum}fps) -> ${outputName}!`
        : `Đã tải lên và commit ${episodeFile} lên nhánh ${branch} thành công!`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Lỗi kết nối khi tải kịch bản lên GitHub Contents API.",
      },
      { status: 500 }
    );
  }
}
