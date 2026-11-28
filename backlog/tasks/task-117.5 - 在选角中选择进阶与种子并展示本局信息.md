---
id: TASK-117.5
title: 在选角中选择进阶与种子并展示本局信息
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
ordinal: 232000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
玩家需要查看已解锁难度、规则和可分享种子。

## 任务
在现有选角、局内界面上增加难度选择、锁定展示、种子输入和查看。

## 边界
参考原版流程，沿用本作 UI 组件。通过已验证的官方输入或轻量数字控件，避免业务随机流消费。

## 验收
见下方验收项。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 新玩家只可选择 A0，锁定及累计规则清晰，两种开局和种子展示可用
- [ ] #2 验证 PC、手机、开关两态、无损输入错误处理以及相关 UI 操作的 RNG 隔离
<!-- AC:END -->
