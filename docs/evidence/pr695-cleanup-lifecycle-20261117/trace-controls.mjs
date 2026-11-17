// This tests observability, NOT Windows/Lua product correctness.
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const source=readFileSync('tests/helpers/historical-drag-replay.mjs');
assert.equal(createHash('sha256').update(source).digest('hex'),'caac30673edc2b0634230389171e9023cd5bcd5f3235482706d12d5311454e93');
const preload=resolve('docs/evidence/pr695-cleanup-lifecycle-20261117/trace-cleanup.mjs');
const dir=mkdtempSync(join(tmpdir(),'drag-observability-controls-'));
try{
 writeFileSync(join(dir,'historical-drag-replay.mjs'),source);
 writeFileSync(join(dir,'historical-drag-worker.mjs'),`
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
const mode=process.env.TRACE_CASE,root=mkdtempSync(join(tmpdir(),'abyss-historical-runtime-'));
process.on('message',message=>{
 if(message.type==='run'){process.send({type:'result',id:message.id,result:{status:0},status:{prepared:true,executions:1}});}
 if(message.type==='close'){
  if(mode==='before-remove-stall'){Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10000);}
  rmSync(root,{recursive:true,force:true});
  if(mode==='exit-stall')setInterval(()=>{},1000);
  process.disconnect();
 }
});process.send({type:'owned-root',directory:root});process.send({type:'ready'});
`);
 writeFileSync(join(dir,'driver.mjs'),`import {dragReplay} from './historical-drag-replay.mjs';await dragReplay.run('fixture');try{await dragReplay.close();console.log('CLOSE_PASS')}catch(error){console.log('CLOSE_REJECT '+error.message)}`);
 writeFileSync(join(dir,'operation-controls.mjs'),`
import fs from 'node:fs';import assert from 'node:assert/strict';import {syncBuiltinESMExports} from 'node:module';
const expectedError=new Error('original removal error'),expectedValue={retained:true};let shouldThrow=false;
fs.rmSync=function(){if(shouldThrow)throw expectedError;return expectedValue;};syncBuiltinESMExports();
process.argv[1]='historical-drag-worker.mjs';await import(${JSON.stringify(pathToFileURL(preload).href)});
const write=process.stderr.write;process.stderr.write=()=>{throw Error('diagnostic sink failed')};
try{assert.equal(fs.rmSync('/tmp/abyss-historical-runtime-fixture'),expectedValue);shouldThrow=true;assert.throws(()=>fs.rmSync('/tmp/abyss-historical-runtime-fixture'),error=>error===expectedError);}finally{process.stderr.write=write;}
console.log('PASS original return/error identity despite diagnostic sink failure');
`);
 const operation=spawnSync(process.execPath,[join(dir,'operation-controls.mjs')],{encoding:'utf8',timeout:5000,env:{...process.env,NODE_OPTIONS:''}});
 assert.ifError(operation.error);assert.equal(operation.status,0,operation.stderr);console.log(operation.stdout.trim());
 for(const mode of ['normal','before-remove-stall','exit-stall']){
  const results=[];
  for(const traced of [false,true]){
   const result=spawnSync(process.execPath,[join(dir,'driver.mjs')],{encoding:'utf8',timeout:15000,env:{...process.env,NODE_OPTIONS:traced?'--import='+JSON.stringify(pathToFileURL(preload).href):'',TRACE_CASE:mode}});
   assert.ifError(result.error);assert.equal(result.status,0,result.stderr);
   const expected=mode==='normal'?'CLOSE_PASS':'CLOSE_REJECT Historical drag scope cleanup failed';assert.equal(result.stdout.trim(),expected);
   if(traced){
    for(const event of ['parent-close-send','worker-close-received','parent-exit','parent-close'])assert(result.stderr.includes('"event":"'+event+'"'),event+' '+result.stderr);
    if(mode!=='before-remove-stall')assert(result.stderr.includes('"event":"worker-root-remove-done"'));
    if(mode==='before-remove-stall')assert(!result.stderr.includes('"event":"worker-root-remove-done"'));
    if(mode==='exit-stall')assert(result.stderr.includes('"event":"worker-disconnect"'));
    console.log(JSON.stringify({mode,traced,stdout:result.stdout.trim(),trace:result.stderr.trim().split('\n')}));
   }
   results.push(result.stdout);
  }
  assert.equal(results[0],results[1]);console.log('PASS '+mode+' preserves original close result');
 }
}finally{rmSync(dir,{recursive:true,force:true});}
