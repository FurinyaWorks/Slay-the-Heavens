# PC22 基础反馈：命中到牌堆坐标交接

冻结：`1b272ab7f57f2a8bde67fe8796d3a894445ae052`，基线 `36b9b157ee6f05b65eb9f1da7e2978647d36c210`。工作树 `.worktrees/release-pc-basic-feedback-1116`。仅两个文件，生产 `abyss_card_flow.lua` 一行与新 Host 回归；没有改来源 epoch、规则、时钟、素材、busy 或输入规则。尚未推送、提 PR、合并或构建 GIL。

## 需求与缺陷边界

已读 PC 原文 36:28–37:03 与 50:13–50:35。前段明确抽牌堆→手牌、弃牌→抽牌堆/消耗与出牌命中；后段要求命中→弃牌的基本衔接，流光/灰烬是另层装饰。私图12未取得，未假称看图或 GPU 观感达标。canonical TASK-29.1 由 root 用 CLI 接续，未在此修改状态/AC。

真实 GameUI fixture 使用现有 seed=1、菜单→选旅行者/岩→node1，正常点击打击 UID5。Feedback 命中位置为 `(320,-0.6666667)`，随后同 UID 的 `play→discard` 从 `(320,47.3333333)` 起飞，发生48逻辑单位上跳。`cardFlight` 给敌方目标 `stop=Theme.space.xxl*1.5`；`enterFrame` 与飞行末段都显示 `ty-stop`，而 CardFlow.playing 只存 `ty`。本修复让后续牌堆轨迹复用已显示的接触点。

生成树中 playedCard 与 cardTrail1…10 同属 feedback 直属节点、同size，anchor/pivot/初始rotation/scale/position逐字段一致；native-candidate-preview.mjs 的默认 anchor/pivot 都是 `[.5,.5]`。实际接触scale `.4201389`（既有dissolve）与初始起飞scale `.5` 均围绕同一中心pivot，实际rotation均0，父变换完全共享；缩放差异不能产生48单位中心位移。最终 RED/ GREEN 同时检查真实 mock 控件锚点与 entry.start，未仅比较两份人工计算值。

精确 #672 HEAD `1f7ce04c53189db8c39b59c797a45d57a2c7bac1` 的 Feedback/CardFlow/CardView diff 已核：Feedback 无差异，CardFlow 仅手机pile目标适配并保留同一个 `position={flight.tx,flight.ty}` 缺口。未重复 #672、PC13/684、PC12、PC27、PC35 或 root PC04/08 的工作。

## 本轮验证

- `contact-final-exact-red.log`：最终相同回归，加载 git 原始36b9 CardFlow，原生departure锚点断言失败；同UID与完整变换观测保留。
- `contact-final-green.log`：正式 `--official-assets --native-page-lifecycle` profile 3/3，通过自然开局 strike→discard、自然 defend 无stop→discard，以及明确标注的合法受控 shockwave→exhaust（非自然奖励取得）。Host原生控件触发真实 Run.play，命令/动作音once、busy释放、事件消费、完整可变 Run 状态/RNG以及原 elapsedSeconds 按dt递增均保护。
- `probe-baseline-r2.log`：未修原基线完整自然命令轨迹，记录原UID play→discard、回合末hand→discard、十UID discard→draw。既有路径存在，不据此重新实现抽牌/洗牌；该日志不构成当前设备验收。
- `original-card-flow.log`：原 card_flow_feedback 四路径（弃牌、消耗、能力、回合弃牌/洗牌）通过；`original-flow-default.log` 原复用池/无stop兼容合同通过。
- `original-feedback-polish-default.log`：旧 feedback_polish 在其默认profile原17项全部通过。此前误用正式profile的 `original-feedback-polish.log` 有两个 `.2` action gate 旧断言失败；`official-polish-baseline.log` 用未修改36b9 CardFlow证明同样两项失败，原断言及生产时钟未动。失败记录均保留。
- `luacheck.log`：唯一生产文件0错误/0告警；使用既有Luacheck SHA256 `0f1c69c4d09f1ebb4d8df14c215e4553e2e639bd4cb7bf3c639b0daa6198317b`。
- `fast-run.log`：现有Fast路由exit0，10 JS + 37 Lua，625 integration JS + 556 Lua deferred；Full没有执行。包装器内部执行 `npm run build:data/build:ui`，违反本轮“不用npm”执行约束，事实保留；未安装/下载依赖。所有单独RED/GREEN、原回归和基线对照均用固定Node24直接执行，不能把包装器记为全程纯Node24构建。

所有日志均为 CLI/Fengari/native-control mock，非官方LuaHost、GPU、音画听验、客户端或手机证据。PC22整体仍待同一完整候选官方试玩；只关闭这一个源码可证坐标跳变，不宣称整体反馈观感验收。未使用GUI/MCP/鼠键，没有新输入窗口需求。

## 证据位置与接续

本目录 `pc22-basic-feedback/` 保存全部原始日志、探针及失败记录；`pc22-source-intake.json` 为逐文件SHA256清单。根任务可按精确提交独审后决定组合移植/来源适配，不覆盖其他工作树。原5项已勾AC与试听/本轮验收未勾状态由root保留。
