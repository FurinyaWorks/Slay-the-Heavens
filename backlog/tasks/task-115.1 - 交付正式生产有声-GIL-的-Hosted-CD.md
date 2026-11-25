---
id: TASK-115.1
title: 交付正式生产有声 GIL 的 Hosted CD
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
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/917'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/963'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/975'
documentation:
  - docs/versions/V2.2.0-RELEASE.md
parent_task_id: TASK-115
priority: high
type: task
ordinal: 208000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：#917 已有实现和 Hosted 组件探针，#963 已回流正式构建修复。

任务：继续 #917，从最新 develop 核对切片与生产输入，实测并交接首个可下载的候选。

边界：使用获授权的真实生产底图与精确源码。早期候选可独立交给 Owner。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 真实 Hosted Windows 完成有声 GIL、严格审计、归档及复下载校验，绑定底图摘要与精确源码 SHA
- [ ] #2 产物 SHA-256、收据、配置、run 及复用证据可查，Owner 获得首个候选入口；独立评审通过
- [ ] #3 冻结版使用现有 release/* 路径、精确版本和完整回执构建，通过同包平台负载合同和发布审计。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
复用 develop 中 #963 正式构建回执修复。先将来源、批准与最终审计切成可独立验证的前置，再更新 #917 的工作流，保留原 PR 历史。真实构建要求获授权生产底图、可用的精确源码 CI 和明确的产物分发权限。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
已派发 CD 独立实现。正式 Hosted 运行仍缺匹配的获授权生产底图及分发权限；最初 develop 的 Quality 未通过。两项待开解，不影响前置审计开发。
<!-- SECTION:NOTES:END -->
