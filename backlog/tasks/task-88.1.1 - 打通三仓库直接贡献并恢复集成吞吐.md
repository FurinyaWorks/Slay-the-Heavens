---
id: TASK-88.1.1
title: 打通三仓库直接贡献并恢复集成吞吐
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-16 15:08'
updated_date: '2026-11-17 06:16'
labels: []
dependencies: []
parent_task_id: TASK-88.1
priority: medium
ordinal: 183000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
接续707/677/708，修复CI与Fork直接贡献。保留Release范围、master保护和正式发布权限。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 真实CI和PR及分支现场有实际处理及可追溯结果
- [ ] #2 Fork来源ID、精确SHA、真实CI、独审和原生队列不降级
- [ ] #3 共用CI与三仓库规范落地，真实链路验证或记录具体外部阻塞
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1.保存实时CI与全部PR/分支现场，接续707/677/708。2.修复最小Fork可信准入和共用CI，补负控与独审。3.逐项收口成熟PR及可恢复分支，用真实Fork PR验证或记录外部阻塞。

2026-11-17接续：固定三仓库ID并配置remote；恢复Fork A原生Actions和精确SHA验证；Fork B权限不足单独记录；最小云端规则与现场证据经评审交付，不代替主仓库集成和RC实机。

2026-11-17增量：接续PR712；Quick dispatch完整受影响JS/Lua，未知输入拒绝；Quality PR矩阵前只读核验固定Fork ID、精确HEAD/BASE及先完成的成功run，Full按未知影响升级；保留原生队列/Release策略；定向负控、独审和按需统计。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-17：三remote已配置；Fork A通过官方PUT Actions permissions激活4现有工作流，Fast dispatch44007967971真实成功但零测试且明确要求Full，不作回归通过。互援Full44008162718实际启动并定位Windows证据日志尾空格阻塞，正无损压缩修复677/707。Fork B授权后push=true，Actions设置仍403、工作流未登记，已请Owner激活。协作规则独审通过并提交e215a71b，PR712。两条已删除queue ref的旧Full43927295813/43905690493已实际cancelled读回。698实际合入release b9bca884，既有本地不同提交保留。

Owner已授权Fork B写入并启用四现有Actions，三remote可用。两Fork改名后按原固定ID解析并同步A Slay-the-Heavens-Fork-A、B Slay-the-Heavens-Fork-B。A真实输入修复Fast44008650092实际选测成功，B唯一Full44009128502已创建；均不代替主仓库集成。PR712最新80c8887d已再次独审PASS并推送；merge:auto因impact尚未实际给出路由而HOLD，未添加ci:full强行绕过，未声称授权。

云端交接要求：PR712在现有TASK_EXECUTION增加从云端克隆到任务认领、三remote、Fast/Full、独审、正式集成与本地验收的顺序入口；必要现场证据使用远端run/PR与仓库附件，不依赖F盘或本轮聊天。Fork实际名称按固定ID解析，旧名称仍留历史证据。

当前交接：Fork A真实Fast44008650092已完成实际选测；Fork B Full44009128502按准确677新HEAD执行，正式集成未完成。707已正常接续最新Release b9，经来源适配46/46及独立Node24负控、主控独审后FF至e2feae68，原生SQUASH auto已读回；Release四项Required/Strict不变。677与712原merge:auto仅dry-run，当前impact路由未知故HOLD；未加ci:full或绕门槛。任务仅AC1有本轮实际处理证据，其他AC继续未完成。

2026-11-17增量：固定ID/HEAD/BASE/成功且先完成的Fork run准入已实现于Quality/Licenses入口；Quick完整受影响JS/Lua并补语法、Backlog、Lua棘轮，未知/零覆盖拒绝；不触碰保护和677/707策略。actionlint及定向负控通过，独审已消除Full base遗漏、Draft许可证抢跑与rerun时间身份问题。部署与真实跨仓库Actions token正链路仍待托管事件，不提前勾AC。

2026-11-17真实失败诊断增量：ForkAFull44026568101/b480的Windows工程历史逆投影未接完整preflight前视图，原engineering-quality第189行断言真实RED；另POSIX并发EOL历史例返回null、Windows历史形状timeout20断言同源失败。90499a17为主控独立条件修复候选（两job条件及新status来源包，原包保留），主控报告该条件范围原RED→新2/2；不能视作整轮Full通过。本次独立C临时Node22用准确b480及904原包，各执行原工程callback、POSIX前三callback及Windows原cap/timeout断言，均2pass/3fail→5/5；最小三文件候选保留原断言/物理current/旧pin，历史输入仅接精确beforePreflightSource。新增helper/test身份须由主控纳入新status包后验完整闭包；POSIX第四历史callback、三整文件及完整Full尚未本轮验收；未推ref未重跑CI，状态与AC保持未完。
<!-- SECTION:NOTES:END -->
