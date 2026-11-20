import type {GenerativeModel} from '@google/generative-ai';
import {apiContext} from './apiRequestContext';
import {sleep} from './geminiRetry';

// All pipeline calls share a start-time gate. It persists across cancelled jobs.
let nextStart = 0;
export async function generateContentCancellable(
  model: GenerativeModel, prompt: string, signal?: AbortSignal, timeoutMs = 90000,
) {
  signal?.throwIfAborted();
  const configured = Number(process.env.GEMINI_MIN_INTERVAL_MS);
  const interval = Number.isFinite(configured) && configured >= 0 ? configured : 13000;
  while (Date.now() < nextStart) {
    const delay = nextStart - Date.now();
    apiContext.getStore()?.progress(`Giãn lượt gọi API: chờ ${Math.ceil(delay/1000)} giây.`);
    await sleep(delay, signal);
  }
  signal?.throwIfAborted();
  nextStart = Date.now() + interval;
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, {once:true});
  const timer = setTimeout(() => {timedOut = true; controller.abort();}, timeoutMs);
  try {
    signal?.throwIfAborted();
    const result = await model.generateContent(prompt, {signal:controller.signal, timeout:-1});
    signal?.throwIfAborted();
    return result;
  } catch (error: any) {
    if (signal?.aborted) throw new DOMException('Đã hủy yêu cầu', 'AbortError');
    if (timedOut) {
      throw Object.assign(new Error(`Gemini không hoàn tất trong ${timeoutMs/1000} giây.`), {name:'TimeoutError', status:504});
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
