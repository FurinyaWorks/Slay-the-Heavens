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
 const owners=Object.keys(current),commit='9f2f44e4c79789fbcb64a515938765dbc240f830';
 const epoch=createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:commit,owners,current,targets:{prior:{commit,files:current}}});
 for(const path of owners){
  const live=read(path);assert.equal(epoch.preCombinedSource(path,live,{target:'prior',readSource:read}),current[path].source);
  for(const owner of owners)assert.throws(()=>epoch.preCombinedSource(path,live,{target:'prior',readSource:p=>read(p)+(p===owner?'\n':'')}),/linked owner identity/);
  for(const owner of owners)assert.throws(()=>epoch.preCombinedSource(path,live,{target:'prior',readSource:p=>p===owner?current[p].source:read(p)}),/linked owner identity/,'mixed old/new owner rejected');
  let reads=0;assert.equal(epoch.preCombinedSource(path,live+'\n',{target:'prior',readSource(){reads++;throw Error('unexpected read');}}),live+'\n');assert.equal(reads,0);
 }
});
