---
id: TASK-42.2
title: PC卡牌取消提示瞄准线与异常牌面复验
status: In Progress
assignee:
  - Furinya
created_date: 2026-11-15 20:14
updated_date: '2026-11-18T14:00:00Z'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PC-QA-20261115.md
  - TASK-4.5
  - TASK-4.6
  - TASK-30
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-verbatim.txt
parent_task_id: TASK-42
priority: medium
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-11-15 PC：取消选中后“无法使用这张牌”残留（51:12）；防御牌选中时金色线条与合法出牌区关系不明（57:09）；敌方被选中有多余四角加号（21:13）；“全力进攻”数值/红色↓视觉异常待辨别是合法预览还是bug（50:41）。截图04、11、12。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 卡牌不可用提示在取消、切牌、重新有效选牌、切页/回合结束时按真实状态清理，无过期提示残留或事件穿透。
- [ ] #2 攻击/技能/无目标牌的合法锁敌、取消、跟手及无效位置提示参照已批准初代行为；不引入常驻金线或无目的四角加号；已有目标身份与出牌规则不退化。
- [ ] #3 核实“全力进攻”卡牌截图中的数字与↓是否为正确的已实现伤害修正/禁用反馈，判断异常时给出完整状态与预览依据，禁止直接修改平衡数字。
- [ ] #4 同一候选真实 PC 快慢点选/拖动/取消各20次及相关手机操作回归，保存截图、事件与精确SHA，提示不遮住牌面及旁边文字。
- [ ] #5 核对 #672 对 card-cancel-notice/drag-line/target-corner 的代码和测试，未合入或未实机通过前不勾AC；与 TASK-4.5/4.6 不重复立核心数值任务。
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
#672 当前包含 card-cancel-notice、drag-line-initial-state、target-corner-geometry 回归及对应实现，但其 PR 未合入且设备证据未完成。本项已在实施，状态 In Progress，AC 全部保留未验。严重度：提示残留P0，其他P1/待定。
<!-- SECTION:NOTES:END -->
