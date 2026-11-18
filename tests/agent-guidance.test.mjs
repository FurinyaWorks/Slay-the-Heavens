import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assessSlice } from '../scripts/check-pr-slice.mjs';
import { auditGuidance } from '../scripts/check-agent-guidance.mjs';
import { releaseBootstrapCiRead } from './helpers/release-bootstrap-ci-source.mjs';
import { preRetirementSource } from './helpers/presentation-announcement-retirement.mjs';

function fixture(t, overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'agent-guidance-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const files = {
    'package.json': JSON.stringify({ scripts: { check: 'node check.mjs' } }),
    'AGENTS.md': '# Project\n[Guide](docs/guide.md)\n`npm run check`\n',
    'docs/guide.md': '# Guide\n',
    'CLAUDE.md': '[Rules](AGENTS.md)\n',
    '.cursor/rules/miliastra.mdc': '[Rules](../../AGENTS.md)\n',
    ...overrides,
  };
  for (const [file, content] of Object.entries(files)) {
    if (content === null) continue;
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  }
  return auditGuidance(root);
}

test('repository entry points fit their budgets and reference existing commands and files', () => {
  assert.deepEqual(auditGuidance().errors, []);
});
test('local full check and the common CI impact job enforce guidance before routing', () => {
  const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
  assert.match(scripts['check:rules'], /(?:^| && )npm run check:guidance(?: && |$)/);
  assert.match(scripts.check, /(?:^| && )npm run check:rules(?: && |$)/);
  const workflow = readFileSync('.github/workflows/quality.yml', 'utf8').replaceAll('\r\n', '\n');
  const impact = workflow.match(/^  impact:\n([\s\S]*?)(?=^  fast:)/m)?.[1];
  assert.ok(impact);
  assert.equal(impact.split('run: npm run check:guidance\n').length, 2);
  assert.ok(impact.indexOf('run: npm run check:guidance\n') < impact.indexOf('      - id: plan\n'));
});
test('historical package replay accepts only the exact guidance additions', () => {
  // Replay the complete package that owned this historical contract. The live
  // package/commands remain checked independently by the two tests above.
  const archived = JSON.parse(readFileSync('tests/fixtures/guidance-package-1057.json', 'utf8'));
  assert.equal(archived.sourceCommit, '1057b009fbb9f3748a69ffe68a2cf8a3410fa30a');
  assert.equal(archived.path, 'package.json');
  assert.equal(archived.blobSha, 'd300a838ddfae396438ca323ca92b0a3adbd2ab4');
  assert.equal(archived.sha256, '9736ee15b4d42e9703663ec92a7c1cf4a53001e2e24df951022cc5940e57e378');
  const current = archived.source;
  assert.equal(createHash('sha256').update(current).digest('hex'), archived.sha256);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(current)}\0`).update(current).digest('hex'), archived.blobSha);
  assert.doesNotThrow(() => preRetirementSource('package.json', current));
  for (const changed of [
    current.replace('node scripts/check-agent-guidance.mjs', 'node scripts/other.mjs'),
    current.replace('npm run check:guidance && ', 'npm run unknown && '),
    current.replace('npm run check:syntax', 'npm run unknown'),
    current.replace('"version": "0.11.0"', '"version": "1.0.0"'),
  ]) {
    assert.notEqual(changed, current);
    assert.throws(() => preRetirementSource('package.json', changed), /drift/);
  }
});
test('small adapters resolve links relative to their own directory', t => {
  assert.deepEqual(fixture(t).errors, []);
});
test('both line and Unicode character budgets fail closed', t => {
  assert.match(fixture(t, { 'AGENTS.md': '# Rules\n'.repeat(81) }).errors.join('\n'), /budget exceeded/);
  assert.match(fixture(t, { 'AGENTS.md': '规'.repeat(5001) }).errors.join('\n'), /budget exceeded/);
  assert.match(fixture(t, { 'CLAUDE.md': '[Rules](AGENTS.md)\n' + 'a'.repeat(1000) }).errors.join('\n'), /budget exceeded/);
});
test('missing files, broken links and paths outside the repo are rejected', t => {
  const result = fixture(t, {
    'CLAUDE.md': null,
    'AGENTS.md': '[missing](docs/missing.md)\n[outside](../package.json)\n[directory](docs)\n[drive](C:/outside.md)\n[file](file:///outside)\n',
  });
  assert.equal(result.errors.length, 6);
  assert.match(result.errors.join('\n'), /missing guidance/);
  assert.equal(result.errors.filter(e => e.includes('invalid local link')).length, 5);
});
test('unknown commands and policy copies in adapters are rejected', t => {
  const result = fixture(t, {
    'AGENTS.md': '`npm run nonexistent`\n',
    'CLAUDE.md': '[Guide](docs/guide.md)\n## Duplicate rules\n',
  });
  assert.equal(result.errors.length, 3);
  assert.match(result.errors.join('\n'), /unknown npm script/);
  assert.match(result.errors.join('\n'), /adapter must link/);
  assert.match(result.errors.join('\n'), /must not add policy/);
});


test('counts additions and deletions in production separately from tests and evidence', () => {
  const input = '200\t200\tsrc/a.lua\0' + '450\t0\ttests/a.test.mjs\0' + '-\t-\tdocs/evidence/log.gz\0';
  assert.deepEqual(assessSlice(input), {
    lines: 850, files: 3, productionLines: 400, productionFiles: 1, productionBinaries: 0, evidenceLines: 0, evidenceFiles: 1, decision: 'WITHIN_BUDGET',
  });
  assert.equal(assessSlice(input + '0\t1\tconfig/x.json\0').decision, 'SPLIT_REQUIRED');
});

test('requires a reason and verification for an oversized slice', () => {
  const rows = Array.from({ length: 11 }, (_, i) => `1\t0\tdata/${i}.json\0`).join('');
  assert.equal(assessSlice(rows, 'Slice-exception: atomic | interface migration |').decision, 'SPLIT_REQUIRED');
  assert.equal(assessSlice(rows, 'Slice-exception: atomic | interface migration | npm run test:related').decision, 'REVIEW_EXCEPTION');
  assert.equal(assessSlice(rows, '<!--\nSlice-exception: atomic | placeholder | placeholder\n-->').decision, 'SPLIT_REQUIRED');
  assert.equal(assessSlice('-\t-\tsrc/asset.bin\0').decision, 'SPLIT_REQUIRED');
  assert.equal(assessSlice('401\t0\tdocs/evidence/output.log\0').decision, 'SPLIT_REQUIRED');
  assert.equal(assessSlice('401\t0\ttests/necessary.test.mjs\0').decision, 'WITHIN_BUDGET');
});

test('hosted size check binds both exact PR parents and consumes the visible exception', t => {
  const root = mkdtempSync(join(tmpdir(), 'pr-slice-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git('init', '--initial-branch=develop', '--quiet');
  git('config', 'user.name', 'Integration fixture');
  git('config', 'user.email', 'integration@example.invalid');
  git('commit', '--allow-empty', '-qm', 'base');
  const base = git('rev-parse', 'HEAD');
  git('checkout', '-qb', 'slice');
  mkdirSync(join(root, 'src'));
  writeFileSync(join(root, 'src', 'large.lua'), 'local row\n'.repeat(401));
  git('add', 'src');
  git('commit', '-qm', 'slice');
  const head = git('rev-parse', 'HEAD');
  git('checkout', '-q', 'develop');
  git('merge', '--no-ff', '-qm', 'candidate', 'slice');

  const event = join(root, 'event.json');
  const guard = fileURLToPath(new URL('../scripts/check-pr-slice.mjs', import.meta.url)).replaceAll('\\', '/');
  const env = { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'pull_request',
    GITHUB_EVENT_PATH: event, GITHUB_SHA: git('rev-parse', 'HEAD') };
  function run(ref, sha, body = '') {
    writeFileSync(event, JSON.stringify({ pull_request: { base: { ref, sha }, head: { sha: head }, body } }));
    return spawnSync(process.execPath, ['--input-type=module', '-e',
      `import { checkHostedSlice } from ${JSON.stringify(new URL('../scripts/check-pr-slice.mjs', import.meta.url).href)}; checkHostedSlice();`],
      { cwd: root, env, encoding: 'utf8' });
  }
  assert.match(run('develop', head).stderr, /differs from the event HEAD\/BASE/);
  assert.match(run('develop', base).stderr, /Split the production change/);
  assert.match(run('develop', base, 'Slice-exception: atomic | compatibility migration | npm run test:related').stdout, /REVIEW_EXCEPTION/);
  assert.equal(run('release/v2.0.0', base).status, 0);

  mkdirSync(join(root, 'backlog', 'tasks'), { recursive: true });
  mkdirSync(join(root, 'config'));
  writeFileSync(join(root, 'backlog', 'tasks', 'task-999 - fixture.md'), '---\nid: TASK-999\nstatus: To Do\n---\n');
  writeFileSync(join(root, 'config', 'task-intake.json'), '{"schemaVersion":1,"blockedUntilOwnerApproval":[]}');
  const intake = (...args) => spawnSync(process.execPath, [guard, '--start', 'TASK-999', ...args], { cwd: root, encoding: 'utf8' });
  assert.match(intake().stdout, /^HOLD TASK-999/);
  assert.match(intake('--slice', 'Migrate one compatible caller', '--verify', 'npm run test:related').stdout, /^ALLOW TASK-999/);
});

test('historical guidance receipts verify their exact predecessor and preserve foreign inputs', () => {
  const path = 'scripts/check-agent-guidance.mjs';
  const source = readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
  const project = (value, file = path) => releaseBootstrapCiRead(() => value)(file, 'utf8');
  const predecessor = project(source);
  assert.equal(createHash('sha256').update(predecessor).digest('hex'), '7e668ec2609dff8de73f0e39a048cd93780f4ad42d2ef2fb2f3a5be346532b18');
  assert.equal(project(source.replaceAll('\n', '\r\n')), predecessor);
  for (const unknown of [source+'\n', source.slice(1), source.replaceAll('\n', '\r\r\n')]) assert.equal(project(unknown), unknown);
  assert.equal(project(source, 'scripts/foreign.mjs'), source);
});
