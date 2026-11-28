---
id: TASK-117.3
title: 按进阶难度调整精英分布和敌人属性
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
ordinal: 230000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
提升难度需要增加精英并强化各档敌人。

## 任务
实施 A1～A4 与 A7～A9；按敌人和招式记录原版数值。

## 边界
在核心地图、实际遭遇和战斗数据实施，沿用地图表现、业务随机流和 A0。

## 验收
见下方验收项。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 分难度测试精英比例和取整，验证固定种子布局及 A0 对照
- [ ] #2 普通、精英、Boss 分别验证精确属性、攻击和 A0 输出
<!-- AC:END -->
