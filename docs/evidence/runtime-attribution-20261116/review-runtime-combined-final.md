# UNKNOWN/STUN 联合样本最终独立复审

- Review ID: `runtime-attribution-combined-final-ef9d60f-review-runtime-20261116`
- 独立身份：Codex 子代理 `/root/review_runtime`。
- reviewedHeadSha: `ef9d60f237021d3f4cb5fadfc49d6f8f7cd657d4`
- reviewedBaseSha: `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`
- 审查范围：`c56dcd7 → ef9d60f` 的夹具/类别校验、新10run原始证据及结果文档。
- 结论：**PASS（上述范围）**；Critical 0 / Important 0，unresolved=[]。

## 更正与生产复用

c56dcd7的17,270→9,530测量真实，但只覆盖UNKNOWN。**撤回本人旧审查中联合UNKNOWN/STUN覆盖的肯定**，不把旧PASS当联合覆盖证据。`historical-unknown-only.json.gz` 明确标注降级范围，其report与c56原Git对象逐字段相同，并保留旧sampler和supersededReviews。

生产模块 `abyss_monster_intent_particle_view.lua` 在producer befd4808、c56及ef9d的Git blob均为 `99d26566968d77c8d014057bcf436cdc225aa98d`。复用既有缓存语义、失败/重入/清理/重建、弱key无native回指及静态字段不变性结论；本轮未改生产模块，未重复扩展#688/#694/#703。

新battle helper先构造state、执行prepare，之后赋给host并首次refresh。collector.spawn/byrd.stunned因此在Displayed首次createIntent前已选定，修正了旧raw intentIndex变更不能更新displayed副本的问题。实际source effects textureKey计数进入原始MARK，不再依赖配置标签；warmup、particles-300及每个long block要求两类双正、类别总量等于effects且两侧完全相同。

## 本代理实际核验

- 阅读新头delta和文档，核对46个已审输入字节与精确Git提交一致；SHA256在同名JSON的reviewedFiles。
- Python审计10个原始gzip JSON与report内嵌结果逐字段相同，stdout成功、stderr为空。每个run的particles-300实际UNKNOWN=3、TINY_STAR=3，warmup及12长块也均双正；全部类别计数为正整数且sum==effects。
- 两侧allocation原始记录 `abyss_monster_intent_particles:52` 均为7，独立支持真实star构造发生，不只验证标签。
- 全部run为5120更新、20cycles、12长块。每轮和每长块 `live−7×outputs−pages=27578`，disable effects/outputs=0。全部配对core/Run/RNG图、调度、native生灭、存活库存和类别census一致；visual模式所有所测更新的阶段digest一致。
- 重算所有阶段P50/P95、三样本计数确定性、全协议/长块聚合时间及阶段端点内存最大值，均匹配文档。
- 只执行轻量真实数据校验：5对归档数据通过；warmup/particles-300/long-1/long-12双方同时移除任一类并保留effects总数，8个反例全部拒绝；双方伪造类别总数的反例也拒绝。日志 `work/review-runtime-combined-final-audit.log`。
- 未重采样、未运行Full或重复通过的矩阵，未编辑源码、合并、发版或占用窗口。

## 新联合结果与公开边界

| 项目 | 前→后 |
|---|---:|
| 普通300帧native | 4200→4200 |
| UNKNOWN/STUN 300帧native | 30469→14881 |
| 同阶段mock属性写入 | 49912→29128 |
| 同阶段七模块已知表字面量 | 21801→20069 |
| 普通待机P50 ms | 743.8→801.3 |
| 连续出牌P95 ms | 1310.7→1416.4 |

文档公开普通待机/出牌不利时长，不认证全场景提速或无回退。固定敌阵/手牌明确是离线压力夹具；60秒仅为3600帧模拟前台时间。mock字段digest不代替官方原像素，已知table数不代替总分配/GC，Node堆/RSS不代替设备内存。

读取并复用新日志：缺类真实Host RED、合同RED→GREEN 7/7、combined-current 11/11、raw库存2/2、新完整十次采样与syntax。本人没有重跑这些矩阵。旧sourceClosure 62/62、calibration 74/74及相邻44+1/恢复单例证据仍按c56检查点复用，未冒称ef9d新鲜全绿。

完整source corpus/CI历史reader与生产授权仍由provenance独审负责。本PASS不替代其结论或正常PR准入。Hosted Full/合后验收、官方SDK/当前候选/ready、官方像素与人审、手机FPS/温度/持续卡顿/耐热、上层OnUpdate/bridge/GPU/原生portrait driver继续UNVERIFIED；无merge/publish/窗口输入授权。
