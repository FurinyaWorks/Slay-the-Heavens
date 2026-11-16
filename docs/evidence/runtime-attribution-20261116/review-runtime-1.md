# Runtime attribution 独立初审 1（冻结快照）

- Review ID: `runtime-attribution-independent-1-20261116`
- 独立审查身份: Codex sub-agent `/root/review_runtime`，由主协调 `/root` 委派；未实施生产代码、测试或测量机制，仅写本报告。
- 工作树: `/workspace/work/runtime-attribution`
- 分支: `perf/runtime-attribution-v2-1116`
- reviewedBaseSha / 当前 HEAD: `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`
- reviewedHeadSha: **未提交工作区，无最终 SHA**。下表 hash 绑定本次已读快照，不能作为后续修复或最终 commit 的通过记录。
- 结论: **request changes**，Critical 0，Important 3。主协调已接受两项源码问题并确认第三项现有测量失败；修复与最终复审待续。

## 方法与边界

只读审查 `work/plan.md`、目标 diff、生产模块、相邻生命周期/粒子源、测量 worker 和合同测试、现有日志。按委派要求没有启动 Node、构建、Lua 或重型测试，没有改任务、合并、发版或占用操作窗口。为不扰动主线程采样，本子任务未启动基于 Node 的 Backlog CLI。下述复现路径由源码逐句推导；明确区分已经存在的运行日志与本代理未执行的建议回归。

范围为 native control + source effect 生命周期内去除静态重复发布；不触及 #688 坐标派生、#694 手牌表分配或 #703 容量工作。既有 PNG 和 Backlog 脏文件未修改、未纳入审查结论。

## Important 1：SetImage 返回 false 仍被永久标成配置成功

位置：`src/lua/abyss_monster_intent_particle_view.lua:125-127`（表中快照）。

`picture(icon, texture)` 的返回值被忽略，随后执行 `configured[control]=e`。生产 `abyss_battle_input_state.lua:33-35` 明确返回 `control:SetImage(...)` 的值。首帧 SetImage 返回 false、未设置纹理时，paint 仍完成，后续同 control/effect 跳过 SetImage。基线逐帧重试能在下一帧恢复；新缓存把一次拒绝变为整个粒子剩余寿命的错误图片。

可复现：沿新增 fixture，在首个 icon.SetImage 上返回 false 且不调用原 setter；第二次调用恢复原 setter。首帧应失败并释放输出或至少不提交缓存；当前实现首帧成功、后续没有纹理重试。现有 `false` 测试只拦 SetSizeDelta，不能覆盖此路径。

要求：检查 picture 返回值不为 false 后才提交，并增加实际 SetImage false 路径回归。throw 路径已会被外层 pcall 捕获，不是该问题。

## Important 2：报告校验只比较两侧，接受双方同样欠工作量或同样残留

位置：`scripts/benchmark-battle-runtime.mjs:12-36`；`tests/battle-runtime-contract.test.mjs`。

validate 允许任意非负 frames、空 calls/allocations，未固定各 phase 帧预算、必需子系统调用或 disable 绝对清理状态。validateBattlePair 只比较两侧相等。两侧都少跑、两侧都漏计或都留相同 effects/outputs 时能标为 OFFLINE_HOST_PAIR_VERIFIED。

具体可复现（不需新方案）：现有合同测试的 report() 把 **每个 phase 都设为 frames=300、effects=1、outputs=1，包括 disable**，第一条测试预期 validateBattlePair(a,b) 返回 true。这已经直接展示终态残留与错误工作量被当作合法输入。另将双方所有 rows 的 frames 设为 0、calls 设为 {}，保留合法 histogram/hash，也无断言拒绝；visual 模式同步设 visualFrames=0 仍能通过。

要求：在相等之外约束可信固定工作量、必需调用与终态 effects/outputs=0；对长循环驻留采用明确允许的稳定基准，不能把完整场景静态控件要求为 0。增加双方同时减少工作量/同时残留/同时删必需计数的负对照。现有单侧变异只能证明差异检查，不能证明绝对合同。

从现有 counts-1-after.json 只读观察：cards-3 实际 frames=80，因为真实点击流程还触发内部 update；循环文字的 3*20=60 不能直接当该 phase 的帧预算。其余固定预算由主协调按实际入口确认。

## Important 3：allocation 插桩当前不能解析真实紧邻关键字的 table expression

位置：`scripts/runtime-baseline/battle-worker.mjs:32-36`。

把 `{...}` 直接替为 `ALLOC(site,{...})`，没有保留 Lua token 边界。真实 `abyss_battle_card_view.lua:294` 为 `...and{...}or...`，插桩后成为 `...andALLOC(...,{...})or...`，`and` 被并入标识符，解析在后续 or 失败。同类 `return{...}` 和 table-call sugar 也需要正确转换。

已存在的实际运行证据：`work/logs/paired-r1.log` 在六个 counts pass 后，allocations worker 报 `src/lua/abyss_battle_card_view.lua:294: unexpected symbol near 'or'`，外层断言退出 1。该轮没有成功完成 allocation/visual/final report，因此六个 counts 只能作中间证据。

要求：修复 token 边界与 Lua table-call sugar，再轻量解析完整被插桩模块；保留失败日志，并在最终生产修复后重建最终完整配对报告。本代理没有重跑测量。

## 已核实的正面边界

- configured 为弱 key，值仅 source effect；source effect 没有 native/父控件回指。该缓存本身没有把 native key 通过 value 强保留。
- source 粒子构造时确定 textureKey/width/height；updateEffect 只修改动态坐标、scale、rotation、duration、color。当前真实源路径支持这三个字段的生命周期不变前提。icon 原点 0,0 由本 view 独占发布。
- 每个直接 native 静态 setter 都经 write，在调用前后核对 pool generation、effect ID 对应 control 与 alive；false/throw 触发释放路径。clear/engine teardown 于 setter 内重入会使 valid 失败，停止后续动态写入。
- 新 native instance 是新的弱 key；即使 source effect 保留，release/cover 后重建仍会完整配置。clear/battle replacement 重置 states，engine teardown 禁止后续 paint。
- 动态 scale/rotation/tint/位置/allowed 每帧仍发布，序列、cosmetic RNG、生成时钟、粒子数量与更新逻辑未改。
- 既有 particle-red.log 明确在基线因重复静态写入 9 失败；particle-green.log 显示 publication 与相邻 Host/源粒子共 3 个 Node tests 通过。这是主线程已有证据，不是本代理独立运行结果。
- 核心 Run graph/hash 与逐帧 visual hash 有真实采集实现；一侧 coreHash/visualHash/frames/live/effects/outputs 漂移被比较拒绝，native histogram 总量损坏也被拒绝。此肯定不覆盖双方同时错误（Important 2）。
- 测量模式区分 counts、AST table allocations、visual；表分配只统计声明七模块，内存为 Node/Fengari；报告正确保留 officialSdk/officialPhone=UNVERIFIED。3600 帧仅 60 模拟秒，不是热机/手机长测，不支持官方 FPS 或 GPU 收益结论。

## 已审文件 SHA256

以下 hash 采自本代理读到的初审快照；主协调随后修复时不覆盖本表。

| 文件 | SHA256 |
|---|---|
| AGENTS.md | 6442187830dfa2c92ea9c8375972e3052afcab53db1576e382c9506f69518f6f |
| docs/ENGINEERING.md | f404414457904173e6f0a44c579bae3cb68727ecbd660ee2bc1812235f75bd81 |
| work/plan.md | 76c007993cdc3ebe29d177be75733f8b8c70bbd9ad1963d481e96672a1a151c4 |
| src/lua/abyss_monster_intent_particle_view.lua | 7a84f995c03522f6a5f03cc85e0e0d826582dc07e732aa49fe275aabbf38852e |
| src/lua/abyss_monster_intent_particles.lua | 53bc76d7bd0296944fff253e4d021e2319253acda758c48e8eb673878dc3aa5f |
| src/lua/abyss_monster_power_surfaces.lua | e9e81ea8648f22f3d2b6b2a489f72eda194304cc164a52f8cebbed9859bff15e |
| src/lua/abyss_battle_input_state.lua | f5ca34c51e6599284d574b8053297c429b4f14d7a1951395f5a4decfbb87cd3d |
| src/lua/abyss_battle_card_view.lua | 269d8787ad09f28b6068a3535ba3f3adeda9a13fca776ab2ebd9452f2b17067a |
| src/lua/abyss_component_bridge.lua | 55bd6e0c423a94bc8c9091b32fa44aa08be8101831504b2885d662703a0c192b |
| tests/lua/intent_particle_publication.lua | f8a96d632cc89a6ba994ce793df633dedf09333619131fda85b7fee413b9d5a9 |
| tests/intent-particle-publication.test.mjs | d712552c0433d2a45a8162dfd20aa25c6d9999e4d4c7c3aba350450201c04f9b |
| tests/lua/monster_intent_particle_game_ui.lua | 63d5340c3aa4705e1476ff1fb69b9dbe23f56b88df920d23b623d270bebc3668 |
| scripts/benchmark-battle-runtime.mjs | 75b776463ea645488e380e36d6c76e040218ff5d3905f243daba3771c15c6063 |
| scripts/runtime-baseline/battle.lua | bf4dc4373be478fcdd02eab1d914f814db8c1a4cd5ddc5d56df69a7a91eccd64 |
| scripts/runtime-baseline/battle-worker.mjs | 33237d75d1f00a0b96994db01bfe175b9d084fba7e9f3458918cbe3b2729b7a3 |
| scripts/runtime-baseline/observer.lua | 570c7c1a8494ea06e49dab7e5ddc0eebd3303f30baecba4d716db621b8011f17 |
| scripts/benchmark-runtime-path.mjs | 6eb2e9b6575f908df6fd942e033f072c6258ba4840f7f55424f3efea74a02fd0 |
| tests/battle-runtime-contract.test.mjs | 0672a7163a85ed8219d00973c40353fb15fa177d6ee6f68fa9c1dac6149e4a38 |
| tests/lua/support/game_ui_fixture.lua | a6ee3fa20ff4211d5ae5a4236f0e65bfb68dd7e8880ed3ba3eeb5314daa387f3 |
| work/logs/particle-red.log | f1955eb8876af75a58e30ec6f4f9c6f4f0c570e8d33f74fe5c690546887f6d26 |
| work/logs/particle-green.log | 15abdb50ba9df7ecda3cebc32117dfd104be79fd6568dc524b9d9f44ef894bb8 |
| work/logs/paired-r1.log | 38434217a7d6892fc54dfa6144883dd17a84700dc97e7067003cebe120a24d53 |

最终提交后需针对精确 SHA 再次独立复审；本报告不能直接填 conclusion=pass。
