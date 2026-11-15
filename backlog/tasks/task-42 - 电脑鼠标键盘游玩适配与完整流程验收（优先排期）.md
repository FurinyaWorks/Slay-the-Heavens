---
id: TASK-42
title: 在电脑上用鼠标和键盘完整玩一遍
status: In Progress
assignee:
  - Furinya
created_date: '2026-10-23 12:23'
updated_date: '2026-11-15 12:37'
labels:
  - awaiting-live
milestone: m-8
dependencies: []
references:
  - TASK-4
  - TASK-10
  - TASK-30
  - docs/design/UI_DESIGN.md
  - docs/backlog-details/TASK-42.md
  - docs/DELIVERY-CLOSEOUT.md
  - docs/BACKLOG-AUDIT-20261026.md
  - docs/backlog-details/TASK-42-PC-CLOSEOUT-HANDOFF-20261115.md
  - TASK-42.1
  - TASK-110
priority: medium
type: feature
ordinal: 40000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
在PC鼠标键盘上用同一候选验收当前公开的岩系旅行者第一、第二幕，记录设备与真实操作结果；雷电留未来版本。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 鼠标选牌、看详情、选敌人、出牌、取消和结束回合正常，不重复执行。
- [ ] #2 可用键位有说明，键盘能切换焦点、确认和取消，不与原神按键冲突。
- [ ] #3 鼠标键盘能完成地图、各类房间、领奖、胜败结算和重开。
- [ ] #4 保存电脑实测结果，有限制或没做好的地方写清楚。
- [ ] #5 同一候选实测跨战斗首次点牌、旧触点、药水、奖励、弹窗和取消退出的真实事件派发；已完成本地手势切片不能代替电脑验收。
- [ ] #6 2026-11-15 PC反馈A1–G2在交接覆盖表逐项有唯一任务、修复或延期状态与本轮证据；核心未修和设备未验清楚列出，不以CI或减容代替全面完成。
- [ ] #7 同一候选按当前SCOPE仅验岩系旅行者第一、第二幕、换幕、胜败与重开，保存真实设备证据及通关耗时；旧两职业文字不再作为当前比赛要求。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
2026-11-15按用户PC全面收口授权接续：先核截图/原逐字记录和候选身份、既有PR/任务去重；隔离加载、商店、战斗、退出菜单切片，复用共享组件；红绿/独审/组合来源与候选读回后交新命名GIL，保留7cb；真实PC完整流程和受影响手机路径未验不勾AC，不开发#670新功能、不发布。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-27同类范围审计：承接已批准四职业与第一至隐藏第四幕完整范围及原创角色责任，纠正仅第一幕总验收口径；原验收证据保留，本轮新增要求均未勾，不声称新增实机通过。

负责人字段规范化：原记录 @Codex 作为历史执行者信息保留；任务负责人为 Furinya。

2026-10-28用户确认范围变更：当前比赛只覆盖第一幕、第二幕，优先前10分钟体验；第三幕/隐藏第四幕/真结局及依赖退出续玩、跨局进度、历史解锁或跨局留卡的内容退出比赛必做，保留为无新截止日的未来候选。四职业及已批准原创角色要求不变。同局跨房间、第一幕到第二幕的资源与随机流、内存快照/回滚和本局结算保留；源码/候选/平台/实机仍分层，未完成状态不因范围调整改变。
原AC6（仅保留历史要求，不再作为当前比赛必做）：同一候选四职业及已批准原创角色的完整操作矩阵覆盖第一至隐藏第四幕、换幕与两种结局，逐项保存真实事件及设备证据，第一幕单次通关不代替。

2026-10-28范围决定：比赛范围见 docs/SCOPE.md；旧验收文字保留于历史记录，本次未新增通过证据。原受影响验收：同一候选四职业及已批准原创角色的操作矩阵覆盖第一幕、第二幕、同局换幕、本局胜败与重开，优先前10分钟上手与反复操作；逐项保存真实事件和设备证据，未测内容明确留待验，不用预览替代。

2026-10-31规划校正：AC6中的旧「两职业」按docs/SCOPE.md现行决定仅验旅行者两幕；原AC不重写、不勾选，候选/设备证据要求保留。
2026-11-03 赛后调整：m-5 → M7（产品体验与核心特色）；保留状态和未验 AC；旧截止日期 '2026-10-28' 已移除，不设新期限。

task:pick=ALLOW，owner沿用Furinya。新问题矩阵.artifacts/pc-closeout-1115/COVERAGE.md；12原图manifest已保存。#661已合e65；#663 b2fb独审并推送、auto-merge-requested。既有battle-input-followup等脏树保留，由独立新树协作；逐字记录已询问路径尚未取得。

Owner已确认本轮提示词就是录音精髓且足够执行，不再索取/等待原逐字稿；证据矩阵按条目+图号引用，不编时间点。版本路线图已读取#665源分支docs/v2-release-roadmap-20261114，旧#661未合快照与当前Git实际合入分开；本轮不升版本、不打Tag。前后离线合法同局各11场景/双分辨率共44图已生成，非官方/手机证据。

后续全部修复/CI/验收再统一交Windows完整路径。572候选369模块读回/静态0错误，strict UI审计仍24处非SDK metadata FAIL，其余全字段/几何一致。新候选官方容量未测，新增图标导致文件比7cb增加502469B，不能沿用19.78MB。PC功能后续ID已在PR670纠为42.1，原PC109归档保映射，TASK110归29.1不变。

只读找到用户本次PC时间段官方日志2026-11-15_14-21-48_156，原GIA SHA1eb3672541f043829b8ad0a32676a194e57460bb72ae425b6864702494d6a704，24条只有BGM_APPLIED及1569s SETTLEMENT_DEFEAT；没有ABYSS_BUILD/客户端ready，故不认证试玩候选身份/不把缺错误记录当没报错。本轮user-pc-log/original.gia与decoded.json已归档，未操作窗口或输入。

2026-11-15最终产品冻结9b7794e944eb8dde1c5e9f9b2c1800dc5d653caf，干净独立树实际构建build e1d18bca-a2d9-4599-9786-3b831ac89bff；新包F:\New folder\playtest\pc-closeout-9b7794e9.gil，SHA256 cbf98fa7fe9362f3703388df057b00a36b3825307bdc5d9d087fece9092c8b27。293路径精确产品独审PASS；正式真实GIL严格读回369模块/UI25480一致、0issues、0error/426warnings，24个flagBounds缺陷已正式闭环；旧失败证据保留。证据.artifacts/pc-closeout-1115/review-candidate-9b7794e9-strict.json与visual-final-9b7794e9/index.html。用户最新明确自行导入，未让出键鼠窗口；官方容量/ready/PC/受影响手机继续未验，不勾AC、不发布。原7cb/latest哈希不变且19.78MB结论不迁移。PR672后续仅tests/source追加，与候选9b身份分开并须逐构建输入blob一致；源码兼容及原CI仍在收口。

最终PR672已正常推送1f7ce04c53189db8c39b59c797a45d57a2c7bac1/basee65，301/301路径独审PASS；后续仅17tests，7161非tests条目和644build inputs同9b候选。来源21/21/fresh5/5/成本6/6，原128MiB冷检出133670582B。Linux预测目标超12298ms如实保留，既有45/30min硬限/18+15分片/38jobs/timings未变（docs/CI已有Owner政策）。merge:auto因663未合HOLD；663当前检查成功且原生队列AWAITING_CHECKS，不重复arm/轮询。最终CI已触发交接QUEUED，不能视为PASS。完整矩阵与报告.artifacts/pc-closeout-1115/COVERAGE.md及FINAL-REPORT.md。用户自行导入9b新包，官方/设备仍未验，不Done。

2026-11-15用户要求停止开发、推送并交接。完整原始范围及逐项状态见新增附件。官方9b容量20.1781>20失败；新be41官方/ready/PC/手机未知。#663已合c240，#672 HEAD1f仍OPEN且CONFLICTING。已推be41/b56/fc999三个保存分支；fc999成本5/6未准入。不得沿用旧完成口径，新会话按附件继续，不发布。
<!-- SECTION:NOTES:END -->
