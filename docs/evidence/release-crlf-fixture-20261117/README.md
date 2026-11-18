# Release CI 换行夹具修复 / PR #677

#677 Windows rules 11/18 原运行 https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43912278313/job/133543374609：252 pass / 1 fail。
原测试对 checkout 原字节再做 LF→CRLF；Windows CRLF checkout 第二轮制造 CRCRLF，拒绝返回值哈希 e2ff52917ec7d67c5b5843c2471afce7d5e5ad53aee64fcf159ad07bb668c561 精确匹配 hosted 失败。认证 helper 正确拒绝，不改其逻辑、历史 pin 或 workflow。#707 同样两处构造有此问题。

修复只从 LF 生成明确 LF/CRLF/CRCRLF 夹具，继续验证 raw checkout、错误 before SHA、篡改、foreign、非字符串与 Buffer identity。

Node 24.22.1/Linux，原真实目标文件改为 CRLF 字节后，旧 ci-impact 13/14，新 14/14；同目录 LF 定向 23/23，guidance/backlog/diff-check 通过。独评另用进程级读拦截复验真实目标 callback CRLF及Buffer。不是 Windows hosted 重跑，也不是Full通过。没有手动触发Full、改保护、删断言或合并。

原LFS归档仅按指针OID验证后本地实化，不提交变更。Backlog CLI不在此环境，未编辑任务文件。

## 2026-11-17 原始失败日志无损保存

Fork A Full 44008162718 的 Windows rules (1/18) 在 `git diff --check` 发现原始 `crlf-red.log` 第 30、33 行尾空格。这些空格属于失败证据，不能修剪；现将原 Git blob 原字节无损压缩为 `crlf-red.log.gz`，删除未压缩副本。未修改生产代码、测试、工作流或质量门槛。

原字节数：2763；原 SHA-256：`dc06b42189d6f529ccf6fe1b947048d17d985605bb80e3c88efa8cf716d51f7c`。gzip 字节数：1291；gzip SHA-256：`6eb635a237aa151c259754af409379b623211996a5f4ac9a8530fd1ed07c9a48`。Node `gunzipSync` 解压后逐字节与原 Git blob 相等（包括行尾与尾空格）。此验证仅证明证据完整和 diff-check 修复，不代表 Hosted Full 或正式集成通过。
