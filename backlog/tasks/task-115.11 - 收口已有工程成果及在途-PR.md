---
id: TASK-115.11
title: 收口已有工程成果及在途 PR
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-11-25 21:02'
updated_date: '2026-11-26 04:05'
labels:
  - engineering
dependencies: []
references:
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/911'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/967'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/966'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/968'
  - 'https://github.com/FurinyaWorks/Slay-the-Heavens/pull/999'
documentation:
  - docs/versions/V2.2.0-RELEASE.md
parent_task_id: TASK-115
priority: medium
type: task
ordinal: 223000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
情况：#911、#967、#966、#968 等已有在途实现。

任务：核对任务状态、文件重叠和现有实现，复用性能门禁切片成果。

边界：保留 M8/M9 和历史未验收项；协调 Backlog 写入，避免与版本登记冲突。

验收：见下方验收项和统一发布清单。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 已有工程 PR 有确切接续结果、独审与精确源码验证，Backlog 通过一致性检查
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
独立推进工程成果。扩展既有 Backlog 校验和发布工具，验证 Scope、Release Gate、Engineering、冻结及生产回流。通过正反例、原生 CI 和独立审查。保留既有 #911、#967、#999 的接续记录。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
#999 接续 #911 的交付治理源码覆盖。原 #911 更宽范围继续留痕。实际 Git 双入口独立评审 6066893403，85 项交付、Hosted 入口夹具、102 项历史回放和 25 项性能合同通过。Fork A 45728156747 Advisory Quick 通过。精确 8a5f8681 基线的结果随后继基线重新核对。

#999 本地接续候选 cda3fca9bcf168548120c4ea463616d7de3cccb0 建在待合入的 #1000 a87a8d40 上，已独立复审。真实 Git 治理用例通过 8/8，正式构建协议 24/24。各现行入口拒绝旧源码及重新读取时回退，历史 LF/CRLF 和原 #1000 归档适用。待实际基线和 Hosted 验证。

#967 工程切片在实际 454b 的本地接续 652bf5b2 和假定 #1000 a87 上的 03a2f0bf 获独立源码复审。五个文件仍是原切片范围，九项受控回调按原执行且验证通过。实际 Windows 和 Stop/SubagentStop、主仓 Hosted 回调继续待验。
<!-- SECTION:NOTES:END -->
