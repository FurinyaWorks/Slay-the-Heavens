---
id: TASK-4.11
title: 修复退出本局警告被操作说明遮挡及提示层级
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-10-30 21:58'
updated_date: '2026-11-15 21:00'
labels:
  - playtest-20261030
  - p0
  - grok
  - 待验
  - delivery-verify
milestone: m-8
dependencies: []
references:
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
- [ ] #3 #676 旧任务 TASK-4.11 AC3：按2026-11-15 PC用户最新要求，退出界面彻底移除多余操作说明及其失效触点/状态残留，同时保留放弃确认、取消继续和平台退出的准确操作；在当前最终GIL实测。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
2026-11-15 Release接续：从36b9b157选择性适配cb1ea99a，移除退出/暂停操作说明控件、监听和返回分支；保持现有确认、取消、平台结算与C档。源码/Host回归及独审记录到RELEASE-PC-NAVIGATION-20261115，最终GIL设备AC不勾。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-31：PR396@f5af0664已编码退出弹窗页眉/正文/辅助说明分层，定向布局断言覆盖互不遮挡；本轮GIL已构建读回，仍待同候选官方导入与手机实测，不勾验收。见PLAYTEST-20261030末节。

2026-11-07 看板核对（develop 2c85bc61）：实现类交付已按历史记录保留，剩余 AC 待同候选官方/设备验证；当前无在途 PR，状态由 In Progress 归 To Do（待验）。

2026-11-14第二轮状态纠正：已核对本任务原实施计划、技术附件或已有PR/修复记录；工作已经开展，未勾AC不等于未开始。 状态表示整个任务的完成进展，不表示当前有执行者持续占用；保留原未验AC、负责人、依赖及历史证据。更正过去把已开展待验事项退回To Do的处理。

PC38产品提交a9425afa50e2a1dd10e83634a3e5fc0d24633917，真实旧代码4项来源回归失败中含说明控件/模态残留，移植后退出3项与布局5项通过。相关完整运行16/20：4冻结来源合同未接续，保持失败；首次缺生成文件失败另留。独立复审与源/CI接续在执行，未开PR、未生成GIL、无官方/设备验收，不标Done。

产品a9425afa独立release_final_review CODE_PASS_SCOPED/unresolved=[]；报告docs/evidence/release-pc-navigation-20261115/independent-review.json（SHA256 28120836c86d7713573b7263695c6a28a9c521ba92e353bc5f5db52063237faf），32几何/C焦点/旧回调与完整Run保持独立探针通过。4来源FAIL正接续，仍不代表Full或设备验收。

导航源适配10200974已以eea1b85d接入，证据196de2e1→fb293c10；9/9小绑定、44/44旧来源、73/73CI合同通过。实际集成树新鲜352生产/879JS/1424Lua全库存与当前绑定通过，原4个源FAIL已本轮4/4通过，不冒称整20项重跑或Hosted Full；来源独审仍在执行。

导航来源初审NAVSRC-1/P2已修：1e7c1c52→0f5b8dcb补当前forecast<target，guard及原预算不动，旧7ad packet原字节保留。来源组合独审a942→1e7 CODE_PASS_SCOPED/unresolved=[]（SHA0379c4e867cdd5aeaa580c9acdaabae4be97f7560e44921a95237fdc6265ad77），初request_changes保留。main69a9实际集成新鲜4/4，Win1757923<1800000/POSIX1191630<1200000。23执行输入逐blob匹配两份独审覆盖，准备正常Release PR；HostedCI/官方PC手机与容量仍未验。

2026-11-16 代码38fa3277/绑定dc50bea8已按docs/CI.md168纠正新增预测硬门槛，forecast仅诊断，实际workflow45/30/local75仍硬验；产品a942不动。当前5/5，独立policy增审CODE_PASS_SCOPED/12个直接job负控通过，原REQ与错误建议原文保留并更正。CI packet只单after+leaf，其他22行/before/93归档/库存保持，不重73/44/Full。共同前置PR692尚未合，后继须按新Release接续，未把代码独审当设备或发版许可。

2026-11-16 本轮追加：共同前置#692已合，实际Release新base为1cc5479b713edab6fd26db4e20f8eb22b7401cb2；PR690代码独审HEAD 685d3ace14598a093a8e710042264b4a0780b944限定通过，Source/CI9/9、raw硬guard4/4、copy/corpus3/3，原独审报告和同reviewer支持bundle见docs/evidence/release-navigation-bootstrap-1116/independent-review.json及manifest。本轮仅归档和CLI附记；Source约20.6秒、每正投影123读约33MB是重复fresh成本限制，不是性能PASS。当前Hosted Full、同候选官方导入/ready/PC手机/容量仍未验；PC06色调/资源解释等产品要求未验，保留旧notes与所有checked（含#676不新勾），status保持In Progress，不授合并或发布许可。
<!-- SECTION:NOTES:END -->
