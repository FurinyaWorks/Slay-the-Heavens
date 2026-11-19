# PC38：当前 Develop 的退出操作说明仍可达

## 结论与范围

- 检查对象：`develop@2ec45b9e52c870badc4d4888f6243a30556eecb4`，Git 树 `80bbcdd06283e0c272da4221eb35df457c6e8dac`。
- **PC38 / TASK-4.11「完整移除退出界面的操作说明」仍 FAIL**。当前默认生成布局仍包含 `exitPanel/help`、`exitPanel/guide`、`runMenu/help`；真实当前 Lua Host 的两个可见入口均可打开说明。
- 四项离线观察全部通过：菜单说明可达；放弃确认中的说明可达且关闭后回到警告；反复取消不改本局、确认才放弃；退出奇域取消/失败重试/重复提交抑制正常。这是旧行为与缺口的精确证明，**不是 PC38 修复通过**。
- 仅在 Linux/Fengari 中使用当前生成布局、真实 Lua Host 与现有 mock 原生控件；没有官方 PC/手机、GIL、导入、ready、容量或体验验收。不运行 Full，不操作 GUI，不验证怪物。

## 为什么没有重复实现

- `check-pr-slice` 对 TASK-4.11 返回 HOLD：任务已 In Progress、已有交付待验。Backlog CLI 在本环境不可用；没有手改任务、状态或验收勾选。
- [#690](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/690) 已关闭但未合并，最后 head `cd9106c0e302cb50f83ba8b5c85ce81560c6ed88`。其中已有菜单/说明退休成果及后续夹具修复；本证明不复制、重新声明或移植其实现。
- 接续应由原任务负责人比较该既有成果与最新 Develop，分离 PC38 的最小必要改动并协调输入/菜单相关文件所有权。HOLD 未解除前保持待验，不把本观察当作重新认领。
- #741/PC35 与 TASK30 由其他执行者覆盖；#738 和旧 Release 冻结。本包不改生产、现有测试、来源桥、Backlog、开放 PR 或工作流。

## 复现

在以上精确 Develop 的隔离副本中，安装/复用仓库既有依赖，然后执行：

```sh
npm run build:data
npm run build:ui
node docs/evidence/develop-pc38-exit-20261119/run.mjs /tmp/pc38-current
```

`run.mjs` 在执行前拒绝所有相对该基线的 tracked src/scripts/data/config/tests/package 改动。它直接启动 Fengari CLI 的 `-e dofile(probe.lua)`，清空 Lua 初始化环境，仅使用生成 Lua 与当前 `src/lua`；不经过可能投影历史源码的 `scripts/test-lua.mjs`。`report.json` 记录关键输入及全部生成 Lua/布局 SHA-256。

退出码 0 表示四项**观察**吻合；明确输出 `PC38_REMOVAL_REQUIREMENT_FAIL`，不得把诊断命令的退出码当作需求通过。生成布局属于仓库默认 `v25-reference` 主题，未额外启用其他资产/profile。

## 原始证据

- `build-data.log` / `build-ui.log`：本轮构建成功。
- `host.log` / `report.json`：最终真实 Host 4/4 观察及固定来源。
- `intake.log`：TASK-4.11 的只读 HOLD 原因。
- `initial-fixture-error.log`：首稿诊断错误，向 CursorArea 读取不存在的 `interactable`。仅修正诊断 helper，遵守现有原生合同，生产未改；最终运行独立完成四项。它不是产品失败。
- 本机日志只将本工作目录前缀脱敏为 `<repo>/`，不更改错误类别或事件顺序。
