---
id: TASK-81.2
title: 验收安全Fast真实入队闭环（机制已交付）
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-06 15:41'
updated_date: '2026-11-17 15:57'
labels:
  - 待验
  - delivery-verify
dependencies: []
documentation:
  - docs/evidence/ci-draft-history-20261109/README.md
parent_task_id: TASK-81
priority: medium
type: enhancement
ordinal: 162000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-81已有按影响选测，但当前develop Ruleset 25870651强制full-quality，原生自动合并入口也要求PR Full，导致安全Fast不能真正缩短PR入队等待。复用现有选测与Merge Queue，打通PR Fast→队列Full，不另建测试平台、不重复PR525/527的超时修复。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 核对当前真实Ruleset、影响选测、Full发布器、auto-merge/交付验证器与既有PR，形成最小一致变更；不得把Fast冒充Full、丢弃失败或伪造旧收据
- [ ] #2 已完整映射且低风险的PR在双平台Fast及独立审查通过后可正常进入原生Merge Queue；核心/未知/删除/超预算仍走PR Full，取消/失败/缺片/旧SHA一律拒绝
- [ ] #3 原生队列必须在真实组合SHA完成原Full全量及全部必要校验后才能squash；合后develop push继续Full，原有保护、来源与可恢复性保留
- [ ] #4 用真实安全Fast PR和故障负例验收入队、组合失败阻断、成功合并及合后收据；报告PR/队列/push耗时和重复Full成本，未实测不宣称达成TASK-81性能目标
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
接续#529；实现精确Fast收据与PR准入，保留高风险Full、队列完整Full及合后Full；独审和当前SHA CI通过后切换Ruleset，真实安全PR验证入队、squash与合后验收。

2026-11-10 接续既有 PR584，不新增自主领取。鲜查12个开放PR与当前HEAD53b55d4d，独立复跑四个策略合同21/21，另复现历史工作流投影失败。仅补完整Draft/Fast工作流外层历史投影及LF/CRLF、部分/重复/漂移拒绝控制；保持正式工作流、旧档案/hash/断言、预算与全部队列门禁。定向原失败回归、独立复审后接续原PR；不重复Full、不改Owner/status/AC或用户设备。

2026-11-16经Owner批准独立修复Release bootstrap Full43715790645的10个命名来源/工作流合同缺口，基36b9，不依赖P0玩法。先B1/B2/B4在相同当前测试与helper下只替完整workflow c240/36做控制，再使用已有exact CI packet/投影机制认证3workflow前驱；旧逆变换使用明确历史输入，物理Release触发/cap/artifact/readonly职责保留加强。只来源/helper/4raw测试及必要calibration接线，raw876/1423完整发现、旧gzip/hash/成本/分片/预算不改，定向10命名+缺/漂移/部分packet/当前合同，独审后再协调PR；不73/Full/实机。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-06只读审计：TASK-81仍In Progress；PR307已提供Fast选择但原Ruleset六项Required含full-quality；scripts/publish-full-quality.mjs拒绝Fast发布Full成功，scripts/arm-auto-merge.mjs只接受Full入队。PR525已合入并发优化，PR527在做Sapphire超时；本任务不重复两者。开发、规则变更及真实Fast样本均未执行，验收保持未勾。

已接续#529任务定义，实现pr-quality、双平台Fast不可变收据、schema6/7/8与原生队列Full/合后Full验证。固定Node24相关合同129/129及Fast组合回归29/29通过；远端Ruleset尚未切换，真实Fast链路尚待。技术证据docs/backlog-details/TASK-81.2.md，AC保持未勾。

2026-11-07已读回远端pr-quality/Strict/空bypass/SQUASH ALLGREEN队列。#538正常queue Full42323846768通过并实际合为2c85bc61，合后Full42327242610验收发现slice3超时。#539从该真实base直接Ready且精确独审，正常Quality42327477690实际Fast；尚待完整自动链路。Free计划与20个Full活跃槽已读回，资源排队和真实执行分开；未取消必要验证或改保护/预算。技术证据追加TASK-81.2附件，AC保持未勾。

#539旧c7 Fast已完成8项合同，13分11秒，双平台执行33/27秒，原入口dry-run eligible。但#538合后Full Win1真实失败后没有发布授权、没有入队；将已审M7成果与阶段诊断正常追加539，新HEAD必须新独审/Full，旧Fast不冒充新组合或完整链路通过。

PR584本地历史合同修复：六项Draft/Fast完整外层投影接入既有历史链，旧执行余量断言仅恢复实际历史输入边界；未改正式工作流、旧hash、预算或生产逻辑。176个不同定向用例通过；独立审查及533逐行变异、移动/重复/混合换行负控PASS。保留原4个复现失败及两次新负控夹具定位错误日志，verify:backlog和guidance通过；doctor仍报原5组重复ID和旧归档警告。精确新HEAD Hosted Full/队列/合后验收待验证，不重跑Full、不改AC。技术证据 docs/evidence/ci-draft-history-20261109/README.md。

2026-11-14逐项对账：已实现pr-quality/严格队列及双平台Fast收据；原539安全Fast后未完成完整自动链路，不能据Full PR634代验Fast真实成功闭环。仅保留该验收缺口，不重配Ruleset或重做门禁。

2026-11-14第二轮状态纠正：pr-quality、双平台Fast收据与严格队列已经实现；尚缺安全Fast真实入队完整链路，是验收中而非未开始。 更正上一轮将待验统一退回To Do的处理；未勾AC及独立审批保持，In Progress表示工作已开展，不表示有人正持续占用执行窗口。

2026-11-16 Release bootstrap43715790645原14JS失败job日志归并10唯一断言。独立36b9树以相同测试/helper仅替完整quality.yml，B1/B2/B4 c240=3/3 PASS、36=3/3 RED，确认bootstrap前驱边界。仅bootstrap3workflow完整认证接续，不依赖P0；保当前物理Release触发/cap/artifact/readonly/实际硬超时，历史逆变换与原负控用明确旧输入。10原失败名+新exact/raw及2旧来源合同14/14通过，raw仍876JS/1423Lua，92旧gzip与workflow/runtime/调度配置未改；新增live预测仅诊断，原frozen预算断言保留。原日志矩阵在主树.artifacts/release-bootstrap-failures-1116，当前证据在独立树.artifacts/bootstrap-compat-1116。未73/Full/手机，状态/Owner/AC不变；独立审后再协调PR。

政策来源补记：Owner已明确docs/CI.md的2026-11-07决定仍有效，Windows30/POSIX20是性能目标，预测与60秒预留只作提示，不凭预测阻交付。#684(ae5194a7)及#690(11ec36bf/base36b9)新增live target门禁不是新的Owner指令；本bootstrap-only raw合同不机械采用它们，保原实际执行guard并输出预测/overrun。#690 PC navigation不是本片4raw来源，不重复产品实现，不改他人PR/JSON或冻结业务。

2026-11-17本轮CI治理：主仓规则保持Required/Strict/SQUASH-ALLGREEN及原发版保护，不采用额外三项原生人工审批。真实682队列收据证明原审B0=c240与实际非首组父Q=b85不同，旧同BASE夹具不足，193可部署判定已撤销，正在分离原独审/正式CI与实际Queue Full证明；不改写旧收据。703与707已完成Release原生自动合并，但Release无Queue；本次712高风险Full也不能代验安全Fast样本。AC与待验状态保持，真实安全Fast闭环尚未完成。追溯 https://github.com/FurinyaWorks/Slay-the-Heavens/pull/712 。
<!-- SECTION:NOTES:END -->
