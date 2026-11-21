# v2.0.0 主菜单还原取证

日志仅展开制表符并清除行尾空格，未删减失败内容。

仅主菜单，Owner 本轮指定 release/v2.0.0。初始基线 5991585a（PR #791），保留其他 Session 的提交和设计历史。Backlog CLI 缺失，未伪称认领或改写任务。设计与源稿见 [新修订](../../design/reference-assets/v2.0.0/sts1-main-menu-20261121/REFERENCE.md)。

## 画面对照

[四图对照](comparison.png)：原版 PC、原基线 Lua、高清绘画、当前 Lua 几何投影。[原版缩图](original-sts1-reference.jpg)仅作对照；唯一原始来源 https://interfaceingame.com/screenshots/slay-the-spire-main-menu/ 。

- [常态](runtime-menu-normal.png)、[悬浮](runtime-menu-hover.png)、[按下](runtime-menu-pressed.png)、[退出模态禁用](runtime-menu-disabled.png)、[暂停会话继续](runtime-menu-continue.png)。
- [1560×720宽横屏投影](menu-wide-projection-1560x720.png)：按现有居中1280×720舞台合同合成的留边示意，不是设备截图。真实Lua fixture另在1280×720、1920×1080、1560×720、2400×1080调用resize并核对原生输入框。
- 所有 runtime 图来自正式构建的 Lua，在原生合同 mock 中执行输入/会话并导出动态树，再复用仓库 render-runtime.py 软件光栅化。不是官方客户端截图、GPU帧率、导入/ready或PC/手机验收；字体使用系统Noto CJK，未分发字体二进制。禁用图中退出确认覆盖层是真实运行状态，未隐藏。

独立复审：独立 agent 会话审阅原图、绘画和运行截图，并检查代码。第一轮指出标题金色断裂、塔下火光被简化、悬浮条带接缝；已分别增加连续金色底层、源稿局部亮橙裂隙预算，并移除渐隐条带的重叠。仍存在原版柔和云边/材质与低多边形画面的差异；中文标题替换也不能视作原英文logo像素一致。**未宣称完全还原或高保真实机验收通过**。

## 图元与性能

同机Node v24.19.0，独立进程，21次构建，中位数；包含整个基础gameLayout创建、菜单合成和单独scene创建。`measure.mjs`记录代理构建时长与GC后JS保留堆，不代表设备加载/显存或GPU性能。

| 指标 | 原基线 | 新稿 |
| --- | ---: | ---: |
| 背景绘图图元 | 1600 | 1039 |
| 背景全部控件 | 1733 | 1106 |
| 整个菜单全部控件（含隐藏/四态） | 2450 | 2162 |
| 整个菜单绘图图元（含隐藏/四态） | 2120 | 1971 |
| 菜单序列化字节 | 491615 | 423591 |
| 首次构建 ms | 84.57 | 63.37 |
| 21次构建中位数 ms | 30.78 | 25.76 |
| JS保留堆 bytes | 7313200 | 6964720 |

完整记录：[before](performance-before.json)、[after](performance-after.json)。标题另含657图元（精确数见fit-receipt与生产包），背景与标题变换均离线预编译；不在运行时解码绘画PNG或求解逐三角形变换。控件直接子节点均≤60。测量有调度/GC噪声，不把一次运行视为稳定设备基准。

## 验证与复现

- `python experiments/sts1-menu-fit/fit.py`：分层轮廓/局部网格/颜色采样/标题遮罩/离线原生变换；fit-receipt记录精度预算，旧稿不覆盖。
- `node --test tests/official-assets.test.mjs tests/menu-red-background.cases.mjs tests/menu-flat-triangle.cases.mjs`：16/16通过，包含原始历史合同完整重放、事务身份、四态、预算、无背景贴图和新的精确源码续接负对照。
- `node experiments/sts1-menu-fit/capture.mjs /tmp/sts1-menu-capture`，再 `python docs/evidence/v2-ui-20261119/render-runtime.py /tmp/sts1-menu-capture`：正式原生构建通过；CursorEnter/Down、退出模态禁用、fresh/paused继续显隐、同一Run继续均通过。
- `node scripts/test-lua.mjs tests/lua/session_menu_choices.lua`：2个场景通过。
- `node scripts/check-ui-references.mjs`、`git diff --check`：通过。准确BASE对照在PR提交前重验。
- 既有失败保留：`session_menu_navigation.lua:62` 和 `menu_input_boundaries_current.lua:24` 仍尝试已被Release禁用的runMenu/abandon；`title_menu_admission.lua:5` 的地图入口约束也失败。均在未改动5991585a基线复现同一位置；未删除/跳过测试、未降低断言，不扩大本轮到其他页面。日志随目录保存。

官方导入、当前ready、真实PC/手机画面、加载墙钟和设备内存均未运行，不能用本次离线证据替代。正式发布仍由Owner人工验收操作。
