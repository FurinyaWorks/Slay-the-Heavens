# Develop 三份既有文档 PR 的线性接续

本轮按 Owner 明确授权，仅整合 #664、#666、#705 的既有文档；基线 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。原 PR 的内容、评论、未验要求及分支均保留。新接续提交从该基线单父产生，不强推旧分支、不引入合并提交。

## 精确来源与承接

| 原 PR / HEAD | 承接路径 | 保留边界 |
| --- | --- | --- |
| [#664](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/664) / `162bab4c868ad27b0c76d148990669955853bd6d` | 归档 `TASK-45` 的 AC5 | 同一条全成就可达和平台「极致成就」要求仍未勾；Blocked、权限前置、原四 AC、归档位置与历史不变 |
| [#666](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/666) / `288c1d0553bc43325ede1e9041376b5fbf6d4609` | `backlog/docs/doc-29 - 低端设备性能与画质设置评审-2026-11-14.md` 与 `backlog/drafts/draft-8 - 证据触发的单档流畅模式评估.md` | 原 doc-28 / DRAFT-9 由当前 Backlog CLI 分配为 doc-29 / DRAFT-8，正文引用同步；延期、四条未勾 AC、同源码 A/B、无 milestone 和后续 Owner 批准要求均保留 |
| [#705](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/705) / `c7596366f4ad9e2c899ef2f0dca302b5153d5eb0` | `docs/art/NATIVE_MONSTER_PRODUCTION.md` 及原 `PIPELINE.md`、`MULTI_MONSTER_DRAWINGS.md` 两入口 | 三份文档与来源 Git blob 相同；44/119 仅艺术参考及离线计数，不是生产接入或官方/设备通过 |

三份最小 diff 在新基线重放后不包含任一旧 HEAD，因此不能用普通 FF 替换原 PR head。采用 Owner 允许的一个集中接续 PR，不伪造已继承祖先，也不将旧基线 CI 当作新组合证据。

## 原提交保全

本地完整历史 bundle：`F:/New folder/.artifacts/cleanup-20261117/docs-closeout/original-pr664-666-705.bundle`。

- SHA256：`fd845db186b685d781c642ba54bd4334f38e59920a21097f7590f997e6b5f789`。
- `git bundle verify` 通过，三个 refs 与上表 40 位 HEAD 逐一相同；bundle 记录完整历史且无外部先决提交。
- 原远端分支与旧工作树不删除。bundle 是本地恢复材料，不冒称已托管；GitHub 原 PR 和原提交链接继续保留。

## CLI 与验证边界

所有 Backlog 写入均通过 CLI。普通 task lookup 不读取归档；本轮在临时 filesystem-only Backlog 视图将 tasks 目录映射至本独立树的 `backlog/archive/tasks`，再用 `backlog task edit TASK-45 --ac ...` 追加同一 AC5。未恢复到活动任务目录，也未重建或解除阻塞。CLI 生成的更新时间按本轮保留。

#666 的文档及 Draft 通过当前 CLI 创建/更新，保留正文、描述、四 AC、备注、负责人、标签、依赖与引用；新分配 ID 和创建/更新时间明确属于本次接续。原文件及时间戳仍可从上述来源或 bundle 恢复。当前“合并文档”的授权不提升 Draft 为正式产品任务，不批准流畅模式实现。

本轮只做最小 guidance、Backlog 和 diff 检查及独立 Agent 内容复审；准确 HEAD 的托管检查和自动合并授权分别取证。原大矩阵不重跑，不以文档合入认证成就功能、怪物量产、官方导入、ready、设备或发布。
