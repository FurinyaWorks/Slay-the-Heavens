# TASK-4.21 手牌几何临时表分配切片

基线 `release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`，独立树 `mobile-hand-layout-v2-1116`。按既有任务授权追加，不改 In Progress/Furinya/3-of-4 AC，手机 AC3保持未验。已核对 #684 ae5194a7、#690 11ec36bf及本轮九个mobile draft：对应 card_view blob均与本基线相同，无重复实施。旧900 statusView由#688承接，不重做；未恢复肖像setter读回缓存。

## 两类表分开计数

旧 `pc-perf-1115/battle/FINDINGS.md` 的1500计数是每帧发布的两值 `view.cardPositions[uid]`。Down将它保存到 `g.origin`，触屏箭头和抓取轨迹继续读取，不能原地修改或跨帧复用。本片完整保留这些快照：预热90帧后300帧、5卡，仍有1500个新位置对象，数值均未移动。

另一个独立分配发生在 `handValues`：每帧先建立8值表，成功缓存命中后只比较就丢弃。实际当前Host与当前生成的官方profile树以 `debug.getupvalue/setupvalue` 观察真实私有函数返回，不改生产源码或公式。原基线为1500次调用、1500个返回表；zero-table oracle先RED，原失败日志保留。小修后相同负载仍1500次调用、返回表0、位置快照仍1500。对照另将精确base36模块载入相同Host/生成物，分别保留source SHA256及独立前后计数收据；不是FPS、GC或内存实测。

## 实施边界

唯一runtime变动为 `abyss_battle_card_view.lua`：原私有 `handValues` 公式返回8个标量；命中缓存时逐值比较；真正需要原生写入时才组装原来的不可变cache values表。默认公开CardView API、公式、计算次数与写入顺序不变，没有跨frame的新状态/位置缓存，也没有跳过三角函数计算。

原owner/hit/alive检查、weak native key、失败清理、pending/reentry退役和写后重新计算比较均保留。未改输入、规则、RNG、图形、位置快照、900状态派生或其它分支。21行隔离生成测试helper与#688的原blob相同，仅供本树独立验证，不引入其runtime依赖。

## 本轮有界验证

| 入口 | 实际结果 |
| --- | --- |
| 同源Host计数 | 300帧、5卡：8值临时返回表1500→0；两值origin快照1500→1500；调用数1500不变 |
| `tests/hand-layout-values.test.mjs` | 2/2 JS：243组尺寸/角度/scale/hit lane八标量逐项等于原公式；实际Host静止、20次hover、12帧drag、2次resize，原点snapshot不变，完整Run/RNG相等 |
| 原 `hand_geometry_cache.lua` 与负控 | 原缓存合同、七个owner/new-hit/dead-hit/false/reentry/throw-cleanup/layout-writer精确变异通过；命名pattern还实际匹配三项原render/preflight近邻负控，合计11/11通过，未冒称仅8项 |
| Lua静态/JS语法/空白/Backlog | 原Luacheck 1.2.0、CC15等无新增诊断，其余基本检查通过；未改阈值或超时 |

原始证据在本树 `.artifacts/hand-layout-1116/`：`temporary-tuples-red.log`、`baseline-count.log`、`current-count.log`、`count-base36-1500.json`、`count-current-0.json`、`hand-values-contracts.log`、`cache-contracts.log`、`lua-static.log`、`verification.json`。初次同名count-0收据随后被green覆盖，原RED日志与来源基线保留；后续已改为按来源分别保存并重放真实base36计数，未把green收据当before。一次Git restore沙箱权限失败与一次基线计数审批超时均未当产品错误，原命令提升/单次重试后完成。

没有新GIL、官方导入/ready/容量或本轮iPhone14Pro实测，不把离线分配数当卡顿根因/加载速度/FPS改善。未跑Full、未建PR；新增回归和当前来源的正式CI准入仍须独审及协调者后续登记/正常门禁，不能借其它base或旧候选PASS。

## 2026-11-18 独立提取

从 #688 取出 `f5169260880043c0fbf5d51ad869e1b493cea85d` 的同一生产变更和原回归，应用到 Release `9a5c56d5c786273feb0efcbfbd487754e9acba3c`。源 PR 最终头 `f03605d69b0943139a2d1f015edd953cb9958089` 的上述生产和回归文件 Git blob 一致。完整历史工件沿用[固定提交归档](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/f03605d69b0943139a2d1f015edd953cb9958089/docs/evidence/hand-values-actual-release-20261116)。

当前实际 Release 组合的原回归两项通过。JS/Lua 精确库存和历史生产快照仍需当前切片来源续接。已复现 `tests/integration-source-epoch.test.mjs` 因 `abyss_battle_card_view.lua` 的新字节拒绝授权。在保留原历史来源断言并通过新基线的这些门禁前，此提交只作可重放的提取点。设备与官方候选仍待验。

## 实际 #679 合流后的续接

重放至 Release `b63719b117e83676e20787e752d14bc66b63a6ed`，产品检查点 `c73465e5c322a1f8e3ecf493a2c8c161506c7d18`。保留 #679 药水输入的三个原样模块、原 CI 收据及全部历史来源目标。复用 #688 冻结的手牌 production packet 并接入现有来源阅读器，新增一个明确的历史目标。原顶部 JS/Lua 测试库存未改变，新用例进入已有 `tests/runtime-ui-hotpaths.test.mjs` 以常规方式执行。该用例包含手牌公式和 300 帧 Host 回放，以及来源旧字节、失效及缺失的负控。

验证入口包括 `tests/runtime-ui-hotpaths.test.mjs`、`tests/integration-source-epoch.test.mjs`、`tests/release-card-contact-integration.test.mjs`、`tests/release-selection-map-source.test.mjs`，以及现有集成和规划合同。候选不改变操作协议、控制数量或规则。实际官方导入/ready、官方容量和 PC/手机性能仍由发布候选、独立设备流程验收。
