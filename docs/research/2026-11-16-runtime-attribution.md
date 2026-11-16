# v2.0.0 运行时无效开销归因与最小修复

本轮只修 `abyss_monster_intent_particle_view.lua` 的重复静态发布。正式美术 profile 的 UNKNOWN/STUN 300 帧原生方法调用 **30,469 → 14,881（−51.2%）**；普通待机和连续出牌的调用量没有下降。离线 Host 前后完整 Run/RNG 及 5,120 次更新的所测画面字段一致。**官方 SDK、当前候选官方画面、手机发热/FPS/持续卡顿改善均为 UNVERIFIED**。

## 身份、去重与边界

- 实际开工基线：`release/v2.0.0@1cc5479b713edab6fd26db4e20f8eb22b7401cb2`；独立分支 `perf/runtime-attribution-v2-1116`。用户明确指定 Release，覆盖仓库默认 Develop 分支约定；不重新认领既有任务。
- 唯一生产文件的真实 producer：`befd480817b0f7c875de189863d37e803704ad3a`。来源包保存 before/after、实际 Git commit/tree/blob 对象；离线验证不增加浅 CI 的网络 fetch。
- 开工读取了 19 个在途 PR 的完整文件清单：[去重快照](../evidence/runtime-attribution-20261116/pr-deduplication.json)。#688（`2c038f8d`）已有敌人坐标状态派生剪枝；#694（`12f0981c`）已有手牌八值表优化。本轮不复制、依赖或代验这两项；保留真实未合基线。#687 的意图语义、#699 的反馈画面等相邻在途改动也不移植。
- #703 的容量、打包和选角数据不在范围内。没有改资产、卡框、玩法、RNG、版本/Tag、发行候选或工作流，没有操纵游戏窗口，也不申请自动合并。
- 继续使用 TASK-4.21 / TASK-100 / TASK-100.1；状态、负责人和未验 AC 不变。此报告是工程归因，不是手机问题已解决或正式发布许可。

## 白盒调用链

`abyss_ui.OnUpdate` 每帧读画布尺寸（变化才 resize），调用两次 `presentationPage`、`GameUI:update`，再推进 component bridge、V25 texture、cardArt 与 pageReveal。这些原生 SDK/绘图宿主入口不能拿下层 Host 数据代验。

`GameUI.update` 经过 disabled/覆盖/准备状态门，再推进 `BattleUI.update`，后者按顺序执行敌人意图、Feedback、名字、奖励和手牌。Feedback 在空闲战斗仍运行角色待机；因此非零位置/缩放写入不能直接判为浪费。隐藏 node/deck/map 的 update 仍被调度，其内部承担准备、手势退休和显隐检查，不能整页停掉了事。

本轮测到的主要路径与处置：

| 路径 | 固定样本中的事实 | 处置 |
| --- | --- | --- |
| 角色/怪物待机 | 普通 300 帧：GameUI/BattleUI/Feedback 各 300 次；3 actor 的 idle 与 MonsterArt.pose 各 900 次；native position 2,100、scale 1,500、visible 600 次 | 保留呼吸、名字、手牌 halo 等动态输出；普通待机不宣称提速。portrait tint/tints 的同值表仍是后续疑点；反馈 painter 有在途 #699，本轮不扩散修改 |
| 敌人意图粒子 | UNKNOWN/STUN 中 1,749 次存活粒子发布，原图像/尺寸各提交 1,749 次；9 个静态 setter 每次重复 | 首次成功配置后，静态图像/尺寸各只写 17 次，其余动态 scale/rotation/colour、根位置/显隐和层序照旧 |
| 坐标/状态派生 | 普通 300 帧 geometry 1,800 次，Actor.statusView 2,100 次，完整调用分项在 JSON | #688 已覆盖相关剪枝；这些总数不是该 PR 的900次特定计数，不臆推叠加收益 |
| 手牌 | 五张静止手牌依然每帧求布局、更新 origin 快照；普通样本已知表 11,400 次 | #694 已覆盖八值返回表，保持其范围。没有跨帧缓存规则或起拖位置 |
| 隐藏页面/刷新 | 普通 300 帧 node/deck/map 各 300 次 update；无 GameUI.refresh、BattleUI.render、RefreshItems；300 个隐藏战斗帧不创建粒子输出 | 保留必要生命周期调度，不增加全局刷新/页状态缓存 |
| 资源残留 | 20 次往返、12×300 帧按真实创建/销毁与每轮效果数记账 | 去掉当前活跃粒子及其容器后驻留恒定；没有将所有 native 场景控件误当成应在 disable 销毁的对象 |

最初默认 profile 的源码位置探针定位到 29,269 次 native 调用和 8,745 次静态子控件查找；它只用于发现热点。正式美术 profile 与它不相同，因此正式收益只用下面独立配对数据计算。

## 最小修复及失败语义

五个不使用的子控件隐藏、icon 可见/图像/局部原点/尺寸，只在该 native 实例首次成功发布该 source effect 时执行。使用一个按 native 弱键的成功记录，value 是不含 native 回指的 source effect；重建 native 或换 effect 会重新配置。源模型中纹理与尺寸在 effect 生命周期内不变。

所有动态字段继续每次绘制，粒子发射频率、UNKNOWN 静态 phase、隔离 cosmetic RNG、寿命、前后层顺序及 NONE/dying/escaping 门均不改。新增每个视图仅两个小表字面量；热路径省去重复 setter、五次查找和静态字段名列表表，分配/调用实测见下。

先有原基线 RED（重复9项静态配置），再 GREEN。覆盖新实例、重复绘制、显隐门改变、false/throw、clear 与 engine teardown 重入；原有真实 GameUI 覆盖返回、战斗替换与粒子寿命用例继续运行。独审发现 `picture()` 返回 false 可能被缓存，已新增真实 RED→GREEN，明确拒绝失败图片配置，不发布成功承诺。

## 固定配对结果

复用 TASK-100 的 native observer、nearest-rank 统计和既有全图 Run serializer。运行 seed=1、实际战斗 seed=42、1280×720、相同 `officialAssets:true` 默认正式美术 profile，前后只替换一个生产模块；所有其他源码、生成数据/UI 和观测工具逐文件 SHA256 绑定。

固定敌阵/手牌是离线构造压力夹具，不冒充自然遭遇战。collector.spawn 与 byrd.stunned 在新战斗首次呈现前设置，实际 source effects 必须同时含 INTENT_UNKNOWN_L/TINY_STAR。300帧内原source星形构造表计数为7，避免只按配置标签认定覆盖。

三组交错 fresh VM 的 counts 采集；分配插桩、逐帧字段对照各另做一组配对，避免把其开销混入时间。连续出牌执行真实 click/选择/目标/反馈完成，实际80次update，不使用 fast mode、不直接调用规则作弊。每侧单样本按现有工具有界执行。

| 工作负载 | native 方法调用 前→后 | mock 属性写入 前→后 | 所测表字面量 前→后 | VM 毫秒 P50/P95 前→后 |
| --- | ---: | ---: | ---: | ---: |
| 普通待机 300 帧 | 4,200 → 4,200 | 12,000 → 12,000 | 11,400 → 11,400 | 743.8/765.2 → 801.3/805.3 |
| 连续 3 张牌（80 次更新） | 22,431 → 22,431 | 49,732 → 49,732 | 5,626 → 5,626 | 1243.1/1310.7 → 1247.2/1416.4 |
| UNKNOWN/STUN 300 帧 | 30,469 → 14,881 | 49,912 → 29,128 | 21,801 → 20,069 | 1796.4/1856.0 → 1304.6/1346.3 |
| 20 次卡组往返 | 116,832 → 100,209 | 230,782 → 208,618 | 35,880 → 34,033 | 6277.0/6360.4 → 5612.5/5733.2 |
| 3,600 帧前台循环 | 365,628 → 178,572 | 598,944 → 349,536 | 261,594 → 240,810 | 21876.7/23341.8 → 15457.4/15505.2 |

native 方法与 mock 属性计数会重叠，不能相加当作引擎调用总量。分配只统计七个命名 UI Lua 模块中的表字面量，**不是总分配字节、closure、GC、原生 Lua 堆或设备内存**；源码位置直方图全部保留。

普通待机 P50 743.8→801.3ms、P95 765.2→805.3ms，以及连续出牌 P95 1310.7→1416.4ms 的不利观察没有删除或重采择优。它们 native/已知分配不增加，但 n=3、JIT/GC/观测器/阶段端点 graph capture 等混合时间不足以归因这些时长变化；不认证全场景无回退。整条离线采集 P50 38,886.0→30,438.3ms，只是此协议观察，不能换算官方 FPS。

阶段端点样本中的最大 Node heapUsed 812,163,568→799,716,832 bytes，RSS 982,372,352→975,642,624 bytes；不是连续峰值、GC 回收量或手机内存收益。60秒是3,600帧的模拟前台时间，**不是长时间手机耐热测试**。

每轮往返的 liveControls 为27,616/27,623，对应5/6个粒子。真实模板每个粒子为 root+六子控件，另有三个动态容器；`live − 7×outputs − pages` 的20轮及随后12块均为 **27,578**。disable 后 source effects/native particle outputs 均为0；不销毁的宿主场景仍有27,434个mock控件，不称为整体释放到0。

每侧全量 Run/RNG图的每阶段 digest 相同；5,120 次实际更新逐帧核对粒子输出各字段、角色 portrait 和手牌 transform，digest完全相同。它证明所测 mock 字段等价；不替代官方像素、人审美术或完整官方角色驱动验证。

## 固化为工程机制

1. 显式入口 `node scripts/benchmark-battle-runtime.mjs <完整基线SHA> <已构建profile目录> <新输出目录>`；默认普通 CI 不追加十次长回放。复用既有 `buildUI`/TASK-100 工具，不引入新的运行时 profiler 或依赖。
2. 输出前保存 input-manifest，禁止覆盖输出目录；记录三组原始计数/时长、table literal 位置、逐帧hash、每轮资源台账。源码中途漂移、缺输出/observer/工作量、no-op优化、RNG/字段改变、native成本增加、残留均拒绝。12块长循环不能只交一个总平均值；压力及每个长块都校验实际两类 source 粒子与数量，而非只检查配置名。
3. 轻量 `intent-particle-publication.test.mjs` 验证成功才缓存及失败/重入边界；`battle-runtime-contract.test.mjs` 拒绝两边同时少跑、缺分配observer、假相等或没有真实调用节省，并覆盖 Lua return/table-call sugar 插桩语法。
4. 生产来源只增加一个 owner，真实 Git 完整352项corpus、所有旧目标和93份旧gzip保留；新增879JS/1424Lua原始发现与876/1423历史视图分别验证。CI-only reader 不参与生产授权，缺失/null/漂移原值透传或失败，不吞错。隔离生产copy不导入CI leaf，暖成功后的篡改/删除会重新失败。
5. 原工作流、timings、18/15分片、成本未知项、预算、物理执行guard、Required/Full 均未修改。当前本地来源与门禁检查不冒充Hosted Full或合后验收，正常PR继续走现有路由，且不自动合并。

复跑准备：`npm ci`、`npm run build:data && npm run build:ui`；再使用既有 `buildUI('work/runtime-profile',undefined,{officialAssets:true})` 生成相同profile。完整基线SHA为开头的1cc；浅检出需要显式取得该已知基线对象。必要原始美术和两份源码归档必须先按原LFS SHA恢复，不能用指针或简化资产替代。基准不会启动客户端、构造新GIL或发布候选。

## 证据及尚未验证

- [完整报告JSON](../evidence/runtime-attribution-20261116/report.json)、[源码/工具/生成UI身份](../evidence/runtime-attribution-20261116/input-manifest.json)；同目录保留十次原始输出及计数、默认profile探针、原TASK100三样本。
- `incomplete-experiments.json.gz` 保留首轮 Lua 插桩失败、早期校验误把地图准备/反馈退休和正常粒子生灭计为欠工作量/残留的过程。修正了测试模型，并新增绝对帧数、每轮资源、no-op/缺observer反例；没有放宽原项目验证或复写失败。
- 协调者最终审计发现旧 c56dcd7 样本在首次呈现后改 raw intentIndex，实际只产生UNKNOWN，旧17,270→9,530数据现明确降为UNKNOWN-only；旧结论及采集代码封存于 `historical-unknown-only.json.gz`。已用旧真实Host夹具跑出“两类source未产生”的RED，改为首次呈现前设置，再新增缺类反例和实际类别census，重新执行整轮固定协议；不是补写成功标记。旧独审的联合覆盖结论同步撤回，新联合数据必须重新独审。
- 两轮独审各自保留 request-changes 事实：运行时图片false/校验/插桩问题，来源层 raw/历史reader混用问题；均通过实际RED→GREEN处理。最终两路独审均通过，绑定源码检查点 `ef9d60f237021d3f4cb5fadfc49d6f8f7cd657d4`，各自 unresolved=[]：[运行时/联合实测](../evidence/runtime-attribution-20261116/review-runtime-combined-final.json)、[来源/CI/历史保持](../evidence/runtime-attribution-20261116/review-provenance-combined-final.json)。随后只补交文档/收据；代码目录Git tree身份另存 delivery-source-identity.json，不循环伪造自身SHA。
- SDK export、官方 `OnUpdate` 上层宿主成本、component bridge/GPU与原生portrait driver、当前同候选官方画面、手机帧时/温度/长帧/持续卡顿、官方容量/ready及Hosted Full/合后验收仍为 **UNVERIFIED**。没有官方手机数据，绝不宣称手机已不发热。
