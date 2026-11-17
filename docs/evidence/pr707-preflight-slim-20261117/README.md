# #707 准确基线预检去重变体

准确父提交：主仓 #707 `e2feae68c855214addce2b64a8722a7354e1260f`。仅 Fork A 准备分支；不写主仓 ref、不触发 CI、不修改正式 Required Checks、Quality、队列、权限或生产源码。

## 与 #677 已验证实现复用

- `scripts/release-ci.mjs` 复用 #677 切片同一 Git blob `77cf109724eeefcf90d92f60d541a420f04db68a`。
- `.github/workflows/quick-feedback.yml` 复用已修正实际入口的 `873d4392c02fd5ac92e653e57a78fd59f6ae63c6` 同一 Git blob `1bfb7554ceedd4aaf195ff2eab1ee7e733826389`。Ready PR 不重复 advisory，Draft/manual 保留；原 related 前同 job 显式检查固定 Release CI 路径并运行两项合同。没有新调度机制。
- 新 Quick LF SHA `7eb601d4859afe2aa6331608e544205d94a3c8fdd1d864c351fdc92cad24b5f9`。

## #707 本树合同兼容

原 bootstrap helper 只对上述准确完整 Quick 逆掉新增显式合同整步及 job gate，恢复原 packet 中的完整工作流。原 B9 leaf 只对本树准确完整 bootstrap after `23ca7542e7c9b0995c3bdc8a32eed64b7fbc9131b8f9417db1475152cd3a1385` 逆回 #707 原 bootstrap 全文 `ce667d97bc69c66654c857fcf1d51d35dfaa39e09d375c3f10bd789ce89de6e8`，验证后进入原有 B9 packet 投影。B9 既有绑定保留，新增准确 Quick 绑定及原 selection 历史视图需要的精确过渡；错误 before 在投影前原样返回。

不修改任何旧 gzip/packet、expected、生产源或旧负控。原 #707 cases 完整保留，追加与 #677 同样10项回归及1项嵌套 B9 Quick/bootstrap 完整来源与漂移负控。新函数通过真实静态 import 进入用例，未依赖 fixture 额外注入。

## 验证边界

C 系统临时目录、Node REPL 受限环境：运行实际 #707 cases 的静态 imports 与回调，仅将 node:test 注册改为顺序收集、相对读取固定到该临时根，release-ci/verify-delivery 的本地 CLI 入口使用 argv=[]/env={} shim；生产提交不含这些 harness 改动。首项 impact 路由用例因其额外依赖面未在本次本地 harness 执行。其余旧 B9/历史正反控及新用例 **18/18**，详情 results.json。

该结果不称为固定 Node24、完整原始测试入口、Hosted Full 或正式主仓集成通过；实际变体合同预检需主控审查后使用既有 Quick，不机械重复 Full。#677 Quick `44024346434` 已真实执行相同 runtime 的显式合同步骤成功（最终运行状态由主控读取）。

原生机制：[job 条件](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions)、[concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)。freeze 仍仅接收主仓准确 SHA 的完整正式收据，Fork 预检不代替 Required Checks。
