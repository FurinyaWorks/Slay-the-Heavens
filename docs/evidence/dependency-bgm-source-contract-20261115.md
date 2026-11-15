# 依赖机制 + 单 UI BGM 来源合同补齐（2026-11-15）

## 本轮身份与范围

- 唯一写入树：`.worktrees/dependency-intake-1115`；输入 HEAD `e5ccf067354ff8a25158302cf22e4483e550bd4c`。
- 集成基线：`c2409ad750c15124b7b843c6bbfa5b222537cb75`；保留 `5069a329` 的依赖机制和 `b0466187e2727d6b044e90c131d95154c309c55a` 的七行 BGM 修复。
- 本轮只改测试来源 helper、测试及本附件。本地提交身份以包含本附件的 Git 提交为准；未推送、创建/改动 PR、合并或修改 release、Backlog、任务正文。
- 原 153/153、BGM 30/30 及其他已过结果仍归原证据，未重复整套运行，也不冒充本轮完整验证：[依赖证据](../backlog-details/TASK-87.2-DEPENDENCY-GUARD.md)、[BGM 证据](../backlog-details/TASK-34-FATAL-BGM-INTEGRATION-20261115.md)。

## 每层为何必要

1. **完整单 owner 生产来源**：从 `158c492a3f8a6e8d3bfc85b79634b06d2f4b3056` 只复用 `fatal-bgm-e65-source.json.gz` 的完整 UI 前后字节。新 epoch 精确核对当前 session-menu/Neow 的 UI before，接在 `9783f9ed4fdf021270668b66c863b9dfeebc7150` 层之后；保留完整 `fatalBgmPrior`、所有旧 target 和其他生产输入。没有复用旧三 owner 前驱或 TASK76 两份生产输入。
2. **历史投影的精确适配**：`projectFatalBgmSource` 只匹配 UI 路径和完整 before binding（source/SHA256/Git blob），把精确 after 交给旧 epoch。原 `createSourceEpochProjector` 继续每调用鲜读完整 owner 集；额外对 UI 原始输入、采样和末尾重读做一致性校验。旧 UI 输入配新 owner、新 UI 配旧 owner、同调用双向漂移、缺失/foreign 字节均拒绝；unknown/foreign/非字符串输入不触发 owner 读取。不缓存授权。
3. **CI 完整原文后继**：原 archive 和 binding 原字节不变，新增小 packet/leaf，登记本批 22 个实际变化/新增文本源的完整 before/after、1 个来源二进制及 JS/Lua inventory 前后。原六源的全部 views 原样继承；新增 `oldSource` 保存原 current，缺少历史 view 时回到精确旧原文，不假装 raw 未变。生产源码仍直接交生产投影，不由 CI 视图拦截。
4. **复制闭包**：沿用 `copyIntegrationSourceClosure → extendIntegratedHelperClosure`，先核对原 closeout、feedback、integration 清单，再调用 `extendDependencyHelperClosure` 核对本轮 before。只有 6 项闭包增改，另派生 2 项经过 leaf 认证的 packet/leaf 传输依赖，避免自引用摘要。隔离副本 LF/CRLF、热调用修改与删除负控均通过。
5. **回归衔接**：原 runtime 旧 hash、完整旧 views 等固定断言保留在 `priorIntegratedCiProof`；另验新 current 的 `oldSource` 与复制身份。原鲜读次数只增加有针对性的 UI 末尾重读。raw 完全集合、foreign 字节与生产 owner 负控继续逐项运行。

### 实际复制闭包增改（未扩至 20+ helper）

| 路径 | 前驱来源 |
| --- | --- |
| `tests/helpers/closeout-source-epoch.mjs` | 原 integration closure.after |
| `tests/helpers/combined-epoch/source-epoch-runtime.mjs` | 原 integration closure.after |
| `tests/helpers/fatal-bgm-source-continuation.mjs` | null，新依赖 |
| `tests/helpers/fatal-bgm-source-epoch.mjs` | null，新依赖 |
| `tests/helpers/dependency-ci-source.mjs` | null，新依赖 |
| `tests/fixtures/fatal-bgm-e65-source.json.gz` | null，新依赖 |

传输依赖：`tests/helpers/dependency-ci-binding.mjs` 和 `tests/helpers/dependency-ci-source.json.gz`，均为原清单中不存在的新项；包内不存自己的 hash。

## 不可变档案与新增体积

| 文件 | 新增字节 | SHA256 |
| --- | ---: | --- |
| `tests/fixtures/fatal-bgm-e65-source.json.gz` | 5,357 | `3e560e461232785753f5a574732ec834b19c51cfd700f09cce212009dd4a22fb` |
| `tests/helpers/dependency-ci-source.json.gz` | 87,963 | `2eba2fdc1be9616bfb1a6f313f6119c0286007fa48ec5bf60f89d5c11a14df69` |

新增 gzip 合计 **93,320 字节**。原 `integrated-ci-source.json.gz` 仍为 `f0b7137f7d0462dff36b78e39a39aab8804ba9a097b1b72bdf6686cf10f15c35`；原 binding 未改。它已经包含本基线的 runtime 续接，不能使用旧 `158c492a` 上的 `813333…` 前驱。其余既有 source/before/archive 均未改写。

生产 UI 的 LF SHA256 仍为 `5ce18f5cd92624d57af9ccb522a3b1f5882f8f42b6658e0d10463b8d992a8cb8`，before 仍为 `19989127f817f2659be6a29661a916ddf04a2961f43d48a1e35367d95efd01c1`。

JS 发现集合 **876 → 879**（依赖、BGM、本轮来源回归三份测试），Lua **1423 → 1424**（BGM 八场景）。`generate-dependency-ci-source.mjs --check` 可重现完整新包与 leaf；gzip OS 头固定为原 Windows producer 的 10。

## 验证命令与结果

以下 `node` 均为既有 `F:\New folder\build\tools\node-v24.18.0-win-x64\node.exe`，未替换系统 Node。涉及临时目录的命令设置 TEMP/TMP 为本树 `build`；先执行现有 `scripts/build-lua-data.mjs` 和 `scripts/build-ui.mjs`，均退出 0。

| 命令/阶段 | pass | fail | skip | 说明 |
| --- | ---: | ---: | ---: | --- |
| 补丁前 `node --test --test-name-pattern="integration validates complete raw sources" tests/native-candidate-preview-mask.test.mjs` | 0 | 1 | 0 | 精确复现 metadata 当前原文不匹配 |
| 实现前 `node --test tests/dependency-bgm-source.test.mjs` | 0 | 3 | 0 | 当前 UI、历史投影、CI 后继三处红例；随后加入第 4 项精确 binding 负控 |
| `node --test tests/dependency-bgm-source.test.mjs tests/integration-source-epoch.test.mjs` | 48 | 0 | 0 | 本轮新增 4 项 + epoch 全部 44 项；含隔离复制、每 owner 漂移/缺失、完整 current 生产树 |
| `node --test tests/task-dependencies.test.mjs tests/backlog-roadmap.test.mjs tests/sprint-intake.test.mjs` | 80 | 0 | 0 | 只重跑相关三文件，不重跑原 153 的整套组合 |
| 最终包 `node --test tests/dependency-bgm-source.test.mjs tests/native-candidate-preview-mask.test.mjs tests/fatal-bgm-stop.test.mjs` | 20 | 0 | 1 | 含 raw 全集、CI/生产负控与 BGM `FATAL_BGM_STOP_PASS 8`；bundle 缺失导致既有真实浏览器 mask 用例 skip |
| `node tests/helpers/generate-dependency-ci-source.mjs --check` | — | 0 | — | 与最终 packet、leaf 完整字节一致，退出 0 |
| `node scripts/verify-backlog-roadmap.mjs` | — | 0 | — | 只读实际 Backlog，退出 0 |
| `git diff --check` / 提交前 `git diff --cached --check` | — | 0 | — | 检查变更及暂存内容；没有凭证/secret |

实施中保留的失败：首次实现试跑 47 项中 41 pass/6 fail，其中 4 项因新 reader 错用旧来源提交的 CI 前驱常量，2 项因 C 盘 TEMP `EPERM`；另一并行命令的 native 文件加载同样被该常量拦截，BGM 因本树尚未生成 `abyss_theme` 失败。改为本基线已有 leaf 的精确身份、设置本树 TEMP，并执行标准 data/UI 生成后全部相应用例通过；没有修改旧 archive、断言预算或跳过失败用例。最后仅排版与生成器 OS 头可重现说明变化，重生成后又执行了上表最终包 21 项。

## 本轮文件清单

修改：

- `tests/helpers/closeout-source-epoch.mjs`
- `tests/helpers/combined-epoch/source-epoch-runtime.mjs`
- `tests/helpers/integrated-ci-source.mjs`
- `tests/integrated-ci-source.cases.mjs`
- `tests/integration-source-epoch.test.mjs`

新增：

- `tests/dependency-bgm-source.test.mjs`
- `tests/fixtures/fatal-bgm-e65-source.json.gz`
- `tests/helpers/dependency-ci-binding.mjs`
- `tests/helpers/dependency-ci-source.json.gz`
- `tests/helpers/dependency-ci-source.mjs`
- `tests/helpers/fatal-bgm-source-continuation.mjs`
- `tests/helpers/fatal-bgm-source-epoch.mjs`
- `tests/helpers/generate-dependency-ci-source.mjs`
- 本附件 `docs/evidence/dependency-bgm-source-contract-20261115.md`

## 交接缺口

- 待主控对本轮提交做独立来源/跨模块复审及后续准入。本轮未调用独立 reviewer：TASK-51 明确记录免费路径限额且重置未知，没有恢复依据，未试额度或切收费模型。执行者自查不替代独审。
- 未运行全 `npm run check` 或大型 named 逆矩阵，按本轮授权保留待主控集成验证；本证据不是托管 CI 或合并许可。
- 真实浏览器 renderer bundle 缺失导致 1 个既有用例 skip；合成 SDK 及其他 mask 负控通过不能替代此项。
- 未构建/写入本轮官方候选、官方导入、真实 ready、PC/手机设备声音或画面证据；保持未验证。原 BGM 附件已记录的基线 native-monster profile 失败、imageModes 只读叠加边界仍按原记录保留，本轮不重新解释为通过。
