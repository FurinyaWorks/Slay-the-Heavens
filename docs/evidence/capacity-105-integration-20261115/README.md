# TASK-105 离线合同集成（2026-11-15）

集成基线：`origin/develop@c2409ad750c15124b7b843c6bbfa5b222537cb75`。
工作树：`F:/New folder/.worktrees/capacity-integration-1115`；短分支：`feat/capacity-integration-1115`。
来源：`feat/backlog-continuation-1115@92e794247566d27025e48d0073a9e502f2881eb0`，实现提交 `2e8d5d95`。

仅选择导入三个 `experiments/capacity-105/*.mjs`、容量附件、原研究报告和重放证据目录。来源提交的其他任务/计划/治理改动没有纳入。TASK-105 通过 CLI 接续，保持全部六项 AC 未验、负责人 Furinya，纠正过时 To Do 为 In Progress。TASK-97 的设计依赖纠偏由独立的 TASK-87.2 / PR #682 交付；最终容量切片不重复修改该任务文件，避免两个执行者写同一任务。设计确认、适用容量 GO 及 Owner 批准要求照常；离线合同集成本身不依赖正式角色开放。

## 证据体积与恢复

本轮先核对原始文件身份再决定归档范围；提交中只包含小型来源记录和验证索引。恢复归档只存本地忽略目录，不能把提交中的 hash 索引称为托管了原始大档。

恢复包为 **100,548,673 字节**，83 个成员，未压缩成员合计 102,157,335 字节；其中旧 39 份记录为 34,571,358 字节。最终 g 压力档仍需保全，已压缩档再次 gzip 收益很小，因此没有加入 Git。归档 SHA256：`9908ad59e28e28c4f25d8745901641d3afdd2ca29760e2707c553c5f9274354c`。

恢复归档包含旧 2026-11-13 的 39 份原始记录、旧脚本/报告、最终 g 轮 results/三个清单/28 档 gzip/精确脚本及三张必需 PNG、f 轮精确源码与 results。f/g 的 28 档压缩文件逐一相同，f 档案从 g 目录恢复，避免重复保存。a-e 中间生成轮保留原树，没有复制。

逐项大小、SHA256、归档路径和读回结果见 [archive-index.json](archive-index.json)。保留归档及来源工作树，主控清理本树前须先转存归档并核 hash；本轮没有删除或改写任何来源证据。三张源树 LFS 还原文件只读核 hash，本树没有还原图片。

标准恢复方式（先新建一个独占目录）：

```powershell
Get-FileHash -Algorithm SHA256 .artifacts/capacity-105-integration-20261115/recovery.tar.gz
tar -xzf .artifacts/capacity-105-integration-20261115/recovery.tar.gz -C <新的恢复目录>
```

恢复后按索引逐成员核对；`legacy-20261113/` 对应旧证据目录，`g-20261115/` 对应最终重放输出，`f-20261115/` 保留修前源码/results。三个脚本分别在各轮 `source/`，g 的三张 PNG 在 `hydrated/art/`；其余生产输入仍由历史 Git 提交及完整 input-manifest 指认，不把归档称为完整可玩候选。

## 当前基线验证与边界

本轮定向 replay 合同、历史 g 原始档读回及 Backlog 检查见 [verification.json](verification.json)。最终 g 原始 results 的 SHA256 为 `6d4b1ea656f4b9d9824f55e0d48ff85971421601d442f4ec200414f25d651ed7`，256,675 字节；639 输入全部仍匹配来源树，364 模块/28 档仅为历史 g 的事实。

当前基线仅验证合同和证据保全，不运行旧矩阵或生成本轮候选。历史 g 数值、旧 candidate/buildId、Lua/gzip/GIL 字节均不冒充当前正式 B0 或官方 MB。官方容量、当前候选导入/ready、PC/手机加载与释放、长期量产 GO 均未验证。六项容量 AC 均不足以完成。

Git 检出使 helper/test 的换行由历史 LF 变为 CRLF；`run.mjs` 与 g 原字节一致。三个脚本在 Git 换行归一化后逐字节相同，当前与历史原始 hash 分列于归档索引，未把当前 hash 写回历史 input-manifest。无需为非 production 合同导入还原 LFS 或重做生产装配实验。

初始候选 `fa8231bf` 曾包含 CLI 对 TASK-97 的同义纠偏；最终选片排除该文件，仅恢复为已受审基线版本，初始提交仍可恢复。`verification.json` 的 TASK-97 读回属于该初始候选，不能当最终切片的写入内容。

结论：可交主控评审的非 production 最小离线切片。独立审查、Hosted CI 与托管交付待主控；本地提交不代表上述准入通过。
