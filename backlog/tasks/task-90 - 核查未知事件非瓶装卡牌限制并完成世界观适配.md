---
id: TASK-90
title: 核查未知事件非瓶装卡牌限制并完成世界观适配
status: In Progress
assignee:
  - Furinya
created_date: '2026-10-30 21:58'
updated_date: '2026-11-15 17:18'
labels:
  - playtest-20261030
  - p2
  - gpt
dependencies: []
references:
  - docs/backlog-details/PLAYTEST-20261030.md
  - docs/backlog-details/MOBILE-QA-20261029.md
priority: low
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner在未知事件遇到「非瓶装卡牌」，玩家不了解原作遗物绑定机制，不能直接搬运不符合提瓦特语境的专属术语。需先确认本作是否真的存在等价的卡牌绑定/保护；不预判是 Bug 或必改玩法。关联现有 TASK-13.1.2，避免另造事件流程。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 说明本项目是否存在等价机制、该限制为何成立、原有事件是否可正常选择卡牌。
- [ ] #2 若机制成立则提供自然清晰且符合世界观的用户可见解释；若不存在则不保留无意义的原作限制。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 核对 develop c2409ad7 已有遗物绑定、移除保护与第一二幕文案，避免重复实现。2. 运行现有绑定与事件选择定向回归。3. 保存精确源码证据与测试边界，保留未验证的官方设备与第三幕范围。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-14第二轮逐项核对，保留To Do：仅有玩家疑问与调查目标，未找到针对非瓶装限制的调查结论、实施或验证记录。

本轮核查 develop c2409ad7：已有三类遗物永久 UID 绑定及移除保护；一二幕说明已是「遗物绑定牌除外」，并非本轮新增。正常生成后既有定向12/12与5处源码文本核验通过，保留初跑缺生成模块失败。证据 docs/evidence/task90-binding-20261115/README.md。保留 In Progress 与未勾AC，官方/手机自然遭遇及第三幕术语未验；未改玩法或Release。
<!-- SECTION:NOTES:END -->
