# 仓库卫生与成果回流

| 仓库 | 长期保存内容 |
| --- | --- |
| [主仓库](https://github.com/FurinyaWorks/Slay-the-Heavens) | 正式源码、产品决策、Backlog、现行设计、正式资产、必要测试及精简验收证据。独立构建和测试所需的输入必须随主仓交付。 |
| [Fork A](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A) | 重型 CI、压力测试、性能分析和工程实验。 |
| [Fork B](https://github.com/v5g95m7t8m-max/Slay-the-Heavens-Fork-B) | 美术生产、拟合实验、候选设计和具备公开权利的美术中间资产。 |

两个 Fork 均公开。原始存档、敏感信息及公开许可未确认的第三方素材存放在获授权的私有位置。一次性日志、截图批次、报告和可重建导出优先存 CI Artifacts，并在验收摘要记录运行链接、保留期限和 SHA-256。受限数据不上传公开仓库的 CI Artifacts。

## 正式资产与验收证据

记录对应版本、当前有效性、完整源码 SHA、素材或证据 SHA-256、生成入口和来源。第三方资产须满足 [许可范围](../LICENSE-SCOPE.md) 和 [许可检查](CI.md)。版本更替时同步更新现行设计索引，历史证据引用固定版本。回归 fixture 应注明调用入口、可公开性和保留原因。

本轮现行基线的既有日志、旧归档和冻结素材按精确路径及 Git blob 暂时保留。候选修改或再次添加这些对象须重新满足准入。删除后应从 `config/repository-hygiene-baseline.json` 移除对应条目。现行 LFS 清单继续校验逐路径对象与体积。Git 对象历史审计与托管平台告警核验另行记录。已确认泄露时优先吊销或轮换，由所有者另行批准历史处理。

## PR 准入与回流

Fork 开发按 [任务执行](TASK_EXECUTION.md) 预检。成熟成果经审查后采用精确提交建立主仓集成 PR。PR 正文提供 `Fork-Source: <owner/repo> <refs/heads/branch> <40位SHA>`，并附验收版本、必要测试、许可证明和所用素材来源。保持源分支在审核 SHA，直到合并完成。门禁校验直接 Fork PR 和声明了该字段的主仓 PR。独立评审核对同仓 PR 有无未声明的回流，以及确属正式输入的资产。

Quality 的 `impact` 步骤检查 PR 合成树和原生队列合成树。失败会阻断既有必需 `check`。检查 Git 跟踪的忽略文件、生成物、原始存档、未批准归档、超过 5 MiB 的 Git 对象和 LFS 指针。固定版本 Gitleaks 扫描合成树净变化中可准入的文件。PR 中间提交和其他可达历史由独立历史扫描覆盖。变更的已批准 LFS 对象在扫描前下载并核对长度与 SHA-256。源码到正式有声候选的生产历史回流还须检查其专用审批、精确历史和实际 Full；禁止用回流恢复原始存档或原始日志。

重建本地准入用 `GITLEAKS_BIN=/path/to/gitleaks node scripts/repository-hygiene.mjs <base SHA>`。正反例用 `GITLEAKS_BIN=/path/to/gitleaks node --test scripts/repository-hygiene.test.mjs`。

## 首批清理

原始地图存档从现行树移除。固定来源为 `c36a8049560c05eddde6d9596cf9100fc7184c5d`，压缩原件 SHA-256 为 `417e18607da2c9363cea607a4b6268d8be2f231eea575002c064f0df49d8977c`。生成入口见 [地图专项](evidence/map-v25-20261110/README.md)，保留对照图、摘要、测试和独审。

以下压缩日志经逐字节核对与仍跟踪的日志一致，且无其他受跟踪的文本按原文件名引用。现行树移除左列，右列继续保留。

| 移除路径（相对于 `docs/evidence/`） | 保留的同内容路径 | Git blob |
| --- | --- | --- |
| battle-queue-integration-20261111/licenses.log.gz | battle-piles-final-20261111/license-final.log.gz | `9a714d8e3ea48d75c0880c2a2ac76ed383d84a6a` |
| m7-golden-idol-20261109/verify-backlog-final.log.gz | ci-draft-history-20261109/backlog-verify.log.gz | `a1ca2659a267d1b60f4a57008f7f500a57191a2a` |
| official-ui-repair-20261112/backlog-r2.log.gz | noncombat-v25-20261111/low-pixel/backlog.log.gz | `e6b019a2a223fca95842dd271eae6c5dfd88cb97` |
| sts1-combat-reference-20261121/energy-syntax.log.gz | combat-visual-20261121/syntax.log.gz | `d7a61de9957913b75fefe8138232c0749e0ddae4` |
