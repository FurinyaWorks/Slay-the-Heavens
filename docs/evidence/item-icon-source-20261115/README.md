# 图标五文件源码续接证据

本片仅修改七个测试认证文件，未改生产 Lua、旧 proof.current、历史 target、archive 或 closure JSON。精确五个 UI owner 的 before 来自 `e65d9b98fbec69442047650254238cd9244df805`，after 来自已审生产源码 `5e63b5c5697d7ce567ec896eff2d3a768a58e072`；after 是生产源码锚点，**不是最终交付 HEAD**，最终原子提交由主控独审后 amend。

`source-manifest.json` 保存七文件 LF SHA256/字节数、两个固定 closeout 入口变体及其加入同一 precheck 后的 SHA256、执行命令、早期失败简报和原始/压缩 TAP 摘要。两个 TAP 均以原始字节无损 gzip，已逐字节回解核对。

- `node --test tests/integration-source-epoch.test.mjs`：42/42，通过完整当前 corpus、原历史逆投影及 detached freshness；原始输出为 `item-icon-current-corpus.tap.gz`。
- `node --test tests/item-semantic-icons-source.test.mjs tests/source-closure-bytes.test.mjs`：9/9，覆盖五 before/after、30 个混合 tuple、实际投影的双向参数/raw 拒绝、逐 owner fresh、warm 漂移/缺失、未知输入零读取、LF/CRLF、不可变 JSON pin 和副本闭包；原始输出为 `item-icon-epoch-negative.tap.gz`。

旧 before 在 target 等于 current 时仍原文零读取；无 target 前驱时 after 也原文零读取。有真实前驱的精确 after 才进入 fresh owner 循环，包括 target 等于旧 current。所有旧 proof 和历史视图保持不变。

闭包仅登记 e65 与 PR663 `d3783cd17be21dedcffd22f391cecc6455ce9a50` 两个精确入口变体；任意后续未知变体仍失败关闭。未执行 Full、图标运行时复测、客户端操作、PR、提交或推送。
