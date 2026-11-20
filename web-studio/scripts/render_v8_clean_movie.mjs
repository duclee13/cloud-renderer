import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, renderMedia } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { WebSocket } from 'ws';

const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const workspaceRoot = 'C:/Users/ASUS/Downloads/TOOL_2D_ANIM_API_FIX_1/TOOL_2D_ANIM';
const videoWorkspaceOut = path.join(workspaceRoot, 'out/test_v8_clean_movie.mp4');
const videoArtifactOut = path.join(artifactDir, 'test_v8_clean_movie.mp4');

// Hàm tổng hợp giọng nói Edge-TTS với timeout an toàn
async function fetchEdgeTtsAudio(text, voice = 'vi-VN-HoaiMyNeural') {
  return new Promise((resolve) => {
    try {
      const trustedToken = '6A5AAFD830364C379E0CC76104E47567';
      const endpoint = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaheadedge/v1?TrustedClientToken=${trustedToken}`;
      const ws = new WebSocket(endpoint);
      const audioChunks = [];
      const timer = setTimeout(() => {
        try { ws.close(); } catch {}
        resolve(null);
      }, 7000);

      ws.on('open', () => {
        const date = new Date().toISOString();
        const configMessage =
          `X-Timestamp:${date}\r\n` +
          'Content-Type:application/json; charset=utf-8\r\n' +
          'Path:speech.config\r\n\r\n' +
          JSON.stringify({
            context: {
              synthesis: {
                audio: {
                  metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'true' },
                  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
                },
              },
            },
          });
        ws.send(configMessage);

        const requestId = Math.random().toString(36).substring(2);
        const ssml =
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>` +
          `<voice name='${voice}'>${text}</voice></speak>`;
        const requestMessage =
          `X-RequestId:${requestId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${date}\r\n` +
          'Path:ssml\r\n\r\n' +
          ssml;
        ws.send(requestMessage);
      });

      ws.on('message', (data, isBinary) => {
        if (isBinary) {
          const buffer = Buffer.from(data);
          const headerEnd = buffer.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            audioChunks.push(buffer.subarray(headerEnd + 4));
          } else {
            audioChunks.push(buffer);
          }
        } else {
          const textMsg = data.toString();
          if (textMsg.includes('Path:turn.end')) {
            clearTimeout(timer);
            try { ws.close(); } catch {}
            const fullAudio = Buffer.concat(audioChunks);
            resolve(`data:audio/mp3;base64,${fullAudio.toString('base64')}`);
          }
        }
      });

      ws.on('error', () => {
        clearTimeout(timer);
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

async function main() {
  console.log('=== BẮT ĐẦU QUY TRÌNH RENDER V8 PRODUCTION CLEAN MOVIE ===');
  fs.mkdirSync(path.dirname(videoWorkspaceOut), { recursive: true });
  fs.mkdirSync(artifactDir, { recursive: true });

  // 1. Chuẩn bị Kịch bản mẫu Production V8 (6 Phân Cảnh, 100% Zero-HUD, Cinematic Subtitles)
  const beatsData = [
    {
      action: 'WALK',
      stageTheme: 'STUDY_ROOM',
      durationFrames: 120,
      startX: 680,
      targetX: 915,
      headerTitle: 'TIẾN TỚI BÀN LÀM VIỆC',
      narrationText: 'Mỗi buổi sáng, nhân vật bắt đầu ngày mới bằng việc đi tới bàn làm việc tập trung cao độ.',
    },
    {
      action: 'SIT_AND_TYPE',
      stageTheme: 'STUDY_ROOM',
      durationFrames: 160,
      startX: 915,
      targetX: 915,
      headerTitle: 'LẬP TRÌNH SÁNG TẠO',
      narrationText: 'Ngồi vào ghế công thái học, ngón tay lướt nhanh trên bàn phím để sáng tạo nên những dòng mã hoàn hảo.',
      speechBubbleText: 'Tập trung viết code!',
    },
    {
      action: 'SHOCK_CELEBRATE',
      stageTheme: 'STUDY_ROOM',
      durationFrames: 140,
      startX: 915,
      targetX: 960,
      seatX: 915,
      headerTitle: 'ĂN MỪNG CHIẾN THẮNG',
      narrationText: 'Bất ngờ nhận được thông báo dự án đã đạt giải nhất! Anh ấy đứng bật dậy reo hò ăn mừng.',
      speechBubbleText: 'Chiến thắng rồi! Tuyệt quá!',
    },
    {
      action: 'RUN_AND_KICK_BALL',
      stageTheme: 'SUNSET_PARK',
      durationFrames: 160,
      startX: 400,
      targetX: 740,
      headerTitle: 'SÚT BÓNG ĐẲNG CẤP',
      narrationText: 'Chiều về, anh ra sân bóng đường phố, chạy lấy đà và tung cú sút tuyệt đẹp vào khung thành.',
      speechBubbleText: 'Vào rồi! Bàn thắng vàng!',
    },
    {
      action: 'JUMP_OVER',
      stageTheme: 'DARK_STUDIO',
      durationFrames: 160,
      startX: 640,
      targetX: 1080,
      obstacleHeight: 120,
      headerTitle: 'VƯỢT QUA THỬ THÁCH',
      narrationText: 'Đối mặt với những thử thách lớn trong cuộc sống, anh luôn sẵn sàng bật cao vượt qua mọi chướng ngại vật.',
      speechBubbleText: 'Không gì cản bước!',
    },
    {
      action: 'WAVE_AND_DRINK',
      stageTheme: 'GARDEN_DAY',
      durationFrames: 140,
      startX: 960,
      targetX: 960,
      headerTitle: 'LỜI CHÀO KẾT PHIM',
      narrationText: 'Cảm ơn các bạn đã theo dõi câu chuyện! Hãy luôn nỗ lực và không ngừng theo đuổi ước mơ.',
      speechBubbleText: 'Tạm biệt và hẹn gặp lại!',
    },
  ];

  console.log('1. Tổng hợp âm thanh Edge-TTS cho từng phân cảnh...');
  let currentStart = 0;
  const compiledBeats = [];

  for (let i = 0; i < beatsData.length; i++) {
    const b = beatsData[i];
    console.log(`Đang gọi Edge-TTS cho beat ${i + 1}: "${b.headerTitle}"...`);
    const audioUrl = await fetchEdgeTtsAudio(b.narrationText);
    if (audioUrl) {
      console.log(`-> TTS thành công cho beat ${i + 1}!`);
    } else {
      console.log(`-> TTS offline/skip cho beat ${i + 1}.`);
    }

    compiledBeats.push({
      type: b.action,
      action: b.action,
      theme: b.stageTheme,
      stageTheme: b.stageTheme,
      startFrame: currentStart,
      durationFrames: b.durationFrames,
      startX: b.startX,
      targetX: b.targetX,
      obstacleHeight: b.obstacleHeight,
      headerTitle: b.headerTitle,
      narrationText: b.narrationText,
      audioUrl: audioUrl || undefined,
      speechBubbleText: b.speechBubbleText,
      archetype: 'default',
      showDebugHud: false, // TUYỆT ĐỐI KHÔNG HIỂN THỊ HUD ĐEN KỸ THUẬT
    });
    currentStart += b.durationFrames;
  }

  const v7MoviePayload = {
    title: 'Phim Hoạt Hình 2D Production V8',
    totalDurationFrames: currentStart,
    fps: 60,
    beats: compiledBeats,
    showDebugHud: false,
  };

  console.log(`Tổng thời lượng phim: ${currentStart} frames (${(currentStart / 60).toFixed(1)} giây).`);

  // 2. Bundling Remotion
  console.log('2. Bundling Remotion project...');
  const entryPoint = path.resolve('C:/Users/ASUS/Downloads/TOOL_2D_ANIM_API_FIX_1/TOOL_2D_ANIM/web-studio/src/remotion/index.ts');
  const bundleLocation = await bundle({
    entryPoint,
    onProgress: (p) => {
      if (p % 25 === 0) console.log(`Bundling: ${p}%`);
    },
  });
  console.log('Bundle complete:', bundleLocation);

  // 3. Selecting composition V7MovieComposition
  console.log('3. Selecting composition V7MovieComposition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'V7MovieComposition',
    inputProps: {
      payload: v7MoviePayload,
      showDebugHud: false,
    },
  });
  console.log(`Composition found: ${composition.id} (${composition.width}x${composition.height}, duration: ${composition.durationInFrames} frames)`);

  // 4. Render Still Frames Kiểm Chứng V8.2 (Passing Pose & Full-Body Coordination)
  const stillsToRender = [
    { frame: 30, name: 'still_v8_2_f30_passing_walk1.png', desc: 'F30: Pha cắt kéo 1 — Chân lăng nhô gối hình số 4, 2 tay tách khỏi thân' },
    { frame: 55, name: 'still_v8_1_f55_walk.png', desc: 'F55: Đi bộ mỉm cười, mắt có điểm sáng, tay vung chữ L rõ ràng' },
    { frame: 60, name: 'still_v8_2_f60_passing_walk2.png', desc: 'F60: Pha cắt kéo 2 — Chân lăng nhô gối hình số 4, 2 tay tách khỏi thân' },
    { frame: 110, name: 'still_v8_2_f110_sit_transition.png', desc: 'F110: Dừng trước ghế và ngồi xuống mượt mà, không đi xuyên qua ghế' },
    { frame: 200, name: 'still_v8_1_f200_typing.png', desc: 'F200: Ngồi ghế gõ laptop, tay chạm bàn phím, bóng thoại rõ nét' },
    { frame: 330, name: 'still_v8_1_f330_celebrate.png', desc: 'F330: Ăn mừng đứng ở X=845px bên trái ghế, 2 chân không đè lên ghế' },
    { frame: 390, name: 'still_v8_2_f390_celebrate_arms_down.png', desc: 'F390: Hạ tay ăn mừng, 2 tay buông tự nhiên hai bên hông (không gập bọ ngựa)' },
    { frame: 455, name: 'still_v8_1_f455_run_no_bubble.png', desc: 'F455: Chạy đà sút bóng, chưa hiện bóng thoại' },
    { frame: 470, name: 'still_v8_2_f470_run_arms.png', desc: 'F470: Chạy đà sút bóng có đủ 2 cánh tay đánh chạy khỏe khoắn' },
    { frame: 505, name: 'still_v8_1_f505_kick_ball_bubble.png', desc: 'F505: Sút bóng bay đi, 2 cánh tay mở đối trọng thể thao, hiện bóng thoại Vào rồi!' },
    { frame: 600, name: 'still_v8_2_f600_approach_crate.png', desc: 'F600: Chạy tiếp cận trước thùng hàng, chân chạm sàn chạy bình thường' },
    { frame: 645, name: 'still_v8_1_f645_jump_clamped_bubble.png', desc: 'F645: Bay qua thùng hàng, 2 tay mở thể thao, bóng thoại cách mép trên >= 80px' },
  ];

  console.log('4. Rendering verification stills...');
  for (const item of stillsToRender) {
    const artifactPath = path.join(artifactDir, item.name);
    const outPath = path.join(workspaceRoot, 'out', item.name);
    console.log(`Rendering frame ${item.frame} (${item.desc}) -> ${item.name}...`);
      await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: artifactPath,
      frame: item.frame,
      imageFormat: 'png',
      chromiumOptions: { gl: 'angle' },
      inputProps: {
        payload: v7MoviePayload,
        showDebugHud: false,
      },
    });
    fs.copyFileSync(artifactPath, outPath);
    console.log(`Rendered ${item.name} successfully at ${artifactPath} & ${outPath}`);
  }

  // 5. Render Video Toàn Bộ (Hybrid CPU + GPU Intel Iris Xe)
  const isPreview = process.argv.includes('--preview');
  console.log(`5. Rendering full video out/test_v8_clean_movie.mp4 (${isPreview ? 'PREVIEW 720p@30fps' : '1080p@60fps'})...`);
  if (fs.existsSync(videoWorkspaceOut)) {
    fs.unlinkSync(videoWorkspaceOut);
  }

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: videoWorkspaceOut,
    inputProps: {
      payload: v7MoviePayload,
      showDebugHud: false,
    },
    chromiumOptions: { gl: 'angle' },
    hardwareAcceleration: 'if-possible',
    concurrency: 2,
    imageFormat: 'jpeg',
    jpegQuality: 90,
    x264Preset: 'veryfast',
    scale: isPreview ? 1280 / 1920 : 1.0,
    everyNthFrame: isPreview ? 2 : 1,
    timeoutInMilliseconds: 120000,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct % 10 === 0) {
        console.log(`Video render progress: ${pct}%`);
      }
    },
  });
  console.log('Video render finished in workspace:', videoWorkspaceOut);

  // Copy sang thư mục Artifacts
  fs.copyFileSync(videoWorkspaceOut, videoArtifactOut);
  console.log('Video copied to artifact:', videoArtifactOut);

  const stats = fs.statSync(videoWorkspaceOut);
  console.log(`Rendered video file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log('=== QUY TRÌNH RENDER V8 PRODUCTION HOÀN TẤT XUẤT SẮC ===');
}

main().catch((err) => {
  console.error('Fatal render error:', err);
  process.exit(1);
});
