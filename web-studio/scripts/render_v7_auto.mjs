import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, renderMedia } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const workspaceRoot = 'C:/Users/ASUS/Downloads/TOOL_2D_ANIM_API_FIX_1/TOOL_2D_ANIM';
const videoWorkspaceOut = path.join(workspaceRoot, 'out/test_v7_auto_pipeline_showcase.mp4');
const videoArtifactOut = path.join(artifactDir, 'test_v7_auto_pipeline_showcase.mp4');

const framesToRender = [
  { frame: 45, name: 'still_v7_f45_walk.png' },
  { frame: 165, name: 'still_v7_f165_sit_type.png' },
  { frame: 300, name: 'still_v7_f300_shock_celebrate.png' },
  { frame: 470, name: 'still_v7_f470_kick_impact.png' },
  { frame: 495, name: 'still_v7_f495_ball_flight.png' },
  { frame: 550, name: 'still_v7_f550_wave_front.png' },
  { frame: 660, name: 'still_v7_f660_drink_cup.png' },
  { frame: 810, name: 'still_v7_f810_push_heavy.png' },
  { frame: 885, name: 'still_v7_f885_jump_over_crate.png' },
  { frame: 920, name: 'still_v7_f920_walk_to_board.png' },
  { frame: 990, name: 'still_v7_f990_point_board.png' },
];

async function main() {
  console.log('--- BẮT ĐẦU QUY TRÌNH RENDER V7.0 AUTO PIPELINE ---');
  fs.mkdirSync(path.dirname(videoWorkspaceOut), { recursive: true });
  fs.mkdirSync(artifactDir, { recursive: true });

  console.log('1. Bundling Remotion project...');
  const entryPoint = path.resolve('C:/Users/ASUS/Downloads/TOOL_2D_ANIM_API_FIX_1/TOOL_2D_ANIM/web-studio/src/remotion/index.ts');
  const bundleLocation = await bundle({
    entryPoint,
    onProgress: (p) => {
      if (p % 25 === 0) console.log(`Bundling: ${p}%`);
    },
  });
  console.log('Bundle complete:', bundleLocation);

  console.log('2. Selecting composition TestV7AutoScriptShowcase...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'TestV7AutoScriptShowcase',
  });
  console.log(`Composition found: ${composition.id} (${composition.width}x${composition.height}, ${composition.durationInFrames} frames)`);

  console.log('3. Rendering 9 verification stills...');
  for (const item of framesToRender) {
    const artifactPath = path.join(artifactDir, item.name);
    console.log(`Rendering frame ${item.frame} -> ${item.name}...`);
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: artifactPath,
      frame: item.frame,
      imageFormat: 'png',
      chromiumOptions: { gl: 'angle' },
    });
    console.log(`Rendered ${item.name} successfully at ${artifactPath}`);
  }

  const isPreview = process.argv.includes('--preview');
  console.log(`4. Rendering full video out/test_v7_auto_pipeline_showcase.mp4 (${isPreview ? 'PREVIEW 720p@30fps' : '1080p@60fps'})...`);
  console.log(`Target workspace video: ${videoWorkspaceOut}`);

  if (fs.existsSync(videoWorkspaceOut)) {
    fs.unlinkSync(videoWorkspaceOut);
  }

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: videoWorkspaceOut,
    chromiumOptions: { gl: 'angle' },
    hardwareAcceleration: 'if-possible',
    concurrency: 2,
    imageFormat: 'jpeg',
    jpegQuality: 90,
    x264Preset: 'veryfast',
    scale: isPreview ? 1280 / 1920 : 1.0,
    everyNthFrame: isPreview ? 2 : 1,
    timeoutInMilliseconds: 90000,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct % 10 === 0) {
        console.log(`Video render progress: ${pct}%`);
      }
    },
  });
  console.log('Video render finished in workspace:', videoWorkspaceOut);

  // Copy directly to artifact directory
  fs.copyFileSync(videoWorkspaceOut, videoArtifactOut);
  console.log('Video copied to artifact:', videoArtifactOut);

  const stats = fs.statSync(videoWorkspaceOut);
  console.log(`Rendered video file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log('--- ALL RENDERING V7.0 COMPLETED SUCCESSFULLY ---');
}

main().catch((err) => {
  console.error('Fatal render error:', err);
  process.exit(1);
});
