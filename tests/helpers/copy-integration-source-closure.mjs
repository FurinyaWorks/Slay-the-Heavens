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
export const enemyGeometryHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'ba08a39270805524521cb4751ff2bfd8ba142713b688e01af803315c51339419'},
 {path:'tests/helpers/enemy-geometry-source.mjs',before:null,after:'7f3c4d9309537e5bfcc6af807f11c955968d572bffb856857a1104a24a2ce982'},
 {path:'tests/helpers/enemy-geometry-source.json.gz',before:null,after:'af5ac18b5bb3346fe000d22a184e04b8d064d38e723bd328a06cdf1b37fecfae'}
];
for(const row of enemyGeometryHelperCopies){assert.equal(files[row.path]??null,row.before,'exact enemy geometry helper-copy predecessor: '+row.path);files[row.path]=row.after;}
export const enemyPost697HelperCopies=[{"path":"tests/helpers/closeout-source-epoch.mjs","before":"ba08a39270805524521cb4751ff2bfd8ba142713b688e01af803315c51339419","after":"4866898adebc7f798ab4c7f72d0f2cd2f6fbfc4d875ed4df97a9639a65d7182b"},{"path":"tests/helpers/release-selection-map-source.mjs","before":null,"after":"920fd01fa07dad36ed7e9b70ace199246000d87ad20c258221a2aca4a8e0ee52"},{"path":"tests/helpers/release-selection-map-source.json.gz","before":null,"after":"0c056c020ad655d5a2a901a6f196350582eaf0709afa736f363a0d68509daf62"},{"path":"tests/helpers/enemy-post697-source.mjs","before":null,"after":"d259ada3af2652b17cce15d633a1b3489afe00a65c59b2c3aa30d4426adb0555"},{"path":"tests/helpers/enemy-post697-source.json.gz","before":null,"after":"fdae2d3627b986b59c9a3a87470e36b7e46a59df99cf22ea45a3cab3467e6da7"}];
for(const row of enemyPost697HelperCopies){assert.equal(files[row.path]??null,row.before,'exact post697 helper-copy predecessor: '+row.path);files[row.path]=row.after;}
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
