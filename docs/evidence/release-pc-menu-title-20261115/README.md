# PC01 主菜单既有标题与按钮最小恢复

基线：`36b9b157ee6f05b65eb9f1da7e2978647d36c210`（Release）。来源链：`3cf8b502636ff8d3d6e5b0cb78e62c9aedb8601c` → `65ceb74e797c26ce1cd9c526ff4099460304afd5` → `fbfc3dfd2bda556ff9bacb1b7d483c191f175c4f`。本片仅恢复既有来源，未重新绘图或访问私人原附件。PC01 原话见 `docs/qa/playtests/pc-20261115-verbatim.txt` 00:12–00:33（集成树保存）；最新直接反馈支持实施恢复，并不构成此标题样式的设备终验。

产品只改 `v25-menu-layout.mjs`、`ui_theme.json` 的 menuPresentation 五字段，并加入已有378三角静态 `menu-title-mark.json`（原字节 SHA256 `e1b8e8b19b881465f80d9ae7d96f4e857ff2d5f70f5835788d5ff15252f77698`）。复用既有三角、四态与菜单事务；保留 Release 的 continueRun、导航和结算逻辑。旧文字标题仍由结果页所有，不盲目打开它。未改背景、Lua、字体、规则或旧冻结源断言。

## 本轮执行证据

- 先将来源有效回归放到未改产品 Release：2项中1失败，原因是实时菜单无 titleMark；`red-title.log.gz`。实现后同来源2项通过；`green-title.log.gz`。随后在同一现有用例补充 continueRun 原触点、三入口四态、装饰层级及定位保护。
- 数据、默认UI及主题生成通过，布局JS语法与差异空白检查通过。所有构建和Host沿用 Node24.18.0、现有依赖与原时限。
- 当前 Host 定向12项全部通过：菜单指针/控制器边界、继续同局、奖励选择续接、标题退出、破坏性操作确认、一次平台结算、旧触点与C档焦点；`targeted-host.log.gz`。独立悬停连续性和四态/胜负结果恢复41断言通过；`hover-continuity.log.gz`、`four-state.log.gz`。
- 真实 default / official / V25 三份生成树通过；`profiles.json` 保存各树 SHA。default 保持默认皮肤，不含该实验标题；official 与 V25 各有一个416控件 titleMark，沿用同一原背景子树（1733控件，含外层menuRuinsScene；SHA256 `8c884b4edb72e1be3c05e15d4321bc691eb50ba413034fde4b2c9d9b41a4d694`），与 `menuRedScene()` 逐字节一致。两份非默认真实全树分别加载对应生成模块，既有 controller 会话回归均通过；`generated-host-*.log.gz`。这些是生成树计数，不是官方容量。
- 原生预览合同16项：13通过、2失败、1可选浏览器集成跳过。失败为菜单CI及集成CI精确冻结源合同检测到本轮主题/布局/测试新字节；`frozen-contract.log.gz`。本片保留原合同失败，交集成接续，不称 Full 或 CI 全绿。

首次全树Host错配了默认主题与official生成树，出现控件绑定nil；随后修正验证器查找顺序，产品未为此改动。原失败留在 `profiles-initial-theme-mismatch.log.gz` 与 `generated-host-official-initial-theme-mismatch.log.gz`。曾用多文件参数调用只接收单文件的Lua CLI，原用法失败也保留；改为分别执行后通过。

## 证据与未验边界

`source-bytes.json.gz` 无损保存基线、完整来源和本轮执行源码（含原换行）；`log-inventory.json` 给出每份原日志解压字节长度与SHA256。提交时Git按仓库规则规范文本换行，源码存档保留的是实际执行字节，不冒称工作区原字节与提交blob完全相同。`profiles.mjs` 是可从工作树根执行的离线复核器，不是正式候选构建器。

本轮没有生成正式GIL、没有SDK画面或官方导入、新ready、PC/手机实测、官方容量读数；没有访问私人原图或发布。PC01产品定向回归通过不等于用户视觉终验，TASK-103.3不据此标Done或勾实机AC。独立评审与冻结源接续由主线程办理。
