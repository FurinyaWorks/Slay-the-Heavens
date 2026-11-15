# 发版预检：进游戏不等于选角与战斗画面正常

**放在较长的两幕真机试玩之前。** 只用同一个正式候选 `sourceCommit + buildId + candidate.sha256 + payloadDigest`。不要用隔离前置探针的 buildId、GIL 空壳或旧候选补证。

1. **先查同一正式包收据。** 当前默认背景、选角和战斗肖像开启时，`candidate.json` 应存在 `officialPortraits.imageTemplateIndex` 和 `officialPortraits.containerTemplateIndex`，两者应是已绑定的不同有效整数（不是 0 或 100001）。字段名虽为 `officialPortraits`，默认非实验布局也走该绑定路径；默认不要求只在官方实验布局使用的 half-triangle 索引。核对实际候选回读 Lua `abyss_traveler_portrait_assets` 与收据的 `moduleDigests` / 模板索引，别用生成后尚未安装的文件冒充。现 [构建侧绑定](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1cc5479b713edab6fd26db4e20f8eb22b7401cb2/scripts/build-native-candidate.mjs#L287-L296) 与 [同源脚本回读](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1cc5479b713edab6fd26db4e20f8eb22b7401cb2/scripts/build-native-candidate.mjs#L356-L364) 两步都需完成。用已有 [只读 candidate audit](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1cc5479b713edab6fd26db4e20f8eb22b7401cb2/scripts/audit-native-candidate.mjs#L22-L36) 对照 `AbyssReadyCardImage` / `AbyssReadyCardGroup`；模板 ID 按候选回读，不照抄探针示例值。
2. **短程真机先验两处：** 正常从主菜单进入选角，看岩主肖像、确认按钮确实可见可点；进入首战，看战斗立绘正常显示。保存两张对应本候选截图和同次客户端日志的时间点。在同一次上屏对应的日志中查 `ABYSS_PORTRAIT selection phase=ready`、`ABYSS_PORTRAIT battle phase=ready` 及人物/战斗页的其它诊断；如果未见 ready 或有未恢复的当前页错误，按资产/绑定或日志缺口定位，不把通用 `ABYSS_UI ready` 当作通过。若能查到 `ABYSS_PAGE_REVEAL`，按 page/epoch 对齐最后状态，不拿旧页或旧 epoch 的 visible 补证。
3. **再继续长程验收。** 启动收据照原流程保留，它负责同候选身份、原始客户端日志与启动，不替代这一屏幕验证。两幕自然通关、同候选官方容量、PC 和手机其余路径仍照原门禁。

## 回归探针

[精确启动核验源码](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1cc5479b713edab6fd26db4e20f8eb22b7401cb2/scripts/native-playtest-evidence.mjs#L23-L30) 对 [组合回退日志](../default-build-and-player-smoke/combined-campaign-fallback.log) 中真实 Host 输出，在仿真启动身份和 JSON 日志解码器上重放：matching build + `ABYSS_UI ready` 后出现选角页 reveal failed，启动判定仍 PASS；错误 buildId 和带 `ABYSS_UI failed` 的原基线日志均拒绝。[探针](verify-startup-scope.mjs) · [结果](startup-scope.log)。

这是**范围验证**，不是启动检查漏洞、官方客户端重现或已证实的生产缺陷。复现时在精确 Release 的一个隔离副本中把探针放到 `tools/` 下，传两个日志路径；未改构建器、运行时或发布门禁。
