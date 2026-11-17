# #711 横搓返回原位：独立原型补验

- 被测生产候选：`ad6fe84dbcc11e28e8a82258f889a6841b46c8c6`；Release 基线 `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。
- 本目录只归档隔离诊断，不修改生产、原回归或 CI，不接管 TASK-30 / #711。无新增 PR。
- 原作者窄修依据：[6934355615](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/711#issuecomment-6934355615)。原作者已经拥有产品原型，本次只补不同边界，不重复其 17 场景。

## 结果

使用精确候选的已生成 data/UI、真实 Lua 回调与现有 `drag_input_boundaries.lua` 的 setup。取前缀到 `local count = 0` 前（未替换原文件），新写两个场景：

1. 开局动画稳定后，Card Down → 横移 100px → 回原坐标 → 等待 0.45s。先断言真实 `browsed=true` 且未进入 moving，再要求不误开详情。
2. 独立新局真实静止 Card Down → 0.45s，要求非瞬态读卡器仍能打开。

原生产：场景 1 **RED**，`BROWSE_RETURN_DETAIL true`，退出 1；场景 2 因 fail-fast 未运行。隔离原型：**2/2 GREEN**，`BROWSE_RETURN_DETAIL false`，退出 0。记录轮耗时约 4.78 秒（两个进程合计）；不是产品性能基准。

`actions-prototype.lua` 是原 `abyss_battle_actions.lua` 的隔离副本，仅将 `helpPointerChanged` 的卡牌条件增加 `help.card.browsed or`，和作者公开原型一致。`prototype.lua` 通过 `package.preload` 加载它，不写 src/build。原样保存运行脚本和 `result.log`，日志中的原始 /tmp 路径及 SHA256 未改写。

## 复现

在上述精确候选的独立检出完成依赖及 `npm run build:data && npm run build:ui`。把本目录四个原始文件复制到独立环境 `/tmp/pointer-review-0115/`（已有目录须先核对归属，不覆盖他人文件）。仓库根目录运行：

```sh
LUA_PATH='./build/lua/?.lua;./src/lua/?.lua;;' timeout 30 node node_modules/fengari-node-cli/src/lua-cli.js -e "dofile('/tmp/pointer-review-0115/current.lua')"
LUA_PATH='./build/lua/?.lua;./src/lua/?.lua;;' timeout 30 node node_modules/fengari-node-cli/src/lua-cli.js -e "dofile('/tmp/pointer-review-0115/prototype.lua')"
```

使用 CLI `-e`，Lua 断言失败保留非零退出。测试进程限制 30 秒，无重试改绿、断言弱化或跳过。最早准备尝试缺 LUA_PATH，未进入用例；补正确模块路径后才得出上面的 RED/GREEN。未重建或覆盖共享 build。

## 限制与交接

这不是完整修复/合入证明，不替代原 Official 两条回归、完整输入身份协议、最终组合、Hosted CI、GIL 或实体设备验收。显式详情关闭后的匹配尾事件未在本补验中修复或验证。

静态检查 `action_bindings` 发现 `pointerTake` 无令牌会提前返回；不得把整个 `swallowed()` 前移，因为它在没有匹配 swallow 时还会关闭当前详情。原作者应独立保留同名具名尾清理、外来 ID/匿名/重复/新序列负控，并运行真实 Official 原回归。

Backlog CLI 在本环境不可用。本次按已授权的独立复审/证据归档边界执行，不手改任务状态，不宣称领取或完成 TASK-30。产品实施继续交现有 owner；独立补验结果经 #711 评论交接。
