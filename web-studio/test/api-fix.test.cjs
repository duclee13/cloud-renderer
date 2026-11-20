require('../scripts/register-ts.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const {GoogleGenerativeAI}=require('@google/generative-ai');
const {generateContentCancellable}=require('../src/lib/geminiTransport.ts');
const retry=require('../src/lib/geminiRetry.ts');
const {runMultiPromptPipeline}=require('../src/lib/pipeline/pipelineOrchestrator.ts');
const {POST}=require('../src/app/api/pipeline/generate/route.ts');
process.env.GEMINI_MIN_INTERVAL_MS='0';
const source='Cảnh 1: Người đứng.\nCảnh 2: Người nhìn.';
const key='test-key-not-real';
const beat=(name)=>({name,dialogue:name,actionSummary:'Đứng yên',requiredProps:[],backgroundPreset:'livingRoomDay'});
const directed={character:{visible:true,pose:'standing',slot:'floor.left'},props:[],keyframes:[],camera:{zoom:1}};
const reply=data=>new Response(JSON.stringify({candidates:[{content:{role:'model',parts:[{text:JSON.stringify(data)}]},finishReason:'STOP'}]}),{status:200,headers:{'Content-Type':'application/json'}});
const unavailable=()=>new Response(JSON.stringify({error:{code:503,status:'UNAVAILABLE',message:'high demand'}}),{status:503});
const request=body=>new Request('http://localhost/api/pipeline/generate',{method:'POST',body:JSON.stringify(body)});
async function withFetch(fn,run){const prev=global.fetch;global.fetch=fn;try{return await run();}finally{global.fetch=prev;}}
async function fastBackoff(run){const prev=global.setTimeout;global.setTimeout=(fn,ms,...args)=>prev(fn,ms>=2000&&ms<=63000?1:ms,...args);try{return await run();}finally{global.setTimeout=prev;}}
const options={rawScript:source,apiKey:key,modelName:'gemini-test'};

test('SDK gets cancellation signal; abort reaches the real fetch call',async()=>{
 let fetchSignal;
 await withFetch((url,opts)=>new Promise((resolve,reject)=>{fetchSignal=opts.signal;opts.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')));}),async()=>{
  const c=new AbortController(),model=new GoogleGenerativeAI(key).getGenerativeModel({model:'gemini-test'});
  const pending=generateContentCancellable(model,'test',c.signal,1000);
  await new Promise(r=>setImmediate(r));assert.ok(fetchSignal);c.abort();
  await assert.rejects(pending,{name:'AbortError'});assert.equal(fetchSignal.aborted,true);
 });
});
test('request timeout is 504, distinct from user cancellation, and retryable',async()=>{
 await withFetch((url,opts)=>new Promise((resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')))),async()=>{
  const model=new GoogleGenerativeAI(key).getGenerativeModel({model:'gemini-test'});
  await assert.rejects(generateContentCancellable(model,'test',undefined,10),e=>e.status===504&&retry.isRetryableGeminiError(e));
 });
});
test('unknown errors are not invented as HTTP 500 and are not retried; RetryInfo respected',async()=>{
 assert.equal(retry.extractHttpStatus(new Error('Invalid JSON')),0);
 assert.equal(retry.isRetryableGeminiError(new Error('Invalid JSON')),false);
 assert.equal(retry.computeBackoffDelay(1,120),120000);
 assert.equal(retry.extractRetryAfterSeconds({errorDetails:[{retryDelay:'90s'}]}),90);
 let calls=0;await assert.rejects(retry.executeGeminiWithRetry(async()=>{calls++;throw Object.assign(new Error('Forbidden'),{status:403});}));assert.equal(calls,1);
});
test('503 has bounded retries and never switches model',async()=>{
 let calls=0,urls=[];
 await fastBackoff(()=>withFetch((url)=>{calls++;urls.push(url);return Promise.resolve(unavailable());},async()=>{
  await assert.rejects(runMultiPromptPipeline(options),e=>e.status===503);
 }));
 assert.equal(calls,4);assert.ok(urls.every(url=>url.includes('/gemini-test:generateContent')));
});
test('checkpoint immediately follows split and each scene; resume skips successful API calls',async()=>{
 let calls=0,states=[];
 await fastBackoff(()=>withFetch(async()=>{calls++;if(calls===1)return reply({beats:[beat('Một'),beat('Hai')]});if(calls===2)return reply(directed);return unavailable();},async()=>{
  await assert.rejects(runMultiPromptPipeline({...options,onCheckpoint:s=>states.push(structuredClone(s))}),e=>e.status===503&&e.partialState.directedScenes.length===1);
 }));
 assert.equal(states[0].directedScenes.length,0);assert.equal(states[1].directedScenes.length,1);
 const saved=states.at(-1);assert.equal(saved.rawScript,source);assert.equal(JSON.stringify(saved).includes(key),false);
 let resumed=0;
 await withFetch(async()=>{resumed++;return reply(directed);},async()=>{
  const result=await runMultiPromptPipeline({...options,resumeState:saved});assert.equal(result.success,true);assert.equal(result.sceneGraph.scenes.length,2);assert.equal(result.sceneGraph.fps,60);
 });assert.equal(resumed,1);
});
test('mismatched checkpoint is rejected before calling provider',async()=>{
 await withFetch(()=>{throw Error('Must not call API');},async()=>{
  await assert.rejects(runMultiPromptPipeline({...options,resumeState:{version:1,rawScript:'Other',modelName:'gemini-test',beats:[]}}),e=>e.status===400);
  await assert.rejects(runMultiPromptPipeline({...options,resumeState:{beats:[beat('Old')]}}),e=>e.status===400);
 });
});
test('failed asset API no longer produces a procedural successful result',async()=>{
 let calls=0;
 await fastBackoff(()=>withFetch(async()=>{calls++;return calls===1?reply({beats:[{...beat('Vật thể'),requiredProps:['unit-test-missing-asset-unique']}]}):unavailable();},async()=>{
  await assert.rejects(runMultiPromptPipeline(options),e=>e.status===503&&e.failedAtStep===2&&e.partialState.beats.length===1);
 }));assert.equal(calls,4);
 assert.equal(require('node:fs').existsSync('public/assets/props/unit-test-missing-asset-unique.svg'),false);
});
test('SSE emits checkpoints then complete; HTTP stream 200 alone is not a success',async()=>{
 let calls=0;
 await withFetch(async()=>++calls===1?reply({beats:[beat('Một')]}):reply(directed),async()=>{
  const res=await POST(request({...options,prompt:source,model:'gemini-test'}));const text=await res.text();
  const events=text.trim().split('\n\n').map(x=>JSON.parse(x.slice(6)));
  assert.equal(events.filter(e=>e.type==='checkpoint').length,2);assert.equal(events.at(-1).type,'complete');
 });
 await fastBackoff(()=>withFetch(async()=>unavailable(),async()=>{
  const res=await POST(request({prompt:source,apiKey:key,model:'gemini-test'}));assert.equal(res.status,200);
  const events=(await res.text()).trim().split('\n\n').map(x=>JSON.parse(x.slice(6)));
  assert.equal(events.at(-1).type,'error');assert.equal(events.at(-1).status,503);assert.equal(events.some(e=>e.type==='complete'),false);
 }));
});
test('cancel is request-scoped and lock remains held until the aborted fetch settles',async()=>{
 let started,signal;const ready=new Promise(r=>started=r);
 await withFetch((url,opts)=>new Promise((resolve,reject)=>{
  signal=opts.signal;started();signal.addEventListener('abort',()=>setTimeout(()=>reject(new DOMException('aborted','AbortError')),20));
 }),async()=>{
  const response=await POST(request({prompt:source,apiKey:key,requestId:'first'}));await ready;
  assert.equal((await POST(request({action:'cancel'}))).status,400);
  await POST(request({action:'cancel',requestId:'other'}));assert.equal(signal.aborted,false);
  await POST(request({action:'cancel',requestId:'first'}));assert.equal(signal.aborted,true);
  assert.equal((await POST(request({prompt:source,apiKey:key,requestId:'second'}))).status,409);
  await response.text();
 });
 await withFetch(async()=>reply({beats:[beat('Done')]}),async()=>{
  const c=new AbortController();c.abort();
  const req=new Request('http://localhost/api/pipeline/generate',{method:'POST',body:JSON.stringify({prompt:source,apiKey:key}),signal:c.signal});
  const res=await POST(req);await res.text();assert.equal(res.status,200);
 });
});
test('stream cancellation aborts in-flight provider work and prevents later complete',async()=>{
 let started,signal;const ready=new Promise(r=>started=r);
 await withFetch((url,opts)=>new Promise((resolve,reject)=>{signal=opts.signal;started();signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')));}),async()=>{
  const res=await POST(request({prompt:source,apiKey:key}));await ready;await res.body.cancel();assert.equal(signal.aborted,true);await new Promise(r=>setImmediate(r));
 });
});

test('JSON endpoint shares the SSE lock and cannot silently fall back without a key',async()=>{
 const {POST:jsonPOST}=require('../src/app/api/gemini/route.ts');
 const prior=process.env.GEMINI_API_KEY;delete process.env.GEMINI_API_KEY;
 try {assert.equal((await jsonPOST(request({prompt:source}))).status,400);} finally {if(prior)process.env.GEMINI_API_KEY=prior;}
 let started;const ready=new Promise(r=>started=r);
 await withFetch((url,opts)=>new Promise((resolve,reject)=>{started();opts.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')));}),async()=>{
  const running=await POST(request({prompt:source,apiKey:key,requestId:'shared'}));await ready;
  assert.equal((await jsonPOST(request({prompt:source,apiKey:key}))).status,409);
  await POST(request({action:'cancel',requestId:'shared'}));await running.text();
 });
 let calls=0;await withFetch(async()=>++calls===1?reply({beats:[beat('Cảnh')]}):reply(directed),async()=>{
  const res=await jsonPOST(request({prompt:source,apiKey:key}));assert.equal(res.status,200);assert.equal((await res.json()).success,true);
 });
});

test('start-time gate spaces successive calls and cancellation during wait makes no request',async()=>{
 process.env.GEMINI_MIN_INTERVAL_MS='40';
 const starts=[];
 try {
  await withFetch(async()=>{starts.push(Date.now());return reply(directed);},async()=>{
   const model=new GoogleGenerativeAI(key).getGenerativeModel({model:'gemini-test'});
   await generateContentCancellable(model,'one');
   const c=new AbortController(),cancelled=generateContentCancellable(model,'cancelled',c.signal);c.abort();
   await assert.rejects(cancelled,{name:'AbortError'});
   await generateContentCancellable(model,'two');
  });
  assert.equal(starts.length,2);assert.ok(starts[1]-starts[0]>=38);
 } finally {process.env.GEMINI_MIN_INTERVAL_MS='0';}
});
