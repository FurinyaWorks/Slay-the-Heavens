# PR699 完整原证据的有界无损存储

原候选 `51f5423660423d479e52cb22dc9f298a62d8dd73` 按真实空库、depth2及Release比较基线 `33d71575` 检出为135,369,522字节，超原128MiB限制1,151,794字节。旧depth1测量不能替代此门禁。自动合并已暂停，门槛、fetch、比较输入及所有物理预算保持。

本归档只覆盖原候选相对基线新增的252个非LFS文档证据gzip。`manifest.json`逐项保留原逻辑路径、gzip大小/SHA256/Git blob、解压大小/SHA256、连续完整payload边界及固定原producer。旧97个helper、生产packet、已有LFS输入及生产、数据、数值和规划floor不动；仅当前外层CI packet追加读取器并重新绑定受影响合同，完整历史views保留。

`receipts.br`保存182个完整原始内容和70个完整原gzip字节；前者通过固定压缩参数与原10字节header复原，后者逐字返回。读取器每次先鲜读并校验完整manifest和压缩payload；恢复结果必须同时符合原gzip SHA256、Git blob和解压内容SHA256。实现不依赖版本字符串来豁免身份检查；任一环境不能恢复原字节则失败，不降级为内容相似。

本地固定Windows Node24.18.0已逐项恢复252/252原gzip、Git blob与内容身份，完整空日志也保留；Linux尚待现有托管门禁实际验证。Node22设计收据与Node24实际验证分别保留，不从相同zlib版本推断Linux成功。

原逻辑路径由 `scripts/release-item-evidence.mjs` 的 `readReleaseItemEvidence(path)` 返回完整原gzip；`releaseItemEvidenceRead(read)`只处理固定252路径，其余原样交给调用方。不会写文件、改变旧receipt schema、跳过断言或增加网络请求。旧Git对象仍从固定producer及原分支历史恢复。

CI来源继续保留两个完整父域及原发现集合，新current只绑定存储读取器与受影响合同。所有公开历史转换在原raw准入中也鲜读完整证据存储；复用reader后的manifest/payload漂移或缺失拒绝，恢复后通过。纯解压计算可复用，输入授权不缓存，返回Buffer由调用方独占。

首次源码存储迁移提交的真实父51f仍包含旧gzip，不能用HEAD估算宣称冷检出通过。后续验证证据提交仍需按真实父与Release比较输入做原128MiB冷检出；不重包、删pack、抬限值或删比较输入。当前文档不是已通过最终冷检出或发版许可的声明。
