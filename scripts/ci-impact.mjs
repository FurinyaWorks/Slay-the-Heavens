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
  const active = changed.filter(p => !inert(p));
  if (!active.length) return { mode: 'fast', reason: 'Prose only; governance gates still run', changed, js: [], lua: [] };
  // develop keeps conservative core Full; Release fixes use proven affected tests.
  if (active.some(path => highRisk(path, release))) return full('High risk or shared infrastructure');
  const plan = selectTests(active, typeof sources === 'function' ? sources() : sources);
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
function readImpactSources() {
  return Object.fromEntries(['src/lua', 'scripts', 'tests'].flatMap(scan).filter(p => /\.(lua|mjs)$/.test(p)).map(p => [p, readFileSync(p, 'utf8')]));
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
  const plan = impact(changed, readImpactSources, { eventName: process.env.GITHUB_EVENT_NAME, base: event.pull_request?.base.ref,
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

const inert = path => /^docs\/(?:HANDOFF|CI|CI-FAST)\.md$/.test(path);
const luaLayer = path => architectureLayers[path.match(/^src\/lua\/([^/]+)\.lua$/)?.[1]];
const highRisk = (path, release = false) => /^(?:data\/|config\/|\.github\/|package|vendor\/)/.test(path)
  || /^scripts\/(?:ci-(?:impact|fast|quality-shape|timeout-policy|shards|reviewed-lfs)|publish-(?:full-quality|pr-quality|merge-group)|arm-auto-merge|merge-queue-(?:admission|policy)|pr-quality-evidence|verify-delivery|release-ci|repository-identity|write-ci-receipt|check-pr-history|fork-preflight|independent-ai-review)\.mjs$/.test(path)
  || !release && path.startsWith('src/lua/') && luaLayer(path) !== 'ui';
const sha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);

function git(args, options = {}) {
  const result = spawnSync('git', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options});
  if (result.error || result.status !== 0) throw result.error ?? new Error(String(result.stderr) || 'Cannot inspect exact Git objects');
  return result.stdout;
}

// Queue candidates use the complete speculative stack. A later member can
// revert a sensitive change, so the net comparison and every applied delta
// contribute to risk. The caller supplies the already authenticated prefix.
export function queueChanges(base, head, members) {
  if (!sha(base) || !sha(head) || !Array.isArray(members) || members.at(-1)?.head !== head)
    throw new Error('Complete queue comparison identities required');
  const diff = (from, to) => {
    const records = git(['diff', '--raw', '-z', '--no-renames', from, to, '--']).split('\0');
    if (records.pop() !== '' || records.length % 2 !== 0) throw new Error('Incomplete queue comparison');
    const paths = [];
    let unsupported = false;
    for (let i = 0; i < records.length; i += 2) {
      const [fromMode, toMode, , , status] = records[i].slice(1).split(' ');
      const path = records[i + 1];
      if (!path || !['M', 'A'].includes(status) || !/^100(?:644|755)$/.test(toMode) ||
        status === 'M' && fromMode !== toMode) unsupported = true;
      paths.push(path);
    }
    return {paths, unsupported};
  };
  let parent = base;
  for (const member of members) {
    if (!sha(member?.head) || member.base !== parent || git(['show', '-s', '--format=%P', member.head]).trim() !== parent)
      throw new Error('Queue stack does not match the exact Git parent chain');
    parent = member.head;
  }
  const comparisons = [diff(base, head), ...members.map(member => diff(member.base, member.head))];
  return {paths: [...new Set(comparisons.flatMap(comparison => comparison.paths))].sort(),
    unsupported: comparisons.some(comparison => comparison.unsupported)};
}

// Offline comparison only. A candidate tier describes the selected scope.
// No historical coverage record grants permission to change the Queue mode.
export function classifyQueueRisk(changes, sources, members) {
  const {paths, unsupported} = changes;
  const full = (risk, reason) => ({risk, reason, js: [], lua: []});
  if (members?.some(member => member.forceFull === true)) return full('high', 'A queue member requested ci:full');
  if (paths.some(path => highRisk(path, true) || /\.(?:gil|gia)(?:\.|$)/i.test(path)
    || (luaLayer(path) && luaLayer(path) !== 'ui')
    || /^(?:src\/lua\/abyss_(?:battle|state|game_state|session)|scripts\/(?:test-|build-|check-|ci-|publish-|merge-queue-|gil-))/.test(path)))
    return full('high', 'Core, GIL, shared infrastructure or governance input');
  if (!members?.length || members.some(member => member.forceFull !== false))
    return full('UNPROVEN', 'Complete queue member labels are unavailable');
  if (unsupported || !paths.length) return full('UNPROVEN', 'Deleted, type-changed or empty comparison');
  const active = paths.filter(path => !inert(path));
  if (!active.length) return {...full('UNPROVEN', 'Prose-only candidate requires replay evidence'), candidateTier: 'low'};
  if (active.some(path => path.startsWith('src/lua/') && !luaLayer(path)))
    return full('UNPROVEN', 'Unregistered Lua module');
  const plan = selectTests(active, typeof sources === 'function' ? sources() : sources, {reportDynamicDependencies: true});
  if (plan.full) return full('UNPROVEN', plan.reason);
  const tests = {js: [...plan.fast, ...plan.integration].sort(), lua: plan.lua.sort()};
  if (plan.unresolvedRuntimeDependency)
    return {risk: 'UNPROVEN', reason: `Unresolved runtime dependencies: ${plan.unresolvedRuntimeDependency}`, ...tests};
  return {risk: 'UNPROVEN', reason: 'Coverage requires corroborated replay evidence', ...tests,
    candidateTier: members.length > 1 || active.length > 1 || plan.integration.length ? 'medium' : 'low'};
}

function readTreeSources(head) {
  const files = git(['ls-tree', '-r', '-z', head, '--', 'src/lua', 'scripts', 'tests']).split('\0')
    .map(row => /^100(?:644|755) blob ([a-f0-9]{40})\t([\s\S]+\.(?:lua|mjs))$/.exec(row)).filter(Boolean);
  const input = files.map(([, blob]) => blob + '\n').join('');
  const output = git(['cat-file', '--batch'], {encoding: null, input});
  let offset = 0;
  return Object.fromEntries(files.map(([, blob, path]) => {
    const newline = output.indexOf(10, offset);
    const [oid, type, size] = output.toString('utf8', offset, newline).split(' ');
    if (oid !== blob || type !== 'blob' || !/^\d+$/.test(size)) throw new Error('Missing replay source: ' + path);
    offset = newline + 1 + Number(size);
    if (output[offset++] !== 10) throw new Error('Incomplete replay source: ' + path);
    return [path, output.toString('utf8', newline + 1, offset - 1)];
  }));
}

export function replayQueue({base, head, members}) {
  const changes = queueChanges(base, head, members);
  // Apply the proposed selector and its current architecture and fixture rules
  // to historical Git bytes. This does not reconstruct old selector versions.
  return {mode: 'full', selector: 'current-checkout', base, head, tree: git(['rev-parse', head + '^{tree}']).trim(), changed: changes.paths,
    ...classifyQueueRisk(changes, () => readTreeSources(head), members)};
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv[2] === '--replay-queue') {
    const input = JSON.parse(readFileSync(process.argv[3], 'utf8'));
    console.log(JSON.stringify(replayQueue(input), null, 2));
  } else main();
}
