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
const predecessor=extendIntegratedHelperClosure(extendFeedbackHelperClosure(JSON.parse(currentBytes),feedbackCiPatch.helperClosure));
const runtime='tests/helpers/combined-epoch/source-epoch-runtime.mjs';
const closeout='tests/helpers/closeout-source-epoch.mjs';
assert.equal(predecessor[runtime],'ee54191f327d412a5e37a76ff236af6f4aac692e51884a0e3afd33fe62e427e4','fatal BGM helper copy predecessor');
assert.equal(predecessor[closeout],'163f0f84fcd4f9b4bcb982b250891a9c5156df556699d8a65ec0cf1b354d25f7','closeout source slice copy predecessor');
const files=Object.freeze({
 ...predecessor,
 'tests/helpers/lumine-portrait-source.mjs':'f6b48bd50ffc703348648cfe6c75686531f319952806a4376b25841c9f7acee0',
 [runtime]:'208fafcc738d89baf672e1dbab128619e1605d86608d9829fe48782da396aeef',
 [closeout]:'873523684eb7561b705b558b6b38eba752e5d7a7d29c386841d4b61276268e88',
 'tests/helpers/fatal-bgm-source-continuation.mjs':'c0a1f30805b3c5c0680888ee9de4ff77cef2bc8a729271d5ff7f967dada02382',
 'tests/fixtures/fatal-bgm-e65-source.json.gz':'3e560e461232785753f5a574732ec834b19c51cfd700f09cce212009dd4a22fb',
 'tests/helpers/exact-source-continuation.mjs':'9046457a50fa3c137985906423be546424287dc5a06ef940f6ffbeb553d63ccf',
 'tests/helpers/potion-text-source.mjs':'75dcd901e15f07831e1eeaf943e93ca5795068fa9d841e34cd0bb20e57f426b3',
 'tests/helpers/character-selector-source.mjs':'7b3e77e5a190772e6a7d063eb2134aeabd928a6db691705ffa220fa92b71b974',
 'tests/helpers/v2-ui-hud-source.mjs':'5403d960b34c99c8889ee8f431ccc3f034d0a816a5877b46f953a4cf4e9e64ba',
 'tests/fixtures/v2-ui-hud-source.json.gz':'07fad808963c81ef4bbc0b02748c35ba14308701a5d6869df57df294ad3eaf46',
 'tests/helpers/v2-run-menu-source-epoch.mjs':'a7e11793af79e698ed2a6ae832bd94cc8c47e2d6149e60d58db8138f1a1c77b8',
 'tests/fixtures/v2-run-menu-source.json':'b078f617134d3189f5a815e1c85b1edfd50c8e133950d5b81cbecb67a1358508',
 'tests/fixtures/develop-character-architecture-before.json.gz':'7a5ab46cd4e7d27fc414f05bebb1ffe06dcba742f990412205113f672b8db541',
});
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
