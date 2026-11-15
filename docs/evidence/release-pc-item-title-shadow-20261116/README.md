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

最小产品接续只在reward owner选择性逐字复用689 `hidePool` / `paintShared` 两helper，以同一canonical `relicId(item,run)` 调用；相对c41为14行新增、2行删除。保留原potion分支、bca source优先/unknown语义及每态装配：全树32个药水池/55个遗物池是容器数，每池容量为药水10、遗物16图元；敌人池32图元。不新增素材，不移植689共享root布局或任务文件，选择依据是本片最小范围，并非其16槽容量不足。后续任一分支先合，另一分支须在新Release基线上合成单一正确binding，重新核源/测试；本轮不接管TASK-38.8。

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

两个新用例由一个新增 `.test.mjs` 文件发现，本地实际观测约80秒合计、每个子进程原上限60秒；这不是Hosted或跨平台耗时上界。CI实际新target库存/分片与source接续交主线程专片核对，本片没有修改时间预算或用新库存冒称原CI准入。

## 独立组合审查与接续状态

`release_items_product_review` 对精确产品 `df5ad3dc` 及证据后继 `2cb6206e` 的组合审查为 **CODE_SCOPE_PASS_WITH_LIMITS**，findings/unresolved为空。32项非证据路径和3个可执行证据验证器均明确覆盖，194项原变更路径/blob列清；28项源blob、689两helper逐字相同和逆移等价均复核。报告 `independent-review.json` SHA256 为 `cf8d881298d6d6fa9ebbaf588498ec2093f869fdb954c1a2b02d5cab94c1f33d`。

独立探针以精确c41的missing/throw RED对照df5 GREEN；使用真实生产Reward/Art与synthetic原生句柄，不能冒充Host/设备画面。另保留一项继承边界：人为使当前GetChild索引仍返回已转属foreign parent的同池时，before/current均有写入；现有reward固定池没有自然reparent入口，未找到现有native合同允许该不一致，因此不列为确认新增回归。新增72用例证明的是旧缓存句柄转属且当前索引换新池，不是所有foreign-current lookup均通过。17份独立原始探针、初次依赖路径失败、许可及归档核验输出无损保存在 `independent-probes.json.gz`，摘要见对应receipt。

主线程通过Backlog CLI补回PC18/21/01来源AC、实施与未验记录，维护原状态和已验历史；并记录PR684/690与并行685–689真实归属，没有复制Task38.8或重复性能PR。当前完整38项接续见 [台账](../../backlog-details/PC-QA-20261115-CONTINUATION.md)。这些说明/任务修改未改变df5执行输入。

来源专片核对发现retirement父JS默认未知成本10秒低于本轮约80秒观察；在既有分配中代入真实样本会使POSIX预测越原20分钟target。正在使用既有localLowerBounds精确绑定当前样本/执行闭包并重排，原target、guard、timings旧条目、用例与分片数不改；未把原默认预测通过当当前准入。原5项源FAIL、旧单进程超时以及后续补验将分别保留身份。

上述是产品执行者2cb检查点的历史结果；之后主线程已完成以下接续，不把新通过覆盖旧失败。

## 当前来源接续及未验要求

原source6cc与证据6f3已独立SOURCE_CI_COST_PASS_WITH_LIMITS；8个Lua owner只按当前df5产品绑定，旧完整前驱/历史目标保持，原5项失败已实际补验。后续发现Full raw阴影夹具缺official profile，216/c344修入口并按独审纠正真实共享布局快照。原始nilfigure、TEMP缺父目录与两轮green均保存；新fresh父测3/3、wall22,235ms，非Hosted或官方耗时。

最终e2eb代码/aac证据的[独立增审](../release-item-title-shadow-source-1116/independent-increment.json)为SOURCE_CI_COST_INCREMENT_PASS_WITH_LIMITS，findings/unresolved为空；其SHA256为ea3df94f44ee20ea29291e3b72019aedcf565d595c90d909f278f45cebdf90f9。生产packet e52c不变，当前CI29ed620c为47项；只新增test-lua行和5个已改current行，其余41行/全部before/93旧档案记录/库存不变。新shadow样本778物理前后输入匹配，仅移除其自己的新增floor作精确配置投影；retirement79,861ms及旧receipt/成本/unknown/分片保持，新shadow下限22,235ms如实追加。

按docs/CI.md168原Owner政策纠正此前错误建议：forecast及60秒预留只诊断，物理workflow45/30/local75才硬验；所有旧冻结预算断言不变。独立源6项与12组增量探针通过，原22/80秒样本和73未重跑。目标主树本轮原5失败+新6source+raw1共12唯一合同通过；实际命令因父模块导入与显式cases双注册执行16次，按[integrated-final-contracts.json](../release-item-title-shadow-source-1116/integrated-final-contracts.json)如实保留，不叫16独立要求。[58项组合覆盖](admission-coverage.json)逐Gitblob匹配产品、原来源、harness和增审，无遗漏。

Backlog各任务仅CLI续接，PC13还新增[既有684路径的限定诊断](../release-pc-settlement-trace-20261116/README.md)，没有新delay或重复任务。最新38条保持完整；[另片PC26/30](https://github.com/FurinyaWorks/Slay-the-Heavens/blob/bcca699509a159f21555d870f96fdfeca7191856/docs/evidence/release-pc-picker-controls-20261116/README.md)已推送双审查分支，两片不互借绿灯。

最新Release仍36b9；共同前置PR692实际落地后，必须从新Release before接续共享来源/复审，再提交本片正常Release PR。不复制其10项修复、不建占位草稿。当前本地合同/限定审查通过不等于当前RequiredCI或未来组合通过。完整Full、正式GIL/候选写入、官方导入、新ready、PC/实体手机、同候选官方20MB关卡/3MB服务器及RC静动态负载仍UNVERIFIED。未访问私图或操作GUI/MCP，不改develop/master/Tag或发布，日常负载不授发布许可。
