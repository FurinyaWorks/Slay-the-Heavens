# 历史卡牌输入三片：隔离配对证明

## 范围与身份

本阶段只保全证据，没有修改生产 Lua、正式 `historical-card-input.mjs`、`scripts/test-lua.mjs`、三片 Lua 入口或原断言，也没有更新 #738 或运行 Full。

受测树为远端 [`6d267ca80abd80efb334f8f7581111166174de2d`](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/6d267ca80abd80efb334f8f7581111166174de2d)，tree `e57acd44f70a608975d207908236729a8d5b4446`。日志中的本地提交 `c3d7cf072b1942291a4ab7a14cc7231274a545bc` 与其完全同树，不是另一个产品候选。来源线索来自 [#728 既有窄实验](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/728#issuecomment-6995304300)，本轮未改写该实验。

运行环境 Node 24.22.1 / Linux / Fengari。这是现行固定运行时加载**经认证的历史 gesture + bindings 对**，不是完整历史游戏快照，也不是官方客户端或产品体验验收。

## 精确来源，不以通过反推正确版本

旧输入由既有 `loadHistoricalBaselineInputs()` 验证完整来源，再由原 `preIntegrationSource(path, source, 'base', {readSource})` 做精确逆向。

| 模块 | 归档输入 SHA-256 | 已认证 base SHA-256 |
| --- | --- | --- |
| abyss_battle_card_gestures.lua | 9941287769dde812c12426f7a3ea47e685d0b5a64c4ee4c534f4d22d649d5536 | 3750e191291bd11d34d7c9b28a83d08d5a6763f17800432a3f85478fab756e0c |
| abyss_battle_card_bindings.lua | add73e13c968039d9eee32dacd3d7d866c21ec6e2ccc89182d4f199d2ee9b7e7 | 0c370951117718e9f2c7247cc6ff4db7836e019d6c59a097e3b9ea9e632cbf8b |

四个现有 runner 前缀及顺序全部保留：historicalCardInputPrelude → frozenBattleHandPrelude → eventCombatRoutePrelude → v25TextureBindingPrelude。唯一实验增量是在旧 gestures preload 后加入同代 bindings preload；没有替换其他生产模块。

既有 frozenBattleHandPrelude 对三片本来就推进真实开局动画 80 帧。它不是本轮为凑绿新增的延迟。原归档 assertion/name body SHA-256 `62b56bbabbe457f0c6480f576cc2f83d34d71e698d354d0a4644820f2a47fa14` 与现行完整支持体是不同对象，分别核实；现行三片及支持体逐字未改。

## 实际结果

最终便携脚本的三个独立进程保持各自原 30,000 ms 预算：

| 片段 | 原范围 | 结果 | 实测 |
| --- | --- | --- | --- |
| card_input_port.lua | 1–6 | 6/6 | 12,632 ms |
| card_input_port_slice_2.lua | 7–10 | 4/4 | 7,754 ms |
| card_input_port_slice_3.lua | 11–12 | 2/2 | 7,159 ms |

12 个原名称、顺序与完整分区精确守恒。`source-manifest.json` 记录原始源码、三片、支持体、四前缀和实际 19 个生成 Lua 输入；所有文本实读与 Git blob 一致，351 个生产 Lua 未改，生成目录没有遮蔽同名生产模块。

### 三种对照必须区分

1. **正式未配对入口**：原 `runLua` 首片 0/6，真实 `Intent=nil`。这是现行 bindings 与旧 gestures API 混用。
2. **精确 pair 但删去既有 settle 前缀**：首片 5/6，原 docking 断言失败。这证明先前遗漏正式前缀的实验不是等价运行，不能据此判断认证 pair 不足。
3. **归档 add73 bindings + 完整 settle**：同样可以 12/12，但它不是声明的 base 0c 来源。因此不能以通过倒推应该采用 add73，也不能把之前 docking/hover 的失败归因于 add73。正式候选应保持精确同代来源。

初期负控探针两次因 matcher 写错而失败，原始失败日志保留；底层实际已经正确拒绝。独审另以精确错误对象/消息验证两 owner 的 host/linked 缺失和漂移共 8 项、恢复 fresh read、CRLF、非目标/cwd 不接管，全部通过。不得把这些探针 matcher 失败说成来源绕过，也不计入通过项。

## 复现与独审

在上述受测提交的独立完整 checkout、锁定依赖及既有 build:data/build:ui 输出上，从仓库根运行本文件夹的便携脚本（证据脚本可放在 checkout 之外）：

```sh
node /path/to/proof.mjs /tmp/card-input-proof paired
```

输出目录必须显式且位于仓库之外。`unpaired` 记录该原版入口的 Intent 红控，`archive-binding-only` 仅用于身份差异诊断，均不代表正式门禁修复。临时生成的 Lua 含本机路径，不入库。

`proof.mjs` SHA-256：`83f029562b2412695d0b3fd945edad9dec025564a97486d9bc03d6f1c0101c38`。
`source-manifest.json` SHA-256：`96faddccadeacea6a73c8bc17e18da4ebe7d0f8ecab49ef4e3b9b2ca57dae9ed`。
独立源探针及其日志另存；探针不重复运行 Lua，保存原本地同树提交身份，跨 checkout 使用时须先核对远端同树关系，不能假定该本地 commit 在远端可达。

后续可在同一隔离任务分支最小修正式历史 helper，并补原 12/12、缺失/漂移和非目标负控；本阶段证据本身不等于正式 runner 已修。PC22 Windows CRLF 投影由另一独立线路处理，#703 启动和官方设备/容量也保持独立。
