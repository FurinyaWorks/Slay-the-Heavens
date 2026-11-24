---
id: TASK-38.4
title: 修复手机药水触控，避免误出牌和无效闪屏
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-15 19:11'
updated_date: '2026-11-24 05:26'
labels:
  - mobile
  - playtest-20261115
  - p0
  - v2.0.0
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
### 情况

点药水「使用」时可能打出下方手牌。换瓶仍难用。选牌页点顶栏药水会闪屏，三个药水槽也偏难点。

### 任务

核实弹窗的触点归属、拦截和按钮热区，让药水操作只作用于当前药水。

### 边界

保留二次确认和现有药水效果，按实际触控轨迹定位；继续使用原任务的验收条件。

### 验收

用不同药水和 2、5、10 张手牌复验使用、丢弃和取消，同时检查选牌叠层、热区和快速交叉点按。 使用同一候选完成原任务列出的回归、独立评审和手机验收。
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

2026-11-24 Owner 明确授权 release P0 全局HUD/遗物分页/药水显隐修复及PR-only管理员紧急合并。BASE c4eec5f9；独立 hotfix/run-hud-inventory-v2；实施计划 docs/superpowers/plans/2026-11-24-run-hud-inventory.md。源码与离线Host回归不替代同候选实机；原AC保持待验。

2026-11-24 Release 定向布局热修的声明与离线证据见 docs/evidence/release-layout-20261124/README.md。同候选 iPhone/PC 官方验收继续保持待验。develop 回流沿独立短分支先核对 #926～#930 所依赖的共享 HUD、地图预览和遗物分页在最新 develop 的对应实现，再以这四项几何断言复验后单独提 PR。
<!-- SECTION:NOTES:END -->
