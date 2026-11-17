import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {luaString} from '../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './helpers/lua-graph-observer.mjs';
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync('tests/fixtures/card-strategy-owner-before.json.gz');
assert.equal(hash(bytes),'e8a69cb67432af3103284642e79a87e24509cd1c4af815b7b8385507daf3f66b');
const archive=JSON.parse(gunzipSync(bytes));
assert.equal(archive.contract,'pre-card-strategy-owner-extraction-20261118');
for(const entry of Object.values(archive.files))assert.equal(hash(entry.source),entry.sha256);
function vm(sources,fixture){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
 const graphs=[],logs=[];let graphBytes=0;
 installLuaGraphObserver(L,'STRATEGY_GRAPH',(label,graph)=>{graphs.push({label,sha256:hash(graph)});graphBytes+=Buffer.byteLength(graph);});
 lua.lua_pushcfunction(L,L=>{logs.push(to_jsstring(lauxlib.luaL_tolstring(L,1)));return 0;});lua.lua_setglobal(L,to_luastring('print'));
 let body="package.path='src/lua/?.lua;build/lua/?.lua;tests/lua/?.lua;'..package.path;";
 for(const [file,entry]of Object.entries(sources))body+=`package.preload[${luaString(file.slice(8,-4))}]=assert(load(${luaString(entry.source)},${luaString('@'+file)}));`;
 body+=`
 local function observe(owner,key)
  local original=owner[key]
  owner[key]=function(...)
   local args=table.pack(...);local returned=table.pack(pcall(original,...))
   local observed=table.pack(table.unpack(returned,1,returned.n))
   if not observed[1]and type(observed[2])=='string'then
    for _,name in ipairs({'build_actions','hand_choice','silent'})do
     observed[2]=observed[2]:gsub('^src/lua/abyss_'..name..'.lua:%d+:',name..':<source line>:')
    end
   end
   STRATEGY_GRAPH_WRITE({state=args[1],returned=observed},key,true)
   if not returned[1]then error(returned[2],0)end
   return table.unpack(returned,2,returned.n)
  end
 end
 observe(require('abyss_build_actions'),'makeCard')
 observe(require('abyss_hand_choice'),'begin')
 observe(require('abyss_hand_choice'),'choose')
 observe(require('abyss_silent'),'generateShivs')
 dofile(${luaString('tests/lua/'+fixture+'.lua')})`;
 const status=lauxlib.luaL_dostring(L,to_luastring(body));
 const error=status===lua.LUA_OK?null:to_jsstring(lua.lua_tostring(L,-1));lua.lua_close(L);
 return {status,error,graphs,graphBytes,logs};
}
for(const fixture of ['warrior_status_build','warrior_choices','silent_shivs','watcher_master_reality_shivs']){
 test(`${fixture}: card strategy extraction preserves complete state, aliases, queues, RNG and failures`,()=>{
  const sources=Object.fromEntries(Object.keys(archive.files).map(file=>[file,{source:readFileSync(file,'utf8').replaceAll('\r\n','\n')}]))
  const before=vm(archive.files,fixture),after=vm(sources,fixture);
  assert.equal(before.status,0,before.error);assert.equal(after.status,0,after.error);
  assert(before.graphs.length>0,'real generation or selection observations');
  assert.deepEqual(after.graphs,before.graphs);assert.equal(after.graphBytes,before.graphBytes);assert.deepEqual(after.logs,before.logs);
  mkdirSync('build/card-strategy-owner',{recursive:true});
  writeFileSync('build/card-strategy-owner/'+fixture+'.json',JSON.stringify({fixture,sourceHashes:Object.fromEntries(Object.entries(sources).map(([file,entry])=>[file,hash(entry.source)])),checkpoints:after.graphs.length,bytesPerSide:after.graphBytes},null,2)+'\n');
 });
}

test('generation and choice gameplay assertions reject four real owner regressions',()=>{
 const sources=Object.fromEntries(Object.keys(archive.files).map(file=>[file,{source:readFileSync(file,'utf8').replaceAll('\r\n','\n')}]))
 const control=vm(sources,'card_strategy_owner_semantics');
 assert.equal(control.status,0,control.error);
 const mutations=[
  ['build_actions',"if pile=='hand' then combat.created(state,card)end","if false then combat.created(state,card)end",
   'temporary hand creation retains both repeatable Master Reality callbacks'],
  ['hand_choice',"or (mode=='put_on_deck' and n==1)",'or false',
   'one-card put-on-deck still consumes the source random-zero selection'],
  ['hand_choice','or (card.upgraded==true)~=p.upgraded[i]','',
   'a changed upgrade flag invalidates a captured hand choice before movement'],
  ['silent','assert(not used[state.nextUid + offset], "card UID collision")','do end',
   'Shiv UID collisions reject before any generation writes or callbacks'],
 ];
 for(const [module,needle,replacement,name]of mutations){
  const file=`src/lua/abyss_${module}.lua`,source=sources[file].source;
  assert.equal(source.split(needle).length,2,`unique semantic mutation: ${name}`);
  const mutated={...sources,[file]:{source:source.replace(needle,replacement)}};
  const result=vm(mutated,'card_strategy_owner_semantics');
  assert.notEqual(result.status,0,`gameplay assertion must reject ${name}`);
  assert(result.logs.some(line=>line.startsWith('FAIL '+name+':')),JSON.stringify(result));
 }
});
