> **SUPERSEDED / 历史证据**：共享HUD以 [2026-11-24 PD01–05](../../design/reference-assets/v2.0.0/run-hud-pd-20261124/REFERENCE.md) 为准。历史 count:1、+N遗物折叠、集合列表及普通事件隐藏库存规则已 REJECTED；旧图不得作为当前设计正确的证据。有效的热区尺寸研究仍可追溯。

# v2.0.0 手机共享顶栏验证

基线为 Release `2d979ef9c8e2029e0635cc23888580dd941b8609`。修复源码以此目录所在提交的树为准。复现使用两份按正式默认设置生成的 UI 树与实际 Lua Host，启用精绘怪物和原生页面生命周期。数据为固定战后选牌状态，三槽中仅第一槽有药水。两张图均为 2556×1179 离线投影。青线是第 1 槽实际命中框，瓶身边界依据旧实机截图的可见比例估算。图片省略原生图库纹理及官方字体效果。[修复前](reward-picker-before.png) · [修复后](reward-picker-after.png)

| 2556×1179 横屏 | 旧设计单位 | 新设计单位 | 旧屏幕像素 | 新屏幕像素 |
| --- | ---: | ---: | ---: | ---: |
| 战斗药水有效热区 | 44×44 | 84×84 | 72.05×72.05 | 137.55×137.55 |
| 选牌、地图和房间逐槽有效热区 | 49×44 | 84×84 | 80.24×72.05 | 137.55×137.55 |
| 普通态瓶图框，经父层变换 | 18.18×20.36 | 42×48 | 29.77×33.35 | 68.78×78.60 |
| 瓶身可见边界 | — | — | 约 17×26，来自 IMG_1474 | 约 39×61，按旧图透明边缘估算 |
| 非战斗相邻槽命中区间隔 | 0 | 8 | 0 | 13.10 |

舞台物理像素投影系数为 `1179/720=1.6375`。按 iPhone 14 Pro 的 3× 比例，旧战斗和选牌热区分别约 24.02×24.02pt、26.75×24.02pt，修复后约 45.85×45.85pt。手机一级顶栏命中区距舞台上沿至少 20 设计单位。实际 canvas 数值和舞台缩放由客户端启动日志 `ABYSS_UI viewport_ready` 记录。[Apple 屏幕比例](https://developer.apple.com/documentation/uikit/uiscreen/scale.md) · [Apple 命中区指南](https://developer.apple.com/design/human-interface-guidelines/buttons) · [Slay the Spire+ iPhone 参考](https://apps.apple.com/us/app/slay-the-spire/id6448808007)

手机遗物保留在生命区下方。单个遗物显示图标，多件遗物通过同一 `+N` 入口打开现有列表。这样能在 84×84 的尺寸下保留相邻页面操作。奖励暗层止于手机顶栏下沿。战斗与战外仍分别绑定自己的输入控件。

坐标回归以正式设置生成的控件层级为输入，在真实 Host 刷新后计算累计变换、活动状态、层级和可接收事件区，再按屏幕坐标路由到 Lua 监听器。旧基线首次失败为战斗药水 24.02×24.02pt。修复后覆盖三槽与五槽、满槽及空洞、边缘和间隔、自用与选敌、拖瓶与迟到 click、切页旧触点、弹窗遮挡、丢弃、重开，以及房间和 PC 离线几何。[坐标回归](../../../tests/lua/support/mobile_run_hud_geometry.lua)

正式 GIL 写入与读回、官方导入及同候选 iPhone 14 Pro／PC 实测待验。当前云工作区未提供 Production 底图。需以最终 `candidate.json` 中的 `official-assets-battle-v3`、`nativePageLifecycle=true` 及 source SHA、buildId、GIL SHA256、payloadDigest 绑定实机记录。[候选构建与验收](../../versions/V2-RELEASE-HANDOFF.md)
