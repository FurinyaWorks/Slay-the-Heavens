// Fresh Fengari isolates release each independent Host group. One outer process
// owns all workers, so the original runner deadline cannot leave children alive.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {Worker,isMainThread,workerData} from 'node:worker_threads';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const frozen='e129b0cd78815bdc83f1faf3fd7955af56b0a793c05402bacca7b26e12f21b97';
const hook="local function test(name,fn)fn();passed=passed+1;print('PASS anonymous terminal - '..name)end";
export function terminalParts(input){
 const source=input.replaceAll('\r\n','\n');
 assert.equal(createHash('sha256').update(source).digest('hex'),frozen,'unreviewed terminal fixture');
 assert.equal(source.split(hook).length,2,'one exact test wrapper');
 assert.equal((source.match(/^test\('/gm)||[]).length,7,'seven original groups');
 return Array.from({length:7},(_,i)=>source.replace(hook,
  `local ordinal=0\nlocal function test(name,fn) ordinal=ordinal+1;if ordinal~=${i+1} then return end;fn();passed=passed+1;print('PASS anonymous terminal - '..name);print('TERMINAL_GROUP ${i+1}')end`));
}
export function checkTerminalOutput(output){
 assert.deepEqual([...output.matchAll(/^TERMINAL_GROUP (\d+)$/gm)].map(m=>Number(m[1])),[1,2,3,4,5,6,7],'all original groups exactly once in order');
 assert.equal((output.match(/^TARGET_ANONYMOUS_TERMINAL_PASS 1$/gm)||[]).length,7,'seven successful original assertions');
}
export async function runTerminalParts(parts,{deadline,maxBuffer}={}){
 assert(Array.isArray(parts)&&parts.length===7&&parts.every(p=>typeof p==='string'),'seven parts required');
 assert(Number.isFinite(deadline)&&Number.isSafeInteger(maxBuffer)&&maxBuffer>0,'bounded deadline/output');
 const cli=require.resolve('fengari-node-cli/src/lua-cli.js');
 const out=[],err=[];let bytes=0,failure='';
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 for(const lua of parts){
  const remaining=deadline-Date.now();if(remaining<=0){failure='terminal aggregate deadline exceeded';break;}
  const worker=new Worker(new URL(import.meta.url),{workerData:{lua,cli},stdout:true,stderr:true,env});
  let timer,code;
  const stop=message=>{failure ||= message;void worker.terminate();};
  try{
   code=await new Promise(done=>{
    timer=setTimeout(()=>stop('terminal aggregate deadline exceeded'),remaining);
    for(const [stream,sink]of [['stdout',out],['stderr',err]])worker[stream].on('data',chunk=>{
     if(bytes+chunk.length>maxBuffer){stop('terminal shared output budget exceeded');return;}
     bytes+=chunk.length;sink.push(chunk);
    });
    worker.on('error',error=>stop(error.message));worker.on('exit',done);
   });
  }finally{clearTimeout(timer);await worker.terminate();}
  if(failure||code!==0){failure ||= 'terminal worker failed: '+code;break;}
 }
 return {status:failure?1:0,stdout:Buffer.concat(out).toString('utf8'),stderr:Buffer.concat(err).toString('utf8')+(failure?'\n'+failure+'\n':'')};
}
async function main(){
 const deadline=Number(process.argv[2]),maxBuffer=Number(process.argv[3]);
 const parts=terminalParts(readFileSync('tests/lua/target_anonymous_terminal.lua','utf8'));
 const result=await runTerminalParts(parts,{deadline:deadline-100,maxBuffer});
 process.stdout.write(result.stdout);process.stderr.write(result.stderr);
 if(result.status!==0){process.exitCode=1;return;}
 checkTerminalOutput(result.stdout);console.log('TARGET_ANONYMOUS_TERMINAL_PASS 7');
}
if(!isMainThread){process.argv=[process.execPath,workerData.cli,'-e',workerData.lua];require(workerData.cli);}
else if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{await main();}catch(error){console.error(error.stack||error);process.exitCode=1;}
}
