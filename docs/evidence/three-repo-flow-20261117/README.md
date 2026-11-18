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
