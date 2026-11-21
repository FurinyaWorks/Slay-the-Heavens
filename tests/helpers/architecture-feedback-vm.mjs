import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {luaString} from '../../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './lua-graph-observer.mjs';
import {sourceEpoch} from './closeout-source-epoch.mjs';
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
const input=JSON.parse(readFileSync(0,'utf8'));
const output=process.argv[2];writeFileSync(output,'');
const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
let checkpoints=0,bytes=0;const prints=[];
const normalize=text=>text.replace(/(src\/lua\/[A-Za-z0-9_]+\.lua):\d+:/g,'$1:<line>:');
installLuaGraphObserver(L,'DISPLAY_FEEDBACK_GRAPH',(label,raw)=>{
 const graph=normalize(raw);bytes+=Buffer.byteLength(graph);checkpoints++;
 appendFileSync(output,JSON.stringify([label,Buffer.byteLength(graph),createHash('sha256').update(graph).digest('hex')])+'\n');
});
lua.lua_pushcfunction(L,L=>{
 const values=[];for(let i=1;i<=lua.lua_gettop(L);i++){values.push(to_jsstring(lauxlib.luaL_tolstring(L,i)));lua.lua_pop(L,1);}
 prints.push(normalize(values.join('\t')));return 0;
});lua.lua_setglobal(L,to_luastring('print'));
const sources=sourceEpoch.proof.current;
// Keep all authenticated sources available, but compile only a demanded module.
// Register native loaders rather than embedding a multi-megabyte Lua bootstrap.
lua.lua_getglobal(L,to_luastring('package'));
lua.lua_getfield(L,-1,to_luastring('preload'));
for(const [file,binding]of Object.entries(sources)){
 if(!/^src\/lua\/.+\.lua$/.test(file))continue;
 if(createHash('sha256').update(binding.source).digest('hex')!==binding.sha256)throw Error('old context identity: '+file);
 const source=file==='src/lua/abyss_feedback.lua'?input.source:binding.source;
 lua.lua_pushcfunction(L,L=>{
  const count=lua.lua_gettop(L);
  const status=lauxlib.luaL_loadbuffer(L,to_luastring(source),null,to_luastring('@'+file));
  if(status!==lua.LUA_OK)return lua.lua_error(L);
  lua.lua_insert(L,1);lua.lua_call(L,count,1);return 1;
 });
 lua.lua_setfield(L,-2,to_luastring(file.slice(8,-4)));
}
lua.lua_pop(L,2);
const instrument=`
local Feedback=require('abyss_feedback')
local originalNew=Feedback.new
Feedback.new=function(...)
    local self=originalNew(...)
    local names={}
    for name,value in pairs(self)do if type(value)=='function'then names[#names+1]=name end end
    table.sort(names)
    for _,name in ipairs(names)do
        local original=self[name]
        self[name]=function(...)
            DISPLAY_FEEDBACK_GRAPH_WRITE(self,'before:'..name,true)
            local result=table.pack(pcall(original,...))
            DISPLAY_FEEDBACK_GRAPH_WRITE({feedback=self,result=result},'after:'..name,true)
            if not result[1]then error(result[2],0)end
            return table.unpack(result,2,result.n)
        end
    end
    DISPLAY_FEEDBACK_GRAPH_WRITE(self,'new',true)
    return self
end
`;
const program="package.path='src/lua/?.lua;build/lua/?.lua;'..package.path\n"+instrument
 +(input.args?.length?`assert(loadfile(${luaString(input.fixture)}))(${input.args.join(',')})`:`dofile(${luaString(input.fixture)})`);
const status=lauxlib.luaL_dostring(L,to_luastring(program));
const error=status===lua.LUA_OK?'':normalize(to_jsstring(lua.lua_tostring(L,-1)));
lua.lua_close(L);
console.log(JSON.stringify({status,error,checkpoints,bytes,prints}));
