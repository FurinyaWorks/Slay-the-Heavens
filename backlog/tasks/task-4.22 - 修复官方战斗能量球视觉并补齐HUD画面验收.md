---
id: TASK-4.22
title: 复验能量球与手机HUD（修复已合入）
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-11 14:56'
updated_date: '2026-11-15 15:07'
labels:
  - ui
  - combat
  - visual-regression
  - 待验
  - delivery-verify
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/TASK-4.22-MOBILE-ENERGY-LAYERS-20261115.md
parent_task_id: TASK-4
priority: medium
type: bug
ordinal: 172000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户在原神官方客户端实测中拒收左下金色大圆盘、粗框和巨大白字，现有approved-energy-orb只锁属性，未验证最终观感。对照批准V25做最小视觉修复，并让关键HUD实际画面评审进入既有验收；与TASK30同一独立UI修复PR交付，不涉及626高图元角色。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 能量球在实际战斗尺寸下对照批准V25修复盘面、边框和数字观感，保留能量逻辑及可读性，不扩展UI设计。
- [x] #2 复用现有测试/截图/验收机制，保留属性和规则断言，增加最终渲染证据及独立画面复审；旧粗糙实现不能只凭配置被判视觉通过。
- [ ] #3 交付与手机锁敌修复相同身份的可导入GIL及复测步骤，Simulator、官方客户端和实体手机结果分开；缺当前实机视觉验收不发布。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 对照批准V25与最终官方布局，复现能量大圆盘/粗边框/字号，先记录旧属性测试的盲点。2. 仅修盘面层次、边框与数字，保持位置安全区、能量规则及性能。3. 复用现有真实Simulator截图和UI验收，独立查看实际尺寸；官方客户端与手机标为待用户同候选复测。4. 与TASK30共用独立PR及最终正常入口GIL，排除626，实机视觉验收前不发布。

2026-11-15 M17非发版Develop后续：核实最新develop尚无mobile_hud（依赖#672），只保留隔离窄补丁与定向几何附件，不复制整模块、不建PR。依赖落地后仅同步可选energyRing/Disc到原Icon/数字位置，验证Release/non-touch不变、手机world坐标、菜单返回/resize、缺可选控件和draw hit不变；不换样式资产规则，不勾手机AC。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
最小修复仅作用official-assets-first：保留86尺寸/位置，官方原生圆面6层替代暗色材质堆叠；29→26字号适配原生字形，连续轮廓替代重复阴影。零/正常/溢出能量当前官方Host回归通过。verify:ui新增HUD画面评审和实际phone/touch来源要求，Simulator独立记录。

2026-11-12独立源码与实际1280x720 Simulator画面复审PASS；并非Owner/官方客户端或实体手机验收。标准GIL build0222683d由干净9cece5dc构建，360模块精确读回；另有只改一个启动模块、非脚本section相同的双敌十牌直达副本。见docs/evidence/official-ui-repair-20261112，官方/手机项保持未完成、不发布。

最终集成CI：补截图来源登记并修正#621牌库最小字号14→26，原测试不放宽；Licenses/Quick feedback在50a5dae3通过，Draft Full未运行。为候选身份一致，最终重新由干净50a5dae3构建d3b4c46e，当前官方回归与同候选触屏/性能/图像均重取；初版022仅为历史。标准SHA7f13c927…，直达SHA68d7c998…，详见同目录最终收据。实机继续待验。

2026-11-14逐项对账：629/634已纳入源码和Simulator视觉修复，AC1/2已通过；AC3只缺当前同候选官方/手机验收，不重新画一套能量球。

2026-11-14第二轮状态纠正：已有2/3项AC通过及既有实施证据，剩余未完成要求属于后续验证或接续。 状态表示整个任务的完成进展，不表示当前有执行者持续占用；保留原未验AC、负责人、依赖及历史证据。更正过去把已开展待验事项退回To Do的处理。

M17只读实证：Release36b9及#672非touch能量四层同心(-511,-233)；#672@1f7ce04c手机仅移动Icon/数字到(-511,-180)，可见旧Ring/Disc残留53设计单位。draw glyph/88×88 hit同心，不据此宣称操作阻塞。现按Owner指示移为Develop后续支持切片；develop c2409无依赖模块，PR暂不成熟，隔离补丁待依赖落地与独审。

2026-11-15 M17隔离附件完成定向对照：精确#672@1f7ce04c Git导出，Release touch/非touch PASS、#672 touch修前精确RED、四行补丁后touch/非touch PASS（5/5符合预期）。真实生成树覆盖菜单返回/取消退出/resize、可选装饰层helper缺失、draw glyph与原hit、同一run与规则状态不变。develop仍无owner模块，附件非运行时实施；待依赖落地再复验独审和PR，原手机AC继续未验，不涉及Release。
<!-- SECTION:NOTES:END -->
