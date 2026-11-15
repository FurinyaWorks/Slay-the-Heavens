# Release CI：#692 与 #684 的三处冲突预演

精确输入：Release `36b9b157ee6f05b65eb9f1da7e2978647d36c210`，#692 `b67226945c2be47c8fff31f1362412b973f68875`，#684 `00ff9b272625942a4d1f22085722142baac9ee2f`。原生 `git merge-tree --write-tree <PC> <bootstrap>` 的三处文本冲突为 `tests/ci-complete-calibration.test.mjs`、`tests/helpers/integrated-ci-source.mjs` 和 `tests/integrated-ci-source.cases.mjs`；直接择一会丢失另一方的来源和实际执行检查。

隔离候选使用独立的 CI-only 外层；先校验最终、真实字节及 95 份不变档案，再分别提供两条精确历史视图。52 个绑定文件，真实发现清单仍为 887 个 JS / 1431 个 Lua；当前执行 guard 保留 #684 较严格的物理检查，不把历史投影当当前证据。两份原始源包、产品源码和 workflows 不改。外层试验包 SHA256 `701665c217a582af74f3ce182f5262fafa22f1832fb7fc60c830add07931be99`，仅作诊断，不在本分支上传或绑定为可发布的当前头。

定向结果：PC 绑定及原始发现 **2/2**；共同 cases 首轮 **3/4**，缺少隔离物化的两个普通根文件，其唯一失败单独补回精确头来源后 **1/1**。包含两个真实历史视图、变更/缺失/foreign 键负对照、copy closure，保留生产 owner 可见。参见[定向日志](ci-union-1914.log)。

这不是 Full CI、合并准入或产品状态。接续顺序：等 #692 独立评审和精确 Required 状态完成，再在已准入的真实 Release 基线实际合入 / 重新生成最终外层，并一次吸收 #684 后续诊断补丁；不能复用测试合成 SHA，也不能放松分支规则或仅据这组局部绿合并。#690 另有整合作用域，不包含在本预演。
