---
id: TASK-110
title: 接入可复用工程规范与护栏索引
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-21T01:09:00Z'
updated_date: '2026-11-21T01:19:00Z'
labels: []
dependencies: []
references:
  - https://github.com/FurinyaDev/OpenHarness/issues/48
documentation:
  - docs/AGENT_GUIDANCE.md
priority: medium
ordinal: 185000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户已批准公共工程规范和当前项目薄接入。复用 TASK-87 已交付的导航和门禁，补足工程能力映射与验证路径。范围限于指引、工程说明和原有任务；现有代码、门槛和 CI 流程维持原有规则。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 从根指引可找到项目规则权威来源、现行命令及自动和人工验收边界。
- [x] #2 已有检查和隔离样例证明相关命令可用，典型依赖、质量和尺寸违规有可复核拦截。
- [ ] #3 独立审查和原生 CI 核对实际候选，合入 develop 后按既有交付合同复核。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
R — Requirements：目标 develop；补根入口、既有规则与验证导航。Given 现有工程配置 When 按导航执行 Then 找到权威规则与真实命令。
E — Entities：Backlog 持有范围与验收，配置和脚本持有项目策略，GitHub 持有交付证据。
A — Approach：复用既有检查和隔离夹具，采用文档薄接入。
S — Structure：AGENTS.md、docs/AGENT_GUIDANCE.md 及本任务；公共模板由 OpenHarness 维护。
O — Operations：核对既有权威 → 补导航 → 运行指导、工程和尺寸验证 → 独立评审及原生交付。
N — Norms：遵循 TASK_EXECUTION、BRANCH_LIFECYCLE、CI；保留 #769 的在途范围。
S — Safeguards：检查当前 BASE/HEAD，Lua 依赖与质量使用原配置，设备验收保留原产品流程。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
自 develop b836c543 开工，分支 docs/harness-engineering，收口人 /root。根入口指向规则映射；采用 OpenHarness 固定源码 98826145。引导与 Backlog 检查通过，依赖与质量专项 32/32、指引与尺寸专项 15/15。架构检查通过 351 模块、1988 条依赖；完整工程检查在生成数据和 UI 后通过，4 项变异均被指定断言拦截。隔离尺寸夹具预算内通过，无例外的 403 行生产差异被拒。AC3 保留待原生审查、CI、合入及交付复核。
<!-- SECTION:NOTES:END -->
