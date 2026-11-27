import assert from 'node:assert/strict';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';

// #1038 changes only these exact inputs for older release replay readers.
const inputs=Object.freeze({
 "package.json": {
  "current": {
   "sha256": "60a08b0a51427fcdfb6db06469c07879f44877fbd81b42893dcf9083a8a98dcb",
   "gitBlob": "f43701d1c755f70062160c13eaa7ebc978c6ea9a"
  },
  "previous": {
   "sha256": "4fb5b1280263635ae4519ec3bcf770545040485904a36659224a6b88acb6b613",
   "gitBlob": "cf6ccf739391efb3da0b2552c6bd5f2e78dd51ce"
  },
  "hunks": [
   {
    "at": 1,
    "before": "  \"name\": \"slay-the-abyss\",\n  \"version\": \"2.1.1\",\n  \"private\": true,",
    "after": "  \"name\": \"slay-the-abyss\",\n  \"version\": \"2.2.0\",\n  \"private\": true,"
   }
  ]
 },
 ".release-please-manifest.json": {
  "current": {
   "sha256": "07b8bb45bc8f88ecddc657a1b14a42e986e9e60f44149bc7dd1a0523b7c9a90e",
   "gitBlob": "a5d1cf2884c2db4168988713a84ce78383b7ed5a"
  },
  "previous": {
   "sha256": "67e95d962da4978f64c3f9656a9602f85d2ed7ae097e92ab16e9124fa83991a2",
   "gitBlob": "48fbed9138c465728757742777f05de0f5d5a2a2"
  },
  "hunks": [
   {
    "at": 0,
    "before": "{\n  \".\": \"2.1.1\"\n}",
    "after": "{\n  \".\": \"2.2.0\"\n}"
   }
  ]
 },
 "CHANGELOG.md": {
  "current": {
   "sha256": "ccaef1902cb436b0161f6cf43ab6a6382ddd77d641265116172c5903c73098ee",
   "gitBlob": "3763fac5b5418af1e76a511c4d8cf73c356013ac"
  },
  "previous": {
   "sha256": "8df706839da1f445aae118f5483af85c68a910e6b279c5207534e604d651513b",
   "gitBlob": "41409da7947a7b3b688810473e94a64b72367081"
  },
  "hunks": [
   {
    "at": 6,
    "before": "`v1.0.0` 为正式参赛作品的待验收候选，与旧 Alpha 作品独立。2026-10-29用户确认旅行者已通关两幕并授权发布：本版只开放岩系旅行者，雷电将军移至下一版本。实际平台发布凭证尚未登记，以下版本日期不代表已经公开上线。\n",
    "after": "`v1.0.0` 为正式参赛作品的待验收候选，与旧 Alpha 作品独立。2026-10-29用户确认旅行者已通关两幕并授权发布：本版只开放岩系旅行者，雷电将军移至下一版本。实际平台发布凭证尚未登记，以下版本日期不代表已经公开上线。\n\n## v2.2.0 (2026-11-27)\n\n### 优化\n\n* 战斗界面适配不同屏幕比例，改善手牌排列、两侧控件和出牌动效。\n* 更新前两幕的战斗背景，调整角色和敌人在场景中的站位与接地效果。\n* 调整选角页的信息布局，让角色说明更易查看。\n* 顶栏使用统一的地图图标，打开地图预览后可以返回原界面。\n\n### 修复\n\n* 修复新开游戏后序章的「继续」按钮有时无法推进的问题。\n* 修复满药水槽时的购买交互，腾出空槽后可以直接购买刚才选择的药水。\n* 调整事件长选项的排布，避免占用事件正文的阅读空间。\n"
   }
  ]
 }
});

export function beforeReleaseMetadata(path,raw){
 if(!Object.hasOwn(inputs,path))return raw;
 const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
 if(typeof source!=='string'||Buffer.isBuffer(raw)&&!Buffer.from(source).equals(raw))return raw;
 const lf=source.replaceAll('\r\n','\n');
 const {current,previous,hunks}=inputs[path];
 if(lf.includes('\r')||source!==lf&&source!==lf.replaceAll('\n','\r\n')||!exactSourceMatches(lf,current))return raw;
 const prior=restoreExactFixtureHunks({path,beforeSha256:previous.sha256,afterSha256:current.sha256,hunks},path,lf);
 assert(exactSourceMatches(prior,previous),'exact prior release metadata: '+path);
 const restored=source===lf?prior:prior.replaceAll('\n','\r\n');
 return Buffer.isBuffer(raw)?Buffer.from(restored):restored;
}
