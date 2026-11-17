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
