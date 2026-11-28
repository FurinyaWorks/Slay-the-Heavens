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

## 项目与当前工作入口

《杀戮原塔2》是原神千星奇域 UGC。旧 `release/v2.0.0` 已冻结；修复在 `develop` 集成，紧急 Release Hotfix 沿用[发布通道](PUBLISHING.md)。

按当前任务选择入口。阈值、测试集合和线上保护分别以仓库可执行配置、测试及实时 GitHub Rulesets 为准。保持现有质量门槛与断言，合并按实际 HEAD、BASE 和独立评审证据交付。

## 开始与交付

- 三仓库共用 Backlog。新功能、重构、实验及技术探针必须在 Fork 开发，日常修复、测试、性能和文档默认在 Fork。Fork A 优先开发与 Fast，Fork B 优先高风险 Full。开工经现有切片检查核对分支和远端，从最新 `origin/develop` 建独立工作树。成熟且通过必要验证的精确提交才能同步到主仓短分支。分流与例外见 [任务执行](TASK_EXECUTION.md#fork-first-开发) 和 [CI](CI.md#三仓库按需验证)。
- 每次会话先运行 `backlog instructions overview`；创建、执行、收口前分别读对应的 `backlog instructions task-creation`、`backlog instructions task-execution`、`backlog instructions task-finalization`。任务与里程碑只用 Backlog CLI 修改，先查重；负责人沿用 Furinya，任务正文用简洁中文，技术证据放对应附件。 内部单人多agent事项只进Backlog；GitHub Issues保留给外部协作和公开反馈，既有内部Issue迁入后关闭并保留来源链接。
- 自主认领前按 [任务执行](TASK_EXECUTION.md#开始任务) 检查范围、审批与依赖。
- **产品优先、工程按需**：M7已归档，只在M8/M9实际功能、稳定性、容量或CI门禁受阻且有证据时实施最小架构修复；质量棘轮照常拦截新增债务，不为清零旧CC/SCC/Fan-out自主开工。按[工程移交](backlog-details/M7-PRODUCT-FIRST-HANDOFF-20261113.md)追踪未验AC。
- 开工先核对任务、同范围分支、PR 和脏文件。旧分支取证和接续见 [2.0 重建交接](versions/V2-RELEASE-HANDOFF.md)。用 Conventional Commits，正式 PR 从主仓短分支指向 `develop`。可信协调者核实真实独立会话，以原生 COMMENTED Review 绑定 HEAD、BASE 和合并树。用 `npm run merge:auto -- <PR> <GitHub-Review-ID>` 挂起，经 Required Checks、严格基线和原生队列 Full 后 squash。暂停用同一入口 `--pause` 并读回。master 只接发布，release 从 develop、hotfix 从 master 切出。每次合入 master 后通过 [回流 PR 和祖先检查](PUBLISHING.md#release-与-hotfix-回流结项)完整回流 develop，再结项。主仓集成和发布见 [CI](CI.md)。不恢复旧任务锁。
- **先分支、后 PR**：实现与基本验证完成、明确审批已取得、依赖已落地并可评审合并后才提 PR。任务占位、HOLD 和长期探索留在 Backlog；不成熟的既有 PR 关闭并保留分支/来源。Draft 用于 Owner 明确要求的提前协作评审或冻结留痕，具体收口见[任务执行](TASK_EXECUTION.md#pr-生命周期)。
- 任务收尾按 [分支生命周期](BRANCH_LIFECYCLE.md#分支出口agent-的最小收口协议definition-of-done) 选择 DELIVERED_VERIFIED / SUPERSEDED / FROZEN / DISCARDED，记录固定 SHA、继任者、责任人和证据；仅入队或已关闭 PR 不等于交付。合并后核对分支没有新工作，保留可恢复历史并清理自己的干净工作树和分支；脏树与独立提交保留。每日云端巡检只发现未收口异常，不代替执行 Agent。版本与不可移动的注释 Tag 按 [PUBLISHING](PUBLISHING.md)，不自动发版或创建归档 Tag。

## 协作与授权边界

- 产品范围、数值、账号等级及平台限制按 [SCOPE](SCOPE.md) 和已批准方案执行，有变更先获 Owner 授权。保持 [LICENSE](../LICENSE) 及第三方素材各自的授权。
- 占用用户桌面输入、抢焦点或切前台前，说明应用、目的、开始时间与预计时长，取得当轮明确授权。窗口内仅一个执行者操作。用户收回控制、操作中或到期即停止输入和重试并告知已归还。
- 使用千星 MCP 前按 [工具链](TOOLCHAIN.md) 读取技能和平台资源，保持 `MILIASTRA_ALLOW_LIVE_WRITE=0`，只写存档副本。正式发布由 Owner 确认并人工操作。
- 分别报告源码验证、候选写入与读回、官方导入、当前 ready 和设备实测。实机使用同一候选身份与当前日志，自动试玩显式开启 `clientScriptLog: true`。RC 按 [负载证据合同](PLATFORM_LOAD.md) 逐项核对同候选官方容量、静态/动态负载、上传启动及手机实测，缺项保持待验。
