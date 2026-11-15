---
id: TASK-38.4
title: 修复手机药水弹窗误打手牌与选牌页无效点击
status: To Do
assignee:
  - Furinya
created_date: '2026-11-15 19:11'
updated_date: '2026-11-15 19:11'
labels:
  - mobile
  - playtest-20261115
  - p0
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/MOBILE-QA-20261115.md
  - TASK-14.1
  - TASK-30
parent_task_id: TASK-38
priority: medium
type: bug
ordinal: 175000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
药水点击“使用”触发下层牌、换瓶仍难用；选牌页点顶栏药水黑闪而无反馈，三槽触控偏小。检查模态焦点、指针owner与热区，不猜成纯布局问题。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 在战斗用药时，使用/丢弃/取消只能对该药水执行且恰好一次，2/5/10手牌与不同药水均不误打下方牌。
- [ ] #2 选牌模态中顶栏药水要么遵守已确认可用交互，要么正确拦截并提示；无效点击不能黑闪、全屏加载或旧触点穿透。
- [ ] #3 同坐标变换实际触控框可点中，保留原生药水二次确认与效果，记录Red/Green事件轨迹、独立评审及同候选手机实测。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
先查最新develop、开放PR与现有实现，在真实状态/事件层复现问题并保存RED；仅对证实的根因做最小修复，提供GREEN/负控、独立复审与候选交付。没有同候选实体手机证据时AC保留未勾，遵守独立worktree、Backlog认领、CI与用户发版边界。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
依据2026-11-15用户两轮真机录音。P0/P1是体验严重度，非突破High队列上限的授权。逐字时间和截图映射见docs/backlog-details/MOBILE-QA-20261115.md。本PR仅登记任务，不代表Bug已修、代码或手机已验。
<!-- SECTION:NOTES:END -->
