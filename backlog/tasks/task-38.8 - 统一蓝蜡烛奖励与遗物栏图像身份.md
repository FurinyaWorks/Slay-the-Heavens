---
id: TASK-38.8
title: 统一蓝蜡烛图标，让奖励与遗物栏都能辨认
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
  - TASK-25.6
  - TASK-4.14
parent_task_id: TASK-38
priority: medium
type: bug
ordinal: 179000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
### 情况

蓝蜡烛在战斗奖励显示通用盒子，领取后遗物栏显示蜡烛。实体管理是待验证的可能原因。

### 任务

沿同一遗物标识核对图像注册和显示，复用 TASK-25.6 的已有资产。

### 边界

保留遗物效果、抽取与持有状态及随机流。

### 验收

核对奖励、领取、顶栏、遗物库、详情的同一图标，并复验切页、重入、资源缺失和相近遗物。 使用同一候选完成原任务列出的回归、独立评审和手机验收。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 同一蓝蜡烛在战斗奖励、选择、领取后顶栏/遗物库与详情均显示对应可辨认蜡烛图，不能退化盒子或混其他遗物。
- [ ] #2 效果/抽取/持有状态与随机流不改；对资源缺失/切页/重入/相近遗物有负控。
- [ ] #3 提供同ID同源图像映射RED→GREEN、独立审查、原生与实体手机实测，未测不勾。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
先查最新develop、开放PR与现有实现，在真实状态/事件层复现问题并保存RED；仅对证实的根因做最小修复，提供GREEN/负控、独立复审与候选交付。没有同候选实体手机证据时AC保留未勾，遵守独立worktree、Backlog认领、CI与用户发版边界。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
依据2026-11-15用户两轮真机录音。P0/P1是体验严重度，非突破High队列上限的授权。逐字时间和截图映射见docs/backlog-details/MOBILE-QA-20261115.md。本PR仅登记任务，不代表Bug已修、代码或手机已验。
<!-- SECTION:NOTES:END -->
