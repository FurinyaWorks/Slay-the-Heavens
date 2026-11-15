# Release 导航切片：独立来源与 CI 合同

产品冻结点 `a9425afa50e2a1dd10e83634a3e5fc0d24633917`，Release 基线 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`；适配代码提交 `10200974517708427be5f8ae7f95ed73044da40e`，源码 tree `f97be0bae8643567da2e86ebfbdd6363a7afe734`。本片不改产品，不包含 #684/#672 的其他 after 绑定或功能，也不是官方候选、设备或发布验收。

## 精确范围

- 生产 packet 只允许 `abyss_game_ui_input`、`abyss_game_ui_navigation_view`、`abyss_game_ui_overlays` 三个导航 owner；before 与完整 Release36 前驱逐项相等，current 与冻结产品 Git blob/工作树相等，真实 producer/parents 分别记录。原352项完整前驱及其全部 targets 保留，新命名视图为 `releaseNavigationPrior`。
- 原92份 helper archive 保持原物理字节及 SHA256，既有 LFS 两对象按原 pointer OID 验证；LF/UTF-8/Git blob 认证保留。没有重写旧 gzip、before 或 source target，也没有更新旧断言、预算、timings、分片或 timeout。
- CI packet 绑定23个导航/适配输入；普通 before 为 Release36，三份 bootstrap workflow 的历史 before 明确为 `c2409ad750c15124b7b843c6bbfa5b222537cb75`。实际 Release workflow 不改，raw 当前来源与完整库存另验。CI packet 的 currentCommit 仅指产品 a942，辅助文件采集时为工作树，`currentTreeCommitted=false`。
- `release-navigation-*` helper 与 packet 独立命名。生产授权仍由完整 fresh linked-owner 闭包执行；CI 历史映射不截取该入口。旧已投影库存保持 opaque，由原完整旧层验证；raw Full 对删除全部新增、重复、缺失、foreign-only 与来源漂移均有明确负例。

| packet | 字节 | SHA256 |
|---|---:|---|
| `tests/helpers/release-navigation-source.json.gz` | 14432 | `83b69705480776eb130b3487f09af79c50625410925e76bba958644093c91f31` |
| `tests/helpers/release-navigation-ci-source.json.gz` | 147200 | `28da29c324f35d1884451672bf48df51ba405a8add44c0393b074611d652556a` |

## 独审 request_changes 与最小修正

初次适配的 raw 当前用例仅硬断言45/30分钟执行上限，原30/20分钟目标断言只在876/1423前驱上执行；当前879/1424目标只是日志。这是实际门禁缺口，初次73项通过不证明该目标约束仍覆盖当前工作量。

`1e7c1c526de68557522e237405acb6f6bf15a285` 仅新增当前 `forecast<target` 硬断言，原执行 guard、全部历史断言和预算保持。CI packet 仅更新 `ci-complete-calibration.test.mjs` 的 after 及复审身份元数据（精确 test SHA256/Git blob），其他22项、所有 before、库存、预算及92旧档案不变。初次146735字节/`7ad26184…`完整快照保存在同目录证据的 `initial-ci-source.json.gz`；恢复该单项并移除修正元数据可逐字节重构原物理 gzip。

修后只补验新鲜来源/库存负例与当前 target+guard合同 **4/4 PASS**，日志 `target-guard-incremental.log.gz`。实际旧/新注册回调分别仅将 forecast 改为 target+1：初次 guard-only 接受，修后明确拒绝，探针 **PASS**，日志 `target-guard-sensitivity.log.gz`；未改任何预算或配置。下述9/44/73结果保留初次输入身份，没有转写为修后重跑；本修正未重复73/44或产品Host。初次独审 request_changes 保留，由独立审查者针对修正另行复核。

## 本轮验证

Node v24.18.0。先通过小来源绑定，再执行完整来源与 CI 合同；没有重跑产品历史 Host，也没有运行本地全仓 Full。

| 本轮执行 | 结果 | 原始日志（同目录 `docs/evidence/release-navigation-source-20261115/`） |
|---|---|---|
| 新鲜小绑定、原 integrated 复制闭包、原4个菜单源合同 | 9/9 PASS | `source-and-menu-small.log.gz` |
| 原完整 `integration-source-epoch.test.mjs` | 44/44 PASS | `integration-source-isolated.log.gz` |
| 完整 `ci-complete-calibration.test.mjs` | 73/73 PASS | `ci-calibration-complete.log.gz` |

原菜单三份历史用例明确读取**完整原前驱**及 fresh 历史 reader，原116 owner、352项、精确 producer、原所有断言及漂移负例保持；第四份当前全集用例仍核实际导航 after。独立新鲜合同同时覆盖当前352项，不能用旧前驱通过替代当前验证。

原产品相关记录为16/20，4个源合同失败，保留 `product-related-before-source.log.gz`。上述9项包含这4个失败项的本轮通过；没有据此冒称重跑了整个20项产品矩阵。产品路由/Host/工程结果继续沿主线程各自精确证据。

临时目录均在根 `.artifacts/release-pc-navigation-source-20261115/`。原来源合同包含 cwd hardlink 负例，因此该完整44项在同字节源码/helper/fixture副本运行，使其临时目录也位于工作树外；9项小绑定与完整73项 CI 直接读取本工作树。两层均为离线合同，不是客户端或设备证据。

原库存876 JS /1423 Lua的目标断言继续通过；当前879 JS /1424 Lua预测 Windows1757923ms、POSIX1191630ms，未知成本10000ms、原1800000/1200000ms目标及2700000/1800000ms执行上限均保持。预测不等于托管执行耗时。

`git diff --check 36b9b157..10200974` 通过；适配相对产品 a942 的 src/scripts/data/config 为空 diff。与 #684 的最终组合仍须重新绑定完整 before/after 并验证，不能让两个独立 Release36 packet 互相认领重叠 owner。未生成新 GIL、未取得官方导入/ready/容量或 PC/手机验收。
