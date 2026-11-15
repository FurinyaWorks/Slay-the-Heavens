---
id: TASK-103.6
title: 按StS骨架收敛第三代UI与统一加载反馈
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-14 15:53'
updated_date: '2026-11-15 12:37'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/TASK-88.1-PLAYABLE-20261114.json
  - TASK-4.23
  - TASK-100.1
  - docs/backlog-details/TASK-42-PC-CLOSEOUT-HANDOFF-20261115.md
parent_task_id: TASK-103
priority: medium
type: enhancement
ordinal: 179000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户在可导入且已打印ready的311c4c96版本上要求统一已有成果：StS为页面与交互主参考，已有认可的二次元平涂硬边低多边形视觉为美术来源。此前共享顶栏仍出现88/8截断，卡组排序触发底层重复刷新，长准备阶段混用简略与璃月加载。保留可玩检查点及全部真实功能，不重新设计卡框、费用球、类型带、HUD、地图或房间结构，不虚构角色、元素、卡组与遗物入口。关联旧任务仅复用源码和证据，不重做已交付组件。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 核对最新develop与660/661/662等来源去向，交付真实现状和冻结来源清单。
- [ ] #2 仅从ui_theme既有来源提取正文、标题、描边、面板、中性按钮四态的统一语义Token，保留菜单红黑白和各房间成熟布局、卡框与功能。
- [ ] #3 修复当前顶栏生命值截断与卡组排序冗余刷新，保留数据、排序顺序、输入与ready门禁并有针对回归。
- [ ] #4 长准备阶段复用用户认可的现有加载视觉，保留璃月开局机制；真实ready即揭幕，不以假进度或固定等待延长交互。
- [ ] #5 交付同源前后对照截图、最小修改方案与独立评审PR；官方/模拟器证据分开，缺项不冒称通过，维持20MB容量边界。
- [ ] #6 本轮同页卡组/排序/奖励选牌/宝箱/商店/营地/锻造/设置不无条件全屏重载，快速往返/取消/失败/迟到回调不闪黑白或露旧页；重跨页按真实ready结束，无假进度或人为固定等待。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1.冻结311可玩GIL及两轮当前build日志，核对最新远端和现有页面/Token/加载调用。2.保留StS结构与已认可美术，先修88/8文本边界与已计数证明的排序冗余刷新。3.用现有璃月视觉统一真实等待反馈并集中必要Token覆盖，慢路径不冒充GPU进度。4.复用既有SDK导出同源前后对照、定向回归和独立复审；待真实集成基线齐备再提一个小PR走原门禁，不新建整合大包。

2026-11-15 loading_pc_slice独立核当前7cb和#663既有排序成果；复现同页操作触发遮罩/重建或迟到回调的最早原因，限共享页面准备生命周期与回归，不引入固定读条、不更改预算。主线程维护任务及最终候选，官方时长仍待验。

复现细化：refreshPageVisibility在模态打开时先setVisible(false)再强行底页SetVisible(true)，可能销毁未完成准备并重排队。加载切片所有权调整为abyss_game_ui_view.lua、abyss_map_ui.lua、abyss_node_ui_lifecycle.lua及回归，保留底图与禁用底层交互分离；不改资源预算。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-15：只读重读最新官方客户端日志（文件时间2026-11-14T15:39:01.071Z，SHA256 df403556ce17bc23134731d3c1163a74beae322b2d9baef5da08a9270b25c4df，build8666c1a2）。437秒卡组visible，440/441/461秒同页updated，478秒返回battle；日志无逐点击wall-time，不能据空档认定卡顿秒数。隔离真实Host计数确认每排序额外渲染底层battle两遍。ui-v3-cohesion工作树已实现受约束的deck局部发布，保留原CardSkin清理后ready顺序、控制器及返回刷新；新断言先RED抓旧缺陷，最终当前运行时5/5 PASS、0skip，含100sort零底页重绘、异步/迟到/销毁/lease回收。历史source witness尚待与最终UI源码一并冻结，deck-browse-filters严格owner校验目前拒绝新源码；未宣称整套回归或CI通过，未构建/覆盖已可玩latest.gil。证据在.artifacts/release-closeout-20261114/deck-sort-v3-current-regression.log，待独立复审。

源码切片独立复审PASS（review_final_capacity_bindings，本轮4文件52增3删），保持CardSkin清理先于ready。补齐新树工具后原check-engineering通过：351模块、6164/6164测量，架构通过，Luacheck无新增诊断（6条既有显式历史告警）。已复用本地锁定工具及依赖，无下载/放宽门禁；更广历史对照仍待最终source witness冻结，不能报整套CI通过。

Owner明确要求立即合并发版。#661已于2026-11-14T16:21:03Z经原生队列实际合入，develop=e65d9b98fbec69442047650254238cd9244df805，树2e86f08015a661a94daf22c6f3b84ec4e55a26a1与受审58a30edf完全相同。#663 prepared已逐文件对照解squash历史冲突，合并后整树严格等于原7a6dbf28；再接已审排序修复为aa2060671da1bfd5b7151c48ae8babf7b38d5640。继续原PR，source绑定正在补齐，菜单续局、容量和已玩检查点保留，本轮不扩展UI视觉范围。

排序修复已并入原#663的最终dfd并完成精确独审/正常自动合并授权，不新建UI集成大包。最新GIL已输出Windows固定实体路径，源码冻结aa206；dfd只新增测试source绑定，全部src/data/config/scripts与aa206相同。当前只完成排序切片，顶栏文字和全局Token/加载统一等其余用户要求仍保留未完成，本轮按Owner发布优先不增加这些变更。

加载dfada6fd已独审PASS并整合70324fd2：模态保留底层page资源挂载，底层map/node控制器visible仍false且输入拒绝；pending1/3打开卡组原复现销毁/重排，修后连续8刷新不重建/清卡图。原地图27/native18、GameUI16/deck6/prologue13通过；GameUI原7cb Enum缺项99f0仅补测试真实ImageType两行，不改断言。设备闪屏与耗时仍待同候选验证。

承接A1–A3/B2/E6。底页保留与同ready模态揭幕已有修复并在be41；真实PC待验。全部按钮/旗面锯齿/分页token统一尚未完成；不得将已有共享卡面等同全部视觉统一。
<!-- SECTION:NOTES:END -->
