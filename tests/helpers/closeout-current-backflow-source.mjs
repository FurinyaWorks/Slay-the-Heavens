import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {assertCurrentCardReadingScope,beforeCardReadingScope} from './chapter-battle-scene-source.mjs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {beforeRunHudDeckLabel,beforeRunHudMapIcon} from './run-hud-successors.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {readReleaseEntrancePredecessor} from './release-entrance-owner-source.mjs';
import {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';
import {beforeReleaseDeckPointer} from './release-deck-pointer-source.mjs';

const bytes=readFileSync(new URL('../fixtures/closeout-current-backflow-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),
 '41efa054e461b445024797ec8cef4dc66c5275e4cff02e5b6bf0bb50dbcd8bf4','exact current closeout backflow packet');
const {schemaVersion,base,head,files,owners,continuation,sessionRoute,anchorRefactor,actorDetail,tooling,pageReveal,independentFiles,preMasterRelicIcons,reviewedDeckBuild,runHudBuildInputs,toolingCatalogue}=JSON.parse(gunzipSync(bytes));
assert.equal(schemaVersion,1);
assert.equal(base,'903bf2a31e91f10fb24763ab4cea23d586d0bb83');
assert.equal(head,'7228aaa83b0995e1dc6e36955cfd6e773c199f07');
assert.equal(continuation.commit,'3c9837614568f0cd37d926167153727a3f25218e');
const sessionNavigation='src/lua/abyss_game_ui_navigation.lua';
const routePreviewView='src/lua/abyss_game_ui_view.lua';
assert.equal(sessionRoute[sessionNavigation].commit,'d6714eaa617005b3780938a10a9f7a36f22f6565');
assert.equal(sessionRoute[routePreviewView].commit,'4d5928646e0356c893f80e0883160db77f7edad7');
const battleDetailView='src/lua/abyss_battle_info_view.lua';
assert.equal(anchorRefactor.commit,'c7ea71bd084f27a8c5ace07ee8747e40f7e2ad35');
assert.deepEqual(anchorRefactor.before,owners[battleDetailView]);
assert.equal(actorDetail.commit,'cb85a291a83de761e6462d0b98e54c8fc85dc5b8');
const battleDetailContent='src/lua/abyss_battle_info_content.lua';
const splitTooltip={sha256:'e5be45b603c6a38f863d7589c9553ebb52a6c3ec9ab1be6d436cf7fceb1b409b',
 gitBlob:'57a59fac16323440d756b6ed771ef4d87207167d'};
const splitTooltipFixture={
 beforeSha256:actorDetail.owners[battleDetailContent].sha256,
 beforeBlob:actorDetail.owners[battleDetailContent].gitBlob,
 afterSha256:splitTooltip.sha256,afterBlob:splitTooltip.gitBlob,
 hunks:[{at:250,before:'            return M.intentTip(describe.displayedIntent(battle, actor.id))',
  after:[
   '            local enum, damage, times = describe.displayedIntent(battle, actor.id)',
   '            local tip = M.intentTip(enum, damage, times)',
   "            if enum == 'UNKNOWN' and actor.ai and actor.ai.splitEnemy then",
   '                local intent = Combat.intent(battle, info.index)',
   "                if intent and intent.kind == 'split' and intent.id == actor.ai.splitIntent then",
   '                    tip.body = projectedIntent(battle, info.index).text',
   '                end',
   '            end',
   '            return tip',
  ].join('\n')}],
};
const pageRevealPath='src/lua/abyss_page_reveal.lua';
assert.equal(pageReveal.commit,'a25784d9814d0a2daf07a506ba416015ac02ec11');
const cardLayoutPath='src/lua/abyss_battle_card_layout.lua';
const cardReadingOwners=new Set([cardLayoutPath,'src/lua/abyss_battle_card_view.lua','src/lua/abyss_battle_ui.lua']);
const cardReadingCompanions=['src/lua/abyss_viewport.lua','tests/lua/selected_hand_safe_area.lua'];
const relicIconsFixture='tests/official-battle-relic-icons.test.mjs';
assert.equal(preMasterRelicIcons.commit,'b2f74d99a3d80e60b99165b6380987cda8b4488d');
assert.equal(files[relicIconsFixture].successor.commit,
 'dfcc35416f127693b2f0323b8168b0e29590af7d');
assert.equal(tooling.commit,'e65d9b98fbec69442047650254238cd9244df805');
assert.equal(tooling.successor.commit,'73ae746609eef41c192d04e836dc474f0aa9b303');
assert.equal(toolingCatalogue.commit,'4fc24afde58c1def7bd5f61e5271abbbf7d82767');
const catalogueToolingBinding={sha256:toolingCatalogue.afterSha256,gitBlob:toolingCatalogue.afterBlob};

assert.equal(reviewedDeckBuild.reviewed,'637898cbdb81feb3feeda2123536fd1338518d5d');
assert.equal(reviewedDeckBuild.commit,'8d361c49834d3dd6d36cce8410df08d6441b0782');

// #1065 routes Collector to its dedicated throne scene after the exact
// session-route owner. Only the historical Closeout read projects it back.
const groundContactRouteView=Object.freeze({
 beforeSha256:sessionRoute[routePreviewView].sha256,
 beforeBlob:sessionRoute[routePreviewView].gitBlob,
 afterSha256:'817eb3428c3fc0bb081a11015212520f445f018368c2028a8c5e4216747eb178',
 afterBlob:'94addcbe13c7dd643469e0c1bf33062ed27a8a7a',
 hunks:[{at:614,before:[
  '                    local chapter=Acts.forFloor(floor)',
  '                    chapterScene(math.min(2,chapter))',
 ].join('\n'),after:[
  '                    local act=Acts.forFloor(floor)',
  '                    local scene=math.min(2,act)',
  "                    if scene==2 and run.encounterId=='act2_collector' then scene=3 end",
  '                    chapterScene(scene)',
 ].join('\n')}],
});

function readExactOwner(path,binding,read,project){
 if(binding===null){
  assert.throws(()=>read(path,'utf8'),{code:'ENOENT'},'retired closeout owner reappeared: '+path);
  return;
 }
 const raw=read(path,'utf8');
 const live=beforeReleaseClosureFixture(path,readReleaseEntrancePredecessor(path,raw,read));
 const route=path===routePreviewView&&binding.sha256===groundContactRouteView.beforeSha256&&
  binding.gitBlob===groundContactRouteView.beforeBlob;
 const source=route?beforeExactFixture(path,groundContactRouteView,live):live;
 assert(exactSourceMatches(project?project(source):source,binding),'fresh current closeout owner: '+path);
 const lf=raw.replaceAll('\r\n','\n');
 assert(raw===lf||raw===lf.replaceAll('\n','\r\n'),'mixed closeout source line endings: '+path);
 return raw;
}

function restoreFixtureSuccessor(path,row,source){
 const prior=restoreExactFixtureHunks({
  path,beforeSha256:row.afterSha256,afterSha256:row.successor.sha256,hunks:row.successor.hunks,
 },path,source);
 assert(exactSourceMatches(prior,{sha256:row.afterSha256,gitBlob:row.afterBlob}),'exact closeout fixture predecessor: '+path);
 return prior;
}

export function beforeCloseoutHistoryTooling(path,source){
 if(path!==tooling.path)return source;
 const candidate=beforeExactFixture(path,toolingCatalogue,source);
 if(!exactSourceMatches(candidate,tooling.successor))return source;
 source=candidate;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const prior=restoreFixtureSuccessor(path,tooling,source);
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

function restoreFixturePredecessor(path,row,source){
 const prior=restoreExactFixtureHunks({...row,path},path,source);
 assert(exactSourceMatches(prior,{sha256:row.beforeSha256,gitBlob:row.beforeBlob}),'exact current closeout predecessor: '+path);
 return prior;
}

function beforeExactFixture(path,row,source){
 if(!exactSourceMatches(source,{sha256:row.afterSha256,gitBlob:row.afterBlob}))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const prior=restoreFixturePredecessor(path,row,lf);
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

export function beforeCloseoutReviewedDeckBuild(path,source){
 return path===reviewedDeckBuild.path?beforeExactFixture(path,reviewedDeckBuild,source):source;
}

// The master backflow reader authenticates the live HUD build sources first.
export function beforeCloseoutRunHudBuild(path,source){
 return Object.hasOwn(runHudBuildInputs,path)?beforeExactFixture(path,runHudBuildInputs[path],source):source;
}

// The frozen Run HUD reader also feeds the Battle and Actor views. Reuse
// their authenticated Closeout-era fixtures solely when reading old slices.
export function beforeCloseoutRunHudFixture(path,source){
 let row;
 if(path===relicIconsFixture)row=preMasterRelicIcons;
 else if(path==='tests/helpers/m7-core-final-source-inverse.mjs')row=independentFiles[path];
 else return source;
 return beforeExactFixture(path,row,source);
}

function readCloseoutFixture(path,row,read){
 const fixture=read(path,'utf8');
 const reviewedFixture=beforeReleaseClosureFixture(path,readReleaseEntrancePredecessor(path,fixture,read));
 const successorFixture=row.successor;
 const predecessorBinding={sha256:row.afterSha256,gitBlob:row.afterBlob};
 const catalogue=path===tooling.path&&exactSourceMatches(reviewedFixture,catalogueToolingBinding);
 // Restore the reviewed predecessor before reading the original receipt.
 const project=path===battleDetailContent?source=>beforeExactFixture(path,splitTooltipFixture,source)
  :path===reviewedDeckBuild.path?beforeRunHudDeckLabel:source=>beforeRunHudMapIcon(path,source);
 const candidate=catalogue?beforeExactFixture(path,toolingCatalogue,reviewedFixture):project(reviewedFixture);
 const updated=successorFixture!==undefined&&exactSourceMatches(candidate,successorFixture);
 const binding=catalogue?catalogueToolingBinding:updated?successorFixture:predecessorBinding;
 const source=readExactOwner(path,binding,read,project);
 assert.equal(source,fixture,'closeout owner changed during the receipt read: '+path);
 const previous=updated?restoreFixtureSuccessor(path,row,candidate):candidate;
 const prior=restoreFixturePredecessor(path,row,previous);
 return {source,prior};
}

// The immutable pr612 tooling view reads the exact predecessor of the
// current test fixture. Live Joust still executes the current test bytes.
export function beforeCloseoutJoustCiFixture(path,source){
 if(path!=='tests/joust-event.test.mjs')return source;
 const row=files[path];
 if(!exactSourceMatches(source,{sha256:row.afterSha256,gitBlob:row.afterBlob}))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const prior=restoreExactFixtureHunks({...row,path},path,source);
 assert(exactSourceMatches(prior,{sha256:row.beforeSha256,gitBlob:row.beforeBlob}),'exact pr612 Joust fixture predecessor');
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}

const officialLayoutPath='scripts/official-assets-layout.mjs';
const frozenOfficialLayout={
 sha256:'0b6e02f9f98ee6310f556091e416e10716756eb5efd39dc2242ea2012dd694ec',
 gitBlob:'0a51f14283165b1fb867dbb61b877e88473cca3e',
};
function readOfficialLayoutReceipt(read){
 const raw=read(officialLayoutPath,'utf8');
 const source=beforeReleaseDeckPointer(officialLayoutPath,raw);
 if(source===raw)return;
 const archive=readFileSync(new URL('./run-hud-ci-source.json.gz',import.meta.url));
 assert.equal(createHash('sha256').update(archive).digest('hex'),
  '685bddcc6bed77545eadc456f82ed4de10a75402cfcf597533190eb1732cbe3b','immutable Run HUD layout receipt');
 const proof=JSON.parse(gunzipSync(archive));
 assert.equal(proof.base,'903bf2a31e91f10fb24763ab4cea23d586d0bb83');
 const row=proof.files[officialLayoutPath].before;
 assert.equal(row.sha256,frozenOfficialLayout.sha256);
 assert.equal(row.gitBlob,frozenOfficialLayout.gitBlob);
 assert(exactSourceMatches(row.source,frozenOfficialLayout),'exact frozen Closeout layout source');
 return row.source;
}

// These are reads of the original frozen Closeout hashes. Verify the live
// Joust projection's linked production cohort before reconstructing old bytes.
export function readCloseoutCurrentBackflowReceipt(path,digest,read){
 if(path===officialLayoutPath&&digest===frozenOfficialLayout.sha256)return readOfficialLayoutReceipt(read);
 // Test and tooling inputs have their own Git histories and complete byte proofs.
 const independent=path===tooling.path?tooling:Object.hasOwn(independentFiles,path)?independentFiles[path]:null;
 if(independent&&digest===independent.beforeSha256)return readCloseoutFixture(path,independent,read).prior;
 if(!Object.hasOwn(files,path)||files[path].beforeSha256!==digest)return;
 const row=files[path];
 const {source,prior}=readCloseoutFixture(path,row,read);
 // The Guardian subtitle advances five linked sources as one reviewed unit.
 // Its follow-up navigation and route owners advance together. Fresh owner
 // reads select one complete revision and reject mixed revisions.
 const successor=continuation.owners;
 const [markerPath,markerBinding]=Object.entries(successor)[0];
 const marker=read(markerPath,'utf8');
 const guardian=exactSourceMatches(marker,markerBinding);
 const navigation=guardian?read(sessionNavigation,'utf8'):null;
 const session=exactSourceMatches(navigation,sessionRoute[sessionNavigation]);
 const detail=session?read(battleDetailView,'utf8'):null;
 const current=session?{...successor,...sessionRoute}:guardian?successor:{};
 // Actor Detail follows the anchor refactor and advances all four owners.
 const actorRevision=exactSourceMatches(detail,actorDetail.owners[battleDetailView]);
 const content=actorRevision?read(battleDetailContent,'utf8'):null;
 if(actorRevision){
  Object.assign(current,actorDetail.owners);
  if(exactSourceMatches(content,splitTooltip))current[battleDetailContent]=splitTooltip;
 }else if(exactSourceMatches(detail,anchorRefactor.after))current[battleDetailView]=anchorRefactor.after;
 // Local map return was reviewed both with the anchor and with Actor Detail.
 const readPageReveal=Object.hasOwn(current,battleDetailView);
 const reveal=readPageReveal?read(pageRevealPath,'utf8'):null;
 if(exactSourceMatches(reveal,pageReveal.owner))current[pageRevealPath]=pageReveal.owner;
 // The reviewed wide-hand revision inherits the exact Closeout layout. Its
 // card view and battle UI also carry the authenticated production backflow.
 const layout=read(cardLayoutPath,'utf8');
 const priorLayout=beforeCardReadingScope(cardLayoutPath,layout);
 const cardReading=layout!==priorLayout&&exactSourceMatches(priorLayout,owners[cardLayoutPath]);
 if(cardReading){
  for(const companion of cardReadingCompanions)assertCurrentCardReadingScope(companion,read(companion,'utf8'));
 }
 for(const [owner,binding] of Object.entries(owners)){
  const live=cardReading&&cardReadingOwners.has(owner)
   ?assertCurrentCardReadingScope(owner,read(owner,'utf8')):readExactOwner(owner,current[owner]??binding,read);
  if(owner===path)assert.equal(live,source,'closeout owner changed during the receipt read: '+path);
  if(owner===markerPath)assert.equal(live,marker,'closeout owner changed during the receipt read: '+owner);
  if(owner===sessionNavigation&&guardian)assert.equal(live,navigation,'closeout owner changed during the receipt read: '+owner);
  if(owner===battleDetailView&&session)assert.equal(live,detail,'closeout owner changed during the receipt read: '+owner);
  if(owner===battleDetailContent&&actorRevision)assert.equal(live,content,'closeout owner changed during the receipt read: '+owner);
  if(owner===pageRevealPath&&readPageReveal)assert.equal(live,reveal,'closeout owner changed during the receipt read: '+owner);
  if(owner===cardLayoutPath)assert.equal(live,layout,'closeout owner changed during the receipt read: '+owner);
 }
 return prior;
}
