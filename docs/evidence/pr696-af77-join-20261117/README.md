# #696 / #707 当前 Release 合流 WIP

父提交：准备线 af3ddb2eef8969959454c432cb2743288917a086；实际 Release af77fb2461c548f0faf104761d107397f75dca08（#707）。仅保存未就绪合流，不提升原 PR，不合并，不代表质量准入。

五处文本冲突已经语义处理：保留 picker 的生产历史视图、card-contact historicalRead、StS driftCurrent/sourceFailureAt；保留 #707 的 beforePreflightSource、preflightPriorRead 和 assertCapacityPreflightCurrent 入口及新增 selection/preflight 断言。独立复审发现 contact 两处 rawReadFileSync 未定义，已改用实际 diskReadFileSync。五个文件 node --check 通过。

本轮唯一具名测试：`node --test --test-name-pattern='^B9 capacity CI join binds' tests/release-selection-map-source.test.mjs`，1项失败，0通过/取消/跳过，2145.057ms。真实失败是 capacity/preflight 对合流 selection 测试的 current SHA 不匹配：实际 36d449cf2283148e6ceb1e0b9c3039d0dfa38553bc40dabddeca327b5daa8cc2，旧 expected 312409e2805093ad2e5f627827be3d6f5f8cbc138d582be6ff203e2a44deed27。原日志完整保留。此后仅修正上述未定义 reader 与保留 preflight 入口，未再执行消费者；不拼接为全绿。

剩余阻塞：五个冲突全部被 picker-capacity 的82行 current 合同约束，integrated helper、contact、selection 又被 #707 capacity/preflight 的11行合同约束。既有包无合流 current 到双方父视图的映射。下一步复用现有精确全源双父机制，补最窄 continuation，再对双方授权链、同raw暖漂移、foreign/Buffer及具名消费者做针对性验证。不得改旧包/hash、删除断言、把旧 reader 冒充 raw current。

独立评审：/root/integration_1315/review_binary，仅同意保存明确未就绪 WIP；不认可 PR readiness。未跑 Full 或发起 CI，未改正式 Release/原 PR。两份本地 LFS 物化档案的 Git 指针不修改。
