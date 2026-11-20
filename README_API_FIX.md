# TOOL 2D ANIM — API FIX 1

Bản này sửa trực tiếp từ ZIP TOOL 2D ANIM(1).zip người dùng gửi ngày 11/11/2026. Vẫn tự tạo phân cảnh bằng Gemini API key; không nhập JSON thủ công, không yêu cầu chuyển kịch bản qua Antigravity. Giữ renderer và thiết lập xuất 1920×1080, 60 fps của bản tải lên. Không tự gọi TTS trong pipeline.

## Chạy trên Windows

1. Dừng terminal/server cũ bằng Ctrl+C.
2. Giải nén vào thư mục mới. Không chép đè node_modules hay .next của bản cũ.
3. Mở START_WINDOWS.cmd, hoặc mở terminal trong web-studio rồi chạy:

```powershell
npm ci
npm run dev -- --port 3000
```

4. Mở http://localhost:3000. Tiêu đề ô kịch bản phải có **API FIX 1**.
5. Nhập key trong Cấu hình API như trước, chọn model và bấm **Sinh Scene Graph với Gemini**. Không gửi key qua chat.
6. Nếu lỗi sau khi tách cảnh/đạo diễn được một số cảnh, bấm **Tiếp tục bằng API từ bản lưu**. Không tạo lại từ đầu. Bản lưu nằm trong sessionStorage của tab: tải lại tab vẫn giữ nếu trình duyệt cho phép; đóng tab có thể mất.
7. Nếu lỗi vẫn còn, bấm **Tải báo cáo lượt gọi API (đã che key)** ngay phía trên thông báo tiến độ/lỗi. Báo cáo ghi model, requestId, bước và lỗi; không lưu trường API key. Không cần thử thêm hàng loạt key.

## Những lỗi đã sửa trong mã

- Truyền hủy tới fetch trong SDK thật; timeout từng yêu cầu 90 giây, phân biệt timeout HTTP 504 với người dùng hủy.
- Hủy cần đúng requestId; không hủy nhầm tác vụ mới. Khóa chỉ mở khi tác vụ trước đã dừng thật, thay vì mở ngay sau khi bấm Hủy.
- /api/gemini và /api/pipeline/generate dùng chung cơ chế kiểm soát. Bỏ tạo cảnh bằng model cố định trong hộp xuất video; về ô kịch bản để dùng đúng model và bản lưu.
- Bản mẫu ban đầu không được coi là bản dựng của kịch bản người dùng để xuất.
- Giãn thời điểm bắt đầu các lượt gọi pipeline tối thiểu 13 giây (có thể cấu hình GEMINI_MIN_INTERVAL_MS). Đây là cách giảm gọi dồn; không bảo đảm giải quyết quá tải dịch vụ.
- Retry có giới hạn, chờ khoảng 15/30/60 giây, tôn trọng thời gian RetryInfo nếu có. Lỗi không rõ nguyên nhân không tự gán là HTTP 500 để retry.
- Gửi checkpoint ngay sau tách cảnh và sau từng cảnh; so khớp kịch bản/model khi tiếp tục. Giữ bản lưu khi lỗi giữa chừng.
- SSE có heartbeat, dọn timer/listener và không enqueue vào stream đã hủy. HTTP 200 của SSE không được coi là tạo video thành công nếu không có complete.
- Asset thiếu mà Gemini báo lỗi sẽ dừng đúng bước, không ghi hình procedural mẫu vào cache rồi coi là hoàn thành.
- Loại bỏ lời khẳng định model “siêu nhanh <1s, rất ổn định” khỏi danh sách chọn.

## Kiểm chứng

- npm run typecheck: thành công.
- npm test: 12 bài kiểm tra xử lý API. SDK và route được chạy thật với HTTP giả lập: 503, 403, timeout, hủy, khóa đồng thời, giãn lượt gọi, checkpoint/resume, asset lỗi và endpoint JSON/SSE chung khóa.
- npm run build: thành công.
- Log kiểm tra nằm trong validation-api-fix/.

Chưa chạy thành công với Gemini thật bằng key của người dùng. Các kiểm tra giả lập xác nhận hành vi của mã, không đo được tỷ lệ thành công của Google. Các kết quả PowerShell trước đó cho thấy 503 cũng xuất hiện ngoài tool; bản này không được xem là bằng chứng Google đã hết lỗi.

Chưa kiểm tra tương tác trình duyệt hoặc xuất MP4 mới trên Windows. Không thay đổi rig hay nội dung nghệ thuật trong bản sửa API này. Bản này cũng chưa nâng cấp bộ dependency cũ, gồm Next 15.1.7; các cảnh báo npm audit trước đó chưa được xử lý ở đây.

Khóa đồng thời hiện áp dụng cho các route của một tiến trình Node (phù hợp chạy local), không phải khóa phân tán cho nhiều máy/worker. Thời hạn một phiên pipeline là 570 giây; khi hết hạn có thể tiếp tục từ bản lưu đã nhận được.
