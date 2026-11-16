# Item/title/shadow 与已合 selection/map 的真实接续

本次仅接续 CI/测试来源及库存，生产字节仍为真实双父产品组合 `249adac4baec43183e8c81fecda6047656b564c4`。它保留原 Item `68a17f53` 与已合 Release `33d71575`；本地保全 merge `97712afe` 又组合最小空白修复 `16cf4a2e` 与既有 WIP `3f715049`，不丢未验工作或旧日志。原 WIP 的未接线、旧失败及 Backlog CLI 合流记录原样保留，没有本轮 Backlog 状态修改。

原 661568B WIP packet 的完整 Git 字节仍可从 `3f715049:tests/helpers/item-post697-ci-source.json.gz` 恢复，SHA256 `6785f5fb56a5117f88d611319ff0322b0501141e8b231f93fbd24c156bacb40f`。当前新捕获另有明确 current/before 域：Item `16cf4a2e862ccfa0eaed06c5cf11cb8546e6095f`、Release `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`；旧已接受 gzip 不改写。新编码为 179864B，SHA256 `ef77290b978b59f09c8bbe7243fd8f5bc38a62889c770201b83dbc66e3d142c1`；133 个完整 UTF8 atom 中112个仅引用六条固定旧 archive 的精确字段，其余为字面值。每个压缩 archive、解码文本 SHA256、Git blob、字段键/域、引用存在性和无闲置 atom 均严格校验；不是任意路径或通用存储框架。

每次实际 current→历史转换前，原始同一 reader 重新认证77条当前文本、102条不可变 archive 和352条生产 Git 身份，无授权缓存。生产投影器保留完整352文件/68 target，CI public source adapter 不代替生产授权。补齐了 WIP 漏列的实际父域输入（包括 docs/legal/assets），源/read/inventory 消费者显式接续。bootstrap inventory 原先偷用默认 FS 的缺口已真实 RED 后修复为同一显式 reader。

原两侧来源负控作为明确命名的 immutable parent checkpoint fixture 保留，完整原断言和 missing/null/drift 回调仍在；新的独立 rawFS 合同检查当前完整库存、生产 union 及公共适配器。五个 reader wrapper 在 warm 回归中只构造一次，每次注入或恢复均复用同一闭包。未知、已历史、外来字节保持透传；实际当前转换不借用旧授权。

## 本轮验证边界

均为 Linux/Node24.18.0 本地验证，不冒称 Hosted 或设备验收。

- 前一冻结候选：来源/codec/双历史/隔离拷贝52/52；完整 calibration76/76（735549.394502ms，其中既有 Golden Idol 完整 workload491697.877401ms）；实际 raw Full 独占覆盖及79861/22235原 floor、18/15分片、45/30/local75执行硬限保持。预测仍仅诊断。
- 随后仅改两处：null 读取显式给出目标路径，以及五个 reader 闭包 hoist；重新捕获外层 packet。最终冻结内容的定向17/17通过，包括 decoder/atom 负控、当前完整身份、12个 public source/read/inventory 适配器的108次 missing/null/drift及逐次恢复，以及原 StS null 库存负控。没有把先前整套结果泛称为最终 HEAD 全量通过。
- 产品 union 的8个不同测试均有通过证据：首次批量7通过/1原30秒 Host timeout保留；协调安静窗口后同源码、同30秒硬限一次重试1/1通过（12289.806259ms，OFFICIAL_MAP_RETURN_PASS3）。窗口中仅另有一个 calibration CPU child，4CPU配额，其余执行/pack/compression暂停。未改 timeout 或断言。

所有日志完整 gzip 与压缩/解压 SHA 见 [manifest](log-manifest.json)。`capture-current.py` 为离线再现配方，需要完整历史和精确旧 archive，不在 CI 执行；其捕获仍明确 `currentTreeCommitted:false`，不伪造尚不存在的 commit。

Hosted Required、正常实际合并、正式候选/官方 ready、PC/手机及官方容量仍独立未验；旧 NO_GO 不因本地来源通过而取消。最终精确 commit 的冷 pack 与空白核验由交付记录另列，不复用旧产品 checkpoint 的容量读数。
