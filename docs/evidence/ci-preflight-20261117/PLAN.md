# 三仓库预检增量

用户授权独立实施、接续 #712，且要求轻量清爽。使用已有 Actions 与只读 API，不增加调度器。

- Quick 手动 Fork 预检执行完整已映射 JS/Lua；未知或零覆盖拒绝并要求已有 Quality Full。原 advisory CLI 保持本地语义。
- Quality PR 最先检查固定 Fork ID、精确 head/base、成功 run 与完成时间。正式矩阵只在收据验证后开始；队列、push、冻结 Full 不经过此预检。
- 复用既有 checkout 收据；run-name 绑定输入 base，API head_sha 绑定实际提交（也绑定配置树），不能把 Fork SHA 等同 PR merge SHA。正式检查全部重验。
- Concurrency 取消同 ref 过时运行。相同 SHA/base/config 在 A/B 已有成功或运行中时，Agent 复用而非重复 dispatch。跨仓库不能靠 Concurrency 原子去重，保留明确限制。
- 先写门禁/完整选测负控，再实施，再跑相关合同、guidance/backlog、独审。按需指标区分候选重复、确认重复与正常组合验证。

不修改 #677/#707 的 Release Fast / 冻结 Full 实现，不修改任何规则。此变更正式合入前不声称已部署。

## 本轮验证边界

- 本地 Node24.19.0；工作流仍固定 Node24.18.0，不冒充同一运行环境。
- actionlint v1.7.11 校验三个修改工作流通过；syntax/guidance/backlog 通过；门禁负控覆盖 SHA/BASE/结论/时序/attempt、较新失败、完整选集和 Draft→Ready。
- 独立复审 `/root/review` 已确认修复 Full 比较基线、Draft license 路由及精确 attempt 时间读取；未发现 Required/Queue/Release 降级。
- 一次真实选测探针发现单夹具触发637 JS/592 Lua 的保守闭包；已终止该宽试跑，不记通过、不继续另跑本地 Full。应先使用现有 `--plan` 评估选集；共享 CI/未知影响由一个 Fork Full 验证。
- 历史源码合同沿精确全文逆投影接续，原 pins/archives/断言不变；新的未投影合同单独核验当前门禁和真实分片覆盖。Linux 无 pwsh 的真实冷检出探针不冒充 Windows 通过。
- 本轮不变更 rulesets，不操作 merge，不加 ci:full 标签。正式部署须本 PR 正常通过保护合入；Fork Full、主仓库 token 跨公开仓库读取及实际先后次序仍须托管 run 记录，不能用单元测试冒充。

结果记录：最终新门禁/指标/impact 定向26/26；既有8文件CI合同115/115；原始来源闭包4/4、StS11/11；actionlint、syntax/guidance/backlog、diff-check通过。另一个包含真实冷检出的6文件批次90/91，唯一失败因本Linux环境没有pwsh（status=null）；没有删该断言，留给托管Windows验证。统计gzip离线回放与存档report逐字节一致。


## 失败后最小作业接续

Fork Full44026568101在b480真实暴露dispatch的admission skipped传播及历史来源/CRLF问题。后续候选复用既有Quality impact和Licenses inventory的只读预检步骤，移除新增admission job，保留原Full/Fast精确job清单、收据与发布校验。Quality仍先失效旧状态，再核验预检，最后做计划；未取消且impact成功才运行其消费者。queue/push/dispatch/master按原验证走，不要求Fork证明新组合。不得将未知job普遍放行或把pending、failed、cancelled、旧HEAD/BASE证据作为通过。

此段是修复接续计划，尚非正式集成/托管验收结果。原25-job失败快照和修复验证边界见../ci-preflight-status-fix-20261117/；新候选须精确独审并运行一次必要Hosted验证，不能沿用b480结果。
