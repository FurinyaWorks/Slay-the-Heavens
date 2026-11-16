import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [rootArg, fixturesArg, outputArg] = process.argv.slice(2);
if (!rootArg || !fixturesArg || !outputArg) {
  throw Error('Usage: node loader-run.mjs <repo> <fixture-parent> <existing-output-dir>');
}
const root = resolve(rootArg), fixtures = resolve(fixturesArg), out = resolve(outputArg);
const probe = fileURLToPath(new URL('./loader-boundary.lua', import.meta.url));
const results = [];
for (const profile of ['include', 'omit']) {
  const result = spawnSync(process.execPath, [
    join(root, 'node_modules/fengari-node-cli/src/lua-cli.js'), '-e',
    `package.path=${JSON.stringify(join(fixtures, profile, '?.lua'))};package.cpath='';EXPECT_OMIT=${profile === 'omit'};dofile(${JSON.stringify(probe)})`,
  ], { cwd: root, encoding: 'utf8', timeout: 20000, env: { ...process.env, LUA_INIT: '', LUA_INIT_5_3: '' } });
  writeFileSync(join(out, profile + '-loader.log'), (result.stdout ?? '') + '\n' + (result.stderr ?? ''));
  results.push({ profile, status: result.status, error: result.error?.code });
}
writeFileSync(join(out, 'loader-results.json'), JSON.stringify(results, null, 2) + '\n');
if (results.some(result => result.status !== 0)) process.exitCode = 1;
