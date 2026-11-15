# 图鉴按固定原版体验移植

Owner 手动导入 `a0dfc8a3-f22a-418b-8ffa-eebc805ef74e` 后确认三类图鉴能够显示，但指出六行名称列表和旁置文字详情远离原版，要求直接移植体验。本切片从自己已推送的 `6d4c477` 建立独立 `feat/compendium-source-port`，不接入发版分支、不创建 PR。

旧候选日志的本轮原始副本、解码与摘要在 [manual-observation](../evidence/compendium-source-port/manual-observation.json)。它只有匹配构建的启动/ready 打印和 Owner 的显示报告，既不证明体验通过，也不补齐手机或自动启动验证合同。

## 固定来源

参考社区反编译镜像 `aeubanks/sts@319009d5df0a82d9fb0f23cc22322286c6a87ec0`，不是认证客户端或开源授权声明。没有导入原 Java、原贴图、字体或音频。移植结构和交互，使用项目已有原生牌面、图标与调色板。

| 来源入口 | 本次实际使用的合同 |
| --- | --- |
| [CardLibraryScreen](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/screens/compendium/CardLibraryScreen.java#L121) | 颜色分组、0.75 卡面网格、滚动、悬停、释放后查看、关闭详情保留浏览位置；再开保留当前颜色并重置升级/滚动。 |
| [CardLibSortHeader](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/screens/compendium/CardLibSortHeader.java#L37)、[CardGroup](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/cards/CardGroup.java#L987) | 默认名称→稀有度稳定排序；稀有度、类型、印刷费用的升降序；同键保留前序，不把类型排序改成过滤。 |
| [Settings 中文开关](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/core/Settings.java#L381) | 中文原版禁用 A–Z 排序按钮，只有三个排序按钮。 |
| [ColorTabBar](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/screens/mainMenu/ColorTabBar.java#L124)、[AbstractCard](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/cards/AbstractCard.java#L1004) | 网格与详情共享升级预览态，逐张读取独立基础/升级副本。 |
| [SingleCardViewPopup](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/screens/SingleCardViewPopup.java#L65) | 居中完整大卡、暗幕、同一当前组有界左右邻卡；左右切换保留升级态，关闭清零；正文在卡内，右侧仅关键词/源码明确的派生牌预览。 |
| [RelicViewScreen](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/screens/compendium/RelicViewScreen.java#L545)、[SingleRelicViewPopup](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/screens/SingleRelicViewPopup.java#L57) | 七个稀有度段落、每行十图标、组内按本地化名称排序；同稀有度组有界详情。 |
| [PotionViewScreen](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/screens/compendium/PotionViewScreen.java#L305)、[AbstractPotion.labRender](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/potions/AbstractPotion.java#L552) | 三稀有度段落、十列瓶图、固定注册序、悬停提示；没有单独药水大弹层。原版滚动受 isModded 门控，不能描述成原版始终可滚动。 |

源码类 Git blob、入口及23条构造预览映射见 [来源收据](../evidence/compendium-source-port/source-reference.json)；独立来源审计人 `/root/batch_review`，本轮核对原文，不提交镜像全文。映射覆盖本批已核静态和特殊造牌候选，不声称全扫356份原类构造函数、证明其他所有卡均无预览。

## 几何与文字

按固定原版 1920×1080 归一化至本项目 1280×720，`scale=2/3`。这些是公式计算值，不是官方截图读数。

| 项目 | 同源目标 |
| --- | --- |
| 卡图鉴 | 五列 150×210，横/纵中心距 176.6667 / 236.6667；首列中心 X=-353.3333，首行 Y=81.8667，包含 open 的负滚动偏移。 |
| 颜色 / 排序 | 颜色中心从 -326.6667 按132递增；排序中心从 -353.3333 按150.6667递增。中文三排序；升级勾选 X=300。 |
| 卡详情 | official 共享150×210牌面按8/3放大为400×560，居中；550×770 source 命中框归366.6667×513.3333；左右箭头 X=±266.6667。native fallback既有148×208批准牌面比例保留，非像素一致。 |
| SCP 字体 | 中文普通字号模式：标题31、印刷费用51、类型23、正文32。单独取消父卡缩放对文字的重复放大。 |
| 派生预览 | 构造函数明确设置 cardsToPreview 才展示；中心偏移(316.6667,170)、160×224，不从随机生成效果猜牌。 |
| 遗物 / 药水行 | 十列，X=-240起按53.3333递增；依据各自 open 后静止 targetY 布局，不混用构造初值。遗物 targetY=653.3333，药水620。 |
| Hover | 0.75→1即4/3；200×280的独立展示层位于Grid外，原命中框和index不动；私有计时超过0.2秒才显示关键词/派生预览。 |
| 提示框 | 原宽213.3333、正文宽186.6667；药水左锚(-540,173.3333)，正常遗物hover左锚(-520,144)。source文字15映射另列，实际普通原生提示不降到18以下。 |

颜色标签原生点击区从 source 高33.3333扩大至48，并向上移14.6667，避免与同样扩大到48的排序条重叠。图标触区48，保留项目 C 档点选。source的提示15号字低于本切片普通原生文字的18号底线；在固定同源宽度按18重算正文行高、框高，关键词超出视口时才提供C档翻页，不改字号门槛。静止布局与上述公式核对；原版逐卡随机初始比例和入场lerp未在本切片重现，实际手感、设备滚动动力学未验。

Hover从真实Grid item geometry及scrollProgress求当前中心；独立层只含container/image/text，编译期拒绝任何隐藏CursorArea/Grid/按钮。图像没有CursorArea.raycastTarget属性，不能向图像乱写该字段；展示容器允许事件穿透，不重排Grid。popup打开时清hover，并置顶真正模态。F直接emit只能证明回调和身份，不证明官方鼠标hit-test。Hover派生图按普通renderCardPreview规则，SCP按自己的固定位置，二者不混用；literal16间距按文档的1920参考整体归一化。

卡详情复用完整共享牌面，仅详情正文改为源码的多行居中。模型按32号物理容量做卡内分段，逐字守恒，不主动调低声明字号、不搬到常驻旁栏；原生adaptive的实际效果未验。关键词用本项目已有静态状态说明及消耗/虚无语义，不创建临时战斗。

Expunger 构造使用 DESCRIPTION，实际 setX 才切换 EXTENDED_DESCRIPTION，不能从继承字段-1反推可见文字。公开原作卡图明确写未绑定的 literal X，与这条源码链一致；当前 provider 基础文字为0，本切片只显示副本统一为 X，不写回 provider、不假造已支付 X。派生预览和独立条目一致。参考图的 URL/hash 与非认证版本边界记在来源收据，不分发原图。

## 真实边界

- 原 Production provider 准入不改：356卡、149遗物、33药水。Prismatic Shard 允许的外色常规牌保留，外色起始牌和 originalV4 内容不新增。六个无 color 元数据的已准入状态/临时牌只在显示层归无色。
- 不创建 Run、不发物品、不消费随机流；没有 UnlockTracker 的持久收藏状态，不伪造 seen/locked 或新增账号存档。
- 卡面、美术、瓶层及遗物图来自项目批准的原生替代资源，不能宣称像素复刻。外色卡仅在图鉴 painter 使用已有调色板区分；红色沿用本项目岩旅行者造型。遗物大量专属图仍缺失，名称提示用于辨认，不掩盖替代图事实。没有数据的原作遗物 quote 不编造。
- 网格小卡沿用已批准共享卡面的字框/字体规则；SCP大卡和新提示独立按来源字号/有效原生最低字号处理。普通小卡不是原字体资源的逐像素复刻。
- 药水保留原三段瓶阵，静止第一屏33瓶与3标题均在视口内。原生 Grid 提供平台浏览；C 档点击固定同一说明，再点同瓶/空白处/返回收起，属于无悬停设备适配，不冒称原版独立药水详情弹层。提示没有移植原作液体/容器多图层动画，使用批准瓶图与已有色值。
- 图鉴内仅对已核 constructor 的 cardsToPreview 建有限映射；Anger 自我复制、Wish 三选项和随机生成不推测为单张预览。映射中的父/子升级关系分别核查，不统一套父升级。
- Controller确认/返回测试只证明真实manager的回调与scope，原生手柄未实测。PC Escape不是同一输入路径；未取得已核原生Escape API，不将C返回按钮或F的Cancel emitter说成原版PC Esc已移植。C返回、外部点击及再次点同瓶的恢复入口有离线证据。

离线 HTML 是真实 Host 控件树诊断：未知 SDK 纹理只标 ID；native Grid 裁剪与声明的暗幕颜色显式模拟。SCP 固定字号的诊断图禁用浏览器私自缩字，原始 scene 仍保留真实 native min14/adaptive 元数据；此图不能证明官方字体实际保持32。

共享的`scripts/official-assets-preview.lua`本轮只修诊断dump遗漏的descriptor scale/运行时fontSize，不是生产Lua。前小卡/浏览器缩为18px的诊断图、原始字段与修后物理32模型对照见 [渲染差异](../evidence/compendium-source-port/preview-rendering-difference.json)。

## 验证状态

本轮 [验证收据](../evidence/compendium-source-port/verification.json) 绑定六个生产模块的冻结 SHA/Git blob，并逐文件保存原始日志、复杂度报告、架构及33场景完整控件树摘要。

- 图鉴专项5/5通过，保留旧手势和缺入口两项负控；之后只将hover数学拆为纯函数以满足复杂度，冻结源码下两个实际Host profile再次2/2通过（16.042秒），没有重跑整套无关测试。
- 全部124项图鉴职责测量最高15；现有静态14项显式历史告警、零新增，原2161项职责门禁通过；架构352模块/1981边通过。
- 默认和official真实Host覆盖六tab并集356、三种排序稳定性、共享升级、费用1→0/X/不可打出卡面、同组有界邻卡、卡内长文/换行守恒及实际物理框容量、nil-color展示身份/外色材质/回收恢复、延迟hover/模态优先、生命周期/旧手势、1基延迟Grid、Controller确认返回、三段33瓶首屏、完整Data/Presentation不变及NoRun/RNG拦截。
- 三主题33个真实Host离线场景已生成。来源桥与完整corpus准入由root独立维护、另有可追溯独审，旧archive/proof/current未改；详细证据在相邻的`compendium-source-port-20261115`子目录。

提交后还需exacthead ratchet与整分支独审，新候选由独立构建执行者生成。旧候选能启动不代表新代码已官方导入；手机、官方容量、实际滚动/字号、原生hover hit-test及 Owner 对新体验的确认保持未验收，不将源码移植说成产品已完成。
