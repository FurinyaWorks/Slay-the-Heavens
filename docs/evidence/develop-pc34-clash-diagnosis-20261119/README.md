# PC34「全力进攻」：伤害下降与出牌条件的分离诊断

日期：2026-11-19。源码基线：`62328bdac7703c3ab241e0ddb19e0fa05474f76a`（当时最新 develop）。

**结论：6 个受控 Lua 状态通过，未证明生产缺陷；PC34 仍待同候选实机复验。** 这不是手机/PC 客户端验收，也没有修改生产代码、既有测试、Backlog、数值或 #741 手势实现。

## 诊断结果

当前「全力进攻」为 `clash` / Clash。当前定义基础伤害 14，升级 18。红色 `↓` 表示预览伤害比该牌定义降低，不能单独推断这张牌不可打出。

| 受控状态 | 牌面预览 | canPlay | 实际敌人 HP 损失 |
| --- | --- | --- | --- |
| 其余手牌均攻击 | 14，中性 | true | 14 |
| 虚弱、其余手牌均攻击 | 10↓，cardValueDecrease | true | 10 |
| 其余手牌含防御 | 14，中性 | false / requires_only_attacks | 0 |
| 虚弱、其余手牌含防御 | 10↓，cardValueDecrease | false / requires_only_attacks | 0 |
| 升级、虚弱、其余手牌均攻击 | 13↓，cardValueDecrease | true | 13 |
| 力量 -3、其余手牌均攻击 | 11↓，cardValueDecrease | true | 11 |

每例检查预览不改变能量、手牌数量、敌方 HP 和 RNG seed；拒绝出牌时这些字段同样不变。诊断读取当前 `cardDefinition` / `cardPreview` / `Display.values` / `Display.combatText` / `canPlay`，并真正调用 `play`。这里验证的是伤害显示数据与可出牌判定的关系，不是原生渲染器的禁用样式或提示残留。

## 可复现输入与原始输出

- [原样 Lua](clash-state-diagnostic.lua)
- [原始执行输出](clash-state-diagnostic.txt)
- [收据与摘要](receipt.json)
- [独立复验记录](independent-check.md)

在该精确源码基线、仓库正常依赖可用时，从仓库根目录执行：

```sh
node scripts/build-lua-data.mjs data build/lua/abyss_data.lua
node scripts/build-ui.mjs build/lua
node scripts/test-lua.mjs docs/evidence/develop-pc34-clash-diagnosis-20261119/clash-state-diagnostic.lua
```

保留的第一次原始输出使用同字节脚本的 `.artifacts/pc34/clash-state-diagnostic.lua` 路径；运行树的 `src/scripts/tests/data/config` 与基线无差异。没有运行 Full、生成 GIL、打开 GUI 或修改测试发现机制。

## 为什么不能将历史 PC34 判定为已修复

历史原文 [e40b4211 的录音转写](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-verbatim.txt) 在 50:41–50:54 询问「全力进攻」牌面，未陈述完整战斗状态和精确伤害数字；51:12 后的取消出牌提示问题属另一条 PC35，不应混为同一个缺陷。

历史 [图片清单](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-image-manifest.json) 中第 11 张：

- 路径：`screenshots/11-all-out-attack-card.png`（历史文件名不代表当前卡牌 ID）。
- 大小：486,967 bytes。
- SHA-256：`10fc7d11aa6b67fbc61cd38e937a344e4d5e37d544376b0e4c6cbb21e571ca20`。

本轮未取得该原图字节，也未查看它的像素；不能据文件名或描述反推原图中存在虚弱。当前可访问 Library 的定向检索未解析到该图，协调者另做私聊精确词检索也未命中。这不证明原图不存在或已删除。

下一步由原验收责任人取得原图及该次状态，或提供**同候选** PC 捕获：候选身份、Clash 升级状态、完整手牌、玩家力量/虚弱、目标状态、未瞄准/瞄准/取消三阶段牌面与日志。实际值与这些状态推导不符时才实施对应最小修复。保留 TASK-42.2 / TASK-4.5 / TASK-4.6 原负责人及验收状态。

## 来源与保全边界

- 当前定义：`data/cards.json`、`src/lua/abyss_warrior_cards.lua`；中文呈现：`data/presentation/traveler.zh-CN.json`、`src/lua/abyss_character_presentation.lua`。
- 当前显示：`src/lua/abyss_card_display.lua` 的 valueDirection/values；战斗：`src/lua/abyss_combat.lua` 的 cardDefinition/cardPreview/canPlay/play。
- 分支：`evidence/develop-pc34-clash-diagnosis-20261119`，v2 develop 只读诊断保全，PR none，后继为原 PC34 验收线，分支收口由本轮云端诊断协调者负责。
- 出口：FROZEN，仅保留证据。复核触发为取得原图/同候选完整状态，或原验收线完成接续；不占用生产实现，不宣称任务 Done，不为这份证据自动创建 PR。
