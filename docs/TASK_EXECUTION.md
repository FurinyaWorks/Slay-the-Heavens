# 任务执行与认领协调

## 云端 Agent 接手入口

从主仓库 `FurinyaWorks/Slay-the-Heavens` 克隆一份即可。三个仓库共享项目和 Backlog。日常开发使用 Fork，主仓负责正式集成和发布。旧 `release/v2.0.0` 已冻结，本版修复从 `develop` 接续。按任务读相关步骤。

1. 运行 `backlog instructions overview`，读根 `AGENTS.md`、[范围](SCOPE.md)、[交接](HANDOFF.md)；再查目标 Backlog 任务及附件。任务记录必须区分已实现、待集成、待正式 CI、待实机，不把 In Progress 当作可重复领取。
2. 按 [三仓库分流](CI.md#三仓库按需验证) 的固定 ID 解析当前名称，配置 origin/fork-a/fork-b；核对远端分支、三个仓库的开放 PR 和相关 dispatch。只取本任务需要的分支，不同步全部历史。主仓库在 develop 统一接续，旧 release/v2.0.0 冻结；A 优先 Fast、B 优先 Full。
3. 按下文核对认领、审批、依赖和文件范围，再用 Fork-First 检查选定短分支。发版修复从最新 develop 基线接续，按 [2.0 重建交接](versions/V2-RELEASE-HANDOFF.md) 核对旧来源并逐项接回。
4. 首次 `npm ci --ignore-scripts`，工具及生成物按 [TOOLCHAIN](TOOLCHAIN.md)、验证按 [ENGINEERING](ENGINEERING.md)；日常先看 `npm run test:related -- --plan --base <准确目标SHA>`，需要时分配现有 hosted Fast/Full。源码、构建、官方导入、ready、设备体验是不同证据，不用一项代替其余。
5. 按 [CI](CI.md) 完成独立复审及精确 HEAD/BASE 准入，读回原生授权后异步交接。离开前经 Backlog CLI 记录任务、目标分支、准确提交、PR/run 链接、已验证范围、具体阻塞和下一动作；代码及必要证据推到对应远端，不能仅留本机文件或聊天摘要。未合入不写 Done，不守候队列。

工程执行依赖 Git、Backlog、仓库内工具和 GitHub-hosted Actions，无需本地电脑或旧 self-hosted Runner 在线。只有编辑器、官方容量、导入及 PC/手机验收回到本地，并另取得当轮输入窗口；云端缺这些证据时明确保持未验证。正式平台发布由人完成。

**2026-11-13 产品优先决策：** 不再设独立M7架构优化里程碑。先交付M8/M9的真实可玩体验、角色与内容；架构治理仅在复现的缺陷、明确扩展阻塞、CI/容量硬门禁失败或有量化证据的交付成本问题发生时作为对应产品任务的最小工程切片。旧CC/SCC/fan-out数字本身不是自动开工条件。M7历史任务不得仅因In Progress被Agent无条件继续；已合 #634 质量棘轮持续执行且不放宽。归档/迁移与保留的未验AC见 [移交清单](backlog-details/M7-PRODUCT-FIRST-HANDOFF-20261113.md)。

**当前执行入口：不再使用 Sprint。** 任务不因日期到期、尚未开窗、所属里程碑或 M7→M8→M9 阶段顺序而暂停；不再维护周窗口、窄并行例外或等待 Owner 刷新日期。优先级按用户最新指令、Backlog、实际依赖和可交付切片判断。

## 任务标题与正文

本版活动任务和新任务用 Backlog CLI 维护。标题写清「动词＋对象＋预期结果」，任务编号用于引用。正文用「情况、任务、边界、验收」四节说明玩家遇到的问题、要完成的结果、修改边界和验证方式。已有任务的编号、历史、类型、优先级、状态、依赖和有效验收项继续保留。已完成和归档历史按原记录保留。

## 开始任务

1. 处理 Backlog 时查看适用 CLI 指引。核对最新 `origin/develop`、任务正文/依赖/验收、已认领工作、开放 PR 和文件写入范围；已有切片继续交给原执行者，不因移除 Sprint 重新领取。
2. 新的自主领取前运行下文的切片检查。该只读检查核对第一片范围、验证命令、开发分支和实际远端，也核对任务身份、`To Do` 状态、`config/task-intake.json` 的审批限制和传递依赖。缺失、歧义、循环、非 Done 或有未勾验收项的依赖均会显示阻塞链。`ALLOW` 后按现有流程确认审批、任务和开放 PR，用 Backlog CLI 认领。
3. `In Progress`、`Blocked`、`Done` 及身份不明的任务不新领。需要协助、收尾或复审时协调原执行者和已有 PR，保留其工作树、任务状态与成果。缺少 Backlog CLI 时记录认领/状态同步限制，不手改任务或里程碑文件，也不伪称已认领；用户明确授权的独立工作按已批准边界执行。
4. 按 [认领配置](../config/task-intake.json) 和任务正文核对各自明确的 Owner 批准。已合 PR #491 的离线成果不等于正式职业方向或后续实施获批。其他任务中的具体批准、设计/范围/设备授权和依赖要求也不因移除 Sprint 失效。
5. 从最新基线建立独立工作树，遵守 Backlog、独立评审、精确 HEAD 的 Required CI、分支保护和正常合并流程。`npm run verify:backlog` 继续检查负责人、优先级、任务/里程碑身份和范围；源码通过不代替同候选官方导入、ready、设备或发布验收。

## Fork-First 开发

| 工作类型 | 开发位置 |
| --- | --- |
| `feature/*`（含 `feat/*`）、`refactor/*`、`experiment/*`、`spike/*` | 必须从 Fork 开发 |
| `fix/*`、`test/*`、`perf/*`、`docs/*` 及其他日常工作 | 默认从 Fork 开发 |
| 紧急 Release Hotfix | 走现有[发布通道](PUBLISHING.md) |
| 正式 PR、Merge Queue 和发布 | 主仓 |

从最新 `origin/develop` 建独立短分支。按[三仓库分流](CI.md#三仓库按需验证)核对并配置远端。切片检查默认选择 Fork A，`--remote fork-b` 可选择 B。持有明确特殊原因的非强制 Fork 工作可以用 `--remote origin --main-reason "<具体原因>"`。把检查输出的 `Fork-First-Exception` 写入既有任务和正式 PR，交给现有独立评审核实。

```sh
branch=feature/card-upgrade
remote=fork-a
git fetch origin refs/heads/develop:refs/remotes/origin/develop
node scripts/check-pr-slice.mjs --start TASK-编号 --branch "$branch" --remote "$remote" --slice "行为范围" --verify "定向命令"
```

把检查回显的完整 `Develop base` 用于创建工作树，并将该分支的默认推送远端设为检查通过的远端。

```sh
base='<检查回显的完整 Develop 基线 SHA>'
git worktree add -b "$branch" ../feature-card-upgrade "$base"
git -C ../feature-card-upgrade config "branch.$branch.pushRemote" "$remote"
# 完成需要保存的开发提交后
git -C ../feature-card-upgrade push "$remote" "HEAD:refs/heads/$branch"
```

开发提交、实验和迭代验证留在 Fork。用 [Fork 预检](CI-PREFLIGHT.md)按风险选择已有测试，记录任务、Fork 仓库及分支、完整 HEAD/BASE、定向结果、适用的 run/attempt 和接续人。同一证据以原记录复用。

成熟候选通过必要验证后，重读主仓 `develop` 和来源 Fork ref。用所测完整 SHA 设置 `base` 和 `head`，核对它们与远端一致，并用 `git merge-base --is-ancestor "$base" "$head"` 验证来源历史。HEAD 或 BASE 移动时先更新候选并重核受影响范围。用 `git push origin "$head:refs/heads/$branch"` 同步已核对的完整候选 SHA，建立同仓 `develop` PR，注明 Fork 来源、验证和已有任务。后续采用现有独立 Review、Required Checks、Merge Queue 与 squash。正式 PR 的修正先回 Fork 验证，成熟后同步新 SHA。

## 小批量集成

开始编码前，在原任务记录当前目标分支、第一片的行为边界、独立验收命令和后续依赖。能独立上线的修复直接合入。跨片改动先加兼容接口，保留旧调用并迁移一个调用方；依赖片按顺序逐个进入 develop，最后删除旧接口和临时开关。新功能默认关闭，关闭路径不得提前加载模块、分配资源或改写状态；同一候选配置分别验证开、关的构建、启动、容量和状态，并登记开关负责人及删除条件。Release 仅接需要发版的独立修复。

按 [分支生命周期](BRANCH_LIFECYCLE.md) 的交付吞吐和积压情况调整在制切片。遇到具体阻塞，在原 PR 或任务记录固定 SHA、原因、接续人和恢复条件后方可切换，避免在多个活跃分支重复改同一文件。Stacked PR 只在前片可先合入、下片明确标记依赖且不重复审查时使用。

`develop` 和 `release/*` 的单个 PR 统一按生产文件增删合计检查，日常建议 200–400 行，原则上最多 400 行、10 个文件。更小且可独立交付的切片尽快合入。提 PR 前运行 `node scripts/check-pr-slice.mjs <目标SHA> HEAD [PR正文文件]`。统计范围沿用 src、scripts、tools、experiments、config、data、schemas、工作流和包清单。生产文件改名或移动也要计入，审查时核实移动后的实际用途。真实测试、fixture、snapshot、验证日志和证据不占生产配额。必要测试随相关改动在同一 PR 审查，保留原有断言和证据。大日志、录像和运行工件优先用可追溯附件或工件链接保存完整原件，记录 SHA-256 和可取得期限。

生产改动超限或包含生产二进制时，默认拆成可独立验证和合入的切片。机械变更、跨模块变更等确实不可合理拆分时，在 PR 正文用 `Slice-exception: atomic|mechanical|generated|tests` 选择一个类型，随后用 ` | ` 依次填写客观原因和复现命令或证据链接。独立审查核实原因与验证证据后才可放行。

## PR 生命周期

1. 按 Fork-First 流程完成一个可合并切片及所需验证，再同步候选并提主仓 PR。发起时应已取得该切片需要的明确审批、依赖已实际落地、改动范围稳定且有可审查的源码与验证证据。
2. 正常 PR 用于独立评审、GitHub 必要检查和合并准入，不要求创建前已有该 PR 的 Hosted CI 或独立审查结论。官方/设备验收按切片及既有交付合同判断，不能把尚未验收的产品要求记作完成，也不把正式 RC 专属证据扩为所有普通 PR 的前置。
3. 任务占位、HOLD、未批准的方向、依赖未落地的实施与长期探索在 Backlog 记录原因、下一步、分支及精确来源。分支可推远端保全；默认不创建 Draft。Owner 明确要求提前协作评审时可建 Draft。
4. 指向冻结旧 Release 的 PR 按 [2.0 重建交接](versions/V2-RELEASE-HANDOFF.md) 转 Draft、加标签并评论留痕。其他既有不成熟 PR 先将接续信息写回原任务，再关闭 PR，保留有独立工作的分支、提交及必要备份。关闭不代表合并、任务完成或放弃源码；条件满足后沿既有成果继续，核对基线、去重并重新检查，再重开或提正常 PR。不得为减少 PR 数量合入未批准或未验证的改动。
5. 按目标分支的既有独立复审、精确 HEAD/BASE、Required CI 和原生合并流程异步交接。本次 PR 引入的已确认缺陷或相关回归测试失败必须修复后才能合入。无关的历史缺陷可继续按原任务追踪。代码类任务只有实际合入正确目标分支并完成对应验收才可标记完成。合后按[分支生命周期](BRANCH_LIFECYCLE.md)核对并清理主仓和 Fork 的临时 ref。未完成工作在原 Backlog 记录准确 SHA、接续人、阻塞和下一步。
`task:pick` 对标记 `待验` / `delivery-verify` 或 AC 已全勾的任务返回 HOLD：先核对既有交付，只做明确的验收或状态收口，不重新实现。新 idea 与旧方案冲突时，在 PR 显式声明 `TASK-旧=superseded:TASK-新`；先迁移仍有效的依赖/验收，再归档旧入口。仅“时间较旧”不能证明方案已失效。重启实现须先查实际主线、旧成果及具体缺口，再通过 CLI 更新任务范围/AC并移除待验标签。

状态表示任务的整体进展：`To Do` 仅用于尚未着手；已有实施、研究、测量或待验收工作的任务保持 `In Progress`；明确的审批、依赖或能力阻塞用 `Blocked`。`待验` 是进行中阶段，不是退回待办的理由；没有执行者正占用窗口也不等于未开始。AC 未全过继续保留未勾，不为清理看板虚报 Done。

## 里程碑与历史

M7/m-7 已作为历史工程专项归档；当前活动里程碑只有 M8/m-8（产品体验与核心特色）与 M9/m-9（内容建设与扩充）。编号与历史 AC 均保留，里程碑不作为 `task:pick` 的日期/顺序闸门，旧工程任务可无当前里程碑追踪。

近期版本发布仍按当前候选的产品、官方与设备门禁独立验收；M9 中 TASK-97 显式依赖 TASK-105 的容量 GO，未取得 GO 不得批量生产，不阻塞 TASK-85 单角色隔离试验。

历史 m-5 余项保留原 milestone、owner、状态、依赖、AC 和成果；合法 `To Do` 任务不会仅因 m-5 或其他 milestone 名称被 `task:pick` 判为 HOLD。旧 m-5→M8 接续表仍保存在 [Sprint 历史记录](SPRINT_EXECUTION.md#历史-m-5-余项的接续)，用于追溯工作分类，不再要求刷新为 M8 窗口。原任务的具体审批和验收要求照常。

[旧 Sprint 说明](SPRINT_EXECUTION.md)、Backlog 文档中的旧 Sprint 说明、既有计划中的周日期、阶段顺序和例外名单均只作历史，不再作为认领依据。具体授权、禁止重复认领、已完成成果、未完成 AC、原 PR/Tag/发布记录及其他独立质量要求不变；取消 Sprint 不表示它们已经通过。
