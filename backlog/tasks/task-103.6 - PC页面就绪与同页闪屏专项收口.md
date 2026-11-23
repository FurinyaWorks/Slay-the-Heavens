---
id: TASK-103.6
title: PC页面就绪与同页闪屏专项收口
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-15 20:14'
updated_date: '2026-11-23 04:22'
labels: []
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/PC-QA-20261115.md
  - TASK-100.1
  - TASK-108
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/blob/e40b421104aed1a47f971dc5eaeae08431c5a130/docs/qa/playtests/pc-20261115-verbatim.txt
parent_task_id: TASK-103
priority: medium
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-11-15 PC实机：查看牌组、同页排序、奖励选牌、宝箱、营地锻造、继续等会触发多余“正在准备”遮罩或闪黑，尤其末击/奖励切换影响视觉舒适。任务只纠正共享准备生命周期和屏幕揭幕，不重新实现另一套转场，不使用固定等待伪装性能。原录音 00:46–05:18、07:54、16:24、33:57–34:34、41:12、45:45；截图02/05/07。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 打开已准备好的同页面板、关闭、排序及选项切换不调用全屏遮罩；真正异步准备须明确局部反馈与输入隔离，不能先闪黑再返同页。
- [ ] #2 跨页使用现有批准的璃月转场和真实准备/可见状态；取消、重复点击、迟到回调不会揭露旧页或卡在黑幕。
- [ ] #3 末击到死亡/奖励的切换不得重复遮幕；分别保留视觉时序和真实业务状态的自动回归、反例及截图/帧序列。
- [ ] #4 在同一准确 GIL/源码 SHA 下按原录音路径做 PC 连续操作回归，提供屏幕录像或等价帧与操作日志，并记录实测延迟/闪烁次数，不把 SDK 计数冒充实机。
- [ ] #5 受影响的手机页面与正式候选需要复验；异常恢复、10次快速往返、空牌堆与长列表均不得退化。
- [ ] #6 与 #672 的模态加载修复逐文件对账：只接续未完成AC，不复制既有实现；#663已合入develop；#672尚未最终整合/实机验收时保留本任务In Progress，不冒充已合入。
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-15 对账：PR #672（未合入）声明已实现“同页ready立即展示、异步仅局部遮罩、旧callback保护”，且含 modal-loading-frames 等测试。属于代码候选而非现行正式玩家实机验收；全部AC保持未勾。PR #672 原Depends-on #663，现#663已于11月15日合入develop（c2409ad），仍必须按最新基线及最终完整GIL复核。产品观察严重度 P0/P1，Backlog priority medium 是当前高优先级配额约束，两者不可混读。

2026-11-23：#899 merge 392fae8d8dee2bd57829dda0e8da836f45107398；#904 merge 103aa4072bd3801deb6bf090455bd974181a9647，已有牌库分页和牌堆回流。字号/排序回归由开放 #907 HEAD 00cd3aef7830b05cefdbb8ddd44f6110ae4ba487 接续；保留同候选 PC/手机黑闪、快速往返和延迟取证。
<!-- SECTION:NOTES:END -->
