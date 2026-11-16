# PR #677：同步 fail-closed 修复而不搬 Release 独有来源层

来源 HEAD `51964793b3a6071619f25133642b3a698f753d74` / develop BASE `c2409ad750c15124b7b843c6bbfa5b222537cb75`。同一 #707 修复的 develop 接续，不修改生产、workflow、保护或历史归档。

原树定向复现两个失败：Draft/Fast partial migration 1；combined-closeout 的 draft helper 原 pin。`red-excerpt.log` 仅保存原输出的失败及汇总摘录，不冒称完整日志。原63种部分迁移与负控未删除。

- 所有逆向前保存调用者原文，拒绝时不提前删除 publication gate。
- 在本分支已有 bootstrap CI 来源层，仅将完整最终 helper SHA `357ad5c4d68378063b02cf75396f804c8c2b61d12a925595663a4b533948e4e6` 映射回原完整 SHA `5c3cc95c0371927db143c573c1500843b97ca8e138f67737aede03e558b1d986`；原历史 pin、库存保持。不搬 #707 的 selection-map 入口。
- 独审发现映射还须核对调用方 before.sha256：已保留正确前驱映射、拒绝错误前驱，新增两种换行下的正反控并复验。
- 既有 Release cases 增加 LF/CRLF、CRCRLF、追加/删首、非字符串/foreign路径及 Buffer 类型和身份负控；没有新增发现清单条目。

Node v24.22.1：summary + ci-impact 23/23，原 combined-closeout 单项 1/1；guidance/Backlog/diff-check通过。两份 LFS gz 仅恢复原 OID 内容、不入提交。没有运行本地或手动 hosted Full。独审与新 HEAD 托管结果分别核验，本地通过不代替分支保护或发布验收。
