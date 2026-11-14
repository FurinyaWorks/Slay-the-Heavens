# TASK-74.22 已有实现核对

结论：当前 `origin/develop@9f2f44e4` 已包含本任务要求的增量复杂度规则，不再实现第二套门禁。Backlog正文“尚未实施”的描述早于实际交付。任务按AC4的“已有覆盖则合并追踪，不重复实施”承接PR #616的原实现与最终PR #634集成。

本轮只在 `feat/new-complexity-debt` 保存核对证据，没有改产品Lua、检测器、阈值、基线、工作流或CI作业，没有推送/合并/触发CI。

## 已交付的规则与身份

实际入口为 `scripts/check-quality-ratchet.mjs`，规则在 `quality-ratchet-policy.mjs`，AST身份复用 `lua-quality-metrics.mjs` 可选字段。旧 `check:lua-static` 专项仍保留。

| 要求 | 已有行为 |
| --- | --- |
| 真正新增函数、匿名嵌套、初始化块 | CC≤15；旧热点不变/下降可过，继续增长拒绝 |
| 旧职责匹配 | 同文件、已匹配父函数内context与fingerprint，旧额度一对一消费；唯一上下文才允许编辑后继承 |
| 重复、匿名、注册参数 | 未变内容优先，重复数量不增长；事件目标/参数/表/分支归属分开，不能用序号借旧债 |
| 移动、改名、改变归属 | 现行已审核合同保守视新身份，须≤15；不静默做语义等价推断，也不修改此已有规则 |
| 生成文件 | 已提交 `src/lua/**/*.lua` 与手写Lua同规则；未提交build输出不参与精确提交校验 |
| 来源、缺测、工具失败 | 两侧完整源码和候选配置来自精确Git对象；缺基线/缺测量/链接条目/工具身份错误拒绝，不读取旧build报告放行 |
| CI接线 | 现有Fast Linux与Full Windows首片调用同入口；没有增加新扫描器、依赖、job |

该规则也包含增量模块长度和SCC约束，但本次不扩张或重做这些既有范围。默认全库量测保持原合同；可选身份不会改变原有oracle。

## 本轮真实正反对照

现有 `tests/quality-ratchet-policy.test.mjs` 完整18条通过，0失败/跳过，26,608.0782ms。覆盖真实Git替换攻击、匿名前插/额度盗用、注册目标与参数、歧义、嵌套owner、文件移动、已提交生成文件、历史热点不增和完整SCC。

另外复制当前346模块及原配置到独立临时Git库，用固定Luacheck1.2.0重演原Issue的CC17案例。每个候选有真实独立提交，两个检测器都读取相应源码，未修改主任务树的生产文件。

| 案例 | 旧专项static退出码 | 已有增量ratchet退出码 |
| --- | ---: | ---: |
| 未治理treasure新增具名CC17 | 0 | 1，明确CC new→17超过15 |
| 未治理treasure新增匿名CC17 | 0 | 1，明确拒绝 |
| 已治理actor_presence新增CC17 | 1 | 1，原专项门槛保持 |
| 新嵌套匿名CC17 | 未重复运行 | 1 |
| 初始化块CC17 | 未重复运行 | 1 |
| 新具名CC15 | 未重复运行 | 0 |

这些是证明旧专项覆盖边界和已有增量规则已补齐的对照，不是本轮新实现的RED→GREEN。现行增量CLI在六个样本中约2.16–3.78秒，含两侧完整Git读源/依赖图和改动文件AST+Luacheck；原有开销，不是本轮新增扫描成本或性能改善。

原始输出及精确候选/工具源码hash见 `docs/evidence/task74-22-recheck-20261114/probe.json`。`probe-source.txt` 是原在 `build/recheck-new-debt.mjs` 执行的脚本，可在已备固定工具的新独立树复制到该位置复现；它要求全新 `build/task74-22-recheck/fixture`，不覆盖旧证据。该探针不是新的生产检测器或CI入口。

## 已有实际Full证据

[PR #634](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/634) 于2026-11-12 13:40:52 UTC合并，实际squash为 `903bf2a31e91f10fb24763ab4cea23d586d0bb83`。

- 该实际SHA的[合后Quality push run 43229600772](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43229600772)，attempt1，completed/success；38项作业，37 success，仅Full未选的fast skipped。18项Windows rules、15项POSIX分片、presentation/聚合作业成功；rules (1/18)的增量ratchet步骤明确success。
- 同SHA的[Licenses push run 43229601462](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43229601462) completed/success。
- 另读回该SHA的[Quality merge_group run 43219327412](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43219327412) completed/success。本记录不把其元数据当作完整队列收据验证器的替代。

`903bf2a3` 至当前核对基线 `9f2f44e4` 的增量CLI、policy、AST身份测量器、18条合同文件与Quality workflow五文件逐字无差异。原已交付规则的Full与本轮本地复验分别记录，不声称新文档分支已跑Hosted Full，也不拿历史绿灯为新增未验代码背书。

作业详情已保存 `docs/evidence/task74-22-recheck-20261114/historical-full-jobs.json`。原身份与独审来源继续沿[11/11收口](M7-QUALITY-RATCHET-CLOSEOUT-20261111.md)及其归档证据；本轮证据仍需独立复核。GitHub返回的canonical地址目前为 `Slay-the-Heavens`，旧 `Slay-the-Abyss` API只读地址重定向成功，未改远程配置或发布保护。

本任务是工程规则，不包含官方导入/设备体验或发布许可。收口应关联已有交付及本轮证据，而非复制新任务或再加同功能门禁。
