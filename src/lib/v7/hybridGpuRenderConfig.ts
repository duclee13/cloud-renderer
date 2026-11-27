/**
 * HYBRID CPU + GPU RENDER CONFIG V15.1 (Windows Intel Iris Xe + GitHub Actions Ubuntu Cloud Matrix)
 * Module dùng chung cho mọi script render:
 * 1. Windows Laptop (Intel Iris Xe / 8GB RAM): Chromium ANGLE (Direct3D 11) + GPU h264_qsv / h264_mf
 * 2. Linux / GitHub Actions CI (`process.platform === "linux" || process.env.CI === "true"`):
 *    - Bắt buộc dùng `chromiumOptions: { gl: "swangle" }` (KHÔNG dùng `"swiftshader"` tránh treo Chrome trên Ubuntu 24.04!)
 *    - Dùng `imageFormat: "jpeg"`, `jpegQuality: 92` tăng tốc render 2D ~2.5-3x trên CPU
 *    - Giới hạn `concurrency: 2` (tối đa `3` trên runner 4 vCPU) + `timeoutInMilliseconds: 120000` chống deadlock/OOM
 *    - Log checkpoint trước/sau `selectComposition`, bắt lỗi `onBrowserLog` (`type === "error"`), và in tiến độ mỗi 5% kèm Elapsed/ETA
 */

import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export type HardwareEncoderId = "h264_qsv" | "h264_mf" | "libx264";

export interface HybridChromiumOptions {
  gl: "angle" | "swangle";
  enableMultiProcessOnLinux: boolean;
}

export interface HardwareEncoderDetection {
  encoder: HardwareEncoderId;
  displayName: string;
  usesGpuVideoEncode: boolean;
  ffmpegVideoArgs: string[];
}

export function isLinuxOrCiEnvironment(): boolean {
  return process.platform === "linux" || process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
}

export const HYBRID_GPU_CHROME_EXTRA_FLAGS = [
  "--use-angle=d3d11",
  "--enable-gpu-rasterization",
  "--enable-zero-copy",
  "--ignore-gpu-blocklist",
] as const;

export const HYBRID_GPU_CHROMIUM_OPTIONS: HybridChromiumOptions = {
  // V15.1: Linux/CI bắt buộc dùng "swangle" (tuyệt đối KHÔNG dùng "swiftshader" gây treo Chrome Headless Shell!)
  gl: isLinuxOrCiEnvironment() ? "swangle" : "angle",
  enableMultiProcessOnLinux: false,
};

export const REMOTION_RENDER_TIMEOUT_MS = 120000;

const DETECTED_CPU_CORES = Math.max(1, os.cpus()?.length || 4);

export const HYBRID_GPU_RENDER_DEFAULTS = {
  chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
  extraChromiumFlags: HYBRID_GPU_CHROME_EXTRA_FLAGS,
  hardwareAcceleration: "if-possible" as const,
  concurrency: isLinuxOrCiEnvironment() ? Math.min(4, DETECTED_CPU_CORES) : Math.min(3, DETECTED_CPU_CORES),
  imageFormat: "jpeg" as const,
  jpegQuality: isLinuxOrCiEnvironment() ? 88 : 90,
  x264Preset: isLinuxOrCiEnvironment() ? ("superfast" as const) : ("veryfast" as const),
  crf: isLinuxOrCiEnvironment() ? 23 : 18,
  timeoutInMilliseconds: REMOTION_RENDER_TIMEOUT_MS,
} as const;

/**
 * Chuẩn hóa concurrency an toàn theo phần cứng:
 * - Remotion khóa cứng `--concurrency <= os.cpus().length`, nên luôn kẹp tối đa theo số nhân CPU thực tế (tối đa 4 trên runner 4 vCPU)
 * - Trên Linux/CI: mặc định `Math.min(4, cpuCores)`
 * - Trên Windows: giữ theo tham số truyền vào (mặc định 2-3, kẹp theo số nhân CPU)
 */
export function resolveSafeRenderConcurrency(requested?: number): number {
  const isCi = isLinuxOrCiEnvironment();
  const cpuCores = Math.max(1, os.cpus()?.length || 4);
  const maxAllowed = isCi ? Math.min(4, cpuCores) : cpuCores;
  if (typeof requested === "number" && Number.isFinite(requested) && requested >= 1) {
    const clean = Math.floor(requested);
    return Math.min(maxAllowed, Math.max(1, clean));
  }
  const envVal = Number(process.env.CONCURRENCY || process.env.RENDER_CONCURRENCY || "");
  if (Number.isFinite(envVal) && envVal >= 1) {
    const clean = Math.floor(envVal);
    return Math.min(maxAllowed, Math.max(1, clean));
  }
  return isCi ? maxAllowed : Math.min(2, cpuCores);
}

/**
 * Callback onBrowserLog chuẩn V15.1: chỉ in ngay lập tức khi type === "error" để thấy lỗi Chrome trong vòng 5 giây
 */
export function createBrowserErrorLogger(label = "Chromium"): (log: { type: string; text: string }) => void {
  return (log) => {
    if (log && log.type === "error") {
      console.error(`[${label}][BrowserError] ${log.text}`);
    }
  };
}

/**
 * Wrapper selectComposition có log checkpoint ngay trước & ngay sau kèm thời gian thực thi + bắt lỗi Chrome realtime
 */
export async function selectCompositionWithCheckpoints(params: {
  selectComposition: (opts: any) => Promise<any>;
  serveUrl: string;
  id: string;
  inputProps: Record<string, any>;
  puppeteerInstance?: any;
  chunkLabel?: string;
}): Promise<any> {
  const { selectComposition, serveUrl, id, inputProps, puppeteerInstance, chunkLabel = "Composition" } = params;
  const startMs = Date.now();
  console.log(
    `[${chunkLabel}] Checkpoint: Calling selectComposition(id="${id}", gl="${HYBRID_GPU_CHROMIUM_OPTIONS.gl}", timeout=${REMOTION_RENDER_TIMEOUT_MS}ms)...`
  );
  const composition = await selectComposition({
    serveUrl,
    id,
    inputProps,
    chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
    puppeteerInstance: isLinuxOrCiEnvironment() ? undefined : puppeteerInstance,
    timeoutInMilliseconds: REMOTION_RENDER_TIMEOUT_MS,
    onBrowserLog: createBrowserErrorLogger(chunkLabel),
  });
  const elapsedSec = ((Date.now() - startMs) / 1000).toFixed(2);
  console.log(
    `[${chunkLabel}] Checkpoint: selectComposition done in ${elapsedSec}s (${composition.width}x${composition.height}, ${composition.durationInFrames} frames @ ${composition.fps}fps)`
  );
  return composition;
}

function probeFfmpegEncoder(ffmpegArgs: string): boolean {
  try {
    execSync(
      `ffmpeg -y -v error -f lavfi -i color=c=black:s=256x256:d=0.05:r=30 ${ffmpegArgs} -f null -`,
      { stdio: "ignore" }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Tự động dò encoder GPU phần cứng tốt nhất trên máy:
 * - Ưu tiên 1: h264_qsv (Intel Quick Sync Video trên Iris Xe)
 * - Ưu tiên 2: h264_mf (Windows Media Foundation GPU)
 * - Fallback: libx264 veryfast (Ubuntu CI / CPU)
 */
export function detectBestHardwareEncoder(): HardwareEncoderDetection {
  let encodersOut = "";
  try {
    encodersOut = execSync("ffmpeg -hide_banner -encoders", {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
  } catch {
    encodersOut = "";
  }

  // Trên Linux CI không có GPU phần cứng -> chọn thẳng libx264 superfast crf 23 (JPEG q88) tối ưu dung lượng (~95-115MB) & tốc độ
  if (isLinuxOrCiEnvironment()) {
    return {
      encoder: "libx264",
      displayName: "Linux/CI SwANGLE + CPU libx264 superfast crf=23 (JPEG q88)",
      usesGpuVideoEncode: false,
      ffmpegVideoArgs: ["-c:v", "libx264", "-preset", "superfast", "-crf", "23", "-pix_fmt", "yuv420p"],
    };
  }

  // Ưu tiên 1: Intel Quick Sync Video (h264_qsv)
  if (
    encodersOut.includes("h264_qsv") &&
    probeFfmpegEncoder("-c:v h264_qsv -preset fast -global_quality 22 -pix_fmt nv12")
  ) {
    return {
      encoder: "h264_qsv",
      displayName: "GPU h264_qsv (Intel Quick Sync -preset fast -global_quality 22)",
      usesGpuVideoEncode: true,
      ffmpegVideoArgs: ["-c:v", "h264_qsv", "-preset", "fast", "-global_quality", "22", "-pix_fmt", "nv12"],
    };
  }

  // Ưu tiên 2: Windows Media Foundation GPU (h264_mf)
  if (
    encodersOut.includes("h264_mf") &&
    probeFfmpegEncoder("-c:v h264_mf -rate_control quality -quality 80 -pix_fmt nv12")
  ) {
    return {
      encoder: "h264_mf",
      displayName: "GPU h264_mf (Windows Media Foundation -rate_control quality -quality 80)",
      usesGpuVideoEncode: true,
      ffmpegVideoArgs: ["-c:v", "h264_mf", "-rate_control", "quality", "-quality", "80", "-pix_fmt", "nv12"],
    };
  }

  // Fallback: Hybrid Chromium + CPU x264 veryfast
  return {
    encoder: "libx264",
    displayName: `Hybrid ${HYBRID_GPU_CHROMIUM_OPTIONS.gl.toUpperCase()} + CPU veryfast (libx264)`,
    usesGpuVideoEncode: false,
    ffmpegVideoArgs: ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p"],
  };
}

export interface HybridVideoRenderParams {
  composition: any;
  serveUrl: string;
  inputProps: Record<string, any>;
  masterAudioPath: string;
  outputPath: string;
  isPreview?: boolean;
  concurrency?: number;
  jpegQuality?: number;
  tempDirPrefix?: string;
  chunkLabel?: string;
  renderFrames: (opts: any) => Promise<any>;
  renderMedia: (opts: any) => Promise<any>;
  puppeteerInstance?: any;
}

export interface HybridVideoRenderSummary {
  encoderInfo: HardwareEncoderDetection;
  elapsedSec: number;
  sizeBytes: number;
  concurrency: number;
}

/**
 * Tạo bộ in tiến độ mỗi 5% (5%, 10%, ..., 100%) chuẩn V15.1:
 * `[Chunk k/N] Rendering 25% (642/2568 frames) | Elapsed: 48s | ETA: ~144s`
 */
function createFivePercentProgressLogger(chunkLabel: string, totalFrames: number, startMs: number) {
  let nextMilestonePct = 5;
  return (doneFrames: number, rawProgress01?: number) => {
    const safeTotal = Math.max(1, totalFrames);
    const pct =
      typeof rawProgress01 === "number" && Number.isFinite(rawProgress01)
        ? Math.min(100, Math.floor(rawProgress01 * 100))
        : Math.min(100, Math.floor((doneFrames / safeTotal) * 100));
    if (pct >= nextMilestonePct) {
      const milestone = Math.min(100, Math.floor(pct / 5) * 5);
      nextMilestonePct = milestone + 5;
      const elapsedSec = Math.max(1, Math.round((Date.now() - startMs) / 1000));
      const frac = Math.max(0.01, Math.min(1, doneFrames / safeTotal));
      const etaSec = milestone >= 100 ? 0 : Math.max(0, Math.round((elapsedSec * (1 - frac)) / frac));
      console.log(
        `[${chunkLabel}] Rendering ${milestone}% (${Math.min(doneFrames, safeTotal)}/${safeTotal} frames) | Elapsed: ${elapsedSec}s | ETA: ~${etaSec}s`
      );
    }
  };
}

/**
 * Quy trình kết xuất MP4 V15.1 (Windows Hybrid GPU + Linux/CI SwANGLE Cloud Matrix):
 * - Windows có GPU encoder (h264_qsv / h264_mf):
 *   Bước A: renderFrames() với gl: "angle", imageFormat: "jpeg", timeoutInMilliseconds: 120000, onBrowserLog
 *   Bước B: ffmpeg nén chuỗi JPEG + ghép Master Audio bằng GPU phần cứng
 * - Linux / GitHub Actions CI (hoặc không có GPU encoder):
 *   Bước A: renderMedia() trực tiếp với gl: "swangle", imageFormat: "jpeg", jpegQuality: 92,
 *           concurrency: 2 (max 3), timeoutInMilliseconds: 120000, muted: true (nếu có masterAudioPath),
 *           onProgress in mỗi 5% kèm Elapsed/ETA + onBrowserLog báo lỗi Chrome tức thì!
 *   Bước B: Nếu có masterAudioPath (Voice + BGM + 6 SFX V13.0/V15.0) -> FFmpeg mux lossless `-c:v copy -c:a aac -b:a 192k` trong < 1s!
 */
export async function renderVideoHybridCpuGpu(
  params: HybridVideoRenderParams
): Promise<HybridVideoRenderSummary> {
  const {
    composition,
    serveUrl,
    inputProps,
    masterAudioPath,
    outputPath,
    isPreview = false,
    tempDirPrefix = "v15_hybrid_frames_",
    chunkLabel = "Chunk 1/1",
    renderFrames,
    renderMedia,
    puppeteerInstance,
  } = params;

  const isCi = isLinuxOrCiEnvironment();
  const concurrency = resolveSafeRenderConcurrency(params.concurrency);
  const jpegQuality = isCi ? 88 : (params.jpegQuality ?? HYBRID_GPU_RENDER_DEFAULTS.jpegQuality);
  const renderScale = isPreview ? 1280 / 1920 : 1.0;
  const everyNthFrame = isPreview ? 2 : 1;
  const compFps = Math.max(15, Math.min(120, Math.round(Number(composition?.fps) || 60)));
  const effectiveFps = isPreview ? Math.max(15, Math.round(compFps / 2)) : compFps;
  const encoderInfo = detectBestHardwareEncoder();
  const totalExpectedFrames = Math.ceil(composition.durationInFrames / everyNthFrame);
  const browserLogHandler = createBrowserErrorLogger(chunkLabel);

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  console.log(
    `[${chunkLabel}] [HybridGPU] Encoder: ${encoderInfo.displayName} | Chromium GL: "${HYBRID_GPU_CHROMIUM_OPTIONS.gl}" | ` +
      `Concurrency: ${concurrency} | Format: jpeg (q=${jpegQuality}) | Timeout: ${REMOTION_RENDER_TIMEOUT_MS}ms`
  );

  const startMs = Date.now();
  const logProgress = createFivePercentProgressLogger(chunkLabel, totalExpectedFrames, startMs);
  const hasExternalMasterAudio = Boolean(masterAudioPath && fs.existsSync(masterAudioPath));
  const effectiveInputProps = hasExternalMasterAudio ? { ...inputProps, renderMuted: true } : inputProps;

  if (encoderInfo.usesGpuVideoEncode && !isCi) {
    const framesTempDir = fs.mkdtempSync(path.join(os.tmpdir(), tempDirPrefix));
    try {
      console.log(
        `[${chunkLabel}] -> Bước A (Chromium ${HYBRID_GPU_CHROMIUM_OPTIONS.gl.toUpperCase()}): Kết xuất ${totalExpectedFrames} frames JPEG (${
          isPreview ? "1280x720 @ 30fps" : "1920x1080 @ 60fps"
        }, concurrency=${concurrency})...`
      );

      await renderFrames({
        composition,
        serveUrl,
        outputDir: framesTempDir,
        inputProps: effectiveInputProps,
        imageFormat: HYBRID_GPU_RENDER_DEFAULTS.imageFormat,
        jpegQuality,
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
        puppeteerInstance,
        concurrency,
        scale: renderScale,
        everyNthFrame,
        muted: true,
        timeoutInMilliseconds: REMOTION_RENDER_TIMEOUT_MS,
        onBrowserLog: browserLogHandler,
        onFrameUpdate: (framesRendered: number) => {
          logProgress(framesRendered);
        },
      });

      const sampleFiles = fs
        .readdirSync(framesTempDir)
        .filter((f) => f.startsWith("element-") && f.endsWith(".jpeg"));
      if (sampleFiles.length === 0) {
        throw new Error("Không tìm thấy frame JPEG nào trong thư mục tạm sau khi renderFrames!");
      }

      const matchDigits = sampleFiles[0].match(/element-(\d+)\.jpeg/);
      const padLen = matchDigits ? matchDigits[1].length : 4;
      const safeFramesPattern = path
        .join(framesTempDir, `element-%0${padLen}d.jpeg`)
        .replace(/\\/g, "/");
      const safeMasterAudio = masterAudioPath.replace(/\\/g, "/");
      const safeVideoOut = outputPath.replace(/\\/g, "/");
      const videoArgsStr = encoderInfo.ffmpegVideoArgs.join(" ");

      console.log(`[${chunkLabel}] -> Bước B (${encoderInfo.displayName}): Đang nén MP4 + ghép Master Audio...`);
      execSync(
        `ffmpeg -y -v error -framerate ${effectiveFps} -i "${safeFramesPattern}" -i "${safeMasterAudio}" ` +
          `${videoArgsStr} -c:a aac -b:a 192k -movflags +faststart "${safeVideoOut}"`
      );
    } finally {
      try {
        fs.rmSync(framesTempDir, { recursive: true, force: true });
      } catch {
        // Bỏ qua lỗi dọn file tạm nếu OS còn giữ handle giây lát
      }
    }
  } else {
    // V15.1 Linux/CI Cloud Path: dùng renderMedia trực tiếp (gl: "swangle", jpeg q=92, concurrency=2..3, timeout=120s)
    // + onProgress báo tiến độ mỗi 5% kèm Elapsed/ETA + mux lossless Master Audio V13.0/V15.0!
    const muxTempDir = hasExternalMasterAudio ? fs.mkdtempSync(path.join(os.tmpdir(), tempDirPrefix)) : null;
    const rawMediaTarget = muxTempDir ? path.join(muxTempDir, "video_silent.mp4") : outputPath;
    try {
      console.log(
        `[${chunkLabel}] -> Starting renderMedia (gl: "${HYBRID_GPU_CHROMIUM_OPTIONS.gl}", imageFormat: "jpeg", jpegQuality: ${jpegQuality}, concurrency: ${concurrency}, timeout: ${REMOTION_RENDER_TIMEOUT_MS}ms)...`
      );
      await renderMedia({
        composition,
        serveUrl,
        codec: "h264",
        pixelFormat: "yuv420p",
        outputLocation: rawMediaTarget,
        inputProps: effectiveInputProps,
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
        puppeteerInstance: isCi ? undefined : puppeteerInstance,
        hardwareAcceleration: HYBRID_GPU_RENDER_DEFAULTS.hardwareAcceleration,
        concurrency,
        imageFormat: HYBRID_GPU_RENDER_DEFAULTS.imageFormat,
        jpegQuality,
        x264Preset: HYBRID_GPU_RENDER_DEFAULTS.x264Preset,
        crf: HYBRID_GPU_RENDER_DEFAULTS.crf,
        scale: renderScale,
        everyNthFrame,
        muted: hasExternalMasterAudio,
        timeoutInMilliseconds: REMOTION_RENDER_TIMEOUT_MS,
        onBrowserLog: browserLogHandler,
        onProgress: ({
          progress,
          renderedFrames,
        }: {
          progress: number;
          renderedFrames: number;
          encodedFrames: number;
        }) => {
          logProgress(renderedFrames, progress);
        },
      });

      if (hasExternalMasterAudio && muxTempDir) {
        const safeRawVideo = rawMediaTarget.replace(/\\/g, "/");
        const safeMasterAudio = masterAudioPath.replace(/\\/g, "/");
        const safeVideoOut = outputPath.replace(/\\/g, "/");
        console.log(`[${chunkLabel}] -> Muxing V15.0 Studio Master Audio (Voice + BGM + SFX) lossless (-c:v copy)...`);
        execSync(
          `ffmpeg -y -v error -i "${safeRawVideo}" -i "${safeMasterAudio}" ` +
            `-map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${safeVideoOut}"`
        );
      }
    } finally {
      if (muxTempDir) {
        try {
          fs.rmSync(muxTempDir, { recursive: true, force: true });
        } catch {}
      }
    }
  }

  const elapsedSec = Number(((Date.now() - startMs) / 1000).toFixed(1));
  const stats = fs.statSync(outputPath);

  console.log(
    `[${chunkLabel}] [HybridGPU] Hoàn tất trong ${elapsedSec}s | Encoder: ${encoderInfo.displayName} | Kích thước: ${(
      stats.size /
      1024 /
      1024
    ).toFixed(2)} MB`
  );

  return {
    encoderInfo,
    elapsedSec,
    sizeBytes: stats.size,
    concurrency,
  };
}
