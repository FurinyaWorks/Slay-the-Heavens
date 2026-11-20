import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);

for(const official of [false,true])for(const realBoss of [false,true])test(`${official?'official':'default'} ${realBoss?'real boss settlement':'staged boss result'} Tiny House reuses the real Neow host with readable once-only rewards`,t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});
 const dir=mkdtempSync(join(root,'tiny-house-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 buildLuaData('data',join(dir,'abyss_data.lua'));
 buildUI(dir,undefined,official?{officialAssets:true}:{});
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const body=`local generated=${luaString(dir.replaceAll('\\','/'))}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
TINY_HOUSE_REAL_BOSS=${realBoss?'true':'false'}
dofile('tests/lua/support/tiny_house_pending_ui.lua')`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{
  cwd:process.cwd(),encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,
  env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''},windowsHide:true,
 });
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/TINY_HOUSE_PENDING_UI_PASS/);
});

test('Tiny House exact source admission preserves the ordered full owner read and rejects warm drift',async()=>{
 const {readFileSync}=await import('node:fs');
 const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {currentProductionRereads}=await import('./helpers/current-production-source-reads.mjs');
 const {beforeTinyHouseUiSource}=await import('./helpers/tiny-house-ui-source.mjs');
 const {proof}=sourceEpoch;
 const config='config/architecture.json',event='src/lua/abyss_node_ui_events.lua',pending='src/lua/abyss_relic_pending_ui.lua';
 const read=p=>readFileSync(p,'utf8'),reads=[];
 const expected=[...proof.owners,...currentProductionRereads];
 let readFailure;
 const project=()=>sourceEpoch.preCombinedSource(config,read(config),{target:'develop',readSource:p=>{
  reads.push(p);
  if(p===event&&reads.length===expected.length&&readFailure!==undefined){
   if(readFailure instanceof Error)throw readFailure;
   return readFailure;
  }
  return read(p);
 }});
 assert.equal(expected.at(-1),event);
 assert.equal(project(),proof.targets.develop.files[config].source);
 assert.deepEqual(reads,expected);
 for(readFailure of [null,read(event)+'\n',new Error('unavailable')]){
  reads.length=0;
  assert.throws(project,/linked owner (?:identity|missing): .*abyss_node_ui_events\.lua/);
  assert.deepEqual(reads,expected);
 }
 readFailure=undefined;reads.length=0;
 assert.equal(project(),proof.targets.develop.files[config].source);
 assert.deepEqual(reads,expected);
 assert.equal(beforeTinyHouseUiSource(pending,read(pending),read),proof.current[pending].source);
 assert.throws(()=>beforeTinyHouseUiSource(pending,read(pending),()=>null),/linked owner identity/);
 const foreign=read(pending)+'\n';
 assert.equal(beforeTinyHouseUiSource(pending,foreign,()=>{throw Error('cannot read unknown source');}),foreign);
});
