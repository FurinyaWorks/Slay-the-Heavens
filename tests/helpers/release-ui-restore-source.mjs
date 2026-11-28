import {authorizeRebasedRelease,beforeRebasedRelease} from './rebased-release-source.mjs';
import {beforeLateReleaseUiSource,beforeReleaseDetailSource} from './release-integration-source.mjs';
import {beforeCombatVisualSource,combatVisualPriorRead} from './combat-visual-source.mjs';
import {authorizeRefinedReleaseProduction,beforeRefinedReleaseProduction} from './refined-release-source.mjs';
import {inputRetirementStsFixtureSource} from './input-retirement-sts-binding.mjs';
import {beforeStsFadeCi} from './sts-fade-ci-source.mjs';
import {beforeCurrentReplayFixes} from './current-replay-fix-sources.mjs';
import {authenticateUiEntrance,beforeUiEntranceWitness} from './ui-entrance-source.mjs';
import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';
import {beforeStsDetailSource} from './release-sts-detail-source.mjs';
import {beforeKnownMasterBackflowSource} from './master-backflow-source.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');

function matches(source,binding){
 if(!binding||typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
}

export function releaseUiRestoreArchive(bytes,expectedSha,expectedBase='ff6af63d9bf93056dd772347d10dc749e7fa8d34'){
 assert.equal(hash(bytes),expectedSha,'exact Release UI source archive');
 const {base,files}=JSON.parse(gunzipSync(bytes));
 assert.equal(base,expectedBase);
 for(const [path,{before,after}] of Object.entries(files)){
  assert.equal(hash(before.source),before.sha256,path+' base SHA256');
  assert.equal(blob(before.source),before.gitBlob,path+' base Git blob');
  assert.match(after.sha256,/^[a-f0-9]{64}$/);
  assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
 }
 function project(path,source){
  if(!Object.hasOwn(files,path)||!matches(source,files[path].after))return source;
  const prior=files[path].before.source;
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 }
 return {files,project};
}

const {files,project}=releaseUiRestoreArchive(readFileSync(new URL('./release-ui-restore-source.json.gz',import.meta.url)),
 'e38609afe1efa63715e2f54619fde19501b20b59ebb9a9aaf5944e82b22e339b');
const rightClick=releaseUiRestoreArchive(readFileSync(new URL('./release-card-right-click-source.json.gz',import.meta.url)),
 'a157bfd25b91346bc4b9c7beae6de19baec13e824ee808d59e827b5052d78a1a','ae15cf5f597728f0fe876f7136230955c3ec6179');
const fieldCancel=releaseUiRestoreArchive(readFileSync(new URL('./release-card-field-cancel-source.json.gz',import.meta.url)),
 'f38a352f98ef946e1e836781dd9ebd131010c03e04cfa62f928d94f6358c3bca','aa8fde88c2a077f3e7266984cdf3a4e6be8fc45a');
const controlsGuideRemoval=releaseUiRestoreArchive(readFileSync(new URL('./release-controls-guide-removal-source.json.gz',import.meta.url)),
 '321abc9fb6759dd27644f414c88f3a2df0be32f236a258a52d5b89cc6d22d687','db8bca6ad226bc816de7e6919a320d9d41fe9a78');
const sharedRelics=releaseUiRestoreArchive(readFileSync(new URL('./release-shared-relic-source.json.gz',import.meta.url)),
 '4e72ca430cf8740dd6cb828547d8b8f29ba169c0c90cf49c2c662aa5964df5cc','da94ed7bbcb3002255442f8d120c6c2146878ae7');
const forgeGrid=releaseUiRestoreArchive(readFileSync(new URL('./release-forge-source.json.gz',import.meta.url)),
 '8557c9daa0943c815ca11e0c135d081c08081f040bbef85b3cd799f7a586c564','7381cf7152ba7a726506f9a5b525e13cfbd2c87a');
const recording=releaseUiRestoreArchive(readFileSync(new URL('./recording-0401-source.json.gz',import.meta.url)),
 '9af199338e44fb660599900c5474624853f02be24aa5590029f37cee2a551e24','d26c4dc59e639741471580a242718a284a67f758');
const shopEntry=releaseUiRestoreArchive(readFileSync(new URL('./release-shop-entry-source.json.gz',import.meta.url)),
 'd3c114b39aa8affa1ae5c2b3ee54117640dcacce750efc24d78312792d8d2ff7','b0505f57def990f9d80d7cf917402d7616164f4f');
export const shopEntrySourcePaths=Object.freeze(Object.keys(shopEntry.files).filter(path=>path.startsWith('src/lua/')));
const nodePickerFixture='tests/lua/support/official_node_picker_pagination.lua';
const approvedNodePicker=Object.freeze({
 sha256:'8ff274bff2d7003ca35ae72da8fc867191778a926f97ab4983a30a56064545bc',
 gitBlob:'ca0809084c134c8d1ec947f0272275e76da03100',
});
const nodePickerTimeline=Object.freeze({
 sha256:'ba6e805f24fa5ffb79b1a8adc9a278e5f8ee53a2d06a18958353c5dec3519369',
 gitBlob:'a487c818b24e80b912e42f5d7137b2a4ea34579b',
});
export function beforeReleaseShopEntry(path,source){
 if(path===nodePickerFixture&&matches(source,approvedNodePicker)){
  // #951 renamed the event while retaining the current shop timeline fixture.
  const timeline=source.replaceAll('\r\n','\n').replace("H.fixture('augmenter')","H.fixture('drug_dealer')");
  assert(matches(timeline,nodePickerTimeline),'exact Node Picker event rename predecessor');
  const prior=timeline.replace("local advanceShop = dofile('tests/lua/support/shop_timeline.lua')\n",'')
   .replace("assert(ui:press('merchant/talk'));advanceShop(ui)","assert(ui:press('merchant/talk'));ui:update(.31)");
  assert(matches(prior,shopEntry.files[path].after),'exact Node Picker shop replay predecessor');
  source=source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 }
 return shopEntry.project(path,source);
}
export function shopEntryPriorRead(read){
 return (path,...args)=>beforeReleaseShopEntry(path,read(path,...args));
}
export const beforeRecordingUi=(path,source,read)=>beforeReleaseDetailSource(path,recording.project(path,beforeCombatVisualSource(path,source,read)));
const officialRuntimePath='tests/official-assets-runtime.test.mjs';
const currentOfficialRuntime={
 sha256:'a3341b88551a035189ccc811fa7aa2b7f2eb9c1b6377baa22df6ff3b1fc8c828',
 gitBlob:'82bdb7dda43d8772e1d1d5ffac3a9690509d9dd4',
};
const releaseOfficialRuntime={
 sha256:'fd43e53300bdb0f7f178a6887a0e8a5a7c329ad5d0075b7a99a5d343c6f390b7',
 gitBlob:'b7b75635e0ead0544e430a94f110315b5e81f2ea',
};
const releaseRecordingSources=new Set([officialRuntimePath,'scripts/v25-map-layout.mjs',
 'scripts/sts-reward-row-layout.mjs','tests/v25-map-layout.test.mjs']);
const deckLayoutPath='scripts/deck-ui-layout.mjs';
const pileReturnLayout={
 sha256:'0f57f26a4fb520c8feb1df92d48417a6b445900a9ae453c160f500e5a9ee2272',
 gitBlob:'6c9ce59b446f0dd9b8d5f9ffb3c2303e0320195d',
};
function recordingRuntimeInput(path,source){
 // Production owners must remain raw for the entrance cohort's fresh identity check.
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 if(releaseRecordingSources.has(path))source=beforeKnownMasterBackflowSource(path,source);
 source=beforeCurrentReplayFixes(path,beforeUiEntranceWitness(path,source));
 if(path!==officialRuntimePath||!matches(source,currentOfficialRuntime)&&!matches(source,releaseOfficialRuntime))return source;
 return beforeStsFadeCi(path,inputRetirementStsFixtureSource(path,source));
}
function recordingLayoutInput(path,source){
 if(path!==deckLayoutPath||!matches(source,pileReturnLayout))return source;
 const successor="battlePileReturn(button('pileReturn',[-550,-237,180,54],'返回'),theme.officialAssets.buttonInk)";
 const predecessor="battlePileReturn(button('pileReturn',[-550,-237,180,54],'返回'),true,undefined,theme.officialAssets.buttonInk)";
 assert.equal(source.split(successor).length,2,'exact pile return layout change');
 const prior=source.replace(successor,predecessor);
 assert(matches(prior,recording.files[path].after),'exact recording layout predecessor');
 return prior;
}
export function beforeAuthenticatedRecordingStage(path,source,read){
 const deckPath='src/lua/abyss_deck_ui.lua';
 const deck=path===deckPath?beforeStsDetailSource(path,source):source;
 const releasedDeck=path===deckPath&&beforeReleaseDeckPointer(path,deck)!==deck;
 const rawRead=read,observed=new Map();
 let entranceAuthenticated=false;
 // Keep raw reads stable across both cohort admission and legacy projection.
 const uniform=raw=>{
  if(typeof raw!=='string')return false;
  const lf=raw.replaceAll('\r\n','\n');
  return !lf.includes('\r')&&(raw===lf||raw===lf.replaceAll('\n','\r\n'));
 };
 const rawOwner=(owner,encoding)=>{
  const raw=rawRead(owner,encoding);
  if(typeof raw!=='string'||(!owner.startsWith('src/')&&owner!=='config/architecture.json'))return raw;
  const stable=uniform(raw)?raw.replaceAll('\r\n','\n'):raw;
  if(observed.has(owner))assert.equal(stable,observed.get(owner),'recording UI linked owner changed: '+owner);
  else observed.set(owner,stable);
  return raw;
 };
 const authenticate=()=>{
  if(entranceAuthenticated)return;
  authenticateUiEntrance(owner=>{
   const raw=rawOwner(owner,'utf8');
   assert(uniform(raw),'recording UI linked owner identity: '+owner);
   return raw;
  });
  entranceAuthenticated=true;
 };
 // Peel #1080 only for this deck owner, and only after checking the live
 // entrance cohort against unprojected reads.
 if(releasedDeck)authenticate();
 read=(owner,encoding)=>{
  const raw=rawOwner(owner,encoding);
  if(owner!==deckPath)return raw;
  if(releasedDeck)assert(uniform(raw)&&
   raw.replaceAll('\r\n','\n')===source.replaceAll('\r\n','\n'),'recording UI linked owner changed: '+owner);
  if(beforeStsDetailSource(owner,raw)!==raw)authenticate();
  // Map-deck owns this conversion; retain raw custody until its linked check.
  return raw;
 };
 if(releasedDeck)read(path,'utf8');
 const input=recordingRuntimeInput(path,source);
 if(input!==source){
  const live=read(path,'utf8');
  assert(typeof live==='string'&&live.replaceAll('\r\n','\n')===source.replaceAll('\r\n','\n'),
   'recording UI linked owner changed: '+path);
 }
 const readInput=owner=>recordingRuntimeInput(owner,read(owner,'utf8'));
 const released=beforeRebasedRelease(path,input);
 if(released!==input)authorizeRebasedRelease([[path,input]],readInput);
 const readReleased=owner=>beforeRebasedRelease(owner,readInput(owner));
 const current=recordingLayoutInput(path,beforeCombatVisualSource(path,released,readReleased));
 const prior=recording.project(path,current);
 if(prior!==current){
  const live=recordingLayoutInput(path,combatVisualPriorRead(readReleased)(path,'utf8'));
  assert(matches(live,recording.files[path].after),'recording UI linked owner changed: '+path);
 }
 return prior===current?source:prior;
}
export const releaseForgeSourcePaths=Object.freeze(Object.keys(forgeGrid.files).filter(path=>path.startsWith('src/lua/')));
export const beforeReleaseForgeGridUi=forgeGrid.project;
export const releaseControlsGuideRemovalSourcePaths=Object.freeze(Object.keys(controlsGuideRemoval.files).filter(path=>path.startsWith('src/lua/')));
export const releaseSharedRelicSourcePaths=Object.freeze(Object.keys(sharedRelics.files).filter(path=>path.startsWith('src/lua/')));
export const beforeReleaseSharedRelicUi=sharedRelics.project;
export const beforeReleaseControlsGuideRemoval=(path,source,read)=>controlsGuideRemoval.project(path,beforeRecordingUi(path,source,read));
export const releaseRightClickSourcePaths=Object.freeze(Object.keys(rightClick.files));
export const releaseUiRestoreSourcePaths=Object.freeze([...new Set([...Object.keys(files),...Object.keys(fieldCancel.files)])]);
export const beforeReleaseRightClick=(path,source)=>rightClick.project(path,fieldCancel.project(path,source));
const compoundIntentPaths=['src/lua/abyss_battle_intent_view.lua','src/lua/abyss_battle_render_actors.lua'];
let compoundIntent;
export function beforeReleaseCompoundIntent(path,source,read,{requireCurrent=false,reviewed=false}={}){
 if(!compoundIntentPaths.includes(path))return source;
 compoundIntent??=releaseUiRestoreArchive(readFileSync(new URL('../fixtures/release-compound-intent-source.json.gz',import.meta.url)),
  '4d1d0ca90bc98c95fef49584283807598edd42f995d230357d28fa41efa14111','5acff84e14816711fd9f7a86e1b994069b2c8af6');
 const prior=compoundIntent.project(path,source);
 if(source===prior){
  const predecessor=compoundIntent.files[path].before;
  if(requireCurrent&&matches(source,predecessor))
   assert(reviewed&&matches(read(path),predecessor),'fresh current production owner: '+path);
  return source;
 }
 if(read)for(const owner of compoundIntentPaths)
  assert(matches(read(owner),compoundIntent.files[owner].after),'combined linked owner identity: '+owner+' during compound intent validation');
 return prior;
}
export function beforeReleaseUiRestore(path,source,read){
 const compound=beforeReleaseCompoundIntent(path,source,read);
 const shop=beforeReleaseShopEntry(path,beforeLateReleaseUiSource(path,compound));
 const recording=beforeRecordingUi(path,shop,read);
 const refined=beforeRefinedReleaseProduction(path,recording);
 const forge=beforeReleaseForgeGridUi(path,refined);
 const relics=beforeReleaseSharedRelicUi(path,forge);
 const controls=beforeReleaseControlsGuideRemoval(path,relics,read);
 return project(path,beforeReleaseRightClick(path,controls));
}
const authorizationPaths=[...new Set([...releaseUiRestoreSourcePaths,...releaseRightClickSourcePaths,...releaseControlsGuideRemovalSourcePaths,...releaseSharedRelicSourcePaths,...releaseForgeSourcePaths])];

export function authorizeReleaseUiRestore(samples,read){
 const readLive=read;
 samples=samples.map(([path,source])=>[path,beforeLateReleaseUiSource(path,beforeReleaseCompoundIntent(path,source,readLive))]);
 read=path=>beforeLateReleaseUiSource(path,beforeReleaseCompoundIntent(path,readLive(path)));
 for(const [path,input] of samples){
  const expected=shopEntry.files[path]?.after;
  if(matches(input,expected))assert(matches(read(path),expected),'shop entry linked owner changed: '+path);
 }
 samples=samples.map(([path,input])=>[path,beforeReleaseShopEntry(path,input)]);
 read=shopEntryPriorRead(read);
 for(const [path,input]of samples){
  beforeCombatVisualSource(path,input,read);
 }
 samples=samples.map(([path,input])=>[path,beforeCombatVisualSource(path,input,read)]);
 read=combatVisualPriorRead(read);
 for(const [path,input] of samples){
  const expected=recording.files[path]?.after;
  if(!matches(input,expected))continue;
  assert(matches(read(path),expected),'recording UI linked owner changed: '+path);
 }
 const rawRead=read;
 samples=samples.map(([path,input])=>[path,beforeRecordingUi(path,input,rawRead)]);
 read=path=>beforeRecordingUi(path,rawRead(path),rawRead);
 authorizeRefinedReleaseProduction(samples,read);
 // A combined replay that contains current menu code must use the same release
 // version for every sampled menu owner. Older all-historical views still replay.
 const currentMenu=samples.some(([path,input])=>releaseControlsGuideRemovalSourcePaths.includes(path)
  &&matches(input,controlsGuideRemoval.files[path].after));
 const currentRelics=samples.some(([path,input])=>releaseSharedRelicSourcePaths.includes(path)
  &&matches(input,sharedRelics.files[path].after));
 const currentForge=samples.some(([path,input])=>releaseForgeSourcePaths.includes(path)
  &&matches(input,forgeGrid.files[path].after));
 for(const path of authorizationPaths){
  const inputs=samples.filter(sample=>sample[0]===path).map(sample=>sample[1]);
  if(!inputs.length)continue;
  const menuBinding=controlsGuideRemoval.files[path]?.after;
  const relicBinding=sharedRelics.files[path]?.after;
  const forgeBinding=forgeGrid.files[path]?.after;
  const expected=currentForge&&forgeBinding?forgeBinding:currentRelics&&relicBinding?relicBinding:currentMenu&&menuBinding?menuBinding
   :[forgeBinding,relicBinding,menuBinding,fieldCancel.files[path]?.after,rightClick.files[path]?.after,files[path]?.after]
    .find(binding=>inputs.some(input=>matches(input,binding)));
  if(!expected)continue;
  const message='combined linked owner identity: '+path+' changed during owner validation';
  assert(inputs.every(input=>matches(input,expected)),message);
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,expected),message);
 }
}

export function beforeAuthenticatedReleaseUiRestore(path,source,read){
 const prior=beforeReleaseUiRestore(path,source,read);
 if(prior!==source)authorizeReleaseUiRestore([[path,source]],read);
 return prior;
}
