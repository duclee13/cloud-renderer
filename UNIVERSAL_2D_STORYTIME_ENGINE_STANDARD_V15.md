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
