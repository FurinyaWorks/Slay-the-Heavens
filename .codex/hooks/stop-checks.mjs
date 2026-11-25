import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
process.chdir(root);
const deadline = Date.now() + 165_000;

function check(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
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

let phase = '读取 Stop 事件';
try {
  const input = readFileSync(0, 'utf8');
  if (input.trim()) JSON.parse(input);
  phase = '语法与数据类型';
  check(['scripts/check-syntax.mjs']);
  check(['scripts/check-release-text.mjs']);
  check(['scripts/validate-data.mjs']);
  phase = 'Lua lint';
  await lintLua();
  phase = '核心单测';
  check(['scripts/build-lua-data.mjs']);
  check(['--test', '--test-reporter=dot', 'tests/validate-map-contract.test.mjs', 'tests/lua-static.test.mjs']);
  check(['scripts/test-lua.mjs', 'tests/lua/combat.lua']);
} catch (error) {
  const command = error.message.slice(0, 3400);
  console.error(`[收工检查] ${phase}失败\n工作树 ${process.cwd()}\n${command}\n修复后再结束，本检查会重新运行。`);
  process.exitCode = 2;
}
