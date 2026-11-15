# #679 物理输入合同接续（测试专用）

精确基线 f564aea6a3c517b71a85534a81be5e2e36278baf。只修两处旧fixture交互协议；生产、门槛、来源包与原业务断言不动。

## 原失败与原因

Quality43758225514：Rules3 job132948608606 的 potion_popup_readability.lua:25；POSIX11 job132948608438 的 official three-bottle HUD（command line94）。两份原Hosted日志均已读取，没有把未执行的重跑当作RED。

现生产popup click在act结果为false时也执行pointerConsumed；关闭弹窗同样消费该序列并建立suppressClick，防止尾事件穿透。fresh物理Down通过既有pointerDown/reclaim恢复新输入。旧readability在dismiss后直接openPotionMenu绕过Down；旧official metadata在失败Use后第二次裸Click同样没有新Down。拒绝符合现有防穿透协议，不是需要放宽的生产guard。

## 最小调整

- Potion Belt的5个物理槽：取实际控件并派发Down/Up/Click，再断言当前菜单确为该slot及原popup边界。4/5槽在potionHelp内；初次直接H.tap查找4/5得到nil，属测试适配误差，已修为实际嵌套路径，未改共享helper。
- 官方metadata：第一次无效Use及其fresh core查询/无消耗断言保持；恢复核心block后第二次Use用新touch4的Down/Up/Click。原后续selected-slot、block12、库存消耗、RNG、未知ID占槽、pendingChoice拖动拒绝全保留。
- 不直接清suppressClick、不开旁路、不改canUse或门槛、不删除断言。

## 验证

Node v24.22.1；原readability入口1/1、0 skipped，13.98秒；official三瓶命名单入口1/1、0 skipped，14.08秒，内部officialAssets与default两profile原断言均执行。official所需两PNG由LFS原件按既有SHA256补齐，没有占位素材。

本次没有整套Full。两测试均改变当前输入，Source/CI合同还须现有负责人按实际Release接续；没有修改其分支、旧包或116-owner合同，不能声明当前整个PR/Release准入。没有官方ready/实机/手机/容量或任务AC完成。

最终源码独评PASS：nested-slot版readability SHA256 084fdcea13db70a309f19d6e021c9a9caa6d82db0602eac7e7fdd3bf47a02133；official-runtime 5dcd518cd08f6b8ca3ef47e94f61891285c6d8ffdd06dc7ddef71c42bb3fe341。独评核对生产屏障协议、实际控件层级与原业务断言保留，未重复作者正向测试，不冒认独立执行。初次H.tap版本审查不作为最终提交准入。
