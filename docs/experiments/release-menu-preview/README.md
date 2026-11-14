# 菜单组合预览依赖核验（2026-11-14）

候选 `b5a3b7488e86990409035e0080c06eae358be879`，完整树 `7e75fa2083b816ad6e7f5f833fd40d180b2d8838`；本地等价审阅提交 `9f5a13dc0d9a99111a7bb8cb54d0d4e8e3e0b049`。

此前 `experiments/menu-red-fit/compose.mjs` 的缺失是本地稀疏检出未物化，不是仓库遗漏。`git ls-tree` 证明候选已含 blob `3a69f82eabf23a569003d723710e3bf0c0e38cd7`，`git ls-files -v` 当时标记 S。只执行 `git sparse-checkout add experiments/menu-red-fit`，未修改源码、测试或断言。物化文件与 HEAD 原字节 SHA256 均为 `11d8b3874238adfd7d429c32a9a41e47d75cc209e7e04e76846c9d7a19805d81`。

运行 `node --test tests/native-candidate-preview-mask.test.mjs`：16 项，15 通过、0 失败、1 跳过。原始日志见 [20261114-preview.log](20261114-preview.log)，SHA256 `03edf9fd26a23d61ed39b4d472e89eaa4934c9056ee3d4d7bcf2251b85a177be`。菜单组合、原生旋转、历史来源延续及当前完整来源检查均实际执行通过。

唯一跳过项是 pinned browser renderer：本地未找到测试要求的真实浏览器 bundle，未设置 `ABYSS_SIMULATOR_RENDERER`，不得用模拟代码代替。此轮不是零跳过/完整预览通过，不代表组合 Full CI、官方设备或发布准入。未重启 Full，未改合并队列。
