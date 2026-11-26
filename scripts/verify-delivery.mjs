import { readFileSync, mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {isDeepStrictEqual} from 'node:util';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import {qualityShardJobs} from './ci-quality-shape.mjs';
import {projectRepositoryId,currentProjectRepository,projectRepositoryMatches,collectIdentityWitness,identityWitnessValid} from './repository-identity.mjs';
import {prFastErrors,collectFastCheckout,qualityPendingStatusJob,qualityPendingStatusJobErrors} from './pr-quality-evidence.mjs';
import {syncBacklogCloseout} from './backlog-closeout.mjs';
import {validateIndependentAiReview,cloudGateSourceErrors,collectCloudGateSource} from './independent-ai-review.mjs';
export {planBacklogCloseout,syncBacklogCloseout} from './backlog-closeout.mjs';

export const requiredJobs=['check','presentation','engineering-posix'];
export const qualityWorkflowPath='.github/workflows/quality.yml';
// The ordinary PR/push Quality contract. Its matrix is checked against the
// workflow in delivery.test.mjs; local-special is a separate diagnostic path.
export const fullQualityJobs=[...requiredJobs,
  ...Array.from({length:8},(_,i)=>`rules (${i+1}/8)`),
  ...Array.from({length:4},(_,i)=>`engineering-posix (${i+1}/4)`)];
export const deliverySchemaVersion=3;
export const currentFullQualityJobs=[...requiredJobs,...qualityShardJobs,'impact','fast'];
const validSha=value=>/^[a-f0-9]{40}$/.test(value??'');
const positiveId=value=>Number.isSafeInteger(value)&&value>0;
const parentShas=commit=>Array.isArray(commit?.parents)?commit.parents.map(parent=>parent?.sha):undefined;
// Deliberately narrow: only non-executable narrative documents qualify.
const lowRiskDocPath=/^(?:README\.md|CHANGELOG\.md|docs\/(?:drafts|history|lore|research)\/.+\.(?:md|txt))$/;
export function isLowRiskDocumentationChange(files,count) {
  return Number.isSafeInteger(count)&&count>0&&count<=20&&Array.isArray(files)&&files.length===count&&
    new Set(files.map(file=>file?.filename)).size===count&&files.every(file=>
      file&&typeof file.filename==='string'&&lowRiskDocPath.test(file.filename)&&
      !/^(?:AGENTS(?:\.override)?|CLAUDE(?:\.local)?|SKILL)\.md$/i.test(file.filename.split('/').at(-1))&&
      !file.filename.includes('\\')&&!file.filename.split('/').some(segment=>segment==='.'||segment==='..')&&
      ['added','modified'].includes(file.status)&&validSha(file.sha));
}
function qualityErrors(jobs,{attempt,runId,head,schemaVersion,allowRunningAggregate=false,run}) {
  // Collect filter=all, not one attempt: reruns preserve GITHUB_SHA/GITHUB_REF
  // and only reexecute selected jobs. Never search for the last *successful*
  // execution; a newer failure must supersede an older success.
  const errors=[];
  // Version 2 remains the frozen, pre-routing fifteen-job contract. Never
  // infer a legacy contract from missing jobs in newly collected evidence.
  const expectedJobs=schemaVersion===2?fullQualityJobs:schemaVersion===3?currentFullQualityJobs:undefined;
  if(!expectedJobs)return ['Unknown Quality evidence schema version'];
  if(!Array.isArray(jobs))return ['Quality jobs are missing'];
  const identities=new Set(),ids=new Set();
  for(const job of jobs) {
    const identity=`${job?.name}:${job?.run_attempt}`;
    if((!expectedJobs.includes(job?.name)&&!(schemaVersion===3&&job?.name===qualityPendingStatusJob))||!positiveId(job?.id)||ids.has(job.id)||identities.has(identity)||
      !positiveId(job?.run_attempt)||job.run_attempt>attempt||job.run_id!==runId||job.head_sha!==head)
      errors.push(`Unexpected, duplicate or mismatched Quality job ${job?.name}`);
    identities.add(identity);ids.add(job?.id);
  }
  if(!jobs.some(job=>job?.run_attempt===attempt))errors.push('Quality latest attempt has no jobs');
  for(const name of expectedJobs) {
    const job=latestJob(jobs,name);
    // A false job-level condition skips `fast` before matrix expansion. Fast
    // coverage (including expanded matrix jobs) can never certify Full.
    const conclusion=name==='fast'?'skipped':'success';
    const runningAggregate=allowRunningAggregate&&name==='check'&&job?.status==='in_progress'&&job.conclusion==null&&job.run_attempt===attempt;
    if(!runningAggregate&&(job?.status!=='completed'||job.conclusion!==conclusion))errors.push(`Quality job ${name} is missing, incomplete or does not have required conclusion ${conclusion} on its latest execution`);
  }
  if(schemaVersion===3)errors.push(...qualityPendingStatusJobErrors(jobs,run));
  return errors;
}
function latestJob(jobs,name) {
  return Array.isArray(jobs)?jobs.filter(job=>job?.name===name).sort((a,b)=>b.run_attempt-a.run_attempt)[0]:undefined;
}
const firstRulesJob=schemaVersion=>schemaVersion===2?'rules (1/8)':qualityShardJobs[0];
function executionTime(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value))return NaN;
  const time=Date.parse(value);
  return Number.isFinite(time)&&new Date(time).toISOString()===value.replace('Z','.000Z')?time:NaN;
}
function executionFingerprint(job) {
  const start=executionTime(job?.started_at),end=executionTime(job?.completed_at);
  if(job?.status!=='completed'||job.conclusion!=='success'||!Number.isFinite(start)||!Number.isFinite(end)||start>end||
    !positiveId(job.runner_id)||typeof job.runner_name!=='string'||!job.runner_name.trim()||
    !Array.isArray(job.labels)||!job.labels.length||job.labels.some(label=>typeof label!=='string'||!label)||
    !Array.isArray(job.steps)||!job.steps.length)return undefined;
  let previous=0;const steps=[];
  for(const step of job.steps) {
    const a=executionTime(step?.started_at),b=executionTime(step?.completed_at);
    if(!positiveId(step?.number)||step.number<=previous||typeof step.name!=='string'||!step.name.trim()||
      step.status!=='completed'||!['success','skipped'].includes(step.conclusion)||
      !Number.isFinite(a)||!Number.isFinite(b)||a<start||a>b||b>end)return undefined;
    previous=step.number;
    steps.push([step.number,step.name,step.status,step.conclusion,step.started_at,step.completed_at]);
  }
  return JSON.stringify([job.started_at,job.completed_at,job.runner_id,job.runner_name,job.labels,steps]);
}
function receiptExecutionAttempt(jobs,schemaVersion) {
  let job=latestJob(jobs,firstRulesJob(schemaVersion));
  if(!positiveId(job?.run_attempt))return undefined;
  // Ordinary and historical sparse evidence keeps its declared attempt. Only
  // a record created after execution finished can justify inherited evidence.
  if(!(executionTime(job.created_at)>executionTime(job.completed_at)))return job.run_attempt;
  while(job) {
    const fingerprint=executionFingerprint(job),created=executionTime(job.created_at);
    if(!fingerprint||!Number.isFinite(created)||!positiveId(job.id)||!positiveId(job.run_id)||!validSha(job.head_sha))return undefined;
    if(created<=executionTime(job.started_at))return job.run_attempt;
    if(created<=executionTime(job.completed_at))return undefined;
    // Do not search past a different/failed execution or missing attempt. New
    // record IDs and runner_group_id may differ, but execution must not.
    const prior=jobs.filter(candidate=>candidate?.name===job.name&&candidate.run_attempt===job.run_attempt-1);
    if(prior.length!==1||prior[0].id===job.id||prior[0].run_id!==job.run_id||prior[0].head_sha!==job.head_sha||
      !(executionTime(prior[0].created_at)<created)||executionFingerprint(prior[0])!==fingerprint)return undefined;
    job=prior[0];
  }
  return undefined;
}
// Shared artifact/attempt association only. Callers separately validate all
// jobs, run identity and the checkout's exact SHA/parent identity.
export function receiptErrors(checkout,artifact,jobs,run,schemaVersion) {
  // Only the shape's first rules shard writes this artifact. Its execution may
  // predate the run's latest attempt; the receipt still binds the exact base,
  // head, tested commit and parents, checked separately below.
  const jobName=firstRulesJob(schemaVersion),attempt=receiptExecutionAttempt(jobs,schemaVersion);
  if(checkout?.schemaVersion!==1||!positiveId(attempt)||checkout?.attempt!==attempt||
    !positiveId(artifact?.id)||artifact.name!==`quality-${run?.id}-${attempt}-check`||artifact.expired!==false||
    artifact.workflow_run?.id!==run?.id||artifact.workflow_run?.head_sha!==run?.head_sha)
    return [`Checkout receipt/artifact is missing, expired or differs from the effective ${jobName} identity`];
  return [];
}
function runErrors(run,{head,event,runId,attempt,branch,repo}) {
  const errors=[];
  if(!run||run.path!==qualityWorkflowPath||run.head_sha!==head||run.event!==event||
    !positiveId(run.id)||!positiveId(run.run_attempt)||run.id!==runId||run.run_attempt!==attempt||
    run.status!=='completed'||run.conclusion!=='success'||run.repository?.full_name!==repo||branch!==undefined&&run.head_branch!==branch)errors.push('Exact current-attempt Quality run is missing, incomplete, unsuccessful or mismatched');
  return errors;
}
// Auto-merge authorization includes exact Full preflight evidence. It remains
// distinct from merged delivery, which also verifies the actual squash and push CI.
export function verifyAutoMergeArm(e) {
  if(!e||typeof e!=='object')return ['Missing auto-merge arm evidence'];
  const errors=[];
  if(e.repositoryId!==undefined&&e.repositoryId!==projectRepositoryId)errors.push('Auto-merge repository ID differs from the project');
  const fast=e.schemaVersion===6;
  if(fast){
    if(e.kind!=='auto-merge-arm-fast'||!/^[a-f0-9]{64}$/.test(e.queueRulesFingerprint??''))
      errors.push('Fast authorization requires a native queue rules fingerprint');
    if(e.fastPreflight?.schemaVersion!==7)errors.push('Missing exact Fast preflight');
    else{
      errors.push(...verifyDelivery(e.fastPreflight).map(error=>'Fast preflight: '+error));
      for(const field of ['repo','prNumber','head','base','tested','sourceTree'])
        if(e.fastPreflight[field]!==e[field])errors.push('Fast preflight differs from authorization '+field);
      if(JSON.stringify(e.fastPreflight.review)!==JSON.stringify(e.review))errors.push('Fast review differs from authorization');
    }
  }else if(e.fullPreflight===undefined){
    if(!positiveId(e.pendingRun?.id)||!positiveId(e.pendingRun?.attempt)||e.pendingRun.head!==e.head)
      errors.push('Auto-merge requires the exact pending Full run identity');
  }else if(e.fullPreflight.schemaVersion!==3)errors.push('Auto-merge requires current Full preflight evidence');
  else {
    errors.push(...verifyDelivery(e.fullPreflight).map(error=>'Full preflight: '+error));
    for(const field of ['repo','prNumber','head','base','tested','sourceTree'])
      if(e.fullPreflight[field]!==e[field])errors.push('Full preflight differs from auto-merge '+field);
    if(JSON.stringify(e.fullPreflight.review)!==JSON.stringify(e.review))errors.push('Full preflight review differs from authorization');
  }
  if(![4,6].includes(e.schemaVersion)||e.kind!==(fast?'auto-merge-arm-fast':'auto-merge-arm')||!/^[-\w.]+\/[-\w.]+$/.test(e.repo??'')||
    e.baseRef!=='develop'||!positiveId(e.prNumber))errors.push('Missing auto-merge arm identity');
  for(const key of ['head','base','tested','sourceTree','targetBeforeSha','targetAfterSha'])
    if(!validSha(e[key]))errors.push('Missing or invalid auto-merge '+key);
  if(e.targetBeforeSha!==e.base||e.targetAfterSha!==e.base)
    errors.push('Auto-merge target moved during review authorization');
  if(JSON.stringify(e.parents)!==JSON.stringify([e.base,e.head]))
    errors.push('Auto-merge proposed merge parents differ from reviewed HEAD/BASE');
  if(e.review?.disposition==='low-risk-docs') {
    if(!isLowRiskDocumentationChange(e.changedFiles,e.changedFileCount))
      errors.push('Auto-merge documentation waiver is outside the allowed scope');
  } else if(e.review?.reviewedHeadSha!==e.head||e.review?.reviewedBaseSha!==e.base||
    typeof e.review?.reviewId!=='string'||!e.review.reviewId.trim()||
    e.review.conclusion!=='pass'||!Array.isArray(e.review.unresolved)||e.review.unresolved.length)
    errors.push('Auto-merge independent review is missing, stale or unresolved');
  if(e.review?.reviewedHeadSha!==e.head||e.review?.reviewedBaseSha!==e.base)
    errors.push('Auto-merge review does not match exact HEAD/BASE');
  if(e.review?.repo!=null&&e.review.repo!==e.repo||
    e.review?.prNumber!=null&&e.review.prNumber!==e.prNumber)
    errors.push('Auto-merge review is for another PR');
  return errors;
}
export function verifyDelivery(e) {
  if(e?.schemaVersion===6)return verifyAutoMergeArm(e);
  if(e?.schemaVersion===7){
    const errors=prFastErrors(e);
    errors.push(...runErrors(e.currentRun,{head:e.head,event:'pull_request',runId:e.runId,attempt:e.attempt,repo:e.repo}));
    if(e.review?.reviewedHeadSha!==e.head||e.review?.reviewedBaseSha!==e.base||!e.review?.reviewId||
      typeof e.review.reviewId!=='string'||!e.review.reviewId.trim()||
      e.review.conclusion!=='pass'||!Array.isArray(e.review.unresolved)||e.review.unresolved.length)
      errors.push('Fast independent review is missing, stale or unresolved');
    if(e.review?.repo!=null&&e.review.repo!==e.repo||e.review?.prNumber!=null&&e.review.prNumber!==e.prNumber)
      errors.push('Fast review belongs to a different repository/PR');
    if(e.kind!=='pr-fast'||e.event!=='pull_request'||e.baseRef!=='develop'||e.prNumber!==e.number||e.targetBeforeSha!==e.base||e.targetAfterSha!==e.base||
      e.testedCommit?.sha!==e.tested||e.testedCommit?.commit?.tree?.sha!==e.sourceTree||
      !validSha(e.sourceTree)||JSON.stringify(parentShas(e.testedCommit))!==JSON.stringify([e.base,e.head]))
      errors.push('Fast source tree or observed target differs');
    return errors;
  }
  if(!e||typeof e!=='object')return ['Missing preflight evidence'];
  if(e.schemaVersion===4)return [...verifyAutoMergeArm(e),
    ...(e.fullPreflight===undefined?['Review authorization is not successful Full preflight evidence']:[])];
  const errors=[];
  if(![2,3].includes(e.schemaVersion)||!/^[-\w.]+\/[-\w.]+$/.test(e.repo??'')||!['develop','master'].includes(e.baseRef))errors.push('Missing versioned repository/target evidence');
  for(const field of ['head','base','tested','sourceTree'])if(!validSha(e[field]))errors.push(`Invalid ${field}`);
  if(e.schemaVersion===3)for(const field of ['targetBeforeSha','targetAfterSha'])
    if(!validSha(e[field])||e[field]!==e.base)errors.push(`Actual target ${field} is missing, malformed or differs from the verified base`);
  if(e.event!=='pull_request'||!positiveId(e.runId)||!positiveId(e.attempt)||!positiveId(e.prNumber))errors.push('Expected PR run identity');
  for(const field of ['head','base','tested','runId','event','prNumber'])if(e.checkout?.[field]!==e[field])errors.push(`Checkout ${field} is stale or mismatched`);
  errors.push(...receiptErrors(e.checkout,e.checkoutArtifact,e.jobs,e.run,e.schemaVersion));
  if(JSON.stringify(e.parents)!==JSON.stringify([e.base,e.head]))errors.push('Tested merge parents do not match current base/head');
  if(e.testedCommit?.sha!==e.tested||JSON.stringify(parentShas(e.testedCommit))!==JSON.stringify(e.parents)||e.testedCommit?.commit?.tree?.sha!==e.sourceTree)errors.push('Tested source commit/tree evidence is missing or mismatched');
  if(JSON.stringify(e.checkout?.parents)!==JSON.stringify(e.parents))errors.push('Checkout merge parents differ from tested commit');
  if(!Array.isArray(e.run?.pull_requests)||!e.run.pull_requests.some(pr=>pr?.number===e.prNumber))errors.push('Quality run does not belong to this PR');
  errors.push(...runErrors(e.run,{head:e.head,event:e.event,runId:e.runId,attempt:e.attempt,repo:e.repo}),...qualityErrors(e.jobs,{attempt:e.attempt,runId:e.runId,head:e.head,schemaVersion:e.schemaVersion,run:e.run}));
  errors.push(...runErrors(e.currentRun,{head:e.head,event:e.event,runId:e.runId,attempt:e.attempt,repo:e.repo}));
  if(e.review?.disposition==='low-risk-docs') {
    if(e.schemaVersion!==deliverySchemaVersion||e.baseRef!=='develop'||e.review.reviewedHeadSha!==e.head||
      e.review.reviewedBaseSha!==e.base||!isLowRiskDocumentationChange(e.changedFiles,e.changedFileCount))
      errors.push('Low-risk documentation waiver is stale, unverified or out of scope');
  } else if(e.review?.reviewedHeadSha!==e.head||e.review?.reviewedBaseSha!==e.base||!e.review?.reviewId||e.review?.conclusion!=='pass'||!Array.isArray(e.review?.unresolved)||e.review.unresolved.length)
    errors.push('Review is missing, stale, or has unresolved findings');
  return errors;
}
export function verifyMergedDelivery(e) {
  if(!e||typeof e!=='object')return {state:'merged_pending',errors:['Missing merged evidence']};
  const preflight=e.preflight??{},early=preflight.schemaVersion===4&&preflight.fullPreflight===undefined;
  const errors=(early?verifyAutoMergeArm(preflight):verifyDelivery(preflight)).map(error=>`Preflight: ${error}`);
  const transferred=identityWitnessValid(e.identityWitness,preflight,e.repo);
  if(e.identityWitness!==undefined&&!transferred)errors.push('Repository transfer witness is invalid or changed');
  if(transferred){
    const repositories=[e.pr?.head?.repo,e.pr?.base?.repo,e.current?.head?.repo,e.current?.base?.repo,
      e.run?.repository,e.currentRun?.repository,...(early?[e.prFull?.run?.repository,e.prFull?.currentRun?.repository]:[])];
    if(repositories.some(repository=>!projectRepositoryMatches(repository,e.repo)))errors.push('Transferred PR/run repository identity differs from the fixed project');
  }
  if(early)errors.push(...verifyHistoricalAutoFull(e.prFull,preflight,e.identityWitness));
  if(preflight.nativeReview!==undefined){
    errors.push(...nativeReviewErrors(preflight));
    errors.push(...verifyNativeQueueFull(e.queueFull,preflight,e.pr?.merge_commit_sha));
  }else if([6,7].includes(preflight.schemaVersion))errors.push(...verifyFastQueueFull(e.queueFull,preflight,e.pr?.merge_commit_sha));
  if(![2,3].includes(e.schemaVersion))errors.push('Missing versioned merged evidence');
  if(e.repo!==preflight.repo&&!transferred)errors.push('Merged evidence repository differs from preflight');
  if(preflight.review?.disposition==='low-risk-docs'&&
    (e.changedFileCount!==preflight.changedFileCount||JSON.stringify(e.changedFiles)!==JSON.stringify(preflight.changedFiles)))
    errors.push('Post-merge GitHub files differ from the verified low-risk waiver');
  if(e.pr?.number!==preflight.prNumber||!e.pr?.merged||e.pr?.state!=='closed')errors.push('Expected the verified PR to be merged');
  if(e.pr?.head?.sha!==preflight.head||e.pr?.base?.ref!==preflight.baseRef)errors.push('Merged PR head/target differs from preflight');
  if(!validSha(e.commit?.sha)||e.commit?.sha!==e.pr?.merge_commit_sha)errors.push('Actual merged commit does not match merge_commit_sha');
  const native=preflight.nativeReview!==undefined,squashBase=native?e.queueFull?.checkout?.base:preflight.base;
  const testedTree=native?e.queueFull?.commit?.commit?.tree?.sha:preflight.sourceTree;
  if(!validSha(squashBase)||JSON.stringify(parentShas(e.commit))!==JSON.stringify([squashBase]))
    errors.push(native?'Actual squash parent differs from the verified native queue parent':'Actual squash parent differs from verified base; obtain fresh evidence for the new combination');
  if(!validSha(e.commit?.commit?.tree?.sha)||e.commit.commit.tree.sha!==testedTree)
    errors.push('Actual merged source tree differs from the verified source tree');
  if(e.current?.number!==e.pr?.number||e.current?.head?.sha!==e.pr?.head?.sha||e.current?.base?.ref!==e.pr?.base?.ref||!e.current?.merged||e.current?.state!=='closed'||e.current?.merge_commit_sha!==e.pr?.merge_commit_sha)errors.push('Merged PR identity changed during verification');
  errors.push(...runErrors(e.run,{head:e.commit?.sha,event:'push',runId:e.run?.id,attempt:e.run?.run_attempt,branch:preflight.baseRef,repo:e.repo}));
  errors.push(...runErrors(e.currentRun,{head:e.commit?.sha,event:'push',runId:e.run?.id,attempt:e.run?.run_attempt,branch:preflight.baseRef,repo:e.repo}));
  errors.push(...qualityErrors(e.jobs,{attempt:e.run?.run_attempt,runId:e.run?.id,head:e.commit?.sha,schemaVersion:e.schemaVersion,run:e.run}));
  errors.push(...receiptErrors(e.checkout,e.checkoutArtifact,e.jobs,e.run,e.schemaVersion));
  for(const [field,value] of Object.entries({event:'push',runId:e.run?.id,tested:e.commit?.sha,head:e.commit?.sha,base:squashBase})) {
    if(value===undefined||e.checkout?.[field]!==value)errors.push(`Merged checkout ${field} is missing, stale or mismatched`);
  }
  if(e.checkout?.prNumber!==undefined||JSON.stringify(e.checkout?.parents)!==JSON.stringify([squashBase]))errors.push('Merged checkout is not the actual squash commit');
  return {state:errors.length?'merged_pending':'merged_passed',errors};
}

// This is historical PR CI collected AFTER native auto-merge. It is not a
// schema3 preflight and does not invent target-ref observations after merge.
// The surrounding merged verifier separately proves the actual squash parent
// and tree match the independently observed target/source in the saved arm.
export function verifyHistoricalAutoFull(e,arm,identityWitness){
  if(!e||e.schemaVersion!==5||e.kind!=='historical-auto-full')return ['Missing historical PR Full evidence'];
  const errors=[],run=e.run??{},checkout=e.checkout??{};
  const transferred=identityWitnessValid(identityWitness,arm,identityWitness?.canonicalFullName),repo=transferred?identityWitness.canonicalFullName:arm.repo;
  if(identityWitness!==undefined&&(!transferred||![run.repository,e.currentRun?.repository].every(r=>projectRepositoryMatches(r,repo))))
    errors.push('Historical Full repository transfer identity is invalid');
  errors.push(...runErrors(run,{head:arm.head,event:'pull_request',runId:run.id,attempt:run.run_attempt,repo}),
    ...runErrors(e.currentRun,{head:arm.head,event:'pull_request',runId:run.id,attempt:run.run_attempt,repo}),
    ...qualityErrors(e.jobs,{attempt:run.run_attempt,runId:run.id,head:arm.head,schemaVersion:3,run}),
    ...receiptErrors(checkout,e.checkoutArtifact,e.jobs,run,3));
  if(!Array.isArray(run.pull_requests)||run.pull_requests.length>0&&!run.pull_requests.some(p=>p.number===arm.prNumber)||run.id<arm.pendingRun?.id||
    run.id===arm.pendingRun?.id&&run.run_attempt<arm.pendingRun.attempt)
    errors.push('Historical Full does not belong to the authorized PR/run');
  for(const [field,value]of Object.entries({head:arm.head,base:arm.base,tested:arm.tested,prNumber:arm.prNumber,event:'pull_request',runId:run.id}))
    if(checkout[field]!==value)errors.push('Historical PR checkout differs from authorization: '+field);
  if(JSON.stringify(checkout.parents)!==JSON.stringify([arm.base,arm.head])||e.testedCommit?.sha!==arm.tested||
    JSON.stringify(parentShas(e.testedCommit))!==JSON.stringify([arm.base,arm.head])||e.testedCommit?.commit?.tree?.sha!==arm.sourceTree)
    errors.push('Historical PR tested commit/parents/tree differs from authorization');
  return errors;
}
// Fast PR evidence authorizes entry only. A separate immutable Full run must
// certify the native queue's actual squash SHA, followed by ordinary push Full.
export const verifyFastQueueFull=(e,arm,mergedSha)=>verifyQueueFull(e,arm,mergedSha,'fast-queue-full');
export const verifyNativeQueueFull=(e,preflight,mergedSha)=>verifyQueueFull(e,preflight,mergedSha,'native-queue-full');
function verifyQueueFull(e,arm,mergedSha,kind){
  if(!e||e.schemaVersion!==8||e.kind!==kind)return ['Missing native queue Full evidence for '+(kind==='fast-queue-full'?'Fast':'native-reviewed')+' PR'];
  const run=e.run??{},errors=[];
  errors.push(...runErrors(run,{head:mergedSha,event:'merge_group',runId:run.id,attempt:run.run_attempt,repo:arm.repo}),
    ...runErrors(e.currentRun,{head:mergedSha,event:'merge_group',runId:run.id,attempt:run.run_attempt,repo:arm.repo}),
    ...qualityErrors(e.jobs,{attempt:run.run_attempt,runId:run.id,head:mergedSha,schemaVersion:3,run}),
    ...receiptErrors(e.checkout,e.checkoutArtifact,e.jobs,run,3));
  const native=kind==='native-queue-full',queueBase=native?e.commit?.parents?.[0]?.sha:arm.base;
  if(native){
    const c=e.commit,comparison=e.reviewBaseAncestry?.comparison;
    if(c?.sha!==mergedSha||!validSha(c?.commit?.tree?.sha)||!validSha(queueBase)||
      JSON.stringify(parentShas(c))!==JSON.stringify([queueBase]))
      errors.push('Actual native queue commit/tree/sole parent evidence is missing or mismatched');
    if(e.reviewBaseAncestry?.before!==arm.base||e.reviewBaseAncestry?.after!==queueBase||comparison?.base_commit?.sha!==arm.base||!['ahead','identical'].includes(comparison?.status)||comparison?.merge_base_commit?.sha!==arm.base)
      errors.push('Original reviewed BASE is not an ancestor of the actual native queue parent');
    if(queueBase===arm.base&&c?.commit?.tree?.sha!==arm.sourceTree)
      errors.push('First native group tree differs from the original reviewed combination');
  }
  if(run.head_branch!==`gh-readonly-queue/develop/pr-${arm.prNumber}-${queueBase}`)
    errors.push('Queue Full does not belong to the authorized PR/actual queue parent');
  for(const [field,value]of Object.entries({schemaVersion:1,event:'merge_group',runId:run.id,
    tested:mergedSha,head:mergedSha,base:queueBase}))
    if(e.checkout?.[field]!==value)errors.push('Queue Full checkout differs: '+field);
  if(e.checkout?.prNumber!=null||JSON.stringify(e.checkout?.parents)!==JSON.stringify([queueBase]))
    errors.push('Queue Full checkout must be the exact native squash');
  for(const context of ['full-quality','pr-quality','independent-review']){
    const status=e.statuses?.filter(s=>s.context===context).sort((a,b)=>b.id-a.id)[0];
    if(!positiveId(status?.id)||status.state!=='success'||status.creator?.id!==41898282||
      status.creator?.login!=='github-actions[bot]'||
      status.target_url!==`https://github.com/${arm.repo}/actions/runs/${run.id}`)
      errors.push('Queue Full/admission status is missing or no longer successful: '+context);
  }
  const licenses=e.licenses;
  let licenseJobs=licenses?.jobs;
  if(native&&Array.isArray(licenseJobs)){
    const ids=new Set(),executions=new Set(),latest=new Map(),attempt=licenses?.run?.run_attempt;
    for(const job of licenseJobs){
      const key=job?.name+'@'+job?.run_attempt;
      if(!['inventory','independent-ai-review','cancel-obsolete-queue'].includes(job?.name)||
        !positiveId(job?.id)||ids.has(job?.id)||executions.has(key)||!positiveId(attempt)||
        !positiveId(job?.run_attempt)||job.run_attempt>attempt||job.run_id!==licenses?.run?.id||job.head_sha!==mergedSha)
        errors.push('Native queue inventory history contains unknown, duplicate or mismatched execution identities');
      ids.add(job?.id);executions.add(key);
      const previous=latest.get(job?.name);
      if(!previous||job?.run_attempt>previous.run_attempt||job?.run_attempt===previous.run_attempt&&job?.id>previous.id)
        latest.set(job?.name,job);
    }
    // Preserve raw history. Inventory needs a current execution; a conditional
    // auxiliary may retain its latest genuine skipped execution. Never relabel rows.
    licenseJobs=[...latest.values()];
  }
  const inventory=Array.isArray(licenseJobs)?licenseJobs.filter(job=>job?.name==='inventory'):[],
    extra=Array.isArray(licenseJobs)?licenseJobs.filter(job=>job?.name!=='inventory'):[];
  if(!positiveId(licenses?.run?.id)||!positiveId(licenses?.run?.run_attempt)||
    licenses.run.head_sha!==mergedSha||licenses.run.event!=='merge_group'||
    licenses.run.status!=='completed'||licenses.run.conclusion!=='success'||
    licenses.run.path!=='.github/workflows/licenses.yml'||licenses.run.repository?.full_name!==arm.repo||
    licenses.currentRun?.id!==licenses.run.id||licenses.currentRun?.run_attempt!==licenses.run.run_attempt||
    licenses.currentRun?.status!=='completed'||licenses.currentRun?.conclusion!=='success'||
    licenses.currentRun?.event!=='merge_group'||licenses.currentRun?.path!==licenses.run.path||
    licenses.currentRun?.head_sha!==mergedSha||licenses.currentRun?.repository?.full_name!==arm.repo||
    !Array.isArray(licenses.jobs)||inventory?.length!==1||!positiveId(inventory[0]?.id)||
    inventory[0].run_id!==licenses.run.id||inventory[0].run_attempt!==licenses.run.run_attempt||inventory[0].head_sha!==mergedSha||
    inventory[0].status!=='completed'||inventory[0].conclusion!=='success'||
    (kind==='fast-queue-full'?extra.length!==0:extra.length>2||new Set(extra.map(job=>job?.name)).size!==extra.length||new Set(extra.map(job=>job?.id)).size!==extra.length||extra.some(job=>!['independent-ai-review','cancel-obsolete-queue'].includes(job?.name)||
      !positiveId(job.id)||job.id===inventory[0].id||job.run_id!==licenses.run.id||!positiveId(job.run_attempt)||job.run_attempt>licenses.run.run_attempt||job.head_sha!==mergedSha||
      job.status!=='completed'||job.conclusion!=='skipped')))
    errors.push('Queue inventory is missing, stale or unsuccessful');
  return errors;
}

function nativeReviewErrors(preflight){
  const n=preflight?.nativeReview,o=n?.observations,errors=[];
  if(!n||!o)return ['Missing native Review observations'];
  const recorded=o.prBefore,pr={...recorded,user:{id:recorded?.authorId}};
  const checked=validateIndependentAiReview({repository:{id:n.repositoryId,full_name:n.repo},pr,
    baseSha:preflight.base,sourceCommit:o.sourceCommit,reviews:o.reviews,permissions:o.permissions,dependencies:o.dependencies});
  errors.push(...checked.errors.map(error=>'Native review: '+error));
  if(n.conclusion!=='pass'||!Array.isArray(n.errors)||n.errors.length||
    !isDeepStrictEqual(o.prBefore,o.prAfter)||!isDeepStrictEqual(o.targetBefore,o.targetAfter)||
    o.targetBefore?.ref!=='refs/heads/develop'||o.targetBefore.object?.type!=='commit'||o.targetBefore.object.sha!==preflight.base||
    !isDeepStrictEqual(n.report,checked.report)||!isDeepStrictEqual(n.coordinator,checked.coordinator))
    errors.push('Native Review proof is incomplete, changed or unsuccessful');
  for(const [field,value]of Object.entries({repo:preflight.repo,repositoryId:projectRepositoryId,prNumber:preflight.prNumber,
    head:preflight.head,base:preflight.base,tree:preflight.sourceTree,mergeCommitSha:preflight.tested,
    githubReviewId:checked.githubReviewId,reviewId:preflight.review?.reviewId}))
    if(value===undefined||n[field]!==value)errors.push('Native Review binding differs: '+field);
  if(n.nativeApprovalReviewId!==undefined&&n.nativeApprovalReviewId!==n.githubReviewId)
    errors.push('Legacy review ID alias differs from the actual signed Review');
  return errors;
}

// A custom download adapter supplies the original ZIP bytes. Its API digest is
// the ZIP digest, not a digest of JSON an adapter has reconstructed.
function nativeProofZip(bytes,artifact){
  if(!Buffer.isBuffer(bytes)&&!(bytes instanceof Uint8Array))throw Error('Native proof adapter must return original ZIP bytes');
  bytes=Buffer.from(bytes);
  if(artifact.digest!=='sha256:'+createHash('sha256').update(bytes).digest('hex'))throw Error('Native proof ZIP digest differs from immutable artifact');
  const end=bytes.lastIndexOf(Buffer.from([80,75,5,6]));
  if(end<0||end+22>bytes.length||bytes.readUInt16LE(end+10)!==1)throw Error('Native proof artifact must contain exactly one JSON file');
  const offset=bytes.readUInt32LE(end+16);
  if(offset+46>end||bytes.readUInt32LE(offset)!==0x02014b50)throw Error('Malformed native proof ZIP directory');
  const method=bytes.readUInt16LE(offset+10),size=bytes.readUInt32LE(offset+24),compressed=bytes.readUInt32LE(offset+20);
  const nameSize=bytes.readUInt16LE(offset+28),local=bytes.readUInt32LE(offset+42);
  const name=bytes.subarray(offset+46,offset+46+nameSize).toString('utf8');
  if(name!=='native-ai-review-proof.json'||bytes.readUInt16LE(offset+8)&1||![0,8].includes(method)||size>32*1024*1024||
    local+30>offset||bytes.readUInt32LE(local)!==0x04034b50||bytes.readUInt16LE(local+8)!==method)
    throw Error('Unexpected native proof ZIP entry');
  const localName=bytes.readUInt16LE(local+26),start=local+30+localName+bytes.readUInt16LE(local+28);
  if(bytes.subarray(local+30,local+30+localName).toString('utf8')!==name||start+compressed>offset)
    throw Error('Native proof ZIP entry differs from its directory');
  const data=method===0?bytes.subarray(start,start+compressed):inflateRawSync(bytes.subarray(start,start+compressed),{maxOutputLength:size});
  if(data.length!==size)throw Error('Native proof ZIP JSON size differs');
  return data;
}

export function resolveNativePreflight(intent,query=gh,{loadProof}={}){
  if(intent?.schemaVersion!==9||intent.kind!=='native-auto-merge-intent'||intent.repositoryId!==projectRepositoryId||
    !positiveId(intent.prNumber)||![intent.head,intent.base,intent.sourceTree].every(validSha)||
    !positiveId(intent.githubReviewId)||intent.nativeApprovalReviewId!==undefined&&intent.githubReviewId!==intent.nativeApprovalReviewId||
    typeof intent.gateRef!=='string'||!intent.gateRef.startsWith('refs/heads/')||intent.gateRef.length<=11||
    typeof intent.createdAt!=='string'||!Number.isFinite(Date.parse(intent.createdAt))||intent.nativeAuto?.confirmed!==true)
    throw Error('Invalid native auto-merge intent locator; this is not CI preflight evidence');
  const repository=JSON.parse(query('api','repositories/'+projectRepositoryId)),repo=intent.repo;
  if(!projectRepositoryMatches(repository,repo))throw Error('Native intent repository differs from the fixed project');
  const get=path=>JSON.parse(query('api',`repos/${repo}/${path}`));
  const status=()=>{
    const pages=JSON.parse(query('api','--paginate','--slurp',`repos/${repo}/commits/${intent.head}/statuses?per_page=100`));
    if(!Array.isArray(pages)||!pages.length||pages.some(page=>!Array.isArray(page)))throw Error('Complete native review status pages are missing');
    const rows=pages.flat().filter(row=>row?.context==='independent-review');
    if(rows.some(row=>!positiveId(row.id)))throw Error('Malformed native review status identity');
    const latest=rows.sort((a,b)=>b.id-a.id)[0],match=latest?.description?.match(/^AI review ([1-9]\d*) \[base:([a-f0-9]{40})\] \[proof:([1-9]\d*)\]$/);
    if(latest?.state!=='success'||latest.creator?.id!==41898282||latest.creator?.login!=='github-actions[bot]'||
      !match||Number(match[1])!==intent.githubReviewId||match[2]!==intent.base||!positiveId(Number(match[3])))
      throw Error('Latest trusted native review status is missing, rejected or bound to another review/BASE');
    return {status:latest,artifactId:Number(match[3])};
  };
  const first=status(),runMatch=first.status.target_url?.match(new RegExp('^https://github\\.com/'+repo+'/actions/runs/([1-9]\\d*)$'));
  if(!runMatch||!positiveId(Number(runMatch[1])))throw Error('Native review status does not identify a real gate run');
  const runId=Number(runMatch[1]),gateRun=get('actions/runs/'+runId),artifact=get('actions/artifacts/'+first.artifactId);
  const runValid=run=>run?.id===runId&&positiveId(run.run_attempt)&&run.status==='completed'&&run.conclusion==='success'&&
    projectRepositoryMatches(run.repository,repo);
  const artifactValid=value=>value?.id===first.artifactId&&value.name===`independent-review-${intent.prNumber}-${intent.head.slice(0,12)}-${runId}-${gateRun.run_attempt}`&&
    value.expired===false&&value.workflow_run?.id===runId&&value.workflow_run.head_sha===gateRun.head_sha&&
    [value.workflow_run.repository_id,value.workflow_run.head_repository_id].every(id=>id===undefined||id===projectRepositoryId);
  if(!runValid(gateRun)||!artifactValid(artifact)||!/^sha256:[a-f0-9]{64}$/.test(artifact.digest??''))throw Error('Native proof artifact or main-repository gate run is missing, stale or mismatched');
  let bytes;
  if(loadProof)bytes=nativeProofZip(loadProof({repo,intent,artifact,gateRun},query),artifact);
  else{
    const matches=pages(query,`repos/${repo}/actions/runs/${runId}/artifacts?per_page=100`,'artifacts').filter(row=>row.name===artifact.name);
    if(matches.length!==1||matches[0].id!==artifact.id)throw Error('Native proof artifact name is ambiguous or replaced');
    const dir=mkdtempSync(join(tmpdir(),'abyss-native-review-'));
    try{
      query('run','download',String(runId),'--repo',repo,'--name',artifact.name,'--dir',dir);
      bytes=readFileSync(join(dir,'native-ai-review-proof.json'));
    }finally{rmSync(dir,{recursive:true,force:true});}
  }
  const proof=JSON.parse(bytes.toString('utf8')),preflight=proof?.preflight;
  if(proof.schemaVersion!==1||proof.kind!=='native-ai-review-proof'||proof.mode!=='publish'||proof.state!=='pr_passed'||
    proof.repo!==repo||proof.prNumber!==intent.prNumber||proof.head!==intent.head||proof.base!==intent.base||
    ![3,7].includes(preflight?.schemaVersion)||preflight.repo!==repo||preflight.prNumber!==intent.prNumber||
    preflight.head!==intent.head||preflight.base!==intent.base||preflight.sourceTree!==intent.sourceTree||
    preflight.baseRef!=='develop'||preflight.review?.disposition==='low-risk-docs'||
    proof.nativeReview?.githubReviewId!==intent.githubReviewId||
    proof.nativeReview?.nativeApprovalReviewId!==undefined&&proof.nativeReview.nativeApprovalReviewId!==intent.githubReviewId||
    preflight.nativeReview!==undefined&&!isDeepStrictEqual(preflight.nativeReview,proof.nativeReview)||
    !Array.isArray(proof.policyErrors)||proof.policyErrors.length||proof.gate?.runId!==runId||
    proof.gate.attempt!==gateRun.run_attempt||proof.gate.ref!==intent.gateRef||
    proof.gate.bootstrap!==(intent.gateRef!=='refs/heads/develop'))
    throw Error('Native proof is shadow, unsuccessful or belongs to a different exact preflight');
  const converted={...preflight,nativeReview:proof.nativeReview};
  const sourceContext={repo,head:intent.head,base:intent.base,ref:intent.gateRef,bootstrap:proof.gate.bootstrap,
    coordinator:proof.nativeReview?.coordinator,reviewedBranch:proof.nativeReview?.observations?.prBefore?.head?.ref,
    installBaseSha:proof.nativeReview?.report?.installBaseSha};
  const source=collectCloudGateSource({api:path=>JSON.parse(query('api',path)),run:gateRun,...sourceContext});
  sourceContext.installation=source.observations.installation;
  const errors=[...verifyDelivery(preflight),...nativeReviewErrors(converted),...source.errors];
  if(errors.length)throw Error('Native proof failed existing delivery/review verification: '+errors.join('; '));
  const current=get('actions/artifacts/'+artifact.id),currentRun=get('actions/runs/'+runId),last=status();
  if(!artifactValid(current)||current.digest!==artifact.digest||!runValid(currentRun)||cloudGateSourceErrors(currentRun,sourceContext).length||currentRun.run_attempt!==gateRun.run_attempt||
    last.status.id!==first.status.id||!isDeepStrictEqual(last,first))throw Error('Native review artifact, gate attempt or latest status changed during download');
  return {...converted,nativeProof:{artifact,gateRun,status:first.status,sourceObservations:source.observations}};
}
function gh(...args) {
  const result=spawnSync('gh',args,{encoding:'utf8',timeout:60000,maxBuffer:16*1024*1024});
  if(result.error||result.status!==0)throw new Error(`GitHub query failed: ${result.error?.message||result.stderr}`);return result.stdout;
}
function pages(query,endpoint,key) {
  const result=JSON.parse(query('api','--paginate','--slurp',endpoint));
  if(!Array.isArray(result)||result.some(page=>!Array.isArray(page[key])))throw new Error(`Malformed paginated ${key} response`);
  return result.flatMap(page=>page[key]);
}
function lowRiskFiles(query,repo,number,expectedCount) {
  const response=JSON.parse(query('api','--paginate','--slurp',`repos/${repo}/pulls/${number}/files?per_page=100`));
  if(!Array.isArray(response)||!response.length||response.some(page=>!Array.isArray(page)))
    throw new Error('Low-risk waiver cannot read complete PR file pages');
  const files=response.flatMap(page=>page.map(file=>({filename:file?.filename,status:file?.status,sha:file?.sha})))
    .sort((a,b)=>a.filename<b.filename?-1:a.filename>b.filename?1:0);
  if(!isLowRiskDocumentationChange(files,expectedCount))
    throw new Error('Low-risk waiver denied: PR files are not exclusively eligible documentation');
  return files;
}
export function checkoutReceipt(repo,run,jobs,dir,query=gh,schemaVersion=deliverySchemaVersion,{allowRunningAggregate=false}={}) {
  const errors=qualityErrors(jobs,{attempt:run.run_attempt,runId:run.id,head:run.head_sha,schemaVersion,allowRunningAggregate,run});
  if(errors.length)throw new Error(errors.join('\n'));
  const attempt=receiptExecutionAttempt(jobs,schemaVersion);
  if(!positiveId(attempt))throw new Error('Cannot prove first rules shard execution attempt');
  const name=`quality-${run.id}-${attempt}-check`;
  const artifacts=pages(query,`repos/${repo}/actions/runs/${run.id}/artifacts?per_page=100`,'artifacts').filter(a=>a?.name===name);
  const artifact=artifacts[0];
  if(artifacts.length!==1||receiptErrors({schemaVersion:1,attempt},artifact,jobs,run,schemaVersion).length)throw new Error('Missing, duplicate, expired or mismatched checkout artifact');
  query('run','download',String(run.id),'--repo',repo,'--name',name,'--dir',dir);
  // Artifacts are immutable. Recheck the ID after name-based gh download so a
  // concurrent deletion/replacement cannot change the object we just accepted.
  const current=JSON.parse(query('api',`repos/${repo}/actions/artifacts/${artifact.id}`));
  if(current.id!==artifact.id||current.name!==name||receiptErrors({schemaVersion:1,attempt},current,jobs,run,schemaVersion).length)throw new Error('Checkout artifact changed during download');
  return {checkout:JSON.parse(readFileSync(join(dir,'ci-checkout.json'),'utf8')),checkoutArtifact:artifact};
}
function latestQualityRun(query,repo,{event,head,branch,number,allowMissingPrLink=false}) {
  const runs=pages(query,`repos/${repo}/actions/workflows/quality.yml/runs?event=${event}&head_sha=${head}&per_page=100`,'workflow_runs');
  return runs.filter(run=>run.head_sha===head&&run.event===event&&
    (branch===undefined||run.head_branch===branch)&&
    (number===undefined||Array.isArray(run.pull_requests)&&(run.pull_requests.some(pr=>pr.number===number)||allowMissingPrLink&&run.pull_requests.length===0)))
    .sort((a,b)=>b.id-a.id)[0];
}
function targetHead(query,repo,baseRef) {
  if(!['develop','master'].includes(baseRef))throw new Error('Unexpected target branch');
  const ref=JSON.parse(query('api',`repos/${repo}/git/ref/heads/${baseRef}`));
  if(ref?.ref!==`refs/heads/${baseRef}`||ref.object?.type!=='commit'||!validSha(ref.object?.sha))
    throw new Error('Actual target Git ref is missing or malformed');
  return ref.object.sha;
}
export function collectPrDelivery(repo,number,review,query=gh,loadCheckout) {
  const pr=JSON.parse(query('api',`repos/${repo}/pulls/${number}`));
  if(pr.state!=='open'||pr.merged)throw new Error('Preflight requires an open PR; use --merged with its saved preflight evidence after merge');
  // PR base.sha and refs/pull/*/merge can both retain the old combination after
  // the actual target advances. Read the independent branch ref, not that pair.
  const targetBeforeSha=targetHead(query,repo,pr.base.ref);
  if(targetBeforeSha!==pr.base.sha)throw new Error('PR base is stale: actual target branch differs before collection');
  const waived=review?.disposition==='low-risk-docs';
  if(waived&&pr.base.ref!=='develop')throw new Error('Low-risk waiver is only permitted for develop');
  const changedFileCount=waived?pr.changed_files:undefined;
  const changedFiles=waived?lowRiskFiles(query,repo,number,changedFileCount):undefined;
  if(waived)review={disposition:'low-risk-docs',reviewedHeadSha:pr.head.sha,reviewedBaseSha:pr.base.sha};
  const identity={event:'pull_request',head:pr.head.sha,number};
  const run=latestQualityRun(query,repo,identity);
  if(!run||run.status!=='completed'||run.conclusion!=='success')throw new Error('Current Quality run is missing or not successful');
  const jobs=pages(query,`repos/${repo}/actions/runs/${run.id}/jobs?filter=all&per_page=100`,'jobs');
  const fast=jobs.some(job=>job.name==='fast (windows-2025)');
  if(!loadCheckout)loadCheckout=(r,j)=>{
    const dir=join('build/delivery',randomUUID());mkdirSync(dir,{recursive:true});
    return fast?collectFastCheckout(repo,r,j,dir,query):checkoutReceipt(repo,r,j,dir,query);
  };
  const {checkout,checkoutArtifact,plan}=loadCheckout(run,jobs);
  if(checkout.tested!==pr.merge_commit_sha)throw new Error('CI did not test the current PR merge combination');
  const commit=JSON.parse(query('api',`repos/${repo}/commits/${checkout.tested}`));
  const evidence={schemaVersion:deliverySchemaVersion,repo,baseRef:pr.base.ref,sourceTree:commit.commit.tree.sha,testedCommit:commit,
    head:pr.head.sha,base:pr.base.sha,tested:checkout.tested,parents:commit.parents.map(p=>p.sha),
    runId:run.id,attempt:run.run_attempt,event:run.event,prNumber:number,run,jobs,checkout,checkoutArtifact,review,targetBeforeSha,
    ...(waived?{changedFileCount,changedFiles}:{})};
  if(fast)Object.assign(evidence,{schemaVersion:7,kind:'pr-fast',number,pr,target:targetBeforeSha,commit,plan});
  const current=JSON.parse(query('api',`repos/${repo}/pulls/${number}`));
  if(fast)evidence.pr=current;
  evidence.currentRun=latestQualityRun(query,repo,identity);
  if(fast)evidence.latestRun=evidence.currentRun;
  evidence.targetAfterSha=targetHead(query,repo,pr.base.ref);
  return {evidence,current};
}
export function collectMergedDelivery(repo,number,preflight,query=gh,loadCheckout=(run,jobs)=>{
  const dir=join('build/delivery',randomUUID());mkdirSync(dir,{recursive:true});
  return checkoutReceipt(repo,run,jobs,dir,query);
}) {
  const pr=JSON.parse(query('api',`repos/${repo}/pulls/${number}`));
  if(!pr.merged||!validSha(pr.merge_commit_sha))throw new Error('PR is not merged; its passing preflight is only pr_passed');
  const commit=JSON.parse(query('api',`repos/${repo}/commits/${pr.merge_commit_sha}`));
  let prFull;
  if(preflight.schemaVersion===4&&preflight.fullPreflight===undefined){
    const identity={event:'pull_request',head:preflight.head,branch:pr.head.ref,number,allowMissingPrLink:true};
    const run=latestQualityRun(query,repo,identity);
    const jobs=run?.status==='completed'?pages(query,`repos/${repo}/actions/runs/${run.id}/jobs?filter=all&per_page=100`,'jobs'):[];
    const receipt=run?.status==='completed'&&run.conclusion==='success'?loadCheckout(run,jobs):{};
    prFull={schemaVersion:5,kind:'historical-auto-full',run,jobs,...receipt,
      testedCommit:JSON.parse(query('api',`repos/${repo}/commits/${preflight.tested}`)),
      currentRun:latestQualityRun(query,repo,identity)};
  }
  const identity={event:'push',head:pr.merge_commit_sha,branch:pr.base.ref};
  const run=latestQualityRun(query,repo,identity);
  const jobs=run?.status==='completed'?pages(query,`repos/${repo}/actions/runs/${run.id}/jobs?filter=all&per_page=100`,'jobs'):[];
  const receipt=run?.status==='completed'&&run.conclusion==='success'?loadCheckout(run,jobs):{};
  let queueFull;
  if([6,7].includes(preflight.schemaVersion)||preflight.nativeReview!==undefined){
    const native=preflight.nativeReview!==undefined,queueBase=native?parentShas(commit)[0]:preflight.base;
    const groupIdentity={event:'merge_group',head:pr.merge_commit_sha,
      branch:`gh-readonly-queue/develop/pr-${number}-${queueBase}`};
    const groupRun=latestQualityRun(query,repo,groupIdentity);
    const groupJobs=groupRun?.status==='completed'?pages(query,`repos/${repo}/actions/runs/${groupRun.id}/jobs?filter=all&per_page=100`,'jobs'):[];
    const groupReceipt=groupRun?.conclusion==='success'?loadCheckout(groupRun,groupJobs):{};
    const statuses=JSON.parse(query('api','--paginate','--slurp',`repos/${repo}/commits/${pr.merge_commit_sha}/statuses?per_page=100`)).flat();
    const licenseRuns=pages(query,`repos/${repo}/actions/workflows/licenses.yml/runs?event=merge_group&head_sha=${pr.merge_commit_sha}&per_page=100`,'workflow_runs');
    const licenseRun=licenseRuns.filter(r=>r.head_sha===pr.merge_commit_sha&&r.event==='merge_group').sort((a,b)=>b.id-a.id)[0];
    const licenseJobs=licenseRun?pages(query,`repos/${repo}/actions/runs/${licenseRun.id}/jobs?filter=all&per_page=100`,'jobs'):[];
    queueFull={schemaVersion:8,kind:native?'native-queue-full':'fast-queue-full',
      ...(native?{commit,reviewBaseAncestry:{before:preflight.base,after:queueBase,comparison:JSON.parse(query('api',`repos/${repo}/compare/${preflight.base}...${queueBase}`))}}:{}),run:groupRun,jobs:groupJobs,...groupReceipt,statuses,
      currentRun:latestQualityRun(query,repo,groupIdentity),licenses:{run:licenseRun,jobs:licenseJobs,
        currentRun:pages(query,`repos/${repo}/actions/workflows/licenses.yml/runs?event=merge_group&head_sha=${pr.merge_commit_sha}&per_page=100`,'workflow_runs')
          .filter(r=>r.head_sha===pr.merge_commit_sha&&r.event==='merge_group').sort((a,b)=>b.id-a.id)[0]}};
  }
  // Queue artifact downloads may outlive a push rerun or PR update. These
  // mutable observations must be read after every receipt and license query.
  const current=JSON.parse(query('api',`repos/${repo}/pulls/${number}`));
  const currentRun=latestQualityRun(query,repo,identity);
  const waived=preflight.review?.disposition==='low-risk-docs';
  const changedFileCount=waived?pr.changed_files:undefined;
  const changedFiles=waived?lowRiskFiles(query,repo,number,changedFileCount):undefined;
  return {schemaVersion:deliverySchemaVersion,repo,preflight,pr,commit,run,jobs,...receipt,current,currentRun,...(prFull?{prFull}:{}),...(queueFull?{queueFull}:{}),
    ...(waived?{changedFileCount,changedFiles}:{})};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [number,evidenceFile,mode,...extra]=process.argv.slice(2);
    if(!/^[1-9]\d*$/.test(number??'')||!evidenceFile||mode!==undefined&&mode!=='--merged'||extra.length)throw new Error('Usage: npm run verify:delivery -- <PR-number> <independent-review.json>|--low-risk-docs OR <PR-number> <preflight-evidence.json> --merged');
    const repo=gh('repo','view','--json','nameWithOwner','--jq','.nameWithOwner').trim();
    if(!projectRepositoryMatches(currentProjectRepository(gh),repo))throw Error('Current repository differs from the fixed project');
    const dir=join('build/delivery',randomUUID());mkdirSync(dir,{recursive:true});
    if(mode==='--merged') {
      const preflightText=readFileSync(evidenceFile,'utf8'),saved=JSON.parse(preflightText),
        preflight=saved.schemaVersion===9?resolveNativePreflight(saved,gh):saved;
      const errors=[4,6].includes(preflight.schemaVersion)?verifyAutoMergeArm(preflight):verifyDelivery(preflight);
      const identityWitness=preflight.repo!==repo?collectIdentityWitness(preflightText,repo,gh):undefined;
      if(preflight.prNumber!==Number(number)||errors.length)throw new Error('Preflight evidence is invalid, stale or belongs to a different PR/repository');
      const evidence=collectMergedDelivery(repo,Number(number),preflight,gh,(run,jobs)=>checkoutReceipt(repo,run,jobs,join(dir,String(run.id))));
      if(identityWitness)evidence.identityWitness=identityWitness;
      const result=verifyMergedDelivery(evidence);
      writeFileSync(join(dir,'evidence.json'),JSON.stringify({...evidence,...result},null,2)+'\n');
      console.log(`Delivery state: ${result.state}; actual merged commit ${evidence.pr.merge_commit_sha}; evidence ${dir}`);
      if(result.errors.length)throw new Error(result.errors.join('\n'));
      const filePages=JSON.parse(gh('api','--paginate','--slurp',`repos/${repo}/pulls/${number}/files?per_page=100`));
      if(!Array.isArray(filePages)||filePages.some(page=>!Array.isArray(page))||filePages.flat().length!==evidence.pr.changed_files)
        throw Error('Backlog pending: incomplete PR file list');
      const readTargetSha=()=>JSON.parse(gh('api',`repos/${repo}/git/ref/heads/develop`)).object?.sha;
      const targetSha=readTargetSha();
      const latestPr=JSON.parse(gh('api',`repos/${repo}/pulls/${number}`));
      if(latestPr.merged!==true||latestPr.base?.ref!==evidence.pr.base?.ref||
        latestPr.head?.sha!==evidence.pr.head?.sha||latestPr.merge_commit_sha!==evidence.pr.merge_commit_sha||
        latestPr.title!==evidence.pr.title||latestPr.body!==evidence.pr.body)
        throw Error('Backlog pending: PR identity or declaration changed during verification');
      const backlog=syncBacklogCloseout({pr:evidence.pr,files:filePages.flat(),targetSha,readTargetSha});
      writeFileSync(join(dir,'backlog.json'),JSON.stringify(backlog,null,2)+'\n');
      console.log(`Backlog state: ${backlog.state}; ${backlog.taskIds.join(', ')||'no tasks declared'}`);
      process.exitCode=0;
    } else {
      const {evidence,current}=collectPrDelivery(repo,Number(number),evidenceFile==='--low-risk-docs'?{disposition:'low-risk-docs'}:JSON.parse(readFileSync(evidenceFile,'utf8')),gh,
        (run,jobs)=>jobs.some(job=>job.name==='fast (windows-2025)')?collectFastCheckout(repo,run,jobs,dir,gh):checkoutReceipt(repo,run,jobs,dir));
      const errors=verifyDelivery(evidence);
      if(current.state!=='open'||current.merged||current.head.sha!==evidence.head||current.base.sha!==evidence.base||current.base.ref!==evidence.baseRef||current.merge_commit_sha!==evidence.tested)errors.push('PR head/base/merge combination changed during verification');
      writeFileSync(join(dir,'evidence.json'),JSON.stringify({...evidence,state:errors.length?'pr_pending':'pr_passed',errors},null,2)+'\n');
      if(errors.length)throw new Error(errors.join('\n'));
      console.log(`Delivery state: pr_passed; evidence ${dir}; merge with --match-head-commit ${evidence.head}. Then run verify:delivery -- ${number} ${join(dir,'evidence.json')} --merged. External reviewer provenance must still be inspected when required.`);
    }
  }catch(error){console.error(error.message);process.exitCode=1;}
}
