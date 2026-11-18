# TASK-38.4：药水弹窗 Click 缺失触点 ID

## 来源与边界

本切片从 Release 药水 PR #679 的 `29b108778c4e98b24f73d98d9a316936408c387c` 建立独立分支 `fix/mobile-potion-click-payload-1115`，不修改原 PR 分支。沿 PR #673 的 TASK-38.4 只读合同及 Owner 明确授权补充 P0；任务尚未进入本基线，不复制任务、不伪造认领或勾选手机 AC。

Owner 已确认手机为 iPhone 14 Pro。本轮仅通过真实 GameUI Host/Fengari 与原生控件回调夹具复现输入协议，不操作设备，不将缺 ID 协议称为手机症状的已证根因。官方候选、导入、ready、手机热区与同候选验收仍 UNVERIFIED。

## RED 与修复合同

基线同一控件收到 `Down{touchId=A}`、`Up{touchId=A}`、`Click{}` 时，Use 能量、Use 火焰、Discard、Dismiss 四条路径全部拒绝；对应具名 Click 四条路径正常。核心库存、能量、瞄准态和下层手牌为 oracle。原严格比较把缺 ID Click 当作具名 foreign，因此菜单无法正常执行。原始八路径探针与失败日志保存在本树 `.artifacts/potion-click-payload/probe.lua`、`red.log`。

现在只允许同控件、同菜单代次、合法 owner、从未发生竞争的唯一已释放触点接纳缺 ID Click。当前菜单的物理活指和未消费竞争 release 都阻止匿名推断；具名 foreign 不借用唯一指针，也不清除他人的具名能力。新具名 Down 重新取得自身相同 ID，未知 Up/Exit/EndDrag 只可退休唯一可归属来源，不能补成合法 release。Controller 拦截清除当前能力。Drag 撤销动作能力但保留物理竞争指针至终止；专项曾实证 Down→Drag→Up→Click 会误提交，修复前 RED 同样保留。

指针记录只属于当前菜单，关闭/重开清空；完成的非动作竞争来源按控件只保留最新一条，不建立跨菜单触点历史。任一按压与其它来源并存时，其匿名资格立即单调撤销；后续 Up 排列、foreign Click、Exit 或有界剪枝不能恢复旧资格。只有新的合法 Down 取得新能力且没有未退休竞争来源时，才可重新接纳匿名 Click；具名旧 A 仍可明确提交。原有槽位、库存表、run/battle/turn、隐藏/viewport 与控制器 guard 保留。

通过已有有限屏障向下层传递两个不同来源：`releasedDragTouch` 保存已验证 release 的具名 ID，`suppressClick.touch` 保存原生 Click 的原 ID（缺失时为 nil）。原事件不被改写；匿名一次歧义尾事件与具名旧触点都不能变成手牌、敌人目标或结束回合操作。无 token 的 click-only 原有一次匿名歧义消费边界保留，新 Down/新具名触点仍可正常操作。

## 验证

专门新增 `tests/lua/potion_popup_click_payload.lua` 及 Node 包装，不继续扩展旧耗时矩阵，不增加超时或修改既有断言。覆盖上述八路径、同/异控件与中性面板竞争、同 ID 新 Down、匿名完整链、未知/foreign 终止、同源/foreign Drag、旧 slot/menu/owner/viewport、Controller、fire aim 与 action 尾事件及 click-only 兼容。

首轮稳定源码 `b6a58165` 的专项通过（27.72 秒，`specialized-final.log`）；原 `approved-main-potions.test.mjs` 六项通过（40.42 秒，`original-contract-final.log`）。`check-engineering.mjs` 通过：351 模块、6181 项测量、1988 架构边，原 CC15 与 Luacheck 基线保持，六条历史警告无新增。`check:guidance`、`verify:backlog` 与 `git diff --check` 通过。

先前源码阶段的专项 24.53 秒与原六项 44.61 秒保留为中间证据，不能代替最终组合。本树保留 `foreign-lookup-red.log`、`drag-red.log` 及修正夹具原生 actor hit 路径、Controller cursor 能力的失败日志，不删除失败或放宽产品规则。精确 HEAD/BASE 的独立审查由协调者另附，不在本文件预填通过。

独审在 `b6a58165` 找到反序 Up 缺口：A Down→B Down→B Up→A Up 会过早剪除 B，匿名 Click 误借 A。修订后的参数化专项先 RED（`competition-monotonic-red.log`），再 GREEN（25.36 秒，`competition-monotonic-green.log`）：Use/Discard 同控件及交叉两种 Up 顺序、竞争 Click 前后、B→C 完成/拖拽竞争剪枝、具名 A 与新 Down 恢复。再补 A 先 release 后 B Down 的负控后，最终专项通过（28.95 秒，`specialized-reviewed-final.log`）。竞争位绑定本次按压，不能通过清理记录重新获得匿名资格。修订静态门槛仍通过（351/6181/1988，`engineering-monotonic.log`），原六项合同通过（32.13 秒，`original-contract-monotonic.log`）；指引、Backlog 和 diff 检查通过，独审另绑定新 HEAD。

未运行本地 Full、未添加 `ci:full`、未创建新 PR；精确提交独审和 Release 合并由协调者处理。
