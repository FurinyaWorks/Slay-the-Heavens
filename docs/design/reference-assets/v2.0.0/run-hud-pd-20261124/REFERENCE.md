# v2.0.0 Run HUD — PD-01～PD-05 / 2026-11-24

状态 **APPROVED**，来源为本轮 Owner 明确产品决定。组件：共享资源栏、遗物栏/单详情、药水、房间/模态生命周期；取代 mobile-run-inventory-v2 的事件库存规则及所有 count:1/+N/多遗物列表入口。不是客户端验收凭证。

## 原版依据（来源分层）

- **官方发布说明**：[2018-07-05 Weekly Patch 32 / Relic Overflow Paging](https://store.steampowered.com/news/posts/?appids=646570&enddate=1533255390)。固定图标尺寸、左右箭头分页、PC 每页25件；不再随数量缩小。
- **原版画面**：[地图](https://interfaceingame.com/screenshots/slay-the-spire-map/)、[单遗物详情](https://interfaceingame.com/screenshots/slay-the-spire-burning-blood/)、[首领遗物选择](https://interfaceingame.com/screenshots/slay-the-spire-choose-a-relic/)、[战后奖励](https://interfaceingame.com/screenshots/slay-the-spire-rewards/)。均为第三方采集的 STS1 画面，非本项目截图。单详情的全屏暗幕在完整 HUD 之上。
- **局内卡组画面**：[PC v2.2](https://nguyenhuythanh.com/posts/slay-the-spire-is-so-good/)、[移动版评测](https://minireview.io/deck-building/slay-the-spire)。资源、空/满药水、遗物和右上入口仍保留。主菜单图鉴/设置截图不作局内证据。
- **二级规则资料**：[Potions](https://slaythespire.wiki.gg/wiki/Potions)、[We Meet Again!](https://slaythespire.wiki.gg/wiki/We_Meet_Again%21)。直连403，检索索引可读；战外使用 Blood Potion、Fruit Juice、Entropic Brew，自动药水另按自身规则。
- **辅助源码研究**：[项目既有固定原版研究镜像 319009d5](https://github.com/aeubanks/sts/tree/319009d5df0a82d9fb0f23cc22322286c6a87ec0)。不是官方开源发布，不复制实现/美术。TopPanel、AbstractDungeon、SettingsScreen、SingleRelicViewPopup、SingleCardViewPopup 交叉核对生命周期。We Meet Again 的 Wiki “that potion”文字含糊；AbstractPotion 及三种战外药水 canUse 实际均禁止该房间全瓶使用/丢弃。维持项目既有精确事件规则，允许显示与查看；持续至离开该事件楼层。Lab/Woman in Blue 不享有此限制。

## 正式产品决定

**PD-01 — Run 级共享信息。** 主菜单、选角隐藏；开局祝福、地图、普通/精英/首领战、普通事件、商人/商店、营地、宝箱、战后奖励、奖励选牌、首领遗物选择均显示生命、金币、全部容量药水槽、持有遗物、楼层、卡组。事件 result 留驻即使 phase 已变 map 也不隐藏库存。独立胜负结算隐藏普通 HUD。资源来自现有 Run/战斗玩家状态，不新建业务镜像。

| 特殊页面 | 原版核对 / 本项目输入合同 |
| --- | --- |
| 局内卡组浏览 | 完整 HUD 保留；卡组覆盖的底层房间停止接收输入。现有模态会阻止重复打开/消费物品，关闭恢复同页。 |
| 单卡牌/单遗物详情 | 完整 HUD 在全屏暗幕后；一次一个详情对象，阻断底层输入/迟到触点。关闭回原页面。 |
| 局内设置、退出确认 | HUD 保留在当前房间；设置/确认持有模态输入，关闭恢复。设置原版源码可核对；确认的客户端精确画面仍待同候选实测，不把主菜单设置图当证据。 |
| 特殊剧情/终幕 Proceed | 保留既有专属剧情呈现，独立终端画面隐藏普通 HUD。此特殊状态不扩大为普通事件规则。 |
| 地图本页、暂看地图 | 地图本页不提供无来源关闭；暂看地图有 Return/关闭并恢复原调用页及选牌状态；可从预览再看卡组/单遗物/设置并逐级返回。药水可查看、按Run权限使用非选敌药水和丢弃，选敌必须返回战斗。原版地图按钮仍存在；本项目沿用已有地图/返回控件，不新增集合入口或菜单嵌套。 |

**PD-02 — 横向持有顺序。** 顶部资源栏下方单独一行。0件无空槽，1/2/3/5件按持有顺序完整显示；每个图标固定大小、状态按遗物规则。禁止 +N、独立“持有遗物”入口、自动缩小。超容量以左右箭头分页。PC25，44单位步长；手机按1280有效舞台、安全边距40、箭头84热区及8间隔、遗物84热区/92步长计算11件：floor((1280−80−2×92−84)/92)+1。宽屏仍按统一舞台缩放。首尾不越界；获取/丢失后页码钳制，新Run重置。

**PD-03 — 单遗物详情复用。** PC悬停说明、点击定位；手机点具体图标进入对应详情。条带分页与详情上一件/下一件独立，关闭不改条带页。只复用一个 single 控件和固定条带池，无正式大型集合列表入口；历史基础组件未盲删。替换/丢失遗物后说明失效/刷新，计数与耗尽状态读权威状态。

**PD-04 — 药水显示与权限分离。** 所有正常局内页面画满实际容量的槽（含空槽），支持A11两槽、普通三槽、腰带五槽。occupied/view/use/discard/target分别由现有 Run.potionSlotView 与命令检查；战斗专用药水不能战外使用。We Meet Again 只按该事件既有规则限制操作，不能因普通事件隐藏。实验室/蓝衣女子和战后满槽领奖可先丢弃腾槽。切页/阶段变化不能让旧触点打开或消费新对象。

**PD-05 — 平台适配。** 保留 #926/#927 已正确的84单位手机热区（iPhone14 Pro 2556×1179/3，约45.85pt）、42×48瓶框、槽间8单位隔离和返回过渡。遗物行完整保留在资源栏下方；内容区应为这两层预留几何边界。详情按钮也需不低于44pt且不抢占相邻热区。PC不退化。

## 实现、验证与历史治理

- `abyss_run_hud.lua` 是唯一 Run HUD 显隐入口，页面生命周期/权威值写入/输入权限/手机布局分工独立。
- `official-battle-hud.mjs` 保证页内房间绘制在资源栏之前；`abyss_mobile_run_hud.lua` 预留两层几何。不是把遗物挪出问题区域或隐藏事件库存。
- `abyss_relic_view_ui.lua` 固定控件池、实际索引映射、独立条带页、单详情；`abyss_game_ui_input.lua` 校验药水阶段/房间触点。
- 回归 `tests/run-hud-inventory.test.mjs`、`tests/lua/support/run_hud_inventory.lua`、`mobile_run_hud_geometry.lua`：正式生成树、真实 Lua Host、原生API mock、坐标路由、连续页面/反复模态。当前投影见同版本证据记录；离线不等于官方客户端/真机。
- `mobile-run-inventory-v2` **SUPERSEDED**；#926 小热区前后图仅保留有效尺寸研究，+N/单槽部分 **REJECTED**。早期 `prototype/`、`reference-ui-lab/`、`ui-canvas/`、shared-run-hud-20261113 和 HUD-R2 截图是历史设计/实现，不能覆盖本决定。怪物状态条的+N属于另一组件，不是遗物栏依据。
- 新增截图必须标版本/修订/组件/场景、源SHA/树、正式配置及证据类型。原版来源、批准适配、当前实现投影、历史失败截图分开；不能用项目旧截图自证正确。
