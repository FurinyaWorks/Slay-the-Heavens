# PC QA 2026-11-15：Release接续入口

唯一发版目标 release/v2.0.0，本轮修复树 feat/release-pc-closeout-1115 从远端36b9b157派生，已包含#663。#672与#676仍是来源PR，不能整条合入Release。

先读[38项真实台账](../../backlog-details/PC-QA-20261115.md)、[原始逐字稿](pc-20261115-verbatim.txt)和[截图索引](pc-20261115-image-manifest.json)。每项保留PC编号、时间码、唯一Release主任务、实现与验收缺口；总入口TASK-42。源码/Host通过不能代替正式设备验收。

#676六个拟议任务标题为undefined，103.6、42.1与先有身份冲突。本轮不导入这些文件、不新建重复任务；六个拟议任务29项及旧任务新增8项未勾AC通过Backlog CLI转录到Release既有任务，映射见台账末尾。#670的42.1为发版后快捷键/预输入，本地109为手机专项，不得错领。

图号只指同目录manifest。另一套本地12图manifest的SHA/图号不同，禁止交叉套用。私人Library原图未向本轮开放；仓库只有文本/索引，没有伪造PNG。需要像素验收时须由Owner安全转交或先遮盖UID/账户，并保留源SHA/脱敏关系。

旧9b包已有用户官方截图收据20.1781>20，容量FAIL；截图不自带buildId/SHA，候选关联来自用户陈述。本轮只核文本收据，未看该图。旧7cb的19.78MB不得移作新候选证据。

Release保护已在本轮远端读回：Ruleset27313515 active，匹配release/*、无bypass、禁止删除/强推、PR/Squash/linear、strict四项Actions检查。传统branch protection摘要off不代表Ruleset失效。Release本来强制Full；merge:auto目前只支持Develop，不能误用。

分裂位置、取消提示、商店压盖、金线初值、药水材质、睡眠标签、目标四角均已选择性移植并取得Release定向回归结果。加载和稀疏甩牌继续本轮收口，精确提交、独审及最终结果以台账/各切片证据/本轮PR为准。独审发现的反例必须修复再审。

PC13末击/死亡/奖励可见时序、PC18语义图标正式映射/容量、PC20多任务卡顿或进程崩溃归因仍是实质缺口；其余P1不得从表中消失。基础动画反馈仍待核，装饰美术、新快捷键/预输入按发版后规划。

最终仍需同一source SHA/buildId/GIL SHA256/payloadDigest的官方导入、真实ready、PC两幕、受影响手机路径、官方容量/负载验收。没有本轮窗口授权不占键鼠。未验不标Done、不修改master/Tag、不执行正式发布。

自动化合并边界：本轮源码核实verify:delivery的targetHead也只接受develop/master，不能传假base宣称Release预审已过。Release继续依实际Ruleset、精确HEAD独审与原生Full检查办理受保护PR；本轮不调用Develop专用merge:auto，不绕过门禁。
