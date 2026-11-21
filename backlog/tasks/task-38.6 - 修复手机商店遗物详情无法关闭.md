---
id: TASK-38.6
title: 修复手机商店遗物说明，让点空白可以关闭
status: To Do
assignee:
  - Furinya
created_date: '2026-11-15 19:11'
updated_date: '2026-11-19 03:49'
labels:
  - mobile
  - playtest-20261115
  - p1
  - v2.0.0
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/MOBILE-QA-20261115.md
  - TASK-4.10
parent_task_id: TASK-38
priority: medium
type: bug
ordinal: 177000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
### 情况

点开商店遗物说明后，点空白仍挡住商品。IMG_1404 可对照布局，实际点按现象来自录音。

### 任务

核对 #672 与 #680 的现有处理，接回仍缺的说明关闭行为。

### 边界

空白触点只关闭最上层。保留购买、离店和相邻 PC、手柄行为。

### 验收

点开说明再点空白，确认旧说明和触点都清理干净，之后可正常查看、购买和离店。 使用同一候选完成原任务列出的回归、独立评审和手机验收。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 同页点遗物→关闭/点空白→再选其他物品、购和离店均正常，旧说明与旧焦点彻底回收。
- [ ] #2 点击空白只关闭顶层，绝不穿透到购买或出牌；手机点击、PC鼠标、手柄的相邻回归保留。
- [ ] #3 检查#672是否已覆盖，已覆盖则只补回归不重造；保存RED→GREEN、独立审查与同候选手机验收。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
先查最新develop、开放PR与现有实现，在真实状态/事件层复现问题并保存RED；仅对证实的根因做最小修复，提供GREEN/负控、独立复审与候选交付。没有同候选实体手机证据时AC保留未勾，遵守独立worktree、Backlog认领、CI与用户发版边界。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
依据2026-11-15用户两轮真机录音。P0/P1是体验严重度，非突破High队列上限的授权。逐字时间和截图映射见docs/backlog-details/MOBILE-QA-20261115.md。本PR仅登记任务，不代表Bug已修、代码或手机已验。
<!-- SECTION:NOTES:END -->
