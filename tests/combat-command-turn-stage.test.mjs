import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {discoverSources,measureSources} from '../scripts/lua-quality-metrics.mjs';
import {runStatic} from '../scripts/check-lua-static.mjs';
import {luaString} from '../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './helpers/lua-graph-observer.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const archive=readFileSync('tests/fixtures/turn-start-stage-before.json.gz');
assert.equal(hash(archive),'2664fd83ba9fd81b65e0d0526f3bcd4d7607c2e35bc5366baea21d69ea829f16');
const before=JSON.parse(gunzipSync(archive));assert.equal(hash(before.source),before.sha256);
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
test('Combat stays within its existing 2295-line budget and command/turn-start stages stay within CC15',()=>{
 const combat=readFileSync('src/lua/abyss_combat.lua','utf8');
 assert(combat.trimEnd().split('\n').length<=2295,'Combat exceeds the existing 2295-line owner budget');
});
test('explicit command installation and turn-start stages stay within CC15',()=>{
 const measurements=measureSources(discoverSources(),runStatic(['--max-cyclomatic-complexity','0','--only','561']).diagnostics);
 assert.deepEqual(measurements.errors,[]);
 const selected=measurements.modules.flatMap(m=>m.file==='src/lua/abyss_combat_commands.lua'?m.functions:m.file==='src/lua/abyss_turn_powers.lua'?m.functions.filter(f=>f.name==='M.prepareStart'||/startPower/.test(f.name)):[]);
 assert(selected.some(f=>f.name==='M.prepareStart'));
 assert.deepEqual(selected.filter(f=>f.complexity>15).map(f=>`${f.name}=${f.complexity}`),[]);
 assert(existsSync('src/lua/abyss_combat_commands.lua'),'explicit command installation owner missing');
});
function replay(old){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);const graphs=[];
 installLuaGraphObserver(L,'TURN_STAGE_GRAPH',(label,graph)=>graphs.push({label,sha256:hash(graph),bytes:Buffer.byteLength(graph)}));
 const preload=old?`package.preload.abyss_turn_powers=assert(load(${luaString(before.source)},'@src/lua/abyss_turn_powers.lua'))`:'';
 const script=`package.path='src/lua/?.lua;build/lua/?.lua;tests/lua/?.lua;'..package.path\n${preload}
 local Turns=require('abyss_turn_powers');local prepare=Turns.prepareStart
 Turns.prepareStart=function(...)
  local args=table.pack(...);local returned=table.pack(pcall(prepare,...))
  local observed=table.pack(table.unpack(returned,1,returned.n))
  if not observed[1]and type(observed[2])=='string'then observed[2]=observed[2]:gsub('^.-:%d+: ','')end
  TURN_STAGE_GRAPH_WRITE({state=args[1],returned=observed},'prepareStart',true)
  if not returned[1]then error(returned[2],0)end
  return table.unpack(returned,2,returned.n)
 end
 dofile('tests/lua/turn_power_plans.lua')`;
 const status=lauxlib.luaL_dostring(L,to_luastring(script));
 const error=status===0?null:to_jsstring(lua.lua_tostring(L,-1));lua.lua_close(L);return {status,error,graphs};
}
test('turn-start preparation preserves full graphs, RNG, hook order and refusal behavior',()=>{
 const old=replay(true),current=replay(false);assert.equal(old.status,0,old.error);assert.equal(current.status,0,current.error);
 assert(old.graphs.length>=20);assert.deepEqual(current,old);
});
