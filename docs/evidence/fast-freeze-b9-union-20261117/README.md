# Actual Fast × Freeze integration after #698 landed

Exact parents: Fast #707 `e2feae68c855214addce2b64a8722a7354e1260f` and Freeze #709 `f8acc21780b90712bffba383101e34fea3471bf8`. Fast includes actual Release #698 merge `b9bca884ed9b9831965b409885d78f719b9a567a`, its CI continuation, and the earlier checkout-independent EOL fixture repair. Product `src`, `data`, and `config` are unchanged from this Fast parent.

The actual Git merge had two CI-source conflicts. Unlike the earlier 3650 candidate, the new B9 join and both CI predecessors must remain active. A new `release-fast-freeze-b9-union` packet saves exact full Git source views for both parents and authenticates 13 current CI inputs plus its own immutable archive. Only a complete known LF/CRLF input maps to its explicitly named parent. Foreign paths, malformed/partial bytes and production paths are not projected. Original B9, selection-map, PC22, bootstrap and Freeze packets and pins are retained.

Current raw joint inputs enter the Fast predecessor before the existing B9/PC22/selection chains; the Freeze-specific historical consumer enters the Freeze predecessor. Caller-provided readers propagate through the B9 public reader and the integration source/read/inventory/current-validation entry points, so mutation of a noncaller dependency cannot gain authority from the real disk. Wrong or empty predecessor descriptors are rejected before projection, preserving raw identity.

Original assertions remain, but test wiring is not byte-for-byte unchanged: the B9 current-input assertion explicitly consumes its authenticated Fast predecessor, and the appended Freeze test binds its current identity validation to the union while replaying the exact Freeze domain. Original full selection checks remain in their existing tests and integrated validation. No expected hashes, assertions, deadlines or policy were weakened.

## Verification

- Initial naive union retained real failures; `initial-red.log.gz` also records an assembly error (duplicate import) fixed before meaningful test coverage. `v1-red.log.gz` retains subsequent raw-source mismatch evidence.
- Final six-file relevant suite: **48/48**, zero skipped, 12896.850895 ms (`focused.log`). This is not Full CI.
- Actual two EOL fixture target files were written to CRLF, the original regression passed **1/1**, and exact bytes were restored in `finally` (`crlf.py`, `crlf.log.gz`). Not a Windows hosted run.
- Additional author probes: **69/69**, exact Git parents, current sources, missing/null/drift, wrong/empty before, production/foreign visibility, injected noncaller drift and recovery (`verify.mjs`, `verify.log`). Independent review is reported separately.

Commands: `python docs/evidence/fast-freeze-b9-union-20261117/capture.py`; `node --test tests/ci-impact.test.mjs tests/ci-summary-runners.test.mjs tests/release-card-contact-integration.test.mjs tests/release-selection-map-source.test.mjs tests/release-pc22-basic-feedback-source.test.mjs tests/integrated-ci-source.cases.mjs`; `node docs/evidence/fast-freeze-b9-union-20261117/verify.mjs`.

This is a real prepared two-parent integration tree, not an upstream merge. Neither source PR, protection nor official/device acceptance was changed. Existing historical gzip LFS objects were materialized locally only and are excluded from this delivery. Recheck actual heads/base and required hosted gates before using the candidate. No Full was started and no release decision was made.

## 三仓准入的最小 Release 组合（2026-11-17，BLOCKED）

本树接续上文既有准备，不重建或回退：真实 merge `1ccbbc5551e7787a3057b4e22f396e2bda489402` 的父提交是 `b6d24eed1cfab7d27c078ffdb3d2c76541065639` 和准确 #707 `8457762c7f93fc0201ac15ee9386e0d3e6e2bd58`。因此包含 #709 `f8acc21780b90712bffba383101e34fea3471bf8` 的 edited/范围门禁、#707 冻结版 Full 发布门禁和最新 reader 修复。后续只选择性移植 #712 `2089991e6cb893de3690622ecc3e52edd27658d2` 的内联准入、manual 完整 Quick、`fork-preflight.mjs`、完整选测/收据及必要回归/原来源 reader；不合 develop 整支，不移植 ci-run-costs 变动或新增测试文件/库存。共享 Quality/Quick/Licenses 由本准备树的 release_ci 单独维护。

实际组合保留原 Quality 七个 job 模板和18/15分片、Licenses唯一 inventory；准入在既有 impact/inventory 内，保留同HEAD/BASE、成功rerun、较新失败拒绝及非master主仓PR条件。Full manual新增712的base_sha/run-name；Release→master仍要求原精确冻结Full，普通Release修复仍完整受影响Fast。Quick采用712的完整 `--preflight`，同时保留707显式CI合同步骤。原Full/Fast/收据验证器与共享形状逐字等845，raw JS库存881与b6一致。

组合定向 `quick-feedback + ci-impact + full-quality + pr-quality-evidence + release-selection-map-source`：**107项，96过，11红**；Release metadata另 **3/3**、严格delivery身份另 **4/4**。真实运行规则、同HEAD/BASE准入、完整Quick、Full/Fast/License严格身份及冻结发布负控均通过；尚未认证组合来源闭包、托管或正式准入。原始输出合于 `preflight-union-raw.tar.gz`（SHA256 `0dd55f22ecb697ae33362800667388fb794973f3ea402cdad3d32916b199e085`）。

11项未解失败（完整断言保留）：

1. `Release history accepts only the complete reviewed gate and push removal together`：新组合Quality尚无旧Release reader的完整前驱。
2. `B9 Release join projects only exact complete CI inputs and keeps wrong predecessors and drift visible`：旧Fast×Freeze包仍绑定b6的完整13输入，当前Quality等已改变。
3. `Release CI repair maps only complete reviewed helper and test bytes, retaining drift and foreign inputs`：同一旧union当前身份拒绝。
4. `advisory job skips Ready PR duplicates while Draft and manual prechecks remain enabled`：707旧Draft/Ready Quick断言需要其完整原视图；实际Quick已按712转manual完整预检。
5. `advisory explicitly executes affected Release CI contracts and fails closed on Git errors`：其Git/命令执行负控通过，末尾仍检查旧 `--ci-fast`，需要准确历史视图，不能删断言。
6. `B9 advisory continuation retains exact standalone Quick and bootstrap contracts before historical views`：新Quick/联合helper缺原完整前驱接续。
7. `reviewed workflow inverse rejects partial wiring and preserves original arbitrary source drift`：新inline Quality尚未进入完整旧workflow视图。
8. `execution slack restores only the complete approved workflow edit for historical guards`：同上。
9. `release selection map CI validates complete live bindings while unknown or changed bytes stay visible`：旧union当前身份拒绝。
10. `release selection map raw JS and Lua inventories reject missing duplicate foreign and changed additions`：新增源helper的原当前绑定尚未接续；不改库存。
11. `Release freeze CI continuation authenticates fresh owners before historical projection`：旧union当前身份拒绝。

下一步沿当前真实组合，只给上述实际reader建立限定目标的完整最终before/current接续，原b6 union、71217行源包和所有旧pin保留。不要将旧包改成新current，不批量建库存/映射体系。若来源闭包继续扩大，先保留本实际代码与失败清单，不将此准备推进原PR或启动Full。实际集成顺序须先确定707/709/712的落地基线，再按准确HEAD/base独审和原门禁推进；本轮未推送、dispatch或新建PR/任务。
