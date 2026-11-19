# 历史输入与 PC22 同树收敛

## 精确范围

本独立 staging 汇合已审的 [历史入口 9a651ea1](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/9a651ea13d67ed8e05ad12914b46286c707ba854) 与 [PC22 字节保留 17e31bb1](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/17e31bb138046fd8694efd3ab3465eb24cb89354)，保留双方全部原始证据。没有更新 #738、Release、Develop、原两任务分支，没有触发 Full、合并或发布。

远端两父共同来源是 `6d267ca80abd80efb334f8f7581111166174de2d`，tree `e57acd44f70a608975d207908236729a8d5b4446`。本地同树对象的 Git 祖先拓扑不同，不把本地 `merge-base` 当远端来源证明。

最终可执行代码固定于本地 `7678a72c54c7ed2f79c47e70df878bc8eacd46fa` / tree `14653dff9b24ddce7f18f1b2916e642911583052`；后续仅追加本证据和 Backlog 记录。五个执行文件的完整 Git blob / SHA256 见 [fixed-code.json](fixed-code.json)。两远端父及其树已由独审通过 GitHub Git API 读回，与本地来源树逐一相等。

## 合成与发现

- 两条独立续接只共享一个被绑定的 CI 源码叶 `tests/integrated-ci-source.cases.mjs`。新增 `release-full-converge-ci.json.gz` 保存两父完整文本、Git blob 及当前合成 hash；原历史包和 PC22 包逐字保留。先验真实当前源码，随后各 validator 得到自己的精确父视图。
- 原12用例正文/名单/分组、四个启动前缀、已有80帧、runner 和30秒预算不变。PC22整段原回归与 no-op 实现逐字保留，真正历史投影仍返回原历史文本，不能通过全局换行归一化凑绿。
- 独审抓到真实组合缺陷：首次真实合成读取通过后，第2/3读若单次换成对应合法旧父会错误接受；仅保护这两层后，第4/5读换对应旧层仍会错误接受。最终以仅针对共享 UTF8 源的 scoped raw reader 保护**每一次**后续真实读取，再做历史投影；不改变非目标或纯 projector 的透传合同。
- 新回归在实际第2/3次注入各自旧父，第4至最后一次分别注入真实共同旧源码，要求精确外层断言、在该次即拒绝，同一 reader 恢复后重新读取通过。
- 生产 Lua、生成逻辑、原来源档、352真实文件/129 owner/88目标及 copy 闭包全保留。19个新树构建 Lua 输出逐字等于前已审候选，不夹带 build 影子生产模块。

## 最终固定树验证

Node 24.22.1 / Linux / Fengari。以下最终结果均对应上述五个代码对象。

| 检查 | 结果 |
| --- | --- |
| 原 `tests/card-input-slices.test.mjs` | 2/2、0 skip，原12个用例完整通过 |
| 原三进程真实预算 / 观测 | 各30,000ms；11,413.700 / 7,035.555 / 7,898.646ms，均status0 |
| PC22原用例与新增三项，LF | 4/4、0 skip |
| 同一提交真实 Git `core.autocrlf=true` 检出 | 两目标实有37/115个CRLF、规范Git blob与提交相同；同四项4/4、0 skip |
| 指针/组合/首修/接续/历史/本合成来源定向 | 7/7、0 skip |
| 独立复审 | PASS：四种指定旧父/旧层回读拒绝且恢复，public direct+Buffer 的来源/归档缺失漂移16次拒绝、旧父冒充3次拒绝 |
| JS语法 / guidance / Backlog / diff check | PASS |

计时使用仓库外观察模块，只原参数调用原 `spawnSync` 并记录4字段，不改返回值、命令、输出或预算；写记录失败不改变测试结果。独审静态核对模块，且记录恰好三行。`original-12.log` 的45.037秒是两项 Node 测试总时长，不是单进程预算。未使用原CLI的默认90秒作为30秒证明，也未再跑重复CLI三片。

这是 Linux 上真实 CRLF checkout，不是 Windows 托管作业，也不是官方客户端或设备实测。没有新的全量 Quality 数值或 Full 结果，不能据此宣称全部精确 HEAD 门禁通过。

## 失败记录与再现

全部中间记录独立保留，未以最终绿覆盖红：

- `stale-reread-red.log` 和独审 `review-stale-parents-initial-red.log` 记录原组合接受两父旧字节。
- `review-stale-older-layers-red.log` 记录第4/5读接受精确旧层。
- `convergence-reread-green.log` 是仅第2/3读受保护的中间绿，不是最终结论。
- `convergence-reread-final.log` 是扩展断言已加但 scoped reader 编辑未接上的真实红，首个失败仍在第2读；不能拿它单独证明第4/5读。
- `convergence-reread-final-2.log`、独审 `review-reread-fixed-green.log` 和最终 `sources-final.log` 分别保留修正后的验证。
- `pre-review-*` 是组合复读修正前的12用例、计时和cold/warm2项记录，不冒充最终树验证。

原正式命令：

```sh
node --test tests/card-input-slices.test.mjs
node --test --test-name-pattern='PC22 authenticated no-op|PC22 real historical|PC22 no-op repair|PC22 inputs without' tests/native-candidate-preview-mask.test.mjs
node --test --test-name-pattern='historical input pairing|Full follow-up|first Full repair|composed|pointer history|Full CI convergence' tests/integrated-ci-source.cases.mjs
```

[独审报告](independent-review.md)与两份只读脚本同目录。`logs.json` 固定原始、脱敏公开和压缩内容摘要。公开文件只替换私有本机路径前缀；观察脚本里的 `$EVIDENCE_TMP` 是需由复现者准备的路径占位，独审脚本的本地Git对象须按已核验远端同tree映射恢复，不假定公开克隆自动具备本机对象。

## 尚未完成

#738仍固定`36b96baa93d07cb8a357cb793ea4e8806a5aca87`，最终统一候选尚未写入该PR；CI原门槛须在后续准确HEAD满足。#703/TASK-111原owner的官方启动修复、同候选容量/ready/PC/手机证据仍独立，不能用此CI来源收敛代替。未接入未经验证角色技能或怪物，未使用GUI。
