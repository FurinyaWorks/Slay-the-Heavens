// Copies only immutable test helper dependencies; production owners remain explicit fixtures.
import assert from 'node:assert/strict';
import {officialUiRepairClosure} from './official-ui-repair-closure.mjs';
import {feedbackCiPatch} from './sts-feedback-ci.mjs';
import {extendFeedbackHelperClosure} from './sts-feedback-source-runtime.mjs';
import {extendIntegratedHelperClosure} from './integrated-ci-source.mjs';
import {readFileSync,writeFileSync,mkdirSync,realpathSync,existsSync} from 'node:fs';
import {join,dirname,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
// Git source identities use LF; binary witnesses (especially gzip) retain
// their exact bytes. Never decode an arbitrary helper dependency as text.
export function integrationClosureBytes(path,content){
 assert(Buffer.isBuffer(content),'helper closure requires bytes');
 if(!/\.(?:mjs|js|json|lua|md|yml|yaml)$/.test(path))return content;
 const text=content.toString('utf8');
 assert(Buffer.from(text).equals(content),'helper source must be valid UTF-8: '+path);
 return Buffer.from(text.replaceAll('\r\n','\n'));
}
const bytes=readFileSync(new URL('./integration-source-closure.json',import.meta.url));
assert.equal(hash(bytes),'800fcc9efd889f482259d0e1e9f1501f0e9597ac05552622ede00dd3dcdb4a94','complete integration helper closure identity');
const currentBytes=readFileSync(new URL('./closeout-source-closure.json',import.meta.url));
assert.equal(hash(currentBytes),'031c42758ec5b37d1782c5fdb70542358d4b2631a5ee9b486b6bb5faccc988b5','complete closeout source helper closure');
const files={...extendIntegratedHelperClosure(extendFeedbackHelperClosure(JSON.parse(currentBytes),feedbackCiPatch.helperClosure))};
export const mobileHandHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'0e8a0ef651c3a0b684db93d1a6ea1db8884b539df4db28c695547f1a8c6c74b2'},
 {path:'tests/helpers/mobile-hand-source.mjs',before:null,after:'afb152f8e579c530b412319c3bcc2df6658e90bb9a13e4c6ccb02dbc38c6ce40'},
 {path:'tests/helpers/mobile-hand-source.json.gz',before:null,after:'f09812ac4f7c422d8a4530a8efa9ca0e35048eb1a2f4a7940495d76495f5ee4c'}
];
export const releaseSelectionMapHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'9bc2594f88cd780a31a429f5a493568f076d039ab92f55b952631b586ce335c1'},
 {path:'tests/helpers/release-selection-map-source.mjs',before:null,after:'920fd01fa07dad36ed7e9b70ace199246000d87ad20c258221a2aca4a8e0ee52'},
 {path:'tests/helpers/release-selection-map-source.json.gz',before:null,after:'0c056c020ad655d5a2a901a6f196350582eaf0709afa736f363a0d68509daf62'}
];
for(const row of releaseSelectionMapHelperCopies){assert.equal(files[row.path]??null,row.before,'exact release selection map helper-copy predecessor: '+row.path);files[row.path]=row.after;}
// The original hand descriptor remains an immutable historical domain.
// Current copies retain both production leaves; outer union owns closeout.
for(const row of mobileHandHelperCopies.filter(row=>!row.path.endsWith('closeout-source-epoch.mjs'))){assert.equal(files[row.path]??null,row.before,'exact hand leaf copy predecessor: '+row.path);files[row.path]=row.after;}
export const handPost697HelperCopies=[{"path":"tests/helpers/closeout-source-epoch.mjs","before":"9bc2594f88cd780a31a429f5a493568f076d039ab92f55b952631b586ce335c1","after":"560d7e2746766f12267a93bc171a8e015b776cec9ae5e843dbd42c9f4616a381"},{"path":"tests/helpers/hand-post697-source.mjs","before":null,"after":"80caf6f9965921670a796992a747439217cfd2cee969e8e2fb2f238201d06d4c"},{"path":"tests/helpers/hand-post697-source.json.gz","before":null,"after":"7d531647cb94d560e821f63032ac123772a647c3f604578e2470412304cd8509"}];
for(const row of handPost697HelperCopies){assert.equal(files[row.path]??null,row.before,'exact hand post697 helper predecessor: '+row.path);files[row.path]=row.after;}
export const enemyGeometryHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'ba08a39270805524521cb4751ff2bfd8ba142713b688e01af803315c51339419'},
 {path:'tests/helpers/enemy-geometry-source.mjs',before:null,after:'7f3c4d9309537e5bfcc6af807f11c955968d572bffb856857a1104a24a2ce982'},
 {path:'tests/helpers/enemy-geometry-source.json.gz',before:null,after:'af5ac18b5bb3346fe000d22a184e04b8d064d38e723bd328a06cdf1b37fecfae'}
];
export const enemyPost697HelperCopies=[{"path":"tests/helpers/closeout-source-epoch.mjs","before":"ba08a39270805524521cb4751ff2bfd8ba142713b688e01af803315c51339419","after":"4866898adebc7f798ab4c7f72d0f2cd2f6fbfc4d875ed4df97a9639a65d7182b"},{"path":"tests/helpers/release-selection-map-source.mjs","before":null,"after":"920fd01fa07dad36ed7e9b70ace199246000d87ad20c258221a2aca4a8e0ee52"},{"path":"tests/helpers/release-selection-map-source.json.gz","before":null,"after":"0c056c020ad655d5a2a901a6f196350582eaf0709afa736f363a0d68509daf62"},{"path":"tests/helpers/enemy-post697-source.mjs","before":null,"after":"d259ada3af2652b17cce15d633a1b3489afe00a65c59b2c3aa30d4426adb0555"},{"path":"tests/helpers/enemy-post697-source.json.gz","before":null,"after":"fdae2d3627b986b59c9a3a87470e36b7e46a59df99cf22ea45a3cab3467e6da7"}];
export const handEnemyHelperCopies=[{"path":"tests/helpers/closeout-source-epoch.mjs","before":"560d7e2746766f12267a93bc171a8e015b776cec9ae5e843dbd42c9f4616a381","after":"b441679152df65b333c5787b7d7096d54d384936b7e8c9fe04fc78f6c4467e12"},{"path":"tests/helpers/enemy-geometry-source.mjs","before":null,"after":"7f3c4d9309537e5bfcc6af807f11c955968d572bffb856857a1104a24a2ce982"},{"path":"tests/helpers/enemy-geometry-source.json.gz","before":null,"after":"af5ac18b5bb3346fe000d22a184e04b8d064d38e723bd328a06cdf1b37fecfae"},{"path":"tests/helpers/enemy-post697-source.mjs","before":null,"after":"d259ada3af2652b17cce15d633a1b3489afe00a65c59b2c3aa30d4426adb0555"},{"path":"tests/helpers/enemy-post697-source.json.gz","before":null,"after":"fdae2d3627b986b59c9a3a87470e36b7e46a59df99cf22ea45a3cab3467e6da7"},{"path":"tests/helpers/hand-enemy-source.mjs","before":null,"after":"1bc797f731325dfc88c0fa9eb6082978e2d10084edd926b38148a4c57d32fcbf"}];
for(const row of handEnemyHelperCopies){assert.equal(files[row.path]??null,row.before,'exact hand enemy copy predecessor: '+row.path);files[row.path]=row.after;}
const inside=(root,path)=>{const r=relative(root,path);return r!==''&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../')&&!r.startsWith('..\\');};
export function copyIntegrationSourceClosure(directory,{sourceRoot=process.cwd()}={}){
 const destination=realpathSync.native(directory);
 assert.notEqual(destination,realpathSync.native(sourceRoot),'isolated helper copy destination');
 for(const [path,sha]of Object.entries(files)){
  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');
  const source=join(sourceRoot,path),content=integrationClosureBytes(path,readFileSync(source));assert.equal(hash(content),sha,'fresh helper copy identity: '+path);
  const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});
  assert(inside(destination,realpathSync.native(dirname(target))),'helper destination parent escaped');
  if(existsSync(target))assert(inside(destination,realpathSync.native(target))&&realpathSync.native(target)!==realpathSync.native(source),'helper destination aliases source');
  writeFileSync(target,content);
 }
}
