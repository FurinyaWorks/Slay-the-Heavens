# 录音三项战斗显示修复

目标：`release/v2.0.0`。本轮 Owner 明确要求以 release 为基线并授权管理员应急合并，优先于旧冻结路由。基线 release 为 `5991585aabde667eef9852b8c340c194c42a5c62`；develop 为 `345ba08398b6ca8e1361a126f2ce1de85210e634`，相关状态表/卡面层级/能量亮饰均未包含本轮修复。开始时开放 PR 只有 #792（版本说明），无同范围修复；此前生命值修复 #780 保持原样。

执行方案：先复现图标重复、零能量亮饰、费用球被遮罩覆盖，再修改展示表/绘制层级，串行定向验证、独立会话审查后合入 release。保持战斗数值、命令、输入和生命周期不变。Backlog CLI 不可用，未手改任务记录。

## STS1 行为基准与修复

- 01:38：状态具有可区分图形和层数；仪式改用卷轴105207，力量保留103047。正式基础41种及无色8类共49类唯一映射，包含任意序号Bomb实例。图标来自当前仓库已有官方图库记录（`ui_theme.officialAssets.battleRelicIcons`），是原生替代图，不是STS1贴图复刻。完整重复审计见 `status-audit.json`，实验职业主题别名不扩大为本轮新职业开发。
- 07:14：零能量关闭亮金装饰和光层，基础球体使用 `energyEmpty`；正能量及超额能量恢复完整亮球。数字保留清晰读数。仅读取真实能量值。
- 07:42：卡面继续由原有50%暗层覆盖；费用材质、数字与费用变化箭头排在遮罩之后。缺能量红字、降费绿字、无费用牌、循环复用均继续按原语义显示。

已有STS1卡面参考沿用 `scripts/sts-card-reference-profile.mjs` 的 Anger 实物几何来源；本轮验收要求来自Owner给出的录音时间点，当前会话未取得录音文件本体。不得把离线投影称为客户端截图。

## 可复现验证

```sh
npm ci --ignore-scripts
git lfs install --local
git lfs pull --include='art/characters/traveler-geo/portraits/**,art/lowpoly-select/**,tests/**/*.gz,docs/**/*.gz'
npm run setup:lua-static
node --test --test-concurrency=1 tests/sts-card-reference-runtime.test.mjs tests/relic-native-status-icons.test.mjs tests/official-assets-legibility.test.mjs
npm run check:engineering
```

新回归先在未修复代码上失败（图标重复、零能量装饰常亮、费用层级），然后通过；原有测试保留全部历史断言，仅同步费用材质寻址。新增精确before/after源码证据包用于重放历史测试，旧证据包不变；未知字节不能被投影，实时读回不一致必须拒绝。

初次完整npm test发现LFS指针未展开，随后中止，不能记为完整通过。初次并发定向运行曾争用共享生成目录，已中止并改为串行，不能使用该次结果。最终验证日志及独立评审固定SHA在PR中留存。

源码/离线原生控件验证不等于官方导入、当前ready或PC/手机实测。本轮没有接管用户桌面，没有写正式存档，没有发版；官方设备验收保持待验。

最终负向回归覆盖：wrapper使用相同reader二次读回时拒绝变更；fresh/current入口拒绝BASE旧样本或新旧混合。追加19/19通过（含原历史10项重放），基础/无色图标测试此前串行通过。语法、数据校验通过。工程检查遇基线既存 `abyss_battle_ui.lua` 的 `M.new` CC16>15，准确BASE原始源码独立测量同样16；本轮该文件零差异，未降低门槛。

并发集成：将release推进至 `1a60a09704ec8e0699cb2a705721b623545a5f09` 的 #793/#794/#795 合入本分支，保留其药水、详情延迟、排序与地图修复；本轮证据包before更新为此精确集成BASE。

最新组合回归：32项中31通过，唯一失败为原历史卡面重放的 `fresh current production owner: abyss_battle_detail_bindings.lua`。从精确最新BASE独立提取源码并复跑同一项，获得完全相同的actual/expected hash，确认由并行详情延迟修复引入的既存基线续接缺口；未跳过或弱化该断言。药水、详情延迟、排序/地图、状态/费用/能量及守卫负控均通过。`integrated.log.gz` 与 `latest-baseline.log.gz` 保留两份完整结果。

energy定向用例使用独立生成主题目录，避免覆盖后续测试的共享主题；官方界面完整runtime文件曾中止，不能记为完整通过。管理员应急合并与上述非全绿基线状态一并在PR记录。

最终合并前release再推进主菜单#797至 `89682d6f`。合并冲突仅为历史测试入口两处，保留双方import及按时间顺序的Combat→Menu→原链投影；生产文件无交集。续接包before再固定此BASE。重新构建数据/UI成功，重跑32项仍31通过及相同唯一基线detail_bindings失败（该文件在新BASE亦未变化），见 `latest-combination.log.gz`。原9a88独审与首次未成功的合并操作不冒充最终HEAD已合入。
