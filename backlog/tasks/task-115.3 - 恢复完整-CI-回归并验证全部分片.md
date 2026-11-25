---
id: TASK-115.3
title: 恢复完整 CI 回归并验证全部分片
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-25 21:00'
updated_date: '2026-11-25 21:19'
labels:
  - v2.2.0
milestone: m-8
dependencies: []
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/929'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/970'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/971'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/972'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/973'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45630976779'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/976'
documentation:
  - docs/versions/V2.2.0-RELEASE.md
parent_task_id: TASK-115
priority: high
type: task
ordinal: 210000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：v2.1.1 Hotfix 的 Full 有失败、取消及跳过分片，已有多条接续 PR。

任务：取回原始失败记录，逐项区分真实缺陷、夹具失配、历史 ID 与其他工程故障。

边界：接续 #929、#970–973；保留测试数量、断言、覆盖和门槛。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 每项原始失败有复现、归因、接续记录和修后结果；取消和跳过分片经 Full 重跑
- [ ] #2 恢复后的 develop 完整 CI 全绿，独立评审核对分片与断言；冻结候选另按 TASK-115.13 执行
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
已派发恢复 Full。原始运行含 19 个失败、16 个取消分片或汇总、1 个跳过及 2 个成功；失败日志已取回，逐项归因中。
<!-- SECTION:NOTES:END -->
