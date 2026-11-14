# 事件进入失败的只读诊断

基线 `origin/develop@9f2f44e4`，本地分支 `feat/event-failure-diagnostics`。本轮补TASK-13.1.2 AC8的源码诊断缺口，不改变事件池、资格、代价、玩法或随机消费，不推送、不创建PR、不合入发布分支。Backlog由主控统一维护。

## 原缺口与返回合同

`drawEvent`原先在映射成功后才写原始事件ID，缺路由直接返回 `event_not_implemented`；事件资格和准备失败也只有reason。局部选中身份和尝试中的RNG随后被事务丢弃，界面只能展示通用拒绝消息。真实 `Nodes.enter` 直接事件失败的新增回归在旧版失败于 `event failure has no detached diagnostic receipt`，不是设备模拟失败。

现在inner entry在已有私有c上先保存抽中的原始ID，再查既有映射；只在已有失败点生成脱离图的attempt标量快照。outer `Nodes.enter` 的事务闭包局部保留额外诊断，仍只向 `Run.transaction` 返回原来的accepted/reason，不修改事务实现。

普通事件拒绝完成回滚后返回 `false, reason, receipt`；原前两个返回值不变。成功以及没有可归属事件的拒绝仍是原两返回值，成功不输出失败日志。新增模块只rawget/type读取数据、校验计数标量和格式化，不导入其他服务，不调用随机构造/快照方法，不产生物品或持久状态。

收据包括：

- 原始 `runSeed`、当前 `seed`、`eventSeed`及act，分别保留原类型，不混成一个seed。
- 节点ID、floor、原始sourceType与实际resolvedType。
- 原始事件ID、映射ID及两项Known标记。直接ID没有来源时不反查猜测；没有取得的值为nil，不编造0。
- 已提交event/misc计数，与attempt中的event、selection、roomMisc、runMisc计数分列。计数仅接收现有有限整数，缺失或类型错误保留未知。

单行实际出口为 `ABYSS_EVENT_ENTRY_FAILURE`。每字段保留类型标记、转义空白/控制符/分隔符并限制编码长度；实际记录在事务外。采集与日志异常隔离，print抛错不能替换原失败reason或破坏回滚。收据仅为新表和标量，外部修改不影响Run/Map或下一次拒绝。

## 嵌套事务边界

主控复核指出 `Run.transaction` 的nested路径直接在现有stage执行，并只poison外层owner，此时内层返回并不等于完成回滚。新增真实反例：outer先改金币并推进misc，再调用失败事件；旧诊断错误声称 `after_rollback`，该反例按预期失败。

最小修正依赖现有事务参数身份合同：普通command收到新staged根，nested command收到当前run根，故在既有闭包内用 `staged == run` 判别。没有新增事务查询或改变原子性。

嵌套失败返回 `phase=awaiting_outer_rollback`，种子身份标为 `uncommitted_transaction`，`committed.known=false`且不填已提交计数，不输出终态日志；直接调用emit也拒绝此类收据。测试确认此时内部金币/流确实尚未恢复，outer最终仍以原reason失败并完整还原。普通路径为 `after_rollback` / `committed_post_rollback` / `committed.known=true`，实际logger中验证原Run和Map已经还原。

未来若更改事务回调的根身份合同，必须同步更新该测试与诊断边界；不能把未知阶段升级为完成回滚。

## 本轮验证和证据

`docs/evidence/event-entry-diagnostics-20261114.json`保存实际缺映射收据、实际单行日志、规范化源码SHA256、收据SHA256和stdout摘要；不是客户端日志。

可重跑命令：

```powershell
npm run build:data
node --test tests/event-entry-diagnostics.test.mjs
node --test --test-concurrency=1 tests/event-entry-diagnostics.test.mjs tests/act2-event-content.test.mjs tests/m3-event-completion-routes.test.mjs tests/native-candidate.test.mjs
npm run check:lua-static
npm run check:architecture
npm run check:quality
node scripts/check-quality-ratchet.mjs --base 9f2f44e4c79789fbcb64a515938765dbc240f830
```

诊断专项通过，包含直接未知ID、低金币资格失败、完整原池受控缺映射、消耗私有roomMisc后prepare失败、全Run/Map回滚与原对象身份、重复拒绝、收据外改、logger异常、转义与长度、未知/错误计数、成功原返回和嵌套poison。现有Act2与M3来源/资格/完整事件完成及候选打包组合29/29通过，原15组Act2内容与11条新事件完成路线的oracle不变。

新诊断依赖与两个命令owner一起经过候选源码嵌入、独立读回和检查。架构347模块/1957边通过；固定Luacheck1.2.0无新增诊断、14条历史告警，既有CC15门槛通过；质量报告、独立树Backlog及差异格式通过。精确Git质量ratchet在提交后另跑，结果由主控绑定实际SHA，不以dirty树的0 changed Lua冒认成功。

没有官方GIL构建/导入、新ready、用户旧次失败seed或实体PC/手机两幕试玩。本功能能保留后续同类失败所需的信息，不能补造历史现场，也不等于事件产品验收完成；AC5/6/8中涉及官方、自然和设备的部分继续未验。
