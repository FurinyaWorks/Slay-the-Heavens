# CI 基线与精简记录

窗口：2026-11-01–16 UTC，FurinyaWorks/Slay-the-Heavens。保留失败和取消；不同 HEAD/BASE、平台、队列组合及发布最终 Full 都不能直接算浪费。

| 指标 | 实测基线 |
| --- | --- |
| Quality PR | 773次，失败146、取消357、成功145、跳过114、当时排队11 |
| 同 API head 的 Quick 成功／Quality 失败 | 127次；失败步骤涉及 JS88、Lua21、Lua棘轮5、Backlog3，可重叠 |
| 同仓库/workflow/head/event/branch 的重复候选 | 73/773，9.44%；缺配置/checkout收据时不冒称可复用浪费 |
| PR 首次通过率 | 129/255，50.59%；取消/跳过/排队等445组单列排除 |
| PR 已分配 runner 消耗 | ≥195,784.33分钟；13个作业结束时间缺失，仍是下界 |
| push / Merge Queue runner 消耗 | 30,723.77 / 26,735.22分钟，独立集成验证，不计作重复浪费 |
| 87个实际已合 PR 创建→合并 | 中位112.52分钟，P90 529.85分钟 |

773是PR事件；全事件922还包含60个队列、87个push和2个dispatch。“60.5%分支时间窗重复触发”缺少窗口定义，不能直接认定60.5%浪费。同 API head 也不等于测试树：run43833278706 API head dc74ab23…，实际checkout为PR merge 05cfcd22…。

## 本轮维护成本

旧候选 b4801643 的 [Fork Full44026568101](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44026568101) 失败；实际已分配 runner 总计388.17分钟、墙钟1808秒。这是该次完整验证总成本，不声称全部由新防护额外造成。已定位的失败来自新增测试库存、历史工作流适配和Windows换行，不能冒充产品缺陷拦截收益。

按 Owner 要求：统计并回已有 ci-run-costs，回归并回已有测试文件，移除新测试库存映射及重复预算测试；现有原始库存仍876文件。预检接受原生成功rerun，不额外要求新提交、第一次attempt或创建时间证明。保留必要的既有历史来源兼容，不扩展新的来源/库存制度。

原始基线输入、计算结果和旧版审查资料固定保存在既有提交 b4801643；不在当前树重复维护报告和500KiB原始数据。复算无需网络：

```sh
git show b4801643:docs/evidence/ci-preflight-20261117/baseline-input.json.gz > /tmp/ci-baseline.json.gz
node scripts/ci-run-costs.mjs --input /tmp/ci-baseline.json.gz --output /tmp/ci-baseline-report.json
# 按需采集；--jobs 才读取逐作业消耗，不作为CI或定时任务
node scripts/ci-run-costs.mjs --repo FurinyaWorks/Slay-the-Heavens --since 2026-11-01 --until 2026-11-16 --jobs --prs --output /tmp/ci-report.json
```

原有 `ci-run-costs.mjs <raw-directory> <output.json>` 接口保留。runner分钟只累计实际分配的执行时间，取消前的排队不计；缺失时明确显示不完整。跨Fork复用统计只针对diagnostic dispatch，不能把PR、push或Merge Queue正式验证当作可省成本。后续按同口径短窗口比较实际故障、消耗、首次通过率和合并耗时，不靠反复重跑旧SHA刷指标，也不新增指标门禁。

瘦身版本地验证：旧Full红项/工作流/Quick/消耗统计98/98，原始来源消费者85/85；actionlint、syntax、guidance、Backlog和diff-check通过。原有目录CLI的388.17分钟计算不变，固定基线回放与旧结果逐字节一致。独立复审确认未降低原生门禁；托管验收仍须使用新候选，不继承旧Full结果。

## 集成接续：准确失败与取消

8c664d4b 的 A Full [44032429395](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44032429395) 已失败：18 个 Windows 分片成功，POSIX 矩阵因新增 admission 在 dispatch 被 skipped 而未展开，汇总明确失败，不能称作 runner 排队。增量复用 4629e6ae 的必要工作流修复，把预检移入原 impact/inventory，保留瘦身、原作业集合、原历史包的 before 字节及成功 rerun；两个消费者显式要求 impact 成功和非取消。未恢复额外指标脚本、库存逆投影或新测试文件。

B Full [44034686329](https://github.com/v5g95m7t8m-max/Slay-the-Heavens-Fork-B/actions/runs/44034686329) / 4629e6ae 是已执行后人工取消；[rules7 annotation](https://api.github.com/repos/v5g95m7t8m-max/Slay-the-Heavens-Fork-B/check-runs/133874836362/annotations) 明确 `The run was canceled by @FurinyaDev.`，不是旧 403，也没有完成 Full 成功资格。该轮16个作业实际获配 runner，执行合计105.53 runner-min；未获 runner 的取消作业不计执行。例 rules7 创建06:55:11Z、开始06:55:15Z（等待4秒）、结束07:03:17Z（执行482秒）。API最近100条运行已穷尽B仓两条记录，核查时没有后续运行，不能虚构最新绿灯。

本次依赖图回归先红4项，再绿4项；既有 Quick/Full/summary 三文件62/62通过。它们是定向本地验证，不是新候选托管 Full、主仓PR或队列组合通过。正式结果仍由准确候选的原有流水线与合后验证接续。

Owner已触发准确 B Full44050580539（HEAD2089991e/BASEc240/attempt1）。POSIX真实展开，4/11两片发现现有 ci-posix-shards/delivery 的 current 表达式断言仍要求旧隐式条件；仅把两条断言严格接续显式 impact 成功与非取消，保原运行时修复和门禁。原两例2红→2绿，五文件114/114、原来源4/4通过；原17条before逐字保持，仅为两份实际改动测试新增完整前驱映射，共19条，不增加测试库存。旧运行继续保留失败，不借旧绿认证新HEAD。

一次性授权已读回：当前App新增B owner安装182868876且Actions write，Agent已成功触发703候选6980b909的Full44052937001；A的707候选845 Full44050034037亦由Agent触发。主仓安装仍statuses read，原merge:auto首次POST403且未写入review pending/auto_merge；与Runner排队、测试失败分开，不能用workflow权限声明代替协调凭据写权限。


## 同类 CI 组合候选（未正式合并）

以 #712 固定 `7d163cbb7e1c6a50c41328309eb257232c907d3f` 合入 #677 固定 `873d4392c02fd5ac92e653e57a78fd59f6ae63c6`，仅整合 CI 与交接，不改产品。保留 Release 日常完整受影响 Fast、主仓冻结 HEAD Full 与发布阻断；Fork 预检仍在原 impact/inventory 中先执行，Quick 仅手动运行完整受影响集合，不恢复 Draft/Ready 重复 Quick。普通 push 的收据 BASE 空值修复保留。

旧 #677 的 Draft/manual advisory 和显式契约步骤作为固定完整来源历史回放，当前正式契约另核 manual-only Quick、两项高风险 CI 脚本强制 Full、Release 路由与发布门禁。原最外层 preflight 包增加显式 `release-bootstrap` 完整前驱视图，固定来源为上述 #677 SHA；旧19条 before 及 beforeSha 逐字不变，#677 bootstrap packet 全字节不变。21条组合绑定逐项认证完整源码 SHA、历史视图 SHA/Git blob；未知、部分、额外权限改动和 CRCRLF 不投影，不新增 helper、packet 或流程层。

定向验证：CI/交付八文件首轮158/158；完整来源、校准、消耗统计及摘要五入口107/107，包含新增视图与缺失/篡改负例；两批有重叠，不合计为独立用例数。将三份真实 workflow、既有 draft helper 及 Release 验证器临时转为物理 CRLF 后，原五入口60/60，结束逐字恢复。guidance、Backlog 与 diff-check 通过。这些是本地组合证据，不继承各来源绿灯，不代表组合 Hosted Full、主仓 PR/队列或合后交付通过；未推送、派发 Full、取消来源 PR 或修改远程保护。
