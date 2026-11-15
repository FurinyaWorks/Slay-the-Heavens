# PC18 / PC21 / PC01 独立 Release 来源与成本证据

基线 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`，冻结八 owner 产品 `df5ad3dc3b8b02e56d93a4dfe394b103dc0498e9`，冻结 raw shadow harness `c34443bcd56350fbe7a2bc9396bcdc9090d2dddb`。本层认证八个 Lua owner 和 47 个 CI 输入，不引用 PR #684 / 导航分支 / #692 的 after。最终适配代码 `e2eb0d75097be343f1e86efc4c02e5a3c8110540`，tree `613981177db2f75c38668a1ab5aed62541e02bc5`。先前六路径独审 P2 修正 `6cc75c1d…` 的原证据仍见 `metadata-review-fix.json`；最新接续见 `raw-shadow-source-continuation.json`。

生产 packet SHA256 `e52c64915c843339b2f18de6e56479d4cd7ae8b42956f2a9b18408ddb12af8ba`（54,697 B）始终不变。最终 CI packet SHA256 `29ed620cf9e562a382d50a9722397579b0c0523196a582e9a41c8a52f6ffa18f`（688,106 B）。原 92 档案物理字节、原 before、所有历史 target、库存和成本保留；三项 bootstrap workflow 仍逐路径绑定 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。源快照仍为全量，未剪裁旧视图。

| 身份 | 实际验证 | 范围 |
| --- | --- | --- |
| 初 CI `805a5c4a…` / planning `496c60d0…` | 新源/绑定/库存/成本 4/4；冻结 session 源合同 4/4；CI calibration 73/73 | 首轮收据，尚未补齐两个原物理采集缺项；不可转记为最终输入 73/73 |
| `d5eb79bf…` / CI `4c8aa230…` | 新源 4/4；raw target/guard 1/1 | 新鲜执行输入测量已补齐；其后发现 receipt 的 CRLF 检出边界 |
| `f0168055…` / CI `046fc095…` | 新源 4/4；raw target/guard 1/1 | receipt 文本 LF 认证；全面闭包补验发现 PNG 不应走文本归一 |
| `bcac5c7c…` / CI `a7c4a4d3…` | 新源/绑定/库存/成本 4/4；raw target/guard 1/1 | 新增 PNG 篡改/缺失拒绝；473 文本 LF/CRLF + 两 PNG 原字节通过；其后独审指出两个 data 说明文档不应活跃绑定 |
| `6cc75c1d…` / CI `218781a7…` | 新源 4/4；原 raw 用例 1/1；精确元数据/执行边界补验通过 | 两 MD 真实内容变化接受；真实新增 JSON/PNG/mjs 拒绝；471 活跃文本 LF/CRLF、两 PNG 原字节与单字节拒绝；版本、JSON、fixture 漂移仍拒绝 |
| 最终 `e2eb0d75…` / CI `29ed620c…` | 新源/成本/physical guards 6/6；新 raw 1/1；一次新鲜 shadow 父测 3/3 | 原冻结预算断言不动；当前预测仅提示；真实 job timeout 与独立负控硬验；新 shadow 成本仅投影其自身一条记录 |

`initial-ci-source.json.gz` 保存首轮 `805a…` 的**原 gzip 物理字节**（680,454 B），并非重建品；`initial-retirement-planning-receipt.json` 保存初 `496c…` 收据。截至 `6cc…` 的后继 CI packet 保留相同 46 路径，最新接续只新增 `scripts/test-lua.mjs` 为第 47 行，原 46 行 before、原/当前库存和 93 项档案清单不变。`source-validation.json` 与 `metadata-review-fix.json` 保留先前索引；最新精确差异见 `raw-shadow-source-continuation.json`。中间代码和 packet 原件保存在提交历史中。

退休父 JS 原 unknown 成本 10,000 ms 低于本轮真实 79,861 ms；原 placement 用真实成本反算 POSIX 1,262,824 ms，超目标 62,824 ms，诊断见 `retirement-cost-first-audit.json`。仅向既有 `jsPlanning.localLowerBounds` 追加本文件，旧条目和平台观察、unknown 默认、分片数、60 s reserve、target 与 hard guard 均未改。按现有算法重新分片后，完整 raw 881 JS / 1424 Lua 的 Windows 预测 1,762,741 ms < 1,800,000 ms，POSIX 预测 1,197,621 ms < 1,200,000 ms；原 hard guard 2,700,000 / 1,800,000 ms 同样硬断言。

原 peer 样本两新 VM 各 36 case、2/2 PASS，wall 79,861 ms / Node 79,767.5945 ms；更早不同 fixture 的 81,627 ms 样本仅留历史，不冒绑定。本轮原完整 input receipt 的 scope 未物理采集 `.release-please-manifest.json` 与 `CHANGELOG.md`，只有 Git 身份不足以追认它们运行时未改。因此只补跑一次相同两例，以 475 执行闭包（473 文本、2 PNG）和 290 安装 JS 依赖共 765 个输入前后物理快照，逐项相同。新鲜结果 2/2 PASS，wall 73,696 ms / Node 73,618.8019 ms；仍保留 79,861 ms 下限不下调。完整新样本为 `fresh-retirement.json.gz` 和 stdout/stderr 原字节 gzip。原产品样本、完整 before/after 收据与失败记录在相邻 `release-pc-item-title-shadow-20261116` 目录原样保留。

成本认证读取真实父 JS、fixture/support、生产 Lua、buildUI/buildLuaData 静态依赖与实际读取的 data/art/版本输入，以及 JS 依赖；不绑定整 HEAD、Backlog 或非执行 QA/任务文档。真实源码、fixture、数据、尾增、缺失和二进制内容漂移均拒绝，不静默回落到 10 s。文本使用 LF 合同；PNG、gzip 和原物理采样快照使用原字节哈希。`planning-lf-crlf-command-error.log.gz` 是补验命令的导入别名语法错误，已纠正；不是产品失败。早期 `planning-lf-crlf.log.gz` 是发现 PNG 混入闭包的诊断，最终有效结论以 `planning-final-text-binary.log.gz` 为准。

独审 P2 确认原 475 路径中的 `data/README.md` 与 `data/SOURCES.md` 只是采样附带说明，不是 builder 执行输入。最终 receipt 将这两项移到 `sampledMetadata`，原 765 项 before/after 物理快照、日志与 79,861 ms 下限原样保留；活跃绑定为 473 执行输入（471 文本、2 PNG）加 290 依赖，共 763 项。data 发现仅精确排除这两条已确认路径，其他新 JSON/asset/code/unknown 路径仍拒绝；实际读取的 `CHANGELOG.md` 与 `.release-please-manifest.json` 仍绑定。当前边界结论以 `planning-metadata-fixed-probes.log.gz` 为准，前文 475 闭包与早期日志均为修正前真实历史。

真实 unknown 新增负例短暂与独审 source4 并发，独审正确发现临时 JSON 并拒绝；原失败收据保留，探针已删除、两 MD 原字节恢复后通知独审单次重新核验。后续同类实际文件探针应在影子目录进行，避免共享树干扰。

raw shadow 初次发现是真实 profile 缺口：默认生成布局没有 `officialFigure`，Fengari/runLua 实际 status 为 1。shell 尾部 `Get-Content` 的 exit 0 不能当测试通过，也不能据此认定全局 runner 吞错。新增 registry 只为这两个已登记 art fixture 选择隔离 profile；原 lowcost 配置不变，shadow 额外生成本地 data、使用 `officialAssets:true`，共享生成文件只作不变性检查。后续独审将快照文件名由不存在的 `abyss_game_layout.lua` 修为真实 `abyss_ui_layout.lua`。五份原始发现/RED/green/修正重试日志均按原字节 gzip 保存；17.134 s 属旧快照输入，18.851 s 属修正输入但没有本次完整物理闭包。修正路径第一次重试的 ENOENT 是配置 TEMP 目录尚不存在，真实失败保留。

只补一次当前正确输入的父测：3/3 PASS，wall 22,235 ms / Node 22,146.1864 ms；487 执行输入、290 依赖和唯一 planning JSON 共 778 项 before/after 逐字节相同。新增 shadow 下限为 22,235 ms，不低于已观测 18,852 ms；原 retirement 79,861 ms、旧成本、原 receipt/765 物理样本、预算和分片不动。`shadow-planning-receipt.json` 认证精确脚本/fixture/build/data/art；为消除自身收据循环，仅从完整当前 planning JSON 删除 shadow 自己的新条目，再与样本原 JSON 精确比较，其他旧成本/配置仍拒绝漂移，新增 shadow 条目另有完整精确认证。

Owner 2026-11-07 的原政策见 `docs/CI.md:168`：Windows 30 / POSIX 20 分钟是性能目标，预测与 60 s reserve 只作提示，不决定准入。此前本轮新 raw 用例添加的 forecast target/guard 两个门禁属于错误，现已撤销；前文对应日志和先前审查报告仍作为历史保留，所有旧冻结预算断言保持不变。新 raw 只报告完整 881 JS / 1424 Lua 预测：Windows 1,763,488 ms、POSIX 1,198,438 ms。硬验原始 workflow 的唯一 job 属性：rules hosted 45 / local-special 75、POSIX shards 30、Fast Windows 45 / POSIX 30 分钟，并分别覆盖缺失、改值、重复、仅 step 属性和错 job 的拒绝；未修改 workflow、目标或阈值。#692 仅提供既有政策/真实基线缺口的参考，尚未被本 packet 认证，实际合入后仍需重新适配。

最终未重复整 73 / 44、产品 Host、Fast、retirement 80 s 或全仓 Full。以上是本地合同与规划预测，不是 Hosted 完成、官方 ready、同候选 PC/手机验收或官方容量许可；当前仍需真实 Hosted 证据。独立源码审查由主线程另行保存，初 REQUEST_CHANGES 不抹除；原冻结 source 失败未从产品证据中移除。
