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
 '.github/workflows/licenses.yml':'86f6e0b8b021c1724b96458c13d87cf27b9f758864b9e5147288594b033a9bc6',
 'scripts/arm-auto-merge.mjs':'f9bb0f3615be546dec27376c8acf3ac139fe1e4d0632c5a6b8f1bb1fd4d88248',
 'scripts/publish-merge-group.mjs':'06ae5526a678b0b5f36863b310ac901687251cd9ac9563ce6cf72f14aadedf52',
 'scripts/publish-pr-quality.mjs':'1781a4eccbbab86528f60efc65a541f51117b98433f1fda0add85d946a4eefb3',
 'tests/auto-merge.test.mjs':'20322a7956e61fdf2938eb519dfb83756dbde7b1f3940ba0227e1ca4e4380c81',
 'tests/ci-summary-runners.test.mjs':'4d3654d6309e49bd9a2984e071243659db59223d3cd9c8fe7633665ebf38d7ca',
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

// Reuse the existing immutable archive for historical inputs while authenticating
// exact live source successors, including their current tests.
const sourceSuccessors=Object.freeze({
 'data/presentation/narrative.zh-CN.json':'5db5e77f3789a98e49335bb2443e44f8703ebe349e9e1cd524cfb64a0a3006aa',
 'tests/lore-v2.test.mjs':'2aee46188d476f8ee24b0a736da4d2dcfb214c9f2fe54d5593f1c937a7d67d9f',
 'tests/lua/merchant_dialogue_lifecycle.lua':'25393fa6499858dbbf9551b416aca5930d93426b366c6f6c5123ee611bf3cb06',
 'scripts/check-task-intake.mjs':'972cbe675515a1fd4f7866170c37bd7568b94c6dbeca1e7bf340e46742e42029',
 'tests/sprint-intake.test.mjs':'daeabe161a8a7996b9961b46c37775ffb0e07639a4b34ab32f84f7a658d65929',
 'scripts/backlog-metadata.mjs':'082c419cbd0e20eae4ec4cb36f93541af3149f686dd064f06f5a12c983e27933',
 'scripts/verify-backlog-roadmap.mjs':'1d535b694c4d6a6d62cef7c973105fe02d48c55dc3e109e5f3eab0ebcdd3affb',
 'tests/backlog-roadmap.test.mjs':'b4a523a6a7763e825804404a270da6a401a17b59b9855b701a82cb8571f3b17d',
 'tests/helpers/combined-epoch/source-epoch-runtime.mjs':'55db2a893bb6ac20d3ec42d41d9e6396d51acd783c974bd573e5b4ce3443fc99',
 'tests/helpers/copy-integration-source-closure.mjs':'32c95e4329b981215af447d2b49ed80712a6acbeb27848200c920af8ee3eeaf2',
 'tests/ci-complete-calibration.test.mjs':'0581fa1b5e5e7735a85337a02c7ad9a5826cc59c36b56d4233da1d34924ad268',
 'tests/integration-source-epoch.test.mjs':'52c1cb8227f7849a1757d531c82611d36f7d73cad3462185599d18b9be096440',
 'tests/defect-actor-boundary.test.mjs':'bd3deb3006a06adb5b8cb5f1bbda90a354882b015d5a57bd1c1623df35dfb039',
 'tests/defect-final-source-epoch.test.mjs':'c5d27da04e6430a3bb4da253075cf0b7fe5baf5599c86dad8d9b922eafb72651',
 'tests/encounter-formation-source-epoch.test.mjs':'1a624e24e88927828d3d09012145046bcc0317c99757c6aa2d8b30e4ff55e399',
 'tests/room-ui-source-epoch.test.mjs':'230214c3b5f21e8f440c21178afd5636fc1219b528bfb2fffe446150e15e1d20',
 'tests/watcher-actor-boundary.test.mjs':'1954759b210bc333d65550e9abda023e0fe5aaa9b7253ce6aa1ea1939cabc909',
 'tests/helpers/replay-reviewed-selection.mjs':'47ba348e9a26348b1ed0255cd16bb9099cf5767986a70a28f2f132c39f4c278d',
});
const archiveFiles=JSON.parse(gunzipSync(integratedCiBytes)).files;
function beforeIntegrationSuccessor(path,source){
 if(!Object.hasOwn(sourceSuccessors,path)||typeof source!=='string'||source.includes('\r\r\n')
   ||hash(normalize(source))!==sourceSuccessors[path])return source;
 const prior=archiveFiles[path].current;
 assert.equal(hash(prior.source),prior.sha256,'immutable integration predecessor: '+path);
 return source.includes('\r\n')?prior.source.replaceAll('\n','\r\n'):prior.source;
}
export function assertIntegrationSuccessorsCurrent(read=readFileSync){
 for(const [path,sha] of Object.entries(sourceSuccessors)){
  const source=read(path,'utf8');
  assert(typeof source==='string'&&!source.includes('\r\r\n')&&hash(normalize(source))===sha,'fresh complete integration source: '+path);
 }
}
export function beforePreflightSource(path,source,view='prior'){
 source=beforeCharacterPreparationCiSource(path,source);
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
