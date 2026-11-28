# Fork 预检（Push 自动触发）

保留 Fork A / Fork B 作为隔离开发和预检算力池；主仓 `develop` 继续负责 Required Checks、独立审查、Merge Queue 和发布。Fork 结果只作诊断，不替代正式 CI。

1. 从最新主仓 `develop` 建任务短分支，先用 `node scripts/test-affected.mjs --plan --base <BASE>` 估算影响。推送 Fork A 后，`quick-feedback.yml` 自动执行 advisory Quick（全部映射 Fast JS 与按 90 秒 Lua 调度估算筛选的子集；自动作业硬上限 10 分钟，不是整体 90 秒期限）；仅修改 Markdown 的推送不启动 Quick。
2. Quick 在运行时固定主仓 `develop` 的比较 BASE，记录 HEAD/BASE；新 Push 取消同分支旧运行。比较 BASE 可能随主仓推进，不冒充开发初始基线。
3. 只有核心路径、共享 CI 或覆盖未知等风险要求 Full 时，把同一候选推到 Fork B 的 `ci/full/<task>` 短分支；`quality.yml` 自动运行 hosted Full。不要对普通任务重复启动 Full。
   Fork B 的比较 BASE 记在 impact 作业摘要，并经输出传给首个 rules 分片的质量棘轮；该分片从固定主仓获取此精确 SHA，首次 Push 的全零 before 不作棘轮基线；其 Full checkout 收据仍按正式 Push 合同记录 `event.before`，不把两者混为同一基线。Fork A 自动 Quick 只写 advisory 摘要，不生成或上传完整 preflight 收据；integration 和延后的 Lua 仍需正式 Full。手动 `workflow_dispatch` 保留原完整 `--preflight`、30 分钟作业上限及记录实际选测 BASE 的收据和 artifact。
4. 验证后同步精确候选到主仓短分支，创建同仓 PR，继续正式 Quality/Licenses、独立 Review 与 Merge Queue Full。

```sh
git push fork-a HEAD:refs/heads/<task-branch>       # 自动 Quick
# 仅确有必要时：
git push fork-b HEAD:refs/heads/ci/full/<task-name>  # 自动 Full
```

**新任务分支必须从包含本配置的最新主仓 `develop` 创建**，因为 GitHub 使用被 Push 提交内的工作流定义。旧分支不强行改写历史，可按正常主仓 PR 的自动检查交付。手动 `workflow_dispatch` 只保留为诊断回退，不作为常规合并前置条件；不需要 Agent 拥有 `Actions: Write`。

固定仓库 ID：主1429751262、A1460097312、B1460133275。复用现有 hosted Runner 与同 ref concurrency。查重使用固定 HEAD/BASE/run/attempt；Fork 的 Quick/Full 不取代主仓 PR merge SHA、队列组合 SHA 和发布证据。官方导入及实体设备仍按对应验收合同独立验证。

失败先读准确 run/attempt 的失败步骤：代码冲突、断言失败、无 runner 的排队、权限拒绝和队列退出分别接续。记录作业创建到分配 runner 的等待与实际执行时长；未分配 runner 不计执行。原 HEAD/BASE 已成功或仍在途不重复派发，修复后沿原 PR 推进；入队/本地通过不记交付，实际合并后再用已有交付验证器核验并确认无独有工作才清理。正式候选先定稿版本和 CHANGELOG，再冻结做必要 Full/构建；官方和设备缺项保持未验，不前移为普通 PR 门槛。

## 跨 Agent 快速接入

分仓不是某个 Agent 的私有资源。任何已获项目和远端写入权限的 Agent，都用同一 Backlog、同一远端清单、自有任务短分支和原任务交接。**不需要等 Dot 派活。** Dot 或发版协调人负责看全局排队、协助分流和查重，不替换任务负责人。

1. **查重再领。** 看原任务、开放 PR 和在途运行；同一任务只保留一个写入负责人。按 `HEAD + 实际比较 BASE + 检查模式/平台 + 覆盖` 查重复，不把同名分支或较早 SHA 当现行结果。另一个 Agent 正在运行时，优先接没有重叠的小项或协助读日志。
2. **选择已有入口。** 低风险快测走 A，必要的高风险预检或可独立复现的失败走 B；按上面的短分支推送命令启动。发版时认准协调人记录的冻结 SHA。需互援时先在原交接写明待跑范围与负责人，不抢别人的 ref，不为使用闲置额度复制整套任务。
3. **看作业，不只看工作流颜色。** 记录可运行时间、分配 runner 时间和结束时间，区分排队、依赖、取消、跳过与真正失败。看到分仓比较基线换成 `develop` 导致提前停止，要说清哪些目标用例没跑，不记通过。无权限则在原任务写明无法执行的动作，请已有权限的协作者接手；不共享凭据、不改变分仓或主仓权限。
4. **回到原任务。** 复用原 Backlog 条目、现有 PR 或发布交接，填下方一行。只用主仓正式检查签核；同一原始 GIL 已有且校验过时不再发起相同打包，保留正式审计、归档和真实设备验收。

```text
任务/已有链接 | 负责人 | 仓库/分支 | 完整 HEAD / 实际 BASE | 模式/平台/覆盖 | run + attempt | 等待/执行 | 结果/下一步
```

**以后移植到别的项目时**，复用上面的认领、查重、接手和回执格式；换成目标项目批准的仓库/远端、触发器、容量检查点和正式门禁。不要复制本项目的仓库 ID、权限或 GIL 规则，也不要求其他项目一定是三仓。

## 发版期间的算力分流和接手

- **一个候选、一个协调人。** 发版协调人在现有发布 PR 或交接中记录完整候选 SHA、目标分支、负责人和运行链接。冻结后普通功能、文档、审计和下一版改动留在 Fork 或等发版后；只接实际阻塞项。必须换 SHA 时，先公告新候选，再按新 SHA 查重和启动正式检查，旧结果只留作诊断。
- **默认分流，不等主仓堵了再搬。** A 负责普通任务的 Quick；B 负责高风险 Full、失败分片复现及修复后的定向验证。主仓的优先级是冻结候选正式 Full、Licenses、正式 GIL 归档和必需集成证据。开测可并行走既有真机提测入口；正式归档仍等当前门禁。分仓任务用各自仓库的原生触发，不能靠主仓调用分仓工作流借用托管额度。正式运行中的分片不能迁移，也不在分仓复制同一整套 Full。
- **明确触发点。** 发布必需作业进入可运行状态后，若连续 10 分钟仍未分配 runner，协调人核对主仓和两个 Fork 的作业、同引用并发、权限及依赖；10 分钟是接手检查点，不是故障判定或重跑条件。已分 runner 但测试没结束、依赖未就绪、根本未触发，分别处理，不都算容量问题。发现 Fork 有余量时，优先把未提交的低优先级任务留在 A，把可独立复现的失败项交给 B；若暂时没有不重复的切片，保留空档。未经范围核对不取消运行；正式候选门禁不降级。
- **协作回执。** 在同一交接记 `任务 / HEAD / BASE / 平台或覆盖 / 负责人 / run + attempt / 等待与执行时长`。当班无人接手则由发版协调人对账；只在候选推进、出现真实阻塞或拿到有效结果时更新。发版复盘按这条记录看排队时长、迁出的独立工作和避免的重复运行，不以把额度跑满为目标。不增定时全量、额外平台或跨仓凭据。

统计复用 `scripts/ci-run-costs.mjs`，仅按需运行，见[基线](evidence/ci-preflight-20261117/history.md)。额外来源、SHA、历史或证据防护先针对已发生的故障做最小修复，再比较实际拦截、runner 时间和维护返工；没有收益证据就先保留诊断，不默认升级强制门禁。不为这条原则新增检查、报表平台或每 PR 填表。

用 GitHub REST 的原始运行对象和同一 attempt 的完整作业响应离线归类。可选日志目录按作业 ID 存放 GitHub 解码后的 `<job-id>.log` 文本。缺少日志时仍记录失败步骤和已知耗时。

```sh
node scripts/ci-run-costs.mjs --triage run.json jobs.json --logs logs > triage.json
```

报告记录测试位置、耗时和触发的已知错误签名，按历史源码身份、夹具输入、夹具超时及未归因用例归组。签名用于安排复现。作业汇总失败和未评估分片单独统计，真实业务缺陷需要精确源码的行为复现确认。使用 `/actions/runs/{run_id}/attempts/{attempt_number}/jobs` 采集作业，合并分页的 `jobs` 并保留 `total_count`。
