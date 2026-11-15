# TASK-4.22 / M17：能量装饰层同步（Develop 后续）

## 范围与依赖

Owner 授权的非发版后续窄切片，来源为 PR #673 M17 的只读报告。任务仍为 In Progress，原手机验收 AC 不勾选。2026-11-15 拉取的 `origin/develop=c2409ad750c15124b7b843c6bbfa5b222537cb75` 不含 `src/lua/abyss_mobile_hud.lua`；该布局属于在途 #672 `1f7ce04c53189db8c39b59c797a45d57a2c7bac1`。本分支不复制其运行时、不新建 PR、不影响 Release，附件补丁须待依赖落地后重新应用、验证并独审。

## 可证症状与最小改动

使用真实官方资源生成树、现有 GameUI fixture 与 Host，从 `cultist_solo` 战斗读取控件父链变换，而非据 IMG1400 猜测点选错位：

| 源码条件 | Icon / 数字中心 | Ring / Disc 中心 | 2556×1179 物理中心 |
| --- | --- | --- | --- |
| Release `36b9b157`，touch / 非 touch | (-511,-233) | (-511,-233) | (441.2375,971.0375) |
| #672，非 touch | (-511,-233) | (-511,-233) | (441.2375,971.0375) |
| #672，touch 修前 | (-511,-180) | (-511,-233) | Icon (441.2375,884.25)，装饰层低 86.7875px |
| #672，touch 附件补丁后 | (-511,-180) | (-511,-180) | (441.2375,884.25) |

`piles()` 原先只更新 Icon / 数字；可见 Ring / Disc 留在旧坐标，相差 53 设计单位。附件仅追加四行，将存在的 Ring / Disc 设为同一 `hud.energy` 坐标；维持原 Icon / 数字严格路径。样式、颜色、图像、大小、数字、规则及 draw hit 均未改。

抽牌父框、可见 glyph 与实际 hit 在移动版均同心 (-552,-272)，hit 为 88×88 设计单位。装饰层没有该抽牌动作监听。未证明 draw hit 错位或真实误点，故不宣称发版阻塞。

## 附件与复验

- [四行隔离补丁](../evidence/mobile-energy-layers-20261115/energy-layers.patch)：目标模块 LF-normalized Git blob `7b5c7f688715773fedfd97400f16ea6d00d41b38` → `34bba5c80c059d21f287d9be6987e4dbf5ed1cf3`。
- [真实树几何 fixture](../evidence/mobile-energy-layers-20261115/energy-layers.lua)、[有界执行器](../evidence/mobile-energy-layers-20261115/verify.mjs)、[结果与输入摘要](../evidence/mobile-energy-layers-20261115/receipt.json)。执行器只把目标模块暂存并应用补丁到本地 `.artifacts`，通过 preload 注入；不写入实际 `src/`。
- 执行入口：`node docs/evidence/mobile-energy-layers-20261115/verify.mjs --dependency-root <git archive 1f7ce04c 导出的源码目录>`。导出输入含 `src scripts tools data config art package.json package-lock.json .release-please-manifest.json CHANGELOG.md experiments/lumine-native-fit/fit-hybrid-final`，保留 builder 所需原始身份检查。当前 Develop 运行时与 Release `36b9b157` 逐 blob diff 为空，脚本保留该断言。
- 五档：Release touch / 非 touch PASS；#672 touch 修前以 `M17_ENERGY_LAYER_RED` 精确 RED；补丁后 touch / 非 touch PASS。每档检查战斗、菜单返回、取消退出、1280×720 与 2556×1179 resize；能量各层、draw glyph / hit 的实际世界坐标和原 hit 尺寸、同一 run / combat 与能量 / 牌堆 / HP / gold 均保持对应 oracle。补丁后另测 helper 缺可选 Ring / Disc 不异常，不声称完整官方树可缺强制节点。
- 原始日志保留 `.artifacts/mobile-energy-layers-develop-1115/verification/`。首次几何对照使用过含其他事件实验的快照，最终证据改用 `git archive` 精确导出的 #672 输入；不会将混合快照称作干净 #672。早期 driver blob header / CRLF 预检错误已纠正；精确导出的两次运行分别因漏出 builder 必需 experiments / 发布说明输入、Python renderer 而中止，补全原始文件后复验。另保留一次批准审核超时及 sandbox 子进程 EPERM 记录，均不是产品测试失败；未改变产品源码或预算。
- `verify:backlog`、`check:guidance`、Node 语法检查与 `git diff --check` 通过；未本地运行 Full，未增加 `ci:full`。

本轮无新 GIL 候选写入 / 官方导入 / ready / 手机实测。Owner 已确认设备为 iPhone 14 Pro，原图 2556×1179；这不是本补丁的手机 PASS。依赖合入后仍需新 HEAD 的复验、独审与独立 PR，当前交付为可恢复补丁及可信诊断附件。
