const { execSync } = require("child_process");
const path = require("path");

const frames = [179, 180, 185, 195, 330, 350, 389];

console.log("Starting still frame extraction...");
for (const f of frames) {
  console.log(`Extracting frame ${f}...`);
  // Normal
  execSync(
    `npx remotion still src/remotion/index.ts WalkRunReferenceV4 ../out/v4_normal_f${f}.png --frame=${f} --gl=angle`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
  // Debug
  execSync(
    `npx remotion still src/remotion/index.ts WalkRunReferenceV4-Debug ../out/v4_debug_f${f}.png --frame=${f} --gl=angle`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
  // Closeup
  execSync(
    `npx remotion still src/remotion/index.ts WalkRunCloseUpTransition ../out/v4_closeup_f${f}.png --frame=${f} --gl=angle`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
}
console.log("All frames extracted successfully!");
