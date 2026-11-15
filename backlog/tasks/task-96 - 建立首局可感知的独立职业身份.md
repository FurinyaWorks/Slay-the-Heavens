---
id: TASK-96
title: 建立首局可感知的独立职业身份
status: Blocked
assignee:
  - Furinya
created_date: '2026-11-03 02:45'
updated_date: '2026-11-15 06:59'
labels:
  - design
milestone: m-8
dependencies: []
references:
  - docs/SCOPE.md
  - docs/ORIGINAL_V4.md
  - 'https://github.com/CHNISam/Slay-the-Abyss/pull/479'
  - docs/backlog-details/TASK-96-CHARACTER-IDENTITY-20261103.md
priority: medium
ordinal: 138000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
当前归属M8/m-8产品体验与核心特色，历史编号与审计结论保留。解决当前岩系旅行者与Ironclad机制高度相似的问题。Owner于2026-11-15明确后续方向为璃月，并随后要求设计前置未完成前不接入技能、不急于推进；当前仅保留方向，不选择角色或版本方案。现有冻结V4代码不等于新设计获批。先完成AC2设计确认与明确审批，再按依赖和原AC完成实施及验收；当前发版范围仍为岩系旅行者前两幕。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 以当前生产牌组/机制核对岩旅与 Ironclad 的共性与差异，说明哪些仅是表现换名，不冒称自研机制。
- [ ] #2 提出最小可行的角色差异化方案及首次十分钟可感知的特征，经 Owner 确认后实施；不擅改已冻结平衡数据、不删除历史旅行者版。
- [ ] #3 复用 TASK-85 或获批的等价角色任务完成实际正式入口、玩法与必要美术/信息呈现；代码、候选与官方 PC/安卓实测分层留证，不重复开发现有 V4 卡牌。
- [ ] #4 同候选试玩可明确辨认本作的职业机制和角色表现；未完成验收前不得宣称原创职业体验已交付。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
当前仅收尾已开始的事实审计与实验证据。Owner已要求暂不推进技能或正式接入；先完成本任务AC2的设计与明确审批，未完成前不得执行AC3/4。璃月方向不等于采用某角色、V4/V6方案或冻结数值变更，首位角色追问已撤回。本轮不继续设计、不新增任务，保留Blocked与未验AC；后续实施使用Backlog原生依赖核验。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
执行者：TASK-96 事实审计；工作树 F:\New folder\.worktrees\character-identity-audit-20261103；分支 feat/character-identity-audit-20261103；基线 013535ae48198bd72616224a4729f90bb187ecd9。公开认领：PR479 评论6597919043。仅研究与提案，不参与 TASK-85 执行验证；新行为与视觉待 Owner 确认。

事实审计/提案切片已交付，待主控独审：docs/backlog-details/TASK-96-CHARACTER-IDENTITY-20261103.md；事实快照 docs/evidence/character-identity-20261103/facts.json。核实生产仅ironclad；75红牌保留原作身份、72非基础池成员一致、余烬之心映射Burning Blood胜利回血6。提供A雷电主推荐+岩旅可选（推荐）、B雷电单入口保留历史岩旅、C既有胡桃V4三个下一版本待批准方向。首十分钟拔刀不保证：初始只有两张军令，爆发需愿力3。7项输入hash/75映射/3个内存生成模块、数据交叉核对、Geo开局目录盘点及guidance/backlog/附件diff轻量检查通过；无候选/官方导入/新ready/PC或安卓证据，未运行TASK-85测试。Owner待决定是否批准A及其验收后开放边界。AC1待主控独审，AC2–4未批准/未实施/未验收，全部保持未勾，状态保持In Progress；本轮不提交、不推送、不建PR、不合并。

本批集成复核：独立审查OpenCode-gpt-6.1-sol-9450b8af-50d5-4a27-ae2a-07570e988d00实际重算75映射、初始资源、来源与3模块，主控据此接受AC1；AC2–4继续待Owner方向确认、实施及设备验收。按用户最新要求，本批先复审/CI/集成再领下一批，任务保持In Progress。

当前编号映射（2026-11-03）：本任务属于 M8/m-8 产品体验与核心特色；下文保留的旧称“M7 核心产品体验门槛”按当前 M8 理解，验收实质、负责人及既有 AC 不变。

2026-11-07 看板核对（develop 2c85bc61）：按 config/sprint-intake.json 属 blockedUntilOwnerApproval，当前无在途 PR；状态归 To Do（待 Owner 定方向），不勾 AC。

2026-11-14第二轮状态纠正：已有75映射与独立身份审计，AC1已完成；差异化方案待Owner明确确认，不能标成尚未开始或自行继续。 状态表示整个任务的完成进展，不表示当前有执行者持续占用；保留原未验AC、负责人、依赖及历史证据。更正过去把已开展待验事项退回To Do的处理。

2026-11-15 Owner明确后续优先璃月角色，不沿旧雷电主推建议；首位璃月角色及V4/V6仍待具体确认。可在不改生产/数值的隔离实验维护已存在呈现缺陷，不据泛化方向勾方案批准AC。

2026-11-15 Owner收尾纠偏：首位角色问题撤回，技能/玩法设计未清晰且前置未完成，不再接入。TASK96 AC2设计确认与审批未完成；璃月只为方向，非方案批准。现有胡桃离线文字缺陷切片已保全，不新增设计任务，不继续实施，AC2–4不勾，保持Blocked。
<!-- SECTION:NOTES:END -->
