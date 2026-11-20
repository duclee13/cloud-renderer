import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  HYBRID_GPU_CHROMIUM_OPTIONS,
  detectBestHardwareEncoder,
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
} from '../src/lib/v7/chapterChunkedRenderer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../..');
const localArtifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const hasLocalArtifactDir = fs.existsSync(localArtifactDir);

const MOVIE_ID = 'v14_countryside_story_demo';
const VIENEU_URL = (process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL || 'http://127.0.0.1:8000/v1/audio/speech').trim();
const VIENEU_VOICE = (process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE || 'Hải Đăng').trim();
const VIENEU_ATEMPO = Number(process.env.VIENEU_TTS_ATEMPO) || 1.10;

const videoWorkspaceOut = path.join(workspaceRoot, 'out', 'test_v14_countryside_story_demo.mp4');
const ttsCacheDir = path.join(workspaceRoot, '.tts-cache', 'v14_countryside_demo_vieneu');

// =============================================================================
// KỊCH BẢN KỂ CHUYỆN ĐỜI SỐNG TỰ NHIÊN V14.1 (8 PHÂN CẢNH — 2 HỒI CHIA CHƯƠNG)
// =============================================================================
const RAW_BEATS = [
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_SUMMER_GREET',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'MÙA HÈ Ở QUÊ ÔNG NỘI',
    headerTitle: 'MÙA HÈ Ở QUÊ ÔNG NỘI',
    narrationText:
      'Hồi 12 tuổi, ba mẹ gửi tôi về quê ở với ông nội suốt mùa hè. Sân nhà ông rộng lắm, ngay sát cánh đồng lúa vàng ươm.',
    startX: 745,
    targetX: 745,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_FIND_MOUND',
    voiceTone: 'CALM_STORY',
    headerTitle: 'MÔ ĐẤT TRÒN XOE DƯỚI GỐC XOÀI',
    narrationText:
      'Một buổi chiều lang thang ngoài vườn, tôi bỗng thấy một mô đất tròn xoe nhô lên ngay sát gốc cây xoài.',
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.05],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_BUN_COMPARE',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: 'KHÔNG CÓ LỖ?',
    headerTitle: 'KHÔNG CÓ LỖ?',
    narrationText:
      'Trông nó giống hệt một chiếc bánh bao bằng đất, chẳng có cái lỗ nào ở trên đỉnh cả.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_POKE_MOUND',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    headerTitle: 'CHỌC THỬ MỘT CÁI NHẸ...',
    narrationText:
      'Tò mò quá, tôi lấy cành cây chọc thử một cái. Chỉ một cái nhẹ thôi...',
    startX: 910,
    targetX: 910,
    cameraZoom: [1.0, 1.07],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_ANTS_BOIL',
    voiceTone: 'TENSE_CLIMAX',
    floatingHeader: 'MÔ ĐẤT SÔI LÊN!',
    headerTitle: 'MÔ ĐẤT SÔI LÊN!',
    narrationText:
      'Chưa đầy hai giây, cả mô đất như sôi lên! Chúng không chạy loạn mà leo thẳng lên cành cây hướng về tay tôi!',
    startX: 820,
    targetX: 820,
    cameraZoom: [1.03, 1.07],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_GRANDPA_LAUGH',
    voiceTone: 'CALM_STORY',
    headerTitle: 'KIẾN LỬA ĐÓ CON!',
    narrationText:
      'Ông nội nghe tiếng la liền bước ra, nhìn mô đất rồi bật cười lắc đầu: Kiến lửa đó con, đừng có ghẹo tụi nó!',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'EXACT_QUANTITATIVE',
    stageTheme: 'UNDERGROUND_CROSS_SECTION',
    kassSceneMode: 'UNDERGROUND_ANT_CITY',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: 'THÀNH PHỐ DƯỚI LÒNG ĐẤT',
    headerTitle: 'THÀNH PHỐ DƯỚI LÒNG ĐẤT',
    narrationText:
      'Lúc đó tôi mới biết, mô đất nhỏ xíu trên mặt cỏ chỉ là phần nổi — bên dưới là cả một thành phố đường hầm sâu hơn một mét chứa hàng trăm nghìn con kiến!',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'EXACT_QUANTITATIVE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_SEVEN_DAYS_OUTRO',
    voiceTone: 'SLOW_EMOTIONAL',
    extraTailFrames: 24,
    floatingHeader: 'TUẦN LỄ NHỚ ĐỜI...',
    headerTitle: 'TUẦN LỄ NHỚ ĐỜI...',
    narrationText:
      'Và hóa ra, câu chuyện với tổ kiến lửa dưới gốc xoài hôm đó mới chỉ là bắt đầu cho một tuần lễ nhớ đời của tôi...',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
];

async function main() {
  const cliArgs = parseChapterRenderCliArgs(process.argv);
  const totalChapters = cliArgs.totalChaptersOverride || 2;
  const chapters = splitBeatsIntoChapters(RAW_BEATS, totalChapters, [
    'Hồi 1: Mùa Hè Quê Nội & Mô Đất Kỳ Lạ Dưới Gốc Xoài',
    'Hồi 2: Kiến Lửa Sôi Sục & Thành Phố Dưới Lòng Đất',
  ]);

  let remotionRendererMod = null;

  const summary = await renderLongMovieByChapters(chapters, videoWorkspaceOut, {
    movieId: MOVIE_ID,
    movieTitle: 'Mô Đất Kỳ Lạ Dưới Gốc Xoài (V14.1 Smooth 60fps & Chunked Chapters)',
    workspaceRoot,
    ttsCacheDir,
    fps: 60,
    cliArgs,
    renderEngineVersionTag: 'v14_1_smooth60fps_living_scene',

    // 1. Strict Single-Voice Lock: 100% VIENEU_LOCAL (tự đọc từ .tts-cache/ khi đã có cache, không cần gọi server trên GitHub Actions!)
    synthesizeBeatAudio: async (beat, globalBeatIndex) => {
      const attempt = await synthesizeVieneuLocalTtsBeat({
        text: beat.narrationText,
        voiceTone: beat.voiceTone,
        voice: VIENEU_VOICE,
        atempo: VIENEU_ATEMPO,
        url: VIENEU_URL,
        cacheDir: ttsCacheDir,
      });

      if (!attempt.ok || !attempt.result) {
        throw new Error(
          `[Strict Single-Voice Lock V14.1] Beat #${globalBeatIndex + 1} thất bại với VIENEU_LOCAL (${VIENEU_VOICE}): ${attempt.errorReason}.`
        );
      }

      const vr = attempt.result;
      return {
        mp3Buffer: vr.mp3Buffer,
        audioUrl: vr.audioUrl,
        actualDurationSec: vr.actualDurationSec,
        totalDurationMs: vr.totalDurationMs,
        totalDurationFrames: vr.totalDurationFrames,
        voiceName: vr.voiceName,
        fromCache: vr.fromCache,
        cacheFilePath: vr.cacheFilePath,
        engine: `VIENEU_LOCAL (${vr.voiceName}${vr.fromCache ? ', cache' : ''})`,
      };
    },

    // 2. Trộn âm thanh phòng thu V13.0 (Voice + 3 BGM -22dB crossfade + 6 SFX) cho từng Hồi
    mixChapterAudio: ({ chapterNumber, voiceMasterWavPath, compiledBeats, chapterTotalFrames, outputWavPath }) => {
      const mix = mixMasterAudioWithSoundDesign({
        voiceMasterWavPath,
        beats: compiledBeats,
        totalFrames: chapterTotalFrames,
        fps: 60,
        outputWavPath,
        cacheDir: SOUND_DESIGN_CACHE_DIR,
      });
      const sfxCounts = {};
      for (const cue of mix.plan.sfxCues) {
        sfxCounts[cue.effectId] = (sfxCounts[cue.effectId] || 0) + 1;
      }
      return {
        durationSec: mix.durationSec,
        summaryLog:
          `  => [SoundMix Hồi ${chapterNumber}] BGM=${mix.plan.bgmSegments
            .map((s) => s.trackId)
            .join('->')} | SFX(${mix.plan.sfxCues.length})=${JSON.stringify(sfxCounts)}`,
      };
    },

    // 3. Lazy-load Remotion Bundler & Chromium (chỉ nạp khi thực sự cần render frame; --concat-only & --audio-only chạy tức thì!)
    prepareRenderer: async () => {
      const { bundle } = await import('@remotion/bundler');
      remotionRendererMod = await import('@remotion/renderer');
      const hwEncoder = detectBestHardwareEncoder();
      console.log(
        `-> Khởi chạy Remotion Bundler & Chromium (${HYBRID_GPU_CHROMIUM_OPTIONS.gl.toUpperCase()} | Encoder: ${hwEncoder.displayName})...`
      );
      const entryPoint = path.resolve(workspaceRoot, 'web-studio/src/remotion/index.ts');
      const bundleLocation = await bundle({
        entryPoint,
        onProgress: (p) => {
          if (p % 25 === 0) console.log(`Bundling: ${p}%`);
        },
      });
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

    // 4. Xuất ảnh tĩnh kiểm chứng chuyển động 60fps Beat 1 (đang bước tới + vẫy tay & tới giữa sân vẫy đáp lại ông nội)
    renderChapterStills: async (ctx) => {
      if (!remotionRendererMod) return;
      const shouldExportStills = cliArgs.isStillsOnly || hasLocalArtifactDir;
      if (!shouldExportStills) return;

      const payload = {
        title: `Mô Đất Kỳ Lạ Dưới Gốc Xoài — Hồi ${ctx.chapter.chapterNumber}`,
        totalDurationFrames: ctx.chapterTotalFrames,
        fps: 60,
        beats: ctx.compiledBeats,
        showDebugHud: false,
      };
      const composition = await remotionRendererMod.selectComposition({
        serveUrl: ctx.bundleLocation,
        id: 'V7MovieComposition',
        puppeteerInstance: ctx.browserInstance,
        inputProps: { payload, showDebugHud: false },
      });

      const stills = [];
      for (const b of ctx.compiledBeats) {
        if (b.kassSceneMode === 'YARD_SUMMER_GREET') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.28),
            name: 'still_v14_1_beat1_walk_wave.jpg',
            desc: 'Beat 1 (u=0.28): BOY đang bước vui vẻ tiến vào giữa sân & vừa đi vừa vẫy tay mượt 60fps, GRANDPA gật gù vẫy chào đáp lại',
          });
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.72),
            name: 'still_v14_beat1_yard.jpg',
            desc: 'Beat 1 (u=0.72): BOY tới giữa sân cười tươi vẫy tay 60fps + GRANDPA trước cửa nhà ngói đỏ vẫy chào',
          });
        } else if (b.kassSceneMode === 'GARDEN_ANTS_BOIL') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.36),
            name: 'still_v14_beat5_stickman.jpg',
            desc: 'Beat 5 (V14.1): BOY nét đen đặc 6px giật mình quăng cành cây + Comic Shiver Lines + bóng thoại "ÁAA!"',
          });
        } else if (b.kassSceneMode === 'UNDERGROUND_ANT_CITY') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.55),
            name: 'still_v14_beat7_underground.jpg',
            desc: 'Beat 7 (V14.1): Mặt cắt thành phố đường hầm kiến lửa sâu > 1m dưới mô đất nhỏ',
          });
        }
      }

      for (const s of stills) {
        const outPath = path.join(workspaceRoot, 'out', s.name);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        console.log(`  [Still] Frame ${s.frame} (${s.desc}) -> ${s.name}`);
        await remotionRendererMod.renderStill({
          composition,
          serveUrl: ctx.bundleLocation,
          output: outPath,
          frame: s.frame,
          imageFormat: 'jpeg',
          jpegQuality: 88,
          chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
          puppeteerInstance: ctx.browserInstance,
          inputProps: { payload, showDebugHud: false },
        });
        if (hasLocalArtifactDir) {
          fs.copyFileSync(outPath, path.join(localArtifactDir, s.name));
        }
      }
    },

    // 5. Render từng Hồi thành out/chunks/v14_countryside_story_demo_chapter_<k>.mp4 bằng Hybrid CPU + GPU
    renderChapterVideo: async (ctx) => {
      const payload = {
        title: `Mô Đất Kỳ Lạ Dưới Gốc Xoài — Hồi ${ctx.chapter.chapterNumber}`,
        totalDurationFrames: ctx.chapterTotalFrames,
        fps: 60,
        beats: ctx.compiledBeats,
        showDebugHud: false,
      };
      const composition = await remotionRendererMod.selectComposition({
        serveUrl: ctx.bundleLocation,
        id: 'V7MovieComposition',
        puppeteerInstance: ctx.browserInstance,
        inputProps: { payload, showDebugHud: false },
      });

      const res = await renderVideoHybridCpuGpu({
        composition,
        serveUrl: ctx.bundleLocation,
        inputProps: { payload, showDebugHud: false },
        masterAudioPath: ctx.chapterMasterAudioPath,
        outputPath: ctx.chunkOutputPath,
        isPreview: ctx.isPreview,
        concurrency: ctx.concurrency,
        jpegQuality: 88,
        tempDirPrefix: `v14_1_ch${ctx.chapter.chapterNumber}_frames_`,
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

  // Đồng bộ file MP4 hoàn chỉnh sang thư mục Artifact cục bộ (nếu đang chạy trên máy dev Windows)
  if (
    hasLocalArtifactDir &&
    (summary.mode === 'ALL_AND_CONCAT' || summary.mode === 'CONCAT_ONLY') &&
    !cliArgs.isStillsOnly &&
    fs.existsSync(summary.outputPath)
  ) {
    const artifactOut = path.join(localArtifactDir, path.basename(summary.outputPath));
    fs.copyFileSync(summary.outputPath, artifactOut);
    console.log(`-> Đã đồng bộ bản sao artifact: ${artifactOut}`);
  }
}

main().catch((err) => {
  console.error('Fatal V14.1 chunked render error:', err);
  process.exit(1);
});
