# develop 中高优先级架构治理计划

用户于2026-11-18明确要求修复中高优先级架构问题、Backlog完整管理，仅进入develop且不影响本次发版；随后授权自行灵活处理、无需等待方案确认。本计划由Codex据当前源码审计制定，不代表用户逐项选择具体实现。

基线：c2409ad750c15124b7b843c6bbfa5b222537cb75，351 Lua模块，6165/6165测量，完整依赖SCC 67/11/2，CC>30为31处、>15为206。复用TASK-74.19/74.20，已完成切片不重做。旧M7只按产品阻塞开工的默认限制由本轮明确授权覆盖。

## 方案与边界

采用真实职责叶层与显式host能力：事务/队列/状态提交仍归Run/Combat，领域策略不回导宿主，Power成员展示与调度单向分层。直接require、延迟require均纳入同一AST图，禁止动态加载、白名单、全局注册或只隐藏依赖。内部命令必要时增加显式host参数，完整迁移生产与测试调用点；保留返回、失败、随机流、事件顺序、表别名和原动态方法读取时机。相比继续延迟导入，此方案真正消环；相比重写战斗引擎，保留现有规则与测试证据。

复杂度按职责拆分顺序验证、projection、handler和生命周期步骤；所有新增helper CC<=15。不以数字直接将所有206处都算中高；本轮31处>30及循环所有权关键函数按独立审计列为范围，低风险其余项保留透明报告。历史完整来源、oracle、断言和预算保留，发生源码变化时只加精确可拒漂移的适配，不刷新历史hash。

## 执行与验收

- [x] Power两模块环：提取成员展示叶，保留共享公开表和动态remove；冷加载/Guardian/copy-on-write与完整图无环。
- [x] Run十一模块环：显式永久命令能力贯穿遗物/奖励/商店；完整生产调用迁移、错误/嵌套事务/别名/RNG回滚与无环。
- [x] Combat/Actor大环：按完整图反馈切口逐片分层，保留原状态owner；全源含延迟图最终无环，新增反向边失败。
- [x] UI生命周期：Portraits、Choice、MapUI、DeckUI、TreasureUI、MatchEventUI热点；保留alive/token/generation/reentry/输入和布局。
- [x] 严格准入与事件：Map、EndingHistory、TreasureSource、Wheel/Winding/Act2/Act3事件；保持短路拒绝优先级、错误与事务。
- [x] 数据/中央展示/反馈：CharacterProfiles/Presentation/Select、WarriorStatus/WatcherFlow、OriginalV4Display、Colorless、PotionText、Feedback；文本/卡池顺序/别名及回调时序保持。
- [ ] 每片先红后绿的架构或绝对复杂度检查及实际行为回归；组合全量工程、来源合同、完整check，独立深审，精确HEAD/base正常develop交付。未取得Hosted/合后/设备证据不填完成。

## 审查重点

畸形输入原先false的短路不能变throw；动态函数替换不可提前缓存；nested transaction失败须毒化外层；UI setter重入不能复活失效owner；冻结历史源码和旧epoch不得被新接口污染。各实现者独占源码范围，共享配置、来源适配、报告和Backlog由主控串行处理。release/v2.0.0与master引用保持原值，不发版。
