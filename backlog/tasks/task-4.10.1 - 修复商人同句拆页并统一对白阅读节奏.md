---
id: TASK-4.10.1
title: 修复商人同句拆页并统一对白阅读节奏
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-14 03:03'
updated_date: '2026-11-18 01:20'
labels:
  - ui
  - text
  - owner-review
milestone: m-8
dependencies: []
references:
  - docs/TOOLCHAIN.md
  - docs/TASK_EXECUTION.md
  - docs/backlog-details/TASK-4.10.1-NATIVE-READING-20261118.md
parent_task_id: TASK-4.10
priority: medium
type: bug
ordinal: 175000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户反馈商人已有说话演出，但同一句话说到一半就换页，阅读割裂；此问题已多次修改仍不满意，希望尽量在当前版本解决。需先复现现候选的真实分页，参考成熟游戏的对白规范，从语义完整性、文本容量、排版、逐字显示、翻页与交易状态多个维度查根因。涉及最终阅读体验的人工确认由用户参与，执行者先准备少量可直接判断的同条件前后对照。父任务原有商人位置与购买取消布局成果保留。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 保存当前候选同一句被拆页的实际文本、页面尺寸、触发步骤和连续画面；检查正文是否主动拆段、容量/换行计算和演出状态机，说明真正根因
- [ ] #2 短句及可容纳完整句不跨页；长句确需分页时采用经用户确认的完整语义分段和可读续接规则，中文标点、换行和文本尺度正常，不靠缩小到不可读字号或截断处理
- [ ] #3 进店、停留、购买成功/失败、连买、打字中加速、继续/跳过、离店再入等状态不丢字重播或互相打断；对白不遮商品与交易，鼠标/触摸/手柄路径可恢复
- [ ] #4 以原作或成熟游戏的实际阅读例证解释规范，先自检多维问题并独立复核，再交用户同条件前后连续对照和短中长句样本，人工确认记录绑定本轮候选
- [ ] #5 真实问题有必要自动回归及反例，重复改坏的原因形成最小可执行防回退；官方PC和实体手机实测分层记录，未测项不宣称验收
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. 接续已合PR655的实现与既有merchant-reading-audit/merchant-runtime-reading诊断，不重做分页、批准台词、气泡布局或交易。
2. 在当前develop基线用固定0.5.2 SDK装配真实merchant组件和生产布局，分别观察通用/official投影的完整页面、手动点击、自动推进、隐藏恢复及反应打断。
3. 保留独立组件与完整NodeUI/官方候选的边界，形成少量可复验连续证据；长期阅读策略、用户确认与官方PC/手机不凭SDK通过勾选。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
源码候选PR655完整纳入当前单主角版integration-next并保留原独审与阅读回归；本次仅集中集成，实际连续画面/设备/人工阅读验收仍按原AC保留。

2026-11-18 接续已有源码交付的验收：task:pick在当前c2409ad7隔离树为ALLOW，但不重新实现PR655。既有e2276854已在Release基线采集默认mock逐帧证据，66f8c09a已有12行分页审计；本轮先复用，再补真实SDK组件/文字状态证据。开放PR668的Lore变化另属原执行者，不写其台词与源文件。本项已有实施，状态从To Do纠正In Progress，原五项AC保持未勾。

2026-11-18 固定0.5.2真实SDK组件验证完成：通用/official各30控件，自动旁白9/6页与SDK pointer手动逐页完全一致；加速、局部React反馈、隐藏10秒暂停且拒绝命中、同句恢复、同局再入、新局旁白及零残留通过。直接React不是实际购物；既有真实Run/NodeUI加mock控件的6项回归另通过。默认三个两字尾页仍各停留2.6167s、旁白24.95s，official旁白17.0833s，均模拟时间，不声明阅读已修复。来源、原始输出与两次探针自身失败见TASK-4.10.1-NATIVE-READING-20261118.md，五AC仍未勾、状态In Progress。
<!-- SECTION:NOTES:END -->
