---
id: TASK-117.7
title: 独立验收进阶、种子与同一发布候选
status: To Do
assignee:
  - '@Furinya'
created_date: '2026-11-28 10:46'
labels:
  - v2.3.0
dependencies:
  - TASK-117.1
  - TASK-117.2
  - TASK-117.3
  - TASK-117.4
  - TASK-117.5
  - TASK-117.6
documentation:
  - docs/versions/V2.3.0-RELEASE.md
parent_task_id: TASK-117
priority: medium
type: task
ordinal: 234000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
集成后需同时确认新功能与原有玩法、性能及容量。

## 任务
独立子 Agent 验收 A0～A14、配置两态、指定种子回放、各角色进度与两幕胜利。

## 边界
只在集成验收后启用 v2.3.0 候选；同源 PC、实体手机、正式平台、容量和性能按现有发布门禁验收。

## 验收
见下方验收项。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 独立验证全部 DoD，并以真实正式入口完成代表性难度两幕通关
- [ ] #2 同候选 Full、官方持久化、PC、手机和性能证据通过，GIL 保持 19MB 内部控制线与 20MB 平台硬限
- [ ] #3 绑定源码、配置及 GIL，启用后复验同包，更新玩家 ChangeLog
<!-- AC:END -->
