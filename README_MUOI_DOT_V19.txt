GOI PHIM V19.1: TAI SAO TRONG CUNG MOT PHONG, MUOI CHI DOT DUNG 1 NGUOI?
64 micro-beats (4 Hoi chia song song + kiem dinh tu dong 0 loi) + 12 hoat hoa 60fps.

BUOC 1 - Giai nen de, kiem tra typecheck va push len GitHub (PowerShell):
  Expand-Archive -Path "$env:USERPROFILE\Downloads\tai_sao_muoi_chi_dot_mot_nguoi_v19_cloud_bundle.zip" -DestinationPath "C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM" -Force
  cd "C:\Users\ASUS\Downloads\TOOL_2D_ANIM_API_FIX_1\TOOL_2D_ANIM\web-studio"
  npm run typecheck
  cd ..
  git add .
  git commit -m "V19.1 engine + Episode: Tai sao muoi chi dot 1 nguoi (64 beats + 12 60fps visuals)"
  git push

BUOC 2 - GitHub Actions -> Render Handcrafted JSON Movie -> Run workflow:
  - episode_file: episodes/tai_sao_muoi_chi_dot_mot_nguoi_v19.json
  - total_chapters: 16
  - output_name: tai_sao_muoi_chi_dot_mot_nguoi_v19.mp4
  - preview_only: false
