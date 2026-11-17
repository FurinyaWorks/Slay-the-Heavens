# #707 精确历史 reader 修复

最终基线为 #707 `3f890cdcdf2849ae981d9c221d2a0c390647b062`，PR base 为 Release `b9bca884ed9b9831965b409885d78f719b9a567a`。不包含 #709，不修改生产源码或 workflow。

先评估并复用现有准备对象：`776912f7cef3eb43969bbb81535287ff1d4a3f0d` 含旧来源回退，未采用其整树；`b6d24eed1cfab7d27c078ffdb3d2c76541065639` 的实际父提交为 Fast `e2feae68c855214addce2b64a8722a7354e1260f`、Freeze `f8acc21780b90712bffba383101e34fea3471bf8`。后者已含 Release B9，但未修复本轮两个 reader，也未包含 #707 最新预检去重。本轮先在该准备树重现、验证，再回到准确 #707 HEAD 完成窄补丁，保留两个准备对象供后续集成。

`before.log.gz` 精确复现原两个失败。新增不可变包只保存完整最终源码及其完整原前驱：

- `component281`：`tests/ci-impact.test.mjs` 当前 `f87c750a…` → 原 component 包的 `afterSource`，仅供这个 epoch。
- `nativeCloseout`：Draft helper `357ad5c4…` → 原 closeout current `5c3cc95c…`；本次修改的 component helper → 原 `7422a8f1…`，防止 reader 本身改变旧 current。
- `releaseIntegration`：本次修改的 component、run HUD helper → #707 HEAD 原完整源码。独审发现 `assertIntegratedCurrent()` 还约束 run HUD `084db705…`，本层保留该 pin 并显式接续。任何带 before 描述符的调用均不采用本层新映射，保留原拒绝行为。

每次只投影明确目标、固定路径、匹配整份 LF SHA256 的字符串；LF/CRLF 等价，CRCRLF、尾字节、截断、空值、外来路径和生产路径保留原输入。原 gzip、旧 pin、断言和库存未改。新增 helper 与包均提交，以覆盖真实隔离复制。

## 验证

- 准备树上原两例 **2/2**，完整 calibration **76/76**：`after.log`、`calibration.log`。
- 最终 #707 基线上 calibration 及其余五个来源文件 **107 项通过**。同一命令中的 ci-impact 文件因初始未安装 luaparse 加载失败；原失败保留在 `final.log.gz`。按锁文件 `npm ci` 后仅复跑该文件，**26/26**：`impact.log`。没有重复整套运行。
- `controls.mjs` **4/4**：两个实际 reader、LF/CRLF、完整前驱、漂移/截断/CRCRLF、错 target/path、缺失读传播、错/空 before 描述符拒绝：`controls.log`。
- `assertIntegratedCurrent()` **PASS**：`integrated-current.log`；真实 `replayReviewedSelection()` 隔离复制 **5/5**：`replay.log`。
- guidance、Backlog 和 `git diff --check` 通过。首次依赖缺失已用精确锁文件安装解决。

最终定向命令：`node --test tests/ci-complete-calibration.test.mjs tests/ci-impact.test.mjs tests/ci-summary-runners.test.mjs tests/release-card-contact-integration.test.mjs tests/release-selection-map-source.test.mjs tests/release-pc22-basic-feedback-source.test.mjs tests/integrated-ci-source.cases.mjs`。独审见 `REVIEW.md`。

旧 `closeout-ci-source.json.gz`、`release-source-epoch.json.gz` 仅按精确 OID/大小在本地 materialize 供测试，未纳入提交。未推送、dispatch、评论、合并或启动 Full。

下一步沿原 #707 提交本候选，准确 HEAD/BASE 重新用现有必要 hosted Quality 验证。Quality manual 只接受 `runner_pool`，不接受 `base_sha`，非 PR 事件强制 Full；Quick feedback manual 的 `base_sha` 仅用于单平台 advisory，不是完整 Quality。#709 须在最终实际集成顺序上另接续其现有 union，不冒称已合入。
