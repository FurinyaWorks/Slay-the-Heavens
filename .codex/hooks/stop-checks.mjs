import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
process.chdir(root);
const deadline = Date.now() + 165_000;

function check(args, cwd = root) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: 'utf8',
    timeout: Math.max(1, deadline - Date.now()),
    maxBuffer: 4 * 1024 * 1024,
    windowsHide: true,
    env: { ...process.env, NO_COLOR: '1' },
  });
  if (result.status === 0) return;
  const output = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
  const excerpt = output.length <= 3000 ? output
    : `${output.slice(0, 1100)}\n… 中间输出已省略 …\n${output.slice(-1800)}`;
  const status = result.error?.message ?? result.signal ?? `exit ${result.status}`;
  throw new Error([`node ${args.join(' ')} (${status})`, excerpt].filter(Boolean).join('\n'));
}

function lintLua() {
  return import('../../scripts/check-lua-static.mjs').then(({ runStatic, compareDiagnostics }) => {
    const { diagnostics } = runStatic();
    const baseline = JSON.parse(readFileSync('config/luacheck-baseline.json', 'utf8'));
    const failures = compareDiagnostics(diagnostics, baseline.diagnostics);
    for (const diagnostic of diagnostics) {
      if (/^[WE]1/.test(diagnostic.code) && !failures.includes(diagnostic)) failures.push(diagnostic);
    }
    if (failures.length) {
      const examples = failures.slice(0, 12).map(({ file, line, column, code, message }) =>
        `${file}:${line}:${column} [${code}] ${message}`).join('\n');
      throw new Error(`Luacheck 共发现 ${failures.length} 项阻断诊断\n${examples}`);
    }
  });
}

function testCombat() {
  const work = mkdtempSync(join(tmpdir(), 'abyss-stop-combat-'));
  try {
    for (const folder of ['src', 'tests']) {
      symlinkSync(join(root, folder), join(work, folder), 'junction');
    }
    check(['scripts/build-lua-data.mjs', 'data', join(work, 'build/lua/abyss_data.lua')]);
    check([join(root, 'scripts/test-lua.mjs'), 'tests/lua/combat.lua'], work);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

let phase = '读取 Stop 事件';
let retry = false;
try {
  const input = readFileSync(0, 'utf8');
  if (input.trim()) retry = JSON.parse(input)?.stop_hook_active === true;
  phase = '语法与数据类型';
  check(['scripts/check-syntax.mjs']);
  check(['scripts/check-release-text.mjs']);
  check(['scripts/validate-data.mjs']);
  phase = 'Lua lint';
  await lintLua();
  phase = '核心单测';
  check(['--test', '--test-reporter=dot', 'tests/validate-map-contract.test.mjs', 'tests/lua-static.test.mjs']);
  testCombat();
} catch (error) {
  const command = error.message.slice(0, 3400);
  const message = `[收工检查] ${phase}失败\n工作树 ${process.cwd()}\n${command}`;
  if (retry) {
    console.log(JSON.stringify({
      continue: false,
      stopReason: '收工检查仍未通过，此轮阻塞。',
      systemMessage: message,
    }));
  } else {
    console.error(`${message}\n修复后再结束，本检查会重新运行。`);
    process.exitCode = 2;
  }
}
