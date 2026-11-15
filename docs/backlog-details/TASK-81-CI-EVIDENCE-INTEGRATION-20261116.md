# TASK-81 历史 CI 证据接续核验

## 来源与边界

- 集成基线：`c2409ad750c15124b7b843c6bbfa5b222537cb75`。
- 来源提交：`92e794247566d27025e48d0073a9e502f2881eb0`；仅接入 [ci-throughput.json](../evidence/backlog-closeout-20261115/ci-throughput.json)，逐字节核对一致，Git blob 为 `0ca65c51cb00f0fcfa6ab33e5c0d1a86a308ec81`，不改写历史内容。
- 2026-11-16 离线读回材料位于 `F:/New folder/.worktrees/backlog-continuation-1115/.artifacts/ci-completed-cost-1115/`。下列 11 文件均未被 Git 跟踪，该目录被本地 exclude 忽略；本切片未托管这些原始及派生材料。哈希仅记录本轮所读文件身份，不能代替原件。
- 本轮仅核历史数据，无新 CI、远端 CI 查询/轮询或测试补样本。TASK-81 保持 Furinya / In Progress，AC1、AC2 已勾，AC3 未勾；截止日期与 CI 实现不变。

## 原始 run/jobs 核算

四个 run 均为同一 `e65d9b98fbec69442047650254238cd9244df805`、attempt 1、completed/success。每对 Quality/Licenses 的 SHA、event、branch、attempt 相同；jobs 的 run_id、head_sha、run_attempt 一致，数量等于 total_count 且 ID 无重复。两次 Quality 各 38 jobs：18 个 Windows rules、15 个 POSIX engineering 及其他必需作业成功，单个未展开 fast 为 skipped。

`qualityWallSeconds = Quality/check.completed_at - Quality.created_at`；`requiredWallSeconds = max(check.completed_at, inventory.completed_at) - min(两个 run.created_at)`，包含等待，不是作业执行秒数之和。

| Quality run / event | created_at（UTC） | check 完成（UTC） | Quality / Required 秒 | Licenses run / inventory 完成（UTC） |
| --- | --- | --- | --- | --- |
| [43615128387](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43615128387) / push | 11-14 16:21:05 | 11-14 17:35:07 | 4442 / 4442 | 43615128259 / 11-14 16:23:21 |
| [43605179989](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43605179989) / merge_group | 11-14 14:30:12 | 11-14 16:20:35 | 6623 / 6623 | 43605179905 / 11-14 14:41:51 |

Licenses 两项 inventory 自对应 run 创建起分别 136 秒、699 秒。队列 Quality 的 `updated_at=16:20:36Z`，故 run 生命周期为 6624 秒；Required 在 check 完成时为 6623 秒，不能混用。两个 Full 均超过 1800 秒，只是历史观测，不证明当前或稳定性能。

## timing 与样本核对

- push job `132508908756` 为 `rules (7/18)`，16:53:05Z–17:29:49Z。`rules7-push.log` 的分片名、检出 SHA 与日志时段匹配；从 `CI_FILE_TIMING` 提取 49 个唯一文件，逐项 file/durationMs/success 与派生 `rules7-timings.json` 相同，均成功。
- 按耗时降序前 8 项与历史 JSON 相同；49 项日志求和 `1485033.9004999998 ms` 与历史 `1485033.9004999988 ms` 仅浮点累加顺序差异（小于 `0.000001 ms`），保留原 JSON。该值仅为该分片逐文件计时之和，不是 Full wall time。
- `plannedMs` 沿用历史派生材料，ratio 复算一致，不代表本轮或当前 Runner 实测权重。
- 本子集只有两次 Full，自然 Quality Fast 为 `0/20`，P50/P90 未知；不推断子集外样本数量，不将 Full、跳过的 fast 或 advisory 计入 Fast 验收。历史 `summary.json` 与该边界一致，不能据此将 AC3 或任务改为完成。

## 所读材料 SHA-256

前 9 项为原始 run/jobs/日志，后 2 项为来源树已有派生材料，均位于上述本地目录。

| 文件 | SHA-256 |
| --- | --- |
| run-43615128387.json | `4eb816b47a6afb90b93ecdf2cac49ded934f803af647ebde061d2c7e9c1ac07a` |
| jobs-43615128387.json | `c5dd626c0eab2080e0fd30dd2326a6964e03812ea50d9556c249abea8f041fa9` |
| run-43605179989.json | `a21e4f261fb1a41a7e78f92d1af3edc7a6046c6f7a1bf9f643285866e4307abd` |
| jobs-43605179989.json | `aa585aae5da812e394e2e67972a699582b83bed275ee1d716c591e4b5c082c8e` |
| run-43615128259.json | `1505ada5f08673a66cf5b5db27ed37c4809c42fe6d9b52b5ed6743eee11e2021` |
| jobs-43615128259.json | `65b660be7af92b998c5adaf3c025787c315c73800634c8bbee2a987635d16646` |
| run-43605179905.json | `7a30a7e02e9e09cec9bd65df7e802f29d0426fcf0cc72b052035eb086dea03fa` |
| jobs-43605179905.json | `1967f9b3a1ec62de1a5b1679de050c13153567679ae879a43ff99b47d2d257a7` |
| rules7-push.log | `f2f27d93c08ac2bfddc2a45a4209e4d61b0b13b36a90981ae1b20c52d0dfb263` |
| rules7-timings.json | `838758936d56188d4cdb9ae03571ac2b3195e44c90ed4794a9a419798712b1f2` |
| summary.json | `24e2741c691adc7c206098a746b7b2e32c48dbfe366e702d09e2d6e8edf3dd41` |
