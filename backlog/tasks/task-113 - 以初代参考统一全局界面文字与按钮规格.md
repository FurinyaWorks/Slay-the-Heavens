---
id: TASK-113
title: 以初代参考统一全局界面文字与按钮规格
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-24T05:48:37Z'
updated_date: '2026-11-24T05:53:54Z'
labels: []
dependencies: []
references:
  - TASK-112
  - TASK-4.20
priority: medium
type: enhancement
ordinal: 188000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
手机端放弃本局的文字比例和按钮尺寸与其他界面不一致。现有局内操作按钮材质及移动可读性工作可直接复用。

## 任务
以初代《杀戮尖塔》源码及截图归一化比例，按控件语义分批收敛现有主题、生成器及运行时。

## 边界
仅面向 develop。保护当前 v2.0.0 发布、存档语义、交互和各设备触控体验。

## 验收
按切片记录源码、离线布局与容量、官方导入和设备实测。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 确认弹窗共用标题、正文和按钮规格，保存及结算动作有回归覆盖。
- [ ] #2 所有运行页面按语义审计并迁移，设计规范和自动回归跟随每批合入。
- [ ] #3 记录同条件 GIL、控件、样式及可获得的性能数据和前后截图。
- [ ] #4 独立完成三项复审，并分别在官方 PC 16:9、iPhone 14 Pro 横屏验证同候选。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 从 364f43e8 的 Fork A refactor/ui-confirmation-spec 开始。先让现有确认面板从共享主题读取命中、字体和按钮状态，取消运行时横向压缩；用正式布局与 Host 回归测试。
2. 分别推进全局导航与分页、事件与奖励、战斗与提示、其余菜单和结算；避免并行修改现有选角 PR。
3. 按切片独审与 CI；使用固定输入记录离线测量，在有权限的官方客户端对同候选完成设备验证。
<!-- SECTION:PLAN:END -->
