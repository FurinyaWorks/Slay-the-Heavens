---
id: TASK-115.5
title: 修复阻塞正常游玩的严重缺陷
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-25 21:00'
updated_date: '2026-11-28 08:13'
labels:
  - v2.2.0
  - release-scope
milestone: m-8
dependencies: []
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/772'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/969'
documentation:
  - docs/evidence/v2.2.0-sts-details/sts1-reference.md
parent_task_id: TASK-115
priority: high
type: bug
ordinal: 212000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：需要用 v2.1.1 正式版、当前 develop 及原始回归定位玩法阻塞。

任务：复用已有缺陷任务，记录可复现的严重问题，修复并验证核心玩家路径。

边界：夹具、历史 ID 及非阻塞缺陷沿各自接续任务处理。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 正式配置中已确认的阻塞缺陷逐条有回归和独立复验，覆盖正常完成两幕的玩家路径
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
独立复核 develop 8a5f8681。正式生成配置的 Host 用 #969 原始快速拖牌夹具通过 20/20。小屋首领奖励的受控实际结算通过，奖励可读且只结算一次并进入第二幕。原默认生成配置下，退出、重开和结算重试夹具通过。未在这些定向路径复现现行严重阻塞。最终真实有声候选的自然两幕通关、PC 拖牌延迟、手机输入与长时稳定性待验，验收项保持未勾。

v2.2.0 P1 预览切片：巢穴的仪式匕首与锻造幻影/幻影+ 缺少决策前详情。依据固定 STS1 来源修复事件和卡牌关键词，核对同类入口；用实际模拟器输入、截图和定向回归验收，并绑定最新 Release 基线独审。Owner 授权通过管理员 PR-only 合入 release/v2.2.0；设备验收继续沿用本任务既有未勾项。
<!-- SECTION:NOTES:END -->
