import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {luaString,toLua} from '../../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './lua-graph-observer.mjs';
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
