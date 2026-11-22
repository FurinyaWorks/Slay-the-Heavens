// Exact Develop predecessors for historical replay. Live builds read current sources.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const archive=readFileSync(new URL('../fixtures/develop-release-backflow-source.json.gz',import.meta.url));
assert.equal(hash(archive),'c50d048f5daaa4ecc7ffa110ca9a4dc144cb4393e51fb8666c572b16347bede4','exact Develop Release-backflow source archive');
const {base,files:releaseFiles,shopBase,shop}=JSON.parse(gunzipSync(archive));
assert.equal(base,'742a540ffc999e91acdface3d8fc7f753731f0a8');
assert.equal(shopBase,'82ba375397ffd7f8f8175a7a1fd18a973450ecc6');
const travelerArchive=readFileSync(new URL('../fixtures/develop-traveler-touch-source.json.gz',import.meta.url));
assert.equal(hash(travelerArchive),'58bed3fd2bfe7a20e5e9d2b9760b5f7dd165bde92201dd49fa90e36bb17168c9','exact Develop Traveler touch source archive');
const traveler=JSON.parse(gunzipSync(travelerArchive));
assert.equal(traveler.base,shopBase);
assert.deepEqual(Object.keys(traveler.files),['src/lua/abyss_battle_detail_bindings.lua','tests/lua/traveler_power_tooltip.lua']);
for(const path of Object.keys(traveler.files))assert(!Object.hasOwn(releaseFiles,path)&&!Object.hasOwn(shop,path),'distinct Develop backflow source owner: '+path);
const eventArchive=readFileSync(new URL('../fixtures/event-projection-predecessors.json.gz',import.meta.url));
assert.equal(hash(eventArchive),'87e8e3e410ad515264f668ca53abd8fee8bf8c57b7603c10d7c60882cb9339ea','exact event projection source archive');
const eventProjection=JSON.parse(gunzipSync(eventArchive));
assert.equal(eventProjection.base,'8a59d03c26ec54360c4e6953958522dc8d2e8d07');
assert.deepEqual(Object.keys(eventProjection.files),[
 'src/lua/abyss_act2_events.lua','src/lua/abyss_act3_events.lua','src/lua/abyss_colorless_cards.lua',
]);
const backflowFiles={...releaseFiles,...traveler.files};
for(const path of Object.keys(eventProjection.files))assert(!Object.hasOwn(backflowFiles,path)&&!Object.hasOwn(shop,path),'distinct event projection source owner: '+path);
const files={...backflowFiles,...eventProjection.files};
const mapPath='src/lua/abyss_map_ui.lua';
const mapArchive=readFileSync(new URL('../fixtures/develop-map-render-source.json.gz',import.meta.url));
assert.equal(hash(mapArchive),'9d52d048c3db1818cb7f9e7fdc8cd881639e958b782593f5dae99923c26d80aa','exact Develop map render source archive');
const mapRender=JSON.parse(gunzipSync(mapArchive));
assert.equal(mapRender.base,'8a59d03c26ec54360c4e6953958522dc8d2e8d07');
assert.deepEqual(Object.keys(mapRender.files),[mapPath]);
const mapBefore=mapRender.files[mapPath].before;
assert(matches(mapBefore.source,files[mapPath].after),'map render preserves the exact Develop backflow predecessor');
const cardDisplayArchive=readFileSync(new URL('../fixtures/develop-card-display-responsibilities-source.json.gz',import.meta.url));
assert.equal(hash(cardDisplayArchive),'fafb7ec975e6ae3fa1f0629a7366a0f673bbad64668afede85267e7af0d0871c','exact Develop card-display-responsibilities predecessor archive');
const cardDisplay=JSON.parse(gunzipSync(cardDisplayArchive));
assert.equal(cardDisplay.base,'8a59d03c26ec54360c4e6953958522dc8d2e8d07');
assert.deepEqual(Object.keys(cardDisplay.files),["src/lua/abyss_watcher_flow_cards.lua"]);
for(const path of Object.keys(cardDisplay.files))assert(![mapRender.files,files,shop].some(layer=>Object.hasOwn(layer,path)),'distinct Develop cardDisplay source owner: '+path);
const displayLeafArchive=readFileSync(new URL('../fixtures/develop-card-display-leaf-source.json.gz',import.meta.url));
assert.equal(hash(displayLeafArchive),'424ee22e001dbcc5bf1256622b0dd527da3b1ca428330fbf7ce98c7fa21c943d','exact Develop card display leaf predecessor archive');
const displayLeaf=JSON.parse(gunzipSync(displayLeafArchive));
assert.equal(displayLeaf.base,'ae94d8079df3263c88281e04c9eb05847cf65066');
assert.equal(displayLeaf.head,'27b8b5509306fc106fa1528b488d3d2c5146afb8');
const warriorStatusPath='src/lua/abyss_warrior_status_cards.lua';
assert.deepEqual(Object.keys(displayLeaf.files),['src/lua/abyss_original_v4_display.lua',warriorStatusPath]);
for(const path of Object.keys(displayLeaf.files))assert(![cardDisplay.files,mapRender.files,files,shop].some(layer=>Object.hasOwn(layer,path)),'distinct Develop display leaf owner: '+path);
const portraitLifecycleArchive=readFileSync(new URL('../fixtures/develop-native-portrait-lifecycle-source.json.gz',import.meta.url));
assert.equal(hash(portraitLifecycleArchive),'1e0d7cf24e2bd08938383e862161fe5d70c9a5ae29a216a8890c1768b8c57422','exact Develop native-portrait-lifecycle predecessor archive');
const portraitLifecycle=JSON.parse(gunzipSync(portraitLifecycleArchive));
assert.equal(portraitLifecycle.base,'8a59d03c26ec54360c4e6953958522dc8d2e8d07');
assert.deepEqual(Object.keys(portraitLifecycle.files),["src/lua/abyss_traveler_portraits.lua"]);
for(const path of Object.keys(portraitLifecycle.files))assert(![cardDisplay.files,mapRender.files,files,shop].some(layer=>Object.hasOwn(layer,path)),'distinct Develop portraitLifecycle source owner: '+path);
const rewardUiArchive=readFileSync(new URL('../fixtures/develop-reward-ui-responsibilities-source.json.gz',import.meta.url));
assert.equal(hash(rewardUiArchive),'063a04ed8a26ea941887da6050376f12964baaf63ca62ac63f92a8bc62a4c207','exact Develop reward UI predecessor archive');
const rewardUi=JSON.parse(gunzipSync(rewardUiArchive));
assert.equal(rewardUi.base,'2f9444dcbd33ac71a6507db1775be5b70533e68a');
assert.equal(rewardUi.original,'c6cee6a793e32628e8f747ce6515475be4cad0b0');
const deckPath='src/lua/abyss_deck_ui.lua';
assert.deepEqual(Object.keys(rewardUi.files),[
 'src/lua/abyss_choice_ui.lua',deckPath,'src/lua/abyss_match_event_ui.lua','src/lua/abyss_treasure_ui.lua',
]);
assert(matches(rewardUi.files[deckPath].before.source,files[deckPath].after),'reward UI preserves the exact Forethought deck predecessor');
for(const path of Object.keys(rewardUi.files)){
 const inherited=[portraitLifecycle.files,cardDisplay.files,mapRender.files,shop,...(path===deckPath?[]:[files])];
 assert(!inherited.some(layer=>Object.hasOwn(layer,path)),'distinct Develop reward UI source owner: '+path);
}
const feedbackPath='src/lua/abyss_feedback.lua';
const feedbackArchive=readFileSync(new URL('../fixtures/develop-battle-feedback-responsibilities-source.json.gz',import.meta.url));
assert.equal(hash(feedbackArchive),'c8432495ff7b795025f12f0f931d55e6409505b6347fbbddc46701555f80e791','exact Develop battle-feedback-responsibilities predecessor archive');
const battleFeedback=JSON.parse(gunzipSync(feedbackArchive));
assert.equal(battleFeedback.base,'2f9444dcbd33ac71a6507db1775be5b70533e68a');
assert.equal(battleFeedback.source,'254960fb39b085d72a75fccaa72fc9e393961fd3');
assert.deepEqual(Object.keys(battleFeedback.files),[feedbackPath]);
assert(matches(battleFeedback.files[feedbackPath].before.source,files[feedbackPath].after),'battle feedback preserves the exact Develop backflow predecessor');
assert(matches(battleFeedback.frozenAfter.source,battleFeedback.frozenAfter),'frozen branch feedback identity');
export const developBattleFeedback=Object.freeze({before:battleFeedback.files[feedbackPath].before.source,frozenAfter:battleFeedback.frozenAfter.source});
const stasisArchive=readFileSync(new URL('../fixtures/develop-stasis-upgrade-boundary-source.json.gz',import.meta.url));
assert.equal(hash(stasisArchive),'04dd257d8cdd059a629082e1e3cf39c89f636dc8b2376c3c30286baae23065de','exact Develop Stasis upgrade predecessor archive');
const stasis=JSON.parse(gunzipSync(stasisArchive));
assert.equal(stasis.base,'3d4283eeded352ff1aebd9f897933c2e095e2b02');
assert.equal(stasis.original,'c6f85876205c90b0c6a4125f98a4188a8ebd287b');
assert.deepEqual(Object.keys(stasis.files),['config/architecture.json','src/lua/abyss_act2_stasis.lua','src/lua/abyss_combat.lua',warriorStatusPath]);
assert(matches(stasis.files[warriorStatusPath].before.source,displayLeaf.files[warriorStatusPath].after),'Stasis follows the exact Warrior status display predecessor');
export const stasisUpgradeAddedPaths=Object.freeze(['src/lua/abyss_blood_for_blood_cost.lua','src/lua/abyss_card_upgrade.lua']);
assert.deepEqual(Object.keys(stasis.added),stasisUpgradeAddedPaths);
const stasisCurrent={...Object.fromEntries(Object.entries(stasis.files).map(([path,row])=>[path,row.after])),...stasis.added};
const layers=[stasis.files,battleFeedback.files,rewardUi.files,portraitLifecycle.files,displayLeaf.files,cardDisplay.files,mapRender.files,files,shop];
for(const {before,after} of layers.flatMap(layer=>Object.values(layer))){
 assert.equal(hash(before.source),before.sha256);
 assert.equal(blob(before.source),before.gitBlob);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
for(const after of Object.values(stasis.added)){
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
const current=path=>layers.find(layer=>Object.hasOwn(layer,path))?.[path];
export const developBackflowOwns=path=>current(path)!==undefined;
function matches(source,expected){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const lf=source.replaceAll('\r\n','\n');
 return hash(lf)===expected.sha256&&blob(lf)===expected.gitBlob;
}
export function assertDevelopBackflowCurrent(path,source){
 assert(matches(source,current(path).after),'fresh current production owner: '+path);
}
export function assertStasisUpgradeAdded(path,source){
 assert(Object.hasOwn(stasis.added,path)&&matches(source,stasis.added[path]),'fresh Stasis upgrade module: '+path);
}
function predecessor(layer,path,source){
 if(!Object.hasOwn(layer,path)||!matches(source,layer[path].after))return source;
 const before=layer[path].before.source;
 return source.includes('\r\n')?before.replaceAll('\n','\r\n'):before;
}
export function beforeDevelopBackflow(path,source){
 return layers.reduce((prior,layer)=>predecessor(layer,path,prior),source);
}
const forethoughtOwners=[deckPath,'scripts/deck-ui-layout.mjs'];
export function authenticateDevelopBackflow(path,source,read){
 const prior=beforeDevelopBackflow(path,source);
 if(prior===source)return source;
 const row=layers.find(layer=>Object.hasOwn(layer,path)&&matches(source,layer[path].after))[path];
 const stasisOwner=Object.hasOwn(stasis.files,path)&&row===stasis.files[path];
 const owners=stasisOwner?Object.keys(stasisCurrent):forethoughtOwners.includes(path)?forethoughtOwners:[path];
 for(const owner of owners){
  let live;
  try{live=read(owner);}catch(error){assert.fail('combined linked owner missing: '+owner+': '+String(error?.message??error));}
  const expected=stasisOwner?stasisCurrent[owner]:(owner===path?row:current(owner)).after;
  assert(matches(live,expected),'combined linked owner identity: '+owner+' changed during Develop backflow validation');
 }
 return prior;
}
