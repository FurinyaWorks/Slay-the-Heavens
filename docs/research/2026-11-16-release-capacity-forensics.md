# release/v2.0.0 容量归因与最小修复

日期：2026-11-16。任务：TASK-111，来源 PR #702。**官方容量、官方导入/ready、PC 和实体手机：UNVERIFIED；不构成发布 GO。**

## 结论与适用范围

**PR #703 评论 6905101000 复核更正：本 PR 尚无正式默认包的发版减容收益。** 128,379 字节只来自 `--official-assets` 诊断配置；该配置与 `--release-candidate` 互斥。正式默认路径仍装配并保留 `selection133`，是否可裁剪尚未证明，不能把该收益迁移到正式包。原报告未充分限定这点，且账单漏记默认宿主、允许跨配置差值，均已修正。

真实默认生成树包含 **61 个卡面宿主、宿主子树共 8,892 个控件**；原账单为 0 是识别器缺陷。Official 诊断树为 39 个宿主。二者不能直接相减。使用候选 CLI 默认美术开关，旧/新肖像模块均为 **971,304 字节且 SHA256 相同，差值 0**。没有重建新的 GIL/RC，官方 MB 仍 UNVERIFIED。更正证据见 [复核附件](../evidence/task111-capacity-review-6905101000/README.md)。

在实际测量的 **Official 诊断配置** 中，最大离线编码成本是原生 UI，尤其是重复展开的完整卡面；未开放角色数据不是该诊断样本的主导成本。仅该配置中，已被 `lowpolyLumine` 替代的 `selection133` 无消费路径；排除它减少 128,379 个 Lua 源码及 GIL 编码字节，不改变该配置的 UI 树、输入、规则或 RNG 源码。正式默认装配的真实 GIL 成本排名和官方超限根因仍待验证。

**尚不能把这一结构结论认证为反复触发官方 20MB 上限的完整根因。** 云端没有用户当前游戏的实际 GIL、当前客户端或同候选官方读数。这里通过真实生产装配链和真实 GIL 编码器重建的是诊断样本，基础场景来自公开工具仓库样本。它能证明 Official 诊断配置的装配成本和该配置的字节收益，不能认证官方容量、原用户场景成本、设备表现或严格 UI 导入等价。

本 PR 的产品修改只有 `scripts/official-portraits.mjs` 的 profile 条件；其余为账单、证据和必要的历史来源合同延续。**Lua 序列化归 PR #691/TASK-100，已撤出本分支的重复实现**；本轮相关测量仅保留为实验，不计入本 PR 的收益。

## 基线、在途工作与身份

- 实际获取并再次核对的 Release：`1cc5479b713edab6fd26db4e20f8eb22b7401cb2`。独立分支：`feat/task111-capacity-forensics`。未合并、打 Tag、发版或操作游戏窗口。
- 原 PR #702 的两个任务/交接提交只带入本独立分支。Backlog CLI 完成查重、认领、owner/type/priority/milestone/ordinal/dependencies 规范化；补齐原登记遗漏的 M8 索引。任务保留 In Progress，官方 AC 未勾。
- 已核对 #691、#683 及 Release UI/PC 在途切片。#691 保留序列化所有权；#683 属 TASK-105/develop 的未来扩容离线合同，不是本版生产实现。#699 也改 `official-portraits.mjs`，合流时须重新核对来源合同和候选，不能迁移本报告数据。#696/#697 的页面/导航切片未带入本分支。
- 本次 GIL 实验的诊断选项为 `--official-assets`（不是正式默认配置）：cards=false、menuBackground=false、selectionAvatar=true、battlePortrait=true、monsters=false；未启用 V25 私有卡图/mask、组件实验或 playtest。
- 工具仓库 `FurinyaWorks/genshin-miliastra-mcp@59c576e41632a6bf6781bbca83a676d0da0374ec`，encoder 原文 SHA256 `25dbe281655a21d30401d8001dc3ee04b34038adf8f3f42be4230bf03bd85e2b`。使用项目既有 `loadNativeUiEncoder` 与真实 wire/readback API，不使用测试伪 wire。
- 诊断基底从该工具的 `editor-2026-10-13-clientkinds.gil` 移除样本 client UI/template/script 得到，25,793 字节，SHA256 `b3b46b0412caf865ebc259c15ad8215b33a1797ab7940861eb562320541e13a2`。它仍含样本服务器图，**不是用户游戏基底**。
- 收据显示 workKey=alpha-test、version=v1.0.0，未使用 `--release-candidate`。**Release 分支源码重建不等于正式 v2.0.0 RC。**

| 身份 | C0 诊断基线 | C4 历史 Official 诊断重建 |
| --- | --- | --- |
| sourceCommit | `bd6e19c89799e6edef6076da3c94dad9ed563e5e` | `be5466c1a35f78b660c3c7e712b714c98af0ce24` |
| sourceDirty | false | false |
| buildId | `e42e5294-946e-4ec6-8dbf-9c16e7e8631d` | `ffb7a077-2bb4-48ec-8f23-cad599dd8d0e` |
| candidate SHA256 | `9b6440680ffa5f3c12c0cb80276b7bde552105a80586bd831c3e149026a58669` | `9a3a94c08f708b4fc64b6397395f429f34f7a9b2f3160358cc4b6392734567a4` |
| payloadDigest | `a406ebfd45fb563bf9af4ce5359028ff93b535bac4639309d0bb1fc5da4ae410` | `b8923a648d494ca33dc247683bf398ce69046f97adfbb07246f2d297f4ebc380` |
| 官方客户端版本/关卡 MB/服务器 MB | 未取得 | 未取得 |

C1 是独立序列化实验；C3 是两项组合实验，已标记 superseded。**它们都不是 C4，也不作为当前交付候选。** 完整身份见 [identities.json](../evidence/task111-capacity-20261116/identities.json)。C4 只绑定上表历史源码；本次修正又改变生成器/账单输入，没有新 GIL，C4 不代表当前 HEAD。不得改写其 sourceCommit。

## 真实装配链及排除项

`build-native-candidate → prepareBuild → build-lua-data / build-ui --official-assets → candidateScriptFiles → template 绑定 → writeScriptBatch / addClientUi → write_graphs → scene_check_client → 全量 Lua 读回 hash`。

`build-ui` 先生成基础结构，再执行 Official 组合；Official 内复用 V25 布局/装饰，最后安装 StS 卡面。**生成步骤多不代表最终保留多份完整画面。** `installStsReferenceCardChrome` 已清空 roundShadow/roundFrame/roundBody/skin/nativeCardBody/nativeRibbon 等旧后代，保留语义句柄；发光、类型、费用和禁用层仍有运行时代码读写。

`battle-ui.json`、`abyss_ui_layout.lua`、`abyss_ui_templates.lua` 等为生成/测试夹具，不在生产脚本白名单，未作为第二份完整 UI 注入。被排除的旧 `abyss_random` 也未重新装配。不能把 build/ 或 art/ 目录大小直接算成上传成本。PNG/GIF 等批准源图经生成器转成数值数据，官方 image ID 是资源引用，不按引用次数重复计入图片文件大小。

## Official 诊断容量账单：实际编码字节，不是官方 MB

| 指标 | C0 | C4 | 差值 |
| --- | ---: | ---: | ---: |
| GIL 文件字节 | 24,484,925 | 24,356,546 | −128,379 |
| section 9：原生 UI | 18,944,715 | 18,944,715 | 0 |
| section 50：Lua 记录 | 5,512,183 | 5,383,804 | −128,379 |
| 写入 GIL 的 Lua 源码字节（含构建标记/绑定） | 5,489,818 | 5,361,439 | −128,379 |
| 生产 Lua 模块 | 366 | 366 | 0 |
| 输入控件：布局和 7 个模板，含根 | 24,671 | 24,671 | 0 |
| 紧凑布局/模板 JSON 字节 | 3,930,158 / 137,234 | 相同 | 0 |
| GIL UI 记录（含基底布局记录） | 24,693 | 24,693 | 0 |

C0 中 UI 占诊断 GIL 字节的 **77.37%**；39 个卡面子树占 UI 记录字节的 **56.88%**。这些占比只描述这份离线编码，不能视为官方面板占比。

| 最大 UI 子树 | 控件数 | 实际记录字节 | 来源/本版必要性 |
| --- | ---: | ---: | --- |
| `SlayTheAbyss/stage/nodePanel` | 10,330 | 7,965,359 | shop/picker/event/treasure；含 25 个完整卡面，正常节点流程仍用 |
| `.../battlePanel` | 5,831 | 4,490,467 | 10 手牌、HUD、奖励、药水；正常战斗必须 |
| `.../menuPanel` | 1,854 | 1,534,315 | 菜单和结算 |
| `.../mapPanel` | 1,851 | 1,308,063 | 两幕地图与交互 |
| `.../choicePanel` | 809 | 619,107 | 合法选牌流程，含 2 个卡面 |
| `.../characterPanel` | 717 | 546,162 | 本版旅行者选角/背景宿主 |

Official 诊断卡面实计 **39，而非历史假设的 38**（正式默认为 61，见更正附件）：战斗 10、节点 25、choice 2、`AbyssDeckCard/face` 与 `AbyssBattlePileCard/face` 两个模板各 1。合计 13,958 个控件、10,776,294 个原生记录字节。节点 25 个卡面含 picker/forgeGrid/商店等用途；不因同时不可见就判定可删，也未缩减合法手牌、敌人、事件或选牌数。页面、卡面和模板排名会重叠，不能相加。

| 最大 Lua 载荷（C0） | 源码字节 | 装配来源与判定 |
| --- | ---: | --- |
| `abyss_traveler_portrait_assets` | 1,323,247 | official-portraits；角色图元及批准背景，含已证实的旧选角残留 |
| `abyss_original_v4_data` | 577,904 | build-original-v4；4 角色各 75 卡、共 600 份 base/upgrade 定义 |
| `abyss_theme` | 375,853 | build-ui-theme；主题与低成本怪物/遗物数据 |
| `abyss_data` | 212,819 | build-lua-data；玩法配置 |
| `abyss_combat` | 116,002 | 玩法核心，不裁剪 |
| `abyss_presentation` | 74,514 | 当前卡牌显示数据 |

肖像模块进一步分解：批准 idle 字段 540,341、结算仍使用的 battle133 354,060、批准 lowpolyLumine 264,342、旧 selection133 字段 128,377、avatar96 29,599、battlePixel 5,145 个源码字节；另有字段分隔、绑定和许可证。删除 selection133 的整行含分隔符/换行，共 **128,379 字节**。battle133 的结果页消费位于 `abyss_traveler_portraits.lua`；battlePixel 仍有既有 schema/负控合同，均未删除。

未开放 V4 数据确实无条件进入生产清单；`experimentalCharacters=false` 和 competition-two-act 只限制运行时准入，**不是打包过滤器**。它占本诊断 GIL 约 2.36%，不是最大成本。现有 full-source/测试仍消费它，本次保留全部冻结 JSON、源码、300 张卡和规则；不引入未经验证的新内容投影。未来扩角色容量准入仍由 TASK-105 负责。

按角色独立序列化完整 75 卡数组：胡桃 HT 141,563、阿蕾奇诺 AR 140,873、芙宁娜 FR 148,751、雷电将军 RD 136,093 个 Lua 字节；另有共享规则、版本、模块及字段包装，不能把独立数组直接相加作为官方容量。

美术还包括主题中的低成本原生绘图注册：88 件遗物/732 个 shape 的注册为 76,010 个 Lua 字节，42 类敌人/689 个 shape 为 72,159 字节。`monsters=false` 关闭的是旧自定义怪物图包，不会取消这些当前正常使用的轮廓注册/原生控件池。自定义菜单背景和卡图开关关闭也不意味着 Official/V25 纸张、场景和卡面图元没有原生 UI 成本。明细见 [role-art-breakdown.json](../evidence/task111-capacity-20261116/role-art-breakdown.json)。

完整模块、页面、模板、39 个宿主、资源引用排名见 [inventory.json](../evidence/task111-capacity-20261116/inventory.json)。仅资源 100003/100001 就分别有 7,909/7,822 次静态引用；这说明图元展开/状态复用成本，不证明有可删的重复图片或泄漏。

## 同源单因素与组合实验

所有实验均从同一干净 C0 及同一工具链出发，记录实际文件 hash、差异、静态检查和官方空值。**没有官方同条件实验差值。**

第一组使用合法的增量探针：向 C0 添加隐藏的独立 UI，或未挂载的纯数据模块，保持原游戏 UI 记录不变。它避免通过删除正在使用的控件/规则制造非法样本；测得的是含探针包装/布局记账的边际编码成本，**不是可直接移除的收益**。

| 单因素探针 | 增加的 GIL 字节 |
| --- | ---: |
| 39 个完整卡面 | 10,792,931 |
| 其余 UI（不重复放卡面） | 8,100,676 |
| 肖像数据模块 | 1,323,323 |
| 非本版 V4 数据模块 | 577,984 |
| 四项组合 | 20,794,914 |

本编码器中组合与单项和差为 0；这不证明官方编码线性。所有探针原始 UI 记录逐字节相同、静态检查通过，官方导入/容量仍未验。见 [component-probes.json](../evidence/task111-capacity-20261116/component-probes.json)。

第二组直接对同一 C0 的 Lua 记录进行单因素改写，除 section 50 外保持全部区段逐字节一致：

| 实验 | 实测 GIL 字节减少 | 是否本 PR 交付 |
| --- | ---: | --- |
| 普通生成数据仅改 UTF8 表示 | 179,481 | 否，序列化归 #691 |
| V4 生成数据仅改 UTF8 表示 | 308,625 | 否，序列化归 #691 |
| 两者组合 | 488,106 | 否，实验记录 |
| 仅删除 Official 失效 selection133 | **128,379** | 是，仅诊断 profile，不计发版收益 |
| UTF8 + selection133 组合 | 616,485 | 否，已 superseded 的组合实验 |

实际 Lua 逐字段比较确认序列化实验的 35,542 个标量值不变；删除旧选角字段后，其余肖像数据的 259,413 个标量值不变。原始脚本/规则未动；没有借该实验移植 #691 的实现或 640,086 字节旧源码配对结论。见 [same-source-experiments.json](../evidence/task111-capacity-20261116/same-source-experiments.json)。

独立重建的 C4 也减少 128,379 字节，UI section 9 完全相同，364/366 份 Lua 源码逐字节相同；另两份分别是新 UUID 构建标记、肖像恰好删去一行。重新编译的服务器图 section 10 长度相同但原始字节不同；生成 TypeScript 与拓扑 hash 相同，**不宣称编译图语义已实机认证**。纯单因素改写没有该重建差异。见 [delivery-comparison.json](../evidence/task111-capacity-20261116/delivery-comparison.json)。

## 最小修复与回归边界

`writePortraitModule` 只在 `!officialAssets` 时生成旧 selection133。运行时唯一选择路径 `selectionFigure` 在 official 分支严格 `assert(Asset.lowpolyLumine)`，缺失会拒绝，不会回退旧 selection133。非 Official/V25/full-source 的既有行为及原资产保留。

失败回归先证明旧生成器仍带 selection133；修后检查 Official 不携带它，保留 lowpolyLumine、battleApprovedIdle、battle133，legacy profile 仍有 selection133。现有真实 Lua/模拟 Host 用例覆盖到 ready、取消/缓存、隐藏角色、战斗/结果切换和释放，新增运行时 `Asset.selection133==nil` 断言。它们不是 PC/手机官方实测。

平台负载沿原入口输出 `costBreakdown`；可选 prior daily 输出带 sourceCommit 与文件 SHA256 的路径增量。新 `assembly-profile.json` 由生成器记录实际 UI profile、美术开关、卡图方式、已解析静态宿主列表及生命周期等选项，账单校验其美术开关与实际生成 Lua 一致；配置未知或不同保持 UNVERIFIED，不生成差值。同配置正常内容变化仍可比较，不用布局 hash 禁止合法比较。缺失、不兼容、重复路径或非合法计量的分项基线保持 UNVERIFIED，不能把缺测当 0。原总量基线、20/16/3 预算及 release 严格证据合同不变。新成本用例并入已有 platform-load 测试文件，不增加 Full discovery 清单。

既有 CI 来源凭据拒绝修改后的完整源码，已在原 bootstrap 外层追加本轮完整 before/current 凭据；保留全部旧 archive/hash/目标/负控，陌生或变异源码继续失败。未扩大生产 sourceEpoch 或 helper-copy 闭包，不改 CI 预算、分片、工作流及 skipped 规则。验证原始失败、修复与最终状态见本目录 [证据索引](../evidence/task111-capacity-20261116/README.md)。

**严格读回审计未通过，失败保留。** C0/C4 均为 UI_MISMATCH、TEMPLATE_MISMATCH、GRAPH_COUNT 三项：该工具链读回省略部分 `imageType`，诊断基底又保留额外 `_GSTS_CgStage`。两次各 366 模块源码读回匹配，原生静态检查均为 0 error/423 warnings；未将 warnings 或严格审计失败抹掉。相对 C0 的 UI 编码不变不能替代严格导入/视觉验收。详见 [strict-audit-status.json](../evidence/task111-capacity-20261116/strict-audit-status.json)。

本地广泛 JS 运行在范围收缩前启动，曾因缺 pinned Luacheck 出现 Act1 静态检查失败；按项目入口安装后该精确测试通过。运行跨越实现来源变化后已停止，不计为最终 Full PASS；保留部分日志。托管精确 HEAD/BASE Required/Full 仍需正常验收，未申请合并。

## 官方限额与接续

8.96MB、19.78MB、20.1781MB、70.51413MB 是不同历史上下文的读数，本轮未取得可统一绑定的原始候选/截图，不相减、不拟合增长曲线。不能用 24,356,546 个文件字节、压缩包或本次减少 128,379 字节换算官方 MB。

**官方 ≤20MB、争取 ≤16MB、服务器 ≤3MB 均未认证，距离目标也无法给出可信数值。** 本次 Official 诊断小修未减少正式默认包，也不消除该诊断配置的完整卡面展开成本；没有证据支持为追求 16MB 改画面、规则、RNG、合法容量或交互。

接续须使用 Owner 的真实游戏基底及届时最新 Release 重建新 RC，冻结同一 sourceCommit/buildId/candidateSha256/payloadDigest/装配开关，取得当前客户端官方关卡/服务器读数和导入/ready，再做受影响 PC/实体手机回归。若仍超限，先在同条件官方测量中隔离卡面/其余 UI/美术/非本版数据；共享模板等进一步改造须验证句柄、层级、类型变体、输入和生命周期，不能从本次离线占比直接决定删除。
