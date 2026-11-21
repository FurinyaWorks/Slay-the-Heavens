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
const priorFiles=Object.freeze({
 ...predecessor,
 'tests/helpers/lumine-portrait-source.mjs':'f6b48bd50ffc703348648cfe6c75686531f319952806a4376b25841c9f7acee0',
 [runtime]:'1e50066c015e6d886b9380795d83fbe266f3ddc9705d9a65cba77bc296f56333',
 [closeout]:'873523684eb7561b705b558b6b38eba752e5d7a7d29c386841d4b61276268e88',
 'tests/helpers/fatal-bgm-source-continuation.mjs':'c0a1f30805b3c5c0680888ee9de4ff77cef2bc8a729271d5ff7f967dada02382',
 'tests/fixtures/fatal-bgm-e65-source.json.gz':'3e560e461232785753f5a574732ec834b19c51cfd700f09cce212009dd4a22fb',
 'tests/helpers/exact-source-continuation.mjs':'9046457a50fa3c137985906423be546424287dc5a06ef940f6ffbeb553d63ccf',
 'tests/helpers/potion-text-source.mjs':'75dcd901e15f07831e1eeaf943e93ca5795068fa9d841e34cd0bb20e57f426b3',
 'tests/helpers/character-selector-source.mjs':'7b3e77e5a190772e6a7d063eb2134aeabd928a6db691705ffa220fa92b71b974',
 'tests/helpers/potion-pointer-source.mjs':'cdf4027a2b9f68804f37c827d8cf6affcc1b322bce0b98147c502c7b60a2c80f',
 'tests/fixtures/potion-pointer-source.json.gz':'9fce9e414190da11df3d1451bd4f373a1b6ec0d227d33a2e4e8d8cc1c34ecb41',
 'tests/helpers/official-ui-repair-source-epoch.mjs':'edabe5fc268d443e837dea9bd5785856b1b92874b75d9c32193ba53eb98fd46e',
 'tests/helpers/v2-ui-hud-source.mjs':'dca36319e8eb77df3e6db39b13db949736bae1ab11681cf6eab8269f9f4be268',
 'tests/fixtures/v2-ui-hud-source.json.gz':'649a52b20d2b9b2ad338a77b24daf29998014522e0dc0d5888bccce1529faa58',
 'tests/helpers/v2-run-menu-source-epoch.mjs':'a7e11793af79e698ed2a6ae832bd94cc8c47e2d6149e60d58db8138f1a1c77b8',
 'tests/fixtures/v2-run-menu-source.json':'b078f617134d3189f5a815e1c85b1edfd50c8e133950d5b81cbecb67a1358508',
 'tests/fixtures/develop-character-architecture-before.json.gz':'7a5ab46cd4e7d27fc414f05bebb1ffe06dcba742f990412205113f672b8db541',
});
const files=Object.freeze({
 ...priorFiles,
 [runtime]:'32993c1ea683a1e81311636002b5520608d12fa247eea62a88b121c8d557c4dd',
 "tests/helpers/tiny-house-ui-source.mjs":'55cde238d2b9fd6f70a92c7501e2802bb73ab6e603bd49991200982c737c46c7',
 "tests/fixtures/tiny-house-ui-source.json.gz":'66bfcad375c58f5c96a6e0b06afd1cdf5df490002628d5e837eb9ab6cc3a3c02',
 'tests/helpers/v2-ui-hud-source.mjs':'bf32590ea3e8c172ced44a9a9399ba022c0926dd83475dcb6ae62741ab1a09f0',
 'tests/fixtures/v2-ui-hud-source.json.gz':'9a1881227d100bf4a3a39908dd44d64d6b16f87bdb2220d55a2f3ce61f2882fe',
});
assert.equal(files[runtime],'32993c1ea683a1e81311636002b5520608d12fa247eea62a88b121c8d557c4dd','PC13 runtime helper predecessor');
const pc13Files=Object.freeze({
 ...files,
 [runtime]:'fb10a5dc6bf09177fe77bf858b1ffb39ee93dbacb784995dfc1bb1771bf5e545',
 'tests/helpers/pc13-reward-cover-source.mjs':'e1cf572bc792c036aaf03f25e03b1c7ab384bf257be353c43be775441a7c67ee',
 'tests/fixtures/pc13-reward-cover-source.json.gz':'9779296bb7bedc99990fa6ccad9c7ba0a0e581982a020c9dcc4a71210b3299cd',
});
assert.equal(pc13Files[runtime],'fb10a5dc6bf09177fe77bf858b1ffb39ee93dbacb784995dfc1bb1771bf5e545','M05 exact PC13 runtime helper predecessor');
const m05Files=Object.freeze({
 ...pc13Files,
 [runtime]:'7f3a94804f84b4f229b47adcd85adbc3b5387223c018f8e3fc32af145b469ac8',
 'tests/helpers/m05-shop-source.mjs':'5580a50d2c7636d4b3b5d708f39b89527d771af159964db6aab55ca7afb03b08',
 'tests/fixtures/m05-shop-source.json.gz':'0b394bc2fa5a642b3cf14fa257607703fc4bcbd5da766cffbb4e7733661dda59',
});
const loadingRecoveryFiles=Object.freeze({
 ...m05Files,
 'tests/helpers/pc13-reward-cover-source.mjs':'669622dc54b057ad81579c872ae45231e51e906c3163c513af57a6ce3ce8a6ea',
 'tests/helpers/loading-recovery-source.mjs':'873915500ae2b1a02abebb78a932a8cdfa5e56044ad5dcb34a4d51fd1fc02f5f',
});
const releaseGuideFiles=Object.freeze({
 ...loadingRecoveryFiles,
 [runtime]:'cb0a50200fbd9e249b897b0b71c2581b2290c3fd0de2edb46ff72f70dfd7c9cc',
 'tests/helpers/pc13-reward-cover-source.mjs':'5c136f0cb4634526a6f133ed34d430717e020be2bc236f7e03a1c35c8e456737',
 'tests/helpers/release-guide-backflow-source.mjs':'9a18f8a3c11130899e51b17cba7ca9b5de25c7daf30cf3badf24db9808210062',
 'tests/fixtures/release-guide-backflow-source.json.gz':'7fe4f04ac99a35a19b6faee1b1678204b38476776729cb679886973eeff53d56',
});
const rewardTransitionFiles=Object.freeze({
 ...releaseGuideFiles,
 [closeout]:'4d3e6c160de2c6b69e661d5c57229c7b6e0c3f76d1c8eff30df51b23ef305650',
 'tests/helpers/pc13-reward-cover-source.mjs':'ce7b2396dca3f2769cb34c628ed39802b485a3a64d7693560d92f334309eb588',
 'tests/helpers/release-guide-backflow-source.mjs':'b3f38bf200d79d335a0048295b835d4d326ebfc7d52039171984998022b7facf',
 'tests/fixtures/combat-reward-transition-source.json.gz':'08c955924392a2a23a989e08b9bb4e061d06a66871b1cbacd9ad556c0b734476',
});
const inside=(root,path)=>{const r=relative(root,path);return r!==''&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../')&&!r.startsWith('..\\');};
export function copyIntegrationSourceClosure(directory,{sourceRoot=process.cwd()}={}){
 const destination=realpathSync.native(directory);
 assert.notEqual(destination,realpathSync.native(sourceRoot),'isolated helper copy destination');
 for(const [path,sha]of Object.entries(rewardTransitionFiles)){
  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');
  const source=join(sourceRoot,path),content=integrationClosureBytes(path,readFileSync(source));assert.equal(hash(content),sha,'fresh helper copy identity: '+path);
  const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});
  assert(inside(destination,realpathSync.native(dirname(target))),'helper destination parent escaped');
  if(existsSync(target))assert(inside(destination,realpathSync.native(target))&&realpathSync.native(target)!==realpathSync.native(source),'helper destination aliases source');
  writeFileSync(target,content);
 }
}
