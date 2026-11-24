import { NextResponse } from "next/server";
import { verifyProgressSecret, type VmRealtimeTelemetry } from "@/lib/github";
import { isUpstashConfigured, saveVmTelemetryToRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export async function POST(req: Request) {
  const auth = verifyProgressSecret(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Payload JSON không hợp lệ." },
      { status: 400 }
    );
  }

  const runId = String(raw.runId ?? "").trim();
  if (!/^\d+$/.test(runId)) {
    return NextResponse.json(
      { error: "runId không hợp lệ." },
      { status: 400 }
    );
  }

  const vmIndex = Math.round(clampNum(raw.vmIndex, 1, 64, 0));
  if (vmIndex < 1) {
    return NextResponse.json(
      { error: "vmIndex phải là số nguyên >= 1." },
      { status: 400 }
    );
  }

  const totalVms = Math.round(clampNum(raw.totalVms, 1, 64, 16));
  const phase = String(raw.phase || "rendering").trim().slice(0, 40);
  const totalFrames = Math.max(0, Math.round(clampNum(raw.totalFrames, 0, 1_000_000, 0)));
  const renderedFrames = Math.max(
    0,
    Math.min(
      totalFrames > 0 ? totalFrames : 1_000_000,
      Math.round(clampNum(raw.renderedFrames, 0, 1_000_000, 0))
    )
  );
  const computedPct =
    totalFrames > 0 ? (renderedFrames / totalFrames) * 100 : 0;
  const percent = Number(
    clampNum(raw.percent ?? computedPct, 0, 100, computedPct).toFixed(1)
  );
  const fps = Number(clampNum(raw.fps, 0, 1000, 0).toFixed(1));
  const etaSec = Math.max(0, Math.round(clampNum(raw.etaSec, 0, 86400, 0)));
  const updatedAt =
    typeof raw.updatedAt === "string" && raw.updatedAt.trim()
      ? raw.updatedAt.trim()
      : new Date().toISOString();

  const telemetry: VmRealtimeTelemetry = {
    runId,
    vmIndex,
    totalVms,
    phase,
    renderedFrames,
    totalFrames,
    percent,
    fps,
    etaSec,
    updatedAt,
  };

  if (!isUpstashConfigured()) {
    return NextResponse.json({
      ok: true,
      stored: false,
      reason: "Upstash Redis env vars not configured; skipped storage.",
    });
  }

  const stored = await saveVmTelemetryToRedis(telemetry);
  return NextResponse.json({ ok: true, stored });
}
