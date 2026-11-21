# TASK-75 来源夹具计算去重收尾

基线 `e65d9b98fbec69442047650254238cd9244df805`，独立分支 `feat/source-proof-cost-followup-1115`。仅将不可变默认夹具的 `source/expected` 派生移到每个 consume/host 一次；实际 owner 鲜读、故障、恢复、嵌套与 36/72/108 次混读断言全部保留。未修改生产、CI路由、权重、并发、超时或预算。

- 同源有界前后探针：69条断言轨迹一致，期望计算4→2；完整矩阵静态计算次数2170→62，不是墙钟提速数据。
- 原 named owner matrix：1项通过，0失败、0跳过；测试体11,413.3658ms，进程28,178.7303ms。没有同机旧版 named 墙钟基线，不与历史CI整文件584,077.3832ms计算提速比例。
- 独立复审 `/root/engineering_queue_audit:task75-pure-expected-hoist:20261115`：PASS，unresolved=[]；绑定测试LF SHA256 `603020d5d29e8c3d66886609f2dd7e3a142321ec63bb7465c23adf575db4a77e`。

`raw-evidence.json.gz` 无损保存原始前后源码、精确diff、探针、输出与作者阶段交接；解压JSON后按每项 `base64` 解码即可恢复原字节，大小与SHA见 `manifest.json`。作者交接中的“未提交”是该阶段事实；不借归档改变原结果。

本轮只收尾此切片，不扩展优化或测试、不触发Full、不建PR或进入发布队列。TASK-75保持In Progress，稳定Full≤30分钟目标没有本轮通过证据。

## 2026-11-15 接续到 c2409ad7

本节为本地集成验证；上文和归档中的测量、作者交接、独审均为原切片历史事实。

- 用户明确接管本地非 release 工作；接续树为 `F:\New folder\.worktrees\source-proof-integration-1115`，分支为 `feat/source-proof-integration-1115`。
- 基线 `c2409ad750c15124b7b843c6bbfa5b222537cb75` 经 `git ls-remote origin refs/heads/develop` 核对；目标测试自原基线 `e65d9b98` 至此没有变更。
- 父目录存在、目标目录不存在，且 `.git/info/exclude` 的 `/.worktrees/` 生效后，以 `git -c filter.lfs.smudge= -c filter.lfs.required=false worktree add` 建树。
- `git cherry-pick -x ef42f018` 无冲突生成 `f4df9d124dfbd141bdcaeb13e33826775e9e9634`，保留完整来源提交 `ef42f018f34f34e12df06364e780ad0c8fe89251`。
- 原工作树只读保留且干净；开放 PR 核对未发现重复切片。目标树缺本地依赖，执行 `npm ci --ignore-scripts --prefer-offline --no-audit --no-fund --fetch-retries=0 --fetch-timeout=30000`，安装 11 包，锁文件未变。
- 本片依据是原 run `43615128387` 的来源合同整文件历史耗时 `584077.3832ms`，仅消除不可变期望值的重复计算；不以旧 CC/SCC/fan-out 数字开工。原矩阵所有 actual owner 鲜读与负例仍在。

### 本轮执行证据

使用已有固定 `F:\New folder\build\tools\node-v24.18.0-win-x64\node.exe`（`v24.18.0`）。

归档核验：重新计算 gzip SHA256，与 `manifest.json` 一致；解压后全部 10 份材料逐项核对 base64 原字节、字节数及 SHA256。当前测试 LF 字节与 `candidate.test.mjs` 完全相同，SHA256 仍为 `603020d5d29e8c3d66886609f2dd7e3a142321ec63bb7465c23adf575db4a77e`。本轮没有改写归档或清单。

运行现有专项合同（没有新增或改写测试选择逻辑）：

```text
node --test --test-concurrency=1 --test-name-pattern="^(complete final lifecycle epoch|foreign, original, partial|fresh authorization covers|combined epoch authenticates|preRelicQuerySource:|root combined projection rejects)" tests/relic-query-source-inverse.test.mjs tests/integration-source-epoch.test.mjs

✔ fresh authorization covers the complete changed-owner union without caching (2.6325ms)
✔ combined epoch authenticates the complete current production tree (92.2747ms)
✔ preRelicQuerySource: current source and configuration match original target projection (17.3264ms)
✔ preRelicQuerySource: foreign input stays opaque and performs no linked reads (0.264ms)
✔ root combined projection rejects fresh missing/foreign/late-linked drift after success (3.9302ms)
✔ complete final lifecycle epoch restores all thirty existing Lua owners and exact 391 architecture without inventing witness history (188.3342ms)
✔ foreign, original, partial, duplicate and escaped-token sources retain their bytes without reading any linked owner (17.4651ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 27054.4309
```

`npm run verify:backlog`、`node --check tests/relic-query-source-inverse.test.mjs`、`git diff --check c2409ad7` 和 `git diff --check` 均通过。`npm run test:fast -- --base origin/develop --plan` 仅做规划，返回 `full: true`，原因为 `Unmodelled or deleted input: backlog/tasks/task-75 - 缩短完整跨平台检查的实际执行时间.md`；未执行其反馈列表或 Full。

### 验证边界与独审交接

- 本轮未重跑 `each direct and common source call...` 完整 named matrix；其原 1/1 通过、11,413.3658ms 测试体和 28,178.7303ms 进程记录只属于原基线。69 条同源有界探针本轮仅核验原始证据，未重新执行。
- 未跑同文件的完整 historical detached 35-owner 实文件矩阵及 current dynamic-owner 全 entry×owner 矩阵，亦未跑其余历史 source 向量、整套 `npm check`、托管 Windows/POSIX Full、官方导入、ready 或设备验收。不把本轮 7 项通过当作这些要求的通过。
- 静态期望计算次数 2170→62 及有界 4→2 来自原证据；缺少同机旧版 named 墙钟基线，不计算或宣称墙钟提速比例。TASK-75 的 AC4（稳定 Full≤30 分钟）保持未勾，状态仍为 In Progress/Furinya。
- 本轮测试改动逐字等同来源提交；范围保持原 5 文件（TASK-75、此 README、manifest、raw archive、目标测试）。无 helper 摘要或源码 epoch 更新，无生产、CI、预算、超时或 release 改动。
- 主控仍需对新分支精确 HEAD/base 发独立评审：重点核对 immutable expected 外提没有缓存 actual 授权、35-owner 故障/恢复/nested/mixed 断言与循环覆盖保留、历史证据与本轮验证不混用。原 reviewId 不冒充新组合独审；精确 HEAD 的 Required CI 和交付准入尚未执行。
