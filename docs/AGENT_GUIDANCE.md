# 指引维护与机械门禁

根指引是按任务导航和授权边界。Claude、Cursor 只转到同一个入口。维护时用 `npm run check:guidance` 与受影响测试验证；操作细节留在既有领域文档，历史证据随原提交和任务保留。

| 要求 | 实际执行位置 |
| --- | --- |
| 指引入口预算、入口链接、npm 命令、适配器结构 | [指引检查](../scripts/check-agent-guidance.mjs)，由本地完整检查和 Quality impact 调用 |
| PR 尺寸和例外格式 | [尺寸检查](../scripts/check-pr-slice.mjs)；Quality impact 经 `check:guidance` 调用，事件覆盖取决于检查器、工作流和实际目标分支 |
| Lua 模块分类、依赖、静态诊断和质量棘轮 | [架构配置](../config/architecture.json)和 [工程命令](ENGINEERING.md) |
| 回归范围、代码集成 | [选测与 Full](CI-FAST.md)、[实时保护与交付](CI.md#核心分支原生保护) |
| 任务数据、诊断任务与合后收口 | `verify:backlog`、`verify:outcome`、`verify:delivery --merged`；适用范围见 [任务执行](TASK_EXECUTION.md) 和 [CI](CI.md) |
| 发布冻结、候选身份与证据形式 | [CI-FAST](CI-FAST.md)、[工程收据](ENGINEERING.md)、[官方负载证据](PLATFORM_LOAD.md) |

独立会话真实性、尺寸例外理由、任务写入范围与审批、WIP、授权和实机体验仍需判断。已有脚本可核对输入与证据，合并绿灯不授予桌面控制、产品变更或正式发布权限。Fork 诊断无正式准入门禁。

## 维护指引时的使用效果核验

沿实际任务从根入口走到工具、配置或源码，记录必要步骤、验证结果和仍未覆盖的边界。优先用正常 PR 和现有测试留痕；历史背景见 [TASK-87](backlog-details/AGENT-HARNESS-20261104.md)。
