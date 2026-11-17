# 发版后任务身份消歧准备

源 PR #670：`479eb53080bd7cfcf5ff685021c1336169e4ef74`。本准备树先通过 Backlog CLI 完整保存并归档两个旧未来任务，再正常 merge PR #676 的准确 `e40b421104aed1a47f971dc5eaeae08431c5a130`；merge `bbccad51e8ad930f0623fb7f19b515a952644462` 无冲突。MILESTONES 保留双方，既有 #676 P0 TASK-42.1/42.2 不改。

**准备依赖：#676 尚未合入；本树不是成熟可合切片。** 未改变 #670 的未来 HOLD 边界、release/master、产品实现或任何验收状态；此处 merge 仅为身份准备，不能宣称 #676 已集成。相对准确 #676 的源码树无新增产品差异。

| 历史身份 | 当前未来任务 | 保留的正式身份 |
| --- | --- | --- |
| #670 原PC TASK-109→旧未来 TASK-42.1 | TASK-42.3，父项42，To Do，medium，7条AC全未勾 | #676 P0 TASK-42.1/42.2；手机专项TASK-109 |
| #670 旧未来 TASK-110 | TASK-29.1.1，父项29.1，To Do，low，5条AC全未勾 | 正式Release CI TASK-110 |

旧任务归档使用 `backlog task archive`，原 markdown 是100%原文移动；原PC109档案原样保留。`original-future-42.1.json`、`original-future-110.json` 是归档前完整 CLI task-view JSON。新任务经查重后使用 `backlog task create --parent` 正常分配为42.3/29.1.1，没有手改ID或任务文件。全部原 description、AC文本/未验状态、priority、type、labels、父项、milestone、ordinal、references、历史plan/notes均继承；仅追加本轮精确来源与迁移说明。旧AC中的TASK-109保留原文，当前解释按上表映射，避免改写历史证据。

`migrated-future-42.3.json`、`migrated-future-29.1.1.json` 为迁移后完整CLI读回。创建时间属于本次新身份，原创建/更新时间及完整上下文仍保存在原档案/JSON，不冒充原日期。doctor、verify:backlog、check:guidance 与 diff-check 结果见 `validation.json`。
