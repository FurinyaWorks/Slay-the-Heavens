# 工程检查与证据入口

平台负载采用[双层工程门禁](PLATFORM_LOAD.md)：`npm run check:platform-load` 检查共用生产打包清单、重复模块/模板/控件名、既有原生UI限制及固定基线增长，输出 `build/platform-load-daily.json`。实际构建收据保存生产 manifest，已有读回/hash/旧脚本清理继续生效。Quality 完整分片和生产相关 fast 路径执行，不启动游戏。正式 RC 另跑 `npm run verify:platform-load -- <最终candidate.json> <official-load.json>`；缺少同候选官方证据必须非零，普通PR不要求这些实测。20MB关卡与3MB服务器独立硬限，16MB内部预警；源码/GIL字节不能换算官方读数。

原生列表生命周期属于可执行门禁：共享`game_ui_fixture`将`alive`建模为只读，并拒绝对已销毁实例调用`GetChild/GetChildren`；Grid可分别模拟复用、刷新销毁及滚动回收。`check:native-ui-contract`实际覆盖卡组/遗物查看、校准项替换、关闭重开、滚动回收，并运行移除生产存活保护的负对照，必须捕获无效对象访问。不得用始终保留实例的替身替代销毁场景；历史渲染轨迹与当前原生生命周期分别验证。该门禁源于2026-10-29实机点卡组/遗物报错，不能将此前静态或读回成功当成实机可用。

Node UI 专项门禁覆盖入口与全部 abyss_node_ui_* 模块：每模块≤1000物理行、每函数（含嵌套/工厂）≤350物理行，全部提取职责复杂度≤15；报告为 build/node-ui-size.json 与 build/responsibility-complexity.json。固定 develop 旧新对照运行 node scripts/compare-node-ui.mjs，范围与证据见 [Node UI专项方案](plans/2026-10-28-node-ui-refactor.md)。


源码职责、生成物和测试目录先看[模块导航](ARCHITECTURE.md)；内容源与参考数据边界见[数据入口](../data/README.md)。本页保留历史实施证据，当前模块集合和诊断数量以配置及本轮报告为准。

`npm run check:engineering` 在同一调用内读取完整 Lua 源码并采集一次架构、Luacheck 告警和复杂度，供原有质量、架构、静态门禁共同使用；其后仍执行关键变异与原生 UI 合同。共享仅限本次进程内存，不读取磁盘旧报告作为通过依据。三个独立 CLI 仍重新采集；工具缺失、采集或任一门禁失败均非零，质量采集失败写入本轮失败报告。

GameUI入口及全部`abyss_game_ui_*`模块另受绝对门禁约束：入口文件≤250行、精确入口M.new完整跨度≤200行，其余函数含匿名嵌套≤150行，职责模块≤1000行；全部函数和初始化块CC≤15。复用同轮完整AST/W561测量并绑定当前源码摘要，独立静态入口也重新采集，结果为`build/game-ui-size.json`，同时保存在已有上传产物`ui-complexity.json`的gameUi字段；旧1004行构造器及11处CC热点是真实拒绝对照。CardActions完整模块同受CC15约束，不保留drain25例外。

历史回放使用原始完整来源及独立 oracle，不冻结当前夹具注册器的实现格式。[历史原始输入](../tests/fixtures/pr323-historical-fixtures.json.gz)保留来源提交、逐文件 SHA256 和 Git blob；原始目标源码另受完整集合身份及原正式 beforeSha 约束，运行时真实构建和执行，不缓存场景结果。历史矩阵在独立临时目录执行，当前真实 Host/manager 生命周期回归仍读取当前源码。现行实现维护不刷新原档，历史来源通过不能替代当前动态控件、输入和状态断言。

全库质量基线、指定模块行数、完整构造器/函数跨度、Luacheck复杂度、包含延迟导入的完整依赖环与静态告警增减见[质量验收机制](ENGINEERING_QUALITY.md)。`npm run check:quality`每次重新采集并核对全部函数测量；新增数值指标暂为report-only，不能据其退出码0宣称热点已治理。原工程硬门槛仍由以下检查执行。

渲染治理的绝对门槛已接入 `check:lua-static`：战斗主render≤10，完整战斗控制器及battle_*子视图/输入模块、商店UI与卡面展示的每个函数≤15。固定Luacheck测量，AST核对函数测量完整性，报告见build/ui-complexity.json。缺测量或缺入口会失败，不能只报告相对降幅。实际实现、当前验证范围和历史纠正见[TASK-74](backlog-details/TASK-74.md)；完成声明遵循[项目协作](../AGENTS.md)的本轮证据要求。

本轮以 develop `20c6815e` 复核剩余指定职责：effects.apply、combat的queuedHandlers.effect、Act2 choose、角色文案fragments、feedback.step/paint、node.render、game.refresh。`check:lua-static` 对这些入口、其嵌套函数及本轮提取helper执行≤15门槛，输出 `build/responsibility-complexity.json`；每个AST函数与固定工具测量逐一对应，拒绝缺测、坐标移位、重复和未知格式。未触及的既有热点继续报告，不把该范围扩为全库统一上限。新增职责模块沿用对应前缀并纳入架构分类。

前次架构减负以 develop `d8a26227` 为基线：实际扫描116个Lua源码模块，静态基线113条、延迟导入例外19项。战斗手牌子视图与商店四类商品/服务渲染已有独立边界；完整Windows回归使用隔离VM分片，片内保持串行。具体指标、原回归和交付状态见[TASK-74](backlog-details/TASK-74.md)；机器结果以 `config/architecture.json`、`config/luacheck-baseline.json`及生成报告为准。[TASK-68](backlog-details/task-68.md)和下文的早期计数均为当时冻结切片，不作为当前数值。

日常小改动使用 `npm run test:fast -- --base origin/develop` 或 `npm run test:related -- --base origin/develop`；先加 `--plan`查看选择。也可用 `--files scripts/deck-ui-layout.mjs` 指定待验证的改动集合。本地 fast 与自动 PR advisory 共用有界的 JS、Lua 选集，直接改动的 Lua 夹具优先；相关层执行完整受影响回归。未知、删除、数据/配置/构建基础设施改动仍要求完整 `npm run check`，fast 只报告可映射部分及延期原因。零测试、部分成功均不能代替完整 Quality，覆盖层次与选择理由见 [CI-FAST](CI-FAST.md)。

**多代理认领协调：** 自主接单前按[任务执行](TASK_EXECUTION.md)核查 Backlog、依赖、明确审批和所有开放 PR/工作树，再运行 `npm run task:pick -- TASK-编号`。不按 Sprint 日期或 M7/M8/M9 顺序限制领取；HOLD 处理身份、状态或具体审批原因，ALLOW 后仍核对认领和文件所有权。TASK-85/96/97/62/64 的独立批准要求保留，已合 #491 的离线成果不授权新实施。任务状态变更只能经 Backlog CLI，独立深审/精确 HEAD CI 后才能合并。

多代理先划分源码写入范围；同一工作树的生成目录与工程报告由一个执行者写入，独立树的产物不互借。按可用内存、CPU和已有作业安排昂贵验证，复用现有分片与 worker；每个代理不各跑一轮完整检查。主控按小批验证、复审并集成，本批收口后再领下一批，避免未合切片累积；独立只读评审可与 CI 并行。保留失败、取消及重跑耗时，不恢复全局任务锁。

日常CI使用GitHub-hosted Windows和Ubuntu；受信分支显式`local-special`诊断入口保留，具体调度以[Quality工作流](../.github/workflows/quality.yml)为准。旧self-hosted常规调度与Remote Task Claim强制锁已按用户明确批准停用。保留Backlog、独立工作树、PR审查、精确head与全部完整质量门禁。GitHub原生每分支concurrency取消过时运行，不再把不同PR排在本机串行队列。Windows与Ubuntu覆盖不同文件系统语义；PR merge SHA和squash后的develop SHA也分别核对，不复用旧SHA的绿灯。

本轮参照 `Slay_the_Abyss_Engineering_Upgrade_2026-10-23.zip`，在 `origin/develop@cd8ceae` 上实施。保留现有玩法、PR19视觉基线、Fengari执行入口、Backlog和Quality。TASK-33/34/35维护执行状态；真实玩家关口仍在原任务。

| 改动 | 读取与执行 | 可证明的范围 |
|---|---|---|
| 日常代码 | `npm ci --ignore-scripts`；首次 `npm run setup:lua-static`；`npm run check` | 当前Node/Lua/Python回归及工程门禁 |
| Lua模块依赖 | `config/architecture.json`；`npm run check:architecture` | 作用域AST、函数内require、禁止层次、循环、未知/动态加载；`build/architecture.json` |
| Lua基础静态检查 | `.luacheckrc`；`npm run check:lua-static` | 固定Luacheck 1.2.0和二进制hash；新增诊断失败；声明范围内复杂度执行硬门槛，其余保留报告 |
| 关键测试敏感性 | `config/critical-mutations.json`；`npm run check:test-strength` | 四类指定语义退化，临时副本，指定断言来源；不是全库mutation score |
| 副本候选 | `node scripts/build-native-candidate.mjs <base.gil> [build/candidates]` | 重新生成数据/UI、当前源码及`generatedRuntimeModules`声明的生成运行时模块完整检查、输入与最终GIL真实摘要 |
| 启动取证 | 上一命令加 `--playtest`（仅客户端可用且允许占用输入时） | 实际MCP run/request、原始日志解码、本构建启动标记和ready；不等于完整游戏 |
| UI实机验收 | `npm run verify:ui -- <候选目录/candidate.gil>` | 同一候选/启动/截图、当前批准稿版本、完整关键项及明确人审范围 |
| 合并证据 | `npm run verify:delivery -- <PR> <独立审查.json>`；纯说明文档 `--low-risk-docs` | 当前head/base、测试merge parents、当前attempt全部必需作业；不自动合并 |
| 合入后复核 | `npm run verify:delivery -- <PR> <预审evidence.json> --merged` | 实际squash SHA、单父提交、源码树及该提交在目标分支的完整push Quality；不借PR绿灯 |

需要 Python 3 和 Pillow 12.3.0，可用 `ABYSS_PYTHON` 指定已有解释器。工具缺失、下载/hash错误、解析失败、超时或空报告一律非零，不静默跳过。Luacheck安装只写仓库 `build/tools/`，不改全局工具链；来源与两个平台hash在 `config/lua-tools.json`。

## 候选身份

每轮生成UUID子目录，源存档先复制再交MCP，`MILIASTRA_ALLOW_LIVE_WRITE=0`。历史目录中的同名清单不会被覆盖。新目录重新构建运行时生成模块，正式打包集合见[候选构建器](../scripts/build-native-candidate.mjs)的`generatedRuntimeModules`，不扫描共享build目录；测试fixture和残留Lua不能混入。成功收据包含源提交、脏工作树状态、逐文件输入/产物摘要、payloadDigest、最终candidate.gil摘要、实际checked集合和逐条MCP告警。未审查告警保留 `not_run`，不批量忽略。

`payloadDigest`覆盖实际源码、内容、主题、构建脚本、渲染器、依赖与模块策略；仅文档提交不迫使无关候选重建。每个实际输入仍记录内容摘要。收据自身不参与自身hash，构建ID通过打包后的入口输出 `ABYSS_BUILD <id>` 关联日志，避免GIL自身hash的循环引用。

`officialImport` / `playtest` 保持 `not_run`，实际启动证据另存 `startup-evidence.json`；静态成功不提升产品任务状态。失败轮保留 `failure.json` 和MCP逐次响应。当前dirty候选的收据会明确标记，不能报告为某个干净HEAD已验收。

## 候选 Feature Flag

`--feature=<登记名称>=true|false` 复用 Node 构建选项、生成的 `abyss_ui_profile.lua` 和候选收据。临时功能在 [候选开关表](../scripts/ui-profile.mjs)登记负责人、移除条件、构建和收据的适用范围。新开关默认关闭，禁止在正式 RC 启用。开关决定候选内的策略，运行中不读远程配置。历史选项和已经冻结的收据沿用原身份。

渐进重构先让新旧实现共享调用契约，在现有工厂处选实现。原生页面生命周期使用现有 `refreshPageVisibility`。`--feature=native-page-lifecycle=true` 只在显式限定的实验配置启用原生页可见性。关闭时沿用旧策略。`build-ui.mjs` 和 `build-native-candidate.mjs` 支持显式 `false`，可用于配对对照。音频入口的 `--official-assets` 沿用既有生命周期策略。

合入前用同一基线分别验证开关两种构建、生成模块和收据身份、初始化、资源与状态变化。原生页面的复验依次运行 `npm run build:data`、`npm run build:ui` 和 `node --test tests/native-page-lifecycle.test.mjs`。涉及容量或设备的变化还须按本页现行验收取证。满足移除条件后沿原任务删除开关、旧分支与过渡测试。实验被否决时移除实验分支和开关。

## 日志与UI迁移

启动验证要求调用方传入真实start返回的runId/runDir、调用时刻、实际mapPath摘要与buildId，核对MCP落盘request。以当前MCP `inspectDebugLog` 实际重解码原始GIA；空/旧/跨目录文件、错run/候选、与原始文件不符的prints、错构建标记或runtime fault拒绝。解码适配只覆盖已观察格式，不为文件来源真实性提供密码学保证。

UI记录使用 `schemas/ui-acceptance.schema.json`：根部提供buildId/runId/payloadDigest/baselineRevision；逐屏提供候选身份、批准稿图片与截图的相对路径/真实hash、reviewer、合法reviewedAt、reviewScope、实际operations、空unresolved及全部关键checks。同图复用须在涉及各屏说明共享原因。截图相对真实run目录，批准稿相对 `docs/design/`；两者都必须可被Pillow解码。baselineRevision由当前UI_DESIGN、prototype及screens文件内容计算。

战斗关键HUD另设`battleHud`画面评审（能量球品质、零能量/溢出、V25层级）；`battleMobileAim`必须为实际phone/touch并记录型号，逐项检查多敌人、自由瞄准、锁定、换目标、取消、箭头方向和可见尖端终点。所有正式画面记录显式声明`captureSource: official-client`；Simulator证据另存，不通过此验收。控件属性和Lua回归只验证结构/行为，不能宣布画质或手机通过。

CLI从候选旁收据和启动证据取得预期身份，重验原始日志与当前payload；不从待验UI表中自取可信runId。历史 `ui-acceptance.json` 的partial/failed/pending保持原状，未补默认PASS。有效文件、结构和hash也不能证明画面好看或操作正确，人审仍须实际比较并操作。

## 静态基线与测试证明

现有Luacheck诊断逐条保存在[静态基线](../config/luacheck-baseline.json)，数量和对应源码以当前文件及`build/lua-static.json`为准。早期TASK-34在cd8ceae记录47条，PR75/77同步至ed39f46后记录53条，均为历史快照。无未定义全局/语法豁免。新同类诊断也失败；修改相关代码时复核并缩减具体基线，不能通配忽略。代码行移动可能需要审核后更新对应条目。全库复杂度有独立诊断报告；渲染与指定职责的硬门槛见本文开头和[检查器](../scripts/check-lua-static.mjs)，不声称全部热点均已治理。

四个算子保护：出牌失败回滚、满手抽牌边界、节点视图隔离、药水结算失败不提交。每轮正常基线→唯一合法变异→指定测试文件/断言行/标记→原文件hash复核；报告区分survived、invalid_mutant、infrastructure_error、timeout、inconclusive。产品抛出“assertion failed”文本不能冒充测试kill。

## CI与交付

正式检查、独立评审、应急批准和合并证据按 [CI](CI.md#pr-自动合并准入) 核对。关键重构、游戏逻辑与跨模块组合需深审状态边界、契约和 CI 盲区。纯说明文档的免独立审查范围由 [交付验证器](../scripts/verify-delivery.mjs) 的 `--low-risk-docs` 判定；该交付验证路径不免除 Ruleset 的 `independent-review` 或 `merge:auto` 的准入要求。

`pr_passed` 表示已验 PR 组合。合后用 `verify:delivery --merged` 在实际 squash、源码树、当前合入提交的 push Quality 及 Backlog 核实后才取得 `merged_passed`。历史证据使用原收据合同，完整版本记录见[历史工程说明](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/2ec45b9e52c870badc4d4888f6243a30556eecb4/docs/ENGINEERING.md#ci与交付)。

## 尚未取得的证据

本轮不启动原神、不占用键鼠；官方导入、玩家完整路径、截图体验与投稿仍独立验收。StrykerJS、原生LuaCov和JS全文件覆盖的报告试点不作为本轮必需门禁；没有执行结果就不填覆盖数字。LuaCov重试需隔离原生Lua5.3、LuaRocks/datafile及与Fengari的数值/退出行为对照，不能把Fengari VM的JS覆盖率称为Lua覆盖率。
