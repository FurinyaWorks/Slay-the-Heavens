# 独立产品组合审查

结论：**CODE_SCOPE_PASS_WITH_LIMITS**。冻结组合范围内未确认新增回归；这不是整体准入、Full 或发布许可。

- base：`36b9b157ee6f05b65eb9f1da7e2978647d36c210`；产品：`df5ad3dc3b8b02e56d93a4dfe394b103dc0498e9`；产品树：`39c6802faf6c7cc7156f4aa04ea00e3b08ebaed7`。
- 仅证据归档 head：`2cb6206e608d972f3c3e876cfcd804bb04ff7da2`；归档树：`962c58f7dae35ea401829d81bc8935380c033e4a`。
- 分支 `feat/release-pc-item-title-shadow-1116`，树 `F:/New folder/.worktrees/release-pc-item-title-shadow-1116`，唯一目标 `release/v2.0.0`。
- 审查者 /root/release_items_product_review；未参与实现，只写本根.artifacts报告/探针。

## 来源与唯一增量

PC18 / PC21 / PC01 共29个映射路径中28个与来源Git blob严格相等；唯一奖励Lua差异仅两个689 helper与单个relic调用，逆移严格等于c41。三个来源生产路径不重叠。独立结果逐路径blob见JSON及 combined-independent/result.json。df5新增两个测试文件；不引入689 root共享布局、Task38.8状态、源/CI适配器、PC20或后续idle/health painter。

## 独立执行与本轮证据

独立真实生产Reward/Art+合成句柄探针：c41 missing/throw各exit1，fallback/oldPool均true；df5各exit0，fallback=true/oldPool=false。这是小范围行为负控，既不运行Host整组，也不代表官方像素。首次依赖路径错误6项MODULE_NOT_FOUND另存，未算RED。

另独立核72gzip/24run，以及6005物理文件（5320源码输入+684依赖+1Luacheck），当前输入仍匹配df5。许可原门禁本轮exit0；LICENSE及原checker未变。三条W431仅位置+3及上值48→51，其身份数量与门槛未放宽。两个归档verify执行通过，只证明归档完整。

读取本组合真实日志与输入绑定：icons5/5（139alias、25fallback）；shadow2/2；menu6/6、hover、41四态/结算断言、三profile生成全树Host。retirement最终2个新VM各36case，37.75s/41.86s内通过，完整Run/data/RNG和peer16图元快照均在实际测试中；旧单VM72矩阵60s超时保留，不能称整Host压力通过。工程351模块/6169测量/1993边，无新诊断；daily0error+5增长warning。preview16=10PASS/5源FAIL/1可选SKIP。

## 完整产品与测试路径覆盖

| 路径 | 审查内容 |
|---|---|
| `config/luacheck-baseline.json` | Only three pre-existing W431 diagnostics relocate +3 lines/upvalue 48->51. Same warning identity/count, no threshold/config relaxation. |
| `data/presentation/lowcost-potion-art.json` | Exact reviewed PC18 full-source42 recipes (competition33 + preserved9); bounded native primitive geometry, no source-pool expansion. |
| `data/presentation/lowcost-relic-art.json` | Exact PC18 original88 +33 recipes; 121 recipes preserve full-source content; source149 public IDs=120 recipe-backed +29 native IDs, not121 current-pool IDs. |
| `data/presentation/menu-title-mark.json` | Exact reviewed static title triangles; no new font file/private raster. Source physical SHA retained in source evidence. |
| `data/presentation/ui_theme.json` | Only five approved menu tokens changed: labelX, hoverSeconds, leaveSeconds, lineRestAlpha, accent. Other palette/gameplay state untouched. |
| `docs/backlog-details/RELEASE-PC-ITEM-ICONS-20261115.md` | Source-only receipt/integration description; pool-container vs recipe vs official capacity distinction and source/fallback/alias limitations preserved. |
| `docs/legal/assets.json` | Adds provenance category only; explicitly retains project noncommercial license and game IP limits. No clearance claim or hash-rule weakening. |
| `scripts/build-ui.mjs` | Pass actual officialAssets flag into existing portrait attach; default flags preserved. |
| `scripts/lowcost-art.mjs` | Adds potion registry and only existing potion/reward owners; separate four-state reward owners retained; all glyph pools non-input, capacity10/16/32. |
| `scripts/official-portraits.mjs` | One groundShadow first child of original officialFigure only officialAssets+battlePortrait; approved solid foot [1.5,-93],127x15.875; reuses lagavulin oval/palette. |
| `scripts/potion-art.mjs` | Validates exact registered42/current33 scope, colour-independent geometry uniqueness, rotated bounds and10-slot capacity. |
| `scripts/v25-menu-layout.mjs` | Static mark/backing beneath existing hit/label owners; immediate four-state arrows/rule; idempotent; original background and transactions preserved. |
| `src/lua/abyss_battle_render_actors.lua` | Only potion bottle art paint/empty cleanup; prior item selection, tint, gestures and command state unchanged. |
| `src/lua/abyss_battle_reward_layout.lua` | Authority-first sourceId resolver remains exact PC18; unknown/no-data fallback retained, potion branch unchanged. Only new production delta is689 verbatim hidePool/paintShared + one relic call; cached same-owner alive old pool retires on lookup loss/replacement; native fallback exposed. |
| `src/lua/abyss_feedback_actor_painter.lua` | Player-only ground-shadow tint shares existing alpha; parent already owns transforms, readiness, pause/death/restart/release lifecycle; no enemy host access. |
| `src/lua/abyss_node_ui.lua` | Restore native relic fallback visible before optional Art.paint; no gameplay command writes. |
| `src/lua/abyss_node_ui_shop.lua` | Forward existing options to shop painter only. |
| `src/lua/abyss_potion_discard_ui.lua` | Potion entry paints current recipe at profile size, hides art for empty slot; no consumption/selection changes. |
| `src/lua/abyss_relic_view_ui.lua` | Native picture visibility restored on every refresh before optional art, supporting missing/failed same-ID fallback. |
| `src/lua/abyss_shop_ui.lua` | Potion native unknown fallback + optional semantic paint; transaction logic untouched. |
| `tests/helpers/potion-art-runtime.lua` | Real generated pool42 full recipes + six representatives across four existing potion paths; failure/cache/fallback boundaries, source-equivalent. |
| `tests/helpers/relic-fallback-runtime.lua` | 25 checks across shop/treasure/single/list and gold transition; proves fallback restoration, not lookup-lost old pool retirement. |
| `tests/helpers/reward-alias-runtime.lua` | 13 authority aliases x2rows x4states, source-first conflicts/unknowns/no-data previews =>139 checks; full Run/data/RNG deep equality. |
| `tests/helpers/reward-art-runtime.lua` | Real Host reward2rows x4states, potion binding/same atlas recipe switch, caches, failed setter/native fallback, unknown/empty; gold/key/card isolation. |
| `tests/helpers/reward-pool-retirement-runtime.lua` | New36 cases per row:4states x(6 same/change missing/dead/throw +replacement +cached foreign old handle +destroyed inaccessible old handle); peer16shape visibility/geometry/color deep snapshot and complete Run/data/RNG equality. |
| `tests/lowcost-art.test.mjs` | Preserves88/enemy data identities, exact recipe set/capacity/rotated bounds; real painter/cache/reentry contract uses unchanged existing Art. |
| `tests/lua/player_ground_shadow.lua` | Generated real portrait7303 rows; anchor/idle/action geometry, alpha, enemy isolation, pause/continue/new-run/release/destroy and Run/RNG invariance. |
| `tests/menu-red-background.cases.mjs` | Existing hits preserved, static title/batching budget/idempotence, backing order, immediate four states and triangle affine vertices; does not assert Continue dynamic accent animation. |
| `tests/player-ground-shadow.test.mjs` | Exact +1 non-input child, original other-tree equivalence, disabled flags, source geometry/palette and actual portrait Host fixture. |
| `tests/potion-art-runtime.test.mjs` | Five current combination cases: pool counts/default+0, real rewards,42recipessixsamples,25fallback,139alias; original timeouts retained. |
| `tests/potion-art.test.mjs` | Exact sampler/definition42 vs33, metadata and high-confusion colour-independent geometry negative controls. |
| `tests/reward-pool-retirement-runtime.test.mjs` | Two fresh generated Host/Fengari VMs, one existing row each. Each retains60s; final37.75s/41.86s. Split lowers per-VM unrelated work, not deadline relaxation; old72-case timeout retained. |

## 可执行证据路径

- `docs/evidence/release-pc-ground-shadow-20261115/verify.mjs`：Read entire verifier; executed archive-only. Hash+decompression and old scoped review/result validation; full required_not_run explicit. Not a fresh product rerun.
- `docs/evidence/release-pc-menu-title-20261115/profiles.mjs`：Read entire executable harness; uses current buildUI,3profiles generated full trees, exact menuRedScene background, existing unmodified C-tier session fixture; real existing luaTimeoutMs.default. Writes build outputs and chosen evidence dir. Archived current run was inspected; not rerun here.
- `docs/evidence/release-pc-item-title-shadow-20261116/verify.mjs`：Read entire verifier; executed archive-only. Verifies72gzip/24run; checks receipt counts/statements, explicitly prints ARCHIVE_HASH_PASS_ONLY and sourceCi UNVERIFIED. It trusts continuation booleans; independent git blob/reversal check here supplies that missing derivation.

这些.mjs均按执行代码审查，不作说明文档免审。所有变更路径和Git blob清单在JSON中。组合verify对continuation布尔值本身只是断言；本审查额外从Git独立重算blob/helper/逆向等价，避免把自述当证明。

## 继承边界

人工让池parent转属却保留原owner查找索引时，c41/df5底层Art均写foreign pool两次。限定核现有fixture生命周期：recycle保持同grid owner，或destroy后同grid新建；奖励为固定兄弟池，未发现自然reparent/recycle可达复现。因此只记录合成继承边界，不列新增回归、不扩大本片。新增foreign用例仅证明“缓存旧池已转属、当前索引已换成新池”时不写旧池，不能泛称所有foreign lookup无写。

既有Continue动态menuAccent未推进的源探针问题不属本片引入/修复；41断言不是Continue动态动画验收。原图/私图未看，数据JSON和几何唯一不等于正式像素可辨识。32/55是池容器数；每glyph槽容量relic16/enemy32/potion10，不是官方MB。149公开遗物ID=120配方+29原生；121配方保留full-source，药水42=当前33+保留9，原88遗物及敌人42保留。

## 未验边界

源合同5FAIL使source/CI仍UNVERIFIED；本审查不覆盖另一树准备中的接续适配器。HostedFull未运行。候选写回、官方导入、新ready、PC/手机、20MB/3MB、RC静态/动态均未验证；无GUI/MCP/外部变更、PR/Tag/发布。689和本组无论先合哪边，后续都需新基线单一binding集成；689的+28控件数不能认证本组每态拓扑。Task38.8保持689/未合673既有归属。
