# Release 旧 PR 归档续接

核对基线为 `release/v2.0.0@91d6f955e16dcf91d24971450abaa72d12a4efa3`。四条均有独立成果。原执行线为 FurinyaDev，Backlog 负责人沿用 Furinya。退役时记录 FROZEN，并保全原引用。下列来源均为完整 Git SHA。

## #699 · PC01、PC18、PC21

保留 `feat/release-pc-item-title-shadow-1116@8d4e5c4a690ef8ccec4f4914e7ebe063523a0d96`。当前有 14 处冲突，旧聚合检查失败。历史准确检出曾超过 128 MiB，后续只对实际新候选核同一门禁。

- PC01 菜单标题和四态以 `c41b162b1d01069d7f78f647a28a6ca70a9d8097` 为源。已准备本地 `codex/release-menu-title-699-prep@eb6ab67402cb86c72da616d0f16d078d8a79ac81`，源树 `217ede6730435c54f61dedd2bba970a9806eb22f`，旧准备基线 `cdf5fe42fa7962f004966842e05d8ab35781df31`。原正向用例、10 项菜单运行测试、三配置真实生成及两套 Host 路径通过。默认界面 JSON 逐字相同，Official/V25 各加 456 个菜单控件及 324,615 生成字节。恢复时按实际 Release 重接主题历史，正常走 Full 和正式候选容量及画面验收。
- 跨面本地校准 78/81。三项失败均拒绝已合 #695 的官方 HUD 字节，且在不含 PC01 的 #711 精确头 `1a6dfc30d6726eaeea45bde78c4d8c93eed9d81c` 独立复现。后续沿修复后的实际 Release 接续，保留三项历史断言及当前 HUD。
- PC18 物品图案、原生 fallback、权威身份及旧池退休依次保留 `e862006570fb957e63b38499719cd130e6139e76`、`36f8ffb0be7588071f489f46effc63323dee2271`、`fb6b6ca6887ae2444d47666f3e1dc429616d5a83`、`df5ad3dc3b8b02e56d93a4dfe394b103dc0498e9`。先独立接奖励与遗物身份及必要 fallback，再与 #689 的共享奖励接缝验证，保留物品表现与奖励/RNG边界。
- PC21 接地阴影以 `ae96ff957dc0a1252ecd6da4fc12be5a3210c47c` 为源。复用 `2167162ef8fd5cc58e79ce9b713a2f1f4aa55f98` 和 `c34443bcd56350fbe7a2bc9396bcdc9090d2dddb` 的真实生成夹具隔离，覆盖单阴影、脚点、死亡透明度和生命周期。保留基于实际 Release 的库存、候选及设备验收。

## #696 · 选牌分页与确认

保留 `feat/release-pc-picker-controls-1116@e9866fece8a01ed5fd5dc5530d8b4d9da4bbc9bc`。原 `a925ce43bda10030d7dfd7fe7b96c450c17f8702` 共享分页及确认，`93ae73760ecbe6540fac49d96c2309345d6b7824` 修复悬停遮挡页脚。以这两个已完成来源接续 TASK-103.2。#697 地图返回已交付。实际 Release 尚无 `scripts/official-picker-controls.mjs`，分页/页脚仍待合。现有 9 处冲突位于历史校验，旧绿灯留作旧基线证据。保留 `tests/release-picker-controls.test.mjs` 和原生成 Host/C 档、跨页 UID、遮挡负控。

## #690 · 退出指南与重复地图入口

保留 `feat/release-pc-navigation-1115@cd9106c0e302cb50f83ba8b5c85ce81560c6ed88`。产品来源 `a9425afa50e2a1dd10e83634a3e5fc0d24633917` 接续 TASK-88.1。先保留四个布局/运行时文件协同移除旧操作指南，然后按 profile 收口重复地图入口，保留非 Official 的地图后备和现有退出确认/结算。实际 Release 仍生成帮助按钮和导引。#697 地图返回和 #695 图标已交付，收口时沿用。现有 9 处历史冲突，旧精确头 Quality 43979432717 的 check 与 engineering-posix 均红。沿原退出/暂停/生成地图用例验证，保留只读地图返回和手柄 Cancel。

## #689 · 蓝蜡烛与共享奖励图案

保留 `fix/mobile-blue-candle-v2-1115@30ead25768a2522be9ae9a1fac105b8c56fba67a`。产品源 `23bed75c642f8f4af5c2783526a5afc4a57f471f`，修正跨状态图案归属和退役 `658aef31ebdfb1e06224a542ae306275d05953c4`。优先取已归档的独立准备头 `f443b829f5b022cc95d61a3e67730d36924baf23` 的独立四文件补丁、真红/绿结果及独审。现 Release 仍按状态持有 fallback，旧 PR 有 10 处冲突含 lowcost-art 产品。以当前四状态图案/fallback、图池替换、旧布局和单行 16 槽测试接续 TASK-38.8，再对接 PC18 物品身份。

#711 原候选已冻结，三项历史 HUD 校准已由 #737 修复。四条来源均保存在当前归档历史。恢复时使用实际目标基线与新候选的原生验证。
