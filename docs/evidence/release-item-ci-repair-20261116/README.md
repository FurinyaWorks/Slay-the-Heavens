# PR699：实际 Full 失败的最小接续

原 PR HEAD `73da2626d37fb52f90e71cd65838c08a1b9cae7c`，实际 Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`。Quality `43765128105` 的11个已失败分片逐一下载，不将仍在运行的其它分片当通过。初次 `gh run --log-failed` 因整条 run 未结束无法下载；部分直接下载遇 EOF/TLS，改用同一已结束 job 的 API，不重派 run。

| 已失败 job | 具体根因 | 本轮有界复验 |
|---|---|---|
| rules2 / 132976717778 | 原 added-inventory reader 未先读实际1cc外层 | 原 raw Full 库存与 missing/duplicate/drift 1/1 |
| rules5 / 132976717689 | 两项新成本floor被旧kind/八成员合同误归类；药水壳 Art 空 stub | 当前timing单项；药水壳1/1 |
| rules8 / 132976717719 | card_feedback 的严格control mock把可选 officialFigure 缺失抛错 | card_feedback10/10，HP付款/帧顺序断言保留 |
| rules12 / 132976717662 | battle_life、feedback_polish 同一可选figure缺失 | 6/6、17/17 |
| rules13 / 132976717858 | battle_life 同上；奖励行fixture缺真实parent | 6/6、reward-row1/1 |
| rules17 / 132976717949 | 原日志1394–1407 card_flow_feedback 缺可选figure，worker退出1；297 JS本身全过 | card_flow_feedback唯一入口退出0 |
| POSIX3 / 132976717654 | 药水Art端口及旧库存reader | 同上，未重复底层入口 |
| POSIX6 / 132976717644 | 新floor未单独分类 | 当前timing单项，保留原八成员断言 |
| POSIX9 / 132976717672 | retirement生成hidden lock仅CRLF差异 | 原成本源码合同及新增LF/漂移负控 |
| POSIX11 / 132976717615 | retirement、shadow同一hidden lock差异 | 同上 |
| POSIX12 / 132976717635 | 奖励行parent缺失 | reward-row1/1 |

fixture只允许唯一可选 officialFigure lookup 返回nil，其余required-control断言保留；当前默认profile确无该子树。原shadow与正式portrait行为不改。药水壳测试明确只测原生图像/tint，补可选Art端口的参数合同和false fallback，所有原壳/稀疏槽/容量/转场断言不改。奖励行构造器补parent，匹配真实原生树；未改生产runtime。

Windows采样hidden lock原SHA `85af46d8a792e54ee614844b4f8c0c90008231b25d152723ec75e0facd0a66cb`，仅归一LF即得到Linux真实失败值 `cede336837ad1e5ec17be1f17b2ab98192ba3934860eb513c8e1882b95cad228`。仅对 `node_modules/.package-lock.json` 重建原CRLF后比原hash；所有其它依赖逐字节不变，JSON payload漂移仍拒绝，旧收据/floor/超时不变。时序合同单独精确验证两项新floor的完整receipt/hash及键，原八floor计数/原八成员/旧regex不改。

核心检查点 `e03736adbe11d6c49a0e07abc5234a9be972e1e8`；后续card_flow和完整floor分类也逐源保留。本次仅新增CI-only outer `release-item-ci-repair-source`，12个实际before/current绑定、96旧gzip归档和352生产Git blob；原全部packet不改，owner无新增，JS/Lua发现入口零新增。所有新辅助状态标currentTreeCommitted=false，不伪造提交身份；原73da/1cc视图与旧raw目标继续走原validator。

原边界probe首次因新增相对import在data URL无法解析而失败，修复probe的真实模块URL后仍验证原截断包拒绝；原暖copy、缺失、漂移、foreign/opaque边界保留。原source消费者与source/copy复验均有独立日志，失败不覆盖。没有重跑22s shadow/80s retirement产品矩阵、Full/check、Hosted或GUI。所有原始job/本轮stdout及collector gzip与身份见archive-manifest.json。正式Required、实际合并、官方导入/ready/容量与设备验收仍未完成。
