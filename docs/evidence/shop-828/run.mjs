import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cpus } from 'node:os';

const [checkoutArgument, tag, repetitions = '9'] = process.argv.slice(2);
if (!checkoutArgument || !tag || !/^\d+$/.test(repetitions)) throw new Error('Usage: node run.mjs <checkout> <tag> [repetitions]');
const scripts = dirname(fileURLToPath(import.meta.url));
const checkout = resolve(checkoutArgument);
const artifacts = resolve(tag);
const generated = join(artifacts, 'generated');
mkdirSync(generated, { recursive: true });
process.chdir(checkout);
const loadScript = name => import(pathToFileURL(join(checkout, 'scripts', name)));
const { buildUI } = await loadScript('build-ui.mjs');
const { buildLuaData, luaString, toLua } = await loadScript('build-lua-data.mjs');
buildLuaData('data', join(generated, 'abyss_data.lua'));
const refinedReleaseMonsterArt = process.env.SHOP_REFINED_RELEASE === '1';
buildUI(generated, undefined, { officialAssets: true, nativePageLifecycle: true, refinedReleaseMonsterArt });
const modules = readdirSync(generated).filter(name => name.endsWith('.lua')).map(name => basename(name, '.lua'));
const visual = readFileSync('scripts/official-assets-preview.lua', 'utf8')
    .replace("scale=c.scale,image=c.imageId", "scale=c.scale or s.scale,pivot=c.pivot or s.pivot,fill=s.fill,image=c.imageId")
    .replace("rotation=c.localRotationZ or(c.rotation and c.rotation[3])", "rotation=c.localRotationZ or(c.rotation and c.rotation[3]) or s.rotation");
writeFileSync(join(artifacts, 'visual-tree.lua'), visual);
const prelude = `
ARTIFACTS=${luaString(artifacts)}
local generated=${luaString(generated)}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,n in ipairs(${toLua(modules)}) do package.preload[n]=assert(loadfile(generated..'/'..n..'.lua')) end
local GameUI=require('abyss_game_ui')
local create=GameUI.new
local F
GameUI.new=function(root,data,presentation,event,platform)
    platform.nativePageLifecycle=true
    for _,name in ipairs({'nodePanel','choicePanel'}) do
        local panel=root:GetChild(name)
        local previous,active=getmetatable(panel),true
        setmetatable(panel,{
            __index=function(c,k) if k=='active' then return active end;return previous.__index(c,k) end,
            __newindex=function(c,k,v) assert(k~='active');return previous.__newindex(c,k,v) end,
        })
        panel.SetActive=function(c,v) active=v;F.setEngineActive(c,v) end
    end
    return create(root,data,presentation,event,platform)
end
F=dofile('tests/lua/support/game_ui_fixture.lua')
dofile(${luaString(join(scripts, 'shop-fixture.lua'))})
`;
const preludePath = join(artifacts, 'prelude.lua');
writeFileSync(preludePath, prelude);
const require = createRequire(join(checkout, 'package.json'));
const lua = require.resolve('fengari-node-cli/src/lua-cli.js');
const result = spawnSync(process.execPath, [lua, '-e', `dofile(${luaString(preludePath)})`], {
    cwd: checkout, encoding: 'utf8', timeout: 180_000, maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, LUA_INIT: '', LUA_INIT_5_3: '', SHOP_REPETITIONS: repetitions }
});
writeFileSync(join(artifacts, 'raw.log'), result.stdout + result.stderr);
if (result.error || result.status !== 0) throw new Error(result.stderr || String(result.error));
const metrics = {}, ready = {}, visibility = {};
for (const line of result.stdout.split('\n')) {
    const [type, i, stage, elapsed, ...entries] = line.split('\t');
    if (type === 'SHOP_BENCH') {
        const operations = {}, spans = {};
        for (const entry of entries) {
            const [key, value] = entry.split('=');
            if (key.startsWith('@')) spans[key.slice(1)] = Number(value);
            else operations[key] = Number(value);
        }
        (metrics[stage] ??= []).push({ fixture: Number(i), elapsedMs: Number(elapsed), operations, spans });
    }
    if (type === 'SHOP_READY') (ready[stage] ??= []).push({ roomTicks: Number(elapsed), shelfTicks: Number(entries[0]), firstShelfTick: Number(entries[1]) });
    if (type === 'SHOP_VIS') visibility[i + '.' + stage] = {
        simulatedTicks: Number(elapsed), room: entries[0] === '1', portrait: entries[1] === '1',
        shelf: entries[2] === '1', shelfY: Number(entries[3]), busy: entries[4] === '1',
    };
}
const quantile = (values, percentage) => values.slice().sort((a, b) => a - b)[Math.ceil(values.length * percentage) - 1];
const summary = Object.fromEntries(Object.entries(metrics).map(([name, rows]) => {
    const elapsed = rows.map(row => row.elapsedMs);
    const byArea = {};
    for (const area of ['panel', 'shopView', 'merchant', 'nodeOther']) {
        const operations = rows.map(row => Object.entries(row.operations)
            .filter(([key]) => key.startsWith(area + '.'))
            .reduce((sum, [key, count]) => sum + count, 0));
        byArea[area] = { p50: quantile(operations, .5), p95: quantile(operations, .95) };
    }
    const keys = [...new Set(rows.flatMap(row => Object.keys(row.spans)))];
    const spans = Object.fromEntries(keys.map(key => {
        const values = rows.map(row => row.spans[key]).filter(value => value !== undefined);
        return [key, { p50: quantile(values, .5), p95: quantile(values, .95), samples: values.length }];
    }));
    return [name, {
        samples: rows.length,
        elapsedMs: { p50: quantile(elapsed, .5), p95: quantile(elapsed, .95), max: Math.max(...elapsed) },
        allOperations: { p95: quantile(rows.map(row => Object.values(row.operations).reduce((sum, count) => sum + count, 0)), .95) },
        byArea, spans,
    }];
}));
const children = node => node?.children ?? node?.controls ?? [];
const find = (node, name) => node?.name === name ? node : children(node).map(child => find(child, name)).find(Boolean);
const countControls = node => {
    const counts = {};
    const walk = control => {
        if (!control) return;
        counts[control.kind] = (counts[control.kind] ?? 0) + 1;
        children(control).forEach(walk);
    };
    walk(node);
    return counts;
};
const gameLayout = JSON.parse(readFileSync(join(generated, 'game-ui.json'), 'utf8'));
const node = find(gameLayout, 'nodePanel');
const controls = Object.fromEntries(
    ['nodePanel', 'shopRoom', 'shopView', 'merchant'].map(name => [name, countControls(find(node, name))]));
const source = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: checkout }).stdout.trim();
const trackMask = /(?:^| [^ ]*)\b(?:data|src\/lua|scripts|tests)\//;
const changed = spawnSync('git', ['-c', 'filter.lfs.clean=git-lfs clean -- %f', 'status', '--short'], { encoding: 'utf8', cwd: checkout }).stdout.trim().split('\n').filter(line => trackMask.test(line));
const report = {
    source, changed, profile: refinedReleaseMonsterArt ? 'official-assets-battle-v3' : 'official-assets-battle-v2', node: process.version, host: { platform: process.platform, arch: process.arch, cpu: cpus()[0]?.model }, repetitions: Number(repetitions),
    limitation: 'Instrumented Fengari mock control tree. Wall-clock JS/Lua execution only. No GPU, client frame timing or official device latency.',
    simulatedFps: 30, dwellTicks: Number(process.env.SHOP_DWELL_TICKS ?? 0), controls, visibility, ready, summary, metrics
};
writeFileSync(join(artifacts, 'report.json'), JSON.stringify(report, null, 2) + '\n');
const prefix = 'OFFICIAL_VISUAL_SCENES ';
const visualLine = result.stdout.split('\n').find(line => line.startsWith(prefix));
if (!visualLine) throw new Error('Missing visual scene capture');
writeFileSync(join(artifacts, 'scenes.json'), visualLine.slice(prefix.length) + '\n');
console.log(JSON.stringify({ artifacts, source, changed, visibility, ready, summary }, null, 2));
