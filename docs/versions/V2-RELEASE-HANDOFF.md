# v2.0.0 Release 分支交接

> 快照：2026-11-16（北京时间）；这是**分流入口与待验门禁**，不是实时 CI/PR 状态。每轮先读远端 refs、原生 Ruleset、当前 PR/Backlog 和准确候选身份。状态：**RELEASE_INTEGRATING / RULESET_ACTIVE / CI_POLICY_IN_PR / RC_NO_GO**。Release 集成分支不等于已冻结的发版候选。

## 所有 Agent 的分流规则

- **当前发版**：`release/v2.0.0` 从 `develop@c2409ad750c15124b7b843c6bbfa5b222537cb75` 派生作集成分支；只做岩系旅行者、第一/二幕的必要 Bug、稳定性、性能、玩家可见发布文案及发布元数据，不增新角色/新幕/非必需特性。基于最新 `origin/release/v2.0.0` 在**独立 worktree + fix/<slug>** 开发，PR **base=release/v2.0.0**；禁止直接提交 Release。
- **未来版本**：胡桃等角色、美术实验、第三四幕、非阻塞技术债与新功能，仍从最新 `origin/develop` 派生独立 worktree，PR **base=develop**；实验分支保持独立，不为进度而混入 Release。
- **历史在途 PR 不自动归入本版**：#661、#663 已合入冻结起点；冻结时 #672（PC 修复）、#674（手机药水输入）、#665（发布/版本机制）、#673（手机 Backlog）仍以 develop 为 base、未进入 Release；#668（Lore）、#667（AI 目录治理）另按发布范围评审。协调者**先查最新合并/自动合并状态和精确 diff**，只将明确属于 2.0 的成果按 PR 重定向或选择性移植；勿重复合并、勿因自动队列改变 base 而让在途成果丢失。
- **不得把 `develop` 整体合入 Release**。Release 修复通过独立 PR 同步回 Develop（按变更实际来源选择 cherry-pick/重做），记录对应提交/PR；不在双分支重复独立实现同一 Bug。发布后 Release → master（PR）→ 精确发行提交的 `v2.0.0` 注释 Tag；平台由 Owner 人工更新。同步修复后核对 Develop 不回退。

## Release 准入状态（必须核实）

- `Quality`、`Licenses`、`Quick feedback` 保留 `release/**` PR 入口；日常已映射修复走完整受影响双平台 Fast，Release push 不再重复启动 Quality。未知范围/CI基础设施保守回退与显式 Full 请求见 [CI-FAST](../CI-FAST.md)。实际 GitHub 当前 SHA 检查才算通过，禁止借用旧结果。
- Release Ruleset **27313515 已实际读回生效**：匹配 `refs/heads/release/*`，禁止删除/强推，必须 PR、解决讨论、Strict，Required 为 Actions 来源的 `check`、`presentation`、`engineering-posix`、`inventory`，无 bypass、无 Merge Queue。独立代码评审依原工程合同核查；Release 使用原生 Auto-merge 等待必要检查，`npm run merge:auto` 仍只用于 Develop。不得直接照抄 Develop 专属状态为 Release 必需项。
- **日常 Release 修复经独审及必要 Fast/质量检查通过即可自动合入，不等待候选 Full。** 集成完成、准备上线时才冻结准确 Release HEAD，显式请求一次现有 hosted Full；最新完整分片、不可变 checkout 收据与 HEAD/attempt 均通过才可发布，代码变化须重新验收。Release→master 的必需 Quality 自动验证此门禁。入口见 [CI-FAST](../CI-FAST.md)，不自动打 Tag 或上传平台。
- RC 放行还要同一精确 `source SHA + buildId + GIL SHA256 + payloadDigest` 的官方导入/ready、PC/手机实测、两幕自然通关、平台关卡 ≤20MB / 服务器 ≤3MB、负载/性能与更新日志证据。遵循 [发布操作单](../PUBLISHING.md)、[平台负载](../PLATFORM_LOAD.md)、[CI](../CI.md) 及 Backlog 原有 TASK。**PR 绿灯不是正式发布许可**。

## 最短交接口径

任何执行者汇报：`branch/base@SHA → PR@HEAD → CI/独审 → 官方候选/设备/容量（已验/未验） → 未关闭阻塞`。每次实际改变版本范围、合并去向或 Release 门禁时更新本文件的**快照日期与事实**，不把历史快照称作最新状态。
