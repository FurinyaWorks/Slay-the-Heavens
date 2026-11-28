# v2.3.0 进阶难度的开局、种子与平台存档契约

本契约落实已批准的 REASONS Canvas，供 T01、T04、T05、T06 接续。仓库核对基线为 `32a15219aecd145c59cb1b2fcf477e5556766e5d`。本次平台核对使用千星 MCP 自有 Fork `783bff0cf7cb424ca271f6c04fe3802cbc8f67c9`。[仓库基线](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/32a15219aecd145c59cb1b2fcf477e5556766e5d) · [MCP 基线](https://github.com/FurinyaWorks/genshin-miliastra-mcp/tree/783bff0cf7cb424ca271f6c04fe3802cbc8f67c9)

## 开局与复现

- `data.rules.ascensionEnabled` 默认 `false`。规则关闭时保留既有 `Run.new(data, seed, options)` 入口及行为，不设置新增运行字段。开启时第四参 `runConfig` 可选，接受 `ascension` 与 `seedSource`。`run.ascension`、`run.seedSource` 与既有 `run.runSeed` 属于同一局，开局后固定。`seedSource` 的值为 `random`、`player`、`internal`。普通运行入口使用 `random`，玩家手工种子使用 `player`，内部显式注入使用 `internal`。确认入口可选接收 `{ascension, seed}`；未接权威进度前限 A0，之后由应用层根据该角色的已解锁上限准入。UI 只传选择。
- `abyss_run_seed.normalize` 接受规范化有符号 64 位十进制字符串和安全整数，结果为字符串。玩家输入、显示、分享与解析以字符串传递，覆盖 `-9223372036854775808`、`0`、`9223372036854775807`，拒绝非法或越界输入。`run.seed` 是现有战斗/遭遇的可变随机状态，`run.runSeed` 才是本局种子。正常随机继续使用 `abyss_new_run_seed` 的现有时钟与局序号入口；旧内部显式入口保留接受开局后递增的行为。玩家种子每次按原值开局。未确认、取消、输入编辑、展示、动画与日志不消耗业务 RNG。保留地图、遭遇、卡牌、事件、遗物、宝箱及商店各自的流归属。
- 同版本复现还要求角色、难度、战役/内容配置、相关初始状态与有效操作序列一致。可改变结果的初始状态包括 `abyss_neow_history` 的分角色上局 Boss 条件、`run.bossHistory`（若接入会影响换幕 Boss 初始化）、`abyss_ending_history`/战役入口及实际生效的内容可用性。当前生产宿主未向 `GameUI` 提供 `readNeowHistory` 或 `readEndingHistory/writeEndingHistory`，两幕入口的 Neow 会读取本会话结果并在首次缺历史时走 `fresh-start`。验收夹具显式设置相关状态，日志记录版本、角色、难度、种子、来源和解锁结果。分享界面给出版本、角色、难度与种子。固定种子的硬性回归比较业务结果，不承诺跨版本一致。

实现落点见 `abyss_run_initialization.lua`（运行所有权）、`abyss_game_ui_run.lua`（种子来源、开局及历史）、`abyss_run_transition.lua`（换幕与 Boss 初始化）和 `abyss_run_seed.lua`（有符号 64 位校验）。

## 玩家输入

官方客户端控件 API 将 `TextBoxControl` 用于显示，文档列出数字、减号及退格的 `KeyEventType` 和光标监听，未列出自由文本输入、IME 或剪贴板接口。T04 使用现有按钮和显示控件组成轻量十进制输入，符号和退格支持完整种子范围。PC 可沿现有按键事件入口添加快捷输入，触屏点击覆盖完整流程。PC 与手机在同一候选上验证边界输入、取消、再次输入及显示往返，另比较掺入仅 UI 操作的回放与基线。[官方客户端控件 API](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhtakr07vej4) · [归档 API](https://github.com/FurinyaWorks/genshin-miliastra-mcp/blob/783bff0cf7cb424ca271f6c04fe3802cbc8f67c9/knowledge/official/guide/mhtakr07vej4.md)

## 平台存档与 T05 交接

官方局内存档模板将配置结构体映射为玩家实体的同名自定义变量，进入时在实体创建前恢复，离开时平台保存此时的变量值。节点图使用自定义变量读写节点。发布后保留模板、结构体与既有成员身份，按官方支持的增量方式新增成员或结构体。列表有固定容量，超长会在保存时截断。玩家进度应复用 TASK-53 的唯一版本化存档及迁移机制。现有 `abyss_snapshot` 的用途是同局内的内存状态保护；原生宿主 `abyss_ui.lua` 已有 `game.ServerSignal` 到 `scripts/settlement-graph.mjs` 的桥接路径，T05 与 TASK-53 共用平台节点图及必要的 Lua 与节点图桥接。[官方局内存档指南](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhzcw29qjjma) · [现有平台信号与变量证据](https://github.com/FurinyaWorks/genshin-miliastra-mcp/blob/783bff0cf7cb424ca271f6c04fe3802cbc8f67c9/knowledge/notes/client-lua.zh-CN.md)

- [#1081](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/1081) 记录 Owner 已达到 Lv.4，并恢复 TASK-53 与 TASK-45 原编号；它是 Backlog PR，截至本次核对仍开放。T05 对接 TASK-53 的正式读写与迁移。TASK-45 原生成就的实际注册资格由其任务核验。玩家显式种子局的正式成就资格需在应用入口统一隔离，既有原生成就入口接入时沿用该来源判定。
- 进度使用稳定角色 ID，区分最高解锁与最高通关。新玩家可选 A0，无通关记录。旧档没有对应历史字段时维持无记录；非法值或读取失败显式记录并经正常加载路径恢复。仅新创建的正常随机局在正式二幕胜利且挑战局开局时该角色的最高已解锁难度时才可推进，A14 封顶。服务器侧以 `max` 合并已达绝对进度，重复或延迟的同局结算不得再跨档。正式胜利请求需绑定同一局及其开始时的解锁状态，不能仅凭种子去重。失败保留待重试目标，错误与确认状态应在日志可见。
- 节点图写入/读回与平台确已跨实例保存是不同阶段。只有重进后首次读回才证明持久化。已存在 Win/Lose 信号仅用于结算，当前生产宿主未配跨局存档读写。待真实适配验证时确认能在正常离场前完成节点图写入；在异常断开及进程回收条件下分别记录真实结果。

## 已有平台证据与待验

存档工具链已有国服 7.2 独立实验的官方导入、首次保存、空模板开关和单 `token=0` 整数结构体/槽位保存样本，并有 `scene_apply_save_config` 对已观察布局的副本读回证明。使用原实验目录与其固定样本，先在独立关卡确认当前账号权限、测试候选和变量读写，然后正常退出，重新进入同一关卡的新实例，在写之前回读同一玩家的数据。再验证旧档增量、写失败重试、重复结算和容量限制。证据记录候选哈希、客户端版本、玩家及关卡的稳定标识、前后实例标识、写入和首次读值。试玩临时数据单独标记来源。[原生存档实验记录](https://github.com/FurinyaWorks/genshin-miliastra-mcp/blob/783bff0cf7cb424ca271f6c04fe3802cbc8f67c9/knowledge/notes/native-persistence-integration.zh-CN.md) · [固定探针](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/tree/985346b545beba4a65e50c8b36aa6f858bc8b2eb/experiments/native-persistence-probe)

本轮云环境为 Linux，未连接仓库规约指定的 Windows 国服官方客户端及千星沙箱，也未取得用户桌面当轮输入窗口。T05 的正式跨实例运行验收与 T04 的官方 PC/手机输入验收保持开放。T01–T03 可以按同一契约先开发和进行定向测试。T06 在同一 v2.3.0 候选上复核真实输入、存档、两幕胜利与发布门禁。
