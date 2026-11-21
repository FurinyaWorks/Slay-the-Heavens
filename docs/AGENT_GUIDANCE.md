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

## 工程规范与验证

重要契约、复杂功能和重构先在现有 Backlog 任务或附件记录意图与验收、状态拥有者及写入入口、设计取舍、依赖方向、实施步骤和验证边界。小修复直接引用任务范围与验收。公共模板参考本轮已独立核验的 [OpenHarness 固定源码](https://github.com/FurinyaDev/OpenHarness/blob/98826145a59452401e19b93bfa2af264fedeecb8/docs/engineering.md)。

| 目标 | 项目权威来源和命令 | 结果范围 |
| --- | --- | --- |
| 依赖边界 | [模块与组合位置](ARCHITECTURE.md)、[架构配置](../config/architecture.json)；`npm run check:architecture` | 实际 Lua AST 依赖，包含函数内的可解析加载；配置定义边界、例外与生成物范围 |
| 复杂度、模块规模和循环增量 | [质量验收](ENGINEERING_QUALITY.md)、[棘轮策略](../scripts/quality-ratchet-policy.mjs)；`node scripts/check-quality-ratchet.mjs --base "$BASE_SHA"` | 用精确 40 位 BASE 和已提交 HEAD 比较，沿用函数身份、移动和 SCC 规则；历史观测快照用于工程报告 |
| 工程集成 | [工程检查](ENGINEERING.md)；首次运行 `npm run setup:lua-static`；执行 `npm run build:data`、`npm run build:ui` 后执行 `npm run check:engineering` | 当前架构、静态与指定硬门槛、真实变异场景和原生 UI 合同 |
| PR 尺寸 | [任务执行](TASK_EXECUTION.md#小批量集成)；`node scripts/check-pr-slice.mjs "$BASE_SHA" HEAD` | 统计当前比较的总变更和生产变更；有例外时按既有流程附 PR 正文及独立核验 |
| 分支交付 | [原生合并与交付](CI.md#常规使用)、[分支收口](BRANCH_LIFECYCLE.md) | 独立会话、当前 HEAD/BASE/合并树、正式检查和合后证据 |

先从更新后的目标分支确认本轮 `BASE_SHA`，按项目合同核对候选和正式 CI。在涉及业务的时候，用需求、领域规则或已经确认的样例复核测试预期；状态归属、动态边界、例外理由和设备验收仍由对应评审或验收确认。

## 维护指引时的使用效果核验

沿实际任务从根入口走到工具、配置或源码，记录必要步骤、验证结果和仍未覆盖的边界。优先用正常 PR 和现有测试留痕；历史背景见 [TASK-87](backlog-details/AGENT-HARNESS-20261104.md)。
