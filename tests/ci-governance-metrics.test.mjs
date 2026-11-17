import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from '../scripts/ci-governance-metrics.mjs';

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
