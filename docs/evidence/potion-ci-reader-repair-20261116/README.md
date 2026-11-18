# 药水组合 CI 读视图接续

本切片接续 PR #679 的 `10cfd7ac965c6aa2f640cdfac35c1149ac42c5c0`，其实际 Release 基线为 `33d71575c5f186a1b54f7bf3e4f1826c145aa1d9`。仅修复两处测试消费者的来源读视图，不修改产品、CI 配置、预算、原始历史 packet 或 Backlog 状态。

## 根因与最小修复

- `ci-complete-calibration.test.mjs` 先把当前生产文件逆投影到旧药水时代，又让 `closeoutRead/sourceSlice` 以最终组合的生产 owner 闭包认证它们。手势 owner 因而既不是当前字节，也不属于同一代输入。现在 CI 文件仍沿原历史链读取；生产文件及 architecture 以真实当前字节进入原 `sourceSlice`，由它原有的完整、新鲜认证后投影到各历史目标。
- 菜单通知测试保留的 `preMobilePotionSourceEpoch` 是原 116-owner / 352-input 时代，却直接比较最终组合中已更新的 frame 文件。现在先以同一 raw reader 经最终生产闭包认证，取得明确的 `mobilePotionPrior`，再用原时代的 projector 执行原断言及缺失、漂移和 foreign 负控。原 commit、owner 数、完整来源和历史 target 均未改写。
- 两个消费者的新旧完整来源保存在独立 `potion-post697-ci-reader-repair.json.gz`。before 必须逐字段等于原 CI packet 当前行；仅这两行辅助 current 接续，不改 view、产品 commit 或发现库存。原 packet 压缩哈希和所有历史绑定保留；每次完整认证还新鲜读取原 packet 和本 repair packet，暖调用不能缓存原件信任。

## 验证边界

本地 Node 24.19.0；先完成原生 helper LFS 原件检出，再运行原失败入口。原校准入口复现 14 项失败，含同一 `abyss_battle_card_gestures.lua` owner 错代；原菜单通知入口复现 frame 字节差异。首次组合诊断另有三个缺少 build 产物的环境失败，运行既有 `build:data` / `build:ui` 后校验。

本轮定向回归：完整校准文件、完整 session-menu 文件，以及现有六项 post697 union 合同（逐 owner、archive 缺失/漂移、暖授权、真实 raw reader 转发、完整 JS/Lua 库存与两个明确历史域）。guidance、Backlog 和 diff whitespace 独立检查。现有 post697 union 六项全部通过（含 42 绑定和 107 archives 的逐项暖缺失/漂移检查）；完整 session-menu 7/7 通过。完整校准 78/78 通过（192524ms）；原始日志由协调者在合前复核；不以本地定向代替当前 Hosted Required CI。

没有执行本地 Full、远端 push、自动合并或正式候选/设备/官方容量验收。产品文件与原提交逐 blob 一致。
