# TASK-34 · fatal BGM 最小移植（2026-11-15）

## 交付状态

初始移植轮为**运行时窄切片已验证、来源门禁 BLOCKED**，下文保留当时红例及边界。随后主控将它纳入 PR #682 的受检组合，补齐精确单 UI 后继、CI 原文/发现清单和复制闭包；当前原文与来源负控已通过，独审接续见[来源合同附件](../evidence/dependency-bgm-source-contract-20261115.md)。TASK-34 保持 In Progress，AC3–6 未勾；无本轮官方候选、导入、ready、设备录像或实际听验，托管准入及合后另验。

- 工作树：`.worktrees/fatal-bgm-integration-1115`，分支 `feat/fatal-bgm-integration-1115`。
- 最新已 fetch 基线：`c2409ad750c15124b7b843c6bbfa5b222537cb75`。
- 独立代码提交：`1fdad7300a93778a4431edd7a546a28efebcae94`，仅 3 文件 / 127 行新增（生产 7 行、Node wrapper 9 行、Lua 八场景 111 行）。证据与 Backlog 另一本地提交。
- 授权来源：`158c492a3f8a6e8d3bfc85b79634b06d2f4b3056`，父提交 `e65d9b98fbec69442047650254238cd9244df805`。
- 开工时 #672 OPEN，HEAD `1f7ce04c53189db8c39b59c797a45d57a2c7bac1`，包含入口、imageModes 及六来源 CI 合同；#679 OPEN，HEAD `29b108778c4e98b24f73d98d9a316936408c387c`，base 为 `release/v2.0.0`。

## 最小代码及来源关系

只移植三个代码/测试文件：

1. `src/lua/abyss_ui.lua`：与来源相同的七行新增。fatal 时先清空发送器引用，再 `pcall` 最佳努力 STOP 一次；STOP 抛错不覆盖原诊断或清理。OnDestroy 仅清引用，不调用原生信号。普通 disable、原曲目及正常结算行为由原回归保护。
2. `tests/lua/fatal_bgm_stop.lua`：来源的八场景完整原样保留，Git blob `bc64b4bfb72ac6d5fdb4cf22c9d6899222b24da4`。
3. `tests/fatal-bgm-stop.test.mjs`：只接来源中的运行时测试及所需三个 import。来源前三个投影测试依赖未接入的历史适配 helper；本轮未声称它们通过，来源认证阻塞见下文。

本轮生产入口 Git blob `ade0429d561b58ddfc479c24d539bb289020ad85` 与 `158c492a:src/lua/abyss_ui.lua` **完全一致**；基线入口 blob 为 `27e431ab37ebb4490ec61d536a81f47b0688f076`。不是整体 cherry-pick：没有携入 TASK-76 输入、角色设计或来源提交其余 57 个文件。

## 本轮验证记录

运行时使用已有便携 Node **24.18.0**；本树执行 `npm ci --ignore-scripts`（11 包、0 vulnerabilities），`npm run build:data` / `npm run build:ui` 均退出 0。未运行全 check 或昂贵完整矩阵。

| 命令（省略 Node24 可执行文件前缀） | 真实结果 |
| --- | --- |
| `npm run test:related -- --files src/lua/abyss_ui.lua tests/fatal-bgm-stop.test.mjs tests/lua/fatal_bgm_stop.lua --plan` | `full: true`；新增测试为 unmodelled 输入。仅记录路由建议，按用户边界不执行 Full |
| 补丁前 `node --test --test-concurrency=1 tests/fatal-bgm-stop.test.mjs` | **RED**，1 fail，`fatal failure did not stop active BGM`；真实 MAP 请求后注入 viewport 错误，诊断出现但缺 STOP |
| 补丁后 `node --test --test-concurrency=1 tests/fatal-bgm-stop.test.mjs tests/native-exit-timer-regression.test.mjs tests/v25-texture-runtime.test.mjs` | **30/30 PASS**（17525ms / 8672ms / 28 项纹理测试），fatal wrapper 要求 `FATAL_BGM_STOP_PASS 8` |
| `node scripts/test-lua.mjs tests/lua/game_ui_classes_failure.lua` | **7/7 PASS**，含启动错误、永久失败、旧输入和退出回调无效；15862ms |
| `node scripts/test-lua.mjs tests/lua/native_bgm.lua` | **3/3 PASS**；192ms |
| `node scripts/test-lua.mjs tests/lua/native_bgm_host.lua` | **2/2 PASS**；8647ms |
| `node --test --test-concurrency=1 tests/native-startup-contract.test.mjs` | **1/1 PASS**；原生能力守卫及 escaped startup write 负控，3750ms |
| `git diff --check` | 退出 0；仅已有 CRLF 提示 |

八场景分别覆盖：MAP fatal 后仅一次 STOP；STOP 抛错仍保持诊断/清理且不重试；实际 BATTLE 后 fatal；false / 字符串 true / 数字 1 均不调用信号；普通 disable 不改音乐语义；活跃 owner 的 OnDestroy 仅遗忘且迟到回调不发信号。

### 保留的额外失败

- 直接运行 `tests/lua/support/native_monster_only_entry.lua` 退出 1：第 45 行要求 `actual complete drawing-enabled actor template`。同样生成输入下，把入口在内存换回 `c2409ad7` 再运行，仍退出 1 且命中同一断言；这是本轮默认生成 profile 下的**基线可复现失败**，未修改模板或断言，不计作绿色销毁证据。
- 两次 imageModes probe 的 C 盘临时目录分配，以及 native-startup 首次临时文件写入，遇到 `EPERM`。随后仅将 TEMP/TMP 指向本树已有 `build` 后通过；未提升权限或修改测试预算。

## source-epoch 明确阻塞

相同命令：

```powershell
node --test --test-concurrency=1 --test-name-pattern="combined epoch authenticates the complete current production tree" tests/integration-source-epoch.test.mjs
```

- **基线 PASS 1/1**（2948ms）；七行补丁后 **FAIL 1/1**（464ms），`tests/integration-source-epoch.test.mjs:146` 精确拒绝 `src/lua/abyss_ui.lua`。
- 原入口 SHA256：`19989127f817f2659be6a29661a916ddf04a2961f43d48a1e35367d95efd01c1`。
- 新入口 SHA256：`5ce18f5cd92624d57af9ccb522a3b1f5882f8f42b6658e0d10463b8d992a8cb8`。
- 使用旧 `config/architecture.json` source 请求 develop 投影，同时默认 reader 读取本轮新 current，原守卫拒绝：`combined linked owner identity: src/lua/abyss_ui.lua`。
- 直接把新入口交旧投影器：原样返回，linked reads **0**；没有把未知 source 当作已认证来源。

**没有刷新任何摘要、旧 witness、oracle 或 helper closure，也没有把旧source/新current混合认证为成功。** 当前 `sourceEpoch` 只认识旧入口；改一个摘要不能保存旧历史投影。进一步接线会涉及 `closeout-source-epoch.mjs`、`combined-epoch/source-epoch-runtime.mjs`、`copy-integration-source-closure.mjs` 及六来源 `integrated-ci-source` 的固定源码/发现清单，和 #672 重叠。按用户授权停在这里，不复制来源 60 文件。

### 主控最小接续建议

1. 在选定的 #672 / develop 组合上只登记本任务一个 owner 的精确 before→after 后继；完整保存旧 proof、各历史 target 和旧 CI 视图。先核对 before 仍精确匹配；#672 的入口并非上述 before。
2. 每次调用先鉴别传入 source 属于旧期还是新期，再新鲜读取并认证相应 current owner；严禁无条件逆变换 reader 或直接换预期 hash。覆盖旧source/新current、新source/旧current、热调用后入口变化、其他 owner 污染/缺失及 foreign source 零读取负控。
3. 仅为实际改动的 helper 和新增两份测试登记精确 closure / discovery 后继；保留六来源原合同的完整 bytes 与固定期望。若仍需扩张，由主控另行界定范围。
4. 定向重跑受影响来源合同、八场景与 imageModes 销毁后再独审；本轮提交不是门禁已绿的集成许可。

## #672 imageModes 只读叠加证据

`c2409ad7` 没有 imageModes，不能声称已在本分支验证该模块。使用[只读 probe](../evidence/task34-fatal-bgm-integration-20261115/image-modes-probe.mjs)在干净 #672 工作树运行，断言 HEAD 与入口均精确匹配，仅在 Lua `dofile` 边界内存叠加同七行，生成物写本树临时目录；未写 #672 文件。运行后 `git status --short` 为空。

- `native_image_modes.lua`：`NATIVE_IMAGE_MODES_PASS static=1637 templates=86 controlsAdded=0`。
- `native_image_modes_startup.lua`：`NATIVE_IMAGE_MODES_STARTUP_PASS withoutPortraitOwner=true readyBeforePublish=true freshRecycle=true cancellation=true`；原用例包含 OnDestroy 后 `modes.dead`、停更及迟到更新无写入断言。
- #672 原入口 SHA256 `e2568df161059054837ab0d8ae5ec798b234c34d524ef7efa2997c46e6bdd8c7`；内存叠加后 `8bd4ca0af49ec9cb68b8d61b2b90763ba63cb967659044dab2fb964099ec19c0`。
- 原 startup 用例关闭 BGM；这里只证明 imageModes 启动/滚动回收/取消/销毁回归在叠加后通过，不代表 #672 已接入本修复、BGM 与 imageModes 联合故障验收或真实设备听验。

复现：TEMP/TMP 指向本树 `build`，以精确 #672 树为工作目录，Node24 执行本附件 probe 的绝对路径。

## 2026-11-17：保全来源分支的原始 TASK-34 证据

固定来源 `feat/bgm-stop-followup-1115@158c492a3f8a6e8d3bfc85b79634b06d2f4b3056` 没有开放 PR，但仍有未接入本 PR 的原始资料。此准备切片仅将 [原 TASK-34 说明](TASK-34-fatal-bgm-stop-20261115.md) 和其引用的 [十份原始 gzip 日志](../evidence/task34-fatal-bgm-stop/) 按来源 Git blob、原始压缩字节接回，供现有 [#682](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/682) / TASK-34 集成线接纳。这十一份资料共 12,147 字节，此前不在 #682 的 `1996e65c5647750bc9d907be6562909135e08e3d` 中。

原说明的 `9f2f44e4` 基线、PR661/663–668 占用、3/3 与 16/16、原独审及“本轮”等措辞只代表原切片时点；旧日志中的失败和通过均原样保留，不作当前 #682 HEAD 的测试或 CI 证明。上文已记录的当前组合、source-epoch 后继接续和未验事项继续有效。本轮只核对原始字节、gzip 可读性、相对引用及变更范围，没有复跑旧矩阵、托管 CI、官方导入、ready 或设备听验。

本准备提交不改变 #682 的任何源码、测试、配置、任务状态或 AC，也不接入来源分支中的 TASK-76 输入和共享来源工具；原分支仍有这些独立工作，继续保留。原说明提及的未推送/不建 PR 是其历史记录，不授权本轮直接改 #682 来源分支或绕过正常门禁。原执行线接纳后仍需绑定新的精确 HEAD/BASE 复审并按 Required、原生队列和实际交付验证；资料已保全不代表已合入 develop，也不构成删除来源分支的许可。
