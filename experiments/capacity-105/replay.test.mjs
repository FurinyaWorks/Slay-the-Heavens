import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,symlinkSync,lstatSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
import {reserveOutput,assertStableInputs,verifyRows,assertMappedModules,hash} from './replay-contract.mjs';

const base=resolve('build/capacity-105/tests');
mkdirSync(base,{recursive:true});
const temporary=()=>mkdtempSync(join(base,'case-'));
test('replay never overwrites existing output or repository sources',()=>{
 const dir=temporary(), existing=join(dir,'existing');mkdirSync(existing);
 writeFileSync(join(existing,'sentinel'),'unchanged');
 assert.throws(()=>reserveOutput(existing),/exist/);
 assert.equal(readFileSync(join(existing,'sentinel'),'utf8'),'unchanged');
 assert.throws(()=>reserveOutput('docs/evidence/capacity-105-20261113'),/build\/capacity-105/);
 const fresh=join(dir,'fresh');assert.equal(reserveOutput(fresh),fresh);
});
test('replay refuses a real symbolic-link parent',t=>{
 const dir=temporary(),existing=join(dir,'existing');mkdirSync(existing);
 const link=join(dir,'link');
 try{symlinkSync(existing,link,'junction');}catch(error){if(error.code==='EPERM'){t.skip('symlink permission unavailable');return;}throw error;}
 // This managed Windows filesystem can create a reparse directory that Node
 // exposes as an ordinary directory (readlink EINVAL). It is not a symlink test.
 if(!lstatSync(link).isSymbolicLink()){t.skip('filesystem does not expose the junction as a Node symbolic link');return;}
 assert.throws(()=>reserveOutput(join(link,'new')),/link/);
});
test('source drift and head drift reject rather than publishing a current result',()=>{
 const input={sourceCommit:'a',inputs:[{path:'x',bytes:1,sha256:'1'}]};
 assert.doesNotThrow(()=>assertStableInputs(input,structuredClone(input)));
 for(const changed of [{...input,sourceCommit:'b'},{...input,inputs:[]},
  {...input,inputs:[{path:'x',bytes:1,sha256:'2'}]}])
  assert.throws(()=>assertStableInputs(input,changed),/input.*changed/i);
});
test('same-byte-size changes to unrelated mapped modules are not accepted',()=>{
 const modules=[{name:'stable',bytes:3,sha256:'abc'},{name:'abyss_original_v4_data',bytes:2,sha256:'old'}];
 assert.doesNotThrow(()=>assertMappedModules(modules,{modules}));
 assert.doesNotThrow(()=>assertMappedModules([modules[0],{...modules[1],bytes:7,sha256:'new'}],{modules}));
 for(const changed of [[{...modules[0],sha256:'def'},modules[1]],modules.slice(1),[modules[0],modules[0]]])
  assert.throws(()=>assertMappedModules(changed,{modules}));
});
test('readback rejects absent, corrupt, escaping or numerically inconsistent artifacts',()=>{
 const dir=temporary();
 const row={scheme:'shared',additionalRoles:0,artifact:{path:'missing',bytes:1,sha256:'a'}};
 const rows=['independent','trimmed','shared','fallback'].flatMap(scheme=>[0,1,2,10,20,30,100].map(additionalRoles=>({...row,scheme,additionalRoles})));
 assert.throws(()=>verifyRows(rows,{},dir),/ENOENT|artifact|payload/);
 assert.throws(()=>verifyRows(rows.map(r=>({...r,artifact:{...r.artifact,path:'../escape'}})),{},dir),/escape/);
 assert.throws(()=>verifyRows([row,row],{},dir),/Duplicate/);
});
test('readback requires exactly the complete four schemes by seven role counts',()=>{
 assert.throws(()=>verifyRows([],{},base),/coverage/i);
 const rows=['independent','trimmed','shared','fallback'].flatMap(scheme=>[0,1,2,10,20,30,100].map(additionalRoles=>({scheme,additionalRoles})));
 for(const malformed of [rows.slice(1),rows.concat({scheme:'shared',additionalRoles:3}),
  rows.map((r,i)=>i===0?{...r,scheme:'unknown'}:r),
  rows.map((r,i)=>i===0?{...r,additionalRoles:3}:r),
  rows.map((r,i)=>i===0?{...r,additionalRoles:'0'}:r),
  rows.map((r,i)=>i===0?rows[1]:r)])
  assert.throws(()=>verifyRows(malformed,{},base),/coverage|Duplicate/i);
});
test('persisted module identity, count and total are verified independently',()=>{
 const dir=temporary(),body={cardsLua:'return {}',portraitLua:'return {art=true}'},payload=Buffer.from(JSON.stringify(body));
 const compressed=gzipSync(payload),file=join(dir,'shared-0.json.gz');writeFileSync(file,compressed);
 const modules=[{name:'stable',bytes:7},{name:'abyss_original_v4_data',bytes:9},{name:'abyss_traveler_portrait_assets',bytes:17}];
 const inventory={modules,luaBytes:33,layoutJsonBytes:3,templateJsonBytes:2,controls:1};
 const row={scheme:'shared',additionalRoles:0,dataLuaBytes:9,portraitLuaBytes:17,luaBytes:33,deltaLuaBytes:0,
  mappedModuleCount:3,layoutJsonBytes:3,templateJsonBytes:2,controls:1,
  changedModules:[{name:'abyss_original_v4_data',bytes:9,sha256:hash(body.cardsLua)},
   {name:'abyss_traveler_portrait_assets',bytes:17,sha256:hash(body.portraitLua)}],
  artifact:{path:'shared-0.json.gz',bytes:compressed.length,sha256:hash(compressed)},payloadSha256:hash(payload)};
 const rows=['independent','trimmed','shared','fallback'].flatMap(scheme=>[0,1,2,10,20,30,100].map(additionalRoles=>({...row,scheme,additionalRoles})));
 const inventories={current:inventory,fallback:inventory};assert.equal(verifyRows(rows,inventories,dir),true);
 for(const change of [{luaBytes:34},{mappedModuleCount:4},{portraitLuaBytes:18},{controls:2},
  {changedModules:[row.changedModules[0],row.changedModules[0]]},
  {artifact:{...row.artifact,sha256:'0'.repeat(64)}},{payloadSha256:'0'.repeat(64)}])
  assert.throws(()=>verifyRows(rows.map((r,i)=>i===0?{...r,...change}:r),inventories,dir));
 writeFileSync(file,Buffer.from('corrupted'));assert.throws(()=>verifyRows(rows,inventories,dir));
});
