# TASK-4.4：M08 复合意图源码修复

本版范围：岩系旅行者第一、二幕。实施基线 `release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`，独立分支 `fix/mobile-intent-v2-1115`。沿用 TASK-4.4 的 In Progress、Furinya 和既有历史，只用 Backlog CLI 追加本切片计划/证据；PR #673 的新增 AC9/10 作为只读合同，没有复制未合任务内容或勾选手机 AC。

## 可证症状与根因

IMG_1403（SHA 前缀 `00713281e77e`）静态显示石颚兽详情“力量3、格挡6”，头顶只有蓝盾。Owner 已确认本轮设备为 iPhone 14 Pro；旧图候选尚未绑定当前源码，不由图片推断后台状态 ID。原图含 UID，不提交。

本轮用真实官方生成树、GameUI 与 `Run.startCombat('jaw_solo')`，核心真实 `endTurn` 一次后自然选到 `jaw_worm_3`。此刻敌人当前力量/格挡仍为0，尚未执行的详情包含3力量与6格挡；真实 actor 主图为盾 `102036`，`intentBadge`、`intentExtra` 均隐藏。`probe-red.log` 保存该观察及失败断言，未将未来意图误当当前状态。

规则元数据已包含 `DEFEND_BUFF`。`abyss_monster_source_intents.visual` 合法映射其 source 主图为 defend，但轻量 `selectedDescriptor` 没有保留强化角标，renderer 又无条件隐藏次要图像。不是 AI 没有加力量，也不是随机池或实体 ID 错误。

## 最小修复

- 只对 source enum `DEFEND_BUFF` 在 selected/displayed descriptor 中保留次要 `buff`。不运行未来效果预览，不改选招、伤害、力量、格挡、随机或当前状态。
- 复用原有 `intentBadge` 控件、主题 `intent.badge=22` 和既有 buff 图标，将它放到原主盾右侧；与主图使用相同 source alpha 和隐藏许可。其它 source enum 保留原单主图与攻击数字，`intentExtra`/旧文字标签仍隐藏。
- 主图、伤害文本、source hitbox 的位置/大小和 `EnemyView.geometry` 调用接口不变；图片/几何/可见性继续使用既有绑定缓存。纯 tint/badge helper 放在模块外层，避免增加原工厂跨度。
- 旧共享测试 helper 的“所有次图永远隐藏”与新 AC9 冲突，经协调者明确批准，迁移为仅原 source enum `DEFEND_BUFF` 允许且必须显示 buff 角标；图片、可见性、大小、净空都有显式断言。其它 enum、source 主图、攻击 tier/多段和 UNKNOWN/STUN 断言保留，不以被测 `face.badge` 自证。

## 本轮验证

- `node --test tests/mobile-composite-intent.test.mjs`：修前两档均因缺次要 metadata RED；最终默认/官方生成树2/2 GREEN。覆盖真实自然 Bellow、同源详情、原主图/命中几何、渲染不执行未来效果、重复刷新零图片/几何写入、真实 Host 结束回合结算3力量/6格挡一次、下一攻击退役角标且数字一致、换为普通 BUFF actor 后清理、Runic Dome 同时隐藏主图/角标/命中。
- 定向 `source-intent-descriptor`、`intent-geometry-cache`、`intent-visibility-cache`、`original-intent-power-hybrid`、`intent-face-clearance`：29/29通过，包括130个固定 source move、原版选中/显示生命周期、几何/可见性失败与重入负控、LF/CRLF、真实 Host 和净空。最终纯 helper 提取后再验两项缓存绑定2/2及新 Host2/2。
- `node scripts/check-engineering.mjs`：351模块、6166测量、1988架构边通过；Luacheck 无新增诊断，6项明确历史告警保留。这是静态三项，不宣称本轮运行整个 Full 或全套关键变异。首次 gate 拒绝构造工厂超过350行，保留失败日志；移出纯 helper 后按原阈值通过。
- `verify:backlog`、`check:guidance`、`git diff --check` 通过。Fast 计划因 Backlog 文件 unmodelled 要求 Full，按本轮成本边界未在本地重复 Full；Release 托管仍走现有 Full，不加 `ci:full`。

附加调用方检查有真实未通过项：`act2-intent-ui.test.mjs` 第一 slice 在其原30000ms预算内超时，未返回断言失败；同组历史14项完整字节见证和 `bosses-intent-ui` 通过。随后仅做一次同预算对照，预加载 Release 原两模块与原 `intent_face_assertion`，同一 slice 也在30000ms超时；检查时机器存在22个 Node 进程。该事实不能量化本补丁性能，也不把超时说成通过或归因已定。本地保留环境/时间未验，未改超时、切分、跳过或放宽原测试；精确 wrapper 须由远端 CI/独审有界核对。日志为 `mixed-enemy-regression.log`、`act2-baseline-30s.log`，对照脚本 `act2-baseline.mjs` 绑定原基线。

本地 `.artifacts/mobile-intent-v2-1115/` 保留 `probe-red.log`、`regression-red.log`、`regression-helper-final.log`、`source-geometry-regression.log`、`cache-binding-final.log`、`engineering-static.log`（首次失败）、`engineering-static-final.log`、Fast 计划。早期新增断言在 38.666… 图标边界遇到浮点比较误差，沿用原几何合同的0.001精度；另将原生 void listener 返回值检查改为实际状态进展检查，真实结算断言保留。

## 在途工作与未完成项

已核对 #672 与 `perf-enemy-geometry-1115@b56e1c39`：两者仍隐藏复合角标，没有覆盖 M08。性能分支在同 renderer 改 `EnemyView.geometry(actor,false)` 的两个调用，本切片没有改其接口或移植未审实现；后续正常整合须保留该性能调用及 #672 已修的 sleep/图标/生命周期，重新核对组合。

M09 只做受控事实记录：给真实敌人分别应用 `strength=1`、`ritual=1`，`Combat.statusView` 返回两个不同 ID，各有真实 native owner，却都使用 `103047` 且显示1。这不能确认旧录音实际是哪两个 buff，未重画状态图标、未新增资产或控件，也不标记 AC10 完成。

当前是源码与 mock 原生 API 的离线证据。独审、当前 Release HEAD/BASE 的托管 CI 另行准入；没有新 GIL、官方导入/ready、PC 或本轮候选 iPhone 14 Pro 实测，未勾设备 AC、未关闭 TASK-4.4。未改 master、候选、发布记录或门禁。
