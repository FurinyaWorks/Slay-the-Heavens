# TASK-105 离线重放证据

集成沿用 #683 的三个实验脚本和 TASK-105 状态记录。脚本来源为 `2e8d5d95`，可查原接续提交 `92e794247566d27025e48d0073a9e502f2881eb0`。历史日志、原报告、校验与恢复索引保存在 #683 原 HEAD `6b901cd08f9255bf428320b1aaf48be99b6977da`。本分支保留该提交为祖先。

- [原集成交接及校验和归档索引](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/6b901cd08f9255bf428320b1aaf48be99b6977da/docs/evidence/capacity-105-integration-20261115)
- [原重放矩阵、负控和完整输入清单](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/6b901cd08f9255bf428320b1aaf48be99b6977da/docs/evidence/capacity-105-replay-20261115)
- [原研究报告](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/6b901cd08f9255bf428320b1aaf48be99b6977da/docs/research/TASK-105-OFFLINE-20261113.md)

历史 `input-manifest.json` 的 SHA-256 为 `b52489fbef07eb991cf123d7f669d87c2531616058f32e56a63d2503d9a40c60`。`replay-summary.json` 的 SHA-256 为 `c9be36dc4f9b5448b5c7c05f61a5e679d546872ca75d9013da39ff927d0b0b8e`。旧工作树生成的 100,548,673 字节恢复包曾按 SHA-256 `9908ad59e28e28c4f25d8745901641d3afdd2ca29760e2707c553c5f9274354c` 读回验证，仍需由原工作树负责人转存。

离线验证入口为 `node --test experiments/capacity-105/replay.test.mjs`。正式容量、当前候选导入与 ready、PC 和实体手机验收、长期量产准入待验证。TASK-105 保留六项未验 AC。
