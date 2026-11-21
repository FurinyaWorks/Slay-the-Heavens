# 商人组件的 SDK 逐帧核查

TASK-4.10.1 的隔离取证，接续已合PR655与既有 merchant-reading-audit。执行当前原样 `abyss_merchant`、`abyss_merchant_pages`、`abyss_prologue`，通过现有生成器构建主题，按真实 `merchantControl`/`officialAssetsTheme` 装配 SDK 控件；不更改生产代码、台词、字号、页预算或交易。

在仓库根使用项目既有0.5.2 SDK export，选择全新输出目录：

```sh
node experiments/merchant-native-reading/run.mjs <existing-sdk-session> <新目录>
```

SDK来源和本地导出方式沿已完成的 TASK-25.7 控件实验。工具不会安装依赖、下载图库、渲染画面或操作用户桌面。输出每套布局的实际挂载Lua、生成主题、逐帧关键事件与总收据，保留输入/工具/SDK摘要；已存在的输出目录会被拒绝，失败轮不覆盖。

两套布局分别记录自动旁白全部完整页、SDK pointer逐页手动读取且逐字对等、加速、直接购买/拒绝反馈、隐藏十秒的暂停与拒绝命中、恢复、同局再入及新局旁白。可见点击精确核对命中ID，隐藏时须无命中；每套30控件、场景变化无新增分配，最后全部释放。`React('buy'/'poor')` 是组件presentation调用，不是实际购物；完整 NodeUI/Run 交易由既有 mock 控件回归另外验证。

状态 `component_passed` 只覆盖组件与SDK输入模型。模拟时间不是墙钟/加载/FPS；没有软件截图、真实字体/裁切、GIL、官方客户端、设备或用户阅读批准。既有短尾页仍在，不代表同句拆页或阅读体验已经解决。

本轮记录与原始反例：[接续报告](../../docs/backlog-details/TASK-4.10.1-NATIVE-READING-20261118.md)。
