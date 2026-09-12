import {buildMessages, visibleAnswer} from './ai-context.mjs';

let worker, engine, revision=0, generation=0, abortLoad, failAnswer, activeTask, notify=()=>{};
const state={status:'idle',progress:0,message:'Real AI, running on your device. No API key needed.',model:'balanced'};
const publish=patch=>{Object.assign(state,patch);notify({...state});};
function dispose(){revision++;generation++;abortLoad?.();abortLoad=null;failAnswer?.(new Error('AI was turned off.'));failAnswer=null;worker?.terminate();worker=null;engine=null;}
export function subscribe(fn){notify=fn;fn({...state});}
export function getState(){return {...state};}
export function cancel(){dispose();publish({status:'idle',progress:0,message:'AI is off. Downloaded model files may remain cached in this browser.'});}
export async function loadModel(size='balanced'){
  if(['loading','ready'].includes(state.status))return;
  dispose();const current=revision;
  publish({status:'loading',progress:0,model:size,message:'Checking this browser’s graphics support…'});
  try{
    if(!window.isSecureContext||location.protocol==='file:')throw new Error('AI needs GitHub Pages or a local web server. Use Start Portfolio.cmd to preview locally.');
    if(!navigator.gpu)throw new Error('WebGPU is unavailable here. Try current Chrome or Edge with graphics acceleration enabled. Quick answers still work.');
    const adapter=await navigator.gpu.requestAdapter();
    if(!adapter)throw new Error('No compatible GPU was found. Try Chrome or Edge with graphics acceleration, or use quick answers.');
    if(current!==revision)return;
    const precision=adapter.features.has('shader-f16')?'q4f16_1':'q4f32_1';
    const modelId=`Qwen3-${size==='lite'?'0.6B':'1.7B'}-${precision}-MLC`;
    publish({message:'Preparing the AI engine…'});
    const {WebWorkerMLCEngine}=await import('./vendor/webllm/web-llm.mjs');
    if(current!==revision)return;
    worker=new Worker(new URL('./ai-worker.mjs',import.meta.url),{type:'module'});
    const loadFailure=new Promise((_,reject)=>{worker.onerror=()=>reject(new Error('The AI worker stopped. Reload AI or try the smaller model.'));});
    engine=new WebWorkerMLCEngine(worker,{logLevel:'ERROR',initProgressCallback:report=>{
      if(current===revision)publish({progress:Math.max(0,Math.min(1,report.progress||0)),message:report.text||'Downloading the model…'});
    }});
    let timer;
    try{await Promise.race([engine.reload(modelId,{context_window_size:4096}),loadFailure,new Promise((_,reject)=>{abortLoad=()=>reject(new Error('Loading cancelled.'));}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Model loading timed out. Check your connection and try again; cached files can be reused.')),15*60*1000);})]);}finally{clearTimeout(timer);if(current===revision)abortLoad=null;}
    if(current!==revision)return;
    worker.onerror=()=>{const message='The AI worker stopped. Try loading the smaller model or restart AI.';failAnswer?.(new Error(message));dispose();publish({status:'error',message});};
    publish({status:'ready',progress:1,message:`${size==='lite'?'Qwen3 0.6B':'Qwen3 1.7B'} · On-device AI ready`});
  }catch(error){if(current!==revision)return;dispose();publish({status:'error',progress:0,message:error.message||'The model could not load. Please retry.'});}
}
export function stop(){generation++;engine?.interruptGenerate();}
export async function answer(data,history,onToken){
  // An interrupted decode must release the engine before the next request starts.
  const queuedRevision=revision,queuedGeneration=generation;
  if(activeTask)try{await activeTask;}catch{}
  if(queuedRevision!==revision||queuedGeneration!==generation)return {text:'',stopped:true,truncated:false};
  if(state.status!=='ready'||!engine)throw new Error('Enable on-device AI before asking for a generated answer.');
  const current=revision, request=++generation;
  let text='',finishReason='',timer;
  const operation=(async()=>{
    const stream=await engine.chat.completions.create({messages:buildMessages(data,history),stream:true,temperature:.5,top_p:.9,repetition_penalty:1.1,max_tokens:512,extra_body:{enable_thinking:false}});
    for await(const chunk of stream){
      if(current!==revision)break;
      // WebLLM's worker releases its model lock only when the stream is drained.
      // Stop rendering immediately, then consume the interrupted stream to completion.
      if(request!==generation){engine.interruptGenerate();continue;}
      text+=chunk.choices[0]?.delta?.content||'';
      finishReason=chunk.choices[0]?.finish_reason||finishReason;
      onToken(visibleAnswer(text));
    }
    return {text:visibleAnswer(text).trim(),stopped:request!==generation||current!==revision,truncated:finishReason==='length'};
  })();
  const task=Promise.race([operation,new Promise((_,reject)=>{failAnswer=reject;timer=setTimeout(()=>{const message='This device took too long to reply. Reload AI and try a shorter question or the smaller model.';reject(new Error(message));dispose();publish({status:'error',message});},120000);})]);
  activeTask=task;
  try{return await task;}
  catch(error){if(current===revision&&/gpu|device|memory|wasm|runtime/i.test(error.message)){dispose();publish({status:'error',message:'The AI engine needs to restart. Reload AI or try the smaller model.'});}throw error;}
  finally{clearTimeout(timer);if(activeTask===task){activeTask=null;failAnswer=null;}}
}
