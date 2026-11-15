---
id: TASK-103.2
title: 地图事件与房间页V25原生视觉交互优化
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-10 11:46'
updated_date: '2026-11-15 12:37'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/TASK-42-PC-CLOSEOUT-HANDOFF-20261115.md
parent_task_id: TASK-103
priority: medium
ordinal: 169000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner明确追加授权接续地图优化，打磨两幕剧情事件及商店营地宝箱等房间页。复用已实现业务和#582生命周期，继承#603地图，不干扰#588战斗页；不新增规则或改变RNG/数值。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 真实事件和房间的视觉层次、选项状态、长文与多分支符合V25风格，逐屏实际截图自检。
- [x] #2 既有事件选择、费用奖励、卡牌选择、返回地图与同局状态回归通过。
- [x] #3 可交互Web Simulator入口及同源SDK连续操作/资源释放证据可复现；官方设备未测明确说明。
- [x] #4 独立PR和证据交付，不擅自合并或发布。
- [ ] #5 本轮商店所有商品及悬停不压盖；删牌/锻造/牌组复用共享浏览器和全局按钮，数量变化、末页、长文与层级无溢出，滚动/分页按既有用途及实际性能选择。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1.核查现有完整事件及#588范围，继承#603独立树。2.沿用V25左右叙事与四选项结构，先做真实剧情事件视觉身份、长文与禁用说明，再覆盖商店营地宝箱和选牌房间已有面。3.复用SDK/GameUI保存与浏览器Pixi真实渲染，逐屏查看并进行选择/返回/20次连续操作释放。4.保持规则与RNG，既有事件/房间回归、独审、独立PR和可交互入口，官方设备未测列明。

2026-11-15 PC截图9商店第二排卡牌被萝卜遗物压盖：shop_pc_slice在独立feat/pc-shop-closeout-1115核实际布局并补矩形相交回归，仅scripts/v25-node-layout.mjs及对应测试；保留价格/规则/控件功能，与图标a27449ec成果分离。

7cb组合真实根因细化：official商店卡牌列被shelfColumns重排而物品列未同步，修复仅ui_theme.json既有merchant物品坐标及真实组合布局回归；不造新组件、不减控件/商品。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
已完成V25事件原生图章、四选项与完整药水说明、Neow尺寸和气泡、商店排布；真实SDK发现并修Match非法属性。最终source save afee98a1405542adcacd82906b5e02808623671425b526375f9d2d176097fffd，35场景、20次事务、120增量、控件17310稳定且释放0；9张最终图经主代理与独审逐张查看。证据 docs/evidence/event-v25-20261110/。官方GIL副本已编码读回静态通过，verify:ui缺同候选startup证据，官方设备未测不判通过。

最终可交互紧凑预览 http://127.0.0.1:4186/editor/play#event-v25-final 已真实浏览器指针验证：120→85治疗、设计师四项、七入口、页面错误0；测试导航重置场景，预览地图只读。完整GameUI同局证据另用SDK。

独立Draft PR #605 https://github.com/FurinyaWorks/Slay-the-Abyss/pull/605 已建立，继承#603/#582以develop为基线触发Required CI；没有自动合并或发布。独审10文件及9图无新增P1/P2。实现及证据已交付，任务保持In Progress等待Full CI及官方验收；本地全量未完成，不宣称Full通过。

Owner要求集中减负：2026-11-10旧PR/分支入口已关闭或清理，唯一剩余组合入口#607，CI减负入口#606。完整来源、精确SHA和恢复方法见docs/backlog-details/INTEGRATION-CLOSEOUT-20261110.json；10份M7独立切片只是保全待接续，未进入主线，UI组合也未验收。沿集中入口处理，不为同一来源再开平行PR；当前未勾AC和状态保持。

集中接续#607已吸收最新事件来源d218f27b相对4eed增量：房间身份层、页面内容与既有实测记录完整保留，组合验证另做，不沿用原分支绿灯。

整片独立复审纠正：最新d218 revision-2已撤回上一版视觉结论，AC1仍未完成；取消旧勾选，保留In Progress和原实测证据。源码组合通过不替代视觉/官方设备验收。

2026-11-14 Owner截图追加纠偏：独立切片 feat/treasure-readable 处理官方房间背景移除、宝箱遗物关联关键词和诅咒解释、长文截断及提示文字对比度；不覆盖既有PR646或其他工作树。本轮先离线验证，官方设备未测。

2026-11-14 宝箱截图纠偏已实现于独立 feat/treasure-readable：房间纯色/自绘宝箱、关联混乱与诅咒牌面、完整两行和高对比页脚。默认与official构建、定向回归、语法/架构/daily预算通过；独审发现的行高风险已修正。证据 docs/evidence/treasure-readable-20261114/。Full与官方/手机未验，AC1及In Progress保持。

本轮本地提交858f2f34，工作树干净。自动审批拒绝向origin FurinyaWorks/Slay-the-Abyss 推送：未确认该目的地源码外发授权；未推送、未开PR、未合并。等待Owner明确远程推送授权，离线成果完整保留。

Owner已明确批准推送及自动合并。本轮PR652已创建，HEAD858f2f34193724b012b64b372160891540f1974d / BASEe805a87dc4df1a048ba5995931d98a4e4899b5e9 经独立复核，merge:auto读回auto-merge-requested。授权证明 .worktrees/treasure-readable/build/delivery/auto-merge-652-858f2f341937.json；ci:full，原完整CI/原生队列及合后验证仍待，不宣称已合并。

PR652许可证门禁发现两张PIL诊断图漏登记，已补docs/legal/assets.json并暂停/撤销旧授权后重审。新HEADa98a4d8389f4776753da5fb2f21245c13f12f9b3许可证CI成功；新精确独审通过，merge:auto再次读回auto-merge-requested。当前证明 .worktrees/treasure-readable/build/delivery/auto-merge-652-a98a4d8389f4.json；Full/队列/合后验证继续待GitHub，不称已合并。

本轮商店33055cf4已被独立battle agent复审PASS并整合9801fc10。真实default/official生成树验证全部商品、价格、hit与卡片hover不交叠；旧图9 card7与relic1重叠29，物品列等距右移50后净距21，最右物品与删牌留25。未改商品尺寸/价格/RNG、未新增控件。PC当前候选待验，AC1仍未完成。

承接D1/D3/E6。商品列+50已在9b/be41，离线净距通过，设备待验；共享分页与事件/营地/奖励按钮风格尚未全部统一，不能新造列表。
<!-- SECTION:NOTES:END -->
