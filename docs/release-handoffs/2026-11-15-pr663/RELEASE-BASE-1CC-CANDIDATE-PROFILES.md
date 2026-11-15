# 2.0.0：新 Release 基线、构建配置与两个修复的定向验证

## 已落地

[#692](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/692) 的 PR Quick、Licenses 与 [Quality](https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43739972665) 均成功。Git 远端 Release 已读回 `1cc5479b713edab6fd26db4e20f8eb22b7401cb2`，其完整树与 #692 通过检查的头 `b67226945c2be47c8fff31f1362412b973f68875` 同为 `b5ec29f2b7718b0d4b6564afea03144a3f14a81e`。这是 CI 引导，不代表游戏修复或候选已合入。Release push 的独立运行未验证。

## 不能把预览配置当正式候选

#691 的原始源码减量以 `officialAssets:true, nativePageLifecycle:true` 测得；这两个选项目前在 **正式 `releaseCandidate:true` 路径被明确拒绝**。查验 Release、#684、#690、#691、#678、#679 的两个配置校验文件均为同一 blob。实际 [audio CLI 参数](formal-cli-profiles.log)显示，通常正式 CLI 是自定义背景开启、官方布局与原生页生命周期未开启；实验组合恰为背景关闭、官方布局和生命周期开启。正式 CLI 与此前预览证明不是同一配置。

在新 Release + #691 + 两个已交接补丁、并仅在干净隔离树补齐 **测试用** v2.0.0 元数据后，真实 native builder 在**明确默认/零自定义素材**配置生成了 24 个文件，校验通过至第一个本地假 SDK 哨兵。没有连接 SDK、生成真 GIL 或通过真机测试。验证只覆盖正式预构建及版本读取，不把该测试树/测试更新日志当正式输入，也不宣称完整默认 audio CLI 出包通过。[探针](probe-formal.mjs) · [日志](formal-preflight.log)。

**合并线下一步**：冻结实际要发的配置与版本号/更新日志。若沿用现有正式配置，只使用该配置重建并测同一候选；若产品确定必须采用目前仍属实验的官方布局或页生命周期，需单独显式批准与实现配置晋升，连同重建、音频、读回、导入和设备验证一起走，不能靠去掉 `--release-candidate` 或跳过防线冒充正式。两条路都不能复用 640,086 字节的预览生成结果作为正式包体证明。

## #678 小屋 × #679 药水

当前 Draft 两个生产改动共五个 Lua 文件，互不覆盖。基于实际 `1cc5479` 的仅产品组合完成定向验证：小屋默认及官方布局分别通过，药水在重新生成实际基线布局后通过。未混入其他产品 PR 或测试源闭包。两 Draft 单独的库存同为 877 JS / 1424 Lua，但新增文件不同，最终必须同时保留 `tiny-house-pending-ui.test.mjs`、`tiny_house_pending_ui.lua`、`potion-popup-click-payload.test.mjs`、`potion_popup_click_payload.lua`；仅这两项的正确合成计数是 **878 JS / 1425 Lua**，还要验证文件身份，不能只验证计数。#678 对新 Release 有三处 CI 冲突；两 Draft 之间有六处来源/CI 冲突，待最终一次性认证组合，不是可直接发布的合并头。[来源清单](rehearsal-manifest.json) · [定向日志](cottage-potion-functional.log)。

本轮未重跑 Full，未修改在途 PR、源档案或真正的发布身份。

## #684 的新基线接续

真实 `1cc5479` 与旧 #692 头逐字同树，另建隔离候选 `17859b1fbc1f190763bf012777b6adfbfa6ba0ae`（未提交到产品 PR）。复用经来源验证的 52 绑定 / 95 个旧档案，首次定向运行原完整文件的物理 guard 和当前清单用例，**2/2**：887 JS / 1431 Lua；Windows 45 分钟、本地特例 75 分钟、POSIX 30 分钟的实际执行守卫和 12 个反例保留。Windows/Linux 估算只是诊断，不代替 hosted 完成。未重跑前六个旧来源测试或 Full。[日志](pc-calibration-1cc.log) · [身份](pc-combination-identity-1cc.json)。
