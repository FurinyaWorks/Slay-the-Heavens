# PR #703 评论 6905101000 更正证据

复核来源：[审查评论](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/703#issuecomment-6905101000)。本附件更正旧报告的适用范围及账单缺陷；旧 `task111-capacity-20261116` 目录与其 manifest 原样保留。旧 README 的“本 PR 收益”和 C4“最终”措辞只描述当时 Official 诊断，不适用于正式默认包或当前源码。

## 更正后的结论

| 配置 | 卡面宿主 | 宿主子树控件 | 已证明的收益 |
| --- | ---: | ---: | --- |
| 普通默认 UI / 候选 CLI 默认美术 | 61 | 8,892 | 默认肖像模块 971,304 → 971,304 字节，SHA256 相同，差值 0；无发版减容收益成立 |
| 历史 Official 诊断 C0/C4 | 39 | 13,958 | 仅该诊断配置减少 128,379 个实际 GIL 字节；不能用于正式默认包 |

宿主子树控件数不是全 UI 控件数，也不是官方容量。普通默认布局/模板全树为 14,421 个控件（含根）；宿主、页面排名可能重叠，不能相加。候选 CLI 默认启用菜单背景/选角/战斗立绘，不等于无参数 `build:ui` 的全 false 美术开关；本次分别记录，没有将它们相减。

`--official-assets --release-candidate` 由既有规则直接拒绝。正式默认仍装配且本 PR 保留 `selection133`；是否可裁剪尚未证明；本 PR 原条件变更不影响该默认路径。未重建默认 GIL，没有新的 GIL/RC，未取得官方 MB/导入/ready/设备证据，均 **UNVERIFIED**。历史 C4 继续只绑定 `be5466c1`，不代表此次修订后的 HEAD。

## 账单与来源修复

- 共用 `attachReadyCardHosts` 已有的直接子控件 `artPlate` 判定；同时保留 Official 的 `stsReferenceChrome`，同一节点只计一次。
- `build-ui` 写入 `assembly-profile.json`：实际 UI profile、美术开关、卡图方式、已解析静态宿主列表（规范排序，disabled/dynamic 为 []）、生命周期、角色实验/轻量/私有资产等已解析选项。该文件仅供离线账单，不在候选 Lua 白名单或 UI 注入清单。
- `packageInventory` 校验 sidecar 的结构及其美术开关与生成 Lua 一致。旧输出缺 sidecar、无效/矛盾配置一律未知，不按历史命令猜填。
- `productionCostDelta` 配置缺失/无效返回 `UNVERIFIED-configuration-unknown`，配置不同返回 `UNVERIFIED-configuration-mismatch`，均无增量排名。配置相同仍允许布局/数据变化；身份不包含布局或资产内容 hash。
- 原总量基线、20/16/3 预算和 release 证据门禁不变。新增完整来源延续包只在 CI helper 使用，保留原两个历史包的字节/hash。每个新当前源码仍须精确匹配，额外换行/畸变/缺失源码负例继续拒绝。

## 文件与复现边界

- `reproduction.json`：修复前 0 宿主误报、跨配置错误允许比较和 Official/RC 互斥的复现。
- `corrected-default-evidence.json`：默认肖像前后 hash/字节、19 项普通默认 Lua/UI 产物一致、候选 CLI 美术配置和 61 宿主/8,892 控件。原始 C0 源码与修订工作树仅用于离线生成；源码绑定见来源延续包，不伪造新 candidate 身份。
- `corrected-default-inventory.json`：候选 CLI 默认美术开关下完整离线账单，有 assemblyProfile。`releaseCandidate=false`，不是 RC。
- `measure-default.mjs.txt`：此次测量脚本原文，仅供核对；依赖本轮 work/ 中 C0 源码镜像和预先生成目录，**不是独立可运行附件**。应以 Git 中对应 sourceCommit 的生成器重放，不能替换旧镜像冒充同源。默认肖像比较不执行 GIL 写入。
- `logs/red.log.gz`：修前失败回归；`logs/targeted.log.gz`：196/196 定向通过。`logs/ui-producer.log.gz`：额外输入保护回归首次 573/575，通过者含既有卡图路径；两项输出精确清单因新增 sidecar 失败，随后把 sidecar 加入正常输出及原有全输入硬/软链接保护矩阵，没有删断言。
- `logs/static-hosts.log.gz`：独审补充的静态卡图1/2宿主拒绝比较、同宿主资产内容增长仍允许比较。
- `logs/final-reviewed-source.log.gz`：静态宿主元数据修正后的来源/配置/既有静态卡图回归，155/155。
- `logs/final-negative-source.log.gz`：新增来源逐项缺文件/畸变/额外换行负控后的最终来源/配置回归，141/141。
- `logs/daily.log.gz`：正式日常入口 build:data → build:ui → platform-load daily 通过，默认61宿主已记录；旧总量基线告警保持。
- `logs/final-source-and-input.log.gz`：修复清单后的最终来源/配置/输入保护回归；683/683 通过，0 fail/cancelled/skipped。
- `logs/engineering.log.gz`：工程检查通过，351 模块/6,165 测量/1,988 依赖边；无新增 Lua diagnostics，保留 6 个历史 warnings；M1–M4 变异被断言杀死，native UI 6/6。

定向复现使用仓库 Node24/npm 环境：

```sh
node --test tests/platform-load.test.mjs tests/platform-load-wiring.test.mjs tests/official-portraits-build.test.mjs tests/v25-portrait-profile.test.mjs tests/lumine-idle.test.mjs tests/official-assets.test.mjs tests/integration-source-epoch.test.mjs tests/sts-style-source-epoch.test.mjs tests/ci-complete-calibration.test.mjs
node --test tests/platform-load.test.mjs tests/integration-source-epoch.test.mjs tests/sts-style-source-epoch.test.mjs tests/ci-complete-calibration.test.mjs tests/build-ui-input-protection.test.mjs
npm run check:engineering
```

本地 Full 未运行，托管精确 HEAD/BASE Required/Full 未认证。没有合并、发版或操作游戏窗口。TASK-111 保持 In Progress，官方 AC 不勾。
