# 小屋 P0 在药水 regression 后的最小准备

实际 Release 为 `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`；显式 FF 尚未合入的药水 `89dfc774b1c6bb146b91e6064039f4d648db0d33`，再 `cherry-pick -x` 原 c6f0e2fc/0c0f8586，形成真实产品 checkpoint **`89f3d88c47b72d843db113be5a2e91896cf1f869`**。不是未来 squash 身份；原 #678/df1 未修改。TASK-38.5 仍为只读 #673 合同及 intake HOLD，不复制认领或勾手机 AC。

原小屋六个产品文件逐 Git blob 与 0c/已审 df1 相同；两 runtime 仍为 `25c9e6a6a6cdf25cf8f6921267e5e1c637023cbd` / `f34cc7afd10903cd6727ad4716d82a1c69f3603c`，继承三药水 owner 等于 89df。因此按 Owner 授权复用 df1 的产品 3/3 与独审，不重复 Tiny 双档、药水或产品矩阵。规则、平衡、RNG、主题及其它运行输入未改。

小屋生产增量 before=89df、after=89f3，记录五 owner 的真实 producer/parents；whole-current 指向已提交 89f3，辅助 CI capture=false。新 current 原始认证之后，明确进入 before-cottage 89df，再进入原 regression whole-567 及 551 历史层；采用外层增量接线，不以旧 df1 整文件覆盖 global helpers 或借旧 whole-current。98 个旧 gzip 与六个既有 helper 叶逐字/实际 OID 验证保留；copy 只增加所需三依赖，CI leaf 不进入生产闭包。

实际 discover 为 **878 JS / 1425 Lua**。CI 稀疏包登记 18 个完整 source、99 archive 身份（98 旧包和新生产包）。sts-style 的实际 raw 入口先验证当前全部发现及新增 source 缺失/漂移，再精确映射到 89df 的 877/1424，保留其原 877→876/1423 严格层、断言和负控。成本、未知成本、分片、预算、workflow 均未改，forecast 仅诊断。

本轮 Node24 定向证据在 `.artifacts/cottage-regression-1116/`：

- `source-final.log`：新增小屋五项及旧 regression 两项 **7/7**（27.66 秒）。之后仅新增实际 sts-style 入口接线及对应完整 CI binding，`inventory-entry.log` 该命名 **1/1**（8.82 秒），同时认证最新全部 source；未重复其它七项。
- `owners-red.log`：两个实际 current-owner 命名在 5dab 的 117 硬断言 RED。`owners-green.log` 两命名 **2/2**（30.46 秒）：明确保留 preMobile116→preCottage117，再验证 current118=preCottage117+pending_ui，标题更新118；原逐 owner 暖后 missing/drift、读取顺序、LF/CRLF 与 foreign 负控完整保留。只补两份 before89/after CI source；产品 checkpoint、旧包及六叶不变，未重跑原 7+1。
- `verification.json`：原六产品 blob、继承三 owner、五 producer、98 包/六叶、真实库存、精确通过名称与旧 3/3 证据哈希。
- `source-first.log` 保留首次 import 环境失败：LFS_SKIP_SMUDGE 留下两个旧合同 pointer。仅从 F 本地对象按 OID/size 恢复必要合同，见 `contract-materialization.json`；不算产品 RED，未 smudge 媒体。旧包身份未改。

本轮没有 Full/check、产品重测、GIL、官方客户端或设备操作。手机/自然流程 AC 未完成；正式准入仍需药水真实落地后的实际 base 绑定及独立复审。
