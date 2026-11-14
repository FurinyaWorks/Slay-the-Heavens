# TASK-90：瓶装绑定机制独立核查

基线：`e65d9b98fbec69442047650254238cd9244df805`。本轮只核现有机制，不改运行代码、平衡或正在 #668 处理的文案。

## 结论

该限制并非无实现的原作术语。本项目有三类遗物，将特定永久牌 UID 绑定为每场战斗的开局牌：瓶装火焰（攻击）、瓶装闪电（技能）、瓶装旋风（能力）。`abyss_uncommon_relics.bottleCandidates/equipBottle` 按类型列出 UID、拒绝错误类型，并在同一瓶的旧标记与新选择间切换。标记存于卡牌实例，而不是所有同名卡牌。

`abyss_combat` 保留三个绑定字段，`abyss_opening_hand.stage` 在洗牌后将绑定实例与固有牌排到开局位置，保留原实体身份。永久移除候选 `abyss_purge_candidates.purgeCards` 排除这些绑定实例及特殊不可移除诅咒；Back to Basics 的提交路径再次检查当前合法性，拒绝过期或变成绑定牌的 UID。因此不能简单删掉限制来修文案。

并非所有事件操作都排除绑定牌：Back to Basics 的升级可保留原绑定；Duplicator 可选绑定牌，但产生的新 UID 不继承绑定。不能把“非瓶装”解释为所有事件一律不可选择，也不能把复制或升级与永久移除混为一谈。

## 验证边界

运行原有 `uncommon-relics`、`event-card-picker-ui`、`back-to-basics-event` 定向测试；详见相邻原始日志。覆盖真实 Lua 调用和受控永久牌实例，包含错误类型、不可移除绑定牌、状态变更后的再次拒绝和复制新身份。不是自然游玩、官方导入或手机验收；也未确认用户当时遇到的是哪一个事件。

## 文案接续（未实施）

当前 Back to Basics 已使用“选择一张可移除永久牌，遗物绑定牌除外”。剩余用户可见术语应由活跃 Lore 工作线统一核查，明确具体操作与绑定原因，不改已有玩法保护。待该部分及实际阅读体验确认前，TASK-90 保持进行中；不勾选整个任务完成。

### 定向测试结果

生成依赖：`node scripts/build-lua-data.mjs`、`node scripts/build-ui-theme.mjs`、`node scripts/build-ui.mjs`。

命令：`node --test --test-concurrency=1 tests/uncommon-relics.test.mjs tests/event-card-picker-ui.test.mjs tests/back-to-basics-event.test.mjs`。

结果：**8/8 PASS，0 skip**。原始输出：[定向测试日志](TASK-90-BOTTLE-AUDIT-20261114.log)。初次在新工作树运行时生成物未齐（先缺数据模块，补数据后两个 UI 用例仍缺 `abyss_theme`）；补齐上述生成依赖后重跑通过。没有运行 Full，也没有修改运行源码。
