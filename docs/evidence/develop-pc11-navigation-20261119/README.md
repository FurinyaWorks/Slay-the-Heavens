# PC11：区分默认回退与 official-assets 的导航入口

## 精确结果

基线 `develop@b1669c6db9d268f897f5380523bb82595279cdcf`。仅本目录证据新增，生产、原测试、Backlog、工作流及冻结旧 Release 未改。**不是修复、完整 PC11 验收或发布许可。**

| 本轮配置 | 观察 | 结论 |
| --- | --- | --- |
| `buildUI(out, undefined, {officialAssets:false, nativePageLifecycle:false})` | 当前生成 Lua 顶层 `Theme.presentationProfile=nil`，默认回退 | 4/4：未开局/同地图入口拒绝；节点预览单步返回与旧触点拒绝；菜单地图回退可用；节点返回主菜单再继续保持状态。 |
| `buildUI(out, undefined, {officialAssets:true, nativePageLifecycle:true})` | 当前生成 Lua 顶层 `Theme.presentationProfile='official-assets-first'` | 4/4观察吻合，但 **单一入口要求 FAIL**：同一营地上下文的顶栏 `runRoute` 和暂停菜单 `runMenu/map` 都可真实打开只读地图，重复入口尚存。单步返回、旧触点隔离、续局不变。 |

`official-assets` 是仓库显式的**非发布实验配置**；构建器拒绝与 `releaseCandidate` 合用。这不是官方客户端实测，不把该 profile 的缺口冒称默认回退也失败。无参数默认构建也不能因主题 JSON 的嵌套字段而称其运行时顶层 profile 为 `v25-reference`。

两个配置均从当前源独立构建数据与 UI，直接运行 Fengari，无历史源码 runner/投影。沿用 `official-assets-runtime.test.mjs` 的 mock 原生活跃状态适配，真实 Host 收到本轮配置的 `nativePageLifecycle`。只测试菜单、地图与营地，不进入战斗/怪物场景，不操作 GUI，也不测手机、小屋、亭子、PC35、TASK30 或 PC38。

营地准备沿用仓库 `map_menu_return.lua` 的真实连接路径，但直接推进中间 Map 节点而不游玩中间房间；因此不是双幕或真实玩法流程证明。快照深比 Run/Map、对象引用及 nodeFlow；重复返回主菜单期间有结算回调计数 0 的断言。

## 归属、旧成果与接续

- TASK-4.16 为 In Progress / delivery-verify，明确 `HOLD`，TASK-107 已交付会话语义；不重新领取、重写任务或重做续局实现。本环境 `backlog instructions overview` 返回 command not found。
- 本轮先查主仓开放 PR 与两 Fork（均无开放 PR）、当前 agent 和新版 WIP/分支规则；无 PC11 当前执行者。#741 继续独占 PC35，#738 仍冻结。
- [#690 最后归档交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/690#issuecomment-6983904194)：旧 PR closed/unmerged，固定 `cd9106c0e302cb50f83ba8b5c85ce81560c6ed88`，9处冲突和旧 Quality 失败，原完整成果保留。其旧 Release 接续路由已被新 AGENTS 的 develop 路由取代。
- [原产品来源 a9425afa](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/a9425afa50e2a1dd10e83634a3e5fc0d24633917) 已有分别收起官方重复入口及保留默认回退的方案。本轮仅读取原 patch：涉及 `abyss_game_ui_input.lua` 的菜单 route 绑定条件和 `abyss_game_ui_navigation_view.lua` 的 routeEnabled 条件。未搬回整包、未修改这些文件、未宣称旧修复已在当前源通过。
- 原维护协调方接续时应先处理原任务 HOLD/范围与所有权，再从最新 Develop 复用该最小行为切片，分别验证默认与 official-assets；不能用 #690 被关闭或本诊断退出 0 代替集成与设备验收。
- 本轮分支仅保全诊断证据，保持 `FROZEN`，不创建占位 PR。接续责任沿用 #690 指定的维护协调方，复核条件为原任务明确恢复及新的精确 Develop 候选。

## 复现与证据

```sh
node docs/evidence/develop-pc11-navigation-20261119/run.mjs /tmp/pc11-current
```

需已有仓库依赖，以及两张旅行者头像的真实 LFS 对象；runner 对比原基线 LFS SHA256/长度。它拒绝任何相对基线的 tracked src/scripts/data/config/tests/package 改动，分别生成两份 Lua/UI，使用明确目录的 `package.path`，不从公共 build 或历史 prelude 回退。

`report.json` 记录源/生成物与头像身份。`default-fallback.log`、`official-assets-nonrelease.log` 为最终 8/8 观察；命令成功表示复现吻合，official 路径明确输出 `PC11_SINGLE_ENTRY_REQUIREMENT_FAIL`。`intake.log` 和 `backlog-cli.log` 保留任务限制。

首稿两次诊断 helper 错误原样保留：`initial-profile-label-error.log` 在四项默认观察后拼接 nil profile；`initial-shortcut-target-error.log` 把容器当作 hit。只修正诊断标注和事件目标，不改产品；最终两配置重跑完整通过观察。日志仅脱敏本工作目录前缀为 `<repo>/`。
