# TASK-90 既有成果状态与证据集成

本轮日期：2026-11-15 UTC。独立树 `.worktrees/task90-evidence-integration-1115`，分支 `feat/task90-evidence-integration-1115`，基线 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。远端引用已只读核对一致；父目录存在且受本地 Git exclude 忽略，以 `GIT_LFS_SKIP_SMUDGE=1` 建树。

## 来源与状态纠偏

- 已合源码：`b4f88a1f574b403f4cc68d54ee37565f3012b5ad` / [PR #436](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/436)，是本轮基线祖先。原[机制及七模块中文说明](TASK-90.md)已在主线，本片只核实确定行为。
- 从 `feat/bottle-rule-reconcile@796c5a9e` 精确接续五份附件：[11/14 复核](TASK-90-RECONCILE-20261114.md)及其 `display-probe.txt`、`display.json`、`historical-quality-jobs.json`、`mechanism.json`。原文、历史失败、探针及数据保持原样，没有搬运旧任务快照。
- `feat/task90-bottle-audit@afa50521` 仅作历史核查来源：其升级保留绑定、复制新 UID 不继承绑定的区分，由本轮现有测试重新验证。该旧审计的待文案/进行中结论不覆盖已合中文及本轮读回事实。
- 根树 TASK-90 已为 Done；本轮不重复认领。基线 To Do 的“未找到调查结论”是证据未集成造成的失真，保留为历史笔记，并通过 Backlog CLI 补计划、附件及本轮结论，原描述、创建身份、负责人和两条 AC 不改写。
- 旧附件的“本轮”“未推送/集成”及历史单次禁 PR 均指原记录时点，保留原文追溯，不作为成熟非 release feature 的新阻塞。主控接续正常集成；本片按当前分工交付独立本地提交供独审，设计批准边界仍有效。

## 本轮最小复验与 AC 结论

环境：Windows PowerShell，既有 Node `v24.18.0`（`C:\Users\Administrator\AppData\Local\npm-cache\_npx\4aa47c519def57bc\node_modules\node\bin`）。本树 `npm ci --ignore-scripts --offline` 成功；依次运行 `npm run build:data`、`npm run build:theme`、`npm run build:ui` 成功。生成物仅供本树验证，不入提交。

| 验收事实 | 本轮既有验证入口与观察 | 结论 |
| --- | --- | --- |
| 绑定的是具体 UID，且会进入战斗起手 | `uncommon_relics_effects.lua` 的三瓶候选/装备断言，经 `uncommon-relics.test.mjs` 运行；`opening_hand.lua` 10 组验证实例身份、绑定与起手顺序 | 等价机制真实存在，不能把限制当空文案删除 |
| 升级保留原绑定 | `back_to_basics_event.lua` 的绑定初始牌升级断言，及 `back_to_basics_ui.lua` 的真实 NodeUI 升级/结果/离开 | 升级与永久移除规则不同 |
| 复制得到新 UID，不继承三种绑定 | `event_card_picker_ui.lua` 的 Duplicator 用例经现有 Node 包装执行，检查 `nextDeckUid`、升级/misc 保留及三绑定均空 | 绑定不是所有同名牌的属性，也不是禁止一切事件选择 |
| 永久移除候选与提交均排除绑定牌 | BackToBasics 的过期、重复、已删/新绑定 UID 拒绝与原子回滚；`permanent_purge_routes.lua` 四条路由共 7 组通过 | 非法提交不落状态，合法 UID 可完成移除 |
| 用户可见解释与合法移除闭环 | 原样执行历史 `display-probe.txt`，读取当前生成控件及真实 Nodes/Run：选项显示“遗物绑定牌除外”，正文/notice 解释战斗起手；仅列 UID8，确认移除后保留绑定 UID7，离开回地图 | AC1、AC2 在现有两幕机制/解释范围均有本轮客观证据 |

本轮 Node 命令：

```text
node --test --test-reporter=spec --test-concurrency=1 tests/uncommon-relics.test.mjs tests/event-card-picker-ui.test.mjs tests/back-to-basics-event.test.mjs
```

结果 **8/8 PASS，0 fail/cancelled/skipped**，42,081.5846 ms。另用现有 `scripts/test-lua.mjs` 的 `runLua` 串行运行 `tests/lua/opening_hand.lua`、`tests/lua/permanent_purge_routes.lua` 和原样归档的 `docs/evidence/task90-reconcile-20261114/display-probe.txt`，分别为 **10 组、7 组及显示/选择闭环通过**。完整命令与本轮输出见[本轮回执](../evidence/task90-evidence-integration-20261115.txt)。没有新增/刷新测试、helper 或探针，没有重复大矩阵。

源码交叉检查：`abyss_uncommon_relics.equipBottle` 写具体实例标记；`abyss_opening_hand.stage` 读取绑定；`abyss_purge_candidates` 过滤；`abyss_back_to_basics` 提交重验 UID/当前合法性、升级保留原实例，并提供中文解释；`abyss_duplicator_event` 调用既有复制命令并解释复制品不继承绑定。源码检查与上述实际执行分别成立，不用 grep 代替 AC 运行证据。

**AC1、AC2 已由 Backlog CLI 勾选，独立树 TASK-90 已恢复 Done 并读回。** 这两条要求的是等价机制、可选择性及自然中文解释，不把官方客户端/设备验收并入其已通过范围；原任务无额外 DoD 项。`npm run verify:backlog` 通过；五份历史附件的 Git blob 均与 `796c5a9e` 一致，`git diff --check` 通过。只读核对 #682 文件清单，本片与其写入范围无重叠。

## 证据边界

11/14 的 10/10、13/10/7、8/8、旧显示回执及 #436 历史 CI 是各自当时的证据；本轮 8/8、10、7 和显示闭环来自当前基线新执行，不能互相冒充。历史 Quality JSON 不表示本提交 CI 已通过。

本轮只修改说明、证据附件与 TASK-90 状态记录，未改变玩法、文案、遗物名、数值或未来第三幕。原反馈事件身份/候选仍未知，不能逆推成 Falling。没有构建新 GIL 候选、候选写入/读回、官方导入、真实 ready、自然抽中事件、PC 客户端或实体手机实测；这些状态均为未验证。Full、官方设备与发布验收未执行，也不由离线结果推定通过。

## 2026-11-17：接回已关闭调查线的独有证据

原调查 [#693](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/693) 已关闭，状态与证据集成由 [#700](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/700) 接续。固定来源为 `feat/bottled-card-explanation@e4b4149315fe33e089a5642f5eb15abb419fd5d8`；该提交的三份独有附件此前不在 #700 的 `b6f5bbeebc41a80fcbe54ae88ff7099fbf8390eb` 中。现将 [原调查说明](../evidence/task90-binding-20261115/README.md)、[八份源码摘要](../evidence/task90-binding-20261115/source-sha256.txt) 和 [原始定向日志](../evidence/task90-binding-20261115/targeted-tests.log) 按原 Git blob、原字节接回本准备树，供 #700 原执行线接续，不另开 PR 或重复运行 Full。

原说明末段的 In Progress、未勾 AC 和设备条件仅代表当时调查线的结论，不覆盖上文本轮证据集成对原两条 AC 的结论。此次不接回旧 TASK-90 快照，#700 的 Done、两条已勾 AC、负责人、创建身份及原有附件均保持。本次没有新增玩法实现、AC、设备验收或发布许可。

本次仅验证三个附件逐字等于固定来源、八条 SHA256 与本准备树源码全部一致、任务文件等于 #700，以及 guidance、Backlog 和差异空白检查。原日志的 12/12 是 11/15 历史执行，未在本轮重跑，不能计作当前候选 CI。源分支与完整历史恢复包继续保留；本准备提交被接纳且完成正常交付核验前，不以“文件已复制”宣称 #693 已合并或源分支可删。
