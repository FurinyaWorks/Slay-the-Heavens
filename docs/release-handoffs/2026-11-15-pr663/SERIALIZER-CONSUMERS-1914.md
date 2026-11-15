# Release 2.0.0：减容后的下游构建契约（19:14 UTC run）

## #691：旧静态卡图候选不能再误拒

与 [RC 版本检查](RELEASE-CANDIDATE-PREFLIGHT-1849.md) 独立。当前 #691 `f85f4e4435e8b128c16713ed23bcbb2559f4fd1e` 会在显式静态卡图实验候选中把 `abyss_presentation.lua` 改为 UTF-8 / 裸键，而旧静态卡图收据刻意保持 ASCII/括号键、字段唯一性和精确插槽值。原 formal CLI 假 SDK 路径实测在解析中文第一处失败，无法完成候选；直接艺术绑定也实测不能找到旧键。

[五文件补丁](pr691-selective-canonical-presentation.patch) 仅让显式静态卡图（实际 `prepareNativeCardArt` 成功）继续用原来的 `toLua`，不改卡图收据或放宽其任何守卫。默认、正式官方配置均保留减容序列化；与未应用补丁的 #691 逐字节比较，默认 22 个、官方 native lifecycle 23 个输出全部相同。另把游戏实测包装器的版本断言改为静态根键、唯一版本与字符串值检查，兼容两种书写，并让两个已有「普通版不得偷偷加载卡图」断言识别裸键，修补假绿风险。

[定向日志](pr691-serializer-consumers.log)：实际 build+receipt 保留 SHA 读回且拒三处变异（卡牌身份、键的规范书写、容量）；三个正式 CLI 假 SDK 正/负用例全过；默认零卡图、ready-art 75 卡片、游戏实测包装器等通过。资产 fixture 从准确 LFS 对象按哈希还原。独审 PASS_SCOPED。未触发 Full，更未打包官方 GIL。合入 #691 前需在最终头核对既有源绑定，只新增必要续接，不改冻结历史。

## #694：独立限定复核，不重复跑测试

[复核](pr694-scoped-review.md)确认目前静止手牌切片不改变八个缓存值、写控件重入处理以及拖拽起点快照。它仍是 Release Draft，依赖 #692 与真实清单 / CI 接续；不把模拟统计视为真机或整段性能结论。

本轮没有触碰发布元数据、原 PR 头和主分支，也没有改验收门禁。
