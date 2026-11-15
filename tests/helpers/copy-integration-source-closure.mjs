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
// Fixed reviewed UI continuation; both exact closeout compositions are immutable.
export const itemIconHelperCopies=[
  {
    "path": "tests/helpers/combined-epoch/source-epoch-runtime.mjs",
    "versions": [
      {
        "before": "5341c965ce41e956f153caf90c2e2097ccaee447a2d1e53a5aa666d15a238882",
        "after": "ca43eda2e5c423e0a8253f0b37acc5400ef5bdf4d827acaf846693cfb8f2ddfc"
      }
    ]
  },
  {
    "path": "tests/helpers/closeout-source-epoch.mjs",
    "versions": [
      {
        "before": "552e5980a76b46fcd030fcafe516d5b7673021dce0a7b0c23072bfb67dcf1e40",
        "after": "aa943b070906e85c7adb23b2019728886d83bcfb2f80b19266931b23c3f98ffc"
      },
      {
        "before": "163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7",
        "after": "3471ca3ce9f2f0f1ddeb87d21c201cf83a4c41592744de068696812af9154dc8"
      },
      {
        "before": "3f6eff5b06cc91371de414aa1a7fb960ee447d6cdca9b8fc7807ce503793fd6c",
        "after": "775646f95cc2a4f4008c789824ebdf597f409bcb68e82e1e7118cabbe35b042a"
      },
      {
        "before": "775646f95cc2a4f4008c789824ebdf597f409bcb68e82e1e7118cabbe35b042a",
        "after": "ca1375c9dfab0d93f78afc8b80e86e8930f92057a201e48e946d7d6a7b350c42"
      }
    ]
  },
  {
    "path": "tests/helpers/item-semantic-icons-source.mjs",
    "versions": [
      {
        "before": null,
        "after": "677d96ae26bddeb634feef64c0c8418541727ec21c9ef1d8cc4da9d5c3f1228b"
      }
    ]
  },
  {
    "path": "tests/helpers/item-semantic-icons-source-witness.json",
    "versions": [
      {
        "before": null,
        "after": "0d6ece8de408d476ec4110e7e18d3176b8b7bbb77fbbb1a9070767fccac41a29"
      }
    ]
  }
];
itemIconHelperCopies.push(
 {path:'tests/helpers/pc-final-source-epoch.mjs',versions:[{before:null,after:'e63d06bca56c511f3575d546b220189d9da7e9636b447fd15d7ebf2f2561a085'}]},
 {path:'tests/helpers/pc-final-source-epoch.json.gz',versions:[{before:null,after:'fc811b3d3f93e0f7dc9a01189349a1d94c6a241231d290031b55de7bab2af5df'}]});
for(const row of itemIconHelperCopies){
 let version=row.versions.find(version=>version.before===(files[row.path]??null)),steps=0;
 assert(version,'exact item icon helper-copy predecessor: '+row.path);
 while(version){
  assert(++steps<=row.versions.length,'acyclic item icon helper-copy continuation');
  files[row.path]=version.after;
  version=row.versions.find(next=>next.before===files[row.path]);
 }
}
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
