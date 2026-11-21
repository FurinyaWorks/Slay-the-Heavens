---
id: TASK-103.8
title: 修复营地锻造选牌、升级预览和返回流程
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-21 09:25'
updated_date: '2026-11-21 09:26'
labels: []
milestone: m-8
dependencies: []
parent_task_id: TASK-103
priority: medium
type: bug
ordinal: 186000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：锻造页使用固定卡位分页并提前展示禁用确认。任务：复用已有原生卡牌和滚动布局，修复营地锻造选择及确认阶段。边界：仅调整界面与输入，保留现有升级规则。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 12 张可升级牌使用连续五列滚动，少量牌居中且无滚动条。
- [ ] #2 完成选牌、升级预览、取消或确认，并验证移除、变换和留影等关联流程。
- [ ] #3 现有 CI 与独立审查通过，并按授权合入 release/v2.0.0。
- [ ] #4 在同一候选上复核 PC 与手机的布局和操作。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
在指定 release 基线复用原生牌组滚动控件，回归锻造及共用选牌入口，绑定精确提交独审和 CI 后走 PR-only 应急流程。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
针对 release/v2.0.0 的 7381cf7152 基线。离线原生控件验证 12 张牌、少量牌居中、取消保留滚动、触摸滑动与回收时拒绝旧事件、重复升级资格及升级后营地结果。正式托管 CI 与同候选实机仍待验证。
<!-- SECTION:NOTES:END -->
