# v2.0.0 主菜单视觉对照

历史原生截屏与本轮布局投影均为 1280×720。正式构建继续使用原生三角、矩形和灯板，中文 Logo 与英文副标题来自 Owner 批准原图的轮廓测量。按钮命中由既有宿主持有。

[改前实际画面](../menu-red-quality-20261114/menu.png) · [正常态投影](menu-normal.png) · [开始按钮高亮投影](menu-hover.png) · [批准原图](../../design/reference-assets/v2.0.0/main-menu-approved-20261119.png)

投影使用正式构建生成的原生布局和 Noto Sans CJK，对照位置、组合、颜色和按钮轮廓。官方客户端的原生字体、导入和 PC／手机画面仍待发版时复验。

```sh
node scripts/build-ui.mjs .artifacts/v2-menu --official-assets --native-page-lifecycle
python docs/evidence/v2-ui-20261119/render-menu.py .artifacts/v2-menu/game-ui.json .artifacts/v2-menu/visual
```

## 局内退出、祝福、地图与共享顶栏

以下 1280×720 投影来自正式原生布局和离线 Lua Host 的控件快照。地图首领图标的资源绑定由 Lua 断言验证，投影中省略专用图集纹理。官方字体和同候选设备体验留到发版验证。

| 场景 | 当前证据 |
| --- | --- |
| 局内菜单 · TASK-107 | [唯一可见的退出操作](runtime-run-menu.png) |
| Neow · TASK-103.3 | [开局祝福](runtime-neow.png) |
| 地图与首领 · TASK-4.13 | [接受祝福后的地图](runtime-map.png) · [同一地图滚动至首领](runtime-map-boss.png) |
| 顶栏 · TASK-4.23 | [Mega Crit 官方参照和项目布局](../../design/reference-assets/v2.0.0/shared-floor-counter.md) |

Host 通过按钮监听完成开局、祝福、打开局内菜单、空白关闭、退出回主菜单和继续。本局、地图及楼层保持原值，主菜单退出确认只请求一次平台结算。祝福与地图共享栏均显示 0，首战显示 1。楼梯位于药水栏右侧，由三块原生矩形组成。

正式选角构建仍使用 [Owner 调好的 1600 图元原生背景](../../../experiments/lumine-native-fit/fit-hybrid-final/budget-1600.json)。构建验证背景数据的摘要、图元数量及正式原生挂载标识。

```sh
node docs/evidence/v2-ui-20261119/capture-runtime.mjs .artifacts/v2-runtime-evidence
python docs/evidence/v2-ui-20261119/render-runtime.py .artifacts/v2-runtime-evidence
```

运行前按仓库流程拉取 Git LFS 资源并安装 npm 依赖。

## P1 当前核对

下表画面来自同一正式构建配置的 1280×720 离线投影。投影可核对布局、文字、交互位置和控件归属。客户端字体、专用图集、运行时贴图及设备触摸表现留到候选版本复核。缺少客户端纹理的区域只记录布局，卡牌生产美术维持原样。各页的参考状态见 [v2.0.0 UI 总表](../../design/UI_REFERENCES.md)。

| 场景 | 当前画面和核对结果 |
| --- | --- |
| 选角 | [9e3b22dc 历史选角投影](p1/runtime-selection.png)。读取正式背景创建器实际挂载的 1600 个图元和原有控件。生命、金币、角色介绍和初始遗物直接排在左侧，原生文字使用深色描边。岩脉残晶有六块原生图元组成的图标。移除了旧色板和「查看牌组」的控件及命中区。[同视口改前](p1/runtime-selection-before.png) · [Release 对照基准](../../design/reference-assets/v2.0.0/sts1-character-backing-20261122.md) |
| 战斗与顶栏 | [首个正常战斗](p1/runtime-battle.png)。核对手牌、三种牌堆入口及共享顶栏。药水栏右侧显示楼梯图标和数字 1。[原作战斗构图](https://playcraft.space/gallery/slay-the-spire/combat-ten-card-hand/) |
| 卡组和牌堆 | [卡组](p1/runtime-deck.png) · [抽牌堆](p1/runtime-pile-draw.png) · [弃牌堆](p1/runtime-pile-discard.png) · [消耗堆](p1/runtime-pile-exhaust.png) · [卡牌详情](p1/runtime-pile-detail.png)。通过已有按钮打开。抽、弃、消耗列表使用各自真实容器，详情绑定所选实例，连续返回两次恢复原战斗。夹具为弃牌、消耗堆移入示例牌并保留实例编号。 |
| 遗物与药水 | [起始遗物](p1/runtime-relic.png) · [药水选中态](p1/runtime-potion.png)。从当前会话打开说明，检查取消保留原槽位，再确认丢弃只清除选中的槽位。 |
| 奖励 | [首战胜利奖励](p1/runtime-reward.png)。通过出牌、结束回合和击败敌人到达。中央奖励区使用当前纸带与紧凑行，保持原有领取按钮。[原作奖励布局](https://interfaceingame.com/screenshots/slay-the-spire-rewards/) · [项目材质依据](../../design/CARD_MATERIAL_REFERENCE_20261112.md) |
| 商店 | [当前商店](p1/runtime-shop.png)。核对卡牌、商品、服务及返回位置，官方配置回归另行验证确认、取消和扣款。[原作商店构图](https://playcraft.space/gallery/slay-the-spire/merchant-shop-cards-relics/) |
| 营地 | [当前营地](p1/runtime-camp.png)。核对地点提示、休息和锻造入口，官方配置回归另行验证锻造流程。[原作营地构图](https://interfaceingame.com/screenshots/slay-the-spire-rest-or-smith/) |
| 事件 | [当前事件](p1/runtime-event.png)。核对叙事、选项和效果提示的层级，官方配置回归另行验证选项和离开。[原作事件构图](https://playcraft.space/gallery/slay-the-spire/event-mind-bloom-choice/) |
| 结算 | [胜利](p1/runtime-victory.png) · [失败](p1/runtime-defeat.png)。以受控运行状态分别打开同一结算组件。正式流程回归另外覆盖首领战失败和结束图的信号。 |

商店、营地和事件截图经真实地图入口进入目标房间。截图夹具跳过中间房间的结算。外部截图仅供对照。

## 菜单与转场输入核对

- 局内菜单只显示「退出游戏」。Backspace、手柄返回和外部空白沿既有关闭路径处理，保持当前会话。局内「退出游戏」回主菜单，可继续原局。主菜单「退出游戏」打开 [平台结算确认](p1/runtime-exit-confirm.png)，确认只发送一次结算请求。公开客户端控件 API 将奇匠键 42 默认绑定至 Backspace。公开按键枚举未提供物理 Esc 回调，客户端 Esc 行为留在发版设备检查。[千星奇域客户端控件 API](https://act.mihoyo.com/ys/ugc/tutorial/guide/detail/mhtakr07vej4)
- [开局全遮罩与七元素](p1/runtime-transition-opening.png) · [普通房间就绪遮罩](p1/runtime-transition-room.png)。核对两者在当前布局中的璃月配色及其各自时序。受控延迟首战的画面就绪时，普通遮罩处于最上层并消耗点击，连续两帧确认就绪后撤下。开局场景验证七元素出现后才继续。
- 键盘回归由 `tests/official-neow-navigation-retirement.test.mjs` 调用正式配置和默认配置执行。将同一场景运行在修复前的宿主上时，正式配置报 `missing native Backspace receiver`。接入现有关闭路径后，检查按键被消费、无结算信号以及连续打开无副作用。

```sh
node docs/evidence/v2-ui-20261119/capture-runtime.mjs .artifacts/v2-selection --selection
python docs/evidence/v2-ui-20261119/render-runtime.py .artifacts/v2-selection
node docs/evidence/v2-ui-20261119/capture-runtime.mjs .artifacts/v2-p1 --p1
python docs/evidence/v2-ui-20261119/render-runtime.py .artifacts/v2-p1
```

## 设计索引门禁

`tests/agent-guidance.test.mjs` 执行 PR 共用 Impact 入口的索引门禁。负例实际拦截图片内容变化、图片缺失、批准目标冲突、原索引条目替换或丢失、历史图片重新引用、历史图片改名复用、无依据的地图视觉修改及不匹配的 PR 声明。还原基准、补充历史对照、普通控制器缺陷修复、明确替代及 PR 声明匹配的合并快照通过。选角测试同样先在旧布局报出仍有 `informationBoard`，移除后验证正式布局、左侧文本和原四态按钮。
