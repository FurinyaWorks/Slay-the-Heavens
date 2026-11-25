---
id: TASK-115.2
title: 接续工程与平台版本解耦
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-25 20:59'
updated_date: '2026-11-25 21:19'
labels:
  - v2.2.0
milestone: m-8
dependencies: []
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/952'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/977'
documentation:
  - docs/versions/V2.2.0-RELEASE.md
parent_task_id: TASK-115
priority: medium
type: task
ordinal: 209000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：#952 已提交版本元数据实现。

任务：核对最新基线并接续原 PR。

边界：沿用发布通道和旧版本证据；平台版号以实际确认记录为准。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 覆盖版本类型、历史兼容、待确认平台编号、构建与附件错配；通过独审与定向回归
<!-- AC:END -->
