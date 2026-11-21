---
id: TASK-105
title: 验证20MB下角色容量可扩展性与量产准入
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-13 09:23'
updated_date: '2026-11-15 13:53'
labels:
  - capacity
  - scalability
milestone: m-9
dependencies: []
references:
  - docs/PLATFORM_LOAD.md
  - docs/art/UPLOAD-BUDGET-20261029.md
  - docs/art/READY_ASSET_INTEGRATION.md
  - docs/backlog-details/M7-CAPACITY-RECONCILIATION-20261113.md
documentation:
  - docs/backlog-details/TASK-105-CAPACITY.md
priority: high
type: task
ordinal: 172000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
证明《杀戮原塔2》在官方关卡存档20MB上限内有持续生产约20名乃至30名角色的可行路线；优先复用既有构建、共享UI、官方素材与`check:platform-load`，不以改造未验证的未来角色架构阻塞近期版本。

本任务是M9批量角色量产的独立硬前置，而不是近期版本、TASK-85单角色试验、TASK-62/64内容开发或整个M8的硬前置。不得把16MB内部预算、旧8.96MB观测、GIL大小、Lua源大小或模拟器测量当作官方包体实测。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 冻结当前正式候选B0，取得同一SHA、buildId、candidateSha256、payloadDigest、客户端版本和官方编辑器20MB容量面板读数/截图；缺实测标UNVERIFIED，不用历史候选替代。
- [ ] #2 同一干净基线隔离测B1第1名代表性角色、B2第2名角色及分别的纯玩法数据/角色肖像/待机/共享UI成本，记录每步官方容量delta、GIL、实际映射Lua、唯一数据、模板/控件实例；同一源码仅改变明确列出的变量。
- [ ] #3 区分一次性固定成本与每名角色的边际成本，结合第三/第四幕及其他未来内容预留，给出10/20/30角色的保守区间、16MB内部预算/20MB硬上限风险和测量不确定性；0.25MB只能作目标不是伪造的平台阈值。
- [ ] #4 审计角色选角/战斗/待机数据是否重复、共享渲染宿主的对象池和释放、生产清单能否只装配正式开放资源，验证运行时资源不随总角色数不必要地同时膨胀；若NO-GO只实施有量化收益的最小改造并重测，不能仅提交规范即标完成。
- [ ] #5 在既有`check:platform-load`、`verify:platform-load`与产物审计上补必要的容量增长检测和否决反例；无官方数据的预检为UNVERIFIED，正常PR不增加重型实机CI，不降低现有16MB预警与20MB门槛。
- [ ] #6 明确提交GO/NO-GO与可复核原始记录、同候选PC/实体手机加载和角色切换/释放证据；未通过前M9的TASK-97不得启动批量生产或宣称量产可行，仍可并行完成近期发布与单角色隔离实验。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
先确认B0官方容量身份；复用TASK-10.1.2的B0/B1与宿主成本实验口径，加上第二个角色B2；评估10/20/30名角色。如果NO-GO先定位共享/装配瓶颈，小规模整改和复测，直到有证据GO或明确长期架构路线不可行。真实设备与平台验证须依现有窗口权限，不假设能在无授权情况下取得。

2026-11-15授权接续：在capacity-integration-1115独立树按c2409ad7基线仅集成92e79424中的capacity-105离线run/replay合同与证据；先核g轮及旧档hash和恢复归档体积，再跑当前基线定向合同及Backlog验证。保留全部未验AC、原负责人和官方/设备UNVERIFIED，不重复旧矩阵；TASK97设计与容量前置保留，依赖机制由主控TASK87.2交付。只提交本地短分支，主控统一托管集成。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-11-13立项：以角色长期量产为目标，不为任何未参与的新赛事建立里程碑。现有TASK-10.1.2只覆盖精绘卡图/宿主的单实例和多实例容量，不能取代本任务的完整角色边际成本、章节点预留、未来角色池预测。

状态对账：原pr-641已认领In Progress，task-105-offline及backlog-continuation-1115已有离线成果；当前基线To Do过时，本轮是明确授权接续而非自主新领。保留原全部6项未验AC与Furinya。来源2e8d5d95实现/92e79424记录只读，3张已还原LFS图片不改。

接续验证：来源最终g的results/28档及639输入、旧39档逐hash核对，83成员恢复包100548673B仅保存在本树.artifacts并全部读回，不提交约100MB原始档；f/g28档压缩字节一致，a-e原树保留。c2409ad7定向合同7组6过0失败1本机symlink能力跳过；未重跑矩阵、不生成本轮候选。完整输入/历史数据不作为当前官方容量，6项AC仍未验；官方MB、ready、PC手机与长期GO均UNVERIFIED。详细验证、失败/跳过、恢复路径见docs/evidence/capacity-105-integration-20261115/README.md；独审与托管交付交主控。
<!-- SECTION:NOTES:END -->
