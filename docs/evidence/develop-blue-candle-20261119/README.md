# M10 / TASK-38.8：当前 Develop 蓝蜡烛显示差异复现

**REPRODUCED_NOT_FIXED。只保存未修复缺陷证据，不改生产代码、原负责人、任务状态或验收。**

## 身份与占用

- 基线 `develop@2ec45b9e52c870badc4d4888f6243a30556eecb4`。本轮使用该源码的 `build-lua-data`、`build-ui --official-assets --native-page-lifecycle`、实际 Run/奖励/遗物 UI 与现有 mock 原生控件夹具。
- [#743](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/743) `54d9f0c2` 的手机 20 项把 M10 指向 TASK-38.8；任务仍 To Do / Furinya，38.7、38.8 的 `check-pr-slice --start` 均 ALLOW。但 ALLOW 不代表无人接续或新认领。
- [#689 的冻结交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/689#issuecomment-6983904380)将 `30ead257` 保留给维护协调线接续；[后续最小修复](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/689#issuecomment-6961349688)已提供 `f443b829`，本轮不重复实现、不覆盖该 owner。
- 备选远虑的 [#685 冻结交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/685#issuecomment-6982082079)明确由原 FurinyaDev 接续，同样未接管。#743 的文档更新不算两项修复已集成。

## 真实运行结果

1. 生成官方素材配置，正常启动 mock Host，进入一场真实战斗，再明确布置战斗奖励 `{id='blue_candle', sourceId='Blue Candle'}` 及另一个未领取奖励。这是隔离奖励状态，不冒充自然掉落或完整通关。
2. `Hooks.localId('Blue Candle') == 'blue_candle'` 正确；奖励四态实际写入的图片均为 `102028` 通用盒子，行级/状态内均无绘图池。
3. 通过现有真实注册点击领取，持有 ID 为 `blue_candle`，本行隐藏，另一奖励仍未领取。顶栏及详情都绘出已有的 **7 图元蜡烛**，逐图元检查图片、位置、尺寸和颜色。
4. 全程核对 Relic Pool、card/misc/treasure RNG 快照不变。随后期望奖励也有蜡烛图元的断言失败：`BLUE_CANDLE_REWARD_IDENTITY_GAP`，原 Lua exit **1**。

此证据支持“奖励图像接线缺失”，不支持“实体 ID 管理失败”的猜测。当前遗物映射和已持有视图已经正确，不应为此改遗物效果、抽取、持有状态、随机流或重画资产。

相邻原测试 **3/3 PASS、0 skip**：官方/旧 profile 的遗物身份与详情、奖励四态原生写入及缓存、已批准图元 registry 覆盖。日志分别为 `adjacent.txt`、`registry.txt`；此处不把原测试通过当成 M10 已修复。未运行 Full、GUI、GIL 构建、官方客户端或实体手机。

## 最小接续面，仅供原 owner

| 文件 | 当前 Develop blob | 冻结 #689 blob | 原产品增量 |
| --- | --- | --- | --- |
| `scripts/lowcost-art.mjs` | `48076b4887d7f1e2151a431ee2eb2d9530ce13d8` | `83d3b832bb926ef0e784ac63fe4ae9936ecadd91` | +14/-0，奖励行单个真实 fallback/16槽图池 |
| `src/lua/abyss_battle_reward_layout.lua` | `94bc42403f9cdbd37851a1c92127d78a04bb274e` | `3fca40df0a4e2a70b6ac8dfad52e39d093e0e7b0` | +25/-1，使用已有图元绘制 |

这是相对当前 Develop 的两个文件差异规模，不是已应用补丁。原 owner 恢复时还须复用 `f443b829` 的共享 icon 所有权缓存、严格 GetChild 和故障回退修复及原测试，不要只搬旧 #689 两文件便宣称完成。保留后续正式来源认证与正常门禁；不要整支反合旧 Release 或把来源桥改为无条件接受。

## 重现

准备该精确源码及已安装依赖，按 `assets.json` 校验 13 个素材实体（其中 4 个 LFS 图片，不能用 pointer 代替）。在源码根目录执行：

```sh
node docs/evidence/develop-blue-candle-20261119/reproduce.mjs
```

脚本检查当前产品/测试/数据与固定 Develop 无差异、素材 SHA256 正确，向新临时目录生成真实配置，并通过原 `runLua` 执行本目录夹具。诊断 wrapper 返回 0 仅表示预期的 **Lua RED=1** 被复现，不是产品 GREEN。临时目录保留生成文件、原始 RED 和诊断 JSON。生成目录路径或栈回溯绝对路径不同不影响事实。

本轮 Node v24.22.1。`reproduce.lua` 只调用真实模块与已有 mock 原生 API，没有替换生产模块或注入旧源码。尚未取得当前 GIL、官方导入/ready、容量或同候选物理手机证据，TASK-38.8 的手机验收保持开放。
