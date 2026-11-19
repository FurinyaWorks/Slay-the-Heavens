# 正式历史输入入口：精确配对接续

先于本修改保全的隔离证明见 [676508d2](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/676508d246b6033d543fd8515b881cba27ad41b6/docs/evidence/pr738-historical-input-proof-20261119)。本轮在同一独立任务分支最小修复正式入口，不更新 #738，不启动 Full，不修改生产 Lua。

## 修改

- `historical-card-input.mjs` 只在原三条历史路由内，使用同一个 call-local 归档 reader 校验 gestures 和 bindings，再分别调用既有 `preIntegrationSource(...,'base')`。双 host 和 base 完整 SHA 均验证后，按原顺序生成两条 preload。gesture=`3750e191…`，bindings=`0c370951…`；没有使用虽能通过但不同代的 `add73e13…`。
- `scripts/test-lua.mjs` 原样不动，其他三个前缀、既有开局80帧、Lua三片/支持体和12个原用例、原30秒显式测试预算全保留。其他当前输入 fixtures 不接管历史来源。
- 对应 Node 测试保留原正文、原重复漂移与缺失负控。新增精确 preload hash、binding host、同一个读口的 warm→drift→missing→恢复，以及 gesture 已成功后 binding 第二阶段的 linked 缺失/漂移，严格区分 Error 类型/代码和完整首行。
- 新增唯一 `release-historical-input-ci.json.gz`，三个 CI 叶固定 `676508d246b6033d543fd8515b881cba27ad41b6` 的完整前像/Git blob，再绑定真实当前 bytes。旧来源档、352生产文件/129 owner/88目标、copy闭包和所有运行预算不变。新旧读者缺失、漂移和旧前像替代均 fail closed。

## 固定验证

Node 24.22.1 / Linux / Fengari；不是 Windows/官方客户端实测。

| 检查 | 结果 |
| --- | --- |
| 原正式 `tests/card-input-slices.test.mjs` | 修前 1/2，首片六例 `Intent=nil`；修后 2/2、0 skip，原12个用例通过、各进程显式30,000ms不变 |
| 原 `tests/historical-card-loading.test.mjs` | 2/2；cold/非目标无历史I/O，warm缺失/损坏仍拒绝 |
| 新旧来源六项定向 | 6/6，0 skip |
| 完整 StS 来源文件 | 11/11，0 skip |
| 完整联合来源文件 | 7/7，0 skip |
| syntax / guidance / Backlog / diff check | 全部通过 |
| 原 test-strength | M1–M4 全部被原断言杀死 |

最终严格30秒 Node文件耗时46.826秒，包括三个独立进程及来源负控，不能把文件总时长当单进程超时。

另用未改动的原 CLI 分别运行三片，12原名全部通过，观测耗时28,892 / 22,437 / 21,809ms。**该 CLI 默认预算是90秒，不是30秒**；本轮没有修改它。严格30秒的证据来自上表原 Node测试；CLI只提供同一固定字节的各片观测耗时，不能借默认90秒代替30秒门槛。第一片该次观测接近30秒，保留实际数据，不据此放宽预算或声称稳定性能达标。

## 独立复审

固定5文件独立复审 PASS，详见 [报告](independent-review.md)。三路由24个实际 host/linked 热后缺失/漂移负控通过；CI三叶36项实际读取负控、9项当前叶缺失/漂移/旧版替代均拒，恢复通过。现行原 card 和 potion safety fixture 仍保持 live，不隐藏成历史输入。

`logs.json` 保存原始/公开/压缩 SHA-256，公开版本只脱敏本机临时绝对路径。初始正式红、中间绿和最终绿分别保留，不互相替代。独审脚本只读且未重复跑Lua；含固定本地同树提交标识，复现前须核对远端 tree 对应关系。

## 边界

这关闭的是当前隔离候选的三个**正式历史回放入口**失败，不是完整历史游戏重建或实际玩家输入变更。本轮没有新的产品质量数值测量；生产与已审通过候选完全不变。

#738 仍需最终统一准确 HEAD 的原门禁。PC22 Windows no-op CRLF 来源投影由另一独立线路处理；#703/TASK-111 原生启动、同候选容量/ready/设备验收仍独立。未合并、未发版、未触用户GUI。
