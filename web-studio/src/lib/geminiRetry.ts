import {apiContext} from './apiRequestContext';
/**
 * Gemini API Retry & Resilience Engine
 * 
 * Quy chuẩn:
 * 1. Thử lại tối đa 3 lần sau lần gọi đầu tiên (1 initial + 3 retries = 4 lần gọi).
 * 2. Thời gian chờ cơ sở: Lần 1 ~5s, Lần 2 ~15s, Lần 3 ~30s kèm Jitter (±1s đến ±3s).
 * 3. Ưu tiên giá trị 'Retry-After' nếu server trả về trong header hoặc error message.
 * 4. Không retry các lỗi không thể khắc phục: 400 (Bad Request / INVALID_ARGUMENT),
 *    401/403 (API Key không hợp lệ / PERMISSION_DENIED), 404 (NOT_FOUND).
 * 5. Hủy chủ động (AbortSignal) dừng ngay lập tức mọi vòng chờ và tác vụ ngầm.
 * 6. Giữ nguyên 100% model đã chọn trong suốt quá trình thử lại.
 * 7. Tuyệt đối không ghi API key vào log.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  onRetry?: (attempt: number, maxRetries: number, delayMs: number, error: Error) => void;
  signal?: AbortSignal;
  requestId?: string;
  step?: number;
  sceneIndex?: number;
  totalScenes?: number;
  sceneName?: string;
  modelName?: string;
}

/**
 * Xóa thông tin nhạy cảm (API Key, token) khỏi log
 */
export function sanitizeLog(text: string): string {
  if (!text) return "";
  return text
    .replace(/AIza[A-Za-z0-9_-]{30,}/g, "[REDACTED_API_KEY]")
    .replace(/key=[A-Za-z0-9_-]+/gi, "key=[REDACTED]")
    .replace(/bearer\s+[A-Za-z0-9._-]+/gi, "bearer [REDACTED]");
}

/**
 * Trích xuất mã trạng thái HTTP chính xác từ đối tượng lỗi
 */
export function extractHttpStatus(err: any): number {
  if (!err) return 0;
  if (err.name === "AbortError") return 499;
  if (typeof err.status === "number" && err.status > 0) return err.status;
  if (typeof err.statusCode === "number" && err.statusCode > 0) return err.statusCode;
  if (typeof err.httpStatus === "number" && err.httpStatus > 0) return err.httpStatus;

  const msg = String(err.message || "");
  const match = msg.match(/\b(400|401|403|404|429|499|500|502|503|504)\b/);
  if (match) {
    return parseInt(match[1], 10);
  }

  if (msg.includes("service unavailable") || msg.includes("high demand")) return 503;
  if (msg.includes("too many requests") || msg.includes("resourceexhausted")) return 429;
  if (msg.includes("abort") || msg.includes("hủy")) return 499;
  return 0;
}

/**
 * Kiểm tra xem một lỗi từ Gemini API có phải là lỗi tạm thời (có thể retry) hay không.
 */
export function isRetryableGeminiError(err: any): boolean {
  if (!err) return false;
  if (err.name === "AbortError") return false;

  const msg = String(err.message || "").toLowerCase();
  const status = extractHttpStatus(err);

  // Không retry client aborts
  if (msg.includes("abort") || msg.includes("hủy") || status === 499) {
    return false;
  }

  // Lỗi không được retry: Sai API key, sai tham số, cấm quyền, model không tồn tại
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    msg.includes("api_key_invalid") ||
    msg.includes("api key not valid") ||
    msg.includes("invalid_argument") ||
    msg.includes("permission_denied") ||
    msg.includes("not found")
  ) {
    return false;
  }

  // Lỗi được phép retry có giới hạn (tối đa 3 lần):
  // 503 (quá tải), 429 (rate limit), 500, 502, 504, timeout, network reset
  if (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    msg.includes("503") ||
    msg.includes("service unavailable") ||
    msg.includes("high demand") ||
    msg.includes("resourceexhausted") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("socket hang up") ||
    msg.includes("fetch failed")
  ) {
    return true;
  }

  return false;
}

/**
 * Trích xuất thời gian chờ (giây) từ Retry-After header hoặc nội dung thông báo lỗi
 */
export function extractRetryAfterSeconds(err: any): number | null {
  if (!err) return null;

  if (typeof err.retryAfter === "number" && err.retryAfter > 0) {
    return err.retryAfter;
  }

  const details = Array.isArray(err.errorDetails) ? err.errorDetails : [];
  for (const detail of details) {
    const match = String(detail.retryDelay || '').match(/^(\d+(?:\.\d+)?)s$/);
    if (match) return Number(match[1]);
  }
  const msg = String(err.message || "");

  const matchSec = msg.match(/retry(?:-|\s*)after[\s:]*(\d+(?:\.\d+)?)\s*(?:s|sec|seconds)?/i);
  if (matchSec && matchSec[1]) {
    const val = parseFloat(matchSec[1]);
    if (!isNaN(val) && val > 0) return Math.ceil(val);
  }

  const matchIn = msg.match(/(?:try again in|wait)\s*(\d+(?:\.\d+)?)\s*(?:s|sec|seconds)?/i);
  if (matchIn && matchIn[1]) {
    const val = parseFloat(matchIn[1]);
    if (!isNaN(val) && val > 0) return Math.ceil(val);
  }

  return null;
}

/**
 * Tính toán độ trễ retry theo phân bổ: Lần 1 ~5s, Lần 2 ~15s, Lần 3 ~30s + Jitter
 */
export function computeBackoffDelay(attempt: number, retryAfterSeconds: number | null): number {
  if (retryAfterSeconds !== null && retryAfterSeconds > 0) {
    return Math.max(2000, Math.round(retryAfterSeconds * 1000));
  }

  const baseScheduleSeconds = [15, 30, 60];
  const baseSec = baseScheduleSeconds[attempt - 1] ?? 30;

  const jitterRange = attempt === 1 ? 1 : attempt === 2 ? 2 : 3;
  const jitter = (Math.random() * 2 - 1) * jitterRange;
  const totalSec = Math.max(2, baseSec + jitter);

  return Math.round(totalSec * 1000);
}

/**
 * Hàm sleep có hỗ trợ AbortSignal và dọn dẹp listener/timer hoàn toàn
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError"));
    }

    let timer: NodeJS.Timeout | null = null;
    let onAbort: (() => void) | null = null;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (onAbort && signal) {
        signal.removeEventListener("abort", onAbort);
        onAbort = null;
      }
    };

    onAbort = () => {
      cleanup();
      reject(new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
  });
}

/**
 * Bộ thực thi tác vụ với cơ chế thử lại có kiểm soát, gắn requestId, chi tiết cảnh và bảo mật API key
 */
export async function executeGeminiWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = Math.max(0, Math.min(3, options.maxRetries ?? 3));
  const reqId = options.requestId || "req_local";
  const modelName = options.modelName || "gemini";
  const sceneInfo = options.sceneIndex !== undefined
    ? ` (Cảnh ${(options.sceneIndex + 1)}${options.totalScenes ? `/${options.totalScenes}` : ""}${options.sceneName ? `: "${options.sceneName}"` : ""})`
    : "";
  const stepInfo = options.step !== undefined ? ` [Bước ${options.step}]` : "";

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    if (options.signal?.aborted) {
      throw new DOMException("Yêu cầu đã bị hủy bởi người dùng", "AbortError");
    }

    try {
      console.log(
        sanitizeLog(`[GeminiRetry][${reqId}]${stepInfo} Bắt đầu gọi API (Model: ${modelName}, Lần thử: ${attempt}/${maxRetries + 1}${sceneInfo})...`)
      );

      const result = await operation(attempt);
      options.signal?.throwIfAborted();

      console.log(
        sanitizeLog(`[GeminiRetry][${reqId}]${stepInfo} Thành công (Model: ${modelName}, Lần thử: ${attempt}/${maxRetries + 1}, HTTP: 200${sceneInfo})`)
      );

      return result;
    } catch (err: any) {
      lastError = err;

      // Nếu người dùng đã chủ động hủy request thì ngừng ngay
      if (err.name === "AbortError" || options.signal?.aborted) {
        console.warn(
          sanitizeLog(`[GeminiRetry][${reqId}]${stepInfo} Đã hủy ngay lập tức theo yêu cầu người dùng (HTTP: 499${sceneInfo}).`)
        );
        throw err;
      }

      const httpStatus = extractHttpStatus(err);
      const retryable = isRetryableGeminiError(err);
      const isLastAttempt = attempt > maxRetries;

      console.warn(
        sanitizeLog(
          `[GeminiRetry][${reqId}]${stepInfo} Gặp lỗi (Model: ${modelName}, Lần thử: ${attempt}/${maxRetries + 1}, HTTP: ${httpStatus}${sceneInfo}): ${err.message}`
        )
      );

      if (!retryable || isLastAttempt) {
        console.warn(
          sanitizeLog(
            `[GeminiRetry][${reqId}]${stepInfo} Dừng thử lại (retryable=${retryable}, isLastAttempt=${isLastAttempt}, HTTP: ${httpStatus}${sceneInfo})`
          )
        );
        throw err;
      }

      const retryAfterSec = extractRetryAfterSeconds(err);
      const delayMs = computeBackoffDelay(attempt, retryAfterSec);

      console.warn(
        sanitizeLog(
          `[GeminiRetry][${reqId}]${stepInfo} Chờ ${(delayMs / 1000).toFixed(1)}s trước khi thử lại lần ${attempt + 1}/${maxRetries + 1} (HTTP: ${httpStatus}${sceneInfo})...`
        )
      );

      apiContext.getStore()?.progress(`HTTP ${httpStatus || "không xác định"}: chờ ${Math.ceil(delayMs/1000)} giây, thử lại ${attempt}/${maxRetries}.`);
      if (options.onRetry) {
        options.onRetry(attempt, maxRetries, delayMs, err);
      }

      await sleep(delayMs, options.signal);
    }
  }

  throw lastError;
}
