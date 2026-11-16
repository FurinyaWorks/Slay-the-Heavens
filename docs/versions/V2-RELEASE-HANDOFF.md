# v2.0.0 Release 分支交接

> 快照：2026-11-15（北京时间）；这是**分流入口与待验门禁**，不是实时 CI/PR 状态。每轮先读远端 refs、原生 Ruleset、当前 PR/Backlog 和准确候选身份。状态：**RELEASE_BRANCH_CREATED / RULESET_ACTIVE / FULL_PENDING / RC_NO_GO**。

## 所有 Agent 的分流规则

- **当前发版**：`release/v2.0.0` 从 `develop@c2409ad750c15124b7b843c6bbfa5b222537cb75` 冻结；只做岩系旅行者、第一/二幕的必要 Bug、稳定性、性能、玩家可见发布文案及发布元数据，不增新角色/新幕/非必需特性。基于最新 `origin/release/v2.0.0` 在**独立 worktree + fix/<slug>** 开发，PR **base=release/v2.0.0**；禁止直接提交 Release。
- **未来版本**：胡桃等角色、美术实验、第三四幕、非阻塞技术债与新功能，仍从最新 `origin/develop` 派生独立 worktree，PR **base=develop**；实验分支保持独立，不为进度而混入 Release。
- **历史在途 PR 不自动归入本版**：#661、#663 已合入冻结起点；冻结时 #672（PC 修复）、#674（手机药水输入）、#665（发布/版本机制）、#673（手机 Backlog）仍以 develop 为 base、未进入 Release；#668（Lore）、#667（AI 目录治理）另按发布范围评审。协调者**先查最新合并/自动合并状态和精确 diff**，只将明确属于 2.0 的成果按 PR 重定向或选择性移植；勿重复合并、勿因自动队列改变 base 而让在途成果丢失。
- **不得把 `develop` 整体合入 Release**。Release 修复通过独立 PR 同步回 Develop（按变更实际来源选择 cherry-pick/重做），记录对应提交/PR；不在双分支重复独立实现同一 Bug。发布后 Release → master（PR）→ 精确发行提交的 `v2.0.0` 注释 Tag；平台由 Owner 人工更新。同步修复后核对 Develop 不回退。

## Release 准入状态（必须核实）

- 本次 bootstrap 将 `Quality`、`Licenses`、`Quick feedback` 触发范围扩展至 `release/**`。现有 `scripts/ci-impact.mjs` 对 Release PR/Push 强制 **Full**；实际 GitHub 检查成功才算生效。禁止借用 Develop 的 Fast、旧 SHA 或旧候选报告。
- **远端保护已创建并读回**：Release Ruleset `27313515` 为 active，仅匹配 `refs/heads/release/*`，空 bypass；禁止删除/强推，必须 PR、解决讨论、Squash 与线性历史。四项 strict Required 为 Actions 来源（app `15368`）的 `check`、`presentation`、`engineering-posix`、`inventory`；分支 API 已返回 `protected=true`。原 develop/master 及 Core 规则快照前后逐字一致。请求和实际读回均经独立会话复核，见[配置证据](../evidence/release-v2-protection-20261115.json)。这不是直接推送/强推拒绝实验或 Full 成功证明。
- `pr-quality`、`independent-review` 的现有自动发布逻辑仅针对 Develop，不能照抄为 Release 必需项；Release 独立代码评审依原工程合同人工核查。原生 Merge Queue / `npm run merge:auto` **目前只支持 Develop，禁止在 Release 假定其可用**。已读回引导提交 `36b9b157` 的 Release Push Quality `43715790645` 与 Licenses `43715790659` 被触发，初次观察仍为 queued；当前 Release PR/Push Full 尚未取得成功证据，不冒写门禁通过。
- **在 Ruleset 生效、Release PR/Push Full 跑通并有独审证据前，Release 合并保持 HOLD**。不以本文件或工作流声明冒充远端保护、CI/官方设备结果。未经批准不临时放宽验证、修改发版范围、打 Tag 或上传千星平台。
- RC 放行还要同一精确 `source SHA + buildId + GIL SHA256 + payloadDigest` 的官方导入/ready、PC/手机实测、两幕自然通关、平台关卡 ≤20MB / 服务器 ≤3MB、负载/性能与更新日志证据。遵循 [发布操作单](../PUBLISHING.md)、[平台负载](../PLATFORM_LOAD.md)、[CI](../CI.md) 及 Backlog 原有 TASK。**PR 绿灯不是正式发布许可**。

## 最短交接口径

任何执行者汇报：`branch/base@SHA → PR@HEAD → CI/独审 → 官方候选/设备/容量（已验/未验） → 未关闭阻塞`。每次实际改变版本范围、合并去向或 Release 门禁时更新本文件的**快照日期与事实**，不把历史快照称作最新状态。
