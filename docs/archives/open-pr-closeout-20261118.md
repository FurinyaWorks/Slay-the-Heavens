# 积压 PR 源码与恢复索引

这里保留原 PR 的完整源码、提交关系和历史证据。表内固定提交均可从本归档引用取回。后续以各 PR 的实际合并或关闭记录为准。恢复某项时，从当时实际 `develop` 或 `release/v2.0.0` 开一个短分支，提取表内独立范围，重新校验源码、目标基线和验证证据。

| PR | 目标 | 原始来源 HEAD | 已承接范围与下一项 |
| --- | --- | --- | --- |
| [#714](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/714) | develop | `d8b714bc25ec8777cb3d947bd07fa4abc55f8835` | #724 角色准备、#727 结局校验、#733 角色选择渲染已合。剩余药水文本和其他跨模块架构工作按原提交推进。核心 Actor/Combat 接口先通过兼容迁移降低耦合。 |
| [#711](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/711) | release/v2.0.0 | `1a6dfc30d6726eaeea45bde78c4d8c93eed9d81c` | 八个 Lua 输入所有者合成树 `f24cc815c9622d6190c021178668f3405ef66631`，受审基线 `91d6f955e16dcf91d24971450abaa72d12a4efa3`。恢复时使用固定候选和独审，基于当时实际 Release 重跑原生必需检查。旧 [Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44339610524) 和 [Licenses](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44339610459) 的状态只属于该候选。 |
| [#699](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/699) | release/v2.0.0 | `8d4e5c4a690ef8ccec4f4914e7ebe063523a0d96` | PC01 标题与菜单状态从 `c41b162b` 提取，定向候选 `eb6ab67402cb86c72da616d0f16d078d8a79ac81`。默认 UI 字节一致，官方/V25 有实际控件增量，需常规 CI 和容量验收。PC18 物品身份、PC21 阴影另行提取。 |
| [#696](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/696) | release/v2.0.0 | `e9866fece8a01ed5fd5dc5530d8b4d9da4bbc9bc` | #697 已承接返回地图；保留 `a925ce43`、`93ae7376` 的共享选牌分页、确认、底部重叠修复。源和历史测试目前冲突。 |
| [#690](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/690) | release/v2.0.0 | `cd9106c0e302cb50f83ba8b5c85ce81560c6ed88` | #697 返回地图和 #695 图标已合。原 `a9425afa` 的重复导航和旧帮助入口须分开验证，旧 [Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43979432717) 失败。保留默认布局回退和官方入口。 |
| [#689](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/689) | release/v2.0.0 | `30ead25768a2522be9ae9a1fac105b8c56fba67a` | `23bed75c` 奖励和遗物栏共享蓝蜡烛图标仍待接续。保留 `658aef31` 与 `f443b829` 的来源；先解决与当前低成本美术管线的冲突，再验证奖励、遗物和实际发布容量。 |
| [#684](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/684) | release/v2.0.0 | `10d7ef9658872ec7d118b585fbc81e3da585c552` | #723、#728、#732 已承接商店排架、采样与 PC17 目标角标。新增 PC35 的一行清理源 `99ab019a329497725d98d6a475db4fc0910054fe`；按实际手势基线复测，再处理其余 38 条 QA 台账。 |
| [#680](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/680) | release/v2.0.0 | `f0a53ababbc23adf2236fc5c157d33fc35ea5d09` | 原修复 `41334b11` 处理商店遗物弹窗点击穿透。现有 Release 候选 `345882b21a70ed7092ed854cf3e183c1440657a8`；与 #711 组合候选 `fcfca4bb9efcc416429ec7b6e76c8dd1c1b2cf3a`。旧设备、官方导入及容量证据从固定原头获取。 |
| [#668](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/668) | develop | `f0bb1f342d14f4bf58753c9c2ac88fc9112e9bc1` | #731 已承接金币不足一句。保留已批准的 v3 文案、Neow、Boss、开场及商人剩余修改和证据。#661/#663 已合；原叙事测试冲突和校准失败须按剩余范围解决。 |

Release 官方候选导入、Ready、设备和容量验收在对应 PR 和版本任务内继续记录，停止旧分支不改变验收结果。

旧 `archive/release-integration-20261114` 的完整快照保留于 `9c6c316ea7d70746438798cdff1cedf5ff595d35`。其保存的 #659/#660/#662 来源和 #661 候选可通过该提交访问。早期归档仍在本归档的完整历史中。
