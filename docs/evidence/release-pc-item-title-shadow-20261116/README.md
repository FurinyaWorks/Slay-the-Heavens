# Release PC18 / PC21 / PC01 产品组合

唯一基线为 `release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`，独立分支 `feat/release-pc-item-title-shadow-1116`。原三个切片由自有提交逐个 `cherry-pick -x` 组合到 `c41b162b1d01069d7f78f647a28a6ca70a9d8097`；没有合入 develop、PR684/导航或其它未合产品，没有改 Backlog、source witness/CI adapter、规则或预算。

## 来源与路径核查

`provenance.json` 冻结原组合：PC18 `9fc7e700` 的20个非证据路径、PC21 `bb4771f4` 的5个、PC01 `6750950f` 的4个（包含测试、配置和许可清单）全部 Git blob 相等；生产路径没有交集，无手工解冲突。三个来源同以 Release36 为祖先，无运行时硬依赖。图标完整带入 `0345006e` fallback 与 `bca8c5f1` 权威 source alias 修复，未只接初始图标。

- PC18：`lowcost-{potion,relic}-art.json`、`lowcost-art.mjs`、`potion-art.mjs` 及 battle/reward/node/shop/discard/relic-view 原 owner；包含对应配置、许可及回归。保留42药水（33比赛+9 full-source）、121遗物配方（120比赛实际来源+1 Act3保留）、149公开ID（120 recipe+29不同native映射），不把native-only当缺素材。原88遗物断言、42敌人文件保留。
- PC21：仅 `build-ui.mjs`、`official-portraits.mjs`、`abyss_feedback_actor_painter.lua` 和两项测试；批准idle脚位 `[1.5,-93]`、既有椭圆、同宿主动作/alpha/生命周期。未带 health painter 或后续 idle。
- PC01：仅 `menu-title-mark.json`、主题五字段、`v25-menu-layout.mjs` 与现有测试。背景 `menu-red-scene.mjs`、Continue动画Lua逐blob与Release36相等。标题416控件、背景1733控件为生成树计数。Continue动态装饰线旧P2仍未修/未验，不能泛称Continue动画通过。

各源原始RED、失败、通过、独审与未验说明留在原日期证据目录；来源独审只认证各原切片，不认证本组合。

## PR689 新归属核查与最小接续

主线程发现 draft PR689 `23bed75c642f8f4af5c2783526a5afc4a57f471f` 与本组重叠 `scripts/lowcost-art.mjs`、`src/lua/abyss_battle_reward_layout.lua`。689把四态图标提升为每行root共享fallback/16槽；本组PC18仍每态1池，两者几何不同。不能将689的+28控件证据用于本组，也不能整文件覆盖丢失PC18药水注册、权威resolver或完整素材。

实际缺口是当前owner在pool查找missing/dead/throw或替换时，仅恢复native图，没有隐藏此前仍alive且仍归本owner的旧pool。真实生成Host首反例已失败；独立只读审查以当前生产Lua和synthetic handle重证missing/throw RED，并用689同条件GREEN对照，见 `pr689-item-icon-overlap-audit.*`。这项审查绑定原组合c41，不作为新产品独审。

最小产品接续只在reward owner选择性逐字复用689 `hidePool` / `paintShared` 两helper，以同一canonical `relicId(item,run)` 调用；相对c41为14行新增、2行删除。保留原potion分支、bca source优先/unknown语义、每态32/55池拓扑及16槽容量，不新增素材，不移植689共享root布局或任务文件。后续任一分支先合，另一分支须在新Release基线上合成单一正确binding，重新核源/测试；本轮不接管TASK-38.8。

新增回归采用当前生成Host的真实每态控件，首次真实Host刷新后逐故障直接调用当前生产reward painter。每个fixture同时保留两行；每次调用还比较另一行icon、pool及全部16图元的可见性/几何/颜色前后快照，防止两行相互污染。两行×四态×（同/换图各3种失查+替换/恢复+owner转属+真实fixture destroy不可访问）共72项；每次调用递归比较完整Run/data/RNG，fixture只同步自己写入的rewards，无字段排除。测试按两行分两个新鲜Lua进程，每进程保留60000ms预算；这是生成控件上的painter合同，不能称完整Host压力矩阵或设备结果。

首版Host反例聚合在replacement恢复断言早停；随后整Host矩阵、直接painter矩阵、一次完整快照oracle矩阵及首次单进程GREEN尝试均触原60秒预算，日志全部保留为真实失败，未作通过。最终按行拆分保持所有语义断言和时限。

## 本轮验证与证据边界

精确命令、退出码、时间、stdout/stderr原字节与gzip长度/SHA256见 `runs.json`。新增接续最终结果由同目录最终收据记录，不用旧通过覆盖失败。

- 现有 `test:related -- --base 36b9... --plan` 返回 `full=true`，原因为 `config/luacheck-baseline.json` 属未建模输入；仅计划，未运行Full。
- 原三片组合：构建data/UI/theme通过；图标5/5（原fallback25、alias139、42药水四入口、原注册器及失败路径）、阴影2/2、菜单当前有效分支6/6、hover连续性、四态/结果41断言通过。
- 当前三profile生成树通过；official/V25各有一个titleMark并与自己的生成主题配对执行完整session Host通过；背景SHA256均 `8c884b4edb72e1be3c05e15d4321bc691eb50ba413034fde4b2c9d9b41a4d694`。未重跑来源67/10等无关整套。
- 原三片工程通过：351模块、6167/6167测量、1993边、无新增静态诊断、6条历史告警。日常平台负载通过但保留五项增长warning，默认profile `artPools=0`；不能用该默认计数认证official图标/阴影，更不是官方容量。
- 最终产品冻结为 `df5ad3dc3b8b02e56d93a4dfe394b103dc0498e9`。退休保护的两个新鲜进程各36项通过，加入peer像素不变断言后的最终时间为37753ms/41862ms；先前未含peer断言的两进程通过也保留，但不替代最终版。现有图标5/5再次通过（包含139 alias/boundary、25 fallback和原药水/缓存/失败路径），没有重跑阴影/菜单无关整套。
- 最终工程通过：351模块、6169/6169测量、1993边、无新增静态诊断、6历史告警；日常负载通过并保留原五项warning。此两入口分别为 `node scripts/check-engineering.mjs` 与 `node scripts/platform-load.mjs daily`，不冒称还执行了npm工程链后面的mutation/native合同或完整check。
- 当前冻结preview合同16项为 **10 PASS / 5 FAIL / 1可选浏览器SKIP**，五个失败都为完整源/linked owner/CI冻结身份与本轮产品新字节不一致，原始断言未改。不能沿用PC01单片13/2/1，也不能把初图标40/44当组合结果。统一source/CI接续后再验，不运行Full来掩盖已知冻结源缺口。

Node24.18.0与固定Luacheck物理复用既有安装，未npm install。TEMP/TMP在工作树外 `.artifacts/release-pc-item-title-shadow-1116/tmp`。`input-receipt*.json.gz` 保存完整tracked运行输入/测试/配置/素材身份、物理node_modules及Luacheck身份、Node hash与环境；Git tree绑定其余tracked文件。运行时新生成树不借其它工作树产物。

最终输入收据包含5320个tracked输入、684个物理依赖文件及1个固定Luacheck文件。`continuation.json` 证明原29路径中28个仍与对应源blob相等，唯一reward owner新增补丁仅为689两helper与一处调用：逆向删除这两helper并恢复原两行即逐LF等于c41前驱。`retirement-source-bytes.json.gz` 为Git来源LF正文，实际工作区原字节身份另在输入收据和逐运行 `*.source-inputs.json.gz`。可运行 `node docs/evidence/release-pc-item-title-shadow-20261116/verify.mjs` 只读重验归档hash；不触发产品测试、CI或设备。

两个新用例由一个新增 `.test.mjs` 文件发现，保守本轮成本约80秒合计、每个子进程原上限60秒；CI实际新target库存/分片与source接续交主线程专片核对，本片没有修改时间预算或用新库存冒称原CI准入。

source/CI接续、原路由Full、正式GIL/候选写入、官方导入、新ready、PC/实体手机实测、同候选官方20MB关卡/3MB服务器容量和正式RC静态/动态负载均UNVERIFIED。未访问私图、无新字体/纹理、未操作GUI/MCP、未推送/开PR/调用merge:auto、未修改master/Tag或发布。普通日常负载PASS不代表这些产品验收或发布许可。
