# Release PC18：药水与遗物语义图标最小移植

唯一主任务 TASK-4.15，遗物资源复用 TASK-25.6；状态仍为待验。基线 `origin/release/v2.0.0@36b9b157ee6f05b65eb9f1da7e2978647d36c210`，独立树 `release-pc-item-icons-1115`。仅移植 `a27449ecef1f5e02034c22e677ed9f9a9bfe86aa` 的生产资源/入口及相关回归，不引入 #672 手机布局、idle、图鉴重构或历史证据包。

## 生产范围与身份

- 原通用 `abyss_lowcost_art` painter/固定池已经存在，不改其实现。新增 potion 注册与原有实时 owner 的生成池：战斗五槽、地图/节点统一入口五槽、商店三商品、战后药水和两个遗物奖励。五个 Lua 入口复用旧点击、确认、描述与规则。
- 当前 JSON 的药水是 **42 个唯一 ID/配方**（比赛 33 + full-source 保留 9），353 图元，单配方最多 10，固定池容量 10。不会把外职业药水加入比赛来源池。
- 遗物是 **121 个唯一 ID/配方**（原完整 88 + 新增 33），935 图元，单配方最多 14，固定池容量 16。原 88 全量 SHA 断言不变；新增 33 几何在去色后仍唯一。敌人仍是原 42 配方/689 图元，不改文件。
- **32/55 是生成的池容器数量，不是 ID、配方或页数**：standalone battle 32 = potion 24 + relic reward 8（400 个相关控件）；完整 official Host 55 = potion 47 + relic reward 8（653 个相关控件）。default profile 新增池为 0。控件/图元数不证明官方容量、GPU 或帧率。
- [精确生产来源](../evidence/release-pc-item-icons-20261115/production-source.json)绑定 10 文件 LF SHA256/Git blob 与原提交；全部逐字匹配。基线已有 lossless UTF8，不再改编码器或 image-mode。三条 Luacheck 诊断仅按同一源码原补丁从行 48 移到 51、各位置 +3，警告身份/数量和门槛不变。
- 资源为项目既有手绘原生图元配方，保留项目非商业许可、保留权利和原游戏 IP；没有新作美术、纹理或再分发字体。许可分类继续记录原作者来源。本片未复制原图集，原图集及其身份/许可证据保留于 a27449ec，未冒称本轮独立像素评审。

## 本轮真实验证

原始输出集中于 [本轮证据目录](../evidence/release-pc-item-icons-20261115/)，lossless gzip 原字节及 raw/gzip SHA256 见 `raw-output-identities.json`。首个提交 raw TAP 的引擎堆栈自带空白触发 diff 检查，后续仅压缩保存原字节纠正；没有改写失败内容。

- `red-with-dependencies.tap.gz`：应用生产修复前真实生成树为 0/0 池、实际 Host 奖励缺池及 Theme 缺 potion 注册，3/3 按预期失败。最初沙箱 spawn EPERM 与缺依赖记录分别保留于 `red.tap.gz`；它们不是行为 RED。之后物理复用已安装依赖，无新安装。
- `green.tap.gz`：同一运行时回归 3/3 与资源语义 guard 3/3，共 6/6 通过。42 配方全量绘制、四入口各六代表、所有 normal/hover/pressed/disabled 状态、商店同商品刷新、换槽/空槽、未知 ID、缺池/失效池/原生 setter 失败回退与显式恢复、两行遗物奖励及 source alias、非相关奖励不被清理、同帧缓存不重画均有断言。
- `lowcost.tap.gz`：2/2 通过，真实导入池全量 121 遗物 + 42 敌人，原生失败/重入/死亡淡出与目标变暗旧合同不变，旧 default 生成物不被夹具改写。
- `native-contract.tap.gz`：既有原生 UI/启动合同 6/6 通过，包含引擎只读 alive、真实 grid 销毁/回收、旧 handle 拒绝、Controller 退休负对照。它是 mock 原生 API，不是游戏或设备验收。
- `build-data.log.gz` / `build-ui.log.gz` 成功。`engineering.log.gz` 保留旧警告行身份失败；复用既有 hash 固定 Luacheck、应用原三行位置续接后的 `engineering-green.log.gz` 通过：351 模块、6165/6165 测量、1992 边，无新增静态诊断，6 条显式历史警告。
- `source-contract-current.tap.gz` **40/44，4 失败**：原 frozen source owner 合同拒绝已变更生产源码；没有修改/放宽 helper、旧 witness、预算或门槛，没有把它记为全回归通过。与 #684 的最终组合来源续接由主线程在依赖落地后一次完成，本片不复制 #672 的整套来源/CI 历史。

## 接续依赖与未验

本片基于 Release 可独立运行定向回归；#684 尚未合入时不把其药水 popup/商店修复当作本片依赖已通过。最终组合须处理相同 owner（尤其药水 popup 与商店）的补丁顺序，重新生成并做入口组合回归，形成精确 source SHA 的唯一来源续接、独立复审及既有 CI 准入。当前不推送、不开 PR、不运行 Full、不等待其 CI。

未构建本片完整候选，未官方导入、真实 ready、官方容量、PC 或手机实测；未获取私人原图、不伪造像素结论。旧 9b 的 20.1781 > 20 容量 FAIL 仍有效于旧候选，旧 7cb 的 19.78MB 不可转移。环境构建失败不再探索；没有 GUI、系统策略、MCP 工具改动、发布、Tag 或 develop/master 改动。PC18/原 AC 均未勾，代码合入也不代表设备或容量验收。

## 独审 P2 修正：遗物 fallback 丢失

独立评审 `/root/release_final_review` 在 `53cd7986` 实证：商店 old_coin 已成功显示语义图后，同商品再次刷新遇到 `iconArt` 查找缺失，原 image=105077 仍在但 iconVisible=false，导致图标消失；single 详情同症状。原独审 probe/失败 log 以 `review-item-icons-*gz` 保留，原始 SHA 在 raw-output-identities.json。此为真实缺口，原定向通过未覆盖，不能以此前通过覆盖独审失败。

- 最小生产修复增加两个可见性恢复写入：共享 `ctx.relicPicture` 先显示原图，随后有配方才由 painter 隐藏它，覆盖商店与宝箱（包括无 relic ID 的原有金币图）；`abyss_relic_view_ui` 的共享 picture 同样覆盖 single/list。没有改 painter、图标 ID/配方、布局、触点或事务。原 a274 移植十文件身份清单不变；这两个新增 owner 的 before/after 身份另见 `fallback-source.json`。
- 新增真实生成 Host/View 红例：shop/single/list × 原88代表 calling_bell / 新33代表 old_coin × missing/dead/throw 三类池失效，共 **18/18 按预期失败**，见 `relic-fallback-red.tap.gz`。首次对已绑定 Host 重建 View 导致重复 listener 的夹具错误另存 `relic-fallback-fixture-error.tap.gz`，修正为既有 lowcost 夹具同样的独立生成 View 后才取得业务 RED。
- 两处最小恢复后，新增三面矩阵和原 runtime/lowcost 共6/6通过，见 `relic-fallback-and-regression-green.tap.gz`。随后扩展真实 Nodes 宝箱为第四面，并发现 relic→gold 且缺池在只恢复非空 ID 时仍失败：24通过、1失败保留于 `relic-gold-fallback-red.tap.gz`；将 node 恢复放到 ID 分支前修复。未删任何旧断言。
- 最终四面 × 两组代表 × 三故障共24场景，加宝箱遗物→金币1场景，**25/25通过**，JS和Lua都断言精确分母。每场景覆盖同物品、切物品、非法 ID 的原图映射及池恢复重绘，另覆盖关闭重开；见 `relic-fallback-final-green.tap.gz`。原始生成 Host 使用 mock 原生 API，并非设备证据。
- 最终工程 `relic-fallback-final-engineering.log.gz` 再次通过：351模块、6165/6165测量、1992边、无新静态诊断。未重跑 Full、未新增来源/CI packet，最终组合与来源续接仍由主线程完成；待独立复审。所有设备、ready、容量及 AC 保持未验。
