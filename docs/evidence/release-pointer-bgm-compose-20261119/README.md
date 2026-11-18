# Release 指针与致命错误停乐：独立来源合成

`Change-Type: bugfix,release-engineering` / `Target-Version: 2.0.0`

本轮只解决两个既有 Release 修复不能直接组合的四处真实来源冲突，不新增交互、怪物或技能。远端原候选不改写。

## 固定身份与范围

- Release：`1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`
- 指针：[`90ee3942`](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/90ee3942272272a042c6120f524be5d7df839a36)
- 致命停乐：[`3c8e7f13`](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/3c8e7f133c05ba90b37cb4086adc641ce443bdae)
- 外层合成见证：`tests/helpers/release-pointer-bgm-ci.json.gz`，SHA-256 `0c9825cfe9fa600dc703de2a109dc746ef893d9a0a757106113640c7d870426a`
- 独审绑定的全部新源码 Git blob 见 [independent-review.md](independent-review.md)。本轮源码在运行测试前固定，之后只补齐原始 checkout 输入、记录证据与 Backlog。

以固定 Release 为显式 merge base 的只读合成，复现 `closeout-source-epoch`、`copy-integration-source-closure`、`release-potion-enemy-source`、`integrated-ci-source.cases` 四冲突。应用 BGM 原 delta 也得到同样冲突；两条原始失败记录均保留。

产品源码原样并集：指针 9 个路径 + 停乐 `abyss_ui.lua`。完整生产域 352 文件、历史目标 86、owner 129（`abyss_ui.lua` 早已是既有 owner，不虚增）。指针、overlay 与 BGM 的六份旧档完全不改；新增外层见证只把真实合成 CI 输入映射到两个固定原分支文本，不把旧 after hash 改成合成 hash。两个新 fixture 均不隐藏。copy 函数仍实读当前源，不拿保存的历史文本冒充当前来源。

## 本轮实际验证

| 范围 | 命令/结果 | 记录 |
| --- | --- | --- |
| 新外层正负控 | `node --test --test-name-pattern='composed pointer\|composed live' tests/integrated-ci-source.cases.mjs`，2/2 | `composition-second.log.gz` |
| 完整来源合同 | `node --test tests/integrated-ci-source.cases.mjs`，27/27，无跳过 | `integrated-all.log.gz` |
| 校准/原始发现与执行保护 | `node --test tests/ci-complete-calibration.test.mjs`，81/81，无跳过；只验证规划和合同，不是 Hosted Full | `calibration.log.gz` |
| 指针 + native/BGM + 联合来源 | 三文件顺序运行共 23 项：22 通过、1 项 official 角标因输入缺失失败。指针13、native3及联合来源6均通过 | `behavior-second.log.gz` |
| official 角标恢复 | 未改源码，补齐原始输入后仅复跑失败用例，1/1 | `official-corners-fourth.log.gz` |
| 最终实际当前来源 | `assertIntegratedCurrent()` PASS | `current-final.log.gz` |
| 静态门禁 | syntax、test-strength（M1–M4 killed）、guidance、Backlog、data 均通过 | `gates-first.log.gz` |
| Quality | 初次缺固定工具；按配置 SHA 验证已有官方 Luacheck 后复跑：351 模块、6223/6223测量通过 | `quality-second.log.gz` |
| 独立复审 | PASS，真源读取、双父视图及恢复后负控 | `independent-review.md` |

Fresh `build:data`、`build:ui`、`map-ui-layout` 已成功。没有重复 Full，没有改 CI 时间上限、配置或假填 timings。原分支自带的历史证据目录保持原样，不能冒充本轮结果。

## 保留的失败与恢复

- `current-first`：稀疏 checkout 缺 `.github/workflows/licenses.yml`；补齐原 `.github/tools` 后通过。
- `composition-first`：从聚合 preview test 启动时缺原 `experiments/menu-red-fit/compose.mjs`；转用本次实际来源 cases 文件运行，不删测试或断言。
- `behavior-first-interruption`：旧执行会话不可续接且日志为空，未声称执行完成；从同一树续跑未完成的三文件验证。
- `behavior-second`：official 角标缺原 portrait license；补齐 art 后 `source-targeted-second` 仍缺原 experiment budget；补齐 experiments 后 `official-corners-third` 因 LFS 图片仍是 pointer 失败。
- 两张 selection budget 源图只在匹配 Git LFS 的 oid、size 及配置 SHA 后从已有本地副本物化：avatar `d96f7f81c436971a5d7aa78740b580a7bb237d5ac2962e51f5532dbb51f9eb80`（17710 bytes），battle `93b4d73290c3a20da7b02f02b05786b57fd5d381da71b02b5839a8c6a344f80b`（18329 bytes）。随后 official 用例真实通过。
- `gates-first` 各子检查单独按日志判断，不能以最后命令的总退出码掩盖第一次 Quality 缺工具。Luacheck SHA 为 `d68da17fca0697d9e2fb04201f3884abd259fa558b3a449bccaed47f1390defc`。

上述输入物化不改变 Git 中 LFS 指针，也不纳入提交。日志 gzip 的解压长度与 SHA-256 见 `logs.json`。

## 仍未验与交接

本分支只保全候选，不创建 PR，不启用合并，不修改原分支。Draft/非 Draft 规则冲突仍交由协调者解决；`gh` 未认证，不绕认证执行准入。Hosted Quality/Full、官方导入、同候选 ready、PC/手机与容量均不能由这份离线结果替代。TASK-30 原状态、AC 和历史证据不变。
