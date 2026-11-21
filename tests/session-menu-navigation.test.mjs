import {beforePc13ThenV2UiHudSource} from './helpers/pc13-reward-cover-source.mjs';
import {beforeCharacterPreparationSource} from './helpers/character-preparation-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync,writeFileSync,unlinkSync,readdirSync} from 'node:fs';
import {sourceEpoch as liveEpoch,sessionMenuSourceEpoch as sourceEpoch,releaseSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {toLua} from '../scripts/build-lua-data.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {applyV25MenuLayout,v25MenuRuntimeLayout} from '../scripts/v25-menu-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {gunzipSync,gzipSync} from 'node:zlib';
import {assertOriginalSessionMenuWitness,assertNavigationRetirementPredecessor,extendNeowRetirementEpoch,assertNeowStaticPredecessor,extendNeowStaticEpoch} from './helpers/session-menu-source-epoch.mjs';
const readLive = path => readFileSync(path,'utf8');
const readBeforeUiCloseout = path => beforePc13ThenV2UiHudSource(path,readLive(path),readLive);
const readHistoricalMenu = liveEpoch.combinedReader(readBeforeUiCloseout,'v2RunMenuPrior');
test('session menu preserves live state, confirms destructive actions and uses platform settlement',()=>{
 const r=runLua('tests/lua/session_menu_navigation.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/SESSION_MENU_NAVIGATION_PASS 4/);
});

test('deck notification continuation preserves immutable menu sources and authenticates both exact current owners',()=>{
 const packet=JSON.parse(gunzipSync(readFileSync('tests/helpers/session-menu-source-epoch.json.gz')));
 assertNeowStaticPredecessor(packet);
 const {neowRetirementStaticContinuation,neowRetirementContinuation,continuation,...menu}=packet;
 assertOriginalSessionMenuWitness(menu);
 for(const os of [3,10]){
  const compressed=gzipSync(JSON.stringify(menu));compressed[9]=os;
  assertOriginalSessionMenuWitness(JSON.parse(gunzipSync(compressed)));
 }
 for(const field of Object.keys(menu)){
  const changed=structuredClone(menu);delete changed[field];
  assert.throws(()=>assertOriginalSessionMenuWitness(changed),/immutable original session menu source witness/);
 }
 const changed=structuredClone(menu),owner=Object.keys(changed.current)[0];
 changed.current[owner].source+='\n';
 assert.throws(()=>assertOriginalSessionMenuWitness(changed),/immutable original session menu source witness/);
 const proof=sourceEpoch.proof,read=p=>readHistoricalMenu(p).replaceAll('\r\n','\n');
 assert.equal(proof.currentCommit,neowRetirementStaticContinuation.currentCommit);
 assert.equal(proof.owners.length,116);assert.equal(Object.keys(proof.current).length,352);
 for(const p of Object.keys(continuation.current)){
  assert.deepEqual(proof.targets.sessionMenuReviewed.files[p],menu.current[p]);
  assert.deepEqual(continuation.before[p],menu.current[p]);
  assert.equal(proof.current[p].source,read(p));
  assert.equal(sourceEpoch.preCombinedSource(p,read(p),{target:'sessionMenuReviewed',readSource:read}),menu.current[p].source);
  for(const owner of Object.keys(continuation.current))for(const replacement of [null,read(owner)+'\n'])
   assert.throws(()=>sourceEpoch.preCombinedSource(p,read(p),{target:'sessionMenuReviewed',readSource:q=>q===owner?replacement:read(q)}),/linked owner identity/);
  const foreign=read(p)+'\n';let reads=0;
  assert.equal(sourceEpoch.preCombinedSource(p,foreign,{target:'sessionMenuReviewed',readSource:()=>{reads++;return null;}}),foreign);
  assert.equal(reads,0);
 }
});

test('Neow retirement continuation keeps the complete prior corpus and rejects fresh owner drift',()=>{
 const packet=JSON.parse(gunzipSync(readFileSync('tests/helpers/session-menu-source-epoch.json.gz'))),retirement=packet.neowRetirementContinuation;
 assertNeowStaticPredecessor(packet);
 const proof=sourceEpoch.proof,path='src/lua/abyss_node_ui_feedback.lua',read=p=>readHistoricalMenu(p).replaceAll('\r\n','\n');
 const {navigationRetirementPrior,neowRetirementStaticPrior,...oldTargets}=proof.targets;
 assert.equal(navigationRetirementPrior.commit,'808a310cfc9a0c2734ec424d7ac80d3a040557c8');
 assert.deepEqual(Object.keys(navigationRetirementPrior.files),Object.keys(proof.current));
 assert.equal(Object.keys(navigationRetirementPrior.files).length,352);
 const prior={proof:{...proof,currentCommit:'aa2060671da1bfd5b7151c48ae8babf7b38d5640',current:navigationRetirementPrior.files,targets:oldTargets}};
 const replay=extendNeowRetirementEpoch(prior,retirement).proof;
 for(const [name,target]of Object.entries(oldTargets))assert.deepEqual(replay.targets[name],target,'unchanged historical target '+name);
 for(const p of Object.keys(proof.current))assert.deepEqual(neowRetirementStaticPrior.files[p],retirement.current[p]??navigationRetirementPrior.files[p],'exact original one-owner extension '+p);
 assert.deepEqual(retirement.before[path],navigationRetirementPrior.files[path]);
 assert.equal(read(path),packet.neowRetirementStaticContinuation.current[path].source);
 assert.equal(sourceEpoch.preCombinedSource(path,read(path),{target:'navigationRetirementPrior',readSource:read}),retirement.before[path].source);
 for(const bad of [null,read(path)+'\n'])assert.throws(()=>sourceEpoch.preCombinedSource(path,read(path),{target:'navigationRetirementPrior',readSource:p=>p===path?bad:read(p)}),/linked owner identity/);
 for(const mutate of [r=>delete r.current[path],r=>r.before[path].source+='\n',r=>r.current[path].source+='\n',
  r=>r.currentCommit='f'.repeat(40),r=>r.current['src/lua/foreign.lua']=r.current[path]]){
  const invalid=structuredClone(retirement);mutate(invalid);assert.throws(()=>extendNeowRetirementEpoch(prior,invalid));
 }
 const changed=structuredClone(packet);changed.continuation.current['src/lua/abyss_game_ui.lua'].source+='\n';
 assert.throws(()=>assertNeowStaticPredecessor(changed),/immutable original one-owner Neow retirement packet/);
 const foreign=read(path)+'\n';let calls=0;
 assert.equal(sourceEpoch.preCombinedSource(path,foreign,{target:'navigationRetirementPrior',readSource:()=>{calls++;throw Error('foreign source cannot authorize owners');}}),foreign);
 assert.equal(calls,0);
});

test('optional Neow flow helper retains the exact first fix and rejects changed producer bytes',()=>{
 const packet=JSON.parse(gunzipSync(readFileSync('tests/helpers/session-menu-source-epoch.json.gz'))),extension=packet.neowRetirementStaticContinuation;
 assertNeowStaticPredecessor(packet);
 const proof=sourceEpoch.proof,path='src/lua/abyss_node_ui_feedback.lua',read=p=>readHistoricalMenu(p).replaceAll('\r\n','\n');
 const {neowRetirementStaticPrior,...oldTargets}=proof.targets;
 const prior={proof:{...proof,current:neowRetirementStaticPrior.files,currentCommit:extension.baseCommit,targets:oldTargets}};
 assert.equal(Object.keys(neowRetirementStaticPrior.files).length,352);
 assert.deepEqual(extension.before[path],packet.neowRetirementContinuation.current[path],'original b1 bytes are not relabelled');
 const replay=extendNeowStaticEpoch(prior,extension).proof;
 for(const [name,target]of Object.entries(oldTargets))assert.deepEqual(replay.targets[name],target,'unchanged first-fix target '+name);
 for(const p of Object.keys(proof.current))assert.deepEqual(proof.current[p],extension.current[p]??neowRetirementStaticPrior.files[p]);
 assert.equal(proof.currentTreeCommitted,false);
 assert.equal(proof.currentCommit,'9783f9ed4fdf021270668b66c863b9dfeebc7150');
 assert.equal(sourceEpoch.preCombinedSource(path,read(path),{target:'neowRetirementStaticPrior',readSource:read}),extension.before[path].source);
 for(const bad of [null,read(path)+'\n'])assert.throws(()=>sourceEpoch.preCombinedSource(path,read(path),{target:'neowRetirementStaticPrior',readSource:p=>p===path?bad:read(p)}),/linked owner identity/);
 for(const mutate of [r=>delete r.current[path],r=>r.before[path].source+='\n',r=>r.current[path].source+='\n',r=>r.currentCommit='f'.repeat(40)]){
  const invalid=structuredClone(extension);mutate(invalid);assert.throws(()=>extendNeowStaticEpoch(prior,invalid));
 }
});
test('reward and mandatory card choices resume with their original live tokens',()=>{
 const r=runLua('tests/lua/session_menu_choices.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SESSION_MENU_CHOICES_PASS 2/);
});
test('real V25 menu controls support controller round trips without overlapping entries',()=>{
 const path='build/lua/session_menu_v25_layout.lua';
 const layout=withViewport(applyV25MenuLayout(gameLayout(),nativeTheme),nativeTheme);
 const frames={...v25MenuRuntimeLayout,start:nativeTheme.menuPresentation.start,quit:nativeTheme.menuPresentation.quit};
 writeFileSync(path,`return ${toLua({controls:layout.controls,frames})}\n`);
 try{
  const r=runLua('tests/lua/support/session_menu_v25.lua');
  assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SESSION_MENU_V25_PASS/);
 }finally{unlinkSync(path);}
});

test('menu source continuation retains the complete release corpus and rejects new owner drift',()=>{
 const read=p=>readHistoricalMenu(p).replaceAll('\r\n','\n');
 const paths=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();
 assert.deepEqual(paths,Object.keys(sourceEpoch.proof.current).sort());
 const added=paths.filter(p=>!Object.hasOwn(releaseSourceEpoch.proof.current,p));
 assert.deepEqual(added,['src/lua/abyss_game_ui_navigation.lua','src/lua/abyss_game_ui_navigation_view.lua']);
 for(const p of paths)assert.equal(beforeCharacterPreparationSource(p,read(p)),sourceEpoch.proof.current[p].source,p);
 for(const p of added){
  assert.equal(sourceEpoch.proof.targets.sessionMenuPrior.files[p],null);
  assert.equal(JSON.parse(read('config/architecture.json')).layers[p.split('/').at(-1).slice(0,-4)],'ui');
 }
 const p='config/architecture.json',current=read(p);
 assert.equal(sourceEpoch.preCombinedSource(p,current,{target:'sessionMenuPrior',readSource:read}),releaseSourceEpoch.proof.current[p].source);
 for(const owner of added){
  assert.throws(()=>sourceEpoch.preCombinedSource(p,current,{target:'sessionMenuPrior',readSource:q=>q===owner?read(q)+'\n':read(q)}),/linked owner identity/);
  assert.throws(()=>sourceEpoch.preCombinedSource(p,current,{target:'sessionMenuPrior',readSource:q=>q===owner?null:read(q)}),/linked owner identity/);
 }
});

test('v2 run menu continuation preserves the prior owner and rejects changed siblings',()=>{
 const read=p=>readBeforeUiCloseout(p).replaceAll('\r\n','\n');
 const changed=['src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_navigation.lua','src/lua/abyss_game_ui_navigation_view.lua'];
 for(const path of changed) {
  assert.equal(read(path),liveEpoch.proof.current[path].source);
  assert.equal(liveEpoch.preCombinedSource(path,read(path),{target:'v2RunMenuPrior',readSource:read}),sourceEpoch.proof.current[path].source);
  for(const missing of changed) assert.throws(()=>liveEpoch.preCombinedSource(path,read(path),
   {target:'v2RunMenuPrior',readSource:p=>p===missing?null:read(p)}),/linked owner identity/);
 }
});
