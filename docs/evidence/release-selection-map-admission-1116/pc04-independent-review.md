# PC04 选角旧暗层独立复审

结论：**PASS_SCOPED**。唯一生产改动在 official 组合时隐藏遗留 `officialBackdropVeil`；未发现本范围产品阻断问题。该结论只覆盖源码/已存生成树/模拟 native 生命周期与 Host 输入，不能把 PC04、TASK-103.3 AC4 或实际暗化验收标 Done，不授合并/发布许可。

## 精确范围

- base：`36b9b157ee6f05b65eb9f1da7e2978647d36c210`。
- 产品：`0a56adc5471991ea90aa92d021aad14386fe8a51`；补失败路径测试：`a3b066396c83342ed229e89d5972555f07f6ad93`。
- 最终证据 HEAD：`9b0d8a1720a7b402d94413f157fffcaab0819d9c`，树 `F:/New folder/.worktrees/release-pc-selection-layer-1116`；只读检查时 clean。后继提交只有证据/保存字节规则，没有扩大产品。
- 全差异 11 路径：生产 `scripts/noncombat-v25-layout.mjs`；测试 `tests/selection-overlay-scope.test.mjs`；`.gitattributes`；`docs/evidence/selection-layer-20261116/` 中 README、receipt、intake、profile-comparison、Host Lua/log、最终 RED/GREEN log 共8文件。
- 产品 blob `e47cbdd5ce135b7c0aef96fa5cf4e580a3f968e2`，base blob `ea8a1c0214b119429e22f46bd0a44bd66c72022a`。生产只有两行注释和一个 `visible=false`，无 Lua、Token、素材、输入几何或规则变更。

## 层级与写入职责

源码链 `attachOfficialBackdrops` 在旧选角底图之后放置全屏 `officialBackdropVeil`，1280×720、`#0F1117`、alpha128/255。V25 复用原先只隐藏 `veil/border/face/themes/scrim`，没有隐藏该 sibling；official 的批准主画面 host 后续放至 characterPanel child0。旧暗层位于 child3，在整幅主画面之上，child4 是独立 cursorArea blocker。

新代码运行于 `applyOfficialAssets → composeOfficialRun(kind=run) → applyOfficialNoncombatLayout`，只将该 paint 控件隐藏。不是删除/缩小 blocker，也不改变 sibling 顺序、图元、HUD/按钮/模态。源码检索没有 Lua 以该名字重新开启旧暗层的 writer。构造依赖来自既有正式 gameLayout，未引入新依赖。

实际各背景职责区分清楚：`lumineSelectionBackground` 为底层批准 native 图；`v25Background` 包含原 landscape 和0.35 veil，仅作 loading/failed/pause fallback；原 `veil` 已由 V25 layout 隐藏；遗留 `officialBackdropVeil` 是本次退休对象。真实 portrait 控制器的 official selectionFallback 只管理 v25Background 和旧 portraits，ready 后隐藏它们，故 **ready 时0.35 fallback=false，不是该已证叠层缺陷的原因**。不能据此断言私图暗化唯一根因已查明。

## 已核证据

1. **原始 RED 有效**：最终 `pc04-overlay-red-final.log` 是现有最终测试逆用精确 Release36 产品，2 RED/1 default PASS；含 `ready legacy=true fallback=false art=true` 和新增 failed 边界。反向重放脚本使用 try/finally 恢复产品；不是放宽旧断言。初稿 fixture 失败另存 root artifacts，README 已正确说明未归档入此目录。
2. **已有8/8 GREEN**：只读最终 `pc04-related-green.log` 与测试，未重跑整组。正常 building/ready/paused/reentry 与创建返回nil的 failed 均检查 legacy=false；ready为art=true/fallback=false，暂停/failed为art=false/fallback=true；缓存重入 created 不变、destroyed=0。`onEngineDestroy` 只作为旧暗层不会复活的检查，不将它泛称 art teardown 通过。
3. **输入闭环**：读取已存实际 Host probe Lua/log，菜单→选角→合法选择旅行者/岩→牌组与 pileReturn→退出菜单/放弃/取消→选角返回/再入→确认地图。牌组、退出覆盖期间 confirm 不建 Run；保留相应 blocker。Host未装真实官方 presentationReady，原生图控制器生命周期另由测试覆盖，二者不能合称官方 ready。
4. **四 profile 已存字节独立复核**：本审核没有重新构建。重算全部8个前后 JSON SHA，与作者表相同；default/candidate-art/v25 三者各自逐字节完全相同；official 递归差异严格只有 `root/controls/1/children/13/children/3/visible` 从未显式设置变false。原始比较脚本确从干净 Release36 的 source/data 构建基线并校验 HEAD。独立结果 `pc04-independent-generated-check.json`。
5. **独立最小失败探针实际运行**：沿最终测试的 synthetic native API，复用已存 official 生成目录、真实 `abyss_traveler_portraits`，只让 Instantiate 抛错。Node24/Fengari exit0；`phase=failed, legacy=false, fallback=true, art=false, ready=false, blocker=true`。与作者nil返回不同故障形式，没有重复8项/四profile生成/Full。脚本、Lua、原始log为 root `pc04-independent-failure.*`。
6. **归档身份**：最终 receipt 的7个文件 SHA256全部独立重算匹配，并用 `git hash-object --no-filters` 对比最终 HEAD blob，确认工作树与入库原始字节相同。`.gitattributes` 仅证据目录 `-text`、原始日志 `-whitespace`，用于保留 CRLF与断言输出，不涉及产品或测试豁免。

## 限制与未验事项

- 私图06仅核 manifest：`55a7399d6323fcab3d6c80b486295570db1d34a809172970c60d8013bfc6557e`，未访问像素/原视频，不声称原用户候选已由此复现或修好。
- 逐字稿02:45–03:19的独立HUD半透明层要求、30:52–31:36的选角暗化要求仍要各自验收。没有批准的HUD几何/透明度就不新增稿；本片仅移除已证全屏旧层，未完成其余HUD需求。
- native 创建、visibility、image与颜色写入是模拟 API，不是官方GPU绘制、实际遮挡/焦点、异步ready或手机效果。保留C档/原点选入口不等于设备已测。
- 本片 source/CI 适配、托管CI及正式Release门禁尚未完成。本审核未重复Full/Bootstrap。候选写入/读回、官方导入、新ready、PC/手机同候选路径、官方容量仍无本片证据，不能套用旧候选。
- 本审核未修改产品、Backlog、PR或GUI。保持 TASK-103.3 In Progress、AC4未勾；#672 actual 暗化仍未验，不从其整分支导入功能。

无待修产品 finding。证据说明的小误称（初稿失败日志“本目录”）已在最终 README 修正，且 receipt同步，不遗留为开放问题。
