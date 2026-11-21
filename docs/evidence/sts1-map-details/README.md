# 原版地图细节对照

| 最新 develop 基线 | 本次修改 |
| --- | --- |
| [修改前](before.png) | [修改后](after.png) |

两张图使用同一 1280×720 视口、seed 42、第一幕第 14 层和各版滚动上限。由真实 GameUI 和构建后的官方布局控件树离线投影。此前的房间进度由测试夹具推进。普通房间原生图案从仓库的既有模拟器画面估算，首领剪影从项目既有图库参照估算。画面能检查控件位置、尺寸、六项卷轴、墨圈和宝箱行的消失。图库显示、字体和设备的结果以官方客户端验收为准。[既有模拟器地图](../map-v25-20261110/map-boss.png) · [图库编号与依据](../../art/NATIVE_ENEMY_PORTRAITS.md)

视觉参照为 Owner 提供的 STS1 地图截图及固定源码。圈线参考 `MAP_CIRCLE_5` 的旋转和手绘粗细，首领采用项目图库对应简化形象。[MapRoomNode.java](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/map/MapRoomNode.java) · [MapEdge.java](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/map/MapEdge.java)

## 验证范围

- 地图控件、图例顺序与卷轴收边、不同幕的裁剪和连线，以及 PC 鼠标和触摸 Down、Up 和 Click 模拟。
- 第一二幕由真实首领战斗结算生成奖励。验收卡牌领取、从选牌返回后明确继续、失败重试和重复事件。测试覆盖第 17 层开箱后进入第二幕，以及第 34 层开箱后比赛结算。全流程配置另覆盖第二幕到第三幕和独立的第 51 层终局。
- 源码验证由现有地图、跨幕、奖励和原生控件测试执行。PC 及实体手机官方客户端待验，Backlog 的设备项保持待验。
