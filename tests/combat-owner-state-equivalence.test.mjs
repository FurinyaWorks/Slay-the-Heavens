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
const archiveBytes=readFileSync('tests/fixtures/combat-owner-source-before.json.gz');
assert.equal(hash(archiveBytes),'5443d9e77301e17e419b979838b363c108e99b9372b2383bfdcce3fa5fa01551');
const archive=JSON.parse(gunzipSync(archiveBytes));
assert.equal(archive.revision,'c2409ad750c15124b7b843c6bbfa5b222537cb75');
assert.equal(hash(archive.source),archive.sourceSha256);
assert.equal(createHash('sha1').update('blob '+Buffer.byteLength(archive.source)+'\0'+archive.source).digest('hex'),archive.gitBlob);
const current=()=>readFileSync(archive.file,'utf8').replaceAll('\r\n','\n');
function beforeOwners(source){
 for(const spec of archive.segments){
  const start=source.indexOf(spec.start),end=source.indexOf(spec.end,start);
  assert(start>=0&&end>start,spec.name+' complete owner block');
  assert.equal(hash(source.slice(start,end)),spec.afterSha256,spec.name+' current owner drift');
  const start0=archive.source.indexOf(spec.beforeStart),end0=archive.source.indexOf(spec.beforeEnd,start0);
  let before=archive.source.slice(start0,end0);
  assert.equal(hash(before),spec.beforeSha256,spec.name+' original owner');
  // Only the separately approved dependency-inversion argument is adapted.
  if(spec.adaptation){assert.equal(before.split(spec.adaptation[0]).length,2);before=before.replace(...spec.adaptation);}
  source=source.slice(0,start)+before+source.slice(end);
 }
 return source;
}
function vm(source,fixture){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
 const graphs=[],logs=[];let bytes=0;
 installLuaGraphObserver(L,'COMBAT_OWNER_GRAPH',(label,graph)=>{graphs.push({label,sha256:hash(graph)});bytes+=Buffer.byteLength(graph);});
 lua.lua_pushcfunction(L,L=>{logs.push(to_jsstring(lauxlib.luaL_tolstring(L,1)));return 0;});lua.lua_setglobal(L,to_luastring('print'));
 const body=`package.path='src/lua/?.lua;build/lua/?.lua;tests/lua/?.lua;'..package.path;
 package.preload.abyss_combat=assert(load(${luaString(source)},'@src/lua/abyss_combat.lua'));
 local C=require('abyss_combat')
 for _,key in ipairs({'new','play','endTurn','chooseHand','resolveQueuedCard','startPlayerTurn','resolveEnemyAction'})do
  local original=C[key]
  C[key]=function(...)
   local args=table.pack(...);local returned=table.pack(pcall(original,...))
   local observed=table.pack(table.unpack(returned,1,returned.n))
   if not observed[1]and type(observed[2])=='string'then
    observed[2]=observed[2]:gsub('^src/lua/abyss_combat.lua:%d+:','Combat:<source line>:')
   end
   COMBAT_OWNER_GRAPH_WRITE({state=key=='new'and returned[2]or args[1],returned=observed},key,true)
   if not returned[1]then error(returned[2],0)end
   return table.unpack(returned,2,returned.n)
  end
 end
 dofile(${luaString('tests/lua/'+fixture+'.lua')})`;
 const status=lauxlib.luaL_dostring(L,to_luastring(body));
 const error=status===lua.LUA_OK?null:to_jsstring(lua.lua_tostring(L,-1));lua.lua_close(L);
 return {status,error,graphs,bytes,logs};
}
for(const fixture of ['autoplay_lifecycle','queued_enemy_roll','queued_enemy_status','turn_power_plans','act3_writhing_parasite']){
 test(`${fixture}: four combat owners preserve complete state, RNG, aliases, queues and returns`,()=>{
  const source=current(),before=vm(beforeOwners(source),fixture),after=vm(source,fixture);
  assert.equal(before.status,0,before.error);assert.equal(after.status,0,after.error);
  assert(before.graphs.length>0,'real combat owner observations');
  assert.deepEqual(after.graphs,before.graphs);assert.equal(after.bytes,before.bytes);assert.deepEqual(after.logs,before.logs);
  mkdirSync('build/combat-owner',{recursive:true});writeFileSync('build/combat-owner/'+fixture+'.json',JSON.stringify({fixture,revision:archive.revision,sourceSha256:hash(source),checkpoints:after.graphs.length,bytesPerSide:after.bytes},null,2)+'\n');
 });
}

test('four owner regressions are caught by real gameplay assertions',()=>{
 const source=current();
 const control=vm(source,'combat_owner_semantics');
 assert.equal(control.status,0,control.error);
 const mutations=[
  ['if e.purge then return end','if false and e.purge then return end',
   'purged unplayable queued cards never acquire a discard owner'],
  ['state.energy=state.energy+state.rules.player.energyPerTurn','state.energy=state.energy',
   'experimental player opening recharges energy before its draw phase'],
  ['Actors.endTurn(state,enemy)','do end',
   'enemy owner end executes the actual status lifecycle'],
  ['(effect.times or 1)','1',
   'each source enemy damage hit remains a separate queued action'],
 ];
 for(const [needle,replacement,name]of mutations){
  assert.equal(source.split(needle).length,2,`unique semantic mutation: ${name}`);
  const result=vm(source.replace(needle,replacement),'combat_owner_semantics');
  assert.notEqual(result.status,0,`gameplay assertion must reject ${name}`);
  assert(result.logs.some(line=>line.startsWith('FAIL '+name+':')),JSON.stringify(result));
 }
});
