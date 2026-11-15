---
id: TASK-103.3
title: 完善主菜单选角与Neow的V25视觉和加载体验
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-11 08:07'
updated_date: '2026-11-15 12:37'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/TASK-42-PC-CLOSEOUT-HANDOFF-20261115.md
parent_task_id: TASK-103
priority: medium
ordinal: 171000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
接续已合并607与待合入621的战斗技术成果，集中完善非战斗入口三页；其他页面已有执行者，避免重复移植。用户要求独立PR，不合并不发布。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 三页对照批准V25完成真实画面与交互黑盒评审，差异和未验项有证据
- [ ] #2 复用官方素材现有组件和生命周期，保留同源性能基线及回归证据
- [ ] #3 同候选贯通菜单到选角祝福地图战斗，交付可试玩入口和独立审查PR
- [ ] #4 本轮选角正式ready后立绘不被整幅错误蒙暗，半透明仅作用于批准HUD区域；保存同候选画面及蒙层生命周期证据，贯通入口导航。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1.核对621与现有三页/冻结原稿，复现真实画面和加载症状。2.在现有布局与生命周期内复用官方素材和有限组件，保留规则与其他页面。3.同候选SDK/真实渲染黑盒及性能配对回归，621合入后验证完整流程。4.独立复审与相关门禁，交付试玩入口和独立PR，不合并发布。

本轮Owner直接指定：以最新develop独立feat/constellation-gold恢复选中卡片金色命之座。唯一LFS PNG校验5780bc54，提取Alpha并按实际118px拟合有限静态原生几何，复用生命周期并移除首字覆盖；提交并排、实际游戏、节点与生命周期性能证据，独立复审及完整CI/Merge Queue后合develop。追加页面布局按杀戮尖塔选角页对照，生命/金币/初始牌组统一，返回与开始按钮允许平滑统一实现。未取得实机证据不验收。

Owner本轮再次纠偏：只精修当前选角页，标题仅显示旅行者；返回与开始按钮恢复原版旗帜轮廓/材质并用少量原生几何而非锯齿扫描条；查看牌组入口按原版信息层级与颜色整理；修左侧生命金币遗物牌组的暗色衬底、阴影与间距。保留93命之座与1600背景，先真实Simulator截图和交互/节点检查，再交一份固定候选，不让Owner反复导中间包。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
独立工作树.worktrees/noncombat-v25，Draft PR623、HEAD bd9fc7ee。R2自然菜单→选角→Neow→地图→首战及20次选角返回通过，实际截图/SDK/浏览器证据在该分支docs/evidence/noncombat-v25-20261111。试玩http://127.0.0.1:55875/。主菜单原高图元背景留Owner技术评审，不替换数据/开关；加载仍有等待。621仍OPEN，尚待合入后最新战斗集成。任务保持In Progress，AC未勾，不合并不发布。

本轮选角专项：LFS命之座原PNG SHA5780bc54已核；Owner追加杀戮尖塔布局与最新1600旅行者背景。初稿222线段因Owner指出未来多角色成本继续压缩为93图元（44线+49原生圆弧），候选2f7960d0静态写入读回完成，实际渲染复审中。222轮SDK20重入/根销毁0与33画像来源生命周期通过，仅作前轮离线证据。Owner选择自行导入，尚未让出键鼠窗口，未执行官方操作/未取得本轮实机验收，不勾AC。

选角最终源码736e36a1、PR662（Draft）：已固定93图元（44线+49原生环形弧线），改为Simulator与原生共用横向弦裁切；72a73a22为干净源码候选，361模块/22865节点独立逆向0差异。最终同候选Simulator截图SHA7a7f09cc…d6fd6，独审selection-native-readback-736e-r5源码及Simulator静帧PASS；20往返节点不增长、根0，首次模型872.19ms、热P95128.79/最大220.69，仅离线模型指标。证据docs/evidence/constellation-gold。Owner明确先看Simulator页面截图，不要反复要求导中间包；官方新ready/设备/游戏截图尚未取得，不勾AC、不合并，后续只交已确认的固定候选。

Owner补充命名切片已实现：整个游戏角色显示名统一“旅行者”，覆盖选择预览/角色按钮、共享标题/节点战斗HUD及叙事5处；内部ID/元素/玩法与其他角色名不变。build:data、build:theme、build:ui通过；game_ui_classes 12组、noncombat_v25_menu 41项、competition_character_admission通过；原生预览合同3通过1可选浏览器集成跳过。独立只读复审 traveler-name-working-8915cfb-r1 PASS。按钮与信息区精修、同候选实机及合并仍未验收，不要求Owner导入中间包。

Owner已审阅认可当前交付，明确要求PR662进入正常自动合并并结束会话，不守候CI。PR已Ready并加ci:full。自动入口发现仓库更名白名单缺新名，已核对不可变仓库ID1429751262，仅补FurinyaWorks/Slay-the-Heavens别名并保留所有ID/rules门禁；47自动合并测试通过。当前HEAD f0581b708a62378fa838233139d2efef1db7ed8b，BASE9f2f44e4c79789fbcb64a515938765dbc240f830。正在执行精确独审/授权读回，官方实机手机仍未验证，不标Done。

按Owner要求已完成异步合并交接：PR https://github.com/FurinyaWorks/Slay-the-Heavens/pull/662 已Ready；merge:auto正常握手与原生读回成功，state=auto-merge-requested。精确HEAD f0581b708a62378fa838233139d2efef1db7ed8b / BASE9f2f44e4c79789fbcb64a515938765dbc240f830；独审selection-final-admission-f0581b7-r7 PASS。证明文件 F:/New folder/.worktrees/constellation-gold/build/delivery/auto-merge-662-f0581b708a62.json；之后若需合后验证，在该工作树执行 npm run verify:delivery -- 662 build/delivery/auto-merge-662-f0581b708a62.json --merged。GitHub自行等待门禁并推进队列与squash，本轮会话按Owner要求结束，不轮询CI，不清理唯一证据/工作树；尚未声称已合并或发布，未验实机手机及合后交付保留未完成。

承接E3，图6/7。只识别fallback 0.35 veil，不是正式ready根因或修复证据；此项尚未完成。
<!-- SECTION:NOTES:END -->
