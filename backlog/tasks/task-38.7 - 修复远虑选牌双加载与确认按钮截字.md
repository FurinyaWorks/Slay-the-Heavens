---
id: TASK-38.7
title: 修复「远虑」选牌，让一次点按生效并显示完整按钮
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-15 19:11'
updated_date: '2026-11-23 04:32'
labels:
  - mobile
  - playtest-20261115
  - p1
  - v2.0.0
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/MOBILE-QA-20261115.md
  - TASK-4.21
  - TASK-4.20
  - TASK-100.1
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/842'
parent_task_id: TASK-38
priority: medium
type: bug
ordinal: 178000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
### 情况

点选后准备画面重复出现，第二次点按才显示选中。IMG_1405 还显示确认按钮被截字。

### 任务

核实一次点按所走的选牌与重绘流程，显示正确选中反馈和完整确认文案。

### 边界

保留放入牌底、下次免费打出及随机流。以实际事件和画面定位重复加载。

### 验收

在手机窄屏核对一次点选、重复点按、取消和回退，检查零、单、多张选择与完整按钮。 使用同一候选完成原任务列出的回归、独立评审和手机验收。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 单点卡牌立即有正确UID的已选择反馈，反复点击、取消、回退规则明确且无重复全屏准备/二次提交。
- [ ] #2 确认按钮在手机窄屏完整显示“确认选择”或已批准等义文案；零/单/多选择与卡面关系可读。
- [ ] #3 原有将手牌放牌底、下次打出免费效果及RNG不变；记录真实事件/渲染时序、RED→GREEN、独立审查与手机验收。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
先查最新develop、开放PR与现有实现，在真实状态/事件层复现问题并保存RED；仅对证实的根因做最小修复，提供GREEN/负控、独立复审与候选交付。没有同候选实体手机证据时AC保留未勾，遵守独立worktree、Backlog认领、CI与用户发版边界。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
依据2026-11-15用户两轮真机录音。P0/P1是体验严重度，非突破High队列上限的授权。逐字时间和截图映射见docs/backlog-details/MOBILE-QA-20261115.md。本PR仅登记任务，不代表Bug已修、代码或手机已验。

2026-11-23：#842 已合 develop 1aceec72a3522b98c9921deb48a266965c0e5187，接回远虑与状态触点修复。按原 AC 复验实体手机双加载与确认截字，尚未关闭。
<!-- SECTION:NOTES:END -->
