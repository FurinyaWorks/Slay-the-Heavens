---
id: TASK-42.1
title: PC卡牌悬停拖放及牌组排序响应专项
status: To Do
assignee:
  - Furinya
created_date: 2026-11-15 20:14
updated_date: '2026-11-18T14:00:00Z'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PC-QA-20261115.md
  - TASK-30
  - TASK-100
  - TASK-100.1
  - https://github.com/FurinyaWorks/Slay-the-Heavens/pull/670
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-verbatim.txt
parent_task_id: TASK-42
priority: medium
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-11-15 PC逐字反馈：牌组排序约需2–3秒才响应且再次加载（01:56–02:23），鼠标悬停切牌、快速甩牌/连续防御牌拖出、奖励选牌响应迟滞（14:26–14:54、17:18–17:35、26:23–27:11）；战斗中系统严重卡顿及疑似闪退（28:53–30:36），用户同时运行其他工作，根因未定。仅修当前已有输入路径和真实性能问题，不纳入 #670 的数字键、安全预输入等未来功能。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 使用有来源的统一候选，PC正常负载与用户多任务负载分开采样悬停、换牌、手牌升起、20次快速有效/无效拖放与取消，记录事件、响应耗时及设备条件。
- [ ] #2 确认快速连续释放时每张有效卡仅出一次、无效不扣费不吞牌、取消归位及新旧目标身份正确；复用 TASK-30 既有合同，不复制状态机。
- [ ] #3 按费用/类型/名称等排序重复执行并测量触发至呈现的耗时与原生更新量；不得因为排序重建全屏页面、进入准备遮罩或导致不必要重复绘制。
- [ ] #4 对战斗重载、持续内存/控件增长、资源释放及其他应用干扰进行单因素取证；区分系统卡顿、游戏卡顿和真正进程崩溃，未证实不得定性。
- [ ] #5 经实际 PC 和相关手机回归、独立评审及当前最终候选验证后才可标验收；性能改善以同机同路数据证明，不捏造 FPS 或刚性延迟目标。
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-15 实机反馈已观察到操作症状，但现有 PR #672 未宣称修好快速甩牌或系统卡顿根因，故新子任务 To Do。#670 中 TASK-109（数字键、预输入）严格为 post-release，不得偷换成本次发版范围。严重度 P0/P1，实际根因及指标待测。
<!-- SECTION:NOTES:END -->
