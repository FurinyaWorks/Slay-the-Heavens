# PR #738 首轮 Full 新失败的独立接续

本轮只推进 `fix/release-full-repair-20261119` 的保全候选，不更新 #738、不重复 Full、不合并或发版。起点远端 `4dd97d67883202496f7cb587002ed00f429ef699`，tree `90bff5912c6889813a1d812d73f0a1b26e078090`。此前证据保留在 [首批修复](../pr738-first-full-repair-20261119/README.md)。

## 真实失败与处置

五份原始托管日志全部属于 #738 head `36b96baa93d07cb8a357cb793ea4e8806a5aca87`、base `1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2` 的实际合成 checkout `a4f910ac8a1dad0a0ed378a684e1b3bbc60e8057`，不是本轮修正版的 CI 结果。新线索来自 [公开交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/738#issuecomment-6998241056)。

| 原作业 | 核验结果 |
| --- | --- |
| [Windows1 / 135275911527](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44439245970/job/135275911527) | `battle_ui_action_ownership.lua` 原 foreign Click → anonymous → exact ID 断言在 4dd 已 8/8，本轮不修改。前一修复已保留 foreign 后只能 exact ID 的有效释放。 |
| [POSIX11 / 135275911391](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44439245970/job/135275911391) | 原 raw HUD 测试 1/1、两项 official-assets-runtime 2/2 在 4dd 已通过，不重复改 HUD 或帮助关闭实现。 |
| [Windows7 / 135275911416](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44439245970/job/135275911416) | `drag_input_boundaries.lua:152` 为真实剩余故障。横向搓牌设置 `browsed` 但不是 `moving`，0.45 秒后被误认为静止长按并打开详情；新合法 Down 被该模态消费。仅在 `helpPointerChanged` 纳入 `help.card.browsed`，不修改指针、模态、手柄、多指或终止事件的授权。 |
| [POSIX5 / 135275911413](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44439245970/job/135275911413)、[Windows10 / 135275911578](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44439245970/job/135275911578) | StS 漂移实际上被外层拒绝，旧测试误期待 StS 内层错误。完整遍历核实三个精确接管路径：run-hud helper → potion Release、enemy-status → composite intent、official-run-chrome → settings icon。只校准精确 AssertionError 首行/层级/路径；不改来源验证器、不改任何旧来源档，不用宽泛正则或任意错误替代负控。 |

### Win7 同条件证据

- 原 #738 托管失败保留；4dd 的原拖动测试再次变红。
- 精确 Release `1ceb7c1a` 原拖动 8/8，但三点探针都看见错误详情模态。旧版本没有凭证的尾 Click 会先清模态，偶然掩盖该问题。不能据此放松新指针合同。
- 本修复三个同轨迹点均不误开详情，旧 EndDrag/Click 不出牌，新 tap(card1) → tap(playArea) 只出一张，随后旧拖动/已消费点击重放不增加格挡、不多扣能量、不结束回合。
- 保留全部原 RNG、手牌、能量、回合、边界断言。单独恢复 4dd 的 actions 模块时，新“不误弹详情”断言变红，证明新增断言确实能检测缺陷。
- 真正静止长按原 `card_help_release.lua` 4/4 仍通过，不是禁用长按解决故障。

## 来源保持与验证

只新增 `release-full-followup-source.json.gz` 与 `release-full-followup-ci.json.gz`。旧九份指针/BGM/首批修复来源档逐字不改。生产仅 `abyss_battle_actions.lua` 一条增量，保留 352 文件、129 owner、全部 87 个完整旧目标，新增第 88 个完整 4dd before。六个变更 CI 叶保留其精确 4dd Git 前像；实际历史重放仍先读取并鉴权当前生产、来源档和当前 CI 叶，text/Buffer 均不能用旧前像或漂移授权。

- 拖动 8/8、动作归属 8/8、静止长按 4/4、两项 official 离线运行时 2/2。
- StS 完整文件 11/11、0 skip；相关来源五项 5/5、0 skip；联合来源完整文件 7/7、0 skip。
- HUD 原失败单项复测 1/1；精确 StS matcher 对 61 条实际拒绝记录全部通过，错误路径和非 AssertionError 全拒。
- 静态 Quality：351 模块、6224/6224 测量，现有静态门禁通过；syntax、test-strength、guidance、Backlog、diff check 通过。
- 实际已提交源码的质量棘轮：Release 1ceb → 本修复为 10 个 Lua 变更、0 新违规；4dd 同树前身 → 本修复为 1 个 Lua 变更、0 新违规。随后只增加证据/Backlog记录，源码 blob 不变。
- [独立复审](independent-review.md) PASS：36 项真实重放漂移负控、6 项旧前像替代负控和实际复制闭包负控通过。独审未写盘原始脚本/日志，报告单列，不将实施日志冒充独审原始输出。

`logs.json` 记录各保留输入及公开 gzip 的 SHA-256；托管日志下载后规范化换行为 LF，公开版本另外只替换本机 workspace/tmp 绝对前缀。所有失败行保留，不把基线通过、局部通过或源代码推断冒充 Full 全绿。

## 仍然阻塞

原三份历史 card-input 回放的同代闭包/Intent 配对仍未解决，本轮不重做、不改旧断言/冻结档/时限。没有本修正版的 hosted Full，没有官方导入、实际 ready、PC/实体手机或同候选官方容量验收。#703/TASK-111 的真实 GIL reference/GetChild 启动修复仍独立，不能以本分支的离线通过代替。
