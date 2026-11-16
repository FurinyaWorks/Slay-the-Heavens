---
id: TASK-103.2
title: 复核房间与事件视觉差异（流程切片已交付）
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-10 11:46'
updated_date: '2026-11-16 08:47'
labels:
  - 待验
  - delivery-verify
milestone: m-8
dependencies: []
references:
  - docs/evidence/release-pc-picker-controls-20261116/README.md
  - docs/evidence/release-picker-controls-source-1116/independent-review.json
  - docs/evidence/release-picker-controls-release1cc-1116/README.md
  - >-
    docs/evidence/release-picker-controls-release1cc-1116/independent-review.json
  - >-
    docs/evidence/release-picker-controls-release1cc-1116/metadata-only-receipt.json
  - >-
    https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/43762495111/job/132966457131
  - docs/evidence/release-picker-controls-ci-repair-1116/README.md
  - >-
    docs/evidence/release-picker-controls-ci-repair-1116/review696-independent.json
  - docs/evidence/release-selection-map-admission-1116/README.md
  - docs/evidence/release-selection-map-release1cc-1116/README.md
parent_task_id: TASK-103
priority: medium
ordinal: 169000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner明确追加授权接续地图优化，打磨两幕剧情事件及商店营地宝箱等房间页。复用已实现业务和#582生命周期，继承#603地图，不干扰#588战斗页；不新增规则或改变RNG/数值。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 真实事件和房间的视觉层次、选项状态、长文与多分支符合V25风格，逐屏实际截图自检。
- [x] #2 既有事件选择、费用奖励、卡牌选择、返回地图与同局状态回归通过。
- [x] #3 可交互Web Simulator入口及同源SDK连续操作/资源释放证据可复现；官方设备未测明确说明。
- [x] #4 独立PR和证据交付，不擅自合并或发布。
- [ ] #5 #676 拟议 TASK-103.7 AC1：在5卡、遗物、药水、删牌、售价/不足金币等完整商品布局中，卡面、物品icon、价格、交互命中区及提示互不压盖且Z序正确；截图08缺陷有RED→GREEN回归。
- [ ] #6 #676 拟议 TASK-103.7 AC2：固定原版卡牌选择语义与项目正式浏览器；商店删牌、营地升级、战斗看牌组的分页/滚动以现有可复用的正式方案为准，不能另造第三套、不靠盲猜滚动成本。
- [ ] #7 #676 拟议 TASK-103.7 AC3：连续购买、移除、分页、返回、取消和再次进入页面不出现未销毁旧控件、幽灵商品/重复结算；商品图标身份与 TASK-4.15 / #672 交叉验收。
- [ ] #8 #676 拟议 TASK-103.7 AC4：在PC目标尺寸、常见宽高比、手机受影响布局进行真实来源与像素检查；保留较长中文卡面、优惠与不同库存数量压力。
- [ ] #9 #676 拟议 TASK-103.7 AC5：逐项审查 #672 的 shop-shelf-clearance 及图标修复，不能把未合并或软件生成截图冒充正式候选实机通过。
- [ ] #10 #676 旧任务 TASK-103.2 AC5：PC实机截图02/05/07的返回战斗、事件继续、营地升级/奖励确认等按钮按既有批准全局设计复用，保持合法输入，避免锯齿、非统一边框、页内闪屏或文字截断；同候选PC/相关手机逐屏验收。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1.核查现有完整事件及#588范围，继承#603独立树。2.沿用V25左右叙事与四选项结构，先做真实剧情事件视觉身份、长文与禁用说明，再覆盖商店营地宝箱和选牌房间已有面。3.复用SDK/GameUI保存与浏览器Pixi真实渲染，逐屏查看并进行选择/返回/20次连续操作释放。4.保持规则与RNG，既有事件/房间回归、独审、独立PR和可交互入口，官方设备未测列明。

2026-11-16 PC30接续：核查现有正式浏览器与已批准Deck分页/操作按钮，最小复用4分页与2底部按钮，不替换动作/同局/数量规则；真实Host验证只读/删牌/营地与hover，独审后接续当前来源/CI与正常Release PR。

接续PR696当前45008d的真实CI失败：先定向复现official-choice-pagination旧整张picker布局断言；保留双卡面/锻造/columns等所有原字段断言，分别精确保护批准的共享Deck分页footer与default旧布局。只改既有测试及最外层CI after绑定，保全旧完整packet、before、全部archive并新增旧outer不可变pin；定向GREEN及独审后交主线程，不改产品/时限/workflow/清单，不勾新AC。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
已完成V25事件原生图章、四选项与完整药水说明、Neow尺寸和气泡、商店排布；真实SDK发现并修Match非法属性。最终source save afee98a1405542adcacd82906b5e02808623671425b526375f9d2d176097fffd，35场景、20次事务、120增量、控件17310稳定且释放0；9张最终图经主代理与独审逐张查看。证据 docs/evidence/event-v25-20261110/。官方GIL副本已编码读回静态通过，verify:ui缺同候选startup证据，官方设备未测不判通过。

最终可交互紧凑预览 http://127.0.0.1:4186/editor/play#event-v25-final 已真实浏览器指针验证：120→85治疗、设计师四项、七入口、页面错误0；测试导航重置场景，预览地图只读。完整GameUI同局证据另用SDK。

独立Draft PR #605 https://github.com/FurinyaWorks/Slay-the-Abyss/pull/605 已建立，继承#603/#582以develop为基线触发Required CI；没有自动合并或发布。独审10文件及9图无新增P1/P2。实现及证据已交付，任务保持In Progress等待Full CI及官方验收；本地全量未完成，不宣称Full通过。

Owner要求集中减负：2026-11-10旧PR/分支入口已关闭或清理，唯一剩余组合入口#607，CI减负入口#606。完整来源、精确SHA和恢复方法见docs/backlog-details/INTEGRATION-CLOSEOUT-20261110.json；10份M7独立切片只是保全待接续，未进入主线，UI组合也未验收。沿集中入口处理，不为同一来源再开平行PR；当前未勾AC和状态保持。

集中接续#607已吸收最新事件来源d218f27b相对4eed增量：房间身份层、页面内容与既有实测记录完整保留，组合验证另做，不沿用原分支绿灯。

整片独立复审纠正：最新d218 revision-2已撤回上一版视觉结论，AC1仍未完成；取消旧勾选，保留In Progress和原实测证据。源码组合通过不替代视觉/官方设备验收。

2026-11-14逐项对账：607/634已接入事件与房间，AC2-4保持已勾；revision-2撤回AC1视觉结论，当前仅此缺口未完成，后续652宝箱修复继续原PR，不重做事件流程。

2026-11-14第二轮状态纠正：已有3/4项AC通过及既有实施证据，剩余未完成要求属于后续验证或接续。 状态表示整个任务的完成进展，不表示当前有执行者持续占用；保留原未验AC、负责人、依赖及历史证据。更正过去把已开展待验事项退回To Do的处理。

2026-11-13 本轮反馈源码3ce7a682：普通事件复用styleEvent、去重复正文且保留错误；奖励条目复用圆角材质/旗帜按钮与rewardRows token。真实SDK自然7屏到首战及卡组/抽牌/空弃牌完成，祝福198次绘制0遮罩；受控奖励normal/hover/领取、两次排序返回及Lab三药+离开实测通过（仅SDK，非官方设备）。原始证据与验收边界见 docs/evidence/sts-feedback-20261113/README.md。主菜单按本次用户指示排除，官方导入/ready/手机要求保持未完成；通过现有精确SHA复审和CI后挂自动合并。

最终产品切片 fa7273ec：原生旧列表保留校准时序，原native6+官方复用3共9/9，原断言未改；来源10+隔离1和最终自然SDK7屏全部通过，祝福227帧0遮罩、空弃牌可开关。磁盘断连恢复后Git连通性、659项原始输入、存档及旧4档复核匹配；旧模拟器已停，新服务按最终源码重新启动。详细来源和未验证官方/设备边界保持在本轮README与source-checks.json。

2026-11-14 追加拒收已修于90c46efc：普通选项切角遮片排到装饰层后，上沿保留而不再溢出；大问号按事件换官方物品图，复用单一图片控件与主题映射。最终SDK大鱼/实验室5图、44/66/88三高度普通/悬停12组切角像素均通过，14官方图预取成功。新版试玩55316，旧62127保留至交付。源码来源10/10、隔离1/1和独审通过，证据在docs/evidence/sts-feedback-20261113/。官方与设备验收仍未完成；按用户授权送正常自动合并门禁。

Full43473829313失败后已用原入口暂停授权并续修。真实冷列表提前ready的P1修于ab895b0c：按文档可见索引+不同存活控件准入，保空弃牌与warm排序。新SDK自然7屏/181祝福帧0cover、controlled17卡266排序帧0cover通过；旧55316已停，新56606可玩。Full旧合同按明确新要求续接并保原before全文、原业务/RNG/输入断言和预算；source10与repair binding复验通过，Defect隔离旧H身份明确保留。按用户最新指示不扩测，收口后立即重新挂正常自动合并，不等待整轮CI。

PC30产品93ae7376/证据707da8ff，default44x208/56x44与原触点不变；official复用既有200x48 Deck分页和flagButton，真实Host只读14牌、移除5页/末页/旧tap/取消/仅一次收费、锻造2变1页及C档通过。初真实hover遮挡P2修于93ae，6项定向与四画布独审CODE_SCOPE通过，原RED保留。source/CI接续中，尚未推PR；不扩大到PR685远虑多选，不将画布模拟冒充官方PC手机，原3项历史已勾AC保留、所有新#676 AC未勾。

分页代码与最小source在Release36独立树已组合，产品93ae/源9ff各自证据分开；产品独审PASS、source独审待，所有新PC/手机AC保持未勾。PR692入场共同前置尚未合，当前来源packet不能认证它实际落地后的组合，正常PR仍待该基线接续。

PC30产品/来源双层独审现均通过，组合20项输入coverage无遗漏，报告分别见product independent-review与release-picker-controls-source independent-review。原3项历史checked保留，新#676视觉/正式PC手机条件仍未勾。原共有前置692尚未合，本片先保全并等待实际新Release before接续，不重复造任务或草稿占位。

2026-11-16 #692已实际合入Release 1cc5479b（父36b9）；本片4bfcc426/base1cc新来源独审SOURCE_CI_REVIEW_PASS，25 before/after、10 bootstrap、352来源及96 pin均核对。当前raw878JS/1423Lua与历史876JS/1423Lua分开；Source8/owner7/raw2为本轮原验证，本次仅归档不重跑。见本轮README、independent-review.json及metadata-only-receipt.json。原失败/P2 RED、历史已勾与全部新#676未勾保持；正式PC手机、官方ready及容量仍未验，不给发布PASS。

PR696 CI有界修复已定向GREEN待独审：原official-choice首项因两页old previous/next整体比较RED；保留锻造/删牌全部非页脚字段、双卡面与nativeTheme快照，分别精确断言批准200x48 footer及default原56x44/44x208。首项+default2/2，outer当前/旧包/库存/硬门槛5/5；中间两次fixture RED如实保留。新CI包6e63658f，26绑定/97archive；旧8f63全包原字节另存pin，24/25旧绑定完整不变，全部before/旧archive/元数据库存保全；新after honest worktree capture(false)，旧producer只历史基点。生产/时限/workflow未动，无新Host/Full/官方设备或截图实测，不扩认此前独审7cases为本轮。待主线程独立复审与正常原PR新CI，旧checked与新#676未勾保持。

PR696分页fixture接续独立复审PASS：未参与实现的pc695 reviewer完成15项结构/实际Git前像/物理绑定/档案/主题/任务状态检查，26当前绑定与97档案一致，旧8f63整包及24旧after/全部before保全，未改产品/工作流/耗时，保原全部AC与In Progress。评审凭据已归档docs/evidence/release-picker-controls-ci-repair-1116/review696-independent.json；裸log被既有*.log忽略，5份原日志用base64 .log.json原字节封装，manifest按实际LF待提交字节记录。原2/2与5/5测试仅复用本轮日志未重跑；新SHA CI及正式候选/设备/ready/容量仍待验。

PC08 Release36最小产品70664a69/证据e7fa已选择性组合至74a598；共享最终选角四态旗帜，保留旧命令、触点和焦点许可。11定向与独立对抗probe通过，PC04+PC08组合5/5通过；565cb735来源接续有独立复审，21项代码/合同加1项可执行证据逐blob核对。PC08像素/正式ready/PC手机与容量未验；PC19仅已有bcca切片的controlled golden_wing option3 leave held Continue已验证可复用，golden_idol双步无heldfooter，不代表私图05或所有事件已修。仍In Progress，不勾新AC。

#692已实际合入Release1cc，PC04/08旧9b703分支保留history合流；代码eafcaeee/绑定80e1d3ec新base独立增审通过。352生产Git等价、26CI before/after+10bootstrap/96档案保全，产品8路径/旧production producer原样。原合流6pass3CI fail完整保留，来源10/10与两侧raw2/2通过，当前23代码/合同输入及原1可执行证据逐blob追踪。官方像素、PC04批准HUD backing位置、新ready/PC手机/容量及当前Hosted Full仍未验，不因#692合入勾AC。
<!-- SECTION:NOTES:END -->
