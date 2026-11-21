# 核心架构专项接续

基线和当前 develop 为 `345ba08398b6ca8e1361a126f2ce1de85210e634`。专项组合测量源码为 `13f9d445ca51ae0a8daaec7d115c4871d8bba768`，用于保全测量和后续逐片接续。合并使用各自独立短分支及正式 PR。发布引用和当前候选未改动。

| 范围 | SCC 成员数 | CC>30 | CC>15 | 最高 CC | 完整测量 |
| --- | --- | ---: | ---: | ---: | ---: |
| develop | 67 / 11 / 2 | 25 | 198 | 64 | 6236/6236 |
| 本地组合 | 64 | 0 | 164 | 30 | 6379/6379 |

[完整来源对账](../evidence/core-architecture-20261121/source-ledger.json)保存 #714 全部路径、四份已交付切片以及独立短分支的固定 SHA。[剩余 CC>15](../evidence/core-architecture-20261121/remaining-cc-over-15.json)保留完整身份和位置。两个 gzip 报告保存全部 AST 边、环内调用点、诊断和 Luacheck 测量。原冻结基线保留。候选正向通过后，实际生产 Lua 的 CC31 样本触发原工程入口退出 1，文件已经逐字恢复。

## 已提交的切片

- [#805](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/805) 地图、宝箱与轮盘／蜿蜒事件，899 个旧新 VM 图检查点和 4 个语义负控。历史来源读回保留原字节，拒绝现行路径中的旧版、空输入和漂移。局部门禁检查唯一 AST 入口和嵌套函数。本地来源、分片和结局 129 项通过。
- [#806](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/806) Power 显示成员和调度解环。10 项边界检查及 45 项来源合同通过，覆盖即时和延迟回边、冷加载顺序、动态方法、脱离帧及异常身份。[REASONS 及旧 CI 失败证据](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/680a44108bdbb1f1d2402fc224f5a602df7fab70/docs/plans/2026-11-21-core-architecture.md) · [Power ADR](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/680a44108bdbb1f1d2402fc224f5a602df7fab70/docs/adr/0002-power-membership-and-schedule.md)
- Run/Relic 以显式会话命令保持交易与嵌套回滚，拆除 11 模块环。26 项原装配及奖励旧新回放和负控通过，历史装备外层来源身份还需按当前组合接续。
- Actor/Combat 的 Focus、Artifact、姿态算术和 Stasis 升级从原反向导入改为窄职责接口。原伤害、Watcher、Silent、Writhing Mass 对应夹具及明确的升级回滚探针已经本地复跑。原 #714 的剩余 Combat host 迁移仍须逐消费者适配并复跑旧失败，原失败不能由这批夹具成功解除。
- Display、流程事件和 UI 的准入、渲染、反馈责任已保全。反馈旧新 4,690 个完整图检查点覆盖全部十组。首次三组本地超时保留，串行定向重跑三组均通过，原 30 秒单 VM 限制保持。Map UI 九项、奖励 UI 28 项、旅人肖像 34 项原生离线合同通过。Watcher Flow 的历史完整源码断言需接续精确版本，禁止直接替换原收据。余下 SCC 的最大反向依赖按[完整图](../evidence/core-architecture-20261121/checkpoint-snapshot.json.gz)继续拆分。

## 正式接续

两 PR 的当前独立 Review 分别为 `6005890914` 和 `6005788360`。在有权读取 GitHub API 的协调环境中，重读当前 HEAD/BASE/merge tree 后执行既有 `npm run merge:auto -- <PR> <review>`。当前两次真实调用均在读取固定仓库 ID `1429751262` 时返回 HTTP 403。实际 Required CI、Merge Queue 和合后 `npm run verify:delivery -- <PR> <预审证据> --merged` 分别取证。TASK-74.19/74.20 由 Furinya 继续，保持未闭合 AC。

A/B 默认分支仍在 `c2409ad7`。A 仍为 5 分钟 Quick，B 默认 YAML 只声明 `runner_pool`。当前主仓候选版本已含两类预检的 `base_sha`、真实 checkout 收据和 30 分钟 A Quick。统一文档按候选 ref 传参。A/B 本轮没有新派发。读取历史 A Quick、B 现行其他候选 Full 与既有取消 run，保留其原结论。当前 CLI 访问 Actions API 也返回 HTTP 403，排队、实际 Runner 分钟和重跑成本待有真实作业时用 `scripts/ci-run-costs.mjs` 采集。

[主仓 #805 Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44913288990)／[Licenses](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44913288972)，[主仓 #806 Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44912036953)／[Licenses](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44912036963) 尚在排队。现行 A 分支的历史 Quick 单 job 成功，B 最近其他候选 Full 失败，历史 B Full 取消轮已测 105.53 Runner 分钟。合并窗口和成本比较仅使用可认证的真实候选 job 记录。[A Quick](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44025235537) · [B 其他候选](https://github.com/v5g95m7t8m-max/Slay-the-Heavens-Fork-B/actions/runs/44905359933) · [B 历史取消](https://github.com/v5g95m7t8m-max/Slay-the-Heavens-Fork-B/actions/runs/44034686329)

本地组合 `npm run check:engineering` 通过，保留 6 条历史诊断，4 项语义变异被检出，7 项原生合同通过。实际提交的 41 个 Lua 文件通过从固定基线执行的增量棘轮，共零新增违规。

#714 保持 FROZEN。原 HEAD 为 `d8b714bc25ec8777cb3d947bd07fa4abc55f8835`，可从 `refs/pull/714/head` 恢复。四个已合切片 #724、#727、#733、#735 不重复接续；其余路径逐项见对账。保存失败、旧测试和审查证据，后续仅在实际合入及合后 Full 通过后收口。
