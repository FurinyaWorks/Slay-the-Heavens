---
id: TASK-107
title: 分离返回主菜单、继续本局与放弃退出
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-14 10:12'
updated_date: '2026-11-15 12:37'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/TASK-107-menu-navigation.md
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/663'
  - docs/backlog-details/TASK-42-PC-CLOSEOUT-HANDOFF-20261115.md
priority: medium
type: enhancement
ordinal: 177000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户指定参照杀戮尖塔原版；复用V25菜单与状态管理，仅保留当前会话，不增加持久化存档。与TASK-4.16剩余设备验收及主菜单美术任务分离。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 地图、战斗及节点返回主菜单后可继续，原本局状态保持且暂停期间不推进
- [x] #2 放弃本局与开始新游戏覆盖进度均有明确确认，取消不丢失进度
- [ ] #3 主菜单退出游戏沿用平台结算且明确退出奇域不可恢复；保留V25美术
- [ ] #4 定向回归、独立复审及仓库准入通过，PR授权原生合并；设备验证缺口如实记录
- [ ] #5 本轮最新完整候选核对退出战局、返回主菜单、继续、新开及异常退出再进入无导航死路，取消保持本局，旧回调不恢复退休状态。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 从最新develop隔离实现，复用退出确认框和V25控件。2. 添加会话暂停/恢复、独立放弃及新游戏确认，保留平台退出结算。3. 真实Lua Host覆盖地图、战斗、节点、取消、旧触点和结算失败；相关检查与独立深审。4. 提交PR，核实精确SHA准入后授权原生合并并交接设备验证缺口。

5. Owner追加要求自主修复合并阻塞：从既有PR661提取固定ID改名与队列路由的最小已验证修复到本PR，解除整包依赖，定向验证及独立复审后立即授权原生队列。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
菜单代码已提交PR663，HEAD a0d3cd6cfe5e19f720837db2d39b1b69aa995bae/BASE9f2f44e4。最终15项菜单退出V25回归、相邻18项和工程门禁通过，独立/root/review_menu_navigation PASS；AC1/2按软件合同验收。merge:auto dry-run被既有仓库身份校验阻止：固定ID1429751262已改名Slay-the-Heavens，但develop只登记旧名。修复已由PR661@900527d9承接，未重复修改；PR663正文Depends-on #661。待661实际合入后同步基线、重新复审并授权。尚未授权或实际合并；官方导入/ready/PC手机与平台真实退出未验，AC3/4不勾。

Owner明确要求继续修复，不等待整包依赖。新HEAD ebe050dfd70caa9fc276aaa06c9a6bedbd77da0a自含7文件改名修复（与661逐字相同），PR663已解除依赖；77门禁、105选择器、76Full/交付合同全部通过。独立/root/review_menu_navigation绑定新HEAD/BASE9f2 PASS；正在原merge:auto准入握手。

PR663已实际完成原生auto-merge-requested握手并读回。HEAD ebe050dfd70caa9fc276aaa06c9a6bedbd77da0a/BASE9f2f44e4，无PR661依赖，独审PASS。稳定授权proof在.artifacts/menu-navigation-pr663/；GitHub自行执行Required/Full与队列，不再重复触发或守候。本轮手动ci:full导致一次不必要的新运行，Owner明确CI成本优先：能用Fast一律Fast，默认现有自动路由、不主动强制Full；偏好已补根AGENTS，后续不重复此做法。实际合并与设备AC3仍未完成。

紧急收口接续：原HEAD ebe050df Full失败后已paused，当前AC4回到待验，不把原自动授权当最新准入。prep最终18a2be42保留返回主菜单/继续/放弃及暂停状态，修复Continue位置重叠和真实Full阻塞；多轮独审、定向回归及当前352路径源认证通过，等待661实际合入后正常同步基线、将小差异前推原663并跑原Required/Queue。新GIL为受审组合预构建，官方容量/ready/退出及手机未验，未操作窗口。

继续原#663发版收口：#661已实际合入develop e65d9b98；prepared在完整保留已玩菜单/容量源码的基础上接入实际develop与已独审排序修复，当前aa206067。正常Full与独审、原生Merge Queue继续有效，未把队列授权当实际合并。

2026-11-15最终#663已前向推送dfd45d6ce3f466592700aea94d224b4c660be960，基线e65d9b98；首次HTTP408经读回确认未接收后，仅本次命令限定HTTP/1.1重试成功，无强推/改全局配置。完整61文件组合独审PASS，reviewId /root/review_final_capacity_bindings:pr663-final-e65-dfd45d6c-20261115，原source绑定缺口已修并保留全部历史及negative。当前9项菜单/picker/export、6项原生合同、工程和四合法变异均通过。旧117source定向首轮116pass/旧350断言失败，明确冻结release350/最终current352后原失败相关4项通过。托管最终Full/原生队列待原入口准入，不冒称合并。

原merge:auto授权握手成功且已读回：HEAD dfd45d6ce3f466592700aea94d224b4c660be960 / BASE e65d9b98fbec69442047650254238cd9244df805，Depends-on #661已真实满足，state=auto-merge-requested。证据.artifacts/release-closeout-20261114/auto-merge-663-final-dfd45d6c.json。Required Checks和原生队列Full由GitHub继续执行；未守候/轮询CI，不称实际已合并。收到具体失败或实际合并事件后按同入口接续，实际合入后必须verify:delivery --merged。

承接E2，已有局部修复不代替新候选完整验收。
<!-- SECTION:NOTES:END -->
