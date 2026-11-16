---
id: TASK-112
title: 落实v2.0.0功能冻结与PR范围准入
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-16 09:15'
updated_date: '2026-11-16 09:38'
labels:
  - release-v2.0.0
  - governance
milestone: m-8
dependencies: []
references:
  - .codebuddy/skills/release-maintenance/SKILL.md
  - docs/evidence/release-freeze-20261116/README.md
priority: medium
type: bug
ordinal: 178000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner明确要求Release仅修既有功能缺陷与必要性能/工程阻塞，PC数字键、快捷键、预输入仍属后续Feature。已有交接规则未贯通技能入口、旧PR模板和Release早退的CI检查，需复用现有机制做最小强制准入并审查在途范围；不合并或发布。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Agent入口按需加载唯一冻结规则，主指引保持预算内且不重复长文
- [ ] #2 Release PR明确类型、目标版本和必要性；缺失、混合Feature或自称批准均拒绝，元数据编辑后重验
- [ ] #3 保留Develop新Feature路径和原CI质量合同，相关正反例通过
- [ ] #4 记录当前Release在途PR精确范围、越界处理及TASK42.1/PR670后续版本边界
- [ ] #5 独立评审和PR交付；出牌P0沿既有任务修缺陷，不引入键盘或预输入
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1.查现有技能/交接/模板与CI及在途PR，固定最小字段合同。2.在既有PR检查接入Release准入并补正反例，轻量技能入口按需引用。3.审查在途范围并规范声明，复用既有P0任务定位可复现遗漏。4.保留不可变来源合同、运行相关验证、独审并交付独立PR。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
已将规则收敛到20余行按需技能，AGENTS/既有技能/分支文档只链接，模板修旧路由。复用Quality metadata步骤检查live PR三声明及仓库/base/head；新Feature硬拒绝、自称Owner-approved无效，edited重验，无新job/依赖/预算。30/30规范来源指引、157/157较广CI通过；旧bootstrap直接入口1失败经精确新→旧来源投影修正，旧包/库存/EOL及逆向断言保留。独审23/23+4/4及43项来源/EOL/漂移断言PASS。19个Release在途范围已审并补声明，689前进后核生产patch相同再补；无需要退回的新Feature，670仍Develop。707错误TASK110引用沿既有TASK81更正，未把后续卡流Feature带入。TASK30新增9PASS/2RED输入丢失复现及拒绝矩阵已交接，未复制tracker或谎称P0已修。证据docs/evidence/release-freeze-20261116，PR待交付/合入；托管CI及远端生效未认证，任务In Progress，未自行合并发版或碰窗口。
<!-- SECTION:NOTES:END -->
