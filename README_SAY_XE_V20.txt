GOI PHIM V20 FULL-SCREEN 1920x1080: TAI SAO DOC DIEN THOAI TREN XE LAI BI SAY XE?
64 micro-beats + 18 hoat canh 60fps tran man hinh 1920x1080 (khop 1-1 tung cau thoai, 0 loi kiem dinh).

BUOC 1 - PowerShell:
  Expand-Archive -Path "$env:USERPROFILE\Downloads\tai_sao_bi_say_xe_v20_cloud_bundle.zip" -DestinationPath "C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM" -Force
  cd "C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM\web-studio"
  npm run typecheck
  node scripts/validate_episode.mjs episodes/tai_sao_bi_say_xe_v20.json
  cd ..
  git add .
  git commit -m "V20 engine + Episode: Tai sao bi say xe (64 beats + 18 full-screen 1920x1080 visuals)"
  git push

BUOC 2 - GitHub Actions -> Render Handcrafted JSON Movie -> Run workflow:
  - episode_file: episodes/tai_sao_bi_say_xe_v20.json
  - total_chapters: 16
  - output_name: tai_sao_bi_say_xe_v20.mp4
  - preview_only: false
