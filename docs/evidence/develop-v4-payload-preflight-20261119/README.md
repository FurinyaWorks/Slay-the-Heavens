# 停用 V4 数据：装配前置证明（未实施裁剪）

## 结论与身份

- 基线：`develop@b1669c6db9d268f897f5380523bb82595279cdcf`，源码树 `3bb61d1a4f8e5300a729fbfbe1faafcc78726dde`。
- 生成的 `abyss_original_v4_data.lua` 为 **577,904 bytes**，SHA-256 `63e4983d6d80241f287e153087efd81e7ab287efbb15e195ef80ad90230fb2cb`。
- 未改动原 fixture 或产品源码。原 `formal_campaign_entry.lua` 正常、禁止任何 V4 数据 `require` 两组均通过各自全部 4 组原断言，V4 调用数均为 **0**。原 `full_source_campaign_entry.lua` 正常通过全部 3 组原断言，V4 调用数 **8**；相同禁载条件使它以 `V4_DATA_FORBIDDEN` 明确失败，负控有效。
- 因而此数据在本轮覆盖的正式两幕流程不被读取，但 **并非全仓无用依赖**。没有把模块从任何清单删除，也没有替换生成物或改装配合同。
- 这些是现有 capability-guarded 引擎替身下的实际 Lua/Host/Run 路径，包含受控完成房间。不是自然全程试玩，不是原神客户端、官方导入/ready、设备性能或官方容量证据。

## 范围与原负责人

原 [#743 构建交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/743#issuecomment-6999311132) 只发现数据残留，裁剪尚待验证。原构建轮次已结束，当前开放 PR 中未发现同范围裁剪成果。

本轮 `check-pr-slice --start TASK-105` 与 `--start TASK-103` 均返回 `HOLD`：already active，见 [intake.txt](intake.txt)。两任务仍是 `In Progress / @Furinya`；不重复认领、不改状态或 AC、不复制任务绕过。下一步应由原装配/容量负责人确认 native 包配方的独立切片范围。本分支只保全可复现的证明和建议，不提 PR、不更新冻结 #738、不跑 Full、不写 GIL、不操作用户 GUI。

## 可复现验证

使用基线锁文件依赖和原构建器，在独立工作树执行：

```sh
npm run build:data
npm run build:ui
node scripts/map-ui-layout.mjs
node docs/evidence/develop-v4-payload-preflight-20261119/probe.mjs
```

`probe.mjs` 不编辑 fixture 或源文件，只在每个新的 Lua 进程中计数 `require`，禁载组在准确模块名处抛错；仍由原 `runLua` 执行、沿用原默认超时。它逐一核对原成功标记、失败非零和指定错误，并验证所列源文件运行前后 SHA-256 不变。完整四组输出、身份及返回码在 [results.json](results.json)，运行时新输出写到 `build/v4-payload-preflight`，不会覆盖本证据。

| 原 fixture | V4 数据 | 结果 | 调用 |
| --- | --- | --- | --- |
| formal_campaign_entry.lua | 原数据 | PASS，4 组 | 0 |
| formal_campaign_entry.lua | require 禁载 | PASS，4 组 | 0 |
| full_source_campaign_entry.lua | 原数据 | PASS，3 组 | 8 |
| full_source_campaign_entry.lua | require 禁载 | 预期非零，V4_DATA_FORBIDDEN | 在第一次访问终止 |

这里未运行 `formal-campaign-entry.test.mjs` 的全部历史来源重放或 Full，未声称它们通过。

## 两种装配 profile 不混用

[inventory.json](inventory.json) 的本轮成功测量是普通 `buildUI()` **全部美术关闭** profile：366 模块、3,932,365 Lua bytes、14,420 控件、4 模板、卡画池 0。不是 #743 中默认 native CLI 的 4,978,988 bytes / 14,431 控件 / 6 模板结果，也不是裁剪后的结果。

本轮以 `nativeAudioBuildArgs([]).options` 复构默认 native CLI 美术 profile 时，原 `writeBackgroundModule` 正确报 `Background budget data changed`。缺少准确输入：

- `art/characters/key-visual/traveler-geo/official-landscape-v1/preview-native.png`
- Git LFS SHA-256 `e23d1daac5e7046f9119edbd6179fd16fa31abd245c24d395adfd1af31a91a43`，81,155 bytes。

已检查可见既有树，再下载 [exact b166 Quality run 44460426743](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44460426743) 的 `verified-ci-media` artifact `14499628412`（167,053,425 bytes，ZIP SHA-256 `0bec7f7642a441fcdc5e8a026814bb9fd8a753a609650892bb35d0e0af56e6d4`）；768 个成员无此 OID。没有换图、删 hash 检查、临时打开新 CI 或把另一个 profile 当作默认包通过。头像两个输入只按原 LFS OID/size 还原，未纳入本分支改动。

默认 CLI 静态复构状态仍 **BLOCKED_MISSING_LFS_INPUT**。没有批准的 base GIL/当轮工具链和官方输入，实际包写入/读回、导入/ready、PC/实体手机、官方 20 MB/3 MB、长期量产 GO 均未验证。Lua 源字节不能换算官方容量节省。

## 依赖闭包和交接建议（尚未实施）

1. 当前 `src/lua/abyss_ui.lua:233` 固定 `campaignProfile = "competition-two-act"`，`abyss_character_select.lua` 和 `abyss_run_admission.lua` 拒绝非岩旅行者。不能仅凭 `nativeUiVariables()` 的旧 `experimentalCharacters=false` 判断安全：当前正式入口已不读取该参数。
2. `abyss_original_v4_profiles.lua:22` 在真正准备 V4 角色时加载数据；`abyss_battle_render_hud.lua:159` 在 `frame.battle.originalV4` 时读取角色名。两处共享消费者必须保留给 full-source。全局删生成 owner 会破架构已知模块；加入 excluded 清单会被 `platform-load.mjs:25–26` 的真实 edge 拒绝。
3. 单在 native 清单删除也不闭合：`audit-native-candidate.mjs:166–171` 用固定候选 SHA 的生成器/manifest 重建，`:223–226` 比较完整源码字节；不能绕过 MODULE_MISSING 或降低来源断言。
4. 独立只读评审建议原 owner 评估：仅比赛版 native payload 用同名、确定性的禁用 sentinel，允许模块加载但字段读取立即明确报错；保留通用 `build:data`、全部冻结数据、full-source、共享源清单和 Lua 入口。候选 writer 与固定 SHA audit 共用同一版本的字节选择器，记录真实 payload digest/manifest/readback。若同一 SHA 有多种配方，receipt 必须明确配方，audio/BGM 派生包继续验证/保留它；不可仅靠未含模式的源输入 digest。
5. 后续实现必须保留原断言，补旧 base 全量模块正确替换、新 sentinel 篡改/错误模式拒绝、默认 Geo 两幕及 full-source 原对照、固定源码重建同字节负控。`platform-load` 要明确量的是哪种配方。未有实际 GIL 前，只能报告离线预检收益。

本轮独立评审采用真实不同会话，只读检查上述依赖与建议；具体证据文件复核另记 `review.md`。不把设计建议写为已交付修复。
