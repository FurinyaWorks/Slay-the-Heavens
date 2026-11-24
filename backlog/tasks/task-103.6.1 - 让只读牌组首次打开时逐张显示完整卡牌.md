---
id: TASK-103.6.1
title: 让只读牌组首次打开时逐张显示完整卡牌
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-24 05:30'
updated_date: '2026-11-24 05:48'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/evidence/deck-pages-20261122/README.md
parent_task_id: TASK-103.6
priority: medium
type: enhancement
ordinal: 188000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：首次打开只读牌组的黑色准备画面阻塞体验，暖开已可复用。

任务：P1 UX / Performance Enhancement。比较渐进呈现与有界空闲预热，使用最小改动。

边界：仅接续 TASK-103.6 的首次只读浏览范围。保留布局、排序、翻页、详情和严格选牌门控，限 develop 集成。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 冷开立即提交无遮挡框架，完整卡牌分批展示，官方客户端首反馈 P95 ≤100 ms 并记录首卡和全页。
- [ ] #2 切换 Run、快速返回重开、排序翻页和暖态复用通过，资源有界且严格选牌门控通过。
- [ ] #3 提供独立审查和同基线离线与官方客户端分层证据。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 在现有分页池的 4 ms 软预算内，完整首张后发布牌区，逐张沿固定槽位呈现。
2. 同一底层页面的静态只读浏览隐藏视觉遮罩和等待提示，保留输入 blocker、就绪与失败恢复。异步卡面配置继续整页就绪。
3. 在 fork-a/perf/deck-cold-start 对 develop c420b028 做 Host A/B、相关回归和四维独立审查，正式 PR 只指向 develop。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
集成基线为 364f43e8（#915），与 c420b028 的实际测量输入相同。采用方案 A，正式静态分段牌面沿用 4 ms 软预算。四维独立审查及最终 312 条离线样本见 docs/evidence/deck-cold-start-20261124/README.md。10/75 张首卡 P95 为 7/5→2/2 轮，冷开整页 7/5→9/7 轮，暖态整页两组均为 2 轮、零新增卡面。暖态 CPU P95 分别增加 1.082/0.715 ms。官方导入、首反馈 P95≤100 ms 及设备暖态不退化待验。源码、严格就绪和回放定向验证通过，保留 In Progress。开发短分支 perf/deck-cold-start，Fork A Quick 与 Fork B Full 按新流程自动执行。
<!-- SECTION:NOTES:END -->
