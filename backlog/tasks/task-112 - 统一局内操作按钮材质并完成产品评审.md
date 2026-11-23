---
id: TASK-112
title: 统一局内操作按钮材质并完成产品评审
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-22T05:43:10Z'
updated_date: '2026-11-23 04:32'
labels: []
dependencies: []
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/869'
priority: medium
type: enhancement
ordinal: 187000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
地图返回战斗和返回战利品的外观、尺寸、位置不一致，奖励和房间按钮各自维护部分材质。

## 任务
以正式布局审计全局按钮并将通用文字操作收归现有原生圆角组件。参照初代《杀戮尖塔》的位置、比例与层级。

## 边界
开发目标为 develop，独立于本次发版。维持各场景的动作、手柄焦点和触控所有权。

## 验收
对照产品评审及正式布局与输入回归。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 地图返回战斗和返回战利品使用统一左下锚点、尺寸和四态，保留各自文案及返回行为。
- [x] #2 战斗及奖励、商店和房间、菜单与弹窗的文字操作统一使用共享按钮，审核特种输入和外观。
- [ ] #3 正式布局、奖励、地图指针/触屏/手柄回归通过，向 Owner 交付产品评审。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
从最新 develop 在 Fork A 做单一切片。枚举正式生成控件，归并文字操作圆角与状态色，保持命令绑定、参考布局和已批准的图标及内容热区。离线核对地图、领奖、选牌、房间、弹窗和手柄路径，提交产品评审。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
develop 基线 d7ae494a。正式精修布局构建通过，12 项 UI 定向通过，独立评审复验了地图两返回、宝箱奖励和首领战败后重开。产品评审及改前改后地图位置对照见 docs/reviews/TASK-112-ACTION-BUTTONS.md。源码与官方设备验收分别记录。

2026-11-23：#869 已合 develop beba19bad25db7de71f96af521656c13b882909b，全局操作按钮与地图返回位置已有交付；沿原任务收口设备和界面验收。
<!-- SECTION:NOTES:END -->
