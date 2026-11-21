---
id: TASK-90
title: 核查未知事件非瓶装卡牌限制并完成世界观适配
status: Done
assignee:
  - '@Furinya'
created_date: '2026-10-30 21:58'
updated_date: '2026-11-15 22:06'
labels:
  - playtest-20261030
  - p2
  - gpt
dependencies: []
references:
  - docs/backlog-details/PLAYTEST-20261030.md
  - docs/backlog-details/MOBILE-QA-20261029.md
  - docs/backlog-details/TASK-90-EVIDENCE-INTEGRATION-20261115.md
  - docs/backlog-details/TASK-90-RECONCILE-20261114.md
priority: low
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner在未知事件遇到「非瓶装卡牌」，玩家不了解原作遗物绑定机制，不能直接搬运不符合提瓦特语境的专属术语。需先确认本作是否真的存在等价的卡牌绑定/保护；不预判是 Bug 或必改玩法。关联现有 TASK-13.1.2，避免另造事件流程。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 说明本项目是否存在等价机制、该限制为何成立、原有事件是否可正常选择卡牌。
- [x] #2 若机制成立则提供自然清晰且符合世界观的用户可见解释；若不存在则不保留无意义的原作限制。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 在 c2409ad7 独立树接续既有5份证据，保留历史来源。2. 用现有定向回归核对UID绑定、升级、复制、移除与中文显示，不改源码或测试。3. 按本轮客观结果核对两项AC并同步状态，本地提交交主控独审。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-14第二轮逐项核对，保留To Do：仅有玩家疑问与调查目标，未找到针对非瓶装限制的调查结论、实施或验证记录。

2026-11-15 本轮为已完成成果的状态/证据集成，根树TASK-90已Done，不重复领取。远端To Do缺既有附件；仅独立树暂置进行中待新证据核验，原描述与创建身份保留。历史单次禁止PR仅作来源；本片授权限本地提交，设计批准边界照常。

2026-11-15 状态纠偏：既有#436已合机制/中文说明，本轮现有Node定向回归8/8、起手10组、移除7组及原样显示/合法UID选择闭环均通过，两项AC有新证据，恢复Done。此前未找到记录的笔记仅作历史；技术细节与证据边界见本轮附件。
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
已接续5份既有证据并复核UID绑定、升级保留、复制新UID不继承、移除提交及中文解释，两项AC满足。仅本地集成供独审；官方候选、ready与设备未验证。详见TASK-90-EVIDENCE-INTEGRATION-20261115.md。
<!-- SECTION:FINAL_SUMMARY:END -->
