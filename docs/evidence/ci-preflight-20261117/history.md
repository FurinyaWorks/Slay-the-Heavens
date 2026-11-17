# CI 治理基线（2026-11-17 只读采集）

范围：`FurinyaWorks/Slay-the-Heavens`，运行创建时间 **2026-11-01 00:00:00–2026-11-16 23:59:59 UTC**。Actions API 按 workflow 分页查询，避免全部运行搜索的 1000 条上限；结论是采集时快照，不改写历史失败。当前窗口未全部结束，不将排队项计作成功。

| 口径 | 实测 |
| --- | --- |
| Quality PR 运行 | 773；成功145、失败146、取消357、跳过114、排队11 |
| Quality 全事件 | 922：PR773、Merge Queue60、push87、dispatch2 |
| Quick 全事件 | 703：成功569、失败44、取消90 |
| Quality PR 失败且同 API head SHA 有 Quick 成功 | 127/146（87.0%） |
| 相同仓库/workflow/API head SHA/event/branch 的额外 PR 运行 | 73/773（9.44%）；仅是重复候选，不等于浪费 |
| 可证明可复用的重复执行率 | 未知：历史没有完整 tested/base/config/scope/platform 身份，不能将零条认证证据写成零浪费 |
| Quality PR 首次通过率 | 129/255（50.59%）；每 SHA/context 首次 run 且 attempt=1，排除取消、跳过、排队及已重跑后丢失首次结论者445组 |
| Quality PR runner 消耗 | 至少195,784.33分钟；773/773运行已取作业，13个已分配 runner 的作业缺完整结束时间，故仍为下界 |
| Quality push / Queue runner 消耗 | 30,723.77 / 26,735.22分钟；这两个事件作业计时完整，不把必要集成计入浪费 |
| 合并耗时 | 窗口实际合并87个 PR，创建→合并中位112.52分钟、P90 529.85分钟 |

773/146/357 与输入基线完全对上：它采用 **PR 事件**分母；不能与922个全事件混算。原“60.5%分支时间窗重复触发”未提供窗口定义，不能直接解释为60.5%测试浪费。正常新 SHA、比较基线变化、队列组合及发布最终验收均有独立价值。

## Quick 漏检类型

逐一读取127个匹配失败 run 的真实失败步骤，排除聚合器 `Require every…` / `Publish exact…` 造成的后继红灯与失败后的 artifact 上传；下列类别可重叠，不是互斥归因：

| 实际失败步骤 | 涉及 PR run 数 |
| --- | ---: |
| JavaScript regression shard（含 POSIX） | 88（69.3%） |
| Lua regression shard | 21（16.5%） |
| Check feature branch history | 13 |
| setup:lua-static | 10 |
| Resolve exact comparison base | 8 |
| Lua CC/SCC ratchet | 5 |
| verify:backlog | 3 |
| pip/npm/checkout 基础设施 | 2 |
| PR metadata / comparison blobs / fresh VM checkout / previous-status invalidation | 各1 |

因此优先补完整受影响 JS/Lua 与便宜的语法、任务、质量检查；网络/权限故障单列，不能声称扩大选测可消除这些故障。高风险未知影响需要 Full 诊断，不能把零测试绿灯当准入。

三份通过 GitHub connector 下载并核对的真实日志例：

- [run43833278706/job133229941326](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43833278706/job/133229941326)：`tests/defect-final-source-epoch.test.mjs:171` 完整 owner 列表缺少新 `abyss_monster_intent_particle_view.lua`，deepStrictEqual 失败。这是源码身份闭包遗漏，不是生产玩法断言可删。
- [run43787265064/job133067791757](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43787265064/job/133067791757)：真实 Lua worker `tests/lua/modal_loading_frames.lua:36` 失败，Windows Lua 分片退出1。
- [run43674915280/job132692966698](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43674915280/job/132692966698)：`verify:backlog` 明确拒绝 TASK-109 / TASK-110 未列入 M8 排期。

**SHA 边界实证**：第一例 API `head_sha=dc74ab23…`，日志真实 checkout 为 `05cfcd22eae375a9ea8f85b944832d93e3e0da12`（PR706 merge ref）。同 API head SHA 的绿红配对只说明覆盖不足，不能证明实际测试树相同。Fork head、PR merge commit、Merge Queue group 必须分别绑定 checkout 收据，Fork绿灯不替代正式集成。

## 重复验证方式

当前工具只读且按需执行，没有 schedule、dispatch、取消、规则修改或新调度器：

```bash
node scripts/ci-governance-metrics.mjs --repo FurinyaWorks/Slay-the-Heavens --since 2026-11-01 --until 2026-11-16 --jobs --prs --raw-output /tmp/ci-raw.json --output /tmp/ci-report.json
node --test tests/ci-governance-metrics.test.mjs
node scripts/ci-governance-metrics.mjs --input docs/evidence/ci-preflight-20261117/baseline-input.json.gz --output /tmp/ci-replayed.json
```

附件 [baseline-input.json.gz](baseline-input.json.gz)（505,980字节，SHA256 `2b696d359c67e2ace3c6e12199891d37548238449f56f070c87421432496c829`）保留本轮完整 run 列表、Quality922次运行的全部作业计时/runner分配、失败步骤、87个合并PR及127个错配分类；是API必要列投影，省去重复成功步骤/日志，不冒充未采集的Quick作业消耗。离线重算 [baseline-report.json](baseline-report.json) 不需网络。

后续以相同长度 UTC 窗口重采主仓库与 Fork A/B，分别比较 `byWorkflowEvent`，避免以运行 wall time 冒充 runner 消耗。消耗只累加实际已分配 runner 的 job started/completed 时长，保留已取消作业耗时；GitHub对未分配runner的取消作业也填入时间戳，该排队等待计零。缺页、缺结束时间与未采集作业显式显示不完整，不能用于账单金额声明。首次通过率同时报告排除数；合并耗时取实际 merged_at，不拿排队时间代替。

收据补齐后可在离线原始输入的 `evidence[runId]` 提供 `tested`、`base`、`configDigest`、`scope`、`platforms`，工具才认证同身份的额外成功执行；此前成功必须早于新运行创建，最新失败会使旧成功失效。身份变化、运行重叠、不同平台、不同事件或队列组合均不算可复用。该指标只做治理统计，不修改任何 Required Check。

`crossRepositoryReusableExtraRuns` 仅对 `workflow_dispatch` 诊断，按 tested/base/config/scope/platform 身份统计跨Fork重复成功，不把不同仓库名或分支名当作新测试配置；PR、push及队列验收事件不参与该指标，正式集成仍须独立执行，统计上的诊断重叠不授权跨信任域替代检查。
