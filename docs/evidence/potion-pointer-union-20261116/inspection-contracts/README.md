# Shared pointer 合同完整对账与 14 项恢复

前驱远端 `80921cad5e545ce58b43a2fd8596a930fce71d51`，本地等树 `2d64949ffe80ad11c83321af0e2440ebbc54339c`，tree `d2a6088c861e568560f2d3e263e592f9b6a3cd73`。范围仍是 #679 eabff9b × #711 ad6fe84 原双父准备，不是当前 Release 验收。

## 对账结论

`git diff 33d71575 ad6fe84 -- tests`（排除 helper/fixture）实际仅 6 个文件：calibration、integrated cases、两 Lua support、mobile release、selection-map test。`shared-audit.json` 保存 ad6 对前阶段每个共享测试的全部测试名，`all-tests-diff.gz` 保留完整差异（含 helper）。

- 两 Lua support 和 mobile 原 7+26+2 行为已于前阶段恢复；calibration 两个 pointer inventory 原断言前阶段已恢复。
- integrated 原 3 个测试名全部仍在现有 19 中；其读域已采用完整 union 验证，不能用 pointer 整文件覆盖药水链。
- selection-map 原 22 与现有 7 的名称差不能直接算成 21 缺项：其中 6 是既有 `legacy landed697` 明确改名，另 1 原名保留。真正新增缺项为 **15**：inspection 4、battle pointer 6、sparse 5。
- 当前与 ad6 还有 defect-final、encounter、integration、official-assets、session-menu、sts-style 及药水 Lua 的差异。这些文件在 `33d71575→ad6` 没有 pointer 改动，属于药水侧保留/新增，不应反向覆盖。encounter 116→117 owner、calibration raw Full 名称变化均不等于遗漏 pointer 用例。

本轮一次恢复上述 **14/15**，剩余原 inspection 第四项 **BLOCKED**，并非全部完成。

## 实现与读域

保留原 selection 7 用例及其文件前缀逐字不变。新增 14 个原 pointer 用例在当前 union 完整认证后使用明确 pointer 父视图。同步阶段由既有 `withPotionPointerCiUnionValidation` 捕获授权；回调返回 Promise 时 scope 不跨 await 延续，active 立即清除，后续读取改走鲜读 public pointer reader。冻结 checkpoint 必先读取经认证输入，再选择其固定历史 before；没有直接绕过读域。

原 14 断言体中 10 个逐字不变；2 个隔离 product-copy 检查保留 pointer 证明（copied.pointerBeforePotionEpoch），另加 copied.sourceEpoch 等于当前 union 的证明；2 个 data URL 坏包测试仅将静态相对 import 转绝对 URL，原包摘要错误断言不变。产品 copier 始终复制真实 union，不伪造 pointer-only 当前树。未新增通用框架或修改集成 API。

当前身份仍 **201** 项；只更新 selection consumer、copier pin、manifest 三行，所有旧父域和源全文保留。新 before-contracts 档精确保留前阶段 packet。helper copy 258→259，仅增加该历史档，仍需显式产品/测试夹具。

## 实跑结果（不合并冒充单次全套）

- 原 inspection 前三例：3/3 PASS，5,763.481024 ms（定位阶段）。
- 完整 14 新例：**14/14 PASS，56,785.991823 ms**，`contracts-v3.log`。之后未改这 14 的 body/adapter，仅移出第四诊断注册并重绑当前身份。
- 最终绑定上的原 selection 7：**7/7 PASS，6,169.013727 ms**，`legacy-final.log`。
- 最终绑定复制控制：**33/33 PASS**，真实隔离目录 259 helper + 379 显式夹具，201 当前认证、pointer validators、copy-from-copy、篡改及路径安全控制保留。
- 本轮精确输入/回滚负控：**19 控制 PASS**；生成器确定性及 diff-check 通过。
- 独审 `review-body`：旧 7 前缀、14 body 精确差异、201 行及所有父视图/source 完整；`review-wrapper`：从实际源码提取 wrapper，跨 await 后外来源可见、当前/历史转换读取遇真实 owner 漂移拒绝、恢复通过。SHA 绑定见 `review-sha256.json`。

首 15 运行仅得到文件级失败（69.97s），没有可用子例结论，不算 15 项结果；source-v2 在定位读域时主动终止，退出 130。随后恢复原 checkpoint fixture 语义且保留每次认证读取，生产两例与完整 14 均通过。上述诊断日志均保留，不将首轮说成全绿。未跑 Full、calibration 80 或 integrated 19 全套。

## 唯一剩余原合同：inspection 第四项 BLOCKED

原名：`inspection guards direct old text and binary projections through reused readers`。

`fourth-original.txt` 和 body 文件完整保留原 ad6 断言，没有删断言或 skip 后冒充通过。当前原调用把 pointer 历史文本/read 传入仅接受 union-current 的 integrated API，实际 native 源投影不一致（`old-integrated-contract.log`）。

尝试显式 current-union 后继合同，保留文本/二进制、owner/归档漂移、复用 reader 和恢复、foreign 检查：
1. 原 selection helper 路径在当前 potion 链是恒等源，不再满足原 pointer 前置链的转换断言（v1）。
2. 诊断保留该路径的精确恒等及 foreign 检查，并用确有历史 native 视图的 closeout helper维持转换负控后，又在 raw inventory 失败（v2）。当前 legacy `releaseSelectionMapPriorInventory` 只接受冻结 inventory，真实 union 多药水项；实现仅验证 added-source，并不提供原 ad6 所要求的 inspection 全 owner 授权。不能改错误标签、换 API 或删 owner 注入断言掩盖差异。

此诊断未列入常规测试，没有保留红注册或 skip。`reproduce-fourth.mjs original|union` 可在最终树只读重现两种断言失败，只有 `ERR_ASSERTION` 才记 EXPECTED BLOCKED；不是 passing contract。原诊断源码和失败原日志全部保留。后续应由集成接口负责人判断是否真的需要 pointer 专属早返回链/库存授权合同，不为历史测试强添产品无用接口。

两个旧 LFS materialization 不提交；无产品代码、原 PR、Backlog 修改，无官方客户端/ready/手机证明，不表示可发版。
