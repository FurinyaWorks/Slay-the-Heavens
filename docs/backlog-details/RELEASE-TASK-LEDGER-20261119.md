# Release 分叉任务账本纠偏

核对时间：2026-11-18 18:30 UTC（北京时间 11 月 19 日）。本片仅更正两个旧状态，防止任务池重新分配已有实现；不重新领取任务，不改变 Furinya 的所有权，不修改源码、测试、文案或布局。

- Release 基线：`1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`。
- 当前 Develop：`2ec45b9e52c870badc4d4888f6243a30556eecb4`。
- 两项修改前的 `task:pick` 均为 ALLOW；但实际已有交付或验收，因此没有把 ALLOW 当作重新开发的许可。
- 依据 [TASK_EXECUTION](../TASK_EXECUTION.md)：状态表示整体进展，已有实施或待验应为 In Progress，已完成项不重新领取。任务文件只经 Backlog CLI 修改。

## TASK-90：同步已完成的原两项 AC

[PR #436](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/436) 已交付等价机制和中文说明。[PR #700](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/700) 已合入 Develop，恢复 Done 和原两条 AC；Release 的分叉账本仍停在旧 To Do，并保留“未找到记录”的历史笔记。

绑定针对具体卡牌实例，加入战斗起手；移除路线排除绑定牌并保留普通候选，提交时复验 UID。前两幕用户文案解释为遗物绑定的战斗起手牌不能移除，不再只给玩家未知的“瓶装”术语。升级保留、复制新 UID 不继承等机制没有在本片改动。

### 验证来源与当前同一性

#700 的实际验证基线是 `c2409ad750c15124b7b843c6bbfa5b222537cb75`，合并点是 `dbb0d7d57bd9b23bc503387f99581672c2271391`。[冻结证据](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/dbb0d7d57bd9b23bc503387f99581672c2271391/docs/backlog-details/TASK-90-EVIDENCE-INTEGRATION-20261115.md#L16-L41)记录 8/8 Node、10 组起手、7 组移除及 Lua NodeUI 中合法 UID8 移除、保留绑定 UID7、正常返回地图。这些是原 Develop 运行结果，**本轮没有重跑或改称 Release 运行结果**。

以下 30 个 Git blob 在 Release、#700 验证基线和合并点三向一致。逐项以 `git ls-tree "$SHA" -- "$PATH"` 比较第三列即可复核。

| 文件（相对仓库根目录） | 三向相同的 blob SHA |
| --- | --- |
| src/lua/abyss_act1_events.lua | 1caee9e0c589bec580d8e9799394cc30ffd68781 |
| src/lua/abyss_act2_events.lua | d111e849086c9ad360985ea49f0e1425f572c259 |
| src/lua/abyss_back_to_basics.lua | 8c54a876b9b1df3bc01c3114100d1b74445737fc |
| src/lua/abyss_node_ui_camp_actions.lua | da08b98ba097db0825b42eb3c8a4df3a968289a4 |
| src/lua/abyss_node_ui_rewards.lua | 4a7d8ff5487529b8456760159271d64c4c77e7e9 |
| src/lua/abyss_duplicator_event.lua | dfb765f779be49c42950afda5e03846250087eae |
| src/lua/abyss_wheel_event.lua | 5dfd5811ebc91d6e54e92c0e3f7e30564d19b48b |
| src/lua/abyss_uncommon_relics.lua | ce2b69add5b10483ef6267481c464fba2e4e691c |
| src/lua/abyss_purge_candidates.lua | e3ffdf5635f82e623c25de173035a3af52dc08ed |
| src/lua/abyss_opening_hand.lua | b2bcad0f1a8a79e629863dabc8ffe5e91c6e20b0 |
| src/lua/abyss_living_wall.lua | 79b6e309a8e032c7620575db4f4cdaf6127207f0 |
| src/lua/abyss_node_ui_events.lua | a66f75428bd5fea753d54bafa306eefbd1a2bd11 |
| src/lua/abyss_run.lua | 54e6faaa0a6bfa15793d626b324d7618e1f2e19b |
| src/lua/abyss_nodes.lua | 3833625544cccd1a785476b530fa0f5eb0dcd9a5 |
| src/lua/abyss_combat.lua | 2f0c4d6ca051f2df93f386e300e6b28c79bdf943 |
| src/lua/abyss_node_ui.lua | e9d9aa76b4d042f37e7b8f336a7f2701541a8ade |
| src/lua/abyss_act3_events.lua | acb5e71613b81b9ba6a1d14dacc865377deaf8b5 |
| tests/uncommon-relics.test.mjs | d75bcf8919f081a877a25b6dd9de576af62bad63 |
| tests/event-card-picker-ui.test.mjs | fa3add6f9e647e8f97684b659dc26da8545b39e0 |
| tests/back-to-basics-event.test.mjs | b9f312d9517aeab5d636b5e7ba2fee6e502dee97 |
| tests/act2-event-content.test.mjs | 167414d20eb3d87970076ff8cfd50e3d20e14ee7 |
| tests/act2-event-ui.test.mjs | 1d482179e5e1e5d4c12034a0edd29da7c5378802 |
| tests/lua/opening_hand.lua | d9ec105e892d2339b22585970e9321e6e1edecc7 |
| tests/lua/permanent_purge_routes.lua | fba898c1b79df7d257ad387427942a646f00e9b1 |
| tests/lua/uncommon_relics_effects.lua | 838ee9751a2f2653904f36f149b3c7b419452988 |
| tests/lua/event_card_picker_ui.lua | 591c63eec922d6920af014f1dd6d6cbca9edd228 |
| tests/lua/back_to_basics_event.lua | 42e6b61cef24a7e5ae87e6753130e22d1398bf90 |
| tests/lua/back_to_basics_ui.lua | 9c76fd57cf3d32261ee8e69f9ceb57cbcdf31478 |
| tests/lua/act2_event_content.lua | 34c032e15dc41fbea644459a209a0d0a3a45d8e8 |
| tests/lua/act2_event_ui.lua | 1bedcb5f04dbf79ee1aa43ca8fae580234f4613c |

边界：构建脚本的敌人图/装配输出、特殊敌图测试 profile、商店物品坐标及店外撤销监听存在差异；共享节点输入新增监听维护商店撤销状态，不改变事件派发或 UID 守卫。不能声称整树、生成 UI 或设备相同。显示探针及日志保留在 Develop，原现场事件的具体身份仍未知，第三幕旧词不在前两幕范围。本轮同步的是已有两项 AC 验收，不扩大或冒充官方候选、ready、设备及发布验收。

## TASK-4.10.1：已有实现，待验而非待开工

Release 已含 `src/lua/abyss_merchant_pages.lua`、生产 `abyss_merchant.lua`、分页与生命周期回归及 [既有证据](../evidence/merchant-semantic-pages-20261114/README.md)。原 [PR #655](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/655) 关闭但未直接合并；候选经 integration-next 纳入的事实沿用任务已有记录，不将 PR 关闭写成合并。

[Develop 冻结任务](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/2ec45b9e52c870badc4d4888f6243a30556eecb4/backlog/tasks/task-4.10.1%20-%20%E4%BF%AE%E5%A4%8D%E5%95%86%E4%BA%BA%E5%90%8C%E5%8F%A5%E6%8B%86%E9%A1%B5%E5%B9%B6%E7%BB%9F%E4%B8%80%E5%AF%B9%E7%99%BD%E9%98%85%E8%AF%BB%E8%8A%82%E5%A5%8F.md)也已更正为 In Progress，并明确 SDK 层验证不代表阅读体验修复。本片只同步整体状态并添加“待验”标签；五项 AC 全部未勾、Furinya 负责人及原说明完整保留。

下一步应续既有验收，不重做分页：当前候选连续画面、最终长句策略和用户确认、成熟游戏实际对照、官方 PC/实体手机等仍未通过。没有把无人占用 GUI 窗口解释成未实施，也没有新接管商人实现。

## 本轮账本验证

- `npm run verify:backlog`：通过。
- `npm run check:guidance`：通过。
- 修改后的 `npm run task:pick -- TASK-90`：HOLD，已完成且 AC 全勾，不应重领。
- 修改后的 `npm run task:pick -- TASK-4.10.1`：HOLD，已有实施，只续验收，不应重做。
- `git diff --check`：通过。改动仅为两个任务 Markdown 与本附件。
- 未运行 Full、产品运行时、官方导入、ready、GUI 或设备；不声称 Release 已达到发布条件。

初次在稀疏树运行账本验证缺只读依赖，指引检查缺稀疏目录；补齐本地依赖读取及所需跟踪文件后上述检查通过。没有改动依赖、门禁或规则，也没有执行 Backlog doctor 的批量 ID 重写/归档。
