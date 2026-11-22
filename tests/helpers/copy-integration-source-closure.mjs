import {beforeCombatVisualSource,combatVisualPriorRead} from './combat-visual-source.mjs';
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
 return Buffer.from(beforeCombatVisualSource(path,text).replaceAll('\r\n','\n'));
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
const releaseUiFiles=Object.freeze({
 ...pc13Files,
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
 'tests/helpers/release-ui-restore-source.mjs':'0a404f50a22153788baa3c8612588c266e4eecc3ac2b97a74ca7fa00a9c7f0a2',
 'tests/fixtures/release-compound-intent-source.json.gz':'4d1d0ca90bc98c95fef49584283807598edd42f995d230357d28fa41efa14111',
 'tests/helpers/release-shop-entry-source.json.gz':'d3c114b39aa8affa1ae5c2b3ee54117640dcacce750efc24d78312792d8d2ff7',
 'tests/helpers/release-forge-source.json.gz':'8557c9daa0943c815ca11e0c135d081c08081f040bbef85b3cd799f7a586c564',
 'tests/helpers/refined-release-source.mjs':'154f5464849177b48426db7d816f4ddf87d9d26abd6bfcfb543162b4f26450d9',
 'tests/helpers/refined-release-source.json.gz':'6b9e66890ecfeac7f0b581ece462edaf41095f6d2937896cf6032e9e8ee9a9a3',
});
const loadingRecoveryFiles=Object.freeze({
 ...refinedReleaseFiles,
 'tests/helpers/pc13-reward-cover-source.mjs':'cd9cf4d774a92df100e6e367bdbc41a58fa281cef428316f1671fd878167cd92',
 'tests/helpers/loading-recovery-source.mjs':'43bc339bf238105e3967e774cc6fa15091d386d8ad9746671bc9c2865780c4f4',
 'tests/helpers/release-map-deck-source.mjs':'d76d9d67c6e696d966fe9608a46e66eea0c0e2739c06dd9672151afd4b1f0973',
 'tests/helpers/release-ui-closeout-source.mjs':'ad5561e57e88406fa9615ff0ac7ed654b625112b7667c0b6da06d8a0fc4e3b84',
 'tests/fixtures/release-shop-fixture-source.json.gz':'cfafa1b569223099444cb0340d8483ecd5daade105effeb6934802fb73133020',
 'tests/fixtures/release-reward-display-source.json.gz':'c06069437d787cc0e590f2c6899b026e0ee47d060173b867dbd9dfcd8bb89255',
 'tests/fixtures/release-ui-closeout-source.json.gz':'1798bb413901e57c51a19f359721a4621212c7a48d51a7d4b48bdc4be05eddba',
 'tests/helpers/release-map-room-source.json.gz':'834f71a1a70fe4858c4874497f8f7b46ae02a8f1949041aacc2d91353d190b13',
 'tests/helpers/release-map-deck-source.json.gz':'8e16866bcec2fdc7628cbc91f7a74f09c18b9f621c6e065b75b2c98a8172a2d4',
 'tests/helpers/combat-visual-source.mjs':'6fbf561edae2163cb68163834289ea70b8ec94868507677be0f21fd9cabbfc7b',
 'tests/fixtures/combat-visual-source.json.gz':'c182bc4a8f2afef8e3aec0b32a43dcfd2c4f0c214763a34a86dec8e07daadc3d',
 'tests/helpers/energy-reference-source.mjs':'b756c8e44aa38c736bbcdb07ed24a676449ae6184447e18c28cb8b43ab324598',
 'tests/fixtures/release-reward-companion-source.json.gz':'f793e5dfb1d4c8b9a6f90d06e59a4aa777a820372ac13a70628e24dd5919ba88',
 'tests/fixtures/release-reward-frame-source.json.gz':'09f99aff296875fa9787a94bfd6be19c1a4d76dcb9a33fd6b1f31213d10cd8a5',
 'tests/fixtures/release-reward-entry-source.json.gz':'1ebaf2212130772f299fc9dca4a0664dbdf768a75bd3c5899a52d2efd38b7b1b',
 'tests/fixtures/release-reward-transition-source.json.gz':'a25a1fd1ad58ef7d504ec2743fd32fa6aa2a54c5e4b41734c1f3a9bb092478d2',
 'tests/fixtures/energy-reference-source.json.gz':'2b0f8c497c73a8afca47b01a41c7c8800f92c2879202c827df663269329ef19e',
 'tests/helpers/recording-0401-source.json.gz':'9af199338e44fb660599900c5474624853f02be24aa5590029f37cee2a551e24',
});
const travelerStatusFiles=Object.freeze({
 ...loadingRecoveryFiles,
 'tests/helpers/combat-visual-source.mjs':'56a4c47f810f88c3dc1380f2c7f7c5cc8e42085950881f93e0fb10355c308ed6',
 'tests/helpers/release-replay-continuations.mjs':'693477ca050c9f8eee0817fb308fc5d023bff4b020c4ab147d178b1ebf8fae23',
 'tests/fixtures/release-replay-continuations.json.gz':'a2abaa3feb21f2f1a2e8f9c9fef3da2af3525073110eebaa394d82b71a095b95',
 'tests/fixtures/release-deck-lineage-source.json.gz':'a32c93925e562ee1c617bd647e18f131a0c066659eb653ba67afe3beb75454d0',
 'tests/fixtures/release-replay-final-source.json.gz':'2b3737cb405ce06c42d6dfe5f099a234f452f4b174f97dc481d0e149cb1b23fd',
 'tests/helpers/traveler-status-source.mjs':'2c853e67bd0148ed6de45a3e6ac0e69fe97dd543f967ecbb492f498c46e3c741',
 'tests/fixtures/release-battle-detail-source.json.gz':'62be372b9fcdbfee8c06bb68cf3808ec8932ed8097537c85c83fa85310e6ea9f',
 'tests/fixtures/traveler-status-source.json.gz':'78ea0afbc225eb83cfd79d24cbed5c1af166e21c07f2adfec3588b488a0d0de2',
});
const atomicCardEffectsFiles=Object.freeze({
 ...travelerStatusFiles,
 'tests/helpers/release-ui-restore-source.mjs':'164e42ed69f1f80e9bce027292f8537eac24fd26cbec32584347b1340110b82c',
 'tests/helpers/atomic-card-effects-source.mjs':'bd3d19b9a1494f3f8ae44cff7a5f95f7ce4e05b3ebda719b7dc213169cb83576',
});
const compactPopupReplayFiles=Object.freeze({
 ...atomicCardEffectsFiles,
 'tests/helpers/refined-release-source.mjs':'3b55f033d708eed73deb6f0507f9b178f536dff3c2063aa619d9a92fb018a3e0',
 'tests/helpers/refined-release-successor-source.json.gz':'42e07bbfd3fe5c4ccfa04581fb7bafdb5d9ed99d1d58e586b16bd93511d14ce5',
});
const inside=(root,path)=>{const r=relative(root,path);return r!==''&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('../')&&!r.startsWith('..\\');};
export function copyIntegrationSourceClosure(directory,{sourceRoot=process.cwd()}={}){
 const destination=realpathSync.native(directory);
 assert.notEqual(destination,realpathSync.native(sourceRoot),'isolated helper copy destination');
 for(const [path,sha]of Object.entries(compactPopupReplayFiles)){
  assert((path.startsWith('tests/helpers/')||path.startsWith('tests/fixtures/'))&&!path.split('/').includes('..'),'fixed helper path');
  const source=join(sourceRoot,path),content=integrationClosureBytes(path,readFileSync(source));assert.equal(hash(content),sha,'fresh helper copy identity: '+path);
  const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});
  assert(inside(destination,realpathSync.native(dirname(target))),'helper destination parent escaped');
  if(existsSync(target))assert(inside(destination,realpathSync.native(target))&&realpathSync.native(target)!==realpathSync.native(source),'helper destination aliases source');
  writeFileSync(target,content);
 }
}
