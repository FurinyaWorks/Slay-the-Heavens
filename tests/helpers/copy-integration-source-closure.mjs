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
const potionFiles={...files};
const releaseFiles={...files};
export const mobilePotionHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'05ffc1ef75dd3acce2d91062714c19ed578de2dd45d7897b238019aaaaaf3c60'},
 {path:'tests/helpers/mobile-potion-source.mjs',before:null,after:'6ed42296f87ed7ba349e6f1cf258c60003bfd7cdea70279a8ada00d06ce84669'},
 {path:'tests/helpers/mobile-potion-source.json.gz',before:null,after:'2af4fb9d547eb50d7dc75fd54fc4b505ecaf8b5f343330e31ac91054d75c2a06'}
];
for(const row of mobilePotionHelperCopies){assert.equal(potionFiles[row.path]??null,row.before,'exact mobile potion helper-copy predecessor: '+row.path);potionFiles[row.path]=row.after;}
export const potionRegressionHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'05ffc1ef75dd3acce2d91062714c19ed578de2dd45d7897b238019aaaaaf3c60',after:'c094647f798d6ca9c98c49b646cbd0ba034d90bd107d07e060c9d24396ec4a28'},
 {path:'tests/helpers/potion-regression-source.mjs',before:null,after:'222f5d4ca9ae55b0ff47c18d466fed620ea1ea87209b82f9c4567615409b4cad'},
 {path:'tests/helpers/potion-regression-source.json.gz',before:null,after:'fff211fab47d021bb4d6cd936a719bba03afcec03f7078aa49d3b165de5b8b2d'}
];
for(const row of potionRegressionHelperCopies){assert.equal(potionFiles[row.path]??null,row.before,'exact potion regression helper-copy predecessor: '+row.path);potionFiles[row.path]=row.after;}
export const potionClickHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'c094647f798d6ca9c98c49b646cbd0ba034d90bd107d07e060c9d24396ec4a28',after:'b0260eb43becd74e52a8b5ed04e1909f52741d8cc9813c42ec5bc109f3c5723c'},
 {path:'tests/helpers/potion-click-source.mjs',before:null,after:'eb133eb610ed646a566bde84c1113083ef710f68ad6bb34cb219fd306837dc82'},
 {path:'tests/helpers/potion-click-source.json.gz',before:null,after:'823ccaff8ee4d2d6e48fb94c758f9ae11a001c73872fef2a890109de0c8e0dbf'}
];
for(const row of potionClickHelperCopies){assert.equal(potionFiles[row.path]??null,row.before,'exact potion click helper-copy predecessor: '+row.path);potionFiles[row.path]=row.after;}
export const potionPost697HelperCopies=[{"path":"tests/helpers/closeout-source-epoch.mjs","before":"b0260eb43becd74e52a8b5ed04e1909f52741d8cc9813c42ec5bc109f3c5723c","after":"217f68beb3e466b842b8be13c71a9172960f8c07d0f3fc87ee0a8c9e41b33829"},{"path":"tests/helpers/release-selection-map-source.mjs","before":null,"after":"920fd01fa07dad36ed7e9b70ace199246000d87ad20c258221a2aca4a8e0ee52"},{"path":"tests/helpers/release-selection-map-source.json.gz","before":null,"after":"0c056c020ad655d5a2a901a6f196350582eaf0709afa736f363a0d68509daf62"},{"path":"tests/helpers/potion-post697-source.mjs","before":null,"after":"adf79a31356f5568a0c7d061ed0f82fcee8fa70966d152359ec74bd24f14b66d"},{"path":"tests/helpers/potion-post697-source.json.gz","before":null,"after":"af71c0335451f4729681a86aea723526b151d5d1732d6885d1a7a0d50cc79304"}];
for(const row of potionPost697HelperCopies){assert.equal(potionFiles[row.path]??null,row.before,'exact post697 helper-copy predecessor: '+row.path);potionFiles[row.path]=row.after;}
export const releasePc22BasicFeedbackHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'0c7ff98c42c47a1a48ad83537d1d7c37a6cc23aed55ada9c763122d4ea102d07'},
 {path:'tests/helpers/release-pc22-basic-feedback-source.mjs',before:null,after:'395e3810c67852768340eb868ee7397bb9ed0b232ff112efa93fb4b520e80b96'},
 {path:'tests/helpers/release-pc22-basic-feedback-source.json.gz',before:null,after:'1cb0fddfea365de7be5331dc169bd438f2cde36b372c4c15bf9c8ac8a2eed157'}
];
export const releaseSelectionMapHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'9bc2594f88cd780a31a429f5a493568f076d039ab92f55b952631b586ce335c1'},
 {path:'tests/helpers/release-selection-map-source.mjs',before:null,after:'920fd01fa07dad36ed7e9b70ace199246000d87ad20c258221a2aca4a8e0ee52'},
 {path:'tests/helpers/release-selection-map-source.json.gz',before:null,after:'0c056c020ad655d5a2a901a6f196350582eaf0709afa736f363a0d68509daf62'}
];
for(const rows of [releasePc22BasicFeedbackHelperCopies,releaseSelectionMapHelperCopies])for(const row of rows){
 assert.equal(releaseFiles[row.path]??null,row.before,'exact standalone Release helper-copy predecessor: '+row.path);
 if(row.path!=='tests/helpers/closeout-source-epoch.mjs')releaseFiles[row.path]=row.after;
}
releaseFiles['tests/helpers/closeout-source-epoch.mjs']='3101ebf6deee9f081fad6e3c8d4617b6db4bf17ee01453c82fc8d8a3fb742215';
export const releaseEnemyArtHelperCopies=[
  {
    "path": "tests/helpers/closeout-source-epoch.mjs",
    "before": "3101ebf6deee9f081fad6e3c8d4617b6db4bf17ee01453c82fc8d8a3fb742215",
    "after": "2a89d96cd40b689dc9ba73cbcb1abe4023a5cf79a0002023d3ebc61aeecaf1aa"
  },
  {
    "path": "tests/helpers/release-enemy-art-source.mjs",
    "before": null,
    "after": "4ae006a612f0604081c8135ce6f7ccad6459416232dad2f3cfccbf7ad02a2b65"
  },
  {
    "path": "tests/helpers/release-enemy-art-source.json.gz",
    "before": null,
    "after": "b2c17392b591bc57ec0f8de9236cfc862d74fcfef76d13261baa746966e411a4"
  }
];
for(const row of releaseEnemyArtHelperCopies){assert.equal(releaseFiles[row.path]??null,row.before,'exact release enemy art helper-copy predecessor');releaseFiles[row.path]=row.after;}

const closeoutPath='tests/helpers/closeout-source-epoch.mjs';
assert.equal(potionFiles[closeoutPath],'217f68beb3e466b842b8be13c71a9172960f8c07d0f3fc87ee0a8c9e41b33829');
assert.equal(releaseFiles[closeoutPath],'2a89d96cd40b689dc9ba73cbcb1abe4023a5cf79a0002023d3ebc61aeecaf1aa');
for(const map of [potionFiles,releaseFiles])for(const [path,sha]of Object.entries(map)){
 if(path===closeoutPath)continue;
 if(Object.hasOwn(files,path))assert.equal(files[path],sha,'identical inherited helper-copy source: '+path);
 files[path]=sha;
}
files[closeoutPath]='f4c87730da1c7410700e1d652f18cdf3aa005b3f33034db1c705294947b54fe9';
assert.equal(files[closeoutPath], 'f4c87730da1c7410700e1d652f18cdf3aa005b3f33034db1c705294947b54fe9');
files[closeoutPath] = '3a6959a4323b6294612d0af940cb19d3ba56c322b869edc21fa8bb59e06d3508';
files['tests/helpers/mobile-hand-source.json.gz'] = 'f09812ac4f7c422d8a4530a8efa9ca0e35048eb1a2f4a7940495d76495f5ee4c';
assert.equal(files[closeoutPath], '3a6959a4323b6294612d0af940cb19d3ba56c322b869edc21fa8bb59e06d3508');
files[closeoutPath] = 'dc7edeaf20da6dbf586c96752a77432fd6c4b5adddf2d603b6e4a56aa23e0150';
files['tests/helpers/enemy-geometry-source.json.gz'] = 'af5ac18b5bb3346fe000d22a184e04b8d064d38e723bd328a06cdf1b37fecfae';
assert.equal(files[closeoutPath], 'dc7edeaf20da6dbf586c96752a77432fd6c4b5adddf2d603b6e4a56aa23e0150');
files[closeoutPath] = 'a935712406ce226efd237b76416bf9e1a7d3c141f8a5f0f126181e84c54a7d3d';
files['tests/helpers/release-sparse-pointer-source.json.gz'] = '24126de8efaf5088cc67d045391bbd2ba19a464e0a616d9d2483a12f70648340';
files[closeoutPath] = '3405d434f2c38c42ac48aea22eee27ab05d9912ac4915584fcc89f291e7b26f6';
files['tests/helpers/release-composite-intent-source.json.gz'] = '813ee7d1c86932e518c8b5c2d23c339c8dbd86b73d53151531c58ed8414ae7ef';
files[closeoutPath] = '430dcaa055be3c350047256f7b6b8ceefd9aeff0fb0401f911a7589cad98eb5c';
files['tests/helpers/runtime-particle-source.json.gz'] = '2cef28e3bd47c3638c421c9f152453b7e446501f69e32bdaac39417a3731ad6a';
assert.equal(files[closeoutPath], '430dcaa055be3c350047256f7b6b8ceefd9aeff0fb0401f911a7589cad98eb5c');
files[closeoutPath] = 'ed7b31a7e316c40fd15f770b7bca0e6a9460981a831de5966634241ad80270ba';
files['tests/helpers/release-target-corners-source.json.gz'] = '74900cc6bcc96f29a430067d609bda9c7de8a2d3245b9fad59fc69ae4d3181c7';
assert.equal(files[closeoutPath], 'ed7b31a7e316c40fd15f770b7bca0e6a9460981a831de5966634241ad80270ba');
files[closeoutPath] = '41acf3946b09caa2f1e03f5775597e7d8e62dd021fd4b394712a4339e814dbdf';
files['tests/helpers/release-pointer-identity-source.json.gz'] = 'ad05f84a4d67d65b99f1469ffbd4080d2b9f92b88f0b6df214ecc0e9888138c1';
files[closeoutPath] = 'd46b74955c6f955cde5bd1f3358986250f5b650ce3f0d0532e6d4b3a3a53b749';
files['tests/helpers/release-shop-dismissal-source.json.gz'] = 'a8c7fd5bcba44c200ddfc644761adb69b35d7d2ab1e92d619f01fc050fb3ae24';
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
