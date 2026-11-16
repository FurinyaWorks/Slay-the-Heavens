# TASK-4.21 性能片合并兼容准备

独立分支 `fix/mobile-enemy-geometry-merge-prep-v2-1116` 从实际 Release `36b9b157ee6f05b65eb9f1da7e2978647d36c210` 建树，ff 明确未合前置 #692 `b67226945c2be47c8fff31f1362412b973f68875`，仅 `cherry-pick -x` 原 #688 `61bdf6c069f8e30e6aa3ff44d3ecddd25c159ee2`，形成真实 checkpoint `d8f03fa79aacb62fd663d75fdfd3a037a9eb2984`。无冲突，不含 #672/#684 内容，不修改原688树/PR头或根Backlog。

仅复用已审小屋稀疏来源/库存/copy方法：三个产品 owner 的 before=b672、after=d8f03，保留原61bdf身份；CI辅助 after 捕获明确 `currentTreeCommitted:false`，绑定13个必要文本路径、94份原归档哈希和完整实际877JS/1424Lua发现。先验证组合 raw current，再按精确字节进入 b672 bootstrap 历史输入；原 bootstrap leaf/gzip、全部旧 gzip、断言、成本与预算不变。产品隔离 copy 仅续接 closeout epoch 并加入新的 product leaf/gzip，不复制CI叶/包。

三个runtime和原 `isolated-battle-regression.mjs`、JS/Lua计数fixture逐blob与61bdf相同，完整 `src/lua` tree双方均 `d7aa27edc0e9ba478e8d597aa8f4b58a13f052ce`。新产品包SHA256 `af5ac18b5bb3346fe000d22a184e04b8d064d38e723bd328a06cdf1b37fecfae`；新CI包 `04848f5f8d39bdd8dc2f1aa9b9eb605982aa5f3025710dd91b16836d4d8e2475`。

本轮 Node24.18.0 串行最小验证：

- `node --test --test-concurrency=1 --test-name-pattern 'enemy geometry composition|integration validates|integration copy closure' tests/integrated-ci-source.cases.mjs tests/integration-source-epoch.test.mjs tests/ci-complete-calibration.test.mjs`：7/7。包含三owner warm后缺失/漂移、产品包不完整、真实CI当前字节、gzip截断、库存缺失/重复/外来/源漂移，以及新product leaf/gzip copy warm后缺失/漂移拒绝。
- 原 `node --test tests/enemy-geometry-metrics.test.mjs` 一次：1/1、10.60秒；保留原helper、两档/计数和300帧Host/RNG断言及30秒预算，未重跑旧近邻矩阵。
- 当前真实877JS/1424Lua：Win forecast1756907ms、POSIX1190295ms，仅诊断；实际物理guard45/30分钟不变。`git diff --check` 通过。

原始证据在本树 `.artifacts/enemy-geometry-prep/{source-contracts.log,target.log,capture.json,product-capture.log,ci-capture.log,capture.mjs}`。0失败/跳过/取消；旧Node22审查/历史证据保留旧身份，不冒作本轮结果。没有整套Full/check、GIL、外部SDK、MCP、GUI或设备执行。官方容量/ready/iPhone14Pro及TASK-4.21手机AC3仍未验，不Done。本片仅交稳定来源独审；实际Release准入等692落地后绑定真实base，不预写未来squashSHA，不新建PR或轮询CI。
