# PC26 / PC30 共享分页与房间按钮离线修复

状态：产品独立复审已通过，最小来源接续已组合，来源独审进行中；不是官方或设备验收。TASK-103 / TASK-103.2 经Backlog CLI续接，状态In Progress，原已勾与新未验AC均保留。

基线 `release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`；首轮产品 `a925ce43bda10030d7dfd7fe7b96c450c17f8702`，独审纠偏后当前产品 `93ae73760ecbe6540fac49d96c2309345d6b7824`。分支 `feat/release-pc-picker-controls-1116`。首轮7文件身份见 [identity.json](identity.json)，本次4文件增量身份见 [hover-fix-identity.json](hover-fix-identity.json)；产品执行者707da检查点未推送、开PR或改Backlog，之后CLI/来源接续由主线程另提交。未改develop、master或Tag。

## 来源与边界

反馈来源是 PR676@e14e7c9bd13371319a2ea96500513b514973d287。原文保存在另一独立树 `F:/New folder/.worktrees/release-pc-closeout-1115/docs/qa/playtests/pc-20261115-verbatim.txt`，本轮只读，SHA见身份清单。

- PC26 41:12–42:59：锻造闪烁；42:02希望避免混用滑动和按钮，42:11明确要求评估，42:19允许平台成本约束；42:29–42:54明确要求返回营地、确认升级、翻页和继续按钮与全局统一。
- PC30 47:10–48:06：移除卡牌、营地升级、查看牌组的样式应复用同一体系。
- 私图07/09本轮不可访问，未声称已看图。样式问题并非全部延期：现有组件与Token足以修复本片。是否把可选事务页换成原生滚动，需要当前能力、事务与性能证据；本片不猜测替换分页语义。
- PR684加载/局部cover、PR685远虑多选Grid、PR690导航及图标/shadow/menu组合不进入本片。

## 具体改动

只在正式 `official-assets-first` composition复用最终已采用的组件。四个既有分页按钮（删牌 previous/next、锻造 forgePrevious/forgeNext）直接借用永久卡组浏览器的四态材质与200×48尺寸，沿用已有锻造页脚行。返回/确认直接借用当前选角页最终低控件旗帜材质；没有采用旧的高图元曲线实现。页码正文保留各页面已有位置，避免删牌的页码压住选中预览。动态价格/长按钮文字允许现有最小字号适配。

原节点hit、按钮、标签、action和选卡事务身份保留，新增部分只有无输入装饰。原normal/hover/pressed/disabled状态驱动装饰，旧平面表面隐藏；按压缩放由借用的组件执行一次。永久卡组仍是既有5列只读浏览器；default profile的44×208侧箭头与56×44锻造箭头不变。规则、RNG、分页步长和确认/取消命令未改。

## 验证与原失败

运行时为现有Node24.18.0与Fengari，生成真实正式UI树并通过当前Lua Host执行；并非原神LuaHost或设备渲染。

| 证据 | 结果与适用范围 |
| --- | --- |
| [red-layout.txt](red-layout.txt) | 在36b9生产源上新增生成树回归2项均失败，缺共享浏览器/旗帜装饰。 |
| [targeted-layout.txt](targeted-layout.txt) | 27项通过：Deck、Node、牌堆、奖励行、共享布局与Host切片。 |
| [official-contracts.txt](official-contracts.txt) | 原相关合同4通过、2失败完整保留：历史integration SHA、当前合同仍要求旧44×208分页hit。 |
| [current-contracts.txt](current-contracts.txt) | 主线程明确确认用户要求采用现成共享按钮后，当前official合同按同一Deck/选角组件精确断言，9项通过。未改其它几何/身份断言；default旧尺寸有独立保护。 |
| [green-host.txt](green-host.txt) | 最终新增5项全通过；旧44×208 hit和错误材质负控均被拒绝；1280×720、1920×1080、2340×1080及720×1280安全区与不遮卡牌/预览/按钮静态检查。 |
| [official-host.txt](official-host.txt) | 原4项Host合同通过：商店按钮墨色、旧返回触点、17牌永久卡组、0/1/5/6/17牌及回收。 |
| [fast.txt](fast.txt) | 既有advisory Fast成功完成17 JS+48 Lua。最终修订当前official测试预期/负控在此运行后由上述定向测试覆盖；生产代码不再变化。Fast明确要求后续完整Quality，并非Full通过。 |
| [frozen-source.txt](frozen-source.txt) | 最终单独复核历史integration来源合同仍失败：official-assets-layout当前09332935…，冻结c1fb214d…。原适配器和SHA断言未改，交主线程严格接续。 |
| [syntax.txt](syntax.txt)、[lua-static.txt](lua-static.txt)、[architecture.txt](architecture.txt) | 语法、Luacheck与架构通过；职责复杂度原上限15不变，351模块/1988边。 |

新增Host用真实生成树检查14牌只读查看；删牌5页首末页、禁用态、悬停/按压、旧触点跨刷新无效、取消不扣费、确认只删所选牌；锻造2页末页、重选、当前列表缩至1页后页数收敛、无cursor能力C档点选、确认升级与既有等待后继续。卡牌包含现有长说明能力牌。几何和完整字符串检查不等于原生字体视觉验收。

中间静态检查曾捕获 `ctx.paintButton` 复杂度16超过15，提取本模块 `sharedButtonChrome` 后原门槛通过；未增加预算。原失败没有通过放宽阈值处理。

Node断言diff的空白行含空格，完整base..HEAD diff-check将其报告为尾随空白。两份失败日志的原始字节另存 `official-contracts.txt.raw.gz` 与 `frozen-source.txt.raw.gz`；对应可读txt仅清理行尾空格，原失败内容与断言保留。

## 独审P2纠偏

独立复审对a925给出REQUEST_CHANGES：14牌锻造首屏真实CursorEnter后，底排卡片保持既有1.08缩放，新200×48分页与内侧card8/11新增交叠，外侧card7/12交叠也扩大。原静态未悬停检查漏掉此边界。独立初始反例完整保存在 [review-hover-independent-before.json](review-hover-independent-before.json) 与 [review-hover-independent-host.log](review-hover-independent-host.log)，未改原2FAIL或冻结来源报告。

先在a925生产源上补真实Enter/world矩形回归，捕获 `hover card11 forgeNext overlaps`，原始字节保存在 `review-hover-red.txt.raw.gz`，可读输出见 [review-hover-red.txt](review-hover-red.txt)（仅规范化缩进空白）。修复只用现成卡高、底排行、hoverScale、Deck按钮高度与`space.xs=4`推导两行位置：hover下沿-217.4，分页中心-245.4（上沿-221.4留4）；底部返回/确认中心-303.4（上沿-273.4再留4），底沿-333.4仍在safe.y=20的-340以内。未缩小卡片、hover、按钮、触点，未改材质、动作或预算。

[review-hover-green.txt](review-hover-green.txt) 记录当前6项定向通过：14牌首末页、26牌完整中页且双分页可见，真实Enter/Exit后读取当前Host变换；在1280×720、1920×1080、2340×1080三个分辨率计算world矩形，检查所有可见卡与分页/页码/底按钮无交叠，选中预览与底按钮不盖，底按钮安全区；原长文/C档/事务链路、当前official完整身份合同、default旧尺寸和错材质/旧hit负控保留。仅复跑相应定向测试与改动JS语法检查，没有再次运行Fast或不变大套。产品已发独审按93ae增审；本段不是独审通过结论。

复现命令均在本工作树，`node`指上述现有Node24：

```text
node --test tests/release-picker-controls.test.mjs
node --test --test-concurrency=1 --test-name-pattern="^approved pages keep|scene and button substitutions|both official build orders|official selection flags|run pages share" tests/official-assets.test.mjs tests/official-assets-legibility.test.mjs
node --test --test-name-pattern="shop keeps readable button ink|17-card shop permanent deck|browser return rejects stale|permanent browser handles" tests/official-assets-runtime.test.mjs
node --test --test-name-pattern="^historical approved pages" tests/official-assets.test.mjs
node scripts/test-affected.mjs --fast --base 36b9b157
node scripts/check-syntax.mjs
node scripts/check-lua-static.mjs
node scripts/check-architecture.mjs
git diff --check 36b9b157ee6f05b65eb9f1da7e2978647d36c210..HEAD
```

TMP/TEMP在根`.artifacts/release-picker-temp`，依赖和Luacheck物理复用既有安装。未执行Full、GUI、MCP、候选写入、官方导入或ready；没有PC/手机帧时、原生滚动性能或本候选官方视觉证据。PC26的加载闪烁仍由PR684独立验证；完整PC26/30与相关任务验收保持未完成。

主线程接续：产品独审精确绑定707da/93ae，结论CODE_SCOPE PASS、unresolved为空；[最终报告](independent-review.json)与[初REQUEST_CHANGES](independent-review-initial.json)均保留。Source作者9ff8c89f已选择性组合为2a3f836f，实际7个产品blob不变；[来源证据](../release-picker-controls-source-1116/README.md)记录source6/6、owner/copy7/7、历史5/5和raw1。原source失败仍是历史事实，未删改为通过；新身份与产品回归不混算。

最新Release仍36b9，独立PR692修复共同bootstrap来源/工作流失败但尚未合入。按仓库PR依赖入口，本片先保全分支与审查，待该前置实际落地后从新Release before接续共享来源、复审并提交正常Release PR，不重复其10项修复。预测及60秒预留按docs/CI.md168仅诊断，物理工作流实际超时保持严格核验。官方候选、ready、容量、PC与实体手机不因此完成。
