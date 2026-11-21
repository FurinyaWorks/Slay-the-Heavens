# 项目协作

《杀戮原塔2》是原神千星奇域 UGC。先核对用户目标、最新目标分支、已有任务和在途 PR；复用相关成果，在独立短分支交付可单独验证的切片。保护他人的提交、脏工作树和唯一证据。

旧 `release/v2.0.0` 已冻结。本版修复在 `develop` 接续，以下旧 Release 路由仅作为历史引用。Fork 预检按需使用。

## 按任务查阅

| 要做的事 | 入口 |
| --- | --- |
| 认领任务、核对依赖或准备 PR | [任务执行](docs/TASK_EXECUTION.md#开始任务)；[分支收口与 WIP](docs/BRANCH_LIFECYCLE.md) |
| 修改玩法、UI、数据或构建 | [模块与生成物](docs/ARCHITECTURE.md)；[产品范围](docs/SCOPE.md) |
| 定位故障、选择验证或使用平台工具 | [工具任务索引](docs/TOOLCHAIN.md#工具任务索引)；[工程与候选证据](docs/ENGINEERING.md) |
| 独立评审、CI 或合并 | [PR 自动合并准入](docs/CI.md#pr-自动合并准入) |
| 修改美术、角色方案或数值 | [角色生产规范](docs/design/characters/PRODUCTION.md)；[当前 UI 参考](docs/design/UI_REFERENCES.md)；[UI 规范](docs/design/UI_DESIGN.md) |
| 核对 v2 来源、实机验收或发布 | [v2 候选交接](docs/versions/V2-RELEASE-HANDOFF.md)；[发布](docs/PUBLISHING.md)；[平台负载](docs/PLATFORM_LOAD.md) |
| 查工程护栏或维护指引 | [规则与验证入口](docs/AGENT_GUIDANCE.md) |

按当前任务选择入口。阈值、测试集合和线上保护分别以仓库可执行配置、测试及实时 GitHub Rulesets 为准。保持现有质量门槛与断言，合并按实际 HEAD、BASE 和独立评审证据交付。

## 开始与交付

- 三仓库沿用同一本 Backlog：主仓库在 develop 统一集成，旧 release/v2.0.0 冻结；Fork A 优先 Fast、Fork B 优先 Full，按需互援。先读 [三仓库分流](docs/CI.md#三仓库按需验证)，使用原生 dispatch；Fork 结果不替代主仓库集成和同候选实机验收，云端开发不依赖本机在线。
- 每次会话先运行 `backlog instructions overview`；创建、执行、收口前分别读对应的 `backlog instructions task-creation`、`backlog instructions task-execution`、`backlog instructions task-finalization`。任务与里程碑只用 Backlog CLI 修改，先查重；负责人沿用 Furinya，任务正文用简洁中文，技术证据放对应附件。 内部单人多agent事项只进Backlog；GitHub Issues保留给外部协作和公开反馈，既有内部Issue迁入后关闭并保留来源链接。
- 自主认领前按 [任务执行](docs/TASK_EXECUTION.md#开始任务) 检查范围、审批与依赖。
- **产品优先、工程按需**：M7已归档，只在M8/M9实际功能、稳定性、容量或CI门禁受阻且有证据时实施最小架构修复；质量棘轮照常拦截新增债务，不为清零旧CC/SCC/Fan-out自主开工。按[工程移交](docs/backlog-details/M7-PRODUCT-FIRST-HANDOFF-20261113.md)追踪未验AC。
- 先核对任务、PR、现有同范围分支及脏文件，独立工作树/短分支开发，尽量当天集成：**从最新 `origin/develop` 开发，PR 指向 develop**。旧分支只取证，按 [2.0 重建交接](docs/versions/V2-RELEASE-HANDOFF.md) 拆分接回。按 [分支生命周期](docs/BRANCH_LIFECYCLE.md) 登记版本、收口责任与来源，保留他人的改动。Conventional Commits；独立云端 AI 复审须由现有可信协调账号核实真实不同会话，并随原生 COMMENTED Review 绑定精确 HEAD/BASE/合并树（可与PR作者同账号，不要求第二人审批）；门禁验证后可用 `npm run merge:auto -- <PR> <GitHub-Review-ID>` 挂起，GitHub 的严格基线、Full 与原门禁全部通过才 squash → develop；暂停用同入口 `--pause` 并读回，不以标签冒充撤销。master 只接发布；release 从 develop、hotfix 从 master，均合回 master 与 develop。保护及精确 SHA 合并流程见 [CI](docs/CI.md)。不恢复旧任务锁。
- **先分支、后 PR**：实现与基本验证完成、明确审批已取得、依赖已落地并可评审合并后才提 PR。任务占位、HOLD 和长期探索留在 Backlog；不成熟的既有 PR 关闭并保留分支/来源。Draft 用于 Owner 明确要求的提前协作评审或冻结留痕，具体收口见[任务执行](docs/TASK_EXECUTION.md#pr-生命周期)。
- 任务收尾按 [分支生命周期](docs/BRANCH_LIFECYCLE.md#分支出口agent-的最小收口协议definition-of-done) 选择 DELIVERED_VERIFIED / SUPERSEDED / FROZEN / DISCARDED，记录固定 SHA、继任者、责任人和证据；仅入队或已关闭 PR 不等于交付。合并后核对分支没有新工作，保留可恢复历史并清理自己的干净工作树和分支；脏树与独立提交保留。每日云端巡检只发现未收口异常，不代替执行 Agent。版本与不可移动的注释 Tag 按 [PUBLISHING](docs/PUBLISHING.md)，不自动发版或创建归档 Tag。

## 授权与验收边界

- 产品范围、数值、账号等级及平台限制按 [SCOPE](docs/SCOPE.md) 和已批准方案执行，有变更先获 Owner 授权。保持 [LICENSE](LICENSE) 及第三方素材各自的授权。
- 占用用户桌面输入、抢焦点或切前台前，说明应用、目的、开始时间与预计时长，取得当轮明确授权。窗口内仅一个执行者操作。用户收回控制、操作中或到期即停止输入和重试并告知已归还。
- 使用千星 MCP 前按 [工具链](docs/TOOLCHAIN.md) 读取技能和平台资源，保持 `MILIASTRA_ALLOW_LIVE_WRITE=0`，只写存档副本。正式发布由 Owner 确认并人工操作。
- 分别报告源码验证、候选写入与读回、官方导入、当前 ready 和设备实测。实机使用同一候选身份与当前日志，自动试玩显式开启 `clientScriptLog: true`。RC 按 [负载证据合同](docs/PLATFORM_LOAD.md) 逐项核对同候选官方容量、静态/动态负载、上传启动及手机实测，缺项保持待验。
