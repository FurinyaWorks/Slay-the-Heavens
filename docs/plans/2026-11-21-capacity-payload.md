# 正式候选无损减容 Implementation Plan

**Goal:** 修复 Owner 当前候选官方 20.81653/20MB 阻塞，交付独立容量复测包。

**Architecture:** 只压紧构建时表示：精修怪物的已校验图元写为数字串，模块加载时还原全部独立字段；正式画像包排除没有运行时消费者的旧 battle133，保留实际头像、1600背景和464图元战斗画像。历史配置沿用原表示。官方MB单独复测。

**Tech Stack:** Node.js、现有 GIL 编码器、Lua/Fengari。

1. 在 `tests/capacity-payload.cases.mjs` 增加真实 Lua 全字段等价、独立数组、坏数据拒绝、实际正式画像及历史边界检查，由既有 `tests/official-portraits-build.test.mjs` 发现；先运行并记录红测。
2. 在 `scripts/monster-art.mjs` 加紧凑生产源生成器；`scripts/build-ui.mjs` 与 `scripts/build-native-candidate.mjs` 共用，保持生产打包与审计配方一致。
3. 在 `scripts/official-portraits.mjs` 仅省去正式配置的旧战斗画像，并让收据继续从新战斗画像识别开启标记；验证正式/历史配置。
4. 运行定向测试、影响范围计划及相应构建/静态检查，记录实际未过项。按 Owner 授权创建 develop 本地提交，再在当前 release 独立组合树接回并验证真实42资产。
5. 固定干净提交构建完整含音频包、读回审计，以独立文件名交付；逐字节确认旧 `playtest/latest.gil` 与元数据未变。Furinya 接续官方容量、ready、PC/手机实测。
