# Release PD-01～PD-04 离线投影 · 2026-11-24

基线 `39ba96eadcbe906cc4b7dd9f28cf3f430d92f57f`。构建参数为 official-assets-first、native-page-lifecycle、refined-release-monster-art。使用 Lua 5.3.6 执行正式生成数据、控件、真实 GameUI Host 与仓库原生 API 模拟。截图经过软件投影，使用 Noto Sans CJK 和矢量近似，原生图库未取得的资产留空或标示范围。客户端纹理、真实字形、设备实际触控和安全区须实机复验。

## 前后证据

[全屏对照图册](screens/README.md) · [iPhone 几何](screens/iphone-bounds.json) · [PC 几何](screens/pc-bounds.json)。全部证据来自合成测试界面。

| 断言 | 基线观测 | 候选观测 |
| --- | --- | --- |
| 恩赐继续/两项/四项 | #928 将共用 eventView 向下移 64 单位。虽然选项重新计算了组内坐标，基线底部触控框越过舞台约 3.82 px。 | 恩赐使用完整舞台坐标，选项按 40 单位底边内距堆叠。iPhone 命中框底距 65.5 px，面板可见底距 86.79 px。 |
| 手机顶栏 | #926 的 104 单位底板与扩大热区一起投入，并仍由手机适配写入所有顶栏。iPhone 底板 170.3 px，占 14.44%。 | 88 单位底板 144.1 px，占 12.22%。84 单位热区投影 137.55 px，约 45.85 pt。 |
| 遗物首格 | #928 的首位原点 x=−458，左侧预留翻页，手机首格命中框左边界 x=459.25 px。 | 手机 x=295.50 px（相对舞台左沿 65.50 px），PC x=36 px。每页 11/25，箭头在行尾，占据固定单元。 |
| 奖励标题 | 生成卷轴及选牌标题 y=180。手机初始化仅将选牌文字重写为 y=128，相差 85.15 px。普通列表在后续渲染恢复桌面 y=192，混入遗物条带。宝箱原有标题单独摆放。 | 手机选牌题字与卷轴共用 y=129。普通/扩展列表标题 y=140，宝箱题字跟随各自卷轴与现有打开时间线。标题内容由对应业务入口设置。深色标题与卷轴底色的计算对比度为 6.86:1，奖励列表打开时题字与卷轴一同出现。 |

PD-01 使用真实开局入口与两类历史输入，根据实际按钮点击进入恩赐、领取和启程。最长组合用确定性恩赐描述输入。PD-03 通过正式 Run 库存写入、页码映射、单详情和地图返回。PD-04 用确定性战斗胜利输入进入真实奖励控制器，实际点击领奖、选牌、跳过和返回。GIL 写入/读回与官方设备验收保持待验，当前环境缺少授权生产底图及官方客户端。

## 检查结果

- 同一组基线与候选断言包含六个正式 Lua Host 几何场景和生成卷轴对比度。精确基线七项均失败，候选七项均通过。保留原有测试后，Lua 5.3.6 整组 20/20。
- 静态工程门禁、关键变异、原生 API 合同均通过。既有 presentation 的 66 项中有 6 项原型卡牌文案在精确基线及候选均失败。
- 首轮独立复审发现了卷轴入场首帧文字透明、标题对比不足、稀疏恩赐气泡距离及宝箱提示遮挡。候选已修复，最终复审按 PR 中的 HEAD、BASE 与合成树记录。

## 复现

```sh
npm ci
git lfs pull --include='art/**'
node --test tests/run-hud-inventory.test.mjs
# 可选指定 Lua 5.3 二进制。省略 ABYSS_HUD_LUA 时使用 Fengari。
ABYSS_HUD_LUA=/path/to/lua node docs/evidence/release-layout-20261124/capture.mjs /path/to/source /tmp/release-layout
python docs/evidence/release-layout-20261124/render.py /tmp/release-layout
```

将相同 Lua 夹具和 JS 入口放入基线的临时 worktree，可以重跑新增几何断言的负例。截图流程从提供的 source 树生成正式控件，验证夹具由本证据所处的候选树供应。源提交与生成树摘要单独保留。
