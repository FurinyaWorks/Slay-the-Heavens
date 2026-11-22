# 核心 Lua 解环与复杂度治理

## R — 需求

Owner 批准本轮专项目标为完整 AST 图零 SCC、全库 CC>30 为零、新函数 CC≤15，且既有 CC>15 不增长。只向 develop 交付。玩法、数值、存档、现有发布候选和 CI 保护沿用当前合同。

当前基线为 `345ba08398b6ca8e1361a126f2ce1de85210e634`。固定 Luacheck 测得 351 模块、6236/6236 函数与初始化块、CC>30 为 25、CC>15 为 198、最高 64。完整依赖图有 1989 个引用位置，包含延迟导入，SCC 为 67/11/2。

## E — 所有权

沿用[领域状态归属](2026-11-03-domain-architecture-design.md#4-状态所有权与提交边界)。Run 提交会话及永久状态，Combat 提交行动队列与回合，Actor 提供状态命令，Power 成员模块提供共享怪物显示列表的增删及排序。Actor 等现有生命周期 owner 保留各自的专用写入。Schedule 持有独立的 hook 调度次序。UI 经现有命令发送意图，平台负责原生生命周期。

## A — 接续策略

取回 [#714](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/714) 固定 HEAD `d8b714bc25ec8777cb3d947bd07fa4abc55f8835`。已经合入的 #724（角色数据）、#727（结局校验）、#733（选角渲染）、#735（药水文案）保持当前实现。其他职责逐片核查真实调用者。原提交与旧 Hosted CI 证据保留在 #714。采用明确的状态 owner、职责叶和宿主命令；用既有脚本对完成的边界增加可执行约束。

## S — 切片与验收

| 原路径 | 当前依据 | 行为合同和验证 |
| --- | --- | --- |
| Order 与 Schedule 互导 | 两条完整图边，Schedule→Order 为 deferred | 移出显示成员簿，保持公开可替换方法、稳定排序、脱离帧、异常身份及两种冷加载顺序。用 Power/Shop 独立 VM 合同、源码边界与反向边负控验收。 |
| Actor、Combat 与牌/遗物反向回导 | 67 个模块；#714 提取 Actor 规则叶、Combat 命令及 host 接口 | 验证原身份、顺序、异常和回滚。特别复验死亡/HP 回调、Watcher、Silent、Writhing Mass 的原失败输入。 |
| Stasis 死亡返还 | 实例升级与血债血偿费用拆为核心规则。Stasis 仍由原事务返还同一张牌，Combat 保留公开升级入口。 | 核对现实塑形升级时机、满手返弃牌堆、费用偏移，以及升级抛错时卡实例、队列与 RNG 的回滚。依赖门禁拒绝规则回导 Combat、Actor 或战士状态卡模块。 |
| Run 永久命令与奖励/遗物回导 | 11 个模块；#714 使用显式会话命令能力 | 生产调用及直接夹具同步迁移。验证嵌套失败、退款、状态图别名及 RNG。 |
| 25 个原热点 | 同轮完整 Luacheck 数据，包含匿名及初始化块 | 先逐项按真实职责拆分；对比原行为、事件值、输入/控件生命周期及错误返回。 |
| 完整图与测试分片 | #714 原历史输入绑定代码落后于当前 develop | 保留历史来源，按当前精确树提供出处和投影；同时单独验证真实当前库存、测量和每个分片。 |

## O — 执行与证据

使用 `npm run check:quality`、`npm run check:engineering` 和 `node scripts/check-quality-ratchet.mjs --base <BASE>`。已有完整影响分析优先用于选择本地测试与可选 Fork 预检。正式准入按 [CI](../CI.md)，逐片绑定独立审查的 HEAD、BASE 和合并树。只有实际合入和 `verify:delivery --merged` 通过后才能收口 TASK-74.19/74.20。

### #714 托管失败证据

- **行为及宿主接线**。原 run `44142620259` 的 fatal HP、Parasite、Max HP 路径出现 `combat=nil`、`A=nil` 和 `transaction_failed`。Watcher／队列分片另有 `supportsWatcherFinal`、`initializeGeneratedCard` 缺失，Silent 药水返回 `potion_effect_failed`。移植时从真实宿主或旧 VM 夹具逐例重放，保留旧断言。[HP 与 Parasite](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44142620259/job/134250485812) · [Watcher 与队列](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44142620259/job/134250485947) · [Silent 药水](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44142620259/job/134250485997)
- **来源及 CI 合同迁移**。旧 Watcher owner、Inventory inverse、helper copier 哈希和完整生产图要求精确历史字节。15 片 POSIX 的历史断言与实际 16 片候选库存也各有原合同。旧 oracle 仍用旧来源。候选使用真实现行源码和完整库存，并在确有变更处绑定精确继任，不用更新旧哈希或基线获得通过。[Watcher 来源](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44142620259/job/134250485917) · [完整分片](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44142620259/job/134250485872)
- **基础设施与权限**。原运行已分配 runner 并执行到断言；这些失败保留行为／来源分类。当前新检出曾将两份历史 LFS 档案留成指针，按仓库对象 OID 恢复后重验。当前正式准入单列 GitHub CLI API 403；保留原合并入口和保护。

## N — 同步

设计变化随代码更新本文或关联 ADR，保留旧新执行身份、对应测试和反例。发现历史不等价时记录原断言和输入。Backlog 继续沿用 TASK-74.19/74.20。

## S — 约束

复用完整测量和既有 CI；保留所有原断言、历史来源、静态基线和专项门禁。原 #714 与托管失败是接续证据。绝对零环和 CC30 门禁在对应债务清完后启用。
