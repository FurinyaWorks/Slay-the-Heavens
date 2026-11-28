---
id: TASK-117
title: 交付 v2.3.0 进阶挑战与可复现种子
status: To Do
assignee:
  - '@Furinya'
created_date: '2026-11-28 10:45'
labels:
  - v2.3.0
  - version-main
dependencies: []
documentation:
  - docs/versions/V2.3.0-RELEASE.md
priority: medium
type: task
ordinal: 227000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
玩家需要跨局挑战目标和可分享的两幕挑战。

## 任务
交付 A0～A14 累积难度、随机及指定种子、角色独立进度，沿用 v2.3.0 统一存档。

## 边界
按已批准的 REASONS Canvas，以 STS1 规则为基准，先在分仓完成独立验证。进阶开关默认关闭，v2.2.0 发版并行独立。

## 验收
见版本规划与下方验收项。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 进阶规则、种子复现和角色进度均有合入与独立验收收据
- [ ] #2 正式候选依据同源 Full CI、官方持久化、容量、性能和设备证据验收
- [ ] #3 Owner 确认发布后对账玩家更新说明、平台版本及回执，并完成生产回流
<!-- AC:END -->
