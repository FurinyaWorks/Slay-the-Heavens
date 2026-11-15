# TASK-87.2：依赖漏检纠偏

## 已证实根因

| 边界 | 事实与漏检原因 | 本轮保护 |
| --- | --- | --- |
| 正文 → 原生依赖 | `b82d8326` 创建 TASK-96/97 时依赖为空；`c2409ad7` 的 97 仅依赖 105，设计确认仍停在正文。续树 `92e79424` 已纠偏，但未合入。 | CLI 补回 97→96，保留 97→105；现有 Backlog 门禁固定保护这两条具体产品依赖。 |
| 已登记依赖 → 领取 | 旧 `check-task-intake.mjs` 不读取 dependencies，仅检查状态、五项 Owner 审批和待验标记。 | 同一入口检查目标传递依赖、身份、环、格式及 Done/AC；输出阻塞链，只读不改状态。 |
| 队列结构 → CI | 旧 `verify:backlog` 只查 97→105 特例，无通用缺失/歧义/环检查。 | 共用轻量依赖模块；全库允许合法待办依赖，但拒绝结构错误。 |
| 阶段 → 结论 | TASK-95 明确整体 Done 不等于某方案 GO；TASK-105 的研究与正式容量/设备证据也不同。旧容量门禁却把 status Done 描述为 GO。 | 不再把状态描述成 GO；五项明确审批保持独立。实验完成、设计认可、正式接入、设备验收分别记录，不从正文关键词自动猜批准。 |

目前没有证据证明 TASK-97 曾被实际输出 ALLOW：它原本还会被 Blocked/Owner 名单拦截。本次修复的是已复现的漏边与通用未完成依赖漏检，不能虚构已经发生的越权实施事件。

TASK-25.4 历史混合了原稿、批准稿还原与设备待验；TASK-95 又是条件性设计前置。不能机械地让所有 UI 修复依赖 95 或让小样等待全部设备验收。准确消费关系由任务创建/委派前核实，脚本不假装能从自然语言证明语义完整。

## 最小复现与验证

- 原领取测试 16/16 通过，但加入真实 CLI 的 `TASK-25 → TASK-26 → TASK-27` 未完成链后 16 过/1 失败，旧入口错误 ALLOW；修复后拒绝并保留全部任务字节。
- 删除 97 的设计边：`mass rollout must retain` 旧门禁失败（返回空错误），修复后通过；在修正任务前实际 `npm run verify:backlog` 非零，明确指出缺 TASK-96。
- 反例覆盖：未知/重复身份（含大小写、前导零及坏记录）、自环/传递环、坏列表、Done 仍有未勾 AC、归档不能作完成证明；合法 DAG 与无关隔离实验不误拦。
- 两项研究都 Done 时，TASK-97 仍因独立 Owner 审批 HOLD；状态不能自动转化为正式采用许可。
- 独审发现 Backlog 的宽松状态解析与领取不一致；`Done` 后缩进续写 `Blocked`、或重复 `status : Blocked` 的两例先红后绿，Backlog 现复用严格元数据判定。

本轮运行 `node --test tests/backlog-roadmap.test.mjs tests/sprint-intake.test.mjs tests/task-dependencies.test.mjs tests/agent-guidance.test.mjs tests/full-quality.test.mjs tests/delivery.test.mjs`：153/153 通过，无跳过；`verify:backlog`、`check:syntax`、`check:guidance`、`git diff --check` 通过。Fast 只读规划要求 Full，首次规划120秒外层超时，第二次放足工具预算后完成；没有降低测试预算、增添 `ci:full` 或重复触发托管验证。

本轮技术验证与独立复审结果记录回 TASK-87.2。源码检查通过不代表正式角色设计、容量 GO、官方导入、ready 或设备验收。
