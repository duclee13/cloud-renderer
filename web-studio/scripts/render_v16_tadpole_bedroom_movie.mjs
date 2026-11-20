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
  splitBeatsIntoChapters,
  renderLongMovieByChapters,
  resolveBeatTtsText,
} from '../src/lib/v7/chapterChunkedRenderer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../..');
const localArtifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const hasLocalArtifactDir = fs.existsSync(localArtifactDir);

const MOVIE_ID = 'v16_tadpole_bedroom_movie';
const VIENEU_URL = (process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL || 'http://127.0.0.1:8000/v1/audio/speech').trim();
const VIENEU_VOICE = (process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE || 'Hải Đăng').trim();
const VIENEU_ATEMPO = Number(process.env.VIENEU_TTS_ATEMPO) || 1.10;

const videoWorkspaceOut = path.join(workspaceRoot, 'out', 'tadpole_bedroom_movie_v16.mp4');
const ttsCacheDir = path.join(workspaceRoot, '.tts-cache', 'v16_tadpole_bedroom');

// Helper tạo 1 Micro-Beat chuẩn V16.0 (mặc định CROSSFADE 30f = 0.5s, pauseAfterSec = 0.4s)
function mb(spec) {
  return {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    voiceTone: 'CALM_STORY',
    transitionIn: 'CROSSFADE',
    transitionFrames: 30,
    pauseAfterSec: 0.4,
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.035],
    ...spec,
    narrationText: spec.text || spec.narrationText,
  };
}

// =============================================================================
// KỊCH BẢN PHIM DÀI CHUẨN V16.1 — 64 MICRO-BEATS (4 HỒI × 16 MICRO-BEATS, ~6.5 PHÚT)
// "Sẽ Ra Sao Nếu Bạn Đem 50 Con Nòng Nọc Về Nuôi Trong Phòng Ngủ?"
// - Luật đồng bộ 1-1: mỗi micro-beat 15–28 từ, 1 hành động khớp đúng hình ảnh 60fps
// - 55/64 cảnh hoạt hình sống động 60fps (85.9%), chỉ 9/64 cảnh Explainer tối giản (14.1%)
// - Giọng kể ngôi thứ nhất hồn nhiên, tò mò, hài hước đời thường — không giáo điều
// =============================================================================
const RAW_MICRO_BEATS = [
  // ===========================================================================
  // HỒI 1 (Micro-beats 1–16): VỚT 50 CON NÒNG NỌC Ở AO SEN & LẬP BỂ TRONG PHÒNG NGỦ
  // ===========================================================================
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_INTRO_STROLL',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: '50 CON NÒNG NỌC TRONG PHÒNG NGỦ?',
    transitionIn: 'CUT',
    transitionFrames: 0,
    text: 'Chiều hè rảnh rỗi ở quê ông nội, tôi hay xách chiếc vợt lưới nhỏ chạy tót ra bờ ao sen sau vườn hóng gió mát.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_SPOT_SWARM',
    voiceTone: 'CALM_STORY',
    text: 'Bất ngờ liếc xuống sát mép lá sen xanh, tôi thấy cả một vệt đen nhung nhúc đang uốn lượn ríu rít dưới làn nước trong.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_CLOSE_PEEK',
    voiceTone: 'CALM_STORY',
    text: 'Nhìn kỹ hóa ra là hàng trăm chú nòng nọc nhỏ xíu đầu tròn đuôi dài, cứ bơi loanh quanh rỉa rêu mềm dưới ánh nắng.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_GENIUS_IDEA',
    voiceTone: 'HOOK_INTRIGUE',
    text: 'Trong đầu thằng nhóc 12 tuổi bỗng lóe lên một ý tưởng cực kỳ táo bạo: đem hẳn một đàn về phòng ngủ nuôi xem sao!',
    ttsText: 'Trong đầu thằng nhóc mười hai tuổi bỗng lóe lên một ý tưởng cực kỳ táo bạo: đem hẳn một đàn về phòng ngủ nuôi xem sao!',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_SCOOP_NET',
    voiceTone: 'CALM_STORY',
    text: 'Nghĩ là làm ngay, tôi cúi sát bờ cỏ, khéo léo nhúng chiếc vợt lưới xuống sát gốc sen rồi hất nhẹ một đường gọn gàng.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_BUCKET_COUNT',
    voiceTone: 'CALM_STORY',
    text: 'Chỉ vài cú vớt mà chiếc xô nhựa xanh đã chật ních, tôi đếm sơ sơ cũng phải hơn 50 chú nòng nọc đen nhánh.',
    ttsText: 'Chỉ vài cú vớt mà chiếc xô nhựa xanh đã chật ních, tôi đếm sơ sơ cũng phải hơn năm mươi chú nòng nọc đen nhánh.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_GRAB_WEEDS',
    voiceTone: 'CALM_STORY',
    text: 'Cẩn thận như một nhà sinh vật học thực thụ, tôi còn múc thêm đầy nước ao kèm mấy cọng rong xanh để tụi nó đỡ nhớ nhà.',
  }),
  mb({
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'TAD_YARD_CARRY_HOME',
    voiceTone: 'CALM_STORY',
    text: 'Tôi hớn hở khệ nệ xách chiếc xô nước nặng trịch đi ngang qua sân, vừa đi vừa tủm tỉm cười một mình đầy tự hào.',
  }),
  mb({
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'TAD_YARD_GRANDPA_ASK',
    voiceTone: 'CALM_STORY',
    text: 'Ông nội đang uống trà ngoài hiên thấy tôi xách xô lon ton chạy vào nhà, liền nheo mắt cười hỏi xem tôi vừa bắt được gì.',
  }),
  mb({
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'TAD_YARD_BOY_BRAG',
    voiceTone: 'CALM_STORY',
    text: 'Tôi giơ cao xô khoe ngay với ông rằng đây là đàn thú cưng yên tĩnh nhất thế giới, chắc chắn chẳng bao giờ ồn ào.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_SETUP_TANK',
    voiceTone: 'CALM_STORY',
    text: 'Vào tới phòng ngủ, tôi dọn sạch chiếc bàn gỗ kê ngay cạnh đầu giường rồi đặt chiếc bể kính cũ lên đó thật ngay ngắn.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_POUR_WATER',
    voiceTone: 'CALM_STORY',
    text: 'Tôi từ từ nghiêng xô đổ nhẹ cả đàn nòng nọc cùng đám rong xanh vào bể, nhìn từng chú nhỏ ùa ra tung tăng khám phá.',
  }),
  // EXPLAINER #1/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_GILLS_WATER',
    voiceTone: 'CALM_STORY',
    text: 'May mà tôi nhớ lời ông dặn dùng nước ao thay vì nước máy có clo, vì mang nòng nọc rất mỏng manh khi lọc oxy hòa tan.',
    ttsText: 'May mà tôi nhớ lời ông dặn dùng nước ao thay vì nước máy có cờ-lo, vì mang nòng nọc rất mỏng manh khi lọc ô-xy hòa tan.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_TANK_SWIM_CLOSEUP',
    voiceTone: 'CALM_STORY',
    text: 'Cả 50 cái đuôi đen mảnh mai uốn lượn nhịp nhàng trong làn nước mát, trông hệt như những nốt nhạc nhỏ đang nhảy múa dưới kính.',
    ttsText: 'Cả năm mươi cái đuôi đen mảnh mai uốn lượn nhịp nhàng trong làn nước mát, trông hệt như những nốt nhạc nhỏ đang nhảy múa dưới kính.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_FEED_LETTUCE',
    voiceTone: 'CALM_STORY',
    text: 'Mỗi chiều tôi còn luộc mềm mấy lá rau cải xanh thả vào bể, tụi nhỏ bu lại rỉa từng mẩu lá trông ngoan hiền đến lạ.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_NIGHT_WATCH',
    voiceTone: 'SLOW_EMOTIONAL',
    text: 'Đêm đầu tiên dưới ánh đèn ngủ vàng dịu, tôi nằm ngắm bể nòng nọc im phăng phắc rồi mỉm cười chìm vào giấc ngủ thật ngon.',
  }),

  // ===========================================================================
  // HỒI 2 (Micro-beats 17–32): PHÉP MÀU BIẾN THÁI — MỌC CHÂN, HẤP THỤ ĐUÔI & ĐỚP KHÍ
  // ===========================================================================
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_WEEK2_MORNING',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: 'HỒI 2: PHÉP MÀU TRONG BỂ KÍNH',
    text: 'Bẵng đi khoảng hai tuần chăm sóc đều đặn, một sáng thức dậy tôi dụi mắt ghé sát mặt kính mà giật mình không tin nổi.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_TANK_HIND_LEGS_CLOSEUP',
    voiceTone: 'HOOK_INTRIGUE',
    text: 'Hai bên gốc đuôi của mấy chú nòng nọc to nhất bất ngờ nhú ra đôi chân sau tí hon đang co duỗi cực kỳ linh hoạt!',
  }),
  // EXPLAINER #2/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_4STAGE_CYCLE',
    voiceTone: 'CALM_STORY',
    text: 'Thì ra đó chính là hành trình biến thái kỳ diệu của loài lưỡng cư: từ trứng nở thành nòng nọc, mọc chân sau rồi mọc chân trước.',
  }),
  // EXPLAINER #3/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_HIND_LEGS_SWIM',
    voiceTone: 'CALM_STORY',
    text: 'Đôi chân sau mọc trước giúp chúng đạp nước mạnh mẽ hơn hẳn, chuẩn bị sẵn sàng bộ lò xo cho những cú nhảy sau này.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_BOY_NOTEBOOK',
    voiceTone: 'CALM_STORY',
    text: 'Khoái chí quá, tôi lấy vội cuốn sổ tay ngồi vẽ lại từng thay đổi nhỏ mỗi ngày, cảm giác như đang sở hữu phòng thí nghiệm riêng.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_TANK_GULP_AIR_SURFACE',
    voiceTone: 'CALM_STORY',
    text: 'Thêm vài hôm nữa, tôi để ý tụi nhỏ không chỉ bơi dưới đáy mà cứ chốc chốc lại vọt thẳng lên mặt nước đớp bong bóng khí.',
  }),
  // EXPLAINER #4/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_LUNGS_DEVELOP',
    voiceTone: 'CALM_STORY',
    text: 'Bên trong cơ thể bé xíu ấy, đôi phổi non đang dần hình thành để thay thế bộ mang, giúp chúng bắt đầu tập thở bằng không khí.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_ADD_ROCK_ISLAND',
    voiceTone: 'CALM_STORY',
    text: 'Thấy tụi nó cứ ngoi lên tìm chỗ bám, tôi liền rửa sạch vài hòn cuội phẳng xếp cao khỏi mặt nước làm một hòn đảo nhỏ.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_TANK_FRONT_LEGS_POP',
    voiceTone: 'HOOK_INTRIGUE',
    text: 'Tới tuần thứ năm, đôi chân trước cũng bật ra gọn gàng, biến lũ nòng nọc tròn ủm thành những chú ếch con vẫn còn đuôi.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_TANK_STOP_EATING',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    text: 'Lạ một nỗi là mấy hôm đó tụi nó bỗng chê sạch rau luộc, tôi thả lá cải tươi vào mà chẳng con nào thèm ngó tới.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_TANK_TAIL_SHRINK_VIEW',
    voiceTone: 'CALM_STORY',
    text: 'Chăm chú quan sát tôi mới phát hiện chiếc đuôi dài thuở nào cứ ngắn dần từng ngày như đang biến mất một cách thần kỳ.',
  }),
  // EXPLAINER #5/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_TAIL_REABSORB',
    voiceTone: 'CALM_STORY',
    text: 'Đuôi không hề rụng đi, mà cơ thể ếch con tự hấp thụ ngược lại chiếc đuôi để chuyển thành nguồn năng lượng nuôi cơ thể.',
  }),
  // EXPLAINER #6/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_STOMACH_SHIFT',
    voiceTone: 'CALM_STORY',
    text: 'Nhờ nguồn năng lượng từ chiếc đuôi ấy, tụi nó tự no bụng trong lúc hệ tiêu hóa đổi từ ăn rêu sang săn côn trùng.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_TANK_CLIMB_ROCK',
    voiceTone: 'CALM_STORY',
    text: 'Chẳng mấy chốc, những chú ếch xanh đầu tiên đã mất hẳn đuôi, thi nhau leo lên mỏm đá giữa bể ngồi chớp mắt nhìn tôi chăm chú.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_CROWDED_TANK',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    text: 'Nhìn 50 chú ếch con xanh mướt ngồi chen chúc đầy trên hòn đá, tôi vẫn hồn nhiên tưởng tụi nó chẳng thể nhảy ra ngoài.',
    ttsText: 'Nhìn năm mươi chú ếch con xanh mướt ngồi chen chúc đầy trên hòn đá, tôi vẫn hồn nhiên tưởng tụi nó chẳng thể nhảy ra ngoài.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_FORGET_LID',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    text: 'Tối hôm đó buồn ngủ ríu cả mắt, tôi đặt hờ tấm nắp lưới cho thoáng khí rồi leo lên giường đắp chăn ngủ say như chết.',
  }),

  // ===========================================================================
  // HỒI 3 (Micro-beats 33–48): ĐẠI NÁO 2 GIỜ SÁNG — HỢP XƯỚNG "ỘP! OẠP!" & ÔNG NỘI ĐỨNG HÌNH
  // ===========================================================================
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_SILENT',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    bgmMood: 'BGM_TENSE_PULSE',
    floatingHeader: 'HỒI 3: ĐẠI NÁO 2 GIỜ SÁNG!',
    text: 'Đúng 2 giờ sáng, khi cả xóm quê đang chìm trong giấc ngủ say, chiếc kim đồng hồ trên tường phòng tôi khẽ nhích qua số hai.',
    ttsText: 'Đúng hai giờ sáng, khi cả xóm quê đang chìm trong giấc ngủ say, chiếc kim đồng hồ trên tường phòng tôi khẽ nhích qua số hai.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_LID_PUSH',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Ngay cạnh đầu giường, một chú ếch to khỏe nhất bất ngờ bật mạnh lên đẩy hé tấm nắp lưới mỏng đang đậy hờ trên miệng bể.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_FIRST_ESCAPE',
    voiceTone: 'TENSE_CLIMAX',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Chỉ chờ có thế, từng chú ếch xanh nối đuôi nhau nhảy phóc qua thành kính, đáp xuống mặt bàn rồi tản ra khắp căn phòng tối.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_WALL_CLING',
    voiceTone: 'TENSE_CLIMAX',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Chưa đầy vài phút, mấy chục bóng xanh nhỏ đã bám kín từ rèm cửa sổ, mặt kính cho tới chao đèn ngủ và góc tủ gỗ.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_FIRST_CROAK',
    voiceTone: 'TENSE_CLIMAX',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Bỗng một tiếng kêu giòn tan vang lên trong bóng tối: Ộp! Ngay lập tức hàng chục giọng khác bên tường và bàn học rộn ràng đáp lại.',
  }),
  // EXPLAINER #7/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_VOCAL_SAC',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Bí mật là chiếc túi thanh quản dưới cổ ếch: nó phồng căng như quả bóng nhỏ giúp tiếng kêu khuếch đại vang rền cả phòng.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_SLEEP_STIR',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Giữa dàn hợp xướng Ộp Oạp vang trời ấy, tôi vẫn đang mơ màng kéo chăn trùm tai mà tưởng ngoài ao có dàn nhạc nào đang tập.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_NOSE_JUMP',
    voiceTone: 'TENSE_CLIMAX',
    bgmMood: 'BGM_TENSE_PULSE',
    transitionIn: 'CUT',
    transitionFrames: 0,
    text: 'Bỗng "BỘP!" một cái, thứ gì đó mát lạnh và ẩm ướt nhảy thẳng lên đúng chóp mũi khiến tôi giật bắn người hét toáng lên!',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_CHAOS_SWARM',
    voiceTone: 'TENSE_CLIMAX',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Mở mắt ra tôi muốn xỉu tại chỗ: hàng chục chú ếch xanh đang nhảy tưng tưng khắp phòng, tiếng Ộp Oạp rền vang như lễ hội!',
  }),
  // EXPLAINER #8/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_FROG_SPRING',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Cặp chân sau gập như lò xo cho phép một chú ếch nhỏ bật xa gấp nhiều lần chiều dài cơ thể chỉ trong chớp mắt.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_BOY_CHASE',
    voiceTone: 'TENSE_CLIMAX',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Tôi cuống cuồng bật dậy khua tay đuổi bắt, vừa thò tay vồ con trên gối thì hai con khác đã nhảy phóc qua đầu sang bàn học.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_FOOTSTEPS',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Đúng lúc căn phòng hỗn loạn nhất, ngoài hành lang bỗng vang lên tiếng dép lẹt xẹt vội vã của ông nội nghe tiếng la chạy sang.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_GRANDPA_LIGHTS',
    voiceTone: 'TENSE_CLIMAX',
    bgmMood: 'BGM_TENSE_PULSE',
    transitionIn: 'CUT',
    transitionFrames: 0,
    text: 'Cạch! Ông nội đẩy cửa bật sáng trưng bóng đèn trần, rồi đứng khựng lại như trời trồng trước khung cảnh ếch đậu kín cả phòng ngủ!',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_FROG_ON_LAMP',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_TENSE_PULSE',
    text: 'Một chú ếch còn ung dung ngồi chễm chệ ngay trên chao đèn ngủ, phồng má kêu "Ộp!" một tiếng rõ to như gửi lời chào ông nội.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_2AM_AWKWARD_SMILE',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_STORY_CALM',
    text: 'Hai ông cháu nhìn nhau mất mấy giây im phăng phắc, rồi ông bật cười lắc đầu hỏi lại chuyện "thú cưng im re" hôm nào của tôi.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_TEAM_CATCH',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_STORY_CALM',
    text: 'Thế là hai ông cháu đành thức trắng nửa đêm, kẻ cầm vợt người cầm xô nhẹ nhàng lùa bắt từng vận động viên nhảy xa trốn trong góc.',
  }),

  // ===========================================================================
  // HỒI 4 (Micro-beats 49–64): THẢ ĐÀN ẾCH VỀ AO SEN & ĐÊM NGỦ NGON LÀNH
  // ===========================================================================
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_BUCKET_FULL',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    floatingHeader: 'HỒI 4: TRỞ VỀ NHÀ CŨ AO SEN',
    text: 'Sau gần một tiếng bò quanh gầm giường với gầm bàn, cuối cùng chiếc xô lưới cũng gom đủ từng chú ếch xanh tròn mắt ngơ ngác.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_DAWN_WINDOW',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Ngoài cửa sổ trời vừa hửng nắng sớm, nhìn lũ ếch cứ rướn người nhảy lên thành xô là tôi hiểu ngay tụi nó nhớ ao.',
  }),
  mb({
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'TAD_YARD_MORNING_WALK',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Hai ông cháu không ngủ nữa mà xách luôn chiếc xô đi dọc bờ rào gỗ, thẳng hướng ao sen xanh mát phía sau vườn nhà.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_ARRIVE_MORNING',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Ra tới bờ ao, làn gió sáng thơm mùi lá sen thoang thoảng làm cả đám ếch trong xô bỗng rộn ràng nhảy lách tách hẳn lên.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_RELEASE_FROGS',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Hai ông cháu cùng ngồi xuống mép cỏ, từ từ nghiêng chiếc xô cho cả đàn ếch con tung mình nhảy ùm xuống mặt nước ao sen!',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_SWIM_SCATTER',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Hàng chục vòng sóng tròn lan rộng khắp mặt ao, lũ ếch xanh hớn hở bơi tản ra rồi trèo tót lên những chiếc lá sen rung rinh.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_WAVE_GOODBYE',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Tôi vẫy tay chào những người bạn cùng phòng đặc biệt nhất mùa hè, thấy một chú ngồi trên cánh sen còn quay lại kêu một tiếng.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_GRANDPA_CHAT',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Ông nội vỗ vai tôi mỉm cười kể rằng đám ếch này sắp trở thành đội bảo vệ cực kỳ đắc lực cho cả khu vườn nhà ông.',
  }),
  // EXPLAINER #9/9
  mb({
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'TAD_EXPLAIN_MOSQUITO_HERO',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Chỉ bằng chiếc lưỡi dính bật ra nhanh như chớp, mỗi chú ếch xanh có thể bắt gọn hàng loạt muỗi và sâu bọ bay quanh mặt ao.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_SUNSET_CATCH_BUGS',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Chiều hôm đó ra hóng mát dưới ánh hoàng hôn vàng ươm, quả nhiên quanh ao vắng hẳn tiếng muỗi vo ve như mấy hôm trước.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_CLEAN_TANK',
    voiceTone: 'CALM_STORY',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Về lại phòng ngủ, tôi rửa sạch chiếc bể kính đặt gọn gàng lên kệ, tuy hơi trống trải nhưng nhìn phòng sạch bóng lại thấy nhẹ nhõm.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_OPEN_NOTEBOOK',
    voiceTone: 'SLOW_EMOTIONAL',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Tôi mở cuốn sổ tay ra ngắm lại mấy bức tranh vẽ nòng nọc mọc chân nguệch ngoạc, tự dưng thấy mùa hè năm đó thú vị lạ thường.',
  }),
  mb({
    stageTheme: 'BEDROOM_TANK_STAGE',
    kassSceneMode: 'TAD_BEDROOM_PEACEFUL_SLEEP',
    voiceTone: 'SLOW_EMOTIONAL',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Đêm đó tôi đặt lưng xuống gối là ngủ một mạch ngon lành tới sáng, không còn bàn chân mát lạnh nào nhảy trúng mũi nữa.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_MOONLIGHT_FROGS',
    voiceTone: 'SLOW_EMOTIONAL',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Phía xa ngoài ao sen lung linh ánh trăng, tiếng Ộp Oạp lúc này nghe dịu dàng êm tai hệt như một bản nhạc ru ngủ mùa hè.',
  }),
  mb({
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'TAD_YARD_BOY_SMILE_CLOSING',
    voiceTone: 'SLOW_EMOTIONAL',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Từ hồi ấy tôi mới vỡ lẽ: ngắm thế giới tự nhiên lớn lên ngay tại ngôi nhà vốn có của chúng luôn đẹp hơn nhốt trong bể.',
  }),
  mb({
    stageTheme: 'LOTUS_POND_STAGE',
    kassSceneMode: 'TAD_POND_WARM_OUTRO',
    voiceTone: 'SLOW_EMOTIONAL',
    bgmMood: 'BGM_WARM_OUTRO',
    text: 'Còn bạn thì sao, hồi nhỏ bạn đã từng lén đem sinh vật kỳ lạ nào về phòng nuôi chưa? Kể cho tôi nghe với nhé!',
  }),
];

async function main() {
  const cliArgs = parseChapterRenderCliArgs(process.argv);
  const encoderInfo = detectBestHardwareEncoder();

  const explainerCount = RAW_MICRO_BEATS.filter((b) => b.stageTheme === 'EXPLAINER_POLKA_DOT').length;
  const liveCount = RAW_MICRO_BEATS.length - explainerCount;

  console.log('====================================================================');
  console.log('V16.1 FULL MOVIE (64 MICRO-BEATS): "50 CON NÒNG NỌC TRONG PHÒNG NGỦ?"');
  console.log(`Tỷ lệ cảnh sống động 60fps: ${liveCount}/${RAW_MICRO_BEATS.length} (${((liveCount / RAW_MICRO_BEATS.length) * 100).toFixed(1)}%) | Explainer: ${explainerCount}/${RAW_MICRO_BEATS.length}`);
  console.log(`TTS Provider: VIENEU_LOCAL (Strict Single-Voice Lock: "${VIENEU_VOICE}" | atempo=${VIENEU_ATEMPO})`);
  console.log(`Video Encoder: ${encoderInfo.encoder} (${encoderInfo.reason})`);
  console.log('====================================================================');

  // Chia mặc định 4 Hồi × 16 Micro-Beats (trên Cloud --total-chapters=16 sẽ tự rechunk thành 16 máy ảo × 4 micro-beats!)
  const chapters = splitBeatsIntoChapters(RAW_MICRO_BEATS, 4, [
    'Hồi 1: Vớt 50 Con Nòng Nọc & Lập Bể Kính',
    'Hồi 2: Phép Màu Biến Thái Mọc Chân & Thu Đuôi',
    'Hồi 3: Đại Náo 2 Giờ Sáng — Hợp Xướng Ộp Oạp',
    'Hồi 4: Trả Đàn Ếch Về Ao Sen & Đêm Ngủ Ngon',
  ]);

  let remotionRendererMod = null;
  let remotionBundlerMod = null;

  const summary = await renderLongMovieByChapters(chapters, videoWorkspaceOut, {
    movieId: MOVIE_ID,
    movieTitle: 'Sẽ Ra Sao Nếu Bạn Đem 50 Con Nòng Nọc Về Nuôi Trong Phòng Ngủ?',
    workspaceRoot,
    ttsCacheDir,
    fps: 60,
    cliArgs,
    renderEngineVersionTag: 'v16_1_tadpole_bedroom_64_microbeats',

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

    // 2. Trộn giọng đọc từng chunk với BGM 3 hồi & Auto SFX V13–V16
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
        summaryLog: `  -> [Audio V16.1 | Chunk ${chapterNumber}] BGM: ${bgmSummary} | SFX: ${mixRes.plan.sfxCues.length} cues`,
      };
    },

    // 3. Bundle Remotion & mở Chromium 1 lần (Linux/CI để Remotion quản lý SwANGLE chống deadlock)
    prepareRenderer: async () => {
      if (!remotionBundlerMod) remotionBundlerMod = await import('@remotion/bundler');
      if (!remotionRendererMod) remotionRendererMod = await import('@remotion/renderer');

      const entryPoint = path.join(workspaceRoot, 'web-studio', 'src', 'remotion', 'index.ts');
      const isCi = isLinuxOrCiEnvironment();
      console.log(`\n-> Bundling Remotion V16.1 composition (${isCi ? 'Linux/CI SwANGLE' : 'Local ANGLE'})...`);
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

    // 4. Xuất 4 ảnh tĩnh kiểm chứng V16.1 (chỉ chạy khi truyền --stills-only)
    renderChapterStills: async (ctx) => {
      if (!remotionRendererMod || !cliArgs.isStillsOnly) return;

      const stills = [];
      for (const b of ctx.compiledBeats) {
        if (b.kassSceneMode === 'TAD_POND_SCOOP_NET') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.52),
            name: 'still_v16_ep2_pond_scoop.jpg',
            desc: 'Cậu bé cầm vợt lưới vớt nòng nọc ở ao sen làng quê',
          });
        } else if (b.kassSceneMode === 'TAD_TANK_HIND_LEGS_CLOSEUP') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.62),
            name: 'still_v16_ep2_tank_legs.jpg',
            desc: 'Cận bể kính nòng nọc mọc chân sau cạnh giường + bóng thoại "Ủa, mọc chân rồi!"',
          });
        } else if (b.kassSceneMode === 'TAD_BEDROOM_2AM_CHAOS_SWARM') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.55),
            name: 'still_v16_ep2_bedroom_chaos.jpg',
            desc: '2h sáng đàn ếch xanh nhảy khắp phòng ngủ + đồng hồ 2:00 AM + "Ộp! Oạp!"',
          });
        } else if (b.kassSceneMode === 'TAD_POND_RELEASE_FROGS') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.64),
            name: 'still_v16_ep2_pond_release.jpg',
            desc: '2 ông cháu nghiêng xô thả đàn ếch xanh nhảy vòng cung xuống ao sen',
          });
        }
      }
      if (stills.length === 0) return;

      const payload = {
        title: `50 Con Nòng Nọc Trong Phòng Ngủ — ${ctx.chunkLabel}`,
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

      for (const s of stills) {
        const outPath = path.join(workspaceRoot, 'out', s.name);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        console.log(`  [Still V16.1] Frame ${s.frame} (${s.desc}) -> ${s.name}`);
        await remotionRendererMod.renderStill({
          composition,
          serveUrl: ctx.bundleLocation,
          output: outPath,
          frame: s.frame,
          imageFormat: 'jpeg',
          jpegQuality: 92,
          chromiumOptions: HYBRID_GPU_CHROMIUM_OPTIONS,
          puppeteerInstance: ctx.browserInstance,
          inputProps: { payload, v7MoviePayload: payload, showDebugHud: false },
        });
        if (hasLocalArtifactDir) {
          fs.copyFileSync(outPath, path.join(localArtifactDir, s.name));
        }
      }
    },

    // 5. Render từng Chunk thành out/chunks/v16_tadpole_bedroom_movie_chapter_<1..N>.mp4
    renderChapterVideo: async (ctx) => {
      const payload = {
        title: `50 Con Nòng Nọc Trong Phòng Ngủ — ${ctx.chunkLabel}`,
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
        tempDirPrefix: `v16_tadpole_ch${ctx.chapter.chapterNumber}_frames_`,
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
  console.error('Fatal V16.1 tadpole movie render error:', err);
  process.exit(1);
});
