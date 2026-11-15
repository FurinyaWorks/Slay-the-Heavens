# TASK-38.5：小屋奖励页复用状态修复

任务合同：PR #673 的 `TASK-38.5`，文档提交 `e52eb52b2d2fa878202a0be12c73fb1efb6e6ec0`。实施基线为 `develop c2409ad750c15124b7b843c6bbfa5b222537cb75`；未合并该文档分支。该任务尚未进入基线，`task:pick` 返回身份不存在 HOLD；按 Owner 明确允许的只读合同独立开发，不复制任务、不冒写认领或 Done，待 #673 合入后用 Backlog CLI 同步。

## 证据与规则

- Owner 本轮重新确认此前及本次手机均为 iPhone 14 Pro；原图为 2556×1179。IMG_1407 SHA 前缀 `65249520661b` 显示空白遗物选择页，IMG_1408 `d489382ae586` 显示小屋说明。原图含 UID，仅本地保存，不提交。
- 原图对应候选/source SHA 未绑定；图上四条空行与当前源码每页最多三项不是同一已证身份。这里证明当前代码的同类复用缺陷，不声称还原了旧候选全部轨迹，也不为凑四行改变分页规则。
- 核对固定原版镜像 [relics/TinyHouse.java](https://github.com/aeubanks/sts/blob/319009d5df0a82d9fb0f23cc22322286c6a87ec0/relics/TinyHouse.java)，下载原字节 SHA256 `325b33e5b14511b4173296b43ea47f87173f0ff327b1c030e12851166e36fc95`，与既有 `docs/rules/evidence/sts1-relic-source-identity.json` 一致。小屋随机升级一张可升级牌、增加5生命上限，并打开50金币、随机药水等合法奖励；普通卡奖语义沿用 [BOSS_RELICS](../rules/BOSS_RELICS.md)。无支付代价。本修复不改规则、随机流、奖励事务或候选池。

## 可证根因与最小修复

`GameUI.new` 只创建一次 NodeUI，后续在同一个 nodePanel 上重复渲染。Neow 的真实 writer 会隐藏普通标题/说明、启用专用 `stsNeowText`、移动 body 到气泡并改为深色墨水，同时改变选项位置和热区。原 pending writer 只写入文本，没有恢复这些状态，因此 fresh UI 中能通过的奖励，在已经经历 Neow 的控件树中仍可能不可见。

增加窄适配器 `EventUI.renderChoices`，pending 复用已有普通事件的 frame、选项布局和文字 writer；普通 `renderEvent` 路径保持原样。官方紧凑布局继续使用已有行内说明；默认布局保留原分行。动作 owner、过期令牌、三项分页及真实 Run 命令不变。分页沿用现有按钮，以画布安全边距摆放，防止官方模板中底行与分页命中区重叠；普通事件仍由既有 bindFooter 恢复位置。

## 本轮验证

- `node --test tests/tiny-house-pending-ui.test.mjs`：默认/official-assets-first 两种真实 builder 输出，2/2通过；同一 GameUI 经真实 Neow 按钮，受控首领完成与队首输入后走公开 enter/open/claim，小屋奖励可读、热区和文字几何一致、分页不压行。覆盖多行→单行 Continue→无 pending、过期回调、满药水槽失败不授予/可恢复、隐藏重开、奖励各结算一次、未处理前拒绝跨幕、处理后第二幕地图。再以既有合法事件夹具绑定该同一控件树，验证普通事件 footer 复位及 Dolly's Mirror 重入。受控首领完成、队首、替换 Run 的事件输入不是自然游玩证据。
- RED：同样的生成树和回归脚本预加载 `origin/develop` 的原 pending 模块，两档均因 `pending heading remains hidden after Neow` 非零；GREEN 使用当前实现，两档通过。额外几何断言曾发现官方分页热区重叠13px，修正后再回归，未放宽断言。
- `node --test tests/official-neow-navigation-retirement.test.mjs tests/boss-relics-missing.test.mjs`：4/4 通过，包含默认/官方 Neow 退役重开、首领遗物真实规则与失败回滚。
- `node scripts/test-lua.mjs` 分别运行 `shop_relics_pending_ui.lua`（9项）、`neow_entry_ui.lua`（8项）、`act1_event_ui.lua`（11项）、`relic_card_rewards_ui.lua`：全部通过。原 shop pending 继续文字断言仅按真实行内/分行展示分别写完整预期，原动作与奖励断言保留。
- `npm run check:engineering`：351模块、6166测量、1989架构边通过；Luacheck 无新增诊断、保留6项明确历史告警；4项关键变异均由断言杀死；原生 UI 合同6/6通过。首次因新 worktree 缺 Luacheck 失败，按已有固定 hash 安装后通过，未放宽门禁。最后分页/适配器调整后重新运行源摘要对应的 `check-engineering.mjs`；这是静态三项重验，不冒称重新执行整套。
- `verify:backlog`、`check:guidance`、`git diff --check` 通过。受影响计划已读取；本地没有重复 Full，托管验证沿仓库现有路由，不加 `ci:full`。

本地原始证据在该 worktree 的 `.artifacts/mobile-cottage-p0-1115/`：`red.log`、`final-green-stable.log`、`engineering.log`、`engineering-adapter-final.log` 及核对字节的原版文件；不提交原版源码。附加后续事件回归最初直接修改冻结地图，得到合法 `invalid_snapshot` 拒绝；改用合法夹具后还发现测试漏绑 NodeUI owner。上述失败保留为 `failure-event-fixture.log`、`failure-incomplete-host-rebind.log` 等，修正测试输入后2/2通过，没有因此改变产品验证或放宽断言。

## 与在途 #672 的整合边界

#672 的 `1f7ce04c53189db8c39b59c797a45d57a2c7bac1` 没有修改 pending/小屋规则，但在同一 events 文件增加了 `mobileEventLayout`、`fitEventBody` 与 `placeOptions` 的 reading 参数。本修复保留普通 renderEvent 原调用路径，避免覆盖其在途工作；两者仍须正常整合复核，不宣称完全无交集。

隔离源码副本组合不触及 #672 工作树或候选。整合适配器时应将 `mobileEventLayout(ctx,event,id)` 传给 `placeOptions`；pending 还须复制该 reading 表，仅抬高其 `bottom` 为 `max(原bottom, -画布高/2 + safe.y + max(back高度, confirm高度) + space.s)`，为分页保留区域。其余字号、热区、间距、fitEventBody 和普通事件路径保持 #672 现值。直接仅传 reading 的负控确实出现92px手机热区与分页重叠，不能忽略此步骤。隔离修正后 official builder、真实 `touchScreen()` 返回 true 的组合回归1/1通过，见本地 `compat-mobile-reserved-footer.log`；早期缺输入/错误布尔平台夹具的失败日志同目录保留。该实验改动不在本实施分支，不能当作 #672 已验收；未来正常整合后须新 HEAD 独审与 CI。

## 未完成验收

独立复审与精确 HEAD 的远端 CI/自动合并按 PR 准入另记。没有新 GIL、候选写入/读回、官方导入/ready 或本轮候选 iPhone 14 Pro 实测；AC 保持未勾。当前成果为可独立合并的源码与离线回归修复，不代表手机问题已实机关闭。未修改 master、发布候选或发布记录。
