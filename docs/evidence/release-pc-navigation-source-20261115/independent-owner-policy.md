# PR690 Owner政策修正：独立增审

**CODE_PASS_SCOPED**，无未解决项。仅覆盖本次5路径delta。

- Base：`11ec36bfb6c18e6f01d4e0d4e9ea207ca311a4e7`
- Head：`dc50bea8b10fbc74e90fd1ce1b80f3d9dcbf45da`
- Tree：`e057482cd0a91feb5e867e73d9519cb2d793e677`

## 更正此前审查建议

此前我未核对既有Owner政策，就建议将当前预测target（及forecast guard）设硬断言，建议有误。`docs/CI.md:168`的2026-11-07 Owner政策明确：Windows30/POSIX20为性能目标，预测及60秒预留仅提示，不因预测扩分片或阻交付；实际workflow硬超时为Windows45/POSIX30、local-special75分钟。本次移除的是错误新增的当前预测硬门禁，不更改原冻结历史测试或实际timeout。旧REQ/旧review保留，本报告更正其预测门禁建议。

## 独立验证

新增guard helper直接提取自精确提交执行，未让packet hash先挡住：唯一真实rules/engineering-posix-shards作业、四空格job层唯一timeout与精确75/45/30值均检查。12个changed/missing/duplicate/step-only/wrongjob负控全部在helper内拒绝。直接执行真实当前raw回调，真实shard计算下分别给Windows/Linux负载加1200000ms，预测跨过性能target和旧forecast guard仍仅诊断；真实job改值被直接guard拒绝。

历史冻结测试前缀逐byte一致；CI仅该测试current-row及显式政策metadata改变，其他22项、所有before、库存、93项immutable保持；档案物理SHA及Git对象逐项一致。原packet完整gzip逐byte另存，新after文本/SHA/Git blob相等。产品、成本、workflow不动。作者5/5日志已读取并记hash；未重跑Fast/Full/73/44/Host，未轮询CI。

当前预测：

- win32: raw 879 JS / 1424 Lua; forecast 1757923ms; target 1800000ms; overrun 0ms; unchanged execution guard 2700000ms; not hosted completion
- linux: raw 879 JS / 1424 Lua; forecast 1191630ms; target 1200000ms; overrun 0ms; unchanged execution guard 1800000ms; not hosted completion

本结论不授Hosted Full、官方候选/ready/容量、PC/手机或Release准入。
