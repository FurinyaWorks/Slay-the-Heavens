---
id: TASK-115.12
title: 记录可延期的非必要优化
status: To Do
assignee:
  - '@Furinya'
created_date: '2026-11-25 21:02'
updated_date: '2026-11-26 05:11'
labels:
  - release-deferral
milestone: m-8
dependencies: []
documentation:
  - docs/versions/V2.2.0-RELEASE.md
parent_task_id: TASK-115
priority: low
type: task
ordinal: 224000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：当前版本以必要的体验与发布门禁为范围。

任务：从已知候选中登记可独立延期的优化及依据。

边界：不纳入候选冻结依赖。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 明确延期归属和证据，保留历史任务及来源
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-26 已决定将 #932、#933、#909 及非本版内容移出发版依赖。目标 v2.3.0 为建议接续版本，届时在对应版本规划审定。固定 PR、开发 HEAD 与接续 Task 登记在正式版本规划的延期表，保留原分支和审查。

接续时从 #933 固定 HEAD 恢复 TASK-113 的身份、原验收与证据，复用实际实现并用当期候选完成 PC、手机和官方验证。#932 从固定 HEAD 恢复 TASK-103.6.1，由 TASK-103.6 对照已观察到的冷开/暖开权衡。

Owner 在版本协调会话确认沿用 #994 的 v2.3.0 暂排。#909 二幕与交互音频、#932 牌组冷开和 #933 确认弹窗留待后续版本，各自现行技术验证和接续来源保留。
<!-- SECTION:NOTES:END -->
