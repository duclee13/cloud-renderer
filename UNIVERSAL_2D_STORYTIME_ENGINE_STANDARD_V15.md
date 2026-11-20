# BỘ TIÊU CHUẨN TOÀN CỤC ENGINE HOẠT HÌNH 2D STORYTIME / EXPLAINER (UNIVERSAL STANDARD V15.0)

Tài liệu quy chuẩn tổng hợp từ V10 → V15.0 áp dụng tự động cho toàn bộ mọi kịch bản, nhân vật, bối cảnh, âm thanh và quy trình render song song (Laptop 8GB RAM & GitHub Actions Cloud Matrix 16GB RAM).

---

## 1. Chuẩn Hình Ảnh, Phụ Đề & Nhân Vật Người Que Thuần (V13.0 – V15.0)
1. **Độ phân giải chuẩn**: `1920x1080 @ 60fps`.
2. **Người Que Thuần (`StickmanRig.tsx`)**:
   - 5 `characterPreset` tái sử dụng: `BOY`, `GRANDPA`, `GRANDMA`, `DOCTOR`, `NEIGHBOR`.
   - Thân, tay, chân nét đen tròn đặc (`strokeWidth: 6px`, `strokeLinecap: "round"`), **cấm viền sáng rỗng ruột quanh tay chân**; đầu tròn trắng có bóng 3D lưỡi liềm `#CBD5E1`.
3. **Phụ đề chuẩn Kass Blox (`V7MovieComposition.tsx`)**:
   - Bỏ hoàn toàn hộp đen che mặt đất; chữ trắng `#FFFFFF` viền đen dày `-webkit-text-stroke: 7px #0F172A; paint-order: stroke fill;` ở `bottom: 34px`.
4. **Khoảng đệm Bóng Thoại (`ComicSpeechBubble` — V15.0 Fix 1)**:
   - Đáy bóng thoại (`safeY + ry`) bắt buộc cao hơn đỉnh đầu/tóc (`HEAD_TOP`) tối thiểu **`30px`** để tuyệt đối không bao giờ đè lên chỏm tóc nhân vật.
5. **Khẩu Hình Miệng Tự Động (`Lip-Sync Micro Talk` — V15.0 Fix 2)**:
   - Mọi nhân vật đang hiển thị `ComicSpeechBubble` (`isSpeaking = true`) tự động mở/đóng miệng nhịp nhàng theo `Math.sin(frame * 0.45) > 0`.

---

## 2. Chuyển Động 60fps Liên Tục & Quy Tắc Cảnh Sống Động (V14.1 – V15.0)
1. **Tối thiểu 80% phân cảnh động 60fps**: Cấm chuyển động giật 2 khung hình (`Math.floor` / nhị phân) cho tay chân.
2. **Công thức Vẫy Tay 60fps (`computeSmooth60fpsWaveArm`)**: Cánh tay trên giữ góc `-115°`, cẳng tay lắc liên tục `forearmAngle = -150° + Math.sin(frame * 0.28 + phaseOffset) * 28°`.
3. **Bước Chân Sinh Học (`resolvePendulumLegs`)**: Gối chân vung co hình số 4 (`>`) + nhún hông tự nhiên (`hipBob = -|sin(phase)| * 5px`), cấm trượt băng đơ chân.
4. **Môi trường & Đời sống (`Living Scene Rule`)**: Mây trôi chậm sang phải (`cloudX += frame * 0.18`), tán cây/lúa đung đưa gió (`Math.sin(frame * 0.04) * 1.5°`), nhân vật đứng nghe có nhịp thở nhẹ + chớp mắt tự nhiên mỗi `3 giây` (`180f`).
5. **Khớp Điểm Chạm & Nối Mạch Cảnh (V15.0 Fix 4)**: Hiệu ứng va chạm (như `"CHỌC!"`) tính bằng lượng giác đúng tọa độ mũi đạo cụ tiếp xúc; 25% cuối cảnh kích hoạt mở mồi hành động nối mạch sang cảnh sau.

---

## 3. Âm Thanh Phòng Thu & Giọng Đọc Đồng Nhất (V11.3 – V15.0)
1. **Strict Single-Voice Lock**: Toàn bộ 100% phân cảnh khóa cứng một giọng (`VIENEU_LOCAL — Hải Đăng`, `atempo=1.10`, cache đĩa SHA-256 trong `.tts-cache/`). Cấm trộn fallback sang giọng khác.
2. **BGM & 6 Auto SFX (`soundDesignEngine.ts`)**:
   - 3 bản nhạc nền không bản quyền (`BGM_STORY_CALM`, `BGM_TENSE_PULSE`, `BGM_WARM_OUTRO`) trộn dưới giọng đọc ở mức `-22dB` (crossfade `0.65s–0.8s`).
   - **V15.0 Fix 3**: `sfx_whoosh` hạ âm lượng êm còn **`0.06`** và **chỉ phát khi `prevBeat.stageType !== currBeat.stageType`** (không phát lặp khi hai cảnh chung một bối cảnh).

---

## 4. Giọng Văn Đời Sống Tự Nhiên & Không Bịa Số Liệu (V10.3 – V15.0)
1. **`NATURAL_STORYTELLING_TONE`**: Kể chuyện ngôi thứ nhất gần gũi, hài hước đời thường, tò mò khoa học; **tuyệt đối cấm giọng tuyên truyền, giáo điều hay khẩu hiệu cứng nhắc** (*"Đừng bao giờ thử!"*, *"Quy tắc thoát hiểm 3 bước"*, *"Hãy nhớ kỹ bài học"*).
2. **`NO FAKE METRICS`**: Chỉ hiện số liệu/tỷ lệ `%` khi kịch bản có đại lượng xác định (`EXACT_QUANTITATIVE`); trạng thái định tính (`QUALITATIVE_STATE`) chỉ dùng nhãn chữ & biểu tượng.

---

## 5. Kiến Trúc Render Chia Chương & GitHub Actions Cloud Matrix (V14.1 – V15.0)
- Mọi phim dài 6–9 phút dùng `chapterChunkedRenderer.ts` (`renderLongMovieByChapters`) hỗ trợ 4 chế độ:
  1. Mặc định (Laptop): render tuần tự Hồi `1..N` (bỏ qua Hồi trùng hash SHA-256) rồi nối bằng `ffmpeg -f concat -c copy`.
  2. `--audio-only`: tạo trước toàn bộ `.mp3` vào `.tts-cache/<movie_cache>/` + `manifest.json` để đẩy lên GitHub.
  3. `--chapter=<k>`: chạy song song tối đa 5 máy ảo Ubuntu 16GB RAM (`CONCURRENCY=4`) qua `.github/workflows/render-long-movie.yml`.
  4. `--concat-only`: ghép không nén lại toàn bộ `out/chunks/*_chapter_*.mp4` thành file MP4 hoàn chỉnh trong `< 1 giây`.

---

## 6. Chuẩn V16.0: Khuôn Mặt Thân Thiện, True Crossfade 0.5s & Luật Micro-Beat Đồng Bộ 1-1 Lời Thoại

### 6.1. Khuôn Mặt Người Que Thân Thiện Tối Giản (`FacialExpressions.tsx`, `StickmanArchetypes.tsx`, `StickmanRig.tsx`)
1. **Mắt tròn đen lớn (+25%) kèm chấm sáng trắng**: Đường kính mắt tăng lên ~`r = 9.6 * scale`, có chấm sáng chính góc trên-trái (`dot highlight`) và vầng sáng lưỡi liềm góc dưới-phải (`crescent highlight`) giúp nhân vật ấm áp, dễ thương và rõ nét ngay cả ở cỡ nhỏ.
2. **Ẩn lông mày mặc định**: ẨN hoàn toàn lông mày trên các biểu cảm mặc định (`HAPPY`, `IDLE`, `SMILE`, `CALM`) cho gương mặt thoáng hiền; **chỉ vẽ lông mày mảnh tinh tế (`3.5px`)** khi biểu cảm cần nhấn mạnh (`CURIOUS` / `inquisitive`, `SHOCKED` / `surprised`, `ANGRY` / `furrowed`, `WORRIED`).
3. **Bỏ nét cằm xám & Inner Shading sạch**: Xóa hoàn toàn vệt cong xám dưới miệng ở bản cũ; thay bằng dải `inner rim shading` nhẹ (`#E2E8F0` opacity `0.48`) dọc viền trong hình tròn đầu.
4. **Tóc mái mềm thân thiện (`BOY`) & đồng bộ 5 Preset**: Thay tóc gai răng cưa của `BOY` bằng kiểu tóc mái bo tròn mềm với 1–2 lọn gợn tự nhiên; `GRANDPA`, `GRANDMA`, `DOCTOR`, `NEIGHBOR` đồng bộ mắt tròn sáng & không còn nét cằm xám.
5. **Miệng cười chữ U tròn mềm**: Giữ nét cười chữ U ấm áp và giữ nguyên khẩu hình mở/đóng tròn tự nhiên (`Lip-Sync Micro Talk`) khi hiển thị bóng thoại.

### 6.2. True Simultaneous Crossfade 0.5s, Nhịp Nghỉ 0.4s & `ttsText` (`V7MovieComposition.tsx`, `chapterChunkedRenderer.ts`)
1. **Thuộc tính tùy chọn trên mỗi Beat (`ScriptBeat`)**:
   - `transitionIn?: 'CROSSFADE' | 'CUT'` — mặc định `'CROSSFADE'`.
   - `transitionFrames?: number` — mặc định `30` frames (`0.5s` @ 60fps).
   - `pauseAfterSec?: number` — mặc định chuẩn V16 là `0.4` giây nghỉ tự nhiên sau mỗi câu thoại.
   - `ttsText?: string` — văn bản phiên âm riêng gửi sang VieNeu-TTS để đọc chuẩn tiếng Việt (VD: `"khí các-bô-níc"`), trong khi phụ đề màn hình vẫn hiển thị `narrationText` / `text` đúng chính tả (VD: `"khí CO₂"` / `"khí cacbonic"`).
2. **Cơ chế True Simultaneous Crossfade (0% Nháy Đen)**:
   - Tại 30 frames giao điểm đầu Beat `i` (`transitionIn === 'CROSSFADE'`), Beat `i-1` giữ tầng nền `opacity = 1` và Beat `i` phủ chồng đồng thời với `opacity` tuyến tính `0 -> 1`, tạo công thức trộn chính xác `(1 - t) * SceneA + t * SceneB` — **tuyệt đối không bao giờ ló nền đen ở giữa**.
   - **Không bao giờ đọc đè giọng**: Audio Beat `i` chỉ bắt đầu sau khi audio Beat `i-1` kết thúc hoàn toàn + khoảng nghỉ `pauseAfterSec` (`0.4s`).
   - Khi `transitionIn === 'CUT'`, chuyển cảnh tức thì không fade (dùng cho nhịp giật mình / hài hước).

### 6.3. Luật Khóa V16 Micro-Beat Sync — "1 Ý = 1 Micro-Beat (3.5s–6.0s, 15–28 từ)"
1. **1 Cảnh = 1 Ý = 1 Hành Động Độc Lập**: Mỗi micro-beat dài chuẩn **`3.5s – 6.0s`** (tương ứng khoảng **`15 – 28 từ`** tiếng Việt đọc ở tốc độ `atempo=1.10`).
2. **Đồng Bộ 1-1 Lời Thoại ↔ Diễn Xuất**: Lời đọc kể hành động gì thì nhân vật trên màn hình diễn **CHÍNH XÁC** hành động đó trong cùng micro-beat (VD: lời nhắc *"cầm que chạy đuổi chuồn chuồn"* → bắt buộc dùng cảnh `GARDEN_CHASE_DRAGONFLY` chạy đuổi 2 chuồn chuồn + 1 bướm vàng thật sự; lời nhắc *"bắt gặp thứ lạ lùng dưới gốc xoài"* → cảnh chậm bước lại gần mô đất & bật bóng thoại `"Kìa, cái gì thế?"` đúng nhịp!).
3. **Bắt Buộc Tách Câu Dài Thành 2 Micro-Beat**: Mọi đoạn kịch bản có từ 2 ý hoặc 2 hành động trở lên (hoặc dài hơn `> 30 từ` / `> 6.5s`) **bắt buộc tách thành 2 micro-beat riêng**, nối mượt bằng `transitionIn: 'CROSSFADE'` (`0.5s`) + `pauseAfterSec: 0.4` để nhịp phim luôn sống động, bám sát lời kể 1-1 và tạo khoảng thở dễ nghe.
