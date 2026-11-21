# Fork 预检

按风险选择是否使用 Fork 的 hosted 诊断，无需为提交主仓 PR 先运行 Fork。A/B 使用各自已有 runner，同一候选默认只在一处验证。

1. 读取目标分支准确 BASE，先用已有 `node scripts/test-affected.mjs --plan --base <BASE>` 查看影响。A 优先完整受影响 Quick；共享 CI、未知或零覆盖交给一个 Fork Full，B 优先、A 可互援。
2. dispatch 前查看 A/B：相同 HEAD/BASE 已成功则复用；运行中则交接，不重复 dispatch。原生 rerun 成功同样有效，不必为获取预检资格再造一个提交。
3. 原执行者按风险判断是否先在 Fork 验证。已有运行核对固定 Fork ID、准确 HEAD/BASE 和最新对应 attempt。候选成熟后把原提交推到主仓库，再创建或更新 PR。主仓 Quality/Licenses 独立执行正式检查，缺少 Fork 记录或跨仓读取故障不会触发重跑或阻断正式检查。
4. Fork HEAD 与 PR merge SHA、Merge Queue SHA 分别验收；Fork 成功不替代正式检查。发布冻结 Full 与日常 Release 验证分别见 [CI-FAST](CI-FAST.md)。

```sh
gh workflow run quick-feedback.yml --repo FurinyaDev/Slay-the-Heavens-Fork-A --ref <branch> -f base_sha=<BASE>
# 仅风险或未知影响要求 Full 时使用；没有第二次默认 Full
gh workflow run quality.yml --repo v5g95m7t8m-max/Slay-the-Heavens-Fork-B --ref <branch> -f runner_pool=hosted -f base_sha=<BASE>
```

dispatch 前读取候选 ref 的工作流和测试入口。旧 Fork 默认分支可能仍使用 5 分钟 Quick，或仅声明 `runner_pool` 的 Quality。把当前候选的精确提交推到诊断短分支，以带 `base_sha` 的对应工作流运行。旧输入合同生成的运行无法认证 BASE。以 `preflight-<run>-<attempt>` 的 checkout 收据核对实际执行身份，再计为有效预检。

固定仓库 ID：主1429751262、A1460097312、B1460133275；名称变化按 ID 解析。HEAD 已绑定工作流、测试、依赖和配置。成功 rerun 可以复用；读取权限不足时保留精确 HEAD/BASE 与运行链接，由已有授权维护者核对。

Concurrency 只能取消同仓库/ref 的旧运行。A/B 沿用 Backlog 认领和 dispatch 前查重，同一候选只保留一个预检负责人。

失败先读准确 run/attempt 的失败步骤：代码冲突、断言失败、无 runner 的排队、权限拒绝和队列退出分别接续。记录作业创建到分配 runner 的等待与实际执行时长；未分配 runner 不计执行。原 HEAD/BASE 已成功或仍在途不重复派发，修复后沿原 PR 推进；入队/本地通过不记交付，实际合并后再用已有交付验证器核验并确认无独有工作才清理。正式候选先定稿版本和 CHANGELOG，再冻结做必要 Full/构建；官方和设备缺项保持未验，不前移为普通 PR 门槛。

统计复用 `scripts/ci-run-costs.mjs`，仅按需运行，见[基线](evidence/ci-preflight-20261117/history.md)。额外来源、SHA、历史或证据防护先针对已发生的故障做最小修复，再比较实际拦截、runner 时间和维护返工；没有收益证据就先保留诊断，不默认升级强制门禁。不为这条原则新增检查、报表平台或每 PR 填表。
