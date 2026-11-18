# TASK-111 正式默认装配减容

2026-11-16；PR #703，最新 Release 基线 `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。合流后产品冻结提交 `7b6e63283e5b2b1fede623ad2a3ac0498a4c2558`；先前1cc/bf74实验身份原样保留。

正式默认装配链已实际减少 **5,003,251 个 GIL 字节，约 31.4%**，收益也进入完整音乐包装入口。不是仅修统计工具：默认候选编译器现在将相同卡面写为原生模板引用，并排除默认选人路径已经不使用的旧画像字段。61 个逻辑卡面宿主、8,892 个宿主子树控件和原始美术全部保留。

**官方 ≤20MB、争取 ≤16MB、服务器 ≤3MB、导入/ready、PC/实体手机、引擎中的引用层级/输入/性能均 UNVERIFIED。** 本轮使用公开工具 fixture 基底，未操作游戏窗口；以下是正式默认配置的离线实际编码收益，不能认证用户原档超限的完整根因或发版达标。没有按字节换算官方 MB，也没有可据以计算官方余量的当前读数。

## 最新 Release 合流复验（主交付）

交付前发现 Release 新合入 #697，因此将33d纳入本独立分支并重建，未把旧D2/F1冒充新Release样本。最新完整音乐入口 **15,953,517 → 10,950,266 GIL字节**，仍减少 **5,003,251字节**。

| 样本 | 真实源码 | buildId | GIL字节 | 用途 |
| --- | --- | --- | ---: | --- |
| F2 | `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9` | `3e45eaa4-4ca1-4b0b-bb56-85e72a551c9c` | 15,953,517 | 原始最新Release控制；没有统计sidecar |
| F4 | `b4bfb55e650c902792c5456243fb2a852dc832da` | `b98c4708-3542-47fc-9bdd-e4ab804b4028` | 15,953,517 | 相同统计工具、回退减容的合成控制 |
| F3 | `7b6e63283e5b2b1fede623ad2a3ac0498a4c2558` | `a12d9fb4-4996-4673-b910-6715f7be471d` | 10,950,266 | 最新优化完整音乐样本 |

三个sourceDirty均false。F3 candidate SHA256 `35aaa67cc2a84c9d452ab2df6e1c0b0e80f81faff7505a5cf9fba8540b317d41`，payloadDigest `3fc78b67a382fb3afde28e50dc17570340ef9c3b92af4ae8431bb7f61e68aeea`。

F4不是原始33：它从7b6独立冻结，只将五个既存减容owner（原生builder/auditor、portraits、BGM及完整音乐builder）还原到396的修正前实现；保留33的selection/map产品修复、相同已修统计工具、配置与资产。新增sharing JS helper仍在源输入中但旧builder不import、不调用、不装配。其真实payloadDigest与F2不同，不隐瞒差异。控制提交完整保全于附件source-only bundle（依赖7b6），可以独立恢复核对。

原始F2缺sidecar时比较器继续拒绝；没有猜填配置或放宽比较。F2/F4另行交叉核对：GIL长度相同，原始UI/模板逐字节相同，原生全部UI/模板读回一致，366模块只存在新build UUID差异，服务器图生成源码相同；实际节点payload hash不同，完整protobuf字段对比只见210个节点编辑器x/y坐标差异（F2/F4及F4/F3各210项），其余全部图字段相同。已定位genshin-ts@0.2.2的basic.js:117–118在图编辑器布局中加入Math.random()*10抖动，与玩法RNG无关；保留原hash，不放宽产品审计，其余非UI/脚本/图区段逐字节相同。该证明限定统计工具没有改变本控制的编码内容。正式收益比较使用有真实sidecar的F4/F3，完整配置/基底/父收据hash验证通过，362模块逐字节相同、四个差异仍全部解释，UI展开逐属性/顺序相同，61宿主和共享3组digest与旧实验相同。详见 `latest-control-equivalence.json` 与 `latest-release-audio-comparison.json`。

F2/F4/F3严格审计仍均FAIL相同两项UI_MISMATCH/GRAPH_COUNT，366模块均sourceTextIdentical；没有新增模板失败。最新selection/map/菜单/默认选人回归 **21/21通过，0跳过**。CI合流来源合同另做追加延续，157/157通过，fresh独审APPROVE，保留双方历史证据。最终check:guidance、verify:backlog、check:platform-load及正确顶层assertIntegratedCurrent通过。日常平台清单仍有相对旧逻辑基线增长告警，分项基线不可比为UNVERIFIED，未改预算/基线；物理共享收益另以真实GIL验证。直接对新raw调用旧bootstrap断言会拒绝（保留该错误入口日志）；正式顶层先认证新Release raw再按已认证来源投影旧层，未放宽合同。最新产品/证据独审008920df / BASE33d为PASS、unresolved=[]；CI作者与审查者分别记录，CI三文件由fresh reviewer独立APPROVE。F3全部643项生产输入与交付checkout的字节/hash逐项一致，后续CI/文档提交不重贴候选身份。详见review.json、ci-integration-independent-review.json与delivery-source-binding.json；设备与官方验收仍全部UNVERIFIED。

下面保留1cc基线的单因素及重建实验，解释这两项修改的因果收益；不把不同Release、不同入口相减。

## 旧1cc基线同配置前后结果

| 装配入口 | 基线 | 新样本 | 基线 GIL 字节 | 新 GIL 字节 | 减少 |
| --- | --- | --- | ---: | ---: | ---: |
| 默认原生候选 | D0 / 396b5575 | D2 / bf74c0c3 | 15,931,074 | 10,927,823 | 5,003,251 |
| 默认完整音乐入口 | F0 / 396b5575 | F1 / bf74c0c3 | 15,952,833 | 10,949,582 | 5,003,251 |

每一行只在自己的入口内比较；不把无音乐与有音乐样本直接相减为优化收益。四个样本均 sourceDirty=false，同一原始基底 SHA256 `b3b46b0412caf865ebc259c15ad8215b33a1797ab7940861eb562320541e13a2`，25,793 字节。音频比较器验证完整父收据 hash、build/source/payload 身份和音频 baseSha；两个父收据再追溯同一基底。

共同配置：uiProfile=default、renderProfile=native-v2；cards=false、menuBackground=true、selectionAvatar=true、battlePortrait=true、monsters=false；无 Official、V25、轻量/组件/静态卡图实验或 experimentalCharacters。这里的 cards=false 是既有额外卡图资产开关，不能解读为删除原生卡面。CLI 默认生成的 UI、原始六份模板、assembly-profile 三文件在 D0/D2 间逐字节一致。

收据仍为 version=v1.0.0、workKey=alpha-test、releaseCandidate=false，**不是正式 v2.0.0 RC**。独立合成 RC 参数回归证明 releaseCandidate=true 不会关闭本项默认共享；这不是项目正式 RC 实测。

| 身份 | D2 旧1cc原生冻结样本 | F1 旧1cc完整音乐冻结样本 |
| --- | --- | --- |
| sourceCommit | `bf74c0c391a0700740fee9b7cb8695bff615366a` | 同左 |
| buildId | `da3751cf-8c09-4d8f-b50e-4fe05be2073f` | `13e47cb7-c7f8-4837-970e-c50ed49fb26f` |
| candidate SHA256 | `c8542d5f8d649a9f8b8a1c8c6a63461aa7be72f0414b9c017e758e8e978a5aaa` | `75e5024bc11b64787414796d6eb6249f4b1a1e2ae258999a2306b701f00ee4d2` |
| payloadDigest | `6a9c9fc103aec11c05a65ff184c0e2de5c3d9fad4bffd3b9095a7ea258a2e348` | 同左 |

完整基线/样本收据与身份见 [证据附件](../evidence/task111-default-reduction-20261116/README.md)。D1 是 d46bf7aa 的历史中间样本；音频收据修正后重新冻结 D2/F1，没有把 D1 或此前 Official C4 改名为新候选。后续纯文档提交不改变这些冻结样本的 producer 身份。

## 默认包的实际成本

D0 真实 GIL UI 区段 **10,903,022 字节**，Lua 区段 **5,000,025 字节**；原生 UI 是这个默认样本的首要成本。61 个完整卡面宿主的独立编码成本为 6,746,980 字节（子树包含关系见明细，不额外加到 UI 总量）。逻辑清单统计 14,431 个控件；共享器另计 layout 包装根，打包口径为 14,432 条，不能混用。

主要页面按原始 JSON 输入列示，**不是 GIL 份额或官方 MB**：

| 路径前缀 SlayTheAbyss/stage/ | 控件数 | JSON 字节 |
| --- | ---: | ---: |
| nodePanel | 4,725 | 526,128 |
| battlePanel | 2,966 | 372,803 |
| characterPanel | 2,056 | 227,643 |
| choicePanel | 1,685 | 187,597 |
| potionEntry | 775 | 107,287 |
| mapPanel | 740 | 91,401 |

初始隐藏不等于无用：页面生命周期、合法10手牌、商店/奖励/锻造/牌库等仍需要这些宿主。没有删除页面、命中区、语义句柄或合法运行实例。Official/V25 多阶段生成的历史调查见[原报告](2026-11-16-release-capacity-forensics.md)，其39宿主不能与默认61宿主相减；安装卡面时已经清空的旧层也不能再次计为可删收益。

Lua 生产文本总量 4,977,599 字节（与 wire 区段开销分开）。最大模块：portrait_assets 736,778、original_v4_data 577,904、menu_background_asset 310,029、abyss_data 212,819、theme 140,202、combat 116,002 字节。账单完整记录 UI/规则/配置分类、模板、图片引用次数及动态美术预算。PNG 文件大小和图片 ID 引用次数不作为嵌入图片存储字节；背景/画像仍走原缓存和批次参数。

未开放 V4 数据确有 577,904 字节，但移除/投影需要证明显示文案、池、共享机制与历史数据边界；收益低于本轮卡面共享且证据不足，完整保留 full-source 和生产装配，不做冒险裁剪。#691 的 Lua 序列化仍由 TASK-100 负责，本 PR 不重复实现、不计其收益。#699 的画像修改未合入；后续合流须重建并复核来源。

## 按实际收益实施的两项修改

### 1. 完全相同的原生卡面只存一份定义

`native-ui-card-sharing.mjs` 在候选原生编译边界按完整 children 和根尺寸分组，48 个宿主分成 10 手持、15 节点、23 只读卡面三组（包含 AbyssDeckCard 的原型卡面）；13 个单例保持原结构。新增三份 `AbyssSharedCardFace1/2/3` 原生定义，各宿主保留自己的名称、位置、尺寸、可见/激活等根属性，通过既有 engineReference 合同引用。没有增加 Lua 创建、解压、逐帧更新或共享运行状态代码。

只允许已识别的普通根字段。存在显式 navigation 的树完全跳过共享；子孙私有脚本/导航、重叠嵌套和没有净控件收益的分组不进入优化。打包后展开必须深相等还原原始树。物理存储记录 **14,432 → 8,005**，这是定义存储数量，不是运行时峰值控件数或设备性能结果。

同一个 D0 文件仅替换 UI 区段，实际 **15,931,074 → 11,056,329**，减少 **4,874,745 字节**；全部非 UI 区段逐字节一致。真实原生读回后展开主 UI 和原始六份模板，每项解码属性和顺序均与 D0 相等。该证据不能替代引擎内 GetChild/父级/事件行为或设备实测。

重建时禁用旧逻辑树 UI 缓存。删除旧共享定义前，必须验证原 GIL hash、相邻旧收据与实际模板索引、完整命名空间和外部引用（包括 grid.itemTemplate）；不属于本 owner 的同名模板拒绝修改。共享绑定进入严格同源审计及 BGM/完整音乐收据；缺失/篡改传播被负例拒绝。

### 2. 排除默认选人路径未使用的 selection133 字段

默认 native-v2 已优先使用 lowpolyHero。现在先严格验证其尺寸和非空有界数据，再省略旧 selection133；历史非 native-v2 路径仍保留原字段，源美术不变。真实 Lua 读取陷阱回归确认该默认路径不读旧字段，控件/图片/旋转计数保持一致。

同 D0 只替换画像脚本，实际 **15,931,074 → 15,802,695**，减少 **128,379 字节**，非脚本区段逐字节一致；剩余 133,441 个画像数据标量一致，原生 checker 0 errors。默认实际绑定后的画像模块 **736,778 → 608,399 字节**；不是旧报告未绑定模板时的971,304字节口径。

两项在同 D0 顺序组合为 **10,927,950**，共省 **5,003,124 字节**。全新干净构建 D2/F1 另外少127字节：共享模板482条 slot 值在晚追加探针全部用两字节；全新分配127条变为一字节，其余355条仍两字节，964→837字节。此127字节单独记为分配编码差，不伪装成第三项内容优化。D2 UI 区段为6,028,150，Lua区段4,871,646；服务器图区段长度仍9,153但原文不相同，不声称逐字节相同。

## 回归、审计及交付边界

- 最终音频/来源相关回归：205项，204通过、0失败、1个既有可选外部注册美术fixture跳过。音频修正前较广相关回归291项，290通过、0失败、同1跳过；不把旧阶段结果称为最新全套。
- 工程门禁（音频收据修正前）通过，包括 M1–M4 变异均被断言杀死、native UI 合同6/6；后续音频补丁不改 Lua。默认选人真实Lua输出、RC参数、缓存/来源/绑定负例均有单独日志。
- 用旧展开 D0 作基底重建 R1，再以已共享 R1 重建 R2：都为10,927,950字节、三份共享定义，不使用旧UI缓存，第二次增长 **0字节**。R1 为 d46，R2 为 bf74，分别记录真实身份，不作为同源收益对照。
- D0/D2/F0/F1 严格 audit **全部 FAIL**，同为 `UI_MISMATCH` 与 `GRAPH_COUNT` 两项。fixture有额外服务器图；UI差异沿用原始 source/encoder 严格比较，不放宽比较器。四者366个模块均 sourceTextIdentical；共享模板没有新增 TEMPLATE_MISMATCH。native checker 0 errors / 423 warnings 不能代替严格审计或官方验收。
- D0/D2 的366个模块中362逐字节相同；其余四个仅为新build UUID、原生模板索引和已说明的旧画像字段移除，比较器未发现未解释模块差异。原始 Lua、data、art、配置、package 和 CI workflow 未作本轮产品修改。
- 本地 `npm test` 在 d46 运行中发现音频收据缺陷后主动终止，**NOT_COMPLETED**；修正后做上述相关验证，未冒称 Full PASS。托管精确 HEAD/BASE Required/Full 未认证，不守候或轮询 CI。
- 独立审查 `/root/capacity_review` 对 bf74 / Release1cc 深审，修复最初三项发现后 PASS、unresolved=[]；独立抽取真实GIL并展开对照UI/六模板，核验来源和音频传播。详见附件 review.json；评审PASS不解除官方验收缺口。

交付保持独立分支和 PR #703。TASK-111 仍 In Progress，涉及官方/设备/最终 RC 的 AC 不勾选。仅将最新Release纳入本独立分支；未合入Release/develop/master、未发版/打Tag或操作游戏窗口。下一阶段官方验收必须使用真实基底重新冻结候选并绑定客户端版本/收据/截图与设备日志，不能沿用本轮样本或旧 C4 放行。
