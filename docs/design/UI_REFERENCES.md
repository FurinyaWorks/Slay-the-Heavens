# UI 设计参考

<!-- 由 docs/design/ui-references.json 生成。运行 node scripts/render-ui-reference-table.mjs。 -->

从此表选择目标版本、代码组件和视觉状态。可点击图片打开原件。批准只涉及列出的设计范围，实施及官方设备验收见各任务和 UI 验收证据。

| 目标版本 | 代码组件 · 视觉状态 | 设计修订 | 参考 | 设计状态 | Backlog | 取代修订 | 范围 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| v2.0.0 | [scripts/v25-menu-layout.mjs](../../scripts/v25-menu-layout.mjs) · `menuPanel` | 2026-11-19 | [打开图片](reference-assets/v2.0.0/main-menu-approved-20261119.png) · [来源](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e99ed583fa5a80ae422d13eabb9486fc316872a4/docs/design/reference-assets/v2.0.0/main-menu-approved-20261119.png) | APPROVED | TASK-103.5 | 2026-11-14、reference-ui-lab、ui-canvas | Owner 定稿，含背景、双语标题、两枚斜切按钮及高亮。原生还原。 |
| v2.0.0 | [scripts/v25-menu-layout.mjs](../../scripts/v25-menu-layout.mjs) · `menuPanel` | 2026-11-14 | [打开图片](../evidence/menu-red-quality-20261114/menu.png) · [来源](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/96219b31/docs/evidence/menu-red-quality-20261114/menu.png) | SUPERSEDED | TASK-103.5 | — | 原生背景历史证据。 |
| v2.0.0 | [scripts/v25-menu-layout.mjs](../../scripts/v25-menu-layout.mjs) · `menuPanel` | reference-ui-lab | [打开参考](reference-ui-lab/menus.js) | SUPERSEDED | TASK-103.5 | — | 早期主菜单原型。 |
| v2.0.0 | [scripts/v25-menu-layout.mjs](../../scripts/v25-menu-layout.mjs) · `menuPanel` | ui-canvas | [打开参考](ui-canvas/MenuState.dc.html) | SUPERSEDED | TASK-103.5 | — | 早期菜单状态规范。 |
| v2.0.0 | [scripts/character-selection-composition.mjs](../../scripts/character-selection-composition.mjs) · `details` | 2026-11-19 | [打开参考](../evidence/sts-character-reference-20261113/REFERENCE.md) · [来源](https://interfaceingame.com/screenshots/slay-the-spire-choose-your-character/) | APPROVED | TASK-103.3 | reference-ui-lab | 批准的是原作左侧信息构成及局部半透明板。外部链接保存原图，生产资产沿用原生 UI。 |
| v2.0.0 | [scripts/character-selection-composition.mjs](../../scripts/character-selection-composition.mjs) · `details` | reference-ui-lab | [打开参考](reference-ui-lab/character-reference.js) | SUPERSEDED | TASK-103.3 | — | 旧选角原型。 |
| v2.0.0 | [scripts/character-selection-composition.mjs](../../scripts/character-selection-composition.mjs) · `characterPanel` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-103.3 | — | [当前选角布局投影](../evidence/v2-ui-20261119/runtime-character.png)。官方整屏画面待取证。 |
| v2.0.0 | [scripts/exit-ui-layout.mjs](../../scripts/exit-ui-layout.mjs) · `runMenu` | 2026-11-19 | [打开图片](../evidence/sts-character-reference-20261113/visual-integrated/character-selected-idle.png) | APPROVED | TASK-107 | reference-ui-lab | 沿用截图左下红旗的轮廓、材质与四态。[局内退出布局投影](../evidence/v2-ui-20261119/runtime-run-menu.png)展示单一操作，返回主菜单时保留会话。 |
| v2.0.0 | [scripts/exit-ui-layout.mjs](../../scripts/exit-ui-layout.mjs) · `runMenu` | reference-ui-lab | [打开参考](reference-ui-lab/ingame-menu.js) | SUPERSEDED | TASK-4.16 | — | 旧多选项菜单原型。 |
| v2.0.0 | [scripts/exit-ui-layout.mjs](../../scripts/exit-ui-layout.mjs) · `exitPanel` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-107 | — | 沿用平台结算及独立丢弃本局确认。 |
| v2.0.0 | [src/lua/abyss_prologue.lua](../../src/lua/abyss_prologue.lua) · `transition` | readiness-audio | [打开图片](../evidence/liyue-transition/readiness-audio/transition.gif) · [来源](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/fceaf2c6f01af969bbde8285cbd50038f87c6f71/docs/evidence/liyue-transition/readiness-audio/transition.gif) | APPROVED | TASK-108 | — | 统一视觉体系，保留真实准备驱动、输入隔离及必要的章节时序。 |
| v2.0.0 | [src/lua/abyss_prologue.lua](../../src/lua/abyss_prologue.lua) · `element7` | readiness-audio | [打开图片](../evidence/liyue-transition/readiness-audio/element7.png) · [来源](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/fceaf2c6f01af969bbde8285cbd50038f87c6f71/docs/evidence/liyue-transition/readiness-audio/element7.png) | APPROVED | TASK-108 | — | 最终视觉状态。 |
| v2.0.0 | [src/lua/abyss_page_reveal.lua](../../src/lua/abyss_page_reveal.lua) · `pageReveal` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-103.6 | — | 复用就绪驱动。待补普通页面同候选转场取证。 |
| v2.0.0 | [scripts/noncombat-neow-layout.mjs](../../scripts/noncombat-neow-layout.mjs) · `neowFigure` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-103.3 | 2026-11-10 | [当前祝福布局投影](../evidence/v2-ui-20261119/runtime-neow.png)。官方画面待取证。 |
| v2.0.0 | [scripts/noncombat-neow-layout.mjs](../../scripts/noncombat-neow-layout.mjs) · `neowFigure` | 2026-11-10 | [打开图片](../evidence/event-v25-20261110/neow-blessings.png) | SUPERSEDED | TASK-103.3 | — | 旧祝福页画面。 |
| v2.0.0 | [scripts/v25-map-layout.mjs](../../scripts/v25-map-layout.mjs) · `mapPanel` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-4.13 | 2026-11-10 | [当前地图布局投影](../evidence/v2-ui-20261119/runtime-map.png)展示共用栏和路线，官方图标待取证。 |
| v2.0.0 | [scripts/v25-map-layout.mjs](../../scripts/v25-map-layout.mjs) · `mapPanel` | 2026-11-10 | [打开图片](../evidence/map-v25-20261110/map.png) | SUPERSEDED | TASK-4.13 | — | 旧地图画面。 |
| v2.0.0 | [scripts/v25-map-layout.mjs](../../scripts/v25-map-layout.mjs) · `boss` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-4.13 | 2026-11-10 | [当前首领区布局投影](../evidence/v2-ui-20261119/runtime-map-boss.png)使用同一局地图滚动取证，官方首领图标待取证。 |
| v2.0.0 | [scripts/v25-map-layout.mjs](../../scripts/v25-map-layout.mjs) · `boss` | 2026-11-10 | [打开图片](../evidence/map-v25-20261110/map-boss.png) | SUPERSEDED | TASK-4.13 | — | 旧首领地图画面。 |
| v2.0.0 | [scripts/v25-map-layout.mjs](../../scripts/v25-map-layout.mjs) · `mapPanel` | missing-icon | [打开图片](../evidence/map-v25-20261110/raw/rejected-missing-icon.png) | REJECTED | TASK-4.13 | — | 历史负例，节点图标缺失。 |
| v2.0.0 | [scripts/official-battle-hud.mjs](../../scripts/official-battle-hud.mjs) · `battle` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-4.23 | — | 保留共用栏和现行 HUD，待同候选核对。 |
| v2.0.0 | [scripts/deck-ui-layout.mjs](../../scripts/deck-ui-layout.mjs) · `deckPanel` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-25.4 | — | 美术冻结。需覆盖永久卡组、抽/弃/消耗牌堆及详情。 |
| v2.0.0 | [scripts/relic-view-layout.mjs](../../scripts/relic-view-layout.mjs) · `relicPanel` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-103 | — | 保留现行美术，待补悬停及详情。 |
| v2.0.0 | [scripts/potion-discard-layout.mjs](../../scripts/potion-discard-layout.mjs) · `potionPanel` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-4.15 | — | 核对说明、目标、取消未消耗和丢弃。 |
| v2.0.0 | [scripts/sts-reward-row-layout.mjs](../../scripts/sts-reward-row-layout.mjs) · `rewardList` | develop | 待补 | NEEDS_REF | TASK-103.2 | — | 待对照参考并在当前候选取证。 |
| v2.0.0 | [scripts/v25-node-layout.mjs](../../scripts/v25-node-layout.mjs) · `shopView` | develop | 待补 | NEEDS_REF | TASK-103.7 | — | 优先核对货架、地图返回和删牌浏览。 |
| v2.0.0 | [scripts/v25-node-layout.mjs](../../scripts/v25-node-layout.mjs) · `campView` | develop | 待补 | NEEDS_REF | TASK-103.2 | — | 核对休息和锻造。 |
| v2.0.0 | [scripts/v25-node-layout.mjs](../../scripts/v25-node-layout.mjs) · `eventView` | develop | 待补 | NEEDS_REF | TASK-103.2 | — | 核对选项、结果及说明。 |
| v2.0.0 | [src/lua/abyss_game_ui_menu_view.lua](../../src/lua/abyss_game_ui_menu_view.lua) · `result` | develop | 待补 | CURRENT_IMPLEMENTATION | TASK-103 | — | 以现行结算视觉为准，待按胜负分支取证。 |
