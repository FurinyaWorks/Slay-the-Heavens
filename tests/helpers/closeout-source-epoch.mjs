// One exact current production closure; original slices and archives stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
import {extendStsStyleEpoch} from './sts-style-source-epoch-runtime.mjs';
import {stsStylePatch} from './sts-style-source-proof.mjs';
import {extendFeedbackSourceEpoch} from './sts-feedback-source-runtime.mjs';
import {feedbackProductionPatch} from './sts-feedback-production.mjs';
import {extendMenuRedSourceEpoch,extendMenuPresentationEpoch} from './menu-red-source-epoch.mjs';
import {extendReleaseSourceEpoch} from './release-source-epoch.mjs';
import {extendSessionMenuEpoch} from './session-menu-source-epoch.mjs';
import {extendMobilePotionSource} from './mobile-potion-source.mjs';
import {extendPotionRegressionSource} from './potion-regression-source.mjs';
import {extendPotionClickSource} from './potion-click-source.mjs';
import {extendPotionPost697Source} from './potion-post697-source.mjs';
import {extendReleasePc22BasicFeedbackSource} from './release-pc22-basic-feedback-source.mjs';
import {extendReleaseSelectionMapSource} from './release-selection-map-source.mjs';
import {extendReleaseEnemyArtSource} from './release-enemy-art-source.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const bytes=readFileSync(new URL('./closeout-source-epoch.json.gz',import.meta.url));
assert.equal(hash(bytes),'36aba7fc07f732a191a750d437eefd27e9b9567221811747abf13c97a9ac237a');
const packed=JSON.parse(gunzipSync(bytes));
const expand=files=>Object.fromEntries(Object.entries(files).map(([path,id])=>[path,id===null?null:packed.records[id]]));
const priorProof={...packed,current:expand(packed.current),targets:Object.fromEntries(Object.entries(packed.targets).map(([name,target])=>[name,{...target,files:expand(target.files)}]))};
delete priorProof.records;
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const closeoutPriorEpoch=createSourceEpochProjector(freeze(priorProof),{allowConfigLayout:true,reuseFrozenInput:true});
// Only this five-source continuation advances. The complete old closeout archive,
// target views and receipt identities above remain independent and immutable.
const shopBytes=readFileSync(new URL('./shop-deck-source-epoch.json.gz',import.meta.url));
assert.equal(hash(shopBytes),'f5546b3bd0264af9e4fff867637fe217e4e7c32482e72104d7d3c1f3cc43a03b','shop/deck complete archive identity');
const outer=createSourceEpochProjector(JSON.parse(gunzipSync(shopBytes))).proof;
assert.equal(outer.targets.prior.commit,'903bf2a31e91f10fb24763ab4cea23d586d0bb83');
assert.deepEqual(Object.keys(outer.current),['src/lua/abyss_deck_ui.lua','src/lua/abyss_merchant.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_node_ui_feedback.lua','src/lua/abyss_potion_discard_ui.lua']);
for(const [path,binding]of Object.entries(outer.targets.prior.files))assert.deepEqual(binding,priorProof.current[path],'shop/deck exact closeout predecessor: '+path);
const current={...priorProof.current,...outer.current};
const fourBytes=readFileSync(new URL('./shop-deck-four-source-epoch.json.gz',import.meta.url));
assert.equal(hash(fourBytes),'51034e9da34cbe0ab153f00ab66a16918db1097ef7173932ab326cc6c2076f2b','immutable PR639 four-source predecessor');
const four=createSourceEpochProjector(JSON.parse(gunzipSync(fourBytes))).proof;
for(const [path,binding]of Object.entries(four.targets.prior.files))assert.deepEqual(binding,priorProof.current[path],'four-source predecessor: '+path);
export const shopDeckFourSourcePrior=freeze(four);
const beforeRepairBytes=readFileSync(new URL('./shop-deck-before-ci-repair-source-epoch.json.gz',import.meta.url));
assert.equal(hash(beforeRepairBytes),'94d6f85a83a1593bbbaf34ae13986ddfbca97312e183b4e7f6b08ca58b8d911b','immutable PR639 five-source predecessor before Full repair');
export const shopDeckBeforeCiRepairPrior=freeze(createSourceEpochProjector(JSON.parse(gunzipSync(beforeRepairBytes))).proof);
for(const [path,binding]of Object.entries(shopDeckBeforeCiRepairPrior.targets.prior.files))assert.deepEqual(binding,priorProof.current[path],'five-source predecessor: '+path);
const targets={...priorProof.targets,shopDeckPrior:{commit:outer.targets.prior.commit,files:priorProof.current},
 shopDeckFourPrior:{commit:four.currentCommit,files:{...priorProof.current,...four.current}},
 shopDeckBeforeCiRepairPrior:{commit:shopDeckBeforeCiRepairPrior.currentCommit,files:{...priorProof.current,...shopDeckBeforeCiRepairPrior.current}}};
const owners=Object.keys(current).filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
export const ciRepairSourceEpoch=createSourceEpochProjector(freeze({...priorProof,currentTreeCommitted:false,
 currentCommit:outer.currentCommit,currentCommitRole:outer.currentCommitRole,current,targets,owners}),{allowConfigLayout:true,reuseFrozenInput:true});
export const stsStyleEpoch=extendStsStyleEpoch(ciRepairSourceEpoch,stsStylePatch);
export const menuRedPriorEpoch=extendFeedbackSourceEpoch(stsStyleEpoch,feedbackProductionPatch);
export const menuRedEpoch=extendMenuRedSourceEpoch(menuRedPriorEpoch);
export const menuPresentationEpoch=extendMenuPresentationEpoch(menuRedEpoch);
export const releaseSourceEpoch=extendReleaseSourceEpoch(menuPresentationEpoch);
export const preReleasePc22BasicFeedbackSourceEpoch=extendSessionMenuEpoch(releaseSourceEpoch);
export const preReleaseSelectionMapSourceEpoch=preReleasePc22BasicFeedbackSourceEpoch;
export const releasePc22BasicFeedbackSourceEpoch=extendReleasePc22BasicFeedbackSource(preReleasePc22BasicFeedbackSourceEpoch);
export const releaseSelectionMapSourceEpoch=extendReleaseSelectionMapSource(preReleaseSelectionMapSourceEpoch);
export const preReleaseEnemyArtSourceEpoch=releaseSelectionMapSourceEpoch;
export const releaseEnemyArtSourceEpoch=extendReleaseEnemyArtSource(preReleaseEnemyArtSourceEpoch);
export const preMobilePotionSourceEpoch=preReleasePc22BasicFeedbackSourceEpoch;
export const prePotionRegressionSourceEpoch=extendMobilePotionSource(preMobilePotionSourceEpoch);
export const prePotionClickSourceEpoch=extendPotionRegressionSource(prePotionRegressionSourceEpoch);
export const prePotionPost697SourceEpoch=extendPotionClickSource(prePotionClickSourceEpoch);
export const releaseSelectionMapLegacyEpoch=releaseSelectionMapSourceEpoch;
export const potionPost697SourceEpoch=extendPotionPost697Source(prePotionPost697SourceEpoch,releaseSelectionMapLegacyEpoch);
// Preserve each standalone history. The enemy-art and potion sides inherit selection;
// a repeated owner must be exactly identical to the already joined row.
function joinReleaseSources(){
const base=preReleasePc22BasicFeedbackSourceEpoch.proof;
const pc22=releasePc22BasicFeedbackSourceEpoch.proof,selection=releaseSelectionMapSourceEpoch.proof;
const current={...base.current},targets={...base.targets};
const enemy=releaseEnemyArtSourceEpoch.proof;
const potion=potionPost697SourceEpoch.proof;
for(const side of [pc22,selection,enemy,potion]){
 for(const [path,row]of Object.entries(side.current))if(row?.sha256!==base.current[path]?.sha256){
  if(current[path]?.sha256===row?.sha256)assert.deepEqual(current[path],row,'identical inherited Release integration owner: '+path);
  else assert.deepEqual(current[path],base.current[path],'disjoint Release integration owner: '+path);
  current[path]=row;
 }
 for(const [name,target]of Object.entries(side.targets)){
  if(Object.hasOwn(targets,name))assert.deepEqual(targets[name],target,'unchanged common Release target: '+name);
  else targets[name]=target;
 }
}
targets.releasePc22BasicFeedbackReviewed={commit:pc22.currentCommit,files:pc22.current};
targets.releaseSelectionMapReviewed={commit:selection.currentCommit,files:selection.current};
targets.releaseEnemyArtReviewed={commit:enemy.currentCommit,files:enemy.current};
const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
return createSourceEpochProjector(freeze({...base,current,targets,owners,
 currentTreeCommitted:false,currentCommit:'ead341112170308b5c80582ef016253af5944e81',
 currentCommitRole:'integration worktree capture against actual Release ead34111; standalone source producers are retained separately',
 releasePc22BasicFeedbackProducers:pc22.releasePc22BasicFeedbackProducers,
 releaseSelectionMapProducers:selection.releaseSelectionMapProducers,
 potionPost697Producers:potion.potionPost697Producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
// Scope the hand continuation to the exact source bytes already preserved in #688.
const jointRelease = joinReleaseSources().proof;
const handBytes = readFileSync(new URL('./mobile-hand-source.json.gz', import.meta.url));
assert.equal(hash(handBytes), 'f09812ac4f7c422d8a4530a8efa9ca0e35048eb1a2f4a7940495d76495f5ee4c');
const hand = JSON.parse(gunzipSync(handBytes));
const handPath = 'src/lua/abyss_battle_card_view.lua';
assert.deepEqual(Object.keys(hand.current), [handPath]);
assert.deepEqual(Object.keys(hand.before), [handPath]);
assert.deepEqual(hand.before[handPath], jointRelease.current[handPath], 'exact Release hand source predecessor');
const handCurrent = { ...jointRelease.current, [handPath]: hand.current[handPath] };
const handTargets = {
  ...jointRelease.targets,
  releaseHandLayoutPrior: { commit: 'b63719b117e83676e20787e752d14bc66b63a6ed', files: jointRelease.current },
};
const handOwners = Object.keys(handCurrent).sort().filter(path =>
  Object.values(handTargets).some(target => target.files[path]?.sha256 !== handCurrent[path]?.sha256));
const handRelease = {
  ...jointRelease, current: handCurrent, targets: handTargets, owners: handOwners,
  currentCommit: 'c73465e5c322a1f8e3ecf493a2c8c161506c7d18',
  currentCommitRole: 'exact hand optimization slice on the actual Release base',
};
// Advance the other #688 slice using its unchanged original three-owner packet.
const enemyBytes = readFileSync(new URL('./enemy-geometry-source.json.gz', import.meta.url));
assert.equal(hash(enemyBytes), 'af5ac18b5bb3346fe000d22a184e04b8d064d38e723bd328a06cdf1b37fecfae');
const enemyMetrics = JSON.parse(gunzipSync(enemyBytes));
const enemyPaths = ['src/lua/abyss_battle_enemy_view.lua', 'src/lua/abyss_battle_render_actors.lua',
  'src/lua/abyss_battle_targeting.lua'];
assert.deepEqual(Object.keys(enemyMetrics.current), enemyPaths);
assert.deepEqual(Object.keys(enemyMetrics.before), enemyPaths);
for (const path of enemyPaths)
  assert.deepEqual(enemyMetrics.before[path], handRelease.current[path], 'exact Release enemy metrics predecessor: ' + path);
const enemyCurrent = { ...handRelease.current, ...enemyMetrics.current };
const enemyTargets = {
  ...handRelease.targets,
  releaseEnemyMetricsPrior: { commit: '6aaed54a56c3d2769a71feea3580798ae421a0e8', files: handRelease.current },
};
const enemyOwners = Object.keys(enemyCurrent).sort().filter(path =>
  Object.values(enemyTargets).some(target => target.files[path]?.sha256 !== enemyCurrent[path]?.sha256));
const enemyRelease = {
  ...handRelease, current: enemyCurrent, targets: enemyTargets, owners: enemyOwners,
  currentCommit: 'aa94670285691a41d6c0e9629ad540ccb4efe159',
  currentCommitRole: 'exact enemy metrics slice on actual Release with the hand optimization already merged',
};
const sparseBytes = readFileSync(new URL('./release-sparse-pointer-source.json.gz', import.meta.url));
assert.equal(hash(sparseBytes), '24126de8efaf5088cc67d045391bbd2ba19a464e0a616d9d2483a12f70648340', 'complete sparse Down sample source');
const sparse = JSON.parse(gunzipSync(sparseBytes));
const sparsePath = 'src/lua/abyss_battle_card_bindings.lua';
assert.equal(sparse.owner, sparsePath);
assert.equal(sparse.base, 'c5e98d55250636cf2c3d4bbb395b30304c3a5807');
assert.deepEqual(sparse.before, enemyRelease.current[sparsePath], 'exact Release sparse pointer predecessor');
const sparseCurrent = { ...enemyRelease.current, [sparsePath]: sparse.current };
const sparseTargets = {
  ...enemyRelease.targets,
  releaseSparsePointerPrior: { commit: sparse.base, files: enemyRelease.current },
};
const sparseOwners = Object.keys(sparseCurrent).sort().filter(path =>
  Object.values(sparseTargets).some(target => target.files[path]?.sha256 !== sparseCurrent[path]?.sha256));
const sparseRelease = {
  ...enemyRelease, current: sparseCurrent, targets: sparseTargets, owners: sparseOwners,
  currentCommit: sparse.checkpoint,
  currentCommitRole: 'exact coalesced Down sample slice from #711',
};
const intentBytes = readFileSync(new URL('./release-composite-intent-source.json.gz', import.meta.url));
assert.equal(hash(intentBytes), '813ee7d1c86932e518c8b5c2d23c339c8dbd86b73d53151531c58ed8414ae7ef');
const intent = JSON.parse(gunzipSync(intentBytes));
const intentPaths = ["src/lua/abyss_battle_intent_view.lua", "src/lua/abyss_battle_render_actors.lua"];
assert.deepEqual(Object.keys(intent.before), intentPaths);
assert.deepEqual(Object.keys(intent.current), intentPaths);
for (const path of intentPaths)
  assert.deepEqual(intent.before[path], sparseRelease.current[path], 'exact Release composite intent predecessor: ' + path);
const intentCurrent = { ...sparseRelease.current, ...intent.current };
const intentTargets = {
  ...sparseRelease.targets,
  releaseCompositeIntentPrior: { commit: '174fecfe4561b58f402c4c140ee5520d96e18b3c', files: sparseRelease.current },
};
const intentOwners = Object.keys(intentCurrent).sort().filter(path =>
  Object.values(intentTargets).some(target => target.files[path]?.sha256 !== intentCurrent[path]?.sha256));
const intentRelease = {
  ...sparseRelease, current: intentCurrent, targets: intentTargets, owners: intentOwners,
  currentCommit: 'b454466798656c6f3b00613bbca1effef2459317',
  currentCommitRole: 'exact composite intent on the actual Release base after enemy metrics',
};
const particlesBytes = readFileSync(new URL('./runtime-particle-source.json.gz', import.meta.url));
assert.equal(hash(particlesBytes), '2cef28e3bd47c3638c421c9f152453b7e446501f69e32bdaac39417a3731ad6a', 'exact original runtime particle source');
const particles = JSON.parse(gunzipSync(particlesBytes));
const particlePath = 'src/lua/abyss_monster_intent_particle_view.lua';
assert.deepEqual(Object.keys(particles.current), [particlePath]);
assert.deepEqual(Object.keys(particles.before), [particlePath]);
assert.deepEqual(particles.before[particlePath], intentRelease.current[particlePath], 'exact Release intent particle predecessor');
const particleCurrent = { ...intentRelease.current, ...particles.current };
const particleTargets = {
  ...intentRelease.targets,
  releaseIntentParticlePrior: { commit: 'cdf5fe42fa7962f004966842e05d8ab35781df31', files: intentRelease.current },
};
const particleOwners = Object.keys(particleCurrent).sort().filter(path =>
  Object.values(particleTargets).some(target => target.files[path]?.sha256 !== particleCurrent[path]?.sha256));
const beforeCorners = {
  ...intentRelease, current: particleCurrent, targets: particleTargets, owners: particleOwners,
  currentCommit: '22a5f5c36c9e3d47e11568a06ee0118c94118136',
  currentCommitRole: 'exact static intent particle slice from #706',
};
const cornerBytes = readFileSync(new URL('./release-target-corners-source.json.gz', import.meta.url));
assert.equal(hash(cornerBytes), '74900cc6bcc96f29a430067d609bda9c7de8a2d3245b9fad59fc69ae4d3181c7', 'complete target corner source');
const corner = JSON.parse(gunzipSync(cornerBytes));
const cornerPath = 'src/lua/abyss_battle_unit_view.lua';
assert.equal(corner.schemaVersion, 1);
assert.equal(corner.owner, cornerPath);
assert.equal(corner.base, '72870245228a2a9fbf036a516aa69332baa35973');
assert.equal(corner.checkpoint, '13c9981431e04ac1be75592842da180225dbaf63');
assert.deepEqual(corner.before, beforeCorners.current[cornerPath], 'exact Release target corner predecessor');
const cornerCurrent = { ...beforeCorners.current, [cornerPath]: corner.current };
const cornerTargets = {
  ...beforeCorners.targets,
  releaseTargetCornersPrior: { commit: corner.base, files: beforeCorners.current },
};
const cornerOwners = Object.keys(cornerCurrent).sort().filter(path =>
  Object.values(cornerTargets).some(target => target.files[path]?.sha256 !== cornerCurrent[path]?.sha256));
const preShopDismissal = {
  ...beforeCorners, current: cornerCurrent, targets: cornerTargets, owners: cornerOwners,
  currentCommit: corner.checkpoint,
  currentCommitRole: 'exact target corner geometry from #684 on the current Release baseline',
};
const shopDismissalBytes = readFileSync(new URL('./release-shop-dismissal-source.json.gz', import.meta.url));
assert.equal(hash(shopDismissalBytes), 'a8c7fd5bcba44c200ddfc644761adb69b35d7d2ab1e92d619f01fc050fb3ae24', 'complete shop dismissal production source');
const shopDismissal = JSON.parse(gunzipSync(shopDismissalBytes));
const shopDismissalPaths = ["src/lua/abyss_node_ui_input.lua", "src/lua/abyss_shop_selection.lua"];
assert.deepEqual(Object.keys(shopDismissal.before), shopDismissalPaths);
assert.deepEqual(Object.keys(shopDismissal.current), shopDismissalPaths);
for (const path of shopDismissalPaths)
  assert.deepEqual(shopDismissal.before[path], preShopDismissal.current[path], 'exact Release shop dismissal predecessor: ' + path);
const shopDismissalCurrent = { ...preShopDismissal.current, ...shopDismissal.current };
const shopDismissalTargets = {
  ...preShopDismissal.targets,
  releaseShopDismissalPrior: { commit: '91d6f955e16dcf91d24971450abaa72d12a4efa3', files: preShopDismissal.current },
};
const shopDismissalOwners = Object.keys(shopDismissalCurrent).sort().filter(path =>
  Object.values(shopDismissalTargets).some(target => target.files[path]?.sha256 !== shopDismissalCurrent[path]?.sha256));
const beforeCardCancel = {
  ...preShopDismissal, current: shopDismissalCurrent, targets: shopDismissalTargets, owners: shopDismissalOwners,
  currentCommit: '9d02659021c893f9919d17bd5a8ce13876f1bcf8',
  currentCommitRole: 'exact shop pointer dismissal slice from #680',
};

const cancelBytes = readFileSync(new URL('./release-card-cancel-notice-source.json.gz', import.meta.url));
assert.equal(hash(cancelBytes), '639ea6a234785a1a492aae6d911b6d7c8a6051a1b610d5b5d530f5d9711569d5', 'complete card cancel notice source');
const cancel = JSON.parse(gunzipSync(cancelBytes));
const cancelPath = 'src/lua/abyss_battle_card_gestures.lua';
assert.equal(cancel.schemaVersion, 1);
assert.equal(cancel.owner, cancelPath);
assert.equal(cancel.base, '4628caadac5f419a4253c85ddbcc3870192a1fa7');
assert.equal(cancel.producer, '99ab019a329497725d98d6a475db4fc0910054fe');
assert.deepEqual(cancel.before, beforeCardCancel.current[cancelPath], 'exact Release card cancel notice predecessor');
const cancelCurrent = { ...beforeCardCancel.current, [cancelPath]: cancel.current };
const cancelTargets = {
  ...beforeCardCancel.targets,
  releaseCardCancelNoticePrior: { commit: cancel.base, files: beforeCardCancel.current },
};
const cancelOwners = Object.keys(cancelCurrent).sort().filter(path =>
  Object.values(cancelTargets).some(target => target.files[path]?.sha256 !== cancelCurrent[path]?.sha256));
const pointerPriorRelease = {
  ...beforeCardCancel, current: cancelCurrent, targets: cancelTargets, owners: cancelOwners,
  currentCommit: cancel.base,
  currentCommitRole: 'PC35 cancel notice from #684 against actual Release, preserving existing pointer policy',
};
const pointerBytes = readFileSync(new URL('./release-pointer-identity-source.json.gz', import.meta.url));
assert.equal(hash(pointerBytes), 'da52daa0546b805a695ec5c06c228f2a268bd24d464f30bf5755f114df01005b', 'complete current pointer identity production inputs');
const pointer = JSON.parse(gunzipSync(pointerBytes));
const pointerPaths = [
  'src/lua/abyss_battle_action_bindings.lua',
  'src/lua/abyss_battle_card_bindings.lua',
  'src/lua/abyss_battle_card_gestures.lua',
  'src/lua/abyss_battle_details.lua',
  'src/lua/abyss_battle_input_state.lua',
  'src/lua/abyss_battle_potion_bindings.lua',
  'src/lua/abyss_battle_target_bindings.lua',
  'src/lua/abyss_battle_ui.lua',
];
assert.equal(pointer.base, '1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2');
assert.deepEqual(Object.keys(pointer.before), pointerPaths);
assert.deepEqual(Object.keys(pointer.current), pointerPaths);
for (const path of pointerPaths)
  assert.deepEqual(pointer.before[path], pointerPriorRelease.current[path], 'exact Release pointer identity predecessor: ' + path);
const pointerCurrent = { ...pointerPriorRelease.current, ...pointer.current };
const pointerTargets = {
  ...pointerPriorRelease.targets,
  releasePointerIdentityPrior: { commit: pointer.base, files: pointerPriorRelease.current },
};
// Bind only the overlay delta. The eight-owner pointer witness remains unchanged.
const overlayBytes = readFileSync(new URL('./release-pointer-overlay-source.json.gz', import.meta.url));
assert.equal(hash(overlayBytes), 'f4023eb4d2c8540c3a409f78d3acfa191346dfa438d9838f8da86eddf7efe700', 'complete pointer overlay production continuation');
const overlay = JSON.parse(gunzipSync(overlayBytes));
const overlayPaths = ['src/lua/abyss_battle_actions.lua', 'src/lua/abyss_battle_card_gestures.lua'];
assert.equal(overlay.schemaVersion, 1);
assert.equal(overlay.base, '5a86c6c2a3784d28fa819ab7487dd58cc7a778b1');
assert.deepEqual(Object.keys(overlay.before), overlayPaths);
assert.deepEqual(Object.keys(overlay.current), overlayPaths);
for (const path of overlayPaths)
  assert.deepEqual(overlay.before[path], pointerCurrent[path], 'exact pointer overlay predecessor: ' + path);
const overlayCurrent = { ...pointerCurrent, ...overlay.current };
const overlayTargets = {
  ...pointerTargets,
  releasePointerOverlayPrior: { commit: overlay.base, files: pointerCurrent },
};
const overlayOwners = Object.keys(overlayCurrent).sort().filter(path =>
  Object.values(overlayTargets).some(target => target.files[path]?.sha256 !== overlayCurrent[path]?.sha256));
export const sourceEpoch = createSourceEpochProjector(freeze({
  ...pointerPriorRelease, current: overlayCurrent, targets: overlayTargets, owners: overlayOwners,
  currentTreeCommitted: false,
  currentCommit: overlay.base,
  currentCommitRole: 'committed pointer recovery predecessor only; live pointer overlay continuation is bound by exact source bytes',
}), { allowConfigLayout: true, reuseFrozenInput: true });
const proof=sourceEpoch.proof;
// Snapshot consumers must first authenticate every live current owner. This is
// per invocation; neither live reads nor authorization are cached.
export function sourceSlice(path,source,target,readSource=p=>readFileSync(p,'utf8')){
 assert(Object.hasOwn(proof.targets,target),'known closeout source slice');
 const row=Object.hasOwn(proof.current,path)?proof.current[path]:null;
 if(!row||typeof source!=='string'||hash(source.replaceAll('\r\n','\n'))!==row.sha256)return source;
 const before=proof.targets[target].files[path];
 if(!before||before.sha256===row.sha256)return source;
 return sourceEpoch.preCombinedSource(path,source,{target,readSource});
}
