HƯỚNG DẪN CHẠY TẬP V18.2: "CHUYỆN GÌ THỰC SỰ XẢY RA KHI BẠN LỠ NUỐT KẸO CAO SU?"
==================================================================================

Chạy cụm lệnh sau trong PowerShell để giải nén thẳng vào TOOL_2D_ANIM và đẩy lên GitHub:
  Expand-Archive -Path "$env:USERPROFILE\Downloads\nuot_keo_cao_su_v18_cloud_bundle.zip" -DestinationPath "C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM" -Force
  cd C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM
  git add .
  git commit -m "Add V18.2 Episode: Nuot keo cao su (64 beats, grounded story)"
  git push

Sau đó vào GitHub -> Actions -> Render Handcrafted JSON Movie (Cloud VieNeu-TTS + 16 VMs) -> Run workflow:
  - episode_file: episodes/nuot_keo_cao_su_v18.json
  - total_chapters: 16
  - output_name: nuot_keo_cao_su_v18.mp4
  - preview_only: false
