---
id: TASK-25.8
title: 验证新版低多边形岩史莱姆与遗迹守卫实战候选
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-14 13:12'
updated_date: '2026-11-14 15:22'
labels:
  - art
  - technical-spike
milestone: m-9
dependencies: []
parent_task_id: TASK-25
priority: medium
type: spike
ordinal: 178000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户指定的新风格双怪实战实验；复用25.7既有研究但不占用其工作树。兼容在途661轻量方案。Owner最新明确只需推送并保留独立实验分支；不保留PR，不合并、不发布。此前PR669已关闭未合并，记录保留追溯。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 保留旧391/590对照，完成双怪各三档拟合及106/127px比较与独立审美复审
- [x] #2 接入现有战斗actor及动画回收并验证双怪完整战斗和重复开战
- [x] #3 生成可导入GIL，记录多怪十手牌特效容量和性能；官方PC与实体手机未测明确UNVERIFIED
- [x] #4 推送并保留独立实验分支、可试玩候选及量产建议；不保留PR，不合并不发布
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 固定develop及661身份，复用旧源与拟合器，输出双怪三档透明大色块及真尺寸对照。2. 实验开关接入现有actor/动画，不更改默认28图元方案。3. 构建隔离GIL，执行战斗生命周期及组合负载验证。4. 独立审美与代码复审，记录PC/手机缺口并提交PR，不合并。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
本轮用户明确授权双怪新版实验；独占.worktrees/monster-lowpoly-combat，feat/monster-lowpoly-combat。25.7保留原执行者与本地成果。基线origin/develop=9f2f44e4；661=fdfca5bf。

已完成六档真实拟合与旧391/590的106/127宿主原生SDK对照。独审R4：生产替换及42怪量产No-Go，200/350建议技术A/B，349/500保留上限；不以压低图元数验收。双怪战斗SDK已通过显示、待机、敌方回合、命中扣血、史莱姆死亡、5次重开、五怪十手牌特效和0控件残留；正在补守卫死亡/图库回退及三候选同条件A/B。官方PC由用户自行导入，实体手机与官方容量UNVERIFIED。

本轮三套候选各26项真实生产Lua/SDK测试PASS、各3冷/5重开、全创建销毁相等且0残留；另4项#661原轻量共存PASS（池32、双怪14/12，全目录最大28）。独立代码与兼容增量复审均PASS。Windows交付目录：F:/New folder/交付/怪物低多边形实验-20261114；官方PC、实体手机、官方容量保持UNVERIFIED，状态暂保留In Progress待用户导入反馈。完整证据附件：experiments/monster-lowpoly-combat/README.md、evidence/AB.json与verification.json。

verify:backlog首次指出M9索引缺任务引用；已在独立工作树docs/MILESTONES.md补一条任务链接，不改里程碑范围或门禁。Fast选测对新实验目录无映射，未新增ci:full标签；本地实际执行4项合同+78项完整SDK检查+4项兼容检查及冻结链验证，常规CI结果另报。

已提交实验PR https://github.com/FurinyaWorks/Slay-the-Heavens/pull/669 ，未合并、未发布、未启用自动合并。独立分支feat/monster-lowpoly-combat；四份GIL已按manifest核对并交付到Windows独立目录。三套各26 SDK检查+4兼容检查、4合同、冻结链及verify:backlog通过；现有Fast选择器无映射，常规PR CI未宣称通过。官方PC由用户自行导入，实体手机/官方容量未验，任务维持In Progress等待本轮真实导入反馈。

2026-11-14 Owner反馈：可以啊这个玩起来还挺丝滑的，基本上没什么卡顿；明确是PC。记录为用户实际试玩的定性性能反馈，未推断手机表现或量化FPS。目前尚待确认所试玩GIL文件名/候选SHA；不把该反馈绑定到三套全部候选，也不代替官方ready、日志或容量证据。

Owner随后明确确认试玩文件为新版低档-200-349.gil。PC顺滑/基本无卡顿的反馈仅绑定该低档候选；交付manifest对应SHA256为60aa957a186c479d4d182f704cabf1ed4a966dac6ac491e036489450f1fd89a0（来自交付清单，未独立读回用户客户端执行字节）。低档已有用户PC定性体验正向反馈；其他档位PC、量化帧时、官方新日志/ready、实体手机及官方容量仍未验收。

Owner最新明确本轮只需推送并保留实验分支，不需要PR或合并。已关闭PR #669，未合并，自动合并从未启用；保留feat/monster-lowpoly-combat、四份GIL、全部证据及低档PC顺滑反馈。先前PR交付记录仅作历史，不作为后续合并授权。
<!-- SECTION:NOTES:END -->
