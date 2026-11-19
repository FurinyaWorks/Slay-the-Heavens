---
id: TASK-38.5
title: 修复首领遗物「小屋」选择，让玩家继续第二幕
status: To Do
assignee:
  - Furinya
created_date: '2026-11-15 19:11'
updated_date: '2026-11-19 03:49'
labels:
  - mobile
  - playtest-20261115
  - p0
  - v2.0.0
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/MOBILE-QA-20261115.md
  - TASK-14.1
  - TASK-63
parent_task_id: TASK-38
priority: medium
type: bug
ordinal: 176000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
### 情况

第一幕领取「小屋」后进入遗物效果页，画面显示四条空白选项。截图 IMG_1407、IMG_1408 记录了页面与遗物说明。

### 任务

核对来源规则、奖励数据和前置说明，使合法选项可读可选，或按规则结束领奖并继续第二幕。

### 边界

保留奖励数值与随机流。「代价」是玩家的疑问，按来源核实。

### 验收

自然领取后可继续第二幕，奖励只结算一次；覆盖空、一、多选项及重入、取消、失败。 使用同一候选完成原任务列出的回归、独立评审和手机验收。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 先核实小屋来源规则、合法奖励与可选效果的数据和前置说明，禁止编造支付代价、改平衡或随机流。
- [ ] #2 自然领取后选项可见可读可选，或按合法规则直接结束；不得生成四个空按钮或死路，能继续第二幕。
- [ ] #3 奖励恰好结算一次、跨幕及重入/取消/失败原子，具有空/一/多选项RED→GREEN与独立复审，手机待验。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
先查最新develop、开放PR与现有实现，在真实状态/事件层复现问题并保存RED；仅对证实的根因做最小修复，提供GREEN/负控、独立复审与候选交付。没有同候选实体手机证据时AC保留未勾，遵守独立worktree、Backlog认领、CI与用户发版边界。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
依据2026-11-15用户两轮真机录音。P0/P1是体验严重度，非突破High队列上限的授权。逐字时间和截图映射见docs/backlog-details/MOBILE-QA-20261115.md。本PR仅登记任务，不代表Bug已修、代码或手机已验。
<!-- SECTION:NOTES:END -->
