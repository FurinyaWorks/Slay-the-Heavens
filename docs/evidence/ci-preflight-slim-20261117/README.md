# 发版预检去重最小切片

准确基线：主仓 #677 `6b16b6e8ec74e5247dfee228d9ef4fb98a5b1583`。仅在 Fork A 的 `feat/ci-preflight-slim-1117` 开发，未修改主仓 PR、Required Checks、Quality、队列、runner 矩阵或权限。

- Quick feedback 是非必需 advisory。现有 job.if 仅保留 Draft PR 与 workflow_dispatch，普通 Ready PR 使用其已有正式 Quality，避免再分配重复 advisory runner。原触发入口、只读权限与同 ref concurrency 保留。
- release-ci 的 freeze 沿用原 hosted dispatch 与原 verifyReleaseFull。固定主仓身份、准确 release HEAD 及完整分页检查后，已登记同 SHA 非终态运行返回 waiting/URL，不再 POST；成功必须重新通过原完整矩阵、最新 attempt 和不可变 checkout 收据，才返回 verified；失败、取消、身份/HEAD/attempt 变化或缺证据均拒绝，不悄悄重开。无匹配时在二次列表与 ref 检查后仅发送一次原 POST。
- 二次读取会捕获已经登记的并发请求；GitHub dispatch 没有本切片使用的跨客户端原子去重接口，最后读与 POST 之间仍有竞态，由既有 workflow/ref concurrency 约束。不宣称跨进程 exactly-once，不增加锁、请求 key、服务或新调度系统。
- 新 Quick 的完整 LF SHA `ec23dcec59adc0a6de7a1f1ba30304e6e6e3b0262fdc369b1fdb533b4f4c9800` 只在原 bootstrap helper 中精确逆转一条 job gate；原 packet/hash/expected 不变，未知、重复、缺失或篡改 wiring 仍拒绝，错误 before 在任何投影前保留原输入。

## 验证

C 系统临时目录载入准确 API 源码，受限 Node REPL 无 process 全局且 spawnSync(node) 返回 EPERM。仅本地测试副本给 release-ci/verify-delivery 的 CLI 入口提供 argv=[]、env={}，实际函数、原 receiptErrors、真实共享矩阵与 bootstrap 原始 gzip 不变；网络/checkout 下载使用 mock。12项通过：3项原完整矩阵/收据负控、9项本切片条件与 freeze 回归。结果见 results.json。生产提交不含 CLI shim，不能将此结果称为固定 Node22/Node24、Hosted Full 或正式集成通过。

后续在本唯一提交经独审后，用 Fork A 既有 Quick feedback 手动预检一次，检查实际 Node24 与选测结果；不为此复制一轮 Full。真实 Release freeze 仍只接受主仓准确候选的正式 Full 证据，不接受 Fork 回传替代。

官方机制：[job 条件](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions)、[原生 concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)。
