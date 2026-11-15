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
