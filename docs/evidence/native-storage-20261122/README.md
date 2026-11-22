# 本轮原生 Lua 无损减容

TASK-103；Owner 提供官方关卡校验失败截图 `20.97381 / 20MB` 后授权减容，随后明确要求同步远端、走管理员通道且不等待 CI。官方容量须由新候选复测，原消息截图不充当新包容量证据。

本轮最终目标经 Owner 更正为**仅合入 `release/v2.0.0`**。独立复核发现 BGM 对两份配置仍按未压缩原文比较，已用同一存储配置编码期望值，保留摘要及实际配置拒绝；新增真实 packed 配置成功/损坏读回/错误配置回归。更新后同组定向测试 76 项通过；CI 不作为本轮管理员例外的等待条件。

## 实现

- 正式官方资源构建启用 `nativeScriptStorage.profile=lossless-lua-v1`。普通历史配置保持原字节。
- 普通 Lua 仅移除注释和多余空白，逐 token 校验类型、值、行号；保留变量名和入口构建标记。
- 五份纯字面量数据以重复字段构造器及原 UTF-8 编码存储；各次调用产生独立表，无运行时 `load`、外部解压依赖或共享可变数组。
- 构建收据记录原始/实际打包字节与摘要，含入口构建标记；音频装配必须保持同一记录。固定来源审计从来源快照加载相同编码器再重建，原 UI/模块/图检查不放宽。

## 对照候选

被对照的 Release 来源为 `369d77e8fedf184532cd9af763458043821c175d`，旧 buildId `508d793f-2246-493a-a743-6cb30d6d13c4`。

| 项目 | 结果 |
| --- | --- |
| 原 GIL | 26,360,170 字节，SHA256 `7fdc5d3438784f6239ca9e254ba307466f0d37572e9fad62c3f532323f033d3b` |
| 本地派生减容包 | 24,887,601 字节，SHA256 `ba71581cbb999d4d975d844b93ecb333801fa613158f3c412187660a476bf20c` |
| 新 buildId | `3da6697a-c482-4c01-9b01-9a816075087e` |
| 原始文件差额 | 减少 1,472,569 字节 / 5.586%；不折算成官方 MB |
| 实际数据对照 | 五份数据 85,574 叶值、26,200 独立表全等，无新增数组别名 |
| 实际写后读回 | 366 模块；所有非脚本 GIL 字段和脚本 ID/文件名/参数元数据逐字节相同；静态 0 错误、433 警告 |

本地派生产物明确记录 `sourceDirty=true` 和优化器输入摘要，不冒称干净远端 RC。Windows 交付位置为主仓 `playtest/capacity-optimized-369d77e8.gil`；同名 JSON 和导入说明保存完整身份与本地证据路径。唯一原件及对照材料保留在 `fix/native-storage-1122` 工作树的 `build/storage-candidate-1122/`。

## 圆角和转场核查

实际 UI 段 20,381,145 字节。圆角按钮四态为在用反馈，1,140 控件 / 870,732 字节；旧完整 `prologuePanel` 已无实际控件；当前 `pageReveal` 为 9 控件 / 6,424 字节。隐藏旧 vista 为 28 控件 / 22,021 字节，仍有结算着色句柄引用。此次 UI 全量保留，不将隐藏控件数当作可删数量。

## 验证与未验项

- `node --test --test-concurrency=1 tests/native-script-storage.test.mjs tests/native-candidate.test.mjs tests/native-audio-release-provenance.test.mjs tests/native-bgm-build-provenance.test.mjs tests/native-candidate-audit.test.mjs`：73 项通过。
- `npm run check:syntax`、`npm run check:engineering`：通过；356 模块 / 6,554 测量，无新增 Luacheck 诊断，四项指定变异均杀死，7 项原生 UI 合同通过。
- 实际紧凑脚本执行 5 项官方布局 Host 合同：十牌双敌、拖放/取消/回合、商店与卡组浏览/分页、旧回调拒绝，全部通过。
- 5 项核心 packed 夹具通过。另一个不完整 Match 测试替身缺少 `GetChildren`，原脚本和紧凑脚本同样失败，均未计通过；完整 Host 证据单列。
- 本地 `npm run check` 达 30 分钟工具时限，Full 未完成；管理员合入是 Owner 明确授权的例外，不将跳过、排队或超时标为通过。
- 官方新候选 20MB/3MB、导入、当前 ready、音频试听、PC/实体手机和静态/动态负载仍待验。源码同步不等于平台发布，任务原 AC 保持未验。
