# PR688：实际 Release 合流及 R688-1 历史入口认证

本轮只接续原 #688，不引入药水、其它产品 PR 或未来功能；未推送、改 PR 元数据、准入、Full 或设备执行。

## 合流事实

独立树 `F:\New folder\.worktrees\goal-v2-enemy-geometry-final-1116`，分支 `fix/goal-v2-enemy-geometry-final-1116`。原头 `2c038f8dac2b707eecd0366437552f97a16f4e9d` 正常合入实际 Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`，得到双父 merge `d19b3d9cacc5397f0880a9435cc18c1f6095883e`。

Git 已证实原 b672 是 2c 的真实祖先，`tree(b672)=tree(1cc)=b5ec29f2b7718b0d4b6564afea03144a3f14a81e`。三项内容冲突是 `ci-complete-calibration.test.mjs`、`helpers/integrated-ci-source.mjs`、`integrated-ci-source.cases.mjs`：其原 2c 版本已在完整 b672 内容之上加入 geometry 来源、显式 bootstrap 旧库存及当前 raw 合同。逐项保留这三项已审接续后，`tree(d19)=tree(2c)=90c864fd6442eb9bf2a31abccade73e12e7c9e31`。这是完整基线和结果树等价证明，未盲选一侧，也未仅因 base 名称不同新增 packet。

原 `src/lua` 完整树仍为 `d7aa27edc0e9ba478e8d597aa8f4b58a13f052ce`，与原 61bdf 产品相同。三个 runtime、isolated helper、metrics JS/Lua、生产 helper/packet 和复制闭包逐 blob 保持。因此原 7/7 来源及 Node24 metrics 一次 1/1、10.60 秒证据保留其检查点身份；本轮不重复未变产品矩阵，也不改写旧 Node22 审查身份。

## R688-1 最小修复

原 `enemyGeometryCiRead` 可以在其他声明内当前源缺失时仍返回旧 CI 字节。精确 d19 helper/packet 的声明内 `enemy_view` 缺失反例取得真实 RED。首次探针选成未声明 `unit_view`，旧/新实现都未拒绝；该无效探针保留但不计有效 RED 或修复证明。

- 公共 `enemyGeometryCiSource` 保留前三参数，仅追加可选 raw reader。只有当前字节精确命中且实际产生不同历史输出时，先以同一个 reader 认证全部当前 binding 和 archive，再返回历史字节。
- `enemyGeometryCiRead` 使用上述同口入口，null/undefined 原值保留；unknown、已历史及 raw production 保持原边界。没有暖授权缓存。
- `enemyGeometryPriorInventory` 只有实际 current→prior 分支新增相同完整认证；既有完整 prior/更旧历史仍原样。
- `integratedSource` 末尾追加相同可选 reader，`integratedRead` 转发它。原缺失转发使 `custom` 缺 `battle_targeting` 仍发生转换；精确新增反例 RED 后，missing/null/drift 暖注入与恢复 GREEN。
- `enemyGeometryCiCheckedSource` 继续作为显式完整 validator 内的纯字节比较器。全仓仅一处实际调用：`helpers/integrated-ci-source.mjs` 的 `assertIntegratedCurrent`，在 `assertEnemyGeometryCiCurrent(read)` 之后，使用相同 `read(path,'utf8')`。本轮审计列出该调用边界，不把它作为公开已认证历史入口。

## 补齐原遗漏的 live guard

原 2c 的七项局部来源验证没有覆盖三个实际当前消费者；本轮精准取得 **RED3→GREEN3**。保留 `preEnemyGeometrySourceEpoch` 的完整 116-owner 历史断言，再要求当前117=prior116+`src/lua/abyss_battle_targeting.lua`，保留逐117 owner、LF/CRLF、暖缺失/漂移及读取顺序。StS 先检查实际 raw **877 JS / 1424 Lua**，再经已 fresh 认证的 geometry 库存入口恢复旧 **876 / 1423** 合同；当前新增文件仍由完整发现与漂移负控检查。

上述 116→117 和 876/1423→877/1424 属原 geometry 产品切片。相对原 2c，本轮没有再新增生产 owner 或发现入口，没有把全部历史116改成117，也没有删旧断言求绿。

## 当前包、验证与边界

只更新现有 active `enemy-geometry-ci-source.json.gz`：原13项保留真实 before；更新 integrated helper/cases 的当前绑定，并为三个实际修改的 live 消费者补齐真实 b672 before/current，最终 **16 bindings / 94 archives**。生产包不改，原93前驱归档与第94个 geometry 生产包全字节保持。原 active 包 SHA256 `04848f5f8d39bdd8dc2f1aa9b9eb605982aa5f3025710dd91b16836d4d8e2475` 留在 d19 Git 对象中，不伪造新的旧历史；辅助 current 快照仍明确 `currentTreeCommitted=false`。

原始日志、collector、Git/producer 审计与当前包摘要在 [本轮证据目录](../evidence/enemy-geometry-actual-release-20261116)。

| 必要验证 | 本轮结果 |
| --- | --- |
| Reader 暖认证 | 有效 RED1→GREEN1，19627ms；当时声明13 bindings/94 archives，全类 missing/null/drift 及恢复、raw/历史/null/Buffer 边界；后续 Read 仅委托同口 Source，不重复该矩阵 |
| 公共 Source、current 库存 | RED2→GREEN2，18908ms /19834ms；全部声明项/归档暖负控，JS/Lua 正向及 prior 边界 |
| 集成 reader/source 同口转发 | RED1→GREEN1，417ms；先确认当前 corpus 健康，再验证 injected owner 缺失/null/漂移与恢复、Buffer 类型 |
| live owner 与库存消费者 | RED3→GREEN3，总30823ms；当前117完整 warm/LF/CRLF、116历史域及 raw/旧库存边界 |
| 最终读回与语法 | 352当前生产、原产品/helper、active真实before/current、旧档案及唯一 private 调用边界逐项审计；改动 JS `node --check`；最终摘要见收据 |

所有结果是离线源码、Git 与 Host 合同证据；非正式 Required、组合 Full、官方容量或设备性能。新 warm 用例有真实本地成本，不用旧库存预测冒充新的完整 Hosted 时长；原分片/默认成本、45/30分钟物理 job guard 与原 Lua 超时保持。没有增加 `ci:full`、手动重派或新框架。

TASK-4.21 仍 In Progress/Medium/Furinya；仅 CLI 追加本轮技术状态，手机 AC3 不勾、不 Done。正式更新原 PR、独立复审、Required 与正常 Release 合流由协调者接续。无 GIL、官方导入/ready、iPhone14Pro、GUI、master、版本、Tag 或发布操作。
