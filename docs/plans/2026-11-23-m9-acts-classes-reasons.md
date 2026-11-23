# M9｜初代四职业与第三幕开发架构规约（REASONS Canvas）

日期：2026-11-23；目标：`develop`；Owner 本轮批准原版四职业与第三幕源码开发，不授权立即公开、修改 v2.0.0 或跳过容量/真机验收。关联：TASK-59、TASK-61、TASK-62、TASK-64、TASK-105；原版职业切片由 TASK-59.4/59.5/59.6 追踪。**TASK-97 是胡桃/阿蕾奇诺/芙宁娜 V4 的批量开放，不是 Silent/Defect/Watcher。**

## 1. R — Requirements（边界与 DoD）

问题：岩系旅行者（Ironclad）之外，Silent/Defect/Watcher 三套《杀戮尖塔1》职业代码存在于实验资料及 Lua 中，却没有从选角、起始牌组、遗物、战斗、奖励、商店到跨幕自然通关的公开验收；第三幕、隐藏第四幕已有大量代码但仍未证明整局正常可玩。M8 还在打磨，不应阻断 M9 的独立代码切片。

Scope In：
- 在 `develop` 接续现有 STS1 四职业与第三幕实现；优先核对真正缺口，再补最小行为和正式 UI/构建装配。
- 保留 Ironclad 首发与两幕合同；新增三职业首先在显式开发配置可玩，再逐个达到公开准入。
- 第三幕源码由 TASK-62.1 接续。TASK-62 保留 TASK-61 和 TASK-62.1 最终验收依赖。TASK-64 暂缓，等待跨局存档、历史资格及解锁具备实际平台能力并重新审批。
- 同 M8 并行，不等 M8 所有体验 Bug 做完再开始写 M9。

Scope Out：
- 不动冻结 `release/v2.0.0`、master、正式两幕白名单，未验收不得发布。
- 不把 STS1 职业与胡桃/阿蕾奇诺/芙宁娜/雷电将军 V4 混池、混数值、混角色资源；不加元素反应或编造技能。
- 不重写已有核心 Run/Combat、四幕地图或卡池，不新增跨局存档后端，不把从未存在的原版事件强行补齐为伪实现。
- 暂不批量打开 TASK-97 原创职业；其正式量产依赖 TASK-96 与 TASK-105 容量 GO 仍有效。

DoD（Given / When / Then）：
1. Given STS1 四职业，When 由真实 `Run.new/Combat.play` 与生产装配加载，Then 每职源注册 75 张职业牌的基础与升级能力、可获得性、起始牌组、起始遗物和主要流派均经过有来源的独立测试，列出缺项，不能只看 Capability 返回真。
2. Given Silent、Defect、Watcher，When 在显式 `full-source` 选角并进入第一幕，Then 卡池/遗物/技能状态与 UI 一致，胜败、随机种子、选牌、升级、商店、跨幕与资源回滚正确；公开两幕候选默认仍只显示岩系旅行者。
3. Given 第三幕 Floor 35–51，When 沿真实章节迁移进入、打普通/精英/Boss、事件和结局，Then 地图、资格、随机流、三 Boss 及普通结局符合项目锁定的 STS1 规则；第三幕不生成 Boss 宝箱。
4. Given TASK-64 暂缓，When 执行领取检查，Then Owner 审批门禁保持 HOLD；现有终幕代码作为历史实现保留。
5. Given 发布候选，When 做当前正式白名单及平台容量/性能回归，Then 未验的第三四幕和新职业不会进入 Production，且现有 v2.0.0 路径无差异；公开开启必须另外通过准入/Owner 审核。
6. Given 完整四职业与章节声明，When 验收，Then 明确分开“离线受控测试”“同一局自然通关”“官方导入”“PC/安卓实机”；缺任一原 AC 证据不勾选。

## 2. E — Entities（实体与状态归属）

| 核心实体 | 唯一拥有者 | 本次允许变化 |
| --- | --- | --- |
| CharacterProfile、职业白名单 | `abyss_character_profiles`、`abyss_character_select`、`abyss_run_admission` | 只能加显式实验/未来准入，不穿透比赛 Production |
| CardDefinition/Pool/Upgrade | `abyss_class_card_pools` 与各职业定义 | 按锁定 STS1 来源校验 75×4，不改已冻结 V4 |
| Run（牌堆、金币、遗物、随机流、章节） | `abyss_run` 及现有 transaction owner | 唯一可修改本局资源；UI 只发命令 |
| Combat（战斗状态、球/姿态、敌人意图） | `abyss_combat` / Actor/各职业机制模块 | 不复制一套状态、不让 UI 私自结算 |
| Act/Map/Encounter/Event/Ending | `abyss_acts`、地图/事件/遭遇既有模块 | 保持 floor 与源队列、资格和 RNG 边界 |
| Key/History/True Ending | 现有三钥匙、历史与终幕命令 owner | 无合法证据不能绕开平台持久化限制 |
| Build/Flag/Candidate | 现有生成脚本与 `candidate.json` | 实验默认关闭，正式候选身份独立 |

## 3. A — Approach（技术方案与 Trade-off）

**核实再接线、分片独立验证**。当前已存在：
- `src/lua/abyss_character_profiles.lua` 直接配置 `silent`、`defect`、`watcher`，并加载职业 final 模块；`src/lua/abyss_character_select.lua` 有 `M.elements` 和 `full-source` profile；`abyss_run.lua` 对四原版职业有专属入口。
- `src/lua/abyss_acts.lua` 已有 1–55 层四幕坐标；`abyss_act3_{ai,bosses,enemies,events}.lua` 与 `abyss_act4_enemies.lua` 存在。
- TASK-62 的第三幕敌人、三 Boss 和事件桥曾合入；TASK-64 的三钥匙、心脏、盾矛逻辑曾合入，但自然全局与真机仍待证明。
- 2026-10-27 历史账本曾记录四职业各 75 的 Capability，但它不是当前 HEAD 的全部逐牌行为/可玩/正式发布证明；以今日实际构建重新审计。

Trade-off：先做开发白名单的可玩闭环，不做昂贵的全职业角色高清立绘或非必要新动效；保留各角色专属最小可读 UI，沿用 M8 已批准的按钮、卡框、地图和事件表现。采用固定 STS1 来源版本和现有 Lua 自研实现，不照搬反编译 Java 结构。

## 4. S — Structure（目录与依赖）

**只在现有业务域小改**：
- 职业入口：`src/lua/abyss_character_profiles.lua`、`abyss_character_select.lua`、`abyss_run_card_catalog.lua`、`abyss_run_admission.lua`。
- 牌效：`src/lua/abyss_silent*.lua`、`abyss_defect*.lua`、`abyss_watcher*.lua`；配置核对 `abyss_class_card_pools.lua`，共享 `abyss_card_capability.lua`。
- 章节：`abyss_acts.lua`、`abyss_act3_*.lua`、`abyss_act4_enemies.lua`、现有 key/history/ending/encounter 模块与对应 Lua tests。
- 文档证据：`docs/rules/CROSS_ACT.md`、`docs/CLASS_CARD_HANDOFF.md`、`docs/ORIGINAL_V4.md`、各原任务附件及 `docs/evidence/`。
- **依赖方向**：静态职业/章节数据 → 现有 Run/Combat 命令 → UI 只读投影；禁止 UI 直接变更键、RNG、章节或战斗结果；禁止跨职业战斗状态相互引用。

## 5. O — Operations（Agent 可领取切片，按依赖执行）

### 事实审计与切片索引
| 后续工作 | 现有任务 | 起点与接续 |
| --- | --- | --- |
| Ironclad 与当前正式白名单 | TASK-59、TASK-59.3、TASK-111 | #299 `7a87de3aec83281221a3680b0d02aeb5b41aa2ba`，#812 `c186c1dce398727440c25d9db36022c27ed771a8`。在同一官方候选验收两幕与选角。 |
| Silent / Defect / Watcher | TASK-59.4 / 59.5 / 59.6 | #238 `965616d505b1728727575e3d8fd979ed66190003`。当前显式开发配置进入实际选角和战斗，按职业组件复验剩余 AC。 |
| 第三幕源码 / 最终验收 | TASK-62.1 / TASK-62 | #213 `e3a9fe2c24c8dfa18e90f526e9b3bf74d8281342`、#252 `0c07e3dce38ef9d7ce07e90894ac36b57465793d`。TASK-62.1 独立开发；TASK-62 保留 TASK-61 及 TASK-62.1 完成依赖。 |
| 第四幕 | TASK-64 | #262 `53581f43072f56f59f443869bd270efe257dae12` 的三钥匙及终幕源码已合。平台存档、历史资格、解锁和 Owner 复审是恢复条件。 |
| M8 单职业美术 / M9 多职业卡图 | TASK-25、TASK-10.1.2 / TASK-25.8 | M8 先验岩旅候选卡图装配、容量、可读性；M9 量产依赖该结果。职业技能可独立开发。 |
| 容量与最终集成 | TASK-105、TASK-61/62、TASK-38/42 | #641 固定来源 `2c559cd4a1356d168f01c8601de8b4ece7c0f76f` 关闭未合；#683 `2f0177cce40ca05aebcc2c0fd65d313e85ccd6e2` 承接离线重放。容量 Agent 先完成同候选 B0/B1/B2 官方容量，再记录 PC/实体手机和 GO/NO-GO。 |
| 原创 V4 | TASK-85/96/97 | 继续独立审批。TASK-97 保留 TASK-96 和 TASK-105 容量 GO。 |

### Silent/Defect/Watcher 逐职业运行时接入
- 先在当前 `develop` 真实 `Run.new` 载入并复算 75 张×三职业的基础/升级、初始卡组、职业遗物、生成池、可获得与逐牌执行。以正反例标注缺口，别默认历史 75/75 等于通过。
- 每个职业单独 PR：选角 → 首战 → 奖励/商店/升级 → 第二战 → 跨幕，验证球位/Focus、毒/弃牌、姿态/占卜/真言等已有机制的源规则；不改 Ironclad 与 V4 冻结数据。
- 如已完整可用，则只补生产接线、平台 UI 和自动回归；不重复制造 75 张卡。

### 第三幕恢复真实自然冒险（TASK-62.1）
- 固定锁定 STS1 来源及当前 `develop` 构建；覆盖 35–51 层、常规/精英、七普通事件及神龛资格、Awakened One、Time Eater、Donu/Deca、奖励链、无 Boss 宝箱、普通结局。
- 先验真实 run 命令/地图迁移，再补遗漏源行为或 UI；独立测试对事件重入、RNG、死亡、取消、单次结算和胜败状态提供负控。

### 三幕集成与候选验证

- 四职业各跑可重放的自然路线及异常边界（所需脚本测试、规则来源、随机种子、事件资格、合法构筑）；章节、角色、失败/重开、UI 交互不互相泄漏。
- `full-source` 与当前 `competition-two-act` 分别构建并验证：关闭时不得额外初始化或公开后续角色/章节；用同一 source SHA 的候选记录容量/性能。
- 官方平台、实体 PC/安卓设备验证按现有发布操作单执行；只有全部相应 AC 合格才请求独立的公开内容准入。**不阻塞 v2.0.0 当前修复/发布线。**

所有切片优先 200–400 生产行、≤10 生产文件，先定向 RED/GREEN、再独审/Required Checks/Merge Queue；`Backlog: TASK-X=continue`，未完整验收不要 `done`。不同 Agent 不同时修改相同共享 Run/Act/构建文件；共享所有权由主协调者明确。

## 6. N — Norms（命名、错误和可观测性）

- 代码沿用既有 `abyss_*` 与稳定 STS1 card/enemy ID，用户可见中文命名沿项目已批准的原神对照，不能随意创造新名称。
- 失败命令必须保持事务原子：无效选角、缺钥匙、事件过期、失败/重入均不扣资源、不推进 RNG、不泄漏老 UI 控件。
- 报告分别写明源码 SHA、固定源版本、实际脚本命令、通过/失败断言、目标运行环境、未得到的平台和设备证据。模拟器、受控怪物不等于自然完整冒险。

## 7. S — Safeguards（架构红线）

- 不调整两幕 Production 白名单、不修改当前 Release/master、不强行扩容已冻结候选；新内容代码默认实验可用、对外关闭。
- 保持现有 SSOT、RNG、事务回滚和无重复奖励；Lua 纯逻辑脱离 UI 测试，页面/输入另测，跨幕集成与平台设备最后验证。
- 继续执行既有 check:quality、check:architecture、check:lua-static、verify:backlog、独立 review、Full CI 与原生 Merge Queue；不得为速度删除测试、改弱断言或降低门禁。
- 20MB 官方关卡、3MB 服务端、16MB 内部预警仍按同候选取证；TASK-105 对 **V4 批量开放** 的正式容量 GO 不因本次批准自动通过。原版职业和第三幕公开也须单独验证容量与设备。
- 本轮 develop 开发范围为 STS1 原版四职业与第三幕。第四幕保留暂停。
