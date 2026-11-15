---
id: TASK-4.15
title: 修复药水说明截断与不同药水图标混用
status: In Progress
assignee:
  - Furinya
created_date: '2026-10-30 21:58'
updated_date: '2026-11-15 12:37'
labels:
  - playtest-20261030
  - p1
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
Owner截图：肌肉药水描述末尾在「人工」附近截断；两种不同药水在顶部槽位几乎相同图标，容易误用；开局另有HP显示成80/8的裁剪疑点。须区分素材区分度、源字符串、文本布局和实际状态，无需提前规定实现步骤。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 肌肉药水及其余长描述均完整显示，文本真实含义和使用/丢弃控件不被裁剪。
- [ ] #2 不同药水可通过正确的图形/语义可靠区分，保持原有效果和点击确认规则。
- [ ] #3 顶部生命等数值完整显示；裁剪问题与真实数值异常作出区分。
- [ ] #4 本轮药水弹窗统一既有全局风格，使用/丢弃与长文正常；商店及顶栏实际运行时映射可区分不同药水，不以资源文件存在代替集成验收。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
本轮仅针对截图HP裁剪增加map/node数值框横向余量，保留字号/autoSize/数值规则与战斗框；先核对真实GIL旗标，再验证最终布局邻距及真实宿主字符串，实机待复测不Done。

2026-10-31：从7adc71b6独立短修，先以实际生成字号/换行容量和药水重复视觉证红；仅修药水弹层与区分语义，不改HP、药水规则或美术开关；定向回归并交主线程独审，设备验收保持未完成。

2026-10-31 接续PR433全池辨识：复用既有每槽label，固定唯一双字中文短名竖排与瓶图左右并列，保留圆壳/tint和五物理槽点击。严格检查药水主目录与职业可得池短名无碰撞，瓶/标签矩形无交叠、原生子控件数量不增加、槽交换/空槽及旧tap行为。独立树pc-potion-identity，仍需同候选设备可读性复验。

Owner本轮截图/反馈确认遗物与药水大量重复图标，明确允许现成原神素材与已有自绘简图混用。仅接续AC2图形语义辨识：先核最新PR654/661既有图元资源与33比赛药水、full-source42定义，分清已有图未接与真正缺项；复用低负载图元库、保持名称描述对应和小尺寸清晰，不重做布局样式/说明/HP或药水效果。先交精确缺项表与可审阅图集，必要绑定限最少文件，独立复审/相关回归后仅自有分支保存/推送，无PR/集成。原设备未验AC不勾。

Owner追加明确本图标bugfix应与此前图鉴样式/诊断/重构分开原子提交，可用于当前develop发版。切片须包含资源和真实线上必要接线，不能仅图集；限定既有战斗药水槽、地图/节点药水入口、商店及药水奖励图标，复用通用lowcost painter/固定池。不改变布局、触点、规则、描述或主线叙事，不引入旧图鉴六模块。先资源图集，再必要绑定与完整覆盖/重入/空槽/刷新成本回归、独立复审，形成单独可合入补丁；当前不自动PR/合并/发版。

独审发现现有完整源码与shop/deck来源合同会拒绝5个UI绘制文件的已审图标改动，不能交付已知来源失败。仅用5文件before=e65/after=5e63完整source+SHA+Gitblob witness接续，保持旧proof.current/targets/archive/closure JSON不变；原fresh每owner一次、before/after整tuple、mixed/drift/missing/参数raw不符及unknown0read合同保持。限7个测试/helper文件，copy闭包同时精确兼容当前e65与已知PR663入口变体，不触其export组合hunk，不放宽路由或CI预算。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
原生截图80/8裁剪继续按真实问题处理；Simulator同源码80/80完整不能冒充设备通过。已只读回读ba2c实际GIL：battle/player、map/resources/hp、node/hp均autoSize=true、font18/min14，重复启用无效。本轮仅nativeNode.topBar.hp由[-540,316,64,40]改[-536,316,80,40]，供map/node同源复用，保留原生autoSize/字号/HP规则和战斗68宽。最终布局左右与生命/金币图标留4/5间隔，真实宿主80/80及88/88字符串不变。2项定向通过；此为截图裁剪针对性余量修复，未宣称官方原生已修或药水其它项完成，AC不勾。

2026-10-31 独立药水切片：真实Host红例确认肌肉药水弹层40高标题框侵入仅20高标题区。按实际文字框预留标题/操作高度，正文增加一行末尾余量；恢复现有Theme.icon.potionTint读取，不更改主题配色、HP或药水规则。新增全部药水说明、5物理槽边界、人工制品末尾完整性和同形strength/fire配色断言。定向药水8/8通过；扩展全部药水边界1/1通过。初次两项测试错误（主题颜色已为table、换行分隔文本）已修，保留红例事实。PC/手机真实文字渲染和同形同色flex/strength等仍未验，AC1/2/3保持未勾，不宣称设备裁切彻底解决。

2026-10-31 PR433后补全同形同色辨识：保留瓶图/tint，复用已有label显示唯一双字中文短名（力量/肌肉、敏捷/速度），槽内竖排与瓶图左右分离，原生控件数不增加。42种定义和ironclad/silent/defect/watcher/shared五套来源池无碰撞；五槽全部normal/hover/pressed/disabled状态、满名弹层、空槽、槽替换旧触点均覆盖。2ed旧渲染器副本运行新增测试按预期失败在caption visibility；当前药水组合Node10/10及临时能力2、发现/自动药水6、持续效果3组Lua通过，完整效果断言保留。药水专属图形不足由可读短名补足，仍未候选写入/官方导入/真实ready或PC手机设备验收，不勾AC。

306976b4双字竖排方案在独审时发现不符合原生每行40高预算，已撤回该显示方案。接续改唯一单字徽记，保留双字短名与弹层全名；42显示徽记无碰撞（能/量、钢/甲明确分开），每槽一行14x40，瓶图矩形和五槽热区不变。重建UI后全池2/2、三套完整说明2+6+3通过；设备仍未验。

2026-11-01 R2源码复核：生产槽位瓶体24x24、x=-10与单字徽记并列；未发现瓶体或父层旋转。云端无111047原始贴图，HTML Host仅占位glyph，不能据此判定倾斜来源或反旋转；本切片不改素材，QA-R2-02待真实资源/同候选设备核验。

2026-11-07 看板核对（develop 2c85bc61）：实现类交付已按历史记录保留，剩余 AC 待同候选官方/设备验证；当前无在途 PR，状态由 In Progress 归 To Do（待验）。

task:pick本轮ALLOW；核依赖为空，既有PR433已完成旧徽记方案，最新开放663–668无新药水图形资源实现。复用Owner新授权继续图形辨识，不重复旧文本/HP修复。图鉴旧样式优化仍暂停；本轮仅补清晰语义资源及必要接线。

独立图标分支已完成42药水新语义配方（比赛池仍33）、小尺寸/灰度图集及四实际入口必要绑定；初次完整42×4 Host已通过并保留58.605s真实耗时，最终回归改按42通用绘制全量+各入口6代表行为分层，以减少重复渲染和后续CI成本，不放宽timeout/删有效分支。原数据/效果/布局不变，未官方/设备验收，AC保持。

图标生产已于5e63b5c5697d获得独立源码/定向层PASS，P2（图元池失效后底图隐藏）已真实红绿复现并以2Lua共3行修复；4owner×3故障模式回退/恢复通过15.362s。图集/原88守恒/成本已审。后续精确来源续接尚在验证，不把源码PASS冒称Full/官方/发布放行。

独立原子图标补丁已推送feat/item-semantic-icons@a27449ecef1f5e02034c22e677ed9f9a9bfe86aa，远端ls-remote精确同SHA、树clean；base为仍最新e65，含42药水资源/真实4入口和33重复遗物及战后奖励绑定，不含旧图鉴样式/诊断/核心重构。最终独审item-semantic-icons:a27449ec:20261115 PASS unresolved=[]（源码/定向层）。生产6源码及2资源保持已审身份；来源42/42＋9/9、CI有限续接3/3、实际原RED guard复跑1/1、完整库存预算1/1均有证据。两official专用Lua夹具逐字迁helpers，raw新增3JS/0Lua，当前入口3/3=21.620s，消除默认profile误跑和重复Full；原预算/runner不改。root最终exactHEAD ratchet5Lua/0新违规、全素材来源检查通过。与当前发版准备d378隔离merge-tree预检0冲突，12已知B变体逐文件匹配，未实际合并任何分支。未PR/合并/Full通过认证/官方导入/设备或发布许可，原AC及状态保持。交付说明docs/backlog-details/TASK-4.15-ITEM-ICONS-20261115.md。

2026-11-15用户PC截图9仍同图，已核a27449ec尚未进入7cb，并非补丁已失败。本轮按用户全面收口授权在新pc-closeout-integration-1115树整合现有原子成果，保留原回归/来源/授权与所有设备未验AC，不重复开发。

承接D2/F1。42药水/33遗物语义资源及popup皮肤保护已在be41，设备/容量未验，25.6承接遗物资源。
<!-- SECTION:NOTES:END -->
