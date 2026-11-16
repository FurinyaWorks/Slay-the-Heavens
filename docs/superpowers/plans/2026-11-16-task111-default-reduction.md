# TASK-111 正式默认包减容 Implementation Plan

> 由当前执行者逐项实现（executing-plans），实现后独立 Sub-agent 深审；用户已授权继续实际减容，不合并、发版或操作窗口。

**Goal:** 实际降低正式默认装配的 GIL 成本，保留原美术、规则、输入和运行成本。
**Architecture:** 原始 build:ui 树继续是视觉/交互事实来源。在原生候选编译边界将完全相同的卡面子树写为引擎模板引用；模板内每个运行实例仍独立。账单分清逻辑展开树与实际编码树，不把 GIL 字节换算官方 MB。
**Tech Stack:** Node24、既有 Miliastra native encoder、Fengari/原生 UI 合同。
**Spec:** 本轮用户指令；TASK-111；docs/PLATFORM_LOAD.md。

## Global Constraints

- 继续独立 feat/task111-capacity-forensics / PR #703，最初Release基线1cc5479b；交付前已纳入新Release33d71575（#697）。
- D0：396b5575、buildId 5c3f0782-b01d-4e8e-9252-1fb431b23c47，候选 CLI 默认美术开关，无 Official/V25/轻量实验，不是 RC。
- D0 使用既有公开 fixture 基底；没有用户实际 GIL/客户端。官方容量、ready/设备均 UNVERIFIED。
- 不改 Lua 游戏热路径、资源、文字、RNG、合法宿主数量、draw order；不引入动态 Lua 创建/共享运行状态。
- #691 保持序列化所有权，不重复其实现。原历史证据和来源包不可变。

## Review Focus

- 同图不同输入或命名/状态/几何不得误合并：只按完整 children 与根尺寸相同分组，单例保留。
- 真实引擎引用的直接子查询、显示、布局需遵循官方 BaseControl/ReferenceControl 合同；离线展开证据不冒充当前设备结果。
- 两个引用实例必须有独立文本、颜色和事件状态；子孙不变、运行期 Lua 工作不增加。
- 旧 base 缓存和遗留共享模板不能造成重复/膨胀；来源或绑定不符拒绝，旧档可用旧来源审计。
- 报告继续保留61逻辑宿主/8,892逻辑控件，另报物理编码记录和共享定义，不把新模板误当额外玩家宿主。

### Task 1: 同基线原生模板单因素实验

Files: work/default-reduction-1116（诊断，非产品）。
- [x] 通过正式默认 CLI 重建干净 D0，冻结收据/GIL身份，实测15,931,074 GIL字节、UI10,903,022字节。
- [x] 按完整卡面 children+size 分组：10手牌、15节点、23只读宿主各组相同；13个单例保留。
- [x] 真实编码器写模板/引用，核对除UI区段外逐字节相同；读回展开每项属性/顺序与D0完全相同。
- [x] 单因素结果不足或语义不明确时不保留，不凭预估收益写产品结论。

### Task 2: 默认原生候选无损共享

Files: scripts/native-ui-card-sharing.mjs（纯打包/展开及收据认证）；scripts/build-native-candidate.mjs（编译接缝/绑定）；scripts/audit-native-candidate.mjs（同源重建与严格读回）；tests/native-candidate.test.mjs（并入既有库存）。
Interfaces: packNativeCardFaces(layout,templates) -> {layout,templates,sharing}; expandSharedCardFaces(layout,templates) -> cloned logical tree；默认启用，实验profile保持既有装配。
- [x] 先失败测试：重复组减少物理记录；两实例独立；单例/不同命名/尺寸/状态不合并；缺模板、错绑定、循环/同名拒绝。
- [x] 实现确定性原生模板引用，仅候选编译边界应用，原始生成物不变。打包展开须精确还原原树。
- [x] 固定可追踪共享模板名，实际绑定写收据；禁用不兼容旧UI缓存，清理当前owner遗留定义须先证明无引用。
- [x] 审计按同source snapshot重放打包，严格核全共享模板/绑定；旧收据无新profile走原合同。
- [x] 相关生成、原生checker、真实Lua UI/生命周期与输入保护回归，必要来源延续追加不改旧档。

### Task 3: 次级数据冗余、重建与交付

- [x] 核查默认已选lowpolyHero与selection133消费路径，仅在证明同状态输出一致后排除冗余；保留原资产与独立历史profile。
- [x] 其他大户按收益/风险评估：V4装配投影不得改变准入或误裁合法跨角色内容，不为追求数字增加运行解压。
- [x] 每项从同D0单因素验证；最终干净HEAD重建新D2/F1并逐区段/模块对比，不借C4身份。
- [x] 容量报告、数据/负控/回归、Backlog CLI记录、独立精确HEAD/BASE深审；推送原PR，不合并或发布。

执行结果：产品冻结bf74；最新默认完整音乐GIL少5,003,251字节。见docs/research/2026-11-16-default-release-reduction.md。以上勾选表示实施/离线验证步骤已执行，不代表官方AC通过；严格audit仍FAIL两项，本地Full未完成，官方/设备/引擎验收全部UNVERIFIED。

基线变化复验：最新产品7b6；原始33控制F2无sidecar不强行比较，追加已修统计工具/五owner回退的干净F4控制b4bfb55e，与F2交叉验证后比较F4/F3，完整音乐15,953,517→10,950,266字节。节点payload差异已逐字段定位仅210编辑器x/y坐标（两对各210项），源码和其他图字段保持一致；严格audit未放宽。CI来源整合另以不可变outer packet追加，157/157，产品回归21/21。
