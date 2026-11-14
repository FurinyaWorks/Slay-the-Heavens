# 局外三类图鉴：独立本地实现

基线为 `9f2f44e4`，分支 `feat/production-compendium`。本轮不推送、不创建PR、不合并，不更改正在准备的发布候选。

## 实现范围

原有 `abyss_compendium_catalog` 只提供只读数据，GameUI没有三个可浏览入口。本轮增加独立布局、UI和host适配模块；在 `build-ui` 末段生成三入口/列表/详情，在原生 `abyss_ui` 的真实 GameUI 构造后装配。没有修改PR663拥有的GameUI、主菜单布局和导航源码。

未开局的主菜单提供卡牌、遗物、药水入口。列表每页只保留6个固定行控件，不为356张卡、149件遗物及33瓶药水批量建控件。沿用已有Production provider、基础/首次升级只读预览、中文详情；长说明按保守字符及行预算分段，上一段/下一段可查全。无Run、发放物品、收藏解锁或新后端。

新host使用独立 `compendium` 模式；打开/关闭调用原host的resize代际失效入口，防旧菜单手势穿透。图鉴入口自身另跟踪menu/character/exit等上下文，跨界面后旧Up/Click不能重新打开图鉴。保持现有GameUI原方法，图鉴关闭时恢复原菜单；resize关闭图鉴，disable/destroy不会恢复已禁用host。图鉴占前台时隐藏齿轮并拒绝原openMenu/openExit，避免打开不可见菜单模态。

## 验证

- `npm run build:data`、默认 `npm run build:ui` 通过。
- `node --test --test-concurrency=1 tests/compendium-ui.test.mjs tests/native-startup-contract.test.mjs` 覆盖实际三入口、三目录全部列表页、基础/升级、长说明/密集换行守恒、旧Start手势、图鉴入口跨选角/退出模态的旧手势、拖出取消、resize、disable及销毁后拒绝。测试拦截Run.new、math.random/randomseed及abyss_sts_random所有函数，验证实际浏览路径不创建Run或使用随机。
- 实际Controller适配器覆盖三入口确认、返回主菜单，以及隐藏齿轮没有资格/不能打开模态。首次该新增用例证实自身Confirm被已消费指针标志误挡，现已区分Controller动作和鼠标去重；最终图鉴4项Node回归全过，原生启动专项另已通过。
- 原始 `gameLayout` 未附加图鉴时真实Lua入口测试在 `missing actual generated catalogue entries` 处失败；将上下文代际更新禁用的受控负例在 `old entry gesture survived characters transition` 处失败。负例不改工作树生产源码。
- 主控已验证架构和固定Luacheck；新增模块归UI层，未添加告警基线例外。
- 标题高度按仓库既有原生整行经验合同 `minFontSize * 1.45 + 4 <= height` 修正为60设计单位，标题/计数间留空；新增递归断言检查native/official/V25新控件全部文字区域。浏览器能显示不能替代该原生合同。
- `node scripts/compendium-ui-preview.mjs` 实际构建native/official/V25三种模式，通过真实GameUI+适配器调用和既有动态控件导出器生成12份快照。先让主菜单入场动画完成，再分别采菜单/卡牌/遗物/药水。产物位于 `build/compendium-preview/`，HTML由既有 `official-assets-preview` 渲染器生成，不是手工重画的假页面。

首次构建子进程被沙箱EPERM拦截，授权本地执行后通过。official初次构建遇到跳过LFS后两张肖像仍为指针；只读根源图的SHA256与现有selection-budget收据一致，临时补齐本树两张PNG后成功生成。提交前恢复本树原指针，不提交无关肖像变化，不修改根源图。

主控已实际查看native/official/V25菜单和official三类图鉴浏览器截图，三入口没有与既有开始、帮助等命中框重叠，图鉴正文和按钮可读。未知SDK纹理仍仅显示资源ID，截图不是原神客户端或官方美术验收。

## 尚未验收

本轮没有官方GIL构建/导入、新ready或实体手机与PC客户端实测；没有远端CI或发布/合并。列表、文字容量及键鼠/触屏/手柄的真实设备行为仍需同候选验证，不能据离线源码和快照将TASK-4.19整条置Done。主控统一管理Backlog状态及验收勾选。
