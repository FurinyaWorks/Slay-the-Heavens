# v2.0.0 Release 分支交接

> 快照：2026-11-15（北京时间）；这是**分流入口与待验门禁**，不是实时 CI/PR 状态。每轮先读远端 refs、原生 Ruleset、当前 PR/Backlog 和准确候选身份。状态：**RELEASE_BRANCH_CREATED / RULESET_NOT_CONFIGURED / RC_NO_GO**。

> 冻结规则唯一执行入口：[Release维护技能](../../.codebuddy/skills/release-maintenance/SKILL.md)。Quality元数据门禁要求类型/目标版本/发版必要性；Feature拒绝。TASK-42.1/#670的数字键、快捷键、预输入仅后续版本，不以调试便利等理由引入。声明不替代人工diff复审。既有Release保护已只读核验active，原文见[本轮规则读回](../evidence/release-freeze-20261116/release-ruleset-readback.json)；下文2026-11-15未配置状态仅历史快照。新增范围gate仍须正常合入后生效。

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
