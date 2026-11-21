# STS1 交互收口

对照起点为 `develop@73fd14aab04c590037c39197364f725a767fed19`。实现接续 [#803](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/803) 的 `b5e7c915112e9e741114173d5a58fc95b0313587`。选角沿用 [#760](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/760) 的开放信息布局与 [#785](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/785) 的按钮和去暗层修复。工作目标是后续版本的 `develop`。

## 原版证据

| 界面 | 所见与项目对应 |
| --- | --- |
| 主菜单 | 无本局时通过 Play 进入新游戏。有本局时可从主菜单继续或放弃。项目仍使用已批准的主菜单材质。取消放弃应维持当前本局，确认后回到可开始游戏的菜单。旧版移动端关于放弃提示的反馈存在差异，本项目依据本轮明确要求保留确认。 [原版主菜单截图](https://interfaceingame.com/screenshots/slay-the-spire-main-menu/) · [开发者 FAQ 的放弃入口](https://steamcommunity.com/app/646570/discussions/1/1483233503860119113/) · [继续与放弃同屏记录](https://steamcommunity.com/app/646570/discussions/1/3335371283868961798/) · [确认流程讨论](https://steamcommunity.com/app/646570/discussions/0/3196993949746567084/) |
| 选角 | 选角图显示角色、生命、金币、介绍及初始遗物。进局后使用顶栏牌组入口。正式选角移除常驻初始牌组文本，保留既有共享牌组浏览器。 [原版选角截图](https://interfaceingame.com/screenshots/slay-the-spire-choose-your-character/) · [原版战斗与顶栏](https://playcraft.space/gallery/slay-the-spire/combat-ten-card-hand/) |
| 药水 | 瓶槽旁提供使用与丢弃。目标药水接既有瞄准流程，脱战可用及事件限制由 Run 的现行资格判断。 [实际瓶槽菜单与瞄准录像](https://www.youtube.com/watch?v=H3cj7-pq4Dc) · [开发者战斗内丢弃与战斗外使用修正](https://store.steampowered.com/news/posts/?appgroupname=Slay+the+Spire&appids=646570&enddate=1529625895) |
| 遗物 | 顶栏单件可看说明并打开详情。项目保留现有单件前后切换、计数和效果，收紧详情面板。 [开发者单件详情说明](https://steamcommunity.com/games/646570/announcements/detail/1616144864288305862) · [顶栏点击记录](https://steamcommunity.com/app/646570/discussions/0/1743353164080404403/) |
| 转场 | 原版开局录像提供普通跨页观感。本项目具体 Alpha、准备和发布时序沿用 #803 的现有门禁。 [原版无解说实录](https://www.youtube.com/watch?v=WTABR-8-8QE) · [#803 源码](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/803/files) |

## 画面对照

[前后对照](comparison.png)包含未完成本局的主菜单、放弃确认、选角、局外药水、遗物和首战等待。[补充状态](additional-states.png)包含未选中、遗物悬停、地图淡出和全黑等待。两组都是 1280×720 原生布局经 Lua Host 运行后的离线投影，系统字体、贴图和触摸事件仍需官方客户端核对。

`tests/lua/support/sts_ui_closeout.lua` 可在前后工作树分别复现。每个工作树使用同样的 `node scripts/build-ui.mjs <目录>/generated --official-assets --native-page-lifecycle`，生成数据后以 Fengari 指定 `<目录>/generated/?.lua;src/lua/?.lua` 搜索路径，令 `STS_UI_CAPTURE=true`，仅在基线设置 `STS_UI_BASELINE=true`。将 `OFFICIAL_VISUAL_SCENES` 后的 JSON 保存为 `<目录>/scenes.json` 后运行 `python docs/evidence/v2-ui-20261119/render-runtime.py <目录>`。选角另用既有选角驱动展开批准的 1600 图元。

## 容量和生命周期

以下来自同一配置的真实生成布局，递归计入容器、文字、图元和命中控件。

| 量 | 修改前 | 修改后 | 减少 |
| --- | ---: | ---: | ---: |
| 旧开局 `prologuePanel` | 112 | 0 | 112 |
| 普通 `pageReveal` | 114 | 9 | 105 |
| 转场合计 | 226 | 9 | 217 |
| 战斗外药水操作面板 | 154 | 42 | 112 |
| 完整舞台控件 | 24,586 | 24,373 | 213 |
| 转场两棵布局树紧凑 JSON 字节 | 38,286 | 1,064 | 37,222 |
| 构建输出 `game-ui.json` 字节 | 18,942,765 | 18,838,666 | 104,099 |

两个旧树各含 95 个璃月徽记图元。当前正式布局移除了旧树与两个徽记，只在淡出和淡入过程中给共享 veil 写入 Alpha。准备期间保持全黑，原开局的逐帧盖层和七元素批量着色路径从正式布局退出。实验/旧宿主仍保留过场源码，商店共用其 UTF-8 拆字函数。PNG 全黑帧的三个 RGB 通道极值均为 0。

路线预览借用 `exitOpen`。旧逻辑据此让遮罩让位给前景，这会让地图及共享入口排到遮罩上方。现在普通预览由页面遮罩持有输入和层级，只有真实恢复菜单或确认弹窗持有前景。失败的地图预览可返回原战斗，等待阶段提示不可见。横向加宽时使用同一遮罩和命中区覆盖整个画布。

当前云环境缺少可写入和读回的实际底图 GIL，也未获得官方客户端与设备证据。表中的字节是实测构建布局输出。候选 GIL 字节与官方容量仍待同一底图、同一配置的前后构建与测量。

## 回归入口

```sh
node --test tests/noncombat-v25-layout.test.mjs tests/sts-selection-fade.test.mjs tests/sts-page-reveal.test.mjs
node --test tests/session-menu-navigation.test.mjs tests/relic-view-controller-click.test.mjs tests/potion-popup-readability.test.mjs tests/official-assets-runtime.test.mjs
npm run check:engineering
```

正式 UI Host 新用例核对确认放弃、取消、继续、重新开局、共享牌组、可用及不可用药水、格内丢弃、遗物只读切换、全黑门禁、宽画布覆盖和失败路线预览恢复。历史源回放继续验证原文与完整绑定，当前行为用当前源码和当前生成布局执行。
