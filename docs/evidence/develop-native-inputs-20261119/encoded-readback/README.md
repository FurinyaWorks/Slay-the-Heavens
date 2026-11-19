# v2 候选 GIL：输入节点写后读回

状态：**检查器已独审；真实候选未收到、未运行**。用于原生默认美术配置，不适用 #749 的公开人数样例或旧 official-assets 实验。预先核对的新布局是源码 `62328bdac7703c3ab241e0ddb19e0fa05474f76a`，见 [编译前输入检查](../packing-readiness.md)。

拿到使用完整 `build:native` 产生的含音频 GIL、最终 `audio/candidate.json` 和已批准的相同编码工具后：

```sh
node check-readback.mjs /path/to/candidate.gil /path/to/audio/candidate.json /path/to/approved-toolchain 62328bdac7703c3ab241e0ddb19e0fa05474f76a > encoded-readback.json
```

若基线更新，先核对实际候选来源和 49 条路径仍适用，才更新命令最后一个 SHA。检查器先重新计算 GIL 的字节大小和 SHA-256，与最终收据比对；核对来源、buildId、默认配置、收据连接字段和相同工具源码摘要。只从 GIL 用原工具 `getClientUi` 的实体子控件和 ID 树读取，拒绝穿过 reference，要求 49 条交互路径存在、终端 ID 各自唯一、尺寸为正，同时核对 `abyss_ui` 根挂载、构建标记和全量嵌入 Lua 摘要。运行前后重新比较原 GIL 字节，不写 GIL 或游戏。

这个辅助检查只证明输入文件与收据内部自洽、编码后文件和挂载符合本检查边界。它不单独重算源码 payload、不打开完整上游收据、不审 BGM 图或依赖，不替代正式候选证明、官方导入/ready、原生 GetChild 行为、容量与实机验收。真实包验证时仍按 [#743 交接](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/743#issuecomment-7000199576) 留全证。

## 已执行的受控测试

`node --test check-readback.test.mjs`，主执行与独立复跑均 5/5；正例是合成局部结构，非实际编码 GIL。负控含 reference（即使显示后代存在）、缺 hit、无物理 ID、同名节点、重复终点 ID、缺根挂载、改文件字节、错源码、dirty 源码、实验配置、伪 uiProfile、Lua 摘要及构建标记错误。

首轮独审发现真实默认收据也存在 `uiProfile` 对象；已修为严格检查正式源码 `uiProfileReceipt(false)` 的形状和摘要。独审另用精确源码 `nativeAudioBuildArgs([])` → `artFeatureReceipt` 与 `uiProfileReceipt(false)` 驱动正例；缺 profile、伪摘要、有效但背景旗标不同三项均拒绝。独审绑定：脚本 SHA-256 `f37ce7f47492eb14b35480a502fb8c6fe787030ecbebc01fb551c39c426b2445`，测试 `122480f453bd29942989426d039487a075e69ef97960b6d0fe6fefb7b61b8484`。暂不进生产分支、CI 或 Backlog；收到实际候选后才运行写后读回，不把这份证据标作发布通过。
