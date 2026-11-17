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
