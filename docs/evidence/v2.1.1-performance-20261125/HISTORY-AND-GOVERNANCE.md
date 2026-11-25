# v2.1.1 历史验收与治理调查

## 关键结论

- 历史验证已能发现冗余原生操作、生命周期异常、部分初始化昂贵与不利的暖态尾部。此次遗漏是**覆盖和交付证据缺口**。TASK-100 的原始探针按设计从 Lua/Host 内起算，使用固定普通负载，统计选定原生 setter，还缺少正式候选归属的设备分层数据。早期版本覆盖到哪一步要看具体收据。[^task100] [^task421] [^sdk]
- P0 有两个已证实的项目侧同步成本。#953 在旧 RC 同源 Linux/Fengari 五组交错样本，`OnStart` 墙钟中位数 687→370 ms，标题前解码 42→0 份，观察到的首战解码 1 份，两个版本标题均在第 2 次模拟更新可点。#954 的三组 A/B 为地图组查询 391→5，标题仍第 2 次更新可点，地图 Lua 检查 28/28。将这些先验结果用于决定复测范围。低端设备进不去的直接原因、iPhone 14 Pro 差异和平台 T0→T1 时长仍为 UNVERIFIED。[^953] [^954] [^955]
- 正式 v2.1.0 Git `eb64f4e6cd45198118e123b6640dc491f186e329` 与官方 GIL 来源 `55d6396cf315cf1e30085d9521fdb3bfaadeb2ad` 的树均为 `79f1e6fce95640256bf7d4fbaa710c4a469a3b3f`。正式 GIL SHA-256 `bbba3f515d3319058207b82b8c0a3ca2eb70ed55b5c338651bce94c3d78be09f`。#950 记录 Owner 同候选线上回归与应急 PR 合入，当时精确源 Full 尚未结束，后来结论为 failure。应急记录保全了来源和已知风险。完整日志目前没有证明 Full 红项造成玩家故障。[^950] [^full]

## 5 Whys：为何此前测试没有提前暴露部分玩家的启动和交互问题

| 追问 | 有证据的回答 | 判断范围 |
|---|---|---|
| 1. 为什么很多测试通过或已有大量记录，玩家仍报告进不去或出牌卡顿？ | 现有通过记录覆盖功能合同、局部原生操作和人工抽样。历史报告把 28 分钟该轮“热但不卡”、60 分钟另一轮“出牌卡顿可能误打”分开。TASK-4.21 已勾选分阶段记录、重复写入和同战斗覆盖，实体手机冷/暖启动、输入反馈、累积压力的 AC3/5/6 未勾。 | 覆盖差异 CONFIRMED。玩家设备故障的现场原因 UNVERIFIED。[^task421] [^mobile] |
| 2. 为什么已有运行时基线漏掉边界？ | TASK-100 旧入口启动固定种子 1 的 Fengari Host 夹具，冷阶段从 Lua 脚本内加载、暖阶段使用相同 VM 并包括前一个 Host 停用，取三份样本，n=3 的 P95 就是 max。计时含观察器，内存为 Node RSS/heap，方法计数排除了 `GetChild`/`GetChildren`。流程有 300 次静止更新和牌库往返，奖励由人工注入终态，缺少平台进入、原生 GPU 呈现、报障手机触控及宿主热状态。开并关牌组的组合标记也无法识别首框、首卡、整屏和可点的不同时间。默认 `npm run build:ui` 的实测产物为 `monsters=false`、65 字节空怪物数据模块；Host 夹具沿用该开关，原生画师绕过 `require`。 | 可执行代码和产物直接证明。默认负载没有经过 #808 的 42 份解码；查询排除使 391→5 不能从旧直方图读出。[^runner] [^task100] [^954] [^defaultprofile] [^flag] |
| 3. 为什么修改通过容量、结构和行为检查还会变慢？ | #808 的验收证明图元值、绑定和布局保留，完整 GIL 缩小 928,997 B，并明确 `require` 中还原。发布树中 `scripts/monster-art.mjs:18–37` 逐资产切字符串、转数字、分配数组和表。此工作在用户点击 Start 前全量执行。#890 删 1,305 个隐藏子控件及不可选数据并减少 1,207,998 B，证据是结构和实际序列化字节。TASK-100.1 的最终同源 A/B 也记录冷控件 19,539→14,938、三种暖态 P95 全部上升。这些是容量、创建次数、耗时各自需要测量的现成反例。 | #808 的 eager 解码技术与架构根因 CONFIRMED。#890 对真实启动耗时的贡献 UNVERIFIED。[^808] [^890] [^decoder] [^953] [^sdk] |
| 4. 为什么自动化没有把这种转移变成首发阻断？ | 原 Host 运行时脚本是 opt-in，日常 `check:platform-load` 关注增长、源码装配、结构与重复配置。官方门禁是独立工作流出口，日常 PR 不要求实体设备。真实 GIL 的历史 SDK 实验本就保留原生客户端边界；TASK-100 所有 AC 和 TASK-100.1 的治理接线 AC5 仍未勾。六档压力机制到本次旧 RC 才落地，时间异常是观察项，原门禁保留。其自动工作流两臂默认也用裸 `npm run build:ui`，正式精绘启动另跑同候选生产配置。 | 测量信号未进入日常发布反馈的工程缺口 CONFIRMED。现有门禁本身已有明确边界。[^task100] [^task1001] [^platform] [^pressure] |
| 5. 为什么这些已知证据缺口没有在 v2.1.0 的最终交接里闭环？ | 发布证据分摊在 TASK-100（Host）、TASK-100.1（组件）、TASK-4.21（设备）和 `verify:platform-load`（官方同候选）。可见记录通过同树绑定和人工线上回归确认交付，并按 Owner 应急授权推进；没有找到一个同时含报障设备与对照设备、冷暖缓存、T0/T1/ready/实际可点、持续触控和官方负载的同 GIL 原始收据。历史官方容量 8.96/0.01 MB 没有当前候选身份，正式平台文档禁止沿用。 | 发布收据记录缺口 CONFIRMED。Owner 当时观察到的未归档详细数据、设备配置和平台失败原因 UNVERIFIED。[^950] [^full] [^platform] |

## 现有证据如何复用

| 线索 | 能直接用的结论 | 本次范围 |
|---|---|---|
| TASK-4.21 地图与战斗 | 300 次离线静止地图尺寸提交 15,000→1,200，敌人意图同值文字/图提交 300→0。同战斗覆盖往返 10 次时容器创建/销毁各 10→0。牌库生命周期 20 次关页后注册保持 14、零死亡注册。 | 复用负控与原生计数；实体手机启动、输入及长期内存清理仍由 TASK-4.21 接续。[^task421] |
| TASK-100 | 三 VM、固定种子、数据和脚本 SHA、方法和属性直方图、真实回合结束合同、保留失败。原基线可接受单独生成的观察器负对照。 | 保留这些优势。用现有 pressure 机制加入精确线上/候选同源冷暖样本，报告失败和超时，分开统计 SDK `GetChild` / `GetChildren`。[^runner] [^task100] [^pressure] |
| TASK-100.1 | 同源 SDK eager/lazy 最终冷控件 19,539→14,938，暖 19,539→16,060、净残留 0；菜单/选角/返回暖态 P95 17.659→19.815、11.379→13.522、13.135→14.639 ms。特定菜单窗口的代理 `nativeAt/GetChildren` 均为 0，不能推广到 #954 的地图构造窗口。 | 缓存、懒加载都可能把工作移到关键交互，按页分别记录第一反馈、首个完整内容、全部就绪和可点击。[^sdk] |
| TASK-100.2 | 隔离试验中差分 1,200 次写变成 1,200 次读，Tween 出现关键可见性/端点不齐；双 NO-GO 已归档。 | 不重启相同试验。将该证据用于筛选新优化，继续保留状态/视觉/可点击等价断言。[^nativeab] |
| 卡组既有成果 | #813 已合，正式资源 Host 的 80 张卡组首开地图重绘 1→0、位置提交 1,704→408。#932 是仍打开的 develop 专项，其离线方案提高首个可见牌速度，10/75 张冷全页各增加两轮，暖全页轮数不变、CPU P95 5.595→6.677 与 6.517→7.232 ms。真实 HUD 暖开跟踪表明第 1 更新只设 `yielded`，第 2 更新 10 个模型发布后页面门同轮打开。 | #932 保持原分支归属，复用其独立指标与证据。若 v2.1.1 批次做卡组回退检查，应分别测试永久卡组、抽/弃/消耗堆、排序/翻页与旧触点。[^813] [^932] [^warm] |

## 分支收口审计

起点盘点 26 个远端分支、15 个开放 PR。起点不存在 `release/*`，#950 确认历史 `release/v2.0.0` 已自动删除，历史通过 `v2.1.0` 注释 Tag 与 #950 查回。下面是逐 SHA 的候选清理条件和任务依赖。审计未更改远端、Ruleset、Tag 或 PR。

| 远端 ref、固定 tip | 证据与结论 | 生命周期条件 |
|---|---|---|
| `rc/v2.1.1-performance` `85f5c50b9b610f639e4d582507033206013bfc18` | tip 是 `b0963d7a` 祖先。`0f755e91` 将初始手牌快路径完整撤下，保持敌名条件写入和失败重试回归。`origin/master..origin/rc/v2.1.1` 对 `src/lua/abyss_battle_card_view.lua` 无差异。 | SUPERSEDED。规范分支读回对应优化及明确回退后删除。保留提交、实验数据和关闭说明。[^battle] |
| `rc/v2.1.2` `6b5e2e6889bda1814a61cc2b646df39786464dac` | #953 与 #955 的稳定 patch-ID 均为 `cbbf774ed78d1b7bdd3158f0e8d7811653da8a8b`，两个文件对象相同。相对 `rc/v2.1.1` 不应迁移的差异是错版改号、RC 已撤下的手牌快路径和旧收据/负控版本。另有已关闭未合且具独有地图差异的子分支。 | SUPERSEDED。将 #954 迁至规范 hotfix 并验证、存证后，与子分支一起删除。[^953] [^954] [^955] |
| `fix/v2.1.2-map-startup-group-lookups` `1b4e5a6279dda9997b7aa7823daf131d20709af1` | #954 CLOSED，未 merge。独有生产差异仅 `src/lua/abyss_map_ui.lua` 八行新增一行删除。记录了 391→5 与 28/28。规范移植 `f10eefa2` 与原补丁稳定 patch-ID 均为 `407e7099ebe499848da0657ef1d0d4090c770377`。 | 规范 hotfix 读回补丁与同候选验证后为 DELIVERED_VERIFIED 或 SUPERSEDED。先保存原始 PR 和 SHA，再删。[^954] [^map] |
| `rc/v2.1.1` `b0963d7ac8fa1749d7287772903de968c3ca1bdc` | 发布 SCM 的规则是 `hotfix/v2.1.1` 从 master 起步。旧 RC 带敌名、修正版六档压力工具/负控、怪物解码和版本变更，也带原型快照修复。#948 `b540972d`、RC `3b5ae8c4` 与 hotfix `afde96d7` 的稳定 patch-ID 均为 `0a7dd38093b28097ea317ab94997eb2059bccbb4`。 | SUPERSEDED。由规范分支证明有效文件及测试等价；原型快照历史由仍打开的冻结 #948 独立保留。新发布或 CD 只用规范分支。[^955] [^pressure] [^950] |
| `perf/deck-cold-start` `00dc14e0b263572a47ddb5e855167ceeb3190ee7` | #932 OPEN 且仍为 develop 工作。其渐进呈现与 v2.1.1 的手牌回退属于不同差异，有既存 Full 红项。 | 保留。责任 Furinya；退出条件为当前 develop 工作完成、替代或明确关闭后依原准入核对。[^932] |
| `test/m8-warm-deck-sort-evidence` `9540c2f13542a55c9b22718756f58ad8f5ea69e1` | 4 个证据提交、17 个仅该 ref 具有的文件。#932 在评论里对这四份探针和原始记录有直接链接。没有以它为 head/base 的开放 PR，仍有实质公开依赖。 | 保留到 #932 的维护者把 17 个原件归入有效证据树或等效持久存档并读回，更新依赖入口。责任 Furinya。[^932] [^warm] |
| `test/m8-potion-identity-evidence` `9429d6f27944ae1b275bbe083899cafcd15593ef` | TASK-4.15 的唯一双药水实际布局探针、输出和配置分组，共 4 个文件。iPhone 14 Pro 2556×1179 只是离线布局投影。这一条不能作设备性能证据。 | 保留至 TASK-4.15 持久接收/替代，范围在本次性能热修之外。责任 Furinya。[^potion] |
| `test/release-orb-fixture-evidence` `b0c60636b222b777c4e40dc9644aad4eebf5b2dd` | 5 个唯一证据文件。历史 Release 精确失败可由测试夹具 `platform={}` 修复，颜色负控仍失败。改变仅在归档 patch，有限定向意义。 | 保留到发版验证负责人迁移原始证据或接受修复并明确处置。责任 Furinya。[^orb] |
| `test/v6-d-art-capacity` `4a785c8d4d02d970650b9fcd4d3a659961827281` | #916 OPEN，属于 V6 岩旅美术、离线容量对照。 | 保留到 #916 交付或替代。责任 Furinya。[^art] |

#950 自动删除历史 Release 后，#944 音频牌堆模板回执、#945 审核措辞、#947 音频夹具隔离、#948 卡牌原型快照均改指 master，标记 `release:frozen` 并保持 Draft。四者有公开 PR 依赖，保留到其维护者确认接受继承成果或给出替代记录。#917 是 develop 候选的活跃 CD 工单，#952 是 develop 工程/平台版本映射的活跃工单，均保留原任务所有权。[^950] [^917] [^952]

`evidence/manifest.json` 和三个小型 Git tar 收据保留上一表三条独立 test 证据分支的原始路径、blob SHA-256 及归档校验值。三份提取内容已和提交原件逐字校验。这是本次工作环境内的复核副本。正式迁移与依赖链接更新仍按各活跃任务执行。

## 可在现有机制内闭合的缺口

1. 复用 `verify:platform-load` 的同候选身份合同，在 TASK-4.21 的既有待验项补一个原始冷/暖证据矩阵。线上和 v2.1.1 候选各测报障/低资源设备以及 iPhone 14 Pro，对照宿主版本、画质、热状态、电量、网络、缓存策略和候选来源。录制进入按钮、`ABYSS_UI init`、`ABYSS_UI ready`、首个真正接受的标题操作。`ready` 只证明 Host 就绪和更新已开启。前段无可用日志时保留画面与故障原文，持续 UNVERIFIED。[^platform] [^entry] [^953]
2. 合用现有 TASK-100 与六档压力套件。固定源码、生成布局、内容、工具链和确定种子，交错配对。优先记录首战首次/后续解码、合法 10 手牌、连续出牌、前景卡组动作及 300 更新。CPU 和内存的 Linux 预算分别报告，设备场景独立。用窗内 Get 查询、真实点击、页面帧原因诊断；保留观察器自测与失败。[^task100] [^pressure] [^932]
3. 维持候选工程检查、真实 hosted 状态及官方验收的三份收据。应急合并的授权和待验项原样留档。`verify:platform-load` 缺官方同包资料继续返回 UNVERIFIED，实际失败保持 BLOCKED。最终有声 GIL 只认 freeze 之后的 hash、buildId、payloadDigest、候选提交与 CI Artifact；实际工作流及文件由 CD 审计核对。[^platform] [^950] [^full]

[^task421]: [TASK-4.21 固定追踪](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/b2f74d99a3d80e60b99165b6380987cda8b4488d/backlog/tasks/task-4.21%20-%20%E5%AE%9A%E4%BD%8D%E7%8E%A9%E5%AE%B6%E5%8F%8D%E9%A6%88%E7%9A%84%E6%89%8B%E6%9C%BA%E5%8D%A1%E9%A1%BF%E4%B8%8E%E5%8A%A0%E8%BD%BD%E6%85%A2.md#L33-L40)
[^task100]: [TASK-100 首份基线及范围](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/b2f74d99a3d80e60b99165b6380987cda8b4488d/docs/backlog-details/TASK-100.md#L5-L27)
[^task1001]: [TASK-100.1 验收准则](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/b2f74d99a3d80e60b99165b6380987cda8b4488d/backlog/tasks/task-100.1%20-%20%E7%BB%9F%E4%B8%80V25%E5%8E%9F%E7%94%9F%E7%BB%84%E4%BB%B6%E5%8A%A0%E8%BD%BD%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E4%B8%8E%E6%80%A7%E8%83%BD%E9%98%B2%E5%9B%9E%E9%80%80.md#L30-L37)
[^runner]: [TASK-100 运行器和观测限制](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/b2f74d99a3d80e60b99165b6380987cda8b4488d/scripts/benchmark-runtime-path.mjs#L44-L62)
[^sdk]: [TASK-100.1 actual-GIL 最终 eager/lazy A/B](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/b2f74d99a3d80e60b99165b6380987cda8b4488d/docs/backlog-details/TASK-100.1.md#L120-L124)
[^mobile]: [11-15 手机现场原始时间索引](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/b2f74d99a3d80e60b99165b6380987cda8b4488d/docs/backlog-details/MOBILE-QA-20261115.md#L19-L24)
[^pressure]: [六档压力 suite 原版本记录](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/b0963d7ac8fa1749d7287772903de968c3ca1bdc/docs/research/2026-11-25-resource-pressure.md)
[^platform]: [现有官方与日常负载门禁](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/55d6396cf315cf1e30085d9521fdb3bfaadeb2ad/docs/PLATFORM_LOAD.md)
[^decoder]: [线上生成器 require 时全量展开](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/55d6396cf315cf1e30085d9521fdb3bfaadeb2ad/scripts/monster-art.mjs#L18-L37)
[^entry]: [线上 OnStart 的 init 与 viewport 标记](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/55d6396cf315cf1e30085d9521fdb3bfaadeb2ad/src/lua/abyss_ui.lua#L147-L162)
[^nativeab]: [TASK-100.2 NO-GO 证据](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/b2f74d99a3d80e60b99165b6380987cda8b4488d/docs/evidence/native-ui-ab-20261111/README.md)
[^battle]: [保留敌名与撤销手牌快路径的提交](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/0f755e91d3dac5bd2899e128ff0f5d6749a77849)
[^map]: [#954 唯一地图补丁](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/1b4e5a6279dda9997b7aa7823daf131d20709af1)
[^warm]: [暖牌堆第一步探针及顺序](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/9540c2f13542a55c9b22718756f58ad8f5ea69e1/docs/evidence/m8-warm-deck-sort-20261124)
[^potion]: [双药水夹具](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/9429d6f27944ae1b275bbe083899cafcd15593ef/docs/evidence/m8-potion-identity-20261124)
[^orb]: [能量球旧夹具证据](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/b0c60636b222b777c4e40dc9644aad4eebf5b2dd/docs/evidence/release-orb-fixture-20261124)
[^art]: [V6 美术容量 PR #916](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/916)
[^808]: [无损容量压缩 PR #808](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/808)
[^813]: [地图卡组调用优化 PR #813](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/813)
[^890]: [裁剪闲置控件 PR #890](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/890)
[^932]: [Develop 卡组冷首开 PR #932](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/932)
[^950]: [正式 v2.1.0 交付 PR #950](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/950)
[^953]: [怪物按需解码 PR #953](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/953)
[^954]: [地图查找 PR #954](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/954)
[^955]: [怪物按需解码 v2.1.1 迁移 PR #955](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/955)
[^full]: [正式候选 Full 45420029137](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45420029137)
[^defaultprofile]: [精绘构建开关与图元生成器路由](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/55d6396cf315cf1e30085d9521fdb3bfaadeb2ad/scripts/build-ui.mjs#L139-L157)
[^flag]: [未开启怪物美术时跳过数据模块加载](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/55d6396cf315cf1e30085d9521fdb3bfaadeb2ad/src/lua/abyss_monster_art.lua#L91-L93)
[^917]: [Develop 候选构建 PR #917](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/917)
[^952]: [工程与平台版本映射 PR #952](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/952)

## v2.1.1 Hotfix 测试纠偏

| 为什么 | 源码与验证 |
| --- | --- |
| 为什么标题阶段漏测 42 份绘制？ | 日常 Host 与六档压力都读取默认 `build:ui` 的 65 字节空模块，旧观察器只计写入类方法。正式 GIL 的有声入口使用 refined v3、原生页面生命周期及组件模板。现有 Performance regression 增加同一有声参数解析器和生成器的核心路径。正式离线工作负载绑定生成的 actor、肖像及分块牌组模板，走实际 Lua `OnStart` 和用户控件，并记录查询及 setter。 |
| 为什么 #706 的粒子性能回归？ | `72870245` 的实现与测试在冻结 `1ceb7c1a` 均存在。#775 `90ef4874` 把入口树替换为 develop `ff6af63d`，旧写入重新出现且粒子测试消失。实际发布线从该 develop 树经 #777 `fdc8178e` 重建，`55d6396c` / `eb64f4e6` 都不含有效修复。#956 `3c832e03` 恢复粒子发布。相同快照及粒子寿命仍受既有测试保护。 |
| 为什么选角回归跟着测试通过？ | #812 `c186c1dc` 和回流 #839 `5a972c73` 移除错误摘要。#900 `2ab5404e` 恢复两控件，同时把正式布局和 Host 断言反向改为要求存在。该 PR 的设计引用检查未运行，Quality impact 作业 [45026925950](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45026925950) 先失败。#923 `b131b84b` 按已批准 `release-sts1-20261122` 恢复摘要缺席和手机两行介绍。默认全量角色预览仍单独测试其原有摘要用途。 |
| 为什么现在的 Full 红项不能直接作为产品结论？ | [Full 45532848554](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45532848554) 的 Windows 原样收据 SHA 变化等于 Git LF→CRLF，按文件固定 LF，保留原散列和任意字节篡改拒绝。原意图回放 1,800→1,500 由后来逐帧少写一次敌名解释。已有菜单整树散列覆盖了 #935 已批准的按钮位移和 `8cff1cb8` 的显式缺省字段。原保护留存，当前 Host 产品断言改用真实战斗路线按钮，并与正式路径共用一次构建。历史发布 Full 另有已丢失输入和共享输出目录夹具问题。[旧 Full 45420029137](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45420029137) |
| 为什么仍有交付验收缺口？ | 离线正式配置复验只覆盖源码和生成模板；它使用 Fengari 跑真实玩家动作，有声信号、屏幕和原生控件由替身提供。GIL 打包读回、官方容量和负载、进入到首个可点按钮、实际手机出牌和卡组成对耗时分别依赖现有收据及 `verify:platform-load`。复跑不能转移候选身份。 |

在同一正式 Host 工作负载下，单独恢复旧怪物生成器使冷启动报告 `FORMAL_EAGER_MONSTERS 42/42`，当前首屏为 0，首战实际绘制 1。单独恢复旧地图文件使查询从 5 增至 391 并触发 `FORMAL_MAP_LOOKUPS`。恢复 #956 之前的粒子文件触发既有 UNKNOWN 同值重复发布断言；仅恢复 #900 对正式布局的过滤条件触发既有选角合同，两控件被明确报出。旧卡组实现也触发既有隐藏排序外框写入断言。六档继续测轻量 Host 的受控 CPU/内存敏感度，历史两臂仅在工作负载及依赖相同的情况下配对。正式 Host 报告的卡组首开与暖开单独计时，输入、牌面和生命周期都有断言，墙钟样本包含模拟器和计数开销。
