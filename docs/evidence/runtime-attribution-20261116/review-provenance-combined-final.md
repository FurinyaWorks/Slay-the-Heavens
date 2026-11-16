# 联合粒子修正后的来源/证据增量独立复审

- reviewId：`runtime-attribution-provenance-combined-final-20261116-ef9d60f-review_provenance`
- 审查者：`/root/review_provenance`，独立于实现/集成代理 `/root`。
- reviewedHeadSha：`ef9d60f237021d3f4cb5fadfc49d6f8f7cd657d4`
- reviewedBaseSha：`1cc5479b713edab6fd26db4e20f8eb22b7401cb2`
- 增量基点：`c56dcd7bbda5ba302ba9f37d11bab2f64a6bc32f`；真实生产producer仍为`befd480817b0f7c875de189863d37e803704ad3a`。
- 结论：**APPROVE_FOR_REQUESTED_RELEASE_PR_SCOPE**；`unresolved: []`。未发现新的 Important 来源/证据问题。

## 标签撤回与新证据

c56实际工作负载只有UNKNOWN，旧17,270→9,530数值仅保留其UNKNOWN-only含义，旧联合UNKNOWN/STUN覆盖结论已撤回。已将`historical-unknown-only.json.gz`中的旧report、input-manifest、三个采样源码与c56逐项对比，并将其嵌入的十份raw对象分别与c56原gzip解压数据比对：全部原样保留；旧独审收据也封存。

新夹具先构造Combat，再于首次host refresh前设置collector.spawn/byrd.stunned，实际effect textureKey计入intentKinds。独立只读核对新十份raw：压力warmup、300帧及每个long块都实际同时含INTENT_UNKNOWN_L与TINY_STAR，census总数等于effects；分配样本原`abyss_monster_intent_particles:52`星形构造计数为7。新300帧native调用30,469→14,881，三counts原始样本及P50/P95摘要一致。所有前后core/类别/frames/资源字段及visual配对hash一致；这仍是Host所测字段证据。

## 实际独立检查

- git HEAD、c56..ef9d diff、17项packet文本LF/SHA256/Gitblob+head/disk比对：packet仅刷新benchmark入口/battle-worker/battle.lua/contract test四行current；所有before、93旧archive、库存不变；CI leaf仅改变固定archivehash。
- 对比351Lua+architecture共352个生产blob至producer/c56/head，校验生产source packet原字节及真实Git对象：352/352不变；before/base与current/producer的commit/root/src/lua tree/blob精确匹配；source packet仍仅单owner。
- 逐项对比既有source授权/epoch/reader/copy及旧StS/integration/calibration测试blob：实现不变；沿用c56独审的raw/historical隔离、fresh授权、缺失/drift失败语义、无CIleaf生产依赖结论。
- 逐项旧archive与base字节hash/LFS oid及size；当前真实目录库存比对：93/93原档保持；raw879JS/1424Lua、历史876/1423未变化。
- 72项证据manifest bytes/hash、554项input-manifest每文件与aggregatefingerprint、10份新raw/report对象比较：全部一致，0缺失/漂移；report和input-manifest的source/changedRuntime/profile/beforeRef一致。
- historical-unknown-only完整对象对比c56 report、manifest、samplerSources及c56十份raw：旧原始数值全部原样封存；明确降为UNKNOWN-only并撤回旧联合标签，保留superseded独审记录。
- 新raw中每个stress/warmup/12long阶段intentKinds逐项检查，census总数与effects核对，配对source/core/visualhash和summary独立计算：10份新run所需阶段均同时含INTENT_UNKNOWN_L/TINY_STAR；source星形构造abyss_monster_intent_particles:52=7；30469→14881及P50/P95等summary与counts原值一致。
- 阅读prepare回调发生于host首次refresh前的源码、类别拒绝合同、实际Host RED及新GREEN日志：配置标签与实际效果分开核实；旧夹具实际未生成两类source的RED和缺类contract RED均保留；新轻量合同7/7、current11/11、raw库存2/2通过日志可追溯。
- 阅读新研究报告与validation、syntax-combined/backlog-combined收据，核对旧source62/calibration74文件与c56原字节相同：旧62/74明确是c56来源机制复用，未声称ef9d重跑整矩阵；新sampler绑定已重新验证；没有Hosted/SDK/手机/发布许可宣称。

## 复用边界

本代理只读检查Git/源码/压缩packet/归档与日志，并使用Python做文件hash、对象对应与摘要计算；没有运行Node、Lua、基准、测试矩阵或Full，没有编辑源码、PR或merge。

新证据目录manifest72/72项bytes/hash、input-manifest554/554文件hash与总fingerprint、新十份raw与report全部核对通过。新的current11/11、raw库存2/2、轻量类合同7/7是主代理本轮执行收据，本代理检查日志而未独立重跑。原source62/62和calibration74/74与c56文件逐字节相同，只在生产源授权/reader/copy/旧断言等blob不变范围内复用；新packet的四项sampler/test current绑定已经重新对精确ef9d验证。没有把旧62/74声称为ef9d全矩阵重跑。

报告明确交代离线构造压力夹具、旧联合标签撤回、n=3、所有不利时长观察及原生/手机测量局限。Hosted Full、官方SDK/画面、手机FPS/温度/持续卡顿、官方容量ready与合后验收仍为UNVERIFIED。#688/#694不重复、#703不动、只Release PR且不合并发布的边界保留。生产行为仍由单独运行时独审覆盖；本收据对来源与证据一致性负责。

精确文件SHA256、日志SHA256、actualChecks与机器可读边界见`work/review-provenance-combined-final.json`；计算明细见`work/review-provenance-combined-audit.json`。结论只覆盖上述精确HEAD。
