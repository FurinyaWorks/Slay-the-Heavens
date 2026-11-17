import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {discoverSources,measureSources} from '../scripts/lua-quality-metrics.mjs';
import {runStatic} from '../scripts/check-lua-static.mjs';
import {luaString} from '../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './helpers/lua-graph-observer.mjs';
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
const archive=readFileSync('tests/fixtures/core-actor-owner-before.json.gz');
assert.equal(createHash('sha256').update(archive).digest('hex'),'1c12e2eeb378258b33e7f6b04426d696bbfe20ef94efc5d4b58d714ef9291e6e');
const baseline=JSON.parse(gunzipSync(archive));
for(const {source,sha256} of Object.values(baseline.sources))assert.equal(createHash('sha256').update(source).digest('hex'),sha256);
const ownerNames=new Set(['queueDeathPower','M.resolveDamageReactions','attackFloat','tick']);
test('Actor damage, death and decay owners and newly extracted stages stay within CC15',()=>{
 const metrics=measureSources(discoverSources(),runStatic(['--max-cyclomatic-complexity','0','--only','561']).diagnostics);
 assert.deepEqual(metrics.errors,[]);
 const actor=metrics.modules.find(m=>m.file==='src/lua/abyss_actor.lua');
 const leaf=metrics.modules.find(m=>m.file==='src/lua/abyss_actor_attack_math.lua');
 const hotspots=[...leaf.functions.filter(f=>f.complexity>15).map(f=>`${leaf.file}:${f.name}=${f.complexity}`),...actor.functions.filter(f=>ownerNames.has(f.name)||/^(visitSourceDeath|finishMonsterDeath|looterGold|sporeDeath|resolveEffectReaction|applySourceAttack|applyReceiverAttack|triggerDecay|finishDecay|tickPower)/.test(f.name)).filter(f=>f.complexity>15).map(f=>`${f.name}=${f.complexity}`)];
 assert.deepEqual(hotspots,[]);
});
function replay(old){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);const graphs=[];
 installLuaGraphObserver(L,'ACTOR_GRAPH',(label,graph)=>graphs.push({label,graph}));
 const preloads=old?Object.entries(baseline.sources).map(([file,{source}])=>`package.preload[${luaString(file.slice(8,-4))}]=assert(load(${luaString(source)},'@${file}'))`).join('\n'):'';
 const script=`package.path='src/lua/?.lua;build/lua/?.lua;'..package.path\n${preloads}\ndofile('tests/helpers/core-actor-owner.lua')`;
 const status=lauxlib.luaL_dostring(L,to_luastring(script)),error=status===0?null:to_jsstring(lua.lua_tostring(L,-1));lua.lua_close(L);return {status,error,graphs};
}
test('Actor stages preserve complete graphs, float32 steps, death queues and decay errors',()=>{
 const before=replay(true),after=replay(false);assert.equal(before.status,0,before.error);assert.equal(after.status,0,after.error);
 assert.ok(before.graphs.length>=54);assert.deepEqual(after,before);
});
