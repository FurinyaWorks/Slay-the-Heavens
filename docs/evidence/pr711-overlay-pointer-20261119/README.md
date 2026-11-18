# #711 战斗覆盖层触摸接续修复（离线，不是发版验收）

来源：[PR #711 独立复审评论](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/711#issuecomment-6986906187)。

工作基线：恢复分支 `5a86c6c2a3784d28fa819ab7487dd58cc7a778b1` / tree `25e627940ad33a177f0bbd9e939bacc04643a94d`；它接续 Release `1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`。候选与逐路径 Git blob、SHA256 在 `identities.txt`。原恢复树及其两份 pointer-identity 历史档案未改，PC35 Back 的 `dependencies.notice("")` 保留。

本轮测试的本地 commit 是 `d32bcca464f12271c7a8a48a6d2bc42d5c0bec3e`。GitHub source commit [`38e04538`](https://github.com/FurinyaWorks/Slay-the-Heavens/commit/38e0453848111ec372c61335b2dadc3d7e4fc552) 的 tree 与本地候选完全相同（`a6c2182f59e28429485efbf5ee46adecb1305f2e`），parent 是已存在的恢复分支头 5a86，11 个变更 blob 逐个相同；远端对象未把本地中间提交重写成远端历史。后续证据提交不变更运行或校准源码。

## 修复边界

- 只有 `setActive` 的状态真的改变才清理 card/action/potion/enemy 指针；在原生可见性或提示写入之前清理，并在药水瞄准取消前保留拖尾来源。暂停的同场战斗保留原有 MonsterSurface；可见状态内重复刷新不清理正常手势。
- 进入覆盖清理失去终止回调的旧触摸；恢复也清理在隐藏期间到达而无 Up/EndDrag 的 Down。敌人输入按槽键而非连续数组遍历；早位敌人退场后后位控件可保留。
- 现有目标上下文夹具 6→11 组，不增加发现条目、不增加 30s 超时。新覆盖包括同目标新 ID、跨控件新/同数字 ID、隐藏期间 Down、移动药水取消并保留旧 Click 防护、稀疏敌人槽/同容器复用。

## 可重放证据

运行目录为候选工作树，复用已安装的 Node/Fengari（记录 Node 24.22.1）；LFS 实体只在匹配仓库指针 OID 时补齐。初始构建 `npm run build:data && npm run build:ui` 见 `build.log`。

- `red.log.gz`：5a86 产品源码＋追加覆盖回归，原有六组均通过后在缺失旧终止的目标用例失败。正常离线生产入口：`node --test --test-name-pattern=target_anonymous_context tests/mobile-card-release.test.mjs`。
- `hide-only-negative.log.gz`：只在失活时清理的反例；初始目标及两种跨控件 ID 轨迹通过，隐藏期间 Down 轨迹失败。进入和退出都清理后这组和移动药水回归通过（`green-runtime.log`）。
- `sparse-negative.log.gz`：初版仅沿用连续数组清理，十组通过后后位控件失败；最终源码全部 11 组通过（`sparse-green.log`，24.276s，未改变原预算）。
- `final-overlay-lua.log`：正式 Lua overlay safety/retention 入口均通过，10 次开关创建/销毁 0/0。
- `engineering.log`：语法、质量、架构、Luacheck 通过。日志引用 e2d 精确检查点；后续 d32 仅修正测试断言/测试见证，产品源码未变，其改动的两个 JS 文件分别通过 `node --check`。
- `egg-final.log` 与 `egg-exact-base.log`：早期 broad batch 32/33 唯一失败是 Host egg 7–11 的源码身份保护：快照为手势模块旧哈希 f0987e3e，实际工作树在该运行中写为 dfdf7706，故不是业务断言失败。分别在隔离的最终产品源码和未经修改的 5a86 上复跑均通过，两边各自真实/历史 trace 字节量相同（encoded 1,677,109 / decoded 22,133,503）。前期 broad 日志完整保留；其后在最终产品＋回归字节上的 mobile 13/13、药水 drag 9 组及 controller/slice 均通过。
- `source-targeted.log`：新候选 4/4，包含完整当前产品语料、helper copy closure、旧药水历史、每次重读验证者对新产品所有者/压缩见证/夹具篡改的拒绝。两份新 gzip 包精确绑定此前/当前源码；`generate-source-witnesses.py` 是从 Git 对象和候选字节重建新包的工具，不改旧包。
- `final-complete-source.log`：`node --test --test-concurrency=1 tests/integrated-ci-source.cases.mjs tests/release-card-contact-integration.test.mjs`，精确 d32 源码树，32/32 PASS，0 FAIL / 0 SKIP / 0 CANCEL，488516.066ms，exit 0。此为本轮重跑，不沿用旧候选报告。此前 e2d 的未完成尝试保留为 `complete-source.log`，已因独审发现旧计数断言而取消。

独立复审范围、探针和路径身份见 `independent-review-d32.md` 及 `independent-review.json`；完整候选验证与新的源码范围均以本目录新日志为准，不以旧候选 32/32 代替。

## 恢复

`overlay-pointer.bundle` 的依赖是精确恢复基线 5a86，包含候选全部本地提交；`git bundle verify` 见日志。也可在精确 5a86 工作树先解压 `overlay-pointer.patch.gz`，再用 `git apply --check overlay-pointer.patch`（已实际验证）再应用二进制补丁。独立源码探针绑定本地候选 Git 对象，运行前从 bundle 提取并在独立工作树检出该源码提交；证据提交本身不是该源码快照。

在发布证据的仓库根目录执行（须已有恢复基线 5a86 的 Git 对象，且新工作树路径未被占用）。探针要求的 HEAD 是 bundle 内的 **本地 d32**，不是远端同树源码 SHA 或包含本证据的分支 HEAD。

```sh
evidence="$(pwd)/docs/evidence/pr711-overlay-pointer-20261119"
git fetch "$evidence/overlay-pointer.bundle" refs/heads/fix/release-pointer-overlay-cancel-20261119
git worktree add --detach ../pr711-overlay-reviewed d32bcca464f12271c7a8a48a6d2bc42d5c0bec3e
cd ../pr711-overlay-reviewed
# 准备锁文件依赖和原始 LFS 对象后运行：
npm run build:data && npm run build:ui
node "$evidence/independent-source-probe.mjs"
node scripts/test-lua.mjs "$evidence/independent-pointer-probe.lua"
```

结果路径的期望身份见 `identities.txt`；文件校验见 `restoration-sha256.txt`。日志仅将执行工作树路径前缀替换为 `<checkout>`、归一化行尾，保留断言、计时、状态及内容哈希。

未执行 Full、不轮询 CI、未打开 GUI。Hosted Required CI、官方导入、ready、实体手机/PC 和官方容量未验；未申请合并、未发版；本任务分支仅保全候选与离线证据。未更改 Backlog owner/status/AC（当前环境无 Backlog CLI）。
