# PC13 新增 Host 轨迹独立证据复核

结论：**PASS_SCOPED_EVIDENCE。足以支持“在该确定性、ready 最佳情形的离线路径中，#684 已消除两次页面遮幕，暂无新增死亡/奖励 delay 的依据”。不支持 PC13 产品验收、Done 或官方 ready/实机无闪屏。** 本轮只读核对，不重跑 728 帧、旧死亡测试或 Full。

## 精确来源与身份

- 输入：`pc13-settlement-intake.json/.md`、`pc13/host-settlement-trace.lua`、两份最终日志。
- Release `36b9b157ee6f05b65eb9f1da7e2978647d36c210`；实际旧树 `03beb581e0799744df90e34a81e1a730ddf2d878`。
- 比较树 `8a44cd2f1a7abb41dcf9fd8e3623f1e046aeb181`；产品冻结 `5bd55d7691480b10d00e947076e15c8870640474`。独立 `git diff --name-only 5bd..8a44 -- src scripts data` 为空。
- JSON 列的 **11 个 owner × 四身份 Git blob 全部独立读回匹配**：旧树=Release，新树=冻结。额外核 fixture 四方均为 `4bdec81ca4a2756172f83f96a81108ffd498fc52`，生产 `abyss_ui.lua` 四方均为 `27e431ab37ebb4490ec61d536a81f47b0688f076`。
- 03beb 对 Release 只有两条生产差异：Combat 分裂子怪坐标和 gesture 取消 notice 清理。场景仅健康 `acid_slime_s` 的正常卡牌末击，无分裂、取消；因此称“本场景时序等价”合理，不能称旧树整个产品等于 Release。
- 脚本 SHA256 `3d36ec1916f030038b01920c7f1b24454a8bae5b3e041023445ae7d2eac03524`；旧日志 `9b468410778d6bfb4cfa435f89113d20edb6a005c32fcdf196e21848bd2c9bca`；新日志 `ac99849aee4f5ea93b82e3df58321edba443b813132e2e161f3e8500e918a43d`。均独立重算一致。
- 原文从 `8a44cd2f:docs/qa/playtests/pc-20261115-verbatim.txt` 直接核对：15:37–15:46 是先闪页面再死亡及用户加载顺序猜测；24:57 要求初代对照；34:09/34:19 描述末击后多次添加内容闪烁。intake 概括忠实；15:52 已进入前往地图图标锯齿另一问题，不能混称本轨迹覆盖该点。未访问私人图像或原录屏。

## 逐帧与真实调用入口

脚本用真实 `host:setFastMode`、`host:start/select/confirm`、`Run.startCombat`，随后显式以 `Combat.new` 初始化固定 seed=42、单卡 bludgeon、单健康酸小怪。通过真实 `ui:playSlot(1)` 和 `ui:playSelected(1)` 执行，末击后没有手改 death/reward/phase。故为**可控初始化后的自然命令/反馈结算**，不是随机遭遇或用户实际存档复现。

采样每次在 `host:update(1/60)`→`gate.step`→必要 refresh→`gate.paint` 后进行。该核心顺序与真实 `abyss_ui.OnUpdate` 一致，但没有执行它的 presentationPage、componentBridge、v25Textures、cardArt、canvas resize 及真实 native 调度。`presentationReady` 被包装 GameUI.new 显式替换为常量 true；这是隔离发布策略的条件，绝非官方 ready。

独立解析了全部 **728 行**（旧 normal228+fast138，新 normal226+fast136）。每组从 frame -1 到末帧连续无缺口，复算结果与 intake 一致：

| 来源/档位 | 遮幕为 true 的帧 | death 开始 | actor 逻辑隐藏 | reward 挂载/无遮挡 | 开关次数 |
|---|---|---:|---:|---:|---:|
| 旧 / normal | 1、225 | 62 | 171 | 225 / 226 | 4 |
| 旧 / fast | 1、135 | 21 | 81 | 135 / 136 | 4 |
| #684 / normal | 无 | 61 | 170 | 224 / 224 | 0 |
| #684 / fast | 无 | 20 | 80 | 134 / 134 | 0 |

**4 次开关等于两次单帧遮幕脉冲，不是四次闪屏。** 旧路径首脉冲先于 death，第二脉冲在 reward 挂载帧；新路径均无。Reward 所有可见帧 busy=false、被采样怪 dying=nil；脚本另外用 `next(feedback.dying)==nil` 检查全部死亡表，不只一只怪。两份最终日志均完整到 normal/fast SUMMARY，未见断言错误。

trace 本体**没有 assert 零遮幕**，也没有内置断言精确首帧；intake 的零遮幕 RED/GREEN 是对相同脚本两份日志的比较 oracle。本次独立聚合证实该比较成立，不冒称生产测试自身先 RED 后 GREEN。reward/busy/dying 的逐帧安全断言则确实在 Lua 入口中。

## 解释、mock 和未验边界

源码因果吻合：#684 `sameBase/localFrame` 允许同一 battle 的 combat→reward 及局部奖励刷新保留底页；不再走旧的全幕两 turn 揭幕。`syncRewardOwner` 仍要求 not busy，feedback 队列仍在 victory 前等待 `pendingMonsterExit()`。1 帧差值与旧遮幕准备期间暂停 battle feedback update 的机制相符，不是人为新增/缩短死亡时钟。此场景没有奖励抢在死亡反馈前显示的证据；为修正此轨迹再插 delay 没有依据。

必须保留以下限制：

- native 控件、actor clone/destroy、颜色/位置/alpha 写入均为 Lua fixture；实际 GPU/重绘、异步 lease、资源失败与帧内中间写入不被观察。逻辑 SetVisible 与 imageColor.a 不是像素或视频证据。
- `visible` 检查自身 alive 与父链 visible，未核真实原生 activeInHierarchy、裁剪/遮挡/输入焦点/层级渲染；此夹具默认 active 条件下可以用来比较逻辑可见，不可升级为实机可见。
- readiness 固定 true，settle 为显式成功 callback；无真实 platform settlement、外部桥/音频/控制器/触屏/asset renderer。dt 固定1/60、1280×720，不含长帧、GPU负载、窗口切换或资源未ready的失败重试。
- 战斗由测试替换初始化，未验证随机入场、实际 encounter/rewards 全内容身份、初代实机节奏对照；未覆盖多敌、过量伤害、死亡触发/连锁、多段、旧事件、奖励领取/返回地图。
- 11 blob 是所列 owner 的等价证明，不是整个动态 require 依赖闭包/生成导入树的 identity receipt。新增 provenance 已补两次实际 cwd、生成选项及 runner 路径；历史生成 Theme/Layout/Templates 的逐件 SHA 未保存、临时目录已删除，仍不能独立读回当时输出字节。该限制不推翻日志与 gate 源码比较，也不构成新增产品 delay 的依据。
- 没有同一正式候选的 PC视频/action/ready、受影响手机、官方导入与容量。保留 PC13 In Progress，设备 AC 不勾；旧容量 FAIL 也不因 Host 无遮幕而解除。

本次无产品/Backlog/PR/候选修改，无新 fix。证据可挂回既有 TASK-16.1 / TASK-42。新组合和正式候选仍需各自精确源码与验收，不能套用本报告。

## provenance 补记微增审

初版保留 `review-pc13-trace.initial.md/.json`。本次只读作者新增 `pc13-settlement-intake.json::provenanceSupplement` 与 MD 补记；原 trace/两最终日志未变，未重跑。

- 作者回溯实际调用：旧 cwd `.worktrees/release-pc-battle-1115`、新 cwd `.worktrees/release-pc-closeout-1115`；固定可执行 `F:/New folder/build/tools/node-v24.18.0-win-x64/node.exe`、`--input-type=module` 的完整 stdin 已存 JSON。调用 `runIsolatedBattleRegression(trace,{officialAssets:true})`。这些是作者从实际工具调用补录的运行元数据，不是当时单独生成的封存 manifest。
- 已独立读取两记录 commit 同 blob `a816eee3dd93cca12552887f2b43ca412c169d01` 的隔离 helper：在各 cwd/build 下 mkdtemp，buildLuaData 与 buildUI 使用显式 options；wrapper 把绝对私有目录放在 package.path 最前，**先 require 全部生成 Lua，再 dofile(trace)**。因此 trace 后续 src/build 路径调整不会替换已在 package.loaded 的生成 Theme/Layout/Templates。finally 递归删除私有目录，和“无法追认过去输出”说明一致。
- 独立核两树各 9 个生成/runner 入口的记录 commit Git blob、当前 LF 规范化 SHA，共 18 组全部匹配；另核当前 Node 可执行及两份 Fengari CLI SHA 匹配。它们明确只是 **current-readback**，不能替代运行时 before/after 或历史生成输出 SHA。新树当前 HEAD 已为 `00ff9b27`，补记未伪称仍为运行时 `8a44cd2f`。
- 子进程固定 process.execPath 和 `-e dofile(wrapper)`，LUA_PATH/LUA_PATH_5_3、两 LUA_INIT 与所读 runner 合同一致。其他继承环境（包括 TMP/TEMP）当时未记录，报告如实保留 unknown；不追认外部 OS TEMP。
- 原文 `8a44cd2f` 与来源 #676 `e14e7c9bd13371319a2ea96500513b514973d287` 的逐字稿 Git blob 均为 `4c91ae24feb13adc3abdd8944537ec66e9d2cd2e`，已独立读回。
- 4 开关=2 单帧脉冲、零 cover 为日志比较 oracle 的说明已对齐。历史随机目录 suffix 与生成 Lua bytes/SHA 明确 `NOT_SAVED`，未重建冒充；这项限制永久保留到当前证据集，不要求为补 hash 重跑本轨迹。

补记消除了运行入口/选项与模块载入顺序的文档缺口，核心 `PASS_SCOPED_EVIDENCE` 与所有正式验收限制不变。
