import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {projectRepositoryId} from '../scripts/repository-identity.mjs';
import {armAutoMerge,autoMergeErrors,collectEligibility,pauseAutoMerge} from '../scripts/arm-auto-merge.mjs';
import {independentReviewGate} from '../scripts/publish-pr-quality.mjs';
import {currentFullQualityJobs} from '../scripts/verify-delivery.mjs';
const sha=c=>c.repeat(40);
import {INDEPENDENT_AI_REVIEW_MARKER as aiMarker,TRUSTED_REVIEW_COORDINATOR_IDS as aiCoordinators,
 parseIndependentAiReview,validateIndependentAiReview,collectIndependentAiReview,
 parseDependencies as parseAiDependencies} from '../scripts/independent-ai-review.mjs';
const aiRepo='FurinyaWorks/Slay-the-Heavens',aiRoleId=111138384;
const aiBody=report=>aiMarker+'\n'+JSON.stringify(report);
function aiFixture(){
 const repository={id:projectRepositoryId,full_name:aiRepo},user={id:aiRoleId,login:'FurinyaDev'};
 const pr={number:712,user:{id:337201427,login:'implementer'},state:'open',merged:false,draft:false,mergeable:true,body:'Summary\nDepends-on: none',
  head:{sha:sha('a'),repo:repository},base:{ref:'develop',sha:sha('b'),repo:repository},merge_commit_sha:sha('d')};
 const report={schemaVersion:1,kind:'independent-ai-review',repositoryId:projectRepositoryId,repositoryFullName:aiRepo,
  prNumber:712,reviewedHeadSha:sha('a'),reviewedBaseSha:sha('b'),reviewedTreeSha:sha('e'),conclusion:'pass',unresolved:[],
  reviewerAgent:'/root/reviewer',implementationAgents:['/root/implementer'],
  coordinator:{...user,verifiedActualSessions:true},
  provenance:{kind:'coordinator-verified-agent-session',reviewId:'/root/reviewer/review-712',sessionId:'actual-review-session'}};
 const reviews=[{id:100,commit_id:sha('a'),state:'APPROVED',submitted_at:'2026-11-17T10:00:00Z',user,
  html_url:'https://github.com/'+aiRepo+'/pull/712#pullrequestreview-100',body:aiBody(report)}];
 return {repository,pr,baseSha:sha('b'),sourceCommit:{sha:sha('d'),tree:{sha:sha('e')},parents:[{sha:sha('b')},{sha:sha('a')}]},
  reviews,permissions:{[aiRoleId]:{permission:'admin',role_name:'admin',user}},dependencies:[],report};
}
function aiCheck(change=()=>{}){const f=aiFixture();change(f);f.reviews[0].body=aiBody(f.report);return validateIndependentAiReview(f);}
function aiApi(f=aiFixture(),alter=(_path,value)=>value){
 const calls=[],prefix='repos/'+aiRepo;let prReads=0,targetReads=0;
 const api=path=>{
  calls.push(path);let value;
  if(path==='repositories/'+projectRepositoryId)value=f.repository;
  else if(path===prefix+'/git/ref/heads/develop'){targetReads++;value={ref:'refs/heads/develop',object:{type:'commit',sha:f.baseSha}};}
  else if(path===prefix+'/pulls/712'){prReads++;value=f.pr;}
  else if(path===prefix+'/git/commits/'+f.pr.merge_commit_sha)value=f.sourceCommit;
  else if(path.startsWith(prefix+'/pulls/712/reviews?')){
   const page=Number(new URL('https://api.github.com/'+path).searchParams.get('page'));value=f.reviews.slice((page-1)*100,page*100);
  }else if(path===prefix+'/collaborators/FurinyaDev/permission')value=f.permissions[aiRoleId];
  else if(path===prefix+'/pulls/11')value=f.dependencies[0]?.pr;
  else if(path===prefix+'/compare/'+sha('f')+'...'+f.baseSha)value=f.dependencies[0]?.comparison;
  else throw Error('Unexpected API read: '+path);
  return alter(path,structuredClone(value),{prReads,targetReads,calls});
 };
 return {api,calls};
}
const aiCollect=(f=aiFixture(),alter)=>collectIndependentAiReview({prNumber:712,...aiApi(f,alter)});

test('independent AI gate accepts a maintain/admin native approval attesting a distinct real AI session',()=>{
 const f=aiFixture(),result=validateIndependentAiReview(f);
 assert.equal(result.conclusion,'pass');assert.deepEqual(result.errors,[]);assert.equal(result.githubReviewId,100);
 assert.equal(result.reviewId,f.report.provenance.reviewId);assert.equal(result.tree,sha('e'));
 assert.equal(result.nativeApprovalReviewId,100);
 assert.deepEqual(aiCoordinators,[111138384,337201427]);
 assert.equal(aiCheck(x=>{x.permissions[aiRoleId].permission='write';x.permissions[aiRoleId].role_name='maintain';}).conclusion,'pass');
 assert.equal(aiCheck(x=>{delete x.report.coordinator.verifiedActualSessions;x.report.provenance.coordinatorVerified=true;}).conclusion,'pass');
});

test('independent AI gate requires the same complete report to be a current trusted non-author native approval',()=>{
 const f=aiFixture();f.reviews[0].state='COMMENTED';
 assert.equal(validateIndependentAiReview(f).conclusion,'fail');
 f.reviews.push({...f.reviews[0],id:101,state:'APPROVED',body:'Native approval after verifying the actual AI session'});
 assert.equal(validateIndependentAiReview(f).conclusion,'fail','an unrelated approval cannot be stitched to COMMENTED metadata');
 f.reviews[1].body=aiBody(f.report);
 assert.equal(validateIndependentAiReview(f).conclusion,'pass');
 for(const patch of [{state:'DISMISSED'},{state:'CHANGES_REQUESTED'},{commit_id:sha('c')},{user:f.pr.user}]){
  const x=structuredClone(f);Object.assign(x.reviews[1],patch);assert.equal(validateIndependentAiReview(x).conclusion,'fail');
 }
 f.pr.user={...f.reviews[0].user};assert.equal(validateIndependentAiReview(f).conclusion,'fail');
 delete f.pr.user;assert.equal(validateIndependentAiReview(f).conclusion,'fail');
});

test('independent AI gate never substitutes a PR body, artifact declaration or arbitrary review text for a signed report',()=>{
 const f=aiFixture();f.pr.body+='\n'+aiBody(f.report);f.artifact={report:f.report};f.reviews=[];
 assert.equal(validateIndependentAiReview(f).conclusion,'fail');
 for(const body of [JSON.stringify(f.report),'quoted report '+aiBody(f.report),'```json\n'+JSON.stringify(f.report)+'\n```'])
  assert.equal(parseIndependentAiReview(body),null);
 for(const body of [aiMarker+'\n{}',aiMarker+'\n'+JSON.stringify({...f.report,schemaVersion:2}),aiBody(f.report)+'\n{}'])
  assert.throws(()=>parseIndependentAiReview(body));
});

test('independent AI gate requires both the fixed coordinator user ID and current repository maintain/admin role',()=>{
 for(const change of [
  x=>{x.reviews[0].user={id:999,login:'FurinyaDev'};},
  x=>{x.permissions[aiRoleId].role_name='write';},
  x=>{x.permissions[aiRoleId].permission='read';},
  x=>{x.permissions[aiRoleId].user={id:999,login:'FurinyaDev'};},
  x=>{x.permissions[aiRoleId].user={id:aiRoleId,login:'impostor'};},
  x=>{x.report.coordinator.id=337201427;},x=>{x.report.coordinator.login='impostor';},
  x=>{delete x.permissions[aiRoleId];},
 ])assert.equal(aiCheck(change).conclusion,'fail');
});

test('independent AI gate binds the current merge combination, not merely a familiar HEAD or head tree',()=>{
 for(const change of [
  x=>{x.repository={...x.repository,id:1};},x=>{x.repository={...x.repository,full_name:'foreign/repo'};},
  x=>{x.pr.head={...x.pr.head,repo:{id:1,full_name:aiRepo}};},x=>{x.pr.base.ref='master';},
  x=>{x.pr.state='closed';},x=>{x.pr.draft=true;},x=>{x.pr.mergeable=null;},
  x=>{x.pr.base.sha=sha('c');},x=>{x.sourceCommit.sha=sha('c');},
  x=>{x.sourceCommit.parents.reverse();},x=>{x.sourceCommit.parents=[{sha:sha('b')}];},
  x=>{x.sourceCommit.parents={};},x=>{x.sourceCommit.parents=[null,null];},
  x=>{x.sourceCommit.tree.sha=sha('c');},x=>{x.sourceCommit.commit={tree:{sha:sha('c')}};},
  x=>{x.reviews[0].commit_id=sha('c');},x=>{x.reviews[0].state='DISMISSED';},
  x=>{x.report.repositoryId=1;},x=>{x.report.repositoryFullName='foreign/repo';},x=>{x.report.prNumber=713;},
  x=>{x.report.reviewedHeadSha=sha('c');},x=>{x.report.reviewedBaseSha=sha('c');},x=>{x.report.reviewedTreeSha=sha('c');},
 ])assert.equal(aiCheck(change).conclusion,'fail');
});

test('independent AI gate requires explicit verified session provenance and a reviewer outside the implementation agents',()=>{
 for(const change of [
  x=>{x.report.reviewerAgent='/root/implementer';},x=>{x.report.implementationAgents=[];},
  x=>{x.report.implementationAgents=['/root/implementer','/root/implementer'];},
  x=>{x.report.reviewerAgent='/root/reviewer ';},x=>{x.report.provenance.sessionId='';},
  x=>{delete x.report.coordinator.verifiedActualSessions;},x=>{x.report.provenance.reviewId='';},
  x=>{x.report.provenance.kind='artifact-self-assertion';},x=>{x.report.unresolved=['unfixed'];},
  x=>{x.report.conclusion='fail';},
 ])assert.equal(aiCheck(change).conclusion,'fail');
});

test('independent AI gate rejects later trusted change requests and later fail/malformed/stale reports without falling back',()=>{
 for(const patch of [
  {state:'CHANGES_REQUESTED',body:'Fix the transaction bug'},
  {state:'COMMENTED',body:aiBody({...aiFixture().report,conclusion:'fail',unresolved:['bug']})},
  {state:'COMMENTED',body:aiMarker+'\nnot JSON'},
  {state:'COMMENTED',body:aiBody({...aiFixture().report,reviewedBaseSha:sha('c')})},
  {state:'DISMISSED'},
 ]){
  const f=aiFixture();f.reviews.push({...f.reviews[0],id:101,submitted_at:'2026-11-17T10:01:00Z',...patch});
  assert.equal(validateIndependentAiReview(f).conclusion,'fail');
 }
 const f=aiFixture();f.reviews.push({...f.reviews[0],id:101,state:'CHANGES_REQUESTED',user:{id:999,login:'untrusted'},body:'No'});
 assert.equal(validateIndependentAiReview(f).conclusion,'pass');
 f.reviews.push({...f.reviews[0],id:99,submitted_at:'2026-11-17T09:59:00Z',state:'CHANGES_REQUESTED',body:'Earlier issue'});
 assert.equal(validateIndependentAiReview(f).conclusion,'pass');
});

function aiDependency(f){
 f.pr.body='Depends-on: #11, #11';
 f.dependencies=[{number:11,comparedBaseSha:f.baseSha,pr:{number:11,merged:true,merge_commit_sha:sha('f'),base:{ref:'develop',repo:f.repository}},
  comparison:{status:'ahead',merge_base_commit:{sha:sha('f')}}}];return f;
}
test('independent AI gate preserves the existing complete Depends-on containment semantics',()=>{
 assert.deepEqual(parseAiDependencies('Depends-on: #11, #12 #11'),[11,12]);
 assert.deepEqual(parseAiDependencies('Depends-on: none'),[]);
 for(const body of ['', 'Depends-on: none\nDepends-on: #11','Depends-on: #0','Depends-on: external/11'])assert.throws(()=>parseAiDependencies(body));
 const f=aiDependency(aiFixture());assert.equal(validateIndependentAiReview(f).conclusion,'pass');
 for(const change of [
  x=>{x.dependencies=[];},x=>{x.dependencies[0].pr.merged=false;},x=>{x.dependencies[0].pr.base.ref='master';},
  x=>{x.dependencies[0].comparison.status='behind';},x=>{x.dependencies[0].comparison.merge_base_commit.sha=sha('c');},
  x=>{x.dependencies[0].comparedBaseSha=sha('c');},x=>{x.pr.body='Depends-on: #712';},
 ]){const x=aiDependency(aiFixture());change(x);assert.equal(validateIndependentAiReview(x).conclusion,'fail');}
});

test('independent AI gate collector reads actual merge parents/tree, all reviews, current roles and HEAD/BASE twice without Admin or writes',()=>{
 const f=aiDependency(aiFixture()),{api,calls}=aiApi(f);
 const result=collectIndependentAiReview({api,prNumber:712,expectedHeadSha:sha('a'),expectedBaseSha:sha('b'),expectedTreeSha:sha('e')});
 assert.equal(result.conclusion,'pass');assert.equal(result.observations.prAfter.merge_commit_sha,sha('d'));
 assert.equal(calls.filter(p=>p.endsWith('/pulls/712')).length,2);
 assert.equal(calls.filter(p=>p.endsWith('/git/ref/heads/develop')).length,2);
 assert(calls.some(p=>p.endsWith('/git/commits/'+sha('d'))));
 assert(calls.some(p=>p.includes('/collaborators/FurinyaDev/permission')));
 assert(!calls.some(p=>/rulesets|statuses|\/actions\/|\/admin/.test(p)));
});

test('independent AI gate collector detects HEAD/BASE/merge/dependency declaration movement during collection',()=>{
 for(const mutate of [x=>{x.head.sha=sha('c');},x=>{x.base.sha=sha('c');},x=>{x.merge_commit_sha=sha('c');},x=>{x.body='Depends-on: #11';}]){
  const result=aiCollect(aiFixture(),(path,value,count)=>{if(path.endsWith('/pulls/712')&&count.prReads===2)mutate(value);return value;});
  assert.equal(result.conclusion,'fail');assert.match(result.errors.join('\n'),/changed during collection/);
 }
 const moved=aiCollect(aiFixture(),(path,value,count)=>{if(path.endsWith('/git/ref/heads/develop')&&count.targetReads===2)value.object.sha=sha('c');return value;});
 assert.equal(moved.conclusion,'fail');
 for(const field of ['expectedHeadSha','expectedBaseSha','expectedTreeSha']){
  const {api}=aiApi();assert.equal(collectIndependentAiReview({api,prNumber:712,[field]:sha('c')}).conclusion,'fail');
 }
});

test('independent AI gate collector paginates to completion and observes a rejection beyond the first hundred reviews',()=>{
 const f=aiFixture(),valid=f.reviews[0];
 f.reviews=Array.from({length:99},(_,i)=>({...valid,id:i+1,user:{id:999,login:'untrusted'},body:'ordinary review'}));
 f.reviews.push(valid,{...valid,id:101,state:'CHANGES_REQUESTED',submitted_at:'2026-11-17T10:01:00Z',body:'later rejection'});
 const {api,calls}=aiApi(f),result=collectIndependentAiReview({api,prNumber:712});
 assert.equal(result.conclusion,'fail');assert(calls.some(p=>p.endsWith('page=2')));assert.match(result.errors.join('\n'),/trusted reviewer still requests changes/);
 f.reviews.pop();assert.equal(aiCollect(f).conclusion,'pass');
 const duplicate=aiCollect(f,(path,value)=>path.endsWith('page=2')?[valid]:value);
 assert.equal(duplicate.conclusion,'fail');assert.match(duplicate.errors.join('\n'),/duplicate/i);
});

test('independent AI gate collector fails closed on malformed pages, missing permission evidence, API failure or async adapters',()=>{
 for(const modify of [
  (path,value)=>path.includes('/reviews?')?{reviews:value}:value,
  (path,value)=>path.endsWith('/permission')?{}:value,
  (path,value)=>{if(path.endsWith('/permission'))throw Error('permission unavailable');return value;},
 ])assert.equal(aiCollect(aiFixture(),modify).conclusion,'fail');
 assert.equal(collectIndependentAiReview({api:()=>Promise.resolve({}),prNumber:712}).conclusion,'fail');
 const f=aiFixture();f.reviews.push({...f.reviews[0]});assert.equal(validateIndependentAiReview(f).conclusion,'fail');
 f.reviews=[{...f.reviews[0],submitted_at:'invalid timestamp'}];assert.equal(validateIndependentAiReview(f).conclusion,'fail');
});

function nativeFixture(){
 const f=aiFixture();f.repository.allow_auto_merge=true;f.repository.allow_squash_merge=true;f.repository.default_branch='develop';
 f.pr.node_id='PR_712';f.pr.head.ref='feat/native';f.pr.labels=[];
 f.ruleset={id:25870651,target:'branch',enforcement:'active',conditions:{ref_name:{include:['refs/heads/develop'],exclude:[]}},rules:[
  {type:'pull_request',parameters:{required_approving_review_count:1,dismiss_stale_reviews_on_push:true,require_code_owner_review:true,allowed_merge_methods:['squash'],required_review_thread_resolution:true}},
  {type:'merge_queue',parameters:{merge_method:'SQUASH',grouping_strategy:'ALLGREEN'}},{type:'required_linear_history'},
  {type:'required_status_checks',parameters:{strict_required_status_checks_policy:true,required_status_checks:['check','presentation','engineering-posix','inventory','independent-review','pr-quality'].map(context=>({context,integration_id:context==='independent-review'?null:15368}))}}]};
 f.run={id:7,run_attempt:1,head_sha:sha('a'),path:'.github/workflows/quality.yml',event:'pull_request',status:'completed',conclusion:'success',repository:{full_name:aiRepo},pull_requests:[{number:712}]};
 f.jobs=currentFullQualityJobs.map((name,i)=>({id:100+i,name,run_id:7,run_attempt:1,head_sha:sha('a'),status:'completed',conclusion:name==='fast'?'skipped':'success'}));
 f.checkout={schemaVersion:1,event:'pull_request',runId:7,attempt:1,head:sha('a'),base:sha('b'),tested:sha('d'),prNumber:712,parents:[sha('b'),sha('a')]};
 f.artifact={id:42,name:'quality-7-1-check',expired:false,workflow_run:{id:7,head_sha:sha('a')}};
 f.gateRun={id:9,run_attempt:1,event:'workflow_dispatch',head_sha:sha('b'),status:'in_progress',path:'.github/workflows/licenses.yml',repository:f.repository};
 f.proofArtifact={id:99,name:'independent-review-712-'+sha('a').slice(0,12)+'-9-1',expired:false,workflow_run:{id:9,head_sha:sha('b')},digest:'sha256:'+ 'f'.repeat(64)};
 const api=aiApi(f).api,calls=[];
 const query=(...args)=>{
  calls.push(args);const path=args.find(a=>typeof a==='string'&&(/^(repos|repositories)\//).test(a));
  let value;
  if(args.includes('POST')){
   if(path?.endsWith('/dispatches')){f.dispatched=JSON.parse(readFileSync(args[args.indexOf('--input')+1],'utf8'));return '';}
   value={state:'success',context:'independent-review',creator:{id:41898282}};
  }else if(args[1]==='graphql'){
   if(args.some(a=>a.includes('enablePullRequestAutoMerge')))value={data:{enablePullRequestAutoMerge:{pullRequest:{number:712}}}};
   else value={data:{node:{id:'PR_712',number:712,state:'OPEN',baseRefName:'develop',headRefOid:sha('a'),repository:{databaseId:projectRepositoryId,nameWithOwner:aiRepo},isInMergeQueue:false,mergeQueueEntry:null,isMergeQueueEnabled:true,autoMergeRequest:{mergeMethod:'SQUASH'},mergeQueue:{id:'QUEUE',configuration:{mergeMethod:'SQUASH',mergingStrategy:'ALLGREEN'}}}}};
  }else if(path?.endsWith('/rulesets/25870651'))value=f.ruleset;
  else if(path?.includes('/actions/workflows/quality.yml/runs?'))value=[{workflow_runs:[f.run]}];
  else if(path?.includes('/actions/runs/7/jobs?'))value=[{jobs:f.jobs}];
  else if(path?.endsWith('/commits/'+sha('d')))value={...f.sourceCommit,commit:{tree:f.sourceCommit.tree}};
  else if(path?.includes('/contents/.github/CODEOWNERS?'))value={type:'file',sha:sha('c'),content:Buffer.from('* @FurinyaDev @v5g95m7t8m-max\n').toString('base64')};
  else if(path?.endsWith('/git/trees/'+sha('b'))||path?.endsWith('/git/trees/'+sha('d')))value={truncated:false,tree:[{path:'.github',mode:'040000',type:'tree',sha:sha('e')}]};
  else if(path?.endsWith('/git/trees/'+sha('e')))value={truncated:false,tree:[{path:'CODEOWNERS',mode:'100644',type:'blob',sha:sha('c')}]};
  else if(path?.endsWith('/actions/artifacts/99'))value=f.proofArtifact;
  else if(path?.endsWith('/actions/runs/9'))value=f.gateRun;
  else return JSON.stringify(api(path));
  return JSON.stringify(value);
 };
 return Object.assign(f,{query,calls,loadCheckout:()=>({checkout:f.checkout,checkoutArtifact:f.artifact})});
}
test('native merge dry-run requires actual Review and retained policy without Admin or status writes',()=>{
 const f=nativeFixture();assert.equal(armAutoMerge(aiRepo,712,100,f.query,{dryRun:true}).state,'eligible');
 assert(f.calls.every(args=>!args.includes('POST')&&args[1]!=='graphql'));
 assert.throws(()=>armAutoMerge(aiRepo,712,{reviewId:'local-pass'},f.query),/server-side Review/);
 for(const mutate of [f=>f.ruleset.rules[0].parameters.required_approving_review_count=0,f=>f.ruleset.rules[0].parameters.dismiss_stale_reviews_on_push=false,f=>f.ruleset.rules[0].parameters.require_code_owner_review=false,f=>f.ruleset.rules[3].parameters.strict_required_status_checks_policy=false,f=>f.ruleset.rules[1].parameters.merge_method='MERGE',f=>f.ruleset.rules[3].parameters.required_status_checks.pop(),f=>f.ruleset.bypass_actors=[{actor_id:1}]]){
  const bad=nativeFixture();mutate(bad);assert.throws(()=>armAutoMerge(aiRepo,712,100,bad.query));assert(!bad.calls.some(a=>a.includes('POST')));
 }
});
test('native enable dispatches the existing gate and records an intent rather than manufacturing preflight',()=>{
 const f=nativeFixture(),r=armAutoMerge(aiRepo,712,100,f.query);
 assert.equal(r.state,'auto-merge-requested');assert.equal(r.proof.schemaVersion,9);assert.equal(r.proof.nativeAuto.confirmed,true);assert.equal(r.proof.gateRef,'refs/heads/develop');
 assert.equal(f.dispatched.inputs.ai_review_mode,'publish');assert(!('fullPreflight' in r.proof));
 assert(!f.calls.some(a=>a.some(v=>typeof v==='string'&&v.includes('/statuses/'))));
 const shadow=nativeFixture();shadow.ruleset.rules[0].parameters.required_approving_review_count=0;assert.equal(armAutoMerge(aiRepo,712,100,shadow.query,{shadow:true}).state,'shadow-requested');assert(!shadow.calls.some(a=>a[1]==='graphql'));
 const broken=nativeFixture();broken.run.conclusion='failure';assert.throws(()=>armAutoMerge(aiRepo,712,100,broken.query),/formal Quality/);assert(!broken.calls.some(a=>a.includes('POST')));
});
function gateExecute(f,{mode='publish',release=false,mutateEnv=()=>{},saved,proofFile}={}){
 const dir=mkdtempSync(join(tmpdir(),'native-gate-test-')),event=join(dir,'event.json');writeFileSync(event,'{}');
 const file=proofFile??join(dir,'proof.json');if(saved)writeFileSync(file,JSON.stringify(saved));
 const env={GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_EVENT_PATH:event,GITHUB_REPOSITORY:aiRepo,GITHUB_REPOSITORY_ID:String(projectRepositoryId),GITHUB_SHA:sha('b'),GITHUB_REF:'refs/heads/develop',GITHUB_RUN_ID:'9',GITHUB_RUN_ATTEMPT:'1',AI_REVIEW_PR:'712',AI_REVIEW_HEAD:sha('a'),AI_REVIEW_MODE:mode,AI_REVIEW_ARTIFACT_ID:'99'};mutateEnv(env);
 try{const result=independentReviewGate(env,f.query,{release,loadCheckout:f.loadCheckout,proofFile:file});return {result,proof:JSON.parse(readFileSync(file,'utf8'))};}finally{rmSync(dir,{recursive:true,force:true});}
}
test('CI native review gate uploads genuine preflight before releasing a truthful Required status',()=>{
 const f=nativeFixture(),prepared=gateExecute(f);assert.equal(prepared.result.state,'pr_passed');assert.equal(prepared.proof.preflight.schemaVersion,3);
 assert(!f.calls.some(a=>a.includes('POST')));
 const released=gateExecute(f,{release:true,saved:prepared.proof});assert.equal(released.result.state,'published');assert.equal(released.result.artifactId,99);
 assert(f.calls.some(a=>a.includes('POST')&&a.includes('context=independent-review')));
});
test('shadow cannot publish and stale approval, policy, CI, artifact or untrusted source fails closed',()=>{
 const shadow=nativeFixture(),s=gateExecute(shadow,{mode:'shadow'});assert.equal(s.result.state,'shadow_verified');
 gateExecute(shadow,{mode:'shadow',release:true,saved:s.proof});assert(!shadow.calls.some(a=>a.includes('POST')));
 for(const mutate of [f=>f.ruleset.rules[0].parameters.required_approving_review_count=0,f=>f.reviews[0].state='COMMENTED',f=>f.run.conclusion='failure',f=>f.jobs[0].conclusion='failure']){
  const f=nativeFixture();mutate(f);assert.throws(()=>gateExecute(f));assert(!f.calls.some(a=>a.includes('POST')));
 }
 const f=nativeFixture(),p=gateExecute(f).proof;f.proofArtifact.expired=true;assert.throws(()=>gateExecute(f,{release:true,saved:p}),/artifact/);assert(!f.calls.some(a=>a.includes('POST')));
 assert.throws(()=>gateExecute(nativeFixture(),{mutateEnv:e=>e.GITHUB_REF='refs/heads/untrusted'}),/trusted default/);
});
test('gate-only workflow keeps Required inventory distinct and uses a separate concurrency group',()=>{
 const text=readFileSync(new URL('../.github/workflows/licenses.yml',import.meta.url),'utf8');
 assert.match(text,/license-audit-not-requested/);assert.match(text,/format\('ai-review-/);assert.match(text,/statuses: write/);
 assert(text.indexOf('--independent-review')<text.indexOf('id: proof'));assert(text.indexOf('id: proof')<text.indexOf('--release-independent-review'));
});

test('native gate retains CODEOWNERS in the reviewed merge tree and never silently re-enters bootstrap',()=>{
 for(const target of ['base','reviewed']){
  const f=nativeFixture(),normal=f.query;
  f.query=(...args)=>{
   const path=args.at(-1);
   if(typeof path==='string'&&path.endsWith('/contents/.github/CODEOWNERS?ref='+ (target==='base'?sha('b'):sha('d')))){
    if(target==='base')throw Error('HTTP 404: Not Found');
    return JSON.stringify({type:'file',content:Buffer.from('* @attacker').toString('base64')});
   }
   return normal(...args);
  };
  assert.throws(()=>gateExecute(f),/CODEOWNERS|bootstrap/);assert(!f.calls.some(a=>a.includes('POST')));
 }
});
test('rerun proof names bind the immutable gate run and attempt without overwriting earlier evidence',()=>{
 const f=nativeFixture(),p=gateExecute(f).proof;
 f.proofArtifact.name=f.proofArtifact.name.replace('-9-1','-9-2');
 assert.throws(()=>gateExecute(f,{release:true,saved:p}),/artifact/);assert(!f.calls.some(a=>a.includes('POST')));
});
test('native mutation reply loss is recovered only by exact server-side auto/queue readback',()=>{
 const f=nativeFixture(),normal=f.query,records=[];
 f.query=(...args)=>{if(args[1]==='graphql'&&args.some(a=>a.includes('enablePullRequestAutoMerge')))throw Error('EOF after server commit');return normal(...args);};
 const result=armAutoMerge(aiRepo,712,100,f.query,{persist:r=>records.push(structuredClone(r))});
 assert.equal(result.proof.nativeAuto.confirmed,true);assert.equal(records[0].proof.nativeAuto.confirmed,false);assert.equal(records.at(-1).state,'auto-merge-requested');
 assert(!f.calls.some(a=>a.some(v=>typeof v==='string'&&v.includes('/statuses/'))));
});
test('activation readback failure or changed combination cancels native intent and preserves uncertainty',()=>{
 for(const scenario of ['readback-fails','head-changes','base-changes','cleanup-unreadable']){
  const f=nativeFixture(),normal=f.query,records=[];let enabled=false,failedOnce=false,disabled=false;
  f.query=(...args)=>{
   if(args[0]==='pr'){assert(args.includes('--disable-auto'));disabled=true;return '';}
   if(args[1]==='graphql'){
    if(args.some(a=>a.includes('enablePullRequestAutoMerge'))){enabled=true;if(scenario==='head-changes')f.pr.head.sha=sha('f');if(scenario==='base-changes')f.pr.base.sha=sha('f');}
    const parsed=JSON.parse(normal(...args));if(parsed.data?.node){parsed.data.node.headRefOid=f.pr.head.sha;if(disabled)parsed.data.node.autoMergeRequest=null;}return JSON.stringify(parsed);
   }
   if(enabled&&args.at(-1)==='repos/'+aiRepo+'/pulls/712'){
    if(scenario==='cleanup-unreadable'||scenario==='readback-fails'&&!failedOnce){failedOnce=true;throw Error('readback unavailable');}
    return JSON.stringify({...f.pr,auto_merge:disabled?null:{merge_method:'squash'}});
   }
   return normal(...args);
  };
  assert.throws(()=>armAutoMerge(aiRepo,712,100,f.query,{persist:r=>records.push(structuredClone(r))}),scenario==='cleanup-unreadable'?/cancellation uncertain/:/changed|unavailable/);
  assert.equal(records[0].state,'prepared');assert.equal(records.at(-1).state,'activation-failed');assert.equal(records.at(-1).proof.nativeAuto.confirmed,false);
  assert.equal(disabled,scenario!=='cleanup-unreadable');assert.equal(records.at(-1).cleanup.length,scenario==='cleanup-unreadable'?1:0);
 }
});

test('explicit bootstrap requires the two native collaborators, exact approved source and retained final owners',()=>{
 const make=(third=false)=>{
  const f=nativeFixture(),normal=f.query;
  f.query=(...args)=>{
   const path=args.at(-1);
   if(path==='repos/'+aiRepo+'/contents/.github/CODEOWNERS?ref='+sha('b'))throw Error('HTTP 404 Not Found');
   if(typeof path==='string'&&path.includes('/collaborators?'))return JSON.stringify([{id:111138384,permissions:{admin:true}},{id:337201427,permissions:{maintain:true}},...(third?[{id:1,permissions:{push:true}}]:[])]);
   return normal(...args);
  };return f;
 };
 const bootstrap=e=>{e.AI_REVIEW_BOOTSTRAP='true';e.GITHUB_REF='refs/heads/feat/native';e.GITHUB_SHA=sha('a');};
 assert.equal(gateExecute(make(),{mutateEnv:bootstrap}).result.state,'pr_passed');
 assert.throws(()=>gateExecute(make(true),{mutateEnv:bootstrap}),/two existing trusted/);
 assert.throws(()=>gateExecute(make(),{mutateEnv:e=>{bootstrap(e);e.GITHUB_SHA=sha('f');}}),/exact approved/);
 assert.throws(()=>gateExecute(nativeFixture(),{mutateEnv:bootstrap}),/before CODEOWNERS/);
});
test('a hold added during artifact collection prevents the CI gate from releasing success',()=>{
 const f=nativeFixture(),load=f.loadCheckout;f.loadCheckout=()=>{const result=load();f.pr.labels=[{name:'hold'}];return result;};
 assert.throws(()=>gateExecute(f),/admission changed/);assert(!f.calls.some(a=>a.includes('POST')));
});

test('CODEOWNERS text returned through a symlink cannot masquerade as a native review anchor',()=>{
 const f=nativeFixture(),normal=f.query;
 f.query=(...args)=>args.at(-1)==='repos/'+aiRepo+'/git/trees/'+sha('e')?JSON.stringify({truncated:false,tree:[{path:'CODEOWNERS',mode:'120000',type:'blob',sha:sha('c')}]}):normal(...args);
 assert.throws(()=>gateExecute(f),/regular native blob/);assert(!f.calls.some(a=>a.includes('POST')));
});
test('only each trusted actors latest active decisive review can request changes',()=>{
 const f=aiFixture(),other={id:337201427,login:'v5g95m7t8m-max'};
 f.permissions[other.id]={permission:'write',role_name:'maintain',user:other};
 f.reviews.push({...f.reviews[0],id:101,user:other,state:'CHANGES_REQUESTED',body:'Fix issue',submitted_at:'2026-11-17T10:01:00Z'});
 assert.equal(validateIndependentAiReview(f).conclusion,'fail');
 f.reviews.push({...f.reviews[1],id:102,state:'COMMENTED',body:'Discussion',submitted_at:'2026-11-17T10:02:00Z'});
 assert.equal(validateIndependentAiReview(f).conclusion,'fail');
 f.reviews.push({...f.reviews[1],id:103,state:'APPROVED',body:'Verified fix',submitted_at:'2026-11-17T10:03:00Z'});
 assert.equal(validateIndependentAiReview(f).conclusion,'pass');
 f.reviews.push({...f.reviews[1],id:104,state:'CHANGES_REQUESTED',submitted_at:'2026-11-17T10:04:00Z'});
 assert.equal(validateIndependentAiReview(f).conclusion,'fail');
});
