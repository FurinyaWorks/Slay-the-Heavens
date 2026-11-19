# 10:15 UTC：原生打包前的干净源码与实际布局路径

**结果：源码预检通过，仍没有可导入的 GIL。** 来源为 `develop@62328bdac7703c3ab241e0ddb19e0fa05474f76a`，树 `420171af6a98385c3641cf7d59fbb8f0e53a50d0`。这是与 [Full](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/44470888621) 相同的源码，不包含试验 PR、冻结 Release 或证据分支自身的文件。

## 干净源码

在独立 detached 工作树中取出原 Git 指针，并逐件校验之前已取得的五个 LFS 文件的 SHA-256 与大小。仅为本次命令启用正常 Git LFS 过滤（不改全局配置），逐件执行 `git hash-object --path=<path> <path>` 并确认与 `git rev-parse HEAD:<path>` 相同。只在比对全通过后，才在隔离索引对这五项 `git add` 刷新工作区索引；前后 `git write-tree` 与 HEAD tree 完全相同，暂存差异为空。正式构建使用的 `gitSourceIdentity` 回报 `sourceDirty: false`。独立复核用第二个临时索引和隔离的 LFS 存储重做；10,476 个条目无 skip-worktree/assume-unchanged，无稀疏检出、额外忽略或隐藏未跟踪输入。详见 [独立复核收据](clean-packing-independent.json)。

实际 `sourceInputs` 的 643 条记录和已有收据逐项一致，输入摘要 `403702c242a089a1203ff208fab2355eb01fbd309a9131ab52834ec7e7acfcac`。在主验证隔离树给背景图追加一字节，正式身份检查变 dirty，输入摘要变为 `8e3c1bdd45d97da759eb61c08459ef6e9a993b23cc14076a6f71d05386548ba5`，恢复原件后两者恢复。原始清理检查不用 skip-worktree 或忽略规则。最初曾误预期清单枚举器自身拒绝变异：它的合同是重新读字节并产出不同摘要，拒绝来自干净源码和候选一致性门禁。

## 已核对的原生布局输入

按前一轮收据校验 `game-ui.json`（`0798f272cba727cf099dd7676b80c0cdf15cd4c4f447904f35e01d44c4c0a7bf`）及 `game-ui-templates.json`（`bf40667522dd57298cba00fc6d0bc91470649ae40590b98c2b45ae2d9cf8c8c4`）后，复用 `assertNativeUiCapacity` 并直接遍历序列化前布局：10 战斗手牌、7 商店、6 选择、12 锻造、10 奖励槽与 4 个交互共 **49/49** 有真实输入节点和正尺寸，布局和 6 个模板无 reference。把旧故障位置 `stage/battlePanel/card1` 改成引用、或删除其 `hit`，两项变异均被路径探针拒绝。这只核实写入编码器前的 JSON；实际 GIL 物理树、脚本绑定、导入和游戏内 GetChild 仍需验。

## 工具线索与未完成项

[#749](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/749) 的隔离实验使用 [8itlab 工具固定源码](https://github.com/8itlab/genshin-miliastra-mcp/tree/70470757d6fcb319c5afec13b178c87f2d8d54b3) 写入并读回公开样例的人数。只读核对该源码的 checker 和两条 XYZ anchor 均恰好一次，所需静态导出在对应文件中存在。**这不是完整工具链验收**：未取得并执行其完整依赖、MCP、正式 UI/脚本/结算和音频编码脚本；公开样例也不是本轮批准的官方基础 GIL。仍待已批准底包和匹配完整工具链，或含音频 GIL 与 `audio/candidate.json`；不替换底包、不重开 Full、不操作官方客户端。
