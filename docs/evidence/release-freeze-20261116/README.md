# Release功能冻结落地

2026-11-16；基线33d71575，TASK-112。规则唯一入口是[按需技能](../../../.codebuddy/skills/release-maintenance/SKILL.md)，主Agent指引只增加链接；没有新增CI job、依赖、锁或预算。

原失效点：既有发版交接有范围规则，技能未引用；旧PR模板只列Develop/Master；PR历史检查遇Release直接返回。现有Quality metadata步骤新增3字段校验，读取live PR并核仓库/base ref/head；edited触发重验。全部Feature硬拒绝，自填Owner-approved不能放行；Owner真要改变范围须先评审修改规则及门禁。字段是显式声明，不能自动证明Bugfix真实性；各PR仍须人工diff复审。

## 在途范围审查

已核19个Release PR的说明、修改文件及生产patch范围；声明已规范化并读回。此表不代替业务代码独审、CI或候选/设备验收。未发现需要移回Develop的新快捷键/预输入；#670已在Develop，TASK-42.1继续延期。#707原TASK-110引用与#670后续卡流需求冲突，已沿现有TASK-81更正；不复制任务。#689审查期间HEAD前进，先确认生产patch完全相同，再记录新HEAD/补声明，未沿用旧身份冒充新审查。

| PR | 声明类型 | 发版必要性 |
| --- | --- | --- |
| #707 | release-engineering | 修正Release修复的既有CI反馈路径；不扩大发版产品功能。 |
| #706 | performance | 消除战斗意图粒子的重复原生静态写入，降低既有出牌链开销。 |
| #703 | performance | 移除默认包重复编码与未用数据，处理20MB容量发行阻塞。 |
| #699 | bugfix | 修复已登记PC反馈中的物品身份、主标题与角色接地阴影。 |
| #698 | bugfix | 修复既有出牌接触点及归堆轨迹坐标不连续。 |
| #696 | bugfix | 修复既有选牌分页及确认按钮的重复布局和截断。 |
| #695 | bugfix | 修复既有设置入口的原生图标显示，不新增设置功能。 |
| #694 | performance | 消除静止手牌布局的重复临时表分配，保留原计算和输入。 |
| #691 | performance | 无损压缩现有生成Lua源码，缓解发行容量阻塞。 |
| #690 | bugfix | 修复既有重复导航入口与退出说明遮挡，保持返回同局语义。 |
| #689 | bugfix | 修复既有奖励与遗物栏蓝蜡烛显示身份不一致。 |
| #688 | performance | 移除战斗坐标计算的重复状态派生，保持几何与输入语义。 |
| #687 | bugfix | 修复已存在的防御强化复合意图未正确显示。 |
| #686 | bugfix | 修复既有点敌确认在Click缺触点ID时丢失输入，保留多指及旧回调保护。 |
| #685 | bugfix | 修复既有远虑多选重建及确认按钮截字。 |
| #684 | bugfix | 选择性修复已登记PC发版阻塞，排除未来角色、新快捷键和预输入。 |
| #680 | bugfix | 修复商店既有说明的关闭及触点穿透。 |
| #679 | bugfix | 修复既有药水误触和过期瞄准后的输入恢复。 |
| #678 | bugfix | 修复小屋首领奖励的既有空白选择。 |

精确快照和迁移结果见pr-scope-audit.json、pr-metadata-migration.json；19项均仅改说明，不改代码/base/审批/合并状态。审查后若HEAD/范围变化必须重新核对，不能用本快照自动放行。

## 出牌P0仍阻塞

真实GameUI和正式UI/data回放确认：卡牌及playArea的Down/Up有ID、Click无ID时，两处action_bindings消费者丢输入，需再点一次带ID Click才生效。reproduce-p0.mjs重新生成当前数据/布局运行probe，当前9 PASS、2预期RED；原始日志保留，不算绿色回归或官方手机根因。复用TASK-30/#686接续，不新增重复任务/指针tracker。只放松ID比较会丢失多指归属，未这样修；busy、手柄、旧回合/回调、拖动尾事件及RNG保护继续保留。#688/#694/#698/#706等已有性能/反馈修复不被本PR重复接管。

```bash
node docs/evidence/release-freeze-20261116/reproduce-p0.mjs
```

它在源码33d协议上应返回非零并显示2个已知RED。设备帧率、官方输入派发及连续出牌流畅度UNVERIFIED；本PR不宣称打牌P0已解决，也不引入TASK-42.1的键盘/预输入。

## 验证和生效边界

30/30规范/来源/指引测试；较广CI相关157/157；独审23/23及新增4/4、43项来源/EOL/漂移断言。来源延续只追加完整精确before/current包；旧archives、发现库存、Full/Required和预算不变。新增metadata/edited使一个旧bootstrap调用需要显式精确投影，原EOL及逆向断言全部保留。失败及后续GREEN日志分别保全。

独审见independent-review.json。现有Release Ruleset已只读核验为active，匹配release/*，必须PR、squash、严格check/presentation/engineering-posix/inventory且无bypass；规则原文见release-ruleset-readback.json，本轮不改设置。新增gate尚待本PR合入及精确HEAD/BASE托管CI验证，不轮询；未运行本地Full。**规则须本PR正常合入后才在Release普遍生效**；没有自行合并、发版或操作窗口。TASK-112与TASK-30保持In Progress。manifest校验本目录其他文件，日志为原字节gzip（mtime=0）。
