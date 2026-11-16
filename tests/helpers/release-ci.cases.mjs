import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {releaseFullGate,beforeReleaseFullGate} from './release-ci-workflow.mjs';
import {impact} from '../../scripts/ci-impact.mjs';
const timing = { js: { win32: {}, linux: {} }, lua: {}, unknownJsMs: 1000, unknownLuaMs: 1000 };
const event = { eventName: 'pull_request', base: 'develop' };
const sources = { 'scripts/value.mjs': 'export const value=1;', 'tests/value.test.mjs': 'import {value} from "../scripts/value.mjs";' };
test('Release integration uses complete affected Fast without weakening develop or explicit Full', () => {
  const release = { ...event, base: 'release/v2.0.0' };
  assert.equal(impact(['scripts/value.mjs'], sources, release, timing).mode, 'fast');
  const module = 'src/lua/abyss_combat.lua';
  const input = { [module]: 'return {}', 'tests/lua/combat.lua': 'require("abyss_combat")' };
  assert.deepEqual(impact([module], input, release, timing).lua, ['tests/lua/combat.lua']);
  assert.equal(impact([module], input, release, timing).mode, 'fast');
  assert.equal(impact([module], input, event, timing).mode, 'full');
  for (const path of ['unknown', '.github/workflows/quality.yml', 'config/architecture.json'])
    assert.equal(impact([path], sources, release, timing).mode, 'full');
  assert.equal(impact(['scripts/value.mjs'], sources, { ...release, forceFull: true }, timing).mode, 'full');
  assert.equal(impact(['scripts/value.mjs'], sources, { ...release, eventName: 'workflow_dispatch' }, timing).mode, 'full');
});
import {verifyReleaseFull as verifyActualReleaseFull} from '../../scripts/release-ci.mjs';
import {currentFullQualityJobs} from '../../scripts/verify-delivery.mjs';
const sha='a'.repeat(40),repo='FurinyaWorks/Slay-the-Heavens',branch='release/v2.0.0';
const proof=()=>({checkout:{schemaVersion:1,attempt:1,runId:10,head:sha,tested:sha,event:'workflow_dispatch'},
 checkoutArtifact:{id:100,name:'quality-10-1-check',expired:false,workflow_run:{id:10,head_sha:sha}}});
const verifyReleaseFull=(repo,branch,head,read,checkout=proof)=>verifyActualReleaseFull(repo,branch,head,read,checkout);
function fixture() {
 const run={id:10,run_attempt:1,event:'workflow_dispatch',head_branch:branch,head_sha:sha,
  path:'.github/workflows/quality.yml',repository:{id:1429751262,full_name:repo},status:'completed',conclusion:'success'};
 const jobs=currentFullQualityJobs.map((name,i)=>({id:i+1,name,run_id:10,run_attempt:1,head_sha:sha,
  status:'completed',conclusion:name==='fast'?'skipped':'success'}));
 return {run,jobs,head:sha};
}
const request=f=>async path=>structuredClone(path.includes('/git/ref/')?{ref:'refs/heads/'+branch,object:{type:'commit',sha:f.head}}:
 path.includes('/workflows/')?{workflow_runs:[f.run]}:path.includes('/jobs?')?{jobs:f.jobs}:f.run);
test('only exact frozen Release HEAD with complete latest Full permits publication',async()=>{
 const f=fixture();assert.equal((await verifyReleaseFull(repo,branch,sha,request(f))).head,sha);
 for(const mutate of [x=>x.head='b'.repeat(40),x=>x.run.head_sha='b'.repeat(40),x=>x.run.event='pull_request',
  x=>x.run.head_branch='develop',x=>x.run.repository.id=1,x=>x.run.path='.github/workflows/other.yml',
  x=>x.run.status='in_progress',x=>x.run.conclusion='failure',x=>x.run.run_attempt=2,x=>x.jobs.pop(),
  x=>x.jobs.push({...x.jobs[0],id:999}),x=>x.jobs[0].conclusion='failure',x=>x.jobs[0].conclusion='skipped',
  x=>x.jobs[0].status='queued',x=>x.jobs[0].head_sha='b'.repeat(40),
  x=>{x.jobs=x.jobs.filter(j=>!j.name.startsWith('rules ('));x.jobs.push({...x.jobs[0],id:999,name:'fast (windows-2025)'});}]) {
  const bad=fixture();mutate(bad);await assert.rejects(verifyReleaseFull(repo,branch,sha,request(bad)),undefined,String(mutate));
 }
});
test('candidate verification rejects branch movement and a newer attempt during reads',async()=>{
 for(const field of ['head','run_attempt']) {
  const f=fixture(),read=request(f);let calls=0;
  await assert.rejects(verifyReleaseFull(repo,branch,sha,async path=>{
   if(field==='run_attempt'&&path.includes('/actions/runs/10')&&!path.includes('/jobs?'))f.run.run_attempt++;
   if(path.includes('/git/ref/')&&++calls===2&&field==='head')f.head='b'.repeat(40);
   return read(path);
  }));
 }
});

test('publication requires immutable actual checkout, never green metadata alone',async()=>{
 for(const mutate of [p=>delete p.checkout,p=>delete p.checkoutArtifact,p=>p.checkoutArtifact.expired=true,
  p=>p.checkout.tested='b'.repeat(40),p=>p.checkout.head='b'.repeat(40),p=>p.checkout.event='pull_request',
  p=>p.checkout.attempt=2,p=>p.checkout.runId=11,p=>p.checkoutArtifact.id=null,
  p=>p.checkoutArtifact.workflow_run.head_sha='b'.repeat(40)]) {
  const f=fixture(),p=proof();mutate(p);
  await assert.rejects(verifyReleaseFull(repo,branch,sha,request(f),()=>p));
 }
});

test('publication gate is in required impact and never removes foreign partial wiring',()=>{
 const workflow=readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n');
 assert.equal(workflow.split(releaseFullGate).length,2);
 assert(workflow.indexOf(releaseFullGate)<workflow.indexOf('  fast:'));
 assert.match(workflow,/  push:\n    branches: \[develop, master\]\n/);
 for(const drift of [workflow.replace('verify-pr','wrong-command'),workflow.replace(releaseFullGate,releaseFullGate+releaseFullGate)])
  assert.equal(beforeReleaseFullGate(drift),drift);
});
if(existsSync(new URL('./release-selection-map-ci-source.mjs',import.meta.url))) {
 const {releaseSelectionMapCiSource}=await import('./release-selection-map-ci-source.mjs');
 const {releaseBootstrapWorkflowBefore}=await import('./release-bootstrap-ci-source.mjs');
 test('Release history accepts only the complete reviewed gate and push removal together',()=>{
  const path='.github/workflows/quality.yml',workflow=readFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.notEqual(releaseSelectionMapCiSource(path,workflow),workflow);
  for(const source of [workflow.replace(releaseFullGate,''),
   workflow.replace('  push:\n    branches: [develop, master]\n',"  push:\n    branches: [develop, master, 'release/**']\n"),
   workflow.replace(releaseFullGate,releaseFullGate+releaseFullGate),workflow.replace('verify-pr','wrong-command'),workflow+'\n']) {
   assert.equal(releaseSelectionMapCiSource(path,source),source);
   assert.throws(()=>releaseBootstrapWorkflowBefore(path,source));
  }
 });
}
