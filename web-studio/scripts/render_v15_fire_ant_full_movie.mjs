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
} from '../src/lib/v7/chapterChunkedRenderer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../..');
const localArtifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const hasLocalArtifactDir = fs.existsSync(localArtifactDir);

const MOVIE_ID = 'v15_fire_ant_full_movie';
const VIENEU_URL = (process.env.VIENEU_TTS_URL || DEFAULT_VIENEU_TTS_URL || 'http://127.0.0.1:8000/v1/audio/speech').trim();
const VIENEU_VOICE = (process.env.VIENEU_TTS_VOICE || DEFAULT_VIENEU_TTS_VOICE || 'Hải Đăng').trim();
const VIENEU_ATEMPO = Number(process.env.VIENEU_TTS_ATEMPO) || 1.10;

const videoWorkspaceOut = path.join(workspaceRoot, 'out', 'fire_ant_full_movie_v15.mp4');
const ttsCacheDir = path.join(workspaceRoot, '.tts-cache', 'v15_fire_ant_full');

// =============================================================================
// KỊCH BẢN PHIM DÀI 6 PHÚT (4 HỒI — 40 PHÂN CẢNH) — NATURAL_STORYTELLING_TONE V15.0
// "7 Ngày Với Tổ Kiến Lửa Dưới Gốc Xoài"
// Ngôi thứ nhất gần gũi, hài hước đời thường, tò mò khoa học, cấm khẩu hiệu giáo điều!
// =============================================================================
const RAW_BEATS = [
  // ===========================================================================
  // HỒI 1 (Beats 1–10): MÙA HÈ Ở QUÊ & CÁI CHỌC QUE NHỚ ĐỜI
  // ===========================================================================
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_SUMMER_GREET',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'HỒI 1: MÙA HÈ Ở QUÊ ÔNG NỘI',
    narrationText:
      'Hồi mười hai tuổi, nghỉ hè vừa bắt đầu là ba mẹ gửi ngay tôi về quê ở với ông nội suốt hai tháng trời. Sân nhà ông rộng mênh mông, gió thổi rì rào ngay sát cánh đồng lúa chín vàng ươm.',
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
    voiceTone: 'CALM_STORY',
    narrationText:
      'Ở quê chẳng có máy tính hay điện thoại, nên thú vui lớn nhất của tôi mỗi buổi chiều là cầm que chạy đuổi chuồn chuồn khắp mảnh vườn sau nhà. Thế nhưng ngay ngày đầu tiên, tôi đã bắt gặp một thứ cực kỳ lạ lùng.',
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
      'Sát dưới gốc cây xoài cổ thụ có một mô đất nâu tròn xoe nhô cao khỏi mặt cỏ xanh rì. Tò mò quá, tôi rón rén bước lại gần, nghiêng đầu săm soi mãi mà chẳng hiểu thứ gì đã đắp nên nó.',
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
    narrationText:
      'Điểm kỳ quái nhất là bề mặt mô đất mịn màng tròn trịa giống hệt một chiếc bánh bao bằng đất khổng lồ. Khác hẳn với tổ kiến đen hay tổ dế thông thường, phía trên đỉnh chẳng hề có lấy một cái lỗ ra vào nào cả.',
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
    narrationText:
      'Tính tò mò của một thằng nhóc mười hai tuổi nổi lên không kìm được... Tôi nghĩ bụng chắc chỉ là ụ đất bỏ hoang thôi, thế là giơ cành cây khô chọc nhẹ vào sườn mô đất một cái thật êm.',
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
    narrationText:
      'Chưa đầy hai giây sau, cả mô đất bỗng như một nồi nước đang sôi sùng sục! Hàng trăm chấm đỏ li ti ào ạt tuôn ra, chúng chẳng hề bỏ chạy tán loạn mà lao thẳng dọc theo cành cây nhằm đúng tay tôi!',
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
    narrationText:
      'Tôi hét toáng lên, vứt vội cành cây rồi chạy thục mạng về sân nhà. Ông nội nghe tiếng la liền bước ra ngoài hiên, nhìn xuống gốc xoài rồi bật cười lắc đầu bảo: Kiến lửa đó con, tụi nó không dễ tính như kiến đen đâu!',
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
    narrationText:
      'Nghe ông kể tôi mới ngã ngửa: mô đất tròn nhỏ xíu trên mặt cỏ thực ra chỉ là phần nóc che nắng mưa thôi. Ngay bên dưới lớp đất ấy là cả một thành phố đường hầm đan chéo sâu hơn một mét dưới lòng đất!',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_QUEEN_COLONY',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'ĐẠI GIA ĐÌNH KIẾN LỬA',
    narrationText:
      'Trong thành phố ngầm đó sinh sống tới hàng trăm nghìn cư dân chia việc cực kỳ ngăn nắp: chính giữa đáy hang có kiến chúa chuyên đẻ trứng, lớp kiến thợ lo đào hầm kiếm ăn, còn vòng ngoài là đội quân kiến lính túc trực ngày đêm.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_EVENING_CURIOUS',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Chiều hôm đó ngồi ngoài sân ngắm hoàng hôn, tôi vẫn có chút ấm ức vì mới chọc một que đã phải chạy té khói. Tôi liếc mắt về phía gốc xoài, thầm nghĩ ngày mai nhất định phải quay lại thử tài tụi kiến này một phen.',
    startX: 780,
    targetX: 780,
    cameraZoom: [1.0, 1.04],
  },

  // ===========================================================================
  // HỒI 2 (Beats 11–20): CUỘC PHẢN CÔNG CỦA CẬU NHÓC 12 TUỔI & TỔ VỆ TINH
  // ===========================================================================
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'BEDROOM_INDOOR',
    kassSceneMode: 'BEDROOM_NIGHT_PLAN',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: 'HỒI 2: KẾ HOẠCH NỬA ĐÊM',
    narrationText:
      'Tối hôm ấy nằm trên giường nghe tiếng dế kêu ngoài cửa sổ, đầu óc tôi vẫn cứ nghĩ mãi về mô đất dưới gốc xoài. Chợt trong đầu lóe lên một ý nghĩ cực kỳ hồn nhiên: kiến sợ nước, hay sáng mai mình dội nước cho tụi nó dọn đi chỗ khác?',
    startX: 1090,
    targetX: 1090,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_MORNING_MARCH',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Sáng ngày thứ hai, vừa ăn sáng xong là tôi hí hửng xách ngay chiếc xô nhựa xanh múc đầy nước giếng mát lạnh, hiên ngang bước thẳng ra mảnh vườn sau nhà như một vị tướng chuẩn bị ra trận.',
    startX: 800,
    targetX: 800,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_WATER_SPLASH',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Đứng cách xa một khoảng cho chắc ăn, tôi nghiêng chiếc xô dội ào một dòng nước xuống thẳng giữa mô đất nâu. Nhìn bùn đất sụp nhẹ xuống rồi im ắng hẳn, tôi đắc chí cười thầm tưởng mình đã thắng dễ dàng.',
    startX: 885,
    targetX: 885,
    cameraZoom: [1.0, 1.05],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_SATELLITE_MOUNDS',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: 'MỌC THÊM TỔ VỆ TINH?!',
    narrationText:
      'Thế nhưng đến chiều ngày thứ ba quay lại kiểm tra, tôi đứng khựng người há hốc miệng. Mô đất cũ chẳng những đã được đắp lại vuông vức, mà xung quanh gốc xoài còn mọc thêm hai mô đất nhỏ mới tinh từ bao giờ!',
    startX: 740,
    targetX: 740,
    cameraZoom: [1.0, 1.05],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'UNDERGROUND_CROSS_SECTION',
    kassSceneMode: 'UNDERGROUND_EGG_EVACUATION',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    floatingHeader: 'DI TẢN TRỨNG XUỐNG TẦNG SÂU',
    narrationText:
      'Hóa ra ngay từ giây phút dòng nước vừa chạm xuống mặt cỏ, bên dưới lòng đất đã lập tức vang lên tín hiệu sơ tán. Hàng nghìn kiến thợ nhanh chóng ngậm chặt từng bọc trứng trắng, di tản theo đường hầm sang các khoang khô ráo sâu hơn.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_SATELLITE_NETWORK',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'MẠNG LƯỚI TỔ VỆ TINH',
    narrationText:
      'Càng bị quấy phá, đàn kiến lửa càng không bao giờ chịu bỏ cuộc. Chúng đào thêm các đường hầm ngầm liên thông rộng ra xung quanh rồi đắp lên hàng loạt tổ vệ tinh, chia nhỏ rủi ro để cả đại gia đình luôn có đường lui.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_FOOTSTEP_VIBRATION',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    narrationText:
      'Chưa chịu tin vào mắt mình, chiều ngày thứ tư tôi cố tình rón rén bước thật khẽ lại gần xem tụi kiến có phát hiện ra không. Nhưng tôi đâu biết rằng mỗi bước chân đặt xuống mặt cỏ đều giống như một hồi trống báo động dưới lòng đất.',
    startX: 740,
    targetX: 740,
    cameraZoom: [1.0, 1.05],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_VIBRATION_CO2',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'CẢM BIẾN RUNG & KHÍ CO₂',
    narrationText:
      'Dù mắt kiến lửa rất nhỏ, cặp râu và các khớp chân của chúng lại nhạy cảm kinh khủng với hai thứ: sóng rung động li ti truyền qua đất từ bước chân, và luồng khí cacbonic ấm nóng tỏa ra từ hơi thở của sinh vật lại gần.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_SCOUT_CLIMB_SHOE',
    voiceTone: 'STEP_BY_STEP_SUSPENSE',
    narrationText:
      'Tôi đứng ngay sát mép một tổ vệ tinh, cúi đầu nhìn mãi mà thấy mặt đất cứ im ắng lạ thường. Tôi chẳng hề hay biết rằng hàng chục con kiến lửa đã lặng lẽ bò qua mũi dép rồi leo dần lên cổ chân mình mà chưa hề cắn một phát nào.',
    startX: 955,
    targetX: 955,
    cameraZoom: [1.0, 1.06],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_SURPRISE_HOP',
    voiceTone: 'TENSE_CLIMAX',
    floatingHeader: 'CẮN ĐỒNG LOẠT!',
    narrationText:
      'Bỗng nhiên... châm chích rát bỏng cùng một lúc ở khắp cổ chân! Tôi giật bắn người nhảy lò cò lên không trung, vừa phủi lia lịa vừa la oai oái vì bất ngờ không kịp trở tay!',
    startX: 840,
    targetX: 840,
    cameraZoom: [1.03, 1.07],
  },

  // ===========================================================================
  // HỒI 3 (Beats 21–30): CHIẾN THUẬT ĐỒNG LOẠT CỦA KIẾN LỬA & TRẬN MƯA LỚN
  // ===========================================================================
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_SYNC_ATTACK',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: 'HỒI 3: CHIẾN THUẬT ĐỒNG LOẠT',
    narrationText:
      'Đó chính là tuyệt chiêu khiến kiến lửa nổi tiếng khắp nơi: những con đầu tiên leo lên da tuyệt đối không vội cắn ngay để khỏi đánh động. Chúng kiên nhẫn chờ đồng đội bò lên đủ đông, rồi mới phát tín hiệu hóa học tấn công cùng một nhịp!',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_GRANDPA_RESCUE',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Tôi nhảy lò cò về tới bậc thềm nhà, mặt nhăn nhó xoa cổ chân đỏ ửng. Ông nội thấy vậy liền chạy nhanh ra, lấy ngay khăn mát chườm dịu vết sưng rồi cười hiền bảo thằng cháu lì lợm cuối cùng cũng chịu nể mấy cô cậu kiến nhỏ.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_GRANDPA_WISDOM',
    voiceTone: 'SLOW_EMOTIONAL',
    narrationText:
      'Ngồi hóng gió chiều trên sân, ông nội xoa đầu tôi rồi nói một câu tôi nhớ mãi tới tận bây giờ: Con thấy tụi nó giỏi không? Muốn hiểu tự nhiên thì phải ngồi xuống quan sát thật kỹ, chứ đừng có phá nhà của tụi nó.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'BEDROOM_INDOOR',
    kassSceneMode: 'BEDROOM_GRAB_MAGNIFIER',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'NGÀY THỨ 5: ĐỔI CHIẾN THUẬT',
    narrationText:
      'Lời ông nội khiến tôi bỗng thấy tò mò theo một kiểu hoàn toàn mới. Sáng ngày thứ năm, tôi không còn cầm xô nước hay cành cây nữa, mà hào hứng lấy ngay chiếc kính lúp cũ trong ngăn kéo tủ cùng một cuốn sổ nhỏ ra vườn.',
    startX: 920,
    targetX: 920,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_MAGNIFIER_OBSERVE',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'NHÀ THÁM HIỂM TÍ HON',
    narrationText:
      'Lần này tôi ngồi gọn gàng cách xa mô đất một đoạn đủ thoáng, nhẹ nhàng đưa chiếc kính lúp ra phía trước. Kỳ lạ thật, khi tôi không làm rung đất hay chọc phá, đàn kiến cũng mặc kệ tôi ngồi đó và tiếp tục công việc bận rộn thường ngày.',
    startX: 875,
    targetX: 875,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_SOLDIER_VS_WORKER',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'KIẾN THỢ & KIẾN LÍNH',
    narrationText:
      'Nhìn qua mặt kính lúp phóng to, thế giới bé xíu hiện ra sống động như một bộ phim tài liệu. Những chú kiến thợ thân mảnh mai chạy đi chạy lại liên tục không nghỉ, còn dọc hai bên lối đi là các anh kiến lính đầu to kìm khỏe đứng canh cực kỳ oai vệ.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_ANTS_CARRY_CATERPILLAR',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Thích thú nhất là lúc cả chục con kiến thợ cùng hợp sức khiêng một con sâu xanh nặng gấp mấy chục lần cơ thể chúng về gốc xoài. Con kéo đầu, con đẩy đuôi, cả đoàn di chuyển nhịp nhàng chẳng khác nào một đội công nhân tí hon thực thụ.',
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.05],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_PHEROMONE_TRAIL',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: 'BẢN ĐỒ MÙI PHEROMONE',
    narrationText:
      'Tôi cứ thắc mắc làm sao cả trăm con kiến đi thành hàng thẳng tắp mà chẳng bao giờ bị lạc đường. Hóa ra mỗi khi tìm thấy thức ăn, kiến trinh sát sẽ chấm lại dọc đường những giọt mùi gọi là Pheromone — tạo thành tấm bản đồ vô hình cho cả đàn đi theo.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_DARK_CLOUDS_RAIN',
    voiceTone: 'TENSE_CLIMAX',
    floatingHeader: 'CƠN MƯA RÀO NGÀY THỨ 6!',
    narrationText:
      'Đang say sưa ghi chép thì chiều ngày thứ sáu, bầu trời bỗng kéo mây đen kịt khắp cánh đồng. Gió thổi nghiêng cả tán cây xoài, rồi một trận mưa rào mùa hạ xối xả trút xuống trắng xóa cả khu vườn.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.05],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'BEDROOM_INDOOR',
    kassSceneMode: 'YARD_WATCH_RAIN_WINDOW',
    voiceTone: 'SLOW_EMOTIONAL',
    narrationText:
      'Mưa kéo dài suốt cả đêm khiến nước dâng lênh láng ngoài sân vườn. Tôi đứng áp mũi vào khung cửa sổ phòng ngủ nhìn màn mưa rơi, trong lòng bỗng thấy lo lo không biết thành phố đường hầm sâu dưới gốc xoài có bị ngập chìm hết hay không.',
    startX: 685,
    targetX: 685,
    cameraZoom: [1.0, 1.04],
  },

  // ===========================================================================
  // HỒI 4 (Beats 31–40): CHIẾC BÈ KIẾN KỲ DIỆU & BÀI HỌC DƯỚI GỐC XOÀI
  // ===========================================================================
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_FLOODED_MORNING',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'HỒI 4: SÁNG NGÀY THỨ 7',
    narrationText:
      'Sáng ngày thứ bảy, cơn mưa lớn cuối cùng cũng ngớt dần. Hai ông cháu đội nón lá xắn quần lội ra thăm mảnh vườn sau nhà, lúc này cả bãi cỏ dưới gốc xoài đã biến thành một cái ao nhỏ mênh mông nước mưa.',
    startX: 690,
    targetX: 690,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_RED_PATCH_WATER',
    voiceTone: 'HOOK_INTRIGUE',
    narrationText:
      'Chỗ mô đất cũ đã chìm nghỉm dưới làn nước đục, tôi tưởng cả đàn kiến thế là hết đường sống rồi. Bỗng tôi sững người chỉ tay ra mặt nước: ngay gần gốc xoài có một mảng màu đỏ nâu kỳ lạ đang bồng bềnh trôi nổi!',
    startX: 700,
    targetX: 700,
    cameraZoom: [1.0, 1.05],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_LIVING_ANT_RAFT',
    voiceTone: 'HOOK_INTRIGUE',
    floatingHeader: 'CHIẾC BÈ KIẾN SỐNG!',
    narrationText:
      'Lại gần nhìn kỹ hơn, tôi mới trợn tròn mắt kinh ngạc: đó không phải lá cây mà là hàng chục nghìn con kiến lửa đang móc chặt chân vào nhau, kết thành một chiếc bè sống khổng lồ giữ kiến chúa và toàn bộ trứng khô ráo ở chính giữa!',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_AIR_BUBBLE_PHYSICS',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'PHAO BỌT KHÍ TỰ NHIÊN',
    narrationText:
      'Bí mật giúp chiếc bè sống nổi hàng ngày trời mà không chìm nằm ở lớp lông li ti chống thấm trên thân kiến. Khi đan chặt vào nhau, chúng bẫy lại vô số bọt khí bạc lấp lánh bên dưới làm thành chiếc phao cứu sinh giúp cả lớp kiến đáy bè vẫn thở được.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_RAFT_DRIFT_SAFE',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Mặt trời ló dạng sau mây, rọi ánh nắng ấm áp xuống dòng nước đang rút dần. Chiếc bè kiến đỏ lặng lẽ trôi theo dòng chảy qua bãi cỏ ngập, rồi khéo léo tấp vào một mô đất cao khô ráo ngay sát thân cây xoài.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'SIMPLE_GRASS_FIELD',
    kassSceneMode: 'GARDEN_GRANDPA_BOY_NONLA',
    voiceTone: 'SLOW_EMOTIONAL',
    narrationText:
      'Hai ông cháu đứng dưới chiếc nón lá nhìn cả đàn kiến lần lượt rời bè lên bờ mà cứ mỉm cười mãi không thôi. Không cần tàu thuyền hay máy móc gì cả, những sinh vật nhỏ bé bằng hạt gạo ấy lại đoàn kết đến mức vượt qua được cả cơn bão lớn.',
    startX: 735,
    targetX: 735,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_SUNNY_NOTEBOOK',
    voiceTone: 'CALM_STORY',
    narrationText:
      'Chiều nắng ráo, tôi mang cuốn sổ nhỏ ra sân cặm cụi vẽ lại đủ thứ từ sơ đồ đường hầm sâu hơn một mét cho tới chiếc bè kiến nổi trên mặt nước. Ông nội đứng sau vai ngó nhìn rồi gật gù khen thằng cháu vẽ khéo chẳng kém nhà khoa học nhí.',
    startX: 845,
    targetX: 845,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'EXACT_QUANTITATIVE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_SEVEN_DAY_NOTEBOOK',
    voiceTone: 'CALM_STORY',
    floatingHeader: 'NHẬT KÝ 7 NGÀY Ở QUÊ',
    narrationText:
      'Lật lại từng trang sổ tay bảy ngày: từ ngày đầu tò mò chọc que, ngày ba bất ngờ với tổ vệ tinh, ngày năm ngồi soi kính lúp hiểu dấu mùi Pheromone, cho đến ngày bảy chứng kiến chiếc bè kiến sống kỳ diệu sau cơn mưa.',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'QUALITATIVE_STATE',
    stageTheme: 'COUNTRYSIDE_YARD',
    kassSceneMode: 'YARD_SUMMER_FAREWELL',
    voiceTone: 'SLOW_EMOTIONAL',
    narrationText:
      'Mùa hè năm đó khép lại bằng một buổi chiều nắng vàng rực trên cánh đồng lúa quê nội. Trước khi lên xe về lại thành phố, tôi vẫy tay tạm biệt ông nội trước hiên nhà ngói đỏ, trong lòng đầy ắp những kỷ niệm thú vị chẳng thể nào quên.',
    startX: 760,
    targetX: 760,
    cameraZoom: [1.0, 1.04],
  },
  {
    action: 'STORY_MICRO_POSE',
    cardType: 'CHARACTER_POSE_CARD',
    metricMode: 'EXACT_QUANTITATIVE',
    stageTheme: 'EXPLAINER_POLKA_DOT',
    kassSceneMode: 'EXPLAIN_WARM_SERIES_OUTRO',
    voiceTone: 'SLOW_EMOTIONAL',
    extraTailFrames: 24,
    floatingHeader: 'HẸN GẶP LẠI MÙA HÈ SAU...',
    narrationText:
      'Hóa ra đôi khi thế giới diệu kỳ nhất lại nằm ngay dưới một gốc cây quen thuộc sau vườn nhà. Còn bạn, mùa hè tuổi thơ của bạn từng bắt gặp bí mật tự nhiên nào kỳ thú như vậy chưa?',
    startX: 960,
    targetX: 960,
    cameraZoom: [1.0, 1.03],
  },
];

async function main() {
  const cliArgs = parseChapterRenderCliArgs(process.argv);
  // 4 Hồi mặc định (40 beats); nếu Cloud truyền --total-chapters=10 thì chapterChunkedRenderer tự trải phẳng & chia đều 10 chunk × 4 beats!
  const chapters = splitBeatsIntoChapters(RAW_BEATS, 4, [
    'Hồi 1: Mùa Hè Ở Quê & Cái Chọc Que Nhớ Đời',
    'Hồi 2: Cuộc Phản Công Của Cậu Nhóc 12 Tuổi & Tổ Vệ Tinh',
    'Hồi 3: Chiến Thuật Đồng Loạt Của Kiến Lửa & Trận Mưa Lớn',
    'Hồi 4: Chiếc Bè Kiến Kỳ Diệu & Bài Học Dưới Gốc Xoài',
  ]);

  let remotionRendererMod = null;

  const summary = await renderLongMovieByChapters(chapters, videoWorkspaceOut, {
    movieId: MOVIE_ID,
    movieTitle: '7 Ngày Với Tổ Kiến Lửa Dưới Gốc Xoài (Phim Dài 4 Hồi — V15.0)',
    workspaceRoot,
    ttsCacheDir,
    fps: 60,
    cliArgs,
    renderEngineVersionTag: 'v15_0_fire_ant_full_movie',

    // 1. Strict Single-Voice Lock: 100% VIENEU_LOCAL ("Hải Đăng") — tự đọc cache đĩa khi chạy trên GitHub Actions Cloud!
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
          `[Strict Single-Voice Lock V15.0] Beat #${globalBeatIndex + 1} thất bại với VIENEU_LOCAL (${VIENEU_VOICE}): ${attempt.errorReason}.`
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

    // 2. Trộn âm thanh phòng thu V13.0/V15.0 (Voice + BGM -22dB crossfade + 6 SFX + sfx_whoosh êm 0.06 chỉ khi đổi bối cảnh!)
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

    // 3. Lazy-load Remotion Bundler & Chromium (chỉ nạp khi render video/stills; --audio-only & --concat-only chạy tức thì!)
    prepareRenderer: async () => {
      const { bundle } = await import('@remotion/bundler');
      remotionRendererMod = await import('@remotion/renderer');
      const hwEncoder = detectBestHardwareEncoder();
      const isCi = isLinuxOrCiEnvironment();
      console.log(
        `-> Khởi chạy Remotion Bundler & Chromium (gl="${HYBRID_GPU_CHROMIUM_OPTIONS.gl}" | Linux/CI=${isCi} | Encoder: ${hwEncoder.displayName})...`
      );
      const bundleStartMs = Date.now();
      const entryPoint = path.resolve(workspaceRoot, 'web-studio/src/remotion/index.ts');
      const bundleLocation = await bundle({
        entryPoint,
        onProgress: (p) => {
          if (p % 25 === 0) console.log(`Bundling: ${p}%`);
        },
      });
      console.log(`-> Bundle completed in ${((Date.now() - bundleStartMs) / 1000).toFixed(2)}s`);

      // Trên Linux/CI (mỗi runner chỉ render 1 chunk): để selectComposition/renderMedia tự quản lý Chromium với gl:"swangle" chống deadlock!
      if (isCi) {
        return {
          bundleLocation,
          browserInstance: undefined,
          close: async () => {},
        };
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

    // 4. Xuất ảnh tĩnh kiểm chứng các mốc V15.0 (Beat 5 mũi que CHỌC! + 8 kiến bò ra, Beat 29 mưa rào, Beat 33 bè kiến sống!)
    renderChapterStills: async (ctx) => {
      if (!remotionRendererMod) return;
      if (!cliArgs.isStillsOnly) return;

      const payload = {
        title: `7 Ngày Với Tổ Kiến Lửa — ${ctx.chunkLabel}`,
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

      const stills = [];
      for (const b of ctx.compiledBeats) {
        if (b.kassSceneMode === 'GARDEN_POKE_MOUND') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.44),
            name: 'still_v15_beat5_poke_choc.jpg',
            desc: 'V15 Fix 4: Ngôi sao "CHỌC!" đúng mũi que chạm mô đất',
          });
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.88),
            name: 'still_v15_beat5_ants_spill.jpg',
            desc: 'V15 Fix 4: 8 chấm kiến đỏ bò tràn khỏi mô đất & leo lên đầu que ở 25% cuối cảnh',
          });
        } else if (b.kassSceneMode === 'GARDEN_ANTS_BOIL') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.35),
            name: 'still_v15_bubble_lipsync.jpg',
            desc: 'V15 Fix 1 & 2: Đáy bóng thoại cao hơn HEAD_TOP >= 30px + khẩu hình miệng Lip-Sync',
          });
        } else if (b.kassSceneMode === 'GARDEN_DARK_CLOUDS_RAIN') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.5),
            name: 'still_v15_act3_heavy_rain.jpg',
            desc: 'Hồi 3: Cơn mưa rào xối xả 60fps ngập khu vườn xoài',
          });
        } else if (b.kassSceneMode === 'GARDEN_GRANDPA_BOY_NONLA') {
          stills.push({
            frame: b.startFrame + Math.floor(b.durationFrames * 0.55),
            name: 'still_v15_act4_ant_raft_nonla.jpg',
            desc: 'Hồi 4: Hai ông cháu đội nón lá ngắm chiếc bè kiến sống trôi dưới cầu vồng sau mưa',
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

    // 5. Render từng Chunk thành out/chunks/v15_fire_ant_full_movie_chapter_<1..N>.mp4 bằng Hybrid CPU + GPU / Cloud Matrix
    renderChapterVideo: async (ctx) => {
      const payload = {
        title: `7 Ngày Với Tổ Kiến Lửa — ${ctx.chunkLabel}`,
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
        jpegQuality: isLinuxOrCiEnvironment() ? 92 : 88,
        chunkLabel: ctx.chunkLabel,
        tempDirPrefix: `v15_fire_ant_ch${ctx.chapter.chapterNumber}_frames_`,
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
  console.error('Fatal V15.0 full movie render error:', err);
  process.exit(1);
});
