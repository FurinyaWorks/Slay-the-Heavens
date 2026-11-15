# TASK-102 自维护入口核对

2026-11-15 本轮仅核对已交付入口与来源，不启动 MCP、重启连接、采集资产或操作官方编辑器。

## 仓库与可恢复版本

- 自维护仓库：[FurinyaWorks/genshin-miliastra-mcp](https://github.com/FurinyaWorks/genshin-miliastra-mcp)。
- 资产交付提交：`150b54addbc2a5c7352f4d8aaa7a217e732cda90`，分支 `feat/asset-incremental`。本轮 `git ls-remote` 实际读回该分支的完整 SHA 一致。
- [自有 PR #1](https://github.com/FurinyaWorks/genshin-miliastra-mcp/pull/1) 本轮实际状态为 **MERGED**，HEAD 同上；[上游 PR #3](https://github.com/8itlab/genshin-miliastra-mcp/pull/3) 为 **CLOSED**、`isDraft=true`。这是核对时状态，不再沿用旧任务中“两项 PR 仍待更新”的描述，也不将自有合并当作上游接受。
- 自维护说明：[ASSET_MAINTENANCE.zh-CN.md](https://github.com/FurinyaWorks/genshin-miliastra-mcp/blob/150b54addbc2a5c7352f4d8aaa7a217e732cda90/docs/ASSET_MAINTENANCE.zh-CN.md)。该说明包含版本/来源、增量采集、种子、候选状态、验证及中断恢复方法。
- 本机副本：`F:/New folder/worktrees/miliastra-assets`。本轮读取 HEAD 为 `504a18ea5b3fc63027c045170bfae4ed0ac1a265`，比资产交付提交多两项本地试玩工具修复；不能把此本地 HEAD 写成已推送的资产版本。
- 旧 `D:/MiliastraTools/genshin-miliastra-mcp` 保留。本轮未写任一工具源码、安装目录或工作区。

## 实际配置读回

只读取 `C:/Users/Administrator/.codebuddy/mcp.json` 中 `mcpServers.miliastra` 的以下白名单字段，未复制完整配置或任何凭据：

| 字段 | 本轮读回 |
| --- | --- |
| command | `node` |
| args | `F:/New folder/worktrees/miliastra-assets/src/server.mjs` |
| MILIASTRA_WORKSPACE | `F:/New folder/worktrees/miliastra-assets/workspace-furinya-20261107-v3` |
| MILIASTRA_ALLOW_LIVE_WRITE | 字符串 `0` |

入口文件及 v3 工作区确实存在，工具仓库的受跟踪文件干净。配置只说明后续启动的入口；本轮未重启连接，不能据此证明已运行进程加载了当前 HEAD。

## 已交付与未验证

工具维护说明记录了 11 套官方手摆底盘、4 个秘源机兵动作及 26 项特效/缩略图的既有来源和独立读回。它也明确这些是局部差量，不能表述为完整采集了所有 7.1/7.2 新素材；本轮没有重做这些采集或追认新的设备通过。

当前 `src/scene/assets.mjs` 的查询状态区分：已有官方种子的新增造物为 `candidate-only`，尚无种子者为 `unverified`。`src/scene/blocks.mjs` 仍对没有种子的 `catalogOnly` 造物拒绝构建。候选可以生成，不等于独立生成实体已经 spawn、执行动作或完成战斗。

后续接入仍按维护说明在独立副本检出明确提交，使用独立工作区并保持 `MILIASTRA_ALLOW_LIVE_WRITE=0`。新会话先读 `miliastra://workflow` 和 `miliastra://platform-rules`，所有存档只写副本。实际配置变更、连接重启与桌面采集本轮均未执行。

TASK-102 仍有场景物件、音效、UI 图片、更多动作及独立 spawn/战斗/完整日志验证余项。代码已推送与接入入口可核对，不能据此把全部任务或官方设备验收结项。
