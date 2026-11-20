import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, renderMedia } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const workspaceRoot = 'C:/Users/ASUS/Downloads/TOOL_2D_ANIM_API_FIX_1/TOOL_2D_ANIM';
const videoWorkspaceOut = path.join(workspaceRoot, 'out/test_v5_4_actions_showcase.mp4');
const videoArtifactOut = path.join(artifactDir, 'test_v5_4_actions_showcase.mp4');

const framesToRender = [
  { frame: 45, name: 'still_v6_2_f45_passing_walk.png' },
  { frame: 565, name: 'still_v6_2_f565_place_apple.png' },
  { frame: 610, name: 'still_v6_2_f610_grip_box.png' },
  { frame: 658, name: 'still_v6_2_f658_box_turn.png' },
];

async function main() {
  console.log('--- BẮT ĐẦU QUY TRÌNH RENDER V6.2 ---');
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

  console.log('2. Selecting composition TestV5ActionsShowcase...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'TestV5ActionsShowcase',
  });
  console.log(`Composition found: ${composition.id} (${composition.width}x${composition.height}, ${composition.durationInFrames} frames)`);

  console.log('3. Rendering 12 verification stills...');
  for (const item of framesToRender) {
    const artifactPath = path.join(artifactDir, item.name);
    const outPath = path.join(workspaceRoot, 'out', item.name);
    console.log(`Rendering frame ${item.frame} -> ${item.name}...`);
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: artifactPath,
      frame: item.frame,
      imageFormat: 'png',
      chromiumOptions: { gl: 'angle' },
    });
    fs.copyFileSync(artifactPath, outPath);
    console.log(`Rendered ${item.name} successfully at ${artifactPath} & ${outPath}`);
  }

  const isPreview = process.argv.includes('--preview');
  console.log(`4. Rendering full video out/test_v5_4_actions_showcase.mp4 (${isPreview ? 'PREVIEW 720p@30fps' : '1080p@60fps'})...`);
  console.log(`Target workspace video: ${videoWorkspaceOut}`);

  // Delete previous video if exists to guarantee fresh write
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
  console.log('--- ALL RENDERING V6.2 COMPLETED SUCCESSFULLY ---');
}

main().catch((err) => {
  console.error('Fatal render error:', err);
  process.exit(1);
});
