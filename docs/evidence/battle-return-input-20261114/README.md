# TASK-76：详情与牌堆输入边界（本地切片）

基线 `9f2f44e4c79789fbcb64a515938765dbc240f830`；独立树 `.worktrees/battle-return-input`，分支 `feat/battle-return-input`。主控通过 Backlog CLI 认领；本树不改任务状态或勾选 AC。

## 两个真实处理器缺陷

1. endTurn 已取得 held/released 权限，打开状态或卡牌详情、关闭详情后，原 touch7 的旧 Up/Click 仍能结束回合。奖励 skip 的旧权限也能跨奖励卡牌详情返回，误关选牌界面。真实 GameUI/Run、原生 mock 控件和生产 handler 的初次结果：battle 0/8、reward 0/4；Click-only 与完整 pointer 关闭分别执行，完整 pointer 使用真实已注册 Down，未伪造监听器。`showStatus`、`openHelp` 通过原有 active/actor 准入后，仅增加两处现有 `cancelActionInputs()` 调用。没有全局清 input、猜测官方焦点 API 或改规则。
2. Defend 拖牌完成后，原 touch7 的尾随 Click 可打开 draw/discard/exhaust 遮罩。独立 reviewer 和本树分别复现；本树原牌堆 0/8。三个 pile 共用的 pointer 绑定现在复用原 `swallowed`、`consumeReleasedDragClick` 和新 Down 服务；同 ID 真正新 Down 可退休原手势身份，关闭详情的那次物理序列不能穿透打开 modal。Controller 继续独立调用原 openPile，不被自己的 pointer echo 屏障误挡。

牌堆 pointer 提取为唯一 local `bindPilePointer`：保持原 M.new CC15，helper CC2、Click CC7、Down CC3。早期直接在构造器增加 if 曾测到 CC16，未作为交付；未放宽门槛或 ratchet。压缩后的服务表只显式保留额外 down/swallowed 两个既有端口。

这两条是离线可复现的具体代码缺陷。**没有用户当时的手机事件轨迹，不能称为原手机偶发输入锁的完整根因或设备问题已修复。** 原任务同候选手机/PC条款和完整跨模态矩阵剩余项仍待验收。本片优先处理实证缺陷，没有重写已交付的15条拖牌或 TASK-107 导航矩阵。

## 验证与敏感性

- 新真实 Host：battle 10、reward 5、piles 14 个场景，覆盖 held/released 权限、具名相同 touch7 新完整操作恢复、Click-only/full-pointer/Controller 关闭、详情显示期间旧动作不执行、拒绝的 reader 请求不消耗合法权限、3牌堆×Up/EndDrag、独立匿名/不同 touch Click-only、Controller 同帧 echo。modal 往返比较完整 Run 状态及 combat/rewards 对象身份，牌堆逐字段比较规则/RNG状态。
- 原始完整 pre-fix details 分别使 battle/reward 正向验收失败，原始完整 pre-fix UI 使 pile 验收失败。三组负控实际在独立新 Lua 进程执行完整原来源，并要求命中指定旧权限/ghost 断言；没有把任意运行错误算成功。
- 原动作所有权 8/8、原牌堆入口4/4、原15条拖牌真实处理器两片7/7与8/8通过。approved enemy details、r2 hand help 与完整历史 epoch 邻接集合44/44通过；最终收紧双 owner 来源闭包后历史42/42再次通过。
- 固定 Luacheck 1.2.0：14 条显式历史告警、无新增；2161 项受治理职责测量通过。架构346模块、1955边通过；本树 Backlog 校验通过。提交后真实增量 ratchet 另按精确 SHA 报告。
- 原30秒单 Lua 文件预算保持。新增14个 pile 场景全文件曾耗26.6秒，因此用有界 registrar 分1–7/8–14两片，验证14条完整注册、每片7条实际执行；没有改断言、用例总数或预算。没有 Full、远程 CI、官方导入、ready、触屏/鼠标实机证据。

新 Node 文件拆分前完整8/8实测墙钟100605.6804ms（其中3组 pre-fix 重放是实际额外成本）；加完整状态断言后正向3/3墙钟54731.9891ms。拆分后两片正向2/2墙钟22759.9042ms，第二片10132.8468ms；各片原输出在附件保留。此为本机测试证据，CI成本未知，没有修改规划权重、超时或 Full 路由。最终文件注册9个 Node 测试，变更后的牌堆两片与其旧源负控单独复验，其余已绿测试不重复整套。最后窄负控首次执行工具的自动批准审查超时、命令未启动；按工具允许仅重试一次后通过，未将审查超时当测试失败。

## 来源边界与探针纠正

四份完整 before/after Lua 各绑定 SHA256/Git blob。历史 adapter 只接受两个明确路径的 exact after 源码；任何一个实际 owner 进入新来源投影时，必须重新验证两个 owner 的完整 after 身份，混合 old/new、污染、缺失均拒绝。旧证明和旧归档保持原文，`proof.current` 仍是历史 corpus；当前生产行为单独执行真实 Host。adapter、四份 fixture 及 runtime 一起绑定在既有 closure manifest，不另造通用来源框架。

新增 while-modal 探针曾错误要求旧 Click 后 info 必须仍在。现有合同允许任意点击 dismiss 详情，实际 turn 不变；按范围判断只纠正测试，保留该行为。原0/8、0/4“关闭之后旧命令不得执行”的时序与断言独立保留；新的显示期间探针仅验证不执行命令/不改资源。

新增 transientCard 邻接也曾误把自动手牌悬浮信息当 modal。9f2 的 closeInfo 明确返回 automaticCard，原 down/swallowed 允许独立动作继续；修正 fixture 为：status modal 首次只关闭、重试打开 pile；自动侧栏则同次独立 click 可打开 pile。没有为探针改生产语义。原失败及所有最终输出收在 `verification-logs.json.gz`。

独立复审在首个本地提交 c253a389 发现来源桥的同次调用读数变换盲点：先验证 after，再读 owner 为 before，可能借旧 hash 通过。后续修复限定本次所有实际采样 pair owner 均为 exact after；若较早 raw owner 为 before、稍后才遇新 continuation，也回查本次先前读数并拒绝。没有跨调用授权缓存。新增 after→before、before→after、通过其他源进入后较早旧 owner 借较晚新 closure 的真实 reader 负控，原闭包合同仍执行。该问题只涉及历史验收适配器，未改变两个生产修复。

## 交接

仅自己分支开发，不动发版、他人工作树或 PR。已知 `abyss_battle_details.lua`、`closeout-source-closure.json`、`copy-integration-source-closure.mjs`、`integration-source-epoch.test.mjs` 与开放 PR661 存在文件持有重叠；后续集成必须重新核对最新来源，不能直接覆盖。用户允许独立评审后正常 push，禁止创建 PR 或集成；本片不自动合并、不发布，不占桌面输入。
