# PR679：恢复真正无 Down/Up 的 C 档药水点击

> 首轮 `1d825a2` 已被独立深审判为 request_changes（R679-1/R679-2）。以下首轮记录保留历史，不能作为最终独审通过；本轮修正见文末。

本轮用户明确恢复并授权接续，范围为原 PR679 的 C 档能力回退。起点为实际 Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`，独立树快进到 PR 原头 `89dfc774b1c6bb146b91e6064039f4d648db0d33`；二者均保留祖先。原树及分支保留，接续评论为 [6904344896](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/679#issuecomment-6904344896)。TASK-38.4 定义仍在未合 #673，本地 CLI unknown；仅通过 CLI 在父 TASK-38 追加计划，不复制任务、不改变状态/Owner/设备 AC。

## 根因与最小切片

`abyss_battle_ui.lua` 的 popup `pointerConsumed` 无条件设置 release/suppress 屏障。没有 CursorDown/Up 的宿主也因此把下一次独立 Click 当作 Use 的尾事件。仅在根本不存在完整 Down/Up 能力时跳过该屏障；具备能力但尚未发 Down 的宿主仍保留原屏障，不能通过“尚未观察到指针”降低保护。

既有 `battle_ui_potion_targeting.lua` 五场景现在分别运行真实 `H.setup(false)` 与 `H.setup(true)`。false 明确断言瓶/弹窗没有 Down/Up 监听器；true 保留新 ID 的物理序列。原选中牌、库存、目标、能量、手牌和纯重画断言保留，第二瓶取消增加先选牌及能量/手牌不变断言。共享 fixture、popup、gestures、目标绑定、规则与 RNG 实现均未改。

## 本轮执行证据

使用现有便携 Node `v24.18.0`；新树 node_modules junction 只复用 mobile-capacity-repair 的依赖，没有替换原安装。先运行 `npm run build:data`、`build:ui`、`build:theme`。

`node scripts/test-lua.mjs tests/lua/battle_ui_potion_targeting.lua`：

- 生产代码未改时 RED：click-only 五项中四项失败，paired 五项全过；总计 **6 PASS / 4 FAIL**，退出 1，41090ms。明确点 enemy2 的 HP 实读 `31 ~= 11`；第二瓶取消实读 `table ~= nil`。
- 最小能力分支后 GREEN：click-only **5/5**、paired **5/5**，共 **10 PASS / 0 FAIL**，退出 0，25117ms；一次明确点 enemy2 造成20伤害、库存清空、aim清除；第二瓶取消后不消耗、不出之前选中牌。

以下通过原 `runLua` 定向串行运行一次，全部 status=0；没有重跑 wrapper 内相同 Lua：

| Lua 入口（tests/lua/） | 结果 | ms |
| --- | --- | ---: |
| potion_popup_click_payload.lua | 63 owned 序列及 Controller/mixed-capability 边界通过；匿名/竞争/多指/旧尾/新ID | 26328 |
| battle_ui_potion_target_stale.lua | 5/5 | 20778 |
| battle_ui_potion_target_inventory.lua | 4/4 | 10332 |
| battle_ui_potion_target_inventory_slice_2.lua | 3/3 | 9533 |
| battle_ui_potion_target_context.lua | 4/4 | 13799 |
| battle_ui_potion_target_context_slice_2.lua | 4/4 | 15647 |
| battle_ui_potion_target_pointers.lua | 2/2 | 8584 |
| battle_ui_potion_target_pointers_slice_2.lua | 2/2 | 8526 |
| battle_ui_potion_target_pointers_slice_3.lua | 2/2；原真实 C-mode 选牌/即时药水恢复 | 9263 |
| battle_ui_potion_target_pointers_slice_4.lua | 1/1；播放期间旧回调不消费 refill | 3627 |
| potion_popup_slot_view.lua | readonly/reentry/changed-state-use/valid-use；renderCount=4 | 6592 |

源码门禁：`npm run check:syntax` PASS；`node scripts/check-engineering.mjs` PASS，351 modules、6181/6181测量、1988 edges、Luacheck1.2.0无新增诊断、6项显式历史告警、2214 governed measurements。固定 hash 的 Luacheck 从既有 PC 树复制到本树 build/tools 后重新校验执行；首次探查 root 路径不存在、Copy-Item 失败，未执行门禁，未计 PASS。

## 交付边界

source/CI 接续在产品提交后按既有 collector 追加独立 packet，历史 packet 不改写；最终身份与合同结果在本附件后续节记录。没有 Full、Hosted 轮询、GUI、GIL、官方导入/ready、容量或 iPhone14Pro 实测。离线 C 档行为通过不代表官方手机验收；本地提交交父 agent 独审，未推原 PR、未恢复 Ready 或授权合并。

## 当前 source / CI 闭合

产品 checkpoint 为 `94af046c80b1dd4f020d6f54406520f5a658a051`。在本树 `.artifacts/click-source/capture.py` 按现成 potion-regression collector 的相同 schema 收集 Git before/current/producer 与 sparse CI 字节，接入既有 `createSourceEpochProjector`、copy closure 和 CI historical reader；没有改通用 projector 或旧 packet/叶子。

- 新生产包 `tests/helpers/potion-click-source.json.gz`：15503B，SHA256 `2742b7d724213f7764d9603ea2276ffd9d85a910ab2b8b263d5a896ba94fe26e`。唯一 changed owner 为 battle_ui；gestures 与 popup 的真实 producer/parents 作为继承来源保持。whole-current 的 committed 声明仅指94af产品输入，不将之后的测试适配说成同一已提交 tree。
- 新 CI 包 `tests/helpers/potion-click-ci-source.json.gz`：139692B，SHA256 `e72587157ebe36bf1eda61ed23087a5bd5138f5e9f1defd09c76f0c9fa3f9336`。11项完整 before/current 绑定、99项归档 guard（98旧包+新生产包）；辅助适配另标 `currentTreeCommitted=false`，CI trust leaf 按惯例排除自身。
- owner **117→117**，新增 owner `[]`；raw **877 JS / 1424 Lua**，增量均0。增加的是原 targeting 入口内真实 C 档五场景，不是新文件或伪造指针。
- `.artifacts/click-source/audit.mjs` 对98个旧归档逐个与89df Git内容/LFS OID、size及SHA256比对，验证完整源码集合、新包字节、三条实际producer及parents；`audit.json` 记录 PASS。无需补全本树旧 LFS（restore 检查为0项）。首次辅助审计超过 Node 默认 Git 输出缓冲，ENOBUFS 未计成功；仅修正该一次性审计的输出缓冲后重新完成，没有改变任何测试预算、断言或timeout。

定向 source/CI 验证全部通过，0 skipped：

```powershell
node --test --test-concurrency=1 --test-name-pattern='potion click|potion regression composition|integration validates complete raw sources|integration copy closure requires' tests/integrated-ci-source.cases.mjs tests/integration-source-epoch.test.mjs tests/ci-complete-calibration.test.mjs
# 11/11 PASS，57570ms；包含新字节/旧epoch/缺失漂移/暖copy删除负控。
node --test --test-concurrency=1 --test-name-pattern='current raw production retains|current UI facade authenticates|menu source continuation retains|release additions remain in raw Full|real style source retains|feedback real current source' tests/defect-final-source-epoch.test.mjs tests/encounter-formation-source-epoch.test.mjs tests/session-menu-navigation.test.mjs tests/sts-style-source-epoch.test.mjs
# 6/6 PASS，36237ms；原117-owner与完整历史目标合同。
npm run check:syntax
# 最终辅助代码 PASS。
```

本轮 TEMP/TMP 在新树 `.artifacts/click-source`。Full成本预测仅沿原测试输出（win1756907ms/linux1190295ms），不是Hosted实测或准入结果；原45/30分钟物理时限、18/15分片、unknown成本与完整发现保持。

收口仅统一两个辅助文件的缩进并重新采集当前 CI 字节；定向重验 `potion click CI authenticates` 1/1 PASS（406ms），再次运行审计 PASS。其余17项已测语义及全部产品 blob 不变，不重复整套。

`npm run test:related -- --base 89dfc774b1c6bb146b91e6064039f4d648db0d33 --plan` 因未建模文档输入返回full=true；遵守本轮明确“不Full”，执行上述有界相关合同和源码门禁，不宣称完整 check 或 Required 已通过。最终 metadata 提交保持94af运行时与已测产品夹具逐blob不变，交父 agent 对本地精确HEAD独审后决定原679集成。

## 独审 request_changes 接续

来源：主仓库 `.artifacts/review-pr679-1d825a2-independent-deep-20261116.json`；同一隔离分支接续，不 amend、不 push。保留94af/1d作者检查点及89df全部98旧归档。

### R679-1：部分指针能力不能当作 C 档

原条件 `not (Down and Up)` 错误地放行 Down-only 和 Up-only。现在仅 `not (Down or Up)` 才放行；任意一个能力存在都保留旧 attributed-tail 屏障，不依赖 observed 或 dragEnabled。

新回归 `tests/lua/support/potion_partial_pointer.lua` 使用真实 GameUI/Run/Combat，分别构造完全无指针、Down-only、Up-only、完整 paired 四种能力，各覆盖具名及匿名 native Use/tail。部分能力明确断言没有伪造 popup Down/Up 监听器；归属尾事件必须零伤害、不消耗、aim保留，下一次新ID（paired 有真实 fresh Down/Up）恰用一次且不出牌。原 targeting 入口追加 dofile 确保 CI 执行；本轮只独立运行该 support，不重复原五C+五paired或已过11Lua。

原生产代码上的正式 RED：**4 PASS / 4 FAIL**，9459ms；Down-only/Up-only×具名/匿名均在 attributed-tail 断言失败、造成20伤害，C/paired对照全过。修正后 GREEN：**8 PASS / 0 FAIL**，9604ms。首次草拟用例错误地把具名 Use 后不匹配的匿名 Click 也认作其尾，导致 paired 对照失败；保留该诊断输出，改为分开具名/匿名 native 序列后才得到上述有效 RED，没有改生产来迁就错误期望。

修正运行时再次执行 `node scripts/check-engineering.mjs` PASS：351模块、6181/6181测量、1988 edges、Luacheck无新增诊断、6历史告警。没有更改时限、规则、共享fixture或旧paired安全实现。

### R679-2：历史转换前完整认证

新增历史入口回归先在旧实现 RED：缺失 closeout-source 时 reader 仍返回历史UI，报 `Missing expected exception: complete current must authenticate other binding missing`（1 FAIL，369ms）。修正为命中当前完整binding且将实际转换时，先对原始 reader 执行完整 `assertPotionClickCiCurrent(read)`，覆盖所有当前绑定与归档；每次转换重新执行，不缓存授权。未知或已经历史化的 bytes 仍原值透传，不借回退赋予身份。最终新字节重绑与本项 GREEN 在后续 metadata 记录。

R679-2 最终 GREEN：新增 historical-entry 回归通过（258ms）。同一个 reader 暖成功后注入其他绑定的 missing/null/drift，以及归档 missing/drift，均在回放前拒绝；恢复输入后正常回放。读取轨迹另断言全部12项 current 绑定及99项归档均被重新读取。

仅运行新增/受影响 source 名称，共 **7/7 PASS、0 skipped**：

```powershell
node --test --test-concurrency=1 --test-name-pattern='potion click historical entry|potion click production closure|potion click CI authenticates|potion click copy closure' tests/integrated-ci-source.cases.mjs tests/integration-source-epoch.test.mjs
# 4/4，19082ms；含R679-2 GREEN、新产品来源与copy负控。
node --test --test-concurrency=1 --test-name-pattern='integration validates complete raw sources|potion regression composition CI keeps|potion click raw Full' tests/integrated-ci-source.cases.mjs tests/ci-complete-calibration.test.mjs
# 3/3，43070ms；仅既有guard合同，不是执行Full。
npm run check:syntax
# PASS。
```

### 修正后的 active 来源身份

产品 checkpoint 正常提交为 `c126877c31b37396b6148e1101a8dba555d03feb`，父为原作者 `1d825a2`，原94af/1d的提交与包字节均可从Git恢复；没有amend或新包层。使用同一collector以89df为历史基准，**原位更新本轮两个active包**，不动旧98归档：

| active包 | bytes | SHA256 |
| --- | ---: | --- |
| potion-click-source.json.gz | 15508 | 823ccaff8ee4d2d6e48fb94c758f9ae11a001c73872fef2a890109de0c8e0dbf |
| potion-click-ci-source.json.gz | 140902 | f4f85ac76b7d5682dcede88f5cb3215206327e4176221d67c7e31296b803760f |

更新生产/CI叶子的精确currentCommit与包hash、copy中相同依赖的hash、唯一引用旧currentCommit的来源断言；通用projector及原98归档/旧叶子不改。CI只有新增support夹具这一项完整绑定，**11→12**；raw仍877JS/1424Lua（support不伪作独立发现入口），owner117无新增，archive guard99不增。完整产品源码、实际producer/parents与98旧归档Git/OID/size/SHA审计再次PASS，记录在本树 `.artifacts/click-source/audit.json`。

本轮没有重跑原11Lua或整个targeting入口，没有Full/Hosted轮询/GUI/候选/设备操作；原request_changes记录保留，修正HEAD仍交父agent独审，不以作者GREEN越过评审或合并准入。
