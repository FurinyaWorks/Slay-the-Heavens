---
id: DRAFT-9
title: Codex LSP 语义分析接入（Deferred Idea）
status: Draft
assignee: []
created_date: '2026-11-16'
updated_date: '2026-11-16'
labels:
  - idea
  - deferred
  - tooling
  - optional
dependencies: []
references:
  - 'https://github.com/openai/codex/issues/8745'
  - docs/TOOLCHAIN.md
  - docs/ENGINEERING.md
priority: low
type: spike
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**2026-11-16 Owner 决策：Deferred，不实施。** 仅保留“未来在 Codex 中使用 LSP 语义分析（含可选 Serena/MCP 桥接）”这一想法；目前**不安装、不开展实验、不绑定 Milestone、不增加 CI 门禁**，尤其不得影响当前 release 或让并发 Agent 额外启动语言服务器。

现有 JavaScript/Lua 静态检查、架构检查和 CI 已提供基础验证。OpenAI Codex 维护者在 [openai/codex#8745](https://github.com/openai/codex/issues/8745)（2026-01-06）表示，既往 LSP 实验未获得预期收益；这不是“LSP 永远无用”的结论。无需为技术概念本身重复试验，以项目真实收益为准。

**仅在以下条件出现时重新讨论，而非自动开工：**
- Codex 官方提供可用且稳定的原生语义/LSP 能力，并有足够可靠的使用效果证据；或
- 项目 JavaScript/Lua 跨文件重构出现可复现、现有检索与静态检查难以解决的漏改/误改，且 LSP 有明确解决路径。

若决定重评，先进行独立、低资源占用的对照：相同真实任务下对比修改正确率、遗漏引用、耗时、Token、CPU/内存及多工作树开销；有明确净收益且经 Owner 单独批准后，才另建实施任务。证据不足则继续 Deferred。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 触发上述重评条件并获得 Owner 的新决定；仅条件出现不意味着自动实施。
- [ ] #2 如批准评估，完成代表性 JS/Lua 任务的有/无 LSP 对照，并记录收益与资源成本。
- [ ] #3 只有可验证的净收益和独立实施授权，才考虑接入；不修改现有 release、发版 CI 或 Agent 默认工具链。
<!-- AC:END -->
