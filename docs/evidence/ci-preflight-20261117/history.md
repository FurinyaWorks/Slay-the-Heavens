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
