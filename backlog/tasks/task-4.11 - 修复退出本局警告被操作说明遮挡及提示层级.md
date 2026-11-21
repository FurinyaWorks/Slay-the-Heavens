---
id: TASK-4.11
title: 修复退出本局警告被操作说明遮挡及提示层级
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-10-30 21:58'
updated_date: '2026-11-21 08:11'
labels:
  - playtest-20261030
  - p0
  - grok
  - 待验
  - delivery-verify
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PC-QA-20261115.md
  - docs/backlog-details/PLAYTEST-20261030.md
  - docs/backlog-details/MOBILE-QA-20261029.md
parent_task_id: TASK-4
priority: medium
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner截图：放弃本局确认框中的「操作说明」入口直接压住失去进度的正文；说明文字冗长，重要后果与创作者提示混杂。已在10/29报告出现，本次再次复现反馈。保留真正退出的确认操作，不改结算逻辑。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 退出本局的风险说明完整可读，「操作说明」及其它按钮不会遮挡正文。
- [ ] #2 取消与确认的含义清楚，操作不穿透；与本轮 #21 精确追加文案各自核对。
- [ ] #3 按2026-11-15 PC用户最新要求，退出界面彻底移除多余操作说明及其失效触点/状态残留，同时保留放弃确认、取消继续和平台退出的准确操作；在当前最终GIL实测。
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-31：PR396@f5af0664已编码退出弹窗页眉/正文/辅助说明分层，定向布局断言覆盖互不遮挡；本轮GIL已构建读回，仍待同候选官方导入与手机实测，不勾验收。见PLAYTEST-20261030末节。

2026-11-07 看板核对（develop 2c85bc61）：实现类交付已按历史记录保留，剩余 AC 待同候选官方/设备验证；当前无在途 PR，状态由 In Progress 归 To Do（待验）。

2026-11-14第二轮状态纠正：已核对本任务原实施计划、技术附件或已有PR/修复记录；工作已经开展，未勾AC不等于未开始。 状态表示整个任务的完成进展，不表示当前有执行者持续占用；保留原未验AC、负责人、依赖及历史证据。更正过去把已开展待验事项退回To Do的处理。
2026-11-15 用户58:18–58:48明确要求退出界面‘操作说明’彻底移除；#672 声明已改，但PR未合入、同候选实机未验，保持In Progress。

2026-11-21 按 Owner 指定的 release/v2.0.0 在 PR #784 移除所有「操作说明」入口、说明页及输入状态。发布配置离线回放验证开始新游戏的取消和确认，菜单指针、手柄返回及地图回归有定向覆盖。原验收项继续等待同候选千星实测。
<!-- SECTION:NOTES:END -->
