---
id: TASK-38.6
title: 修复手机商店遗物说明，让点空白可以关闭
status: In Progress
assignee:
  - Furinya
created_date: 2026-11-15 19:11
updated_date: '2026-11-19T06:45:00Z'
labels:
  - mobile
  - playtest-20261115
  - p1
  - v2.0.0
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/MOBILE-QA-20261115.md
  - TASK-4.10
parent_task_id: TASK-38
priority: medium
type: bug
ordinal: 177000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
### 情况

点开商店遗物说明后，点空白仍挡住商品。IMG_1404 可对照布局，实际点按现象来自录音。

### 任务

核对 #672 与 #680 的现有处理，接回仍缺的说明关闭行为。

### 边界

空白触点只关闭最上层。保留购买、离店和相邻 PC、手柄行为。

### 验收

点开说明再点空白，确认旧说明和触点都清理干净，之后可正常查看、购买和离店。 使用同一候选完成原任务列出的回归、独立评审和手机验收。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 同页点遗物→关闭/点空白→再选其他物品、购和离店均正常，旧说明与旧焦点彻底回收。
- [ ] #2 点击空白只关闭顶层，绝不穿透到购买或出牌；手机点击、PC鼠标、手柄的相邻回归保留。
- [ ] #3 检查#672是否已覆盖，已覆盖则只补回归不重造；保存RED→GREEN、独立审查与同候选手机验收。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
先查最新develop、开放PR与现有实现，在真实状态/事件层复现问题并保存RED；仅对证实的根因做最小修复，提供GREEN/负控、独立复审与候选交付。没有同候选实体手机证据时AC保留未勾，遵守独立worktree、Backlog认领、CI与用户发版边界。

2026-11-19 develop接续：在62328bdac7703c3ab241e0ddb19e0fa05474f76a独立树仅迁回#680原41334b11的M05说明关闭/触点隔离；保留Furinya负责人，dot负责本切片收口。先用原shop-dismiss用例复现RED，再最小迁移三生产文件，跑原12组默认/official与商店相邻回归、独审，任务分支保全；不触碰#741历史来源接续、购买/PC布局、GUI/Full，未验手机AC不勾。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
依据2026-11-15用户两轮真机录音。P0/P1是体验严重度，非突破High队列上限的授权。逐字时间和截图映射见docs/backlog-details/MOBILE-QA-20261115.md。本PR仅登记任务，不代表Bug已修、代码或手机已验。

已核主仓仅#741/#738开放，两Fork无开放PR，无shop同线远端分支；#680已合旧Release但develop仍缺该切片，此为既有成果迁移，不重新设计或声明已验收。目标develop，分支fix/develop-mobile-shop-dismiss-20261119；独立验证node --test tests/shop-dismiss.test.mjs。

2026-11-19 M05 develop迁移：62328bda原用例0/2 RED；仅迁入#680原41334b11的81行/3生产文件后，默认商店/布局14/14、official-assets原2/2（均含原12组触控）、默认相邻3个Lua入口通过。保留原测试，源码/架构/Luacheck/Backlog/guidance通过。独立配对校准：精确develop73/73，本迁移42/73；31项由新增JS/Lua库存及原生产绑定拒绝，未改冻存包/历史桥。等待现有source接续owner在真实组合做精确前向绑定，当前不可提PR/合并，不是设备验收完成。官方配置下2个旧自制mock缺GetChildren，基线同样失败；真实生成Host的M05用例通过。源码、官方导入/ready、手机仍分层；本轮未Full/GUI/发版。

收口保全：源码固定提交 b11f1db674589988cca349c2b05c1f894c38e8cf（base 62328bdac7703c3ab241e0ddb19e0fa05474f76a，已审 tree fbc447a6e18759cbd65b50c6fa8f37ded8c91538）已在 fix/develop-mobile-shop-dismiss-20261119 远端回读；独立不同会话完成产品/测试 PASS_OFFLINE，并对远端同树再核验。审查及原始日志见 docs/evidence/develop-mobile-shop-20261119/independent-review.json 和 independent-review-logs.tar.gz。当前 outcome=BLOCKED，PR=none，successor=待协调的现有 source 接续 owner，owner=Furinya（dot 协调本迁移），remote=retained。冻结库存不是普通再生成表；须在精确 develop 组合补前向 source/inventory/copy closure，保留旧归档、原断言与负控后再定向校准/独审。三项原验收仍未勾，无 Hosted CI、官方导入或手机完成声明。
<!-- SECTION:NOTES:END -->
