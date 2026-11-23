---
id: TASK-29.3
title: 为下一版添加选牌瞬亮与出牌旋转反馈
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-21 12:38'
updated_date: '2026-11-23 04:22'
labels:
  - 待验
  - delivery-verify
milestone: m-8
dependencies: []
parent_task_id: TASK-29
priority: medium
type: enhancement
ordinal: 186000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
用户提供初代杀戮尖塔截图，希望选牌至出牌有短促高亮和旋转的手感。
## 任务
只向 develop 集成下一版表现优化，复用现有卡牌控件。
## 边界
不进入 release，不改战斗数值和输入；fork 预检不能替代正式准入。
## 验收
离线回归和正式 CI 独立记录；官方设备体验另行待验。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 选中时出现一次短促青色扩散光晕，取消、换牌或隐藏后不残留，静止不持续重绘
- [ ] #2 出牌短闪并旋转，连续出牌重置，不改变战斗规则
- [ ] #3 独立评审与正式 CI 通过后合入 develop，不修改 release
- [ ] #4 同候选官方 PC 和手机实测确认手感及性能
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 增加选中与出牌动画生命周期回归并确认 RED。2. 复用 pulseEdge2 和 playedCard border 实现短促反馈，参数来自主题。3. 定向回归、fork 预检、独立评审后正常 PR 到 develop；官方设备保持待验。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-21 用户明确授权下一版优化。目标 develop@345ba083，分支 feat/card-play-feedback，Owner /root。源码实现复用 pulseEdge2 做0.24秒一次扩散及出牌短闪/旋转；四项定向回归4/4通过（含原命中时间），语法通过。官方设备未验证；正式CI与独审待执行。主题变更选测要求Full，计划仅Fork B运行一次。

2026-11-23：#799 merge 0c6f5a036366230ccf7f777c471b923f9e4c03b5，选牌瞬亮与出牌旋转已合 develop。保留同候选官方 PC/手机手感、性能与完整交付回执验收。
<!-- SECTION:NOTES:END -->
