HƯỚNG DẪN SỬ DỤNG GÓI PHIM V16 (KHÔNG TỐN 1% QUOTA ANTIGRAVITY / GEMINI / GROQ)
=================================================================================

Gói ZIP này chứa sẵn:
1. web-studio/episodes/khong_ngu_7_ngay_v16.json
   -> Toàn bộ kịch bản 64 micro-beat (~6 phút 30 giây) chuẩn V16: "Sẽ Ra Sao Nếu Bạn Không Ngủ Trong 7 Ngày Liên Tiếp?"
   -> Đúng khoa học (Adenosine, ngủ vi mô Microsleep, Cortisol, ảo giác ngày 3-6, kỷ lục Randy Gardner 1964, dọn rác não bộ & ngủ bù REM).
   -> Đúng bối cảnh 100%, chuyển động 60fps thật, bóng thoại tự nhiên, phiên âm tiếng Việt mượt cho VieNeu-TTS Hải Đăng.

2. .github/workflows/render-json-movie.yml
   -> Workflow chạy thẳng từ file JSON có sẵn -> tự tạo giọng đọc VieNeu-TTS Hải Đăng trên Cloud -> 16 máy ảo render song song (~12-15 phút) -> ghép lossless ra file MP4.

CÁCH CHẠY TRONG 3 BƯỚC:
-----------------------
Bước 1: Giải nén file ZIP này thẳng vào thư mục gốc dự án của bạn:
        C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM
        (Chấp nhận ghi đè/gộp thư mục nếu Windows hỏi).

Bước 2: Mở PowerShell tại thư mục TOOL_2D_ANIM và đẩy lên GitHub:
        git add .
        git commit -m "Add handcrafted V16 episode: Khong ngu 7 ngay + JSON Cloud workflow"
        git push

Bước 3: Mở tab Actions trên repo GitHub duclee13/cloud-renderer:
        - Chọn workflow mới: "Render Handcrafted JSON Movie (Cloud VieNeu-TTS + 16 VMs)"
        - Bấm "Run workflow" (giữ nguyên mặc định: episodes/khong_ngu_7_ngay_v16.json, 16 máy ảo, preview_only = false)
        - Chờ ~15 phút (có thể tắt máy đi ngủ!) rồi vào mục Artifacts tải file "final-handcrafted-movie".
