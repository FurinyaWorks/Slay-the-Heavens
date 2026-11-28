import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const [source, destination] = process.argv.slice(2);
const out = resolve(destination);
const support = resolve(source, 'tests/lua/support');
const fixture = fileURLToPath(new URL('capture.lua', import.meta.url));
process.chdir(source);
const require = createRequire(resolve('package.json'));
const { buildUI } = await import(pathToFileURL(resolve('scripts/build-ui.mjs')));
const { buildLuaData, luaString, toLua } = await import(pathToFileURL(resolve('scripts/build-lua-data.mjs')));
const generated = join(out, 'generated');
mkdirSync(generated, { recursive: true });
buildLuaData('data', join(generated, 'abyss_data.lua'));
buildUI(generated, undefined, { officialAssets: true, nativePageLifecycle: true, refinedReleaseMonsterArt: true, experimentalCharacters: false });
const modules = readdirSync(generated).filter(n => n.endsWith('.lua')).map(n => n.slice(0, -4));
const prelude = `package.path=${luaString(generated+'/?.lua;src/lua/?.lua')}
for _,n in ipairs(${toLua(modules)}) do package.preload[n]=assert(loadfile(${luaString(generated+'/')}..n..'.lua')) end
SUPPORT=${luaString(support+'/')}
local rawDofile=dofile
function dofile(path)
 if path=='tests/lua/support/game_ui_fixture.lua' then return rawDofile(SUPPORT..'game_ui_fixture.lua') end
 return rawDofile(path)
end
dofile(${luaString(fixture)})`;
const lua = process.env.ABYSS_HUD_LUA;
const result = spawnSync(lua || process.execPath, lua ? ['-e', prelude] :
  [process.env.CAPTURE_FENGARI || require.resolve('fengari-node-cli/src/lua-cli.js'), '-e', prelude], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 180000 });
writeFileSync(join(out, 'host.log'), result.stdout + result.stderr);
if (result.status !== 0) throw Error(result.stderr || result.error);
const frames = result.stdout.split('\n').filter(line => line.startsWith('FRAME ')).map(line => JSON.parse(line.slice(6)));
writeFileSync(join(out, 'scenes.json'), JSON.stringify(frames));
const git = ref => spawnSync('git', ['rev-parse', ref], { encoding: 'utf8' }).stdout.trim();
writeFileSync(join(out, 'identity.json'), JSON.stringify({
  commit: git('HEAD'), tree: git('HEAD^{tree}'), frames: frames.length,
  productionDiffSha256: createHash('sha256').update(spawnSync('git',
    ['diff', '--binary', 'HEAD', '--', 'src/lua', 'scripts', 'data/presentation'], {maxBuffer: 64 * 1024 * 1024}).stdout).digest('hex'),
  generatedThemeSha256: createHash('sha256').update(readFileSync(join(generated,'abyss_theme.lua'))).digest('hex'),
  build: { officialAssets: true, nativePageLifecycle: true, refinedReleaseMonsterArt: true, experimentalCharacters: false },
  scenesSha256: createHash('sha256').update(JSON.stringify(frames)).digest('hex'),
}, null, 2)+'\n');
console.log(`Captured ${frames.length} Lua Host projections in ${out}`);
