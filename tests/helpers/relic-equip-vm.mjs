import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {luaString,toLua} from '../../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './lua-graph-observer.mjs';
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
export function equipVm(source,group='ordinary',{historicalSession=false}={}){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);const graphs=[],rawErrors=[];let instructions=0;
 lua.lua_sethook(L,()=>{instructions+=10000;if(instructions>30000000)lauxlib.luaL_error(L,to_luastring('relic equip instruction bound'));},lua.LUA_MASKCOUNT,10000);
 installLuaGraphObserver(L,'EQUIP_GRAPH',(label,graph)=>graphs.push({label,graph}));
 lua.lua_pushcfunction(L,L=>{rawErrors.push(to_jsstring(lauxlib.luaL_checkstring(L,1)));return 0;});lua.lua_setglobal(L,to_luastring('EQUIP_ERROR'));
 const errors={};for(const message of ['missing unknown-room state','invalid potion capacity']){
  const lines=source.split('\n').flatMap((line,i)=>line.includes(`'${message}'`)?[i+1]:[]);
  if(lines.length!==1)throw Error(`missing exact assertion ${message}`);
  errors[`src/lua/abyss_relic_hooks.lua:${lines[0]}: ${message}`]=`src/lua/abyss_relic_hooks.lua:<assertion>: ${message}`;
 }
 let bossLoader='';
 if(historicalSession){
  // The frozen onEquip oracle calls Boss without an explicit Run capability.
  // Execute the matching pre-migration Boss implementation on that side.
  const boss=readFileSync('tests/fixtures/relic-equip-session-boss-before.lua','utf8').replaceAll('\r\n','\n');
  assert.equal(createHash('sha256').update(boss).digest('hex'),'07202773300b3808fb154d473769f3c2c1ba9733141b2a6411f20748c88b147e');
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(boss)}\0`).update(boss).digest('hex'),'d7ccbb35e21540ba8348c9e072f4f392e40929ee');
  bossLoader=`package.preload.abyss_boss_relics=assert(load(${luaString(boss)},'@src/lua/abyss_boss_relics.lua'))`;
 }
 const script=`package.path='src/lua/?.lua;build/relic-equip-evidence/?.lua;'..package.path
 package.preload.abyss_relic_hooks=assert(load(${luaString(source)},'@src/lua/abyss_relic_hooks.lua'))
 ${bossLoader}
 EQUIP_GROUP=${luaString(group)};EQUIP_ERRORS=${toLua(errors)}
 `+readFileSync('tests/helpers/relic-equip-cases.lua','utf8');
 const status=lauxlib.luaL_dostring(L,to_luastring(script));
 const error=status===lua.LUA_OK?null:to_jsstring(lua.lua_tostring(L,-1));lua.lua_close(L);
 return {status,error,graphs,rawErrors};
}
