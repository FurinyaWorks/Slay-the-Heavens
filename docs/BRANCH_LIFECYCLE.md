# 分支生命周期与积压治理

> 2026-11-16 建立；只作用于协作治理，不改变发版范围、质量门禁或既有实验授权。

## 现象与 5 Whys

基线快照：121 个远端分支、35 个开放 PR（19 个指向 release/v2.0.0、16 个指向 develop）；另有大量无 PR 来源分支、被关闭但未合并的来源、归档与临时队列引用。这是时间点快照，不是永久阈值。当前仓库的 GitHub 设置 **已经开启** delete_branch_on_merge，因此不是漏开这个开关。

1. **为什么有 121 条？** 并行 Agent 持续开分支；旧分支完成、被替代或 HOLD 后仍留在远端。
2. **为什么自动删除没清掉？** GitHub 原生开关只处理合并 PR 的 head；无 PR、关闭未合并、独立实验和协调集成来源不在自动删除覆盖范围。
3. **为什么这些分支没逐一收口？** 已有文字规范要求检查来源 SHA、PR 和脏树，但欠缺跨会话、跨 Agent 的统一待清理登记与巡检反馈。
4. **为什么未形成治理门禁？** 现有 Quality/PR 模板优先验证代码合并，不度量未归属分支及后续关闭责任；旧模板未跟上 release 修复流。
5. **为什么形成管理盲区？** 高并发领取和异步合入的吞吐优化先于 WIP 限制及退出制度。该组织层面的根因属于有证据的推断，需要在后续巡检中持续验证，而非归咎某个 Agent。

**目标是交付闭环，而不是以删分支数量为 KPI。**

## 版本与分支归属

| 分支 / 工作 | 正确来源与目标 | 清理原则 |
| --- | --- | --- |
| master | 已发行生产历史；只接正式 release 或 hotfix | 长期保护 |
| release/v2.0.0 | 冻结的旧集成来源，供取证及接续 | 保留分支与精确提交，见 [2.0 重建交接](versions/V2-RELEASE-HANDOFF.md) |
| fix/*（v2.0.0 缺陷） | 从最新 develop 起；PR 目标 develop | 经本版验收、合入后核对并删 head |
| develop | v2.0.0 重建及后续工作主线 | 长期保护 |
| feat/*、docs/*（非本版） | 从 develop 起；PR 目标 develop | 经合入/验收清理 |
| archive/*、冻结实验 | 有明确用途、来源 SHA、负责人和复核点 | 不因年龄自动删除；不用长期占用日常活跃 WIP |
| gh-readonly-queue/*、handoff/* | 临时测试/交接引用 | 先确认对应 PR/作业结束、无后续引用再清理 |
| 关闭未合并 PR 的来源 | 保留至 Backlog 和继承者记录完整 | 不等于“已交付”或“可以直接删” |

完成 develop 集成和全量回归后，才从已验证提交重建发布候选，并按既有受保护流程和 Owner 确认执行发布。实际目标以 PR base 和任务批准为准。

## 分支入口：先查重再开工

1. 先查 Backlog、开放/关闭的同范围 PR、同任务分支及依赖；优先接续原来源，禁止反复从头重开相同工作。
2. 每个分支须有任务/交接来源、唯一负责收口的 Agent、目标版本、下一步与实际 HEAD。实验可以不提 PR，但不能匿名、无期限占用。
3. 一个 Agent 同时以一个**主要在制任务**为默认，遇阻保留接续点，必要时明确交接或暂停；不得以“已有提交”冒充“已集成”。
4. 新建 PR 必须注明目标版本、base、依赖、独立验收证据、来源/继任者、合并或关闭后的清理动作。不要用 draft 作为空任务占位。
5. 多 Agent 协调集成沿用 docs/CI.md 的来源 SHA 冻结表；来源 PR 的关闭理由、继承 PR、未纳入内容及剩余责任逐项回填。

## 分支出口：Agent 的最小收口协议（Definition of Done）

**责任人**：开工 Agent 默认是分支 Closeout Owner；协调集成者明确接管时，必须在原 PR/Backlog 记下接管人和固定来源 HEAD。每日巡检只发现遗漏、点名归属，不代替 Owner 合并/删除。

**六步闭环（不额外发明新的项目管理表）**：

1. **核对来源**：核查 Backlog 任务、正确目标版本/base、原 PR/替代 PR、精确 40 位 HEAD SHA；有脏文件、工作树、唯一证据先记录。
2. **验收交付**：现有独立评审、定向测试与 Required CI 不变。排队/Auto-merge 只是 `DELIVERY_PENDING`，不能写成已合并、已通过实机或 Done。按 docs/CI.md 异步交接，无须盯着 CI 运行。
3. **确认结果**：实际 merged + `verify:delivery --merged` + Backlog AC 对账才能记 `DELIVERED_VERIFIED`；协调集成需逐源核对已纳入范围、未纳入内容及对应 successor，不能只看来源 PR 被关闭。
4. **只选一种出口**：`DELIVERED_VERIFIED`（已交付且已核对）；`SUPERSEDED`（继任来源及未接续内容明确）；`FROZEN`（有后续目标和复核触发条件的实验/HOLD）；`DISCARDED`（确认不需要且保留足够恢复/审计证据）。等待依赖、CI 或审批时保持 `ACTIVE/BLOCKED/DELIVERY_PENDING`，**不算关闭**。
5. **安全清理**：确认不是 master/develop/release/受保护分支；远端 HEAD 仍等于复核时固定 SHA；没有开放 PR 将它作为 head 或 base；无在途 Agent、依赖/工作树/未提交文件/唯一证据；交付或弃用的证明成立。Squash 改写 SHA，所以 `ahead_by=0`、`git branch --merged` 或 diff 看起来为空都不能独立替代交付证据。满足才删除远端引用和自己的**干净**工作树；有疑点保留并标 `NEEDS_REVIEW`。
6. **核实关闭**：读回远端 branch 已不存在（或标注为什么保留）；原 PR/Backlog 状态、继承者和版本无误，再领取下一个独立任务。GitHub 自动删 head 只是一项辅助。

**最小留痕（写在既有 PR / Backlog 交接备注，不为每个分支另建文件/Issue）**：

```text
CLOSEOUT: <branch>@<full-head-sha> | version/base=<...> | outcome=<DELIVERED_VERIFIED/SUPERSEDED/FROZEN/DISCARDED/BLOCKED> | PR=<#或none> | successor=<#或none> | owner=<agent/协调者> | evidence=<可复核链接> | remote=<deleted/retained+原因>
```

四种特殊情形：

- **正常 PR 合并**：只有实际合并和合后核验完成才结束；若 GitHub 已删 head，读回确认，无需重复操作。
- **PR 被关闭/被整合替代**：先写清继任者 PR、被接管的源 SHA、接受的内容和剩余工作；没有可靠内容对应关系不得删除。
- **长期研究/胡桃冻结候选**：保留分支，显式 `FROZEN` + owner + 复核条件，巡检不将其当作普通逾期分支；需要时把重要历史证据保存在可恢复的位置。
- **没有 PR 的临时分支**：补齐唯一 Owner、任务来源、后续目标及出口；没有证据时一律 `NEEDS_REVIEW`，不能因为过了 N 天而自动删。

## WIP 预警与处置（软阈值）

- develop 的并行工作按现行动态 WIP 控制。协调者优先解决阻塞、整合同源切片及验收，优先响应 P0 修复。
- 无关联 PR 的普通分支 **超过 10 条**：暂停无必要的新实验分支，逐一标注 Owner/版本/继承关系。
- 无 PR/已关闭分支 **7 天无更新**：提醒负责 Agent 对账；**14 天**：要求具体合并、继承、冻结或删分支方案；**30 天**：升级人工复核。时间不是自动删除条件。
- 每次 Agent 完成一个任务，核对分支/PR/Backlog 的闭环后才领取下一项；多 Agent 的 WIP 应按真实运行数而非允许无限堆积。
- 定期记录 branch-count、open PR by base、no-PR、closed-unmerged、age bucket 和实际删除/保留原因，关注趋势，不追逐单次数字。

## 自动化范围与执行

- **每日巡检 Owner：云端 ChatGPT 定时任务（可由 dot 接管）**，逐日只读核对分支、PR、继任者和责任人，只对新异常/升级事件简报；禁止直接合并或删分支。定时任务在 GitHub 之外维护，避免为每日巡检占用本地电脑。
- .github/workflows/branch-hygiene.yml 改为 **手动触发的只读证据工具**，需要详细库存时由协调者运行并下载结果；不再和云端任务重复每日调度。
- scripts/branch-hygiene.mjs 通过 GitHub API 分页核对全部分支及全部 PR，绝不调用 DELETE、合并或开 issue。它提供待复核线索，**不是自动删除清单**。
- 进行批量清理前由具备完整 Git、PR 和 Backlog 上下文的协调 Agent 二次验证；远端删除必须独立执行、记录结果。禁止让没有源码判断能力的巡检机器人按天数清除。
- 治理更新只走 develop 的正常 PR，绝不把治理功能/脚本混入当前 release，也不因治理绕过 Fast、Full、独立评审或规则集。
