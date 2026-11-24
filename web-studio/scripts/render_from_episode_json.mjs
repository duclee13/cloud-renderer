/**
 * RENDER FROM EPISODE JSON V17.0 — Bộ Kết Xuất Phim Từ Kịch Bản JSON Phổ Quát (Auto-Factory)
 * Hỗ trợ đầy đủ 5 chế độ CLI:
 *   --episode=episodes/current_episode.json (mặc định)
 *   --audio-only               : tạo cache âm thanh qua VieNeu-TTS local
 *   --preview-only             : xuất nhanh 4 ảnh đại diện 4 Hồi (out/preview_act1.jpg..preview_act4.jpg) mà không render full MP4
 *   --chapter=k --total-chapters=N : render 1 chunk song song trên GitHub Actions Matrix
 *   --concat-only              : ghép nối lossless (-c copy) tất cả chunks thành file MP4 hoàn chỉnh
 */

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  HYBRID_GPU_CHROMIUM_OPTIONS,
  isLinuxOrCiEnvironment,
  detectBestHardwareEncoder,
  selectCompositionWithCheckpoints,
  renderVideoHybridCpuGpu,
} from '../src/lib/v7/hybridGpuRenderConfig.ts';
import {
  synthesizeVieneuLocalTtsBeat,
  DEFAULT_VIENEU_TTS_URL,
  DEFAULT_VIENEU_TTS_VOICE,
} from '../src/lib/v7/geminiTtsClient.ts';
import {
  mixMasterAudioWithSoundDesign,
  SOUND_DESIGN_CACHE_DIR,
} from '../src/lib/v7/soundDesignEngine.ts';
import {
  parseChapterRenderCliArgs,
  splitBeatsIntoChapters,
  renderLongMovieByChapters,
  resolveBeatTtsText,
  measureMediaDurationFfprobe,
} from '../src/lib/v7/chapterChunkedRenderer.ts';
import { sanitizeAndValidateEpisode } from '../src/lib/v7/episodeJsonSchema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webStudioRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(__dirname, '../..');
const localArtifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const hasLocalArtifactDir = fs.existsSync(localArtifactDir);

function parseEpisodeArgs(argv) {
  let episodePath = 'episodes/current_episode.json';
  let cacheDirOverride = null;
  let isPreviewOnly = argv.includes('--preview-only');

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--episode=')) episodePath = a.slice('--episode='.length).trim();
    else if (a === '--episode' && argv[i + 1]) episodePath = argv[++i].trim();
    else if (a.startsWith('--cache-dir=')) cacheDirOverride = a.slice('--cache-dir='.length).trim();
    else if (a === '--cache-dir' && argv[i + 1]) cacheDirOverride = argv[++i].trim();
  }

  const resolvedEpisode = path.isAbsolute(episodePath)
    ? episodePath
    : fs.existsSync(path.resolve(process.cwd(), episodePath))
    ? path.resolve(process.cwd(), episodePath)
    : path.resolve(webStudioRoot, episodePath);

  return { resolvedEpisode, cacheDirOverride, isPreviewOnly };
}

/**
 * Hook báo tiến độ an toàn tuyệt đối lên Cloud Render Dashboard Mức 2 (`/api/vm-progress`).
 * - Nếu thiếu `DASHBOARD_PROGRESS_URL` hoặc `GITHUB_RUN_ID`: no-op 100%, không tạo bất kỳ request nào.
 * - Throttle tối đa 1 gói tin mỗi 4 giây (trừ gói `starting` 0% và `completed` 100%).
 * - Timeout cứng 2000ms + try/catch nuốt 100% lỗi mạng/HTTP để KHÔNG BAO GIỜ ảnh hưởng tiến trình render.
 */
function createSafeVmProgressReporter({ vmIndex, totalVms }) {
  const rawUrl = (process.env.DASHBOARD_PROGRESS_URL || '').trim();
  const secret = (process.env.DASHBOARD_PROGRESS_SECRET || '').trim();
  const runId = (process.env.GITHUB_RUN_ID || '').trim();

  if (!rawUrl || !runId) {
    return {
      report: async () => {},
    };
  }

  const cleanBase = rawUrl.replace(/\/+$/, '');
  const endpoint = cleanBase.endsWith('/api/vm-progress')
    ? cleanBase
    : `${cleanBase}/api/vm-progress`;

  const renderStartMs = Date.now();
  let lastSentAtMs = 0;

  async function report({
    phase = 'rendering',
    renderedFrames = 0,
    totalFrames = 0,
    rawPercent,
    force = false,
  }) {
    try {
      const now = Date.now();
      if (!force && now - lastSentAtMs < 4000) {
        return;
      }
      lastSentAtMs = now;

      const safeTotal = Math.max(0, Math.round(Number(totalFrames) || 0));
      const safeRendered = Math.max(
        0,
        Math.min(safeTotal > 0 ? safeTotal : 1_000_000, Math.round(Number(renderedFrames) || 0))
      );
      const elapsedSec = Math.max(0.25, (now - renderStartMs) / 1000);
      const fps = safeRendered > 0 ? Number((safeRendered / elapsedSec).toFixed(1)) : 0;

      let pct = 0;
      if (phase === 'completed') {
        pct = 100;
      } else if (safeTotal > 0 && safeRendered > 0) {
        pct = Math.min(99.5, (safeRendered / safeTotal) * 100);
      } else if (typeof rawPercent === 'number' && Number.isFinite(rawPercent)) {
        pct = Math.max(0, Math.min(99.5, rawPercent));
      }
      const percent = Number(pct.toFixed(1));
      const remainingFrames = Math.max(0, safeTotal - safeRendered);
      const etaSec =
        phase === 'completed'
          ? 0
          : fps > 0.05 && remainingFrames > 0
          ? Math.max(0, Math.round(remainingFrames / fps))
          : 0;

      const headers = { 'Content-Type': 'application/json' };
      if (secret) {
        headers['x-progress-secret'] = secret;
      }

      await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          runId,
          vmIndex,
          totalVms,
          phase,
          renderedFrames: phase === 'completed' && safeTotal > 0 ? safeTotal : safeRendered,
          totalFrames: safeTotal,
          percent,
          fps,
          etaSec,
          updatedAt: new Date(now).toISOString(),
        }),
        signal: AbortSignal.timeout(2000),
      });
    } catch {
      // Nuốt 100% lỗi mạng / timeout / HTTP để bảo vệ tuyệt đối pipeline render
    }
  }

  return { report };
}

/**
 * Chế độ --preview-only: xuất nhanh 4 ảnh đại diện trải đều 4 Hồi (KHÔNG cần render video, không bắt buộc chạy TTS).
 */
async function renderFourActPreviewStills(episode, scriptBeats) {
  const remotionBundlerMod = await import('@remotion/bundler');
  const remotionRendererMod = await import('@remotion/renderer');

  // Dựng timeline giả định 300f/beat (5s) để lấy khung hình sống động giữa mỗi beat đại diện
  const previewBeats = [];
  let cursor = 0;
  for (let i = 0; i < scriptBeats.length; i++) {
    const dur = 300;
    previewBeats.push({
      ...scriptBeats[i],
      startFrame: cursor,
      durationFrames: dur,
      audioUrl: undefined,
      showDebugHud: false,
    });
    cursor += dur;
  }

  // Chọn 4 chỉ số beat đại diện trải đều 4 Hồi (nếu tập mẫu có <= 4 beat thì lấy từng beat 1..N)
  const total = previewBeats.length;
  const pickIndices =
    total <= 4
      ? Array.from({ length: total }, (_, i) => i)
      : [
          Math.min(total - 1, Math.floor(total * 0.08)),
          Math.min(total - 1, Math.floor(total * 0.34)),
          Math.min(total - 1, Math.floor(total * 0.62)),
          Math.min(total - 1, Math.floor(total * 0.88)),
        ];

  const entryPoint = path.join(webStudioRoot, 'src', 'remotion', 'index.ts');
  const isCi = isLinuxOrCiEnvironment();
  console.log(`\n-> [--preview-only] Bundling Remotion V17.0 UniversalAutoStage (${isCi ? 'Linux/CI SwANGLE' : 'Local ANGLE'})...`);
  const bundleLocation = await remotionBundlerMod.bundle({
    entryPoint,
    onProgress: (p) => {
      if (p === 100 || p % 50 === 0) console.log(`  Bundling: ${p}%`);
    },
  });

  const browserInstance = isCi
    ? undefined
    : await remotionRendererMod.openBrowser('chrome', { chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS });

  try {
    const payload = {
      title: episode.title,
      totalDurationFrames: cursor,
      fps: 60,
      beats: previewBeats,
      showDebugHud: false,
    };
    const composition = await selectCompositionWithCheckpoints({
      selectComposition: remotionRendererMod.selectComposition,
      serveUrl: bundleLocation,
      id: 'V7MovieComposition',
      puppeteerInstance: browserInstance,
      inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
      chunkLabel: 'Preview-4-Acts',
    });

    const outDir = path.join(workspaceRoot, 'out');
    fs.mkdirSync(outDir, { recursive: true });

    for (let k = 0; k < pickIndices.length; k++) {
      const beatIdx = pickIndices[k];
      const b = previewBeats[beatIdx];
      const targetFrame = b.startFrame + Math.floor(b.durationFrames * 0.56);
      const fileName = `preview_act${k + 1}_${episode.slug}.jpg`;
      const outPath = path.join(outDir, fileName);
      const canonicalName = `preview_act${k + 1}.jpg`;
      const canonicalOut = path.join(outDir, canonicalName);

      console.log(
        `  [Preview ${k + 1}/${pickIndices.length}] Beat #${beatIdx + 1} (${b.autoStageSpec.stageType} | ${b.autoStageSpec.timeOfDay}) Frame ${targetFrame} -> ${fileName}`
      );
      await remotionRendererMod.renderStill({
        composition,
        serveUrl: bundleLocation,
        output: outPath,
        frame: targetFrame,
        imageFormat: 'jpeg',
        jpegQuality: 92,
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
        puppeteerInstance: browserInstance,
        inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
      });
      fs.copyFileSync(outPath, canonicalOut);
      if (hasLocalArtifactDir) {
        fs.copyFileSync(outPath, path.join(localArtifactDir, fileName));
      }
    }
    console.log(`✅ [--preview-only] Hoàn tất ${pickIndices.length} ảnh xem trước trong ${outDir}!`);
  } finally {
    if (browserInstance) {
      try {
        await browserInstance.close({ silent: true });
      } catch {}
    }
  }
}

async function main() {
  const { resolvedEpisode, cacheDirOverride, isPreviewOnly } = parseEpisodeArgs(process.argv.slice(2));
  if (!fs.existsSync(resolvedEpisode)) {
    console.error(`Lỗi: Không tìm thấy file JSON kịch bản: ${resolvedEpisode}`);
    process.exit(1);
  }

  const rawJson = JSON.parse(fs.readFileSync(resolvedEpisode, 'utf8'));
  const episode = sanitizeAndValidateEpisode(rawJson);

  const scriptBeats = episode.beats.map((b) => ({
    id: b.id,
    action: 'STORY_MICRO_POSE',
    type: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: b.stageType,
    theme: b.stageType,
    stageType: b.stageType,
    floatingHeader: b.chapterBanner || b.headerTitle || undefined,
    headerTitle: b.headerTitle || b.chapterBanner || undefined,
    narrationText: b.text,
    text: b.text,
    ttsText: b.ttsText,
    transitionIn: b.transitionIn,
    transitionFrames: b.transitionFrames,
    pauseAfterSec: b.pauseAfterSec,
    bgmMood: b.bgmMood,
    voiceTone: b.voiceTone || 'CALM_STORY',
    autoStageSpec: b,
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.035],
  }));

  console.log('====================================================================');
  console.log(`V17.0 UNIVERSAL JSON RENDERER: "${episode.title}"`);
  console.log(`-> File JSON: ${resolvedEpisode}`);
  console.log(`-> Slug: ${episode.slug} | Micro-Beats: ${episode.beats.length}`);
  console.log('====================================================================');

  if (isPreviewOnly) {
    await renderFourActPreviewStills(episode, scriptBeats);
    return;
  }

  const cliArgs = parseChapterRenderCliArgs(process.argv);
  const encoderInfo = detectBestHardwareEncoder();
  const VIENEU_URL = (process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL || 'http://127.0.0.1:8000/v1/audio/speech').trim();
  const VIENEU_VOICE = (process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE || 'Hải Đăng').trim();
  const VIENEU_ATEMPO = Number(process.env.VIENEU_TTS_ATEMPO) || 1.10;

  const ttsCacheDir = cacheDirOverride
    ? path.resolve(process.cwd(), cacheDirOverride)
    : path.join(workspaceRoot, '.tts-cache', 'auto_episode');
  const defaultOutputPath = path.join(workspaceRoot, 'out', `${episode.slug}_v17.mp4`);

  // Đọc chỉ mục cache từ cloud_vieneu_tts.py nếu đã tổng hợp sẵn trên Job 1 (Cloud Matrix Hit 100% không cần gọi HTTP!)
  let prebuiltAudioIndex = null;
  const audioIndexPath = path.join(ttsCacheDir, 'episode_audio_index.json');
  if (fs.existsSync(audioIndexPath)) {
    try {
      prebuiltAudioIndex = JSON.parse(fs.readFileSync(audioIndexPath, 'utf8'));
      console.log(
        `⚡ Đã nạp chỉ mục âm thanh Cloud (${prebuiltAudioIndex.engine} — ${prebuiltAudioIndex.voiceName}, ${prebuiltAudioIndex.totalBeats} beats)!`
      );
    } catch {
      prebuiltAudioIndex = null;
    }
  }

  console.log(`-> Video Encoder: ${encoderInfo.encoder} (${encoderInfo.reason})`);
  const chapters = splitBeatsIntoChapters(scriptBeats, Math.min(4, scriptBeats.length));

  let remotionRendererMod = null;
  let remotionBundlerMod = null;

  const summary = await renderLongMovieByChapters(chapters, defaultOutputPath, {
    movieId: `v17_${episode.slug}`,
    movieTitle: episode.title,
    workspaceRoot,
    ttsCacheDir,
    fps: 60,
    cliArgs,
    renderEngineVersionTag: 'v17_0_universal_auto_stage',

    // 1. Đọc trực tiếp cache do cloud_vieneu_tts.py tạo (nếu có), nếu chưa có thì gọi VieNeu-TTS local HTTP
    synthesizeBeatAudio: async (beat, globalIdx) => {
      const idxEntry = prebuiltAudioIndex?.beatsByIndex?.[String(globalIdx)];
      if (idxEntry?.file) {
        const cachedPath = path.join(ttsCacheDir, idxEntry.file);
        if (fs.existsSync(cachedPath) && fs.statSync(cachedPath).size > 500) {
          const actualDurationSec =
            typeof idxEntry.actualDurationSec === 'number' && idxEntry.actualDurationSec > 0
              ? idxEntry.actualDurationSec
              : measureMediaDurationFfprobe(cachedPath);
          const mp3Buffer = fs.readFileSync(cachedPath);
          return {
            mp3Buffer,
            audioUrl: `data:audio/mp3;base64,${mp3Buffer.toString('base64')}`,
            actualDurationSec,
            totalDurationMs: Math.round(actualDurationSec * 1000),
            totalDurationFrames: Math.ceil(actualDurationSec * 60) + 24,
            voiceName: idxEntry.voiceName || VIENEU_VOICE,
            fromCache: true,
            cacheFilePath: cachedPath,
            engine: idxEntry.engine || 'VIENEU_LOCAL',
          };
        }
      }

      const ttsInput = resolveBeatTtsText(beat);
      const outcome = await synthesizeVieneuLocalTtsBeat({
        text: beat.narrationText || beat.text || '',
        ttsText: ttsInput,
        voiceTone: beat.voiceTone,
        voice: VIENEU_VOICE,
        atempo: VIENEU_ATEMPO,
        url: VIENEU_URL,
        cacheDir: ttsCacheDir,
      });
      if (!outcome.ok || !outcome.result) {
        throw new Error(`[AutoFactory TTS] Lỗi tại Beat #${globalIdx + 1}: ${outcome.errorReason}`);
      }
      return outcome.result;
    },

    // 2. Trộn giọng đọc với BGM 3 hồi & Auto SFX V13–V17
    mixChapterAudio: ({ chapterNumber, voiceMasterWavPath, compiledBeats, chapterTotalFrames, outputWavPath }) => {
      const mixRes = mixMasterAudioWithSoundDesign({
        voiceMasterWavPath,
        beats: compiledBeats,
        totalFrames: chapterTotalFrames,
        fps: 60,
        outputWavPath,
        cacheDir: SOUND_DESIGN_CACHE_DIR,
      });
      return {
        durationSec: mixRes.durationSec,
        summaryLog: `  -> [Audio V17 | Chunk ${chapterNumber}] BGM segments: ${mixRes.plan.bgmSegments.length} | SFX: ${mixRes.plan.sfxCues.length} cues`,
      };
    },

    // 3. Bundle Remotion 1 lần (Linux/CI dùng SwANGLE không share browser để chống deadlock!)
    prepareRenderer: async () => {
      if (!remotionBundlerMod) remotionBundlerMod = await import('@remotion/bundler');
      if (!remotionRendererMod) remotionRendererMod = await import('@remotion/renderer');

      const entryPoint = path.join(webStudioRoot, 'src', 'remotion', 'index.ts');
      const isCi = isLinuxOrCiEnvironment();
      console.log(`\n-> Bundling Remotion V17.0 composition (${isCi ? 'Linux/CI SwANGLE' : 'Local ANGLE'})...`);
      const bundleLocation = await remotionBundlerMod.bundle({
        entryPoint,
        onProgress: (p) => {
          if (p === 100 || p % 50 === 0) console.log(`  Bundling: ${p}%`);
        },
      });
      if (isCi) {
        return { bundleLocation, browserInstance: undefined, close: async () => {} };
      }
      const browserInstance = await remotionRendererMod.openBrowser('chrome', {
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
      });
      return {
        bundleLocation,
        browserInstance,
        close: async () => {
          await browserInstance.close({ silent: true });
        },
      };
    },

    // 4. Render từng Chunk thành out/chunks/v17_<slug>_chapter_<1..N>.mp4
    renderChapterVideo: async (ctx) => {
      const payload = {
        title: `${episode.title} — ${ctx.chunkLabel}`,
        totalDurationFrames: ctx.chapterTotalFrames,
        fps: 60,
        beats: ctx.compiledBeats,
        showDebugHud: false,
      };
      const composition = await selectCompositionWithCheckpoints({
        selectComposition: remotionRendererMod.selectComposition,
        serveUrl: ctx.bundleLocation,
        id: 'V7MovieComposition',
        puppeteerInstance: ctx.browserInstance,
        inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
        chunkLabel: ctx.chunkLabel,
      });

      const vmIndex =
        Number(process.env.VM_INDEX) ||
        ctx.chapter.chapterNumber ||
        cliArgs.chapterIndex ||
        1;
      const totalVms =
        Number(process.env.TOTAL_CHAPTERS) ||
        cliArgs.totalChaptersOverride ||
        chapters.length ||
        16;
      const expectedTotalFrames = Math.max(
        1,
        Math.ceil(composition.durationInFrames / (ctx.isPreview ? 2 : 1))
      );
      const vmReporter = createSafeVmProgressReporter({ vmIndex, totalVms });

      void vmReporter.report({
        phase: 'starting',
        renderedFrames: 0,
        totalFrames: expectedTotalFrames,
        rawPercent: 0,
        force: true,
      });

      const res = await renderVideoHybridCpuGpu({
        composition,
        serveUrl: ctx.bundleLocation,
        inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
        masterAudioPath: ctx.chapterMasterAudioPath,
        outputPath: ctx.chunkOutputPath,
        isPreview: ctx.isPreview,
        concurrency: ctx.concurrency,
        jpegQuality: isLinuxOrCiEnvironment() ? 92 : 88,
        chunkLabel: ctx.chunkLabel,
        tempDirPrefix: `v17_auto_ch${ctx.chapter.chapterNumber}_frames_`,
        renderFrames: (opts) =>
          remotionRendererMod.renderFrames({
            ...opts,
            onFrameUpdate: (framesRendered) => {
              if (typeof opts.onFrameUpdate === 'function') {
                opts.onFrameUpdate(framesRendered);
              }
              void vmReporter.report({
                phase: 'rendering',
                renderedFrames: framesRendered,
                totalFrames: expectedTotalFrames,
              });
            },
          }),
        renderMedia: (opts) =>
          remotionRendererMod.renderMedia({
            ...opts,
            onProgress: (prog) => {
              if (typeof opts.onProgress === 'function') {
                opts.onProgress(prog);
              }
              void vmReporter.report({
                phase: 'rendering',
                renderedFrames: prog?.renderedFrames ?? 0,
                totalFrames: expectedTotalFrames,
                rawPercent:
                  typeof prog?.progress === 'number' ? prog.progress * 100 : undefined,
              });
            },
          }),
        puppeteerInstance: ctx.browserInstance,
      });

      await vmReporter.report({
        phase: 'completed',
        renderedFrames: expectedTotalFrames,
        totalFrames: expectedTotalFrames,
        rawPercent: 100,
        force: true,
      });

      return {
        elapsedSec: res.elapsedSec,
        sizeBytes: res.sizeBytes,
      };
    },
  });

  if (
    hasLocalArtifactDir &&
    (summary.mode === 'ALL_AND_CONCAT' || summary.mode === 'CONCAT_ONLY') &&
    fs.existsSync(summary.outputPath)
  ) {
    const artifactOut = path.join(localArtifactDir, path.basename(summary.outputPath));
    fs.copyFileSync(summary.outputPath, artifactOut);
    console.log(`-> Đã đồng bộ bản sao artifact: ${artifactOut}`);
  }
}

main().catch((err) => {
  console.error('Fatal V17.0 Auto-Factory render error:', err);
  process.exit(1);
});
