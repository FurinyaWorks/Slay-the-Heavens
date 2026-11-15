# TASK-38：小屋 P0 在药水候选后的续接准备

只续接 #678 既有小屋修复，不新增功能、不认领尚未落入基线的 TASK-38.5、不修改根 Backlog 或原 PR 头。实际发布准入仍等待药水真实落地与精确 base 绑定。

## 真实身份

- 已落地 Release S：`1cc5479b713edab6fd26db4e20f8eb22b7401cb2`，tree 与 #692 `b67226945c2be47c8fff31f1362412b973f68875` 相同。
- 显式续接的已提交、尚未合入药水候选：`f564aea6a3c517b71a85534a81be5e2e36278baf`；它不是未来 squash SHA。
- 在 S 上 FF 到 f564，再 `cherry-pick -x` 原 `c6f0e2fcc8067d9ec136c86d359b7de0616fb68b` / `0c0f8586c2a42d62be6caf8e8053344161346c39`，得到 `88f0f65b0c7e18a30d2fb303a16c985e1ddc95b9` / 产品 checkpoint **`5bcbbf9e611900cdf9e787a170f3c2e4702615d8`**。
- 生产包 before=f564、after=5bc；增量只有两小屋 owner，同时绑定三项继承药水来源及五 owner 的实际 last-producer/parents。整个 committed current 指向真实 5bc，未复用旧 272/551 的 whole-current 声明。CI 辅助 after 为独立 capture，`currentTreeCommitted=false`。

两小屋 runtime blob 保持原 0c：`abyss_node_ui_events.lua=25c9e6a6a6cdf25cf8f6921267e5e1c637023cbd`、`abyss_relic_pending_ui.lua=f34cc7afd10903cd6727ad4716d82a1c69f3603c`。原小屋全部 6 文件逐 blob 相同；三药水 owner 保持 f564，未改任何产品 JS/Lua fixture 或原功能断言。

## 最小来源兼容

保留现有药水/bootstrap 全部包、叶、断言、targets 和 owner union；新外层先校验当前实际 source/raw，再进入明确的 f564 before-cottage 历史 view，继而调用原药水/bootstrap 历史链。旧药水生产合同仍在其明确的 551 epoch 验证，未把历史投影当当前。生产 copy 闭包只新增精确的 closeout-helper、小屋 helper 与生产 gzip 三依赖；CI leaf 不进入生产闭包。

现有 Node24 `discoverJs` 与磁盘 Lua 发现实读 **878 JS / 1425 Lua**；f564 历史库存保持 **877 / 1424**。原 96 个 gzip 按真实 smudged 内容、Git/LFS OID 与 size 逐项验证未变。工作流、成本、分片、未知成本、旧冻结预算与负控均不变；新 raw 层验证完整唯一覆盖及真实执行硬超时，forecast 仅诊断。

| 新包 | SHA-256 | 字节 |
| --- | --- | ---: |
| mobile-cottage-source.json.gz | `27b597b8075337988dd0c2dbd55b8ab2502c8c970da67e925b7ae4a70f8416b2` | 26019 |
| mobile-cottage-ci-source.json.gz | `34ebd7153bbd8dada4e0777013857c201cb607c11af376a6a7229032e0741484` | 153292 |

CI 小包包含 15 个完整 before/after source、97 个 archive 身份（96 旧包与新增生产包）；五个 runtime owner 在任何历史投影前验证原始当前字节。

## 本轮有界结果

Node `v24.18.0`，与其他执行者串行；原始日志保留本工作树 `.artifacts/cottage-potion-1116/`：

- `source-first.log` / 同内容 `source-final.log`：delta 与受影响历史入口命名合同 **10/10**，75.35 秒。含生产五 owner 联合校验、缺失/漂移/部分包、当前库存缺失/重复/外来项、copy warm-success 后依赖漂移/删除，以及旧药水/当前 Full38 历史入口。
- `product-once.log`：指定产品目标只跑一次 **3/3**，38.22 秒：药水无 ID Click 26.38 秒；Tiny House default/official 双 profile 5.56/5.96 秒，使用真实 Neow Host 与可读、仅一次奖励合同。
- `verification.json`：真实五 owner producer、原小屋 6 文件 blob、继承药水 3 owner、96 旧包、完整通过名称与库存。
- `git diff --check` 通过。原始生成夹具按现有 build:data/UI 入口准备；没有修改门槛或原测试预算。

未跑 Full/check、旧产品矩阵、GIL、官方导入或设备操作。Owner 已确认设备为 iPhone 14 Pro，本轮候选手机与官方验证仍未完成；离线合同通过不代表自然双幕/手机 AC、正式 CI 或发布通过。
