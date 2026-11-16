# PR678：小屋与稳定药水来源合流准备

状态：本地可独立复审准备切片，仍依赖未落地的 #679。未推原 PR、未恢复 Ready、未授权自动合并，未执行正式 Full 或设备验收。

## 真实身份与产品守恒

独立树 `F:\New folder\.worktrees\goal-v2-cottage-final-1116`，分支 `fix/goal-v2-cottage-final-1116`。原 #678 `3eb212bd18e3af038f65ac67ed93049af70cc78e` 与已审稳定药水 `3e96a1589435f8b06645db095775a789f24b1350` 均为真实祖先。先保全原 3eb 与旧 1d 的合流 `5c95b022`，再正常合入稳定 3e，产品检查点为 `329d13a72d3abcc8a80fe09fb4cfbd503972f08b`。没有强推、改写旧树或采用未经审查的药水现场字节。

相对稳定 3e，仅 `abyss_node_ui_events.lua` 与 `abyss_relic_pending_ui.lua` 两个产品文件不同，逐 blob 保留原已审小屋实现；五源实际 producer/parents 已从 Git 读回。药水三源逐 blob 同 3e，包含 partial Down/Up 保护。Tiny wrapper、原 Lua 入口及共享商店入口保持；没有改规则、RNG、奖励事务、触点或布局范围。

原 3eb 的六项冲突全在来源/CI helper 与消费者。先以稳定药水合同保存为明确前驱，再追加新的 `cottage-click` 外层，未用旧包冒充新组合，也未把未提交的辅助快照称为已提交 whole-current。

## 来源与历史域

- 新生产包 `tests/helpers/cottage-click-source.json.gz`：834012 字节，SHA256 `edb0c369e9230c768123999e2509402e0c508ce872b4aff87e17a94e95df9284`。before 精确来自 3e；current 两项来自真实 329d；三个继承药水源与原小屋 producer 身份保留。
- `cottageRegressionLegacy` 是 Git 中真实 `89f3d88c47b72d843db113be5a2e91896cf1f869` 的完整 352 项历史生产视图，逐项 Git blob/源码摘要审核。7eac 的两个原包另存为 `cottage-regression-legacy-{source,ci-source}.json.gz`，字节与原 Git 相同，不能作当前候选。
- 新 CI 包 `tests/helpers/cottage-click-ci-source.json.gz`：最终 170212 字节，SHA256 `aad69c2ebe301444ccf72294ffbb0a71d8a7d2ec275dab4a7bcecb48ae12d01e`。20 项完整 before/current、105 项归档；辅助快照 `currentTreeCommitted=false`，不吞掉 null/缺失输入。原始 102 项已有归档身份逐项与稳定药水/原小屋 Git 或 LFS OID 核对，未改旧包。
- owners **117→118**，仅新增 `src/lua/abyss_relic_pending_ui.lua`。旧 116/117 历史域独立保留，当前 live guard 检查全部 118 项的顺序、LF/CRLF、暖读缺失与漂移。raw **877 JS / 1424 Lua→878 / 1425**，新增项仍由完整发现与默认成本覆盖。
- 新 CI reader 与 historical reader 在实际输出历史字节前认证全部当前源和归档；暖读成功后改变其他源/归档仍拒绝。生产隔离复制只加入生产 helper/packet，不引入 CI leaf。通用 projector、原 packet、预算、workflow 与 guard 不改。

## 本轮有界验证

使用既有 Node 24.18.0；证据、复现脚本与失败日志在 [证据目录](../evidence/cottage-click-composition-20261116)。没有另跑 Full 或重复完整产品矩阵。

| 范围 | 结果与边界 |
| --- | --- |
| 新来源、CI、库存、copy 与原药水历史 | 首轮命名 9/9 PASS，145043ms；发生在新 reader 认证加强前，不能当最终性能值 |
| 新 reader 认证前置及暖读负控 | 新 historical/CI reader、稳定药水 historical 与新 CI 4/4 PASS，8858ms |
| 当前全域消费者 | 118-owner facade、StS 原始库存、完整历史/source 4/4；遗漏别名的 defect 用例修正后单独 1/1 PASS，保留此前接线失败；菜单历史消费者首次已通过，不重复运行 |
| 最终实际完整 integration 旧用例 | 1/1 PASS，**157344.9977ms**；总157652.171ms。全部原断言保留，未缓存暖授权或删除 fresh 检查 |
| 当前生产与 Git 审核 | 352 当前/352 历史绑定，五 producer/parents，118 owners，仅 pending_ui 新增；105 归档、实际完整 CI 集成读回 PASS |
| Tiny House default/official | default PASS3475ms；official 首次遇两 PNG 的 LFS pointer 环境失败，按本地对象 OID/size 还原后，仅该项复验 PASS5411ms；原失败与两输入收据保留 |
| 共享 pending writer | `shop_relics_pending_ui.lua` 9 组 PASS，6007ms，包含真实卡牌/药水文本、满槽恢复、Orrery、瓶装遗物、优先级和原界面返回 |
| 语法与字节 | 现有 `check:syntax` PASS；最后仅删除一行 EOF 空白并重采 CI。未改变产品或已测语义；最终精确字节交父独审 |

首轮两个消费者错误是新外层的 target/export 名称未同步，随后又定位 defect 的同类别名；均保留真实失败并按实际命名重验，没有以文件级零用例输出冒充通过。旧 helper gzip 与两 PNG 仅按原 OID/size 材料化供夹具读取，不进入本次源改动。

## 执行成本仍未证明达标

`integrated-ci-source.cases.mjs` 由 `tests/native-candidate-preview-mask.test.mjs:66` 导入；`scripts/ci-shards.mjs:73-75` 的正式 Node CLI 没有 JS 单文件/单用例 timeout，`tests/ci-runtime.test.mjs` 仍拒绝 `--test-timeout`。执行物理 guard 仍是 Windows 45 分钟（local-special75）与 POSIX30 分钟。

本轮157345ms没有超过这些 job 物理 guard，但不能据此断言整片通过。该正式 wrapper 在 win/linux timings 与 localLowerBounds 均无测量，仍按 `unknownJsMs=10000` 排程；仅这一原用例就证明至少低估147345ms。原排程预测及20/30分钟目标只是诊断，不是当前真实完整 job/Hosted 速度证明。本切片没有伪造 Hosted 数据、提高阈值、改 timeout、删断言或缓存授权来掩盖成本。

## 未完成条件

任务定义仍在未合 #673，当前 CLI 查询 TASK-38.5 unknown；仅通过 CLI 给父 TASK-38 追加准备说明，负责人/状态/AC 保持，不重复任务、不标 Done。须等 #679 实际落地，复核真实 Release HEAD/source，再完成独立复审和原 PR 正常准入；当前只是在明确未合依赖上准备真实组合。

没有 GIL、官方写入/读回、导入/新 ready、容量、PC 或 iPhone14Pro 结果，不授予手机四空项或正式发布通过；无 GUI、版本、Tag、master 或发布操作。现有工作树、独有成果和旧失败均保留。
