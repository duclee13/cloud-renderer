import type { VmRealtimeTelemetry } from "@/lib/github";

const REDIS_TTL_SECONDS = 86400; // 24 giờ

interface UpstashConfig {
  url: string;
  token: string;
}

function getUpstashConfig(): UpstashConfig | null {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  if (!url || !token) return null;
  return { url, token };
}

export function isUpstashConfigured(): boolean {
  return getUpstashConfig() !== null;
}

export function buildRunRedisKey(runId: string | number): string {
  return `render_run:${String(runId).trim()}`;
}

/**
 * Lưu tiến độ 1 máy ảo vào Upstash Redis Hash `render_run:{runId}` field `vm_{vmIndex}`
 * kèm TTL 86400s (24 giờ) chỉ bằng 1 HTTP pipeline thuần fetch.
 */
export async function saveVmTelemetryToRedis(
  telemetry: VmRealtimeTelemetry
): Promise<boolean> {
  const cfg = getUpstashConfig();
  if (!cfg) return false;

  const key = buildRunRedisKey(telemetry.runId);
  const field = `vm_${telemetry.vmIndex}`;
  const serialized = JSON.stringify(telemetry);

  try {
    const res = await fetch(`${cfg.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["HSET", key, field, serialized],
        ["EXPIRE", key, REDIS_TTL_SECONDS],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Đọc toàn bộ tiến độ các VM của 1 run qua lệnh Redis `HGETALL render_run:{runId}`.
 * Nếu chưa cấu hình Redis hoặc lỗi mạng -> trả về Map rỗng an toàn (fallback GitHub Jobs).
 */
export async function getAllVmTelemetryFromRedis(
  runId: string | number
): Promise<Map<number, VmRealtimeTelemetry>> {
  const map = new Map<number, VmRealtimeTelemetry>();
  const cfg = getUpstashConfig();
  if (!cfg) return map;

  const key = buildRunRedisKey(runId);

  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["HGETALL", key]),
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });

    if (!res.ok) return map;
    const data = (await res.json()) as { result?: unknown };
    const result = data?.result;
    if (!result) return map;

    const parseAndSet = (field: string, rawVal: unknown) => {
      const m = field.match(/^vm_(\d+)$/);
      if (!m || typeof rawVal !== "string") return;
      const vmIdx = Number(m[1]);
      if (!Number.isInteger(vmIdx) || vmIdx < 1) return;
      try {
        const parsed = JSON.parse(rawVal) as VmRealtimeTelemetry;
        if (parsed && typeof parsed === "object") {
          map.set(vmIdx, parsed);
        }
      } catch {
        // bỏ qua entry JSON hỏng
      }
    };

    if (Array.isArray(result)) {
      for (let i = 0; i + 1 < result.length; i += 2) {
        parseAndSet(String(result[i]), result[i + 1]);
      }
    } else if (typeof result === "object") {
      for (const [k, v] of Object.entries(result as Record<string, unknown>)) {
        parseAndSet(k, v);
      }
    }
  } catch {
    // nuốt lỗi mạng Redis để luôn fallback mượt về GitHub Jobs
  }

  return map;
}
