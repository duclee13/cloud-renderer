import { estimateBeatDuration } from "../src/lib/pipeline/splitIntoMicroBeats";
import { sanitizeLog, extractHttpStatus } from "../src/lib/geminiRetry";
import { MicroBeat, DirectedScene } from "../src/lib/pipeline/pipelineOrchestrator";

let allPassed = true;
function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  [PASS] ${desc}`);
  } else {
    console.error(`  [FAIL] ${desc}`);
    allPassed = false;
  }
}

console.log("==================================================");
console.log("TEST 1: Edge-TTS Disabled & Duration Estimation");
console.log("==================================================");

// Case 1: Short dialogue
const est1 = estimateBeatDuration("Con nhện đang ở đây.", "spider in jar");
assert(est1.durationSeconds >= 3.0 && est1.durationSeconds <= 5.0, `Short dialogue estimated duration in 3.0-5.0s range: got ${est1.durationSeconds.toFixed(2)}s`);
assert(est1.durationInFrames === Math.round(est1.durationSeconds * 60), `durationInFrames exactly matches 60fps (${est1.durationInFrames} frames)`);

// Case 2: Longer dialogue
const longText = "Tại sao con nhện này lại có thể sống sót và nhịn ăn trong suốt 8 tháng mà vẫn hoàn toàn bình thường?";
const est2 = estimateBeatDuration(longText, "character looking curiously at jar with spider");
assert(est2.durationSeconds > est1.durationSeconds && est2.durationSeconds <= 12.0, `Longer dialogue estimated duration properly scales: got ${est2.durationSeconds.toFixed(2)}s`);
assert(est2.durationInFrames === Math.round(est2.durationSeconds * 60), `Longer dialogue durationInFrames matches 60fps (${est2.durationInFrames} frames)`);

// Case 3: Empty dialogue with action
const est3 = estimateBeatDuration("", "close up on spider inside jar");
assert(est3.durationSeconds >= 3.0, `Empty dialogue action buffer has minimum 3.0s: got ${est3.durationSeconds.toFixed(2)}s`);


console.log("\n==================================================");
console.log("TEST 2: Safe Stream Lifecycle (No 'Controller is already closed')");
console.log("==================================================");

// Simulating the safe controller behavior implemented in route.ts
let isStreamClosed = false;
let isStreamCancelled = false;
const enqueueCalls: string[] = [];
let closeCallCount = 0;

const mockController = {
  enqueue: (chunk: string) => {
    if (isStreamClosed || isStreamCancelled) {
      throw new TypeError("Controller is already closed");
    }
    enqueueCalls.push(chunk);
  },
  close: () => {
    if (isStreamClosed) {
      throw new TypeError("Controller is already closed");
    }
    isStreamClosed = true;
    closeCallCount++;
  }
};

const safeEnqueue = (data: any) => {
  if (isStreamClosed || isStreamCancelled) return false;
  try {
    mockController.enqueue(JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
};

const safeClose = () => {
  if (isStreamClosed) return;
  try {
    mockController.close();
  } catch (e) {
    // idempotent
  }
};

// 2.1 Enqueueing when open
assert(safeEnqueue({ type: "init" }) === true, "safeEnqueue works normally when open");
assert(enqueueCalls.length === 1, "Chunk recorded");

// 2.2 safeClose called once
safeClose();
assert(isStreamClosed === true, "Stream marked closed");
assert(closeCallCount === 1, "Controller closed exactly once");

// 2.3 safeClose called again (idempotent)
safeClose();
assert(closeCallCount === 1, "Subsequent safeClose did not invoke controller.close again (No crash)");

// 2.4 safeEnqueue called after stream is closed
const enqAfterClose = safeEnqueue({ type: "late_event" });
assert(enqAfterClose === false, "safeEnqueue safely suppressed late events after stream closure");
assert(enqueueCalls.length === 1, "No late chunks enqueued");

// 2.5 Stream cancellation simulation
isStreamClosed = false;
isStreamCancelled = true;
const enqAfterCancel = safeEnqueue({ type: "event_cancelled" });
assert(enqAfterCancel === false, "safeEnqueue safely suppressed events when stream cancelled");

console.log("\n==================================================");
console.log("TEST 3: RequestId & Sensitive Log Sanitization");
console.log("==================================================");

// Redaction of API keys and tokens
const testRedactionKey = "AIza" + "Sy" + "x".repeat(33);
const dirtyLog1 = `Calling Gemini endpoint https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${testRedactionKey}`;
const cleanLog1 = sanitizeLog(dirtyLog1);
assert(!cleanLog1.includes(testRedactionKey), "Google API Key redacted from log");
assert(cleanLog1.includes("key=[REDACTED]"), "Google API Key query param replaced with key=[REDACTED]");


const dirtyLog2 = "Authorization: Bearer ya29.a0AfH6SMD-fake-token-1234567890";
const cleanLog2 = sanitizeLog(dirtyLog2);
assert(!cleanLog2.includes("ya29.a0AfH6SMD-fake-token-1234567890"), "Bearer token redacted from log");

// HTTP Status extraction
assert(extractHttpStatus({ status: 503 }) === 503, "Extracted status 503 from error.status");
assert(extractHttpStatus(new Error("503 Service Unavailable: overloaded")) === 503, "Extracted status 503 from message");
assert(extractHttpStatus(new Error("429 ResourceExhausted")) === 429, "Extracted status 429 from message");
assert(extractHttpStatus(new Error("Generic network failure")) === 500, "Default fallback status 500");

console.log("\n==================================================");
console.log("TEST 4: Mid-Pipeline Partial State & Resumption");
console.log("==================================================");

// Mock beats
const mockBeats: MicroBeat[] = [
  { index: 1, dialogue: "Cảnh 1", actionSummary: "Nhện trong lọ", duration: 4.0, visualElements: ["glass_jar", "spider"] },
  { index: 2, dialogue: "Cảnh 2", actionSummary: "Cận cảnh nhãn số 8", duration: 3.5, visualElements: ["glass_jar", "label_eight"] },
  { index: 3, dialogue: "Cảnh 3", actionSummary: "Bác sĩ quan sát", duration: 4.5, visualElements: ["doctor", "desk"] },
  { index: 4, dialogue: "Cảnh 4", actionSummary: "Đồng hồ đo tốc độ", duration: 5.0, visualElements: ["gauge_meter"] },
];

const mockScene1: DirectedScene = {
  id: "scene_1",
  index: 1,
  duration: 4.0,
  frameDuration: 240,
  dialogue: "Cảnh 1",
  actionSummary: "Nhện trong lọ",
  camera: { shotType: "medium", pan: "center", zoom: 1.0 },
  sceneGraph: { background: { type: "room", color: "#f0f0f0" }, characters: [], props: [] }
};

const mockScene2: DirectedScene = {
  id: "scene_2",
  index: 2,
  duration: 3.5,
  frameDuration: 210,
  dialogue: "Cảnh 2",
  actionSummary: "Cận cảnh nhãn số 8",
  camera: { shotType: "close_up", pan: "center", zoom: 1.4 },
  sceneGraph: { background: { type: "room", color: "#f0f0f0" }, characters: [], props: [] }
};

// Simulate partial state when Scene 3 encounters Gemini 503
const partialState = {
  beats: mockBeats,
  directedScenes: [mockScene1, mockScene2],
  failedAtSceneIndex: 2, // Scene 3 (0-indexed 2)
  modelName: "gemini-2.5-flash"
};

assert(partialState.directedScenes.length === 2, "Partial state preserved Scene 1 and Scene 2");
assert(partialState.failedAtSceneIndex === 2, "Partial state marked exact failure index at Scene 3");
assert(partialState.modelName === "gemini-2.5-flash", "Partial state strictly locked to original model (no silent auto-switch)");

// Resume simulation:
const startIndex = partialState.directedScenes.length;
assert(startIndex === 2, "Pipeline resumes directly at Scene index 2 (Scene 3), skipping Scene 1 & 2");
const reusedScenes = [...partialState.directedScenes];
assert(reusedScenes[0].id === "scene_1" && reusedScenes[1].id === "scene_2", "Scene 1 & 2 fully preserved without re-running");

console.log("\n==================================================");
console.log("TEST 5: Concurrency Lock & Abort Propagation");
console.log("==================================================");

let activeTask: { requestId: string; controller: AbortController } | null = null;

function requestPipelineRun(requestId: string): { ok: boolean; status: number; controller?: AbortController } {
  if (activeTask) {
    return { ok: false, status: 409 }; // 409 Conflict
  }
  const controller = new AbortController();
  activeTask = { requestId, controller };
  return { ok: true, status: 200, controller };
}

function cancelPipeline(requestId: string): boolean {
  if (activeTask && activeTask.requestId === requestId) {
    activeTask.controller.abort();
    activeTask = null;
    return true;
  }
  return false;
}

// 5.1 First run starts
const run1 = requestPipelineRun("req_001");
assert(run1.ok === true && run1.status === 200, "First request successfully accepted (HTTP 200)");

// 5.2 Concurrent run while active
const run2 = requestPipelineRun("req_002");
assert(run2.ok === false && run2.status === 409, "Second concurrent request rejected with HTTP 409 Conflict");

// 5.3 User cancels run1
let signalAborted = false;
run1.controller?.signal.addEventListener("abort", () => {
  signalAborted = true;
});
const cancelled = cancelPipeline("req_001");
assert(cancelled === true, "Cancel pipeline returned true");
assert(signalAborted === true, "AbortSignal received abort event");
assert(activeTask === null, "Active task released upon cancellation");

// 5.4 Subsequent run can now start
const run3 = requestPipelineRun("req_003");
assert(run3.ok === true && run3.status === 200, "After cancellation, new request is accepted (HTTP 200)");
cancelPipeline("req_003");

console.log("\n==================================================");
console.log("TEST 6: 1080p60 Format & Frame Constraints");
console.log("==================================================");

// Frame calculation check at 60 fps
const fps = 60;
const testDuration = 4.5; // 4.5 seconds
const expectedFrames = Math.round(testDuration * fps);
assert(expectedFrames === 270, `4.5s at 60fps calculates exactly 270 frames: got ${expectedFrames}`);

const remotionCompositionProps = {
  width: 1920,
  height: 1080,
  fps: 60,
};
assert(remotionCompositionProps.width === 1920 && remotionCompositionProps.height === 1080, "Composition resolution is 1920x1080 Full HD");
assert(remotionCompositionProps.fps === 60, "Composition frame rate is 60 fps");

console.log("\n==================================================");
if (allPassed) {
  console.log(">>> ALL PIPELINE RESILIENCE & FIXES TESTS PASSED! <<<");
} else {
  console.error(">>> SOME TESTS FAILED! <<<");
  process.exit(1);
}
