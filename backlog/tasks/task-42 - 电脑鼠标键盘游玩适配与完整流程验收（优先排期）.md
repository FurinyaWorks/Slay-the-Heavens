---
id: TASK-42
title: 在电脑上用鼠标和键盘完整玩一遍
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-10-23 12:23'
updated_date: '2026-11-15 18:19'
labels:
  - awaiting-live
milestone: m-8
dependencies: []
references:
  - TASK-4
  - TASK-10
  - TASK-30
  - docs/design/UI_DESIGN.md
  - docs/backlog-details/TASK-42.md
  - docs/DELIVERY-CLOSEOUT.md
  - docs/BACKLOG-AUDIT-20261026.md
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/684'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/690'
  - docs/backlog-details/PC-QA-20261115-CONTINUATION.md
priority: medium
type: feature
ordinal: 40000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
在PC鼠标键盘上用同一候选验收当前公开的岩系旅行者第一、第二幕，记录设备与真实操作结果；雷电留未来版本。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 鼠标选牌、看详情、选敌人、出牌、取消和结束回合正常，不重复执行。
- [ ] #2 可用键位有说明，键盘能切换焦点、确认和取消，不与原神按键冲突。
- [ ] #3 鼠标键盘能完成地图、各类房间、领奖、胜败结算和重开。
- [ ] #4 保存电脑实测结果，有限制或没做好的地方写清楚。
- [ ] #5 同一候选实测跨战斗首次点牌、旧触点、药水、奖励、弹窗和取消退出的真实事件派发；已完成本地手势切片不能代替电脑验收。
- [ ] #6 同一候选两职业覆盖两幕、换幕、胜败与重开，保存真实设备证据及通关耗时；预览不能替代。
- [ ] #7 PC01–PC38逐项对应实现、PR、提交、回归与当前正式候选设备验收，未验、待判、延期分别记录。
- [ ] #8 #676 拟议 TASK-16.1.6 AC1：按真实分裂触发生成两个可分别辨识的敌人实体；视觉位置/生命值/意图/点击命中区对应各自实体，无重叠和不可选目标。
- [ ] #9 #676 拟议 TASK-16.1.6 AC2：同场已有敌人时、第一/最后一列、不同可用宽度及反复遭遇下布局稳定，无遮挡重要战斗HUD。
- [ ] #10 #676 拟议 TASK-16.1.6 AC3：核心分裂数量、HP、RNG/行动顺序和死亡奖励规则不改；用真实Lua/Host复现并保留旧错误RED和新行为GREEN。
- [ ] #11 #676 拟议 TASK-16.1.6 AC4：复核 #672 的 slime-split-positions 回归与实际正式GIL布局；同候选PC和相关手机实测未完成前不得标记Done。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
2026-11-16 Release继续按38条原文收口：既有P0选择性修复PR684、新PC11/38 PR690及独立PC18/21/01组合逐项关联。只使用Release基线，不复制develop未来功能；保留并行PR685–689已有归属，重叠按真实来源最小复用，统一source/CI/正式候选各自核验。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-27同类范围审计：承接已批准四职业与第一至隐藏第四幕完整范围及原创角色责任，纠正仅第一幕总验收口径；原验收证据保留，本轮新增要求均未勾，不声称新增实机通过。

负责人字段规范化：原记录 @Codex 作为历史执行者信息保留；任务负责人为 Furinya。

2026-10-28用户确认范围变更：当前比赛只覆盖第一幕、第二幕，优先前10分钟体验；第三幕/隐藏第四幕/真结局及依赖退出续玩、跨局进度、历史解锁或跨局留卡的内容退出比赛必做，保留为无新截止日的未来候选。四职业及已批准原创角色要求不变。同局跨房间、第一幕到第二幕的资源与随机流、内存快照/回滚和本局结算保留；源码/候选/平台/实机仍分层，未完成状态不因范围调整改变。
原AC6（仅保留历史要求，不再作为当前比赛必做）：同一候选四职业及已批准原创角色的完整操作矩阵覆盖第一至隐藏第四幕、换幕与两种结局，逐项保存真实事件及设备证据，第一幕单次通关不代替。

2026-10-28范围决定：比赛范围见 docs/SCOPE.md；旧验收文字保留于历史记录，本次未新增通过证据。原受影响验收：同一候选四职业及已批准原创角色的操作矩阵覆盖第一幕、第二幕、同局换幕、本局胜败与重开，优先前10分钟上手与反复操作；逐项保存真实事件和设备证据，未测内容明确留待验，不用预览替代。

2026-10-31规划校正：AC6中的旧「两职业」按docs/SCOPE.md现行决定仅验旅行者两幕；原AC不重写、不勾选，候选/设备证据要求保留。
2026-11-03 赛后调整：m-5 → M7（产品体验与核心特色）；保留状态和未验 AC；旧截止日期 '2026-10-28' 已移除，不设新期限。

2026-11-14第二轮逐项核对，保留To Do：本项要求同一当前候选的完整PC鼠标键盘操作矩阵，未找到本项已执行的设备记录；源码输入支持不等于该整轮实测已经开始。

已实际提交PR684@ae5194a7（初读Quality43734648153 queued、其余in_progress）与PR690@11ec36bf（首次Quality43735642603/Quick43735642541/Licenses43735642720 queued），均目标release/v2.0.0；只初读不轮询，不标CI完成/不调用Develop merge:auto。完整38台账现据690接续至本分支，软件/设备缺口分别保留。PC18+21+01组合df5/证据2cb产品独审有界通过，原29路径28等源、唯一689退休helper补丁；当前source/CI5FAIL与新回归约80s成本重排尚待，正式候选仍无GIL/ready/容量/PC手机结果，任务不Done。

2026-11-16 完整38项接续表追加PC26/30实际进展：独立Release产品93ae7376、证据707da8ff与独审CODE_SCOPE通过；真实hover1.08交叠P2已修，原RED保留，source正在隔离接续，尚未推送/PR。不新增重复任务。PC01/18/21原source5FAIL已在c46输入实际补验10/10，但后继raw shadow入口修复带来47CI与新增成本接续，未冒称Hosted或设备验收。
<!-- SECTION:NOTES:END -->
