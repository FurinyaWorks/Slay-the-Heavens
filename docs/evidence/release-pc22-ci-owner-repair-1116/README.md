# PR #698：CI owner 合同修复

基于 be91df3a7b192827f5ede3937c50fb5f18e9afcb，目标仍为 release/v2.0.0。产品 CardFlow 及原 PC22 修复未变。

旧测试将当前名单写死为 116，原两项定向复现为 0/2；当前真实名单为 117，仅增加既有路径 abyss_card_flow.lua 的变更身份。保留原 116 历史函数体与全部循环，并新增真实磁盘 117 合同。修后四项 4/4 pass；受影响 CI/source 小合同 5/5 pass，均 0 skip，没有重跑 Full。

最外 CI 包 d65e6170e254f376ca425035e489e89aedbedbd67d1585b1bd8bc611c991c610；20→22 输入、96→97 档案。原 313d 包完整归档，旧 before 与 19 个旧 after 不变。新 after 明确为未提交工作树采集，旧 producer 仅为历史身份。

独立复审 /root/pc695_ci_fixture_repair：15 项只读检查 PASS，无 blocking；精确文件 hash 见 pc22-independent-review.json。原 RED、GREEN、执行参数和 hash 均随附；首次沙盒 Node 启动失败保留在本地 pc22-two-cases.receipt.json，不计为用例结果。

本轮不是 PC/手机实机、官方导入/ready 或容量验收。TASK-29.1 保持 In Progress，原 AC 不改。CI 需由新提交正常运行，旧运行的排队或局部成功不能视为准入。

执行输出以 `.log.json` 的 base64 字段保存原字节，避免忽略规则和文本换行转换；解码后以内部 sha256/byteLength 对照执行 receipt。
