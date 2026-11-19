# PC03：排序测量，不臆造比较器优化

## 结论与证据边界

基线 `develop@62328bdac7703c3ab241e0ddb19e0fa05474f76a`，tree `420171af6a98385c3641cf7d59fbb8f0e53a50d0`。本轮只新增证据及通过 Backlog CLI 追加 TASK-103.6 交接，不改生产、原测试、工作流、默认配置或旧 Release，不认领另一套实现、不勾 AC。

每种配置分别运行 12/60/200 张牌、获得顺序/类型/耗能三模式各 5 次，共 90 次排序，18 组观察。

| 当前构建配置 | 每组 5 次排序的 Grid 刷新总数 | 每组准备层 `SetVisible(true)` 写入总数 | 观察 |
| --- | --- | --- | --- |
| 默认 `officialAssets:false, nativePageLifecycle:false`，Lua 顶层 profile 为 nil | 10（平均 2/次） | 15（平均 3/次） | 日志每组有 5 次新的 preparing→visible；同页不重新遮罩要求仍不满足 |
| 显式 `officialAssets:true, nativePageLifecycle:true`，顶层 `official-assets-first` | 5（平均 1/次） | 0 | 当前共享浏览器已有同步刷新/复用，没有重复全屏准备 |

计数是每组前后取差，不是逐次 2/3 或 1/0 的独立断言。平均 3 次可见写入不等于三次肉眼黑闪。这里观测的是模拟原生控件调用，未测真实画面。显式 official-assets 是构建器禁止与 releaseCandidate 合用的非发布实验配置，不能冒称正式发布配置；也不能把默认主题 JSON 的嵌套字段当成顶层 runtime profile。

最终样本 12 张牌的 `table.sort` 加仪表回调为每次约 0.12–1.24 ms；200 张压力输入的耗能排序约 19.63–20.93 ms。**60/200 张均为合成压力输入，不证明产品支持这些牌组容量。** 没有证明玩家所报 2–3 秒由比较器造成，不提交缓存、排序规则或生命周期优化。原字符串耗能顺序、同键稳定次序及独立升降偏好均未改变；本轮不是完整排序规则重验。

## 方法与不能推出的结论

- 从当前源重新构建两份数据/UI，以隔离目录直接运行 Fengari，不经过历史 Lua runner 或源码投影。
- 实际 GameUI Host、DeckUI 和 PageReveal；fixture 接入现有 readiness predicate 与 mock 原生活跃状态适配，不是正式 bootstrap、客户端或原生渲染器。
- 停留地图打开永久牌组。用已有牌 ID 合成压力输入，直接调用 `setSort`，不运行战斗/怪物场景，不验证鼠标输入延迟、拖放、手机或其他已有执行者范围。
- 共享 fixture 默认只回调 12 个 grid cell。probe 按公开的尺寸、间距、padding、列数补足滚动位置 0 的可见 cell 回调，不回调全部离屏牌；这是诊断模拟适配，不是产品修复。
- `os.clock` 在本机 Node Fengari 中调用 `process.uptime`。这些是云端进程 elapsed 毫秒，不是 CPU、PC 端到端延迟、FPS 或正式性能阈值。`comparatorMs` 包含完整 `table.sort` 及计数回调；`clickMs` 为同步 `setSort`；`settleMs` 固定执行 5 次模拟 update/refresh，不是等待首帧用时。并行云工作及仪表开销会影响数字。
- 每次完成后深比 Run，唯一排除正常推进的 `elapsedSeconds`；牌组内容、UID、随机流及其余 Run 状态不变。未声称覆盖真实异步 cell、取消/陈旧输入或大牌组设备容量。
- 无 GUI、Full、Hosted dispatch、CI 重跑、GIL 导入、ready、官方容量或设备验收。

## 原任务、候选与交接

- TASK-42.1 在此基线为 To Do，read-only intake 返回 ALLOW；它不是绕开其他在途任务的授权。当前同页准备层具体缺口归 TASK-103.6（In Progress，AC 全未验），不重复实现。
- [#672 最后交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/672#issuecomment-6906487402) 保留 `1f7ce04c53189db8c39b59c797a45d57a2c7bac1`，closed/unmerged，由 #684 等拆分接续；不是原整包已合。
- [#684 最终交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/684#issuecomment-6984133401) 为 FROZEN，完整来源 `10d7ef9658872ec7d118b585fbc81e3da585c552`；Ready/弹窗生命周期留给原维护协调方接续。旧评论的 Release 路由已被最新 AGENTS 的 develop-first、旧 Release 冻结规则取代。本轮不移植整包或重开原任务。
- 执行前已核现行 PR/agent：PC35 #741、冻结 #738、手机及 source continuation 不重复。PC01/04/06/07/08/19/23/25/26/28/29/30 所属原 UI/地图/商店任务处于 In Progress 或 delivery-verify；没有把原成果待验视为自由实现。其余非移动端 To Do 是背景制作 TASK-4.2，不为寻找优化而跨入美术生产。
- 后续：原维护协调方先对账原生命周期来源，明确当前配置和最小接续，再在最新 develop 验证默认与实验配置，取得同候选官方/PC/相关手机证据。数字不能替代这些验收。
- 本证据分支 `verify/develop-pc03-sort-20261119` 以 **FROZEN** 收口，负责人为本轮 PC 离线验证协调者。只在原协调者接续或新的精确候选需要复验时恢复；无占位 PR，不占实现 WIP。最终远端提交身份由独立审查读回并交付主协调者。

## 复现

```sh
node docs/evidence/develop-pc03-sort-20261119/run.mjs /tmp/pc03-current
npm run verify:backlog
```

需要仓库依赖及两张旅行者头像的真实 LFS payload；runner 校验基线指针 SHA256/长度，拒绝 tracked src/scripts/data/config/tests/package 的差异，保存构建和输入摘要。最终 90 次观察均符合上述两配置差异；runner 成功不表示默认重遮罩问题修复或 PC03 验收完成。Backlog 校验通过，任务状态/原 AC 未变。

`initial-diagnostic-failures.txt.gz` 保留首稿错误：把正常 elapsedSeconds 推进当成 Run 变更、共享 fixture 的 12-cell 上限、首版补回调误用列数 3，以及稀疏检出缺少官方头像布局/MILESTONES/SCOPE/产品验收证据。仅调整诊断与展开既有输入，未改产品来迁就测试；最终两配置和 Backlog 均重验。压缩/原文 SHA 与长度在相邻 JSON，日志只替换本工作目录为 `<repo>/`。
