import {preflightPriorRead} from './fork-preflight-source.mjs';
import rawTest from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as rawReadFileSync,existsSync} from 'node:fs';
const readFileSync=preflightPriorRead(rawReadFileSync,'release-bootstrap');
const test=(name,...args)=>rawTest('[historical PR677 source contract] '+name,...args);
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
if(existsSync(new URL('./release-bootstrap-ci-source.mjs',import.meta.url))) {
 const bootstrap=await import('./release-bootstrap-ci-source.mjs');
 const {releaseBootstrapWorkflowBefore}=bootstrap;
 const releaseSelectionMapCiSource=existsSync(new URL('./release-selection-map-ci-source.mjs',import.meta.url))?
  (await import('./release-selection-map-ci-source.mjs')).releaseSelectionMapCiSource:bootstrap.releaseBootstrapCiSource;
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

import {createHash} from 'node:crypto';
import {releaseBootstrapCiSource,releaseBootstrapCiRead,releaseBootstrapWorkflowBefore} from './release-bootstrap-ci-source.mjs';
test('Release bootstrap helper continuation rejects drift, foreign inputs and preserves Buffer identity',()=>{
 const hash=s=>createHash('sha256').update(s).digest('hex');
 const path='tests/helpers/draft-quality-workflow.mjs',raw=readFileSync(path,'utf8');
 // Build EOL fixtures from LF, not the checkout's potentially CRLF bytes.
 const lf=raw.replaceAll('\r\n','\n');
 const priorSha='5c3cc95c0371927db143c573c1500843b97ca8e138f67737aede03e558b1d986';
 for(const source of [raw,lf,lf.replaceAll('\n','\r\n')]){
  assert.equal(hash(releaseBootstrapCiSource(path,source)),priorSha);
  assert.equal(hash(releaseBootstrapCiSource(path,source,{sha256:priorSha})),priorSha);
  assert.equal(releaseBootstrapCiSource(path,source,{sha256:'0'.repeat(64)}),source);
 }
 for(const source of [raw+'\n',raw.slice(1),lf.replaceAll('\n','\r\r\n'),Buffer.from(raw),null,{},17])assert.equal(releaseBootstrapCiSource(path,source),source);
 for(const foreign of ['foreign/'+path,'src/lua/'+path,'__proto__'])assert.equal(releaseBootstrapCiSource(foreign,raw),raw);
 const bytes=Buffer.from(raw),prior=releaseBootstrapCiRead(()=>bytes)(path);assert(Buffer.isBuffer(prior));assert.equal(hash(prior),priorSha);
 const bad=Buffer.concat([bytes,Buffer.from('\n')]);assert.strictEqual(releaseBootstrapCiRead(()=>bad)(path),bad);
});

import {freezeReleaseFull} from '../../scripts/release-ci.mjs';
import {runInNewContext} from 'node:vm';

test('advisory job skips Ready PR duplicates while Draft and manual prechecks remain enabled',()=>{
 const workflow=readFileSync('.github/workflows/quick-feedback.yml','utf8').replaceAll('\r\n','\n');
 const gate=workflow.match(/^  related:\n    if: (.+)\n/m)?.[1];
 assert.equal(gate,"github.event_name == 'workflow_dispatch' || github.event.pull_request.draft == true");
 for(const [name,draft,expected]of [['pull_request',false,false],['pull_request',true,true],['workflow_dispatch',false,true]]) {
  assert.equal(runInNewContext(gate,{github:{event_name:name,event:{pull_request:{draft}}}}),expected);
 }
 const prior=releaseBootstrapWorkflowBefore('.github/workflows/quick-feedback.yml',workflow);
 assert.match(prior,/  pull_request:\n    branches: \[develop\]/);
 for(const source of [workflow,workflow.replaceAll('\n','\r\n')])
  assert.equal(releaseBootstrapWorkflowBefore('.github/workflows/quick-feedback.yml',source),prior);
 for(const source of [workflow+'\n',workflow.replace(gate,gate+' || true'),workflow.replace('  related:\n','  related:\n    if: true\n')]) {
  assert.equal(releaseBootstrapCiSource('.github/workflows/quick-feedback.yml',source),source);
  assert.throws(()=>releaseBootstrapWorkflowBefore('.github/workflows/quick-feedback.yml',source));
 }
 assert.equal(releaseBootstrapCiSource('.github/workflows/quick-feedback.yml',workflow,{sha256:'0'.repeat(64)}),workflow);
});

function freezeFixture() {
 const f=fixture();f.run.html_url=`https://github.com/${repo}/actions/runs/10`;
 const calls=[],base=request(f);
 const read=async(path,body)=>{
  calls.push({path,body});
  if(body)return null;
  if(path==='/repos/'+repo)return {id:1429751262,full_name:repo};
  if(path.includes('/workflows/'))return {workflow_runs:f.run?[structuredClone(f.run)]:[]};
  return base(path);
 };
 return {f,calls,read};
}
const posts=calls=>calls.filter(call=>call.body);

test('freeze waits for an existing exact pending Full instead of dispatching again',async()=>{
 for(const state of ['queued','pending','waiting','requested','in_progress']) {
  const {f,calls,read}=freezeFixture();f.run.status=state;f.run.conclusion=null;
  const result=await freezeReleaseFull(repo,branch,sha,read,proof);
  assert.equal(result.state,'waiting');assert.equal(result.runId,10);
  assert.equal(result.url,f.run.html_url);assert.equal(posts(calls).length,0);
 }
});

test('freeze reuses a successful run only through the unchanged complete receipt verifier',async()=>{
 const good=freezeFixture();
 const result=await freezeReleaseFull(repo,branch,sha,good.read,proof);
 assert.equal(result.state,'verified');assert.equal(result.runId,10);assert.equal(posts(good.calls).length,0);
 for(const mutate of [x=>x.jobs.pop(),x=>x.jobs[0].conclusion='failure',x=>x.run.run_attempt=2]) {
  const {f,calls,read}=freezeFixture();mutate(f);
  await assert.rejects(freezeReleaseFull(repo,branch,sha,read,proof));assert.equal(posts(calls).length,0);
 }
 for(const checkout of [()=>({}),()=>({...proof(),checkoutArtifact:{...proof().checkoutArtifact,expired:true}})]) {
  const {calls,read}=freezeFixture();await assert.rejects(freezeReleaseFull(repo,branch,sha,read,checkout));assert.equal(posts(calls).length,0);
 }
});

test('freeze refuses failed cancelled or foreign runs and never silently restarts them',async()=>{
 for(const mutate of [x=>x.run.conclusion='failure',x=>x.run.conclusion='cancelled',
  x=>x.run.conclusion='timed_out',x=>x.run.repository.id=1460097312,
  x=>x.run.event='pull_request',x=>x.run.path='.github/workflows/other.yml',
  x=>x.run.head_branch='develop',x=>delete x.run.head_sha]) {
  const {f,calls,read}=freezeFixture();mutate(f);
  await assert.rejects(freezeReleaseFull(repo,branch,sha,read,proof));assert.equal(posts(calls).length,0);
 }
});

test('freeze dispatches once only when the exact Release candidate has no registered run',async()=>{
 const {f,calls,read}=freezeFixture();f.run=null;
 assert.equal((await freezeReleaseFull(repo,branch,sha,read,proof)).state,'requested');
 assert.deepEqual(posts(calls),[{path:`/repos/${repo}/actions/workflows/quality.yml/dispatches`,body:{ref:branch,inputs:{runner_pool:'hosted'}}}]);
});

test('freeze rereads pending registration and moving HEAD without duplicate dispatch',async()=>{
 const raced=freezeFixture();raced.f.run=null;let lists=0;
 const result=await freezeReleaseFull(repo,branch,sha,async(path,body)=>{
  if(path.includes('/workflows/')&&!body&&++lists===2) {
   raced.f.run=fixture().run;raced.f.run.status='queued';raced.f.run.conclusion=null;
  }
  return raced.read(path,body);
 },proof);
 assert.equal(result.state,'waiting');assert.equal(posts(raced.calls).length,0);
 const moved=freezeFixture();moved.f.run=null;let refs=0;
 await assert.rejects(freezeReleaseFull(repo,branch,sha,async(path,body)=>{
  if(path.includes('/git/ref/')&&++refs===2)moved.f.head='b'.repeat(40);
  return moved.read(path,body);
 },proof),/HEAD/);
 assert.equal(posts(moved.calls).length,0);
});

test('concurrent freeze callers reuse the same already registered pending run',async()=>{
 const {f,calls,read}=freezeFixture();f.run.status='queued';f.run.conclusion=null;
 const results=await Promise.all([freezeReleaseFull(repo,branch,sha,read,proof),freezeReleaseFull(repo,branch,sha,read,proof)]);
 assert.deepEqual(results.map(result=>result.state),['waiting','waiting']);assert.equal(posts(calls).length,0);
});

test('freeze rejects a changed attempt and never falls back past a newer failure',async()=>{
 const changed=freezeFixture();changed.f.run.status='queued';changed.f.run.conclusion=null;
 await assert.rejects(freezeReleaseFull(repo,branch,sha,async(path,body)=>{
  if(path.endsWith('/actions/runs/10'))changed.f.run.run_attempt=2;
  return changed.read(path,body);
 },proof),/attempt/);
 assert.equal(posts(changed.calls).length,0);
 const latest=freezeFixture(),older=structuredClone(latest.f.run);latest.f.run.id=11;latest.f.run.conclusion='failure';
 await assert.rejects(freezeReleaseFull(repo,branch,sha,async(path,body)=>{
  if(path.includes('/workflows/')&&!body)return {workflow_runs:[older,structuredClone(latest.f.run)]};
  return latest.read(path,body);
 },proof),/failed|cancelled/);
 assert.equal(posts(latest.calls).length,0);
});

test('freeze rejects a foreign repository before any run or dispatch can be reused',async()=>{
 const {calls,read}=freezeFixture();
 await assert.rejects(freezeReleaseFull(repo,branch,sha,async(path,body)=>
  path==='/repos/'+repo?{id:1460097312,full_name:repo}:read(path,body),proof),/repository identity/);
 assert.equal(posts(calls).length,0);
});


test('advisory explicitly executes affected Release CI contracts and fails closed on Git errors',()=>{
 const workflow=readFileSync('.github/workflows/quick-feedback.yml','utf8').replaceAll('\r\n','\n');
 const block=workflow.match(/      - name: Verify affected Release CI contracts explicitly\n[\s\S]*?          NODE\n/)?.[0];
 assert(block,'explicit contract step present');
 assert.match(block,/BASE_SHA: \$\{\{ github.event.pull_request.base.sha \|\| inputs.base_sha \}\}/);
 const code=block.split("          node --input-type=module <<'NODE'\n")[1].split('          NODE\n')[0]
  .split('\n').map(line=>line.slice(10)).join('\n').replace("import {execFileSync} from 'node:child_process';",'');
 function check(paths,{base='a'.repeat(40),gitError=false,testError=false}={}){
  const calls=[],logs=[];
  const invoke=()=>runInNewContext(code,{process:{env:{BASE_SHA:base},execPath:'/fixed/node'},Set,
   console:{log:message=>logs.push(message)},execFileSync:(command,args,options)=>{
    calls.push({command,args:Array.from(args),options:{...options}});
    if(command==='git'){if(gitError)throw new Error('git failed');return paths.join('\0')+'\0';}
    if(testError)throw new Error('contract failed');
   }});
  return {calls,logs,invoke};
 }
 for(const path of ['.github/workflows/quick-feedback.yml','scripts/release-ci.mjs','tests/helpers/release-ci.cases.mjs','tests/helpers/release-bootstrap-ci-source.mjs']){
  const f=check([path]);f.invoke();
  assert.deepEqual(f.calls.map(c=>[c.command,c.args]),[['git',['diff','--name-only','-z','a'.repeat(40),'HEAD']],['/fixed/node',['--test','tests/ci-impact.test.mjs','tests/ci-summary-runners.test.mjs']]]);
  assert.deepEqual(f.calls[1].options,{stdio:'inherit'});assert.match(f.logs[0],/Executing affected Release CI contracts/);
 }
 for(const paths of [[],['docs/CI.md'],['src/lua/example.lua'],['scripts/release-ci.mjs;echo injected'],['foreign/scripts/release-ci.mjs']]){
  const f=check(paths);f.invoke();assert.equal(f.calls.length,1);assert.equal(f.logs[0],'No Release CI contract changes');
 }
 const badBase=check([],{base:'HEAD;echo bad'});assert.throws(badBase.invoke,/exact comparison/);assert.equal(badBase.calls.length,0);
 const badGit=check([],{gitError:true});assert.throws(badGit.invoke,/git failed/);assert.equal(badGit.calls.length,1);
 assert.throws(check(['scripts/release-ci.mjs'],{testError:true}).invoke,/contract failed/);
 assert.match(workflow,/run: node scripts\/test-affected.mjs --ci-fast --base "\$BASE_SHA"/);
});
