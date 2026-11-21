---
id: TASK-103.7
title: PC商店商品压盖及删牌浏览布局专项
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-15 20:14'
updated_date: '2026-11-21 09:27'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PC-QA-20261115.md
  - TASK-103.2
  - TASK-4.15
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-verbatim.txt
parent_task_id: TASK-103
priority: medium
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-11-15 PC截图08/09：商店物品（尤其萝卜遗物）覆盖卡牌，商品/卡牌、价格及无法购买状态布局互相挤压；移除卡牌服务与其他选牌页使用不同分页样式（46:08–48:28）。只处理共享布局/组件和选择流程，不改商店价格/随机池。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 在5卡、遗物、药水、删牌、售价/不足金币等完整商品布局中，卡面、物品icon、价格、交互命中区及提示互不压盖且Z序正确；截图08缺陷有RED→GREEN回归。
- [ ] #2 固定原版卡牌选择语义与项目正式浏览器；商店删牌、营地升级、战斗看牌组的分页/滚动以现有可复用的正式方案为准，不能另造第三套、不靠盲猜滚动成本。
- [ ] #3 连续购买、移除、分页、返回、取消和再次进入页面不出现未销毁旧控件、幽灵商品/重复结算；商品图标身份与 TASK-4.15 / #672 交叉验收。
- [ ] #4 在PC目标尺寸、常见宽高比、手机受影响布局进行真实来源与像素检查；保留较长中文卡面、优惠与不同库存数量压力。
- [ ] #5 逐项审查 #672 的 shop-shelf-clearance 及图标修复，不能把未合并或软件生成截图冒充正式候选实机通过。
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
#672 开放 PR 声明修复商品压盖，包含 shop-shelf-clearance 测试。代码正在实施但仍无相同正式候选设备验收；保持 In Progress、AC 全部未勾。严重度P0/P1，不能靠静态截图断言触控命中区正确。

2026-11-21 营地锻造切片按本轮授权接入 release/v2.0.0。以卡组原生滚动控件的五列布局复用现有卡面，独立覆盖选牌、取消、确认与营地结果。离线夹具测 12 张、少量居中、跨卡回收与拖动误选；全任务继续待正式 CI 和同一候选 PC/手机验收。
<!-- SECTION:NOTES:END -->
