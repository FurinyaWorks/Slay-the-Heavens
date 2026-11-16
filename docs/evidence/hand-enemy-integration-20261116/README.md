# 手牌布局与敌坐标切片整合

输入：#694 `e259ca49be9d2e3b3526a5efa762814ef96df1c9`、#688 `4d40bdac703c80e51054d551f1512ff02fc0adbc`；共同实际 Release `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。

Owner 明确要求实际解决两片冲突，独立分支 `fix/hand-enemy-integration-1116`，不覆盖原负责人分支。9 个冲突文件包括任务记录及 8 个测试/来源合同；任务记录通过 Backlog CLI 保留双方计划、历史记录、负责人、状态和未验 AC。

生产输入取双方精确已审源码：手牌 `abyss_battle_card_view.lua` 保持 #694；敌人 `abyss_battle_enemy_view.lua`、`abyss_battle_render_actors.lua`、`abyss_battle_targeting.lua` 保持 #688。生产身份提交 `dff8e86a26f1b309f21bcc5999c2c1f750da3208`（远端已保存，tree与本地初始7dce48d8完全相同），不是实际 Release 合并或准入。

## 已执行验证

- 原入口 `node --test --test-concurrency=1 tests/hand-layout-values.test.mjs tests/enemy-geometry-metrics.test.mjs`：3/3 PASS、0 skip，26.20 秒。保留手牌 243 布局变体、300 idle/20 hover/12 drag/2 resize 及敌坐标 300 帧/Run/RNG 断言。原日志 `product.log`。
- `npm run verify:backlog` PASS，日志 `backlog.log`。

完整来源合同验证及独立审查需以最终记录为准。没有执行 Full、官方导入/ready、手机 FPS 或容量验收；CI 未完成不是通过，不修改保护、版本/Tag或 AC。

## 来源冲突解决方式

不以ours/theirs舍弃任一历史域。完整生产union保持352条current binding、73个历史targets，保全两侧producer元数据；外层CI packet保留hand和enemy两个精确前置域、完整raw库存与逐次fresh认证，已有immutable archives不重写。原enemy专属用例迁入 `hand-enemy-legacy-enemy.cases.mjs` 并从现有执行入口导入；与hand完全相同的Release-map预算主体复用，两个历史域独立认证。

初轮诊断中的 `initial.log` / `cases.log` / `hand-entry.log`、首次map日志存在实现更新期间的身份漂移失败，不计通过；`union.log`记录新测试对外来anchor错误预期（原合同对外来输入透传、不授权），修正为直接assertCurrent拒绝，同时保留其他linked拒绝及全部库存拒绝。孤立copy比较发现真实接续问题，已保留历史epoch比较并增加完整union比较后复验。

独立评审 `/root/resolve_conflicts/review_union`：352项生产binding与身份Git提交逐SHA一致、73历史targets完整，117 owner×两个前置域的234次漂移拒绝及恢复通过；两侧各101个archive逐Git/LFS SHA核对无损；双域全部CI源读回、105归档校验及24个跨生产/归档缺失负控通过。发现producer遗漏已修复，enemy copy负控补回且独立1/1 PASS。源码无未决阻断项，不代替Hosted Required与设备。

追加已完成：新union原入口3/3 PASS（42.07s，含copy负控），手牌两项真实预算用例2/2 PASS。完整历史cases与最终map来源结果另列，未完成前不能称全部定向检查通过。

最终map来源原入口7/7 PASS（137.85s，0skip），保存map-source-final.log；随后历史cases的输入分层只用于每test认证后的历史fixture，生产live认证没有缓存或降级，最终复核另列。

最终dff身份（35个CI绑定、105归档、882JS/1426Lua真实发现）union入口3/3 PASS，50.03秒、0skip。`check:guidance`、`git diff --check`通过。历史输入分层独审通过：hand3922/enemy3920个Git blob记录精确，未知路径拒绝、Buffer无污染，每test真FS重新认证；生产live授权未缓存。完整旧cases运行结果尚待记录，不当作已通过。
