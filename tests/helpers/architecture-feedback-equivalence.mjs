import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const file='src/lua/abyss_feedback.lua';
const before=JSON.parse(gunzipSync(readFileSync('tests/fixtures/architecture-display-before.json.gz'))).files[file].source;
function replay(source,fixture,args){
 const directory=mkdtempSync(join(tmpdir(),'architecture-feedback-'));
 try{
  const output=join(directory,'graphs.jsonl');
  const child=spawnSync(process.execPath,['--max-old-space-size=512','tests/helpers/architecture-feedback-vm.mjs',output],{
   input:JSON.stringify({source,fixture,args}),encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
  assert.ifError(child.error);assert.equal(child.status,0,child.stderr);assert.equal(child.stderr,'');
  return {...JSON.parse(child.stdout),graph:readFileSync(output,'utf8')};
 }finally{rmSync(directory,{recursive:true,force:true});}
}
// The original continuous-card fixture exposes numeric windows and asserts that
// all nine cases register. Fresh VMs retain every case and every observation,
// without accumulating previous cases' complete battle graphs in the observer.
const cases=[{fixture:'feedback_start_recovery',args:[]},
 ...Array.from({length:9},(_,i)=>({fixture:'feedback_continuous_cards',args:[i+1,i+1]}))];
for(const {fixture,args}of cases)test(`Feedback frozen-context lifecycle preserves complete state/event/queue/alias graphs: ${fixture} ${args.join('-')}`,t=>{
 const path='tests/lua/'+fixture+'.lua',old=replay(before,path,args),current=replay(readFileSync(file,'utf8'),path,args);
 assert.equal(old.status,0,old.error);assert.equal(current.status,0,current.error);
 assert.ok(old.checkpoints>30);assert.deepEqual(current.prints,old.prints);
 const expected=old.graph.split('\n'),actual=current.graph.split('\n');assert.equal(actual.length,expected.length);
 for(let i=0;i<expected.length;i++)assert.equal(actual[i],expected[i],'complete graph checkpoint '+i);
 assert.equal(current.bytes,old.bytes);
 t.diagnostic(JSON.stringify({fixture,args,checkpoints:current.checkpoints,bytesPerSide:current.bytes}));
});
