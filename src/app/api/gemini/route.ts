import {NextRequest, NextResponse} from 'next/server';
import {POST as generate} from '../pipeline/generate/route';
export const runtime = 'nodejs';
export const maxDuration = 600;

/** JSON compatibility endpoint shares cancellation, deadline and concurrency with SSE. */
export async function POST(req:NextRequest) {
  const response = await generate(req);
  if (!response.headers.get('content-type')?.includes('text/event-stream')) return response;
  const text = await response.text();
  const events = text.split('\n\n').filter(line => line.startsWith('data: ')).map(line => JSON.parse(line.slice(6)));
  const complete = events.findLast(event => event.type === 'complete');
  if (complete) return NextResponse.json({...complete.result,status:'ready'});
  const error = events.findLast(event => event.type === 'error');
  return NextResponse.json({success:false,status:'failed',error:error?.error || 'Luồng tạo cảnh đã ngắt.',partialState:error?.partialState}, {status:error?.status || 502});
}
