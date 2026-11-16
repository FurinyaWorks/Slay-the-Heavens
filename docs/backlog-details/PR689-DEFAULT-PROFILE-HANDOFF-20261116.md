# PR #689：默认 profile Quick 最小修复交接

## 身份与写入范围

- 本轮授权只续接既有 #689。交接前再次读回：PR HEAD `23bed75c642f8f4af5c2783526a5afc4a57f471f`，实际 Release `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`；PR API 的 base 仍是旧 `36b9b157`。最新评论仍为 [6897998466](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/689#issuecomment-6897998466)。未见 owner 明确正写；本地原作者和复审树干净，没有已提交的相同夹具准备成果。
- 唯一树 `.worktrees/oc689-default-profile-1116`，分支 `fix/oc689-default-profile-1116`，从实际 Release 建立，再正常 merge 原 #689；两者都是祖先。夹具 checkpoint `b48acb5a26bcf96a6207836aafd8579ffef47476`。
- 原样复用 `8fa591fa858174afdc0a5d62f92cf40cc43f3a60` 内的既有 18 行补丁。最终夹具 blob `9246752ab7d5aab26ca07c22b7cb17efc076daca`，与补丁目标一致；移除这段新增分支后，125 行原 official 测试逐字等于原 PR。
- 本轮不新增生产修改。完整 `src/lua` tree 与原 #689 同为 `ebfb53b3d542c7c73ae4cb2a60945c45d56819ec`，`scripts/lowcost-art.mjs` 也与原 PR 同 blob。蓝蜡烛 ID、配方、四态、两行、fallback、owner、重入与 RNG 断言保留。

## 本轮验证

实际 Node `v24.18.0`；先 `npm run build:data`、`npm run build:ui`。默认入口没有 official 参数；实际生成 Lua 读回 `DEFAULT_PROFILE=nil`，与原默认主题一致。

| 入口 | 本轮结果 |
| --- | --- |
| `node scripts/test-lua.mjs tests/lua/reward_relic_shared_art.lua`，补丁前 | **RED**：`reward_relic_shared_art.lua:39` 的 `rewardIcon` 断言，调用点52；与原 Quick `43735120171/job132875896259` 相同根因 |
| 同一默认直跑入口，补丁后 | **GREEN**：`REWARD_RELIC_DEFAULT_PASS text-only states, one claim, unchanged RNG`，1,873ms；真实领取蓝蜡烛、另一行未领取、四态纯文本和随机流均验证 |
| `node --test tests/reward-relic-shared-art.test.mjs` | **GREEN 1/1**，5,275ms；原 wrapper 用 `officialAssets:true,nativePageLifecycle:true` 单独构建并运行全部原 official 图池断言 |
| `node --test tests/sts-reward-row.test.mjs` | **GREEN 2/2**（与第一次 official 执行同次调用，official 当时因临时目录权限未进入断言） |
| `node --test tests/integrated-ci-source.cases.mjs` | **GREEN 5/5**：原始完整 CI/副本/Bootstrap 合同，新增生产来源和 raw after/库存/截断/漂移/缺失负控 |
| `node --test --test-name-pattern 'runtime helper copy\|combined epoch authenticates\|detached shop\|fresh authorization\|root combined' tests/integration-source-epoch.test.mjs` | **GREEN 6/6**：真实独立复制/二次复制、暖调用后盘上改删、LF/CRLF 隔离投影、完整生产树、owner 鲜读和晚漂移拒绝 |
| `node --test --test-name-pattern 'Release bootstrap raw Full' tests/ci-complete-calibration.test.mjs` | **GREEN 1/1**：保留冻结 Bootstrap 的876 JS/1423 Lua与原执行门槛；这不是当前库存或实际 Full 完成 |

来源修复前另有本轮真实 **RED**：原 `combined epoch authenticates the complete current production tree` 拒绝 `abyss_battle_reward_layout.lua`，原始失败与后续 GREEN 日志见附件压缩包。

`npm run check:guidance`、`npm run verify:backlog` 和 `git diff --check` 本轮均通过；两份新 packet 的 `--check` 重采与 `audit.mjs` 实际字节审计通过。

首次 official 包装器在默认 `%TEMP%`、随后预批准 Temp/opencode 均 `mkdtemp EPERM`，未进入产品断言；改用本树 `.artifacts/tmp` 后通过。测试代码和超时未改。一次 PowerShell 环境赋值解析失败亦未运行测试。来源采集初轮将 LFS pointer 误当物化 gzip 比较而拒绝；采集器现核对原 Git LFS oid/size 和实际内容，旧 packet 没有更改。

## source / copy 闭合

复用既有 `createSourceEpochProjector`、`closeout-source-epoch`、`copyIntegrationSourceClosure` 和 `assertIntegratedCurrent`，只追加明确 continuation，不改旧归档：

- 生产 packet 仅一份真实 reward Lua before/after；before 为实际 Release，producer 为原 #689，checkpoint 为 b48。完整352路径（351 Lua+架构）、65 target、116 owner 的现有校验通过；所有原 target 保留，新 `blueCandlePrior` 可精确回到原 Release。
- helper copy 仅续接 `closeout-source-epoch.mjs` 的精确前驱，并加入新生产 leaf/gzip 两项；真实私有副本能独立执行，原磁盘改删负控保留。
- CI packet 为10份实际变动文本的完整 before/after；新 leaf 自排除。先验证当前 raw 字节，再经当前→1cc→Bootstrap原前驱进入旧合同。辅助捕获明确 `currentTreeCommitted:false`，不冒称其字节已在产品 checkpoint。
- 原93份 `tests/helpers` gzip 全部保持 Git/LFS 原 SHA 与真实 bytes，其他历史包没有 diff。新生产 gzip SHA256 `d8be56143b70efd9c73f91716f77163f877604b75d6bfe93d71ee014f954fed0`；新 CI gzip SHA256 `6c277c08189975b5cb4a7c6f68402036bec7eec5b30634276fb35f64e73d9c89`。
- 当前真实 discovery 为 **877 JS / 1424 Lua**，包含原 #689 新专项各一份；历史合同的876/1423没有伪称当前库存。新测试仍使用既有 unknown 成本，无校准数据、预算、工作流或选择器变更。

附件目录 [pr689-default-profile-20261116](../evidence/pr689-default-profile-20261116/)：`identity.json`、`audit.mjs`、`capture.mjs`、`source-verification-logs.json.gz`。在此工作树根执行 `node docs/evidence/pr689-default-profile-20261116/capture.mjs production --check` 和 `ci --check` 可精确重采比对，不写旧 packet；`audit.mjs` 核原补丁、祖先、生成默认主题、产品 tree 与当前 source 入口。

## 主控接续与阻塞

本片本地提交完成后交父级独审精确 final HEAD，检查范围为本文件所列夹具/source/copy 增量；复审通过后由主控将既有 #689 正常 FF 到该提交。本执行者没有推送、创建 PR、合入 Release、Full、Hosted rerun、GUI、GIL 或设备操作。

未关闭：父级独审与主控 FF/推送；远端原 Quick 红点仍保留，未取得新 HEAD Hosted 证据；Release 正常准入门禁；同候选官方容量/导入/ready与 iPhone14Pro 实测。本片不构成 RC 验收。原 `TASK-38.8` 在本基线仍未知，未新建或伪造认领；按既有父任务 TASK-109 在根 Backlog CLI 追加本轮计划/交接，owner和未验AC保持。
