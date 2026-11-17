# #688 校准读器修复准备

精确基线 `1508139e1918af4eeb455e4124241fd927c896b2`，原 Release `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。实际 Hosted Win Rules2 job `133453832504`，run `43862939682` 归因见 PR 评论；本轮不手动重派 Full、不改产品；准备阶段不变更原 PR HEAD，完成复审后按精确旧头进行正常 FF 接续。

## 原因和修复

原 `ci-complete-calibration.test.mjs` 的 `closeoutRead('pr620', liveDiskReadFileSync)` 把已经投影历史的生产 reader 再交给最终当前 linked-owner 校验。源文件 `abyss_game_ui_input.lua` 与当前 Release 相同，但旧字节进入当前认证导致拒绝。

现在只拆分该测试的 read 入口：`src/` 与 architecture 使用实际当前原字节，其他 CI 输入继续原具名历史读取器。所有原测试断言逐字保留，逐 owner 完整认证、foreign 拒绝/保留合同、原 18 Windows / 15 Linux 规模及所有时间预算保持。

新增 `enemy-calibration-reader-repair.json.gz` 保存一个消费者的完整 before/current、两份原历史视图；原 CI packet 和先前 reader repair 均不重写。信任叶逐个核 source SHA256/Git blob，并在每次当前认证时核新归档；保持352生产/117 owners/31 CI sources，archives增为103。

## 已完成

- 原同一具名测试 `component UI CI projection admits only complete current sources and preserves foreign drift`：红→绿 **1/1**，16.687秒，原断言未改；日志 `red.log` / `first-green.log`。
- 独立复审 PASS：47项正负控及真实Git原始输入对账，见 REVIEW.md 和 independent-review.mjs/.log。不重复实施者完整校准。
- check:guidance / verify:backlog / 语法 / diff 检查通过。最初稀疏检出缺 .codebuddy/.cursor/backlog 的失败日志保留；补齐 exact HEAD 路径后成功，非产品失败。
- LFS材料仅按本地已有文件与原oid匹配水合；不提交水合噪声。

## 完整校准接续结果 / 未验证

原进程已完成：76项中71通过、5失败，0 skip，1394.847秒。五项失败全是启动时稀疏检出缺 `.github/workflows/quality.yml` 的 ENOENT；原始失败全保留于 `calibration-full.log`。此前已恢复该 exact HEAD 文件且字节比对通过，本轮只重跑原失败5项，**5/5通过，24.577秒，0 skip**，见 `failed-five-rerun.log`。没有重复启动整个文件或Full。

因此76项原校准在首轮71项通过与环境修复后的5项复验中完成，不写成单轮76/76全绿。Golden Idol836历史预测合同本次耗时1258.756秒且通过，它不是新的Hosted Full。三个实施输入与原独审SHA完全一致，后续提交仅更新日志和说明。

该最终SHA Hosted、合并、官方/设备结果仍未验证；原PR接入状态以远端精确HEAD读回为准。不要把准备分支当已准入的发行候选。旧独立#694/#688组合和未合入成果保持不动；本准备的base仍是#688真实头。
