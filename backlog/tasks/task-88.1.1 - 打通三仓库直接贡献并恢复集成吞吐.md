---
id: TASK-88.1.1
title: 打通三仓库直接贡献并恢复集成吞吐
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-16 15:08'
updated_date: '2026-11-17 03:31'
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
<!-- SECTION:NOTES:END -->
