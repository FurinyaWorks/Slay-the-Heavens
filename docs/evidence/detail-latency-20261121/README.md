# 战斗详情延迟切片（2026-11-21）

来源：Owner 本次手机 02:13–02:36 反馈。基线 `5991585aabde667eef9852b8c340c194c42a5c62`，目标 `release/v2.0.0`。本会话按 Owner 指定 release 及 PR-only 管理员应急合并执行，覆盖文档默认 develop 路由。责任人：本次 Codex 执行会话，Backlog 关联 TASK-4.21（CLI 不可用，未修改任务/AC）。

## 根因及最小修复

- `openRelics` 原先 `openDeck → Host refresh → deck.close → inspectRelics → Host refresh`。第一次会复制卡组、建查询目录、填充 Grid，产生随后立即弃用的卡面工作及中间页面就绪意图。现在使用相同 inputCovered/deckBlocked/mode 门禁直接打开已有遗物视图，仅一次刷新；保留 deck 模态所有权，补相同的 openSession 递增并登记最终 presentation source。
- 战斗 `openHelp/showStatus` 和详情翻页/关闭原先全量重画敌人、手牌、HUD、药水。现在只更新已有 statusInfo；仍调用原 prepareRenderInputs（含指针代次/过期 token 清理）和 renderDetails 的 actor/reward 校验，每次重新查询内容。未缓存可变战斗数据。取消药水瞄准、拖动/携带、busy 或 Run/battle 身份变化退回全绘制。
- 保留页面 readiness、全屏 input blocker、详情关闭吞 Click 和原长按等待。未缩短触摸阈值或凭空宣布页面 ready；通过移除遗物中间卡组打开消除不必要的准备。没有改卡组排序、卡面、美术、战斗规则或 RNG。

## 离线测量

`tests/lua/detail_latency_benchmark.lua`，LuaTeX 内置 Lua 5.3（`luatex --luaonly`），真实 Host/战斗/遗物 Lua + 仓库 mock 原生控件。`LUA_PATH='./build/lua/?.lua;./src/lua/?.lua;;'`；先 npm ci --ignore-scripts、build:data、build:ui。基线使用相同 benchmark 与六个生产模块的准确基线源码覆盖加载（package.preload），其余输入一致。源码对照无跨工作树写入。原始数据 before.txt / after.txt；均每路由 50 次打开/关闭，再重复 50 次看稳态内存。卡牌通过真实 openHelp，状态通过 showStatus；不是物理触摸事件采样。

| 路由 | CPU 中位/P95 ms 前→后 | 打开到 mock 内容可见墙钟中位/P95 ms 前→后 | 原控件方法调用总量前→后（含关闭） | 首50次GC后保留 KiB 前→后 |
|---|---|---|---|---|
| 遗物 | 6.091/17.672 → 2.359/3.318 | 8.952/49.455 → 2.361/6.857 | 157050 → 106000 | 183.181 → 5.911 |
| 卡牌详情 | 1.495/1.949 → 0.257/0.502 | 1.498/1.954 → 0.257/0.503 | 43600 → 3600 | 14.402 → 14.402 |
| 状态详情 | 1.283/1.784 → 0.045/0.092 | 1.286/3.562 → 0.046/0.093 | 42850 → 2850 | 3.061 → 2.920 |

第二批50次的额外保留各路由前0.062 KiB、后0.047 KiB（含测量容器，非原生/GPU内存）。遗物每次开关 Host refresh 3→2，其中打开2→1；详情0次 Host refresh，直接全战斗 render 被移除。方法计数只含初始树已包裹的 SetVisible/SetImage/SetSizeDelta/SetAnchoredPosition/RefreshItems，不含属性赋值及后来创建节点的方法，不能当作全部引擎调用。墙钟受云端其他测试调度影响，CPU与确定性次数共同判断；无跨机泛化、设备FPS或绝对延迟承诺。

## 验证及边界

新 detail-latency 回归在基线明确 RED（遗物先建卡组），修后 GREEN；恢复详情全绘制的负控明确 RED（detail open repainted the battle），日志随附。覆盖直接遗物入口、只刷新一次、同控件复用、当前HP刷新、完整Run/RNG不变、Down关闭与尾随Click吞掉、busy/菜单/重复入口拒绝。现有生成式页面就绪与遗物控制器回归另行运行，最终摘要见 PR。

当前候选未构建 GIL、未官方导入、未取得新 ready，PC/实体手机均 NOT_RUN。手机触摸→首次反馈、触摸→真实弹窗可见的中位/P95、真机重复开关及原生/GPU内存均 NOT_RUN；没有录屏/设备接入，不能把上表当作 02:13–02:36 真机前后数据。设备复验应对同一候选分别测冷开与至少50次暖开/关闭、翻页、长按、返回、出牌/药水穿透与切后台恢复，并记录型号、帧率、候选SHA和内存。
