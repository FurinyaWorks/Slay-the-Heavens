# develop 中高优先级架构治理

本轮用户明确要求修复中高优先级架构问题，并授权自行处理方案与常规阻碍；改动仅面向 develop，不移植到 release/v2.0.0，也不自动发版。复用 TASK-74.19 和 TASK-74.20，既有已交付职责与历史证据保留。[实施计划](../plans/2026-11-18-develop-architecture.md)记录本轮范围。

## 基线与取舍

基线为 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。本轮重新读取全部源码、运行固定 Luacheck 1.2.0：351 个 Lua 模块，6165/6165 项完整测量；包含函数内延迟导入的完整图存在 67、11、2 个模块的三个 SCC。大环有 511 个内部引用位置。此前提到的 64 是历史数值，不能用它代替当前扫描。

独立审计发现 31 处 CC>30 热点，并识别 Actor/Combat 中掌握死亡反应、算术与回合队列的额外中高风险职责。按状态提交、输入生命周期、严格来源准入和扩展耦合决定范围。旧六核心、GameUI/NodeUI、Joust 等已交付成果不重做；不把所有 CC>15 的函数直接判为同等风险，也不因安装工厂跨度长就机械拆文件。

采用真实职责叶与显式宿主能力。相比继续延迟导入，该方案可从完整图消环；相比重写战斗引擎，它保留规则、事务、随机流、事件及既有测试。具体实现选择由 Codex 依据本轮自主授权作出，未冒称用户逐项审阅了内部接口。

## 所有权边界

- Power 展示成员顺序由 `abyss_power_membership` 持有，Order 协调调度，Schedule 仅调用成员叶；共享公开方法槽、动态替换和 copy-on-write 保留。
- Run 持有永久命令事务。遗物、奖励、商店及 pending 命令显式接收宿主能力，生产入口、直接 Lua 调用和测试同步迁移；没有以默认 require 回导 Run。嵌套失败仍使外层事务拒绝提交。
- Combat 持有队列执行与回合提交。牌策略、药水、丢弃、升级等依赖窄宿主能力；Actor 所需的小型生命周期反应下沉到明确的牌/遗物/姿态/资源叶，避免为一次简单回调加载整套高层运行时。
- Actor 保留其公共状态命令；新叶依赖 Events、Reactions、Presence、Queries 等底层职责，必要算术能力显式传入。原普通动态字段槽的读写由独立探针验证，不使用全局注册器或动态加载隐藏依赖。

新增叶为 actor_artifact、actor_attack_math、combat_card_hooks、relic_actor_hooks、original_v4_actor_hooks、stance_damage、card_upgrade、power_membership、combat_commands，均在架构配置分类。完整图采用原 AST/SCC 算法，包含即时和延迟 require；不修改检测算法、冻结观察基线或已有静态豁免。

## 复杂度切片

| 范围 | 原因与验证重点 |
| --- | --- |
| Actor / Combat | 死亡、复活、float32 运算、敌行动和回合队列；保留算术顺序、动态方法读取、失败部分写入及事务回滚 |
| Portraits / Choice / MapUI / DeckUI / TreasureUI / MatchEventUI | 分离生命周期、只读 projection、绘制和回调准入；保留 native setter 顺序、alive、token/generation、重入及旧回调拒绝 |
| Map / EndingHistory / TreasureSource | 顺序验证身份、来源和镜像；畸形输入原先返回 false 的路径不得提前读字段变成异常 |
| Wheel / Winding / Act2 / Act3 事件 | 按 stage 和结果职责分发；不更改随机流、舍入、事务 owner 或返回字符串 |
| CharacterProfiles / Presentation / SelectView / WarriorStatus / WatcherFlow | 保留复制别名、卡池插入顺序、旧输入不变、动态 formatter 和状态 hook 顺序 |
| OriginalV4Display / Colorless / PotionText / Feedback / RelicPending | 保留文本字节、未知类型拒绝、奖励分组、事件分类与每帧推进语义 |

本轮目标和新 helper 受 CC15 检查；已全模块治理的职责接入现有静态入口。全库另建立 CC30 绝对上限，复用完整测量，不撤销更严的专项规则或新增函数 CC15 棘轮。完整依赖无环门禁由 production policy 显式启用，延迟导入例外不再允许结构环通过。

## 证据与验收边界

各切片先运行失败的绝对复杂度或依赖边界测试，再修复至通过。旧新独立 VM 对比保留完整状态、别名、事件、随机和错误身份；关键行为另有真实语义负控。历史完整源码、oracle、断言和预算保留。新的精确 source epoch 只认证当前完整 owner 并提供原历史 target；current VM 仍执行当前源码，不能用旧源码投影冒充当前行为通过。

初次失败日志保留在本轮工作目录。缺失的 PNG 和两个历史档案曾是 Git LFS 指针，恢复实体并校验原摘要后复验；没有修改素材、预算或历史摘要。并行核心接口尚未接完时产生的失败与最终复验分别记录。

本记录目前为源码治理的实施记录。最终完整机器报告、独立组合审查、当前精确 HEAD 的检查与 develop 交付收据应在收口时追加。源码/离线回归不代表官方导入、当前候选 ready、手机实测或发布许可；本轮不占用用户设备。

## 当前绝对结果

产品源码身份为 `5a47b1066772778f018695a0f0eea9a7f6892421`；来源合同、测试和交付记录在后续提交绑定最终候选，不将它们冒充这个产品提交的托管验证。

| 指标 | c2409ad7基线 | 当前产品 |
| --- | ---: | ---: |
| Lua模块 | 351 | 360 |
| 完整测量 | 6165/6165 | 6440/6440 |
| 全部require位置 | 1988 | 1987 |
| 完整SCC成员数 | 67 / 11 / 2 | 0个SCC |
| CC>30 | 31 | 0 |
| 最高CC | 68 | 30 |
| CC>15（含初始化块） | 206 | 149 |
| 静态告警 | 6条现行旧告警 | 6条，无新增 |
| Actor / Combat行数 | 996 / 2295 | 974 / 2295 |

保留的149项是机器热点总数，不声称全库CC15完成。对本轮完整治理的19模块与23个范围模块，全部新helper受CC15；仅31个精确旧AST身份保留原≤30额度，不能按同名函数给新helper继承旧额度。其余未治理职责继续由原增量棘轮禁止变差，完整机器清单公开，后续仍按实际风险取舍。该取舍由Codex依据用户“中高优先级、低优先级可留”的自主授权作出，不冒称逐项Owner验收。

本轮原质量棘轮最初准确拦住10处新债：新增参数后的旧复杂入口按新函数验收，以及Combat文件增长。全部通过真实职责拆分修复，最终对精确Git提交的80份Lua改动为0新增违规；未改棘轮算法或旧上限。独立深审还复现并修复两处Discard.begin漏传宿主导致Reflex自动全弃失败，真实handler基础/升级四场景先红后绿。新增来源验证器的继承字段漏洞也先红后绿修复。

`npm run check:engineering`最终通过：完整新鲜质量/架构/静态采集、4个关键语义变异全部检出、6项原生生命周期合同通过。内容/网络检查与66项Python表现合同通过；定向状态/RNG/别名/失败回滚和行为差分保留各切片日志。完整Hosted Quality、原生队列及实际合后收据独立追踪，不以这些局部结果冒充。

## 测试成本与发布隔离

[实测成本收据](../evidence/develop-architecture-20261118/test-planning-receipt.json)保存完整日志摘要、测试源码摘要、成功组成本下界或完整file时长。四个新长回归的本地planning floor分别为84831、269861、23258、11259ms；不把它们称作Hosted观测。原Windows18/Linux15完整规划因新工作超出POSIX原20分钟预算，故仅当前POSIX扩到16；Windows18、Lua双worker、并发、原预算与60秒预留不变，旧15失败仍可复现。当前精确全库存及新旧预算结果见[规划报告](../evidence/develop-architecture-20261118/ci-planning.json)与真实raw预算测试。

本轮只从develop开发线交付，不向release/v2.0.0或master推送，不制作发布Tag，不启动用户客户端。官方与设备证据仍按原合同单独验收。

完整来源/奖励/菜单合同由主控重新运行22/22通过。CI历史合同两文件完整85/85通过：历史Full38、18/15、8个原floor保持各自c240上下文与原断言；当前900 JS/1430 Lua、18/16及全部新成本由独立raw预算入口验证。另记录了既有CI合同文件72个成功case成本和61802ms，修正其原unknown10s的规划低估；它是下界，未冒称完整单file墙钟。最终预算均含60秒预留，实际Hosted完成仍单独验收。

## PR与交付阻塞

交付入口为[PR714](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/714)，目标develop。独立整分支审查绑定候选`3c2d34af66e7a520c6e048d72e25bae038364456`与基线c240，结论PASS、unresolved为空；原始审查记录已保存至对应evidence。

原`merge:auto --dry-run`已通过精确HEAD/base、依赖、Ruleset和原生队列准入。实际授权在首次写入必需`independent-review: pending`时，被当前GitHub集成以HTTP403拒绝；没有触发enable Auto-merge。清理后再次读回auto_merge=null、isInMergeQueue=false；状态列表没有independent-review记录。未宣称已入队、已授权或已合并，也未更改保护规则。

TASK-74.19/74.20通过CLI置Blocked，保留Owner、优先级、已验AC与待验项，并链接PR。恢复需要一个具备commit statuses写权限的GitHub连接：先核对当时最新HEAD/base及独审，使用原merge:auto入口授权；实际Full、队列、squash和合后push Full验证后，再通过CLI完成余下AC和任务收口。当前授权只读回看到FurinyaDev的GH_TOKEN身份，没有可直接使用的替代写入授权。详细机器接续见[交付阻塞](../evidence/develop-architecture-20261118/delivery-blocker.json)。
