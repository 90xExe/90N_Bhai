import { WebWorkerMLCEngineHandler } from './vendor/webllm/web-llm.mjs';
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = event => handler.onmessage(event);
