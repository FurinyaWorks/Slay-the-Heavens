import './helpers/target-corner-geometry.cases.mjs';
import {releasePotionEnemyRead,releasePotionEnemyInventory} from './helpers/release-potion-enemy-source.mjs';
import {beforeReleaseFastB9Ci} from './helpers/release-fast-b9-ci-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as rawReadFileSync,readdirSync} from 'node:fs';
import {releaseFastB9CiRead} from './helpers/release-fast-b9-ci-source.mjs';
import {createHash} from 'node:crypto';
import {beforeCapacityB9Ci} from './helpers/release-capacity-b9-ci-source.mjs';
import {discoverJs as mergedDiscoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch,preReleasePc22BasicFeedbackSourceEpoch,releasePc22BasicFeedbackSourceEpoch,releaseSelectionMapSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {integrationPacket,integrationCiSource,integrationRead,integrationInventory,integrationPriorInventory,assertIntegrationRawInventory,assertReleaseIntegrationCurrent} from './helpers/release-card-contact-integration.mjs';
import {releasePc22BasicFeedbackCiPacket,assertReleasePc22BasicFeedbackExecutionGuards} from './helpers/release-pc22-basic-feedback-ci-source.mjs';
import {releaseSelectionMapCiPacket,assertReleaseSelectionMapExecutionGuards} from './helpers/release-selection-map-ci-source.mjs';
import {enemyJoinRead,enemyJoinSource,assertEnemyJoinCurrent} from './helpers/release-enemy-art-join.mjs';
import {enemyCapacityRead,enemyCapacitySource,assertEnemyCapacityCurrent} from './helpers/release-enemy-capacity-join.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const readFileSync=releasePotionEnemyRead('release',rawReadFileSync);
const discoverJs=()=>releasePotionEnemyInventory(mergedDiscoverJs(),integrationInventory('js'),'js',rawReadFileSync,'release');

test('joint Release authenticates the full live production corpus and retains both immutable standalone corpora',()=>{
 const p=sourceEpoch.proof,prior=preReleasePc22BasicFeedbackSourceEpoch.proof;
 const files=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();
 assert.equal(files.length,352);assert.deepEqual(files,Object.keys(p.current).filter(path=>p.current[path]!==null).sort());
 for(const path of files)assert.equal(norm(readFileSync(path,'utf8')),p.current[path].source,path+' fresh joint source');
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(p.targets[name],target,name+' complete immutable original target');
 assert.equal(Object.keys(prior.targets).length,64);assert.equal(Object.keys(p.targets).length,88);
 const handPrior=p.targets.releaseHandLayoutPrior.files;
 const enemyPrior=p.targets.releaseEnemyMetricsPrior.files;
 assert.deepEqual(Object.keys(handPrior).filter(path=>handPrior[path].sha256!==enemyPrior[path].sha256),['src/lua/abyss_battle_card_view.lua']);
 const enemyMetrics=['src/lua/abyss_battle_enemy_view.lua','src/lua/abyss_battle_render_actors.lua','src/lua/abyss_battle_targeting.lua'];
 const pointerPrior=p.targets.releasePointerIdentityPrior.files;
 const sparsePrior=p.targets.releaseSparsePointerPrior.files;
 assert.deepEqual(files.filter(path=>enemyPrior[path].sha256!==sparsePrior[path].sha256),enemyMetrics);
 const intentPrior=p.targets.releaseCompositeIntentPrior.files;
 assert.deepEqual(files.filter(path=>sparsePrior[path].sha256!==intentPrior[path].sha256),['src/lua/abyss_battle_card_bindings.lua']);
 const particlePrior=p.targets.releaseIntentParticlePrior.files;
 assert.deepEqual(files.filter(path=>intentPrior[path].sha256!==particlePrior[path].sha256),['src/lua/abyss_battle_intent_view.lua','src/lua/abyss_battle_render_actors.lua']);
 const cornersPrior=p.targets.releaseTargetCornersPrior.files;
 assert.deepEqual(files.filter(path=>particlePrior[path].sha256!==cornersPrior[path].sha256),['src/lua/abyss_monster_intent_particle_view.lua']);
 const shopPrior=p.targets.releaseShopDismissalPrior.files;
 assert.deepEqual(files.filter(path=>cornersPrior[path].sha256!==shopPrior[path].sha256),['src/lua/abyss_battle_unit_view.lua']);
 const cancelPrior=p.targets.releaseCardCancelNoticePrior.files;
 assert.deepEqual(files.filter(path=>shopPrior[path].sha256!==cancelPrior[path].sha256),['src/lua/abyss_node_ui_input.lua', 'src/lua/abyss_shop_selection.lua']);
 assert.deepEqual(files.filter(path=>cancelPrior[path].sha256!==pointerPrior[path].sha256),['src/lua/abyss_battle_card_gestures.lua']);
 const overlayPrior=p.targets.releasePointerOverlayPrior;
 assert.equal(overlayPrior.commit,'5a86c6c2a3784d28fa819ab7487dd58cc7a778b1');
 assert.deepEqual(files.filter(path=>overlayPrior.files[path].sha256!==p.current[path].sha256),[
  'src/lua/abyss_battle_action_bindings.lua','src/lua/abyss_battle_actions.lua','src/lua/abyss_battle_card_gestures.lua',
  'src/lua/abyss_battle_input_state.lua','src/lua/abyss_ui.lua',
 ]);
 const followupPrior=p.targets.releaseFullFollowupPrior;
 assert.equal(followupPrior.commit,'4dd97d67883202496f7cb587002ed00f429ef699');
 assert.deepEqual(files.filter(path=>followupPrior.files[path].sha256!==p.current[path].sha256),["src/lua/abyss_battle_actions.lua"]);
 const repairPrior=p.targets.releaseFullRepairPrior;
 assert.equal(repairPrior.commit,'36b96baa93d07cb8a357cb793ea4e8806a5aca87');
 assert.deepEqual(files.filter(path=>repairPrior.files[path].sha256!==followupPrior.files[path].sha256),[
  'src/lua/abyss_battle_action_bindings.lua','src/lua/abyss_battle_input_state.lua',
 ]);
 assert.deepEqual(p.targets.releaseFatalBgmPrior.files,pointerPrior,'BGM and pointer retain the same complete Release predecessor');
 assert.equal(p.targets.releaseFatalBgmPrior.commit,'1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2');
 assert.deepEqual(files.filter(path=>pointerPrior[path].sha256!==overlayPrior.files[path].sha256),[
  'src/lua/abyss_battle_action_bindings.lua','src/lua/abyss_battle_card_bindings.lua',
  'src/lua/abyss_battle_card_gestures.lua','src/lua/abyss_battle_details.lua',
  'src/lua/abyss_battle_input_state.lua','src/lua/abyss_battle_potion_bindings.lua',
  'src/lua/abyss_battle_target_bindings.lua','src/lua/abyss_battle_ui.lua',
 ]);
 assert.equal(prior.owners.length,116);assert.equal(p.owners.length,129);
 assert(p.owners.includes('src/lua/abyss_battle_actions.lua')&&p.owners.includes('src/lua/abyss_battle_card_gestures.lua'));
 assert.deepEqual(p.targets.releasePc22BasicFeedbackReviewed.files,releasePc22BasicFeedbackSourceEpoch.proof.current);
 assert.deepEqual(p.targets.releaseSelectionMapReviewed.files,releaseSelectionMapSourceEpoch.proof.current);
 for(const side of [releasePc22BasicFeedbackSourceEpoch,releaseSelectionMapSourceEpoch])for(const [name,target]of Object.entries(side.proof.targets))assert.deepEqual(p.targets[name],target);
 const changed=files.filter(path=>p.current[path].sha256!==prior.current[path].sha256);
 assert.deepEqual(changed,[
  'src/lua/abyss_battle_action_bindings.lua',
  'src/lua/abyss_battle_actions.lua',
  'src/lua/abyss_battle_card_bindings.lua',
  'src/lua/abyss_battle_card_gestures.lua',
  'src/lua/abyss_battle_card_view.lua',
  'src/lua/abyss_battle_details.lua',
  'src/lua/abyss_battle_enemy_view.lua',
  'src/lua/abyss_battle_input_state.lua',
  'src/lua/abyss_battle_intent_view.lua',
  'src/lua/abyss_battle_potion_bindings.lua',
  'src/lua/abyss_battle_potion_popup.lua',
  'src/lua/abyss_battle_render_actors.lua',
  'src/lua/abyss_battle_target_bindings.lua',
  'src/lua/abyss_battle_targeting.lua',
  'src/lua/abyss_battle_ui.lua',
  'src/lua/abyss_battle_unit_view.lua',
  'src/lua/abyss_card_flow.lua',
  'src/lua/abyss_game_ui_input.lua',
  'src/lua/abyss_game_ui_view.lua',
  'src/lua/abyss_lowcost_art.lua',
  'src/lua/abyss_monster_intent_particle_view.lua',
  'src/lua/abyss_node_ui_input.lua',
  'src/lua/abyss_shop_selection.lua',
  'src/lua/abyss_ui.lua',
]);
 const card=p.current['src/lua/abyss_card_flow.lua'].source;
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(card)}\0`).update(card).digest('hex'),'486b63e804f138ee7a1ba1dc8241bdf9d3b99731');
 assert(card.includes('position={flight.tx,flight.ty-(flight.stop or 0)}'));
 assert.equal(p.currentTreeCommitted,false,'historical producer commits are not relabelled as a committed joint corpus');
});

test('joint owner authorization freshly rejects every missing changed or mistyped owner and leaves foreign inputs visible',()=>{
 const p=sourceEpoch.proof,anchor='src/lua/abyss_card_flow.lua',raw=path=>readFileSync(path,'utf8'),source=norm(raw(anchor));
 for(const target of ['releasePc22BasicFeedbackPrior','releaseSelectionMapReviewed']){
  const seen=[];
  assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target,readSource:path=>{seen.push(path);return raw(path);}}),p.targets[target].files[anchor].source);
  assert.deepEqual(seen,p.owners);
  for(const owner of p.owners)for(const replacement of [null,raw(owner)+'\n',Buffer.from(raw(owner))])
   assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target,readSource:path=>path===owner?replacement:raw(path)}),/linked owner/);
 }
 for(const input of [source+'\n',source.slice(1),null,17,Buffer.from(source),source.replaceAll('\n','\r\r\n')]){
  let calls=0;assert.equal(sourceEpoch.preCombinedSource(anchor,input,{target:'releasePc22BasicFeedbackPrior',readSource:()=>{calls++;throw Error('foreign');}}),input);assert.equal(calls,0);
 }
});

test('joint CI binds every current input, preserves both packets and never masks production or foreign drift',()=>{
 assertReleaseIntegrationCurrent(readFileSync,readFileSync);
 const capacitySource=(path,source)=>beforeCapacityB9Ci(path,source,'b9',undefined,{read:readFileSync});
 const releaseRead=(path,encoding)=>beforeReleaseFastB9Ci(path,capacitySource(path,readFileSync(path,encoding)),undefined,readFileSync);
 // The changed CI wrapper is authenticated separately from the immutable old inventory.
 const wrapper='tests/helpers/release-card-contact-integration.mjs';
 for(const mode of ['changed','missing'])assert.throws(()=>assertEnemyJoinCurrent((p,e)=>{
  if(p===wrapper){if(mode==='missing')throw Error('missing '+p);return readFileSync(p,e)+'\n';}
  return readFileSync(p,e);
 }),mode==='missing'?/missing/:/fresh complete integration source/);
 for(const [path,sha]of Object.entries(integrationPacket.files)){
  const source=norm(readFileSync(path,'utf8'));assert.equal(hash(norm(releaseRead(path,'utf8'))),sha,path);
  if(source!==releaseRead(path,'utf8')){
    assert.equal(norm(beforeReleaseFastB9Ci(path,capacitySource(path,source.replaceAll('\n','\r\n')),undefined,readFileSync)),norm(releaseRead(path,'utf8')));
    const foreign=source.replaceAll('\n','\r\r\n');
    assert.equal(capacitySource(path,foreign),foreign);
   }
  for(const side of ['pc22','selection']){
   for(const foreign of [source+'\n',source.slice(1),null,{},17])assert.equal(integrationCiSource(path,foreign,side,readFileSync),foreign,path);
   for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(integrationCiSource(foreignPath,source,side,readFileSync),source);
   if(path.startsWith('src/')||path==='config/architecture.json'){
    assert.equal(integrationCiSource(path,source,side,readFileSync),source,'CI cannot authorize production');
    assert.equal(norm(integrationRead(side,readFileSync)(path,'utf8')),source,'CI reader leaves raw production authorization to the production projector');
   }
  }
  for(const mode of ['changed','missing']){
   const mutationRead=releasePotionEnemyRead('release',(p,e)=>{
    if(p!==path)return rawReadFileSync(p,e);
    if(mode==='missing')throw Error('missing '+p);
    return e?source+'\n':Buffer.from(source+'\n');
   });
   const expected=mode==='missing'?/missing/:/fresh complete integration source/;
   assert.throws(()=>assertReleaseIntegrationCurrent(mutationRead),
    error=>expected.test(error.message)&&error.message.includes(path),mode+' '+path);
  }
 }
 for(const [side,packet]of [['pc22',releasePc22BasicFeedbackCiPacket],['selection',releaseSelectionMapCiPacket]]){
  const read=integrationRead(side,readFileSync);
  for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,path+' exact '+side+' current view');
 }
 for(const path of Object.keys(integrationPacket.archives)){
  const mutationRead=releasePotionEnemyRead('release',(p,e)=>
   p===path?Buffer.concat([rawReadFileSync(p),Buffer.from('\n')]):rawReadFileSync(p,e));
  assert.throws(()=>assertReleaseIntegrationCurrent(mutationRead),
   error=>/immutable Release join predecessor/.test(error.message)&&error.message.includes(path),path);
 }
});

test('joint raw inventories retain both additions and reject missing duplicate foreign and changed inputs',()=>{
 const lua=releasePotionEnemyInventory(readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p),integrationInventory('lua'),'lua',rawReadFileSync,'release');
 const raw={js:discoverJs(),lua};
 for(const [kind,paths]of Object.entries(raw)){
  assert.deepEqual(paths,integrationInventory(kind));assertIntegrationRawInventory(paths,kind);
  for(const [side,packet]of [['pc22',releasePc22BasicFeedbackCiPacket],['selection',releaseSelectionMapCiPacket]]){
   assert.deepEqual(integrationPriorInventory(paths,side,kind,readFileSync),packet.currentInventory[kind]);
   const added=paths.filter(p=>!packet.currentInventory[kind].includes(p));
   if(kind==='js'||side==='selection')assert(added.length>0);
   if(added.length)assert.throws(()=>assertIntegrationRawInventory(paths.filter(p=>!added.includes(p)),kind),/raw discovery inventory/);
   for(const path of added)assert.throws(()=>integrationPriorInventory(paths,side,kind,(p,e)=>{
    const raw=readFileSync(p,e);return p===path?raw+'\n':raw;
   }),error=>error.code==='ERR_ASSERTION'&&[
    'fresh Release integration added inventory source: '+path,
    'fresh complete integration source: enemy capacity '+path,
   ].includes(error.message.split('\n')[0]));
  }
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,'tests/foreign.test.mjs']])assert.throws(()=>assertIntegrationRawInventory(bad,kind),/raw discovery inventory/);
 }
 const workflow=readFileSync('.github/workflows/quality.yml','utf8');
 assertReleasePc22BasicFeedbackExecutionGuards(workflow);assertReleaseSelectionMapExecutionGuards(workflow);
});

test('actual 00ab enemy capacity join freshly rejects cross-input and archive drift through both public readers',()=>{
 const anchor='scripts/build-ui.mjs',dependency='scripts/build-native-candidate.mjs';
 const raw=readFileSync(anchor,'utf8'),source=norm(raw);
 assertEnemyCapacityCurrent(readFileSync);
 for(const side of ['enemy','release']){
  const expected=enemyCapacityRead(side,readFileSync)(anchor,'utf8');
  assert.notEqual(norm(expected),source,'both complete parent inputs differ from the real combined builder');
  for(const input of [source,source.replaceAll('\n','\r\n')])assert.equal(enemyCapacitySource(anchor,input,side,{read:readFileSync}),expected);
  for(const foreign of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n'),null,17,Buffer.from(source)]){
   let reads=0;assert.strictEqual(enemyCapacitySource(anchor,foreign,side,{read:()=>{reads++;throw Error('foreign');}}),foreign);assert.equal(reads,0);
  }
  for(const path of [dependency,'tests/helpers/release-enemy-capacity-join.json.gz','tests/helpers/release-capacity-b9-reader-repair.json.gz']){
   for(const mode of ['drift','missing','null']){
    for(const makeRead of [read=>enemyCapacityRead(side,read),read=>integrationRead('pc22',read)]){
     let injected=false;
     const read=(p,e)=>{
      if(p!==path)return readFileSync(p,e);
      injected=true;
      if(mode==='missing')throw Error('missing '+p);
      if(mode==='null')return null;
      const bytes=readFileSync(p,e);
      return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
     };
     assert.throws(()=>makeRead(read)(anchor,'utf8'));
     assert(injected,mode+' '+path);
    }
   }
   assert.equal(enemyCapacityRead(side,readFileSync)(anchor,'utf8'),expected,'restoration authorizes freshly');
  }
  const buffer=enemyCapacityRead(side,readFileSync)(anchor);assert(Buffer.isBuffer(buffer));assert.equal(norm(buffer.toString()),norm(expected));
 }
 for(const path of ['src/lua/abyss_lowcost_art.lua','config/architecture.json','foreign/'+anchor,'__proto__',null,17]){
  let reads=0;assert.equal(enemyCapacitySource(path,source,'enemy',{read:()=>{reads++;throw Error('production');}}),source);assert.equal(reads,0);
 }
 const joined='tests/release-card-contact-integration.test.mjs',joinedRaw=readFileSync(joined,'utf8');
 assert.strictEqual(beforeCapacityB9Ci(joined,joinedRaw,'b9',{sha256:'0'.repeat(64)},{read:readFileSync}),joinedRaw,'wrong predecessor preserves the original complete input');
 assert.throws(()=>enemyCapacityRead('unknown'),/known enemy capacity parent/);
});
