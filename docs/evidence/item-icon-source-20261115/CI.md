# 图标有限 CI 续接

仅六个 CI 文件和既有 source current guard 的条件退役发生变化；生产 Lua、旧 proof 对象、历史 GZ、target、closure JSON、预算及 runner 均未修改。完整 LF 摘要、十二条有限 before→after、e65/d378 两个已知 Git 变体、命令与无损 TAP 摘要见 `ci-source-manifest.json`。最终交付 HEAD 由主控独审后 amend，此证据中的生产源码锚点不冒充最终 HEAD。

最终仅增加 **3 个 JS 测试、0 个 standalone Lua**。两份 Lua 为隔离 official-profile JS wrapper 的 support，已迁至 `tests/helpers/`，字节身份保持不变；不再由默认 profile 的 raw Lua Full 重复执行。它们不进入生产 helper-copy 闭包。

- `ci-alias-final.tap.gz`：3/3，通过十二别名、空 view 原样返回、未知 target 零读取、完整库存、support freshness 和正式 base 退役负控。
- `ci-sts-final.tap.gz`：2/2，通过 raw Full 库存和 source current guard。
- `source-current-final.tap.gz`：2/2，仅重跑改变的 current guard；此前其余历史逆投影成功记录保留，没有重复42项。
- `ci-budget-final.tap.gz`：1/1；实际875 JS、1421 Lua，原预算预测 Windows 1,754,000/1,800,000ms，Linux 1,188,967/1,200,000ms。预测不等于运行时容量证明。
- `ci-selection-historical-green.tap.gz`：较早一次历史 materializer wrapper 1/1，内部原5/5，60秒预算不变；后续仅条件退役及 support 拆分，按指令未重放。

原资源 identity RED、错误标签兼容 RED，以及迁移前1423 Lua的历史预算 PASS 都单独保留，不能替代最终1421 Lua证据。原始 TAP 字节逐份 gzip 并回解核对；未冒称 reviewer 转述文本为原始文件。

只有固定 before 身份匹配时，精确 after 才可用于真实 target view；null view 仍 opaque。正式 archive 已收录新测试时，不重复加入库存；runtime JS 和两份 support 也已由正式 archive 接管后，旧 bridge source pin 退役，恢复原档案规则。未来 source proof 不再等于五 before 时，current guard 恢复逐行精确 current 字节比较。

未执行 Full、未重复图标运行时；未操作客户端、提交、推送或创建 PR。只按授权暂存了新 CI trust leaf，以供既有 tracked-only materializer读取。
