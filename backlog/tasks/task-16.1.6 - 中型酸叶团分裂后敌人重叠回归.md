---
id: TASK-16.1.6
title: 中型酸叶团分裂后敌人重叠回归
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-15 20:14'
updated_date: '2026-11-23 04:22'
labels:
  - 待验
  - delivery-verify
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PC-QA-20261115.md
  - TASK-15.15
  - TASK-103.7
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-verbatim.txt
parent_task_id: TASK-16.1
priority: medium
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-11-15 PC真实反馈：中型酸叶团分裂后两个实体视觉位置完全重叠（43:55–44:20），属于影响战斗可辨识与选目标的严重Bug。历史已完成的分裂规则不自动等于本候选Actor布局正确。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 按真实分裂触发生成两个可分别辨识的敌人实体；视觉位置/生命值/意图/点击命中区对应各自实体，无重叠和不可选目标。
- [ ] #2 同场已有敌人时、第一/最后一列、不同可用宽度及反复遭遇下布局稳定，无遮挡重要战斗HUD。
- [ ] #3 核心分裂数量、HP、RNG/行动顺序和死亡奖励规则不改；用真实Lua/Host复现并保留旧错误RED和新行为GREEN。
- [ ] #4 复核 #672 的 slime-split-positions 回归与实际正式GIL布局；同候选PC和相关手机实测未完成前不得标记Done。
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
#672 当前包含 slime-split-positions 源码与回归，尚未合并；状态 In Progress/待复验，严重度P0。不能重新发明分裂机制或复工TASK-15.15已完成业务逻辑。

2026-11-23：#809 merge aae948788d93012d11fe5b6da3281150bb9957c6 已有分裂显示修复及自动回归。接同候选 PC/手机布局、命中区域及 HUD 复验，原 AC 保留。
<!-- SECTION:NOTES:END -->
