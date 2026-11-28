---
id: TASK-117.1
title: 核验 STS1 进阶规则和千星平台能力
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-28 10:46'
updated_date: '2026-11-28 10:46'
labels:
  - v2.3.0
dependencies: []
documentation:
  - docs/versions/V2.3.0-RELEASE.md
parent_task_id: TASK-117
priority: medium
type: spike
ordinal: 228000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
任务需用可核验的原版行为及平台实测作为实现依据。

## 任务
登记 A1～A14 规则证据、数值和取整，盘点种子流、跨局状态及平台输入和存档。

## 边界
平台探针单独登记约束和证据，可独立推进。平台未接通时继续无需平台的设计与实现。

## 验收
见下方验收项。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 逐项记录原版依据、游戏映射、数值边界和待核实项
- [ ] #2 明确输入和存档的实际验证结果、已确认的应用接口和仍缺的能力
- [ ] #3 记录三仓与 Backlog 查重、基线以及切片模块归属
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
并行核查 STS1 原版规则、官方平台文档/工具和三仓基线，分别汇报可核验依据及未通过验证。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
目标 develop，基线 32a15219aecd145c59cb1b2fcf477e5556766e5d；第一片为规则、平台与仓库只读核验，先记录接口边界和独立验收，外部平台能力不阻塞规则开发。
<!-- SECTION:NOTES:END -->
