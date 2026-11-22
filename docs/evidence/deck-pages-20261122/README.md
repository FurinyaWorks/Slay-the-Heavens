# 只读牌库分页和持久卡面

本页记录移除手柄前的牌库候选，含当时的实验和审查。项目现行的输入范围由 [ADR 0003](../../adr/0003-keyboard-and-touch-only.md) 记录。手柄组数据仅用于比较历史实现。[项目移除手柄后的复验](input-retirement.md)

交付基线是 `develop@00229683d0d38660c98ced2f4a41e89d84fc5e4e`。`release/v2.0.0@013bdffb7d4767075d7ebcf0be9eacd275bfbe89` 是研究基线，开始时 Release 已到 `6c1e6644dc3345d4581e173a0f644da64abad5aa`。#811 在 develop；#813、#839 在 Release。保留 develop 的 #868 战斗入口和 #876 地图进房路径。整面外观复用与有界文字拟合从研究版本接续，下面单列相对 develop 的计数。历史 Release 的放大详情和地图返回四态共享在两个分支上有差异。本切片保留当前目标分支的完整详情和返回样式。

## 复现和候选身份

正式生成配置为 `--official-assets --native-page-lifecycle --refined-release-monsters`，对应 `official-assets-battle-v3`。生成标志为 `cards=false`、`menuBackground=false`、`selectionAvatar=true`、`battlePortrait=true`、`monsters=true`。实体卡面在首次浏览后随 Host/Run 保留，资源上限十根。每根最多五个附属层；切换或关闭不会创建新根。模板的启动注册和运行时懒创建是两项不同开销。

```sh
npm ci
git lfs pull origin
git lfs fsck --objects HEAD
npm run build:data
node scripts/build-ui.mjs build/formal --official-assets --native-page-lifecycle --refined-release-monsters
node --test tests/deck-pages.test.mjs tests/deck-ui-layout.test.mjs tests/deck-item-lifecycle.test.mjs
npm run check:native-ui-contract
npm run check:platform-load
```

[原始测量和脚本](raw-evidence.zip) 中的 `performance-review/v3/run-matrix.py` 从两个隔离工作树启动相同的 LuaTeX 夹具；始发实验的目录名为 `deck-baseline`、`deck-pages`，重跑时使用这两个目录名或重定向脚本的 `dirs`。日志携带时钟、实验臂、阶段、样本与操作计数。六个 session 交错运行，每臂/场景 36 个延迟样本。夹具基线默认保留最多十二项；长列表的基线键鼠测试使用十五项覆盖可见窗并明确记为修订夹具。销毁式夹具另测。真实设备验收线为首反馈 P95 ≤100 ms，须测输入事件到画面实际呈现。4 ms 为无中断的 CPU 调度目标。时钟分辨率与观测器开销单列于原始记录。无实机数据可据此确认目标。

[构建摘要](generated-build.json) 固定生成源码、正式 flags 和布局校验和。正式 GIL 还需 Production 底图与项目固定的 MCP 编码工具。未取得 GIL 摘要、原生脚本读回、官方导入、当前 ready、官方容量或终端测量。固定身份的 `replay:outcome` 还需同候选的 GIL 投影、精确 Lua 清单和锁定的 SDK 导出；已有历史 `verify:outcome` 仍报告产品未验及旧菜单长阻塞。公共 npm Worker 的独立探针未替换项目 SDK 锁。

## Host 交错结果

下表是精确 `98ddec927b8ea2003cd6e7421142f9699e4a9c7d` 对 develop 的主计时，20 张混合抽牌，手柄同十槽，单位 CPU ms。三项依次为 P50 / P95 / max。候选首屏经过 4 / 7 / 9 个 fixture 回合。CPU 统计不包含调度等待和实际显示。后继 `320da829651613feeb465c26173efdb5e17409e1` 拆分同一套发现函数，三次烟测的 2,074 次查询与活对象计数一致。

| 操作 | develop | V3 分段方案 |
| --- | ---: | ---: |
| 首开输入回调 | 10.96 / 13.94 / 14.16 | 1.82 / 3.14 / 4.31 |
| 首开至当前页就绪 | 10.96 / 13.94 / 14.16 | 11.31 / 28.65 / 38.50 |
| 暖开至就绪 | 4.43 / 17.27 / 28.26 | 2.88 / 4.85 / 11.15 |
| 翻页至就绪 | 3.96 / 4.82 / 20.79 | 4.64 / 12.83 / 22.20 |
| 排序至就绪 | 3.68 / 4.94 / 6.29 | 2.55 / 4.84 / 6.10 |

75 张键鼠冷开回调为 15.18 / 38.11 / 54.16 → 1.77 / 2.30 / 2.75 ms，至当前页就绪为 15.19 / 38.11 / 54.16 → 9.49 / 12.96 / 18.06 ms。20 张手柄的冷开和翻页就绪尾部均有回退。早期 V3 的冷开 P95 则下降，两个 session 批次的尾部方向不同，原始记录包含两批以及 320da829 的 97.06 ms 高点。完整分布见 [Host 概览](host-summary.txt) 和 [独立性能审查](performance-review.md)。

- **生命周期和静置已改善。** 20 张同槽冷开 `GetChild` 3,410 → 2,074。仅撤销 batch 缓存的分阶段实验差约 1,390 次；分段挂接新增路径查询。120 次浏览器静置查询 600 → 0，`SetVisible` 360 → 0，控制器 eligibility 37,200 → 0。额外的 600 次旧同值属性写由源路径计数。
- **同外观移动已改善。** 相同抽牌夹具排序，固定槽的尺寸写 1,004 次，按相同外观重新分配后 568 次。相同类型再匹配虽然降低翻页几何写，单次小样本 CPU P50 4.65 → 5.02 ms，当前组合采用精确外观匹配。按需发现未用子树仅有查询消融，尚无共享视觉充分验证。
- **原子创建已缩减。** 正式树每面 356 → 316 节点，仅裁掉永远隐藏的可打出描边后代，新增五个同坐标包装。六个创建单元分别为 58/42/71/51/51/43 个节点。公共 npm `beyond-simulator-mcp@0.5.2` Worker 四个交错 session 中，整模板 n=80 的原子 CPU P50/P95/max 为 2.04/5.92/24.70 ms，正式分段 n=480 为 0.25/0.85/6.39 ms。每面仅创建总 CPU 2.04/5.92/24.70 → 1.74/5.04/8.17 ms。仍有超出 4 ms 的原子长尾。
- **维持惰性。** 正式分段预热探针里，首开 CPU P50 11.83 → 6.09 ms，空闲期另付约 5.95 ms，合计约持平。预热让十面提早驻留。房间转场、六槽和轻卡面均未列入这组牌库收益。
- **资源盘点。** 混合类型达到能力牌高水位后，永久卡组和三个战斗入口各完成二十次往返，池 10 根及 50 个挂载段稳定。牌面含父节点 3,161，完整 DeckPanel 3,704；选择 Grid 的销毁型模型含 1 个空 Grid，默认保留选择项夹具在先开 12 张旧选牌后为 7,976 个 DeckPanel 节点。控制器、点击监听、详情、当前任务和可选 art 另见原始复核。正式默认无动态卡图租约，试验开启时旧 battle 的十租约已用 scope 测试隔离。旧选择 Grid 实际销毁行为仍待官方测量。

公开 SDK 最小 Grid 实测 250 回调对应 250 根，250→10 复用十根并销毁 240 根，10→0 销毁最后十根。Lua userdata 包装变化时以 SDK 稳定 ID 识别。离线 Host 有界夹具、公开 SDK 和官方客户端分别记账；离屏官方控件生命周期待验。

## 审查和画面

独立性能复核给出固定槽负控、阶段消融和交错延迟。资源及输入复核主动注入迟到旧手势、旧 Confirm、销毁拒绝、带副作用的创建异常、重开和换 Run；分段修复后 15 项通过。产品复核覆盖 0/1/7/10/11/20/75/250、排序、筛选、Frozen Eye、临时费用、详情焦点和现有选择。正式 V3 分段与展平 Host 的五种画布场景均为零差异像素；未识别的实际 SDK 纹理以原生资源 ID 占位。

- [首反馈](visual/formal-feedback.png) · [首页](visual/formal-page1.png) · [末页](visual/formal-page2.png)
- [详情](visual/formal-detail.png) · [筛选空态](visual/formal-empty-filter.png) · [develop 首屏](visual/develop-first-open.png)
- [像素差异记录](visual/flat-comparison.json) · [分段失败重试日志](segmented-lifecycle.txt)

## 基线回归边界

本地牌库、布局和候选打包定向组合 89 项通过，原生 UI 合同 7 项通过。两条正式 Host 旧滚动用例已迁移到分页并通过，分别验证 17 张商店牌库的末页详情和恢复商店，以及混合行数战斗牌堆的卡面、排序与详情。工程、容量日检、Git LFS 和证据素材许可清单均已执行。

同一 develop BASE 上复现了商店按钮墨色与路线预览用例、移动商店旧触点与遗物详情用例，以及 Watcher 历史源码身份用例的失败。另一个既有历史 StS 文件摘要失败也在 BASE 重现。受影响 Fast 的六个其他失败也在同一 BASE 重现，涉及 Angry 图像映射、三条旧主题断言和两条返回按钮颜色合同。保留原断言，正式 CI 不视为已通过。Fork A 的工作流 API 在本环境返回 Forbidden，主仓 PR 已请求 Full CI。
