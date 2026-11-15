# PR696 分页旧合同接续

状态：定向测试通过，待本次独立复审及新提交 CI；不是产品或正式设备验收。修复工作树基点 `45008d10feb08b9c4d44ea26c1e35205583761b2`，PR 目标保持 `release/v2.0.0`。

实际失败是 [Quality 43762495111 / POSIX10](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43762495111/job/132966457131) 的 `official-choice-pagination.test.mjs` 首项：旧整张锻造与删牌布局比较仍包含原分页按钮。PC26/30 已批准复用 Deck 的 200×48 页脚，产品 `93ae7376` 及其独审证据保留；本次生产源码完全未改。

保留双卡面数量、位置、尺寸、完整 children 及 nativeTheme 整体快照；锻造和删牌分别对所有非 previous/next 字段保持完整 deepEqual。两页官方 previous/next 精确保护 `[-430,-245.4,200,48]` / `[430,-245.4,200,48]`。Default 锻造仍是 `±490,-236,56,44`，删牌侧箭头仍是 `±530,116,44,208`，另复验既有直接命中区合同。

| 本轮证据 | 结果 |
| --- | --- |
| [before.log.json](before.log.json) | 原当前 SHA 首项定向 RED，0/1。 |
| [iteration-picker-only.log.json](iteration-picker-only.log.json) | 首次只拆删牌比较，锻造整表仍 RED；1/2，不是产品新缺陷。 |
| [iteration-default-assumption.log.json](iteration-default-assumption.log.json) | 拆分锻造后新增 default 断言误用了锻造尺寸，1/2；依原 nativeTheme 与既有触点保护改正，没有改产品。 |
| [green.log.json](green.log.json) | 修复首项及原 default 命中区保护 2/2。 |
| [outer-contracts.log.json](outer-contracts.log.json) | 新旧包保全、完整当前源码/漂移、库存、硬门槛及 raw Full 合同 5/5；这是定向合同，不是执行 Full。 |
| `binding-receipt.json` | 下述绑定与完整旧包身份。 |

最外层新包 SHA256 `6e63658fe5a050f3972a90fc08d296fcd2eefaa35e1d5c1250d3effa391141ac`，26 绑定、97 不可变档案。完整旧包 `8f63e3cb7ee9b5a81139b4193589ce6f098e423d43b576d190925411681776fe` 原字节保存在 `release-picker-controls-ci-before-pagination-repair-source.json.gz`，新增独立 pin；旧 25 绑定中 24 条完整不变，只有既有 Source 合同 after 更新。全部旧 before、96 个 archive、bootstrap 10 项、历史元数据及库存均保留。

唯一新增绑定是修复的既有 `official-choice-pagination.test.mjs`，before 从实际 Release `1cc5479b` 读取，Git blob 固定 `c059649d949ead8e31665da238842ea35949a4d3`。新包 `currentTreeCommitted=false`，保留的 `currentCommit=2f522633…` 只代表历史基点，role 明确不是此次 after producer；不把未提交 after 冒充已提交源码。新 Source 合同验证完整旧包、旧绑定/元数据、actual before、当前 after 以及篡改旧包的拒绝路径。

固定 Node 24.18.0；TEMP/TMP 在根 `.artifacts/release-pc-qa-20261115/ci-owner-repair-1116/picker-temp`。命令：

```text
node --test --test-concurrency=1 --test-name-pattern="^official choice profile keeps" tests/official-choice-pagination.test.mjs
node --test --test-concurrency=1 --test-name-pattern="^(official choice profile keeps|default profile retains)" tests/official-choice-pagination.test.mjs tests/release-picker-controls.test.mjs
node --test --test-concurrency=1 --test-name-pattern="^(release picker controls CI validates|picker pagination CI repair|release picker controls raw JS and Lua inventories|release picker controls raw workflow|release picker controls raw Full inventory)" tests/release-picker-controls-source.test.mjs tests/ci-complete-calibration.test.mjs
git diff --check
```

Raw 878 JS / 1423 Lua 不变，未新增测试父文件、调整耗时、工作流、硬时限或预算。没有再次运行未变的 Host/PC19 受控整套、Fast、Full、候选写入、官方导入、ready、PC/手机或容量测试；此前 7 cases 独审证据只保原身份，不称本轮实测。私有截图仍不可访问。任务保留 In Progress、原历史 checked 和全部新 #676 未勾条件。

独立评审：`/root/pc695_ci_fixture_repair`（未参与本切片实现）完成 15 项独立检查，结论 **PASS，无阻塞发现**；完整凭据见 [review696-independent.json](review696-independent.json)。复核包括真实 1cc 前像、全部 26 当前物理绑定、97 份档案、旧包及旧断言保全、实际主题尺寸、原任务状态与 AC。没有重复上述 2/2、5/5 测试或 Host/Full。

评审冻结身份：新包 `6e63658fe5a050f3972a90fc08d296fcd2eefaa35e1d5c1250d3effa391141ac`；CI leaf（LF）`1b1751a0351a471e48df19d634a0dad2c4a44c9b797481194dc2642c776fdab2`；分页 fixture（LF）`070ca40dafd34739c920daf897035789e9147b6bdb4676895dccb2df2e4af47d`；Source 合同（LF）`57af9e5a2338b86e8392c494aee50e962a3fff8eca06871b0353ec4b7c2aad11`。

仓库 `.gitignore` 忽略裸 `*.log`，因此上表五份日志以 `.log.json` 无损封装：`content` 是原日志字节的 base64，`bytes` 与 `sha256` 对应解码后的原始字节。未修改原日志内容或增加 gitattributes。其余交付文本统一为 LF；[manifest.json](manifest.json) 按实际待提交 LF 字节记录，区别于日志内部的原始字节身份。
