---
id: TASK-4.5
title: 修复格挡数字裁切，并按原版核实伤害预览
status: In Progress
assignee:
  - Furinya
created_date: '2026-10-24 12:17'
updated_date: '2026-11-15 12:37'
due_date: '2026-10-24'
labels:
  - awaiting-live
  - release-qa-20261101
  - release-blocker
  - 待验
milestone: m-8
dependencies: []
references:
  - docs/reviews/USER-PLAYTEST-20261024.md
  - docs/M3-NUMERIC-LIVE-20261024.md
  - docs/BACKLOG-AUDIT-20261026.md
  - docs/backlog-details/MOBILE-QA-20261028.md
  - docs/backlog-details/MOBILE-RELEASE-QA-20261101.md
  - docs/backlog-details/TASK-42-PC-CLOSEOUT-HANDOFF-20261115.md
parent_task_id: TASK-4
priority: medium
type: bug
ordinal: 86000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
用户实机发现格挡10只显示1，需要完整显示多位数字。伤害预览按核实后的原版语义验收：普通手牌包含玩家修正，瞄准敌人时加入目标易伤，取消或状态移除后恢复。具体证据和相邻排查见docs/reviews/USER-PLAYTEST-20261024.md。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 玩家及敌人的格挡1、10、99、100和999均完整可读，不遮住血条或相邻敌人。
- [x] #2 普通手牌按玩家修正显示，瞄准具体敌人时才加入易伤；取消或状态移除后恢复原版数值。
- [x] #3 保留旧数字裁切和预览问题的自动红绿回归，现有布局与预览专项通过。
- [ ] #4 以当前统一格挡位置版本的同源候选实机截图确认格挡与预览两项修复。
- [ ] #5 分别实测点选和拖动瞄准目标的预览及结算，记录实际差异。
- [ ] #6 无其他修正的基础6普通攻击进入明确待出牌目标状态后，易伤敌人的当前牌面在出牌提交前显示9，切至普通敌人显示6、切回显示9；不能只在结算时正确，也不能把同一目标修正套到整手牌。
- [ ] #7 同候选分别记录手机点选与实际拖动、PC点击携牌／拖放、已支持手柄选牌切目标的预览和确认顺序；按固定源核实映射，保留取消、移出目标、切牌和状态变化后的数值恢复，预览不扣能量、不移牌、不造成伤害。
- [ ] #8 按本轮图11/12同局手牌和真实力量/弱化/目标条件核实全力进攻禁用、说明及下降箭头；取消/切牌后预览恢复，不改平衡、不凭灰态判bug，有同候选证据。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
保留原版普通手牌/瞄准/取消区分，撤回尚未提交的整手牌目标修正试改。格挡按位数拓宽，窄敌列采用不挤压生命数字的排布；同根因状态层数和抽弃牌行高补统一门禁。保留旧版证红、定向回归与同候选实机证据。

用户追加要求格挡位置一致：移除窄列搬至头像分支；参照固定AbstractCreature.renderHealth/renderBlockIconAndValue的血条左端锚定关系，扩大敌人行可用跨度，列内预留三位格挡区域；增加1到5敌人/首领多位数字、同高、无重叠回归。

2026-11-14 续做原生source敌人格挡数字回退：先通过当前真实monsterActor Host证实100/999框宽问题；仅修source数字容量与左侧锚定，保留原图、血条、输入、数值/预览规则，并覆盖1–5敌人/Boss相邻净空和零格挡隐藏。取得独立复审后仅本地feat/native-block-digits保存；原设备AC4–7未验不勾，不推送、不PR、不集成。

接续未修产品问题：不止保留DIAGNOSED。先核清source HP绝对几何不可变是否真实Owner批准约束；用户原plan已允许扩大敌人行可用跨度。研究仅显示readout布局的最小可行重排，继续保持格挡统一HP左侧/同高、不挪头像、不缩字、不改actor art/hit/source事实或核心规则；用同一原版/候选真实case和全部邻接/状态/手牌净空断言验收。候选必须消除而非转移失败，再做源码/负控/来源及独审，可推送但不PR/集成。另复核当前明确目标6→9→6/取消恢复的实际Host preview条款，设备仍不能冒充。

接续未完成格挡源布局：先复用现有数值夹具与当前原生source UnitView/MonsterActor入口，准备独立只读诊断存档，固定1/10/99/100/999格挡和999/999生命、1至5敌人/首领及真实手牌，保留原画/命中/核心规则。目的取得当前原生字体/裁剪的真实可见证据，不能只凭保守离线矩形认定像素结果或放宽旧合同；诊断覆盖与候选写入读回完成后再提供Windows路径由Owner选择手动导入。无需/不得操作客户端，实际导入/字号/截屏/手机仍未验；成果仅自有独立分支，不PR/集成/发布。

当前基线已变：origin/develop e65d9b98fbec69442047650254238cd9244df805（#661合入）。只读对比确认EnemyView/PowerView/RenderActors及主题已更新，后续数值诊断必须从e65新独立分支做，不自动移入272计数适配、不把9f2旧Gremlin/HP失败冒充当前结果；原272和历史NoGo证据保留。当前UnitView/sourceGeometry虽相同，仍须重建最新显示路径同条件case与最终候选身份。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
用户随后要求先核实原版。固定AbstractPlayer.renderHand 1678-1715证明calculateCardDamage目标后渲染，随后applyPowers还原；普通手牌不直接算敌方易伤是正确语义。补瞄准/取消/目标状态移除/玩家力量虚弱恢复回归15组通过。格挡旧版真实树证红hero clips Block10；首次拓宽又被相邻生命容量契约证红enemy1 clips HP while showing Block10，改窄列放入画像下角，保留完整生命带，55组UI含动画均绿。全项实机尚未复验，不勾AC。

本轮76bbefa数字视觉夹具官方导入1846，29号新日志24条含两次ready/六阶段/complete/正式结算。玩家及五敌1/10/99/100/999、Boss100与240/240、状态和牌堆10实际截图完整；用户帮助启动，自动启动失败保留。仅数字显示复验，预览/普通奖励及整体UI未验。详见docs/M3-NUMERIC-LIVE-20261024.md。后续develop拖牌同步b6d3cbe另有15预览/53UI回归通过，截图不认证全部新组合。

2026-10-24 用户追加一致性修正：移除窄列搬格挡到头像分支，按固定AbstractCreature血条左端锚定；敌人行-192～512，固定预留三位格挡空间，生命位置不随格挡变化。先红后绿；53战斗UI、15预览、10反馈及13主题/布局回归通过。源码依据与验证边界见docs/reviews/consistent-block-layout.md；未导入/实机，不勾AC。

2026-10-26全面复核：本轮53个原战斗UI用例和card_preview通过，已交付布局/领取/跳过/预览条款补勾；当前版实机截图与设备条款仍保留。

2026-10-26将原混合AC2分成自动回归已通过和当前版实机待验，原要求完整保留。

负责人字段规范化：原记录 @Codex 作为历史执行者信息保留；任务负责人为 Furinya。

PR #304：手机反馈瞄准易伤目标时伤害未更新；离线拖动对照预览及结算均为9，用户实玩时实际瞄准状态未确认；PC和手机分别复验，勿先断言公式错误。

2026-10-29 详细验收承接附件§6：触屏点选、明确目标、实际拖动瞄准、目标变化与取消分别核验。普通整手牌仅有玩家修正，当前待出目标牌在明确瞄准时才显示目标修正并与结算一致，取消恢复；不把一个默认target套整手牌、不先改伤害公式。调查中的Strike6→拖瞄9→结算9只证明该受控链路，不等于用户那次状态或新候选实机已通过。

2026-11-01 Bug3：用户要求直接按固定STS1源码完成选牌／选目标／出牌前数值预览，重点是手机点选与拖动。已复核aeubanks/sts@319009d5：鼠标有携牌后确认及拖放，手柄切换hoveredMonster后renderHand会先计算目标伤害再绘制；源码含触屏分支。当前2d06741卡面currentAim只接moving gesture/carry，手柄目标Focus仅更新owner.target，存在明确非拖动目标接线缺口；不将其冒认为本次手机现场完整根因。源位置与对照见新附件；本镜像renderHand准确行号1730–1766（核心1761–1764），旧排版行号保留历史。原离线AC与尚未完成实机AC保持。

2026-11-07 看板核对（develop 2c85bc61）：实现类交付已按历史记录保留，剩余 AC 待同候选官方/设备验证；当前无在途 PR，状态由 In Progress 归 To Do（待验）。

task:pick ALLOW；当前开放PR661/663/664及新665–668未持有abyss_battle_unit_view.lua，独立复核发现source分支忽略已有动态chip宽度，固定64 source px可能使三位格挡回退裁剪。只在新.worktrees/native-block-digits排查，保留原已通过旧路径及设备未验边界。

2026-11-14 新source显示路径当前真实Host复核：固定42.667宽忽略chip，24号三位按项目预算需47.2；两组同条件实验原版容量/自身HP/邻接失败32/98/24，内存扩宽左移候选0/0/96，因扩大邻接故障已否决。仅DIAGNOSED，生产源码/正式tests/build/config与9f2逐字无差异；并非产品修复或官方裁剪实测。完整脚本与372项输入/输出身份、原始失败、两组4场景15实例及主控浏览器对照在本地feat/native-block-digits@fdcf0e7c094420f313f64d15c4fcc17255342d12，附件TASK-4.5-NATIVE-BLOCK-DIAGNOSIS-20261114.md。独审/root/batch_review:4.5-diagnosis:fdcf0e7c0944:20261114 PASS仅诊断；独立校验全部摘要/原始计数通过，其复跑受Node子进程EPERM限制未算成功。旧AC1证据不覆盖新source故撤勾，AC2/3旧预览/回归保留，设备4–7未验。不恢复头像搬移方案，不缩字、不调source阵形或删断言；未推送/PR/集成。

2026-11-14 Owner追加明确允许推送、禁止PR。本分支feat/native-block-digits@fdcf0e7c094420f313f64d15c4fcc17255342d12已普通原子推送origin，随后ls-remote逐SHA读回一致。仅远端保存；没有创建PR、启用自动合并、合入develop/master或发版，原AC与任务状态保持。

本轮继续推进4.5，/root/relic_room_implementation与/root/batch_review分别做可行显示布局/批准边界交叉核查；尚未改生产。原NoGo及失败断言完整保留，不再把小修被否决当任务停点。

2026-11-15 独立窄切片已推送feat/native-block-readout@272770424ebfb01651418b665a8faaee0a8be548，远端ls-remote同SHA且树clean；仅修abyss_monster_power_view的countY原生右上字体预算投影，未采用任何已NoGo的HP横向铺开/双带排布。固定源与独审证实原方向偏下；按本项目20字/40top框投影中心到amountY+20是明确native适配，不冒充未取得的04b03原GDX H0或原生像素实测。新2/2、来源3/3及相关9/9通过，367输入/160闭包逐hash、静态/架构与exactHEAD ratchet1Lua零新违规通过；独审/root/batch_review:4.5-native-power-count:272770424ebf:20261115 PASS unresolved=[]。完整1/5/10手牌Lots旧0/2/4→新0/0/0，Gremlin旧0/1/4→新0/0/2仍失败且明确保留，不能称整体布局完成；HP999/多位Block/相邻净空、原GDX度量与设备AC仍未完成。来源/红绿/原始失败和NoGo在该分支docs/backlog-details/TASK-4.5-NATIVE-POWER-COUNT-20261115.md及docs/evidence/native-power-count-alignment-20261115。仅自有branch保存，无PR/集成/发版。

已核e65最新版：nativeFloorY/bodyScale/Power两列与overflow/LowCostArt路径均与旧272不同。原先已推count窄切片只适用于其明示基线，未合入新develop。新诊断实施者先保留272干净旧树与分支，在空的metrics自有树安全新建feat/native-block-metrics-current@e65；不触碰发版工作树、不PR/合并。

当前e65离线诊断首次正常候选构建停在既有预检：官方applyOfficialAssets给MonsterActor加入portraitArt，而builder严格expected未应用同变换，35与34子控件不符；其余字节一致，尚未进入私有probe写入。保留原失败日志，不绕过断言。只在feat/native-block-metrics-current修复该预检的来源构造并补正反控，再用真实离线GIL全量读回；游戏源码/显示规则保持e65，工具修复commit与游戏sourceBase分别记录。不操作客户端，不PR/集成。

离线构建预检修复已冻结自有a9ab37e60ecca89982bc57b6c164d0b36d56ad33，仅builder和正反控2文件；复用完整official变换构造expected，保留唯一actor与完整JSON精确比较。独审/root/batch_review:4.5-builder:a9ab37e60ecc:20261115 PASS unresolved=[]；真实buildUI双profile及负控通过，root既有builder回归23/23通过。此为构建器子集，不等于诊断GIL、实际裁切或设备验收；整任务AC保持未完成。

Owner最新指令暂缓前端样式/显示优化，转后端。停止新增数值显示实验和候选重构建；已完成的离线诊断首失败/首成功及工具冻结保留，toolDirty首次候选不冒称干净HEAD实机验收。a9构建器严格预检修复及独审/回归保持有效；产品格挡与设备AC继续未完成。

纯构建工具修复已单独推送feat/official-actor-build-check，ls-remote精确a9ab37e60ecca89982bc57b6c164d0b36d56ad33；仅2files，不含UI/诊断代码，独审及23回归通过。显示诊断仅本地591919acc58d321ea772d1c6c108ee55b12903f4保存，ON_HOLD/非集成候选且不推送；未clean重构建/官方验收，不外推首dirty候选身份。无PR/合并。

减负复核补记：当前PR663准备线已在build-native-candidate以attachLowCostArt(actorSource)修复同一official模板预检，root只读核实该段。故独立a9后端修复仅保留历史/诊断，不再作为待集成补丁，避免与主线重复；图标原子切片不夹带a9或591。当前发版receipt的真实profile已核为official-assets-battle-v2，图标绑定按此现有路径验证。

承接C3；可能合法禁用/负修正尚未证实本次异常根因，不能声称已经修好。
<!-- SECTION:NOTES:END -->
