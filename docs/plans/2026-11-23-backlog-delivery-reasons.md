# Backlog × Git 交付同步（REASONS Canvas）

2026-11-23 · TASK-87.1、TASK-87.2 · develop 基线 `73c21489efaab409d4c0c46bee517d410d3427fc`。接续 Draft #910 的治理与第三幕内容，来源 HEAD `154f1f9e9b2c7363bf44116333ef1923cf669893`。来源仍为开放 Draft，核对时无 review、评审线程或评论。第四幕开发许可已按 Owner 当前决定纠正。

## 需求与事实来源

Backlog 原生任务记录状态、AC、依赖和下一动作。GitHub 的实际 PR、merge SHA 与目标分支确定合入；关闭未合入的 PR 留作来源。由合后验证入口生成精确交付回执，候选收据、官方日志截图及设备记录证明产品验收。Google 项目总表展示进度。证据依次核对源码、目标分支合入、实际运行入口、自动化行为、正常游玩、同候选官方导入和 PC/实体手机、实际发布。

## 实施与运行

1. 开工查原任务、全仓在途切片和历史继承。运行 `npm run task:pick -- TASK-ID --live`，或在既有 `check-pr-slice --start` 命令附 `--live`。当前三仓 PR 声明同任务实施时返回 HOLD；仅以 recorded 对账的 PR 不占用独立开发切片。独立切片用子任务 ID 明确自己的范围，仍须核对未显式标任务的 PR、分支写入和唯一执行者。
2. PR 内用一个 `Backlog:` 声明覆盖改动任务。用 `Tracks:` 明示额外的正式任务，相关任务须声明处置。无正式任务时用 `Backlog: none` 和单行 `Backlog-none-reason:`。Quality 的 PR guidance 校验准确组合的任务文件清单；独立审查核对声明与实际交付范围。
3. 正常队列合入后跑 `npm run verify:delivery -- <PR> <preflight-or-intent.json> --merged`，使用真实 GitHub 合并与 push Full 证据；匹配实际 develop、合入任务快照和 CLI 读回。写入说明包含 PR、完整 SHA 及剩余 AC。任务变化或 CLI 中断保留 checkpoint，继续前先核对；在独立干净工作树运行，基于当前 develop 提交同步结果。
4. 用既有 `branch-hygiene.mjs` 巡检。48 小时窗口的 `backlog_delivery_drift` 包含 PR、SHA、任务、状态、剩余 AC 和问题。以 PR、merge SHA、任务、差异为身份对比上次报告，只通知新增、升级或恢复。巡检保持只读，使用已有手动工作流或每日巡检；GitHub 的定时 workflow 定义随后随默认分支发布生效。
5. `recorded` 表示 Git 已交付该任务记录，合后验证只读核对其快照。对于 `verify`、`continue` 等，由负责 Agent 通过 CLI 保留可审计的 delivery 备注并提交。设备 AC 由同候选证据单独勾选。实际验收完成以后才执行 Done。

## 已核对的来源和接续

- #767 `fc7ab7d1e5f0d7fbd4429678b220d72aaa7b25ae` 已合，覆盖关闭来源交接与 Release 回流。TASK-87.1 AC5 等本轮独审、队列与合后验收。#729 `de72920e8dac3bd6267641e110cf30c17c13888d` 已合，覆盖传递依赖准入，正文 `Backlog: none`。已由 CLI 补记 TASK-87.2，保留待核的独审和收尾 AC。
- #907 开放，本轮观察到 HEAD `00cd3aef7830b05cefdbb8ddd44f6110ae4ba487`，牌组排序和翻页字号由其原执行者接续。已合入的相关实现是 #899 `392fae8d8dee2bd57829dda0e8da836f45107398` 和 #904 `103aa4072bd3801deb6bf090455bd974181a9647`。TASK-103.6 继续核对候选的黑闪、切换和连续操作。#909 的第二幕音频和交互亦在途。
- 已核对的地图、药水、商店、分裂、动效及性能收尾写回 TASK-4.13、38.4、38.6、16.1.6、29.3、4.21。按各任务保留正常流程及同候选 PC/实体手机 AC。
- [M9 职业、第三幕、美术及容量索引](2026-11-23-m9-acts-classes-reasons.md)

## 验证与边界

复用既有 Backlog CLI、依赖检查、Quality、合后验证和分支巡检。针对未合 PR、错 SHA、更新竞争、重复备注、虚假无任务声明及审批冲突保留自动化反例。Owner 批准第三幕 develop 源码，第四幕等待真实平台能力与再次审批。M8 产品验收、M9 独立源码、V4 量产准入和发布各依其实际依赖执行。
