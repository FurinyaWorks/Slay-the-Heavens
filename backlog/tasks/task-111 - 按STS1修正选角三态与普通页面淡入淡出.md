---
id: TASK-111
title: 按STS1修正选角三态与普通页面淡入淡出
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-21 12:50'
updated_date: '2026-11-21 13:32'
labels:
  - P2
  - non-blocking
  - next-version
dependencies: []
references:
  - docs/evidence/sts-character-reference-20261113/REFERENCE.md
priority: medium
type: enhancement
ordinal: 186000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
正式选角自动预选，普通页面遮罩与璃月演出不符合本轮STS1参照。
## 任务
复用既有布局和就绪门禁，修正三态及简洁Fade。
## 边界
后续版本P2非阻塞，不进入当前发布门禁，不指定发布日期；仅develop，release/v2.0.0冻结。接续103.3/103.6/108既有实现，不重做UI。
## 验收
按本轮用户提供STS1三态与连续淡出/遮盖/切页/淡入要求验证，源码、离线和官方设备分记。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 菜单选角未选中、选中、启程三态符合参照；白名单不变
- [ ] #2 普通跨页全黑后切换，真实ready后淡入；同页更新不全屏闪黑
- [ ] #3 连点延迟取消失败恢复及PC移动回归通过
- [ ] #4 前后截图、独立评审、Required Checks与Merge Queue交付develop；官方设备单列待验
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 复用现有page reveal增加可选Alpha阶段，遮盖前保留旧画面，遮盖后准备与ready确认；开局复用同一门禁。2. 正式选角去自动预选，显示标题与石质锁槽，命座深色、选中保留金边。3. 增加时序与三态回归，运行相关源码验证及离线截图；独立评审后走develop原有准入，官方设备待验。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
执行者当前会话，分支feat/sts-selection-fade，base345ba083；后续版本P2/non-blocking，不影响当前发版。复用103.6实现，最新用户Fade要求取代旧璃月普通切页要求。

本项明确为后续版本非阻塞，不列入当前M8首发排期/门禁，清空里程碑；保留P2/non-blocking/next-version标签和用户指定范围。

已实现并新增定向回归；独立会话review_fade发现3项重入/旧页资源问题均已修正复验。docs/evidence/sts-selection-fade-20261121含前后/未选中/淡出中离线投影，非SDK或官方设备证据。源码静态及多组定向通过；全量与正式Required Checks未完成；官方PC/手机未验，不标Done。

用户指出已有专项按钮/遮罩调整不能覆盖。已补查#785，develop缺少发布线已合的去常驻veil与平滑圆角；撤回本轮旧弯旗替换，保留#785既有外观及去暗层，最新定向9/9通过。核对#799/#800/#801在途，不接管。白色句子待确认具体控件；角色说明不擅删。旧独审仅旧源码证据，须重审；完整npm test尝试已有CRLF身份与Act1 failure boundaries 1/4失败且中途源码更新，不能认证最终候选。无PR/入队/合并，任务仍In Progress。

继续执行已保留#785圆角/去常驻veil，修复开发头像被过度禁用；定向56/56、头像30/30、正式配置运行35/35、工程(架构/静态/变异/原生合同)通过。CRLF1项、隔离源2项、Act1失败边界1/4均复验通过；历史清单/复制闭包保持精确身份和负控。证据docs/evidence/sts-selection-fade-20261121，白色普通加载提示隐藏、保留既有角色信息。准备仅develop正常PR、最终独审和Full；官方PC/手机继续未验，P2不进入当前发版门禁。

历史CI校准与完整旧选角回放74/74通过，CI拷贝闭包/源码次序与新测试custody已完整接续且保留旧断言。完整正式配置runtime35/35通过，含末击奖励不闪屏和移动商店返回触摸；原生角色30/30、主要回归56/56、工程全部通过。开始最终精确SHA独审与develop PR，不标官方验收/Full或已合入。
<!-- SECTION:NOTES:END -->
