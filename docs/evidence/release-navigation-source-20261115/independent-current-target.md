# 导航 当前预测目标修正：增量独审

**CODE_PASS_SCOPED**，无未解决项。

- Base：`196de2e19a802cae93746c0fa6fc8d13f637273f`
- Head：`1e7c1c526de68557522e237405acb6f6bf15a285`
- Tree：`142fad3243ec5208090eab5ad8d65e8ca7e0145e`

完整读本次3路径delta。可执行变化仅增加 `forecast<target` 一行、更新该完整测试after和CI trustleaf摘要。原target1800000/1200000ms及guard2700000/1800000ms均硬断言，历史原断言不变。

Packet除该after与明确checkpoint/role外逐字段deepEqual；其余22输入、全部before、两套库存、93个immutable记录均保持，物理档案hash与Git字节不变。旧packet另存的gzip与base Git对象逐byte一致。新after文本/SHA256/Git blob核对精确head。

当前完整来源绑定通过；去掉target断言的旧源码被当前绑定拒绝。直接执行真实当前raw callback并复用真实shard/Lua计算：

- win32: raw 879 JS / 1424 Lua; forecast 1757923ms; target 1800000ms; overrun 0ms; unchanged execution guard 2700000ms; not hosted completion
- linux: raw 879 JS / 1424 Lua; forecast 1191630ms; target 1200000ms; overrun 0ms; unchanged execution guard 1800000ms; not hosted completion

独立敏感性负例：分别给Windows/Linux实际shard loads加60000ms，保持低于原guard；旧callback接受，修正callback均在performance target断言处拒绝。作者4/4证据gzip/raw hash亦核验。未重跑73/44/产品。

Hosted Full、官方候选/ready/容量与PC/手机均未评估；本结论不授Release准入。原导航初REQUEST_CHANGES原文保留。

## 覆盖路径

- `tests/ci-complete-calibration.test.mjs`
- `tests/helpers/release-navigation-ci-source.json.gz`
- `tests/helpers/release-navigation-ci-source.mjs`
