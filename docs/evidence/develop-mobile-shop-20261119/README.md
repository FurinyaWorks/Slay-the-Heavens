# M05 商店说明关闭：Develop 接续

- 基线：`62328bdac7703c3ab241e0ddb19e0fa05474f76a`。
- 原成果：[#680](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/680)，原生产提交 `41334b11a2a5a37d5cc411f93a192406127b86d9`，最后 PR HEAD `b3d550f33b8479f4f93dda333720a1ba54063163`。原任务 TASK-38.6、负责人 Furinya 保留。本切片由 dot 接续到 develop；没有重新设计、领取其他手机问题或修改旧 Release。
- 原 `check-pr-slice --start TASK-38.6` 返回 ALLOW；核对当时主仓仅 #741/#738 开放、两 Fork 无开放 PR、无 shop 同线远端分支。旧 #680 已合旧 Release，当前 Develop 缺该输入层。Backlog 通过 CLI 记录接续，不勾手机 AC。

## 产品变化与证据

只迁回原 3 个生产文件的 81 行新增：在商品/按钮下方放非焦点空白输入层；背景点击只取消当前说明，前景动作及多指旧尾不能借机关闭新说明或购买。保留购买二次确认、价格、库存、离店、PC/Controller 和 Run/RNG。

原 JS 入口从 41334b11 逐字保留，Lua 用例从 #680 最终 b3d550f3 的 `tests/lua/support/shop_dismiss.lua` 逐字接回；相对首版只少末尾两个空行，所有断言保留。原布局测试仅按旧修复排除无可见内容的背景输入层。去掉原首版 EOF 空行后重跑原 M05 2/2，并通过 staged diff 检查。

| 验证 | 结果与边界 |
| --- | --- |
| 精确基线、默认真实生成布局、原 M05 用例 | 0/2 RED：没有 shopDismiss 控件，不能进入原关闭轨迹 |
| 迁移后默认 M05 + 布局 | 14/14，含原 12 组运行时 |
| 迁移后 official-assets 构建 + 原 M05 | 2/2，含同一 12 组；是离线生成 Host，不是官方客户端 |
| 默认相邻 Lua | shop_selection / shop / node_ui 三入口通过：二次确认、PC、价格/库存、相邻节点规则保留 |
| 原生替身/生命周期合同 | 7/7，通过原失败注入负控 |
| 架构、Luacheck 1.2.0、JS syntax、guidance、Backlog、diff | 通过；Luacheck 原二进制 SHA256 已核对；没有改基线或门槛 |
| 精确基线 CI calibration | 73/73 |
| 本迁移 CI calibration | 42/73；31 项失败，不能准入或合并 |

有两个旧手写 mock（shop_selection.lua/node_ui.lua）在 official-assets profile 缺 GetChildren，精确基线和迁移树都同样失败；它们在默认 profile 通过。没有改 mock 来假装 official 测试通过。M05 自身原测试使用完整生成 Host，在两配置都通过。最初 official 构建及 calibration 因 LFS 指针未物化失败；按 Git 指针的 SHA256/bytes 从现有授权工作树只读复制原字节后再验证，原准备失败日志保留。没有将这些资产或历史压缩包修改加入提交。

## 实际准入阻塞和下一动作

库存不是可随手重写的生成表。`tests/helpers/integrated-ci-source.mjs:integratedPriorInventory` 严格比较 pinned `integrated-ci-source.json.gz` 的完整历史 JS/Lua inventory；`release-bootstrap-ci-source.mjs:assertReleaseBootstrapRawInventory` 也有固定 raw discovery。新增的原 M05 JS/Lua 入口触发拒绝，原 `abyss_node_ui_input.lua` 生产身份也拒绝。相同环境下精确还原基线 4 文件并暂移 2 个新入口，73/73 恢复；随后迁移文件逐字恢复（baseline-control.json）。

当前没有适用于该切片的通用 regeneration 命令。现有 `generate-shop-deck-source-epoch.mjs` 固定 903bf2a31 和五个其他生产文件，不可拿来覆盖本切片。不得修改旧 gzip/pin、删断言、排除 raw 测试，或从旧 Release 直接搬入整个历史桥。

下一位 source 接续 owner 需在真实目标组合中，为两个 Lua owner、布局脚本/布局测试和新增两个发现入口收集精确 before/current 完整绑定；使用已有精确 continuation/完整 collector 合同，保留原归档及所有 missing/empty/drift/foreign/warm 负控，并同步实际 copy closure。旧 #680 的 release-shop-dismissal-source/ci 包仅能作为格式和来源参考。`tests/helpers/combined-epoch/source-epoch-runtime.mjs`、`integrated-ci-source.mjs`、`release-bootstrap-ci-source.mjs` 及 copy closure 与其他 source 接续可能重叠，应由协调者明确划分 writer 后处理。本轮未改这些共享路径。

完整原始输出在 `validation-logs.tar.gz`，摘要/源文件身份在 `receipt.json`。Fast/related 只生成计划，没有执行全选集；已执行的是表中定向项。没有 Hosted CI、Full、GIL、官方导入/ready、PC/实体手机或发布结论。
