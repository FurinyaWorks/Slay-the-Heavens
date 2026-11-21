import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {discoverSources,measureSources} from '../../scripts/lua-quality-metrics.mjs';
import {runStatic} from '../../scripts/check-lua-static.mjs';
import {luaString} from '../../scripts/build-lua-data.mjs';
import {installLuaGraphObserver} from './lua-graph-observer.mjs';
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
const archive=readFileSync('tests/fixtures/develop-character-architecture-before.json.gz');
assert.equal(createHash('sha256').update(archive).digest('hex'),'7a5ab46cd4e7d27fc414f05bebb1ffe06dcba742f990412205113f672b8db541');
const original=JSON.parse(gunzipSync(archive));
const baseline={sources:Object.fromEntries(Object.entries(original.sources).filter(([path])=>
 ['src/lua/abyss_character_profiles.lua','src/lua/abyss_character_presentation.lua'].includes(path)))};
for(const {source,sha256} of Object.values(baseline.sources))assert.equal(createHash('sha256').update(source).digest('hex'),sha256);
test('character preparation and presentation keep every helper within CC15',()=>{
 const metrics=measureSources(discoverSources(),runStatic(['--max-cyclomatic-complexity','0','--only','561']).diagnostics);
 assert.deepEqual(metrics.errors,[]);
 const hotspots=metrics.modules.filter(m=>m.file in baseline.sources).flatMap(m=>m.functions.filter(f=>f.complexity>15).map(f=>`${m.file}:${f.name}=${f.complexity}`));
 assert.deepEqual(hotspots,[]);
});
function replay(old){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);const graphs=[];
 installLuaGraphObserver(L,'CHARACTER_GRAPH',(label,graph)=>graphs.push({label,graph}));
 const preloads=old?Object.entries(baseline.sources).map(([file,{source}])=>`package.preload[${luaString(file.slice(8,-4))}]=assert(load(${luaString(source)},'@${file}'))`).join('\n'):'';
 const script=`package.path='src/lua/?.lua;build/lua/?.lua;'..package.path\n${preloads}\ndofile('tests/helpers/architecture-character.lua')`;
 const status=lauxlib.luaL_dostring(L,to_luastring(script)),error=status===0?null:to_jsstring(lua.lua_tostring(L,-1));lua.lua_close(L);return {status,error,graphs};
}
test('all four detached character profiles and displays preserve complete graphs and refusal order',()=>{
 const before=replay(true),after=replay(false);assert.equal(before.status,0,before.error);assert.equal(after.status,0,after.error);
 assert.ok(before.graphs.length>=16);assert.deepEqual(after,before);
});
