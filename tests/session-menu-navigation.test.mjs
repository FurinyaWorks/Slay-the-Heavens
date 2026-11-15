import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync,writeFileSync,unlinkSync,readdirSync} from 'node:fs';
import {sourceEpoch,releaseSourceEpoch,preMobileUiSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {mobileUiPacket,extendMobileUiEpoch} from './helpers/mobile-ui-source-epoch.mjs';
import './helpers/mobile-ui-prior.cases.mjs';
import {toLua} from '../scripts/build-lua-data.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {applyV25MenuLayout,v25MenuRuntimeLayout} from '../scripts/v25-menu-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {gunzipSync,gzipSync} from 'node:zlib';
import {assertOriginalSessionMenuWitness,assertPriorSessionMenuWitness,extendMobileSessionMenuEpoch,assertNavigationRetirementPredecessor,extendNeowRetirementEpoch,assertNeowStaticPredecessor,extendNeowStaticEpoch} from './helpers/session-menu-source-epoch.mjs';
function requiredMobileUiPrior(){
 const prior=sourceEpoch.proof.targets.mobileUiPrior;
 assert(prior,'complete frozen P0 view is required for original layer assertions');
 assert.equal(prior.commit,'1a62b5e517e138b825b8b663a973065c62ad89ec');
 assert.deepEqual(prior.files,preMobileUiSourceEpoch.proof.current);
 return preMobileUiSourceEpoch.proof;
}
test('session menu preserves live state, confirms destructive actions and uses platform settlement',()=>{
 const r=runLua('tests/lua/session_menu_navigation.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/SESSION_MENU_NAVIGATION_PASS 4/);
});

test('deck notification continuation preserves immutable menu sources and authenticates both exact current owners',()=>{
 const packet=JSON.parse(gunzipSync(readFileSync('tests/helpers/session-menu-source-epoch.json.gz')));
 assertNeowStaticPredecessor(packet);
 const {neowRetirementStaticContinuation,neowRetirementContinuation,mobileContinuation,continuation,...menu}=packet;
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
 const proof=requiredMobileUiPrior(),read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
 assert.equal(proof.targets.mobilePrior.commit,'aa2060671da1bfd5b7151c48ae8babf7b38d5640');
 assert.equal(proof.currentCommit,neowRetirementStaticContinuation.currentCommit);
 assert.equal(proof.owners.length,116);assert.equal(Object.keys(proof.current).length,352);
 for(const p of Object.keys(continuation.current)){
  assert.deepEqual(proof.targets.sessionMenuReviewed.files[p],menu.current[p]);
  assert.deepEqual(continuation.before[p],menu.current[p]);
  assert.deepEqual(proof.targets.mobilePrior.files[p],continuation.current[p],'complete deck notification owner remains frozen');
  assert.equal(proof.current[p].source,read(p));
  assert.equal(sourceEpoch.preCombinedSource(p,read(p),{target:'sessionMenuReviewed',readSource:read}),menu.current[p].source);
  for(const owner of Object.keys(continuation.current))for(const replacement of [null,read(owner)+'\n'])
   assert.throws(()=>sourceEpoch.preCombinedSource(p,read(p),{target:'sessionMenuReviewed',readSource:q=>q===owner?replacement:read(q)}),/linked owner identity/);
  const foreign=read(p)+'\n';let reads=0;
  assert.equal(sourceEpoch.preCombinedSource(p,foreign,{target:'sessionMenuReviewed',readSource:()=>{reads++;return null;}}),foreign);
  assert.equal(reads,0);
 }
});

test('mobile continuation preserves both prior packets and every old target while freshly rejecting owner drift',()=>{
 const packet=JSON.parse(gunzipSync(readFileSync('tests/helpers/session-menu-source-epoch.json.gz'))),mobile=packet.mobileContinuation;
 const proof=requiredMobileUiPrior(),read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
 const changed=['src/lua/abyss_ui.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_view.lua'];
 assert.deepEqual(Object.keys(mobile.current),changed);
 assert.equal(mobile.currentCommit,'ca103dedb636ad064951c33f207a01bad93bbef8');
 assert.equal(proof.targets.mobileRetirementPrior.commit,mobile.currentCommit);
 const {mobilePrior,navigationRetirementPrior,mobileRetirementPrior,neowRetirementStaticPrior,...oldTargets}=proof.targets;
 assert.deepEqual(Object.keys(mobilePrior.files),Object.keys(proof.current),'complete mobile predecessor view');
 const prior={proof:{...proof,currentCommit:mobile.baseCommit,current:mobilePrior.files,targets:oldTargets}};
 const replay=extendMobileSessionMenuEpoch(prior,mobile).proof;
 for(const [name,target]of Object.entries(oldTargets))assert.deepEqual(replay.targets[name],target,'unchanged prior target and receipts: '+name);
 for(const p of Object.keys(proof.current))assert.deepEqual(mobileRetirementPrior.files[p],mobile.current[p]??mobilePrior.files[p],'exact three-source continuation: '+p);
 assertNeowStaticPredecessor(packet);
 for(const mutate of [p=>delete p.current[changed[0]],p=>p.before[changed[0]].source+='\n',
  p=>p.current[changed[0]].source+='\n',p=>p.currentCommit='f'.repeat(40),
  p=>p.current['src/lua/foreign.lua']=p.current[changed[0]]]){
  const invalid=structuredClone(mobile);mutate(invalid);assert.throws(()=>extendMobileSessionMenuEpoch(prior,invalid));
 }
 const oldPacket=structuredClone(packet);oldPacket.continuation.current[Object.keys(oldPacket.continuation.current)[0]].source+='\n';
 assert.throws(()=>assertNeowStaticPredecessor(oldPacket),/immutable original one-owner Neow retirement packet/);
 for(const p of changed){
  assert.equal(read(p),mobile.current[p].source,'live source equals fixed producer blob');
  assert.deepEqual(mobile.before[p],mobilePrior.files[p]);
  assert.equal(sourceEpoch.preCombinedSource(p,read(p),{target:'mobilePrior',readSource:read}),mobile.before[p].source);
  for(const owner of changed)for(const bad of [null,read(owner)+'\n'])
   assert.throws(()=>sourceEpoch.preCombinedSource(p,read(p),{target:'mobilePrior',readSource:q=>q===owner?bad:read(q)}),/linked owner identity/);
  const foreign=read(p)+'\n';let calls=0;
  assert.equal(sourceEpoch.preCombinedSource(p,foreign,{target:'mobilePrior',readSource:()=>{calls++;throw Error('foreign source cannot read owners');}}),foreign);
  assert.equal(calls,0);
 }
});
test('Neow retirement continuation keeps the complete prior corpus and rejects fresh owner drift',()=>{
 const packet=JSON.parse(gunzipSync(readFileSync('tests/helpers/session-menu-source-epoch.json.gz'))),retirement=packet.neowRetirementContinuation;
 assertNeowStaticPredecessor(packet);
 const proof=requiredMobileUiPrior(),path='src/lua/abyss_node_ui_feedback.lua',read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
 const {navigationRetirementPrior,mobileRetirementPrior,neowRetirementStaticPrior,...oldTargets}=proof.targets;
 assert.deepEqual(navigationRetirementPrior.files,proof.targets.mobilePrior.files);
 assert.equal(mobileRetirementPrior.commit,packet.mobileContinuation.currentCommit);
 assert.equal(navigationRetirementPrior.commit,'808a310cfc9a0c2734ec424d7ac80d3a040557c8');
 assert.deepEqual(Object.keys(navigationRetirementPrior.files),Object.keys(proof.current));
 assert.equal(Object.keys(navigationRetirementPrior.files).length,352);
 const prior={proof:{...proof,currentCommit:mobileRetirementPrior.commit,current:mobileRetirementPrior.files,targets:oldTargets}};
 const replay=extendNeowRetirementEpoch(prior,retirement).proof;
 for(const [name,target]of Object.entries(oldTargets))assert.deepEqual(replay.targets[name],target,'unchanged historical target '+name);
 for(const p of Object.keys(proof.current))assert.deepEqual(neowRetirementStaticPrior.files[p],retirement.current[p]??mobileRetirementPrior.files[p],'exact one-owner extension '+p);
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
 const proof=requiredMobileUiPrior(),path='src/lua/abyss_node_ui_feedback.lua',read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
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
test('seven independent mobile owners preserve every P0 layer and reject fresh producer or source drift',()=>{
 const prior=requiredMobileUiPrior(),proof=sourceEpoch.proof,read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
 assert.equal(proof.currentTreeCommitted,false);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(proof.targets[name],target,'complete original target '+name);
 const paths=mobileUiPacket.groups.flatMap(g=>Object.keys(g.current));assert.equal(paths.length,7);
 for(const group of mobileUiPacket.groups)for(const path of Object.keys(group.current)){
  assert.deepEqual(group.before[path],prior.current[path]);assert.equal(read(path),group.current[path].source);
  assert.deepEqual(proof.mobileUiProducers[path],{commit:group.producerCommit,parent:group.parentCommit});
  assert.equal(sourceEpoch.preCombinedSource(path,read(path),{target:'mobileUiPrior',readSource:read}),group.before[path].source);
  for(const owner of paths)for(const bad of [null,read(owner)+'\n'])
   assert.throws(()=>sourceEpoch.preCombinedSource(path,read(path),{target:'mobileUiPrior',readSource:p=>p===owner?bad:read(p)}),/linked owner identity/);
  for(const mutate of [p=>p.groups.find(g=>g.current[path]).producerCommit='f'.repeat(40),
   p=>p.groups.find(g=>g.current[path]).parentCommit='f'.repeat(40),
   p=>p.groups.find(g=>g.current[path]).before[path].source+='\n',
   p=>p.groups.find(g=>g.current[path]).current[path].source+='\n',
   p=>delete p.groups.find(g=>g.current[path]).current[path]]){
   const invalid=structuredClone(mobileUiPacket);mutate(invalid);assert.throws(()=>extendMobileUiEpoch(preMobileUiSourceEpoch,invalid));
  }
 }
 for(const path of Object.keys(proof.current))assert.equal(read(path),proof.current[path].source,'complete final current '+path);
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
 const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
 const paths=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();
 assert.deepEqual(paths,Object.keys(sourceEpoch.proof.current).sort());
 const added=paths.filter(p=>!Object.hasOwn(releaseSourceEpoch.proof.current,p));
 assert.deepEqual(added,['src/lua/abyss_game_ui_navigation.lua','src/lua/abyss_game_ui_navigation_view.lua']);
 for(const p of paths)assert.equal(read(p),sourceEpoch.proof.current[p].source,p);
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
