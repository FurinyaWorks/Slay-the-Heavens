---
id: TASK-115.7.1
title: 解析 STS1 两幕真实战斗并登记场景参数
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-25 21:01'
updated_date: '2026-11-25 21:19'
labels:
  - v2.2.0
milestone: m-8
dependencies: []
references:
  - 'https://www.megacrit.com/press-kits/slay-the-spire/'
  - 'https://www.brucebrenneise.com/game-concepts'
  - >-
    https://images.squarespace-cdn.com/content/v1/5b76af6eb10598ab8a9f2588/1535205202521-YJVU8OK3QV41F5246Q33/STSLev2-BruceBrenneise
  - 'https://www.indiedb.com/games/slay-the-spire/presskit'
  - >-
    https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/tree/46ca4a02d658b1ee1435441cb0f1eb19479e52c6/docs/design/reference-assets/v2.2.0/battle-scene
documentation:
  - docs/versions/V2.2.0-RELEASE.md
  - docs/design/reference-assets/v2.2.0/battle-scene/REFERENCE.md
parent_task_id: TASK-115.7
priority: medium
type: spike
ordinal: 215000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：需要原版第一、二幕实机截图和对应背景素材，已有源码研究可复用。

任务：实际读图并标注透视、层级、地面、脚底锚点、比例、敌人间距、接地、光色和 UI。

边界：参照素材供分析；正式素材采用项目授权资产与原创构图细节。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 交付两幕截图及原画对照、来源和可实现参数；每项设计标明适用版本、有效稿和被替代稿
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
已派发独立视觉研究，取得两幕参照原图和战斗截图，场景参数与对照待独立评审。

独立复核了两幕场景与九份素材身份、14 组色彩采样及源坐标。正式 v3 当前只有静态 v25BattleScene。研究和视口数据供后续两幕独立接入与整体验收。
<!-- SECTION:NOTES:END -->
