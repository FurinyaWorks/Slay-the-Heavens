# Develop 横向浏览误开长按说明：仅证据交接

**未修复，不是合并候选。** 本分支仅保存精确 Develop `2ec45b9e52c870badc4d4888f6243a30556eecb4` 的可复现缺陷，没有生产、测试入口、Backlog状态/标签/验收或来源见证修改。

## 最新路线与去重

- [#740](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/740) HEAD `98db99af`、[#743](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/743) HEAD `efe4d06f` 在核查时均仍开放；本轮按协调者明确的 Develop 恢复指令取证，不把这两份文档 PR 称作已合入。
- 旧 Release `1ceb7c1a` 与 Draft [#738](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/738) `62e14cfe` 保持冻结，只作来源。主仓库其他开放项为 #739尺寸、#741取消提示、#742动态WIP；两个Fork均无开放PR。没有发起或轮询CI。
- 致命UI故障停乐**已经在Develop**：[#730](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/730) 已合入，merge提交 `c2280832488a54479ee90a1fc9344d89594ef0e6`。当前 `abyss_ui.lua` Git blob `ade0429d561b58ddfc479c24d539bb289020ad85` 与该PR精确相同，保留其八场景夹具。没有重复接回停乐修复。

## 当前真实缺陷

用当前原生 GameUI / Run / Combat / 生成控件，仅由既有平台夹具提供事件，Bash按下后横向移动80px，确认 `browsed=true` 且 `moving=false`，停留360ms。

实际结果：`info=true, gesture=false, energy=3, hand=2`，命中断言：

```
horizontal browse incorrectly opened stationary held help
```

这是手牌横向浏览被静止长按说明接管，不是PC35取消提示残留，也不是官方启动问题。源码检查发现当前 `abyss_battle_actions.lua` 的 `helpPointerChanged` 检查移动、held及cardReady，却没有检查已经由现行gesture设置的 `browsed`。#738已有对应判定可供后续按真实来源取证，但本分支**没有实施或认证它在Develop的绿结果**。

同一未修改基线：

- 原 `drag_input_boundaries.lua` 8/8通过，包括取消后fresh tap→playArea正常出牌；不能把旧Release Win7失败直接套到Develop。日志原名虽含`red`，实际明确为8/8绿。
- 原 `card_help_release_slice_2.lua` 4/4通过，含真正350ms静止长按开启并释放不出牌。
- 原 `card_help_release_slice_3.lua` 4/4通过，含坐标缺省、不可出牌长按、只读hover和foreign Up/EndDrag不取消合法hold。
- 新横向浏览证明非零退出；不是超时或来源验证预先失败。Linux / Node24.22.1 / Fengari，非官方或设备实测。

## 可复现

先按仓库约定安装依赖、准备原始LFS对象并生成当前数据/UI，然后在此精确基线运行：

```sh
npm run build:data
npm run build:ui
node scripts/map-ui-layout.mjs
node scripts/test-lua.mjs docs/evidence/develop-browse-hold-20261119/reproduce.lua
```

最后一行在此基线应以横向浏览误开说明的断言失败。`reproduce.lua`不加载历史源码或注入修复，原生成运行时与生产源码不改。`manifest.json`固定源码blob和摘要、原始及公开日志摘要；`logs.txt.gz`只脱敏本机路径。

## 领取阻塞与接续责任

TASK-30为`@Furinya / In Progress`，带`待验`、`delivery-verify`。其TASK10→8→7依赖均已完成，但正式切片入口返回HOLD：已开展/已交付，应续验而不是重复实现。本轮遵守HOLD，未改状态、标签或AC，也未换任务ID绕过。由原任务Owner/协调者明确将本次新红缺陷纳入接续范围后，再确定实施者。

建议最小行为边界：只处理**横向browse不应触发静止held help**，验证原静止350ms、坐标缺省/不可出牌hold仍成立；浏览取消后旧EndDrag/Click仍被拒绝，distinct fresh tap→playArea恰好一次。尚未证明后两项在拟议修复后的同树结果，不以基线原8项代替。

[#741](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/741)的原执行者保留PC35：`abyss_battle_card_gestures.lua`、取消提示及右键/Back入口。本候选建议只改`abyss_battle_actions.lua`，**不复制或修改#741的gestures/notice**。其[精确审查](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/741#issuecomment-6999216785)已发现当前Develop历史来源绑定会拒绝新gesture；本缺陷的actions同样属于现行owner闭包，后续需按Develop现有验证补精确before/after和拒绝控制。产品文件可分离，但若双方都需改`combined-epoch/source-epoch-runtime.mjs`或copy/来源桥，则必须先协调统一接续，不能各自覆盖或搬整个Release来源包。

#703/TASK-111启动仍由原线处理；本证据不碰启动、容量、PC35、怪物或未经验证技能。没有Full、Ready、PR、合并、发布或GUI操作。
