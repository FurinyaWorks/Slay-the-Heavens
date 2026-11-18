# Release 致命故障停乐回迁

## 修正

Release `1ceb7c1a` 缺少已合入 develop 的 [PR #730](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/730)：界面发生致命错误后，独立原生服务端 BGM 仍可继续播放。仅回迁原七行 `abyss_ui.lua`，不改正常 disable/销毁行为，不接入新玩法、怪物或技能。

生产提交为 [2ce3e130](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/2ce3e130a04392a1206c3eb6a76b55eaa838c790)，树 `54a4c9aee55ce6d93e3cf1510e1e0e8ae1e5d93f` 与本地已审生产检查点完全一致。回归场景逐 byte 复用 #730；不复制其 develop/#729 来源链，改为 Release 现有链上的一个完整 owner 接续。所有旧证据不变。

## 本轮验证

- 原始 Release 真实启动并播放 MAP 后注入致命 viewport 错误，断言 `fatal failure did not stop active BGM` 失败，确认回归红灯。
- 修复后原八场景 8/8：地图、战斗、STOP 自身异常、三个非 boolean 启用值、普通 disable、引擎销毁及迟到回调。
- 原生启动入口和新来源负例 3/3，12.83 秒。
- 来源 epoch / 完整校准 128/128，219.32 秒。
- 集成历史来源 23/23，408.99 秒。
- JavaScript syntax 与 `git diff --check` 通过。

以上业务/来源回归运行在本地已审 `0a9334fc`。CLI push 因未登录而失败，远端 ref 不存在已确认；随后使用既有 GitHub connector 上传同一生产树。为使证明中的 producer 指向真实远端提交，仅重绑定 producer 和派生 packet/helper hash，生产及测试场景不变。最终另验来源负例 1/1、125 个实际生产 owner、完整 CI 叶子及隔离 helper-copy，见 `final-identity-green.log.gz`。未把传输前的来源 hash 冒充传输后的 hash。

独立只读评审 `release-fatal-bgm-20261119-independent-01`：无阻断；确认七行与 #730 一致、无 #729 隐含依赖、125 owner 置空及五个 CI 文件漂移均被拒，历史 string/Buffer 和 foreign 字节边界保留。此为独立代码评审证据，不是 GitHub approval 或 hosted CI 通过。

环境准备先遇到 sparse checkout 缺 tools/theme，补齐并重新生成后才进行上述红绿实验。两份既有 LFS 证据仅按原 oid/size 物化用于验证，未写入新的差异。

## 边界与接续

- 没有运行重复 Full，没有改工作流、门槛、保护或原证据。
- 没有官方候选写入/读回、导入、ready、录音或 PC/手机实测；TASK-34 的实测 AC 继续开放，不是 RC 或发版许可。
- TASK-34 intake 返回已实现待验 HOLD；本轮只按明确安排修复 Release 漏接，不重新领取整项。Backlog CLI 缺失，未手改任务状态。
- Release Ruleset `27313515` 本轮读回为 active、strict，Actions 来源 `check` / `presentation` / `engineering-posix` / `inventory`，仅 squash，无 Merge Queue；已有 PR-scoped 管理角色 bypass 不使用。只按正常 PR/CI 门禁交接，不直接合并。
- 原始压缩日志与摘要见本目录；所有测试通过结论仅覆盖对应日志和身份，不代替之后的 hosted CI。
