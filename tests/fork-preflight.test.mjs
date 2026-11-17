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
test('all expensive PR jobs depend on admission; integration keeps native triggers',()=>{
 const q=readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n');
 assert.match(q,/admission:[\s\S]*node scripts\/fork-preflight.mjs/);
 for(const name of ['impact','presentation'])assert.match(q,new RegExp(`  ${name}:\\n    needs: admission`));
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

test('draft license inventory cannot run ahead and ready event retries native admission',()=>{
 const licenses=readFileSync('.github/workflows/licenses.yml','utf8').replaceAll('\r\n','\n');
 const gate=licenses.slice(licenses.indexOf('  admission:'),licenses.indexOf('  inventory:'));
 assert.doesNotMatch(gate,/draft == false/);
 assert.match(licenses,/types: \[opened, synchronize, reopened, ready_for_review\]/);
 assert.match(licenses,/  inventory:\n    needs: admission/);
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
test('preflight skip does not suppress required Fast or POSIX Full consumers',()=>{
 const workflow=readFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n');
 for(const [job,mode]of [['fast','fast'],['engineering-posix-shards','full']]){
  const section=workflow.slice(workflow.indexOf('  '+job+':\n')).split(/\n  [a-z][\w-]*:\n/)[0];
  const expression=section.match(/^    if: (.+)$/m)?.[1];
  assert(expression,'required consumer condition exists: '+job);
  assert.match(expression,/!cancelled\(\)/,'explicit status check removes default success(): '+job);
  const js=expression.replace(/^\$\{\{\s*|\s*\}\}$/g,'');
  const invoke=(result,cancelled=false,selected=mode)=>evaluateJobIf(js,{
   cancelled:()=>cancelled,needs:{admission:{result:'skipped'},impact:{result,outputs:{mode:selected}}}
  });
  assert.equal(invoke('success'),true,job+' runs after dispatch admission skip');
  for(const result of ['failure','cancelled','skipped'])assert.equal(invoke(result),false,job+' rejects '+result);
  assert.equal(invoke('success',true),false,job+' rejects cancellation');
  assert.equal(invoke('success',false,mode==='full'?'fast':'full'),false,job+' respects route');
 }
});
