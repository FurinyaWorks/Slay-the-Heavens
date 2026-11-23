---
id: TASK-87.2
title: 阻止设计前置与任务依赖漏检
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-15 13:10'
updated_date: '2026-11-23 04:32'
labels: []
dependencies: []
references:
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1996e65c5647750bc9d907be6562909135e08e3d/docs/backlog-details/TASK-87.2-DEPENDENCY-GUARD.md
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/blob/1996e65c5647750bc9d907be6562909135e08e3d/docs/evidence/pr682-full-correction-20261115.md
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/729'
parent_task_id: TASK-87
priority: medium
type: bug
ordinal: 178000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户再次指出设计尚未确认就进入实施、依赖错误未及时发现。现有领取入口不读取dependencies，Backlog仅检查97到105的容量特例，正文阶段前置与真实状态没有贯通。须用最小错误样本补可执行防护，保留已有批准稿修复和隔离实验边界。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 记录真实漏边、状态与GO语义的根因和最小复现，不将推断写成历史事实。
- [x] #2 领取检查拒绝未完成、未知、重复、循环或不可信依赖，明确输出阻塞链；合法独立任务保持可领。
- [x] #3 Backlog检查拒绝明确设计前置缺边及坏依赖，修正97的设计关系；实验与量产、设计批准与研究Done分开。
- [ ] #4 反例先红后绿，相关检查和可追溯独立复审通过；正常PR集成，不修改release。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 用97漏设计边与未完成依赖最小复现现有漏检。2. 在现有领取和Backlog入口共享轻量依赖校验，拒绝坏身份/未完成链；不从正文关键词猜审批。3. CLI修正97依赖并记录实验、设计、实施、验收边界。4. 定向回归与真实队列验证、独立复审后提交PR集成develop，release不改。

2026-11-16 PR682失败定向接续：核对HEAD/评论/所有权后，在oc682-source-negative-1116树保留原PR历史；原样复现StS负控混用历史reader，隔离raw准入与历史投影输入，保留current漂移拒绝；用现有collector更新精确source/copy闭包并保护旧archive身份，执行小组RED/GREEN后仅本地提交交主控独审。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-15 Owner明确要求根因纠偏、轻量机制并及时集成既有成熟feature。执行树dependency-intake-1115，基线c2409ad7；现有87.1为状态对账，87.2仅补依赖漏检，避免重做。

2026-11-15已落本地机制：task:pick与verify:backlog共用轻量依赖检查，97经CLI补回96且保留105。未完成依赖旧入口ALLOW、97删设计边旧门禁空错误均先RED后GREEN；独审另发现宽松Done标量会误认证设计完成，已加两条入口反例并复用严格解析修复。6文件定向153/153通过（含冷进程无npm发布器与delivery合同），verify:backlog、syntax、guidance、diff检查通过。Fast规划因未建模Backlog要求Full，未重复本地全套或额外ci:full；托管与合后仍待。独审会话ses_e20966779ffeZw2jHWCrHnMhuR待修复后读回。源码通过不证明任何设计/容量/设备GO；AC4保留。

2026-11-15继续执行：补查跨模块合同发现metadata未登记当前CI原文，已通过merge:auto暂停PR682并读回；153项仅为当轮定向结果，不是Full通过。现同批纳入TASK34七行永久故障音乐清理，单UI后继接最新session/Neow，原大archive/六源views不改，新增精确小后继与实际复制闭包。48项epoch+80项依赖/Backlog+20pass1既有renderer能力skip通过。独审ses_e2058991bffe7LK6jit0BB7vj0另检出生成器依赖未合侧分支Git对象，已用对象不可用反例先红后绿并改为认证托管fixture，最终5/5通过。详见docs/evidence/dependency-bgm-source-contract-20261115.md；AC4仍待最终独审、正常CI/合后，不记Done。

2026-11-15实际Full43727819459/head04ebf5af已失败，保持未授权；已读取全部15个失败测试shard，归并10文件11例的四类合同衔接问题：current读取多一次、owner排序、旧session epoch绑定、Windows leaf EOL。当前路径恢复原116次排序鲜读，历史兼容才额外重读UI；六份原current断言未改。旧session provenance改查显式保留epoch，CRLF反例先红后绿。来源5/5，原失败例8通过，三份本机历史文件导入受临时目录/junction能力阻塞；独立当前准入探针116owner/348异常/116恢复/unknown零读通过，不称三整文件过。详见docs/evidence/pr682-full-correction-20261115.md，待独审与新HEAD正常CI。

2026-11-15本批纠偏补验：独审又指出本PR新增的current +1读取断言漏回退，现原样恢复基线owners.length，完整来源/epoch/真实session三文件56/56通过、无跳过。当前准入仍116次排序鲜读，历史before兼容保留混期和热漂移拒绝。三份本机历史大文件导入能力阻塞不冒充整文件成功，等待新HEAD Hosted原测试；最终当前包与证据见pr682-full-correction附件。

2026-11-16用户指定修PR682已失败Rules15/POSIX12。HEAD仍1b60f71c4733ced0c91dc814dc5c7a6644c8fe56，origin/develop仍c2409ad7；原PR树干净，comments/reviews无并发写入认领。新树从最新develop建立后FF保留原PR历史；写入范围仅StS负控测试、collector输出、对应证据及本任务记录。已读两job原始日志，并本地原样复现同一fresh added inventory source先于有意变异guard的RED。

2026-11-16 PR682最小接续：StS负控历史reader遮蔽raw读取，导致菜单库存guard先拒绝；局部历史读取更名readSts，仅历史原文比较用投影视图，原负控regex与全部guard未改。原例RED，真实源码更新未采集仍被source guard拒绝，collector接续后GREEN；定向三文件最终60/60无跳过，28次探针变异精确命中各自路径guard，raw菜单漂移/缺失/历史reader继续拒绝。首次组测9pass4fail源于新树LFS pointer，恢复既有对象后重采集通过；历史包未改。新包96603字节/24源，旧23binding及6copy closure保持，sha293c36c61a5b14eb3bc069d2a6ae8e9357cba730e4b053ee0323b058aa279cbe。syntax/backlog/guidance/diff通过，证据见pr682-full-correction附件及同目录pr682-source-negative-20261116.mjs。仅本地候选交主控独审和既有PR集成，AC4保持未勾。

领取入口已由 #729 交付。本片接续全库依赖审计与 TASK-97 设计依赖，保留 #682 的证据和停点。合后验收仍按 AC4 核对。

历史交付 #729 已合 develop de72920e8dac3bd6267641e110cf30c17c13888d，已有传递依赖门禁；本切片只同步 Owner 的第三幕开发/第四幕暂停边界并保留真实依赖。#729 正文为 Backlog: none，本条补记真实交付范围；AC4 待核原独审及合后回执。

已读回 #729 的 COMMENTED 独审 PRR_kwDOVThF3s8AAAABYy9jjA，签署身份 v5g95m7t8m-max，核定 HEAD b7519eb0a07caec23dff0d1ad8b8ac6847c1ddf0；历史评审明示 Owner 当时批准 PR-only。仍保留既有未验 AC，当前治理按正常队列。
<!-- SECTION:NOTES:END -->
