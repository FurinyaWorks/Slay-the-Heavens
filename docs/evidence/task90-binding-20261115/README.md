# TASK-90：现有遗物绑定机制核查

核查源码：develop `c2409ad750c15124b7b843c6bbfa5b222537cb75`。本片只记录调查及既有定向验证，不修改玩法、文案、素材或 Release。

## 结论

- 本作确实有等价机制，不是无意义的原作限制。`abyss_uncommon_relics.equipBottle` 按永久牌 UID 与攻击/技能/能力类型设置 `inBottleFlame`、`inBottleLightning`、`inBottleTornado`，不存在的遗物或不匹配牌拒绝绑定；同类重选先清旧标记。
- `abyss_purge_candidates.purgeCards` 排除三种绑定牌与受保护诅咒；事件使用该候选集并在提交选择时复验合法性。`abyss_opening_hand` 将绑定牌归到开局入手组，故不能简单删除保护或改动概率。
- 当前一二幕的献祭、变换、乞丐、返璞归真、营火及选择页文案已经解释为「遗物绑定牌除外」。这些文本在现行源码存在，相关历史包含 #449 / `0b9c9b84`；不是本次新修复。无需再生产一遍同样代码。
- 第三幕 `abyss_act3_events` 仍有「未瓶装」术语。本版只开放一二幕，本片不擅自扩大到第三幕，不据此宣称全源世界观适配完成。

## 本轮验证

先按仓库命令生成 `build:data`、`build:theme`、`build:ui`，再运行：

```sh
node --test tests/uncommon-relics.test.mjs tests/back-to-basics-event.test.mjs tests/act2-event-ui.test.mjs
```

结果 **12/12 PASS，0 skip，39.143s**，Node v24.22.1。覆盖三瓶精准 UID/类型约束、真实 Run 遗物回调、返璞归真全部绑定牌过滤和选择后过期合法性、空候选及生成 NodeUI 与真实 Nodes/Run 的事件流程。初跑未生成主题等模块导致 2 PASS / 10 FAIL，原记录保留；正常生成后重跑通过，不改测试、时限或断言。

另外对 `abyss_act1_events`、`abyss_act2_events`、`abyss_back_to_basics`、`abyss_node_ui_camp_actions`、`abyss_node_ui_rewards` 五份当前源码分别断言包含「遗物绑定牌除外」且没有「非瓶装/未瓶装」，**5/5 PASS**。这是文本源码核验，不等于真实设备可读性验收。对应源码 SHA256 见本目录。

## 边界与任务接续

TASK-90 保持 In Progress，两个 AC 不自动勾选。缺少同候选官方页面、自然遭遇、手机选择与用户对解释的可理解性确认；第三幕文本仍待其范围开启后单独处理。没有启动 Full，没有官方导入、GUI、GIL、Release 合并或发布。#668 当前 diff 不覆盖上述业务文本，故本调查不重做其叙事工作。
