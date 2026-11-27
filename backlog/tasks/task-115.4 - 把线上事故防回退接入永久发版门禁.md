---
id: TASK-115.4
title: 把线上事故防回退接入永久发版门禁
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-25 21:00'
updated_date: '2026-11-26 05:11'
labels:
  - v2.2.0
  - release-gate
milestone: m-8
dependencies: []
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/959'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/966'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/968'
  - docs/backlog-details/TASK-100.md
  - docs/backlog-details/TASK-4.21.md
  - docs/PLATFORM_LOAD.md
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/991'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/993'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/998'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1001'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1008'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1012'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1021'
documentation:
  - docs/versions/V2.2.0-RELEASE.md
parent_task_id: TASK-115
priority: high
type: task
ordinal: 211000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：v2.1.1 修复版已上线，#959、#966、#968 及既有性能/平台机制已有实现与对照。

任务：接续 TASK-100、TASK-4.21，复用负对照和六档资源配置，接入日常 CI 和冻结发布流程。

边界：沿用门槛和正式有声美术配置。证据不可比就登记实际差异。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 覆盖已确认根因及有效负对照，轻量持续检查和冻结候选完整门禁可重复执行
- [ ] #2 在明确的正式配置接续样本验证同工作负载、六档实限和极端档退化恢复，独立评审核对可执行门禁、基线和证据字段；最终候选完整验收归 TASK-115.13
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
已派发永久门禁开发。真实 Docker、cgroup v2 可用。0.5 CPU、1 GiB、无 swap 的实际配置已读回，正式配对和门禁集成待验。

正式配置同一 1 CPU/2 GiB 环境三对样本中，选角打开 P50 约 201→4285 ms，地图进入约 609→1996 ms。原始配对报告 SHA-256 80115294e539d04e5b07fc385a3c8c97350d954cb4b093c507adceb06dbe8928。离线结果已锁定，候选继续保持待验。

#991 在 develop af77f13e30d38f6547ac4ec6bced53a588a846ee 接入普通 Release 性能门禁。精确源码独立复审、34 项定向和 7 项原冻结合同通过。Fork Quick 素材恢复两次失败，测试步骤未运行。实际中档三对的 c9897afd 修复试验与上线基线对照仍有 5 个耗时告警，保留原始报告摘要 e49b4749a944102ab5b75f051377e4017bd599a496ac2c779ddb6eacaaeda86d。最终 GIL 六档、平台和实机待验。

#993 合入 develop 5e318736e0de5c0a34fb17f2961a5a66cd577a70，独立评审 6066158756、32 项定向和 Fork Quick 45717471692 通过。Hotfix 使用同一冻结 Full、正式 GIL 和既有性能门槛。该 PR 验收源码接线，线上实测及设备门禁仍待完成。

已核对线上 v2.1.1 实际归档 afe80c0783d0d4b6046c1f44cba3ef2b71cb8bb34fbc7404d939d12e0f5ff831，在 1 CPU / 2 GiB / 无 swap 的 cgroup 完成 14 个 Host 阶段。真实包性能接线候选 #998 独立评审 6066612713，37 项定向合约、原 Release Bootstrap 与缺包在 Docker 前失败的负对照通过。Fork Quick 45723780259 两次未完成 Git LFS 恢复。待获取当前候选实际 GIL、正式同包六档配对及设备证据。

#998 已以实际独审树合入 develop 8a5f86813e993a9b8cd85dd8016a2943d4a7c629。正式性能工具接受真实 GIL 中模块及运行时图；当前候选和正式配对仍待实际有声包。

#1001 对正式性能配对的两臂分别读取精确源码音频清单并核验实际 GIL。已用线上 v2.1.1 原包读回七信号，源为 06c2577e，缺信号、额外信号与不匹配来源负例拒绝。候选依实际 454b5897 基线通过独立源码评审 6066999001、25 个合同及 Fork A 45729924380 Advisory Quick。新版实际有声包及配对六档仍待完成。

选角备用立绘显隐去重的本地候选 d23fa9ea2f4ab4f37c1e0e6e8c36a715ea5c9d48 获独立定向复审。冻结 a87 的原正式构建脚本和历史归档适用，并验证实际现行入口逐次拒绝旧校验文件。原 6 项定向通过；实际最终 GIL 的性能对照仍待取得候选。

实际 GIL 每臂曲目来源 #1001 已接续到 0a10bd9c，HEAD 5c96301f8e49f427257a929260efdf0c4fb6728d、树 0cd5db9a0ce6ae87caed2a424686f2b87f7731b6。独立原生评审 6067501339，正式 25/25、历史及奖励 6/6、LF 和 CRLF 各 3/3，Fork A 45738223303 通过。实际线上 GIL 复读 375 模块、16 模板，同一包对不同曲目源码臂拒绝。正式候选的六档、超载恢复和实机继续待验。

#1001 经管理员 PR-only 合入 fb356bf9fd876c48e60cd67fb6ff654ea192b503，实际父为 0a10bd9c、树 0cd5db9a 与独审及精确 Fork 一致。该补丁只负责真实 GIL 曲目来源绑定，首个正式有声包、配对六档及官方客户端继续待验。

第二幕正式压力门禁已合入 #1021。真实线上有声 GIL 完成原14阶段和同档第二幕。新 V3 生成样本在 1 CPU、2 GiB、零 swap 下完成指定场景与 249 个可见图元，候选和恢复拒绝缺背景/低槽。正式双 GIL 六档、连续稳定性以及设备验收仍待同包。
<!-- SECTION:NOTES:END -->
