# 版本说明

本文件保留供人工填写千星奇域「奇域信息」官方更新日志的玩家文案：只记录新增玩法、内容、操作体验和玩家可感知的修复，不逐条复制 Git 提交。技术变更另见 `docs/versions/ENGINEERING.md`。版本日期为源码版本整理日期，不表示该日已在平台公开发布；真实发布凭证及平台版号见 [GitHub Releases](https://github.com/FurinyaWorks/Slay-the-Heavens/releases)。

历史版本目录：[docs/versions/README.md](docs/versions/README.md)。

`v1.0.0` 为正式参赛作品的待验收候选，与旧 Alpha 作品独立。2026-10-29用户确认旅行者已通关两幕并授权发布：本版只开放岩系旅行者，雷电将军移至下一版本。实际平台发布凭证尚未登记，以下版本日期不代表已经公开上线。

## [2.1.0](https://github.com/FurinyaWorks/Slay-the-Heavens/compare/engine-v2.0.0...engine-v2.1.0) (2026-11-26)


### 新增

* **art:** 接入正式角色透明度准入 ([#995](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/995)) ([454b589](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/454b589793c8d3a171ccbcaee0db1c809136c683))
* **ui:** unify responsive viewport and pointer coordinates ([#984](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/984)) ([44d1fd3](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/44d1fd3148e7bbf472adc8110fceb06eeb0f041a))
* **ui:** 为下一版增加选牌瞬亮与出牌旋转反馈 ([#799](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/799)) ([0c6f5a0](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/0c6f5a036366230ccf7f777c471b923f9e4c03b5))
* **ui:** 回流 [#854](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/854) 的 49 张事件插画 ([#857](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/857)) ([3f3c2ca](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/3f3c2ca97cdc71cf6de604d39a4201b03c8b66f1))
* **ui:** 接入两幕接地与全屏战斗体验 ([#1007](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/1007)) ([e483c6a](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/e483c6a191dc8dd7622e0cb137e7b8581b171af8))
* **ui:** 收口商店与选角入场及组合回放修复 ([#912](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/912)) ([c420b02](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/c420b02841c61d5270fd8588d072fc62ec9a5071))


### 优化

* **startup:** preserve formal lazy loading through entry ([#957](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/957)) ([31107da](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/31107daac7f5a6a44189bf93bcd0caedc5c4ae6d))
* **ui:** 加速牌堆浏览并统一原生圆角按钮 ([#811](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/811)) ([637898c](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/637898cbdb81feb3feeda2123536fd1338518d5d))
* **ui:** 只读牌库 5×2 分页与全项目手柄移除 ([#899](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/899)) ([392fae8](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/392fae8d8dee2bd57829dda0e8da836f45107398))
* **ui:** 回流 v2.1.1 已上线的地图、战斗与牌组优化 ([#962](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/962)) ([77b7e87](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/77b7e87ac5abc9ef5c4953cfd47b5d77408e55d2))


### 修复

* **battle-ui:** 回流防御牌确认区透明修复 ([#821](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/821)) ([b8eece3](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/b8eece34d93da2069c991c6f00bece49bce07aaf))
* **build:** 回流 v2.1.1 已交付的构建修复 ([#963](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/963)) ([27e2f83](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/27e2f8304bcbaedffa0efbc02d739bd4aeab38b6))
* **build:** 无损压紧候选美术负载 ([#807](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/807)) ([73fd14a](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/73fd14aab04c590037c39197364f725a767fed19))
* **ci:** authenticate Fork push receipt source before replay ([#934](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/934)) ([02dcb24](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/02dcb2466b2c90308f9a9e42896c2c5af3ed288c))
* **ci:** measure formal performance from exact GIL readback ([#998](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/998)) ([8a5f868](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/8a5f86813e993a9b8cd85dd8016a2943d4a7c629))
* **ci:** restore runtime previews from the verified Full bundle ([#980](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/980)) ([8d76bc4](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/8d76bc4d22ecc147fb82d99454e56f2466762f58))
* **ci:** 兼容隔离的队列状态发布作业 ([#859](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/859)) ([73c2148](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/73c21489efaab409d4c0c46bee517d410d3427fc))
* **ci:** 校验现行 Lua 清单并接续历史回放 ([#844](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/844)) ([9d78b91](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/9d78b9111198a18590cf439f2027c9278a255fc5))
* **combat:** preserve atomic card effect groups ([#895](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/895)) ([3b53374](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/3b533744e369246f2eae505d637e860399f743f7))
* **combat:** 修复酸叶团和棘刺团分裂后重叠 ([#809](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/809)) ([aae9487](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/aae948788d93012d11fe5b6da3281150bb9957c6))
* **develop:** 同步远虑、状态触点和旧离场回调修复 ([#842](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/842)) ([1aceec7](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/1aceec72a3522b98c9921deb48a266965c0e5187))
* **develop:** 回流 v2.0.0 Release 加载、房间和奖励修复 ([#837](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/837)) ([27ffd73](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/27ffd73f9e783653b7b4edb2fba0d96db52e7063))
* **develop:** 回流 v2.1.0 正式脚本文本审核修复 ([#951](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/951)) ([b2f74d9](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/b2f74d99a3d80e60b99165b6380987cda8b4488d))
* **map:** 还原 STS1 地图细节与首领宝箱流程 ([#817](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/817)) ([57ebfc2](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/57ebfc20ca726ae00f739147f38b234bd08ff752))
* **relic-ui:** 回流岩脉残晶图标统一 ([#822](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/822)) ([cd454bd](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/cd454bd8dbd9241a119603fcd67439492c121ead))
* **shop:** 同步商店入场重做至 develop ([#838](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/838)) ([742a540](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/742a540ffc999e91acdface3d8fc7f753731f0a8))
* **ui:** backflow face-down Match cost concealment ([#883](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/883)) ([0397645](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/0397645a8ffa5eb8af2e02d7c033ef5c486fbf1e))
* **ui:** ignore stale mobile shop taps after map preview ([#776](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/776)) ([e095a08](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/e095a08a5d4b544ee9629b0ea24f2d27cdb9f8a6))
* **ui:** keep shared event choices readable ([#992](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/992)) ([114a5c0](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/114a5c0b739ad8cccbc99e59fe7ba4112014d3cf))
* **ui:** 保留回流顶栏的原生模板契约 ([#943](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/943)) ([7348ab8](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/7348ab8598c8607712d525bd732239f89bb52830))
* **ui:** 减少战斗详情写入并对齐关键词与力量说明 ([#981](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/981)) ([d723d57](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/d723d57dcaf5d11447a3fdbd21c5bbee0c6a009b))
* **ui:** 加速战斗中打开抽牌、弃牌和消耗堆 ([#868](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/868)) ([d7ae494](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/d7ae494a3136b2f4f707428fefeeae478c6e0495))
* **ui:** 同步商店删牌共享布局热修 ([#938](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/938)) ([559980d](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/559980dd45bc5310c449417a7a48a99a8e6562d2))
* **ui:** 回流 Release 卡牌阅读和排版修复 ([#940](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/940)) ([a111076](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/a111076f1afa0093fbc8e916f5cbd2ee68c7a79b))
* **ui:** 回流 Release 已删除的操作说明与血量修复 ([#814](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/814)) ([d7d77fe](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/d7d77fe88d3b6fef6da233cfad0ec9361094db0d))
* **ui:** 回流 STS1 卡组与牌堆浏览修复 ([#904](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/904)) ([103aa40](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/103aa4072bd3801deb6bf090455bd974181a9647))
* **ui:** 回流共享顶栏完整数值修复 ([#942](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/942)) ([05d711e](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/05d711eb9df092ecc75213adde276ed6d24cf83e))
* **ui:** 回流地图进入房间的反馈和恢复 ([#876](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/876)) ([0022968](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/00229683d0d38660c98ced2f4a41e89d84fc5e4e))
* **ui:** 回流药水弹窗和遗物栏修复 ([#872](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/872)) ([03c02ae](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/03c02aeb81d405123a528f06685da1c71a8c1aed))
* **ui:** 对齐并收紧遗物详情弹窗 ([#867](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/867)) ([19d4be4](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/19d4be4d9af4bf42635a224a118fc99898ea7898))
* **ui:** 恢复旅行者战斗状态悬停提示 ([#816](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/816)) ([7e3f38f](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/7e3f38fda4c17eb7b17eb9d0dc4eba8d79e9d02f))
* **ui:** 恢复正式战斗界面的原生控件容量 ([#819](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/819)) ([535c541](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/535c541515ca93e21a4189efaa604776b975507e))
* **ui:** 恢复牌堆返回与圆角按钮的原生图层 ([#823](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/823)) ([82ba375](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/82ba375397ffd7f8f8175a7a1fd18a973450ecc6))
* **ui:** 战斗结算后直接显示奖励 ([#818](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/818)) ([ff8b9ba](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/ff8b9baf67a965c45820914b3bbed273ffb3293c))
* **ui:** 收口 STS1 主菜单、顶栏交互与页面 Fade ([#812](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/812)) ([c186c1d](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/c186c1dce398727440c25d9db36022c27ed771a8))
* **ui:** 正常加载时隐藏并禁用菜单恢复入口 ([#787](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/787)) ([345ba08](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/345ba08398b6ca8e1361a126f2ce1de85210e634))
* **ui:** 统一全局操作按钮与地图返回位置 ([#869](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/869)) ([beba19b](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/beba19bad25db7de71f96af521656c13b882909b))
* 一次接回 v2.0.0 Release 修复 ([#820](https://github.com/FurinyaWorks/Slay-the-Heavens/issues/820)) ([1ed6bf6](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/1ed6bf6e31aabcde87cca8b868fca1ed2e5eec4f))

## v2.1.1 (2026-11-25)

### 优化

* 怪物精绘数据在首次使用时解码，减少标题初始化时的计算。
* 减少启动时绑定地图控件的重复查找。
* 减少战斗中重复更新敌人名称的开销。
* 减少官方卡组打开和翻页时重复更新控件的开销。

## v2.0.0 (2026-11-21)

### 优化

* 更新主菜单、选角和战斗界面，选角时保留立绘原色。
* 更新 42 种敌人的战斗立绘，让不同敌人在战斗中更容易辨认。

### 修复

* 修复营地锻造选牌和升级预览，取消后回到原来的卡组位置。
* 修复战斗取消选牌、出牌界面遮挡以及顶栏生命值显示不全。
* 统一战后奖励与局内的遗物图标。

## v1.0.0 (2026-10-31)

### 新增

* 提供岩系旅行者的第一幕、第二幕冒险与本局结算。
* 保留卡牌构筑、奖励、商店、事件、遗物和药水，以及同局跨房间和跨幕资源连续。

### 优化

* 首发只开放岩系旅行者，集中改善首局体验与操作稳定性。
* 主菜单显示当前版本号，更新说明通过奇域信息查看。

### 修复

* 修复动态敌人控件生命周期与战斗界面刷新中的异常。
* 修复部分拖牌取消、目标选择与卡组查看交互异常。

## v0.11.0 (2026-10-28)

### 新增

* 加入蜥蜴尾巴、黑星等遗物效果。

### 优化

* 本版集中提供岩系旅行者的两幕冒险，其他角色暂不开放。
* 恢复开场演出、祝福对话和地图节点类型说明。
* 按试玩反馈恢复上一版拖牌索敌连线与准星效果。
* 主菜单仅保留简洁版本号；更新说明改用奇域信息中的官方更新日志。
* 商店重新排列卡牌，改进物品详情查看与购买确认。
* 宝箱集中展示奖励，并增加开箱动作与逐项呈现。
* 营地休息显示恢复效果；锻造支持长卡组翻页与升级前后对比。
* 改善卡牌操作反馈、牌堆查看和宝箱领奖流程。

### 修复

* 修复普通玩家在选角页面被“正式版本尚待验收”提示阻挡、无法开始冒险的问题。
* 修复打开卡组或遗物列表时的失效控件报错。
* 修复药水说明按钮拖动时误用药水，以及部分遗物显示英文名称的问题。
* 修复部分受击、死亡及奖励处理顺序造成的异常。
* 修复特定情况下商店物品无法正常查看或操作的问题。

## v0.10.1 (2026-10-27)

### 修复

* 修复「破裂」效果的触发顺序。
* 修复致命伤后的复活与生命变化反应顺序。

## v0.10.0 (2026-10-27)

### 新增

* 扩展第二幕事件、钥匙和战斗内容。
* 支持手柄导航，改进卡牌选取和出牌操作。
* 在主菜单加入可查看的历史更新公告。

## v0.9.0 (2026-10-26)

### 新增

* 新增四位原创角色与 300 张配套卡牌。
* 扩展跨章节的战斗、事件与物品效果。

## v0.8.1 (2026-10-25)

### 修复

* 修复移动端共享背景未铺满画面的问题。

## v0.8.0 (2026-10-25)

### 新增

* 整合 75 张战士卡牌及中文说明。
* 补充药水、特殊事件及探索中的随机变化。

## v0.7.0 (2026-10-25)

### 新增

* 增加部分角色与怪物动作、打击音效及场景音乐。
* 在卡牌说明中显示动态数值颜色及增减提示。

### 修复

* 修复药水使用、奖励领取和战斗交互问题。

## v0.6.1 (2026-10-24)

### 修复

* 修复拖牌误触、重复开局和格挡显示等问题。
* 修复地图选路信息及误导性的状态图标。

## v0.6.0 (2026-10-24)

### 新增

* 接入开场演出与独立战后选牌界面。
* 加入 Boss 宝箱和正常药水奖励流程。

### 优化

* 改进地图导航、敌人意图及状态详情展示。

## v0.5.1 (2026-10-24)

### 修复

* 修复状态说明短按显示与敌方意图预览问题。
* 修复部分地图操作、战斗流程与触控异常。

## v0.5.0 (2026-10-24)

### 新增

* 补充未知房事件、祭坛选项与怪物分裂机制。
* 加入卡牌动态数值、状态及敌方意图详情。

### 修复

* 修正多类敌人行动和战斗结算顺序。

## v0.4.0 (2026-10-23)

### 新增

* 完善主菜单、胜败结算和部分敌人行为。

### 优化

* 改进地图与战斗反馈、卡牌选择和输入处理。

### 修复

* 修复多项战斗规则、敌人行动与操作冲突。

## v0.3.0 (2026-10-23)

### 新增

* 接入 30 张卡牌与拖牌出牌操作。
* 完善商店、营地、事件和宝箱界面。
* 加入查看卡组、敌人行动及基础打击反馈。

## v0.2.0 (2026-10-23)

### 新增

* 加入 15 层路线地图及可滚动的地图界面。
* 连通开局、地图选路、战斗与结算流程。

### 修复

* 修复出牌失败仍消耗资源及满手抽牌问题。

## v0.1.0 (2026-10-22)

### 新增

* 加入基础回合制战斗、起始牌组与奖励结算。
* 接入九种状态效果与旅行者卡牌文案。
