# TASK-4.10.1 默认商人对白逐帧阅读证据

精确 Release 基线 `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`。本片只补既有实现的离线验收，不改分页、批准台词、字号、气泡、时间或交易。原先 8d2d96f6 分页诊断只给理论时间；本次复用真实 NodeUI/Run/merchant 和默认生成布局，以 1/60 秒逐帧调用 update，记录实际完整页文本与页切换时点。

## 可复验入口

仓库依赖安装后正常运行 `npm run build:data && npm run build:theme && npm run build:ui`，然后：

```js
import {runLua} from './scripts/test-lua.mjs';
const r=runLua('docs/evidence/merchant-runtime-reading-20261116/probe.lua');
console.log(r.stdout,r.stderr);process.exitCode=r.status??1;
```

用 `node --input-type=module -e` 执行上述代码。probe 的 setup 沿用原 merchant_dialogue_lifecycle.lua，使用真实生成 NodeUI 和交易状态；模拟控件不是设备。source-sha256.json 绑定生产、台词、主题与原fixture。

## 本轮观察

[原始输出](output.txt)：完整旁白进入问候的时刻为 **24.9500 秒**（模拟60Hz，不是实际墙钟/设备性能）。以下尾页完整显示至下一页开始均为 **2.6167 秒**：

| 连续页 | 尾页完整显示 | 下一页开始 |
| --- | --- | --- |
| 旅行者看到一块旧毯 → 子， | 5.7000 | 8.3167 |
| 上面摆着卷册和古 → 物。 | 11.1833 | 13.8000 |
| 毯子后坐着一位老 → 人， | 16.7000 | 19.3167 |

这将此前理论“短尾也等2.6秒”推进到真实组件逐帧观测；不能因此推定官方字体能容纳更多字，更不能自动改变批准文本。最后一页至问候同样包含停留。

附带真实 NodeUI 状态断言：点击加速补完当前页；购买即时切换buy；金币不足切换poor；隐藏后推进10秒不丢阅读位置；重新显示后继续同一句。输出 `LUA_NODE_UI_PASS 0` 来自仅取得control工厂的支持文件，不是声称跑过旧整套测试；本片依据其后明确轨迹和断言，原runLua退出0。

## 未验与下一步

本次仅默认布局，无Official profile、实际连续画面、原生文字裁切、鼠标/触摸/手柄或用户阅读确认。不是Full、GIL、官方ready或PC/手机实测。所有原AC保持未勾。后续应将相同三处短尾与批准候选的连续画面对照交用户决定，不凭离线时间盲调容量或重写Lore。

输入生成：本树复用3e96已生成默认build；已核对1cc→3e96的data与三个生成器零差异。task:pick 初次因稀疏树无backlog/tasks失败；物化原基线backlog后为ALLOW，不将该输出当认领或AC完成。

## 独立复核

独立review_terminal源码复核最终probe PASS；SHA256 `1af0b0e752e4013db8f83fd023eaf03ecd710801dff4c9e957acd3dcdc797d4e`。初审纠正购买时已为greet而非encounter的输出措辞，并补隐藏/恢复前后current对象身份断言；最终probe已由作者重新运行退出0，轨迹时刻不变。评审者未重复执行。Backlog CLI补充计划/证据并将既有实施任务由To Do改为In Progress，原五项AC全部保持未勾；verify:backlog与diff检查通过。
