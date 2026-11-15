# PR #689 / PC18 图标重叠只读审核

结论：**共同覆盖基础奖励图案绑定，但不是可互相替代的整片修复。冻结组合仍缺 #689 的已知旧图池退休保护，最小实际 Lua 反例确认。** 本报告不是新组合的产品独审或 Release 准入。

## 精确范围

- Release 基线：`36b9b157ee6f05b65eb9f1da7e2978647d36c210`。
- #689：`23bed75c642f8f4af5c2783526a5afc4a57f471f`，直接基于上述 Release；连接器读取为 open、draft、未合并，目标 `release/v2.0.0`。
- PC18：`9fc7e700fdf5df415db62d2fa6c9d3050d92e0a5`；产品链 `c931bc2d`（选择 a274 图案链）→`0345006e7d4d1cd39549a1479036fd7cb38f9be6`（fallback）→`bca8c5f18684f301378e5b9c12e85a16321bbc2f`（权威奖励别名）。不混同另一历史提交 `0347b074`。
- 组合冻结：`c41b162b1d01069d7f78f647a28a6ca70a9d8097`，树 `.worktrees/release-pc-item-title-shadow-1116`。只检查此 SHA；工作树有 owner 正在整理的证据改动，未触碰。后续退休修复不在此结论内。
- 只读生产差异、现有测试断言、#689 文本；独立运行四个有界 Lua probe。未跑 Full、Host 整组、GUI、候选或设备。

## 可核事实：共同部分与差异

| 范围 | #689 | PC18 / 冻结组合 |
|---|---|---|
| 共同症状 | 奖励页仍是通用原生图，领取后顶栏/详情已有同 ID 图案；原始手机症状按 PR 文本归属，未看私图 | 已把遗物奖励接入 Art，也扩展药水与其他 owner |
| 既有配方 | Release 已有 `blue_candle` 7 图元，#689 不改 registry/Art API | 复用相同蓝蜡烛配方，另有新增遗物/药水配方 |
| `scripts/lowcost-art.mjs` | 每奖励行四态中抽出一个真实 root fallback + 一个同父 16 槽池；移除另三份 fallback | 每行每态保留自身 fallback + 16 槽池；另有药水 10 槽链 |
| `abyss_battle_reward_layout.lua` | root 共享 icon 缓存；`hidePool`/`paintShared` 退休失查或替换后仍属原 owner 的旧句柄 | 每态 icon 缓存；`SetVisible(true)` 后直接 Art.paint，无旧池缓存/退休 |
| 奖励来源 ID | 现有 Hooks.localId 足够解析 `Blue Candle` | bca 增 `relicId(item,run)`：有 run.data 时先用现有权威 Rewards.definition，再 fallback Hooks；不可被 #689 整文件覆盖退回 |
| 原生 fallback 修复 | 除恢复 icon 外还隐藏已知旧池 | 0345006e 只改 `abyss_node_ui.lua`、`abyss_relic_view_ui.lua`；奖励 caller 自己恢复 icon，但不能因此找到失查旧池 |

两者 `abyss_lowcost_art.lua` 完全相同，blob `77acdacc76b74288076e11ac2a4a6eac1f49479e`。`Art.poolFor` 查找失败就返回 nil，`Art.paint` 返回 false；不会通过保存过的句柄清理旧池。此问题来自 caller 保护缺口，不是新的图案或规则缺失。

PC18 与组合冻结的两条冲突产品路径完全相同：构建器 blob `bfce0fc6d07dda6fcdc3b2ba437138526fe923b2`、奖励 Lua blob `bd3eb2c9841c5e966f1f9717850f97b65c457a0a`。#689 对应为 `83d3b832bb926ef0e784ac63fe4ae9936ecadd91`、`3fca40df0a4e2a70b6ac8dfad52e39d093e0e7b0`。

基础绑定来源是 `a27449ecef1f5e02034c22e677ed9f9a9bfe86aa`；它整体含 99 路径，不能为了两个 helper 导入整批素材、CI 来源链、药水或未来功能。#689 本身仅两条产品路径，另四条是测试/说明/计数。

## 独立反例与测试证据边界

原始工件在 [pr689-overlap-probe](./pr689-overlap-probe/)：`probe.lua`、提取生产模块、四份日志。探针用真实生产 Reward/Art Lua，Theme/身份 provider 和 native handles 为有界假体；分别按 PC18 每态 owner 与 #689 root owner 建图。生产提取仅经 PowerShell 文本写入，存在换行规范化，无逻辑改写；原 Git blob 身份如上。

共同前置：成功绘制同一配方，旧池 alive、parent 仍归当前 owner，fallback 被 Art 隐藏。然后让 GetChild 缺失或抛错，保留原池真实句柄。

| 冻结源 | 失查类型 | 观测 | 进程 |
|---|---|---|---|
| c41b162b | missing | fallback=true，oldPool=true，oldPoolStillOwned=true | exit 1 |
| c41b162b | throw | fallback=true，oldPool=true，oldPoolStillOwned=true | exit 1 |
| 23bed75c | missing | fallback=true，oldPool=false，oldPoolStillOwned=true | exit 0 |
| 23bed75c | throw | fallback=true，oldPool=false，oldPoolStillOwned=true | exit 0 |

运行 Node `v24.18.0` + 本地 Fengari 的 `-e dofile(...)`，确保 Lua assert 传递非零退出。最初 sandbox 启动四次均 `-1073741502`、未进入 Lua；使用受审提升后得到表中结果。没有把启动失败算行为 RED。

**事实**：旧池仍可见，fallback 也可见，退休 helper 会隐藏该旧池。**推断**：根据生成树 fallback 后紧邻图池的兄弟层级和相同锚点，旧 glyph 可以继续覆盖/污染 fallback。未在官方客户端观察像素，不声称复现原手机截图。

现有 `tests/helpers/relic-fallback-runtime.lua` 的 25 项成功合同检查四 surface 的原生 icon 可见/图号及恢复；失查窗口没有断言之前保存的旧池隐藏。`tests/helpers/reward-art-runtime.lua::unavailablePool` 同样只断言 fallback，恢复后再检查当前池。它们有效证明 icon 恢复，不能证明旧 glyph 退休；不得将这些 GREEN 冒充 #689 新负控覆盖。

#689 已入库测试另有旧池隐藏、两行隔离、同/换图恢复、replacement、owner 转属负控。这里只读其断言，没有重跑其完整 Host。独立 probe 仅覆盖 missing/throw，不将其扩大成 dead/replacement/reentry/RNG 的独立通过。

## 最小复用建议与归属

1. 在当前奖励 caller 选择复用 #689 的 `hidePool` / 旧池观察与退休语义，维持真实 owner 校验。保留 PC18 每态 owner、药水分支与 bca 权威 `relicId`；不要整文件覆盖。尤其不能把 owner 已转属另一行的旧句柄隐藏。
2. 新切片先用保存旧 handle 的可见性断言 RED，再覆盖两行四态、同/换图×missing/dead/throw、replacement、owner 转属和确实被引擎销毁的边界；源码评审、定向回归与必要 CI 绑定新精确 SHA。该建议不是这些新场景已通过的声明。
3. root 共享 fallback/池是 #689 的另一结构优化，与退休保护可以拆开。若保持 PC18 每态构造，不能复用 #689 的净增 28 控件收据；原两个完整生成树的计数也不能相加或换算成 MB。正式容量仍须同候选官方读数。
4. `TASK-38.8` 继续归属 #689 / 未合 #673 的只读合同。本次不复制任务、不认领、不标 Done。PC18 新修复记录可链接 #689 来源与本报告，任务登记合入后由主线程 Backlog CLI 对齐归属，避免同一保护重复报交付。

无新增私图、素材/字库或许可需求，最小 helper 复用只处理已有句柄；这不改变素材既有许可。官方容量、导入/ready、PC 与受影响手机路径、原截图像素与正式 RC 均未验；不授合并/发布许可。未调查 #688，也未审后续正在实现的新组合。
