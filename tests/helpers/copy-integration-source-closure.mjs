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
const tinyHouseFiles=Object.freeze({
 ...releaseGuideFiles,
 [runtime]:'c69727aeeeacd96469492cdce40b3d100eab1b1d6bd78ff03d67565615fc02d7',
 'tests/helpers/tiny-house-integrated-source.mjs':'dbe8ab324dd2f0a4154e2b1c420a19b12c21a00cb5c5739049f1baa4ae8980e8',
 'tests/helpers/develop-tiny-house-predecessors.json.gz':'b699c3e7a0dfc70c24a47ba43b1fc68cc2cd340b67d2927c71af7b95d73887d5',
});
const rewardTransitionFiles=Object.freeze({
 ...tinyHouseFiles,
 [closeout]:'4d3e6c160de2c6b69e661d5c57229c7b6e0c3f76d1c8eff30df51b23ef305650',
 'tests/helpers/pc13-reward-cover-source.mjs':'ce7b2396dca3f2769cb34c628ed39802b485a3a64d7693560d92f334309eb588',
 'tests/helpers/release-guide-backflow-source.mjs':'b3f38bf200d79d335a0048295b835d4d326ebfc7d52039171984998022b7facf',
 'tests/fixtures/combat-reward-transition-source.json.gz':'08c955924392a2a23a989e08b9bb4e061d06a66871b1cbacd9ad556c0b734476',
});
const mapFiles=Object.freeze({
 ...rewardTransitionFiles,
 'tests/helpers/card-feedback-owner-source.json.gz':'0710facff10a22ddca512869df2b0f526189deb5ca3394369e45fba20bd0d4ec',
 'tests/helpers/card-feedback-owner-source.mjs':'eceb0be36e5d40f82ef404cbfb1b2b2c2101b5f0b889e1c215ecff2ab15cd857',
 [runtime]:'b04107e3d9c8f0d923aa3547276f9ee84651915740c909d998a5b657a589d04f',
 'tests/helpers/sts1-map-source.mjs':'12710c7f6b4787876c69cec5f6443447252465be9cbbffa0d85f38729823cfeb',
 'tests/fixtures/sts1-map-source.json.gz':'a356e09f7fb3a7c2f16c09adbbafaae6290bc615fe3be530a9f02d2c3a6e8d39',
});
const powerMembershipFiles=Object.freeze({
 ...mapFiles,
 [closeout]:'564a22d425038c24b65fed7d5b1a6c6cc847b71b6f32702d3ed257c3ee18d0d6',
 'tests/helpers/power-membership-source.mjs':'7df5bd25a505c50895ccdf8db84a0f424b9d02baf7659dc69a483ed8ef03ff1d',
 'tests/helpers/power-membership-source.json.gz':'9b4ee9cf761b49297c4a0abfea0df825104e6dcc2e73ca9b633d2c50bce8a039',
});
const releaseUiFiles=Object.freeze({
 ...powerMembershipFiles,
 [runtime]:'8536d9f54bc814e92db509a248b199be0bbd8c84c5a8fac7369637f94e21c513',
 'tests/helpers/potion-pointer-source.mjs':'ba6547de02ef3188b9658764452283cd671e3324f19cf0775bce3221db53cdab',
 'tests/helpers/release-ui-restore-source.mjs':'dc2b0718c2cdaf170abc16894562d02b85bb14ae81d281d6a1c6bdba4ca424d5',
 'tests/helpers/release-shared-relic-source.json.gz':'4e72ca430cf8740dd6cb828547d8b8f29ba169c0c90cf49c2c662aa5964df5cc',
 'tests/helpers/release-ui-restore-source.json.gz':'e38609afe1efa63715e2f54619fde19501b20b59ebb9a9aaf5944e82b22e339b',
 'tests/helpers/release-card-field-cancel-source.json.gz':'f38a352f98ef946e1e836781dd9ebd131010c03e04cfa62f928d94f6358c3bca',
 'tests/helpers/release-card-right-click-source.json.gz':'a157bfd25b91346bc4b9c7beae6de19baec13e824ee808d59e827b5052d78a1a',
 'tests/helpers/release-controls-guide-removal-source.json.gz':'321abc9fb6759dd27644f414c88f3a2df0be32f236a258a52d5b89cc6d22d687',
});
// Refined enemy art extends only the existing historical helper closure.
const refinedReleaseFiles=Object.freeze({
 ...releaseUiFiles,
 'tests/helpers/release-ui-restore-source.mjs':'37410ec175d07b09c8dd8062ac2e19d212dc8eeaebc32f38dbf99e7b32d8b7dd',
 'tests/helpers/release-shop-entry-source.json.gz':'d3c114b39aa8affa1ae5c2b3ee54117640dcacce750efc24d78312792d8d2ff7',
 'tests/helpers/release-forge-source.json.gz':'8557c9daa0943c815ca11e0c135d081c08081f040bbef85b3cd799f7a586c564',
 'tests/helpers/refined-release-source.mjs':'154f5464849177b48426db7d816f4ddf87d9d26abd6bfcfb543162b4f26450d9',
 'tests/helpers/refined-release-source.json.gz':'6b9e66890ecfeac7f0b581ece462edaf41095f6d2937896cf6032e9e8ee9a9a3',
});
const integratedReleaseFiles=Object.freeze({
 ...refinedReleaseFiles,
 'tests/helpers/combat-visual-source.mjs':'6fbf561edae2163cb68163834289ea70b8ec94868507677be0f21fd9cabbfc7b',
 'tests/fixtures/combat-visual-source.json.gz':'c182bc4a8f2afef8e3aec0b32a43dcfd2c4f0c214763a34a86dec8e07daadc3d',
 'tests/helpers/energy-reference-source.mjs':'c640c2cf869dc51bcb4b47f143f91e3cb799bec0a80212166592a8c8c29f59c1',
 'tests/fixtures/energy-reference-source.json.gz':'2b0f8c497c73a8afca47b01a41c7c8800f92c2879202c827df663269329ef19e',
 'tests/helpers/release-map-deck-source.mjs':'e31f57cd3eb1fd7911d55984160eaeebcec50eecfb76718fcba49c59d2616edb',
 'tests/helpers/release-map-deck-source.json.gz':'8e16866bcec2fdc7628cbc91f7a74f09c18b9f621c6e065b75b2c98a8172a2d4',
 'tests/helpers/recording-0401-source.json.gz':'9af199338e44fb660599900c5474624853f02be24aa5590029f37cee2a551e24',
 'tests/helpers/release-integration-source.mjs':'5efadc152e80395a3b60300468600ad21e054244277f199528589ffca0f298d0',
 'tests/fixtures/release-integration-source.json.gz':'0ba3c551c50c35dfb4e27a0601063451693fba48d3ad9942dd34f6c2aec7d087',
 'tests/helpers/release-ui-restore-source.mjs':'2a17a830eb9f09d53302986c8e4cffc44791b78c2ac2d02c33ecdc6ea330edcd',
});
const reconciledReleaseFiles=Object.freeze({
 ...integratedReleaseFiles,
 'tests/helpers/rebased-release-source.mjs':'506d813c01143602af3f5169e3abb5945590a09bd2d7477b7d26ce2234160691',
 'tests/helpers/rebased-release-source.json.gz':'9ae910d679bdc8386063c58043a43e496ee34b7c6f22fc1a27cbaeca7b27222d',
 'tests/helpers/loading-recovery-source.mjs':'f3d9531862c3301feef906b0833bc19a80744273fb927bd9f2d9255c33de67b3',
 'tests/helpers/pc13-reward-cover-source.mjs':'e8d58b2f3484855a9e986c945b6add861436ca754fb24ef8be71f0777ef46b9b',
 [runtime]:'d25494ab5a1d269568c321fe3e9c1a2494239f3916d46bd93331a5328fff549b',
 'tests/helpers/potion-pointer-source.mjs':'ba6547de02ef3188b9658764452283cd671e3324f19cf0775bce3221db53cdab',
 'tests/helpers/release-ui-restore-source.mjs':'75da223110ac6a108face448920b3c07f61c427544cc8953a043721f99499c03',
 'tests/helpers/release-shared-relic-source.json.gz':'4e72ca430cf8740dd6cb828547d8b8f29ba169c0c90cf49c2c662aa5964df5cc',
 'tests/helpers/release-ui-restore-source.json.gz':'e38609afe1efa63715e2f54619fde19501b20b59ebb9a9aaf5944e82b22e339b',
 'tests/helpers/release-card-field-cancel-source.json.gz':'f38a352f98ef946e1e836781dd9ebd131010c03e04cfa62f928d94f6358c3bca',
 'tests/helpers/release-card-right-click-source.json.gz':'a157bfd25b91346bc4b9c7beae6de19baec13e824ee808d59e827b5052d78a1a',
 'tests/helpers/release-controls-guide-removal-source.json.gz':'321abc9fb6759dd27644f414c88f3a2df0be32f236a258a52d5b89cc6d22d687',
 'tests/helpers/release-shop-entry-source.json.gz':'d3c114b39aa8affa1ae5c2b3ee54117640dcacce750efc24d78312792d8d2ff7',
 'tests/helpers/release-forge-source.json.gz':'8557c9daa0943c815ca11e0c135d081c08081f040bbef85b3cd799f7a586c564',
 'tests/helpers/refined-release-source.mjs':'47de5251e4da81b8fea3628ae74338be8ff21dcb391333ebca35f27272742a4b',
 'tests/helpers/refined-release-source.json.gz':'6b9e66890ecfeac7f0b581ece462edaf41095f6d2937896cf6032e9e8ee9a9a3',
 'tests/helpers/combat-visual-source.mjs':'115a50fc7286640e9a370d33ab42bd45e1337430d25bfe14c7f8edeeaf9d636a',
 'tests/fixtures/combat-visual-source.json.gz':'c182bc4a8f2afef8e3aec0b32a43dcfd2c4f0c214763a34a86dec8e07daadc3d',
 'tests/helpers/energy-reference-source.mjs':'1dab90516f3945be27ef5da9fd3b11088d414d871bd59937373d6b4b773061d1',
 'tests/fixtures/energy-reference-source.json.gz':'2b0f8c497c73a8afca47b01a41c7c8800f92c2879202c827df663269329ef19e',
 'tests/helpers/release-map-deck-source.mjs':'db1c1f75f23d5c93a804c906185092f1719e9be5bb74cde388f56fde2f428f37',
 'tests/helpers/release-map-deck-source.json.gz':'8e16866bcec2fdc7628cbc91f7a74f09c18b9f621c6e065b75b2c98a8172a2d4',
 'tests/helpers/recording-0401-source.json.gz':'9af199338e44fb660599900c5474624853f02be24aa5590029f37cee2a551e24',
 'tests/helpers/release-integration-source.mjs':'5efadc152e80395a3b60300468600ad21e054244277f199528589ffca0f298d0',
 'tests/fixtures/release-integration-source.json.gz':'0ba3c551c50c35dfb4e27a0601063451693fba48d3ad9942dd34f6c2aec7d087',
 });
assert.equal(loadingRecoveryFiles['tests/helpers/loading-recovery-source.mjs'],'873915500ae2b1a02abebb78a932a8cdfa5e56044ad5dcb34a4d51fd1fc02f5f','STS fade exact loading helper predecessor');
const stsFadeFiles=Object.freeze({...reconciledReleaseFiles,...{
  "tests/helpers/loading-recovery-source.mjs": "f3d9531862c3301feef906b0833bc19a80744273fb927bd9f2d9255c33de67b3",
  "tests/helpers/sts-selection-fade-source.mjs": "73b46c3cebe908ea332c56264b1300937d9e67de678225b5ac213b16ef245adf",
  "tests/fixtures/sts-selection-fade-source.json": "aa738acfea89d0c38209c903dca0b0a573e217ce11c0542a022cf18e0b784717"
}});
assert.equal(stsFadeFiles['tests/helpers/sts-selection-fade-source.mjs'],'73b46c3cebe908ea332c56264b1300937d9e67de678225b5ac213b16ef245adf','STS UI exact fade helper predecessor');
const stsCloseoutFiles=Object.freeze({
 ...stsFadeFiles,
 'tests/helpers/potion-pointer-source.mjs':'4dd975ca7ca30f3b5781d24567e38dfd5c384b6ae185f8e6a584a55337aae1f9',
 'tests/helpers/sts-selection-fade-source.mjs':'d6e692e05653c6377d27551c40be5e7f6f0a2dfb5c65a9e1f1f0f04dc2f044e9',
 'tests/helpers/sts-ui-closeout-source.mjs':'9303fe7c8dc88f40b552cdc8f291ec22932d6ee28e1e7f7463191a2f1ffa32a9',
 'tests/fixtures/sts-ui-closeout-source.json':'6d3859741054bc3da48bd31b5a520ce559da6a06a866a9232741c82a175e891d',
});
const developBackflowFiles=Object.freeze({
 ...stsCloseoutFiles,
 'tests/helpers/release-map-deck-source.mjs':'87a1f219bfca2f4ae049896248efd8217c76e90010aee0a1567e51b0e6fc0aa1',
 'tests/helpers/develop-release-backflow-source.mjs':'746506919ebea92ffc0aa98ee7611a597988ce6356570cc0cc001fdf0e4c3927',
 'tests/fixtures/develop-release-backflow-source.json.gz':'7d5c23a2892ec034dc1fb183bca19d8c074f834dc03ff037ee93a17a3da99943',
 'tests/helpers/character-preparation-source.mjs':'1adaca46c085f2daaf7450e8421ec4f38bb6b0e30e726f92cc716abef0330fdb',
 'tests/helpers/combined-epoch/source-epoch-runtime.mjs':'4e615ebe00db432f4454613cebc88c3ade5ca1053e6a1bc7ac80fe3c067a5ee3',
 'tests/helpers/sts-selection-fade-source.mjs':'18fe99cc5af9f83d6efb565c63db404923f6efe690d9f47e9338b4bb85dad0ef',
});
const inside=(root,path)=>{const r=relative(root,path);return r!==''&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../')&&!r.startsWith('..\\');};
export function copyIntegrationSourceClosure(directory,{sourceRoot=process.cwd()}={}){
 const destination=realpathSync.native(directory);
 assert.notEqual(destination,realpathSync.native(sourceRoot),'isolated helper copy destination');
 for(const [path,sha]of Object.entries(developBackflowFiles)){
  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');
  const source=join(sourceRoot,path),content=integrationClosureBytes(path,readFileSync(source));assert.equal(hash(content),sha,'fresh helper copy identity: '+path);
  const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});
  assert(inside(destination,realpathSync.native(dirname(target))),'helper destination parent escaped');
  if(existsSync(target))assert(inside(destination,realpathSync.native(target))&&realpathSync.native(target)!==realpathSync.native(source),'helper destination aliases source');
  writeFileSync(target,content);
 }
}
