# 手牌/坐标合流的 CI 后继接续

输入为已审完整组合 e3ba2c96bb5f57959b24b817a5df7b325cfa1afb 与 #688 的 4d40bdac703c80e51054d551f1512ff02fc0adbc..1508139e1918af4eeb455e4124241fd927c896b2 六文件后继。远端后续 89763fecca7facf13c34ba53d7eff9e0359d5146 仅4份诊断证据，原样保全；没有覆盖两原PR。

机械应用成功不等于可用：本轮原 union 入口 2 PASS/1 FAIL，准确拒绝更改后的geometry测试来源。补充完整 before/current 后继包，旧组合包、两侧全部历史视图、生产352输入及原断言不改。当前记录保持未提交捕获，不把旧productCommit冒充新测试提交。新packet与#688的reader repair都逐次fresh认证，原raw库存不变。

验证：原union3/3、独立评审53项Git身份/EOL/Buffer/缺失空漂移恢复、顶层assertIntegratedCurrent、guidance、Backlog通过。独审另跑union3/3，与实施者有一次重复（如实记录），未跑Full。独审发现合法null历史view处理问题，已过滤null但要求before/current非空，同时核schema和完整view域键。

最初环境为稀疏检出，两个原LFS来源包及official资产未物化；从对应Git目录及逐SHA验证的现有原件恢复后才验证，不提交这些原件的工作树差异。正式来源包的原Git对象未改。

证据是本地精确组合与来源验证，非Hosted Required、实际Release合入、官方导入、手机性能或容量验收。当前两原PR仍需正常准入；新真实基线变化须重验。

恢复精确资产后，原 geometry 完整文件 3/3 PASS、0skip（含原隔离、真实raw入口与其他工作区同名负控），14.93秒。
