# TASK-4.21 敌人坐标路径状态派生剪枝

## 来源与范围

按本轮协调授权接续既有 TASK-4.21，只迁移已保存的 `b56e1c39c16fd73674d71bd3ab025e5aa34ce0dd` 性能小片；该片也已包含于 `be41ed0b07c593d08ff4a75686f99033571830df`，两者三份 runtime blob 相同，不另立任务或重做优化。既有两树均保持原提交和干净状态；TASK-100 的最新记录为停工后保存，不作为新的文件占有。TASK-4.21 在本基线为 In Progress、Furinya、3/4 AC；task:pick 按既有交付返回 HOLD，本轮按明确授权协助迁移，不重复认领或勾设备 AC。

新树 `.worktrees/mobile-enemy-geometry-v2-1115`，分支 `fix/mobile-enemy-geometry-v2-1115`，实际 fetch 的 Release 基线为 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`。未改 target_bindings/card_gestures、其它任务文档、master、版本、候选或 Tag。

只改三个运行时文件：`abyss_battle_enemy_view.lua` 允许显式不计算 `statusCountWidth`；`position`/`rowY`、意图位置、名称悬停与目标判定明确选择坐标模式。默认完整 geometry 仍即时计算最新有序状态列表，不缓存状态或几何，不改视觉/玩法/输入。

## 同源 RED → GREEN

原 JS/Lua 专项和其缺失的 21 行隔离生成 helper 从 b56 原样迁移；helper 与 #684 中 blob `a816eee3dd93cca12552887f2b43ca412c169d01` 相同，只是测试依赖，不复制 #684 其它链条。该 helper 按本树源码生成官方 profile 模块，使用原测试时限。

| 本轮入口 | 实际结果 |
| --- | --- |
| Release 未改 runtime + 原专项 | RED：`coordinate-only geometry derived a status list`，非 mock 耗时推断 |
| 同真实 Host 预热90帧、再静止300帧绝对计数 | before=900、after=0 次 `Actors.statusView`；两阶段均断言精确期望值 |
| `node --test tests/enemy-geometry-metrics.test.mjs` | 1/1，通过双 profile、8种坐标组合、状态数值/成员/顺序/删除、Guardian活阶段/退役、300帧完整Run/RNG相等及停用身份 |
| `node --test tests/enemy-status-hand-clearance.test.mjs` | 原1入口通过；完整官方状态行/长列表/目标命中和三项精确布局负控均保留并通过 |
| `npm run check:lua-static` | 固定 Luacheck 1.2.0，无新增诊断，原CC15等门槛通过 |
| JS语法、Backlog、空白 | 定向检查通过，不改阈值/预算/断言 |

最初依赖 junction 使用相对目标失败、随后缺 Fengari 的输出另存 `setup-missing-fengari.log`，是测试环境失败；修正为绝对目标后才取得上述产品 RED。原测试未被放宽，计数探针存于忽略的 `.artifacts/enemy-geometry-v2-1115/`，before/after使用同一脚本、生成方式、seed和300帧负载。

## 基线等价与去重

三 runtime 的 Release 增量与原 b56 增量 stable patch-id 均为 `56895c1af7765788d085f99a1b087985bc3aa905`。enemy_view、targeting 及原三份测试文件最终逐字同 b56；render_actors 的完整文件因 Release 尚未纳入 PC sleep/potion-art 呈现而与 b56不同，本次仅原来的两个坐标调用点变化。

已实际读回 #672=`1f7ce04c53189db8c39b59c797a45d57a2c7bac1`、Release #684=`d396abb252b4dcfe4d825dccc6c850daf81086c9`：均未包含本坐标剪枝。共同文件仅 render_actors 的不同区域；#684保留sleep呈现，#672另含瓶身art。两份PR在本次三文件范围的完整diff均通过当前源码上的 `git apply --check`。无需运行时依赖它们，没有将其状态/设备证据迁来；正式组合仍由协调者与独审核实。

原始日志：`baseline-red.log`、`baseline-count.log`、`geometry-green.log`、`optimized-count.log`、`adjacent-status-clearance.log`、`lua-static.log`、`backlog.log`、`equivalence.json`，均在上述忽略的证据目录。最终精确HEAD独审另交，不沿用旧性能分支的通过结论。

本次未跑 Full、未改CI或添加ci:full；按本轮授权独审后才可交独立Draft PR，正式ready仍走原Release门禁。未官方导入/ready/容量、未构建新GIL、未做iPhone 14 Pro实测；计数仅证明删除冗余派生，不证明手机FPS/加载/响应改善，AC3保持未验。

## 2026-11-18 独立合流

本片从 #688 的原始产品提交 `d8f03fa79aacb62fd663d75fdfd3a037a9eb2984` 提取三个 Lua 文件。三个产品文件与原 PR 固定头 `f03605d69b0943139a2d1f015edd953cb9958089` 字节相同，移植基线为已含 #721 和 #723 的 `release/v2.0.0@6aaed54a56c3d2769a71feea3580798ae421a0e8`，产品检查点为 `aa94670285691a41d6c0e9629ad540ccb4efe159`。

沿用原始生产收据及三个回归入口。独立官方配置、当前工作区的直达 Lua 调用及其它工作区的同名脚本均有回归，且运行后共享主题字节一致。300 帧 Host 轨迹、完整 Run/RNG 与原状态布局验证由 `tests/enemy-status-hand-clearance.test.mjs` 运行。旧的 76 个来源视图保留，本片增加一个明确的前驱视图，不扩大现有顶层测试清单。完整旧日志、收据和交叉验证分别保留在[敌人几何固定归档](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/f03605d69b0943139a2d1f015edd953cb9958089/docs/evidence/enemy-geometry-actual-release-20261116)和[原组合源树](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/f03605d69b0943139a2d1f015edd953cb9958089)。官方同候选、设备体验与实机性能仍待验。
