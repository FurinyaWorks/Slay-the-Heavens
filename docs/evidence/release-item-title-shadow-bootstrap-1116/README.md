# Item / title / shadow：实际 Release bootstrap 合流

代码 `f26e74625944168acf64cb71f62f91a80ff82675`，tree `e80a736a3a0705b8b08252138e066a6671f94f26`，真实 merge parents 为 `7e33dbf2b536061e917c9e992ec4fa5109a8cbda` 与 `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`。合流前 backup ref `backup/item-title-shadow-before-bootstrap-1116-7e33dbf2` 已读回；不 rebase、不带 develop。此为作者验证，等待另一位独立复审。

先解决三处语法冲突并保留双方所有旧合同，真实 Source/CI 首轮 9 项中 6 PASS / 3 FAIL（status1）；旧 item/current 与 bootstrap/current 均正确拒绝新的合流来源。原完整 stdout/stderr、命令、输入 SHA 保存在 merge-source-before 文件。随后只加本片最外层精确组合证明，旧 packet/leaf 不改。

新 packet `dabab7788653b45eff7f570f2ab2ae3797b40e1d91a5fe9ea0a54d0354a45be8`（1109032 B）固定55个实际after；item视图逐Git7e33、Release视图逐Git1cc，并分别与原47及868f中10个current逐对象相等。还保留实际Release全部10个变更Git视图；Backlog只是历史归档，不作活跃执行读数。1cc与36的全部352源码Git blob相同，因此不推进生产epoch，也不修改df5、c344或e2eb产品行为/producer。旧93档案加两份CI gz共95项原字节保持。

合流后作者小合同：Source/CI11/11 PASS（原item6、原integration/copy/bootstrap3、两项新组合合同）；两个库存/工作流Source合同2/2 PASS。后者只读来源和计算分片，不执行任何Lua或实际raw Full。item当前881JS/1424Lua与bootstrap原876JS/1423Lua均由独立明确视图完整验证；预测仅诊断。原shadow22,235ms与retirement79,861ms floor、原测量/receipt、worker/45/30/local75及Fast45/30硬限均不动。

旧58输入逐review checkpoint及7e33保留：54项当前原字节、4项仅CI适配变化，完整旧视图仍存于组合包；原58表继续仅覆盖其旧checkpoint，不外推本次新代码。27份root notes/38表/33诊断归档相关路径与20条既有运行产品路径逐字节保全，详见preservation.json。未修改root的反馈状态或Backlog；task81.2只继承实际Release已提交的内容。

当前代码与55after均已按Git读回。没有重复产品/Host、真正raw Full、Fast/Full/73、22s/80s成本测量、Hosted或官方客户端。源码通过不代表设备/容量/发布许可；独立复审仍由其他执行者完成。

## 独立准入与最终台账

[实际1cc独立增审](independent-review.md)限定PASS，全部55current/90非空视图、352base、95档案、54旧blob/4新CI行及20runtime/27rootnotes/38台账/33诊断归档保全；原11/11和raw2/2没有重跑，22s阴影/80sretirement亦未重复。独立探针错误regex首次被更早fresh guard正确拒绝的日志完整保留，只修probe不改实现。当前Source通过不是Hosted Full/正式设备或容量通过。根本轮全38接续表现已改为actual1cc并登记新正常PR695/696/697/698和并行Draft694；所有产品/执行输入仍与代码评审检查点60cfd相同。
