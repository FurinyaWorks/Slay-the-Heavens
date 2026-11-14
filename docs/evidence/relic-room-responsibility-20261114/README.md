# TASK-74.20 房间遗物职责本地切片

基线 `9f2f44e4c79789fbcb64a515938765dbc240f830`；独立本地分支 `feat/relic-room-responsibility`。仅提取 `abyss_relic_hooks.onEnterRoom` 的进房金币顺序循环为 local `grantRoomEntryGold`，没有新增生产模块、require 或依赖。`equipmentUpgrade` 保持原文与 CC16，不作为本片成果。

## 实际边界与结果

同一个 owner 同时承担 uncommon 第一回调、enter 前金币、entered 后商店治疗/营地茶具。扩展新遗物时，提前缓存 localId/gainGold/owns、合并 enter/entered、归一化/去重 relics，都会改变已存在的动态委派行为。金币回调能替换后续方法和 relics；金币当前迭代保留原表，随后商店循环读取新表。uncommon 抛错必须停止后续工作；金币、治疗、茶具晚失败则保留此前部分写入。拆分使这段顺序奖励循环独立于两阶段调度，全部普通方法读取仍留在原比较/调用位置。

真实 pinned Luacheck 1.2.0 测量：旧 onEnterRoom **17**；新 onEnterRoom **10**、helper **8**。正式 `check:lua-static` 现在治理这两个入口和其嵌套函数；真实注入 entry/helper 及各自 nested CC17，正式 `reviewResponsibilityComplexity` 均拒绝。没有放宽原门槛、告警、ratchet 或来源限制。

## 证据范围

- 新旧完整源码分别装入 fresh Fengari VM；复用现有 graph observer 比较所有 run 字段、引用/循环/别名、metatable、异常 payload、require 次序、返回值及回调 trace。最终普通/动态/异常/真实集成分别 68/4/10/32 checkpoints；12 个双版本语义负控均捕获。覆盖 enter/entered/nil/other、别名/重复遗物、false/nil 字段、动态方法/列表替换、opaque 异常和晚失败部分写入。真实 Eternal Feather 5/10 张牌及 Mark of Bloom 阻疗，两阶段茶具与 Maw Bank 均实跑。
- 原 onEquip 差分、其原始 SHA/Git blob 与 residual 断言继续保留；完整历史 epoch、隔离 helper closure 及 owner 污染负控继续执行。
- 历史桥只接受精确路径和两份完整源码 SHA256/Git blob，绑定在现有 closure manifest 中。旧归档和 `proof.current` 保留历史身份；桥仅把已验证完整新输入投影到旧 corpus，**不声称旧 proof 是当前生产树**。当前生产行为由本片 fresh VM 独立执行。未知/污染输入不投影、不读 owner；有效输入每次重新验证 linked owner，另一 owner 变化和源自身变化均拒绝。
- 静态检查通过：14 条显式历史告警，无新增；2163 个受治理职责测量。架构通过：346 模块、1955 边。
- 已有 common hooks/equipment/final、uncommon 四夹具及营地公开路径执行。原相关测试各次输出与生成报告摘要保存在 `verification-logs.json.gz`。Full、远程 CI、官方导入、ready、手机/PC 实机均未执行。

## 失败与更正

初次新测试有 fixture 字符拼接 false 错误和 local function AST/Luacheck 起始列差 6 的匹配错误，修正后 40/40 通过。后补 Feather fixture 使用了错误标识 `mark_of_the_bloom`，改为真实 `mark_of_bloom` 后新矩阵通过；这不是产品缺陷。额外营地路径首跑缺少本树生成的 abyss_theme；运行既有 build:theme/build:ui/map-ui-layout 后重跑 1/1 通过。保留原失败输出，不以此变更产品源码或放宽断言。

## 交接限制

全部开发只在本地独立树，未 push、PR、merge、auto-merge，未操作桌面输入，未改 release/他人文件。主控维护 Backlog；不勾 AC、不标 Done。`closeout-source-closure.json`、`copy-integration-source-closure.mjs`、`integration-source-epoch.test.mjs` 与开放 PR661 存在文件重叠；本地必要加法绑定不表示接管该 PR，后续任何集成前须重新核对最新来源与闭包。本树 `verify:backlog` 通过；root 的七项里程碑导航遗漏属于主控已有状态，未修改 PR661 持有的接线。需要对精确最终本地 HEAD 独立复审；增量 ratchet 在本地提交后另报精确 HEAD 结果。
