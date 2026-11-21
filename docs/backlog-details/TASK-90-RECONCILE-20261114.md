# TASK-90 遗物绑定说明的本轮复验

核对基线 `9f2f44e4`，独立本地分支 `feat/bottle-rule-reconcile`。本轮只补已有交付的证据，没有重写玩法或文案、改遗物名称、处理第三幕，也未推送/集成到发布分支。

## 两个验收项

**AC1：等价机制确实存在，正常卡牌仍可选择。** 三种绑定遗物通过 `abyss_uncommon_relics.equipBottle` 为具体UID实例设置 `inBottleFlame/Lightning/Tornado`，`abyss_opening_hand.stage` 将这些牌纳入起手序列；`abyss_purge_candidates` 排除已绑定牌，实际移除命令继续复验UID与当前合法性。它不是无意义的原作文字限制，不能删除规则来消除术语。

本轮重跑既有Lua合同：三绑定遗物及效果13组、起手序列10组、商店/牧师/净化神龛/金翼雕像四种移除路由7组均通过。合法牌可被移除，绑定牌不可移除，拒绝不扣金币/不改状态；保护、失效UID和回滚的原断言保持。

**AC2：两幕玩家解释已经提供。** 原交付的七模块把未解释的“非瓶装”改为“遗物绑定牌除外”；实际选择正文解释为“被遗物指定为战斗起手的牌不能移除”，复制品不继承绑定。没有改正式瓶装遗物名称或数值。

本轮使用真实生成控件树、NodeUI与公开Nodes/Run（仅原生方法为mock）直接读回：

```text
UI_OPTION 免费移除一张可移除永久牌，遗物绑定牌除外。
UI_PICKER 选择一张可移除永久牌；被遗物指定为战斗起手的牌不能移除。
VIEW_REASON 选择一张可移除永久牌；被遗物指定为战斗起手的牌不能移除。
TASK90_CURRENT_DISPLAY_AND_SELECTION_PASS
```

同一探针确认选择列表只含合法UID8，确认后保留绑定UID7，再从结果页正常离开回地图。实际解释在根 `notice`，不是独立picker标题；初次探针错误假设 `pickerView/title` 及短提示措辞而失败，已按源码/实际输出修正探针，未改产品凑断言。后续一次沙箱 `spawn EPERM` 为环境失败，正常权限复验成功。

## 本轮命令与证据

- `npm run build:data`、`npm run build:ui` 成功。
- `node --test --test-concurrency=1 tests/back-to-basics-event.test.mjs tests/act2-event-content.test.mjs tests/act2-event-ui.test.mjs`：10/10通过，0失败/跳过，73,633.4129ms。保留原source oracle、绑定排除、过期选择、取消和已付款回滚断言。
- 复用 `runLua` 执行 `uncommon_relics_effects.lua`、`opening_hand.lua`、`permanent_purge_routes.lua`：13/10/7组通过。
- 实际生成NodeUI显示与选择闭环探针通过，原始输出和探针源见 [本轮归档](../evidence/task90-reconcile-20261114)。探针原执行位置为 `build/task90-recheck/display.lua`；归档txt可在已生成数据/UI的新独立树复制回该位置重现。

这些是当前源码/Fengari层的机制、显示接线与操作闭环，不是官方导入、当前真实ready、自然抽中事件、PC客户端或实体手机证据。两个TASK-90 AC未要求把设备验收一并完成；设备仍沿原验收任务，不写通过。

## 原反馈与已有交付

10/30报告明确事件未知，缺实际候选SHA/GIL；含UID的原聊天截图未在仓库重传。不能因当前“未瓶装”只剩第三幕Falling，就倒推原反馈必然来自第三幕：原修复前第一幕篝火精灵/变换神龛、第二幕古老文字等也使用“非瓶装”。

[PR #436](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/436) 已于2026-10-31 18:28:43 UTC合并为 `b4f88a1f574b403f4cc68d54ee37565f3012b5ad`，包含 [原TASK-90实现/独审说明](TASK-90.md)，其独审来源为 `/root/release_audit`。该实际SHA的历史[Quality push 41229605961](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/41229605961) completed/success，27项作业中26 success，仅未选Fast skipped；[Licenses push 41229605996](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/41229605996) completed/success。只读API作业详情保存在本轮归档；没有重跑旧CI，也不把历史状态或本轮新文档当作当前候选的完整交付回执。

当前第三幕Falling的“未瓶装”残留有 `run.act==3` 限制，属于保留的full-source未来范围，不是本次两幕仍需施工的缺口。本轮满足的是已有两幕交付的两个AC复核；后续若开放第三幕再沿内容任务处理，不为清任务扩张比赛范围。
