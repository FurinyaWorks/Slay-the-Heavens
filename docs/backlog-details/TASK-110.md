# TASK-110 Release CI 分流

- 远端管理API前后快照：[Ruleset读回](../evidence/release-fast-ci-20261116/rulesets.json)。仅develop构建并发1→3、Release规则名称修改；Required、Strict、bypass、合并参数与master不变。
- 真实原生队列：701、681、683处于AWAITING_CHECKS，673、700为QUEUED。配置及调度读回不代替这些PR最终Full/合并成功。
- Release PR707：最小受影响Fast策略与冻结候选门禁；原生Auto-merge等待真实必需检查，不使用管理员合并。
- Develop 复用原 PR677 同步同一机制，保留原 bootstrap；修正其会恢复 Release push Full 的旧设置与交接 HOLD。规则变更失效的701/681/683/673/700五条授权已各用原独审、原准确HEAD/BASE通过现有merge:auto重新握手，不放宽指纹或重跑Full。
- 本轮最终本地相关CI合同153/153通过；独立复审/root/review_release_fast，四项反馈修正后35/35。旧失败长测114/116保留，不当作全过；本地Node22.22.1，不冒充hosted Node24验证。
- PR677 额外修正现行原始路由断言，真实磁盘Quality只允许develop/master push，Licenses保留原覆盖；该失败先复现，再与三项历史整源合同合计4/4通过。原Full发现清单、分片、门禁、期限及冻结旧源码均保留。
- [当前Release发布负例](../evidence/release-fast-ci-20261116/publication-negative.json)：准确33d71575c缺冻结Full，明确拒绝；未触发候选Full。
- 正向真实Release Fast→Auto-merge、冻结RC→Full→正式发布仍待实际事件。机制不触发平台发布或Tag，不自动重跑现有并行修复；源码、CI与平台发布分层报告。

复验：node --test tests/ci-impact.test.mjs tests/full-quality.test.mjs tests/auto-merge.test.mjs tests/merge-queue.test.mjs tests/merge-queue-admission.test.mjs tests/pr-quality-evidence.test.mjs tests/pr-history.test.mjs tests/ci-posix-concurrency.test.mjs tests/integrated-ci-source.cases.mjs
