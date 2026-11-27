import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {releaseUiRestoreArchive} from './release-ui-restore-source.mjs';
import {visualSelectionOwnerRead} from './visual-selection-source.mjs';
import {beforeSelectionNodeNoticeSource,selectionNodeNoticePath} from './ui-selection-current-source.mjs';
import {beforeKnownMasterBackflowSource,beforeMasterBackflowSource,readBeforeMasterBackflowSource,productionReadingBackflowOwns} from './master-backflow-source.mjs';
import {beforeShopPurchaseOwner,shopPurchaseOwner} from './shop-deck-purchase-source.mjs';

const replayBase='02dcb2466b2c90308f9a9e42896c2c5af3ed288c';
const renamedOwners=Object.freeze({
 'src/lua/abyss_blue_slaver_ai.lua':'src/lua/abyss_blue_guard_ai.lua',
 'src/lua/abyss_drug_dealer_event.lua':'src/lua/abyss_augmenter_event.lua',
 'src/lua/abyss_red_slaver_ai.lua':'src/lua/abyss_red_guard_ai.lua',
});
const reviewedReaders=new WeakSet();
export const isReviewedSelectionRead=read=>reviewedReaders.has(read);
const runCostsPath='scripts/ci-run-costs.mjs';
const runCostsCurrent={sha256:'852e3332f842b29f22815d17a52718e4bbed5f7efec1106ae9c29c037668baf3',
 gitBlob:'31a9d3efa82a378a36f32591954587d171b1d3c5'};
const runCostsBeforeTriage={sha256:'8a16aa06d3a3c03e757c396c691924e223fc0a561c590b2eff20d5a07d030948',
 gitBlob:'25b30da208dc7129aababade24a40f07f91d5e83'};

function beforeRunCostTriage(source){
 const lf=source.replaceAll('\r\n','\n');
 if((source!==lf&&source!==lf.replaceAll('\n','\r\n'))||!exactSourceMatches(lf,runCostsCurrent))return source;
 const start=lf.indexOf('\n\nconst testSteps=');
 const stop=lf.indexOf('\nconst ms =',start);
 assert(start>=0&&stop>start,'exact #1031 triage helpers');
 const signature='export function runCost(run,response,{inventoryRun,inventoryJobs}={}) {';
 const prior=(lf.slice(0,start)+lf.slice(stop))
  .replace('function validateJobs(run,response) {',signature)
  .replace("    if(!Number.isSafeInteger(job.id)||job.id<=0)throw Error('Invalid job identity');\n",'')
  .replace('}\n'+signature+'\n  validateJobs(run,response);\n','')
  .replace(/    if\(process\.argv\[2\]==='--triage'\)[\s\S]+?(?=  }catch\(error\))/,
   "    if(process.argv[2]?.startsWith('--')){governanceCli();process.exit(0);}\n"+
   "    if(process.argv.length!==4)throw Error('Usage: ci-run-costs.mjs <raw-directory> <output.json>');\n"+
   "    writeFileSync(process.argv[3],JSON.stringify(analyzeDirectory(process.argv[2]),null,2)+'\\n');\n");
 assert(exactSourceMatches(prior,runCostsBeforeTriage),'exact #1031 run-cost predecessor');
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

let owners;
function reviewedSelectionOwners(){
 if(owners)return owners;
 const reward=releaseUiRestoreArchive(
  readFileSync(new URL('./reward-current-source.json.gz',import.meta.url)),
  'a68d10abe6e6f3bd33a69f85326d34dce1250b34b6892543cb5c1314c01f3b9f',replayBase);
 const selection=releaseUiRestoreArchive(
  readFileSync(new URL('./reviewed-selection-current-source.json.gz',import.meta.url)),
  'ae2612caad5be7b4589812d9f0580b17bf99e775e53db38c093f79ff46c4cebb',replayBase);
 assert.equal(Object.keys(reward.files).length,51,'shared reward sources in reviewed Selection replay');
 assert.equal(Object.keys(selection.files).length,58,'additional reviewed Selection replay sources');
 const registered=new Map([...Object.entries(reward.files),...Object.entries(selection.files)]);
 assert.equal(registered.size,109,'distinct reviewed Selection replay owners');
 for(const path of Object.keys(renamedOwners))assert(registered.has(path),'registered renamed Selection owner: '+path);
 owners=registered;
 return owners;
}

// The original replay still walks and checks its whole closure. Bind only
// known current owners here and reread each one whenever that closure asks.
export function reviewedSelectionRead(read=readFileSync){
 const readMaster=readBeforeMasterBackflowSource(read);
 const readCurrent=(path,encoding)=>{
  if(path===selectionNodeNoticePath)return beforeSelectionNodeNoticeSource(path,read(path,encoding));
  if(productionReadingBackflowOwns(path))return read(path,encoding);
  return readMaster(path,encoding);
 };
 const registered=reviewedSelectionOwners();
 const readOwner=visualSelectionOwnerRead(readCurrent);
 const reviewed=(path,encoding='utf8')=>{
  if(path===shopPurchaseOwner||path===runCostsPath){
   const live=read(path,'utf8');
   const source=path===shopPurchaseOwner?beforeShopPurchaseOwner(path,live):beforeRunCostTriage(live);
   return encoding==='utf8'?source:Buffer.from(source);
  }
  const row=registered.get(path);
  if(!row)return readMaster(path,encoding);
  const active=Object.hasOwn(renamedOwners,path)?renamedOwners[path]:path;
  if(active!==path)assert.throws(()=>readMaster(path,'utf8'),{code:'ENOENT'},'legacy Selection owner must stay absent: '+path);
  const source=readOwner(active,row);
  return encoding==='utf8'?source:Buffer.from(source);
 };
 reviewedReaders.add(reviewed);
 return reviewed;
}

// #962 preserved the #899 browser and changed its live publication fast path.
const deckBrowser={
 "path": "src/lua/abyss_deck_browser.lua",
 "beforeSha256": "ca0fe78afb9035b2b4ccfa0e2de86d21cb7789a6e28868033259cf89d4bd9d3e",
 "afterSha256": "da4dad9b9b771649176887fa8accc36b02283736cec9e0362a04fa335c2e6c36",
 "beforeBlob": "c7d0f015aaea8ed5e797458c3b8cd06644c14c2b",
 "afterBlob": "e385c9d626ca1a7858399d15d0c2c95c9cb83a97",
 "hunks": [
  {
   "at": 170,
   "before": "local function prepare(pool,job)",
   "after": "local function showHit(hit)\n    if hit.visible~=true then\n        assert(hit:SetVisible(true)~=false,'deck browser hit visibility rejected')\n    end\nend\n\nlocal function prepare(pool,job)"
  },
  {
   "at": 218,
   "before": "    assert(entry.hit:SetVisible(true)~=false,'deck browser hit visibility rejected')",
   "after": "    showHit(entry.hit)"
  }
 ]
};
const addedStsOwners=Object.freeze({
 // Modules introduced by the complete #1008 master return.
 "src/lua/abyss_choice_grid.lua": {
  "sha256": "8c90dc8baa1bfa74fae4466c737a0978099f907e5274a8ca8ce45a4ebf6162ac",
  "gitBlob": "f775830e232700ccab6d3a1f8029c2028c1e492d"
 },
 "src/lua/abyss_deck_grid.lua": {
  "sha256": "0827aa8e919b43694b00dbcfb3bf51af0ceedca2bed11431e501e4caa4eec5b2",
  "gitBlob": "c83d6e88e71b28abb4c35812945632fba76c87ae"
 },
 "src/lua/abyss_mobile_run_hud.lua": {
  "sha256": "ab970cbea41403ff62fc8d5c795eb4d00d7b193e3908db47910701700000182a",
  "gitBlob": "c1861de7aeaf14c46abefa27eb8737d52332fb7c"
 },
 "src/lua/abyss_rounded_button.lua": {
  "sha256": "17abb2c505d990cda010e64593888729684da1da911990c24599fb0cd0488b69",
  "gitBlob": "007dce52b4328cee2f2224126056ee9b575ac5b6"
 },
 "src/lua/abyss_strike.lua": {
  "sha256": "a18e03ba705bd5f2c1bf23e474344a4256f63cc51b0918d3aba519dcffe64e5d",
  "gitBlob": "6a9d410fb08e3116385ee044b3dbb5fa4f2eb86b"
 },
 "src/lua/abyss_byrd_ground_trial.lua": {
  "sha256": "b0e63cd3ba2984fff11d3ec88cd6d91b4a26f5b6f83c678f165fc513de5e0991",
  "gitBlob": "1f48f0d968bd223d0c687ad838bdb300fce70ae4"
 },
 "src/lua/abyss_card_keywords.lua": {
  "sha256": "68210457543ae78b4451ea9b7b38a8532e587f45c688ef7ba38adb55f5bf6bd1",
  "gitBlob": "d488ee55fc47220e2dfe4aa36f2540eb70b75720"
 },
 "src/lua/abyss_chapter_battle_scene.lua": {
  "sha256": "2a5897fdcf20f66a67995e35d8918a3fb3b7dbb6b31b61f7d51237097509a9bf",
  "gitBlob": "f3ee067fd8557d8cbb028fde9135963078daba17"
 },
 "src/lua/abyss_checkpoint_identities.lua": {
  "sha256": "ba889cc7eabf36f222fe5e6b0d40f7312b22e5e0f490af414094ffdf63dda429",
  "gitBlob": "ecadb79300ccd56880327679db5ddfeba3effc09"
 },
 "src/lua/abyss_run_hud.lua": {
  "sha256": "f98361714cc6b1ccd1f0f5a80324c0459ad51904512c97520b7e900d304fa3c4",
  "gitBlob": "fd762e787f64571ce8e0dc56f91b66744c8ef93f"
 }
});
const addedOrRenamedStsOwners=new Set([...Object.keys(addedStsOwners),...Object.values(renamedOwners)]);
export const hasReviewedStsStyleModules=paths=>paths.some(path=>addedOrRenamedStsOwners.has(path));

export function reviewedStsStyleRead(read=readFileSync){
 const selection=reviewedSelectionRead(read);
 const reviewed=path=>{
  if(path!==deckBrowser.path)return selection(path);
  const current=read(path,'utf8');
  const lf=typeof current==='string'&&current.replaceAll('\r\n','\n');
  assert(lf&&!lf.includes('\r')&&(current===lf||current===lf.replaceAll('\n','\r\n'))
   &&exactSourceMatches(lf,{sha256:deckBrowser.afterSha256,gitBlob:deckBrowser.afterBlob}),
   'fresh StS deck browser source: '+path);
  const prior=restoreExactFixtureHunks(deckBrowser,path,lf);
  assert(exactSourceMatches(prior,{sha256:deckBrowser.beforeSha256,gitBlob:deckBrowser.beforeBlob}),
   'exact StS deck browser predecessor: '+path);
  return current===lf?prior:prior.replaceAll('\n','\r\n');
 };
 reviewedReaders.add(reviewed);
 return reviewed;
}

export function reviewedStsStyleInventory(paths,read=readFileSync){
 const current=new Set(paths);
 assert.equal(current.size,paths.length,'unique live StS runtime inventory');
 for(const [path,identity] of Object.entries(addedStsOwners)){
  assert(current.delete(path),'missing live StS runtime module: '+path);
  const source=read(path,'utf8');
  const prior=beforeKnownMasterBackflowSource(path,source);
  assert(exactSourceMatches(prior,identity),'fresh added StS runtime module: '+path);
  // A changed owner must supply the live master successor even if its old bytes match.
  if(prior===source)beforeMasterBackflowSource(path,source);
 }
 const selection=reviewedSelectionRead(read);
 for(const [retired,active] of Object.entries(renamedOwners)){
  assert(current.delete(active),'missing live renamed StS runtime module: '+active);
  assert(!current.has(retired),'legacy StS runtime module must stay absent: '+retired);
  selection(retired);
  current.add(retired);
 }
 return [...current].sort();
}
