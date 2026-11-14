import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import luaparse from 'luaparse';
import {requireLuaTool} from '../scripts/setup-lua-static.mjs';
import {parseDiagnostics,reviewResponsibilityComplexity} from '../scripts/check-lua-static.mjs';
import {buildLuaData} from '../scripts/build-lua-data.mjs';
import {roomVm} from './helpers/relic-room-vm.mjs';
import {projectHistoricalRelicRoom,relicRoomPath} from './helpers/relic-room-historical-source.mjs';
import {createSourceEpochProjector} from './helpers/combined-epoch/source-epoch-runtime.mjs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
const before=read('tests/fixtures/relic-room-before.lua'),after=read(relicRoomPath);
buildLuaData('data','build/relic-equip-evidence/abyss_data.lua');
test('room split changes only entry gold responsibility; complete baseline identity remains frozen',()=>{
 assert.equal(after,read('tests/fixtures/relic-room-after.lua'));
 assert.equal(projectHistoricalRelicRoom(relicRoomPath,after),before);
 assert.equal(after.slice(0,after.indexOf('-- Resolve each hook dynamically:')),before.slice(0,before.indexOf('function M.onEnterRoom(')));
 assert.equal(after.slice(after.indexOf(' if phase~='+'\'enter\' and kind==\'shop\'')),before.slice(before.indexOf(' if phase~='+'\'enter\' and kind==\'shop\'')));
});
for(const group of ['ordinary','dynamic','errors','integration'])test(`room independent complete graph differential ${group}`,t=>{
 const old=roomVm(before,group),actual=roomVm(after,group);
 assert.equal(old.status,0,old.error);assert.equal(actual.status,0,actual.error);
 assert(old.graphs.length>0);assert.deepEqual(actual.graphs,old.graphs);assert.equal(actual.rawErrors.length,old.rawErrors.length);
 t.diagnostic(JSON.stringify({group,checkpoints:actual.graphs.length,errors:actual.rawErrors.length}));
});
for(const [name,group,replace] of [
 ['gold','ordinary',s=>s.replace('M.gainGold(run,12)','M.gainGold(run,13)')],
 ['phase','ordinary',s=>s.replace("phase~='entered'","phase~='enter'")],
 ['dynamic','dynamic',s=>s.replace("if M.localId(id)=='ssserpent_head'", "if id=='ssserpent_head'")],
 ['uncommon-first','dynamic',s=>s.replace("require('abyss_uncommon_relics').onEnterRoom(run,kind,phase)", "-- removed uncommon dispatch")],
 ['healing','errors',s=>s.replace('healRun(run,15)','healRun(run,14)')],
 ['tea','errors',s=>s.replace('counters(run).ancient_tea_set=-2','counters(run).ancient_tea_set=-1')],
])for(const [version,source]of [['before',before],['after',after]])test(`room semantic negative control ${version}/${name}`,()=>{
 const mutant=replace(source);assert.notEqual(mutant,source);const result=roomVm(mutant,group);
 assert.notEqual(result.status,0);assert.match(result.error,/\[RELIC_ROOM\]/);
});
test('real pinned Luacheck rejects old room 17 and bounds entry, helper and nested functions at 15',()=>{
 const tool=requireLuaTool(),measure=p=>{
  const r=spawnSync(tool.file,[p,'--formatter','plain','--codes','--ranges','--no-color','--max-cyclomatic-complexity','0'],{encoding:'utf8',timeout:30000});
  assert([0,1].includes(r.status),r.error?.message||r.stderr);return parseDiagnostics(r.stdout).filter(r=>r.code==='W561');
 };
 const old=measure('tests/fixtures/relic-room-before.lua');assert(old.some(r=>r.message.includes("'M.onEnterRoom'")&&r.message.includes('(17 > 0)')));
 const ast=luaparse.parse(after,{locations:true,ranges:true,luaVersion:'5.3'}),rows=measure(relicRoomPath);
 const targets=ast.body.filter(n=>n.type==='FunctionDeclaration'&&['grantRoomEntryGold','onEnterRoom'].includes(n.identifier?.name??n.identifier?.identifier?.name));
 assert.equal(targets.length,2);
 function visit(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'){
  const row=rows.find(r=>r.line===n.loc.start.line&&r.column===n.loc.start.column+1+(n.isLocal?6:0));assert(row,'complete fixed measurement');assert(Number(row.message.match(/\((\d+) > 0\)/)[1])<=15,row.message);
 }for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}
 targets.forEach(visit);
});
test('bounded historical bridge rejects changed sources, foreign paths and freshly corrupted linked owners',()=>{
 const binding=source=>({source,sha256:createHash('sha256').update(source).digest('hex'),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
 const other='src/lua/owner.lua',current={[relicRoomPath]:binding(before),[other]:binding('return {}\n')};
 const epoch=createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:'9f2f44e4c79789fbcb64a515938765dbc240f830',owners:[relicRoomPath,other],current,targets:{prior:{commit:'9f2f44e4c79789fbcb64a515938765dbc240f830',files:{...current,[other]:binding('return nil\n')}}}});
 let corrupt=false;const reader=p=>p===relicRoomPath?after:current[p].source+(corrupt?'\n':'');
 assert.equal(epoch.preCombinedSource(relicRoomPath,after,{target:'prior',readSource:reader}),before);
 corrupt=true;assert.throws(()=>epoch.preCombinedSource(relicRoomPath,after,{target:'prior',readSource:reader}),/linked owner identity/);
 for(const source of [after+'\n',after.replace('run,12','run,13'),before+'\n']){
  let reads=0;assert.equal(epoch.preCombinedSource(relicRoomPath,source,{target:'prior',readSource(){reads++;throw Error('read');}}),source);assert.equal(reads,0);
 }
 assert.equal(projectHistoricalRelicRoom(other,after),after);
 assert.throws(()=>epoch.preCombinedSource(other,current[other].source,{target:'prior',readSource:p=>p===relicRoomPath?after+'\n':current[p].source}),/linked owner identity/);
});
test('formal room CC15 gate rejects real entry, helper and nested regressions',()=>{
 const tool=requireLuaTool(),dir=mkdtempSync(join(tmpdir(),'relic-room-cc-'));
 try{
  const branches=Array.from({length:16},(_,i)=>`if _G.roomProbe==${i} then _G.roomProbe=${i+1} end`).join('\n');
  const errors=source=>{
   const path=join(dir,'room.lua');writeFileSync(path,source);
   const r=spawnSync(tool.file,[path,'--formatter','plain','--codes','--ranges','--no-color','--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:10000});
   assert([0,1].includes(r.status),r.stderr);assert.equal(r.stderr,'');
   return reviewResponsibilityComplexity(parseDiagnostics(r.stdout).map(row=>({...row,file:relicRoomPath})),{[relicRoomPath]:source}).errors.filter(e=>e.file===relicRoomPath);
  };
  assert.deepEqual(errors(after),[]);
  assert(errors(before).some(e=>e.message.includes("function 'M.onEnterRoom'")&&e.message.includes('17 exceeds 15')));
  for(const name of ['M.onEnterRoom','grantRoomEntryGold']){
   const signature=new RegExp(`((?:local )?function ${name.replaceAll('.','\\.')}\\([^\\n]*\\)\\n)`);assert(signature.test(after));
   const entry=after.replace(signature,match=>match+branches+'\n');
   assert(errors(entry).some(e=>e.message.includes(`function '${name}'`)&&e.message.includes('exceeds 15')),name+' entry');
   const nested=after.replace(signature,match=>match+'local probe=function()\n'+branches+'\nend\nprobe()\n');
   assert(errors(nested).some(e=>e.message.includes('17 exceeds 15')),name+' nested');
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});
