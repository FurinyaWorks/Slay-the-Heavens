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
export const blueCandleHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'732904f83de87fabe1db0a41e3f7e6201bb5618d246bc24965656ec62d26ebf4'},
 {path:'tests/helpers/blue-candle-source.mjs',before:null,after:'b608e97b7c43fad61cb397203a67f17e2fb4401525a1794a76ec26aeb33f7422'},
 {path:'tests/helpers/blue-candle-source.json.gz',before:null,after:'d8be56143b70efd9c73f91716f77163f877604b75d6bfe93d71ee014f954fed0'}
];
export const releaseSelectionMapHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'9bc2594f88cd780a31a429f5a493568f076d039ab92f55b952631b586ce335c1'},
 {path:'tests/helpers/release-selection-map-source.mjs',before:null,after:'920fd01fa07dad36ed7e9b70ace199246000d87ad20c258221a2aca4a8e0ee52'},
 {path:'tests/helpers/release-selection-map-source.json.gz',before:null,after:'0c056c020ad655d5a2a901a6f196350582eaf0709afa736f363a0d68509daf62'}
];
for(const rows of [blueCandleHelperCopies,releaseSelectionMapHelperCopies])for(const row of rows){
 assert.equal(files[row.path]??null,row.before,'exact standalone Release helper-copy predecessor: '+row.path);
 if(row.path!=='tests/helpers/closeout-source-epoch.mjs')files[row.path]=row.after;
}
files['tests/helpers/closeout-source-epoch.mjs']='0c2735f0916a941c4e97d6b6cf36f7c09a8dfecaae359af0b0a9add11c2a3304';
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
