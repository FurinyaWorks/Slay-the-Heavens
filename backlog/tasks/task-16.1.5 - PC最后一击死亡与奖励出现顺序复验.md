---
id: TASK-16.1.5
title: PC最后一击死亡与奖励出现顺序复验
status: In Progress
assignee:
  - Furinya
created_date: 2026-11-15 20:14
updated_date: '2026-11-18T14:00:00Z'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PC-QA-20261115.md
  - TASK-29.1
  - TASK-103.6
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-verbatim.txt
parent_task_id: TASK-16.1
priority: medium
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-11-15 PC试玩末击后出现闪屏/先奖励后死亡感知、奖励可能多次闪烁（15:28、24:57、34:04）；同类问题亦见移动真机反馈。以可复现的战斗时序为准，而非从静态截图直接判断加载/事件队列根因。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 固定源敌人死亡、末击命中、状态结算、Victory/奖励揭幕的事实顺序；对可见帧作真实观察，不能只凭业务日志或仅测试最后存活敌人的HP。
- [ ] #2 敌人死亡/消失后才按正式时序稳定呈现奖励；无重复全屏遮挡、奖励先出现再撤回或错误返回战斗。
- [ ] #3 覆盖多敌、过量伤害、死亡触发、连锁伤害、多段、战斗结束前旧事件以及奖励返回地图；不改RNG/数值和奖励内容。
- [ ] #4 核对 #672 原死亡路径测试并新增确实检验可见转场顺序的RED/GREEN，最终官方PC及移动端同候选录像/帧证据通过后再完成。
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
#672 存在 original_monster_death 相关测试以及PC整体揭幕改动，但没有充分依据声称本用户观察的全部末击时序已经修好。归于 In Progress 需复核，所有AC未勾。产品P0。
<!-- SECTION:NOTES:END -->
