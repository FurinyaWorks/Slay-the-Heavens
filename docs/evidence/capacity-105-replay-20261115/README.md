# TASK-105 离线实验可复现接续

> 本目录保留来源树在 `e65d9b98` 上的历史重放记录，后续收入来源提交 `2e8d5d95`。当前 `c2409ad7` 基线的集成、定向合同和恢复归档见[集成交接](../capacity-105-integration-20261115/README.md)。下文的候选身份、数量、耗时、当时提交状态均为历史事实，不表示当前基线重新测量或已完成独审。

基线`e65d9b98fbec69442047650254238cd9244df805`，独立工作树`F:/New folder/.worktrees/backlog-continuation-1115`。本轮接续原实验，不变更生产Lua、数据、皮肤、角色注册或发布配置。源码尚未提交，sourceDirty=true；HEAD不足以单独指认本轮脚本，逐文件身份见[输入清单](input-manifest.json)。独立复审尚待协调者安排，本文不是自我独审结论。

## 改动与保全

原脚本固定写`docs/evidence/capacity-105-20261113`、共用`build/capacity-105/current`，历史交付副本还硬编码本机路径。现在必须显式指定全新`--out build/capacity-105/<name>`，生成目录随该次运行独占；可选`--delivery-copy`代替硬编码路径，不提供即不核对该副本。

每次复用正式sourceInputs收集三个明确profile的生产输入并集，加上实际读取的历史收据和实验脚本。运行前后HEAD/完整输入记录必须一致；非介入映射模块逐个检查名字、字节和hash；28档gzip逐个解压并核对payload、两模块hash与映射总量。完成真实持久化读回及最后输入检查才将pending结果更名为results。失败目录保留，不沿用旧成功文件。

原树39文件共34,571,358字节保持只读，全部重新核hash一致。[旧来源索引](legacy-source.json)和[原研究报告](../../research/TASK-105-OFFLINE-20261113.md)保留其身份；原树未提交文件仍是恢复来源，不把本轮HEAD称为旧实验提交。34MB档案没有重复加入Git，所有新压力模块也只留在build目录。

新树三张生成器必需PNG原为LFS指针；仅按[明确OID和大小](hydrated-inputs.json)从已有本地缓存还原，逐文件SHA一致。没有pull、下载、repack或全库hydrate，未修改原树。其他PNG/GIF等只按构建器既有实际读取方式记录身份；本轮不认证完整素材供应或运行环境。

## 最终运行

```powershell
& 'F:/New folder/build/tools/node-v24.18.0-win-x64/node.exe' experiments/capacity-105/replay.test.mjs
& 'F:/New folder/build/tools/node-v24.18.0-win-x64/node.exe' experiments/capacity-105/run.mjs --out build/capacity-105/replay-20261115-g
```

Node24.18.0最终重放成功，脚本内部墙钟83,618.619ms；639输入，364映射模块，三个profile、四种方案×七档新增人数共28档均通过读回。命令没有构建GIL、调用MCP或执行合成角色。[摘要](replay-summary.json)保存全部数值、原始results文件大小/hash与原始模块档案身份；其中artifact相对路径以`rawResults.path`所在的build目录为根，不是本文目录。压缩大档不在Git，按相同输入和命令可重建。

以下仅为**离线映射Lua字节**，不能与官方20MB直接比较：

| 新增角色数（在已有四套V4之外） | 独立整包压力 | 裁selection133压力 | 共用同一美术 | 组合保底 |
| --- | ---: | ---: | ---: | ---: |
| 0 | 5,537,395 | 5,409,017 | 5,537,395 | 3,978,587 |
| 10 | 20,199,016 | 18,786,858 | 6,966,550 | 5,407,742 |
| 20 | 34,863,220 | 32,167,282 | 8,398,354 | 6,839,546 |
| 30 | 49,524,781 | 45,545,063 | 9,827,515 | 8,268,707 |

独立档重复的是同一真实角色包，唯一美术digest仍只有一种；裁剪档未证明运行等价；共享档不包含30份独特角色画。UI/模板固定是控制变量，不是未来选角页也固定的证明。保底同时变更皮肤和生命周期，是组合对照。新旧生产基线不同，不能将2026-11-13数字与本轮差异归因为优化。Node22先前成功轮与最终Node24的28档数值和未压缩payload hash逐项一致，不据两次耗时宣称提速。

## 检查、失败和成本

- [最终合同原始输出](coverage-after-green.txt)：7组，6通过、0失败、1跳过。旧六组输出仍保留在`contracts-node24.txt`，不被覆盖。该跳过仅为本机文件系统把PowerShell Junction暴露为Node普通目录（lstat false、readlink EINVAL），没有真实symlink断言通过的声明；正常路径与既有目录覆盖拒绝均实际执行。
- [四项负控](g-negative-controls.json)：分别移除输出保护、输入稳定性、非介入模块身份、结果读回，真实合同均失败；日志同目录保留。
- [真实CLI拒绝](output-rejections.json)：已有成功目录、旧历史证据目录均退出非零；旧结果hash未变。
- Node24的`-e`轮运行期间测试文件发生变更，完整输入摘要真实拒绝，未发布results；原大档留在其build目录。这是输入漂移负例，不是成功测量。
- [执行记录](execution-history.json)：保留初次sandbox子进程EPERM、两次必需LFS图片缺失、Node22的132.527秒旧脚本成功轮及Node24漂移拒绝。Node24最初合同4/5失败源于上述junction能力诊断，原断言没有放宽为假通过。最终`-g`为本轮有效结果；`-e`与`-f`曾在不同目录短暂并行，耗时不是独占机器基准。
- `verify:backlog`及`git diff --check`通过。没有运行Full、其他完整工程检查或官方/设备测试；没有提交、推送、创建PR、启用自动合并或发布。

官方MB仍为null，officialStatus和实体手机保持UNVERIFIED。干净正式B0、B1/B2独特资产分项官方delta、章节/大规模点及设备加载/释放仍缺。现有`check:platform-load`增长警告和`verify:platform-load`官方证据拒绝继续使用，本轮不伪造GO或勾选TASK-105 AC；TASK-97继续禁止量产。

## 独立评审发现后的覆盖修复

独立评审发现旧verifyRows接受空数组或缺少scheme×人数的结果，属于真实P2完整性缺口。先在保留的f旧helper上新增完整集合断言，实际RED为Missing expected exception，见[修前输出](coverage-before-red.txt)；修后固定四方案×七人数的精确键集合与数字类型，空/缺/重复/未知/额外行均拒绝，[修后输出](coverage-after-green.txt)为7组6通过1平台能力跳过。

f已结束后才修改源码；[f来源记录](source-revision-f.json)保留旧摘要、三源码hash及原字节恢复路径，原始结果不改写。新g目录按修后的输入摘要完整重放，28档数值与未压缩payload逐项同f，最终摘要只认证g来源。g来源的四guard负控另留g-negative日志，不覆盖f旧日志。当前独审修复结论由协调者单独读回，本文不代其签署PASS。
