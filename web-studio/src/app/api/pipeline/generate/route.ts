import {NextRequest, NextResponse} from 'next/server';
import {runMultiPromptPipeline} from '../../../../lib/pipeline/pipelineOrchestrator';
import {extractHttpStatus, sanitizeLog} from '../../../../lib/geminiRetry';
import {apiContext} from '../../../../lib/apiRequestContext';

export const runtime = 'nodejs';
export const maxDuration = 600;
type Task = {id:string; abort:AbortController};
const shared = globalThis as typeof globalThis & {__animPipelineTask?: {active:Task | null}};
const taskStore = shared.__animPipelineTask ??= {active:null};

export async function POST(req:NextRequest) {
  let body:any;
  try {body = await req.json();} catch {return NextResponse.json({error:'JSON yêu cầu không hợp lệ.'},{status:400});}
  if (!body || typeof body !== 'object') return NextResponse.json({error:'Thiếu dữ liệu yêu cầu.'},{status:400});
  if (body.action === 'cancel') {
    if (!body.requestId) return NextResponse.json({error:'Hủy cần requestId cụ thể.'},{status:400});
    if (taskStore.active && taskStore.active.id === body.requestId) taskStore.active.abort.abort();
    // Keep the lock until the underlying HTTP request has actually settled.
    return NextResponse.json({success:true});
  }
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const apiKey = String(body.apiKey || process.env.GEMINI_API_KEY || '').trim();
  const model = String(body.model || 'gemini-3.1-flash-lite');
  if (!prompt || !apiKey) return NextResponse.json({error:'Cần kịch bản và Gemini API key.'},{status:400});
  if (taskStore.active) return NextResponse.json({error:'Tác vụ trước đang chạy hoặc đang hủy. Chờ tác vụ đó dừng trước khi tạo mới.'},{status:409});
  const task:Task = {id: typeof body.requestId === 'string' ? body.requestId.slice(0,100) : crypto.randomUUID(), abort:new AbortController()};
  taskStore.active = task;
  const disconnect = () => task.abort.abort();
  req.signal.addEventListener('abort', disconnect, {once:true});
  if (req.signal.aborted) disconnect();
  let deadline = false;
  const timeout = setTimeout(() => {deadline = true; task.abort.abort();}, 570000);
  let closed = false;
  const encoder = new TextEncoder();
  const cleanMessage = (value:string) => sanitizeLog(value.split(apiKey).join('[REDACTED_API_KEY]'));
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data:any) => {
        if (closed || req.signal.aborted) return;
        try {controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));}
        catch {closed = true; task.abort.abort();}
      };
      let step:1|2|3|4 = 1, percent = 0;
      const heartbeat = setInterval(() => send({type:'heartbeat',requestId:task.id}), 10000);
      try {
        const result = await apiContext.run({progress:message => send({type:'progress',step,percent,message,requestId:task.id})}, () => runMultiPromptPipeline({
          rawScript:prompt,apiKey,modelName:model,requestId:task.id,signal:task.abort.signal,resumeState:body.resumeState || undefined,
          onCheckpoint:state => send({type:'checkpoint',partialState:state,requestId:task.id}),
          onProgress:(s,message,p) => {step=s;percent=p;send({type:'progress',step,percent,message:cleanMessage(message),requestId:task.id});},
        }));
        task.abort.signal.throwIfAborted();
        send({type:'complete',result,requestId:task.id});
      } catch (err:any) {
        const status = deadline ? 504 : task.abort.signal.aborted ? 499 : extractHttpStatus(err) || 500;
        send({type:'error',status,requestId:task.id,failedAtStep:err.failedAtStep || step,partialState:err.partialState,
          error:deadline ? 'Đã hết thời gian phiên chạy. Bấm Tiếp tục để chạy phần còn lại.' : cleanMessage(err.message || 'Lỗi xử lý pipeline.')});
        console.warn(`[Pipeline ${task.id}] HTTP ${status}, step ${step}`);
      } finally {
        clearInterval(heartbeat);clearTimeout(timeout);
        req.signal.removeEventListener('abort',disconnect);
        if (taskStore.active === task) taskStore.active = null;
        if (!closed) {closed=true;try {controller.close();} catch {}}
      }
    },
    cancel() {closed = true;task.abort.abort();},
  });
  return new Response(stream,{headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','X-Accel-Buffering':'no'}});
}
