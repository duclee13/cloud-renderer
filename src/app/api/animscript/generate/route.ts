import { NextRequest, NextResponse } from "next/server";
import { generateAnimScriptWithCorrection } from "../../../../lib/geminiAnimScript";
import { extractHttpStatus, sanitizeLog } from "../../../../lib/geminiRetry";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON yêu cầu không hợp lệ." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const apiKey = String(body.apiKey || process.env.GEMINI_API_KEY || "").trim();
  const model = String(body.model || "gemini-3.1-flash-lite");

  if (!prompt || !apiKey) {
    return NextResponse.json(
      { error: "Vui lòng cung cấp kịch bản và Gemini API Key." },
      { status: 400 }
    );
  }

  const abortController = new AbortController();
  req.signal.addEventListener("abort", () => abortController.abort(), { once: true });

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        if (closed || req.signal.aborted) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
          abortController.abort();
        }
      };

      try {
        const result = await generateAnimScriptWithCorrection(
          prompt,
          apiKey,
          model,
          abortController.signal,
          (msg) => send({ type: "progress", message: msg })
        );

        send({ type: "complete", result });
      } catch (err: any) {
        const status = extractHttpStatus(err) || 500;
        send({
          type: "error",
          status,
          error: sanitizeLog(err.message || "Lỗi khi sinh AnimScript DSL."),
        });
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {}
        }
      }
    },
    cancel() {
      closed = true;
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
