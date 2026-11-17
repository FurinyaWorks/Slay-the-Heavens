# #706 默认内存边界诊断：未修复

本轮只协助验证内存阻塞，不接管现有负责人，不改游戏或共享来源认证代码。未修改原执行预算、删改断言、跳过有效测试、建立跨调用缓存、启动 Full、写原 PR/他人分支、合并、发布或操作真机。

## 候选与已存在的证据

远端核对：原 PR #706 HEAD `dc74ab236c3df11a3e4cc394356c9b6e53e1b0ae`；准备分支 `fix/runtime-current-1117` 已从 `32174844e7d679d68bca48e06851aa89f2178c5f` 前进到 `1ee81fae20e725a89764ad3c422ebd1fccea02cb`；实际 Release `af77fb2461c548f0faf104761d107397f75dca08`。结束前再次读取三引用仍相同。本诊断基于准备分支后继，未将当前 Release 合流，也不认证 Release 组合。

`32174844..1ee81fae` 仅新增五份 heap-followup 证据，没有修改两个测试或 helper。已阅读最新候选 AGENTS、CI、TASK_EXECUTION、V2-RELEASE-HANDOFF、原 PR 评论 6933937570 及其原交接。已有具名 5+1、78 正负控未重跑。后继记录的显式 4096 MiB 完整 13/13、15/15 通过，不证明默认约 2 GiB 堆通过；原两完整文件 OOM 记录保持有效。本轮只缩小到一个隔离闭包案例，不再跑两个完整文件。

环境：云 Linux，Node v24.19.0，NODE_OPTIONS 未设置。当前机器默认 heap_size_limit=4496293888 B，故用显式 `--max-old-space-size=2048` 重现原边界，没有使用更大的默认值或后继的 4096 MiB。本环境不是 Hosted 固定 Node v24.18.0，所有时长只作为本地诊断。

Backlog CLI 不存在，overview 调用返回 command not found；按 TASK_EXECUTION 的缺 CLI 规则，仅在明确授权边界协助，不改状态、不重新认领。

## 最小可复现路径

在该精确候选的独立 worktree、恢复两份 helper LFS 原字节后运行：

```sh
node --max-old-space-size=2048 --test --test-reporter=tap \
  --test-name-pattern='isolated authenticated helper closure retains the exact Defect' \
  tests/defect-final-source-epoch.test.mjs
```

这是现有测试的原输入和全部三项原断言：完整 proof deepEqual、历史投影 exact equal、单 owner 加 LF 的漂移拒绝。未更改 helper、数据或断言。两次未插桩复现分别约16.91s/17.95s，都是子测试进程 SIGABRT、Reached heap limit，约2029 MiB GC 后仍无法继续；外层测试 runner exit 1。原文件两个完整文件的先前失败日志没有替换。

首次检出有两份 LFS pointer，先导致 release-source 哈希拒绝；另有本机 LFS 未配置 checkout filter 的提示。这些输入准备失败单独保存在 input-preparation.txt.gz，不作产品失败。最终恢复和核验的两个输入分别是：

- closeout-ci-source.json.gz：2848271 B，SHA256 `cfc72306af30d0d4b0b61398e3ed0eea36767d6e005c146eb215897fc431a8f8`。
- release-source-epoch.json.gz：2587324 B，SHA256 `5e41bb3cf23863526a60f15ce164419221c123f6d88a8b2fb3da18c9806ab780`。

只精确获取缺失的后一对象，未下载全部媒体/历史；其余从已有 Git blob 恢复。结束时本 worktree 的这两条文件恢复为原 index pointer。重现前应按原清单恢复并核验字节；所有生产/测试源码身份见 inputs.json。

## 峰值与同断言实验

| 路径 | 结果 | 本地墙钟 | 20ms 采样的整个进程组 RSS 峰值 |
| --- | --- | --- | --- |
| 原案例，进程内第二次隔离导入 | OOM，runner exit 1 | 17.95s | 2512064512 B（2.34 GiB，2个进程） |
| 测试局部子进程导入、回传完整 proof 后 deepEqual | 1/1 PASS；拒绝采用 | 21.68s | 3359911936 B（3.13 GiB，3个进程） |

实验只把隔离导入移到子进程，向子进程传入父图的同一 current source map、path 和 expected 原文；仍执行原投影及加 LF 漂移断言，回传完整 JSON proof 给父进程执行原 deepEqual。不是摘要替代 proof，也不缓存来源读取。父子各显式 2048 MiB；通过依赖多个堆，整个进程树 RSS 反而上升约33.8%，墙钟约增加20.8%，因此不符合“不提高预算/实际减少峰值”的目标，不作为补丁或完成证据。实验源码仅以 .txt 留在研究证据目录，已撤去 tests 下临时副本，未纳入测试库存。

RSS 为 /proc 同进程组加和，包含 test runner 和后代；共享页会保守重复计数，20ms 以下瞬时峰值可能漏采。不是 PSS，也不是堆对象存活量。raw experiment 的 RUSAGE_CHILDREN 三项可受 shell exec 继承先前命令累计影响，故不拿其 maxRssKiB/userSeconds/systemSeconds 作对比；comparison.json 仅采用本次独立采样的进程树 RSS、墙钟和退出码。

## 分配定位及交还 owner 的准确位置

在同一最小案例使用外部 preload 记录大 JSON 操作的调用栈与 process.memoryUsage；没有修改 helper。插桩重现17.69s OOM，单进程高水位约2.38 GiB。插桩会扰动时长/内存，不与无插桩峰值混为同条件对比。详细记录 allocations.jsonl.gz，探针 profile.mjs.txt。

1. `tests/defect-final-source-epoch.test.mjs:62` 在已经导入整套当前来源的进程中，按新的临时目录 URL 再次 import pre-formation-source-epoch；ESM 为新 URL 构建独立模块图，删除目录不能卸载已经缓存的 ESM 模块。Formation 同型入口是 `tests/encounter-formation-source-epoch.test.mjs:76`，但导入更广的 source-epoch。Formation 的该行只读定位，本轮没有重复执行它的完整文件。
2. `tests/helpers/combined-epoch/source-epoch-runtime.mjs:88` 的默认路径为 `JSON.parse(JSON.stringify(input))`。共享的旧 outer builder 每层再次完整复制历史 targets，而非只构建新增一条记录。原模块图记录15次超过10 Mi code units 的 stringify，累计约773.47 Mi code units；临时图在OOM前又记录10次，累计456.25 Mi code units。单次约37.1–72.4 Mi UTF-16 code units。这里探针字段名 bytes 对 stringify 实际记录 JS string.length，不能当作UTF-8物理字节；内存字段则是实际字节。
3. 精确继续入口包括 `tests/helpers/combined-epoch/pre-defect-source-epoch.mjs:25`、`:33`、`:36`、`:38`，以及 Defect/Formation 的 `extend*Epoch(...):20`、`tests/helpers/room-ui-source-epoch.mjs:26`。最后一次大分配来自临时 Defect builder `defect-final-source-epoch.mjs:20` → runtime:88，待parse的JSON长度58499107 code units，记录heapUsed约2134 MiB；随后OOM，原proof相等断言尚未开始。V8超限前的heapUsed可超过old-space选项，不能误当整个堆只有2048 MiB。
4. 原图导入中 `combined-epoch/source-epoch.mjs:20-22` 三次从同一 preJointUiEpoch 调用 extendJointUiEpoch，另在 pre-golden-idol-source-epoch 构建平行历史链。这些是应由共享来源认证 owner 核查的重复构建点，不在本轮擅改。单独运行第一条 outer epoch 结构断言（同一文件导入、无第二次隔离导入）14.04s PASS，单进程RSS高水位约1.86 GiB，说明导入基线已占主要余量；它不是另一组同断言优化对比。
5. `copy-integration-source-closure.mjs:13-18` 仅对明确文本扩展名做 Buffer→UTF-8→Buffer，gzip原字节直返；当前路径没有把大型gzip误当UTF-8。大归档 JSON.parse(Buffer) 的隐式字符串转换确实存在，原图的两个>10MiB gunzip共约33.62MiB，仍需计量，但本次栈显示重复证明图JSON复制是撞顶前的直接大分配。没有堆快照/retainer graph，不能声称已精确量化每个存活对象或证明泄漏。

可以由 owner 评估已存在的深冻结 proof 复用入口及去重构建，但必须继续验证全部原字节/前驱元数据、篡改负控和每次新鲜owner读取；本轮没有修改这些共享认证代码，也没有用共享缓存、子进程或更大堆掩盖漂移检测。

## 交付状态

结论：**DIAGNOSED / DEFAULT-2GiB OOM STILL OPEN**。只有诊断证据，没有可安全采纳的内存补丁；不称修好。现有负责人可沿精确位置继续处理共享 proof 构建后，在原2048 MiB边界重跑同最小案例，再完成两个完整文件。已有5+1、78与4096 MiB完整日志继续保留各自边界；Hosted Full、当前Release组合、PC/手机、官方容量与ready不由本诊断认证。

runs.json.gz 保存原日志及原字节SHA/长度；allocations.jsonl.gz 保留逐分配记录；comparison.json 是受解释限制后的对比；manifest.json 认证本目录其他交付文件。未写原PR、未更新他人引用、未打开新PR。当前证据只保存在独立诊断分支，交还协调器与原owner。
