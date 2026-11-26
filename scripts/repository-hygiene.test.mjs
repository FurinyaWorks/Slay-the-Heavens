import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(new URL('./repository-hygiene.mjs', import.meta.url));

function candidate(t, files, additional = {}, options = {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'sth-hygiene-test-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const command = (exe, args) => spawnSync(exe, args, { cwd, encoding: 'utf8' });
  function git(...args) {
    const result = command('git', args);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  const put = entries => {
    for (const [name, data] of Object.entries(entries)) {
      const filename = join(cwd, name);
      mkdirSync(dirname(filename), { recursive: true });
      writeFileSync(filename, data);
    }
    git('add', '-f', '--all');
  };

  git('init', '-q');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'user.name', 'Hygiene fixture');
  put({ '.gitignore': '*.log\n*.log.*\n.env\n', ...options.base });
  git('commit', '-qm', 'base');
  const base = git('rev-parse', 'HEAD');
  put({ ...files, ...additional });
  git('commit', '-qm', 'candidate');
  const result = command(process.execPath, [path, base]);
  return { status: result.status, message: result.stderr + result.stdout };
}

test('ordinary source, example env and formal images pass', t => {
  const result = candidate(t, {
    'src/main.lua': 'return 1\n',
    '.env.example': 'SERVICE_URL=https://example.invalid\n',
    'experiments/art-tech-lab/seed.save.json': '{}\n',
    'art/official-image.png': Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    'art/exact-size.bin': Buffer.alloc(5 * 1024 * 1024),
  });
  assert.equal(result.status, 0, result.message);
});

test('forced track, generated path, raw save, archives, oversize or forged LFS fail', t => {
  const result = candidate(t, {
    'output/run.log.1': 'temporary',
    'output/.gitignore': '!bypass.log\n!capture.save.json\n!session.save\n',
    'output/bypass.log': 'still prohibited',
    'output/capture.save.json': 'save',
    'output/session.save': 'save',
    'packages/app/node_modules/library/index.js': 'generated',
    'docs/evidence/game.save.json.gz': 'save',
    'docs/evidence/diagnostics.tar.xz': 'archive',
    'asset.bin': Buffer.alloc(5 * 1024 * 1024 + 1),
    '.gitattributes': 'art/bad.png filter=lfs\n',
    'art/bad.png': 'version https://git-lfs.github.com/spec/v1\noid sha256:' + '1'.repeat(64) + '\nsize 100000000\n',
  });
  assert.equal(result.status, 1);
  assert.ok(result.message.includes('"output/capture.save.json": raw runtime save'), result.message);
  assert.ok(result.message.includes('"output/session.save": raw runtime save'), result.message);
  for (const expected of [
    'tracked ignored file', 'prohibited file type', 'generated output', 'raw runtime save', 'unapproved archive',
    'oversize Git blob', 'unapproved or malformed LFS object',
  ]) assert.ok(result.message.includes(expected), result.message);
});

test('real scanner rejects a synthetic credential even with an inline bypass comment', t => {
  const synthetic = 'gh' + 'p_M7Q24m5CYp31ZWS8qh76e4RKv9FXbj2Ls0ta';
  const result = candidate(t, { 'src/index.js': `export const code = "${synthetic}" // gitleaks:allow\n` });
  assert.equal(result.status, 1);
  assert.match(result.message, /Gitleaks found a credential candidate or could not complete/);
  assert.ok(!result.message.includes(synthetic));
});
