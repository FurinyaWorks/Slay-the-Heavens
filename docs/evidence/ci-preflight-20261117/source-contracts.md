# 历史来源合同接续

旧 archive、pin、库存和断言保留。一个完整字节认证的外层 continuation 连接本轮脚本/工作流与旧测试视图；未知、部分、错误换行、Buffer 与外来输入不投影。旧合同继续核验旧语义，新增测试直接检查当前工作流和原始 Full 发现器。

验证（Node 24.19.0 / Linux，本地定向，无本地 Full）：

- `node --test --test-concurrency=1 tests/ci-summary-runners.test.mjs tests/full-quality.test.mjs tests/quick-feedback.test.mjs tests/ci-runtime.test.mjs tests/ci-posix-shards.test.mjs tests/ci-windows-shards.test.mjs tests/merge-queue.test.mjs tests/pr-quality-evidence.test.mjs`：115/115。
- `node --test --test-concurrency=1 tests/ci-complete-calibration.test.mjs tests/sts-style-source-epoch.test.mjs tests/test-affected.test.mjs`：194/194。
- 最后复审修正后 `node --test tests/ci-summary-runners.test.mjs tests/ci-impact.test.mjs tests/fork-preflight.test.mjs`：25/25。workflow-only 视图错误投影真实脚本/测试已先 RED 后 GREEN；生产、脚本、测试和库存边界均保留。
- 新增回归按真实 Full 发现器进入 878 JS / 1423 Lua；Windows/POSIX 分片各文件恰好一次。计划值（不是实际 CI 耗时）：Windows 1,756,639 < 1,800,000ms，Linux 1,190,964 < 1,200,000ms，原预算与 reserve 未变。
- 另跑下载合同曾有 1 项环境失败：`ci-downloads.test.mjs` 的真实 PowerShell checkout 需要 `pwsh`，当前 Linux 未安装，spawn status=null。该项须托管 Windows/POSIX 环境验证，未删断言或跳过测试。

初始化时旧 gzip 为 Git LFS 指针，已用现有 `ci-media-lfs` 精确 materialize；不修改 archive hash，不把指针哈希失败当代码回归。工作树里 materialize 的历史 LFS 字节不属于本轮提交。

完整-source continuation 本身仅测试使用，正式 CI 不从历史投影视图运行，也不继承历史运行资格。
