# 导航来源/CI 最终独审

**CODE_PASS_SCOPED**，无未解决项。

- Base：`a9425afa50e2a1dd10e83634a3e5fc0d24633917`
- Head：`1e7c1c526de68557522e237405acb6f6bf15a285`
- Tree：`142fad3243ec5208090eab5ad8d65e8ca7e0145e`

初审完整12路径与原始REQUEST_CHANGES保存于 `review-navigation-source.json/md`；102→196仅docs证据；196→1e7的3路径修正独审保存于 `review-navigation-current-target.json/md`。唯一发现NAVSRC-1已修：新增raw current明确硬断言原target，原guard与全部历史断言保留。

独立检查覆盖23CI完整绑定、3Lua producer/parents、116前驱owner/352来源/64targets、92旧归档与两个LFS OID；fail-closed owner/库存/真实隔离改删负例通过。修正packet仅1份test after及明确fix元数据变化，其余22项、全部before/两库存/93immutable记录不变，旧7ad原gzip另存且逐byte一致。新after Git blob为 `f8a375450c3b782e774867c774bcea9ae1706478`。

真实当前callback重新计算879JS/1424Lua：Win1757923<1800000ms、POSIX1191630<1200000ms。分别给各平台真实shard loads加60000ms，超target但低于guard，原callback接受、修正callback在target处拒绝。初审独立7/7及10组probes保留；修正作者4/4日志hash已核验。未重跑73/44/产品。

仅来源与CI合同通过。产品code由另一个独审覆盖；Hosted Full、官方候选/导入/ready/容量、PC/手机未由本审查验收，不授予Release准入。两个独立Release36 packet不得用于未来#684重叠组合而跳过重新绑定。
