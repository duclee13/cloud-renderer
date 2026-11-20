import path from 'path';
import fs from 'fs';
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
  renderLongMovieByChapters,
  resolveBeatTtsText,
} from '../src/lib/v7/chapterChunkedRenderer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../..');
const localArtifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const hasLocalArtifactDir = fs.existsSync(localArtifactDir);

const MOVIE_ID = 'v16_microbeat_demo';
const VIENEU_URL = (process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL || 'http://127.0.0.1:8000/v1/audio/speech').trim();
const VIENEU_VOICE = (process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE || 'Hải Đăng').trim();
const VIENEU_ATEMPO = Number(process.env.VIENEU_TTS_ATEMPO) || 1.10;

const videoWorkspaceOut = path.join(workspaceRoot, 'out', 'test_v16_microbeat_demo.mp4');
const ttsCacheDir = path.join(workspaceRoot, '.tts-cache', 'v16_microbeat_demo');

// =============================================================================
// DEMO KIỂM CHỨNG V16.0 (~22–25 giây, 4 MICRO-BEAT ĐỒNG BỘ 1-1 LỜI THOẠI)
// - Mặt nhân vật thân thiện mới V16.0 (mắt to +25% chấm sáng trắng, ẩn lông mày mặc định, bỏ nét cằm xám, tóc mái mềm BOY)
// - True Simultaneous Crossfade 0.5s (30f @ 60fps, 0% nháy đen) + nhịp nghỉ 0.4s (pauseAfterSec: 0.4)
// - Hành động mới GARDEN_CHASE_DRAGONFLY chạy đuổi 2 chuồn chuồn + 1 bướm vàng 60fps
// =============================================================================
const DEMO_BEATS = [
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_SUMMER_GREET',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'HỒI 1: MÙA HÈ Ở QUÊ ÔNG NỘI',
    narrationText:
      'Hồi mười hai tuổi, nghỉ hè vừa tới là tôi được ba mẹ gửi ngay về quê chơi với ông nội suốt hai tháng trời.',
    transitionIn: 'CUT',
    transitionFrames: 0,
    pauseAfterSec: 0.4,
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_CHASE_DRAGONFLY',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Ở quê chẳng có máy tính hay điện thoại, nên thú vui lớn nhất của tôi mỗi buổi chiều là cầm que chạy đuổi chuồn chuồn khắp mảnh vườn sau nhà.',
    transitionIn: 'CROSSFADE',
    transitionFrames: 30,
    pauseAfterSec: 0.4,
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_STROLL_MANGO',
    voiceTone: 'HOOK_INTRIGUE',
    narrationText:
      'Thế nhưng ngay ngày đầu tiên, tôi đã bắt gặp một thứ cực kỳ lạ lùng dưới gốc cây xoài.',
    transitionIn: 'CROSSFADE',
    transitionFrames: 30,
    pauseAfterSec: 0.4,
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_FIND_MOUND',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Sát dưới gốc xoài cổ thụ có một mô đất nâu tròn xoe nhô cao khỏi mặt cỏ, khiến tôi rón rén cúi sát lại săm soi.',
    transitionIn: 'CROSSFADE',
    transitionFrames: 30,
    pauseAfterSec: 0.4,
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.05],
  },
];

async function main() {
  const cliArgs = parseChapterRenderCliArgs(process.argv);
  const encoderInfo = detectBestHardwareEncoder();

  console.log('====================================================================');
  console.log('V16.0 MICRO-BEAT DEMO: MẶT THÂN THIỆN + CROSSFADE 0.5s + ĐỒNG BỘ 1-1');
  console.log(`TTS Provider: VIENEU_LOCAL (Strict Single-Voice Lock: "${VIENEU_VOICE}" | atempo=${VIENEU_ATEMPO})`);
  console.log(`Video Encoder: ${encoderInfo.encoder} (${encoderInfo.reason})`);
  console.log('====================================================================');

  const chapters = [
    {
      chapterNumber: 1,
      title: 'Demo V16.0 — 4 Micro-Beats (Crossfade 0.5s + Pause 0.4s)',
      beats: DEMO_BEATS,
    },
  ];

  let remotionRendererMod = null;
  let remotionBundlerMod = null;

  const summary = await renderLongMovieByChapters(chapters, videoWorkspaceOut, {
    movieId: MOVIE_ID,
    movieTitle: 'V16.0 Micro-Beat Demo — Kiến Lửa Mở Đầu',
    workspaceRoot,
    ttsCacheDir,
    fps: 60,
    cliArgs,
    renderEngineVersionTag: 'v16_0_friendly_face_crossfade_microbeat',

    // 1. Tổng hợp giọng đọc VieNeu-TTS local (hỗ trợ ttsText phát âm riêng, Strict Single-Voice Lock)
    synthesizeBeatAudio: async (beat, globalIdx) => {
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
        throw new Error(
          `[Strict Single-Voice Lock] VieNeu-TTS local lỗi tại Micro-beat #${globalIdx + 1}: ${outcome.errorReason}.`
        );
      }
      return outcome.result;
    },

    // 2. Trộn giọng đọc với BGM & Auto SFX V13–V15
    mixChapterAudio: ({ chapterNumber, voiceMasterWavPath, compiledBeats, chapterTotalFrames, outputWavPath }) => {
      const mixRes = mixMasterAudioWithSoundDesign({
        voiceMasterWavPath,
        beats: compiledBeats,
        totalFrames: chapterTotalFrames,
        fps: 60,
        outputWavPath,
        cacheDir: SOUND_DESIGN_CACHE_DIR,
      });
      const bgmSummary = mixRes.plan.bgmSegments
        .map((s) => `${s.trackId}[${(s.startFrame / 60).toFixed(1)}s-${(s.endFrame / 60).toFixed(1)}s]`)
        .join(', ');
      return {
        durationSec: mixRes.durationSec,
        summaryLog: `  -> [Audio V16 | Chunk ${chapterNumber}] BGM: ${bgmSummary} | SFX: ${mixRes.plan.sfxCues.length} cues`,
      };
    },

    // 3. Bundle Remotion & Chromium 1 lần duy nhất
    prepareRenderer: async () => {
      if (!remotionBundlerMod) remotionBundlerMod = await import('@remotion/bundler');
      if (!remotionRendererMod) remotionRendererMod = await import('@remotion/renderer');

      const entryPoint = path.join(workspaceRoot, 'web-studio', 'src', 'remotion', 'index.ts');
      const isCi = isLinuxOrCiEnvironment();
      console.log(`\n-> Bundling Remotion V16.0 composition...`);
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

    // 4. Xuất ảnh tĩnh kiểm chứng V16.0 (luôn xuất cả khi chạy --stills-only lẫn full render!)
    renderChapterStills: async (ctx) => {
      if (!remotionRendererMod) return;

      const basePayload = {
        title: 'V16.0 Micro-Beat Demo',
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
        inputProps: { payload: basePayload, showDebugHud: false },
        chunkLabel: ctx.chunkLabel,
      });

      const b1 = ctx.compiledBeats[0];
      const b2 = ctx.compiledBeats[1];
      const b3 = ctx.compiledBeats[2];

      // Payload phóng cận mặt BOY + GRANDPA cho still_v16_new_face_boy.jpg để kiểm tra chi tiết mắt/lông mày/tóc mái mới!
      const closeupBeats = ctx.compiledBeats.map((b, idx) =>
        idx === 0 ? { ...b, cameraZoom: [1.62, 1.62] } : b
      );
      const closeupPayload = {
        ...basePayload,
        beats: closeupBeats,
      };
      const closeupComposition = await selectCompositionWithCheckpoints({
        selectComposition: remotionRendererMod.selectComposition,
        serveUrl: ctx.bundleLocation,
        id: 'V7MovieComposition',
        puppeteerInstance: ctx.browserInstance,
        inputProps: { payload: closeupPayload, v7MoviePayload: closeupPayload, showDebugHud: false },
        chunkLabel: `${ctx.chunkLabel} (CloseUp)`,
      });

      // Chọn frame chạy mở sải chân rõ nhất (runCycle ≈ 0.25 => localFrame % 28 ≈ 7) quanh giữa Beat 2
      const b2MidLocal = Math.floor(b2.durationFrames * 0.48);
      const b2StrideLocal = b2MidLocal - (b2MidLocal % 28) + 7;

      const stills = [
        {
          frame: b1.startFrame + Math.floor(b1.durationFrames * 0.68),
          name: 'still_v16_new_face_boy.jpg',
          desc: 'Cận cảnh khuôn mặt thân thiện mới V16.0 của BOY (mắt to +25% chấm sáng trắng, không lông mày mặc định, bỏ nét cằm xám, tóc mái mềm)',
          payload: closeupPayload,
          comp: closeupComposition,
        },
        {
          frame: b2.startFrame + b2StrideLocal,
          name: 'still_v16_chase_dragonfly.jpg',
          desc: 'Cảnh mới GARDEN_CHASE_DRAGONFLY: BOY cầm que chạy đuổi 2 chuồn chuồn + 1 bướm vàng 60fps',
          payload: basePayload,
          comp: composition,
        },
        {
          frame: b2.startFrame + 15,
          name: 'still_v16_crossfade_mid.jpg',
          desc: 'Điểm giữa Crossfade 0.5s (frame +15 = 50% Beat 1 + 50% Beat 2, kiểm chứng 0% nháy đen)',
          payload: basePayload,
          comp: composition,
        },
        {
          frame: b3.startFrame + Math.floor(b3.durationFrames * 0.68),
          name: 'still_v16_beat3_bubble.jpg',
          desc: 'Micro-beat 3: BOY chậm bước trước mô đất, bật bóng thoại "Kìa, cái gì thế?" + lông mày tò mò tinh tế',
          payload: basePayload,
          comp: composition,
        },
      ];

      for (const s of stills) {
        const outPath = path.join(workspaceRoot, 'out', s.name);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        console.log(`  [Still V16] Frame ${s.frame} (${s.desc}) -> ${s.name}`);
        await remotionRendererMod.renderStill({
          composition: s.comp,
          serveUrl: ctx.bundleLocation,
          output: outPath,
          frame: s.frame,
          imageFormat: 'jpeg',
          jpegQuality: 92,
          chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
          puppeteerInstance: ctx.browserInstance,
          inputProps: { payload: s.payload, v7MoviePayload: s.payload, showDebugHud: false },
        });
        if (hasLocalArtifactDir) {
          fs.copyFileSync(outPath, path.join(localArtifactDir, s.name));
        }
      }
    },

    // 5. Render video Demo V16.0 bằng Hybrid CPU + GPU
    renderChapterVideo: async (ctx) => {
      const payload = {
        title: 'V16.0 Micro-Beat Demo',
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
        inputProps: { payload, showDebugHud: false },
        chunkLabel: ctx.chunkLabel,
      });

      const res = await renderVideoHybridCpuGpu({
        composition,
        serveUrl: ctx.bundleLocation,
        inputProps: { payload, showDebugHud: false },
        masterAudioPath: ctx.chapterMasterAudioPath,
        outputPath: ctx.chunkOutputPath,
        isPreview: ctx.isPreview,
        concurrency: ctx.concurrency,
        jpegQuality: 90,
        chunkLabel: ctx.chunkLabel,
        tempDirPrefix: 'v16_microbeat_demo_frames_',
        renderFrames: remotionRendererMod.renderFrames,
        renderMedia: remotionRendererMod.renderMedia,
        puppeteerInstance: ctx.browserInstance,
      });

      return {
        elapsedSec: res.elapsedSec,
        sizeBytes: res.sizeBytes,
      };
    },
  });

  if (
    hasLocalArtifactDir &&
    !cliArgs.isStillsOnly &&
    fs.existsSync(summary.outputPath)
  ) {
    const artifactOut = path.join(localArtifactDir, path.basename(summary.outputPath));
    fs.copyFileSync(summary.outputPath, artifactOut);
    console.log(`-> Đã đồng bộ bản sao artifact: ${artifactOut}`);
  }
}

main().catch((err) => {
  console.error('Fatal V16.0 demo render error:', err);
  process.exit(1);
});
