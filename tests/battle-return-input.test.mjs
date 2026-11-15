import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {buildLuaData,luaString} from '../scripts/build-lua-data.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {projectBattleReturnSource} from './helpers/battle-return-historical-source.mjs';
import {createSourceEpochProjector} from './helpers/combined-epoch/source-epoch-runtime.mjs';
import {sourceSlice,sourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
const files={'abyss_battle_details':'battle-details','abyss_battle_ui':'battle-pile'};
buildLuaData();buildUI();
for(const [group,count,marker=group]of [['battle',10],['reward',5],['piles',7],['piles_slice_2',7,'piles']])test(`current real Host battle return input: ${group}`,()=>{
 const r=runLua(`tests/lua/battle_return_input_${group}.lua`);assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,new RegExp(`BATTLE_RETURN_INPUT_${marker.toUpperCase()} ${count} passed; 0 failed`));
 if(marker==='piles'||group==='piles')assert.match(r.stdout,new RegExp(`BATTLE_RETURN_INPUT_PILE_SLICE ${group==='piles'?1:8} ${group==='piles'?7:14} 7`));
});
for(const [module,group,needle]of [
 ['abyss_battle_details','battle','old endTurn permission survived detail modal'],
 ['abyss_battle_details','reward','old skip permission survived reward reader'],
 ['abyss_battle_ui','piles','old drag Click opened a pile overlay'],
])test(`real pre-fix negative control ${module}/${group}`,()=>{
 const dir=mkdtempSync(join(tmpdir(),'battle-return-negative-'));
 try{
  const before=read(`tests/fixtures/${files[module]}-before.lua`),path=join(dir,'probe.lua');
  writeFileSync(path,`package.preload[${luaString(module)}]=assert(load(${luaString(before)},${luaString('@pre-fix/'+module+'.lua')}))\ndofile(${luaString('tests/lua/battle_return_input_'+group+'.lua')})\n`);
  const r=runLua(path);assert.notEqual(r.status,0);assert(r.stdout.includes(needle),r.stdout+r.stderr);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('both complete live source identities and Git blobs remain bound to their historical predecessor',()=>{
 for(const [module,prefix]of Object.entries(files)){
  const path='src/lua/'+module+'.lua',live=read(path),before=read('tests/fixtures/'+prefix+'-before.lua');
  assert.equal(live,read('tests/fixtures/'+prefix+'-after.lua'));assert.equal(projectBattleReturnSource(path,live),before);
  for(const source of [live+'\n',live.slice(1),null,undefined,17])assert.equal(projectBattleReturnSource(path,source),source);
  assert.equal(projectBattleReturnSource('src/lua/foreign.lua',live),live);
 }
});
test('historical admission rechecks both source owners and foreign bytes never authorize owner reads',()=>{
 const binding=source=>({source,sha256:createHash('sha256').update(source).digest('hex'),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
 const current=Object.fromEntries(Object.entries(files).map(([module,prefix])=>['src/lua/'+module+'.lua',binding(read('tests/fixtures/'+prefix+'-before.lua'))]));
 // The synthetic destination must differ: an unchanged target is a no-op,
 // not permission to silently replace live continuation bytes with old text.
 const prior=Object.fromEntries(Object.entries(current).map(([path,row])=>[path,binding('-- immutable synthetic prior target\n'+row.source)]));
 const owners=Object.keys(current),commit='e65d9b98fbec69442047650254238cd9244df805';
 const epoch=createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:commit,owners,current,targets:{prior:{commit,files:prior}}});
 for(const path of owners){
  const live=read(path);assert.equal(epoch.preCombinedSource(path,live,{target:'prior',readSource:read}),prior[path].source);
  for(const owner of owners)assert.throws(()=>epoch.preCombinedSource(path,live,{target:'prior',readSource:p=>read(p)+(p===owner?'\n':'')}),/linked owner identity/);
  for(const owner of owners)assert.throws(()=>epoch.preCombinedSource(path,live,{target:'prior',readSource:p=>p===owner?current[p].source:read(p)}),/linked owner identity/,'mixed old/new owner rejected');
  for(const owner of owners)for(const reverse of [false,true]){
   let calls=0;
   const changing=p=>p===owner&&((++calls===1)!==reverse)?read(p):p===owner?current[p].source:read(p);
   assert.throws(()=>epoch.preCombinedSource(path,live,{target:'prior',readSource:changing}),/linked owner identity/,'within-call '+(reverse?'before-after':'after-before')+' rejected');
  }
  let reads=0;assert.equal(epoch.preCombinedSource(path,live+'\n',{target:'prior',readSource(){reads++;throw Error('unexpected read');}}),live+'\n');assert.equal(reads,0);
 }
 const unrelated='src/lua/unrelated.lua',expanded={...current,[unrelated]:binding('return 1\n')};
 for(const owner of owners){
  const implicit=createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:commit,
   owners:[owner,...owners.filter(p=>p!==owner),unrelated],current:expanded,
   targets:{prior:{commit,files:{...expanded,[unrelated]:binding('return 0\n')}}}});
  let calls=0;
  const changing=p=>p===unrelated?expanded[p].source:p===owner&&++calls===1?current[p].source:read(p);
  assert.throws(()=>implicit.preCombinedSource(unrelated,expanded[unrelated].source,{target:'prior',readSource:changing}),/linked owner identity/,'earlier raw old owner cannot borrow later new closure');
 }
});

test('unchanged and absent targets preserve exact continuation input without owner I/O',()=>{
 const binding=source=>({source,sha256:createHash('sha256').update(source).digest('hex'),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
 const current=Object.fromEntries(Object.entries(files).map(([module,prefix])=>['src/lua/'+module+'.lua',binding(read('tests/fixtures/'+prefix+'-before.lua'))]));
 const owners=Object.keys(current),commit='e65d9b98fbec69442047650254238cd9244df805';
 for(const path of owners){
  const epoch=createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:commit,owners,current,targets:{same:{commit,files:current},absent:{commit,files:{...current,[path]:null}}}});
  for(const target of ['same','absent'])for(const input of [read(path),read(path)+'\n',null,undefined,17]){
   let reads=0;assert.equal(epoch.preCombinedSource(path,input,{target,readSource(){reads++;throw Error('unexpected owner I/O');}}),input);
   assert.equal(reads,0);
  }
 }
});

test('sourceSlice delegates exact continuations while unknown and unchanged inputs stay I/O-free',()=>{
 const targets=Object.keys(sourceEpoch.proof.targets),target=targets[0];
 for(const [module]of Object.entries(files)){
  const path='src/lua/'+module+'.lua',live=read(path);
  for(const [inputPath,input]of [[path,live+'\n'],['src/lua/foreign.lua',live],[path,null],[path,17]]){
   let reads=0;assert.equal(sourceSlice(inputPath,input,target,()=>{reads++;throw Error('unexpected owner I/O');}),input);assert.equal(reads,0);
  }
  const unchanged='followupCurrent';
  assert(unchanged,'real unchanged target retained');let reads=0;
  assert.equal(sourceSlice(path,live,unchanged,()=>{reads++;throw Error('unexpected unchanged-target I/O');}),live);assert.equal(reads,0);
 }
 const path='src/lua/abyss_battle_ui.lua',view=targets.find(name=>sourceEpoch.proof.targets[name].files[path]
  &&sourceEpoch.proof.targets[name].files[path].sha256!==sourceEpoch.proof.current[path].sha256);
 assert(view,'real changed destination retained');
 assert.equal(sourceSlice(path,read(path),view),sourceEpoch.proof.targets[view].files[path].source);
 for(const [module]of Object.entries(files)){
  const owner='src/lua/'+module+'.lua';assert.throws(()=>sourceSlice(path,read(path),view,p=>read(p)+(p===owner?'\n':'')),/linked owner identity/);
 }
});
