---
id: TASK-114
title: 用静默检查与 GitHub 回调收口 Agent 工作
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-25 15:48'
updated_date: '2026-11-25 15:54'
labels: []
dependencies: []
priority: medium
ordinal: 189000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
减少收工和 CI 期间重复查询与成功日志。沿用项目检查和 GitHub 事件验证关停状态。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Codex Stop 和 SubagentStop 在语法、数据、Lua lint 与核心单测通过时零输出，失败返回阻断诊断
- [ ] #2 GitHub 完成事件只报告异常，PR 关闭和分支删除由对应事件核对，复用入口在三仓生效
- [ ] #3 用成功、失败与无权限样例验证回调行为，并核对三仓临时引用的收口状态
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
回调逻辑已使用模拟 GitHub API 对 11 个场景验证，包括正常关闭、重开、仍存在的分支、权限拒绝及过期 CI attempt。正式仓库的事件部署与验证仍待处理。

在干净项目工作树实测成功退出 0，两个输出流均为空。无效 JS 负控退出 2，只报告阶段、文件和错误。两个 Fork 默认分支已启用事件回调并实测 CI 失败注记。主仓集成与三仓收口最终对账待完成。
<!-- SECTION:NOTES:END -->
