---
id: TASK-117.4
title: 按进阶难度结算开局、换幕和奖励
status: To Do
assignee:
  - '@Furinya'
created_date: '2026-11-28 10:46'
labels:
  - v2.3.0
dependencies:
  - TASK-117.2
documentation:
  - docs/versions/V2.3.0-RELEASE.md
parent_task_id: TASK-117
priority: medium
type: feature
ordinal: 231000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
进阶规则需要逐档改变玩家生命、牌组和奖励。

## 任务
实施 A5、A6、A10～A14 及其累积关系。

## 边界
按角色配置生命上限；沿用换幕、奖励和永久牌组模块。

## 验收
见下方验收项。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 验证岩旅开局 80/80、72/80、68/75，明确取整和换幕丢失生命恢复
- [ ] #2 验证进阶之灾的虚无、不可打出及永久牌组限制，以及药水槽边界
- [ ] #3 验证各幕升级奖励概率和 Boss 金币倍率、取整及 A0 回归
<!-- AC:END -->
