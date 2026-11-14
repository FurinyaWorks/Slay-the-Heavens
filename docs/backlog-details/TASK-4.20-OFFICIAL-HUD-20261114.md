# Official共享资源读数：字号与完整阅读

基线 `9f2f44e4`，独立本地分支 `feat/official-hud-readability`。不推送、不创建PR、不合并，不更改发布候选。

## 确认的源码缺口

TASK-4.20原回归只检查 `gameLayout()` 默认布局。后续official投影的共享HP/金币组件将首选字号设为18、最小字号设为14；原HP框62×36、金币框44×36。既有五位金币压力在18号下也需要54设计单位，只能依赖回缩。源码里没有compact或省略数字，`abyss_numbers.integer`与实际writer保留完整整数，但原小槽位仍可能放不下这些完整值。

新增回归执行最终 `buildUI(...,{officialAssets:true})`，预加载它真正生成的主题和控件，再通过真实GameUI writer采集地图、战斗、节点三页。旧实现获得有效RED：`/mapPanel/resources/hp: critical number must not shrink`，`14 !== 18`。旧三页HTML与原始采集保存在 `build/official-resource-readability/before/`。

## 有界修复

- 保留最新认可的official数字首选18号，HP/金币下限跟随18，不扩成恢复全库旧通用28号方案。角色名标题仍保持原16号及原最低值，避免从HP克隆后意外出现首选16/最小18倒挂。
- 共享HP框扩为104×36，金币框扩为72×36；局部重排左侧图标和资源、药水起点与地点文字槽。五药水槽、49步长、地点和路线入口及原交互保持。
- 实际最终布局断言覆盖HP/金币完整命中、5个药水提示命中、地点文字槽与路线入口，两两不相交。新压力覆盖 `9999/9999`、`999999`，这只是容量压力，**不是两幕自然可达上界**。
- 节点页原无资源完整阅读入口。新增透明hp/gold热点与独立 `abyss_node_resource_hints` UI层适配器，在实际 `abyss_ui` 的GameUI构造后装配。它复用原 `Overlays.openingCovered`、`canManagePotions`、`inCombat` 与 `resourceHint` factory，最终仍由既有 `DeckUI.inspectText` 阅读精确值，没有自造notice、假Run或新资源格式。
- 适配器只在真实节点、无覆盖模态且原资源策略允许时生效；严格匹配Down/Up/代际/Run，处理拖出取消，区分Controller自身Confirm与指针去重。refresh/update会发现并重绑新原生命中句柄，退休旧句柄；重复刷新不重复注册，disable/destroy不可复活。没有修改在途PR663拥有的GameUI/menu源码。

## 本轮验证与产物

`node --test --test-concurrency=1 tests/official-resource-readability.test.mjs tests/official-run-hud-reuse.test.mjs tests/topbar-gold-exact.test.mjs` 最终5/5通过（18.3秒），包含新增节点完整阅读、原生句柄生命周期、Controller与旧购买确认防穿透；沿用原有时间/输出上限。

最终official回归通过实际入口读取地图/战斗/节点的13位金币、10位HP/上限，确认完整数字在现有全文分页内可达；HUD writer仍输出原完整值，没有缩写或静默截断。节点操作比较HP、maxHP、金币、药水数量不变，并拦截全部 `abyss_sts_random` 函数以拒绝随机流消费。

节点专项还覆盖旧触点跨菜单、resize、拖出取消、真实控件子树销毁与替换、旧回调拒绝、新句柄重绑、重复refresh不增加Controller记录、实际Controller确认读取与同帧指针拒绝、销毁后Controller回调失效。布局与完整阅读均来自真实生产控件/命令，而非只比较静态默认 `gameLayout()`。

另锁定真实商店购买确认动作：先选中商品、保留confirm的Down/Up，再经新HP详情打开/关闭，旧confirm Click必须拒绝；完整Run与Map可达图逐表比较内容、引用和metatable都不变。首次夹具只提供Down/Up而没有Enter，原节点按钮按现有能力合同未注册指针反馈；补齐真实Enter/Down/Up/Exit/EndDrag能力集后通过，不修改原节点输入协议或放宽断言。

产物位于 `build/official-resource-readability/`：原始 `capture.log`、`scenes.json`、三页压力HTML，以及实际完整读数视图HTML。完整阅读导出保留真实DeckUI子树、明确标注省略背景；首次重复全场景导出触发既有1MB stdout的ENOBUFS后改为该有界子树导出，没有提高缓冲或测试时限。全屏压力三页仍保留。所有图均是离线控件/浏览器示意，不是官方客户端。

环境失败另记：初次旧exact-gold回归缺默认 `build/lua` 夹具，补执行 `build:data/build:ui` 后原断言通过。Official构建需要的两张现有肖像预览因跳过LFS而为指针；仅在本树临时补齐经原收据SHA256认证的本机源图，提交前恢复指针，不提交无关素材。

## 自然范围与未验收要求

Collector重复TorchHeads不能证明Feed/Hand of Greed可无限成长：`Combat.summonEnemies`统一设置minion并加minion状态，两种击杀奖励都排除minion。另一方面，不能仅凭 `Run.gainMaxHp` 的单渠道2147483647 guard宣称所有增长路径已有同一上界；尚未完成全部来源、随机生成、跨域组合的两幕可达上界证明。

另一执行者在同一固定基线只读复核了两条正式机制。`abyss_silent_final_cards`的炼药使用limited池，`abyss_potion_random`明确排除果汁，不能直接推导“炼药无限加血”。战外使用熵之药则由`abyss_potion_generation`使用非limited池，能生成果汁与后继熵之药；释放药水槽、饮用果汁、丢弃其余瓶的命令链确实存在。果汁本操作在`abyss_potion_health`有2147483647算术守卫。这不是证明任意长链或自然最大生命。

`abyss_watcher_final_cards`的许愿、`abyss_relic_family_combat`的勺子弃回与回抽复用机制也存在；原正式跨色奖励允许取得这些常规卡，未开放角色入口无需启用。相关金币增长函数对超过2147483647拒绝，不是静默clamp。上述仅证明正式定义、生成渠道与受控操作，确定性随机流不能当独立50%概率推导任意长度，更没有完整两幕自然seed的采购、奖励、存活和长期复用记录。本轮既有熵药7组、生命药22组、许愿基础/升级各选项及商店遗物12组夹具通过；都是受控回归，不能当自然或设备证据。

本轮没有改变规则、平衡、账户、后端或整数上限。更大压力通过完整阅读入口核验，不表示顶栏任何长度都能整行容纳；不为此发明科学计数、硬cap或把压力状态冒充自然通关。TASK-4.20的完整AC2仍须结合所有合法值/实际显示证据逐项判断，不能整条自动勾完。官方候选、导入、新ready、实体手机/PC、阅读距离、200%字号及AC5仍未验。
