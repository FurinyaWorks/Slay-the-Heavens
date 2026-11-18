# Release Fast 与 B9 联合来源接续

合流输入：PR #707 `6ba51cbe1ead51d30e2838b0e5f509e15bbb0e33` 与实际 Release `b9bca884ed9b9831965b409885d78f719b9a567a`；无冲突 merge 为 `1346295a5223ff99501040a2546f4f97ac615352`。

原 `ci-impact.test.mjs` 13/14：B9 把 selection map 测试接入联合来源读取，707 又添加历史投影，完整新输入不再匹配旧 standalone after。相关来源与 summary 组合另有 8 项失败：B9 的固定联合 CI 包尚未识别 707 的 Quality 发布门禁、bootstrap/selection helper 和测试变动；历史 workflow 只移除发布 block，仍未恢复旧 release push 字节。实化已有 LFS 对象后才计入这些真实失败，指针导致的启动失败不作代码根因。

修复仅增加 CI 历史视图的精确接续：新压缩包保留 B9 五份完整原始 LF 输入、精确当前 after SHA 和旧 standalone selection 测试；其 hash 在独立 CI-only leaf 固定。只有指定路径、完整合法 after 和正确前驱才投影；未知、篡改、CRCRLF、foreign、错误前驱及非字符串保留原输入。Buffer 读取包装器保持类型，坏 Buffer 保持同一对象。旧 B9、selection、PC22 与 bootstrap 包及所有旧 expected SHA 均不变。生产、工作流、保护和正式门禁无改动。

验证命令（Windows / Node 22.22.1）：

```sh
node --test tests/ci-impact.test.mjs tests/ci-summary-runners.test.mjs tests/release-card-contact-integration.test.mjs tests/release-selection-map-source.test.mjs tests/release-pc22-basic-feedback-source.test.mjs tests/integrated-ci-source.cases.mjs
git diff --check
```

最终相关组合 46/46；原始 stdout 无损 gzip 保存在 `verified-combination.log.gz`，摘要与 SHA 见 `validation.json`。这只证明本轮离线来源/CI 合同，不是 Node 24 Hosted Full、主仓库正式集成、候选 ready 或实机验收。未 push；由主控独立审查后接续原 PR。

## #707 旧 reader 收口（2026-11-17）

准确实现候选为 `b33b6f3e5b3620637bf7d068cddbdedb75a803e8`，直接父提交 #707 `3f890cdcdf2849ae981d9c221d2a0c390647b062`，Release base `b9bca884ed9b9831965b409885d78f719b9a567a`。两个旧 reader 显式接完整全文前驱：component281 的 ci-impact 当前→原 component after；nativeCloseout 的 Draft helper `357ad5c4…`→原 `5c3cc95c…`。本次改过的两个 reader 另经 Release integration 原入口接回完整原字节，旧包 pin、断言、库存、生产与 workflow 均保留。仅匹配固定 target/path 与整份 LF SHA256；错/空 before、尾字节、截断、CRCRLF及外来输入仍拒绝。

优先评估的准备 `776912f7cef3eb43969bbb81535287ff1d4a3f0d` 含旧来源回退，未整树采用；`b6d24eed1cfab7d27c078ffdb3d2c76541065639` 是 Fast `e2feae68c855214addce2b64a8722a7354e1260f` × Freeze `f8acc21780b90712bffba383101e34fea3471bf8` 的既有准备，未含最新预检去重及此修复。先在其上复现，最终切回准确 #707 完成窄补丁；不将 #709 纳入本候选。

本轮准确 #707 上完整 calibration 及其余五个来源文件 **107项通过**；ci-impact 初次因未安装 luaparse 加载失败，`npm ci` 后仅复跑该文件 **26/26**；另完整负控 **4/4**、真实隔离 replay **5/5**、`assertIntegratedCurrent()`、guidance、Backlog及 diff-check通过。准备树上的原两例 **2/2**、完整 calibration **76/76**单独标记，不当作最终组合或 hosted Full。独审见 [REVIEW](REVIEW.md)。

11份原始成功/失败输出无损合并到 `calibration-readers-raw.tar.gz`，SHA256 `85ae484e580cc2940c70e1e91ffa297883f07121b6d9bbb29f26a8a0b4032cce`，压缩前后逐项核对原文件SHA256。原独立日志、一次性 controls脚本和旧摘要可从上述 b33提交恢复；本入口不重复保存。没有重跑已通过套件或修改可执行代码。本地两份历史LFS实化未纳入提交。

本轮未启动Full。后续沿原 #707 准确 HEAD/BASE 验证必要 hosted Quality；Quality manual仅接受 `runner_pool`，不接受 `base_sha`。Quick manual虽有 `base_sha`，仍是单平台advisory，不能替代必要Quality。


## 2026-11-17 Windows selection-map EOL fixture

Fork A Full `44058918461`, exact `558832b6` / Release `b9bca884`, failed the existing Windows rules (16/18) at `release-selection-map-source.test.mjs:151`. The positive fixture reapplied CRLF conversion to already-CRLF text and generated CRCRLF. The reader correctly preserved/rejected those malformed bytes; no runner or permission failure is inferred.

The original callback was reproduced RED using a real Git core.autocrlf/core.eol CRLF checkout of the existing workflow on Linux, then GREEN after canonicalizing only the positive fixture's LF text before constructing its LF/CRLF pair. All original drift/type/unknown/fresh-owner assertions remain. The retained outer source leaf reverses only this exact complete new test body to the exact `558832b6` Git predecessor; all historical packets and pins are unchanged. No workflow, product, budget or source discovery inventory changes.

Validation: original named callback LF 1/1; real Git CRLF fixture 1/1; complete original source file 8/8; 29 exact-source/EOL/drift/type/unknown/packet controls. The real-CRLF experiment runs on Linux and does not claim Windows OS or a new Hosted success. Decoded original Hosted job log, actual RED/GREEN and completed source-file logs are preserved in `selection-crlf-repair-raw.json.gz`. No second Full was dispatched while the original run was in flight.
