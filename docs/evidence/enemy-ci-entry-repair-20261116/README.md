# 敌人几何 CI 入口修复

接续 PR #688 精确来源 `4d40bdac703c80e51054d551f1512ff02fc0adbc`，原 Release 基线 `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。#711 接续的是出牌输入/#686，不覆盖本几何优化；本轮不混入其他 PR 的产品字节。

## 真实失败

完整 GitHub job 日志：133142669959（Advisory）、133157888132（Windows rules）、133157888110（POSIX）。原 StS 两入口本地 0/2；raw Lua 几何入口及新增的真实入口回归均复现 `full status layout must read the latest ordered list`。

StS 两处负控用历史 reader 加 raw 当前 inventory，先命中外层 enemy 完整认证；未变化的二进制读又被 `+ ''` 隐式转为字符串。现在负控明确使用原完整 StS inventory 和匹配 reader，只修改指定目标，其他字节原样返回。真实当前准入、原错误匹配、逐路径负控及 unknown 成本断言保留。

raw Lua 几何 fixture 需要完整 official theme/status layout。JS isolated wrapper 已生成该 profile，而 Advisory 的 raw 入口使用默认 theme。仅切换 profile 名不能提供真实 layout 字段，因此 Lua fixture 保持原提交逐字节不变；现有 `runLua` 的独立 official profile 准备机制新增这一条精确 repo-root fixture。保持原临时目录清理、低成本美术入口、错误传播、case selector、buffer 及实际 deadline。其他工作区的同名文件走普通 Lua 路径。

新增回归实际执行 raw 入口，检查完整 metrics/300帧 Host/Run-RNG 断言以及 shared theme 完全不变；另实测其他工作区同名脚本。原 isolated 几何回归继续执行。

## 来源与验证

独立 `enemy-post697-ci-reader-repair.json.gz` 保留 runner 与两个测试的完整 before/current、enemy/selection 两域。原 CI packet 的两行 before/views 不改；新增 runner before 固定到原提交 Git blob，两个历史域来自原真实提交。所有完整源、SHA-256 和 Git blob 逐项核验。

原 30 行 CI 记录与 100 个 archives 保留；runner 新增注册后为 31 行，原 CI packet 和本 repair packet另加入每次新鲜认证，最终 102 archives。生产 352 输入、117 owners、68 targets 和发现库存不改。

修复过程中，初次 raw 本地准备遇到未 materialize 的 PNG；运行既有 `ci-media-lfs.mjs` 后原原件校验通过。一个早期并行诊断进程加载了尚未接受合法 null 历史域的中间验证器而失败；最终验证器显式保留原 null 域，并要求 before/current 非空，完整重跑 diagnostics。该中间失败不冒充最终通过。

最终完整 StS 11/11（576798ms，4CPU共享竞争）、当前 enemy union 6/6（241164ms）、geometry 3/3、CLI continuation 6/6、完整 diagnostics 10/10、output-buffer 4/4 通过；guidance/Backlog/diff 检查通过。原始日志由合前协调者核对。本轮不执行本地 Full、远端动作、官方导入、实机或容量验收，不改变任何实际 guard 或性能预算。任务未新认领或变更；Backlog CLI 环境缺失，现有验证器照常使用。
