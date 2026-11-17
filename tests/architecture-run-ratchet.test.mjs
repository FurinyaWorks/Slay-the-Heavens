import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync}from'node:fs';
import{gunzipSync}from'node:zlib';
import{createHash}from'node:crypto';
import{spawnSync}from'node:child_process';
import{requireLuaTool}from'../scripts/setup-lua-static.mjs';
import{parseDiagnostics}from'../scripts/check-lua-static.mjs';
import{measureSources}from'../scripts/lua-quality-metrics.mjs';
const archive=readFileSync('tests/architecture-run-ratchet-before.json.gz');
assert.equal(createHash('sha256').update(archive).digest('hex'),"303405a57305b3044cc373b5d556731a1c78aa912accc4c888d96b51110daa53");
const baseline=JSON.parse(gunzipSync(archive));
for(const [file,before]of Object.entries(baseline.sources))test(`Run owner refactor ${file}: changed command and every introduced helper CC15`,()=>{
 const source=readFileSync(file,'utf8'),p=spawnSync(requireLuaTool().file,[file,'--formatter','plain','--codes','--ranges','--no-color','--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:10000});
 assert.ifError(p.error);assert([0,1].includes(p.status),p.stdout+p.stderr);assert.equal(p.stderr,'');
 const measured=measureSources({[file]:source},parseDiagnostics(p.stdout));assert.deepEqual(measured.errors,[]);
 const roots=measured.modules[0].functions.filter(fn=>fn.name===(file.endsWith('_ui.lua')?'ctx.renderRelicPending':'M.claim'));
 assert.equal(roots.length,1,'exact command responsibility');const root=roots[0];
 const oldIds=new Set(baseline.functionIds[file]);
 for(const fn of measured.modules[0].functions.filter(fn=>fn.id===root.id||fn.id.startsWith(root.id+'/')||!oldIds.has(fn.id)))assert(fn.complexity<=15,`${fn.id}: CC${fn.complexity} exceeds 15`);
});

import{createRequire}from'node:module';
import{luaString}from'../scripts/build-lua-data.mjs';
import{installLuaGraphObserver}from'./helpers/lua-graph-observer.mjs';
const{lua,lauxlib,lualib,to_luastring,to_jsstring}=createRequire(import.meta.url)('fengari');
function replay(sources){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);const graphs=[];
 installLuaGraphObserver(L,'RUN_RATCHET_GRAPH',(label,graph)=>graphs.push({label,graph:JSON.parse(graph)}));
 const preload=Object.entries(sources).map(([file,source])=>`package.preload[${luaString(file.slice(8,-4))}]=assert(load(${luaString(source)},'@${file}'))`).join('\n');
 const status=lauxlib.luaL_dostring(L,to_luastring(`package.path='src/lua/?.lua;build/lua/?.lua;'..package.path\n${preload}\ndofile('tests/architecture-run-ratchet-probes.lua')`));
 const error=status?to_jsstring(lua.lua_tostring(L,-1)):null;lua.lua_close(L);return{status,error,graphs};
}
let baselineReplay;
const originalReplay=()=>baselineReplay??=replay(baseline.sources);
test('permanent reward command splits preserve dynamic host slots, full graphs, errors, replacement owners and native UI reentry',t=>{
 const before=originalReplay(),current=replay(Object.fromEntries(Object.keys(baseline.sources).map(file=>[file,readFileSync(file,'utf8')])));
 assert.equal(before.status,0,before.error);assert.equal(current.status,0,current.error);assert(before.graphs.length>=1200);
 assert.deepEqual(current,before);t.diagnostic(`${before.graphs.length} complete independent old/new graph checkpoints`);
});

for(const [name,file,from,to,label]of [
 ['Card Reward reacquires committed group','src/lua/abyss_relic_card_rewards.lua','staged.rewards.cardRewardGroups[index].resolved=true','group.resolved=true','cards:3:3:replace'],
 ['Boss gold retains original pending owner','src/lua/abyss_boss_relics.lua','p.goldClaimed=true','staged.pendingBossRelic.goldClaimed=true','boss:gold:3:replace'],
 ['Shop rewards reacquire the committed screen','src/lua/abyss_relic_choices.lua','p=assert(screen(run,token));p.items[index].claimed=true','p.items[index].claimed=true','choices:3:3:replace'],
])test(`Run reward oracle rejects semantic owner regression: ${name}`,()=>{
 const sources=Object.fromEntries(Object.keys(baseline.sources).map(path=>[path,readFileSync(path,'utf8')]));
 assert.equal(sources[file].split(from).length,2,'exact owner mutation target');
 sources[file]=sources[file].replace(from,to);const original=originalReplay(),mutant=replay(sources);
 assert.equal(mutant.status,0,mutant.error);const before=original.graphs.find(row=>row.label===label),after=mutant.graphs.find(row=>row.label===label);
 assert(before&&after,'named owner boundary is exercised');assert.notDeepEqual(after,before);
});
