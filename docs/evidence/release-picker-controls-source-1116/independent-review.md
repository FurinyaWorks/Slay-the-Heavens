# 分页切片来源独立增审

结论 **PASS / SOURCE_CI_SCOPE**，findings/unresolved为空。精确HEAD `9ff8c89f707e7f6882711f9929a1210574a960d7`（tree `4a1c73d7601532874f2cf2b83aa4b6812659bed5`），base `707da8ff6a7658afe353eb8a48bbf1139023a706`（tree `3036446cde57c6de5706592ced55f074d8cf06a6`），原Release前驱 `36b9b157`。未参与source实施，原产品评审原文保留。

13个执行/测试路径与10份证据路径全部覆盖。独立逐项核实352个Release前驱、116个owner、64个旧目标完整保留；current仍352/116，仅feedback实际变化，producer为a925且父36b9。生产packet8846606f、CIpacket550daa97固定；20项CI当前/前驱绑定逐项比对真实Git。旧92份档案全部实字节一致，其中90份Git物理gzip、2份LFS按oid/size核验；新增生产packet另有固定pin，不替换旧档案。7个产品/test blob与707da8ff相同。

独立小探针通过：source历史投影每次新读116owner；改owner、伪前驱、CIhelper/support漂移、缺失/重复/外来库存及删除全部新增均拒绝；未知字节不投影，普通CI投影不授权生产。真实隔离copy可加载完整sourceEpoch，包含新生产adapter/packet且不导入CI leaf；改adapter或删packet均拒绝。CI trust leaf在自身packet外，以精确审查源和固定packet hash构成信任入口，未掩饰working-tree采集元数据。

单项raw合同独立重跑1/1通过：878JS（旧876+产品test+source test）/1423Lua完整唯一覆盖，两个新增JS保留10000ms未知成本下限。预测Windows1,756,639ms、POSIX1,190,964ms及60秒预留仅作诊断，符合docs/CI.md Owner约定；Fast45/30、Windows Full托管45/可信本地75、POSIX Full30分钟实际job硬限和dispatch/ref路由均核实，5组独立负控拒绝。原历史库存、成本和预算断言仍保留。

作者source6/6、owner/copy7/7、历史5/5（原approved-page子回放6/6）及失败日志均查阅，日志8组gzip/raw hash验证通过。原assert未跳过；历史读取只在当前来源认证后恢复原完整来源，当前raw合同另外硬验。独立探针首轮自身CRLF替换错误已留日志，修正探针后通过，没有修改产品或adapter。

工作树clean，base..HEAD diff-check通过，无生产/data/config/workflow改动。未重复产品、Fast、73项或Full。#692在此checkpoint未合；实际Release base变化后须重新绑定精确before并复审，不能套用其他切片after。Hosted Full、正式candidate/ready、容量、PC/实体手机仍未验。

详见 [JSON](review-picker-source.json)、[独立探针](review-picker-source-probes.json)、[raw日志](review-picker-source-raw.log)。
