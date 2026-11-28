---
id: TASK-117.6
title: 保存各角色进阶记录并按正式胜利解锁
status: To Do
assignee:
  - '@Furinya'
created_date: '2026-11-28 10:46'
labels:
  - v2.3.0
dependencies:
  - TASK-117.2
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1081'
documentation:
  - docs/versions/V2.3.0-RELEASE.md
parent_task_id: TASK-117
priority: medium
type: feature
ordinal: 233000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
离开奇域再进入后需恢复各角色进度。

## 任务
沿用同期 TASK-53 对应的统一平台存档契约和 provider，按角色单调、幂等更新正式进度。

## 边界
TASK-53 由 #1081 恢复原编号。官方验收等待真实共享读写接口；独立源码验证可先做。固定种子禁计成就和进阶；现行正式胜利为第二幕。

## 验收
见下方验收项。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 按角色记录最高通关，在当前最高难度正常随机通关时解锁下一档，A14 封顶
- [ ] #2 失败、放弃、重结算及固定种子不会推进解锁，固定种子不会推进成就
- [ ] #3 在官方平台跨会话恢复，通过旧存档、坏数据、写失败重试和单调性回归
<!-- AC:END -->
