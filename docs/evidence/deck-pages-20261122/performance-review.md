# 牌库分页独立性能审查

对照分支为 `develop@00229683d0d38660c98ced2f4a41e89d84fc5e4e`。主计时 V3 为 `98ddec927b8ea2003cd6e7421142f9699e4a9c7d`。随后 `320da829651613feeb465c26173efdb5e17409e1` 把 CardSkin 发现函数拆分，原生路径计数在三次复审中一致。主计时快照在报告目录 `v3/snapshot/` 固定源码清单、工作差异和生成物摘要。布局 SHA-256 为 `d167b82ff5f1d8929350c12da78962ea0a3a9db60d350752e33862ef91c5f967`，模板 SHA-256 为 `7d9e2d4f0b9f0afbce5dcbf8f2b686df6813530ffc2d935e1370b316f656cdf7`。测试构建使用 approved official refined profile，`nativePageLifecycle=true`，`cards=false`，`monsters=true`，`menuBackground=false`，`selectionAvatar=true`，`battlePortrait=true`。Host 直接运行实际游戏 Lua 和替身控件，采用仓库已有牌堆 benchmark 的直接开局方式。场景省略开场流程，保留牌库分页和就绪逻辑。

## 组合试验

1280×720，Linux x64 AMD EPYC 9V74，LuaTeX 1.18，Node 24，手动送入 1/60 秒 tick。LuaTeX 的 `os.clock` 连续采样最小进位约 0.001 ms。记录 CPU 执行时间与调度轮数。输入回调结束只表示脚本提交过反馈，ready 只表示替身的当前页已经可操作。当前校验无法取得真实显示、FPS、官方客户端耗时、客户端原生内存或真实触摸和手柄延迟。

正式计时分六个独立进程 session，每 session 互换 A/B 顺序、每侧每场景六次新 Host。表中为 P50/P95/max，单位毫秒。长期资源检查另以 20 个循环执行。全量计数覆盖 0/1/7/10/11/20/75/250 张，手柄和键鼠各八种。计时关闭原生方法计数。每批在内存计完后输出原始记录。

| 场景 | 基线 | V3 |
| --- | ---: | ---: |
| 20 张手柄，首开回调 | 10.96 / 13.94 / 14.16 | 1.82 / 3.14 / 4.31 |
| 20 张手柄，首开 ready CPU | 10.96 / 13.94 / 14.16 | 11.31 / 28.65 / 38.50 |
| 20 张手柄，翻页 ready CPU | 3.96 / 4.82 / 20.79 | 4.64 / 12.83 / 22.20 |
| 20 张手柄，排序 ready CPU | 3.68 / 4.94 / 6.29 | 2.55 / 4.84 / 6.10 |
| 20 张手柄，关闭 | 4.10 / 6.69 / 10.89 | 4.36 / 6.72 / 7.98 |
| 20 张手柄，暖开 ready CPU | 4.43 / 17.27 / 28.26 | 2.88 / 4.85 / 11.15 |
| 20 张手柄，静置 120 update 总 CPU | 27.70 / 117.05 / 137.06 | 5.72 / 9.13 / 9.70 |
| 75 张键鼠，首开回调 | 15.18 / 38.11 / 54.16 | 1.77 / 2.30 / 2.75 |
| 75 张键鼠，首开 ready CPU | 15.19 / 38.11 / 54.16 | 9.49 / 12.96 / 18.06 |
| 75 张键鼠，翻页 ready CPU | 无同路径 | 1.66 / 2.64 / 2.65 |
| 75 张键鼠，排序 ready CPU | 3.59 / 6.34 / 17.43 | 1.99 / 3.28 / 7.69 |
| 75 张键鼠，关闭 | 4.63 / 7.86 / 16.58 | 3.78 / 10.08 / 20.52 |
| 75 张键鼠，暖开 ready CPU | 5.35 / 8.84 / 13.79 | 2.61 / 12.04 / 12.16 |
| 75 张键鼠，静置 120 update 总 CPU | 30.27 / 64.54 / 87.99 | 5.66 / 14.93 / 24.25 |

手柄首开总 CPU 中位数变化很小。V3 使输入回调更快结束，同时增加了首次交互前的替身调度轮数。手柄首开 0→4/7/9 轮，键鼠 0→3/4/5 轮。20 张手柄的冷开 ready 和翻页 ready CPU 尾部在主计时中上升。关闭样本波动较大。36 次采样的 P95 对一两个慢样本敏感。更早的同模板快照手柄冷开 ready P95 为 31.49→25.76 ms，说明尾部在 session 间变化明显。控制器首开回调、暖态复用和静置的方向证据更直接。320da829 的定向计数复审在 `v3/final-runtime-smoke.tsv`，其中一条首开 ready 为 97.06 CPU ms，保留在原始记录。

方法观测器独立交错 18 次。带方法计数的手柄首开中位数从 12.04 升到 13.30 ms，本文主计时使用无调用计数臂。计数仍用于结构归因。所有分布、帧内 CPU 和调度轮数见 `v3/timing.tsv`；干预前计时保留在 `v3-precommit/timing.tsv`。

## 计数与归因

| 热点 | 观测 | 判定 |
| --- | --- | --- |
| 相同十槽首开查找 | `GetChild` 3410→2074。前一未分段快照单撤 batch 缓存 1954→3344，隔离归因 1390 次。V3 分段新增 120 次 mount 查找 | 已改善 |
| 静置 120 次 | `GetChild` 600→0，`SetVisible` 360→0。旧代码每帧另写四个命中属性和一个文本属性，共 600 次直接写。手柄 `Controller:eligible` 37200→0 | 已改善 |
| 生命周期 | 旧复用式 fixture 暖开仍调用一次 RefreshItems。旧销毁式 fixture 暖开重建 3560 个节点；20 个循环新建、销毁各 71200 节点。V3 两种情况下暖开与 20 次循环创建/销毁均为 0 | 已改善 |
| 同视觉物理匹配 | 前一快照固定按槽 vs exact 匹配，排序尺寸写 1004→568，图片 8→6；总 CPU 中位数 4.48→2.76 ms | 已改善 |
| 同类型兜底 | 前一快照附加类型匹配，翻页尺寸写 860→724，翻页 CPU 中位数 4.65→5.02 ms | 筛查未见净收益 |
| 首开未用子树 | 按需发现诊断原型七卡查询 1396→1095，20 卡首屏 1954→1352，尺寸写无变化。样本少，新增复杂度与跨渲染器视觉待验 | 诊断结果，未纳入组合 |
| 单次创建 | V3 将大树拆成六个原子，另去掉永久不可见的 playable rim 叶。单次长尾仍可超过软预算 | 结构开销已改善，官方设备边界待验 |
| 静置与离开占用 | 默认复用式旧 fixture 对照下，20 张手柄开、关和 20 次循环的 deckPanel 总活节点各为 4103→3704，十面稳定。销毁式旧 fixture 关闭时只有 543 静态节点，V3 保留 3704。统计包括隐藏旧 Grid 和详情静态控件 | 有界驻留换暖态重用 |
| 预热 | 两侧各六个样本，将固定十面的创建移到首次空闲；在同模板早期阶段，空闲 P50 多付 5.95 ms，首开 11.83→6.09 ms，合计约持平。空闲驻留控件 544→3704 | 独立实验，默认继续惰性 |
| 物理呈现与房间转场 | 本实验不改变普通房间转场，不统计真实像素和设备时间 | 依赖平台未验 |

20 张同槽 V3 首开创建十个物理根和五十个分段，共 3160 个控件，基线为 3560。手柄排序 232 次查找、568 次尺寸写、6 次图片写。翻页尺寸写仍为 860 次。两侧 click-only 条件各有 88 个 deckPanel 监听。触控事件能力下 96→136，多出的 40 个是十张卡面的生命周期监听，20 次往返后两侧均保持原值。V3 手柄每页重新登记 10 个 Confirm 以失效旧回调，20 次往返各注入 200 次 detach 和 attach，活监听无增长。V3 手柄回访阶段 `Controller:eligible` 12400→18600，增加主要发生在模式就绪变化时，静置统计仍为零。正式 flags 的 native art 活控制都是零。报告未将牌库外的原生 UI 堆内存、Tween 或官方客户端内部对象计作已观测数据。可选 art 的公平性另由产品测试覆盖。

## 公共 SDK 的创建与模板原子

实际运行公开 npm `beyond-simulator-mcp@0.5.2`，worker 字节 SHA-256 `de72d4f80b230cfac330ab0ac6fa9d05e51bb8f51d352f08dd1ee6bcba0fe09d`。项目 `replay:outcome` 所锁定的导出为 `a62bb31a594874fbf1dc40e728ca2e0600e8d4cea0f1a16cda80481fb88452f3`，没有用公开 worker 替换其身份检查。当前没有对应的真实 GIL 读回、私有导出或官方设备。

SDK 最小模型按稳定原生 `control.id` 统计，实际 `RefreshItems(250)` 产生 250 回调、250 活子节点。250→10 保留 10、销毁 240，10→10 保留 10，10→0 销毁 10，0→10 创建 10。重复返回同一控件的 Lua userdata `==` 相等但 `rawequal` 为假，拿 userdata 当散列键会误报零复用。Host 默认最多 12 项，旧长列表在测试可见窗需要 15 项时会停在准备中。长列表基线沿用仓库 benchmark 的 15 项明确替身，另保留默认模型失败见证。社区注解与 SDK 都无法代替官方创建/销毁/回调实际测试。

同 worker 另做四个交错 session。两侧各 80 个物理牌面，分别投影旧整树与 V3 六个真实模板的结构。整树原子 P50/P95/max 2.04/5.92/24.70 ms，分段 480 个创建原子 0.25/0.85/6.39 ms，超过 4 ms 的原子 13/80→2/480。按每张牌汇总纯创建 2.04/5.92/24.70→1.74/5.04/8.17 ms。六种创建各 80 次，分段 P95 都低于 1.09 ms。Host 同角色各 720 次，P95 都低于 0.32 ms。V3 单次准备仍是软预算，可能遇到 GC 或引擎停顿。归一去掉未显示的 rim 叶和透明分段壳后，树的名字、子控件顺序和尺寸摘要均为 `42860c6928d84d0a106c7def38b2753fbb9b52381a65c9135259f756ad931da0`。这项测试不渲染纹理和像素。

## 复现

在同一环境创建两个隔离 worktree，基线使用上述精确 SHA，候选需要与 `v3/snapshot/source.digests` 匹配。可用 `PERF_BASE_WORKTREE`、`PERF_CANDIDATE_WORKTREE` 传入绝对路径。使用当前仓库、真实 LFS 资源与 `npm ci`，两侧运行 `npm run build:data`。分别用 `node scripts/build-ui.mjs <目录> --official-assets --refined-release-monsters --native-page-lifecycle` 生成基线 `baseline-generated` 与 V3 `v3/snapshot/generated`。保留冻结的 `tests/lua/support/game_ui_fixture.lua` 和候选 `src/lua` 至 `v3/snapshot/`。研究脚本会在本目录衍生计数替身，从不改动产品源码。原始矩阵与补充原子探针可按下列指令重跑。

```sh
python prepare.py
python v3/prepare.py
python v3/run-matrix.py count > v3/count.tsv
python v3/run-matrix.py timing > v3/timing.tsv
python v3/run-matrix.py touch > v3/touch.tsv
python v3/report-data.py
npm install --prefix sdk beyond-simulator-mcp@0.5.2
```

公开 SDK 最小探针从候选 repo 运行，传入 `PROBE` 为本目录绝对路径。运行 `node "$PROBE/sdk-grid-probe.mjs"` 取得 Grid 生命周期记录，再对 `sdk-v3-probe.mjs` 交错设置 `FULL_TEMPLATE=1` 与 `SPLIT_TEMPLATE=1`，每次设置独立的 `REPORT_NAME=v3/sdk-atomic-<轮>-<分组>.json`。脚本检验 SDK worker 原始字节身份和每次创建/销毁的结果。
