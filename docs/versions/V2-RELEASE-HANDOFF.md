# v2.0.0 重建交接

2026-11-19 起冻结旧 `release/v2.0.0`。冻结提交为 `1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`。旧候选启动失败，恢复工作在最新 `origin/develop` 上进行。

## 开发与接续

- 从最新 `origin/develop` 创建独立工作树及短分支。所有重建 PR 指向 `develop`。旧分支保留原引用，停止合并，保持保护规则。
- 旧目标 PR 转为 Draft、加 `release:frozen` 标签并评论记录原 base、head、接续范围和继任 PR。若有自动合并授权，先按现有入口撤销并读回。已暂停 [#738](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/738#issuecomment-6999046770)，暂停时 head 为 `36b96baa93d07cb8a357cb793ea4e8806a5aca87`，复核时已推进到 `62e14cfe87fa71a1ae475ef2ef51a6ce6a2b7cbb`，仍为 Draft。输入缺口按 #711、#728、#736 和 #738 的原始差异核实，停乐修复核对已合入 develop 的 #730。接续 PR 开出后回填来源线程。
- 审查旧分支、未合并 PR 和 Fork 时，按行为及验收逐项查重。只接回仍缺的实质变更，保留来源提交和验证记录。冲突不明或发生回归的切片保存证据后暂停，继续独立切片。
- 沿用 [任务执行](../TASK_EXECUTION.md)、[三仓库分流](../CI.md#三仓库按需验证)、[生产代码规模门禁](../TASK_EXECUTION.md#小批量集成)、正式例外及合并准入。Develop 与后续批准的 Release PR 共用 Quality 的 `check:guidance` 步骤。本版仅岩系旅行者第一、二幕。PC、手机清单分别见 [38 项 PC 反馈](../backlog-details/PC-QA-20261115.md) 和 [20 项手机反馈](../backlog-details/MOBILE-QA-20261115.md)。

## 候选与放行

- 在 develop 完成集成和全量回归后，从精确、干净的提交构建候选。记录源码、构建参数、模块清单、GIL SHA-256 及写入后读回结果，按同一候选验证启动及两幕核心流程。
- RC 放行须具备同一 `source SHA + buildId + GIL SHA256 + payloadDigest` 的证据，包括官方导入和 ready、两幕自然通关、PC 和实体手机回归、官方关卡容量 ≤20MB 及服务器容量 ≤3MB。有缺项即标「待验收，不可发布」。细节见 [发布操作单](../PUBLISHING.md) 和 [平台负载](../PLATFORM_LOAD.md)。
- develop 集成和全量回归完成后才重建 Release。正式发布由 Owner 确认。旧分流和候选记录仍可从 Git 历史追溯。
