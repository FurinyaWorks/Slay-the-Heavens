---
id: TASK-29.1.1
title: 轻量卡牌流转动效精修与性能复验
status: To Do
assignee:
  - Furinya
created_date: '2026-11-17 03:56'
updated_date: '2026-11-17 03:56'
labels:
  - combat-vfx
  - performance
  - post-release
milestone: m-8
dependencies: []
references:
  - TASK-29
  - TASK-29.1
  - TASK-4
  - TASK-100
  - docs/research/battle-life-cards.md
  - docs/plans/2026-10-30-battle-life.md
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/commit/479eb53080bd7cfcf5ff685021c1336169e4ef74
  - docs/evidence/future-task-id-migration-20261117/README.md
parent_task_id: TASK-29.1
priority: low
type: enhancement
ordinal: 176000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
参考《杀戮尖塔2》成熟的卡牌流转演出，复核并精修我方**已有**的出牌后弃牌、回合末弃牌、弃牌堆洗回抽牌堆、抽牌入手、消耗及保留卡表现，使真实卡牌位置、入堆去向、节奏与连贯性清晰可感知。优先修正已有表现的视觉质量与缺口，禁止推倒重做或新建重型粒子/图片动画体系。

**排期：中低优先级（Backlog档位 low），当前2.0.0发版非必需、非阻塞；可作为发版后体验迭代候选，不绑定固定发行日期或当前RC。** 本项区别于TASK-29.1已有基本攻击/死亡反馈验收，专门复核卡牌在牌堆间的视觉流转，不改变既有已通过AC。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 先核对develop实际实现与正式候选可见表现：逐项判定已实现、实现但质量不足、缺失及平台未验；保留参考视频与原生PC/手机短录屏，不以源码存在直接宣布体验已完成。
- [ ] #2 真实出牌→弃牌堆、轮末弃牌、弃牌堆→抽牌堆洗牌、抽牌堆→手牌与抽卡插入位置的轨迹、层级、收束和错峰节奏自然；同步核对消耗、保留、能力生效与原有直接回手边界，所有去向由真实UID/事件决定，不能虚构牌堆或重排规则。
- [ ] #3 普通、快速、连续多牌、抽牌洗牌同帧及卡牌中途取消场景下，演出不闪烁、不穿过遮罩、不污染下一场，不要求前一个尾段彻底结束才开放可用输入；与PC安全预输入任务TASK-109协调但互不作为开工硬依赖。
- [ ] #4 继续复用现有abyss_card_flow.lua的至多十个可复用原生轨迹控件、OnUpdate与只读事件快照；不新增大图/重型粒子依赖、不逐帧创建原生控件、不新增持续累积实例或全屏重复重绘。将对象数、包体/加载、更新次数及表现耗时的前后同条件数据留证；未有同条件测量不虚报性能收益。
- [ ] #5 离线回归验证规则、状态、随机数和事件一次消费不变；在同一正式候选比较PC与实际手机流畅度、最坏合法十牌/高频洗牌、切屏和长时连续战斗，记录画质、运行时成本、清理与未验证项；设备证据不足时保持未验。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
以docs/research/battle-life-cards.md和已落地主干为基线，先用真实流程做前后对照，再对具体缺陷实施最小改动。优先调整轨迹、缩放、透明度、遮挡与快慢节奏，继续复用固定控件池和现有主题；性能/容量与输入回归按当前工程质量门禁执行。完整静态通过不代替官方导入与实体设备实际体验。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-15 用户再次指出《杀戮尖塔2》的卡牌进入弃牌堆、弃牌堆进入抽牌堆、抽牌入手动画很重要，但必须以低资源消耗为先；可稍早开展，不阻挡正在准备的版本，也不应提升到高优先级。

已有abyss_card_flow.lua支持固定10个轨迹控件、弃牌错峰/旋转、消耗燃烧、洗牌等；abyss_battle_card_view.lua已有抽牌从抽牌堆入手及单帧reshuffle来源修正。此前离线回归见docs/research/battle-life-cards.md，尚不能证明最新同候选实际观感和手机性能。这次先找实质缺口，不重复宣称此前未做。

本项不修改当前发版候选、release/master或版本Tag；正式代码优化、性能验收与合并均属于后续独立PR。

2026-11-17 身份迁移：PR #670@479eb53080bd7cfcf5ff685021c1336169e4ef74 的未来动效TASK-110迁至TASK-29.1.1，避开当前正式Release CI任务TASK-110。原文与JSON完整保留；AC3中旧PC TASK-109沿历史109→旧未来42.1→当前TASK-42.3映射，不指向手机专项109或P0输入42.1。保持To Do、原5条未验AC、原low/父项及post-release边界，不代表实现、开工或当前发版依赖。准备树依赖676未合。
<!-- SECTION:NOTES:END -->
