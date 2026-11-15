---
id: TASK-87.2
title: 阻止设计前置与任务依赖漏检
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-15 13:10'
updated_date: '2026-11-15 14:48'
labels: []
dependencies: []
references:
  - docs/backlog-details/TASK-87.2-DEPENDENCY-GUARD.md
parent_task_id: TASK-87
priority: medium
type: bug
ordinal: 178000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户再次指出设计尚未确认就进入实施、依赖错误未及时发现。现有领取入口不读取dependencies，Backlog仅检查97到105的容量特例，正文阶段前置与真实状态没有贯通。须用最小错误样本补可执行防护，保留已有批准稿修复和隔离实验边界。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 记录真实漏边、状态与GO语义的根因和最小复现，不将推断写成历史事实。
- [x] #2 领取检查拒绝未完成、未知、重复、循环或不可信依赖，明确输出阻塞链；合法独立任务保持可领。
- [x] #3 Backlog检查拒绝明确设计前置缺边及坏依赖，修正97的设计关系；实验与量产、设计批准与研究Done分开。
- [ ] #4 反例先红后绿，相关检查和可追溯独立复审通过；正常PR集成，不修改release。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 用97漏设计边与未完成依赖最小复现现有漏检。2. 在现有领取和Backlog入口共享轻量依赖校验，拒绝坏身份/未完成链；不从正文关键词猜审批。3. CLI修正97依赖并记录实验、设计、实施、验收边界。4. 定向回归与真实队列验证、独立复审后提交PR集成develop，release不改。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-15 Owner明确要求根因纠偏、轻量机制并及时集成既有成熟feature。执行树dependency-intake-1115，基线c2409ad7；现有87.1为状态对账，87.2仅补依赖漏检，避免重做。

2026-11-15已落本地机制：task:pick与verify:backlog共用轻量依赖检查，97经CLI补回96且保留105。未完成依赖旧入口ALLOW、97删设计边旧门禁空错误均先RED后GREEN；独审另发现宽松Done标量会误认证设计完成，已加两条入口反例并复用严格解析修复。6文件定向153/153通过（含冷进程无npm发布器与delivery合同），verify:backlog、syntax、guidance、diff检查通过。Fast规划因未建模Backlog要求Full，未重复本地全套或额外ci:full；托管与合后仍待。独审会话ses_e20966779ffeZw2jHWCrHnMhuR待修复后读回。源码通过不证明任何设计/容量/设备GO；AC4保留。

2026-11-15继续执行：补查跨模块合同发现metadata未登记当前CI原文，已通过merge:auto暂停PR682并读回；153项仅为当轮定向结果，不是Full通过。现同批纳入TASK34七行永久故障音乐清理，单UI后继接最新session/Neow，原大archive/六源views不改，新增精确小后继与实际复制闭包。48项epoch+80项依赖/Backlog+20pass1既有renderer能力skip通过。独审ses_e2058991bffe7LK6jit0BB7vj0另检出生成器依赖未合侧分支Git对象，已用对象不可用反例先红后绿并改为认证托管fixture，最终5/5通过。详见docs/evidence/dependency-bgm-source-contract-20261115.md；AC4仍待最终独审、正常CI/合后，不记Done。
<!-- SECTION:NOTES:END -->
