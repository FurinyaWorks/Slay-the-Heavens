# TASK-30 terminal fixture 进程隔离补丁

独立分支以 #686 dcb2cf15c8f282fafe1711b4dc2e6ef0c8c90e88 为底，仅测试基础设施，不修改原target_anonymous_terminal.lua或生产Lua。上游发现及OOM stderr：PR #694 评论6900732688。

## 原因与边界

同进程累计Host的原7组在V8约2GB堆耗尽；不是已观察到的Lua断言失败。精确原fixture SHA256 e129b0cd78815bdc83f1faf3fd7955af56b0a793c05402bacca7b26e12f21b97 保持。沿既有worker模式，将每个独立组在fresh Fengari worker执行，父进程只串行一worker；共享原总90秒deadline（含100ms清理预留）和输出budget。外层spawnSync超时杀父进程及worker，不产生独立子进程遗留。

只有精确raw terminal路径走新路由；全部7组回执按顺序且恰一次检查。原每组fn、组内循环和所有断言逐字保留；来源漂移必须重新评审，不能静默分割新fixture。非terminal与显式caseName/cwd其它路由保持。

## 本轮验证

- 原JS tests/target-anonymous-click.test.mjs 的 unknown target terminals 入口：1/1（全7组），默认profile 36.95秒。
- 同入口在原 #694 da45571b + #686 dcb2组合树18832f93，加本补丁，以前次officialAssets:true生成模块复制至隔离树build/lua：1/1（全7组），47.16秒。只含两PR生产，不含#679。
- 新5项负控：完整原fn保留/CRLF、源漂移、缺组/重复/乱序/成功回执丢失、Lua断言失败、deadline过期/无限循环/跨worker累计、输出溢出/错误分组数量。
- 独评要求补真正跨worker负控：两组各1.8秒，总3000ms，预留worker启动余量，单组可完成但总耗时不能续期。旧版本第二组1秒超过700ms不足以证明累计，后续两组各0.4秒/700ms存在启动抖动，已纠正，不沿用旧覆盖声称。

不是任意generated-wrapper入口的修复：runIsolatedBattleRegression生成路径本身不会命中raw路由，直接重跑它仍可能OOM。官方复验明确使用官方生成模块 + 原JS→raw入口，未偷换default结果。

## 交接与未验

本补丁供#686现有owner选择性接续，不修改其远端分支。scripts/test-lua与raw JS库存已变化，现行Source/CI packet尚未接续，不能用旧CI或旧独审宣称当前Release准入。没有Full、新GIL、官方ready、设备或容量验收；无任务AC变化。当前#694新头12f0981c的完整来源准入不在本次验证中。

## 提交前独立复审

独立reviewer对最终5项5/5通过（3.85秒）。将remaining故意改为每worker3000ms时，变异实际status=0、FIRST_DONE及后续5组全出，而原负控要求deadline失败，确认逐worker续期变异被杀死。runner SHA256 3783d1a32fa3af6672de5679a8c08f854c146f237b0e269059f9e04d2e916f3d；helper c4aab412f66b65c80b2a548446cbc8b36c05dd0dae7f0666b7f56164466c4147；test 044c4f7b6d4026a2ff1933333f8e949725054ece62be80568943fab7607dcb21。结论仅本窄测试补丁，非当前Release完整准入。
