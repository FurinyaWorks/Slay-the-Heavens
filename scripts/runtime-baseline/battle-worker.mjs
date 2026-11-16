// Same TASK-100 native observer + graph serializer; instrumentation is opt-in.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {resolve} from 'node:path';
import {instrumentTableLiterals} from './allocations.mjs';
import {installLuaGraphObserver} from '../../tests/helpers/lua-graph-observer.mjs';
const require=createRequire(import.meta.url),{lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
const [profile,sourceFile,mode,output]=process.argv.slice(2);
assert(['counts','allocations','visual'].includes(mode));
const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
const exec=source=>{if(lauxlib.luaL_dostring(L,to_luastring(source))!==lua.LUA_OK)throw Error(to_jsstring(lua.lua_tostring(L,-1)));};
function value(s,i){const t=lua.lua_type(s,i);if(t===lua.LUA_TNUMBER)return lua.lua_tonumber(s,i);if(t===lua.LUA_TBOOLEAN)return !!lua.lua_toboolean(s,i);if(t===lua.LUA_TSTRING)return to_jsstring(lua.lua_tostring(s,i));if(t===lua.LUA_TTABLE){i=lua.lua_absindex(s,i);const o={};lua.lua_pushnil(s);while(lua.lua_next(s,i)){o[value(s,-2)]=value(s,-1);lua.lua_pop(s,1);}return o;}return null;}
const hash=s=>createHash('sha256').update(s).digest('hex');
let visual=createHash('sha256'),coreHash,visualFrames=0;
const rows=[];let previous=performance.now();
function callback(name,f){lua.lua_pushjsfunction(L,f);lua.lua_setglobal(L,to_luastring(name));}
callback('VISUAL',s=>{visual.update(to_jsstring(lua.lua_tostring(s,1)));visualFrames++;return 0;});
installLuaGraphObserver(L,'RUN_GRAPH',(_label,graph)=>{coreHash=hash(graph);});
exec('function CORE(run) RUN_GRAPH_WRITE(run,"run") end');
callback('MARK',s=>{const now=performance.now();rows.push({phase:value(s,1),elapsedMs:now-previous,counts:value(s,2),frames:value(s,3),liveControls:value(s,4),effects:value(s,5),outputs:value(s,6),coreHash,visualHash:mode==='visual'?visual.digest('hex'):null,visualFrames,memory:process.memoryUsage()});visual=createHash('sha256');visualFrames=0;previous=performance.now();return 0;});
exec(`package.path=${JSON.stringify(resolve(profile).replaceAll('\\','/')+'/?.lua;./build/lua/?.lua;./src/lua/?.lua;')}..package.path;VERIFY_VISUAL=${mode==='visual'}`);
const target='abyss_monster_intent_particle_view';
const sources=new Map([[target,readFileSync(sourceFile,'utf8')]]);
if(mode==='allocations')for(const name of ['abyss_battle_card_view','abyss_battle_enemy_view','abyss_battle_render_actors','abyss_feedback_actor_painter','abyss_monster_intent_particles','abyss_monster_power_surfaces'])sources.set(name,readFileSync('src/lua/'+name+'.lua','utf8'));
for(const [name,original]of sources){
 let source=original;
 if(mode==='allocations')source=instrumentTableLiterals(source,name);
 exec(`package.preload[${JSON.stringify(name)}]=assert(load(${JSON.stringify(source)},${JSON.stringify('@src/lua/'+name+'.lua')}))`);
}
let fixture=readFileSync('tests/lua/support/game_ui_fixture.lua','utf8');
for(const [needle,replacement]of [['return NativeContract.control(self,spec)','OBSERVE(self); return NativeContract.control(self,spec)'],['engineAlive[control]=false','RETIRE(control); engineAlive[control]=false']]){assert.equal(fixture.split(needle).length,2,'fixture observation anchor changed');fixture=fixture.replace(needle,replacement);}
lua.lua_pushstring(L,to_luastring(fixture));lua.lua_setglobal(L,to_luastring('FIXTURE'));
exec(readFileSync('scripts/runtime-baseline/battle.lua','utf8'));
writeFileSync(output,JSON.stringify({mode,node:process.version,fengari:require('fengari/package.json').version,sourceSha256:hash(readFileSync(sourceFile)),rows},null,2)+'\n');
