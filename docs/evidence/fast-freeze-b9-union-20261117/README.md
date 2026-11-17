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

## 三仓准入的 Release 组合（2026-11-17）

本树接续既有准备，不重建或回退：真实 merge `1ccbbc5551e7787a3057b4e22f396e2bda489402` 的父提交是 `b6d24eed1cfab7d27c078ffdb3d2c76541065639` 和准确 #707 `8457762c7f93fc0201ac15ee9386e0d3e6e2bd58`。因此包含 #709 `f8acc21780b90712bffba383101e34fea3471bf8` 的 edited/范围门禁、#707 冻结版 Full 发布门禁和最新 reader 修复。只选择性移植 #712 `2089991e6cb893de3690622ecc3e52edd27658d2` 的内联准入、manual完整Quick、Fork准入脚本、完整选测/收据、原quick回归及必要source reader；不合develop整支，不纳ci-run-costs变动或新测试文件/库存。Quality/Quick/Licenses由本准备树的release_ci维护。

实际组合保留原Quality七个job模板和18/15分片、Licenses唯一inventory；准入放在既有impact/inventory内，保留同HEAD/BASE、成功rerun、较新失败拒绝及非master主仓PR条件。Release→master仍要求原精确冻结Full，普通Release修复仍完整受影响Fast。Full manual的base_sha实际贯穿比较blobs、checkout whitespace、manual Lua ratchet及首片receipt，不只改标题。Quick采用完整 `--preflight` 并保留707显式CI合同步骤。原五个Full/Fast/收据验证脚本和共享形状逐字等845，raw JS库存881与b6相同。

原组合107项的11红已修复；`8d96be314a1817b422105cce03684fb5911c4c94` 上原五文件加完整calibration、summary为 **196/196，0skip**，含新增3项当前完整Quick/源边界/注入依赖负控。另Release metadata **3/3**、严格delivery身份 **4/4**。当时10份原始日志归档SHA256为 `549af5ad326dbd89d5446c67a6efba4695d01a2b5cee5bea3b63da86f62608e3`；它们现逐字保留在增加本轮日志的同一 `preflight-union-raw.tar.gz` 中（当前SHA见后文），保留最初11红、109/110和195/196及最终成功，不把旧失败抹掉。未启动hosted Full，不冒称托管或真实正式准入通过。

来源兼容沿既有union机制：外层20份完整最终源码仅映射固定 `release→b6`；Quick具名 `advisory→845` 后再由原B9转到其f832前驱，避免提前落错epoch。旧union只在已有fast/freeze目标内接续，13行当前校验沿caller read映射且鲜读新archive固定hash；无对应view的路径保持原输入。712原17行包及旧union、所有旧pin/断言保持。错误/空before在任何映射前拒绝；LF/CRLF、截断/尾字节/CRCRLF、外来/生产路径、缺失及非caller依赖漂移均覆盖。没有新库存或通用注册器。

707两项旧Quick行为合同显式读完整845历史视图，当前完整Quick仍读原盘并验证原显式CI步骤与完整预检/收据并存。summary验证当前presentation表达式：补真实needs.impact状态上下文，保留Draft/Ready/集成/取消断言，并补上游failure/cancelled/skipped拒绝；不投影旧工作流掩盖当前行为。

后续接续真实B712 run `44050580539` 的 POSIX4 job `133927379711`（`ci-posix-shards.test.mjs:73`）及 POSIX11 job `133927379705`（`delivery.test.mjs:539`）：只把两条当前workflow断言强化为显式 `!cancelled()`、impact success与对应mode；其余矩阵/身份断言保留，不使用旧workflow视图。两例本地先复现 **2红**，修改后两例、20行完整源/依赖负控、当前Quick及原两calibration current检查 **7/7，0skip**。可执行workflow/脚本与8d96逐字不变，未重复196套件；新source包只为这两份实际改动测试多保存完整前驱。

独立复审已捕获并促成四组Full base消费者补齐及summary上下文修复；最终准确HEAD/base绑定见协调者本轮 `release-ci-union-review.json`，不借用旧准备树审查。可从此准备继续原707/709集成线；712仅列选择性来源，未宣称该PR已合入。实际base推进后应正常重审，不推BLOCKED旧节点b235。未推送、dispatch或新建PR/任务；正式hosted准入仍由主控沿现有A/B及原PR操作。

## 预备接续703容量来源，不提前改变真实Release BASE

本地从已审 `359b426f456f7445345f1a014ac4eb18b9385e0e` 正常merge已有703 `6980b909db9e3d1a2f425ebaf31524aebc156416`。merge-tree只有4个CI/source冲突：bootstrap、card-contact integration、selection helper及selection测试；产品/core/manifest无冲突。保留359 Quick/Freeze历史链及703 capacity/review/reduction/audio链、当前容量断言和原所有before/pin。源自703的既有产品/证据全部沿正常merge保留，不重建。产品独审复用精确698/B9及公共comment6943642627；359 CI foundation单列复用，不拿工具独审替代产品审查。

必要外层完整来源只有11个真实改变CI输入、19份具名父view：359历史Full/Fast/Freeze选preflight view，703 capacity/repair current选capacity view；单父缺席不造空前驱。原包和hash全部不动，只有最终整份合法LF/CRLF且正确before才投影。foreign/生产/未知view、CRCRLF、Buffer/非字符串、部分/漂移与空/错before保持原输入；advisory无path view时不能漏出已投影父字节。旧release-ci fixture只为它原有B9域显式选择359完整父，再沿原链，原hash与断言保留。

新current校验先沿真实caller读取并核所有必要输入，再进入各自历史域；integrationCapacityCiRead和integratedRead均显式贯穿caller reader。独审发现的非请求依赖漏参已以真实“只读workflow、注入另一owner/新archive漂移”先红后绿覆盖，不靠预先全局校验遮盖单读漏边。最终11文件组合 **228/228、0skip**：ci-impact、summary、complete-calibration、quick、fork-preflight、delivery、posix-shards、selection、card-contact、pc22与integrated cases。原始12红/54、阶段53/54、advisory缺view红、caller漏边红和成功输出保留；不声称每次中间运行都已完整归档。

字节核验：703改动的11份产品脚本逐字等698；三workflow与13份CI foundation路径（含五验证器、Freeze/范围与Fork/Quick/receipt核心）逐字359；src/data/config两父tree相同。raw JS测试路径两父均881且完全相同，无新增测试库存/调度器/门禁。guidance、Backlog及diff-check通过。全部本轮必要原文复用当前raw归档，与原10份无损合为23成员，当前SHA256 `1bb105d05ceab4297992cd4857fb091b37fdd959642d343fa4026521eeeccd13`。

这只准备“含准确703来源”的候选，真实Release仍以实读为准，未把PR HEAD698冒充实际squash/base。待703实际squash后，先核其tree确等已审703/tested tree，再正常merge该真实BASE；如有重复来源冲突，仅在逐字来源证明后解决，必须断言最终tree与此准备tree不变。随后重绑准确HEAD/实际BASE及独审，再沿原707执行线必要Fork Full一次。当前不推送、不dispatch、不改active359/正式707/703，也不动冻结operator3c或677c650；不是正式Release合后通过或发布许可。
