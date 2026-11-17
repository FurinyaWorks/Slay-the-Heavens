# PR698 本地合流准备（2026-11-16）

状态：本地定向验证完成，等待主线程对最终 HEAD / BASE / tree 独立 review。这里记录执行者自检，不冒充独立通过或发布验收。

## 身份与范围

- 工作树：`.worktrees/sprint-card-contact-integration-1116`。
- 分支：`feat/sprint-card-contact-integration-1116`。
- 原 PR698 head：`17580f25c742a7facb5626db8fc17efb4abe269b`；以它为第一父合流，保留原 head 祖先。
- 本轮 Release BASE：`33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`，包含实际合入的 PR697。
- [原 PR 本轮独占认领](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/698#issuecomment-6906796471)。开始及提交前核对远端，原 PR head 未前进。
- 相对 BASE，`src/`、`scripts/`、`data/`、`config/`、`.github/` 中只有 `src/lua/abyss_card_flow.lua` 一行产品差异：`position={flight.tx,flight.ty-(flight.stop or 0)}`。完整产品 Git blob 保持 `486b63e804f138ee7a1ba1dc8241bdf9d3b99731`。
- 原工作树、共享 Backlog 未执行写入。合流继承的 PR697 已提交 Backlog 内容属于 BASE，不是本轮修改。没有 push、ready、auto、远端 merge、关闭 PR、Tag 或发布操作。

## 八处冲突的处理

1. `tests/helpers/closeout-source-epoch.mjs`：先各自构建原 PC22 与 selection 完整 epoch，校验共同前驱与互斥 owner 后合流。352 份生产源码、117 个当前 owner；64 个原目标、两侧各一个原 prior 及两个完整 standalone reviewed 视图，共 68 目标。两个原产品 packet、producer commit 和 parents 均保持，不把旧产品提交重标成当前合流提交。
2. `tests/helpers/copy-integration-source-closure.mjs`：保留两侧 helper-copy 记录及前驱断言，合并生产 helper/packet 闭包，单独绑定新的 closeout helper。原 copy 的字节、缺失、路径/别名保护继续执行；隔离生产副本不引入 CI trust leaf。
3. `tests/helpers/integrated-ci-source.mjs`：先认证新的完整当前输入，再进入原 PC22 → bootstrap → 历史 CI 链。普通 CI reader 保持生产源码原样；只有完整 CI 验证器明确使用、且经新鲜生产 owner 认证的 historical production reader 可比较原生产记录。
4. `tests/integrated-ci-source.cases.mjs`：给既有历史合同显式接入上述 reader 和精确历史库存，保留原始未知/篡改/缺失/库存/损坏 gzip 断言。
5. `tests/ci-complete-calibration.test.mjs`：保留双方完整计算与断言，同一原循环分别执行 PC22、selection 和当前合流三个输入。当前 raw 881 JS / 1424 Lua；原 877/1424、879/1423 与 bootstrap 876/1423 分别保留。真实执行 deadline、33 个分片、unknown cost 和 reserve 均未改；预测仍只诊断。
6. `tests/integration-source-epoch.test.mjs`：两侧相同的共同前驱各自保留断言，其余 owner、copy、归档、别名边界断言保留。
7. `tests/session-menu-navigation.test.mjs`：双方共同 session 前驱相同；从新鲜认证的合流当前树取得其原完整视图，保留所有运行时及历史断言。
8. `tests/sts-style-source-epoch.test.mjs`：保留完整原库存及每个缺口/字节篡改断言；新增层只负责把合流输入认证到原历史边界。

另给两侧 `release-*-source.test.mjs` 显式接入各自完整 standalone 视图；所有旧断言和循环保留。新增 `release-card-contact-integration.test.mjs` 独立约束真实当前生产树、全部 owner、完整双方档案与 raw 库存，避免历史回放冒充当前验证。

没有重写任何旧 gzip、旧证据或原两侧 CI/生产 trust leaf。新 `release-card-contact-integration.json` 只记录当前输入摘要，复用旧完整 packet；新 CI helper 固定其 LF 身份。生成摘要使用现有 `collect-release-pc-source.mjs` 的 hash/库存收集方式，仅输出 apply_patch，不回写历史 packet。

## 本轮验证

本机 Node `v22.22.1`，独立树执行 `npm ci --ignore-scripts`、`npm run build:data`、`npm run build:ui`。以下为定向检查，未运行 `npm run check` 或 Hosted Full。

| 范围 | 结果 | 本地原始回执 |
| --- | --- | --- |
| 新合流合同（生产/owner/CI/库存） | 4/4；最后 CI 与 raw 库存再验 2/2 | `.artifacts/validation/source-joint-final.json`、`joint-ci-final.json` |
| 完整 calibration 文件 | 修后 76/76，0 skip | `.artifacts/validation/calibration-green.json` |
| 两侧完整 standalone 来源合同 | 15/15，0 skip | `.artifacts/validation/standalone-final.json` |
| integrated CI/bootstrap 合同 | 3/3，0 skip | `.artifacts/validation/integrated-ci-final.json` |
| 完整 STS 来源合同 | 11/11，0 skip | `.artifacts/validation/style-final.json` |
| session/menu 完整文件 | 7/7，0 skip | `.artifacts/validation/session.json` |
| Defect/formation 前驱与当前 owner 受影响合同 | 3/3，0 skip | `.artifacts/validation/owner-current.json` |
| CI workflow/publisher/quick-feedback 小合同 | 46/46，0 skip | `.artifacts/validation/ci-seams.json` |
| PR697 选角层/地图返回真实生成 Host 合同 | 5/5，含 Lua 3 场景 | `.artifacts/validation/selection-controls.json` |
| 原 integration-source-epoch 完整文件 | 首轮 44/44；后续未修改该合同逻辑 | 本会话工具原输出；未另存原始回执 |
| PC22 当前真实 Lua 出牌接触 | 3/3 | `.artifacts/validation/pc22-contact-final.json` |
| 既有 CardFlow / CardFlow feedback / polish | 均 exit 0；feedback 4 场景、polish 17 场景 | 本会话工具原输出；未另存原始回执 |

Lua 接触测试执行真实 Run/Feedback/CardFlow + mock 原生 Host，核对同 UID 的命中/入堆中心、父层、pivot、规则事件和 RNG；不是官方客户端、GPU、设备、形状或 scale 连续性的验收。

精确最终提交的离线冷 Git pack 使用已有 `.artifacts/release-pc-qa-20261115/cold-release-pack.mjs`（仓库根目录现有工具），comparison BASE 使用本轮 33d71575，原 `checkHostedCheckout` 128 MiB guard 保留。输出保存在本工作树 `.artifacts/cold-final/`，以回执的精确 `sha` / `bytes` / `limit` 为准；它不是网络流量、Hosted CI 或官方容量。

上述 `.artifacts/validation/` 与冷检出回执为本轮独立工作树中的本地附件，供主线程读取；不冒充已经远端上传的证据。

## 失败与纠偏保留

- 首次新合流检查遇到本轮 helper 局部变量重复声明（SyntaxError）；改为局部函数作用域后通过。
- 首轮来源组合 70 项为 65 PASS / 5 FAIL：两侧旧 CI validator / priorInventory 的默认 reader 仍读 raw 当前输入；另有 null reader 返回值被提前解码。显式传各自 reader 并保留非文本值后逐项通过。原断言、预算未放宽。
- 一次多 Lua 文件调用不符合原 CLI 的单脚本语法，打印 Usage；随后按原单脚本入口执行，未称该调用通过。
- 一次 120 秒工具外层调用未完成全部串行文件，已输出的 Defect 14 项通过不能代表全部通过；随后只补跑受影响 owner 合同与完整 session，未修改仓库测试预算。
- 完整 calibration 首轮 66 PASS / 10 FAIL，统一暴露“CI reader 投影生产源码后交给要求 raw joint owner 的 sourceSlice”边界错误。原失败完整保留于 `.artifacts/validation/calibration.json`。将普通 CI reader 与明确历史生产 reader 分开，完整文件重跑 76/76。
- 分开 reader 后，历史 `assertIntegratedCurrent` 的显式生产比较还需使用历史生产 reader，STS 来源合同出现 1 FAIL（`.artifacts/validation/source-reader-green.json`，文件名不是通过声明）。修正该唯一读点后完整 STS 11/11、integrated 3/3、两侧 standalone 15/15 通过。

## 主线程独立 review 接续

最终 HEAD、双父、BASE 和 tree 以 Git 与外部精确提交回执为准。请独立审查：共同前驱/三 owner 合流、两个原 packet 的完整身份、CI 与生产授权边界、原循环/断言保留、881/1424 raw 库存、新旧 copy 闭包及 128 MiB 冷检出证据。原两侧历史独审继续保留，但不算本轮合流的独立批准。

本地提交供 review；Hosted CI、正式同候选导入/new ready、PC/手机、音效听验、官方容量均未在本轮取得。
