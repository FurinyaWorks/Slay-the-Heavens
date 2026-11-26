---
id: TASK-116
title: 治理 STH 仓库卫生与跨仓回流
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-26 04:12'
labels: []
dependencies: []
priority: high
type: chore
ordinal: 226000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
主仓和两个公开 Fork 累积了运行产物、历史证据和候选材料。治理须保留有效引用和在途成果，兼容现有必经检查及发布回流。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 三个仓库按固定基线完成分类、引用及许可核对，已验证的清理由正常 PR 交付。
- [ ] #2 必经 PR 检查拒绝违规文件和未批准 LFS，并用正反例验证。
- [ ] #3 开放 PR 尤其 #1008 完成固定提交回流核验。
- [ ] #4 对可访问历史、分支、Tag、压缩文件及 LFS 做脱敏审计。
- [ ] #5 记录独立构建、测试及实际合并证据，并在 OpenHarness 抽象通用机制。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
固定仓库和 PR 基线并审计；复用现有 LFS 与必经 CI 接入门禁；根据可复现性、许可与当前用途清理；独审后合并并读回。
<!-- SECTION:PLAN:END -->
