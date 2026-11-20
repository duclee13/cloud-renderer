# BỘ TIÊU CHUẨN KỸ THUẬT & ĐẠO DIỄN TOÀN CỤC CHO ENGINE HOẠT HÌNH 2D STORYTIME / EXPLAINER (UNIVERSAL STANDARD V10)

Tài liệu này quy định **bộ quy chuẩn bắt buộc áp dụng tự động cho toàn bộ mọi kịch bản, mọi phân cảnh (beat), mọi nhân vật và mọi thẻ Infographic** trong hệ thống `web-studio` (Remotion / TypeScript). Mục tiêu là đảm bảo **bất kỳ kịch bản nào đưa vào cũng tự động sinh ra video đạt chuẩn đồ họa, vật lý, biểu cảm và âm thanh của 4 video mẫu** mà không bao giờ phải sửa tay từng chữ hay từng khung hình.

---

## 1. NGUYÊN TẮC KIẾN TRÚC CỐT LÕI (ZERO-HARDCODE UNIVERSAL ENGINE)

1. **Cấm Hardcode Theo Kịch Bản Đơn Lẻ**: Không bao giờ gắn cứng tọa độ, góc xoay hay trạng thái theo số thứ tự frame cố định của riêng một video. Mọi chuyển động và biến đổi hình ảnh phải được tính toán tự động theo **tiến trình chuẩn hóa của cảnh** (`beatProgress = localFrame / durationFrames`, từ `0.0` đến `1.0`) kết hợp với **Trạng thái Sinh học (`VitalityState`)** và **Nhãn Hành động (`ActionIntent`)**.
2. **Độ Phân Giải & Vùng An Toàn Khung Hình (`1920x1080 @ 60fps`)**:
   - **Vùng Tiêu Đề Đỉnh (`Top Impact Header Zone`)**: `y = 55px .. 125px`. Dành riêng cho tiêu đề từ khóa nổi bật (`FloatingKeywordHeader`).
   - **Vùng Diễn Xuất & Infographic Chính (`Main Stage Zone`)**: `y = 140px .. 820px`, `x = 140px .. 1780px`. Không một bộ phận nhân vật, bóng thoại (`Speech/Thought Bubble`) hay nhãn chú thích (`Callout Badge`) nào được vượt quá `SAFE_TOP = 85px` hoặc đè xuống dưới `y = 835px`.
   - **Đường Mặt Sàn Chuẩn (`GROUND_FLOOR_Y`)**: `y = 800px` (phần nền sàn/mặt đất chiếm từ `y = 800px` đến `1080px`).
   - **Vùng Phụ Đề Điện Ảnh (`Subtitle Safe Zone`)**: `y = 885px .. 1015px`, căn giữa tại `x = 960px`, chiều rộng tối đa `1360px`.

---

## 2. CHÍNH SÁCH ĐỘ CHÍNH XÁC THÔNG TIN TOÀN CỤC — NO FAKE METRICS (V10.3)

Mọi phân cảnh, thẻ Infographic và Callout trên toàn hệ thống bắt buộc phân loại rõ theo chuẩn `metricMode: 'EXACT_QUANTITATIVE' | 'QUALITATIVE_STATE'` trong `src/lib/v7/universalAnimationStandard.ts`:

### 2.1. Khi Nào Hiện Thông Số Chi Tiết (`EXACT_QUANTITATIVE`)
Chỉ hiển thị con số cụ thể, đơn vị đo hoặc bộ đếm phần trăm khi **kịch bản có số liệu rõ ràng hoặc đại lượng vật lý/sinh học/thời gian đo đếm được thực tế**:
- **Mốc thời gian & bộ đếm rõ ràng**: `Ngày 1`, `Tuần 1`, `Tuần 2`, `60 ngày`, `0.1 giây` (`CALENDAR_FLIP_CARD`, `STOPWATCH_TALLY_CARD`, `CHAPTER_CARD`).
- **Tỷ lệ/góc độ được nhắc trực tiếp trong kịch bản**: `Xoay đầu 180°`, `giảm còn 1/5 (20%)` (`CANDLE_HOURGLASS_CARD`, `SIMPLE_CHART_CARD` có mốc trục rõ ràng).
- **Đồng hồ dự trữ (`GAUGE_RESERVE_CARD`)**: Chỉ gắn kèm con số `%` khi kịch bản thực sự truyền `targetPercent` xác định.

### 2.2. Khi Nào Tuyệt Đối Không Tự Bịa Số `%` (`QUALITATIVE_STATE`)
Đối với các **lựa chọn nhị phân, cơ chế bật/tắt, so sánh trạng thái hoặc khái niệm định tính không xác định được phần trăm chính xác** (ví dụ: *ưu tiên sự sống vs. tạm khóa sinh sản*, *bật phòng thủ vs. tắt tiêu hóa*, *cơn đói vs. nỗi sợ*, *nguy hiểm vs. an toàn*):
- **Cấm tuyệt đối** tự bịa hoặc gắn đuôi phần trăm giả kiểu `(100%)`, `(79%)`, `(9%)`, `(0%)`.
- Chỉ hiển thị **nhãn trạng thái chữ ngắn gọn, sắc nét, đổi màu theo trạng thái** kết hợp biểu tượng trực quan (ví dụ: `"CHẾ ĐỘ CHỜ"` → `"ĐANG ƯU TIÊN..."` → `"ƯU TIÊN TUYỆT ĐỐI"` và `"CHỜ XỬ LÝ"` → `"ĐANG KHÓA CHẶT..."` → `"TẠM ĐÓNG BĂNG"`).
- **Bảo vệ cấp Engine (`stripFabricatedPercentSuffix` / `formatStateBadgeLabel`)**: Ở chế độ `QUALITATIVE_STATE`, renderer tự động lọc sạch mọi đuôi phần trăm thừa trên toàn bộ thẻ (`TWO_DOORS_CARD`, `BALANCE_SCALE_CARD`, `GAUGE_RESERVE_CARD` không có `targetPercent`, và `CharacterStoryOverlays`) để đảm bảo mọi kịch bản mới từ người dùng hoặc LLM đều tuân thủ 100%.

> **Nguyên tắc vàng**: *Không xác định được chính xác thì dùng trạng thái chữ + biểu tượng trực quan, tuyệt đối không ham ghi số `%` thừa.*

---

## 3. QUY TẮC CHUYỂN TRẠNG THÁI TỪ TRUNG TÍNH ĐỐI XỨNG — NEUTRAL-TO-DECISION DUAL MORPH (V10.3)

Áp dụng tự động cho `TWO_DOORS_CARD` và mọi thẻ lựa chọn / so sánh 2 phương án thông qua hàm dùng chung `computeDualDecisionMorph(displayProgress)` và bảng màu `DUAL_DECISION_PALETTE`:

1. **Pha 1 — Trạng Thái Chờ / Đứng Trước Lựa Chọn (`displayProgress: 0.00 → 0.25`)**:
   - **CẢ HAI phương án (Trái & Phải)** đều bắt đầu cùng trạng thái trung tính chưa kích hoạt: thân cửa xám nhạt `#E2E8F0`, khung `#F1F5F9`, pano `#CBD5E1`, không tỏa sáng hào quang, biểu tượng ở trạng thái chờ trung tính (chấm chờ `•••` / ổ khóa xám mở gọng).
   - Nhãn bên dưới hai cửa ở pha này là trạng thái trung tính không có `%` (`"CHẾ ĐỘ CHỜ"` / `"CHỜ XỬ LÝ"`).
2. **Pha 2 — Đồng Thời Chuyển Màu Mượt Cả Hai Bên (`displayProgress: 0.25 → 0.62`)**:
   - Nội suy màu mượt (`interpolateHexColor`) **đồng thời** cho cả hai cánh cửa theo `morphT = smoothstep(0.25, 0.62, displayProgress)`:
     - **Bên Được Chọn (Trái — Ví dụ: `DUY TRÌ SỰ SỐNG`)**: Chuyển màu mượt từ Xám trung tính (`#E2E8F0`) → Vàng rực sáng (`#FACC15`), vầng hào quang vàng ấm dần lên (`opacity: 0 → 0.36`), dấu tích xanh lá (`#22C55E`) bật nảy (`spring`), nhãn chuyển mượt sang **`"ƯU TIÊN TUYỆT ĐỐI"`** *(không có `(100%)`)*.
     - **Bên Bị Tắt (Phải — Ví dụ: `SINH SẢN & ĐẺ TRỨNG`)**: Chuyển màu mượt từ Xám trung tính (`#E2E8F0`) → Xám đậm đóng băng (`#64748B`), ổ khóa đỏ (`#EF4444`) và hai dây xích chéo sập xuống dứt khoát kèm rung chấn & sóng xung kích, nhãn chuyển từ `"ĐANG KHÓA CHẶT..."` → **`"TẠM ĐÓNG BĂNG"`** *(không có `(79%)`, `(9%)`, `(0%)`)*.
3. **Pha 3 — Dòng Chuyển Năng Lượng & Giữ Kết Quả (`displayProgress: 0.62 → 1.00`)**:
   - Các hạt ánh sáng vàng di chuyển mượt theo quỹ đạo vòng cung từ cửa bị khóa sang bồi đắp cửa được chọn, phóng nhẹ cửa được chọn và giữ ổn định trạng thái hoàn chỉnh suốt khoảng thở cuối cảnh (`tail-hold`).

---

## 4. ĐỒNG BỘ BỘ ĐẾM ĐƠN ĐIỆU & NHỊP KỂ CHUYỆN CHẬM RÃI (V10.2)

1. **Hàm Đồng Bộ Toàn Cục `computeDisplayProgress(localFrame, durationFrames, leadInFrames = 18, tailHoldFrames = 42)`**:
   - Giữ cố định `0.0` trong `0.3s` mở đầu (`18 frames`), chạy đơn điệu mượt từ `0.0 → 1.0` trong thời gian đọc thoại, và khóa đứng `1.0` trong `0.7s` khoảng thở cuối cảnh (`42 frames`).
   - Áp dụng đồng bộ cho `CALENDAR_FLIP_CARD`, `CANDLE_HOURGLASS_CARD`, `GAUGE_RESERVE_CARD` và `TWO_DOORS_CARD`.
2. **Bản Đồ Tuân Thủ Từng Thẻ**:
   - `CALENDAR_FLIP_CARD`: `EXACT_QUANTITATIVE` — đồng bộ `activeStepIndex` tuyệt đối giữa tờ lịch lớn và thanh nút mốc bên dưới.
   - `CANDLE_HOURGLASS_CARD`: `EXACT_QUANTITATIVE` khi kịch bản có tỷ lệ xác định (ví dụ `100% → 20%` cho *"giảm còn một phần năm"*); tự động chuyển `QUALITATIVE_STATE` nếu không nêu số.
   - `SIMPLE_CHART_CARD`: `EXACT_QUANTITATIVE` với mốc trục nhất quán (`100% → targetPercent`) hoặc `QUALITATIVE_STATE` (`CAO / VỪA / THẤP`).
   - `GAUGE_RESERVE_CARD`: Mặc định `QUALITATIVE_STATE` với nhãn 3 vùng sạch (`"DỰ TRỮ AN TOÀN"` → `"ĐANG CẦM CỰ"` → `"BÁO ĐỘNG ĐỎ: CẠN KIỆT DỰ TRỮ"`); chỉ gắn kèm `(XX%)` khi có `targetPercent`.
   - `TWO_DOORS_CARD` & `BALANCE_SCALE_CARD`: Mặc định `QUALITATIVE_STATE` — cấm hoàn toàn phần trăm giả.
3. **Nhịp Kể Chuyện & Giọng Đọc Nam Trầm Ấm (`Baritone Calm Storytelling Matrix`)**:
   - Khóa thời lượng bằng `ffprobe`: `durationFrames = 18 + Math.ceil(speechOnlySec * 60) + 42`.
   - Render Hybrid CPU + GPU Intel Iris Xe (`gl: "angle"`, `concurrency: 2`, `jpeg`, `h264_qsv -global_quality 22`).
