# #687 接续实际 Release（2026-11-17）

本候选从原 #687 `e1221ee0abc265a720cd71a87d01b9d109c51475` 正常前向合流实际 Release `af77fb2461c548f0faf104761d107397f75dca08`。原 #703 的 `00ab3fe6` 与 #707 的 `af77fb24` 已实际落地。未向原 PR 推送本候选、未改其 Auto-merge、未新开 PR、未触发 #687 Fork/主仓 Full。

生产范围仍只有原两份复合意图文件，均与原 PR 逐字相同。相对实际 Release 的数据、脚本、配置和 workflow 没有改动；原规则、RNG、视觉材料与门禁不变。原 #687 完整历史、两父来源、原归档和全部旧断言保留。Backlog CLI 本环境缺失，未手改任务或伪称认领/Done。

## 来源与验证

- 生产 352 输入、118 owners、72 targets；完整 raw inventory 为 882 JS / 1425 Lua，是 af77 与 e122 两侧文件的真实并集。CI 快照保存 643 完整输入与117个旧归档；1241个非空父 binding 与643当前 binding 已逐项核对实际 Git/文件字节，718份完整文本记录按SHA256无损去重；无孤立或缺失引用。当前辅助 capture 与原 committed producer 身份分别保留，不把捕获误标为原产品提交。
- 原 af77 与 e122 的合同明确在不可变父版本 fixture 上重放，保留原116/117断言及缺失、null、漂移、恢复测试。新当前联合合同直接读 raw 文件，测试完整发现量、全部生产、历史目标及当前公开 Source/Read/Current/Prior 入口；不拿 fixture 授权当前。
- 独审发现“outer 未变、deeper 会投影”缺少新 owner 认证，真实 RED 已保存；最终 public Source/Read 以原始同一 raw reader 认证输出，八路径48负控与16恢复独立通过。终审再发现旧proof未纳入的97条同类出口，已将完整224旧输入纳入当前643快照；任何实际历史输出均先认证完整 raw，不设路径白名单。最终三个完整来源/八路径/224继承anchor用例3/3，独立对124个实际历史anchor的248次拒绝均通过。不缓存授权、不放宽门槛。
- 原两个产品 profile：default 首先通过；official 最初因精确图片仍为 LFS pointer 失败，恢复并核对两图原哈希后仅复验该项通过。并非首轮2/2。
- 原 e122 六个来源合同6/6通过。当前九项定向检查初验8通过/1失败，原 freeze reader 接线已修，原失败单项1/1通过；最终完整 raw current/公开入口另读回。之后完整643捕获与字典重编码的3项针对性验证3/3通过。不是单轮9/9，也不代表 Full。
- 其他中间失败与定向复验逐份保存在 manifest。两份旧工作树长诊断只保存 prefix snapshot，明确 INCOMPLETE，不计通过、不代替最终集合。原文件及工作树保留；未删有效测试、旧 packet、来源 pin、成本或执行 guard。
- guidance、Backlog 范围与原 changed Lua ratchet通过。Luacheck 起初缺失，按仓库既有 pinned setup 精确下载/hash后，2个 changed Lua / 0 new violations。完整 production copy closure 实际隔离导入118 owners/72 targets通过。

## 准入和接续

当前只是独立可审查准备分支。准确候选需独审绑定最终 HEAD/实际 BASE，并通过原 Fork 预检与主仓四项 Actions Required、Strict、Squash、讨论解决及空 bypass；没有修改保护或借用旧绿灯。该来源包含原 .artifacts 执行输入，实际 impact 保守 Full。此轮不在已知 #688 正在集成时重复派发相同回归或抢占其 owner。

最小下一步：先核实际 Release 是否仍为 af77；若 #688 已实际落地，则沿此准备历史正常合流真实新基线并只验证变化，再绑定准确独审和唯一预检，复用原 #687。未完成 Hosted、实际 squash/合后核验、官方导入/ready、同候选容量与 PC/实体手机验收；没有 master/版本/Tag/发布操作。

另按 Pan 本轮明确协调指派，#688 的同 SHA/BASE 在两 Fork 均无既有运行后，只镜像到 Fork A 专属分支并派唯一 Full：[44114037126](https://github.com/FurinyaDev/Slay-the-Heavens-Fork-A/actions/runs/44114037126)，读回 queued。已在原 #688 一条协调评论给 owner 准确链接，B未派、主仓未重跑，不守候CI。详见688-verified-handoff.json。

当前复现入口为 capture687.py；capture687-pre-complete-history.py 与 prepare687.py 明确保留为中间历史，不用于生成当前字典packet。源工具仍将收据写入原/workspace/release-closeout-evidence，跨环境运行前须提供该路径；源包/reader的完整身份检查不变。
