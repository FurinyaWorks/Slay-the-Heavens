# PC01 既有主菜单来源核对（只读，2026-11-15）

结论：**已有足够的入库源码可做有界恢复，无需重新设计、绘图、引入字体或取得私人原图才能开始离线移植。** 首选现成的 `fbfc3dfd` / `65ceb74e` 标题与双按钮收尾，选择性接到 Release，不应继续仅以“#650曾批准去标题”把PC01停在设计冲突。移植与同候选视觉/设备验收仍须分开；下文没有宣称我看过私人原图或任何实机截图。

## 事实与解释边界

1. #676 逐字记录00:16–00:30明确为：“之前不是已经设计过主菜单页的样式吗？”“我的主标题去哪了？”“开始游戏和结束游戏的按钮样式呢？”“怎么还没用上？”“这难道没有合并上去吗？”这是要求已有设计实际呈现的直接产品反馈，不是要求agent创作另一稿。
2. `docs/design/APPROVED_UI_ADOPTION_20261105.md` 记录11月5日Owner要求正式采用此前认可设计；固定公开来源 `84da1d3b`，后续私人原型来源 `7e40d2d3`，当前主菜单构图、文案和交互须以认可来源为准。Release保存了公开安全副本。
3. GitHub API本轮读回 #650：closed、merged=false，源HEAD `ec0d0b990bb4baa7d45413101599ef3030f33892`；正文记载Owner此前预览后批准红白黑背景、去标题及双按钮，来源按consolidation关闭，由后续统一PR承接，不能称#650曾独立合并。TASK-103.5同样保留了该历史批准。
4. 更晚的已入库标题收尾存在：`3cf8b502636ff8d3d6e5b0cb78e62c9aedb8601c` → `65ceb74e797c26ce1cd9c526ff4099460304afd5` → `fbfc3dfd2bda556ff9bacb1b7d483c191f175c4f`。65ceb证据README写明“最新附件只指导标题与按钮”，背景保持既有96219b31批准稿；没有重做背景。3cf/65均不是Release36的祖先。另有同源 dfa6b741/c7c574b4/58fcd3bd 链，不应重复叠加。
5. 最新反馈已否定“实际试玩入口无标题/没有此前按钮样式”这一结果；因此可据现有任务授权恢复既有来源。**这属于从直接反馈作出的实施范围判断。** 转写没有点名某个SHA或图片文件；我未查得65ceb最终标题样式另外取得Owner/设备终验的事实，不能把来源作者的Simulator结论当用户验收。

## 可找回的具体设计与Release缺口

| 来源 | 已有控件/样式事实 | Release36现状 |
| --- | --- | --- |
| `docs/design/reference-ui-lab/menus.js` + `menu-reference.css`（采用记录固定来源7e40d2d3） | 主菜单明确有 `mr-logo`，图片 `menu-reference-logo.png`，alt“杀戮原塔 2”；有“开始游戏”“退出游戏”。CSS保存logo位置/尺寸与四态/固定点击区/hover行为；未开放图鉴/记录只是原型项 | 这是浏览器来源，不是可直接导入的正式原生UI；不能连同未开放项或CSS/PNG照搬 |
| `65ceb74e` / `fbfc3dfd:scripts/v25-menu-layout.mjs` | 已有原生 `titleMark`（中文标题、红色2、Slay the Heavens）、按钮四态红箭头/按下线和暗托底；保留既有背景和两个实际按钮 | Release `scripts/v25-menu-layout.mjs` 的 `v25MainMenu` 为空；`v25MenuFace`四个状态也是空容器，仅短线/文字 |
| Release `src/lua/abyss_v25_menu_view.lua:present` 与 `scripts/v25-menu-layout.mjs:applyV25MenuLayout` | 构建与运行时都主动隐藏legacy `menu/title`；legacy文本同时承担胜败结果标题 | 不是简单缺一次SetVisible。直接强开legacy title会混用结算标题；应复用现成 `v25MainMenu/titleMark`，其已有not-outcome显隐边界无需新Lua |
| #663已在Release36的父 `c2409ad7` | 现有“开始游戏”“退出游戏”以及同局“继续本局”使用原Host命令与确认流程 | 必须保留 `continueRun` 的样式/定位、已有focus/input/nav及session处理，不能拿65ceb旧整文件覆盖 |

## 最小可实施来源与依赖

只摘最终供图描摹收尾，不摘整个分支、早期文字占位稿、背景、Simulator服务或历史source packet：

- **资产**：`fbfc3dfd:data/presentation/menu-title-mark.json`。378个静态三角；原文件SHA256 `e1b8e8b19b881465f80d9ae7d96f4e857ff2d5f70f5835788d5ff15252f77698`；内载 `referenceSha256=f0cd6f42cd73809910d328091db101cad825fce0fb20a77e4e208044cbddc67c`。该JSON已经入库，可逐字复用。原图仅为离线描摹来源，不成为运行时PNG依赖。
- **布局**：选择性摘 `fbfc3dfd:scripts/v25-menu-layout.mjs` 的readFile/flatTriangle/nativeMenuTriangle引入、`buttonFace`、`polygon`/`titleMark`、标题/托底挂载及chrome置于原按钮前的层级。**保留Release新增的 `continueRun` style与start+64定位**；保持当前原按钮/命中/交易与结果页显隐。
- **主题**：`65ceb74e`对 `data/presentation/ui_theme.json` 仅5个 `menuPresentation` 字段是该收尾所需：labelX=50、hoverSeconds=.08、leaveSeconds=.06、lineRestAlpha=0、accent=#FF292E。其他theme和未来手机/选角内容不带入。
- **已满足依赖**：Release已有 `scripts/menu-flat-triangle.mjs::flatTriangle`、`scripts/menu-red-scene.mjs::nativeMenuTriangle/menuRedScene`、现成 `src/lua/abyss_v25_menu_view.lua` 四态/hover writer及start/titleQuit/continueRun命令。无需新Lua模块、字库、图片纹理、后台或新的输入框架。
- **构建来源**：现有候选输入收集递归覆盖data中的JSON；新资产仍须按当前分支的来源/构建输入合同核实和追加，不能照搬旧title分支的整条证明。生成器 `experiments/menu-red-fit/title-mark.py` 只为来源复现，不是正常构建依赖，也不应为本轮重新跑描摹。

## 定向入口与真实缺口

- 来源布局断言在 `fbfc3dfd:tests/menu-red-background.cases.mjs`；Release真实包装入口是 **`tests/native-candidate-preview-mask.test.mjs`**（import该cases），不是不存在的 `menu-red-background.test.mjs`。可复用title唯一、静态字形、≤500控件、非输入、固定280×56hit、四态与背景不变断言。
- 同局导航/C档/菜单恢复需保留并定向核查 `tests/session-menu-navigation.test.mjs`、`tests/title-menu-admission.test.mjs`、`tests/lua/support/session_menu_v25.lua` 及原菜单运行时合同。重点新增对 `continueRun`、胜败结果页不显示主标题、回标题不重建背景和固定hit的当前源码断言。旧#663行为不能为恢复样式而回退。
- 浏览器来源本身可由 `tests/reference-ui-lab.test.mjs` / 其目录测试读取，证明批准参照的存在；不能替代原生生成树与当前候选。
- 来源 `docs/evidence/menu-title-finish-20261114/composition.json` 记录同源预览新增444控件；titleMark本体含分组/回退416控件，背景仍1732。**均为旧离线/Simulator计数，不是新Release官方容量**。PC QA已有容量失败风险，因此必须新候选重新官方容量/ready/PC与受影响手机验证，不用旧负堆差或SDK均值宣称无开销。
- 私人最新附件、原屏像素与本轮正式候选尚未核对；不阻止复用已有JSON完成离线切片，但“准确还原用户所指那一稿”与设备呈现验收仍保持待验。没有浏览器/GUI操作，没有打开私人原图，没有改源码、Backlog或新建分支。

可实施判断：**可以立即在最新Release独立树选择性恢复上述现成来源，再按正常定向回归/独审/CI和新候选设备容量门禁验收。** 现有历史去标题批准是背景事实，不是继续遗漏最新直接反馈的理由；也不授权趁机增图鉴、记录、设置或另做菜单美术。
