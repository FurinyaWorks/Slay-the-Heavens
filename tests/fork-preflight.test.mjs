import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {validPreflight, preflightTitle, newestPreflight} from '../scripts/fork-preflight.mjs';
import {completePreflight} from '../scripts/test-affected.mjs';
const head='a'.repeat(40), base='b'.repeat(40), before='2026-11-17T05:00:00Z';
const run={head_sha:head,event:'workflow_dispatch',status:'completed',conclusion:'success',
 display_title:`Preflight / ${head} / ${base}`,updated_at:'2026-11-17T04:00:00Z',path:'.github/workflows/quick-feedback.yml',run_attempt:1};
test('admission binds head, base, configuration workflow, outcome and ordering',()=>{
 assert.equal(preflightTitle('Preflight',head,base),run.display_title);
 assert.ok(validPreflight(run,{head,base,before}));
 for(const patch of [{head_sha:base},{display_title:`Preflight / ${head} / ${head}`},{event:'pull_request'},
 {status:'in_progress'},{conclusion:'cancelled'},{updated_at:'2026-11-17T06:00:00Z'},
 {path:'.github/workflows/other.yml'},{run_attempt:2}, {updated_at:null}])
  assert.equal(validPreflight({...run,...patch},{head,base,before}),false,JSON.stringify(patch));
 assert.ok(validPreflight({...run,path:'.github/workflows/quality.yml',display_title:`Full / ${head} / ${base}`},{head,base,before}));
});
test('unknown preflight fails instead of silently passing or starting local Full',()=>{
 const r=spawnSync(process.execPath,['scripts/test-affected.mjs','--preflight','--files','unknown.txt'],{encoding:'utf8'});
 assert.notEqual(r.status,0); assert.match(r.stderr,/Full required/);
});
test('formal preflight reuses existing jobs and precedes costly PR work',()=>{
 const q=readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n');
 const jobs=[...q.slice(q.indexOf('\njobs:\n')).matchAll(/^  ([\w-]+):$/gm)].map(m=>m[1]);
 assert.deepEqual(jobs,['impact','fast','rules','check','presentation','engineering-posix-shards','engineering-posix']);
 assert.doesNotMatch(q,/needs: admission/);
 const impact=q.slice(q.indexOf('  impact:'),q.indexOf('  fast:'));
 const gate=impact.indexOf('run: node scripts/fork-preflight.mjs');
 assert(gate>impact.indexOf('uses: actions/setup-node@'));
 for(const command of ['publish-full-quality.mjs --pending','publish-pr-quality.mjs --pending'])assert(gate>impact.indexOf(command));
 for(const command of ['Check feature branch history','npm ci','node scripts/ci-impact.mjs'])assert(gate<impact.indexOf(command));
 assert.match(impact,/actions: read/);
 assert.doesNotMatch(impact,/continue-on-error:/);
 assert.match(q,/  presentation:\n    needs: impact\n    if: \$\{\{ !cancelled\(\) && needs\.impact\.result == 'success' \}\}/);
 assert.match(q,/merge_group:/);assert.match(q,/branches: \[develop, master\]/);
 const quick=readFileSync('.github/workflows/quick-feedback.yml','utf8').replaceAll('\r\n','\n');
 assert.match(quick,/--preflight --base/); assert.doesNotMatch(quick,/--ci-fast --base/);
});

test('preflight retains integration JS and every slow Lua without duplicated execution',()=>{
 assert.deepEqual(completePreflight({full:false, fast:['a','b'],integration:['b','heavy'],lua:['slow','slow','direct']}),
 {tests:['a','b','heavy'],fixtures:['slow','direct']});
 assert.throws(()=>completePreflight({full:false,fast:[],integration:[],lua:[]}),/Full required/);
});

test('newer failed or active dispatch invalidates older success across forks',()=>{
 const old={...run,id:1,created_at:'2026-11-17T03:00:00Z'};
 assert.equal(newestPreflight([old],{head,base,before}),old);
 for(const patch of [{conclusion:'failure'},{status:'in_progress',conclusion:null}])
  assert.equal(newestPreflight([old,{...old,...patch,id:2,created_at:'2026-11-17T04:00:00Z'}],{head,base,before}),null);
});

test('draft license gate stays in the existing inventory before media and retries on ready',()=>{
 const licenses=readFileSync('.github/workflows/licenses.yml','utf8').replaceAll('\r\n','\n');
 assert.doesNotMatch(licenses,/^  admission:|needs: admission|draft == false/m);
 assert.deepEqual([...licenses.slice(licenses.indexOf('\njobs:\n')).matchAll(/^  ([\w-]+):$/gm)].map(m=>m[1]),['inventory']);
 assert.match(licenses,/types: \[opened, synchronize, reopened, ready_for_review\]/);
 assert.match(licenses,/  inventory:\n    permissions:\n      contents: read\n      actions: read/);
 const gate=licenses.indexOf('run: node scripts/fork-preflight.mjs');
 assert(gate>licenses.indexOf('uses: actions/setup-node@'));
 for(const command of ['node scripts/ci-media-lfs.mjs','node scripts/ci-reviewed-lfs.mjs','node --test scripts/check-license.test.mjs','node scripts/check-license.mjs'])assert(gate<licenses.indexOf(command));
 assert.doesNotMatch(licenses,/continue-on-error:/);
 const script=readFileSync('scripts/fork-preflight.mjs','utf8');
 assert.match(script,/attempts\/\$\{process.env.GITHUB_RUN_ATTEMPT\}/);
});

test('admission implementation always requires Full even with a tiny proven mapping',async()=>{
 const {impact}=await import('../scripts/ci-impact.mjs');
 const path='scripts/fork-preflight.mjs';
 const plan=impact([path],{[path]:'export const value=1;','tests/a.test.mjs':`import '../${path}';`},
 {eventName:'pull_request',base:'develop'},{js:{win32:{},linux:{}},lua:{},unknownJsMs:1,unknownLuaMs:1});
 assert.equal(plan.mode,'full');assert.equal(plan.reason,'High risk or shared infrastructure');
});

import {runInNewContext as evaluateJobIf} from 'node:vm';
test('inline preflight preserves required Fast and POSIX fail-closed impact consumers',()=>{
 const workflow=readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n');
 for(const [job,mode]of [['fast','fast'],['engineering-posix-shards','full']]){
  const section=workflow.slice(workflow.indexOf('  '+job+':\n')).split(/\n  [a-z][\w-]*:\n/)[0];
  const expression=section.match(/^    if: (.+)$/m)?.[1];
  assert(expression,'required consumer condition exists: '+job);
  assert.match(expression,/!cancelled\(\)/,'explicit status check removes default success(): '+job);
  const js=expression.replace(/^\$\{\{\s*|\s*\}\}$/g,'');
  const invoke=(result,cancelled=false,selected=mode)=>evaluateJobIf(js,{
   cancelled:()=>cancelled,needs:{impact:{result,outputs:{mode:selected}}}
  });
  assert.equal(invoke('success'),true,job+' runs after a successful impact');
  for(const result of ['failure','cancelled','skipped'])assert.equal(invoke(result),false,job+' rejects '+result);
  assert.equal(invoke('success',true),false,job+' rejects cancellation');
  assert.equal(invoke('success',false,mode==='full'?'fast':'full'),false,job+' respects route');
 }
});

test('inline admission runs only for organization non-master PRs and downstream rejects gate failure',()=>{
 const condition="github.event_name == 'pull_request' && github.event.pull_request.base.ref != 'master' && github.repository_id == '1429751262'";
 for(const file of ['quality','licenses']){
  const source=readFileSync('.github/workflows/'+file+'.yml','utf8').replaceAll('\r\n','\n');
  assert.equal(source.split('run: node scripts/fork-preflight.mjs').length,2);
  const block=source.match(/      - name: Require completed Fork preflight before formal test jobs\n([\s\S]*?)        run: node scripts\/fork-preflight.mjs/)[1];
  assert.equal(block.match(/^        if: (.+)$/m)[1],condition);
  assert.match(block,/GH_TOKEN: \$\{\{ github.token \}\}/);
  for(const [event,repo,base,expected]of [
   ['pull_request','1429751262','develop',true],['pull_request','1429751262','release/v2.0.0',true],
   ['pull_request','1429751262','master',false],['pull_request','1460097312','develop',false],
   ['workflow_dispatch','1429751262','develop',false],['push','1429751262','develop',false],['merge_group','1429751262','develop',false]
  ])for(const draft of [true,false])assert.equal(evaluateJobIf(condition,{github:{event_name:event,repository_id:repo,event:{pull_request:{base:{ref:base},draft}}}}),expected);
 }
 const quality=readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n');
 const impact=quality.slice(quality.indexOf('  impact:'),quality.indexOf('  fast:'));
 const impactIf=impact.match(/^    if: (.+)$/m)[1];
 assert.equal(evaluateJobIf(impactIf,{github:{event_name:'pull_request',event:{pull_request:{draft:true}}}}),false);
 assert.equal(evaluateJobIf(impactIf,{github:{event_name:'pull_request',event:{pull_request:{draft:false}}}}),true);
 const presentation=quality.slice(quality.indexOf('  presentation:'),quality.indexOf('  engineering-posix-shards:'));
 const downstream=presentation.match(/^    if: (.+)$/m)[1].replace(/^\$\{\{\s*|\s*\}\}$/g,'');
 for(const result of ['success','failure','cancelled','skipped'])for(const cancelled of [false,true])
  assert.equal(evaluateJobIf(downstream,{needs:{impact:{result}},cancelled:()=>cancelled}),result==='success'&&!cancelled);
});
