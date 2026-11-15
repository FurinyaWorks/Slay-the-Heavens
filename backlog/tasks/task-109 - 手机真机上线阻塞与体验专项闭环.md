---
id: TASK-109
title: 手机真机上线阻塞与体验专项闭环
status: In Progress
assignee:
  - Furinya
created_date: '2026-11-14 23:30'
updated_date: '2026-11-15 12:37'
labels: []
milestone: m-8
dependencies: []
references:
  - TASK-4
  - TASK-107
  - TASK-4.20
  - TASK-103.6
  - TASK-4.21
  - TASK-4.5
  - docs/backlog-details/TASK-42-PC-CLOSEOUT-HANDOFF-20261115.md
priority: medium
type: bug
ordinal: 181000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Owner约40分钟手机试玩与四张原始截图的专项闭环。先P0导航有效路径、设置可见与关键读数，再P1战斗结算/卡面/遗物/牌堆/预览/选择器，低风险图标及有证据的性能调查随后。复用在途成果，不改布局体系，不冒称手机复测。
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 P0退出/重开/续局始终有有效入口，设置可见且命中一致，关键数值完整并保留安全区
- [ ] #2 逐项复现P1并最小修复，有根因、回归、独审及按模块PR，未证实项明确保留
- [ ] #3 选择器评估同尺寸三张并修末页居中/分页边界/选择反馈，保留原主题及容量门槛
- [ ] #4 覆盖启动到正常退出及再开局、多尺寸/触点/字体；同场景同分辨率前后取证，官方与离线分开
- [ ] #5 交付已解决/在途/未解决14项矩阵及PR和上线风险，不无证归因发热/掉帧
- [ ] #6 本轮新be41或后继完整候选须重新官方容量/上传启动/ready与受影响实体手机验证；旧7cb19.78MB结论不得迁移，9b20.1781超限必须保留FAIL。
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1.核当前develop及PR，复用4.20/107/103.6；暂停663失败授权并修CI真实依赖。2.隔离P0状态机、设置与HUD切片，RED/GREEN/独审并按模块PR。3.推进P1结算、卡面和选择器，复用同源工具截图与预算，保留全来源历史。4.低成本P2及性能证据，未验手机项保持未完成。

5.按Owner最新反馈修原生旗形按钮轮廓并检查选角数字与图标占位，核查过场可见帧与真实准备时序；待各模块回归/独审与依赖收口后才统一生成候选。

6.Owner确认iPhone14Pro(2556x1179)，按393pt高/3x参考校准移动端实际字体与命中，优先已有抬牌/三张选牌及HUD命中，保持PC和整体布局。新增独立产品切片与RED/GREEN、独审，物理参考与官方真机分开。

7.Owner明确要求先交付可导入整合预览，完整复审/来源门禁/PR随后继续；以本轮GIL身份和静态证据交付，不等待全部验收，不声称官方或手机通过。

2026-11-15 PC补充：接收12张原截图并按图号归档，逐字记录时间点待原文。主线程统筹版本/证据/来源，战斗agent仅处理分裂实体位置及回归；商店agent仅布局与相交回归；加载agent仅共享生命周期。保留7cb可传包，修复另建组合候选，不新增快速出牌或发版。
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
第二批IMG1373-1381及首批共13张原图已保存在.artifacts/mobile-1115-user-baseline并计算SHA256。确认启动/运行异常共用failed()且停用控制器后titleQuit仍依赖原控制器；已实现独立原生退出请求，失败可再试、成功防重入、销毁退休，启动/更新注入2项RED→GREEN，邻近启动/美术生命周期10/10。截图的原始手机异常栈尚缺，本地最新日志仍是旧PC候选；不把恢复修复宣称原异常已定位。渲染切片41cfec52修playArea误按钮底板和禁用veil压字；HUD切片进行中。

Owner补PC同症状两张原图：pc-character-kuzXjw与pc-update-failure-aU3Tgl已归档。截图确认diagnostic phase=update，非启动失败。当前磁盘最新PC日志session07:41:25/build a0dfc8a3仅7条初始化记录，尚未含故障打印；已核15份历史并分别保留，未将旧SetAnchoredPosition inf报错冒充本次根因。等待当前会话日志导出，继续代码/离线回归。选角页遵从Owner进一步明确：背景/命之座自有，其余复用StS成熟控件布局，不新造按钮。P0独审发现并修正重复titleQuit listener，现single dispatcher且真实native touch Down/Up/Click链3/3通过；合并P0回归14/14，原始触发未宣称修复。

PC补充日志已完整落盘：2026-11-15T00:10:59Z，GIA SHA7dc9abc5317df0e01e2a89e67e115415ebf199bb8b2f424c158738c276f3b7f6，build8666c1a2，117s实际根因=确认清空局状态→nodeUI.run=nil→隐藏重置按钮→neowChoiceChrome仍读run.nodeFlow；cleanup也同错。原663808自动合并已按原入口暂停并读回。prepared一行Run退休保护b1c2cb0f已真实default/official生成树RED→GREEN4/4，独审NEOW-B1C2CB0F-1115-01通过；来源绑定与最终门禁接续中。该问题不是容量或图形性能猜测。

Owner最新实测确认放弃本局正常；同候选build2c8c6c70日志82条有ready且无failed/cleanup报错，保留为PC局部通过，不宣称手机或完整流程验收。Owner要求全部修复后再交一个完整GIL，暂停增量交包。新增同轮反馈：过场主观不足1秒、StS返回/启程轮廓2px矩形带导致锯齿；分别在原任务继续处理。未遗漏P0启动/退出/设置/HUD、P1结算/黑块/遗物/排序/禁用态/加载/菜单/预览/选择器及P2素材/性能，五项AC仍未完成。

本轮新增产品切片已提交且独审PASS：54dfd713三张同尺寸选牌/末页居中/页码/原生排序三角/暂停精简/黏液金币105077；c98f88ab选角旗面改原生三角仅+148控件、原hit/四态保留，理想投影不冒充nativeAA；0b5a2c40图标数字槽去重复前缀两profile RED→GREEN2/2；84060d48过场大dt吞七元素已复现并限制每次更新最多推进一个完成元素，elementStep=.2，原完整GameUI8/8含13过场通过，2.3秒仅逻辑时间。私有联合回归源96c766f7基于1a62按独立产品组合，19功能检查分别通过（唯一未先生成theme的夹具补构建后单独PASS，原失败日志保留），未推送/未发增量包。来源续接中，原bba0及旧generator不变。P2只读实测official boss最大92.16/hit96，不盲放大；抽弃65x67/消耗44x44，已有手牌抬起1.22预览和安全区通过，真实手机字体/AA/性能仍未验。证据集中.artifacts/mobile-1115-ci；#663仍open，依赖未落地的后续普通PR暂不违规创建占位Draft。

同候选PC 2c8c6c70日志确认长等待：14s battle portrait building owned0→32s revealing owned7459→36s ready（秒级日志约22s）；不是排序算法或手机GPU猜测。正在只读评估同band同RGBA矩形无损合并的控件减少潜力，不预加载转嫁等待、不换图、不调大帧预算。修复前9783与联合源80d27同一真实Lua/原生命令流程各通过：启动→选角/恩赐→合法首战→奖励仅一次且死亡busy结束后→选奖励卡→回图→返回标题→同Run续局→确认新开→退出回调仅一次。11场景×2556x1179/1920x1080双分辨率前后离线截图在.artifacts/mobile-1115-visual/flow-before-v4和flow-after-v4，导出副本补零尺寸及记录真实升层命令，不是官方/手机或平台退出成功。#663实际Full四类陈旧合同已定位，原入口暂停读回，d3783cd1仅修tests/CI新鲜绑定；正式入口+page2/2、死亡8/8、source/negative5/5通过，正独审；未重复Full或绕门禁。

d3783cd1前置CI合同修复已独审PASS并通过原入口重新授权#663，读回auto-merge-requested；不轮询。真实idle优化7b2b178b仅减少隐藏host的重复公开阶段，预算/图片数据不变，待独审；无损矩形合并严格证据零收益，不采用。primitive imageType清理7ff933a3待独审；真正gallery模式wire仍需官方另存样本，已备独立校准文件请Owner手动操作。iPhone14Pro型号现已确认，旧44画布单位约24pt，之前逻辑命中通过不能代表移动端44pt验收，继续补齐。

设备补充已进入实际修复：iPhone14Pro默认3x参考，旧44画布命中约24pt。e09a7c53/f4354c41 official触屏放大已有抬牌/三张选牌/奖励阅读态，页脚88hit与44底部留白，PC原姿态保留；真实generated字体/末页/手牌lane/奖励skip无重叠PASS，原GameUI8项/hand1/official交互1通过，static2215 PASS，独审中。默认两个独立Lua合同合并30秒超时在df2基线重复，分别保持原30秒后全3/3 PASS；未动原Lua断言。before触屏同局12场景×2分辨率离线截图已完成，after在跑。HUD独立修单行字号和实际88hit，不采用112高松散初稿。7b2 idle产品独审70项PASS，f4c来源闭合8owner待独审。严格imageType codec缺口仍保留，Owner明确不手动操作；不再安排用户校准，自行处理工具问题。

Owner提醒同一部iPhone14Pro在旧手机覆盖实验中用过，已实际找回并复用：TASK38/PR207/79244ee旧记录明确2556x1179、1280x720等比舞台、全范围锚点零增量背景，旧2268px中幅/两侧144px为历史用户报告非当前host测量；11月1 Owner已确认大块露空修好，不能重建旧缺陷或重复适配。旧资料未保存该手机实际GetUICanvasSize日志、OS安全区或原生字号pt，参考与实测继续分开。本轮原viewport-layout两项回归通过。已停GUI校准路线与只读宿主；从未focus/input/import。

卡牌阅读切片当前a718f1be：独审又抓到即时hover第9帧奖励scale先snap、rise尚未归零，卡牌下沿侵入skip hit2.33UI。已仅mobile令入场rise0、保留.88缩放入场及PC原28，不加等待；新增0..40逐帧subtitle/costDisc/skip回归通过，完整触屏同Run12场景×2分辨率新截图physical-after-v3已完成，精确head/tree/hash在physical-card-size-receipt.json，旧失败图和帧日志保留。最终独审继续，未交新包。HUD与1.72手牌跨分支probe确认真实hit lanes独立，但末牌边框/glow可能少量遮EndTurn视觉，仍按待联合/真机项如实记录，不继续大挪布局。

Owner询问能否试玩后，重新核前置#663依赖：d378的托管Quality43665762352已失败，完整作业清单唯一业务分片rules18/job132664887560为architecture-token-read原30s子进程ETIMEDOUT，其余回归分片成功；原入口已暂停读回d378。实际冷profile source proof导入28.2s+建历史夹具3.1s>30。522e035d仅3files7+/2-：对已经验证且冻结的证明record纯哈希校验WeakSet去重、冻结遍历早停；实时owner读取/授权结果不缓存。原用例保留30s全部PASS FSreads1/152/43，既有frozen/mutable/坏SHA/accessor/cycle/预热漂移4/4、CIcases2/2、fresh collector PASS。旧222 current和1332历史views/库存逐字节保持，新CI223仅增加runtime helper绑定；pr663-token-fix-receipt.json。独立复审待事件小片提交后进行，未再轮询CI或绕门禁。图片mode已改纯文件/代码编译兼容路线，真实全部1723意图(静态1637+双模板86)首轮通过，原strict比较器/负例不动，预算64/8ms每request检查，writer/readback/取消等仍补验，未交新包。

已按Owner最新早交要求交付整合预览playtest/latest.gil及交付/最新试玩-20261115/latest.gil：源码c3affc8e，build09f444c4-aef8-4c02-bd2c-4dad392e08b9，25680418bytes，SHA3aeb975428f9467530b70c62026dfde8c14db22b3b376920aea454eab0db55c1。369模块原生读回全部一致、static0错误430警告；旧包及manifest可恢复。严格审计本轮已跑，仅UI_MISMATCH，初定位24处flagBounds辅助元数据未被codec保存，几何与imageModes待独立核实，保持不通过状态；audio receipt遗漏imageModes，使用原sourceReceipt精确哈希链派生独立审计输入，原receipt/GIL未改。新候选未官方导入/ready/容量/手机实测。reading005+d95独审8paths及定向4profiles、5合法Act1事件容量、static2218PASS。#663独审发现frozen Proxy虚拟Git身份缓存反例，尚未推送/重新授权，继续修复。

整合预览c3严格审计独立复核完成：仅24个flagBounds非SDK辅助属性未保存；仅在内存诊断去这24字段后原nativeControlsEqual全树相等，三角形尺寸/旋转/填充/位置等其余字段保持；原audit FAIL不改。c3同局真实Lua离线完整流程及12场景×2556x1179/1920x1080共24PNG已保存preview-c3affc8e，非官方/手机实测。#663 Proxy边界修复12ef1a46已正常快进推送原功能分支，7安全及原30秒FS/CI2/collector提交后check通过，PR正文已更新；精确独立聚合审查待完成，自动合并仍暂停。图片收据正规补丁2e6d7660 RED3/GREEN20，独审在途；最终来源闭合从c3独立树进行，未改变交付包。

Owner本轮官方校验截图确认c3/build09f整合预览关卡容量20.45014、上限20，导入被阻塞；已归档原图official-capacity-c3affc8e-20.45014.png，预览交付不能视为可导入通过。Owner明确容量修复不得损害游玩体验，现暂停非必要来源整理，独立容量分支只做无损序列化：94e3c5ef五生成模块减少488574源bytes，真实Lua全表/标量/字符串bytes一致，原生UI/模板深比较相同，114相关测试98PASS/16环境skip/0fail。官方新容量待实际测量，绝不把源bytes换算为官方点。另独审发现fresh recycle cell模式未调度，b69c7b4b已修并独审通过，不改64/8ms或hide/排序语义，随新包整合。

已实际交付容量无损替换包playtest/mobile-capacity-7cbdbdda.gil，并同步latest及中文镜像：源码7cbdbddacfc9a9ef0eb1231c9f167057ea329396，buildce82718c-6e5c-4288-ad47-a1ec03ffe303，24979583B，SHA81204ef46c437761c65f8dec93e2af30e475ed057cb7cbad4c0903129d4a309b。五生成模块UTF8省488574+完整模式路径字典省212841源bytes；最终GIL实减700835bytes，不能换算官方容量。UTF8/字典/四行入口/freshcell已分别独审PASS，最终5模式回归PASS，369模块实际逐字节读回/静态0错误430警告；真实UI读回全树与旧c3相同，模板与mode proof通过。严格audit仍保留24个非SDK flagBounds metadata差异FAIL，未弱化比较器。新候选官方容量/导入/ready/手机未验收，旧官方20.45014阻塞原样保留。原PR663自动合并重新授权入口读回托管Full已失败或取消，仍未arm，已交只读查明确失败日志，不轮询或重触Full。

Owner已反馈本轮7cb无损替换包官方容量19.78MB、能传。记录为用户报告的新候选容量低于20/上传校验可通过；候选仍ce82718c、SHA81204ef46c437761c65f8dec93e2af30e475ed057cb7cbad4c0903129d4a309b，保持交付文件不再覆盖。未据此冒称实际上传完成、官方ready、手机流程或RC全负载通过。容量阻塞解除方式为无损编码，不缩图/字/卡牌/曲线、不删按钮状态或功能。剩余CI/helper闭包等源码收口继续独立，不动当前可传包。

Owner要求交接至新session；最新入口.codex-session-handoff.md。当前7cb包19.78MB能传保持不变；最后CI修复b2fb58c9在.worktrees/pr663-helper-copy已提交且本地定向通过，待独审/推送，PR663仍12ef暂停。专项未完成，不标Done；本session不再启动构建或覆盖包。

本轮接手已核#661 merged=e65d9b98，#663 open/head12ef且b2fb58c9待独审；#670发版后PC功能任务与本地TASK-109重号，需集成时去重保留双方。截图原件/hash：.artifacts/pc-closeout-1115/user-baseline/manifest.json。新的实机问题不得据旧回归PASS标Done。

b2fb58c9本轮独立聚合复审PASS（81路径、5直审/76精确blob复用），已正常推送PR663；原merge:auto入口因GitHub API EOF未成功授权，保持待授权，不声称已合或CI通过。完整矩阵.artifacts/pc-closeout-1115/COVERAGE.md。

PR663已精确推送b2fb58c9，原arm入口网络EOF后重试成功，state=auto-merge-requested，base=e65；证明.worktrees/pr663-helper-copy/build/delivery/auto-merge-663-b2fb58c9e05e.json。交GitHub原生队列，不等待或轮询CI。商店33055cf4、分裂2e6b5d97、加载dfada6fd已本地提交，独审/组合回归继续，非实机通过。

本轮5个已实施bugfix：商店压盖33055、分裂坐标2e6、模态重复准备dfada、退出说明ec564、取消提示a1de，独立review分别存本轮目录；组合生产冻结97ed740e，后续仅测试隔离82fc与Enum99f0。组合关键5/5及先前8项PASS，工程353模块/6201测量与架构/static无新增通过。原7cb hash保持；新候选尚在来源闭合，不宣称官方/PC整局/手机验收。

用户已进一步明确全部处理好再统一交包，并要求Windows完整路径；本轮不再交中间包。57201aa9候选已另存但非最终，旧7cb/latest保持。PR672当前实际失败：多个Hosted rules在测试前被Git pack 135018222~135018939>128MiB拒绝；Advisory真实game_ui_exit:88反馈busy时暂停冻结断言失败。分别由CI agent无损LFS迁移两新packet、battle agent核真实退出反馈语义，保留门槛/断言。PR672未授权自动合并，依赖663未合。

补核防御金线：当前card_view运行时明确不再绘制阈线，但原生成dragLayer/line仍以默认visible=true发布，存在未开始拖动时的过时子控件状态。独立修复仅构建初值visible=false，保留line几何锚点和规则；两profile生成RED→GREEN2/2、原响应3/取消5通过，待独审。当前PC鼠标快速甩牌/最终像素仍待真机，不用代码结论冒称实测。

2026-11-15最终产品冻结9b7794e944eb8dde1c5e9f9b2c1800dc5d653caf，干净独立树实际构建build e1d18bca-a2d9-4599-9786-3b831ac89bff；新包F:\New folder\playtest\pc-closeout-9b7794e9.gil，SHA256 cbf98fa7fe9362f3703388df057b00a36b3825307bdc5d9d087fece9092c8b27。293路径精确产品独审PASS；正式真实GIL严格读回369模块/UI25480一致、0issues、0error/426warnings，24个flagBounds缺陷已正式闭环；旧失败证据保留。证据.artifacts/pc-closeout-1115/review-candidate-9b7794e9-strict.json与visual-final-9b7794e9/index.html。用户最新明确自行导入，未让出键鼠窗口；官方容量/ready/PC/受影响手机继续未验，不勾AC、不发布。原7cb/latest哈希不变且19.78MB结论不迁移。PR672后续仅tests/source追加，与候选9b身份分开并须逐构建输入blob一致；源码兼容及原CI仍在收口。

最终PR672已正常推送1f7ce04c53189db8c39b59c797a45d57a2c7bac1/basee65，301/301路径独审PASS；后续仅17tests，7161非tests条目和644build inputs同9b候选。来源21/21/fresh5/5/成本6/6，原128MiB冷检出133670582B。Linux预测目标超12298ms如实保留，既有45/30min硬限/18+15分片/38jobs/timings未变（docs/CI已有Owner政策）。merge:auto因663未合HOLD；663当前检查成功且原生队列AWAITING_CHECKS，不重复arm/轮询。最终CI已触发交接QUEUED，不能视为PASS。完整矩阵与报告.artifacts/pc-closeout-1115/COVERAGE.md及FINAL-REPORT.md。用户自行导入9b新包，官方/设备仍未验，不Done。

新官方实机阻塞：Owner刚提供已交9b存档校验截图，容量20.1781>上限20。原图和SHA及用户关联候选记录.artifacts/pc-perf-1115/capacity/official-capacity-block.json，9b GIL哈希cbf98fa7...不变；strict0只证明内容一致，不证明官方容量。立即将无损减容升为本轮首要工作，不新建重复任务、不降低画质或删功能，7cb可传包保持。独立feat/runtime-performance-1115从最新develop隔离后FF当前1f；先合法identifier键短写/完整Lua键值与字符串byte等价，后续额外无损编码须独审和实际读回，官方复验前容量不记解决。

本轮停止交接：原7cb/latest未改。新包F:\New folder\playtest\pc-capacity-perf-be41ed0b.gil，SHA256 056612ebeace363a9b9e859122f7bdc85b8c990600aaf6b632813b9f8c594e6d；官方容量/ready/PC/手机未验证。PR663已合，672冲突及来源WIP未准入，发布仍阻塞。
<!-- SECTION:NOTES:END -->
