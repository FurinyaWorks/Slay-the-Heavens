# TASK-38：既有远虑切片在药水候选后的续接准备

只收尾 #685 既有实现。TASK-38.7 在本基线 `task:pick` 仍为 unknown/HOLD，沿未合 #673 只读合同与 Owner 授权，不复制任务、不标 Done、不改根 Backlog 或原 #685 头。

## 精确身份与冻结

- 实际已落地 Release S：`1cc5479b713edab6fd26db4e20f8eb22b7401cb2`。
- 显式 FF 的已提交、尚未合入药水候选：`f564aea6a3c517b71a85534a81be5e2e36278baf`，不是未来 squash SHA。
- 之后 `cherry-pick -x` 原三提交 `8f720cad83bf332ef690cb6a1b6e8c527186994e`、`8932f7de9c284a2ea883037037dab84db9f9216e`、`c20c4148cfdf39492d99973943674db091c29941`，得到真实产品 checkpoint **`c590b6c129a305cf68de15c5c264b0f45e4c7b9b`**，无冲突。
- deck last producer 为 c590，parent `f21ff3d235f798ef78753fa44d316178d383a445`；theme last producer 为 `e4d6096ba352485f9d7ace3bab854d4666500111`，parent f564。二者没有统称同一 producer。

原 c20 全部 5 个变更文件逐 blob 不变，含原 layout JS 与 retained Lua。runtime `abyss_deck_ui.lua=d8ce38b9358dd87a5b5908f24a1a013fa79a5464`；theme `1e435112c894530178f291c07195e00c8d96e455`，保留既有 112×48 确认按钮及 104×40 文字框。继承药水三 runtime 与原 P0 fixtures 保持 f564。

## 最小来源与库存接续

复用现有 projector 与稀疏 packet，生产增量只有 deck runtime，保留继承药水三 owner 及完整旧 targets/owner union。通用 runtime projector 的 config/src 路径 schema 未改；theme 按既有整字节 exact inverse 模式单独绑定完整 before/after、Git blob、producer 与同一真实 checkpoint。未知、null、部分、错误及混合前驱保持可见；主题逆变换每次校验实际 theme 与四 runtime，暖后缺失/漂移不被缓存掩盖。

当前 source/raw 先验证实际 theme 与四 runtime，再进入明确的 f564 pre-forethought 历史 view，继而调用旧药水/bootstrap 链。旧药水生产合同保留其明确 551 epoch；当前 whole-runtime 与 theme 的 committed 身份为真实 c590，辅助 CI capture 为 `currentTreeCommitted=false`，不宣称辅助接线存在于该产品提交。

原 96 个 gzip 按真实 smudged 内容及 Git/LFS OID、size 核对未变，四个原叶未改；copy 闭包只新增实际 closeout-helper、生产 helper、生产包三依赖，不加入 CI leaf。现有 discover 实读 **877 JS / 1425 Lua**：没有新增 JS root，仅改既有 deck-layout JS，新增 retained 根 Lua；f564 历史为 877/1424。完整发现、唯一覆盖、未知成本、分片、旧预算及冻结断言保持；forecast 仅诊断，真实 workflow 硬超时不变。

| 新包 | SHA-256 | 字节 |
| --- | --- | ---: |
| mobile-forethought-source.json.gz | `d8c9875fbc221614d01ed752cc851b7a502e3f9ec09f7aa749c1de3c671277de` | 95774 |
| mobile-forethought-ci-source.json.gz | `4c0fd333e6fbc56a2e34ff0029cc46d5ec8753119ae7e5da5d0633cf0f22f932` | 224972 |

CI 小包只登记 14 个完整 source 与 97 个 archive 身份（96 旧包及新生产包）。

## 本轮有界证据

Node `v24.18.0`，与其他执行者串行，原始日志位于本树 `.artifacts/forethought-potion-1116/`：

- `source-first.log` / 同内容 `source-final.log`：new delta 及受影响旧 P0 历史入口 **9/9**，62.64 秒，覆盖 source/current、theme 错误/混合前驱及 linked 缺失/漂移、partial packet、库存与 warm-success 后 copy 漂移/删除。
- `product-once.log`：原 `deck-ui-layout.test.mjs`（retained Lua 包含一次）及必要药水 Click 交叉 **10/10**，32.86 秒；retained 11.13 秒、药水 21.27 秒。没有另跑 owner/回收/异常大矩阵或底层 Lua 第二遍。
- `verification.json`：五个原文件 blob、继承药水三 owner、runtime/theme 实际 producer、96 旧包、库存与通过名称。`git diff --check` 通过。原生成夹具仅按 build:data/UI 准备，未改产品断言或预算。

没有 Full/check、GIL、官方客户端或设备操作。Owner 确认的 iPhone 14 Pro 同候选实测、自然流程与手机 AC 仍未验。实际准入仍须药水真实落地后绑定实际 base 并独立复审；本附件不授正式 CI 或发布通过。
