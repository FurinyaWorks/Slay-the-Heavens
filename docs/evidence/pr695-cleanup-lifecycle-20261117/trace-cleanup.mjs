// Opt-in diagnostic preload; never changes a timeout, assertion, return or error.
import fs from 'node:fs';
import cp from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {basename} from 'node:path';
const worker=basename(process.argv[1]??'')==='historical-drag-worker.mjs';
const epoch=performance.now();
const write=line=>{try{process.stderr.write(line);}catch{/* Diagnostic output is best effort, not the original operation. */}};
const record=(event,fields={})=>write('[drag-cleanup] '+JSON.stringify({pid:process.pid,event,elapsedMs:Math.round((performance.now()-epoch)*1000)/1000,...fields})+'\n');
if(worker){
 process.on('message',message=>{if(message?.type==='close')record('worker-close-received');});
 process.on('disconnect',()=>record('worker-disconnect'));
 process.on('beforeExit',code=>record('worker-before-exit',{code}));
 process.on('exit',code=>record('worker-exit',{code}));
 const remove=fs.rmSync;
 fs.rmSync=function(path,...args){
  const trace=String(path).match(/(?:^|[\\/])abyss-historical-(?:runtime|source)-[^\\/]+$/);
  if(!trace)return Reflect.apply(remove,this,[path,...args]);
  const start=performance.now();record('worker-root-remove-start');
  try{const value=Reflect.apply(remove,this,[path,...args]);record('worker-root-remove-done',{durationMs:performance.now()-start});return value;}
  catch(error){record('worker-root-remove-error',{durationMs:performance.now()-start,code:error.code,message:error.message});throw error;}
 };
}else{
 const fork=cp.fork;
 cp.fork=function(modulePath,...args){
  const child=Reflect.apply(fork,this,[modulePath,...args]);
  if(basename(String(modulePath))!=='historical-drag-worker.mjs')return child;
  record('parent-fork',{childPid:child.pid});
  // The original parent discards worker stderr once no Lua call is active.
  let pending='';
  child.stderr.on('data',bytes=>{pending+=bytes.toString();let end;while((end=pending.indexOf('\n'))>=0){const line=pending.slice(0,end);pending=pending.slice(end+1);if(line.startsWith('[drag-cleanup] '))write(line+'\n');}if(pending.length>8192)pending='';});
  const send=child.send;
  child.send=function(message,...rest){if(message?.type==='close')record('parent-close-send',{childPid:child.pid});return Reflect.apply(send,this,[message,...rest]);};
  child.on('disconnect',()=>record('parent-disconnect',{childPid:child.pid}));
  child.on('exit',(code,signal)=>record('parent-exit',{childPid:child.pid,code,signal}));
  child.on('close',(code,signal)=>record('parent-close',{childPid:child.pid,code,signal}));
  child.on('error',error=>record('parent-error',{childPid:child.pid,code:error.code,message:error.message}));
  return child;
 };
}
syncBuiltinESMExports();
