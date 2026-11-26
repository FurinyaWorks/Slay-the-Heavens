---
id: TASK-115.3
title: 恢复完整 CI 回归并验证全部分片
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-25 21:00'
updated_date: '2026-11-26 04:05'
labels:
  - engineering
dependencies: []
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/929'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/970'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/971'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/972'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/973'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45630976779'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/976'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/979'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/980'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/996'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/997'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1000'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1002'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1003'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1004'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1005'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1006'
documentation:
  - docs/versions/V2.2.0-RELEASE.md
parent_task_id: TASK-115
priority: high
type: task
ordinal: 210000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：v2.1.1 Hotfix 的 Full 有失败、取消及跳过分片，已有多条接续 PR。

任务：取回原始失败记录，逐项区分真实缺陷、夹具失配、历史 ID 与其他工程故障。

边界：接续 #929、#970–973；保留测试数量、断言、覆盖和门槛。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 每项原始失败有复现、归因、接续记录和修后结果；取消和跳过分片经 Full 重跑
- [ ] #2 恢复后的 develop 完整 CI 全绿，独立评审核对分片与断言；冻结候选另按 TASK-115.13 执行
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
已派发恢复 Full。原始运行含 19 个失败、16 个取消分片或汇总、1 个跳过及 2 个成功；失败日志已取回，逐项归因中。

四条现有测试 PR 由 #976 合并接续。#979 通过 126 项固定源向量，相关 GitHub Fork Quick JS 93/93；同一 Quick 后续 Lua 失败保留。#980 共享预览 PNG 真实制品生产、恢复与负对照通过定向验证。完整 Hosted Full 和 #929 继续。

#996 来源与夹具修复已合入 develop ecce2251ef9dcb9542488ac92ba31de5a62d438a。原 Release Bootstrap 定向通过，899 个 JS、1,426 个 Lua，独立评审 6066337165 和精确 Fork Quick 通过。Linux 原计划为 1,205,366 ms，高于 1,200,000 ms；现行架构旧回执仍待修复。主仓 Full 45720732047 排队。验收项保持未勾。

现行架构与样式回放 #997 已合入 develop 060b13c612bb3d4ad36044939f11ca3f5b2929c7。独立评审 6066545524 及原定向 6/7 通过，原 Linux 预算仍高 5,366 ms。Fork Quick 45722483438 两次在 Git LFS 素材恢复失败，测试步骤未运行。精确主仓 Quality 45723458426、Licenses 45723458427 排队，验收项继续待验。

060b13c6 的主仓 Quality 与 Licenses 在变更前均未分配 Runner，排队约 21 分钟后由 develop 并发机制取消。#998 后同一工作流入队，精确 8a5f86813e993a9b8cd85dd8016a2943d4a7c629，Quality 45726046674、Licenses 45726046811。

8a5f8681 的主仓 Quality 与 Licenses 排队近 23 分钟，未分配 Runner，随后由 develop 并发机制取消。实际最新源码 454b589793c8d3a171ccbcaee0db1c809136c683 重新入队，Quality 45728830817、Licenses 45728830880。完整 CI 仍待验。

#1000 接续 #929 的 LF/CRLF 与奖励回放，精确 454b5897 基线、合并树 de55f80e。独立源码评审 6066965023 及 Fork A 45729134666 Advisory Quick 通过。原始 51 个历史来源和现行校验匹配。主仓完整 Full、现行 Linux 预算和 #929 的独立调度范围仍待验。

三项官方可读性断言按现行 #942 固定字号与 #940 新增隐藏面恢复，候选 #1002 精确基于 454b5897。独立复跑 11/12，Fork Advisory Quick 45732038443 通过。原架构历史回放仍有多个关联来源失配，保持原 60 秒和档案。完整 Full 待验。

逐一比对 5e318736 与实际主仓 454b5897，899 个 JS、1,426 个 Lua 的发现路径完全相同，排程代码、计时表和 Quality 工作流的 Git blob 相同。Linux 原预测 1,205,366 ms，理想均分下限 1,205,362.67 ms，继续保留 1,200,000 ms 阈值与 60,000 ms 预留。需要完整 Hosted 文件计时才能处理估算来源。

01:14 UTC 核对主仓队列，454b5897 的实际 Quality 45728830817 和 Licenses 45728830880 均未分配 Runner。较早的真 Hosted 运行 45705324299 和 45704932845 分别仍有两项和一项分片执行，分片开始时间为 01:05 至 01:09 UTC。保留当前主仓排队，等待同一源码的原始证据。

从较早的 Hosted 45705324299、45704932845 取回 8 条完整文件摘要。两份不依赖媒体的目标测试 check-release-text 与 release-metadata 的历史工作负载和当前一致，最大观测分别为 21.297812 ms、13.830118 ms。即使用这两项替换各 10,000 ms 的回退估计，原排程总缺口仍约 60.48 秒。记录为历史可比计时，不调整权重。其余目标缺少可用现行证据，日志摘要仅覆盖 GitHub 解码文本。

#1002 仍是独审 11/12 的现行可读性切片。本地接续 fd7d476bed3e710f200010b3febdd9c63f8a18f6 基于待合入 #1000 与 #1002 的精确组合，经独立源码复审。原可读性用例 12/12、原封存回放 10/10 且零跳过，原 60 秒限制保留。109 对源码映射和 1,699 次逻辑读取顺序已核对，78 个改写读取负例被拒绝。须按实际合入基线接续，Hosted Full 继续待验。

M7 与独立遗物回放在假定 a87a8d40 的四个本地未暂存文件上，原定向用例共 6/6。遗物隔离用例 219.500 秒，原有读取逻辑 482 和 9,899 项顺序对齐。原排程估算与门槛照常执行。自动审核拒绝写入现行校准登记，理由是持久档案写入授权范围不清，现行门禁依旧拒绝未登记的辅助器。已提请只更新复制闭包、M7 和遗物三条现行 after 身份及外层校验，保留原历史字段与归档。等待范围授权和提交后的独立源码复审。

M7 与遗物的四文件本地补丁经独立局部复核，补丁 SHA-256 20d689bb409370199789597c5535e6b7774eca5e3373f673e942a05fc354889d。已复核 482 与 9,899 次读取顺序、当前及旧 LF/CRLF、混合与重读负例。真实现行门禁仍拒绝未登记的校准后继，三条 after 写入等待授权。

CRLF 与奖励候选 #1000 已通过 PR 合入，实际 develop 0a10bd9cc1bc89ce9cfa2569b071922149571468、合入树 de55f80eb501a811a5f72426825d304b77d90a0f，与独立评审 6066965023 绑定的树一致。原 454b5897 的 Quality 45728830817 与 Licenses 45728830880 最终取消，两个入口作业 Runner ID 均为 0 且无步骤。新主仓 Quality 45737440575、Licenses 45737440607 仍排队。旧的定向与 Advisory 成功记录仅覆盖对应范围。

官方可读性 #1002 已按实际 0a10bd9c 接续为 HEAD 0f76066ffcff4ecb56e99edd1563de340d16da5a、树 0c7c34253bcc12194ec56bc009e6ddeb7dfc2705。源树与 fd7d476b 一致，原定向 12/12、封存回放 10/10 零跳过、原 60 秒限制及 78 个读时改写负例经独审保留。精确 Fork A 45738083434 通过，原生独审 6067501681。Full 与另行登记的 M7 和遗物不采用该结果放行。

0a10bd9c 的 Quality 45737440575 与 Licenses 45737440607 经 02:02 UTC 复核均未分配 Runner、无步骤，#1001 合入后取消。实际最新 develop fb356bf9fd876c48e60cd67fb6ff654ea192b503，主仓 Quality 45739726164、Licenses 45739726170 重新入队。原三次较早 Hosted 的 15 个作业含 9 个可比现行文件、27 条逐文件成功记录。各取最大并取整，九项合计 1,256 ms，原 90,000 ms 回退总量预估减少 88,744 ms。同一原分片与预留的只读预测 1,199,449 ms，原 1,200,000 ms 阈值不变。原始日志是 GitHub 解码文本，采集摘要 4688327026fa149b3f683fb0bafee9e2ac9d280864712dbe5bbca654a48cc594。正式命中和完整 Full 待验。

可读性 #1002 真实接续 HEAD 3d5ecd7ea117e6a6cb96197327c1c026a3e3487e、父 fb356bf9、树 5e372ab5，实际本地按原入口复跑 12/12，零跳过。首次默认权限失败定位为 Node 子进程 git EPERM，使用原执行权限复跑通过，未改测试命令参数或源断言。精确 Fork 45739833750、独审 6067626512。正式 Full 待验。

Linux 九个已测权重和原历史精确逆投影，两文件本地候选 7879dec4a348dd71714bec9940cfd6fdc97f3093 独立复审通过。独立复算用 27 条完成原始摘要，现行原计划 1,199,449 ms，仅距原 20 分钟门槛 551 ms。原 15 shards、并行 12、预留 60 秒、30 分钟旧回放护栏和当前 90 分钟物理上限不变。原菜单、Release Bootstrap 及四项历史计时通过，原 Curses 回放在基线和候选上同样失败，另作源码归因。M7 归档原字节保持。继续同实际父提交验证，完整 CI 未放行。

#1002 已实际合入 develop 2c3fcc7ba6c9d900046f65a32ff0cf1d333c2b28，父 fb356bf9、树 5e372ab5 与 6067626512 独审一致。旧 Quality 45739726164 和 Licenses 45739726170 在分配 Runner 前取消。现行 Quality 45741000490 和 Licenses 45741000432 入队。精确计时校准 #1003 以实际 2c3fcc7b 为基线，HEAD b83ae806、树 4c1bdd58、原生独审 6067691847、Fork A 45741180961 通过，实际合入及 Hosted Full 仍待。

#1003 已经实际合入 develop 505319e8c481f9bf108ae9493b0e2a3e86188e2b，父 2c3fcc7b、树 4c1bdd58 和独审精确一致。旧 Quality 45741000490、Licenses 45741000432 入仓前均未分配 Runner，合入后取消。主仓新 Quality 45741945079、Licenses 45741944979 排队。两幕视觉接续本地源码 98899e87 局部独审通过，现行可读性 13/13、原封存 10/10。通用封存 official-assets 5/6 的海报和音频映射在实际基线等字节失败，确认属于原 Full 发现的文件，另作来源归因。

Curses 历史 #1004 实际合入 05c9dfe3b41ac4a7c0e325d9fbb1ef8f0db1497f，父 505319e8、树 13da769b。真实 #1003 排程、原 Curses/Bootstrap 定向 4/4、原生独审 6067755916、Fork A 45742134686；现行 Curses 功能 8/8。另一份旧计时收据因现行 Act1 输入失配继续待验。505319e8 对应运行未分配 Runner 后取消。现行 Quality 45742778259、Licenses 45742778273 入队。

#1005 已合入 60ceeea4a9d563de50a55f43d238949a9c05b811，#1006 已合入 20b7b4f6128c26b1e221e17cc64a66a59985f917。合入树分别是 e00deeab 和 378b2bf9，均与独审及实际目标树一致。原官方资产文件在组合候选 13/13 零跳过，原封存 6/6 与 LF/CRLF 及四项复读负例通过。原 60 秒门槛保留。20b7 真实 Quality 45745419782、Licenses 45745419515 待验。
<!-- SECTION:NOTES:END -->
