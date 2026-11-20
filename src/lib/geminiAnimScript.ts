/**
 * Gemini AnimScript DSL Generator with Self-Correction Loop
 * Generates valid AnimScript v0.1 code and automatically feeds compiler errors back to Gemini (max 2 rounds).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { compileAnimScript, AnimScriptIR, CompilerDiagnostic } from "../animscript";
import { executeGeminiWithRetry, sanitizeLog } from "./geminiRetry";

export const ANIMSCRIPT_SYSTEM_PROMPT = `Bạn là Đạo diễn Hoạt hình AI chuyên nghiệp viết mã AnimScript v0.1 (cú pháp thụt lề chuẩn Python) để điều khiển engine hoạt hình 2D Full HD 1080p60.

QUY TẮC CỐT LÕI CỦA ANIMSCRIPT v0.1:
1. Luôn khai báo kích thước video ở đầu:
   video(width=1920, height=1080, fps=60)
2. Mọi cảnh quay phải nằm trong khối:
   with scene("tên_cảnh", duration_ms=...):
3. Mọi hành động diễn xuất phải nằm trong khối:
   with sequence():  # chạy tuần tự nối tiếp
   with parallel():  # chạy đồng thời các nhánh
4. ĐẠO CỤ VÀ NHÂN VẬT HỢP LỆ (Asset Registry):
   - Nhân vật: character("human", height=600, x=..., y=..., facing="right"|"left")
     * Điểm neo/Khớp: head, face, eyes, mouth, neck, torso, pelvis, right_shoulder, right_elbow, right_hand, left_shoulder, left_elbow, left_hand, right_hip, right_knee, right_foot, left_hip, left_knee, left_foot, topmid, bottommid, center
   - Đạo cụ:
     * prop("desk", width=800, height=450) -> Anchors: surface.left, surface.center, surface.right, seat, approach.left, approach.right, topmid, bottommid, center
     * prop("cup", width=60, height=90) -> Anchors: grip, topmid, bottommid, center
     * prop("jar", width=140, height=200) -> Anchors: label_slot, grip, opening, topmid, bottommid, center
     * prop("laptop", width=180, height=110) -> Anchors: keyboard, screen, topmid, bottommid, center
     * prop("lamp", width=140, height=220) -> Anchors: base, bulb, topmid, bottommid, center
     * prop("metabolic_clock" hoặc "clock", width=260, height=260) -> Anchors: needle, topmid, bottommid, center
     * prop("spider", width=70, height=50) -> Anchors: topmid, bottommid, center
     * prop("window", width=400, height=320) -> Anchors: topmid, bottommid, center
     * prop("meadow", width=1920, height=200) -> Anchors: surface.left, surface.center, surface.right, topmid, bottommid, center
     * prop("chair", width=220, height=400) -> Anchors: seat, backrest, topmid, bottommid, center

5. CÁC LỆNH HỢP LỆ:
   - place(object, at=[x, y])
   - align(object.anchor, to=target.anchor, [offset=[dx, dy]])
   - walk(character, to=x, duration_ms=...)
   - jump(character, to=x, height=140, duration_ms=...)
   - reach(character.right_hand, to=target.anchor, duration_ms=...)
   - grab(character, object=prop, hand="right"|"left", duration_ms=...)
   - release(character, object=prop, hand="right"|"left", duration_ms=...)
   - put_down(character, object=prop, on=target.anchor, duration_ms=...)
   - sit(character, on=desk.seat, duration_ms=...)
   - look_at(character, target=[x, y] | anchor, duration_ms=...)
   - move(target, to=[x, y], duration_ms=...)
   - rotate(target, angle=..., duration_ms=...)
   - wait(duration_ms=...)
   - narrate("lời dẫn phụ đề dưới đáy màn hình", duration_ms=...)
   - say(character, "lời nhân vật trong bong bóng thoại", duration_ms=...)
   - label_prop(prop, "nhãn dán lên thân vật thể", slot="label_slot")
   - camera_focus(targets=[...], padding=140, duration_ms=...)
   - camera_reset(duration_ms=...)

6. PHÂN BIỆT RÕ RÀNG:
   - narrate: chỉ hiện phụ đề đáy, KHÔNG làm nhân vật nhép miệng hay vung tay.
   - say: hiện bong bóng thoại bên cạnh đầu nhân vật và làm nhép miệng.
   - label_prop: nhãn dán vật lý gắn trên thân vật thể, KHÔNG PHẢI bong bóng thoại hay phụ đề.
   - KHÔNG bao giờ tự bịa ra anchor hoặc tên hàm ngoài danh sách trên.

CHỈ TRẢ VỀ DUY NHẤT MÃ NGUỒN ANIMSCRIPT TRONG KHỐI \`\`\`animscript ... \`\`\` HOẶC TEXT THUẦN. KHÔNG VIẾT LỜI GIẢI THÍCH THÊM.`;

export interface GenerateDslResult {
  script: string;
  ir: AnimScriptIR;
  diagnostics: CompilerDiagnostic[];
  correctionRounds: number;
}

export async function generateAnimScriptWithCorrection(
  prompt: string,
  apiKey: string,
  modelName = "gemini-3.1-flash-lite",
  signal?: AbortSignal,
  onProgress?: (message: string) => void
): Promise<GenerateDslResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: ANIMSCRIPT_SYSTEM_PROMPT,
  });

  onProgress?.(`Đang tạo mã AnimScript v0.1 từ kịch bản bằng model ${modelName}...`);

  let currentPrompt = `Hãy viết mã nguồn AnimScript hoàn chỉnh, chính xác cho kịch bản sau:\n${prompt}`;
  let bestScript = "";
  let bestIR: AnimScriptIR | null = null;
  let bestDiagnostics: CompilerDiagnostic[] = [];
  let rounds = 0;

  while (rounds <= 2) {
    if (signal?.aborted) {
      throw new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError");
    }

    const response = await executeGeminiWithRetry<string>(
      async () => {
        const result = await model.generateContent(currentPrompt);
        return result.response.text();
      },
      { modelName, signal }
    );

    // Extract code block
    let cleanedCode = response.trim();
    const codeBlockMatch = cleanedCode.match(/```(?:animscript|python)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch) {
      cleanedCode = codeBlockMatch[1].trim();
    }

    bestScript = cleanedCode;

    // Compile and check diagnostics
    onProgress?.(`Đang biên dịch và kiểm tra tính hợp lệ của AnimScript (Lần ${rounds + 1})...`);
    const { ir, diagnostics } = compileAnimScript(cleanedCode);
    bestIR = ir;
    bestDiagnostics = diagnostics;

    const errors = diagnostics.filter((d) => d.severity === "error");
    if (errors.length === 0) {
      // 100% valid!
      onProgress?.("Biên dịch thành công! Mã AnimScript hợp lệ 100%.");
      break;
    }

    rounds++;
    if (rounds > 2) {
      console.warn(`[AnimScript] Đã thử sửa lỗi tối đa 2 vòng, còn ${errors.length} cảnh báo/lỗi.`);
      break;
    }

    // Auto-fix loop: send compiler diagnostics back to model
    onProgress?.(`Phát hiện ${errors.length} lỗi biên dịch. Đang yêu cầu AI tự sửa (Vòng ${rounds}/2)...`);
    const errorDetails = errors
      .map(
        (e) => `- Dòng ${e.line}, Cột ${e.column} [${e.code}]: ${e.message} (Gợi ý: ${e.fixSuggestion || "Không có"})`
      )
      .join("\n");

    currentPrompt = `Mã AnimScript của bạn gặp các lỗi sau khi biên dịch:\n${errorDetails}\n\nMã hiện tại:\n${cleanedCode}\n\nHãy sửa lại toàn bộ mã để khắc phục triệt để các lỗi trên và chỉ trả về mã nguồn trong khối \`\`\`animscript ... \`\`\`.`;
  }

  return {
    script: bestScript,
    ir: bestIR!,
    diagnostics: bestDiagnostics,
    correctionRounds: rounds,
  };
}
