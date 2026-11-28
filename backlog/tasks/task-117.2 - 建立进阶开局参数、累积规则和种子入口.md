---
id: TASK-117.2
title: 建立进阶开局参数、累积规则和种子入口
status: To Do
assignee:
  - '@Furinya'
created_date: '2026-11-28 10:46'
labels:
  - v2.3.0
dependencies: []
documentation:
  - docs/versions/V2.3.0-RELEASE.md
parent_task_id: TASK-117
priority: medium
type: feature
ordinal: 229000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## 情况
现有开局依赖普通模式及内部种子入口。

## 任务
由 Run 存储不可变的难度、种子与来源，提供统一规则解析及默认关闭的配置开关。

## 边界
沿用现有随机流与旧调用；冻结接口前核对 T00 规则与种子契约。

## 验收
见下方验收项。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 默认关和开时的 A0 通过旧入口和固定种子回归
- [ ] #2 A0～A14 参数受校验、规则累积，非法输入及未解锁难度显式处理
- [ ] #3 玩家指定种子无损往返，重开使用原种子；旧测试入口保留升序行为
<!-- AC:END -->
