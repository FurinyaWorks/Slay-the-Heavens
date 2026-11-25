# 工程变更记录（内部，不进入玩家更新文案）

供人工填写官方更新日志的玩家文案保留在 [CHANGELOG.md](../../CHANGELOG.md)；游戏内不再维护自研公告。这里记录玩家无须了解但开发者需要追溯的 CI、重构、测试、协作及美术实验。**本文件不等于实际平台发布证明**。版本与每段源码提交的可点击 Git Diff 见 [版本一览](README.md)。

## v2.1.1 平台发布确认（2026-11-25）

- Owner 确认千星奇域平台版本 `2.02` 已于 2026-11-25 上线并封板，对应工程 SemVer `2.1.1` 和 GitHub 注释 Tag `v2.1.1`。千星平台只支持两段版本号。正式上传包的源码为 `06c2577ecc6c07593c6bf8b6e79e158dac5b6195`，源码树为 `d3bb8794ee95f97142c986a11aa9f439b5d73984`。已核对 `package.json`、锁文件与 Release Please manifest。[GitHub Release](https://github.com/FurinyaWorks/Slay-the-Heavens/releases/tag/v2.1.1) · [生产收口 PR #961](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/961)
- Owner 提供的正式 GIL 与远端 Git LFS 归档逐字一致，文件为 23,780,838 字节，SHA-256 为 `afe80c0783d0d4b6046c1f44cba3ef2b71cb8bb34fbc7404d939d12e0f5ff831`。内嵌 buildId 为 `29f48ea1-fa9d-4f76-b124-2bffc83f7594`，与归档构建回执摘要一致。[GIL 和构建回执存档](https://github.com/FurinyaWorks/Slay-the-Heavens/tree/3f79269e90a8f2507f6782135563ecf573b357d7/docs/evidence/v2.1.1-2026-11-25)
- 工程记录保留粒子同值写入与隐藏战斗页去重、正式配置性能回归和构建审计。确切源码的 Hosted Performance 已通过。官方发布回执、作品 ID、精确上线时间和同包设备验收待补录。玩家更新文案见 [CHANGELOG](../../CHANGELOG.md#v211-2026-11-25)，旧版与 Beta 的对照体验及后续验收见 [TASK-4.21](../backlog-details/TASK-4.21.md#2026-11-25-玩家反馈)。[战斗优化 #956](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/956) · [正式配置回归 #959](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/959) · [Hosted Performance](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/45544260623)

## v0.11.0 候选（自 v0.10.1 起；2026-10-28）

- **玩法与内容**：四职业卡组与跨章节接线整合（[#238](https://github.com/CHNISam/Slay-the-Abyss/pull/238)）；补齐第三幕敌人（[#252](https://github.com/CHNISam/Slay-the-Abyss/pull/252)）、事件/历史资格（[#259](https://github.com/CHNISam/Slay-the-Abyss/pull/259)）；接入隐藏第四幕、盾矛与心脏、真结局（[#262](https://github.com/CHNISam/Slay-the-Abyss/pull/262)）；蜥蜴尾巴和黑星（[#266](https://github.com/CHNISam/Slay-the-Abyss/pull/266)）；商店/宝箱/营地交互（[#260](https://github.com/CHNISam/Slay-the-Abyss/pull/260)）。
- **UI 与美术研发**：历史来源透明说明（[#258](https://github.com/CHNISam/Slay-the-Abyss/pull/258)，仅属于旧公告面板，随本轮面板移除，不搬到新页面）；岩旅行者原生样卡的*受控试制*（[#261](https://github.com/CHNISam/Slay-the-Abyss/pull/261)）。受控样卡不代表已在玩家默认卡池正式启用，因此不写入玩家更新文案。
- **工程质量**：持续集成分片与 Windows/POSIX 负载优化、精确来源的成功作业复用及冻结合同修复（[#269](https://github.com/CHNISam/Slay-the-Abyss/pull/269)、[#270](https://github.com/CHNISam/Slay-the-Abyss/pull/270)、[#271](https://github.com/CHNISam/Slay-the-Abyss/pull/271)、[#272](https://github.com/CHNISam/Slay-the-Abyss/pull/272)、[#273](https://github.com/CHNISam/Slay-the-Abyss/pull/273)、[#274](https://github.com/CHNISam/Slay-the-Abyss/pull/274)、[#275](https://github.com/CHNISam/Slay-the-Abyss/pull/275)）；架构与受影响测试修复（[#254](https://github.com/CHNISam/Slay-the-Abyss/pull/254)）。这些优化仅改变开发和测试过程，不写进玩家更新文案。
- **当前收口**：按用户2026-10-28决定删除游戏内公告入口、弹窗、历史分页和专用输入/测试；菜单只打包当前版本号。保留版本一致性、CHANGELOG hash、候选来源及真实 publication 校验，不新增公告系统、后台或自动同步。决定及四点理由见[版本索引](README.md#2026-10-28-产品决定统一使用官方更新日志)。
- **证据边界**：第三/隐藏第四幕与真结局仍通过 `platform.campaign=true` 显式开启，并要求 `experimental=true`；未证明默认玩家入口已启用，完整自然四幕实机验收尚缺。本区间的代码合入不等于自然四幕通关、完整实机验证或千星奇域正式发布。版本冻结前必须核对最终 `develop` 版本差异、必要质量检查、候选交付及验收，再创建不可移动的 `v0.11.0` 注释 Tag；未冻结前此节只是候选范围。[实时比较](https://github.com/CHNISam/Slay-the-Abyss/compare/v0.10.1...develop)。

## 早期内部变更的保留位置

- **v0.10.0**：手动 Release Please 版本提案、版本信息构建和游戏内历史公告接线（[#242](https://github.com/CHNISam/Slay-the-Abyss/pull/242)）。当时的玩家文案仅表达历史公告入口，不构成当前仍保留该入口的承诺。
- **v0.9.0**：UI/架构依赖整理和 CI 调整；属于内部工程信息，已从玩家更新文案移出。
- **v0.8.1**：开发协作及任务边界修正；属于内部工程信息，已从玩家更新文案移出。
- **其余历史版本**：每个版本均在 [版本一览](README.md) 中保留固定 Tag、准确源码提交和相邻版本的 Git Compare；不复制完整 Git 日志，也不按每次提交人为增加版本。

## 后续维护口径

1. 功能合并到 `develop` 时，保留 Conventional Commits / PR / 任务与测试证据；**不因合并次数或 CI 次数自动升级版本**。
2. 准备一个可交付的源码批次时，先核对上一个 Tag 到候选提交的差异，选择 MINOR（实质新增）或 PATCH（仅修复），同步 `package.json`、lockfile、manifest 和玩家更新文案，工程信息保留在本文件及 Git/PR。
3. Release Please 是**人工审阅的提案**，非未经审阅直接对外发布。特别注意 `fix(ci)`、`fix(engineering)`、`feat(release)`：其 Conventional Commit 类型可能让技术内容进入自动草稿，审阅时必须移除；纯 `refactor` 默认隐藏。涉及玩家可见性能或体验才允许进入玩家更新文案。
4. 实际源码验收和平台发布是两道独立关口。确认目标提交、构建/实机验收和交付产物后才打不可移动注释 Tag；官方发布成功且有凭证时，才登记 `data/release/publications.json`，不拿 Tag 冒充作品已发布。
