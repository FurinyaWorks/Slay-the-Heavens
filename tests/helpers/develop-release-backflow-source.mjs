import {beforeCardReadingScope,beforeChapterBattleScene,beforeResponsiveHand,chapterBattleSceneReader} from './chapter-battle-scene-source.mjs';
import { beforeUiEntrance, entranceInventory, entrancePredecessor, entranceReader, underlyingEntranceReader, uiEntranceOwns, assertCurrentUiEntrance } from './ui-entrance-source.mjs';
import {battlePeripheryPredecessor,beforeBattlePeriphery} from './battle-periphery-source.mjs';
// Exact Develop predecessors for historical replay. Live builds read current sources.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceMatches as matches,sourceConfigLayoutMatches} from './source-fingerprint.mjs';
import {authenticateInputRetirement,beforeInputRetirement,beforeInputRetirementReader,inputRetirementOwns,isCurrentInputRetirementSource,beforeCombatEvents,combatEventsOwns,beforeDevelopUiBackflows,assertPointerInputSource,pointerInputPath,retiredControllerPath,readRetiredController} from './input-retirement-source.mjs';
import {assertRelicDetailCurrent,authenticateRelicDetail,beforeRelicDetail,relicDetailOwns} from './relic-detail-source.mjs';
import {beforeNativeFlowFixture} from './native-flow-fixture-source.mjs';
import {authenticateActionButtons,beforeActionButtons,actionButtonsOwns} from './action-buttons-source.mjs';
import {beforeNodeNoticeSource} from './reward-current-source.mjs';
import {beforeKnownMasterBackflowSource,beforeProductionReadingBackflow} from './master-backflow-source.mjs';
import {beforeReleaseVocabulary,isReleaseVocabularyPredecessor,releaseVocabularyOwns} from './develop-release-vocabulary-source.mjs';
import {beforeRunHudDeckLabel} from './run-hud-successors.mjs';
import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';
import {beforeReleaseEntranceOwner,readReleaseEntrancePredecessor} from './release-entrance-owner-source.mjs';
import {hasReviewedStsStyleModules,reviewedStsStyleInventory,reviewedStsStyleRead} from './reviewed-selection-current-source.mjs';

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
const actorFocusArchive=readFileSync(new URL('../fixtures/develop-actor-focus-source.json.gz',import.meta.url));
assert.equal(hash(actorFocusArchive),'2dd9f47a776d59d6cfc4ce544f8e0783f133cfda4f78f489b25b983b53315688','exact Develop Actor/Focus source archive');
const actorFocus=JSON.parse(gunzipSync(actorFocusArchive));
assert.equal(actorFocus.base,'62943964d4ff1cd152bd28c0fbc8df98df9d054d');
assert.equal(actorFocus.source,'926f29bf29db13580b470b64a571db87eced50ad');
const architecturePath='config/architecture.json';
assert.deepEqual(Object.keys(actorFocus.files),[
 architecturePath,'src/lua/abyss_actor.lua','src/lua/abyss_focus.lua','src/lua/abyss_stances.lua',
]);
export const actorFocusAdded=Object.freeze(Object.keys(actorFocus.added));
assert.deepEqual(actorFocusAdded,['src/lua/abyss_actor_artifact.lua','src/lua/abyss_stance_damage.lua']);
assert.equal(actorFocus.luaBefore.length,354);
assert.equal(new Set(actorFocus.luaBefore).size,actorFocus.luaBefore.length);
assert(actorFocusAdded.every(path=>!actorFocus.luaBefore.includes(path)),'no invented Actor/Focus predecessor');
const actorFocusOwners=[...Object.keys(actorFocus.files),...actorFocusAdded];
const priorLayers=[stasis.files,battleFeedback.files,rewardUi.files,portraitLifecycle.files,displayLeaf.files,cardDisplay.files,mapRender.files,files,shop];
assert(matches(actorFocus.files[architecturePath].before.source,stasis.files[architecturePath].after),'Actor policy follows the exact Stasis predecessor');
assert(stasisUpgradeAddedPaths.every(path=>actorFocus.luaBefore.includes(path)),'Actor preserves the admitted Stasis modules');
for(const path of actorFocusOwners.filter(path=>path!==architecturePath)){
 assert(!priorLayers.some(layer=>Object.hasOwn(layer,path))&&!Object.hasOwn(stasis.added,path),'distinct Develop Actor/Focus source owner: '+path);
}
const pileOpenArchive=readFileSync(new URL('../fixtures/develop-combat-pile-opening-source.json.gz',import.meta.url));
assert.equal(hash(pileOpenArchive),'a9e96c6caa44e21e45493a63385bf315ba9eaaf9a30257533bc46ccf9e51f9e6','exact Develop combat pile opening predecessor archive');
const pileOpen=JSON.parse(gunzipSync(pileOpenArchive));
assert.equal(pileOpen.base,'19d4be4d9af4bf42635a224a118fc99898ea7898');
assert.deepEqual(Object.keys(pileOpen.files),['src/lua/abyss_card_skin.lua',deckPath]);
assert(matches(pileOpen.files[deckPath].before.source,rewardUi.files[deckPath].after),'combat pile opening follows the exact reward UI predecessor');
const layers=[pileOpen.files,actorFocus.files,...priorLayers];
const sessionRelicArchive=readFileSync(new URL('../fixtures/develop-session-relic-source.json.gz',import.meta.url));
assert.equal(hash(sessionRelicArchive),'3597ea919d88cd07f5e4e8f2c8918c0558f613f6a3fd3d6fda3a08469276db05','exact Develop session relic predecessor archive');
const sessionRelic=JSON.parse(gunzipSync(sessionRelicArchive));
assert.equal(sessionRelic.base,'434a361696cf08b7e5425cedf591eacc41147699');
assert.equal(sessionRelic.original,'39238fa52173bb45dea36a2329fa038f38921e26');
assert.deepEqual(Object.keys(sessionRelic.files),[
 'config/architecture.json',
 'src/lua/abyss_battle_ui.lua',
 'src/lua/abyss_boss_relics.lua',
 'src/lua/abyss_node_ui.lua',
 'src/lua/abyss_relic_card_rewards.lua',
 'src/lua/abyss_relic_choices.lua',
 'src/lua/abyss_relic_hooks.lua',
 'src/lua/abyss_relic_pending.lua',
 'src/lua/abyss_relic_pending_ui.lua',
 'src/lua/abyss_run.lua',
 'src/lua/abyss_run_settlement.lua',
 'src/lua/abyss_shop_relics.lua',
 'src/lua/abyss_uncommon_relics.lua',
 'tests/helpers/combined-epoch/source-epoch-runtime.mjs',
]);
for(const [path,row] of Object.entries(sessionRelic.files)){
 const prior=layers.find(layer=>Object.hasOwn(layer,path))?.[path];
 if(prior)assert(matches(row.before.source,prior.after),'exact session relic predecessor: '+path);
}
for(const {before,after} of [sessionRelic.files,...layers].flatMap(layer=>Object.values(layer))){
 assert.equal(hash(before.source),before.sha256);
 assert.equal(blob(before.source),before.gitBlob);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
for(const after of [...Object.values(stasis.added),...Object.values(actorFocus.added).map(row=>row.after)]){
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
const priorCurrent=path=>layers.find(layer=>Object.hasOwn(layer,path))?.[path]??
 (Object.hasOwn(actorFocus.added,path)?actorFocus.added[path]:undefined);
const current=path=>Object.hasOwn(sessionRelic.files,path)?sessionRelic.files[path]:priorCurrent(path);
const priorDevelopBackflowOwns=path=>relicDetailOwns(path)||current(path)!==undefined;
const roomEntryArchive=readFileSync(new URL('../fixtures/develop-map-room-entry-source.json.gz',import.meta.url));
assert.equal(hash(roomEntryArchive),'bff89df36b2fbbf1bec727dae075c632dba48d50c6c8c75b8e3f271d7600c160','exact Develop map-room predecessor archive');
const roomEntry=JSON.parse(gunzipSync(roomEntryArchive));
assert.equal(roomEntry.base,'d7ae494a3136b2f4f707428fefeeae478c6e0495');
const mapRoomBackflowOwns=path=>Object.hasOwn(roomEntry.files,path);
for(const [path,{before,after}] of Object.entries(roomEntry.files)){
 assert(priorDevelopBackflowOwns(path)||/^src\/lua\/abyss_[a-z0-9_]+\.lua$/.test(path),'map-room replay owner: '+path);
 assert(matches(before.source,before),'exact Develop map-room predecessor: '+path);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
const battleActionsPath='src/lua/abyss_battle_actions.lua';
const battleActionsArchive=readFileSync(new URL('../fixtures/map-room-battle-actions-source.json.gz',import.meta.url));
assert.equal(hash(battleActionsArchive),'45918da82006880941ab23f10ccc49b7fe11fc2c7978b4f1508f923216e142ec','exact production battle actions continuation');
const battleActionsReplay=JSON.parse(gunzipSync(battleActionsArchive));
assert.equal(battleActionsReplay.schemaVersion,1);
assert.equal(battleActionsReplay.path,battleActionsPath);
const battleActionsTransitions=battleActionsReplay.transitions;
assert.deepEqual(battleActionsTransitions.map(row=>[row.beforeCommit,row.afterCommit]),[
 ['b2f74d99a3d80e60b99165b6380987cda8b4488d','77b7e87ac5abc9ef5c4953cfd47b5d77408e55d2'],
 ['7348ab8598c8607712d525bd732239f89bb52830','b2f74d99a3d80e60b99165b6380987cda8b4488d'],
 ['559980dd45bc5310c449417a7a48a99a8e6562d2','a111076f1afa0093fbc8e916f5cbd2ee68c7a79b'],
]);
for(const [index,{before,after}] of battleActionsTransitions.entries()){
 assert(matches(before.source,before),'exact Battle Actions predecessor');
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
 if(index>0)assert(matches(battleActionsTransitions[index-1].before.source,after),'continuous Battle Actions source history');
}
const beforeBattleActionsRelease=battleActionsTransitions.at(-1).before.source;
assert(matches(beforeInputRetirement(battleActionsPath,beforeBattleActionsRelease),roomEntry.files[battleActionsPath].after),
 'battle actions history reaches the exact Map Room owner');
function beforeMapRoomBattleActions(path,source){
 if(path!==battleActionsPath)return source;
 const previous=beforeKnownMasterBackflowSource(path,source);
 if(!matches(previous,battleActionsTransitions[0].after))return source;
 source=previous;
 const lf=source.replaceAll('\r\n','\n');
 if(source===lf)return beforeBattleActionsRelease;
 return source===lf.replaceAll('\n','\r\n')?beforeBattleActionsRelease.replaceAll('\n','\r\n'):source;
}
function uniformSource(source){
 if(typeof source!=='string')return false;
 const lf=source.replaceAll('\r\n','\n');
 return !lf.includes('\r')&&(source===lf||source===lf.replaceAll('\n','\r\n'));
}
const libraryEventPath='src/lua/abyss_library_event.lua';
const libraryPromptCurrent={
 sha256:'80d89b7d2a6687a0b1b172c1b83ea87e0cce48fb9974e49c82033c53f7488e07',gitBlob:'2fc96fad0d269fd25ad149d9c37ae0032499d6e4',
};
const libraryPromptBefore={
 sha256:'10d0f6970d478ca4adb58cd287dfe5d17e8d779138bfea72ce413f3b5aa79c4b',gitBlob:'1096b5dc00ab4dd6d6f000c67c52c0696db7d79b',
};
function beforeLibraryReadPrompt(path,source){
 if(path!==libraryEventPath||!uniformSource(source)||!matches(source,libraryPromptCurrent))return source;
 const prior=source.replace('请选择一张卡牌加入牌组，不能跳过。','请选择一张卡牌加入牌组。');
 assert(matches(prior,libraryPromptBefore),'exact frozen Library read prompt predecessor');
 return prior;
}
const battleInputArchive=readFileSync(new URL('../fixtures/develop-battle-input-source.json.gz',import.meta.url));
assert.equal(hash(battleInputArchive),'ee0eeaf23242e8307a2b4f06a27319d89477c5d19d7507eddc54477dc878611e','exact battle input history');
const battleInputHistory=JSON.parse(gunzipSync(battleInputArchive));
const gesturesPath='src/lua/abyss_battle_card_gestures.lua';
const cardLayoutPath='src/lua/abyss_battle_card_layout.lua';
const cardViewPath='src/lua/abyss_battle_card_view.lua';
assert.deepEqual(Object.keys(battleInputHistory),[gesturesPath,cardLayoutPath,cardViewPath]);
assert.deepEqual(battleInputHistory[gesturesPath].map(row=>row.commit),[
 '392fae8d8dee2bd57829dda0e8da836f45107398','a111076f1afa0093fbc8e916f5cbd2ee68c7a79b',
 'd723d57dcaf5d11447a3fdbd21c5bbee0c6a009b','44d1fd3148e7bbf472adc8110fceb06eeb0f041a',
 'e483c6a191dc8dd7622e0cb137e7b8581b171af8',
]);
for(const path of [cardLayoutPath,cardViewPath])
 assert.deepEqual(battleInputHistory[path].map(row=>row.commit),[
  '8d76bc4d22ecc147fb82d99454e56f2466762f58','d723d57dcaf5d11447a3fdbd21c5bbee0c6a009b',
  "e483c6a191dc8dd7622e0cb137e7b8581b171af8",
 ]);
for(const states of Object.values(battleInputHistory))
 for(const row of states)assert(matches(row.source,row),'exact published battle input source');
assert(isCurrentInputRetirementSource(gesturesPath,battleInputHistory[gesturesPath][0].source),'exact raw gesture input retirement owner');
function beforeBattleInputHistory(path,source){
 if(!Object.hasOwn(battleInputHistory,path)||!uniformSource(source))return source;
 const masterPrior=beforeCardReadingScope(path,beforeKnownMasterBackflowSource(path,source));
 const states=battleInputHistory[path];
 if(!matches(masterPrior,states.at(-1)))return source;
 const prior=states[0].source;
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
const linkedArchive=readFileSync(new URL('../fixtures/develop-linked-backflow-source.json.gz',import.meta.url));
assert.equal(hash(linkedArchive),'7f803c657102e0f9a804ca68117af34f1067d32eabbc3b5fc0c99752b590d522','exact joined backflow owners');
const {source:linkedSource,files:linkedBackflow}=JSON.parse(gunzipSync(linkedArchive));
assert.equal(linkedSource,'61a486ad8fe6c5cc407c41ba5dec003febff7ead');
assert.equal(Object.keys(linkedBackflow).length,11);
for(const [path,{before,after}] of Object.entries(linkedBackflow)){
 assert.equal(after.commit,linkedSource,'exact reviewed joined owner: '+path);
 assert(matches(before.source,before),'exact joined owner predecessor: '+path);
}
const linkedSuccessors={
 'src/lua/abyss_game_ui_navigation.lua':{sha256:'89c0b1d90b00e97ca6bfaa5cffc13c7317064017e86da285d6792e56e726d477',
  gitBlob:'a98e73313e33629917ca535933d35a79d91a287f'},
 'src/lua/abyss_battle_detail_bindings.lua':{sha256:'fc3e819c62455d966db30172055d2c3b4aa721daed943418519252fd38ad1852',
  gitBlob:'951d6e972052ed08a0638140b156ee2ffaea5166'},
};
const battleUiPath='src/lua/abyss_battle_ui.lua';
function beforeLinkedBackflow(path,source){
 if(!Object.hasOwn(linkedBackflow,path)||!uniformSource(source))return source;
 const {before,after}=linkedBackflow[path];
 const readingSuccessor=path===battleUiPath&&beforeProductionReadingBackflow(path,source)!==source;
 if(!readingSuccessor&&!matches(source,after)&&!matches(source,linkedSuccessors[path]??after))return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}
const architectureOwnersArchive=readFileSync(new URL('../fixtures/develop-architecture-linked-source.json.gz',import.meta.url));
assert.equal(hash(architectureOwnersArchive),'4e8500c1232bc5bcd5c19d08dbed21cea262be94a30f3a2e8195eeb04ebde859','exact reviewed linked architecture owners');
const {source:architectureOwnersCommit,files:architectureOwners}=JSON.parse(gunzipSync(architectureOwnersArchive));
assert.equal(architectureOwnersCommit,linkedSource);
assert.equal(Object.keys(architectureOwners).length,38);
for(const [path,{before,after}] of Object.entries(architectureOwners)){
 assert.equal(before.commit,'c420b02841c61d5270fd8588d072fc62ec9a5071','fixed linked owner source');
 assert.equal(after.commit,architectureOwnersCommit,'exact reviewed joined owner: '+path);
 assert(matches(before.source,before),'exact linked architecture predecessor: '+path);
}
// The restored compact actor detail panel updates three linked architecture owners.
const architectureSuccessors={
 'src/lua/abyss_battle_details.lua':{sha256:'eda327547a5399714320309d5cda22ed264123a8747ec5827ec9ee1a42409aab',
  gitBlob:'53a076d7a7c0958b02a968ca5125d3f65c744a2c'},
 'src/lua/abyss_battle_info_content.lua':{sha256:'e5be45b603c6a38f863d7589c9553ebb52a6c3ec9ab1be6d436cf7fceb1b409b',
  gitBlob:'57a59fac16323440d756b6ed771ef4d87207167d'},
 'src/lua/abyss_battle_info_view.lua':{sha256:'310fb87f002004b8bdbc8fc1b269b8dc1cbb6ecf0cf03256840fbdaed0d756ff',
  gitBlob:'7a24b24c0d1ccaa246bbb17afbf1cb4f0ce555dd'},
};
function beforeArchitectureOwner(path,source){
 if(!Object.hasOwn(architectureOwners,path)||!uniformSource(source))return source;
 const {before,after}=architectureOwners[path];
 if(!matches(source,after)&&!matches(source,architectureSuccessors[path]??after))return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}
const deckPagesArchive=readFileSync(new URL('../fixtures/develop-deck-pages-source.json.gz',import.meta.url));
assert.equal(hash(deckPagesArchive),'d3a6b845870da64358c3ca36307062c02cc39d2e070e21eb875f9e2e42d02036','exact Develop deck-pages predecessor archive');
const deckPages=JSON.parse(gunzipSync(deckPagesArchive));
assert.equal(deckPages.base,'00229683d0d38660c98ced2f4a41e89d84fc5e4e');
for(const [path,{before,after}] of Object.entries(deckPages.files)){
 assert(matches(before.source,before),'exact deck-pages predecessor: '+path);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
export const deckPagesAdded=Object.freeze(Object.keys(deckPages.added));
function deckPagesPrior(path,source){return predecessor(deckPages.files,path,source);}
const deckLayoutPath='scripts/deck-ui-layout.mjs';
export function beforeDeckPages(path,source,options){
 source=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,source)));
 return deckPagesPrior(path,beforeInputRetirement(path,beforeCombatEvents(path,beforeActionButtons(path,beforeDevelopUiBackflows(path,source))),options));
}
const deckPagesOwns=path=>Object.hasOwn(deckPages.files,path);
const productionOwner=path=>path===architecturePath||path.startsWith('src/lua/');
const recentBackflowOwns=path=>mapRoomBackflowOwns(path)||deckPagesOwns(path)||(productionOwner(path)&&inputRetirementOwns(path));
export const developBackflowOwns=path=>path===libraryEventPath||(productionOwner(path)&&combatEventsOwns(path))||actionButtonsOwns(path)||recentBackflowOwns(path)||priorDevelopBackflowOwns(path);
const matchEventRepairPath='src/lua/abyss_match_event_ui.lua';
const beforeMatchEventRepair=(path,source)=>path===matchEventRepairPath?beforeNativeFlowFixture(path,source):source;

function currentRecentBackflowOwner(path,source){
 if(inputRetirementOwns(path))return isCurrentInputRetirementSource(path,source);
 source=beforeActionButtons(path,beforeDevelopUiBackflows(path,source));
 if(deckPagesOwns(path))return matches(source,deckPages.files[path].after);
 return matches(source,roomEntry.files[path].after);
}
export function assertDevelopBackflowCurrent(path,source){
 if(path===deckPath)source=beforeReleaseDeckPointer(path,source);
 if(path===libraryEventPath){
  assert(uniformSource(source)&&matches(source,libraryPromptCurrent),'fresh current production owner: '+path);
  return;
 }
 if(actorFocusOwners.includes(path))source=beforeVocabularyOwner(path,source);
 source=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,source)));
 source=beforeUiEntrance(path,beforeBattlePeriphery(path,beforeChapterBattleScene(path,source)));
 source=beforeDevelopUiBackflows(path,source);
 const priorActions=beforeActionButtons(path,source);
 if(actionButtonsOwns(path)&&!recentBackflowOwns(path)&&!priorDevelopBackflowOwns(path)){
  assert.notEqual(priorActions,source,'fresh current production owner: '+path);
  return;
 }
 source=priorActions;
 if(combatEventsOwns(path)){
  const priorEvents=beforeCombatEvents(path,source);
  assert.notEqual(priorEvents,source,'fresh current production owner: '+path);
  if(!recentBackflowOwns(path)&&!priorDevelopBackflowOwns(path))return;
  source=priorEvents;
 }
 source=beforeMatchEventRepair(path,source);
 if(recentBackflowOwns(path)){
  assert(currentRecentBackflowOwner(path,source),'fresh current production owner: '+path);
  if(!priorDevelopBackflowOwns(path))return;
  source=predecessor(roomEntry.files,path,beforeDeckPages(path,source));
 }
 if(relicDetailOwns(path)){
  assertRelicDetailCurrent(path,source);
  return;
 }
 assert(matches(source,current(path).after),'fresh current production owner: '+path);
}
export function assertStasisUpgradeAdded(path,source){
 assert(Object.hasOwn(stasis.added,path)&&matches(source,stasis.added[path]),'fresh Stasis upgrade module: '+path);
}
export function assertActorFocusInventory(paths,read=path=>readFileSync(path,'utf8')){
 const inventoryError='complete current Actor/Focus Lua module inventory';
 assert.equal(new Set(paths).size,paths.length,inventoryError);
 const releaseInventory=hasReviewedStsStyleModules(paths);
 const readDeck=releaseInventory?reviewedStsStyleRead(read):read;
 if(releaseInventory)paths=reviewedStsStyleInventory(paths,read);
 paths=entranceInventory(paths,read);
 const expected=[...actorFocus.luaBefore,...actorFocusAdded,...deckPagesAdded];
 assert(expected.includes(retiredControllerPath),'exact controller predecessor in Actor/Focus Lua inventory');
 assert.deepEqual([...paths].sort(),[...expected.filter(path=>path!==retiredControllerPath),pointerInputPath].sort(),inventoryError);
 assertPointerInputSource(read(pointerInputPath));
 for(const path of deckPagesAdded){
  const source=readDeck(path);
  assertDevelopBackflowCurrent(path,source);
  assert(matches(beforeInputRetirement(path,source),deckPages.added[path]),'fresh deck browser module: '+path);
 }
 for(const path of actorFocusOwners)assertDevelopBackflowCurrent(path,read(path));
 for(const path of stasisUpgradeAddedPaths)assertStasisUpgradeAdded(path,read(path));
}
function predecessor(layer,path,source){
 if(!Object.hasOwn(layer,path)||!matches(source,layer[path].after))return source;
 const before=layer[path].before.source;
 return source.includes('\r\n')?before.replaceAll('\n','\r\n'):before;
}
function mapRoomOwnerError(path){
 return 'combined linked owner identity: '+path+' changed during Develop backflow validation (map-room validation)';
}
const chapterEntranceOwners=new Set([architecturePath,'src/lua/abyss_game_ui.lua','src/lua/abyss_game_ui_view.lua']);
const nodeNoticeOwner='src/lua/abyss_node_ui.lua';
const checkedEntranceNodeNotice={
 sha256:'d7710594ad15e1f00cb07af952c8b4d2d57cd7b7f1fc5ed0627a954efdba813c',
 gitBlob:'f5766cf4a6a2a14e44cb40e61dff7d9ee76aa04a',
};
export function beforeChapterEntranceOwner(path,source){
 if(!chapterEntranceOwners.has(path)||!uniformSource(source))return source;
 return beforeChapterBattleScene(path,beforeKnownMasterBackflowSource(path,source));
}
function beforeVocabularyOwner(path,source){
 if(!releaseVocabularyOwns(path))return source;
 return beforeReleaseVocabulary(path,beforeKnownMasterBackflowSource(path,source));
}
export function beforeCurrentDeckEntranceOwner(path,source){
 if(path===deckPath)source=beforeReleaseDeckPointer(path,source);
 if(!uiEntranceOwns(path)||!uniformSource(source))return source;
 if(chapterEntranceOwners.has(path))return beforeChapterEntranceOwner(path,source);
 try{assertCurrentUiEntrance(path,source);return source;}
 catch(error){if(error?.code!=='ERR_ASSERTION')throw error;}
 return beforeKnownMasterBackflowSource(path,source);
}
function recentBackflowOwnerReader(read,historicalOwners){
 let epoch;
 const readEntrancePrior=entranceReader(path=>{
  const raw=readReleaseEntrancePredecessor(path,read(path),underlyingEntranceReader(read));
  const source=beforeArchitectureOwner(path,path===deckLayoutPath?beforeRunHudDeckLabel(raw):
   path===deckPath?beforeReleaseDeckPointer(path,raw):raw);
  const vocabulary=releaseVocabularyOwns(path);
  if(!uiEntranceOwns(path)&&!vocabulary&&path!==battleActionsPath&&!Object.hasOwn(battleInputHistory,path)&&!Object.hasOwn(linkedBackflow,path))return source;
  const frozen=historicalOwners?.[path]?.source;
  if(typeof frozen==='string'&&(source===frozen||source===frozen.replaceAll('\n','\r\n')))return source;
  if(Object.hasOwn(linkedBackflow,path))return beforeLinkedBackflow(path,source);
  if(Object.hasOwn(battleInputHistory,path))return beforeBattleInputHistory(path,source);
  if(path===battleActionsPath){
   const prior=beforeMapRoomBattleActions(path,source);
   // Selection has already bound this exact linked Map Room predecessor.
   assert(prior!==source||(uniformSource(source)&&matches(source,battleActionsTransitions.at(-1).before)),mapRoomOwnerError(path));
   return prior;
  }
  if(path===nodeNoticeOwner){
   if(uniformSource(source)&&matches(source,checkedEntranceNodeNotice))return source;
   const productionPrior=beforeCurrentDeckEntranceOwner(path,source);
   if(productionPrior!==source||beforeUiEntrance(path,source)!==source)return productionPrior;
   return beforeNodeNoticeSource(path,source);
  }
  if(vocabulary){
   // Selection authenticates these complete predecessors before the older replay.
   if(uniformSource(source)&&isReleaseVocabularyPredecessor(path,source))return source;
   const prior=beforeVocabularyOwner(path,source);
   assert.notEqual(prior,source,'combined linked owner identity: '+path+' changed during Develop backflow validation');
   return prior;
  }
  if(!chapterEntranceOwners.has(path)){
   // A receipt already admitted by the entrance inverse keeps its live owner.
   // Other owners use only the exact production backflow predecessor.
   return beforeCurrentDeckEntranceOwner(path,source);
  }
  // The complete entrance cohort consumes the authenticated post-chapter predecessors.
  const prior=beforeChapterEntranceOwner(path,source);
  const stage=path===architecturePath?'Develop backflow validation (deck-pages validation)':'entrance validation';
  assert(prior!==source||beforeUiEntrance(path,source)!==source||currentRecentBackflowOwner(path,source),'combined linked owner identity: '+path+' changed during '+stage);
  return prior;
 });
 return path=>{
  // A frozen cohort must expose its original Controller identity or absence.
  const controller=path===retiredControllerPath&&(!historicalOwners||epoch==='current')?readRetiredController(read):undefined;
  let source=controller?controller.source:readEntrancePrior(path);
  if(!recentBackflowOwns(path))return source;
  let current=(!controller||controller.restored)&&currentRecentBackflowOwner(path,source);
  if(!current&&!controller&&uniformSource(source)){
   const prior=beforeBattlePeriphery(path,beforeChapterBattleScene(path,beforeKnownMasterBackflowSource(path,source)));
   if(currentRecentBackflowOwner(path,prior)){source=prior;current=true;}
  }
  const binding=historicalOwners&&Object.hasOwn(historicalOwners,path)?historicalOwners[path]:undefined;
  const exactHistorical=binding===null?source==null:
   binding&&typeof source==='string'&&source.replaceAll('\r\n','\n')===binding.source;
  const observed=current?'current':exactHistorical?'historical':undefined;
  const stage=mapRoomBackflowOwns(path)?'map-room':deckPagesOwns(path)?'deck-pages':'input retirement';
  assert(observed&&(!epoch||epoch===observed),
   'combined linked owner identity: '+path+' changed during Develop backflow validation ('+stage+' validation)');
  epoch=observed;
  return source;
 };
}
export function bindDevelopBackflow(read,historicalOwners){
 const readOwner=recentBackflowOwnerReader(read,historicalOwners);
 return {
  readOwner,
  authenticate(path,source,options){
   source=beforeArchitectureOwner(path,source);
   const chapter=beforeChapterEntranceOwner(path,source);
   if(chapter!==source)source=beforeUiEntrance(path,chapter);
   const current=beforeLinkedBackflow(path,beforeBattleInputHistory(path,beforeMapRoomBattleActions(path,beforeVocabularyOwner(path,source))));
   // The chapter reader authenticates a responsive source against raw owners
   // before the linked Develop reader enters its older source epoch.
   const releaseDeck=path===deckPath&&beforeReleaseDeckPointer(path,current)!==current;
   const readLive=releaseDeck||beforeResponsiveHand(path,current)!==current?read:readOwner;
   return authenticateDevelopBackflowWithReaders(path,current,readLive,readOwner,options);
  },
 };
}
function beforePriorLayers(path,source){
 return layers.reduce((prior,layer)=>predecessor(layer,path,prior),source);
}
function beforePriorDevelopBackflow(path,source){
 return beforePriorLayers(path,beforeVocabularyOwner(path,beforeMatchEventRepair(path,source)));
}
const forethoughtOwners=[deckPath,'scripts/deck-ui-layout.mjs'];
const pileOpenOwners=[...forethoughtOwners,'src/lua/abyss_card_skin.lua'];
function authenticatePriorDevelopBackflow(path,source,read){
 const repaired=beforeMatchEventRepair(path,source);
 const matchSuccessor=repaired!==source;
 const vocabularyPrior=beforeVocabularyOwner(path,repaired);
 const prior=beforePriorLayers(path,vocabularyPrior);
 const vocabularySuccessor=vocabularyPrior!==repaired;
 const checkVocabulary=live=>{
  assert(uniformSource(live)&&live.replaceAll('\r\n','\n')===repaired.replaceAll('\r\n','\n'),
   'combined linked owner identity: '+path+' changed during Develop vocabulary validation');
  return beforeVocabularyOwner(path,live);
 };
 if(prior===vocabularyPrior){
  if(vocabularySuccessor)checkVocabulary(beforeMatchEventRepair(path,readBackflowOwner(read,path)));
  return vocabularyPrior;
 }
 const row=layers.find(layer=>Object.hasOwn(layer,path)&&matches(vocabularyPrior,layer[path].after))[path];
 const actorOwner=Object.hasOwn(actorFocus.files,path)&&row===actorFocus.files[path];
 const stasisOwner=Object.hasOwn(stasis.files,path)&&(row===stasis.files[path]||(actorOwner&&path===architecturePath));
 const pileOwner=row===pileOpen.files[path];
 const owners=actorOwner?actorFocusOwners:pileOwner?pileOpenOwners:forethoughtOwners.includes(path)?forethoughtOwners:[path];
 const linkedOwners=stasisOwner?new Set([...owners,...Object.keys(stasisCurrent)]):owners;
 for(const owner of linkedOwners){
  let live;
  try{live=read(owner);}catch(error){assert.fail('combined linked owner missing: '+owner+': '+String(error?.message??error));}
  if(owner===matchEventRepairPath){
   const repairedLive=beforeMatchEventRepair(owner,live);
   assert(matchSuccessor===(repairedLive!==live),'combined linked owner identity: '+owner+' changed during Match repair validation');
   live=repairedLive;
  }
  if(owner===path&&vocabularySuccessor)live=checkVocabulary(live);
  const expected=owner===path?row.after:stasisOwner?(priorCurrent(owner)?.after??stasisCurrent[owner]):priorCurrent(owner).after;
  assert(matches(live,expected),'combined linked owner identity: '+owner+' changed during Develop backflow validation');
 }
 return prior;
}

export {configSourceTokens} from './source-fingerprint.mjs';
export function isSessionRelicSuccessor(path,source,{allowConfigLayout=false}={}){
 if(!Object.hasOwn(sessionRelic.files,path))return false;
 source=predecessor(roomEntry.files,path,beforeDeckPages(path,source,{allowConfigLayout}));
 const expected=sessionRelic.files[path].after;
 if(matches(source,expected))return true;
 return allowConfigLayout&&sourceConfigLayoutMatches(source,expected.tokensSha256);
}
function beforeSessionRelic(path,source,options){
 if(!isSessionRelicSuccessor(path,source,options))return source;
 const before=sessionRelic.files[path].before.source;
 return source.includes('\r\n')?before.replaceAll('\n','\r\n'):before;
}
export function beforeDevelopBackflow(path,source,options){
 if(path===deckPath)source=beforeReleaseDeckPointer(path,source);
 source=beforeReleaseEntranceOwner(path,source);
 if(actorFocusOwners.includes(path))source=beforeVocabularyOwner(path,source);
 if(path==='src/lua/abyss_potion_discard_ui.lua')source=beforeKnownMasterBackflowSource(path,source);
 source=beforeLibraryReadPrompt(path,source);
 source=beforeBattleInputHistory(path,beforeChapterEntranceOwner(path,beforeArchitectureOwner(path,source)));
 if(path===battleUiPath)source=beforeLinkedBackflow(path,source);
 source=beforeUiEntrance(path,beforeBattlePeriphery(path,beforeChapterBattleScene(path,source)));
 source=predecessor(roomEntry.files,path,beforeDeckPages(path,source,options));
 source=beforeRelicDetail(path,source);
 return beforePriorDevelopBackflow(path,beforeSessionRelic(path,source,options));
}
export function assertCurrentSessionRelicOwner(path,source){
 if(Object.hasOwn(sessionRelic.files,path)){
  assert(matches(predecessor(roomEntry.files,path,beforeDeckPages(path,source)),current(path).after),'combined linked owner identity: '+path);
 }
}
export function authenticateDevelopBackflow(path,source,read,options){
 ({source,read}=entrancePredecessor(path,source,read));
 return authenticateDevelopBackflowWithReaders(path,source,read,recentBackflowOwnerReader(read),options);
}
function readBackflowOwner(read,path){
 try{return read(path);}
 catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
}
function authenticateDevelopBackflowWithReaders(path,source,readLive,readLinked,options){
 if(path===deckPath){
  const prior=beforeReleaseDeckPointer(path,source);
  if(prior!==source){
   const live=readBackflowOwner(readLive,path);
   const lf=value=>value.replaceAll('\r\n','\n');
   const livePrior=beforeReleaseDeckPointer(path,live);
   assert(livePrior!==live&&lf(livePrior)===lf(prior),'fresh Release deck pointer owner');
   source=prior;
  }
 }
 const rawLive=readLive;
 readLive=owner=>owner===deckPath?beforeReleaseDeckPointer(owner,rawLive(owner)):rawLive(owner);
 const libraryPrior=beforeLibraryReadPrompt(path,source);
 if(libraryPrior!==source){
  const live=readBackflowOwner(readLive,path);
  assert(uniformSource(live)&&matches(live,libraryPromptCurrent),'combined linked owner identity: '+path+' changed during Library read prompt validation');
  return libraryPrior;
 }
 ({source,read:readLive}=chapterBattleSceneReader(path,source,readLive));
 ({source,read:readLive}=battlePeripheryPredecessor(path,source,readLive));
 const readLinkedPeriphery=readLinked;
 readLinked=owner=>beforeBattlePeriphery(owner,beforeChapterBattleScene(owner,readLinkedPeriphery(owner)));
 const priorUi=beforeDevelopUiBackflows(path,source);
 if(priorUi!==source){
  const live=readBackflowOwner(readLive,path);
  assert(typeof live==='string'&&live.replaceAll('\r\n','\n')===source.replaceAll('\r\n','\n'),
   'combined linked owner identity: '+path+' during deck/potion backflow validation');
 }
 const readUi=owner=>beforeDevelopUiBackflows(owner,readLive(owner));
 source=authenticateActionButtons(path,priorUi,readUi);
 const readActions=owner=>beforeActionButtons(owner,readUi(owner));
 const beforeCloseout=beforeCombatEvents(path,source);
 if(beforeCloseout!==source){
  const live=readBackflowOwner(readActions,path);
  assert(typeof live==='string'&&live.replaceAll('\r\n','\n')===source.replaceAll('\r\n','\n'),
   'combined linked owner identity: '+path+' during combat/event backflow validation');
 }
 source=beforeCloseout;
 const readCloseout=owner=>beforeCombatEvents(owner,readActions(owner));
 const retiredInput=authenticateInputRetirement(path,source,readCloseout,options);
 const readInputLive=beforeInputRetirementReader(readCloseout);
 const readInputLinked=beforeInputRetirementReader(owner=>beforeCombatEvents(owner,readLinked(owner)));
 const readDeckLive=owner=>deckPagesPrior(owner,readInputLive(owner));
 const deckPrior=deckPagesPrior(path,retiredInput);
 if(deckPrior!==retiredInput){
  let live;
  try{live=readInputLive(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,deckPages.files[path].after),'combined linked owner identity: '+path+' during deck-pages validation');
 }
 source=deckPrior;
 const roomPrior=predecessor(roomEntry.files,path,source);
 if(roomPrior!==source){
  let live;
  try{live=readDeckLive(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,roomEntry.files[path].after),mapRoomOwnerError(path));
 }
 const read=owner=>predecessor(roomEntry.files,owner,owner===path?readDeckLive(owner):deckPagesPrior(owner,readInputLinked(owner)));
 source=roomPrior;
 source=authenticateRelicDetail(path,source,read);
 const sessionPrior=beforeSessionRelic(path,source,options);
 const sessionSuccessor=sessionPrior!==source;
 if(sessionSuccessor){
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assertCurrentSessionRelicOwner(path,live);
 }
 return authenticatePriorDevelopBackflow(path,sessionPrior,owner=>{
  const live=read(owner);
  if(!sessionSuccessor&&owner===path)return live;
  if(sessionSuccessor||owner==='config/architecture.json')assertCurrentSessionRelicOwner(owner,live);
  return beforeSessionRelic(owner,live);
 });
}
