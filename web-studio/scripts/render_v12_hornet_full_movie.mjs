import { bundle } from '@remotion/bundler';
import { renderStill, renderFrames, selectComposition, renderMedia, openBrowser } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';
import {
  HYBRID_GPU_CHROMIUM_OPTIONS,
  HYBRID_GPU_RENDER_DEFAULTS,
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

const isPreview = process.argv.includes('--preview');
const isStillsOnly = process.argv.includes('--stills-only');
const shouldClearCache = process.argv.includes('--clear-cache');

const VIENEU_URL = (process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL || 'http://127.0.0.1:8000/v1/audio/speech').trim();
const VIENEU_VOICE = (process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE || 'Hải Đăng').trim();
const VIENEU_ATEMPO = Number(process.env.VIENEU_TTS_ATEMPO) || 1.10;
const RENDER_CONCURRENCY = Number(process.env.RENDER_CONCURRENCY) || 2; // An toàn 8GB RAM cho phim dài ~3 phút (~10.000+ frames)

const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const workspaceRoot = 'C:/Users/ASUS/Downloads/TOOL_2D_ANIM_API_FIX_1/TOOL_2D_ANIM';
const videoWorkspaceOut = path.join(workspaceRoot, 'out/hornet_night_full_movie.mp4');
const videoArtifactOut = path.join(artifactDir, 'hornet_night_full_movie.mp4');
const v12CacheDir = path.join(workspaceRoot, '.tts-cache', 'v12_hornet_full_vieneu');

const LEAD_IN_FRAMES = 18; // 0.3s mở đầu mỗi cảnh
const TAIL_HOLD_FRAMES = 42; // 0.7s khoảng thở cuối mỗi cảnh

function measureAudioDurationSecWithFfprobe(filePath) {
  const safePath = filePath.replace(/\\/g, '/');
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${safePath}"`,
    { stdio: ['ignore', 'pipe', 'pipe'] }
  )
    .toString()
    .trim();
  const parsed = parseFloat(out);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`ffprobe returned invalid duration for ${filePath}: "${out}"`);
  }
  return parsed;
}

async function synthesizeV12VieneuBeat(text, tone, beatIndex, masterAudioTempDir, extraTailFrames = 0) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `v12_hornet_b${beatIndex}_`));
  try {
    const attempt = await synthesizeVieneuLocalTtsBeat({
      text,
      voiceTone: tone,
      voice: VIENEU_VOICE,
      atempo: VIENEU_ATEMPO,
      url: VIENEU_URL,
      cacheDir: v12CacheDir,
    });

    if (!attempt.ok || !attempt.result) {
      throw new Error(
        `[Strict Single-Voice Lock V12.0] Beat #${beatIndex} thất bại với VIENEU_LOCAL (${VIENEU_VOICE}): ${attempt.errorReason}. Cấm trộn fallback sang giọng khác!`
      );
    }

    const vr = attempt.result;
    const totalDurationFrames = vr.totalDurationFrames + extraTailFrames;
    const mp3Path = path.join(tempDir, `beat_${beatIndex}.mp3`);
    fs.writeFileSync(mp3Path, vr.mp3Buffer);

    const beatTargetSec = totalDurationFrames / 60;
    const padTailSec = Math.max(0.01, beatTargetSec - vr.actualDurationSec);
    const paddedBeatPath = path.join(masterAudioTempDir, `beat_padded_${String(beatIndex).padStart(2, '0')}.wav`);

    execSync(
      `ffmpeg -y -v error -i "${mp3Path.replace(
        /\\/g,
        '/'
      )}" -filter_complex "[0:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[a0];anullsrc=r=24000:cl=mono,atrim=duration=${padTailSec.toFixed(
        4
      )}[sil];[a0][sil]concat=n=2:v=0:a=1,atrim=0:${beatTargetSec.toFixed(
        4
      )}[outa]" -map "[outa]" -ar 24000 -ac 1 "${paddedBeatPath.replace(/\\/g, '/')}"`
    );

    return {
      audioUrl: vr.audioUrl,
      paddedBeatPath,
      actualDurationSec: vr.actualDurationSec,
      totalDurationMs: vr.totalDurationMs,
      totalDurationFrames,
      fromCache: vr.fromCache,
      engine: `VIENEU_LOCAL (${vr.voiceName}${vr.fromCache ? ', cache' : ''})`,
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  if (shouldClearCache) {
    console.log(`-> Đang xóa cache V12 cũ tại ${v12CacheDir}...`);
    try {
      fs.rmSync(v12CacheDir, { recursive: true, force: true });
    } catch {}
  }
  fs.mkdirSync(v12CacheDir, { recursive: true });
  fs.mkdirSync(path.dirname(videoWorkspaceOut), { recursive: true });
  fs.mkdirSync(artifactDir, { recursive: true });

  const hwEncoder = detectBestHardwareEncoder();
  console.log('=== BẮT ĐẦU SẢN XUẤT PHIM DÀI V12.0 (20 PHÂN CẢNH — 4 HỒI): CHIẾU ĐÈN PIN VÀO TỔ ONG BẮP CÀY BAN ĐÊM ===');
  console.log(
    `-> Chế độ: ${isPreview ? 'PREVIEW (720p @ 30fps)' : 'PRODUCTION (1080p @ 60fps)'} | TTS (Khóa Cứng 100%): VIENEU_LOCAL (${VIENEU_VOICE}, atempo=${VIENEU_ATEMPO} @ ${VIENEU_URL})`
  );
  console.log(
    `-> Cache vĩnh viễn: ${v12CacheDir} | Concurrency: ${RENDER_CONCURRENCY} | Chromium GL: "${HYBRID_GPU_CHROMIUM_OPTIONS.gl}" | Encoder: ${hwEncoder.displayName}`
  );

  const masterAudioTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'v12_hornet_master_audio_'));
  let browserInstance = null;

  try {
    // =========================================================================
    // KỊCH BẢN PHIM DÀI 20 PHÂN CẢNH (4 HỒI) CHUẨN V10 - V11.3
    // =========================================================================
    const rawBeats = [
      // ==================== HỒI 1: BÍ ẨN NỬA ĐÊM & CHIẾC TỔ KHỔNG LỒ (Beats 1 - 5) ====================
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CHAPTER_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'DARK_STUDIO',
        archetype: 'hornet',
        voiceTone: 'HOOK_INTRIGUE',
        sfxType: 'sfx_thud',
        extraTailFrames: 18,
        headerTitle: 'CHIẾU ĐÈN PIN VÀO TỔ ONG?',
        narrationText:
          'Điều gì sẽ xảy ra... nếu giữa đêm khuya tĩnh mịch, bạn tò mò rọi thẳng chiếc đèn pin sáng rực vào một tổ ong bắp cày khổng lồ?',
        cardProps: {
          darkMode: true,
          subtitle: 'BÍ ẨN NỬA ĐÊM',
          highlightWord: 'ĐỪNG BAO GIỜ THỬ!',
          highlightColor: 'red',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'NIGHT_CALM_DISTANT',
        floatingHeader: 'HỒI 1: BÍ ẨN NỬA ĐÊM',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_pop',
        headerTitle: 'SỰ YÊN TĨNH ĐÁNH LỪA',
        narrationText:
          'Nhiều người vẫn nghĩ rằng ban đêm là lúc ong ngủ say nhất, hoàn toàn vô hại nên có thể lại gần quan sát thoải mái.',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.05],
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'NIGHT_CALM',
        targetSocket: 'HEAD_CENTER',
        floatingHeader: 'NHÓM LÍNH CANH ĐÊM',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_pop',
        headerTitle: 'ONG LÍNH CANH CỬA SUỐT ĐÊM',
        narrationText:
          'Đúng là phần lớn cả đàn đang nghỉ ngơi sâu bên trong tổ... nhưng ngay tại cửa ra vào, luôn có một nhóm ong lính túc trực canh gác suốt đêm.',
        calloutText: '[ONG LÍNH CANH CỬA]',
        calloutSub: 'Túc trực ngay cửa tổ suốt đêm',
        calloutTarget: 'HEAD_CENTER',
        calloutTriggerPhrase: 'nhóm ong lính',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.12],
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'APPROACH_RAISE_FLASHLIGHT',
        floatingHeader: 'SAI LẦM BẮT ĐẦU...',
        voiceTone: 'STEP_BY_STEP_SUSPENSE',
        sfxType: 'sfx_tick',
        headerTitle: 'BƯỚC LẠI GẦN & NÂNG ĐÈN PIN',
        narrationText:
          'Và sai lầm bắt đầu khi bạn bước lại gần thêm một chút... rồi đưa tay bấm công tắc chiếc đèn pin ánh sáng trắng.',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.06],
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'FLASHLIGHT_ALERT',
        targetSocket: 'HEAD_CENTER',
        floatingHeader: 'ÁNH ĐÈN XÉ TOẠC MÀN ĐÊM!',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_whoosh',
        headerTitle: 'TIA SÁNG BÁO ĐỘNG',
        narrationText:
          'Tách! Ngay khoảnh khắc tia sáng trắng mạnh rọi thẳng vào miệng tổ, toàn bộ không gian yên tĩnh lập tức bị xé toạc!',
        sfxText: 'CHÓI!',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.08],
      },

      // ==================== HỒI 2: PHẢN XẠ SINH HỌC TRONG BÓNG TỐI (Beats 6 - 10) ====================
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CHAPTER_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'DARK_STUDIO',
        archetype: 'hornet',
        voiceTone: 'CHAPTER_ANNOUNCE',
        sfxType: 'sfx_thud',
        extraTailFrames: 18,
        headerTitle: 'BÍ MẬT #1: ĐÔI MẮT ONG',
        narrationText:
          'Nhưng khoan đã... tại sao chỉ một tia đèn pin nhỏ lại khiến cả đàn ong nổi giận đến vậy?',
        cardProps: {
          darkMode: true,
          subtitle: 'HỒI 2: PHẢN XẠ SINH HỌC',
          highlightWord: 'VÌ SAO CHÚNG NỔI GIẬN?',
          highlightColor: 'yellow',
        },
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'TWO_DOORS_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'hornet',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_ding',
        headerTitle: 'PHẢN XẠ BÁO ĐỘNG ĐÊM',
        narrationText:
          'Trong bóng đêm, thị giác của ong bắp cày gần như mù hoàn toàn... nên ánh sáng đột ngột khiến não bộ chúng lập tức khóa chế độ nghỉ ngơi và bật công tắc báo động đỏ!',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          accentTheme: 'DANGER_RED',
          leftDoorTitle: 'BÁO ĐỘNG ĐỎ',
          leftNeutralSub: 'CHẾ ĐỘ CHỜ',
          leftMorphingSub: 'ĐANG KÍCH HOẠT...',
          leftDoorSub: 'KÍCH HOẠT TỐI ĐA',
          rightDoorTitle: 'NGHỈ NGƠI',
          rightNeutralSub: 'ĐANG HOẠT ĐỘNG',
          rightMorphingSub: 'ĐANG KHÓA CHẶT...',
          rightDoorSub: 'TẠM ĐÓNG BĂNG',
        },
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'SIMPLE_CHART_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'hornet',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_tick',
        headerTitle: 'MỨC ĐỘ KÍCH ĐỘNG TRONG TỔ',
        narrationText:
          'Chỉ trong chưa đầy vài giây sau khi ánh sáng chiếu vào, nhịp tim và mức độ kích động bên trong tổ tăng vọt thẳng đứng!',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          chartMode: 'line',
          chartTrend: 'rising',
          chartTitle: 'MỨC ĐỘ KÍCH ĐỘNG THEO TỪNG GIÂY',
          chartStartLabel: 'YÊN TĨNH',
          chartEndLabel: 'BÙNG NỔ BÁO ĐỘNG',
          chartXLabels: ['0 giây', '3 giây', '5 giây', '8 giây'],
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'PHEROMONE_ALARM_WAVES',
        targetSocket: 'HEAD_CENTER',
        floatingHeader: 'TÍN HIỆU HÓA HỌC KHẨN CẤP',
        voiceTone: 'STEP_BY_STEP_SUSPENSE',
        sfxType: 'sfx_pop',
        headerTitle: 'LAN TỎA PHEROMONE BÁO ĐỘNG',
        narrationText:
          'Những con ong lính ngoài cửa lập tức tiết ra một loại mùi hóa học đặc biệt gọi là pheromone báo động, lan tỏa khắp các tầng tổ bên trong.',
        calloutText: '[PHEROMONE BÁO ĐỘNG]',
        calloutSub: 'Mùi hóa học đánh thức cả tổ ong',
        calloutTarget: 'HEAD_CENTER',
        calloutTriggerPhrase: 'pheromone báo động',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.14],
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'NEST_BUZZING_RED_EYES',
        floatingHeader: 'TIẾNG VO VE TRẦM ĐỤC...',
        voiceTone: 'STEP_BY_STEP_SUSPENSE',
        sfxType: 'sfx_thud',
        headerTitle: 'CẢ ĐÀN THỨC GIẤC TRONG BÓNG TỐI',
        narrationText:
          'Từ bên trong chiếc tổ tưởng chừng im ắng đó... một âm thanh vo ve trầm đục bắt đầu vang lên ngày càng lớn!',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.07],
      },

      // ==================== HỒI 3: CUỘC TRUY ĐUỔI DỌC THEO CHÙM SÁNG (Beats 11 - 15) ====================
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CHAPTER_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'DARK_STUDIO',
        archetype: 'hornet',
        voiceTone: 'CHAPTER_ANNOUNCE',
        sfxType: 'sfx_thud',
        extraTailFrames: 18,
        headerTitle: 'BÍ MẬT #2: NGỌN HẢI ĐĂNG TỬ THẦN',
        narrationText: 'Và đây mới là điều đáng sợ nhất mà ít ai ngờ tới...',
        cardProps: {
          darkMode: true,
          subtitle: 'HỒI 3: CUỘC TRUY ĐUỔI',
          highlightWord: 'CHÙM SÁNG DẪN ĐƯỜNG!',
          highlightColor: 'red',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'SWARM_BEAM_ATTACK',
        targetSocket: 'HEAD_CENTER',
        floatingHeader: 'LAO THẲNG DỌC THEO TIA SÁNG!',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_whoosh',
        headerTitle: 'ĐÀN ONG LAO DỌC CHÙM SÁNG',
        narrationText:
          'Vì không nhìn thấy gì ngoài bóng tối xung quanh, cả đàn ong sẽ không bay loạn xạ — mà lao thẳng dọc theo chính chùm ánh sáng đèn pin tìm thẳng đến tay bạn!',
        sfxText: 'VÙÙÙ!',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.07],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'BALANCE_SCALE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'hornet',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_thud',
        headerTitle: 'CÁN CÂN BẢN NĂNG SINH TỒN',
        narrationText:
          'Lúc này, bản năng bảo vệ tổ đã áp đảo hoàn toàn màn đêm — biến chiếc đèn pin trên tay bạn thành tấm bia dẫn đường chính xác nhất.',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          leftPanLabel: 'BẢN NĂNG BẢO VỆ TỔ',
          rightPanLabel: 'BÓNG TỐI BAN ĐÊM',
          heavySide: 'left',
        },
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'GAUGE_RESERVE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'hornet',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_tick',
        headerTitle: 'MỨC ĐỘ HUNG HÃN CỦA CẢ ĐÀN',
        narrationText:
          'Nếu bạn vẫn giữ nguyên đèn pin bật sáng hoặc vung tay xua đuổi, mức độ hung hãn của cả đàn sẽ chạm ngưỡng tấn công hàng loạt!',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          gaugePolarity: 'danger_high_red',
          gaugeFrom: 12,
          gaugeTo: 96,
          gaugeLowLabel: 'YÊN TĨNH',
          gaugeMidLabel: 'CẢNH GIÁC',
          gaugeHighLabel: 'NGUY HIỂM',
          gaugeSafeStatusLabel: 'YÊN TĨNH',
          gaugeWarnStatusLabel: 'CẢNH GIÁC',
          gaugeStatusLabel: 'BÁO ĐỘNG ĐỎ: TẤN CÔNG HÀNG LOẠT',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'STING_RETREAT_BACKSTEP',
        floatingHeader: 'NGÒI TRƠN ĐỐT LIÊN TIẾP!',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_whoosh',
        headerTitle: 'GIẬT LÙI TRƯỚC ĐÀN ONG BẮP CÀY',
        narrationText:
          'Khác với ong mật chỉ đốt một lần, ong bắp cày có ngòi trơn và có thể đốt liên tiếp nhiều phát cực kỳ đau nhức!',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.05],
      },

      // ==================== HỒI 4: CÁCH THOÁT HIỂM AN TOÀN & BÀI HỌC (Beats 16 - 20) ====================
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CHAPTER_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'DARK_STUDIO',
        archetype: 'hornet',
        voiceTone: 'CHAPTER_ANNOUNCE',
        sfxType: 'sfx_ding',
        extraTailFrames: 18,
        headerTitle: 'QUY TẮC THOÁT HIỂM 3 BƯỚC',
        narrationText:
          'Vậy nếu lỡ tay chiếu đèn vào tổ ong giữa đêm... bạn phải làm gì ngay lập tức?',
        cardProps: {
          darkMode: true,
          subtitle: 'HỒI 4: CÁCH THOÁT HIỂM AN TOÀN',
          highlightWord: 'PHẢN XẠ CỨU NGUY!',
          highlightColor: 'green',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'FLASHLIGHT_SWITCH_OFF',
        floatingHeader: 'BƯỚC 1: TẮT PHỤT ĐÈN PIN!',
        voiceTone: 'TENSE_CLIMAX',
        sfxType: 'sfx_pop',
        headerTitle: 'TẮT ĐÈN PIN TỨC KHẮC',
        narrationText:
          'Bước một: Tắt phụt chiếc đèn pin ngay tức khắc! Khi nguồn sáng biến mất, cả đàn ong lập tức mất phương hướng trong bóng đêm.',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.05],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'TWO_DOORS_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'SOFT_GRAPH_GRID',
        archetype: 'hornet',
        voiceTone: 'CALM_STORY',
        sfxType: 'sfx_ding',
        headerTitle: 'LỰA CHỌN AN TOÀN TRONG BÓNG TỐI',
        narrationText:
          'Đừng chạy tán loạn hay la hét làm rung cành cây — hãy chọn cách giữ bình tĩnh và rút lui êm ái trong bóng tối.',
        cardProps: {
          metricMode: 'QUALITATIVE_STATE',
          accentTheme: 'POSITIVE_GOLD',
          leftDoorTitle: 'TẮT ĐÈN & RÚT LUI ÊM',
          leftNeutralSub: 'CHẾ ĐỘ CHỜ',
          leftMorphingSub: 'ĐANG ƯU TIÊN...',
          leftDoorSub: 'AN TOÀN TUYỆT ĐỐI',
          rightDoorTitle: 'LA HÉT & BẬT ĐÈN',
          rightNeutralSub: 'CHỜ XỬ LÝ',
          rightMorphingSub: 'ĐANG KHÓA CHẶT...',
          rightDoorSub: 'CỰC KỲ NGUY HIỂM',
        },
      },
      {
        action: 'STORY_MICRO_POSE',
        cardType: 'CHARACTER_POSE_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'NIGHT_GARDEN_FLASHLIGHT',
        archetype: 'hornet',
        hornetSceneMode: 'STEALTH_EXIT_LEFT',
        floatingHeader: 'BƯỚC 2: RÚT LUI ÊM ÁI',
        voiceTone: 'SLOW_EMOTIONAL',
        sfxType: 'sfx_pop',
        headerTitle: 'RỜI XA KHU VỰC TỔ ONG',
        narrationText:
          'Bước hai: Lặng lẽ cúi thấp người, quay lưng bước nhanh nhưng êm ái rời khỏi khu vực tổ ong ít nhất vài chục mét.',
        startX: 960,
        targetX: 960,
        cameraZoom: [1.0, 1.04],
      },
      {
        action: 'STORY_CARD_SCENE',
        cardType: 'CHAPTER_CARD',
        metricMode: 'QUALITATIVE_STATE',
        stageTheme: 'DARK_STUDIO',
        archetype: 'hornet',
        voiceTone: 'SLOW_EMOTIONAL',
        sfxType: 'sfx_ding',
        extraTailFrames: 24,
        headerTitle: 'TẮT ĐÈN — RỜI ĐI AN TOÀN!',
        narrationText:
          'Bóng đêm là chiếc áo giáp tự nhiên của chính bạn — gặp tổ ong bắp cày ban đêm, hãy tắt đèn và lặng lẽ rời đi thật xa nhé!',
        cardProps: {
          darkMode: true,
          subtitle: 'BÀI HỌC AN TOÀN BAN ĐÊM',
          highlightWord: 'HẸN GẶP LẠI Ở TẬP SAU!',
          highlightColor: 'green',
        },
      },
    ];

    // 1. Tổng hợp 20/20 beats bằng VIENEU_LOCAL (Hải Đăng, atempo=1.10) & lưu vĩnh viễn vào .tts-cache/v12_hornet_full_vieneu/
    const audioStartMs = Date.now();
    console.log(`1. Tổng hợp 20/20 phân cảnh bằng VIENEU_LOCAL (${VIENEU_VOICE}, atempo=${VIENEU_ATEMPO})...`);
    let currentStart = 0;
    const compiledBeats = [];
    const paddedBeatWavFiles = [];
    let vieneuCount = 0;
    let cacheHits = 0;

    for (let i = 0; i < rawBeats.length; i++) {
      const b = rawBeats[i];
      const ttsRes = await synthesizeV12VieneuBeat(
        b.narrationText,
        b.voiceTone,
        i + 1,
        masterAudioTempDir,
        b.extraTailFrames || 0
      );
      vieneuCount++;
      if (ttsRes.fromCache) cacheHits++;
      paddedBeatWavFiles.push(ttsRes.paddedBeatPath);

      console.log(
        `-> Beat #${String(i + 1).padStart(2, '0')}/20 [${b.cardType}${
          b.hornetSceneMode ? `:${b.hornetSceneMode}` : ''
        } | ${ttsRes.engine}]: audio=${ttsRes.actualDurationSec.toFixed(3)}s -> ${ttsRes.totalDurationFrames}f`
      );

      compiledBeats.push({
        ...b,
        type: b.action,
        theme: b.stageTheme,
        startFrame: currentStart,
        durationFrames: ttsRes.totalDurationFrames,
        // Tối ưu 8GB RAM: khi dùng GPU encoder (renderFrames muted:true + FFmpeg mux masterAudioPath), không nhồi base64 audio vào JSON inputProps
        audioUrl: hwEncoder.usesGpuVideoEncode ? undefined : ttsRes.audioUrl,
        audioDurationMs: ttsRes.totalDurationMs,
        showDebugHud: false,
      });
      currentStart += ttsRes.totalDurationFrames;
    }

    const audioElapsedSec = Number(((Date.now() - audioStartMs) / 1000).toFixed(1));
    console.log(
      `=> Tổng kết TTS V12.0: VIENEU_LOCAL (${VIENEU_VOICE}, atempo=${VIENEU_ATEMPO})=${vieneuCount}/${rawBeats.length} (cacheHits=${cacheHits}) | Thời gian tạo audio: ${audioElapsedSec}s`
    );

    // Ghép Master Audio giọng đọc từ 20 file WAV, sau đó trộn Nhạc Nền (3 BGM -22dB crossfade) & 6 SFX tự động V13.0!
    const voiceOnlyMasterPath = path.join(masterAudioTempDir, 'master_audio_voice.wav');
    const masterAudioPath = path.join(masterAudioTempDir, 'master_audio_v13_mixed.wav');
    const concatListPath = path.join(masterAudioTempDir, 'concat_list.txt');
    const concatListContent = paddedBeatWavFiles
      .map((f) => `file '${f.replace(/\\/g, '/')}'`)
      .join('\n');
    fs.writeFileSync(concatListPath, concatListContent, 'utf8');
    execSync(
      `ffmpeg -y -v error -f concat -safe 0 -i "${concatListPath.replace(
        /\\/g,
        '/'
      )}" -ar 24000 -ac 1 "${voiceOnlyMasterPath.replace(/\\/g, '/')}"`
    );

    const soundMixStartMs = Date.now();
    const soundMix = mixMasterAudioWithSoundDesign({
      voiceMasterWavPath: voiceOnlyMasterPath,
      beats: compiledBeats,
      totalFrames: currentStart,
      fps: 60,
      outputWavPath: masterAudioPath,
      cacheDir: SOUND_DESIGN_CACHE_DIR,
    });
    const soundMixElapsedSec = ((Date.now() - soundMixStartMs) / 1000).toFixed(2);
    const sfxCountMap = {};
    for (const cue of soundMix.plan.sfxCues) {
      sfxCountMap[cue.effectId] = (sfxCountMap[cue.effectId] || 0) + 1;
    }
    console.log(
      `=> Sound Design Engine V13.0 hoàn tất trong ${soundMixElapsedSec}s (cache: ${soundMix.assets.cacheDir}):`
    );
    console.log(
      `   + BGM Segments (${soundMix.plan.bgmSegments.length}): ` +
        soundMix.plan.bgmSegments
          .map((s) => `${s.trackId}[${(s.startFrame / 60).toFixed(1)}s->${(s.endFrame / 60).toFixed(1)}s, vol=${s.volume}]`)
          .join(' | ')
    );
    console.log(`   + SFX Cues (${soundMix.plan.sfxCues.length} total): ${JSON.stringify(sfxCountMap)}`);
    const masterAudioSec = measureAudioDurationSecWithFfprobe(masterAudioPath);

    const v12Payload = {
      title: 'Chiếu Đèn Pin Vào Tổ Ong Bắp Cày Ban Đêm — Phim Đầy Đủ 4 Hồi (V12.0)',
      totalDurationFrames: currentStart,
      fps: 60,
      beats: compiledBeats,
      showDebugHud: false,
    };

    console.log(
      `Tổng thời lượng phim V12.0: ${currentStart} frames (${(currentStart / 60).toFixed(
        2
      )}s / ~${(currentStart / 3600).toFixed(2)} phút) | Master Audio ffprobe: ${masterAudioSec.toFixed(3)}s`
    );

    console.log('2. Bundling Remotion project...');
    const entryPoint = path.resolve(workspaceRoot, 'web-studio/src/remotion/index.ts');
    const bundleLocation = await bundle({
      entryPoint,
      onProgress: (p) => {
        if (p % 25 === 0) console.log(`Bundling: ${p}%`);
      },
    });

    console.log('3. Khởi chạy Chromium GPU ANGLE (dùng chung cho Stills & Video)...');
    browserInstance = await openBrowser('chrome', {
      chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'V7MovieComposition',
      puppeteerInstance: browserInstance,
      inputProps: {
        payload: v12Payload,
        showDebugHud: false,
      },
    });
    console.log(`Composition ready: ${composition.id} (${composition.width}x${composition.height}, ${composition.durationInFrames} frames)`);

    // 4. Xuất 6 ảnh kiểm chứng các cảnh mới đặc sắc nhất của V12.0
    const getBeatFrame = (beatIdx, ratio = 0.55) => {
      const beat = compiledBeats[beatIdx];
      return beat.startFrame + Math.floor(beat.durationFrames * ratio);
    };
    const getSyncedCalloutFrame = (beatIdx, offsetAfterAppear = 36) => {
      const beat = compiledBeats[beatIdx];
      const speechFrames = Math.max(60, beat.durationFrames - LEAD_IN_FRAMES - TAIL_HOLD_FRAMES);
      const normText = (beat.narrationText || '').toLowerCase();
      const normPhrase = (beat.calloutTriggerPhrase || '').trim().toLowerCase();
      const idx = normPhrase ? normText.indexOf(normPhrase) : -1;
      const ratio = idx >= 0 ? idx / Math.max(1, normText.length) : 0.25;
      const rawAppear = Math.max(LEAD_IN_FRAMES, LEAD_IN_FRAMES + Math.round(ratio * speechFrames) - 8);
      const appearFrame = Math.min(rawAppear, Math.max(LEAD_IN_FRAMES, beat.durationFrames - 66));
      const disappearFrame = Math.min(beat.durationFrames - 18, appearFrame + 144);
      const targetLocal = Math.min(disappearFrame - 20, appearFrame + offsetAfterAppear);
      return beat.startFrame + targetLocal;
    };

    const stillsToRender = [
      {
        frame: getBeatFrame(4, 0.52),
        name: 'still_v13_beat5_nobox_sub.jpg',
        desc: 'Beat 5 (V13.0): Phụ đề trắng viền đen không hộp chuẩn Kass Blox + Impact Floating Text nổi + đèn pin + CHÓI!',
      },
      {
        frame: getBeatFrame(16, 0.72),
        name: 'still_v13_beat17_light_off.jpg',
        desc: 'Beat 17 (V13.0): Tèo tắt phụt đèn pin + đàn ong ngơ ngác [?] + Phụ đề không hộp & Tiêu đề nổi thoáng sạch',
      },
    ];

    console.log(`4. Rendering ${stillsToRender.length} V12.0 verification stills via GPU ANGLE...`);
    for (const item of stillsToRender) {
      const artifactPath = path.join(artifactDir, item.name);
      const outPath = path.join(workspaceRoot, 'out', item.name);
      console.log(`Rendering frame ${item.frame} (${item.desc}) -> ${item.name}...`);
      await renderStill({
        composition,
        serveUrl: bundleLocation,
        output: artifactPath,
        frame: item.frame,
        imageFormat: 'jpeg',
        jpegQuality: 88,
        chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
        puppeteerInstance: browserInstance,
        inputProps: {
          payload: v12Payload,
          showDebugHud: false,
        },
      });
      fs.copyFileSync(artifactPath, outPath);
    }

    if (isStillsOnly) {
      console.log(
        `=== HOÀN TẤT --stills-only V12.0 | Audio (20/20 ${VIENEU_VOICE}): ${audioElapsedSec}s | Tổng thời lượng phim: ${(
          currentStart / 60
        ).toFixed(2)}s (${currentStart}f) ===`
      );
      return;
    }

    // 5. Render Full MP4 bằng Hybrid CPU + GPU (concurrency: 2 an toàn 8GB RAM)
    console.log(`5. Rendering full movie out/hornet_night_full_movie.mp4 (concurrency=${RENDER_CONCURRENCY})...`);
    const summary = await renderVideoHybridCpuGpu({
      composition,
      serveUrl: bundleLocation,
      inputProps: {
        payload: v12Payload,
        showDebugHud: false,
      },
      masterAudioPath,
      outputPath: videoWorkspaceOut,
      isPreview,
      concurrency: RENDER_CONCURRENCY,
      jpegQuality: 88,
      tempDirPrefix: 'v12_hornet_full_frames_',
      renderFrames,
      renderMedia,
      puppeteerInstance: browserInstance,
    });

    fs.copyFileSync(videoWorkspaceOut, videoArtifactOut);
    const outMp4DurationSec = measureAudioDurationSecWithFfprobe(videoWorkspaceOut);
    console.log('====================================================================');
    console.log(`✅ HOÀN TẤT PHIM DÀI V12.0: out/hornet_night_full_movie.mp4`);
    console.log(`- Tổng số cảnh: 20/20 beats (100% VIENEU_LOCAL "${VIENEU_VOICE}", atempo=${VIENEU_ATEMPO})`);
    console.log(`- Thời gian tạo audio VieNeu-TTS: ${audioElapsedSec}s (cacheHits=${cacheHits}/20)`);
    console.log(`- Thời gian render Hybrid CPU+GPU: ${summary.elapsedSec}s (Encoder: ${summary.encoderInfo.displayName}, concurrency=${RENDER_CONCURRENCY})`);
    console.log(`- Thời lượng MP4 thực tế (ffprobe): ${outMp4DurationSec.toFixed(3)}s (${currentStart} frames @ 60fps)`);
    console.log(`- Dung lượng file MP4: ${(summary.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log('====================================================================');
  } finally {
    if (browserInstance) {
      try {
        await browserInstance.close({ silent: true });
      } catch {}
    }
    try {
      fs.rmSync(masterAudioTempDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error('Fatal V12.0 full movie render error:', err);
  process.exit(1);
});
