# TASK-30 目标点击缺触点 ID 的窄兼容

本切片基于 `release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`，对应 #673 的 M03/任务追加 AC16 只读合同。原 TASK-30 已为 In Progress，本轮只经 Backlog CLI 追加计划与证据，不重新认领、不复制未合入 AC、不修改历史已勾项。Owner 已确认设备是 iPhone 14 Pro；尚无本次手机原始事件轨迹，不能把下述离线根因认作该手机实测的确定根因。

## RED 与定位

真实 Host/Run 中选中 Strike，敌人 Down/Up 都带同一 touchId，但 Click 为 `{}` 或 nil 时，目标预览正常、能量仍为 3，指令没有提交。1/2/3 敌均复现；原带 ID 的 Down→Click、Down→Up→Click、同触点重用、预览刷新及旧选牌/忙碌拒绝正常。原实现严格比较 Click 的 touchId 与 token，因此无法识别此类混合载荷。

首次三敌探针含 Strike/Defend，洗牌后 card1 是合法 Defend，不能产生目标牌预览；这一部分是夹具误判，原失败记录保留。固定仅一张 Strike 后为 8 PASS / 3 RED，三项 RED 均是 Click 缺 ID。新增正向回归在保留的未改运行时基线树中也于实际扣费/伤害断言失败。

#672 对相关输入只清取消后的 notice，未改变目标输入绑定，故不重复该修复；在途敌人几何性能切片也不覆盖本次触点归属。

## 修复边界

- 只让已 Up、无其他 active/held/released、属于当前明确目标牌的唯一 token 接受匿名 Click。普通带 ID 路径继续支持 Down→Click，不开放 busy、手柄或旧身份的指令。
- 同控件多指或其它控件并发会撤销匿名资格；CursorExit/Drag/EndDrag、旧 UID/epoch/actor/turn/run/battle、忙碌或手柄阻挡都不能借匿名回调提交。
- 匹配的匿名 release 在重验前消费，阻挡恢复和原生 setter 重入不能重放。药水 aim 与无目标牌不获得新后备，原命名点击语义保留。
- 新增的 active 仅为当前输入记账。完整自查复现了 resize 缺 Up 后遗留 active 的恢复 RED；经 Owner 批准，只在既有 `battle_details.resize` 与 `cancelControllerPointers` 退役路径清空，退役对象也回收。普通已匹配 Click 本身会退新增记账，支持无 Up 的旧命名宿主随后使用新匿名指针。
- 没有改动 #679 的药水 Down 屏障/reclaim 区域。主线程仍须对两分支组合做交互验证，不把本分支单独通过当作组合通过。

## 本轮验证

| 入口 | 结果 / 界限 |
| --- | --- |
| `node --test tests/target-anonymous-click.test.mjs` | 最终 3/3 JS 入口，含 6 正向、4 归属、6 上下文组；上下文另含七种身份/屏障变化及 resize/controller/cover/hide 参数矩阵 |
| `battle_ui_click_ownership.lua` | 原当前 Host 11 项通过 |
| `battle_life_opening_input.lua` | 原当前真实入场输入 3 项通过 |
| `battle_ui_card_play.lua` | 原 runner 所选历史投影 3 项通过，只作历史合同证据，不冒作当前模块全套回归 |
| `npm run test:fast -- --base 36b9b157...` | 实际执行 10 JS、3 Lua，96 个 JS 断言通过；这是最后新增退役清理前的反馈，最终清理另由本 slice 矩阵和静态验证覆盖。Backlog 文件为未建模输入，仍明确要求 Full，没有把部分反馈或零测试当完整通过 |
| `npm run check:lua-static` | 最终固定 hash Luacheck 无新增诊断，原 CC15 等门槛通过；初次 CC16/21 拒绝保留，拆分点击准备/消费职责后通过，未更改配置或阈值 |

原始探针、失败、纠偏和最终输出在本独立树 `.artifacts/target-response-1115/`；新增回归为可提交重放入口。最初 Fast 计划因沙箱 Git 子进程不能解析存在的基线失败，提升执行权限后按原入口完成；测试 Controller 夹具缺 directions 的初次环境失败也保留，未当产品缺陷或跳过断言。

未运行本地 Full、未创建 PR 或触发托管 Full；按本轮要求只推送独立候选分支交协调者决定验证时机。未构建新 GIL、未官方导入/ready/容量或同候选手机实测，未修改发布候选、master、Tag、版本或平衡。本任务的设备要求保持未完成；精确 HEAD/BASE 独立评审与组合验证另行交接。

## c165 独审后的未知终止纠偏

独立评审明确拒绝 `c1658838097b8c4decc34ec9341f6046345ce0b4`：命名 Down2 后无 ID 的 Exit 或 EndDrag 没有 Up，只清 noTouch 而残留 active2，新的确认点击仍被阻挡。两份独立原始 probe 在本树分别复现 exit=1/endDrag=1，失败日志保留。独立 P0 药水组合另发现 popupFirst/lower 缺 Up 时，同 ID 的新物理序列也被误当并发；含 Up 的原两轨迹通过，不能据此给整个组合 PASS。

统一协议只作用于当前敌控件：未知终止先撤匿名资格，active 超过一个时不猜结束者，保留各自命名归属；单 active 必须与现存 pending 的 origin 一致，没有 active 才用唯一 pending 兜底。可唯一归属时同步退 active/held/released 及对应预览，旧尾 Click 不能冒领。未知 Up 也只取消命名 origin，不产生“已确认 Up”；完整 noTouch Down/Up/Click 保留。fresh 命名 Down 先退本控件同 ID 的旧序列，再检查真正其它活指，不能清他人控件或其它手指。

新增 `target_anonymous_terminal.lua` 七组参数化回归覆盖 nil/空表的 Exit/EndDrag/Up、唯一 pending、完整 noTouch、多 active 优先级、同 ID 复用、晚未知/命名尾事件及本控件局部性。两份原独立 RED、这七组与原十六组定向重放分别留证；CC15 静态、JS 语法及 Backlog/空白检查另验。没有重复全量或把自测当独审，新 HEAD 仍须独立七组及 P0 四轨迹组合重新核实，旧 c165 不作准入。
