# 三仓库现场与接续

对应 TASK-88.1.1；本附件是现场记录，长期操作规则见 [CI](../../CI.md#三仓库按需验证)，云端开工顺序见 [任务执行](../../TASK_EXECUTION.md#云端-agent-接手入口)。

2026-11-17 通过 GitHub API 读回固定 ID：主仓库 1429751262；Fork A 1460097312；Fork B 1460133275。两个 Fork 后改名为 `FurinyaDev/Slay-the-Heavens-Fork-A`、`v5g95m7t8m-max/Slay-the-Heavens-Fork-B`，ID 未变。A 有管理员权限；B 经 Owner 授权有写权限并启用四个已有工作流，分配诊断无需本机在线或额外付费。未改变主仓库保护。

| 实际动作 | 结果及边界 |
| --- | --- |
| [A 原生 dispatch 44007967971](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44007967971)，HEAD ff81773c4fb8dd1fafb6db73c0f8570d9f68a79b，BASE c2409ad750c15124b7b843c6bbfa5b222537cb75 | 调度成功；未知输入导致零测试，日志明确要求 Full，不能计为回归通过 |
| [A 输入修复 Fast 44008650092](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44008650092)，HEAD ad6fe84dbcc11e28e8a82258f889a6841b46c8c6，BASE 33d71575c5f186a1b54f7bf3e4f1826c145aa1d9 | success，实际 JS/Lua 选测，测试段 103374ms；属于该 SHA 的 advisory，不能证明更新后的 release 组合或真机通过 |
| [A 互援 Full 44008162718](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44008162718)，HEAD 8dd06aa3b5b054c93cbe403e056eb6852beabb48 | 真实 Windows 发现原始 CRLF 负例日志第30/33行尾空格；保留失败，取消余下运行并读回 cancelled，不重复耗费资源 |
| [B 接续 Full 44009128502](https://github.com/v5g95m7t8m-max/Slay-the-Heavens-Fork-B/actions/runs/44009128502)，HEAD 6b16b6e8ec74e5247dfee228d9ef4fb98a5b1583 | dispatch 成功，impact/presentation 已成功并分配实际 runner；完整结果交给 GitHub 异步执行，此附件不宣称 Full 通过 |
| 主仓库旧队列运行 43927295813、43905690493 | 精确组合 ref 已删除、当前队列无该成员；取消后分别读回 completed/cancelled。保留当前 #676 队列，不重新授权或重复 Full |
| 已合分支核对 | 最近100个 merged PR 与实时远端分支交叉未发现可删的残留 head。#698 已实际合入 release b9bca884ed9b9831965b409885d78f719b9a567a；本地同名分支有不同提交，保留 |

日志修复已正常快进原 [#677](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/677) 至 6b16b6e8ec74e5247dfee228d9ef4fb98a5b1583、[#707](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/707) 至 6ba51cbe1ead51d30e2838b0e5f509e15bbb0e33。两份原失败日志均从 Git blob 无损 gzip，主控独立验证解压逐字节相同；同一原父到修复后的 diff-check 从失败转成功。旧自动授权先暂停读回，再推新 HEAD。准确原始摘要见各分支 `docs/evidence/release-crlf-fixture-20261117/README.md`；未改测试期望、生产逻辑或门槛。

后续 #707 正常接续 #698，合流 1346295a5223ff99501040a2546f4f97ac615352 暴露来源身份接续及旧 workflow 视图失败，已在同 PR 修复至 e2feae68c855214addce2b64a8722a7354e1260f。原历史期望不变，相关组合46/46；主控独立核对五份 Git B9 前驱及当前摘要、Node24新负控1/1，原生 SQUASH Auto-merge 已读回，正式门禁继续等待。证据在该提交 `docs/evidence/release-fast-b9-ci-20261117/`。#677 和本指引 PR 的 `merge:auto` 仍因主仓库 impact 尚未给出路由而 HOLD；未添加 ci:full 或绕过。

本轮盘点快照有20个 release PR（含依赖 #679 的三个 Draft）、18个 develop PR；其中相当部分已受审代码仍需目标基线适配，不是全部等待跑测试。按原任务及已有准备分支接续，不为清空列表重复实现或合入未验代码。B Full 交接快照36项作业：4项成功、1项预期跳过、6项执行、25项排队，没有已知失败；不守候完成。

接手时重新读取 PR 当前 HEAD/BASE 和实际目标分支；此处 SHA 仅证明上述动作发生过，不是永久最新候选。正式阻塞仍须按当前 PR/Backlog 核对：必要修复集成、准确冻结候选 Full、同候选官方容量/导入/ready 以及 PC/手机验收；不因 Fork 可运行就宣布发布。

## 2026-11-17 主仓尽量一次绿的云端接续

下列是本轮后续快照，覆盖上方当时未结束的状态；历史动作与原始证据不改写。Fork仅提前排错，完整主仓Required/评审/MQ/冻结候选与实机门槛照常。

当前以[三仓库按需验证](../../CI.md#三仓库按需验证)和[云端接手入口](../../TASK_EXECUTION.md#云端-agent-接手入口)接续：先在 Fork 排错，主仓库尽量一次通过；A 优先 Fast，B 仅风险必要 Full，闲置无需补跑。下方旧 M7 排期与成绩属于历史，不能覆盖本轮发版优先级。

- #677 已先暂停旧 `6b16b6e8ec74e5247dfee228d9ef4fb98a5b1583` 的自动授权并读回，再以 lease FF 至 `873d4392c02fd5ac92e653e57a78fd59f6ae63c6` / develop BASE `c2409ad750c15124b7b843c6bbfa5b222537cb75`；新 HEAD 独审已通过；[机器可读审查](pr677-review-873d4392.json)绑定 HEAD873/BASEc240、comparison6b。现有 `merge:auto` dry-run因 `Full CI routing is unknown; explicit ci:full and the exact pending impact job are required` 而 HOLD；impact仍queued，未添加ci:full绕过，须待现有impact确认路由后按该新审查重新授权，不写auto-enabled。#707 HEAD `e2feae68c855214addce2b64a8722a7354e1260f`、#703 HEAD `80114c7f466ae8a6bf03e30409a3ba5259be7d4c` / release BASE `b9bca884ed9b9831965b409885d78f719b9a567a` 已授权原生 SQUASH 自动合并；三项仍未合并。接手重核精确 HEAD/BASE、实际门禁及原生授权，不能把授权写成已集成。
- A [Full 44008162718](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44008162718) 提前发现原始失败日志尾空白导致 diff-check 失败，已按原字节无损 gzip 保留；该运行最终取消，不是 Full 通过。B [44009128502](https://github.com/v5g95m7t8m-max/Slay-the-Heavens-Fork-B/actions/runs/44009128502) 确实执行过 Windows/POSIX，随后取消，也不是 Full 通过。
- A [Quick 44022319453](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44022319453) / `edf8ec949929cb0adc2f6aaf6be6d7a1242a9e38` 虽绿，未选中新合同，不能冒认该合同已验。后续 [44023968552](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44023968552) / `d08e91d9c81e64e63cb79ad32ffa610b92557a34` 在 Node24.18.0 显式实际执行 33 项，32 通过、1 失败：真实入口缺少 releaseBootstrapWorkflowBefore 命名 import；先前 fixture 额外 import 曾掩盖该缺口，不能作为真实绿灯。后续 [Quick 44024346434](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44024346434) / `873d4392c02fd5ac92e653e57a78fd59f6ae63c6` 已读回 completed/success：33/33 显式 CI 合同、96/96 原 JS 选测及 Lua 相关步骤成功；这是该准确 SHA 的 advisory Quick 通过，不是 Full 或正式集成通过。该修复现已接续主仓 #677，正式门禁仍待。
- 旧 MQ `44013643897` / `4e399551f54662e1f022d818a0b9301418c83107` 与 `43905694325` / `f39212d2b94fbf7d4139c97f71423d8ddd92d0b3` 的精确旧 ref 均已 GET404 核对后取消，并读回 cancelled；当前有效 #673/#676 组合保留。只在真实失效后清理，不添加 watchdog 或定时轮询。
- 主仓 #677 / `873d4392c02fd5ac92e653e57a78fd59f6ae63c6` 的去重已真实生效：[Quick 44024833076](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44024833076) completed/skipped；[Quality 44024833155](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44024833155) 与 [Licenses 44024833079](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44024833079) queued，尚非正式通过。旧 `6b16` Quality `44009090907` 已由原生 concurrency 取消，不手动重复 Full，也不猜测排队内因。本机 F 盘通道不可读；尚未远端保全的 Full120 ledger 不作为云端已交付证据，也不假称已上传。官方容量、导入、ready 与 PC/手机验收仍须同候选实测。

#707 更新前正式 HEAD是 `e2feae68c855214addce2b64a8722a7354e1260f`，原授权当时有效。新的 Fork 变体 `3f890cdcdf2849ae981d9c221d2a0c390647b062` / BASE `b9bca884ed9b9831965b409885d78f719b9a567a`、comparison `e2feae68c855214addce2b64a8722a7354e1260f` 已获独审 `/root/cloud_handoff_review:pr707-preflight-slim-3f890cdc` PASS，原件见[机器可读审查](pr707-review-3f890cdc.json)。[Quick 44025235537](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44025235537)/job133843851309 的显式合同步骤 success，普通 related 尚在执行；不将步骤绿灯写成总run绿，也不把Fork候选冒认正式HEAD/授权。

Backlog 追加仅在 C 系统临时目录的原配置/精确任务原件副本上通过 Backlog CLI 1.53.0 执行；CLI完整读回逐字段核对仅 `updatedAt`、`implementationNotes` 变化，status仍In Progress、AC仍1/3。未手改任务，未运行不完整仓库的doctor或冒称全量verify:backlog。原notes完整保留，F盘通道不依赖；如远端HEAD发生变化须重新核对原件后接续。


707最终接续：上述 [Quick44025235537](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44025235537)@`3f890cdcdf2849ae981d9c221d2a0c390647b062` 已 completed/success，真实35/35显式CI合同（含B9新负控）、96/96原JS与Lua步骤成功。主控先disable-auto读回旧e2，再以lease FF主707至3f890，原生ref/PR准确HEAD和BASEb9均读回；随后使用 `--auto --squash --match-head-commit` 对准确3f890启用，SQUASH/05:40:44Z已读回。当前正式707 HEAD已是3f890，旧e2不再是当前；未声称正式CI通过、已合并或发布。677新873仍等待现有impact路由确认后按已保存审查重新授权。

主仓707去重真实读回：`3f890cdcdf2849ae981d9c221d2a0c390647b062` 的 [Quick44025702654](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44025702654) completed/skipped，[Quality44025702622](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44025702622)/[Licenses44025702495](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44025702495) queued。连同677新873的Quick44024833076，两个Ready PR均真实零runner跳过重复advisory；不推导exactly-once、不替代正式Required/MQ/冻结Full。

组织侧诊断边界：主控真实执行 `gh api orgs/FurinyaWorks/actions/permissions` 返回 HTTP403，正文 `You must be an org admin or have the actions policies fine-grained permission`，CLI提示 `admin:org`。主仓正式运行持续queued/尚无runner、同期Fork预检可运行，是可见现场；不足以判定组织并发、Actions策略或账户限制的具体根因。已异步请组织Owner核查上述组织侧条件，不请求付费、不改门禁，不扩权限方案。此权限拒绝不认证源码失败，也不作为绕过Required的理由。


## 并发接续边界

本分支 `feat/ci-minimal-handoff-1117` 是本轮最小改动的远端交接恢复点，不是 #712 当前实现。最终 lease 前发现另一会话已将 #712 从75ff推进至 `b4801643dc4371754ba98dbe96a389c546e1f9b8`，加入强制 Fork admission、完整预检与指标实现；未覆盖其工作，也未把本分支旧工作流政策自动拼入该实现。#677/#707 的已验证最小增量已分别接续正式源分支；后续协调者须统一审查 #712 与两分支的工作流及历史来源绑定后再集成。#712 当前 Fork A Full44026568101 在其 PR 正文交接为待验证；不重复派发，不把该实现视为正式验收通过。

机器可读审查恢复入口：本分支 `docs/evidence/three-repo-flow-20261117/pr677-review-873d4392.json` 与 `pr707-review-3f890cdc.json`；必须先读回当前正式 HEAD/BASE，变化后重新评审，不盲用旧授权。
