# PC22 基础出牌坐标衔接

Release36自然seed1 Strike UID5，实际playedCard与同UID入堆trail在同父同canvas的中心交接点相差48逻辑单位。CardFlow.playing漏用已有flight.stop，修复1b272ab7仅使用ty-stop；不改飞行计时、命中停顿、牌堆事务、规则或RNG。shape/scale整体连续不在本修复结论内。

精确最终回归在原CardFlow上RED，修后官方profile三路径通过（Strike弃牌、无stop Defend、受控Shockwave消耗）；旧CardFlow与默认feedback17通过。Fast实际10JS+37Lua，包装器内部调用npm build:data/build:ui，未安装依赖；不能冒称全程固定Node24构建。旧polish在official profile的2失败，经原Release36对照也同样失败，默认17通过；所有原始失败/修正/通过日志与脚本逐字节归档，没有删除或改断言。

[产品独立审查](independent-review.md)限定PASS，核完整父层/anchor/pivot/rotation/scale，独立Fastmode及20ms三路径和stop四边界通过。证据归档仅压缩保全，没有重跑。

当前仅代码基础交接修复：来源与CI合同另片接续，当前HostedCI、新GIL、官方导入/ready、PC及实体手机与容量未验。私图12未访问，装饰流光/灰烬精修延期；不把PC22或Task29.1整体记Done。

来源接续249511已选择性组合197ef837并完成[独立增审](source-independent-review.md)；[15项输入覆盖](admission-coverage.json)逐blob保持产品/来源审查身份。全352/旧116owner/64targets/92档案保全，新CardFlow owner使真实union117、目标65，raw877JS/1424Lua。Source6/复制44/raw2/历史4/CI2通过，不改变timings、预算或workflow。此前产品检查点没有来源结论，不能倒填它；当前仍缺#692新基线与Hosted/官方/设备准入。
