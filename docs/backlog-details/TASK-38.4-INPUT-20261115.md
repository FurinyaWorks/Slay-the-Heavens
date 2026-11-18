# TASK-38.4：药水弹窗输入边界切片

## 范围与任务状态

按 PR #673 的 TASK-38.4 只读合同开发；基线 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。任务尚未进入 develop，本树 `npm run task:pick -- TASK-38.4` 返回 HOLD（任务不存在）。沿 Owner 明确授权开展独立代码切片，不复制任务、不合并文档分支；待 #673 合入后通过 Backlog CLI 同步认领与证据。全部手机 AC 保持未验，不标 Done。

Owner 本轮确认设备为 iPhone 14 Pro，第一批原图为 2556×1179；IMG_1400 的 SHA256 前缀为 `3651b8399a`。图像只证明弹窗静态位置，不能证明事件投递顺序。原图含用户标识，不提交公开仓库。此次未取得原始候选绑定，也未操作官方客户端或手机。

## 已证实的事件层缺陷与修复

真实 GameUI/Fengari Host 中，药水菜单已开时，下层手牌的 Down 会经 `closeInfo()` 关闭菜单，使同触点的 popup Use 随后失效。新增回归在基线失败于 `lower hand Down cannot steal popup 2/handFirst`。这是可复现的源码边界缺陷，不能据此断言已重现 iPhone 的实际命中路由。

下层 Down/Click 现在在药水菜单存在时被消费，菜单仅由自己的 Use/Discard/Dismiss 关闭。复用原指针回收条件，提取小函数以保留 CC15 门槛；未改变规则、按钮几何或二次确认。

独审另发现 click-only 兼容路径：popup 关闭后同触点下层 Click 可选中手牌。合法 popup 点击在执行命令之后登记原有 `releasedDragTouch` / `suppressClick` 有限屏障；旧触点不能转成下层操作，新触点 click-only 与同触点新 Down 可正常使用。匿名触点沿已有规则仅保守消费一次歧义 Click，不新增持久历史集合。busy、失效 token 与控制器屏障在消费回调前拒绝。

## 验证边界

- 扩展既有 `tests/lua/approved_main_potions.lua`：2/5/10 手牌、能量/爆炸/火焰三种药水、上下层 Down 两种顺序、Use/Discard/Dismiss、关闭后 Up/Click/Drag/EndDrag、重复点击、同触点新 Down 正常出牌及 click-only/匿名触点负控。原 stale 槽位替换、第五槽、多指与拖拽取消断言保留。
- M02：用真实远虑产生 `pendingChoice` 并打开 `deckUI`，顶栏三槽药水回调已被当前基线的选牌 owner 拒绝；回归要求库存、手牌与 pending 不变且不调用 refresh/render。没有复现手机黑闪，不将此源码负控称为手机修复完成；也不依赖 #672 的加载改动。
- 原工程门禁 `npm run check:engineering` 通过：351 模块、6167 测量、1988 架构边、Luacheck 无新增诊断、原生 UI 合同 6/6。最初因工具缺失未执行，随后复用已安装且经原脚本校验 SHA 的 Luacheck；曾被 CC16 拒绝，提取原条件后通过，未修改门槛或断言。
- 本地 Fast 10 JS / 37 Lua 通过（210223ms 测试阶段），开始于最初屏障版本；click-only 补丁另做最终定向回归，不能把先前 Fast 当作最终提交的完整 CI。完整受影响集合与精确提交准入交由原有托管路由，不新增 `ci:full` 或本地整仓 Full。
- 最终源码定向回归 `node scripts/test-lua.mjs tests/lua/approved_main_potions.lua` 输出 `APPROVED_MAIN_POTIONS_PASS`，退出 0（51187ms）；`verify:backlog`、`check:guidance` 和 `git diff --check` 通过。失败的远虑夹具（误认 choiceUI/仅一张可选牌）与复用旧 named touch 的 click-only 负控保留失败日志，均修正为真实协议条件后重跑，未修改生产规则。

本地原始日志位于本工作树 `.artifacts/mobile-potion-p0-1115/`，包括失败夹具、Fast 选集、Fast 输出、工程输出与最终药水回归输出。后续独审和精确提交 CI 由协调者绑定，不在正文预填成功。

官方候选写入/读回、导入、真实 ready、手机热区量测及同候选手机回归均 UNVERIFIED。本切片只交付可回归的输入边界修复，不声称整个 TASK-38.4 或 M01/M02 产品验收已完成。

## 2.0.0 Release 迁移（2026-11-15）

Owner 后续将当前发版修复分流至 `release/v2.0.0`。以上是原 Develop 切片的历史证据，原 PR #674 的授权不延续到 Release。新分支 `fix/mobile-potion-v2-1115` 从 `36b9b157ee6f05b65eb9f1da7e2978647d36c210` 建立，使用 `cherry-pick -x 90b1d2022c43be5b78b505d47b00615597935428`，保留唯一修复来源，不重写旧分支。

Release 基线相对原开发基线只修改三份工作流、AGENTS 与发版交接五个文件。移植后整棵 `src/lua` Git tree 为 `ed333c3638e49ccd68b762f26425637e11386478`，整棵 `tests` 为 `dcb80a92b3b1402007e4f146be9d7f830e022219`，均与原补丁提交逐 blob 相同。该等价核验只证明代码/测试未漂移，不替代新 HEAD/BASE 的独立评审与 Release Full。

新树重新构建数据/UI，最终 `approved_main_potions.lua` 输出 `APPROVED_MAIN_POTIONS_PASS`，退出 0（83664ms）；迁移日志单独保存在 `.artifacts/mobile-potion-v2-1115/`，不将旧树的运行日志冒作新组合结果。未重复本地整仓 Full；Release 工作流与实际远端保护由协调者核实，禁止直接合入或套用仅支持 Develop 的旧自动合并授权。

TASK-38.4 在本 Release 基线仍不存在，`task:pick` 为未知任务 HOLD；按 #673 只读合同和 Owner 明确迁移授权实施，认领同步待任务登记落地，AC 保持未勾。手机、官方候选、容量、ready 与发布状态均不因本次迁移改变；不修改候选、master 或 Tag。
