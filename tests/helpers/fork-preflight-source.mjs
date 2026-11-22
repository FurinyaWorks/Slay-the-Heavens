import {beforeReleaseShopEntry,shopEntryPriorRead} from './release-ui-restore-source.mjs';
import {beforeCombatVisualSource,combatVisualPriorRead} from './combat-visual-source.mjs';
import {beforeSts1MenuCiSource} from './sts1-menu-ci-source.mjs';
import {assertRefinedReleaseSourcesCurrent,beforeRefinedReleaseCiSource,beforeRefinedReleaseJsInventory,refinedReleaseHistoricalInput} from './refined-release-source.mjs';
import {beforeV2UiAdmission} from './v2-ui-admission-ci-source.mjs';
import {beforeV2UiEvidence,beforeV2UiPreTinyHouseSource} from './v2-p1-ci-source.mjs';
import {beforeCharacterPreparationCiSource} from './character-preparation-source.mjs';
import {integratedCiBytes} from './integrated-ci-binding.mjs';
import {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';
// Full-source continuation for historical contracts; no partial/foreign projection.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('./fork-preflight-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'c6a6e34e8201b22b4c82fa554502785af7dc5f63840189e9c53da7692a55565e');
const proof=JSON.parse(gunzipSync(bytes));
for(const row of Object.values(proof.files)){
 if(row.before===null)assert.equal(row.beforeSha,null,'explicitly absent historical source');
 else assert.equal(hash(row.before),row.beforeSha);
}
assert.equal(proof.nativePredecessorCommit,'187a7db55c47b91ee0037486c1e3918f9541f11a');
assert.equal(proof.releaseBootstrapCommit,'873d4392c02fd5ac92e653e57a78fd59f6ae63c6');
for(const [path,row]of Object.entries(proof.files))if(row.releaseBootstrapBefore){
 const prior=row.releaseBootstrapBefore;
 assert.equal(hash(prior.source),prior.sha256,path+' complete Release predecessor');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(prior.source)}\0`).update(prior.source).digest('hex'),prior.gitBlob,path);
}
const currentHashes=Object.freeze({
 '.github/workflows/quality.yml':'5975715d9b983b6c586aa88be78e950358ff833c6ec7a73f1843fdf420d4cb6c',
 '.github/workflows/licenses.yml':'a27f39914855cbecebf6ee7285ff9744fa394d0a85b5fb89dfcc915e83b55d8d',
 'scripts/arm-auto-merge.mjs':'f9bb0f3615be546dec27376c8acf3ac139fe1e4d0632c5a6b8f1bb1fd4d88248',
 'scripts/ci-impact.mjs':'87dfdb1166cf6b0bab59164b472ee580a3fa3651b5d137d6b569ff0da03d57c9',
 'scripts/merge-queue-admission.mjs':'c07a727b7782e8da6211317eeb21b074eb618b4bb2757366f8f8aed0b68955c8',
 'scripts/publish-merge-group.mjs':'06ae5526a678b0b5f36863b310ac901687251cd9ac9563ce6cf72f14aadedf52',
 'scripts/publish-pr-quality.mjs':'e918f7bb12474f60a5272e72d285e22bb207765e098847ff726cb54621b277f7',
 'scripts/test-affected.mjs':'b89c6a4ba5a72640abfcc65d0ec3bd6ac60763305e5ed5fd1d5f4fb8bc8205e1',
 'tests/auto-merge.test.mjs':'f0c1597a357cbfd20f23186aa53c0670c5fa82e4b37b8d755a1e57d09a3def4c',
 'tests/ci-impact.test.mjs':'0095b9acc0c9c377704b05f3029e74302474256f8a434417dd5c0678b96caa1d',
 'tests/ci-summary-runners.test.mjs':'4d3654d6309e49bd9a2984e071243659db59223d3cd9c8fe7633665ebf38d7ca',
 'tests/merge-queue-admission.test.mjs':'f1fd68ea13b9a1fbea02431d4e10e7b6a121760c56de2b6d351aa43949d350cd',
 'tests/merge-queue.test.mjs':'083d1b134bcf73abbbd5fdbe1783358992fb99fdb5b7d87d1a33e94d22b6ccbd',
 'tests/quick-feedback.test.mjs':'ef3a2a86ebdd206ccb7bc83501465a0f3ea4a9e02ff41cb6bd406aaccd146e0c',
});
const transportBytes=readFileSync(new URL('./ci-media-transport-source.json.gz',import.meta.url));
assert.equal(hash(transportBytes),'56f69f4abc8687edd75d2087dfa890f94cf8d5f1d67fe2450338a0d2258355b2','complete CI media transport predecessor');
const transport=JSON.parse(gunzipSync(transportBytes));
assert.equal(transport.schemaVersion,1);
assert.equal(transport.base,'fe878280c74eb0461f6f1212b34e50550b80b681');
for(const [path,row] of Object.entries(transport.files)){
 assert.equal(hash(row.before),row.beforeSha,path+' complete media transport predecessor');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before)}\0`).update(row.before).digest('hex'),row.gitBlob,path);
}
const normalize=s=>s.replaceAll('\r\n','\n');
// Keep earlier CI observations bound to the Release baseline while current
// tests execute the approved default and frozen candidate paths.
const releaseUiBuildBytes=readFileSync(new URL('./release-ui-build-ci-source.json.gz',import.meta.url));
assert.equal(hash(releaseUiBuildBytes),'e7a41ad3a06b8fa264aaad151a8b12e9c399f78a35183a35d9ed3f655abae044');
const releaseUiBuild=JSON.parse(gunzipSync(releaseUiBuildBytes));
assert.equal(releaseUiBuild.base,'ff6af63d9bf93056dd772347d10dc749e7fa8d34');
const blob=source=>createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0${source}`).digest('hex');
for(const {before,after} of Object.values(releaseUiBuild.files)){
 assert.equal(hash(before.source),before.sha256);
 assert.equal(blob(before.source),before.gitBlob);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
// Preserve the exact historical copier and regression source after Traveler status coverage.
function beforeTravelerStatusCiSource(path,source){
 const copier=path==='tests/helpers/copy-integration-source-closure.mjs';
 const regression=path==='tests/integration-source-epoch.test.mjs';
 if((!copier&&!regression)||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const lf=normalize(source),sha=hash(lf);
 let prior,expected;
 if(copier&&sha==='2c468260f8ca242e3a9e2d3d683616b45cca8ac6ad962388d7e0c5c0ceb2f85a'){
  prior=lf.replace(/const travelerStatusFiles=Object\.freeze\(\{[\s\S]*?^\}\);\n/m,'')
   .replace('Object.entries(travelerStatusFiles))','Object.entries(loadingRecoveryFiles))');
  expected='eb6e433e3a66f62e4b5aece6f475322cbf3d6d68e6d5e85107676cdff98719ac';
 }else if(regression&&sha==='e411b5d46c2bde12ef10d0615abaeacee3bc83d6c72221aa212cb3e708494089'){
  prior=lf.replace("import {beforeTravelerStatusSource,travelerStatusSourcePaths} from './helpers/traveler-status-source.mjs';\n",'')
   .replace(/^test\('Traveler status continuation[^\n]*\n[\s\S]*?^\}\);\n\n/m,'');
  expected='db962d7fe34be9e68f12ee153be9ef6679135e0803d28fb0db0db8a3d3fba0f4';
 }else return source;
 assert.equal(hash(prior),expected,'exact Traveler status CI predecessor: '+path);
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

// Authenticate the current copier before giving old CI receipts its exact predecessor.
function beforeLoadingRecoveryCopier(path,source){
 if(path!=='tests/helpers/copy-integration-source-closure.mjs'||typeof source!=='string'||source.includes('\r\r\n'))return source;
 let lf=normalize(source);
 if(hash(lf)==='6eaac416afd6b25c2949cc5bb7b011d573e7fc9012f5cac3b7387d5988b4ae54'){
  lf=lf.replace(" 'tests/helpers/release-map-deck-source.mjs':'675e7f011f5481b8a1bbf0112762c2ee9c7c757ec6401c04032e2ab610f30345',", " 'tests/helpers/release-map-deck-source.mjs':'c661e5dfa5035a09a47935bd7bfbc3e1f37b992d809bc7387d93e757c3df6fd5',");
  assert.equal(hash(lf),'2c468260f8ca242e3a9e2d3d683616b45cca8ac6ad962388d7e0c5c0ceb2f85a','exact Forethought helper copy predecessor');
 }
 if(hash(lf)==='eb6e433e3a66f62e4b5aece6f475322cbf3d6d68e6d5e85107676cdff98719ac'){
  lf=lf.replace(" 'tests/helpers/energy-reference-source.mjs':'eda0da3e4206a76c9bfe2b48a040e24c217a9b2f1416a673b728c03c4da4a2b7',\n",
   " 'tests/helpers/energy-reference-source.mjs':'a8db68450b733114e4b5cb9c345d6d7935b9309e150e4ce7717e9c833e4df0ad',\n")
   .replace(" 'tests/fixtures/release-reward-frame-source.json.gz':'09f99aff296875fa9787a94bfd6be19c1a4d76dcb9a33fd6b1f31213d10cd8a5',\n",'');
  assert.equal(hash(lf),'92da908833bf36c0c924b5752c582c78302cd794b53f01eedb49fbb5956d3f4c','exact reward frame helper copy predecessor');
 }
 if(hash(lf)!=='92da908833bf36c0c924b5752c582c78302cd794b53f01eedb49fbb5956d3f4c')return source;
 const prior=lf.replace(/const loadingRecoveryFiles=Object\.freeze\(\{[\s\S]*?^\}\);\n/m,'')
  .replace('Object.entries(loadingRecoveryFiles))','Object.entries(refinedReleaseFiles))');
 assert.equal(hash(prior),'42a2fae24acaca0ff0214e5e0e592b2ff4cfd7f1e506578ba36faf327d17ae87','exact loading recovery helper copy predecessor');
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

function beforeRefinedReleaseCopier(path,source){
 if(path!=="tests/helpers/copy-integration-source-closure.mjs"||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const lf=normalize(source);
 if(hash(lf)!=="7aa6c9e75928548fced7107e38ef05b787e4a63c661fa4ab124dd1a8ce06314b")return source;
 const prior=lf.replace("// Refined enemy art extends only the existing historical helper closure.\nconst refinedReleaseFiles=Object.freeze({\n ...releaseUiFiles,\n 'tests/helpers/release-ui-restore-source.mjs':'26d8b8099e6b8f6fb30869479dcbcac90ff8c77ea04bc80ab4f8ad25c8bc8be3',\n 'tests/helpers/release-forge-source.json.gz':'8557c9daa0943c815ca11e0c135d081c08081f040bbef85b3cd799f7a586c564',\n 'tests/helpers/refined-release-source.mjs':'154f5464849177b48426db7d816f4ddf87d9d26abd6bfcfb543162b4f26450d9',\n 'tests/helpers/refined-release-source.json.gz':'6b9e66890ecfeac7f0b581ece462edaf41095f6d2937896cf6032e9e8ee9a9a3',\n});\n",'').replace("Object.entries(refinedReleaseFiles))","Object.entries(releaseUiFiles))");
 assert.equal(hash(prior),"810c7ddebb21d62e26730d225ba218c33aa009656fee38929ee2881821ea813b",'exact refined Release helper copy predecessor');
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
// Restore the previous exact copy contract before its own historical projection.
function beforeShopEntryCopier(path,source){
 if(path!=='tests/helpers/copy-integration-source-closure.mjs'||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const lf=normalize(source);
 if(hash(lf)!=='42a2fae24acaca0ff0214e5e0e592b2ff4cfd7f1e506578ba36faf327d17ae87')return source;
 const prior=lf.replace(" 'tests/helpers/release-shop-entry-source.json.gz':'d3c114b39aa8affa1ae5c2b3ee54117640dcacce750efc24d78312792d8d2ff7',\n",'').replace(" 'tests/helpers/release-ui-restore-source.mjs':'37410ec175d07b09c8dd8062ac2e19d212dc8eeaebc32f38dbf99e7b32d8b7dd',"," 'tests/helpers/release-ui-restore-source.mjs':'26d8b8099e6b8f6fb30869479dcbcac90ff8c77ea04bc80ab4f8ad25c8bc8be3',");
 assert.equal(hash(prior),'6da6f0f4defe5d10ec161a626d020ecd22d6f651d0e35c2ba941907f579337a6','exact shop entry helper copy predecessor');
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
function shopEntryPreflightRead(read){
 const prior=shopEntryPriorRead(read);
 return (path,...args)=>beforeShopEntryCopier(path,beforeLoadingRecoveryCopier(path,beforeTravelerStatusCiSource(path,prior(path,...args))));
}
function beforeReleaseUiBuildSource(path,source){
 source=beforeTravelerStatusCiSource(path,source);
 source=beforeShopEntryCopier(path,beforeReleaseShopEntry(path,beforeLoadingRecoveryCopier(path,source)));
 source=beforeCombatVisualSource(path,source,shopEntryPreflightRead(owner=>readFileSync(owner,'utf8')));
 source=beforeSts1MenuCiSource(path,source);
 source=beforeRefinedReleaseCiSource(path,beforeRefinedReleaseCopier(path,source));
 if(!Object.hasOwn(releaseUiBuild.files,path)||typeof source!=='string'||source.includes('\r\r\n'))return source;
 const text=normalize(source),{before,after}=releaseUiBuild.files[path];
 if(hash(text)!==after.sha256||blob(text)!==after.gitBlob)return source;
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}
export function beforeReleaseTinyHouseSource(path,source){
 return beforeV2UiPreTinyHouseSource(path,beforeReleaseUiBuildSource(path,source));
}
export function historicalReleaseBuildInput(path,read){
 if(!Object.hasOwn(releaseUiBuild.files,path))return refinedReleaseHistoricalInput(path,read);
 const source=read(path,'utf8'),prior=beforeReleaseUiBuildSource(path,source);
 assert.notEqual(prior,source,'fresh approved build source: '+path);
 return prior;
}
const coopLabCiBytes=readFileSync(new URL('./coop-lab-ci-predecessors.json.gz',import.meta.url));
assert.equal(hash(coopLabCiBytes),'e55c26c3dbc7cde22ae4e47de876f205b47bdbfc30dc469830fe0ae9255285dc','complete co-op lab CI predecessors');
const coopLabCi=JSON.parse(gunzipSync(coopLabCiBytes));
assert.equal(coopLabCi.base,'ecf54a29a54228e058238fbbc8716a665a3021d6');
for(const row of Object.values(coopLabCi.files))assert.equal(hash(row.before),row.beforeSha);
function beforeCoopCiSource(path,source){
 source=beforeV2UiEvidence(path,beforeReleaseUiBuildSource(path,source));
 const row=Object.hasOwn(coopLabCi.files,path)?coopLabCi.files[path]:null;
 if(!row || typeof source!=='string' || source.includes('\r\r\n') || hash(normalize(source))!==row.afterSha)return source;
 return source.includes('\r\n')?row.before.replaceAll('\n','\r\n'):row.before;
}
const coopLabTest='tests/coop-primitive-lab.test.mjs';
const coopLabTestSha='93a22f446fec66df1339fc135071c929a3cc07d0c2473424510842af689d18dc';
function assertCoopJsInventory(paths,preceding,read){
 const current=[...preceding,coopLabTest].sort();
 assert.deepEqual([...paths].sort(),current,'complete current raw discovery inventory');
 const testSource=read(coopLabTest,'utf8');
 assert(typeof testSource==='string'&&!testSource.includes('\r\r\n')&&
  hash(normalize(testSource))===coopLabTestSha,'fresh added inventory source: '+coopLabTest);
}
const shopEntryTests={
 js:['tests/shop-entry.test.mjs','3b687d1afb6ee83dc7103bc4c074e990a748a96ef55c4cba326498a5ed2d1919'],
 lua:['tests/lua/shop_entry.lua','85547fda98f035ff78a0cebdf56e91ba43899f0579d706c4cb045e13a55f6259'],
};
function beforeAddedTest(paths,[path,sha],read){
 const position=paths.indexOf(path);
 if(position===-1)return paths;
 assert.equal(paths.lastIndexOf(path),position,'duplicate inventory source: '+path);
 const source=read(path,'utf8');
 assert(typeof source==='string'&&!source.includes('\r\r\n')&&hash(normalize(source))===sha,'fresh added inventory source: '+path);
 return paths.filter(test=>test!==path);
}
export function beforeShopEntryInventory(paths,kind,read=readFileSync){
 if(kind==='lua')paths=beforeAddedTest(paths,['tests/lua/traveler_power_tooltip.lua','35363665f69113883246aa33984d4ab17eba727a87476256a617dc0f42dd45f7'],read);
 return beforeAddedTest(paths,shopEntryTests[kind],read);
}
export function assertCurrentJsInventory(paths,preceding,read=readFileSync){
 paths=beforeRefinedReleaseJsInventory(beforeShopEntryInventory(paths,'js',read),[...preceding,coopLabTest],read,true);
 assertCoopJsInventory(paths,preceding,read);
}
export function beforeCoopJsInventory(paths,preceding,read=readFileSync){
 paths=beforeRefinedReleaseJsInventory(beforeShopEntryInventory(paths,'js',read),[...preceding,coopLabTest],read);
 if(!paths.includes(coopLabTest))return paths;
 assertCoopJsInventory(paths,preceding,read);
 return paths.filter(path=>path!==coopLabTest);
}
const closeoutSuccessors=Object.freeze({
 'scripts/ci-shards.mjs':'6becba66be6048f090cd0036c2e5292f180d9010bbe24aef181977dca18fdeb3',
 'tests/defect-integration-source.test.mjs':'e20ed02229b4e316bce92decaec45037eeceb8116f31216b8970c7964674f1c0',
 'tests/defect-utility-planning.test.mjs':'b93215b0cece7151a1929d0535c40595f7a3d9586f237ba0a3966f52687142c1',
 'tests/art-feature-source-inverse.test.mjs':'6627174ae56ab48b831a69e947fa30fb355879095d35f5cdd92b4ae641d1d1dd',
 'scripts/check-architecture.mjs':'328658e71bcb57a2fcf1455e8daa6b31ad15ca1ae1078158ac91bd5b6931befa',
 'scripts/check-quality-ratchet.mjs':'a8d2d90d5767a499c80d44214375400983611c4f9aad3739bada901b59f0b9ce',
 'tests/architecture.test.mjs':'31db85476a8c725950c5e58926edd7cfcfedd493469a56531ecef840d64e547d',
});

// Reuse the existing immutable archive for historical inputs while authenticating
// exact live source successors, including their current tests.
const sourceSuccessors=Object.freeze({
 // Bind the v2.0.0 candidate metadata without rewriting any archived view.
 'package.json':'f1b1fa527b0a019901c4aa48789a52df9efd31e00f7b4c0ca19057efc2fae15a',
 'package-lock.json':'4324b6b6d38e7c8dc3d8d00a374663cf4eaf27e02f72ca4eebd51a63414c2436',
 '.release-please-manifest.json':'9e38a481f52b5af8537babca8f5d13d5a0ab72473e1deba2e1aeb71e05dcd5b9',
 'CHANGELOG.md':'50a35daf679051577ce4cc49709a6914ecd01378294ef76b06057541046808f8',
 'docs/legal/assets.json':'1092785bd84163abd9ba779f6447807513c3ddf1bb8c0787584a93b1fb468b70',
 'scripts/official-portraits.mjs':'03d4ea596257e87e4d3ea3f22fc1f1e938f516b8d20c4e9983aceeb51d5b5186',
 'tests/lumine-idle.test.mjs':'183cc0be21ca7a757e3cde25529064a62d5315915e88c3427412786e9ad69e09',
 'tests/official-assets.test.mjs':'455ab9407e88aa5be83ec0900ee6f60321acbbad859fc2bdf59b11183b868f8c',
 'tests/official-portraits-build.test.mjs':'06280b8717f0c0194479cab956e3fea53d00b7d26c06f3fbb37b1152224e4a63',
 'tests/build-ui-input-protection.test.mjs':'ee2171a48378827f623bed2795c7924c5cf1c2548fecc1dfce016cb4e9620318',
 'tests/v25-portrait-profile.test.mjs':'def7e70b4e64fbb5a901407ade2a379af647220afc900de2b4f550ee7c214403',
 'data/presentation/narrative.zh-CN.json':'5db5e77f3789a98e49335bb2443e44f8703ebe349e9e1cd524cfb64a0a3006aa',
 'tests/lore-v2.test.mjs':'2aee46188d476f8ee24b0a736da4d2dcfb214c9f2fe54d5593f1c937a7d67d9f',
 'tests/lua/merchant_dialogue_lifecycle.lua':'25393fa6499858dbbf9551b416aca5930d93426b366c6f6c5123ee611bf3cb06',
 'scripts/check-task-intake.mjs':'972cbe675515a1fd4f7866170c37bd7568b94c6dbeca1e7bf340e46742e42029',
 'tests/sprint-intake.test.mjs':'daeabe161a8a7996b9961b46c37775ffb0e07639a4b34ab32f84f7a658d65929',
 'scripts/backlog-metadata.mjs':'082c419cbd0e20eae4ec4cb36f93541af3149f686dd064f06f5a12c983e27933',
 'scripts/backlog-closeout.mjs':'f732936568466ee86ddfd9735e318a9f03284caa2f45abffd66b319cca58d8b5',
 'scripts/verify-backlog-roadmap.mjs':'1d535b694c4d6a6d62cef7c973105fe02d48c55dc3e109e5f3eab0ebcdd3affb',
 'tests/backlog-roadmap.test.mjs':'b4a523a6a7763e825804404a270da6a401a17b59b9855b701a82cb8571f3b17d',
 'tests/delivery.test.mjs':'f74b528375f1f487985a4c108687cd62b61fccb2a23070bb5810205fb69cfc2a',
 'tests/helpers/combined-epoch/source-epoch-runtime.mjs':'c875f2290f59590c6b06e851b627dcac3d684a4e288f6ae88ff839cb3b79c017',
 'tests/helpers/closeout-source-epoch.mjs':'5c47cf4cfa424551010f1e12f39fc84363ad77c93733c4f3d3e8932e00e1c4c9',
 'tests/helpers/copy-integration-source-closure.mjs':'c0a43b2cfca0c01bc6608fbd4f8bcd279c4d91c3d839d92654daf0513bc6d2f3',
 'tests/ci-complete-calibration.test.mjs':'0581fa1b5e5e7735a85337a02c7ad9a5826cc59c36b56d4233da1d34924ad268',
 'tests/integration-source-epoch.test.mjs':'52c1cb8227f7849a1757d531c82611d36f7d73cad3462185599d18b9be096440',
 'tests/defect-actor-boundary.test.mjs':'bd3deb3006a06adb5b8cb5f1bbda90a354882b015d5a57bd1c1623df35dfb039',
 'tests/defect-final-source-epoch.test.mjs':'c5d27da04e6430a3bb4da253075cf0b7fe5baf5599c86dad8d9b922eafb72651',
 'tests/encounter-formation-source-epoch.test.mjs':'1a624e24e88927828d3d09012145046bcc0317c99757c6aa2d8b30e4ff55e399',
 'tests/room-ui-source-epoch.test.mjs':'230214c3b5f21e8f440c21178afd5636fc1219b528bfb2fffe446150e15e1d20',
 'tests/watcher-actor-boundary.test.mjs':'1954759b210bc333d65550e9abda023e0fe5aaa9b7253ce6aa1ea1939cabc909',
 'tests/helpers/replay-reviewed-selection.mjs':'47ba348e9a26348b1ed0255cd16bb9099cf5767986a70a28f2f132c39f4c278d',
 ...closeoutSuccessors,
});
const archiveFiles=JSON.parse(gunzipSync(integratedCiBytes)).files;
let closeoutPredecessors;
function closeoutPredecessor(path){
 assert(Object.hasOwn(closeoutSuccessors,path),'registered closeout CI successor: '+path);
 if(!closeoutPredecessors){
  const archive=readFileSync(new URL('./closeout-ci-source.json.gz',import.meta.url));
  assert.equal(hash(archive),'cfc72306af30d0d4b0b61398e3ed0eea36767d6e005c146eb215897fc431a8f8','immutable closeout CI sources');
  const {current,records}=JSON.parse(gunzipSync(archive));
  closeoutPredecessors=new Map(Object.keys(closeoutSuccessors).map(file=>{
   const sha256=current[file];
   assert.match(sha256??'',/^[a-f0-9]{64}$/,'archived closeout predecessor: '+file);
   return [file,{sha256,source:records[sha256]}];
  }));
 }
 return closeoutPredecessors.get(path);
}
function beforeIntegrationSuccessor(path,source){
 if(!Object.hasOwn(sourceSuccessors,path)||typeof source!=='string'||source.includes('\r\r\n')
   ||hash(normalize(source))!==sourceSuccessors[path])return source;
 const prior=archiveFiles[path]?.current??closeoutPredecessor(path);
 assert.equal(hash(prior.source),prior.sha256,'immutable integration predecessor: '+path);
 return source.includes('\r\n')?prior.source.replaceAll('\n','\r\n'):prior.source;
}
export function assertIntegrationSuccessorsCurrent(read=readFileSync){
 read=shopEntryPreflightRead(read);
 assertRefinedReleaseSourcesCurrent(read);
 read=combatVisualPriorRead(read);
 for(const [path,row] of Object.entries(coopLabCi.files)){
  const source=beforeV2UiEvidence(path,beforeReleaseUiBuildSource(path,read(path,'utf8')));
  assert(typeof source==='string'&&!source.includes('\r\r\n')&&hash(normalize(source))===row.afterSha,'fresh complete integration source: '+path);
 }
 for(const [path,sha] of Object.entries(sourceSuccessors)){
  const source=beforeV2UiAdmission(path,beforeCoopCiSource(path,read(path,'utf8')));
  assert(typeof source==='string'&&!source.includes('\r\r\n')&&hash(normalize(source))===sha,'fresh complete integration source: '+path);
 }
}
export function beforePreflightSource(path,source,view='prior'){
 source=beforeCharacterPreparationCiSource(path,beforeV2UiAdmission(path,beforeCoopCiSource(path,source)));
 source=beforeIntegrationSuccessor(path,source);
 // Only the exact flag-registry successor enters the earlier Release witness.
 if(view==='release-bootstrap'&&path==='scripts/ui-profile.mjs'&&typeof source==='string'&&!source.includes('\r\r\n')
  &&hash(normalize(source))==='b45c87c321573e91d3c8e838e837e3db839d79d2758459a67543b763df8c1734'){
  const prior=stsStylePriorRuntime.files[path];
  assert.equal(prior.sha256,'2df6c3fd8f16f41a36db51bd76bdd53f2e805ee92a35ca0d03e91f50d93dfdd3','archived candidate policy predecessor');
  return prior.source;
 }
 const transportRow=Object.hasOwn(transport.files,path)?transport.files[path]:null;
 if(transportRow&&['prior','release-bootstrap'].includes(view)&&typeof source==='string'&&
  !source.includes('\r\r\n')&&hash(normalize(source))===transportRow.currentSha)
  source=source.includes('\r\n')?transportRow.before.replaceAll('\n','\r\n'):transportRow.before;
 const row=Object.hasOwn(proof.files,path)?proof.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(normalize(source))!==(Object.hasOwn(currentHashes,path)?currentHashes[path]:row.currentSha))return source;
 assert(['prior','release-bootstrap'].includes(view),'explicit preflight predecessor view');
 const prior=view==='release-bootstrap'?row.releaseBootstrapBefore?.source:row.before;
 // Newly introduced gates have no historical implementation to invent or hide.
 if(prior===undefined||prior===null)return source;
 const eol=source.includes('\r\n')?'\r\n':'\n';return prior.replaceAll('\n',eol);
}
export function preflightPriorRead(read=readFileSync,view='prior'){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=beforePreflightSource(path,text,view);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
