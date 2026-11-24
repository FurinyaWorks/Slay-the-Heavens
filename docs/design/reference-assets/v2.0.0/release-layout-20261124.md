# v2.0.0 Release 布局修订 · 2026-11-24

**APPROVED**，依据 Owner 本轮 PD-01～PD-04。适用正式 official-assets-first 局内界面。对应开局恩赐、共享顶栏、持有遗物、战斗奖励、奖励选牌及宝箱。旧实现在 [Release 布局证据](../../../evidence/release-layout-20261124/README.md) 中留档。

## 原版测量

坐标以原图左上为零，图层边缘取近似像素。台前参照采用初代原版。

| 来源 | 观察 |
| --- | --- |
| [MIT 恩赐四选项](https://mitadmissions.org/wp-content/uploads/2021/02/1613924743.png) · 1920×1029 | 顶部底板约 62 px（6.0%）。首个遗物可见像素约 x=35。选项组约 x=177–1063、y=685–987，四行步长约 79 px，末行距底约 42 px。对话在组的上方，角色在右。 |
| [MIT 战后选牌](https://mitadmissions.org/wp-content/uploads/2021/02/1613925089.png) · 1920×1035 | 顶部底板约 62 px。遗物可见像素约 x=35 起。卷轴约 x=490–1430、y=202–330，题字中心约 (960,250)，其下是三张牌和跳过。 |
| [Steam 多遗物与选牌](https://images.steamusercontent.com/ugc/957481092836729609/B9E28A64F2A7481684562684F4E09FA8E7F88970/) · 1920×1080 | 顶部底板约 65 px。首遗物可见像素约 x=34，多件保持同一纵轴横向排列。卷轴约 x=491–1427、y=210–343，题字中心约 (960,260)。 |
| [Interface In Game 初代参考库](https://interfaceingame.com/games/slay-the-spire/) | 实读战后奖励、选牌、地图分类，复核奖励列表与选牌页均有独立标题及共同卷轴语法。 |
| [Slay the Spire iOS App Store](https://apps.apple.com/us/app/slay-the-spire/id1491530147) | 实看横屏商店与战斗宣传图，原版移动层级仍为紧凑横条加左起遗物。宣传图有透视变形，仅作构图校验。实看 App Preview 约第 9 秒宝箱奖励，卷轴有独立标题。 |
| [Neow](https://slaythespire.wiki.gg/wiki/Neow) | 实读上局未到第一首领时两选项，达到时四选项的规则。保留项目已有权威生成与状态。 |
| [Apple Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games) | iOS 频繁触控目标按 44×44 pt 设计。原版可见比例只用于比对，不推算实际原版点击框。 |

核对既有固定源码研究镜像 [319009d5](https://github.com/aeubanks/sts/tree/319009d5df0a82d9fb0f23cc22322286c6a87ec0) 的 `TopPanel`、`NeowRoom`、`NeowEvent`、`RoomEventDialog`、`LargeDialogOptionButton`、`CardRewardScreen`、`CombatRewardScreen`。研究镜像仅用于理解层级、分页和状态机。原版动态横幅标题依奖励入口变化。项目使用原有美术及现有原生按钮。

## REASONS Canvas

| 项 | 本次规约 |
| --- | --- |
| Requirements | PD-01 继续、两项、四项及长文案完整显示，iPhone 底部触控留白至少 21 pt。PD-02 顶栏底板不超过舞台高度 12.5%，药水、地图、牌组、设置保持至少 44×44 pt，控件互不争抢输入。PD-03 遗物首位与有效舞台左安全边距固定，单件、多件及分页共用锚点。PD-04 独立标题与现有卷轴同中心、同显隐，保留领取、跳过和返回。 |
| Entities | 有效视口由 `abyss_viewport.lua` 按 1280×720 等比投影。官方主题定义 PC、手机底板、命中、遗物行及内距。手机适配从遗物命中行底计算内容上界。Run HUD 继续拥有页面显隐与输入归属，房间控制器只绘制本页。 |
| Approach | 手机底板 88 单位（12.22%），操作锚点仍为 y=298，84 单位热区投影约 45.85 pt。42×48 瓶框完整置于可见底板，热区可延伸至底板以下。遗物热区顶部与操作热区底之间留 4 单位。 |
| Structure | 普通房间使用遗物行之下的内容区。恩赐场景以完整舞台定位，按钮从底部向上堆叠，气泡及其文字与第一项保持合适间距。奖励选牌读取 `layout.rewardPick` 的一组标题坐标并将卷轴与题字一起投影。奖励列表由既有渲染器统一移动卷轴与题字，卷轴出现时题字可见。宝箱的题字、卷轴与说明沿用原宝箱时间线。 |
| Operations | 单遗物与翻页共用一条固定行。手机和 PC 分别保留每页 11 和 25 件，左右方向按钮预留在行尾两个固定单元。获取、替换、查看单件或翻页均不改变首位锚点。 |
| Notes | 继续沿用 [#928 的 Run HUD 状态合同](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/928) 及 #930 的模态输入与地图返回。旧顶栏 104 单位、遗物居中偏左锚点、恩赐随活动房间整体下移、奖励标题单独重写均标为 SUPERSEDED。 |
| Scenarios | [双端投影、几何及重跑入口](../../../evidence/release-layout-20261124/README.md)。同一最终候选的官方客户端字体、触点、安全区与 GIL 继续按平台门禁验收。 |

## 投影校准

iPhone 14 Pro 的 2556×1179 画面投影到 2096×1179 的有效舞台，左边界 x=230，比例为 1.6375 px/单位。设备按 3× 折算。视觉底板高 144.10 px，药水、地图、牌组、设置和遗物的方形触控框边长 137.55 px。遗物首格命中框左界 x=295.50 px，即舞台左侧 40 单位。PC 1920×1080 下首格左边界 x=36 px，底板维持 43 单位。英文本体、卷轴的形状及按钮相对关系来自原版测量。手机触控与中文字号按项目投影实测设定。
