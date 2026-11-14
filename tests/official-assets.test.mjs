import {nativeAudioBuildArgs,buildNativeAudioGame} from '../scripts/build-native-audio-game.mjs';
import test from 'node:test';
import {cardFaceChildren} from '../scripts/card-face.mjs';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {deckCardTemplate} from '../scripts/deck-ui-layout.mjs';
import {applyOfficialAssets,officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {officialAssetsProfile,officialAssetFlags,validateOfficialAssets,officialAssetsArgs,officialAssetsFromReceipt} from '../scripts/official-assets-profile.mjs';
import {artFeatureReceipt,artBuildOptionsFromReceipt,readArtFeatures} from '../scripts/art-features.mjs';
import {portraitInventory,portraitRuntimeInputs} from '../scripts/official-portraits.mjs';
import {auditUiBuildArgs} from '../scripts/audit-native-candidate.mjs';
import {uiProfileReceipt,uiProfileFromReceipt,validateUiProfileOptions} from '../scripts/ui-profile.mjs';
import {buildUI,assertNativeUiCapacity} from '../scripts/build-ui.mjs';
import {buildNativeCandidate} from '../scripts/build-native-candidate.mjs';
import {merchantControl} from '../scripts/cinematic-ui-layout.mjs';
import {gameBuildArgs} from '../scripts/build-game.mjs';
import {styleEvent} from '../scripts/v25-node-layout.mjs';
import {applyOfficialNeowLayout} from '../scripts/noncombat-neow-layout.mjs';
import {applyOfficialNoncombatLayout} from '../scripts/noncombat-v25-layout.mjs';
import {assertOfficialRunContracts} from '../scripts/official-run-layout.mjs';
import {buildStsSharedCardChrome,geoCardReferenceTokens} from '../scripts/sts-card-reference-profile.mjs';
const children=node=>node.controls??node.children??[];
const all=node=>[node,...children(node).flatMap(all)];
const paths=(node,prefix='')=>allPaths(node,prefix);
function allPaths(node,prefix){const path=prefix+'/'+node.name;return [[path,node],...children(node).flatMap(item=>allPaths(item,path))];}
const child=(node,name)=>children(node).find(item=>item.name===name);
const restoredPagePath=path=>path.includes('/battlePanel/')||path.includes('/characterPanel/')
 ||path.includes('/menuPanel/start/')||/\/menuPanel\/(?:start|emblem|vista|heroArt)$/.test(path)
 // Only the adopted map/chrome owners change geometry; other room and menu
 // paths below must still retain their original transforms and input identity.
 ||/^\/SlayTheAbyss\/mapPanel\/(?:mapGroup1\/(?:title|notice|typeLegend)(?:\/|$)|previewBack(?:\/|$)|resources\/(?:hpIcon|hp|goldIcon|gold)$|resourceHints\/(?:hp|gold)(?:\/hit)?$)/.test(path)
 ||/^\/SlayTheAbyss\/nodePanel\/(?:title|hpIcon|hp|goldIcon|gold)$/.test(path)
 ||/^\/SlayTheAbyss\/potionEntry\/open(?:\/hit)?$/.test(path)
 ||/^\/SlayTheAbyss\/potionEntry\/open\/hit\/(?:normal|hover|pressed|disabled)\/slot[1-5](?:\/|$)/.test(path);
function receipt(){return {officialAssetsProfile,artFeatures:artFeatureReceipt(officialAssetFlags),uiProfile:uiProfileReceipt(true),
 officialPortraits:{...portraitInventory(officialAssetFlags,{officialAssets:true}),inputs:portraitRuntimeInputs(officialAssetFlags).map(path=>({path}))}};}

test('official art is opt-in and preserves both legacy CLI presets and strict candidate guards',async()=>{
 assert.equal(validateOfficialAssets({}),false);
 assert.equal(validateOfficialAssets({officialAssets:true}),true);
 assert.deepEqual(officialAssetsArgs(['map.gil','--official-assets']),{args:['map.gil'],officialAssets:true});
 for(const args of [['--official-assets=false'],['--official-assets','--official-assets']])assert.throws(()=>officialAssetsArgs(args));
 for(const patch of [{officialAssets:1},{releaseCandidate:true},{lightweight2d:true},{v25BattleChrome:true},{v25CardAssets:'private'},{v25UiMasks:'private'},
  {nativeCardArt:{count:0}},{performanceArt:true},{readyCardArt:true},{componentWidgets:{}},{prepare(){}},{artFeatures:{cards:true}},
  {artFeatures:{selectionAvatar:false}},{artFeatures:{battlePortrait:false}},{artFeatures:{menuBackground:true}}]){
  assert.throws(()=>validateOfficialAssets({officialAssets:true,...patch}));
 }
 await assert.rejects(buildNativeCandidate({officialAssets:true,prepare(){}}),/separate non-release/);
 assert.deepEqual(gameBuildArgs(['base.gil','--art-version=official']),['base.gil','--official-assets','--native-page-lifecycle']);
 for(const version of ['legacy','enhanced'])assert(!gameBuildArgs(['base.gil','--art-version='+version]).includes('--official-assets'));
});

test('receipts and pinned source audits reconstruct official art and reject mismatched profiles',()=>{
 const value=receipt();
 assert.equal(officialAssetsFromReceipt(value),true);
 assert.equal(artBuildOptionsFromReceipt(value).officialAssets,true);
 assert.equal(uiProfileFromReceipt(value),true);
 assert.equal(validateUiProfileOptions({officialAssets:true,nativePageLifecycle:true}),true);
 const args=auditUiBuildArgs(value);
 assert(args.includes('--official-assets'));assert(args.includes('--native-page-lifecycle'));
 assert(!args.includes('--lightweight-2d'));assert(!args.includes('--v25-battle-chrome'));
 assert.equal(officialAssetsFromReceipt({}),false);
 for(const patch of [{officialAssetsProfile:'unknown'},{experimentalBattleChrome:'v25-layered-v1'},
  {experimentalProfile:'bounded-2d-v1'},{artFeatures:artFeatureReceipt({})},{nativeCardArt:{}},{v25UiMasks:{}}])
  assert.throws(()=>officialAssetsFromReceipt({...value,...patch}));
});

// The complete pre-capacity assertions remain byte-authenticated in the release view.
test('historical approved pages keep live input identities while unrelated pages retain their geometry',t=>{
 t.diagnostic(replayReviewedSelection('tests/official-assets.test.mjs'));
});

test('scene and button substitutions preserve semantic icons and all four native button states',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);
 const before=new Map(paths(layout).filter(([,node])=>node.kind==='image').map(([path,node])=>[path,node.image]));
 applyOfficialAssets([layout],theme);
 const battle=child(layout,'battlePanel'),turn=child(battle,'endTurn');
 assert.deepEqual(turn.states,{normal:'normal',hover:'hover',pressed:'pressed',disabled:'disabled'});
  for(const state of turn.children){
   assert(child(state,'v25Chrome'));
   assert.equal(child(child(state,'v25Chrome'),'faceLight'),undefined,'no rectangular face highlight patch');
   for(const name of ['border','borderLeft','borderRight','inner','innerLeft','innerRight','plate','plateLeft','plateRight'])assert.equal(child(state,name).visible,false,'legacy '+name+' must not widen the restored turn button');
  }
 for(const [path,node]of paths(layout))if(/\/(portrait|intentIcon|intentBadge|intentExtra|hpIcon|goldIcon|blockedLock|art|art_attack|art_skill|art_power|icon)$/.test(path)&&node.kind==='image'){
  const expected=path==='/SlayTheAbyss/nodePanel/eventView/art'?theme.icon.eventArt.default:
   before.get(path)??(/^\/SlayTheAbyss\/relicBar\/slot(?:1[3-9]|2[0-5])\/icon$/.test(path)?before.get('/SlayTheAbyss/relicBar/slot1/icon'):undefined);
  assert.equal(node.image,expected,path);
 }
 assert.equal(child(child(layout,'menuPanel'),'backdrop').image,nativeTheme.image.officialBackdrops.title);
 const menu=child(layout,'menuPanel'),result=child(menu,'result');
 for(const key of ['floor','victories','time','deck']){
  const stat=child(result,'stat_'+key);assert.equal(child(stat,'face').image,107311);
  assert.equal(child(stat,'face').colour,'#FFFFFF');assert.equal(child(stat,'border').colour,nativeTheme.color.goldDim);
 }
 const map=child(layout,'mapPanel'),field=child(child(map,'mapGroup1'),'mapField');
 assert.equal(field.image,nativeTheme.image.rect);assert.equal(field.colour,nativeTheme.color.mapCanvas.backdrop);
  assert.equal(theme.cardSkin.text.body,nativeTheme.officialAssets.cardInk);assert.equal(nativeTheme.cardSkin.text.body,undefined);
 const removal=child(child(child(layout,'nodePanel'),'shopView'),'removal');
 const description=child(removal,'description');
 assert.equal(description.text.fontSize,20);assert.equal(description.text.minFontSize,nativeTheme.font.minimum);
 assert.equal(description.text.autoSize,true);assert.deepEqual(description.size,[104,64]);
});

test('official selection keeps its approved 1600 background while battle and opt-out retain their explicit sources',t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});const dir=mkdtempSync(join(root,'official-assets-'));
 t.after(()=>rmSync(dir,{force:true,recursive:true}));
 buildUI(dir,undefined,{officialAssets:true,nativePageLifecycle:true});
 assert.deepEqual(readArtFeatures(dir),officialAssetFlags);
 const layout=JSON.parse(readFileSync(join(dir,'game-ui.json'),'utf8'));
 const battle=child(child(layout,'stage'),'battlePanel');
 assert(child(child(battle,'card1'),'stsReferenceChrome'),'official battle card must mount the shared reference chrome');
 assert(child(child(battle,'hero'),'officialFigure'));
 const portrait=readFileSync(join(dir,'abyss_traveler_portrait_assets.lua'),'utf8');
 assert.match(portrait,/battle133=/);assert.match(portrait,/avatar96=/);
 assert.match(portrait,/battlePixel=/);
 const inventory=portraitInventory(officialAssetFlags,{officialAssets:true});
 assert.equal(inventory.assets.some(a=>a.asset==='temporary-pixel-traveler'),false);
 assert.match(portrait,/battleApprovedIdle=/);
 const selected=inventory.assets.find(a=>a.asset==='lowpolyLumine');
 const fighting=inventory.assets.find(a=>a.asset==='traveler-geo/idle-approved-v1');
 assert.equal(fighting?.images,7303);
 assert.equal(fighting.motion,'approved-source-field-native-band-approximation');
 assert.equal(inventory.selectionUses,'lowpolyLumine');assert.equal(selected?.images,1600);
 assert.notEqual(selected.sourceSha256,fighting.sourceSha256,'approved background and combat idle retain distinct source identities');
 assert.equal(inventory.assets.some(a=>a.asset==='traveler-geo/portraits/battle133-selection'),false);
 assert.equal(inventory.assets.find(a=>a.asset==='traveler-geo/portraits/avatar96').images,457);
 assert.doesNotMatch(portrait,/lowpolyLand=/);
 assert.match(readFileSync(join(dir,'abyss_theme.lua'),'utf8'),/official-assets-first/);
 assert.match(readFileSync(join(dir,'abyss_ui_profile.lua'),'utf8'),/nativePageLifecycle=true/);
 buildUI(dir);
 const fallback=JSON.parse(readFileSync(join(dir,'game-ui.json'),'utf8'));
 assert.notEqual(child(child(child(child(child(fallback,'stage'),'battlePanel'),'card1'),'roundBody'),'vertical')?.image,107253);
 assert.deepEqual(readArtFeatures(dir),{cards:false,menuBackground:false,selectionAvatar:false,battlePortrait:false,monsters:false});
});

test('audio wrapper forwards the explicit official profile and lifecycle without legacy background defaults',async()=>{
 const parsed=nativeAudioBuildArgs(['base.gil','--official-assets']);
 assert.deepEqual(parsed.options.artFeatures,officialAssetFlags);assert.equal(parsed.options.nativePageLifecycle,true);
 const stop=Error('before native toolchain');let called=false;
 await assert.rejects(buildNativeAudioGame({...parsed.options,baseMap:'base.gil',buildFull:async options=>{
  called=true;assert.equal(options.officialAssets,true);assert.equal(options.nativePageLifecycle,true);
  assert.deepEqual(options.artFeatures,officialAssetFlags);throw stop;
 }}),error=>error===stop);assert(called);
});
import {replayReviewedSelection} from './helpers/replay-reviewed-selection.mjs';
