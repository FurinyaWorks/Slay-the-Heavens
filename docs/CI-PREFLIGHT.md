# Fork 先排错，主仓库后验收

接续 #712 / TASK-88.1.1。A/B 提供独立 runner 并发：不同任务并行，同一候选默认只用一个 Fork。

1. 在 Fork 分支开发；读取目标分支当前完整 BASE SHA。先不要推主仓库已有 PR head，也不要先创建正式 PR。
2. 先用现有 `node scripts/test-affected.mjs --plan --base <BASE>` 检查完整选集；共享 CI/未知影响直接选择一个 Fork Full，避免先跑无效 Quick。检查 **两个 Fork** 同 HEAD 的 Actions：相同工作流、HEAD（包含全部测试配置）、BASE 已成功则复用；正在运行则异步交接，不再 dispatch。失败须排错，新提交正常重测。新 BASE、配置变化、取消/失败均不算可复用成功。
3. A 优先执行已有 `quick-feedback.yml`，`base_sha` 填准确 BASE；完整 JS（含 integration）与 Lua 受影响集合，无90秒裁剪。未知输入或零覆盖失败，按提示交给 B 执行已有 `quality.yml` Full，仍传 `base_sha`。不得另跑一次 A Full 再跑 B Full；仅跨平台、共享 CI/未知影响或明确故障诊断需要 Full。也可由 A 互援 Full。
4. 成功后将 **原提交** 快进到主仓库分支，再提 PR / 更新已有 PR。不得 squash/cherry-pick 后沿用旧 SHA 证据。主仓库 admission 按固定 Fork ID、API 实际 head_sha、workflow path、run-name 中 BASE、完成结论及先后时间核验；缺证据立即失败，不自动启动 Fork 或测试矩阵。已有抢跑 PR：先补预检，再重跑原 Quality / Licenses 的失败作业，或正常推送新候选。每次新提交或基线变化重新验证。
5. Release/hotfix→master 继续使用既有冻结 Full 发布准入，不额外强制 Fork Full；新门禁用于开发/集成 PR。主仓库正式 Required Checks、独审、Merge Queue 组合 Full、develop push 验证及 Release 冻结 Full 照常执行。Fork 成功只表示准入，不能代替正式验收。Release 日常 Fast / 冻结 Full 继续由 #677/#707 接续，本变更不重写该策略。

原生入口（repo 名称应按固定 ID 读回）：

```sh
gh workflow run quick-feedback.yml --repo FurinyaDev/Slay-the-Heavens-Fork-A --ref <branch> -f base_sha=<40位BASE>
# 仅未知影响/明确风险要求 Full 时使用；不是第二次默认验证
gh workflow run quality.yml --repo v5g95m7t8m-max/Slay-the-Heavens-Fork-B --ref <branch> -f base_sha=<40位BASE>
```

固定 ID：主仓库1429751262、A1460097312、B1460133275。Fork checkout SHA 与主仓库 PR merge SHA 不同：门禁匹配 PR **head**；正式 CI 仍测试 GitHub merge SHA。精确相同 head 也绑定 workflow、selector、依赖与测试配置；不同 SHA 不作跨提交缓存。现有 `ci-checkout.json` 留作可检查的实际 checkout 收据，门禁使用 GitHub run 元数据而非 PR 自填声明。仅接受第一次成功 attempt；需要重新运行的预检请正常修复/推新候选，避免 mutable rerun 时间歧义。

平台边界：GitHub 无法阻止 `pull_request` 事件创建轻量 admission run，因此保证的是 **正式测试作业先等预检**；失败 gate 本身仍会消耗少量时间。Licenses 使用相同门禁，Quick 不再随主仓库 PR 自动重复运行。只读令牌跨公开 Fork API 如被平台限制会明确失败，不能视为通过；不得改为 `pull_request_target` 执行不可信代码或提供写 token。无 Fork Actions 权限时由已有授权维护者在 Fork 调度，不豁免门禁。

Concurrency 仅限单仓库，不能原子锁住 A/B：Agent 必须复用现有 Backlog 认领、两个仓库 run 查询及单次 dispatch；门禁不会自动 dispatch，因此不引入扇出循环。过时 ref 继续由原生 concurrency 取消。不同 head、base、平台配置、Merge Queue 组合和正式验收不是浪费；双 Fork 同候选同配置、无输入变化的重复成功 dispatch 才是应消除项。人工 rerun 仍可造成重复，此边界不宣称已由 GitHub 全局去重。

部署和量化证据见 [本轮记录](evidence/ci-preflight-20261117/PLAN.md) 与同目录 history.md。按需统计脚本从 GitHub API 导出原始运行、job 与 PR；同窗口、同配置比较重复候选率、实际 runner minutes、首次通过率和创建→合并 P50/P90。不定时轮询、不为了刷指标重跑旧 SHA。首次取得至少20个真实候选后再判断改善。
