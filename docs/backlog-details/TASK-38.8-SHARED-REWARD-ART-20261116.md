# TASK-38.8：复用同源遗物图案的奖励行

## 任务与来源

按 PR #673 的 TASK-38.8 只读合同及 Owner 本轮批准实施，基于 `release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`，独立分支 `fix/mobile-blue-candle-v2-1115`。本基线无该任务，`task:pick` 返回未知任务 HOLD；不复制任务、不伪造认领或完成状态，待登记合入后由 Backlog CLI 同步。手机与官方 AC 保持未勾。

重新 fetch 后核对：PC Release PR #684 为 `d396abb252b4dcfe4d825dccc6c850daf81086c9`，原 #672 为 `1f7ce04c53189db8c39b59c797a45d57a2c7bac1`。#684 与 Release 的奖励绘制模块、图池构建器分别同为 blob `94bc42403f9cdbd37851a1c92127d78a04bb274e`、`48076b4887d7f1e2151a431ee2eb2d9530ce13d8`，均未包含 #672 的奖励遗物绘图钩子及图池。对应既有来源是 `a27449ecef1f5e02034c22e677ed9f9a9bfe86aa`；本切片只复用遗物绑定，不移植整批素材、药水图案链或其它 PC 改动。

三来源已有 `blue_candle` 七图元配方完全相同（规范 JSON SHA256 `60ac6476e0c43c1b6282e965450a7c548cf38cdfa45dbf6da0834c519d4631e7`）。`Blue Candle` 经现有 `Hooks.localId` 正确映射到 `blue_candle`；奖励到领取后持有的 ID 也一致。缺口是奖励展示装配，不是实体或规则身份错误。

## RED → GREEN

真实 GameUI/Fengari Host 的同一探针，在基线完整导入树及原奖励绘制模块上得到 RED：四个奖励状态均为 102028 fallback，领取后同 ID 的顶栏和详情使用蜡烛配方。最终实现得到 GREEN：奖励、领取后顶栏、详情均使用既有同源配方。原始输入、源码只读重放入口及日志在本树 `.artifacts/blue-candle/`，包括 `same-id-red-replay.log`、`same-id-green-replay.log`、`replay-same-id.mjs`；不是自然随机掉落概率或手机症状根因的证明。

生成树的四个状态图标逐字段相同：位置 `[-118,0]`、尺寸 `28×28`，状态容器无位移、缩放均为 `[1,1]`。将一份原生 fallback 提升至按钮 root，并添加一个同父的原 16 槽图池，删除另外三个重复 fallback。四个状态背景、文字、native preset/input 保留；root 图片位于全部状态背景上方且与文字不相交，新增图形均不参与 raycast。Art API、owner 检查、图元容量、registry、主题、效果、抽取与持有规则不改。

共享池按真实 root/icon 句柄缓存，原生 parent 没有代理或改写。图池查询缺失/抛错或被替换时，渲染器退休该行已知、仍存活且仍属该 owner 的旧图池，保证 fallback 不叠旧图案；不能写入已转属另一行的旧句柄。预审新增这条完整可见性断言时先得到 RED（`pool-fallback-red.log`），修订后同配方及换配方恢复、两行隔离与 owner 重绑负控通过。

## 验证与容量边界

- 最终 `reward-relic-shared-art`、原 `sts-reward-row` 及原 runtime 合计四项通过（7.27 秒）；覆盖同 ID 实际领取回调、四态/两行、配方替换、缓存、claimed 隐藏、叠层暂停输入/返回、unknown ID、缺配方、缺失/死/抛错图池、原生写失败恢复和回调重入。随机流快照保持；默认 profile 原展示保留。
- 最终静态门槛通过：351 模块、6168 测量、1990 架构边、原 CC15 与六条历史 Luacheck 警告基线不变。最初缓存装配导致 CC17 被拒，提取同一装配后重验通过，不放宽门槛。指引、Backlog 与 diff 检查通过。
- 完整实际生成树前后计数和 SHA256 在 [控件证据](../evidence/mobile-blue-candle-20261116/control-count.json)：主界面 `23884→23912`，独立战斗 `5827→5855`，分别净增 28；模板 `788→788`。这是两个导入树各自的计数，不能相加冒充实际装载量，也不能换算官方 MB。未采用每态各一池的 136 控件方案。
- 首次夹具把 `activeInHierarchy` 误当 `SetVisible` 的结果，随后依据现有夹具的可见父链修正；又误以为卡组叠层应隐藏战斗背景，核对真实 Host 后改为断言输入暂停。失败日志保留，不修改产品规则或旧断言。

Owner 已确认设备 iPhone 14 Pro，本轮没有操作客户端或手机。此前协调者记录的 20.1781 MB 超限证据不因净增控件优化失效；当前切片未重新测官方容量，候选、导入、ready、正式设备与发布状态仍 UNVERIFIED/NO_GO。未运行 Full、未添加 `ci:full`；独立评审和 draft PR 由协调者绑定精确 HEAD/BASE，本文不预填独审通过。
