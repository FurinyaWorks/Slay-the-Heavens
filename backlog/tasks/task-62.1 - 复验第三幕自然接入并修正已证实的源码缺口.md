---
id: TASK-62.1
title: 复验第三幕自然接入并修正已证实的源码缺口
status: To Do
assignee:
  - Furinya
created_date: '2026-11-23 04:21'
labels: []
milestone: m-9
dependencies: []
references:
  - docs/rules/CROSS_ACT.md
parent_task_id: TASK-62
priority: medium
ordinal: 188000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner 允许 develop 第三幕源码切片。以 #213、#252 及当前第三幕敌人、三个 Boss、事件桥和源队列为起点，先复用现有测试，核实当前正式 Run 命令、开发 profile 和自然进入。父项保留 TASK-61 等最终验收依赖。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 在显式开发配置沿真实第二幕到第三幕迁移验证 35–51 层、事件资格、场景源队列和无首领宝箱。
- [ ] #2 用现有 Run/Host 路径验证三个 Boss、普通结局和可重复的拒绝边界；仅修正能复现的第三幕源码缺口并保留回归。
- [ ] #3 提供精确提交和定向行为证据；正式发布与跨幕实机交回 TASK-62。
<!-- AC:END -->
