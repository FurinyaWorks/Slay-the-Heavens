import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { arch, availableParallelism, cpus, release, totalmem } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { parseArgs } from 'node:util';
import { counters, phases, validateSample } from '../benchmark-runtime-path.mjs';
import { compareSamples, lockfileIdentity, parseResources, profiles, summarize } from './resource-receipt.mjs';

const image = 'node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df';
const modes = { fast: ['baseline', 'medium'], full: Object.keys(profiles) };
const workload = ['worker.mjs', 'host.lua', 'observer.lua', 'turn.lua'].map(file => `scripts/runtime-baseline/${file}`);
workload.push('tests/lua/support/game_ui_fixture.lua', 'tests/lua/support/native_ui_contract.lua', 'tests/lua/support/shop_timeline.lua');
const sourceInputs = ['src/lua', 'data', 'config', 'package-lock.json', ...workload];

const receipt = String.raw`
set -eu
cg=/sys/fs/cgroup
for key in cpu.max memory.max memory.swap.max; do
  value=$(cat "$cg/$key")
  printf 'RESOURCE %s %s\n' "$key" "$value"
done
status=0
node scripts/runtime-baseline/worker.mjs || status=$?
value=$(cat "$cg/memory.peak")
printf 'RESOURCE memory.peak %s\n' "$value"
while read -r key value; do printf 'RESOURCE cpu.%s %s\n' "$key" "$value"; done < "$cg/cpu.stat"
while read -r key value; do printf 'RESOURCE memory.events.%s %s\n' "$key" "$value"; done < "$cg/memory.events"
exit "$status"
`;

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 120_000, maxBuffer: 4 * 1024 * 1024 });
  assert(result.status === 0 && !result.error,
    `${command} ${args[0]} failed (${result.error?.message ?? result.status ?? result.signal}): ${result.stderr?.trim() ?? ''}\n${result.stdout?.trim().split('\n').slice(-20).join('\n') ?? ''}`);
  return result.stdout.trim();
}

function snapshot(root) {
  const git = (...args) => run('git', args, root);
  assert.equal(realpathSync(git('rev-parse', '--show-toplevel')), root, 'use a repository worktree root');
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'tracked checkout files have uncommitted changes');
  assert.equal(git('status', '--porcelain', '--untracked-files=all', '--', ...sourceInputs), '', 'runtime inputs have untracked files');
  const generated = readdirSync(resolve(root, 'build/lua')).filter(file => file.endsWith('.lua')).sort();
  assert(generated.includes('abyss_data.lua') && generated.includes('abyss_ui_templates.lua'), 'run build:data and build:ui first');
  const hashFiles = paths => createHash('sha256').update(JSON.stringify(paths.map(path => ({
    path, sha256: createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex'),
  })))).digest('hex');
  return {
    commit: git('rev-parse', 'HEAD'),
    tree: git('rev-parse', 'HEAD^{tree}'),
    workloadSha256: hashFiles(workload),
    lockfile: lockfileIdentity(readFileSync(resolve(root, 'package-lock.json'))),
    generatedLuaSha256: hashFiles(generated.map(file => `build/lua/${file}`)),
  };
}

function measure(root, profile) {
  const name = `slay-resource-suite-${randomUUID()}`;
  const args = ['run', '--rm', '--name', name, '--network', 'none', '--cgroupns', 'private', '--read-only',
    '--user', `${process.getuid()}:${process.getgid()}`,
    '--mount', `type=bind,src=${root},dst=/repo,readonly`, '--workdir', '/repo'];
  if (profile.cpus !== null) args.push('--cpus', String(profile.cpus));
  if (profile.memoryBytes !== null) args.push('--memory', String(profile.memoryBytes), '--memory-swap', String(profile.memoryBytes));
  const start = performance.now();
  try {
    const output = run('docker', [...args, image, 'sh', '-c', receipt], root);
    const wallMs = performance.now() - start;
    assert(output.split('\n').includes('RUNTIME_BASELINE_PASS seed=1 idleFrames=300'), 'Host did not complete the fixed workload');
    const samples = output.split('\n').filter(line => line.startsWith('RUNTIME_BASELINE_JSON '));
    assert.equal(samples.length, 1, 'expected exactly one Host measurement');
    const sample = validateSample(JSON.parse(samples[0].slice('RUNTIME_BASELINE_JSON '.length)));
    assert(Number.isSafeInteger(sample.maxRssKiB) && sample.maxRssKiB > 0, 'invalid process maxRSS');
    return { ...sample, wallMs, resources: parseResources(output, profile) };
  } catch (error) {
    spawnSync('docker', ['rm', '-f', name], { timeout: 10_000, stdio: 'ignore' });
    return { error: error.message };
  }
}

function deterministicCounts(sample) {
  return sample.rows.map(row => [counters.map(key => row[key]), row.nativeMethods, row.propertyNames]);
}

function summarizeSamples(samples, count) {
  if (samples.length !== count || samples.some(sample => sample.error)) return { samples, pass: false };
  for (const sample of samples) assert.deepEqual(deterministicCounts(sample), deterministicCounts(samples[0]), 'nondeterministic Host call counts');
  return {
    samples, pass: true,
    wallMs: summarize(samples.map(sample => sample.wallMs)),
    peakBytes: summarize(samples.map(sample => sample.resources.peakBytes)),
    phases: Object.fromEntries(phases.map((phase, i) => [phase, summarize(samples.map(sample => sample.rows[i].elapsedMs))])),
  };
}

function suite(values) {
  assert.equal(process.platform, 'linux', 'use a Linux Docker host');
  assert(Object.hasOwn(modes, values.mode), `unknown mode: ${values.mode}`);
  const selected = values.profile ?? modes[values.mode];
  assert(selected.every(profile => Object.hasOwn(profiles, profile)) && new Set(selected).size === selected.length, 'unknown or duplicate profile');
  const repetitions = Number(values.samples ?? (values.mode === 'fast' ? 1 : 3));
  assert(Number.isInteger(repetitions) && repetitions >= 1 && repetitions <= 100, 'samples must be an integer from 1 to 100');
  const alertPercent = Number(values['alert-percent']);
  assert(Number.isFinite(alertPercent) && alertPercent > 0, 'alert-percent must be positive');
  const candidatePath = realpathSync('.');
  let baselinePath = values.baseline ? realpathSync(values.baseline) : null;
  assert.notEqual(candidatePath, baselinePath, 'prepare the reference in a separate worktree');
  const candidate = snapshot(candidatePath);
  let baseline = baselinePath ? snapshot(baselinePath) : null;
  let unpairedReference = null;
  if (values['baseline-if-compatible'] && baseline && candidate.workloadSha256 !== baseline.workloadSha256) {
    unpairedReference = { ...baseline, reason: 'Host workload changed; timings cannot be paired' };
    console.log(unpairedReference.reason + ': ' + baseline.commit);
    baseline = baselinePath = null;
  }
  if (baseline) {
    assert.equal(candidate.workloadSha256, baseline.workloadSha256, 'the Host workload must match');
    assert.equal(candidate.lockfile.dependencies, baseline.lockfile.dependencies, 'the resolved dependency graph must match');
  }
  const docker = run('docker', ['info', '--format', '{{.ServerVersion}} {{.CgroupVersion}} {{.OSType}} {{.Architecture}}'], candidatePath);
  assert.match(docker, /^\S+ 2 linux \S+$/, 'a Linux Docker daemon using cgroup v2 is required');
  if (spawnSync('docker', ['image', 'inspect', image], { stdio: 'ignore', timeout: 10_000 }).status !== 0) {
    run('docker', ['pull', image], candidatePath);
  }
  const imageId = run('docker', ['image', 'inspect', '--format', '{{.Id}}', image], candidatePath);
  const results = {};
  for (const key of selected) {
    const profile = profiles[key];
    const before = [];
    const after = [];
    const pairOrder = [];
    for (let i = 0; i < repetitions; i++) {
      const pair = baselinePath ? [[baselinePath, before, 'baseline'], [candidatePath, after, 'candidate']] : [[candidatePath, after, 'candidate']];
      if (i % 2) pair.reverse();
      pairOrder.push(pair.map(([, , label]) => label));
      for (const [path, samples, label] of pair) {
        const record = measure(path, profile);
        samples.push(record);
        console.log(`${key} ${label} ${i + 1}/${repetitions}: ${record.error ?? 'workload passed'}`);
      }
    }
    const candidateResult = summarizeSamples(after, repetitions);
    const baselineResult = baselinePath ? summarizeSamples(before, repetitions) : null;
    results[key] = {
      profile, pairOrder, candidate: candidateResult, baseline: baselineResult,
      signals: baselineResult?.pass && candidateResult.pass ? compareSamples(before, after, alertPercent) : [],
    };
  }
  assert.deepEqual(snapshot(candidatePath), candidate, 'candidate inputs changed while measuring');
  if (baselinePath) assert.deepEqual(snapshot(baselinePath), baseline, 'baseline inputs changed while measuring');
  const pass = Object.values(results).every(result => result.candidate.pass && (result.baseline?.pass ?? true));
  return {
    schemaVersion: 1, kind: 'offline-host-resource-pressure', timeUtc: new Date().toISOString(),
    status: pass ? 'PASS' : 'FAIL', mode: values.mode, repetitions, seed: 1, idleFrames: 300,
    engine: { image, imageId, docker, kernel: release(), arch: arch(), cpuModel: cpus()[0]?.model, availableCpus: availableParallelism(), hostMemoryBytes: totalmem() },
    alertPercent, candidate, baseline, comparisonStatus: baseline ? 'PAIRED' : 'UNPAIRED',
    ...(unpairedReference && { unpairedReference }), results,
  };
}

function publish(destination, report) {
  const temporary = `${destination}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(report, null, 2) + '\n');
  renameSync(temporary, destination);
}

function main() {
  const { values } = parseArgs({ options: {
    mode: { type: 'string', default: 'fast' }, profile: { type: 'string', multiple: true },
    samples: { type: 'string' }, baseline: { type: 'string' }, 'baseline-if-compatible': { type: 'boolean' },
    output: { type: 'string', default: 'build/performance-regression/report.json' },
    'alert-percent': { type: 'string', default: '20' },
  } });
  const destination = resolve(values.output);
  mkdirSync(dirname(destination), { recursive: true });
  const initial = { schemaVersion: 1, kind: 'offline-host-resource-pressure', timeUtc: new Date().toISOString() };
  publish(destination, { ...initial, status: 'RUNNING' });
  try {
    const report = suite(values);
    publish(destination, report);
    console.log(`Performance report ${report.status}: ${destination}`);
    if (report.status !== 'PASS') process.exitCode = 1;
  } catch (error) {
    publish(destination, { ...initial, status: 'FAIL', error: error.message });
    console.error(`Performance report FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
