/**
 * HYBRID CPU + GPU RENDER CONFIG V11.0 (ASUS ZenBook UX425EA / Intel Iris Xe / 8GB RAM)
 * Module dùng chung cho mọi script render (render_v11_hornet_night.mjs, render_v9_storytime.mjs, route.ts):
 * 1. Đẩy GPU Intel Iris Xe lên ~60%–75% qua Chromium ANGLE (Direct3D 11) + concurrency: 3
 * 2. Tự động dò encoder phần cứng FFmpeg: ưu tiên h264_qsv (Intel Quick Sync) -> h264_mf (Windows Media Foundation) -> fallback libx264 veryfast
 * 3. Tái sử dụng Chromium browser instance và dọn sạch thư mục frame JPEG tạm ngay sau khi ghép MP4 để chống tràn 8GB RAM
 */

import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export type HardwareEncoderId = "h264_qsv" | "h264_mf" | "libx264";

export interface HybridChromiumOptions {
  gl: "angle" | "swiftshader";
  enableMultiProcessOnLinux: boolean;
}

export interface HardwareEncoderDetection {
  encoder: HardwareEncoderId;
  displayName: string;
  usesGpuVideoEncode: boolean;
  ffmpegVideoArgs: string[];
}

export const HYBRID_GPU_CHROME_EXTRA_FLAGS = [
  "--use-angle=d3d11",
  "--enable-gpu-rasterization",
  "--enable-zero-copy",
  "--ignore-gpu-blocklist",
] as const;

export const HYBRID_GPU_CHROMIUM_OPTIONS: HybridChromiumOptions = {
  // Trên Windows laptop dùng ANGLE (Direct3D 11 / Intel Iris Xe), trên Linux CI headless dùng SwiftShader ổn định 100%
  gl: process.platform === "linux" ? "swiftshader" : "angle",
  enableMultiProcessOnLinux: false,
};

export const HYBRID_GPU_RENDER_DEFAULTS = {
  chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
  extraChromiumFlags: HYBRID_GPU_CHROME_EXTRA_FLAGS,
  hardwareAcceleration: "if-possible" as const,
  concurrency: 3, // Đẩy GPU 3D Intel Iris Xe ~60%-75%, vẫn an toàn dưới ngưỡng 8GB RAM
  imageFormat: "jpeg" as const,
  jpegQuality: 90,
  x264Preset: "veryfast" as const,
} as const;

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
 * - Fallback: libx264 veryfast (Hybrid ANGLE vẽ GPU + CPU nén nhanh)
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

  // Fallback: Hybrid Chromium ANGLE + CPU x264 veryfast
  return {
    encoder: "libx264",
    displayName: "Hybrid ANGLE + CPU veryfast (libx264)",
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
 * Quy trình kết xuất MP4 Hybrid CPU + GPU (~70% Intel Iris Xe):
 * - Nếu có GPU encoder (h264_qsv / h264_mf):
 *   Bước A: renderFrames() với gl: "angle", concurrency: 3, imageFormat: "jpeg", jpegQuality: 90
 *   Bước B: ffmpeg nén chuỗi JPEG + Master Audio bằng encoder GPU phần cứng
 *   Bước C: Xóa sạch thư mục frame tạm ngay sau khi xong
 * - Nếu không có GPU encoder:
 *   Fallback sang renderMedia() với gl: "angle", hardwareAcceleration: "if-possible", concurrency: 3, x264Preset: "veryfast"
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
    concurrency = HYBRID_GPU_RENDER_DEFAULTS.concurrency,
    jpegQuality = HYBRID_GPU_RENDER_DEFAULTS.jpegQuality,
    tempDirPrefix = "v11_hybrid_gpu_frames_",
    renderFrames,
    renderMedia,
    puppeteerInstance,
  } = params;

  const renderScale = isPreview ? 1280 / 1920 : 1.0;
  const everyNthFrame = isPreview ? 2 : 1;
  const effectiveFps = isPreview ? 30 : 60;
  const encoderInfo = detectBestHardwareEncoder();

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  console.log(
    `[HybridGPU] Encoder: ${encoderInfo.displayName} | Chromium GL: "${HYBRID_GPU_CHROMIUM_OPTIONS.gl}" | Concurrency: ${concurrency} | JPEG Quality: ${jpegQuality}`
  );
  console.log(
    `[HybridGPU] Target GPU Flags: ${HYBRID_GPU_CHROME_EXTRA_FLAGS.join(" ")} | hardwareAcceleration: "${HYBRID_GPU_RENDER_DEFAULTS.hardwareAcceleration}"`
  );

  const startMs = Date.now();

  // V14.1: Luôn dùng quy trình 2 bước (renderFrames muted:true + FFmpeg mux masterAudioPath) cho CẢ GPU (h264_qsv/h264_mf)
  // LẪN máy ảo Ubuntu CI (libx264 veryfast) để bảo toàn 100% Master Audio V13.0 (Voice + BGM + 6 SFX) và đồng nhất codec khi concat!
  const useTwoStepFrameMux = Boolean(masterAudioPath && fs.existsSync(masterAudioPath));

  if (encoderInfo.usesGpuVideoEncode || useTwoStepFrameMux) {
    const framesTempDir = fs.mkdtempSync(path.join(os.tmpdir(), tempDirPrefix));
    try {
      let totalExpectedFrames = Math.ceil(composition.durationInFrames / everyNthFrame);
      let lastLoggedPct = -1;

      console.log(
        `-> Bước A (Chromium ${HYBRID_GPU_CHROMIUM_OPTIONS.gl.toUpperCase()}): Kết xuất ${totalExpectedFrames} frames JPEG (${
          isPreview ? "1280x720 @ 30fps" : "1920x1080 @ 60fps"
        }, concurrency=${concurrency})...`
      );

      await renderFrames({
        composition,
        serveUrl,
        outputDir: framesTempDir,
        inputProps,
        imageFormat: HYBRID_GPU_RENDER_DEFAULTS.imageFormat,
        jpegQuality,
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
        puppeteerInstance,
        concurrency,
        scale: renderScale,
        everyNthFrame,
        muted: true,
        onStart: ({ frameCount }: { frameCount: number }) => {
          totalExpectedFrames = frameCount;
        },
        onFrameUpdate: (framesRendered: number) => {
          const pct = Math.floor((framesRendered / Math.max(1, totalExpectedFrames)) * 100);
          if (pct % 15 === 0 && pct !== lastLoggedPct) {
            lastLoggedPct = pct;
            console.log(`GPU Frame render progress: ${pct}% (${framesRendered}/${totalExpectedFrames})`);
          }
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

      console.log(`-> Bước B (${encoderInfo.displayName}): Đang nén MP4 + ghép Master Audio...`);
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
    console.log(
      `-> Fallback Hybrid: renderMedia (gl: "angle", hardwareAcceleration: "if-possible", concurrency: ${concurrency}, x264Preset: "veryfast")...`
    );
    let lastLoggedPct = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
      puppeteerInstance,
      hardwareAcceleration: HYBRID_GPU_RENDER_DEFAULTS.hardwareAcceleration,
      concurrency,
      imageFormat: HYBRID_GPU_RENDER_DEFAULTS.imageFormat,
      jpegQuality,
      x264Preset: HYBRID_GPU_RENDER_DEFAULTS.x264Preset,
      scale: renderScale,
      everyNthFrame,
      timeoutInMilliseconds: 240000,
      onProgress: ({ progress }: { progress: number }) => {
        const pct = Math.floor(progress * 100);
        if (pct % 15 === 0 && pct !== lastLoggedPct) {
          lastLoggedPct = pct;
          console.log(`Video render progress: ${pct}%`);
        }
      },
    });
  }

  const elapsedSec = Number(((Date.now() - startMs) / 1000).toFixed(1));
  const stats = fs.statSync(outputPath);

  console.log(
    `[HybridGPU] Hoàn tất trong ${elapsedSec}s | Encoder: ${encoderInfo.displayName} | Kích thước: ${(
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
