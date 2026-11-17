---
id: TASK-88.1.1
title: 打通三仓库直接贡献并恢复集成吞吐
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-16 15:08'
updated_date: '2026-11-17 05:42'
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
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-17：三remote已配置；Fork A通过官方PUT Actions permissions激活4现有工作流，Fast dispatch44007967971真实成功但零测试且明确要求Full，不作回归通过。互援Full44008162718实际启动并定位Windows证据日志尾空格阻塞，正无损压缩修复677/707。Fork B授权后push=true，Actions设置仍403、工作流未登记，已请Owner激活。协作规则独审通过并提交e215a71b，PR712。两条已删除queue ref的旧Full43927295813/43905690493已实际cancelled读回。698实际合入release b9bca884，既有本地不同提交保留。

Owner已授权Fork B写入并启用四现有Actions，三remote可用。两Fork改名后按原固定ID解析并同步A Slay-the-Heavens-Fork-A、B Slay-the-Heavens-Fork-B。A真实输入修复Fast44008650092实际选测成功，B唯一Full44009128502已创建；均不代替主仓库集成。PR712最新80c8887d已再次独审PASS并推送；merge:auto因impact尚未实际给出路由而HOLD，未添加ci:full强行绕过，未声称授权。

云端交接要求：PR712在现有TASK_EXECUTION增加从云端克隆到任务认领、三remote、Fast/Full、独审、正式集成与本地验收的顺序入口；必要现场证据使用远端run/PR与仓库附件，不依赖F盘或本轮聊天。Fork实际名称按固定ID解析，旧名称仍留历史证据。

当前交接：Fork A真实Fast44008650092已完成实际选测；Fork B Full44009128502按准确677新HEAD执行，正式集成未完成。707已正常接续最新Release b9，经来源适配46/46及独立Node24负控、主控独审后FF至e2feae68，原生SQUASH auto已读回；Release四项Required/Strict不变。677与712原merge:auto仅dry-run，当前impact路由未知故HOLD；未加ci:full或绕门槛。任务仅AC1有本轮实际处理证据，其他AC继续未完成。

2026-11-17云端接续：A新合同真实红绿已分层留证；edf44022319453虽绿但漏选新增合同，d0844023968552显式33项32过1失败，873d4392c02fd5ac92e653e57a78fd59f6ae63c6的Quick44024346434修后33/33显式CI合同、96/96原JS选测与Lua相关步骤成功。主仓677已暂停旧6b授权并以leaseFF至该873，Quick44024833076真实completed/skipped，Quality44024833155与Licenses44024833079仍queued；新精确独审已通过，原merge:auto因impact路由未知HOLD，须待现有impact确认后按docs/evidence/three-repo-flow-20261117/pr677-review-873d4392.json重新授权，不加ci:full绕过。707@e2feae68及703@80114c7f原SQUASH授权有效，均未合并；707另有Fork候选3f890cdcdf2849ae981d9c221d2a0c390647b062的Quick44025235537在验，不能替换正式HEAD或授权。本轮仍未完成正式集成、冻结Full及同候选官方/设备验收；Full120账本未远端保全。F盘不可读，仅以原config和精确任务原件的C临时副本经BacklogCLI追加本notes，不改状态、AC或其他字段。

补充707接续：Fork候选3f890cdcdf2849ae981d9c221d2a0c390647b062相对e2feae68c855214addce2b64a8722a7354e1260f的独审已通过，目标BASE为b9bca884ed9b9831965b409885d78f719b9a567a；Quick44025235537的显式合同步骤success，普通related仍在运行。本记录不称总run成功，不替换当前正式707HEAD或旧授权；独审原件保存在docs/evidence/three-repo-flow-20261117/pr707-review-3f890cdc.json。

最新707读回：Quick44025235537@3f890cdcdf2849ae981d9c221d2a0c390647b062已completed/success，真实35/35显式CI合同（含B9新负控）、96/96原JS选测及Lua步骤成功；旧e2授权先暂停并读回，再leaseFF主707至该3f890，PR/ref的HEAD与BASEb9bca884ed9b9831965b409885d78f719b9a567a均已读回，随后SQUASH自动授权已启用并读回05:40:44Z。该授权不等于正式CI通过或合并，677仍等现有impact确认路由后重授权；状态与AC保持未完成。

主仓去重补充：707@3f890cdcdf2849ae981d9c221d2a0c390647b062的正式Quick44025702654已completed/skipped，Quality44025702622与Licenses44025702495仍queued；连同677@873的正式Quick44024833076，本轮两个ReadyPR已实际零runner跳过重复advisory。此事实不构成exactly-once保证，不替代主Required、MQ或准确冻结Full，也未声称三PR合并。
<!-- SECTION:NOTES:END -->
