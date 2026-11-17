# #703 B9 来源 reader 接续

基线 `80114c7f466ae8a6bf03e30409a3ba5259be7d4c`，实际 Release `b9bca884ed9b9831965b409885d78f719b9a567a` 已是祖先。只修原五条 calibration 失败，不重做容量产品、不改历史断言、旧 packet/pin、预算、workflow 或任务状态/AC。

## 原因与最小差异

- `component281` 和 closeout 的历史 reader 缺少容量更新后 `art-feature-source-inverse.test.mjs` 的完整前驱投影：真实 `c4148c45…` 应进入原历史 `5ae77091…`。
- 两个旧 planning 收据首先停在 `selection_budget_loading.lua`（`88e3c25a…` → `71778ad6…`）。修正后同两原例继续暴露同次容量 fixture 修复的 `selection_portrait_preload.lua`（`bd7ce601…` → `7438617a…`）；两个完整原前驱都取自 `48ef41a5`，实际运行 Lua 不改。
- Selection 的校准入口错误地先给新 live validator 一个 B9 历史视图（bootstrap `2243a113…`）。改用已有 `integrationCapacityCiRead(raw)`，先保留容量完整当前认证，再按现有包投影 Selection 前驱。

沿原 `release-capacity-b9-ci-source.mjs` 信任叶追加一个明确五文件的完整 before/current gzip：三个既有 fixture 与两个改动 caller。旧 B9 包逐字保留。两个 caller 原前驱绑定基线801；新入口每次用同一 caller reader 重读新包和五份实际 current；warm 缺失/null/字节漂移/CRCRLF 不放行。生产 projector、实际 Lua 执行和 helper-only 生产复制不引入这份 CI 包。信任叶沿原模式排除自身，未新建通用投影框架或授权缓存。

## 本轮结果

- 原五条具名用例：**0/5 RED → 5/5 PASS**，最终 22.079s，0 skip/cancel。旧断言不改；初次修复后的3/5及preload两红原样保留。
- 相邻两个完整来源文件：**13/13 PASS**，13.617s，0 skip/cancel，包括352生产身份、两历史域、原 owner/packet 漂移、物理执行guard及真实隔离生产copy。
- `probe.mjs`：**192控制 PASS**。LF/CRLF、CRCRLF/尾字节/缺失/null/类型错误、同一 warm reader 恢复、packet漂移、wrong-before、unknown/Buffer，以及原产品/容量 owner 漂移拒绝。
- 顶层 `assertIntegratedCurrent()`、guidance、Backlog、目标diff whitespace 通过。Node v24.19.0，Linux；不代替托管钉死版本/Windows。

两个旧 LFS 来源档案最初仍为指针，模块导入失败、五用例未执行；从本地对象库按 OID/size 验证物化后才取得上述真实 RED/GREEN。物化字节不纳入提交。依赖复用既有同项目安装，无改package/lock。

日志为原始字节gzip，raw与gzip哈希/长度在 `manifest.json`；不要把不同检查点混成单轮Full。没有运行Full、推送、dispatch、评论、合并、官方导入/ready、设备/容量或发布操作。原 #703 HEAD未移动，Task111保持原状态及全部未验AC。
