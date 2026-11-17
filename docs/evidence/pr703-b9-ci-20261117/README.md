# PR703 接续 B9 的 CI 来源闭包

准确输入：容量修复 `27dcd30120642b4d77f04bbacf1ec460e78ac5bf` 与实际 release `b9bca884ed9b9831965b409885d78f719b9a567a`，无冲突合流为 `761ccb5177df77e44485aa9cb5899d49074b7c5f`。本轮未修改合流后的容量产品、scripts、config、workflow 或任何旧 packet/expected。

原始四文件来源组合在可写 F 盘进程级 TEMP/TMP 下为23项、14通过、9失败；先前 C 盘临时目录权限导致的两项额外失败已单列排除。真实根因是三个 CI 输入重叠：capacity 的 bootstrap/selection helper 与 B9 联合视图不同，合流后的 selection 测试同时接入两者，但旧完整身份仍分别要求其原前驱。简单选择一侧会丢掉另一侧的完整认证。

新增一个 CI-only 精确接续叶与压缩包，保留四个完整输入的真实 after 和 B9/capacity Git 前驱，显式选择两种历史视图；新接入的 joint 测试原本只在 B9 存在，其 capacity 侧前驱也明确绑定 B9，未虚构容量分支文件。容量自己的 CI owner 先认证，再将其余 B9 输入投影到 selection 历史视图。生产授权不经过该 CI 叶。旧 packet、SHA、测试期望及全部原负控保持。

补充实际完整输入与 LF/CRLF、错误 before、篡改/截断、CRCRLF、foreign path、非字符串与 Buffer 身份负控。两个缺失/篡改 owner 回调改用原始读取，确保原有 `/missing/` 等断言命中指定 owner，而非提前被历史 card_flow 视图拦截；未放宽正则或断言。

固定 Windows Node24.18.0，相关六文件 **40/40**，0失败、0跳过，14615.0624ms：

```sh
node --test tests/release-card-contact-integration.test.mjs tests/release-selection-map-source.test.mjs tests/release-pc22-basic-feedback-source.test.mjs tests/integrated-ci-source.cases.mjs tests/ci-impact.test.mjs tests/ci-summary-runners.test.mjs
```

原始 RED 与最终组合 stdout 无损 gzip 保存，准确摘要、包 SHA 和四个 Git 前驱/after 验证结果见 `validation.json`。`git diff --check` 通过。仅离线来源/CI 合同验证；没有新 Hosted Full、官方候选导入/ready、容量或设备验收。尚未 push，由主控独立复审后接续原 #703。

## 2026-11-17 五项历史 reader 接续

基线 `80114c7f466ae8a6bf03e30409a3ba5259be7d4c`（已含 B9）。三份容量更新后的 fixture 缺少原历史前驱：`art-feature-source-inverse.test.mjs` 的 component281/closeout，以及 `selection_budget_loading.lua`、`selection_portrait_preload.lua` 的两份 planning 收据。三个 fixture 和实际 Lua 执行保持不变；仅在既有 CI 叶追加完整 before/current 包，复用 c385/48ef 的准确 Git 前驱。Selection 校准入口改用已有 `integrationCapacityCiRead(raw)`，保留容量实际 current 认证后才投影旧 Selection；原历史 pin、包和断言不改。

原五条具名用例 **0/5 RED→5/5 PASS**（22.079s，0 skip/cancel）；中间修 budget 后同两 planning 用例暴露 preload 同源问题，3/5结果亦保留。相邻两完整来源文件 **13/13 PASS**（13.617s），顶层 `assertIntegratedCurrent`、guidance、Backlog及diff检查通过。五份 current 每次同raw鲜读，原产品/容量owner、packet、尾字节、缺失/null/类型、LF/CRLF/CRCRLF和opaque Buffer探针 **192控制通过**；独立只读复审另验 **125控制通过**，含warm旧前驱拒绝和不引入CI依赖的生产隔离copy。最终准确HEAD/tree独审JSON由主控交付回执保存。

必要原始红/中间红/绿/192控制/相邻日志合为 [无损原始包](reader-repair-raw.json.gz)，gzip SHA256 `5696db751e238400fd98f0c93ecfa9b81c8a22c078327bb4e746cbc731dd4a32`；解压后五项均为base64原字节，逐项有raw SHA256/长度，无换行规范化。原14文件检查点 `51edf5d817bbd533d7131747babab55483a2f6a9` 保留Git历史与完整探针脚本；当前仅收拢证据，不重跑绿套件。新增源码包仍标 worktree capture，不冒充已提交producer。

Node v24.19.0 / Linux，不等于托管固定版本或Windows结果。最初两LFS来源档为指针时模块导入失败、用例未执行；按原OID/size物化后才取得真实RED/GREEN，物化字节未提交。没有Full、push/dispatch/评论/合并、官方导入/ready、官方容量或设备验收；Task111原状态和全部未验AC保持，原PR尚未推进。
