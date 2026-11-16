# v2.0.0 Release 分支交接

> 快照：2026-11-15（北京时间）；这是**分流入口与待验门禁**，不是实时 CI/PR 状态。每轮先读远端 refs、原生 Ruleset、当前 PR/Backlog 和准确候选身份。状态：**RELEASE_BRANCH_CREATED / RULESET_NOT_CONFIGURED / RC_NO_GO**。

## 所有 Agent 的分流规则

- **当前发版**：`release/v2.0.0` 从 `develop@c2409ad750c15124b7b843c6bbfa5b222537cb75` 冻结；只做岩系旅行者、第一/二幕的必要 Bug、稳定性、性能、玩家可见发布文案及发布元数据，不增新角色/新幕/非必需特性。基于最新 `origin/release/v2.0.0` 在**独立 worktree + fix/<slug>** 开发，PR **base=release/v2.0.0**；禁止直接提交 Release。
- **未来版本**：胡桃等角色、美术实验、第三四幕、非阻塞技术债与新功能，仍从最新 `origin/develop` 派生独立 worktree，PR **base=develop**；实验分支保持独立，不为进度而混入 Release。
- **历史在途 PR 不自动归入本版**：#661、#663 已合入冻结起点；冻结时 #672（PC 修复）、#674（手机药水输入）、#665（发布/版本机制）、#673（手机 Backlog）仍以 develop 为 base、未进入 Release；#668（Lore）、#667（AI 目录治理）另按发布范围评审。协调者**先查最新合并/自动合并状态和精确 diff**，只将明确属于 2.0 的成果按 PR 重定向或选择性移植；勿重复合并、勿因自动队列改变 base 而让在途成果丢失。
- **不得把 `develop` 整体合入 Release**。Release 修复通过独立 PR 同步回 Develop（按变更实际来源选择 cherry-pick/重做），记录对应提交/PR；不在双分支重复独立实现同一 Bug。发布后 Release → master（PR）→ 精确发行提交的 `v2.0.0` 注释 Tag；平台由 Owner 人工更新。同步修复后核对 Develop 不回退。

## Release 准入状态（必须核实）

- 本次 bootstrap 将 `Quality`、`Licenses`、`Quick feedback` 触发范围扩展至 `release/**`。现有 `scripts/ci-impact.mjs` 对 Release PR/Push 强制 **Full**；实际 GitHub 检查成功才算生效。禁止借用 Develop 的 Fast、旧 SHA 或旧候选报告。
- **未完成的远端设置：新增 Release Ruleset**，匹配 `refs/heads/release/*`，禁止删除/强推，必须 PR、解决讨论；Required 至少 `check`、`presentation`、`engineering-posix`、`inventory`（核对 GitHub 实际 job/context 来源及当前 Full）。`pr-quality`、`independent-review` 的现有自动发布逻辑仅针对 Develop，不能不经适配便照抄为 Release 必需项；Release 独立代码评审依原工程合同人工核查。原生 Merge Queue / `npm run merge:auto` **目前只支持 Develop，禁止在 Release 假定其可用**。
- **在 Ruleset 生效、Release PR/Push Full 跑通并有独审证据前，Release 合并保持 HOLD**。不以本文件或工作流声明冒充远端保护、CI/官方设备结果。未经批准不临时放宽验证、修改发版范围、打 Tag 或上传千星平台。
- RC 放行还要同一精确 `source SHA + buildId + GIL SHA256 + payloadDigest` 的官方导入/ready、PC/手机实测、两幕自然通关、平台关卡 ≤20MB / 服务器 ≤3MB、负载/性能与更新日志证据。遵循 [发布操作单](../PUBLISHING.md)、[平台负载](../PLATFORM_LOAD.md)、[CI](../CI.md) 及 Backlog 原有 TASK。**PR 绿灯不是正式发布许可**。

## 最短交接口径

任何执行者汇报：`branch/base@SHA → PR@HEAD → CI/独审 → 官方候选/设备/容量（已验/未验） → 未关闭阻塞`。每次实际改变版本范围、合并去向或 Release 门禁时更新本文件的**快照日期与事实**，不把历史快照称作最新状态。

## 2026-11-16：独立容量专项（Owner 新决定）

- **当前 2.0.0 Release 新增 [TASK-111](../../backlog/tasks/task-111%20-%202.0.0关卡容量归因与冗余收口.md)**：直接从 `release/v2.0.0` 独立开展整包存储归因、同源隔离实验和必要的最小修复。**dependencies: []**；不等待 TASK-103、全部产品 UI 或 TASK-100/10.1.2/105 完成。参照这些任务的已交付工具和证据，不重复立项。
- 原有 TASK-105 保留 **M9 未来角色扩容量产**边界，TASK-97 对 TASK-105 的依赖不变；本专项不扩角色、不新增幕，不修改已批准视觉与规则。
- Release 最终冻结同候选的**官方关卡 ≤20MB / 服务器 ≤3MB**仍是发版必要条件；16MB 是争取的内部余量目标。离线 Lua、GIL 或控件计数不冒充官方 MB；没有本轮官方窗口时可先做离线归因，缺证据保持 UNVERIFIED。该段是后续决策补记，顶部 11/15 历史 Ruleset 快照并非最新远端状态。

### TASK-111 离线接续（非 RC）

见 [本轮归因报告](../research/2026-11-16-release-capacity-forensics.md)：最新 Release `1cc5479b` 的真实编码大户为原生 UI/39 个完整卡面；独立最小修复只排除 Official 已无消费路径的 selection133，诊断 GIL 减少 128,379 字节。序列化仍由 #691 负责，本 PR 未重复其实现。C4 `be5466c1 / ffb7a077-2bb4-48ec-8f23-cad599dd8d0e / 9a3a94c08f708b4fc64b6397395f429f34f7a9b2f3160358cc4b6392734567a4` 使用公开 fixture 基底，**不是用户游戏候选或正式 RC**。官方容量、导入/ready、PC/手机仍 UNVERIFIED；C0/C4 严格审计均有相同三项未通过，不作为发布 GO。后续应在真实基底和届时最新 Release 重建，不能沿用此诊断身份放行。
