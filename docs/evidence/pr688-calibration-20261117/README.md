# #688 校准读器修复准备

精确基线 `1508139e1918af4eeb455e4124241fd927c896b2`，原 Release `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。实际 Hosted Win Rules2 job `133453832504`，run `43862939682` 归因见 PR 评论；本轮不重派 Full、不改产品、不变更原 PR HEAD。

## 原因和修复

原 `ci-complete-calibration.test.mjs` 的 `closeoutRead('pr620', liveDiskReadFileSync)` 把已经投影历史的生产 reader 再交给最终当前 linked-owner 校验。源文件 `abyss_game_ui_input.lua` 与当前 Release 相同，但旧字节进入当前认证导致拒绝。

现在只拆分该测试的 read 入口：`src/` 与 architecture 使用实际当前原字节，其他 CI 输入继续原具名历史读取器。所有原测试断言逐字保留，逐 owner 完整认证、foreign 拒绝/保留合同、原 18 Windows / 15 Linux 规模及所有时间预算保持。

新增 `enemy-calibration-reader-repair.json.gz` 保存一个消费者的完整 before/current、两份原历史视图；原 CI packet 和先前 reader repair 均不重写。信任叶逐个核 source SHA256/Git blob，并在每次当前认证时核新归档；保持352生产/117 owners/31 CI sources，archives增为103。

## 已完成

- 原同一具名测试 `component UI CI projection admits only complete current sources and preserves foreign drift`：红→绿 **1/1**，16.687秒，原断言未改；日志 `red.log` / `first-green.log`。
- 独立复审 PASS：47项正负控及真实Git原始输入对账，见 REVIEW.md 和 independent-review.mjs/.log。不重复实施者完整校准。
- check:guidance / verify:backlog / 语法 / diff 检查通过。最初稀疏检出缺 .codebuddy/.cursor/backlog 的失败日志保留；补齐 exact HEAD 路径后成功，非产品失败。
- LFS材料仅按本地已有文件与原oid匹配水合；不提交水合噪声。

## 正在运行 / 未验证

`node --test tests/ci-complete-calibration.test.mjs` 在本轮本地原进程继续执行，当前尚无完成结果。**未宣称完整文件通过**，不会再启动同一份测试。准备分支先保全已独审修改，后续单独补精确结果。

尚未验证该最终SHA Hosted、原PR接入、合并、官方/设备结果。不要把准备分支当已准入的发行候选。旧独立#694/#688组合和未合入成果保持不动；本准备的base仍是#688真实头。
