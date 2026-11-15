---
id: TASK-4.11
title: 修复退出本局警告被操作说明遮挡及提示层级
status: In Progress
assignee:
  - Furinya
created_date: '2026-10-30 21:58'
updated_date: '2026-11-15 12:37'
labels:
  - playtest-20261030
  - p0
  - grok
  - 待验
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PLAYTEST-20261030.md
  - docs/backlog-details/MOBILE-QA-20261029.md
  - docs/backlog-details/TASK-42-PC-CLOSEOUT-HANDOFF-20261115.md
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
- [ ] #3 按用户本轮明确要求从退出界面移除操作说明及实际layout/监听/guide/modal/HUD依赖，取消与确认不穿透，保留真实退出风险提示。
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-31：PR396@f5af0664已编码退出弹窗页眉/正文/辅助说明分层，定向布局断言覆盖互不遮挡；本轮GIL已构建读回，仍待同候选官方导入与手机实测，不勾验收。见PLAYTEST-20261030末节。

2026-11-07 看板核对（develop 2c85bc61）：实现类交付已按历史记录保留，剩余 AC 待同候选官方/设备验证；当前无在途 PR，状态由 In Progress 归 To Do（待验）。

按2026-11-15用户明确要求，menu agent在独立树移除退出界面操作说明及真实绑定依赖；保留导航/确认/异常退出，扩展核mobile_hud直接help引用避免触屏初始化崩溃，设备未验不勾AC。

本轮已实际实施退出操作说明删除并核直接依赖/当前导航回归；保持原未验AC，等待最终集成与设备，不退回To Do或无证Done。

承接F8。代码依赖清理已在9b/be41且回归/独审通过；未提升设备AC。
<!-- SECTION:NOTES:END -->
