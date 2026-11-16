// Explicit, bounded local replay. Not part of ordinary CI's heavy workload.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {percentile,validateHistogram} from './benchmark-runtime-path.mjs';
export const battlePhases=['warmup','idle-300','cards-3','particle-warmup','particles-300','switch-20',...Array.from({length:12},(_,i)=>'long-'+(i+1)),'disable'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const frameBudget=[120,300,80,120,300,600,...Array(12).fill(300),0];
const digestPattern=/^[0-9a-f]{64}$/;
function validate(run){
 assert(['counts','allocations','visual'].includes(run.mode));
 assert.deepEqual(run.rows.map(r=>r.phase),battlePhases,'incomplete/reordered workload');
 for(const [index,r]of run.rows.entries()){
  assert.equal(r.frames,frameBudget[index],'fixed frame budget');
  if(r.phase==='disable'){assert.equal(r.effects,0,'retained effects');assert.equal(r.outputs,0,'retained native output');}
  else for(const key of ['GameUI.update','BattleUI.update','Feedback.update','nodeUI.update','mapUI.update'])assert.equal(r.counts.calls[key],r.frames,'missing required subsystem: '+key);
  if(r.phase.startsWith('long-'))assert.equal(r.liveControls,run.rows[6].liveControls,'warm native controls accumulated');
  assert(Number.isFinite(r.elapsedMs)&&r.elapsedMs>=0,'invalid duration');
  for(const k of ['frames','liveControls','effects','outputs','visualFrames'])assert(Number.isSafeInteger(r[k])&&r[k]>=0,'invalid '+k);
  assert(digestPattern.test(r.coreHash),'missing core/RNG identity');
  for(const k of ['rss','heapUsed'])assert(Number.isSafeInteger(r.memory[k])&&r.memory[k]>0,'missing VM memory');
  for(const k of ['nativeCalls','propertyWrites','created','destroyed'])assert(Number.isSafeInteger(r.counts[k])&&r.counts[k]>=0,'invalid count');
  validateHistogram(r.counts.methods,r.counts.nativeCalls);validateHistogram(r.counts.properties,r.counts.propertyWrites);
  for(const bucket of ['calls','allocations'])for(const [k,v]of Object.entries(r.counts[bucket]))assert(k&&Number.isSafeInteger(v)&&v>0,'invalid bucket');
  if(run.mode==='visual'){assert(digestPattern.test(r.visualHash),'missing visual digest');assert.equal(r.visualFrames,r.frames,'unobserved update');}
 }
}
export function validateBattlePair(before,after){
 validate(before);validate(after);assert.equal(before.mode,after.mode);
 for(let i=0;i<before.rows.length;i++){
  const a=before.rows[i],b=after.rows[i];
  for(const k of ['phase','frames','coreHash','liveControls','effects','outputs'])assert.deepEqual(b[k],a[k],'changed workload/state: '+k);
  assert.deepEqual(b.counts.calls,a.counts.calls,'changed subsystem calls');
  for(const k of ['created','destroyed'])assert.equal(b.counts[k],a.counts[k],'changed native lifetime');
  if(before.mode==='visual')assert.equal(b.visualHash,a.visualHash,'visual field drift');
  assert(b.counts.nativeCalls<=a.counts.nativeCalls&&b.counts.propertyWrites<=a.counts.propertyWrites,'native publication regressed');
 }
 return true;
}
function identity(profile){
 const files=[];
 function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=dir+'/'+e.name;if(e.isDirectory())walk(p);else if(/\.(lua|mjs|json)$/.test(p))files.push({path:p,sha256:sha(readFileSync(p))});}}
 for(const dir of ['src/lua','build/lua','tests/lua/support','scripts/runtime-baseline',profile])walk(dir);
 for(const p of ['package-lock.json','scripts/benchmark-battle-runtime.mjs','scripts/benchmark-runtime-path.mjs','tests/helpers/lua-graph-observer.mjs'])files.push({path:p,sha256:sha(readFileSync(p))});
 files.sort((a,b)=>a.path.localeCompare(b.path));return {sha256:sha(JSON.stringify(files)),files};
}
export function benchmarkBattleRuntime({beforeRef,profile,output}){
 assert(/^[0-9a-f]{40}$/.test(beforeRef),'use a full immutable baseline commit');
 assert(profile&&existsSync(profile+'/abyss_ui_layout.lua'),'build a complete profile first');
 assert(!existsSync(output),'use a fresh output directory; retain unfavorable runs');mkdirSync(output,{recursive:true});
 const target='src/lua/abyss_monster_intent_particle_view.lua';
 const result=spawnSync('git',['show',beforeRef+':'+target],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 const beforeFile=resolve(output,'before.lua'),afterFile=resolve(output,'after.lua');
 writeFileSync(beforeFile,result.stdout);writeFileSync(afterFile,readFileSync(target));
 assert.notEqual(sha(readFileSync(beforeFile)),sha(readFileSync(afterFile)),'no runtime change');
 const source=identity(profile),runs=[];
 const plan=[];for(let pair=1;pair<=3;pair++)for(const side of pair%2?['before','after']:['after','before'])plan.push({pair,side,mode:'counts'});
 for(const mode of ['allocations','visual'])for(const side of ['before','after'])plan.push({pair:1,side,mode});
 for(const spec of plan){
  const name=`${spec.mode}-${spec.pair}-${spec.side}`,file=resolve(output,name+'.json');
  const r=spawnSync(process.execPath,['scripts/runtime-baseline/battle-worker.mjs',profile,spec.side==='before'?beforeFile:afterFile,spec.mode,file],{encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024});
  writeFileSync(resolve(output,name+'.stdout.txt'),r.stdout||'');writeFileSync(resolve(output,name+'.stderr.txt'),r.stderr||'');
  assert.ifError(r.error);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/BATTLE_RUNTIME_PASS seed=42 cards=3 switches=20 longFrames=3600/);
  runs.push({...spec,...JSON.parse(readFileSync(file,'utf8'))});
  console.log(name+' PASS');
 }
 assert.deepEqual(identity(profile),source,'inputs changed during replay');
 for(const a of runs.filter(r=>r.side==='before'))validateBattlePair(a,runs.find(r=>r.mode===a.mode&&r.pair===a.pair&&r.side==='after'));
 for(const side of ['before','after']){
  const data=runs.filter(r=>r.mode==='counts'&&r.side===side),counts=r=>r.rows.map(({phase,counts,frames,liveControls,coreHash})=>({phase,counts,frames,liveControls,coreHash}));
  for(const r of data)assert.deepEqual(counts(r),counts(data[0]),'nondeterministic fixed-source replay');
 }
 const summary=battlePhases.map(phase=>({phase,...Object.fromEntries(['before','after'].map(side=>{const rows=runs.filter(r=>r.mode==='counts'&&r.side===side).map(r=>r.rows.find(x=>x.phase===phase));return [side,{p50Ms:percentile(rows.map(r=>r.elapsedMs),.5),p95Ms:percentile(rows.map(r=>r.elapsedMs),.95),nativeCalls:rows[0].counts.nativeCalls,propertyWrites:rows[0].counts.propertyWrites}];}))}));
 const report={schemaVersion:1,status:'OFFLINE_HOST_PAIR_VERIFIED',beforeRef,source,changedRuntime:{path:target,beforeSha256:sha(readFileSync(beforeFile)),afterSha256:sha(readFileSync(afterFile))},profile,node:process.version,platform:process.platform,runs,summary,officialPhone:'UNVERIFIED',officialSdk:'UNVERIFIED',limitations:['Only one module is substituted; every other source and generated UI input is shared and hashed.','Timing includes TASK-100 observer, call counters and phase-boundary full Run graph capture. Visual/AST allocation passes are separate from timing.','Nearest-rank n=3 P95 is the maximum observed sample, not stable tail latency.','Allocation counts cover table literals in seven named Lua UI modules only. They exclude closures, engine allocations, helper functions and VM internals. Node heap/RSS are not native Lua or phone memory.','The actual engine OnUpdate/bridge/portrait driver/GPU and official SDK export are not executed by this Host fixture.','Visual hashes cover every measured update of particle output fields plus actor portrait and hand transforms; they are mock field equivalence, not official pixel/quality approval.','Long replay is 3600 frames (60 simulated seconds), not an endurance/thermal device test.']};
 writeFileSync(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');return report;
}
if(import.meta.url===pathToFileURL(resolve(process.argv[1]||'')).href){
 const [beforeRef,profile,output]=process.argv.slice(2);benchmarkBattleRuntime({beforeRef,profile,output});
}
