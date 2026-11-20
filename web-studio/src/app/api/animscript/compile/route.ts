import { NextRequest, NextResponse } from "next/server";
import { compileAnimScript } from "../../../../animscript";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON yêu cầu không hợp lệ." }, { status: 400 });
  }

  const script = typeof body.script === "string" ? body.script : "";
  if (!script.trim()) {
    return NextResponse.json({ error: "Nội dung mã AnimScript trống." }, { status: 400 });
  }

  try {
    const { ir, diagnostics } = compileAnimScript(script);
    return NextResponse.json({
      success: true,
      ir,
      diagnostics,
      hasErrors: diagnostics.some((d) => d.severity === "error"),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi biên dịch không xác định." },
      { status: 500 }
    );
  }
}
