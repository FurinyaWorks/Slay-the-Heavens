import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {luaString,toLua} from '../../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './lua-graph-observer.mjs';
import {runStatic} from '../../scripts/check-lua-static.mjs';
import {measureSources} from '../../scripts/lua-quality-metrics.mjs';
import {beforeCharacterPreparationSource,beforeCurrentProductionSource} from './character-preparation-source.mjs';
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=createRequire(import.meta.url)('fengari');
const archive=readFileSync('tests/fixtures/architecture-admission-before.json.gz');
assert.equal(createHash('sha256').update(archive).digest('hex'),'93c84b252594eb1362c2bdb5a46cf5c82b7c05129df6d0695dd9e7fd79f2ca42','immutable complete c2409ad7 source archive');
const before=JSON.parse(gunzipSync(archive));
const current=Object.fromEntries(Object.keys(before.sources).map(name=>[name,readFileSync(`src/lua/${name}.lua`,'utf8')]));
function replay(sources){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);const graphs=[];
 installLuaGraphObserver(L,'ADMISSION_GRAPH',(label,graph)=>graphs.push({label,graph:JSON.parse(graph)}));
 const preload=Object.entries(sources).map(([name,source])=>`package.preload[${luaString(name)}]=assert(load(${luaString(source)},${luaString('@src/lua/'+name+'.lua')}))`).join('\n');
 const status=lauxlib.luaL_dostring(L,to_luastring(`package.path='src/lua/?.lua;build/lua/?.lua;'..package.path\nADMISSION_SOURCES=${toLua(sources)}\n${preload}\ndofile('tests/helpers/architecture-admission-probes.lua')`));
 const error=status===lua.LUA_OK?null:to_jsstring(lua.lua_tostring(L,-1));lua.lua_close(L);return {status,error,graphs};
}
let baseline;
const original=()=>baseline??=replay(before.sources);
test('seven complete admission/event modules preserve full state graphs, aliases, refusals and injected faults in independent VMs',t=>{
 const old=original(),actual=replay(current);
 assert.equal(old.status,0,old.error);assert.equal(actual.status,0,actual.error);
 assert(old.graphs.length>=800);assert.deepEqual(actual,old);
 t.diagnostic(`${old.graphs.length} complete before/current graph checkpoints, baseline ${before.revision}`);
});
for(const [name,module,from,to,label]of [
 ['map provenance type','abyss_map',"type(map.sourceSignature)=='string'",'true','emerald-sourceSignature-4'],
 ['ending current-node owner','abyss_ending_history','map.currentNodeId==flow.id','true','ending-map-currentNodeId-1'],
 ['treasure reward mirror','abyss_treasure_source','reward.relicId==base.id','true','treasure-relicId-1'],
 ['wheel UID before execution','abyss_wheel_event',"uid~=nil and event.stage~='choose_card'",'false','wheel-stage-none-spin-1'],
])test(`admission differential oracle rejects semantic regression: ${name}`,()=>{
 const source=current[module];assert.equal(source.split(from).length,2,'exact semantic mutation target');
 const old=original(),mutant=replay({...current,[module]:source.replace(from,to)});
 assert.equal(old.status,0,old.error);assert.equal(mutant.status,0,mutant.error);
 const expected=old.graphs.find(row=>row.label===label),actual=mutant.graphs.find(row=>row.label===label);
 assert(expected&&actual,'named rejection remains in matrix');assert.notDeepEqual(actual,expected,'the old behavior oracle must reject the production mutation');
});

test('complete admission responsibility measurements retain the CC15 limits',()=>{
 const governed={
  abyss_map:['emeraldMapShape','emeraldCoordinates','emeraldIdentity','emeraldMember','emeraldNode'],
  abyss_treasure_source:['pairItems','pairMirror','pairExtras','M.pair'],
  abyss_wheel_event:null,
  abyss_winding_event:null,
 };
 const files=Object.fromEntries(Object.keys(governed).map(name=>[`src/lua/${name}.lua`,current[name]]));
 const diagnostics=runStatic(['--max-cyclomatic-complexity','0','--only','561']).diagnostics.filter(row=>Object.hasOwn(files,row.file));
 const report=measureSources(files,diagnostics);
 assert.deepEqual(report.errors,[]);
 assert.equal(report.modules.length,Object.keys(governed).length);
 for(const module of report.modules){
  const names=governed[module.file.slice(8,-4)];
  const roots=names?.map(name=>{
   const matches=module.functions.filter(fn=>fn.name===name);
   assert.equal(matches.length,1,`${module.file} must contain exactly one ${name} entry`);
   return matches[0].id;
  });
  const items=roots?module.functions.filter(fn=>roots.some(root=>fn.id===root||fn.id.startsWith(root+'/'))):module.functions;
  assert(items.length>0);
  for(const fn of items){
   assert(fn.complexity<=15,`${module.file} ${fn.name}: CC${fn.complexity} exceeds 15`);
  }
 }
});

test('historical admission receipts use only the exact current successor source',()=>{
 const read=path=>readFileSync(path,'utf8');
 for(const name of ['abyss_map','abyss_treasure_source','abyss_wheel_event','abyss_winding_event']){
  const path=`src/lua/${name}.lua`,source=current[name].replaceAll('\r\n','\n');
  assert.equal(beforeCharacterPreparationSource(path,source,read),before.sources[name]);
  assert.equal(beforeCharacterPreparationSource(path,source.replaceAll('\n','\r\n'),read),before.sources[name]);
  assert.equal(beforeCharacterPreparationSource(path,source+'-- drift',read),source+'-- drift');
  assert.throws(()=>beforeCharacterPreparationSource(path,source,p=>read(p)+'-- drift'),/fresh admission receipt source/);
  assert.equal(beforeCurrentProductionSource(path,source,read),before.sources[name]);
  for(const invalid of [null,before.sources[name],source+'-- drift']){
   assert.throws(()=>beforeCurrentProductionSource(path,invalid,read),/fresh current production owner/);
  }
 }
});
