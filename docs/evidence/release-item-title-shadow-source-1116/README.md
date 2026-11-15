# PC18 / PC21 / PC01 独立 Release 来源与成本证据

基线 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`，冻结产品 `df5ad3dc3b8b02e56d93a4dfe394b103dc0498e9`。本层只认证该产品实际八个 Lua owner 和 46 个 CI 输入，不引用 PR #684 / 导航分支的 after。最终代码 `bcac5c7c12ae6847b0373a2675e03076ec7c358a`，tree `f0a9b0b613ea7a9576165d6d3402d79e21921bbc`；适配累计 19 路径，产品代码未修改。

生产 packet SHA256 `e52c64915c843339b2f18de6e56479d4cd7ae8b42956f2a9b18408ddb12af8ba`（54,697 B）始终不变。最终 CI packet SHA256 `a7c4a4d3e3e1cc3c0ced443c96d0f6a2afa474a1611f654dc6fcf38ce4b38578`（680,954 B）。原 92 档案物理字节、原 before、所有历史 target、库存和成本保留；三项 bootstrap workflow 仍逐路径绑定 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。源快照仍为全量，未剪裁旧视图。

| 身份 | 实际验证 | 范围 |
| --- | --- | --- |
| 初 CI `805a5c4a…` / planning `496c60d0…` | 新源/绑定/库存/成本 4/4；冻结 session 源合同 4/4；CI calibration 73/73 | 首轮收据，尚未补齐两个原物理采集缺项；不可转记为最终输入 73/73 |
| `d5eb79bf…` / CI `4c8aa230…` | 新源 4/4；raw target/guard 1/1 | 新鲜执行输入测量已补齐；其后发现 receipt 的 CRLF 检出边界 |
| `f0168055…` / CI `046fc095…` | 新源 4/4；raw target/guard 1/1 | receipt 文本 LF 认证；全面闭包补验发现 PNG 不应走文本归一 |
| 最终 `bcac5c7c…` / CI `a7c4a4d3…` | 新源/绑定/库存/成本 4/4；raw target/guard 1/1 | 新增 PNG 篡改/缺失拒绝；473 文本 LF/CRLF + 两 PNG 原字节通过；两 PNG 各单字节签名变更均拒绝 |

`initial-ci-source.json.gz` 保存首轮 `805a…` 的**原 gzip 物理字节**（680,454 B），并非重建品；`initial-retirement-planning-receipt.json` 保存初 `496c…` 收据。所有后继 CI packet 保留相同 46 路径、before、原/当前库存和 93 项档案清单。相较初 packet，仅 timing JSON、本轮 planning helper、新源 test 三行 current 发生变化。完整哈希与日志索引见 `source-validation.json`。中间代码和 packet 原件也保存在提交历史中。

退休父 JS 原 unknown 成本 10,000 ms 低于本轮真实 79,861 ms；原 placement 用真实成本反算 POSIX 1,262,824 ms，超目标 62,824 ms，诊断见 `retirement-cost-first-audit.json`。仅向既有 `jsPlanning.localLowerBounds` 追加本文件，旧条目和平台观察、unknown 默认、分片数、60 s reserve、target 与 hard guard 均未改。按现有算法重新分片后，完整 raw 881 JS / 1424 Lua 的 Windows 预测 1,762,741 ms < 1,800,000 ms，POSIX 预测 1,197,621 ms < 1,200,000 ms；原 hard guard 2,700,000 / 1,800,000 ms 同样硬断言。

原 peer 样本两新 VM 各 36 case、2/2 PASS，wall 79,861 ms / Node 79,767.5945 ms；更早不同 fixture 的 81,627 ms 样本仅留历史，不冒绑定。本轮原完整 input receipt 的 scope 未物理采集 `.release-please-manifest.json` 与 `CHANGELOG.md`，只有 Git 身份不足以追认它们运行时未改。因此只补跑一次相同两例，以 475 执行闭包（473 文本、2 PNG）和 290 安装 JS 依赖共 765 个输入前后物理快照，逐项相同。新鲜结果 2/2 PASS，wall 73,696 ms / Node 73,618.8019 ms；仍保留 79,861 ms 下限不下调。完整新样本为 `fresh-retirement.json.gz` 和 stdout/stderr 原字节 gzip。原产品样本、完整 before/after 收据与失败记录在相邻 `release-pc-item-title-shadow-20261116` 目录原样保留。

成本认证读取真实父 JS、fixture/support、生产 Lua、buildUI/buildLuaData 静态依赖与实际读取的 data/art/版本输入，以及 JS 依赖；不绑定整 HEAD、Backlog 或非执行 QA/任务文档。真实源码、fixture、数据、尾增、缺失和二进制内容漂移均拒绝，不静默回落到 10 s。文本使用 LF 合同；PNG、gzip 和原物理采样快照使用原字节哈希。`planning-lf-crlf-command-error.log.gz` 是补验命令的导入别名语法错误，已纠正；不是产品失败。早期 `planning-lf-crlf.log.gz` 是发现 PNG 混入闭包的诊断，最终有效结论以 `planning-final-text-binary.log.gz` 为准。

最终未重复整 73 / 44、产品 Host 或全仓 Full。以上是本地合同与规划预测，不是 Hosted 完成、官方 ready、同候选 PC/手机验收或官方容量许可。POSIX 仅余 2,379 ms，仍需真实 Hosted 证据。独立源码审查由主线程另行保存；原冻结 source 失败未从产品证据中移除。
