import { readFileSync, readdirSync, writeFileSync, appendFileSync } from 'node:fs';
import {qualityShardMatrices} from './ci-quality-shape.mjs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { selectTests, parseGitChanges } from './test-affected.mjs';
const architectureLayers = JSON.parse(readFileSync(new URL('../config/architecture.json', import.meta.url), 'utf8')).layers;
// Match the existing Fast job ceilings in quality.yml. Timing estimates do
// not set fixture deadlines or the three-minute feedback target.
const fastJobCeilingMs = { win32: 45 * 60_000, linux: 30 * 60_000 };

function measuredSerialRemainder(js, lua, timings, platform) {
  const observed = [...js.map(file => timings.js[platform][file]), ...lua.map(file => timings.lua[file])];
  const measured = observed.filter(duration => Number.isFinite(duration) && duration > 0);
  return measured.reduce((total, duration) => total + duration, 0) - Math.max(0, ...measured);
}

export function impact(changed, sources, event, timings) {
  const full = reason => ({ mode: 'full', reason, changed, js: [], lua: [] });
  const release = /^release\/[\w][\w./-]*$/.test(event.base ?? '');
  if (event.eventName !== 'pull_request' || event.base !== 'develop' && !release || event.forceFull) return full('Integration or explicit full validation');
  if (!changed.length) return full('Empty comparison');
  // Documentation is not generally inert: evidence, design, source ledgers and
  // backlog are consumed by gates. Only this explicit prose allowlist is inert.
  const inert = p => /^docs\/(?:HANDOFF|CI|CI-FAST)\.md$/.test(p);
  const active = changed.filter(p => !inert(p));
  if (!active.length) return { mode: 'fast', reason: 'Prose only; governance gates still run', changed, js: [], lua: [] };
  // develop keeps conservative core Full; Release fixes use proven affected tests.
  if (active.some(p => /^(?:data\/|config\/|\.github\/|package|vendor\/)/.test(p)
    || /^scripts\/(?:ci-(?:impact|fast|quality-shape|timeout-policy|shards|reviewed-lfs)|publish-(?:full-quality|pr-quality|merge-group)|arm-auto-merge|merge-queue-(?:admission|policy)|pr-quality-evidence|verify-delivery|release-ci|repository-identity|write-ci-receipt|check-pr-history|fork-preflight|independent-ai-review)\.mjs$/.test(p)
    || !release && p.startsWith('src/lua/') && architectureLayers[p.match(/^src\/lua\/([^/]+)\.lua$/)?.[1]] !== 'ui')) return full('High risk or shared infrastructure');
  const plan = selectTests(active, sources);
  if (plan.full) return full(plan.reason);
  const js = [...new Set([...plan.fast, ...plan.integration])].sort(), lua = [...new Set(plan.lua)].sort();
  if (!js.length && !lua.length) return full('No proven test coverage');
  const luaMs = lua.reduce((n, p) => n + (timings.lua[p] ?? timings.unknownLuaMs), 0);
  // Each matrix VM runs the complete set serially, while the two platforms run
  // in parallel. Summing per-file platform maxima invents a third, slower VM.
  const estimateByPlatformMs = Object.fromEntries(['win32', 'linux'].map(platform => [platform,
    js.reduce((n, p) => n + (timings.js[platform][p] ?? timings.unknownJsMs), 0) + luaMs]));
  const estimateMs = Math.max(...Object.values(estimateByPlatformMs));
  const estimates = { estimateMs, estimateByPlatformMs, exceedsFastTarget: estimateMs > 180000 };
  if (!release) {
    const measuredRemainderMs = Object.fromEntries(Object.keys(fastJobCeilingMs).map(platform =>
      [platform, measuredSerialRemainder(js, lua, timings, platform)]));
    // Even without unmeasured files and the largest known file, this serial
    // workload exceeds a job ceiling. Use the existing complete matrix; moving
    // a lone slow file to another runner would not solve a file-level timeout.
    if (Object.keys(fastJobCeilingMs).some(platform => measuredRemainderMs[platform] > fastJobCeilingMs[platform]))
      return { ...full('Measured affected work exceeds a serial Fast job; run the complete Full matrix'),
        ...estimates, measuredRemainderMs, affectedCounts: { js: js.length, lua: lua.length } };
  }
  return { mode: 'fast', reason: plan.reason, changed, js, lua, ...estimates };
}

function scan(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? scan(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
}
export function main() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  // A merge queue group is a new integration commit, not an ordinary PR.
  // Require GitHub's exact queue identity and always run the complete suite.
  if (process.env.GITHUB_EVENT_NAME === 'merge_group') {
    const group=event.merge_group;
    if (event.action!=='checks_requested'||group?.base_ref!=='refs/heads/develop'||
      group?.head_sha!==process.env.GITHUB_SHA||group?.head_ref!==process.env.GITHUB_REF||
      !/^[0-9a-f]{40}$/.test(group?.base_sha??''))
      throw Error('Invalid native merge group identity');
  }
  let changed = [];
  if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
    const base = event.pull_request.base.sha;
    if (!/^[a-f0-9]{40}$/.test(base)) throw new Error('Invalid base');
    const git = spawnSync('git', ['diff', '--name-status', '-z', '--find-renames', base, 'HEAD', '--'], { encoding: 'utf8' });
    if (git.status !== 0) throw new Error(git.stderr || 'Cannot compare exact base');
    changed = [...new Set(parseGitChanges(git.stdout))];
  }
  const sources = Object.fromEntries(['src/lua', 'scripts', 'tests'].flatMap(scan).filter(p => /\.(lua|mjs)$/.test(p)).map(p => [p, readFileSync(p, 'utf8')]));
  const plan = impact(changed, sources, { eventName: process.env.GITHUB_EVENT_NAME, base: event.pull_request?.base.ref,
    forceFull: event.pull_request?.labels?.some(l => l.name === 'ci:full') }, JSON.parse(readFileSync('scripts/ci-test-timings.json', 'utf8')));
  plan.sha = process.env.GITHUB_SHA;
  plan.head = event.pull_request?.head.sha;
  plan.base = event.pull_request?.base.sha;
  plan.runId = Number(process.env.GITHUB_RUN_ID);
  plan.attempt = Number(process.env.GITHUB_RUN_ATTEMPT);
  writeFileSync('ci-impact.json', JSON.stringify(plan, null, 2));
  appendFileSync(process.env.GITHUB_OUTPUT, `mode=${plan.mode}\nwindows_shards=${JSON.stringify(qualityShardMatrices.windows)}\nposix_shards=${JSON.stringify(qualityShardMatrices.posix)}\n`);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `CI plan: ${JSON.stringify(plan)}\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
