---
id: TASK-109
title: 验证双人战斗图元成本与控件边界
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-19 09:47'
updated_date: '2026-11-19 10:06'
labels: []
dependencies: []
references:
  - docs/evidence/task-109-coop-lab/results.json
priority: medium
type: spike
ordinal: 184000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：已确定 1–2 人的产品范围，平台容量和角色画质成本仍待验证。
任务：记录决策并交付独立容量与压力实验。
边界：复用归档 TASK-33 和 DRAFT-3 的联机验收依据，不接管旧任务；实验与正式单人候选隔离。
验收：分别保存离线与官方、实体设备证据。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ADR 记录已接受的 1–2 人配置、权威同步和容量、画质、实机验收合同。
- [x] #2 生成三档角色及单端压力工程和边界复现产物，保存逐项实例账本、实跑结果与复现命令。
- [ ] #3 在副本读回官方 1–2 人房间配置，完成真实双端联机及两端容量、手机压力验证。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 记录 ADR、既有单人/联机边界及 develop 实验分支。
2. 复用拟合、原生图元和模拟器，生成容量边界、三档双视角压力工程、逐项实例清单及证据。
3. 运行 node --test tests/coop-primitive-lab.test.mjs 和仓库门禁，提交目标 develop 的 PR。
4. 保留官方房间写入读回、真实双端同步和手机负载验收，需同候选平台与设备。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
develop 基线 62328bdac7703c3ab241e0ddb19e0fa05474f76a；分支 feat/coop-primitive-spec。已完成 14 个模拟器案例、.gia 导出及公开样例 GIL 1–2 人写入和独立读回。实际官方导入、双端房间与手机未接入，AC3 保持开放。
<!-- SECTION:NOTES:END -->
