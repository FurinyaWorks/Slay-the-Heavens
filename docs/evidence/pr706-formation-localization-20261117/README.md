# #706 Formation 2 GiB 精确用例定位

基线 9035ef78，加已交付 Defect 复用两文件（对应远端3f9de287）；未接当前Release，未移动PR，未修改任何原测试、生产、共享runtime、归档或堆限制。两份LFS由此前已验证原始字节恢复。无Backlog CLI，沿既有706交接，不假称新认领。

显式 `node --max-old-space-size=2048 --test --test-name-pattern=... tests/encounter-formation-source-epoch.test.mjs`：
- `outer metadata preserves` 原用例完整1/1 PASS，14.044秒；包括5种metadata破坏负控。
- `isolated authenticated helper closure` 原用例OOM，23.133秒；因此无需反复跑整份文件定位。
- Room builder immutable reuse + authenticated copy的最小试验仍OOM，22.331秒，已撤。
- 临时诊断preload仅记录JSON.stringify遇到proof时的heapUsed与调用栈；原输入/返回值不改。第二次隔离导入在 `extendRelicEquipEpoch`→runtime:88 整proof复制附近触顶，进入时heapUsed=1,779,760,048字节。日志是分配位置证据，不证明Relic是唯一根因，也不是性能对照。
- Relic builder同型immutable reuse + authenticated copy试验仍OOM，22.767秒，已撤。两项试验源码均未保留进候选。

当前没有新增修复。保留失败日志和trace脚本用于原共享来源owner接续；不要继续只在最后一个触顶builder逐层盲改，也不要扩大old-space或删完整隔离断言冒充通过。Formation完整、Hosted、官方/设备仍未通过或未验。
