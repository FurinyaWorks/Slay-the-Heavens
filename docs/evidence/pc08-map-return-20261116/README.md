# PC08 地图返回复用选角按钮

- 授权原文：PC 录音 08:14–08:38，战斗顶栏地图中的返回战斗按钮复用选角样式；私有截图 02 未访问，不作为证据。
- 固定基线：`release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`。只适配 official composition，不修改默认/v25 地图原有形状和位置，不引入 PC26/30 切片或 #672 全文件。
- 原因：地图最后绘制单态 `v25ReturnFlag[184,52]`，选角最后替换成四态低控件 `v25Flag[180,60]`。GameUI 的旧 hit 通过 V25View 接收 down/up/exit，但地图没有对应 face；hover 和 controller focus 也没有该官方返回脸的目标。
- 修复：从最终 character/cancel 借每态 v25Flag，保留原 back/hit/label 对象及实时“返回战斗”正文。旧 V25View writer 驱动 face；只为该 official routeClose 接续既有 hover/focus 参数，未改变 action/available/token 及 Controller 命令。保留 y=-235，以 canvas.safe.x 推导 x=-510，使180宽返回按钮落在安全区。
- 当前证据：material-red.tap 复现实树无共享四态；host-red.tap 以三个原 Release 生产文件复现实生成 Host 无共享 face；测试失败后按 finally 逐字节恢复。final-targeted.tap 的11项均通过，包含生产 nativePageLifecycle 的三场 Host 矩阵、原地图几何/身份/默认样式和共享 HUD。父 JS 是 `tests/official-map-return-controls.test.mjs`，新 Lua 初次设计归属 support，只由父 JS 生成 official 后完整执行，不改变旧 raw Lua 库存。
- Host 覆盖：normal/hover/pressed/disabled、文字和安全区、可见 current/available 节点保守包络、Exit/EndDrag取消、旧触点和菜单覆盖、C档 click、营地/战斗返回、Run/RNG快照不变、Controller Focus/Cancel及忙碌/旧回调拒绝。
- 工程：Architecture 351模块/1989边通过；git diff --check 通过。Fast只检查选测计划（full=false）；未启动Full/Bootstrap/CI。独立复审及统一源码/CI接续由root处理。Luacheck本地目录为空，未安装或放宽静态门禁。
- 边界：本轮无GUI/MCP/鼠键操作；未进行官方导入、新ready、实际PC/手机视觉和输入验收，不把Fengari Host当设备证据，PC08产品验收仍待同候选实测。

`source-manifest.json` 冻结原日志与当前源码哈希；首次错误的全树输入夹具日志保留在根 artifacts 的 `pc08/material-red.tap`，其误判不作为缺陷证明。
