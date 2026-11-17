import test from 'node:test';
import assert from 'node:assert/strict';
import {runCost,summarizeCosts} from '../scripts/ci-run-costs.mjs';
const run={id:1,run_attempt:1,head_sha:'a'.repeat(40),pull_requests:[{number:42}],event:'pull_request',status:'completed',conclusion:'success',created_at:'2026-11-03T00:00:00Z',updated_at:'2026-11-03T00:10:00Z'};
const job=(id,name,extra={})=>({id,name,run_id:1,run_attempt:1,head_sha:run.head_sha,runner_id:id,runner_name:'GitHub Actions',status:'completed',conclusion:'success',created_at:'2026-11-03T00:00:00Z',started_at:'2026-11-03T00:01:00Z',completed_at:'2026-11-03T00:02:00Z',steps:[{name:'Set up job',conclusion:'success'}],...extra});
const jobs=()=>[job(1,'check'),job(2,'engineering-posix'),job(3,'presentation'),job(4,'fast (ubuntu-24.04)'),job(5,'fast (windows-2025)')];
const response=list=>({total_count:list.length,jobs:list});
const inventory={inventoryRun:run,inventoryJobs:response([job(7,'inventory')])};
test('natural Fast requires actual two-platform Quality execution, not cancelled placeholders or advisory',()=>{
  assert.equal(runCost(run,response(jobs()),inventory).fastPrEligible,true);
  assert.equal(runCost(run,response(jobs())).fastPrEligible,false);
  assert.equal(runCost(run,response(jobs()),{inventoryRun:{...run,head_sha:'b'.repeat(40)},inventoryJobs:inventory.inventoryJobs}).requiredWallSeconds,null);
  assert.equal(runCost(run,response(jobs()),{inventoryRun:run,inventoryJobs:response([job(7,'inventory',{completed_at:null})])}).requiredWallSeconds,null);
  const duplicatePlatform=jobs();duplicatePlatform[4].name='fast (ubuntu-24.04)';assert.equal(runCost(run,response(duplicatePlatform),inventory).fastPrEligible,false);
  assert.equal(runCost(run,response(jobs()),{inventoryRun:run,inventoryJobs:{...inventory.inventoryJobs,total_count:2}}).requiredWallSeconds,null);
  for(const name of ['fast','Quick feedback (windows-2025)','advisory']) {
    const r=runCost({...run,conclusion:'cancelled'},response([job(1,name,{runner_id:0,conclusion:'cancelled',steps:[]})]));
    assert.equal(r.fastPrEligible,false);assert.equal(r.mode,'unresolved');assert.equal(r.completedExecutionRunnerMinutes,0);
  }
  assert.equal(runCost({...run,event:'workflow_dispatch'},response(jobs())).fastPrEligible,false);
  assert.equal(runCost({...run,pull_requests:[]},response(jobs())).fastPrEligible,false);
});
test('queue, wall, actual execution and unfinished/cancelled costs stay separate',()=>{
  const r=runCost(run,response(jobs()));assert.equal(r.qualityWallSeconds,120);
  assert.equal(r.knownJobQueueSecondsSum,300);assert.equal(r.completedExecutionRunnerMinutes,5);
  const open=runCost({...run,status:'in_progress',conclusion:null},response([job(1,'rules (1/13)',{completed_at:null,status:'in_progress',conclusion:null})]));
  assert.deepEqual(open.executionStillOpen,[1]);assert.equal(open.completedExecutionRunnerMinutes,0);assert.equal(open.runWallSeconds,null);
  assert.deepEqual(open.platforms.windows.unknownExecutionJobs,[1]);assert.equal(open.platforms.windows.knownExecutionRunnerMinutes,0);
});
test('missing, failed, skipped or cancelled gates never become successful Fast measurements',()=>{
  for(const conclusion of ['failure','skipped','cancelled',null]) {
    const list=jobs();list[0].conclusion=conclusion;assert.equal(runCost(run,response(list)).fastPrEligible,false);
  }
  assert.equal(runCost(run,response(jobs().slice(1))).qualityWallSeconds,null);
  const list=jobs();list[0].completed_at=null;assert.equal(runCost(run,response(list)).qualityWallSeconds,null);
});
test('incomplete pages and wrong attempt/SHA/job identities reject rather than manufacture samples',()=>{
  assert.throws(()=>runCost(run,{total_count:6,jobs:jobs()}),/Incomplete/);
  for(const extra of [{run_id:2},{run_attempt:2},{head_sha:'b'.repeat(40)}])assert.throws(()=>runCost(run,response([job(1,'check',extra)])),/identity/);
  assert.throws(()=>runCost(run,response([job(1,'check'),job(1,'presentation')])),/Duplicate/);
});
test('insufficient natural samples remain insufficient; nearest rank is reported only from eligible runs',()=>{
  const r=runCost(run,response(jobs()),inventory),s=summarizeCosts([r]);assert.equal(s.naturalFastPrSamples,1);assert.equal(s.fastSampleSufficient,false);assert.equal(s.fastP90Seconds,120);
  assert.equal(summarizeCosts([]).fastP50Seconds,null);assert.throws(()=>summarizeCosts([r,r]),/Duplicate/);
  const cancelled={...r,id:2,conclusion:'cancelled',fastPrEligible:false};assert.equal(summarizeCosts([cancelled]).cancelledCompletedExecutionRunnerMinutes,5);
  const synthetic=Array.from({length:20},(_,i)=>({...r,id:i+1,sha:i.toString(16).padStart(40,'0'),requiredWallSeconds:(i+1)*10}));
  const ranked=summarizeCosts(synthetic);assert.equal(ranked.fastSampleSufficient,true);assert.equal(ranked.fastP50Seconds,100);assert.equal(ranked.fastP90Seconds,180);
});

import {describe} from 'node:test';
import {summarize} from '../scripts/ci-run-costs.mjs';
describe('on-demand CI governance',()=>{
const at = s => `2026-11-01T00:${s}:00Z`;
const run = (id, extra = {}) => ({id, name:'Quality', workflow_id:1, head_sha:'a'.repeat(40), event:'pull_request', head_branch:'feat/x', created_at:at('00'), run_started_at:at('01'), updated_at:at('09'), conclusion:'success', run_attempt:1, ...extra});
test('new commits and integration contexts are not duplicate execution', () => {
  const r=summarize({runs:[run(1),run(2,{head_sha:'b'.repeat(40)}),run(3,{event:'merge_group'})]});
  assert.equal(r.sameIdentityExtraRuns,0);
  assert.equal(r.provenReusableExtraRuns,0);
});
test('same SHA alone cannot prove reusable configuration or base', () => {
  const r=summarize({runs:[run(1),run(2,{created_at:at('10')})]});
  assert.equal(r.sameIdentityExtraRuns,1);
  assert.equal(r.provenReusableExtraRuns,0);
  assert.equal(r.reuseIdentityMissing,2);
});
test('only prior successful completed evidence in same config and base is reusable', () => {
  const identity={tested:'a'.repeat(40),base:'c'.repeat(40),configDigest:'config1',scope:'full',platforms:['linux','windows']};
  const runs=[run(1),run(2,{created_at:at('10')}),run(3,{created_at:at('20')}),run(4,{created_at:at('30'),event:'merge_group'})];
  const evidence={1:identity,2:identity,3:{...identity,base:'d'.repeat(40)},4:identity};
  const r=summarize({runs,evidence});
  assert.equal(r.provenReusableExtraRuns,1);
});
test('runner consumption sums actual jobs, retaining canceled work; missing jobs stay unknown', () => {
  const r=summarize({runs:[run(1),run(2,{conclusion:'cancelled'})], jobs:{1:[{id:1,runner_id:1,status:'completed',conclusion:'success',started_at:at('01'),completed_at:at('03')},{id:2,runner_id:2,status:'completed',conclusion:'skipped',started_at:at('01'),completed_at:at('09')}],2:[{id:3,runner_id:3,status:'completed',conclusion:'cancelled',started_at:at('02'),completed_at:at('03')}]}});
  assert.equal(r.runnerMinutes,3);
  assert.equal(r.jobCoverageRuns,2);
  assert.equal(summarize({runs:[run(1)]}).runnerMinutes,null);
});
test('a newer failure invalidates older reusable success', () => {
  const e={tested:'a',base:'b',configDigest:'config',scope:'full',platforms:['linux']};
  const r=summarize({runs:[run(1),run(2,{conclusion:'failure',created_at:at('10'),updated_at:at('19')}),run(3,{created_at:at('20')})],evidence:{1:e,2:e,3:e}});
  assert.equal(r.provenReusableExtraRuns,0);
});
test('in-flight runner consumption is explicitly incomplete', () => {
  const r=summarize({runs:[run(1)],jobs:{1:[{id:10,runner_id:10,status:'in_progress',started_at:at('01'),completed_at:null}]}});
  assert.equal(r.runnerMinutesComplete,false);
  assert.equal(r.jobsWithoutCompletedTiming,1);
});
test('completed jobs with missing timing cannot be reported as complete consumption', () => {
  const r=summarize({runs:[run(1)],jobs:{1:[{id:10,runner_id:10,status:'completed',conclusion:'cancelled',started_at:at('01'),completed_at:null}]}});
  assert.equal(r.runnerMinutesComplete,false);
  assert.equal(r.jobsWithoutCompletedTiming,1);
});
test('first pass uses first run per commit and workflow and merge lead uses actual merged PRs', () => {
  const r=summarize({runs:[run(1,{conclusion:'failure'}),run(2,{created_at:at('10')}),run(3,{head_sha:'b'.repeat(40)})],prs:[{created_at:at('00'),merged_at:at('20')},{created_at:at('00'),merged_at:null}]});
  assert.equal(r.firstPass.eligibleCommits,2);
  assert.equal(r.firstPass.successfulCommits,1);
  assert.equal(r.firstPass.rate,0.5);
  assert.deepEqual(r.mergeLeadMinutes,{count:1,median:20,p90:20});
});
test('cross-Fork proven reuse needs same tested tree, base, configuration and platforms', () => {
  const e={tested:'t',base:'b',configDigest:'c',scope:'full',platforms:['linux','windows']};
  const runs=[run(1,{repository:{id:1},event:'workflow_dispatch'}),run(2,{repository:{id:2},event:'workflow_dispatch',workflow_id:2,head_branch:'fork',created_at:at('10')}),run(3,{repository:{id:3},event:'workflow_dispatch',created_at:at('20')})];
  assert.equal(summarize({runs,evidence:{1:e,2:e,3:{...e,base:'new'}}}).crossRepositoryReusableExtraRuns,1);
  assert.equal(summarize({runs:runs.slice(0,2),evidence:{1:e,2:{...e,configDigest:'new'}}}).crossRepositoryReusableExtraRuns,0);
});
for(const event of ['push','merge_group'])test(`Fork dispatch cannot replace mandatory ${event} integration`, () => {
  const e={tested:'t',base:'b',configDigest:'c',scope:'full',platforms:['linux','windows']};
  const runs=[run(1,{repository:{id:1},event:'workflow_dispatch'}),run(2,{repository:{id:2},event,created_at:at('10')})];
  assert.equal(summarize({runs,evidence:{1:e,2:e}}).crossRepositoryReusableExtraRuns,0);
});
test('cancelled before runner assignment has no runner consumption despite API timestamps', () => {
  const r=summarize({runs:[run(1)],jobs:{1:[{id:100,runner_id:0,status:'completed',conclusion:'cancelled',started_at:at('00'),completed_at:at('59')}]}});
  assert.equal(r.runnerMinutes,0);
});

});
