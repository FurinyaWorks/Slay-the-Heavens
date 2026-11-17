# PR712 dispatch 跳过状态修复候选

基准：b4801643dc4371754ba98dbe96a389c546e1f9b8。仅独立候选，不覆盖正在维护的 PR712，不启动新 Full。

真实失败：Fork A run44026568101，job133848446581（engineering-posix）在 Full 模式得到 ENGINEERING_RESULT=skipped 并非零退出。job列表显示 admission 预期 skipped、impact success、POSIX 分片 skipped，Windows rules 已实际启动。原 fast 与 engineering-posix-shards 的条件只有 mode 比较，未显式使用状态函数。

官方依据：https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#status-check-functions 。无状态函数时存在默认 success()。修复仅给两消费者显式 !cancelled()、impact.result==success 和原路由条件；不改变 Required、矩阵、超时或任何测试断言，不让失败的 impact 放行。

C Windows Node22.22.1：使用准确原工作流跑新回归，RED 1/1；两条件修复后，新状态回归与真实来源 helper 正反控 2/2。状态回归覆盖 admission skipped + impact success 的 Fast/Full 正向，以及 impact failure/cancelled/skipped、全局取消、错误路由负向。它不是 GitHub DAG 引擎模拟，最终托管确认仍待；不冒称 Node24/完整 Full 通过。

原 fork-preflight-source.json.gz 保留原字节 SHA256 817b912bff7c6caa4cf3ea8d565fcdabe47a25f31e16cea191d98d3b190ac65d。新 fork-preflight-status-source.json.gz 只更新当前 workflow 与追加回归的摘要，所有 before/beforeSha、其他 current、原库存及指标测试身份保持；helper 仅换包路径和准确新包 SHA256 49772be0bcce71e23b64bde18ba60f922268298e815f6f7cf0b157f63257a1ce。LF/CRLF准确投影及漂移/Buffer/foreign保留已用实际helper验证。

接续：先协调 PR712 当前 HEAD/文件所有权及现有 Full 结果，独审本增量后由维护者正常接续；不要另行同时派发 A/B Full，也不要用旧 b480 的运行认证修后候选。

## 同一 Full 已结束，合并修复边界

run44026568101@b480 completed/failure：实际25个作业，15 success、7 failure、3 skipped。7失败是5个Windows分片（4、6、18、1、16）与POSIX/check两个汇总；不是完整POSIX Full已执行。没有重新派发。

本合并候选追加：3处历史消费者精确前视图适配（工程、POSIX历史EOL、Windows历史timeout），保留物理current用例/旧断言；fork-preflight工作流读LF规范化修复CRLF。原回调CRLF 0/2→2/2、LF2/2。三历史消费者的有界原回调b480及904分别2pass/3fail→5/5；不是三整文件/全部负控完成。合并新包后状态+真实来源正反控仍2/2。全部C Node22.22.1，不冒称Hosted Node24或Full。

原两个gzip仍保留；新status-v2包SHA256 4e6c438a72e9c5ee672c5eb3976e547c85cc26fa301c7beb9c4402147349d7ed，只更新精确当前绑定、已有新增测试摘要并新增三消费者的完整before/current。所有既有before/beforeSha、原库存及其他绑定保持。Backlog notes由CLI追加，plan/status/AC不变。

仍未关闭的真实失败：Windows rules4/18 的 tests/native-candidate-preview-mask.test.mjs 引入 integrated-ci-source.cases.mjs:10，原历史库存缺新tests/ci-governance-metrics.test.mjs和tests/fork-preflight.test.mjs，完整清单深比较失败；须准确来源库存接续，不从当前Full删除新测试。

独立复审确认的原设计阻塞：新增admission实际job尚不兼容verify-delivery、publish-full-quality和Fast证据的严格job集合。不得将unknown job普遍放行，须正确处理各事件的admission success/skipped或复用现有job入口。此候选不声称解决该缺口。

下一步先解决剩余库存/作业集合兼容、完成新合并候选独审和必要定向验证，再统一进行一次必要Hosted验证。不要现在明知仍有阻塞便重复Full，不用b480结果认证本新SHA。


## 剩余阻塞的最小修复候选

本候选修复上一节两项已知缺口，不通过放宽清单：

- 移除新增Quality/Licenses admission job，原预检脚本移入既有impact/inventory，只对主仓非master PR执行；先原pending状态失效，再预检，再规划/媒体恢复。presentation依成功impact。原七个Quality作业模板及Full/Fast验证器保持，队列/push/dispatch/master继续原验证。
- 历史库存断言调用现有preflightPriorInventory，原878测试保留（含两个新增测试），仅旧视图为876；原库存对比RED，新实际库存/缺失/重复/foreign/字节漂移与EOL负控2/2。
- 更新现有源码篡改负控以删当前真实needs: impact，原needs: admission已不存在会成为空操作。原回调RED→GREEN，保留其他漂移/Buffer/CRCRLF断言。

C Node22有界原回调：作业复用3pass/4fail→7/7；库存原RED→2/2；最终真实leaf/完整来源映射/原始库存/状态及源码负控5/5。不能相加冒称完整覆盖，部分相互重叠；三整文件/全部来源闭包尚需Hosted验收。actionlint不在C PATH，未运行。正式工作流固定Node24.18.0，C结果不冒充该环境。

新包fork-preflight-status-v3-source.json.gz SHA256 cf997f0cdeb697b9eb5302a01fe4c9e585e3d664567265f2d9b526325c787b64；旧所有包仍保留，既有before/beforeSha、原库存及未变身份不动；只绑定准确当前Quality/Licenses/Full测试/源码负控、新库存消费者与新预检测试。Backlog通过CLI追加计划/notes，负责人、状态、AC保持。

独审最终增量后，查两Fork准确HEAD/BASE的已有运行，再只选择Fork B的一次必要Full；若有在途即交接不重复。Fork B当前FurinyaDev push=true且无在途Full；不得把本地测试当Hosted通过，成功后才接续原712。Fork仍不发布主仓Required或代替正式PR组合/队列。
