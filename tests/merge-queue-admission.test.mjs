import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {main} from '../scripts/publish-merge-group.mjs';
import {collectQueueAdmission} from '../scripts/merge-queue-admission.mjs';

import {admissionFixture,admissionQuery,uninstalledReviewBase} from './helpers/merge-queue-admission.mjs';
import {queueRulesFingerprint} from '../scripts/merge-queue-policy.mjs';
const sha=c=>c.repeat(40);
function execute(f,query=admissionQuery(f),options){
 const dir=mkdtempSync(join(tmpdir(),'queue-admission-'));
 try{f.env.GITHUB_EVENT_PATH=join(dir,'event.json');writeFileSync(f.env.GITHUB_EVENT_PATH,JSON.stringify(f.event));
  return main(f.env,query,options);
 }finally{rmSync(dir,{recursive:true,force:true});}
}
test('renamed native queue uses only its current canonical routes and pinned repository ID',()=>{
 const repo='FurinyaWorks/Slay-the-Heavens',f=admissionFixture(repo),writes=[],query=admissionQuery(f,writes);
 assert.equal(execute(f,(...args)=>{
  for(const value of args)if(typeof value==='string'&&value.startsWith('repos/'))assert(value.startsWith('repos/'+repo+'/'));
  if(args[1]==='graphql')assert(args.some(arg=>arg.includes('name:"Slay-the-Heavens"')));
  for(const value of args)if(typeof value==='string'&&value.startsWith('target_url='))assert(value.includes('/'+repo+'/'));
  return query(...args);
 }).state,'success');
 assert.equal(writes.filter(row=>row.state==='success').length,3);
 for(const mutate of [f=>f.event.repository.id=1,f=>f.env.GITHUB_REPOSITORY='FurinyaWorks/Slay-the-Abyss',
  f=>f.repository.databaseId=1,f=>f.pr.head.repo.id=1]){
  const invalid=admissionFixture(repo),writes=[];mutate(invalid);
  assert.throws(()=>execute(invalid,admissionQuery(invalid,writes)));
  assert.deepEqual(writes,[]);
 }
});
test('real checkout loader accepts only the effective receipt execution attempt',()=>{
 const valid=admissionFixture();assert.equal(execute(valid).state,'success');
 for(const attempt of [undefined,0,99]){
  const f=admissionFixture(),writes=[];f.checkout.attempt=attempt;
  assert.throws(()=>execute(f,admissionQuery(f,writes)),/receipt|artifact|attempt/i);
  assert.deepEqual(writes,[]);
 }
});

test('redacted bypass metadata needs no Admin attestation when existing native protections and a real trusted coordinator Review are present',()=>{
 const f=admissionFixture();
 delete f.ruleset.bypass_actors;
 assert.equal(execute(f).state,'success');
});

test('independent cloud AI attestation binds the trusted signer and exact combination before and after receipt download',()=>{
 for(const mutate of [
  f=>f.ruleset.id=7,f=>f.ruleset.bypass_actors=null,f=>f.ruleset.bypass_actors=[{actor_id:51}],
  f=>f.review.state='PENDING',f=>f.review.state='DISMISSED',f=>f.review.commit_id=sha('d'),
  f=>f.review.body='unstructured pass',f=>f.report.conclusion='fail',f=>f.report.unresolved=['bug'],
  f=>f.report.reviewedBaseSha=sha('d'),f=>f.report.reviewedTreeSha=sha('f'),
  f=>f.report.coordinator.id=111138384,f=>f.report.coordinator.verifiedActualSessions=false,
  f=>f.report.reviewerAgent=f.report.implementationAgents[0],
  f=>f.review.user={id:52,login:'impostor'},f=>f.sourceCommit.parents.reverse(),
  f=>f.permission.role_name='write',f=>f.permission.permission='read',
  f=>delete f.permission.user,f=>f.permission.user.id=52,f=>f.permission.user.login='other'
 ])for(const duringDownload of [false,true]){
  const f=admissionFixture(),writes=[];delete f.ruleset.bypass_actors;
  const receipt={checkout:structuredClone(f.checkout),checkoutArtifact:structuredClone(f.artifact)};
  if(!duringDownload)mutate(f);
  assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
   if(duringDownload)mutate(f);return receipt;
  }}),undefined,String(mutate));assert.deepEqual(writes,[],String(mutate));
 }
});

test('queue snapshots use the real signed AI Review and leave enqueue authority to native GitHub',()=>{
 const f=admissionFixture(),calls=[],query=admissionQuery(f);
 delete f.ruleset.bypass_actors;
 const collect=()=>JSON.parse(collectQueueAdmission(f.event,f.env,(...args)=>{calls.push(args);return query(...args);},f.ruleset));
 const [snapshot]=collect();
 assert.equal(snapshot.githubReviewId,90);assert.equal(Object.hasOwn(snapshot,'nativeApprovalReviewId'),false);
 assert.equal(snapshot.coordinator.id,337201427);assert.equal(snapshot.reviewedHead,f.pr.head.sha);
 assert.equal(snapshot.reviewedBase,f.pr.base.sha);assert.equal(snapshot.reviewedTree,f.report.reviewedTreeSha);
 assert.equal(snapshot.reviewedMergeCommit,f.pr.merge_commit_sha);
 assert.equal(Object.hasOwn(snapshot,'rulesFingerprint'),false);
 assert(calls.some(args=>args.some(value=>String(value).includes('/commits/')&&String(value).includes('/statuses?'))));
 assert.deepEqual(snapshot.gateProof,{artifactId:80,digest:f.proofArtifact.digest,runId:60,attempt:1,statusId:92,ref:'refs/heads/develop',githubReviewId:90,reviewId:f.report.provenance.reviewId});
 for(const enqueuer of [undefined,{databaseId:52,login:'native-writer'}]){
  f.entry.enqueuer=enqueuer;assert.equal(collect()[0].githubReviewId,90);
 }
 assert(!calls.some(args=>args.some(value=>String(value).includes('/collaborators/native-'))));
});

test('legacy policy digest remains byte-compatible without authorizing the native review path',()=>{
 const f=admissionFixture(),full=f.ruleset;
 const reversed=Object.fromEntries(Object.entries(full).reverse());
 assert.equal(queueRulesFingerprint(full),queueRulesFingerprint(reversed));
 assert.equal(queueRulesFingerprint(full),queueRulesFingerprint({...full,updated_at:'2026-11-04T09:51:23.025Z'}),
  'real public and privileged API timezone renderings identify the same policy instant');
 const redacted=structuredClone(full);delete redacted.bypass_actors;
 assert.throws(()=>queueRulesFingerprint(redacted),/explicitly empty bypass/);
 assert.equal(queueRulesFingerprint(redacted,{allowRedacted:true}),queueRulesFingerprint(full));
 for(const bypass_actors of [undefined,null,[{}],{}])
  assert.throws(()=>queueRulesFingerprint({...full,bypass_actors},{allowRedacted:true}),/bypass/);
 for(const updated_at of [null,'','1','2026-11-04','2026-11-04T09:51:23','not-a-date'])
  assert.throws(()=>queueRulesFingerprint({...full,updated_at}),/versioned/);
});

test('missing collaborator metadata evidence cannot publish queue gates',()=>{
 const f=admissionFixture(),writes=[],query=admissionQuery(f,writes);
 assert.throws(()=>execute(f,(...args)=>{
  if(args.some(arg=>arg.includes('/collaborators/')))throw Error('HTTP 403 metadata unavailable');
  return query(...args);
 }),/403/);
 assert.deepEqual(writes,[]);
});
test('queue release rejects paused, held, changed dependency and stale-base PR authorization',()=>{
 for(const mutate of [
  f=>f.review.state='DISMISSED',f=>f.report.provenance.reviewId='',
  f=>f.report.reviewedBaseSha=sha('d'),
  f=>f.pr.labels=[{name:'hold'}],f=>f.pr.body='Depends-on: #999',
  f=>f.pr.body='Depends-on: none\nDepends-on: #999',
  f=>f.pr.draft=true,f=>f.pr.head.sha=sha('d'),f=>f.pr.base.sha=sha('d'),
  f=>f.repository.ref.target.oid=sha('d'),f=>f.repository.databaseId=7,
  f=>f.repository.mergeQueue.entries.nodes=[],
  f=>f.repository.mergeQueue.entries.pageInfo.hasNextPage=true,
  f=>f.entry.headCommit.oid=sha('d'),f=>f.entry.pullRequest.mergeQueueEntry=null
 ]){
  const f=admissionFixture(),writes=[];mutate(f);
  assert.throws(()=>execute(f,admissionQuery(f,writes)),undefined,String(mutate));
  assert.deepEqual(writes,[],String(mutate));
 }
});
test('queue release rechecks protection and PR admission after downloading immutable evidence',()=>{
 for(const mutate of [f=>f.ruleset.bypass_actors=[{actor_id:9}],
  f=>f.review.state='DISMISSED',f=>f.pr.labels=[{name:'hold'}],
  f=>f.repository.mergeQueue.entries.nodes=[]]){
  const f=admissionFixture(),writes=[];
  assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
   const result={checkout:structuredClone(f.checkout),checkoutArtifact:structuredClone(f.artifact)};
   mutate(f);return result;
  }}));
  assert.deepEqual(writes,[]);
 }
});
test('queue release refuses policy combinations that differ from staged rollout',()=>{
 for(const parameters of [{merge_method:'MERGE',grouping_strategy:'ALLGREEN'},
  {merge_method:'SQUASH',grouping_strategy:'HEADGREEN'},undefined]){
  const f=admissionFixture(),writes=[];f.ruleset.rules[0].parameters=parameters;
  assert.throws(()=>execute(f,admissionQuery(f,writes)),/Queue|queue/);
  assert.deepEqual(writes,[]);
 }
});
test('queue release preserves Strict, squash-only PRs, resolved threads and linear history',()=>{
 for(const mutate of [f=>f.ruleset.rules[1].parameters.strict_required_status_checks_policy=false,
  f=>f.ruleset.rules=f.ruleset.rules.filter(r=>r.type!=='pull_request'),
  f=>f.ruleset.rules=f.ruleset.rules.filter(r=>r.type!=='required_linear_history'),
  f=>f.ruleset.rules[2].parameters.allowed_merge_methods.push('merge'),
  f=>f.ruleset.rules[2].parameters.required_review_thread_resolution=false]){
  for(const duringDownload of [false,true]){
   const f=admissionFixture(),writes=[],receipt={checkout:structuredClone(f.checkout),checkoutArtifact:structuredClone(f.artifact)};
   if(!duringDownload)mutate(f);
   assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
    if(duringDownload)mutate(f);return receipt;
   }}),undefined,String(mutate));
   assert.deepEqual(writes,[]);
  }
 }
});
test('downloaded receipt parents must equal the actual queue commit parent vector',()=>{
 for(const parents of [[],[sha('d')],[sha('b'),sha('d')]]){
  const f=admissionFixture(),writes=[];f.checkout.parents=parents;
  assert.throws(()=>execute(f,admissionQuery(f,writes)),/parent/i);
  assert.deepEqual(writes,[]);
 }
});

test('Fast queue admission rechecks the latest PR run/attempt before and after receipt download',()=>{
 for(const mutate of [()=>{},f=>f.qualityStatus.state='pending',f=>f.prRun.conclusion='cancelled',
  f=>f.prRun.status='in_progress',f=>f.prRun.run_attempt++,f=>f.prRun.id++,
  f=>f.qualityStatus.creator.id=1,f=>f.qualityStatus.target_url='https://github.com/old',
  f=>f.qualityStatus.description='Exact dual-platform Fast run 9, attempt 0']){
  for(const duringDownload of [false,true]){
   const f=admissionFixture(),writes=[];
   f.ruleset.rules[1].parameters.required_status_checks.find(c=>c.context==='full-quality').context='pr-quality';
   f.prRun={id:61,run_attempt:1,head_sha:f.pr.head.sha,event:'pull_request',path:'.github/workflows/quality.yml',
    status:'completed',conclusion:'success',repository:{full_name:'FurinyaWorks/Slay-the-Abyss'},pull_requests:[{number:510}]};
   f.qualityStatus={id:91,context:'pr-quality',state:'success',creator:{id:41898282,login:'github-actions[bot]'},
    target_url:'https://github.com/FurinyaWorks/Slay-the-Abyss/actions/runs/61',description:'Exact dual-platform Fast run 61, attempt 1'};
   const underlying=admissionQuery(f,writes),query=(...args)=>{
    const endpoint=args.at(-1);
    if(endpoint.includes('/statuses?'))return JSON.stringify([[f.proofStatus,f.qualityStatus]]);
    if(endpoint.includes('/actions/workflows/')&&endpoint.includes('event=pull_request'))return JSON.stringify([{workflow_runs:[f.prRun]}]);
    return underlying(...args);
   };
   const receipt={checkout:structuredClone(f.checkout),checkoutArtifact:structuredClone(f.artifact)};
   if(!duringDownload)mutate(f);
   const run=()=>execute(f,query,{loadCheckout:()=>{if(duringDownload)mutate(f);return receipt;}});
   if(mutate.toString()==='()=>{}')assert.equal(run().state,'success');
   else{assert.throws(run,/admission|changed/);assert.deepEqual(writes,[]);}
  }
 }
});


test('automatic cloud review and queue release preserve existing zero-human-review policy without CODEOWNERS migration',()=>{
 const f=admissionFixture(),writes=[];
 assert.equal(f.pr.user.id,f.review.user.id);assert.equal(f.review.state,'COMMENTED');
 assert.equal(f.ruleset.rules[2].parameters.required_approving_review_count,0);
 assert.equal(f.ruleset.rules[2].parameters.require_code_owner_review,false);
 assert.equal(execute(f,admissionQuery(f,writes)).state,'success');
 assert.equal(writes.filter(row=>row.state==='success').length,3);
 for(const field of ['required_approving_review_count','dismiss_stale_reviews_on_push','require_code_owner_review'])delete f.ruleset.rules[2].parameters[field];
 assert.equal(execute(f).state,'success');
});

test('visible policy changes during receipt verification cannot be hidden by an old matching approval',()=>{
 const f=admissionFixture(),writes=[];
 assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
  f.ruleset.rules[0].parameters.check_response_timeout_minutes=121;
  return {checkout:f.checkout,checkoutArtifact:f.artifact};
 }}),/protection changed/);assert.deepEqual(writes,[]);
});

test('valid AI report or signer-role changes cannot replace the exact observed authorization during receipt verification',()=>{
 for(const mutate of [f=>f.report.provenance.sessionId+='-changed',f=>f.report.implementationAgents=['/root/another_implementer'],
  f=>{f.permission.role_name='admin';f.permission.permission='admin';}]){
  const f=admissionFixture(),writes=[];
  assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
   mutate(f);return {checkout:f.checkout,checkoutArtifact:f.artifact};
  }}),/authorization changed|proof differs/);assert.deepEqual(writes,[]);
 }
});

test('queue release consumes the real immutable PR source-gate proof before publishing any success',()=>{
 for(const mutate of [
  f=>delete f.proofStatus,f=>f.proofStatus.state='pending',f=>f.proofStatus.creator.id=1,
  f=>f.proofStatus.description=f.proofStatus.description.replace('AI review 90','AI review 91'),
  f=>f.proofStatus.description=f.proofStatus.description.replace('[proof:80]','[proof:81]'),
  f=>f.proofStatus.description=f.proofStatus.description.replace(f.pr.base.sha,sha('f')),
  f=>f.proofArtifact.id=81,f=>f.proofArtifact.expired=true,f=>f.proofArtifact.name+='-replaced',
  f=>f.proofRun.run_attempt++,f=>f.proofRun.status='in_progress',f=>f.proofRun.conclusion='failure',
  f=>f.proofRun.head_sha=f.pr.head.sha,f=>f.proofRun.repository.id=1,
  f=>f.proof.mode='shadow',f=>f.proof.preflight.jobs.pop(),
  f=>f.proof.nativeReview.githubReviewId++,f=>f.proof.nativeReview.report.provenance.sessionId+='-forged'
 ])for(const duringReceipt of [false,true]){
  const f=admissionFixture(),writes=[];if(!duringReceipt)mutate(f);
  assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
   if(duringReceipt)mutate(f);return {checkout:f.checkout,checkoutArtifact:f.artifact};
  }}),undefined,String(mutate));assert.deepEqual(writes,[],String(mutate));
 }
});
test('queue source proof bootstrap requires explicit uninstalled BASE authorization and the actual attesting dispatcher',()=>{
 function fixture(base=sha('b')){
  const f=admissionFixture('FurinyaWorks/Slay-the-Heavens',base);
  f.report.installBaseSha=base;f.proof.nativeReview.report.installBaseSha=base;f.installation=uninstalledReviewBase(base);
  f.proof.nativeReview.observations.reviews[0].body='<!-- independent-ai-review:v1 -->\n'+JSON.stringify(f.proof.nativeReview.report);
  f.proof.gate.ref='refs/heads/'+f.pr.head.ref;f.proof.gate.bootstrap=true;
  f.proofRun.head_branch=f.pr.head.ref;f.proofRun.head_sha=f.pr.head.sha;f.proofArtifact.workflow_run.head_sha=f.pr.head.sha;
  f.proofRun.actor={id:f.review.user.id};f.proofRun.triggering_actor={id:f.review.user.id};return f;
 }
 assert.equal(execute(fixture()).state,'success');
 assert.equal(execute(fixture(sha('f'))).state,'success');
 for(const mutate of [f=>delete f.proof.nativeReview.report.installBaseSha,
  f=>f.installation.scripts.tree.push({path:'independent-ai-review.mjs',mode:'120000',type:'blob',sha:sha('9')}),
  f=>delete f.proofRun.actor,f=>delete f.proofRun.triggering_actor,
  f=>f.proofRun.actor.id=111138384,f=>f.proofRun.triggering_actor.id=111138384,
  f=>f.proofRun.event='workflow_run',f=>f.proofRun.head_branch='other']){
  const f=fixture(),writes=[];mutate(f);assert.throws(()=>execute(f,admissionQuery(f,writes)));assert.deepEqual(writes,[]);
 }
});
test('pending group publication does not race an in-progress PR proof while final success requires completed proof',()=>{
 const f=admissionFixture(),writes=[];f.proofRun.status='in_progress';f.proofRun.conclusion=null;
 assert.equal(execute(f,admissionQuery(f,writes),{pending:true}).state,'pending');
 assert.deepEqual(writes.map(row=>row.state),['pending','pending','pending']);
 writes.length=0;assert.throws(()=>execute(f,admissionQuery(f,writes)));assert.deepEqual(writes,[]);
});

test('a newly valid artifact or status cannot replace the exact PR gate proof during group receipt verification',()=>{
 for(const mutate of [
  f=>{f.proofArtifact.id=82;f.proofStatus.id++;f.proofStatus.description=f.proofStatus.description.replace('[proof:80]','[proof:82]');},
  f=>f.proofStatus.id++,f=>f.proofArtifact.digest='sha256:'+'1'.repeat(64)
 ]){
  const f=admissionFixture(),writes=[];
  assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
   mutate(f);return {checkout:f.checkout,checkoutArtifact:f.artifact};
  }}),/authorization changed/);assert.deepEqual(writes,[]);
 }
});

test('a newly successful formal run or attempt cannot reuse the old source-gate preflight proof',()=>{
 for(const replaceRun of [false,true])for(const duringReceipt of [false,true]){
  const f=admissionFixture(),writes=[];
  f.ruleset.rules[1].parameters.required_status_checks.find(c=>c.context==='full-quality').context='pr-quality';
  f.prRun=structuredClone(f.proof.preflight.run);
  f.qualityStatus={id:93,context:'pr-quality',state:'success',creator:{id:41898282,login:'github-actions[bot]'},
   target_url:`https://github.com/${f.env.GITHUB_REPOSITORY}/actions/runs/61`,description:'Exact Full run 61, attempt 1'};
  const underlying=admissionQuery(f,writes),query=(...args)=>{
   const endpoint=args.at(-1);
   if(endpoint.includes('/actions/workflows/')&&endpoint.includes('event=pull_request'))return JSON.stringify([{workflow_runs:[f.prRun]}]);
   return underlying(...args);
  };
  const freshSuccess=()=>{
   if(replaceRun)f.prRun.id++;else f.prRun.run_attempt++;
   f.qualityStatus.id++;
   f.qualityStatus.target_url=`https://github.com/${f.env.GITHUB_REPOSITORY}/actions/runs/${f.prRun.id}`;
   f.qualityStatus.description=`Exact Full run ${f.prRun.id}, attempt ${f.prRun.run_attempt}`;
  };
  if(!duringReceipt)freshSuccess();
  assert.throws(()=>execute(f,query,{loadCheckout:()=>{
   if(duringReceipt)freshSuccess();return {checkout:f.checkout,checkoutArtifact:f.artifact};
  }}),/proof.*formal|formal.*proof/);assert.deepEqual(writes,[]);
 }
});

function legacyAdmissionFixture(){
 const f=admissionFixture('FurinyaWorks/Slay-the-Heavens'),admin={id:111138384,login:'FurinyaDev'};
 f.reviews=[];f.headInstallation.scripts.tree=f.headInstallation.scripts.tree.filter(row=>row.path!=='independent-ai-review.mjs');
 f.entry.enqueuer={databaseId:admin.id,login:admin.login};f.permission={permission:'admin',role_name:'admin',user:admin};
 f.ruleset.rules[1].parameters.required_status_checks.find(row=>row.context==='full-quality').context='pr-quality';
 f.proofStatus={id:59139120357,context:'independent-review',state:'success',target_url:null,creator:admin,
  description:`opencode-independen [rules:${queueRulesFingerprint(f.ruleset)}] [base:${f.pr.base.sha}]`};
 f.prRun=structuredClone(f.proof.preflight.run);
 f.qualityStatus={id:93,context:'pr-quality',state:'success',creator:{id:41898282,login:'github-actions[bot]'},
  target_url:`https://github.com/${f.env.GITHUB_REPOSITORY}/actions/runs/61`,description:'Exact Full run 61, attempt 1'};
 return f;
}
test('unmigrated legacy queue members retain the original exact rules/BASE enqueuer-admin authorization and current Full',()=>{
 const f=legacyAdmissionFixture(),writes=[];f.pr.merge_commit_sha=null;
 f.reviews=[{id:5,user:{id:999,login:'ordinary'},state:'COMMENTED',body:'An ordinary historical review'}];
 const snapshot=JSON.parse(collectQueueAdmission(f.event,f.env,admissionQuery(f),f.ruleset))[0];
 assert.equal(snapshot.authorizationKind,'legacy');assert.equal(snapshot.review,f.proofStatus.id);
 assert.equal(snapshot.rulesFingerprint,queueRulesFingerprint(f.ruleset));assert.equal(snapshot.enqueuer,111138384);
 assert.equal(snapshot.moduleEvidence.head.installed,false);assert.equal(snapshot.moduleEvidence.mergeBase.installed,false);
 assert.equal(snapshot.moduleEvidence.mergeBase.commit,f.pr.base.sha);
 assert.deepEqual(snapshot.quality,{status:93,run:61,attempt:1});assert(!Object.hasOwn(snapshot,'gateProof'));
 assert.equal(execute(f,admissionQuery(f,writes)).state,'success');assert.equal(writes.filter(row=>row.state==='success').length,3);
});
test('legacy authorization cannot bypass its original latest-status, actual enqueuer, current admin or formal CI controls',()=>{
 for(const mutate of [
  f=>f.proofStatus.state='failure',f=>f.proofStatus.creator={id:52,login:'other'},
  f=>f.proofStatus.description=f.proofStatus.description.replace(f.pr.base.sha,sha('f')),
  f=>f.proofStatus.description=f.proofStatus.description.replace(queueRulesFingerprint(f.ruleset),'0'.repeat(64)),
  f=>f.entry.enqueuer.databaseId=52,f=>f.permission.permission='write',f=>f.permission.user.id=52,
  f=>f.qualityStatus.state='pending',f=>f.prRun.run_attempt++,f=>f.prRun.conclusion='failure',
  f=>f.pr.body='Depends-on: #999'
 ])for(const duringReceipt of [false,true]){
  const f=legacyAdmissionFixture(),writes=[];if(!duringReceipt)mutate(f);
  assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
   if(duringReceipt)mutate(f);return {checkout:f.checkout,checkoutArtifact:f.artifact};
  }}),undefined,String(mutate));assert.deepEqual(writes,[]);
 }
});
test('any real trusted marker forces the new path and never falls back after a failed, invalid, stale or dismissed cloud review',()=>{
 for(const patch of [{state:'COMMENTED'},{state:'DISMISSED'},{state:'CHANGES_REQUESTED'},
  {commit_id:sha('f')},{body:'<!-- independent-ai-review:v1 -->\n{invalid-json'},
  {body:'quoted malformed report: <!-- independent-ai-review:v1 --> {}'}]){
  const f=legacyAdmissionFixture(),writes=[];
  f.report.coordinator={...f.permission.user,verifiedActualSessions:true};
  const row={...f.review,user:f.permission.user,body:'<!-- independent-ai-review:v1 -->\n'+JSON.stringify(f.report),...patch};
  f.reviews=[row];
  assert.throws(()=>execute(f,admissionQuery(f,writes)),/attestation|proof/);assert.deepEqual(writes,[]);
 }
 const demoted=legacyAdmissionFixture();demoted.reviews=[{...demoted.review,body:'<!-- independent-ai-review:v1 -->\n{}'}];
 assert.throws(()=>execute(demoted),/attestation/,'a fixed trusted marker cannot downgrade when its signer role no longer matches');
});
test('an installed HEAD or inherited merge-base module forbids deleting the gate to regain legacy admission',()=>{
 for(const location of ['headInstallation','mergeBaseInstallation'])for(const [mode,type]of [
  ['100644','blob'],['120000','blob'],['160000','commit'],['040000','tree']]){
  const f=legacyAdmissionFixture(),writes=[];
  f[location].scripts.tree.push({path:'independent-ai-review.mjs',mode,type,sha:sha('9')});
  assert.throws(()=>execute(f,admissionQuery(f,writes)),/attestation/);assert.deepEqual(writes,[]);
 }
});
test('missing, truncated, foreign or inaccessible selector Git metadata is a policy failure, never proof of legacy eligibility',()=>{
 for(const mutate of [
  f=>f.headInstallation.root.truncated=true,f=>f.mergeBaseInstallation.scripts.truncated=true,
  f=>delete f.headInstallation.root.truncated,f=>delete f.mergeBaseInstallation.scripts.tree,
  f=>f.headInstallation.root.sha=sha('f'),f=>f.mergeBaseInstallation.scripts.sha=sha('f'),
  f=>f.comparison.base_commit.sha=sha('f'),f=>delete f.comparison.merge_base_commit,
  f=>f.headInstallation.root.tree.push({...f.headInstallation.root.tree[0]})
 ]){
  const f=legacyAdmissionFixture(),writes=[];mutate(f);
  assert.throws(()=>execute(f,admissionQuery(f,writes)),/module policy metadata/);assert.deepEqual(writes,[]);
 }
 for(const status of [403,404]){
  const f=legacyAdmissionFixture(),writes=[],underlying=admissionQuery(f,writes);
  assert.throws(()=>execute(f,(...args)=>{
   if(args.at(-1).includes('/git/trees/'))throw Error('HTTP '+status);return underlying(...args);
  }),new RegExp('module policy metadata.*'+status));assert.deepEqual(writes,[]);
 }
});
test('legacy and new authorization modes are stable across final queue receipt verification',()=>{
 const f=legacyAdmissionFixture(),writes=[];
 assert.throws(()=>execute(f,admissionQuery(f,writes),{loadCheckout:()=>{
  f.reviews=[{...f.review,body:'<!-- independent-ai-review:v1 -->\n{}'}];
  return {checkout:f.checkout,checkoutArtifact:f.artifact};
 }}),/attestation/);assert.deepEqual(writes,[]);
});

test('the migration selector reads all real Review pages and never treats malformed or denied Review metadata as no marker',()=>{
 const paged=legacyAdmissionFixture();paged.reviews=Array.from({length:100},(_,i)=>({id:i+1,user:{id:999,login:'ordinary'},state:'COMMENTED',body:'old comment'}));
 paged.reviews.push({...paged.review,id:101,user:paged.permission.user,body:'<!-- independent-ai-review:v1 -->\n{}'});
 assert.throws(()=>execute(paged),/attestation/,'a trusted marker on page two forbids legacy fallback');
 for(const response of [null,{},[{id:1},{id:1}]]){
  const f=legacyAdmissionFixture(),writes=[],underlying=admissionQuery(f,writes);
  assert.throws(()=>execute(f,(...args)=>args.at(-1).includes('/reviews?')?JSON.stringify(response):underlying(...args)),/server Review policy metadata/);
  assert.deepEqual(writes,[]);
 }
 const f=legacyAdmissionFixture(),writes=[],underlying=admissionQuery(f,writes);
 assert.throws(()=>execute(f,(...args)=>{if(args.at(-1).includes('/reviews?'))throw Error('HTTP403');return underlying(...args);}),/server Review policy metadata.*403/);
 assert.deepEqual(writes,[]);
});
