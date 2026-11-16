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
export const mobilePotionHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7',after:'05ffc1ef75dd3acce2d91062714c19ed578de2dd45d7897b238019aaaaaf3c60'},
 {path:'tests/helpers/mobile-potion-source.mjs',before:null,after:'6ed42296f87ed7ba349e6f1cf258c60003bfd7cdea70279a8ada00d06ce84669'},
 {path:'tests/helpers/mobile-potion-source.json.gz',before:null,after:'2af4fb9d547eb50d7dc75fd54fc4b505ecaf8b5f343330e31ac91054d75c2a06'}
];
for(const row of mobilePotionHelperCopies){assert.equal(files[row.path]??null,row.before,'exact mobile potion helper-copy predecessor: '+row.path);files[row.path]=row.after;}
export const potionRegressionHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'05ffc1ef75dd3acce2d91062714c19ed578de2dd45d7897b238019aaaaaf3c60',after:'c094647f798d6ca9c98c49b646cbd0ba034d90bd107d07e060c9d24396ec4a28'},
 {path:'tests/helpers/potion-regression-source.mjs',before:null,after:'222f5d4ca9ae55b0ff47c18d466fed620ea1ea87209b82f9c4567615409b4cad'},
 {path:'tests/helpers/potion-regression-source.json.gz',before:null,after:'fff211fab47d021bb4d6cd936a719bba03afcec03f7078aa49d3b165de5b8b2d'}
];
for(const row of potionRegressionHelperCopies){assert.equal(files[row.path]??null,row.before,'exact potion regression helper-copy predecessor: '+row.path);files[row.path]=row.after;}
export const potionClickHelperCopies=[
 {path:'tests/helpers/closeout-source-epoch.mjs',before:'c094647f798d6ca9c98c49b646cbd0ba034d90bd107d07e060c9d24396ec4a28',after:'b0260eb43becd74e52a8b5ed04e1909f52741d8cc9813c42ec5bc109f3c5723c'},
 {path:'tests/helpers/potion-click-source.mjs',before:null,after:'af8107cddca5654556fd8a512341ecc658b20552ca91c1bc2bc33fb4fdb32561'},
 {path:'tests/helpers/potion-click-source.json.gz',before:null,after:'2742b7d724213f7764d9603ea2276ffd9d85a910ab2b8b263d5a896ba94fe26e'}
];
for(const row of potionClickHelperCopies){assert.equal(files[row.path]??null,row.before,'exact potion click helper-copy predecessor: '+row.path);files[row.path]=row.after;}
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
