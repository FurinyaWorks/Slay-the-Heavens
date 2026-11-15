# TASK-75 来源夹具计算去重收尾

基线 `e65d9b98fbec69442047650254238cd9244df805`，独立分支 `feat/source-proof-cost-followup-1115`。仅将不可变默认夹具的 `source/expected` 派生移到每个 consume/host 一次；实际 owner 鲜读、故障、恢复、嵌套与 36/72/108 次混读断言全部保留。未修改生产、CI路由、权重、并发、超时或预算。

- 同源有界前后探针：69条断言轨迹一致，期望计算4→2；完整矩阵静态计算次数2170→62，不是墙钟提速数据。
- 原 named owner matrix：1项通过，0失败、0跳过；测试体11,413.3658ms，进程28,178.7303ms。没有同机旧版 named 墙钟基线，不与历史CI整文件584,077.3832ms计算提速比例。
- 独立复审 `/root/engineering_queue_audit:task75-pure-expected-hoist:20261115`：PASS，unresolved=[]；绑定测试LF SHA256 `603020d5d29e8c3d66886609f2dd7e3a142321ec63bb7465c23adf575db4a77e`。

`raw-evidence.json.gz` 无损保存原始前后源码、精确diff、探针、输出与作者阶段交接；解压JSON后按每项 `base64` 解码即可恢复原字节，大小与SHA见 `manifest.json`。作者交接中的“未提交”是该阶段事实；不借归档改变原结果。

本轮只收尾此切片，不扩展优化或测试、不触发Full、不建PR或进入发布队列。TASK-75保持In Progress，稳定Full≤30分钟目标没有本轮通过证据。
