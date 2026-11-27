---
id: TASK-115.10
title: 集成已开发的产品体验候选
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-25 21:02'
updated_date: '2026-11-26 05:11'
labels:
  - v2.2.0
  - release-scope
milestone: m-8
dependencies: []
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/909'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/932'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/933'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/924'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/958'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/964'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/965'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/992'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/989'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1022'
documentation:
  - docs/versions/V2.2.0-RELEASE.md
parent_task_id: TASK-115
priority: medium
type: task
ordinal: 222000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：已有音频、牌组、弹窗、选角、事件、商店、战斗详情等 PR。

任务：核对线上与 develop 实际差异，接续 #909、#932、#933、#924、#958、#964、#965。

边界：按文件重叠和产品依赖排序，复用已有实现。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 每个 PR 有合入或归档理由、固定来源和验证；已合更新通过相应定向验收，由 TASK-115.13 联合复验
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
#992 接续 #958，合入 develop 114a5c0b739ad8cccbc99e59fe7ba4112014d3cf。独立评审 6066095429，原生事件定向 1/1，Fork Quick 45716478689 通过。正文和长选项的实机字形、整合交互随正式候选验收。

#924 的现行源码候选 846c9eff35175585af3b1a8a24f7f303f8b4ef64 基于实际主仓 454b5897，获独立局部复审。三个产品文件与旧候选 6b52326d 完全一致。选角构建、主菜单启动、暂停重开和失败路径使用原 30/60 秒限制复跑。三处现行回放入口拒绝旧源码及重读时回退，真实历史入口和隔离复制仍按原规则执行。候选留在本地，完整 CI、主仓接续与设备验证待验。

#924 已用非强推方式接续原 PR，现行 HEAD a014d5cb3ae25d9abec351e119d6fa9a3fcf89da 保留原头为第二父提交。精确 Fork A Advisory Quick 45735276841 和独立评审 6067321833 通过，覆盖现行设计来源、原定向回归与实际 454b 基线。#933 与 #964 的组合脚本需联动封存复制和夹具清单，触发自动审核拒绝。保留原独审切片各自排队，在实际父树重新验证。完整 CI 与设备待验。

#965 由 #981 合入，合入时 19 个文件与局部原审逐字节一致。#984 接续后至 #1006 保留 18 个，#1007 后为 15 个，战斗坐标沿统一入口。正式联调继续验详情写入、出牌、触屏和目标选择。#924 原公开头 a014d5cb 仍开放，原审对应 454b5897，实际接续需保留 #1005 隐藏详情面及后续原封存测试。#933 独立源 03699495 保留原生 6/6 和旧 Selection 10/10，原全量和当前计时待验。

2026-11-26 必要切片为 #964 及 #924 的未继承差异。#989 只在低成本时合入。#932、#933、#909 的原引用继续保留，延期登记见 TASK-115.12。

选角接续 #1022 已合入 f9513b58a0d2ef836178001773eabbbc3459777a。新增 Git 历史仅本版 21 个文字文件，与原 #924 已验源码树一致。原非战斗12/12和封存6/6、10/10，同一候选的实际 Simulator、PC和实体手机待验。
<!-- SECTION:NOTES:END -->
