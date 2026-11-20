import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, renderMedia } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const outDir = 'C:/Users/ASUS/.gemini/antigravity/brain/d8042758-f2ae-4da3-8ad5-4d5f7df365a3';
const framesToRender = [
  { frame: 60, name: 'still_v6_1_f60_walk_arm_swing.png' },
  { frame: 82, name: 'still_v6_1_f82_walk_contralateral.png' },
  { frame: 120, name: 'still_v6_1_f120_run_accel_arms.png' },
  { frame: 175, name: 'still_v6_1_f175_run_full_speed.png' },
  { frame: 196, name: 'still_v6_1_f196_takeoff_prep.png' },
  { frame: 200, name: 'still_v6_1_f200_takeoff_apex.png' },
  { frame: 204, name: 'still_v6_1_f204_takeoff_rise.png' },
  { frame: 282, name: 'still_v6_1_f282_land_pre_cushion.png' },
  { frame: 285, name: 'still_v6_1_f285_land_touchdown.png' },
  { frame: 290, name: 'still_v6_1_f290_land_cushion_peak.png' },
  { frame: 490, name: 'still_v6_1_f490_apple_walk_asym.png' },
];

async function main() {
  console.log('1. Bundling Remotion project...');
  const bundleLocation = await bundle({
    entryPoint: path.resolve('./src/remotion/index.ts'),
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

  console.log('3. Rendering 11 verification stills...');
  for (const item of framesToRender) {
    const outputPath = path.join(outDir, item.name);
    console.log(`Rendering frame ${item.frame} -> ${item.name}...`);
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputPath,
      frame: item.frame,
      imageFormat: 'png',
    });
    console.log(`Rendered ${item.name} successfully.`);
  }

  console.log('4. Rendering full video out/test_v5_4_actions_showcase.mp4...');
  const videoOutWorkspace = path.resolve('../out/test_v5_4_actions_showcase.mp4');
  const videoOutArtifact = path.join(outDir, 'test_v5_4_actions_showcase.mp4');
  fs.mkdirSync(path.dirname(videoOutWorkspace), { recursive: true });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: videoOutWorkspace,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct % 10 === 0) {
        console.log(`Video render progress: ${pct}%`);
      }
    },
  });
  console.log('Video render finished in workspace:', videoOutWorkspace);

  // Copy to artifact directory
  fs.copyFileSync(videoOutWorkspace, videoOutArtifact);
  console.log('Video copied to artifact:', videoOutArtifact);

  console.log('ALL RENDERING COMPLETED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('Fatal render error:', err);
  process.exit(1);
});
