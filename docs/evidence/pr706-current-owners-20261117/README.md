# PR #706 当前 owner 合同修复（准备分支）

绑定原 PR HEAD `dc74ab236c3df11a3e4cc394356c9b6e53e1b0ae`，Release BASE `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。原评论 6927986512 的四个托管红片指向同一根因：两份 current 合同还要求116，实际完整生产并集117，唯一合法新增 `abyss_monster_intent_particle_view.lua`。本轮本地原始两项均复现失败。

仅修正两份当前合同精确 owner 清单与计数，保留105/104历史、完整生产352、所有旧owner及原缺失/漂移/LF-CRLF/顺序/foreign负控。没有修改生产、预算、时限、测试库存、workflow或怪物设计。

两份完整 before/current 原文与hash独立归档；旧release-runtime join JSON逐字保留；所有旧gzip保持不变。当前总入口先无条件认证两个当前文件及packet，再允许历史投影。独审发现双份同时回退旧116的漏洞，已修复并重新验证。新增两个raw-pinned JSON用两条精确Git attributes固定LF；真实core.autocrlf=true检出字节相同，不放宽CRLF漂移拒绝。

## 实际验证
- 初始 current 两项 RED；最小修复两项 GREEN 2/2，28.00秒。
- 最终 focused：旧production104/current117两域、逐117 owner双EOL缺失漂移/顺序/foreign，以及joint CI/库存，共5/5，30.33秒。
- 独立补旧UI104合同1/1，12.29秒。
- 顶层 assertIntegratedCurrent PASS；语法与diff检查PASS。
- 较广原两完整文件加joint文件尝试：两个文件各在默认2GiB Node堆上OOM，其余joint4项PASS。保留失败，不宣称完整两文件或Full已通过；本轮没有重跑Full或改变堆/原超时设置。
- 独立评审发现并修正双回退认证及Windows原字节风险；收据见REVIEW.md。

所有日志gzip保留原始字节SHA/长度（manifest.json）。Backlog CLI当前环境不存在，未手改任务、未伪认领或标Done；沿现有PR/TASK-100与TASK-4.21协助修复。

这只是准备分支，原PR头不移动，不启动第二套正式CI。需原负责人接续并由精确HEAD原门禁验收；Hosted、官方导入/ready、手机/PC、容量与性能体验均不由这些来源测试认证。
