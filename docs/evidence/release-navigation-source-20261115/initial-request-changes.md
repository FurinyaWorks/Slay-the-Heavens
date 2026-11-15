# Release 导航来源/CI 独立审查

结论：**REQUEST_CHANGES_SCOPED**。1 项 P2；核心来源、归档保全、库存与隔离探针通过。

- Base：`a9425afa50e2a1dd10e83634a3e5fc0d24633917`
- Head：`10200974517708427be5f8ae7f95ed73044da40e`
- Tree：`f97be0bae8643567da2e86ebfbdd6363a7afe734`
- 仅证据后继：`196de2e19a802cae93746c0fa6fc8d13f637273f`。本报告不把后续集成 SHA 当作被审代码。

## NAVSRC-1：保持当前完整库存的原预测目标硬约束

位置：`tests/ci-complete-calibration.test.mjs:2025`。原菜单 current 的 `forecast<budget` 断言通过完整876JS/1423Lua前驱回放保留；新增879JS/1424Lua raw current 只断言45/30分钟 hard guard，30/20分钟 target 仅写日志。因此当前预测位于原target与guard之间时能通过。实际本轮预测Win1757923ms、POSIX1191630ms均低于原target；应新增明确 `assert(forecast<target)`，保留原guard及所有旧断言。无需放宽或改变任何预算。

## 已独立验证

- 完整读12路径diff：10份mjs及2份gzip packet，23CI完整before/current与Git源码/blob相等；3Lua owner生产者及parents匹配a942。无src/scripts/data/config修改。
- 116个前驱owner、352项完整来源、64个旧targets保留。新增releaseNavigationPrior是完整原前驱。不得据此授权未来#684重叠组合。
- 92份旧归档物理SHA256/Git字节保留，两个LFS pointer OID/size不变。新增生产归档独立命名。
- 生产warm projection后9个missing/foreign/old-owner反例均拒绝；foreign输入保持原样且不读取owner；错误前驱拒绝。CI不截取生产授权。
- 原始879JS/1424Lua库存及3JS/1Lua新增来源认证；12个库存反例拒绝。opaque历史输入由下游原完整验证器判断，raw validator拒绝foreign-only和删除全部新增。
- 真实隔离副本无需CI trust leaf可加载生产epoch；warm copy后实际改/删新helper及gzip的4个负例均拒绝。
- 独立定向7/7（新增3项+原4菜单来源），无skip；10组独立probe通过。日志、脚本和完整机器结果位于本目录。

作者9/9、44/44、73/73原始gzip日志均按receipt hash核验；原16/20及4项失败仍保留。未重复整73/44。审查探针最初因把CRLF文本按物理byte比较Git LF而失败，随后按既有LF文本合同修正；gzip始终逐byte比较。

## 验证边界

产品code由另一独审覆盖，本轮仅来源/CI适配。Hosted Full未在本轮评估；官方候选、导入、ready、容量、PC/手机均未执行。源码/离线合同通过不能授予Release准入。禁止实施、GUI/MCP和Backlog变更均遵守。

## 覆盖路径

- `tests/ci-complete-calibration.test.mjs`
- `tests/helpers/closeout-source-epoch.mjs`
- `tests/helpers/copy-integration-source-closure.mjs`
- `tests/helpers/integrated-ci-source.mjs`
- `tests/helpers/release-navigation-ci-source.json.gz`
- `tests/helpers/release-navigation-ci-source.mjs`
- `tests/helpers/release-navigation-source.json.gz`
- `tests/helpers/release-navigation-source.mjs`
- `tests/integrated-ci-source.cases.mjs`
- `tests/integration-source-epoch.test.mjs`
- `tests/release-navigation-source.test.mjs`
- `tests/session-menu-navigation.test.mjs`
