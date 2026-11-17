# TASK-111 本轮证据

完整叙述见 [容量归因报告](../../research/2026-11-16-release-capacity-forensics.md)。**所有样本都来自公开工具 fixture，不是 Owner 的游戏基底，不是 RC；官方/设备 UNVERIFIED。**

## 身份和数据

- `identities.json`：C0、序列化/组合实验、最终 C4 的独立 source/build/payload/GIL 身份；不把 C3 当 C4。
- `inventory.json`：C0/C4 的真实 GIL section、366 模块、页面、模板、39 卡面、引用资源排名。子树会重叠，不能相加。
- `role-art-breakdown.json`：四角色独立 75 卡数组、低成本遗物/敌人注册的源码投影；不作为官方存储估算。
- `component-probes.json`：同 C0 加隐藏 UI/未挂载纯数据的四个单因素及组合；是边际编码成本，不是删减收益。
- `same-source-experiments.json`：同 C0 的 UTF8/旧选角单因素及组合。只有旧选角的 128,379 字节属于本 PR；序列化留给 #691。
- `delivery-comparison.json`：最终 C4 对 C0，UI 原生字节完全相同，364 个 Lua 模块完全相同；构建标记、肖像和重编译图差异明确列出。
- `strict-audit-status.json`：C0/C4 相同三项严格失败、每次完整模块读回及 423 warnings；不是 PASS 收据。
- `validation.json`、`logs/`：回归、原始失败、修复后的验证与未完成边界。
- `manifest.json`：本目录可复核文件的 SHA256/字节。manifest 不包含自身，独立 review 收据另行绑定 HEAD/BASE。

## 可复现入口

先使用仓库 Node24/npm 环境，按 TOOLCHAIN 读取 Miliastra workflow/platform-rules。只使用离线编码/读回，不调用任何 playtest 或用户窗口工具。

工具源为 `FurinyaWorks/genshin-miliastra-mcp@59c576e41632a6bf6781bbca83a676d0da0374ec`；按其 package-lock 安装并执行 `npm run build:core`。设置 `MILIASTRA_MCP_ROOT` 指向该检出。模板/UI encoder SHA 必须与 identities.json 对应，不能以不同工具的结果替代本次测量。

从同基底重建时使用正式入口（每次使用新的输出目录）：

```sh
MILIASTRA_ALLOW_LIVE_WRITE=0 node scripts/build-native-candidate.mjs <diagnostic-base.gil> <new-output> --official-assets
```

离线取证脚本均复用正式 wire、encoder、native-script-batch 和原生 checker，不提供 MB 换算。以下从仓库根目录执行，输出必须是新文件/新目录：

```sh
node docs/evidence/task111-capacity-20261116/inspect-gil.mjs <candidate.json> <new-inventory.json>
node docs/evidence/task111-capacity-20261116/component-probes.mjs <C0-candidate.json> <new-probe-directory>
node docs/evidence/task111-capacity-20261116/same-source.mjs <C0-candidate.json> <new-experiment-directory>
```

接续者取得本轮云端保全的样本后，可设置 `CAPACITY_CANDIDATE_FILE` 指向对应 GIL；脚本仍强制核对原始 receipt 的 candidate SHA，不修改收据。`inspect-gil` 需要收据旁的 `generated/game-ui.json` 和 `game-ui-templates.json`，本轮 work/ 原始构建目录均包含。保存样本原 worktree 路径是历史 locator，不等于本机正式存档路径。压缩包大小只是传输量。

原始实验在 work/ 下执行，本文保留等价的可移植入口（只重定位 imports/输入路径并增加禁止覆盖/hash 检查）。实验没有在用户客户端执行。原始构建/读回收据与 GIL 仅在本轮云端 work/ 及保全包中保留，**未作为公开 Git 仓库文件或下载附件交付**；可复核数据、hash、日志和脚本随 PR 交付。清理此云端工作区前，须保全这些原始诊断样本；不得把它们替换成别的构建。

## 验证状态

最终定向命令：

```sh
node --test tests/platform-load.test.mjs tests/platform-load-wiring.test.mjs tests/official-portraits-build.test.mjs tests/v25-portrait-profile.test.mjs tests/lumine-idle.test.mjs tests/official-assets.test.mjs tests/integration-source-epoch.test.mjs tests/sts-style-source-epoch.test.mjs tests/ci-complete-calibration.test.mjs
```

193/193 通过，0 fail/cancelled/skipped。CI 来源延续包含五份完整 before/current：肖像生成器、platform-load 及三份受改测试；旧 archive/hash/targets、额外换行/畸变/缺失源码负例、工作流与预算均保留。测试 discovery 清单未新增文件。生产 sourceEpoch 与 helper-copy 闭包未扩大。

check:engineering 的 Luacheck/质量、四个变异负控及 native UI 合同通过；初次 Full 的缺工具失败和后续精确重跑分别保存。本地 Full 因范围/来源变化而中止，不作为最终 HEAD 的 Full PASS。托管 Required/Full、正式 RC、官方容量/导入/ready、真实设备均未认证。

最终 C4 `verify:platform-load` 的预期结果为 UNVERIFIED/非零：缺 Frozen RC provenance 和官方证据；不是把缺测改成通过。严格审计三项失败单列保留，不能混同于原生静态 checker 的通过。
