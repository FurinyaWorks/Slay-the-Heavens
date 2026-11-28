import {readStsDetailOwners} from './helpers/release-sts-detail-source.mjs';
import {exactSourceMatches} from './helpers/source-fingerprint.mjs';
import {authorizeRebasedDevelop,beforeRebasedCi} from './helpers/rebased-release-source.mjs';
import {beforeBattlePeriphery} from './helpers/battle-periphery-source.mjs';
import {beforeChapterBattleScene} from './helpers/chapter-battle-scene-source.mjs';
import {beforeAuthenticatedReleaseGuideSource} from './helpers/release-guide-backflow-source.mjs';
import {authorizeCardFeedbackOwners,beforeCardFeedbackOwner} from './helpers/card-feedback-owner-source.mjs';
import {authorizeSts1MapSource,beforeSts1MapSource} from './helpers/sts1-map-source.mjs';
import {beforePc13RewardCover,pc13RewardCoverSourcePaths} from './helpers/pc13-reward-cover-source.mjs';
import {authorizeReleaseUiRestore,beforeAuthenticatedReleaseUiRestore,beforeReleaseControlsGuideRemoval,releaseControlsGuideRemovalSourcePaths} from './helpers/release-ui-restore-source.mjs';
import {assertCharacterPreparationSources,beforeCharacterPreparationSource,beforeCurrentProductionSource,characterPreparationOwners} from './helpers/character-preparation-source.mjs';
import {authenticateInputRetirement,beforeDeckBrowserBackflow,beforePotionBackflow,beforeInputRetirement,beforeInputRetirementReader,assertPointerInputSource,pointerInputPath,readRetiredController,retiredControllerPath} from './helpers/input-retirement-source.mjs';
import {actorFocusAdded,deckPagesAdded,assertActorFocusInventory,assertDevelopBackflowCurrent,assertStasisUpgradeAdded,authenticateDevelopBackflow,beforeDevelopBackflow,stasisUpgradeAddedPaths} from './helpers/develop-release-backflow-source.mjs';
import test from 'node:test';
import {addedEntranceModules,beforeUiEntrance,entranceInventory,entrancePredecessor} from './helpers/ui-entrance-source.mjs';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,mkdirSync,writeFileSync,existsSync,linkSync,unlinkSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {beforeTravelerStatusSource,travelerStatusSourcePaths} from './helpers/traveler-status-source.mjs';
import {beforeReleaseUiCloseoutSource,ownsReleaseUiCloseoutSource,releaseUiCloseoutPriorRead} from './helpers/release-ui-closeout-source.mjs';
import {readHistoricalReleaseCheckpoint} from './helpers/release-historical-source-checkpoints.mjs';
import {beforeCurrentSelectionProductionSource,readReviewedSelectionSource,readSelectionProductionOwners} from './helpers/replay-reviewed-selection.mjs';
import {reviewedSelectionRead,reviewedStsStyleInventory} from './helpers/reviewed-selection-current-source.mjs';
import {shopPurchaseOwner} from './helpers/shop-deck-purchase-source.mjs';
import {productionReadingBackflowOwns,readBeforeMasterBackflowSource} from './helpers/master-backflow-source.mjs';
const sandbox=process.cwd();
const {sourceEpoch}=await import('./helpers/combined-epoch/source-epoch.mjs');
const proof=sourceEpoch.proof,raw=p=>proof.current[p]?.source??null;
const digest=source=>createHash('sha256').update(source).digest('hex');
const shopDeckPaths=['src/lua/abyss_deck_ui.lua','src/lua/abyss_merchant.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_node_ui_feedback.lua','src/lua/abyss_potion_discard_ui.lua'];
function readShopDeckFixture(path){
 if(path!==shopPurchaseOwner)return Object.hasOwn(proof.current,path)?readReviewedSelectionSource(path):readFileSync(path,'utf8');
 const read=(owner,encoding='utf8')=>readFileSync(owner,encoding);
 const reviewed=reviewedSelectionRead(read);
 const source=beforeCurrentSelectionProductionSource(path,readSelectionProductionOwners(read,reviewed),reviewed);
 assert.equal(digest(source.replaceAll('\r\n','\n')),proof.current[path].sha256,'exact historical purchase owner');
 return source;
}
function copyShopDeckFixture(copy,directory,crlf=false){
 copy(directory,{crlf,readSource:readShopDeckFixture});
 // The existing frozen view still owns the controller. The live pointer
 // cohort must authenticate before its original bytes can enter the copy.
 const retired=readShopDeckFixture(retiredControllerPath).replaceAll('\r\n','\n');
 writeFileSync(join(directory,retiredControllerPath),crlf?retired.replaceAll('\n','\r\n'):retired);
}
function replayRebasedInput(path,read){
 const current=read(path),prior=beforeRebasedCi(path,current);
 if(prior!==current)authorizeRebasedDevelop([[path,current]],read);
 return prior;
}

function integrationProductionReaders(read=readFileSync){
 const readOwner=reviewedSelectionRead(read);
 const current=readSelectionProductionOwners(read,readOwner);
 // The earlier entrance receipt checks its original linked owners after the
 // audited chapter and periphery projections have authenticated their inputs.
 const entrance=path=>productionReadingBackflowOwns(path)||['src/lua/abyss_battle_card_layout.lua','src/lua/abyss_viewport.lua'].includes(path)
  ?readOwner(path):beforeBattlePeriphery(path,beforeChapterBattleScene(path,current(path)));
 return {current,entrance,readOwner};
}

test('input retirement preserves exact older bytes and rejects tampered successor witnesses',()=>{
 const live=path=>readFileSync(path,'utf8');
 const read=readBeforeMasterBackflowSource(live);
 const path='src/lua/abyss_map_ui.lua',source=read(path);
 assert.notEqual(source,live(path),'map owner must cross the exact production backflow');
 const prior=beforeInputRetirement(path,source);
 assert.notEqual(prior,source);
 assert.equal(authenticateInputRetirement(path,source,read),prior);
 const crlf=text=>text.replaceAll('\r\n','\n').replaceAll('\n','\r\n');
 assert.equal(authenticateInputRetirement(path,crlf(source),read),crlf(prior));
 const doubleCr=crlf(source).replaceAll('\n','\r\n');
 assert.notEqual(doubleCr,crlf(source));
 assert.equal(authenticateInputRetirement(path,doubleCr,()=>assert.fail('double CR bytes authorized linked reads')),doubleCr);
 assert.throws(()=>authenticateInputRetirement(path,source,()=>source+'\n'),/input retirement validation/);
 assert.equal(authenticateInputRetirement(path,source+'\n',()=>assert.fail('foreign bytes authorized reads')),source+'\n');
 const retired=beforeInputRetirementReader(read)(retiredControllerPath);
 assert.match(retired,/function M\.new/);
 assert.throws(()=>beforeInputRetirementReader(owner=>owner===pointerInputPath?read(owner)+'\n':read(owner))(retiredControllerPath),/ENOENT/);
 assert.throws(()=>assertPointerInputSource(read(pointerInputPath)+'\n'),/fresh pointer input module/);
 const config='config/architecture.json',configSource=raw(config);
 assert.throws(()=>sourceEpoch.preCombinedSource(config,configSource,{
  target:'develop',readSource:p=>p===retiredControllerPath?retired:raw(p),
 }),/combined linked owner identity: src\/lua\/abyss_controller.lua/);
});

test('Traveler status continuation accepts exact live sources and rejects stale or foreign bytes',()=>{
 const read=readHistoricalReleaseCheckpoint('traveler').read;
 const noRead=()=>assert.fail('foreign source must not trigger a linked read');
 for(const path of travelerStatusSourcePaths){
  const live=read(path), overlap=ownsReleaseUiCloseoutSource(path);
  const current=beforeReleaseUiCloseoutSource(path,live,read,overlap);
  const readCurrent=releaseUiCloseoutPriorRead(read,overlap?path:undefined);
  const prior=beforeTravelerStatusSource(path,current,readCurrent,true);
  if(overlap){
   assert.notEqual(live,current,path);
   assert.throws(()=>beforeReleaseUiCloseoutSource(path,current,noRead,true),/Release UI closeout owner identity/,path);
   const staleRead=releaseUiCloseoutPriorRead(()=>current,path);
   assert.throws(()=>beforeTravelerStatusSource(path,current,staleRead,true),/combined linked owner missing/,path);
  }
  assert.notEqual(prior,current,path);
  assert.equal(beforeTravelerStatusSource(path,current.replaceAll('\n','\r\n'),readCurrent),prior.replaceAll('\n','\r\n'));
  for(const invalid of [prior,current+'\n',null]){
   assert.equal(beforeTravelerStatusSource(path,invalid,noRead),invalid);
   assert.throws(()=>beforeTravelerStatusSource(path,invalid,noRead,true),/fresh current production owner/);
   assert.throws(()=>beforeTravelerStatusSource(path,current,()=>invalid),/combined linked owner identity/);
  }
  assert.equal(beforeTravelerStatusSource('unrelated',current,noRead),current);
 }
});

test('runtime helper copy continuation retains every old view and rejects stale predecessor identity',async()=>{
 const {integratedCiProof,extendIntegratedHelperClosure}=await import('./helpers/integrated-ci-source.mjs');
 const {feedbackCiPatch}=await import('./helpers/sts-feedback-ci.mjs');
 const {extendFeedbackHelperClosure}=await import('./helpers/sts-feedback-source-runtime.mjs');
 const {createHash}=await import('node:crypto');
 const path='tests/helpers/combined-epoch/source-epoch-runtime.mjs';
 const original=JSON.parse(readFileSync('tests/helpers/closeout-source-closure.json','utf8'));
 const row=integratedCiProof.closure[path];assert(row,'explicit current runtime helper continuation is required');
 assert.equal(original[path],'5341c965ce41e956f153caf90c2e2097ccaee447a2d1e53a5aa666d15a238882');
 assert.equal(row.before,original[path]);assert.equal(row.after,integratedCiProof.files[path].current.sha256);
 assert.equal(row.after,'ee54191f327d412a5e37a76ff236af6f4aac692e51884a0e3afd33fe62e427e4');
 for(const view of Object.values(integratedCiProof.files[path].views)){
  assert.equal(view.sha256,row.before,'complete original runtime source view');
  assert.equal(createHash('sha256').update(view.source).digest('hex'),row.before);
 }
 const predecessor=extendFeedbackHelperClosure(original,feedbackCiPatch.helperClosure);
 assert.equal(extendIntegratedHelperClosure(predecessor)[path],row.after);
 assert.throws(()=>extendIntegratedHelperClosure({...predecessor,[path]:'0'.repeat(64)}),/exact integration copy predecessor/);
});

test('runtime helper copy freshly rejects isolated edits and deletion after warm copy success',async()=>{
 const {copyIntegrationSourceClosure}=await import('./helpers/copy-integration-source-closure.mjs');
 const {realpathSync}=await import('node:fs');const {relative,isAbsolute}=await import('node:path');
 const temp=realpathSync.native(tmpdir()),source=mkdtempSync(join(temp,'runtime-copy-current-')),target=mkdtempSync(join(temp,'runtime-copy-target-'));
 const path='tests/helpers/combined-epoch/source-epoch-runtime.mjs',helper=join(source,path);
 try{
  copyIntegrationSourceClosure(source);const bytes=readFileSync(helper);
  copyIntegrationSourceClosure(target,{sourceRoot:source});assert.deepEqual(readFileSync(join(target,path)),bytes);
  writeFileSync(helper,Buffer.concat([bytes,Buffer.from('\n')]));
  assert.throws(()=>copyIntegrationSourceClosure(target,{sourceRoot:source}),/fresh helper copy identity/);
  unlinkSync(helper);assert.throws(()=>copyIntegrationSourceClosure(target,{sourceRoot:source}),/ENOENT/);
  writeFileSync(helper,bytes);copyIntegrationSourceClosure(target,{sourceRoot:source});
 }finally{for(const directory of [source,target]){
  const actual=realpathSync.native(directory),within=relative(temp,actual);
  assert(!isAbsolute(within)&&within.startsWith('runtime-copy-')&&!within.startsWith('..'));
  rmSync(actual,{recursive:true,force:true});
 }}
});
test('shop/deck continuation retains the complete closeout predecessor and every original target',async()=>{
 const {closeoutPriorEpoch,ciRepairSourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const frozen=ciRepairSourceEpoch.proof;
 assert.ok(proof.targets.shopDeckPrior,'explicit complete predecessor view');
 assert.equal(proof.targets.shopDeckPrior.commit,'903bf2a31e91f10fb24763ab4cea23d586d0bb83');
 assert.deepEqual(frozen.targets.shopDeckPrior.files,closeoutPriorEpoch.proof.current);
 const {shopDeckFourSourcePrior}=await import('./helpers/closeout-source-epoch.mjs');
 assert.deepEqual(Object.keys(shopDeckFourSourcePrior.current),shopDeckPaths.slice(0,4),'PR639 four-source predecessor remains independently intact');
 for(const [path,binding]of Object.entries(shopDeckFourSourcePrior.current))assert.deepEqual(proof.targets.shopDeckFourPrior.files[path],binding);
 const {shopDeckBeforeCiRepairPrior}=await import('./helpers/closeout-source-epoch.mjs');
 assert.deepEqual(Object.keys(shopDeckBeforeCiRepairPrior.current),shopDeckPaths,'complete five-source predecessor remains independently intact');
 for(const [path,binding]of Object.entries(shopDeckBeforeCiRepairPrior.current))assert.deepEqual(proof.targets.shopDeckBeforeCiRepairPrior.files[path],binding);
 for(const [name,target]of Object.entries(closeoutPriorEpoch.proof.targets))assert.deepEqual(frozen.targets[name],target,name);
 assert.deepEqual(Object.keys(frozen.current),Object.keys(closeoutPriorEpoch.proof.current));
 assert.equal(proof.currentTreeCommitted,false,'working source hashes do not invent a committed corpus');
 for(const path of Object.keys(frozen.current))if(!shopDeckPaths.includes(path))assert.deepEqual(frozen.current[path],closeoutPriorEpoch.proof.current[path],path);
 for(const path of shopDeckPaths){
  assert.equal(readShopDeckFixture(path).replaceAll('\r\n','\n'),raw(path),path);
  for(const input of [raw(path),raw(path).replaceAll('\n','\r\n')])for(const target of Object.keys(proof.targets)){
   const before=proof.targets[target].files[path];
   const expected=before&&before.sha256!==proof.current[path].sha256?before.source:input;
   assert.equal(sourceEpoch.preCombinedSource(path,input,{target,readSource:raw}),expected,path+':'+target);
  }
 }
});
test('shop/deck source slices reject unknown drift without I/O and freshly reject every missing or changed owner',async()=>{
 const {sourceSlice}=await import('./helpers/closeout-source-epoch.mjs');
 const path=shopDeckPaths[0],source=raw(path),target='shopDeckPrior';
 assert.ok(proof.targets[target],'explicit continuation target');
 const before=proof.targets[target].files[path].source;
 assert.notEqual(source,before,'the regression uses the new complete deck source');
 for(const input of [source+'\n',source.slice(1),'\ufeff'+source,null,undefined,{},17]){
  let reads=0;assert.equal(sourceSlice(path,input,target,()=>{reads++;throw Error('unexpected');}),input);assert.equal(reads,0);
 }
 for(const other of ['foreign','__proto__','constructor',...shopDeckPaths.slice(1)]){
  let reads=0;assert.equal(sourceSlice(other,source,target,()=>{reads++;throw Error('unexpected');}),source);assert.equal(reads,0);
 }
 const repeatedOwner='src/lua/abyss_battle_enemy_view.lua';
 const expectedReads=proof.owners.flatMap(owner=>owner===repeatedOwner?[owner,owner]:[owner]);
 for(const owner of proof.owners){
  let bad=false;const reads=[];
  const reader=p=>{reads.push(p);return bad&&p===owner?raw(p)+'\n':raw(p);};
  assert.equal(sourceSlice(path,source,target,reader),before);assert.deepEqual(reads,expectedReads);bad=true;
  assert.throws(()=>sourceSlice(path,source,target,reader),/linked owner identity/,owner);
  for(const missing of [null,undefined,17])assert.throws(()=>sourceSlice(path,source,target,p=>p===owner?missing:raw(p)),/linked owner identity/,owner);
  assert.throws(()=>sourceSlice(path,source,target,p=>{if(p===owner)throw Error('removed');return raw(p);}),/linked owner missing/,owner);
 }
 assert(proof.owners.includes(shopDeckPaths[1]),'new merchant owner participates in the inherited fresh closure');
 const inherited='config/architecture.json';
 assert.notEqual(raw(inherited),proof.targets.develop.files[inherited].source);
 assert.throws(()=>sourceEpoch.preCombinedSource(inherited,raw(inherited),{target:'develop',readSource:p=>p===shopDeckPaths[1]?null:raw(p)}),/linked owner identity/);
});
test('shop/deck archive collection rejects unlisted drift, missing sources and changes during collection',async()=>{
 const {collectShopDeckSourceEpoch:collect}=await import('./helpers/generate-shop-deck-source-epoch.mjs');
 const {ciRepairSourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const priorRaw=p=>ciRepairSourceEpoch.proof.current[p]?.source??null;
 const collectShopDeckSourceEpoch=({readSource=priorRaw}={})=>collect({readSource,inventoryPaths:()=>Object.keys(ciRepairSourceEpoch.proof.current).sort()});
 const {gunzipSync}=await import('node:zlib');
 const collected=collectShopDeckSourceEpoch({readSource:priorRaw});
 assert.deepEqual(Object.keys(collected.current),shopDeckPaths);
 for(const path of shopDeckPaths)assert.deepEqual(collected.current[path],ciRepairSourceEpoch.proof.current[path]);
 assert.deepEqual(gunzipSync(readFileSync('tests/helpers/shop-deck-source-epoch.json.gz')),Buffer.from(JSON.stringify(collected)),'registered complete source content is reproducible without Git or source edits');
 const unlisted='src/lua/abyss_actor.lua';
 assert.throws(()=>collectShopDeckSourceEpoch({readSource:p=>p===unlisted?priorRaw(p)+'\n':priorRaw(p)}),/unlisted current source drift/);
 for(const path of shopDeckPaths){
  for(const missing of [null,undefined,17])assert.throws(()=>collectShopDeckSourceEpoch({readSource:p=>p===path?missing:priorRaw(p)}),/current source required/);
  assert.throws(()=>collectShopDeckSourceEpoch({readSource:p=>{if(p===path)throw Error('source removed');return priorRaw(p);}}),/source removed/);
 }
 let reads=0;
 assert.throws(()=>collectShopDeckSourceEpoch({readSource:p=>p===shopDeckPaths[0]&&++reads>1?priorRaw(p)+'\n':priorRaw(p)}),/source changed during collection/);
});
test('detached shop/deck source slices use fresh local owners and cannot replace missing sources with archived text',async t=>{
 const {copyCurrentSourceFixture}=await import('./helpers/isolated-current-source.mjs');
 for(const crlf of [false,true]){
  const directory=mkdtempSync(join(tmpdir(),'shop-deck-epoch-'));
  t.after(()=>rmSync(directory,{recursive:true,force:true}));copyShopDeckFixture(copyCurrentSourceFixture,directory,crlf);
  const script=`import assert from 'node:assert/strict';
   import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
   import {sourceSlice,sourceEpoch} from './tests/helpers/closeout-source-epoch.mjs';
   const path='src/lua/abyss_deck_ui.lua',owner='src/lua/abyss_merchant.lua';
   const input=readFileSync(path,'utf8'),expected=sourceEpoch.proof.targets.shopDeckPrior.files[path].source;
   const project=()=>sourceSlice(path,input,'shopDeckPrior');
   assert.equal(project(),expected);
   const source=readFileSync(owner,'utf8');writeFileSync(owner,source+'\\n');
   assert.throws(project,/linked owner identity/);
   writeFileSync(owner,source);assert.equal(project(),expected);
   unlinkSync(owner);assert.throws(project,/linked owner missing/);`;
  execFileSync(process.execPath,['--input-type=module','-e',script],{cwd:directory,encoding:'utf8',timeout:30000,windowsHide:true});
 }
});
test('fresh authorization covers the complete changed-owner union without caching',()=>{
 const required=Object.keys(proof.current).filter(path=>Object.values(proof.targets).some(target=>target.files[path]?.sha256!==proof.current[path]?.sha256));
 assert.deepEqual([...proof.owners].sort(),required.sort());
});
test('compound intent owners replay the exact Release predecessor and reject a partial rollout',async()=>{
 const {gunzipSync}=await import('node:zlib');
 const {files}=JSON.parse(gunzipSync(readFileSync('tests/fixtures/release-compound-intent-source.json.gz')));
 const read=readHistoricalReleaseCheckpoint('compound').read;
 const readBase=path=>files[path]?.before.source??read(path);
 for(const path of Object.keys(files)){
  const latest=read(path),base=readBase(path);
  const historical=beforeAuthenticatedReleaseUiRestore(path,base,readBase);
  assert.notEqual(historical,base,path);
  assert.equal(beforeAuthenticatedReleaseUiRestore(path,latest,read),historical,path);
  assert.equal(beforeAuthenticatedReleaseUiRestore(path,latest.replaceAll('\n','\r\n'),read),historical.replaceAll('\n','\r\n'));
  assert.equal(beforeCurrentProductionSource(path,latest,read),beforeCharacterPreparationSource(path,base,readBase));
  assert.throws(()=>beforeCurrentProductionSource(path,base,read),/fresh current production owner/);
  for(const owner of Object.keys(files)){
   for(const invalid of [readBase(owner),read(owner)+'\n',null]){
    const drift=key=>key===owner?invalid:read(key);
    assert.throws(()=>beforeAuthenticatedReleaseUiRestore(path,latest,drift),/during compound intent validation/);
    assert.throws(()=>beforeCurrentProductionSource(path,latest,drift),/during compound intent validation/);
   }
  }
 }
});
// The approved STS detail modules belong to the current tree, but were not
// present in the recorded combined epoch. Verify their exact live bytes first.
const stsDetailAdded=Object.freeze({
 'src/lua/abyss_card_browse_preview.lua':{sha256:'e0d1d3262f93251bc47681cd25713a4532b2552d11f55cc6e3c2e8297d11c5bb',gitBlob:'54c7d8fb78276b57017e91470f3129be02ad1e29'},
 'src/lua/abyss_card_keyword_tip.lua':{sha256:'291991d574c7056c675ee90f217d81c3b546da865b56fc71fdaed3cfd60a1a9a',gitBlob:'fae7fb2fe4338beb16ef59180d0db7784e0d2a48'},
 'src/lua/abyss_node_ui_card_inspection.lua':{sha256:'51cc94804f4a33bdc43be23510a060e1c4acdaa222082e3ecafcc7fa268787ee',gitBlob:'1bcdf13d9ca0f434c23cd9a0a874b5a33953dfb1'},
});
function beforeStsDetailInventory(paths,read){
 for(const [path,binding] of Object.entries(stsDetailAdded)){
  assert(paths.filter(entry=>entry===path).length===1,'complete live STS detail owner inventory: '+path);
  const source=read(path);
  const lf=typeof source==='string'&&source.replaceAll('\r\n','\n');
  assert(typeof lf==='string'&&(source===lf||source===lf.replaceAll('\n','\r\n'))&&exactSourceMatches(lf,binding),'fresh live STS detail owner: '+path);
 }
 return paths.filter(path=>!Object.hasOwn(stsDetailAdded,path));
}
test('combined epoch authenticates the complete current production tree',()=>{
 const live=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();
 const currentLive=path=>readFileSync(path,'utf8');
 const prior=readStsDetailOwners(currentLive);
 const inventory=beforeStsDetailInventory(live,currentLive);
 assert.deepEqual(beforeStsDetailInventory(live,path=>currentLive(path).replaceAll('\n','\r\n')),inventory);
 const unknown='src/lua/unknown_sts_detail.lua';
 assert.deepEqual(beforeStsDetailInventory([...live,unknown],currentLive),[...inventory,unknown]);
 for(const path of Object.keys(stsDetailAdded)){
  const source=currentLive(path);
  const check=(paths,read)=>beforeStsDetailInventory(paths,read);
  const identity={message:'fresh live STS detail owner: '+path};
  const missing={message:'complete live STS detail owner inventory: '+path};
  for(const invalid of [source+'\n',source.replace('\n','\r\n'),undefined])
   assert.throws(()=>check(live,p=>p===path?invalid:currentLive(p)),identity);
  assert.throws(()=>check(live.filter(p=>p!==path),currentLive),missing);
  assert.throws(()=>check([...live,path],currentLive),missing);
 }
 const files=reviewedStsStyleInventory(inventory,prior);
 const recorded=Object.keys(proof.current).filter(path=>path!==retiredControllerPath&&proof.current[path]!==null).sort();
 const {current:read,entrance,readOwner}=integrationProductionReaders(prior);
 assert.deepEqual(entranceInventory(files,entrance),[...recorded,...stasisUpgradeAddedPaths,...actorFocusAdded,...deckPagesAdded,pointerInputPath].sort());
 assert.throws(()=>readFileSync(retiredControllerPath,'utf8'),{code:'ENOENT'});
 const retired=beforeInputRetirementReader(entrance)(retiredControllerPath);
 assert.equal(beforeCharacterPreparationSource(retiredControllerPath,retired,entrance),raw(retiredControllerPath));
 assertPointerInputSource(read(pointerInputPath));
 for(const path of stasisUpgradeAddedPaths)assertStasisUpgradeAdded(path,readFileSync(path,'utf8'));
 for(const path of actorFocusAdded)assertDevelopBackflowCurrent(path,readFileSync(path,'utf8'));
 assertCharacterPreparationSources(entrance);
 for(const path of recorded)assert.equal(beforeCharacterPreparationSource(path,entrance(path),entrance).replaceAll('\r\n','\n'),raw(path),path);
 const [owner]=characterPreparationOwners,current=entrance(owner);
 assert.equal(beforeCharacterPreparationSource(owner,current,entrance),raw(owner));
 assert.equal(beforeCharacterPreparationSource(owner,current+'\n',()=>{throw Error('foreign must not authorize reads');}),current+'\n');
 for(const missing of characterPreparationOwners)
  assert.throws(()=>beforeCharacterPreparationSource(owner,current,path=>path===missing?null:entrance(path)),/fresh character preparation source/);
 for(const path of recorded){
  const intent=path==='src/lua/abyss_battle_intent_view.lua';
  const readCurrent=intent?readOwner:entrance;
  const latest=readCurrent(path),previous=raw(path);
  assert.equal(beforeCurrentSelectionProductionSource(path,read,readOwner).replaceAll('\r\n','\n'),previous,path);
  const beforePotion=beforePotionBackflow(path,latest);
  const beforeBrowser=beforeDeckBrowserBackflow(path,beforePotion);
  for(const checkpoint of new Set([beforePotion,beforeBrowser])){
   if(checkpoint===latest)continue;
   assert.throws(()=>beforeCurrentProductionSource(path,checkpoint,readCurrent),{message:'fresh current production owner: '+path});
   assert.throws(()=>beforeCurrentProductionSource(path,latest,owner=>owner===path?checkpoint:readCurrent(owner)),
    {message:'combined linked owner identity: '+path+' during deck/potion backflow validation'});
  }
  if(latest.replaceAll('\r\n','\n')===previous)continue;
  for(const invalid of [previous,latest+'\n',null]){
   assert.throws(()=>beforeCurrentProductionSource(path,invalid,readCurrent),error=>
    error.message.includes(path)&&/fresh (?:current production owner|combat visual source|energy reference source)/.test(error.message),path);
   const changed=intent?reviewedSelectionRead((owner,encoding)=>owner===path?invalid:readFileSync(owner,encoding))
    :owner=>owner===path?invalid:readCurrent(owner);
   assert.throws(()=>beforeCurrentProductionSource(path,latest,changed),/fresh .*source|(?:combined|map deck) linked owner identity/,path);
  }
 }
});
test('entrance replay freshly checks the complete changed cohort and preserves foreign inputs',()=>{
 const config='config/architecture.json',{entrance:read}=integrationProductionReaders();
 const source=read(config),prior=beforeUiEntrance(config,source);
 const live=[config,...readdirSync('src/lua').filter(name=>name.endsWith('.lua')).map(name=>'src/lua/'+name)];
 const changed=live.filter(path=>beforeUiEntrance(path,read(path))!==read(path));
 assert.notEqual(prior,source);
 assert.equal(addedEntranceModules.length,2);
 for(const path of addedEntranceModules)assert(changed.includes(path),path);
 const incomplete=live.filter(path=>!addedEntranceModules.includes(path));
 assert.throws(()=>entranceInventory(incomplete,read),/complete entrance module inventory/);
 assert.throws(()=>entranceInventory([...live,addedEntranceModules[0]],read),/complete entrance module inventory/);
 assert.throws(()=>assertActorFocusInventory(incomplete.filter(path=>path!==config)),/complete entrance module inventory/);
 const project=input=>entrancePredecessor(config,source,input).source;
 assert.equal(project(read),prior);
 for(const changedPath of changed){
  const current=read(changedPath);
  const liveSource=readFileSync(changedPath,'utf8');
  const altered=(path,encoding)=>path===changedPath?liveSource+'\n':readFileSync(path,encoding);
  assert.throws(()=>project(integrationProductionReaders(altered).entrance),error=>
   error.message.includes(changedPath)&&/owner (?:identity|missing)|production source|master backflow source/.test(error.message));
  for(const invalid of [beforeUiEntrance(changedPath,current),current+'\n',null]){
   assert.throws(()=>project(path=>path===changedPath?invalid:read(path)),error=>
    /linked owner identity/.test(error.message)&&error.message.includes(changedPath));
  }
  assert.throws(()=>project(path=>{
   if(path===changedPath)throw Error('removed');
   return read(path);
  }),/linked owner missing/);
 }
 const foreign=source+'\n';
 assert.equal(entrancePredecessor(config,foreign,()=>assert.fail('foreign bytes read linked owners')).source,foreign);
 assert.equal(project(read),prior);
});
test('combined replay rejects a menu owner from before the controls guide removal',()=>{
 const {entrance:read}=integrationProductionReaders();
 const controls=readHistoricalReleaseCheckpoint('controls').read;
 const path='config/architecture.json',source=read(path),target='develop';
 assert.equal(sourceEpoch.preCombinedSource(path,source,{target,readSource:read}),proof.targets[target].files[path].source);
 for(const owner of releaseControlsGuideRemovalSourcePaths){
  const current=controls(owner);
  const prior=beforeReleaseControlsGuideRemoval(owner,current);
  assert.notEqual(prior,current,owner+' exact controls-guide successor');
  assert.notEqual(prior,read(owner),owner);
  assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target,readSource:path=>path===owner?prior:read(path)}),
   new RegExp('(?:combined|map deck) linked owner identity: '+owner.replaceAll('.','\\.')));
 }
});
test('current PC13 facade rejects every exact immediate predecessor before older views or reads',()=>{
 const disk=path=>readFileSync(path,'utf8');
 const reviewed=reviewedSelectionRead(disk);
 const live=readSelectionProductionOwners(disk,reviewed);
 const read=beforeInputRetirementReader(readBeforeMasterBackflowSource(disk));
 const readMapPrior=owner=>beforeSts1MapSource(owner,beforeRebasedCi(owner,read(owner)));
 const readPc13Prior=owner=>pc13RewardCoverSourcePaths.includes(owner)
  ?beforePc13RewardCover(owner,beforeAuthenticatedReleaseGuideSource(owner,readMapPrior(owner),readMapPrior))
  :raw(owner);
 assert.equal(pc13RewardCoverSourcePaths.length,5);
 for(const path of pc13RewardCoverSourcePaths){
  const successor=read(path),rebased=beforeRebasedCi(path,successor),mapPrior=beforeSts1MapSource(path,rebased);
  const pc13=beforeAuthenticatedReleaseGuideSource(path,mapPrior,readMapPrior);
  const predecessor=beforePc13RewardCover(path,pc13);
  assert.notEqual(predecessor,pc13,path);
  assert.equal(beforeCurrentProductionSource(path,live(path),live).replaceAll('\r\n','\n'),raw(path),path);
  assert.equal(beforeCharacterPreparationSource(path,predecessor,readPc13Prior).replaceAll('\r\n','\n'),raw(path),'historical predecessor remains supported: '+path);
  assert.throws(()=>beforeCurrentProductionSource(path,predecessor,read),{message:'fresh current production owner: '+path});
  const forbidden=()=>{throw Error('must not read for an unrecognized current owner');};
  const invalidSources=[predecessor,successor+'\n',null];
  if(rebased!==successor)invalidSources.push(rebased);
  if(mapPrior!==rebased)invalidSources.push(mapPrior);
  if(pc13!==mapPrior)invalidSources.push(pc13);
  for(const invalid of invalidSources)
   assert.throws(()=>beforeCurrentProductionSource(path,invalid,forbidden),{message:'fresh current production owner: '+path});
  assert.throws(()=>beforeCurrentProductionSource(path,live(path),owner=>owner===path?predecessor:live(owner)),
   /combined linked owner identity/,path);
 }
 const unrelated='src/lua/abyss_battle_ui.lua';
 assert.equal(beforeCurrentSelectionProductionSource(unrelated,live,reviewed).replaceAll('\r\n','\n'),raw(unrelated));
});
const cases=[
 ['m7-core-final','preM7FinalSource','develop','abyss_original_v4'],
 ['relic-query','preRelicQuerySource','develop','abyss_inventory'],
 ['core-lifecycle','preCoreLifecycleSource','develop','abyss_actor'],
 ['game-ui-extraction','preGameUiExtractionSource','develop','abyss_game_ui'],
 ['round3-catalog','preRound3CatalogSource','develop','abyss_combat_catalog'],
 ['power-shop','prePowerShopSource','powerShop','abyss_shop'],
 ['session-reward','preSessionRewardSource','sessionReward','abyss_potion_rewards'],
 ['watcher-final-execution','preWatcherExecutionSource','watcher','abyss_watcher_final_cards'],
 ['inventory-responsibilities','preInventoryResponsibilitiesSource','inventory','abyss_inventory'],
 ['act1-choice','preAct1ChoiceSource','act1','abyss_act1_events'],
 ['defect-plan','preDefectPlanSource','defect','abyss_defect_engine_cards'],
 ['colorless-catalog','preColorlessCatalogSource','colorless','abyss_combat_catalog'],
 ['potion-callback','prePotionCallbackSource','potion','abyss_relic_hooks'],
 ['end-turn-responsibilities','preEndTurnResponsibilitiesSource','endTurn','abyss_end_turn_powers'],
 ['actor-presence','preActorPresenceSource','actor','abyss_actor'],
 ['reward-query-boundary','preRewardQueryBoundarySource','reward','abyss_relic_choices'],
];
for(const [file,name,target,module]of cases){
 const exported=await import(`./helpers/${file}-source-inverse.mjs`),fn=exported[name];
 test(`${name}: current source and configuration match original target projection`,()=>{
  const targetRead=p=>proof.targets[target].files[p]?.source??null;
  // The M7 Actor adapter authenticates its current admission against physical
  // owners before exposing the frozen target; a captured epoch is not live IO.
  const currentRead=name==='preM7FinalSource'?p=>readFileSync(p,'utf8'):raw;
  const projectCurrent=(path,input,readSource)=>{
   if(name!=='preM7FinalSource')return fn(path,input,{readSource});
   const reviewed=owner=>{
    if(owner!==retiredControllerPath)return readReviewedSelectionSource(owner,readSource);
    assert(readRetiredController(reviewedSelectionRead(readSource)).restored,'combined linked owner identity: '+owner);
    return readReviewedSelectionSource(owner);
   };
   if(path==='config/architecture.json'){
    assert(input===readSource(path)||input===raw(path),'combined linked owner identity: '+path);
    // Reuse the complete live-owner admission before the frozen M7 projection.
    input=sourceEpoch.preCombinedSource(path,reviewed(path),{target,readSource:reviewed});
   }
   return fn(path,input,{readSource:reviewed});
  };
  for(const path of [`src/lua/${module}.lua`,'config/architecture.json']){
   const expected=fn(path,targetRead(path),{readSource:targetRead});
   const inputs=name==='preM7FinalSource'?new Set([raw(path),currentRead(path)]):[raw(path)];
   for(const input of inputs){
    const projected=projectCurrent(path,input,currentRead);
    assert.equal(projected,expected,path);
    if(name==='preM7FinalSource'){
     assert.notEqual(projected,input,'current M7 input must actually project to its frozen target');
     if(path==='config/architecture.json'&&input===currentRead(path))
      assert.throws(()=>projectCurrent(path,input,raw),/combined linked owner/,
       'a captured configuration cannot authenticate current M7 owners');
    }
   }
  }
 });
 test(`${name}: foreign input stays opaque and performs no linked reads`,()=>{
  const path=`src/lua/${module}.lua`,foreign=raw(path)+'\n';let count=0;
  assert.equal(fn(path,foreign,{readSource(){count++;throw Error('unexpected read');}}),foreign);assert.equal(count,0);
 });
}
test('root combined projection rejects fresh missing/foreign/late-linked drift after success',async()=>{
 const {preRelicQuerySource:fn}=await import('./helpers/relic-query-source-inverse.mjs');
 const path='config/architecture.json',last=proof.owners.at(-1);let corrupt=false,count=0;
 const reader=p=>{count++;return corrupt&&p===last?raw(p)+'\n':raw(p);};
 fn(path,raw(path),{readSource:reader});assert(count>=proof.owners.length);
 corrupt=true;assert.throws(()=>fn(path,raw(path),{readSource:reader}),/linked owner/);
});
test('round3 absent catalog still retires Actor, Potion, and Colorless witnesses',async()=>{
 const {prepareRound3CatalogModuleRetirement:prepare}=await import('./helpers/round3-catalog-source-inverse.mjs');
 const root=mkdtempSync(join(tmpdir(),'retirement-proposal-'));
 const paths=['src/lua/abyss_actor_presence.lua','src/lua/abyss_relic_potion_hooks.lua','src/lua/abyss_colorless_catalog.lua'];
 const liveBefore=Object.fromEntries(paths.map(path=>[path,readFileSync(join(sandbox,path),'utf8')]));
 for(const path of paths){mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),raw(path));}
 const retire=prepare(root,{sourceRoot:sandbox});retire();for(const path of paths)assert.equal(existsSync(join(root,path)),false,path);
 for(const path of paths)assert.equal(readFileSync(join(sandbox,path),'utf8'),liveBefore[path],'live source retained');
});
test('round3 present catalog retires all witnesses and rechecks bytes before deletion',async t=>{
 const {prepareRound3CatalogModuleRetirement:prepare}=await import('./helpers/round3-catalog-source-inverse.mjs');
 const {copyCurrentSourceFixture}=await import('./helpers/isolated-current-source.mjs');
 const sourceRoot=mkdtempSync(join(tmpdir(),'retirement-source-'));
 t.after(()=>rmSync(sourceRoot,{recursive:true,force:true}));
 copyShopDeckFixture(copyCurrentSourceFixture,sourceRoot);
 const paths=['src/lua/abyss_combat_catalog.lua','src/lua/abyss_actor_presence.lua','src/lua/abyss_relic_potion_hooks.lua','src/lua/abyss_colorless_catalog.lua'];
 for(const mutate of [false,true]){
  const root=mkdtempSync(join(tmpdir(),'retirement-present-'));
  for(const path of paths){mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),raw(path));}
  const retire=prepare(root,{sourceRoot});
  if(mutate){writeFileSync(join(root,paths[0]),raw(paths[0])+'\n');assert.throws(retire,/identity/);for(const path of paths)assert(existsSync(join(root,path)));}
  else{retire();for(const path of paths)assert(!existsSync(join(root,path)));}
 }
});
test('round3 retirement rejects live hardlinks and live source roots',async()=>{
 const {prepareRound3CatalogModuleRetirement:prepare}=await import('./helpers/round3-catalog-source-inverse.mjs');
 assert.throws(()=>prepare(sandbox,{sourceRoot:sandbox}),/separate/);
 const root=mkdtempSync(join(sandbox,'retirement-hardlink-')),path='src/lua/abyss_combat_catalog.lua';mkdirSync(dirname(join(root,path)),{recursive:true});
 linkSync(join(sandbox,path),join(root,path));try{assert.throws(()=>prepare(root,{sourceRoot:sandbox}),/single link|inode/);}finally{unlinkSync(join(root,path));}
});

test('map and card replay require every same-path sample and live reread to match',()=>{
 const disk=path=>readFileSync(path,'utf8');
 const read=readSelectionProductionOwners(disk,reviewedSelectionRead(disk));
 const readMaster=readBeforeMasterBackflowSource(disk);
 const mapOwner='src/lua/abyss_game_ui_view.lua';
 const readBackflow=owner=>{
  const current=readMaster(owner);
  const authenticated=authenticateDevelopBackflow(owner,current,readMaster);
  // The map signature follows the older Develop branch, not the UI continuation.
  return owner===mapOwner?beforeDevelopBackflow(owner,current):authenticated;
 };
 const readSigned=owner=>replayRebasedInput(owner,readBackflow);
 for(const [path,prior,authorize]of [
  [mapOwner,beforeSts1MapSource,authorizeSts1MapSource],
  ['src/lua/abyss_battle_card_glow.lua',beforeCardFeedbackOwner,authorizeCardFeedbackOwners],
  ['src/lua/abyss_feedback.lua',beforeCardFeedbackOwner,authorizeCardFeedbackOwners],
 ]){
  const current=read(path),signedView=readSigned(path),old=prior(path,signedView);
  assert.notEqual(signedView,old,path);
  for(const samples of [[[path,old],[path,signedView]],[[path,signedView],[path,old]]])
   assert.throws(()=>authorize(samples,readSigned),/mixed live and stale sources/);
  assert.throws(()=>authorize([[path,signedView]],()=>old),/changed during owner validation/);
  assert.throws(()=>beforeCurrentProductionSource(path,old,read),/fresh current production owner/);
  assert.throws(()=>beforeCurrentProductionSource(path,current,owner=>owner===path?old:read(owner)),/combined linked owner identity/);
 }
});
