# TASK-4.21：#694 已知前置组合准备

本附件只准备既有手牌布局分配修复的来源、库存与隔离复制兼容，不新增产品修复，不改变任务状态或手机 AC。#694 原头及原工作树未修改。

## 精确来源

- 本轮读回实际 Release：`36b9b157ee6f05b65eb9f1da7e2978647d36c210`。
- 显式组合的未合前置 #692：`b67226945c2be47c8fff31f1362412b973f68875`，不是已落地 Release。
- 原产品提交：`da45571bb8e667a2ad9910acf60cafd8721839d4`；在前置上 `cherry-pick -x` 得到已提交 checkpoint `f5169260880043c0fbf5d51ad869e1b493cea85d`。
- 唯一生产 owner `src/lua/abyss_battle_card_view.lua` blob：`caabf5f148d881d5c3a9e622b52b68db9e9e74aa`。原产品提交的全部 8 个变更文件逐 blob 相同，含全部 JS/Lua/support fixture、隔离 helper 与原任务证据。
- 生产包绑定上述真实 checkpoint，`currentTreeCommitted=true`；CI 辅助 after 单独捕获，`currentTreeCommitted=false`，不宣称已在 checkpoint 中，也不造未来 squash SHA。

## 最小兼容

复用现有 `createSourceEpochProjector` 和稀疏 packet：一份单 owner 生产增量、一份 13 文件 CI 增量，保留完整旧 targets/owner union。当前实际磁盘与原 discover 合同读回 **877 JS / 1425 Lua**；先校验当前完整输入，再显式投影历史 **876 / 1423** 库存。

旧 93 份 gzip 的实际 smudged 字节均按既有 Git/LFS OID 与 size 核对未变，bootstrap helper/包未变。生产复制闭包只增加精确的 helper/helper/gzip 三依赖，CI leaf 不进入生产闭包。工作流、成本、分片、未知成本、预算、旧冻结断言与负控均不变；新 raw 层核真实硬超时，forecast 仅输出诊断。

| 新 packet | SHA-256 | 字节 |
| --- | --- | ---: |
| mobile-hand-source.json.gz | `f09812ac4f7c422d8a4530a8efa9ca0e35048eb1a2f4a7940495d76495f5ee4c` | 10815 |
| mobile-hand-ci-source.json.gz | `5ec529b66d3a1e9411e84145080b44bf05b26305882e82890db0a5a03a0f874b` | 131694 |

## 本轮有界证据

Node `v24.18.0`，串行窗口运行；原始日志保存在本工作树 `.artifacts/hand-prep-1116/`：

- `source-contracts.log`：仅本次 delta 与必要相邻命名来源/库存/copy 合同 **9/9**，45.96 秒。覆盖当前完整库存、缺失/重复/外来输入、after 漂移、部分 packet、生产 owner、旧 bootstrap 与复制 warm-success 后依赖漂移/删除拒绝。
- `hand-layout-once.log`：原 `tests/hand-layout-values.test.mjs` **2/2**，12.48 秒，只运行一次。包括 243 组数值等价、真实 Host 静止/hover/drag/resize、fresh origin snapshot 与 Core/RNG 不变。
- `verification.json`：8 个原产品文件 blob、93 旧包、生产/辅助身份和精确通过名称。核对脚本首次因 Git 对中文路径 quote 输出失败，改为只读 `core.quotePath=false` 后完成；不是产品或合同失败。
- `git diff --check` 通过。未重复旧缓存套件、工程回归或 Full；未执行 GIL、官方客户端与设备操作。

收益仍仅是原离线计数：300 帧 cache-hit 的临时 8 值 handValues 表 **1500→0**，必要的两值 cardPositions/origin 快照 **1500→1500** 保留；不是总分配、FPS 或手机卡顿根因结论。

这是已知未合前置上的准备证据。实际 Release 准入仍需前置真实落地后核对相关 blobs、绑定真实 base 并独立复审；本附件不声称 Full、官方容量、客户端或 iPhone 14 Pro 实测通过。
