# 第二轮独立复审

独立复审结论：固定切片 PASS，仅认可离线修复与隔离分支保全，不代表 #738 可合并或 Release 可发布。

## 固定来源身份

| 路径 | Git blob |
| --- | --- |
| src/lua/abyss_battle_actions.lua | 072c67277cc2a04ce18f8907220a43c21d2053c2 |
| tests/lua/drag_input_boundaries.lua | f50fa856a86a4ac77a4717fd6630e2aa13b5a48c |
| tests/sts-style-source-epoch.test.mjs | c150fc689fdd00353cbbcc877e673cf711036ff0 |
| tests/helpers/closeout-source-epoch.mjs | 7e31da77afe8b9a01ae88545efca30a9e2870398 |
| tests/helpers/copy-integration-source-closure.mjs | c7ab9aad267508d9145dd182241d7c2c3c7e3b0f |
| tests/helpers/release-potion-enemy-source.mjs | e98bd116f599791f6c83b0186a99bb1aafc1e391 |
| tests/helpers/release-full-followup-source.json.gz | a4d2da89ee8cb1164b8ca32d29e6ac96a3ff73a9 |
| tests/helpers/release-full-followup-ci.json.gz | 3bc9898e58d4e44bd237dfe3994e031adf126f49 |
| tests/integrated-ci-source.cases.mjs | 734cae4a9b5e2a060dd88a8bcb89c6dfd0286f15 |
| tests/release-card-contact-integration.test.mjs | e12f22a4bad8a8ac46e75ac4fe20d2952c480b21 |

源档 SHA-256：`dd47073e00cfb054d33280eb73d17f41f78b395012b7b1bbb9025e3e2e21fb92`。
CI 档 SHA-256：`145cc67971ea3a86fde2e4b85e67ed03120c3124f0074543718e5853748b5089`。

## 独立核实范围

1. GitHub Git data 的 4dd97d67 tree 与本地固定起点一致。五份失败作业的实际 checkout 为 a4f910ac，不是修复树；StS Windows 作业明确为 Windows10。
2. Win7 仅令真实 `browsed` 卡牌的 pending help 失效，不参与多指、动作、终止事件授权。旧三点边界、完整 RNG/手牌/能量/回合和 fresh tap 原断言保留，新增不误弹详情和尾事件不重复。原静止帮助行为保留。
3. Win1 原匹配 Down/Up、foreign/anonymous 拒绝和 exact ID 继续一次成功的断言不改。4dd 已覆盖，不另改产品语义。
4. StS 三路径漂移各由相应第一层精确拒绝；独立模拟真实缺失仍返回 ENOENT，库存少/重/外来全拒，恢复正控通过；其余 matcher 和历史正负控不变。
5. 实读 352 当前来源、129 owner。保留完整 87 旧 target，加第 88 个真正同树 4dd before；生产只改 actions。旧九个档逐字不变；六个 CI before/Git blob 等于 4dd 前像、after 等于真实当前 bytes。
6. 六个实际重放叶 × 新 CI 档/生产档/actions 三漂移 × text/Buffer，共 36 个负控均实际读取并拒绝；六项精确旧前像替代亦拒绝。既有 potion safety 新夹具仍 live。
7. 实际 copy 函数只将目的写入虚拟化，真实读取当前 helper 和相邻生产档；缺失、漂移、精确 4dd helper 替代均拒绝，恢复后再次实际读取通过。

独审用匿名 stdin 临时运行，未写盘脚本或原始日志；此文件是独审报告而非原始执行日志。实施者的 runtime/sources 日志只作为实施证据列示。无 Full、GUI、推送或实机操作；历史卡牌阻塞仍须独立解决。
