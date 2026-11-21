HƯỚNG DẪN CHẠY TẬP V18: "CĂN PHÒNG YÊN TĨNH NHẤT THẾ GIỚI" (ĐA LỚP NHẤT CỬ NHẤT ĐỘNG)
======================================================================================

Bên trong file ZIP gồm:
1. web-studio/episodes/phong_yen_tinh_nhat_the_gioi_v18.json
   -> 64 micro-beats chuẩn V18, 100% nhân vật có mảng timeline[] (2-4 nhất cử nhất động nối tiếp mỗi cảnh) + camera zoom động + không chữ 'z' trong ttsText.
2. STORY_DIRECTOR_PROMPT_V18.md
   -> Bộ quy chuẩn độc lập dùng chung cho mọi AI (ChatGPT, Claude, DeepSeek, Gemini...) lưu ngay trong dự án.

CÁCH CHẠY TRONG 2 BƯỚC:
-----------------------
Bước 1: Mở PowerShell chạy 5 dòng sau để tự giải nén thẳng vào TOOL_2D_ANIM và đẩy lên GitHub:
  Expand-Archive -Path "$env:USERPROFILE\Downloads\phong_yen_tinh_v18_cloud_bundle.zip" -DestinationPath "C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM" -Force
  cd C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM
  git add .
  git commit -m "Add V18 Episode: Phong yen tinh nhat the gioi (64 beats + timeline)"
  git push

Bước 2: Lên GitHub -> Actions -> chọn "Render Handcrafted JSON Movie (Cloud VieNeu-TTS + 16 VMs)" -> bấm Run workflow:
  - episode_file: episodes/phong_yen_tinh_nhat_the_gioi_v18.json
  - total_chapters: 16
  - output_name: phong_yen_tinh_nhat_the_gioi_v18.mp4
  - preview_only: bỏ tick (false)
  -> Bấm nút xanh Run workflow, đợi ~15 phút (có thể tắt máy đi ngủ!) rồi tải phim trong Artifacts.
