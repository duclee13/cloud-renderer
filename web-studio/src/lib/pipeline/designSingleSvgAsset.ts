import {generateContentCancellable} from '../geminiTransport';
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeGeminiWithRetry, sanitizeLog } from "../geminiRetry";
import { normalizePropAssetId } from "../../remotion/utils/propResolver";

export interface SvgAssetDesignResult {
  propId: string;
  cached: boolean;
  filePath: string;
  svgContent: string;
}

const SVG_ARTIST_SYSTEM_PROMPT = `You are a Principal 2D Vector Graphic Illustrator for an award-winning animation studio.
Your task is to design a single, beautiful, high-end standalone cartoon vector object as pure SVG.

MANDATORY GEOMETRIC STANDARDS (NON-NEGOTIABLE):
1. CANVAS VIEWBOX:
   viewBox="-200 -380 400 400" width="400" height="400"
2. BOTTOM-CENTER ORIGIN (ANCHOR SPEC):
   - The lowest contact point of the object MUST TOUCH EXACTLY y = 0 (ground level).
   - The horizontal center of the object MUST BE ALIGNED AT x = 0.
   - This ensures 100% universal docking onto floors and tables with zero floating and 100% compatibility with canonical props (desk.svg, sofa.svg, glass-jar.svg).
3. PREMIUM 5+ LAYER VISUAL QUALITY:
   Do NOT draw a lazy flat rectangle or basic circle. You MUST build the object using at least 5 to 8 distinct SVG elements/layers:
   - Layer 1: Ground contact shadow (<ellipse cx="0" cy="0" rx="75" ry="12" fill="#000000" opacity="0.15"/>).
   - Layer 2: Main body with rich gradients (<linearGradient> or <radialGradient> defined in <defs>).
   - Layer 3: Ambient occlusion & 3D shadow curves (darker shading paths with opacity="0.20").
   - Layer 4: Specular highlights & reflections (bright white streaks with opacity="0.45").
   - Layer 5: Accent details (textures, grooves, buttons, labels, eyes/mouth if living creature).
   - Layer 6: Clean, expressive cartoon stroke (stroke="#141414" stroke-width="10" stroke-linecap="round" stroke-linejoin="round").
4. STANDALONE VALID XML:
   - Output ONLY the raw <svg>...</svg> XML.
   - DO NOT wrap in markdown code fences (\`\`\`xml or \`\`\`).
   - Must include xmlns="http://www.w3.org/2000/svg".`;

/**
 * Tạo SVG chất lượng cao theo chuẩn 400x400 (chạm đáy y=0, tâm x=0, viewBox="-200 -380 400 400") khi offline
 */
export function createStandardProceduralSvg(propId: string): string {
  const hash = propId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colorPalettes = [
    { main: "#F59E0B", light: "#FEF3C7", dark: "#B45309", stroke: "#141414" },
    { main: "#3B82F6", light: "#DBEAFE", dark: "#1D4ED8", stroke: "#141414" },
    { main: "#10B981", light: "#D1FAE5", dark: "#047857", stroke: "#141414" },
    { main: "#EC4899", light: "#FCE7F3", dark: "#BE185D", stroke: "#141414" },
    { main: "#8B5CF6", light: "#EDE9FE", dark: "#6D28D9", stroke: "#141414" },
    { main: "#EF4444", light: "#FEE2E2", dark: "#B91C1C", stroke: "#141414" },
  ];
  const pal = colorPalettes[hash % colorPalettes.length];
  const label = propId.replace(/[-_]/g, " ").toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -380 400 400" width="400" height="400">
  <defs>
    <radialGradient id="baseShadow_${hash}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bodyGrad_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.light}"/>
      <stop offset="50%" stop-color="${pal.main}"/>
      <stop offset="100%" stop-color="${pal.dark}"/>
    </linearGradient>
  </defs>
  <!-- Layer 1: Contact Drop Shadow at y=0 -->
  <ellipse cx="0" cy="0" rx="90" ry="14" fill="url(#baseShadow_${hash})"/>
  <!-- Layer 2: Main Body Base touching y=0 -->
  <rect x="-110" y="-240" width="220" height="240" rx="36" fill="url(#bodyGrad_${hash})" stroke="${pal.stroke}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Layer 3: 3D Inner Shadow Curve -->
  <path d="M -100 -30 Q 0 10 100 -30 L 100 -10 Q 0 5 -100 -10 Z" fill="#000000" opacity="0.22"/>
  <!-- Layer 4: Specular Glossy Reflection Streak -->
  <path d="M -80 -220 L -50 -220 L -85 -60 L -100 -60 Z" fill="#FFFFFF" opacity="0.45"/>
  <!-- Layer 5: Decorative Star Badge -->
  <circle cx="0" cy="-160" r="42" fill="${pal.light}" stroke="${pal.stroke}" stroke-width="6"/>
  <path d="M 0 -185 L 8 -168 L 26 -166 L 12 -154 L 16 -136 L 0 -146 L -16 -136 L -12 -154 L -26 -166 L -8 -168 Z" fill="${pal.dark}"/>
  <!-- Layer 6: Label Plate -->
  <rect x="-90" y="-90" width="180" height="42" rx="10" fill="#141414"/>
  <text x="0" y="-62" text-anchor="middle" font-size="14" font-weight="900" fill="#FFFFFF" font-family="sans-serif" letter-spacing="1.5">${label}</text>
</svg>`;
}

/**
 * Bước 2: Thiết kế từng vật thể SVG riêng biệt (1 Prompt / 1 Object)
 * Tuân thủ tuyệt đối chuẩn 400x400 chạm đáy y=0, tâm x=0, viewBox="-200 -380 400 400".
 */
export async function designSingleSvgAsset(
  propNameOrId: string,
  modelName: string = "gemini-3.1-flash-lite",
  apiKey?: string,
  signal?: AbortSignal,
  requestId?: string
): Promise<SvgAssetDesignResult> {
  const reqId = requestId || "req_local";

  if (signal?.aborted) {
    throw new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError");
  }

  const canonicalId = normalizePropAssetId(propNameOrId);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(canonicalId)) throw new Error("Asset ID không hợp lệ");
  const assetsDir = path.join(process.cwd(), "public", "assets", "props");

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const filePath = path.join(assetsDir, `${canonicalId}.svg`);

  // 1. Kiểm tra cache nếu file đã tồn tại và đúng chuẩn
  if (fs.existsSync(filePath)) {
    const existingContent = fs.readFileSync(filePath, "utf8");
    if (existingContent.includes("<svg") && existingContent.length > 100) {
      return {
        propId: canonicalId,
        cached: true,
        filePath,
        svgContent: existingContent,
      };
    }
  }

  console.log(
    sanitizeLog(`[Pipeline][${reqId}] [Bước 2] Thiết kế Vector Asset 400x400 cho '${canonicalId}' (Model: ${modelName})...`)
  );

  const activeKey = (apiKey || process.env.GEMINI_API_KEY || "").trim();
  let finalSvg = "";

  if (activeKey) {
    try {
      const genAI = new GoogleGenerativeAI(activeKey);
      finalSvg = await executeGeminiWithRetry(
        async () => {
          if (signal?.aborted) {
            throw new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError");
          }

          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SVG_ARTIST_SYSTEM_PROMPT,
          });
          const res = await generateContentCancellable(model,
            `Design a cartoon SVG prop: '${canonicalId}' (${propNameOrId}). Follow the 400x400 standard touching y=380 at x=200 with 5+ layers.`, signal
          );
          let raw = res.response.text().trim();
          raw = raw.replace(/^```(?:svg|xml|html)?\n?/i, "").replace(/\n?```$/i, "").trim();
          if (!raw.includes("<svg") || !raw.includes("</svg>")) {
            throw new Error(`Đầu ra SVG không hợp lệ cho ${canonicalId}`);
          }
          return raw;
        },
        {
          maxRetries: 2,
          signal,
          requestId: reqId,
          step: 2,
          modelName,
        }
      );
    } catch (err: any) {
      if (err.name === "AbortError" || signal?.aborted) {
        throw err;
      }
      console.warn(
        sanitizeLog(`[Pipeline][${reqId}] [Bước 2] Lỗi tạo vector qua AI cho '${canonicalId}': ${err.message}`)
      );
      throw err;
    }
  } else {
    throw new Error("Cần API key để tạo asset còn thiếu.");
  }

  // Đảm bảo viewBox chuẩn
  if (!finalSvg.includes('viewBox="0 0 400 400"')) {
    finalSvg = finalSvg.replace(/viewBox=["'][^"']+["']/, 'viewBox="0 0 400 400"');
  }

  signal?.throwIfAborted();
  fs.writeFileSync(filePath, finalSvg, "utf8");

  return {
    propId: canonicalId,
    cached: false,
    filePath,
    svgContent: finalSvg,
  };
}
