# 商人分页离线审阅

在本独立工作树运行：

```powershell
node experiments/merchant-dialogue-review/generate.mjs
```

复用现有 Node/Fengari 依赖及 `runLua`，不安装包、不操作桌面或MCP。输出 `build/merchant-dialogue-review/receipt.json` 和自包含 `index.html`；直接打开HTML即可选短/中/长句、6种实际台词、9/12字符预算及点击/自动路径，前后翻页比较。产物在已忽略的build目录，生成器不改生产源码、文案、布局或Backlog。

固定before `9f2f44e4`、after `119d62f9`，两版实际 `abyss_merchant.lua` 均由Fengari执行。共同文案、主题和Prologue从Git读取并校验一致，源码及SHA256写入收据。几何来自实际通用/official投影的 `merchantControl` 构造器输出；HTML字号与线框用其真实值，可选择放大倍数；浏览器溢出保持可见并单独提示。

每个版本×2预算×6台词×2路径共48条采集。字符守恒、预算上限及tap/auto完整页文本相等在生成时断言，不复制分页算法作为oracle。点击每0.25模拟秒，update步长0.025秒；保存完整页文本、页开始/最终文字出现/结束时间与点击事件。进店只采叙述，队列转入问候时结束，问候另有独立采集。

这是离线真实生产模块和控件替身的分页样本，HTML是结果查看器，不是原生截图。模拟时间不是GPU/设备性能；浏览器字体和裁切不能证明官方显示。未取得本轮候选、官方导入、ready、PC/实体手机或用户最终阅读确认。长句语义规则与超预算闭引号仍沿现有行为，不能把此样本当整任务已解决。
