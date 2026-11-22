# LUẬT SẮT V19 — KHẮC VÀO NÃO SCRIPTER (1-1 LỜI THOẠI & HÌNH ẢNH)

1. **LUẬT TỐI THƯỢNG — LỜI NÓI GÌ, HÌNH VẼ ĐÓ (1-TO-1 VISUAL MATCH)**:
   - TUYỆT ĐỐI CẤM cảnh `EXPLAINER_POLKA_DOT` trống trơn chỉ có 1 Stickman đứng chỉ tay vào khoảng không.
   - TUYỆT ĐỐI CẤM dùng bối cảnh sinh hoạt lạc quẻ (phòng ngủ, sân nhà, phố...) khi lời thoại đang mô tả cơ chế bên trong cơ thể/khoa học.
   - Mọi beat giải thích cơ chế, bộ phận cơ thể, cấu tạo vật thể hoặc tiến trình khoa học BẮT BUỘC phải gắn `"customVisual": "<KEY>"` tương ứng 1-1 với câu thoại đó (ví dụ: nói tới thực quản → vẽ ống thực quản đẩy viên kẹo; nói tới dịch vị dạ dày → vẽ dạ dày chứa a-xít sủi bọt hòa tan đường; nói tới nhu động ruột → vẽ ống ruột co bóp đẩy viên kẹo).
2. **ĐỦ NHÂN VẬT & ĐÚNG TỈ LỆ**:
   - Lời thoại nhắc tới ai thì người đó BẮT BUỘC phải có mặt trên khung hình (hỗ trợ tối đa 3 actor cùng lúc, khoảng cách tối thiểu >= 280px để không đi xuyên nhau và không che bóng thoại).
   - Trẻ con (`BOY`) luôn nhỏ hơn người lớn; chỉ trẻ con mới tin tin đồn dân gian, người lớn chỉ dùng để nhắc trẻ con.
3. **DIỄN XUẤT TIẾT CHẾ NHƯ NGƯỜI THẬT**:
   - Hạn chế tối đa `SHIVER_PANIC` và `ARMS_UP_CHEER`; ưu tiên `TALK_GESTURE` (V18.4 tay buông tự nhiên), `NOD_SMILE`, `SCRATCH_HEAD`, `POINT_UP`.
   - Không dùng chữ `'z'` hoặc cụm `'cr'` trong `ttsText` để VieNeu-TTS `Hải Đăng` đọc chuẩn 100%.
