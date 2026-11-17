# PR712 dispatch 跳过状态修复候选

基准：b4801643dc4371754ba98dbe96a389c546e1f9b8。仅独立候选，不覆盖正在维护的 PR712，不启动新 Full。

真实失败：Fork A run44026568101，job133848446581（engineering-posix）在 Full 模式得到 ENGINEERING_RESULT=skipped 并非零退出。job列表显示 admission 预期 skipped、impact success、POSIX 分片 skipped，Windows rules 已实际启动。原 fast 与 engineering-posix-shards 的条件只有 mode 比较，未显式使用状态函数。

官方依据：https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#status-check-functions 。无状态函数时存在默认 success()。修复仅给两消费者显式 !cancelled()、impact.result==success 和原路由条件；不改变 Required、矩阵、超时或任何测试断言，不让失败的 impact 放行。

C Windows Node22.22.1：使用准确原工作流跑新回归，RED 1/1；两条件修复后，新状态回归与真实来源 helper 正反控 2/2。状态回归覆盖 admission skipped + impact success 的 Fast/Full 正向，以及 impact failure/cancelled/skipped、全局取消、错误路由负向。它不是 GitHub DAG 引擎模拟，最终托管确认仍待；不冒称 Node24/完整 Full 通过。

原 fork-preflight-source.json.gz 保留原字节 SHA256 817b912bff7c6caa4cf3ea8d565fcdabe47a25f31e16cea191d98d3b190ac65d。新 fork-preflight-status-source.json.gz 只更新当前 workflow 与追加回归的摘要，所有 before/beforeSha、其他 current、原库存及指标测试身份保持；helper 仅换包路径和准确新包 SHA256 49772be0bcce71e23b64bde18ba60f922268298e815f6f7cf0b157f63257a1ce。LF/CRLF准确投影及漂移/Buffer/foreign保留已用实际helper验证。

接续：先协调 PR712 当前 HEAD/文件所有权及现有 Full 结果，独审本增量后由维护者正常接续；不要另行同时派发 A/B Full，也不要用旧 b480 的运行认证修后候选。
