# Fork 预检

A/B 使用各自已有 runner，并行处理不同任务；同一候选默认只在一个 Fork 验证。主仓库保留原生 Required Checks、Merge Queue、合后分支清理和 Release 最终 Full，不重复实现这些机制。

1. 读取目标分支准确 BASE，先用已有 `node scripts/test-affected.mjs --plan --base <BASE>` 查看影响。A 优先完整受影响 Quick；共享 CI、未知或零覆盖交给一个 Fork Full，B 优先、A 可互援。
2. dispatch 前查看 A/B：相同 HEAD/BASE 已成功则复用；运行中则交接，不重复 dispatch。原生 rerun 成功同样有效，不必为获取预检资格再造一个提交。
3. 成功后把原提交推到主仓库分支，再创建或更新 PR。Quality/Licenses 的轻量准入只核对固定 Fork ID、准确 HEAD/BASE 和最新已完成的成功结果，正式测试依赖此步。缺证据就失败；补齐后原生重跑失败作业即可，不自动 dispatch、不轮询。
4. Fork HEAD 与 PR merge SHA、Merge Queue SHA 分别验收；Fork 成功不替代正式检查。Release/hotfix→master 继续走既有冻结 Full，日常 Release Fast 由 #677/#707 接续，不额外要求双 Full。

```sh
gh workflow run quick-feedback.yml --repo FurinyaDev/Slay-the-Heavens-Fork-A --ref <branch> -f base_sha=<BASE>
# 仅风险或未知影响要求 Full 时使用；没有第二次默认 Full
gh workflow run quality.yml --repo v5g95m7t8m-max/Slay-the-Heavens-Fork-B --ref <branch> -f base_sha=<BASE>
```

固定仓库 ID：主1429751262、A1460097312、B1460133275；名称变化按 ID 解析。HEAD 已绑定工作流、测试、依赖和配置，不另建配置签名注册表。成功结果在准入步骤读取，依赖它的正式作业随后才能开始，因此不额外校验工作流创建时间或拒绝成功 rerun。读取权限不足明确失败，由已有授权维护者执行，不提供写 token 或改用 pull_request_target。

GitHub 仍会创建轻量准入 run；Concurrency 只能取消同仓库/ref 的旧运行，不能原子锁住 A/B。沿用 Backlog 认领和 dispatch 前查重，不另造全局调度器。

统计复用 `scripts/ci-run-costs.mjs`，仅按需运行，见[基线](evidence/ci-preflight-20261117/history.md)。额外来源、SHA、历史或证据防护先针对已发生的故障做最小修复，再比较实际拦截、runner 时间和维护返工；没有收益证据就先保留诊断，不默认升级强制门禁。不为这条原则新增检查、报表平台或每 PR 填表。
