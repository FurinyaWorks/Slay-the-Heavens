# TASK-113 · 确认弹窗首批离线验收

基线为 `develop@364f43e8d7e0c03835676f2867ab9be0db496d29`。候选为包含本记录的同一源码树。两侧均启动正式配置的 Lua Host，从已有本局的主菜单点「放弃本局」，并通过 `STS_UI_CLOSEOUT_PASS`。完整规格见 [UI 设计规范](../../design/UI_DESIGN.md#语义文字与确认弹窗task-113)。

| 离线宿主 | 前后对照 |
| --- | --- |
| 1280×720，16:9 | [查看对照](comparison-16x9.png) |
| 2556×1179，iPhone 14 Pro 物理横屏 | [查看对照](comparison-iphone14pro-landscape.png) |

两图均由运行中的控件树投影，左侧为基线，右侧为候选。iPhone 对照等比缩略展示左右各 230 物理像素的投影留边，逻辑画布仍为 1280×720。软件投影使用替代字体，未知的 SDK 面材质（包括确认面板 107311）省略，因此能看到后方页面。设备安全区、最终贴图、字体和实际点击派发由官方客户端实测。

| 规格 / 计数 | 基线 | 首批 |
| --- | ---: | ---: |
| 紧凑确认单按钮外框和命中区，逻辑单位 | 185.6×54.4 | 168×72 |
| 宽高比 | 3.41 | 2.33 |
| 紧凑按钮有效字号，按两轴换算 | 12.76 × 18.70 | 24 × 24 |
| iPhone 宿主投影单按钮，物理像素 | 303.92×89.08 | 275.10×117.90 |
| 正式布局及模板控件总数 | 27,270 | 27,254 |
| 初始隐藏控件 | 24,881 | 24,865 |
| 等形叶图元的重复实例 | 18,729 | 18,716 |
| 同一按下比例的源码定义 | 2 | 1 |
| 布局紧凑 JSON 字节 | 4,153,989 | 4,151,981 |
| 模板紧凑 JSON 字节 | 244,803 | 244,803 |
| 实际装配前 Lua 字节 | 5,964,111 | 5,964,138 |
| GIL 最终文件字节 | 待测 | 待测 |

取消及确认的四态共去掉 16 个已由圆角材质替代的底板和边框。两侧模板逐字节一致，模板数 16，单层最高 60 个子控件。确认面板以外的生成布局一致。等形实例采用仓库容量检查的去名叶图元统计口径，包含为了不同位置与状态保留的控件。

三次独立 Fengari VM 重放中，11 个阶段的模块加载、原生替身 API 调用、属性写入、快照及细分计数一致。冷 Host P50 由 6313.62 ms 到 5710.93 ms，热 Host 由 3937.80 ms 到 3885.34 ms，空闲 300 帧由 990.83 ms 到 1279.98 ms。墙钟含观察开销，三样本的波动不用于评价真机性能。

## 复测

在两侧独立工作树生成同一档位。依赖仓库原有两张已校验头像 PNG。记录紧凑布局、模板和 Lua 文件体积。

```sh
npm ci --ignore-scripts
npm run build:data
npm run build:ui -- build/lua --official-assets --native-page-lifecycle --refined-release-monsters
node scripts/platform-load.mjs daily build/lua
node scripts/benchmark-runtime-path.mjs
node node_modules/fengari-node-cli/src/lua-cli.js -e "package.path='build/lua/?.lua;src/lua/?.lua'; STS_UI_CAPTURE=true; dofile('tests/lua/support/sts_ui_closeout.lua')" > build/confirmation-capture.log
sed -n 's/^OFFICIAL_VISUAL_SCENES //p' build/confirmation-capture.log > build/confirmation-scenes.json
python docs/evidence/task-113-confirmation/render-paired.py docs/evidence/v2-ui-20261119/render-runtime.py build/confirmation-scenes.json build/lua/game-ui.json build/confirmation-preview
node --test tests/exit-ui-layout.test.mjs tests/official-confirmation-style.test.mjs tests/noncombat-v25-layout.test.mjs
```

渲染脚本在两侧使用同一份候选证据目录版本。独立子会话分别复核初代比例和中文宽度、公共布局与控制流、同条件产物和性能。官方候选需要获准使用的同一生产底图，两侧保持相同构建参数并记录 GIL 的 SHA-256、字节、实际导入和当轮 ready。官方 PC 16:9 与 iPhone 14 Pro 横屏分别记录菜单和弹窗所有状态、短点/拖出取消、连续触控、保留/清除进度及结算重试。当前云端记录止于离线证据。

## 后续迁移范围

| 页面组 | 已有来源与待核对范围 |
| --- | --- |
| 主页、选角、结算、导航 | 主菜单采用原版风格文字项。选角进退、奖励继续、结算重启和页脚返回按导航语义归并。等在途选角 PR #924 落地后核对该页，保持同一宿主的状态切换。 |
| 地图、战斗、提示 | 地图与战斗已复用正式顶栏，地图返回共用锚点。事件说明、战斗通知、结束回合、状态、战斗药水和物品管理按各自语义验证字号和触控区。 |
| 永久卡组、抽牌堆、弃牌堆、消耗堆 | 复用正式牌组浏览及战斗卡面。核对牌堆页脚、排序、翻页、卡面详情与原生绑定差异。 |
| 祝福、事件、奖励、宝箱、商店、营地 | 逐组核对选项长文换行、图标/正文分栏、购买、领取、跳过和继续的布局。保留已批准的特别内容操作与各自输入归属。 |
| 弹窗与设置 | 首批覆盖放弃、覆盖本局和平台退出结算的共享面板。药水与遗物的独立内容浮层待迁移。正式布局中的设置图标通往局内菜单，旧独立设置原型不参与运行。 |
