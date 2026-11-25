# Performance Baseline & Root Cause Analysis

2026-11-25 · 千星奇域《杀戮原塔2》v2.1.1 紧急性能修复

## 执行摘要

线上 v2.1.0 的标题初始化已经在 Lua 内同步解码 42 份怪物精绘数据，并反复查找同一批原生地图组。Hotfix 将每份图元推迟到首次实际读取时解码和缓存，并在地图构造期间复用已找到的分组。独立复核逐值比较了 3,385 个图元，首次需要时只解码 1 份。#954 原始 Host 的同一路径组查询由 391 降为 5，独立夹具由 392 降为 6。两种夹具均减少 386 次。被撤回的战斗手牌几何缓存在 Hotfix 中与线上源码逐字相同，敌名冗余写入的优化单独保留。 [#953](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/953) · [#954](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/954) · [#955](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/955)

这些实验解释了 Lua 开始后的部分启动成本。玩家点击后的下载、缓存、宿主资源准备、官方负载档位和实际拒绝进入事件需要实机资料。iPhone 14 Pro 未表现相同问题也缺配对数据。CPU 预算、可用内存、缓存、网络及热状态是待区分的变量。使用同一 GIL、同一原神版本和统一标记，才能判断故障发生在平台交接前、项目初始化中，还是首屏已经绘制但仍不能操作。 [官方负载功能](https://act.mihoyo.com/ys/ugc/tutorial/detail/mho2hirgodxi) · [官方存档上限示意](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho2hirgodxi/2b045943-55e2-49b0-b3a7-54ce74ffcfa0.png)

## 源码和产物身份

| 角色 | 固定身份 | 核对方式 |
| --- | --- | --- |
| v2.1.0 线上发布树 | `master` 发布提交 `eb64f4e6cd45198118e123b6640dc491f186e329` | `v2.1.0` 注释 Tag 解析为此提交 |
| v2.1.0 GIL 构建 | `55d6396cf315cf1e30085d9521fdb3bfaadeb2ad`，GIL SHA-256 `bbba3f515d3319058207b82b8c0a3ca2eb70ed55b5c338651bce94c3d78be09f` | Tag 及 #950 的构建收据。两份源码树均为 `79f1e6fce95640256bf7d4fbaa710c4a469a3b3f`，并已运行空差异核对 |
| 旧 RC 的等价移植 | `a6ab0897887c0fecf3b436f8113d8845c30e647f` | 从 master 逐一移植八个补丁，与旧 `b0963d7a` 的 Git 树完全相同 |
| 运行时评估 | `f10eefa27c75788cf0b753d5e9121e3887114218`，树 `7dbf449c16be7c6d55e15c482c988d07e1446c8d` | 额外包含 #954 的精确地图文件，保留 #953 的两个文件 |
| Linux 六档工作负载 | `b6ba4614362ba32cd38eb0b457fbf28187d0c536`，树 `c467d9ba1def0bd5627d9fe15e6e2d1272ae7a26` | 与上行生产代码相同，添加托管 Docker 配额的解析修正及验收接线 |

线上原文件没有附在历史 Release。正式发布的源码等价性由 Git 树、发布 PR 和 Tag 三者核对，线上原包 SHA-256 来自发布记录。候选比较产物分别注明采用的基础 GIL、构建工具、配置、脚本来源及 SHA-256。 [发布 PR #950](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/950) · [v2.1.0 Tag](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/v2.1.0)

## 因果证据矩阵

| 异常现象 | 直接原因 | 根本原因 | 代码或证据 | 影响和适用范围 | 修复和可信度 |
| --- | --- | --- | --- | --- | --- |
| 标题前 Lua 工作过多 | 逐份分割、转换并展开怪物数据 | 容量压缩的解码放在模块加载路径 | `scripts/monster-art.mjs`、#808、#953 与同源三臂实验 | v2.1.0 42 份同步展开。首战只用到部分资源 | #953/955 按需缓存已回接。项目侧成本 CONFIRMED |
| 地图预绑定重复查询 | 每个节点和交互绑定再次搜索分组 | 导入控件绑定未复用构造期间已找到的分组 | `src/lua/abyss_map_ui.lua`、#954、独立探针 | 组调用减少 386 次。实际 SDK 耗时需实机 | #954 仅构造期正向查找缓存。项目侧调用冗余 CONFIRMED |
| 临时战斗优化可能影响卡组 | 并行候选改变手牌几何写入策略 | 按局部战斗指标筛选时需同时观察相关页面 | `85f5c50b`、`0f755e91` 和受控卡组对照 | Hotfix 的 `abyss_battle_card_view.lua` 已恢复线上字节。#932 属于独立渐进首开方案 | 对当前候选归因于已撤回手牌缓存 RULED OUT。保留实测卡组门禁 |
| 历史清理能减少 GIL 字节但未闭合用户体验 | 保存体积、控件计数与主线程时间分别变化 | 容量门禁主要检查布局、装配和结构。早期运行时观测从项目脚本内起算 | #808、#890、TASK-100、`docs/PLATFORM_LOAD.md` | #808 完整 GIL 少 928,997 B，同时增加 eager 解码。#890 删除 1,305 个闲置子控件并减少 1,207,998 B | 按阶段配对测 CPU、内存、首帧和输入就绪。#890 对设备加载贡献 UNVERIFIED |
| 部分玩家点击后卡顿或无法进入 | 平台下载、缓存、静态负载、动态 CPU/内存、设备或项目启动皆可能 | 缺少绑定受影响设备的 T0–T3、官方面板和失败原文 | 历史 TASK-4.21、官方门禁及故障树 | 需要报障设备与 iPhone 14 Pro 的同包对照 | 玩家故障最终归因 UNVERIFIED |
| 大量测试未提前发现 | 功能、局部调用计数和离线 Host 通过后仍缺同期手机采集 | 离线、正式 GIL、平台、设备证据分散，过去有应急发布例外 | [历史验证与 5 Whys](HISTORY-AND-GOVERNANCE.md) | 旧观察器排除 `GetChild`，也合并了牌库打开和关闭 | 以现有 TASK-100、六档和 `verify:platform-load` 贯通同一候选身份。覆盖缺口 CONFIRMED |

## 官方负载与最小实机验收

1. 使用最终有声候选的 `candidate.json` 校验 `sourceCommit`、`buildId`、`candidateSha256`、`payloadDigest`，记原神版本、设备/系统、画质、自由内存、供电、热状态和实际网络。正式线上宿主装配与原 GIL 绑定历史发布收据。 [仓库现有负载合同](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/55d6396cf315cf1e30085d9521fdb3bfaadeb2ad/docs/PLATFORM_LOAD.md)
2. 报障或低资源手机与 iPhone 14 Pro，两侧各做三次冷入口和三次暖入口。录制 **T0** 点击进入奇域、**T1** `ABYSS_UI init`、**T2** `ABYSS_UI ready`、首个可见标题帧、**T3** 标题按钮点击实际被接收。无法取得的日志点保持 UNVERIFIED。保留拒绝、长等待、掉线和退出的完整原文及时间。输入、选角、首次战斗、十张手牌、连续出牌、卡组的首张与可点、切页、退出重入都在同一候选上测。
3. 编辑器对新旧包分别留关卡与服务器存档容量、负载需求档位、全局和逐区域静态计算/内存。沙箱动态检测采集客户端计算/内存、服务器处理器/内存与异常。复测战斗峰、复杂手牌、场景切换与重复进出，注明检测开销。官方编辑器截图的 20 MB/3 MB 上限分别属于关卡和服务器，历史 8.96 MB/0.01 MB 缺本次候选身份。官方指南明确存档超限禁止上传，计算与内存警告按官方来源记录。负载档位、提示和实际拒绝进入分别留证。 [官方负载功能](https://act.mihoyo.com/ys/ugc/tutorial/detail/mho2hirgodxi) · [官方存档上限示意](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho2hirgodxi/2b045943-55e2-49b0-b3a7-54ce74ffcfa0.png)
4. 保存脱敏原始记录和 SHA-256，按合同完成 `npm run verify:platform-load -- <candidate.json> <official-load.json>`，再走现有 P0 冒烟、人工发布和版本回执。现有自动化依据 Git 和离线测试判定项目回归，官方载入与发布需现场结果。

## 优先级

| 优先级 | 决策 | 收益与成本 | 验收条件 |
| --- | --- | --- | --- |
| P0 | 保留已回接的 #953 与 #954，独立保留敌名冗余写入修复 | 消除可复现的同步解码和 SDK 操作。三处改动范围小 | 同包首战、可点时间、连续出牌和卡组回归。官方设备数据单独验收 |
| P0 | 提供正式有声 CD、实机 T0–T3 与负载回执 | 解决平台/项目定位和发布归属。需要受保护的构建输入与候选准入 | 下载并校验完整 GIL 和可用于官方验收的回执。
| P1 | 扩大离线工作负载 | 在现有六档下记录首次惰性开销、十手牌和页面细分，重复测量采集开销 | 保留固定种子、工作负载哈希、不利样本及可点断言 |
| P1 | 继续独立的 #932 卡组回归 | 较快首次可见反馈可能增加整页可点等待。当前有生产源码冲突和历史回放红项 | 由原负责人在 develop 维持首框、首完整卡、全页与真正可点的独立指标。 [#932](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/932) |
| P2 | 预算优化前先拿同包静态/动态数据 | 可将存档、静态控件、运行时展开与操作延迟分别排序 | 等待真机证据后决定是否进入更大的资源改造 |

## 六张分析图及主要读数

### 1. 启动瀑布

[启动瀑布 SVG](startup/startup-waterfall.svg) · [阶段原始表](startup/waterfall.csv) · [启动实验明细](startup/STARTUP-PROFILE.md)

用相同音频诊断夹具的实际压紧 Lua、同布局和相同模板 ID，线上与 Hotfix 20 个交错冷启动配对均成功。Lua 开始到标题按钮实际可用的 P50 墙钟为 152.718 → 134.767 ms。CPU P50 为 152.716 → 134.753 ms，最大值 190.922 → 241.412 ms。初始化完成后两边均需两个模拟更新。首战就绪 CPU P50 为 32.883 → 33.401 ms，最大 45.572 → 96.997 ms。报告保留启动与首战的不利尾部。暖启动 CPU P50 8.172 → 7.525 ms，配对置信区间包含零。T0 到 T1、原生资源真实准备和首帧显示保持 UNVERIFIED。

无压缩、全量解码、按需解码的 Lua 独立模块实验各 30 次。编译并执行 CPU P50 分别为 24.58、32.24、2.79 ms，首次按需访问三份目标额外约 1.87 ms。正式压紧模块的大小从 479,858 增至 480,174 字节，标题前模块 CPU P50 从 26.17 降至 2.59 ms。容量与运行开销确实可以反向变化。源级诊断观测器自身在启动增加 33.797 ms、首战增加 17.799 ms CPU P50，主结论使用轻量计时。

### 2. 多维资源时序

[时序 SVG](runtime/resource-trace.svg) · [线上时序](runtime/resource-trace-live.svg) · [原始轨迹及复现归档](runtime/runtime-evidence.tar.gz)

原生 Lua 离线 Host 统一记录 CPU、Lua 堆、RSS、创建及销毁、SDK 操作、更新与阶段事件。冷启动 `GetChild` 5,119 → 4,733，替身控件均为 24,128；冷启动 Lua 堆采样峰值中位数 109.5 → 102.1 MiB。两侧暖开卡组计数均为 4,354 次 SDK 调用，零新增控件。GC 仅有采样间堆变化，真实 GC 停顿和原生 UI/GPU 内存未观测。计数模式在重要战斗和卡组阶段的 CPU 开销约为 1.46–2.15 倍，主耗时比较采用无计数臂。 [运行时剖析](runtime/RUNTIME-PROFILE.md)

### 3. CPU 调用树

[Lua VM 调用树 SVG](runtime/cpu-lua-call-tree.svg) · [栈原始数据与生成器](runtime/runtime-evidence.tar.gz)

每 5,000 条实际 VM 指令抓取一次 Lua 栈，覆盖冷启动、首战、十张手牌、连续出牌、卡组打开、翻页关闭。树宽代表指令样本数。连续三次出牌中 `abyss_snapshot.lua` 的 `Snapshot.capture` 占 1,390/5,057 个栈顶样本，49.0% 的栈经过战斗 `render`。十张手牌时姿态几何占 147/1,221 个栈顶。首战的单次最慢更新观察到 45.6 ms CPU。Lua 解析器、原生桥接、真实渲染和 GPU 时长需客户端捕获。 [运行时剖析](runtime/RUNTIME-PROFILE.md)

### 4. GIL 容量构成

[容量 Treemap SVG](capacity/capacity-treemap.svg) · [互斥容量记录](capacity/capacity.csv) · [字节跨度](capacity/capacity-spans.csv.gz) · [静态控件剂量曲线](capacity/dose/static-ui-dose.svg)

正式构建流程在同一个公开诊断基础 GIL 上成功完成三份带 BGM 的完整编译及读回。线上来源为 23,777,263 B，旧 RC 为 23,777,692 B，Hotfix 为 23,777,846 B，375 个 Lua 模块均已读回。Hotfix 23,777,846 B 由原生布局 18,488,972 B、模板 1,085,810 B、其余 Lua 及封装 3,343,679 B、几何 Lua 805,553 B、可分辨的 BGM 图及桥接 14,078 B、其他 39,754 B 组成。基础包内嵌音频载荷边界不可单独归因。布局含 24,127 个静态控件及 22,250 个初始隐藏控件，包括祖先隐身。16 套模板 1,392 个定义控件，不计入挂载数量。新旧原生 UI 线段完全相同。线上正式 GIL 没有原件可读回，官方存档读数与实际设备内存仍待同包验证。

使用同一诊断包只裁剪本来隐藏的完整静态子树，保持其余顶层字段一致。4×8 交错轮次中，24,127 → 3,948 个控件时，离线 Node/MCP 读回墙钟 P50 从 3,985.8 降至 720.3 ms。该实验测的是文件与原生 UI 解析，实际宿主耗时未观测。堆与 RSS 随解析器 GC 和共享宿主条件波动。 [GIL 与平台负载](capacity/PLATFORM-GIL.md) · [容量复现说明](capacity/CAPACITY-REPRODUCE.md)

### 5. 六档资源敏感度

[六档曲线 SVG](05-resource-sensitivity.svg) · [全部 36 个样本](resource-pressure.json) · [CSV](resource-pressure.csv) · [分布摘要](resource-pressure-summary.csv) · [GitHub Actions](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45526278709)

同一 GitHub Ubuntu 运行器、固定种子 1、固定镜像和工作负载哈希。每档三组正反交错配对，36/36 次 Host 流程成功，未记录 OOM。逐样本实际 CPU、内存和 swap 匹配每档，两侧限额一致。旧日常生成配置关闭正式精绘，曲线用于观察受控 Host 预算效应。精绘的启动效应使用图一。以下为 P50，表中耗时单位 ms，容器内存单位 MiB。

| 档位 | 冷 Host | 首战入口 | 战斗回合 | 卡组往返 | 容器内存峰值 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 基线 | 1,629 → 1,624 | 223 → 198 | 367 → 360 | 103 → 102 | 703 → 701 |
| 仅 CPU 0.5 核 | 5,791 → 5,777 | 1,095 → 1,091 | 1,320 → 1,323 | 383 → 379 | 646 → 638 |
| 仅内存 1 GiB | 1,733 → 1,748 | 262 → 249 | 535 → 532 | 119 → 108 | 590 → 587 |
| 2 核 / 4 GiB | 1,700 → 1,676 | 240 → 249 | 397 → 402 | 96 → 104 | 705 → 705 |
| 1 核 / 2 GiB | 3,292 → 3,288 | 524 → 501 | 720 → 675 | 182 → 199 | 608 → 605 |
| 0.5 核 / 1 GiB | 7,287 → 7,200 | 1,093 → 1,097 | 1,329 → 1,407 | 392 → 462 | 546 → 546 |

CPU 单变量下候选冷 Host 比本候选基线慢 3.56 倍。此次 1 GiB 单变量未令工作负载失败，组合限制加重启动延迟。CPU 敏感性在该离线负载更强，归因仍限测试配额。组合压力下卡组往返三组均变慢，P50 +17.7%，最大值 404.7 → 479.0 ms。六档套件的 20% 触发规则没有给出一致回归信号，但保留这三条不利样本，避免把通过率解释为无退化。原始指标有 P95/P99 字段，三点抽样只报告 P50、观察区间和最大值。

Codex 托管 Docker 实际驱动为 `none`。六档返回同一 4 核、16 GiB、默认 swap，已中止错误配对并保留原始日志。 [Codex 配额反证](codex-cgroup-preflight.json) · [无效尝试记录](codex-pressure-aborted.txt)

### 6. 故障树

[故障树 SVG](06-fault-tree.svg) · [Graphviz 源文件](fault-tree.dot) · [历史与治理分析](HISTORY-AND-GOVERNANCE.md) · [独立评审](INDEPENDENT-REVIEW.md)

项目内确认两个同步成本及一个测试覆盖缺口。平台故障、设备交互与热降频保留为 UNVERIFIED。故障树上的 RULED OUT 限定为候选源码中没有被撤回的手牌几何缓存，以及其不能解释当前候选样本。其他渲染和卡组路径保持待验。实际设备需要区分首个内容和全页可操作。#932 实验移植的 10 张牌地图场景首张卡从第 4 轮到第 2 轮，全页从第 4 轮到第 6 轮。四臂交叉试验在战斗里未复现手牌几何优化导致的一致卡组退化，不能覆盖实际玩家的长尾体验。 [卡组实验记录](runtime/RUNTIME-PROFILE.md)

## 验证和 CD 现状

核心地图、输入、渲染热路径和负对照 24/24 通过。加载两张精确 LFS 素材后，候选的地图顶栏卡组、Neow、100 次排序、过期回调和延迟牌面通过。历史冻结回放对 `abyss_card_skin` 的源码认证在 v2.1.0 与 Hotfix 都失败，定位到 #864 后相关来源漂移和 #870 后主文件失配。精绘 tier 控件数预期差一和无 layout 的精绘绘制夹具也在上线基线和新候选复现。保留原有断言，独立评审记录通过范围和待验门禁。 [独立评审](INDEPENDENT-REVIEW.md) · [测试覆盖历史](HISTORY-AND-GOVERNANCE.md)

有声流水线沿用 #917 的构建入口和固定 MCP。受保护 `develop` 承载控制面，显式选 `hotfix/v2.1.1` 和冻结的完整 SHA 构建。控制工作流、源码及基础 GIL 发放身份分别绑定，只有准确的 Full、Licenses、Production 底图审批和公开分发授权通过后才构建。流水线将 #944 的牌库绑定读回保留在最终音频回执中，使用最终 GIL 重新执行独立原生审计后归档，名称含目标版本及完整 SHA。官方负载门禁可从可移植回执重新核对当前源码及素材。 [工作流配置和正式校验](../../GIL-CANDIDATE.md) · [#944](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/944) · [#917](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/917)

公开底图完成了本地带声 GIL 的生产模式编译与 375 模块读回。可移植回执通过构建来源和 payload 检查，官方负载仍明确返回 UNVERIFIED。严格审计保持独立，初次公开夹具读回拦下三处标题文字的编码缺省字段和公开底图自带的额外服务端图。标题生成器已显式写入与编码器相同的默认值，24,127 个控件的严格相等比较复验通过。公开底图的额外图仍触发原门禁。当前 GitHub 缺少 `gil-candidate` 环境、已注册的默认分支入口及授权 Production 底图，因此正式 GitHub Actions 有声 Artifact 尚未交付。性能报告 Artifact 已实际下载并重算 SHA-256，属于另一路输出。 [容量审计资料](capacity/PLATFORM-GIL.md) · [CD 验证收据](CD-RECEIPT.md)

## 分支与版本读回

26 条初始远端分支，新增唯一规范 Hotfix 后 27 条，删除 4 条被替代的 RC／临时分支后 23 条。`master` 与 `develop` 保持现有发布和集成流程。冻结 PR、仍有有效任务的 #932、#917、#952 及独有证据分支按原负责人和退出条件保留。在同包实机验收、人工发布和发布回执完成后走原有永久 Tag、master 入库、develop 回流与 Hotfix 清理。 [逐分支读回及恢复材料](governance/FULL-INVENTORY.md)

## 复跑六档与制图

在准确的候选 `b6ba4614` 和对照 `eb64f4e6` 两个干净 worktree 中分别执行 `npm ci --ignore-scripts`、`npm run build:data` 和 `npm run build:ui`。用支持 cgroup v2 限额的 Linux Docker daemon 从候选运行。

```sh
node scripts/runtime-baseline/resource-suite.mjs --mode full --samples 3 \
  --baseline /path/to/v2.1.0-worktree --output /path/to/resource-pressure.json
python plot_pressure.py resource-pressure.json .
dot -Tsvg fault-tree.dot -o 06-fault-tree.svg
```

GitHub Actions Artifact `14983480628` 原始 ZIP SHA-256 `a79fe9675fdf080f53dd4a8bd468fbce96c9912411cdf79beb12c692a2b077e6`。仓库内 JSON 为已校验 ZIP 提取的小样本回执。源级启动、正式压紧 Lua、运行时与静态剂量的独立配置和数据均见图表链接。 [原始公开运行入口](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45526278709)

后续修复及复验见 [性能与交付修复复验](remediation/README.md)。

战斗页热修见 [意图粒子与隐藏战斗页重复提交专项](battle-ui-publication/README.md)。
