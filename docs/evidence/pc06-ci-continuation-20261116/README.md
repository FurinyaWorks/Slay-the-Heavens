# PC06 最小 CI 来源接续

从冻结产品`21d48c4e41d0f2879acd4824a60e251c739433e8`独立接续；实际Release base为#692合入后的`1cc5479b713edab6fd26db4e20f8eb22b7401cb2`，其parent为36b9。产品独审限定PASS保留在gzip，原始JSON SHA为d63b0ba7edc9ca95542082944dc4742e66f261ddbec02d5f219afa6d70d4a986。

仅四个执行路径：新CI leaf/packet、既有integrated-CI helper与cases。新packet恰有四条：两个冻结产品blob及两个本层接线文件。生成器只做新鲜身份认证，不作为旧CI proof未登记路径投影；三个已登记接缝只将精确新字节还原为实际1cc before。未知/改动/Buffer/错误前驱都保持可见。当前完整guard先验证真实after与93份档案，再将精确旧输入交给原bootstrap和完整current断言；没有放宽旧assert或改旧packet。

868f4e71…bootstrap packet与helper完整原字节保留，其10条current view逐项对应实际1cc Git证明。原92归档不动：90份Git gzip字节与2份LFS oid/size/payload完全核对；本层另外固定bootstrap packet自身，因此共93个档案pin（91个Git gzip+2个LFS）。原before/current及全部历史视图不重写。

现有3个来源/bootstrap合同与新增3个CI负控共6/6通过。新鲜4输入的missing/drift/Buffer、foreign/path/错误before、逐档案/保留叶子漂移、leaf截断/删记录均拒绝。原生产copy机制未改，真实隔离复制能加载完整352路径/116owner来源，与当前proof深等；副本没有新CI leaf/packet，变更副本runtime helper或删原packet均失败。

原产品source失败完整保留：3项中1失败2通过，旧guard拒绝冻结产品测试的新hash。接续首轮5/6的失败也保留：新增负控误将非目标Buffer拼成字符串，导致更早档案校验失败；已只修夹具，未弱化任何guard。原3项case源码去除新增测试/import与精确旧视图接线后，与实际1cc原文件逐字节相等。

原raw库存仍876 JS / 1423 Lua，完整唯一集合及既有missing/duplicate/foreign负控保留，没有新增raw父文件。既有unknown10s、timing、partition、workflow和预算不变，预测仅诊断。未重跑3+7产品、Host、Fast/Full、全CI校准或设备；source通过不代表PC06色调、继承几何或官方验收完成。未改冻结2产品blob、Lua/productionepoch/Theme或Backlog，无push/PR。
