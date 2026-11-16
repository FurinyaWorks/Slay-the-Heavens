# TASK-111：未公开 V4 数据的加载边界
基线：`release/v2.0.0@1cc5479b713edab6fd26db4e20f8eb22b7401cb2`，与上一级精确清单同一默认 release/audio 装配。复用上一级 v4 忽略试验的 include/omit Lua 文件集合，唯一差异是移除原始 `abyss_original_v4_data.lua`（577,904 源码字节）；不是 SDK 或 GIL 实验。

| 离线 Fengari 路径 | include | omit |
|---|---|---|
| production / competition-candidate / alpha 的 V4 角色选择 | 四角色×三入口均拒绝 | 同左 |
| competition-two-act Run.new | 四显式选角、三伪造数据标识均拒绝 | 同左 |
| 合法 Geo 两幕候选 Run.new | 成功；以上合计 V4 加载 0 | 同左 |
| full-source Raiden Run.new（负控） | 加载 1 次并成功 | 加载 1 次并按预期因缺模块失败 |

`src/lua/abyss_battle_render_hud.lua:158–159` 还根据 `frame.battle.originalV4` 直接读 V4 名称，独立于选择器。这一测试不覆盖直接注入/恢复 V4 战斗、官方宿主全 UI、旧存档或实机流程，因此**不能全局移除模块**。后续若做生产专用打包变体，应明确绑定两幕公开配置与原生装配，并对存档恢复/战斗 HUD 加入拒绝或隔离证明；full-source 必须保留。此前 native art Host 两侧共同失败，仍未解决；未修改产品或开启 CI。官方关卡/服务器读数 UNVERIFIED。

复现：按上一级 v4 probe 在两个目录装配模块，然后 `node loader-run.mjs <repo> <include/omit的父目录> <已存在的报告目录>`；runner 以任何一组失败为非零退出。附原始输出和退出码。
