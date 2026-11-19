# Release 官方素材回退：离线编译输入验证

状态：**OFFLINE_INPUTS_VERIFIED；候选/启动/官方负载/设备验收仍 UNVERIFIED**。

## 身份、用途与占用

- 固定源码：Release `1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2`，未修改产品代码、原任务、负责人或门禁。
- 起因：[#703 原执行者 2026-11-19 的启动诊断](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/703#issuecomment-6997110267)指出默认卡面共享后的真实 `GetChild` 路径失败，正在准备 `--official-assets` 隔离回退。本次只核查这个既有开关的编译输入，不接管 TASK-111，不重复打包。
- 本结果不能认证原执行者尚未提供的回退 GIL。`official-assets-battle-v2` 是非 RC 独立配置，原校验器拒绝与 `releaseCandidate` 同用；不能据此创建正式 RC。
- 该配置关闭自定义卡牌、怪物、菜单背景，但保留旅行者选角/战斗肖像。不是“零自定义资产”。

## 结果

| 离线输入指标 | 本轮结果 |
| --- | ---: |
| 来源清单 | 641 文件，17,333,173 字节；逐项匹配固定 Git blob / 4 个真实 LFS 对象 |
| 布局及模板记录（含根） | 24,698 |
| Reference 节点 / 共享卡面宿主 | 0 / 0 |
| 最大直接子节点 | 60，原容量校验通过 |
| 直接实体输入路径 | 38 / 38 |
| 负例 | 6 / 6 正确拒绝 |
| 布局 / 模板紧凑 JSON | 3,931,884 / 137,234 字节 |
| 原生产清单的绑定前 Lua 输入 | 366 模块，5,374,692 字节 |
| 生成文件 | 26 个，30,277,105 字节；二次干净生成逐文件一致 |

38 条路径为：手牌 10、商店卡 7、Picker 3、锻造卡 12、Choice 2，以及结束回合、商人对话、节点确认、Choice 确认各 1。逐段只遍历真实子节点，不展开 reference；终点必须是有正尺寸的 `cursorArea` / `presetButton`。分别删除手牌/商店/Picker/Choice/商人输入以及把手牌宿主替为 reference，均拒绝。没有覆盖所有运行时路径、动态创建、事件分派或命中效果。

使用原 `assertOfficialRunContracts`、`assertNativeUiCapacity`、官方配置校验器和生产脚本清单。确认原候选构建器在该配置禁用共享，关闭共享的变换保持布局/模板完整不变。`results.json` 保存每条路径尺寸、各生成文件与 Lua 输入的 SHA256/字节数。这里的 Lua 尚未进行最终模板索引绑定，不是最终 GIL 内脚本字节。

调试校正，不算产品缺陷：最初探针错误假设 Picker 有 6 个活跃槽、商人 `next/hit` 是按钮。核对实际源码后改为 3 个 live Picker，4–6 是空隐藏槽；`next` 是装饰图，真正输入是 `talk/hit`。另一次从稀疏工作目录构建数据遗漏 Original V4，随后改用完整固定快照重新生成全部输入。最终证据来自正确准备后的运行，并以第二份全新输出目录重建核对；没有为了通过而修改产品代码。

## 复核与保存

`source-inputs.json` 为构建器选出的来源逐项 hash / Git blob；`assets.json` 为材料化素材清单。先恢复该精确源码及 LFS 实体，并使用其已安装依赖；不能把 LFS pointer 当图片。

在源码根目录，令 `EVIDENCE` 指向本目录绝对路径，`OUT` 为新的绝对输出目录：

```sh
node scripts/build-lua-data.mjs data "$OUT/abyss_data.lua"
node scripts/build-ui.mjs "$OUT" --official-assets --native-page-lifecycle
node "$EVIDENCE/probe.mjs" "$PWD" "$OUT" "$OUT/verification.json"
```

本轮 Node `v24.22.1`。`probe.mjs` 会复算全部 641 个来源的 hash 并与清单比较；产品文件仍来自固定 Release。`build-replay.txt` / `probe.txt` 是最终通过输出，非 Full 或实机日志。

按 [证据保存规范](../README.md)，远端保全小型可重建清单，不将 30 MB 完整构建物再加入 Git。完整生成输入在本轮工作树 `.artifacts/release-official-inputs-20261119/generated-inputs.tar.gz` 保全：1,757,600 字节，SHA256 `d79751b1547941a8baffc203d8426db64db846ac8490dfadb7670b0ddbc55e69`。归档为原始 26 个生成文件，哈希见结果；另有第二份生成目录逐文件一致。此完整归档尚无远端长期取回位置，不宣称已经永久归档。

## 剩余验证：文件即可完成与必须客户端完成

1. **需要原执行者的既有文件，不需要用户操作 GUI：**取得最终回退 `.gil`、同候选 `candidate.json`、匹配的源码/buildId/SHA256/payloadDigest 和工具链身份。现有 `scripts/audit-native-candidate.mjs` 可在具备对应 Miliastra 离线工具链的环境读回，核对真实布局、模板索引和全部生产脚本；再对解码结果做“不展开引用”的路径/严格 Host 启动对照。本轮没有这些文件，云端也未具备该编码器，未执行。不要另行构建一个替代包冒充原执行者候选。
2. **必须官方客户端和本轮窗口：**同一 GIL 官方导入、上传校验、真实菜单 ready/可操作与错误日志、官方容量和静/动态负载；之后同候选 PC 与物理手机输入/性能。离线严格 Host 也不能代替这些结果。用户未让出 GUI 窗口，本轮未启动客户端、导入或试玩。

[平台负载合同](../../PLATFORM_LOAD.md)的官方面板上限是关卡 20 MB、服务器 3 MB；16 MB 是内部预警目标，不是官方禁令。60 是当前客户端 UI 直接子节点约束。上述源码/Lua/JSON/GIL字节均不能换算成官方读数。原 8.96 MB / 0.01 MB 历史截图缺乏本候选身份，不能沿用。**当前回退候选的官方容量、ready、手机结果、Hosted Full 与发布许可均未验证；没有合并、入队或发布。**
