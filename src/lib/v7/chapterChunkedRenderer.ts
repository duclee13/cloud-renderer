/**
 * CHAPTER CHUNKED RENDERER V14.1 (Engine Render Chia Chương — Laptop 8GB RAM & GitHub Actions Matrix Song Song)
 * Hỗ trợ đầy đủ 4 chế độ vận hành qua CLI flags:
 * 1. Mặc định (Laptop): Tự động render lần lượt từng Hồi (Chapter 1..N) ra out/chunks/<movieId>_chapter_<k>.mp4
 *    (bỏ qua Hồi đã có cache khớp SHA-256 kịch bản), sau đó ghép không nén lại bằng FFmpeg concat (-c copy).
 * 2. Tách Hồi song song (--chapter=<k>, 1-indexed): Chỉ render duy nhất Hồi thứ <k> cho máy ảo Matrix GitHub Actions
 *    (tự nhận CONCURRENCY từ env, mặc định 2 trên laptop 8GB và 4 trên server/CI 16GB RAM).
 * 3. Chỉ ghép phim (--concat-only): Không render frame hay tạo tiếng, chỉ gọi ffmpeg -f concat -c copy nối toàn bộ
 *    out/chunks/<movieId>_chapter_*.mp4 thành file outputPath trong ~1 giây.
 * 4. Chỉ tạo tiếng trước khi đẩy GitHub (--audio-only): Tổng hợp toàn bộ file .mp3 vào .tts-cache/ và ghi manifest.json rồi dừng.
 */

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { execSync } from "child_process";

export type ChapterRenderMode = "ALL_AND_CONCAT" | "SINGLE_CHAPTER" | "CONCAT_ONLY" | "AUDIO_ONLY";

export interface ChapterRenderCliArgs {
  mode: ChapterRenderMode;
  chapterIndex: number | null; // 1-indexed khi mode === "SINGLE_CHAPTER"
  isPreview: boolean;
  isStillsOnly: boolean;
  forceRerender: boolean;
  clearTtsCache: boolean;
  concurrency: number;
  totalChaptersOverride: number | null;
  outputOverride: string | null;
}

export interface ChapterDefinition<TBeat = Record<string, any>> {
  chapterNumber: number; // 1-indexed (1..N)
  title: string;
  beats: TBeat[];
}

export interface SynthesizedBeatAudio {
  mp3Buffer: Buffer;
  audioUrl: string;
  actualDurationSec: number;
  totalDurationMs: number;
  totalDurationFrames: number;
  voiceName: string;
  fromCache: boolean;
  cacheFilePath?: string;
  engine: string;
}

export interface ChapterCompiledBeat {
  startFrame: number;
  durationFrames: number;
  narrationText?: string;
  voiceTone?: string;
  [key: string]: any;
}

export interface ChapterAudioManifestEntry {
  globalBeatIndex: number;
  chapterNumber: number;
  chapterBeatIndex: number;
  narrationText: string;
  voiceTone: string;
  voiceName: string;
  actualDurationSec: number;
  totalDurationFrames: number;
  cacheFile: string;
}

export interface ChapterAudioManifest {
  version: string;
  movieId: string;
  generatedAt: string;
  totalChapters: number;
  totalBeats: number;
  totalFrames: number;
  totalDurationSec: number;
  beats: ChapterAudioManifestEntry[];
}

export interface ChapterRenderContext<TBeat = Record<string, any>> {
  chapter: ChapterDefinition<TBeat>;
  totalChapters: number;
  chunkLabel: string;
  compiledBeats: ChapterCompiledBeat[];
  chapterTotalFrames: number;
  chapterMasterAudioPath: string;
  chunkOutputPath: string;
  isPreview: boolean;
  concurrency: number;
  bundleLocation: string;
  browserInstance: any;
}

export interface ChapterChunkResult {
  chapterNumber: number;
  title: string;
  chunkPath: string;
  durationSec: number;
  frames: number;
  sizeBytes: number;
  skippedFromCache: boolean;
  elapsedSec: number;
}

export interface RenderLongMovieByChaptersOptions<TBeat = Record<string, any>> {
  movieId: string;
  movieTitle?: string;
  workspaceRoot: string;
  ttsCacheDir: string;
  fps?: number;
  cliArgs?: ChapterRenderCliArgs;
  /** Tổng hợp (hoặc đọc cache đĩa) 1 câu thoại bằng VIENEU_LOCAL (Strict Single-Voice Lock) */
  synthesizeBeatAudio: (beat: TBeat, globalBeatIndex: number) => Promise<SynthesizedBeatAudio>;
  /** Trộn giọng đọc chủ đạo của 1 Hồi với BGM & 6 SFX V13.0 thành 1 file WAV 44.1kHz */
  mixChapterAudio: (params: {
    chapterNumber: number;
    voiceMasterWavPath: string;
    compiledBeats: ChapterCompiledBeat[];
    chapterTotalFrames: number;
    outputWavPath: string;
  }) => { durationSec: number; summaryLog?: string };
  /** Khởi tạo Remotion bundle + Chromium browser 1 lần dùng chung cho các Hồi cần render */
  prepareRenderer: () => Promise<{ bundleLocation: string; browserInstance: any; close: () => Promise<void> }>;
  /** Kết xuất 1 Hồi thành file chunk MP4 (qua renderVideoHybridCpuGpu) */
  renderChapterVideo: (ctx: ChapterRenderContext<TBeat>) => Promise<{ elapsedSec: number; sizeBytes: number }>;
  /** Tùy chọn: Xuất ảnh tĩnh kiểm chứng ngay trong quá trình chạy từng Hồi */
  renderChapterStills?: (ctx: ChapterRenderContext<TBeat>) => Promise<void>;
  /** Tùy chọn: Chuỗi phiên bản render để tự vô hiệu hóa cache chunk nếu nâng cấp engine hình ảnh */
  renderEngineVersionTag?: string;
}

export interface RenderLongMovieSummary {
  mode: ChapterRenderMode;
  movieId: string;
  outputPath: string;
  chunksDir: string;
  totalChapters: number;
  chaptersProcessed: ChapterChunkResult[];
  finalDurationSec: number;
  finalSizeBytes: number;
  concatElapsedSec: number;
  manifestPath?: string;
}

/**
 * Tự động xác định độ song song mặc định theo phần cứng (V15.1):
 * - Trên Linux / GitHub Actions CI (runner 4 vCPU): mặc định 2, giới hạn tối đa 3 để tránh deadlock/OOM Chromium!
 * - Trên Windows laptop 8GB RAM: mặc định 2 (cho phép ghi đè qua CONCURRENCY / RENDER_CONCURRENCY).
 */
export function resolveDefaultConcurrency(): number {
  const isLinuxOrCi =
    process.platform === "linux" || process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
  const envVal = Number(process.env.CONCURRENCY || process.env.RENDER_CONCURRENCY || "");
  if (Number.isFinite(envVal) && envVal >= 1) {
    const clean = Math.floor(envVal);
    return isLinuxOrCi ? Math.min(3, Math.max(1, clean)) : Math.min(8, Math.max(1, clean));
  }
  return 2;
}

/**
 * Đọc toàn bộ cờ dòng lệnh chuẩn V14.1:
 * --chapter=<k> | --concat-only | --audio-only | --preview | --stills-only | --force | --clear-cache | --output=<path>
 */
export function parseChapterRenderCliArgs(argv: string[] = process.argv): ChapterRenderCliArgs {
  let chapterIndex: number | null = null;
  let outputOverride: string | null = null;
  let totalChaptersOverride: number | null = null;

  const isConcatOnly = argv.includes("--concat-only");
  const isAudioOnly = argv.includes("--audio-only");
  const isPreview = argv.includes("--preview");
  const isStillsOnly = argv.includes("--stills-only");
  const forceRerender = argv.includes("--force") || argv.includes("--clear-chunk-cache");
  const clearTtsCache = argv.includes("--clear-cache");

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--chapter=")) {
      const n = parseInt(arg.slice("--chapter=".length), 10);
      if (Number.isFinite(n) && n >= 1) chapterIndex = n;
    } else if (arg === "--chapter" && argv[i + 1]) {
      const n = parseInt(argv[i + 1], 10);
      if (Number.isFinite(n) && n >= 1) chapterIndex = n;
    } else if (arg.startsWith("--output=")) {
      outputOverride = arg.slice("--output=".length).trim() || null;
    } else if (arg === "--output" && argv[i + 1]) {
      outputOverride = argv[i + 1].trim() || null;
    } else if (arg.startsWith("--total-chapters=")) {
      const n = parseInt(arg.slice("--total-chapters=".length), 10);
      if (Number.isFinite(n) && n >= 1) totalChaptersOverride = n;
    } else if (arg === "--total-chapters" && argv[i + 1]) {
      const n = parseInt(argv[i + 1], 10);
      if (Number.isFinite(n) && n >= 1) totalChaptersOverride = n;
    }
  }

  if (totalChaptersOverride === null && process.env.TOTAL_CHAPTERS) {
    const envTotal = parseInt(process.env.TOTAL_CHAPTERS, 10);
    if (Number.isFinite(envTotal) && envTotal >= 1) {
      totalChaptersOverride = envTotal;
    }
  }

  let mode: ChapterRenderMode = "ALL_AND_CONCAT";
  if (isAudioOnly) {
    mode = "AUDIO_ONLY";
  } else if (isConcatOnly) {
    mode = "CONCAT_ONLY";
  } else if (chapterIndex !== null) {
    mode = "SINGLE_CHAPTER";
  }

  return {
    mode,
    chapterIndex,
    isPreview,
    isStillsOnly,
    forceRerender,
    clearTtsCache,
    concurrency: resolveDefaultConcurrency(),
    totalChaptersOverride,
    outputOverride,
  };
}

/**
 * Chia đều một danh sách beat bất kỳ thành N Hồi (Chapter 1..N) — cực tiện cho cả phim 2 Hồi lẫn phim dài 4–5 Hồi!
 */
export function splitBeatsIntoChapters<T>(
  beats: T[],
  totalChapters: number,
  chapterTitles?: string[]
): ChapterDefinition<T>[] {
  const safeN = Math.max(1, Math.min(beats.length, Math.floor(totalChapters)));
  const chapters: ChapterDefinition<T>[] = [];
  const baseSize = Math.floor(beats.length / safeN);
  const remainder = beats.length % safeN;

  let cursor = 0;
  for (let i = 0; i < safeN; i++) {
    const count = baseSize + (i < remainder ? 1 : 0);
    const slice = beats.slice(cursor, cursor + count);
    const beatStartNum = cursor + 1;
    const beatEndNum = cursor + count;
    cursor += count;
    chapters.push({
      chapterNumber: i + 1,
      title: chapterTitles?.[i] || `Chunk ${i + 1}/${safeN} (Beats ${beatStartNum}–${beatEndNum})`,
      beats: slice,
    });
  }
  return chapters;
}

/**
 * V15.1 Dynamic Cloud Chunking:
 * Nếu Cloud truyền --total-chapters=<N> (hoặc TOTAL_CHAPTERS=<N>) khác số hồi mặc định của kịch bản
 * (VD: kịch bản 4 Hồi = 40 beats, nhưng Cloud truyền N=10), tự động trải phẳng toàn bộ beats giữ đúng thứ tự
 * và chia đều thành N chunk (VD: 10 chunk × 4 beats) — giữ nguyên 100% cache key TTS & tính SoundDesign khớp từng chunk!
 */
export function rechunkChaptersDynamically<T>(
  inputChapters: ChapterDefinition<T>[],
  requestedTotalChapters: number | null | undefined
): ChapterDefinition<T>[] {
  if (
    !requestedTotalChapters ||
    !Number.isFinite(requestedTotalChapters) ||
    requestedTotalChapters < 1 ||
    requestedTotalChapters === inputChapters.length
  ) {
    return inputChapters;
  }
  const flattenedBeats: T[] = [];
  for (const ch of inputChapters) {
    for (const beat of ch.beats) {
      flattenedBeats.push(beat);
    }
  }
  if (flattenedBeats.length === 0) return inputChapters;
  return splitBeatsIntoChapters(flattenedBeats, requestedTotalChapters);
}

export function measureMediaDurationFfprobe(filePath: string): number {
  const safePath = filePath.replace(/\\/g, "/");
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${safePath}"`,
    { stdio: ["ignore", "pipe", "pipe"] }
  )
    .toString()
    .trim();
  const parsed = parseFloat(out);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`ffprobe returned invalid duration for ${filePath}: "${out}"`);
  }
  return parsed;
}

export function getChapterChunkFilePath(chunksDir: string, movieId: string, chapterNumber: number): string {
  return path.join(chunksDir, `${movieId}_chapter_${chapterNumber}.mp4`);
}

export function computeChapterScriptHash(params: {
  movieId: string;
  chapterNumber: number;
  title: string;
  isPreview: boolean;
  renderEngineVersionTag: string;
  compiledBeats: ChapterCompiledBeat[];
}): string {
  const normalizedBeats = params.compiledBeats.map((b) => {
    // Bỏ qua các trường tạm như audioUrl base64 lớn để hash gọn & chính xác theo nội dung kịch bản + duration
    const clone: Record<string, any> = {};
    for (const k of Object.keys(b).sort()) {
      if (k === "audioUrl") continue;
      clone[k] = b[k];
    }
    return clone;
  });
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        movieId: params.movieId,
        chapterNumber: params.chapterNumber,
        title: params.title,
        isPreview: params.isPreview,
        renderEngineVersionTag: params.renderEngineVersionTag,
        beats: normalizedBeats,
      })
    )
    .digest("hex")
    .slice(0, 32);
}

/**
 * Ghép nối không nén lại (Lossless Copy) toàn bộ out/chunks/<movieId>_chapter_*.mp4 thành 1 file MP4 hoàn chỉnh trong ~1 giây
 */
export function concatChapterChunksWithFfmpeg(
  chunkPaths: string[],
  outputPath: string,
  chunksDir: string
): { elapsedSec: number; durationSec: number; sizeBytes: number } {
  if (chunkPaths.length === 0) {
    throw new Error("Không có file chunk chương nào để ghép nối!");
  }
  for (const cp of chunkPaths) {
    if (!fs.existsSync(cp) || fs.statSync(cp).size < 1024) {
      throw new Error(`Thiếu hoặc hỏng file mảnh chương: ${cp}`);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const concatListPath = path.join(chunksDir, "concat_list.txt");
  const lines = chunkPaths.map((p) => `file '${path.resolve(p).replace(/\\/g, "/")}'`).join("\n");
  fs.writeFileSync(concatListPath, lines + "\n", "utf8");

  const startMs = Date.now();
  const safeList = concatListPath.replace(/\\/g, "/");
  const safeOut = path.resolve(outputPath).replace(/\\/g, "/");

  execSync(
    `ffmpeg -y -v error -f concat -safe 0 -i "${safeList}" -c copy -movflags +faststart "${safeOut}"`
  );

  const elapsedSec = Number(((Date.now() - startMs) / 1000).toFixed(2));
  const durationSec = measureMediaDurationFfprobe(outputPath);
  const sizeBytes = fs.statSync(outputPath).size;
  return { elapsedSec, durationSec, sizeBytes };
}

/**
 * Chuẩn bị giọng đọc WAV ghép theo đúng nhịp từng frame của 1 Hồi (tái sử dụng 100% cache .mp3 nếu đã có)
 */
async function buildChapterAudioBundle<TBeat extends Record<string, any>>(params: {
  chapter: ChapterDefinition<TBeat>;
  globalBeatStartIdx: number;
  fps: number;
  tempDir: string;
  ttsCacheDir: string;
  synthesizeBeatAudio: (beat: TBeat, globalBeatIndex: number) => Promise<SynthesizedBeatAudio>;
  mixChapterAudio: RenderLongMovieByChaptersOptions<TBeat>["mixChapterAudio"];
}): Promise<{
  compiledBeats: ChapterCompiledBeat[];
  chapterTotalFrames: number;
  chapterMasterAudioPath: string;
  manifestEntries: ChapterAudioManifestEntry[];
  cacheHits: number;
}> {
  const { chapter, globalBeatStartIdx, fps, tempDir, ttsCacheDir, synthesizeBeatAudio, mixChapterAudio } = params;
  const paddedBeatWavFiles: string[] = [];
  const compiledBeats: ChapterCompiledBeat[] = [];
  const manifestEntries: ChapterAudioManifestEntry[] = [];
  let localStartFrame = 0;
  let cacheHits = 0;

  for (let i = 0; i < chapter.beats.length; i++) {
    const rawBeat = chapter.beats[i];
    const globalIdx = globalBeatStartIdx + i;
    const ttsRes = await synthesizeBeatAudio(rawBeat, globalIdx);
    if (ttsRes.fromCache) cacheHits++;

    const extraTailFrames = Number(rawBeat.extraTailFrames) || 0;
    const durationFrames = ttsRes.totalDurationFrames + extraTailFrames;
    const beatTargetSec = durationFrames / fps;
    const padTailSec = Math.max(0.01, beatTargetSec - ttsRes.actualDurationSec);

    const mp3TempPath = path.join(tempDir, `ch${chapter.chapterNumber}_b${String(i + 1).padStart(2, "0")}.mp3`);
    const paddedWavPath = path.join(
      tempDir,
      `ch${chapter.chapterNumber}_b${String(i + 1).padStart(2, "0")}_padded.wav`
    );
    fs.writeFileSync(mp3TempPath, ttsRes.mp3Buffer);

    execSync(
      `ffmpeg -y -v error -i "${mp3TempPath.replace(
        /\\/g,
        "/"
      )}" -filter_complex "[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[a0];anullsrc=r=24000:cl=mono,atrim=duration=${padTailSec.toFixed(
        4
      )}[sil];[a0][sil]concat=n=2:v=0:a=1,atrim=0:${beatTargetSec.toFixed(
        4
      )}[outa]" -map "[outa]" -ar 24000 -ac 1 "${paddedWavPath.replace(/\\/g, "/")}"`
    );
    paddedBeatWavFiles.push(paddedWavPath);

    console.log(
      `  -> [Hồi ${chapter.chapterNumber} | Beat #${String(globalIdx + 1).padStart(2, "0")}] [${
        rawBeat.stageTheme || rawBeat.theme || "STAGE"
      }${rawBeat.kassSceneMode ? `:${rawBeat.kassSceneMode}` : ""} | ${ttsRes.engine}]: audio=${ttsRes.actualDurationSec.toFixed(
        3
      )}s -> ${durationFrames}f`
    );

    compiledBeats.push({
      ...rawBeat,
      type: rawBeat.action || rawBeat.type,
      theme: rawBeat.stageTheme || rawBeat.theme,
      startFrame: localStartFrame,
      durationFrames,
      audioUrl: undefined,
      audioDurationMs: ttsRes.totalDurationMs,
      showDebugHud: false,
    });

    manifestEntries.push({
      globalBeatIndex: globalIdx + 1,
      chapterNumber: chapter.chapterNumber,
      chapterBeatIndex: i + 1,
      narrationText: String(rawBeat.narrationText || ""),
      voiceTone: String(rawBeat.voiceTone || "CALM_STORY"),
      voiceName: ttsRes.voiceName,
      actualDurationSec: Number(ttsRes.actualDurationSec.toFixed(3)),
      totalDurationFrames: durationFrames,
      cacheFile: ttsRes.cacheFilePath ? path.relative(ttsCacheDir, ttsRes.cacheFilePath).replace(/\\/g, "/") : "",
    });

    localStartFrame += durationFrames;
  }

  // Ghép giọng đọc chủ đạo của riêng Hồi này -> Trộn BGM & 6 SFX V13.0
  const voiceOnlyPath = path.join(tempDir, `ch${chapter.chapterNumber}_voice.wav`);
  const mixedOutPath = path.join(tempDir, `ch${chapter.chapterNumber}_master_mixed.wav`);
  const listPath = path.join(tempDir, `ch${chapter.chapterNumber}_wav_list.txt`);
  fs.writeFileSync(
    listPath,
    paddedBeatWavFiles.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
    "utf8"
  );
  execSync(
    `ffmpeg -y -v error -f concat -safe 0 -i "${listPath.replace(/\\/g, "/")}" -ar 24000 -ac 1 "${voiceOnlyPath.replace(
      /\\/g,
      "/"
    )}"`
  );

  const mixRes = mixChapterAudio({
    chapterNumber: chapter.chapterNumber,
    voiceMasterWavPath: voiceOnlyPath,
    compiledBeats,
    chapterTotalFrames: localStartFrame,
    outputWavPath: mixedOutPath,
  });
  if (mixRes.summaryLog) {
    console.log(mixRes.summaryLog);
  }

  return {
    compiledBeats,
    chapterTotalFrames: localStartFrame,
    chapterMasterAudioPath: mixedOutPath,
    manifestEntries,
    cacheHits,
  };
}

/**
 * HÀM CHÍNH DÙNG CHUNG V14.1: renderLongMovieByChapters(chapters, outputPath, options)
 * Điều phối linh hoạt 4 chế độ: Mặc định (Laptop) | --chapter=<k> (CI Matrix) | --concat-only | --audio-only
 */
export async function renderLongMovieByChapters<TBeat extends Record<string, any>>(
  inputChapters: ChapterDefinition<TBeat>[],
  outputPath: string,
  options: RenderLongMovieByChaptersOptions<TBeat>
): Promise<RenderLongMovieSummary> {
  const cli = options.cliArgs || parseChapterRenderCliArgs(process.argv);
  const fps = options.fps || 60;
  // V15.1 Dynamic Cloud Chunking: Tự động trải phẳng và chia đều thành N chunk nếu --total-chapters / TOTAL_CHAPTERS != mặc định
  const chapters = rechunkChaptersDynamically(inputChapters, cli.totalChaptersOverride);
  const wasRechunked = chapters.length !== inputChapters.length;
  const resolvedOutputPath = cli.outputOverride
    ? path.resolve(process.cwd(), cli.outputOverride)
    : path.resolve(outputPath);
  const chunksDir = path.join(options.workspaceRoot, "out", "chunks");
  const renderEngineVersionTag = options.renderEngineVersionTag || "v15_1_swangle_cloud_chunked";

  fs.mkdirSync(chunksDir, { recursive: true });
  fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });

  console.log("====================================================================");
  console.log(
    `[ChapterRenderer V15.1] Movie ID: "${options.movieId}" | Tổng số Chunk: ${chapters.length}` +
      (wasRechunked ? ` (Dynamic Re-chunk từ ${inputChapters.length} Hồi mặc định)` : "")
  );
  console.log(
    `-> Mode: ${cli.mode}${cli.chapterIndex ? ` (Chunk ${cli.chapterIndex}/${chapters.length})` : ""} | ` +
      `Concurrency: ${cli.concurrency} | ${cli.isPreview ? "PREVIEW 720p@30" : "PRODUCTION 1080p@60"}`
  );
  console.log(`-> Chunks Dir: ${chunksDir}`);
  console.log("====================================================================");

  // =========================================================================
  // CHẾ ĐỘ 3: --concat-only (Chỉ ghép mảnh bằng ffmpeg -f concat -c copy trong ~1 giây!)
  // =========================================================================
  if (cli.mode === "CONCAT_ONLY") {
    const chunkPaths = chapters.map((ch) =>
      getChapterChunkFilePath(chunksDir, options.movieId, ch.chapterNumber)
    );
    console.log(`-> [--concat-only] Đang ghép ${chunkPaths.length} mảnh chương bằng FFmpeg (-c copy)...`);
    const concatRes = concatChapterChunksWithFfmpeg(chunkPaths, resolvedOutputPath, chunksDir);
    console.log(
      `✅ [--concat-only] Ghép hoàn tất trong ${concatRes.elapsedSec}s -> ${resolvedOutputPath} ` +
        `(${concatRes.durationSec.toFixed(3)}s | ${(concatRes.sizeBytes / 1024 / 1024).toFixed(2)} MB)`
    );
    return {
      mode: cli.mode,
      movieId: options.movieId,
      outputPath: resolvedOutputPath,
      chunksDir,
      totalChapters: chapters.length,
      chaptersProcessed: [],
      finalDurationSec: concatRes.durationSec,
      finalSizeBytes: concatRes.sizeBytes,
      concatElapsedSec: concatRes.elapsedSec,
    };
  }

  // Xóa cache TTS nếu có cờ --clear-cache
  if (cli.clearTtsCache) {
    console.log(`-> Xóa cache TTS cũ tại ${options.ttsCacheDir}...`);
    try {
      fs.rmSync(options.ttsCacheDir, { recursive: true, force: true });
    } catch {}
  }
  fs.mkdirSync(options.ttsCacheDir, { recursive: true });

  // =========================================================================
  // CHẾ ĐỘ 4: --audio-only (Tạo toàn bộ .mp3 vào .tts-cache/ + manifest.json rồi dừng)
  // =========================================================================
  if (cli.mode === "AUDIO_ONLY") {
    const startMs = Date.now();
    const manifestEntries: ChapterAudioManifestEntry[] = [];
    let globalIdx = 0;
    let totalFrames = 0;
    let cacheHits = 0;

    console.log(`-> [--audio-only] Đang tạo toàn bộ cache âm thanh cho ${chapters.length} Hồi vào ${options.ttsCacheDir}...`);
    for (const ch of chapters) {
      for (let i = 0; i < ch.beats.length; i++) {
        const beat = ch.beats[i];
        const ttsRes = await options.synthesizeBeatAudio(beat, globalIdx);
        if (ttsRes.fromCache) cacheHits++;
        const extraTailFrames = Number(beat.extraTailFrames) || 0;
        const durationFrames = ttsRes.totalDurationFrames + extraTailFrames;
        totalFrames += durationFrames;
        manifestEntries.push({
          globalBeatIndex: globalIdx + 1,
          chapterNumber: ch.chapterNumber,
          chapterBeatIndex: i + 1,
          narrationText: String(beat.narrationText || ""),
          voiceTone: String(beat.voiceTone || "CALM_STORY"),
          voiceName: ttsRes.voiceName,
          actualDurationSec: Number(ttsRes.actualDurationSec.toFixed(3)),
          totalDurationFrames: durationFrames,
          cacheFile: ttsRes.cacheFilePath
            ? path.relative(options.ttsCacheDir, ttsRes.cacheFilePath).replace(/\\/g, "/")
            : "",
        });
        console.log(
          `  -> Beat #${String(globalIdx + 1).padStart(2, "0")} [Hồi ${ch.chapterNumber} | ${ttsRes.engine}]: ${ttsRes.actualDurationSec.toFixed(
            3
          )}s -> ${durationFrames}f`
        );
        globalIdx++;
      }
    }

    const manifestPath = path.join(options.ttsCacheDir, "manifest.json");
    const manifest: ChapterAudioManifest = {
      version: "v14.1",
      movieId: options.movieId,
      generatedAt: new Date().toISOString(),
      totalChapters: chapters.length,
      totalBeats: globalIdx,
      totalFrames,
      totalDurationSec: Number((totalFrames / fps).toFixed(3)),
      beats: manifestEntries,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    const elapsedSec = ((Date.now() - startMs) / 1000).toFixed(1);
    console.log(
      `✅ [--audio-only] Hoàn tất ${globalIdx} beats (cacheHits=${cacheHits}/${globalIdx}) trong ${elapsedSec}s! ` +
        `Manifest đã lưu: ${manifestPath}`
    );
    return {
      mode: cli.mode,
      movieId: options.movieId,
      outputPath: resolvedOutputPath,
      chunksDir,
      totalChapters: chapters.length,
      chaptersProcessed: [],
      finalDurationSec: totalFrames / fps,
      finalSizeBytes: 0,
      concatElapsedSec: 0,
      manifestPath,
    };
  }

  // Xác định danh sách Hồi cần xử lý (ALL_AND_CONCAT hoặc SINGLE_CHAPTER)
  let targetChapters = chapters;
  if (cli.mode === "SINGLE_CHAPTER") {
    if (!cli.chapterIndex || cli.chapterIndex < 1 || cli.chapterIndex > chapters.length) {
      throw new Error(
        `Tham số --chapter=${cli.chapterIndex} không hợp lệ! Phim "${options.movieId}" có ${chapters.length} Hồi (1..${chapters.length}).`
      );
    }
    targetChapters = [chapters[cli.chapterIndex - 1]];
  }

  // Tính globalBeatStartIdx cho từng Hồi
  const chapterGlobalStartMap = new Map<number, number>();
  let runningBeatOffset = 0;
  for (const ch of chapters) {
    chapterGlobalStartMap.set(ch.chapterNumber, runningBeatOffset);
    runningBeatOffset += ch.beats.length;
  }

  const audioWorkTempDir = fs.mkdtempSync(path.join(os.tmpdir(), `v14_1_chapters_${options.movieId}_`));
  let rendererHandle: { bundleLocation: string; browserInstance: any; close: () => Promise<void> } | null = null;

  try {
    const chaptersProcessed: ChapterChunkResult[] = [];
    const allManifestEntries: ChapterAudioManifestEntry[] = [];
    let grandTotalFrames = 0;

    for (const ch of targetChapters) {
      const globalBeatStartIdx = chapterGlobalStartMap.get(ch.chapterNumber) || 0;
      const chunkPath = getChapterChunkFilePath(chunksDir, options.movieId, ch.chapterNumber);
      const hashSidecarPath = chunkPath.replace(/\.mp4$/i, ".hash.json");

      console.log(
        `\n--- HỒI ${ch.chapterNumber}/${chapters.length}: ${ch.title} (${ch.beats.length} phân cảnh) ---`
      );

      const audioBundle = await buildChapterAudioBundle({
        chapter: ch,
        globalBeatStartIdx,
        fps,
        tempDir: audioWorkTempDir,
        ttsCacheDir: options.ttsCacheDir,
        synthesizeBeatAudio: options.synthesizeBeatAudio,
        mixChapterAudio: options.mixChapterAudio,
      });

      allManifestEntries.push(...audioBundle.manifestEntries);
      grandTotalFrames += audioBundle.chapterTotalFrames;

      const scriptHash = computeChapterScriptHash({
        movieId: options.movieId,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        isPreview: cli.isPreview,
        renderEngineVersionTag,
        compiledBeats: audioBundle.compiledBeats,
      });

      // Kiểm tra cache mảnh chương trên đĩa (bỏ qua render nếu khớp SHA-256 kịch bản, trừ khi --force hoặc --chapter=<k> trên CI)
      let cacheValid = false;
      if (
        !cli.forceRerender &&
        !cli.isStillsOnly &&
        cli.mode === "ALL_AND_CONCAT" &&
        fs.existsSync(chunkPath) &&
        fs.existsSync(hashSidecarPath) &&
        fs.statSync(chunkPath).size > 50 * 1024
      ) {
        try {
          const meta = JSON.parse(fs.readFileSync(hashSidecarPath, "utf8"));
          if (meta?.scriptHash === scriptHash) {
            const existingDur = measureMediaDurationFfprobe(chunkPath);
            if (existingDur > 0.5) {
              cacheValid = true;
              console.log(
                `⚡ [Cache Hit] Hồi ${ch.chapterNumber} đã có mảnh hợp lệ khớp hash (${scriptHash.slice(
                  0,
                  10
                )}) -> Bỏ qua render lại! (${existingDur.toFixed(2)}s)`
              );
              chaptersProcessed.push({
                chapterNumber: ch.chapterNumber,
                title: ch.title,
                chunkPath,
                durationSec: existingDur,
                frames: audioBundle.chapterTotalFrames,
                sizeBytes: fs.statSync(chunkPath).size,
                skippedFromCache: true,
                elapsedSec: 0,
              });
            }
          }
        } catch {
          cacheValid = false;
        }
      }

      if (cacheValid && !options.renderChapterStills) {
        continue;
      }

      // Khởi tạo Remotion bundle & Chromium 1 lần duy nhất khi có ít nhất 1 Hồi cần render (hoặc xuất stills)
      if (!rendererHandle) {
        rendererHandle = await options.prepareRenderer();
      }

      const ctx: ChapterRenderContext<TBeat> = {
        chapter: ch,
        totalChapters: chapters.length,
        chunkLabel: `Chunk ${ch.chapterNumber}/${chapters.length}`,
        compiledBeats: audioBundle.compiledBeats,
        chapterTotalFrames: audioBundle.chapterTotalFrames,
        chapterMasterAudioPath: audioBundle.chapterMasterAudioPath,
        chunkOutputPath: chunkPath,
        isPreview: cli.isPreview,
        concurrency: cli.concurrency,
        bundleLocation: rendererHandle.bundleLocation,
        browserInstance: rendererHandle.browserInstance,
      };

      if (options.renderChapterStills) {
        await options.renderChapterStills(ctx);
      }

      if (cli.isStillsOnly || cacheValid) {
        continue;
      }

      const renderRes = await options.renderChapterVideo(ctx);
      const chunkDur = measureMediaDurationFfprobe(chunkPath);

      fs.writeFileSync(
        hashSidecarPath,
        JSON.stringify(
          {
            movieId: options.movieId,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            scriptHash,
            renderEngineVersionTag,
            frames: audioBundle.chapterTotalFrames,
            durationSec: Number(chunkDur.toFixed(3)),
            renderedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        "utf8"
      );

      console.log(
        `✅ Hoàn tất Hồi ${ch.chapterNumber}/${chapters.length}: ${chunkPath} (${chunkDur.toFixed(
          3
        )}s | ${(renderRes.sizeBytes / 1024 / 1024).toFixed(2)} MB | ${renderRes.elapsedSec}s)`
      );

      chaptersProcessed.push({
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        chunkPath,
        durationSec: chunkDur,
        frames: audioBundle.chapterTotalFrames,
        sizeBytes: renderRes.sizeBytes,
        skippedFromCache: false,
        elapsedSec: renderRes.elapsedSec,
      });
    }

    // Lưu manifest.json khi chạy đủ tất cả các Hồi
    let manifestPath: string | undefined;
    if (cli.mode === "ALL_AND_CONCAT") {
      manifestPath = path.join(options.ttsCacheDir, "manifest.json");
      const manifest: ChapterAudioManifest = {
        version: "v14.1",
        movieId: options.movieId,
        generatedAt: new Date().toISOString(),
        totalChapters: chapters.length,
        totalBeats: allManifestEntries.length,
        totalFrames: grandTotalFrames,
        totalDurationSec: Number((grandTotalFrames / fps).toFixed(3)),
        beats: allManifestEntries,
      };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    }

    if (cli.isStillsOnly) {
      return {
        mode: cli.mode,
        movieId: options.movieId,
        outputPath: resolvedOutputPath,
        chunksDir,
        totalChapters: chapters.length,
        chaptersProcessed,
        finalDurationSec: grandTotalFrames / fps,
        finalSizeBytes: 0,
        concatElapsedSec: 0,
        manifestPath,
      };
    }

    // Nếu chạy --chapter=<k>, kết thúc luôn tại mảnh chunk vừa xuất (để Job stitch_final_movie ghép sau!)
    if (cli.mode === "SINGLE_CHAPTER") {
      const single = chaptersProcessed[0];
      return {
        mode: cli.mode,
        movieId: options.movieId,
        outputPath: single ? single.chunkPath : resolvedOutputPath,
        chunksDir,
        totalChapters: chapters.length,
        chaptersProcessed,
        finalDurationSec: single ? single.durationSec : 0,
        finalSizeBytes: single ? single.sizeBytes : 0,
        concatElapsedSec: 0,
      };
    }

    // Chế độ mặc định (ALL_AND_CONCAT): Tự động ghép toàn bộ Chapter 1..N bằng FFmpeg -c copy trong ~1 giây!
    const allChunkPaths = chapters.map((ch) =>
      getChapterChunkFilePath(chunksDir, options.movieId, ch.chapterNumber)
    );
    console.log(`\n-> Ghép nối ${allChunkPaths.length} Hồi bằng FFmpeg lossless concat (-c copy)...`);
    const concatRes = concatChapterChunksWithFfmpeg(allChunkPaths, resolvedOutputPath, chunksDir);
    console.log(
      `✅ GHÉP PHIM HOÀN CHỈNH trong ${concatRes.elapsedSec}s -> ${resolvedOutputPath} ` +
        `(${concatRes.durationSec.toFixed(3)}s | ${(concatRes.sizeBytes / 1024 / 1024).toFixed(2)} MB)`
    );

    return {
      mode: cli.mode,
      movieId: options.movieId,
      outputPath: resolvedOutputPath,
      chunksDir,
      totalChapters: chapters.length,
      chaptersProcessed,
      finalDurationSec: concatRes.durationSec,
      finalSizeBytes: concatRes.sizeBytes,
      concatElapsedSec: concatRes.elapsedSec,
      manifestPath,
    };
  } finally {
    if (rendererHandle) {
      try {
        await rendererHandle.close();
      } catch {}
    }
    try {
      fs.rmSync(audioWorkTempDir, { recursive: true, force: true });
    } catch {}
  }
}
