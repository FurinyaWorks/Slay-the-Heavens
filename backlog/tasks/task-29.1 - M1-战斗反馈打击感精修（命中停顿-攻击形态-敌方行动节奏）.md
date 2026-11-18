---
id: TASK-29.1
title: 打磨战斗动画、打击感和死亡音效
status: In Progress
assignee:
  - '@Furinya'
created_date: '2026-10-23 03:53'
updated_date: '2026-11-15 22:33'
labels:
  - enhancement
  - awaiting-live
  - 待验
  - delivery-verify
milestone: m-8
dependencies: []
references:
  - docs/backlog-details/TASK-29.1.md
  - docs/DELIVERY-CLOSEOUT.md
  - docs/AUDIO_RICHNESS.md
  - docs/BACKLOG-AUDIT-20261026.md
  - docs/plans/2026-10-30-battle-life.md
  - backlog/tasks/task-95 - 对照验证美术、交互与动效设计工具.md
  - docs/evidence/pc22-basic-feedback-20261116/README.md
  - docs/evidence/release-pc22-source-1116/README.md
  - docs/evidence/release-pc22-release1cc-1116/README.md
  - docs/evidence/release-pc22-ci-owner-repair-1116/README.md
parent_task_id: TASK-29
priority: medium
ordinal: 44000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
让出牌到命中更连贯，轻重攻击有区别，敌人行动顺序清楚。只打磨表现，不改战斗数值。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 出牌有蓄势和加速，命中瞬间衔接准确；重击和致命一击更有力度。
- [x] #2 普通、重击、多段、群攻、中毒和反伤有可区分的画面与声音。
- [x] #3 获得格挡、吸收攻击、破盾、状态和死亡有不同反馈；同时击杀时死亡音不重复。
- [x] #4 敌人依次蓄势、出手、命中、回位；非攻击动作不会演成攻击。
- [x] #5 表现不会越玩越卡，取消或演出故障后仍能正常操作，自动检查通过。
- [ ] #6 同一完整游戏候选已实际试玩并录制含声音录像，逐项审阅打击、格挡、状态、多段群攻、敌人行动及死亡音效，记录可接受结论或待修项；未试听不能完成。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
2026-10-24用户纠正：角色/怪物自身的行动发声必须独立于命中和死亡；不能只按伤害轻重选音，更不能将记忆中的原版一概写成每招同声。参考现有Cultist/Looter/JawWorm代码资料，补按definitionId固定的怪物行动音、角色统一出手音；每个intent/play最多一次，睡眠/眩晕/逃跑不叫，多段不逐击重叫。保留资料来源未认证和荧语音目录未证实的限制。

2026-10-29实际接受330后的剩余修复：以actualdevelop1dc33fe7（等同330999d）新建本地线性候选，已接受的死亡演出/5+5/共享drain/11输入见证及helper完全冻结。仅补共享结算入口缺失的已提交defeat且busy保护，带回已审查14项触摸/手柄与生命周期回归。添加只绑定GameUI的一文件精确逆层，顺序guard→accepteddeath→旧层；只在现有中央入口及两个直接证明读点接线，所有原断言/种子/30秒不变。强保全和远端2bc未知输入证明以独立加法测试保留，cd104/2bc/ee39恢复引用不删。先在实际新基线重现独立RED，再本地focused/工程验证；根任务负责新head/base独立审查和既有331发布，无push/force/newPR或实机声明。

2026-10-30 用户授权自主研发并合入：先修卡牌真实去向，再补旅行者与两类怪物待机和差异技能。四个独立工作树，生产路径回归、最终完整Quality和完整GIL；平台/实体手机/听验未测继续保留。

2026-11-16 PC22 owner合同有界诊断：在干净be91df3a7b192827f5ede3937c50fb5f18e9afcb工作树，仅用固定Node24.18.0串行运行Formation/Defect两个旧116-owner当前合同用例，读取真实sourceEpoch owners及新增owner；TEMP/TMP和完整stdout/stderr/receipt放主仓库外部artifacts/ci-owner-repair-1116/pc22-temp。只记录117闭包风险与根因，不改代码、CI、旧勾选或任务终态，不运行Full/Host/产品，不推送或改PR。

2026-11-16 根任务授权PC22最小适配：仅Formation/Defect两fixture，把旧116 case显式命名frozen pre-PC22并局部绑定冻结前层及reader，完整保留旧断言/循环；各新增真实磁盘117 case，证明仅CardFlow进入union及完整releasePc22BasicFeedbackPrior，并保留运行期读序/漂移/缺失保护。仅定向执行四个改名/新增case，记录RED与GREEN；不动session/生产/gzip/CI/门槛/工作流，不提交，待根任务和独审。

2026-11-16 根任务授权最外CI绑定接续：核实313d旧包20bindings并将完整旧包另存固定before-owner-repair档案；只绑定Formation/Defect新after及现有Source测试新after，缺失fixture的before取actual Release1cc真实Git前像，保全全部旧字段/旧before/历史档案。新增Source小合同证明档案字节、旧记录不变、仅两fixture与Source after变化及真实Git前像；仅跑受影响Source/CI小合同，不重跑四owner case，不动生产读取器/阈值/工作流，不提交推送，待独审。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-24用户指出只按招式/命中分音会漏角色与怪物自身发声。本轮读仓库已有Cultist/Looter/JawWorm资料，明确原版不是全动作统一一声；补23敌人按身份固定行动音、玩家统一动作音，每intent/play一次，睡眠/眩晕/逃跑静默，命中和死亡独立。荧战斗语音在目录未确认，未冒称剑动作音为语音。生产夹具17组通过；新增主题配置覆盖门禁，重建完整音频副本及全量回归进行中。用户已要求直接采用、后续不合适再改；不等待用户试听但不伪造实机证据。

行动声音切片e974c25完整check exit0：JS1092通过/118跳过、175个Lua夹具全部通过、Python22项1跳过；精修17组。23敌人和玩家行动音覆盖门禁通过，独立完整副本读回通过，hash71e5d4f034ac1f2f5d68488be62e0591793aa55392de2087e0be8f70fea9e5ac。用户要求直接采用，不等试听。随后集成develop最新界面；TASK-4并行任务说明完整保留develop版本，音频证据集中在本任务、34和专项文档，未丢玩法/界面改动。

最终与develop ead3513集成的冻结源277c2a8已重建完整音频副本，17组行动/命中/死亡与39组房间回归通过，全部模块逐byte、BGM双true、原生图及UI读回通过；hash04c0e28c40bab1e67620566a5eb3ad4ac19f7f53206a0effe317f0d0351fe6ac。详见docs/evidence/audio-richness-integrated-20261025.json。未官方导入/听验；用户要求先采用。

2026-10-26全面复核：已有实现及原回归支持的本地条款补勾，具体证据见BACKLOG-AUDIT。尚未通过的完整入口、组合/自然实玩或最终音画门禁保留，不重复要求开发已实现机制。

负责人字段规范化：原记录 @Codex 作为历史执行者信息保留；任务负责人为 Furinya。

2026-10-29已按实际接受330的1dc33fe7重缩331：本地产物只新增共享结算入口的一行phase=defeat且busy保护及已审查14回归/强证明；已接受的演出/5+5/共享等待/11输入JSON与helper逐字不动。新一文件精确外层先还原guard，再进入冻结accepteddeath和旧PR323；只改中央及两个直接证明读点，原断言/种子/预算不改，2bc有效未知输入证明完整保留。实际1dc上独立原生两阶段先RED（提前结算各1次）再GREEN2/2；6阶段、8生命周期、原5+5、动作8/卡牌11/药水9手势全部通过（各原30秒内，包含真实重开/mini-Neow/旧指针尾断言）。56项逆层/布局/严格79543/79757/81392写入合同零skip通过；语法与完整工程门禁通过：258模块/1440边/3955测量/948职责/37旧警告零新增/4变异/原生4项。ee39/2bc/cd104恢复引用及证据保留。未推送/强推/另建或关闭PR，未导入/键鼠/实机听验，平台AC不勾；根任务继续新实际base/head独立审查、Full及既有331发布。

2026-11-02最新排期：优先M4非美术、非交互设计工程。新增动效设计方案先取TASK-95对应实验结论；既有5项已完成AC及剩余同候选试听/设备验收不等待工具实验，已知错播、生命周期或性能缺陷继续修复，不重做已交付演出。 仅对应新增正式设计切片以实验结论为前置；未来纯设计优化子任务显式依赖TASK-95并引用适用Go结论。本混合任务不新增整任务硬依赖，原状态与AC保留。
2026-11-03 赛后排期：m-5 → M7 产品体验；任务状态与未验 AC 保留。旧比赛期限 '2026-10-28' 取消，未定新截止日。

2026-11-07 看板核对（develop 2c85bc61）：实现类交付已按历史记录保留，剩余 AC 待同候选官方/设备验证；当前无在途 PR，状态由 In Progress 归 To Do（待验）。

2026-11-14第二轮状态纠正：已有5/6项AC通过及既有实施证据，剩余未完成要求属于后续验证或接续。 状态表示整个任务的完成进展，不表示当前有执行者持续占用；保留原未验AC、负责人、依赖及历史证据。更正过去把已开展待验事项退回To Do的处理。

PC22冻结产品1b272（CardFlow单行ty-stop+三路径Lua）已完成产品独审；独立Fastmode/20ms与4stop边界通过，不宣称整shape连续。source249511已选择性组合197ef837，保留352路径/116旧owner/64旧目标/92档案，真实新union117/65，raw877JS/1424Lua；Source6/owner复制44/raw2/历史4/CI2及独立来源增审限定通过。15输入逐blob覆盖，原失败、官方profile旧polish对照和Fast内部npm事实完整归档。#692共同前置尚未实际合入，正式候选/ready/PC手机/官方容量未验，AC6不勾、任务In Progress；装饰精修延期。

#692现已实际合入Release1cc，PC22保留原bf264 history合流；当前代码147f85/绑定60be以新base独立复审通过，20CI before/after+10bootstrap/352完整Git等价与96档案保全，所有产品/productionepoch旧producer原样。原合流Source6pass3fail、首轮9pass1fail均保留；只修历史Lua视图，不弱化当前1424库存，受影响CI3/3与raw2/2通过，未虚报最终整套10/10。17当前输入覆盖；正式候选/ready/PC手机/官方容量及当前Hosted Full仍未验，任务继续In Progress，新#676不勾。

2026-11-16 PC22旧116合同诊断（HEAD be91df3）：固定Node v24.18.0仅运行指定Formation/Defect两case，2 tests/0pass/2fail/0skip，exit1；均在current owners完整名单断言处多出abyss_card_flow.lua（Formation:221、Defect:177）。只读真实sourceEpoch=117 owners，冻结前层116，唯一新增src/lua/abyss_card_flow.lua，无移除；352路径/65 targets，产品producer仍1b272ab7f57f2a8bde67fe8796d3a894445ae052。完整原字节stdout/stderr/receipt及owner清单在主仓库.artifacts/release-pc-qa-20261115/ci-owner-repair-1116/pc22-*；首次普通沙盒Node初始化0xC0000142空日志亦保留，提升后才取得上述case结果。只做复现，代码/CI/旧AC/任务状态未改，Full/Host/产品/官方及设备均未运行，待根任务已验证684方案后选择性适配。

2026-11-16 PC22两fixture最小适配已完成未提交：旧116改名frozen pre-PC22，函数体仅新增局部冻结epoch/reader，原断言与循环按LF逐字保全；另加真实磁盘117 case，明确只加CardFlow及完整releasePc22BasicFeedbackPrior。固定Node24.18串行pattern四case定向结果4/4 pass、0fail/0skip、exit0（48.994秒）；原两case RED不覆盖。完整stdout/stderr/receipt、精确diff pc22-owner-fixtures.patch、逐字保全证明pc22-frozen-preservation.json保存在主仓库.artifacts/release-pc-qa-20261115/ci-owner-repair-1116。仅Formation/Defect及本任务CLI记录变化；session、生产、gzip、CI/阈值/工作流未动，尚未重绑CI/提交/独审/Full/官方或设备验证。等待根任务复核安排独审；原AC/终态保持。

2026-11-16 PC22最外CI owner绑定已完成未提交：旧313d904a完整261413B原包另存ci-before-owner-repair并pin，旧20bindings中19完整不变，所有旧before不变；只新增Formation/Defect完整current及actual Release1cc真实Git before，并更新现有Source测试current。96旧archives全部保留，加旧包后97；新包d65e6170e254f376ca425035e489e89aedbedbd67d1585b1bd8bc611c991c610。依根任务新授权，CI捕获身份由true改false，role明确新after未提交/currentCommit仅历史CIproducer；原true/role完整留在旧包，其余metadata、生产epoch及producer不变。新增Source合同用实际Git blob固定值及完整源重算验证前像，无新增CI runtime git show依赖。固定Node24.18串行定向Source新case/CI live/rawinventory、integrated raw-current、CI-complete PC22 raw inventory共5/5 pass、0fail/0skip、exit0（21.722秒），原四owner GREEN未重复。完整日志/receipt/生成器及真实Git读回在主仓库.artifacts/release-pc-qa-20261115/ci-owner-repair-1116/pc22-*；生产、产品候选、阈值、workflow未改，Full/Hosted/Host/官方/设备未跑，尚未提交推送或独审，待根任务安排独审。

独立复审pc695_ci_fixture_repair通过15项检查：旧116函数体/当前117实际352源、旧313d原字节、22当前绑定与97档案全部核对；无blocking。4owner+5CI小合同通过、零skip。证据已入docs/evidence/release-pc22-ci-owner-repair-1116；本次仅CI合同，未新增实机验收，状态/旧AC不变。
<!-- SECTION:NOTES:END -->
