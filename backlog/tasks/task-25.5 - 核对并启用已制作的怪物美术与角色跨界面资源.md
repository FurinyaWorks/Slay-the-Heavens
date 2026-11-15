---
id: TASK-25.5
title: 核对并启用已制作的怪物美术与角色跨界面资源
status: In Progress
assignee:
  - Furinya
created_date: '2026-10-30 21:58'
updated_date: '2026-11-15 18:58'
labels:
  - playtest-20261030
  - p1
  - gpt
  - delivery-verify
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PLAYTEST-20261030.md
  - docs/backlog-details/MOBILE-QA-20261029.md
  - docs/evidence/release-pc-item-title-shadow-20261116/README.md
parent_task_id: TASK-25
priority: medium
type: task
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner说明：**怪物自制美术目前在实际战斗中一点也没用起来**；旅行者自制美术**已经用于战斗**，但选角页、开局七天神像事件未正确体现。应区分这三件事实，不写笼统「自制美术未启用」。当前候选美术开关缺省关闭，只有开发/发布人员能指定，需与现有性能/资产准入合同一致。GROK负责界面呈现协作。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 已有且获准的自制怪物美术在指定候选中得到真实绑定和展示，尚缺的明确列出；不把官方图库回退当作自制素材。
- [ ] #2 已在战斗可见的旅行者形象保持不退化；选角/开局的自制资产身份与配置可核验。
- [ ] #3 开发开关/候选来源、性能和实际设备验收分开报告，不擅自改变用户已批准的发布安全边界。
- [ ] #4 #676 旧任务 TASK-25.5 AC4：旅行者战斗角色需有与现有怪物一致且低成本的接地阴影，角色与场景不显悬空；截图12与27:42反馈为观察，不自动推断性能开销，需同候选PC/实体手机对照。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 保留完整18资产注册表，候选运行白名单仅acid_slime_m r02。2. prepareMonsterArt先全量合法性校验再按名单派生，统一输入清单、装配和收据，缺省美术关闭。3. 负例与未选零装配定向验证，交主线程集成；官方导入、设备与最终画质仍未验。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
完整18资产及原绑定源保留，candidateAssets仅acid_slime_m；prepare先完整合法性校验，再派生实际assets/绑定/输入。完整构建、音频前源码摘要和收据同一路径，不新增远程/玩家开关；默认flags仍false。新白名单回归先红3失败后绿4/4，未知/空/重复/非串及未选非法资产均拒绝；旧无名单fixture仍18资产19绑定。32flag构建/receipt/新测试合计55项，54通过、1 Windows符号链接权限skip、零失败；完整CLI-MCP mock装配1/1通过，实际写入仅1资产1绑定2输入。当前仅准入Alpha测试，不表示官方导入、设备性能、最终美术或神像接线完成。

2026-11-07 看板核对（develop 2c85bc61）：未发现实现提交或在途 PR，状态由 In Progress 归 To Do（未开始）；范围与原 AC 不变。

2026-11-14第二轮状态纠正：原notes已记录Alpha资产白名单、55项相关回归及CLI-MCP装配切片；11/7未发现实现的结论与这些证据矛盾。 状态表示整个任务的完成进展，不表示当前有执行者持续占用；保留原未验AC、负责人、依赖及历史证据。更正过去把已开展待验事项退回To Do的处理。

PC21原product862c已基Release36组合到df5ad3dc，源脚位/椭圆/flags及painter逐blob保持。组合shadow2/2、工程351/6169/1993无新诊断与日常负载0（5增长warning保留），组合独审限定CODE_SCOPE_PASS_WITH_LIMITS；独立源旧67只保留源身份。最终同源GIL/PC手机画面及官方容量未验，Task原美术替换范围不扩，AC不勾。

2026-11-16 原5个source失败在c46输入已实测补验，与新源4+raw成本1合计10/10；该结论不外推后继。实际Full raw discovery发现阴影夹具缺正式profile，2167162e增加隔离数据/UI配置及有效入口回归；独审SHADOW-H01纠正真实布局快照为abyss_ui_layout，c34443bc后3/3通过（18,851.0625ms）。根raw-shadow-profile日志保留原nilfigure及TEMP父目录缺失失败，非产品新失败或全局runner缺陷。harness独审限定通过，47CI输入/已知父测成本正在最小接续；同候选官方画面、容量及PC手机仍未验，AC不勾。

阴影raw Full入口最终增量e2eb/aac现已SOURCE_CI_COST_INCREMENT_PASS_WITH_LIMITS、findings/unresolved空；当前47CI与778样本物理前后核验，shadow仅自身floor投影、原retirement79,861ms及全部旧cost/receipt不变。新鲜shadow3/3 wall22,235ms，旧nilfigure/TEMP失败与快照修正证据保持。最终58输入覆盖；实际workflow超时及负控硬验，预测仅诊断，不授设备或发布许可。#692新基线接续/同候选官方PC手机仍未验。
<!-- SECTION:NOTES:END -->
