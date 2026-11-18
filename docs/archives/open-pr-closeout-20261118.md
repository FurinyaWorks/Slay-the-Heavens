# 积压 PR 源码与恢复索引

这里保留原 PR 的完整源码、提交关系和历史证据。表内固定提交均可从本归档引用取回。后续以各 PR 的实际合并或关闭记录为准。恢复某项时，从当时实际 `develop` 或 `release/v2.0.0` 开一个短分支，提取表内独立范围，重新校验源码、目标基线和验证证据。

集成接续由维护协调账号 `v5g95m7t8m-max` 负责，原任务负责人和验收项沿用原记录。

## 实际合入

| PR | 目标 | 合入提交 | 范围 |
| --- | --- | --- | --- |
| [#680](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/680) | release/v2.0.0 | `4628caadac5f419a4253c85ddbcc3870192a1fa7` | 商店点击穿透 |
| [#734](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/734) | develop | `966b393161cd93d78e2e2cdc2f626f56118e07c9` | #668 两段事件开场 |
| [#735](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/735) | develop | `2ec45b9e52c870badc4d4888f6243a30556eecb4` | #714 药水文本格式化 |
| [#736](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/736) | release/v2.0.0 | `872c2a8fb6da72c75460d6749b091a9e58eef25c` | #684 PC35 取消后提示残留 |
| [#737](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/737) | release/v2.0.0 | `1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2` | 三处 HUD 历史校准修复 |

## 原 PR 来源及恢复条件

| PR | 目标 | 原始来源 HEAD | 已承接范围与下一项 |
| --- | --- | --- | --- |
| [#714](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/714) | develop | `d8b714bc25ec8777cb3d947bd07fa4abc55f8835` | FROZEN。#724 角色准备、#727 结局校验、#733 角色选择渲染及 #735 药水文本已合。剩余 75 个原 Lua 路径；核心 Actor/Combat 接口按兼容接口迁移。 |
| [#711](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/711) | release/v2.0.0 | `1a6dfc30d6726eaeea45bde78c4d8c93eed9d81c` | FROZEN。原受审基线 `91d6f955e16dcf91d24971450abaa72d12a4efa3`，树 `f24cc815c9622d6190c021178668f3405ef66631`。修补三项历史 HUD 校准后的旧基线候选 `50c78ce2d6ac9e4858e6603eb5b3b9dedeb4b471`，81 项校准通过。恢复时基于实际 Release 重新审查并走原生必需检查。[旧 Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44339610524) 与 [旧 Licenses](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44339610459) 只对应原候选。 |
| [#699](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/699) | release/v2.0.0 | `8d4e5c4a690ef8ccec4f4914e7ebe063523a0d96` | FROZEN。PC01 标题与菜单状态从 `c41b162b` 提取，定向候选 `eb6ab67402cb86c72da616d0f16d078d8a79ac81`。默认 UI 字节一致，官方/V25 有实际控件增量，需常规 CI 和容量验收。PC18 物品身份、PC21 阴影另行提取。 |
| [#696](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/696) | release/v2.0.0 | `e9866fece8a01ed5fd5dc5530d8b4d9da4bbc9bc` | FROZEN。#697 已承接返回地图。保留 `a925ce43`、`93ae7376` 的共享选牌分页、确认、底部重叠修复。源和历史测试目前冲突。 |
| [#690](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/690) | release/v2.0.0 | `cd9106c0e302cb50f83ba8b5c85ce81560c6ed88` | FROZEN。#697 返回地图和 #695 图标已合。原 `a9425afa` 的重复导航和旧帮助入口须分开验证，旧 [Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43979432717) 失败。保留默认布局回退和官方入口。 |
| [#689](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/689) | release/v2.0.0 | `30ead25768a2522be9ae9a1fac105b8c56fba67a` | FROZEN。`23bed75c` 奖励和遗物栏共享蓝蜡烛图标仍待接续。保留 `658aef31` 与 `f443b829` 的来源。先解决与当前低成本美术管线的冲突，再验证奖励、遗物和实际发布容量。 |
| [#684](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/684) | release/v2.0.0 | `10d7ef9658872ec7d118b585fbc81e3da585c552` | FROZEN。#723、#728、#732、#736 已承接商店排架、采样、PC17 目标角标与 PC35 取消提示。其余 QA 台账、验收和生产来源保留。 |
| [#680](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/680) | release/v2.0.0 | `f0a53ababbc23adf2236fc5c157d33fc35ea5d09` | 原 `41334b11` 的商店遗物弹窗点击穿透修复已实际合入 `4628caadac5f419a4253c85ddbcc3870192a1fa7`。与 #711 组合准备 `fcfca4bb9efcc416429ec7b6e76c8dd1c1b2cf3a` 可作历史参考。正式同候选导入、设备、Ready、发布容量仍需验收。 |
| [#668](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/668) | develop | `f0bb1f342d14f4bf58753c9c2ac88fc9112e9bc1` | FROZEN。#731 已合金币不足一句，#734 已合圣职者与净化神龛开场。保留其余 v3 文案、Neow、Boss、商人和测试证据。#661/#663 已合。 |

## #684 其余生产来源

- PC16 弹窗材质取自 `cea8e119`，先与已合商店排架协调。
- PC37 初始拖牌金线取自 `cd2f653b`，沿用双布局回归。
- PC27 分裂位置取自 `e1e2e663`、`08590b14`、`53e41069`，一并核对 RNG、回退和宿主。
- PC32 睡眠状态取自 `91a8ae2c`、`d4866650`、`0331597e`，与 #687/#725 的角色写入协调。
- PC02/05/15/26/28 Ready/弹窗生命周期取自 `5ee15392` 与 `3d752468`，需要同一批验证相关模块及重入。

## #711 恢复候选

准备提交 `0e2e81853da5a7ab7aef5a1a5b1e4cb0f5358cd8` 固定在归档历史内，基线为实际 `release/v2.0.0@1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`，候选树为 `c79250f342bb254bd2a5dbe6b29ba9831daed6ee`。合成保留已交付的 #680、#736、#737，认证 129 份当前来源和 84 份历史目标。数据及 UI 构建通过，5 项来源/回放与 2 项运行时用例通过，其中包括 26 个混合输入 ID 场景。此准备提交仍需同一 HEAD/BASE 的原生必需检查和独立复审。官方候选验收仍待核实。

Release 官方候选导入、Ready、设备和容量验收在对应 PR 和版本任务内继续记录，停止旧分支不改变验收结果。

[#699、#696、#690、#689 的详细来源和回归入口](release-pr-continuations-20261118.md)。

旧 `archive/release-integration-20261114` 的完整快照保留于 `9c6c316ea7d70746438798cdff1cedf5ff595d35`。其保存的 #659/#660/#662 来源和 #661 候选可通过该提交访问。早期归档仍在本归档的完整历史中。
