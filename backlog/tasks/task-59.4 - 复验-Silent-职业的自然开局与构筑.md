---
id: TASK-59.4
title: 复验 Silent 职业的自然开局与构筑
status: To Do
assignee:
  - Furinya
created_date: '2026-11-23 04:21'
labels: []
milestone: m-9
dependencies: []
references:
  - docs/CLASS_CARD_HANDOFF.md
parent_task_id: TASK-59
priority: medium
ordinal: 189000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
复用 #206/#238 已合并的实验职业与现有牌池、选角、遗物和运行时 Host。审计并补实证缺口，先从独立职业文件切片；改共享选角或奖励路径前与其他职业协调。卡图和跨版本正式开放另验。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 显式 full-source 从真实选角进入首战，起始牌组、初始遗物、毒、飞刀与弃牌和败退边界通过可重复测试。
- [ ] #2 校验 75 张基础/升级定义及真实奖励、商店、升级获得路径，只修已复现缺口，并记录同局第二幕剩余未验路径。
- [ ] #3 由正式候选白名单负控确认 Release/master 入口维持原范围；提供精确 PR/SHA 和后续正常游玩、设备验收交接。
<!-- AC:END -->
