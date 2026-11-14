import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {luaString} from '../../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './lua-graph-observer.mjs';
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
export function roomVm(source,group='ordinary'){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);const graphs=[],rawErrors=[];let instructions=0;
 lua.lua_sethook(L,()=>{instructions+=10000;if(instructions>30000000)lauxlib.luaL_error(L,to_luastring('relic equip instruction bound'));},lua.LUA_MASKCOUNT,10000);
 installLuaGraphObserver(L,'EQUIP_GRAPH',(label,graph)=>graphs.push({label,graph}));
 lua.lua_pushcfunction(L,L=>{rawErrors.push(to_jsstring(lauxlib.luaL_checkstring(L,1)));return 0;});lua.lua_setglobal(L,to_luastring('EQUIP_ERROR'));
 const script=`package.path='src/lua/?.lua;build/relic-equip-evidence/?.lua;'..package.path
 package.preload.abyss_relic_hooks=assert(load(${luaString(source)},'@src/lua/abyss_relic_hooks.lua'))
 ROOM_GROUP=${luaString(group)}
 `+readFileSync('tests/helpers/relic-room-cases.lua','utf8');
 const status=lauxlib.luaL_dostring(L,to_luastring(script));
 const error=status===lua.LUA_OK?null:to_jsstring(lua.lua_tostring(L,-1));lua.lua_close(L);
 return {status,error,graphs,rawErrors};
}
