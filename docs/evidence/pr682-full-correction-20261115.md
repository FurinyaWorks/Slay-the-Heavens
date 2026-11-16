# PR #682 实际 Full 失败纠偏

来源：[Quality 43727819459](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43727819459)，attempt 1，HEAD `04ebf5afa1b6d6c872b4cdd93c5a28b71833c02f`。运行已结束为 failure，未重跑同提交。PR 保持未授权状态，修复后走新 HEAD 的正常验证。

## 已读事实与最小修复

全部失败测试分片共 10 个唯一文件、11 个唯一用例、21 次记录，归并为四类；没有证据把它们称为基线故障。

| 类别 | 失败合同 | 修复 |
| --- | --- | --- |
| 六项当前 facade 的严格 raw 读取序列 | 原 116 次排序鲜读末尾额外多一次 UI | 历史 before-bound 兼容投影才额外重读 UI；当前 after-bound 路径由原闭包逐 owner 认证一次。六份原测试断言未改，保留失败立即停止、恢复后重新完整认证。 |
| 两项 current owner 顺序 | 新 epoch 将四个晚加入 owner 放到末尾 | 构建 owner union 时保留既有排序，成员不删减。 |
| 两项 session/Neow 历史断言 | 把 BGM 后继的 commit/UI 当作原 9783 epoch | 原 provenance 和完整原文断言指向显式保留的 `sessionMenuSourceEpoch`；当前 raw 调用仍使用实际 `sourceEpoch`，不是改原 SHA 或混期认证。 |
| Windows 默认回归 | 生成的 LF `.mjs` leaf 与 CRLF checkout 做物理 Buffer 比较 | 仅文本 leaf 比较采用已声明 LF 归一；gzip 仍逐字节一致。新增 CRLF 输入实验先复现同一 leaf 断言失败，再修复通过。 |

独立日志归并：`ses_e1ebb52e7ffeun6sl6iax8t50j` 读取全部 15 个失败测试 shard；代表 job `132861529110`、`132861529134`、`132861529215`。其余红项是测试失败后缺产物上传、聚合传播及空 checkout receipt 的附带诊断，不是额外网络或平台业务根因。

失败文件：act1-choice-responsibilities、competition-roster-config-composition、defect-integration-source、defect-utility-planning、defect-final-source-epoch、nodes-battle-max-hp-config-inverse、run-max-hp-config-inverse、encounter-formation-source-epoch、session-menu-navigation、dependency-bgm-source（均为 `tests/*.test.mjs`）。

## 本地验证与边界

- 新 CRLF 子进程重放在修复前明确失败于 `reproducible exact successor: tests/helpers/dependency-ci-binding.mjs`；修后来源回归 **5/5，无跳过**，同时覆盖 native/CRLF 与无历史 Git 对象的生成结果比较。
- 随后独审还捕获本 PR 曾给一项 current 回归加的 `+1` 读取断言；已原样恢复基线的 `proof.owners.length`，没有改其逐 owner 拒绝检查。重新执行完整 `dependency-bgm-source`、`integration-source-epoch`、`session-menu-navigation` 三文件：**56/56 通过、0 fail/skip**，覆盖该遗漏及整组当前/历史来源和真实菜单操作。
- 针对上述 11 个失败用例执行现有原测试：**8 通过**；其余三份配置历史文件尚未进入目标用例，就在本机临时目录/私有 junction 的导入准备遇到 EPERM/EISDIR。保留失败，不标成通过、不删断言，也未改历史夹具帮助器。
- 对这三份文件共同使用的实际当前 `sourceEpoch` 单独执行 current-admission 探针：固定原 develop 提交 `d8a57cae` 与独立 config hash `0e75d9e1f08cfb7738215b9a31cce141f03cc2469077bce0db3376fe1f446a9c`；**116 owner、348 个逐 owner 异常、116 次恢复、完整原读取顺序和 unknown 零读取均通过**。这证明当前准入修复，不冒充三份完整历史文件通过。
- 本地完整文件准备问题分别在默认 C TEMP、独占 build TEMP、工具许可的 opencode TEMP 观察到；未改权限、安装 WSL 或扩散工具链修复。Hosted 原测试仍须在新 HEAD 原样验证。

单 UI before/after 及原历史档案不变。当前小后继包为 **91,248 字节**、23 个文本源，SHA256 `499f0c0fd32f24178a8d7599d1f1167ff90a3899d791e13235484a47ba31595d`；旧轮次包体/hash留在上一份附件记录，不能冒充当前值。Full、官方候选、导入/ready、真实听验与设备结果继续按实际证据独立验收。

## 2026-11-16：StS 负控输入隔离接续

用户指定仅修既有 PR #682。开工核对远端 HEAD 仍为 `1b60f71c4733ced0c91dc814dc5c7a6644c8fe56`、develop 为 `c2409ad750c15124b7b843c6bbfa5b222537cb75`；PR 原树干净，comments/reviews 未见该片并发写入。独立树 `.worktrees/oc682-source-negative-1116`、分支 `feat/oc682-source-negative-1116` 从最新 develop 建立后 fast-forward 原 PR，保留全部原提交。

### 原日志与根因

读取 Quality `43770305401` 的已完成失败 job 原日志：Windows Rules 15/18（`132986880785`，217 pass / 1 fail）与 POSIX 12/15（`132986880772`，849 pass / 1 fail）。二者都是 `tests/sts-style-source-epoch.test.mjs:111`：有意变异 `scripts/test-affected.mjs`，期望 `/fresh complete StS CI source/`，却先被 `fresh added inventory source: tests/session-menu-navigation.test.mjs` 拒绝；实际 SHA `61bab871…`、应有 current SHA `e4c7e4f5…`。

负控局部变量 `readFileSync=integratedRead('sts')` 遮蔽了真实文件读取器。`assertStsStyleCiCurrent` 的入参必须是 raw current；它先认证 current inventory，再在内部投影 StS 视图。外部提前投影使未变异的菜单测试先变成历史文本，正确触发前置拒绝。真实 current 与 archive 之间没有因此获得放行。

最小修复：历史原文比较单独命名 `readSts`，两个负控循环恢复使用导入的原始 `readFileSync`。原 regex、所有断言、准入/投影/collector 实现均原样保留。

### 本轮 RED / GREEN 与来源证据

- 原 HEAD 原样运行 `node --test --test-name-pattern="real style CI admits only full inventory" tests/sts-style-source-epoch.test.mjs`，**0 pass / 1 fail**，复现完全相同的库存 guard。
- 仅改 reader、尚未重新采集时，同入口被 `fresh complete StS CI source: tests/sts-style-source-epoch.test.mjs` 拒绝，证明新的真实 source 漂移仍受检；不是放宽预期得绿。
- 按现有 `node tests/helpers/generate-dependency-ci-source.mjs --write` 接续后，`--check` 通过；定向原失败例 **1/1** 通过。
- 三文件完整小组：`node --test --test-concurrency=1 tests/sts-style-source-epoch.test.mjs tests/dependency-bgm-source.test.mjs tests/integration-source-epoch.test.mjs`，最终 **60/60、0 fail / skip**。包含 shallow/native/CRLF 重采集、完整历史视图、真实复制后热漂移/删除拒绝及恢复。
- 该组首次运行有 **9 pass / 4 fail**：新树设置 `GIT_LFS_SKIP_SMUDGE=1`，历史 `release-source-epoch.json.gz` 尚为 pointer，固定 hash guard 拒绝（`7eaa672a…` 对 `5e41bb3c…`）。仅 `git lfs checkout tests/helpers/release-source-epoch.json.gz` 恢复缓存中的既有对象，重新采集后得到上述 60/60；该历史文件没有 Git 改动。
- 可复跑边界探针：`node docs/evidence/pr682-source-negative-20261116.mjs`。**28 次真实有意 source/helper 变异全部命中对应目标路径的原 guard**；额外验证历史 reader 仍被 current 库存拒绝、raw 菜单 drift/缺失拒绝、恢复后重新准入。
- 探针逐项比对父 HEAD 的包：原 **23 个完整 binding、6 个 helper copy closure** 及全部元数据/库存均不变，只新增本次测试的完整 before/after binding。原 integrated/StS archive 与原 copy map 身份保持；新包为 **96,603 字节、24 个文本源**，SHA256 **`293c36c61a5b14eb3bc069d2a6ae8e9357cba730e4b053ee0323b058aa279cbe`**，发现集合仍为 **879 JS / 1424 Lua**。
- 三个本轮 `.mjs` 的 `node --check`、`npm run verify:backlog`、`npm run check:guidance`、`git diff --check` 通过。`test:related --plan` 因共享历史来源闭包选出大量传递回归，按本次授权只执行上述定向小组。

交主控独审及串行集成回原 PR；本地提交不是独审或新 HEAD 托管 Full 通过证明。未 push、未另开 PR、未自动合并、未触发 Full/轮询或 GUI。TASK-87.2 AC4 继续未勾；官方候选、导入/ready、声音及设备边界沿用原记录。
