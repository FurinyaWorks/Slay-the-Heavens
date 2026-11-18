# Fork 预检

A/B 使用各自已有 runner，并行处理不同任务；同一候选默认只在一个 Fork 验证。主仓库保留原生 Required Checks、Merge Queue、合后分支清理和 Release 最终 Full，不重复实现这些机制。

1. 读取目标分支准确 BASE，先用已有 `node scripts/test-affected.mjs --plan --base <BASE>` 查看影响。A 优先完整受影响 Quick；共享 CI、未知或零覆盖交给一个 Fork Full，B 优先、A 可互援。
2. dispatch 前查看 A/B：相同 HEAD/BASE 已成功则复用；运行中则交接，不重复 dispatch。原生 rerun 成功同样有效，不必为获取预检资格再造一个提交。
3. 原执行者按风险判断是否先在 Fork 验证。已有运行核对固定 Fork ID、准确 HEAD/BASE 和最新对应 attempt。候选成熟后把原提交推到主仓库，再创建或更新 PR。主仓 Quality/Licenses 独立执行正式检查，缺少 Fork 记录或跨仓读取故障不会触发重跑或阻断正式检查。
4. Fork HEAD 与 PR merge SHA、Merge Queue SHA 分别验收；Fork 成功不替代正式检查。Release/hotfix→master 继续走既有冻结 Full，日常 Release Fast 由 #677/#707 接续，不额外要求双 Full。

```sh
gh workflow run quick-feedback.yml --repo FurinyaDev/Slay-the-Heavens-Fork-A --ref <branch> -f base_sha=<BASE>
# 仅风险或未知影响要求 Full 时使用；没有第二次默认 Full
gh workflow run quality.yml --repo v5g95m7t8m-max/Slay-the-Heavens-Fork-B --ref <branch> -f base_sha=<BASE>
```

固定仓库 ID：主1429751262、A1460097312、B1460133275；名称变化按 ID 解析。HEAD 已绑定工作流、测试、依赖和配置。成功 rerun 可以复用；读取权限不足时保留精确 HEAD/BASE 与运行链接，由已有授权维护者核对。

Concurrency 只能取消同仓库/ref 的旧运行。A/B 沿用 Backlog 认领和 dispatch 前查重，同一候选只保留一个预检负责人。

协调者统一收口，原执行者继续自己的 PR 与独审；共享工作流、来源 helper 和输入模块由该 PR 当前执行者写入，其他线先交准确补丁/来源，不各自覆盖。先推进基础设施与任务定义，再按真实依赖推进已准备的 Release 修复；#711 承接 #686 的唯一输入实现，#678/#685/#691 接续 #679。develop 用原生队列，Release 用现有保护下的自动合并，Release 修复选择性回流 develop。

失败先读准确 run/attempt 的失败步骤：代码冲突、断言失败、无 runner 的排队、权限拒绝和队列退出分别接续。记录作业创建到分配 runner 的等待与实际执行时长；未分配 runner 不计执行。原 HEAD/BASE 已成功或仍在途不重复派发，修复后沿原 PR 推进；入队/本地通过不记交付，实际合并后再用已有交付验证器核验并确认无独有工作才清理。正式候选先定稿版本和 CHANGELOG，再冻结做必要 Full/构建；官方和设备缺项保持未验，不前移为普通 PR 门槛。

统计复用 `scripts/ci-run-costs.mjs`，仅按需运行，见[基线](evidence/ci-preflight-20261117/history.md)。额外来源、SHA、历史或证据防护先针对已发生的故障做最小修复，再比较实际拦截、runner 时间和维护返工；没有收益证据就先保留诊断，不默认升级强制门禁。不为这条原则新增检查、报表平台或每 PR 填表。
