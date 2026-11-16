# TASK-38：药水实际 CI 回归与 paired 失效上下文修复

来源为 #679 `f564aea6a3c517b71a85534a81be5e2e36278baf` 的实际 Quality `43758225514` 失败；不是重新触发 Full。独立工作树基于精确 f564，未改 PR、CI、Backlog、规则、布局或共享来源包。

## 两层根因

原 readability 第 25 行在前次 dismiss 后直接调用 openPotionMenu，实读 `menu=nil/busy=false/gesture=nil/suppressClick=table`；缺少新的物理 Down，仍处于旧弹窗动作的防穿透屏障。official 三瓶 HUD 的生成 Lua 第 94 行与 popup_slot_view 第 36 行，均将第二次无 Down 的匿名 Use Click 当作新重试。改为明确的新 Down/Up/Click，保留全部文本、几何、色彩、fresh-core query、不消耗、只消耗所选 slot 断言，并新增旧匿名尾不得使用药水的负控。

库存、上下文及目标语义夹具原本也把后继独立动作写成连续匿名 Click，无法区别 Use 的队尾。改为文件本地 freshPointerSetup；共享 H.setup(false)、原 paired 两例及 click-only resize/上下文例保留。

这一步同时取得 **真正的 paired RED**：合法新 Down/Up/Click 遇到原 inventory、turn 或 roster 已变化时，enemyReady 拒绝旧 aim，未生成目标 token；之后 Click 进不了原 chooseEnemy/commit 的失效清理。旧 aim 留存，死亡 actor 的页面也未刷新。因此本轮不是纯 fixture 更新，更不能用命名 Click-only 绕过该缺口。

## 最小运行时修复

在 `abyss_battle_card_gestures.down` 既有 popup、foreign moving、reclaim、gesture 屏障后，使用既有 aimReady 检查非 busy 的失效上下文；cancelPotionAim 后先给该 touch 记 swallow，再沿原 render 刷新，返回 true。该 Down 只退休旧状态，不能捕获替换 actor 或提交卡牌/药水；Up/Click 尾继续被拒绝，下一次 fresh Down 才能重选。

`abyss_battle_ui.lua` 只在原 gestures ports 加 aimReady。popup、纯谓词 enemyReady、目标 actor/slot 身份、匿名尾屏障、竞争触点、busy、移动 owner 路径及核心状态/RNG规则均未改。

原库存/turn 断言保留并加强：退休触摸及重复旧尾不消费；下一次新选择恰一次生效。roster 例重放退役旧控件与新 surface 的 named/匿名尾，均不得打幸存者。布局未变；五容量检查保留原 public-menu API 几何与合法 controllerBack，不把仅直查 panel 的测试 tap helper 用于嵌在 potionHelp 的 4/5 控件。

## 本轮有界证据

日志全部在本工作树 `.artifacts/readability-1116/`，Node `v24.18.0`、TMP/TEMP 均在 F 盘：

- `target-red.log`、`official-red.log`：原两 JS 失败；`red-*.log`：五个原 Lua 入口分别 RED。
- `readability-diag.log`：原 suppress/menu 状态。`green-*.log` 和首次 `target-green.log` 保留 fixture 修正后仍未全绿的 paired RED，不覆盖或冒称通过。
- 初次 official 本地停在冻结 preview PNG 的 LFS pointer，而非 CI 原断言。只从既有本地对象校验 OID/size 后恢复两个固定输入，见 `preview-inputs.json`；没有拉取或 smudge 历史媒体。保留该环境失败。readability 初次 fresh-tap 改法不能解析嵌套 4/5 控件的夹具失败也保留，随后恢复原 API 几何合同。
- 最终只运行 `final-js.log` 五个命名 JS 目标及 `final-*.log` 六个 Lua 入口；每个夹具只走 wrapper 或直接 Lua 一种入口，没有重复底层执行。覆盖原失败与 Main、匿名 payload、click-only context 负控。

最终计数及精确通过名称见同目录 `verification.json`。未跑 Full/check、全套矩阵、GIL、官方导入或设备。正式 CI、同候选 iPhone 14 Pro 实测和发布验收仍未通过本附件授予；旧来源包保持，后续由独立 metadata 接续真实产品 checkpoint。
