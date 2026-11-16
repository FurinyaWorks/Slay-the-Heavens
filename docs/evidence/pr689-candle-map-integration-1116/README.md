# PR689 接续已合地图修复

原蓝蜡烛 HEAD `aad672ac4e84741825596ecb034464d16daf49d8` 与实际 Release `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9` 正常双父合流，保留共享奖励图案及地图返回/选角修复。相对 Release 的产品仍仅原奖励装配与一个 reward-layout owner，无新素材、registry或输入所有权。

五处来源冲突按两个共同前驱的完整 standalone epoch 合流，保留352项生产、116 owner、68 target及两个原 reviewed 全集；全部旧packet/producer/归档保留。新联合CI先认证raw当前，普通reader不投影生产，历史生产reader仍先认证全部当前owner。

当前881 JS / 1424 Lua为两份原完整库存并集加新联合合同。蓝蜡烛独有原 `reward_relic_shared_art.lua`，地图视图新增量明确断言为这一项，不误用“双方Lua相同”的其他切片前提。原两个blue-candle特殊来源用例及破包/foreign/缺失/漂移/类型检查完整保留。

初次6项定向4通过2失败，修正新测试中的未定义变量和Lua额外项假设后，完整校准/cases/联合/地图来源/菜单共99项中96项通过；其余三项因新隔离树未生成data/目录而失败。物化原OID图片并生成本树data/UI后，只补跑三项菜单Host与奖励图案，4/4通过；地图真实Host两项此前通过。各轮原始日志保留，不将多轮结果冒充一次全绿。

未放宽原33分片、预算、45/30分钟执行守卫或业务断言。新HEAD Hosted Required、合后验证、官方导入/ready、容量与PC/实体手机仍待独立验收。
