# PR #679：StS source 回归切片

本补丁基于 `eabff9b0bf2cce17ae05913c0e5d47366d0ff173`，实际 Release 读回为 `af77fb2461c548f0faf104761d107397f75dca08`。仅修复原 `tests/sts-style-source-epoch.test.mjs` 三个共同失败，不创建新 PR，不更新原 owner 分支。

来源：[Quality 43929766894 / Windows job 133728259763](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43929766894/job/133728259763)、[POSIX job 133728259877](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43929766894/job/133728259877)。原错误段见 `hosted-excerpts.json`。

- 原 :28 / :53：StS 测试追加换行已经被完整 post697 owner 拒绝，旧 matcher 只接受 added-inventory。保留 null 和换行故障，精确核对 AssertionError 的首行、层和完整路径；其余路径仍要求原 added-inventory 层。null 继续要求原 TypeError，未更换输入。
- 原 :107 / :125：局部 `readFileSync=integratedRead('sts')` 将历史 noncombat-v25-layout 输入当前 raw 认证，故在 test-affected 之前失败。历史读取仅用于历史断言；当前故障验证用原 fs reader。每个故障 wrapper 只改变选定文件，其他 Buffer 原样透传。
- 原 :199 / :230：原 `Buffer + ''` 意外改变 battle-queue gzip。逐字复用实际 af77 已有 conditional wrapper，同时将七个 post697 拥有的输入按完整层和路径断言；其余输入仍必须到达完整 StS CI 层。没有统一接收任意异常。

只新增 `potion-post697-ci-sts-repair.json.gz`：完整 before 逐字等 eab Git，current 等本补丁测试；LF、SHA256、Git blob 双重校验。原 42 bindings、所有历史 views、108 旧 archives 不变；增加新包后为 109 archives。没有修改生产、数据、workflow、预算、分片或原包。两个本地展开的旧 gzip 按既有 LFS oid/size 核验，只用于测试，不包含在提交中。

## 本轮验证

| 命令 | 结果 |
| --- | --- |
| `node --test tests/sts-style-source-epoch.test.mjs`，精确 eab + 原 LFS 实体 | RED：11 项，8 PASS / 3 FAIL，0 skip，30541.775ms；三个原目标失败，见 `red.log` |
| 同一命令，修复后且无临时注入 | GREEN：11/11，0 skip，48314.307ms，见 `green.log` |
| `node --test --test-name-pattern='post697 union' tests/integrated-ci-source.cases.mjs` | 6/6，0 skip，68615.127ms；全绑定及 archive 暖 missing/null/drift/restore、同 raw reader、双历史、生产 owner，见 `corpus.log` |
| `node docs/evidence/pr679-sts-regression-20261117/audit.mjs` | PASS：42 bindings、108 旧档原 Git 字节、109 archives、raw JS880/Lua1424；zero-injection 的 battle-queue 仍为原 Buffer；test-affected / closeout / StS 三条故障到达精确目标路径，见 `audit.json` |
| `node scripts/check-agent-guidance.mjs` / `node scripts/verify-backlog-roadmap.mjs` / `git diff --check` | PASS |

`raw-logs.json` 保留 RED/GREEN/corpus 原始日志的无损 base64、长度与 SHA256；文本 log 仅移除行尾空白。`path-errors.json` 是修改前、使用单文件条件变异对原 inventory 和当前 StS 验证器逐路径观察的首层错误，不充当正式 GREEN。

独立复审 `/root/review_sts679` PASS，`unresolved=[]`；逐 hash 绑定三个可执行交付文件，独立检查 packet、zero-injection、精确目标路径、两个 gzip Buffer 身份和 diff；没有重复整套 StS/corpus。完整报告身份与范围见 `review.json`。`backlog` CLI 缺失，未手改任务正文/状态；安装既有 lockfile 依赖后 `verify:backlog` 通过。

## 原 owner 接续

将本提交接回原 #679，再由原集成线接续实际 Release。`git merge-tree --write-tree eabff9b0 af77fb24` 有 12 个冲突（见 `integration-conflicts.txt`），涉及多个现有 source lane；本切片没有代替 owner 解决它们，没有把含冲突预览树声称为可执行集成候选。

StS 冲突合并需同时保留 Release 的最新 raw/inventory 接续和本补丁的精确 mutation/reader 修复。新的完整组合须依照其真实最外层 owner 绑定当前源码及新增修复 archive，保留两侧旧 source archives，再对精确组合重验。本文 GREEN 只属于 eab 上的本切片，不能代替 af77 全组合、新 Hosted Required、Full、实际合并或官方/设备验收。没有触发重复 Full、修改 settings、删除或合并。
