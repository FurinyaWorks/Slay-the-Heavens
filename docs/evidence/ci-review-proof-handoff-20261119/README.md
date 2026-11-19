# 独审无请求结果的 proof 交接修复

基线：Develop `2ec45b9e52c870badc4d4888f6243a30556eecb4`。本片只修默认分支 Licenses 的编排错误，不是 Release 输入/BGM 集成，不修改权限、Ruleset、验证器准入条件、Full/Fast 策略或发布器的最终校验。

## 真实失败

- [run 44423671854 / job 135222850282](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44423671854/job/135222850282)：2026-11-19 00:09 UTC 失败。
- [run 44426729639 / job 135233386439](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44426729639/job/135233386439)：2026-11-19 00:18 UTC 失败。

两次都实际 checkout 上述 Develop，但 `workflow_run` 的 `AI_REVIEW_PR` 为空，事件 HEAD 分别为 `990cb29c961090c05f468179c8cf1109d8a63f5b`、`0cc0668c747f6c8ac8f16943942a7ba62f0427cc`，不是本轮当前产品候选。验证器合法返回 `{"state":"not-requested"}`，后续却无条件上传未生成的 `build/native-ai-review-proof.json`，因此报 No files were found。不是配额、系统权限或当前 Develop 产品回归失败；摘录见 `hosted-failures.json`。

## 最小修复与不变边界

- 准备命令仅在完整验证及同步写入 proof 成功后返回 `pr_passed` / `shadow_verified`；据该明确结果输出 `proof_ready=true`。
- `not-requested` / `superseded` 输出 false；未知结果抛错。不是用文件存在性跳过，即使残留旧 proof 也不上传。
- 命名、上传、最终发布三步都要求上述输出为 true，保留隐式 success 条件及 `if-no-files-found: error`。真正请求的 proof 丢失、写入失败、过期 artifact、错误来源/HEAD/BASE/attempt 继续失败；shadow 不发布 Required 状态。
- 历史来源只更新 `fork-preflight-source.mjs` 的三条**现行完整源码绑定**，旧压缩包、旧历史摘要及完整 predecessor 不动；LF/CRLF 投影保持，缺字节、追加字节、双 CR 拒绝。
- 回归并入既有 `auto-merge.test.mjs`，不扩张冻结 JS/Lua discovery inventory。

## 本轮验证

- 最初三条新回归在修复前全部 RED，见 `red.log.gz`；随后并入既有文件；日志中的本地绝对仓库路径替换为 `$REPO`。
- 最终五个定向文件：`auto-merge`、`pr-quality-evidence`、`ci-summary-runners`、`merge-queue`、`quick-feedback`，**138/138 PASS，0 skip**，见 `validation.log.gz`。
- YAML 完整解析：去掉预期新增的 verifier ID 和三个 if 字段后，与基线完全相等；权限、job 条件、concurrency、checkout、上传失败语义全部保留。
- `node --check scripts/publish-pr-quality.mjs`、`check:guidance`、`verify:backlog`、`git diff --check` 通过。
- 首次历史合同因两份本地 LFS 文件仍为指针而失败，基线控制同样失败。按原 pointer SHA/size 从已有本地对象只读核验并材料化后通过；没有修改、提交旧 gzip 或放宽其摘要。

没有重跑 Hosted 作业、启动 Full、发布 Required 状态或操作 GUI。此为本地定向证据，不宣称新 HEAD Hosted CI、真实 Fast 入队闭环或实机通过。保全分支待合规 PR、独审及既有门禁；TASK-81.2 的负责人、整体状态和未验 AC 保留。
