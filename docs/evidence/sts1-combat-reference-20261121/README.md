# STS1 战斗表现：溯源、修正与轻量试做

2026-11-21；目标 `release/v2.0.0`；Owner 本轮明确指定 release 并授权管理员应急合并，优先于仓库常规 develop 路由。前置修复 PR #796（`9aa835609bf351c7999c6ed9b3c86051b27c7203`）。不修改生命值、数值、出牌规则、牌堆归属或动画阻塞时间。

## 可查看的结果

- [能量 3→0→3](energy-comparison.png)：实际生产 Lua 控件输出，经 SDK 软件渲染并裁切；零能量保留完整装饰盘面，改为灰褐低亮度，恢复后盘面像素与原充能态一致。
- [力量与仪式](strength-ritual.png)、[49 个正式状态图标](status-contact-sheet.png)：实际图库纹理，49 个 PNG 内容哈希各不相同，见 [纹理清单](status-texture-hashes.json)。这证明当前图片不同，不代表已经完成手机可辨识度验收。
- [卡牌移动与灰烬试做 GIF](flow-spike.gif)：依次弃牌、回抽牌堆、消耗。83 个 SDK 实际截图，时长取捕获场景的 durationMs；固定 18 个额外图元，无新增素材，未接入生产构建。

所有图片都是 SDK 软件运行画面，**不是官方客户端、官方导入、ready 或设备实测**。流光演示使用受控牌 UID 归属输入驱动真实 `abyss_card_flow`，并非自然战斗录像。为看清效果，导出仅保留真实牌堆控件和反馈层。试做还存在可见的分段感、原生混合方式与 STS1 加色粒子不同等差异，不能称为完全还原。

## 为什么旧问题还在

检查 release、develop、全部可达主题变更历史，以及旧 PR #70、#188、#646、#672：

1. `7ba8f728f2d34b6ddf5d3abc7138fbda81361488`（2026-10-23，#73）加入 ritual 时即配置 `103047`，与 strength 相同。119 个可达主题快照中，112 个共图、6 个尚未引入 ritual，只有 #796 已拆开。原始结果见 [theme-history.json](theme-history.json)。
2. [#188](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/188) 修的是虚弱/缠绕；说明中仍有其他共图和设备验收待办。TASK-4.4 的 AC10“不同 buffId 及其不同机制不能用同一力量图标假装区分”仍未勾选。不能将该旧 PR 的完成等同于仪式已完成。
3. develop `345ba08398b6ca8e1361a126f2ce1de85210e634`、release 的 #778 和关闭未合并候选 #646/#672 均仍共图。没有发现已合入的 ritual 独立图标修复被回滚或漏入 release；无法据此排除未提交或不可达的外部工作。
4. #796 的回归用例已由 `sts-card-reference-runtime.test.mjs` 正式导入，并非未注册测试。真正还缺的是单独构建主题时的约束：旧构建只检查 ID 是否有效，不检查不同状态共图。本轮令构建对全部基础状态及 8 个正式无色语义族拒绝重复 ID；新增状态也自动进入检查。

因此证据支持“已知要求未收口，构建防线缺失”，不支持直接归因为“修好后忘了合并”。交付还须绑定目标分支精确提交，旧 work 检出不能充当当前 release 候选。

## 明确参照与实际观察

主要动态参照：[STS1 实际游玩片段：exhaust deck without a feel no pain](https://medal.tv/games/slay-spire/clips/lU23tnOWmB50gAADL)。本地下载仅供逐帧研究：1280×720、60fps、201.301 秒；不将完整第三方录像或游戏源码加入仓库。

- 18.5–19.2 秒：确认回抽牌堆；19.3–20.0 秒：橙金弧光沿经过的位置保留并逐渐变细、变淡。
- 20.1–20.9 秒：画面中展示的牌在原位淡去，出现灰色烟尘/碎片。
- 30–31 秒：整手弃牌的方向、缩小与流光。
- 用户提供的一代截图另作为零能量灰褐盘面与消耗灰烬的直接参照。灰烬与金尾同屏不证明属于同一张牌，试做将这两种行为分开。

实现行为还核对了仓库原先使用的 [STS1 源码参考镜像固定版本](https://github.com/aeubanks/sts/tree/319009d5df0a82d9fb0f23cc22322286c6a87ec0)：`cards/Soul.java` 的历史路径与 Catmull-Rom 插值、`vfx/CardTrailEffect.java` 的约半秒余辉，以及 `vfx/cardManip/ExhaustCardEffect.java` 的原位淡出和灰尘。各文件研究副本哈希见 [reference-source-hashes.json](reference-source-hashes.json)。仅记录观察并自行实现基础图元近似，没有复制游戏贴图或整段效果代码。

## 生产修正与实验边界

上一版 #796 隐藏整个 `v25Chrome`，盘面材质消失，与用户补充的 STS1 0/4 截图不符。本轮保留六层盘面，用主题里的 charged/empty 调色板切换；只在状态变化时写六个颜色，恢复精确原色。空态按固定亮度/饱和度变换生成，不声称匹配原作贴图。数字、点击区域、费用判定均保持原样。

流光与灰烬只位于 `experiments/sts1-combat-feedback/`，默认生产生成器与运行入口均未导入。六组光晕/亮芯沿历史路径排列，半秒淡出；六片灰粒上浮消散。实验不为消耗附加金色入堆光尾，并隐藏生产 Flow 现有的燃烧后飞行片段。这是实验层的遮显，不是已经在生产修正完整消耗轨迹。正式接入仍需评估多牌并发、设备表现与画面质量。

## 验证与重现

定向测试 **64/64**：`node --test --test-concurrency=1 tests/build-ui-theme.test.mjs tests/build-ui-theme-protection.test.mjs tests/sts-card-reference-runtime.test.mjs tests/relic-native-status-icons.test.mjs`。包括实际构建拒绝 ritual/strength、buffer/artifact、panache/strength 共图，缺表诊断，真实 Lua 3→0→3，以及费用图标层级与原先精确源码见证续接。旧见证归档保持不变，新续接固定 #796 原始来源。

保存了修复前红测、最终定向测试、语法检查和工程日志（本目录 `*.log.gz`）。工程质量/架构通过；`check:engineering` 在未修改的 `abyss_battle_ui.lua M.new` CC16>15 基线问题停止，后续串联项没有冒称通过。本轮不宣称全量测试或 Hosted CI 全绿，也不放宽原门槛。

SDK 0.5.2 捕获回执的 `assetWarnings` 全为空。能量/图标/流光原始场景与回执以 gzip 保存，捕获源码哈希见 [capture-source-sha256.json](capture-source-sha256.json)。复现先安装项目依赖，并准备独立的 `beyond-simulator-mcp@0.5.2` 与 Python Pillow：

```sh
node experiments/sts1-combat-feedback/capture-energy.mjs .artifacts/sts1-energy-reference
node experiments/sts1-combat-feedback/capture-flow.mjs .artifacts/sts1-flow-reference .artifacts/sts1-energy-reference/generated
NODE_USE_ENV_PROXY=1 ART_LAB_MCP_ENTRY=/tmp/heavens-visual-render/node_modules/beyond-simulator-mcp/dist/index.js node experiments/sts1-combat-feedback/render-scenes.mjs .artifacts/sts1-energy-reference
NODE_USE_ENV_PROXY=1 ART_LAB_MCP_ENTRY=/tmp/heavens-visual-render/node_modules/beyond-simulator-mcp/dist/index.js node experiments/sts1-combat-feedback/render-scenes.mjs .artifacts/sts1-flow-reference .artifacts/sts1-energy-reference/generated flow
python docs/evidence/sts1-combat-reference-20261121/make-media.py
```

图标场景可由 `status-scenes.json.gz` 解压到 `.artifacts/sts1-status-reference/scenes.json`，同一 renderer 以 `gallery` 模式执行，generated 指向上述能量生成目录；媒体脚本还需 SDK 已缓存的原生纹理。能量三联图是四倍截图的等尺寸裁切拼接；SDK 镜头不作原生视觉验收替代。
