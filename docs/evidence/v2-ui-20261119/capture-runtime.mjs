import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildUI } from '../../../scripts/build-ui.mjs';
import { buildLuaData, luaString } from '../../../scripts/build-lua-data.mjs';

assert(process.argv[2], 'Pass an output directory for offline evidence');
const output = resolve(process.argv[2]);
const generated = join(output, 'generated');
mkdirSync(generated, { recursive: true });
buildLuaData('data', join(generated, 'abyss_data.lua'));
buildUI(generated, undefined, { officialAssets: true, nativePageLifecycle: true });

const require = createRequire(import.meta.url);
const driver = fileURLToPath(new URL('capture-runtime.lua', import.meta.url));
const command = `package.path=${luaString(generated + '/?.lua;src/lua/?.lua')};dofile(${luaString(driver)})`;
const result = spawnSync(process.execPath, [require.resolve('fengari-node-cli/src/lua-cli.js'), '-e', command], {
  encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 120000, env: { ...process.env, LUA_INIT: '', LUA_INIT_5_3: '' }
});
assert.equal(result.status, 0, result.error?.message ?? result.stderr);
const prefix = 'OFFICIAL_VISUAL_SCENES ';
const lines = result.stdout.trimEnd().split('\n');
const scenes = lines.find(line => line.startsWith(prefix));
assert(scenes, result.stdout);
writeFileSync(join(output, 'scenes.json'), JSON.stringify(JSON.parse(scenes.slice(prefix.length))));
console.log(lines.filter(line => !line.startsWith(prefix)).join('\n'));
